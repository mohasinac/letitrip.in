/**
 * Cart Item API Routes
 * 
 * Update or delete a specific cart item.
 * 
 * @route PUT /api/cart/[id] - Update item quantity
 * @route DELETE /api/cart/[id] - Remove item from cart
 * 
 * @example
 * ```tsx
 * // Update quantity
 * const response = await fetch('/api/cart/cart-item-id', {
 *   method: 'PUT',
 *   body: JSON.stringify({ quantity: 3 })
 * });
 * 
 * // Remove item
 * const response = await fetch('/api/cart/cart-item-id', {
 *   method: 'DELETE'
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PUT - Update cart item quantity
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { quantity } = body;

    // Validate quantity
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 }
      );
    }

    // Check if cart item exists
    const cartItemRef = doc(db, "cart", id);
    const cartItemDoc = await getDoc(cartItemRef);

    if (!cartItemDoc.exists()) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    const cartData = cartItemDoc.data();

    // Validate product stock
    const productDoc = await getDoc(doc(db, "products", cartData.productSlug));
    if (productDoc.exists()) {
      const productData = productDoc.data();
      if (productData.stock < quantity) {
        return NextResponse.json(
          {
            error: "Insufficient stock",
            availableStock: productData.stock,
          },
          { status: 400 }
        );
      }
    }

    // Update quantity
    await updateDoc(cartItemRef, { quantity });

    // Fetch updated item
    const updatedDoc = await getDoc(cartItemRef);

    return NextResponse.json(
      {
        success: true,
        message: "Cart item updated",
        data: {
          id,
          ...updatedDoc.data(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating cart item:", error);

    return NextResponse.json(
      {
        error: "Failed to update cart item",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove cart item
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    // Check if cart item exists
    const cartItemDoc = await getDoc(doc(db, "cart", id));

    if (!cartItemDoc.exists()) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Delete cart item
    await deleteDoc(doc(db, "cart", id));

    return NextResponse.json(
      {
        success: true,
        message: "Item removed from cart",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting cart item:", error);

    return NextResponse.json(
      {
        error: "Failed to remove cart item",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
