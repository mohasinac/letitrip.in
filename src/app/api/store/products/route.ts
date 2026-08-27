import { withProviders } from "@/providers.config";
import { listingProcessorFirstExecutor } from "@/lib/listing-processor";
/**
 * Seller Products API Route
 * GET /api/store/products â€” Returns the authenticated seller's products
 *                            (enforces storeId=={ownerStore.id} server-side)
 *
 * Mutations use Server Action: createSellerProductAction.
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";
import {
  listPublicProducts,
  parsePublicProductParams,
  ANY_STATUS,
} from "@mohasinac/appkit/server";
import { ROLES_STORE_READ } from "@/constants";
import { sortBy, PRODUCT_FIELDS } from "@mohasinac/appkit";

const DEFAULT_SORT = sortBy(PRODUCT_FIELDS.CREATED_AT, "DESC");

export const GET = withProviders(createApiHandler({
  roles: [...ROLES_STORE_READ],
    permission: "store:api:read",
  handler: async ({ request, user }) => {
    // Resolve the store owned by this user â€” storeId is the public-facing key on products
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) {
      return ApiErrors.forbidden("No store found for this account");
    }

    const url = new URL(request.url);

    // Shares the one listing query with every public surface, so a seller
    // filtering their own auctions issues the same shape /auctions does — and
    // gets the availability scope, the bounded-fan-out and the `truncated`
    // honesty for free instead of a fourth hand-rolled filter builder.
    const result = await listPublicProducts({
      ...parsePublicProductParams(url.searchParams, {
        pageSize: Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 25)),
        sorts: url.searchParams.get("sorts") ?? url.searchParams.get("sort") ?? DEFAULT_SORT,
      }),
      // A dashboard exists to show drafts and archived rows, which the public
      // default would hide.
      status: ANY_STATUS,
      // Server-side security: the store identity comes from the session, never
      // from the URL, so a seller cannot read another store's inventory.
      storeId: store.id,
      rawFilters: url.searchParams.get("filters") || null,
    }, {
      // Same omission as the admin route: no options meant no executor, so a
      // seller's ANY_STATUS inventory query ran inside Vercel rather than in
      // the colocated Function.
      executor: listingProcessorFirstExecutor,
    });

    if (!result) {
      return ApiErrors.internalError("Product search is temporarily unavailable.");
    }

    return successResponse({
      products: result.items,
      meta: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
        truncated: result.truncated,
      },
    });
  },
}));