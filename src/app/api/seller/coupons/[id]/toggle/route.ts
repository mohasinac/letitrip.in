import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";

// POST /api/seller/coupons/[id]/toggle - Toggle coupon active/inactive status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const decodedToken = await adminAuth.verifyIdToken(token);
    const sellerId = decodedToken.uid;

    const couponDoc = await adminDb
      .collection("seller_coupons")
      .doc(params.id)
      .get();

    if (!couponDoc.exists) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const couponData = couponDoc.data();
    if (couponData?.sellerId !== sellerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentStatus = couponData.status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    await adminDb.collection("seller_coupons").doc(params.id).update({
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      message: `Coupon ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error("Error toggling coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle coupon" },
      { status: 500 },
    );
  }
}
