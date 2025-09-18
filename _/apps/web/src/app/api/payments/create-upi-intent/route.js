import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { amount, orderId, paymentMethod, upiId, userId } = await request.json();

    if (!amount || !orderId || !paymentMethod) {
      return Response.json({ 
        error: "Amount, orderId and paymentMethod are required" 
      }, { status: 400 });
    }

    const paymentData = {
      orderId,
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      userId,
      paymentMethod,
    };

    let paymentResponse;

    switch (paymentMethod) {
      case 'upi':
        paymentResponse = await createUPIPayment(paymentData, upiId);
        break;
      case 'phonepe':
        paymentResponse = await createPhonePePayment(paymentData);
        break;
      case 'googlepay':
        paymentResponse = await createGooglePayPayment(paymentData);
        break;
      case 'paytm':
        paymentResponse = await createPaytmPayment(paymentData);
        break;
      default:
        return Response.json({ error: "Unsupported payment method" }, { status: 400 });
    }

    return Response.json({
      success: true,
      data: {
        transactionId: paymentResponse.transactionId,
        paymentUrl: paymentResponse.paymentUrl,
        upiLink: paymentResponse.upiLink,
        qrCode: paymentResponse.qrCode,
        deepLink: paymentResponse.deepLink,
      },
    });
  } catch (error) {
    console.error("UPI payment intent creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function createUPIPayment(paymentData, upiId) {
  const { orderId, amount, userId } = paymentData;
  
  // Generate UPI payment link
  const merchantVPA = process.env.UPI_MERCHANT_VPA || "merchant@upi";
  const merchantName = process.env.UPI_MERCHANT_NAME || "Grocery Store";
  const transactionId = `TXN${Date.now()}${userId}`;
  
  const upiLink = `upi://pay?pa=${merchantVPA}&pn=${encodeURIComponent(merchantName)}&tr=${transactionId}&am=${(amount / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
  
  return {
    transactionId,
    paymentUrl: null,
    upiLink,
    qrCode: upiLink,
    deepLink: upiLink,
  };
}

async function createPhonePePayment(paymentData) {
  const { orderId, amount, userId } = paymentData;
  
  try {
    const transactionId = `PHONEPE${Date.now()}${userId}`;
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: `USER${userId}`,
      amount: amount,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/phonepe-webhook`,
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const string = base64Payload + '/pg/v1/pay' + saltKey;
    
    // Create SHA256 hash
    const crypto = await import('crypto');
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + saltIndex;

    const response = await fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({
        request: base64Payload
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        transactionId,
        paymentUrl: result.data.instrumentResponse.redirectInfo.url,
        deepLink: `phonepe://pay?tr=${transactionId}`,
        upiLink: null,
        qrCode: null,
      };
    } else {
      throw new Error(result.message || 'PhonePe payment creation failed');
    }
  } catch (error) {
    console.error('PhonePe payment error:', error);
    throw error;
  }
}

async function createGooglePayPayment(paymentData) {
  const { orderId, amount, userId } = paymentData;
  
  const transactionId = `GPAY${Date.now()}${userId}`;
  const merchantVPA = process.env.UPI_MERCHANT_VPA || "merchant@upi";
  const merchantName = process.env.UPI_MERCHANT_NAME || "Grocery Store";
  
  const upiLink = `upi://pay?pa=${merchantVPA}&pn=${encodeURIComponent(merchantName)}&tr=${transactionId}&am=${(amount / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
  const googlePayLink = `tez://upi/pay?pa=${merchantVPA}&pn=${encodeURIComponent(merchantName)}&tr=${transactionId}&am=${(amount / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
  
  return {
    transactionId,
    paymentUrl: null,
    upiLink,
    qrCode: upiLink,
    deepLink: googlePayLink,
  };
}

async function createPaytmPayment(paymentData) {
  const { orderId, amount, userId } = paymentData;
  
  try {
    const transactionId = `PAYTM${Date.now()}${userId}`;
    const merchantId = process.env.PAYTM_MERCHANT_ID;
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;
    const website = process.env.PAYTM_WEBSITE || "WEBSTAGING";
    
    const paytmParams = {
      MID: merchantId,
      WEBSITE: website,
      ORDER_ID: transactionId,
      CUST_ID: `CUST${userId}`,
      TXN_AMOUNT: (amount / 100).toString(),
      CURRENCY: "INR",
      CHANNEL_ID: "WAP",
      CALLBACK_URL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paytm-webhook`,
    };

    const checksumhash = await generatePaytmChecksum(paytmParams, merchantKey);
    paytmParams.CHECKSUMHASH = checksumhash;

    const response = await fetch('https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=' + merchantId + '&orderId=' + transactionId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: paytmParams
      }),
    });

    const result = await response.json();
    
    if (result.body.resultInfo.resultStatus === 'S') {
      const paymentUrl = `https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${merchantId}&orderId=${transactionId}`;
      
      return {
        transactionId,
        paymentUrl,
        deepLink: `paytm://pay?pa=${process.env.UPI_MERCHANT_VPA}&tr=${transactionId}&am=${(amount / 100).toFixed(2)}`,
        upiLink: null,
        qrCode: null,
      };
    } else {
      throw new Error(result.body.resultInfo.resultMsg || 'Paytm payment creation failed');
    }
  } catch (error) {
    console.error('Paytm payment error:', error);
    throw error;
  }
}

async function generatePaytmChecksum(params, key) {
  const crypto = await import('crypto');
  const data = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha256').update(data + key).digest('hex');
}