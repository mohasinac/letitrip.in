"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, History } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt: string }>;
  rating?: number;
  reviewCount?: number;
  quantity?: number;
}

interface RecentlyViewedProps {
  limit?: number;
  excludeId?: string;
  className?: string;
}

export default function RecentlyViewed({
  limit = 4,
  excludeId,
  className = "",
}: RecentlyViewedProps) {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadRecentlyViewed();
  }, [excludeId, limit]);

  const loadRecentlyViewed = () => {
    try {
      const recentlyViewedStr = localStorage.getItem("recentlyViewed");
      if (!recentlyViewedStr) return;

      let recentlyViewed: RecentlyViewedProduct[] =
        JSON.parse(recentlyViewedStr);

      // Filter out current product if excludeId is provided
      if (excludeId) {
        recentlyViewed = recentlyViewed.filter((p) => p.id !== excludeId);
      }

      // Limit results
      setProducts(recentlyViewed.slice(0, limit));
    } catch (error) {
      console.error("Error loading recently viewed:", error);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <History className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recently Viewed
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const hasDiscount =
            product.compareAtPrice && product.compareAtPrice > product.price;
          const discountPercent = hasDiscount
            ? Math.round(
                ((product.compareAtPrice! - product.price) /
                  product.compareAtPrice!) *
                  100
              )
            : 0;

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <Image
                  src={getProductImageUrl(product, 0, "/assets/placeholder.png")}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {hasDiscount && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>
                {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating!)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice!)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
