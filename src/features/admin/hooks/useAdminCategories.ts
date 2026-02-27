"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { categoryService } from "@/services";
import type { Category } from "@/components";

/**
 * useAdminCategories
 * Fetches the full category tree and exposes create, update, and delete mutations.
 */
export function useAdminCategories() {
  const query = useApiQuery<{ categories: Category[] }>({
    queryKey: ["categories", "tree"],
    queryFn: () => categoryService.list("view=tree"),
  });

  const createMutation = useApiMutation<unknown, unknown>({
    mutationFn: (data) => categoryService.create(data),
  });

  const updateMutation = useApiMutation<unknown, { id: string; data: unknown }>(
    {
      mutationFn: ({ id, data }) => categoryService.update(id, data),
    },
  );

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) => categoryService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
