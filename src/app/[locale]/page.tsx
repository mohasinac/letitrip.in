import { MarketplaceHomepageView } from "@mohasinac/appkit";
import { HomepageNewsletterForm } from "@/components/homepage/HomepageNewsletterForm";
import {
  AfterHeroAdSlot,
  AfterFeaturedProductsAdSlot,
  AfterReviewsAdSlot,
  AfterFAQAdSlot,
} from "@/components/homepage/AdSlots";

export const revalidate = 120;

export default async function Page() {
  return (
    <MarketplaceHomepageView
      newsletterFormSlot={<HomepageNewsletterForm />}
      adSlots={{
        afterHero: <AfterHeroAdSlot />,
        afterFeaturedProducts: <AfterFeaturedProductsAdSlot />,
        afterReviews: <AfterReviewsAdSlot />,
        afterFAQ: <AfterFAQAdSlot />,
      }}
    />
  );
}