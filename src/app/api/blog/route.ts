/**
 * Blog API Route
 * GET /api/blog — List published blog posts with Sieve filtering, sorting, and pagination
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { blogRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import {
  getSearchParams,
  getNumberParam,
  getStringParam,
} from "@/lib/api/request-helpers";
import { handleApiError } from "@/lib/errors/error-handler";
import { applySieveToArray } from "@/helpers";
import type { BlogPostCategory } from "@/db/schema";

/**
 * GET /api/blog
 *
 * Query params:
 *  - category  (string) — pre-filter by category (Firestore-level, efficient)
 *  - featured  (boolean) — only featured posts (Firestore-level, efficient)
 *  - filters   (string) — Sieve filters (e.g. title@=Next,category==travel)
 *  - sorts     (string) — Sieve sorts (e.g. -publishedAt,title)
 *  - page      (number) — page number (default 1)
 *  - pageSize  (number) — results per page (default 12, max 50)
 *
 * Fetches all matching published posts from Firestore (with category/featured
 * pre-filtered at the DB layer), then applies @mohasinac/sievejs for
 * additional filtering, sorting, and pagination.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = getSearchParams(request);
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 12, {
      min: 1,
      max: 50,
    });
    const categoryParam = getStringParam(searchParams, "category");
    const featuredOnly = searchParams.get("featured") === "true";
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-publishedAt";

    const category = categoryParam as BlogPostCategory | undefined;

    // Fetch all matching published posts (Firestore handles category/featured filtering)
    const allPosts = await blogRepository.findAllPublished({
      category: category || undefined,
      featuredOnly,
    });

    // Apply Sieve DSL for additional filtering, sorting, and pagination
    const sieveResult = await applySieveToArray({
      items: allPosts,
      model: { filters, sorts, page, pageSize },
      fields: {
        id: { canFilter: true, canSort: false },
        title: { canFilter: true, canSort: true },
        slug: { canFilter: true, canSort: false },
        category: { canFilter: true, canSort: true },
        authorName: { canFilter: true, canSort: true },
        readTimeMinutes: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => Number(v),
        },
        publishedAt: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => new Date(v),
        },
        createdAt: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => new Date(v),
        },
      },
      options: {
        defaultPageSize: 12,
        maxPageSize: 50,
      },
    });

    return successResponse({
      posts: sieveResult.items,
      meta: {
        total: sieveResult.total,
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
