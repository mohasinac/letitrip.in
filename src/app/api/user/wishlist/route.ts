/**
 * Wishlist API Routes
 *
 * Manage user's wishlist (saved products and auctions).
 * Uses session for authentication.
 *
 * @route GET /api/user/wishlist - Get wishlist items (requires auth)
 * @route POST /api/user/wishlist - Add to wishlist (requires auth)
 *
 * @example
 * ```tsx
 * // Get wishlist
 * const response = await fetch('/api/user/wishlist');
 *
 * // Add to wishlist
 * const response = await fetch('/api/user/wishlist', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     itemId: 'product-slug',
 *     itemType: 'product' // or 'auction'
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface WishlistItem {
  userId: string;
  itemId: string;
  itemType: "product" | "auction";
  itemSlug: string;
  addedAt: any;
}

/**
 * GET - Get current user's wishlist
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    // Query wishlist items
    const wishlistQuery = query(
      collection(db, "wishlist"),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(wishlistQuery);

    // Fetch full item details
    const wishlistItems = await Promise.all(
      querySnapshot.docs.map(async (wishlistDoc) => {
        const wishlistData = wishlistDoc.data();
        const collectionName =
          wishlistData.itemType === "product" ? "products" : "auctions";

        // Get item details
        const itemDoc = await getDoc(
          doc(db, collectionName, wishlistData.itemSlug),
        );

        if (!itemDoc.exists()) {
          return null; // Item no longer exists
        }

        const itemData = itemDoc.data();

        return {
          id: wishlistDoc.id,
          itemType: wishlistData.itemType,
          addedAt: wishlistData.addedAt,
          item: {
            id: itemDoc.id,
            slug: wishlistData.itemSlug,
            name: itemData.title || itemData.name,
            price:
              wishlistData.itemType === "product"
                ? itemData.price
                : itemData.currentBid || itemData.startingBid,
            images: itemData.images || [],
            status: itemData.status,
          },
        };
      }),
    );

    // Filter out null items (deleted products/auctions)
    const validItems = wishlistItems.filter((item) => item !== null);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: validItems,
          count: validItems.length,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch wishlist",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Add item to wishlist
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const body = await request.json();
    const { itemId, itemType } = body;

    // Validate required fields
    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: "Item ID and type are required" },
        { status: 400 },
      );
    }

    if (itemType !== "product" && itemType !== "auction") {
      return NextResponse.json(
        { error: "Item type must be 'product' or 'auction'" },
        { status: 400 },
      );
    }

    // Check if item exists
    const collectionName = itemType === "product" ? "products" : "auctions";
    const itemDoc = await getDoc(doc(db, collectionName, itemId));

    if (!itemDoc.exists()) {
      return NextResponse.json(
        { error: `${itemType} not found` },
        { status: 404 },
      );
    }

    // Check if already in wishlist
    const existingQuery = query(
      collection(db, "wishlist"),
      where("userId", "==", userId),
      where("itemSlug", "==", itemId),
      where("itemType", "==", itemType),
    );

    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 409 },
      );
    }

    // Add to wishlist
    const wishlistData: WishlistItem = {
      userId,
      itemId,
      itemType,
      itemSlug: itemId,
      addedAt: serverTimestamp(),
    };

    const wishlistRef = await addDoc(collection(db, "wishlist"), wishlistData);

    return NextResponse.json(
      {
        success: true,
        message: "Item added to wishlist",
        data: {
          id: wishlistRef.id,
          ...wishlistData,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to add to wishlist",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
