"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { adminService } from "@/services";
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
  // sieveParams may be a raw Sieve filter string OR a full query string (from buildSieveParams)
  const filtersParam = sieveParams
    ? sieveParams.startsWith("?")
      ? sieveParams
      : `?${sieveParams}`
    : "?pageSize=200";

  const query = useQuery<{ posts: BlogPostDocument[]; meta: BlogListMeta }>({
    queryKey: ["admin", "blog", sieveParams],
    queryFn: () => adminService.listBlog(filtersParam),
  });

  const createMutation = useMutation<BlogPostDocument, Error, unknown>({
    mutationFn: (data) => adminService.createBlogPost(data),
  });

  const updateMutation = useMutation<
    BlogPostDocument,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) => adminService.updateBlogPost(id, data),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => adminService.deleteBlogPost(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
