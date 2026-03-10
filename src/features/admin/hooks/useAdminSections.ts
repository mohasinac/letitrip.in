"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { homepageSectionsService } from "@/services";
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
    mutationFn: (data) => homepageSectionsService.create(data),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) => homepageSectionsService.update(id, data),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => homepageSectionsService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
