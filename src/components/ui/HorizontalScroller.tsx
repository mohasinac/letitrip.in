"use client";

import {
  useRef,
  useEffect,
  useCallback,
  type RefObject,
  type ReactNode,
} from "react";
import { THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";

export interface PerViewConfig {
  base?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}

export interface HorizontalScrollerProps<T = unknown> {
  /** Render child nodes directly (simple mode) */
  children?: ReactNode;
  className?: string;
  /** Gap in pixels between items */
  gap?: number;
  /** Snap each item into view */
  snapToItems?: boolean;
  /** Show prev/next arrow buttons */
  showArrows?: boolean;
  arrowSize?: "sm" | "md" | "lg";
  /** Show scrollbar */
  showScrollbar?: boolean;
  /** Show fade edges */
  showFadeEdges?: boolean;
  /** External ref for scroll container (for programmatic control) */
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
  /** Scroll event handler */
  onScroll?: () => void;
  // ─── Items mode ─────────────────────────────────────────────────
  items?: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  perView?: number | PerViewConfig;
  rows?: number;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  minItemWidth?: number;
  pauseOnHover?: boolean;
  /** Optional className for each generated item wrapper in items mode */
  itemClassName?: string;
}

function resolvePerView(perView: number | PerViewConfig | undefined): number {
  if (!perView) return 3;
  if (typeof perView === "number") return perView;
  // priority: xl > lg > md > sm > xs > base
  return (
    perView.xl ??
    perView.lg ??
    perView.md ??
    perView.sm ??
    perView.xs ??
    perView.base ??
    3
  );
}

export function HorizontalScroller<T = unknown>({
  children,
  className = "",
  gap = 16,
  snapToItems,
  showArrows,
  arrowSize = "md",
  showScrollbar,
  showFadeEdges,
  scrollContainerRef: externalRef,
  onScroll,
  items,
  renderItem,
  keyExtractor,
  perView,
  rows = 1,
  autoScroll,
  autoScrollInterval = 3500,
  minItemWidth,
  itemClassName = "",
}: HorizontalScrollerProps<T>) {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = (externalRef ??
    internalRef) as RefObject<HTMLDivElement>;
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  const scrollBy = useCallback(
    (direction: 1 | -1) => {
      const el = containerRef.current;
      if (!el) return;
      const width = el.clientWidth;
      el.scrollBy({ left: direction * width * 0.8, behavior: "smooth" });
    },
    [containerRef],
  );

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll) return;
    autoScrollTimer.current = setInterval(
      () => scrollBy(1),
      autoScrollInterval,
    );
    return () => clearInterval(autoScrollTimer.current);
  }, [autoScroll, autoScrollInterval, scrollBy]);

  const itemsMode = items != null && renderItem != null;
  const { dimensions } = THEME_CONSTANTS.card;

  const arrowCls = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-base",
    lg: "w-11 h-11 text-lg",
  }[arrowSize];

  const scrollerCls = [
    "flex overflow-x-auto scroll-smooth",
    snapToItems ? "snap-x snap-mandatory" : "",
    showScrollbar ? "" : "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    "pb-1",
  ]
    .filter(Boolean)
    .join(" ");

  const content = itemsMode
    ? items.map((item, i) => (
        <div
          key={keyExtractor ? keyExtractor(item, i) : i}
          className={[
            snapToItems ? "snap-start flex-none" : "flex-none",
            dimensions.railMinW,
            dimensions.railMaxW,
            itemClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          style={minItemWidth ? { minWidth: minItemWidth } : undefined}
        >
          {renderItem(item, i)}
        </div>
      ))
    : children;

  if (showArrows) {
    return (
      <div className={`relative ${className}`}>
        {showFadeEdges && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 ${arrowCls} rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors`}
        >
          ‹
        </Button>
        <div
          ref={containerRef}
          onScroll={onScroll}
          className={scrollerCls}
          style={{ gap: `${gap}px`, paddingLeft: 36, paddingRight: 36 }}
        >
          {content}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 ${arrowCls} rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors`}
        >
          ›
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {showFadeEdges && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
        </>
      )}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className={scrollerCls}
        style={{ gap: `${gap}px` }}
      >
        {content}
      </div>
    </div>
  );
}
