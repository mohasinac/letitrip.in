import { withProviders } from "@/providers.config";
/**
 * Admin Blog API Route
 * GET  /api/admin/blog â€” List all blog posts
 * POST /api/admin/blog â€” Create a new blog post
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { blogRepository } from "@mohasinac/appkit";
import { dedupeAttachedCouponIds } from "@mohasinac/appkit/features/promotions/schemas/attached-coupons";
/* Consumer-side zod-4 mirror; the cap is still appkit's. See its header. */
import { attachedCouponIdsSchema } from "@/constants/attached-coupons";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { finalizeStagedMediaObject, finalizeStagedMediaObjectArray } from "@mohasinac/appkit/features/media/finalize";
import { BLOG_FIELDS, COMMON_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { BlogPostStatusValues } from "@mohasinac/appkit/features/blog/schemas/firestore";
import { sieveFilter, SIEVE_OP } from "@mohasinac/appkit/utils/sieve-builder";
import { ROLES_ADMIN_MOD } from "@/constants";

const DEFAULT_SORTS = sortBy(COMMON_FIELDS.CREATED_AT);

// url/thumbnailUrl are relative /media/{shortId} proxy paths from the upload
// pipeline (POST /api/media/finalize), not absolute URLs — z.string().url()
// rejects those, matching the plain z.string() pattern products use.
const mediaFieldSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["image", "video", "file"]),
  alt: z.string().optional(),
  thumbnailUrl: z.string().min(1).optional(),
});

const createBlogPostSchema = z.object({
  title: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  slug: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  excerpt: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  content: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  category: z.enum(["news", "tips", "guides", "updates", "community"]),
  tags: z.array(z.string()).default([]),
  /*
   * Declared, or `z.object()` strips it and the editor's coupon picker saves
   * nothing on CREATE — a 201 and a post whose coupons silently did not
   * persist.
   *
   * 🛑 NOT `.default([])`, unlike `tags` and `isPinned` above. Those two are
   * defaulted because something reads them unconditionally — `isPinned` is an
   * `orderBy` field, and a post missing it drops out of its own index
   * (Root Cause #100). `couponIds` is never sorted or filtered on, so
   * `undefined` is a perfectly good "none" and writing `[]` into all 21
   * existing posts would be churn for no reader.
   */
  couponIds: attachedCouponIdsSchema,
  isFeatured: z.boolean().default(false),
  /*
   * 🛑 DEFAULTED, never optional, and the blog schema's own comment says why:
   * the list orders by `-isPinned,-publishedAt`, and Firestore EXCLUDES a
   * document that lacks an `orderBy` field (Root Cause #100). A post created
   * without it would not appear in its own blog index — a 201 and an
   * invisible post, with nothing erroring anywhere.
   */
  isPinned: z.boolean().default(false),
  status: z.enum([BlogPostStatusValues.DRAFT, BlogPostStatusValues.PUBLISHED, BlogPostStatusValues.ARCHIVED]).default(BlogPostStatusValues.DRAFT),
  coverImage: mediaFieldSchema.nullable().optional(),
  contentImages: z.array(mediaFieldSchema).max(10).optional().default([]),
  additionalImages: z.array(mediaFieldSchema).max(5).optional().default([]),
  youtubeId: z.string().max(20).optional(),
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
 *  - filters  (string) â€” Sieve filters (e.g. status==published, isFeatured==true)
 *  - sorts    (string) â€” Sieve sorts (e.g. -publishedAt)
 *  - page     (number) â€” page number (default 1)
 *  - pageSize (number) â€” results per page (default 50, max 200)
 *
 * meta.total / published / drafts / featured are always computed from the
 * full unfiltered dataset so stat cards remain accurate regardless of filter.
 */
const __GET__g = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
    const searchTerm = getStringParam(searchParams, "q")?.trim() || undefined;

    serverLogger.info("Admin blog posts list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    // Compute summary counts + paginated results in parallel (Rule 8 â€” no findAll())
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
      // Only THIS call is the list; the four above are pageSize:1 count
      // probes and must stay unfiltered or the stat tiles would follow the
      // search box.
      blogRepository.listAll(
        { filters, sorts, page: String(page), pageSize: String(pageSize) },
        searchTerm ? { search: searchTerm } : undefined,
      ),
    ]);

    const published = publishedResult.total;
    const drafts = draftsResult.total;
    const featured = featuredResult.total;

    return successResponse({
      items: sieveResult.items,
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
 * POST /api/admin/blog â€” Create a new blog post
 */
const __POST__g = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
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
      /* Dedupe moved out of the schema — see dedupeAttachedCouponIds. */
      couponIds: dedupeAttachedCouponIds(rest.couponIds),
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

export const GET = __GET__g;
export const POST = __POST__g;
