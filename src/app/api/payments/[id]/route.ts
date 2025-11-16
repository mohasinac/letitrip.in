import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  requireRole,
  getUserFromRequest,
} from "@/app/api/middleware/rbac-auth";

/**
 * GET /api/payments/[id]
 * Get payment by ID
 * - Admin: Can view any payment
 * - Seller: Can view shop payments
 * - User: Can view own payments
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const paymentDoc = await Collections.payments().doc(id).get();

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    const payment = { id: paymentDoc.id, ...paymentDoc.data() };

    // Check ownership
    if (user.role === "user" && (payment as any).user_id !== user.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (user.role === "seller" && (payment as any).shop_id !== user.shopId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error("Failed to fetch payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/payments/[id]
 * Update payment (admin only)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { status, gateway_payment_id, gateway_response, notes } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updates.status = status;
    if (gateway_payment_id) updates.gateway_payment_id = gateway_payment_id;
    if (gateway_response) updates.gateway_response = gateway_response;
    if (notes) updates.notes = notes;

    await Collections.payments().doc(id).update(updates);

    const paymentDoc = await Collections.payments().doc(id).get();
    const payment = { id: paymentDoc.id, ...paymentDoc.data() };

    return NextResponse.json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error: any) {
    console.error("Failed to update payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
