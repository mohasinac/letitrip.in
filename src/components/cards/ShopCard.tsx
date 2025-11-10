"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BadgeCheck, ShoppingBag } from "lucide-react";
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
  isFeatured?: boolean;
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
  isFeatured = false,
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
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Banner */}
      {showBanner && banner && !compact && (
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          <Image
            src={banner}
            alt={`${name} banner`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {isFeatured && (
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
                ? "border-4 border-white shadow-lg"
                : "border border-gray-200"
            } rounded-lg overflow-hidden flex-shrink-0 bg-white ${
              compact ? "w-16 h-16" : "w-20 h-20"
            }`}
          >
            {logo ? (
              <Image
                src={logo}
                alt={name}
                width={compact ? 64 : 80}
                height={compact ? 64 : 80}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Shop Name & Verification */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
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
                <span className="text-sm font-medium text-gray-900">
                  {rating.toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span className="text-xs text-gray-500">
                    ({reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Location */}
            {location && !compact && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
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
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* Description */}
        {description && !compact && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Categories */}
        {categories.length > 0 && !compact && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {category}
              </span>
            ))}
            {categories.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{categories.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          {/* Rating & Reviews */}
          {rating > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({formatCompactNumber(reviewCount)} reviews)
                </span>
              </div>
            </div>
          )}

          {/* Products & Auctions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center py-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {formatCompactNumber(productCount)}
              </div>
              <div className="text-xs text-gray-600">
                Products
                {liveProductCount > 0 && (
                  <span className="ml-1 text-green-600">
                    ({liveProductCount} live)
                  </span>
                )}
              </div>
            </div>
            <div className="text-center py-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {formatCompactNumber(auctionCount)}
              </div>
              <div className="text-xs text-gray-600">
                Auctions
                {liveAuctionCount > 0 && (
                  <span className="ml-1 text-red-600">
                    ({liveAuctionCount} live)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Visit Shop Button */}
          <div className="text-center">
            <span className="text-sm text-blue-600 font-medium group-hover:underline">
              Visit Shop →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
