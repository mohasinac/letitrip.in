/**
 * @fileoverview React Component
 * @module src/components/mobile/MobilePullToRefresh
 * @description This file contains the MobilePullToRefresh component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useState, useRef, ReactNode, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MobilePullToRefreshProps interface
 * 
 * @interface
 * @description Defines the structure and contract for MobilePullToRefreshProps
 */
interface MobilePullToRefreshProps {
  /** Children */
  children: ReactNode;
  /** On Refresh */
  onRefresh: () => Promise<void>;
  /** Class Name */
  className?: string;
  /** Threshold */
  threshold?: number;
  /** Max Pull */
  maxPull?: number;
  /** Disabled */
  disabled?: boolean;
}

/**
 * Function: Mobile Pull To Refresh
 */
/**
 * Performs mobile pull to refresh operation
 *
 * @returns {any} The mobilepulltorefresh result
 *
 * @example
 * MobilePullToRefresh();
 */

/**
 * Performs mobile pull to refresh operation
 *
 * @returns {any} The mobilepulltorefresh result
 *
 * @example
 * MobilePullToRefresh();
 */

export function MobilePullToRefresh({
  children,
  onRefresh,
  className,
  threshold = 80,
  maxPull = 120,
  disabled = false,
}: MobilePullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;

      const container = containerRef.current;
      if (container && container.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    },
    [disabled, isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || disabled || isRefreshing) return;

      const container = containerRef.current;
      if (!container || container.scrollTop > 0) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        e.preventDefault();
        // Apply resistance - pull more, less movement
        const resistance = Math.min(diff * 0.5, maxPull);
        setPullDistance(resistance);
      }
    },
    [disabled, isRefreshing, maxPull],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing && !disabled) {
      setIsRefreshing(true);
      setPullDistance(threshold / 2); // Keep indicator visible

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, disabled, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-10 transition-opacity"
        style={{
          /** Top */
          top: -40,
          /** Transform */
          transform: `translateY(${pullDistance}px)`,
          /** Opacity */
          opacity: progress,
        }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center",
            shouldTrigger && !isRefreshing && "bg-yellow-50",
          )}
        >
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
          ) : (
            <svg
              className={cn(
                "w-5 h-5 text-gray-600 transition-transform duration-200",
                shouldTrigger && "text-yellow-600",
              )}
              style={{
                /** Transform */
                transform: `rotate(${progress * 180}deg)`,
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          /** Transform */
          transform: `translateY(${
            isRefreshing ? threshold / 2 : pullDistance
          }px)`,
          /** Transition */
          transition: isPulling.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
