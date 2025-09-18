import sql from "../utils/sql";

// GET - Fetch available delivery slots
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date"); // Optional: filter by specific date

    let deliverySlots;

    if (date) {
      // Get slots for specific date
      deliverySlots = await sql`
        SELECT 
          id,
          slot_date,
          start_time,
          end_time,
          is_available,
          max_orders,
          current_orders,
          created_at
        FROM delivery_slots 
        WHERE slot_date = ${date} 
          AND is_available = true 
          AND current_orders < max_orders
        ORDER BY slot_date ASC, start_time ASC
      `;
    } else {
      // Get available slots for next 7 days
      deliverySlots = await sql`
        SELECT 
          id,
          slot_date,
          start_time,
          end_time,
          is_available,
          max_orders,
          current_orders,
          created_at
        FROM delivery_slots 
        WHERE slot_date >= CURRENT_DATE 
          AND slot_date <= CURRENT_DATE + INTERVAL '7 days'
          AND is_available = true 
          AND current_orders < max_orders
        ORDER BY slot_date ASC, start_time ASC
        LIMIT 20
      `;
    }

    return Response.json({
      success: true,
      data: deliverySlots,
    });
  } catch (error) {
    console.error("Error fetching delivery slots:", error);
    return Response.json(
      { error: "Failed to fetch delivery slots" },
      { status: 500 },
    );
  }
}

// POST - Create new delivery slot (admin function)
export async function POST(request) {
  try {
    const body = await request.json();
    const { slotDate, startTime, endTime, maxOrders = 50 } = body;

    if (!slotDate || !startTime || !endTime) {
      return Response.json(
        { error: "Slot date, start time, and end time are required" },
        { status: 400 },
      );
    }

    // Check if slot already exists for this date and time
    const existingSlot = await sql`
      SELECT id FROM delivery_slots 
      WHERE slot_date = ${slotDate} 
        AND start_time = ${startTime} 
        AND end_time = ${endTime}
    `;

    if (existingSlot.length > 0) {
      return Response.json(
        { error: "Delivery slot already exists for this time" },
        { status: 409 },
      );
    }

    const [newSlot] = await sql`
      INSERT INTO delivery_slots (slot_date, start_time, end_time, max_orders)
      VALUES (${slotDate}, ${startTime}, ${endTime}, ${maxOrders})
      RETURNING *
    `;

    return Response.json({
      success: true,
      data: newSlot,
    });
  } catch (error) {
    console.error("Error creating delivery slot:", error);
    return Response.json(
      { error: "Failed to create delivery slot" },
      { status: 500 },
    );
  }
}

// PUT - Update delivery slot availability
export async function PUT(request) {
  try {
    const body = await request.json();
    const { slotId, isAvailable, maxOrders } = body;

    if (!slotId) {
      return Response.json({ error: "Slot ID is required" }, { status: 400 });
    }

    const [updatedSlot] = await sql`
      UPDATE delivery_slots 
      SET 
        is_available = COALESCE(${isAvailable}, is_available),
        max_orders = COALESCE(${maxOrders}, max_orders)
      WHERE id = ${slotId}
      RETURNING *
    `;

    if (!updatedSlot) {
      return Response.json(
        { error: "Delivery slot not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: updatedSlot,
    });
  } catch (error) {
    console.error("Error updating delivery slot:", error);
    return Response.json(
      { error: "Failed to update delivery slot" },
      { status: 500 },
    );
  }
}

// Initialize some default delivery slots if none exist
export async function initializeDefaultSlots() {
  try {
    const existingSlots =
      await sql`SELECT COUNT(*) as count FROM delivery_slots`;

    if (existingSlots[0].count > 0) {
      return; // Slots already exist
    }

    // Create slots for next 7 days
    const timeSlots = [
      { start: "09:00:00", end: "12:00:00" },
      { start: "12:00:00", end: "15:00:00" },
      { start: "15:00:00", end: "18:00:00" },
      { start: "18:00:00", end: "21:00:00" },
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      for (const slot of timeSlots) {
        await sql`
          INSERT INTO delivery_slots (slot_date, start_time, end_time, max_orders)
          VALUES (${dateStr}, ${slot.start}, ${slot.end}, 50)
        `;
      }
    }

    console.log("Default delivery slots created");
  } catch (error) {
    console.error("Error initializing delivery slots:", error);
  }
}

// Call initialization when this module is loaded
initializeDefaultSlots();
