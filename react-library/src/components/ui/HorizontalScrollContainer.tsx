/**
 * HorizontalScrollContainer Component
 *
 * Framework-agnostic horizontal scrollable container with navigation arrows.
 * Calculates visible items and provides smooth scrolling.
 *
 * @example
 * ```tsx
 * <HorizontalScrollContainer
 *   title="Featured Products"
 *   viewAllHref="/products"
 *   itemWidth="280px"
 * >
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </HorizontalScrollContainer>
 * ```
 */

import React, { useEffect, useRef, useState } from "react";

export interface HorizontalScrollContainerProps {
  /** Section title */
  title?: string;
  /** View all link href */
  viewAllHref?: string;
  /** View all link text */
  viewAllText?: string;
  /** View all click handler (if not using href) */
  onViewAllClick?: () => void;
  /** Container children */
  children: React.ReactNode;
  /** Item width (CSS value) */
  itemWidth?: string;
  /** Gap between items (CSS value) */
  gap?: string;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Heading level for accessibility */
  headingLevel?: "h2" | "h3" | "h4";
  /** Arrow style variant */
  arrowStyle?: "compact" | "full-height";
  /** Additional CSS classes */
  className?: string;
  /** Custom ChevronLeft icon */
  ChevronLeftIcon?: React.ComponentType<{ className?: string }>;
  /** Custom ChevronRight icon */
  ChevronRightIcon?: React.ComponentType<{ className?: string }>;
  /** Custom ExternalLink icon */
  ExternalLinkIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultChevronLeftIcon({ className }: { className?: string }) {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function DefaultChevronRightIcon({ className }: { className?: string }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function DefaultExternalLinkIcon({ className }: { className?: string }) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function HorizontalScrollContainer({
  title,
  viewAllHref,
  viewAllText = "View All",
  onViewAllClick,
  children,
  itemWidth = "280px",
  gap = "1rem",
  showArrows = true,
  headingLevel = "h2",
  arrowStyle = "full-height",
  className = "",
  ChevronLeftIcon = DefaultChevronLeftIcon,
  ChevronRightIcon = DefaultChevronRightIcon,
  ExternalLinkIcon = DefaultExternalLinkIcon,
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number>(0);

  const calculateVisibleItems = () => {
    if (containerRef.current) {
      const totalWidth = containerRef.current.clientWidth;
      const itemWidthNum = parseInt(itemWidth);
      const gapNum = parseInt(gap) * 16;
      const arrowWidth = showArrows && arrowStyle === "full-height" ? 48 : 0;
      const availableWidth = totalWidth - arrowWidth * 2;
      const itemsPerRow = Math.floor(availableWidth / (itemWidthNum + gapNum));
      const actualItems = Math.max(1, itemsPerRow);
      setVisibleItems(actualItems);
    }
  };

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

    const handleResize = () => {
      calculateVisibleItems();
      checkScroll();
    };

    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", handleResize);

      return () => {
        scrollElement.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [children, itemWidth, gap, showArrows, arrowStyle]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const itemWidthNum = parseInt(itemWidth);
      const gapNum = parseInt(gap) * 16;
      const scrollAmount = (itemWidthNum + gapNum) * visibleItems;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const Heading = headingLevel;

  const viewAllLink = viewAllHref ? (
    <a
      href={viewAllHref}
      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
    >
      {viewAllText}
      <ExternalLinkIcon className="w-4 h-4" />
    </a>
  ) : onViewAllClick ? (
    <button
      onClick={onViewAllClick}
      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
    >
      {viewAllText}
      <ExternalLinkIcon className="w-4 h-4" />
    </button>
  ) : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Header */}
      {(title || viewAllLink) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <Heading className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </Heading>
          )}
          {viewAllLink}
        </div>
      )}

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showArrows && showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 z-10 bg-white dark:bg-gray-800",
              "border border-gray-300 dark:border-gray-600 rounded-full",
              "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              arrowStyle === "full-height"
                ? "top-0 bottom-0 w-10"
                : "top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide"
          style={{
            display: "flex",
            gap,
            scrollSnapType: "x mandatory",
          }}
        >
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              style={{
                minWidth: itemWidth,
                scrollSnapAlign: "start",
              }}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showArrows && showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 z-10 bg-white dark:bg-gray-800",
              "border border-gray-300 dark:border-gray-600 rounded-full",
              "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              arrowStyle === "full-height"
                ? "top-0 bottom-0 w-10"
                : "top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
            )}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default HorizontalScrollContainer;
