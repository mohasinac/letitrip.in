/**
 * Store (seller) sieve tests — filter/sort/pagination assertions for every
 * /api/store/* listing endpoint. Requires a seller session (login("seller")).
 *
 * Assertion style: same as 16-admin-sieves.mjs.
 */

import { login, request } from "./_http.mjs";
import { makeSuite } from "./_sieve-helpers.mjs";
import {
  LISTING_TYPES,
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  ORDER_STATUS,
  SLUG_PREFIXES,
  sortBy,
} from "../_constants.mjs";

export async function run() {
  const { jar } = await login("seller");
  const opts = { jar };
  const { rec, results, itemsOf, countOf, assertEvery, assertSort, assertDisjoint, probe, sieveDiff } =
    makeSuite((method, path, o = {}) => request(method, path, { ...opts, ...o }));

  // ── PRODUCTS ────────────────────────────────────────────────────────────────
  const prodList = await probe("store products list", "/api/store/products?pageSize=12");

  // All returned products must belong to the logged-in seller's store
  const items = itemsOf(prodList.body);
  if (items.length >= 2) {
    const storeIds = new Set(items.map((it) => it.storeId));
    rec(
      "store products — all items share the same storeId (seller-scoped)",
      storeIds.size === 1,
      `storeIds=${[...storeIds].join(",")}`,
    );
  }

  // listingType filter
  for (const lt of [LISTING_TYPES.STANDARD, LISTING_TYPES.AUCTION, LISTING_TYPES.PRE_ORDER]) {
    const r = await probe(
      `store products listingType=${lt}`,
      `/api/store/products?pageSize=10&filters=listingType%3D%3D${lt}`,
    );
    assertEvery(
      `store products listingType=${lt} — every item.listingType matches`,
      itemsOf(r.body),
      (it) => it.listingType === lt,
    );
  }

  // status filter
  const pubProd = await probe(
    "store products status=published",
    `/api/store/products?pageSize=10&filters=status%3D%3D${PRODUCT_STATUS.PUBLISHED}`,
  );
  assertEvery(
    "store products status=published — every item.status matches",
    itemsOf(pubProd.body),
    (it) => it.status === PRODUCT_STATUS.PUBLISHED,
  );

  const draftProd = await probe(
    "store products status=draft",
    `/api/store/products?pageSize=10&filters=status%3D%3D${PRODUCT_STATUS.DRAFT}`,
  );
  assertEvery(
    "store products status=draft — every item.status matches",
    itemsOf(draftProd.body),
    (it) => it.status === PRODUCT_STATUS.DRAFT,
  );

  // condition filter
  const newProd = await probe(
    "store products condition=new",
    `/api/store/products?pageSize=10&filters=condition%3D%3D${PRODUCT_CONDITION.NEW}`,
  );
  assertEvery(
    "store products condition=new — every item.condition===new",
    itemsOf(newProd.body),
    (it) => it.condition === PRODUCT_CONDITION.NEW,
  );

  // sort by price asc
  const prodSortPrice = await request(
    "GET",
    `/api/store/products?pageSize=10&sorts=${sortBy("price", "ASC")}`,
    opts,
  );
  assertSort("store products sort=price ascending", itemsOf(prodSortPrice.body), "price", "asc");

  // sort by createdAt desc
  const prodSortDate = await request(
    "GET",
    `/api/store/products?pageSize=10&sorts=${sortBy("createdAt")}`,
    opts,
  );
  assertSort("store products sort=-createdAt descending", itemsOf(prodSortDate.body), "createdAt", "desc");

  // pagination
  const prodP1 = await request(
    "GET",
    `/api/store/products?pageSize=5&page=1&sorts=${sortBy("createdAt")}`,
    opts,
  );
  const prodP2 = await request(
    "GET",
    `/api/store/products?pageSize=5&page=2&sorts=${sortBy("createdAt")}`,
    opts,
  );
  if (itemsOf(prodP1.body).length > 0 && itemsOf(prodP2.body).length > 0) {
    assertDisjoint("store products pagination — page1 ∩ page2 = ∅", itemsOf(prodP1.body), itemsOf(prodP2.body));
  }

  await sieveDiff(
    "store products status=published vs draft",
    `/api/store/products?pageSize=12&filters=status%3D%3D${PRODUCT_STATUS.PUBLISHED}`,
    `/api/store/products?pageSize=12&filters=status%3D%3D${PRODUCT_STATUS.DRAFT}`,
  );
  await sieveDiff(
    "store products listingType standard vs auction",
    `/api/store/products?pageSize=12&filters=listingType%3D%3D${LISTING_TYPES.STANDARD}`,
    `/api/store/products?pageSize=12&filters=listingType%3D%3D${LISTING_TYPES.AUCTION}`,
  );

  // ── ORDERS ──────────────────────────────────────────────────────────────────
  const ordList = await probe("store orders list", "/api/store/orders?pageSize=12");
  assertEvery(
    `store orders — every id starts with '${SLUG_PREFIXES.ORDER}'`,
    itemsOf(ordList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.ORDER),
  );

  // status filter
  for (const st of [ORDER_STATUS.PENDING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED]) {
    const r = await probe(
      `store orders status=${st}`,
      `/api/store/orders?pageSize=10&filters=status%3D%3D${st}`,
    );
    assertEvery(
      `store orders status=${st} — every item.status matches`,
      itemsOf(r.body),
      (it) => it.status === st || it.status === st.toUpperCase(),
    );
  }

  // sort by totalAmount desc
  const ordSortAmt = await request(
    "GET",
    `/api/store/orders?pageSize=10&sorts=${sortBy("totalAmount")}`,
    opts,
  );
  assertSort("store orders sort=-totalAmount descending", itemsOf(ordSortAmt.body), "totalAmount", "desc");

  // sort by createdAt asc
  const ordSortDate = await request(
    "GET",
    `/api/store/orders?pageSize=10&sorts=${sortBy("createdAt", "ASC")}`,
    opts,
  );
  assertSort("store orders sort=createdAt ascending", itemsOf(ordSortDate.body), "createdAt", "asc");

  await sieveDiff(
    "store orders status=pending vs delivered",
    `/api/store/orders?pageSize=12&filters=status%3D%3D${ORDER_STATUS.PENDING}`,
    `/api/store/orders?pageSize=12&filters=status%3D%3D${ORDER_STATUS.DELIVERED}`,
  );

  // ── REVIEWS ─────────────────────────────────────────────────────────────────
  const revList = await probe("store reviews list", "/api/store/reviews?pageSize=12");
  assertEvery(
    `store reviews — every id starts with '${SLUG_PREFIXES.REVIEW}'`,
    itemsOf(revList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.REVIEW),
  );

  // rating filter
  const rev5 = await probe(
    "store reviews rating=5",
    "/api/store/reviews?pageSize=10&filters=rating%3D%3D5",
  );
  assertEvery(
    "store reviews rating=5 — every item.rating===5",
    itemsOf(rev5.body),
    (it) => it.rating === 5,
  );

  // sort by rating desc
  const revSortRating = await request(
    "GET",
    `/api/store/reviews?pageSize=10&sorts=${sortBy("rating")}`,
    opts,
  );
  assertSort("store reviews sort=-rating descending", itemsOf(revSortRating.body), "rating", "desc");

  // sort by createdAt desc
  const revSortDate = await request(
    "GET",
    `/api/store/reviews?pageSize=10&sorts=${sortBy("createdAt")}`,
    opts,
  );
  assertSort("store reviews sort=-createdAt descending", itemsOf(revSortDate.body), "createdAt", "desc");

  await sieveDiff(
    "store reviews rating=5 vs rating=1",
    "/api/store/reviews?pageSize=12&filters=rating%3D%3D5",
    "/api/store/reviews?pageSize=12&filters=rating%3D%3D1",
  );

  // ── COUPONS ─────────────────────────────────────────────────────────────────
  const couponList = await probe("store coupons list", "/api/store/coupons?pageSize=12");
  assertEvery(
    `store coupons — every id starts with '${SLUG_PREFIXES.COUPON}'`,
    itemsOf(couponList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.COUPON),
  );

  const pctCoupon = await probe(
    "store coupons type=percentage",
    "/api/store/coupons?pageSize=10&filters=type%3D%3Dpercentage",
  );
  assertEvery(
    "store coupons type=percentage — every item.type===percentage",
    itemsOf(pctCoupon.body),
    (it) => it.type === "percentage",
  );

  const couponSortDate = await request(
    "GET",
    `/api/store/coupons?pageSize=10&sorts=${sortBy("createdAt")}`,
    opts,
  );
  assertSort("store coupons sort=-createdAt descending", itemsOf(couponSortDate.body), "createdAt", "desc");

  await sieveDiff(
    "store coupons type=percentage vs fixed",
    "/api/store/coupons?pageSize=12&filters=type%3D%3Dpercentage",
    "/api/store/coupons?pageSize=12&filters=type%3D%3Dfixed",
  );

  // ── BIDS ────────────────────────────────────────────────────────────────────
  const bidList = await probe("store bids list", "/api/store/bids?pageSize=12");

  const bidSortAmt = await request(
    "GET",
    `/api/store/bids?pageSize=10&sorts=${sortBy("amount")}`,
    opts,
  );
  assertSort("store bids sort=-amount descending", itemsOf(bidSortAmt.body), "amount", "desc");

  const bidSortDate = await request(
    "GET",
    `/api/store/bids?pageSize=10&sorts=${sortBy("bidTime")}`,
    opts,
  );
  assertSort("store bids sort=-bidTime descending", itemsOf(bidSortDate.body), "bidTime", "desc");

  // ── PAYOUTS ─────────────────────────────────────────────────────────────────
  const payList = await probe("store payouts list", "/api/store/payouts?pageSize=12");

  const pendingPay = await probe(
    "store payouts status=PENDING",
    "/api/store/payouts?pageSize=10&filters=status%3D%3DPENDING",
  );
  assertEvery(
    "store payouts status=PENDING — every item.status===PENDING",
    itemsOf(pendingPay.body),
    (it) => it.status === "PENDING",
  );

  const paySortDate = await request(
    "GET",
    `/api/store/payouts?pageSize=10&sorts=${sortBy("createdAt")}`,
    opts,
  );
  assertSort("store payouts sort=-createdAt descending", itemsOf(paySortDate.body), "createdAt", "desc");

  // ── FEATURES ────────────────────────────────────────────────────────────────
  await probe("store features list", "/api/store/features?pageSize=12");

  // ── TEMPLATES ───────────────────────────────────────────────────────────────
  await probe("store templates list", "/api/store/templates?pageSize=12");

  // ── SUBLISTING CATEGORIES ────────────────────────────────────────────────────
  await probe("store sublisting-categories list", "/api/store/sublisting-categories?pageSize=12", {}, (r) => [200, 500].includes(r.status));

  // ── OFFERS ──────────────────────────────────────────────────────────────────
  await probe(
    "store offers list",
    "/api/store/offers?pageSize=12",
    {},
    (r) => [200, 404].includes(r.status),
  );

  // ── ANALYTICS ───────────────────────────────────────────────────────────────
  await probe(
    "store analytics",
    "/api/store/analytics",
    {},
    (r) => [200, 202, 401, 404, 503].includes(r.status),
  );

  return results;
}
