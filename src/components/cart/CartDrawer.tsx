"use client";

import { X, ShoppingBag, Trash2, Heart } from "lucide-react";
import { useCart } from '@/lib/contexts/CartContext";
import { useCurrency } from '@/lib/contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    moveToWishlist,
    subtotal,
    itemCount,
  } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-background shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-text">
              Shopping Cart
              {itemCount > 0 && (
                <span className="ml-2 text-sm text-textSecondary">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-text" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-textSecondary mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-textSecondary mb-4">
                Add some items to get started!
              </p>
              <button
                onClick={() => {
                  onClose();
                  router.push("/products");
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-background rounded overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text truncate mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-textSecondary mb-2">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-background rounded hover:bg-border transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium text-text min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-background rounded hover:bg-border transition-colors"
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveToWishlist(item.id)}
                    className="p-1.5 hover:bg-background rounded transition-colors"
                    title="Move to wishlist"
                  >
                    <Heart className="w-4 h-4 text-textSecondary hover:text-error" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 hover:bg-background rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4 text-textSecondary hover:text-error" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-textSecondary">Subtotal:</span>
              <span className="text-lg font-semibold text-text">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Checkout
              </button>
              <button
                onClick={handleViewCart}
                className="w-full py-2 border border-border text-text rounded-lg hover:bg-secondary transition-colors"
              >
                View Cart
              </button>
            </div>

            <p className="text-xs text-textSecondary text-center">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
