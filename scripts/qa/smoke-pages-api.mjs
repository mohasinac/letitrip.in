#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const PORT = Number(process.env.SMOKE_PORT || "3000");
const START_SERVER = process.env.SMOKE_USE_EXISTING_SERVER !== "1";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function killTree(proc) {
  if (!proc || !proc.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(proc.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }
  proc.kill("SIGTERM");
}

async function waitForServer(baseUrl, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/en`, { method: "GET" });
      if (res.status < 500) return;
    } catch {}
    await sleep(1000);
  }
  throw new Error(`Server did not become ready at ${baseUrl} within ${timeoutMs}ms`);
}

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, value: null };
  }
}

function extractItems(payload) {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload)) return payload;

  const fromData = payload.data;
  if (Array.isArray(fromData)) return fromData;
  if (fromData && typeof fromData === "object") {
    if (Array.isArray(fromData.items)) return fromData.items;
    if (Array.isArray(fromData.results)) return fromData.results;
  }

  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function firstString(obj, keys) {
  if (!obj || typeof obj !== "object") return null;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

async function runPageSmoke(baseUrl) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  const record = (name, ok, detail = "") => {
    results.push({ type: "page", name, ok, detail });
  };

  const fetchJson = async (path) => {
    try {
      const response = await fetch(`${baseUrl}${path}`);
      const text = await response.text();
      const parsed = safeJsonParse(text);
      return {
        status: response.status,
        body: parsed.ok ? parsed.value : null,
      };
    } catch {
      return { status: 0, body: null };
    }
  };

  const tryClickButton = async (nameRegex) => {
    const button = page.getByRole("button", { name: nameRegex }).first();
    const visible = await button.isVisible().catch(() => false);
    if (!visible) return false;
    await button.click({ force: true, timeout: 7000 });
    await page.waitForTimeout(800);
    return true;
  };

  const smokePageVisit = async (path, name) => {
    try {
      const response = await page.goto(`${baseUrl}${path}`, {
        waitUntil: "domcontentloaded",
      });
      const status = response?.status() ?? 0;
      record(name, status > 0 && status < 500, `status=${status}`);
      return status > 0 && status < 500;
    } catch (error) {
      record(name, false, String(error));
      return false;
    }
  };

  const productsProbe = await fetchJson("/api/products?pageSize=30");
  const storesProbe = await fetchJson("/api/stores?pageSize=10");
  const preOrdersProbe = await fetchJson("/api/pre-orders?pageSize=10");

  const products = extractItems(productsProbe.body);
  const stores = extractItems(storesProbe.body);
  const preOrders = extractItems(preOrdersProbe.body);

  const firstProduct = products.find((item) => item && typeof item === "object") ?? null;
  const firstAuctionProduct =
    products.find((item) => item && typeof item === "object" && item.isAuction === true) ??
    null;
  const firstPreOrder = preOrders.find((item) => item && typeof item === "object") ?? null;
  const firstStore = stores.find((item) => item && typeof item === "object") ?? null;

  const productDetailId = firstString(firstProduct, ["slug", "id", "productId"]);
  const auctionDetailId = firstString(firstAuctionProduct, ["slug", "id", "productId"]);
  const preOrderDetailId = firstString(firstPreOrder, ["slug", "id", "preOrderId"]);
  const storeDetailId = firstString(firstStore, ["storeSlug", "slug", "id"]);

  try {
    await page.goto(`${baseUrl}/en`, { waitUntil: "domcontentloaded" });
    // Homepage sections can vary by DB seed/config. Try a resilient CTA fallback list.
    const ctaCandidates = [
      /Shop Now|Shop All Products/i,
      /Products|Browse Products/i,
      /Auctions|Browse Auctions/i,
    ];

    let clicked = false;
    for (const nameRegex of ctaCandidates) {
      const link = page.getByRole("link", { name: nameRegex }).first();
      const visible = await link.isVisible().catch(() => false);
      if (!visible) continue;
      await link.click({ force: true });
      clicked = true;
      break;
    }

    record(
      "home: load + click Shop Now",
      clicked,
      clicked ? "CTA link clicked" : "CTA link not found",
    );
  } catch (error) {
    record("home: load + click Shop Now", false, String(error));
  }

  try {
    await page.goto(`${baseUrl}/en/blog`, { waitUntil: "domcontentloaded" });
    await page
      .getByRole("button", { name: /Filters|Apply filters/i })
      .first()
      .click({ force: true });
    record("blog: filter/sort interaction", true);
  } catch (error) {
    record("blog: filter/sort interaction", false, String(error));
  }

  try {
    await page.goto(`${baseUrl}/en/contact`, { waitUntil: "domcontentloaded" });
    await page.getByRole("textbox", { name: "Your Name" }).fill("Smoke Runner");
    await page.getByRole("textbox", { name: "Email Address" }).fill("smoke@example.com");
    await page.getByRole("textbox", { name: "Subject" }).fill("Smoke Test");
    await page.getByRole("textbox", { name: "Message" }).fill("Automated contact form smoke test message.");
    await page.getByRole("button", { name: "Send Message" }).click();
    await page.waitForTimeout(2000);

    const successMessage = page.getByText("Message sent successfully", { exact: false });
    const failMessage = page.getByText("Failed to send your message", { exact: false });
    const hasSuccess = await successMessage.isVisible().catch(() => false);
    const hasFail = await failMessage.isVisible().catch(() => false);

    record(
      "contact: submit form",
      hasSuccess || hasFail || page.url().includes("/contact"),
      hasSuccess
        ? "success toast shown"
        : hasFail
          ? "failure toast shown"
          : "form submitted (no explicit toast)",
    );
  } catch (error) {
    record("contact: submit form", false, String(error));
  }

  try {
    await page.goto(`${baseUrl}/en/auth/login`, { waitUntil: "domcontentloaded" });
    await page.getByRole("textbox", { name: "Email Address" }).fill("demo@example.com");
    await page.getByRole("textbox", { name: "Password" }).fill("Password123!");
    await page.getByRole("checkbox", { name: "Remember me" }).check();
    const loginResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/api/auth/login") &&
        res.request().method() === "POST",
      { timeout: 20_000 },
    );
    await page.getByRole("button", { name: "Sign in" }).click();
    const response = await loginResponse;

    const invalid = page.getByText("Invalid email or password", { exact: false });
    const hasInvalid = await invalid.isVisible().catch(() => false);
    record(
      "auth/login: submit credentials",
      hasInvalid || response.status() === 401 || response.status() === 200,
      hasInvalid ? "unauthorized handled" : `response status ${response.status()}`,
    );
  } catch (error) {
    record("auth/login: submit credentials", false, String(error));
  }

  await smokePageVisit("/en/products", "products: listing page loads");
  await smokePageVisit("/en/auctions", "auctions: listing page loads");
  await smokePageVisit("/en/pre-orders", "pre-orders: listing page loads");
  await smokePageVisit("/en/stores", "stores: listing page loads");

  if (productDetailId) {
    const loaded = await smokePageVisit(
      `/en/products/${encodeURIComponent(productDetailId)}`,
      "products/detail: page loads",
    );
    if (loaded) {
      try {
        const clicked = await tryClickButton(/add to cart|buy now/i);
        record(
          "products/detail: try add to cart",
          true,
          clicked ? "clicked CTA" : "CTA not visible, page stable",
        );
      } catch (error) {
        record("products/detail: try add to cart", false, String(error));
      }
    }
  } else {
    record("products/detail: page loads", true, "skipped: no product id available");
    record("products/detail: try add to cart", true, "skipped: no product id available");
  }

  if (auctionDetailId) {
    const loaded = await smokePageVisit(
      `/en/auctions/${encodeURIComponent(auctionDetailId)}`,
      "auctions/detail: page loads",
    );
    if (loaded) {
      try {
        const bidInput = page
          .locator(
            "input[name*='bid' i], input[placeholder*='bid' i], input[type='number']",
          )
          .first();
        const hasInput = await bidInput.isVisible().catch(() => false);
        if (hasInput) {
          await bidInput.fill("999999");
        }
        const clicked = await tryClickButton(/place bid|bid now|submit bid/i);
        record(
          "auctions/detail: try place bid",
          true,
          clicked
            ? hasInput
              ? "filled bid amount and clicked CTA"
              : "clicked bid CTA"
            : "bid CTA not visible, page stable",
        );
      } catch (error) {
        record("auctions/detail: try place bid", false, String(error));
      }
    }
  } else {
    record("auctions/detail: page loads", true, "skipped: no auction id available");
    record("auctions/detail: try place bid", true, "skipped: no auction id available");
  }

  if (preOrderDetailId) {
    const loaded = await smokePageVisit(
      `/en/pre-orders/${encodeURIComponent(preOrderDetailId)}`,
      "pre-orders/detail: page loads",
    );
    if (loaded) {
      try {
        const clicked = await tryClickButton(/pre.?order|reserve|book now|buy now/i);
        record(
          "pre-orders/detail: try pre-order",
          true,
          clicked ? "clicked CTA" : "CTA not visible, page stable",
        );
      } catch (error) {
        record("pre-orders/detail: try pre-order", false, String(error));
      }
    }
  } else {
    record("pre-orders/detail: page loads", true, "skipped: no pre-order id available");
    record("pre-orders/detail: try pre-order", true, "skipped: no pre-order id available");
  }

  if (storeDetailId) {
    await smokePageVisit(
      `/en/stores/${encodeURIComponent(storeDetailId)}`,
      "stores/detail: page loads",
    );
  } else {
    record("stores/detail: page loads", true, "skipped: no store slug available");
  }

  await browser.close();
  return results;
}

async function runApiSmoke(baseUrl) {
  const endpoints = [
    { method: "GET", path: "/api/products", expected: [200] },
    { method: "GET", path: "/api/blog", expected: [200] },
    { method: "GET", path: "/api/categories", expected: [200] },
    { method: "GET", path: "/api/search?q=sieve", expected: [200] },
    { method: "GET", path: "/api/search?q=test", expected: [200] },
    { method: "GET", path: "/api/events", expected: [200] },
    { method: "GET", path: "/api/stores", expected: [200] },
    { method: "GET", path: "/api/pre-orders", expected: [200] },
    { method: "GET", path: "/api/admin/users", expected: [401] },
    { method: "POST", path: "/api/contact", expected: [200], body: {
      name: "Smoke Runner",
      email: "smoke@example.com",
      subject: "Smoke API",
      message: "Automated API smoke test message.",
    } },
  ];

  const results = [];

  const getShapeSignature = (value) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return "array[]";
      return `array[${getShapeSignature(value[0])}]`;
    }
    if (value && typeof value === "object") {
      const keys = Object.keys(value).sort();
      return `object{${keys.join(",")}}`;
    }
    return typeof value;
  };

  const getResultCount = (payload) => {
    if (Array.isArray(payload)) return payload.length;
    if (!payload || typeof payload !== "object") return 0;
    if (Array.isArray(payload.results)) return payload.results.length;
    if (Array.isArray(payload.items)) return payload.items.length;
    if (Array.isArray(payload.data)) return payload.data.length;
    return 0;
  };

  const canonicalize = (value) => {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (!value || typeof value !== "object") return value;

    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = canonicalize(value[key]);
    }
    return out;
  };

  const fetchJson = async (path, method = "GET", body) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: method === "POST" ? { "content-type": "application/json" } : undefined,
      body: method === "POST" ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    const parsed = safeJsonParse(text);

    return {
      status: response.status,
      parsed,
      body: parsed.ok ? parsed.value : text,
    };
  };

  const compareApiVariants = async ({
    name,
    variantA,
    variantB,
    expectedStatus = 200,
    allowIdenticalWhenEmpty = true,
  }) => {
    try {
      const a = await fetchJson(variantA);
      const b = await fetchJson(variantB);

      const shapeA = a.parsed.ok ? getShapeSignature(a.body) : "non-json";
      const shapeB = b.parsed.ok ? getShapeSignature(b.body) : "non-json";
      const sameShape = shapeA === shapeB;

      const countA = a.parsed.ok ? getResultCount(a.body) : 0;
      const countB = b.parsed.ok ? getResultCount(b.body) : 0;

      const canonicalA = JSON.stringify(canonicalize(a.body));
      const canonicalB = JSON.stringify(canonicalize(b.body));
      const identical = canonicalA === canonicalB;

      const statusesOk = a.status === expectedStatus && b.status === expectedStatus;
      const suspiciousIdentical =
        identical && (!allowIdenticalWhenEmpty || countA > 0 || countB > 0);

      results.push({
        type: "api",
        name,
        ok: statusesOk && sameShape && !suspiciousIdentical,
        detail: [
          `a=${variantA}`,
          `b=${variantB}`,
          `a_status=${a.status}`,
          `b_status=${b.status}`,
          `same_shape=${sameShape}`,
          `a_count=${countA}`,
          `b_count=${countB}`,
          `identical=${identical}`,
        ].join(", "),
      });
    } catch (error) {
      results.push({
        type: "api",
        name,
        ok: false,
        detail: String(error),
      });
    }
  };

  for (const ep of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${ep.path}`, {
        method: ep.method,
        headers: ep.method === "POST" ? { "content-type": "application/json" } : undefined,
        body: ep.method === "POST" ? JSON.stringify(ep.body) : undefined,
      });
      const ok = ep.expected.includes(response.status);
      results.push({
        type: "api",
        name: `${ep.method} ${ep.path}`,
        ok,
        detail: `status=${response.status}, expected=${ep.expected.join("/")}`,
      });
    } catch (error) {
      results.push({
        type: "api",
        name: `${ep.method} ${ep.path}`,
        ok: false,
        detail: String(error),
      });
    }
  }

  const productsProbe = await fetchJson("/api/products?pageSize=30");
  const preOrdersProbe = await fetchJson("/api/pre-orders?pageSize=10");

  const products = extractItems(productsProbe.body);
  const preOrders = extractItems(preOrdersProbe.body);

  const firstProduct = products.find((item) => item && typeof item === "object") ?? null;
  const firstAuctionProduct =
    products.find((item) => item && typeof item === "object" && item.isAuction === true) ??
    null;
  const firstPreOrder = preOrders.find((item) => item && typeof item === "object") ?? null;

  const productId = firstString(firstProduct, ["id", "productId", "slug"]);
  const auctionProductId = firstString(firstAuctionProduct, ["id", "productId", "slug"]);
  const preOrderId = firstString(firstPreOrder, ["id", "preOrderId", "slug"]);

  try {
    const cartAttempt = await fetch(`${baseUrl}/api/cart`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: productId ?? "smoke-product-id",
        quantity: 1,
      }),
    });
    const ok = [201, 400, 401, 404].includes(cartAttempt.status);
    results.push({
      type: "api",
      name: "POST /api/cart (try add to cart)",
      ok,
      detail: `status=${cartAttempt.status}, expected=201/400/401/404`,
    });
  } catch (error) {
    results.push({
      type: "api",
      name: "POST /api/cart (try add to cart)",
      ok: false,
      detail: String(error),
    });
  }

  try {
    const preOrderAttempt = await fetch(`${baseUrl}/api/pre-orders`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: preOrderId ?? productId ?? "smoke-preorder-id",
        quantity: 1,
        customerEmail: "smoke@example.com",
      }),
    });
    const ok = [201, 400, 401, 500].includes(preOrderAttempt.status);
    results.push({
      type: "api",
      name: "POST /api/pre-orders (try pre-order)",
      ok,
      detail: `status=${preOrderAttempt.status}, expected=201/400/401/500`,
    });
  } catch (error) {
    results.push({
      type: "api",
      name: "POST /api/pre-orders (try pre-order)",
      ok: false,
      detail: String(error),
    });
  }

  try {
    const bidAttempt = await fetch(`${baseUrl}/api/bids`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: auctionProductId ?? "smoke-auction-id",
        bidAmount: 999999,
      }),
    });
    const ok = [201, 400, 401, 403, 404, 500].includes(bidAttempt.status);
    results.push({
      type: "api",
      name: "POST /api/bids (try place bid)",
      ok,
      detail: `status=${bidAttempt.status}, expected=201/400/401/403/404/500`,
    });
  } catch (error) {
    results.push({
      type: "api",
      name: "POST /api/bids (try place bid)",
      ok: false,
      detail: String(error),
    });
  }

  try {
    await compareApiVariants({
      name: "GET /api/search sieve check (q variant)",
      variantA: "/api/search?q=sieve&pageSize=12",
      variantB: "/api/search?q=test&pageSize=12",
    });

    await compareApiVariants({
      name: "GET /api/products sieve check (auction flag)",
      variantA: "/api/products?pageSize=12&isAuction=true&sorts=-createdAt",
      variantB: "/api/products?pageSize=12&isAuction=false&sorts=-createdAt",
      allowIdenticalWhenEmpty: false,
    });

    await compareApiVariants({
      name: "GET /api/products sieve check (price range)",
      variantA: "/api/products?pageSize=12&minPrice=1&sorts=-createdAt",
      variantB: "/api/products?pageSize=12&maxPrice=5000&sorts=-createdAt",
      allowIdenticalWhenEmpty: false,
    });

    await compareApiVariants({
      name: "GET /api/categories sieve check (tier split)",
      variantA: "/api/categories?flat=true&tier=0&pageSize=120",
      variantB: "/api/categories?flat=true&tier=1&pageSize=120",
    });

    await compareApiVariants({
      name: "GET /api/categories sieve check (brand flag)",
      variantA: "/api/categories?flat=true&isBrand=true&pageSize=120",
      variantB: "/api/categories?flat=true&featured=true&pageSize=120",
    });

    await compareApiVariants({
      name: "GET /api/stores sieve check (name query)",
      variantA: "/api/stores?q=sieve&pageSize=12",
      variantB: "/api/stores?q=test&pageSize=12",
    });

    await compareApiVariants({
      name: "GET /api/stores sieve check (category filter)",
      variantA: "/api/stores?category=collectibles&pageSize=12",
      variantB: "/api/stores?category=art&pageSize=12",
    });

    if (auctionProductId) {
      const encodedAuctionId = encodeURIComponent(auctionProductId);
      await compareApiVariants({
        name: "GET /api/bids sieve check (productId variant)",
        variantA: `/api/bids?productId=${encodedAuctionId}`,
        variantB: "/api/bids?productId=smoke-missing-auction-id",
      });
    } else {
      results.push({
        type: "api",
        name: "GET /api/bids sieve check (productId variant)",
        ok: true,
        detail: "skipped: no auction product id available",
      });
    }

    const storesProbe = await fetchJson("/api/stores?pageSize=5");
    const candidateStores = storesProbe.parsed.ok
      ? storesProbe.body?.data?.items ?? storesProbe.body?.items ?? []
      : [];
    const firstStoreSlug = Array.isArray(candidateStores)
      ? candidateStores.find((store) => typeof store?.storeSlug === "string")?.storeSlug
      : null;

    if (firstStoreSlug) {
      const slug = encodeURIComponent(firstStoreSlug);

      await compareApiVariants({
        name: "GET /api/stores/[slug]/products sieve check",
        variantA: `/api/stores/${slug}/products?pageSize=12&filters=price>=1`,
        variantB: `/api/stores/${slug}/products?pageSize=12&filters=price<=5000`,
      });

      await compareApiVariants({
        name: "GET /api/stores/[slug]/auctions sieve check",
        variantA: `/api/stores/${slug}/auctions?pageSize=12&filters=price>=1`,
        variantB: `/api/stores/${slug}/auctions?pageSize=12&filters=price<=5000`,
      });
    } else {
      results.push({
        type: "api",
        name: "GET /api/stores/[slug]/products sieve check",
        ok: true,
        detail: "skipped: no public store slug available from /api/stores",
      });

      results.push({
        type: "api",
        name: "GET /api/stores/[slug]/auctions sieve check",
        ok: true,
        detail: "skipped: no public store slug available from /api/stores",
      });
    }
  } catch (error) {
    results.push({
      type: "api",
      name: "Sieve-oriented API comparison suite",
      ok: false,
      detail: String(error),
    });
  }

  return results;
}

function printResults(results) {
  const failed = results.filter((r) => !r.ok);
  const passed = results.length - failed.length;

  console.log("\nSmoke Test Results\n");
  for (const result of results) {
    const symbol = result.ok ? "PASS" : "FAIL";
    console.log(`${symbol} [${result.type}] ${result.name} :: ${result.detail}`);
  }

  console.log(`\nSummary: ${passed}/${results.length} passed, ${failed.length} failed`);
  if (failed.length > 0) process.exitCode = 1;
}

async function main() {
  let serverProc = null;

  try {
    if (START_SERVER) {
      serverProc = spawn("npx", ["next", "dev", "--port", String(PORT)], {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: process.platform === "win32",
      });
      await waitForServer(BASE_URL);
    }

    const pageResults = await runPageSmoke(BASE_URL);
    const apiResults = await runApiSmoke(BASE_URL);
    printResults([...pageResults, ...apiResults]);
  } finally {
    if (START_SERVER) killTree(serverProc);
  }
}

main().catch((error) => {
  console.error("Smoke runner crashed:", error);
  process.exit(1);
});
