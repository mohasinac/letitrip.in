/**
 * AuctionCard Component
 *
 * Displays auction information in a card format for listings
 * Similar to ProductCard but for auctions
 */

"use client";

import React from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import Link from "next/link";
import { Clock, Gavel, Eye, Heart, ExternalLink } from "lucide-react";
import { formatCurrency, formatTimeRemaining } from "@/lib/formatters";
import { getTimeRemaining } from "@/lib/validation/auction";

export interface AuctionCardProps {
  auction: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    videos?: string[]; // Video URLs for carousel
    currentBid: number;
    startingBid: number;
    bidCount: number;
    endTime: Date | string;
    condition?: "new" | "used" | "refurbished";
    isFeatured?: boolean;
    shop?: {
      id: string;
      name: string;
      logo?: string;
      isVerified?: boolean;
    };
    viewCount?: number;
  };
  onWatch?: (auctionId: string) => void;
  isWatched?: boolean;
  showShopInfo?: boolean;
  priority?: boolean;
}

export default function AuctionCard({
  auction,
  onWatch,
  isWatched = false,
  showShopInfo = true,
  priority = false,
}: AuctionCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = React.useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

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
  const hasImage = auction.images && auction.images.length > 0;

  // Combine all media (video first if available, then images)
  const allMedia = React.useMemo(() => {
    const media: Array<{ type: "video" | "image"; url: string }> = [];

    if (auction.videos && auction.videos.length > 0) {
      media.push(
        ...auction.videos.map((url) => ({ type: "video" as const, url }))
      );
    }

    if (auction.images && auction.images.length > 0) {
      media.push(
        ...auction.images.map((url) => ({ type: "image" as const, url }))
      );
    }

    return media;
  }, [auction.images, auction.videos]);

  // Auto-rotate media on hover
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
    allMedia[0] || { type: "image", url: auction.images[0] };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWatch) {
      onWatch(auction.id);
    }
  };

  // Determine urgency level for styling
  const isEndingSoon =
    timeRemaining.totalMs <= 24 * 60 * 60 * 1000 && !timeRemaining.isEnded;
  const isEnded = timeRemaining.isEnded;

  return (
    <Link
      href={`/auctions/${auction.slug}`}
      className="group block bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Video Section */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
        {allMedia.length > 0 ? (
          currentMedia.type === "video" && isHovered ? (
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
              alt={auction.name}
              fill
              quality={85}
              objectFit="cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={
                isHovered
                  ? "scale-105 transition-transform duration-300"
                  : "transition-transform duration-300"
              }
              priority={priority}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Gavel size={48} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {auction.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              FEATURED
            </span>
          )}
          {auction.condition && (
            <span className="bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded uppercase">
              {auction.condition}
            </span>
          )}
          {isEnded && (
            <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
              ENDED
            </span>
          )}
          {isEndingSoon && !isEnded && (
            <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded animate-pulse">
              ENDING SOON
            </span>
          )}
        </div>

        {/* Watch Button */}
        <button
          onClick={handleWatchClick}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Heart
            size={20}
            className={
              isWatched ? "fill-red-500 text-red-500" : "text-gray-600"
            }
          />
        </button>

        {/* View Count */}
        {auction.viewCount && auction.viewCount > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
            <Eye size={12} />
            <span>{auction.viewCount}</span>
          </div>
        )}

        {/* Media Indicators */}
        {allMedia.length > 1 && isHovered && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {allMedia.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentMediaIndex ? "bg-white w-4" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Shop Info */}
        {showShopInfo && auction.shop && (
          <div className="flex items-center gap-2 mb-2">
            {auction.shop.logo && (
              <OptimizedImage
                src={auction.shop.logo}
                alt={auction.shop.name}
                width={20}
                height={20}
                quality={90}
                className="rounded-full"
              />
            )}
            <span className="text-xs text-gray-600 truncate">
              {auction.shop.name}
            </span>
            {auction.shop.isVerified && (
              <svg
                className="w-4 h-4 text-blue-500 flex-shrink-0"
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
        )}

        {/* Auction Name */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {auction.name}
        </h3>

        {/* Current Bid */}
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">Current Bid</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(currentBid)}
            </span>
            {auction.bidCount > 0 && (
              <span className="text-xs text-gray-500">
                ({auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"})
              </span>
            )}
          </div>
        </div>

        {/* Time Remaining */}
        <div
          className={`flex items-center gap-1 text-sm ${
            isEnded
              ? "text-gray-500"
              : isEndingSoon
              ? "text-red-600 font-semibold"
              : "text-gray-700"
          }`}
        >
          <Clock size={14} />
          <span>{isEnded ? "Ended" : formatTimeRemaining(endTime)}</span>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // This would typically open a quick bid modal
          }}
          className={`mt-3 w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
            isEnded
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={isEnded}
        >
          <Gavel size={16} />
          {isEnded ? "Auction Ended" : "Place Bid"}
        </button>
      </div>
    </Link>
  );
}
