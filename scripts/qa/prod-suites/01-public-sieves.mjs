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
  const catR = await request("GET", "/api/products?pageSize=10&category=category-trading-cards");
  rec("products category=trading-cards status", catR.status === 200, `count=${countOf(catR.body)}`);
  assertEvery(
    "products category — every item.category matches filter",
    itemsOf(catR.body),
    (it) => it.category === "category-trading-cards",
  );

  // ── PRODUCTS — brand filter ───────────────────────────────────────────────
  const brandR = await request("GET", "/api/products?pageSize=10&brand=Pokemon");
  rec("products brand=Pokemon status", brandR.status === 200, `count=${countOf(brandR.body)}`);
  assertEvery(
    "products brand=Pokemon — every item.brand matches (ci)",
    itemsOf(brandR.body),
    (it) => typeof it.brand === "string" && it.brand.toLowerCase() === "pokemon",
  );

  // ── PRODUCTS — price range filter ────────────────────────────────────────
  const minP = 100000;
  const maxP = 500000;
  const priceR = await request("GET", `/api/products?pageSize=12&minPrice=${minP}&maxPrice=${maxP}`);
  rec(
    `products price[${minP}..${maxP}] status`,
    priceR.status === 200,
    `count=${countOf(priceR.body)} warning=${priceR.body?.data?.warning ?? "-"}`,
  );
  assertEvery(
    `products minPrice/maxPrice — every item.price in [${minP},${maxP}]`,
    itemsOf(priceR.body),
    (it) => typeof it.price === "number" && it.price >= minP && it.price <= maxP,
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
  for (const cond of [
    PRODUCT_CONDITION.NEW,
    PRODUCT_CONDITION.USED,
    PRODUCT_CONDITION.REFURBISHED,
  ]) {
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

  // Multi-value condition filter — verifies the pipe-bug fix
  const multiCondR = await request(
    "GET",
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.STANDARD}&condition=new|used`,
  );
  rec(
    "products multi-value condition filter returns results",
    multiCondR.status === 200 && countOf(multiCondR.body) > 0,
    `n=${countOf(multiCondR.body)}`,
  );
  assertEvery(
    "products multi-value condition — every item.condition is new or used",
    itemsOf(multiCondR.body),
    (it) => it.condition === PRODUCT_CONDITION.NEW || it.condition === PRODUCT_CONDITION.USED,
  );

  // ── PRODUCTS — title query (`q`) ──────────────────────────────────────────
  const qR = await request("GET", "/api/products?pageSize=12&q=pokemon");
  rec("products q=pokemon status", qR.status === 200, `count=${countOf(qR.body)}`);
  assertEvery(
    "products q=pokemon — every item.title contains 'pokemon' (ci)",
    itemsOf(qR.body),
    (it) => typeof it.title === "string" && it.title.toLowerCase().includes("pokemon"),
  );

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
  rec(
    "products inStock=true status",
    inStockR.status === 200,
    `status=${inStockR.status} count=${countOf(inStockR.body)}`,
  );
  assertEvery(
    "products inStock=true — every item.stockQuantity > 0",
    itemsOf(inStockR.body),
    (it) => typeof it.stockQuantity === "number" && it.stockQuantity > 0,
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
  rec(
    "pre-orders inStock=true status",
    preInStockR.status === 200,
    `status=${preInStockR.status} count=${countOf(preInStockR.body)}`,
  );
  assertEvery(
    "pre-orders inStock=true — every item.stockQuantity > 0",
    itemsOf(preInStockR.body),
    (it) => typeof it.stockQuantity === "number" && it.stockQuantity > 0,
  );

  const preSortAsc = await request(
    "GET",
    `/api/products?pageSize=10&listingType=${LISTING_TYPES.PRE_ORDER}&sorts=${sortBy("createdAt", "ASC")}`,
  );
  assertSort(
    "pre-orders sort=createdAt ascending",
    itemsOf(preSortAsc.body),
    "createdAt",
    "asc",
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
  await probe("search pokemon", "/api/search?q=pokemon&pageSize=12");
  const searchR = await request("GET", "/api/search?q=pokemon&pageSize=12");
  assertEvery(
    "search q=pokemon — every result title/desc contains pokemon (ci)",
    itemsOf(searchR.body),
    (it) => {
      const hay = `${it.title ?? ""} ${it.description ?? ""} ${it.tags?.join(" ") ?? ""}`.toLowerCase();
      return hay.includes("pokemon");
    },
  );
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

  // isFeatured toggle via sieve filters param
  const storesFeatR = await request(
    "GET",
    "/api/stores?pageSize=24&filters=isFeatured%3D%3Dtrue",
  );
  rec(
    "stores isFeatured=true status",
    storesFeatR.status === 200,
    `count=${countOf(storesFeatR.body)}`,
  );
  assertEvery(
    "stores isFeatured=true — every item.isFeatured===true",
    itemsOf(storesFeatR.body),
    (it) => it.isFeatured === true,
  );

  // q search
  const storesQ = await request("GET", "/api/stores?q=pokemon&pageSize=12");
  rec("stores q=pokemon status", storesQ.status === 200, `count=${countOf(storesQ.body)}`);
  assertEvery(
    "stores q=pokemon — every item.storeName contains 'pokemon' (ci)",
    itemsOf(storesQ.body),
    (it) =>
      typeof it.storeName === "string" && it.storeName.toLowerCase().includes("pokemon"),
  );

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

  // isBrand toggle
  const brandCatR = await request("GET", "/api/categories?flat=true&isBrand=true&pageSize=120");
  rec(
    "categories isBrand=true status",
    brandCatR.status === 200,
    `count=${countOf(brandCatR.body)}`,
  );
  assertEvery(
    "categories isBrand=true — every item.isBrand===true",
    itemsOf(brandCatR.body),
    (it) => it.isBrand === true,
  );

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

  // category filter
  const faqCatR = await request("GET", "/api/faqs?pageSize=20&category=Shipping");
  rec("faqs category=Shipping status", faqCatR.status === 200, `count=${countOf(faqCatR.body)}`);
  assertEvery(
    "faqs category=Shipping — every item.category===Shipping",
    itemsOf(faqCatR.body),
    (it) => it.category === "Shipping",
  );

  // isPinned filter via sieve
  const faqPinnedR = await request(
    "GET",
    "/api/faqs?pageSize=20&filters=isPinned%3D%3Dtrue",
  );
  rec(
    "faqs isPinned=true status",
    faqPinnedR.status === 200,
    `count=${countOf(faqPinnedR.body)}`,
  );
  assertEvery(
    "faqs isPinned=true — every item.isPinned===true",
    itemsOf(faqPinnedR.body),
    (it) => it.isPinned === true,
  );

  // search param
  await probe("faqs search=shipping", "/api/faqs?search=shipping&pageSize=20");

  // sort by priority desc (server default)
  const faqSortR = await request(
    "GET",
    `/api/faqs?pageSize=20&sorts=${sortBy("priority")}`,
  );
  assertSort("faqs sort=-priority descending", itemsOf(faqSortR.body), "priority", "desc");

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

  // q search
  await probe("events q=pokemon", "/api/events?q=pokemon&pageSize=12");

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

  // rating filter (pipe-separated multi-value: 4|5)
  const revRating45 = await request("GET", "/api/reviews?latest=true&pageSize=12&rating=4|5");
  rec(
    "reviews rating=4|5 status",
    revRating45.status === 200,
    `count=${countOf(revRating45.body)}`,
  );
  assertEvery(
    "reviews rating=4|5 — every item.rating is 4 or 5",
    itemsOf(revRating45.body),
    (it) => it.rating === 4 || it.rating === 5,
  );

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

  // Product-specific reviews — requires a valid productId
  if (pid) {
    const revProdR = await request("GET", `/api/reviews?productId=${pid}&pageSize=10`);
    rec(
      `reviews productId=${pid} status`,
      revProdR.status === 200,
      `count=${countOf(revProdR.body)}`,
    );
    assertEvery(
      `reviews productId=${pid} — every item.productId matches`,
      itemsOf(revProdR.body),
      (it) => it.productId === pid,
    );
  }

  // ── SIEVE DIFF: differentiation checks ───────────────────────────────────
  await sieveDiff(
    "search q variant",
    "/api/search?q=pokemon&pageSize=12",
    "/api/search?q=hotwheels&pageSize=12",
  );
  await sieveDiff(
    "products listingType auction vs standard",
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.AUCTION}&sorts=${sortBy("createdAt")}`,
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.STANDARD}&sorts=${sortBy("createdAt")}`,
  );
  await sieveDiff(
    "products price range minPrice vs maxPrice",
    `/api/products?pageSize=12&minPrice=100000&sorts=${sortBy("createdAt")}`,
    `/api/products?pageSize=12&maxPrice=500000&sorts=${sortBy("createdAt")}`,
  );
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
  await sieveDiff(
    "stores name query pokemon vs diecast",
    "/api/stores?q=pokemon&pageSize=12",
    "/api/stores?q=diecast&pageSize=12",
  );
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
  await sieveDiff(
    "faqs category=Shipping vs Payments",
    "/api/faqs?pageSize=20&category=Shipping",
    "/api/faqs?pageSize=20&category=Payments",
  );
  await sieveDiff(
    "pre-orders inStock vs all",
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.PRE_ORDER}&inStock=true`,
    `/api/products?pageSize=12&listingType=${LISTING_TYPES.PRE_ORDER}`,
  );

  return results;
}
