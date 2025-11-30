"use client";

import React from "react";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Star, MapPin, BadgeCheck, ShoppingBag } from "lucide-react";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { formatCompactNumber } from "@/lib/formatters";

export interface ShopCardProps {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  productCount: number;
  liveProductCount?: number;
  auctionCount?: number;
  liveAuctionCount?: number;
  location?: string;
  isVerified?: boolean;
  featured?: boolean;
  categories?: string[];
  onFollow?: (id: string) => void;
  isFollowing?: boolean;
  showBanner?: boolean;
  compact?: boolean;
}

export const ShopCard: React.FC<ShopCardProps> = ({
  id,
  name,
  slug,
  logo,
  banner,
  description,
  rating = 0,
  reviewCount = 0,
  productCount,
  liveProductCount = 0,
  auctionCount = 0,
  liveAuctionCount = 0,
  location,
  isVerified = false,
  featured = false,
  categories = [],
  onFollow,
  isFollowing = false,
  showBanner = true,
  compact = false,
}) => {
  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFollow) {
      onFollow(id);
    }
  };

  return (
    <Link
      href={`/shops/${slug}`}
      className="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 relative"
    >
      {/* Favorite Button */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton
          itemId={id}
          itemType="shop"
          initialIsFavorite={false}
          size="md"
        />
      </div>

      {/* Banner */}
      {showBanner && banner && !compact && (
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          <OptimizedImage
            src={banner}
            alt={`${name} banner`}
            fill
            quality={85}
            objectFit="cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {featured && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Featured Shop
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className={`p-${compact ? "4" : "6"} ${
          showBanner && banner && !compact ? "-mt-12" : ""
        }`}
      >
        {/* Logo & Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div
            className={`${
              showBanner && banner && !compact
                ? "border-4 border-white dark:border-gray-700 shadow-lg"
                : "border border-gray-200 dark:border-gray-700"
            } rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-gray-700 ${
              compact ? "w-16 h-16" : "w-20 h-20"
            }`}
          >
            {logo ? (
              <OptimizedImage
                src={logo}
                alt={name}
                width={compact ? 64 : 80}
                height={compact ? 64 : 80}
                quality={90}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Shop Name & Verification */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {name}
              </h3>
              {isVerified && (
                <BadgeCheck
                  className="w-5 h-5 text-blue-500 flex-shrink-0"
                  aria-label="Verified shop"
                />
              )}
            </div>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {rating.toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Location */}
            {location && !compact && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {/* Follow Button */}
          {onFollow && (
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors flex-shrink-0 ${
                isFollowing
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* Description */}
        {description && !compact && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Categories */}
        {categories.length > 0 && !compact && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
              >
                {category}
              </span>
            ))}
            {categories.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                +{categories.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Rating & Reviews */}
          {rating > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {rating.toFixed(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({formatCompactNumber(reviewCount)} reviews)
                </span>
              </div>
            </div>
          )}

          {/* Products & Auctions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCompactNumber(productCount)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Products
                {liveProductCount > 0 && (
                  <span className="ml-1 text-green-600 dark:text-green-400">
                    ({liveProductCount} live)
                  </span>
                )}
              </div>
            </div>
            <div className="text-center py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatCompactNumber(auctionCount)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Auctions
                {liveAuctionCount > 0 && (
                  <span className="ml-1 text-red-600 dark:text-red-400">
                    ({liveAuctionCount} live)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Visit Shop Button */}
          <div className="text-center">
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
              Visit Shop →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
