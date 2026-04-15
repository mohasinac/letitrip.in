"use client";

import { useMutation } from "@tanstack/react-query";
import {
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
  const query = createAdminListQuery<{
    posts: BlogPostDocument[];
    meta: BlogListMeta;
  }>({
    queryKey: ["admin", "blog"],
    sieveParams,
    endpoint: "/api/admin/blog",
    defaultPageSize: 200,
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

