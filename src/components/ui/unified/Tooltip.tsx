/**
 * Unified Tooltip Component
 * Accessible tooltips with multiple placements
 * Hover and focus trigger support
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface UnifiedTooltipProps {
  // Content
  content: React.ReactNode;
  children: React.ReactElement;

  // Placement
  placement?: "top" | "bottom" | "left" | "right";

  // Behavior
  delay?: number;
  disabled?: boolean;

  // Style
  className?: string;
}

const placementClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-text border-x-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-text border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-text border-y-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 border-r-text border-y-transparent border-l-transparent",
};

export const UnifiedTooltip: React.FC<UnifiedTooltipProps> = ({
  content,
  children,
  placement = "top",
  delay = 200,
  disabled = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;

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
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const childrenWithRef = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      children.props.onBlur?.(e);
    },
  });

  const tooltipContent =
    isVisible && typeof document !== "undefined"
      ? createPortal(
          <div
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              zIndex: 9999,
            }}
            className="w-full h-full pointer-events-none"
          >
            <div
              className={cn(
                "relative inline-block",
                placementClasses[placement]
              )}
            >
              {/* Tooltip Box */}
              <div
                className={cn(
                  "bg-text text-surface px-3 py-2 rounded-md text-sm font-medium",
                  "shadow-lg max-w-xs whitespace-nowrap",
                  "animate-fadeIn",
                  className
                )}
                role="tooltip"
              >
                {content}
              </div>

              {/* Arrow */}
              <div
                className={cn(
                  "absolute w-0 h-0 border-4",
                  arrowClasses[placement]
                )}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {childrenWithRef}
      {tooltipContent}
    </>
  );
};

export default UnifiedTooltip;
