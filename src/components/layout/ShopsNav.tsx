"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { shopsService } from "@/services/shops.service";
import type { Shop } from "@/types";
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
  const [shops, setShops] = useState<Shop[]>([]);
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
        console.error("Failed to fetch shops:", error);
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
    <div id="shops-navigation" className="bg-white border-b py-4 lg:py-4">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">
          Featured Shops
        </h2>

        <div className="relative">
          {/* Left Arrow - Mobile Only */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="lg:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full p-1.5 hover:bg-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
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
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-200 rounded-full animate-pulse" />
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))
              : shops.map((shop) => {
                  // Use shop logo or fallback to icon
                  const Icon = shopIconMap["store"] || Store;
                  return (
                    <Link
                      key={shop.id}
                      href={`/shops/${shop.slug}`}
                      className="flex flex-col items-center gap-1.5 lg:gap-2 min-w-[70px] lg:min-w-[80px] group"
                    >
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors overflow-hidden">
                        {shop.logo ? (
                          <img
                            src={shop.logo}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-700" />
                        )}
                      </div>
                      <span className="text-[10px] lg:text-xs text-gray-800 text-center group-hover:text-yellow-700 font-medium leading-tight">
                        {shop.name}
                      </span>
                    </Link>
                  );
                })}

            {/* Show More Button - Navigate to Shops Page */}
            {!loading && (
              <Link
                href="/shops"
                className="flex flex-col items-center gap-1.5 lg:gap-2 min-w-[70px] lg:min-w-[80px] group"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
                  <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8 text-gray-600" />
                </div>
                <span className="text-[10px] lg:text-xs text-gray-600 text-center group-hover:text-gray-800 font-medium leading-tight">
                  Show More
                </span>
              </Link>
            )}
          </div>

          {/* Right Arrow - Mobile Only */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full p-1.5 hover:bg-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
