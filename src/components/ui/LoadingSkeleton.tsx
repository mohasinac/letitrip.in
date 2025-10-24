"use client";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "product" | "auction";
  count?: number;
}

export default function LoadingSkeleton({
  className = "",
  variant = "default",
  count = 1,
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className={`card p-4 animate-pulse ${className}`}>
            <div className="aspect-square bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        );

      case "product":
        return (
          <div className={`card overflow-hidden animate-pulse ${className}`}>
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        );

      case "auction":
        return (
          <div
            className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 animate-pulse ${className}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-white/20 rounded w-16"></div>
              <div className="h-4 bg-white/20 rounded w-12"></div>
            </div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="h-10 bg-white/20 rounded"></div>
          </div>
        );

      default:
        return (
          <div
            className={`h-4 bg-gray-200 rounded animate-pulse ${className}`}
          ></div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
