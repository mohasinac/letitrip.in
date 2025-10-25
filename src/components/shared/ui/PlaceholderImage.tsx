import { useState } from "react";
import Image from "next/image";

interface PlaceholderImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
}

export default function PlaceholderImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
}: PlaceholderImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-400 text-sm ${className}`}
        style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
      >
        <div className="text-center">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>Image</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
