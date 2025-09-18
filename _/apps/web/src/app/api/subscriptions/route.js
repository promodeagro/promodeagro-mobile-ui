import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({
        success: false,
        error: "User ID is required",
      }, { status: 400 });
    }

    const subscriptions = await sql`
      SELECT so.*, 
             si.id as item_id, si.quantity, si.product_id, si.variation_id,
             p.name as product_name, p.images as product_images,
             pv.name as variation_name, pv.unit as variation_unit, pv.price
      FROM subscription_orders so
      LEFT JOIN subscription_items si ON so.id = si.subscription_id
      LEFT JOIN products p ON si.product_id = p.id
      LEFT JOIN product_variations pv ON si.variation_id = pv.id
      WHERE so.user_id = ${userId}
      ORDER BY so.created_at DESC
    `;

    // Group items by subscription
    const subscriptionsMap = new Map();

    subscriptions.forEach((row) => {
      if (!subscriptionsMap.has(row.id)) {
        subscriptionsMap.set(row.id, {
          id: row.id,
          frequency: row.frequency,
          next_delivery_date: row.next_delivery_date,
          is_active: row.is_active,
          subscription_name: row.subscription_name,
          delivery_instructions: row.delivery_instructions,
          skip_next_delivery: row.skip_next_delivery,
          pause_until: row.pause_until,
          total_amount: parseFloat(row.total_amount || 0),
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: [],
        });
      }

      if (row.item_id) {
        subscriptionsMap.get(row.id).items.push({
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
        });
      }
    });

    const result = Array.from(subscriptionsMap.values());

    return Response.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return Response.json({
      success: false,
      error: "Failed to fetch subscriptions",
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      frequency,
      subscriptionName,
      items,
      deliveryInstructions,
      nextDeliveryDate
    } = body;

    if (!userId || !frequency || !items || items.length === 0) {
      return Response.json({
        success: false,
        error: "userId, frequency, and items are required",
      }, { status: 400 });
    }

    const result = await sql.transaction(async (txn) => {
      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        const [productData] = await txn`
          SELECT p.price as product_price, pv.price as variation_price
          FROM products p
          LEFT JOIN product_variations pv ON pv.id = ${item.variation_id}
          WHERE p.id = ${item.product_id}
        `;

        const price = productData.variation_price || productData.product_price;
        totalAmount += price * item.quantity;
      }

      // Create subscription
      const [subscription] = await txn`
        INSERT INTO subscription_orders (
          user_id, frequency, subscription_name, delivery_instructions,
          next_delivery_date, total_amount, is_active
        )
        VALUES (
          ${userId}, ${frequency}, ${subscriptionName}, ${deliveryInstructions},
          ${nextDeliveryDate}, ${totalAmount}, true
        )
        RETURNING *
      `;

      // Add subscription items
      for (const item of items) {
        await txn`
          INSERT INTO subscription_items (
            subscription_id, product_id, variation_id, quantity
          )
          VALUES (
            ${subscription.id}, ${item.product_id}, ${item.variation_id}, ${item.quantity}
          )
        `;
      }

      return subscription;
    });

    return Response.json({
      success: true,
      data: result,
      message: "Subscription created successfully",
    });

  } catch (error) {
    console.error("Error creating subscription:", error);
    return Response.json({
      success: false,
      error: "Failed to create subscription",
    }, { status: 500 });
  }
}