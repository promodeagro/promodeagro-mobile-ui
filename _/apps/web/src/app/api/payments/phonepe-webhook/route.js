import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.text();
    const xVerify = request.headers.get('X-VERIFY');
    
    // Verify PhonePe webhook signature
    const isValid = await verifyPhonePeSignature(body, xVerify);
    if (!isValid) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const webhookData = JSON.parse(body);
    const { response } = webhookData;
    
    if (!response) {
      return Response.json({ error: "Invalid webhook data" }, { status: 400 });
    }

    const transactionId = response.data.merchantTransactionId;
    const paymentStatus = response.success ? 'success' : 'failed';
    
    // Find payment intent
    const [paymentIntent] = await sql`
      SELECT * FROM payment_intents 
      WHERE external_id = ${transactionId}
    `;

    if (!paymentIntent) {
      console.error('Payment intent not found for transaction:', transactionId);
      return Response.json({ error: "Payment intent not found" }, { status: 404 });
    }

    // Update payment status using transaction
    await sql.transaction(async (txn) => {
      // Update payment intent
      await txn`
        UPDATE payment_intents 
        SET status = ${paymentStatus}, 
            webhook_data = ${JSON.stringify(webhookData)},
            updated_at = NOW(),
            completed_at = ${paymentStatus === 'success' ? 'NOW()' : null}
        WHERE id = ${paymentIntent.id}
      `;

      // Log transaction
      await txn`
        INSERT INTO payment_transactions (
          payment_intent_id, gateway, gateway_transaction_id, 
          amount, status, gateway_response
        ) VALUES (
          ${paymentIntent.id}, 'phonepe', ${transactionId},
          ${paymentIntent.amount}, ${paymentStatus}, ${JSON.stringify(response)}
        )
      `;

      // Update order payment status
      if (paymentStatus === 'success') {
        await txn`
          UPDATE orders 
          SET payment_status = 'completed', updated_at = NOW()
          WHERE id = ${paymentIntent.order_id}
        `;

        // Add order tracking
        await txn`
          INSERT INTO order_tracking (order_id, status, notes)
          VALUES (${paymentIntent.order_id}, 'payment_completed', 'Payment completed via PhonePe')
        `;
      } else {
        // Log payment failure
        const failureReason = response.message || 'Payment failed';
        await txn`
          INSERT INTO payment_failures (
            payment_intent_id, failure_reason, failure_code, gateway_error
          ) VALUES (
            ${paymentIntent.id}, ${failureReason}, ${response.code || 'UNKNOWN'}, 
            ${JSON.stringify(response)}
          )
        `;

        await txn`
          UPDATE orders 
          SET payment_status = 'failed', updated_at = NOW()
          WHERE id = ${paymentIntent.order_id}
        `;
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("PhonePe webhook error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function verifyPhonePeSignature(body, signature) {
  try {
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    
    const crypto = await import('crypto');
    const bodyHash = crypto.createHash('sha256').update(body + '/pg/v1/status' + saltKey).digest('hex');
    const expectedSignature = bodyHash + '###' + saltIndex;
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}