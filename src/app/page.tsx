"use client";

import FAQSection from "@/components/faq/FAQSection";
import { AuctionsSection } from "@/components/homepage/AuctionsSection";
import { FeaturedBlogsSection } from "@/components/homepage/FeaturedBlogsSection";
import { FeaturedCategoriesSection } from "@/components/homepage/FeaturedCategoriesSection";
import { FeaturedShopsSection } from "@/components/homepage/FeaturedShopsSection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { ProductsSection } from "@/components/homepage/ProductsSection";
import { RecentReviewsSection } from "@/components/homepage/RecentReviewsSection";
import { ValueProposition } from "@/components/homepage/ValueProposition";
import { WelcomeHero } from "@/components/homepage/WelcomeHero";
import { RecentlyViewedWidget } from "@/components/products/RecentlyViewedWidget";
import { useIsMobile } from "@/hooks/useMobile";

export default function Home() {
  const isMobile = useIsMobile();

  return (
    <main
      id="home-page"
      className="container mx-auto px-3 md:px-4 py-6 md:py-8"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Heading - Always shown */}
        <WelcomeHero />

        {/* Hero Section */}
        <HeroSection enabled={true} />

        {/* Recently Viewed Products - Client-side only */}
        <RecentlyViewedWidget title="Continue Browsing" />

        {/* Value Proposition */}
        <ValueProposition />

        {/* Products Section (Latest + Featured merged) */}
        <ProductsSection latestLimit={10} featuredLimit={10} />

        {/* Auctions Section (Hot + Featured merged) */}
        <AuctionsSection hotLimit={10} featuredLimit={10} />

        {/* Featured Categories */}
        <FeaturedCategoriesSection categoryLimit={6} itemsPerCategory={10} />

        {/* Featured Shops */}
        <FeaturedShopsSection shopLimit={4} itemsPerShop={10} />

        {/* Recent Reviews */}
        <RecentReviewsSection limit={10} />

        {/* Featured Blogs */}
        <FeaturedBlogsSection limit={10} />

        {/* FAQ Section - Always shown */}
        <section id="faq-section" className="py-6 md:py-8">
          <FAQSection
            title="Frequently Asked Questions"
            description="Find answers to common questions about our platform"
            showSearch={false}
            maxItemsToShow={isMobile ? 5 : 10}
          />
        </section>
      </div>
    </main>
  );
}
