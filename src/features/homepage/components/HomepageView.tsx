import dynamic from "next/dynamic";
import type { CategoryItem } from "@mohasinac/feat-categories";
import type { ProductListResponse } from "@mohasinac/feat-products";
import {
  carouselRepository,
  categoriesRepository,
  reviewRepository,
  productRepository,
} from "@/repositories";
import { HeroCarousel } from "./HeroCarousel";
import { WelcomeSection } from "./WelcomeSection";
import { TrustFeaturesSection } from "./TrustFeaturesSection";
import { StatsCounterSection } from "./StatsCounterSection";

// Below-fold sections — dynamically imported to reduce initial JS bundle
const TopCategoriesSection = dynamic(
  () =>
    import("./TopCategoriesSection").then((m) => ({
      default: m.TopCategoriesSection,
    })),
  { ssr: true },
);
const TopBrandsSection = dynamic(
  () =>
    import("./TopBrandsSection").then((m) => ({ default: m.TopBrandsSection })),
  { ssr: true },
);
const FeaturedProductsSection = dynamic(
  () =>
    import("./FeaturedProductsSection").then((m) => ({
      default: m.FeaturedProductsSection,
    })),
  { ssr: true },
);
const FeaturedAuctionsSection = dynamic(
  () =>
    import("./FeaturedAuctionsSection").then((m) => ({
      default: m.FeaturedAuctionsSection,
    })),
  { ssr: true },
);
const FeaturedPreOrdersSection = dynamic(
  () =>
    import("./FeaturedPreOrdersSection").then((m) => ({
      default: m.FeaturedPreOrdersSection,
    })),
  { ssr: true },
);
const FeaturedStoresSection = dynamic(
  () =>
    import("./FeaturedStoresSection").then((m) => ({
      default: m.FeaturedStoresSection,
    })),
  { ssr: true },
);
const FeaturedEventsSection = dynamic(
  () =>
    import("./FeaturedEventsSection").then((m) => ({
      default: m.FeaturedEventsSection,
    })),
  { ssr: true },
);
const AdvertisementBanner = dynamic(
  () =>
    import("./AdvertisementBanner").then((m) => ({
      default: m.AdvertisementBanner,
    })),
  { ssr: true },
);
const CustomerReviewsSection = dynamic(
  () =>
    import("./CustomerReviewsSection").then((m) => ({
      default: m.CustomerReviewsSection,
    })),
  { ssr: true },
);
const WhatsAppCommunitySection = dynamic(
  () =>
    import("./WhatsAppCommunitySection").then((m) => ({
      default: m.WhatsAppCommunitySection,
    })),
  { ssr: true },
);
const FAQSection = dynamic(
  () => import("./FAQSection").then((m) => ({ default: m.FAQSection })),
  { ssr: true },
);
const BlogArticlesSection = dynamic(
  () =>
    import("./BlogArticlesSection").then((m) => ({
      default: m.BlogArticlesSection,
    })),
  { ssr: true },
);
const FeaturedResultsSection = dynamic(
  () =>
    import("./FeaturedResultsSection").then((m) => ({
      default: m.FeaturedResultsSection,
    })),
  { ssr: true },
);
const HowItWorksSection = dynamic(
  () =>
    import("./HowItWorksSection").then((m) => ({
      default: m.HowItWorksSection,
    })),
  { ssr: true },
);
const SecurityHighlightsSection = dynamic(
  () =>
    import("./SecurityHighlightsSection").then((m) => ({
      default: m.SecurityHighlightsSection,
    })),
  { ssr: true },
);
const NewsletterSection = dynamic(
  () =>
    import("./NewsletterSection").then((m) => ({
      default: m.NewsletterSection,
    })),
  { ssr: true },
);

function firestoreTimestampToDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (
    val &&
    typeof val === "object" &&
    typeof (val as { toDate?: unknown }).toDate === "function"
  ) {
    return (val as { toDate: () => Date }).toDate();
  }
  if (val && typeof val === "object" && "_seconds" in (val as object)) {
    return new Date((val as { _seconds: number })._seconds * 1000);
  }
  return new Date(val as string | number);
}

export async function HomepageView() {
  const [slides, categories, reviews, featuredProducts] = await Promise.all([
    carouselRepository.getActiveSlides().catch(() => []),
    categoriesRepository
      .getCategoriesByTier(0)
      .then((c) => c.slice(0, 12))
      .catch(() => []),
    reviewRepository
      .findFeatured(18)
      .then((rs) =>
        rs.map((r) => ({
          ...r,
          createdAt: firestoreTimestampToDate(r.createdAt),
          updatedAt: firestoreTimestampToDate(r.updatedAt),
          approvedAt: r.approvedAt
            ? firestoreTimestampToDate(r.approvedAt)
            : undefined,
        })),
      )
      .catch(() => []),
    // Pre-fetch featured products server-side so client skips the first fetch.
    productRepository
      .list({
        filters: "status==published",
        sorts: "-createdAt",
        pageSize: "18",
      })
      .then(
        (r) =>
          ({
            items: r.items as unknown as ProductListResponse["items"],
            total: r.total,
            page: r.page,
            pageSize: r.pageSize,
            totalPages: r.totalPages,
            hasMore: r.hasMore,
          }) satisfies ProductListResponse,
      )
      .catch(() => undefined),
  ]);

  return (
    <div className="w-full space-y-0">
      <WelcomeSection />
      <HeroCarousel initialSlides={slides} />
      <StatsCounterSection />
      <TrustFeaturesSection />
      <HowItWorksSection />
      <TopCategoriesSection
        initialCategories={categories as unknown as CategoryItem[]}
      />
      <TopBrandsSection />
      <FeaturedProductsSection initialData={featuredProducts} />
      <FeaturedAuctionsSection />
      <FeaturedPreOrdersSection />
      <FeaturedStoresSection />
      <FeaturedEventsSection />
      <AdvertisementBanner />
      <CustomerReviewsSection initialReviews={reviews} />
      <SecurityHighlightsSection />
      <WhatsAppCommunitySection />
      <FAQSection />
      <NewsletterSection />
      <BlogArticlesSection />
      <FeaturedResultsSection />
    </div>
  );
}
