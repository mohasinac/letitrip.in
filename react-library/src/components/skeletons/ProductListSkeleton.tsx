/**
 * ProductListSkeleton Component
 *
 * Loading skeleton for product list view
 * Matches the layout of actual ProductList component
 */

export function ProductListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="flex gap-4 p-4">
        {/* Product Image */}
        <div className="w-40 h-40 bg-gray-200 rounded flex-shrink-0" />

        {/* Product Details */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <div className="h-6 bg-gray-200 rounded w-3/4" />

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>

          {/* Price and Rating */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-7 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-200 rounded w-20" />
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>

          {/* Shop Info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 bg-gray-200 rounded w-32" />
            <div className="h-10 w-10 bg-gray-200 rounded" />
            <div className="h-10 w-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductListSkeletonList Component
 *
 * List of product list skeletons
 */
export function ProductListSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductListSkeleton key={i} />
      ))}
    </div>
  );
}
