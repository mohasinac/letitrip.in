"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
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

  const query = useApiQuery<{ posts: BlogPostDocument[]; meta: BlogListMeta }>({
    queryKey: ["admin", "blog", sieveParams],
    queryFn: () => adminService.listBlog(filtersParam),
  });

  const createMutation = useApiMutation<BlogPostDocument, unknown>({
    mutationFn: (data) => adminService.createBlogPost(data),
  });

  const updateMutation = useApiMutation<
    BlogPostDocument,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) => adminService.updateBlogPost(id, data),
  });

  const deleteMutation = useApiMutation<void, string>({
    mutationFn: (id) => adminService.deleteBlogPost(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
