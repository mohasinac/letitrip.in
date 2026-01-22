/**
 * Individual Wishlist Item API Route
 *
 * Remove item from wishlist. Requires authentication and ownership.
 *
 * @route DELETE /api/user/wishlist/[id] - Remove from wishlist (requires auth)
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * DELETE - Remove item from wishlist
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { id } = await context.params;

    // Get wishlist item
    const wishlistRef = doc(db, "wishlist", id);
    const wishlistDoc = await getDoc(wishlistRef);

    if (!wishlistDoc.exists()) {
      return NextResponse.json(
        { error: "Wishlist item not found" },
        { status: 404 },
      );
    }

    const wishlistData = wishlistDoc.data();

    // Verify ownership
    if (wishlistData.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete wishlist item
    await deleteDoc(wishlistRef);

    return NextResponse.json(
      {
        success: true,
        message: "Item removed from wishlist",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to remove from wishlist",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
