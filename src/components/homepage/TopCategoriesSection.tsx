"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  ShoppingBag,
  Shirt,
  Cpu,
  Home,
  Watch,
  Book,
  Dumbbell,
  Car,
  Sparkles,
} from "lucide-react";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import { apiClient } from "@/lib/api-client";
import type { CategoryDocument } from "@/db/schema";

/** Lucide icon fallback mapped from category slug keywords */
function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const s = slug.toLowerCase();
  if (
    s.includes("cloth") ||
    s.includes("fashion") ||
    s.includes("apparel") ||
    s.includes("shirt")
  )
    return <Shirt className={className} />;
  if (
    s.includes("electron") ||
    s.includes("tech") ||
    s.includes("computer") ||
    s.includes("phone")
  )
    return <Cpu className={className} />;
  if (s.includes("home") || s.includes("kitchen") || s.includes("furniture"))
    return <Home className={className} />;
  if (s.includes("watch") || s.includes("accessory") || s.includes("jewel"))
    return <Watch className={className} />;
  if (s.includes("book") || s.includes("stationery"))
    return <Book className={className} />;
  if (s.includes("sport") || s.includes("fitness") || s.includes("gym"))
    return <Dumbbell className={className} />;
  if (s.includes("auto") || s.includes("vehicle") || s.includes("car"))
    return <Car className={className} />;
  if (s.includes("beauty") || s.includes("cosmetic") || s.includes("skin"))
    return <Sparkles className={className} />;
  if (s.includes("bag") || s.includes("shop"))
    return <ShoppingBag className={className} />;
  return <Tag className={className} />;
}

export function TopCategoriesSection() {
  const { data, isLoading } = useApiQuery<CategoryDocument[]>({
    queryKey: ["categories", "featured"],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.CATEGORIES.LIST}?featured=true&maxDepth=1&limit=12`,
      ),
  });

  const categories = data || [];

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.cool}`}
      >
        <div className="w-full">
          <div
            className={`h-8 ${THEME_CONSTANTS.skeleton.base} mb-8 max-w-xs`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square ${THEME_CONSTANTS.skeleton.image}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.cool}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {UI_LABELS.HOMEPAGE.CATEGORIES.TITLE}
          </h2>
          <Link
            href={ROUTES.PUBLIC.CATEGORIES}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {UI_LABELS.ACTIONS.VIEW_ALL_ARROW}
          </Link>
        </div>

        {/* Responsive grid: 2-col mobile Â· 4-col desktop Â· 6-col widescreen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
          {categories.slice(0, 12).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`relative aspect-square ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} overflow-hidden group
                hover:scale-105 hover:shadow-xl transition-all duration-300`}
            >
              {/* Background Image or gradient fallback */}
              {category.display?.coverImage ? (
                <Image
                  src={category.display.coverImage}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1536px) 25vw, 17vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <CategoryIcon
                    slug={category.slug}
                    className="w-12 h-12 text-white/80"
                  />
                </div>
              )}

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-end">
                <h3
                  className={`${THEME_CONSTANTS.typography.h6} text-white mb-1 line-clamp-2`}
                >
                  {category.name}
                </h3>
                {/* Product count badge */}
                <span className="inline-block self-start bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  {(category.metrics?.totalItemCount ?? 0).toLocaleString()}{" "}
                  products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
