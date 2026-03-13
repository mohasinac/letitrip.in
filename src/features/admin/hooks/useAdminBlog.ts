"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  listAdminBlogAction,
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
} from "@/actions";
import type { BlogPostDocument } from "@/db/schema";

interface BlogListMeta {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  filteredTotal: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * useAdminBlog
 * Fetches blog posts filtered by `statusFilter` and exposes
 * create, update, and delete mutations.
 */
export function useAdminBlog(sieveParams: string) {
  const query = useQuery<{ posts: BlogPostDocument[]; meta: BlogListMeta }>({
    queryKey: ["admin", "blog", sieveParams],
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams || "pageSize=200");
      const result = await listAdminBlogAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : 200,
      });
      const published = result.items.filter(
        (p) => p.status === "published",
      ).length;
      const drafts = result.items.filter((p) => p.status === "draft").length;
      const featured = result.items.filter((p) => p.isFeatured).length;
      return {
        posts: result.items,
        meta: {
          total: result.total,
          published,
          drafts,
          featured,
          filteredTotal: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      };
    },
  });

  const createMutation = useMutation<BlogPostDocument, Error, unknown>({
    mutationFn: (data) =>
      createBlogPostAction(data as Parameters<typeof createBlogPostAction>[0]),
  });

  const updateMutation = useMutation<
    BlogPostDocument,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) =>
      updateBlogPostAction(
        id,
        data as Parameters<typeof updateBlogPostAction>[1],
      ),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => deleteBlogPostAction(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
