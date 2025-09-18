import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { 
      userId, 
      name, 
      email, 
      phone, 
      dateOfBirth, 
      gender, 
      preferredLanguage,
      location 
    } = await request.json();

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!name || !email) {
      return Response.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await sql`
      UPDATE auth_users SET
        name = ${name},
        email = ${email},
        phone = ${phone || null},
        date_of_birth = ${dateOfBirth || null},
        gender = ${gender || null},
        preferred_language = ${preferredLanguage || 'en'},
        location_lat = ${location?.lat || null},
        location_lng = ${location?.lng || null},
        location_address = ${location?.address || null},
        profile_completed = TRUE
      WHERE id = ${userId}
      RETURNING id, name, email, phone, profile_completed
    `;

    if (updatedUser.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize user loyalty status
    await sql`
      INSERT INTO user_loyalty_status (user_id, total_points, available_points)
      VALUES (${userId}, 0, 0)
      ON CONFLICT (user_id) DO NOTHING
    `;

    // Generate referral code if not exists
    const referralCode = `FRESH${userId.toString().padStart(6, '0')}`;
    await sql`
      UPDATE users SET referral_code = ${referralCode}
      WHERE id = ${userId} AND referral_code IS NULL
    `;

    // Award welcome points
    await sql`
      INSERT INTO loyalty_points (user_id, points, transaction_type, description, source_type)
      VALUES (${userId}, 100, 'earned', 'Welcome bonus for completing profile', 'bonus')
    `;

    await sql`
      UPDATE user_loyalty_status 
      SET total_points = total_points + 100, available_points = available_points + 100
      WHERE user_id = ${userId}
    `;

    return Response.json({
      success: true,
      user: updatedUser[0],
      referralCode,
      welcomePoints: 100
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const userProfile = await sql`
      SELECT 
        au.id,
        au.name,
        au.email,
        au.phone,
        au.date_of_birth,
        au.gender,
        au.preferred_language,
        au.location_lat,
        au.location_lng,
        au.location_address,
        au.profile_completed,
        au.dark_mode_enabled,
        au.voice_search_enabled,
        u.referral_code,
        uls.total_points,
        uls.available_points,
        lt.name as loyalty_tier_name,
        lt.color as loyalty_tier_color
      FROM auth_users au
      LEFT JOIN users u ON au.id = u.id
      LEFT JOIN user_loyalty_status uls ON au.id = uls.user_id
      LEFT JOIN loyalty_tiers lt ON uls.current_tier_id = lt.id
      WHERE au.id = ${userId}
    `;

    if (userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      profile: userProfile[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}