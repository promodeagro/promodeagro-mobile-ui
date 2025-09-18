import sql from "@/app/api/utils/sql";

// AI Integration will be added here after user selection
// Placeholder for AI service
async function processNaturalLanguageQuery(query, userPreferences = {}) {
  // This will be replaced with actual AI integration
  const mockAIResponse = {
    intent: "find_products",
    categories: ["vegetables", "fruits"],
    attributes: ["organic", "fresh"],
    meal_context: "dinner",
    dietary_preferences: ["healthy"],
    price_range: null,
    quantity_hints: null,
    processed_keywords: query.toLowerCase().split(" "),
    confidence: 0.85
  };
  
  return mockAIResponse;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, userId, limit = 20, context = {} } = body;
    
    if (!query || query.trim().length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Search query is required and must be at least 2 characters' 
      }, { status: 400 });
    }

    // Get user preferences for better search personalization
    let userPreferences = {};
    if (userId) {
      const preferences = await sql`
        SELECT preference_data, dietary_restrictions, favorite_categories
        FROM user_preferences 
        WHERE user_id = ${userId}
      `.catch(() => []);
      
      if (preferences.length > 0) {
        userPreferences = {
          dietary_restrictions: preferences[0].dietary_restrictions,
          favorite_categories: preferences[0].favorite_categories,
          preference_data: preferences[0].preference_data
        };
      }
    }

    // Process natural language query with AI
    const aiAnalysis = await processNaturalLanguageQuery(query, userPreferences);
    
    // Build smart SQL query based on AI analysis
    let searchQuery = `
      SELECT DISTINCT p.*, c.name as category_name, c.slug as category_slug,
             pv.id as variation_id, pv.name as variation_name, 
             pv.price as variation_price, pv.original_price as variation_original_price,
             pv.unit as variation_unit, pv.weight_grams, pv.is_default,
             pv.stock_quantity as variation_stock,
             -- Relevance scoring
             CASE 
               WHEN LOWER(p.name) LIKE LOWER($1) THEN 100
               WHEN LOWER(p.description) LIKE LOWER($1) THEN 80
               WHEN LOWER(c.name) LIKE LOWER($1) THEN 60
               ELSE 40
             END as relevance_score,
             -- Freshness scoring for perishables
             CASE 
               WHEN c.name IN ('Fruits', 'Vegetables', 'Dairy', 'Meat') THEN 20
               ELSE 0
             END as freshness_bonus,
             -- User preference scoring
             CASE 
               WHEN p.is_organic = true AND $2 = true THEN 15
               ELSE 0
             END as preference_bonus
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      WHERE p.in_stock = true
    `;
    
    const queryParams = [`%${query}%`];
    let paramCount = 1;

    // Add organic preference if detected
    paramCount++;
    queryParams.push(aiAnalysis.attributes?.includes('organic') || false);

    // Add category filters based on AI analysis
    if (aiAnalysis.categories && aiAnalysis.categories.length > 0) {
      paramCount++;
      searchQuery += ` AND LOWER(c.name) = ANY($${paramCount})`;
      queryParams.push(aiAnalysis.categories.map(cat => cat.toLowerCase()));
    }

    // Add attribute-based filters
    if (aiAnalysis.attributes?.includes('organic')) {
      searchQuery += ` AND p.is_organic = true`;
    }

    // Add natural language keyword matching
    if (aiAnalysis.processed_keywords && aiAnalysis.processed_keywords.length > 0) {
      const keywordConditions = aiAnalysis.processed_keywords.map((keyword, index) => {
        paramCount++;
        queryParams.push(`%${keyword}%`);
        return `(LOWER(p.name) LIKE LOWER($${paramCount}) OR LOWER(p.description) LIKE LOWER($${paramCount}) OR LOWER(p.nutritional_info) LIKE LOWER($${paramCount}))`;
      });
      
      if (keywordConditions.length > 0) {
        searchQuery += ` AND (${keywordConditions.join(' OR ')})`;
      }
    }

    // Smart sorting based on context
    searchQuery += `
      ORDER BY 
        (relevance_score + freshness_bonus + preference_bonus) DESC,
        p.rating DESC,
        p.review_count DESC,
        p.name ASC
    `;

    // Add limit
    paramCount++;
    searchQuery += ` LIMIT $${paramCount}`;
    queryParams.push(parseInt(limit));

    const results = await sql(searchQuery, queryParams);

    // Group variations by product
    const productsMap = new Map();
    
    results.forEach(row => {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          images: row.images,
          price: row.price,
          original_price: row.original_price,
          unit: row.unit,
          weight: row.weight,
          discount_percentage: row.discount_percentage,
          rating: row.rating,
          review_count: row.review_count,
          nutritional_info: row.nutritional_info,
          storage_requirements: row.storage_requirements,
          origin: row.origin,
          is_organic: row.is_organic,
          is_featured: row.is_featured,
          relevance_score: row.relevance_score,
          category: {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug
          },
          variations: []
        });
      }
      
      if (row.variation_id) {
        productsMap.get(row.id).variations.push({
          id: row.variation_id,
          name: row.variation_name,
          price: row.variation_price,
          original_price: row.variation_original_price,
          unit: row.variation_unit,
          weight_grams: row.weight_grams,
          is_default: row.is_default,
          stock_quantity: row.variation_stock
        });
      }
    });

    const products = Array.from(productsMap.values());

    // Generate smart suggestions for better search
    const suggestions = await generateSmartSuggestions(query, aiAnalysis, products.length);

    // Log search analytics
    if (userId) {
      await sql`
        INSERT INTO user_analytics (user_id, event_type, event_data)
        VALUES (${userId}, 'natural_language_search', ${JSON.stringify({
          query,
          ai_analysis: aiAnalysis,
          results_count: products.length,
          context
        })})
      `.catch(console.error);
    }

    return Response.json({ 
      success: true, 
      data: {
        products,
        query_analysis: {
          original_query: query,
          interpreted_intent: aiAnalysis.intent,
          detected_categories: aiAnalysis.categories,
          detected_attributes: aiAnalysis.attributes,
          confidence: aiAnalysis.confidence,
          meal_context: aiAnalysis.meal_context,
          dietary_preferences: aiAnalysis.dietary_preferences
        },
        suggestions,
        total_results: products.length
      }
    });
  } catch (error) {
    console.error('Error processing natural language search:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to process search query' 
    }, { status: 500 });
  }
}

async function generateSmartSuggestions(originalQuery, aiAnalysis, resultsCount) {
  const suggestions = [];
  
  // If low results, suggest broader terms
  if (resultsCount < 5) {
    if (aiAnalysis.categories?.length > 0) {
      suggestions.push({
        type: 'broaden',
        text: `Try searching for "${aiAnalysis.categories[0]}" instead`,
        query: aiAnalysis.categories[0]
      });
    }
    
    suggestions.push({
      type: 'alternative',
      text: `Search for similar items`,
      query: aiAnalysis.processed_keywords?.slice(0, 2).join(' ') || originalQuery
    });
  }
  
  // Meal-based suggestions
  if (aiAnalysis.meal_context) {
    const mealSuggestions = {
      'breakfast': ['oats', 'milk', 'eggs', 'bread', 'fruits'],
      'lunch': ['rice', 'vegetables', 'dal', 'chapati', 'salad'],
      'dinner': ['rice', 'roti', 'vegetables', 'paneer', 'chicken'],
      'snack': ['biscuits', 'chips', 'nuts', 'fruits', 'tea']
    };
    
    const contextSuggestions = mealSuggestions[aiAnalysis.meal_context] || [];
    contextSuggestions.slice(0, 3).forEach(item => {
      suggestions.push({
        type: 'meal_context',
        text: `${item} for ${aiAnalysis.meal_context}`,
        query: item
      });
    });
  }
  
  // Category-based suggestions
  if (aiAnalysis.categories?.length > 0) {
    suggestions.push({
      type: 'category',
      text: `Browse all ${aiAnalysis.categories[0]}`,
      query: aiAnalysis.categories[0],
      is_category: true
    });
  }
  
  return suggestions.slice(0, 6);
}

// Route for getting search suggestions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');
    
    if (!query || query.length < 2) {
      return Response.json({ 
        success: true, 
        data: { suggestions: [] }
      });
    }

    // AI-powered query suggestions
    const aiAnalysis = await processNaturalLanguageQuery(query);
    const suggestions = await generateSmartSuggestions(query, aiAnalysis, 0);
    
    // Add popular search suggestions
    const popularSearches = await sql`
      SELECT search_query, COUNT(*) as search_count
      FROM user_analytics 
      WHERE event_type = 'natural_language_search' 
        AND event_data->>'query' ILIKE ${'%' + query + '%'}
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT 5
    `.catch(() => []);

    popularSearches.forEach(search => {
      suggestions.push({
        type: 'popular',
        text: search.search_query,
        query: search.search_query,
        popularity: search.search_count
      });
    });

    return Response.json({ 
      success: true, 
      data: { 
        suggestions: suggestions.slice(0, 8),
        ai_analysis: aiAnalysis
      }
    });
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to generate suggestions' 
    }, { status: 500 });
  }
}