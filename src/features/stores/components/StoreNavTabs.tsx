"use client";

import { useTranslations } from "next-intl";
import { SectionTabs } from "@/components";
import type { SectionTab } from "@/components";
import { ROUTES } from "@/constants";

interface StoreNavTabsProps {
  storeSlug: string;
}

export function StoreNavTabs({ storeSlug }: StoreNavTabsProps) {
  const t = useTranslations("storePage.tabs");

  const tabs: readonly SectionTab[] = [
    { label: t("products"), href: ROUTES.PUBLIC.STORE_PRODUCTS(storeSlug) },
    { label: t("about"), href: ROUTES.PUBLIC.STORE_ABOUT(storeSlug) },
    { label: t("auctions"), href: ROUTES.PUBLIC.STORE_AUCTIONS(storeSlug) },
    { label: t("reviews"), href: ROUTES.PUBLIC.STORE_REVIEWS(storeSlug) },
  ];

  return <SectionTabs tabs={tabs} variant="user" />;
}
