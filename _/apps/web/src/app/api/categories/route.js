import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    let query = 'SELECT * FROM categories';
    let values = [];
    
    if (active === 'true') {
      query += ' WHERE is_active = $1';
      values.push(true);
    }
    
    query += ' ORDER BY sort_order ASC, name ASC';
    
    const categories = await sql(query, values);
    
    return Response.json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, description, image_url, icon_name, sort_order } = body;
    
    if (!name || !slug) {
      return Response.json({ 
        success: false, 
        error: 'Name and slug are required' 
      }, { status: 400 });
    }
    
    const category = await sql`
      INSERT INTO categories (name, slug, description, image_url, icon_name, sort_order)
      VALUES (${name}, ${slug}, ${description}, ${image_url}, ${icon_name}, ${sort_order || 0})
      RETURNING *
    `;
    
    return Response.json({ 
      success: true, 
      data: category[0] 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create category' 
    }, { status: 500 });
  }
}