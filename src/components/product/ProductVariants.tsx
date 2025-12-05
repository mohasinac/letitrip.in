/**
 * @fileoverview React Component
 * @module src/components/product/ProductVariants
 * @description This file contains the ProductVariants component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { logError } from "@/lib/error-logger";
import { ProductCard } from "@/components/cards/ProductCard";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

/**
 * ProductVariantsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductVariantsProps
 */
interface ProductVariantsProps {
  /** Product Id */
  productId: string;
  /** Category Id */
  categoryId: string;
  /** Current Shop Id */
  currentShopId: string;
  /** Category Name */
  categoryName?: string;
}

/**
 * Function: Product Variants
 */
/**
 * Performs product variants operation
 *
 * @returns {any} The productvariants result
 *
 * @example
 * ProductVariants();
 */

/**
 * Performs product variants operation
 *
 * @returns {any} The productvariants result
 *
 * @example
 * ProductVariants();
 */

export function ProductVariants({
  productId,
  categoryId,
  currentShopId,
  categoryName = "this category",
}: ProductVariantsProps) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadVariants();
  }, [productId, categoryId]);

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

  const loadVariants = async () => {
    try {
      setLoading(true);
      // Fetch products from EXACT same category only
      const response = await productsService.list({
        categoryId,
        /** Status */
        status: "active" as any,
        /** Limit */
        limit: 20,
      });

      // Filter out current product and ensure exact category match
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

      const filtered = (response.data || []).filter(
        (p: ProductCardFE) => p.id !== productId && p.categoryId === categoryId,
      );

      setProducts(filtered.slice(0, 12)); // Max 12 variants
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "ProductVariants.loadVariants",
        /** Metadata */
        metadata: { productId },
      });
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
    const container = document.getElementById("product-variants-scroll");
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

  /**
   * Updates existing scroll buttons
   *
   * @returns {any} The updatescrollbuttons result
   */

  const updateScrollButtons = () => {
    const container = document.getElementById("product-variants-scroll");
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.offsetWidth - 10,
    );
  };

  useEffect(() => {
    const container = document.getElementById("product-variants-scroll");
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
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Other options in {categoryName}
        </h3>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
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
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Other options in {categoryName}
      </h3>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        <div
          id="product-variants-scroll"
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-40">
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
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
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
