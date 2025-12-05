/**
 * @fileoverview TypeScript Module
 * @module src/app/api/favorites/list/[type]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";

/**
 * VALID_TYPES constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for valid types
 */
const VALID_TYPES = ["product", "shop", "category", "auction"];

// GET /api/favorites/list/[type] - Get user's favorites by type
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

/**
 * Retrieves 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ type: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The get result
 *
 * @example
 * GET(request, {});
 */
export async function GET(
  /** Request */
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

    /**
 * Performs favorites operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The favorites result
 *
 */
const favorites = resultDocs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch actual item details based on type
    const collectionGetters: Record<
      string,
      () => FirebaseFirestore.CollectionReference
    > = {
      /** Product */
      product: Collections.products,
      /** Shop */
      shop: Collections.shops,
      /** Category */
      category: Collections.categories,
      /** Auction */
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
            /** Id */
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
      /** Success */
      success: true,
      /** Data */
      data: items,
      /** Pagination */
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
