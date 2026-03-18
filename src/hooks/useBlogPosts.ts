"use client";

import {
  useBlogPosts as _useBlogPosts,
  type BlogListParams,
  type BlogListResponse,
} from "@mohasinac/feat-blog";

export type { BlogListResponse as BlogPostsResult };

/**
 * Adapter shim — delegates to @mohasinac/feat-blog's useBlogPosts.
 * Accepts the legacy `string` URLSearchParams format for backward compatibility.
 */
export function useBlogPosts(
  params?: string,
  options?: { initialData?: BlogListResponse },
) {
  const parsed: BlogListParams = {};
  if (params) {
    const sp = new URLSearchParams(params);
    const p = sp.get("page");
    if (p) parsed.page = Number(p);
    const ps = sp.get("pageSize") ?? sp.get("perPage");
    if (ps) parsed.perPage = Number(ps);
    const cat = sp.get("category");
    if (cat) parsed.category = cat as BlogListParams["category"];
    const q = sp.get("q");
    if (q) parsed.q = q;
    const sort = sp.get("sort");
    if (sort) parsed.sort = sort;
    const tags = sp.get("tags");
    if (tags) parsed.tags = tags;
    const featured = sp.get("featured");
    if (featured) parsed.featured = featured === "true";
  }

  const result = _useBlogPosts(parsed, options);

  return {
    data: result.meta ? { posts: result.posts, meta: result.meta } : undefined,
    posts: result.posts,
    meta: result.meta,
    isLoading: result.isLoading,
    error: result.error,
  };
}
