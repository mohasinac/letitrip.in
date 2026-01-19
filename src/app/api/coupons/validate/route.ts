/**
 * Coupon Validation API Route
 *
 * Validates coupon codes and returns discount details.
 *
 * @route POST /api/coupons/validate - Validate coupon code
 *
 * @example
 * ```tsx
 * // Validate coupon
 * const response = await fetch('/api/coupons/validate', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     code: 'SAVE20',
 *     userId: 'user-id',
 *     orderValue: 1000,
 *     shopSlug: 'my-shop',
 *     ...
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface ValidateCouponRequest {
  code: string;
  userId: string;
  orderValue: number;
  shopSlug?: string;
  categorySlug?: string;
  productSlugs?: string[];
}

/**
 * POST /api/coupons/validate
 *
 * Validate a coupon code and calculate discount.
 *
 * Request Body:
 * - code: Coupon code (required)
 * - userId: User ID (required)
 * - orderValue: Order total value (required)
 * - shopSlug: Shop slug (optional, for shop-specific coupons)
 * - categorySlug: Category slug (optional)
 * - productSlugs: Product slugs array (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body: ValidateCouponRequest = await request.json();
    const {
      code,
      userId,
      orderValue,
      shopSlug,
      categorySlug,
      productSlugs = [],
    } = body;

    // Validate required fields
    if (!code || !userId || orderValue === undefined) {
      return NextResponse.json(
        { error: "code, userId, and orderValue are required" },
        { status: 400 },
      );
    }

    // Normalize code
    const normalizedCode = code.toUpperCase();

    // Query coupon by code
    const couponQuery = query(
      collection(db, "coupons"),
      where("code", "==", normalizedCode),
      where("status", "==", "active"),
    );

    const querySnapshot = await getDocs(couponQuery);

    if (querySnapshot.empty) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid or expired coupon code",
        },
        { status: 200 },
      );
    }

    const couponDoc = querySnapshot.docs[0];
    const coupon = couponDoc.data();

    // Check validity dates
    const now = Timestamp.now();
    if (coupon.validFrom > now) {
      return NextResponse.json(
        {
          valid: false,
          error: "Coupon is not yet valid",
        },
        { status: 200 },
      );
    }

    if (coupon.validUntil < now) {
      return NextResponse.json(
        {
          valid: false,
          error: "Coupon has expired",
        },
        { status: 200 },
      );
    }

    // Check scope (global vs shop-specific)
    if (coupon.scope === "shop") {
      if (!shopSlug || coupon.shopSlug !== shopSlug) {
        return NextResponse.json(
          {
            valid: false,
            error: "This coupon is not valid for this shop",
          },
          { status: 200 },
        );
      }
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order value of ₹${coupon.minOrderValue} required`,
        },
        { status: 200 },
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        {
          valid: false,
          error: "Coupon usage limit reached",
        },
        { status: 200 },
      );
    }

    // Check user-specific usage limit
    const userUsageQuery = query(
      collection(db, "couponUsage"),
      where("couponId", "==", couponDoc.id),
      where("userId", "==", userId),
    );
    const userUsageSnapshot = await getDocs(userUsageQuery);
    const userUsageCount = userUsageSnapshot.size;

    if (coupon.userLimit && userUsageCount >= coupon.userLimit) {
      return NextResponse.json(
        {
          valid: false,
          error: "You have already used this coupon",
        },
        { status: 200 },
      );
    }

    // Check category restrictions
    if (
      coupon.applicableCategories &&
      coupon.applicableCategories.length > 0 &&
      categorySlug
    ) {
      if (!coupon.applicableCategories.includes(categorySlug)) {
        return NextResponse.json(
          {
            valid: false,
            error: "Coupon not valid for this category",
          },
          { status: 200 },
        );
      }
    }

    // Check product restrictions
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const hasApplicableProduct = productSlugs.some((slug) =>
        coupon.applicableProducts.includes(slug),
      );
      if (!hasApplicableProduct) {
        return NextResponse.json(
          {
            valid: false,
            error: "Coupon not valid for these products",
          },
          { status: 200 },
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (orderValue * coupon.value) / 100;
    } else if (coupon.type === "fixed") {
      discountAmount = coupon.value;
    }

    // Apply max discount cap
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    // Ensure discount doesn't exceed order value
    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }

    return NextResponse.json(
      {
        valid: true,
        coupon: {
          id: couponDoc.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description,
        },
        discount: {
          amount: discountAmount,
          finalTotal: orderValue - discountAmount,
        },
        message: "Coupon applied successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon", details: error.message },
      { status: 500 },
    );
  }
}
