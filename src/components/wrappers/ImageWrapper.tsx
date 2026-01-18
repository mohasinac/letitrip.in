/**
 * Next.js Image Wrapper for React Library Components
 * 
 * This wrapper provides Next.js Image optimization to pure React components
 * in @letitrip/react-library while maintaining fallback to standard <img>.
 * 
 * @example
 * // In library components:
 * <ProductCard ImageComponent={ImageWrapper} src="/product.jpg" alt="Product" />
 * 
 * // Direct usage:
 * <ImageWrapper src="/product.jpg" alt="Product" width={300} height={200} />
 */

import Image from 'next/image';
import type { ComponentProps } from 'react';

export interface ImageWrapperProps extends Partial<ComponentProps<typeof Image>> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** Use standard <img> instead of Next.js Image (for external URLs or special cases) */
  useStandardImg?: boolean;
  /** Priority loading for above-the-fold images */
  priority?: boolean;
  /** Object fit style */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function ImageWrapper({
  src,
  alt,
  width,
  height,
  className,
  useStandardImg = false,
  priority = false,
  objectFit = 'cover',
  ...props
}: ImageWrapperProps) {
  // Use standard <img> for external URLs or when explicitly requested
  if (useStandardImg || src.startsWith('http') || src.startsWith('data:')) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit }}
        {...props as any}
      />
    );
  }

  // Use Next.js Image for internal images with optimization
  return (
    <Image
      src={src}
      alt={alt}
      width={width || 500}
      height={height || 500}
      className={className}
      priority={priority}
      style={{ objectFit }}
      {...props}
    />
  );
}

export default ImageWrapper;
