"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { BlogPost, BlogListResponse } from "@mohasinac/feat-blog";

const MIN_BLOG_COUNT = 4;

export interface BlogListResult {
  posts: BlogPost[];
  meta: { total: number; page: number; pageSize: number };
}

/**
 * useBlogArticles
 * Fetches featured blog posts for the homepage, falling back to latest posts
 * when there aren't enough featured ones to fill the section.
 * Uses GET /api/blog with featured=true and sort by publishedAt.
 */
export function useBlogArticles() {
  return useQuery<BlogListResult>({
    queryKey: ["blog", "featured"],
    queryFn: async () => {
      const featuredResult = await apiClient.get<BlogListResponse>(
        `/api/blog?featured=true&perPage=${MIN_BLOG_COUNT}`,
      );
      const featured = featuredResult.posts;

      if (featured.length >= MIN_BLOG_COUNT) {
        return featuredResult;
      }

      const remaining = MIN_BLOG_COUNT - featured.length;
      const latestResult = await apiClient.get<BlogListResponse>(
        `/api/blog?sort=-publishedAt&perPage=${MIN_BLOG_COUNT + remaining}`,
      );

      const existingIds = new Set(featured.map((p) => p.id));
      const filler = latestResult.posts
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
