"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { homepageSectionsService } from "@/services";
import type { HomepageSection } from "../components";

/**
 * useAdminSections
 * Fetches homepage sections and exposes create, update, and delete mutations.
 */
export function useAdminSections() {
  const query = useApiQuery<HomepageSection[]>({
    queryKey: ["homepage-sections", "list"],
    queryFn: () => homepageSectionsService.list(),
  });

  const createMutation = useApiMutation<unknown, unknown>({
    mutationFn: (data) => homepageSectionsService.create(data),
  });

  const updateMutation = useApiMutation<unknown, { id: string; data: unknown }>(
    {
      mutationFn: ({ id, data }) => homepageSectionsService.update(id, data),
    },
  );

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) => homepageSectionsService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
