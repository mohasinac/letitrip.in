/**
 * CategoryCard
 *
 * Displays a single category with optional image, checkbox,
 * featured star, name, product count, and an amber "View" label.
 */

"use client";

import { Star, Tag, Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { CategoryDocument } from "@/db/schema";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Card, Heading, MediaImage, Span, Text, TextLink } from "@/components";

const { themed, flex } = THEME_CONSTANTS;

interface CategoryCardProps {
  category: CategoryDocument;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  className?: string;
}

export function CategoryCard({
  category,
  selectable = false,
  selected = false,
  onSelect,
  className = "",
}: CategoryCardProps) {
  const t = useTranslations("categories");
  const { name, slug, display, metrics, isFeatured, isBrand } = category;
  const productCount = metrics?.totalProductCount ?? metrics?.productCount ?? 0;

  const href = `${ROUTES.PUBLIC.CATEGORIES}/${slug}`;

  return (
    <TextLink
      href={href}
      className={`block group/card focus:outline-none ${className}`}
    >
      <Card
        className={`h-full overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200${
          selected ? " ring-2 ring-indigo-500" : ""
        }`}
      >
        {/* ── Image area ── */}
        <div className="group/img relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-slate-800 flex-shrink-0">
          {display?.coverImage ? (
            <MediaImage
              src={display.coverImage}
              alt={name}
              size="card"
              className="group-hover/img:scale-105 transition-transform duration-300"
            />
          ) : display?.icon ? (
            <div
              className={`${flex.center} w-full h-full`}
              style={{
                background:
                  display.color ?? "linear-gradient(135deg,#6366f1,#a855f7)",
              }}
            >
              <Span className="text-5xl leading-none">{display.icon}</Span>
            </div>
          ) : (
            <div
              className={`${flex.center} w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600`}
            >
              <Span className="text-4xl font-bold text-white/90 select-none">
                {name.charAt(0).toUpperCase()}
              </Span>
            </div>
          )}

          {/* Checkbox — top left */}
          {selectable && (
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                aria-label={`Select ${name}`}
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(category.id, e.target.checked);
                }}
                className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-white/80"
              />
            </div>
          )}

          {/* Featured star — top right */}
          {isFeatured && (
            <div
              className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-yellow-400 ${flex.center} shadow`}
            >
              <Star
                className="w-4 h-4 text-yellow-900 fill-yellow-900"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Type badge — bottom left */}
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <Span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isBrand
                  ? "bg-amber-600/90 text-white"
                  : "bg-indigo-600/90 text-white"
              }`}
            >
              {isBrand ? (
                <Tag className="w-3 h-3 flex-shrink-0" />
              ) : (
                <Bookmark className="w-3 h-3 flex-shrink-0" />
              )}
              {isBrand ? t("brandBadge") : t("categoryBadge")}
            </Span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col flex-1 p-4 gap-1">
          <Heading
            level={3}
            className={`text-base font-semibold ${themed.textPrimary} line-clamp-1 group-hover/img:text-indigo-600 dark:group-hover/img:text-indigo-400 transition-colors`}
          >
            {name}
          </Heading>

          <Text size="sm" variant="secondary" className="flex-1">
            {t("productsCount", { count: productCount })}
          </Text>

          {/* Amber "View" label */}
          <div className={`${flex.end} mt-2`}>
            <Span
              aria-hidden="true"
              className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white group-hover/img:bg-amber-600 transition-colors"
            >
              {t("view")}
            </Span>
          </div>
        </div>
      </Card>
    </TextLink>
  );
}
