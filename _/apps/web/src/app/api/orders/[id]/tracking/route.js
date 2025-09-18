import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const orderId = params.id;
    const userId = session.user.id;

    // Get order and verify ownership
    const [order] = await sql`
      SELECT o.*, dp.name as delivery_partner_name, dp.phone as delivery_partner_phone,
             dp.current_location_lat, dp.current_location_lng, dp.rating as partner_rating
      FROM orders o
      LEFT JOIN delivery_partners dp ON o.delivery_partner_id = dp.id
      WHERE o.id = ${orderId} AND o.user_id = ${userId}
    `;

    if (!order) {
      return Response.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Get delivery tracking history
    const trackingHistory = await sql`
      SELECT status, location_lat, location_lng, notes, created_at,
             delivery_partner_lat, delivery_partner_lng, estimated_arrival,
             contact_phone
      FROM order_tracking
      WHERE order_id = ${orderId}
      ORDER BY created_at ASC
    `;

    // Get delivery address coordinates (mock data for demo)
    const deliveryAddress = {
      latitude: 28.6139, // Delhi coordinates as example
      longitude: 77.2090,
      address: order.delivery_address
    };

    // Calculate estimated delivery time
    const estimatedDelivery = order.estimated_delivery || 
      new Date(Date.now() + 45 * 60 * 1000); // 45 minutes from now

    const trackingData = {
      order: {
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        estimated_delivery: estimatedDelivery,
        delivery_instructions: order.delivery_instructions,
        express_delivery: order.express_delivery,
        live_tracking_enabled: order.live_tracking_enabled
      },
      deliveryPartner: order.delivery_partner_id ? {
        name: order.delivery_partner_name,
        phone: order.delivery_partner_phone,
        rating: order.partner_rating,
        currentLocation: {
          latitude: parseFloat(order.current_location_lat) || 28.6129,
          longitude: parseFloat(order.current_location_lng) || 77.2295
        }
      } : null,
      deliveryAddress,
      trackingHistory: trackingHistory.map(track => ({
        status: track.status,
        location: track.location_lat && track.location_lng ? {
          latitude: parseFloat(track.location_lat),
          longitude: parseFloat(track.location_lng)
        } : null,
        deliveryPartnerLocation: track.delivery_partner_lat && track.delivery_partner_lng ? {
          latitude: parseFloat(track.delivery_partner_lat),
          longitude: parseFloat(track.delivery_partner_lng)
        } : null,
        notes: track.notes,
        timestamp: track.created_at,
        estimatedArrival: track.estimated_arrival,
        contactPhone: track.contact_phone
      })),
      currentStatus: {
        status: order.status,
        statusText: getStatusText(order.status),
        canTrack: ['confirmed', 'preparing', 'packed', 'out_for_delivery'].includes(order.status)
      }
    };

    return Response.json({
      success: true,
      data: trackingData
    });

  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch tracking information'
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const orderId = params.id;
    const userId = session.user.id;
    const { delivery_instructions } = await request.json();

    // Update delivery instructions
    const [updatedOrder] = await sql`
      UPDATE orders 
      SET 
        delivery_instructions_updated = ${delivery_instructions},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId} AND user_id = ${userId}
      RETURNING *
    `;

    if (!updatedOrder) {
      return Response.json({
        success: false,
        error: 'Order not found or cannot be updated'
      }, { status: 404 });
    }

    // Add tracking entry for instruction update
    await sql`
      INSERT INTO order_tracking (order_id, status, notes)
      VALUES (${orderId}, 'instructions_updated', ${`Customer updated delivery instructions: ${delivery_instructions}`})
    `;

    return Response.json({
      success: true,
      message: 'Delivery instructions updated successfully',
      data: { 
        delivery_instructions: delivery_instructions 
      }
    });

  } catch (error) {
    console.error('Error updating delivery instructions:', error);
    return Response.json({
      success: false,
      error: 'Failed to update delivery instructions'
    }, { status: 500 });
  }
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Order Placed',
    'confirmed': 'Order Confirmed', 
    'preparing': 'Preparing Your Order',
    'packed': 'Order Packed',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || 'Processing';
}