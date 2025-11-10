import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { count = 3, shopId } = body;

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: "shopId is required" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: "count must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    const createdIds: string[] = [];

    // Create coupons
    for (let i = 0; i < count; i++) {
      const couponId = `TEST_COUP_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const code = `TEST_COUP_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      const discountType = Math.random() > 0.5 ? "percentage" : "fixed";
      const discountValue = discountType === "percentage"
        ? Math.floor(Math.random() * 40) + 10 // 10-50%
        : Math.floor(Math.random() * 40) + 10; // $10-$50

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 3600000); // 30 days from now

      const couponData = {
        id: couponId,
        code,
        discountType,
        discountValue,
        minPurchase: Math.floor(Math.random() * 50) + 20, // $20-$70
        maxDiscount: discountType === "percentage" ? 100 : null,
        usageLimit: Math.floor(Math.random() * 90) + 10, // 10-100
        usageCount: 0,
        shopId,
        active: true,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await db.collection("coupons").doc(couponId).set(couponData);
      createdIds.push(couponId);
    }

    return NextResponse.json({
      success: true,
      data: { ids: createdIds, count: createdIds.length },
      message: `${createdIds.length} test coupons created successfully`
    });
  } catch (error: any) {
    console.error("Error creating test coupons:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test coupons" },
      { status: 500 }
    );
  }
}
