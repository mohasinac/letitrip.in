"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

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

  if (!media || media.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  const activeMedia = media[activeIndex];

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Display */}
        <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden group">
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
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom Button */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Zoom image"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

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
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === activeIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-gray-300"
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
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Video</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white"
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
