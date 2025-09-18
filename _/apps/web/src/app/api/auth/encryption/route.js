import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import crypto from "crypto";

// Encryption configuration
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Generate encryption key
function generateEncryptionKey() {
  return crypto.randomBytes(KEY_LENGTH);
}

// Generate initialization vector
function generateIV() {
  return crypto.randomBytes(IV_LENGTH);
}

// Encrypt data
function encryptData(plaintext, key) {
  const iv = generateIV();
  const cipher = crypto.createCipher("aes-256-gcm", key);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

// Decrypt data
function decryptData(encryptedData, key) {
  const { encrypted, iv, tag } = encryptedData;

  const decipher = crypto.createDecipher("aes-256-gcm", key);
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Hash sensitive data for indexing (one-way)
function hashForIndex(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Generate user-specific encryption key ID
function generateKeyId(userId, dataType) {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${dataType}:${Date.now()}`)
    .digest("hex")
    .substring(0, 16);
}

// Store encryption key securely (in production, use key management service)
async function storeEncryptionKey(keyId, key) {
  // In production, you'd store this in a dedicated key management service
  // For now, we'll store it as an environment variable or encrypted in the database
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  // This is a simplified implementation - in production, use proper key management
  process.env[`ENCRYPTION_KEY_${keyId}`] = key.toString("hex");

  return keyId;
}

// Retrieve encryption key
async function getEncryptionKey(keyId) {
  // In production, retrieve from key management service
  const keyHex = process.env[`ENCRYPTION_KEY_${keyId}`];
  if (!keyHex) {
    throw new Error("Encryption key not found");
  }

  return Buffer.from(keyHex, "hex");
}

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
    const { action, dataType, data, encryptedDataId } = body;
    const userId = session.user.id;

    switch (action) {
      case "encrypt": {
        if (!dataType || !data) {
          return Response.json(
            { success: false, error: "Data type and data required" },
            { status: 400 },
          );
        }

        // Validate data type
        const allowedTypes = [
          "payment_info",
          "address",
          "personal",
          "sensitive_notes",
        ];
        if (!allowedTypes.includes(dataType)) {
          return Response.json(
            { success: false, error: "Invalid data type" },
            { status: 400 },
          );
        }

        // Generate encryption key and ID
        const encryptionKey = generateEncryptionKey();
        const keyId = generateKeyId(userId, dataType);

        // Store encryption key
        await storeEncryptionKey(keyId, encryptionKey);

        // Encrypt the data
        const encryptedData = encryptData(JSON.stringify(data), encryptionKey);
        const encryptedString = `${encryptedData.encrypted}:${encryptedData.iv}:${encryptedData.tag}`;

        // Store encrypted data in database
        const [stored] = await sql`
          INSERT INTO encrypted_user_data (user_id, data_type, encrypted_data, encryption_key_id)
          VALUES (${userId}, ${dataType}, ${encryptedString}, ${keyId})
          RETURNING id, created_at
        `;

        // Log encryption event
        await sql`
          INSERT INTO security_events (user_id, event_type, severity, event_data)
          VALUES (${userId}, 'data_encrypted', 'low', ${JSON.stringify({
            dataType,
            encryptedDataId: stored.id,
            keyId,
          })})
        `;

        return Response.json({
          success: true,
          data: {
            encryptedDataId: stored.id,
            dataType,
            keyId,
            createdAt: stored.created_at,
          },
        });
      }

      case "decrypt": {
        if (!encryptedDataId) {
          return Response.json(
            { success: false, error: "Encrypted data ID required" },
            { status: 400 },
          );
        }

        // Retrieve encrypted data
        const [encryptedRecord] = await sql`
          SELECT encrypted_data, encryption_key_id, data_type
          FROM encrypted_user_data
          WHERE id = ${encryptedDataId} AND user_id = ${userId}
        `;

        if (!encryptedRecord) {
          return Response.json(
            { success: false, error: "Encrypted data not found" },
            { status: 404 },
          );
        }

        try {
          // Get encryption key
          const encryptionKey = await getEncryptionKey(
            encryptedRecord.encryption_key_id,
          );

          // Parse encrypted data
          const [encrypted, iv, tag] =
            encryptedRecord.encrypted_data.split(":");
          const encryptedData = { encrypted, iv, tag };

          // Decrypt data
          const decryptedString = decryptData(encryptedData, encryptionKey);
          const decryptedData = JSON.parse(decryptedString);

          // Log decryption access
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data)
            VALUES (${userId}, 'data_decrypted', 'low', ${JSON.stringify({
              dataType: encryptedRecord.data_type,
              encryptedDataId,
              accessedAt: new Date().toISOString(),
            })})
          `;

          return Response.json({
            success: true,
            data: {
              decryptedData,
              dataType: encryptedRecord.data_type,
            },
          });
        } catch (error) {
          console.error("Decryption error:", error);

          // Log decryption failure
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data)
            VALUES (${userId}, 'decryption_failed', 'high', ${JSON.stringify({
              encryptedDataId,
              error: "Decryption failed",
            })})
          `;

          return Response.json(
            { success: false, error: "Failed to decrypt data" },
            { status: 500 },
          );
        }
      }

      case "list": {
        const { dataType: filterType } = body;

        let query = `
          SELECT id, data_type, encryption_key_id, created_at, updated_at
          FROM encrypted_user_data
          WHERE user_id = $1
        `;

        const queryParams = [userId];

        if (filterType) {
          query += ` AND data_type = $2`;
          queryParams.push(filterType);
        }

        query += ` ORDER BY created_at DESC`;

        const encryptedData = await sql(query, queryParams);

        return Response.json({
          success: true,
          data: { encryptedData },
        });
      }

      case "delete": {
        if (!encryptedDataId) {
          return Response.json(
            { success: false, error: "Encrypted data ID required" },
            { status: 400 },
          );
        }

        // Get data info before deletion
        const [dataToDelete] = await sql`
          SELECT data_type, encryption_key_id
          FROM encrypted_user_data
          WHERE id = ${encryptedDataId} AND user_id = ${userId}
        `;

        if (!dataToDelete) {
          return Response.json(
            { success: false, error: "Encrypted data not found" },
            { status: 404 },
          );
        }

        // Delete encrypted data
        await sql`
          DELETE FROM encrypted_user_data
          WHERE id = ${encryptedDataId} AND user_id = ${userId}
        `;

        // Note: In production, you might want to securely delete the encryption key as well
        // if no other data uses the same key

        // Log deletion event
        await sql`
          INSERT INTO security_events (user_id, event_type, severity, event_data)
          VALUES (${userId}, 'encrypted_data_deleted', 'medium', ${JSON.stringify(
            {
              encryptedDataId,
              dataType: dataToDelete.data_type,
              deletedAt: new Date().toISOString(),
            },
          )})
        `;

        return Response.json({
          success: true,
          message: "Encrypted data deleted successfully",
        });
      }

      case "update": {
        const { newData } = body;

        if (!encryptedDataId || !newData) {
          return Response.json(
            {
              success: false,
              error: "Encrypted data ID and new data required",
            },
            { status: 400 },
          );
        }

        // Get current encrypted record
        const [currentRecord] = await sql`
          SELECT data_type, encryption_key_id
          FROM encrypted_user_data
          WHERE id = ${encryptedDataId} AND user_id = ${userId}
        `;

        if (!currentRecord) {
          return Response.json(
            { success: false, error: "Encrypted data not found" },
            { status: 404 },
          );
        }

        try {
          // Get encryption key
          const encryptionKey = await getEncryptionKey(
            currentRecord.encryption_key_id,
          );

          // Encrypt new data
          const encryptedData = encryptData(
            JSON.stringify(newData),
            encryptionKey,
          );
          const encryptedString = `${encryptedData.encrypted}:${encryptedData.iv}:${encryptedData.tag}`;

          // Update encrypted data
          await sql`
            UPDATE encrypted_user_data
            SET encrypted_data = ${encryptedString}, updated_at = NOW()
            WHERE id = ${encryptedDataId} AND user_id = ${userId}
          `;

          // Log update event
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data)
            VALUES (${userId}, 'encrypted_data_updated', 'low', ${JSON.stringify(
              {
                encryptedDataId,
                dataType: currentRecord.data_type,
                updatedAt: new Date().toISOString(),
              },
            )})
          `;

          return Response.json({
            success: true,
            message: "Encrypted data updated successfully",
          });
        } catch (error) {
          console.error("Update encryption error:", error);
          return Response.json(
            { success: false, error: "Failed to update encrypted data" },
            { status: 500 },
          );
        }
      }

      case "get_encryption_status": {
        // Get encryption statistics for user
        const encryptionStats = await sql`
          SELECT 
            data_type,
            COUNT(*) as count,
            MAX(updated_at) as last_updated,
            MIN(created_at) as first_created
          FROM encrypted_user_data
          WHERE user_id = ${userId}
          GROUP BY data_type
          ORDER BY data_type
        `;

        // Get recent encryption events
        const recentEvents = await sql`
          SELECT event_type, COUNT(*) as count, MAX(created_at) as latest
          FROM security_events
          WHERE user_id = ${userId}
            AND event_type IN ('data_encrypted', 'data_decrypted', 'encrypted_data_deleted', 'decryption_failed')
            AND created_at > NOW() - INTERVAL '30 days'
          GROUP BY event_type
          ORDER BY latest DESC
        `;

        return Response.json({
          success: true,
          data: {
            encryptionStats,
            recentActivity: recentEvents,
            totalEncryptedItems: encryptionStats.reduce(
              (sum, stat) => sum + parseInt(stat.count),
              0,
            ),
          },
        });
      }

      case "hash_sensitive_field": {
        // For creating searchable hashes of sensitive data (one-way)
        const { fieldValue } = body;

        if (!fieldValue) {
          return Response.json(
            { success: false, error: "Field value required" },
            { status: 400 },
          );
        }

        const hash = hashForIndex(fieldValue);

        return Response.json({
          success: true,
          data: { hash },
        });
      }

      default:
        return Response.json(
          { success: false, error: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Encryption API error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Get encryption status and statistics
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = session.user.id;
    const action = searchParams.get("action");

    if (action === "status") {
      // Get detailed encryption status
      const encryptionStats = await sql`
        SELECT 
          data_type,
          COUNT(*) as count,
          MAX(updated_at) as last_updated,
          MIN(created_at) as first_created
        FROM encrypted_user_data
        WHERE user_id = ${userId}
        GROUP BY data_type
        ORDER BY data_type
      `;

      // Get security score based on encryption usage
      const totalItems = encryptionStats.reduce(
        (sum, stat) => sum + parseInt(stat.count),
        0,
      );
      const encryptedTypes = encryptionStats.length;

      let securityScore = 0;
      if (totalItems > 0) securityScore += 40;
      if (encryptedTypes >= 2) securityScore += 20;
      if (encryptedTypes >= 3) securityScore += 20;

      // Check 2FA status for additional score
      const [twoFAStatus] = await sql`
        SELECT is_enabled FROM user_2fa WHERE user_id = ${userId}
      `;
      if (twoFAStatus?.is_enabled) securityScore += 20;

      return Response.json({
        success: true,
        data: {
          encryptionStats,
          securityScore,
          totalEncryptedItems: totalItems,
          encryptedDataTypes: encryptedTypes,
          recommendations: generateSecurityRecommendations(
            securityScore,
            encryptionStats,
            twoFAStatus?.is_enabled,
          ),
        },
      });
    }

    // Default: get basic encryption info
    const [summary] = await sql`
      SELECT 
        COUNT(*) as total_encrypted,
        COUNT(DISTINCT data_type) as encrypted_types,
        MAX(created_at) as last_encrypted
      FROM encrypted_user_data
      WHERE user_id = ${userId}
    `;

    return Response.json({
      success: true,
      data: {
        totalEncrypted: parseInt(summary?.total_encrypted || 0),
        encryptedTypes: parseInt(summary?.encrypted_types || 0),
        lastEncrypted: summary?.last_encrypted,
        encryptionEnabled: parseInt(summary?.total_encrypted || 0) > 0,
      },
    });
  } catch (error) {
    console.error("Get encryption status error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Generate security recommendations based on current status
function generateSecurityRecommendations(
  securityScore,
  encryptionStats,
  twoFAEnabled,
) {
  const recommendations = [];

  if (securityScore < 60) {
    recommendations.push({
      type: "critical",
      title: "Enable Data Encryption",
      message:
        "Start encrypting sensitive data like payment information and addresses.",
      action: "encrypt_data",
    });
  }

  if (!twoFAEnabled) {
    recommendations.push({
      type: "high",
      title: "Enable Two-Factor Authentication",
      message: "Add an extra layer of security to your account.",
      action: "setup_2fa",
    });
  }

  if (encryptionStats.length > 0 && encryptionStats.length < 3) {
    recommendations.push({
      type: "medium",
      title: "Encrypt More Data Types",
      message: "Consider encrypting additional sensitive information.",
      action: "expand_encryption",
    });
  }

  if (securityScore >= 80) {
    recommendations.push({
      type: "success",
      title: "Excellent Security",
      message: "Your account has strong security measures in place.",
      action: "maintain",
    });
  }

  return recommendations;
}
