import "@/providers.config";
/**
 * Blog [slug] Public API Route
 * GET /api/blog/:slug — Get a published blog post by slug
 */

import { blogRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { BlogPostStatusValues } from "@mohasinac/appkit";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { slug } = await context.params;

  serverLogger.info("Public blog post requested", { slug });

  const post = await blogRepository.findBySlug(slug).catch(() => null);
  if (!post || post.status !== BlogPostStatusValues.PUBLISHED) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.BLOG.NOT_FOUND },
      { status: 404 },
    );
  }

  // Increment views (fire-and-forget)
  blogRepository.incrementViews(post.id).catch(() => {});

  return Response.json({ success: true, data: post });
}
