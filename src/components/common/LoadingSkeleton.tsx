/**
 * Loading skeleton component for better loading states
 */

interface LoadingSkeletonProps {
  type?: "card" | "list" | "detail" | "grid";
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  type = "card",
  count = 1,
  className = "",
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === "card") {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className={`animate-pulse ${className}`}>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {/* Image skeleton */}
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-600" />

              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                <div className="flex items-center justify-between mt-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "list") {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            className={`animate-pulse flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg ${className}`}
          >
            {/* Image skeleton */}
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0" />

            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              <div className="flex items-center gap-4 mt-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20" />
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24" />
              </div>
            </div>

            {/* Action skeleton */}
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32" />
          </div>
        ))}
      </>
    );
  }

  if (type === "detail") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            <div className="w-full h-96 bg-gray-300 dark:bg-gray-600 rounded-lg" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded"
                />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6" />
            </div>
            <div className="flex gap-4 mt-8">
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded flex-1" />
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      >
        {skeletons.map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-600" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                <div className="flex items-center justify-between mt-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
