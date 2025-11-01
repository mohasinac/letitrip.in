import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * POST /api/admin/shipments/[id]/cancel
 * Cancel a shipment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || "user";

    // Only admins can access
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const db = getAdminDb();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Shipment ID is required" },
        { status: 400 }
      );
    }

    // Get shipment
    const shipmentDoc = await db.collection("seller_shipments").doc(id).get();
    if (!shipmentDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Shipment not found" },
        { status: 404 }
      );
    }

    const shipmentData = shipmentDoc.data();

    // Only allow cancellation of pending shipments
    if (shipmentData?.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Only pending shipments can be cancelled" },
        { status: 400 }
      );
    }

    // TODO: Integrate with actual shipping carrier API to cancel
    // For now, just update the status
    await db.collection("seller_shipments").doc(id).update({
      status: "failed",
      updatedAt: new Date().toISOString(),
      cancelledAt: new Date().toISOString(),
      cancelledBy: decodedToken.uid,
    });

    return NextResponse.json({
      success: true,
      message: "Shipment cancelled successfully",
    });
  } catch (error: any) {
    console.error("Error cancelling shipment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel shipment" },
      { status: 500 }
    );
  }
}
