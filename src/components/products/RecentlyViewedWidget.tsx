/**
 * @fileoverview React Component
 * @module src/components/products/RecentlyViewedWidget
 * @description This file contains the RecentlyViewedWidget component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { useViewingHistory } from "@/contexts/ViewingHistoryContext";
import { formatPrice } from "@/lib/price.utils";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

/**
 * RecentlyViewedWidgetProps interface
 * 
 * @interface
 * @description Defines the structure and contract for RecentlyViewedWidgetProps
 */
interface RecentlyViewedWidgetProps {
  /** Maximum items to show */
  limit?: number;
  /** Title for the section */
  title?: string;
  /** Exclude a specific product ID (useful on product pages) */
  excludeId?: string;
  /** Show link to full history page */
  showViewAll?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Function: Recently Viewed Widget
 */
/**
 * Performs recently viewed widget operation
 *
 * @returns {any} The recentlyviewedwidget result
 *
 * @example
 * RecentlyViewedWidget();
 */

/**
 * Performs recently viewed widget operation
 *
 * @returns {any} The recentlyviewedwidget result
 *
 * @example
 * RecentlyViewedWidget();
 */

export function RecentlyViewedWidget({
  limit = 8,
  title = "Recently Viewed",
  excludeId,
  showViewAll = true,
  className = "",
}: RecentlyViewedWidgetProps) {
  const { recentlyViewed } = useViewingHistory();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter out excluded ID and limit
  /**
 * Performs items operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The items result
 *
 */
const items = recentlyViewed
    .filter((item) => item.id !== excludeId)
    .slice(0, limit);

  // Don't render if no items
  if (items.length === 0) return null;

  /**
   * Performs scroll operation
   *
   * @param {"left" | "right"} direction - The direction
   *
   * @returns {any} The scroll result
   */

  /**
   * Performs scroll operation
   *
   * @param {"left" | "right"} direction - The direction
   *
   * @returns {any} The scroll result
   */

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const container = scrollContainerRef.current;

    container.scrollBy({
      /** Left */
      left: direction === "left" ? -scrollAmount : scrollAmount,
      /** Behavior */
      behavior: "smooth",
    });
  };

  return (
    <section className={`py-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {showViewAll && (
            <Link
              href="/user/history"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View All
            </Link>
          )}

          {/* Scroll buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="flex-shrink-0 w-36 group"
          >
            {/* Image */}
            <div className="relative w-36 h-36 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-2">
              <OptimizedImage
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="144px"
              />
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </h3>

            {/* Price */}
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {formatPrice(item.price)}
            </p>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          /** Display */
          display: none;
        }
      `}</style>
    </section>
  );
}
