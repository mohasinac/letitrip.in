import { withProviders } from "@/providers.config";
/**
 * Seller Products API Route
 * GET /api/seller/products — Returns the authenticated seller's products
 *                            (enforces sellerId=={uid} server-side)
 *
 * Mutations use Server Action: createSellerProductAction.
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";

export const GET = withProviders(createApiHandler({
  roles: ["seller", "admin", "moderator"],
  handler: async ({ request, user }) => {
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

    // Server-side security: force sellerId filter so sellers can't see others' products
    const sellerFilter = `sellerId==${user!.uid}`;
    const filters = clientFilters
      ? `${sellerFilter},${clientFilters}`
      : sellerFilter;

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

