import sql from "@/app/api/utils/sql";
import crypto from "crypto";
import { auth } from "@/auth";

// Custom TOTP implementation using crypto
function base32Encode(buffer) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(encoded) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanInput = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "");

  let bits = 0;
  let value = 0;
  const output = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const char = cleanInput[i];
    const index = alphabet.indexOf(char);

    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function generateTOTP(secret, timeStep = 30, digits = 6) {
  const epoch = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(epoch));

  const secretBuffer = base32Decode(secret);
  const hmac = crypto.createHmac("sha1", secretBuffer);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0xf;
  const code =
    (((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)) %
    Math.pow(10, digits);

  return code.toString().padStart(digits, "0");
}

function verifyTOTP(token, secret, window = 1, timeStep = 30, digits = 6) {
  const epoch = Math.floor(Date.now() / 1000 / timeStep);

  for (let i = -window; i <= window; i++) {
    const testEpoch = epoch + i;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigUInt64BE(BigInt(testEpoch));

    const secretBuffer = base32Decode(secret);
    const hmac = crypto.createHmac("sha1", secretBuffer);
    hmac.update(timeBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0xf;
    const code =
      (((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)) %
      Math.pow(10, digits);

    if (code.toString().padStart(digits, "0") === token.padStart(digits, "0")) {
      return true;
    }
  }

  return false;
}

function generateSecret() {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

// Simple QR code data URL generator for TOTP
function generateQRCodeDataURL(text) {
  // This creates a simple data URL that mobile authenticator apps can scan
  // In a real implementation, you'd want a proper QR code library
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}`;
}

// Generate secure random backup codes
function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
}

// Setup 2FA for user
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { action, token, backupCode } = body;
    const userId = session.user.id;

    switch (action) {
      case "setup": {
        // Generate secret for new 2FA setup
        const secret = generateSecret();
        const appName = "Promode Agro";
        const userEmail = session.user.email;

        // Create TOTP URL for QR code
        const keyUri = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;

        // Generate QR code URL
        const qrCode = generateQRCodeDataURL(keyUri);

        // Generate backup codes
        const backupCodes = generateBackupCodes();

        // Store in database (not enabled yet)
        await sql`
          INSERT INTO user_2fa (user_id, secret, backup_codes, is_enabled)
          VALUES (${userId}, ${secret}, ${backupCodes}, false)
          ON CONFLICT (user_id) 
          DO UPDATE SET secret = ${secret}, backup_codes = ${backupCodes}, is_enabled = false
        `;

        return Response.json({
          success: true,
          data: {
            secret,
            qrCode,
            backupCodes,
            manualEntryKey: secret,
          },
        });
      }

      case "verify": {
        if (!token) {
          return Response.json(
            { success: false, error: "Token required" },
            { status: 400 },
          );
        }

        // Get user's 2FA data
        const [twoFAData] = await sql`
          SELECT secret, is_enabled FROM user_2fa WHERE user_id = ${userId}
        `;

        if (!twoFAData) {
          return Response.json(
            { success: false, error: "2FA not set up" },
            { status: 400 },
          );
        }

        // Verify token
        const isValid = verifyTOTP(
          token.replace(/\s/g, ""),
          twoFAData.secret,
          2,
        );

        if (!isValid) {
          // Log failed attempt
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data)
            VALUES (${userId}, 'failed_2fa_verify', 'medium', ${JSON.stringify({ action: "verify" })})
          `;

          return Response.json(
            { success: false, error: "Invalid token" },
            { status: 400 },
          );
        }

        // Enable 2FA
        await sql`
          UPDATE user_2fa 
          SET is_enabled = true, enabled_at = NOW(), last_used_at = NOW()
          WHERE user_id = ${userId}
        `;

        // Log successful setup
        await sql`
          INSERT INTO security_events (user_id, event_type, severity, event_data)
          VALUES (${userId}, '2fa_enabled', 'low', ${JSON.stringify({ timestamp: new Date().toISOString() })})
        `;

        // Create security alert
        await sql`
          INSERT INTO security_alerts (user_id, alert_type, title, message, severity)
          VALUES (${userId}, '2fa_enabled', 'Two-Factor Authentication Enabled', 
                 'Two-factor authentication has been successfully enabled for your account.', 'low')
        `;

        return Response.json({
          success: true,
          message: "2FA enabled successfully",
        });
      }

      case "authenticate": {
        if (!token && !backupCode) {
          return Response.json(
            { success: false, error: "Token or backup code required" },
            { status: 400 },
          );
        }

        // Get user's 2FA data
        const [twoFAData] = await sql`
          SELECT secret, is_enabled, backup_codes, recovery_used_codes FROM user_2fa WHERE user_id = ${userId}
        `;

        if (!twoFAData || !twoFAData.is_enabled) {
          return Response.json(
            { success: false, error: "2FA not enabled" },
            { status: 400 },
          );
        }

        let isValid = false;
        let usedBackupCode = null;

        if (token) {
          // Verify TOTP token
          isValid = verifyTOTP(token.replace(/\s/g, ""), twoFAData.secret, 2);
        } else if (backupCode) {
          // Verify backup code
          const cleanBackupCode = backupCode
            .replace(/[\s-]/g, "")
            .toUpperCase();
          const availableCodes = twoFAData.backup_codes.filter(
            (code) => !twoFAData.recovery_used_codes.includes(code),
          );

          const matchingCode = availableCodes.find(
            (code) =>
              code.replace(/[\s-]/g, "").toUpperCase() === cleanBackupCode,
          );

          if (matchingCode) {
            isValid = true;
            usedBackupCode = matchingCode;
          }
        }

        if (!isValid) {
          // Log failed attempt
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data)
            VALUES (${userId}, 'failed_2fa_auth', 'high', ${JSON.stringify({
              method: token ? "totp" : "backup_code",
              timestamp: new Date().toISOString(),
            })})
          `;

          return Response.json(
            { success: false, error: "Invalid authentication code" },
            { status: 400 },
          );
        }

        // Update last used time and mark backup code as used if applicable
        if (usedBackupCode) {
          await sql`
            UPDATE user_2fa 
            SET last_used_at = NOW(), 
                recovery_used_codes = array_append(recovery_used_codes, ${usedBackupCode})
            WHERE user_id = ${userId}
          `;

          // Alert about backup code usage
          await sql`
            INSERT INTO security_alerts (user_id, alert_type, title, message, severity)
            VALUES (${userId}, 'backup_code_used', 'Backup Code Used', 
                   'A backup code was used to access your account. Consider regenerating your codes.', 'medium')
          `;
        } else {
          await sql`
            UPDATE user_2fa SET last_used_at = NOW() WHERE user_id = ${userId}
          `;
        }

        return Response.json({
          success: true,
          message: "Authentication successful",
          usedBackupCode: !!usedBackupCode,
        });
      }

      case "disable": {
        if (!token && !backupCode) {
          return Response.json(
            { success: false, error: "Authentication required to disable 2FA" },
            { status: 400 },
          );
        }

        // Get user's 2FA data for verification
        const [twoFAData] = await sql`
          SELECT secret, is_enabled, backup_codes, recovery_used_codes FROM user_2fa WHERE user_id = ${userId}
        `;

        if (!twoFAData || !twoFAData.is_enabled) {
          return Response.json(
            { success: false, error: "2FA not enabled" },
            { status: 400 },
          );
        }

        let isValid = false;

        if (token) {
          isValid = verifyTOTP(token.replace(/\s/g, ""), twoFAData.secret, 2);
        } else if (backupCode) {
          const cleanBackupCode = backupCode
            .replace(/[\s-]/g, "")
            .toUpperCase();
          const availableCodes = twoFAData.backup_codes.filter(
            (code) => !twoFAData.recovery_used_codes.includes(code),
          );

          const matchingCode = availableCodes.find(
            (code) =>
              code.replace(/[\s-]/g, "").toUpperCase() === cleanBackupCode,
          );

          isValid = !!matchingCode;
        }

        if (!isValid) {
          return Response.json(
            { success: false, error: "Invalid authentication code" },
            { status: 400 },
          );
        }

        // Disable 2FA
        await sql`
          UPDATE user_2fa SET is_enabled = false WHERE user_id = ${userId}
        `;

        // Log disable event
        await sql`
          INSERT INTO security_events (user_id, event_type, severity, event_data)
          VALUES (${userId}, '2fa_disabled', 'medium', ${JSON.stringify({ timestamp: new Date().toISOString() })})
        `;

        // Create security alert
        await sql`
          INSERT INTO security_alerts (user_id, alert_type, title, message, severity, action_required)
          VALUES (${userId}, '2fa_disabled', 'Two-Factor Authentication Disabled', 
                 'Two-factor authentication has been disabled for your account. Consider re-enabling for better security.', 'medium', true)
        `;

        return Response.json({
          success: true,
          message: "2FA disabled successfully",
        });
      }

      case "regenerate_codes": {
        if (!token) {
          return Response.json(
            { success: false, error: "Token required for code regeneration" },
            { status: 400 },
          );
        }

        // Get user's 2FA data for verification
        const [twoFAData] = await sql`
          SELECT secret, is_enabled FROM user_2fa WHERE user_id = ${userId}
        `;

        if (!twoFAData || !twoFAData.is_enabled) {
          return Response.json(
            { success: false, error: "2FA not enabled" },
            { status: 400 },
          );
        }

        // Verify current 2FA
        const isValid = verifyTOTP(
          token.replace(/\s/g, ""),
          twoFAData.secret,
          2,
        );

        if (!isValid) {
          return Response.json(
            { success: false, error: "Invalid authentication code" },
            { status: 400 },
          );
        }

        // Generate new backup codes
        const newBackupCodes = generateBackupCodes();

        await sql`
          UPDATE user_2fa 
          SET backup_codes = ${newBackupCodes}, recovery_used_codes = '{}'
          WHERE user_id = ${userId}
        `;

        return Response.json({
          success: true,
          data: { backupCodes: newBackupCodes },
        });
      }

      default:
        return Response.json(
          { success: false, error: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("2FA API error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Get 2FA status
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const [twoFAData] = await sql`
      SELECT is_enabled, enabled_at, last_used_at, 
             array_length(backup_codes, 1) as total_codes,
             array_length(recovery_used_codes, 1) as used_codes
      FROM user_2fa 
      WHERE user_id = ${userId}
    `;

    if (!twoFAData) {
      return Response.json({
        success: true,
        data: {
          isEnabled: false,
          isSetup: false,
        },
      });
    }

    return Response.json({
      success: true,
      data: {
        isEnabled: twoFAData.is_enabled,
        isSetup: true,
        enabledAt: twoFAData.enabled_at,
        lastUsedAt: twoFAData.last_used_at,
        backupCodesRemaining:
          (twoFAData.total_codes || 0) - (twoFAData.used_codes || 0),
      },
    });
  } catch (error) {
    console.error("Get 2FA status error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
