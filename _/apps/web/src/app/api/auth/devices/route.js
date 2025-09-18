import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import crypto from "crypto";

// Generate device fingerprint based on request data
function generateDeviceFingerprint(userAgent, ip, additionalData = {}) {
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${userAgent}|${ip}|${JSON.stringify(additionalData)}`)
    .digest('hex')
    .substring(0, 32);
  return fingerprint;
}

// Detect device type and platform from user agent
function parseDeviceInfo(userAgent) {
  const ua = userAgent.toLowerCase();
  
  let deviceType = 'web';
  let platform = 'web';
  
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    deviceType = 'mobile';
    if (/iphone|ipad|ipod/i.test(ua)) {
      platform = 'ios';
    } else if (/android/i.test(ua)) {
      platform = 'android';
    }
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
    if (/ipad/i.test(ua)) {
      platform = 'ios';
    }
  }
  
  // Extract browser info
  let browser = 'unknown';
  if (/chrome/i.test(ua)) browser = 'chrome';
  else if (/firefox/i.test(ua)) browser = 'firefox';
  else if (/safari/i.test(ua)) browser = 'safari';
  else if (/edge/i.test(ua)) browser = 'edge';
  
  return {
    deviceType,
    platform,
    browser,
    userAgent: userAgent
  };
}

// Get approximate location from IP (mock implementation)
async function getLocationFromIP(ip) {
  // In production, you'd use a service like MaxMind GeoLite2
  // This is a mock implementation
  return {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    timezone: 'UTC'
  };
}

// Calculate risk score for device/login
function calculateRiskScore(deviceInfo, locationData, userHistory = {}) {
  let score = 0;
  
  // New device adds risk
  if (!deviceInfo.isKnown) score += 30;
  
  // Different location adds risk
  if (locationData.country !== userHistory.lastCountry) score += 20;
  
  // Mobile devices are generally less risky
  if (deviceInfo.deviceType === 'mobile') score -= 10;
  
  // Recent failed attempts add risk
  if (userHistory.recentFailedAttempts > 0) {
    score += userHistory.recentFailedAttempts * 15;
  }
  
  // Cap at 100
  return Math.min(Math.max(score, 0), 100);
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'current') {
      // Get current device info
      const userAgent = request.headers.get('user-agent') || '';
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 '127.0.0.1';
      
      const deviceId = generateDeviceFingerprint(userAgent, ip);
      
      const [currentDevice] = await sql`
        SELECT * FROM trusted_devices 
        WHERE user_id = ${userId} AND device_id = ${deviceId}
        ORDER BY last_active DESC
        LIMIT 1
      `;

      const deviceInfo = parseDeviceInfo(userAgent);
      const locationData = await getLocationFromIP(ip);

      return Response.json({
        success: true,
        data: {
          deviceId,
          deviceInfo,
          locationData,
          isTrusted: currentDevice?.is_trusted || false,
          isRegistered: !!currentDevice,
          lastActive: currentDevice?.last_active,
          trustedAt: currentDevice?.trusted_at
        }
      });
    }

    // Get all user's devices
    const devices = await sql`
      SELECT id, device_id, device_name, device_type, platform, browser_info,
             ip_address, location_data, is_trusted, is_current, last_active,
             created_at, trusted_at
      FROM trusted_devices 
      WHERE user_id = ${userId}
      ORDER BY last_active DESC
    `;

    return Response.json({
      success: true,
      data: { devices }
    });
  } catch (error) {
    console.error('Get devices error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, deviceId, deviceName, trustDevice } = body;
    const userId = session.user.id;

    // Get request info
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    const currentDeviceId = deviceId || generateDeviceFingerprint(userAgent, ip);
    const deviceInfo = parseDeviceInfo(userAgent);
    const locationData = await getLocationFromIP(ip);

    switch (action) {
      case 'register': {
        // Register/update current device
        const finalDeviceName = deviceName || 
          `${deviceInfo.platform} ${deviceInfo.browser}`.trim() || 
          'Unknown Device';

        // Check if device already exists
        const [existingDevice] = await sql`
          SELECT * FROM trusted_devices 
          WHERE user_id = ${userId} AND device_id = ${currentDeviceId}
        `;

        if (existingDevice) {
          // Update existing device
          await sql`
            UPDATE trusted_devices 
            SET device_name = ${finalDeviceName},
                browser_info = ${JSON.stringify(deviceInfo)},
                ip_address = ${ip},
                location_data = ${JSON.stringify(locationData)},
                last_active = NOW(),
                is_current = true
            WHERE user_id = ${userId} AND device_id = ${currentDeviceId}
          `;
        } else {
          // Mark all other devices as not current
          await sql`
            UPDATE trusted_devices SET is_current = false WHERE user_id = ${userId}
          `;

          // Insert new device
          await sql`
            INSERT INTO trusted_devices (
              user_id, device_id, device_name, device_type, platform,
              browser_info, ip_address, location_data, is_trusted, is_current
            ) VALUES (
              ${userId}, ${currentDeviceId}, ${finalDeviceName}, ${deviceInfo.deviceType}, ${deviceInfo.platform},
              ${JSON.stringify(deviceInfo)}, ${ip}, ${JSON.stringify(locationData)}, ${!!trustDevice}, true
            )
          `;

          // Log new device registration
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data, ip_address, device_id, location_data)
            VALUES (${userId}, 'device_registered', 'low', ${JSON.stringify({
              deviceName: finalDeviceName,
              deviceType: deviceInfo.deviceType,
              platform: deviceInfo.platform
            })}, ${ip}, ${currentDeviceId}, ${JSON.stringify(locationData)})
          `;
        }

        return Response.json({
          success: true,
          data: {
            deviceId: currentDeviceId,
            deviceName: finalDeviceName,
            isTrusted: !!trustDevice
          }
        });
      }

      case 'trust': {
        if (!deviceId) {
          return Response.json({ success: false, error: 'Device ID required' }, { status: 400 });
        }

        // Update device trust status
        const [updated] = await sql`
          UPDATE trusted_devices 
          SET is_trusted = true, trusted_at = NOW()
          WHERE user_id = ${userId} AND device_id = ${deviceId}
          RETURNING *
        `;

        if (!updated) {
          return Response.json({ success: false, error: 'Device not found' }, { status: 404 });
        }

        // Log trust event
        await sql`
          INSERT INTO security_events (user_id, event_type, severity, event_data, device_id)
          VALUES (${userId}, 'device_trusted', 'low', ${JSON.stringify({
            deviceName: updated.device_name,
            trustedAt: new Date().toISOString()
          })}, ${deviceId})
        `;

        return Response.json({ success: true, message: 'Device trusted successfully' });
      }

      case 'untrust': {
        if (!deviceId) {
          return Response.json({ success: false, error: 'Device ID required' }, { status: 400 });
        }

        // Update device trust status
        const [updated] = await sql`
          UPDATE trusted_devices 
          SET is_trusted = false, trusted_at = NULL
          WHERE user_id = ${userId} AND device_id = ${deviceId}
          RETURNING *
        `;

        if (!updated) {
          return Response.json({ success: false, error: 'Device not found' }, { status: 404 });
        }

        // Log untrust event
        await sql`
          INSERT INTO security_events (user_id, event_type, severity, event_data, device_id)
          VALUES (${userId}, 'device_untrusted', 'medium', ${JSON.stringify({
            deviceName: updated.device_name,
            untrustedAt: new Date().toISOString()
          })}, ${deviceId})
        `;

        // Create security alert
        await sql`
          INSERT INTO security_alerts (user_id, alert_type, title, message, severity)
          VALUES (${userId}, 'device_untrusted', 'Device Untrusted', 
                 ${'Device "' + updated.device_name + '" has been marked as untrusted.'}, 'medium')
        `;

        return Response.json({ success: true, message: 'Device untrusted successfully' });
      }

      case 'remove': {
        if (!deviceId) {
          return Response.json({ success: false, error: 'Device ID required' }, { status: 400 });
        }

        // Get device info before deletion
        const [deviceToRemove] = await sql`
          SELECT * FROM trusted_devices 
          WHERE user_id = ${userId} AND device_id = ${deviceId}
        `;

        if (!deviceToRemove) {
          return Response.json({ success: false, error: 'Device not found' }, { status: 404 });
        }

        // Don't allow removing current device
        if (deviceToRemove.is_current) {
          return Response.json({ success: false, error: 'Cannot remove current device' }, { status: 400 });
        }

        // Remove device
        await sql`
          DELETE FROM trusted_devices 
          WHERE user_id = ${userId} AND device_id = ${deviceId}
        `;

        // Log removal event
        await sql`
          INSERT INTO security_events (user_id, event_type, severity, event_data, device_id)
          VALUES (${userId}, 'device_removed', 'medium', ${JSON.stringify({
            deviceName: deviceToRemove.device_name,
            removedAt: new Date().toISOString()
          })}, ${deviceId})
        `;

        return Response.json({ success: true, message: 'Device removed successfully' });
      }

      case 'check_suspicious': {
        // Check for suspicious login patterns
        const riskScore = calculateRiskScore(deviceInfo, locationData);
        
        // Get recent failed attempts
        const recentFailures = await sql`
          SELECT COUNT(*) as count
          FROM security_events
          WHERE user_id = ${userId}
            AND event_type IN ('failed_login', 'failed_2fa_auth')
            AND created_at > NOW() - INTERVAL '1 hour'
        `;

        const failureCount = parseInt(recentFailures[0]?.count || 0);
        
        // Check if this is a new location
        const recentDevices = await sql`
          SELECT DISTINCT location_data->>'country' as country
          FROM trusted_devices
          WHERE user_id = ${userId}
            AND last_active > NOW() - INTERVAL '30 days'
        `;

        const knownCountries = recentDevices.map(d => d.country);
        const isNewLocation = !knownCountries.includes(locationData.country);
        
        if (riskScore > 70 || failureCount > 3 || isNewLocation) {
          // Create security alert for suspicious activity
          await sql`
            INSERT INTO security_alerts (user_id, alert_type, title, message, severity, action_required)
            VALUES (${userId}, 'suspicious_login', 'Suspicious Login Attempt', 
                   'A login attempt from an unrecognized device or location was detected. Please verify this was you.', 
                   'high', true)
          `;

          // Log suspicious activity
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data, ip_address, device_id, location_data, risk_score)
            VALUES (${userId}, 'suspicious_activity', 'high', ${JSON.stringify({
              riskFactors: {
                newDevice: !deviceInfo.isKnown,
                newLocation: isNewLocation,
                recentFailures: failureCount,
                riskScore
              }
            })}, ${ip}, ${currentDeviceId}, ${JSON.stringify(locationData)}, ${riskScore})
          `;
        }

        return Response.json({
          success: true,
          data: {
            riskScore,
            isSuspicious: riskScore > 70,
            riskFactors: {
              newLocation: isNewLocation,
              recentFailures: failureCount > 0,
              highRiskScore: riskScore > 70
            }
          }
        });
      }

      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Device management error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}