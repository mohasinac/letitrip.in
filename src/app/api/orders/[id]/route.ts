import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/orders/[id]
 * Get single order
 * - User: Own orders only
 * - Seller: Orders for their shop
 * - Admin: All orders
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const user = await getUserFromRequest(request);
    const awaitedParams = await params;
    id = awaitedParams.id;
    const doc = await Collections.orders().doc(id).get();
    if (!doc.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );

    const orderData: any = doc.data();

    // Check access permissions
    if (user?.role === "user" && orderData.user_id !== user.uid) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    if (user?.role === "seller") {
      const owns = await userOwnsShop(orderData.shop_id, user.uid);
      if (!owns) {
        return NextResponse.json(
          { success: false, error: "Not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: doc.id, ...orderData },
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.orders.get",
      metadata: { orderId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load order" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order (seller/admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only sellers and admins can update orders" },
        { status: 403 },
      );
    }

    const awaitedParams = await params;
    id = awaitedParams.id;
    const docRef = Collections.orders().doc(id);
    const doc = await docRef.get();
    if (!doc.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );

    const order = doc.data() as any;
    if (role === "seller") {
      const owns = await userOwnsShop(order.shop_id, user.uid);
      if (!owns)
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
    }

    const body = await request.json();
    const allowed = ["status", "notes"];
    const payload: any = { updated_at: new Date().toISOString() };
    for (const k of allowed) if (k in body) payload[k] = body[k];
    await docRef.update(payload);

    const updated = await docRef.get();
    return NextResponse.json({
      success: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.orders.update",
      metadata: { orderId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 },
    );
  }
}
