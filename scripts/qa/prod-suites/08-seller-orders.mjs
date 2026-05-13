/**
 * Seller orders: list orders, view detail, view payouts, view bids on auctions.
 */

import { login, request } from "./_http.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const { jar } = await login("seller");

  const orders = await request("GET", "/api/store/orders?pageSize=10", { jar });
  rec(
    "store orders GET",
    orders.status === 200,
    `status=${orders.status} n=${orders.body?.data?.items?.length ?? "n/a"}`,
  );

  const payouts = await request("GET", "/api/store/payouts?pageSize=10", { jar });
  rec("store payouts GET", payouts.status === 200, `status=${payouts.status}`);

  const bids = await request("GET", "/api/store/bids?pageSize=10", { jar });
  rec("store bids GET", bids.status === 200, `status=${bids.status}`);

  const reviews = await request("GET", "/api/store/reviews?pageSize=10", { jar });
  rec("store reviews GET", reviews.status === 200, `status=${reviews.status}`);

  const offers = await request("GET", "/api/store/offers?pageSize=10", { jar });
  rec(
    "store offers GET",
    [200, 404].includes(offers.status),
    `status=${offers.status}`,
  );

  return results;
}
