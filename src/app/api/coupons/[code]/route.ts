import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";

// GET /api/coupons/[code] - Public if active, owner/admin otherwise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser(request);
    const role = user?.role || "guest";

    const snapshot = await Collections.coupons()
      .where("code", "==", code)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 },
      );
    }
    const doc = snapshot.docs[0];
    const data: any = { id: doc.id, ...doc.data() };

    if ((role === "guest" || role === "user") && !data.is_active) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupon" },
      { status: 500 },
    );
  }
}

// PATCH /api/coupons/[code] - Update by code (owner/admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const role = user.role;
    const { code } = await params;

    const snapshot = await Collections.coupons()
      .where("code", "==", code)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 },
      );
    }

    const doc = snapshot.docs[0];
    const coupon: any = { id: doc.id, ...doc.data() };

    if (role === "seller") {
      const ownsShop = await userOwnsShop(coupon.shop_id, user.id);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    const body = await request.json();
    const update: any = { ...body, updated_at: new Date().toISOString() };
    delete update.id;
    delete update.shop_id;
    delete update.code;
    delete update.created_at;

    await Collections.coupons().doc(coupon.id).update(update);
    const updated = await Collections.coupons().doc(coupon.id).get();
    return NextResponse.json({
      success: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update coupon" },
      { status: 500 },
    );
  }
}

// DELETE /api/coupons/[code] - Delete (owner/admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const role = user.role;
    const { code } = await params;

    const snapshot = await Collections.coupons()
      .where("code", "==", code)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 },
      );
    }

    const doc = snapshot.docs[0];
    const coupon: any = { id: doc.id, ...doc.data() };

    if (role === "seller") {
      const ownsShop = await userOwnsShop(coupon.shop_id, user.id);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    await Collections.coupons().doc(coupon.id).delete();
    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
