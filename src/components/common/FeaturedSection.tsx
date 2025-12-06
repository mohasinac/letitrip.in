/**
 * @fileoverview Generic Featured Section Component
 * @module src/components/common/FeaturedSection
 * @description Reusable component for displaying featured content sections.
 * Eliminates duplication across 6+ similar featured section components.
 *
 * @created 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";

/**
 * Props for FeaturedSection component
 * @interface
 */
export interface FeaturedSectionProps<T = any> {
  /** Section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Function to fetch items */
  fetchFn: () => Promise<T[]>;
  /** Render function for each item card */
  renderCard: (item: T, index: number) => ReactNode;
  /** Link to view all items */
  viewAllLink?: string;
  /** View all button text */
  viewAllText?: string;
  /** Number of items to display */
  limit?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom empty state component */
  emptyState?: ReactNode;
  /** Show loading skeletons */
  showSkeleton?: boolean;
  /** Number of skeleton items */
  skeletonCount?: number;
  /** Grid layout columns */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Enable auto-refresh */
  autoRefresh?: boolean;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
  /** Additional CSS classes */
  className?: string;
  /** Header actions */
  headerActions?: ReactNode;
  /** Container max width */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Background color */
  background?: "white" | "gray" | "transparent";
  /** Show border */
  bordered?: boolean;
  /** Section padding */
  padding?: "none" | "sm" | "md" | "lg";
  /** Custom skeleton component */
  skeletonCard?: ReactNode;
}

/**
 * Generic Featured Section Component
 *
 * Replaces 6 duplicated components:
 * - FeaturedProductsSection
 * - FeaturedAuctionsSection
 * - FeaturedShopsSection
 * - FeaturedCategoriesSection
 * - FeaturedBlogsSection
 * - RecentReviewsSection
 *
 * @template T - Type of items being displayed
 * @param {FeaturedSectionProps<T>} props - Component props
 * @returns {JSX.Element} Rendered component
 *
 * @example
 * // Featured Products
 * <FeaturedSection
 *   title="Featured Products"
 *   subtitle="Handpicked items just for you"
 *   fetchFn={productsService.getFeatured}
 *   renderCard={(product) => <ProductCard {...product} />}
 *   viewAllLink="/products"
 *   columns={4}
 * />
 *
 * @example
 * // Recent Reviews with custom empty state
 * <FeaturedSection
 *   title="Recent Reviews"
 *   fetchFn={reviewsService.getRecent}
 *   renderCard={(review) => <ReviewCard {...review} />}
 *   emptyState={<CustomEmptyState />}
 *   autoRefresh
 *   refreshInterval={30000}
 * />
 */
export function FeaturedSection<T = any>({
  title,
  subtitle,
  fetchFn,
  renderCard,
  viewAllLink,
  viewAllText = "View All",
  limit,
  emptyMessage = "No items to display",
  emptyState,
  showSkeleton = true,
  skeletonCount = 4,
  columns = 4,
  autoRefresh = false,
  refreshInterval = 30000,
  className = "",
  headerActions,
  maxWidth = "full",
  background = "white",
  bordered = false,
  padding = "lg",
  skeletonCard,
}: FeaturedSectionProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetches items from the provided fetch function
   */
  const loadItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await fetchFn();
      const limitedData = limit ? data.slice(0, limit) : data;
      setItems(limitedData);
    } catch (err: any) {
      console.error(`Failed to load ${title}:`, err);
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadItems();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadItems(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // CSS classes
  const maxWidthClass = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  }[maxWidth];

  const backgroundClass = {
    white: "bg-white",
    gray: "bg-gray-50",
    transparent: "bg-transparent",
  }[background];

  const paddingClass = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }[padding];

  const gridColsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6",
  }[columns];

  return (
    <section
      className={`${backgroundClass} ${
        bordered ? "border border-gray-200 rounded-lg" : ""
      } ${className}`}
    >
      <div className={`${maxWidthClass} mx-auto ${paddingClass}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Header Actions */}
            {headerActions}

            {/* Refresh Button */}
            {autoRefresh && (
              <button
                type="button"
                onClick={() => loadItems(true)}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            )}

            {/* View All Link */}
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm whitespace-nowrap"
              >
                {viewAllText}
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        {loading && showSkeleton ? (
          // Loading State
          <div className={`grid ${gridColsClass} gap-6`}>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i}>
                {skeletonCard || (
                  <LoadingSkeleton variant="card" className="h-64" />
                )}
              </div>
            ))}
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => loadItems()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          // Empty State
          emptyState || (
            <EmptyState
              title="No Items Found"
              description={emptyMessage}
              className="py-12"
            />
          )
        ) : (
          // Items Grid
          <div className={`grid ${gridColsClass} gap-6`}>
            {items.map((item, index) => (
              <div key={index}>{renderCard(item, index)}</div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Horizontal scrolling variant for mobile/tablet
 * @interface
 */
export interface FeaturedSectionScrollProps<T = any>
  extends Omit<FeaturedSectionProps<T>, "columns"> {
  /** Card width in pixels */
  cardWidth?: number;
  /** Gap between cards */
  gap?: number;
}

/**
 * Featured Section with Horizontal Scrolling
 *
 * @template T - Type of items being displayed
 * @param {FeaturedSectionScrollProps<T>} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FeaturedSectionScroll<T = any>({
  cardWidth = 280,
  gap = 16,
  ...props
}: FeaturedSectionScrollProps<T>) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
      <div
        className="flex gap-4"
        style={{
          gap: `${gap}px`,
        }}
      >
        {/* Implementation would be similar but with flex layout */}
      </div>
    </div>
  );
}

export default FeaturedSection;
