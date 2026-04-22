"use client";

import type { ReactNode } from "react";
import { Fragment, useMemo, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  AppLayoutShell,
  LocaleSwitcher,
  NotificationBell,
  NavigationLoader,
  ROUTES,
  Div,
  Button,
  Search,
  useSession,
  type AppLayoutShellProps,
  type MainNavbarItem,
  type SearchLabels,
} from "@mohasinac/appkit/client";
import Link from "next/link";

export default function LayoutShellClient({
  children,
}: {
  children: ReactNode;
}) {
  const tNav = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const searchLabels: SearchLabels = useMemo(() => ({
    placeholder: "Search products",
    title: "Search",
    closeAriaLabel: "Close search",
    quickLinks: "Quick links",
    searching: "Searching…",
    clearAriaLabel: "Clear search",
    ariaLabel: "Search",
    browseProducts: (query) => `Browse results for "${query}"`,
  }), []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push(String(ROUTES.AUTH.LOGIN));
    } catch {
      router.push(String(ROUTES.AUTH.LOGIN));
    }
  }, [router]);

  const navItems = useMemo<MainNavbarItem[]>(
    () => [
      { key: "home", href: String(ROUTES.HOME), label: tNav("home") },
      { key: "products", href: String(ROUTES.PUBLIC.PRODUCTS), label: tNav("products") },
      { key: "auctions", href: String(ROUTES.PUBLIC.AUCTIONS), label: tNav("auctions") },
      { key: "preOrders", href: String(ROUTES.PUBLIC.PRE_ORDERS), label: tNav("preOrders") },
      { key: "categories", href: String(ROUTES.PUBLIC.CATEGORIES), label: tNav("categories") },
      { key: "stores", href: String(ROUTES.PUBLIC.STORES), label: tNav("stores") },
      { key: "events", href: String(ROUTES.PUBLIC.EVENTS), label: tNav("events") },
      { key: "blog", href: String(ROUTES.PUBLIC.BLOG), label: tNav("blog") },
      { key: "reviews", href: String(ROUTES.PUBLIC.REVIEWS), label: tNav("reviews") },
    ],
    [tNav],
  );

  // Sidebar sections: BROWSE (nav items) + SUPPORT
  const sidebarSections = useMemo<AppLayoutShellProps["sidebarSections"]>(
    () => [
      {
        title: "Browse",
        items: navItems.map((item) => ({ href: item.href, label: item.label })),
      },
      {
        title: "Support",
        items: [
          { href: String(ROUTES.PUBLIC.ABOUT), label: "About" },
          { href: String(ROUTES.PUBLIC.CONTACT), label: "Contact" },
          { href: String(ROUTES.PUBLIC.HELP), label: "Help" },
        ],
      },
    ],
    [navItems],
  );

  // Locale switcher for sidebar
  const localeOptions = routing.locales.map((loc) => ({
    value: loc,
    label: loc.toUpperCase(),
  }));

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

  // Notification bell slot (only when authenticated)
  const notificationSlot = user ? (
    <NotificationBell
      viewAllHref={String(ROUTES.USER.NOTIFICATIONS)}
      labels={{
        title: "Notifications",
        unread: "unread",
        markAllRead: "Mark all read",
        empty: "No notifications",
        emptyDesc: "You're all caught up!",
        viewAll: "View all",
        markRead: "Mark read",
        viewAction: "View",
        loading: "Loading…",
        error: "Failed to load notifications",
      }}
      renderLink={({ href, children: linkChildren, onClick, className }) => (
        <Link href={href} onClick={onClick} className={className}>
          {linkChildren}
        </Link>
      )}
    />
  ) : undefined;

  // Dev/seed slot — only for admin users in non-production
  const devSlot =
    user?.role === "admin" && process.env.NODE_ENV !== "production" ? (
      <Link
        href={String(ROUTES.DEMO.SEED)}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
        title="Seed data"
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

  const footer = {
    brandName: "LetiTrip",
    brandDescription:
      "Marketplace for curated products, trusted sellers, and collector-first experiences.",
    socialLinks: [],
    linkGroups: [
      {
        heading: "Explore",
        links: [
          { label: "Products", href: String(ROUTES.PUBLIC.PRODUCTS) },
          { label: "Blog", href: String(ROUTES.PUBLIC.BLOG) },
          { label: "Events", href: String(ROUTES.PUBLIC.EVENTS) },
        ],
      },
      {
        heading: "Company",
        links: [
          { label: "About", href: String(ROUTES.PUBLIC.ABOUT) },
          { label: "Contact", href: String(ROUTES.PUBLIC.CONTACT) },
          { label: "Help", href: String(ROUTES.PUBLIC.HELP) },
        ],
      },
      {
        heading: "Account",
        links: [
          { label: "Login", href: String(ROUTES.AUTH.LOGIN) },
          { label: "Register", href: String(ROUTES.AUTH.REGISTER) },
          { label: "Wishlist", href: String(ROUTES.USER.WISHLIST) },
        ],
      },
    ],
    copyrightText: `Copyright ${new Date().getFullYear()} LetiTrip`,
    madeInText: "Built with AppKit",
    showTrustBar: false,
  };

  return (
    <Fragment>
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
      brandName="LetiTrip"
      brandShortName="LT"
      logoHref={String(ROUTES.HOME)}
      promotionsHref={String(ROUTES.PUBLIC.PROMOTIONS)}
      cartHref={String(ROUTES.USER.CART)}
      profileHref={String(ROUTES.USER.PROFILE)}
      userOrdersHref={String(ROUTES.USER.ORDERS)}
      userWishlistHref={String(ROUTES.USER.WISHLIST)}
      userSettingsHref={String(ROUTES.USER.SETTINGS)}
      adminHref={String(ROUTES.ADMIN.DASHBOARD)}
      sellerHref={String(ROUTES.SELLER.DASHBOARD)}
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
        sellerDashboard: tNav("sellerDashboard"),
        logout: tNav("logout"),
      }}
      footer={footer}
      searchSlotRenderer={(onClose) => (
        <Div className="border-b border-zinc-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
          <Div className="mx-auto flex w-full max-w-screen-xl items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(query) => {
                router.push(
                  query.trim()
                    ? `${String(ROUTES.PUBLIC.PRODUCTS)}?search=${encodeURIComponent(query.trim())}`
                    : String(ROUTES.PUBLIC.PRODUCTS),
                );
                onClose();
              }}
              deferred
              router={{ push: (href) => router.push(href) }}
              labels={searchLabels}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Close search"
              onClick={onClose}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
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
