import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return Response.json({
        success: false,
        error: "User ID is required",
      }, { status: 400 });
    }

    let query = `
      SELECT * FROM scheduled_orders 
      WHERE user_id = $1
    `;
    let values = [userId];

    if (status) {
      query += ` AND status = $2`;
      values.push(status);
    }

    query += ` ORDER BY scheduled_for ASC`;

    const scheduledOrders = await sql(query, values);

    return Response.json({
      success: true,
      data: scheduledOrders,
    });

  } catch (error) {
    console.error("Error fetching scheduled orders:", error);
    return Response.json({
      success: false,
      error: "Failed to fetch scheduled orders",
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      scheduledFor,
      cartItems,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod
    } = body;

    if (!userId || !scheduledFor || !cartItems || !deliveryAddress) {
      return Response.json({
        success: false,
        error: "userId, scheduledFor, cartItems, and deliveryAddress are required",
      }, { status: 400 });
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return Response.json({
        success: false,
        error: "Scheduled time must be in the future",
      }, { status: 400 });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of cartItems) {
      const [productData] = await sql`
        SELECT p.price as product_price, pv.price as variation_price
        FROM products p
        LEFT JOIN product_variations pv ON pv.id = ${item.variation_id}
        WHERE p.id = ${item.product_id}
      `;

      const price = productData.variation_price || productData.product_price;
      totalAmount += price * item.quantity;
    }

    // Add delivery fee if applicable (free delivery over ₹200)
    const deliveryFee = totalAmount > 200 ? 0 : 30;
    totalAmount += deliveryFee;

    const [scheduledOrder] = await sql`
      INSERT INTO scheduled_orders (
        user_id, scheduled_for, cart_items, delivery_address,
        delivery_instructions, payment_method, total_amount, status
      )
      VALUES (
        ${userId}, ${scheduledFor}, ${JSON.stringify(cartItems)}, ${deliveryAddress},
        ${deliveryInstructions}, ${paymentMethod || 'cod'}, ${totalAmount}, 'scheduled'
      )
      RETURNING *
    `;

    return Response.json({
      success: true,
      data: scheduledOrder,
      message: "Order scheduled successfully",
    });

  } catch (error) {
    console.error("Error creating scheduled order:", error);
    return Response.json({
      success: false,
      error: "Failed to schedule order",
    }, { status: 500 });
  }
}