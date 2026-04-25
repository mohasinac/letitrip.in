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

const mediaFieldSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video", "file"]),
  alt: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
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
  readTimeMinutes: z.number().int().min(1).optional(),
  publishedAt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const post = await blogRepository.findBySlug(id).catch(() => null);
      if (!post) return errorResponse("Blog post not found", 404);
      return successResponse(post);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateBlogPostSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
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

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await blogRepository.delete(id);
      return successResponse(null, "Blog post deleted");
    },
  }),
);
