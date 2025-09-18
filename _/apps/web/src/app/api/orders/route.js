import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      );
    }

    let query = `
      SELECT o.*, 
             oi.id as item_id, oi.quantity, oi.unit_price, oi.total_price,
             p.name as product_name, p.images as product_images,
             pv.name as variation_name, pv.unit as variation_unit
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variations pv ON oi.variation_id = pv.id
      WHERE o.user_id = $1
    `;

    let values = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY o.created_at DESC`;

    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(parseInt(limit));
    }

    if (offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(parseInt(offset));
    }

    const results = await sql(query, values);

    // Group items by order
    const ordersMap = new Map();

    results.forEach((row) => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          status: row.status,
          total_amount: parseFloat(row.total_amount),
          delivery_fee: parseFloat(row.delivery_fee),
          discount_amount: parseFloat(row.discount_amount),
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          delivery_address: row.delivery_address,
          delivery_instructions: row.delivery_instructions,
          estimated_delivery: row.estimated_delivery,
          delivered_at: row.delivered_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: [],
        });
      }

      if (row.item_id) {
        ordersMap.get(row.id).items.push({
          id: row.item_id,
          quantity: row.quantity,
          unit_price: parseFloat(row.unit_price),
          total_price: parseFloat(row.total_price),
          product: {
            name: row.product_name,
            images: row.product_images,
          },
          variation: row.variation_name
            ? {
                name: row.variation_name,
                unit: row.variation_unit,
              }
            : null,
        });
      }
    });

    const orders = Array.from(ordersMap.values());

    return Response.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      addressId,
      paymentMethod,
      deliverySlotId,
      deliveryInstructions,
      couponId,
    } = body;

    if (!userId || !addressId || !deliverySlotId) {
      return Response.json(
        {
          success: false,
          error: "userId, addressId, and deliverySlotId are required",
        },
        { status: 400 },
      );
    }

    const result = await sql.transaction(async (txn) => {
      // Get cart items
      const cartItems = await txn`
        SELECT ci.*, p.price as product_price, pv.price as variation_price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_variations pv ON ci.variation_id = pv.id
        WHERE ci.user_id = ${userId}
      `;

      if (cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Get delivery address
      const [address] = await txn`
        SELECT * FROM user_addresses 
        WHERE id = ${addressId} AND user_id = ${userId}
      `;

      if (!address) {
        throw new Error("Invalid delivery address");
      }

      // Get delivery slot
      const [deliverySlot] = await txn`
        SELECT * FROM delivery_slots 
        WHERE id = ${deliverySlotId} AND is_available = true
        AND current_orders < max_orders
      `;

      if (!deliverySlot) {
        throw new Error("Selected delivery slot is not available");
      }

      // Calculate totals
      let subtotal = 0;
      for (const item of cartItems) {
        const price = item.variation_price || item.product_price;
        subtotal += price * item.quantity;
      }

      const deliveryFee = subtotal > 200 ? 0 : 30;
      let discountAmount = 0;
      let coupon = null;

      // Apply coupon if provided
      if (couponId) {
        const [couponData] = await txn`
          SELECT * FROM coupons WHERE id = ${couponId} AND is_active = true
        `;

        if (couponData) {
          coupon = couponData;
          if (coupon.discount_type === "percentage") {
            discountAmount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount) {
              discountAmount = Math.min(
                discountAmount,
                coupon.max_discount_amount,
              );
            }
          } else {
            discountAmount = Math.min(coupon.discount_value, subtotal);
          }
        }
      }

      const totalAmount = subtotal + deliveryFee - discountAmount;

      // Create formatted delivery address
      const deliveryAddress = `${address.name}\n${address.address_line1}${address.address_line2 ? "\n" + address.address_line2 : ""}\n${address.city}, ${address.state} ${address.postal_code}`;

      // Estimate delivery time based on slot
      const estimatedDelivery = new Date(
        `${deliverySlot.slot_date} ${deliverySlot.end_time}`,
      );

      // Create order
      const [order] = await txn`
        INSERT INTO orders (
          user_id, total_amount, delivery_fee, discount_amount,
          payment_method, delivery_address, delivery_instructions,
          estimated_delivery, coupon_id, status
        )
        VALUES (
          ${userId}, ${totalAmount}, ${deliveryFee}, ${discountAmount},
          ${paymentMethod || "cod"}, ${deliveryAddress}, ${deliveryInstructions},
          ${estimatedDelivery}, ${couponId}, 'confirmed'
        )
        RETURNING *
      `;

      // Add order items
      for (const item of cartItems) {
        const unitPrice = item.variation_price || item.product_price;
        const totalPrice = unitPrice * item.quantity;

        await txn`
          INSERT INTO order_items (
            order_id, product_id, variation_id, quantity, unit_price, total_price
          )
          VALUES (
            ${order.id}, ${item.product_id}, ${item.variation_id}, 
            ${item.quantity}, ${unitPrice}, ${totalPrice}
          )
        `;
      }

      // Update delivery slot current orders
      await txn`
        UPDATE delivery_slots 
        SET current_orders = current_orders + 1 
        WHERE id = ${deliverySlotId}
      `;

      // Track coupon usage if applied
      if (couponId) {
        await txn`
          INSERT INTO user_coupon_usage (user_id, coupon_id, order_id)
          VALUES (${userId}, ${couponId}, ${order.id})
        `;

        await txn`
          UPDATE coupons 
          SET used_count = used_count + 1 
          WHERE id = ${couponId}
        `;
      }

      // Clear cart for user
      await txn`DELETE FROM cart_items WHERE user_id = ${userId}`;

      // Award loyalty points (1 point per ₹100 spent)
      const pointsEarned = Math.floor(totalAmount / 100);
      if (pointsEarned > 0) {
        await txn`
          INSERT INTO loyalty_points (user_id, points, transaction_type, order_id, description)
          VALUES (${userId}, ${pointsEarned}, 'earned', ${order.id}, 'Order purchase reward')
        `;
      }

      // Track order creation
      await txn`
        INSERT INTO order_tracking (order_id, status, notes)
        VALUES (${order.id}, 'confirmed', 'Order placed successfully')
      `;

      return { ...order, pointsEarned };
    });

    // Send order confirmation email (outside transaction)
    try {
      await fetch("/api/notifications/send-order-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: result.id }),
      });
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order if email fails
    }

    return Response.json({
      success: true,
      data: result,
      message: result.pointsEarned
        ? `Order placed successfully! You earned ${result.pointsEarned} loyalty points.`
        : "Order placed successfully!",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create order",
      },
      { status: 500 },
    );
  }
}
