"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { COMPANY_NAME, COMPANY_ALT_TEXT } from "@/constants/navigation";
import {
  homepageSettingsService,
  HomepageSettings,
} from "@/services/homepage-settings.service";
import { useIsMobile } from "@/hooks/useMobile";
import { RecentlyViewedWidget } from "@/components/products/RecentlyViewedWidget";

// Dynamically import heavy components with SEO-friendly loading states
const FeaturedCategories = dynamic(
  () => import("@/components/layout/FeaturedCategories"),
  {
    ssr: true,
    loading: () => (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Shop by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-24 md:h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
  },
);

const FAQSection = dynamic(() => import("@/components/faq/FAQSection"), {
  ssr: true,
  loading: () => (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Quick answers about authentic collectibles, shipping, and more
      </p>
      <div className="space-y-3 md:space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-14 md:h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  ),
});

const ShopsNav = dynamic(() => import("@/components/layout/ShopsNav"), {
  ssr: true,
  loading: () => (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Featured Shops
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-40 md:h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  ),
});

const FeaturedProductsSection = dynamic(
  () => import("@/components/layout/FeaturedProductsSection"),
  {
    ssr: true,
    loading: () => (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Featured Products
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Discover our handpicked selection of authentic collectibles from Japan
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-56 md:h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
  },
);

const FeaturedAuctionsSection = dynamic(
  () => import("@/components/layout/FeaturedAuctionsSection"),
  {
    ssr: true,
    loading: () => (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Live Auctions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Bid on exclusive collectibles and rare finds
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-72 md:h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
  },
);

const HeroCarousel = dynamic(() => import("@/components/layout/HeroCarousel"), {
  ssr: true,
  loading: () => (
    <div className="relative h-64 md:h-80 lg:h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-300 dark:text-gray-600">
            Welcome to {COMPANY_NAME}
          </h2>
          <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm md:text-base">
            Loading featured collections...
          </p>
        </div>
      </div>
    </div>
  ),
});

const FeaturedBlogsSection = dynamic(
  () => import("@/components/layout/FeaturedBlogsSection"),
  {
    ssr: true,
    loading: () => (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Latest Blog Posts
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Stay updated with collecting tips, news, and insights
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-64 md:h-72 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
  },
);

const FeaturedReviewsSection = dynamic(
  () => import("@/components/layout/FeaturedReviewsSection"),
  {
    ssr: true,
    loading: () => (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Customer Reviews
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          See what our customers say about their purchases
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 md:h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
  },
);

const FeaturedCategoriesSection = dynamic(
  () => import("@/components/layout/FeaturedCategoriesSection"),
  {
    ssr: true,
    loading: () => (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Products by Category
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Browse our curated collections across popular categories
        </p>
        <div className="space-y-6 md:space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-6 md:h-7 bg-gray-100 dark:bg-gray-800 rounded w-40 md:w-48 mb-4 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-56 md:h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
);

const FeaturedShopsSection = dynamic(
  () => import("@/components/layout/FeaturedShopsSection"),
  {
    ssr: true,
    loading: () => (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Shop by Seller
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Discover products from our trusted verified sellers
        </p>
        <div className="space-y-6 md:space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-6 md:h-7 bg-gray-100 dark:bg-gray-800 rounded w-40 md:w-48 mb-4 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-56 md:h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
);

export default function Home() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await homepageSettingsService.getSettings();
        setSettings(response.settings);
      } catch (error) {
        console.error("Failed to load homepage settings:", error);
        // Use default settings if API fails
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Default section order
  const defaultSectionOrder = [
    "featuredCategories",
    "featuredProducts",
    "featuredAuctions",
    "featuredShops",
    "featuredBlogs",
    "featuredReviews",
  ];

  // Get section order from settings or use default
  const sectionOrder = useMemo(() => {
    if (settings?.sectionOrder && settings.sectionOrder.length > 0) {
      return settings.sectionOrder;
    }
    return defaultSectionOrder;
  }, [settings?.sectionOrder]);

  // Section components map
  const sectionComponents: Record<string, React.ReactNode> = {
    featuredCategories: (!settings ||
      settings.sections.featuredCategories.enabled) && (
      <section key="featured-categories" id="featured-categories">
        <FeaturedCategoriesSection />
      </section>
    ),
    featuredProducts: (!settings ||
      settings.sections.featuredProducts.enabled) && (
      <section key="featured-products" id="featured-products">
        <FeaturedProductsSection />
      </section>
    ),
    featuredAuctions: (!settings ||
      settings.sections.featuredAuctions.enabled) && (
      <section key="featured-auctions" id="featured-auctions">
        <FeaturedAuctionsSection />
      </section>
    ),
    featuredShops: (!settings || settings.sections.featuredShops.enabled) && (
      <section key="featured-shops" id="featured-shops">
        <FeaturedShopsSection />
      </section>
    ),
    featuredBlogs: (!settings || settings.sections.featuredBlogs.enabled) && (
      <section key="featured-blogs" id="featured-blogs">
        <FeaturedBlogsSection />
      </section>
    ),
    featuredReviews: (!settings ||
      settings.sections.featuredReviews.enabled) && (
      <section key="featured-reviews" id="featured-reviews">
        <FeaturedReviewsSection />
      </section>
    ),
  };

  // Show loading state with mobile-optimized skeletons
  if (loading) {
    return (
      <main
        id="home-page"
        className="container mx-auto px-3 md:px-4 py-6 md:py-8"
      >
        <div className="space-y-6 md:space-y-8">
          <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </main>
    );
  }
  return (
    <main
      id="home-page"
      className="container mx-auto px-3 md:px-4 py-6 md:py-8"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Heading - Always shown */}
        <section className="text-center py-3 md:py-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
            Welcome to {COMPANY_NAME}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
            {COMPANY_ALT_TEXT} - Your Gateway to Authentic Collectibles
          </p>
        </section>

        {/* Hero Section - Conditional */}
        {(!settings || settings.heroCarousel.enabled) && (
          <section id="hero-section" className="relative">
            <HeroCarousel />
          </section>
        )}

        {/* Value Proposition Banner - Conditional */}
        {(!settings || settings.sections.valueProposition.enabled) && (
          <section
            id="value-proposition"
            className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3 md:p-4 lg:p-6"
          >
            <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center items-center gap-3 md:gap-6 lg:gap-8">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium min-h-[48px] touch-manipulation">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">
                  100% Authentic Products
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium min-h-[48px] touch-manipulation">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">
                  Zero Customs Charges
                </span>
              </div>
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-medium min-h-[48px] touch-manipulation">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">
                  Fast India Delivery
                </span>
              </div>
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-medium min-h-[48px] touch-manipulation">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">
                  Secure Payments
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Featured Categories Icon Grid - Always shown */}
        <FeaturedCategories />

        {/* Recently Viewed Products - Client-side only */}
        <RecentlyViewedWidget title="Continue Browsing" />

        {/* Dynamic Sections - Rendered in order from settings */}
        {sectionOrder.map((sectionKey) => sectionComponents[sectionKey])}

        {/* Shops Navigation - Always shown */}
        <ShopsNav />

        {/* FAQ Section - Always shown */}
        <section id="faq-section" className="py-6 md:py-8">
          <FAQSection
            title="Frequently Asked Questions"
            description="Quick answers about authentic collectibles, shipping, and more"
            maxItemsToShow={isMobile ? 4 : 6}
            defaultCategory="getting-started"
          />
        </section>
      </div>
    </main>
  );
}
