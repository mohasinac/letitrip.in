/**
 * Mobile Optimized Button Component
 * Extends UnifiedButton with mobile-specific optimizations
 */

"use client";

import React from "react";
import {
  UnifiedButton,
  UnifiedButtonProps,
} from "@/components/ui/unified/Button";
import { cn } from "@/lib/utils";

export interface MobileButtonProps extends Omit<UnifiedButtonProps, "size"> {
  /** Button size - mobile sizes ensure minimum 44px touch target */
  size?: "sm" | "md" | "lg" | "full";
  /** Enable haptic feedback on touch (if supported) */
  hapticFeedback?: boolean;
  /** Prevent double-tap zoom */
  preventZoom?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  className,
  size = "md",
  hapticFeedback = true,
  preventZoom = true,
  onClick,
  ...props
}) => {
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback if supported
      if (
        hapticFeedback &&
        typeof navigator !== "undefined" &&
        "vibrate" in navigator
      ) {
        navigator.vibrate(10); // Short vibration (10ms)
      }

      // Call original onClick
      onClick?.(e);
    },
    [hapticFeedback, onClick]
  );

  const sizeClasses = React.useMemo(() => {
    switch (size) {
      case "sm":
        return "min-h-[44px] px-4 text-sm"; // Still meets 44px minimum
      case "md":
        return "min-h-[48px] px-6 text-base";
      case "lg":
        return "min-h-[56px] px-8 text-lg";
      case "full":
        return "min-h-[48px] w-full px-6 text-base";
      default:
        return "min-h-[48px] px-6 text-base";
    }
  }, [size]);

  return (
    <UnifiedButton
      {...props}
      onClick={handleClick}
      className={cn(
        sizeClasses,
        // Mobile optimizations
        "touch-manipulation", // Disables double-tap zoom
        "-webkit-tap-highlight-color-transparent", // Removes tap highlight
        "select-none", // Prevents text selection
        "active:scale-[0.98]", // Subtle feedback on press
        className
      )}
      style={{
        WebkitTapHighlightColor: "transparent",
        touchAction: preventZoom ? "manipulation" : "auto",
        ...props.style,
      }}
    >
      {children}
    </UnifiedButton>
  );
};

export default MobileButton;
