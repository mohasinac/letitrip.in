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

import { ProductCard } from "@/components/cards/ProductCard";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { analyticsService } from "@/services/analytics.service";
import { homepageService } from "@/services/homepage.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { Package } from "lucide-react";

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
  return (
    <FeaturedSection<ProductCardFE>
      title="Latest Products"
      icon={Package}
      viewAllLink="/products"
      viewAllText="View All Products"
      fetchData={async () => {
        const data = await homepageService.getLatestProducts(limit);
        if (data.length > 0) {
          analyticsService.trackEvent("homepage_latest_products_viewed", {
            count: data.length,
          });
        }
        return data;
      }}
      renderItem={(product) => (
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
      )}
      itemWidth="280px"
      className={className}
    />
  );
}
