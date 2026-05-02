#!/usr/bin/env node
/**
 * Comprehensive browser audit — Phases 22.1–22.3, 22.7, 23.3–23.6
 *
 * Tests:
 *   - Responsive layouts at 375 / 768 / 1024px (Chromium)
 *   - Accessibility via axe-core (Chromium)
 *   - Cross-browser basic smoke (Firefox)
 *   - Mobile device emulation (Chromium)
 *   - Performance metrics via Playwright (proxy for Lighthouse)
 *
 * Usage:
 *   node scripts/qa/audit-browser.mjs
 *   AUDIT_BASE_URL=http://localhost:3000 node scripts/qa/audit-browser.mjs
 */

import { chromium, firefox } from "playwright";
import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AXE_PATH = path.join(__dirname, "../../node_modules/axe-core/axe.min.js");
const AXE_SCRIPT = readFileSync(AXE_PATH, "utf-8");

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const LOCALE = process.env.AUDIT_LOCALE ?? "en";
const HEADLESS = process.env.AUDIT_HEADLESS !== "0";
const USE_EXISTING = process.env.AUDIT_USE_EXISTING === "1";
const PORT = 3000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function killTree(proc) {
  if (!proc?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    proc.kill("SIGTERM");
  }
}

async function waitForServer(url, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {}
    await sleep(1000);
  }
  throw new Error(`Server not ready at ${url} within ${timeoutMs}ms`);
}

const url = (p) => `${BASE}/${LOCALE}${p}`;

// ─── Result tracking ──────────────────────────────────────────────────────────

const results = [];

function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`  PASS  ${name}${detail ? " :: " + detail : ""}`);
}

function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
  console.log(`  FAIL  ${name}${detail ? " :: " + detail : ""}`);
}

function section(title) {
  console.log(`\n[${title}]`);
}

// ─── Viewport responsive check ────────────────────────────────────────────────

async function checkViewport(browser, width, height, label) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();

  const pages = [
    { path: "", name: "home" },
    { path: "/products", name: "products listing" },
    { path: "/blog", name: "blog listing" },
    { path: "/events", name: "events listing" },
    { path: "/contact", name: "contact" },
  ];

  for (const { path: p, name } of pages) {
    try {
      const res = await page.goto(url(p), { waitUntil: "domcontentloaded", timeout: 20_000 });
      const status = res?.status() ?? 0;
      if (status >= 500) {
        fail(`${label} — ${name}`, `HTTP ${status}`);
        continue;
      }

      // Check for horizontal overflow (layout break)
      const overflow = await page.evaluate(() => {
        const body = document.body;
        const scrollW = body.scrollWidth;
        const clientW = body.clientWidth;
        return scrollW > clientW + 2 ? scrollW - clientW : 0;
      });

      // Check main content is visible
      const hasMain = await page.locator("main, [role=main]").first().isVisible().catch(() => false);

      if (overflow > 10) {
        fail(`${label} — ${name}`, `horizontal overflow: ${overflow}px`);
      } else if (!hasMain) {
        fail(`${label} — ${name}`, "no visible <main>");
      } else {
        pass(`${label} — ${name}`, `status=${status}, overflow=${overflow}px`);
      }
    } catch (e) {
      fail(`${label} — ${name}`, String(e).slice(0, 100));
    }
  }

  await ctx.close();
}

// ─── Accessibility via axe-core ───────────────────────────────────────────────

async function checkA11y(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const pages = [
    { path: "", name: "home" },
    { path: "/products", name: "products" },
    { path: "/blog", name: "blog" },
    { path: "/contact", name: "contact" },
  ];

  for (const { path: p, name } of pages) {
    try {
      const res = await page.goto(url(p), { waitUntil: "domcontentloaded", timeout: 20_000 });
      if ((res?.status() ?? 0) >= 500) {
        fail(`a11y — ${name}`, `HTTP ${res?.status()}`);
        continue;
      }

      await page.addScriptTag({ content: AXE_SCRIPT });

      const violations = await page.evaluate(async () => {
        const results = await window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
        });
        return results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          desc: v.description,
          count: v.nodes.length,
        }));
      });

      const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");

      if (critical.length > 0) {
        fail(`a11y — ${name}`, `${critical.length} critical/serious: ${critical.map((v) => v.id).join(", ")}`);
      } else if (violations.length > 0) {
        pass(`a11y — ${name}`, `0 critical/serious, ${violations.length} minor (${violations.map((v) => v.id).join(", ")})`);
      } else {
        pass(`a11y — ${name}`, "0 violations");
      }
    } catch (e) {
      fail(`a11y — ${name}`, String(e).slice(0, 120));
    }
  }

  await ctx.close();
}

// ─── Performance metrics (Playwright proxy) ───────────────────────────────────

async function checkPerformance(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const pages = [
    { path: "", name: "home" },
    { path: "/products", name: "products" },
  ];

  for (const { path: p, name } of pages) {
    try {
      const t0 = Date.now();
      const res = await page.goto(url(p), { waitUntil: "networkidle", timeout: 30_000 });
      const elapsed = Date.now() - t0;

      if ((res?.status() ?? 0) >= 500) {
        fail(`perf — ${name}`, `HTTP ${res?.status()}`);
        continue;
      }

      // Navigation timing
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        if (!nav) return null;
        return {
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          load: Math.round(nav.loadEventEnd - nav.startTime),
          ttfb: Math.round(nav.responseStart - nav.requestStart),
        };
      });

      // LCP approximation via largest image
      const lcpApprox = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            resolve(Math.round(last?.startTime ?? 0));
            observer.disconnect();
          });
          try {
            observer.observe({ type: "largest-contentful-paint", buffered: true });
          } catch {
            resolve(0);
          }
          setTimeout(() => resolve(0), 3000);
        });
      });

      const dcl = timing?.domContentLoaded ?? elapsed;
      const lcpOk = lcpApprox === 0 || lcpApprox < 2500;
      const dclOk = dcl < 3000;

      const detail = `DCL=${dcl}ms, TTFB=${timing?.ttfb ?? "?"}ms, LCP≈${lcpApprox || "?"}ms, total=${elapsed}ms`;

      if (!dclOk) {
        fail(`perf — ${name}`, `DCL ${dcl}ms > 3000ms threshold. ${detail}`);
      } else if (!lcpOk) {
        fail(`perf — ${name}`, `LCP ${lcpApprox}ms > 2500ms. ${detail}`);
      } else {
        pass(`perf — ${name}`, detail);
      }
    } catch (e) {
      fail(`perf — ${name}`, String(e).slice(0, 120));
    }
  }

  await ctx.close();
}

// ─── Firefox cross-browser smoke ──────────────────────────────────────────────

async function checkFirefox(ffBrowser) {
  const ctx = await ffBrowser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const pages = [
    { path: "", name: "home" },
    { path: "/products", name: "products" },
    { path: "/blog", name: "blog" },
    { path: "/contact", name: "contact" },
    { path: "/auth/login", name: "login" },
  ];

  for (const { path: p, name } of pages) {
    try {
      const res = await page.goto(url(p), { waitUntil: "domcontentloaded", timeout: 20_000 });
      const status = res?.status() ?? 0;
      const hasMain = await page.locator("main, [role=main], body").first().isVisible().catch(() => false);

      if (status >= 500) {
        fail(`firefox — ${name}`, `HTTP ${status}`);
      } else if (!hasMain) {
        fail(`firefox — ${name}`, "page appears blank");
      } else {
        pass(`firefox — ${name}`, `status=${status}`);
      }
    } catch (e) {
      fail(`firefox — ${name}`, String(e).slice(0, 100));
    }
  }

  await ctx.close();
}

// ─── Mobile device emulation ─────────────────────────────────────────────────

async function checkMobile(browser) {
  // iPhone 12 emulation
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  const pages = [
    { path: "", name: "home" },
    { path: "/products", name: "products" },
    { path: "/contact", name: "contact" },
  ];

  for (const { path: p, name } of pages) {
    try {
      const res = await page.goto(url(p), { waitUntil: "domcontentloaded", timeout: 20_000 });
      const status = res?.status() ?? 0;

      const overflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth + 2
          ? document.body.scrollWidth - document.body.clientWidth
          : 0;
      });

      const hasNav = await page.locator("nav, header").first().isVisible().catch(() => false);
      const hasContent = await page.locator("main").first().isVisible().catch(() => false);

      if (status >= 500) {
        fail(`mobile-iOS — ${name}`, `HTTP ${status}`);
      } else if (overflow > 10) {
        fail(`mobile-iOS — ${name}`, `horizontal overflow ${overflow}px`);
      } else if (!hasContent) {
        fail(`mobile-iOS — ${name}`, "no <main> visible");
      } else {
        pass(`mobile-iOS — ${name}`, `status=${status}, overflow=${overflow}px, nav=${hasNav}`);
      }
    } catch (e) {
      fail(`mobile-iOS — ${name}`, String(e).slice(0, 100));
    }
  }

  await ctx.close();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nBrowser Audit — ${BASE}`);
  console.log("=".repeat(60));

  let serverProc = null;
  if (!USE_EXISTING) {
    console.log("\nStarting next dev server...");
    serverProc = spawn("npx", ["next", "dev", "--port", String(PORT)], {
      stdio: "pipe",
      cwd: path.join(__dirname, "../.."),
      shell: true,
    });
    await waitForServer(`${BASE}/en`);
    console.log("Server ready.\n");
  }

  const cr = await chromium.launch({ headless: HEADLESS });
  const ff = await firefox.launch({ headless: HEADLESS });

  try {
    section("Phase 22.1 — Mobile layouts (375px)");
    await checkViewport(cr, 375, 812, "375px");

    section("Phase 22.2 — Tablet layouts (768px)");
    await checkViewport(cr, 768, 1024, "768px");

    section("Phase 22.3 — Desktop layouts (1024px+)");
    await checkViewport(cr, 1280, 800, "1280px");

    section("Phase 22.7 / 23.4 — Accessibility (axe-core WCAG 2.0 AA)");
    await checkA11y(cr);

    section("Phase 23.3 — Performance metrics (Playwright timing)");
    await checkPerformance(cr);

    section("Phase 23.5 — Cross-browser Firefox");
    await checkFirefox(ff);

    section("Phase 23.6 — Mobile device (iPhone 12 emulation)");
    await checkMobile(cr);
  } finally {
    await cr.close();
    await ff.close();
    if (serverProc) killTree(serverProc);
  }

  // ─── Summary ────────────────────────────────────────────────────────────────

  console.log("\n" + "=".repeat(60));
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nAudit Summary: ${passed}/${results.length} passed, ${failed} failed`);

  if (failed > 0) {
    console.log("\nFailed checks:");
    results.filter((r) => !r.ok).forEach((r) => console.log(`  ✗ ${r.name} :: ${r.detail}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Audit failed:", e);
  process.exit(1);
});
