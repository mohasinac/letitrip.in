"use client";

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { categoryService } from "@/services";
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
  } = useApiQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: () => categoryService.list(),
  });

  const categories: CategoryDocument[] = raw?.data ?? raw?.items ?? [];

  const { mutate: createCategory, isLoading: isCreating } = useApiMutation<
    { data?: { id?: string }; id?: string },
    Partial<CategoryDocument>
  >({
    mutationFn: (data) => categoryService.create(data),
    onSuccess: (res) => {
      refetch();
      const id = res?.data?.id ?? res?.id ?? "";
      options?.onCreated?.(id);
    },
    onError: options?.onCreateError,
  });

  return { categories, isLoading, refetch, createCategory, isCreating };
}
