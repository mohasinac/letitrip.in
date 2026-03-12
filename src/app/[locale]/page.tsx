import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  HeroCarousel,
  WelcomeSection,
  TrustFeaturesSection,
  StatsCounterSection,
} from "@/features/homepage";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";
import {
  carouselRepository,
  categoriesRepository,
  reviewRepository,
} from "@/repositories";

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
const FeaturedResultsSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.FeaturedResultsSection,
    })),
  { ssr: true },
);
const HowItWorksSection = dynamic(
  () =>
    import("@/features/homepage").then((m) => ({
      default: m.HowItWorksSection,
    })),
  { ssr: true },
);
export default async function Page() {
  const [slides, categories, reviews] = await Promise.all([
    carouselRepository.getActiveSlides().catch(() => []),
    categoriesRepository
      .getCategoriesByTier(0)
      .then((c) => c.slice(0, 12))
      .catch(() => []),
    reviewRepository.findFeatured(18).catch(() => []),
  ]);

  return (
    <div className="w-full space-y-0">
      {/* Homepage Sections - Rendered in Order */}
      <WelcomeSection />
      <HeroCarousel initialSlides={slides} />
      <StatsCounterSection />
      <TrustFeaturesSection />
      <HowItWorksSection />
      <TopCategoriesSection initialCategories={categories} />
      <TopBrandsSection />
      <FeaturedProductsSection />
      <FeaturedAuctionsSection />
      <FeaturedPreOrdersSection />
      <FeaturedStoresSection />
      <FeaturedEventsSection />
      <AdvertisementBanner />
      <CustomerReviewsSection initialReviews={reviews} />
      <WhatsAppCommunitySection />
      <FAQSection />
      <BlogArticlesSection />
      <FeaturedResultsSection />
    </div>
  );
}
