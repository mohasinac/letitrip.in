import React, { ComponentType, ReactNode } from "react";

export interface FeaturedSeller {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  totalProducts: number;
  isVerified?: boolean;
}

export interface CategoryFeaturedSellersProps {
  categoryId: string;
  categorySlug: string;
  sellers: FeaturedSeller[];
  loading?: boolean;
  title?: string;
  viewAllText?: string;
  LinkComponent: ComponentType<{
    href: string;
    children: ReactNode;
    className?: string;
  }>;
  className?: string;
}

/**
 * CategoryFeaturedSellers Component
 *
 * Displays top sellers in a specific category with links to their shops.
 * Used on category detail pages to showcase leading sellers.
 *
 * Features:
 * - Shop cards with seller logos, ratings, and product counts
 * - Verified badges for trusted sellers
 * - Responsive grid layout (2/3/4 columns)
 * - Loading state with skeleton placeholders
 * - Links to individual shop pages
 * - Link to view all shops in category
 * - Empty state handling (hidden if no sellers)
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <CategoryFeaturedSellers
 *   categoryId="cat123"
 *   categorySlug="electronics"
 *   sellers={topSellers}
 *   LinkComponent={Link}
 * />
 * ```
 */
export function CategoryFeaturedSellers({
  categoryId,
  categorySlug,
  sellers,
  loading = false,
  title,
  viewAllText = "View All",
  LinkComponent,
  className = "",
}: CategoryFeaturedSellersProps) {
  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title || "Top Sellers"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg h-48 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (sellers.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title || `Top Sellers in ${categorySlug}`}
        </h2>
        <LinkComponent
          href={`/shops?category=${categoryId}`}
          className="text-sm text-primary hover:underline"
        >
          {viewAllText}
        </LinkComponent>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sellers.map((seller) => (
          <LinkComponent
            key={seller.id}
            href={`/shops/${seller.slug}`}
            className="group bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-600 hover:border-primary"
          >
            {/* Logo */}
            {seller.logo && (
              <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-white dark:bg-gray-800">
                <img
                  src={seller.logo}
                  alt={seller.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Name */}
            <h3 className="font-medium text-gray-900 dark:text-white text-sm text-center mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {seller.name}
            </h3>

            {/* Verified Badge */}
            {seller.isVerified && (
              <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400 mb-2">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              {seller.rating > 0 && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {seller.rating.toFixed(1)}
                </span>
              )}
              {seller.totalProducts > 0 && (
                <span>{seller.totalProducts} products</span>
              )}
            </div>
          </LinkComponent>
        ))}
      </div>
    </div>
  );
}