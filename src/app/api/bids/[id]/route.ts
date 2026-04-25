import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  listBidsByProduct,
  getSearchParams,
  getNumberParam,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ request, params }) => {
      const productId = (params as { id: string }).id;
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 20, { min: 1, max: 100 });

      const result = await listBidsByProduct(productId, { page, pageSize });
      return successResponse(result);
    },
  }),
);
