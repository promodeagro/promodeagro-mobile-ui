import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { items, reason, deliveryAddress, deliveryInstructions } = body;

    // Check if order can be modified (only pending/confirmed orders)
    const [order] = await sql`
      SELECT status, user_id FROM orders WHERE id = ${id}
    `;

    if (!order) {
      return Response.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return Response.json({ 
        success: false, 
        error: 'Order cannot be modified at this stage' 
      }, { status: 400 });
    }

    const result = await sql.transaction(async (txn) => {
      // Store the modification request
      const [modification] = await txn`
        INSERT INTO order_modifications (
          order_id, modification_type, new_value, reason, status
        )
        VALUES (
          ${id}, 'items_update', ${JSON.stringify({ items, deliveryAddress, deliveryInstructions })}, 
          ${reason}, 'pending'
        )
        RETURNING *
      `;

      // If items are being modified, calculate new total
      if (items && items.length > 0) {
        let newTotal = 0;
        const updatedItems = [];

        for (const item of items) {
          // Get product/variation price
          const [productData] = await txn`
            SELECT p.price as product_price, pv.price as variation_price
            FROM products p
            LEFT JOIN product_variations pv ON pv.id = ${item.variation_id}
            WHERE p.id = ${item.product_id}
          `;

          const unitPrice = productData.variation_price || productData.product_price;
          const totalPrice = unitPrice * item.quantity;
          newTotal += totalPrice;

          updatedItems.push({
            ...item,
            unit_price: unitPrice,
            total_price: totalPrice
          });
        }

        // Update order total (keeping original delivery fee and discounts)
        const [currentOrder] = await txn`
          SELECT delivery_fee, discount_amount FROM orders WHERE id = ${id}
        `;

        const finalTotal = newTotal + parseFloat(currentOrder.delivery_fee) - parseFloat(currentOrder.discount_amount);

        await txn`
          UPDATE orders 
          SET total_amount = ${finalTotal}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;

        // Update order items
        await txn`DELETE FROM order_items WHERE order_id = ${id}`;
        
        for (const item of updatedItems) {
          await txn`
            INSERT INTO order_items (
              order_id, product_id, variation_id, quantity, unit_price, total_price
            )
            VALUES (
              ${id}, ${item.product_id}, ${item.variation_id}, 
              ${item.quantity}, ${item.unit_price}, ${item.total_price}
            )
          `;
        }
      }

      // Update delivery address and instructions if provided
      if (deliveryAddress || deliveryInstructions) {
        await txn`
          UPDATE orders 
          SET 
            delivery_address = COALESCE(${deliveryAddress}, delivery_address),
            delivery_instructions = COALESCE(${deliveryInstructions}, delivery_instructions),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }

      // Mark modification as processed
      await txn`
        UPDATE order_modifications 
        SET status = 'approved', processed_at = CURRENT_TIMESTAMP
        WHERE id = ${modification.id}
      `;

      return modification;
    });

    return Response.json({
      success: true,
      data: result,
      message: 'Order modified successfully'
    });

  } catch (error) {
    console.error('Error modifying order:', error);
    return Response.json({
      success: false,
      error: 'Failed to modify order'
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const modifications = await sql`
      SELECT * FROM order_modifications 
      WHERE order_id = ${id}
      ORDER BY created_at DESC
    `;

    return Response.json({
      success: true,
      data: modifications
    });

  } catch (error) {
    console.error('Error fetching order modifications:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch modifications'
    }, { status: 500 });
  }
}