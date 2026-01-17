"use client";

import { ProductCard } from "@/components/cards/ProductCard";
import { ProductCardSkeleton } from "@/components/cards/ProductCardSkeleton";
import { HorizontalScrollContainer } from '@letitrip/react-library';
import { logError } from "@/lib/error-logger";
import { analyticsService } from "@/services/analytics.service";
import { homepageService } from "@/services/homepage.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { useEffect, useState } from "react";

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
        <HorizontalScrollContainer
          title="Latest Products"
          viewAllLink="/products?sort=newest"
          viewAllText="View All"
          className="mb-8"
        >
          {latestProducts.map((product) => (
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
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <HorizontalScrollContainer
          title="Featured Products"
          viewAllLink="/products?featured=true"
          viewAllText="View All"
          className="mb-8"
        >
          {featuredProducts.map((product) => (
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
      )}
    </section>
  );
}
