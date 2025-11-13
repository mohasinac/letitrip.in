import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../../lib/session";

/**
 * POST /api/categories/[slug]/remove-parent
 * Remove a parent from a category (supports multi-parent hierarchy)
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

    // Check if parent exists
    if (!currentParentIds.includes(parentId)) {
      return NextResponse.json(
        { success: false, error: "Parent not found in category" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Remove parent from category
    const newParentIds = currentParentIds.filter(
      (id: string) => id !== parentId
    );
    await Collections.categories()
      .doc(categoryDoc.id)
      .update({
        parent_ids: newParentIds,
        parent_id: newParentIds[0] || null, // Keep first parent for backward compatibility
        updated_at: now,
      });

    // Update parent's children list
    const parentDoc = await Collections.categories().doc(parentId).get();
    if (parentDoc.exists) {
      const parentData: any = parentDoc.data();
      const parentChildrenIds = (parentData.children_ids || []).filter(
        (id: string) => id !== categoryDoc.id
      );
      await Collections.categories()
        .doc(parentId)
        .update({
          children_ids: parentChildrenIds,
          child_count: parentChildrenIds.length,
          has_children: parentChildrenIds.length > 0,
          updated_at: now,
        });
    }

    return NextResponse.json({
      success: true,
      message: "Parent removed successfully",
    });
  } catch (error: any) {
    console.error("Remove parent error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove parent",
      },
      { status: 500 }
    );
  }
}
