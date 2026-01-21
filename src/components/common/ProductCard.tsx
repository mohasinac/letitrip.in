"use client";

import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import React from "react";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  featured?: boolean;
  condition?: string;
  shopName?: string;
  shopSlug?: string;
  variant?: "public" | "seller" | "admin";
  LinkComponent?: React.ComponentType<any>;
  ImageComponent?: React.ComponentType<any> | string;
  formatPrice?: (price: number) => string;
  formatDiscount?: (discount: number) => string;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  originalPrice,
  image,
  images,
  rating = 0,
  reviewCount = 0,
  inStock = true,
  featured = false,
  condition = "new",
  shopName,
  shopSlug,
  variant = "public",
  LinkComponent = Link,
  ImageComponent = "img",
  formatPrice = (price) => (price ? `₹${price.toLocaleString()}` : "₹0"),
  formatDiscount = (discount) => `-${discount}%`,
  className = "",
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductCardProps) {
  const productImage = image || images?.[0] || "/placeholder-product.svg";
  const productUrl = `/products/${slug}`;
  const shopUrl = shopSlug ? `/shops/${shopSlug}` : "#";

  // Calculate discount percentage
  const discountPercentage =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <StarOutlineIcon className="w-4 h-4 text-gray-300 absolute" />
            <StarIcon
              className="w-4 h-4 text-yellow-400 absolute"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </div>,
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="w-4 h-4 text-gray-300" />,
        );
      }
    }
    return stars;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group ${className}`}
    >
      <div className="relative">
        {/* Product Image */}
        <LinkComponent href={productUrl} className="block">
          {React.createElement(ImageComponent as any, {
            src: productImage,
            alt: name,
            className:
              "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300",
            onError: (e: any) => {
              e.target.src = "/placeholder-product.svg";
            },
          })}
        </LinkComponent>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {featured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium">
              Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
              {formatDiscount(discountPercentage)}
            </span>
          )}
          {!inStock && (
            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded font-medium">
              Out of Stock
            </span>
          )}
        </div>

        {/* Condition Badge */}
        {condition && condition !== "new" && (
          <div className="absolute top-2 right-2">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium capitalize">
              {condition}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Product Name */}
        <LinkComponent href={productUrl}>
          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {name}
          </h3>
        </LinkComponent>

        {/* Shop Name */}
        {shopName && (
          <LinkComponent href={shopUrl}>
            <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
              by {shopName}
            </p>
          </LinkComponent>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">{renderStars(rating)}</div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Actions for different variants */}
        {variant === "seller" && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onToggleStatus}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                inStock
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {inStock ? "Hide" : "Show"}
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {variant === "admin" && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              View
            </button>
            <button
              onClick={onToggleStatus}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                inStock
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {inStock ? "Ban" : "Approve"}
            </button>
          </div>
        )}

        {variant === "public" && inStock && (
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors">
            View Product
          </button>
        )}

        {variant === "public" && !inStock && (
          <button
            className="w-full bg-gray-400 text-white py-2 px-4 rounded font-medium cursor-not-allowed"
            disabled
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
