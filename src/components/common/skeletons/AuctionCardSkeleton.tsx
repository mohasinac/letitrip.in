import { cn } from "@/lib/utils";
import {
  Skeleton,
  SkeletonButton,
  SkeletonImage,
  SkeletonText,
} from "@letitrip/react-library";

interface AuctionCardSkeletonProps {
  className?: string;
}

/**
 * Skeleton loader for AuctionCard component
 * Matches the layout of the actual AuctionCard
 */
export function AuctionCardSkeleton({ className }: AuctionCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
        className
      )}
    >
      {/* Auction Image/Video */}
      <div className="relative">
        <SkeletonImage aspectRatio="video" className="rounded-none" />

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Auction Title */}
        <Skeleton className="h-6 w-full" />

        {/* Description */}
        <SkeletonText lines={2} />

        {/* Bid Information */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100">
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Shop Info */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <SkeletonButton className="flex-1" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of AuctionCard skeletons
 */
export function AuctionCardSkeletonGrid({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <AuctionCardSkeleton key={i} />
      ))}
    </div>
  );
}
