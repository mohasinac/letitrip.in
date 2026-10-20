import { z } from "zod";
import { withProviders } from "@/providers.config";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { submitEmiInstallmentPaymentAction } from "@mohasinac/appkit/server";

/**
 * The BUYER's half of EMI instalment payment.
 *
 * 🛑 Distinct from `PATCH /api/store/orders/[id]/emi-installment`, which is the
 * seller confirming receipt. Before this route there was no buyer side at all:
 * a buyer on an EMI plan could not pay an instalment, they waited for the
 * seller to record one. The two are deliberately separate endpoints with
 * separate roles — the buyer REPORTS a payment, the seller CONFIRMS it, and
 * only the seller's path can write `paid` (and therefore flip `emiComplete`,
 * which gates shipment).
 *
 * No due-date bound, by design. A buyer may pay any unpaid instalment whenever
 * they like, including the whole plan up front — see the action's docstring.
 */
const submitEmiInstallmentSchema = z.object({
  installmentIndex: z.number().int().min(1),
  /**
   * Required here, unlike on the seller's schema where it is optional.
   *
   * The seller is recording money they can already see in their account, so
   * they may have no reference to hand. A buyer reporting a payment nobody has
   * confirmed yet IS the reference — without it there is nothing for the
   * reviewer to match against, and the submission would be an unverifiable
   * claim that still blocks re-submission.
   */
  transactionId: z.string().min(1),
  proofUrl: z.string().min(1).optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof submitEmiInstallmentSchema)["_output"]>({
    /*
     * `auth: true` and nothing else, matching every sibling under
     * `/api/user/**` (e.g. `orders/[id]/cancel`). The authorisation that
     * matters here is OWNERSHIP, not a role — the action checks
     * `order.userId` against the caller, which is the only layer that knows
     * whose order this is. A `roles` list would admit any buyer and still
     * leave that check doing the real work.
     */
    auth: true,
    schema: submitEmiInstallmentSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const result = await submitEmiInstallmentPaymentAction(id, body!);
      if (!result.ok) {
        return errorResponse(result.error ?? "Failed to submit instalment payment", 400);
      }
      return successResponse(result.data);
    },
  }),
);
