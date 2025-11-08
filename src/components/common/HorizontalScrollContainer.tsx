"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";

interface HorizontalScrollContainerProps {
  title?: string;
  viewAllLink?: string;
  viewAllText?: string;
  children: React.ReactNode;
  className?: string;
  itemWidth?: string;
  gap?: string;
  showArrows?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
}

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
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll position and update arrow visibility
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);

      return () => {
        scrollElement.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
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
                className:
                  headingLevel === "h2"
                    ? "text-2xl font-bold text-gray-900"
                    : "text-xl font-bold text-gray-900",
              },
              title
            )}
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              <span>{viewAllText}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showArrows && showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth"
          style={{
            gap: gap,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {React.Children.map(children, (child) => (
            <div
              style={{ minWidth: itemWidth, maxWidth: itemWidth }}
              className="flex-shrink-0"
            >
              {child}
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showArrows && showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};
