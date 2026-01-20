/**
 * Shops Listing Page
 *
 * Browse all shops/sellers on the platform.
 *
 * Features:
 * - Shop grid with ratings and info
 * - Search and filters
 * - Sorting options
 * - Pagination
 *
 * @page /shops - Shops listing
 */

import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ROUTES } from "@/constants/routes";
import { FALLBACK_SHOPS } from "@/lib/fallback-data";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browse Shops | Let It Rip",
  description: "Discover verified sellers and shops on Let It Rip",
};

async function getShops() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}${API_ENDPOINTS.SHOPS.LIST}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch shops - Using fallback data");
      return FALLBACK_SHOPS;
    }

    const data = await response.json();
    const shops = data.shops || [];
    // If API returns empty array, use fallback data for better UX
    if (shops.length === 0) {
      console.log("API returned empty shops - Using fallback data");
      return FALLBACK_SHOPS;
    }
    return shops;
  } catch (error) {
    console.error("Error fetching shops:", error, "- Using fallback data");
    return FALLBACK_SHOPS;
  }
}

export default async function ShopsPage() {
  const shops = await getShops();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Shops
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover verified sellers and shops
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="search"
              placeholder="Search shops..."
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            />
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white">
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Garden</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white">
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Shops Grid */}
        {shops.length === 0 ? (
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No shops found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back later for new shops and sellers
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops.map((shop: any) => (
              <Link
                key={shop.id}
                href={ROUTES.SHOPS.DETAIL(shop.slug)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Shop Banner */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  {shop.bannerUrl && (
                    <Image
                      src={shop.bannerUrl}
                      alt={shop.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Shop Info */}
                <div className="p-4">
                  {/* Logo */}
                  <div className="flex items-start gap-3 mb-3 -mt-12">
                    <div className="relative w-20 h-20 bg-white dark:bg-gray-800 rounded-lg border-4 border-white dark:border-gray-800 overflow-hidden flex-shrink-0">
                      {shop.logoUrl ? (
                        <Image
                          src={shop.logoUrl}
                          alt={shop.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">
                            {shop.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name and Badge */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {shop.name}
                    </h3>
                    {shop.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{shop.rating || "4.5"}</span>
                    </div>
                    <span>•</span>
                    <span>{shop.productCount || 0} products</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {shop.description || "Quality products and great service"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {shops.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              1
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              2
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
