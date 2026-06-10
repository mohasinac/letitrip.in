import { withProviders } from "@/providers.config";
import {
  blogRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
  BlogPostStatusValues,
} from "@mohasinac/appkit";

function toSerializable(doc: any) {
  return {
    ...doc,
    publishedAt: doc.publishedAt?.toISOString?.() ?? doc.publishedAt ?? null,
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
    updatedAt: doc.updatedAt?.toISOString?.() ?? doc.updatedAt,
  };
}

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ params }) => {
      const slug = (params as { slug: string }).slug;
      const post = await blogRepository.findBySlug(slug).catch(() => null);
      if (!post || post.status !== BlogPostStatusValues.PUBLISHED) {
        return errorResponse("Blog post not found", 404);
      }
      blogRepository.incrementViews(post.id).catch(() => {}); // audit-silent-catch-ok: view-count bump is best-effort analytics
      const related = await blogRepository
        .findRelated(post.category, post.id, 3)
        .catch(() => []);
      return successResponse({
        post: toSerializable(post),
        related: related.map(toSerializable),
      });
    },
  }),
);
