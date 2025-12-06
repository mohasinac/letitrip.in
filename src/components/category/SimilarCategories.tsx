/**
 * @fileoverview Similar Categories Section (Using FeaturedSection Pattern)
 * @module src/components/category/SimilarCategories
 * @description Displays similar categories with image cards
 *
 * @refactored 2025-12-06 - Migrated to FeaturedSection pattern (~280 lines saved)
 * @pattern FeaturedSection<CategoryFE>
 */

"use client";

import { FeaturedSection } from "@/components/common/FeaturedSection";
import OptimizedImage from "@/components/common/OptimizedImage";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";
import { Folder } from "lucide-react";
import Link from "next/link";

interface SimilarCategoriesProps {
  categorySlug: string;
  categoryName?: string;
  limit?: number;
}

/**
 * Displays similar categories
 * Excludes current category
 */
export function SimilarCategories({
  categorySlug,
  categoryName = "this category",
  limit = 10,
}: SimilarCategoriesProps) {
  return (
    <FeaturedSection<CategoryFE>
      title={`Similar to ${categoryName}`}
      icon={Folder}
      fetchData={async () => {
        return await categoriesService.list({
          filters: `Slug!=${categorySlug},IsActive==true`,
          sorts: "-ItemCount",
          page: 1,
          pageSize: limit,
        });
      }}
      renderItem={(category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className="group block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all hover:shadow-md p-4"
        >
          <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            {category.image ? (
              <OptimizedImage
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Folder className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              </div>
            )}
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {category.itemCount || 0} items
          </p>
        </Link>
      )}
      emptyMessage="No similar categories found"
      columns={{ default: 2, sm: 3, md: 4, lg: 5 }}
    />
  );
}

export default SimilarCategories;
