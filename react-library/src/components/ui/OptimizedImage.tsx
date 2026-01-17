"use client";

/**
 * OptimizedImage Component
 *
 * Framework-agnostic image component with error handling and loading states.
 * Supports focus point for smart cropping.
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/image.jpg"
 *   alt="Product"
 *   width={300}
 *   height={200}
 *   focusX={50}
 *   focusY={30}
 * />
 * ```
 */

import { useState } from "react";

export interface OptimizedImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Image fit mode */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  /** Focus point X (0-100, percentage from left) */
  focusX?: number;
  /** Focus point Y (0-100, percentage from top) */
  focusY?: number;
  /** Load callback */
  onLoad?: () => void;
  /** Error callback */
  onError?: () => void;
  /** Fallback image URL */
  fallbackSrc?: string;
  /** Loading state (lazy/eager) */
  loading?: "lazy" | "eager";
  /** Image quality (for services that support it) */
  quality?: number;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  objectFit = "cover",
  focusX = 50,
  focusY = 50,
  onLoad,
  onError,
  fallbackSrc = "/images/placeholder.png",
  loading = "lazy",
  quality = 85,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    setIsError(true);
    setImgSrc(fallbackSrc);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // If no src provided, show placeholder
  if (!src || src === "") {
    return (
      <div
        className={cn(
          "bg-gray-200 dark:bg-gray-700 flex items-center justify-center",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-400 dark:text-gray-500 text-sm">
          No image
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || "Image"}
      width={width}
      height={height}
      loading={loading}
      onError={handleError}
      onLoad={handleLoad}
      className={cn(
        className,
        !isLoaded && "opacity-0",
        isLoaded && "opacity-100 transition-opacity duration-300",
        isError && "opacity-50"
      )}
      style={{
        objectFit,
        objectPosition: `${focusX}% ${focusY}%`,
      }}
    />
  );
}

export default OptimizedImage;
