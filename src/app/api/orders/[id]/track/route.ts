import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Track shipment status (stub). In production, integrate with carrier API.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const awaitedParams = await params;
    id = awaitedParams.id;
    const ref = Collections.orders().doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    const order = snap.data() as any;
    const shipment = order.shipment || null;

    if (!shipment) {
      return NextResponse.json({
        success: true,
        data: { status: "pending_shipment" },
      });
    }

    // Basic derived status example
    const status = order.status === "shipped" ? "in_transit" : order.status;
    return NextResponse.json({ success: true, data: { shipment, status } });
  } catch (error) {
    logError(error as Error, {
      component: "API.orders.track",
      metadata: { orderId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to track order" },
      { status: 500 }
    );
  }
}
