import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/admin/products
 * List all products from all sellers with filtering, search, and pagination
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
    const role = decodedToken.role || "user";

    // Only admins can access
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const sellerId = searchParams.get("sellerId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const stockStatus = searchParams.get("stockStatus"); // inStock, outOfStock, lowStock
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query - fetch from seller_products collection
    let firestoreQuery: any = adminDb.collection("seller_products");

    // Apply filters
    if (status && status !== "all") {
      firestoreQuery = firestoreQuery.where("status", "==", status);
    }
    if (sellerId && sellerId !== "all") {
      firestoreQuery = firestoreQuery.where("sellerId", "==", sellerId);
    }
    if (category && category !== "all") {
      firestoreQuery = firestoreQuery.where("categoryId", "==", category);
    }

    // Execute query with ordering and limit
    const snapshot = await firestoreQuery.orderBy("createdAt", "desc").limit(limit * page).get();

    // Map documents to products array
    let products = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        startDate: data.startDate?.toDate?.() || data.startDate,
        expirationDate: data.expirationDate?.toDate?.() || data.expirationDate,
      };
    });

    // Apply stock status filter (client-side)
    if (stockStatus && stockStatus !== "all") {
      if (stockStatus === "outOfStock") {
        products = products.filter((p: any) => (p.quantity || p.stock || 0) === 0);
      } else if (stockStatus === "lowStock") {
        products = products.filter(
          (p: any) => (p.quantity || p.stock || 0) > 0 && (p.quantity || p.stock || 0) <= (p.lowStockThreshold || 10)
        );
      } else if (stockStatus === "inStock") {
        products = products.filter((p: any) => (p.quantity || p.stock || 0) > (p.lowStockThreshold || 10));
      }
    }

    // Apply search filter (client-side for flexibility)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (product: any) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower) ||
          product.seo?.slug?.toLowerCase().includes(searchLower)
      );
    }

    // Implement pagination on filtered results
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: products.length,
        totalPages: Math.ceil(products.length / limit),
      },
    });
  } catch (error: any) {
    console.error("Error listing admin products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new product (admin can create for any seller)
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
    const role = decodedToken.role || "user";

    // Only admins can access
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.sellerId || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, sellerId, categoryId" },
        { status: 400 }
      );
    }

    const now = new Date();
    const productData = {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      description: body.description || "",
      shortDescription: body.shortDescription || "",
      price: parseFloat(body.price) || 0,
      compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
      sku: body.sku || `SKU-${Date.now()}`,
      quantity: parseInt(body.quantity) || 0,
      stock: parseInt(body.quantity) || 0, // Alias for compatibility
      lowStockThreshold: parseInt(body.lowStockThreshold) || 10,
      weight: parseFloat(body.weight) || 0,
      weightUnit: body.weightUnit || "kg",
      categoryId: body.categoryId,
      category: body.category || body.categoryId,
      tags: body.tags || [],
      status: body.status || "draft",
      sellerId: body.sellerId,
      images: body.images || [],
      seo: body.seo || { title: body.name, description: "", keywords: [], slug: body.slug },
      stats: {
        views: 0,
        sales: 0,
        revenue: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Create product in Firestore
    const docRef = await adminDb.collection("seller_products").add(productData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...productData,
      },
      message: "Product created successfully",
    });
  } catch (error: any) {
    console.error("Error creating admin product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products (bulk delete)
 * Delete multiple products by IDs
 */
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "No product IDs provided" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    const batch = adminDb.batch();

    // Delete each product
    ids.forEach((id: string) => {
      const docRef = adminDb.collection("seller_products").doc(id);
      batch.delete(docRef);
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${ids.length} product(s) deleted successfully`,
      deletedCount: ids.length,
    });
  } catch (error: any) {
    console.error("Error bulk deleting products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete products" },
      { status: 500 }
    );
  }
}
