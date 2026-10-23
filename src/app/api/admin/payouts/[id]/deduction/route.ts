import { withProviders } from "@/providers.config";
import { z } from "zod";
import { payoutRepository } from "@mohasinac/appkit/features/payments/repository/payout.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { recordAdminAction } from "@mohasinac/appkit/server";
import { AdminAuditActionValues } from "@mohasinac/appkit/features/audit-log/schemas/firestore";

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
  refundedAmount: z.number().positive(),
  deductedAmount: z.number().positive().optional(),
  reason: z.string().min(3).max(500),
});

const __POST__g = withProviders(
  createRouteHandler<(typeof deductionSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:payouts:write",
    schema: deductionSchema,
    handler: async ({ params, body, user }) => {
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
        /*
         * A deduction REDUCES what a seller is paid. It is netted against
         * a pending payout, so by the time the seller notices the figure
         * has already moved — which makes "who applied this" the first
         * question, and the payout row alone cannot answer it.
         */
        void recordAdminAction({
          actorUid: user!.uid,
          actorName: user!.name ?? undefined,
          action: AdminAuditActionValues.PAYOUT_MARK_PAID,
          targetType: "payout",
          targetId: (params as { id: string }).id,
          metadata: { change: "deduction-applied" },
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
export const POST = __POST__g;
