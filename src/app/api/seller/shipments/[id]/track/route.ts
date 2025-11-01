import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Add tracking update to shipment
 * POST /api/seller/shipments/[id]/track
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

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.uid;
    const userRole = (decoded as any).role || "user";

    const body = await req.json();
    const { status, location, description } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 },
      );
    }

    // Get shipment using Admin SDK
    const db = getAdminDb();
    const shipmentRef = db.collection("shipments").doc(params.id);
    const shipmentSnap = await shipmentRef.get();

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

    // Create tracking event
    const trackingEvent = {
      status,
      location: location || "",
      description: description || `Shipment ${status.replace(/_/g, " ")}`,
      timestamp: new Date(),
    };

    // Update shipment
    const updateData: any = {
      status,
      updatedAt: new Date(),
      trackingHistory: FieldValue.arrayUnion(trackingEvent),
    };

    // Update specific timestamps based on status
    if (status === "in_transit" && !shipmentData.shippedAt) {
      updateData.shippedAt = new Date();
    } else if (status === "delivered" && !shipmentData.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    await shipmentRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Tracking updated successfully",
      data: trackingEvent,
    });
  } catch (error: any) {
    console.error("Error updating tracking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update tracking",
      },
      { status: 500 },
    );
  }
}
