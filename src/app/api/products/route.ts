import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

// Helper functions to handle both nested and flattened data structures
const getProductQuantity = (product: any): number => {
  return product.inventory?.quantity ?? product.quantity ?? 0;
};

const getProductPrice = (product: any): number => {
  return product.pricing?.price ?? product.price ?? 0;
};

const getProductCompareAtPrice = (product: any): number | undefined => {
  return product.pricing?.compareAtPrice ?? product.compareAtPrice;
};

/**
 * GET /api/products - Public product listing API
 * Query params: search, category, minPrice, maxPrice, sort, inStock, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "relevance";
    const inStockOnly = searchParams.get("inStock") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const adminDb = getAdminDb();
    let query = adminDb.collection("products").where("status", "==", "active");

    // Category filter
    if (category) {
      query = query.where("category", "==", category);
    }

    // Stock filter - Try to use Firestore query, fallback to in-memory if index not ready
    let useInMemoryStockFilter = false;
    if (inStockOnly) {
      try {
        query = query.where("quantity", ">", 0);
      } catch (error: any) {
        console.warn("Stock filter index not ready, using in-memory filtering");
        useInMemoryStockFilter = true;
      }
    }

    // Price range filter (we'll filter this in memory after fetch)
    // Firestore doesn't support multiple range queries on different fields

    // Fetch products
    let snapshot;
    try {
      snapshot = await query.get();
    } catch (error: any) {
      // If query fails due to missing index, fall back to simpler query
      if (error.code === 9 || error.message?.includes("index")) {
        console.warn("Composite index not ready, using fallback query");
        query = adminDb.collection("products").where("status", "==", "active");
        if (category) {
          query = query.where("category", "==", category);
        }
        snapshot = await query.get();
        useInMemoryStockFilter = inStockOnly;
      } else {
        throw error;
      }
    }
    
    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Apply in-memory stock filter if needed
    if (useInMemoryStockFilter && inStockOnly) {
      products = products.filter((product) => {
        const stock = getProductQuantity(product);
        return stock > 0;
      });
    }

    // Apply search filter (in memory)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchLower)
          ) ||
          product.sku?.toLowerCase().includes(searchLower)
      );
    }

    // Apply price range filter (in memory)
    if (minPrice) {
      const min = parseFloat(minPrice);
      products = products.filter((product) => getProductPrice(product) >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      products = products.filter((product) => getProductPrice(product) <= max);
    }

    // Apply sorting
    switch (sort) {
      case "price-low":
        products.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case "price-high":
        products.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case "newest":
        products.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "popular":
        products.sort(
          (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)
        );
        break;
      default:
        // relevance (default order)
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);
    const hasMore = endIndex < products.length;

    // Transform products to ensure consistent structure for frontend
    const transformedProducts = paginatedProducts.map((product) => ({
      ...product,
      // Ensure flattened fields are available for backward compatibility
      price: getProductPrice(product),
      compareAtPrice: getProductCompareAtPrice(product),
      quantity: getProductQuantity(product),
      sku: product.inventory?.sku ?? product.sku,
      lowStockThreshold: product.inventory?.lowStockThreshold ?? product.lowStockThreshold ?? 1,
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      total: products.length,
      page,
      limit,
      hasMore,
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
