import { withProviders } from "@/providers.config";
import { bidRepository } from "@mohasinac/appkit/features/auctions/repository/bid.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_AUTHENTICATED } from "@/constants";

/**
 * One of the caller's OWN bids.
 *
 * Built for `/user/bids/[id]/view`, which had no endpoint to read from — the
 * buyer side has only ever had a collection route.
 *
 * Ownership is a direct field check: `bid.userId` is the bidder, so unlike the
 * seller route (where ownership lives on the product) no join is needed. A bid
 * belonging to someone else answers 404, not 403 — otherwise the response
 * confirms that a given bid id exists, which is the one thing a stranger could
 * learn here.
 *
 * No masking: this is the caller's own bid, and `buildBidDetailFields(bid,
 * "buyer")` already omits the bidder-identity row for exactly that reason —
 * a buyer does not need to be told their own name.
 */
const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_AUTHENTICATED,
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const bid = await bidRepository.findById(id);
      if (!bid || bid.userId !== user!.uid) {
        return errorResponse("Bid not found", 404);
      }
      /*
       * 🛑 REVEALED. `BidRepository.mapDoc` does not decrypt, so this
       * returned an `enc:v1:` blob for the bidder's own name.
       *
       * `revealBid`, not masked: the guard two lines up has already refused
       * any bid whose `userId` is not the caller's, so this is a person
       * reading their own bid. Masking it would show them "A*** B***" where
       * their own name belongs.
       */
      return successResponse(bidRepository.revealBid(bid));
    },
  }),
);
export const GET = __GET__g;
