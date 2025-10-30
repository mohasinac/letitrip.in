import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/database/config";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

/**
 * Cancel shipment
 * POST /api/seller/shipments/[id]/cancel
 */
export async function POST(
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    const body = await req.json();
    const { reason } = body;

    // Get shipment
    const shipmentRef = doc(db, "seller_shipments", params.id);
    const shipmentSnap = await getDoc(shipmentRef);

    if (!shipmentSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "Shipment not found" },
        { status: 404 },
      );
    }

    const shipmentData = shipmentSnap.data();

    // Verify ownership (unless admin)
    if (userRole !== "admin" && shipmentData.sellerId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Check if shipment can be cancelled
    const cancelableStatuses = ["pending", "pickup_scheduled"];
    if (!cancelableStatuses.includes(shipmentData.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipment cannot be cancelled at this stage",
        },
        { status: 400 },
      );
    }

    // Create tracking event
    const trackingEvent = {
      status: "cancelled",
      location: "",
      description: reason || "Shipment cancelled by seller",
      timestamp: new Date(),
    };

    // Update shipment
    await updateDoc(shipmentRef, {
      status: "cancelled",
      cancelReason: reason,
      updatedAt: new Date(),
      trackingHistory: arrayUnion(trackingEvent),
    });

    // TODO: Update related order status if needed

    return NextResponse.json({
      success: true,
      message: "Shipment cancelled successfully",
    });
  } catch (error: any) {
    console.error("Error cancelling shipment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cancel shipment",
      },
      { status: 500 },
    );
  }
}
