import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextResponse } from "next/server";

/**
 * GET /api/shops/[slug]/products
 * Fetch products for a specific shop
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // First, get the shop by slug
    const shopsSnapshot = await Collections.shops()
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    const shopDoc = shopsSnapshot.docs[0];
    const shopId = shopDoc.id;

    // Build products query
    let query = Collections.products()
      .where("shopId", "==", shopId)
      .where("status", "==", "published") as any;

    // Apply sorting
    const sortField =
      sortBy === "price"
        ? "price"
        : sortBy === "rating"
        ? "averageRating"
        : sortBy === "sales"
        ? "soldCount"
        : "createdAt";

    query = query.orderBy(sortField, sortOrder as "asc" | "desc");

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      const lastDoc = offsetSnapshot.docs.at(-1);
      if (lastDoc) {
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

    // Get total count (simplified - in production use Firestore aggregation)
    const totalSnapshot = await Collections.products()
      .where("shopId", "==", shopId)
      .where("status", "==", "published")
      .count()
      .get();

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
    logError(error as Error, {
      component: "API.shops.products",
      slug: await params.then((p) => p.slug),
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch shop products",
      },
      { status: 500 }
    );
  }
}
