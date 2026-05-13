/**
 * Public sieves: products/auctions/pre-orders/stores/categories with
 * search + filter + sort + pagination permutations. All anonymous.
 */

import { request } from "./_http.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

async function probe(label, path, predicate = (r) => r.status === 200) {
  const r = await request("GET", path);
  const ok = predicate(r);
  rec(
    label,
    ok,
    `status=${r.status} count=${r.body?.data?.items?.length ?? r.body?.data?.length ?? "n/a"} ${r.elapsedMs}ms`,
  );
  return r;
}

export async function run() {
  // Products listing
  await probe("products listing", "/api/products?pageSize=12");
  await probe(
    "products listingType=standard",
    "/api/products?pageSize=12&listingType=standard",
  );
  await probe(
    "products listingType=auction",
    "/api/products?pageSize=12&listingType=auction",
  );
  await probe("products sort=-createdAt", "/api/products?pageSize=12&sorts=-createdAt");
  await probe("products sort=price", "/api/products?pageSize=12&sorts=price");

  // Differentness: standard vs auction listingType must produce different first ids
  const stdR = await request("GET", "/api/products?pageSize=5&listingType=standard");
  const aucR = await request("GET", "/api/products?pageSize=5&listingType=auction");
  const stdFirst = stdR.body?.data?.items?.[0]?.id;
  const aucFirst = aucR.body?.data?.items?.[0]?.id;
  rec(
    "products standard vs auction differ",
    !!stdFirst && !!aucFirst && stdFirst !== aucFirst,
    `std=${stdFirst} auc=${aucFirst}`,
  );

  // Search
  await probe("search pokemon", "/api/search?q=pokemon&pageSize=12");
  await probe("search empty q", "/api/search?q=&pageSize=12");
  await probe("search nonsense", "/api/search?q=xyzdoesnotexist&pageSize=12");

  // Categories
  const cats = await probe("categories flat", "/api/categories?flat=true&pageSize=120");
  const tier0 = await probe(
    "categories tier=0",
    "/api/categories?flat=true&tier=0&pageSize=120",
  );
  const tier1 = await probe(
    "categories tier=1",
    "/api/categories?flat=true&tier=1&pageSize=120",
  );
  rec(
    "categories tier0 vs tier1 differ",
    (tier0.body?.data?.length ?? 0) !== (tier1.body?.data?.length ?? 0),
    `tier0=${tier0.body?.data?.length} tier1=${tier1.body?.data?.length}`,
  );

  // Stores
  await probe("stores listing", "/api/stores?pageSize=12");
  await probe("stores sorted by name", "/api/stores?pageSize=12&sorts=storeName");

  // Brands
  await probe("brands listing", "/api/brands");

  // Events / Blog / FAQs / Pre-orders
  await probe("events listing", "/api/events?pageSize=12");
  await probe("blog listing", "/api/blog?pageSize=12");
  await probe("faqs listing", "/api/faqs?pageSize=20");
  await probe("pre-orders listing", "/api/pre-orders?pageSize=12");

  // Single store detail products + auctions
  const stores = await request("GET", "/api/stores?pageSize=1");
  const storeSlug = stores.body?.data?.items?.[0]?.id;
  if (storeSlug) {
    await probe(
      `store ${storeSlug} products`,
      `/api/stores/${storeSlug}/products?pageSize=10`,
    );
    await probe(
      `store ${storeSlug} auctions`,
      `/api/stores/${storeSlug}/auctions?pageSize=10`,
    );
  } else {
    rec("store slug present", false, "no stores");
  }

  // Product detail
  const onePstd = await request("GET", "/api/products?pageSize=1&listingType=standard");
  const pid = onePstd.body?.data?.items?.[0]?.id;
  if (pid) {
    await probe(`product ${pid} detail`, `/api/products/${pid}`);
  } else {
    rec("standard product detail", false, "no standard product");
  }

  // ── Sieve A vs B differentiation ─────────────────────────────────
  // (ported from old smoke-pages-api.mjs sieve-check section)
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

  // Sort direction differentiation
  const asc = await request("GET", "/api/products?pageSize=5&sorts=price");
  const desc = await request("GET", "/api/products?pageSize=5&sorts=-price");
  const ascFirst = asc.body?.data?.items?.[0]?.id;
  const descFirst = desc.body?.data?.items?.[0]?.id;
  rec(
    "products sort asc vs desc differ",
    !!ascFirst && !!descFirst && ascFirst !== descFirst,
    `asc=${ascFirst} desc=${descFirst}`,
  );

  // Pagination: page 1 vs page 2 different items
  const p1 = await request("GET", "/api/products?pageSize=3&page=1");
  const p2 = await request("GET", "/api/products?pageSize=3&page=2");
  const p1Ids = (p1.body?.data?.items ?? []).map((i) => i.id).join(",");
  const p2Ids = (p2.body?.data?.items ?? []).map((i) => i.id).join(",");
  rec(
    "products page1 vs page2 differ",
    p1Ids && p2Ids && p1Ids !== p2Ids,
    `p1=${p1Ids.slice(0, 50)} p2=${p2Ids.slice(0, 50)}`,
  );

  return results;
}

function countOf(body) {
  if (Array.isArray(body?.data?.items)) return body.data.items.length;
  if (Array.isArray(body?.data)) return body.data.length;
  return 0;
}

async function sieveDiff(label, aPath, bPath) {
  const [a, b] = await Promise.all([
    request("GET", aPath),
    request("GET", bPath),
  ]);
  const aOk = a.status === 200;
  const bOk = b.status === 200;
  const ac = countOf(a.body);
  const bc = countOf(b.body);
  // Differ when either count differs or first id differs
  const aFirst = a.body?.data?.items?.[0]?.id ?? a.body?.data?.[0]?.id;
  const bFirst = b.body?.data?.items?.[0]?.id ?? b.body?.data?.[0]?.id;
  const differ = ac !== bc || aFirst !== bFirst;
  rec(
    `sieve diff: ${label}`,
    aOk && bOk && differ,
    `a=${a.status}/${ac}/${aFirst ?? "-"} b=${b.status}/${bc}/${bFirst ?? "-"}`,
  );
}
