"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  productCount: number;
}

export interface SubcategoryGridProps {
  subcategories: Subcategory[];
  parentSlug: string;
  loading?: boolean;

  // Injection props
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
  }>;
  icons?: {
    search?: ReactNode;
    chevronLeft?: ReactNode;
    chevronRight?: ReactNode;
    package?: ReactNode;
  };
  className?: string;
}

/**
 * SubcategoryGrid Component (Library Version)
 *
 * Framework-agnostic scrollable horizontal grid for child categories.
 *
 * Features:
 * - Horizontal scroll with arrow navigation
 * - Search/filter subcategories
 * - Sort by name or product count
 * - Product count badges
 * - Category images
 * - Responsive grid
 * - Component injection for Link and Image
 *
 * @example
 * ```tsx
 * <SubcategoryGrid
 *   subcategories={subcategories}
 *   parentSlug="electronics"
 *   LinkComponent={NextLink}
 *   ImageComponent={OptimizedImage}
 *   icons={{
 *     search: <Search />,
 *     chevronLeft: <ChevronLeft />,
 *     chevronRight: <ChevronRight />,
 *     package: <Package />
 *   }}
 * />
 * ```
 */
export function SubcategoryGrid({
  subcategories,
  parentSlug,
  loading = false,
  LinkComponent,
  ImageComponent,
  icons,
  className,
}: SubcategoryGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"alphabetical" | "productCount">(
    "alphabetical",
  );
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Filter and sort subcategories
  const filteredSubcategories = subcategories
    .filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      } else {
        return b.productCount - a.productCount;
      }
    });

  // Check scroll arrows visibility
  const updateScrollArrows = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollArrows();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", updateScrollArrows);
      window.addEventListener("resize", updateScrollArrows);
      return () => {
        scrollEl.removeEventListener("scroll", updateScrollArrows);
        window.removeEventListener("resize", updateScrollArrows);
      };
    }
  }, [filteredSubcategories]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Browse Subcategories ({subcategories.length})
        </h2>

        {/* Sort Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSortBy("alphabetical")}
            className={cn(
              "px-3 py-1 text-sm rounded-lg transition-colors",
              sortBy === "alphabetical"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
            )}
          >
            A-Z
          </button>
          <button
            type="button"
            onClick={() => setSortBy("productCount")}
            className={cn(
              "px-3 py-1 text-sm rounded-lg transition-colors",
              sortBy === "productCount"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
            )}
          >
            Popular
          </button>
        </div>
      </div>

      {/* Search */}
      {subcategories.length > 6 && (
        <div className="relative mb-4">
          {icons?.search && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
              {icons.search}
            </div>
          )}
          <input
            type="text"
            placeholder="Search subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Horizontal Scroll */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && icons?.chevronLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-5 h-5 text-gray-600 dark:text-gray-400">
              {icons.chevronLeft}
            </div>
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && icons?.chevronRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-5 h-5 text-gray-600 dark:text-gray-400">
              {icons.chevronRight}
            </div>
          </button>
        )}

        {/* Subcategory Grid */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredSubcategories.map((subcat) =>
            LinkComponent ? (
              <LinkComponent
                key={subcat.id}
                href={`/categories/${subcat.slug}`}
                className="flex-shrink-0 w-40 group"
              >
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-600 hover:border-primary">
                  {/* Image */}
                  {subcat.image && ImageComponent && (
                    <div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                      <ImageComponent
                        src={subcat.image}
                        alt={subcat.name}
                        fill={true}
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Name */}
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {subcat.name}
                  </h3>

                  {/* Product Count */}
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    {icons?.package && (
                      <div className="w-3 h-3">{icons.package}</div>
                    )}
                    <span>{subcat.productCount.toLocaleString()}</span>
                  </div>
                </div>
              </LinkComponent>
            ) : (
              <div key={subcat.id} className="flex-shrink-0 w-40">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  {subcat.image && ImageComponent && (
                    <div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                      <ImageComponent
                        src={subcat.image}
                        alt={subcat.name}
                        fill={true}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                    {subcat.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    {icons?.package && (
                      <div className="w-3 h-3">{icons.package}</div>
                    )}
                    <span>{subcat.productCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {filteredSubcategories.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No subcategories found
        </p>
      )}
    </div>
  );
}

