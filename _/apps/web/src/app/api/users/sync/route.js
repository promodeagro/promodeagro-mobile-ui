import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return Response.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }

    const { email, name } = session.user;
    
    if (!email) {
      return Response.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Check if user already exists in users table
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return Response.json({ 
        success: true, 
        data: existingUser[0],
        message: 'User already exists' 
      });
    }

    // Create new user record
    const newUser = await sql`
      INSERT INTO users (email, name, created_at, updated_at)
      VALUES (${email}, ${name || 'User'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    return Response.json({ 
      success: true, 
      data: newUser[0],
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to sync user' 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return Response.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }

    const { email } = session.user;
    
    // Get user from users table
    const user = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (user.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'User not found in users table' 
      }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      data: user[0] 
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to get user' 
    }, { status: 500 });
  }
}