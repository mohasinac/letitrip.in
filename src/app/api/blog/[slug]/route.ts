import { withProviders } from "@/providers.config";
import {
  blogRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { BlogPostStatusValues } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ params }) => {
      const slug = (params as { slug: string }).slug;
      const post = await blogRepository.findBySlug(slug).catch(() => null);
      if (!post || post.status !== BlogPostStatusValues.PUBLISHED) {
        return errorResponse("Blog post not found", 404);
      }
      blogRepository.incrementViews(post.id).catch(() => {});
      return successResponse(post);
    },
  }),
);
