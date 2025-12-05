/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/bulk/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { requireAdmin } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Build update object for each action
/**
 * Function: Build Shop Update
 */
/**
 * Performs build shop update operation
 *
 * @param {string} action - The action
 * @param {any} [data] - Data object containing information
 *
 * @returns {string} The buildshopupdate result
 */

/**
 * Performs build shop update operation
 *
 * @returns {string} The buildshopupdate result
 */

function buildShopUpdate(
  /** Action */
  action: string,
  /** Data */
  data?: any,
): Record<string, any> | null {
  const now = new Date();
  switch (action) {
    case "verify":
      return { is_verified: true, updated_at: now };
    case "unverify":
      return { is_verified: false, updated_at: now };
    case "feature":
      return { is_featured: true, updated_at: now };
    case "unfeature":
      return { is_featured: false, updated_at: now };
    case "activate":
      return { is_active: true, is_banned: false, updated_at: now };
    case "deactivate":
      return { is_active: false, updated_at: now };
    case "ban":
      return {
        is_banned: true,
        is_active: false,
        ban_reason: data?.banReason || "Bulk ban action",
        updated_at: now,
      };
    case "unban":
      return { is_banned: false, ban_reason: null, updated_at: now };
    case "update":
      if (!data) return null;
      const allowedFields = [
        "is_verified",
        "is_featured",
        "show_on_homepage",
        "is_banned",
        "ban_reason",
      ];
      const updates: Record<string, any> = { updated_at: now };
      for (const field of allowedFields) {
        if (field in data) updates[field] = data[field];
      }
      return updates;
    /** Default */
    default:
      return null;
  }
}

// Check if shop can be deleted
/**
 * Function: Can Delete Shop
 */
/**
 * Checks if delete shop
 *
 * @param {string} shopId - shop identifier
 *
 * @returns {Promise<any>} Promise resolving to candeleteshop result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Checks if delete shop
 *
 * @param {string} shopId - shop identifier
 *
 * @returns {Promise<any>} Promise resolving to candeleteshop result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function canDeleteShop(shopId: string): Promise<string | null> {
  const productsSnapshot = await Collections.products()
    .where("shop_id", "==", shopId)
    .limit(1)
    .get();
  if (!productsSnapshot.empty) return "Shop has products";

  const auctionsSnapshot = await Collections.auctions()
    .where("shop_id", "==", shopId)
    .limit(1)
    .get();
  if (!auctionsSnapshot.empty) return "Shop has auctions";

  return null;
}

/**
 * Unified Bulk Operations for Shops
 * POST /api/shops/bulk
 * Admin only
 *
 * Actions: verify, unverify, feature, unfeature, activate, deactivate, ban, unban, delete, update
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
    // Require admin role
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { action, ids, data } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Invalid request. Provide action and ids array.",
        },
        { status: 400 },
      );
    }

    const results = {
      /** Success */
      success: [] as string[],
      /** Failed */
      failed: [] as { id: string; error: string }[],
    };

    for (const id of ids) {
      try {
        const shopRef = Collections.shops().doc(id);
        const shopDoc = await shopRef.get();

        if (!shopDoc.exists) {
          results.failed.push({ id, error: "Shop not found" });
          continue;
        }

        // Handle delete action separately
        if (action === "delete") {
          const deleteError = await canDeleteShop(id);
          if (deleteError) {
            results.failed.push({ id, error: deleteError });
          } else {
            await shopRef.delete();
            results.success.push(id);
          }
          continue;
        }

        // Build and apply update
        const updates = buildShopUpdate(action, data);
        if (!updates) {
          results.failed.push({
            id,
            /** Error */
            error:
              action === "update"
                ? "No update data provided"
                : `Unknown action: ${action}`,
          });
          continue;
        }

        await shopRef.update(updates);
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, error: error.message || "Operation failed" });
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      action,
      results,
      /** Summary */
      summary: {
        /** Total */
        total: ids.length,
        /** Succeeded */
        succeeded: results.success.length,
        /** Failed */
        failed: results.failed.length,
      },
    });
  } catch (error: any) {
    logError(error as Error, { component: "API.shops.bulk" });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Bulk operation failed",
      },
      { status: 500 },
    );
  }
}
