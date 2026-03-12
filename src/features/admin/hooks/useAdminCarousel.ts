"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { carouselService } from "@/services";
import {
  createCarouselSlideAction,
  updateCarouselSlideAction,
  deleteCarouselSlideAction,
} from "@/actions";
import type { CarouselSlide } from "../components";

/**
 * useAdminCarousel
 * Fetches the carousel slides list and exposes create, update, and delete mutations.
 */
export function useAdminCarousel() {
  const query = useQuery<CarouselSlide[]>({
    queryKey: ["carousel", "list"],
    queryFn: () => carouselService.list(),
  });

  const createMutation = useMutation<unknown, Error, unknown>({
    mutationFn: (data) =>
      createCarouselSlideAction(
        data as Parameters<typeof createCarouselSlideAction>[0],
      ),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) =>
      updateCarouselSlideAction(
        id,
        data as Parameters<typeof updateCarouselSlideAction>[1],
      ),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => deleteCarouselSlideAction(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
