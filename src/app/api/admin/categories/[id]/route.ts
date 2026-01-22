/**
 * Admin Category Management API
 *
 * Update and delete categories.
 *
 * @route PUT /api/admin/categories/[id] - Update category (requires admin)
 * @route DELETE /api/admin/categories/[id] - Delete category (requires admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT - Update category
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;

    const body = await request.json();

    // Get category
    const categoryRef = doc(db, "categories", id);
    const categoryDoc = await getDoc(categoryRef);

    if (!categoryDoc.exists()) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Update allowed fields
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (body.name) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.parentId !== undefined) updateData.parentId = body.parentId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await updateDoc(categoryRef, updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating category:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update category",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Delete category
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;

    // Get category
    const categoryRef = doc(db, "categories", id);
    const categoryDoc = await getDoc(categoryRef);

    if (!categoryDoc.exists()) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const categoryData = categoryDoc.data();

    // Check if category has products
    if (categoryData.productCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category with products. Move or delete products first.",
        },
        { status: 400 },
      );
    }

    // Delete category
    await deleteDoc(categoryRef);

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting category:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete category",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
