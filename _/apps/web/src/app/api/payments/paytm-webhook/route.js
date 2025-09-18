import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const webhookData = Object.fromEntries(formData.entries());
    
    // Verify Paytm webhook checksum
    const isValid = await verifyPaytmChecksum(webhookData);
    if (!isValid) {
      return Response.json({ error: "Invalid checksum" }, { status: 401 });
    }

    const transactionId = webhookData.ORDERID;
    const paymentStatus = webhookData.STATUS === 'TXN_SUCCESS' ? 'success' : 'failed';
    const gatewayTxnId = webhookData.TXNID;
    
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
          gateway_order_id, amount, status, gateway_response
        ) VALUES (
          ${paymentIntent.id}, 'paytm', ${gatewayTxnId}, ${transactionId},
          ${parseFloat(webhookData.TXNAMOUNT || paymentIntent.amount)}, 
          ${paymentStatus}, ${JSON.stringify(webhookData)}
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
          VALUES (${paymentIntent.order_id}, 'payment_completed', 'Payment completed via Paytm')
        `;
      } else {
        // Log payment failure
        const failureReason = webhookData.RESPMSG || 'Payment failed';
        await txn`
          INSERT INTO payment_failures (
            payment_intent_id, failure_reason, failure_code, gateway_error
          ) VALUES (
            ${paymentIntent.id}, ${failureReason}, ${webhookData.RESPCODE || 'UNKNOWN'}, 
            ${JSON.stringify(webhookData)}
          )
        `;

        await txn`
          UPDATE orders 
          SET payment_status = 'failed', updated_at = NOW()
          WHERE id = ${paymentIntent.order_id}
        `;
      }
    });

    return new Response("RESPCODE=01\nRESPMSG=success\nTXNID=" + gatewayTxnId, {
      headers: { "Content-Type": "text/plain" }
    });
  } catch (error) {
    console.error("Paytm webhook error:", error);
    return new Response("RESPCODE=02\nRESPMSG=failure", {
      headers: { "Content-Type": "text/plain" },
      status: 500
    });
  }
}

async function verifyPaytmChecksum(webhookData) {
  try {
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;
    const checksumReceived = webhookData.CHECKSUMHASH;
    
    // Remove checksum from data for verification
    const { CHECKSUMHASH, ...dataToVerify } = webhookData;
    
    const crypto = await import('crypto');
    const data = Object.keys(dataToVerify).sort().map(k => `${k}=${dataToVerify[k]}`).join('&');
    const expectedChecksum = crypto.createHash('sha256').update(data + merchantKey).digest('hex');
    
    return checksumReceived === expectedChecksum;
  } catch (error) {
    console.error('Checksum verification error:', error);
    return false;
  }
}