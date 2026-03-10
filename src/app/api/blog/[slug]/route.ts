/**
 * Blog Post by Slug API Route
 * GET /api/blog/[slug] — Get a single published blog post
 */

import { blogRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

/**
 * GET /api/blog/[slug]
 */
export const GET = createApiHandler<never, { slug: string }>({
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { slug } = params!;

    const post = await blogRepository.findBySlug(slug);
    if (!post || post.status !== "published") {
      throw new NotFoundError(ERROR_MESSAGES.BLOG.NOT_FOUND);
    }

    // Increment views (fire-and-forget)
    blogRepository.incrementViews(post.id).catch(() => {});

    const related = await blogRepository.findRelated(post.category, post.id, 3);
    return successResponse({ post, related });
  },
});
