import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = session.user.id;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const severity = searchParams.get('severity'); // 'low', 'medium', 'high', 'critical'

    let query = `
      SELECT id, alert_type, title, message, severity, is_read, is_dismissed,
             action_required, action_data, created_at, read_at, dismissed_at
      FROM security_alerts 
      WHERE user_id = $1
    `;
    
    const queryParams = [userId];
    let paramCount = 1;

    if (unreadOnly) {
      paramCount++;
      query += ` AND is_read = false`;
    }

    if (severity) {
      paramCount++;
      query += ` AND severity = $${paramCount}`;
      queryParams.push(severity);
    }

    query += ` ORDER BY created_at DESC`;
    
    // Add limit and offset
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const alerts = await sql(query, queryParams);

    // Get counts by severity
    const counts = await sql`
      SELECT severity, COUNT(*) as count,
             COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
      FROM security_alerts 
      WHERE user_id = ${userId}
      GROUP BY severity
    `;

    const countsBySeverity = counts.reduce((acc, row) => {
      acc[row.severity] = {
        total: parseInt(row.count),
        unread: parseInt(row.unread_count)
      };
      return acc;
    }, {});

    // Get total unread count
    const [totalUnread] = await sql`
      SELECT COUNT(*) as count
      FROM security_alerts
      WHERE user_id = ${userId} AND is_read = false
    `;

    return Response.json({
      success: true,
      data: {
        alerts,
        pagination: {
          limit,
          offset,
          hasMore: alerts.length === limit
        },
        summary: {
          totalUnread: parseInt(totalUnread?.count || 0),
          countsBySeverity
        }
      }
    });
  } catch (error) {
    console.error('Get security alerts error:', error);
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
    const { action, alertId, alertIds } = body;
    const userId = session.user.id;

    switch (action) {
      case 'mark_read': {
        if (alertId) {
          // Mark single alert as read
          const [updated] = await sql`
            UPDATE security_alerts 
            SET is_read = true, read_at = NOW()
            WHERE id = ${alertId} AND user_id = ${userId}
            RETURNING *
          `;

          if (!updated) {
            return Response.json({ success: false, error: 'Alert not found' }, { status: 404 });
          }

          return Response.json({ success: true, data: updated });
        } else if (alertIds && Array.isArray(alertIds)) {
          // Mark multiple alerts as read
          await sql`
            UPDATE security_alerts 
            SET is_read = true, read_at = NOW()
            WHERE id = ANY(${alertIds}) AND user_id = ${userId}
          `;

          return Response.json({ success: true, message: 'Alerts marked as read' });
        } else {
          // Mark all alerts as read
          await sql`
            UPDATE security_alerts 
            SET is_read = true, read_at = NOW()
            WHERE user_id = ${userId} AND is_read = false
          `;

          return Response.json({ success: true, message: 'All alerts marked as read' });
        }
      }

      case 'mark_unread': {
        if (!alertId) {
          return Response.json({ success: false, error: 'Alert ID required' }, { status: 400 });
        }

        const [updated] = await sql`
          UPDATE security_alerts 
          SET is_read = false, read_at = NULL
          WHERE id = ${alertId} AND user_id = ${userId}
          RETURNING *
        `;

        if (!updated) {
          return Response.json({ success: false, error: 'Alert not found' }, { status: 404 });
        }

        return Response.json({ success: true, data: updated });
      }

      case 'dismiss': {
        if (!alertId) {
          return Response.json({ success: false, error: 'Alert ID required' }, { status: 400 });
        }

        const [updated] = await sql`
          UPDATE security_alerts 
          SET is_dismissed = true, dismissed_at = NOW()
          WHERE id = ${alertId} AND user_id = ${userId}
          RETURNING *
        `;

        if (!updated) {
          return Response.json({ success: false, error: 'Alert not found' }, { status: 404 });
        }

        return Response.json({ success: true, data: updated });
      }

      case 'undismiss': {
        if (!alertId) {
          return Response.json({ success: false, error: 'Alert ID required' }, { status: 400 });
        }

        const [updated] = await sql`
          UPDATE security_alerts 
          SET is_dismissed = false, dismissed_at = NULL
          WHERE id = ${alertId} AND user_id = ${userId}
          RETURNING *
        `;

        if (!updated) {
          return Response.json({ success: false, error: 'Alert not found' }, { status: 404 });
        }

        return Response.json({ success: true, data: updated });
      }

      case 'delete': {
        if (!alertId) {
          return Response.json({ success: false, error: 'Alert ID required' }, { status: 400 });
        }

        const [deleted] = await sql`
          DELETE FROM security_alerts 
          WHERE id = ${alertId} AND user_id = ${userId}
          RETURNING *
        `;

        if (!deleted) {
          return Response.json({ success: false, error: 'Alert not found' }, { status: 404 });
        }

        return Response.json({ success: true, message: 'Alert deleted successfully' });
      }

      case 'create': {
        // Admin/system function to create alerts (should be protected in production)
        const { alertType, title, message, severity = 'medium', actionRequired = false, actionData } = body;

        if (!alertType || !title || !message) {
          return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const [newAlert] = await sql`
          INSERT INTO security_alerts (user_id, alert_type, title, message, severity, action_required, action_data)
          VALUES (${userId}, ${alertType}, ${title}, ${message}, ${severity}, ${actionRequired}, ${actionData || null})
          RETURNING *
        `;

        return Response.json({ success: true, data: newAlert });
      }

      case 'bulk_delete': {
        if (!alertIds || !Array.isArray(alertIds)) {
          return Response.json({ success: false, error: 'Alert IDs required' }, { status: 400 });
        }

        await sql`
          DELETE FROM security_alerts 
          WHERE id = ANY(${alertIds}) AND user_id = ${userId}
        `;

        return Response.json({ success: true, message: 'Alerts deleted successfully' });
      }

      case 'get_security_summary': {
        // Get security overview for dashboard
        const [summary] = await sql`
          SELECT 
            COUNT(CASE WHEN severity = 'critical' AND is_read = false THEN 1 END) as critical_unread,
            COUNT(CASE WHEN severity = 'high' AND is_read = false THEN 1 END) as high_unread,
            COUNT(CASE WHEN severity = 'medium' AND is_read = false THEN 1 END) as medium_unread,
            COUNT(CASE WHEN action_required = true AND is_dismissed = false THEN 1 END) as action_required,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
            MAX(created_at) as latest_alert
          FROM security_alerts
          WHERE user_id = ${userId}
        `;

        // Get recent security events
        const recentEvents = await sql`
          SELECT event_type, severity, COUNT(*) as count, MAX(created_at) as latest
          FROM security_events
          WHERE user_id = ${userId} 
            AND created_at > NOW() - INTERVAL '7 days'
          GROUP BY event_type, severity
          ORDER BY latest DESC
          LIMIT 10
        `;

        // Check 2FA status
        const [twoFAStatus] = await sql`
          SELECT is_enabled FROM user_2fa WHERE user_id = ${userId}
        `;

        // Get trusted devices count
        const [devicesCount] = await sql`
          SELECT 
            COUNT(*) as total_devices,
            COUNT(CASE WHEN is_trusted = true THEN 1 END) as trusted_devices
          FROM trusted_devices 
          WHERE user_id = ${userId}
        `;

        return Response.json({
          success: true,
          data: {
            alertSummary: {
              criticalUnread: parseInt(summary?.critical_unread || 0),
              highUnread: parseInt(summary?.high_unread || 0),
              mediumUnread: parseInt(summary?.medium_unread || 0),
              actionRequired: parseInt(summary?.action_required || 0),
              last24Hours: parseInt(summary?.last_24h || 0),
              latestAlert: summary?.latest_alert
            },
            securityStatus: {
              twoFactorEnabled: twoFAStatus?.is_enabled || false,
              totalDevices: parseInt(devicesCount?.total_devices || 0),
              trustedDevices: parseInt(devicesCount?.trusted_devices || 0)
            },
            recentActivity: recentEvents
          }
        });
      }

      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security alerts API error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Delete specific alert
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    const userId = session.user.id;

    if (!alertId) {
      return Response.json({ success: false, error: 'Alert ID required' }, { status: 400 });
    }

    const [deleted] = await sql`
      DELETE FROM security_alerts 
      WHERE id = ${alertId} AND user_id = ${userId}
      RETURNING *
    `;

    if (!deleted) {
      return Response.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete security alert error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}