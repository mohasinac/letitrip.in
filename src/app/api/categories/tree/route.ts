import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { withCache } from "@/app/api/middleware/cache";

// GET /api/categories/tree - Full category tree (public)
export async function GET(request: NextRequest) {
  return withCache(
    request,
    async () => {
      try {
        const snapshot = await Collections.categories().limit(1000).get();
        const nodes = snapshot.docs.map((d) => {
          const catData: any = d.data();
          return {
            id: d.id,
            ...catData,
            // Add camelCase aliases
            parentId: catData.parent_id,
            isFeatured: catData.is_featured,
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
        const byId: Record<string, any> = {};
        nodes.forEach((n) => {
          byId[n.id] = { ...n, children: [] };
        });
        const roots: any[] = [];
        nodes.forEach((n) => {
          if (n.parent_id) {
            const parent = byId[n.parent_id];
            if (parent) parent.children.push(byId[n.id]);
            else roots.push(byId[n.id]);
          } else {
            roots.push(byId[n.id]);
          }
        });
        return NextResponse.json({ success: true, data: roots });
      } catch (error) {
        console.error("Error building category tree:", error);
        return NextResponse.json(
          { success: false, error: "Failed to load category tree" },
          { status: 500 }
        );
      }
    },
    { ttl: 600 }
  ); // 10 minutes - tree doesn't change often
}
