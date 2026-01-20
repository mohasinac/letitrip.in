/**
 * Deals & Offers Page
 *
 * Browse current deals, discounts, and special offers.
 *
 * @page /deals - Deals and offers page
 */

import { ROUTES } from "@/constants/routes";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Deals & Offers | Let It Rip",
  description:
    "Discover amazing deals, discounts, and special offers on thousands of products. Limited time offers, flash sales, and exclusive deals.",
};

export default function DealsPage() {
  const dealCategories = [
    {
      title: "Flash Sales",
      icon: "⚡",
      description: "Limited time offers ending soon",
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Daily Deals",
      icon: "🎯",
      description: "New deals every day",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Clearance",
      icon: "🏷️",
      description: "Up to 70% off on select items",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Bundle Offers",
      icon: "📦",
      description: "Save more when you buy together",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Deals & Offers
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Discover amazing discounts on thousands of products
            </p>
          </div>
        </div>
      </section>

      {/* Deal Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {dealCategories.map((category, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}
                  />
                  <div className="relative p-8 text-white">
                    <div className="text-5xl mb-4">{category.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">
                      {category.title}
                    </h3>
                    <p className="text-white/90 mb-4">{category.description}</p>
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold group-hover:bg-white/30 transition">
                      Explore Deals →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon State */}
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Exciting Deals Coming Soon!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                We're preparing amazing deals and offers for you. Check back
                soon to discover incredible discounts on your favorite products.
              </p>
              <Link
                href={ROUTES.PRODUCTS.LIST}
                className="inline-block px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
              >
                Browse All Products
              </Link>
            </div>

            {/* How Deals Work */}
            <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                How Our Deals Work
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Browse Deals
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Find products with special discounts and offers
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Add to Cart
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Discount applies automatically at checkout
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Complete Order
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Proceed with payment and confirm your order
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">4️⃣</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Enjoy Savings
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get your products delivered at great prices
                  </p>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-16 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Never Miss a Deal!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Subscribe to our newsletter and be the first to know about flash
                sales and exclusive offers
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
