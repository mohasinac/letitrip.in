import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  HeroCarousel,
  WelcomeSection,
  TrustFeaturesSection,
} from "@/features/homepage";
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
    import("@/features/homepage").then((m) => ({
      default: m.TopCategoriesSection,
    })),
  { ssr: true },
);
const TopBrandsSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.TopBrandsSection,
    })),
  { ssr: true },
);
const FeaturedProductsSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.FeaturedProductsSection,
    })),
  { ssr: true },
);
const FeaturedAuctionsSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.FeaturedAuctionsSection,
    })),
  { ssr: true },
);
const FeaturedPreOrdersSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.FeaturedPreOrdersSection,
    })),
  { ssr: true },
);
const FeaturedStoresSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.FeaturedStoresSection,
    })),
  { ssr: true },
);
const FeaturedEventsSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.FeaturedEventsSection,
    })),
  { ssr: true },
);
const AdvertisementBanner = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.AdvertisementBanner,
    })),
  { ssr: true },
);
const CustomerReviewsSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.CustomerReviewsSection,
    })),
  { ssr: true },
);
const WhatsAppCommunitySection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.WhatsAppCommunitySection,
    })),
  { ssr: true },
);
const FAQSection = dynamic(
  () => import("@/features/homepage").then((m) => ({ default: m.FAQSection })),
  { ssr: true },
);
const BlogArticlesSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.BlogArticlesSection,
    })),
  { ssr: true },
);
export default function Page() {
  return (
    <div className="w-full space-y-0">
      {/* Homepage Sections - Rendered in Order */}
      <WelcomeSection />
      <HeroCarousel />
      <TrustFeaturesSection />
      <TopCategoriesSection />
      <TopBrandsSection />
      <FeaturedProductsSection />
      <FeaturedAuctionsSection />
      <FeaturedPreOrdersSection />
      <FeaturedStoresSection />
      <FeaturedEventsSection />
      <AdvertisementBanner />
      <CustomerReviewsSection />
      <WhatsAppCommunitySection />
      <FAQSection />
      <BlogArticlesSection />
    </div>
  );
}
