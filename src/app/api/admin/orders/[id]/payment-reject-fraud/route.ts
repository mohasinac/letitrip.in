/**
 * PATCH /api/admin/orders/[id]/payment-reject-fraud
 *
 * Admin/moderator rejects a payment proof as fraudulent — the severe tier
 * of the two-tier payment review. Cancels the order, restores stock, and
 * triggers a new temporary 7-day full-account hard ban (async, via the
 * existing hardBanCascade job — see adminRejectPaymentAsFraudAction).
 *
 * Body: { note: string }
 * Returns: { ok: true } | error
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, errorResponse } from "@mohasinac/appkit";
import { adminRejectPaymentAsFraudAction } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_MOD } from "@/constants";

const schema = z.object({
  note: z.string().min(1, "A reason is required"),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    roles: ROLES_ADMIN_MOD,
    permission: "orders:manage",
    schema,
    handler: async ({ params, body }) => {
      const { id } = params as { id: string };

      const result = await adminRejectPaymentAsFraudAction(id, body!.note);

      if (!result.ok) {
        if (result.error?.includes("UNAUTHORIZED") || result.error?.includes("moderator")) {
          return errorResponse("Only admin or moderator can reject a payment as fraudulent", 403, "FORBIDDEN");
        }
        if (result.error?.includes("NOT_FOUND") || result.error?.includes("not found")) {
          return errorResponse("Order not found", 404, "NOT_FOUND");
        }
        return errorResponse(result.error ?? "Failed to reject payment", 400);
      }

      return successResponse({ ok: true });
    },
  }),
);
