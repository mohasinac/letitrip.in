"use client";

import { useQuery } from "@tanstack/react-query";
import { listBlogPostsAction } from "@/actions";
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
export function useBlogPosts(
  params?: string,
  options?: { initialData?: BlogPostsResult },
) {
  const { data, isLoading, error, refetch } = useQuery<BlogPostsResult>({
    queryKey: ["blog", params ?? ""],
    queryFn: async () => {
      const sp = params ? new URLSearchParams(params) : null;
      const result = await listBlogPostsAction({
        page: sp?.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp?.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
        category: sp?.get("category") ?? undefined,
        sorts: sp?.get("sorts") ?? undefined,
      });
      return {
        posts: result.items,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        },
      };
    },
    initialData: options?.initialData,
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
