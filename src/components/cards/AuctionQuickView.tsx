/**
 * AuctionQuickView Component
 *
 * Quick view modal for auctions with bid placement
 * Opens when user clicks "Quick View" on auction card
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gavel,
  Eye,
  Heart,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatTimeRemaining } from "@/lib/formatters";
import { getTimeRemaining, getNextMinimumBid } from "@/lib/validation/auction";
import { FormLabel } from "@/components/forms/FormLabel";

export interface AuctionQuickViewProps {
  auction: {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    videos?: string[];
    currentBid: number;
    startingBid: number;
    bidIncrement: number;
    bidCount: number;
    endTime: Date | string;
    condition?: "new" | "used" | "refurbished";
    shop: {
      id: string;
      name: string;
      logo?: string;
      isVerified?: boolean;
    };
    specifications?: Array<{ name: string; value: string }>;
    allowAutoBid?: boolean;
    viewCount?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onPlaceBid?: (
    auctionId: string,
    bidAmount: number,
    isAutoBid: boolean,
    maxAutoBid?: number,
  ) => Promise<void>;
  onWatch?: (auctionId: string) => void;
  isWatched?: boolean;
}

export default function AuctionQuickView({
  auction,
  isOpen,
  onClose,
  onPlaceBid,
  onWatch,
  isWatched = false,
}: AuctionQuickViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isAutoBid, setIsAutoBid] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState<string>("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidError, setBidError] = useState<string>("");

  if (!isOpen) return null;

  // Convert endTime to Date object, handling various formats
  let endTime: Date | null = null;
  if (typeof auction.endTime === "string") {
    endTime = new Date(auction.endTime);
  } else if (auction.endTime instanceof Date) {
    endTime = auction.endTime;
  } else if (
    auction.endTime &&
    typeof auction.endTime === "object" &&
    "toDate" in auction.endTime
  ) {
    // Handle Firestore Timestamp
    endTime = (auction.endTime as any).toDate();
  }

  const timeRemaining = getTimeRemaining(endTime);
  const currentBid = auction.currentBid || auction.startingBid;
  const minNextBid = getNextMinimumBid(
    currentBid,
    auction.startingBid,
    auction.bidIncrement,
  );
  const isEnded = timeRemaining.isEnded;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? auction.images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === auction.images.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePlaceBid = async () => {
    if (!onPlaceBid) return;

    const bid = parseFloat(bidAmount);
    const maxBid = maxAutoBid ? parseFloat(maxAutoBid) : undefined;

    // Validation
    if (isNaN(bid) || bid < minNextBid) {
      setBidError(`Minimum bid is ${formatCurrency(minNextBid)}`);
      return;
    }

    if (isAutoBid && (!maxBid || maxBid <= bid)) {
      setBidError("Maximum auto-bid must be greater than your bid");
      return;
    }

    setBidError("");
    setIsPlacingBid(true);

    try {
      await onPlaceBid(auction.id, bid, isAutoBid, maxBid);
      // Reset form on success
      setBidAmount("");
      setMaxAutoBid("");
      setIsAutoBid(false);
    } catch (error) {
      setBidError(
        error instanceof Error ? error.message : "Failed to place bid",
      );
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleSetMinimumBid = () => {
    setBidAmount(minNextBid.toString());
    setBidError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick View
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/auctions/${auction.slug}`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300"
              title="View full details"
            >
              <ExternalLink size={20} />
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Left Column - Images */}
            <div>
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                {auction.images.length > 0 && (
                  <Image
                    src={auction.images[currentImageIndex]}
                    alt={auction.name || "Auction"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}

                {/* Navigation Arrows */}
                {auction.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-600 transition-colors"
                    >
                      <ChevronLeft size={20} className="dark:text-gray-300" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-600 transition-colors"
                    >
                      <ChevronRight size={20} className="dark:text-gray-300" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {auction.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {currentImageIndex + 1} / {auction.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {auction.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {auction.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${auction.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details & Bidding */}
            <div>
              {/* Shop Info */}
              <div className="flex items-center gap-2 mb-3">
                {auction.shop.logo && (
                  <Image
                    src={auction.shop.logo}
                    alt={auction.shop.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {auction.shop.name}
                </span>
                {auction.shop.isVerified && (
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Auction Name */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {auction.name}
              </h3>

              {/* Condition Badge */}
              {auction.condition && (
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {auction.condition.toUpperCase()}
                </span>
              )}

              {/* Current Bid & Time */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Current Bid
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(currentBid)}
                    </span>
                    {auction.bidCount > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({auction.bidCount}{" "}
                        {auction.bidCount === 1 ? "bid" : "bids"})
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    isEnded
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-red-600 dark:text-red-400 font-semibold"
                  }`}
                >
                  <Clock size={16} />
                  <span className="text-sm">
                    {isEnded ? "Auction Ended" : formatTimeRemaining(endTime)}
                  </span>
                </div>
              </div>

              {/* Bidding Form */}
              {!isEnded && (
                <div className="space-y-3 mb-4">
                  <div>
                    <FormLabel htmlFor="quick-bid-amount">
                      Your Bid (Min: {formatCurrency(minNextBid)})
                    </FormLabel>
                    <div className="flex gap-2">
                      <input
                        id="quick-bid-amount"
                        type="number"
                        value={bidAmount}
                        onChange={(e) => {
                          setBidAmount(e.target.value);
                          setBidError("");
                        }}
                        placeholder={`Enter ${formatCurrency(
                          minNextBid,
                        )} or more`}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={minNextBid}
                        step={auction.bidIncrement}
                      />
                      <button
                        onClick={handleSetMinimumBid}
                        className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        Min Bid
                      </button>
                    </div>
                  </div>

                  {/* Auto-bid Option */}
                  {auction.allowAutoBid && (
                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={isAutoBid}
                          onChange={(e) => setIsAutoBid(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enable Auto-bid
                        </span>
                      </label>
                      {isAutoBid && (
                        <input
                          type="number"
                          value={maxAutoBid}
                          onChange={(e) => {
                            setMaxAutoBid(e.target.value);
                            setBidError("");
                          }}
                          placeholder="Maximum auto-bid amount"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={
                            bidAmount
                              ? parseFloat(bidAmount) + auction.bidIncrement
                              : minNextBid
                          }
                        />
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {bidError && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle size={16} />
                      <span>{bidError}</span>
                    </div>
                  )}

                  {/* Place Bid Button */}
                  <button
                    onClick={handlePlaceBid}
                    disabled={isPlacingBid || !bidAmount}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Gavel size={18} />
                    {isPlacingBid ? "Placing Bid..." : "Place Bid"}
                  </button>
                </div>
              )}

              {/* Watch Button */}
              <button
                onClick={() => onWatch?.(auction.id)}
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Heart
                  size={18}
                  className={
                    isWatched
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 dark:text-gray-400"
                  }
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                </span>
              </button>

              {/* Description */}
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                  {auction.description}
                </p>
              </div>

              {/* Specifications */}
              {auction.specifications && auction.specifications.length > 0 && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Specifications
                  </h4>
                  <div className="space-y-1">
                    {auction.specifications.slice(0, 5).map((spec, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {spec.name}:
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Full Details Link */}
              <Link
                href={`/auctions/${auction.slug}`}
                className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
