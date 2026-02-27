"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { carouselService } from "@/services";
import type { CarouselSlide } from "@/components";

/**
 * useAdminCarousel
 * Fetches the carousel slides list and exposes create, update, and delete mutations.
 */
export function useAdminCarousel() {
  const query = useApiQuery<{ slides: CarouselSlide[] }>({
    queryKey: ["carousel", "list"],
    queryFn: () => carouselService.list(),
  });

  const createMutation = useApiMutation<unknown, unknown>({
    mutationFn: (data) => carouselService.create(data),
  });

  const updateMutation = useApiMutation<unknown, { id: string; data: unknown }>(
    {
      mutationFn: ({ id, data }) => carouselService.update(id, data),
    },
  );

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) => carouselService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
