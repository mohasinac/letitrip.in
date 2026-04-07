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
// Below-fold sections — direct imports; App Router auto-splits at "use client"
// boundaries so separate dynamic() wrappers are redundant and cause a false-
// positive webpack "does not contain a default export" warning for next/dynamic
// which triggers unnecessary Fast Refresh full reloads in development.
import { TopCategoriesSection } from "./TopCategoriesSection";
import { TopBrandsSection } from "./TopBrandsSection";
import { FeaturedProductsSection } from "./FeaturedProductsSection";
import { FeaturedAuctionsSection } from "./FeaturedAuctionsSection";
import { FeaturedPreOrdersSection } from "./FeaturedPreOrdersSection";
import { FeaturedStoresSection } from "./FeaturedStoresSection";
import { FeaturedEventsSection } from "./FeaturedEventsSection";
import { AdvertisementBanner } from "./AdvertisementBanner";
import { CustomerReviewsSection } from "./CustomerReviewsSection";
import { WhatsAppCommunitySection } from "./WhatsAppCommunitySection";
import { FAQSection } from "./FAQSection";
import { BlogArticlesSection } from "./BlogArticlesSection";
import { FeaturedResultsSection } from "./FeaturedResultsSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { SecurityHighlightsSection } from "./SecurityHighlightsSection";
import { NewsletterSection } from "./NewsletterSection";

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
