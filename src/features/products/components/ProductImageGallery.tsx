"use client";

import { useState, useCallback } from "react";
import {
  Button,
  HorizontalScroller,
  MediaImage,
  MediaLightbox,
  MediaVideo,
  Span,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

const { themed, borderRadius, flex } = THEME_CONSTANTS;

interface VideoData {
  url: string;
  thumbnailUrl: string;
  trimStart?: number;
  trimEnd?: number;
}

interface MediaItem {
  type: "image" | "video";
  src: string;
  thumbnailSrc?: string;
  trimStart?: number;
  trimEnd?: number;
  label: string;
}

interface ProductImageGalleryProps {
  mainImage: string;
  images?: string[];
  video?: VideoData;
  title: string;
  slug?: string;
}

export function ProductImageGallery({
  mainImage,
  images = [],
  video,
  title,
  slug,
}: ProductImageGalleryProps) {
  const t = useTranslations("products");

  // Build ordered media list: images first (main first), then video last
  const allMedia: MediaItem[] = [
    ...[mainImage, ...images].filter(Boolean).map((src, idx) => ({
      type: "image" as const,
      src,
      label: `${slug ?? title}-image-${idx + 1}`,
    })),
    ...(video?.url
      ? [
          {
            type: "video" as const,
            src: video.url,
            thumbnailSrc: video.thumbnailUrl,
            trimStart: video.trimStart,
            trimEnd: video.trimEnd,
            label: `${slug ?? title}-video`,
          },
        ]
      : []),
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selected = allMedia[selectedIndex] ?? allMedia[0];

  // Only image items are shown in the lightbox (videos play inline)
  const lightboxItems = allMedia
    .filter((m) => m.type === "image")
    .map((m) => ({ src: m.src, alt: m.label }));
  // Index within lightboxItems corresponding to the currently selected media
  const lightboxIndex = Math.max(
    0,
    allMedia.slice(0, selectedIndex + 1).filter((m) => m.type === "image")
      .length - 1,
  );

  const goNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % allMedia.length);
  }, [allMedia.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  return (
    <div className="space-y-3">
      {/* Primary media display */}
      <div
        className={`relative group overflow-hidden ${borderRadius.xl} bg-zinc-100 dark:bg-slate-800`}
      >
        <div className="aspect-square sm:aspect-[4/3] lg:aspect-square">
          {!selected ? (
            <MediaImage src={undefined} alt={title} size="hero" />
          ) : selected.type === "video" ? (
            <MediaVideo
              src={selected.src}
              thumbnailUrl={selected.thumbnailSrc}
              alt={`${title} video`}
              trimStart={selected.trimStart}
              trimEnd={selected.trimEnd}
              controls
            />
          ) : (
            <>
              <MediaImage
                src={selected.src}
                alt={`${title} - ${selected.label}`}
                size="hero"
                priority={selectedIndex === 0}
                className="group-hover:scale-105 transition-transform duration-500"
              />
              {/* Click overlay to open lightbox */}
              <button
                type="button"
                aria-label={t("gallery.openLightbox")}
                onClick={() => setLightboxOpen(true)}
                className="absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
              />
            </>
          )}
        </div>

        {/* Expand button (visible on hover, image only) */}
        {selected?.type === "image" && (
          <Button
            onClick={() => setLightboxOpen(true)}
            aria-label={t("gallery.openLightbox")}
            className={`absolute top-2 right-2 w-8 h-8 p-0 min-h-0 ${flex.center} rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow border-0`}
          >
            <Expand className="w-4 h-4" />
          </Button>
        )}

        {/* Navigation arrows (visible on hover) */}
        {allMedia.length > 1 && (
          <>
            <Button
              onClick={goPrev}
              aria-label={t("gallery.prevImage")}
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 ${flex.center} rounded-full bg-white/80 dark:bg-slate-900/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={goNext}
              aria-label={t("gallery.nextImage")}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 ${flex.center} rounded-full bg-white/80 dark:bg-slate-900/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm`}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Image counter */}
        {allMedia.length > 1 && (
          <Span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
            {selectedIndex + 1} / {allMedia.length}
          </Span>
        )}
      </div>

      {/* Thumbnail strip */}
      {allMedia.length > 1 && (
        <HorizontalScroller snapToItems gap={8} className="pb-1">
          {allMedia.map((item, idx) => (
            <Button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`${title} ${
                item.type === "video"
                  ? t("gallery.videoThumbnail")
                  : t("gallery.imageThumbnail", { n: idx + 1 })
              }`}
              className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden ${borderRadius.md} border-2 transition-all ${
                idx === selectedIndex
                  ? "border-indigo-500 ring-2 ring-indigo-500/30"
                  : `border-transparent ${themed.border} opacity-60 hover:opacity-100`
              }`}
            >
              <MediaImage
                src={item.type === "video" ? item.thumbnailSrc : item.src}
                alt={`${title} thumbnail ${idx + 1}`}
                size="thumbnail"
              />
              {item.type === "video" && (
                <Span
                  className={`absolute inset-0 ${flex.center} bg-black/40 text-white`}
                  aria-hidden="true"
                >
                  <Span
                    className={`w-7 h-7 rounded-full bg-white/90 text-indigo-600 ${flex.center} text-sm font-bold`}
                  >
                    ▶
                  </Span>
                </Span>
              )}
            </Button>
          ))}
        </HorizontalScroller>
      )}

      {/* Lightbox */}
      <MediaLightbox
        items={lightboxItems}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
