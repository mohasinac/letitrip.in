"use client";

import type { ReactNode } from "react";
import { Fragment, useMemo, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  AppLayoutShell,
  LocaleSwitcher,
  NavigationLoader,
  ROUTES,
  Div,
  Search,
  useSession,
  useToast,
  type AppLayoutShellProps,
  type MainNavbarItem,
  type SearchResourceType,
  type SearchResourceTypeOption,
} from "@mohasinac/appkit/client";
import Link from "next/link";
import { AdRuntimeInitializer } from "@/components/ads/AdRuntimeInitializer";
import { FooterNewsletterSlot } from "@/components/layout/FooterNewsletterSlot";
import { API_ROUTES } from "@/constants";
import { MAIN_NAV_ITEMS, SIDEBAR_SUPPORT_LINKS, FOOTER_LINK_GROUPS } from "@/constants/navigation";
import { BRAND, getBrandCopyright } from "@/constants/brand";
import { FOOTER_TRUST_BAR_ITEMS, FOOTER_SOCIAL_LINKS, FOOTER_BOTTOM_LINKS } from "@/constants/footer";
import { SEARCH_LABELS } from "@/constants/search";

const SEARCH_RESOURCE_TYPES: SearchResourceTypeOption[] = [
  { value: "products",   label: "Products" },
  { value: "auctions",   label: "Auctions" },
  { value: "pre-orders", label: "Pre-Orders" },
  { value: "stores",     label: "Stores" },
  { value: "categories", label: "Categories" },
  { value: "brands",     label: "Brands" },
  { value: "events",     label: "Events" },
  { value: "blog",       label: "Blog" },
  { value: "faqs",       label: "FAQs" },
];

const SEARCH_ROUTE_MAP: Record<SearchResourceType, string> = {
  products:     "/products",
  auctions:     "/auctions",
  "pre-orders": "/pre-orders",
  stores:       "/stores",
  categories:   "/categories",
  brands:       "/brands",
  events:       "/events",
  blog:         "/blog",
  faqs:         "/faqs",
};

export default function LayoutShellClient({
  children,
  seedPanelEnabled = false,
}: {
  children: ReactNode;
  seedPanelEnabled?: boolean;
}) {
  const tNav = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useSession();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const searchLabels = SEARCH_LABELS;

  const handleLogout = useCallback(async () => {
    try {
      await fetch(API_ROUTES.AUTH.LOGOUT, {
        method: "POST",
        credentials: "include",
      });
      showToast("Signed out successfully", "info");
      router.push(String(ROUTES.AUTH.LOGIN));
    } catch {
      showToast("Signed out", "info");
      router.push(String(ROUTES.AUTH.LOGIN));
    }
  }, [router, showToast]);

  const navItems = useMemo<MainNavbarItem[]>(
    () => MAIN_NAV_ITEMS.map((item) => ({ ...item, label: tNav(item.key as Parameters<typeof tNav>[0]) })),
    [tNav],
  );

  // Sidebar sections: BROWSE (nav items) + SUPPORT
  const sidebarSections = useMemo<AppLayoutShellProps["sidebarSections"]>(
    () => [
      {
        title: "Browse",
        defaultOpen: true,
        items: navItems.map((item) => ({ href: item.href, label: item.label, icon: item.icon })),
      },
      {
        title: "Support",
        items: [
          ...SIDEBAR_SUPPORT_LINKS,
          ...(seedPanelEnabled
            ? [{ href: String(ROUTES.DEMO.SEED), label: "Seed & Docs", icon: "🌱" }]
            : []),
        ],
      },
    ],
    [navItems, seedPanelEnabled],
  );

  // Locale switcher for sidebar
  const localeOptions = useMemo(
    () => routing.locales.map((loc) => ({ value: loc, label: loc.toUpperCase() })),
    [],
  );

  const sidebarLocaleSlot =
    routing.locales.length > 1 ? (
      <LocaleSwitcher
        locale={locale}
        options={localeOptions}
        onChange={(newLocale) => {
          router.push(pathname, { locale: newLocale });
        }}
        ariaLabel="Switch language"
      />
    ) : null;

  // Wishlist heart icon (always visible, guests + authenticated)
  const wishlistIcon = (
    <Link
      href={String(ROUTES.USER.WISHLIST)}
      aria-label="Wishlist"
      className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-slate-800 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </Link>
  );

  // Notification bell hidden per product decision — only show wishlist
  const notificationSlot = <>{wishlistIcon}</>;

  // Seed & Docs slot — visible to everyone when seedPanel feature flag is enabled
  const devSlot =
    seedPanelEnabled ? (
      <Link
        href={String(ROUTES.DEMO.SEED)}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
        title="Seed & Docs"
      >
        🌱 Seed
      </Link>
    ) : undefined;

  const shellUser: AppLayoutShellProps["user"] = user
    ? {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        avatarMetadata: user.avatarMetadata
          ? {
              url: user.avatarMetadata.url,
              position: user.avatarMetadata.position ?? { x: 50, y: 50 },
              zoom: user.avatarMetadata.zoom ?? 1,
            }
          : null,
        stats: user.stats
          ? {
              totalOrders: user.stats.totalOrders as number | undefined,
              auctionsWon: user.stats.auctionsWon as number | undefined,
              itemsSold: user.stats.itemsSold as number | undefined,
              reviewsCount: user.stats.reviewsCount as number | undefined,
              rating: user.stats.rating as number | undefined,
            }
          : null,
      }
    : null;

  const footer = useMemo<AppLayoutShellProps["footer"]>(() => ({
    brandName: BRAND.NAME,
    brandDescription: BRAND.DESCRIPTION,
    copyrightText: getBrandCopyright(),
    madeInText: BRAND.MADE_IN_TEXT,
    showTrustBar: true,
    trustBarItems: FOOTER_TRUST_BAR_ITEMS,
    socialLinks: FOOTER_SOCIAL_LINKS,
    newsletterSlot: <FooterNewsletterSlot />,
    linkGroups: FOOTER_LINK_GROUPS,
    bottomLinks: FOOTER_BOTTOM_LINKS,
  }), []);

  return (
    <Fragment>
    <AdRuntimeInitializer />
    <AppLayoutShell
      navItems={navItems}
      sidebarSections={sidebarSections}
      sidebarPrimaryActions={
        !user
          ? [
              { href: String(ROUTES.AUTH.LOGIN), label: tNav("login"), variant: "solid" },
              { href: String(ROUTES.AUTH.REGISTER), label: tNav("register"), variant: "outline" },
            ]
          : []
      }
      sidebarTitle="Menu"
      user={shellUser}
      brandName={BRAND.NAME}
      brandShortName={BRAND.SHORT_NAME}
      logoHref={String(ROUTES.HOME)}
      promotionsHref={String(ROUTES.PUBLIC.PROMOTIONS)}
      cartHref={String(ROUTES.USER.CART)}
      wishlistHref={String(ROUTES.USER.WISHLIST)}
      userId={user?.uid ?? null}
      profileHref={String(ROUTES.USER.PROFILE)}
      userOrdersHref={String(ROUTES.USER.ORDERS)}
      userWishlistHref={String(ROUTES.USER.WISHLIST)}
      userSettingsHref={String(ROUTES.USER.SETTINGS)}
      adminHref={String(ROUTES.ADMIN.DASHBOARD)}
      storeHref={String(ROUTES.STORE.DASHBOARD)}
      loginHref={String(ROUTES.AUTH.LOGIN)}
      homeHref={String(ROUTES.HOME)}
      shopHref={String(ROUTES.PUBLIC.PRODUCTS)}
      onLogout={handleLogout}
      showThemeToggle
      showThemeToggleInSidebar
      sidebarLocaleSlot={sidebarLocaleSlot}
      titleBarNotificationSlot={notificationSlot}
      titleBarDevSlot={devSlot}
      sidebarProfileLabels={{
        sectionTitle: tNav("profile"),
        profile: tNav("myProfile"),
        orders: tNav("myOrders"),
        wishlist: tNav("wishlist"),
        settings: tNav("settings"),
        dashboardSectionTitle: tNav("dashboard"),
        adminDashboard: tNav("adminDashboard"),
        storeDashboard: tNav("storeDashboard"),
        logout: tNav("logout"),
      }}
      footer={footer}
      searchSlotRenderer={(onClose) => (
        <Div className="border-b border-zinc-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
          <Div className="mx-auto flex w-full max-w-screen-xl items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(query, type) => {
                const base = SEARCH_ROUTE_MAP[type] ?? String(ROUTES.PUBLIC.PRODUCTS);
                router.push(
                  query.trim()
                    ? `${base}?q=${encodeURIComponent(query.trim())}`
                    : base,
                );
                onClose();
              }}
              deferred
              router={{ push: (href) => router.push(href) }}
              labels={searchLabels}
              resourceTypes={SEARCH_RESOURCE_TYPES}
              storageKey="letitrip_search_type"
              className="flex-1"
            />
          </Div>
        </Div>
      )}
    >
      {children}
    </AppLayoutShell>
    <NavigationLoader />
    </Fragment>
  );
}
