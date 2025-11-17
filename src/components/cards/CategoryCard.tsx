"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { FavoriteButton } from "@/components/common/FavoriteButton";

export interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productCount: number;
  featured?: boolean;
  parentCategory?: string;
  subcategoryCount?: number;
  variant?: "default" | "compact" | "large";
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  slug,
  image,
  description,
  productCount,
  featured = false,
  parentCategory,
  subcategoryCount = 0,
  variant = "default",
}) => {
  const sizeClasses = {
    compact: "aspect-square",
    default: "aspect-[4/3]",
    large: "aspect-[16/9]",
  };

  const textSizeClasses = {
    compact: "text-sm",
    default: "text-base",
    large: "text-lg",
  };

  return (
    <Link
      href={`/categories/${slug}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div
        className={`relative ${sizeClasses[variant]} overflow-hidden bg-gray-100`}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {featured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Product Count Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {productCount} {productCount === 1 ? "Product" : "Products"}
            </span>
            {subcategoryCount > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                {subcategoryCount}{" "}
                {subcategoryCount === 1 ? "Subcategory" : "Subcategories"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Parent Category */}
        {parentCategory && variant !== "compact" && (
          <p className="text-xs text-gray-500 mb-1">{parentCategory}</p>
        )}

        {/* Category Name */}
        <h3
          className={`font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors ${
            textSizeClasses[variant]
          } ${variant === "compact" ? "line-clamp-1" : "line-clamp-2"}`}
        >
          {name}
        </h3>

        {/* Description */}
        {description && variant === "large" && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {description}
          </p>
        )}

        {/* Stats */}
        {variant !== "compact" && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {productCount} {productCount === 1 ? "item" : "items"}
            </span>
            <span className="text-blue-600 font-medium group-hover:underline">
              Browse →
            </span>
          </div>
        )}
      </div>

      {/* Favorite Button */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton
          itemId={id}
          itemType="category"
          initialIsFavorite={false}
          size="md"
        />
      </div>
    </Link>
  );
};
