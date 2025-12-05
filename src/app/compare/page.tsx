"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { COMPARISON_FIELDS } from "@/constants/comparison";
import { useComparison } from "@/contexts/ComparisonContext";
import { formatPrice } from "@/lib/price.utils";
import type { ComparisonProduct } from "@/services/comparison.service";
import { ArrowLeft, GitCompare, Heart, ShoppingCart, X } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const { products, removeFromComparison, clearComparison } = useComparison();

  if (products.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <GitCompare className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Products to Compare
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add products to compare their features side by side
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const getValue = (
    product: ComparisonProduct,
    key: string
  ): string | number | boolean | null => {
    const value = product[key as keyof ComparisonProduct];
    if (value === undefined || value === null) return null;
    return value as string | number | boolean;
  };

  const renderValue = (
    value: string | number | boolean | null,
    type: string
  ) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }

    switch (type) {
      case "price":
        return (
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPrice(value as number)}
          </span>
        );
      case "rating":
        return (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{(value as number).toFixed(1)}</span>
          </div>
        );
      case "boolean":
        return value ? (
          <span className="text-green-600 dark:text-green-400">✓ Yes</span>
        ) : (
          <span className="text-red-600 dark:text-red-400">✗ No</span>
        );
      case "badge":
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
            {String(value)}
          </span>
        );
      default:
        return <span>{String(value)}</span>;
    }
  };

  // Find best values for highlighting
  const getBestValue = (key: string, type: string): string | number | null => {
    const values = products
      .map((p) => getValue(p, key))
      .filter((v) => v !== null);
    if (values.length === 0) return null;

    if (type === "price") {
      // Lowest price is best
      return Math.min(...(values as number[]));
    }
    if (type === "rating") {
      // Highest rating is best
      return Math.max(...(values as number[]));
    }
    return null;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compare Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comparing {products.length} products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearComparison}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear All
          </button>
          <Link
            href="/products"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Add More
          </Link>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          {/* Product Headers */}
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-40">
                Product
              </th>
              {products.map((product) => (
                <th
                  key={product.id}
                  className="p-4 text-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="relative group">
                    <button
                      onClick={() => removeFromComparison(product.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label={`Remove ${product.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="w-32 h-32 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <OptimizedImage
                          src={product.image}
                          alt={product.name}
                          width={128}
                          height={128}
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {product.shopName}
                    </p>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Add to favorites"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Comparison Rows */}
          <tbody>
            {COMPARISON_FIELDS.map((field) => {
              const bestValue = getBestValue(field.key, field.type);

              return (
                <tr
                  key={field.key}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </td>
                  {products.map((product) => {
                    const value = getValue(product, field.key);
                    const isBest =
                      bestValue !== null &&
                      value === bestValue &&
                      (field.type === "price" || field.type === "rating");

                    return (
                      <td
                        key={product.id}
                        className={`p-4 text-center text-sm ${
                          isBest
                            ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-white dark:bg-gray-900"
                        }`}
                      >
                        {renderValue(value, field.type)}
                        {isBest && (
                          <span className="block text-xs text-green-600 dark:text-green-400 mt-1">
                            Best
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
