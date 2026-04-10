"use client";

import { useTranslations } from "next-intl";
import { StoreNavTabs as AppkitStoreNavTabs } from "@mohasinac/appkit/features/stores";
import { SectionTabs } from "@/components";
import type { SectionTab } from "@/components";
import { ROUTES } from "@/constants";

interface StoreNavTabsProps {
  storeSlug: string;
}

export function StoreNavTabs({ storeSlug }: StoreNavTabsProps) {
  const t = useTranslations("storePage.tabs");

  const tabs = [
    {
      value: "products",
      label: t("products"),
      href: ROUTES.PUBLIC.STORE_PRODUCTS(storeSlug),
    },
    {
      value: "about",
      label: t("about"),
      href: ROUTES.PUBLIC.STORE_ABOUT(storeSlug),
    },
    {
      value: "auctions",
      label: t("auctions"),
      href: ROUTES.PUBLIC.STORE_AUCTIONS(storeSlug),
    },
    {
      value: "reviews",
      label: t("reviews"),
      href: ROUTES.PUBLIC.STORE_REVIEWS(storeSlug),
    },
  ];

  return (
    <AppkitStoreNavTabs
      tabs={tabs}
      renderTabBar={(tabs) => (
        <SectionTabs
          tabs={tabs.map(
            (tab) => ({ label: tab.label, href: tab.href }) as SectionTab,
          )}
          variant="user"
        />
      )}
    />
  );
}
