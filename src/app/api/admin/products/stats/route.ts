import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/admin/products/stats
 * Get product statistics for admin dashboard
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

    // Fetch all products from seller_products collection
    const productsSnapshot = await adminDb.collection("seller_products").get();

    const allProducts = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get unique seller count
    const uniqueSellers = new Set(allProducts.map((p: any) => p.sellerId));

    // Calculate statistics
    const stats = {
      total: allProducts.length,
      active: allProducts.filter((p: any) => p.status === "active").length,
      draft: allProducts.filter((p: any) => p.status === "draft").length,
      archived: allProducts.filter((p: any) => p.status === "archived").length,
      outOfStock: allProducts.filter((p: any) => (p.quantity || p.stock || 0) === 0).length,
      lowStock: allProducts.filter(
        (p: any) =>
          (p.quantity || p.stock || 0) > 0 &&
          (p.quantity || p.stock || 0) <= (p.lowStockThreshold || 10)
      ).length,
      inStock: allProducts.filter(
        (p: any) => (p.quantity || p.stock || 0) > (p.lowStockThreshold || 10)
      ).length,
      totalValue: allProducts.reduce(
        (sum, p: any) => sum + (parseFloat(p.price) || 0) * (p.quantity || p.stock || 0),
        0
      ),
      totalRevenue: allProducts.reduce((sum, p: any) => sum + (p.stats?.revenue || 0), 0),
      totalSales: allProducts.reduce((sum, p: any) => sum + (p.stats?.sales || 0), 0),
      totalSellers: uniqueSellers.size,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error fetching product stats:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product stats" },
      { status: 500 }
    );
  }
}
