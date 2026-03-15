"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { BlogPost, BlogListResponse, BlogListParams } from "../types";

interface UseBlogPostsOptions {
  initialData?: BlogListResponse;
  enabled?: boolean;
}

export function useBlogPosts(
  params: BlogListParams = {},
  opts?: UseBlogPostsOptions,
) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set("category", params.category);
  if (params.q) searchParams.set("q", params.q);
  if (params.tags) searchParams.set("tags", params.tags);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.perPage) searchParams.set("perPage", String(params.perPage));
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.featured !== undefined)
    searchParams.set("featured", String(params.featured));
  const qs = searchParams.toString();

  const query = useQuery<BlogListResponse>({
    queryKey: ["blog", qs],
    queryFn: () =>
      apiClient.get<BlogListResponse>(`/api/blog${qs ? `?${qs}` : ""}`),
    initialData: opts?.initialData,
    enabled: opts?.enabled,
  });

  return {
    posts: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    page: query.data?.page ?? 1,
    isLoading: query.isLoading,
    error: query.error,
  };
}

interface UseBlogPostOptions {
  initialData?: BlogPost;
  enabled?: boolean;
}

export function useBlogPost(slug: string, opts?: UseBlogPostOptions) {
  const postQuery = useQuery<BlogPost>({
    queryKey: ["blog", slug],
    queryFn: () => apiClient.get<BlogPost>(`/api/blog/${slug}`),
    initialData: opts?.initialData,
    enabled: opts?.enabled !== false && !!slug,
  });

  const relatedQuery = useQuery<BlogPost[]>({
    queryKey: ["blog", slug, "related"],
    queryFn: () => apiClient.get<BlogPost[]>(`/api/blog/${slug}/related`),
    enabled: !!postQuery.data?.id,
  });

  return {
    post: postQuery.data,
    relatedPosts: relatedQuery.data ?? [],
    isLoading: postQuery.isLoading,
    error: postQuery.error,
  };
}
