/**
 * @fileoverview React Component
 * @module src/components/homepage/LatestProductsSection
 * @description This file contains the LatestProductsSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect, useState } from "react";
import { logError } from "@/lib/error-logger";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductCardSkeleton } from "@/components/cards/ProductCardSkeleton";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

/**
 * LatestProductsSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for LatestProductsSectionProps
 */
interface LatestProductsSectionProps {
  /** Limit */
  limit?: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Latest Products Section
 */
/**
 * Performs latest products section operation
 *
 * @param {LatestProductsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The latestproductssection result
 *
 * @example
 * LatestProductsSection({
  limit);
 */

/**
 * Performs latest products section operation
 *
 * @param {LatestProductsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The latestproductssection result
 *
 * @example
 * LatestProductsSection({
  limit);
 */

/**
 * Performs latest products section operation
 *
 * @param {LatestProductsSectionProps} [{
  limit = 10,
  className = "",
}] - The {
  limit = 10,
  classname = "",
}
 *
 * @returns {any} The latestproductssection result
 *
 * @example
 * LatestProductsSection({
  limit = 10,
  className = "",
});
 */
export function LatestProductsSection({
  limit = 10,
  className = "",
}: LatestProductsSectionProps) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [limit]);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await homepageService.getLatestProducts(limit);
      setProducts(data);

      if (data.length > 0) {
        analyticsService.trackEvent("homepage_latest_products_viewed", {
          /** Count */
          count: data.length,
        });
      }
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "LatestProductsSection.loadProducts",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no products
  if (!loading && products.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Latest Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 ${className}`}>
      <HorizontalScrollContainer
        title="Latest Products"
        viewAllLink="/products"
        viewAllText="View All Products"
        itemWidth="280px"
        gap="1rem"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            originalPrice={product.originalPrice ?? undefined}
            image={product.images?.[0] || "/placeholder-product.jpg"}
            images={product.images}
            rating={product.rating}
            reviewCount={product.reviewCount}
            shopName={product.shop?.name}
            shopSlug={product.shop?.slug}
            shopId={product.shopId}
            inStock={(product.stockCount ?? 0) > 0}
            featured={product.featured}
            condition={product.condition}
            variant="public"
          />
        ))}
      </HorizontalScrollContainer>
    </section>
  );
}
