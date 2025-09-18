import sql from "../utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      );
    }

    const cartItems = await sql`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.images,
        p.rating,
        p.review_count,
        p.is_organic,
        pv.id as variation_id,
        pv.name as variation_name,
        pv.price,
        pv.original_price,
        pv.unit,
        pv.weight_grams,
        pv.stock_quantity,
        c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variations pv ON ci.variation_id = pv.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ${userId}
      ORDER BY ci.created_at DESC
    `;

    const formattedItems = cartItems.map((item) => ({
      id: item.cart_item_id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.name,
        images: item.images,
        rating: item.rating,
        review_count: item.review_count,
        is_organic: item.is_organic,
        category: item.category_name,
      },
      variation: item.variation_id
        ? {
            id: item.variation_id,
            name: item.variation_name,
            price: parseFloat(item.price),
            original_price: item.original_price
              ? parseFloat(item.original_price)
              : null,
            unit: item.unit,
            weight_grams: item.weight_grams,
            stock_quantity: item.stock_quantity,
          }
        : null,
    }));

    const totalItems = formattedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const totalAmount = formattedItems.reduce((sum, item) => {
      const price = item.variation ? item.variation.price : 0;
      return sum + price * item.quantity;
    }, 0);

    return Response.json({
      success: true,
      data: {
        items: formattedItems,
        summary: {
          totalItems,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch cart",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, productId, variationId, quantity } = body;

    if (!userId || !productId || !quantity) {
      return Response.json(
        {
          success: false,
          error: "userId, productId, and quantity are required",
        },
        { status: 400 },
      );
    }

    // Check if item already exists in cart
    const existingItem = await sql`
      SELECT * FROM cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId} 
      ${variationId ? sql`AND variation_id = ${variationId}` : sql`AND variation_id IS NULL`}
    `;

    let result;

    if (existingItem.length > 0) {
      // Update existing item
      result = await sql`
        UPDATE cart_items 
        SET quantity = quantity + ${quantity}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND product_id = ${productId} 
        ${variationId ? sql`AND variation_id = ${variationId}` : sql`AND variation_id IS NULL`}
        RETURNING *
      `;
    } else {
      // Insert new item
      result = await sql`
        INSERT INTO cart_items (user_id, product_id, variation_id, quantity)
        VALUES (${userId}, ${productId}, ${variationId}, ${quantity})
        RETURNING *
      `;
    }

    return Response.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to add item to cart",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return Response.json(
        {
          success: false,
          error: "cartItemId and quantity are required",
        },
        { status: 400 },
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await sql`DELETE FROM cart_items WHERE id = ${cartItemId}`;
      return Response.json({
        success: true,
        message: "Item removed from cart",
      });
    } else {
      // Update quantity
      const result = await sql`
        UPDATE cart_items 
        SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${cartItemId}
        RETURNING *
      `;

      return Response.json({
        success: true,
        data: result[0],
      });
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to update cart item",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("cartItemId");
    const userId = searchParams.get("userId");

    if (cartItemId) {
      // Delete specific item
      await sql`DELETE FROM cart_items WHERE id = ${cartItemId}`;
      return Response.json({
        success: true,
        message: "Item removed from cart",
      });
    } else if (userId) {
      // Clear entire cart for user
      await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;
      return Response.json({
        success: true,
        message: "Cart cleared",
      });
    } else {
      return Response.json(
        {
          success: false,
          error: "cartItemId or userId is required",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to delete cart item",
      },
      { status: 500 },
    );
  }
}
