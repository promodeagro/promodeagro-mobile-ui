import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import crypto from "crypto";

// Security middleware for login attempts and suspicious activity detection
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, phone, deviceInfo, loginResult } = body;

    // Get request info
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    switch (action) {
      case 'pre_login_check': {
        // Check for suspicious activity before login attempt
        if (!email && !phone) {
          return Response.json({ success: false, error: 'Email or phone required' }, { status: 400 });
        }

        // Find user by email or phone
        const [user] = await sql`
          SELECT u.id, u.email, u.phone,
                 au.id as auth_user_id
          FROM users u
          LEFT JOIN auth_users au ON u.email = au.email
          WHERE u.email = ${email || null} OR u.phone = ${phone || null}
        `;

        if (!user) {
          return Response.json({ 
            success: true, 
            data: { 
              riskLevel: 'low',
              allowLogin: true,
              requiresAdditionalAuth: false
            }
          });
        }

        const userId = user.auth_user_id;
        
        // Check recent failed attempts
        const recentFailures = await sql`
          SELECT COUNT(*) as count
          FROM security_events
          WHERE user_id = ${userId}
            AND event_type IN ('failed_login', 'failed_2fa_auth')
            AND created_at > NOW() - INTERVAL '1 hour'
        `;

        const failureCount = parseInt(recentFailures[0]?.count || 0);

        // Check if this is a new device
        const deviceFingerprint = crypto
          .createHash('sha256')
          .update(`${userAgent}|${ip}`)
          .digest('hex')
          .substring(0, 32);

        const [knownDevice] = await sql`
          SELECT id, is_trusted FROM trusted_devices
          WHERE user_id = ${userId} AND device_id = ${deviceFingerprint}
        `;

        // Check recent login locations
        const recentLogins = await sql`
          SELECT DISTINCT location_data->>'country' as country
          FROM security_events
          WHERE user_id = ${userId}
            AND event_type = 'login_success'
            AND created_at > NOW() - INTERVAL '30 days'
          LIMIT 5
        `;

        const knownCountries = recentLogins.map(r => r.country);

        // Calculate risk score
        let riskScore = 0;
        const riskFactors = [];

        if (failureCount > 0) {
          riskScore += failureCount * 20;
          riskFactors.push(`${failureCount} recent failed attempts`);
        }

        if (!knownDevice) {
          riskScore += 30;
          riskFactors.push('New device');
        } else if (!knownDevice.is_trusted) {
          riskScore += 15;
          riskFactors.push('Untrusted device');
        }

        // Determine risk level and requirements
        let riskLevel = 'low';
        let requiresAdditionalAuth = false;
        let allowLogin = true;

        if (riskScore >= 70) {
          riskLevel = 'high';
          requiresAdditionalAuth = true;
        } else if (riskScore >= 40) {
          riskLevel = 'medium';
          requiresAdditionalAuth = true;
        }

        if (failureCount >= 5) {
          allowLogin = false;
          riskLevel = 'blocked';
        }

        // Log security check
        await sql`
          INSERT INTO security_events (user_id, event_type, severity, event_data, ip_address, risk_score)
          VALUES (${userId}, 'login_security_check', 'low', ${JSON.stringify({
            riskLevel,
            riskFactors,
            deviceFingerprint,
            requiresAdditionalAuth
          })}, ${ip}, ${riskScore})
        `;

        return Response.json({
          success: true,
          data: {
            riskLevel,
            riskScore,
            allowLogin,
            requiresAdditionalAuth,
            riskFactors,
            isNewDevice: !knownDevice,
            isTrustedDevice: knownDevice?.is_trusted || false
          }
        });
      }

      case 'post_login_process': {
        // Process after successful/failed login
        if (!loginResult || !email) {
          return Response.json({ success: false, error: 'Login result and email required' }, { status: 400 });
        }

        // Find user
        const [user] = await sql`
          SELECT u.id, u.email, u.phone,
                 au.id as auth_user_id
          FROM users u
          LEFT JOIN auth_users au ON u.email = au.email
          WHERE u.email = ${email}
        `;

        if (!user) {
          return Response.json({ success: true });
        }

        const userId = user.auth_user_id;

        if (loginResult.success) {
          // Successful login
          const deviceFingerprint = crypto
            .createHash('sha256')
            .update(`${userAgent}|${ip}`)
            .digest('hex')
            .substring(0, 32);

          // Register/update device
          await fetch('/api/auth/devices', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'user-agent': userAgent,
              'x-real-ip': ip
            },
            body: JSON.stringify({ 
              action: 'register',
              deviceId: deviceFingerprint,
              deviceName: deviceInfo?.deviceName
            })
          });

          // Log successful login
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data, ip_address, user_agent, device_id)
            VALUES (${userId}, 'login_success', 'low', ${JSON.stringify({
              loginMethod: loginResult.method || 'email',
              timestamp: new Date().toISOString()
            })}, ${ip}, ${userAgent}, ${deviceFingerprint})
          `;

          // Create welcome back notification for new devices
          const [knownDevice] = await sql`
            SELECT id FROM trusted_devices
            WHERE user_id = ${userId} AND device_id = ${deviceFingerprint}
              AND created_at < NOW() - INTERVAL '5 minutes'
          `;

          if (!knownDevice) {
            await sql`
              INSERT INTO security_alerts (user_id, alert_type, title, message, severity)
              VALUES (${userId}, 'new_device_login', 'New Device Login', 
                     'Your account was accessed from a new device. If this was not you, please secure your account immediately.', 'medium')
            `;
          }

        } else {
          // Failed login
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data, ip_address, user_agent)
            VALUES (${userId}, 'failed_login', 'medium', ${JSON.stringify({
              reason: loginResult.error || 'Invalid credentials',
              timestamp: new Date().toISOString()
            })}, ${ip}, ${userAgent})
          `;

          // Check if we should create an alert
          const recentFailures = await sql`
            SELECT COUNT(*) as count
            FROM security_events
            WHERE user_id = ${userId}
              AND event_type = 'failed_login'
              AND created_at > NOW() - INTERVAL '1 hour'
          `;

          const failureCount = parseInt(recentFailures[0]?.count || 0);

          if (failureCount >= 3) {
            await sql`
              INSERT INTO security_alerts (user_id, alert_type, title, message, severity, action_required)
              VALUES (${userId}, 'multiple_failed_logins', 'Multiple Failed Login Attempts', 
                     'There have been multiple failed login attempts on your account. Consider changing your password if this was not you.', 'high', true)
            `;
          }
        }

        return Response.json({ success: true });
      }

      case 'check_account_takeover': {
        // Check for potential account takeover indicators
        const session = await auth();
        if (!session?.user?.id) {
          return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Check for suspicious patterns
        const suspiciousEvents = await sql`
          SELECT event_type, COUNT(*) as count, 
                 array_agg(DISTINCT ip_address::text) as unique_ips,
                 array_agg(DISTINCT location_data->>'country') as countries
          FROM security_events
          WHERE user_id = ${userId}
            AND created_at > NOW() - INTERVAL '24 hours'
            AND event_type IN ('login_success', 'password_change', '2fa_disabled', 'device_added')
          GROUP BY event_type
        `;

        const indicators = [];
        let riskScore = 0;

        suspiciousEvents.forEach(event => {
          // Multiple IPs for sensitive actions
          if (event.unique_ips && event.unique_ips.length > 2 && 
              ['password_change', '2fa_disabled'].includes(event.event_type)) {
            indicators.push(`${event.event_type} from multiple IPs`);
            riskScore += 40;
          }

          // Unusual login frequency
          if (event.event_type === 'login_success' && event.count > 10) {
            indicators.push('Unusual login frequency');
            riskScore += 20;
          }

          // Multiple countries
          if (event.countries && event.countries.length > 2) {
            indicators.push('Logins from multiple countries');
            riskScore += 30;
          }
        });

        // Check for rapid security changes
        const securityChanges = await sql`
          SELECT COUNT(*) as count
          FROM security_events
          WHERE user_id = ${userId}
            AND created_at > NOW() - INTERVAL '1 hour'
            AND event_type IN ('2fa_enabled', '2fa_disabled', 'password_change', 'device_trusted', 'device_removed')
        `;

        if (parseInt(securityChanges[0]?.count || 0) >= 3) {
          indicators.push('Rapid security setting changes');
          riskScore += 50;
        }

        // Determine if we should trigger alerts
        if (riskScore >= 60) {
          await sql`
            INSERT INTO security_alerts (user_id, alert_type, title, message, severity, action_required)
            VALUES (${userId}, 'potential_takeover', 'Potential Account Compromise', 
                   'Suspicious activity detected on your account. Please review your recent activity and secure your account.', 'critical', true)
          `;

          // Log high-risk event
          await sql`
            INSERT INTO security_events (user_id, event_type, severity, event_data, risk_score)
            VALUES (${userId}, 'potential_account_takeover', 'critical', ${JSON.stringify({
              indicators,
              riskScore,
              timestamp: new Date().toISOString()
            })}, ${riskScore})
          `;
        }

        return Response.json({
          success: true,
          data: {
            riskScore,
            indicators,
            isHighRisk: riskScore >= 60
          }
        });
      }

      case 'security_health_check': {
        // Comprehensive security health check
        const session = await auth();
        if (!session?.user?.id) {
          return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get all security metrics
        const [metrics] = await sql`
          SELECT 
            (SELECT COUNT(*) FROM trusted_devices WHERE user_id = ${userId}) as device_count,
            (SELECT COUNT(*) FROM trusted_devices WHERE user_id = ${userId} AND is_trusted = true) as trusted_device_count,
            (SELECT is_enabled FROM user_2fa WHERE user_id = ${userId}) as two_fa_enabled,
            (SELECT COUNT(*) FROM encrypted_user_data WHERE user_id = ${userId}) as encrypted_items,
            (SELECT COUNT(*) FROM security_alerts WHERE user_id = ${userId} AND is_read = false) as unread_alerts,
            (SELECT COUNT(*) FROM security_events WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '7 days') as recent_activity
        `;

        // Calculate security health score
        let healthScore = 0;
        const recommendations = [];

        // 2FA check
        if (metrics?.two_fa_enabled) {
          healthScore += 30;
        } else {
          recommendations.push({
            type: 'critical',
            title: 'Enable Two-Factor Authentication',
            description: 'Protect your account with an additional security layer'
          });
        }

        // Device management
        const deviceCount = parseInt(metrics?.device_count || 0);
        const trustedDeviceCount = parseInt(metrics?.trusted_device_count || 0);
        
        if (deviceCount > 0) {
          healthScore += 20;
          if (trustedDeviceCount >= deviceCount * 0.8) {
            healthScore += 10;
          } else {
            recommendations.push({
              type: 'medium',
              title: 'Review Device Trust Settings',
              description: 'Mark your regular devices as trusted for better security'
            });
          }
        }

        // Data encryption
        const encryptedItems = parseInt(metrics?.encrypted_items || 0);
        if (encryptedItems > 0) {
          healthScore += 20;
          if (encryptedItems >= 3) {
            healthScore += 10;
          }
        } else {
          recommendations.push({
            type: 'high',
            title: 'Enable Data Encryption',
            description: 'Encrypt sensitive information like payment details and addresses'
          });
        }

        // Alert management
        const unreadAlerts = parseInt(metrics?.unread_alerts || 0);
        if (unreadAlerts === 0) {
          healthScore += 10;
        } else {
          recommendations.push({
            type: 'medium',
            title: 'Review Security Alerts',
            description: `You have ${unreadAlerts} unread security alerts`
          });
        }

        // Recent activity monitoring
        healthScore = Math.min(healthScore, 100);

        return Response.json({
          success: true,
          data: {
            healthScore,
            metrics: {
              deviceCount,
              trustedDeviceCount,
              twoFactorEnabled: !!metrics?.two_fa_enabled,
              encryptedItems,
              unreadAlerts,
              recentActivity: parseInt(metrics?.recent_activity || 0)
            },
            recommendations,
            healthLevel: healthScore >= 80 ? 'excellent' : 
                        healthScore >= 60 ? 'good' : 
                        healthScore >= 40 ? 'fair' : 'poor'
          }
        });
      }

      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security middleware error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}