/**
 * PullToRefresh Component - Phase 7.1
 *
 * Pull-to-refresh functionality for listing pages.
 * Native mobile feel with smooth animations.
 *
 * Features:
 * - Pull down gesture detection
 * - Visual feedback with spinner
 * - Smooth spring animations
 * - Configurable threshold
 * - Works with scroll containers
 * - Touch-optimized
 *
 * Usage:
 * - Wrap listing pages/components
 * - Pass refresh callback function
 * - Auto-triggers on pull threshold
 */

"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate pull progress (0-1)
  const pullProgress = Math.min(pullDistance / threshold, 1);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    // Only start pull if at top of page
    const isAtTop = window.scrollY === 0;
    if (!isAtTop) return;

    setStartY(e.touches[0].clientY);
    setIsPulling(true);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    // Only track downward pulls
    if (distance > 0) {
      // Apply resistance curve (feels more natural)
      const resistance = 0.5;
      const adjustedDistance = distance * resistance;
      setPullDistance(adjustedDistance);

      // Prevent default scroll if pulling significantly
      if (adjustedDistance > 10) {
        e.preventDefault();
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    // Trigger refresh if threshold met
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Snap back
      setPullDistance(0);
    }
  };

  // Reset on scroll (safety)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0 && isPulling) {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPulling]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-center justify-center overflow-hidden transition-all duration-200",
          "bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20",
        )}
        style={{
          height: isRefreshing
            ? "60px"
            : isPulling
            ? `${Math.min(pullDistance, threshold)}px`
            : "0px",
          opacity: isRefreshing || isPulling ? 1 : 0,
        }}
      >
        <div
          className={cn(
            "flex items-center gap-2 transition-transform duration-200",
            pullProgress >= 1 && !isRefreshing && "scale-110",
          )}
        >
          <Loader2
            className={cn(
              "h-5 w-5 text-blue-600 dark:text-blue-400",
              isRefreshing && "animate-spin",
            )}
            style={{
              transform: !isRefreshing
                ? `rotate(${pullProgress * 360}deg)`
                : undefined,
            }}
          />
          {isRefreshing ? (
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Refreshing...
            </span>
          ) : pullProgress >= 1 ? (
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Release to refresh
            </span>
          ) : (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pull to refresh
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: isRefreshing
            ? "translateY(60px)"
            : isPulling
            ? `translateY(${Math.min(pullDistance, threshold)}px)`
            : "translateY(0)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
