import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { reason, cancellationType = 'customer' } = body;

    // Check if order can be cancelled
    const [order] = await sql`
      SELECT status, total_amount, payment_status, user_id FROM orders WHERE id = ${id}
    `;

    if (!order) {
      return Response.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }

    if (!['pending', 'confirmed', 'preparing'].includes(order.status)) {
      return Response.json({ 
        success: false, 
        error: 'Order cannot be cancelled at this stage' 
      }, { status: 400 });
    }

    const result = await sql.transaction(async (txn) => {
      // Calculate refund amount based on order status and cancellation type
      let refundAmount = 0;
      let refundStatus = 'not_applicable';

      if (order.payment_status === 'completed' || order.payment_status === 'paid') {
        if (order.status === 'pending' || order.status === 'confirmed') {
          // Full refund for early cancellation
          refundAmount = parseFloat(order.total_amount);
          refundStatus = 'pending';
        } else if (order.status === 'preparing') {
          // Partial refund for preparation stage cancellation
          if (cancellationType === 'customer') {
            // Customer cancellation during prep - 80% refund
            refundAmount = parseFloat(order.total_amount) * 0.8;
          } else {
            // Store/system cancellation - full refund
            refundAmount = parseFloat(order.total_amount);
          }
          refundStatus = 'pending';
        }
      }

      // Create cancellation record
      const [cancellation] = await txn`
        INSERT INTO order_cancellations (
          order_id, reason, cancellation_type, refund_amount, refund_status
        )
        VALUES (
          ${id}, ${reason}, ${cancellationType}, ${refundAmount}, ${refundStatus}
        )
        RETURNING *
      `;

      // Update order status
      await txn`
        UPDATE orders 
        SET 
          status = 'cancelled',
          cancelled_at = CURRENT_TIMESTAMP,
          cancellation_reason = ${reason},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;

      // Add order tracking entry
      await txn`
        INSERT INTO order_tracking (order_id, status, notes)
        VALUES (${id}, 'cancelled', ${`Order cancelled: ${reason}`})
      `;

      // If there's a refund amount, create notification
      if (refundAmount > 0) {
        await txn`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (
            ${order.user_id}, 
            'Refund Processing', 
            ${`Your refund of ₹${refundAmount} is being processed for cancelled order #${id}`},
            'refund'
          )
        `;
      }

      return { cancellation, refundAmount };
    });

    return Response.json({
      success: true,
      data: result,
      message: result.refundAmount > 0 
        ? `Order cancelled successfully. Refund of ₹${result.refundAmount} will be processed within 3-5 business days.`
        : 'Order cancelled successfully.'
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return Response.json({
      success: false,
      error: 'Failed to cancel order'
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [cancellation] = await sql`
      SELECT * FROM order_cancellations 
      WHERE order_id = ${id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return Response.json({
      success: true,
      data: cancellation
    });

  } catch (error) {
    console.error('Error fetching cancellation details:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch cancellation details'
    }, { status: 500 });
  }
}