"use client";

import Link from "next/link";

export default function SpecialCollections() {
  return (
    <section className="py-16 bg-gradient-to-r from-theme-primary to-theme-secondary shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          {/* Live Auctions */}
          <div className="text-center p-8 bg-black/30 rounded-xl backdrop-blur-md hover-glow-theme border border-white/20 shadow-xl">
            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">🔥</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">
              Live Auctions
            </h3>
            <p className="text-white/95 mb-6 font-medium text-lg">
              Bid on rare and unique items in real-time auctions with global
              participants.
            </p>
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-theme-primary rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg text-lg border-4 border-white"
            >
              View Auctions
            </Link>
          </div>

          {/* Verified Sellers */}
          <div className="text-center p-8 bg-black/30 rounded-xl backdrop-blur-md hover-glow-theme border border-white/20 shadow-xl">
            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">⭐</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">
              Verified Sellers
            </h3>
            <p className="text-white/95 mb-6 font-medium text-lg">
              Shop with confidence from our curated network of trusted, verified
              sellers.
            </p>
            <Link
              href="/stores"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-theme-primary rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg text-lg border-4 border-white"
            >
              Browse Stores
            </Link>
          </div>

          {/* Authentication Guarantee */}
          <div className="text-center p-8 bg-black/30 rounded-xl backdrop-blur-md hover-glow-theme border border-white/20 shadow-xl">
            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">🛡️</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">
              100% Authentic
            </h3>
            <p className="text-white/95 mb-6 font-medium text-lg">
              Every item is verified for authenticity with detailed condition
              reports.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-theme-primary rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg text-lg border-4 border-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
