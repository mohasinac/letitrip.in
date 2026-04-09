/**
 * CategoryGrid
 *
 * Renders a responsive grid of CategoryCards.
 */

"use client";

import { useTranslations } from "next-intl";
import type { CategoryItem } from "@mohasinac/appkit/features/categories";
import { THEME_CONSTANTS } from "@/constants";
import { Heading, Span, Text } from "@/components";
import { CategoryCard } from "@/components";

const { grid } = THEME_CONSTANTS;

interface CategoryGridProps {
  categories: CategoryItem[];
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
    <div className={`${grid.categoryCards} ${className}`}>
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
