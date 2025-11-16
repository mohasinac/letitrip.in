import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Unified Bulk Operations for Reviews
 * POST /api/reviews/bulk
 * Admin only
 *
 * Actions: approve, reject, flag, unflag, delete, update
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
          success: false,
          error: "Invalid request. Provide action and ids array.",
        },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    const results = {
      success: [] as string[],
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

        switch (action) {
          case "approve":
            await reviewRef.update({
              status: "published",
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            results.success.push(id);
            break;

          case "reject":
            await reviewRef.update({
              status: "rejected",
              rejected_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            results.success.push(id);
            break;

          case "flag":
            await reviewRef.update({
              is_flagged: true,
              flagged_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            results.success.push(id);
            break;

          case "unflag":
            await reviewRef.update({
              is_flagged: false,
              flagged_at: null,
              updated_at: new Date().toISOString(),
            });
            results.success.push(id);
            break;

          case "delete":
            await reviewRef.delete();
            results.success.push(id);
            break;

          case "update":
            if (!data) {
              results.failed.push({ id, error: "No update data provided" });
              continue;
            }

            // Only allow specific fields to be updated in bulk
            const updates: Record<string, any> = {
              updated_at: new Date().toISOString(),
            };

            if ("status" in data) updates.status = data.status;
            if ("is_flagged" in data) updates.is_flagged = data.is_flagged;

            await reviewRef.update(updates);
            results.success.push(id);
            break;

          default:
            results.failed.push({ id, error: `Unknown action: ${action}` });
        }
      } catch (error: any) {
        results.failed.push({
          id,
          error: error.message || "Operation failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      action,
      results,
      summary: {
        total: ids.length,
        succeeded: results.success.length,
        failed: results.failed.length,
      },
    });
  } catch (error: any) {
    console.error("Bulk reviews operation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Bulk operation failed",
      },
      { status: 500 }
    );
  }
}
