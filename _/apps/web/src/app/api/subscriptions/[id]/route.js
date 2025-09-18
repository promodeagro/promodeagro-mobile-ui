import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const results = await sql`
      SELECT so.*, 
             si.id as item_id, si.quantity, si.product_id, si.variation_id,
             p.name as product_name, p.images as product_images,
             pv.name as variation_name, pv.unit as variation_unit, pv.price
      FROM subscription_orders so
      LEFT JOIN subscription_items si ON so.id = si.subscription_id
      LEFT JOIN products p ON si.product_id = p.id
      LEFT JOIN product_variations pv ON si.variation_id = pv.id
      WHERE so.id = ${id}
      ORDER BY si.id ASC
    `;

    if (results.length === 0) {
      return Response.json({
        success: false,
        error: 'Subscription not found'
      }, { status: 404 });
    }

    const subscription = {
      id: results[0].id,
      frequency: results[0].frequency,
      next_delivery_date: results[0].next_delivery_date,
      is_active: results[0].is_active,
      subscription_name: results[0].subscription_name,
      delivery_instructions: results[0].delivery_instructions,
      skip_next_delivery: results[0].skip_next_delivery,
      pause_until: results[0].pause_until,
      total_amount: parseFloat(results[0].total_amount || 0),
      created_at: results[0].created_at,
      updated_at: results[0].updated_at,
      items: results
        .filter(row => row.item_id)
        .map(row => ({
          id: row.item_id,
          quantity: row.quantity,
          product: {
            id: row.product_id,
            name: row.product_name,
            images: row.product_images,
          },
          variation: row.variation_id ? {
            id: row.variation_id,
            name: row.variation_name,
            unit: row.variation_unit,
            price: parseFloat(row.price),
          } : null,
        }))
    };

    return Response.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch subscription'
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
      'frequency', 'subscription_name', 'delivery_instructions',
      'next_delivery_date', 'is_active', 'skip_next_delivery', 'pause_until'
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

    paramCount++;
    updateValues.push(id);

    const query = `
      UPDATE subscription_orders 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, updateValues);

    if (result.length === 0) {
      return Response.json({
        success: false,
        error: 'Subscription not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: result[0],
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return Response.json({
      success: false,
      error: 'Failed to update subscription'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await sql.transaction(async (txn) => {
      // Delete subscription items first
      await txn`DELETE FROM subscription_items WHERE subscription_id = ${id}`;

      // Delete subscription
      const [subscription] = await txn`
        DELETE FROM subscription_orders 
        WHERE id = ${id}
        RETURNING *
      `;

      return subscription;
    });

    if (!result) {
      return Response.json({
        success: false,
        error: 'Subscription not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: result,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return Response.json({
      success: false,
      error: 'Failed to cancel subscription'
    }, { status: 500 });
  }
}