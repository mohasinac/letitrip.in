"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
import { useTopCategories } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { HorizontalScroller, Heading } from "@/components";
import { formatNumber } from "@/utils";

/** Lucide icon fallback mapped from category slug keywords */
function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const s = (slug ?? "").toLowerCase();
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
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useTopCategories(12);

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
          <div className="flex gap-3 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-none w-40">
                <div
                  className={`aspect-square ${THEME_CONSTANTS.skeleton.image}`}
                />
              </div>
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
            {t("categoriesTitle")}
          </h2>
          <Link
            href={ROUTES.PUBLIC.CATEGORIES}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {tActions("viewAllArrow")}
          </Link>
        </div>

        {/* All screen sizes: unified horizontal scroller */}
        <HorizontalScroller
          items={categories.slice(0, 12)}
          renderItem={(category) => (
            <Link
              href={`/categories/${category.slug}`}
              className={`relative block aspect-square ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} overflow-hidden group hover:scale-105 hover:shadow-xl transition-all duration-300`}
            >
              {category.display?.coverImage ? (
                <Image
                  src={category.display.coverImage}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <CategoryIcon
                    slug={category.slug}
                    className="w-10 h-10 text-white/80"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                <Heading level={3} className="text-white mb-1 line-clamp-2">
                  {category.name}
                </Heading>
                <span className="inline-block self-start bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  {formatNumber(category.metrics?.totalItemCount ?? 0)} products
                </span>
              </div>
            </Link>
          )}
          keyExtractor={(c) => c.id ?? c.slug}
          perView={{ base: 2, sm: 3, lg: 4, xl: 5, "2xl": 6 }}
          gap={12}
          autoScroll={false}
          className="px-5 pb-1"
        />
      </div>
    </section>
  );
}
