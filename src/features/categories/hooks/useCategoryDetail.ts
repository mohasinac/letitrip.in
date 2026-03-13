"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlugAction, getCategoryChildrenAction } from "@/actions";
import type { CategoryDocument } from "@/db/schema";

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
  } = useQuery<CategoryDocument | null>({
    queryKey: ["categories", "slug", slug],
    queryFn: () => getCategoryBySlugAction(slug),
    enabled: !!slug,
    initialData: options?.initialCategory ?? undefined,
  });

  const category = catData ?? null;

  /* ---- Fetch direct children of this category ---- */
  const { data: childrenData, isLoading: childrenLoading } = useQuery<
    CategoryDocument[]
  >({
    queryKey: ["categories", "children", category?.id ?? ""],
    queryFn: () => getCategoryChildrenAction(category!.id),
    enabled: !!category?.id,
    initialData: options?.initialChildren,
  });

  const children = childrenData ?? [];

  return {
    category,
    children,
    isLoading: catLoading,
    childrenLoading,
    error: catError,
  };
}
