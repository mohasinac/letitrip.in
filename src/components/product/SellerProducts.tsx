"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { ProductCard } from "@/components/cards/ProductCard";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface SellerProductsProps {
  productId: string;
  categoryId: string;
  shopId: string;
  shopName?: string;
}

export function SellerProducts({
  productId,
  categoryId,
  shopId,
  shopName = "this seller",
}: SellerProductsProps) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadSellerProducts();
  }, [productId, shopId, categoryId]);

  const loadSellerProducts = async () => {
    try {
      setLoading(true);
      // Fetch seller's other products from same category or parent categories
      const data = await productsService.list({
        shopId,
        status: "active" as any,
        limit: 30,
      });

      // Filter out current product and prioritize same category
      const filtered = (data.products || []).filter(
        (p: ProductCardFE) => p.id !== productId
      );

      // Sort: same category first, then others
      const sorted = filtered.sort((a, b) => {
        if (a.categoryId === categoryId && b.categoryId !== categoryId) return -1;
        if (a.categoryId !== categoryId && b.categoryId === categoryId) return 1;
        return 0;
      });

      setProducts(sorted.slice(0, 16)); // Max 16 products
    } catch (error) {
      console.error("Failed to load seller products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("seller-products-scroll");
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
    const container = document.getElementById("seller-products-scroll");
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.offsetWidth - 10
    );
  };

  useEffect(() => {
    const container = document.getElementById("seller-products-scroll");
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
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900">
            More from {shopName}
          </h3>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
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
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-gray-600" />
        <h3 className="text-xl font-bold text-gray-900">
          More from {shopName}
        </h3>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}

        <div
          id="seller-products-scroll"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
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
                showShopName={false}
              />
            </div>
          ))}
        </div>

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

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
