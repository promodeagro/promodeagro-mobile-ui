import sql from "../utils/sql";

// GET - Fetch user addresses
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const addresses = await sql`
      SELECT 
        id,
        name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        is_default,
        created_at
      FROM user_addresses 
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    return Response.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return Response.json(
      { error: "Failed to fetch addresses" },
      { status: 500 },
    );
  }
}

// POST - Create new address
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      isDefault,
    } = body;

    if (!userId || !name || !addressLine1 || !city || !state || !postalCode) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // If this is set as default, unset all other defaults for this user
    if (isDefault) {
      await sql`
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = ${userId}
      `;
    }

    const [newAddress] = await sql`
      INSERT INTO user_addresses (
        user_id, name, address_line1, address_line2, city, state, postal_code, is_default
      ) VALUES (
        ${userId}, ${name}, ${addressLine1}, ${addressLine2 || null}, 
        ${city}, ${state}, ${postalCode}, ${isDefault || false}
      )
      RETURNING *
    `;

    return Response.json({
      success: true,
      data: newAddress,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    return Response.json(
      { error: "Failed to create address" },
      { status: 500 },
    );
  }
}

// PUT - Update address
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      addressId,
      userId,
      name,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      isDefault,
    } = body;

    if (!addressId || !userId) {
      return Response.json(
        { error: "Address ID and User ID are required" },
        { status: 400 },
      );
    }

    // If this is set as default, unset all other defaults for this user
    if (isDefault) {
      await sql`
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = ${userId} AND id != ${addressId}
      `;
    }

    const [updatedAddress] = await sql`
      UPDATE user_addresses 
      SET 
        name = COALESCE(${name}, name),
        address_line1 = COALESCE(${addressLine1}, address_line1),
        address_line2 = COALESCE(${addressLine2}, address_line2),
        city = COALESCE(${city}, city),
        state = COALESCE(${state}, state),
        postal_code = COALESCE(${postalCode}, postal_code),
        is_default = COALESCE(${isDefault}, is_default),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${addressId} AND user_id = ${userId}
      RETURNING *
    `;

    if (!updatedAddress) {
      return Response.json({ error: "Address not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return Response.json(
      { error: "Failed to update address" },
      { status: 500 },
    );
  }
}

// DELETE - Delete address
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const addressId = url.searchParams.get("addressId");
    const userId = url.searchParams.get("userId");

    if (!addressId || !userId) {
      return Response.json(
        { error: "Address ID and User ID are required" },
        { status: 400 },
      );
    }

    const [deletedAddress] = await sql`
      DELETE FROM user_addresses 
      WHERE id = ${addressId} AND user_id = ${userId}
      RETURNING *
    `;

    if (!deletedAddress) {
      return Response.json({ error: "Address not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return Response.json(
      { error: "Failed to delete address" },
      { status: 500 },
    );
  }
}
