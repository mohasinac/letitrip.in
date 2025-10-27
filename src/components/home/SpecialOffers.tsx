"use client";

import Link from "next/link";

export default function SpecialOffers() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* New Arrivals */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">🆕</span>
              <h3 className="text-2xl font-bold text-gray-900">New Arrivals</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Discover the latest additions to our marketplace. Fresh inventory
              from sellers worldwide, featuring unique items across all
              categories.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Daily inventory updates
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Exclusive seller partnerships
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                First access to rare items
              </p>
            </div>
            <Link
              href="/products/new"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Shop New Arrivals
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* Best Sellers */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">🏆</span>
              <h3 className="text-2xl font-bold text-gray-900">Best Sellers</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Shop the most popular items loved by our community. These
              top-rated products have been verified by thousands of satisfied
              customers.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Community favorites
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                High customer ratings
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Proven quality and authenticity
              </p>
            </div>
            <Link
              href="/products/bestsellers"
              className="inline-flex items-center justify-center px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              View Best Sellers
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
