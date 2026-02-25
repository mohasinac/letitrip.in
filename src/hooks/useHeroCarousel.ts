"use client";

import { useApiQuery } from "./useApiQuery";
import { carouselService } from "@/services";
import type { CarouselSlideDocument } from "@/db/schema";

/**
 * useHeroCarousel
 * Fetches active carousel slides for the homepage hero.
 * Data is pre-filtered to active slides, sorted by order.
 */
export function useHeroCarousel() {
  return useApiQuery<CarouselSlideDocument[]>({
    queryKey: ["carousel", "active"],
    queryFn: () => carouselService.getActive(),
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });
}
