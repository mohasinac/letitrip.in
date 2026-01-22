/**
 * Clear Cart API Route
 *
 * Remove all items from user's cart.
 *
 * @route DELETE /api/cart/clear - Clear entire cart (requires auth)
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE - Clear all cart items
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    // Get all user's cart items
    const cartQuery = query(
      collection(db, "cart"),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(cartQuery);

    if (querySnapshot.empty) {
      return NextResponse.json(
        {
          success: true,
          message: "Cart is already empty",
        },
        { status: 200 },
      );
    }

    // Delete all items
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return NextResponse.json(
      {
        success: true,
        message: `${querySnapshot.docs.length} items removed from cart`,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error clearing cart:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to clear cart",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
