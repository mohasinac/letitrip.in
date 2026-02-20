/**
 * Admin Blog API Route
 * GET  /api/admin/blog — List all blog posts
 * POST /api/admin/blog — Create a new blog post
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
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
 * GET /api/admin/blog — List all blog posts
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request: _request }) => {
    serverLogger.info("Admin blog posts list requested");

    const posts = await blogRepository.findAll();

    const published = posts.filter((p) => p.status === "published").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const featured = posts.filter((p) => p.isFeatured).length;

    return successResponse({
      posts,
      meta: {
        total: posts.length,
        published,
        drafts,
        featured,
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
