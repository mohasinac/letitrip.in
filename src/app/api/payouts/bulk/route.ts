/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payouts/bulk/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { requireAdmin } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Status requirements for each action
const STATUS_REQUIREMENTS: Record<
  string,
  { required?: string[]; excluded?: string[]; message: string }
> = {
  /** Approve */
  approve: {
    /** Required */
    required: ["pending"],
    /** Message */
    message: "Only pending payouts can be approved",
  },
  /** Process */
  process: {
    /** Required */
    required: ["pending", "approved"],
    /** Message */
    message: "Only pending or approved payouts can be processed",
  },
  /** Complete */
  complete: {
    /** Required */
    required: ["processing"],
    /** Message */
    message: "Only processing payouts can be completed",
  },
  /** Reject */
  reject: {
    /** Required */
    required: ["pending"],
    /** Message */
    message: "Only pending payouts can be rejected",
  },
  /** Delete */
  delete: {
    /** Excluded */
    excluded: ["completed", "processing"],
    /** Message */
    message: "Cannot delete completed or processing payouts",
  },
};

// Build update object for each action
/**
 * Function: Build Payout Update
 */
/**
 * Performs build payout update operation
 *
 * @param {string} action - The action
 * @param {string} userId - user identifier
 * @param {any} [data] - Data object containing information
 *
 * @returns {string} The buildpayoutupdate result
 */

/**
 * Performs build payout update operation
 *
 * @returns {string} The buildpayoutupdate result
 */

function buildPayoutUpdate(
  /** Action */
  action: string,
  /** User Id */
  userId: string,
  /** Data */
  data?: any,
): Record<string, any> | null {
  const now = new Date();
  switch (action) {
    case "approve":
      return { status: "approved", approved_at: now, updated_at: now };
    case "process":
      return {
        /** Status */
        status: "processing",
        processing_at: now,
        processed_by: userId,
        updated_at: now,
      };
    case "complete":
      return { status: "completed", completed_at: now, updated_at: now };
    case "reject":
      return {
        /** Status */
        status: "rejected",
        rejected_at: now,
        failure_reason: data?.reason || "Rejected by admin",
        updated_at: now,
      };
    case "update":
      if (!data) return null;
      const updates: Record<string, any> = { updated_at: now };
      if ("status" in data) updates.status = data.status;
      if ("transaction_id" in data)
        updates.transaction_id = data.transaction_id;
      if ("notes" in data) updates.notes = data.notes;
      return updates;
    /** Default */
    default:
      return null;
  }
}

/**
 * Unified Bulk Operations for Payouts
 * POST /api/payouts/bulk
 * Admin only
 *
 * Actions: approve, process, complete, reject, delete, update
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
  let operation: string | undefined;
  let idsLength = 0;
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const body = await request.json();
    const { action, ids, data } = body;
    operation = action;
    idsLength = ids?.length || 0;

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
        const payoutRef = Collections.payouts().doc(id);
        const payoutDoc = await payoutRef.get();

        if (!payoutDoc.exists) {
          results.failed.push({ id, error: "Payout not found" });
          continue;
        }

        const payout: any = payoutDoc.data();

        // Validate status requirements
        const requirement = STATUS_REQUIREMENTS[action];
        if (requirement) {
          if (
            requirement.required &&
            !requirement.required.includes(payout.status)
          ) {
            results.failed.push({ id, error: requirement.message });
            continue;
          }
          if (
            requirement.excluded &&
            requirement.excluded.includes(payout.status)
          ) {
            results.failed.push({ id, error: requirement.message });
            continue;
          }
        }

        // Handle delete action
        if (action === "delete") {
          await payoutRef.delete();
          results.success.push(id);
          continue;
        }

        // Build and apply update
        const updates = buildPayoutUpdate(action, user.uid, data);
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

        await payoutRef.update(updates);
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
      component: "API.payouts.bulk.POST",
      /** Metadata */
      metadata: { operation, idsCount: idsLength },
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
