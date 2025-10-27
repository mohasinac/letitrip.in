"use client";

import Link from "next/link";

export default function Newsletter() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Stay Connected
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community for exclusive updates, new arrivals, and special
            deals
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Newsletter */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Newsletter
              </h3>
              <p className="text-gray-600 mb-4">
                Get weekly updates on new products and exclusive offers
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Community */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Join Community
              </h3>
              <p className="text-gray-600 mb-4">
                Connect with collectors and sellers worldwide
              </p>
              <Link
                href="/community"
                className="inline-flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full"
              >
                Join Now
              </Link>
            </div>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">25K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Verified Sellers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">50K+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
