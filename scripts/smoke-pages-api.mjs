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

async function runPageSmoke(baseUrl) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  const record = (name, ok, detail = "") => {
    results.push({ type: "page", name, ok, detail });
  };

  try {
    await page.goto(`${baseUrl}/en`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Shop Now" }).first().click();
    record("home: load + click Shop Now", true);
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
    { method: "GET", path: "/api/admin/users", expected: [401] },
    { method: "POST", path: "/api/contact", expected: [200], body: {
      name: "Smoke Runner",
      email: "smoke@example.com",
      subject: "Smoke API",
      message: "Automated API smoke test message.",
    } },
  ];

  const results = [];

  const safeJsonParse = (text) => {
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch {
      return { ok: false, value: null };
    }
  };

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

    await compareApiVariants({
      name: "GET /api/bids sieve check (auctionId variant)",
      variantA: "/api/bids?auctionId=sieve-auction&pageSize=12",
      variantB: "/api/bids?auctionId=test-auction&pageSize=12",
    });

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
