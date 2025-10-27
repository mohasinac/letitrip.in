"use client";

import Link from "next/link";

export default function Newsletter() {
  return (
    <section className="py-20 bg-gradient-to-br from-theme-background to-theme-accent/40 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-theme-text mb-6 drop-shadow-lg">
            Stay Connected
          </h2>
          <p className="text-2xl text-theme-muted font-bold mb-12 drop-shadow-md">
            Join our community for exclusive updates, new arrivals, and special
            deals
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            {/* Newsletter */}
            <div className="bg-white rounded-2xl p-8 border-4 border-theme-primary hover-glow-theme-strong shadow-2xl">
              <h3 className="text-2xl font-bold text-theme-text mb-4 drop-shadow-sm">
                Newsletter
              </h3>
              <p className="text-theme-muted font-semibold text-lg mb-6">
                Get weekly updates on new products and exclusive offers
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-4 border-3 border-theme-primary rounded-l-xl focus:outline-none focus:ring-4 focus:ring-theme-primary/30 text-theme-text bg-white font-semibold text-lg"
                />
                <button className="px-8 py-4 bg-theme-primary text-white rounded-r-xl hover:bg-theme-secondary transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Community */}
            <div className="bg-theme-primary rounded-2xl p-8 border-4 border-theme-primary hover-glow-theme-strong shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                Join Community
              </h3>
              <p className="text-white font-semibold text-lg mb-6 drop-shadow-md">
                Connect with collectors and sellers worldwide
              </p>
              <Link
                href="/community"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-theme-primary rounded-xl hover:bg-gray-100 transition-all duration-300 w-full font-bold text-lg shadow-lg hover:shadow-xl border-2 border-white"
              >
                Join Now
              </Link>
            </div>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white rounded-xl p-6 border-4 border-theme-primary shadow-xl">
              <div className="text-4xl font-black text-theme-primary mb-2 drop-shadow-md">
                25K+
              </div>
              <div className="text-theme-muted font-bold text-lg">
                Active Users
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border-4 border-theme-primary shadow-xl">
              <div className="text-4xl font-black text-theme-primary mb-2 drop-shadow-md">
                500+
              </div>
              <div className="text-theme-muted font-bold text-lg">
                Verified Sellers
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border-4 border-theme-primary shadow-xl">
              <div className="text-4xl font-black text-theme-primary mb-2 drop-shadow-md">
                50K+
              </div>
              <div className="text-theme-muted font-bold text-lg">
                Products Listed
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border-4 border-theme-primary shadow-xl">
              <div className="text-4xl font-black text-theme-primary mb-2 drop-shadow-md">
                98%
              </div>
              <div className="text-theme-muted font-bold text-lg">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
