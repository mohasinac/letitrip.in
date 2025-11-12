import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

// GET /api/categories/[slug] - Public category detail
// PATCH /api/categories/[slug] - Admin update
// DELETE /api/categories/[slug] - Admin delete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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
    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        // Add camelCase aliases
        parentId: data.parent_id,
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

export async function PATCH(
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

    const update: any = { ...data, updated_at: new Date().toISOString() };
    delete update.id;
    delete update.created_at;

    await Collections.categories().doc(doc.id).update(update);
    const updated = await Collections.categories().doc(doc.id).get();
    const updatedData: any = updated.data();
    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        ...updatedData,
        // Add camelCase aliases
        parentId: updatedData.parent_id,
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

export async function DELETE(
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

    // Prevent deletion if category has children
    const children = await Collections.categories()
      .where("parent_id", "==", doc.id)
      .limit(1)
      .get();
    if (!children.empty) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with children" },
        { status: 400 }
      );
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
