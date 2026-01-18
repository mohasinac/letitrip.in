/**
 * ProductCard - Pure React Component
 *
 * A comprehensive product card component with media carousel, pricing, ratings,
 * and various action buttons. Supports multiple variants for different contexts.
 *
 * Features:
 * - Image/video carousel on hover
 * - Multiple variants (public, admin, seller, compact)
 * - Favorite and compare functionality
 * - Add to cart overlay
 * - Admin/seller management actions
 *
 * @packageDocumentation
 */

import { Edit, Eye, ShoppingCart, Star } from "lucide-react";
import React, {
  ComponentType,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ProductStatus } from "../../types/common";

export type ProductCardVariant = "public" | "admin" | "seller" | "compact";

export interface ProductCardProps {
  // Core product data
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Additional images for carousel
  videos?: string[]; // Video URLs
  rating?: number;
  reviewCount?: number;
  shopName?: string;
  shopSlug?: string;
  shopId?: string;
  inStock: boolean;
  featured?: boolean;
  condition?: "new" | "used" | "refurbished";

  // Admin/Seller specific
  status?: ProductStatus;
  sku?: string;
  stockCount?: number;
  salesCount?: number;

  // Variant control
  variant?: ProductCardVariant;
  /** @deprecated Use variant="compact" instead */
  compact?: boolean;

  // Display options
  showShopName?: boolean;
  className?: string;

  // State
  isFavorite?: boolean;
  isSelected?: boolean;

  // Action handlers (callbacks)
  onAddToCart?: (
    id: string,
    productDetails?: {
      name: string;
      price: number;
      image: string;
      shopId: string;
      shopName: string;
    },
  ) => void;
  onToggleFavorite?: (id: string) => void;
  onQuickView?: (id: string) => void;
  onEdit?: (slug: string) => void;
  onDelete?: (slug: string) => void;
  onSelect?: (id: string, selected: boolean) => void;

  // Injected dependencies
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: (e: MouseEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    role?: string;
    tabIndex?: number;
    target?: string;
    children: ReactNode;
  }>;
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    quality?: number;
    objectFit?: "cover" | "contain";
    className?: string;
    sizes?: string;
  }>;
  FavoriteButtonComponent?: ComponentType<{
    itemId: string;
    itemType: string;
    initialIsFavorite?: boolean;
    onToggle?: () => void;
    size?: "sm" | "md" | "lg";
  }>;
  CompareButtonComponent?: ComponentType<{
    product: any;
    size?: "sm" | "md" | "lg";
  }>;
  StatusBadgeComponent?: ComponentType<{
    status: ProductStatus;
  }>;
  formatPrice: (price: number) => string;
  formatDiscount: (originalPrice: number, currentPrice: number) => string;
  onShopClick?: (shopSlug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  slug,
  price,
  originalPrice,
  image,
  images = [],
  videos = [],
  rating = 0,
  reviewCount = 0,
  shopName = "",
  shopSlug = "",
  shopId,
  inStock,
  featured = false,
  condition = "new",
  status,
  sku,
  stockCount,
  salesCount,
  variant = "public",
  compact = false,
  showShopName = true,
  className = "",
  isFavorite = false,
  isSelected = false,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  onEdit,
  onDelete,
  onSelect,
  LinkComponent,
  ImageComponent,
  FavoriteButtonComponent,
  CompareButtonComponent,
  StatusBadgeComponent,
  formatPrice,
  formatDiscount,
  onShopClick,
}) => {
  // Use compact variant if compact prop is true (backwards compatibility)
  const effectiveVariant = compact ? "compact" : variant;
  const isAdminOrSeller =
    effectiveVariant === "admin" || effectiveVariant === "seller";
  const isCompact = effectiveVariant === "compact";

  const [isHovered, setIsHovered] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const discountPercentage = originalPrice
    ? formatDiscount(originalPrice, price)
    : "";

  // Check if videos are available
  const hasVideos = videos && videos.length > 0;

  // Get all images (use images array if provided, otherwise use single image)
  const allImages = useMemo(() => {
    return images.length > 0 ? images : [image];
  }, [image, images]);

  // Auto-rotate on hover: video takes priority, otherwise rotate images
  useEffect(() => {
    if (isHovered) {
      if (hasVideos) {
        // Play video immediately on hover
        setIsPlayingVideo(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {
            // Video autoplay failed, fall back to image rotation
            setIsPlayingVideo(false);
            startImageRotation();
          });
        }
      } else if (allImages.length > 1) {
        // No video, rotate images with 1 second interval
        startImageRotation();
      }
    } else {
      // Reset when not hovering
      setIsPlayingVideo(false);
      setCurrentMediaIndex(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    function startImageRotation() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % allImages.length);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, hasVideos, allImages.length]);

  const currentImage = allImages[currentMediaIndex] || allImages[0] || image;

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock && onAddToCart) {
      onAddToCart(id, {
        name,
        price,
        image,
        shopId: shopId || shopSlug,
        shopName,
      });
    }
  };

  const handleToggleFavorite = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  const handleQuickView = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(id);
    }
  };

  const handleEdit = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(slug);
    }
  };

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(slug);
    }
  };

  const handleSelect = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(id, !isSelected);
    }
  };

  const handleShopClick = (e: MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShopClick && shopSlug) {
      onShopClick(shopSlug);
    }
  };

  // Determine link destination based on variant
  const linkHref = isAdminOrSeller
    ? `/products/${slug}` // View product for admin
    : `/products/${slug}`;

  return (
    <LinkComponent
      href={linkHref}
      className={`group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-200 ${
        isSelected ? "ring-2 ring-purple-500" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Video Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        {/* Video layer - shown when playing video */}
        {hasVideos && (
          <video
            ref={videoRef}
            src={videos[0]}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
              isPlayingVideo ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            muted
            loop
            playsInline
          />
        )}

        {/* Image layer */}
        <ImageComponent
          src={currentImage}
          alt={name}
          fill
          quality={85}
          objectFit="cover"
          className={`transition-all duration-300 ${
            isHovered && !isPlayingVideo ? "scale-105" : ""
          } ${isPlayingVideo ? "opacity-0" : "opacity-100"}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Media Indicators - show image dots when rotating images */}
        {allImages.length > 1 && isHovered && !isPlayingVideo && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
            {allImages.map((imageUrl, index) => (
              <div
                key={`dot-${imageUrl}-${index}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentMediaIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {featured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {!inStock && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
          {condition !== "new" && (
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded capitalize">
              {condition}
            </span>
          )}
          {discountPercentage && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
              {discountPercentage} OFF
            </span>
          )}
        </div>

        {/* Media Count Badge */}
        {(allImages.length > 1 || hasVideos) && (
          <div className="absolute bottom-2 right-2 flex gap-1 z-20">
            {allImages.length > 1 && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                {allImages.length}
              </span>
            )}
            {hasVideos && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                {videos.length}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons - Public variant */}
        {!isAdminOrSeller && FavoriteButtonComponent && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FavoriteButtonComponent
              itemId={id}
              itemType="product"
              initialIsFavorite={isFavorite}
              onToggle={() => onToggleFavorite?.(id)}
              size="md"
            />
            {CompareButtonComponent && (
              <CompareButtonComponent
                product={{
                  id,
                  name,
                  slug,
                  price,
                  originalPrice,
                  image,
                  rating,
                  reviewCount,
                  shopName,
                  shopSlug,
                  inStock,
                  condition,
                }}
                size="md"
              />
            )}
            {onQuickView && (
              <button
                onClick={handleQuickView}
                className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Quick view"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Admin/Seller Status Badge */}
        {isAdminOrSeller && status && StatusBadgeComponent && (
          <div className="absolute top-2 right-2">
            <StatusBadgeComponent status={status} />
          </div>
        )}

        {/* Add to Cart Overlay - Public only */}
        {!isAdminOrSeller && onAddToCart && inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-${isCompact ? "3" : "4"}`}>
        {/* Product Name */}
        <h3
          className={`font-semibold text-gray-900 dark:text-white ${
            isCompact ? "text-sm line-clamp-1" : "text-base line-clamp-2"
          } mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
        >
          {name}
        </h3>

        {/* SKU - Admin/Seller only */}
        {isAdminOrSeller && sku && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
            SKU: {sku}
          </p>
        )}

        {/* Shop Name - Public only */}
        {!isAdminOrSeller && showShopName && shopSlug && (
          <span
            onClick={handleShopClick}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleShopClick(e);
              }
            }}
            role="link"
            tabIndex={0}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 block cursor-pointer"
          >
            {shopName}
          </span>
        )}

        {/* Price & Stock Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-bold text-gray-900 dark:text-white ${
                isCompact ? "text-lg" : "text-xl"
              }`}
            >
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          {/* Stock count - Admin/Seller */}
          {isAdminOrSeller && stockCount !== undefined && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Stock: {stockCount}
            </span>
          )}
        </div>

        {/* Rating - Public only */}
        {!isAdminOrSeller && !isCompact && rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
                {rating.toFixed(1)}
              </span>
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Stats - Admin/Seller */}
        {isAdminOrSeller && (rating > 0 || salesCount !== undefined) && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            {rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
              </span>
            )}
            {salesCount !== undefined && (
              <>
                <span>•</span>
                <span>{salesCount} sales</span>
              </>
            )}
          </div>
        )}

        {/* Admin/Seller Action Buttons */}
        {isAdminOrSeller && (onEdit || onDelete) && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <LinkComponent
              href={`/products/${slug}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-purple-700 flex items-center justify-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View
            </LinkComponent>
          </div>
        )}
      </div>
    </LinkComponent>
  );
};

// Memoized export for performance optimization
export default React.memo(ProductCard);
