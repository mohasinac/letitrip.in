"use client";

import dynamic from "next/dynamic";

const FeaturedProductsSection = dynamic(
  () => import("@/components/layout/FeaturedProductsSection"),
  {
    ssr: true,
    loading: () => <SectionSkeleton title="Featured Products" />,
  }
);

const FeaturedAuctionsSection = dynamic(
  () => import("@/components/layout/FeaturedAuctionsSection"),
  {
    ssr: true,
    loading: () => <SectionSkeleton title="Live Auctions" />,
  }
);

const FeaturedBlogsSection = dynamic(
  () => import("@/components/layout/FeaturedBlogsSection"),
  {
    ssr: true,
    loading: () => <SectionSkeleton title="Latest Blog Posts" />,
  }
);

const FeaturedReviewsSection = dynamic(
  () => import("@/components/layout/FeaturedReviewsSection"),
  {
    ssr: true,
    loading: () => <SectionSkeleton title="Customer Reviews" />,
  }
);

const FeaturedCategoriesSection = dynamic(
  () => import("@/components/layout/FeaturedCategoriesSection"),
  {
    ssr: true,
    loading: () => <SectionSkeleton title="Products by Category" />,
  }
);

const FeaturedShopsSection = dynamic(
  () => import("@/components/layout/FeaturedShopsSection"),
  {
    ssr: true,
    loading: () => <SectionSkeleton title="Shop by Seller" />,
  }
);

interface SectionConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
}

interface DynamicSectionProps {
  sectionKey: string;
  config?: SectionConfig;
}

export function DynamicSection({ sectionKey, config }: DynamicSectionProps) {
  if (config && !config.enabled) {
    return null;
  }

  switch (sectionKey) {
    case "featuredProducts":
      return (
        <section key="featured-products" id="featured-products">
          <FeaturedProductsSection />
        </section>
      );
    case "featuredAuctions":
      return (
        <section key="featured-auctions" id="featured-auctions">
          <FeaturedAuctionsSection />
        </section>
      );
    case "featuredBlogs":
      return (
        <section key="featured-blogs" id="featured-blogs">
          <FeaturedBlogsSection />
        </section>
      );
    case "featuredReviews":
      return (
        <section key="featured-reviews" id="featured-reviews">
          <FeaturedReviewsSection />
        </section>
      );
    case "featuredCategories":
      return (
        <section key="featured-categories" id="featured-categories">
          <FeaturedCategoriesSection />
        </section>
      );
    case "featuredShops":
      return (
        <section key="featured-shops" id="featured-shops">
          <FeaturedShopsSection />
        </section>
      );
    case "newArrivals":
      return (
        <section key="new-arrivals" id="new-arrivals">
          <FeaturedProductsSection />
        </section>
      );
    case "bestSellers":
      return (
        <section key="best-sellers" id="best-sellers">
          <FeaturedProductsSection />
        </section>
      );
    case "onSale":
      return (
        <section key="on-sale" id="on-sale">
          <FeaturedProductsSection />
        </section>
      );
    default:
      return null;
  }
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-56 md:h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
