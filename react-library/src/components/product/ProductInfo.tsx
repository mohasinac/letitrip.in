import {
  Check,
  Heart,
  Minus,
  Plus,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { ReactNode, useState } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  actualPrice?: number;
  originalPrice?: number;
  salePrice: number;
  stock: number;
  rating?: number;
  reviewCount?: number;
  shop_id: string;
  shop_name: string;
  returnable?: boolean;
  condition?: "new" | "refurbished" | "used";
  status: string;
  image?: string;
}

export interface ProductInfoProps {
  product: Product;
  quantity?: number;
  isFavorite?: boolean;
  // Callback injections
  onAddToCart?: (quantity: number) => Promise<void>;
  onBuyNow?: (quantity: number) => Promise<void>;
  onToggleFavorite?: () => Promise<void>;
  onShare?: () => Promise<void>;
  onShopClick?: (shopId: string) => void;
  // Notification callbacks
  onCartSuccess?: (message: string) => void;
  onCartError?: (message: string) => void;
  onShareSuccess?: (message: string) => void;
  // Injected components
  PriceComponent?: React.ComponentType<{ amount: number }>;
  FormLabelComponent?: React.ComponentType<{ htmlFor?: string; children: ReactNode }>;
  className?: string;
}

/**
 * ProductInfo Component
 *
 * Pure React component for displaying product information and purchase controls.
 * Framework-independent implementation with callback injection pattern.
 *
 * Features:
 * - Product title and rating display
 * - Price with discount calculation
 * - Stock status indicator
 * - Quantity selector
 * - Add to cart and buy now buttons
 * - Favorite and share functionality
 * - Seller information
 * - Feature highlights (shipping, returns, authenticity)
 *
 * @example
 * ```tsx
 * <ProductInfo
 *   product={product}
 *   onAddToCart={handleAddToCart}
 *   onBuyNow={handleBuyNow}
 *   PriceComponent={Price}
 *   FormLabelComponent={FormLabel}
 *   onCartSuccess={(msg) => toast.success(msg)}
 * />
 * ```
 */
export function ProductInfo({
  product,
  quantity: initialQuantity = 1,
  isFavorite: initialIsFavorite = false,
  onAddToCart,
  onBuyNow,
  onToggleFavorite,
  onShare,
  onShopClick,
  onCartSuccess,
  onCartError,
  onShareSuccess,
  PriceComponent,
  FormLabelComponent,
  className = "",
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [cartLoading, setCartLoading] = useState(false);

  // Default Price component (fallback if not injected)
  const Price = PriceComponent || (({ amount }: { amount: number }) => (
    <span>₹{amount.toLocaleString("en-IN")}</span>
  ));

  // Default FormLabel component (fallback if not injected)
  const FormLabel = FormLabelComponent || (({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {children}
    </label>
  ));

  const discountPercent =
    product.originalPrice && product.originalPrice > product.salePrice
      ? Math.round(
          ((product.originalPrice - product.salePrice) /
            product.originalPrice) *
            100
        )
      : 0;

  const inStock = product.stock > 0 && product.status === "active";

  const handleAddToCart = async () => {
    if (!inStock || !onAddToCart) return;

    try {
      setCartLoading(true);
      await onAddToCart(quantity);
      onCartSuccess?.("Added to cart!");
    } catch (error: any) {
      onCartError?.(error.message || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!onBuyNow) return;

    try {
      setCartLoading(true);
      await onBuyNow(quantity);
    } catch (error: any) {
      onCartError?.(error.message || "Failed to proceed to checkout");
    } finally {
      setCartLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite) return;

    try {
      await onToggleFavorite();
      setIsFavorite(!isFavorite);
    } catch (error: any) {
      // Error handling done by parent
    }
  };

  const handleShare = async () => {
    if (!onShare) return;

    try {
      await onShare();
      onShareSuccess?.("Link copied to clipboard!");
    } catch (error: any) {
      // Error handling done by parent
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title & Rating */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {product.name}
        </h1>
        <div className="flex items-center gap-4 text-sm">
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating!)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-gray-500 dark:text-gray-400">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}
          {product.condition && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium uppercase">
              {product.condition}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-primary">
            <Price amount={product.salePrice} />
          </span>
          {product.originalPrice &&
            product.originalPrice > product.salePrice && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  <Price amount={product.originalPrice} />
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm font-semibold">
                  {discountPercent}% OFF
                </span>
              </>
            )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Inclusive of all taxes
        </p>
      </div>

      {/* Stock Status */}
      <div>
        {inStock ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-medium">
              In Stock ({product.stock} available)
            </span>
          </div>
        ) : (
          <div className="text-red-600 dark:text-red-400 font-medium">
            Out of Stock
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      {inStock && (
        <div>
          <FormLabel htmlFor="product-quantity">Quantity</FormLabel>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              id="product-quantity"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(
                    Math.max(1, parseInt(e.target.value) || 1),
                    product.stock
                  )
                )
              }
              className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded-lg py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || cartLoading || !onAddToCart}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!inStock || cartLoading || !onBuyNow}
            className="flex-1 btn-primary px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
        </div>

        <div className="flex gap-3">
          {onToggleFavorite && (
            <button
              onClick={handleToggleFavorite}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
              {isFavorite ? "Saved" : "Add to Favorites"}
            </button>
          )}
          {onShare && (
            <button
              onClick={handleShare}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              aria-label="Share product"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Seller Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <Store className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Sold by</span>
          {onShopClick ? (
            <button
              onClick={() => onShopClick(product.shop_id)}
              className="text-primary hover:underline font-medium"
            >
              {product.shop_name}
            </button>
          ) : (
            <span className="font-medium text-gray-900 dark:text-white">
              {product.shop_name}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Free shipping on orders above ₹5,000</span>
          </div>
          {product.returnable && (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>7-day return policy</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>100% authentic products</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
