/**
 * About Us Page
 *
 * Information about Let It Rip platform, mission, vision, and team.
 *
 * @page /about - About us page
 */

import { ROUTES } from "@/constants/routes";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Let It Rip",
  description:
    "Learn about Let It Rip - India's trusted auction and e-commerce platform. Our mission, vision, and values.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About Let It Rip
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              India's most trusted platform for auctions and online shopping
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  To revolutionize online commerce in India by providing a
                  transparent, secure, and exciting platform where buyers and
                  sellers can connect, trade, and thrive. We believe in making
                  quality products accessible to everyone while empowering
                  sellers to grow their businesses.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Vision
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  To become India's most trusted and innovative e-commerce
                  platform, where every transaction is a win-win for buyers and
                  sellers. We envision a future where online shopping is not
                  just convenient but also thrilling and rewarding.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Our Core Values
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Trust & Security
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Every seller is verified, and every transaction is secure
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Innovation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Constantly evolving to provide the best shopping experience
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Customer First
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your satisfaction and success is our top priority
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-12 mb-20">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    10K+
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Active Sellers
                  </p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    100K+
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Happy Customers
                  </p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    500K+
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Products</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    1M+
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Transactions
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Join Our Community
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Start buying amazing products or selling to thousands of
                customers
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href={ROUTES.PRODUCTS.LIST}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
                >
                  Start Shopping
                </Link>
                <Link
                  href={ROUTES.SELLER.DASHBOARD}
                  className="px-8 py-3 border-2 border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
