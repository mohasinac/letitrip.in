/**
 * Blog Post by Slug API Route
 * GET /api/blog/[slug] — Get a single published blog post
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { blogRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors/error-handler";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

/**
 * GET /api/blog/[slug]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    const post = await blogRepository.findBySlug(slug);

    if (!post || post.status !== "published") {
      throw new NotFoundError(ERROR_MESSAGES.BLOG.NOT_FOUND);
    }

    // Increment views (fire-and-forget)
    blogRepository.incrementViews(post.id).catch(() => {});

    // Fetch related posts
    const related = await blogRepository.findRelated(post.category, post.id, 3);

    return successResponse({ post, related });
  } catch (error) {
    return handleApiError(error);
  }
}
