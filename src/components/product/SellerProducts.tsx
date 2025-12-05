/**
 * @fileoverview React Component
 * @module src/components/product/SellerProducts
 * @description This file contains the SellerProducts component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { toast } from "sonner";
import { logError } from "@/lib/error-logger";
import { ProductCard } from "@/components/cards/ProductCard";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

/**
 * SellerProductsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SellerProductsProps
 */
interface SellerProductsProps {
  /** Product Id */
  productId: string;
  /** Category Id */
  categoryId: string;
  /** Shop Id */
  shopId: string;
  /** Shop Name */
  shopName?: string;
}

/**
 * Function: Seller Products
 */
/**
 * Performs seller products operation
 *
 * @returns {any} The sellerproducts result
 *
 * @example
 * SellerProducts();
 */

/**
 * Performs seller products operation
 *
 * @returns {any} The sellerproducts result
 *
 * @example
 * SellerProducts();
 */

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

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadSellerProducts = async () => {
    try {
      setLoading(true);
      // Fetch seller's other products from same category or parent categories
      const response = await productsService.list({
        shopId,
        /** Status */
        status: "active" as any,
        /** Limit */
        limit: 30,
      });

      // Filter out current product and prioritize same category
      /**
       * Filters filtered
       *
       * @param {ProductCardFE} response.data || []).filter(
        (p - The response.data || []).filter(
        (p
       *
       * @returns {any} The filtered result
       */

      /**
       * Filters filtered
       *
       * @param {ProductCardFE} response.data || []).filter(
        (p - The response.data || []).filter(
        (p
       *
       * @returns {any} The filtered result
       */

      /**
 * Performs filtered operation
 *
 * @param {any} response.data||[] - The response.data||[]
 *
 * @returns {any} The filtered result
 *
 */
const filtered = (response.data || []).filter(
        (p: ProductCardFE) => p.id !== productId,
      );

      // Sort: same category first, then others
      const sorted = filtered.sort((a, b) => {
        if (a.categoryId === categoryId && b.categoryId !== categoryId)
          return -1;
        if (a.categoryId !== categoryId && b.categoryId === categoryId)
          return 1;
        return 0;
      });

      setProducts(sorted.slice(0, 16)); // Max 16 products
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "SellerProducts.loadProducts",
        /** Metadata */
        metadata: { sellerId: shopId },
      });
      toast.error("Failed to load seller products");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles scroll event
   *
   * @param {"left" | "right"} direction - The direction
   *
   * @returns {any} The handlescroll result
   */

  /**
   * Handles scroll event
   *
   * @param {"left" | "right"} direction - The direction
   *
   * @returns {any} The handlescroll result
   */

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("seller-products-scroll");
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    const newPosition =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      /** Left */
      left: newPosition,
      /** Behavior */
      behavior: "smooth",
    });
  };

  /**
   * Updates existing scroll buttons
   *
   * @returns {any} The updatescrollbuttons result
   */

  /**/**
 * Performs container operation
 *
 * @param {any} "seller-products-scroll" - The "seller-products-scroll"
 *
 * @returns {any} The container result
 *
 */

   * Updates existing scroll buttons
   *
   * @returns {any} The updatescrollbuttons result
   */

  const updateScrollButtons = () => {
    const container = document.getElementById("seller-products-scroll");
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.offsetWidth - 10,
    );
  };

  useEffect(() => {
    const container = document.getElementById("seller-products-scroll");
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    globalThis.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      globalThis.removeEventListener("resize", updateScrollButtons);
    };
  }, [products]);

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            More from {shopName}
          </h3>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            More from {shopName}
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Store className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
            No other products from this seller yet
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          More from {shopName}
        </h3>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          /** Display */
          display: none;
        }
      `}</style>
    </div>
  );
}
