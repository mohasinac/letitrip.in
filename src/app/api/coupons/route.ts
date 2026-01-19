/**
 * Coupons API Routes
 *
 * Handles coupon listing, validation, and creation.
 * Supports both global (Admin) and shop-specific (Seller) coupons.
 *
 * @route GET /api/coupons - List available coupons
 * @route POST /api/coupons - Create coupon (Admin/Seller)
 * @route POST /api/coupons/validate - Validate coupon code
 *
 * @example
 * ```tsx
 * // List coupons
 * const response = await fetch('/api/coupons?shopSlug=my-shop');
 *
 * // Create coupon
 * const response = await fetch('/api/coupons', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     code: 'SAVE20',
 *     type: 'percentage',
 *     value: 20,
 *     ...
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/coupons
 *
 * List available coupons.
 *
 * Query Parameters:
 * - shopSlug: Filter by shop slug (omit for global coupons)
 * - status: Filter by status (active/expired/disabled)
 * - limit: Results per page (default 20, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopSlug = searchParams.get("shopSlug");
    const status = searchParams.get("status") || "active";
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );

    // Build query constraints
    const constraints: any[] = [];

    // Filter by shop or global
    if (shopSlug) {
      constraints.push(where("shopSlug", "==", shopSlug));
    } else {
      constraints.push(where("scope", "==", "global"));
    }

    // Filter by status
    if (status === "active") {
      constraints.push(where("status", "==", "active"));
      constraints.push(where("validUntil", ">=", Timestamp.now()));
    } else if (status) {
      constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("validUntil", "desc"));
    constraints.push(limit(pageLimit));

    // Execute query
    const couponsQuery = query(collection(db, "coupons"), ...constraints);
    const querySnapshot = await getDocs(couponsQuery);

    const coupons = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          coupons,
          count: coupons.length,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons", details: error.message },
      { status: 500 },
    );
  }
}

interface CreateCouponRequest {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  scope: "global" | "shop";
  shopSlug?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  userLimit?: number;
  validFrom: string;
  validUntil: string;
  description?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

/**
 * POST /api/coupons
 *
 * Create a new coupon.
 * Admin can create global coupons, Sellers can create shop-specific.
 *
 * Request Body:
 * - code: Coupon code (required, unique, uppercase)
 * - type: Discount type (percentage/fixed) (required)
 * - value: Discount value (required)
 * - scope: Coupon scope (global/shop) (required)
 * - shopSlug: Shop slug (required if scope=shop)
 * - minOrderValue: Minimum order value (optional)
 * - maxDiscount: Maximum discount amount (optional)
 * - usageLimit: Total usage limit (optional)
 * - userLimit: Per-user usage limit (optional)
 * - validFrom: Start date (required, ISO string)
 * - validUntil: End date (required, ISO string)
 * - description: Coupon description (optional)
 * - applicableCategories: Category slugs (optional)
 * - applicableProducts: Product slugs (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCouponRequest = await request.json();
    const {
      code,
      type,
      value,
      scope,
      shopSlug,
      minOrderValue = 0,
      maxDiscount,
      usageLimit,
      userLimit = 1,
      validFrom,
      validUntil,
      description,
      applicableCategories = [],
      applicableProducts = [],
    } = body;

    // Validate required fields
    if (!code || !type || !value || !scope || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate scope and shopSlug
    if (scope === "shop" && !shopSlug) {
      return NextResponse.json(
        { error: "shopSlug is required for shop-scoped coupons" },
        { status: 400 },
      );
    }

    // Validate value
    if (type === "percentage" && (value <= 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 0 and 100" },
        { status: 400 },
      );
    }

    if (type === "fixed" && value <= 0) {
      return NextResponse.json(
        { error: "Fixed value must be greater than 0" },
        { status: 400 },
      );
    }

    // Normalize code to uppercase
    const normalizedCode = code.toUpperCase();

    // Check if code already exists
    const existingCouponQuery = query(
      collection(db, "coupons"),
      where("code", "==", normalizedCode),
    );
    const existingCoupons = await getDocs(existingCouponQuery);

    if (!existingCoupons.empty) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 409 },
      );
    }

    // Parse dates
    const validFromDate = Timestamp.fromDate(new Date(validFrom));
    const validUntilDate = Timestamp.fromDate(new Date(validUntil));

    // Create coupon document
    const couponData = {
      code: normalizedCode,
      type,
      value,
      scope,
      shopSlug: scope === "shop" ? shopSlug : null,
      minOrderValue,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      userLimit,
      validFrom: validFromDate,
      validUntil: validUntilDate,
      description: description || "",
      applicableCategories,
      applicableProducts,
      status: "active",
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "coupons"), couponData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...couponData,
        },
        message: "Coupon created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating coupon:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to create coupon" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create coupon", details: error.message },
      { status: 500 },
    );
  }
}
