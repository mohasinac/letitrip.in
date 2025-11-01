import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

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
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    // Get current coupon
    const couponDoc = await db.collection("seller_coupons").doc(id).get();
    if (!couponDoc.exists) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const couponData = couponDoc.data();
    const newStatus = !couponData?.isActive;

    // Update coupon status
    await db.collection("seller_coupons").doc(id).update({
      isActive: newStatus,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Coupon status updated successfully",
      isActive: newStatus,
    });
  } catch (error: any) {
    console.error("Error toggling coupon status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle coupon status" },
      { status: 500 }
    );
  }
}
