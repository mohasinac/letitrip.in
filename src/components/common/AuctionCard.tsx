"use client";

import { ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

interface AuctionCardProps {
  id: string;
  title: string;
  slug: string;
  currentBid: number;
  startingPrice: number;
  buyNowPrice?: number;
  image?: string;
  images?: string[];
  endTime: string;
  bidCount?: number;
  condition?: string;
  shopName?: string;
  shopSlug?: string;
  status?: "active" | "ended" | "scheduled";
  variant?: "public" | "seller" | "admin";
  LinkComponent?: React.ComponentType<any>;
  ImageComponent?: React.ComponentType<any> | string;
  formatPrice?: (price: number) => string;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

export function AuctionCard({
  id,
  title,
  slug,
  currentBid,
  startingPrice,
  buyNowPrice,
  image,
  images,
  endTime,
  bidCount = 0,
  condition = "used",
  shopName,
  shopSlug,
  status = "active",
  variant = "public",
  LinkComponent = Link,
  ImageComponent = "img",
  formatPrice = (price) => (price ? `₹${price.toLocaleString()}` : "₹0"),
  className = "",
  onEdit,
  onDelete,
  onToggleStatus,
}: AuctionCardProps) {
  const auctionImage = image || images?.[0] || "/placeholder-auction.svg";
  const auctionUrl = `/buy-auction-${slug}`;
  const shopUrl = shopSlug ? `/shops/${shopSlug}` : "#";

  // Calculate time remaining
  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return "Ended";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const timeRemaining = getTimeRemaining(endTime);
  const isEnded = timeRemaining === "Ended" || status === "ended";
  const isScheduled = status === "scheduled";

  // Get status color
  const getStatusColor = () => {
    if (isEnded) return "text-red-600 dark:text-red-400";
    if (isScheduled) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group ${className}`}
    >
      <div className="relative">
        {/* Auction Image */}
        <LinkComponent href={auctionUrl} className="block">
          {React.createElement(ImageComponent as any, {
            src: auctionImage,
            alt: title,
            className:
              "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300",
            onError: (e: any) => {
              e.target.src = "/placeholder-auction.svg";
            },
          })}
        </LinkComponent>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              isEnded
                ? "bg-red-500 text-white"
                : isScheduled
                ? "bg-yellow-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Condition Badge */}
        {condition && (
          <div className="absolute top-2 right-2">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium capitalize">
              {condition}
            </span>
          </div>
        )}

        {/* Time Remaining */}
        <div className="absolute bottom-2 right-2">
          <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            <span className={getStatusColor()}>{timeRemaining}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Auction Title */}
        <LinkComponent href={auctionUrl}>
          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {title}
          </h3>
        </LinkComponent>

        {/* Shop Name */}
        {shopName && (
          <LinkComponent href={shopUrl}>
            <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
              by {shopName}
            </p>
          </LinkComponent>
        )}

        {/* Bid Info */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Current Bid:
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(currentBid || 0)}
            </span>
          </div>

          {buyNowPrice && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Buy Now:
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {formatPrice(buyNowPrice)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Starting Price:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatPrice(startingPrice || 0)}
            </span>
          </div>
        </div>

        {/* Bid Count */}
        <div className="flex items-center gap-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
          <UserIcon className="w-4 h-4" />
          <span>
            {bidCount} {bidCount === 1 ? "bid" : "bids"}
          </span>
        </div>

        {/* Actions for different variants */}
        {variant === "seller" && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onToggleStatus}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                status === "active"
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {status === "active" ? "Pause" : "Activate"}
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {variant === "admin" && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              View
            </button>
            <button
              onClick={onToggleStatus}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                status === "active"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {status === "active" ? "Suspend" : "Approve"}
            </button>
          </div>
        )}

        {variant === "public" && !isEnded && (
          <div className="flex gap-2">
            {buyNowPrice && (
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 transition-colors">
                Buy Now
              </button>
            )}
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors">
              {bidCount === 0 ? "Place Bid" : "View Auction"}
            </button>
          </div>
        )}

        {variant === "public" && isEnded && (
          <button
            className="w-full bg-gray-400 text-white py-2 px-4 rounded font-medium cursor-not-allowed"
            disabled
          >
            Auction Ended
          </button>
        )}

        {variant === "public" && isScheduled && (
          <button
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded font-medium cursor-not-allowed"
            disabled
          >
            Starting Soon
          </button>
        )}
      </div>
    </div>
  );
}

export default AuctionCard;
