"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import { shopsService } from "@/services/shops.service";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import { logError } from "@/lib/firebase-error-logger";
import {
  ChevronRight,
  ChevronLeft,
  Package,
  ShoppingBag,
  Store,
  ShoppingCart,
  Book,
  Grid3x3,
  Heart,
  Star,
  Gem,
} from "lucide-react";

const shopIconMap: Record<string, any> = {
  store: Store,
  "shopping-bag": ShoppingBag,
  package: Package,
  "shopping-cart": ShoppingCart,
  book: Book,
  heart: Heart,
  star: Star,
  gem: Gem,
};

export default function ShopsNav() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [shops, setShops] = useState<ShopCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await shopsService.list({
          featured: true,
          verified: true,
          limit: 9,
        });
        setShops(response.data.slice(0, 9));
      } catch (error) {
        logError(error as Error, {
          component: "ShopsNav.fetchShops",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });

      setTimeout(() => {
        if (scrollRef.current) {
          setShowLeftArrow(scrollRef.current.scrollLeft > 0);
          setShowRightArrow(
            scrollRef.current.scrollLeft <
              scrollRef.current.scrollWidth - scrollRef.current.clientWidth
          );
        }
      }, 300);
    }
  };

  return (
    <div
      id="shops-navigation"
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 lg:py-4"
    >
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-4">
          Featured Shops
        </h2>

        <div className="relative">
          {/* Left Arrow - Mobile Only */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="lg:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 shadow-md rounded-full p-1.5 hover:bg-white dark:hover:bg-gray-700"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {/* Shops Container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-3 lg:gap-4 overflow-x-auto scrollbar-hide pb-2"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              setShowLeftArrow(target.scrollLeft > 0);
              setShowRightArrow(
                target.scrollLeft < target.scrollWidth - target.clientWidth
              );
            }}
          >
            {loading
              ? // Loading skeleton
                Array.from({ length: 9 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1.5 lg:gap-2 min-w-[70px] lg:min-w-[80px]"
                  >
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))
              : shops.map((ShopCardFE) => {
                  // Use ShopCardFE logo or fallback to icon
                  const Icon = shopIconMap["store"] || Store;
                  return (
                    <Link
                      key={ShopCardFE.id}
                      href={`/shops/${ShopCardFE.slug}`}
                      className="flex flex-col items-center gap-1.5 lg:gap-2 min-w-[70px] lg:min-w-[80px] group"
                    >
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors overflow-hidden">
                        {ShopCardFE.logo ? (
                          <OptimizedImage
                            src={ShopCardFE.logo}
                            alt={ShopCardFE.name}
                            width={64}
                            height={64}
                            className="rounded-full"
                            objectFit="cover"
                          />
                        ) : (
                          <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-700 dark:text-yellow-400" />
                        )}
                      </div>
                      <span className="text-[10px] lg:text-xs text-gray-800 dark:text-gray-300 text-center group-hover:text-yellow-700 dark:group-hover:text-yellow-400 font-medium leading-tight">
                        {ShopCardFE.name}
                      </span>
                    </Link>
                  );
                })}

            {/* Show More Button - Navigate to Shops Page */}
            {!loading && shops.length >= 9 && (
              <Link
                href="/shops"
                className="flex flex-col items-center gap-1.5 lg:gap-2 min-w-[70px] lg:min-w-[80px] group"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-[10px] lg:text-xs text-gray-600 dark:text-gray-400 text-center group-hover:text-gray-800 dark:group-hover:text-gray-300 font-medium leading-tight">
                  Show More
                </span>
              </Link>
            )}
          </div>

          {/* Right Arrow - Mobile Only */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 shadow-md rounded-full p-1.5 hover:bg-white dark:hover:bg-gray-700"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
