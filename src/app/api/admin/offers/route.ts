import { withProviders } from "@/providers.config";
/**
 * Admin Offers API Route
 * GET /api/admin/offers
 *
 * Deliberately NOT gated on `featureFlags.offers`. That flag stops NEW offers
 * being made; an admin must still be able to see (and clear) the ones already
 * in flight after it is switched off — otherwise turning the feature off would
 * strand every open negotiation with no way to inspect it.
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { offerRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createApiHandler({
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:offers:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, Number(url.searchParams.get("pageSize")) || 50),
      );
      const filters = url.searchParams.get("filters") ?? undefined;
      const sorts =
        url.searchParams.get("sorts") ??
        url.searchParams.get("sort") ??
        "-createdAt";
      const result = await offerRepository.list({ filters, sorts, page, pageSize });
      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    },
  }),
);
