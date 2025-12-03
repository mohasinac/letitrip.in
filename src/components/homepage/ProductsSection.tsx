"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logError } from "@/lib/error-logger";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductCardSkeleton } from "@/components/cards/ProductCardSkeleton";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface ProductsSectionProps {
  latestLimit?: number;
  featuredLimit?: number;
  className?: string;
}

export function ProductsSection({
  latestLimit = 8,
  featuredLimit = 8,
  className = "",
}: ProductsSectionProps) {
  const [latestProducts, setLatestProducts] = useState<ProductCardFE[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [latestLimit, featuredLimit]);

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
          latestCount: latest.length,
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
