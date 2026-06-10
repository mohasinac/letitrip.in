import { withProviders } from "@/providers.config";
/**
 * Admin Bids API Route
 * GET /api/admin/bids
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { bidRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(createApiHandler({
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:bids:read",
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
      "-bidDate";
    const result = await bidRepository.list({ filters, sorts, page, pageSize });
    return successResponse({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  },
}));

