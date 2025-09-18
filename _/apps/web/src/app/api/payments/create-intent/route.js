import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, currency = "inr", orderId } = await request.json();

    if (!amount || !orderId) {
      return Response.json({ error: "Amount and orderId are required" }, { status: 400 });
    }

    // Create Stripe Payment Intent
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        metadata: JSON.stringify({
          orderId: orderId,
          userId: session.user.id,
        }),
        automatic_payment_methods: JSON.stringify({
          enabled: true,
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Stripe error:", error);
      return Response.json({ error: "Payment setup failed" }, { status: 500 });
    }

    const paymentIntent = await response.json();

    return Response.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}