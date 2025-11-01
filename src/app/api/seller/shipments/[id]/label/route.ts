import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * Get shipping label
 * GET /api/seller/shipments/[id]/label
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.uid;
    const userRole = (decoded as any).role || "user";

    // Get shipment using Admin SDK
    const db = getAdminDb();
    const shipmentSnap = await db
      .collection("shipments")
      .doc(params.id)
      .get();

    if (!shipmentSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Shipment not found" },
        { status: 404 },
      );
    }

    const shipmentData = shipmentSnap.data()!;

    // Verify ownership (unless admin)
    if (userRole !== "admin" && shipmentData.sellerId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Check if label exists
    if (!shipmentData.shippingLabel) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipping label not yet generated",
        },
        { status: 404 },
      );
    }

    // Return label URL (or generate if not exists)
    return NextResponse.json({
      success: true,
      data: {
        labelUrl: shipmentData.shippingLabel,
        trackingNumber: shipmentData.trackingNumber,
        carrier: shipmentData.carrier,
      },
    });
  } catch (error: any) {
    console.error("Error fetching shipping label:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch shipping label",
      },
      { status: 500 },
    );
  }
}
