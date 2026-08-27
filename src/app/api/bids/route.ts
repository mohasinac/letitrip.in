import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import type { JsonValue } from "@mohasinac/appkit";
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
  userRepository,
  NotFoundError,
  ValidationError,
  AuthorizationError,
} from "@mohasinac/appkit";
import { isSoftBanned } from "@mohasinac/appkit/server";
import { normalizeError } from "@mohasinac/appkit";

const placeBidSchema = z.object({
  productId: z.string().min(1),
  bidAmount: z.number().positive(),
  autoMaxBid: z.number().positive().optional(),
});

const __GET__g = withProviders(
  createRouteHandler({
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const productId = getStringParam(searchParams, "productId");
      if (!productId) return errorResponse("productId is required", 400);

      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 20, { min: 1, max: 50 });

      const result = await listBidsByProduct(productId, { page, pageSize });
      return successResponse(result);
    },
  }),
);

const __POST__g = withProviders(
  createRouteHandler<(typeof placeBidSchema)["_output"]>({
    auth: true,
    schema: placeBidSchema,
    handler: async ({ user, body }) => {
      const userDoc = await userRepository.findById(user!.uid);
      if (userDoc && isSoftBanned(userDoc, "place_bids")) {
        const ban = userDoc.softBans?.find((b) => b.action === "place_bids");
        return errorResponse(
          `Your account is restricted from placing bids. Reason: ${ban?.reason ?? "Policy violation"}. Contact support if you believe this is an error.`,
          403,
        );
      }
      try {
        const result = await placeBid(user!.uid, user!.email ?? "", body!);
        return successResponse(result, "Bid placed", 201);
      } catch (err) {
        void normalizeError(err);
        // The stable CODE crosses the wire; `err.data` is server context and
        // stays server-side. It used to ride under `details`, which no client
        // has ever read.
        if (err instanceof NotFoundError) return errorResponse(err.message, 404, { code: "NOT_FOUND" });
        if (err instanceof ValidationError) return errorResponse(err.message, 400, { code: "VALIDATION_FAILED" });
        if (err instanceof AuthorizationError) return errorResponse(err.message, 403, { code: "FORBIDDEN" });
        throw err;
      }
    },
  }),
);

export const GET = withFeatureGuard("AUCTIONS", __GET__g);
export const POST = withFeatureGuard("AUCTIONS", __POST__g);
