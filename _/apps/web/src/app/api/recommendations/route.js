import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const userId = session?.user?.id || searchParams.get('userId');
    const type = searchParams.get('type') || 'personalized';
    const limit = parseInt(searchParams.get('limit') || '10');

    let recommendations = [];

    switch (type) {
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(userId, limit);
        break;
      case 'trending':
        recommendations = await getTrendingProducts(limit);
        break;
      case 'similar':
        const productId = searchParams.get('productId');
        recommendations = await getSimilarProducts(productId, limit);
        break;
      case 'frequently_bought_together':
        const baseProductId = searchParams.get('productId');
        recommendations = await getFrequentlyBoughtTogether(baseProductId, limit);
        break;
      case 'category_popular':
        const categoryId = searchParams.get('categoryId');
        recommendations = await getCategoryPopularProducts(categoryId, limit);
        break;
      default:
        recommendations = await getTrendingProducts(limit);
    }

    return Response.json({
      success: true,
      data: recommendations,
      type: type,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return Response.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}

async function getPersonalizedRecommendations(userId, limit) {
  if (!userId) {
    return await getTrendingProducts(limit);
  }

  // Get user's purchase history and preferences
  const userInteractions = await sql`
    SELECT 
      p.*,
      c.name as category_name,
      COUNT(upi.id) as interaction_count,
      MAX(upi.created_at) as last_interaction
    FROM user_product_interactions upi
    JOIN products p ON upi.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE upi.user_id = ${userId}
    GROUP BY p.id, c.name
    ORDER BY interaction_count DESC, last_interaction DESC
    LIMIT 20
  `;

  if (userInteractions.length === 0) {
    return await getTrendingProducts(limit);
  }

  // Get categories user is interested in
  const preferredCategories = [...new Set(userInteractions.map(item => item.category_id))];

  // Get products from preferred categories that user hasn't interacted with
  const recommendations = await sql`
    SELECT DISTINCT
      p.*,
      c.name as category_name,
      p.rating,
      p.review_count,
      CASE 
        WHEN p.category_id = ANY(${preferredCategories}) THEN 1
        ELSE 0.5
      END as relevance_score
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.in_stock = true
    AND p.id NOT IN (
      SELECT DISTINCT product_id 
      FROM user_product_interactions 
      WHERE user_id = ${userId}
    )
    ORDER BY relevance_score DESC, p.rating DESC, p.review_count DESC
    LIMIT ${limit}
  `;

  return recommendations;
}

async function getTrendingProducts(limit) {
  return await sql`
    SELECT 
      p.*,
      c.name as category_name,
      COUNT(upi.id) as interaction_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN user_product_interactions upi ON p.id = upi.product_id 
      AND upi.created_at > NOW() - INTERVAL '7 days'
    WHERE p.in_stock = true
    GROUP BY p.id, c.name
    ORDER BY interaction_count DESC, p.rating DESC
    LIMIT ${limit}
  `;
}

async function getSimilarProducts(productId, limit) {
  if (!productId) {
    return await getTrendingProducts(limit);
  }

  // Get the base product
  const [baseProduct] = await sql`
    SELECT * FROM products WHERE id = ${productId}
  `;

  if (!baseProduct) {
    return [];
  }

  // Find similar products in the same category with similar price range
  const priceRange = baseProduct.price * 0.3; // 30% price variance

  return await sql`
    SELECT 
      p.*,
      c.name as category_name,
      ABS(p.price - ${baseProduct.price}) as price_diff
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ${baseProduct.category_id}
    AND p.id != ${productId}
    AND p.in_stock = true
    AND p.price BETWEEN ${baseProduct.price - priceRange} AND ${baseProduct.price + priceRange}
    ORDER BY price_diff ASC, p.rating DESC
    LIMIT ${limit}
  `;
}

async function getFrequentlyBoughtTogether(productId, limit) {
  if (!productId) {
    return [];
  }

  // Find products frequently bought together based on order history
  return await sql`
    SELECT 
      p.*,
      c.name as category_name,
      COUNT(*) as frequency
    FROM order_items oi1
    JOIN order_items oi2 ON oi1.order_id = oi2.order_id
    JOIN products p ON oi2.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE oi1.product_id = ${productId}
    AND oi2.product_id != ${productId}
    AND p.in_stock = true
    GROUP BY p.id, c.name
    ORDER BY frequency DESC, p.rating DESC
    LIMIT ${limit}
  `;
}

async function getCategoryPopularProducts(categoryId, limit) {
  if (!categoryId) {
    return await getTrendingProducts(limit);
  }

  return await sql`
    SELECT 
      p.*,
      c.name as category_name,
      COUNT(oi.id) as order_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    WHERE p.category_id = ${categoryId}
    AND p.in_stock = true
    GROUP BY p.id, c.name
    ORDER BY order_count DESC, p.rating DESC
    LIMIT ${limit}
  `;
}