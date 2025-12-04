import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// A user can cancel their order if it's not yet shipped
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const { id } = await params;
    const ref = Collections.orders().doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    const order = snap.data() as any;

    if (order.user_id !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return NextResponse.json(
        { success: false, error: "Order cannot be canceled" },
        { status: 400 },
      );
    }

    const { reason } = await req.json();
    await ref.update({
      status: "canceled",
      cancel_reason: reason || "",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const updated = await ref.get();
    return NextResponse.json({
      success: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    logError(error as Error, { component: "API.orders.cancel", orderId: id });
    return NextResponse.json(
      { success: false, error: "Failed to cancel order" },
      { status: 500 },
    );
  }
}
