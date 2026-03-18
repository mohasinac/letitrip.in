"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";
import {
  createHomepageSectionAction,
  updateHomepageSectionAction,
  deleteHomepageSectionAction,
  reorderHomepageSectionsAction,
} from "@/actions";
import type { HomepageSection } from "../components";

/**
 * useAdminSections
 * Fetches homepage sections and exposes create, update, and delete mutations.
 */
export function useAdminSections() {
  const query = useQuery<HomepageSection[]>({
    queryKey: ["homepage-sections", "list"],
    queryFn: () =>
      apiClient.get<HomepageSection[]>(
        `${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}?includeDisabled=true`,
      ),
  });

  const createMutation = useMutation<unknown, Error, unknown>({
    mutationFn: (data) =>
      createHomepageSectionAction(
        data as Parameters<typeof createHomepageSectionAction>[0],
      ),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) =>
      updateHomepageSectionAction(
        id,
        data as Parameters<typeof updateHomepageSectionAction>[1],
      ),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => deleteHomepageSectionAction(id),
  });

  const reorderMutation = useMutation<unknown, Error, string[]>({
    mutationFn: (sectionIds) => reorderHomepageSectionsAction(sectionIds),
  });

  return {
    ...query,
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation,
  };
}
