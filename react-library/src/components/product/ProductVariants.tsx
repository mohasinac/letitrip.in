
import React, { ComponentType, useEffect, useRef, useState } from "react";

export interface ProductVariantsProps {
  productId: string;
  categoryId: string;
  currentShopId: string;
  categoryName?: string;
  products: any[];
  loading?: boolean;
  onLoadProducts?: () => void;
  // Component injections
  ProductCardComponent: ComponentType<any>;
  // Icon injections
  icons?: {
    chevronLeft?: React.ReactNode;
    chevronRight?: React.ReactNode;
  };
}

export function ProductVariants({
  productId,
  categoryId,
  currentShopId,
  categoryName = "this category",
  products,
  loading = false,
  onLoadProducts,
  ProductCardComponent,
  icons = {},
}: ProductVariantsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onLoadProducts) {
      onLoadProducts();
    }
  }, [productId, categoryId, onLoadProducts]);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    const newPosition =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  };

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.offsetWidth - 10,
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [products]);

  // Default SVG icons
  const defaultChevronLeft = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );

  const defaultChevronRight = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-56 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, 12);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        Other options in {categoryName}
      </h3>

      <div className="relative group">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            {icons.chevronLeft || defaultChevronLeft}
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            {icons.chevronRight || defaultChevronRight}
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {displayProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-40">
              <ProductCardComponent product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

