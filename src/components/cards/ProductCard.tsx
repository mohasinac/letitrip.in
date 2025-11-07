"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import {
  formatCurrency,
  formatDiscount,
  formatCompactNumber,
} from "@/lib/formatters";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  shopName: string;
  shopSlug: string;
  inStock: boolean;
  isFeatured?: boolean;
  condition?: "new" | "used" | "refurbished";
  onAddToCart?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onQuickView?: (id: string) => void;
  isFavorite?: boolean;
  showShopName?: boolean;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  slug,
  price,
  originalPrice,
  image,
  rating = 0,
  reviewCount = 0,
  shopName,
  shopSlug,
  inStock,
  isFeatured = false,
  condition = "new",
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  isFavorite = false,
  showShopName = true,
  compact = false,
}) => {
  const discountPercentage = originalPrice
    ? formatDiscount(originalPrice, price)
    : "";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock && onAddToCart) {
      onAddToCart(id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(id);
    }
  };

  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFeatured && (
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

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onToggleFavorite && (
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors ${
                isFavorite ? "text-red-500" : "text-gray-600"
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          )}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Add to Cart Overlay */}
        {onAddToCart && inStock && (
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
      <div className={`p-${compact ? "3" : "4"}`}>
        {/* Product Name */}
        <h3
          className={`font-semibold text-gray-900 ${
            compact ? "text-sm line-clamp-1" : "text-base line-clamp-2"
          } mb-2 group-hover:text-blue-600 transition-colors`}
        >
          {name}
        </h3>

        {/* Shop Name */}
        {showShopName && (
          <Link
            href={`/shops/${shopSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors mb-2 block"
          >
            {shopName}
          </Link>
        )}

        {/* Rating */}
        {!compact && rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900 ml-1">
                {rating.toFixed(1)}
              </span>
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span
            className={`font-bold text-gray-900 ${
              compact ? "text-lg" : "text-xl"
            }`}
          >
            {formatCurrency(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
