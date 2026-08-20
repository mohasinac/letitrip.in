"use client";

import { MediaImage, Span } from "@mohasinac/appkit/client";

interface BrandBadgeImageProps {
  src: string;
  alt: string;
  className?: string;
}

/** Small fixed-size wrapper for multi-color brand logos (UPI, shipping carriers) rendered via MediaImage. */
export function BrandBadgeImage({ src, alt, className = "h-4 w-16" }: BrandBadgeImageProps) {
  return (
    <Span className={`relative inline-block ${className}`}>
      <MediaImage src={src} alt={alt} objectFit="contain" />
    </Span>
  );
}
