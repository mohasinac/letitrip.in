"use client";

import { useEffect, useState } from "react";
import { logError } from "@/lib/error-logger";
import { HorizontalScrollContainer } from '@letitrip/react-library';
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductCardSkeleton } from "@/components/cards/ProductCardSkeleton";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface FeaturedProductsSectionProps {
  limit?: number;
  className?: string;
}

export function FeaturedProductsSection({
  limit = 10,
  className = "",
}: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [limit]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await homepageService.getFeaturedProducts(limit);
      setProducts(data);

      if (data.length > 0) {
        analyticsService.trackEvent("homepage_featured_products_viewed", {
          count: data.length,
        });
      }
    } catch (error) {
      logError(error as Error, {
        component: "FeaturedProductsSection.loadProducts",
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
          Featured Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 ${className}`}>
      <HorizontalScrollContainer
        title="Featured Products"
        viewAllLink="/products?featured=true"
        viewAllText="View All Featured"
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
