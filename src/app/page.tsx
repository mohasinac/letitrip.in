import dynamic from "next/dynamic";
import {
  HeroCarousel,
  WelcomeSection,
  TrustIndicatorsSection,
} from "@/components/homepage";

// Below-fold sections — dynamically imported to reduce initial JS bundle
const TopCategoriesSection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.TopCategoriesSection,
    })),
  { ssr: true },
);
const FeaturedProductsSection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.FeaturedProductsSection,
    })),
  { ssr: true },
);
const FeaturedAuctionsSection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.FeaturedAuctionsSection,
    })),
  { ssr: true },
);
const AdvertisementBanner = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.AdvertisementBanner,
    })),
  { ssr: true },
);
const SiteFeaturesSection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.SiteFeaturesSection,
    })),
  { ssr: true },
);
const CustomerReviewsSection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.CustomerReviewsSection,
    })),
  { ssr: true },
);
const WhatsAppCommunitySection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.WhatsAppCommunitySection,
    })),
  { ssr: true },
);
const FAQSection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({ default: m.FAQSection })),
  { ssr: true },
);
const BlogArticlesSection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.BlogArticlesSection,
    })),
  { ssr: true },
);
const NewsletterSection = dynamic(
  () =>
    import("@/components/homepage").then((m) => ({
      default: m.NewsletterSection,
    })),
  { ssr: true },
);

export default function Page() {
  return (
    <div className="w-full space-y-0">
      {/* Homepage Sections - Rendered in Order */}
      <HeroCarousel />
      <WelcomeSection />
      <TrustIndicatorsSection />
      <TopCategoriesSection />
      <FeaturedProductsSection />
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
