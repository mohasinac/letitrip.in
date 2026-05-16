import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  payoutRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * POST /api/admin/payouts/[id]/deduction
 *
 * Manually apply a refund deduction to a payout.
 * Used when the automatic fire-and-forget path missed (e.g. payout was already
 * completed and a new pending payout needs the clawback recorded), or when
 * an admin wants to record an out-of-band deduction.
 *
 * Only valid while payout.status = "pending". Returns 409 otherwise.
 */

const deductionSchema = z.object({
  orderId: z.string().min(1),
  refundId: z.string().min(1),
  /** Gross refund amount in paise. */
  refundedAmount: z.number().int().positive(),
  /** Net seller deduction in paise. If omitted, computed as refundedAmount × 0.95. */
  deductedAmount: z.number().int().positive().optional(),
  reason: z.string().min(3).max(500),
});

export const POST = withProviders(
  createRouteHandler<(typeof deductionSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:payouts:write",
    schema: deductionSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const { orderId, refundId, refundedAmount, reason } = body!;
      const deductedAmount = body!.deductedAmount ?? Math.round(refundedAmount * 0.95);

      try {
        const updated = await payoutRepository.applyRefundDeduction(id, {
          orderId,
          refundId,
          refundedAmount,
          deductedAmount,
          reason,
        });
        return successResponse(
          { id: updated.id, netAmount: updated.netAmount, refundDeductions: updated.refundDeductions },
          "Deduction applied",
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("not found")) return errorResponse("Payout not found", 404);
        if (msg.includes('status "')) return errorResponse(msg, 409);
        throw err;
      }
    },
  }),
);
