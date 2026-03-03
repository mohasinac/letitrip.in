"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Nav, TextLink } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { classNames } from "@/helpers";

const { themed, overflow, position, page } = THEME_CONSTANTS;

interface StoreNavTabsProps {
  storeSlug: string;
}

export function StoreNavTabs({ storeSlug }: StoreNavTabsProps) {
  const t = useTranslations("storePage.tabs");
  const pathname = usePathname();

  const tabs = [
    {
      id: "products",
      label: t("products"),
      href: ROUTES.PUBLIC.STORE_PRODUCTS(storeSlug),
    },
    {
      id: "auctions",
      label: t("auctions"),
      href: ROUTES.PUBLIC.STORE_AUCTIONS(storeSlug),
    },
    {
      id: "reviews",
      label: t("reviews"),
      href: ROUTES.PUBLIC.STORE_REVIEWS(storeSlug),
    },
    {
      id: "about",
      label: t("about"),
      href: ROUTES.PUBLIC.STORE_ABOUT(storeSlug),
    },
  ];

  return (
    <div
      className={`${themed.bgPrimary} border-b ${themed.border} ${position.stickyTop} z-10`}
    >
      <div className={`${page.container.wide}`}>
        <Nav
          className={`flex gap-0 ${overflow.xAuto}`}
          aria-label="Store sections"
        >
          {tabs.map((tab) => {
            const isActive =
              pathname.endsWith(`/${tab.id}`) || pathname === tab.href;
            return (
              <TextLink
                key={tab.id}
                href={tab.href}
                className={classNames(
                  "whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  isActive
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </TextLink>
            );
          })}
        </Nav>
      </div>
    </div>
  );
}
