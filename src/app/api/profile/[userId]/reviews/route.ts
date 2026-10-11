import { withProviders } from "@/providers.config";
import { REVIEW_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getNumberParam } from "@mohasinac/appkit/next/request-helpers";
import { sieveFilter, SIEVE_OP } from "@mohasinac/appkit/utils/sieve-builder";
import { reviewRepository } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ request, params }) => {
      const userId = (params as { userId: string }).userId;
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 20, { min: 1, max: 50 });

      const user = await userRepository.findById(userId);
      const storeId = user?.storeSlug ?? null;

      if (!storeId) {
        return successResponse({ items: [], total: 0, page, pageSize, totalPages: 0, hasMore: false });
      }

      const result = await reviewRepository.listForStore(storeId, {
        filters: sieveFilter(REVIEW_FIELDS.STATUS, SIEVE_OP.EQ, REVIEW_FIELDS.STATUS_VALUES.APPROVED),
        sorts: sortBy(REVIEW_FIELDS.CREATED_AT),
        page,
        pageSize,
      });

      return successResponse(result);
    },
  }),
);