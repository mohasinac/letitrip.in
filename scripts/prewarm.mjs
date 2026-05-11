#!/usr/bin/env node
/**
 * prewarm.mjs
 *
 * Polls localhost:3000 until Next.js is ready, then fires sequential GET
 * requests for every static public + admin + store route so webpack compiles
 * them all up-front. This prevents the per-visit 500–800 MB RSS spikes that
 * accumulate mid-session when routes are compiled on first request.
 *
 * Usage: run via `npm run prewarm` (auto-started by `npm run dev`).
 */

import http from "http";

const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;

// Ordered by priority: public routes first, then auth-gated (still compile the bundle).
const ROUTES = [
  // Public — highest dev traffic
  "/",
  "/products",
  "/auctions",
  "/pre-orders",
  "/stores",
  "/categories",
  "/brands",
  "/blog",
  "/events",
  "/reviews",
  "/search",
  "/faq",
  "/faqs",
  "/cart",
  "/wishlist",
  "/promotions",
  "/sell",
  "/sellers",
  // Info / legal
  "/about",
  "/support",
  "/contact",
  "/how-auctions-work",
  "/how-pre-orders-work",
  "/how-orders-work",
  "/how-payouts-work",
  "/how-reviews-work",
  "/how-checkout-works",
  "/how-offers-work",
  "/seller-guide",
  "/terms",
  "/privacy",
  "/cookies",
  "/refund-policy",
  "/shipping-policy",
  "/fees",
  "/security",
  "/scams",
  "/scams/types",
  "/track",
  "/help",
  // Auth (compiles auth bundle)
  "/auth/login",
  "/auth/register",
  // Store dashboard
  "/store",
  "/store/products",
  "/store/orders",
  "/store/auctions",
  "/store/pre-orders",
  "/store/reviews",
  "/store/payouts",
  "/store/coupons",
  "/store/offers",
  "/store/storefront",
  // User dashboard
  "/user",
  "/user/orders",
  "/user/profile",
  "/user/addresses",
  "/user/history",
  "/user/wishlist",
  "/user/notifications",
  // Admin dashboard
  "/admin",
  "/admin/dashboard",
  "/admin/products",
  "/admin/orders",
  "/admin/stores",
  "/admin/users",
  "/admin/categories",
  "/admin/brands",
  "/admin/blog",
  "/admin/events",
  "/admin/reviews",
  "/admin/coupons",
  "/admin/faqs",
  "/admin/site",
  "/admin/carousel",
  "/admin/analytics",
  "/admin/media",
  "/admin/sections",
  // Demo
  "/demo/seed",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function get(url) {
  return new Promise((resolve) => {
    http
      .get(url, { timeout: 60_000 }, (res) => {
        res.resume(); // drain
        resolve(res.statusCode);
      })
      .on("error", () => resolve(null))
      .on("timeout", () => resolve(null));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function ts() {
  return new Date().toISOString().slice(11, 19);
}

// ---------------------------------------------------------------------------
// Wait for Next.js to be ready
// ---------------------------------------------------------------------------

async function waitForReady(maxWaitMs = 120_000) {
  const deadline = Date.now() + maxWaitMs;
  process.stdout.write(`[prewarm] Waiting for Next.js on ${BASE} `);
  while (Date.now() < deadline) {
    const status = await get(BASE);
    if (status !== null) {
      console.log(" ready.");
      return true;
    }
    process.stdout.write(".");
    await sleep(1000);
  }
  console.log(" timed out.");
  return false;
}

// ---------------------------------------------------------------------------
// Pre-warm loop
// ---------------------------------------------------------------------------

async function prewarm() {
  const ready = await waitForReady();
  if (!ready) {
    console.error("[prewarm] Server never became ready — skipping pre-warm.");
    process.exit(0);
  }

  // Extra grace period so Next.js finishes its initial compilation
  await sleep(2000);

  console.log(`[prewarm] Starting — ${ROUTES.length} routes`);
  const start = Date.now();
  let ok = 0;
  let fail = 0;

  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    const t0 = Date.now();
    const status = await get(url);
    const ms = Date.now() - t0;

    if (status !== null) {
      console.log(`[prewarm ${ts()}] ${status}  ${route}  (${ms}ms)`);
      ok++;
    } else {
      console.log(`[prewarm ${ts()}] ERR  ${route}  (${ms}ms)`);
      fail++;
    }

    // Brief pause between routes so webpack isn't handling multiple compiles
    // simultaneously — sequential compiles produce lower peak RSS.
    await sleep(200);
  }

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(
    `[prewarm] Done in ${elapsed}s — ${ok} ok, ${fail} failed. All module graphs are now cached.`
  );
}

prewarm();
