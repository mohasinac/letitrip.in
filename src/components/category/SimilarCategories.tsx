"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { logError } from "@/lib/firebase-error-logger";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";
import { ChevronLeft, ChevronRight, Folder, Grid3X3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SimilarCategoriesProps {
  categorySlug: string;
  categoryName?: string;
  limit?: number;
}

export function SimilarCategories({
  categorySlug,
  categoryName = "this category",
  limit = 10,
}: SimilarCategoriesProps) {
  const [categories, setCategories] = useState<CategoryFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadSimilarCategories();
  }, [categorySlug]);

  const loadSimilarCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getSimilarCategories(
        categorySlug,
        limit,
      );
      setCategories(response || []);
    } catch (error) {
      logError(error as Error, {
        component: "SimilarCategories.loadCategories",
        metadata: { categorySlug, limit },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("similar-categories-scroll");
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    const newPosition =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  };

  const updateScrollButtons = () => {
    const container = document.getElementById("similar-categories-scroll");
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.offsetWidth - 10,
    );
  };

  useEffect(() => {
    const container = document.getElementById("similar-categories-scroll");
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    globalThis.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      globalThis.removeEventListener("resize", updateScrollButtons);
    };
  }, [categories]);

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Similar Categories
          </h3>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Similar Categories
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Folder className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
            No similar categories available
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            View All Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <Grid3X3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Similar Categories
        </h3>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        <div
          id="similar-categories-scroll"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex-shrink-0 w-40 group/card"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
                  {category.image ? (
                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
                      fill
                      objectFit="cover"
                      className="group-hover/card:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Folder className="w-10 h-10 text-blue-400 dark:text-blue-500" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {category.productCount || 0} products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
