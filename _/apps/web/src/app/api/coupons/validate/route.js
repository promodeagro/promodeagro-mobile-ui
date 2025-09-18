import sql from "@/app/api/utils/sql";

// POST - Validate coupon code
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, userId, orderAmount } = body;

    if (!code || !userId || orderAmount === undefined) {
      return Response.json(
        { error: "Coupon code, user ID, and order amount are required" },
        { status: 400 }
      );
    }

    // Fetch coupon details
    const [coupon] = await sql`
      SELECT 
        id,
        code,
        name,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount_amount,
        usage_limit,
        used_count,
        expires_at,
        is_active
      FROM coupons 
      WHERE UPPER(code) = UPPER(${code})
        AND is_active = true
    `;

    if (!coupon) {
      return Response.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return Response.json(
        { error: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Check if coupon usage limit has been reached
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return Response.json(
        { error: "Coupon usage limit has been reached" },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (orderAmount < coupon.min_order_amount) {
      return Response.json(
        { 
          error: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon` 
        },
        { status: 400 }
      );
    }

    // Check if user has already used this coupon (if it's a single-use coupon)
    const userUsage = await sql`
      SELECT COUNT(*) as usage_count 
      FROM user_coupon_usage 
      WHERE user_id = ${userId} AND coupon_id = ${coupon.id}
    `;

    if (userUsage[0].usage_count > 0 && coupon.usage_limit === 1) {
      return Response.json(
        { error: "You have already used this coupon" },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderAmount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else {
      // Fixed discount
      discountAmount = Math.min(coupon.discount_value, orderAmount);
    }

    return Response.json({
      success: true,
      data: {
        ...coupon,
        discountAmount: parseFloat(discountAmount.toFixed(2))
      }
    });

  } catch (error) {
    console.error("Error validating coupon:", error);
    return Response.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}