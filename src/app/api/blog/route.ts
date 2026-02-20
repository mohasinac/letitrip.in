/**
 * Blog API Route
 * GET /api/blog — List published blog posts with optional filters
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { blogRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  getSearchParams,
  getNumberParam,
  getStringParam,
} from "@/lib/api/request-helpers";
import { handleApiError } from "@/lib/errors/error-handler";
import { ERROR_MESSAGES } from "@/constants";
import type { BlogPostCategory } from "@/db/schema";

/**
 * GET /api/blog
 *
 * Query params:
 *  - category (string) — filter by category
 *  - featured (boolean) — only featured posts
 *  - page     (number) — page number (default 1)
 *  - pageSize (number) — results per page (default 12)
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

    const category = categoryParam as BlogPostCategory | undefined;

    const { posts, total } = await blogRepository.findPublished({
      category: category || undefined,
      featuredOnly,
      page,
      limit: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return successResponse({
      posts,
      meta: { total, page, pageSize, totalPages },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
