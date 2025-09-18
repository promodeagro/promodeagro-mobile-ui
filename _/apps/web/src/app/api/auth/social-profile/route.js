import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, provider, profileData } = await request.json();

    if (!userId || !provider || !profileData) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract profile information based on provider
    let name = profileData.name;
    let email = profileData.email;
    let image = profileData.image || profileData.picture;
    let phone = null;

    // Provider-specific data extraction
    if (provider === 'google') {
      name = profileData.given_name && profileData.family_name 
        ? `${profileData.given_name} ${profileData.family_name}`
        : profileData.name;
      email = profileData.email;
      image = profileData.picture;
    } else if (provider === 'facebook') {
      name = profileData.name;
      email = profileData.email;
      image = profileData.picture?.data?.url || profileData.picture;
    }

    // Check if user exists in auth_users table
    const authUser = await sql`
      SELECT id, name, email, image 
      FROM auth_users 
      WHERE id = ${userId}
    `;

    if (authUser.length === 0) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update auth_users with social profile data
    const updatedAuthUser = await sql`
      UPDATE auth_users 
      SET 
        name = COALESCE(NULLIF(name, ''), ${name}),
        email = COALESCE(NULLIF(email, ''), ${email}),
        image = COALESCE(NULLIF(image, ''), ${image}),
        profile_completed = true
      WHERE id = ${userId}
      RETURNING *
    `;

    // Check if user exists in users table (your custom user table)
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length === 0) {
      // Create user in users table
      await sql`
        INSERT INTO users (email, name, created_at, updated_at)
        VALUES (${email}, ${name}, NOW(), NOW())
      `;
    } else {
      // Update existing user in users table
      await sql`
        UPDATE users 
        SET 
          name = COALESCE(NULLIF(name, ''), ${name}),
          updated_at = NOW()
        WHERE email = ${email}
      `;
    }

    // Generate referral code if not exists
    if (name) {
      const referralCode = name.replace(/\s+/g, '').toUpperCase().substring(0, 6) + 
                          Math.random().toString(36).substring(2, 6).toUpperCase();
      
      await sql`
        UPDATE users 
        SET referral_code = COALESCE(referral_code, ${referralCode})
        WHERE email = ${email}
      `;
    }

    return Response.json({
      success: true,
      data: {
        authUser: updatedAuthUser[0],
        message: "Profile imported successfully"
      }
    });

  } catch (error) {
    console.error('Social profile import error:', error);
    return Response.json(
      { error: "Failed to import profile" },
      { status: 500 }
    );
  }
}