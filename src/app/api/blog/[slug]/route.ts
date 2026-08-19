import { withProviders } from "@/providers.config";
import {
  blogRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
  BlogPostStatusValues,
} from "@mohasinac/appkit";
import { safeFireAndForget } from "@mohasinac/appkit/server";

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
      safeFireAndForget(blogRepository.incrementViews(post.id), "blog: incrementViews");
      const [related, relatedByTags, relatedByAuthor] = await Promise.all([
        blogRepository.findRelated(post.category, post.id, 3).catch(() => []),
        blogRepository.findByTagsOverlap(post.tags ?? [], post.id, 3).catch(() => []),
        blogRepository.findByAuthor(post.authorId, post.id, 3).catch(() => []),
      ]);
      return successResponse({
        post: toSerializable(post),
        related: related.map(toSerializable),
        relatedByTags: relatedByTags.map(toSerializable),
        relatedByAuthor: relatedByAuthor.map(toSerializable),
      });
    },
  }),
);