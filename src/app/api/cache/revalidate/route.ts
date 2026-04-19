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
 *   categories        → /api/categories
 *   products          → /api/products
 *   carouselSlides    → /api/carousel
 *   homepageSections  → /api/homepage-sections
 *   siteSettings      → /api/site-settings
 *   faqs              → /api/faqs
 *   reviews           → /api/reviews
 *   blogPosts         → /api/admin/blog, /api/blog
 *   events            → /api/admin/events, /api/events
 *   coupons           → /api/admin/coupons
 */

import { NextRequest, NextResponse } from "next/server";
import { invalidateCache } from "@mohasinac/appkit/next";
import { handleApiError } from "@mohasinac/appkit/errors";
import { AuthenticationError, ValidationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { COLLECTION_CACHE_PATHS } from "@mohasinac/appkit/constants";

export async function POST(request: NextRequest) {
  try {
    // --- Authentication ---
    const secret = process.env.CACHE_REVALIDATION_SECRET;
    const provided = request.headers.get("x-api-key");

    if (!secret) {
      serverLogger.warn(
        "Cache revalidation: CACHE_REVALIDATION_SECRET is not configured — endpoint disabled",
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
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      if (body.collections !== undefined) {
        if (!Array.isArray(body.collections)) {
          throw new ValidationError("collections must be an array of strings");
        }
        collections = body.collections as string[];
      }
    }

    // --- Invalidate ---
    if (!collections || collections.length === 0) {
      invalidateCache(); // Clear everything
      serverLogger.info("Cache revalidation: cleared all entries");
      return NextResponse.json({ cleared: "all" }, { status: 200 });
    }

    const unknown = collections.filter((c) => !(c in COLLECTION_CACHE_PATHS));
    if (unknown.length > 0) {
      serverLogger.warn(
        `Cache revalidation: unknown collections ignored: ${unknown.join(", ")}`,
      );
    }

    const clearedPaths: string[] = [];
    for (const col of collections) {
      const paths = COLLECTION_CACHE_PATHS[col];
      if (!paths) continue;
      for (const path of paths) {
        invalidateCache(path);
        clearedPaths.push(path);
      }
    }

    serverLogger.info(
      `Cache revalidation: cleared paths [${clearedPaths.join(", ")}]`,
    );

    return NextResponse.json({ cleared: clearedPaths }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

