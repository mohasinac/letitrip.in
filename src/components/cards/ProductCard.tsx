"use client";

import React from "react";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { FavoriteButton } from "@/components/common/FavoriteButton";
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
  featured?: boolean;
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

const ProductCardComponent: React.FC<ProductCardProps> = ({
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
  featured = false,
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

  // Check if videos are available
  const hasVideos = videos && videos.length > 0;

  // Get all images (use images array if provided, otherwise use single image)
  const allImages = React.useMemo(() => {
    return images.length > 0 ? images : [image];
  }, [image, images]);

  // Auto-rotate on hover: video takes priority, otherwise rotate images
  React.useEffect(() => {
    if (isHovered) {
      if (hasVideos) {
        // Play video immediately on hover
        setIsPlayingVideo(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {
            // Video autoplay failed, fall back to image rotation
            setIsPlayingVideo(false);
            startImageRotation();
          });
        }
      } else if (allImages.length > 1) {
        // No video, rotate images with 1 second interval
        startImageRotation();
      }
    } else {
      // Reset when not hovering
      setIsPlayingVideo(false);
      setCurrentMediaIndex(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    function startImageRotation() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % allImages.length);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, hasVideos, allImages.length]);

  const currentImage = allImages[currentMediaIndex] || allImages[0] || image;

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
      className="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Video Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        {/* Video layer - shown when playing video */}
        {hasVideos && (
          <video
            ref={videoRef}
            src={videos[0]}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
              isPlayingVideo ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            muted
            loop
            playsInline
          />
        )}

        {/* Image layer */}
        <OptimizedImage
          src={currentImage}
          alt={name}
          fill
          quality={85}
          objectFit="cover"
          className={`transition-all duration-300 ${
            isHovered && !isPlayingVideo ? "scale-105" : ""
          } ${isPlayingVideo ? "opacity-0" : "opacity-100"}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Media Indicators - show image dots when rotating images */}
        {allImages.length > 1 && isHovered && !isPlayingVideo && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
            {allImages.map((imageUrl, index) => (
              <div
                key={`dot-${imageUrl}-${index}`}
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
          {featured && (
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

        {/* Media Count Badge */}
        {(allImages.length > 1 || hasVideos) && (
          <div className="absolute bottom-2 right-2 flex gap-1 z-20">
            {allImages.length > 1 && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                {allImages.length}
              </span>
            )}
            {hasVideos && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                {videos.length}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FavoriteButton
            itemId={id}
            itemType="product"
            initialIsFavorite={isFavorite}
            onToggle={() => onToggleFavorite?.(id)}
            size="md"
          />
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
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
          className={`font-semibold text-gray-900 dark:text-white ${
            compact ? "text-sm line-clamp-1" : "text-base line-clamp-2"
          } mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
        >
          {name}
        </h3>

        {/* Shop Name */}
        {showShopName && (
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (globalThis.location)
                globalThis.location.href = `/shops/${shopSlug}`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                if (globalThis.location)
                  globalThis.location.href = `/shops/${shopSlug}`;
              }
            }}
            role="link"
            tabIndex={0}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 block cursor-pointer"
          >
            {shopName}
          </span>
        )}

        {/* Rating */}
        {!compact && rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
                {rating.toFixed(1)}
              </span>
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span
            className={`font-bold text-gray-900 dark:text-white ${
              compact ? "text-lg" : "text-xl"
            }`}
          >
            {formatCurrency(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

// Memoized export for performance optimization
export const ProductCard = React.memo(ProductCardComponent);
