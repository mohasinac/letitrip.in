"use client";

import Link from "next/link";

export default function SpecialCollections() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          {/* Live Auctions */}
          <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔥</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Live Auctions</h3>
            <p className="text-blue-100 mb-4">
              Bid on rare and unique items in real-time auctions with global
              participants.
            </p>
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              View Auctions
            </Link>
          </div>

          {/* Verified Sellers */}
          <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Verified Sellers</h3>
            <p className="text-blue-100 mb-4">
              Shop with confidence from our curated network of trusted, verified
              sellers.
            </p>
            <Link
              href="/stores"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse Stores
            </Link>
          </div>

          {/* Authentication Guarantee */}
          <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🛡️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">100% Authentic</h3>
            <p className="text-blue-100 mb-4">
              Every item is verified for authenticity with detailed condition
              reports.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
