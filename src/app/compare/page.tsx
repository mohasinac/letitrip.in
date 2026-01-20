/**
 * Compare Products Page
 *
 * Compare multiple products side by side to make informed decisions.
 *
 * @page /compare - Product comparison page
 */

import { ROUTES } from "@/constants/routes";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compare Products | Let It Rip",
  description:
    "Compare products side by side. View detailed specifications, prices, and features to make the best buying decision.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Compare Products
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Make informed decisions by comparing products side by side
            </p>
          </div>
        </div>
      </section>

      {/* Compare Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Empty State */}
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">⚖️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Products to Compare
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Start adding products to your comparison list to see detailed
                side-by-side comparisons of specifications, prices, and
                features.
              </p>

              {/* How to Use */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  How to Compare Products
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3">
                      1
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Browse products and click the "Compare" button on items
                      you want to compare
                    </p>
                  </div>
                  <div>
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3">
                      2
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add 2-4 products from the same category to your comparison
                      list
                    </p>
                  </div>
                  <div>
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3">
                      3
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View detailed side-by-side comparison of specifications
                      and prices
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={ROUTES.PRODUCTS.LIST}
                className="inline-block px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
              >
                Browse Products
              </Link>
            </div>

            {/* Features */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Detailed Specs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compare all specifications, features, and technical details
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Price Comparison
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See prices, discounts, and shipping costs side by side
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ratings & Reviews
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compare customer ratings and read verified reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
