"use client";

import {
  ProductGallery as ProductGalleryBase,
  type GalleryMedia,
} from "@letitrip/react-library";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Image from "next/image";

interface ProductGalleryProps {
  media: GalleryMedia[];
  productName: string;
}

export function ProductGallery({ media, productName }: ProductGalleryProps) {
  const defaultIcons = {
    chevronLeft: <ChevronLeft className="w-5 h-5" />,
    chevronRight: <ChevronRight className="w-5 h-5" />,
    close: <X className="w-6 h-6" />,
    zoomIn: <ZoomIn className="w-5 h-5" />,
    imageIcon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
    videoIcon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
      </svg>
    ),
  };

  return (
    <ProductGalleryBase
      media={media}
      productName={productName}
      ImageComponent={Image as any}
      icons={defaultIcons}
    />
  );
}
