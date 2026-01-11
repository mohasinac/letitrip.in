/**
 * ProductCardSkeleton Component
 *
 * Loading skeleton for product cards
 * Matches the layout of actual ProductCard component
 */

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Product Image */}
      <div className="w-full h-48 bg-gray-200" />

      <div className="p-4 space-y-3">
        {/* Product Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />

        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/3" />

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>

        {/* Shop Name */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-9 bg-gray-200 rounded w-24" />
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-gray-200 rounded" />
            <div className="h-9 w-9 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductCardSkeletonGrid Component
 *
 * Grid of product card skeletons
 */
export function ProductCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
