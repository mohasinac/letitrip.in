/**
 * Seller Product Management API
 *
 * Update/delete seller's products.
 *
 * @route PUT /api/seller/products/[id] - Update product (requires seller/admin, ownership)
 * @route DELETE /api/seller/products/[id] - Delete product (requires seller/admin, ownership)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT - Update product
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;
    const isAdmin = session.role === "admin";
    const { id } = await context.params;

    const body = await request.json();

    // Get product by slug
    const productQuery = query(
      collection(db, "products"),
      where("slug", "==", id),
    );
    const productSnapshot = await getDocs(productQuery);

    if (productSnapshot.empty) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productDoc = productSnapshot.docs[0];
    const productData = productDoc.data();

    // Verify ownership (admin can edit any)
    if (!isAdmin && productData.sellerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update allowed fields
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.category) updateData.category = body.category;
    if (body.images) updateData.images = body.images;
    if (body.specifications) updateData.specifications = body.specifications;
    if (body.brand) updateData.brand = body.brand;
    if (body.condition) updateData.condition = body.condition;

    await updateDoc(productDoc.ref, updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating product:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
 * DELETE - Delete product
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;
    const isAdmin = session.role === "admin";
    const { id } = await context.params;

    // Get product by slug
    const productQuery = query(
      collection(db, "products"),
      where("slug", "==", id),
    );
    const productSnapshot = await getDocs(productQuery);

    if (productSnapshot.empty) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productDoc = productSnapshot.docs[0];
    const productData = productDoc.data();

    // Verify ownership (admin can delete any)
    if (!isAdmin && productData.sellerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete product
    await deleteDoc(productDoc.ref);

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting product:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
