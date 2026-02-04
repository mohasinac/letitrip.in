'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSwipe, useGesture } from '@/hooks';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * ImageGallery Component
 * 
 * Touch-optimized image gallery with swipe navigation, pinch-to-zoom,
 * and thumbnail preview. Fully responsive with mobile gesture support.
 * 
 * @component
 * @example
 * ```tsx
 * <ImageGallery
 *   images={[
 *     { src: '/image1.jpg', alt: 'Image 1', caption: 'Beautiful sunset' },
 *     { src: '/image2.jpg', alt: 'Image 2' },
 *   ]}
 *   showThumbnails
 * />
 * ```
 */

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  thumbnail?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  initialIndex?: number;
  showThumbnails?: boolean;
  showCaptions?: boolean;
  allowZoom?: boolean;
  className?: string;
  onImageChange?: (index: number) => void;
}

export default function ImageGallery({
  images,
  initialIndex = 0,
  showThumbnails = true,
  showCaptions = true,
  allowZoom = true,
  className = '',
  onImageChange,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { themed } = THEME_CONSTANTS;

  const currentImage = images[currentIndex];

  // Navigation functions
  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
      resetZoom();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
      resetZoom();
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      onImageChange?.(index);
      resetZoom();
    }
  };

  const resetZoom = () => {
    setScale(1);
    setIsZoomed(false);
  };

  // Swipe gesture for navigation
  useSwipe(imageContainerRef, {
    onSwipeLeft: () => {
      if (!isZoomed) goToNext();
    },
    onSwipeRight: () => {
      if (!isZoomed) goToPrevious();
    },
    minSwipeDistance: 50,
  });

  // Pinch and zoom gestures
  useGesture(imageContainerRef, {
    onDoubleTap: () => {
      if (allowZoom) {
        if (isZoomed) {
          resetZoom();
        } else {
          setScale(2);
          setIsZoomed(true);
        }
      }
    },
    onPinch: (newScale) => {
      if (allowZoom) {
        const finalScale = Math.max(1, Math.min(newScale, 3));
        setScale(finalScale);
        setIsZoomed(finalScale > 1);
      }
    },
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') resetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isZoomed]);

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${themed.bgTertiary} rounded-lg ${className}`}>
        <p className={themed.textMuted}>No images to display</p>
      </div>
    );
  }

  return (
    <div className={`image-gallery ${className}`}>
      {/* Main Image Container */}
      <div
        ref={imageContainerRef}
        className={`relative ${themed.bgSecondary} rounded-lg overflow-hidden touch-pan-y`}
        style={{ userSelect: 'none' }}
      >
        {/* Image */}
        <div className="relative aspect-video md:aspect-[16/10] overflow-hidden">
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="w-full h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${scale})`,
              cursor: allowZoom ? (isZoomed ? 'zoom-out' : 'zoom-in') : 'default',
            }}
            draggable={false}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && !isZoomed && (
            <>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`
                  absolute left-2 md:left-4 top-1/2 -translate-y-1/2
                  p-2 md:p-3 rounded-full
                  ${themed.bgSecondary} bg-opacity-80 backdrop-blur-sm
                  ${themed.textPrimary}
                  transition-all hover:bg-opacity-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  touch-manipulation
                `}
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === images.length - 1}
                className={`
                  absolute right-2 md:right-4 top-1/2 -translate-y-1/2
                  p-2 md:p-3 rounded-full
                  ${themed.bgSecondary} bg-opacity-80 backdrop-blur-sm
                  ${themed.textPrimary}
                  transition-all hover:bg-opacity-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  touch-manipulation
                `}
                aria-label="Next image"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className={`
              absolute bottom-2 md:bottom-4 right-2 md:right-4
              px-3 py-1.5 rounded-full
              ${themed.bgSecondary} bg-opacity-80 backdrop-blur-sm
              ${themed.textPrimary} text-xs md:text-sm font-medium
            `}>
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Zoom Indicator */}
          {allowZoom && isZoomed && (
            <div className={`
              absolute top-2 md:top-4 right-2 md:right-4
              px-3 py-1.5 rounded-full
              ${themed.bgSecondary} bg-opacity-80 backdrop-blur-sm
              ${themed.textPrimary} text-xs md:text-sm font-medium
            `}>
              {Math.round(scale * 100)}%
            </div>
          )}
        </div>

        {/* Caption */}
        {showCaptions && currentImage.caption && (
          <div className={`p-4 ${themed.border} border-t`}>
            <p className={`${themed.textSecondary} text-sm md:text-base`}>
              {currentImage.caption}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory touch-pan-x">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`
                flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden
                border-2 transition-all snap-center touch-manipulation
                ${
                  index === currentIndex
                    ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                    : `${themed.border} hover:border-primary-300 dark:hover:border-primary-700`
                }
              `}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.thumbnail || image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile Help Text */}
      <div className={`mt-2 text-center ${themed.textMuted} text-xs md:hidden`}>
        {allowZoom ? 'Swipe to navigate • Double tap to zoom' : 'Swipe to navigate'}
      </div>
    </div>
  );
}
