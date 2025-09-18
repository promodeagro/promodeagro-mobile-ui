import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, platform, shareType = 'product', referralCode } = body;

    if (!productId || !platform) {
      return Response.json({ error: "Product ID and platform are required" }, { status: 400 });
    }

    // Get product details for share URL generation
    const [product] = await sql`
      SELECT id, name, price, images, discount_percentage, description
      FROM products 
      WHERE id = ${productId}
    `;

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Generate share URL with referral tracking
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.promodeagrofarms.com';
    const shareUrl = `${baseUrl}/product/${productId}?ref=${referralCode || session.user.id}&utm_source=${platform}&utm_medium=social&utm_campaign=product_share`;

    // Create social share record
    const [shareRecord] = await sql`
      INSERT INTO social_shares (user_id, product_id, platform, share_type, share_url, referral_code)
      VALUES (${session.user.id}, ${productId}, ${platform}, ${shareType}, ${shareUrl}, ${referralCode || session.user.id})
      RETURNING id
    `;

    // Update product share count
    await sql`
      UPDATE products 
      SET share_count = share_count + 1,
          social_score = LEAST(5.0, social_score + 0.1)
      WHERE id = ${productId}
    `;

    // Generate platform-specific share content
    const shareContent = generateShareContent(product, platform, shareUrl);

    return Response.json({
      success: true,
      data: {
        shareId: shareRecord.id,
        shareUrl,
        content: shareContent
      }
    });

  } catch (error) {
    console.error("Social share error:", error);
    return Response.json(
      { error: "Failed to create social share" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Get user's sharing history
    const shares = await sql`
      SELECT 
        ss.*,
        p.name as product_name,
        p.images[1] as product_image,
        p.price as product_price
      FROM social_shares ss
      JOIN products p ON ss.product_id = p.id
      WHERE ss.user_id = ${userId}
      ORDER BY ss.created_at DESC
      LIMIT 50
    `;

    // Get sharing analytics
    const [analytics] = await sql`
      SELECT 
        COUNT(*) as total_shares,
        COUNT(DISTINCT product_id) as unique_products_shared,
        COUNT(CASE WHEN platform = 'whatsapp' THEN 1 END) as whatsapp_shares,
        COUNT(CASE WHEN platform = 'facebook' THEN 1 END) as facebook_shares,
        COUNT(CASE WHEN platform = 'instagram' THEN 1 END) as instagram_shares,
        COUNT(CASE WHEN platform = 'twitter' THEN 1 END) as twitter_shares
      FROM social_shares
      WHERE user_id = ${userId}
    `;

    return Response.json({
      success: true,
      data: {
        shares,
        analytics
      }
    });

  } catch (error) {
    console.error("Get social shares error:", error);
    return Response.json(
      { error: "Failed to fetch social shares" },
      { status: 500 }
    );
  }
}

function generateShareContent(product, platform, shareUrl) {
  const discountText = product.discount_percentage > 0 
    ? ` 🔥 ${product.discount_percentage}% OFF!` 
    : '';
  
  const baseContent = {
    title: `${product.name}${discountText}`,
    description: product.description || `Fresh ${product.name} at amazing prices!`,
    price: `₹${product.price}`,
    image: product.images?.[0] || '',
    url: shareUrl
  };

  switch (platform) {
    case 'whatsapp':
      return {
        ...baseContent,
        message: `🛒 Check out this amazing product!\n\n*${baseContent.title}*\n💰 ${baseContent.price}\n\n${baseContent.description}\n\n🔗 ${shareUrl}\n\n#PromodeAgroFarms #FreshGroceries #OrganicFood`
      };

    case 'facebook':
      return {
        ...baseContent,
        message: `🌱 Fresh from Promode Agro Farms! ${baseContent.title} at just ${baseContent.price}!\n\n${baseContent.description}\n\n#OrganicGroceries #FreshProduce #HealthyLiving`,
        hashtags: ['PromodeAgroFarms', 'OrganicFood', 'FreshGroceries', 'HealthyEating']
      };

    case 'instagram':
      return {
        ...baseContent,
        message: `🌿 Fresh & Organic ${product.name}! ${discountText}\n\n💚 Farm to Table Freshness\n🚚 Free Delivery\n💰 ${baseContent.price}\n\n#PromodeAgroFarms #OrganicFood #FreshGroceries #FarmFresh #HealthyEating #FoodDelivery`,
        hashtags: ['PromodeAgroFarms', 'OrganicFood', 'FreshGroceries', 'FarmFresh', 'HealthyEating', 'FoodDelivery', 'Organic', 'Fresh']
      };

    case 'twitter':
      return {
        ...baseContent,
        message: `🌱 ${baseContent.title} ${baseContent.price}${discountText}\n\nFresh organic groceries delivered to your door! 🚚\n\n${shareUrl}\n\n#OrganicFood #FreshGroceries #PromodeAgroFarms`,
        hashtags: ['PromodeAgroFarms', 'OrganicFood', 'FreshGroceries']
      };

    case 'pinterest':
      return {
        ...baseContent,
        message: `Fresh Organic ${product.name} - Farm to Table Quality`,
        hashtags: ['OrganicFood', 'FreshGroceries', 'HealthyEating', 'FarmFresh', 'OrganicProduce']
      };

    default:
      return baseContent;
  }
}