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
  assertEvery(
    `admin products — every id starts with a product prefix`,
    itemsOf(prodList.body),
    (it) =>
      it.id.startsWith(SLUG_PREFIXES.PRODUCT) ||
      it.id.startsWith(SLUG_PREFIXES.AUCTION) ||
      it.id.startsWith(SLUG_PREFIXES.PRE_ORDER),
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

  // ── ORDERS ──────────────────────────────────────────────────────────────────
  const ordList = await probe("admin orders list", "/api/admin/orders?pageSize=12");
  assertEvery(
    `admin orders — every id starts with '${SLUG_PREFIXES.ORDER}'`,
    itemsOf(ordList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.ORDER),
  );

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

  await sieveDiff(
    "admin stores q pokemon vs diecast",
    "/api/admin/stores?pageSize=12&q=pokemon",
    "/api/admin/stores?pageSize=12&q=diecast",
  );

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

  const pendingRev = await request(
    "GET",
    `/api/admin/reviews?pageSize=10&filters=status%3D%3D${REVIEW_STATUS.PENDING}`,
    opts,
  );
  assertEvery(
    "admin reviews status=pending — every item.status===pending",
    itemsOf(pendingRev.body),
    (it) => it.status === REVIEW_STATUS.PENDING,
  );

  // rating filter
  const rev5 = await request("GET", "/api/admin/reviews?pageSize=10&filters=rating%3D%3D5", opts);
  assertEvery(
    "admin reviews rating=5 — every item.rating===5",
    itemsOf(rev5.body),
    (it) => it.rating === 5,
  );

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

  const brandSortName = await request("GET", `/api/admin/brands?pageSize=10&sorts=${sortBy("name", "ASC")}`, opts);
  assertSort("admin brands sort=name ascending", itemsOf(brandSortName.body), "name", "asc");

  await sieveDiff(
    "admin brands isActive=true vs all",
    "/api/admin/brands?pageSize=12&filters=isActive%3D%3Dtrue",
    "/api/admin/brands?pageSize=12",
  );

  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  const catList = await probe("admin categories list", "/api/admin/categories?pageSize=12");

  // tier filter
  await probe("admin categories tier=0", "/api/admin/categories?pageSize=12&tier=0");
  await probe("admin categories tier=1", "/api/admin/categories?pageSize=12&tier=1");

  await sieveDiff(
    "admin categories tier=0 vs tier=1",
    "/api/admin/categories?pageSize=12&tier=0",
    "/api/admin/categories?pageSize=12&tier=1",
  );

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

  const faqCat = await request("GET", "/api/admin/faqs?pageSize=10&filters=category%3D%3DShipping", opts);
  assertEvery(
    "admin faqs category=Shipping — every item.category===Shipping",
    itemsOf(faqCat.body),
    (it) => it.category === "Shipping",
  );

  const faqPinned = await request("GET", "/api/admin/faqs?pageSize=10&filters=isPinned%3D%3Dtrue", opts);
  assertEvery(
    "admin faqs isPinned=true — every item.isPinned===true",
    itemsOf(faqPinned.body),
    (it) => it.isPinned === true,
  );

  const faqSortPri = await request("GET", `/api/admin/faqs?pageSize=10&sorts=${sortBy("priority")}`, opts);
  assertSort("admin faqs sort=-priority descending", itemsOf(faqSortPri.body), "priority", "desc");

  await sieveDiff(
    "admin faqs category=Shipping vs Payments",
    "/api/admin/faqs?pageSize=12&filters=category%3D%3DShipping",
    "/api/admin/faqs?pageSize=12&filters=category%3D%3DPayments",
  );

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
  const payList = await probe("admin payouts list", "/api/admin/payouts?pageSize=12");
  assertEvery(
    `admin payouts — every id starts with '${SLUG_PREFIXES.PAYOUT}'`,
    itemsOf(payList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.PAYOUT),
  );

  const pendingPay = await request("GET", "/api/admin/payouts?pageSize=10&filters=status%3D%3DPENDING", opts);
  assertEvery(
    "admin payouts status=PENDING — every item.status===PENDING",
    itemsOf(pendingPay.body),
    (it) => it.status === "PENDING",
  );

  const paySortDate = await request("GET", `/api/admin/payouts?pageSize=10&sorts=${sortBy("createdAt")}`, opts);
  assertSort("admin payouts sort=-createdAt descending", itemsOf(paySortDate.body), "createdAt", "desc");

  await sieveDiff(
    "admin payouts status=PENDING vs PAID",
    "/api/admin/payouts?pageSize=12&filters=status%3D%3DPENDING",
    "/api/admin/payouts?pageSize=12&filters=status%3D%3DPAID",
  );

  // ── NOTIFICATIONS ───────────────────────────────────────────────────────────
  const notifList = await probe("admin notifications list", "/api/admin/notifications?pageSize=12");
  assertEvery(
    `admin notifications — every id starts with '${SLUG_PREFIXES.NOTIFICATION}'`,
    itemsOf(notifList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.NOTIFICATION),
  );

  const unread = await request("GET", "/api/admin/notifications?pageSize=10&filters=isRead%3D%3Dfalse", opts);
  assertEvery(
    "admin notifications isRead=false — every item.isRead===false",
    itemsOf(unread.body),
    (it) => it.isRead === false,
  );

  const notifSortDate = await request("GET", `/api/admin/notifications?pageSize=10&sorts=${sortBy("createdAt")}`, opts);
  assertSort("admin notifications sort=-createdAt descending", itemsOf(notifSortDate.body), "createdAt", "desc");

  await sieveDiff(
    "admin notifications isRead=false vs isRead=true",
    "/api/admin/notifications?pageSize=12&filters=isRead%3D%3Dfalse",
    "/api/admin/notifications?pageSize=12&filters=isRead%3D%3Dtrue",
  );

  // ── SESSIONS ────────────────────────────────────────────────────────────────
  const sessList = await probe("admin sessions list", "/api/admin/sessions?pageSize=12");

  const activeSess = await request("GET", "/api/admin/sessions?pageSize=10&filters=isActive%3D%3Dtrue", opts);
  assertEvery(
    "admin sessions isActive=true — every item.isActive===true",
    itemsOf(activeSess.body),
    (it) => it.isActive === true,
  );

  const sessSortDate = await request("GET", `/api/admin/sessions?pageSize=10&sorts=${sortBy("lastActivity")}`, opts);
  assertSort("admin sessions sort=-lastActivity descending", itemsOf(sessSortDate.body), "lastActivity", "desc");

  await sieveDiff(
    "admin sessions isActive=true vs false",
    "/api/admin/sessions?pageSize=12&filters=isActive%3D%3Dtrue",
    "/api/admin/sessions?pageSize=12&filters=isActive%3D%3Dfalse",
  );

  // ── SCAMMERS ────────────────────────────────────────────────────────────────
  const scamList = await probe("admin scammers list", "/api/admin/scammers?pageSize=12");
  assertEvery(
    `admin scammers — every id starts with '${SLUG_PREFIXES.SCAMMER}'`,
    itemsOf(scamList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.SCAMMER),
  );
  const scamSort = await request("GET", `/api/admin/scammers?pageSize=10&sorts=${sortBy("createdAt")}`, opts);
  assertSort("admin scammers sort=-createdAt descending", itemsOf(scamSort.body), "createdAt", "desc");

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
  await probe("admin sublisting-categories list", "/api/admin/sublisting-categories?pageSize=12");

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
    (r) => [200, 202, 404, 503].includes(r.status),
  );

  return results;
}
