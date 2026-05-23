/**
 * GET /api/store/reviews
 * Lists all reviews received on the authenticated seller's store products.
 * Supports ?rating=, ?replied= filters and sorting/pagination.
 */

import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse, storeRepository, reviewRepository } from "@mohasinac/appkit";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit";
import { sortBy, REVIEW_FIELDS } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const DEFAULT_SORTS = sortBy(REVIEW_FIELDS.CREATED_AT);

export const GET = withProviders(createApiHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) {
      return successResponse({
        reviews: [],
        meta: { total: 0, page: 1, pageSize: 20, totalPages: 0, hasMore: false },
      });
    }

    const sp = getSearchParams(request);
    const page = getNumberParam(sp, "page", 1, { min: 1 });
    const pageSize = getNumberParam(sp, "pageSize", 20, { min: 1, max: 100 });
    const rating = getStringParam(sp, "rating");
    const replied = getStringParam(sp, "replied");
    const sorts = getStringParam(sp, "sorts") || DEFAULT_SORTS;

    let filters = `storeId==${store.id}`;
    if (rating) filters += `,rating==${rating}`;

    const result = await reviewRepository.listForStore(store.id, {
      filters,
      sorts,
      page: String(page),
      pageSize: String(pageSize),
    });

    // Apply replied filter client-side (sellerReply not indexed)
    let reviews = result.items;
    if (replied === "true") reviews = reviews.filter((r) => !!r.sellerReply);
    if (replied === "false") reviews = reviews.filter((r) => !r.sellerReply);

    return successResponse({
      reviews,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      },
    });
  },
}));
