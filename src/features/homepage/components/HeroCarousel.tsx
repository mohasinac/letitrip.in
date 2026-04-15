"use client";

import { useRouter } from "@/i18n/navigation";
import { HeroCarousel as HeroCarouselBase } from "@mohasinac/appkit/features/homepage";
import type { CarouselSlide } from "@mohasinac/appkit/features/homepage";
import type { CarouselSlideDocument } from "@/db/schema";

interface HeroCarouselProps {
  initialSlides?: CarouselSlideDocument[];
}

/**
 * Thin app-layer wrapper - supplies the locale-aware router to the package component.
 */
export function HeroCarousel({ initialSlides }: HeroCarouselProps = {}) {
  const router = useRouter();
  return (
    <HeroCarouselBase
      initialSlides={initialSlides as CarouselSlide[] | undefined}
      push={router.push}
    />
  );
}

