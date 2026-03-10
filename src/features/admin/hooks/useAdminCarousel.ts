"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { carouselService } from "@/services";
import type { CarouselSlide } from "../components";

/**
 * useAdminCarousel
 * Fetches the carousel slides list and exposes create, update, and delete mutations.
 */
export function useAdminCarousel() {
  const query = useQuery<{ slides: CarouselSlide[] }>({
    queryKey: ["carousel", "list"],
    queryFn: () => carouselService.list(),
  });

  const createMutation = useMutation<unknown, Error, unknown>({
    mutationFn: (data) => carouselService.create(data),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) => carouselService.update(id, data),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => carouselService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
