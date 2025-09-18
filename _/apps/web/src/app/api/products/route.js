import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             pv.id as variation_id, pv.name as variation_name, 
             pv.price as variation_price, pv.original_price as variation_original_price,
             pv.unit as variation_unit, pv.weight_grams, pv.is_default,
             pv.stock_quantity as variation_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      WHERE p.in_stock = true
    `;
    
    let values = [];
    let paramCount = 0;
    
    if (categoryId) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      values.push(parseInt(categoryId));
    }
    
    if (search) {
      paramCount++;
      query += ` AND (LOWER(p.name) LIKE LOWER($${paramCount}) OR LOWER(p.description) LIKE LOWER($${paramCount}))`;
      values.push(`%${search}%`);
    }
    
    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }
    
    query += ` ORDER BY p.rating DESC, p.name ASC`;
    
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
    
    return Response.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch products' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, description, category_id, images, price, original_price, 
      unit, weight, discount_percentage, nutritional_info, 
      storage_requirements, origin, is_organic, is_featured, variations 
    } = body;
    
    if (!name || !category_id || !price || !unit) {
      return Response.json({ 
        success: false, 
        error: 'Name, category_id, price, and unit are required' 
      }, { status: 400 });
    }
    
    const result = await sql.transaction(async (txn) => {
      // Insert product
      const product = await txn`
        INSERT INTO products (
          name, description, category_id, images, price, original_price, 
          unit, weight, discount_percentage, nutritional_info, 
          storage_requirements, origin, is_organic, is_featured
        )
        VALUES (
          ${name}, ${description}, ${category_id}, ${images}, ${price}, ${original_price},
          ${unit}, ${weight}, ${discount_percentage || 0}, ${nutritional_info},
          ${storage_requirements}, ${origin}, ${is_organic || false}, ${is_featured || false}
        )
        RETURNING *
      `;
      
      // Insert variations if provided
      if (variations && variations.length > 0) {
        for (const variation of variations) {
          await txn`
            INSERT INTO product_variations (
              product_id, name, price, original_price, unit, weight_grams, is_default, stock_quantity
            )
            VALUES (
              ${product[0].id}, ${variation.name}, ${variation.price}, ${variation.original_price},
              ${variation.unit}, ${variation.weight_grams}, ${variation.is_default || false}, ${variation.stock_quantity || 0}
            )
          `;
        }
      }
      
      return product[0];
    });
    
    return Response.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create product' 
    }, { status: 500 });
  }
}