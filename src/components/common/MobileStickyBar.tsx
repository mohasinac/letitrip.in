/**
 * Mobile sticky bar component for product/auction pages
 */

"use client";

import { ShoppingCart, Gavel, Heart } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import { Price } from "@/components/common/values/Price";

interface MobileStickyBarProps {
  type?: "product" | "auction";
  price?: number;
  originalPrice?: number;
  currentBid?: number;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  onPlaceBid?: () => void;
  onAddToWishlist?: () => void;
  inStock?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function MobileStickyBar({
  type = "product",
  price,
  originalPrice,
  currentBid,
  onAddToCart,
  onBuyNow,
  onPlaceBid,
  onAddToWishlist,
  inStock = true,
  isActive = true,
  disabled = false,
  className = "",
}: MobileStickyBarProps) {
  const isMobile = useIsMobile();
  const [isAdding, setIsAdding] = useState(false);

  if (!isMobile) return null;

  const handleAddToCart = async () => {
    if (!onAddToCart || disabled) return;

    setIsAdding(true);
    try {
      await onAddToCart();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 ${className}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Price/Bid Display */}
          <div className="flex-1 min-w-0">
            {type === "product" ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    <Price amount={price || 0} />
                  </span>
                  {originalPrice && originalPrice > (price || 0) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      <Price amount={originalPrice} />
                    </span>
                  )}
                </div>
                {!inStock && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Out of Stock
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Current Bid
                </p>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  <Price amount={currentBid || 0} />
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {type === "product" ? (
            <>
              {/* Wishlist Button */}
              {onAddToWishlist && (
                <button
                  onClick={onAddToWishlist}
                  className="flex items-center justify-center w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}

              {/* Add to Cart Button */}
              {onAddToCart && (
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || disabled || isAdding}
                  className="flex items-center justify-center gap-2 px-6 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAdding ? "Adding..." : "Add"}
                </button>
              )}

              {/* Buy Now Button */}
              {onBuyNow && (
                <button
                  onClick={onBuyNow}
                  disabled={!inStock || disabled}
                  className="flex items-center justify-center px-6 h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Buy Now
                </button>
              )}
            </>
          ) : (
            <>
              {/* Place Bid Button */}
              {onPlaceBid && (
                <button
                  onClick={onPlaceBid}
                  disabled={!isActive || disabled}
                  className="flex items-center justify-center gap-2 flex-1 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <Gavel className="w-5 h-5" />
                  {isActive ? "Place Bid" : "Ended"}
                </button>
              )}

              {/* Wishlist Button */}
              {onAddToWishlist && (
                <button
                  onClick={onAddToWishlist}
                  className="flex items-center justify-center w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Add to watchlist"
                >
                  <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
