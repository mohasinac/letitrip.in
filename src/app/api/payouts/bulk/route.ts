import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * Unified Bulk Operations for Payouts
 * POST /api/payouts/bulk
 * Admin only
 *
 * Actions: approve, process, complete, reject, delete, update
 */

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
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

    const results = {
      success: [] as string[],
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

        switch (action) {
          case "approve":
            if (payout.status !== "pending") {
              results.failed.push({
                id,
                error: "Only pending payouts can be approved",
              });
              continue;
            }
            await payoutRef.update({
              status: "approved",
              approved_at: new Date(),
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "process":
            if (payout.status !== "pending" && payout.status !== "approved") {
              results.failed.push({
                id,
                error: "Only pending or approved payouts can be processed",
              });
              continue;
            }
            await payoutRef.update({
              status: "processing",
              processing_at: new Date(),
              processed_by: user.uid,
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "complete":
            if (payout.status !== "processing") {
              results.failed.push({
                id,
                error: "Only processing payouts can be completed",
              });
              continue;
            }
            await payoutRef.update({
              status: "completed",
              completed_at: new Date(),
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "reject":
            if (payout.status !== "pending") {
              results.failed.push({
                id,
                error: "Only pending payouts can be rejected",
              });
              continue;
            }
            await payoutRef.update({
              status: "rejected",
              rejected_at: new Date(),
              failure_reason: data?.reason || "Rejected by admin",
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "delete":
            // Only allow deleting rejected or cancelled payouts
            if (
              payout.status === "completed" ||
              payout.status === "processing"
            ) {
              results.failed.push({
                id,
                error: "Cannot delete completed or processing payouts",
              });
              continue;
            }
            await payoutRef.delete();
            results.success.push(id);
            break;

          case "update":
            if (!data) {
              results.failed.push({ id, error: "No update data provided" });
              continue;
            }

            // Only allow specific fields to be updated in bulk
            const updates: Record<string, any> = { updated_at: new Date() };

            if ("status" in data) updates.status = data.status;
            if ("transaction_id" in data)
              updates.transaction_id = data.transaction_id;
            if ("notes" in data) updates.notes = data.notes;

            await payoutRef.update(updates);
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
    console.error("Bulk payouts operation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Bulk operation failed",
      },
      { status: 500 }
    );
  }
}
