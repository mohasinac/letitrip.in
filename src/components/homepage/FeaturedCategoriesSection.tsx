"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import AuctionCard from "@/components/cards/AuctionCard";
import OptimizedImage from "@/components/common/OptimizedImage";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { CategoryWithItems } from "@/services/homepage.service";
import { ExternalLink } from "lucide-react";

interface FeaturedCategoriesSectionProps {
  categoryLimit?: number;
  itemsPerCategory?: number;
  className?: string;
}

export function FeaturedCategoriesSection({
  categoryLimit = 6,
  itemsPerCategory = 10,
  className = "",
}: FeaturedCategoriesSectionProps) {
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [categoryLimit, itemsPerCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await homepageService.getFeaturedCategories(
        categoryLimit,
        itemsPerCategory,
      );
      setCategories(data);

      if (data.length > 0) {
        analyticsService.trackEvent("homepage_featured_categories_viewed", {
          count: data.length,
        });
      }
    } catch (error) {
      console.error("Failed to load featured categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no categories
  if (!loading && categories.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Shop by Category
          </h2>
        </div>
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Shop by Category
        </h2>
        <Link
          href="/categories"
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
        >
          <span>View All Categories</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-8">
        {categories.map((categoryData) => (
          <div key={categoryData.category.id} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-4">
              {categoryData.category.image && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <OptimizedImage
                    src={categoryData.category.image}
                    alt={categoryData.category.name}
                    fill
                    objectFit="cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Link
                  href={`/categories/${categoryData.category.slug}`}
                  className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {categoryData.category.name}
                </Link>
                {categoryData.category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                    {categoryData.category.description}
                  </p>
                )}
              </div>
              <Link
                href={`/categories/${categoryData.category.slug}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex-shrink-0"
              >
                View More
              </Link>
            </div>

            {/* Category Items */}
            {categoryData.items.length > 0 && (
              <HorizontalScrollContainer
                itemWidth="280px"
                gap="1rem"
                showArrows={true}
              >
                {categoryData.items.map((item) => {
                  // Check if it's a product or auction
                  if ("price" in item) {
                    return (
                      <ProductCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        slug={item.slug}
                        price={item.price}
                        originalPrice={item.originalPrice ?? undefined}
                        image={item.images?.[0] || "/placeholder-product.jpg"}
                        images={item.images}
                        rating={item.rating}
                        reviewCount={item.reviewCount}
                        shopName={item.shop?.name}
                        shopSlug={item.shop?.slug}
                        shopId={item.shopId}
                        inStock={(item.stockCount ?? 0) > 0}
                        variant="public"
                      />
                    );
                  } else {
                    return (
                      <AuctionCard
                        key={item.id}
                        auction={{
                          id: item.id,
                          name: item.name,
                          slug: item.slug,
                          images: item.images,
                          currentBid: item.currentBid,
                          startingBid: item.startingBid,
                          bidCount: item.bidCount,
                          endTime: item.endTime,
                          status:
                            item.status === "upcoming"
                              ? "pending"
                              : item.status === "live"
                                ? "active"
                                : item.status,
                          shop: {
                            id: item.shopId,
                            name: item.shopName,
                          },
                        }}
                        variant="compact"
                      />
                    );
                  }
                })}
              </HorizontalScrollContainer>
            )}
          </div>
        ))}
      </div>

      {/* View All Categories Button - Centered */}
      <div className="flex justify-center mt-8">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Categories
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
