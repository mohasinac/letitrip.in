/**
 * @fileoverview Featured Products Section (Using Generic FeaturedSection Pattern)
 * @module src/components/homepage/FeaturedProductsSection
 * @description Specialized featured products section using the generic FeaturedSection pattern
 *
 * @created 2025-12-05
 * @updated 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ProductCard } from "@/components/cards/ProductCard";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { analyticsService } from "@/services/analytics.service";
import { homepageService } from "@/services/homepage.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

/**
 * FeaturedProductsSectionProps interface
 *
 * @interface
 * @description Props for featured products section
 */
interface FeaturedProductsSectionProps {
  /** Number of products to display */
  limit?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Featured Products Section Component
 *
 * Displays featured products using the generic FeaturedSection pattern.
 * Automatically tracks product impressions for analytics.
 *
 * @param {FeaturedProductsSectionProps} props - Component props
 * @returns {JSX.Element} Rendered component
 *
 * @example
 * <FeaturedProductsSection limit={10} />
 */
export function FeaturedProductsSection({
  limit = 10,
  className = "",
}: FeaturedProductsSectionProps) {
  /**
   * Fetch featured products
   */
  const fetchProducts = async (): Promise<ProductCardFE[]> => {
    const products = await homepageService.getFeaturedProducts(limit);

    // Track impressions for analytics
    if (products.length > 0) {
      analyticsService.trackProductImpressions(products);
    }

    return products;
  };

  return (
    <FeaturedSection<ProductCardFE>
      title="Featured Products"
      subtitle="Handpicked items just for you"
      fetchFn={fetchProducts}
      renderCard={(product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      )}
      viewAllLink="/products?featured=true"
      viewAllText="View All Products"
      columns={4}
      emptyMessage="No featured products available at the moment"
      className={className}
      skeletonCount={Math.min(limit, 5)}
    />
  );
}
