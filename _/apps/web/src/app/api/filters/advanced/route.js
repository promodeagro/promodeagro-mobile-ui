import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    const body = await request.json();
    
    const {
      query = '',
      categoryIds = [],
      priceRange = { min: null, max: null },
      rating = 0,
      brands = [],
      dietaryLabels = [], // vegan, vegetarian, gluten-free, etc.
      allergens = [], // exclude products with these allergens
      certifications = [], // organic, fair-trade, etc.
      origins = [], // country of origin
      nutritionFilters = {}, // calories, protein, etc.
      inStock = true,
      sortBy = 'relevance',
      limit = 20,
      offset = 0,
      savedFilters = false
    } = body;

    let baseQuery = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.discount_percentage,
        p.images,
        p.rating,
        p.review_count,
        p.in_stock,
        p.stock_quantity,
        p.unit,
        p.weight,
        p.is_organic,
        p.is_featured,
        p.brand,
        p.country_of_origin,
        p.dietary_labels,
        p.allergen_info,
        p.certifications,
        p.nutrition_facts,
        p.share_count,
        p.social_score,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT COALESCE(array_agg(DISTINCT pt.tag_value), ARRAY[]::text[])
          FROM product_tags pt 
          WHERE pt.product_id = p.id
        ) as tags
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Text search
    if (query.trim()) {
      conditions.push(`(
        p.name ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR
        p.brand ILIKE $${paramIndex}
      )`);
      params.push(`%${query.trim()}%`);
      paramIndex++;
    }

    // Category filter
    if (categoryIds.length > 0) {
      conditions.push(`p.category_id = ANY($${paramIndex})`);
      params.push(categoryIds);
      paramIndex++;
    }

    // Price range
    if (priceRange.min !== null) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(priceRange.min);
      paramIndex++;
    }
    if (priceRange.max !== null) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(priceRange.max);
      paramIndex++;
    }

    // Rating filter
    if (rating > 0) {
      conditions.push(`p.rating >= $${paramIndex}`);
      params.push(rating);
      paramIndex++;
    }

    // Brand filter
    if (brands.length > 0) {
      conditions.push(`p.brand = ANY($${paramIndex})`);
      params.push(brands);
      paramIndex++;
    }

    // Dietary labels (intersect with product dietary labels)
    if (dietaryLabels.length > 0) {
      conditions.push(`p.dietary_labels && $${paramIndex}`);
      params.push(dietaryLabels);
      paramIndex++;
    }

    // Allergen exclusion (exclude products containing these allergens)
    if (allergens.length > 0) {
      conditions.push(`NOT (p.allergen_info && $${paramIndex})`);
      params.push(allergens);
      paramIndex++;
    }

    // Certifications
    if (certifications.length > 0) {
      conditions.push(`p.certifications && $${paramIndex}`);
      params.push(certifications);
      paramIndex++;
    }

    // Country of origin
    if (origins.length > 0) {
      conditions.push(`p.country_of_origin = ANY($${paramIndex})`);
      params.push(origins);
      paramIndex++;
    }

    // Nutrition filters
    if (nutritionFilters.maxCalories) {
      conditions.push(`(p.nutrition_facts->>'calories')::numeric <= $${paramIndex}`);
      params.push(nutritionFilters.maxCalories);
      paramIndex++;
    }
    if (nutritionFilters.minProtein) {
      conditions.push(`(p.nutrition_facts->>'protein')::text ~ '^[0-9.]+' AND (regexp_replace(p.nutrition_facts->>'protein', '[^0-9.]', '', 'g'))::numeric >= $${paramIndex}`);
      params.push(nutritionFilters.minProtein);
      paramIndex++;
    }

    // Stock filter
    if (inStock) {
      conditions.push('p.in_stock = true AND p.stock_quantity > 0');
    }

    // Add conditions to query
    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    let orderByClause = '';
    switch (sortBy) {
      case 'price_low':
        orderByClause = 'ORDER BY p.price ASC';
        break;
      case 'price_high':
        orderByClause = 'ORDER BY p.price DESC';
        break;
      case 'rating':
        orderByClause = 'ORDER BY p.rating DESC, p.review_count DESC';
        break;
      case 'newest':
        orderByClause = 'ORDER BY p.created_at DESC';
        break;
      case 'popular':
        orderByClause = 'ORDER BY p.social_score DESC, p.rating DESC';
        break;
      case 'discount':
        orderByClause = 'ORDER BY p.discount_percentage DESC';
        break;
      default:
        orderByClause = 'ORDER BY p.is_featured DESC, p.rating DESC, p.social_score DESC';
    }

    baseQuery += ' ' + orderByClause;

    // Pagination
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute the query
    const products = await sql(baseQuery, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const [countResult] = await sql(countQuery, params.slice(0, -2)); // Remove limit and offset params
    const total = parseInt(countResult.total);

    // Track search analytics if user is logged in
    if (session?.user?.id) {
      await sql`
        INSERT INTO search_analytics (user_id, search_query, filters_used, results_count, search_type)
        VALUES (${session.user.id}, ${query}, ${JSON.stringify({
          categoryIds, priceRange, rating, brands, dietaryLabels, 
          allergens, certifications, origins, nutritionFilters
        })}, ${total}, 'advanced')
      `;
    }

    return Response.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        appliedFilters: {
          query, categoryIds, priceRange, rating, brands, 
          dietaryLabels, allergens, certifications, origins, 
          nutritionFilters, inStock, sortBy
        }
      }
    });

  } catch (error) {
    console.error("Advanced search error:", error);
    return Response.json(
      { error: "Advanced search failed" },
      { status: 500 }
    );
  }
}

// Get filter options and saved filters
export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'options';

    if (type === 'saved' && session?.user?.id) {
      // Get user's saved filter preferences
      const savedFilters = await sql`
        SELECT * FROM user_filter_preferences 
        WHERE user_id = ${session.user.id}
        ORDER BY is_favorite DESC, usage_count DESC, created_at DESC
      `;

      return Response.json({
        success: true,
        data: { savedFilters }
      });
    }

    // Get all available filter options
    const [filterOptions] = await sql`
      SELECT 
        COALESCE(array_agg(DISTINCT brand) FILTER (WHERE brand IS NOT NULL), ARRAY[]::text[]) as brands,
        COALESCE(array_agg(DISTINCT country_of_origin) FILTER (WHERE country_of_origin IS NOT NULL), ARRAY[]::text[]) as origins,
        COALESCE(array_agg(DISTINCT unnest(dietary_labels)) FILTER (WHERE array_length(dietary_labels, 1) > 0), ARRAY[]::text[]) as dietary_labels,
        COALESCE(array_agg(DISTINCT unnest(allergen_info)) FILTER (WHERE array_length(allergen_info, 1) > 0), ARRAY[]::text[]) as allergens,
        COALESCE(array_agg(DISTINCT unnest(certifications)) FILTER (WHERE array_length(certifications, 1) > 0), ARRAY[]::text[]) as certifications,
        MIN(price) as min_price,
        MAX(price) as max_price,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating
      FROM products
      WHERE in_stock = true
    `;

    // Get categories
    const categories = await sql`
      SELECT id, name, slug, icon_name
      FROM categories 
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `;

    // Get popular tags
    const popularTags = await sql`
      SELECT 
        tag_type,
        tag_value,
        COUNT(*) as product_count
      FROM product_tags pt
      JOIN products p ON pt.product_id = p.id
      WHERE p.in_stock = true
      GROUP BY tag_type, tag_value
      HAVING COUNT(*) >= 3
      ORDER BY product_count DESC
      LIMIT 50
    `;

    return Response.json({
      success: true,
      data: {
        filterOptions,
        categories,
        popularTags,
        nutritionRange: {
          calories: { min: 0, max: 1000 },
          protein: { min: 0, max: 50 },
          carbs: { min: 0, max: 100 },
          fiber: { min: 0, max: 20 },
          sugar: { min: 0, max: 50 }
        }
      }
    });

  } catch (error) {
    console.error("Get filter options error:", error);
    return Response.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}