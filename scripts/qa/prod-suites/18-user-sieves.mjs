/**
 * User (buyer) sieve tests — filter/sort/pagination assertions for every
 * /api/user/* and buyer-facing listing endpoint. Requires a buyer session
 * (login("buyer")).
 *
 * Assertion style: same as 16-admin-sieves.mjs / 17-store-sieves.mjs.
 */

import { login, request } from "./_http.mjs";
import { makeSuite } from "./_sieve-helpers.mjs";
import {
  ORDER_STATUS,
  SLUG_PREFIXES,
  sortBy,
} from "../_constants.mjs";

export async function run() {
  const { jar, user } = await login("buyer");
  const opts = { jar };
  const uid = user?.uid ?? user?.id;

  const { rec, results, itemsOf, countOf, assertEvery, assertSort, assertDisjoint, probe, sieveDiff } =
    makeSuite((method, path, o = {}) => request(method, path, { ...opts, ...o }));

  // ── ORDERS ──────────────────────────────────────────────────────────────────
  const ordList = await probe("user orders list", "/api/user/orders?pageSize=12");
  assertEvery(
    `user orders — every id starts with '${SLUG_PREFIXES.ORDER}'`,
    itemsOf(ordList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.ORDER),
  );

  // All orders must belong to the authenticated buyer
  if (uid) {
    assertEvery(
      "user orders — every item.buyerId matches the authenticated user",
      itemsOf(ordList.body),
      (it) => it.buyerId === uid,
    );
  }

  // status filter
  for (const st of [ORDER_STATUS.PENDING, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED]) {
    const r = await probe(
      `user orders status=${st}`,
      `/api/user/orders?pageSize=10&filters=status%3D%3D${st}`,
    );
    assertEvery(
      `user orders status=${st} — every item.status matches`,
      itemsOf(r.body),
      (it) => it.status === st || it.status === st.toUpperCase(),
    );
  }

  // sort by createdAt desc (default)
  const ordSortDesc = await request(
    "GET",
    `/api/user/orders?pageSize=10&sorts=${sortBy("createdAt")}`,
    opts,
  );
  assertSort("user orders sort=-createdAt descending", itemsOf(ordSortDesc.body), "createdAt", "desc");

  // sort by createdAt asc
  const ordSortAsc = await request(
    "GET",
    `/api/user/orders?pageSize=10&sorts=${sortBy("createdAt", "ASC")}`,
    opts,
  );
  assertSort("user orders sort=createdAt ascending", itemsOf(ordSortAsc.body), "createdAt", "asc");

  // pagination
  const ordP1 = await request("GET", `/api/user/orders?pageSize=5&page=1&sorts=${sortBy("createdAt")}`, opts);
  const ordP2 = await request("GET", `/api/user/orders?pageSize=5&page=2&sorts=${sortBy("createdAt")}`, opts);
  if (itemsOf(ordP1.body).length > 0 && itemsOf(ordP2.body).length > 0) {
    assertDisjoint("user orders pagination — page1 ∩ page2 = ∅", itemsOf(ordP1.body), itemsOf(ordP2.body));
  }

  await sieveDiff(
    "user orders status=pending vs delivered",
    `/api/user/orders?pageSize=12&filters=status%3D%3D${ORDER_STATUS.PENDING}`,
    `/api/user/orders?pageSize=12&filters=status%3D%3D${ORDER_STATUS.DELIVERED}`,
  );

  // ── ADDRESSES ───────────────────────────────────────────────────────────────
  const addrList = await probe("user addresses list", "/api/user/addresses?pageSize=20");

  // All addresses must belong to the buyer
  if (uid) {
    assertEvery(
      "user addresses — every item.ownerId matches the authenticated user",
      itemsOf(addrList.body),
      (it) => it.ownerId === uid,
    );
  }

  // sort by createdAt desc
  const addrSort = await request("GET", `/api/user/addresses?pageSize=10&sorts=${sortBy("createdAt")}`, opts);
  assertSort("user addresses sort=-createdAt descending", itemsOf(addrSort.body), "createdAt", "desc");

  // default address toggle — if any exist
  const defaultAddr = await probe(
    "user addresses isDefault=true",
    "/api/user/addresses?pageSize=10&filters=isDefault%3D%3Dtrue",
  );
  assertEvery(
    "user addresses isDefault=true — every item.isDefault===true",
    itemsOf(defaultAddr.body),
    (it) => it.isDefault === true,
  );

  // ── WISHLIST ─────────────────────────────────────────────────────────────────
  const wishR = await probe(
    "user wishlist",
    "/api/wishlist",
    {},
    (r) => [200, 404].includes(r.status),
  );
  // Wishlist is one doc per user — items array inside
  if (wishR.status === 200) {
    const wishItems = wishR.body?.data?.items ?? [];
    rec(
      "user wishlist — items is array",
      Array.isArray(wishItems),
      `length=${wishItems.length}`,
    );
  }

  // ── HISTORY ──────────────────────────────────────────────────────────────────
  const histR = await probe(
    "user history",
    "/api/user/history?pageSize=20",
    {},
    (r) => [200, 404].includes(r.status),
  );

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
  const notifList = await probe("user notifications list", "/api/user/notifications?pageSize=12");
  assertEvery(
    `user notifications — every id starts with '${SLUG_PREFIXES.NOTIFICATION}'`,
    itemsOf(notifList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.NOTIFICATION),
  );

  // All notifications must belong to the buyer
  if (uid) {
    assertEvery(
      "user notifications — every item.userId matches the authenticated user",
      itemsOf(notifList.body),
      (it) => it.userId === uid,
    );
  }

  // isRead filter
  const unreadNotif = await probe(
    "user notifications isRead=false",
    "/api/user/notifications?pageSize=10&filters=isRead%3D%3Dfalse",
  );
  assertEvery(
    "user notifications isRead=false — every item.isRead===false",
    itemsOf(unreadNotif.body),
    (it) => it.isRead === false,
  );

  const readNotif = await probe(
    "user notifications isRead=true",
    "/api/user/notifications?pageSize=10&filters=isRead%3D%3Dtrue",
  );
  assertEvery(
    "user notifications isRead=true — every item.isRead===true",
    itemsOf(readNotif.body),
    (it) => it.isRead === true,
  );

  // sort by createdAt desc
  const notifSortDate = await request(
    "GET",
    `/api/user/notifications?pageSize=10&sorts=${sortBy("createdAt")}`,
    opts,
  );
  assertSort("user notifications sort=-createdAt descending", itemsOf(notifSortDate.body), "createdAt", "desc");

  await sieveDiff(
    "user notifications isRead=false vs isRead=true",
    "/api/user/notifications?pageSize=12&filters=isRead%3D%3Dfalse",
    "/api/user/notifications?pageSize=12&filters=isRead%3D%3Dtrue",
  );

  // unread count endpoint
  const unreadCount = await probe(
    "user notifications unread-count",
    "/api/user/notifications/unread-count",
    {},
    (r) => r.status === 200,
  );
  rec(
    "user notifications unread-count — returns numeric count",
    typeof (unreadCount.body?.data?.count ?? unreadCount.body?.count) === "number",
    `count=${unreadCount.body?.data?.count ?? unreadCount.body?.count ?? "missing"}`,
  );

  // ── REVIEWS ──────────────────────────────────────────────────────────────────
  const revList = await probe("user reviews list", "/api/user/reviews?pageSize=12");
  assertEvery(
    `user reviews — every id starts with '${SLUG_PREFIXES.REVIEW}'`,
    itemsOf(revList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.REVIEW),
  );

  // All reviews must be from the buyer
  if (uid) {
    assertEvery(
      "user reviews — every item.buyerId matches the authenticated user",
      itemsOf(revList.body),
      (it) => it.buyerId === uid,
    );
  }

  const revSortDate = await request(
    "GET",
    `/api/user/reviews?pageSize=10&sorts=${sortBy("createdAt")}`,
    opts,
  );
  assertSort("user reviews sort=-createdAt descending", itemsOf(revSortDate.body), "createdAt", "desc");

  // ── BIDS ────────────────────────────────────────────────────────────────────
  const bidList = await probe("user bids list", "/api/user/bids?pageSize=12");
  assertEvery(
    `user bids — every id starts with '${SLUG_PREFIXES.BID}'`,
    itemsOf(bidList.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.BID),
  );

  // All bids must be from the buyer
  if (uid) {
    assertEvery(
      "user bids — every item.bidderId matches the authenticated user",
      itemsOf(bidList.body),
      (it) => it.bidderId === uid,
    );
  }

  // status filter
  const activeBids = await probe(
    "user bids status=active",
    "/api/user/bids?pageSize=10&filters=status%3D%3Dactive",
  );
  assertEvery(
    "user bids status=active — every item.status===active",
    itemsOf(activeBids.body),
    (it) => it.status === "active",
  );

  // sort by amount desc
  const bidSortAmt = await request(
    "GET",
    `/api/user/bids?pageSize=10&sorts=${sortBy("amount")}`,
    opts,
  );
  assertSort("user bids sort=-amount descending", itemsOf(bidSortAmt.body), "amount", "desc");

  // sort by bidTime desc
  const bidSortTime = await request(
    "GET",
    `/api/user/bids?pageSize=10&sorts=${sortBy("bidTime")}`,
    opts,
  );
  assertSort("user bids sort=-bidTime descending", itemsOf(bidSortTime.body), "bidTime", "desc");

  await sieveDiff(
    "user bids status=active vs outbid",
    "/api/user/bids?pageSize=12&filters=status%3D%3Dactive",
    "/api/user/bids?pageSize=12&filters=status%3D%3Doutbid",
  );

  // ── SESSIONS ─────────────────────────────────────────────────────────────────
  const sessList = await probe("user sessions list", "/api/user/sessions?pageSize=12");

  const activeSess = await probe(
    "user sessions isActive=true",
    "/api/user/sessions?pageSize=10&filters=isActive%3D%3Dtrue",
  );
  assertEvery(
    "user sessions isActive=true — every item.isActive===true",
    itemsOf(activeSess.body),
    (it) => it.isActive === true,
  );

  const sessSortDate = await request(
    "GET",
    `/api/user/sessions?pageSize=10&sorts=${sortBy("lastActivity")}`,
    opts,
  );
  assertSort("user sessions sort=-lastActivity descending", itemsOf(sessSortDate.body), "lastActivity", "desc");

  // ── CONVERSATIONS (messages) ──────────────────────────────────────────────────
  const convList = await probe(
    "user conversations list",
    "/api/user/conversations?pageSize=12",
    {},
    (r) => [200, 404].includes(r.status),
  );
  if (convList.status === 200) {
    const convSortDate = await request(
      "GET",
      `/api/user/conversations?pageSize=10&sorts=${sortBy("lastMessageAt")}`,
      opts,
    );
    assertSort(
      "user conversations sort=-lastMessageAt descending",
      itemsOf(convSortDate.body),
      "lastMessageAt",
      "desc",
    );
  }

  // ── OFFERS ───────────────────────────────────────────────────────────────────
  await probe(
    "user offers list",
    "/api/user/offers?pageSize=12",
    {},
    (r) => [200, 404].includes(r.status),
  );

  return results;
}
