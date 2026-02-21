import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  HeroCarousel,
  WelcomeSection,
  TrustFeaturesSection,
} from "@/components/homepage";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.pages.home.title,
  description: SEO_CONFIG.pages.home.description,
  keywords: [...SEO_CONFIG.pages.home.keywords],
  path: "/",
});

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
      <TrustFeaturesSection />
      <TopCategoriesSection />
      <FeaturedProductsSection />
      <FeaturedAuctionsSection />
      <AdvertisementBanner />
      <CustomerReviewsSection />
      <WhatsAppCommunitySection />
      <FAQSection />
      <BlogArticlesSection />
      <NewsletterSection />
    </div>
  );
}
