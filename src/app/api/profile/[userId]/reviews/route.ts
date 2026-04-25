import { withProviders } from "@/providers.config";
import {
  reviewRepository,
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

      const result = await reviewRepository.listForSeller(userId, {
        filters: "status==approved",
        sorts: "-createdAt",
        page,
        pageSize,
      });

      return successResponse(result);
    },
  }),
);
