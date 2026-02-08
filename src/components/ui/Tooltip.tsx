"use client";

import React, { useState, useRef, useEffect } from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Tooltip Component
 *
 * Displays contextual information on hover or focus.
 * Supports multiple placements and automatic positioning.
 *
 * @component
 * @example
 * ```tsx
 * <Tooltip content="Click to save">
 *   <button>Save</button>
 * </Tooltip>
 * ```
 */

interface TooltipProps {
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  children: React.ReactElement;
  className?: string;
}

export default function Tooltip({
  content,
  placement = "top",
  delay = 200,
  children,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { themed } = THEME_CONSTANTS;

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const placementClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700",
  };

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      } as any)}

      {isVisible && (
        <div
          role="tooltip"
          className={`
            absolute z-50 px-3 py-2 text-sm font-medium
            ${themed.bgSecondary} ${themed.textPrimary} ${themed.border} rounded-lg shadow-lg
            whitespace-nowrap pointer-events-none
            ${placementClasses[placement]}
            ${className}
          `}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-4 border-transparent
              ${arrowClasses[placement]}
            `}
          />
        </div>
      )}
    </div>
  );
}
