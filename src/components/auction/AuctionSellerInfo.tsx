"use client";

import Link from "next/link";
import { Store, Star, Calendar, MessageCircle } from "lucide-react";

export interface AuctionSellerInfoProps {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating: number;
  sellerReviewCount: number;
  memberSince: string;
  shopId?: string;
  shopName?: string;
  shopSlug?: string;
  onContactSeller?: () => void;
  className?: string;
}

/**
 * AuctionSellerInfo Component
 *
 * Displays seller information on auction detail pages.
 * Used on auction detail pages.
 *
 * Features:
 * - Seller avatar and name
 * - Seller rating and review count
 * - Member since date
 * - Shop link button
 * - Contact seller button
 * - Verified badge (if applicable)
 *
 * @example
 * ```tsx
 * <AuctionSellerInfo
 *   sellerId="seller123"
 *   sellerName="John Doe"
 *   sellerRating={4.8}
 *   sellerReviewCount={150}
 *   memberSince="2022-01-15"
 *   shopSlug="johns-shop"
 *   onContactSeller={handleContact}
 * />
 * ```
 */
export function AuctionSellerInfo({
  sellerId,
  sellerName,
  sellerAvatar,
  sellerRating,
  sellerReviewCount,
  memberSince,
  shopId,
  shopName,
  shopSlug,
  onContactSeller,
  className = "",
}: AuctionSellerInfoProps) {
  const memberSinceDate = new Date(memberSince);
  const memberYears = new Date().getFullYear() - memberSinceDate.getFullYear();

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Seller Information
      </h3>

      {/* Seller Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {sellerAvatar ? (
            <img
              src={sellerAvatar}
              alt={sellerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
              {sellerName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {sellerName}
          </h4>

          {/* Rating */}
          {sellerRating > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-gray-900 dark:text-white font-medium">
                  {sellerRating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                ({sellerReviewCount} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Member Since */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Calendar className="w-4 h-4" />
        <span>
          Member since{" "}
          {memberSinceDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })}
          {memberYears > 0 &&
            ` (${memberYears} year${memberYears > 1 ? "s" : ""})`}
        </span>
      </div>

      {/* Shop Link */}
      {shopSlug && (
        <Link
          href={`/shops/${shopSlug}`}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors mb-3"
        >
          <Store className="w-4 h-4" />
          <span className="font-medium">Visit {shopName || "Shop"}</span>
        </Link>
      )}

      {/* Contact Seller */}
      {onContactSeller && (
        <button
          type="button"
          onClick={onContactSeller}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Contact Seller</span>
        </button>
      )}

      {/* Trust Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          All sellers are verified and must follow our seller guidelines.
        </p>
      </div>
    </div>
  );
}

export default AuctionSellerInfo;
