import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  bidRepository,
  productRepository,
  storeRepository,
  maskPublicBid,
} from "@mohasinac/appkit";
import { ROLES_STORE_READ, ROLES_STORE_WRITE } from "@/constants";

/**
 * A single bid on one of THIS seller's auctions.
 *
 * ## Why this file did not exist until 2026-08-26
 *
 * `SELLER_ENDPOINTS.BID_BY_ID` has been declared for a long time and
 * `SellerBidsView`'s bulk "cancel bids" has been calling it with
 * `fetch(…, { method: "DELETE" })` — at nothing. Every cancel 404'd, and
 * because the caller counts failures and toasts "N bid(s) failed to cancel",
 * it has been loudly and permanently broken rather than silently so.
 *
 * Found by `audit-client-verb-match`'s NO_ROUTE rule once it learned to scan
 * raw `fetch` as well as `apiClient`.
 *
 * ## Ownership is checked on the PRODUCT, not the bid
 *
 * A bid has a `productId` and a `userId`; neither names a store. So both verbs
 * resolve the caller's store, load the bid's product, and require
 * `product.storeId === store.id`. A missing or foreign bid returns 404 rather
 * than 403 — a seller has no business learning that another store's bid id
 * exists.
 *
 * Roles-only, no `permission:`, matching the sibling collection route. The
 * `store:*` namespace does not exist in `PERMISSION_GROUPS` — `getServerPermissions`
 * resolves a non-empty set only for `employee`, so an invented `store:bids:read`
 * would be the quiet failure Root Cause #33 describes: it matches nothing, and
 * the route reads as gated while the real gate is the in-handler ownership
 * check below.
 */

async function loadOwnedBid(uid: string, bidId: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store) return { error: ApiErrors.forbidden("No store found for this account") };

  const bid = await bidRepository.findById(bidId);
  if (!bid) return { error: errorResponse("Bid not found", 404) };

  const product = await productRepository.findById(bid.productId);
  // Not-found rather than forbidden: see the header.
  if (!product || product.storeId !== store.id) {
    return { error: errorResponse("Bid not found", 404) };
  }
  return { bid };
}

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_READ],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const { bid, error } = await loadOwnedBid(user!.uid, id);
      if (error) return error;
      /*
       * Masked, even though the seller is entitled to more than the public is.
       * `maskPublicBid` exists because `maskPublicX` helpers have shipped as
       * no-ops before (Root Cause #50), and the seller detail panel renders
       * only amount/date/status — so there is nothing to gain from shipping a
       * full name here and something to lose.
       */
      return successResponse(maskPublicBid(bid!));
    },
  }),
);
export const GET = withFeatureGuard("AUCTIONS", __GET__g);

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const { bid, error } = await loadOwnedBid(user!.uid, id);
      if (error) return error;

      /*
       * Cancelled, not deleted. A bid is a record of what a buyer committed
       * to; removing it would break `statusHistory`, the auction's bid count
       * and any order that back-links to it. `markCancelled` is the same
       * funnel the buyout-lapse sweep uses, so this lands on the bid's own
       * timeline with an actor and a reason.
       */
      await bidRepository.markCancelled(
        id,
        {
          actor: { role: "seller", uid: user!.uid },
          trigger: "sellerCancelBid",
          reason: "Cancelled by the seller from the store dashboard.",
        },
        bid,
      );
      return successResponse({ id }, "Bid cancelled");
    },
  }),
);
export const DELETE = withFeatureGuard("AUCTIONS", __DELETE__g);
