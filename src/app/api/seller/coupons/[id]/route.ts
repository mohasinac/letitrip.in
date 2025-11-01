import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";

// GET /api/seller/coupons/[id] - Get a specific coupon
export async function GET(
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

    return NextResponse.json({
      coupon: {
        id: couponDoc.id,
        ...couponData,
        createdAt: couponData.createdAt?.toDate() || new Date(),
        updatedAt: couponData.updatedAt?.toDate() || new Date(),
        startDate: couponData.startDate?.toDate() || undefined,
        endDate: couponData.endDate?.toDate() || undefined,
      },
    });
  } catch (error: any) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupon" },
      { status: 500 },
    );
  }
}

// PUT /api/seller/coupons/[id] - Update a coupon
export async function PUT(
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

    const body = await request.json();

    // Check if code is being changed and if it conflicts
    if (body.code && body.code !== couponData.code) {
      const existingCoupon = await adminDb
        .collection("coupons")
        .where("sellerId", "==", sellerId)
        .where("code", "==", body.code.toUpperCase())
        .limit(1)
        .get();

      if (!existingCoupon.empty && existingCoupon.docs[0].id !== params.id) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 409 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      code: body.code ? body.code.toUpperCase() : couponData.code,
      updatedAt: Timestamp.now(),
    };

    // Convert dates
    if (body.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(body.startDate));
    }
    if (body.endDate) {
      updateData.endDate = Timestamp.fromDate(new Date(body.endDate));
    }
    if (body.isPermanent) {
      updateData.endDate = null;
    }

    // Include advancedConfig if provided
    if (body.advancedConfig !== undefined) {
      updateData.advancedConfig = body.advancedConfig;
    }

    await adminDb
      .collection("coupons")
      .doc(params.id)
      .update(updateData);

    return NextResponse.json({ message: "Coupon updated successfully" });
  } catch (error: any) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update coupon" },
      { status: 500 },
    );
  }
}

// DELETE /api/seller/coupons/[id] - Delete a coupon
export async function DELETE(
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
      .collection("coupons")
      .doc(params.id)
      .get();

    if (!couponDoc.exists) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const couponData = couponDoc.data();
    if (couponData?.sellerId !== sellerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("coupons").doc(params.id).delete();

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
