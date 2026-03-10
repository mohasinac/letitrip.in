"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services";
import type { CategoryDocument } from "@/db/schema";

interface CategoryResponse {
  data: CategoryDocument;
}

interface ChildrenResponse {
  success: boolean;
  data: CategoryDocument[];
}

interface UseCategoryDetailOptions {
  initialCategory?: CategoryDocument;
  initialChildren?: CategoryDocument[];
}

/**
 * useCategoryDetail
 *
 * Fetches a single category by slug and its direct children subcategories.
 * Used by the category detail page header + subcategory scroller.
 * `options.initialCategory` / `options.initialChildren` — server-prefetched data.
 */
export function useCategoryDetail(
  slug: string,
  options?: UseCategoryDetailOptions,
) {
  /* ---- Fetch the category by slug ---- */
  const {
    data: catData,
    isLoading: catLoading,
    error: catError,
  } = useQuery<CategoryResponse>({
    queryKey: ["categories", "slug", slug],
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
    initialData: options?.initialCategory
      ? { data: options.initialCategory }
      : undefined,
  });

  const category = catData?.data ?? null;

  /* ---- Fetch direct children of this category ---- */
  const { data: childrenData, isLoading: childrenLoading } =
    useQuery<ChildrenResponse>({
      queryKey: ["categories", "children", category?.id ?? ""],
      queryFn: () => categoryService.getChildren(category!.id),
      enabled: !!category?.id,
      initialData: options?.initialChildren
        ? { success: true, data: options.initialChildren }
        : undefined,
    });

  const children = childrenData?.data ?? [];

  return {
    category,
    children,
    isLoading: catLoading,
    childrenLoading,
    error: catError,
  };
}
