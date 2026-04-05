import "@/providers.config";
/**
 * Admin Blog API Route
 * GET  /api/admin/blog — List all blog posts
 * POST /api/admin/blog — Create a new blog post
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { blogRepository } from "@/repositories";
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
export const GET = createRouteHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
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

    // Compute summary counts + paginated results in parallel (Rule 8 — no findAll())
    const [
      publishedResult,
      draftsResult,
      featuredResult,
      allResult,
      sieveResult,
    ] = await Promise.all([
      blogRepository.listAll({
        filters: "status==published",
        sorts: "createdAt",
        page: "1",
        pageSize: "1",
      }),
      blogRepository.listAll({
        filters: "status==draft",
        sorts: "createdAt",
        page: "1",
        pageSize: "1",
      }),
      blogRepository.listAll({
        filters: "isFeatured==true",
        sorts: "createdAt",
        page: "1",
        pageSize: "1",
      }),
      blogRepository.listAll({ sorts: "createdAt", page: "1", pageSize: "1" }),
      blogRepository.listAll({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      }),
    ]);

    const published = publishedResult.total;
    const drafts = draftsResult.total;
    const featured = featuredResult.total;

    return successResponse({
      posts: sieveResult.items,
      meta: {
        total: allResult.total, // Always full count for stat cards
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
export const POST = createRouteHandler({
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
