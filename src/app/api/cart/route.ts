/**
 * Cart API Routes
 * 
 * Handles cart operations for both guest and authenticated users.
 * Guest carts are stored in localStorage, user carts in Firestore.
 * 
 * @route GET /api/cart - Get cart items
 * @route POST /api/cart - Add item to cart
 * 
 * @example
 * ```tsx
 * // Get cart
 * const response = await fetch('/api/cart?userId=user-id');
 * 
 * // Add to cart
 * const response = await fetch('/api/cart', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     userId: 'user-id',
 *     productSlug: 'laptop-dell',
 *     quantity: 1,
 *     price: 999
 *   })
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

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
 * GET - Fetch cart items for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Query cart items for user
    const cartQuery = query(
      collection(db, "cart"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(cartQuery);

    // Process cart items and enrich with product data
    const cartItems: CartItemWithProduct[] = await Promise.all(
      querySnapshot.docs.map(async (cartDoc) => {
        const cartData = cartDoc.data() as CartItem;
        
        // Fetch product details
        const productDoc = await getDoc(
          doc(db, "products", cartData.productSlug)
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
      })
    );

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.product?.currentPrice || 0) * item.quantity,
      0
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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching cart:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch cart",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productSlug, quantity, price, variantId } = body;

    // Validate required fields
    if (!userId || !productSlug || !quantity || !price) {
      return NextResponse.json(
        { error: "User ID, product slug, quantity, and price are required" },
        { status: 400 }
      );
    }

    // Validate product exists
    const productDoc = await getDoc(doc(db, "products", productSlug));
    if (!productDoc.exists()) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const productData = productDoc.data();

    // Check stock availability
    if (productData.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingCartQuery = query(
      collection(db, "cart"),
      where("userId", "==", userId),
      where("productSlug", "==", productSlug),
      where("variantId", "==", variantId || null)
    );

    const existingCart = await getDocs(existingCartQuery);

    if (!existingCart.empty) {
      return NextResponse.json(
        { error: "Item already in cart. Use PUT to update quantity." },
        { status: 409 }
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
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding to cart:", error);

    return NextResponse.json(
      {
        error: "Failed to add item to cart",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
