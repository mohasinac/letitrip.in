import type { Metadata } from "next";
import { MarketplaceHomepageView } from "@mohasinac/appkit";
import { HomepageNewsletterForm } from "@/components/homepage/HomepageNewsletterForm";
import {
  AfterHeroAdSlot,
  AfterFeaturedProductsAdSlot,
  AfterReviewsAdSlot,
  AfterFAQAdSlot,
} from "@/components/homepage/AdSlots";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "LetiTrip — India's Collectibles Marketplace",
  description:
    "Buy, sell & auction Pokémon TCG, Hot Wheels, anime figures, Beyblades and more. India's largest collectibles marketplace.",
  path: "/",
  type: "website",
});

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