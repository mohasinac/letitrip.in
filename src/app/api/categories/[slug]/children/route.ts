import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * GET /api/categories/[slug]/children
 * Get all direct children categories for a given category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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
    const childrenIds = categoryData.children_ids || [];

    if (childrenIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Fetch all children categories
    const children: any[] = [];
    for (const childId of childrenIds) {
      const childDoc = await Collections.categories().doc(childId).get();
      if (childDoc.exists) {
        const childData: any = childDoc.data();
        children.push({
          id: childDoc.id,
          ...childData,
          parentIds:
            childData.parent_ids ||
            (childData.parent_id ? [childData.parent_id] : []),
          childrenIds: childData.children_ids || [],
          parentId: childData.parent_id,
          featured: childData.is_featured,
          showOnHomepage: childData.show_on_homepage,
          isActive: childData.is_active,
          productCount: childData.product_count || 0,
          childCount: childData.child_count || 0,
          hasChildren: childData.has_children || false,
          sortOrder: childData.sort_order || 0,
          metaTitle: childData.meta_title,
          metaDescription: childData.meta_description,
          commissionRate: childData.commission_rate || 0,
          createdAt: childData.created_at,
          updatedAt: childData.updated_at,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: children,
    });
  } catch (error: any) {
    console.error("Category children error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch category children",
      },
      { status: 500 }
    );
  }
}
