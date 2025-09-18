import sql from "@/app/api/utils/sql";
import { upload } from "@/app/api/utils/upload";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    if (!productId) {
      return Response.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Get reviews with user info and helpfulness
    const reviews = await sql`
      SELECT 
        pr.id,
        pr.rating,
        pr.review_text,
        pr.review_images,
        pr.is_verified_purchase,
        pr.helpful_count,
        pr.created_at,
        u.name as user_name,
        CASE 
          WHEN rh.is_helpful IS TRUE THEN 'helpful'
          WHEN rh.is_helpful IS FALSE THEN 'not_helpful'
          ELSE null
        END as user_helpfulness
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      LEFT JOIN review_helpfulness rh ON pr.id = rh.review_id AND rh.user_id = ${userId || null}
      WHERE pr.product_id = ${productId}
      ORDER BY pr.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get review stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM product_reviews 
      WHERE product_id = ${productId}
    `;

    return Response.json({
      success: true,
      data: {
        reviews,
        stats: stats[0] || {
          total_reviews: 0,
          average_rating: 0,
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0
        },
        pagination: {
          page,
          limit,
          total: parseInt(stats[0]?.total_reviews || 0),
          has_more: reviews.length === limit
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { 
      userId, 
      productId, 
      orderId, 
      rating, 
      reviewText, 
      images 
    } = await request.json();

    if (!userId || !productId || !rating) {
      return Response.json({ 
        error: "User ID, Product ID, and rating are required" 
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check if user has already reviewed this product
    const existingReview = await sql`
      SELECT id FROM product_reviews 
      WHERE user_id = ${userId} AND product_id = ${productId}
    `;

    if (existingReview.length > 0) {
      return Response.json({ error: "You have already reviewed this product" }, { status: 400 });
    }

    // Verify if user has purchased this product (for verified purchase badge)
    let isVerifiedPurchase = false;
    if (orderId) {
      const purchaseCheck = await sql`
        SELECT oi.id FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ${userId} 
        AND oi.product_id = ${productId}
        AND o.status = 'delivered'
        ${orderId ? sql`AND o.id = ${orderId}` : sql``}
      `;
      isVerifiedPurchase = purchaseCheck.length > 0;
    }

    // Upload review images if provided
    let reviewImages = null;
    if (images && images.length > 0) {
      const uploadPromises = images.map(async (imageData) => {
        const result = await upload({ base64: imageData });
        return result.url;
      });
      reviewImages = await Promise.all(uploadPromises);
    }

    // Create review
    const newReview = await sql`
      INSERT INTO product_reviews (
        user_id, 
        product_id, 
        order_id, 
        rating, 
        review_text, 
        review_images, 
        is_verified_purchase
      )
      VALUES (
        ${userId}, 
        ${productId}, 
        ${orderId || null}, 
        ${rating}, 
        ${reviewText || null}, 
        ${reviewImages}, 
        ${isVerifiedPurchase}
      )
      RETURNING id, created_at
    `;

    // Update product rating and review count
    await sql`
      UPDATE products SET 
        rating = (
          SELECT AVG(rating)::numeric(3,2) 
          FROM product_reviews 
          WHERE product_id = ${productId}
        ),
        review_count = (
          SELECT COUNT(*) 
          FROM product_reviews 
          WHERE product_id = ${productId}
        )
      WHERE id = ${productId}
    `;

    // Award loyalty points for review
    await sql`
      INSERT INTO loyalty_points (user_id, points, transaction_type, description, source_type)
      VALUES (${userId}, 10, 'earned', 'Points for writing a product review', 'review')
    `;

    await sql`
      UPDATE user_loyalty_status 
      SET total_points = total_points + 10, available_points = available_points + 10
      WHERE user_id = ${userId}
    `;

    return Response.json({
      success: true,
      review: newReview[0],
      pointsEarned: 10
    });

  } catch (error) {
    console.error('Create review error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { reviewId, userId, action, isHelpful } = await request.json();

    if (!reviewId || !userId || !action) {
      return Response.json({ error: "Review ID, User ID, and action are required" }, { status: 400 });
    }

    if (action === 'mark_helpful') {
      if (typeof isHelpful !== 'boolean') {
        return Response.json({ error: "isHelpful must be boolean" }, { status: 400 });
      }

      // Add or update helpfulness
      await sql`
        INSERT INTO review_helpfulness (review_id, user_id, is_helpful)
        VALUES (${reviewId}, ${userId}, ${isHelpful})
        ON CONFLICT (review_id, user_id) 
        DO UPDATE SET is_helpful = ${isHelpful}
      `;

      // Update helpful count
      const helpfulCount = await sql`
        SELECT COUNT(*) as count 
        FROM review_helpfulness 
        WHERE review_id = ${reviewId} AND is_helpful = TRUE
      `;

      await sql`
        UPDATE product_reviews 
        SET helpful_count = ${helpfulCount[0].count}
        WHERE id = ${reviewId}
      `;

      return Response.json({ success: true });

    } else if (action === 'report') {
      await sql`
        UPDATE product_reviews 
        SET reported_count = reported_count + 1
        WHERE id = ${reviewId}
      `;

      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('Update review error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}