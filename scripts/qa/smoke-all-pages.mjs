#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const LOCALE = process.env.SMOKE_LOCALE || "en";
const SEED_FIRST = process.env.SMOKE_SEED_FIRST !== "0";
const REQUIRE_IDENTIFIERS = process.env.SMOKE_REQUIRE_IDENTIFIERS !== "0";
const IDENTIFIER_THRESHOLD = Number(process.env.SMOKE_IDENTIFIER_THRESHOLD ?? 100);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(baseUrl, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/${LOCALE}`, { method: "GET" });
      if (res.status < 500) return;
    } catch {}
    await sleep(1000);
  }
  throw new Error(`Server did not become ready at ${baseUrl} within ${timeoutMs}ms`);
}

async function collectFiles(dir, filename, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(full, filename, out);
      continue;
    }
    if (entry.isFile() && entry.name === filename) out.push(full);
  }
  return out;
}

async function collectByExtension(dir, allowedExt, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectByExtension(full, allowedExt, out);
      continue;
    }
    if (entry.isFile() && allowedExt.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function firstString(obj, keys) {
  if (!obj || typeof obj !== "object") return null;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function extractItems(payload) {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (payload.data && typeof payload.data === "object") {
    if (Array.isArray(payload.data.items)) return payload.data.items;
    if (Array.isArray(payload.data.results)) return payload.data.results;
    if (Array.isArray(payload.data.collections)) return payload.data.collections;
  }
  return [];
}

async function fetchJson(pathname) {
  try {
    const response = await fetch(`${BASE_URL}${pathname}`);
    const text = await response.text();
    return { status: response.status, body: JSON.parse(text), raw: text };
  } catch {
    return { status: 0, body: null, raw: "" };
  }
}

async function fetchRoute(pathname, redirectMode = "follow") {
  try {
    const response = await fetch(`${BASE_URL}${pathname}`, {
      method: "GET",
      redirect: redirectMode,
    });
    const body = await response.text();
    return {
      ok: true,
      status: response.status,
      body,
      contentType: response.headers.get("content-type") || "",
      location: response.headers.get("location") || "",
      finalUrl: response.url || "",
    };
  } catch (error) {
    return {
      ok: false,
      status: -1,
      body: "",
      contentType: "",
      location: "",
      finalUrl: "",
      error: String(error),
    };
  }
}

function asPosix(p) {
  return p.split(path.sep).join("/");
}

function relWorkspacePath(full) {
  return asPosix(path.relative(REPO_ROOT, full));
}

function toRouteTemplate(filePath) {
  const marker = "src/app/[locale]";
  const posix = asPosix(filePath);
  const idx = posix.indexOf(marker);
  if (idx < 0) return null;
  let route = posix.slice(idx + marker.length);
  route = route.replace(/\/page\.tsx$/, "");
  route = route.replace(/\/page\.ts$/, "");
  if (!route) return "/";
  if (!route.startsWith("/")) route = `/${route}`;
  return route;
}

function materializeRoute(template, values) {
  const optionalCatchAll = /\/\[\[\.\.\.(\w+)\]\]/g;
  const catchAll = /\/\[\.\.\.(\w+)\]/g;
  const dynamic = /\[(\w+)\]/g;

  const variants = new Set([template]);
  for (const t of [...variants]) {
    let m;
    optionalCatchAll.lastIndex = 0;
    while ((m = optionalCatchAll.exec(t))) {
      const param = m[1];
      const v = values[param] ?? "new";
      variants.add(t.replace(m[0], ""));
      variants.add(t.replace(m[0], `/${v}`));
    }
  }

  const resolved = new Set();
  for (let t of variants) {
    t = t.replace(optionalCatchAll, "");
    t = t.replace(catchAll, (_, param) => `/${values[param] ?? "sample"}`);
    t = t.replace(dynamic, (_, param) => String(values[param] ?? "sample"));
    t = t.replace(/\/+/g, "/");
    if (!t.startsWith("/")) t = `/${t}`;
    resolved.add(t);
  }

  return [...resolved];
}

function extractHtmlSignal(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  const h1 = html
    .match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "";
  return {
    title,
    h1,
    snippet: html.replace(/\s+/g, " ").slice(0, 220),
  };
}

async function seedDemoData() {
  const collections = [
    "users",
    "addresses",
    "stores",
    "categories",
    "products",
    "orders",
    "bids",
    "carts",
    "wishlists",
    "coupons",
    "reviews",
    "payouts",
    "blogPosts",
    "events",
    "eventEntries",
    "carouselSlides",
    "homepageSections",
    "faqs",
  ];

  const response = await fetch(`${BASE_URL}/api/demo/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "load", collections, dryRun: false }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new Error(
      `Seed load failed: status=${response.status} message=${payload?.message ?? "unknown"}`,
    );
  }

  return payload?.data?.details ?? payload?.details ?? null;
}

async function resolveValues() {
  const [productsProbe, storesProbe, blogProbe, eventsProbe, categoriesProbe] = await Promise.all([
    fetchJson("/api/products?pageSize=30"),
    fetchJson("/api/stores?pageSize=10"),
    fetchJson("/api/blog?pageSize=10"),
    fetchJson("/api/events?pageSize=10"),
    fetchJson("/api/categories?pageSize=20"),
  ]);

  const products = extractItems(productsProbe.body);
  const stores = extractItems(storesProbe.body);
  const blogs = extractItems(blogProbe.body);
  const events = extractItems(eventsProbe.body);
  const categories = extractItems(categoriesProbe.body);

  const firstProduct = products.find((x) => x && typeof x === "object") ?? {};
  const firstAuction = products.find((x) => x?.isAuction === true) ?? firstProduct;
  const firstPreOrder = products.find((x) => x?.isPreOrder === true) ?? firstProduct;
  const firstStore = stores.find((x) => x && typeof x === "object") ?? {};
  const firstBlog = blogs.find((x) => x && typeof x === "object") ?? {};
  const firstEvent = events.find((x) => x && typeof x === "object") ?? {};
  const firstCategory = categories.find((x) => x && typeof x === "object") ?? {};

  return {
    id: firstString(firstEvent, ["id"]) ?? firstString(firstProduct, ["id", "slug"]) ?? "sample-id",
    slug: firstString(firstProduct, ["slug", "id"]) ?? "sample-slug",
    storeSlug: firstString(firstStore, ["storeSlug", "slug", "id"]) ?? "sample-store",
    userId: "user-admin-user-admin",
    tab: "deals",
    sortKey: "relevance",
    page: "1",
    searchSlug: "pokemon",
    category: "general",
    action: "new",
    productSlug: firstString(firstProduct, ["slug", "id"]) ?? "sample-product",
    auctionSlug: firstString(firstAuction, ["slug", "id"]) ?? "sample-product",
    preOrderSlug: firstString(firstPreOrder, ["slug", "id"]) ?? "sample-product",
    blogSlug: firstString(firstBlog, ["slug", "id"]) ?? "sample-blog",
    categorySlug: firstString(firstCategory, ["slug", "id"]) ?? "sample-category",
    eventId: firstString(firstEvent, ["id"]) ?? "sample-event",
  };
}

function orderedJourney(values) {
  return [
    { name: "home", path: `/${LOCALE}`, statuses: [200], expect: ["Home", "Products", "LetiTrip"] },
    { name: "products listing", path: `/${LOCALE}/products`, statuses: [200], expect: ["Products"] },
    { name: "product detail", path: `/${LOCALE}/products/${encodeURIComponent(values.productSlug)}`, statuses: [200, 404], expect: ["Product", "Buy", "Cart"] },
    { name: "auctions listing", path: `/${LOCALE}/auctions`, statuses: [200], expect: ["Auction", "Auctions"] },
    { name: "auction detail", path: `/${LOCALE}/auctions/${encodeURIComponent(values.auctionSlug)}`, statuses: [200, 404], expect: ["Auction", "Bid"] },
    { name: "pre-orders listing", path: `/${LOCALE}/pre-orders`, statuses: [200], expect: ["Pre-Orders", "Pre Orders"] },
    { name: "pre-order detail", path: `/${LOCALE}/pre-orders/${encodeURIComponent(values.preOrderSlug)}`, statuses: [200, 404], expect: ["Pre", "Order"] },
    { name: "categories listing", path: `/${LOCALE}/categories/sort/relevance/page/1`, statuses: [200, 307, 308], expect: ["Categories"] },
    { name: "category detail tab", path: `/${LOCALE}/categories/${encodeURIComponent(values.categorySlug)}/products/sort/relevance/page/1`, statuses: [200, 404], expect: ["Category", "Products"] },
    { name: "stores listing", path: `/${LOCALE}/stores`, statuses: [200], expect: ["Stores", "Sellers"] },
    { name: "store detail tab", path: `/${LOCALE}/stores/${encodeURIComponent(values.storeSlug)}/products/sort/relevance/page/1`, statuses: [200, 404], expect: ["Store", "Products"] },
    { name: "search canonical", path: `/${LOCALE}/search/${encodeURIComponent(values.searchSlug)}/tab/products/sort/relevance/page/1`, statuses: [200, 404], expect: ["Search", "Results"] },
    { name: "promotions canonical", path: `/${LOCALE}/promotions/deals`, statuses: [200, 404], expect: ["Promotions", "Deals"] },
    { name: "events listing", path: `/${LOCALE}/events`, statuses: [200], expect: ["Events"] },
    { name: "event detail", path: `/${LOCALE}/events/${encodeURIComponent(values.eventId)}`, statuses: [200, 404], expect: ["Event"] },
    { name: "event participate", path: `/${LOCALE}/events/${encodeURIComponent(values.eventId)}/participate`, statuses: [200, 404], expect: ["Participate", "Event"] },
    { name: "blog listing", path: `/${LOCALE}/blog`, statuses: [200], expect: ["Blog"] },
    { name: "blog detail", path: `/${LOCALE}/blog/${encodeURIComponent(values.blogSlug)}`, statuses: [200, 404], expect: ["Blog", "Post"] },
    { name: "faq tabs", path: `/${LOCALE}/faqs/general`, statuses: [200, 404], expect: ["FAQ", "Help"] },
    { name: "cart", path: `/${LOCALE}/cart`, statuses: [200], expect: ["Cart"] },
    { name: "login", path: `/${LOCALE}/auth/login`, statuses: [200], expect: ["Sign In", "Login"] },
  ];
}

async function runJourneyChecks(values) {
  const results = [];
  for (const step of orderedJourney(values)) {
    const res = await fetchRoute(step.path, "follow");
    if (!res.ok) {
      results.push({
        type: "journey",
        name: step.name,
        route: step.path,
        ok: false,
        detail: res.error || "request failed",
      });
      continue;
    }

    const signal = extractHtmlSignal(res.body);
    const statusOk = step.statuses.includes(res.status);
    const expectOk =
      res.status !== 200 ||
      !step.expect?.length ||
      step.expect.some((text) => res.body.toLowerCase().includes(String(text).toLowerCase()));
    const ok = statusOk && expectOk && res.status < 500;

    const detail = [
      `status=${res.status}`,
      signal.title ? `title=${signal.title}` : "title=<none>",
      signal.h1 ? `h1=${signal.h1}` : "h1=<none>",
      !expectOk ? `expected one of: ${step.expect.join(" | ")}` : "",
      res.location ? `location=${res.location}` : "",
      res.finalUrl ? `finalUrl=${res.finalUrl}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    results.push({
      type: "journey",
      name: step.name,
      route: step.path,
      ok,
      detail,
      responseSnippet: signal.snippet,
    });
  }

  return results;
}

async function discoverAndProbeAllRoutes(values) {
  const pagesDir = path.join(REPO_ROOT, "src", "app", "[locale]");
  const files = await collectFiles(pagesDir, "page.tsx");
  const templates = files
    .map(toRouteTemplate)
    .filter(Boolean)
    .filter((r) => !r.startsWith("/demo"));

  const routes = new Set();
  for (const template of templates) {
    let templ = template;
    if (templ.includes("/products/[slug]")) templ = templ.replace("[slug]", values.productSlug);
    if (templ.includes("/auctions/[id]")) templ = templ.replace("[id]", values.auctionSlug);
    if (templ.includes("/pre-orders/[id]")) templ = templ.replace("[id]", values.preOrderSlug);
    if (templ.includes("/blog/[slug]")) templ = templ.replace("[slug]", values.blogSlug);
    if (templ.includes("/categories/[slug]")) templ = templ.replace("[slug]", values.categorySlug);
    if (templ.includes("/events/[id]")) templ = templ.replace("[id]", values.eventId);
    if (templ.includes("/stores/[storeSlug]")) templ = templ.replace("[storeSlug]", values.storeSlug);

    for (const r of materializeRoute(templ, values)) {
      routes.add(`/${LOCALE}${r}`.replace(/\/+/g, "/"));
    }
  }

  const apiRoutes = [
    "/api/products",
    "/api/categories",
    "/api/search?q=pokemon",
    "/api/blog",
    "/api/events",
    "/api/stores",
    "/api/promotions",
    "/api/pre-orders",
    "/api/demo/seed",
  ];
  for (const api of apiRoutes) routes.add(api);

  const list = [...routes].sort();
  const failures = [];
  for (const route of list) {
    const res = await fetchRoute(route, "manual");
    if (!res.ok || res.status >= 500 || res.status === 0) {
      failures.push({
        route,
        status: res.status,
        detail: res.error || extractHtmlSignal(res.body).snippet,
      });
    }
  }

  return { tested: list.length, failures, routes: list };
}

async function runApiContractChecks() {
  const checks = [
    { name: "products", path: "/api/products", statuses: [200] },
    { name: "categories", path: "/api/categories", statuses: [200] },
    { name: "search", path: "/api/search?q=pokemon", statuses: [200] },
    { name: "promotions", path: "/api/promotions", statuses: [200] },
    { name: "events", path: "/api/events", statuses: [200] },
  ];

  const results = [];
  for (const check of checks) {
    const res = await fetchRoute(check.path, "follow");
    let details = `status=${res.status}`;
    if (res.body) {
      const textSnippet = res.body.replace(/\s+/g, " ").slice(0, 220);
      details += `, response=${textSnippet}`;
    }

    results.push({
      type: "api-contract",
      name: check.name,
      route: check.path,
      ok: res.ok && check.statuses.includes(res.status),
      detail: details,
    });
  }
  return results;
}

function countLineAtIndex(source, idx) {
  let line = 1;
  for (let i = 0; i < idx; i++) {
    if (source.charCodeAt(i) === 10) line++;
  }
  return line;
}

async function runIdentifierAudit() {
  const roots = [path.join(REPO_ROOT, "src"), path.join(REPO_ROOT, "appkit", "src")];
  const ext = new Set([".tsx", ".jsx"]);
  const findings = [];
  let totalTags = 0;

  for (const root of roots) {
    const files = await collectByExtension(root, ext);
    for (const file of files) {
      const source = await readFile(file, "utf8");
      const regex = /<(div|section)\b([^>]*)>/g;
      let m;
      while ((m = regex.exec(source))) {
        const tag = m[1];
        const attrs = m[2] || "";
        totalTags++;

        if (/\bid\s*=/.test(attrs) || /\bdata-testid\s*=/.test(attrs) || /\bdata-qa\s*=/.test(attrs) || /\bdata-section\s*=/.test(attrs)) {
          continue;
        }

        const line = countLineAtIndex(source, m.index);
        findings.push({
          file: relWorkspacePath(file),
          line,
          tag,
          snippet: `<${tag}${attrs}>`.replace(/\s+/g, " ").slice(0, 180),
        });
      }
    }
  }

  return { totalTags, missing: findings.length, findings };
}

function printOrderedResults(title, results, limit = 9999) {
  console.log(`\n[${title}]`);
  for (const r of results.slice(0, limit)) {
    const symbol = r.ok ? "PASS" : "FAIL";
    console.log(`${symbol} ${r.name}${r.route ? ` (${r.route})` : ""} :: ${r.detail}`);
  }
}

async function main() {
  await waitForServer(BASE_URL);
  if (SEED_FIRST) {
    const details = await seedDemoData();
    console.log("[seed] loaded", details ?? "ok");
  }

  const values = await resolveValues();
  const journey = await runJourneyChecks(values);
  const contracts = await runApiContractChecks();
  const coverage = await discoverAndProbeAllRoutes(values);
  const idAudit = await runIdentifierAudit();

  printOrderedResults("journey", journey);
  printOrderedResults("api-contract", contracts);

  const journeyFailures = journey.filter((x) => !x.ok);
  const contractFailures = contracts.filter((x) => !x.ok);

  console.log(`\n[coverage] tested ${coverage.tested} routes`);
  console.log(`[coverage] failures: ${coverage.failures.length}`);
  if (coverage.failures.length > 0) {
    console.log("[coverage] first failures:");
    for (const failure of coverage.failures.slice(0, 20)) {
      console.log(` - ${failure.route} => ${failure.status} :: ${failure.detail}`);
    }
  }

  console.log(`\n[identifier-audit] div/section tags scanned: ${idAudit.totalTags}`);
  console.log(`[identifier-audit] missing identifiers: ${idAudit.missing}`);
  if (idAudit.missing > 0) {
    console.log("[identifier-audit] first missing:");
    for (const finding of idAudit.findings.slice(0, 50)) {
      console.log(` - ${finding.file}:${finding.line} <${finding.tag}> ${finding.snippet}`);
    }
  }

  const hasFailures =
    journeyFailures.length > 0 ||
    contractFailures.length > 0 ||
    coverage.failures.length > 0 ||
    (REQUIRE_IDENTIFIERS && idAudit.missing > IDENTIFIER_THRESHOLD);

  if (hasFailures) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[smoke-all-pages] fatal:", error);
  process.exit(1);
});
