import { StoreHeader } from "@/features/stores/components";
import { StoreNavTabs } from "@mohasinac/appkit/features/stores";
import { ROUTES } from "@/constants";
import { THEME_CONSTANTS } from "@/constants";
import { Main } from "@mohasinac/appkit/ui";
import { getTranslations } from "next-intl/server";

const { page } = THEME_CONSTANTS;

interface StoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; storeSlug: string }>;
}

export default async function StoreLayout({
  children,
  params,
}: StoreLayoutProps) {
  const { storeSlug } = await params;
  const t = await getTranslations("storePage.tabs");

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
    <div className="min-h-screen flex flex-col">
      <StoreHeader storeSlug={storeSlug} />
      <StoreNavTabs tabs={tabs} />
      <Main className={`flex-1 ${page.container.wide} w-full py-6 sm:py-8`}>
        {children}
      </Main>
    </div>
  );
}
