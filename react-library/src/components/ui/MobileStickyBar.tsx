
/**
 * MobileStickyBar Component
 *
 * Framework-agnostic mobile sticky bar for product/auction pages.
 * Shows price/bid and action buttons at bottom of screen on mobile.
 *
 * @example
 * ```tsx
 * <MobileStickyBar
 *   type="product"
 *   price={999}
 *   originalPrice={1299}
 *   onAddToCart={handleAddToCart}
 *   onBuyNow={handleBuyNow}
 *   inStock={true}
 * />
 * ```
 */

import React, { useState } from "react";

export interface MobileStickyBarProps {
  /** Bar type */
  type?: "product" | "auction";
  /** Product price */
  price?: number;
  /** Original price (for discount display) */
  originalPrice?: number;
  /** Current bid amount */
  currentBid?: number;
  /** Currency symbol */
  currencySymbol?: string;
  /** Add to cart handler */
  onAddToCart?: () => void | Promise<void>;
  /** Buy now handler */
  onBuyNow?: () => void | Promise<void>;
  /** Place bid handler */
  onPlaceBid?: () => void | Promise<void>;
  /** Add to wishlist handler */
  onAddToWishlist?: () => void | Promise<void>;
  /** In stock status */
  inStock?: boolean;
  /** Auction active status */
  isActive?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Show on mobile only */
  mobileOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom Heart icon */
  HeartIcon?: React.ComponentType<{ className?: string }>;
  /** Custom ShoppingCart icon */
  CartIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Gavel icon */
  GavelIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultHeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function DefaultCartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function DefaultGavelIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
      <path d="m9 7 8 8" />
      <path d="m21 11-8-8" />
    </svg>
  );
}

export function MobileStickyBar({
  type = "product",
  price,
  originalPrice,
  currentBid,
  currencySymbol = "₹",
  onAddToCart,
  onBuyNow,
  onPlaceBid,
  onAddToWishlist,
  inStock = true,
  isActive = true,
  disabled = false,
  mobileOnly = true,
  className = "",
  HeartIcon = DefaultHeartIcon,
  CartIcon = DefaultCartIcon,
  GavelIcon = DefaultGavelIcon,
}: MobileStickyBarProps) {
  const [isAdding, setIsAdding] = useState(false);

  const formatPrice = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const handleAddToCart = async () => {
    if (!onAddToCart || disabled) return;
    setIsAdding(true);
    try {
      await onAddToCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
        "shadow-lg",
        mobileOnly && "md:hidden",
        className
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Price/Bid Display */}
          <div className="flex-1 min-w-0">
            {type === "product" ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(price || 0)}
                  </span>
                  {originalPrice && originalPrice > (price || 0) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(originalPrice)}
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
                  {formatPrice(currentBid || 0)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {type === "product" ? (
            <>
              {onAddToWishlist && (
                <button
                  onClick={onAddToWishlist}
                  disabled={disabled}
                  className={cn(
                    "p-3 rounded-lg border border-gray-300 dark:border-gray-600",
                    "text-gray-700 dark:text-gray-300",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "transition-colors",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  aria-label="Add to wishlist"
                >
                  <HeartIcon className="w-5 h-5" />
                </button>
              )}
              {onAddToCart && (
                <button
                  onClick={handleAddToCart}
                  disabled={disabled || !inStock || isAdding}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg font-medium",
                    "bg-blue-600 text-white hover:bg-blue-700",
                    "transition-colors inline-flex items-center justify-center gap-2",
                    (disabled || !inStock || isAdding) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  <CartIcon className="w-5 h-5" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>
              )}
              {onBuyNow && (
                <button
                  onClick={onBuyNow}
                  disabled={disabled || !inStock}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg font-medium",
                    "bg-green-600 text-white hover:bg-green-700",
                    "transition-colors",
                    (disabled || !inStock) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Buy Now
                </button>
              )}
            </>
          ) : (
            <>
              {onPlaceBid && (
                <button
                  onClick={onPlaceBid}
                  disabled={disabled || !isActive}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg font-medium",
                    "bg-orange-600 text-white hover:bg-orange-700",
                    "transition-colors inline-flex items-center justify-center gap-2",
                    (disabled || !isActive) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <GavelIcon className="w-5 h-5" />
                  Place Bid
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileStickyBar;
