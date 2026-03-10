"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { homepageSectionsService } from "@/services";
import {
  createHomepageSectionAction,
  updateHomepageSectionAction,
  deleteHomepageSectionAction,
} from "@/actions";
import type { HomepageSection } from "../components";

/**
 * useAdminSections
 * Fetches homepage sections and exposes create, update, and delete mutations.
 */
export function useAdminSections() {
  const query = useQuery<HomepageSection[]>({
    queryKey: ["homepage-sections", "list"],
    queryFn: () => homepageSectionsService.list(),
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

  return { ...query, createMutation, updateMutation, deleteMutation };
}
