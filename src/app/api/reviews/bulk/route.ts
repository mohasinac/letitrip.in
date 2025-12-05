/**
 * @fileoverview TypeScript Module
 * @module src/app/api/reviews/bulk/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { requireAdmin } from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Build update object for each action
/**
 * Function: Build Review Update
 */
/**
 * Performs build review update operation
 *
 * @param {string} action - The action
 * @param {any} [data] - Data object containing information
 *
 * @returns {string} The buildreviewupdate result
 */

/**
 * Performs build review update operation
 *
 * @returns {string} The buildreviewupdate result
 */

function buildReviewUpdate(
  /** Action */
  action: string,
  /** Data */
  data?: any,
): Record<string, any> | null {
  const now = new Date().toISOString();
  switch (action) {
    case "approve":
      return { status: "published", approved_at: now, updated_at: now };
    case "reject":
      return { status: "rejected", rejected_at: now, updated_at: now };
    case "flag":
      return { is_flagged: true, flagged_at: now, updated_at: now };
    case "unflag":
      return { is_flagged: false, flagged_at: null, updated_at: now };
    case "update":
      if (!data) return null;
      const updates: Record<string, any> = { updated_at: now };
      if ("status" in data) updates.status = data.status;
      if ("is_flagged" in data) updates.is_flagged = data.is_flagged;
      return updates;
    /** Default */
    default:
      return null;
  }
}

/**
 * Unified Bulk Operations for Reviews
 * POST /api/reviews/bulk
 * Admin only
 *
 * Actions: approve, reject, flag, unflag, delete, update
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
  let action: string | undefined;
  let ids: string[] = [];
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    action = body.action;
    ids = body.ids;
    const data = body.data;

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

    const db = getFirestoreAdmin();
    const results = {
      /** Success */
      success: [] as string[],
      /** Failed */
      failed: [] as { id: string; error: string }[],
    };

    for (const id of ids) {
      try {
        const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc(id);
        const reviewDoc = await reviewRef.get();

        if (!reviewDoc.exists) {
          results.failed.push({ id, error: "Review not found" });
          continue;
        }

        // Handle delete action
        if (action === "delete") {
          await reviewRef.delete();
          results.success.push(id);
          continue;
        }

        // Build and apply update
        const updates = buildReviewUpdate(action, data);
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

        await reviewRef.update(updates);
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
    logError(error as Error, {
      /** Component */
      component: "API.reviews.bulk.POST",
      /** Metadata */
      metadata: { action, idsCount: ids.length },
    });
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
