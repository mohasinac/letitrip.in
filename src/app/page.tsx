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
  EnhancedFooter,
} from "@/components/homepage";

export default function Page() {
  return (
    <>
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
      <EnhancedFooter />
    </>
  );
}
