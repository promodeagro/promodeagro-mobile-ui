import sql from "../utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit")) || 10;

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get recently viewed products
    const recentlyViewed = await sql`
      SELECT 
        rv.viewed_at,
        rv.time_spent_seconds,
        p.id,
        p.name,
        p.images,
        p.price,
        p.original_price,
        p.unit,
        p.discount_percentage,
        p.rating,
        p.in_stock,
        p.stock_quantity,
        c.name as category_name,
        pv.id as default_variation_id,
        pv.price as variation_price
      FROM recently_viewed rv
      JOIN products p ON rv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variations pv ON p.id = pv.product_id AND pv.is_default = TRUE
      WHERE rv.user_id = ${userId}
      ORDER BY rv.viewed_at DESC
      LIMIT ${limit}
    `;

    return Response.json({
      success: true,
      data: recentlyViewed,
    });
  } catch (error) {
    console.error("Get recently viewed error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, productId, sessionId, timeSpent } = await request.json();

    if (!userId || !productId) {
      return Response.json(
        { error: "User ID and Product ID are required" },
        { status: 400 },
      );
    }

    // Add or update recently viewed
    await sql`
      INSERT INTO recently_viewed (user_id, product_id, session_id, time_spent_seconds, viewed_at)
      VALUES (${userId}, ${productId}, ${sessionId || null}, ${timeSpent || 0}, NOW())
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET 
        viewed_at = NOW(),
        session_id = ${sessionId || null},
        time_spent_seconds = GREATEST(recently_viewed.time_spent_seconds, ${timeSpent || 0})
    `;

    // Keep only last 50 items per user
    await sql`
      DELETE FROM recently_viewed 
      WHERE user_id = ${userId} 
      AND id NOT IN (
        SELECT id FROM recently_viewed 
        WHERE user_id = ${userId} 
        ORDER BY viewed_at DESC 
        LIMIT 50
      )
    `;

    // Track user interaction
    await sql`
      INSERT INTO user_product_interactions (user_id, product_id, interaction_type)
      VALUES (${userId}, ${productId}, 'view')
    `;

    return Response.json({
      success: true,
      message: "Product view tracked",
    });
  } catch (error) {
    console.error("Add recently viewed error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (productId) {
      // Remove specific product
      await sql`
        DELETE FROM recently_viewed 
        WHERE user_id = ${userId} AND product_id = ${productId}
      `;
    } else {
      // Clear all recently viewed for user
      await sql`
        DELETE FROM recently_viewed 
        WHERE user_id = ${userId}
      `;
    }

    return Response.json({
      success: true,
      message: productId ? "Product removed from history" : "History cleared",
    });
  } catch (error) {
    console.error("Remove recently viewed error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
