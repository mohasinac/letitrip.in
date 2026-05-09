import { withProviders } from "@/providers.config";
import {
  reviewRepository,
  userRepository,
  createRouteHandler,
  successResponse,
  getSearchParams,
  getNumberParam,
} from "@mohasinac/appkit";

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
        filters: "status==approved",
        sorts: "-createdAt",
        page,
        pageSize,
      });

      return successResponse(result);
    },
  }),
);
