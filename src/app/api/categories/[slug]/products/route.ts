import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * GET /api/categories/[slug]/products
 * Fetch products in a category (includes subcategories if specified)
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
    const includeSubcategories =
      searchParams.get("includeSubcategories") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // First, get the category by slug
    const categoriesSnapshot = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const categoryDoc = categoriesSnapshot.docs[0];
    const categoryId = categoryDoc.id;

    let categoryIds = [categoryId];

    // If including subcategories, fetch them
    if (includeSubcategories) {
      const subcategoriesSnapshot = await Collections.categories()
        .where("parentId", "==", categoryId)
        .get();

      const subIds = subcategoriesSnapshot.docs.map((doc: any) => doc.id);
      categoryIds = [...categoryIds, ...subIds];
    }

    // Build products query
    let query = Collections.products().where(
      "status",
      "==",
      "published",
    ) as any;

    // Filter by category IDs (Firestore has limit of 10 for 'in' operator)
    if (categoryIds.length <= 10) {
      query = query.where("categoryId", "in", categoryIds);
    } else {
      // Fallback to just the main category if too many subcategories
      query = query.where("categoryId", "==", categoryId);
    }

    // Apply sorting
    const sortField =
      sortBy === "price"
        ? "price"
        : sortBy === "rating"
          ? "averageRating"
          : sortBy === "sales"
            ? "soldCount"
            : sortBy === "views"
              ? "viewCount"
              : "createdAt";

    query = query.orderBy(sortField, sortOrder as "asc" | "desc");

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    query = query.limit(limit);

    // Execute query
    const productsSnapshot = await query.get();

    const products = productsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count
    let countQuery = Collections.products().where(
      "status",
      "==",
      "published",
    ) as any;

    if (categoryIds.length <= 10) {
      countQuery = countQuery.where("categoryId", "in", categoryIds);
    } else {
      countQuery = countQuery.where("categoryId", "==", categoryId);
    }

    const totalSnapshot = await countQuery.count().get();
    const total = totalSnapshot.data().count;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
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
