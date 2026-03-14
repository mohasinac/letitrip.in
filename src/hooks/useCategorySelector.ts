"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { createCategoryAction, listCategoriesAction } from "@/actions";
import type { CategoryDocument } from "@/db/schema";

interface CategoriesResponse {
  data?: CategoryDocument[];
  items?: CategoryDocument[];
}

/**
 * useCategorySelector
 * Provides a categories list and a create-category mutation.
 * Used by CategorySelectorCreate component.
 *
 * @example
 * const { categories, isLoading, createCategory, isCreating } = useCategorySelector({
 *   onCreated: (id) => onChange(id),
 * });
 */
export function useCategorySelector(options?: {
  onCreated?: (id: string) => void;
  onCreateError?: (err: Error) => void;
}) {
  const {
    data: raw,
    isLoading,
    refetch,
  } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: () => listCategoriesAction() as Promise<CategoriesResponse>,
  });

  const categories: CategoryDocument[] = raw?.data ?? raw?.items ?? [];

  const { mutate: createCategory, isPending: isCreating } = useMutation<
    CategoryDocument,
    Error,
    Record<string, unknown>
  >({
    mutationFn: (data) =>
      createCategoryAction(data as Parameters<typeof createCategoryAction>[0]),
    onSuccess: (res) => {
      refetch();
      const id = res?.id ?? "";
      options?.onCreated?.(id);
    },
    onError: options?.onCreateError,
  });

  return { categories, isLoading, refetch, createCategory, isCreating };
}

/**
 * useCategories
 * Query-only hook: fetches the full category list.
 * Used by the outer CategorySelectorCreate component (display + selection).
 */
export function useCategories() {
  const {
    data: raw,
    isLoading,
    refetch,
  } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: () => listCategoriesAction() as Promise<CategoriesResponse>,
  });
  const categories: CategoryDocument[] = raw?.data ?? raw?.items ?? [];
  return { categories, isLoading, refetch };
}

/**
 * useCreateCategory
 * Mutation-only hook: creates a new category.
 * Used by the inner CreateCategoryContent sub-component.
 */
export function useCreateCategory(options?: {
  onSuccess?: (res: CategoryDocument) => void;
  onError?: (err: Error) => void;
}) {
  return useMutation<CategoryDocument, Error, Record<string, unknown>>({
    mutationFn: (data) =>
      createCategoryAction(data as Parameters<typeof createCategoryAction>[0]),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
