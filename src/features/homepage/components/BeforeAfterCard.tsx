"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import { MediaImage, Text } from "@/components";
import type { FeaturedResult } from "@/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BeforeAfterCardProps = FeaturedResult;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * BeforeAfterCard
 *
 * Interactive drag-to-reveal before/after comparison card.
 * Dragging / keyboard (← ›) moves the clip boundary between the two images.
 * Fully accessible: role="slider" + aria-valuenow; keyboard-navigable.
 */
export function BeforeAfterCard({
  beforeImage,
  afterImage,
  caption,
}: BeforeAfterCardProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const t = useTranslations("homepage");

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const clamp = (v: number) => Math.min(95, Math.max(5, v));

  const applyClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  // ─── Pointer handlers ────────────────────────────────────────────────────────

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault(); // prevent text selection during drag
    applyClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    applyClientX(e.clientX);
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  // ─── Keyboard handler ────────────────────────────────────────────────────────

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((p) => clamp(p - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => clamp(p + 5));
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-slate-700">
      {/* ── Drag surface ── */}
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={5}
        aria-valuemax={95}
        aria-valuenow={Math.round(position)}
        aria-label={t("beforeAfterSlider")}
        className="relative aspect-[4/3] cursor-ew-resize select-none touch-none overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onKeyDown={onKeyDown}
      >
        {/* After image — full frame, sits at the bottom of the stack */}
        <MediaImage src={afterImage} alt={t("afterLabel")} size="gallery" />

        {/* Before image — clipped from the right via clip-path */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <MediaImage src={beforeImage} alt={t("beforeLabel")} size="gallery" />
        </div>

        {/* ── BEFORE label ── */}
        <span
          className="pointer-events-none absolute left-3 top-3 select-none rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm"
          aria-hidden="true"
        >
          {t("beforeLabel")}
        </span>

        {/* ── AFTER label ── */}
        <span
          className="pointer-events-none absolute right-3 top-3 select-none rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm"
          aria-hidden="true"
        >
          {t("afterLabel")}
        </span>

        {/* ── Divider line + drag knob ── */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 flex -translate-x-1/2 items-center justify-center"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        >
          {/* Vertical divider */}
          <div className="absolute bottom-0 top-0 w-0.5 bg-white/70" />
          {/* Knob */}
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white shadow-lg dark:bg-slate-900">
            <ArrowLeftRight className="h-4 w-4 text-primary" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* ── Caption ── */}
      {caption && (
        <Text
          size="sm"
          weight="medium"
          variant="muted"
          className="p-4 text-center"
        >
          {caption}
        </Text>
      )}
    </div>
  );
}
