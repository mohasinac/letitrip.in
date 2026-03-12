/**
 * CategoryGrid
 *
 * Renders a responsive grid of CategoryCards.
 */

"use client";

import { useTranslations } from "next-intl";
import { CategoryDocument } from "@/db/schema";
import { THEME_CONSTANTS } from "@/constants";
import { Heading, Span, Text } from "@/components";
import { CategoryCard } from "@/components";

const { spacing } = THEME_CONSTANTS;

interface CategoryGridProps {
  categories: CategoryDocument[];
  className?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function CategoryGrid({
  categories,
  className = "",
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: CategoryGridProps) {
  const t = useTranslations("categories");
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Span className="text-6xl mb-4">🗂️</Span>
        <Heading level={3}>{t("noCategories")}</Heading>
        <Text variant="secondary" size="sm" className="mt-1">
          {t("noCategoriesSubtitle")}
        </Text>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 ${className}`}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          selectable={selectable}
          selected={selectedIds.includes(category.id)}
          onSelect={(id, sel) =>
            onSelectionChange?.(
              sel ? [...selectedIds, id] : selectedIds.filter((x) => x !== id),
            )
          }
        />
      ))}
    </div>
  );
}

export default CategoryGrid;
