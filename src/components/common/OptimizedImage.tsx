/**
 * @fileoverview React Component
 * @module src/components/common/OptimizedImage
 * @description This file contains the OptimizedImage component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import Image from "next/image";
import { useState } from "react";

/**
 * OptimizedImageProps interface
 * 
 * @interface
 * @description Defines the structure and contract for OptimizedImageProps
 */
interface OptimizedImageProps {
  /** Src */
  src: string;
  /** Alt */
  alt: string;
  /** Width */
  width?: number;
  /** Height */
  height?: number;
  /** Class Name */
  className?: string;
  /** Fill */
  fill?: boolean;
  /** Priority */
  priority?: boolean;
  /** Quality */
  quality?: number;
  /** Sizes */
  sizes?: string;
  /** Object Fit */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  focusX?: number; // 0-100, percentage from left
  focusY?: number; // 0-100, percentage from top
  /** On Load */
  onLoad?: () => void;
  /** On Error */
  onError?: () => void;
}

/**
 * OptimizedImage Component
 *
 * A wrapper around Next.js Image component with:
 * - Automatic lazy loading
 * - Blur placeholder
 * - Error handling with fallback
 * - Optimized quality (85% default)
 * - Automatic format conversion (WebP/AVIF)
 * - Focus point support for smart cropping on smaller screens
 *
 * Usage:
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   width={300}
 *   height={200}
 *   focusX={50}
 *   focusY={30}
 * />
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  priority = false,
  quality = 85,
  sizes,
  objectFit = "cover",
  focusX = 50,
  focusY = 50,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  // Fallback image for errors
  const fallbackImage = "/images/placeholder.png";

  /**
   * Handles error event
   *
   * @returns {any} The handleerror result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Handles error event
   *
   * @returns {any} The handleerror result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleError = () => {
    setIsError(true);
    setImgSrc(fallbackImage);
    onError?.();
  };

  /**
   * Handles load event
   *
   * @returns {any} The handleload result
   */

  /**
   * Handles load event
   *
   * @returns {any} The handleload result
   */

  const handleLoad = () => {
    onLoad?.();
  };

  // If no src provided, show placeholder
  if (!src || src === "") {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  // Common props for both fill and fixed size images
  const commonProps = {
    /** Src */
    src: imgSrc,
    /** Alt */
    alt: alt || "Image",
    quality,
    priority,
    /** On Error */
    onError: handleError,
    /** On Load */
    onLoad: handleLoad,
    /** Class Name */
    className: `${className} ${isError ? "opacity-50" : ""}`,
    /** Style */
    style: fill
      ? { objectFit, objectPosition: `${focusX}% ${focusY}%` }
      : { objectPosition: `${focusX}% ${focusY}%` },
  };

  // For fill images (responsive containers)
  if (fill) {
    return (
      <Image
        {...commonProps}
        fill
        sizes={
          sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      />
    );
  }

  // For fixed size images
  if (!width || !height) {
    console.warn(
      `OptimizedImage: width and height are required when fill is false. Image: ${src}`,
    );
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      {...commonProps}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    />
  );
}
