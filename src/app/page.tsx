import {
  HeroCarousel,
  WelcomeSection,
  TrustIndicatorsSection,
  TopCategoriesSection,
  FeaturedProductsSection,
  SpecialCollectionsSection,
  FeaturedAuctionsSection,
  AdvertisementBanner,
  SiteFeaturesSection,
  CustomerReviewsSection,
  WhatsAppCommunitySection,
  FAQSection,
  BlogArticlesSection,
  NewsletterSection,
} from "@/components/homepage";

export default function Page() {
  return (
    <div className="w-full space-y-0">
      {/* Homepage Sections - Rendered in Order */}
      <HeroCarousel />
      <WelcomeSection />
      <TrustIndicatorsSection />
      <TopCategoriesSection />
      <FeaturedProductsSection />
      <SpecialCollectionsSection />
      <FeaturedAuctionsSection />
      <AdvertisementBanner />
      <SiteFeaturesSection />
      <CustomerReviewsSection />
      <WhatsAppCommunitySection />
      <FAQSection />
      <BlogArticlesSection />
      <NewsletterSection />
    </div>
  );
}
