import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'balance';

    switch (action) {
      case 'balance':
        return await getUserLoyaltyBalance(session.user.id);
      case 'history':
        return await getUserLoyaltyHistory(session.user.id);
      case 'tiers':
        return await getLoyaltyTiers();
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Loyalty API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, points, orderId, description } = await request.json();

    switch (action) {
      case 'earn':
        return await earnLoyaltyPoints(session.user.id, points, orderId, description);
      case 'redeem':
        return await redeemLoyaltyPoints(session.user.id, points, description);
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Loyalty POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getUserLoyaltyBalance(userId) {
  const [result] = await sql`
    SELECT 
      COALESCE(SUM(CASE WHEN transaction_type = 'earned' THEN points ELSE 0 END), 0) as total_earned,
      COALESCE(SUM(CASE WHEN transaction_type = 'redeemed' THEN points ELSE 0 END), 0) as total_redeemed,
      COALESCE(SUM(CASE WHEN transaction_type = 'expired' THEN points ELSE 0 END), 0) as total_expired
    FROM loyalty_points 
    WHERE user_id = ${userId}
  `;

  const currentBalance = result.total_earned - result.total_redeemed - result.total_expired;

  // Calculate user tier based on total earned points
  const tier = calculateUserTier(result.total_earned);

  return Response.json({
    success: true,
    data: {
      currentBalance: currentBalance,
      totalEarned: result.total_earned,
      totalRedeemed: result.total_redeemed,
      totalExpired: result.total_expired,
      tier: tier,
    }
  });
}

async function getUserLoyaltyHistory(userId) {
  const history = await sql`
    SELECT 
      lp.*,
      o.id as order_number
    FROM loyalty_points lp
    LEFT JOIN orders o ON lp.order_id = o.id
    WHERE lp.user_id = ${userId}
    ORDER BY lp.created_at DESC
    LIMIT 50
  `;

  return Response.json({
    success: true,
    data: history
  });
}

async function earnLoyaltyPoints(userId, points, orderId, description) {
  if (!points || points <= 0) {
    return Response.json({ error: "Invalid points amount" }, { status: 400 });
  }

  // Set expiration date (1 year from now)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const [result] = await sql`
    INSERT INTO loyalty_points (user_id, points, transaction_type, order_id, description, expires_at)
    VALUES (${userId}, ${points}, 'earned', ${orderId}, ${description}, ${expiresAt})
    RETURNING *
  `;

  return Response.json({
    success: true,
    data: result,
    message: `You earned ${points} loyalty points!`
  });
}

async function redeemLoyaltyPoints(userId, points, description) {
  if (!points || points <= 0) {
    return Response.json({ error: "Invalid points amount" }, { status: 400 });
  }

  // Check if user has enough points
  const balance = await getUserLoyaltyBalance(userId);
  const balanceData = await balance.json();
  
  if (balanceData.data.currentBalance < points) {
    return Response.json({ 
      error: "Insufficient loyalty points",
      currentBalance: balanceData.data.currentBalance,
      requested: points
    }, { status: 400 });
  }

  const [result] = await sql`
    INSERT INTO loyalty_points (user_id, points, transaction_type, description)
    VALUES (${userId}, ${points}, 'redeemed', ${description})
    RETURNING *
  `;

  return Response.json({
    success: true,
    data: result,
    message: `You redeemed ${points} loyalty points!`
  });
}

async function getLoyaltyTiers() {
  const tiers = [
    { name: 'Bronze', minPoints: 0, maxPoints: 999, benefits: ['1 point per ₹100 spent'] },
    { name: 'Silver', minPoints: 1000, maxPoints: 4999, benefits: ['1.5 points per ₹100 spent', 'Free delivery on orders above ₹300'] },
    { name: 'Gold', minPoints: 5000, maxPoints: 14999, benefits: ['2 points per ₹100 spent', 'Free delivery on all orders', 'Early access to sales'] },
    { name: 'Platinum', minPoints: 15000, maxPoints: null, benefits: ['3 points per ₹100 spent', 'Free delivery on all orders', 'Early access to sales', 'Exclusive discounts'] }
  ];

  return Response.json({
    success: true,
    data: tiers
  });
}

function calculateUserTier(totalEarned) {
  if (totalEarned >= 15000) return 'Platinum';
  if (totalEarned >= 5000) return 'Gold';
  if (totalEarned >= 1000) return 'Silver';
  return 'Bronze';
}