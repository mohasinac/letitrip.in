import { ReactNode, useState } from "react";
import { cn } from "../../utils/cn";

export interface SearchResultItem {
  id: string;
  [key: string]: any;
}

export type SearchResultTab = "all" | "products" | "shops" | "categories";

export interface SearchResultsProps<
  T extends SearchResultItem = SearchResultItem,
> {
  products?: T[];
  shops?: T[];
  categories?: T[];
  total: number;
  loading?: boolean;
  query: string;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onProductClick?: (product: T) => void;
  onShopClick?: (shop: T) => void;
  onCategoryClick?: (category: T) => void;

  // Tabbed interface
  enableTabs?: boolean;
  defaultTab?: SearchResultTab;
  onTabChange?: (tab: SearchResultTab) => void;

  // Injection props
  renderProduct?: (product: T) => ReactNode;
  renderShop?: (shop: T) => ReactNode;
  renderCategory?: (category: T) => ReactNode;
  emptyState?: ReactNode;
  loadingIcon?: ReactNode;
  className?: string;
}

/**
 * SearchResults Component (Library Version)
 *
 * Framework-agnostic search results display with pagination, tabbed interface, and empty states.
 * Supports products, shops, and categories via render props.
 *
 * Features:
 * - Multiple result types (products, shops, categories)
 * - Tabbed interface to filter by result type
 * - Loading state
 * - Empty state
 * - Pagination
 * - Results summary
 * - Flexible rendering via injection
 * - Dark mode support
 *
 * @example
 * ```tsx
 * // Without tabs (default stacked layout)
 * <SearchResults
 *   products={products}
 *   shops={shops}
 *   categories={categories}
 *   total={total}
 *   query={query}
 *   loading={loading}
 *   currentPage={page}
 *   pageSize={20}
 *   onPageChange={setPage}
 *   renderProduct={(product) => <ProductCard {...product} />}
 *   renderShop={(shop) => <ShopCard {...shop} />}
 *   renderCategory={(category) => <CategoryCard {...category} />}
 * />
 *
 * // With tabbed interface
 * <SearchResults
 *   products={products}
 *   shops={shops}
 *   categories={categories}
 *   total={total}
 *   query={query}
 *   enableTabs={true}
 *   defaultTab="all"
 *   onTabChange={(tab) => console.log('Tab changed:', tab)}
 *   renderProduct={(product) => <ProductCard {...product} />}
 *   renderShop={(shop) => <ShopCard {...shop} />}
 *   renderCategory={(category) => <CategoryCard {...category} />}
 * />
 * ```
 */
export function SearchResults<T extends SearchResultItem = SearchResultItem>({
  products = [],
  shops = [],
  categories = [],
  total,
  loading = false,
  query,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onProductClick,
  onShopClick,
  onCategoryClick,
  enableTabs = false,
  defaultTab = "all",
  onTabChange,
  renderProduct,
  renderShop,
  renderCategory,
  emptyState,
  loadingIcon,
  className,
}: SearchResultsProps<T>) {
  const [activeTab, setActiveTab] = useState<SearchResultTab>(defaultTab);

  const totalPages = Math.ceil(total / pageSize);
  const hasProducts = products.length > 0;
  const hasShops = shops.length > 0;
  const hasCategories = categories.length > 0;
  const hasResults = hasProducts || hasShops || hasCategories;

  const handleTabChange = (tab: SearchResultTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Determine what to show based on active tab
  const showProducts = activeTab === "all" || activeTab === "products";
  const showShops = activeTab === "all" || activeTab === "shops";
  const showCategories = activeTab === "all" || activeTab === "categories";

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          {loadingIcon && <div className="mx-auto mb-2">{loadingIcon}</div>}
          <p className="text-gray-600">Searching for &quot;{query}&quot;...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!hasResults) {
    return (
      <div className={className}>
        {emptyState || (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              We couldn&apos;t find anything matching &quot;{query}&quot;. Try
              different keywords or check the spelling.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Found {total} {total === 1 ? "result" : "results"} for &quot;{query}
            &quot;
          </p>
        </div>
      </div>

      {/* Tabs */}
      {enableTabs && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8" aria-label="Search result tabs">
            <button
              onClick={() => handleTabChange("all")}
              className={cn(
                "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "all"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
              )}
            >
              All ({total})
            </button>
            {hasProducts && (
              <button
                onClick={() => handleTabChange("products")}
                className={cn(
                  "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === "products"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
                )}
              >
                Products ({products.length})
              </button>
            )}
            {hasShops && (
              <button
                onClick={() => handleTabChange("shops")}
                className={cn(
                  "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === "shops"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
                )}
              >
                Shops ({shops.length})
              </button>
            )}
            {hasCategories && (
              <button
                onClick={() => handleTabChange("categories")}
                className={cn(
                  "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
                )}
              >
                Categories ({categories.length})
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Categories */}
      {showCategories && hasCategories && renderCategory && (
        <section>
          {!enableTabs && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Categories ({categories.length})
            </h3>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => onCategoryClick?.(category)}
                className="cursor-pointer"
              >
                {renderCategory(category)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shops */}
      {showShops && hasShops && renderShop && (
        <section>
          {!enableTabs && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Shops ({shops.length})
            </h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => onShopClick?.(shop)}
                className="cursor-pointer"
              >
                {renderShop(shop)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      {showProducts && hasProducts && renderProduct && (
        <section>
          {!enableTabs && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Products ({products.length})
            </h3>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick?.(product)}
                className="cursor-pointer"
              >
                {renderProduct(product)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "w-10 h-10 rounded-lg border transition-colors",
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Results per page info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Showing {(currentPage - 1) * pageSize + 1}-
        {Math.min(currentPage * pageSize, total)} of {total} results
      </div>
    </div>
  );
}
