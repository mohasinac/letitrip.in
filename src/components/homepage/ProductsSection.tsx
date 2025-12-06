/**
 * @fileoverview React Component
 * @module src/components/homepage/ProductsSection
 * @description This file contains the ProductsSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { Package, Star } from "lucide-react";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { ProductCard } from "@/components/cards/ProductCard";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

/**
 * ProductsSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductsSectionProps
 */
interface ProductsSectionProps {
  /** Latest Limit */
  latestLimit?: number;
  /** Featured Limit */
  featuredLimit?: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Products Section
 */
/**
 * Performs products section operation
 *
 * @param {ProductsSectionProps} [{
  latestLimit] - The {
  latest limit
 *
 * @returns {any} The productssection result
 *
 * @example
 * ProductsSection({
  latestLimit);
 */

/**
 * Performs products section operation
 *
 * @param {ProductsSectionProps} [{
  latestLimit] - The {
  latest limit
 *
 * @returns {any} The productssection result
 *
 * @example
 * ProductsSection({
  latestLimit);
 */

/**
 * Performs products section operation
 *
 * @param {ProductsSectionProps} [{
  latestLimit = 8,
  featuredLimit = 8,
  className = "",
}] - The {
  latestlimit = 8,
  featuredlimit = 8,
  classname = "",
}
 *
 * @returns {any} The productssection result
 *
 * @example
 * ProductsSection({
  latestLimit = 8,
  featuredLimit = 8,
  className = "",
});
 */
export function ProductsSection({
  latestLimit = 8,
  featuredLimit = 8,
  className = "",
}: ProductsSectionProps) {
  return (
    <div className={className}>
      {/* Latest Products */}
      <FeaturedSection<ProductCardFE>
        title="Latest Products"
        icon={Package}
        viewAllLink="/products"
        viewAllText="View All Products"
        fetchData={async () => {
          const data = await homepageService.getLatestProducts(latestLimit);
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
        className="mb-12"
      />
      
      {/* Featured Products */}
      <FeaturedSection<ProductCardFE>
        title="Featured Products"
        icon={Star}
        viewAllLink="/products?featured=true"
        viewAllText="View Featured"
        fetchData={async () => {
          const data = await homepageService.getFeaturedProducts(featuredLimit);
          if (data.length > 0) {
            analyticsService.trackEvent("homepage_featured_products_viewed", {
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
      />
    </div>
  );
}
  }, [latestLimit, featuredLimit]);

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
      const [latest, featured] = await Promise.all([
        homepageService.getLatestProducts(latestLimit),
        homepageService.getFeaturedProducts(featuredLimit),
      ]);

      setLatestProducts(latest);
      setFeaturedProducts(featured);

      if (latest.length > 0 || featured.length > 0) {
        analyticsService.trackEvent("homepage_products_viewed", {
          /** Latest Count */
          latestCount: latest.length,
          /** Featured Count */
          featuredCount: featured.length,
        });
      }
    } catch (error) {
      logError(error as Error, { component: "ProductsSection.loadProducts" });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no products
  if (
    !loading &&
    latestProducts.length === 0 &&
    featuredProducts.length === 0
  ) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // Combine and dedupe products - featured first, then latest (excluding duplicates)
  /**
 * Performs featured ids operation
 *
 * @param {any} featuredProducts.map((p - The featuredproducts.map((p
 *
 * @returns {any} The featuredids result
 *
 */
const featuredIds = new Set(featuredProducts.map((p) => p.id));
  const uniqueLatest = latestProducts.filter((p) => !featuredIds.has(p.id));
  const allProducts = [...featuredProducts, ...uniqueLatest];

  return (
    <section className={`py-8 ${className}`}>
      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Latest Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {latestProducts.slice(0, 10).map((product) => (
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
          </div>
        </div>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredProducts.slice(0, 10).map((product) => (
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
          </div>
        </div>
      )}

      {/* View All Products Button - Centered */}
      <div className="flex justify-center mt-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Products
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
