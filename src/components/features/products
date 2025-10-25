"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images?: { url: string; alt?: string }[];
  slug: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({
  product,
  className = "",
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const discountPercentage = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0;

  const imageUrl =
    product.images?.[0]?.url || "/images/placeholder-product.jpg";

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={imageError ? "/images/placeholder-product.jpg" : imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
              -{discountPercentage}%
            </div>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {product.category && (
            <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.floor(product.rating!)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
