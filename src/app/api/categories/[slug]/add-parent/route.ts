import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../../lib/session";

/**
 * POST /api/categories/[slug]/add-parent
 * Add a parent to a category (supports multi-parent hierarchy)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { parentId } = body;

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: "Parent ID is required" },
        { status: 400 }
      );
    }

    // Get the category
    const categoriesSnapshot = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const categoryDoc = categoriesSnapshot.docs[0];
    const categoryData: any = categoryDoc.data();
    const currentParentIds =
      categoryData.parent_ids ||
      (categoryData.parent_id ? [categoryData.parent_id] : []);

    // Check if parent already exists
    if (currentParentIds.includes(parentId)) {
      return NextResponse.json(
        { success: false, error: "Parent already exists" },
        { status: 400 }
      );
    }

    // Verify parent exists
    const parentDoc = await Collections.categories().doc(parentId).get();
    if (!parentDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Parent category not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // Add parent to category
    const newParentIds = [...currentParentIds, parentId];
    await Collections.categories().doc(categoryDoc.id).update({
      parent_ids: newParentIds,
      parent_id: newParentIds[0], // Keep first parent for backward compatibility
      updated_at: now,
    });

    // Update parent's children list
    const parentData: any = parentDoc.data();
    const parentChildrenIds = parentData.children_ids || [];
    if (!parentChildrenIds.includes(categoryDoc.id)) {
      parentChildrenIds.push(categoryDoc.id);
      await Collections.categories().doc(parentId).update({
        children_ids: parentChildrenIds,
        child_count: parentChildrenIds.length,
        has_children: true,
        updated_at: now,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Parent added successfully",
    });
  } catch (error: any) {
    console.error("Add parent error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add parent",
      },
      { status: 500 }
    );
  }
}
