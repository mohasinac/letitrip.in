import { withFeatureGuard } from "@/lib/features";
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
 * Manual clawback — deduct a refund amount from a pending payout's net amount.
 * deductedAmount defaults to 95% of refundedAmount (platform keeps its 5% fee
 * share on refunds) when not explicitly provided.
 */

const deductionSchema = z.object({
  orderId: z.string().min(1),
  refundId: z.string().min(1),
  refundedAmount: z.number().int().positive(),
  deductedAmount: z.number().int().positive().optional(),
  reason: z.string().min(3).max(500),
});

const __POST__g = withProviders(
  createRouteHandler<(typeof deductionSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:payouts:write",
    schema: deductionSchema,
    handler: async ({ params, body }) => {
      const id = (params as { id: string }).id;
      const data = body!;
      const deductedAmount = data.deductedAmount ?? Math.round(data.refundedAmount * 0.95);

      try {
        const updated = await payoutRepository.applyRefundDeduction(id, {
          orderId: data.orderId,
          refundId: data.refundId,
          refundedAmount: data.refundedAmount,
          deductedAmount,
          reason: data.reason,
        });
        return successResponse(updated, "Deduction applied");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("not found")) return errorResponse(message, 404);
        if (message.includes('status "')) return errorResponse(message, 409);
        throw err;
      }
    },
  }),
);
export const POST = withFeatureGuard("PAYOUTS", __POST__g);
