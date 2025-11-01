import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * Get shipment details
 * GET /api/seller/shipments/[id]
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

    // Format dates
    const shipment = {
      id: shipmentSnap.id,
      ...shipmentData,
      createdAt: shipmentData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: shipmentData.updatedAt?.toDate?.()?.toISOString() || null,
      shippedAt: shipmentData.shippedAt?.toDate?.()?.toISOString() || null,
      deliveredAt: shipmentData.deliveredAt?.toDate?.()?.toISOString() || null,
      trackingHistory: (shipmentData.trackingHistory || []).map(
        (event: any) => ({
          ...event,
          timestamp:
            event.timestamp?.toDate?.()?.toISOString() || event.timestamp,
        }),
      ),
    };

    return NextResponse.json({
      success: true,
      data: shipment,
    });
  } catch (error: any) {
    console.error("Error fetching shipment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch shipment",
      },
      { status: 500 },
    );
  }
}
