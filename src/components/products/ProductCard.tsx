"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import {
  EyeIcon,
  HeartIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  slug: string;
  isFeatured?: boolean;
  onQuickView?: (product: ProductCardProps) => void;
}

export default function ProductCard({
  id,
  name,
  price,
  compareAtPrice,
  image,
  slug,
  isFeatured,
  onQuickView,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    setIsAdding(true);
    try {
      await addToCart({
        productId: id,
        quantity: 1,
        price: price,
        name: name,
        image: image,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) {
      onQuickView({
        id,
        name,
        price,
        compareAtPrice,
        image,
        slug,
        isFeatured,
      });
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${slug}`}>
        <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.02]">
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={image || "/placeholder-product.jpg"}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {discount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                -{discount}%
              </span>
            )}
            {isFeatured && (
              <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                ⭐ Featured
              </span>
            )}

            {/* Hover Actions */}
            <div
              className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
                {onQuickView && (
                  <button
                    onClick={handleQuickView}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    title="Quick View"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                  title="Add to Wishlist"
                >
                  <HeartIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full btn btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
