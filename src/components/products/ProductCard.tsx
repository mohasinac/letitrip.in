"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  slug: string;
  isFeatured?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  compareAtPrice,
  image,
  slug,
  isFeatured,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

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

  return (
    <Link href={`/products/${slug}`} className="group">
      <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image || "/placeholder-product.jpg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {isFeatured && (
            <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
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
            className="w-full btn btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}
