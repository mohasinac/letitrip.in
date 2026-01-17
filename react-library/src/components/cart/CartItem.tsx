import type { ComponentType, ReactNode } from "react";
import { useState } from "react";

export interface CartItemData {
  id: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  shopId: string;
  shopName: string;
  variantId?: string | null;
  price: number;
  quantity: number;
  originalPrice?: number;
  stockCount?: number;
}

export interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  disabled?: boolean;
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
  }>;
  PriceComponent: ComponentType<{ amount: number }>;
  showToast?: (message: string, type: "success" | "error") => void;
  onOpenDeleteDialog?: () => void;
  icons?: {
    minus?: ReactNode;
    plus?: ReactNode;
    loader?: ReactNode;
    trash?: ReactNode;
  };
  className?: string;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
  LinkComponent,
  ImageComponent,
  PriceComponent,
  showToast,
  onOpenDeleteDialog,
  icons,
  className = "",
}: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99 || disabled) return;

    try {
      setUpdating(true);
      setQuantity(newQuantity);
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      // Revert on error
      setQuantity(item.quantity);
      if (showToast) {
        showToast("Failed to update quantity. Please try again.", "error");
      }
    } finally {
      setUpdating(false);
    }
  };

  const subtotal = item.price * quantity;
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((item.originalPrice! - item.price) / item.originalPrice!) * 100,
      )
    : 0;

  // Default icons (inline SVG)
  const MinusIcon =
    icons?.minus ||
    (() => (
      <svg
        className="h-4 w-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 12H4"
        />
      </svg>
    ));

  const PlusIcon =
    icons?.plus ||
    (() => (
      <svg
        className="h-4 w-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ));

  const LoaderIcon =
    icons?.loader ||
    (() => (
      <svg
        className="h-4 w-4 animate-spin text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ));

  const TrashIcon =
    icons?.trash ||
    (() => (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    ));

  return (
    <div
      className={`flex gap-4 py-4 border-b border-gray-200 bg-white ${className}`}
    >
      {/* Product Image */}
      <LinkComponent
        href={`/products/${item.productId}`}
        className="flex-shrink-0"
      >
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
          {item.productImage ? (
            <ImageComponent
              src={item.productImage}
              alt={item.productName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              No image
            </div>
          )}
        </div>
      </LinkComponent>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <LinkComponent
              href={`/products/${item.productId}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              <span>{item.productName}</span>
            </LinkComponent>

            <div className="mt-1 text-xs text-gray-600">
              <LinkComponent
                href={`/shops/${item.shopId}`}
                className="hover:text-blue-600"
              >
                <span>{item.shopName}</span>
              </LinkComponent>
            </div>

            {item.variantId && (
              <div className="mt-1 text-xs text-gray-600">
                Variant: {item.variantId}
              </div>
            )}

            {/* Out of stock warning */}
            {item.stockCount !== undefined && item.stockCount < quantity && (
              <div className="mt-1 text-xs text-red-600">
                Only {item.stockCount} left in stock
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold text-gray-900">
              <PriceComponent amount={item.price} />
            </div>
            {hasDiscount && (
              <>
                <div className="text-xs text-gray-500 line-through">
                  <PriceComponent amount={item.originalPrice!} />
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {discountPercent}% off
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="mt-3 flex items-center justify-between">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || disabled || updating}
              className="p-1 rounded border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {typeof MinusIcon === "function" ? <MinusIcon /> : MinusIcon}
            </button>

            <input
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                handleQuantityChange(val);
              }}
              disabled={disabled || updating}
              className="w-14 text-center text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 99 || disabled || updating}
              className="p-1 rounded border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {typeof PlusIcon === "function" ? <PlusIcon /> : PlusIcon}
            </button>

            {updating &&
              (typeof LoaderIcon === "function" ? (
                <div className="ml-2">
                  <LoaderIcon />
                </div>
              ) : (
                <div className="ml-2">{LoaderIcon}</div>
              ))}
          </div>

          {/* Subtotal & Remove */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-gray-900">
              <PriceComponent amount={subtotal} />
            </div>

            {onOpenDeleteDialog && (
              <button
                onClick={onOpenDeleteDialog}
                disabled={disabled}
                className="hidden sm:block p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Remove from cart"
                aria-label="Remove"
              >
                {typeof TrashIcon === "function" ? <TrashIcon /> : TrashIcon}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
