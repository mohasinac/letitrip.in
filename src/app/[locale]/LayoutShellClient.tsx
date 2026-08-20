"use client";
import { normalizeError } from "@mohasinac/appkit/client";

import type { ReactNode } from "react";
import { useMemo, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  ThemeProvider,
  buildThemeRegistry,
  isAdminUser,
  isSellerUser,
  useListingTypeFlags,
  useSession,
  useToast,
  useTour,
  ScamAwarenessModal,
  type AppLayoutShellProps,
  type MainNavbarItem,
  type SearchResourceType,
  type SearchResourceTypeOption,
  type SiteSettingsThemeInput,
} from "@mohasinac/appkit/client";
import { AdRuntimeInitializer } from "@/components";
import { FooterNewsletterSlot } from "@/components";
import { usePresence } from "@/lib/analytics/usePresence";
import { MAIN_NAV_ITEMS, SIDEBAR_SUPPORT_LINKS, FOOTER_LINK_GROUPS } from "@/constants/navigation";
import { BRAND, getBrandCopyright } from "@/constants/brand";
import { FOOTER_TRUST_BAR_ITEMS, FOOTER_SOCIAL_LINKS, FOOTER_BOTTOM_LINKS } from "@/constants/footer";
import { SEARCH_LABELS } from "@/constants/search";

import { Row } from "@mohasinac/appkit/client";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Map session user to the shape expected by AppLayoutShell. */
function buildShellUser(user: ReturnType<typeof import("@mohasinac/appkit/client").useSession>["user"]): AppLayoutShellProps["user"] {
  if (!user) return null;
  return {
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
  };
}

const SEARCH_RESOURCE_TYPES: SearchResourceTypeOption[] = [
  { value: "products",      label: "Products" },
  { value: "auctions",      label: "Auctions" },
  { value: "pre-orders",    label: "Pre-Orders" },
  { value: "prize-draws",   label: "Prize Draws" },
  { value: "bundles",       label: "Bundles" },
  { value: "classified",    label: "Classifieds" },
  { value: "digital-codes", label: "Digital Codes" },
  { value: "live",          label: "Live" },
  { value: "art",           label: "Art & Stickers" },
  { value: "stores",        label: "Stores" },
  { value: "categories",    label: "Categories" },
  { value: "brands",        label: "Brands" },
  { value: "events",        label: "Events" },
  { value: "blog",          label: "Blog" },
  { value: "faqs",          label: "FAQs" },
];

const SEARCH_ROUTE_MAP: Record<SearchResourceType, string> = {
  products:        "/products",
  auctions:        "/auctions",
  "pre-orders":    "/pre-orders",
  "prize-draws":   "/prize-draws",
  bundles:         "/bundles",
  classified:      "/classified",
  "digital-codes": "/digital-codes",
  live:            "/live",
  art:             "/art",
  stores:          "/stores",
  categories:      "/categories",
  brands:          "/brands",
  events:          "/events",
  blog:            "/blog",
  faqs:            "/faqs",
};

export default function LayoutShellClient({
  children,
  siteLogoUrl,
  siteSettingsTheme,
  siteSettingsBackground,
  navFeatureFlags,
}: {
  children: ReactNode;
  siteLogoUrl?: string;
  /**
   * Live `siteSettings.theme` document. Drives the registry-aware
   * `<ThemeProvider>` — admin-authored themes are merged with the two
   * built-ins and the active default is picked by user mode.
   */
  siteSettingsTheme?: SiteSettingsThemeInput;
  /** Live `siteSettings.background` document — passed through to `AppLayoutShell`'s `lightBackground`/`darkBackground` props. */
  siteSettingsBackground?: {
    light?: { type: "color" | "image" | "gradient" | "video"; value: string; overlay?: { enabled?: boolean; color?: string; opacity?: number } };
    dark?: { type: "color" | "image" | "gradient" | "video"; value: string; overlay?: { enabled?: boolean; color?: string; opacity?: number } };
  };
  /** P-1 feature flags — controls which public nav items are rendered. */
  navFeatureFlags?: {
    auctions?: boolean;
    preOrders?: boolean;
    prizeDraws?: boolean;
    events?: boolean;
    blog?: boolean;
    scams?: boolean;
  };
}) {
  const themeRegistry = useMemo(
    () => buildThemeRegistry(siteSettingsTheme),
    [siteSettingsTheme],
  );
  const tNav = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user, signOut } = useSession();
  const { showToast } = useToast();
  const { startTour } = useTour();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [scamModalDismissed, setScamModalDismissed] = useState(false);
  const tourRole = isAdminUser(user) ? "admin" : isSellerUser(user) ? "seller" : "buyer";
  const handleTourStart = useCallback(() => startTour(tourRole, pathname), [startTour, tourRole, pathname]);

  const searchLabels = SEARCH_LABELS;
  const listingTypeFlags = useListingTypeFlags();

  const handleLogout = useCallback(async () => {
    try {
      // signOut() clears UI state immediately, revokes server session, and signs
      // out of Firebase — covers the full logout flow.
      await signOut();
      // Clear per-user react-query caches so counts reset to 0 at once.
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast("Signed out successfully", "info");
      router.push(String(ROUTES.AUTH.LOGIN));
    } catch (_err) {
      void normalizeError(_err);
      showToast("Signed out", "info");
      router.push(String(ROUTES.AUTH.LOGIN));
    }
  }, [signOut, queryClient, router, showToast]);

  const navItems = useMemo<MainNavbarItem[]>(
    () =>
      MAIN_NAV_ITEMS
        // P-1: hide items behind feature flags (env-var gates passed from server layout).
        // W1-43: also hide listing-type items when the type is disabled in siteSettings.
        .filter((item) => {
          if (item.key === "auctions")   return (navFeatureFlags?.auctions ?? true) && listingTypeFlags.auction;
          if (item.key === "preOrders")  return (navFeatureFlags?.preOrders ?? true) && listingTypeFlags["pre-order"];
          if (item.key === "prizeDraws") return (navFeatureFlags?.prizeDraws ?? true) && listingTypeFlags["prize-draw"];
          if (item.key === "events")     return navFeatureFlags?.events ?? true;
          if (item.key === "blog")       return navFeatureFlags?.blog ?? true;
          if (item.key === "scams")      return navFeatureFlags?.scams ?? true;
          return true;
        })
        .map((item) => ({ ...item, label: tNav(item.key as Parameters<typeof tNav>[0]) })),
    [tNav, listingTypeFlags, navFeatureFlags],
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
        items: SIDEBAR_SUPPORT_LINKS,
      },
    ],
    [navItems],
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


  usePresence(user?.uid ?? null);

  const shellUser = buildShellUser(user);

  // Dashboard routes provide their own padding via DashboardLayoutClient;
  // remove the AppLayoutShell container constraint so content fills full width.
  const isDashboard = /\/(admin|store|user)(\/|$)/.test(pathname);

  const footer = useMemo<AppLayoutShellProps["footer"]>(() => {
    // Build-stamp injected via next.config.js → process.env (build-time inlined).
    // Lets you confirm a deploy without curling routes or rebuilding the audit.
    const appV = process.env.NEXT_PUBLIC_APP_VERSION ?? "";
    const appkitV = process.env.NEXT_PUBLIC_APPKIT_VERSION ?? "";
    const sha = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "";
    const versionParts = [
      appV ? `v${appV}` : "",
      appkitV && appkitV !== appV ? `appkit ${appkitV}` : "",
      sha ? `#${sha}` : "",
    ].filter(Boolean);
    const versionSuffix = versionParts.length > 0 ? ` · ${versionParts.join(" · ")}` : "";
    return {
      brandName: BRAND.NAME,
      brandDescription: BRAND.DESCRIPTION,
      copyrightText: `${getBrandCopyright()}${versionSuffix}`,
      madeInText: BRAND.MADE_IN_TEXT,
      showTrustBar: true,
      trustBarItems: FOOTER_TRUST_BAR_ITEMS,
      socialLinks: FOOTER_SOCIAL_LINKS,
      newsletterSlot: <FooterNewsletterSlot />,
      linkGroups: FOOTER_LINK_GROUPS,
      bottomLinks: FOOTER_BOTTOM_LINKS,
    };
  }, []);

  const showScamModal =
    !scamModalDismissed &&
    !!user &&
    !user.scamAwarenessAcknowledgedAt &&
    !!user.createdAt &&
    Date.now() - new Date(user.createdAt).getTime() < THIRTY_DAYS_MS;

  return (
    <ThemeProvider registry={themeRegistry}>
      <AdRuntimeInitializer />
      <AppLayoutShell
      onTourStart={handleTourStart}
      navItems={navItems}
      sidebarSections={sidebarSections}
      sidebarPrimaryActions={
        !user
          ? [
              { href: String(ROUTES.AUTH.LOGIN), label: tNav("login"), variant: "primary" },
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
      contentClassName={isDashboard ? "w-full" : undefined}
      {...(siteSettingsBackground?.light?.value ? { lightBackground: siteSettingsBackground.light } : {})}
      {...(siteSettingsBackground?.dark?.value ? { darkBackground: siteSettingsBackground.dark } : {})}
      searchSlotRenderer={(onClose) => (
        <Div border="default" className="border-b" surface="default">
          <Row paddingX="x-page" className="mx-auto w-full max-w-screen-xl" padding="y-xs" align="center" gap="sm">
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
          </Row>
        </Div>
      )}
    >
      <ScamAwarenessModal isOpen={showScamModal} onAcknowledged={() => setScamModalDismissed(true)} />
      {children}
      </AppLayoutShell>
      <NavigationLoader />
    </ThemeProvider>
  );
}
