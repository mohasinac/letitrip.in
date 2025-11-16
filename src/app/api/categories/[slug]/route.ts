import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { ValidationError } from "@/lib/api-errors";

/**
 * GET /api/categories/[slug]
 * Get category details
 * - Public: Active categories only
 * - Admin: All categories including inactive
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    const { slug } = await params;
    const snapshot = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const data: any = doc.data();

    // Public users can only see active categories
    if ((!user || user.role !== "admin") && !data.is_active) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        // Add camelCase aliases with multi-parent support
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
      },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/categories/[slug]
 * Update category (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const { slug } = await params;
    const snapshot = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const data = await request.json();
    const oldData: any = doc.data();

    if (data.slug && data.slug !== slug) {
      const exists = await Collections.categories()
        .where("slug", "==", data.slug)
        .limit(1)
        .get();
      if (!exists.empty) {
        return NextResponse.json(
          { success: false, error: "Slug already in use" },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    const update: any = { ...data, updated_at: now };
    delete update.id;
    delete update.created_at;

    // Handle multi-parent update
    if (data.parent_ids !== undefined) {
      const newParentIds = Array.isArray(data.parent_ids)
        ? data.parent_ids
        : [];
      const oldParentIds =
        oldData.parent_ids || (oldData.parent_id ? [oldData.parent_id] : []);

      // Remove from old parents
      const removedParents = oldParentIds.filter(
        (id: string) => !newParentIds.includes(id)
      );
      for (const parentId of removedParents) {
        const parentRef = Collections.categories().doc(parentId);
        const parentDoc = await parentRef.get();
        if (parentDoc.exists) {
          const parentData: any = parentDoc.data();
          const childrenIds = (parentData.children_ids || []).filter(
            (id: string) => id !== doc.id
          );
          await parentRef.update({
            children_ids: childrenIds,
            child_count: childrenIds.length,
            has_children: childrenIds.length > 0,
            updated_at: now,
          });
        }
      }

      // Add to new parents
      const addedParents = newParentIds.filter(
        (id: string) => !oldParentIds.includes(id)
      );
      for (const parentId of addedParents) {
        const parentRef = Collections.categories().doc(parentId);
        const parentDoc = await parentRef.get();
        if (parentDoc.exists) {
          const parentData: any = parentDoc.data();
          const childrenIds = parentData.children_ids || [];
          if (!childrenIds.includes(doc.id)) {
            childrenIds.push(doc.id);
            await parentRef.update({
              children_ids: childrenIds,
              child_count: childrenIds.length,
              has_children: true,
              updated_at: now,
            });
          }
        }
      }

      update.parent_ids = newParentIds;
      update.parent_id = newParentIds[0] || null; // Backward compatibility
    }

    await Collections.categories().doc(doc.id).update(update);
    const updated = await Collections.categories().doc(doc.id).get();
    const updatedData: any = updated.data();
    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        ...updatedData,
        // Add camelCase aliases with multi-parent support
        parentIds:
          updatedData.parent_ids ||
          (updatedData.parent_id ? [updatedData.parent_id] : []),
        childrenIds: updatedData.children_ids || [],
        parentId: updatedData.parent_id, // Backward compatibility
        isFeatured: updatedData.is_featured,
        showOnHomepage: updatedData.show_on_homepage,
        isActive: updatedData.is_active,
        productCount: updatedData.product_count || 0,
        childCount: updatedData.child_count || 0,
        hasChildren: updatedData.has_children || false,
        sortOrder: updatedData.sort_order || 0,
        metaTitle: updatedData.meta_title,
        metaDescription: updatedData.meta_description,
        commissionRate: updatedData.commission_rate || 0,
        createdAt: updatedData.created_at,
        updatedAt: updatedData.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[slug]
 * Delete category (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const { slug } = await params;
    const snapshot = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const docData: any = doc.data();

    // Prevent deletion if category has children
    const childrenIds = docData.children_ids || [];
    if (childrenIds.length > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with children" },
        { status: 400 }
      );
    }

    // Remove from all parent categories
    const parentIds =
      docData.parent_ids || (docData.parent_id ? [docData.parent_id] : []);
    const now = new Date().toISOString();

    for (const parentId of parentIds) {
      const parentRef = Collections.categories().doc(parentId);
      const parentDoc = await parentRef.get();
      if (parentDoc.exists) {
        const parentData: any = parentDoc.data();
        const updatedChildrenIds = (parentData.children_ids || []).filter(
          (id: string) => id !== doc.id
        );
        await parentRef.update({
          children_ids: updatedChildrenIds,
          child_count: updatedChildrenIds.length,
          has_children: updatedChildrenIds.length > 0,
          updated_at: now,
        });
      }
    }

    await Collections.categories().doc(doc.id).delete();
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
