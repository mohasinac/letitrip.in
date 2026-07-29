/**
 * PATCH /api/admin/orders/[id]/payment-verify
 *
 * Admin/moderator manually verifies that a cash/UPI payment was received.
 * Sets paymentStatus="paid" and moves the order to "processing".
 *
 * Returns: { ok: true } | error
 */

import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, errorResponse } from "@mohasinac/appkit";
import { adminVerifyPaymentAction } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_MOD } from "@/constants/api-roles";

export const PATCH = withProviders(
  createRouteHandler({
    roles: ROLES_ADMIN_MOD,
    permission: "orders:manage",
    handler: async ({ request, params }) => {
      const { id } = params as { id: string };

      const result = await adminVerifyPaymentAction(id);

      if (!result.ok) {
        if (result.error?.includes("UNAUTHORIZED") || result.error?.includes("moderator")) {
          return errorResponse("Only admin or moderator can verify payments", 403, "FORBIDDEN");
        }
        if (result.error?.includes("NOT_FOUND") || result.error?.includes("not found")) {
          return errorResponse("Order not found", 404, "NOT_FOUND");
        }
        return errorResponse(result.error ?? "Failed to verify payment", 400);
      }

      return successResponse({ ok: true });
    },
  }),
);
