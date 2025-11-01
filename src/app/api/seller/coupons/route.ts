import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { SellerCoupon } from "@/types";
import { Timestamp } from "firebase-admin/firestore";

// GET /api/seller/coupons - List all coupons for the authenticated seller
export async function GET(request: NextRequest) {
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

    // Verify seller role
    const userDoc = await adminDb.collection("users").doc(sellerId).get();
    const userData = userDoc.data();
    if (
      !userData ||
      (userData.role !== "seller" && userData.role !== "admin")
    ) {
      return NextResponse.json(
        { error: "Forbidden: Seller access required" },
        { status: 403 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query
    let query = adminDb
      .collection("coupons")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc");

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const coupons: SellerCoupon[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      const coupon: SellerCoupon = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        startDate: data.startDate?.toDate() || undefined,
        endDate: data.endDate?.toDate() || undefined,
      } as SellerCoupon;

      // Filter by search if provided
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          coupon.code.toLowerCase().includes(searchLower) ||
          coupon.name?.toLowerCase().includes(searchLower)
        ) {
          coupons.push(coupon);
        }
      } else {
        coupons.push(coupon);
      }
    });

    return NextResponse.json({ coupons, total: coupons.length });
  } catch (error: any) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons" },
      { status: 500 },
    );
  }
}

// POST /api/seller/coupons - Create a new coupon
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
    const sellerId = decodedToken.uid;

    // Verify seller role
    const userDoc = await adminDb.collection("users").doc(sellerId).get();
    const userData = userDoc.data();
    if (
      !userData ||
      (userData.role !== "seller" && userData.role !== "admin")
    ) {
      return NextResponse.json(
        { error: "Forbidden: Seller access required" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.code || !body.type || body.discountValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: code, type, discountValue" },
        { status: 400 },
      );
    }

    // Check if coupon code already exists for this seller
    const existingCoupon = await adminDb
      .collection("coupons")
      .where("sellerId", "==", sellerId)
      .where("code", "==", body.code.toUpperCase())
      .limit(1)
      .get();

    if (!existingCoupon.empty) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 409 },
      );
    }

    // Prepare coupon data
    const now = Timestamp.now();
    const couponData: any = {
      sellerId,
      code: body.code.toUpperCase(),
      name: body.name || "",
      description: body.description || "",
      type: body.type,
      discountValue: body.discountValue,
      maxDiscountAmount: body.maxDiscountAmount || null,
      minOrderAmount: body.minOrderAmount || 0,
      maxTotalUses: body.maxTotalUses || null,
      maxUsesPerUser: body.maxUsesPerUser || null,
      currentUsageCount: 0,
      applicableProducts: body.applicableProducts || [],
      applicableCategories: body.applicableCategories || [],
      excludedProducts: body.excludedProducts || [],
      excludedCategories: body.excludedCategories || [],
      firstTimeOnly: body.firstTimeOnly || false,
      newCustomersOnly: body.newCustomersOnly || false,
      existingCustomersOnly: body.existingCustomersOnly || false,
      minQuantity: body.minQuantity || null,
      maxQuantity: body.maxQuantity || null,
      allowedPaymentMethods: body.allowedPaymentMethods || [],
      allowedUserEmails: body.allowedUserEmails || [],
      excludedUserEmails: body.excludedUserEmails || [],
      canStackWithOthers:
        body.canStackWithOthers !== undefined ? body.canStackWithOthers : true,
      priority: body.priority || 5,
      startDate: body.startDate
        ? Timestamp.fromDate(new Date(body.startDate))
        : null,
      endDate: body.isPermanent
        ? null
        : body.endDate
          ? Timestamp.fromDate(new Date(body.endDate))
          : null,
      isPermanent: body.isPermanent || false,
      status: body.status || "active",
      
      // Advanced Discount Configuration
      advancedConfig: body.advancedConfig || null,
      
      createdAt: now,
      updatedAt: now,
    };

    // Create coupon
    const docRef = await adminDb.collection("coupons").add(couponData);
    const newCoupon = await docRef.get();

    return NextResponse.json(
      {
        message: "Coupon created successfully",
        coupon: { id: newCoupon.id, ...newCoupon.data() },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create coupon" },
      { status: 500 },
    );
  }
}
