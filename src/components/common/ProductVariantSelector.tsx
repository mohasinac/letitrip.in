"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Package, Star, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Price, Rating } from "@/components/common/values";
import { productsService } from "@/services/products.service";
import type { ProductFE } from "@/types/frontend/product.types";

export interface ProductVariantSelectorProps {
  currentProductId: string;
  categoryId: string;
  onSelect: (productId: string) => void;
  className?: string;
}

export function ProductVariantSelector({
  currentProductId,
  categoryId,
  onSelect,
  className = "",
}: ProductVariantSelectorProps) {
  const [products, setProducts] = useState<ProductFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);

  useEffect(() => {
    loadVariants();
  }, [categoryId, currentProductId]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const data = await productsService.list({
        categoryId,
        status: "published",
        limit: 10,
      });

      // Filter out current product
      const filtered = data.filter((p) => p.id !== currentProductId);
      setProducts(filtered);

      // Find lowest price
      if (filtered.length > 0) {
        const lowest = Math.min(...filtered.map((p) => p.price));
        setLowestPrice(lowest);
      }
    } catch (error) {
      console.error("Failed to load product variants:", error);
      toast.error("Failed to load similar products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          Loading similar products...
        </span>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Other Sellers
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {products.length} {products.length === 1 ? "option" : "options"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.map((product) => {
          const isLowest = lowestPrice && product.price === lowestPrice;

          return (
            <button
              key={product.id}
              onClick={() => onSelect(product.id)}
              className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex gap-3">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  {/* Price & Badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <Price
                      amount={product.price}
                      className="text-lg font-bold"
                    />
                    {isLowest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <TrendingDown className="w-3 h-3" />
                        Lowest
                      </span>
                    )}
                  </div>

                  {/* Seller Name */}
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                    {product.shopName || "Unknown Seller"}
                  </p>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>
                        {product.rating.toFixed(1)} ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Stock & Shipping */}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    {product.stockQuantity > 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        Out of Stock
                      </span>
                    )}
                    {product.freeShipping && (
                      <span className="text-blue-600 dark:text-blue-400">
                        Free Shipping
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductVariantSelector;
