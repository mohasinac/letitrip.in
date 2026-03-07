/**
 * Blog API Route
 * GET /api/blog — List published blog posts with Sieve filtering, sorting, and pagination
 */

import { NextRequest } from "next/server";
import { blogRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import {
  getSearchParams,
  getNumberParam,
  getStringParam,
} from "@/lib/api/request-helpers";
import { createApiHandler } from "@/lib/api/api-handler";
import type { BlogPostCategory } from "@/db/schema";

export const GET = createApiHandler({
  handler: async ({ request }) => {
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

    const sieveResult = await blogRepository.listPublished(
      { category: category || undefined, featuredOnly },
      { filters, sorts, page, pageSize },
    );

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
  },
});
