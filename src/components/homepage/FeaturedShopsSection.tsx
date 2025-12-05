"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logError } from "@/lib/error-logger";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import AuctionCard from "@/components/cards/AuctionCard";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Rating } from "@/components/common/values/Rating";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { ShopWithItems } from "@/services/homepage.service";
import { ExternalLink, Package } from "lucide-react";

interface FeaturedShopsSectionProps {
  shopLimit?: number;
  itemsPerShop?: number;
  className?: string;
}

export function FeaturedShopsSection({
  shopLimit = 4,
  itemsPerShop = 10,
  className = "",
}: FeaturedShopsSectionProps) {
  const [shops, setShops] = useState<ShopWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShops();
  }, [shopLimit, itemsPerShop]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const data = await homepageService.getFeaturedShops(
        shopLimit,
        itemsPerShop,
      );
      setShops(data);

      if (data.length > 0) {
        analyticsService.trackEvent("homepage_featured_shops_viewed", {
          count: data.length,
        });
      }
    } catch (error) {
      logError(error as Error, { component: "FeaturedShopsSection.loadShops" });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no shops
  if (!loading && shops.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Featured Shops
          </h2>
        </div>
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
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
          Featured Shops
        </h2>
        <Link
          href="/shops"
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
        >
          <span>View All Shops</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-8">
        {shops.map((shopData) => (
          <div key={shopData.shop.id} className="space-y-4">
            {/* Shop Header */}
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              {shopData.shop.logo && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <OptimizedImage
                    src={shopData.shop.logo}
                    alt={shopData.shop.name}
                    fill
                    objectFit="cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/shops/${shopData.shop.slug}`}
                  className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                >
                  {shopData.shop.name}
                </Link>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {shopData.shop.rating !== undefined && (
                    <Rating
                      value={shopData.shop.rating}
                      reviewCount={shopData.shop.reviewCount}
                    />
                  )}
                  {shopData.shop.productCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {shopData.shop.productCount} products
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/shops/${shopData.shop.slug}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex-shrink-0"
              >
                Visit Shop
              </Link>
            </div>

            {/* Shop Items */}
            {shopData.items.length > 0 && (
              <HorizontalScrollContainer
                itemWidth="280px"
                gap="1rem"
                showArrows={true}
              >
                {shopData.items.map((item) => {
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
                        showShopName={false}
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
                        showShopInfo={false}
                      />
                    );
                  }
                })}
              </HorizontalScrollContainer>
            )}
          </div>
        ))}
      </div>

      {/* View All Shops Button - Centered */}
      <div className="flex justify-center mt-8">
        <Link
          href="/shops"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Shops
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
