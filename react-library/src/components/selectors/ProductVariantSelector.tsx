/**
 * ProductVariantSelector Component
 *
 * Framework-agnostic product variant selector showing other sellers for the same product.
 * Displays product price, seller info, ratings, and stock status.
 *
 * @example
 * ```tsx
 * <ProductVariantSelector
 *   currentProductId="prod_123"
 *   categoryId="cat_456"
 *   products={products}
 *   onSelect={(productId) => navigate(`/products/${productId}`)}
 *   ImageComponent={OptimizedImage}
 * />
 * ```
 */

import React from "react";

export interface ProductVariant {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  shopName?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  condition?: "new" | "used" | "refurbished";
}

export interface ProductVariantSelectorProps {
  /** Current product ID to exclude */
  currentProductId: string;
  /** Category ID for filtering */
  categoryId: string;
  /** Available product variants */
  products: ProductVariant[];
  /** Loading state */
  loading?: boolean;
  /** Callback when variant is selected */
  onSelect?: (productId: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Maximum variants to display */
  limit?: number;
  /** Custom price formatter */
  formatPrice?: (amount: number) => string;
  /** Custom image component */
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    className?: string;
  }>;
  /** Custom star icon */
  StarIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom package icon */
  PackageIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom store icon */
  StoreIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom truck icon */
  TruckIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default price formatter
const defaultFormatPrice = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

// Default Image Component
const DefaultImageComponent: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} />
);

// Default Star Icon
const DefaultStarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Default Package Icon
const DefaultPackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16.5 9.4 7.55 4.24" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" x2="12" y1="22" y2="12" />
  </svg>
);

// Default Store Icon
const DefaultStoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
);

// Default Truck Icon
const DefaultTruckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

export function ProductVariantSelector({
  currentProductId,
  categoryId,
  products,
  loading = false,
  onSelect,
  className = "",
  limit = 5,
  formatPrice = defaultFormatPrice,
  ImageComponent = DefaultImageComponent,
  StarIcon = DefaultStarIcon,
  PackageIcon = DefaultPackageIcon,
  StoreIcon = DefaultStoreIcon,
  TruckIcon = DefaultTruckIcon,
}: ProductVariantSelectorProps) {
  // Filter out current product and apply limit
  const filteredProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, limit);

  // Find lowest price
  const lowestPrice =
    filteredProducts.length > 0
      ? Math.min(...filteredProducts.map((p) => p.price))
      : null;

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Other Sellers
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Other Sellers
        </h3>
        {filteredProducts.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "seller" : "sellers"}
          </span>
        )}
      </div>

      {/* Variants List */}
      <div className="space-y-3">
        {filteredProducts.map((variant) => {
          const isLowest = lowestPrice && variant.price === lowestPrice;
          const discount = variant.compareAtPrice
            ? Math.round(
                ((variant.compareAtPrice - variant.price) /
                  variant.compareAtPrice) *
                  100
              )
            : 0;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect?.(variant.id)}
              className="flex gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all group w-full text-left"
            >
              {/* Product Image */}
              <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                <ImageComponent
                  src={variant.images?.[0] || "/placeholder-product.png"}
                  alt={variant.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Price */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(variant.price)}
                  </span>
                  {variant.compareAtPrice &&
                    variant.compareAtPrice > variant.price && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        {formatPrice(variant.compareAtPrice)}
                      </span>
                    )}
                  {isLowest && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Lowest Price
                    </span>
                  )}
                </div>

                {/* Seller Name */}
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                  <StoreIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {variant.shopName || "Unknown Seller"}
                  </span>
                </div>

                {/* Rating & Stock Status */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {variant.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {variant.rating.toFixed(1)}
                      </span>
                      {variant.reviewCount > 0 && (
                        <span>({variant.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center gap-1">
                    <PackageIcon className="w-3 h-3" />
                    {variant.inStock ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Shipping Info */}
                {variant.inStock && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <TruckIcon className="w-3 h-3" />
                    <span>
                      {variant.condition === "new"
                        ? "Free shipping available"
                        : "Shipping calculated at checkout"}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Note */}
      {filteredProducts.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
          Showing sellers for the same product. Prices and availability may
          vary.
        </p>
      )}
    </div>
  );
}

export default ProductVariantSelector;
