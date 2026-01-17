import React, { useState, useEffect, useRef, ComponentType } from "react";

export interface SimilarProductsProps {
  productId: string;
  parentCategoryIds: string[];
  currentShopId: string;
  parentCategoryName?: string;
  products: any[];
  loading?: boolean;
  onLoadProducts?: () => void;
  showAllModal?: boolean;
  onShowAllModalChange?: (show: boolean) => void;
  // Component injections
  ProductCardComponent: ComponentType<any>;
  CardGridComponent: ComponentType<{
    children: React.ReactNode;
    className?: string;
  }>;
  LinkComponent: ComponentType<any>;
  // Icon injections
  icons?: {
    grid?: React.ReactNode;
    x?: React.ReactNode;
    package?: React.ReactNode;
    chevronLeft?: React.ReactNode;
    chevronRight?: React.ReactNode;
  };
}

export function SimilarProducts({
  productId,
  parentCategoryIds,
  currentShopId,
  parentCategoryName = "related categories",
  products,
  loading = false,
  onLoadProducts,
  showAllModal = false,
  onShowAllModalChange,
  ProductCardComponent,
  CardGridComponent,
  LinkComponent,
  icons = {},
}: SimilarProductsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onLoadProducts) {
      onLoadProducts();
    }
  }, [productId, parentCategoryIds, onLoadProducts]);

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
      container.scrollLeft < container.scrollWidth - container.offsetWidth - 10
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
  const defaultGridIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );

  const defaultXIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const defaultPackageIcon = (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const defaultChevronLeft = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const defaultChevronRight = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, 16);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            You might also like
          </h2>
          {products.length > 16 && onShowAllModalChange && (
            <button
              onClick={() => onShowAllModalChange(true)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {icons.grid || defaultGridIcon}
              <span>View All ({products.length})</span>
            </button>
          )}
        </div>

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
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-44 sm:w-48"
              >
                <ProductCardComponent product={product} />
              </div>
            ))}
          </div>
        </div>

        {parentCategoryName && (
          <p className="text-sm text-gray-600">
            From {parentCategoryName}
          </p>
        )}
      </div>

      {/* Modal */}
      {showAllModal && onShowAllModalChange && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => onShowAllModalChange(false)}
        >
          <div
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Similar Products ({products.length})
              </h2>
              <button
                onClick={() => onShowAllModalChange(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                {icons.x || defaultXIcon}
              </button>
            </div>

            <div className="p-6">
              {products.length > 0 ? (
                <CardGridComponent className="gap-4">
                  {products.map((product) => (
                    <ProductCardComponent key={product.id} product={product} />
                  ))}
                </CardGridComponent>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  {icons.package || defaultPackageIcon}
                  <p className="mt-4 text-lg font-medium">No similar products found</p>
                  <p className="text-sm">Check back later for more options</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
