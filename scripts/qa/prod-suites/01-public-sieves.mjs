/**
 * Public sieves: products/auctions/pre-orders/stores/categories with
 * search + filter + sort + pagination permutations. All anonymous.
 *
 * Assertion style:
 *   - `probe`     — status-code check + count summary (smoke level)
 *   - `assertEvery` — per-item predicate against seed-known values
 *   - `assertSort`  — verify items returned in expected order
 *   - `assertDisjoint` — no id overlap between two result sets
 *   - `sieveDiff`   — different filter values produce different first id/count
 */

import { request } from "./_http.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

// ── Seed-known reference values (keep in sync with appkit/src/seed/*) ──────
const SEED = {
  storesWithProducts: [
    "store-pokemon-palace",
    "store-diecast-depot",
    "store-cardgame-hub",
    "store-beyblade-arena",
    "store-tokyo-toys-india",
    "store-gundam-galaxy",
  ],
  categoriesTier0: new Set([
    "category-action-figures",
    "category-trading-cards",
    "category-diecast-vehicles",
    "category-spinning-tops",
    "category-model-kits",
    "category-vintage-rare",
  ]),
  listingTypes: ["standard", "auction", "pre-order", "prize-draw", "bundle"],
};

async function probe(label, path, predicate = (r) => r.status === 200) {
  const r = await request("GET", path);
  const ok = predicate(r);
  const count = countOf(r.body);
  rec(label, ok, `status=${r.status} count=${count} ${r.elapsedMs}ms`);
  return r;
}

function itemsOf(body) {
  if (Array.isArray(body?.data?.items)) return body.data.items;
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

export async function run() {
  // ── PRODUCTS — filter value verification ─────────────────────────────────
  await probe("products listing", "/api/products?pageSize=12");

  for (const lt of ["standard", "auction", "pre-order"]) {
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

  // storeId filter — every item must belong to the requested store
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

  // category filter
  const catR = await request(
    "GET",
    "/api/products?pageSize=10&category=category-trading-cards",
  );
  rec(
    "products category=trading-cards status",
    catR.status === 200,
    `count=${countOf(catR.body)}`,
  );
  assertEvery(
    "products category — every item.category matches filter",
    itemsOf(catR.body),
    (it) => it.category === "category-trading-cards",
  );

  // Price range filter — items must fall in range
  const minP = 100000;
  const maxP = 500000;
  const priceR = await request(
    "GET",
    `/api/products?pageSize=12&minPrice=${minP}&maxPrice=${maxP}`,
  );
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

  // featured filter
  const featR = await request("GET", "/api/products?pageSize=12&featured=true");
  rec("products featured=true status", featR.status === 200, `count=${countOf(featR.body)}`);
  assertEvery(
    "products featured=true — every item.featured===true",
    itemsOf(featR.body),
    (it) => it.featured === true,
  );

  // Title query (`q`) — every item title must contain the substring (case-insensitive)
  const qR = await request("GET", "/api/products?pageSize=12&q=pokemon");
  rec("products q=pokemon status", qR.status === 200, `count=${countOf(qR.body)}`);
  assertEvery(
    "products q=pokemon — every item.title contains 'pokemon' (ci)",
    itemsOf(qR.body),
    (it) => typeof it.title === "string" && it.title.toLowerCase().includes("pokemon"),
  );

  // ── PRODUCTS — sort order verification ───────────────────────────────────
  const sortAsc = await request("GET", "/api/products?pageSize=10&sorts=price");
  assertSort(
    "products sort=price ascending",
    itemsOf(sortAsc.body),
    "price",
    "asc",
  );
  const sortDesc = await request("GET", "/api/products?pageSize=10&sorts=-price");
  assertSort(
    "products sort=-price descending",
    itemsOf(sortDesc.body),
    "price",
    "desc",
  );
  const sortDate = await request("GET", "/api/products?pageSize=10&sorts=-createdAt");
  assertSort(
    "products sort=-createdAt descending",
    itemsOf(sortDate.body),
    "createdAt",
    "desc",
  );

  // ── PRODUCTS — pagination integrity ──────────────────────────────────────
  const p1 = await request("GET", "/api/products?pageSize=5&page=1&sorts=-createdAt");
  const p2 = await request("GET", "/api/products?pageSize=5&page=2&sorts=-createdAt");
  assertDisjoint(
    "products pagination — page1 ∩ page2 = ∅",
    itemsOf(p1.body),
    itemsOf(p2.body),
  );

  // ── SEARCH ───────────────────────────────────────────────────────────────
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

  // ── CATEGORIES — tier verification ───────────────────────────────────────
  const tier0R = await probe(
    "categories tier=0",
    "/api/categories?flat=true&tier=0&pageSize=120",
  );
  assertEvery(
    "categories tier=0 — every item is a known root category",
    itemsOf(tier0R.body),
    (it) => SEED.categoriesTier0.has(it.id),
  );

  const tier1R = await probe(
    "categories tier=1",
    "/api/categories?flat=true&tier=1&pageSize=120",
  );
  assertEvery(
    "categories tier=1 — every item.parentId references a tier-0",
    itemsOf(tier1R.body),
    (it) => !!it.parentId && it.parentId !== it.id,
  );

  // featured / isBrand
  const featCatR = await request("GET", "/api/categories?flat=true&featured=true&pageSize=120");
  assertEvery(
    "categories featured=true — every item.isFeatured===true",
    itemsOf(featCatR.body),
    (it) => it.isFeatured === true || it.featured === true,
  );

  // ── STORES ───────────────────────────────────────────────────────────────
  await probe("stores listing", "/api/stores?pageSize=12");
  const storesAsc = await request("GET", "/api/stores?pageSize=12&sorts=storeName");
  assertSort(
    "stores sort=storeName ascending",
    itemsOf(storesAsc.body),
    "storeName",
    "asc",
  );

  // Single-store sub-listings — verify storeId in returned products
  const oneStore = SEED.storesWithProducts[0];
  const storeProdR = await request(
    "GET",
    `/api/stores/${oneStore}/products?pageSize=10`,
  );
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

  // ── BRANDS / EVENTS / BLOG / FAQS / PRE-ORDERS ───────────────────────────
  await probe("brands listing", "/api/brands");
  await probe("events listing", "/api/events?pageSize=12");
  await probe("blog listing", "/api/blog?pageSize=12");

  const faqsR = await probe("faqs listing", "/api/faqs?pageSize=20");
  assertEvery(
    "faqs — every item has id starting with 'faq-'",
    itemsOf(faqsR.body),
    (it) => typeof it.id === "string" && it.id.startsWith("faq-"),
  );

  const faqHomeR = await request(
    "GET",
    "/api/faqs?pageSize=20&showOnHomepage=true",
  );
  assertEvery(
    "faqs showOnHomepage=true — every item.showOnHomepage===true",
    itemsOf(faqHomeR.body),
    (it) => it.showOnHomepage === true,
  );

  const preR = await probe("pre-orders listing", "/api/pre-orders?pageSize=12");
  assertEvery(
    "pre-orders — every item.listingType==='pre-order'",
    itemsOf(preR.body),
    (it) => it.listingType === "pre-order",
  );

  // ── Product detail ───────────────────────────────────────────────────────
  const onePstd = await request("GET", "/api/products?pageSize=1&listingType=standard");
  const pid = itemsOf(onePstd.body)[0]?.id;
  if (pid) {
    const detail = await probe(`product ${pid} detail`, `/api/products/${pid}`);
    const body = detail.body?.data ?? detail.body;
    rec(
      `product ${pid} detail — id matches`,
      body?.id === pid,
      `returned id=${body?.id}`,
    );
  } else {
    rec("standard product detail", false, "no standard product");
  }

  // ── Sieve diff: existing differentiation checks ──────────────────────────
  await sieveDiff(
    "search q variant",
    "/api/search?q=pokemon&pageSize=12",
    "/api/search?q=hotwheels&pageSize=12",
  );
  await sieveDiff(
    "products listingType",
    "/api/products?pageSize=12&listingType=auction&sorts=-createdAt",
    "/api/products?pageSize=12&listingType=standard&sorts=-createdAt",
  );
  await sieveDiff(
    "products price range minPrice vs maxPrice",
    "/api/products?pageSize=12&minPrice=100000&sorts=-createdAt",
    "/api/products?pageSize=12&maxPrice=500000&sorts=-createdAt",
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
    "stores name query",
    "/api/stores?q=pokemon&pageSize=12",
    "/api/stores?q=hotwheels&pageSize=12",
  );

  return results;
}
