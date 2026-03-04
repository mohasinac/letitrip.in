"use client";

import { useState } from "react";
import { Button, HorizontalScroller, MediaImage, MediaVideo, Span } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

const { themed, borderRadius } = THEME_CONSTANTS;

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
}

interface ProductImageGalleryProps {
  mainImage: string;
  images?: string[];
  video?: VideoData;
  title: string;
}

export function ProductImageGallery({
  mainImage,
  images = [],
  video,
  title,
}: ProductImageGalleryProps) {
  // Build ordered media list: video first (if present), then images
  const allMedia: MediaItem[] = [
    ...(video?.url
      ? [{
          type: "video" as const,
          src: video.url,
          thumbnailSrc: video.thumbnailUrl,
          trimStart: video.trimStart,
          trimEnd: video.trimEnd,
        }]
      : []),
    ...[mainImage, ...images]
      .filter(Boolean)
      .map((src) => ({ type: "image" as const, src })),
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = allMedia[selectedIndex] ?? allMedia[0];

  return (
    <div className="space-y-3">
      {/* Primary media */}
      <div
        className={`relative aspect-square overflow-hidden ${borderRadius.xl} bg-gray-100 dark:bg-gray-800`}
      >
        {!selected ? (
          <MediaImage src={undefined} alt={title} size="card" />
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
          <MediaImage
            src={selected.src}
            alt={title}
            size="card"
            priority={selectedIndex === 0}
          />
        )}
      </div>

      {/* Thumbnail strip — show when more than one media item */}
      {allMedia.length > 1 && (
        <HorizontalScroller snapToItems gap={8} className="pb-1">
          {allMedia.map((item, idx) => (
            <Button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`${title} ${
                item.type === "video" ? "video" : `image ${idx + 1}`
              }`}
              className={`relative shrink-0 w-16 h-16 overflow-hidden ${borderRadius.md} border-2 transition-all ${
                idx === selectedIndex
                  ? "border-indigo-500"
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
                  className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-lg"
                  aria-hidden="true"
                >
                  ▶
                </Span>
              )}
            </Button>
          ))}
        </HorizontalScroller>
      )}
    </div>
  );
}
