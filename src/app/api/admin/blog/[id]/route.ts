import { withProviders } from "@/providers.config";
import { z } from "zod";
import { BlogPostStatusValues } from "@mohasinac/appkit/features/blog/schemas/firestore";
import { finalizeStagedMediaObject, finalizeStagedMediaObjectArray } from "@mohasinac/appkit/features/media/finalize";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { blogRepository } from "@mohasinac/appkit";
import { attachedCouponIdsSchema } from "@mohasinac/appkit/features/promotions/schemas/attached-coupons";
import { ROLES_ADMIN_MOD } from "@/constants";

// url/thumbnailUrl are relative /media/{shortId} proxy paths from the upload
// pipeline (POST /api/media/finalize), not absolute URLs — z.string().url()
// rejects those, matching the plain z.string() pattern products use.
const mediaFieldSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["image", "video", "file"]),
  alt: z.string().optional(),
  thumbnailUrl: z.string().min(1).optional(),
});

const updateBlogPostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(["news", "tips", "guides", "updates", "community"]).optional(),
  tags: z.array(z.string()).optional(),
  /*
   * 🛑 This schema is a plain `z.object()` with NO `.passthrough()`, so an
   * undeclared field is STRIPPED and the PATCH returns 200 having written
   * nothing. That is the exact failure of Root Cause #76(b): the admin
   * grouped-listings route validated against `z.object({productIds})`, so an
   * admin editing a title got a success response and no write.
   *
   * The create-vs-update pair also has to AGREE — a field accepted on POST and
   * missing here means coupons can be set once and never changed, which is
   * Root Cause #38/#39's shape.
   */
  couponIds: attachedCouponIdsSchema,
  isFeatured: z.boolean().optional(),
  status: z.enum([BlogPostStatusValues.DRAFT, BlogPostStatusValues.PUBLISHED, BlogPostStatusValues.ARCHIVED]).optional(),
  coverImage: mediaFieldSchema.nullable().optional(),
  contentImages: z.array(mediaFieldSchema).max(10).optional(),
  additionalImages: z.array(mediaFieldSchema).max(5).optional(),
  youtubeId: z.string().max(20).optional(),
  readTimeMinutes: z.number().int().min(1).optional(),
  publishedAt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

/*
 * 🛑 One resolver for all three verbs.
 *
 * This route was internally inconsistent: GET resolved the segment with
 * `findBySlug`, while PATCH and DELETE passed the same segment straight to
 * `update`/`delete`, which take the DOC ID. The two are different values here —
 * the id is `blog-collector-spotlight-mumbai-gundam`, the slug is
 * `collector-spotlight-mumbai-gundam`.
 *
 * Consequences, both measured:
 *   - `/admin/blog/<id>/edit` passes the doc id, so GET 404'd and the editor
 *     rendered 4 fields with 0 pre-filled, for a post that exists and renders
 *     publicly. Every blog post was uneditable.
 *   - the mirror case is worse: a caller holding a SLUG would GET fine and then
 *     DELETE a document id that does not exist — a delete that silently
 *     removes nothing while reporting success.
 *
 * Accepting either and then always acting on the resolved document id removes
 * the asymmetry rather than moving it.
 */
const NOT_FOUND_MESSAGE = "Blog post not found";

async function resolveBlogPost(idOrSlug: string) {
  return (
    (await blogRepository.findById(idOrSlug)) ??
    (await blogRepository.findBySlug(idOrSlug))
  );
}

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const post = await resolveBlogPost(id);
      if (!post) return errorResponse(NOT_FOUND_MESSAGE, 404);
      return successResponse(post);
    },
  }),
);

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updateBlogPostSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updateBlogPostSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const { publishedAt, coverImage: coverImageRaw, contentImages: contentImagesRaw, additionalImages: additionalImagesRaw, ...rest } = body!;

      const coverImage = coverImageRaw !== undefined
        ? await finalizeStagedMediaObject(coverImageRaw)
        : undefined;
      const contentImages = contentImagesRaw
        ? await finalizeStagedMediaObjectArray(contentImagesRaw)
        : undefined;
      const additionalImages = additionalImagesRaw
        ? await finalizeStagedMediaObjectArray(additionalImagesRaw)
        : undefined;

      const updateData = {
        ...rest,
        ...(coverImage !== undefined && { coverImage }),
        ...(contentImages !== undefined && { contentImages }),
        ...(additionalImages !== undefined && { additionalImages }),
        ...(publishedAt && { publishedAt: new Date(publishedAt) }),
        ...(rest.status === BlogPostStatusValues.PUBLISHED && !publishedAt && { publishedAt: new Date() }),
      };

      // Resolve first: the caller may hold either the doc id or the slug, and
      // `update` only accepts the doc id. Without this a slug-bearing caller
      // wrote to a document that does not exist.
      const existing = await resolveBlogPost(id);
      if (!existing) return errorResponse(NOT_FOUND_MESSAGE, 404);

      const updated = await blogRepository.update(existing.id, updateData);
      return successResponse(updated, "Blog post updated");
    },
  }),
);

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      // 🛑 Resolve before deleting. `delete(slug)` removed nothing and still
      // reported success — a destructive action that silently did not happen.
      const existing = await resolveBlogPost(id);
      if (!existing) return errorResponse(NOT_FOUND_MESSAGE, 404);

      await blogRepository.delete(existing.id);
      return successResponse(null, "Blog post deleted");
    },
  }),
);

export const GET = __GET__g;
export const PATCH = __PATCH__g;
export const DELETE = __DELETE__g;
