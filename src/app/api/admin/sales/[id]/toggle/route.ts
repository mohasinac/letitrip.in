import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * POST /api/admin/sales/[id]/toggle
 * Toggle sale active status
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
        { success: false, error: "Sale ID is required" },
        { status: 400 }
      );
    }

    // Get current sale
    const saleDoc = await db.collection("sales").doc(id).get();
    if (!saleDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Sale not found" },
        { status: 404 }
      );
    }

    const saleData = saleDoc.data();
    const newStatus = saleData?.status === "active" ? "inactive" : "active";

    // Update sale status
    await db.collection("sales").doc(id).update({
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Sale status updated successfully",
      data: { status: newStatus },
    });
  } catch (error: any) {
    console.error("Error toggling sale status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle sale status" },
      { status: 500 }
    );
  }
}
