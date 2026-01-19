import { ReactNode, useState } from "react";
import { HorizontalScroller } from "../common/HorizontalScroller";

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  productCount: number;
}

export interface SubcategoryGridProps {
  subcategories: Subcategory[];
  parentSlug: string;
  loading?: boolean;
  // Injection props
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
  }>;
  icons?: {
    search?: ReactNode;
    package?: ReactNode;
  };
  className?: string;
}

/**
 * SubcategoryGrid Component
 *
 * Horizontal scrollable grid for child categories using the generic HorizontalScroller.
 *
 * Features:
 * - Search/filter subcategories
 * - Sort by name or product count
 * - Product count badges
 * - Category images
 * - Uses HorizontalScroller for scroll logic
 *
 * @example
 * ```tsx
 * <SubcategoryGrid
 *   subcategories={subcategories}
 *   parentSlug="electronics"
 *   LinkComponent={NextLink}
 *   ImageComponent={OptimizedImage}
 * />
 * ```
 */
export function SubcategoryGrid({
  subcategories,
  parentSlug,
  loading = false,
  LinkComponent,
  ImageComponent,
  icons,
  className,
}: SubcategoryGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"alphabetical" | "productCount">(
    "alphabetical",
  );

  // Filter and sort subcategories
  const filteredSubcategories = subcategories
    .filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      } else {
        return b.productCount - a.productCount;
      }
    });

  if (subcategories.length === 0) {
    return null;
  }

  // Header actions (search + sort buttons)
  const headerActions = (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Sort Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSortBy("alphabetical")}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            sortBy === "alphabetical"
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          A-Z
        </button>
        <button
          type="button"
          onClick={() => setSortBy("productCount")}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            sortBy === "productCount"
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Popular
        </button>
      </div>
    </div>
  );

  // Empty state
  const emptyState = (
    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
      No subcategories found
    </p>
  );

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${
        className || ""
      }`}
    >
      {/* Search */}
      {subcategories.length > 6 && (
        <div className="relative mb-4">
          {icons?.search && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
              {icons.search}
            </div>
          )}
          <input
            type="text"
            placeholder="Search subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Horizontal Scroller */}
      <HorizontalScroller
        title={`Browse Subcategories (${subcategories.length})`}
        titleLevel="h2"
        headerActions={headerActions}
        showArrows
        itemWidth="160px"
        gap="1rem"
        loading={loading}
        emptyState={filteredSubcategories.length === 0 ? emptyState : undefined}
      >
        {filteredSubcategories.map((subcat) => {
          const card = (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-600 hover:border-primary h-full">
              {/* Image */}
              {subcat.image && ImageComponent && (
                <div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                  <ImageComponent
                    src={subcat.image}
                    alt={subcat.name}
                    fill={true}
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              )}

              {/* Name */}
              <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {subcat.name}
              </h3>

              {/* Product Count */}
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                {icons?.package && (
                  <div className="w-3 h-3">{icons.package}</div>
                )}
                <span>{subcat.productCount.toLocaleString()}</span>
              </div>
            </div>
          );

          return LinkComponent ? (
            <LinkComponent
              key={subcat.id}
              href={`/categories/${subcat.slug}`}
              className="group block h-full"
            >
              {card}
            </LinkComponent>
          ) : (
            <div key={subcat.id}>{card}</div>
          );
        })}
      </HorizontalScroller>
    </div>
  );
}
