/**
 * Buyer auctions: GET active auctions, attempt place bid (may be 400 if not open),
 * GET /api/user/bids, view bid history for an auction.
 */

import { login, request } from "./_http.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const { jar } = await login("buyer");

  // List auctions
  const aucList = await request("GET", "/api/products?pageSize=10&listingType=auction");
  const auctions = aucList.body?.data?.items ?? [];
  rec(
    "auctions list",
    aucList.status === 200 && auctions.length > 0,
    `n=${auctions.length}`,
  );

  // Pick an auction
  const auction = auctions[0];
  if (!auction) return results;

  // View bid history for that auction
  const bids = await request("GET", `/api/bids?productId=${encodeURIComponent(auction.id)}`);
  rec(
    "bid history GET",
    bids.status === 200,
    `status=${bids.status} bids=${bids.body?.data?.items?.length ?? bids.body?.data?.length ?? "n/a"}`,
  );

  // Attempt to place a bid. Expected outcomes depend on auction state:
  //   - 201 if active + bid > current
  //   - 400 if outside auction window or below minimum
  //   - 422 if reserve not met
  const startingBid = auction.startingBid ?? auction.price ?? 100;
  const tryBid = await request("POST", "/api/bids", {
    jar,
    json: { productId: auction.id, bidAmount: startingBid + 100000 },
  });
  rec(
    "bid POST returns valid status",
    [201, 400, 403, 422].includes(tryBid.status),
    `status=${tryBid.status} body=${JSON.stringify(tryBid.body).slice(0, 200)}`,
  );

  // GET my own bids list
  const myBids = await request("GET", "/api/user/bids", { jar });
  rec("user bids list", myBids.status === 200, `status=${myBids.status}`);

  // List my offers (GET only on /api/user/offers)
  const offersList = await request("GET", "/api/user/offers", { jar });
  rec(
    "user offers GET",
    [200, 404].includes(offersList.status),
    `status=${offersList.status}`,
  );

  return results;
}
