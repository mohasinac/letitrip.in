import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/database/config";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    // Get alert
    const alertRef = doc(db, "seller_alerts", params.id);
    const alertSnap = await getDoc(alertRef);

    if (!alertSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 },
      );
    }

    const alertData = alertSnap.data();

    // Verify ownership (unless admin)
    if (userRole !== "admin" && alertData.sellerId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Delete alert
    await deleteDoc(alertRef);

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
