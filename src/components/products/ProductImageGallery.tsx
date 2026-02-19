"use client";

import { useState } from "react";
import Image from "next/image";
import { THEME_CONSTANTS } from "@/constants";

const { themed, borderRadius } = THEME_CONSTANTS;

interface ProductImageGalleryProps {
  mainImage: string;
  images?: string[];
  title: string;
}

export function ProductImageGallery({
  mainImage,
  images = [],
  title,
}: ProductImageGalleryProps) {
  const allImages = [mainImage, ...images].filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = allImages[selectedIndex] || mainImage;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className={`relative aspect-square overflow-hidden ${borderRadius.xl} bg-gray-100 dark:bg-gray-800`}
      >
        {selected ? (
          <Image
            src={selected}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-400">
            📦
          </div>
        )}
      </div>

      {/* Thumbnail strip (show if more than 1 image) */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative shrink-0 w-16 h-16 overflow-hidden ${borderRadius.md} border-2 transition-all ${
                idx === selectedIndex
                  ? "border-indigo-500"
                  : `border-transparent ${themed.border} opacity-60 hover:opacity-100`
              }`}
            >
              <Image
                src={img}
                alt={`${title} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
