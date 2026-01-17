"use client";

import React from "react";
import Link from "next/link";
import { X, GitCompare, Trash2 } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { OptimizedImage } from "@letitrip/react-library"

export function ComparisonBar() {
  const { products, removeFromComparison, clearComparison, canCompare, count } =
    useComparison();

  // Don't render if no products
  if (count === 0) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg animate-slide-up">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Product thumbnails */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Compare ({count})
            </span>

            <div className="flex items-center gap-2">
              {products.map((product) => (
                <div key={product.id} className="relative group flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${product.name} from comparison`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clearComparison}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              aria-label="Clear all"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <Link
              href="/compare"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${
                  canCompare
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none"
                }
              `}
              aria-disabled={!canCompare}
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare Now</span>
              <span className="sm:hidden">Compare</span>
            </Link>
          </div>
        </div>

        {!canCompare && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Add at least 2 products to compare
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
