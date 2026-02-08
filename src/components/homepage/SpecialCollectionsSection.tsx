"use client";

import { THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";

interface Collection {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: string;
  bgGradient: string;
}

const collections: Collection[] = [
  {
    id: "nib",
    title: "New in Box",
    description: "Fresh arrivals, never opened",
    link: "/products?condition=new",
    icon: "📦",
    bgGradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "under-1000",
    title: "Under ₹1,000",
    description: "Quality products, great prices",
    link: "/products?maxPrice=1000",
    icon: "💰",
    bgGradient: "from-green-500 to-emerald-500",
  },
  {
    id: "limited",
    title: "Limited Edition",
    description: "Exclusive items, rare finds",
    link: "/products?tags=limited-edition",
    icon: "✨",
    bgGradient: "from-purple-500 to-pink-500",
  },
  {
    id: "clearance",
    title: "Clearance Sale",
    description: "Up to 70% off selected items",
    link: "/products?onSale=true",
    icon: "🔥",
    bgGradient: "from-orange-500 to-red-500",
  },
];

export function SpecialCollectionsSection() {
  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            Special Collections
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            Curated selections for every need
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <button
              key={collection.id}
              className={`group relative overflow-hidden ${THEME_CONSTANTS.borderRadius.xl} p-8 text-left transition-all hover:shadow-2xl hover:-translate-y-2`}
              onClick={() => (window.location.href = collection.link)}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${collection.bgGradient} opacity-90 group-hover:opacity-100 transition-opacity`}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4">{collection.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {collection.title}
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  {collection.description}
                </p>
                <div className="inline-flex items-center text-white font-medium text-sm group-hover:gap-2 transition-all">
                  Shop Now
                  <svg
                    className="w-4 h-4 ml-1 group-hover:ml-2 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
