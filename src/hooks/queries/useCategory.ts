"use client";

/**
 * Category Query Hooks
 *
 * React Query hooks for category data fetching.
 */

import { queryKeys } from "@/lib/react-query";
import { categoriesService } from "@/services/categories.service";
import type {
  CategoryFE,
  CategoryTreeNodeFE,
} from "@/types/frontend/category.types";
import type { PaginatedResponseFE } from "@/types/shared/common.types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

/**
 * Fetch all categories
 *
 * @param filters - Optional filters for categories
 * @param options - React Query options
 * @returns Query result with paginated categories
 *
 * @example
 * const { data } = useCategories();
 */
export function useCategories(
  filters?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<PaginatedResponseFE<CategoryFE>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<PaginatedResponseFE<CategoryFE>>({
    queryKey: [...queryKeys.categories.all, filters],
    queryFn: () => categoriesService.list(filters),
    // Categories rarely change, cache longer
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}

/**
 * Fetch category tree (hierarchical structure)
 *
 * @param parentId - Optional parent category ID
 * @param options - React Query options
 * @returns Query result with category tree
 *
 * @example
 * const { data: tree } = useCategoryTree();
 */
export function useCategoryTree(
  parentId?: string,
  options?: Omit<UseQueryOptions<CategoryTreeNodeFE[]>, "queryKey" | "queryFn">
) {
  return useQuery<CategoryTreeNodeFE[]>({
    queryKey: queryKeys.categories.tree(),
    queryFn: () => categoriesService.getTree(parentId),
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch category by ID
 *
 * @param id - Category ID
 * @param options - React Query options
 * @returns Query result with category data
 */
export function useCategory(
  id: string | undefined,
  options?: Omit<UseQueryOptions<CategoryFE>, "queryKey" | "queryFn">
) {
  return useQuery<CategoryFE>({
    queryKey: queryKeys.categories.detail(id!),
    queryFn: () => categoriesService.getById(id!),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}
