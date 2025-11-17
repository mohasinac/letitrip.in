import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";
import { updateCategoryProductCounts } from "@/lib/category-hierarchy";

/**
 * GET /api/products/[slug]
 * Get single product by slug
 * - Public: Published products only
 * - Owner/Admin: All statuses
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    const { slug } = await params;

    const snapshot = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const data: any = doc.data();

    // Public users can only see published products
    if ((!user || user.role === "user") && data.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Sellers can only see their own non-published products
    if (user?.role === "seller" && data.status !== "published") {
      const ownsShop = await userOwnsShop(data.shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        // Add camelCase aliases for snake_case fields
        shopId: data.shop_id,
        categoryId: data.category_id,
        stockCount: data.stock_count,
        isFeatured: data.is_featured,
        isDeleted: data.is_deleted,
        originalPrice: data.original_price,
        reviewCount: data.review_count,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[slug]
 * Update product (owner/admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user!;

    const { slug } = await params;
    const snapshot = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const productData = doc.data() as any;

    // Validate user owns the shop (sellers only edit own, admin edits all)
    if (user.role !== "admin") {
      const ownsShop = await userOwnsShop(productData?.shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          {
            success: false,
            error: "You do not have permission to update this product",
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    if (body.slug && body.slug !== productData?.slug) {
      const existingSlug = await Collections.products()
        .where("slug", "==", body.slug)
        .where("shop_id", "==", productData?.shop_id)
        .limit(1)
        .get();
      if (!existingSlug.empty) {
        return NextResponse.json(
          { success: false, error: "Product slug already exists in this shop" },
          { status: 400 }
        );
      }
    }

    const updateData: any = { ...body, updated_at: new Date().toISOString() };
    delete updateData.shop_id; // immutable
    delete updateData.created_at;
    delete updateData.id;

    // Track if status or category changed to update counts
    const statusChanged = body.status && body.status !== productData.status;
    const categoryChanged =
      body.category_id && body.category_id !== productData.category_id;
    const oldCategoryId = productData.category_id;
    const newCategoryId = body.category_id || oldCategoryId;

    await Collections.products().doc(doc.id).update(updateData);
    const updatedDoc = await Collections.products().doc(doc.id).get();
    const updatedData: any = updatedDoc.data();

    // Update category counts if status or category changed
    if (statusChanged || categoryChanged) {
      try {
        if (categoryChanged && oldCategoryId) {
          // Update old category counts
          await updateCategoryProductCounts(oldCategoryId);
        }
        // Update new category counts
        if (newCategoryId) {
          await updateCategoryProductCounts(newCategoryId);
        }
      } catch (error) {
        console.error("Failed to update category counts:", error);
        // Don't fail the request if count update fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedData,
        // Add camelCase aliases for snake_case fields
        shopId: updatedData.shop_id,
        categoryId: updatedData.category_id,
        stockCount: updatedData.stock_count,
        isFeatured: updatedData.is_featured,
        isDeleted: updatedData.is_deleted,
        originalPrice: updatedData.original_price,
        reviewCount: updatedData.review_count,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[slug]
 * Delete product (owner/admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user!;

    const { slug } = await params;
    const snapshot = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const productData = doc.data() as any;

    // Validate user owns the shop (sellers only delete own, admin deletes all)
    if (user.role !== "admin") {
      const ownsShop = await userOwnsShop(productData?.shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          {
            success: false,
            error: "You do not have permission to delete this product",
          },
          { status: 403 }
        );
      }
    }

    await Collections.products().doc(doc.id).delete();

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
