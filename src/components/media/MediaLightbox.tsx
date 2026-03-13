"use client";

/**
 * MediaLightbox
 *
 * Full-screen media viewer with zoom, pan, fullscreen, keyboard navigation,
 * mouse-wheel zoom, touch pinch-zoom, and thumbnail strip.
 *
 * Usage:
 *   <MediaLightbox items={images} initialIndex={0} isOpen={open} onClose={() => setOpen(false)} />
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { Button, Caption } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;
import { MediaImage } from "./MediaImage";
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface LightboxItem {
  src: string;
  alt: string;
}

export interface MediaLightboxProps {
  /** Array of image items to display in the viewer. */
  items: LightboxItem[];
  /** Index of the initially visible image. */
  initialIndex?: number;
  /** Whether the lightbox is open. */
  isOpen: boolean;
  /** Called when the user dismisses the lightbox. */
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export function MediaLightbox({
  items,
  initialIndex = 0,
  isOpen,
  onClose,
}: MediaLightboxProps) {
  const t = useTranslations("products");
  const containerRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync index when caller changes the initialIndex (clicking a different thumbnail)
  useEffect(() => {
    if (isOpen) {
      setIndex(initialIndex);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialIndex]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % items.length);
    resetZoom();
  }, [items.length, resetZoom]);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
    resetZoom();
  }, [items.length, resetZoom]);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
      if (next <= MIN_ZOOM) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, goNext, goPrev, zoomIn, zoomOut]);

  // Fullscreen API
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Non-passive wheel zoom (must use native event listener)
  useEffect(() => {
    const el = imageAreaRef.current;
    if (!el || !isOpen) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
      } else {
        setZoom((prev) => {
          const next = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
          if (next <= MIN_ZOOM) setOffset({ x: 0, y: 0 });
          return next;
        });
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [isOpen]);

  // Pan drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    },
    [zoom, offset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch: pinch-zoom + swipe navigation
  const touchState = useRef<{
    startDist?: number;
    startZoom?: number;
    startOffset?: { x: number; y: number };
    touchStart?: { x: number; y: number };
  }>({});

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchState.current = {
          startDist: Math.hypot(dx, dy),
          startZoom: zoom,
          startOffset: { x: offset.x, y: offset.y },
        };
      } else if (e.touches.length === 1) {
        touchState.current = {
          touchStart: { x: e.touches[0].clientX, y: e.touches[0].clientY },
          startOffset: { x: offset.x, y: offset.y },
        };
      }
    },
    [zoom, offset],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        e.touches.length === 2 &&
        touchState.current.startDist !== undefined &&
        touchState.current.startZoom !== undefined
      ) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const newZoom = Math.max(
          MIN_ZOOM,
          Math.min(
            MAX_ZOOM,
            touchState.current.startZoom *
              (dist / touchState.current.startDist),
          ),
        );
        setZoom(newZoom);
      } else if (
        e.touches.length === 1 &&
        zoom > 1 &&
        touchState.current.touchStart &&
        touchState.current.startOffset
      ) {
        const dx = e.touches[0].clientX - touchState.current.touchStart.x;
        const dy = e.touches[0].clientY - touchState.current.touchStart.y;
        setOffset({
          x: touchState.current.startOffset.x + dx,
          y: touchState.current.startOffset.y + dy,
        });
      }
    },
    [zoom],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (
        e.changedTouches.length === 1 &&
        zoom <= 1 &&
        touchState.current.touchStart
      ) {
        const dx =
          e.changedTouches[0].clientX - touchState.current.touchStart.x;
        const dy = Math.abs(
          e.changedTouches[0].clientY - touchState.current.touchStart.y,
        );
        if (Math.abs(dx) > 50 && dy < 80) {
          if (dx < 0) goNext();
          else goPrev();
        }
      }
      touchState.current = {};
    },
    [zoom, goNext, goPrev],
  );

  if (!isOpen || items.length === 0) return null;

  const current = items[index];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={t("gallery.lightboxTitle")}
    >
      {/* ── Image area ── */}
      <div
        ref={imageAreaRef}
        className="flex-1 relative overflow-hidden select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          touchAction: "none",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Zoomable / pannable image layer */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <MediaImage
            src={current.src}
            alt={current.alt}
            size="hero"
            objectFit="contain"
          />
        </div>
      </div>

      {/* ── Controls bar (below image) ── */}
      <div className="flex items-center justify-center gap-1.5 px-4 py-3 bg-black/85 backdrop-blur-sm shrink-0 border-t border-white/10 flex-wrap">
        {/* Prev */}
        {items.length > 1 && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label={t("gallery.prevImage")}
            className={`w-11 h-11 p-0 min-h-0 ${flex.center} rounded-full bg-white/10 hover:bg-primary/60 text-white border-0 shadow-none active:scale-95 transition-colors`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        {/* Zoom out */}
        <Button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          aria-label={t("gallery.zoomOut")}
          className={`w-11 h-11 p-0 min-h-0 ${flex.center} rounded-full bg-white/10 hover:bg-white/20 text-white border-0 shadow-none active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Caption className="text-white/70 w-14 text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </Caption>
        {/* Zoom in */}
        <Button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          aria-label={t("gallery.zoomIn")}
          className={`w-11 h-11 p-0 min-h-0 ${flex.center} rounded-full bg-white/10 hover:bg-white/20 text-white border-0 shadow-none active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        {/* Reset zoom (visible only when zoomed) */}
        {zoom > 1 && (
          <Button
            onClick={resetZoom}
            aria-label={t("gallery.resetZoom")}
            className={`w-11 h-11 p-0 min-h-0 ${flex.center} rounded-full bg-white/10 hover:bg-white/20 text-white border-0 shadow-none active:scale-95 transition-colors`}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        )}
        {/* Divider */}
        <span className="w-px h-6 bg-white/15 mx-1 shrink-0" aria-hidden />
        {/* Counter */}
        <Caption className="text-white/60 w-12 text-center tabular-nums">
          {index + 1} / {items.length}
        </Caption>
        {/* Divider */}
        <span className="w-px h-6 bg-white/15 mx-1 shrink-0" aria-hidden />
        {/* Fullscreen */}
        <Button
          onClick={toggleFullscreen}
          aria-label={
            isFullscreen
              ? t("gallery.exitFullscreen")
              : t("gallery.enterFullscreen")
          }
          className={`w-11 h-11 p-0 min-h-0 ${flex.center} rounded-full bg-white/10 hover:bg-white/20 text-white border-0 shadow-none active:scale-95 transition-colors`}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </Button>
        {/* Close */}
        <Button
          onClick={onClose}
          aria-label={t("gallery.close")}
          className={`w-11 h-11 p-0 min-h-0 ${flex.center} rounded-full bg-white/10 hover:bg-red-500/40 text-white border-0 shadow-none active:scale-95 transition-colors`}
        >
          <X className="w-5 h-5" />
        </Button>
        {/* Next */}
        {items.length > 1 && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label={t("gallery.nextImage")}
            className={`w-11 h-11 p-0 min-h-0 ${flex.center} rounded-full bg-white/10 hover:bg-primary/60 text-white border-0 shadow-none active:scale-95 transition-colors`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {items.length > 1 && (
        <div
          className="flex gap-2 px-4 py-3 bg-black/70 backdrop-blur-sm overflow-x-auto shrink-0 justify-center"
          style={{
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {items.map((item, i) => (
            <Button
              key={i}
              onClick={() => {
                setIndex(i);
                resetZoom();
              }}
              aria-label={t("gallery.imageThumbnail", { n: i + 1 })}
              aria-current={i === index ? "true" : undefined}
              className={`relative shrink-0 w-14 h-14 p-0 min-h-0 overflow-hidden rounded-lg border-2 transition-all active:scale-95 shadow-none ${
                i === index
                  ? "border-white opacity-100"
                  : "border-transparent opacity-40 hover:opacity-75"
              }`}
            >
              <MediaImage src={item.src} alt={item.alt} size="thumbnail" />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
