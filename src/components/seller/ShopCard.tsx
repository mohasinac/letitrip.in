"use client";

import Link from "next/link";
import {
  Store,
  Package,
  Star,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  BarChart3,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo: string | null;
    isVerified: boolean;
    featured: boolean;
    isBanned: boolean;
    productCount?: number;
    rating?: number;
    reviewCount?: number;
  };
  showActions?: boolean;
  variant?: "default" | "compact";
}

export default function ShopCard({
  shop,
  showActions = true,
  variant = "default",
}: ShopCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (variant === "compact") {
    return (
      <Link
        href={`/seller/my-shops/${shop.slug}`}
        className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {shop.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                @{shop.slug}
              </span>
              {shop.isVerified && (
                <CheckCircle className="w-3 h-3 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Shop Logo/Banner */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
        {shop.logo && (
          <img
            src={shop.logo}
            alt={shop.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20" />

        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {shop.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
          {shop.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shadow-sm">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}
          {shop.isBanned && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 shadow-sm">
              <XCircle className="w-3 h-3" />
              Banned
            </span>
          )}
        </div>
      </div>

      {/* Shop Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
              {shop.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              @{shop.slug}
            </p>
          </div>

          {showActions && (
            <div className="relative ml-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                    onKeyDown={(e) => e.key === "Escape" && setShowMenu(false)}
                    role="button"
                    tabIndex={-1}
                    aria-label="Close menu"
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <Link
                      href={`/seller/my-shops/${shop.slug}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      View Dashboard
                    </Link>
                    <Link
                      href={`/seller/my-shops/${shop.slug}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Shop
                    </Link>
                    <Link
                      href={`/seller/my-shops/${shop.slug}/analytics`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {shop.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {shop.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>{shop.productCount || 0} products</span>
          </div>
          {shop.rating !== undefined && shop.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>
                {shop.rating.toFixed(1)}{" "}
                {shop.reviewCount && `(${shop.reviewCount})`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            <Link
              href={`/seller/my-shops/${shop.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
            <Link
              href={`/seller/my-shops/${shop.slug}/edit`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
