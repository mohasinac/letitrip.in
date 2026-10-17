import { normalizeError } from "@mohasinac/appkit/errors/normalize";
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
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { invalidateCache } from "@mohasinac/appkit/next/cache-middleware";
import { handleApiError } from "@mohasinac/appkit/errors/error-handler";
import { AuthenticationError } from "@mohasinac/appkit/errors/authentication-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { COLLECTION_CACHE_PATHS } from "@mohasinac/appkit/constants/cache-invalidation";
import { revalidateTargetsFor, type RevalidateHints } from "@mohasinac/appkit/server";
import { routing } from "@/i18n/routing";
import { withProviders } from "@/providers.config";
import { z } from "zod";

/*
 * The optional body, as one schema instead of four hand-rolled type tests.
 *
 * This endpoint is reached by the Firestore trigger and the seed script, both
 * of which send well-formed payloads — but it is also a secret-authenticated
 * public POST, and `hints` was `body.hints as RevalidateHints` after nothing
 * more than a `typeof === "object"` check. `RevalidateHints` drives which
 * paths get marked stale, so a malformed one is an ISR-write amplifier against
 * the quota that got this project suspended (Root Cause #104).
 *
 * `collections` keeps its own 400 message because the previous
 * `ValidationError("collections must be an array of strings")` is the string
 * the seed script's operator already recognises.
 */
const revalidateSchema = z.object({
  collections: z.array(z.string().trim().min(1).max(80)).max(64).optional(),
  id: z.string().trim().max(300).optional(),
  hints: z
    .object({
      slug: z.string().trim().max(300).optional(),
      storeId: z.string().trim().max(300).optional(),
      categorySlugs: z.array(z.string().trim().max(300)).max(40).optional(),
      brandSlug: z.string().trim().max(300).optional(),
      listingType: z.string().trim().max(40).optional(),
    })
    .partial()
    .optional(),
});

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
      const parsed = revalidateSchema.safeParse(await parseJsonBody(request));
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        throw new ValidationError(
          first?.path[0] === "collections"
            ? "collections must be an array of strings"
            : `${first?.path.join(".") || "body"}: ${first?.message ?? "Invalid request body"}`,
        );
      }
      const body = parsed.data;
      if (body.collections !== undefined) {
        collections = body.collections;
      }
      // Optional, and the difference between invalidating ONE product page and
      // every product page. The Firestore trigger supplies both; the seed script
      // supplies neither and correctly gets the listing-level invalidation.
      if (body.id) docId = body.id;
      if (body.hints) hints = body.hints as RevalidateHints;
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
