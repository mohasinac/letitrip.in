"use client";

import { useMutation } from "@tanstack/react-query";
import {
  listAdminBlogAction,
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
} from "@/actions";
import { createAdminListQuery } from "./createAdminListQuery";
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

export function useAdminBlog(sieveParams: string) {
  const query = createAdminListQuery<
    BlogPostDocument,
    { posts: BlogPostDocument[]; meta: BlogListMeta }
  >({
    queryKey: ["admin", "blog"],
    sieveParams,
    action: listAdminBlogAction,
    defaultPageSize: 200,
    transform: (result) => {
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
          hasMore: result.hasMore ?? false,
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
