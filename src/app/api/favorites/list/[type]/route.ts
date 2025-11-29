import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";

const VALID_TYPES = ["product", "shop", "category", "auction"];

// GET /api/favorites/list/[type] - Get user's favorites by type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await params;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const startAfter = searchParams.get("startAfter");

    let query = Collections.favorites()
      .where("user_id", "==", user.id)
      .where("item_type", "==", type)
      .orderBy("created_at", "desc");

    if (startAfter) {
      const startDoc = await Collections.favorites().doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    query = query.limit(limit + 1);
    const snapshot = await query.get();
    const docs = snapshot.docs;

    const hasNextPage = docs.length > limit;
    const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

    const favorites = resultDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch actual item details based on type
    const collectionGetters: Record<
      string,
      () => FirebaseFirestore.CollectionReference
    > = {
      product: Collections.products,
      shop: Collections.shops,
      category: Collections.categories,
      auction: Collections.auctions,
    };

    const items = [];
    const getCollection = collectionGetters[type];

    if (getCollection) {
      for (const fav of favorites) {
        const itemDoc = await getCollection()
          .doc((fav as any).item_id)
          .get();

        if (itemDoc.exists) {
          items.push({
            id: itemDoc.id,
            ...itemDoc.data(),
            favorited_at: (fav as any).created_at,
          });
        }
      }
    }

    const nextCursor =
      hasNextPage && resultDocs.length > 0
        ? resultDocs[resultDocs.length - 1].id
        : null;

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("List favorites error:", error);
    return NextResponse.json(
      { error: "Failed to list favorites" },
      { status: 500 },
    );
  }
}
