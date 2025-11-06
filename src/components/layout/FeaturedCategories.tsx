"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FEATURED_CATEGORIES } from "@/constants/navigation";
import {
  Layers,
  Heart,
  Gem,
  Mountain,
  Headphones,
  Gamepad2,
  Shirt,
  Music,
  Package,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const iconMap: Record<string, any> = {
  layers: Layers,
  heart: Heart,
  gem: Gem,
  mountain: Mountain,
  headphones: Headphones,
  "gamepad-2": Gamepad2,
  shirt: Shirt,
  music: Music,
  package: Package,
  "shopping-bag": ShoppingBag,
};

export default function FeaturedCategories() {
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
    <div id="featured-categories" className="bg-white border-b py-4 lg:py-4">
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

          {/* Categories Container */}
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
            {FEATURED_CATEGORIES.map((category) => {
              const Icon = iconMap[category.icon] || Package;
              return (
                <Link
                  key={category.id}
                  href={category.link}
                  className="flex flex-col items-center gap-1.5 lg:gap-2 min-w-[70px] lg:min-w-[80px] group"
                >
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                    <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-700" />
                  </div>
                  <span className="text-[10px] lg:text-xs text-gray-800 text-center group-hover:text-yellow-700 font-medium leading-tight">
                    {category.name}
                  </span>
                </Link>
              );
            })}
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
