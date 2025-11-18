import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

// GET /api/favorites - Get user's favorites
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const searchParams = req.nextUrl.searchParams;

    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // TODO: Get user_id from session
    const userId = req.headers.get("x-user-id") || "demo-user";

    let query = db
      .collection(COLLECTIONS.FAVORITES)
      .where("user_id", "==", userId)
      .orderBy("created_at", sortOrder);

    // Execute paginated query
    const response = await executeCursorPaginatedQuery(
      query,
      searchParams,
      (id) => db.collection(COLLECTIONS.FAVORITES).doc(id).get(),
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      }),
      50, // defaultLimit
      200 // maxLimit
    );

    const favorites = response.data;

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

    return NextResponse.json({
      ...response,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add to favorites
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();

    // TODO: Get user_id from session
    const userId = req.headers.get("x-user-id") || "demo-user";

    if (!body.product_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
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
        { status: 400 }
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
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}
