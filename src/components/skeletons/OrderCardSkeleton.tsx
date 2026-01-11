/**
 * OrderCardSkeleton Component
 * 
 * Loading skeleton for order cards
 * Matches the layout of actual OrderCard component
 */

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 animate-pulse">
      {/* Order Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
        <div className="h-7 bg-gray-200 rounded-full w-24" />
      </div>

      {/* Order Items */}
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {/* Item Image */}
            <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0" />

            {/* Item Details */}
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-6 bg-gray-200 rounded w-32" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

/**
 * OrderCardSkeletonList Component
 * 
 * List of order card skeletons
 */
export function OrderCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}
