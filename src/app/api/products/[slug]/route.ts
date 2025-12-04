import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { updateCategoryProductCounts } from "@/lib/category-hierarchy";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

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

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await Collections.products().doc(slug).get();
    if (!doc.exists) {
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
      doc = snapshot.docs[0];
    }
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
        // Add camelCase aliases for all snake_case fields
        shopId: data.shop_id,
        sellerId: data.seller_id,
        categoryId: data.category_id,
        categoryIds: data.category_ids,
        stockCount: data.stock_count,
        lowStockThreshold: data.low_stock_threshold,
        trackInventory: data.track_inventory,
        featured: data.is_featured,
        isActive: data.is_active,
        isDeleted: data.is_deleted,
        isReturnable: data.is_returnable,
        compareAtPrice: data.compare_at_price,
        taxRate: data.tax_rate,
        returnWindowDays: data.return_window_days,
        returnPolicy: data.return_policy,
        warrantyInfo: data.warranty_info,
        shippingClass: data.shipping_class,
        viewCount: data.view_count,
        salesCount: data.sales_count,
        favoriteCount: data.favorite_count,
        reviewCount: data.review_count,
        averageRating: data.average_rating,
        countryOfOrigin: data.country_of_origin,
        metaTitle: data.meta_title,
        metaDescription: data.meta_description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        hasVariants: data.has_variants,
      },
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.products.slug.GET",
      slug: params.slug,
    });
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

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await Collections.products().doc(slug).get();
    if (!doc.exists) {
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
      doc = snapshot.docs[0];
    }
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
    const stockChanged =
      body.stock_count !== undefined &&
      body.stock_count !== productData.stock_count;
    const oldCategoryId = productData.category_id;
    const newCategoryId = body.category_id || oldCategoryId;

    await Collections.products().doc(doc.id).update(updateData);
    const updatedDoc = await Collections.products().doc(doc.id).get();
    const updatedData: any = updatedDoc.data();

    // Update category counts if status, category, or stock changed
    if (statusChanged || categoryChanged || stockChanged) {
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
        logError(error as Error, {
          component: "API.products.slug.PATCH.updateCategoryCounts",
        });
        // Don't fail the request if count update fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedData,
        // Add camelCase aliases for all snake_case fields
        shopId: updatedData.shop_id,
        sellerId: updatedData.seller_id,
        categoryId: updatedData.category_id,
        categoryIds: updatedData.category_ids,
        stockCount: updatedData.stock_count,
        lowStockThreshold: updatedData.low_stock_threshold,
        trackInventory: updatedData.track_inventory,
        featured: updatedData.is_featured,
        isActive: updatedData.is_active,
        isDeleted: updatedData.is_deleted,
        isReturnable: updatedData.is_returnable,
        compareAtPrice: updatedData.compare_at_price,
        taxRate: updatedData.tax_rate,
        returnWindowDays: updatedData.return_window_days,
        returnPolicy: updatedData.return_policy,
        warrantyInfo: updatedData.warranty_info,
        shippingClass: updatedData.shipping_class,
        viewCount: updatedData.view_count,
        salesCount: updatedData.sales_count,
        favoriteCount: updatedData.favorite_count,
        reviewCount: updatedData.review_count,
        averageRating: updatedData.average_rating,
        countryOfOrigin: updatedData.country_of_origin,
        metaTitle: updatedData.meta_title,
        metaDescription: updatedData.meta_description,
        createdAt: updatedData.created_at,
        updatedAt: updatedData.updated_at,
        hasVariants: updatedData.has_variants,
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

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await Collections.products().doc(slug).get();
    if (!doc.exists) {
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
      doc = snapshot.docs[0];
    }
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

    // Update category counts after deletion
    if (productData?.category_id) {
      try {
        await updateCategoryProductCounts(productData.category_id);
      } catch (error) {
        console.error("Failed to update category counts:", error);
      }
    }

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
