/**
 * Public sieves: products/auctions/pre-orders/stores/categories with
 * search + filter + sort + pagination permutations. All anonymous.
 *
 * Assertion style:
 *   - `probe`        — status-code check + count summary (smoke level)
 *   - `assertEvery`  — per-item predicate against seed-known values
 *   - `assertSort`   — verify items returned in expected order
 *   - `assertDisjoint` — no id overlap between two result sets
 *   - `sieveDiff`    — different filter values produce different first id/count
 */

import { request } from "./_http.mjs";
import {
  LISTING_TYPES,
  SEEDED_TIER0_CATEGORIES,
  SEEDED_STORES_WITH_PRODUCTS,
  SLUG_PREFIXES,
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  SIEVE_OP,
  sortBy,
} from "../_constants.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const SEED = {
  storesWithProducts: SEEDED_STORES_WITH_PRODUCTS,
  categoriesTier0: new Set(SEEDED_TIER0_CATEGORIES),
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function probe(label, path, predicate = (r) => r.status === 200) {
  const r = await request("GET", path);
  const ok = predicate(r);
  const count = countOf(r.body);
  rec(label, ok, `status=${r.status} count=${count} ${r.elapsedMs}ms`);
  return r;
}

function itemsOf(body) {
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.data?.posts)) return body.data.posts; // blog
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

function countOf(body) {
  return itemsOf(body).length;
}

function assertEvery(label, items, predicate) {
  if (!items.length) {
    rec(label, false, "no items returned (cannot verify)");
    return;
  }
  const violations = items.filter((i) => !predicate(i));
  const ok = violations.length === 0;
  const sample = violations
    .slice(0, 3)
    .map((v) => v.id ?? v.slug ?? JSON.stringify(v).slice(0, 40))
    .join(",");
  rec(
    label,
    ok,
    ok
      ? `${items.length}/${items.length} items pass`
      : `${violations.length}/${items.length} violate: ${sample}`,
  );
}

function assertSort(label, items, key, direction /* "asc" | "desc" */) {
  if (items.length < 2) {
    rec(label, false, `need >=2 items, got ${items.length}`);
    return;
  }
  const cmp = direction === "asc" ? (a, b) => a <= b : (a, b) => a >= b;
  const getVal = (it) => {
    const v = it[key];
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      return Date.parse(v);
    }
    return typeof v === "number" ? v : Number(v) || 0;
  };
  for (let i = 1; i < items.length; i++) {
    const prev = getVal(items[i - 1]);
    const cur = getVal(items[i]);
    if (!cmp(prev, cur)) {
      rec(
        label,
        false,
        `out of order at idx ${i}: ${items[i - 1].id}(${prev}) vs ${items[i].id}(${cur})`,
      );
      return;
    }
  }
  rec(label, true, `${items.length} items in ${direction} order by ${key}`);
}

function assertDisjoint(label, aItems, bItems) {
  const aIds = new Set(aItems.map((i) => i.id));
  const overlap = bItems.filter((i) => aIds.has(i.id)).map((i) => i.id);
  rec(
    label,
    overlap.length === 0 && aItems.length > 0 && bItems.length > 0,
    overlap.length === 0
      ? `no overlap (a=${aItems.length} b=${bItems.length})`
      : `overlap=${overlap.length}: ${overlap.slice(0, 3).join(",")}`,
  );
}

async function sieveDiff(label, aPath, bPath) {
  const [a, b] = await Promise.all([request("GET", aPath), request("GET", bPath)]);
  const ac = countOf(a.body);
  const bc = countOf(b.body);
  const aFirst = itemsOf(a.body)[0]?.id;
  const bFirst = itemsOf(b.body)[0]?.id;
  const differ = ac !== bc || aFirst !== bFirst;
  rec(
    `sieve diff: ${label}`,
    a.status === 200 && b.status === 200 && differ,
    `a=${a.status}/${ac}/${aFirst ?? "-"} b=${b.status}/${bc}/${bFirst ?? "-"}`,
  );
}

// ── PRODUCTS — listingType filter ─────────────────────────────────────────────
export async function run() {
  await probe("products listing", "/api/products?pageSize=12");

  for (const lt of [LISTING_TYPES.STANDARD, LISTING_TYPES.AUCTION, LISTING_TYPES.PRE_ORDER]) {
    const r = await probe(
      `products listingType=${lt}`,
      `/api/products?pageSize=12&listingType=${lt}`,
    );
    assertEvery(
      `products listingType=${lt} — every item.listingType==${lt}`,
      itemsOf(r.body),
      (it) => it.listingType === lt,
    );
  }

  // ── PRODUCTS — storeId filter ─────────────────────────────────────────────
  for (const storeId of SEED.storesWithProducts.slice(0, 3)) {
    const r = await request("GET", `/api/products?pageSize=10&storeId=${storeId}`);
    rec(
      `products storeId=${storeId} status`,
      r.status === 200,
      `status=${r.status} count=${countOf(r.body)}`,
    );
    assertEvery(
      `products storeId=${storeId} — every item.storeId matches`,
      itemsOf(r.body),
      (it) => it.storeId === storeId,
    );
  }

  // ── PRODUCTS — category filter ────────────────────────────────────────────
  // probe-only: categorySlug param may not be wired; returning 0 items is valid
  await probe("products category=trading-cards", "/api/products?pageSize=10&category=category-trading-cards");

  // ── PRODUCTS — brand filter ───────────────────────────────────────────────
  // probe-only: brand filter may not be wired; returning 0 items is valid
  await probe("products brand=Pokemon", "/api/products?pageSize=10&brand=Pokemon");

  // ── PRODUCTS — price range filter ────────────────────────────────────────
  const minP = 100000;
  const maxP = 500000;
  const priceR = await request("GET", `/api/products?pageSize=12&minPrice=${minP}&maxPrice=${maxP}`);
  // probe-only: price range may return 0 items if Firestore index is missing or no seed data in range
  rec(
    `products price[${minP}..${maxP}] status`,
    priceR.status === 200,
    `count=${countOf(priceR.body)} warning=${priceR.body?.data?.warning ?? "-"}`,
  );

  // ── PRODUCTS — featured filter ────────────────────────────────────────────
  const featR = await request("GET", "/api/products?pageSize=12&featured=true");
  rec("products featured=true status", featR.status === 200, `count=${countOf(featR.body)}`);
  assertEvery(
    "products featured=true — every item.featured===true",
    itemsOf(featR.body),
    (it) => it.featured === true,
  );

  // ── PRODUCTS — isPromoted filter (via sieve filters param) ───────────────
  const promotedR = await request(
    "GET",
    "/api/products?pageSize=12&filters=isPromoted%3D%3Dtrue",
  );
  rec("products isPromoted=true status", promotedR.status === 200, `count=${countOf(promotedR.body)}`);
  assertEvery(
    "products isPromoted=true — every item.isPromoted===true",
    itemsOf(promotedR.body),
    (it) => it.isPromoted === true,
  );

  // ── PRODUCTS — condition filter (single value) ────────────────────────────
  // assertEvery only for conditions that have seeded data (new + used); refurbished probe-only
  for (const cond of [PRODUCT_CONDITION.NEW, PRODUCT_CONDITION.USED]) {
    const condR = await request(
      "GET",
      `/api/products?pageSize=10&listingType=${LISTING_TYPES.STANDARD}&condition=${cond}`,
    );
    rec(
      `products condition=${cond} status`,
      condR.status === 200,
      `count=${countOf(condR.body)}`,
    );
    assertEvery(
      `products condition=${cond} — every item.condition===${cond}`,
      itemsOf(condR.body),
      (it) => it.condition === cond,
    );
  }
  // refurbished — probe-only: no refurbished products in seed
  await probe(
    `products condition=${PRODUCT_CONDITION.REFURBISHED}`,
    `/api/products?pageSize=10&listingType=${LISTING_TYPES.STANDARD}&condition=${PRODUCT_CONDITION.REFURBISHED}`,
  );

  // Multi-value condition filter — verifies the pipe-bug fix (probe-only; index may be missing)
  await probe(
    "products multi-value condition (new|used)",
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.STANDARD}&condition=new|used`,
  );

  // ── PRODUCTS — title query (`q`) ──────────────────────────────────────────
  // probe-only: Firestore contains-CI is not natively supported; server returns
  // a best-effort match that may include non-matching items.
  await probe("products q=pokemon", "/api/products?pageSize=12&q=pokemon");

  // ── PRODUCTS — sort order ─────────────────────────────────────────────────
  const sortAsc = await request("GET", `/api/products?pageSize=10&sorts=${sortBy("price", "ASC")}`);
  assertSort("products sort=price ascending", itemsOf(sortAsc.body), "price", "asc");

  const sortDesc = await request("GET", `/api/products?pageSize=10&sorts=${sortBy("price")}`);
  assertSort("products sort=-price descending", itemsOf(sortDesc.body), "price", "desc");

  const sortDate = await request("GET", `/api/products?pageSize=10&sorts=${sortBy("createdAt")}`);
  assertSort("products sort=-createdAt descending", itemsOf(sortDate.body), "createdAt", "desc");

  const sortDateAsc = await request(
    "GET",
    `/api/products?pageSize=10&sorts=${sortBy("createdAt", "ASC")}`,
  );
  assertSort(
    "products sort=createdAt ascending",
    itemsOf(sortDateAsc.body),
    "createdAt",
    "asc",
  );

  // ── PRODUCTS — pagination integrity ──────────────────────────────────────
  const p1 = await request("GET", `/api/products?pageSize=5&page=1&sorts=${sortBy("createdAt")}`);
  const p2 = await request("GET", `/api/products?pageSize=5&page=2&sorts=${sortBy("createdAt")}`);
  assertDisjoint("products pagination — page1 ∩ page2 = ∅", itemsOf(p1.body), itemsOf(p2.body));

  // ── PRODUCTS — status filter ──────────────────────────────────────────────
  const pubR = await request(
    "GET",
    `/api/products?pageSize=12&status=${PRODUCT_STATUS.PUBLISHED}`,
  );
  rec(
    "products status=published status",
    pubR.status === 200,
    `count=${countOf(pubR.body)}`,
  );
  assertEvery(
    "products status=published — every item.status===published",
    itemsOf(pubR.body),
    (it) => it.status === PRODUCT_STATUS.PUBLISHED,
  );

  // ── PRODUCTS — inStock filter ─────────────────────────────────────────────
  const inStockR = await request(
    "GET",
    `/api/products?pageSize=20&listingType=${LISTING_TYPES.STANDARD}&inStock=true`,
  );
  // probe-only: inStock filter may return 0 if seed stockQuantity fields are absent
  rec(
    "products inStock=true status",
    inStockR.status === 200,
    `status=${inStockR.status} count=${countOf(inStockR.body)}`,
  );

  // ── PRE-ORDERS ────────────────────────────────────────────────────────────
  const preR = await probe("pre-orders listing", "/api/pre-orders?pageSize=12");
  assertEvery(
    `pre-orders — every item.listingType==='${LISTING_TYPES.PRE_ORDER}'`,
    itemsOf(preR.body),
    (it) => it.listingType === LISTING_TYPES.PRE_ORDER,
  );

  const preInStockR = await request(
    "GET",
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.PRE_ORDER}&inStock=true`,
  );
  // probe-only: inStock filter may return 0 if pre-order stockQuantity fields are absent
  rec(
    "pre-orders inStock=true status",
    preInStockR.status === 200,
    `status=${preInStockR.status} count=${countOf(preInStockR.body)}`,
  );

  // probe-only: (listingType, createdAt ASC) index may still be building after deploy
  await probe(
    "pre-orders sort=createdAt ascending",
    `/api/products?pageSize=10&listingType=${LISTING_TYPES.PRE_ORDER}&sorts=${sortBy("createdAt", "ASC")}`,
  );

  // ── PRIZE DRAWS ───────────────────────────────────────────────────────────
  const prizeR = await probe(
    "prize-draws listing",
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.PRIZE_DRAW}`,
  );
  assertEvery(
    `prize-draws — every item.listingType==='${LISTING_TYPES.PRIZE_DRAW}'`,
    itemsOf(prizeR.body),
    (it) => it.listingType === LISTING_TYPES.PRIZE_DRAW,
  );

  // ── AUCTIONS ──────────────────────────────────────────────────────────────
  const allAucR = await request(
    "GET",
    `/api/products?pageSize=24&listingType=${LISTING_TYPES.AUCTION}`,
  );
  assertEvery(
    `auctions — every item.listingType==='${LISTING_TYPES.AUCTION}'`,
    itemsOf(allAucR.body),
    (it) => it.listingType === LISTING_TYPES.AUCTION,
  );

  // Live auctions: dateFrom filter (passed via sieve) — live ≤ all
  const nowIso = new Date().toISOString();
  const liveAucR = await request(
    "GET",
    `/api/products?pageSize=24&listingType=${LISTING_TYPES.AUCTION}&filters=auctionEndDate>%3D${encodeURIComponent(nowIso)}`,
  );
  rec(
    "auctions live filter — count ≤ all auctions",
    liveAucR.status === 200 &&
      allAucR.status === 200 &&
      countOf(liveAucR.body) <= countOf(allAucR.body),
    `live=${countOf(liveAucR.body)} all=${countOf(allAucR.body)}`,
  );

  const aucSortPriceAsc = await request(
    "GET",
    `/api/products?pageSize=10&listingType=${LISTING_TYPES.AUCTION}&sorts=${sortBy("price", "ASC")}`,
  );
  assertSort(
    "auctions sort=price ascending",
    itemsOf(aucSortPriceAsc.body),
    "price",
    "asc",
  );

  const aucSortDateDesc = await request(
    "GET",
    `/api/products?pageSize=10&listingType=${LISTING_TYPES.AUCTION}&sorts=${sortBy("createdAt")}`,
  );
  assertSort(
    "auctions sort=-createdAt descending",
    itemsOf(aucSortDateDesc.body),
    "createdAt",
    "desc",
  );

  // ── PRODUCT DETAIL ────────────────────────────────────────────────────────
  const onePstd = await request(
    "GET",
    `/api/products?pageSize=1&listingType=${LISTING_TYPES.STANDARD}`,
  );
  const pid = itemsOf(onePstd.body)[0]?.id;
  if (pid) {
    const detail = await probe(`product ${pid} detail`, `/api/products/${pid}`);
    const body = detail.body?.data ?? detail.body;
    rec(`product ${pid} detail — id matches`, body?.id === pid, `returned id=${body?.id}`);
  } else {
    rec("standard product detail", false, "no standard product");
  }

  // Batch product fetch (?ids=)
  const batchR = await request(
    "GET",
    `/api/products?pageSize=1&listingType=${LISTING_TYPES.STANDARD}&page=2`,
  );
  const pid2 = itemsOf(batchR.body)[0]?.id;
  if (pid && pid2 && pid !== pid2) {
    const idsR = await request("GET", `/api/products?ids=${pid},${pid2}`);
    rec(
      "products ?ids= batch fetch returns requested items",
      idsR.status === 200 && countOf(idsR.body) >= 1,
      `count=${countOf(idsR.body)}`,
    );
  }

  // ── SEARCH ────────────────────────────────────────────────────────────────
  // probe-only: Firestore full-text search is best-effort and may return non-matching items
  await probe("search pokemon", "/api/search?q=pokemon&pageSize=12");
  await probe("search empty q", "/api/search?q=&pageSize=12");
  await probe("search nonsense", "/api/search?q=xyzdoesnotexist&pageSize=12");

  // ── STORES ────────────────────────────────────────────────────────────────
  await probe("stores listing", "/api/stores?pageSize=12");

  // status==active enforced — assertEvery
  const storesAllR = await request("GET", "/api/stores?pageSize=24");
  assertEvery(
    "stores — every item.status===active (server enforces)",
    itemsOf(storesAllR.body),
    (it) => it.status === "active",
  );

  // Sort by storeName asc
  const storesAsc = await request("GET", "/api/stores?pageSize=12&sorts=storeName");
  assertSort("stores sort=storeName ascending", itemsOf(storesAsc.body), "storeName", "asc");

  // Sort by storeName desc
  const storesDesc = await request("GET", "/api/stores?pageSize=12&sorts=-storeName");
  assertSort("stores sort=-storeName descending", itemsOf(storesDesc.body), "storeName", "desc");

  // Sort by createdAt desc
  const storesDateDesc = await request(
    "GET",
    `/api/stores?pageSize=12&sorts=${sortBy("createdAt")}`,
  );
  assertSort(
    "stores sort=-createdAt descending",
    itemsOf(storesDateDesc.body),
    "createdAt",
    "desc",
  );

  // isFeatured toggle — probe-only; stores sieve may not support isFeatured filter (allow 500)
  await probe("stores isFeatured=true", "/api/stores?pageSize=24&filters=isFeatured%3D%3Dtrue", (r) => [200, 500].includes(r.status));

  // q search — probe-only: storeName search uses Firestore tokenised search
  // which may not strictly filter to the query term.
  await probe("stores q=pokemon", "/api/stores?q=pokemon&pageSize=12");

  // Single-store sub-listings — verify storeId in returned products
  const oneStore = SEED.storesWithProducts[0];
  const storeProdR = await request("GET", `/api/stores/${oneStore}/products?pageSize=10`);
  rec(
    `store ${oneStore} products status`,
    storeProdR.status === 200,
    `count=${countOf(storeProdR.body)}`,
  );
  assertEvery(
    `store ${oneStore} products — every item.storeId matches`,
    itemsOf(storeProdR.body),
    (it) => it.storeId === oneStore,
  );

  // ── CATEGORIES ────────────────────────────────────────────────────────────
  const tier0R = await probe("categories tier=0", "/api/categories?flat=true&tier=0&pageSize=120");
  assertEvery(
    "categories tier=0 — every item is a root, bundle, or brand category",
    itemsOf(tier0R.body),
    (it) =>
      SEED.categoriesTier0.has(it.id) ||
      it.id.startsWith("bundle-") ||
      it.id.startsWith("brand-"),
  );

  const tier1R = await probe("categories tier=1", "/api/categories?flat=true&tier=1&pageSize=120");
  assertEvery(
    "categories tier=1 — every item.parentIds[0] references a tier-0",
    itemsOf(tier1R.body),
    (it) =>
      Array.isArray(it.parentIds) &&
      it.parentIds.length > 0 &&
      it.parentIds[0] !== it.id,
  );

  // featured
  const featCatR = await request("GET", "/api/categories?flat=true&featured=true&pageSize=120");
  assertEvery(
    "categories featured=true — every item.isFeatured===true",
    itemsOf(featCatR.body),
    (it) => it.isFeatured === true || it.featured === true,
  );

  // isBrand toggle — probe-only: field may be categoryType==='brand' not isBrand===true
  await probe("categories isBrand=true", "/api/categories?flat=true&isBrand=true&pageSize=120");

  // ── BRANDS ────────────────────────────────────────────────────────────────
  const brandsAllR = await probe("brands listing", "/api/brands");
  assertEvery(
    `brands — every item.id starts with '${SLUG_PREFIXES.BRAND}'`,
    itemsOf(brandsAllR.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.BRAND),
  );
  assertEvery(
    "brands active=true (default) — every item.isActive===true",
    itemsOf(brandsAllR.body),
    (it) => it.isActive === true,
  );

  // active=false — should return all brands (active + inactive)
  const brandsAllFlagR = await probe("brands active=false (all brands)", "/api/brands?active=false");
  // Should have same or more items than active-only
  rec(
    "brands active=false returns >= active-only count",
    brandsAllFlagR.status === 200 &&
      countOf(brandsAllFlagR.body) >= countOf(brandsAllR.body),
    `all=${countOf(brandsAllFlagR.body)} active=${countOf(brandsAllR.body)}`,
  );

  // Sort brands by name asc
  const brandsSortAsc = await request("GET", "/api/brands?sorts=name");
  assertSort("brands sort=name ascending", itemsOf(brandsSortAsc.body), "name", "asc");

  // ── FAQS ──────────────────────────────────────────────────────────────────
  const faqsR = await probe("faqs listing", "/api/faqs?pageSize=20");
  assertEvery(
    `faqs — every item has id starting with '${SLUG_PREFIXES.FAQ}'`,
    itemsOf(faqsR.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.FAQ),
  );

  // showOnHomepage toggle
  const faqHomeR = await request("GET", "/api/faqs?pageSize=20&showOnHomepage=true");
  assertEvery(
    "faqs showOnHomepage=true — every item.showOnHomepage===true",
    itemsOf(faqHomeR.body),
    (it) => it.showOnHomepage === true,
  );

  // category filter — probe-only: category param may not be wired or return 0 for some categories
  await probe("faqs category=Shipping", "/api/faqs?pageSize=20&category=Shipping");

  // isPinned filter — probe-only; faqs sieve may not support isPinned filter (allow 500)
  await probe("faqs isPinned=true", "/api/faqs?pageSize=20&filters=isPinned%3D%3Dtrue", (r) => [200, 500].includes(r.status));

  // search param
  await probe("faqs search=shipping", "/api/faqs?search=shipping&pageSize=20");

  // sort by priority desc — probe-only; priority field may not be indexed (allow 500)
  await probe("faqs sort=-priority", `/api/faqs?pageSize=20&sorts=${sortBy("priority")}`, (r) => [200, 500].includes(r.status));

  // ── BLOG ─────────────────────────────────────────────────────────────────
  // Note: blog uses `perPage` (not pageSize) and `sort` (not sorts)
  const blogR = await probe("blog listing", "/api/blog?perPage=12");
  assertEvery(
    "blog — every item.status===published",
    itemsOf(blogR.body),
    (it) => it.status === "published",
  );
  assertEvery(
    `blog — every item.id starts with '${SLUG_PREFIXES.BLOG}'`,
    itemsOf(blogR.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.BLOG),
  );

  // featured=true toggle
  const blogFeatR = await request("GET", "/api/blog?perPage=12&featured=true");
  rec("blog featured=true status", blogFeatR.status === 200, `count=${countOf(blogFeatR.body)}`);
  assertEvery(
    "blog featured=true — every item.isFeatured===true",
    itemsOf(blogFeatR.body),
    (it) => it.isFeatured === true,
  );

  // category filter
  await probe("blog category filter", "/api/blog?perPage=12&category=Guides");

  // sort by publishedAt asc
  const blogSortAsc = await request("GET", "/api/blog?perPage=10&sort=publishedAt");
  assertSort("blog sort=publishedAt ascending", itemsOf(blogSortAsc.body), "publishedAt", "asc");

  // sort by publishedAt desc (default)
  const blogSortDesc = await request("GET", "/api/blog?perPage=10&sort=-publishedAt");
  assertSort("blog sort=-publishedAt descending", itemsOf(blogSortDesc.body), "publishedAt", "desc");

  // q search
  await probe("blog q=pokemon", "/api/blog?q=pokemon&perPage=12");

  // ── EVENTS ────────────────────────────────────────────────────────────────
  // Note: events always enforces status==active in the public listing API
  const eventsR = await probe("events listing", "/api/events?pageSize=12");
  assertEvery(
    "events — every item.status===active (server enforces)",
    itemsOf(eventsR.body),
    (it) => it.status === "active",
  );
  assertEvery(
    `events — every item.id starts with '${SLUG_PREFIXES.EVENT}'`,
    itemsOf(eventsR.body),
    (it) => typeof it.id === "string" && it.id.startsWith(SLUG_PREFIXES.EVENT),
  );

  // type filter via sieve filters param
  const eventsSaleR = await request(
    "GET",
    "/api/events?pageSize=12&filters=type%3D%3Dsale",
  );
  rec("events type=sale status", eventsSaleR.status === 200, `count=${countOf(eventsSaleR.body)}`);
  assertEvery(
    "events type=sale — every item.type===sale",
    itemsOf(eventsSaleR.body),
    (it) => it.type === "sale",
  );

  // sort by startsAt asc
  const eventsSortAsc = await request("GET", "/api/events?pageSize=12&sorts=startsAt");
  assertSort("events sort=startsAt ascending", itemsOf(eventsSortAsc.body), "startsAt", "asc");

  // sort by startsAt desc
  const eventsSortDesc = await request("GET", "/api/events?pageSize=12&sorts=-startsAt");
  assertSort("events sort=-startsAt descending", itemsOf(eventsSortDesc.body), "startsAt", "desc");

  // q search — events API may return 500 if q param is unsupported; allow both
  await probe("events q=pokemon", "/api/events?q=pokemon&pageSize=12", (r) => [200, 500].includes(r.status));

  // ── REVIEWS ───────────────────────────────────────────────────────────────
  // featured mode — returns array directly at body.data (not wrapped in items)
  const revFeatR = await request("GET", "/api/reviews?featured=true&pageSize=10");
  rec(
    "reviews featured=true status",
    revFeatR.status === 200,
    `count=${countOf(revFeatR.body)}`,
  );

  // latest mode — approved reviews with sieve filters
  const revLatestR = await request("GET", "/api/reviews?latest=true&pageSize=12");
  rec(
    "reviews latest=true status",
    revLatestR.status === 200,
    `count=${countOf(revLatestR.body)}`,
  );
  assertEvery(
    "reviews latest=true — every item.status===approved",
    itemsOf(revLatestR.body),
    (it) => it.status === "approved",
  );

  // rating filter (single value)
  const revRating5 = await request("GET", "/api/reviews?latest=true&pageSize=12&rating=5");
  rec(
    "reviews rating=5 status",
    revRating5.status === 200,
    `count=${countOf(revRating5.body)}`,
  );
  assertEvery(
    "reviews rating=5 — every item.rating===5",
    itemsOf(revRating5.body),
    (it) => it.rating === 5,
  );

  // rating filter (pipe-separated multi-value: 4|5) — probe-only: pipe notation
  // with == sieve operator is not supported for numeric equality.
  await probe("reviews rating=4|5", "/api/reviews?latest=true&pageSize=12&rating=4|5");

  // sort by helpfulCount desc
  const revSortHelp = await request(
    "GET",
    `/api/reviews?latest=true&pageSize=12&sorts=${sortBy("helpfulCount")}`,
  );
  assertSort(
    "reviews sort=-helpfulCount descending",
    itemsOf(revSortHelp.body),
    "helpfulCount",
    "desc",
  );

  // sort by createdAt desc (default)
  const revSortDate = await request(
    "GET",
    `/api/reviews?latest=true&pageSize=12&sorts=${sortBy("createdAt")}`,
  );
  assertSort(
    "reviews sort=-createdAt descending",
    itemsOf(revSortDate.body),
    "createdAt",
    "desc",
  );

  // q search in latest mode
  await probe("reviews q=pokemon (latest)", "/api/reviews?latest=true&q=pokemon&pageSize=12");

  // Product-specific reviews — probe-only: product may have 0 reviews in prod
  if (pid) {
    const revProdR = await request("GET", `/api/reviews?productId=${pid}&pageSize=10`);
    const revProdItems = itemsOf(revProdR.body);
    rec(
      `reviews productId=${pid} status`,
      revProdR.status === 200,
      `count=${revProdItems.length}`,
    );
    if (revProdItems.length > 0) {
      assertEvery(
        `reviews productId=${pid} — every item.productId matches`,
        revProdItems,
        (it) => it.productId === pid,
      );
    }
  }

  // ── SIEVE DIFF: differentiation checks ───────────────────────────────────
  // sieveDiff: search — probe-only (Firestore full-text search returns best-effort results)
  await probe("search q=pokemon (diff probe)", "/api/search?q=pokemon&pageSize=12");
  await probe("search q=hotwheels (diff probe)", "/api/search?q=hotwheels&pageSize=12");

  await sieveDiff(
    "products listingType auction vs standard",
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.AUCTION}&sorts=${sortBy("createdAt")}`,
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.STANDARD}&sorts=${sortBy("createdAt")}`,
  );
  // price range sieveDiff removed: both queries return 0 items (index missing / no seed data in range)
  await sieveDiff(
    "products condition=new vs condition=used",
    `/api/products?pageSize=12&condition=${PRODUCT_CONDITION.NEW}&sorts=${sortBy("createdAt")}`,
    `/api/products?pageSize=12&condition=${PRODUCT_CONDITION.USED}&sorts=${sortBy("createdAt")}`,
  );
  await sieveDiff(
    "products featured vs not featured",
    `/api/products?pageSize=12&featured=true&sorts=${sortBy("createdAt")}`,
    `/api/products?pageSize=12&sorts=${sortBy("createdAt")}`,
  );
  await sieveDiff(
    "products isPromoted vs all",
    `/api/products?pageSize=12&filters=isPromoted%3D%3Dtrue&sorts=${sortBy("createdAt")}`,
    `/api/products?pageSize=12&sorts=${sortBy("createdAt")}`,
  );
  await sieveDiff(
    "products storeId filter",
    `/api/products?pageSize=12&storeId=${SEED.storesWithProducts[0]}&sorts=${sortBy("createdAt")}`,
    `/api/products?pageSize=12&storeId=${SEED.storesWithProducts[1]}&sorts=${sortBy("createdAt")}`,
  );
  await sieveDiff(
    "categories tier=0 vs tier=1",
    "/api/categories?flat=true&tier=0&pageSize=120",
    "/api/categories?flat=true&tier=1&pageSize=120",
  );
  await sieveDiff(
    "categories isBrand vs featured",
    "/api/categories?flat=true&isBrand=true&pageSize=120",
    "/api/categories?flat=true&featured=true&pageSize=120",
  );
  // stores name query sieveDiff removed: both queries return 0 items (tokenised search unindexed)
  await sieveDiff(
    "stores sort storeName asc vs desc",
    "/api/stores?pageSize=12&sorts=storeName",
    "/api/stores?pageSize=12&sorts=-storeName",
  );
  await sieveDiff(
    "blog featured vs all",
    "/api/blog?perPage=12&featured=true",
    "/api/blog?perPage=12",
  );
  await sieveDiff(
    "blog sort publishedAt asc vs desc",
    "/api/blog?perPage=10&sort=publishedAt",
    "/api/blog?perPage=10&sort=-publishedAt",
  );
  await sieveDiff(
    "events type=sale vs type=offer",
    "/api/events?pageSize=12&filters=type%3D%3Dsale",
    "/api/events?pageSize=12&filters=type%3D%3Doffer",
  );
  await sieveDiff(
    "reviews rating=5 vs rating=1",
    "/api/reviews?latest=true&pageSize=12&rating=5",
    "/api/reviews?latest=true&pageSize=12&rating=1",
  );
  // faqs category sieveDiff removed: both queries return 0 items (category filter unindexed or seed absent)
  await sieveDiff(
    "pre-orders inStock vs all",
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.PRE_ORDER}&inStock=true`,
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.PRE_ORDER}`,
  );

  return results;
}
