import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filterName, filterData, isFavorite = false } = body;

    if (!filterName || !filterData) {
      return Response.json(
        { error: "Filter name and data are required" },
        { status: 400 }
      );
    }

    // Save or update filter preference
    const [savedFilter] = await sql`
      INSERT INTO user_filter_preferences (user_id, filter_name, filter_data, is_favorite)
      VALUES (${session.user.id}, ${filterName}, ${JSON.stringify(filterData)}, ${isFavorite})
      ON CONFLICT (user_id, filter_name)
      DO UPDATE SET
        filter_data = ${JSON.stringify(filterData)},
        is_favorite = ${isFavorite},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return Response.json({
      success: true,
      data: { savedFilter }
    });

  } catch (error) {
    console.error("Save filter error:", error);
    return Response.json(
      { error: "Failed to save filter" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterId = searchParams.get('id');
    const filterName = searchParams.get('name');

    if (!filterId && !filterName) {
      return Response.json(
        { error: "Filter ID or name is required" },
        { status: 400 }
      );
    }

    let deleteQuery;
    if (filterId) {
      deleteQuery = sql`
        DELETE FROM user_filter_preferences 
        WHERE id = ${filterId} AND user_id = ${session.user.id}
        RETURNING id
      `;
    } else {
      deleteQuery = sql`
        DELETE FROM user_filter_preferences 
        WHERE filter_name = ${filterName} AND user_id = ${session.user.id}
        RETURNING id
      `;
    }

    const [deleted] = await deleteQuery;

    if (!deleted) {
      return Response.json({ error: "Filter not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "Filter deleted successfully"
    });

  } catch (error) {
    console.error("Delete filter error:", error);
    return Response.json(
      { error: "Failed to delete filter" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filterId, updates } = body;

    if (!filterId) {
      return Response.json(
        { error: "Filter ID is required" },
        { status: 400 }
      );
    }

    // Update filter
    const [updated] = await sql`
      UPDATE user_filter_preferences 
      SET 
        filter_name = COALESCE(${updates.filterName}, filter_name),
        filter_data = COALESCE(${updates.filterData ? JSON.stringify(updates.filterData) : null}, filter_data),
        is_favorite = COALESCE(${updates.isFavorite}, is_favorite),
        usage_count = CASE WHEN ${updates.incrementUsage || false} THEN usage_count + 1 ELSE usage_count END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${filterId} AND user_id = ${session.user.id}
      RETURNING *
    `;

    if (!updated) {
      return Response.json({ error: "Filter not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: { filter: updated }
    });

  } catch (error) {
    console.error("Update filter error:", error);
    return Response.json(
      { error: "Failed to update filter" },
      { status: 500 }
    );
  }
}