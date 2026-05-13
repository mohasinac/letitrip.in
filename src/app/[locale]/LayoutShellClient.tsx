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
  isAdminUser,
  useSession,
  useToast,
  ScamAwarenessModal,
  type AppLayoutShellProps,
  type MainNavbarItem,
  type SearchResourceType,
  type SearchResourceTypeOption,
} from "@mohasinac/appkit/client";
import { AdRuntimeInitializer } from "@/components/ads/AdRuntimeInitializer";
import { FooterNewsletterSlot } from "@/components/layout/FooterNewsletterSlot";
import { API_ROUTES } from "@/constants";
import { MAIN_NAV_ITEMS, SIDEBAR_SUPPORT_LINKS, FOOTER_LINK_GROUPS } from "@/constants/navigation";
import { BRAND, getBrandCopyright } from "@/constants/brand";
import { FOOTER_TRUST_BAR_ITEMS, FOOTER_SOCIAL_LINKS, FOOTER_BOTTOM_LINKS } from "@/constants/footer";
import { SEARCH_LABELS } from "@/constants/search";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const SEARCH_RESOURCE_TYPES: SearchResourceTypeOption[] = [
  { value: "products",    label: "Products" },
  { value: "auctions",    label: "Auctions" },
  { value: "pre-orders",  label: "Pre-Orders" },
  { value: "prize-draws", label: "Prize Draws" },
  { value: "bundles",     label: "Bundles" },
  { value: "stores",      label: "Stores" },
  { value: "categories",  label: "Categories" },
  { value: "brands",      label: "Brands" },
  { value: "events",      label: "Events" },
  { value: "blog",        label: "Blog" },
  { value: "faqs",        label: "FAQs" },
];

const SEARCH_ROUTE_MAP: Record<SearchResourceType, string> = {
  products:      "/products",
  auctions:      "/auctions",
  "pre-orders":  "/pre-orders",
  "prize-draws": "/prize-draws",
  bundles:       "/bundles",
  stores:        "/stores",
  categories:    "/categories",
  brands:        "/brands",
  events:        "/events",
  blog:          "/blog",
  faqs:          "/faqs",
};

export default function LayoutShellClient({
  children,
  seedPanelEnabled = true,
  siteLogoUrl,
  siteTheme,
}: {
  children: ReactNode;
  seedPanelEnabled?: boolean;
  siteLogoUrl?: string;
  siteTheme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    primaryDark?: string;
    secondaryDark?: string;
    accentDark?: string;
  };
}) {
  const tNav = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useSession();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [scamModalDismissed, setScamModalDismissed] = useState(false);

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
          ...(seedPanelEnabled && isAdminUser(user as { role?: import("@mohasinac/appkit").UserRole } | undefined)
            ? [{ href: String(ROUTES.DEMO.SEED), label: "Seed & Docs", icon: "🌱" }]
            : []),
        ],
      },
    ],
    [navItems, seedPanelEnabled, user],
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

  // Build CSS custom property blocks from admin-controlled theme colors.
  // `:root` carries light-mode overrides; `.dark` carries dark-mode overrides.
  // Dark-mode-specific keys (primaryDark etc.) are extracted to the .dark block;
  // light keys without a dark counterpart also appear in .dark as fallback.
  const themeStyle = (() => {
    if (!siteTheme) return null;
    const lightEntries: string[] = [];
    const darkEntries: string[] = [];
    const DARK_SUFFIX = "Dark";
    for (const [k, v] of Object.entries(siteTheme)) {
      if (!v) continue;
      if (k.endsWith(DARK_SUFFIX)) {
        const baseKey = k.slice(0, -DARK_SUFFIX.length);
        darkEntries.push(`--appkit-color-${baseKey}: ${v}`);
      } else {
        lightEntries.push(`--appkit-color-${k}: ${v}`);
        // fallback: if no dark variant provided, light value is reused in dark
        if (!(siteTheme as Record<string, string | undefined>)[k + DARK_SUFFIX]) {
          darkEntries.push(`--appkit-color-${k}: ${v}`);
        }
      }
    }
    const parts: string[] = [];
    if (lightEntries.length) parts.push(`:root { ${lightEntries.join("; ")} }`);
    if (darkEntries.length) parts.push(`.dark { ${darkEntries.join("; ")} }`);
    return parts.length ? parts.join("\n") : null;
  })();

  const showScamModal =
    !scamModalDismissed &&
    !!user &&
    !user.scamAwarenessAcknowledgedAt &&
    !!user.createdAt &&
    Date.now() - new Date(user.createdAt).getTime() < THIRTY_DAYS_MS;

  return (
    <Fragment>
      {themeStyle && <style>{themeStyle}</style>}
      <AdRuntimeInitializer />
      <ScamAwarenessModal isOpen={showScamModal} onAcknowledged={() => setScamModalDismissed(true)} />
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
      siteLogoUrl={siteLogoUrl}
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
      registerHref={String(ROUTES.AUTH.REGISTER)}
      homeHref={String(ROUTES.HOME)}
      shopHref={String(ROUTES.PUBLIC.PRODUCTS)}
      onLogout={handleLogout}
      showThemeToggle
      showThemeToggleInSidebar
      sidebarLocaleSlot={sidebarLocaleSlot}
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
