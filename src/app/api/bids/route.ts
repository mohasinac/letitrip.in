import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  placeBid,
  listBidsByProduct,
  getSearchParams,
  getStringParam,
  getNumberParam,
} from "@mohasinac/appkit";

const placeBidSchema = z.object({
  productId: z.string().min(1),
  bidAmount: z.number().positive(),
  autoMaxBid: z.number().positive().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const productId = getStringParam(searchParams, "productId");
      if (!productId) return errorResponse("productId is required", 400);

      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 20, { min: 1, max: 100 });

      const result = await listBidsByProduct(productId, { page, pageSize });
      return successResponse(result);
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof placeBidSchema)["_output"]>({
    auth: true,
    schema: placeBidSchema,
    handler: async ({ user, body }) => {
      const result = await placeBid(user!.uid, user!.email ?? "", body!);
      return successResponse(result, "Bid placed", 201);
    },
  }),
);
