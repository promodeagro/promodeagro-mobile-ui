import sql from "../../utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const results = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             pv.id as variation_id, pv.name as variation_name, 
             pv.price as variation_price, pv.original_price as variation_original_price,
             pv.unit as variation_unit, pv.weight_grams, pv.is_default,
             pv.stock_quantity as variation_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      WHERE p.id = ${id} AND p.in_stock = true
      ORDER BY pv.is_default DESC, pv.name ASC
    `;

    if (results.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    const product = {
      id: results[0].id,
      name: results[0].name,
      description: results[0].description,
      images: results[0].images,
      price: results[0].price,
      original_price: results[0].original_price,
      unit: results[0].unit,
      weight: results[0].weight,
      discount_percentage: results[0].discount_percentage,
      rating: results[0].rating,
      review_count: results[0].review_count,
      nutritional_info: results[0].nutritional_info,
      storage_requirements: results[0].storage_requirements,
      origin: results[0].origin,
      is_organic: results[0].is_organic,
      is_featured: results[0].is_featured,
      category: {
        id: results[0].category_id,
        name: results[0].category_name,
        slug: results[0].category_slug,
      },
      variations: results
        .filter((row) => row.variation_id)
        .map((row) => ({
          id: row.variation_id,
          name: row.variation_name,
          price: row.variation_price,
          original_price: row.variation_original_price,
          unit: row.variation_unit,
          weight_grams: row.weight_grams,
          is_default: row.is_default,
          stock_quantity: row.variation_stock,
        })),
    };

    return Response.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch product",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    const allowedFields = [
      "name",
      "description",
      "category_id",
      "images",
      "price",
      "original_price",
      "unit",
      "weight",
      "discount_percentage",
      "nutritional_info",
      "storage_requirements",
      "origin",
      "is_organic",
      "is_featured",
      "in_stock",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(body[field]);
      }
    });

    if (updateFields.length === 0) {
      return Response.json(
        {
          success: false,
          error: "No valid fields to update",
        },
        { status: 400 },
      );
    }

    paramCount++;
    updateValues.push(id);

    const query = `
      UPDATE products 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, updateValues);

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to update product",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      DELETE FROM products 
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
