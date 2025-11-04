"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from '@/lib/contexts/WishlistContext";

interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    slug?: string;
  };
  className?: string;
  showLabel?: boolean;
}

export default function WishlistButton({
  product,
  className = "",
  showLabel = false,
}: WishlistButtonProps) {
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
      });
    }
  };

  if (showLabel) {
    return (
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          inWishlist
            ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400"
        } ${className}`}
        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
        <span className="text-sm font-medium">
          {inWishlist ? "In Wishlist" : "Add to Wishlist"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all ${
        inWishlist
          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
      } ${className}`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
    </button>
  );
}
