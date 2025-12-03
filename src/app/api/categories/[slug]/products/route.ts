import { NextResponse } from "next/server";
import { getCategoryIdsForQuery } from "@/lib/category-hierarchy";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { toFEProductCards } from "@/types/transforms/product.transforms";
import type { ProductListItemBE } from "@/types/backend/product.types";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /api/categories/[slug]/products
 * Fetch products in a category (includes all subcategories hierarchically)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const db = getFirestoreAdmin();

    // Get the category by slug
    const categorySnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (categorySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const categoryDoc = categorySnapshot.docs[0];
    const category = { id: categoryDoc.id, ...categoryDoc.data() };

    // ALWAYS get all descendant categories (children, grandchildren, etc.)
    // This ensures that products in ANY subcategory are shown
    const categoryIds = await getCategoryIdsForQuery(category.id);

    // Fetch products from all categories in batches (Firestore 'in' limit = 10)
    const batchSize = 10;
    let allProducts: ProductListItemBE[] = [];

    console.log(
      `Fetching products for category ${slug} (${categoryIds.length} categories including descendants)`,
    );

    for (let i = 0; i < categoryIds.length; i += batchSize) {
      const batch = categoryIds.slice(i, i + batchSize);

      const productsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("category_id", "in", batch)
        .where("status", "==", "published")
        .get();

      const batchProducts = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductListItemBE[];

      allProducts.push(...batchProducts);
    }

    // Apply sorting field mapping
    const sortField =
      sortBy === "price"
        ? "price"
        : sortBy === "rating"
          ? "average_rating"
          : sortBy === "sales"
            ? "sales_count"
            : sortBy === "views"
              ? "view_count"
              : "created_at";

    // Apply client-side sorting (since we fetched from multiple batches)
    allProducts.sort((a, b) => {
      const aVal = (a as any)[sortField] || 0;
      const bVal = (b as any)[sortField] || 0;

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    // Apply client-side pagination
    const total = allProducts.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    // Transform to FE types for response
    const productsForResponse = toFEProductCards(paginatedProducts);

    return NextResponse.json({
      success: true,
      data: productsForResponse,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        categoryId: category.id,
        categorySlug: slug,
        descendantCategoryCount: categoryIds.length - 1, // Exclude self
        totalCategoriesSearched: categoryIds.length,
      },
    });
  } catch (error: any) {
    console.error("Category products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch category products",
      },
      { status: 500 },
    );
  }
}
