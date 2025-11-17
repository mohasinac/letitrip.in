import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/categories/featured
export async function GET() {
  try {
    const snap = await Collections.categories()
      .where("is_featured", "==", true)
      .limit(100)
      .get();
    const data = snap.docs.map((d) => {
      const catData: any = d.data();
      return {
        id: d.id,
        ...catData,
        // Add camelCase aliases
        parentId: catData.parent_id,
        featured: catData.is_featured,
        showOnHomepage: catData.show_on_homepage,
        isActive: catData.is_active,
        productCount: catData.product_count || 0,
        childCount: catData.child_count || 0,
        hasChildren: catData.has_children || false,
        sortOrder: catData.sort_order || 0,
        metaTitle: catData.meta_title,
        metaDescription: catData.meta_description,
        commissionRate: catData.commission_rate || 0,
        createdAt: catData.created_at,
        updatedAt: catData.updated_at,
      };
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Featured categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load featured categories" },
      { status: 500 }
    );
  }
}
