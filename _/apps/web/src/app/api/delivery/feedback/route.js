import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { 
      order_id,
      delivery_partner_id,
      delivery_rating,
      delivery_feedback,
      packaging_rating,
      timeliness_rating,
      overall_rating
    } = await request.json();

    if (!order_id || !overall_rating) {
      return Response.json({
        success: false,
        error: 'Order ID and overall rating are required'
      }, { status: 400 });
    }

    // Verify order belongs to user
    const [order] = await sql`
      SELECT id, delivery_partner_id, status 
      FROM orders 
      WHERE id = ${order_id} AND user_id = ${userId}
    `;

    if (!order) {
      return Response.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    if (order.status !== 'delivered') {
      return Response.json({
        success: false,
        error: 'Feedback can only be submitted for delivered orders'
      }, { status: 400 });
    }

    const result = await sql.transaction(async (txn) => {
      // Check if feedback already exists
      const [existingFeedback] = await txn`
        SELECT id FROM delivery_feedback 
        WHERE order_id = ${order_id} AND user_id = ${userId}
      `;

      if (existingFeedback) {
        // Update existing feedback
        const [updatedFeedback] = await txn`
          UPDATE delivery_feedback 
          SET 
            delivery_rating = ${delivery_rating},
            delivery_feedback = ${delivery_feedback},
            packaging_rating = ${packaging_rating},
            timeliness_rating = ${timeliness_rating},
            overall_rating = ${overall_rating},
            created_at = CURRENT_TIMESTAMP
          WHERE id = ${existingFeedback.id}
          RETURNING *
        `;
        return { feedback: updatedFeedback, isUpdate: true };
      } else {
        // Create new feedback
        const [newFeedback] = await txn`
          INSERT INTO delivery_feedback (
            order_id, user_id, delivery_partner_id,
            delivery_rating, delivery_feedback, packaging_rating,
            timeliness_rating, overall_rating
          )
          VALUES (
            ${order_id}, ${userId}, ${order.delivery_partner_id || delivery_partner_id},
            ${delivery_rating}, ${delivery_feedback}, ${packaging_rating},
            ${timeliness_rating}, ${overall_rating}
          )
          RETURNING *
        `;

        // Update delivery partner's average rating if they exist
        if (order.delivery_partner_id || delivery_partner_id) {
          const partnerId = order.delivery_partner_id || delivery_partner_id;
          
          const [ratingStats] = await txn`
            SELECT 
              AVG(overall_rating) as avg_rating,
              COUNT(*) as total_ratings
            FROM delivery_feedback 
            WHERE delivery_partner_id = ${partnerId}
          `;

          await txn`
            UPDATE delivery_partners 
            SET 
              rating = ${parseFloat(ratingStats.avg_rating).toFixed(2)},
              total_deliveries = ${ratingStats.total_ratings}
            WHERE id = ${partnerId}
          `;
        }

        return { feedback: newFeedback, isUpdate: false };
      }
    });

    return Response.json({
      success: true,
      message: result.isUpdate ? 
        'Delivery feedback updated successfully' : 
        'Delivery feedback submitted successfully',
      data: result.feedback
    });

  } catch (error) {
    console.error('Error submitting delivery feedback:', error);
    return Response.json({
      success: false,
      error: 'Failed to submit delivery feedback'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (orderId) {
      // Get feedback for specific order
      const [feedback] = await sql`
        SELECT df.*, dp.name as delivery_partner_name
        FROM delivery_feedback df
        LEFT JOIN delivery_partners dp ON df.delivery_partner_id = dp.id
        WHERE df.order_id = ${orderId} AND df.user_id = ${userId}
      `;

      return Response.json({
        success: true,
        data: feedback || null
      });
    } else {
      // Get all feedback by user
      const feedbacks = await sql`
        SELECT df.*, dp.name as delivery_partner_name, o.id as order_number
        FROM delivery_feedback df
        LEFT JOIN delivery_partners dp ON df.delivery_partner_id = dp.id
        LEFT JOIN orders o ON df.order_id = o.id
        WHERE df.user_id = ${userId}
        ORDER BY df.created_at DESC
      `;

      return Response.json({
        success: true,
        data: feedbacks
      });
    }

  } catch (error) {
    console.error('Error fetching delivery feedback:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch delivery feedback'
    }, { status: 500 });
  }
}