"use client";

import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";

export interface CategoryHeaderProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  parentCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  className?: string;
}

/**
 * CategoryHeader Component
 *
 * Displays category banner with name, image, description, and navigation.
 * Used on category detail pages.
 *
 * Features:
 * - Large banner with category image
 * - Category name and description
 * - Product count badge
 * - Parent category breadcrumb link
 * - Responsive design
 *
 * @example
 * ```tsx
 * <CategoryHeader
 *   id="cat123"
 *   name="Electronics"
 *   slug="electronics"
 *   description="Browse our electronics collection"
 *   image="/categories/electronics.jpg"
 *   productCount={1250}
 *   parentCategory={{ id: "root", name: "All Categories", slug: "all" }}
 * />
 * ```
 */
export function CategoryHeader({
  id,
  name,
  slug,
  description,
  image,
  productCount,
  parentCategory,
  className = "",
}: CategoryHeaderProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {parentCategory && (
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <Link
              href="/categories"
              className="hover:text-primary transition-colors"
            >
              All Categories
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/categories/${parentCategory.slug}`}
              className="hover:text-primary transition-colors"
            >
              {parentCategory.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">
              {name}
            </span>
          </nav>
        )}

        {/* Header Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Category Image */}
          {image && (
            <div className="relative w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <OptimizedImage
                src={image}
                alt={name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {name}
              </h1>

              {/* Product Count Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full flex-shrink-0">
                <Package className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {productCount.toLocaleString()}{" "}
                  {productCount === 1 ? "Product" : "Products"}
                </span>
              </div>
            </div>

            {description && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryHeader;
