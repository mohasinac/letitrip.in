"use client";

import { useTranslations } from "next-intl";
import { useFeaturedStores } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { StoreCard } from "@/components";
import { SectionCarousel } from "./SectionCarousel";

export function FeaturedStoresSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedStores();

  const stores = data?.items ?? [];

  if (!isLoading && stores.length === 0) return null;

  return (
    <SectionCarousel
      title={t("featuredStores")}
      description={t("featuredStoresSubtitle")}
      headingVariant="editorial"
      pillLabel={t("storesPill")}
      lightText
      viewMoreHref={ROUTES.PUBLIC.STORES}
      viewMoreLabel={tActions("viewAllArrow")}
      items={stores}
      renderItem={(store) => <StoreCard store={store} />}
      perView={{ base: 2, sm: 3, md: 4, xl: 5 }}
      gap={12}
      autoScroll
      autoScrollInterval={4500}
      keyExtractor={(s) => s.id}
      isLoading={isLoading}
      skeletonCount={5}
      className="bg-slate-950"
    />
  );
}
