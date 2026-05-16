/**
 * Shared Playwright helpers: launch a single Chromium browser, build
 * per-role browser contexts pre-loaded with auth cookies (obtained via
 * the same /api/auth/login the HTTP suites use — no UI login).
 *
 * Video recording: opt-in via SMOKE_RECORD_VIDEO=1 env var.
 *   Videos land in SMOKE_VIDEO_DIR (default: test-results/videos/).
 *   Each context gets its own sub-directory keyed by role so files don't
 *   collide when multiple roles run in the same session.
 *
 * Screenshots: call takeScreenshot(page, "label") at any point, or wrap
 *   a block in withScreenshotOnFailure(page, "label", fn) to auto-capture
 *   on throw. Screenshots land in SMOKE_SCREENSHOT_DIR (default:
 *   test-results/screenshots/).
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROLES, BASE_URL, LOCALE } from "../prod-suites/_fixtures.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..", "..");

const HEADLESS = process.env.SMOKE_HEADLESS !== "0";
const SLOW_MO = Number(process.env.SMOKE_SLOW_MO ?? 0);
const RECORD_VIDEO = process.env.SMOKE_RECORD_VIDEO === "1";
const VIDEO_DIR = path.resolve(ROOT, process.env.SMOKE_VIDEO_DIR ?? "test-results/videos");
const SCREENSHOT_DIR = path.resolve(ROOT, process.env.SMOKE_SCREENSHOT_DIR ?? "test-results/screenshots");

let _browser = null;

export async function getBrowser() {
  if (_browser) return _browser;
  _browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO });
  return _browser;
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}

async function fetchSessionCookies(role) {
  const cfg = ROLES[role];
  const url = `${BASE_URL}/api/auth/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: cfg.email, password: cfg.password }),
    redirect: "manual",
  });
  if (res.status !== 200) {
    throw new Error(
      `Login (pw) failed for ${role}: ${res.status} ${await res.text().catch(() => "")}`,
    );
  }
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const parsed = [];
  for (const raw of setCookies) {
    const segs = raw.split(";").map((s) => s.trim());
    const [pair, ...attrs] = segs;
    const eq = pair.indexOf("=");
    if (eq < 0) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!name) continue;
    let path = "/";
    let domain = new URL(BASE_URL).hostname;
    let sameSite = "Lax";
    let secure = false;
    let httpOnly = false;
    for (const a of attrs) {
      const lower = a.toLowerCase();
      if (lower === "secure") secure = true;
      else if (lower === "httponly") httpOnly = true;
      else if (lower.startsWith("path=")) path = a.slice(5);
      else if (lower.startsWith("domain=")) domain = a.slice(7).replace(/^\./, "");
      else if (lower.startsWith("samesite=")) {
        const v = a.slice(9).toLowerCase();
        if (v === "strict") sameSite = "Strict";
        else if (v === "none") sameSite = "None";
        else sameSite = "Lax";
      }
    }
    // Override Strict → Lax so the cookie is sent on the first top-level
    // navigation in a fresh Playwright context (cookies imported via
    // addCookies are treated as cross-site by default).
    if (sameSite === "Strict") sameSite = "Lax";
    parsed.push({ name, value, domain, path, httpOnly, secure, sameSite });
  }
  return parsed;
}

const _ctxCache = new Map();

export async function getContext(role = "anon") {
  if (_ctxCache.has(role)) return _ctxCache.get(role);
  const browser = await getBrowser();

  const recordVideoOpts = RECORD_VIDEO
    ? {
        recordVideo: {
          dir: path.join(VIDEO_DIR, role),
          size: { width: 1280, height: 900 },
        },
      }
    : {};

  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "en-IN",
    userAgent:
      "Mozilla/5.0 (smoke-prod-playwright/1.0) Chrome/124.0 Safari/537.36",
    ...recordVideoOpts,
  });
  if (role !== "anon") {
    try {
      const cookies = await fetchSessionCookies(role);
      if (cookies.length > 0) await ctx.addCookies(cookies);
    } catch (e) {
      console.warn(`[pw-setup] login skipped for ${role}: ${e.message}`);
    }
  }
  _ctxCache.set(role, ctx);
  return ctx;
}

export function localizedUrl(path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}/${LOCALE}${clean === "/" ? "" : clean}`;
}

/**
 * Navigate to a localized URL and wait for recognizable content to attach.
 * Returns { status, finalUrl }.
 */
export async function gotoAndWait(page, url, { timeout = 15000 } = {}) {
  const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout }).catch(() => null);
  await page
    .locator("h1, h2, [data-section], [data-testid], .appkit-card, table, form")
    .first()
    .waitFor({ state: "attached", timeout: 6000 })
    .catch(() => {});
  return { status: res?.status() ?? 0, finalUrl: page.url() };
}

/**
 * Push a standard layout-shell result into the results array.
 */
export function assertShell(rec, path, { status, finalUrl, mainCount, contentCount }) {
  const redirected = /\/auth\/login/.test(finalUrl);
  rec(
    `${path}: layout shell`,
    status < 400 && mainCount > 0 && contentCount > 0 && !redirected,
    `status=${status} url=${finalUrl} main=${mainCount} content=${contentCount}`,
  );
}

/**
 * Fetch the first item id from a paginated API endpoint.
 * apiPath example: "/api/admin/products"
 * filter: optional predicate on item objects.
 */
export async function fetchFirstId(baseUrl, apiPath, { filter, cookieHeader } = {}) {
  try {
    const headers = cookieHeader ? { Cookie: cookieHeader } : {};
    const r = await fetch(`${baseUrl}${apiPath}?pageSize=5`, { headers });
    if (!r.ok) return null;
    const j = await r.json();
    const items = j?.data?.items ?? j?.data ?? [];
    if (filter) return items.find(filter)?.id ?? null;
    return items[0]?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Extract a cookie header string from a Playwright browser context (for use in fetch()).
 */
export async function getCookieHeader(ctx, baseUrl) {
  try {
    const cookies = await ctx.cookies(baseUrl);
    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch {
    return "";
  }
}

/**
 * Capture a screenshot to SCREENSHOT_DIR.
 * name: slug used in the filename (e.g. "media-upload-after-select").
 * Returns the output path, or null if the page is already closed.
 */
export async function takeScreenshot(page, name) {
  try {
    await mkdir(SCREENSHOT_DIR, { recursive: true });
    const ts = Date.now().toString(36);
    const file = path.join(SCREENSHOT_DIR, `${name}-${ts}.png`);
    await page.screenshot({ path: file, fullPage: false });
    return file;
  } catch {
    return null;
  }
}

/**
 * Run fn(). If it throws, capture a screenshot before re-throwing.
 * Use around any block where a mid-test failure is hard to diagnose.
 */
export async function withScreenshotOnFailure(page, name, fn) {
  try {
    return await fn();
  } catch (err) {
    await takeScreenshot(page, `fail-${name}`).catch(() => {});
    throw err;
  }
}

/** Wrap a page operation to capture console errors and net failures. */
export async function withErrorCollector(page, fn) {
  const consoleErrors = [];
  const netFailures = [];
  const onConsole = (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  };
  const onResponse = (res) => {
    if (res.status() >= 500) netFailures.push(`${res.status()} ${res.url()}`);
  };
  page.on("console", onConsole);
  page.on("response", onResponse);
  try {
    return { value: await fn(), consoleErrors, netFailures };
  } finally {
    page.off("console", onConsole);
    page.off("response", onResponse);
  }
}
