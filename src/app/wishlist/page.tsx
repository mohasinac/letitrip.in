"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UnifiedLayout from "@/components/layout/UnifiedLayout";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  addedAt: string;
  slug: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await fetch("/api/user/wishlist");
        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data);
        } else {
          // Fallback to empty array if API is not available
          setWishlistItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist items:", error);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, []);

  const handleRemoveItem = (itemId: string) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== itemId));
    setSelectedItems(selectedItems.filter((id) => id !== itemId));
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map((item) => item.id));
    }
  };

  const handleRemoveSelected = () => {
    if (
      confirm(
        `Are you sure you want to remove ${selectedItems.length} item${
          selectedItems.length > 1 ? "s" : ""
        } from your wishlist?`
      )
    ) {
      setWishlistItems(
        wishlistItems.filter((item) => !selectedItems.includes(item.id))
      );
      setSelectedItems([]);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (item.inStock) {
      addToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
      // Optionally remove from wishlist after adding to cart
      // handleRemoveItem(item.id);
    }
  };

  const handleMoveAllToCart = () => {
    const inStockItems = wishlistItems.filter(
      (item) => selectedItems.includes(item.id) && item.inStock
    );

    if (inStockItems.length === 0) {
      alert("No in-stock items selected.");
      return;
    }

    inStockItems.forEach((item) => {
      addToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
    });

    // Optionally remove added items from wishlist
    // setWishlistItems(wishlistItems.filter(item => !inStockItems.map(i => i.id).includes(item.id)));
    // setSelectedItems([]);
  };

  const getDiscountPercentage = (price: number, compareAtPrice: number) => {
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const inStockCount = wishlistItems.filter((item) => item.inStock).length;
  const outOfStockCount = wishlistItems.filter((item) => !item.inStock).length;

  if (loading) {
    return (
      <ProtectedRoute>
        <UnifiedLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </UnifiedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <UnifiedLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Wishlist
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {wishlistItems.length} item
                    {wishlistItems.length !== 1 ? "s" : ""} saved for later
                  </p>
                </div>
                <Link href="/products" className="btn btn-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {wishlistItems.length > 0 ? (
              <>
                {/* Stats and Actions Bar */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {inStockCount}
                        </p>
                        <p className="text-sm text-gray-600">In Stock</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {outOfStockCount}
                        </p>
                        <p className="text-sm text-gray-600">Out of Stock</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          $
                          {wishlistItems
                            .reduce((sum, item) => sum + item.price, 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Total Value</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleSelectAll}
                        className="btn btn-outline btn-sm"
                      >
                        {selectedItems.length === wishlistItems.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                      {selectedItems.length > 0 && (
                        <>
                          <button
                            onClick={handleMoveAllToCart}
                            className="btn btn-primary btn-sm"
                          >
                            Add Selected to Cart ({selectedItems.length})
                          </button>
                          <button
                            onClick={handleRemoveSelected}
                            className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Remove Selected
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Wishlist Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 ${
                        selectedItems.includes(item.id)
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-4 left-4 z-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-4 right-4 z-10 p-1 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50"
                        title="Remove from wishlist"
                      >
                        <svg
                          className="h-4 w-4 text-gray-400 hover:text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>

                      {/* Product Image */}
                      <div className="aspect-square bg-gray-200 flex items-center justify-center relative">
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        <svg
                          className="h-20 w-20 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {item.category}
                          </p>
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-medium text-gray-900 hover:text-primary line-clamp-2"
                          >
                            {item.name}
                          </Link>
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-lg font-bold text-gray-900">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.compareAtPrice && (
                            <>
                              <span className="text-sm text-gray-500 line-through">
                                ${item.compareAtPrice.toFixed(2)}
                              </span>
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                {getDiscountPercentage(
                                  item.price,
                                  item.compareAtPrice
                                )}
                                % off
                              </span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mb-4">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </p>

                        {/* Actions */}
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.inStock}
                            className={`w-full btn ${
                              item.inStock
                                ? "btn-primary"
                                : "btn-outline opacity-50 cursor-not-allowed"
                            } btn-sm`}
                          >
                            {item.inStock ? "Add to Cart" : "Out of Stock"}
                          </button>
                          <Link
                            href={`/products/${item.slug}`}
                            className="w-full btn btn-outline btn-sm block text-center"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Share Wishlist */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Share Your Wishlist
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Let friends and family know what you're interested in
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                      <button className="btn btn-outline btn-sm">
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.77 7.46H14.5v-1.9c0-.9-.02-1.74-.02-1.74C14.48 1.96 13.5 1 12.5 1c-1 0-1.98.96-1.98 2.82 0 0-.02.84-.02 1.74v1.9H6.23c-.77 0-1.4.63-1.4 1.4v11.93c0 .77.63 1.4 1.4 1.4h12.54c.77 0 1.4-.63 1.4-1.4V8.86c0-.77-.63-1.4-1.4-1.4z" />
                        </svg>
                        Copy Link
                      </button>
                      <button className="btn btn-outline btn-sm">
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Share on Facebook
                      </button>
                      <button className="btn btn-outline btn-sm">
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Share on Twitter
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Your wishlist is empty
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Save items you love to buy them later. Just click the heart
                  icon on any product.
                </p>
                <div className="mt-6">
                  <Link href="/products" className="btn btn-primary">
                    Start Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </UnifiedLayout>
    </ProtectedRoute>
  );
}
