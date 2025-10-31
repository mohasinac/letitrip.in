/**
 * Mobile Container Component
 * Responsive container with safe area support and mobile optimizations
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Add safe area insets (for iOS notches) */
  safeArea?: boolean | "top" | "bottom" | "left" | "right";
  /** Full width on mobile (no padding) */
  fullWidthMobile?: boolean;
  /** Prevent horizontal scroll */
  noScrollX?: boolean;
  /** Max width breakpoint */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Add mobile-optimized padding */
  mobilePadding?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  safeArea = false,
  fullWidthMobile = false,
  noScrollX = true,
  maxWidth = "2xl",
  mobilePadding = true,
}) => {
  const safeAreaClasses = React.useMemo(() => {
    if (!safeArea) return "";
    if (safeArea === true) return "safe-area";
    return `safe-${safeArea}`;
  }, [safeArea]);

  return (
    <div
      className={cn(
        // Base container
        "w-full mx-auto",
        maxWidthClasses[maxWidth],

        // Mobile padding
        mobilePadding && !fullWidthMobile && "px-4 sm:px-6 lg:px-8",

        // Prevent horizontal scroll
        noScrollX && "overflow-x-hidden",

        // Safe area insets
        safeAreaClasses,

        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
};

export interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns at each breakpoint */
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Gap between grid items */
  gap?: "sm" | "md" | "lg";
}

const gapClasses = {
  sm: "gap-2 sm:gap-3",
  md: "gap-4 sm:gap-6",
  lg: "gap-6 sm:gap-8",
};

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, lg: 3 },
  gap = "md",
}) => {
  const gridClasses = React.useMemo(() => {
    const classes = [];

    // Base columns (xs)
    classes.push(`grid-cols-${cols.xs || 1}`);

    // Responsive columns
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);

    return classes.join(" ");
  }, [cols]);

  return (
    <div className={cn("grid", gridClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
};

export interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
  /** Spacing between items */
  spacing?: "sm" | "md" | "lg";
  /** Direction */
  direction?: "vertical" | "horizontal";
  /** Alignment */
  align?: "start" | "center" | "end";
  /** Justify */
  justify?: "start" | "center" | "end" | "between" | "around";
}

const spacingClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
};

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export const MobileStack: React.FC<MobileStackProps> = ({
  children,
  className,
  spacing = "md",
  direction = "vertical",
  align = "start",
  justify = "start",
}) => {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
};

export interface MobileScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Scroll direction */
  direction?: "horizontal" | "vertical";
  /** Enable scroll snapping */
  snap?: boolean;
  /** Hide scrollbar */
  hideScrollbar?: boolean;
  /** Add safe area bottom padding */
  safeBottom?: boolean;
}

export const MobileScroll: React.FC<MobileScrollProps> = ({
  children,
  className,
  direction = "horizontal",
  snap = true,
  hideScrollbar = true,
  safeBottom = false,
}) => {
  return (
    <div
      className={cn(
        "overflow-auto -webkit-overflow-scrolling-touch",
        direction === "horizontal"
          ? "overflow-x-auto overflow-y-hidden flex"
          : "overflow-y-auto",
        snap && "scroll-snap-type-x-mandatory",
        hideScrollbar && "scrollbar-none",
        safeBottom && "pb-safe-bottom",
        className
      )}
      style={{
        WebkitOverflowScrolling: "touch",
        scrollSnapType: snap
          ? direction === "horizontal"
            ? "x mandatory"
            : "y mandatory"
          : "none",
      }}
    >
      {children}
    </div>
  );
};

export interface TouchableProps {
  children: React.ReactNode;
  className?: string;
  /** Enable active state on touch */
  activeState?: boolean;
  /** Disable tap highlight */
  noTapHighlight?: boolean;
  /** Minimum touch target size */
  minSize?: "sm" | "md" | "lg";
  /** onClick handler */
  onClick?: () => void;
  /** onTouch handler (fires on touchstart) */
  onTouch?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

const minSizeClasses = {
  sm: "min-w-[36px] min-h-[36px]",
  md: "min-w-[44px] min-h-[44px]",
  lg: "min-w-[52px] min-h-[52px]",
};

export const Touchable: React.FC<TouchableProps> = ({
  children,
  className,
  activeState = true,
  noTapHighlight = true,
  minSize = "md",
  onClick,
  onTouch,
  disabled = false,
}) => {
  const handleTouchStart = React.useCallback(() => {
    if (!disabled && onTouch) {
      onTouch();
    }
  }, [disabled, onTouch]);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "inline-flex items-center justify-center",
        minSizeClasses[minSize],
        noTapHighlight && "no-tap-highlight",
        activeState &&
          !disabled &&
          "active:opacity-70 active:scale-98 transition-transform",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
      onClick={disabled ? undefined : onClick}
      onTouchStart={handleTouchStart}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

export default {
  MobileContainer,
  MobileGrid,
  MobileStack,
  MobileScroll,
  Touchable,
};
