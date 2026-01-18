/**
 * AuctionCard - Pure React Component
 *
 * Displays auction information in a card format for listings.
 * Similar to ProductCard but for auctions with real-time countdown and bidding features.
 *
 * Features:
 * - Image/video carousel on hover
 * - Real-time countdown timer
 * - Multiple variants (public, admin, seller, compact)
 * - Watch/favorite functionality
 * - Admin moderation actions
 * - Bid count and status indicators
 *
 * @packageDocumentation
 */

import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Gavel,
  Shield,
  Trash2,
} from "lucide-react";
import React, {
  ComponentType,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AuctionCardVariant = "public" | "admin" | "seller" | "compact";

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
    featured?: boolean;
    status?:
      | "active"
      | "live"
      | "pending"
      | "ended"
      | "cancelled"
      | "moderation";
    shop?: {
      id: string;
      name: string;
      logo?: string;
      isVerified?: boolean;
    };
    viewCount?: number;
  };
  variant?: AuctionCardVariant;
  showShopInfo?: boolean;
  priority?: boolean;

  // State
  isWatched?: boolean;
  isSelected?: boolean;

  // Action handlers (callbacks)
  onWatch?: (auctionId: string) => void;
  onEdit?: (slug: string) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSelect?: (id: string, selected: boolean) => void;

  // Injected dependencies
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    children: ReactNode;
  }>;
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    quality?: number;
    objectFit?: "cover" | "contain";
    className?: string;
    sizes?: string;
    priority?: boolean;
  }>;
  FavoriteButtonComponent?: ComponentType<{
    itemId: string;
    itemType: string;
    initialIsFavorite?: boolean;
    onToggle?: () => void;
    size?: "sm" | "md" | "lg";
  }>;
  formatPrice: (price: number) => string;
  formatTimeRemaining: (endTime: Date | null) => string;
  getTimeRemaining: (endTime: Date | null) => {
    totalMs: number;
    isEnded: boolean;
  };
  cn: (...classes: (string | boolean | undefined)[]) => string;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  variant = "public",
  showShopInfo = true,
  priority = false,
  isWatched = false,
  isSelected = false,
  onWatch,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onSelect,
  LinkComponent,
  ImageComponent,
  FavoriteButtonComponent,
  formatPrice,
  formatTimeRemaining,
  getTimeRemaining,
  cn,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Variant-specific flags
  const isCompact = variant === "compact";
  const isAdmin = variant === "admin";
  const isSeller = variant === "seller";

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

  // Check if videos are available
  const hasVideos = auction.videos && auction.videos.length > 0;

  // Get all images
  const allImages = useMemo(() => {
    return auction.images && auction.images.length > 0 ? auction.images : [];
  }, [auction.images]);

  // Auto-rotate on hover: video takes priority, otherwise rotate images
  useEffect(() => {
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

  const currentImage = allImages[currentMediaIndex] || allImages[0] || "";

  // Determine urgency level for styling
  const isEndingSoon =
    timeRemaining.totalMs <= 24 * 60 * 60 * 1000 && !timeRemaining.isEnded;

  // Auction is ended if time has passed OR status is explicitly "ended" or "cancelled"
  const isEnded =
    timeRemaining.isEnded ||
    auction.status === "ended" ||
    auction.status === "cancelled";

  // Check if auction is truly live:
  const isTrulyLive =
    (auction.status === "active" || auction.status === "live") &&
    !timeRemaining.isEnded;

  // Auction is upcoming if status is pending (not yet started)
  const isUpcoming = auction.status === "pending";

  // Auction is in moderation review
  const isInModeration = auction.status === "moderation";

  // Status badge for admin/seller variants
  const statusBadge = isAdmin || isSeller ? auction.status : null;

  // Handle selection for bulk actions
  const handleSelectClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(auction.id, !isSelected);
  };

  // Handle edit click
  const handleEditClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(auction.slug);
  };

  // Handle delete click
  const handleDeleteClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(auction.id);
  };

  // Handle approve click
  const handleApproveClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApprove?.(auction.id);
  };

  // Handle reject click
  const handleRejectClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReject?.(auction.id);
  };

  // Card container classes based on variant
  const cardClasses = cn(
    "group block rounded-lg overflow-hidden transition-all duration-200",
    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    "hover:shadow-lg dark:hover:shadow-gray-900/50",
    isSelected && "ring-2 ring-blue-500 dark:ring-blue-400",
    isCompact && "hover:shadow-md",
  );

  return (
    <LinkComponent
      href={`/auctions/${auction.slug}`}
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Video Section */}
      <div
        className={cn(
          "relative overflow-hidden bg-gray-100 dark:bg-gray-700",
          isCompact ? "aspect-[4/3]" : "aspect-square",
        )}
      >
        {/* Selection Checkbox for Admin/Seller */}
        {(isAdmin || isSeller) && onSelect && (
          <div className="absolute top-2 left-2 z-30">
            <button
              onClick={handleSelectClick}
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white/90 border-gray-400 hover:border-blue-500",
              )}
            >
              {isSelected && <CheckCircle size={14} />}
            </button>
          </div>
        )}

        {/* Video layer - shown when playing video */}
        {hasVideos && (
          <video
            ref={videoRef}
            src={auction.videos![0]}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
              isPlayingVideo ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            muted
            loop
            playsInline
          />
        )}

        {/* Image layer */}
        {currentImage ? (
          <ImageComponent
            src={currentImage}
            alt={auction.name || "Auction"}
            fill
            quality={85}
            objectFit="cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`transition-all duration-300 ${
              isHovered && !isPlayingVideo ? "scale-105" : ""
            } ${isPlayingVideo ? "opacity-0" : "opacity-100"}`}
            priority={priority}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Gavel size={48} />
          </div>
        )}

        {/* Badges - Clear hierarchy: Status > Time State > Features */}
        <div
          className={cn(
            "absolute flex flex-col gap-1 z-20",
            (isAdmin || isSeller) && onSelect ? "top-2 left-9" : "top-2 left-2",
          )}
        >
          {/* Primary Status Badge - For Admin/Seller or special states */}
          {statusBadge &&
            statusBadge !== "active" &&
            statusBadge !== "live" && (
              <span
                className={cn(
                  "text-white text-xs font-semibold px-2 py-1 rounded",
                  statusBadge === "pending" && "bg-yellow-500",
                  statusBadge === "moderation" && "bg-purple-500",
                  statusBadge === "ended" && "bg-gray-500",
                  statusBadge === "cancelled" && "bg-red-600",
                )}
              >
                {statusBadge.charAt(0).toUpperCase() + statusBadge.slice(1)}
              </span>
            )}

          {/* Live Badge - Only shown when truly live */}
          {isTrulyLive && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
          )}

          {/* Ended Badge - Only for public view when auction has ended */}
          {isEnded && !statusBadge && (
            <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Ended
            </span>
          )}

          {/* Upcoming Badge - Only for pending auctions not yet started */}
          {isUpcoming && !statusBadge && (
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Upcoming
            </span>
          )}

          {/* Ending Soon Badge - Only for live auctions ending within 24h */}
          {isEndingSoon && !isEnded && isTrulyLive && (
            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded animate-pulse">
              Ending Soon
            </span>
          )}

          {/* Featured Badge */}
          {auction.featured && (
            <span className="bg-yellow-500 text-gray-900 text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}

          {/* Condition Badge - Only for used/refurbished */}
          {!isCompact && auction.condition && auction.condition !== "new" && (
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded capitalize">
              {auction.condition}
            </span>
          )}
        </div>

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
                {auction.videos!.length}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          {/* Admin Actions */}
          {isAdmin && (
            <>
              {auction.status === "moderation" && onApprove && (
                <button
                  onClick={handleApproveClick}
                  className="p-2 rounded-full bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors"
                  title="Approve"
                >
                  <CheckCircle size={16} />
                </button>
              )}
              {auction.status === "moderation" && onReject && (
                <button
                  onClick={handleRejectClick}
                  className="p-2 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                  title="Reject"
                >
                  <Shield size={16} />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={handleEditClick}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}

          {/* Seller Actions */}
          {isSeller && (
            <>
              {onEdit && (
                <button
                  onClick={handleEditClick}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}

          {/* Public/Compact Actions */}
          {!isAdmin && !isSeller && FavoriteButtonComponent && (
            <>
              <FavoriteButtonComponent
                itemId={auction.id}
                itemType="auction"
                initialIsFavorite={isWatched}
                onToggle={() => onWatch?.(auction.id)}
                size="md"
              />
              {!isCompact && auction.viewCount && auction.viewCount > 0 && (
                <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 flex items-center gap-1 text-xs">
                  <Eye size={14} />
                  <span>
                    {auction.viewCount > 999
                      ? `${Math.floor(auction.viewCount / 1000)}k`
                      : auction.viewCount}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className={cn("p-3", isCompact && "p-2")}>
        {/* Shop Info - not shown in compact */}
        {!isCompact && showShopInfo && auction.shop && (
          <div className="flex items-center gap-1.5 mb-2">
            {auction.shop.logo && (
              <ImageComponent
                src={auction.shop.logo}
                alt={auction.shop.name}
                width={16}
                height={16}
                quality={90}
                className="rounded-full"
              />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {auction.shop.name}
            </span>
            {auction.shop.isVerified && (
              <svg
                className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"
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
        <h3
          className={cn(
            "font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
            isCompact
              ? "text-xs line-clamp-1 mb-1"
              : "text-sm line-clamp-2 mb-2 min-h-[2.5rem]",
          )}
        >
          {auction.name}
        </h3>

        {/* Current Bid */}
        <div className={cn(isCompact ? "mb-1" : "mb-2")}>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "font-bold text-gray-900 dark:text-white",
                isCompact ? "text-sm" : "text-lg",
              )}
            >
              {formatPrice(currentBid)}
            </span>
            {!isCompact && auction.bidCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
              </span>
            )}
          </div>
          {!isCompact && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current Bid
            </div>
          )}
        </div>

        {/* Time Remaining */}
        <div
          className={cn(
            "flex items-center gap-1 text-xs",
            isCompact ? "mb-0" : "mb-3",
            isEnded
              ? "text-gray-500 dark:text-gray-500"
              : isEndingSoon
              ? "text-orange-600 dark:text-orange-400 font-medium"
              : "text-gray-600 dark:text-gray-400",
          )}
        >
          <Clock size={isCompact ? 10 : 12} />
          <span>{isEnded ? "Ended" : formatTimeRemaining(endTime)}</span>
        </div>

        {/* Bid Count for Admin/Seller - in compact mode too */}
        {(isAdmin || isSeller) && auction.bidCount > 0 && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400",
              isCompact ? "mb-0" : "mb-3",
            )}
          >
            <Gavel size={12} />
            <span>
              {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
            </span>
          </div>
        )}

        {/* Quick Action Button - not shown in compact */}
        {!isCompact && !isAdmin && !isSeller && (
          <button
            onClick={(e) => {
              e.preventDefault();
              // This would typically open a quick bid modal or navigate to details
            }}
            disabled={isEnded}
            className={cn(
              "w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2",
              isEnded
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : isTrulyLive
                ? "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                : isUpcoming
                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
            )}
          >
            {isEnded ? (
              "Auction Ended"
            ) : isTrulyLive ? (
              <>
                <Gavel size={16} />
                Place Bid
              </>
            ) : isUpcoming ? (
              <>
                <Clock size={16} />
                Starting Soon
              </>
            ) : (
              <>
                <Eye size={16} />
                View Details
              </>
            )}
          </button>
        )}

        {/* Admin/Seller Quick Actions */}
        {!isCompact && (isAdmin || isSeller) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={14} />
                Edit
              </button>
            )}
            <button
              onClick={(e) => e.preventDefault()}
              className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={14} />
              View
            </button>
          </div>
        )}
      </div>
    </LinkComponent>
  );
};

// Memoized export for performance optimization
export default React.memo(AuctionCard);
