"use client";

import { MediaImage, Span } from "@mohasinac/appkit/client";

interface BrandBadgeImageProps {
  src: string;
  alt: string;
  className?: string;
  /**
   * Sit the logo on a fixed light plate.
   *
   * 🛑 For a MULTI-COLOUR brand mark on the dark footer, and it is the only
   * correct option of three. Measured on the four carrier logos: every one
   * carries its own fills and all but one include a near-black
   * (`#241c23` Delhivery, `#353535` Shiprocket), which is invisible on the
   * dark-theme footer at `rgb(2,6,23)`.
   *
   *   - Leaving it alone     → the dark components disappear.
   *   - `dark:invert`        → the sibling note in FooterBadgesSlot calls this
   *                            the right treatment for a fixed-colour asset,
   *                            and it is — for a MONOCHROME one. On a
   *                            multi-colour mark it rewrites the brand:
   *                            Shiprocket's `#18F040` green inverts to magenta.
   *   - A light plate        → every logo keeps its own colours in both themes,
   *                            which is also what a trademark owner expects.
   *
   * `bg-white` is deliberately theme-INVARIANT here. A surface token would
   * follow the theme and reintroduce the dark-on-dark case it exists to fix.
   */
  plate?: boolean;
}

/** Small fixed-size wrapper for multi-color brand logos (UPI, shipping carriers) rendered via MediaImage. */
export function BrandBadgeImage({
  src,
  alt,
  className = "h-4 w-16",
  plate = false,
}: BrandBadgeImageProps) {
  const plateCls = plate
    ? "bg-white rounded-[var(--appkit-radius-md)] ring-1 ring-zinc-900/10 px-[var(--appkit-space-2)] py-[var(--appkit-space-1)]"
    : "";

  return (
    <Span className={`relative inline-block ${plateCls} ${className}`.trim()}>
      <MediaImage src={src} alt={alt} objectFit="contain" />
    </Span>
  );
}
