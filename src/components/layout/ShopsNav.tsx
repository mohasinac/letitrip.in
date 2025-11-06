"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SHOPS } from "@/constants/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Package,
  ShoppingBag,
  Store,
  ShoppingCart,
  Book,
  Grid3x3,
  Home,
} from "lucide-react";

const shopIconMap: Record<string, any> = {
  "1": Package,
  "2": ShoppingBag,
  "3": Store,
  "4": ShoppingCart,
  "5": Book,
  more: Grid3x3,
};

export default function ShopsNav() {
  const displayShops = SHOPS.slice(0, 5);
  const moreShop = SHOPS.find((shop) => shop.id === "more");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
      className="bg-white border-b shadow-sm py-3 lg:py-3"
    >
      <div className="container mx-auto px-4">
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
            className="flex items-center gap-3 lg:gap-6 overflow-x-auto scrollbar-hide pb-2"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              setShowLeftArrow(target.scrollLeft > 0);
              setShowRightArrow(
                target.scrollLeft < target.scrollWidth - target.clientWidth
              );
            }}
          >
            {/* Home - Icon on mobile, text on desktop */}
            <Link
              href="/"
              className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-2 min-w-[70px] lg:min-w-fit group"
            >
              <div className="w-12 h-12 lg:w-8 lg:h-8 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors lg:hidden">
                <Home className="w-6 h-6 text-yellow-700" />
              </div>
              <span className="text-[10px] lg:text-base text-gray-800 lg:text-gray-800 text-center lg:text-left group-hover:text-yellow-700 font-medium lg:font-bold leading-tight">
                Home
              </span>
            </Link>

            {/* Shop Items */}
            {displayShops.map((shop) => {
              const Icon = shopIconMap[shop.id] || Package;
              return (
                <Link
                  key={shop.id}
                  href={shop.link}
                  className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-2 min-w-[70px] lg:min-w-fit group"
                >
                  <div className="w-12 h-12 lg:w-8 lg:h-8 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors lg:hidden">
                    <Icon className="w-6 h-6 text-yellow-700" />
                  </div>
                  <span className="text-[10px] lg:text-base text-gray-800 lg:text-gray-700 text-center lg:text-left group-hover:text-yellow-700 font-medium leading-tight">
                    {shop.name}
                  </span>
                </Link>
              );
            })}

            {/* More Shops */}
            {moreShop && (
              <Link
                href={moreShop.link}
                className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-1 min-w-[70px] lg:min-w-fit group"
              >
                <div className="w-12 h-12 lg:w-8 lg:h-8 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors lg:hidden">
                  <Grid3x3 className="w-6 h-6 text-yellow-700" />
                </div>
                <span className="text-[10px] lg:text-base text-yellow-700 lg:text-yellow-700 text-center lg:text-left group-hover:text-yellow-800 font-medium lg:font-bold leading-tight flex items-center gap-1">
                  {moreShop.name}
                  <ChevronRight className="w-4 h-4 hidden lg:inline" />
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
