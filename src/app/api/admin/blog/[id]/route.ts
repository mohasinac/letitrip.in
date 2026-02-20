/**
 * Admin Blog Post by ID API Route
 * GET    /api/admin/blog/[id] — Get a single blog post
 * PATCH  /api/admin/blog/[id] — Update a blog post
 * DELETE /api/admin/blog/[id] — Delete a blog post
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { blogRepository } from "@/repositories";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

type RouteContext = { params: Promise<{ id: string }> };

const updateBlogPostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z
    .enum(["news", "tips", "guides", "updates", "community"])
    .optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  coverImage: z.string().optional(),
  authorName: z.string().optional(),
  authorAvatar: z.string().optional(),
  readTimeMinutes: z.number().int().min(1).optional(),
  publishedAt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

/**
 * GET /api/admin/blog/[id]
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request: _request }, ctx?: RouteContext) => {
    const { id } = await ctx!.params;

    const post = await blogRepository.findById(id);
    if (!post) throw new NotFoundError(ERROR_MESSAGES.BLOG.NOT_FOUND);

    return successResponse(post);
  },
});

/**
 * PATCH /api/admin/blog/[id]
 */
export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  schema: updateBlogPostSchema,
  handler: async ({ body }, ctx?: RouteContext) => {
    const { id } = await ctx!.params;

    const existing = await blogRepository.findById(id);
    if (!existing) throw new NotFoundError(ERROR_MESSAGES.BLOG.NOT_FOUND);

    const { publishedAt, ...rest } = body!;

    const updateData: Record<string, unknown> = { ...rest };

    if (publishedAt) {
      updateData.publishedAt = new Date(publishedAt);
    } else if (body!.status === "published" && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    serverLogger.info("Updating blog post", { id, title: body!.title });

    const updated = await blogRepository.update(id, updateData);

    return successResponse(updated, SUCCESS_MESSAGES.BLOG.UPDATED);
  },
});

/**
 * DELETE /api/admin/blog/[id]
 */
export const DELETE = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request: _request }, ctx?: RouteContext) => {
    const { id } = await ctx!.params;

    const existing = await blogRepository.findById(id);
    if (!existing) throw new NotFoundError(ERROR_MESSAGES.BLOG.NOT_FOUND);

    serverLogger.info("Deleting blog post", { id, title: existing.title });

    await blogRepository.delete(id);

    return successResponse(null, SUCCESS_MESSAGES.BLOG.DELETED);
  },
});
