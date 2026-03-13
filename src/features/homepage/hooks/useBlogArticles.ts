"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getFeaturedBlogPostsAction,
  getLatestBlogPostsAction,
} from "@/actions";
import type { BlogPostDocument } from "@/db/schema";

const MIN_BLOG_COUNT = 4;

export interface BlogListResult {
  posts: BlogPostDocument[];
  meta: { total: number; page: number; pageSize: number };
}

/**
 * useBlogArticles
 * Fetches featured blog posts for the homepage, falling back to latest posts
 * when there aren't enough featured ones to fill the section.
 */
export function useBlogArticles() {
  return useQuery<BlogListResult>({
    queryKey: ["blog", "featured"],
    queryFn: async () => {
      const featured = await getFeaturedBlogPostsAction(MIN_BLOG_COUNT);

      if (featured.length >= MIN_BLOG_COUNT) {
        return {
          posts: featured,
          meta: { total: featured.length, page: 1, pageSize: MIN_BLOG_COUNT },
        };
      }

      const remaining = MIN_BLOG_COUNT - featured.length;
      const latest = await getLatestBlogPostsAction(
        remaining + featured.length,
      );

      const existingIds = new Set(featured.map((p) => p.id));
      const filler = latest
        .filter((p) => !existingIds.has(p.id))
        .slice(0, remaining);

      const posts = [...featured, ...filler];
      return {
        posts,
        meta: { total: posts.length, page: 1, pageSize: posts.length },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
