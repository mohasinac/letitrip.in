"use client";

import { useTranslations } from "next-intl";
import { useStores } from "@mohasinac/appkit/features/stores";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { InteractiveStoreCard } from "@/components/stores";
import { SectionCarousel } from "@mohasinac/appkit/features/homepage";

export function FeaturedStoresSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { stores, isLoading } = useStores({ pageSize: 12, sort: "-createdAt" });

  if (!isLoading && stores.length === 0) return null;

  return (
    <SectionCarousel
      title={t("featuredStores")}
      description={t("featuredStoresSubtitle")}
      headingVariant="editorial"
      pillLabel={t("storesPill")}
      viewMoreHref={ROUTES.PUBLIC.STORES}
      viewMoreLabel={tActions("viewAllArrow")}
      items={stores}
      renderItem={(store) => <InteractiveStoreCard store={store} />}
      perView={{ base: 2, sm: 3, md: 4 }}
      gap={12}
      autoScroll
      autoScrollInterval={4500}
      keyExtractor={(s) => s.id}
      isLoading={isLoading}
      skeletonCount={5}
      className="bg-gradient-to-br from-zinc-100 via-zinc-50 to-slate-100 dark:from-zinc-900 dark:via-slate-900 dark:to-zinc-950"
    />
  );
}
