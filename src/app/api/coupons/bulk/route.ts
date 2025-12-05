/**
 * @fileoverview TypeScript Module
 * @module src/app/api/coupons/bulk/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

// Build update object for each action
/**
 * Function: Build Coupon Update
 */
/**
 * Performs build coupon update operation
 *
 * @param {string} action - The action
 * @param {string} now - The now
 * @param {any} [data] - Data object containing information
 *
 * @returns {string} The buildcouponupdate result
 */

/**
 * Performs build coupon update operation
 *
 * @returns {string} The buildcouponupdate result
 */

function buildCouponUpdate(
  /** Action */
  action: string,
  /** Now */
  now: string,
  /** Data */
  data?: any,
): Record<string, any> | null {
  switch (action) {
    case "activate":
      return { is_active: true, updated_at: now };
    case "deactivate":
      return { is_active: false, updated_at: now };
    case "update":
      if (!data) return null;
      const updates = { ...data, updated_at: now };
      delete updates.id;
      delete updates.shop_id;
      delete updates.code;
      delete updates.created_at;
      return updates;
    /** Default */
    default:
      return null;
  }
}

/**
 * POST /api/coupons/bulk
 * Bulk operations on coupons
 * - Admin: Can perform all operations on any coupon
 * - Seller: Can only perform operations on coupons from their shop
 *
 * Supported actions:
 * - activate: Activate coupons
 * - deactivate: Deactivate coupons
 * - delete: Delete coupons
 * - update: Update coupon fields
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Only sellers and admins can perform bulk operations",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { action, couponIds, data } = body;

    if (!action || !Array.isArray(couponIds) || couponIds.length === 0) {
      throw new ValidationError("Action and couponIds array are required");
    }

    const validActions = ["activate", "deactivate", "delete", "update"];
    if (!validActions.includes(action)) {
      throw new ValidationError(
        `Invalid action. Must be one of: ${validActions.join(", ")}`,
      );
    }

    const results = [];
    const now = new Date().toISOString();

    for (const couponId of couponIds) {
      try {
        const couponRef = Collections.coupons().doc(couponId);
        const couponDoc = await couponRef.get();

        if (!couponDoc.exists) {
          results.push({
            /** Id */
            id: couponId,
            /** Success */
            success: false,
            /** Error */
            error: "Coupon not found",
          });
          continue;
        }

        const couponData: any = couponDoc.data();

        // Sellers can only edit coupons from their shop
        if (role === "seller") {
          const ownsShop = await userOwnsShop(couponData.shop_id, user.uid);
          if (!ownsShop) {
            results.push({
              /** Id */
              id: couponId,
              /** Success */
              success: false,
              /** Error */
              error: "Not authorized to edit this coupon",
            });
            continue;
          }
        }

        // Handle delete action
        if (action === "delete") {
          await couponRef.delete();
          results.push({ id: couponId, success: true });
          continue;
        }

        // Build and apply update
        const updates = buildCouponUpdate(action, now, data);
        if (!updates) {
          results.push({
            /** Id */
            id: couponId,
            /** Success */
            success: false,
            /** Error */
            error:
              action === "update"
                ? "Update data is required"
                : `Unknown action: ${action}`,
          });
          continue;
        }

        await couponRef.update(updates);
        results.push({ id: couponId, success: true });
      } catch (err: any) {
        results.push({
          /** Id */
          id: couponId,
          /** Success */
          success: false,
          /** Error */
          error: err.message || "Failed to process coupon",
        });
      }
    }

    /**
 * Performs success count operation
 *
 * @param {any} (r - The (r
 *
 * @returns {any} The successcount result
 *
 */
const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      /** Success */
      success: true,
      results,
      /** Summary */
      summary: {
        /** Total */
        total: couponIds.length,
        /** Succeeded */
        succeeded: successCount,
        /** Failed */
        failed: failureCount,
      },
    });
  } catch (error: any) {
    console.error("Bulk coupon operation error:", error);
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 },
    );
  }
}
