/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/[slug]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Individual Shop API - /api/shops/[slug] with Firebase Integration
 * Unified endpoint with role-based access control
 *
 * GET: Retrieve shop by slug
 *   - Guest/User: Only verified, non-banned shops
 *   - Seller: Own shops + verified public shops
 *   - Admin: All shops
 *
 * PATCH: Update shop
 *   - Seller: Can update own shop (except verification/featured/banned flags)
 *   - Admin: Can update any shop including status flags
 *
 * DELETE: Delete shop
 *   - Seller: Can delete own shop
 *   - Admin: Can delete any shop
 */

// GET /api/shops/[slug] - Retrieve shop by slug with role-based access control
/**
 * Function: G E T
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

export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const user = await getUserFromRequest(request);
    /**
     * Performs role operation
     *
     * @returns {any} The role result
     */

    /**
     * Performs role operation
     *
     * @returns {any} The role result
     */

    const role = (user?.role || "guest") as
      | "guest"
      | "user"
      | "seller"
      | "admin";
    const userId = user?.uid;

    // Fetch shop directly by slug (slug === document ID)
    const shopDoc = await Collections.shops().doc(slug).get();

    // Fallback: Try querying by slug field for backward compatibility
    let data: any;
    let docId: string;

    if (!shopDoc.exists) {
      // Legacy data: slug stored as field, not as document ID
      const shopSnapshot = await Collections.shops()
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (shopSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Shop not found" },
          { status: 404 },
        );
      }
      const legacyDoc = shopSnapshot.docs[0];
      data = legacyDoc.data();
      docId = legacyDoc.id;
    } else {
      data = shopDoc.data();
      docId = shopDoc.id;
    }

    const shop: any = {
      /** Id */
      id: docId,
      ...data,
      // Add camelCase aliases
      /** Owner Id */
      ownerId: data.owner_id,
      /** Is Verified */
      isVerified: data.is_verified,
      /** Featured */
      featured: data.is_featured,
      /** Is Banned */
      isBanned: data.is_banned,
      /** Show On Homepage */
      showOnHomepage: data.show_on_homepage,
      /** Total Products */
      totalProducts: data.total_products || data.product_count || 0,
      /** Review Count */
      reviewCount: data.review_count || 0,
      /** Created At */
      createdAt: data.created_at,
      /** Updated At */
      updatedAt: data.updated_at,
    };

    // Role-based access control
    const isOwner = Boolean(userId && shop.owner_id === userId);

    if (role === "guest" || role === "user") {
      // Guest/User: Only verified, non-banned shops
      if (!shop.is_verified || shop.is_banned) {
        return NextResponse.json(
          { success: false, error: "Shop not found" },
          { status: 404 },
        );
      }
    } else if (role === "seller") {
      // Seller: Own shops + verified public shops
      if (!isOwner && (!shop.is_verified || shop.is_banned)) {
        return NextResponse.json(
          { success: false, error: "Shop not found" },
          { status: 404 },
        );
      }
    }
    // Admin: Can access all shops (no additional check)

    return NextResponse.json({
      /** Success */
      success: true,
      shop,
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.detail.GET",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/shops/[slug] - Update shop by slug (internal ID resolved first)
/**
 * Function: P A T C H
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
 * @param {{ params} { params } - The { params }
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
  try {
    const { slug } = await params;

    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const role = user.role as "seller" | "admin" | "user" | "guest";
    const userId = user.uid;
    const body = await request.json();

    // Try direct document access first (slug === doc ID)
    let shopDoc = await Collections.shops().doc(slug).get();
    let shop: any;
    let docId: string;

    if (!shopDoc.exists) {
      // Fallback: Legacy data with random ID
      const shopSnapshot = await Collections.shops()
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (shopSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Shop not found" },
          { status: 404 },
        );
      }
      const legacyDoc = shopSnapshot.docs[0];
      shop = { id: legacyDoc.id, ...legacyDoc.data() };
      docId = legacyDoc.id;
    } else {
      shop = { id: shopDoc.id, ...shopDoc.data() };
      docId = shopDoc.id;
    }

    const isOwner = shop.owner_id === userId;
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    const allowedFields = [
      "name",
      "slug",
      "description",
      "logo",
      "banner",
      "email",
      "phone",
      "location",
      "website",
    ] as string[];
    if (isAdmin) {
      allowedFields.push(
        "is_verified",
        "is_featured",
        "is_banned",
        "show_on_homepage",
      );
    }

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in (body || {})) updates[field] = body[field];
    }

    if (updates.slug && updates.slug !== shop.slug) {
      const existingShopSnapshot = await Collections.shops()
        .where("slug", "==", updates.slug)
        .limit(1)
        .get();
      if (!existingShopSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Slug already in use" },
          { status: 400 },
        );
      }
    }

    await Collections.shops()
      .doc(docId)
      .update({
        ...updates,
        updated_at: new Date(),
      });

    const updated = await Collections.shops().doc(docId).get();
    return NextResponse.json({
      /** Success */
      success: true,
      /** Shop */
      shop: { id: updated.id, ...updated.data() },
      /** Message */
      message: "Shop updated successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.detail.PATCH",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/shops/[slug] - Delete shop by slug (resolve internal ID)
/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
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
  try {
    const { slug } = await params;

    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const role = user.role as "seller" | "admin" | "user" | "guest";
    const userId = user.uid;

    // Try direct document access first (slug === doc ID)
    let shopDoc = await Collections.shops().doc(slug).get();
    let shop: any;
    let docId: string;

    if (!shopDoc.exists) {
      // Fallback: Legacy data with random ID
      const shopSnapshot = await Collections.shops()
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (shopSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Shop not found" },
          { status: 404 },
        );
      }
      const legacyDoc = shopSnapshot.docs[0];
      shop = { id: legacyDoc.id, ...legacyDoc.data() };
      docId = legacyDoc.id;
    } else {
      shop = { id: shopDoc.id, ...shopDoc.data() };
      docId = shopDoc.id;
    }

    const isOwner = shop.owner_id === userId;
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Guard rails: prevent deletion if active products or pending orders exist
    const productsSnapshot = await Collections.products()
      .where("shop_id", "==", docId)
      .where("status", "==", "active")
      .limit(1)
      .get();
    if (!productsSnapshot.empty) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error:
            "Cannot delete shop with active products. Deactivate or remove products first.",
        },
        { status: 400 },
      );
    }

    /**
     * Performs orders snapshot operation
     *
     * @returns {any} The orderssnapshot result
     */

    /**
     * Performs orders snapshot operation
     *
     * @returns {any} The orderssnapshot result
     */

    const ordersSnapshot = (await Collections.orders()
      .where("shop_id", "==", docId)
      .where("status", "in", [
        "pending",
        "confirmed",
        "processing",
        "shipped",
      ])) as any;
    const ordersSnap = await ordersSnapshot.limit(1).get();
    if (!ordersSnap.empty) {
      return NextResponse.json(
        { success: false, error: "Cannot delete shop with pending orders." },
        { status: 400 },
      );
    }

    await Collections.shops().doc(docId).delete();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Shop deleted successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.detail.DELETE",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
