"use client";

import { useApiQuery } from "@/hooks";
import { categoryService } from "@/services";
import type { CategoryDocument } from "@/db/schema";

interface CategoryResponse {
  data: CategoryDocument;
}

interface ChildrenResponse {
  success: boolean;
  data: CategoryDocument[];
}

/**
 * useCategoryDetail
 *
 * Fetches a single category by slug and its direct children subcategories.
 * Used by the category detail page header + subcategory scroller.
 */
export function useCategoryDetail(slug: string) {
  /* ---- Fetch the category by slug ---- */
  const {
    data: catData,
    isLoading: catLoading,
    error: catError,
  } = useApiQuery<CategoryResponse>({
    queryKey: ["categories", "slug", slug],
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
  });

  const category = catData?.data ?? null;

  /* ---- Fetch direct children of this category ---- */
  const {
    data: childrenData,
    isLoading: childrenLoading,
  } = useApiQuery<ChildrenResponse>({
    queryKey: ["categories", "children", category?.id ?? ""],
    queryFn: () => categoryService.getChildren(category!.id),
    enabled: !!category?.id,
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
