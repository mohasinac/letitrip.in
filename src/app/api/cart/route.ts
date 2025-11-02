import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/config";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

/**
 * GET /api/cart?userId=xxx
 * Get user's cart from database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get cart document
    const cartRef = doc(db, "carts", userId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) {
      return NextResponse.json({ items: [] });
    }

    const cartData = cartSnap.data();
    return NextResponse.json({
      items: cartData.items || [],
      updatedAt: cartData.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Save/update user's cart in database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      );
    }

    // Save cart document
    const cartRef = doc(db, "carts", userId);
    await setDoc(cartRef, {
      userId,
      items,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Cart saved successfully",
    });
  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json(
      { error: "Failed to save cart" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart?userId=xxx
 * Clear user's cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Clear cart document
    const cartRef = doc(db, "carts", userId);
    await setDoc(cartRef, {
      userId,
      items: [],
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
