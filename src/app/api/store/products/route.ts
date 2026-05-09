import { withProviders } from "@/providers.config";
/**
 * Seller Products API Route
 * GET /api/store/products — Returns the authenticated seller's products
 *                            (enforces storeId=={ownerStore.id} server-side)
 *
 * Mutations use Server Action: createSellerProductAction.
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { productRepository, storeRepository } from "@mohasinac/appkit";

export const GET = withProviders(createApiHandler({
  roles: ["seller", "admin", "moderator"],
  handler: async ({ request, user }) => {
    // Resolve the store owned by this user — storeId is the public-facing key on products
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) {
      return ApiErrors.forbidden("No store found for this account");
    }

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("pageSize")) || 25),
    );
    const clientFilters = url.searchParams.get("filters") ?? "";
    const sorts =
      url.searchParams.get("sorts") ??
      url.searchParams.get("sort") ??
      "-createdAt";

    // Server-side security: force storeId filter so sellers can't see other stores' products
    const storeFilter = `storeId==${store.id}`;
    const filters = clientFilters
      ? `${storeFilter},${clientFilters}`
      : storeFilter;

    const result = await productRepository.list({
      filters,
      sorts,
      page,
      pageSize,
    });
    const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

    return successResponse({
      products: result.items,
      meta: {
        page: result.page,
        limit: pageSize,
        total: result.total,
        totalPages,
        hasMore: result.page < totalPages,
      },
    });
  },
}));
