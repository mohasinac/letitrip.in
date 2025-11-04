"use client";

import React from "react";
import { useWishlist } from '@/lib/contexts/WishlistContext";
import { useCart } from '@/lib/contexts/CartContext";
import { useCurrency } from '@/lib/contexts/CurrencyContext";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist, moveToCart } = useWishlist();
  const { formatPrice } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your wishlist is empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Save items you love for later by clicking the heart icon on
            products.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            <ShoppingCart className="w-5 h-5" />
            Browse Products
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
            My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} {items.length === 1 ? "item" : "items"} saved for
            later
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to clear your wishlist?")
              ) {
                clearWishlist();
              }
            }}
            className="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            Clear Wishlist
          </button>
          <Link
            href="/products"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <Link href={`/products/${item.productId}`}>
                <Image
                  src={item.image || "/assets/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Remove Button */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <Link
                href={`/products/${item.productId}`}
                className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 no-underline block mb-2"
              >
                {item.name}
              </Link>

              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                {formatPrice(item.price)}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => moveToCart(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>

              {/* Added Date */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Added {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors no-underline"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
