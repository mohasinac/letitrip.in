"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * HorizontalScroller
 *
 * Two layout modes selected via the `rows` prop:
 *
 * ┌─ rows = 1 (default) — flex carousel  ─────────────────────────────────────
 * │  <| {item1} {item2} {item3} {item4} |>
 * │     ══════════  (scrollbar when showScrollbar=true)
 * └────────────────────────────────────────────────────────────────────────────
 *
 * ┌─ rows > 1 — CSS-grid multi-row scroller  ──────────────────────────────────
 * │  <| {item1} {item4} {item7} |>
 * │     {item2} {item5} {item8}
 * │     {item3} {item6} {item9}
 * │     ══════════════  (scrollbar when showScrollbar=true)
 * └────────────────────────────────────────────────────────────────────────────
 *
 * Features:
 * - Height driven entirely by item content
 * - Auto-computed visible column count (⌊containerWidth ÷ (itemWidth + gap)⌋)
 *   when `count` is omitted; explicit `count` overrides this
 * - Left / right arrows scroll by one "page" (count columns × itemWidth)
 * - ArrowLeft / ArrowRight keyboard navigation (opt-in, on by default)
 * - Circular auto-scroll for single-row carousels — items array tripled,
 *   seamless wrap via debounced position-reset after scroll settles
 * - Optional thin horizontal scrollbar at the bottom
 * - Width fills parent; viewport-capped via `w-full`
 *
 * @example Multi-row grid scroller (featured products / auctions)
 * ```tsx
 * <HorizontalScroller
 *   items={products}
 *   renderItem={(p) => <ProductCard product={p} />}
 *   itemWidth={160}
 *   rows={2}
 *   showScrollbar
 *   keyExtractor={(p) => p.id}
 * />
 * ```
 *
 * @example Single-row auto-scroll carousel (mobile)
 * ```tsx
 * <HorizontalScroller
 *   items={products}
 *   renderItem={(p) => <ProductCard product={p} />}
 *   itemWidth={160}
 *   autoScroll
 * />
 * ```
 *
 * @example Tab strip
 * ```tsx
 * <HorizontalScroller
 *   items={TABS}
 *   renderItem={(t) => <TabChip tab={t} />}
 *   gap={8}
 *   showScrollbar
 *   autoScroll={false}
 * />
 * ```
 */
export interface HorizontalScrollerProps<T = unknown> {
  /** Array of items to render */
  items: T[];

  /** Render function invoked with (item, originalIndex) */
  renderItem: (item: T, index: number) => React.ReactNode;

  /**
   * Number of rows. Default: 1 (flex carousel).
   * When > 1 the inner container switches to CSS grid with
   * `grid-auto-flow: column` so items fill column-by-column.
   * Auto-scroll is disabled when rows > 1.
   */
  rows?: number;

  /**
   * Explicit item width in px.
   * When omitted the component auto-detects the first child's offsetWidth.
   * Providing it avoids a one-frame layout read and enables precise page steps.
   */
  itemWidth?: number;

  /**
   * How many columns to show at once.
   * Omit to let the component compute: ⌊containerWidth ÷ (itemWidth + gap)⌋.
   * Minimum 1.
   */
  count?: number;

  /** Gap between items in px. Default: 12 */
  gap?: number;

  /**
   * Enable circular auto-scroll (single-row only; ignored when rows > 1).
   * Items array is tripled internally — wrapping is seamless.
   * Default: false
   */
  autoScroll?: boolean;

  /** Milliseconds between each auto-scroll step. Default: 3500 */
  autoScrollInterval?: number;

  /**
   * Pause auto-scroll while the pointer is inside the component.
   * Default: true
   */
  pauseOnHover?: boolean;

  /** Show left / right arrow buttons. Default: true */
  showArrows?: boolean;

  /**
   * Show a thin horizontal scrollbar at the bottom of the scroll area.
   * Default: false
   */
  showScrollbar?: boolean;

  /**
   * Whether ArrowLeft / ArrowRight keyboard events scroll this component.
   * Default: true
   */
  enableKeyboard?: boolean;

  /** Extra CSS class(es) on the outer wrapper div */
  className?: string;

  /** Extra CSS class(es) on the inner overflowing container */
  scrollerClassName?: string;

  /**
   * Key extractor for list rendering.
   * Falls back to the item's position index when omitted.
   */
  keyExtractor?: (item: T, index: number) => string;
}

export function HorizontalScroller<T = unknown>({
  items,
  renderItem,
  rows = 1,
  itemWidth,
  count,
  gap = 12,
  autoScroll = false,
  autoScrollInterval = 3500,
  pauseOnHover = true,
  showArrows = true,
  showScrollbar = false,
  enableKeyboard = true,
  className = "",
  scrollerClassName = "",
  keyExtractor,
}: HorizontalScrollerProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [detectedItemWidth, setDetectedItemWidth] = useState(itemWidth ?? 0);

  const isPausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resettingRef = useRef(false);
  const initializingRef = useRef(false);

  // Auto-scroll only for single-row mode
  const circularScroll = autoScroll && rows === 1;

  // Triple items for circular mode
  const displayItems = circularScroll ? [...items, ...items, ...items] : items;

  // ─── Resolved item width ──────────────────────────────────────────────────

  const resolvedItemWidth = useCallback((): number => {
    return itemWidth ?? detectedItemWidth;
  }, [itemWidth, detectedItemWidth]);

  // ─── Page step ────────────────────────────────────────────────────────────

  const getPageStep = useCallback((): number => {
    const iw = resolvedItemWidth();
    if (!iw) return containerRef.current?.offsetWidth ?? 300;
    const containerWidth = containerRef.current?.offsetWidth ?? iw + gap;
    const visibleCols =
      count ?? Math.max(1, Math.floor(containerWidth / (iw + gap)));
    return visibleCols * (iw + gap);
  }, [resolvedItemWidth, count, gap]);

  // ─── Single-step for auto-advance ─────────────────────────────────────────

  const getSingleStep = useCallback((): number => {
    const iw = resolvedItemWidth();
    return iw ? iw + gap : (containerRef.current?.offsetWidth ?? 200);
  }, [resolvedItemWidth, gap]);

  // ─── Arrow visibility ─────────────────────────────────────────────────────

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 2);
  }, []);

  // ─── Circular position reset ──────────────────────────────────────────────

  const checkCircularReset = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !circularScroll || items.length === 0) return;
    const third = el.scrollWidth / 3;
    if (el.scrollLeft < third || el.scrollLeft >= 2 * third) {
      resettingRef.current = true;
      el.scrollLeft += el.scrollLeft < third ? third : -third;
      setTimeout(() => {
        resettingRef.current = false;
        updateArrows();
      }, 50);
    } else {
      updateArrows();
    }
  }, [circularScroll, items.length, updateArrows]);

  // ─── Scroll handler ───────────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    if (resettingRef.current || initializingRef.current) return;
    updateArrows();
    if (!circularScroll) return;
    if (resetDebounceRef.current) clearTimeout(resetDebounceRef.current);
    resetDebounceRef.current = setTimeout(checkCircularReset, 350);
  }, [updateArrows, circularScroll, checkCircularReset]);

  // ─── Arrow actions ────────────────────────────────────────────────────────

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: getPageStep(), behavior: "smooth" });
  }, [getPageStep]);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -getPageStep(), behavior: "smooth" });
  }, [getPageStep]);

  const autoAdvance = useCallback(() => {
    scrollRef.current?.scrollBy({ left: getSingleStep(), behavior: "smooth" });
  }, [getSingleStep]);

  // ─── Auto-scroll timer ────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!circularScroll) return;
    stopTimer();
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) autoAdvance();
    }, autoScrollInterval);
  }, [circularScroll, autoScrollInterval, autoAdvance, stopTimer]);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  // ─── Hover pause ──────────────────────────────────────────────────────────

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) isPausedRef.current = true;
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  // ─── Initial circular position ────────────────────────────────────────────

  useEffect(() => {
    if (!circularScroll || items.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    initializingRef.current = true;
    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth / 3;
      updateArrows();
      setTimeout(() => {
        initializingRef.current = false;
      }, 100);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circularScroll, items.length]);

  // ─── Auto-detect item width from first child ──────────────────────────────

  useEffect(() => {
    if (itemWidth) return;
    const el = scrollRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (first && first.offsetWidth > 0) setDetectedItemWidth(first.offsetWidth);
  });

  // ─── ResizeObserver ───────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(container);
    return () => ro.disconnect();
  }, [updateArrows]);

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enableKeyboard) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollLeft();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollRight();
      }
    },
    [enableKeyboard, scrollLeft, scrollRight],
  );

  // ─── Styles ───────────────────────────────────────────────────────────────

  const { themed, utilities } = THEME_CONSTANTS;

  const iw = resolvedItemWidth();
  const isGrid = rows > 1;

  const scrollbarClass = showScrollbar
    ? utilities.scrollbarThinX
    : utilities.scrollbarHide;

  const arrowBtn = [
    "absolute top-1/2 -translate-y-1/2 z-10",
    "w-9 h-9 flex items-center justify-center rounded-full shadow-md border",
    "text-xl font-bold leading-none select-none",
    "transition-all duration-150 active:scale-90",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
    themed.bgPrimary,
    themed.border,
    themed.textPrimary,
    "hover:bg-gray-100 dark:hover:bg-gray-700",
  ].join(" ");

  const innerStyle: React.CSSProperties = isGrid
    ? {
        display: "grid",
        gridTemplateRows: `repeat(${rows}, minmax(0, auto))`,
        gridAutoFlow: "column",
        gridAutoColumns: iw ? `${iw}px` : "max-content",
        gap: `${gap}px`,
        paddingBottom: showScrollbar ? "4px" : undefined,
      }
    : { gap: `${gap}px` };

  const innerClassName = [
    "overflow-x-auto scroll-smooth",
    isGrid ? "" : "flex snap-x snap-mandatory",
    scrollbarClass,
    scrollerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={enableKeyboard ? 0 : undefined}
      role="region"
      aria-label="Scrollable content"
    >
      {/* ── Left arrow ─────────────────────────────────────────────────── */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={scrollLeft}
          className={`${arrowBtn} -left-4 sm:-left-5`}
          aria-label="Scroll left"
        >
          ‹
        </button>
      )}

      {/* ── Scroll container ───────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={innerClassName}
        style={innerStyle}
      >
        {displayItems.map((item, i) => {
          const baseIndex = i % items.length;
          const copyIndex = Math.floor(i / items.length);
          const key = keyExtractor
            ? `${keyExtractor(item, baseIndex)}_c${copyIndex}`
            : `${i}`;

          return isGrid ? (
            <div key={key}>{renderItem(item, baseIndex)}</div>
          ) : (
            <div
              key={key}
              className="flex-none snap-start"
              style={iw ? { width: `${iw}px` } : undefined}
            >
              {renderItem(item, baseIndex)}
            </div>
          );
        })}
      </div>

      {/* ── Right arrow ────────────────────────────────────────────────── */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={scrollRight}
          className={`${arrowBtn} -right-4 sm:-right-5`}
          aria-label="Scroll right"
        >
          ›
        </button>
      )}
    </div>
  );
}
