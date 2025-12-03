import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  focusX?: number; // 0-100, percentage from left
  focusY?: number; // 0-100, percentage from top
  onLoad?: () => void;
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

  const handleError = () => {
    setIsError(true);
    setImgSrc(fallbackImage);
    onError?.();
  };

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
    src: imgSrc,
    alt: alt || "Image",
    quality,
    priority,
    onError: handleError,
    onLoad: handleLoad,
    className: `${className} ${isError ? "opacity-50" : ""}`,
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
