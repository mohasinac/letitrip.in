import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * Delete alert
 * DELETE /api/seller/alerts/[id]
 */
export async function DELETE(
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

    // Get alert using Admin SDK
    const db = getAdminDb();
    const alertRef = db.collection("alerts").doc(params.id);
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

    // Delete alert
    await alertRef.delete();

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete alert",
      },
      { status: 500 },
    );
  }
}
