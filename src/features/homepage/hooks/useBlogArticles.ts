"use client";

import { useApiQuery } from "@/hooks";
import { blogService } from "@/services";
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
  return useApiQuery<BlogListResult>({
    queryKey: ["blog", "featured"],
    queryFn: async () => {
      const featuredRes = (await blogService.getFeatured(
        MIN_BLOG_COUNT,
      )) as BlogListResult;
      const featured = featuredRes?.posts ?? [];

      if (featured.length >= MIN_BLOG_COUNT) return featuredRes;

      const remaining = MIN_BLOG_COUNT - featured.length;
      const latestRes = (await blogService.getLatest(
        remaining + featured.length,
      )) as BlogListResult;
      const latest = latestRes?.posts ?? [];

      const existingIds = new Set(featured.map((p) => p.id));
      const filler = latest
        .filter((p) => !existingIds.has(p.id))
        .slice(0, remaining);

      return { ...featuredRes, posts: [...featured, ...filler] };
    },
    cacheTTL: 5 * 60 * 1000,
  });
}
