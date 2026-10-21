"use client";
import { normalizeError } from "@mohasinac/appkit/client";

import type { ReactNode } from "react";
import { Suspense, useMemo, useCallback, useState } from "react";
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
  Stack,
  Search,
  ThemeProvider,
  HandModeProvider,
  buildThemeRegistry,
  isAdminUser,
  isSellerUser,
  useListingTypeFlags,
  useSession,
  useSiteSettings,
  useUnreadMessageCount,
  useToast,
  ScamAwarenessModal,
  type AppLayoutShellProps,
  type ListingType,
  type MainNavbarItem,
  type SearchResourceType,
  type SearchResourceTypeOption,
  type SiteSettingsThemeInput,
  type PublicSiteSettings,
} from "@mohasinac/appkit/client";
import { AdRuntimeInitializer } from "@/components";
import { FooterNewsletterSlot, FooterBadgesSlot } from "@/components";
import {
  MAIN_NAV_ITEMS,
  SIDEBAR_SUPPORT_LINKS,
  FOOTER_LINK_GROUPS,
  FOOTER_LINK_LISTING_TYPES,
} from "@/constants/navigation";
import { BRAND, getBrandCopyright } from "@/constants/brand";
import {
  FOOTER_TRUST_BAR_ITEMS,
  FOOTER_SOCIAL_LINKS,
  FOOTER_BOTTOM_LINKS,
} from "@/constants/footer";
import { SEARCH_LABELS } from "@/constants/search";

import { Row } from "@mohasinac/appkit/client";
import { Search as Search2Icon } from "lucide-react";
import { projectActionIndexForViewer } from "@mohasinac/appkit/client";
import type { SearchQuickLink } from "@mohasinac/appkit/client";
import { ACTION_INDEX_BASE } from "@/constants/action-index";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Map session user to the shape expected by AppLayoutShell. */
function buildShellUser(
  user: ReturnType<
    typeof import("@mohasinac/appkit/client").useSession
  >["user"],
): AppLayoutShellProps["user"] {
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
  { value: "products", label: "Products" },
  { value: "auctions", label: "Auctions" },
  { value: "pre-orders", label: "Pre-Orders" },
  { value: "prize-draws", label: "Prize Draws" },
  { value: "bundles", label: "Bundles" },
  { value: "classified", label: "Classifieds" },
  { value: "digital-codes", label: "Digital Codes" },
  { value: "live", label: "Live" },
  { value: "art", label: "Art & Stickers" },
  { value: "stores", label: "Stores" },
  { value: "categories", label: "Categories" },
  { value: "brands", label: "Brands" },
  { value: "events", label: "Events" },
  { value: "blog", label: "Blog" },
  { value: "faqs", label: "FAQs" },
];

/*
 * 🛑 `SEARCH_ROUTE_MAP` was DELETED here, deliberately, and must not come back.
 *
 * It mapped each of the 15 `SearchResourceType` values to a browse route so
 * the header could redirect to one of them. That is the behaviour `/search`
 * replaced — the redirect was never removed, it was moved into this file —
 * and leaving a correct-looking, unreferenced map in place is an invitation
 * to wire it up again.
 *
 * It was also a hand-written enumeration of the listing-type union, which the
 * plugin registry already owns: nine of those fifteen entries duplicated
 * `pluginFor(t).browseRoute` (CLAUDE.md § "Browse chrome lives on the plugin
 * — never in a hand-written list", Root Cause #61).
 *
 * Per-type destinations still exist, in the one place they belong: each
 * group's `moreHref` in `search-sources.ts`, rendered as "See all X →" next
 * to that group's results.
 *
 * `scripts/audit-search-entry-points.mjs` R3 fails if a map of this shape
 * reappears.
 */

export default function LayoutShellClient({
  children,
  siteLogoUrl,
  siteSettingsTheme,
  siteSettingsBackground,
  searchIndexEnabled,
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
    light?: {
      type: "color" | "image" | "gradient" | "video";
      value: string;
      overlay?: { enabled?: boolean; color?: string; opacity?: number };
    };
    dark?: {
      type: "color" | "image" | "gradient" | "video";
      value: string;
      overlay?: { enabled?: boolean; color?: string; opacity?: number };
    };
  };
  /**
   * `siteSettings.search.indexEnabled`, already normalised to a boolean by
   * the layout. Forwarded to `<Search>`, which answers the typeahead from the
   * local artifact when it is on and from `/api/search/suggestions` when it
   * is not.
   */
  searchIndexEnabled?: boolean;
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
  const queryClient = useQueryClient();
  // D9 — chat. Absent `messagesHref` entirely when off, never a disabled
  // icon: `TitleBarLayout` renders nothing without an href.
  const { data: publicSettings } = useSiteSettings<PublicSiteSettings>();
  const chatEnabled = publicSettings?.chat?.enabled === true;
  const { data: unreadMessages } = useUnreadMessageCount(
    chatEnabled && Boolean(user),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [scamModalDismissed, setScamModalDismissed] = useState(false);

  const searchLabels = SEARCH_LABELS;

  /*
   * The quick links `Search` has always been able to render and has never been
   * given.
   *
   * Both of its modes were built — the inline filter matches keywords as well
   * as labels, the overlay renders a labelled band, the keyboard index
   * arithmetic accounts for it — and `grep "quickLinks="` returned zero. It
   * was not wired because there was nothing to wire: nav lived in three arrays
   * with no shared shape and no descriptions. W6 fixed that, and W7 derives
   * this list from it.
   *
   * 🛑 Projected by ROLE before it is rendered. An entry the viewer cannot
   * reach is one they must not be shown — the labels alone are a site map of
   * the admin panel (D8). This is a client-side projection over a list the
   * client already has; when the index moves to a Firestore control document
   * the projection moves server-side, which is where it has to be.
   */
  const quickLinks = useMemo<SearchQuickLink[]>(() => {
    const visible = projectActionIndexForViewer(ACTION_INDEX_BASE, {
      role: user?.role,
      permissions: user?.permissions,
      isTester: user?.isTester,
      isAdmin: isAdminUser(user),
    });
    return visible.map((entry) => ({
      /*
       * 🛑 The deep link, not just the page.
       *
       * `?tab=fees#setting-cod-enabled` is the entire difference between
       * "search for the COD toggle" working and landing the reader on tab 1 of
       * a nineteen-tab settings screen to find it themselves — which is most
       * of the way to not having searched at all.
       */
      href: `${entry.href}${entry.deepLink ?? ""}`,
      label: entry.label,
      icon: Search2Icon,
      /*
       * `sectionPath` joins the keywords so "admin orders" finds the admin
       * entry rather than every Orders in every portal — the breadcrumb is the
       * only thing that distinguishes them, and the inline filter matches
       * keywords.
       */
      keywords: [
        ...(entry.keywords ?? []),
        ...(entry.description ? [entry.description.toLowerCase()] : []),
        ...(entry.sectionPath ? [entry.sectionPath.toLowerCase()] : []),
      ],
    }));
  }, [user]);
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

  const navItems = useMemo<MainNavbarItem[]>(() => {
    /*
     * Hide a listing type the site does not offer.
     *
     * 🛑 Keyed on `key`, and it now has to run over CHILDREN as well as
     * top-level items: auctions / pre-orders / prize-draws moved INTO the
     * Products dropdown, so a filter that only looked at the top level would
     * silently stop hiding them — a disabled type would keep advertising a
     * page that renders nothing. Matching on the translated `label` instead
     * would break the day a second locale ships.
     *
     * This used to AND against six env feature flags passed down from the
     * server layout; those were deleted 2026-08-29 and every one was `true`,
     * so what is left is the control an admin can actually see. events /
     * blog / scams had no equivalent and are unconditional.
     */
    /*
     * Which listing types a nav key stands for.
     *
     * 🛑 `artStickers` was MISSING from the old if-chain, so disabling art or
     * stickers in Site Settings left the "Art & Stickers" entry in the navbar,
     * the sidebar and the mobile sheet, pointing at a page that would then
     * return nothing. `spares` would have been the second instance, which is
     * why this is a map rather than a fourth `if`.
     *
     * A key spanning two types needs ANY of them enabled, not all: a visitor
     * should still reach `/art` when stickers are off and art is on. `/art`
     * itself already narrows its own query to the enabled set.
     */
    const NAV_KEY_LISTING_TYPES: Record<string, readonly ListingType[]> = {
      auctions: ["auction"],
      preOrders: ["pre-order"],
      prizeDraws: ["prize-draw"],
      artStickers: ["art", "stickers"],
      spares: ["spares"],
    };

    const isEnabled = (key: string | undefined) => {
      const types = key ? NAV_KEY_LISTING_TYPES[key] : undefined;
      if (!types) return true;
      return types.some((t) => listingTypeFlags[t]);
    };

    return (
      MAIN_NAV_ITEMS.filter((item) => isEnabled(item.key))
        /*
         * Drop `adminOnly` children for everyone else.
         *
         * 🛑 This is a PRESENTATION filter, not a security boundary. The whole
         * admin nav tree already ships to every visitor — documented at the
         * `isAdmin` note above, with the real fix (a server-side projection)
         * named as separate work — so this only stops a non-admin being shown
         * a link that would redirect them. The guard that matters is the
         * route's own server layout.
         */
        .map((item) => ({
          ...item,
          label: tNav(item.key as Parameters<typeof tNav>[0]),
          ...(item.children
            ? {
                children: item.children.filter(
                  (c) =>
                    (!c.adminOnly || isAdminUser(user)) && isEnabled(c.key),
                ),
              }
            : {}),
        }))
    );
  }, [tNav, listingTypeFlags, user]);

  /*
   * The footer, minus the listing types this site does not offer.
   *
   * 🛑 Same flags as `navItems` above, deliberately: the footer ships on EVERY
   * page, so a disabled type left in it is advertised more widely than the
   * navbar entry that was correctly hidden. `FOOTER_LINK_LISTING_TYPES` maps
   * href → types; an href that is not in the map (Help Centre, Terms, About) is
   * not a listing type and is never filtered.
   *
   * A column emptied by the filter is dropped rather than rendering a heading
   * over nothing — the same rule the static hidden block uses.
   */
  const footerLinkGroups = useMemo(
    () =>
      FOOTER_LINK_GROUPS.map((group) => ({
        ...group,
        links: group.links.filter((link) => {
          const types = FOOTER_LINK_LISTING_TYPES[link.href];
          return !types || types.some((t) => listingTypeFlags[t]);
        }),
      })).filter((group) => group.links.length > 0),
    [listingTypeFlags],
  );

  // Sidebar sections: BROWSE (nav items) + SUPPORT
  const sidebarSections = useMemo<AppLayoutShellProps["sidebarSections"]>(
    () => [
      {
        title: "Browse",
        defaultOpen: true,
        /*
         * 🛑 Children come WITH the item. The sidebar and the mobile sheet are
         * built from the same list as the navbar, so flattening them away here
         * would make a merge read as a deletion on every surface that is not
         * the desktop bar — /auctions and /bundles would exist in the dropdown
         * and nowhere else.
         */
        items: navItems.map((item) => ({
          href: item.href,
          label: item.label,
          icon: item.icon,
          ...(item.children?.length
            ? {
                children: item.children.map((child) => ({
                  href: child.href,
                  label: child.label,
                  icon: child.icon,
                })),
              }
            : {}),
        })),
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
    () =>
      routing.locales.map((loc) => ({ value: loc, label: loc.toUpperCase() })),
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
    const versionSuffix =
      versionParts.length > 0 ? ` · ${versionParts.join(" · ")}` : "";
    return {
      brandName: BRAND.NAME,
      brandDescription: BRAND.DESCRIPTION,
      copyrightText: `${getBrandCopyright()}${versionSuffix}`,
      madeInText: BRAND.MADE_IN_TEXT,
      showTrustBar: true,
      trustBarItems: FOOTER_TRUST_BAR_ITEMS,
      socialLinks: FOOTER_SOCIAL_LINKS,
      newsletterSlot: (
        <Stack gap="lg">
          <FooterNewsletterSlot />
          <FooterBadgesSlot />
        </Stack>
      ),
      linkGroups: footerLinkGroups,
      bottomLinks: FOOTER_BOTTOM_LINKS,
    };
  }, [footerLinkGroups]);

  const showScamModal =
    !scamModalDismissed &&
    !!user &&
    !user.scamAwarenessAcknowledgedAt &&
    !!user.createdAt &&
    Date.now() - new Date(user.createdAt).getTime() < THIRTY_DAYS_MS;

  return (
    <HandModeProvider initialHand={user?.uiPreferences?.handMode}>
      <ThemeProvider registry={themeRegistry}>
        <AdRuntimeInitializer />
        <AppLayoutShell
          navItems={navItems}
          sidebarSections={sidebarSections}
          sidebarPrimaryActions={
            !user
              ? [
                  {
                    href: String(ROUTES.AUTH.LOGIN),
                    label: tNav("login"),
                    variant: "primary",
                  },
                  {
                    href: String(ROUTES.AUTH.REGISTER),
                    label: tNav("register"),
                    variant: "outline",
                  },
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
          messagesHref={chatEnabled ? String(ROUTES.USER.MESSAGES) : undefined}
          unreadMessageCount={unreadMessages?.unread ?? 0}
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
          /*
           * 🛑 No 86-link marketing footer under a dashboard.
           *
           * `/admin/products` ended in "Shop by Category", a newsletter form,
           * social links and the full legal block, on both viewports. A
           * dashboard is a different surface from the shop and loses nothing:
           * the dashboard sidebar carries its own nav plus
           * `SIDEBAR_SUPPORT_LINKS`, and the title bar carries the account
           * menu.
           *
           * Decided here rather than inside the shell — `isDashboard` already
           * exists on this line for the same question, and what a path MEANS
           * is the consumer's call.
           */
          showFooter={!isDashboard}
          contentClassName={isDashboard ? "w-full" : undefined}
          {...(siteSettingsBackground?.light?.value
            ? { lightBackground: siteSettingsBackground.light }
            : {})}
          {...(siteSettingsBackground?.dark?.value
            ? { darkBackground: siteSettingsBackground.dark }
            : {})}
          searchSlotRenderer={(onClose) => (
            <Div border="default" className="border-b" surface="default">
              <Row
                paddingX="x-page"
                className="mx-auto w-full max-w-screen-xl"
                padding="y-xs"
                align="center"
                gap="sm"
              >
                <Search
                  value={searchQuery}
                  onChange={setSearchQuery}
                  searchIndexEnabled={searchIndexEnabled}
                  /*
                   * 🛑 Goes to `/search`, the CROSS-RESOURCE page — not to one
                   * browse route.
                   *
                   * This handler was the entire reason that page had no users.
                   * `/search` has been built, correct and reachable only by
                   * typing the URL: it renders real federated results over nine
                   * sources, and the old redirect it replaced was never actually
                   * deleted — it MOVED here. So a buyer searching "dranzer" was
                   * still sent to `/products?q=dranzer` and never learned there
                   * is also a category, a part, a blog post and an FAQ about it.
                   *
                   * `type` is now a FILTER carried to that page, not a
                   * destination. The nine per-type browse routes are not lost:
                   * each is already its group's "See all X →" link in
                   * `search-sources.ts`, which is where a per-type destination
                   * belongs once the results are grouped.
                   *
                   * An empty query does nothing rather than navigating to a bare
                   * browse page — landing somewhere you did not ask for is worse
                   * than staying put.
                   *
                   * Pinned by scripts/audit-search-entry-points.mjs.
                   */
                  onSearch={(query, type) => {
                    const q = query.trim();
                    if (!q) return;
                    const params = new URLSearchParams({ q });
                    if (type) params.set("type", type);
                    router.push(
                      `${String(ROUTES.PUBLIC.SEARCH)}?${params.toString()}`,
                    );
                    onClose();
                  }}
                  deferred
                  router={{ push: (href) => router.push(href) }}
                  labels={searchLabels}
                  resourceTypes={SEARCH_RESOURCE_TYPES}
                  quickLinks={quickLinks}
                  storageKey="letitrip_search_type"
                  className="flex-1"
                />
              </Row>
            </Div>
          )}
        >
          <ScamAwarenessModal
            isOpen={showScamModal}
            onAcknowledged={() => setScamModalDismissed(true)}
          />
          {children}
        </AppLayoutShell>
        {/*
        Suspense is REQUIRED, not decorative. NavigationLoader calls
        useSearchParams(), and it renders here — OUTSIDE the root layout's
        <Suspense>, which wraps only {children}. Without a boundary of its own
        it forces EVERY page in the app out of static prerendering, so
        `next build` fails even on pages with no dynamic content at all
        (/refund-policy was the tell). See Root Cause #17.
      */}
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
      </ThemeProvider>
    </HandModeProvider>
  );
}
