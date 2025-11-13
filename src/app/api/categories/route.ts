import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../lib/session";

// GET /api/categories - List categories (public)
// POST /api/categories - Create category (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get("isFeatured");
    const showOnHomepage = searchParams.get("showOnHomepage");
    const parentId = searchParams.get("parentId");

    let query: FirebaseFirestore.Query = Collections.categories();

    if (isFeatured !== null) {
      query = query.where("is_featured", "==", isFeatured === "true");
    }
    if (showOnHomepage !== null) {
      query = query.where("show_on_homepage", "==", showOnHomepage === "true");
    }
    if (parentId !== null) {
      query = query.where(
        "parent_id",
        "==",
        parentId === "null" ? null : parentId
      );
    }

    const snapshot = await query.limit(200).get();
    const categories = snapshot.docs.map((d) => {
      const data: any = d.data();
      return {
        id: d.id,
        ...data,
        // Add camelCase aliases for frontend compatibility with multi-parent support
        parentIds: data.parent_ids || (data.parent_id ? [data.parent_id] : []),
        childrenIds: data.children_ids || [],
        parentId: data.parent_id, // Backward compatibility
        isFeatured: data.is_featured,
        showOnHomepage: data.show_on_homepage,
        isActive: data.is_active,
        productCount: data.product_count || 0,
        childCount: data.child_count || 0,
        hasChildren: data.has_children || false,
        sortOrder: data.sort_order || 0,
        metaTitle: data.meta_title,
        metaDescription: data.meta_description,
        commissionRate: data.commission_rate || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error listing categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug } = body;
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Slug uniqueness (global)
    const existing = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: "Category slug already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Handle multi-parent support
    let parentIds: string[] = [];
    if (body.parent_ids && Array.isArray(body.parent_ids)) {
      parentIds = body.parent_ids.filter((id: string) => id);
    } else if (body.parent_id) {
      // Backward compatibility
      parentIds = [body.parent_id];
    }

    const docRef = await Collections.categories().add({
      name,
      slug,
      description: body.description || "",
      parent_ids: parentIds,
      parent_id: parentIds[0] || null, // Backward compatibility
      children_ids: [],
      has_children: false,
      child_count: 0,
      is_featured: !!body.is_featured,
      show_on_homepage: !!body.show_on_homepage,
      is_active: body.is_active !== false,
      meta_title: body.meta_title || "",
      meta_description: body.meta_description || "",
      sort_order: body.sort_order || 0,
      commission_rate: body.commission_rate || 0,
      created_at: now,
      updated_at: now,
    });

    // Update parent categories to include this as a child
    if (parentIds.length > 0) {
      const batch = Collections.categories().firestore.batch();
      for (const parentId of parentIds) {
        const parentRef = Collections.categories().doc(parentId);
        const parentDoc = await parentRef.get();
        if (parentDoc.exists) {
          const parentData: any = parentDoc.data();
          const childrenIds = parentData.children_ids || [];
          if (!childrenIds.includes(docRef.id)) {
            childrenIds.push(docRef.id);
            batch.update(parentRef, {
              children_ids: childrenIds,
              has_children: true,
              child_count: childrenIds.length,
              updated_at: now,
            });
          }
        }
      }
      await batch.commit();
    }

    const created = await docRef.get();
    const createdData: any = created.data();
    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.id,
          ...createdData,
          // Add camelCase aliases for multi-parent support
          parentIds: createdData.parent_ids || [],
          childrenIds: createdData.children_ids || [],
          parentId: createdData.parent_id, // Backward compatibility
          isFeatured: createdData.is_featured,
          showOnHomepage: createdData.show_on_homepage,
          isActive: createdData.is_active,
          productCount: createdData.product_count || 0,
          childCount: createdData.child_count || 0,
          hasChildren: createdData.has_children || false,
          sortOrder: createdData.sort_order || 0,
          metaTitle: createdData.meta_title,
          metaDescription: createdData.meta_description,
          commissionRate: createdData.commission_rate || 0,
          createdAt: createdData.created_at,
          updatedAt: createdData.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
