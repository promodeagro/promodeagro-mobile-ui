import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    
    const paymentMethods = await sql`
      SELECT 
        id, payment_type, masked_details, is_default, 
        metadata, created_at, last_used_at, usage_count
      FROM saved_payment_methods 
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, last_used_at DESC NULLS LAST, created_at DESC
    `;

    return Response.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch payment methods'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { 
      payment_type, 
      masked_details, 
      gateway_token, 
      is_default, 
      metadata = {} 
    } = body;

    // Validate required fields
    if (!payment_type || !masked_details) {
      return Response.json({
        success: false,
        error: 'Payment type and masked details are required'
      }, { status: 400 });
    }

    const result = await sql.transaction(async (txn) => {
      // If this is being set as default, remove default from others
      if (is_default) {
        await txn`
          UPDATE saved_payment_methods 
          SET is_default = false 
          WHERE user_id = ${userId}
        `;
      }

      // Insert new payment method
      const [paymentMethod] = await txn`
        INSERT INTO saved_payment_methods (
          user_id, payment_type, masked_details, gateway_token, 
          is_default, metadata
        )
        VALUES (
          ${userId}, ${payment_type}, ${masked_details}, ${gateway_token}, 
          ${is_default || false}, ${JSON.stringify(metadata)}
        )
        RETURNING *
      `;

      return paymentMethod;
    });

    return Response.json({
      success: true,
      data: result,
      message: 'Payment method saved successfully'
    });

  } catch (error) {
    console.error('Error saving payment method:', error);
    return Response.json({
      success: false,
      error: 'Failed to save payment method'
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { id, is_default, metadata } = body;

    if (!id) {
      return Response.json({
        success: false,
        error: 'Payment method ID is required'
      }, { status: 400 });
    }

    const result = await sql.transaction(async (txn) => {
      // Check if payment method belongs to user
      const [existing] = await txn`
        SELECT id FROM saved_payment_methods 
        WHERE id = ${id} AND user_id = ${userId}
      `;

      if (!existing) {
        throw new Error('Payment method not found');
      }

      // If setting as default, remove default from others
      if (is_default) {
        await txn`
          UPDATE saved_payment_methods 
          SET is_default = false 
          WHERE user_id = ${userId} AND id != ${id}
        `;
      }

      // Update payment method
      const [updated] = await txn`
        UPDATE saved_payment_methods 
        SET 
          is_default = COALESCE(${is_default}, is_default),
          metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}, metadata),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      return updated;
    });

    return Response.json({
      success: true,
      data: result,
      message: 'Payment method updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment method:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to update payment method'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({
        success: false,
        error: 'Payment method ID is required'
      }, { status: 400 });
    }

    const result = await sql.transaction(async (txn) => {
      // Check if payment method belongs to user and get details
      const [existing] = await txn`
        SELECT id, is_default FROM saved_payment_methods 
        WHERE id = ${id} AND user_id = ${userId}
      `;

      if (!existing) {
        throw new Error('Payment method not found');
      }

      // Delete the payment method
      await txn`
        DELETE FROM saved_payment_methods 
        WHERE id = ${id} AND user_id = ${userId}
      `;

      // If this was the default method, set another as default
      if (existing.is_default) {
        await txn`
          UPDATE saved_payment_methods 
          SET is_default = true 
          WHERE user_id = ${userId} 
          ORDER BY last_used_at DESC NULLS LAST, created_at DESC 
          LIMIT 1
        `;
      }

      return { deleted: true };
    });

    return Response.json({
      success: true,
      data: result,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment method:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to delete payment method'
    }, { status: 500 });
  }
}