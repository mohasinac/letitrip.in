"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { categoryService } from "@/services";
import type { Category } from "../components";

/**
 * useAdminCategories
 * Fetches the full category tree and exposes create, update, and delete mutations.
 */
export function useAdminCategories() {
  const query = useQuery<{ categories: Category[] }>({
    queryKey: ["categories", "tree"],
    queryFn: () => categoryService.list("view=tree"),
  });

  const createMutation = useMutation<unknown, Error, unknown>({
    mutationFn: (data) => categoryService.create(data),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => categoryService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
