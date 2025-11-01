import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * Mark alert as read/unread
 * PUT /api/seller/alerts/[id]/read
 */
export async function PUT(
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
    const { isRead = true } = body;

    // Get alert using Admin SDK
    const db = getAdminDb();
    const alertRef = db.collection("seller_alerts").doc(params.id);
    const alertSnap = await alertRef.get();

    if (!alertSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 },
      );
    }

    const alertData = alertSnap.data()!;

    // Verify ownership (unless admin)
    if (userRole !== "admin" && alertData.sellerId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Update alert
    await updateDoc(alertRef, {
      isRead,
      readAt: isRead ? new Date() : null,
    });

    return NextResponse.json({
      success: true,
      message: `Alert marked as ${isRead ? "read" : "unread"}`,
    });
  } catch (error: any) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update alert",
      },
      { status: 500 },
    );
  }
}
