"use client";

import React from "react";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import {
  formatCurrency,
  formatDiscount,
  formatCompactNumber,
} from "@/lib/formatters";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Additional images for carousel
  videos?: string[]; // Video URLs
  rating?: number;
  reviewCount?: number;
  shopName: string;
  shopSlug: string;
  shopId?: string;
  inStock: boolean;
  isFeatured?: boolean;
  condition?: "new" | "used" | "refurbished";
  onAddToCart?: (
    id: string,
    productDetails?: {
      name: string;
      price: number;
      image: string;
      shopId: string;
      shopName: string;
    }
  ) => void;
  onToggleFavorite?: (id: string) => void;
  onQuickView?: (id: string) => void;
  isFavorite?: boolean;
  showShopName?: boolean;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  slug,
  price,
  originalPrice,
  image,
  images = [],
  videos = [],
  rating = 0,
  reviewCount = 0,
  shopName,
  shopSlug,
  shopId,
  inStock,
  isFeatured = false,
  condition = "new",
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  isFavorite = false,
  showShopName = true,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = React.useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const discountPercentage = originalPrice
    ? formatDiscount(originalPrice, price)
    : "";

  // Combine all media (video first if available, then images)
  const allMedia = React.useMemo(() => {
    const media: Array<{ type: "video" | "image"; url: string }> = [];

    if (videos && videos.length > 0) {
      media.push(...videos.map((url) => ({ type: "video" as const, url })));
    }

    // Use images array if provided, otherwise use single image
    const imageUrls = images.length > 0 ? images : [image];
    media.push(...imageUrls.map((url) => ({ type: "image" as const, url })));

    return media;
  }, [image, images, videos]);

  // Auto-rotate images on hover
  React.useEffect(() => {
    if (isHovered && allMedia.length > 1) {
      const currentMedia = allMedia[currentMediaIndex];

      // If current media is video, play it
      if (currentMedia.type === "video") {
        setIsPlayingVideo(true);
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            // Autoplay failed, move to next media
            setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
          });
        }
      } else {
        // For images, rotate every 3 seconds
        setIsPlayingVideo(false);
        intervalRef.current = setInterval(() => {
          setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
        }, 3000);
      }
    } else {
      setIsPlayingVideo(false);
      setCurrentMediaIndex(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isHovered, currentMediaIndex, allMedia]);

  const currentMedia = allMedia[currentMediaIndex] ||
    allMedia[0] || { type: "image", url: image };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock && onAddToCart) {
      onAddToCart(id, {
        name,
        price,
        image,
        shopId: shopId || shopSlug,
        shopName,
      });
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(id);
    }
  };

  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Video Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {currentMedia.type === "video" && isHovered ? (
          <video
            ref={videoRef}
            src={currentMedia.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onEnded={() => {
              setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
            }}
          />
        ) : (
          <OptimizedImage
            src={currentMedia.url}
            alt={name}
            fill
            quality={85}
            objectFit="cover"
            className={
              isHovered
                ? "scale-105 transition-transform duration-300"
                : "transition-transform duration-300"
            }
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Media Indicators */}
        {allMedia.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {allMedia.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentMediaIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFeatured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {!inStock && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
          {condition !== "new" && (
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded capitalize">
              {condition}
            </span>
          )}
          {discountPercentage && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
              {discountPercentage} OFF
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onToggleFavorite && (
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors ${
                isFavorite ? "text-red-500" : "text-gray-600"
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          )}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Add to Cart Overlay */}
        {onAddToCart && inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-${compact ? "3" : "4"}`}>
        {/* Product Name */}
        <h3
          className={`font-semibold text-gray-900 ${
            compact ? "text-sm line-clamp-1" : "text-base line-clamp-2"
          } mb-2 group-hover:text-blue-600 transition-colors`}
        >
          {name}
        </h3>

        {/* Shop Name */}
        {showShopName && (
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/shops/${shopSlug}`;
            }}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors mb-2 block cursor-pointer"
          >
            {shopName}
          </span>
        )}

        {/* Rating */}
        {!compact && rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900 ml-1">
                {rating.toFixed(1)}
              </span>
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span
            className={`font-bold text-gray-900 ${
              compact ? "text-lg" : "text-xl"
            }`}
          >
            {formatCurrency(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
