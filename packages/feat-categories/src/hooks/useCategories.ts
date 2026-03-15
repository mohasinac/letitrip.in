"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { CategoryItem, CategoriesResponse } from "../types";

interface UseCategoriesListOptions {
  initialData?: CategoriesResponse;
  enabled?: boolean;
}

export function useCategoriesList(opts?: UseCategoriesListOptions) {
  const query = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<CategoriesResponse>("/api/categories"),
    initialData: opts?.initialData,
    enabled: opts?.enabled,
    staleTime: 5 * 60 * 1000, // 5 min — categories change infrequently
  });

  return {
    categories: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

interface UseCategoryDetailOptions {
  initialData?: CategoryItem;
  enabled?: boolean;
}

export function useCategoryDetail(
  slug: string,
  opts?: UseCategoryDetailOptions,
) {
  const categoryQuery = useQuery<CategoryItem>({
    queryKey: ["categories", slug],
    queryFn: () => apiClient.get<CategoryItem>(`/api/categories/${slug}`),
    initialData: opts?.initialData,
    enabled: opts?.enabled !== false && !!slug,
  });

  const childrenQuery = useQuery<CategoryItem[]>({
    queryKey: ["categories", slug, "children"],
    queryFn: () =>
      apiClient.get<CategoryItem[]>(`/api/categories/${slug}/children`),
    enabled: !!categoryQuery.data?.id,
  });

  return {
    category: categoryQuery.data,
    children: childrenQuery.data ?? [],
    isLoading: categoryQuery.isLoading,
    childrenLoading: childrenQuery.isLoading,
    error: categoryQuery.error,
  };
}
