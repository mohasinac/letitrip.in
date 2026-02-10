"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import { Button } from "@/components";
import { apiClient } from "@/lib/api-client";

interface Category {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  metrics: {
    totalItemCount: number;
  };
}

export function TopCategoriesSection() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useApiQuery<Category[]>({
    queryKey: ["categories", "featured"],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.CATEGORIES.LIST}?featured=true&maxDepth=1`,
      ),
  });

  const categories = data?.slice(0, 9) || []; // Max 9 categories to cycle through

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (!isAutoScrolling || categories.length <= 4) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, categories.length - 4);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, categories.length]);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.cool}`}
      >
        <div className="w-full">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 max-w-xs animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  const visibleCategories = categories.slice(currentIndex, currentIndex + 4);

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.cool}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {UI_LABELS.HOMEPAGE.CATEGORIES.TITLE}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(ROUTES.PUBLIC.CATEGORIES)}
          >
            {UI_LABELS.ACTIONS.VIEW_ALL}
          </Button>
        </div>

        {/* Categories Grid */}
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              className={`relative aspect-square ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} overflow-hidden group hover:shadow-xl transition-all`}
              onClick={() => router.push(`/categories/${category.slug}`)}
            >
              {/* Background Image */}
              {category.coverImage ? (
                <Image
                  src={category.coverImage}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                <h3
                  className={`${THEME_CONSTANTS.typography.h6} text-white mb-1 md:mb-2 line-clamp-2`}
                >
                  {category.name}
                </h3>
                <p
                  className={`${THEME_CONSTANTS.typography.small} text-white/80`}
                >
                  {category.metrics.totalItemCount} items
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Progress Indicators */}
        {categories.length > 4 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(Math.ceil(categories.length / 4))].map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / 4) === index
                    ? "bg-blue-600 w-8"
                    : "bg-gray-300 dark:bg-gray-600 w-2 hover:bg-blue-400"
                }`}
                onClick={() => setCurrentIndex(index * 4)}
                aria-label={`Go to category group ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
