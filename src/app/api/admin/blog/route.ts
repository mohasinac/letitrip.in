/**
 * Admin Blog API Route
 * GET  /api/admin/blog — List all blog posts
 * POST /api/admin/blog — Create a new blog post
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { blogRepository } from "@/repositories";
import { applySieveToArray } from "@/helpers";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

const createBlogPostSchema = z.object({
  title: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  slug: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  excerpt: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  content: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  category: z.enum(["news", "tips", "guides", "updates", "community"]),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  coverImage: z.string().optional(),
  authorId: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  authorName: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  authorAvatar: z.string().optional(),
  readTimeMinutes: z.number().int().min(1).default(5),
  publishedAt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

/**
 * GET /api/admin/blog
 *
 * Query params:
 *  - filters  (string) — Sieve filters (e.g. status==published, isFeatured==true)
 *  - sorts    (string) — Sieve sorts (e.g. -publishedAt)
 *  - page     (number) — page number (default 1)
 *  - pageSize (number) — results per page (default 50, max 200)
 *
 * meta.total / published / drafts / featured are always computed from the
 * full unfiltered dataset so stat cards remain accurate regardless of filter.
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }: { request: NextRequest }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 200,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    serverLogger.info("Admin blog posts list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const allPosts = await blogRepository.findAll();

    // Compute summary stats from all posts — unaffected by active filters
    const published = allPosts.filter((p) => p.status === "published").length;
    const drafts = allPosts.filter((p) => p.status === "draft").length;
    const featured = allPosts.filter((p) => p.isFeatured).length;

    const sieveResult = await applySieveToArray({
      items: allPosts,
      model: { filters, sorts, page, pageSize },
      fields: {
        id: { canFilter: true, canSort: false },
        title: { canFilter: true, canSort: true },
        slug: { canFilter: true, canSort: false },
        status: { canFilter: true, canSort: true },
        category: { canFilter: true, canSort: true },
        authorName: { canFilter: true, canSort: true },
        isFeatured: {
          canFilter: true,
          canSort: false,
          parseValue: (v: string) => v === "true",
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
      options: { defaultPageSize: 50, maxPageSize: 200 },
    });

    return successResponse({
      posts: sieveResult.items,
      meta: {
        total: allPosts.length, // Always full count for stat cards
        published,
        drafts,
        featured,
        filteredTotal: sieveResult.total,
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    });
  },
});

/**
 * POST /api/admin/blog — Create a new blog post
 */
export const POST = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  schema: createBlogPostSchema,
  handler: async ({ body, user }) => {
    const { publishedAt, ...rest } = body!;

    const postData = {
      ...rest,
      publishedAt: publishedAt
        ? new Date(publishedAt)
        : body!.status === "published"
          ? new Date()
          : undefined,
      authorId: body!.authorId || user?.uid || "",
    };

    serverLogger.info("Creating blog post", {
      title: postData.title,
      authorId: postData.authorId,
    });

    const post = await blogRepository.create(postData);

    return successResponse(post, SUCCESS_MESSAGES.BLOG.CREATED);
  },
});
