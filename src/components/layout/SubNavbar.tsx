"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  Home,
  ShoppingBag,
  Layers,
  Star,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Store,
  Gavel,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home", name: "Home", href: "/", icon: Home },
  { id: "products", name: "Products", href: "/products", icon: ShoppingBag },
  { id: "auctions", name: "Auctions", href: "/auctions", icon: Gavel },
  { id: "shops", name: "Shops", href: "/shops", icon: Store },
  { id: "categories", name: "Categories", href: "/categories", icon: Layers },
  { id: "reviews", name: "Reviews", href: "/reviews", icon: Star },
  { id: "blog", name: "Blog", href: "/blog", icon: BookOpen },
];

export default function SubNavbar() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

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
    <div className="bg-white border-b shadow-sm sticky top-[52px] z-40">
      <div className="container mx-auto px-4">
        {/* Desktop Version */}
        <div className="hidden lg:flex items-center gap-8 py-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-yellow-600 border-b-2 border-yellow-600 pb-2"
                    : "text-gray-700 hover:text-yellow-600 pb-2"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Mobile Version - Like ShopsNav */}
        <div className="lg:hidden relative py-3">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full p-1.5 hover:bg-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Nav Items Container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              setShowLeftArrow(target.scrollLeft > 0);
              setShowRightArrow(
                target.scrollLeft < target.scrollWidth - target.clientWidth
              );
            }}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5 min-w-[70px] group"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      active
                        ? "bg-yellow-500 text-white"
                        : "bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] text-center font-medium leading-tight ${
                      active
                        ? "text-yellow-600"
                        : "text-gray-800 group-hover:text-yellow-700"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full p-1.5 hover:bg-white"
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
