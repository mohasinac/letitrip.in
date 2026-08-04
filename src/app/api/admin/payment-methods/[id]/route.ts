import { withProviders } from "@/providers.config";
/**
 * Admin Payment Methods API — Individual method
 *
 * PATCH /api/admin/payment-methods/[id] — Ban, approve unban, reject unban, flag suspicious, clear ban
 */

import { z } from "zod";
import { createRouteHandler, successResponse, errorResponse, savedPaymentMethodsRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

const actionSchema = z.object({
  action: z.enum(["ban", "approve_unban", "reject_unban", "flag_suspicious", "clear_ban"]),
  banReason: z.string().optional(),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof actionSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:addresses:write",
    schema: actionSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as Record<string, string>).id;
      const method = await savedPaymentMethodsRepository.findById(id);
      if (!method) return errorResponse("Payment method not found", 404);

      const { action, banReason } = body!;

      if (action === "ban") {
        await savedPaymentMethodsRepository.banById(id, {
          banReason: banReason ?? "Banned by admin",
          bannedBy: user!.uid,
        });
        return successResponse({ id }, "Payment method banned");
      }

      if (action === "approve_unban") {
        await savedPaymentMethodsRepository.clearBanById(id);
        return successResponse({ id }, "Payment method unban approved");
      }

      if (action === "reject_unban") {
        await savedPaymentMethodsRepository.update(id, {
          banStatus: "banned",
          unbanRequestNote: undefined,
          unbanRequestedAt: undefined,
        } as Parameters<typeof savedPaymentMethodsRepository.update>[1]);
        return successResponse({ id }, "Unban request rejected");
      }

      if (action === "flag_suspicious") {
        await savedPaymentMethodsRepository.update(id, { banStatus: "suspicious" } as Parameters<typeof savedPaymentMethodsRepository.update>[1]);
        return successResponse({ id }, "Payment method flagged as suspicious");
      }

      if (action === "clear_ban") {
        await savedPaymentMethodsRepository.clearBanById(id);
        return successResponse({ id }, "Ban cleared");
      }

      return errorResponse("Unknown action", 400);
    },
  }),
);
