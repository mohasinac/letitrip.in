/**
 * @fileoverview TypeScript Module
 * @module src/app/api/users/bulk/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/users/bulk
 * Bulk operations on users (admin only)
 *
 * Supported actions:
 * - make-seller: Change role to seller
 * - make-user: Change role to user
 * - ban: Ban users
 * - unban: Unban users
 * - verify-email: Verify email
 * - verify-phone: Verify phone
 * - delete: Delete users
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
  let body: any;
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    body = await request.json();
    const { action, ids, data } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Action and IDs are required" },
        { status: 400 },
      );
    }

    const results = {
      /** Success */
      success: [] as string[],
      /** Failed */
      failed: [] as Array<{ id: string; error: string }>,
    };

    for (const id of ids) {
      try {
        const userRef = Collections.users().doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          results.failed.push({ id, error: "User not found" });
          continue;
        }

        const updates: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        switch (action) {
          case "make-seller":
            updates.role = "seller";
            break;

          case "make-user":
            updates.role = "user";
            break;

          case "ban":
            updates.is_banned = true;
            updates.ban_reason = data?.banReason || "Bulk ban action";
            updates.banned_at = new Date().toISOString();
            updates.banned_by = user.uid;
            break;

          case "unban":
            updates.is_banned = false;
            updates.ban_reason = null;
            updates.banned_at = null;
            updates.banned_by = null;
            break;

          case "verify-email":
            updates.email_verified = true;
            break;

          case "verify-phone":
            updates.phone_verified = true;
            break;

          case "delete":
            await userRef.delete();
            results.success.push(id);
            continue;

          /** Default */
          default:
            results.failed.push({ id, error: `Unknown action: ${action}` });
            continue;
        }

        await userRef.update(updates);
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, error: error.message });
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
      component: "API.users.bulk",
      /** Metadata */
      metadata: { action: body?.action, idsCount: body?.ids?.length },
    });
    return NextResponse.json(
      { success: false, error: "Bulk operation failed" },
      { status: 500 },
    );
  }
}
