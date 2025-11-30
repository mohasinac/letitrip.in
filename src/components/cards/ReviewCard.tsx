"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ThumbsUp, ShieldCheck, Calendar, Package } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { safeToISOString } from "@/lib/date-utils";

export interface ReviewCardProps {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  shopId?: string;
  shopName?: string;
  rating: number;
  title?: string;
  comment: string;
  media?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  isHelpful?: boolean;
  createdAt: Date | string;
  onMarkHelpful?: (id: string) => void;
  compact?: boolean;
  showProduct?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  userId,
  userName,
  userAvatar,
  productId,
  productName,
  productImage,
  shopId,
  shopName,
  rating,
  title,
  comment,
  media = [],
  verifiedPurchase,
  helpfulCount,
  isHelpful = false,
  createdAt,
  onMarkHelpful,
  compact = false,
  showProduct = true,
}) => {
  const reviewDate =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  const handleMarkHelpful = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkHelpful) {
      onMarkHelpful(id);
    }
  };

  // Render star rating
  const renderStars = () => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 dark:fill-gray-600 text-gray-200 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className={`p-${compact ? "3" : "4"}`}>
        {/* Header: User Info & Rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User Name & Verified Badge */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {userName}
                </span>
                {verifiedPurchase && (
                  <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Purchase</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                <time dateTime={safeToISOString(reviewDate) ?? undefined}>
                  {formatDate(reviewDate)}
                </time>
              </div>
            </div>
          </div>

          {/* Rating Stars */}
          {renderStars()}
        </div>

        {/* Review Title */}
        {title && (
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h4>
        )}

        {/* Review Comment */}
        <p
          className={`text-sm text-gray-700 dark:text-gray-300 ${
            compact ? "line-clamp-2" : "line-clamp-4"
          } mb-3`}
        >
          {comment}
        </p>

        {/* Review Media */}
        {!compact && media.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {media.slice(0, 4).map((mediaUrl, index) => (
              <div
                key={index}
                className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
              >
                <Image
                  src={mediaUrl}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))}
            {media.length > 4 && (
              <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                +{media.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Product Info (if showing) */}
        {showProduct && productId && productName && (
          <Link
            href={`/products/${productId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 p-2 mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {productImage && (
              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-white dark:bg-gray-600">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                <Package className="w-3 h-3" />
                <span>Reviewed Product</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {productName}
              </p>
              {shopName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {shopName}
                </p>
              )}
            </div>
          </Link>
        )}

        {/* Footer: Helpful Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleMarkHelpful}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isHelpful
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
            disabled={isHelpful}
          >
            <ThumbsUp
              className={`w-4 h-4 ${isHelpful ? "fill-current" : ""}`}
            />
            <span>Helpful</span>
            {helpfulCount > 0 && (
              <span className="text-xs">({helpfulCount})</span>
            )}
          </button>

          {shopName && !showProduct && (
            <Link
              href={`/shops/${shopId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {shopName}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
