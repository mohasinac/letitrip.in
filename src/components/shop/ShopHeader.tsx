"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Heart, Share2 } from "lucide-react";
import type { ShopFE, ShopCardFE } from "@/types/frontend/shop.types";
import { shopsService } from "@/services/shops.service";

interface ShopHeaderProps {
  shop: ShopFE;
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);

  // Check if already following on mount
  useEffect(() => {
    checkFollowStatus();
  }, [shop.slug]);

  const checkFollowStatus = async () => {
    try {
      const result = await shopsService.checkFollowing(shop.slug);
      setIsFollowing(result.isFollowing);
    } catch (error) {
      // User not authenticated or error - default to not following
      setIsFollowing(false);
    } finally {
      setCheckingFollow(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await shopsService.unfollow(shop.slug);
        setIsFollowing(false);
      } else {
        await shopsService.follow(shop.slug);
        setIsFollowing(true);
      }
    } catch (error: any) {
      console.error("Failed to follow/unfollow shop:", error);
      alert(error.message || "Please login to follow shops");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop.name,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Banner */}
      {shop.banner && (
        <div className="w-full h-48 md:h-64 relative">
          <img
            src={shop.banner}
            alt={`${shop.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Shop Info */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-24 h-24 rounded-lg object-cover border-4 border-white dark:border-gray-800 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                <span className="text-3xl font-bold text-gray-400 dark:text-gray-500">
                  {shop.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {shop.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {shop.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {shop.rating.toFixed(1)}
                      </span>
                      <span>({shop.reviewCount} reviews)</span>
                    </div>
                  )}
                  {(shop.city || shop.state) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[shop.city, shop.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {shop.isVerified && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                      Verified Seller
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleFollow}
                  disabled={followLoading || checkingFollow}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    isFollowing
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 inline mr-2 ${
                      isFollowing ? "fill-current" : ""
                    }`}
                  />
                  {checkingFollow
                    ? "..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {shop.productCount || 0}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  Products
                </span>
              </div>
              {shop.createdAt && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Joined{" "}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(shop.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
