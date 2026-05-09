import { withProviders } from "@/providers.config";
/**
 * Seller Coupons API Route
 * GET /api/store/coupons — Returns all coupons owned by the authenticated seller
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { couponsRepository, storeRepository } from "@mohasinac/appkit";

export const GET = withProviders(createApiHandler({
  roles: ["seller", "admin", "moderator"],
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      200,
      Math.max(1, Number(url.searchParams.get("pageSize")) || 100),
    );
    const sorts =
      url.searchParams.get("sorts") ??
      url.searchParams.get("sort") ??
      "-createdAt";

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const result = await couponsRepository.list({
      filters: `storeId==${store.id}`,
      sorts,
      page,
      pageSize,
    });

    return successResponse({ coupons: result.items, total: result.total });
  },
}));

