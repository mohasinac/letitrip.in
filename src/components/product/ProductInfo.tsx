/**
 * @fileoverview React Component
 * @module src/components/product/ProductInfo
 * @description This file contains the ProductInfo component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logError } from "@/lib/error-logger";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Store,
  Truck,
  Shield,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { FormLabel } from "@/components/forms/FormLabel";
import { Price } from "@/components/common/values/Price";

/**
 * ProductInfoProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductInfoProps
 */
interface ProductInfoProps {
  /** Product */
  product: {
    /** Id */
    id: string;
    /** Name */
    name: string;
    /** Slug */
    slug: string;
    /** Actual Price */
    actualPrice?: number;
    /** Original Price */
    originalPrice?: number;
    /** Sale Price */
    salePrice: number;
    /** Stock */
    stock: number;
    /** Rating */
    rating?: number;
    /** Review Count */
    reviewCount?: number;
    shop_id: string;
    shop_name: string;
    /** Returnable */
    returnable?: boolean;
    /** Condition */
    condition?: "new" | "refurbished" | "used";
    /** Status */
    status: string;
    /** Image */
    image?: string;
  };
}

/**
 * Function: Product Info
 */
/**
 * Performs product info operation
 *
 * @param {ProductInfoProps} { product } - The { product }
 *
 * @returns {any} The productinfo result
 *
 * @example
 * ProductInfo({ product });
 */

/**
 * Performs product info operation
 *
 * @param {ProductInfoProps} { product } - The { product }
 *
 * @returns {any} The productinfo result
 *
 * @example
 * ProductInfo({ product });
 */

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem, loading: cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.salePrice
      ? Math.round(
          ((product.originalPrice - product.salePrice) /
            product.originalPrice) *
            100,
        )
      : 0;

  const inStock = product.stock > 0 && product.status === "active";

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

  const handleAddToCart = async () => {
    if (!inStock) return;

    try {
      await addItem(product.id, quantity, undefined, {
        /** Name */
        name: product.name,
        /** Price */
        price: product.salePrice,
        /** Image */
        image: product.image || "",
        /** Shop Id */
        shopId: product.shop_id,
        /** Shop Name */
        shopName: product.shop_name,
      });
      toast.success("Added to cart!");
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "ProductInfo.handleAddToCart",
        /** Metadata */
        metadata: { productId: product.id },
      });
      toast.error("Failed to add to cart");
    }
  };

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

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/checkout");
  };

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          /** Title */
          title: product.name,
          /** Url */
          url: globalThis.location?.href || "",
        });
      } catch (error) {
        logError(error as Error, { component: "ProductInfo.handleShare" });
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(globalThis.location?.href || "");
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Rating */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        <div className="flex items-center gap-4 text-sm">
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating!)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-gray-500">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}
          {product.condition && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
              {product.condition}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="border-t border-b py-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-primary">
            <Price amount={product.salePrice} />
          </span>
          {product.originalPrice &&
            product.originalPrice > product.salePrice && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  <Price amount={product.originalPrice} />
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-semibold">
                  {discountPercent}% OFF
                </span>
              </>
            )}
        </div>
        <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
      </div>

      {/* Stock Status */}
      <div>
        {inStock ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">
              In Stock ({product.stock} available)
            </span>
          </div>
        ) : (
          <div className="text-red-600 font-medium">Out of Stock</div>
        )}
      </div>

      {/* Quantity Selector */}
      {inStock && (
        <div>
          <FormLabel htmlFor="product-quantity">Quantity</FormLabel>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              id="product-quantity"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(
                    Math.max(1, parseInt(e.target.value) || 1),
                    product.stock,
                  ),
                )
              }
              className="w-20 text-center border border-gray-300 rounded-lg py-2"
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={quantity >= product.stock}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || cartLoading}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!inStock || cartLoading}
            className="flex-1 btn-primary"
          >
            Buy Now
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
            {isFavorite ? "Saved" : "Add to Favorites"}
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Seller Info */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-3 mb-3">
          <Store className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Sold by</span>
          <button
            onClick={() => router.push(`/shops/${product.shop_id}`)}
            className="text-primary hover:underline font-medium"
          >
            {product.shop_name}
          </button>
        </div>

        {/* Features */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Free shipping on orders above ₹5,000</span>
          </div>
          {product.returnable && (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>7-day return policy</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>100% authentic products</span>
          </div>
        </div>
      </div>
    </div>
  );
}
