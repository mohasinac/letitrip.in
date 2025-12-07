"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Media {
  url: string;
  type: "image" | "video";
  alt?: string;
}

interface ProductGalleryProps {
  media: Media[];
  productName: string;
}

export function ProductGallery({ media, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto slideshow cycling
  useEffect(() => {
    if (!isAutoPlaying || media.length <= 1 || isLightboxOpen) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, media.length, isLightboxOpen]);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    if (isLightboxOpen) {
      globalThis.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      globalThis.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen]);

  if (!media || media.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500">No images available</p>
      </div>
    );
  }

  const activeMedia = media[activeIndex];

  const handlePrevious = () => {
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Display */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden group">
          {activeMedia.type === "image" ? (
            <Image
              src={activeMedia.url}
              alt={activeMedia.alt || productName}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <video
              src={activeMedia.url}
              controls
              className="w-full h-full object-contain"
            />
          )}

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 dark:text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 dark:text-white" />
              </button>
            </>
          )}

          {/* Zoom Button */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsLightboxOpen(true);
              }
            }}
            className="absolute top-2 right-2 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 p-2 rounded-full shadow-lg opacity-70 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Zoom image"
          >
            <ZoomIn className="w-5 h-5 dark:text-white" />
          </button>

          {/* Media Count Badges (Top Right) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {media.filter((m) => m.type === "image").length > 0 && (
              <div className="bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                {media.filter((m) => m.type === "image").length}
              </div>
            )}
            {media.filter((m) => m.type === "video").length > 0 && (
              <div className="bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                {media.filter((m) => m.type === "video").length}
              </div>
            )}
          </div>

          {/* Counter */}
          {media.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {activeIndex + 1} / {media.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {media.map((item, index) => (
              <button
                key={`thumb-${item.url}-${index}`}
                onClick={() => {
                  setIsAutoPlaying(false); // Pause auto-play when user selects thumbnail
                  setActiveIndex(index);
                }}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === activeIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Video
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLightboxOpen(false);
            }
          }}
          onKeyDown={(e) => e.key === "Escape" && setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full max-w-7xl max-h-screen">
            {activeMedia.type === "image" ? (
              <Image
                src={activeMedia.url}
                alt={activeMedia.alt || productName}
                fill
                className="object-contain"
              />
            ) : (
              <video
                src={activeMedia.url}
                controls
                className="w-full h-full object-contain"
              />
            )}

            {/* Lightbox Navigation */}
            {media.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full">
                  {activeIndex + 1} / {media.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
