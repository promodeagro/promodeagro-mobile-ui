import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const { phone, action, otp } = await request.json();

    if (!phone) {
      return Response.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // Validate Indian phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    if (!phoneRegex.test(cleanPhone)) {
      return Response.json(
        { error: "Invalid Indian phone number" },
        { status: 400 },
      );
    }

    if (action === "send") {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if there's a recent OTP request (rate limiting)
      const recentOtp = await sql`
        SELECT id FROM phone_verifications 
        WHERE phone = ${cleanPhone} 
        AND created_at > NOW() - INTERVAL '1 minute'
        AND attempts < 3
      `;

      if (recentOtp.length > 0) {
        return Response.json(
          { error: "Please wait before requesting another OTP" },
          { status: 429 },
        );
      }

      // Store OTP in database
      await sql`
        INSERT INTO phone_verifications (phone, otp, expires_at, attempts)
        VALUES (${cleanPhone}, ${otp}, NOW() + INTERVAL '10 minutes', 0)
        ON CONFLICT (phone) 
        DO UPDATE SET 
          otp = ${otp},
          expires_at = NOW() + INTERVAL '10 minutes',
          attempts = 0,
          verified = FALSE,
          created_at = NOW()
      `;

      // In production, integrate with SMS service like AWS SNS, Twilio, or Fast2SMS
      // For demo purposes, we'll just log the OTP
      console.log(`OTP for ${cleanPhone}: ${otp}`);

      // Send SMS (placeholder - integrate with your SMS provider)
      try {
        // Example SMS API call (replace with your provider)
        /* 
        const smsResponse = await fetch('YOUR_SMS_PROVIDER_API', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: `+91${cleanPhone}`,
            message: `Your FreshCart OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
            template_id: process.env.SMS_TEMPLATE_ID
          })
        });
        */

        // Log SMS sending result
        await sql`
          INSERT INTO sms_notifications (user_id, phone, message, sms_type, status)
          VALUES (NULL, ${cleanPhone}, ${"OTP: " + otp}, 'otp', 'sent')
        `;
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        // Continue even if SMS fails - in demo mode
      }

      return Response.json({
        success: true,
        message: "OTP sent successfully",
        // In demo mode, return OTP for testing
        ...(process.env.NODE_ENV === "development" && { otp }),
      });
    } else if (action === "verify") {
      if (!otp) {
        return Response.json({ error: "OTP is required" }, { status: 400 });
      }

      // Find and verify OTP
      const verification = await sql`
        SELECT id, verified, expires_at, attempts 
        FROM phone_verifications 
        WHERE phone = ${cleanPhone} 
        AND otp = ${otp}
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      if (verification.length === 0) {
        // Increment attempts
        await sql`
          UPDATE phone_verifications 
          SET attempts = attempts + 1 
          WHERE phone = ${cleanPhone}
        `;
        return Response.json({ error: "Invalid OTP" }, { status: 400 });
      }

      const record = verification[0];

      if (new Date() > new Date(record.expires_at)) {
        return Response.json({ error: "OTP has expired" }, { status: 400 });
      }

      if (record.verified) {
        return Response.json(
          { error: "OTP already verified" },
          { status: 400 },
        );
      }

      if (record.attempts >= 3) {
        return Response.json(
          { error: "Too many invalid attempts" },
          { status: 429 },
        );
      }

      // Mark as verified
      await sql`
        UPDATE phone_verifications 
        SET verified = TRUE 
        WHERE id = ${record.id}
      `;

      // Check if user exists with this phone in auth_users
      let existingAuthUser = await sql`
        SELECT id, email, name, phone 
        FROM auth_users 
        WHERE phone = ${cleanPhone}
      `;

      let authUserId;
      let userEmail = null;

      if (existingAuthUser.length === 0) {
        // Create new auth user with phone
        const newAuthUser = await sql`
          INSERT INTO auth_users (phone, profile_completed, created_at, updated_at)
          VALUES (${cleanPhone}, false, NOW(), NOW())
          RETURNING id, phone
        `;
        authUserId = newAuthUser[0].id;
      } else {
        authUserId = existingAuthUser[0].id;
        userEmail = existingAuthUser[0].email;
      }

      // Check if user exists in regular users table
      let existingUser = await sql`
        SELECT id, email, name 
        FROM users 
        WHERE phone = ${cleanPhone}
      `;

      if (existingUser.length === 0 && userEmail) {
        // Also check by email if we have one
        existingUser = await sql`
          SELECT id, email, name 
          FROM users 
          WHERE email = ${userEmail}
        `;
      }

      if (existingUser.length === 0) {
        // Create user in users table with phone
        await sql`
          INSERT INTO users (email, name, phone, created_at, updated_at)
          VALUES (NULL, NULL, ${cleanPhone}, NOW(), NOW())
        `;
      }

      // Create a session token for authentication
      const sessionToken =
        Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // 30 days expiry

      // Insert session into auth_sessions
      await sql`
        INSERT INTO auth_sessions ("userId", expires, "sessionToken")
        VALUES (${authUserId}, ${expires.toISOString()}, ${sessionToken})
      `;

      return Response.json({
        success: true,
        message: "Phone verified successfully",
        user_exists: existingUser.length > 0,
        user: existingUser.length > 0 ? existingUser[0] : { phone: cleanPhone },
        sessionToken,
        redirect: "/",
      });
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Phone OTP error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
