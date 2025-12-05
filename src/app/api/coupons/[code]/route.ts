/**
 * @fileoverview TypeScript Module
 * @module src/app/api/coupons/[code]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";

/**
 * GET /api/coupons/[code]
 * Get single coupon by code
 * - Public: Active coupons only
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
 * @param {{ params: Promise<{ code: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The get result
 *
 * @example
 * GET(request, {});
 */
export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getUserFromRequest(request);
    const role = user?.role || "guest";

    const snapshot = await Collections.coupons()
      .where("code", "==", code)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 },
      );
    }
    const doc = snapshot.docs[0];
    const data: any = { id: doc.id, ...doc.data() };

    if ((role === "guest" || role === "user") && !data.is_active) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupon" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/coupons/[code]
 * Update coupon (owner/admin only)
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
 * @param {{ params: Promise<{ code: string }> }} { params } - The { params }
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
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    const { code } = await params;

    const snapshot = await Collections.coupons()
      .where("code", "==", code)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 },
      );
    }

    const doc = snapshot.docs[0];
    const coupon: any = { id: doc.id, ...doc.data() };

    if (role === "seller") {
      const ownsShop = await userOwnsShop(coupon.shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    const body = await request.json();
    const update: any = { ...body, updated_at: new Date().toISOString() };
    delete update.id;
    delete update.shop_id;
    delete update.code;
    delete update.created_at;

    await Collections.coupons().doc(coupon.id).update(update);
    const updated = await Collections.coupons().doc(coupon.id).get();
    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update coupon" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/coupons/[code]
 * Delete coupon (owner/admin only)
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
 * @param {{ params: Promise<{ code: string }> }} { params } - The { params }
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
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    const { code } = await params;

    const snapshot = await Collections.coupons()
      .where("code", "==", code)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 },
      );
    }

    const doc = snapshot.docs[0];
    const coupon: any = { id: doc.id, ...doc.data() };

    if (role === "seller") {
      const ownsShop = await userOwnsShop(coupon.shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    await Collections.coupons().doc(coupon.id).delete();
    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
