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
import { AdRuntimeInitializer } from "@/components/ads/AdRuntimeInitializer";

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
      {
        key: "home",
        href: String(ROUTES.HOME),
        label: tNav("home"),
        icon: <span aria-hidden="true">🏠</span>,
      },
      {
        key: "products",
        href: String(ROUTES.PUBLIC.PRODUCTS),
        label: tNav("products"),
        icon: <span aria-hidden="true">🛍️</span>,
      },
      {
        key: "auctions",
        href: String(ROUTES.PUBLIC.AUCTIONS),
        label: tNav("auctions"),
        icon: <span aria-hidden="true">⚡</span>,
      },
      {
        key: "preOrders",
        href: String(ROUTES.PUBLIC.PRE_ORDERS),
        label: tNav("preOrders"),
        icon: <span aria-hidden="true">📦</span>,
      },
      {
        key: "categories",
        href: String(ROUTES.PUBLIC.CATEGORIES),
        label: tNav("categories"),
        icon: <span aria-hidden="true">🧭</span>,
      },
      {
        key: "stores",
        href: String(ROUTES.PUBLIC.STORES),
        label: tNav("stores"),
        icon: <span aria-hidden="true">🏬</span>,
      },
      {
        key: "events",
        href: String(ROUTES.PUBLIC.EVENTS),
        label: tNav("events"),
        icon: <span aria-hidden="true">🎟️</span>,
      },
      {
        key: "blog",
        href: String(ROUTES.PUBLIC.BLOG),
        label: tNav("blog"),
        icon: <span aria-hidden="true">📝</span>,
      },
      {
        key: "reviews",
        href: String(ROUTES.PUBLIC.REVIEWS),
        label: tNav("reviews"),
        icon: <span aria-hidden="true">⭐</span>,
      },
    ],
    [tNav],
  );

  // Sidebar sections: BROWSE (nav items) + SUPPORT
  const sidebarSections = useMemo<AppLayoutShellProps["sidebarSections"]>(
    () => [
      {
        title: "Browse",
        items: navItems.map((item) => ({
          href: item.href,
          label: item.label,
          icon: item.icon,
        })),
      },
      {
        title: "Support",
        items: [
          { href: String(ROUTES.PUBLIC.ABOUT), label: "About" },
          { href: String(ROUTES.PUBLIC.CONTACT), label: "Contact" },
          { href: String(ROUTES.PUBLIC.HELP), label: "Help" },
          ...(process.env.NODE_ENV !== "production"
            ? [{ href: String(ROUTES.DEMO.SEED), label: "Seed Data", icon: "🌱" }]
            : []),
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
    process.env.NODE_ENV !== "production" ? (
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

  const footer: AppLayoutShellProps["footer"] = {
    brandName: "LetItRip",
    brandDescription:
      "India's collector-first marketplace for figures, TCG gear, cosplay, and curated collectibles. Trusted sellers, authentic products.",
    copyrightText: `© ${new Date().getFullYear()} LetItRip. All rights reserved.`,
    madeInText: "Made with ♥ for collectors",
    showTrustBar: true,
    trustBarItems: [
      {
        id: "shipping",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        ),
        label: "Free Shipping",
        subtitle: "On orders above ₹999",
        visible: true,
      },
      {
        id: "returns",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        label: "Easy Returns",
        subtitle: "7-day hassle-free returns",
        visible: true,
      },
      {
        id: "secure",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        label: "Secure Payments",
        subtitle: "256-bit SSL encryption",
        visible: true,
      },
      {
        id: "support",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        label: "24/7 Support",
        subtitle: "Here to help anytime",
        visible: true,
      },
      {
        id: "authentic",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        label: "100% Authentic",
        subtitle: "Verified sellers & products",
        visible: true,
      },
    ],
    socialLinks: [
      {
        platform: "instagram",
        href: "https://instagram.com/letitrip.in",
        ariaLabel: "Follow us on Instagram",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        ),
      },
      {
        platform: "twitter",
        href: "https://twitter.com/letitrip_in",
        ariaLabel: "Follow us on X (Twitter)",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      },
      {
        platform: "whatsapp",
        href: "https://wa.me/c/917000000000",
        ariaLabel: "Join our WhatsApp community",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        ),
      },
    ],
    newsletterSlot: (
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-2"
      >
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Get deals & drops in your inbox
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 min-w-0 rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="flex-shrink-0 rounded-lg bg-primary-500 hover:bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Subscribe
          </button>
        </div>
      </form>
    ),
    linkGroups: [
      {
        heading: "Shop",
        links: [
          { label: "Products", href: String(ROUTES.PUBLIC.PRODUCTS) },
          { label: "Auctions", href: String(ROUTES.PUBLIC.AUCTIONS) },
          { label: "Pre-Orders", href: String(ROUTES.PUBLIC.PRE_ORDERS) },
          { label: "Promotions", href: String(ROUTES.PUBLIC.PROMOTIONS) },
          { label: "Stores", href: String(ROUTES.PUBLIC.STORES) },
          { label: "Categories", href: String(ROUTES.PUBLIC.CATEGORIES) },
        ],
      },
      {
        heading: "Support",
        links: [
          { label: "Help Centre", href: String(ROUTES.PUBLIC.HELP) },
          { label: "FAQs", href: String(ROUTES.PUBLIC.FAQS) },
          { label: "Contact Us", href: String(ROUTES.PUBLIC.CONTACT) },
          { label: "Track Order", href: String(ROUTES.PUBLIC.TRACK_ORDER) },
          { label: "About Us", href: String(ROUTES.PUBLIC.ABOUT) },
        ],
      },
      {
        heading: "For Sellers",
        links: [
          { label: "Become a Seller", href: String(ROUTES.USER.BECOME_SELLER) },
          { label: "Seller Guide", href: String(ROUTES.PUBLIC.SELLER_GUIDE) },
          { label: "Fees & Pricing", href: String(ROUTES.PUBLIC.FEES) },
          { label: "How Payouts Work", href: String(ROUTES.PUBLIC.HOW_PAYOUTS_WORK) },
          { label: "Seller Dashboard", href: String(ROUTES.SELLER.DASHBOARD) },
        ],
      },
      {
        heading: "Learn",
        links: [
          { label: "How Auctions Work", href: String(ROUTES.PUBLIC.HOW_AUCTIONS_WORK) },
          { label: "How Pre-Orders Work", href: String(ROUTES.PUBLIC.HOW_PRE_ORDERS_WORK) },
          { label: "How Offers Work", href: String(ROUTES.PUBLIC.HOW_OFFERS_WORK) },
          { label: "Blog", href: String(ROUTES.PUBLIC.BLOG) },
          { label: "Events", href: String(ROUTES.PUBLIC.EVENTS) },
        ],
      },
      {
        heading: "Legal",
        links: [
          { label: "Terms of Service", href: String(ROUTES.PUBLIC.TERMS) },
          { label: "Privacy Policy", href: String(ROUTES.PUBLIC.PRIVACY) },
          { label: "Cookie Policy", href: String(ROUTES.PUBLIC.COOKIE_POLICY) },
          { label: "Refund Policy", href: String(ROUTES.PUBLIC.REFUND_POLICY) },
          { label: "Shipping Policy", href: String(ROUTES.PUBLIC.SHIPPING_POLICY) },
        ],
      },
    ],
  };

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
