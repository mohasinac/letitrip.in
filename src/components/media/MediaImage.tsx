"use client";

/**
 * MediaImage
 *
 * Tier 1 primitive for ALL static image rendering (products, blogs, categories,
 * carousel, brand logos, etc.).  Replaces every raw <Image> / <img> usage.
 *
 * Always fills its parent container — the parent must supply:
 *   position: relative (or use Tailwind `relative`)
 *   overflow: hidden  (or use Tailwind `overflow-hidden`)
 *   an aspect-ratio / fixed height to define the display area
 *
 * Usage:
 *   <div className="relative aspect-square overflow-hidden rounded-xl">
 *     <MediaImage src={product.mainImage} alt={product.title} size="card" priority />
 *   </div>
 */

import Image from "next/image";
import { useState } from "react";
import { Span } from "@mohasinac/appkit/ui";
import { THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;

// ----- `sizes` hints per display context -----------------------------------------------
// Matches the breakpoint + column-count patterns used in grids across the app.
const SIZE_HINTS: Record<MediaImageSize, string> = {
  thumbnail: "(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px",
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  hero: "100vw",
  banner: "100vw",
  gallery: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  avatar: "(max-width: 640px) 48px, 56px",
};

// ----- Default fallback icons per size ---------------------------------------------------
const FALLBACK_ICONS: Record<MediaImageSize, string> = {
  thumbnail: "📦",
  card: "📦",
  hero: "🖼️",
  banner: "🖼️",
  gallery: "📦",
  avatar: "👤",
};

// ----- Default fallback image per size ---------------------------------------------------
// Avatar → deterministic dicebear SVG seeded by alt text.
// All others → local placeholder SVG (no broken-image jank).
function defaultFallbackSrc(size: MediaImageSize, alt: string): string {
  if (size === "avatar") {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(alt)}`;
  }
  return "/images/placeholder.svg";
}

export type MediaImageSize =
  | "thumbnail"
  | "card"
  | "hero"
  | "banner"
  | "gallery"
  | "avatar";

export interface MediaImageProps {
  /** Image URL. When undefined the fallback icon is rendered instead. */
  src: string | undefined;
  /** Descriptive alt text — required for accessibility and SEO. */
  alt: string;
  /**
   * Sizing preset — controls the `sizes` attribute passed to Next.js Image
   * so the browser requests the correct srcset entry.
   * Defaults to `'card'`.
   */
  size?: MediaImageSize;
  /** Pass `true` for above-the-fold hero / banner images to skip lazy loading. */
  priority?: boolean;
  /** CSS object-fit applied to the underlying img element. Defaults to `'cover'`. */
  objectFit?: "cover" | "contain";
  /**
   * Emoji or text to show when `src` is undefined and `fallbackSrc` also fails.
   * Falls back to the per-size default icon.
   */
  fallback?: string;
  /**
   * URL to use when `src` fails to load (e.g. a dicebear avatar, a local
   * placeholder image).  If this also fails the emoji icon is shown instead.
   */
  fallbackSrc?: string;
  /**
   * Extra Tailwind classes applied to the absolute-fill wrapper div.
   * Use for hover animations, e.g. `group-hover:scale-110 transition-transform duration-300`.
   */
  className?: string;
}

export function MediaImage({
  src,
  alt,
  size = "card",
  priority = false,
  objectFit = "cover",
  fallback,
  fallbackSrc,
  className,
}: MediaImageProps) {
  const [hasError, setHasError] = useState(false);
  const [hasFallbackError, setHasFallbackError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const icon = fallback ?? FALLBACK_ICONS[size];
  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  // Resolve fallback: explicit prop wins, otherwise use the per-size default.
  const resolvedFallbackSrc = fallbackSrc ?? defaultFallbackSrc(size, alt);

  // Determine the active source: original → fallbackSrc → emoji
  const usingFallbackSrc =
    !!src && hasError && !!resolvedFallbackSrc && !hasFallbackError;
  const activeSrc = usingFallbackSrc ? resolvedFallbackSrc : src;
  const showEmoji =
    !activeSrc || (hasError && (!resolvedFallbackSrc || hasFallbackError));

  if (showEmoji) {
    return (
      <div
        className={`absolute inset-0 ${flex.center} bg-zinc-100 dark:bg-slate-800${className ? ` ${className}` : ""}`}
        role="img"
        aria-label={alt}
      >
        <Span
          className="text-zinc-400 text-2xl leading-none"
          aria-hidden="true"
        >
          {icon}
        </Span>
      </div>
    );
  }

  const isSvg =
    activeSrc!.toLowerCase().endsWith(".svg") ||
    activeSrc!.includes("image/svg") ||
    /[./]svg(\?|$)/i.test(activeSrc!);

  const isGif =
    activeSrc!.toLowerCase().endsWith(".gif") ||
    /\.gif\?/i.test(activeSrc!) ||
    activeSrc!.includes("image/gif");

  return (
    <div
      className={`absolute inset-0 overflow-hidden${className ? ` ${className}` : ""}`}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-zinc-200 dark:bg-slate-700 animate-pulse"
          aria-hidden="true"
        />
      )}
      <Image
        src={activeSrc!}
        alt={alt}
        fill
        priority={priority}
        className={fitClass}
        sizes={SIZE_HINTS[size]}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (usingFallbackSrc) {
            setHasFallbackError(true);
          } else {
            setHasError(true);
            setIsLoaded(false);
          }
        }}
        unoptimized={isSvg || isGif}
      />
    </div>
  );
}

export default MediaImage;
