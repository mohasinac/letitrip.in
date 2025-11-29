import {
  Skeleton,
  SkeletonImage,
  SkeletonText,
  SkeletonButton,
} from "../Skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

/**
 * Skeleton loader for ProductCard component
 * Matches the layout of the actual ProductCard
 */
export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
        className,
      )}
    >
      {/* Product Image */}
      <SkeletonImage aspectRatio="square" className="rounded-none" />

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Skeleton className="h-5 w-3/4" />

        {/* Product Description */}
        <SkeletonText lines={2} />

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Rating & Shop */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Skeleton className="h-4 w-20" />
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
 * Grid of ProductCard skeletons
 */
export function ProductCardSkeletonGrid({
  count = 12,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
