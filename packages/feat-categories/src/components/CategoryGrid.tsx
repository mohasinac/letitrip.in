import React from "react";
import type { CategoryItem } from "../types";

interface CategoryCardProps {
  category: CategoryItem;
  onClick?: (category: CategoryItem) => void;
  className?: string;
}

export function CategoryCard({
  category,
  onClick,
  className = "",
}: CategoryCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => (e.key === "Enter" || e.key === " ") && onClick(category)
          : undefined
      }
      onClick={onClick ? () => onClick(category) : undefined}
      className={`group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {category.display?.coverImage ? (
        <div className="aspect-video w-full overflow-hidden bg-neutral-100">
          <img
            src={category.display.coverImage}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
      )}
      <div className="p-4">
        <p className="font-semibold text-neutral-900">{category.name}</p>
        {category.description && (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
            {category.description}
          </p>
        )}
        {category.metrics && (
          <p className="mt-2 text-xs text-neutral-400">
            {category.metrics.productCount} items
          </p>
        )}
      </div>
    </div>
  );
}

interface CategoryGridProps {
  categories: CategoryItem[];
  onCategoryClick?: (category: CategoryItem) => void;
  emptyLabel?: string;
  className?: string;
}

export function CategoryGrid({
  categories,
  onCategoryClick,
  emptyLabel = "No categories found",
  className = "",
}: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">{emptyLabel}</p>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className}`}
    >
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} onClick={onCategoryClick} />
      ))}
    </div>
  );
}
