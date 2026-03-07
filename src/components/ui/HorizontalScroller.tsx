"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";
import { useHorizontalScrollDrag } from "./useHorizontalScrollDrag";
import { useHorizontalAutoScroll } from "./useHorizontalAutoScroll";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Responsive items-per-view map.
 * The component measures the container width each render tick and picks the
 * highest-matching breakpoint value.
 *
 * item width = (availableWidth - (n-1) Ã— gap) / n
 *
 * @example { base: 1, sm: 2, md: 3, lg: 4, '2xl': 5 }
 */
export interface PerViewConfig {
  base: number;
  sm?: number; // >= 640 px
  md?: number; // >= 768 px
  lg?: number; // >= 1024 px
  xl?: number; // >= 1280 px
  "2xl"?: number; // >= 1536 px
}

function resolvePerView(cfg: PerViewConfig, containerWidth: number): number {
  let n = cfg.base;
  if (cfg.sm !== undefined && containerWidth >= 640) n = cfg.sm;
  if (cfg.md !== undefined && containerWidth >= 768) n = cfg.md;
  if (cfg.lg !== undefined && containerWidth >= 1024) n = cfg.lg;
  if (cfg.xl !== undefined && containerWidth >= 1280) n = cfg.xl;
  if (cfg["2xl"] !== undefined && containerWidth >= 1536) n = cfg["2xl"];
  return Math.max(1, n);
}

// â”€â”€â”€ Arrow button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ArrowButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  size?: "sm" | "lg";
  disabled?: boolean;
}

function ArrowButton({
  direction,
  onClick,
  size = "sm",
  disabled = false,
}: ArrowButtonProps) {
  const { themed, flex } = THEME_CONSTANTS;

  if (size === "lg") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
        className={[
          `${flex.noShrink} self-stretch`,
          `${flex.center}`,
          "w-12 min-h-[3rem]",
          "rounded-xl",
          "border-2",
          themed.border,
          "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm",
          disabled
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-white dark:hover:bg-gray-800 hover:shadow-md active:scale-95 cursor-pointer",
          "transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        ].join(" ")}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={themed.textPrimary}
          aria-hidden
        >
          {direction === "left" ? (
            <polyline points="15 18 9 12 15 6" />
          ) : (
            <polyline points="9 18 15 12 9 6" />
          )}
        </svg>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      className={[
        `${flex.noShrink} self-stretch`,
        `${flex.center}`,
        "w-8",
        "border rounded-lg",
        themed.border,
        themed.bgPrimary,
        "hover:bg-gray-100 dark:hover:bg-gray-700",
        "active:scale-95",
        "transition-all duration-150",
        "cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
      ].join(" ")}
    >
      {direction === "left" ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={themed.textPrimary}
          aria-hidden
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={themed.textPrimary}
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </Button>
  );
}

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface HorizontalScrollerProps<T = unknown> {
  /** Array of items to render — required when `children` is not provided */
  items?: T[];

  /** Render function called with (item, originalIndex) — required when `children` is not provided */
  renderItem?: (item: T, index: number) => React.ReactNode;

  /**
   * Number of rows. Default: 1 (flex carousel).
   * When > 1 the inner container switches to a column-flow CSS grid.
   * Auto-scroll is disabled when rows > 1.
   */
  rows?: number;

  /**
   * Responsive items-per-view config.
   * Item width is computed as `(containerWidth - (n-1) Ã— gap) / n`.

   *
   * @example { base: 1, sm: 2, md: 3, lg: 4, '2xl': 5 }
   */
  perView?: PerViewConfig;

  /**
   * Explicit item width in px.
   * Falls back to auto-detection when omitted and `perView` is not set.
   */
  itemWidth?: number;

  /** Gap between items in px. Default: 12 */
  gap?: number;

  /**
   * Enable circular auto-scroll (single-row only).
   * Items array is tripled internally â€” wrapping is seamless.
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

  /** Show full-height arrow buttons. Default: true */
  showArrows?: boolean;

  /**
   * Show subtle gradient fade overlays on the left/right edges to signal
   * that more content is available in that direction.
   * Default: true
   */
  showFadeEdges?: boolean;

  /**
   * Whether ArrowLeft / ArrowRight keyboard events scroll this component.
   * Default: true
   */
  enableKeyboard?: boolean;

  /** Extra CSS class(es) on the outer wrapper */
  className?: string;

  /** Extra CSS class(es) on the inner scroll container */
  scrollerClassName?: string;

  /** Key extractor â€” falls back to position index when omitted */
  keyExtractor?: (item: T, index: number) => string;
  /**
   * Enable CSS scroll-snap per child item.
   * Adds `snap-x snap-mandatory` to the scroll container (children passthrough
   * mode) or `snap-start` to each item wrapper (items mode).
   * Default: false
   */
  snapToItems?: boolean;

  /**
   * Simple children passthrough mode — renders `children` directly inside a
   * scrollable flex container without carousel machinery (no arrows, no
   * auto-scroll, no fade edges).
   * When this is provided, `items` / `renderItem` are ignored.
   */
  children?: React.ReactNode;

  /**
   * External ref forwarded to the scroll container div.
   * Only applies in children passthrough mode.
   */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * Scroll event handler forwarded to the scroll container div.
   * Only applies in children passthrough mode.
   */
  onScroll?: React.UIEventHandler<HTMLDivElement>;

  /**
   * Show a visible thin horizontal scrollbar below the scroll container.
   * Default: false (scrollbar hidden)
   */
  showScrollbar?: boolean;

  /**
   * Size of the arrow navigation buttons.
   * - 'sm' (default): compact 32 px buttons (original style)
   * - 'lg': 48 px buttons with backdrop, for section carousels
   */
  arrowSize?: "sm" | "lg";
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function HorizontalScroller<T = unknown>({
  items = [] as T[],
  renderItem = () => null,
  rows = 1,
  perView: perViewProp,
  itemWidth: itemWidthProp,
  gap = 12,
  autoScroll = false,
  autoScrollInterval = 3500,
  pauseOnHover = true,
  showArrows = true,
  showFadeEdges = true,
  enableKeyboard = true,
  className = "",
  scrollerClassName = "",
  keyExtractor,
  snapToItems = false,
  children,
  scrollContainerRef,
  onScroll,
  showScrollbar = false,
  arrowSize = "sm",
}: HorizontalScrollerProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Drag-to-scroll state ────────────────────────────────────────────────────
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  /**
   * Resolved item width in px.
   * - perView:    computed as (availableWidth âˆ’ (nâˆ’1)Â·gap) / n
   * - itemWidth:  fixed prop
   * - neither:    auto-detected from first child (variable-width / pill mode)
   */
  const [resolvedIW, setResolvedIW] = useState<number>(itemWidthProp ?? 0);
  const resolvedIWRef = useRef<number>(itemWidthProp ?? 0);

  const isGrid = rows > 1;
  const circularScroll = autoScroll && !isGrid;
  const simpleAutoScroll = autoScroll && isGrid;
  const displayItems = circularScroll ? [...items, ...items, ...items] : items;

  // â”€â”€â”€ Arrow visibility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 1);
  }, []);

  // â”€â”€â”€ Page step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const getPageStep = useCallback((): number => {
    const iw = resolvedIWRef.current;
    if (!iw) return containerRef.current?.offsetWidth ?? 300;
    const cw = containerRef.current?.offsetWidth ?? iw + gap;
    const cols = Math.max(1, Math.floor(cw / (iw + gap)));
    return cols * (iw + gap);
  }, [gap]);

  const getSingleStep = useCallback((): number => {
    const iw = resolvedIWRef.current;
    return iw ? iw + gap : (containerRef.current?.offsetWidth ?? 200);
  }, [gap]);

  // â”€â”€â”€ Circular scroll helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const resettingRef = useRef(false);
  const initializingRef = useRef(false);
  const resetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkCircularReset = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !circularScroll || items.length === 0) return;
    const third = el.scrollWidth / 3;
    if (el.scrollLeft < third || el.scrollLeft >= 2 * third) {
      resettingRef.current = true;
      el.scrollLeft += el.scrollLeft < third ? third : -third;
      setTimeout(() => {
        resettingRef.current = false;
        updateScrollEdges();
      }, 50);
    } else {
      updateScrollEdges();
    }
  }, [circularScroll, items.length, updateScrollEdges]);

  const handleScroll = useCallback(() => {
    if (resettingRef.current || initializingRef.current) return;
    updateScrollEdges();
    if (!circularScroll) return;
    if (resetDebounceRef.current) clearTimeout(resetDebounceRef.current);
    resetDebounceRef.current = setTimeout(checkCircularReset, 350);
  }, [updateScrollEdges, circularScroll, checkCircularReset]);

  useEffect(
    () => () => {
      if (resetDebounceRef.current) clearTimeout(resetDebounceRef.current);
    },
    [],
  );

  // â”€â”€â”€ Arrow / auto-advance actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const scrollBy = useCallback((px: number) => {
    scrollRef.current?.scrollBy({ left: px, behavior: "smooth" });
  }, []);
  const scrollRight = useCallback(
    () => scrollBy(getPageStep()),
    [scrollBy, getPageStep],
  );
  const scrollLeft = useCallback(
    () => scrollBy(-getPageStep()),
    [scrollBy, getPageStep],
  );
  const autoAdvance = useCallback(
    () => scrollBy(getSingleStep()),
    [scrollBy, getSingleStep],
  );

  // â”€â”€â”€ Auto-scroll timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const isHoverPausedRef = useRef(false);
  const isDragPausedRef = useRef(false);

  const onAutoScrollTick = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (simpleAutoScroll) {
      if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        autoAdvance();
      }
    } else {
      autoAdvance();
    }
  }, [simpleAutoScroll, autoAdvance]);

  const autoScrollCtrl = useHorizontalAutoScroll({
    enabled: autoScroll,
    interval: autoScrollInterval,
    onTick: onAutoScrollTick,
  });

  const pauseAutoScroll = useCallback(() => {
    autoScrollCtrl.pause();
  }, [autoScrollCtrl]);
  const resumeAutoScroll = useCallback(() => {
    if (!isHoverPausedRef.current && !isDragPausedRef.current)
      autoScrollCtrl.resume();
  }, [autoScrollCtrl]);

  const drag = useHorizontalScrollDrag(scrollRef, {
    onDragStart: () => {
      isDragPausedRef.current = true;
      pauseAutoScroll();
    },
    onDragEnd: () => {
      isDragPausedRef.current = false;
      resumeAutoScroll();
    },
  });

  const handleMouseEnter = useCallback(() => {
    if (!pauseOnHover) return;
    isHoverPausedRef.current = true;
    pauseAutoScroll();
  }, [pauseOnHover, pauseAutoScroll]);

  const handleMouseLeave = useCallback(() => {
    isHoverPausedRef.current = false;
    resumeAutoScroll();
  }, [resumeAutoScroll]);

  // â”€â”€â”€ Initial circular position â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Double-RAF ensures the second frame fires after React has re-rendered items
  // with their resolved widths (set by the ResizeObserver effect), so scrollWidth
  // is accurate when we jump to the middle third.
  useEffect(() => {
    if (!circularScroll || items.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    initializingRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollLeft = el.scrollWidth / 3;
        updateScrollEdges();
        setTimeout(() => {
          initializingRef.current = false;
        }, 100);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circularScroll, items.length]);

  // â”€â”€â”€ Auto-detect width from first child (variable-width / pill mode) â”€â”€â”€â”€â”€

  useEffect(() => {
    if (itemWidthProp || perViewProp) return;
    const el = scrollRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (first && first.offsetWidth > 0) {
      resolvedIWRef.current = first.offsetWidth;
      setResolvedIW(first.offsetWidth);
    }
  });

  // â”€â”€â”€ ResizeObserver â€” recompute item width + arrow state on resize â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recompute = () => {
      updateScrollEdges();
      const available = container.clientWidth;

      if (itemWidthProp) {
        resolvedIWRef.current = itemWidthProp;
        setResolvedIW(itemWidthProp);
        return;
      }

      if (perViewProp) {
        const n = resolvePerView(perViewProp, available);
        const w = Math.floor((available - (n - 1) * gap) / n);
        if (w > 0) {
          resolvedIWRef.current = w;
          setResolvedIW(w);
        }
      }
    };

    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    recompute();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateScrollEdges, perViewProp, itemWidthProp, gap]);

  // â”€â”€â”€ Keyboard navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enableKeyboard) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollLeft();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollRight();
      }
    },
    [enableKeyboard, scrollLeft, scrollRight],
  );

  // ─── Drag-to-scroll handlers (unified pointer events — mouse + touch) ─────────

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const { utilities, overflow, flex } = THEME_CONSTANTS;

  // ─── Children passthrough mode ─────────────────────────────────────────────
  if (children !== undefined) {
    return (
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className={[
          "flex overflow-x-auto touch-pan-x",
          snapToItems ? "snap-x snap-mandatory" : "",
          showScrollbar ? utilities.scrollbarThinX : utilities.scrollbarHide,
          showScrollbar ? "pb-2" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>
    );
  }

  const innerStyle: React.CSSProperties = {
    ...(isGrid
      ? {
          display: "grid",
          gridTemplateRows: `repeat(${rows}, minmax(0, auto))`,
          gridAutoFlow: "column",
          gridAutoColumns: resolvedIW ? `${resolvedIW}px` : "max-content",
          gap: `${gap}px`,
        }
      : { gap: `${gap}px` }),
    ...drag.style,
  };

  const innerClassName = [
    overflow.xAuto,
    isGrid ? "" : "flex",
    snapToItems ? "snap-x snap-mandatory" : "",
    showScrollbar ? utilities.scrollbarThinX : utilities.scrollbarHide,
    showScrollbar ? "pb-2" : "",
    drag.cursorClass,
    scrollerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`flex items-stretch gap-1.5 w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={enableKeyboard ? 0 : undefined}
      role="region"
      aria-label="Scrollable content"
    >
      {/* â”€â”€ Left arrow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showArrows && (
        <ArrowButton
          direction="left"
          onClick={scrollLeft}
          size={arrowSize}
          disabled={!canScrollLeft}
        />
      )}

      {/* â”€â”€ Scroll viewport â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        ref={containerRef}
        className={`relative ${flex.growMin} ${overflow.hidden}`}
      >
        {showFadeEdges && (
          <div
            aria-hidden
            className={[
              "absolute inset-y-0 left-0 w-10 pointer-events-none z-10",
              "bg-gradient-to-r from-white/75 dark:from-gray-900/75 to-transparent",
              "transition-opacity duration-200",
              canScrollLeft ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          {...drag.handlers}
          className={innerClassName}
          style={innerStyle}
        >
          {displayItems.map((item, i) => {
            const baseIndex = i % items.length;
            const copyIndex = Math.floor(i / items.length);
            const extractedKey = keyExtractor
              ? keyExtractor(item, baseIndex)
              : undefined;
            const key =
              extractedKey != null ? `${extractedKey}_c${copyIndex}` : `${i}`;

            const itemStyle: React.CSSProperties | undefined =
              resolvedIW && !isGrid
                ? {
                    width: `${resolvedIW}px`,
                    flexShrink: 0,
                    transition: "width 300ms ease-in-out",
                  }
                : isGrid
                  ? undefined
                  : { flexShrink: 0 };

            return isGrid ? (
              <div key={key}>{renderItem(item, baseIndex)}</div>
            ) : (
              <div
                key={key}
                style={itemStyle}
                className={snapToItems ? "snap-start" : undefined}
              >
                {renderItem(item, baseIndex)}
              </div>
            );
          })}
        </div>

        {showFadeEdges && (
          <div
            aria-hidden
            className={[
              "absolute inset-y-0 right-0 w-10 pointer-events-none z-10",
              "bg-gradient-to-l from-white/75 dark:from-gray-900/75 to-transparent",
              "transition-opacity duration-200",
              canScrollRight ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
        )}
      </div>

      {/* â”€â”€ Right arrow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showArrows && (
        <ArrowButton
          direction="right"
          onClick={scrollRight}
          size={arrowSize}
          disabled={!canScrollRight}
        />
      )}
    </div>
  );
}
