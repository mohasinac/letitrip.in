import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * POST /api/admin/shipments/[id]/track
 * Update tracking information for a shipment
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
    const shipmentDoc = await db.collection("shipments").doc(id).get();
    if (!shipmentDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Shipment not found" },
        { status: 404 }
      );
    }

    const shipmentData = shipmentDoc.data();

    // TODO: Integrate with actual shipping carrier API (Shiprocket, etc.)
    // For now, just update the timestamp
    await db.collection("shipments").doc(id).update({
      updatedAt: new Date().toISOString(),
      lastTracked: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Tracking updated successfully",
    });
  } catch (error: any) {
    console.error("Error tracking shipment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update tracking" },
      { status: 500 }
    );
  }
}
