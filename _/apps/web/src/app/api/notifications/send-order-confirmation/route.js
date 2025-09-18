import { sendEmail } from "@/app/api/utils/send-email";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return Response.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Fetch order details with user info
    const [orderResult] = await sql`
      SELECT 
        o.*,
        u.email,
        u.name as user_name,
        ua.address_line1,
        ua.address_line2,
        ua.city,
        ua.state,
        ua.postal_code
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN user_addresses ua ON ua.user_id = u.id AND ua.is_default = true
      WHERE o.id = ${orderId}
    `;

    if (!orderResult) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch order items
    const orderItems = await sql`
      SELECT 
        oi.*,
        p.name as product_name,
        p.images,
        pv.name as variation_name,
        pv.unit
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variations pv ON oi.variation_id = pv.id
      WHERE oi.order_id = ${orderId}
    `;

    const order = orderResult;

    // Generate email HTML
    const emailHtml = generateOrderConfirmationEmail(order, orderItems);

    try {
      await sendEmail({
        to: order.email,
        subject: `Order Confirmation #${order.id} - Your groceries are on the way!`,
        html: emailHtml,
      });

      return Response.json({ 
        success: true, 
        message: "Order confirmation email sent successfully" 
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return Response.json({ 
        error: "Failed to send email. Please add your RESEND_API_KEY to environment variables." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Order confirmation email error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateOrderConfirmationEmail(order, orderItems) {
  const deliveryAddress = `${order.address_line1}${order.address_line2 ? ', ' + order.address_line2 : ''}, ${order.city}, ${order.state} ${order.postal_code}`;
  
  const itemsHtml = orderItems.map(item => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px 0;">
        <div style="display: flex; align-items: center;">
          <div style="margin-left: 12px;">
            <h4 style="margin: 0; font-size: 14px; color: #111827;">${item.product_name}</h4>
            ${item.variation_name ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">${item.variation_name}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; text-align: center; color: #6b7280;">×${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #111827;">₹${item.total_price}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
        <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 16px;">Thank you for your order, ${order.user_name}!</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">Order Details</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
            <p style="margin: 0; font-weight: 600; color: #111827;">#${order.id}</p>
          </div>
          <div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Date</p>
            <p style="margin: 0; font-weight: 600; color: #111827;">${new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment Method</p>
            <p style="margin: 0; font-weight: 600; color: #111827;">${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
          </div>
          <div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Amount</p>
            <p style="margin: 0; font-weight: 600; color: #8b5cf6; font-size: 18px;">₹${order.total_amount}</p>
          </div>
        </div>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0; padding: 20px 20px 0 20px; color: #111827; font-size: 16px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
        
        <div style="padding: 20px; border-top: 2px solid #f3f4f6; background: #f9fafb;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Subtotal:</span>
            <span style="font-weight: 600;">₹${(order.total_amount - order.delivery_fee + order.discount_amount).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Delivery Fee:</span>
            <span style="font-weight: 600;">₹${order.delivery_fee}</span>
          </div>
          ${order.discount_amount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Discount:</span>
            <span style="font-weight: 600; color: #10b981;">-₹${order.discount_amount}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <span style="font-weight: 600; font-size: 18px;">Total:</span>
            <span style="font-weight: 600; font-size: 18px; color: #8b5cf6;">₹${order.total_amount}</span>
          </div>
        </div>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px;">Delivery Information</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
          <p style="margin: 0; color: #111827; font-weight: 500;">${deliveryAddress}</p>
          ${order.delivery_instructions ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Instructions:</strong> ${order.delivery_instructions}</p>` : ''}
        </div>
        ${order.estimated_delivery ? `
        <div style="margin-top: 15px; padding: 12px; background: #ecfdf5; border-radius: 6px; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #065f46; font-weight: 500;">📦 Estimated Delivery</p>
          <p style="margin: 4px 0 0 0; color: #047857;">${new Date(order.estimated_delivery).toLocaleString()}</p>
        </div>
        ` : ''}
      </div>

      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #111827;">Track Your Order</h3>
        <p style="margin: 0 0 15px 0; color: #6b7280;">We'll keep you updated on your order status</p>
        <a href="#" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Order</a>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Thank you for choosing our grocery delivery service!</p>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">If you have any questions, please contact our support team.</p>
      </div>

    </body>
    </html>
  `;
}