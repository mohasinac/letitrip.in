import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/cart
 * Get user's cart from database
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const adminDb = getAdminDb();

    // Get cart document
    const cartRef = adminDb.collection("carts").doc(userId);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists) {
      return NextResponse.json({ items: [] });
    }

    const cartData = cartSnap.data();
    return NextResponse.json({
      items: cartData?.items || [],
      updatedAt: cartData?.updatedAt,
    });
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        { error: "Token expired - Please login again" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Save/update user's cart in database
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const adminDb = getAdminDb();
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      );
    }

    // Save cart document
    const cartRef = adminDb.collection("carts").doc(userId);
    await cartRef.set({
      userId,
      items,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Cart saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving cart:", error);
    
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        { error: "Token expired - Please login again" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save cart" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Clear user's cart
 * Requires authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const adminDb = getAdminDb();

    // Clear cart document
    const cartRef = adminDb.collection("carts").doc(userId);
    await cartRef.set({
      userId,
      items: [],
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error: any) {
    console.error("Error clearing cart:", error);
    
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        { error: "Token expired - Please login again" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
