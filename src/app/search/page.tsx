"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, Package, Grid, List } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import WishlistButton from "@/components/wishlist/WishlistButton";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt: string }>;
  rating?: number;
  reviewCount?: number;
  quantity: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const query = searchParams?.get("q") || "";

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {products.length > 0
              ? `Found ${products.length} result${
                  products.length !== 1 ? "s" : ""
                } for "${query}"`
              : `No results found for "${query}"`}
          </p>
        </div>

        {products.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {products.length} product
                {products.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {products.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try searching with different keywords
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  formatPrice,
}: {
  product: Product;
  formatPrice: (price: number) => string;
}) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
      <Link
        href={`/products/${product.slug}`}
        className="block relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden"
      >
        <Image
          src={product.images[0]?.url || "/assets/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
            -{discountPercent}% OFF
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`} className="block mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
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
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            View Details
          </Link>
          <WishlistButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images[0]?.url || "/assets/placeholder.png",
              slug: product.slug,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ProductListItem({
  product,
  formatPrice,
}: {
  product: Product;
  formatPrice: (price: number) => string;
}) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all group">
      <div className="flex items-center gap-4">
        <Link
          href={`/products/${product.slug}`}
          className="relative w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
        >
          <Image
            src={product.images[0]?.url || "/assets/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-1 left-1 px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {product.description}
          </p>
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(product.rating!)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="px-6 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            View Details
          </Link>
          <WishlistButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images[0]?.url || "/assets/placeholder.png",
              slug: product.slug,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
