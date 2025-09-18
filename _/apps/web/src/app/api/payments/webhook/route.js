import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return Response.json({ error: "No signature provided" }, { status: 400 });
    }

    // Verify webhook signature (simplified - in production use Stripe's webhook verification)
    const event = JSON.parse(body);

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent) {
  try {
    const metadata = JSON.parse(paymentIntent.metadata || "{}");
    const orderId = metadata.orderId;

    if (!orderId) {
      console.error("No orderId in payment intent metadata");
      return;
    }

    // Update order payment status
    await sql`
      UPDATE orders 
      SET payment_status = 'completed',
          payment_method = 'card',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `;

    console.log(`Payment successful for order ${orderId}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    const metadata = JSON.parse(paymentIntent.metadata || "{}");
    const orderId = metadata.orderId;

    if (!orderId) {
      console.error("No orderId in payment intent metadata");
      return;
    }

    // Update order payment status
    await sql`
      UPDATE orders 
      SET payment_status = 'failed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `;

    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}