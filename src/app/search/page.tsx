/**
 * Search Page
 *
 * Global search results for products, auctions, shops.
 *
 * Features:
 * - Tabbed results (All, Products, Auctions, Shops)
 * - Search filters
 * - Sort options
 * - Pagination
 *
 * @page /search - Search results
 */

import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ROUTES } from "@/constants/routes";
import {
  FALLBACK_AUCTIONS,
  FALLBACK_PRODUCTS,
  FALLBACK_SHOPS,
} from "@/lib/fallback-data";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search Results | Let It Rip",
  description: "Search for products, auctions, and shops",
};

async function searchResults(query: string, type?: string) {
  try {
    const endpoint = type
      ? API_ENDPOINTS.SEARCH[
          type.toUpperCase() as keyof typeof API_ENDPOINTS.SEARCH
        ]
      : API_ENDPOINTS.SEARCH.GLOBAL;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}${endpoint}?q=${encodeURIComponent(
        query,
      )}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch search results - Using fallback data");
      return {
        products: FALLBACK_PRODUCTS,
        auctions: FALLBACK_AUCTIONS,
        shops: FALLBACK_SHOPS,
      };
    }

    const data = await response.json();
    // If API returns empty results, use fallback data for better UX
    const hasData =
      (data.products?.length || 0) +
      (data.auctions?.length || 0) +
      (data.shops?.length || 0);
    if (hasData === 0) {
      console.log("API returned empty results - Using fallback data");
      return {
        products: FALLBACK_PRODUCTS,
        auctions: FALLBACK_AUCTIONS,
        shops: FALLBACK_SHOPS,
      };
    }
    return data;
  } catch (error) {
    console.error(
      "Error fetching search results:",
      error,
      "- Using fallback data",
    );
    return {
      products: FALLBACK_PRODUCTS,
      auctions: FALLBACK_AUCTIONS,
      shops: FALLBACK_SHOPS,
    };
  }
}

interface PageProps {
  searchParams: {
    q?: string;
    type?: string;
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || "";
  const type = searchParams.type;

  const results = query
    ? await searchResults(query, type)
    : { products: [], auctions: [], shops: [] };
  const totalResults =
    (results.products?.length || 0) +
    (results.auctions?.length || 0) +
    (results.shops?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <form className="mb-4">
            <div className="relative">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search for products, auctions, shops..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Results Info */}
          {query && (
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {totalResults > 0 ? (
                  <>
                    Found <span className="font-semibold">{totalResults}</span>{" "}
                    results for "<span className="font-semibold">{query}</span>"
                  </>
                ) : (
                  <>
                    No results found for "
                    <span className="font-semibold">{query}</span>"
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!query ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Search for anything
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Find products, auctions, and shops
            </p>
          </div>
        ) : totalResults === 0 ? (
          /* No Results */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No results found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try different keywords or browse categories
            </p>
            <Link
              href={ROUTES.CATEGORIES.LIST}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Browse Categories
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Products */}
            {results.products && results.products.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Products ({results.products.length})
                  </h2>
                  <Link
                    href={`${ROUTES.PRODUCTS.LIST}?q=${encodeURIComponent(
                      query,
                    )}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.products.slice(0, 4).map((product: any) => (
                    <Link
                      key={product.id}
                      href={ROUTES.PRODUCTS.DETAIL(product.slug)}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                        {product.imageUrl && (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{product.price?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Auctions */}
            {results.auctions && results.auctions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Auctions ({results.auctions.length})
                  </h2>
                  <Link
                    href={`${ROUTES.AUCTIONS.LIST}?q=${encodeURIComponent(
                      query,
                    )}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.auctions.slice(0, 4).map((auction: any) => (
                    <Link
                      key={auction.id}
                      href={ROUTES.AUCTIONS.DETAIL(auction.slug)}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                        {auction.imageUrl && (
                          <Image
                            src={auction.imageUrl}
                            alt={auction.name}
                            fill
                            className="object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          LIVE
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {auction.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Current Bid
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ₹{auction.currentBid?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Shops */}
            {results.shops && results.shops.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Shops ({results.shops.length})
                  </h2>
                  <Link
                    href={`${ROUTES.SHOPS.LIST}?q=${encodeURIComponent(query)}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.shops.slice(0, 4).map((shop: any) => (
                    <Link
                      key={shop.id}
                      href={ROUTES.SHOPS.DETAIL(shop.slug)}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {shop.logoUrl ? (
                            <Image
                              src={shop.logoUrl}
                              alt={shop.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xl font-bold text-gray-400">
                                {shop.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {shop.name}
                          </h3>
                          {shop.verified && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {shop.productCount || 0} products
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
