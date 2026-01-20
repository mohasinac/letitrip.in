/**
 * LazyImage Component - Phase 9.1
 * 
 * Optimized image component with lazy loading, blur placeholder,
 * and automatic WebP support.
 * 
 * Features:
 * - Intersection Observer lazy loading
 * - Blur placeholder while loading
 * - Automatic WebP format
 * - Responsive sizes
 * - Error handling with fallback
 * - Dark mode support
 * 
 * @example
 * <LazyImage
 *   src="/products/shoe.jpg"
 *   alt="Running Shoe"
 *   width={400}
 *   height={400}
 *   className="rounded-lg"
 * />
 */

"use client";

import Image, { ImageProps } from "next/image";
import { useState, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImageProps, "onLoad"> {
  /** Blur placeholder data URL (optional) */
  blurDataURL?: string;
  /** Show skeleton while loading */
  showSkeleton?: boolean;
  /** Fallback image on error */
  fallbackSrc?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image errors */
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  blurDataURL,
  showSkeleton = true,
  fallbackSrc = "/images/placeholder.png",
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, {
    threshold: 0.01,
    rootMargin: "100px", // Start loading 100px before entering viewport
    triggerOnce: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  // Load image when visible
  useState(() => {
    if (isVisible) {
      setCurrentSrc(hasError ? fallbackSrc : (src as string));
    }
  });

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    setIsLoading(false);
    onError?.();
  };

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={
        width && height
          ? { width: typeof width === "number" ? `${width}px` : width, height: typeof height === "number" ? `${height}px` : height }
          : undefined
      }
    >
      {/* Skeleton loader */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}

      {/* Image */}
      {isVisible && currentSrc && (
        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className,
          )}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * LazyBackgroundImage Component
 * 
 * Lazy-loaded background image for hero sections, banners, etc.
 * 
 * @example
 * <LazyBackgroundImage src="/hero.jpg" className="h-96">
 *   <h1>Hero Content</h1>
 * </LazyBackgroundImage>
 */
interface LazyBackgroundImageProps {
  src: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export function LazyBackgroundImage({
  src,
  alt,
  children,
  className,
  overlayClassName,
}: LazyBackgroundImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, {
    threshold: 0.01,
    rootMargin: "100px",
    triggerOnce: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      role={alt ? "img" : undefined}
      aria-label={alt}
    >
      {/* Background image */}
      {isVisible && (
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
          style={{ backgroundImage: `url(${src})` }}
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}

      {/* Overlay */}
      {overlayClassName && (
        <div className={cn("absolute inset-0", overlayClassName)} />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
