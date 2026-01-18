"use client";

/**
 * PaymentLogo Component
 *
 * Framework-agnostic payment logo display with fallback to text.
 * Requires injectable logo fetcher.
 *
 * @example
 * ```tsx
 * <PaymentLogo
 *   logoUrl="/logos/upi.svg"
 *   name="UPI"
 *   showName={false}
 * />
 * ```
 */

import React from "react";

export interface PaymentLogoProps {
  /** Logo URL */
  logoUrl?: string;
  /** Payment method name */
  name: string;
  /** Show name as fallback or alongside logo */
  showName?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Error callback */
  onError?: () => void;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function PaymentLogo({
  logoUrl,
  name,
  showName = false,
  isLoading = false,
  className = "",
  width = 50,
  height = 20,
  onError,
}: PaymentLogoProps) {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
          className
        )}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    );
  }

  if (!logoUrl || imageError) {
    return showName ? (
      <span
        className={cn(
          "text-xs text-gray-600 dark:text-gray-400 font-medium",
          className
        )}
      >
        {name}
      </span>
    ) : null;
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      width={width}
      height={height}
      className={cn("object-contain", className)}
      onError={handleImageError}
    />
  );
}

export default PaymentLogo;

