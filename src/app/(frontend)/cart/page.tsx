"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, moveToWishlist } =
    useCart();
  const { formatPrice } = useCurrency();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over ₹1000
  const total = subtotal + shipping;

  const handleMoveToWishlist = (itemId: string) => {
    moveToWishlist(itemId);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-24 h-24 relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <Image
                    src={item.image || "/assets/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link
                        href={`/products/${item.id}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 no-underline"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 p-2"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="p-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={item.quantity >= (item.stock || 10)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatPrice(item.price)} each
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleMoveToWishlist(item.id)}
                      className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Heart className="w-4 h-4" />
                      Move to Wishlist
                    </button>
                  </div>

                  {/* Stock Warning */}
                  {item.stock && item.stock < 5 && (
                    <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
                      Only {item.stock} left in stock
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart Button */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your cart?")) {
                clearCart();
                toast.success("Cart cleared");
              }
            }}
            className="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && subtotal < 1000 && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Add {formatPrice(1000 - subtotal)} more for FREE shipping!
                </p>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-3 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors no-underline"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="block w-full mt-3 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors no-underline"
            >
              Continue Shopping
            </Link>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Secure checkout</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
