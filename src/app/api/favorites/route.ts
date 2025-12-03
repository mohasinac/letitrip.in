import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { getCurrentUser } from "@/app/api/lib/session";
import {
  parseSieveQuery,
  favoritesSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";

// Extended Sieve config with field mappings for favorites
const favoritesConfig = {
  ...favoritesSieveConfig,
  fieldMappings: {
    userId: "user_id",
    itemId: "product_id",
    createdAt: "created_at",
  } as Record<string, string>,
};

/**
 * GET /api/favorites
 * Get user's favorites with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt
 */
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const searchParams = req.nextUrl.searchParams;

    // Get user from session
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }
    const userId = user.id;

    // Parse Sieve query
    const {
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, favoritesConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: errors,
        },
        { status: 400 },
      );
    }

    let query: FirebaseFirestore.Query = db
      .collection(COLLECTIONS.FAVORITES)
      .where("user_id", "==", userId);

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField =
        favoritesConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(
          dbField,
          filter.operator as FirebaseFirestore.WhereFilterOp,
          filter.value,
        );
      }
    }

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = favoritesConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("created_at", "desc");
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;

    // Apply pagination
    const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0) {
      const skipSnapshot = await query.limit(offset).get();
      const lastDoc = skipSnapshot.docs.at(-1);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    const favorites = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get product details for each favorite (batch approach)
    const productIds = favorites.map((fav: any) => fav.product_id);
    const products = [];

    for (const productId of productIds) {
      const productDoc = await db
        .collection(COLLECTIONS.PRODUCTS)
        .doc(productId)
        .get();
      if (productDoc.exists) {
        const favorite = favorites.find((f: any) => f.product_id === productId);
        products.push({
          id: productDoc.id,
          ...productDoc.data(),
          favorited_at: favorite ? (favorite as any).created_at : null,
        });
      }
    }

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      success: true,
      data: products,
      pagination,
      meta: {
        appliedFilters: sieveQuery.filters,
        appliedSorts: sieveQuery.sorts,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}

// POST /api/favorites - Add to favorites
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();

    // Get user from session
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }
    const userId = user.id;

    if (!body.product_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Check if already favorited
    const existing = await db
      .collection(COLLECTIONS.FAVORITES)
      .where("user_id", "==", userId)
      .where("product_id", "==", body.product_id)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "Product already in favorites" },
        { status: 400 },
      );
    }

    // Add to favorites
    const favoriteData = {
      user_id: userId,
      product_id: body.product_id,
      created_at: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTIONS.FAVORITES).add(favoriteData);

    return NextResponse.json(
      {
        id: docRef.id,
        ...favoriteData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 },
    );
  }
}
