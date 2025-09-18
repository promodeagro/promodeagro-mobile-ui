export async function POST(request) {
  try {
    const { upiLink, size = "200" } = await request.json();

    if (!upiLink) {
      return Response.json({ error: "UPI link is required" }, { status: 400 });
    }

    // Generate QR code using external API (like QR Server)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiLink)}&format=png`;

    return Response.json({
      success: true,
      data: {
        qrCodeUrl: qrUrl,
        upiLink: upiLink,
      },
    });
  } catch (error) {
    console.error("QR code generation error:", error);
    return Response.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}