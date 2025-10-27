"use client";

import Link from "next/link";

export default function SpecialOffers() {
  return (
    <section className="py-20 bg-gradient-to-br from-theme-accent/30 to-theme-background shadow-inner">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
          {/* New Arrivals */}
          <div className="bg-white rounded-2xl p-10 border-4 border-theme-primary hover-glow-theme-strong transition-all duration-300 transform hover:scale-105 shadow-2xl">
            <div className="flex items-center mb-6">
              <span className="text-5xl mr-6 drop-shadow-lg">🆕</span>
              <h3 className="text-3xl font-black text-theme-text drop-shadow-sm">
                New Arrivals
              </h3>
            </div>
            <p className="text-theme-muted mb-8 text-xl font-semibold leading-relaxed">
              Discover the latest additions to our marketplace. Fresh inventory
              from sellers worldwide, featuring unique items across all
              categories.
            </p>
            <div className="space-y-4 mb-8">
              <p className="text-lg text-theme-muted flex items-center font-medium">
                <span className="w-3 h-3 bg-theme-primary rounded-full mr-4 shadow-sm"></span>
                Daily inventory updates
              </p>
              <p className="text-lg text-theme-muted flex items-center font-medium">
                <span className="w-3 h-3 bg-theme-primary rounded-full mr-4 shadow-sm"></span>
                Exclusive seller partnerships
              </p>
              <p className="text-lg text-theme-muted flex items-center font-medium">
                <span className="w-3 h-3 bg-theme-primary rounded-full mr-4 shadow-sm"></span>
                First access to rare items
              </p>
            </div>
            <Link
              href="/products/new"
              className="inline-flex items-center justify-center px-8 py-4 bg-theme-primary text-white rounded-xl font-bold text-lg hover:bg-theme-secondary transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-theme-primary hover:border-theme-secondary"
            >
              Shop New Arrivals
              <svg
                className="w-6 h-6 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* Best Sellers */}
          <div className="bg-theme-primary rounded-2xl p-10 border-4 border-theme-primary hover-glow-theme-strong transition-all duration-300 transform hover:scale-105 shadow-2xl">
            <div className="flex items-center mb-6">
              <span className="text-5xl mr-6 drop-shadow-lg">🏆</span>
              <h3 className="text-3xl font-black text-white drop-shadow-lg">
                Best Sellers
              </h3>
            </div>
            <p className="text-white mb-8 text-xl font-semibold leading-relaxed drop-shadow-md">
              Shop the most popular items loved by our community. These
              top-rated products have been verified by thousands of satisfied
              customers.
            </p>
            <div className="space-y-4 mb-8">
              <p className="text-lg text-white flex items-center font-medium drop-shadow-sm">
                <span className="w-3 h-3 bg-white rounded-full mr-4 shadow-sm"></span>
                Community favorites
              </p>
              <p className="text-lg text-white flex items-center font-medium drop-shadow-sm">
                <span className="w-3 h-3 bg-white rounded-full mr-4 shadow-sm"></span>
                High customer ratings
              </p>
              <p className="text-lg text-white flex items-center font-medium drop-shadow-sm">
                <span className="w-3 h-3 bg-white rounded-full mr-4 shadow-sm"></span>
                Proven quality and authenticity
              </p>
            </div>
            <Link
              href="/products/bestsellers"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-theme-primary rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-white"
            >
              View Best Sellers
              <svg
                className="w-6 h-6 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
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
