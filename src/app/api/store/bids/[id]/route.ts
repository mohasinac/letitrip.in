import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  bidRepository,
  productRepository,
  storeRepository,
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
       * 🛑 NOT masked. This used to call `maskPublicBid(bid!)`, justified by a
       * comment reading "the seller detail panel renders only amount/date/
       * status — so there is nothing to gain from shipping a full name here".
       *
       * That premise was false by the time it was written, and the comment is
       * what kept it alive: `/store/bids/{id}/view` renders
       * `buildBidDetailFields(data, "seller")`, whose ONE viewer-dependent row
       * is `Bidder`, added for every viewer that is not the buyer. So the page
       * asked for a name the seller is entitled to and rendered the masked
       * `M*** U*** 1***`, while the list and its modal — fed by the unmasked
       * collection route — showed `Mock User 11` for the same bid. One record,
       * one viewer, two answers.
       *
       * The seller is entitled to it: ownership is already proven above
       * (`product.storeId === store.id`), and a seller who cannot tell who is
       * bidding on their own auction cannot run it — spot a shill, answer a
       * question, or chase a winner who has not paid. `maskPublicBid` is for
       * the PUBLIC bid history, where a competitor's identity is genuinely not
       * the reader's business; this route is not that surface.
       *
       * Root Cause #50 is still the reason that helper exists and is still
       * worth heeding — but it says "check a mask actually masks", not "mask
       * everything". A comment asserting what some other component renders is
       * a claim that rots the moment that component changes.
       */
      return successResponse(bid!);
    },
  }),
);
export const GET = __GET__g;

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
export const DELETE = __DELETE__g;
