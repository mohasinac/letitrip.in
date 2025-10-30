import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/seller/sales
 * List all sales for the authenticated seller with optional filtering
 */
export async function GET(request: NextRequest) {
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
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // 'active', 'inactive', 'scheduled', 'expired'
    const search = searchParams.get("search");

    // Build query
    let query = adminDb
      .collection("seller_sales")
      .where("sellerId", "==", uid);

    // Filter by status
    if (status) {
      query = query.where("status", "==", status);
    }

    // Execute query
    const snapshot = await query.orderBy("createdAt", "desc").get();

    // Map documents to sales array
    const sales = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate?.() || data.startDate,
        endDate: data.endDate?.toDate?.() || data.endDate,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });

    // Apply client-side search filter if provided
    let filteredSales = sales;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSales = sales.filter(
        (sale: any) =>
          sale.name?.toLowerCase().includes(searchLower) ||
          sale.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredSales,
    });
  } catch (error: any) {
    console.error("Error listing sales:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list sales" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/sales
 * Create a new sale
 */
export async function POST(request: NextRequest) {
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
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can create sales
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "discountType", "discountValue", "applyTo"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate discount type
    if (!["percentage", "fixed"].includes(body.discountType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid discount type. Must be 'percentage' or 'fixed'",
        },
        { status: 400 }
      );
    }

    // Validate applyTo
    if (
      !["all", "specific_products", "specific_categories"].includes(
        body.applyTo
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid applyTo value. Must be 'all', 'specific_products', or 'specific_categories'",
        },
        { status: 400 }
      );
    }

    // Validate that products/categories are provided when needed
    if (body.applyTo === "specific_products" && !body.applicableProducts?.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Products must be specified when applyTo is 'specific_products'",
        },
        { status: 400 }
      );
    }

    if (body.applyTo === "specific_categories" && !body.applicableCategories?.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Categories must be specified when applyTo is 'specific_categories'",
        },
        { status: 400 }
      );
    }

    // Prepare sale data
    const now = Timestamp.now();
    const saleData = {
      sellerId: uid,
      name: body.name,
      description: body.description || "",
      discountType: body.discountType,
      discountValue: parseFloat(body.discountValue),
      applyTo: body.applyTo,
      applicableProducts: body.applicableProducts || [],
      applicableCategories: body.applicableCategories || [],
      enableFreeShipping: body.enableFreeShipping || false,
      isPermanent: body.isPermanent || false,
      startDate: body.startDate ? Timestamp.fromDate(new Date(body.startDate)) : now,
      endDate: body.endDate ? Timestamp.fromDate(new Date(body.endDate)) : null,
      status: body.status || "active",
      stats: {
        ordersCount: 0,
        revenue: 0,
        discountGiven: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Create sale in Firestore
    const docRef = await adminDb.collection("seller_sales").add(saleData);

    // Return created sale
    const createdSale = {
      id: docRef.id,
      ...saleData,
      startDate: saleData.startDate?.toDate?.(),
      endDate: saleData.endDate?.toDate?.(),
      createdAt: saleData.createdAt.toDate(),
      updatedAt: saleData.updatedAt.toDate(),
    };

    return NextResponse.json(
      {
        success: true,
        data: createdSale,
        message: "Sale created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create sale" },
      { status: 500 }
    );
  }
}
