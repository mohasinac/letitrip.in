/**
 * CategoryGrid
 *
 * Renders a responsive grid of CategoryCards.
 */

"use client";

import { useTranslations } from "next-intl";
import type { CategoryItem } from "@mohasinac/appkit/features/categories";
import { THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Span, Stack } from "@mohasinac/appkit/ui";
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
      <Stack align="center" className="py-20 text-center justify-center">
        <Span className="text-6xl mb-4">🗂️</Span>
        <Heading level={3}>{t("noCategories")}</Heading>
        <Text variant="secondary" size="sm" className="mt-1">
          {t("noCategoriesSubtitle")}
        </Text>
      </Stack>
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

