import type { Metadata } from "next";
import { MarketplaceHomepageView, faqJsonLd } from "@mohasinac/appkit";
import { getHomepageFaqsCached, safeRead } from "@mohasinac/appkit/server";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { HomepageNewsletterForm } from "@/components";
import {
  AfterHeroAdSlot,
  AfterFeaturedProductsAdSlot,
  AfterReviewsAdSlot,
  AfterFAQAdSlot,
} from "@/components";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { dismissBannerAction } from "@/actions/profile.actions";
import appkitConfig from "@/lib/appkit-config";

/**
 * No `title`/`description` here on purpose.
 *
 * `_gm` falls back to `LETITRIP_SEO.defaultTitle`/`defaultDescription`, so the
 * homepage now inherits rather than carrying a third copy. There were three
 * near-identical descriptions — here, `appkit.config.js` `seo`, and
 * `src/constants/seo.server.ts` — and this one had already drifted: it named
 * Pokémon TCG and Hot Wheels, franchises the catalogue does not stock. The
 * homepage is the page the site defaults describe, so inheriting is also the
 * honest answer, not just the DRY one.
 */
export const metadata: Metadata = _gm({
  path: "/",
  type: "website",
});

export const revalidate = 3600;

export default async function Page() {
  // FAQPage structured data for the homepage FAQ strip.
  //
  // Emitted from the shim rather than from inside MarketplaceHomepageView:
  // appkit is a library, and a brand-bearing JSON-LD block inside it is the
  // encapsulation break `audit-ssr-in-appkit` Rule 3 exists to prevent.
  //
  // Same source the section itself renders from, so the markup matches what is
  // visible — Google requires that. Deliberately NOT ItemList/Carousel markup:
  // Google's own doc restricts those to summary and category pages.
  // getHomepageFaqsCached, not the repository — MarketplaceHomepageView reads
  // the same list to render the FAQ section, and React.cache makes that one
  // Firestore read for the request tree instead of two. It also guarantees the
  // JSON-LD and the visible section are built from identical data, which Google
  // requires and which two independent queries could not promise.
  const homepageFaqs = await safeRead(() => getHomepageFaqsCached(), {
    route: "/",
    key: "homepage.faqJsonLd",
    fallback: [],
  });
  const ldFaqs = homepageFaqs.map((faq) => ({
    question: faq.question,
    answer: typeof faq.answer === "string" ? faq.answer : faq.answer.text,
  }));
  const ldFaq = ldFaqs.length > 0 ? faqJsonLd(ldFaqs) : null;

  return (
    <>
      <PageViewTracker entityType="homepage" entityId="homepage" url="/" />
      {ldFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }}
        />
      )}
      <MarketplaceHomepageView
        onBannerDismiss={dismissBannerAction}
        newsletterFormSlot={<HomepageNewsletterForm />}
        // One owner for site identity — the same appkit.config.js block the
        // root layout's SITE_IDENTITY reads.
        brand={{
          name: appkitConfig.brand?.name,
          shortName: appkitConfig.brand?.shortName,
        }}
        adSlots={{
          afterHero: <AfterHeroAdSlot />,
          afterFeaturedProducts: <AfterFeaturedProductsAdSlot />,
          afterReviews: <AfterReviewsAdSlot />,
          afterFAQ: <AfterFAQAdSlot />,
        }}
      />
    </>
  );
}