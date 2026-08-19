import { withProviders } from "@/providers.config";
/**
 * Admin Payment Methods API — Collection
 *
 * GET /api/admin/payment-methods — List payment methods, optionally filtered by banStatus
 */

import { createRouteHandler, successResponse, savedPaymentMethodsRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const banStatus = url.searchParams.get("banStatus") as "banned" | "suspicious" | null;
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);
      const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

      if (banStatus && (banStatus === "banned" || banStatus === "suspicious")) {
        const items = await savedPaymentMethodsRepository.listByBanStatus(banStatus, limit, offset);
        return successResponse({ items, total: items.length });
      }

      return successResponse({ items: [], total: 0 });
    },
  }),
);
