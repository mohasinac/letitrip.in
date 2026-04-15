"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions";
import type { CreateCategoryInput } from "@/actions";
import type { Category } from "../components";

/**
 * useAdminCategories
 * Fetches the full category tree and exposes create, update, and delete mutations.
 */
export function useAdminCategories() {
  const query = useQuery<{ categories: Category[] }>({
    queryKey: ["categories", "tree"],
    queryFn: async () => ({
      categories: await apiClient.get<Category[]>(
        API_ENDPOINTS.CATEGORIES.LIST,
      ),
    }),
  });

  const createMutation = useMutation<unknown, Error, CreateCategoryInput>({
    mutationFn: (data) => createCategoryAction(data),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) =>
      updateCategoryAction(
        id,
        data as Parameters<typeof updateCategoryAction>[1],
      ),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => deleteCategoryAction(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}

