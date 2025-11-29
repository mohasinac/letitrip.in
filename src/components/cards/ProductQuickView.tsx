"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Package,
  Truck,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export interface ProductQuickViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: string[];
    description: string;
    rating?: number;
    reviewCount?: number;
    inStock: boolean;
    stockCount?: number;
    condition?: "new" | "used" | "refurbished";
    shopName: string;
    shopSlug: string;
    specifications?: { label: string; value: string }[];
  };
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (id: string, quantity: number) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = () => {
    if (product.inStock && onAddToCart) {
      onAddToCart(product.id, quantity);
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `/products/${product.slug}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          aria-label="Close quick view"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform duration-300 ${
                    isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />

                {/* Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-600 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-600 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </>
                )}

                {/* Zoom Icon */}
                <div className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-md">
                  <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/70 text-white text-xs rounded-full">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Grid */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Shop Link */}
              <Link
                href={`/shops/${product.shopSlug}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={onClose}
              >
                {product.shopName}
              </Link>

              {/* Product Name */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h2>

                {/* Rating */}
                {product.rating && product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium dark:text-white">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    {product.reviewCount && product.reviewCount > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({product.reviewCount}{" "}
                        {product.reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
              </div>

              {/* Condition & Stock */}
              <div className="flex items-center gap-4 text-sm">
                {product.condition && product.condition !== "new" && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium capitalize">
                    {product.condition}
                  </span>
                )}
                <span
                  className={`font-medium ${
                    product.inStock
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {product.inStock
                    ? product.stockCount
                      ? `In Stock (${product.stockCount} available)`
                      : "In Stock"
                    : "Out of Stock"}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Specifications
                  </h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {product.specifications.slice(0, 4).map((spec, index) => (
                      <div key={index}>
                        <dt className="text-gray-500 dark:text-gray-400">
                          {spec.label}
                        </dt>
                        <dd className="text-gray-900 dark:text-white font-medium">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Trust Badges */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>7-Day Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Secure Payment</span>
                </div>
              </div>

              {/* Quantity & Actions */}
              {product.inStock && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-medium dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                      disabled={
                        product.stockCount
                          ? quantity >= product.stockCount
                          : false
                      }
                    >
                      +
                    </button>
                  </div>

                  {onAddToCart && (
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  )}

                  {onToggleFavorite && (
                    <button
                      onClick={handleToggleFavorite}
                      className={`p-3 border rounded-md transition-colors ${
                        isFavorite
                          ? "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-500"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    aria-label="Share product"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* View Full Details Link */}
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="block text-center py-3 border-2 border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
