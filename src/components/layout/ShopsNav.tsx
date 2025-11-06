"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SHOPS } from "@/constants/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function ShopsNav() {
  const displayShops = SHOPS.slice(0, 5);
  const moreShop = SHOPS.find((shop) => shop.id === "more");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });

      setTimeout(() => {
        if (scrollRef.current) {
          setShowLeftArrow(scrollRef.current.scrollLeft > 0);
          setShowRightArrow(
            scrollRef.current.scrollLeft <
              scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 5
          );
        }
      }, 300);
    }
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="relative flex items-center gap-2">
          {/* Left Arrow - Mobile Only */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="lg:hidden flex-shrink-0 bg-white shadow-md rounded-full p-1 hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
          )}

          {/* Shops Container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-6 overflow-x-auto scrollbar-hide flex-1"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              setShowLeftArrow(target.scrollLeft > 0);
              setShowRightArrow(
                target.scrollLeft < target.scrollWidth - target.clientWidth - 5
              );
            }}
          >
            <Link
              href="/"
              className="text-gray-800 hover:text-yellow-700 font-bold whitespace-nowrap flex items-center gap-1"
            >
              Home
            </Link>

            {displayShops.map((shop) => (
              <Link
                key={shop.id}
                href={shop.link}
                className="text-gray-700 hover:text-yellow-700 whitespace-nowrap font-medium"
              >
                {shop.name}
              </Link>
            ))}
          </div>

          {/* More Shops Button - Fixed Position */}
          {moreShop && (
            <>
              {/* Right Arrow - Mobile Only */}
              {showRightArrow && (
                <button
                  onClick={() => scroll("right")}
                  className="lg:hidden flex-shrink-0 bg-white shadow-md rounded-full p-1 hover:bg-gray-50"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              )}

              <Link
                href={moreShop.link}
                className="flex-shrink-0 text-yellow-700 hover:text-yellow-800 font-bold whitespace-nowrap flex items-center gap-1 ml-2 lg:ml-0"
              >
                {moreShop.name}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
