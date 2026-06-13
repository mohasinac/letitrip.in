import { withProviders } from "@/providers.config";
/**
 * Admin Blog API Route
 * GET  /api/admin/blog — List all blog posts
 * POST /api/admin/blog — Create a new blog post
 */

import { z } from "zod";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { blogRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import {
  finalizeStagedMediaObject,
  finalizeStagedMediaObjectArray,
} from "@mohasinac/appkit";
import { BlogPostStatusValues, sortBy, sieveFilter, SIEVE_OP, BLOG_FIELDS, COMMON_FIELDS } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const DEFAULT_SORTS = sortBy(COMMON_FIELDS.CREATED_AT);

const mediaFieldSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video", "file"]),
  alt: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const createBlogPostSchema = z.object({
  title: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  slug: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  excerpt: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  content: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  category: z.enum(["news", "tips", "guides", "updates", "community"]),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  status: z.enum([BlogPostStatusValues.DRAFT, BlogPostStatusValues.PUBLISHED, BlogPostStatusValues.ARCHIVED]).default(BlogPostStatusValues.DRAFT),
  coverImage: mediaFieldSchema.nullable().optional(),
  contentImages: z.array(mediaFieldSchema).max(10).optional().default([]),
  additionalImages: z.array(mediaFieldSchema).max(5).optional().default([]),
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
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:blog:read",
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

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
        filters: sieveFilter(BLOG_FIELDS.STATUS, SIEVE_OP.EQ, BlogPostStatusValues.PUBLISHED),
        sorts: sortBy(COMMON_FIELDS.CREATED_AT),
        page: "1",
        pageSize: "1",
      }),
      blogRepository.listAll({
        filters: sieveFilter(BLOG_FIELDS.STATUS, SIEVE_OP.EQ, BlogPostStatusValues.DRAFT),
        sorts: sortBy(COMMON_FIELDS.CREATED_AT),
        page: "1",
        pageSize: "1",
      }),
      blogRepository.listAll({
        filters: sieveFilter(BLOG_FIELDS.IS_FEATURED, SIEVE_OP.EQ, "true"),
        sorts: sortBy(COMMON_FIELDS.CREATED_AT),
        page: "1",
        pageSize: "1",
      }),
      blogRepository.listAll({ sorts: sortBy(COMMON_FIELDS.CREATED_AT), page: "1", pageSize: "1" }),
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
}));

/**
 * POST /api/admin/blog — Create a new blog post
 */
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const POST = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:blog:write",
  schema: createBlogPostSchema,
  handler: async ({ body, user }) => {
    const { publishedAt, ...rest } = body!;
    const coverImage = await finalizeStagedMediaObject(rest.coverImage);
    const contentImages = await finalizeStagedMediaObjectArray(
      rest.contentImages,
    );
    const additionalImages = await finalizeStagedMediaObjectArray(
      rest.additionalImages,
    );

    const postData = {
      ...rest,
      coverImage,
      contentImages,
      additionalImages,
      publishedAt: publishedAt
        ? new Date(publishedAt)
        : body!.status === BlogPostStatusValues.PUBLISHED
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
}));

