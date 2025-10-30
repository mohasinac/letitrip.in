import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/seller/sales/[id]/toggle
 * Toggle sale status between active and inactive
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
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can toggle
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();

    const { id } = params;

    // Get sale document
    const docRef = adminDb.collection("seller_sales").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Sale not found" },
        { status: 404 }
      );
    }

    const saleData = doc.data();

    // Verify ownership (unless admin)
    if (role !== "admin" && saleData?.sellerId !== uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Not your sale" },
        { status: 403 }
      );
    }

    // Toggle status
    const currentStatus = saleData?.status || "active";
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // Update status
    await docRef.update({
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: { status: newStatus },
      message: `Sale ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
    });
  } catch (error: any) {
    console.error("Error toggling sale status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle sale status" },
      { status: 500 }
    );
  }
}
