"use client";

import { useQuery } from "@tanstack/react-query";
import { getBlogPostBySlugAction, getLatestBlogPostsAction } from "@/actions";
import type { BlogPostDocument } from "@/db/schema";

export interface BlogPostQueryResult {
  post: BlogPostDocument;
  related: BlogPostDocument[];
}

interface UseBlogPostOptions {
  initialData?: BlogPostQueryResult;
}

/**
 * useBlogPost
 * Wraps `blogService.getBySlug(slug)` for the blog post detail view.
 * `options.initialData` — server-prefetched post data; prevents initial client fetch.
 */
export function useBlogPost(slug: string, options?: UseBlogPostOptions) {
  const { data, isLoading, error } = useQuery<BlogPostQueryResult | null>({
    queryKey: ["blog", "post", slug],
    queryFn: async () => {
      const [post, related] = await Promise.all([
        getBlogPostBySlugAction(slug),
        getLatestBlogPostsAction(4),
      ]);
      if (!post) return null;
      return { post, related: related.filter((r) => r.slug !== slug) };
    },
    initialData: options?.initialData,
  });

  return {
    post: data?.post ?? null,
    related: data?.related ?? [],
    isLoading,
    error,
  };
}
