import { normalizeError } from "@mohasinac/appkit";
/**
 * Cache Revalidation Endpoint
 *
 * POST /api/cache/revalidate
 *
 * Clears the in-memory API response cache (CacheManager) for one or more
 * collections. Intended to be called by the seed script after writing
 * fresh data so stale cached responses are evicted immediately.
 *
 * Auth: x-api-key header must match CACHE_REVALIDATION_SECRET env var.
 *
 * Body (optional JSON):
 *   { "collections": ["categories", "products", "faqs", ...] }
 *   Omit `collections` (or send an empty array) to clear ALL cached entries.
 *
 * Supported collection names and their cache-key prefixes:
 *   categories        â†’ /api/categories
 *   products          â†’ /api/products
 *   carouselSlides    â†’ /api/carousel
 *   homepageSections  â†’ /api/homepage-sections
 *   siteSettings      â†’ /api/site-settings
 *   faqs              â†’ /api/faqs
 *   reviews           â†’ /api/reviews
 *   blogPosts         â†’ /api/admin/blog, /api/blog
 *   events            â†’ /api/admin/events, /api/events
 *   coupons           â†’ /api/admin/coupons
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { invalidateCache, parseJsonBody } from "@mohasinac/appkit";
import { handleApiError } from "@mohasinac/appkit";
import { AuthenticationError, ValidationError } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { COLLECTION_CACHE_PATHS } from "@mohasinac/appkit";
import { revalidateTargetsFor, type RevalidateHints } from "@mohasinac/appkit/server";
import { routing } from "@/i18n/routing";
import { withProviders } from "@/providers.config";

/**
 * 🛑 `invalidateCache()` alone was never enough, and that is why this endpoint
 * looked wired while doing nothing useful.
 *
 * It clears `CacheManager`, an in-memory `Map` that is **per lambda instance**
 * and is populated only by `withCache()` — which has **zero call sites**. It has
 * never touched Next's ISR cache, which is the thing that actually serves a
 * stale product page. Measured 2026-10-09.
 *
 * `revalidatePath()` is the real mechanism, and it is what makes the long
 * detail-route TTLs safe. Both are called: the in-memory clear costs nothing and
 * remains correct if `withCache()` is ever adopted.
 *
 * Prerendered entries live under the locale prefix (`/en/products/…`), so every
 * target is expanded across `routing.locales`. Revalidating the unprefixed path
 * alone marks nothing — the single most likely way for this to silently fail.
 */
function revalidatePageTargets(paths: string[]): string[] {
  const done: string[] = [];
  for (const path of paths) {
    for (const locale of routing.locales) {
      const full = path === "/" ? `/${locale}` : `/${locale}${path}`;
      try {
        revalidatePath(full);
        done.push(full);
      } catch (err) {
        // One bad path must not abort the rest — a partial invalidation is
        // strictly better than none, and the failure is recorded.
        void normalizeError(err);
        serverLogger.warn("Cache revalidation: revalidatePath failed", { path: full });
      }
    }
  }
  return done;
}

async function postHandler(request: NextRequest) {
  try {
    // --- Authentication ---
    const secret = process.env.CACHE_REVALIDATION_SECRET;
    const provided = request.headers.get("x-api-key");

    if (!secret) {
      serverLogger.warn(
        "Cache revalidation: CACHE_REVALIDATION_SECRET is not configured â€” endpoint disabled",
      );
      return NextResponse.json(
        { error: "Endpoint not configured" },
        { status: 503 },
      );
    }

    if (!provided || provided !== secret) {
      throw new AuthenticationError("Invalid or missing x-api-key header");
    }

    // --- Parse optional body ---
    let collections: string[] | undefined;
    let docId: string | undefined;
    let hints: RevalidateHints | undefined;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await parseJsonBody(request);
      if (body.collections !== undefined) {
        if (!Array.isArray(body.collections)) {
          throw new ValidationError("collections must be an array of strings");
        }
        collections = body.collections as string[];
      }
      // Optional, and the difference between invalidating ONE product page and
      // every product page. The Firestore trigger supplies both; the seed script
      // supplies neither and correctly gets the listing-level invalidation.
      if (typeof body.id === "string" && body.id.trim()) docId = body.id.trim();
      if (body.hints && typeof body.hints === "object") {
        hints = body.hints as RevalidateHints;
      }
    }

    // --- Invalidate ---
    if (!collections || collections.length === 0) {
      invalidateCache(); // in-memory CacheManager
      // Every known collection's page targets. Deliberately NOT a bare
      // `revalidatePath("/", "layout")`: that marks the entire route tree stale
      // in one call, so the next crawl regenerates every page at once — the
      // thundering-herd shape this whole change exists to avoid.
      const all = new Set<string>();
      for (const col of Object.keys(COLLECTION_CACHE_PATHS)) {
        for (const p of revalidateTargetsFor(col)) all.add(p);
      }
      const revalidated = revalidatePageTargets([...all]);
      serverLogger.info("Cache revalidation: cleared all entries", {
        revalidatedCount: revalidated.length,
      });
      return NextResponse.json({ cleared: "all", revalidated }, { status: 200 });
    }

    const unrecognized = collections.filter((c) => !(c in COLLECTION_CACHE_PATHS));
    if (unrecognized.length > 0) {
      serverLogger.warn(
        `Cache revalidation: unrecognized collections ignored: ${unrecognized.join(", ")}`,
      );
    }

    const clearedPaths: string[] = [];
    const pageTargets = new Set<string>();
    for (const col of collections) {
      const paths = COLLECTION_CACHE_PATHS[col];
      if (paths) {
        for (const path of paths) {
          invalidateCache(path);
          clearedPaths.push(path);
        }
      }
      // `docId`/`hints` apply only when ONE collection was named — pairing an id
      // with several collections is ambiguous and would invalidate the wrong
      // detail pages.
      const single = collections.length === 1;
      for (const p of revalidateTargetsFor(col, single ? docId : undefined, single ? hints : undefined)) {
        pageTargets.add(p);
      }
    }

    const revalidated = revalidatePageTargets([...pageTargets]);

    serverLogger.info("Cache revalidation complete", {
      collections,
      docId: docId ?? null,
      apiPaths: clearedPaths.length,
      pagesRevalidated: revalidated.length,
    });

    return NextResponse.json(
      { cleared: clearedPaths, revalidated },
      { status: 200 },
    );
  } catch (error) {
    void normalizeError(error);
    return handleApiError(error);
  }
}

export const POST = withProviders(postHandler);
