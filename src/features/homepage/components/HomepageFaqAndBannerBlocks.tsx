"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useHomepageSections } from "@/hooks";
import { ROUTES, FAQ_CATEGORIES } from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import type { BannerSectionConfig } from "@/db/schema";
import {
  AdvertisementBanner,
  FAQSection,
  type FAQItem,
  type FAQTab,
} from "@mohasinac/appkit/features/homepage";
import { useFaqList } from "@mohasinac/appkit/features/faq";
import { TabStrip } from "@mohasinac/appkit/ui";

export function HomepageFaqAndBannerBlocks() {
  const tHomepage = useTranslations("homepage");
  const tFaq = useTranslations("faq");
  const router = useRouter();
  const [activeCategory, setActiveCategory] =
    useState<FAQCategoryKey>("general");

  const { data, isLoading } = useHomepageSections(
    "type=advertisement&enabled=true&limit=1",
  );

  const { faqs, total } = useFaqList({
    category: activeCategory,
    showOnHomepage: true,
    sorts: "-priority,order",
    page: 1,
    pageSize: 10,
  });

  const bannerSection = data?.[0];
  const banner = bannerSection?.config as BannerSectionConfig | undefined;
  const hasCmsData = bannerSection && banner?.content;

  const tabs: FAQTab[] = (
    Object.entries(FAQ_CATEGORIES) as [
      FAQCategoryKey,
      (typeof FAQ_CATEGORIES)[FAQCategoryKey],
    ][]
  ).map(([key, cat]) => ({
    value: key,
    label: cat.label,
    icon: cat.icon,
  }));

  const items: FAQItem[] = faqs.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: typeof faq.answer === "string" ? faq.answer : faq.answer.text,
  }));

  return (
    <>
      <AdvertisementBanner
        title={hasCmsData ? banner!.content!.title : tHomepage("bannerFallbackTitle")}
        subtitle={
          hasCmsData
            ? (banner!.content!.subtitle ?? "")
            : tHomepage("bannerFallbackSubtitle")
        }
        ctaLabel={
          hasCmsData
            ? (banner?.buttons?.[0]?.text ?? tHomepage("bannerFallbackCta"))
            : tHomepage("bannerFallbackCta")
        }
        onCtaClick={() => {
          const href = hasCmsData
            ? (banner?.buttons?.[0]?.link ?? ROUTES.PUBLIC.PRODUCTS)
            : ROUTES.PUBLIC.PRODUCTS;
          router.push(href);
        }}
        backgroundImage={hasCmsData ? banner?.backgroundImage : undefined}
        tagLabel={banner?.content?.title ? tHomepage("bannerTag") : undefined}
        isLoading={isLoading}
      />

      <FAQSection
        title={tFaq("title")}
        subtitle={tFaq("subtitle")}
        tabs={tabs}
        activeTab={activeCategory}
        onTabChange={(v) => {
          setActiveCategory(v as FAQCategoryKey);
        }}
        items={items}
        viewMoreHref={ROUTES.PUBLIC.FAQS}
        viewMoreLabel={tFaq("viewAllFaqs")}
        hasMore={total > faqs.length}
        moreCount={total - faqs.length}
        renderTabs={() => (
          <TabStrip
            activeKey={activeCategory}
            onChange={(v) => setActiveCategory(v as FAQCategoryKey)}
            tabs={tabs.map((tab) => ({
              key: tab.value,
              label: `${tab.icon ? `${tab.icon} ` : ""}${tab.label}`,
            }))}
          />
        )}
      />
    </>
  );
}
