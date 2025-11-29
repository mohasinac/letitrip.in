import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * GET /api/categories/[slug]/parents
 * Get all parent categories for a given category
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
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
        { status: 404 },
      );
    }

    const categoryDoc = categoriesSnapshot.docs[0];
    const categoryData: any = categoryDoc.data();
    const parentIds =
      categoryData.parent_ids ||
      (categoryData.parent_id ? [categoryData.parent_id] : []);

    if (parentIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Fetch all parent categories
    const parents: any[] = [];
    for (const parentId of parentIds) {
      const parentDoc = await Collections.categories().doc(parentId).get();
      if (parentDoc.exists) {
        const parentData: any = parentDoc.data();
        parents.push({
          id: parentDoc.id,
          ...parentData,
          parentIds:
            parentData.parent_ids ||
            (parentData.parent_id ? [parentData.parent_id] : []),
          childrenIds: parentData.children_ids || [],
          parentId: parentData.parent_id,
          featured: parentData.is_featured,
          showOnHomepage: parentData.show_on_homepage,
          isActive: parentData.is_active,
          productCount: parentData.product_count || 0,
          childCount: parentData.child_count || 0,
          hasChildren: parentData.has_children || false,
          sortOrder: parentData.sort_order || 0,
          metaTitle: parentData.meta_title,
          metaDescription: parentData.meta_description,
          commissionRate: parentData.commission_rate || 0,
          createdAt: parentData.created_at,
          updatedAt: parentData.updated_at,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: parents,
    });
  } catch (error: any) {
    console.error("Category parents error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch category parents",
      },
      { status: 500 },
    );
  }
}
