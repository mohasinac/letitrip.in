/**
 * @fileoverview React Component
 * @module src/components/common/ProductVariantSelector
 * @description This file contains the ProductVariantSelector component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { useEffect } from "react";
import {
  Loader2,
  Package,
  Star,
  TrendingDown,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { Price } from "@/components/common/values/Price";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import OptimizedImage from "@/components/common/OptimizedImage";
import Link from "next/link";

/**
 * ProductVariantSelectorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductVariantSelectorProps
 */
export interface ProductVariantSelectorProps {
  /** Current Product Id */
  currentProductId: string;
  /** Category Id */
  categoryId: string;
  /** On Select */
  onSelect?: (productId: string) => void;
  /** Class Name */
  className?: string;
  /** Limit */
  limit?: number;
}

/**
 * Function: Product Variant Selector
 */
/**
 * Performs product variant selector operation
 *
 * @returns {any} The productvariantselector result
 *
 * @example
 * ProductVariantSelector();
 */

/**
 * Performs product variant selector operation
 *
 * @returns {any} The productvariantselector result
 *
 * @example
 * ProductVariantSelector();
 */

export function ProductVariantSelector({
  currentProductId,
  categoryId,
  onSelect,
  className = "",
  limit = 5,
}: ProductVariantSelectorProps) {
  const {
    /** Is Loading */
    isLoading: loading,
    /** Data */
    data: products,
    setData,
    execute,
  } = useLoadingState<ProductCardFE[]>({
    /** Initial Data */
    initialData: [],
    /** On Load Error */
    onLoadError: (error) => {
      logError(error as Error, {
        /** Component */
        component: "ProductVariantSelector.loadVariants",
      });
      toast.error("Failed to load similar products");
    },
  });

  useEffect(() => {
    loadVariants();
  }, [categoryId, currentProductId]);

  /**
   * Fetches variants from server
   *
   * @returns {Promise<any>} Promise resolving to variants result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Fetches variants from server
   *
   * @returns {Promise<any>} Promise resolving to variants result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadVariants = () =>
    execute(async () => {
      const response = await productsService.list({
        categoryId,
        /** Limit */
        limit: limit + 1,
      });

      // Filter out current product and limit results
      /**
       * Filters filtered
       *
       * @param {any} response.data || [])
        .filter((p - The response.data || [])
        .filter((p
       *
       * @returns {any} The filtered result
       */

      /**
       * Filters filtered
       *
       * @param {any} response.data || [])
        .filter((p - The response.data || [])
        .filter((p
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
const filtered = (response.data || [])
        .filter((p) => p.id !== currentProductId)
        .slice(0, limit);

      return filtered;
    });

  // Find lowest price
  const lowestPrice =
    products && products.length > 0
      ? Math.min(...(products || []).map((p) => p.price))
      : null;

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Other Sellers
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Other Sellers
        </h3>
        {products.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {products.length} {products.length === 1 ? "seller" : "sellers"}
          </span>
        )}
      </div>

      {/* Variants List */}
      <div className="space-y-3">
        {(products || []).map((variant) => {
          const isLowest = lowestPrice && variant.price === lowestPrice;
          const discount = variant.compareAtPrice
            ? Math.round(
                ((variant.compareAtPrice - variant.price) /
                  variant.compareAtPrice) *
                  100,
              )
            : 0;

          /**
           * Renders content
           *
           * @returns {any} The rendercontent result
           */

          /**
           * Renders content
           *
           * @returns {any} The rendercontent result
           */

          const renderContent = () => (
            <>
              {/* Product Image */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <OptimizedImage
                  src={variant.images?.[0] || "/placeholder-product.png"}
                  alt={variant.name}
                  fill
                  quality={75}
                  objectFit="cover"
                  className="rounded"
                  sizes="64px"
                />
                {discount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Price */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    <Price amount={variant.price} />
                  </span>
                  {variant.compareAtPrice &&
                    variant.compareAtPrice > variant.price && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        <Price amount={variant.compareAtPrice} />
                      </span>
                    )}
                  {isLowest && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Lowest Price
                    </span>
                  )}
                </div>

                {/* Seller Name with Shop Icon */}
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                  <Store className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {variant.shopName || "Unknown Seller"}
                  </span>
                </div>

                {/* Rating & Stock Status */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {variant.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {variant.rating.toFixed(1)}
                      </span>
                      {variant.reviewCount > 0 && (
                        <span>({variant.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {variant.inStock ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Shipping Info (if available) */}
                {variant.inStock && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Truck className="w-3 h-3" />
                    <span>
                      {variant.condition === "new"
                        ? "Free shipping available"
                        : "Shipping calculated at checkout"}
                    </span>
                  </div>
                )}
              </div>
            </>
          );

          return onSelect ? (
            <button
              key={variant.id}
              onClick={() => onSelect(variant.id)}
              type="button"
              className="flex gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all group w-full text-left"
            >
              {renderContent()}
            </button>
          ) : (
            <Link
              key={variant.id}
              href={`/products/${variant.slug}`}
              className="flex gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all group w-full text-left"
            >
              {renderContent()}
            </Link>
          );
        })}
      </div>

      {/* Footer Note */}
      {products.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
          Showing sellers for the same product. Prices and availability may
          vary.
        </p>
      )}
    </div>
  );
}

export default ProductVariantSelector;
