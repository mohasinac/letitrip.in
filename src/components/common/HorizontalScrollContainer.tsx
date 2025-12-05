/**
 * @fileoverview React Component
 * @module src/components/common/HorizontalScrollContainer
 * @description This file contains the HorizontalScrollContainer component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";

/**
 * HorizontalScrollContainerProps interface
 * 
 * @interface
 * @description Defines the structure and contract for HorizontalScrollContainerProps
 */
interface HorizontalScrollContainerProps {
  /** Title */
  title?: string;
  /** View All Link */
  viewAllLink?: string;
  /** View All Text */
  viewAllText?: string;
  /** Children */
  children: React.ReactNode;
  /** Class Name */
  className?: string;
  /** Item Width */
  itemWidth?: string;
  /** Gap */
  gap?: string;
  /** Show Arrows */
  showArrows?: boolean;
  /** Heading Level */
  headingLevel?: "h2" | "h3" | "h4";
  /** Arrow Style */
  arrowStyle?: "compact" | "full-height";
}

/**
 * H
 * @constant
 */
export const HorizontalScrollContainer: React.FC<
  HorizontalScrollContainerProps
> = ({
  title,
  viewAllLink,
  viewAllText = "View All",
  children,
  className = "",
  itemWidth = "280px",
  gap = "1rem",
  showArrows = true,
  headingLevel = "h2",
  arrowStyle = "full-height",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [containerMaxWidth, setContainerMaxWidth] = useState<string>("100%");

  // Calculate how many items can fit in the container width
  /**
   * Calculates visible items
   *
   * @returns {any} The calculatevisibleitems result
   */

  /**
   * Calculates visible items
   *
   * @returns {any} The calculatevisibleitems result
   */

  const calculateVisibleItems = () => {
    if (containerRef.current) {
      const totalWidth = containerRef.current.clientWidth;
      const itemWidthNum = parseInt(itemWidth);
      const gapNum = parseInt(gap) * 16; // Convert rem to px (assuming 1rem = 16px)
      const arrowWidth = showArrows && arrowStyle === "full-height" ? 48 : 0; // 2 arrows * ~24px each

      // Available width after accounting for arrows
      const availableWidth = totalWidth - arrowWidth * 2;

      // Calculate how many complete items fit
      const itemsPerRow = Math.floor(availableWidth / (itemWidthNum + gapNum));
      const actualItems = Math.max(1, itemsPerRow);
      setVisibleItems(actualItems);

      // Set exact width for the scroll container to show only complete items
      const exactWidth =
        actualItems * itemWidthNum + (actualItems - 1) * gapNum;
      setContainerMaxWidth(`${exactWidth}px`);
    }
  };

  // Check scroll position and update arrow visibility
  /**
   * Performs check scroll operation
   *
   * @returns {any} The checkscroll result
   */

  /**
   * Performs check scroll operation
   *
   * @returns {any} The checkscroll result
   */

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    calculateVisibleItems();
    checkScroll();
    const scrollElement = scrollRef.current;

    /**
     * Handles resize event
     *
     * @returns {any} The handleresize result
     */

    /**
     * Handles resize event
     *
     * @returns {any} The handleresize result
     */

    const handleResize = () => {
      calculateVisibleItems();
      checkScroll();
    };

    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      globalThis.addEventListener?.("resize", handleResize);

      return () => {
        scrollElement.removeEventListener("scroll", checkScroll);
        globalThis.removeEventListener?.("resize", handleResize);
      };
    }
  }, [children, itemWidth, gap, showArrows, arrowStyle]);

  /**
   * Performs scroll operation
   *
   * @param {"left" | "right"} direction - The direction
   *
   * @returns {any} The scroll result
   */

  /**
   * Performs scroll operation
   *
   * @param {"left" | "right"} direction - The direction
   *
   * @returns {any} The scroll result
   */

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const itemWidthNum = parseInt(itemWidth);
      const gapNum = parseInt(gap) * 16;
      /**
       * Performs scroll amount operation
       *
       * @returns {any} The scrollamount result
       */

      /**
       * Performs scroll amount operation
       *
       * @returns {any} The scrollamount result
       */

      const scrollAmount = (itemWidthNum + gapNum) * visibleItems;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      {(title || viewAllLink) && (
        <div className="flex items-center justify-between mb-4">
          {title &&
            React.createElement(
              headingLevel,
              {
                /** Class Name */
                className:
                  headingLevel === "h2"
                    ? "text-2xl font-bold text-gray-900 dark:text-white"
                    : "text-xl font-bold text-gray-900 dark:text-white",
              },
              title,
            )}
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              <span>{viewAllText}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="relative flex items-stretch justify-center"
      >
        {/* Left Arrow */}
        {showArrows && showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className={
              arrowStyle === "full-height"
                ? "flex-shrink-0 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-lg px-3 transition-all flex items-center justify-center group"
                : "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            }
            aria-label="Scroll left"
          >
            <ChevronLeft
              className={
                arrowStyle === "full-height"
                  ? "w-8 h-8 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                  : "w-6 h-6 text-gray-700 dark:text-gray-300"
              }
            />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{
            /** Gap */
            gap: gap,
            /** Scrollbar Width */
            scrollbarWidth: "none",
            /** Ms Overflow Style */
            msOverflowStyle: "none",
            /** Max Width */
            maxWidth: containerMaxWidth,
          }}
        >
          {React.Children.map(children, (child) => (
            <div
              className="flex-shrink-0 snap-start"
              style={{ width: itemWidth }}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showArrows && showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className={
              arrowStyle === "full-height"
                ? "flex-shrink-0 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-lg px-3 transition-all flex items-center justify-center group"
                : "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            }
            aria-label="Scroll right"
          >
            <ChevronRight
              className={
                arrowStyle === "full-height"
                  ? "w-8 h-8 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                  : "w-6 h-6 text-gray-700 dark:text-gray-300"
              }
            />
          </button>
        )}
      </div>
    </div>
  );
};
