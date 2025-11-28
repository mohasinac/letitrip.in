"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function MobileSkeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = cn(
    "bg-gray-200",
    animation === "pulse" && "animate-pulse",
    animation === "wave" && "animate-shimmer",
    variant === "circular" && "rounded-full",
    variant === "rounded" && "rounded-lg",
    variant === "text" && "rounded h-4",
    className
  );

  return (
    <div
      className={baseClasses}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      role="progressbar"
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}

// Pre-built skeleton components
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <MobileSkeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <MobileSkeleton variant="text" className="h-4 w-3/4" />
        <MobileSkeleton variant="text" className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <MobileSkeleton variant="text" className="h-5 w-20" />
          <MobileSkeleton variant="rounded" className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <MobileSkeleton variant="text" className="h-4 w-32" />
          <MobileSkeleton variant="text" className="h-3 w-24" />
        </div>
        <MobileSkeleton variant="rounded" className="h-6 w-16" />
      </div>
      <div className="flex gap-3">
        <MobileSkeleton variant="rounded" className="h-16 w-16" />
        <div className="flex-1 space-y-2">
          <MobileSkeleton variant="text" className="h-4 w-full" />
          <MobileSkeleton variant="text" className="h-3 w-2/3" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <MobileSkeleton variant="text" className="h-4 w-20" />
        <MobileSkeleton variant="rounded" className="h-8 w-24" />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <MobileSkeleton variant="circular" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <MobileSkeleton variant="text" className="h-4 w-32" />
          <MobileSkeleton variant="text" className="h-3 w-48" />
        </div>
        <MobileSkeleton variant="rounded" className="h-6 w-16" />
      </div>
    </div>
  );
}

export function AddressCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
      <div className="flex justify-between items-start">
        <MobileSkeleton variant="text" className="h-4 w-24" />
        <MobileSkeleton variant="rounded" className="h-5 w-12" />
      </div>
      <MobileSkeleton variant="text" className="h-3 w-full" />
      <MobileSkeleton variant="text" className="h-3 w-3/4" />
      <MobileSkeleton variant="text" className="h-3 w-1/2" />
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <MobileSkeleton variant="text" className="h-3 w-20" />
          <MobileSkeleton variant="text" className="h-6 w-16" />
        </div>
        <MobileSkeleton variant="circular" className="h-10 w-10" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <MobileSkeleton
          key={i}
          variant="text"
          className={cn(
            "h-4",
            i === 0 && "w-24",
            i === 1 && "w-32",
            i === 2 && "w-20",
            i === 3 && "w-16"
          )}
        />
      ))}
    </div>
  );
}

// List skeleton wrapper
export function ListSkeleton({
  count = 5,
  renderItem,
}: {
  count?: number;
  renderItem: () => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderItem()}</div>
      ))}
    </div>
  );
}
