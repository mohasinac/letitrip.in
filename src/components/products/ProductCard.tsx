"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  isFeatured?: boolean;
  views?: number;
  wishlisted?: number;
  onQuickView?: (product: any) => void;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  isFeatured,
  views,
  wishlisted,
  onQuickView,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    // TODO: Add to wishlist API call
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Add to cart API call
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) {
      onQuickView({ id, name, slug, price, compareAtPrice, image });
    }
  };

  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageError ? (
          <Image
            src={image || "/images/placeholder-product.jpg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isFeatured && (
            <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded">
              Featured
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Add to wishlist"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleQuickView}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Quick view"
          >
            <EyeIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{compareAtPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Stats */}
        {(views || wishlisted) && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {views && <span>{views} views</span>}
            {wishlisted && <span>{wishlisted} wishlisted</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
