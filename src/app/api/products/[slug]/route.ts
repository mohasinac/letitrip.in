/**
 * @fileoverview TypeScript Module
 * @module src/app/api/products/[slug]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

/**
 * Retrieves 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The get result
 *
 * @example
 * GET(request, {});
 */
export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  let slug: string | undefined;
  try {
    const user = await getUserFromRequest(request);
    const awaitedParams = await params;
    slug = awaitedParams.slug;

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
          { status: 404 },
        );
      }
      doc = snapshot.docs[0];
    }
    const data: any = doc.data();

    // Public users can only see published products
    if ((!user || user.role === "user") && data.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Sellers can only see their own non-published products
    if (user?.role === "seller" && data.status !== "published") {
      const ownsShop = await userOwnsShop(data.shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: doc.id,
        ...data,
        // Add camelCase aliases for all snake_case fields
        /** Shop Id */
        shopId: data.shop_id,
        /** Seller Id */
        sellerId: data.seller_id,
        /** Category Id */
        categoryId: data.category_id,
        /** Category Ids */
        categoryIds: data.category_ids,
        /** Stock Count */
        stockCount: data.stock_count,
        /** Low Stock Threshold */
        lowStockThreshold: data.low_stock_threshold,
        /** Track Inventory */
        trackInventory: data.track_inventory,
        /** Featured */
        featured: data.is_featured,
        /** Is Active */
        isActive: data.is_active,
        /** Is Deleted */
        isDeleted: data.is_deleted,
        /** Is Returnable */
        isReturnable: data.is_returnable,
        /** Compare At Price */
        compareAtPrice: data.compare_at_price,
        /** Tax Rate */
        taxRate: data.tax_rate,
        /** Return Window Days */
        returnWindowDays: data.return_window_days,
        /** Return Policy */
        returnPolicy: data.return_policy,
        /** Warranty Info */
        warrantyInfo: data.warranty_info,
        /** Shipping Class */
        shippingClass: data.shipping_class,
        /** View Count */
        viewCount: data.view_count,
        /** Sales Count */
        salesCount: data.sales_count,
        /** Favorite Count */
        favoriteCount: data.favorite_count,
        /** Review Count */
        reviewCount: data.review_count,
        /** Average Rating */
        averageRating: data.average_rating,
        /** Country Of Origin */
        countryOfOrigin: data.country_of_origin,
        /** Meta Title */
        metaTitle: data.meta_title,
        /** Meta Description */
        metaDescription: data.meta_description,
        /** Created At */
        createdAt: data.created_at,
        /** Updated At */
        updatedAt: data.updated_at,
        /** Has Variants */
        hasVariants: data.has_variants,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.products.slug.GET",
      /** Metadata */
      metadata: { slug },
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/products/[slug]
 * Update product (owner/admin only)
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ /**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The patch result
 *
 * @example
 * PATCH(request, {});
 */
params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Request */
  request, {});
 */

export async function PATCH(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  let slug: string | undefined;
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user!;

    const awaitedParams = await params;
    slug = awaitedParams.slug;

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
          { status: 404 },
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
            /** Success */
            success: false,
            /** Error */
            error: "You do not have permission to update this product",
          },
          { status: 403 },
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
          { status: 400 },
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
          /** Component */
          component: "API.products.slug.PATCH.updateCategoryCounts",
        });
        // Don't fail the request if count update fails
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: updatedDoc.id,
        ...updatedData,
        // Add camelCase aliases for all snake_case fields
        /** Shop Id */
        shopId: updatedData.shop_id,
        /** Seller Id */
        sellerId: updatedData.seller_id,
        /** Category Id */
        categoryId: updatedData.category_id,
        /** Category Ids */
        categoryIds: updatedData.category_ids,
        /** Stock Count */
        stockCount: updatedData.stock_count,
        /** Low Stock Threshold */
        lowStockThreshold: updatedData.low_stock_threshold,
        /** Track Inventory */
        trackInventory: updatedData.track_inventory,
        /** Featured */
        featured: updatedData.is_featured,
        /** Is Active */
        isActive: updatedData.is_active,
        /** Is Deleted */
        isDeleted: updatedData.is_deleted,
        /** Is Returnable */
        isReturnable: updatedData.is_returnable,
        /** Compare At Price */
        compareAtPrice: updatedData.compare_at_price,
        /** Tax Rate */
        taxRate: updatedData.tax_rate,
        /** Return Window Days */
        returnWindowDays: updatedData.return_window_days,
        /** Return Policy */
        returnPolicy: updatedData.return_policy,
        /** Warranty Info */
        warrantyInfo: updatedData.warranty_info,
        /** Shipping Class */
        shippingClass: updatedData.shipping_class,
        /** View Count */
        viewCount: updatedData.view_count,
        /** Sales Count */
        salesCount: updatedData.sales_count,
        /** Favorite Count */
        favoriteCount: updatedData.favorite_count,
        /** Review Count */
        reviewCount: updatedData.review_count,
        /** Average Rating */
        averageRating: updatedData.average_rating,
        /** Country Of Origin */
        countryOfOrigin: updatedData.country_of_origin,
        /** Meta Title */
        metaTitle: updatedData.meta_title,
        /** Meta Description */
        metaDescription: updatedData.meta_description,
        /** Created At */
        createdAt: updatedData.created_at,
        /** Updated At */
        updatedAt: updatedData.updated_at,
        /** Has Variants */
        hasVariants: updatedData.has_variants,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.products.slug.PATCH",
      /** Metadata */
      metadata: { slug },
    });
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/[slug]
 * Delete product (owner/admin only)
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result/**
 * Deletes 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The delete result
 *
 * @example
 * DELETE(request, {});
 */

 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Request */
  request, {});
 */

export async function DELETE(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  let slug: string | undefined;
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user!;

    const awaitedParams = await params;
    slug = awaitedParams.slug;

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
          { status: 404 },
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
            /** Success */
            success: false,
            /** Error */
            error: "You do not have permission to delete this product",
          },
          { status: 403 },
        );
      }
    }

    await Collections.products().doc(doc.id).delete();

    // Update category counts after deletion
    if (productData?.category_id) {
      try {
        await updateCategoryProductCounts(productData.category_id);
      } catch (error) {
        logError(error as Error, {
          /** Component */
          component: "API.products.slug.DELETE.updateCategoryCounts",
          /** Metadata */
          metadata: { categoryId: productData.category_id },
        });
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Product deleted successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.products.slug.DELETE",
      /** Metadata */
      metadata: { slug },
    });
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
