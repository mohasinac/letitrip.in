/**
 * CategoryGrid
 *
 * Renders a responsive grid of CategoryCards.
 */

"use client";

import { CategoryDocument } from "@/db/schema";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { CategoryCard } from "./CategoryCard";

const { spacing } = THEME_CONSTANTS;

interface CategoryGridProps {
  categories: CategoryDocument[];
  className?: string;
}

export function CategoryGrid({
  categories,
  className = "",
}: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">🗂️</span>
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {UI_LABELS.CATEGORIES_PAGE.NO_CATEGORIES}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {UI_LABELS.CATEGORIES_PAGE.NO_CATEGORIES_SUBTITLE}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${spacing.gap.md} ${className}`}
    >
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

export default CategoryGrid;
