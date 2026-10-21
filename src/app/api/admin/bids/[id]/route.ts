import { withProviders } from "@/providers.config";
import { z } from "zod";
import { bidRepository } from "@mohasinac/appkit/features/auctions/repository/bid.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";


const updateBidSchema = z.object({
  status: z.enum(["cancelled"]),
  reason: z.string().optional(),
});

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const bid = await bidRepository.findById(id);
      if (!bid) return errorResponse("Bid not found", 404);
      /*
       * 🛑 MASKED, not the raw document. `BidRepository.mapDoc` deliberately
       * does NOT decrypt — the repository is ciphertext-by-default with named
       * accessors — so returning the document verbatim answered with an
       * `enc:v1:` AES blob for the bidder's name.
       *
       * Root Cause #38's tell: the single-item GET returns the raw,
       * unstripped document while the LIST endpoint uses the accessor.
       *
       * Masking a bidder also matches what the PUBLIC bid history already
       * does — `maskPublicBid` exists precisely because a real bidder's name
       * beside an amount is the sensitive part (Root Cause #50).
       */
      return successResponse(bidRepository.maskedBid(bid));
    },
  }),
);

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updateBidSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    schema: updateBidSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const bid = await bidRepository.findById(id);
      if (!bid) return errorResponse("Bid not found", 404);
      await bidRepository.adminUpdateBid(id, {
        status: body!.status,
        updatedAt: new Date(),
      } as any);
      return successResponse(null, "Bid cancelled");
    },
  }),
);

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:bids:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const bid = await bidRepository.findById(id);
      if (!bid) return errorResponse("Bid not found", 404);
      await bidRepository.delete(id);
      return successResponse(null, "Bid deleted");
    },
  }),
);

export const GET = __GET__g;
export const PATCH = __PATCH__g;
export const DELETE = __DELETE__g;
