/**
 * Product Details API Route
 *
 * Get, update, or delete a specific product by slug.
 *
 * @route GET /api/products/[slug]
 * @route PUT /api/products/[slug]
 * @route DELETE /api/products/[slug]
 *
 * @example
 * ```tsx
 * // Get product
 * const response = await fetch('/api/products/laptop-dell-xps');
 *
 * // Update product
 * const response = await fetch('/api/products/laptop-dell-xps', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ price: 89.99, stock: 50 })
 * });
 *
 * // Delete product
 * const response = await fetch('/api/products/laptop-dell-xps', {
 *   method: 'DELETE'
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: {
    slug: string;
  };
}

/**
 * GET - Fetch product details by slug
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;

    // Get product document
    const productDoc = await getDoc(doc(db, "products", slug));

    if (!productDoc.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productData = productDoc.data();

    // Increment view count asynchronously (don't wait)
    updateDoc(doc(db, "products", slug), {
      viewCount: increment(1),
    }).catch((error) =>
      console.error("Failed to increment view count:", error),
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          slug,
          ...productData,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching product:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch product",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * PUT - Update product by slug (Seller/Admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;
    const body = await request.json();

    // Check if product exists
    const productDoc = await getDoc(doc(db, "products", slug));
    if (!productDoc.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Remove fields that shouldn't be updated
    const {
      slug: _slug,
      createdAt: _createdAt,
      viewCount: _viewCount,
      salesCount: _salesCount,
      ...updateData
    } = body;

    // Add updated timestamp
    const updatedProduct = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    // Update status based on stock if provided
    if (updateData.stock !== undefined) {
      updatedProduct.status = updateData.stock > 0 ? "active" : "outOfStock";
    }

    // Update product
    await updateDoc(doc(db, "products", slug), updatedProduct);

    // Fetch updated product
    const updatedDoc = await getDoc(doc(db, "products", slug));

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: {
          slug,
          ...updatedDoc.data(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating product:", error);

    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Delete product by slug (Seller/Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;

    // Check if product exists
    const productDoc = await getDoc(doc(db, "products", slug));
    if (!productDoc.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete product
    await deleteDoc(doc(db, "products", slug));

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting product:", error);

    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
