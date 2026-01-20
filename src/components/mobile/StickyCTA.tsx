/**
 * StickyCTA Component - Phase 7.1
 *
 * Sticky call-to-action buttons for mobile.
 * Always visible at bottom for easy access to primary actions.
 *
 * Features:
 * - Fixed bottom positioning
 * - Single or dual button layout
 * - Price display
 * - Loading states
 * - Disabled states
 * - iOS safe area inset
 * - Backdrop blur
 *
 * Usage:
 * - Product detail pages: Add to Cart, Buy Now
 * - Auction detail pages: Place Bid, Buy Now
 * - Checkout pages: Proceed to Payment
 */

"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CTAButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface StickyCTAProps {
  /** Primary button */
  primaryButton: CTAButton;
  /** Optional secondary button */
  secondaryButton?: CTAButton;
  /** Price to display */
  price?: string;
  /** Original price (for discounts) */
  originalPrice?: string;
  /** Show only on mobile */
  mobileOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function StickyCTA({
  primaryButton,
  secondaryButton,
  price,
  originalPrice,
  mobileOnly = true,
  className,
}: StickyCTAProps) {
  const renderButton = (button: CTAButton, isPrimary: boolean) => {
    const variantClasses = {
      primary:
        "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-800",
      secondary:
        "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 disabled:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:disabled:bg-gray-800",
      danger:
        "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white disabled:bg-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:disabled:bg-red-800",
    };

    return (
      <button
        onClick={button.onClick}
        disabled={button.disabled || button.loading}
        className={cn(
          "flex-1 h-12 px-4 rounded-xl font-semibold text-base",
          "flex items-center justify-center gap-2",
          "transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
          "active:scale-95",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
          variantClasses[
            button.variant || (isPrimary ? "primary" : "secondary")
          ],
        )}
        aria-label={button.label}
      >
        {button.loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {button.icon && (
              <span className="flex-shrink-0">{button.icon}</span>
            )}
            <span>{button.label}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30",
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md",
        "border-t border-gray-200 dark:border-gray-800",
        "pb-safe", // iOS safe area inset
        "shadow-[0_-4px_24px_rgba(0,0,0,0.08)]",
        mobileOnly && "lg:hidden",
        className,
      )}
    >
      <div className="container mx-auto px-4 py-3 max-w-screen-sm">
        <div className="flex items-center gap-3">
          {/* Price Section */}
          {price && (
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {price}
                </span>
                {originalPrice && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {originalPrice}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className={cn("flex gap-2", price ? "flex-1" : "flex-1")}>
            {secondaryButton && (
              <div className="flex-1">
                {renderButton(secondaryButton, false)}
              </div>
            )}
            <div className={cn(secondaryButton ? "flex-1" : "flex-1")}>
              {renderButton(primaryButton, true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * StickyCTASpacer Component
 *
 * Adds bottom spacing to prevent content from being hidden behind StickyCTA.
 * Use at the end of page content when StickyCTA is present.
 */
export function StickyCTASpacer({
  mobileOnly = true,
}: {
  mobileOnly?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-24 pb-safe", // Match StickyCTA height + safe area
        mobileOnly && "lg:hidden",
      )}
      aria-hidden="true"
    />
  );
}
