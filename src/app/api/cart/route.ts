/**
 * Cart API Routes
 *
 * Handles cart operations for authenticated users.
 * User carts are stored in Firestore, linked to session.
 *
 * @route GET /api/cart - Get cart items (requires auth)
 * @route POST /api/cart - Add item to cart (requires auth)
 *
 * @example
 * ```tsx
 * // Get cart (uses session automatically)
 * const response = await fetch('/api/cart');
 *
 * // Add to cart
 * const response = await fetch('/api/cart', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     productSlug: 'laptop-dell',
 *     quantity: 1,
 *     price: 999
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

interface CartItem {
  userId: string;
  productSlug: string;
  quantity: number;
  price: number;
  addedAt: any;
}

interface CartItemWithProduct extends CartItem {
  id: string;
  product: {
    slug: string;
    name: string;
    image: string | null;
    currentPrice: number;
    stock: number;
    status: string;
  } | null;
}

/**
 * GET - Fetch cart items for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get session - throws if not authenticated
    const session = await requireAuth();
    const userId = session.userId;

    // Query cart items for user
    const cartQuery = query(
      collection(db, "cart"),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(cartQuery);

    // Process cart items and enrich with product data
    const cartItems: CartItemWithProduct[] = await Promise.all(
      querySnapshot.docs.map(async (cartDoc) => {
        const cartData = cartDoc.data() as CartItem;

        // Fetch product details
        const productDoc = await getDoc(
          doc(db, "products", cartData.productSlug),
        );

        const productData = productDoc.exists() ? productDoc.data() : null;

        return {
          id: cartDoc.id,
          ...cartData,
          product: productData
            ? {
                slug: cartData.productSlug,
                name: productData.name,
                image: productData.images?.[0] || null,
                currentPrice: productData.price,
                stock: productData.stock,
                status: productData.status,
              }
            : null,
        };
      }),
    );

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.product?.currentPrice || 0) * item.quantity,
      0,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          items: cartItems,
          count: cartItems.length,
          subtotal,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching cart:", error);

    // Handle authentication errors
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch cart",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Add item to cart (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Get session - throws if not authenticated
    const session = await requireAuth();
    const userId = session.userId;

    const body = await request.json();
    const { productSlug, quantity, price, variantId } = body;

    // Validate required fields
    if (!productSlug || !quantity || !price) {
      return NextResponse.json(
        { error: "Product slug, quantity, and price are required" },
        { status: 400 },
      );
    }

    // Validate product exists
    const productDoc = await getDoc(doc(db, "products", productSlug));
    if (!productDoc.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productData = productDoc.data();

    // Check stock availability
    if (productData.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 },
      );
    }

    // Check if item already exists in cart
    const existingCartQuery = query(
      collection(db, "cart"),
      where("userId", "==", userId),
      where("productSlug", "==", productSlug),
      where("variantId", "==", variantId || null),
    );

    const existingCart = await getDocs(existingCartQuery);

    if (!existingCart.empty) {
      return NextResponse.json(
        { error: "Item already in cart. Use PUT to update quantity." },
        { status: 409 },
      );
    }

    // Add item to cart
    const cartItem = {
      userId,
      productSlug,
      productName: productData.name,
      quantity,
      price,
      variantId: variantId || null,
      addedAt: serverTimestamp(),
    };

    const cartRef = await addDoc(collection(db, "cart"), cartItem);

    return NextResponse.json(
      {
        success: true,
        message: "Item added to cart",
        data: {
          id: cartRef.id,
          ...cartItem,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error adding to cart:", error);

    // Handle authentication errors
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to add item to cart",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
