import { withProviders } from "@/providers.config";
import { listBidsByProduct } from "@mohasinac/appkit/features/auctions/actions/bid-actions";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getNumberParam } from "@mohasinac/appkit/next/request-helpers";

const __GET__g = withProviders(
  createRouteHandler({
    handler: async ({ request, params }) => {
      const productId = (params as { id: string }).id;
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 20, { min: 1, max: 50 });

      const result = await listBidsByProduct(productId, { page, pageSize });
      return successResponse(result);
    },
  }),
);

export const GET = __GET__g;
