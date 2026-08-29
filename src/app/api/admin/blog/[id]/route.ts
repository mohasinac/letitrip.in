import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  blogRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
  finalizeStagedMediaObject,
  finalizeStagedMediaObjectArray,
  BlogPostStatusValues,
} from "@mohasinac/appkit";
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

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const post = await blogRepository.findBySlug(id);
      if (!post) return errorResponse("Blog post not found", 404);
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

      const updated = await blogRepository.update(id, updateData);
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
      await blogRepository.delete(id);
      return successResponse(null, "Blog post deleted");
    },
  }),
);

export const GET = __GET__g;
export const PATCH = __PATCH__g;
export const DELETE = __DELETE__g;
