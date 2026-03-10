"use client";

import { useQuery } from "@tanstack/react-query";
import { carouselService } from "@/services";
import type { CarouselSlideDocument } from "@/db/schema";

/**
 * useHeroCarousel
 * Fetches active carousel slides for the homepage hero.
 * Data is pre-filtered to active slides, sorted by order.
 */
export function useHeroCarousel(options?: {
  initialData?: CarouselSlideDocument[];
}) {
  return useQuery<CarouselSlideDocument[]>({
    queryKey: ["carousel", "active"],
    queryFn: () => carouselService.getActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: options?.initialData,
  });
}
