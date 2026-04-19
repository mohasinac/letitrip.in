import "@/providers.config";
/**
 * Admin Blog [id] API Route
 * GET    /api/admin/blog/:id � Get a single blog post
 * PATCH  /api/admin/blog/:id � Update a blog post
 * DELETE /api/admin/blog/:id � Delete a blog post
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/server";
import { blogRepository } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";
import {
  finalizeStagedMediaObject,
  finalizeStagedMediaObjectArray,
} from "@mohasinac/appkit/server";
import { BlogPostStatusValues } from "@mohasinac/appkit/server";
type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const post = await blogRepository.findBySlug(id).catch(() => null);
  if (!post) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.BLOG.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: post });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;

  const body = await request.json().catch(() => ({}));
  const parsed = updateBlogPostSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  const { publishedAt, coverImage: coverImageRaw, contentImages: contentImagesRaw, additionalImages: additionalImagesRaw, ...rest } = parsed.data;

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
    ...(rest.status === BlogPostStatusValues.PUBLISHED && !publishedAt && {
      publishedAt: new Date(),
    }),
  };

  serverLogger.info("Updating blog post", { id });
  const updated = await blogRepository.update(id, updateData);
  return Response.json(successResponse(updated, SUCCESS_MESSAGES.BLOG.UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  serverLogger.info("Deleting blog post", { id });
  await blogRepository.delete(id);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.BLOG.DELETED));
}
