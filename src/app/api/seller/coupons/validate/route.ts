import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { DiscountCalculator, CartItem } from "@/lib/utils/discountCalculator";
import { SellerCoupon } from "@/types";

/**
 * POST /api/seller/coupons/validate
 * Validate and calculate discount for a coupon with cart items
 * 
 * Body:
 * - couponCode: string
 * - cartItems: CartItem[]
 * - cartSubtotal: number
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { couponCode, cartItems, cartSubtotal } = body;

    if (!couponCode || !cartItems || cartSubtotal === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: couponCode, cartItems, cartSubtotal" },
        { status: 400 }
      );
    }

    // Find the coupon
    const couponSnapshot = await adminDb
      .collection("seller_coupons")
      .where("code", "==", couponCode.toUpperCase())
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (couponSnapshot.empty) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Coupon not found or inactive" 
        },
        { status: 404 }
      );
    }

    const couponDoc = couponSnapshot.docs[0];
    const couponData = couponDoc.data() as SellerCoupon;
    const coupon: SellerCoupon = {
      ...couponData,
      id: couponDoc.id,
    };

    // Check if coupon has expired
    if (!coupon.isPermanent && coupon.endDate) {
      const endDate = new Date(coupon.endDate);
      if (endDate < new Date()) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Coupon has expired" 
          },
          { status: 400 }
        );
      }
    }

    // Check if coupon has started
    if (coupon.startDate) {
      const startDate = new Date(coupon.startDate);
      if (startDate > new Date()) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Coupon is not yet active" 
          },
          { status: 400 }
        );
      }
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Coupon usage limit reached" 
        },
        { status: 400 }
      );
    }

    // Check per-user usage limits (TODO: implement tracking)
    // if (coupon.maxUsesPerUser) {
    //   const userUsageCount = await getCouponUsageCount(userId, coupon.id);
    //   if (userUsageCount >= coupon.maxUsesPerUser) {
    //     return NextResponse.json(
    //       { success: false, error: "You have reached the usage limit for this coupon" },
    //       { status: 400 }
    //     );
    //   }
    // }

    // Apply the coupon using DiscountCalculator
    const result = DiscountCalculator.applyCoupon(
      coupon,
      cartItems,
      cartSubtotal
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message || "Coupon cannot be applied"
        },
        { status: 400 }
      );
    }

    // Get human-readable description
    const description = DiscountCalculator.getCouponDescription(coupon);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: description,
      },
      discount: {
        amount: result.discountAmount,
        itemDiscounts: result.itemDiscounts,
        details: result.details,
      },
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
