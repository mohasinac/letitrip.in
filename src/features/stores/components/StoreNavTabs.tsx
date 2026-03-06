"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Nav, Span, TextLink } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { classNames } from "@/helpers";
import { useStoreBySlug } from "../hooks";

const { themed, overflow, position, page, flex } = THEME_CONSTANTS;

interface StoreNavTabsProps {
  storeSlug: string;
}

export function StoreNavTabs({ storeSlug }: StoreNavTabsProps) {
  const t = useTranslations("storePage.tabs");
  const pathname = usePathname();
  const { data: store } = useStoreBySlug(storeSlug);

  const tabs = [
    {
      id: "products",
      label: t("products"),
      href: ROUTES.PUBLIC.STORE_PRODUCTS(storeSlug),
      count: store?.totalProducts,
    },
    {
      id: "auctions",
      label: t("auctions"),
      href: ROUTES.PUBLIC.STORE_AUCTIONS(storeSlug),
      count: undefined, // no count available yet
    },
    {
      id: "reviews",
      label: t("reviews"),
      href: ROUTES.PUBLIC.STORE_REVIEWS(storeSlug),
      count: store?.totalReviews,
    },
    {
      id: "about",
      label: t("about"),
      href: ROUTES.PUBLIC.STORE_ABOUT(storeSlug),
      count: undefined,
    },
  ];

  return (
    <div
      className={`${themed.bgPrimary} border-b ${themed.border} ${position.stickyTop} z-10`}
    >
      <div className={`${page.container.wide}`}>
        <Nav
          className={`flex gap-0 ${overflow.xAuto}`}
          aria-label={t("navAriaLabel")}
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
                  `${flex.rowCenter} gap-2`,
                  isActive
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
                {typeof tab.count === "number" && (
                  <Span
                    className={classNames(
                      "inline-flex items-center justify-center min-w-[1.375rem] h-[1.375rem] px-1.5 rounded-full text-xs font-semibold leading-none",
                      isActive
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
                    )}
                  >
                    {tab.count}
                  </Span>
                )}
              </TextLink>
            );
          })}
        </Nav>
      </div>
    </div>
  );
}
