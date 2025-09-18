import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const results = await sql`
      SELECT o.*, 
             oi.id as item_id, oi.quantity, oi.unit_price, oi.total_price,
             p.id as product_id, p.name as product_name, p.images as product_images,
             pv.id as variation_id, pv.name as variation_name, pv.unit as variation_unit
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variations pv ON oi.variation_id = pv.id
      WHERE o.id = ${id}
      ORDER BY oi.id ASC
    `;
    
    if (results.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    const order = {
      id: results[0].id,
      status: results[0].status,
      total_amount: parseFloat(results[0].total_amount),
      delivery_fee: parseFloat(results[0].delivery_fee),
      discount_amount: parseFloat(results[0].discount_amount),
      payment_method: results[0].payment_method,
      payment_status: results[0].payment_status,
      delivery_address: results[0].delivery_address,
      delivery_instructions: results[0].delivery_instructions,
      estimated_delivery: results[0].estimated_delivery,
      delivered_at: results[0].delivered_at,
      created_at: results[0].created_at,
      updated_at: results[0].updated_at,
      items: results
        .filter(row => row.item_id)
        .map(row => ({
          id: row.item_id,
          quantity: row.quantity,
          unit_price: parseFloat(row.unit_price),
          total_price: parseFloat(row.total_price),
          product: {
            id: row.product_id,
            name: row.product_name,
            images: row.product_images
          },
          variation: row.variation_id ? {
            id: row.variation_id,
            name: row.variation_name,
            unit: row.variation_unit
          } : null
        }))
    };
    
    return Response.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch order' 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;
    
    const allowedFields = [
      'status', 'payment_status', 'delivery_address', 'delivery_instructions',
      'estimated_delivery', 'delivered_at'
    ];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(body[field]);
      }
    });
    
    if (updateFields.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'No valid fields to update' 
      }, { status: 400 });
    }
    
    // Special handling for delivered status
    if (body.status === 'delivered' && !body.delivered_at) {
      paramCount++;
      updateFields.push(`delivered_at = $${paramCount}`);
      updateValues.push(new Date().toISOString());
    }
    
    paramCount++;
    updateValues.push(id);
    
    const query = `
      UPDATE orders 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await sql(query, updateValues);
    
    if (result.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    return Response.json({ 
      success: true, 
      data: result[0] 
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update order' 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Only allow cancellation of pending/confirmed orders
    const order = await sql`
      SELECT status FROM orders WHERE id = ${id}
    `;
    
    if (order.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    if (!['pending', 'confirmed'].includes(order[0].status)) {
      return Response.json({ 
        success: false, 
        error: 'Cannot cancel this order' 
      }, { status: 400 });
    }
    
    const result = await sql`
      UPDATE orders 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    return Response.json({ 
      success: true, 
      data: result[0] 
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to cancel order' 
    }, { status: 500 });
  }
}