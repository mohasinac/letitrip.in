/**
 * CategoryCard
 *
 * Displays a single category with its icon/image, name, description,
 * product count, and link to browse products.
 */

"use client";

import { useTranslations } from "next-intl";
import { CategoryDocument } from "@/db/schema";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Badge, Heading, MediaImage, Span, Text, TextLink } from "@/components";

const { themed, borderRadius, spacing, flex } = THEME_CONSTANTS;

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
  const t = useTranslations("categories");
  const { name, slug, description, display, metrics, isFeatured } = category;
  const productCount = metrics?.totalProductCount ?? metrics?.productCount ?? 0;
  const subcategoryCount = category.childrenIds?.length ?? 0;

  const href = `${ROUTES.PUBLIC.CATEGORIES}/${slug}`;

  return (
    <TextLink
      href={href}
      className={`group flex flex-col rounded-2xl border ${themed.border} ${themed.bgPrimary} overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${className}`}
    >
      {/* Cover Image — relative container required by MediaImage */}
      <div
        className={`relative aspect-video w-full overflow-hidden ${
          display?.coverImage ? "" : `${flex.center} ${iconBackground(display?.color)}`
        }`}
      >
        {display?.coverImage ? (
          <MediaImage src={display.coverImage} alt={name} size="card" />
        ) : (
          <Span className="text-5xl">{display?.icon ?? "🗂️"}</Span>
        )}
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 ${spacing.padding.md}`}>
        {/* Title + Featured Badge */}
        <div className={`${flex.betweenStart} gap-2 mb-1`}>
          <Heading
            level={3}
            className={`font-semibold ${themed.textPrimary} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1`}
          >
            {name}
          </Heading>
          {isFeatured && (
            <Badge variant="info">{t("featured")}</Badge>
          )}
        </div>

        {/* Description */}
        {description && (
          <Text size="sm" variant="secondary" className="line-clamp-2 mb-3">
            {description}
          </Text>
        )}

        {/* Meta: product / subcategory counts */}
        <div
          className={`mt-auto flex items-center gap-3 text-xs ${themed.textSecondary}`}
        >
          <Span>{t("productsCount", { count: productCount })}</Span>
          {subcategoryCount > 0 && (
            <>
              <Span>·</Span>
              <Span>{t("subcategoriesCount", { count: subcategoryCount })}</Span>
            </>
          )}
        </div>
      </div>
    </TextLink>
  );
}

export default CategoryCard;
