import { withProviders } from "@/providers.config";
import {
  blogRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
  BlogPostStatusValues,
} from "@mohasinac/appkit";
import { safeFireAndForget, safeRead } from "@mohasinac/appkit/server";

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
      const post = await blogRepository.findBySlug(slug);
      if (!post || post.status !== BlogPostStatusValues.PUBLISHED) {
        return errorResponse("Blog post not found", 404);
      }
      safeFireAndForget(blogRepository.incrementViews(post.id), "blog: incrementViews");
      // The three related-post rails are supplementary — the post itself is
      // already resolved, so a failed rail degrades to an empty strip rather
      // than a 500, but is recorded as DEGRADED_READ instead of vanishing.
      const [related, relatedByTags, relatedByAuthor] = await Promise.all([
        safeRead(() => blogRepository.findRelated(post.category, post.id, 3), {
          route: "/blog/[slug]",
          key: "blogPosts.findRelated",
          fallback: [],
        }),
        safeRead(
          () => blogRepository.findByTagsOverlap(post.tags ?? [], post.id, 3),
          {
            route: "/blog/[slug]",
            key: "blogPosts.findByTagsOverlap",
            fallback: [],
          },
        ),
        safeRead(() => blogRepository.findByAuthor(post.authorId, post.id, 3), {
          route: "/blog/[slug]",
          key: "blogPosts.findByAuthor",
          fallback: [],
        }),
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