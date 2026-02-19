/**
 * CategoryCard
 *
 * Displays a single category with its icon/image, name, description,
 * product count, and link to browse products.
 */

"use client";

import Link from "next/link";
import { CategoryDocument } from "@/db/schema";
import { UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";
import { Badge } from "@/components";

const { themed, borderRadius, spacing } = THEME_CONSTANTS;

interface CategoryCardProps {
  category: CategoryDocument;
  className?: string;
}

/**
 * Maps a hex/named colour or undefined to a Tailwind bg class for the icon box.
 */
function iconBackground(color?: string): string {
  if (!color) return "bg-indigo-100 dark:bg-indigo-900/30";
  // Passthrough for Tailwind colours stored in the DB (e.g. "bg-rose-100")
  if (color.startsWith("bg-")) return color;
  return "bg-indigo-100 dark:bg-indigo-900/30";
}

export function CategoryCard({ category, className = "" }: CategoryCardProps) {
  const { name, slug, description, display, metrics, isFeatured } = category;
  const productCount = metrics?.totalProductCount ?? metrics?.productCount ?? 0;
  const subcategoryCount = category.childrenIds?.length ?? 0;

  const href = `${ROUTES.PUBLIC.CATEGORIES}/${slug}`;

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border ${themed.border} ${themed.bgPrimary} overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${className}`}
    >
      {/* Cover Image */}
      {display?.coverImage ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={display.coverImage}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div
          className={`aspect-video w-full flex items-center justify-center ${iconBackground(display?.color)}`}
        >
          {display?.icon ? (
            <span className="text-5xl">{display.icon}</span>
          ) : (
            <span className="text-5xl">🗂️</span>
          )}
        </div>
      )}

      {/* Body */}
      <div className={`flex flex-col flex-1 ${spacing.padding.md}`}>
        {/* Title + Featured Badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className={`font-semibold ${themed.textPrimary} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1`}
          >
            {name}
          </h3>
          {isFeatured && (
            <Badge variant="info">{UI_LABELS.CATEGORIES_PAGE.FEATURED}</Badge>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className={`text-sm ${themed.textSecondary} line-clamp-2 mb-3`}>
            {description}
          </p>
        )}

        {/* Meta: product / subcategory counts */}
        <div
          className={`mt-auto flex items-center gap-3 text-xs ${themed.textSecondary}`}
        >
          <span>{UI_LABELS.CATEGORIES_PAGE.PRODUCTS_COUNT(productCount)}</span>
          {subcategoryCount > 0 && (
            <>
              <span>·</span>
              <span>
                {UI_LABELS.CATEGORIES_PAGE.SUBCATEGORIES_COUNT(
                  subcategoryCount,
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;
