import FeaturedCategories from "@/components/layout/FeaturedCategories";
import FAQSection from "@/components/faq/FAQSection";
import ShopsNav from "@/components/layout/ShopsNav";
import FeaturedProductsSection from "@/components/layout/FeaturedProductsSection";
import FeaturedAuctionsSection from "@/components/layout/FeaturedAuctionsSection";
import HeroCarousel from "@/components/layout/HeroCarousel";
import FeaturedBlogsSection from "@/components/layout/FeaturedBlogsSection";
import FeaturedReviewsSection from "@/components/layout/FeaturedReviewsSection";
import FeaturedCategoriesSection from "@/components/layout/FeaturedCategoriesSection";
import FeaturedShopsSection from "@/components/layout/FeaturedShopsSection";

export default function Home() {
  return (
    <main id="home-page" className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <section id="hero-section" className="relative">
          <HeroCarousel />
        </section>

        {/* Value Proposition Banner */}
        <section
          id="value-proposition"
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 md:p-6"
        >
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <svg
                className="w-6 h-6"
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
              <span className="text-sm md:text-base">
                100% Authentic Products
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <svg
                className="w-6 h-6"
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
              <span className="text-sm md:text-base">Zero Customs Charges</span>
            </div>
            <div className="flex items-center gap-2 text-purple-700 font-medium">
              <svg
                className="w-6 h-6"
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
              <span className="text-sm md:text-base">Fast India Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-orange-700 font-medium">
              <svg
                className="w-6 h-6"
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
              <span className="text-sm md:text-base">Secure Payments</span>
            </div>
          </div>
        </section>
        {/* 5. Featured Categories */}
        <FeaturedCategories />
        {/* Featured Categories Section */}
        <section id="featured-categories">
          <FeaturedCategoriesSection />
        </section>

        {/* Featured Products Section */}
        <section id="featured-products">
          <FeaturedProductsSection />
        </section>

        {/* Featured auctions Section */}
        <section id="featured-auctions">
          <FeaturedAuctionsSection />
        </section>
        {/* Shops Navigation */}
        <ShopsNav />

        {/* Featured Shops Section */}
        <section id="featured-shops">
          <FeaturedShopsSection />
        </section>
        {/* Featured blog posts Section */}
        <section id="featured-blogs">
          <FeaturedBlogsSection />
        </section>
        {/* Featured reviews posts Section */}
        <section id="featured-reviews">
          <FeaturedReviewsSection />
        </section>
        {/* FAQ Section */}
        <section id="faq-section" className="py-8">
          <FAQSection
            title="Frequently Asked Questions"
            description="Quick answers about authentic collectibles, shipping, and more"
            maxItemsToShow={6}
            defaultCategory="getting-started"
          />
        </section>
      </div>
    </main>
  );
}
