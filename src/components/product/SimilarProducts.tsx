"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Grid, X } from "lucide-react";
import { ProductCard } from "@/components/cards/ProductCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface SimilarProductsProps {
  productId: string;
  parentCategoryIds: string[]; // Parent category IDs to fetch from
  currentShopId: string;
  parentCategoryName?: string;
}

export function SimilarProducts({
  productId,
  parentCategoryIds,
  currentShopId,
  parentCategoryName = "related categories",
}: SimilarProductsProps) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadSimilarProducts();
  }, [productId, parentCategoryIds]);

  const loadSimilarProducts = async () => {
    try {
      setLoading(true);

      if (!parentCategoryIds || parentCategoryIds.length === 0) {
        setProducts([]);
        return;
      }

      // Fetch products from parent categories
      const allProducts: ProductCardFE[] = [];

      for (const parentId of parentCategoryIds) {
        const response = await productsService.list({
          categoryId: parentId,
          status: "active" as any,
          limit: 20,
        });

        if (response.data) {
          allProducts.push(...response.data);
        }
      }

      // Filter out current product and remove duplicates
      const uniqueProducts = Array.from(
        new Map(
          allProducts
            .filter((p: ProductCardFE) => p.id !== productId)
            .map((p) => [p.id, p]),
        ).values(),
      );

      // Diversify by prioritizing different shops
      const diversified = diversifyByShop(uniqueProducts, currentShopId);

      setProducts(diversified);
    } catch (error) {
      console.error("Failed to load similar products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to diversify products by shop
  const diversifyByShop = (
    products: ProductCardFE[],
    currentShopId: string,
  ) => {
    const otherShops: ProductCardFE[] = [];
    const sameShop: ProductCardFE[] = [];

    products.forEach((p) => {
      if (p.shopId === currentShopId) {
        sameShop.push(p);
      } else {
        otherShops.push(p);
      }
    });

    // Prioritize other shops to show variety
    return [...otherShops, ...sameShop];
  };

  // Scroll handlers
  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("similar-products-scroll");
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
    const container = document.getElementById("similar-products-scroll");
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.offsetWidth - 10,
    );
  };

  useEffect(() => {
    const container = document.getElementById("similar-products-scroll");
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [products]);

  if (loading) {
    return (
      <div className="space-y-4 mt-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Similar Products in {parentCategoryName}
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-64 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null; // Don't show section if no similar products
  }

  const displayProducts = products.slice(0, 12); // Show max 12 in carousel

  return (
    <>
      <div className="space-y-4 mt-12">
        {/* Header with Show All button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            More from {parentCategoryName}
          </h2>
          {products.length > 12 && (
            <button
              onClick={() => setShowAllModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Grid className="w-4 h-4" />
              Show All ({products.length})
            </button>
          )}
        </div>

        {/* Horizontal Scrollable Carousel */}
        <div className="relative group">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Products Container */}
          <div
            id="similar-products-scroll"
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-48">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  originalPrice={product.originalPrice ?? undefined}
                  image={product.images?.[0] || ""}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  shopName={product.shopId}
                  shopSlug={product.shopId}
                  inStock={product.stockCount > 0}
                  featured={product.featured}
                  condition={product.condition}
                  showShopName={true}
                />
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>

        {/* Show indicator if more products available */}
        {products.length > 12 && (
          <p className="text-sm text-gray-500 text-center">
            Showing 12 of {products.length} products •{" "}
            <button
              onClick={() => setShowAllModal(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              View all
            </button>
          </p>
        )}
      </div>

      {/* Show All Modal */}
      {showAllModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                All Products in {parentCategoryName}
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    originalPrice={product.originalPrice ?? undefined}
                    image={product.images?.[0] || ""}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    shopName={product.shopId}
                    shopSlug={product.shopId}
                    inStock={product.stockCount > 0}
                    featured={product.featured}
                    condition={product.condition}
                    showShopName={true}
                  />
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Showing {products.length} products from the same category
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
