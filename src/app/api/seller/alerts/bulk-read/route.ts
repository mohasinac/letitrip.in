import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/database/config";
import { doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";

/**
 * Mark multiple alerts as read
 * POST /api/seller/alerts/bulk-read
 */
export async function POST(req: NextRequest) {
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
    const { alertIds = [] } = body;

    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No alert IDs provided" },
        { status: 400 },
      );
    }

    // Firestore batch has a limit of 500 operations
    if (alertIds.length > 500) {
      return NextResponse.json(
        { success: false, error: "Maximum 500 alerts can be updated at once" },
        { status: 400 },
      );
    }

    // Verify ownership and update in batch
    const batch = writeBatch(db);
    let updatedCount = 0;

    for (const alertId of alertIds) {
      const alertRef = doc(db, "seller_alerts", alertId);
      const alertSnap = await getDoc(alertRef);

      if (!alertSnap.exists()) {
        continue; // Skip non-existent alerts
      }

      const alertData = alertSnap.data();

      // Verify ownership (unless admin)
      if (userRole !== "admin" && alertData.sellerId !== userId) {
        continue; // Skip alerts not owned by user
      }

      batch.update(alertRef, {
        isRead: true,
        readAt: new Date(),
      });

      updatedCount++;
    }

    // Commit batch
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${updatedCount} alerts marked as read`,
      updatedCount,
    });
  } catch (error: any) {
    console.error("Error bulk updating alerts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to bulk update alerts",
      },
      { status: 500 },
    );
  }
}
