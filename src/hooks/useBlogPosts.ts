"use client";

import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/services";
import type { BlogPostDocument } from "@/db/schema";

interface BlogPostsResult {
  posts: BlogPostDocument[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

/**
 * useBlogPosts
 * Wraps `blogService.list()` for top-level blog page consumption.
 * Cache key includes the full params string so any filter/sort/page
 * change triggers a new fetch.
 */
export function useBlogPosts(params?: string) {
  const { data, isLoading, error, refetch } = useQuery<BlogPostsResult>({
    queryKey: ["blog", params ?? ""],
    queryFn: () => blogService.list(params),
  });

  return {
    data,
    posts: data?.posts ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
