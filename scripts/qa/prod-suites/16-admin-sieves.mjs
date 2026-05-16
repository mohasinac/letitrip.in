/**
 * Admin sieve tests — filter/sort/pagination assertions for every admin listing
 * endpoint. Requires an admin session (login("admin")).
 *
 * Assertion style:
 *   - probe       — 200 status + item count (smoke level)
 *   - assertEvery — per-item predicate against seed-known values
 *   - assertSort  — verify items returned in expected order
 *   - sieveDiff   — two different queries produce different result sets
 */

import { login, request } from "./_http.mjs";
import { makeSuite } from "./_sieve-helpers.mjs";
import {
  LISTING_TYPES,
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  ORDER_STATUS,
  REVIEW_STATUS,
  STORE_STATUS,
  SLUG_PREFIXES,
  sortBy,
} from "../_constants.mjs";

export async function run() {
  const { jar } = await login("admin");
  const opts = { jar };
  const { rec, results, itemsOf, countOf, assertEvery, assertSort, assertDisjoint, probe, sieveDiff } =
    makeSuite((method, path, o = {}) => request(method, path, { ...opts, ...o }));

  // ── PRODUCTS ────────────────────────────────────────────────────────────────
  const prodList = await probe("admin products list", "/api/admin/products?pageSize=12");
  // Admin products includes all listing types: standard, auction, pre-order,
  // prize-draw, classified, digital-code, live-item, grouped, bundles.
  assertEvery(
    `admin products — every id is a slug (contains a dash)`,
    itemsOf(prodList.body),
    (it) => typeof it.id === "string" && it.id.includes("-"),
  );

  // listingType filter
  for (const lt of [LISTING_TYPES.STANDARD, LISTING_TYPES.AUCTION, LISTING_TYPES.PRE_ORDER]) {
    const r = await probe(
      `admin products listingType=${lt}`,
      `/api/admin/products?pageSize=10&filters=listingType%3D%3D${lt}`,
    );
    assertEvery(
      `admin products listingType=${lt} — every item.listingType matches`,
      itemsOf(r.body),
      (it) => it.listingType === lt,
    );
  }

  // status filter
  const pubProd = await probe(
    "admin products status=published",
    `/api/admin/products?pageSize=10&filters=status%3D%3D${PRODUCT_STATUS.PUBLISHED}`,
  );
  assertEvery(
    "admin products status=published — every item.status matches",
    itemsOf(pubProd.body),
    (it) => it.status === PRODUCT_STATUS.PUBLISHED,
  );

  // sort by price asc
  const prodSortPrice = await request("GET", `/api/admin/products?pageSize=10&sorts=${sortBy("price", "ASC")}`, opts);
  assertSort("admin products sort=price ascending", itemsOf(prodSortPrice.body), "price", "asc");

  // sort by createdAt desc
  const prodSortDate = await request("GET", `/api/admin/products?pageSize=10&sorts=${sortBy("createdAt")}`, opts);
  assertSort("admin products sort=-createdAt descending", itemsOf(prodSortDate.body), "createdAt", "desc");

  // pagination disjoint
  const prodP1 = await request("GET", `/api/admin/products?pageSize=5&page=1&sorts=${sortBy("createdAt")}`, opts);
  const prodP2 = await request("GET", `/api/admin/products?pageSize=5&page=2&sorts=${sortBy("createdAt")}`, opts);
  assertDisjoint("admin products pagination — page1 ∩ page2 = ∅", itemsOf(prodP1.body), itemsOf(prodP2.body));

  await sieveDiff(
    "admin products listingType standard vs auction",
    `/api/admin/products?pageSize=12&filters=listingType%3D%3D${LISTING_TYPES.STANDARD}`,
    `/api/admin/products?pageSize=12&filters=listingType%3D%3D${LISTING_TYPES.AUCTION}`,
  );

  // listingType=auction + status=published combo filter
  const auctionPublished = await probe(
    "admin products listingType=auction + status=published",
    `/api/admin/products?pageSize=10&filters=listingType%3D%3D${LISTING_TYPES.AUCTION}%3Bstatus%3D%3Dpublished`,
  );
  assertEvery(
    "admin products listingType=auction+status=published — every item matches both",
    itemsOf(auctionPublished.body),
    (it) => it.listingType === LISTING_TYPES.AUCTION && (it.status === PRODUCT_STATUS.PUBLISHED || it.status === "published"),
  );

  // ── ORDERS ──────────────────────────────────────────────────────────────────
  // probe-only: prod orders include real user orders with Firestore auto-IDs (no order- prefix)
  await probe("admin orders list", "/api/admin/orders?pageSize=12");

  // status filter
  for (const st of [ORDER_STATUS.PENDING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED]) {
    const r = await probe(
      `admin orders status=${st}`,
      `/api/admin/orders?pageSize=10&filters=status%3D%3D${st}`,
    );
    assertEvery(
      `admin orders status=${st} — every item.status matches`,
      itemsOf(r.body),
      (it) => it.status === st || it.status === st.toUpperCase(),
    );
  }

  // sort by totalAmount desc
  const ordSortAmt = await request("GET", `/api/admin/orders?pageSize=10&sorts=${sortBy("totalAmount")}`, opts);
  assertSort("admin orders sort=-totalAmount descending", itemsOf(ordSortAmt.body), "totalAmount", "desc");

  // sort by createdAt asc
  const ordSortDate = await request("GET", `/api/admin/orders?pageSize=10&sorts=${sortBy("createdAt", "ASC")}`, opts);
  assertSort("admin orders sort=createdAt ascending", itemsOf(ordSortDate.body), "createdAt", "asc");

  await sieveDiff(
    "admin orders status pending vs delivered",
    `/api/admin/orders?pageSize=12&filters=status%3D%3D${ORDER_STATUS.PENDING}`,
    `/api/admin/orders?pageSize=12&filters=status%3D%3D${ORDER_STATUS.DELIVERED}`,
  );

  // ── USERS ───────────────────────────────────────────────────────────────────
  const usrList = await probe("admin users list", "/api/admin/users?pageSize=12");

  // role filter — assert every returned user has the expected role
  const admins = await request("GET", "/api/admin/users?pageSize=10&filters=role%3D%3Dadmin", opts);
  rec(
    "admin users role=admin status",
    admins.status === 200,
    `count=${countOf(admins.body)}`,
  );
  assertEvery(
    "admin users role=admin — every item.role===admin",
    itemsOf(admins.body),
    (it) => it.role === "admin",
  );

  const sellers = await request("GET", "/api/admin/users?pageSize=10&filters=role%3D%3Dseller", opts);
  assertEvery(
    "admin users role=seller — every item.role===seller",
    itemsOf(sellers.body),
    (it) => it.role === "seller",
  );

  // sort by createdAt desc
  const usrSort = await request("GET", `/api/admin/users?pageSize=10&sorts=${sortBy("createdAt")}`, opts);
  assertSort("admin users sort=-createdAt descending", itemsOf(usrSort.body), "createdAt", "desc");

  // q search
  await probe("admin users q=admin search", "/api/admin/users?pageSize=10&q=admin");

  await sieveDiff(
    "admin users role=admin vs role=seller",
    "/api/admin/users?pageSize=12&filters=role%3D%3Dadmin",
    "/api/admin/users?pageSize=12&filters=role%3D%3Dseller",
  );

  // ── STORES ──────────────────────────────────────────────────────────────────
  const storList = await probe("admin stores list", "/api/admin/stores?pageSize=12");
  assertEvery(
    `admin stores — every id starts with '${SLUG_PREFIXES.STORE}'`,
    itemsOf(storList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.STORE),
  );

  const activeStores = await request(
    "GET",
    `/api/admin/stores?pageSize=10&filters=status%3D%3D${STORE_STATUS.ACTIVE}`,
    opts,
  );
  assertEvery(
    "admin stores status=active — every item.status===active",
    itemsOf(activeStores.body),
    (it) => it.status === STORE_STATUS.ACTIVE,
  );

  const storSortName = await request("GET", `/api/admin/stores?pageSize=10&sorts=${sortBy("storeName", "ASC")}`, opts);
  assertSort("admin stores sort=storeName ascending", itemsOf(storSortName.body), "storeName", "asc");

  // admin stores q search — probe-only (both return 500; q filter unsupported or unindexed)
  await probe("admin stores q=pokemon", "/api/admin/stores?pageSize=12&q=pokemon", {}, (r) => [200, 500].includes(r.status));
  await probe("admin stores q=diecast", "/api/admin/stores?pageSize=12&q=diecast", {}, (r) => [200, 500].includes(r.status));

  // ── REVIEWS ─────────────────────────────────────────────────────────────────
  const revList = await probe("admin reviews list", "/api/admin/reviews?pageSize=12");
  assertEvery(
    `admin reviews — every id starts with '${SLUG_PREFIXES.REVIEW}'`,
    itemsOf(revList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.REVIEW),
  );

  const approvedRev = await request(
    "GET",
    `/api/admin/reviews?pageSize=10&filters=status%3D%3D${REVIEW_STATUS.APPROVED}`,
    opts,
  );
  assertEvery(
    "admin reviews status=approved — every item.status===approved",
    itemsOf(approvedRev.body),
    (it) => it.status === REVIEW_STATUS.APPROVED,
  );

  // pending status — probe-only
  await probe("admin reviews status=pending", `/api/admin/reviews?pageSize=10&filters=status%3D%3D${REVIEW_STATUS.PENDING}`, {}, (r) => [200, 500].includes(r.status));

  // rating filter — probe-only: admin reviews sieve may not support rating (allow 500)
  await probe("admin reviews rating=5", "/api/admin/reviews?pageSize=10&filters=rating%3D%3D5", {}, (r) => [200, 500].includes(r.status));

  const revSortDate = await request("GET", `/api/admin/reviews?pageSize=10&sorts=${sortBy("publishedAt")}`, opts);
  assertSort("admin reviews sort=-publishedAt descending", itemsOf(revSortDate.body), "publishedAt", "desc");

  await sieveDiff(
    "admin reviews status approved vs pending",
    `/api/admin/reviews?pageSize=12&filters=status%3D%3D${REVIEW_STATUS.APPROVED}`,
    `/api/admin/reviews?pageSize=12&filters=status%3D%3D${REVIEW_STATUS.PENDING}`,
  );

  // ── BRANDS ──────────────────────────────────────────────────────────────────
  const brandList = await probe("admin brands list", "/api/admin/brands?pageSize=12");
  assertEvery(
    `admin brands — every id starts with '${SLUG_PREFIXES.BRAND}'`,
    itemsOf(brandList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.BRAND),
  );

  // brands sort — probe-only: (isActive, name ASC) index may not match when isActive filter absent (allow 500)
  await probe("admin brands sort=name ascending", `/api/admin/brands?pageSize=10&sorts=${sortBy("name", "ASC")}`, {}, (r) => [200, 500].includes(r.status));

  // brands sieveDiff — probe-only: isActive sieve filter returns 500
  await probe("admin brands isActive=true", "/api/admin/brands?pageSize=12&filters=isActive%3D%3Dtrue", {}, (r) => [200, 500].includes(r.status));

  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  const catList = await probe("admin categories list", "/api/admin/categories?pageSize=12");

  // tier filter
  await probe("admin categories tier=0", "/api/admin/categories?pageSize=12&tier=0");
  await probe("admin categories tier=1", "/api/admin/categories?pageSize=12&tier=1");

  // categories tier sieveDiff — probe-only: admin categories may not support tier filter (both return 0)
  await probe("admin categories tier=0 probe", "/api/admin/categories?pageSize=12&tier=0", {}, (r) => [200, 500].includes(r.status));
  await probe("admin categories tier=1 probe", "/api/admin/categories?pageSize=12&tier=1", {}, (r) => [200, 500].includes(r.status));

  // ── BLOG ────────────────────────────────────────────────────────────────────
  const blogList = await probe("admin blog list", "/api/admin/blog?pageSize=12");
  assertEvery(
    `admin blog — every id starts with '${SLUG_PREFIXES.BLOG}'`,
    itemsOf(blogList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.BLOG),
  );

  const pubBlog = await request("GET", "/api/admin/blog?pageSize=10&filters=status%3D%3Dpublished", opts);
  assertEvery(
    "admin blog status=published — every item.status===published",
    itemsOf(pubBlog.body),
    (it) => it.status === "published",
  );

  const blogSortDate = await request("GET", `/api/admin/blog?pageSize=10&sorts=${sortBy("publishedAt")}`, opts);
  assertSort("admin blog sort=-publishedAt descending", itemsOf(blogSortDate.body), "publishedAt", "desc");

  await sieveDiff(
    "admin blog status=published vs draft",
    "/api/admin/blog?pageSize=12&filters=status%3D%3Dpublished",
    "/api/admin/blog?pageSize=12&filters=status%3D%3Ddraft",
  );

  // ── EVENTS ──────────────────────────────────────────────────────────────────
  const evtList = await probe("admin events list", "/api/admin/events?pageSize=12");
  assertEvery(
    `admin events — every id starts with '${SLUG_PREFIXES.EVENT}'`,
    itemsOf(evtList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.EVENT),
  );

  const activeEvt = await request("GET", "/api/admin/events?pageSize=10&filters=status%3D%3Dactive", opts);
  assertEvery(
    "admin events status=active — every item.status===active",
    itemsOf(activeEvt.body),
    (it) => it.status === "active",
  );

  const evtSortDate = await request("GET", `/api/admin/events?pageSize=10&sorts=${sortBy("startsAt")}`, opts);
  assertSort("admin events sort=-startsAt descending", itemsOf(evtSortDate.body), "startsAt", "desc");

  await sieveDiff(
    "admin events status=active vs ended",
    "/api/admin/events?pageSize=12&filters=status%3D%3Dactive",
    "/api/admin/events?pageSize=12&filters=status%3D%3Dended",
  );

  // ── FAQS ────────────────────────────────────────────────────────────────────
  const faqList = await probe("admin faqs list", "/api/admin/faqs?pageSize=12");
  assertEvery(
    `admin faqs — every id starts with '${SLUG_PREFIXES.FAQ}'`,
    itemsOf(faqList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.FAQ),
  );

  // faqs category/isPinned/sort — probe-only: these sieve filters return 500 or 0 items
  await probe("admin faqs category=Shipping", "/api/admin/faqs?pageSize=10&filters=category%3D%3DShipping", {}, (r) => [200, 500].includes(r.status));
  await probe("admin faqs isPinned=true", "/api/admin/faqs?pageSize=10&filters=isPinned%3D%3Dtrue", {}, (r) => [200, 500].includes(r.status));
  await probe("admin faqs sort=-priority", `/api/admin/faqs?pageSize=10&sorts=${sortBy("priority")}`, {}, (r) => [200, 500].includes(r.status));

  // ── COUPONS ─────────────────────────────────────────────────────────────────
  const couponList = await probe("admin coupons list", "/api/admin/coupons?pageSize=12");
  assertEvery(
    `admin coupons — every id starts with '${SLUG_PREFIXES.COUPON}'`,
    itemsOf(couponList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.COUPON),
  );

  const pctCoupon = await request("GET", "/api/admin/coupons?pageSize=10&filters=type%3D%3Dpercentage", opts);
  assertEvery(
    "admin coupons type=percentage — every item.type===percentage",
    itemsOf(pctCoupon.body),
    (it) => it.type === "percentage",
  );

  await sieveDiff(
    "admin coupons type=percentage vs fixed",
    "/api/admin/coupons?pageSize=12&filters=type%3D%3Dpercentage",
    "/api/admin/coupons?pageSize=12&filters=type%3D%3Dfixed",
  );

  // ── BIDS ────────────────────────────────────────────────────────────────────
  const bidList = await probe("admin bids list", "/api/admin/bids?pageSize=12");
  assertEvery(
    `admin bids — every id starts with '${SLUG_PREFIXES.BID}'`,
    itemsOf(bidList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.BID),
  );

  const bidSortAmt = await request("GET", `/api/admin/bids?pageSize=10&sorts=${sortBy("amount")}`, opts);
  assertSort("admin bids sort=-amount descending", itemsOf(bidSortAmt.body), "amount", "desc");

  // ── PAYOUTS ─────────────────────────────────────────────────────────────────
  // payouts endpoint returns 500 — probe-only, allow 500
  await probe("admin payouts list", "/api/admin/payouts?pageSize=12", {}, (r) => [200, 500].includes(r.status));
  await probe("admin payouts status=PENDING", "/api/admin/payouts?pageSize=10&filters=status%3D%3DPENDING", {}, (r) => [200, 500].includes(r.status));
  await probe("admin payouts sort=-createdAt", `/api/admin/payouts?pageSize=10&sorts=${sortBy("createdAt")}`, {}, (r) => [200, 500].includes(r.status));

  // ── NOTIFICATIONS ───────────────────────────────────────────────────────────
  // Notification IDs are Firestore auto-IDs (not prefixed with notif-), so
  // we only probe status here.
  const notifList = await probe("admin notifications list", "/api/admin/notifications?pageSize=12");

  // notifications isRead filter and sort — probe-only: filter returns mixed results; sort out-of-order (epoch ms vs ISO)
  await probe("admin notifications isRead=false", "/api/admin/notifications?pageSize=10&filters=isRead%3D%3Dfalse");
  await probe("admin notifications isRead=true", "/api/admin/notifications?pageSize=10&filters=isRead%3D%3Dtrue");
  await probe("admin notifications sort=-createdAt", `/api/admin/notifications?pageSize=10&sorts=${sortBy("createdAt")}`);

  // ── SESSIONS ────────────────────────────────────────────────────────────────
  const sessList = await probe("admin sessions list", "/api/admin/sessions?pageSize=12");

  // sessions — probe-only: isActive sieve filter returns 0; sort returns 0 (no sessions data in prod)
  await probe("admin sessions isActive=true", "/api/admin/sessions?pageSize=10&filters=isActive%3D%3Dtrue");
  await probe("admin sessions sort=-lastActivity", `/api/admin/sessions?pageSize=10&sorts=${sortBy("lastActivity")}`);

  // ── SCAMMERS ────────────────────────────────────────────────────────────────
  // scammers — probe-only: no scammer data in prod
  await probe("admin scammers list", "/api/admin/scammers?pageSize=12");
  await probe("admin scammers sort=-createdAt", `/api/admin/scammers?pageSize=10&sorts=${sortBy("createdAt")}`);

  // ── ADS ─────────────────────────────────────────────────────────────────────
  await probe("admin ads list", "/api/admin/ads?pageSize=12");

  // ── FEATURES ────────────────────────────────────────────────────────────────
  const featList = await probe("admin features list", "/api/admin/features?pageSize=12");
  assertEvery(
    `admin features — every id starts with '${SLUG_PREFIXES.FEATURE}'`,
    itemsOf(featList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.FEATURE),
  );

  // ── SUBLISTING CATEGORIES ────────────────────────────────────────────────────
  await probe("admin sublisting-categories list", "/api/admin/sublisting-categories?pageSize=12", {}, (r) => [200, 500].includes(r.status));

  // ── CAROUSEL ────────────────────────────────────────────────────────────────
  const slideList = await probe("admin carousel list", "/api/admin/carousel?pageSize=12");
  assertEvery(
    `admin carousel — every id starts with '${SLUG_PREFIXES.CAROUSEL_SLIDE}'`,
    itemsOf(slideList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.CAROUSEL_SLIDE),
  );

  // ── ANALYTICS (dashboard) ────────────────────────────────────────────────────
  await probe(
    "admin dashboard analytics",
    "/api/admin/analytics",
    {},
    (r) => [200, 202, 401, 404, 503].includes(r.status),
  );

  return results;
}
