import sql from "../utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get wishlist with product details
    const wishlistItems = await sql`
      SELECT 
        f.id as favorite_id,
        f.notes,
        f.priority,
        f.created_at as added_at,
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
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variations pv ON p.id = pv.product_id AND pv.is_default = TRUE
      WHERE f.user_id = ${userId}
      ORDER BY f.priority DESC, f.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count
    const totalCount = await sql`
      SELECT COUNT(*) as count 
      FROM favorites 
      WHERE user_id = ${userId}
    `;

    return Response.json({
      success: true,
      data: {
        items: wishlistItems,
        pagination: {
          page,
          limit,
          total: parseInt(totalCount[0].count),
          has_more: wishlistItems.length === limit,
        },
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, productId, notes, priority } = await request.json();

    if (!userId || !productId) {
      return Response.json(
        { error: "User ID and Product ID are required" },
        { status: 400 },
      );
    }

    // Check if product exists
    const product = await sql`
      SELECT id, name FROM products WHERE id = ${productId}
    `;

    if (product.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Add to wishlist (or update if exists)
    const favoriteItem = await sql`
      INSERT INTO favorites (user_id, product_id, notes, priority)
      VALUES (${userId}, ${productId}, ${notes || null}, ${priority || 0})
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET 
        notes = ${notes || null},
        priority = ${priority || 0},
        created_at = NOW()
      RETURNING id, created_at
    `;

    // Track user interaction
    await sql`
      INSERT INTO user_product_interactions (user_id, product_id, interaction_type)
      VALUES (${userId}, ${productId}, 'favorite')
    `;

    return Response.json({
      success: true,
      message: "Added to wishlist",
      favorite: favoriteItem[0],
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId || !productId) {
      return Response.json(
        { error: "User ID and Product ID are required" },
        { status: 400 },
      );
    }

    // Remove from wishlist
    const deleted = await sql`
      DELETE FROM favorites 
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return Response.json(
        { error: "Item not found in wishlist" },
        { status: 404 },
      );
    }

    // Track user interaction
    await sql`
      INSERT INTO user_product_interactions (user_id, product_id, interaction_type)
      VALUES (${userId}, ${productId}, 'unfavorite')
    `;

    return Response.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId, productId, notes, priority } = await request.json();

    if (!userId || !productId) {
      return Response.json(
        { error: "User ID and Product ID are required" },
        { status: 400 },
      );
    }

    // Update wishlist item
    const updated = await sql`
      UPDATE favorites 
      SET 
        notes = ${notes || null},
        priority = ${priority || 0}
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING id
    `;

    if (updated.length === 0) {
      return Response.json(
        { error: "Item not found in wishlist" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Wishlist item updated",
    });
  } catch (error) {
    console.error("Update wishlist error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
