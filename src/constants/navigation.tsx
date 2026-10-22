/**
 * Navigation Constants
 *
 * Single source of truth for all navigation data across the app.
 * Labels for i18n items (public nav) are injected by consuming components via
 * useTranslations("nav") — keys must match the translation file.
 *
 * Exports:
 * - MAIN_NAV_ITEMS      — public navbar (href + icon; label from tNav(key))
 * - SIDEBAR_SUPPORT_LINKS — sidebar "Support" section static links
 * - FOOTER_LINK_GROUPS  — footer column definitions
 * - ADMIN_NAV_GROUPS    — admin dashboard sidebar
 * - STORE_NAV_GROUPS    — store dashboard sidebar
 * - USER_NAV_GROUPS     — user account sidebar
 * - USER_NAV_ALL_ITEMS  — flat list of all user nav items (for sidebar items prop)
 */

import {
  Home,
  ShoppingBag,
  Gavel,
  CalendarCheck,
  LayoutGrid,
  Store,
  CalendarDays,
  BookOpen,
  Star,
  ShieldAlert,
  Wrench,
  Package2,
  Gift,
  Palette,
  Puzzle,
  Info,
} from "lucide-react";
import type {
  AdminNavGroup,
  StoreNavGroup,
  UserNavGroup,
  UserNavItem,
  SidebarNavItem,
  NavPortal,
  MainNavbarItem,
  AppLayoutShellSidebarLink,
} from "@mohasinac/appkit/client";
/*
 * 🛑 The BARE entry, not "@mohasinac/appkit/client" — Root Cause #76.
 *
 * This module CALLS navItemId at module scope, and it is imported by server
 * code (the locale layout, the store layout, the action index). `client.ts`
 * begins with "use client", so from the server that import resolves to a
 * client-reference proxy and calling it throws. It failed the Vercel build with
 * "Attempted to call navItemId() from the server but navItemId is on the
 * client" while passing every local check, because `next build` is the first
 * thing that evaluates an opengraph-image route.
 *
 * navItemId is a pure string function on the shared layer and is exported from
 * BOTH entries, which is the documented remedy for a symbol server and client
 * both need.
 */
import { navItemId } from "@mohasinac/appkit/next";
import type { ListingType } from "@mohasinac/appkit/features/products/types/index";
import { NAV_ICON_COLORS, NAV_ICON_SIZE_SM } from "./styles/nav-icons";
import { ROUTES } from "./routes";
import { HELP_AUTHENTICITY_PATH, TOOL_AUTHENTICITY_PATH } from "./authenticity-routes";

// ---------------------------------------------------------------------------
// NavItem — public navbar entry (label injected at runtime via tNav)
// icon uses appkit's ReactNode so the type is consistent when spread into MainNavbarItem
// ---------------------------------------------------------------------------

export interface NavItem {
  key: string;
  href: string;
  icon: MainNavbarItem["icon"];
  highlighted?: boolean;
  /**
   * Sub-items, rendered by the navbar as a dropdown.
   *
   * 🛑 Typed off `MainNavbarItem` rather than redeclared, so the two cannot
   * drift — this local type already borrows `icon` from it for the same
   * reason. Labels here are literal English rather than `tNav` keys because
   * `LayoutShellClient` translates only the PARENT's label, and a half-
   * translated dropdown is worse than a consistently untranslated one; when a
   * second locale ships, these move into the messages file together.
   */
  children?: MainNavbarItem["children"];
}

// ---------------------------------------------------------------------------
// Public navbar (icon + href; label added by consuming component via tNav)
// Translation key order: home, products, auctions, preOrders, categories,
//                        stores, events, blog, reviews
// ---------------------------------------------------------------------------

const navIcons = NAV_ICON_COLORS;
const iconSm = NAV_ICON_SIZE_SM;
const CLS_SCAM_ICON = "text-error";

export const MAIN_NAV_ITEMS: NavItem[] = [
  { key: "home",       href: String(ROUTES.HOME),                 icon: <Home         className={`${iconSm} ${navIcons.home}`}       /> },
  /*
   * PRODUCTS — the whole shop, under one entry.
   *
   * Six listing types used to sit as six top-level siblings, which is most of
   * what made the bar overflow and scroll at a laptop width (the `safe center`
   * note in NavbarLayout measures 14 items needing 1245px in a 990px box). They
   * are not six destinations a visitor chooses between; they are one catalogue
   * seen six ways.
   *
   * 🛑 The parent still LINKS to /products and a tap still follows it — the
   * dropdown is the hover/hold/caret affordance on top, never a replacement
   * (same contract as Tools below). And /products itself is repeated as the
   * first child, because the parent's own destination has to be nameable from
   * inside the menu for anyone who opened it rather than tapping through.
   */
  { key: "products",   href: String(ROUTES.PUBLIC.PRODUCTS),      icon: <ShoppingBag  className={`${iconSm} ${navIcons.products}`}   />,
    children: [
      {
        key: "products",
        href: String(ROUTES.PUBLIC.PRODUCTS),
        label: "All products",
        description: "The general catalogue — buy it now",
        icon: <ShoppingBag className={`${iconSm} ${navIcons.products}`} />,
      },
      {
        /*
         * 🛑 `key` is what LayoutShellClient filters on when an admin switches
         * a listing type off. These three used to be filtered as TOP-LEVEL
         * items by that same key; moving them in here without carrying the key
         * would have left a disabled type advertised in the dropdown with a
         * page behind it that renders nothing.
         */
        key: "auctions",
        href: String(ROUTES.PUBLIC.AUCTIONS),
        label: "Auctions",
        description: "Bid, or take the Buy Now price",
        icon: <Gavel className={`${iconSm} ${navIcons.auctions}`} />,
      },
      {
        key: "preOrders",
        href: String(ROUTES.PUBLIC.PRE_ORDERS),
        label: "Pre-Orders",
        description: "Reserve before release",
        icon: <CalendarCheck className={`${iconSm} ${navIcons.preOrders}`} />,
      },
      {
        key: "bundles",
        href: String(ROUTES.PUBLIC.BUNDLES),
        label: "Bundles",
        description: "Several items, one discounted price",
        icon: <Package2 className={`${iconSm} ${navIcons.bundles}`} />,
      },
      {
        key: "prizeDraws",
        href: String(ROUTES.PUBLIC.PRIZE_DRAWS),
        label: "Prize Draws",
        description: "Buy an entry, win the listing",
        icon: <Gift className={`${iconSm} ${navIcons.prizeDraws}`} />,
      },
      {
        key: "artStickers",
        href: String(ROUTES.PUBLIC.ART),
        label: "Art & Stickers",
        description: "Fan art prints and sticker sheets",
        icon: <Palette className={`${iconSm} ${navIcons.artStickers}`} />,
      },
      /*
       * 🛑 This entry is OBLIGED by the plugin, not optional decoration.
       * `spares` sets `inGeneralCatalogue: false`, and the rule for that flag is
       * nav reachability: a type excluded from `/products` must be linked from
       * MAIN_NAV_ITEMS or it is reachable from nowhere (Root Cause #61, where
       * five of nine types were unreachable from the main catalogue).
       *
       * 🛑 And it must sit INSIDE this block. `audit-nav-page-wiring` slices the
       * MAIN_NAV_ITEMS literal; a sibling export declared next to it is
       * invisible to the audit.
       */
      {
        key: "spares",
        href: String(ROUTES.PUBLIC.SPARES),
        label: "Spares",
        description: "Single parts off disassembled tops",
        icon: <Puzzle className={`${iconSm} ${navIcons.spares}`} />,
      },
    ] },
  { key: "categories", href: String(ROUTES.PUBLIC.CATEGORIES),    icon: <LayoutGrid   className={`${iconSm} ${navIcons.categories}`} /> },
  { key: "stores",     href: String(ROUTES.PUBLIC.STORES),        icon: <Store        className={`${iconSm} ${navIcons.stores}`}     /> },
  /*
   * EVENTS — the things happening, as opposed to the things for sale. Blog
   * joins it for the same reason the listing types joined Products: two
   * adjacent reading surfaces that nobody picks between at the top level.
   */
  { key: "events",     href: String(ROUTES.PUBLIC.EVENTS),        icon: <CalendarDays className={`${iconSm} ${navIcons.events}`}     />,
    children: [
      {
        key: "events",
        href: String(ROUTES.PUBLIC.EVENTS),
        label: "Events",
        description: "Sales, raffles, polls and tournaments",
        icon: <CalendarDays className={`${iconSm} ${navIcons.events}`} />,
      },
      {
        key: "blog",
        href: String(ROUTES.BLOG.LIST),
        label: "Blog",
        description: "Guides, releases and collecting notes",
        icon: <BookOpen className={`${iconSm} ${navIcons.blog}`} />,
      },
    ] },
  { key: "reviews",    href: String(ROUTES.PUBLIC.REVIEWS),       icon: <Star         className={`${iconSm} ${navIcons.reviews}`}    /> },
  { key: "about",      href: String(ROUTES.PUBLIC.ABOUT),         icon: <Info         className={`${iconSm} ${navIcons.about}`}      /> },
  /*
   * TOOLS — a shared dropdown for the surfaces that answer a question rather
   * than sell something. The scam registry used to be a top-level sibling of
   * Products and Auctions, which read as a category of thing to buy.
   *
   * 🛑 `href` points at a REAL page (`/tools`), not `#`. A touch user who taps
   * the trigger has to land somewhere, `audit-nav-page-wiring` is strict-zero
   * on a nav href with no `page.tsx`, and a crawler follows it. The dropdown
   * is a convenience on top of a working link, never a replacement for one.
   */
  { key: "tools",      href: String(ROUTES.PUBLIC.TOOLS),         icon: <Wrench       className={`${iconSm} ${navIcons.about}`}      />,
    children: [
      {
        href: String(ROUTES.PUBLIC.TOOL_PRICE_INDEX),
        label: "What it sold for",
        description: "Realised prices by model and condition",
      },
      {
        /*
         * Admin-only. Placed INSIDE this children array deliberately —
         * `audit-nav-page-wiring` slices the MAIN_NAV_ITEMS block, so a nav
         * entry declared as a sibling export is invisible to it and its dead
         * link would never be caught.
         */
        href: String(ROUTES.PUBLIC.TOOL_STICKER_TRACER),
        label: "Sticker sheet tracer",
        description: "Trace kiss-cut outlines and split a scanned sheet",
        adminOnly: true,
      },
      {
        /*
         * D12. A reference database belongs here for the same reason the
         * price lookup does: it answers a question. 753 parts across 20
         * classifications, and "what does RF mean on a Beyblade" is a real
         * search nobody in the fifteen-site crawl owns an answer to.
         */
        href: String(ROUTES.PUBLIC.PARTS),
        label: "Beyblade parts gallery",
        description: "What every part is, and which beys use it",
      },
      {
        /*
         * 🛑 The only entry in this dropdown that needs an account, and the
         * description says so rather than letting a signed-out visitor find
         * out after clicking. The page itself renders a sign-in prompt plus a
         * link to the open /spot-a-fake guide, so the click is never a dead end.
         */
        href: TOOL_AUTHENTICITY_PATH,
        label: "Authenticity checker",
        description: "Box codes and per-generation checks · sign-in needed",
      },
      {
        /*
         * The free half, listed separately and FIRST in intent: most people
         * arriving at "is my beyblade original" want the vocabulary and the
         * per-generation checks, not a per-item lookup, and that half needs no
         * account at all.
         */
        href: HELP_AUTHENTICITY_PATH,
        label: "Is my Beyblade original?",
        description: "What midfake means, box codes, and the checks that count",
      },
      {
        href: String(ROUTES.PUBLIC.SCAMS),
        label: "Scam registry",
        description: "Check a seller, or file a report",
      },
    ] },
];

// ---------------------------------------------------------------------------
// Public sidebar "Support" section (static, no i18n needed)
// ---------------------------------------------------------------------------

export const SIDEBAR_SUPPORT_LINKS: AppLayoutShellSidebarLink[] = [
  { href: String(ROUTES.PUBLIC.ABOUT),   label: "About"         },
  { href: String(ROUTES.PUBLIC.CONTACT), label: "Contact"       },
  { href: String(ROUTES.PUBLIC.HELP),    label: "Help"          },
  { href: String(ROUTES.PUBLIC.SCAMS),   label: "Scam Registry" },
];

// ---------------------------------------------------------------------------
// Footer link groups
// ---------------------------------------------------------------------------

/*
 * 🛑 The name is `FOOTER_LINK_GROUPS_ALL`, not `ALL_FOOTER_LINK_GROUPS`, and
 * the suffix is load-bearing: `audit-nav-page-wiring` finds this block with
 * `source.indexOf("export const FOOTER_LINK_GROUPS")` and slices to the first
 * `\n];`. A `FOOTER_LINK_GROUPS_ALL` literal still contains that substring and
 * still comes first in the file, so the audit keeps reading the FULL literal —
 * including the hidden entries, which must still resolve to real pages. Rename
 * it to a prefix the audit cannot see and it silently slices the next array
 * instead, checking the wrong 20 hrefs and reporting green.
 */
export const FOOTER_LINK_GROUPS_ALL = [
  /*
   * 🛑 EVERY listing type's browse page belongs here.
   *
   * Six of them shipped with a real page, a real `ROUTES.PUBLIC` constant and
   * NO link from anywhere on the site — reachable only by typing the URL:
   * /classified, /digital-codes, /live, /lottery, /brands and /sellers. That is
   * Root Cause #37's shape (a page with no nav entry is exactly as incomplete
   * as a feature with no backend) and it is also an SEO hole: an unlinked page
   * has no internal inbound link for a crawler to follow.
   *
   * `audit-nav-page-wiring` is strict-zero on the OTHER direction (a nav href
   * with no page) and deliberately report-only on this one, because legitimate
   * sub-routes like `new/` and `[id]/edit` are expected to have no nav entry.
   * So nothing was going to fail the build over these; they had to be found by
   * sweeping.
   */
  {
    heading: "Shop",
    links: [
      { label: "Products",    href: String(ROUTES.PUBLIC.PRODUCTS)    },
      { label: "Auctions",    href: String(ROUTES.PUBLIC.AUCTIONS)    },
      { label: "Pre-Orders",  href: String(ROUTES.PUBLIC.PRE_ORDERS)  },
      { label: "Classifieds", href: String(ROUTES.PUBLIC.CLASSIFIED)  },
      { label: "Digital Codes", href: String(ROUTES.PUBLIC.DIGITAL_CODES) },
      { label: "Live Items",  href: String(ROUTES.PUBLIC.LIVE)        },
      { label: "Bundles",     href: String(ROUTES.PUBLIC.BUNDLES)     },
      { label: "Prize Draws", href: String(ROUTES.PUBLIC.PRIZE_DRAWS) },
      { label: "Lotteries",   href: String(ROUTES.PUBLIC.LOTTERIES)   },
      { label: "Art & Stickers", href: String(ROUTES.PUBLIC.ART)      },
      { label: "Spares",      href: String(ROUTES.PUBLIC.SPARES)     },
      { label: "Promotions",  href: String(ROUTES.PUBLIC.PROMOTIONS)  },
      { label: "Stores",      href: String(ROUTES.PUBLIC.STORES)      },
      // Distinct from Stores: /stores lists shopfronts, /sellers lists the
      // verified sellers behind them. Labelled explicitly so the two entries do
      // not read as the same destination.
      { label: "Verified Sellers", href: String(ROUTES.PUBLIC.SELLERS) },
      { label: "Categories",  href: String(ROUTES.PUBLIC.CATEGORIES)  },
      { label: "Brands",      href: String(ROUTES.PUBLIC.BRANDS)      },
      // A franchise is what a collectible is FROM; a brand is who MADE it.
      // Sits beside Brands because they are siblings, not a hierarchy.
      { label: "Franchises",  href: String(ROUTES.PUBLIC.FRANCHISE)   },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Centre",   href: String(ROUTES.PUBLIC.HELP)        },
      { label: "FAQs",          href: String(ROUTES.PUBLIC.FAQS)        },
      { label: "Contact Us",    href: String(ROUTES.PUBLIC.CONTACT)     },
      { label: "Track Order",   href: String(ROUTES.PUBLIC.TRACK_ORDER) },
      { label: "About Us",      href: String(ROUTES.PUBLIC.ABOUT)       },
      { label: "Our Ethics",    href: String(ROUTES.PUBLIC.ETHICS)      },
      { label: "Developer",     href: String(ROUTES.PUBLIC.DEVELOPER)   },
      { label: "Scam Registry", href: String(ROUTES.PUBLIC.SCAMS)       },
      { label: "Item Requests", href: String(ROUTES.PUBLIC.ITEM_REQUESTS) },
      { label: "Report a Problem", href: String(ROUTES.PUBLIC.REPORT_ENTITY) },
    ],
  },
  {
    heading: "For Sellers",
    links: [
      { label: "Become a Seller",      href: String(ROUTES.USER.BECOME_SELLER)         },
      { label: "Seller Guide",         href: String(ROUTES.PUBLIC.SELLER_GUIDE)        },
      { label: "Fees & Pricing",       href: String(ROUTES.PUBLIC.FEES)                },
      { label: "How Payouts Work",     href: String(ROUTES.PUBLIC.HOW_PAYOUTS_WORK)    },
      { label: "Store Dashboard",      href: String(ROUTES.STORE.DASHBOARD)            },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "How Auctions Work",    href: String(ROUTES.PUBLIC.HOW_AUCTIONS_WORK)   },
      { label: "How Pre-Orders Work",  href: String(ROUTES.PUBLIC.HOW_PRE_ORDERS_WORK) },
      { label: "How Offers Work",      href: String(ROUTES.PUBLIC.HOW_OFFERS_WORK)     },
      { label: "How EMI Works",        href: String(ROUTES.PUBLIC.HOW_EMI_WORKS)       },
      // D6 — both carry their own page; a nav entry in the SAME commit as the
      // page, because a page with no link is exactly as incomplete as a
      // feature with no backend (Root Cause #37).
      { label: "All Guides",           href: String(ROUTES.PUBLIC.GUIDES)              },
      { label: "GST Explained",        href: String(ROUTES.PUBLIC.GST)                 },
      { label: "Spot a Fake",          href: String(ROUTES.PUBLIC.SPOT_A_FAKE)          },
      // SB5-A — DX34 will swap these for external docs.letitrip.in/sellers/* URLs.
      { label: "Bundle Guide",         href: String(ROUTES.PUBLIC.SELLER_GUIDE_BUNDLES)     },
      { label: "Prize Draw Guide",     href: String(ROUTES.PUBLIC.SELLER_GUIDE_PRIZE_DRAWS) },
      { label: "Blog",                 href: String(ROUTES.BLOG.LIST)                },
      { label: "Events",               href: String(ROUTES.PUBLIC.EVENTS)              },
    ],
  },
  {
    heading: "Legal",
    links: [
      // The page existed and was linked from NOWHERE — Root Cause #37, on the
      // one page in this group that discharges a licence condition rather than
      // stating a policy.
      { label: "Credits & Sources",  href: String(ROUTES.PUBLIC.CREDITS)         },
      { label: "Terms of Service",  href: String(ROUTES.PUBLIC.TERMS)           },
      { label: "Code of Conduct",   href: String(ROUTES.PUBLIC.CODE_OF_CONDUCT) },
      { label: "Privacy Policy",    href: String(ROUTES.PUBLIC.PRIVACY)         },
      { label: "Cookie Policy",     href: String(ROUTES.PUBLIC.COOKIE_POLICY)   },
      { label: "Refund Policy",     href: String(ROUTES.PUBLIC.REFUND_POLICY)   },
      { label: "Shipping Policy",   href: String(ROUTES.PUBLIC.SHIPPING_POLICY) },
      // Both added with their pages in the same commit (Rule #8, Root Cause
      // #37). Cancellation is named separately from the refund policy because
      // PhonePe's merchant review asks for it by name; Grievance Redressal is
      // a MANDATORY published disclosure under the Consumer Protection
      // (E-Commerce) Rules 2020 and the IT Rules 2021, and the site had no
      // such page and no such field at all before 2026-10-19.
      { label: "Cancellation Policy", href: String(ROUTES.PUBLIC.CANCELLATION_POLICY) },
      { label: "Grievance Redressal", href: String(ROUTES.PUBLIC.GRIEVANCE)           },
    ],
  },
];

/**
 * Which listing type each footer href stands for — the footer's half of the
 * `NAV_KEY_LISTING_TYPES` map in LayoutShellClient.
 *
 * 🛑 The footer is NOT flag-aware on its own. It used to be the one public
 * surface that kept advertising a disabled type: the navbar filtered on
 * `useListingTypeFlags`, the browse page returned nothing, and the footer went
 * on linking to it from every page on the site. Switching a type off in
 * Admin → Site Settings → Listings has to reach BOTH lists or it has not
 * really switched anything off.
 *
 * Keyed by href rather than label so a copy change ("Prize Draws" →
 * "Giveaways") cannot silently un-hide an entry — the same reason
 * `getStoreNavGroups` was moved off label-matching (see the note above
 * ADMIN_NAV_GROUPS).
 *
 * An href spanning two types needs ANY of them enabled, matching the navbar:
 * `/art` stays reachable when stickers are off and art is on.
 */
export const FOOTER_LINK_LISTING_TYPES: Record<string, readonly ListingType[]> = {
  [String(ROUTES.PUBLIC.PRODUCTS)]:      ["standard"],
  [String(ROUTES.PUBLIC.AUCTIONS)]:      ["auction"],
  [String(ROUTES.PUBLIC.PRE_ORDERS)]:    ["pre-order"],
  [String(ROUTES.PUBLIC.CLASSIFIED)]:    ["classified"],
  [String(ROUTES.PUBLIC.DIGITAL_CODES)]: ["digital-code"],
  [String(ROUTES.PUBLIC.LIVE)]:          ["live"],
  [String(ROUTES.PUBLIC.PRIZE_DRAWS)]:   ["prize-draw"],
  [String(ROUTES.PUBLIC.ART)]:           ["art", "stickers"],
  [String(ROUTES.PUBLIC.SPARES)]:        ["spares"],
  /*
   * A type's GUIDES are part of that type's surface, buyer-side and
   * seller-side alike: "How Auctions Work" under a site that does not run
   * auctions, or a guide teaching someone to publish a prize draw they cannot
   * publish, is worse than no guide. They follow the type's own flag rather
   * than a second switch that can drift from it.
   */
  [String(ROUTES.PUBLIC.HOW_AUCTIONS_WORK)]:        ["auction"],
  [String(ROUTES.PUBLIC.HOW_PRE_ORDERS_WORK)]:      ["pre-order"],
  [String(ROUTES.PUBLIC.SELLER_GUIDE_PRIZE_DRAWS)]: ["prize-draw"],
};

/**
 * 🛑 HIDDEN BLOCK — the surfaces with no listing-type flag behind them.
 *
 * Everything above is admin-controlled and belongs in Site Settings. These
 * three are NOT listing types and have no toggle to read: a lottery is an
 * EVENT type, bundles are a CATEGORY type, and promotions are a feature. They
 * are hidden here, in code, because there is nowhere else to hide them from —
 * and spelling out that difference is the point of keeping the two mechanisms
 * visibly apart rather than merging them into one opaque list.
 *
 * Hidden, NOT deleted: the pages, routes and `ROUTES.PUBLIC.*` constants all
 * still exist and still resolve. To bring one back, delete its line.
 */
export const HIDDEN_FOOTER_LINK_HREFS = new Set<string>([
  String(ROUTES.PUBLIC.LOTTERIES),
  String(ROUTES.PUBLIC.BUNDLES),
  String(ROUTES.PUBLIC.PROMOTIONS),
  String(ROUTES.PUBLIC.SELLER_GUIDE_BUNDLES),
]);

/**
 * The footer minus the entries that have no toggle. The listing-type entries
 * are filtered LATER, in LayoutShellClient, because their answer depends on
 * site settings the client has to load — see `footerLinkGroups` there.
 *
 * A column whose every link is hidden drops out entirely rather than rendering
 * a heading over empty space.
 */
export const FOOTER_LINK_GROUPS = FOOTER_LINK_GROUPS_ALL
  .map((group) => ({
    ...group,
    links: group.links.filter((link) => !HIDDEN_FOOTER_LINK_HREFS.has(link.href)),
  }))
  .filter((group) => group.links.length > 0);

// ---------------------------------------------------------------------------
// Admin dashboard sidebar
// ---------------------------------------------------------------------------

/**
 * Extra metadata a nav item may carry.
 *
 * `description` is one sentence on what the screen is FOR, in the user's words
 * rather than the entity's — "Refund a buyer, or check why a payout is late"
 * finds its screen, while "Payouts" only ever finds itself. `keywords` are the
 * words someone might search that are not in the label: synonyms, the old name
 * of a renamed screen, the noun the rest of the industry uses.
 *
 * Both feed the sidebar search today and the action index in W7.
 */
interface NavMeta {
  description?: string;
  keywords?: string[];
}

/**
 * Build a nav item, deriving its `id` from its href.
 *
 * 🛑 **The `id` is why this helper exists, and it is a behaviour change.**
 * `filterNavItems` opens with `if (!item.id) return true;`, and no item in
 * this file had one — so both the admin `navConfig` toggle and the
 * `requiredPermission` check below it had never executed. Every employee saw
 * the entire admin sidebar regardless of their permissions.
 *
 * Derived rather than hand-written because the id is also the `navConfig` key:
 * an id that drifts from its href silently un-toggles the item — the admin
 * hides "Payouts", the toggle writes a key nothing reads, and the entry stays.
 *
 * The diff this switches on was measured before it landed:
 * `node scripts/diff-employee-sidebar.mjs`.
 */
function navItem(
  portal: NavPortal,
  href: string,
  label: string,
  requiredPermission?: string,
  meta?: NavMeta,
): SidebarNavItem {
  return {
    id: navItemId(portal, href),
    portal,
    href,
    label,
    ...(requiredPermission ? { requiredPermission } : {}),
    ...meta,
  };
}

/** An admin nav item. `requiredPermission` is mandatory in this portal. */
function adminItem(
  href: string,
  label: string,
  requiredPermission: string,
  meta?: NavMeta,
): SidebarNavItem {
  return navItem("admin", href, label, requiredPermission, meta);
}

/** A store nav item. The seller owns the store, so no permission gate. */
function storeItem(href: string, label: string, meta?: NavMeta): SidebarNavItem {
  return navItem("store", href, label, undefined, meta);
}

/** A user nav item. */
function userItem(href: string, label: string, meta?: NavMeta): SidebarNavItem {
  return navItem("user", href, label, undefined, meta);
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Management",
    items: [
      adminItem(String(ROUTES.ADMIN.DASHBOARD),       "Dashboard",       "admin:dashboard:view", {
        description: "Today's orders, revenue and anything needing attention.",
        keywords: ["home", "overview", "kpis"],
      }),
      adminItem(String(ROUTES.ADMIN.USERS),           "Users",           "admin:users:read", {
        description: "Find a buyer or seller, change their role, ban or unban them.",
        keywords: ["accounts", "customers", "ban", "role"],
      }),
      adminItem(String(ROUTES.ADMIN.PRODUCTS),        "Products",        "admin:products:read", {
        description: "Every listing on the platform, across all sellers.",
        keywords: ["listings", "catalogue", "inventory"],
      }),
      adminItem(String(ROUTES.ADMIN.CLASSIFIED),      "Classified",      "admin:products:read", {
        description: "Contact-seller listings that never enter the cart.",
        keywords: ["listings", "meetup", "local"],
      }),
      adminItem(String(ROUTES.ADMIN.DIGITAL_CODES),   "Digital Codes",   "admin:products:read", {
        description: "Listings that deliver a code instead of a parcel.",
        keywords: ["listings", "keys", "vouchers"],
      }),
      adminItem(String(ROUTES.ADMIN.LIVE),            "Live Items",      "admin:products:read", {
        description: "Live animals and plants, with their jurisdiction checks.",
        keywords: ["listings", "animals", "plants", "cites"],
      }),
      adminItem(String(ROUTES.ADMIN.ART),             "Art",             "admin:products:read", {
        description: "Art prints, sized and editioned.",
        keywords: ["listings", "prints", "posters"],
      }),
      adminItem(String(ROUTES.ADMIN.STICKERS),        "Stickers",        "admin:products:read", {
        description: "Sticker sheets.",
        keywords: ["listings", "decals"],
      }),
      adminItem(String(ROUTES.ADMIN.SPARES),          "Spares",          "admin:products:read", {
        description: "Loose components off disassembled items.",
        keywords: ["listings", "parts", "attack ring", "weight disk", "driver"],
      }),
      adminItem(String(ROUTES.ADMIN.ORDERS),          "Orders",          "admin:orders:read", {
        description: "Every order, its payment state and where it is.",
        keywords: ["purchases", "sales", "refund", "shipping"],
      }),
      // Beside Orders, not with Bids under Content: an offer is a
      // commerce-pipeline object that ends in an order.
      adminItem(String(ROUTES.ADMIN.OFFERS),          "Offers",          "admin:offers:read", {
        description: "Buyer price offers and the counter-offers sellers made.",
        keywords: ["negotiation", "bids", "haggle"],
      }),
      adminItem(String(ROUTES.ADMIN.FULFILLMENT),     "Fulfillment",     "admin:orders:read", {
        description: "Orders waiting to be packed, shipped or handed over.",
        keywords: ["shipping", "dispatch", "packing"],
      }),
      /*
       * Moved out of Catalog 2026-08-31. Print Center batches LABELS, INVOICES
       * and BARCODES — a fulfilment tool, not taxonomy — and the store portal
       * had it under "Store" while admin had it under "Catalog", so the two
       * sidebars disagreed about what it is. Both now sit beside Fulfillment.
       */
      adminItem(String(ROUTES.ADMIN.PRINT_CENTER),    "Print Center",    "admin:products:read", {
        description: "Print labels, invoices and barcodes in a batch.",
        keywords: ["labels", "invoice", "barcode"],
      }),
      /*
       * Moved out of Content 2026-08-31, applying the argument the Offers entry
       * above already makes: a bid is a commerce-pipeline object that ends in an
       * order, not an article. Admin had it filed with Media and Blog while the
       * store portal had it under "Orders & Reviews" — the same object in two
       * unrelated places.
       */
      adminItem(String(ROUTES.ADMIN.BIDS),            "Bids",            "admin:bids:read", {
        description: "Every bid placed on every auction.",
        keywords: ["auction", "bidding"],
      }),
      adminItem(String(ROUTES.ADMIN.RETURN_REQUESTS), "Returns",         "admin:returns:read", {
        description: "Return requests and what to refund.",
        keywords: ["refunds", "rma", "send back"],
      }),
      adminItem(String(ROUTES.ADMIN.STORES),          "Stores",          "admin:stores:read", {
        description: "Approve, suspend or verify a seller's store.",
        keywords: ["sellers", "shops", "verify", "suspend"],
      }),
      adminItem(String(ROUTES.ADMIN.STORE_ADDRESSES), "Store Addresses", "admin:store-addresses:read", {
        description: "Pickup locations sellers ship from.",
        keywords: ["warehouse", "pickup", "seller address"],
      }),
      adminItem(String(ROUTES.ADMIN.ADDRESSES),       "Addresses",       "admin:addresses:read", {
        description: "Every delivery address on the platform.",
        keywords: ["shipping address", "postcode", "pin code"],
      }),
    ],
  },
  {
    title: "Finance",
    items: [
      adminItem(String(ROUTES.ADMIN.ANALYTICS), "Analytics", "admin:analytics:view", {
        description: "Revenue, orders and traffic over time.",
        keywords: ["reports", "sales", "charts"],
      }),
      adminItem(String(ROUTES.ADMIN.PAYOUTS), "Payouts", "admin:payouts:read", {
        description: "Pay a seller, or check why a payout is late.",
        keywords: ["money out", "settlement", "seller payment"],
      }),
      adminItem(String(ROUTES.ADMIN.AUDIT_LOG), "Audit Log", "admin:audit-log:read", {
        description: "Who did what: bans, role changes, coupon edits, payouts.",
        keywords: ["history", "who changed", "trail"],
      }),
      /*
       * Phase 7. In the SAME commit as the page, per Rule #8 and Root Cause
       * #37 — ~25 fully-built admin pages were once reachable only by typing
       * the exact URL, and `audit-nav-page-wiring` is strict-zero on a dead
       * nav link in the other direction.
       *
       * The keywords are what an accountant would type at quarter end without
       * knowing this page exists. "GSTR-1" and "GST return" matter more than
       * the page's own title here — the sidebar search filters on them, so a
       * word missing from this list makes the page unfindable to anyone who
       * has not memorised where it lives.
       */
      adminItem(String(ROUTES.ADMIN.INVOICING), "Invoicing", "settings:write", {
        description:
          "Invoice and credit-note register, and the GSTR-1 draft export for a period.",
        keywords: [
          "gstr1",
          "gstr-1",
          "gst return",
          "invoice number",
          "credit note",
          "tax export",
          "quarter",
          "accountant",
        ],
      }),
      /*
       * 🛑 Under FINANCE, not Maintenance, and that placement is the decision.
       *
       * Maintenance is "something broke, look when you can" and is granted to
       * `maintenance_employee`. A money case can carry the gateway's own
       * `respond_by` — miss it and the chargeback is lost by default however
       * right we were — and an `amountAtRisk` in real rupees. Burying it beside
       * Cloud Logs is how a deadline gets missed.
       *
       * The keywords are what someone would actually type when something has
       * gone wrong with money and they do not know this page exists. The
       * sidebar search filters on them (`useSidebarSearch`), so "chargeback"
       * and "refund stuck" have to be in here or the page is unfindable by
       * anyone who has not already memorised its name.
       */
      adminItem(String(ROUTES.ADMIN.MONEY_CASES), "Money Cases", "admin:payment-cases:read", {
        description:
          "Chargebacks, captured payments with no order, refunds owed, claims and grievances.",
        keywords: [
          "chargeback",
          "dispute",
          "refund stuck",
          "refund owed",
          "missing order",
          "payment failed",
          "money",
          "claim",
          "grievance",
        ],
      }),
      /*
       * Its own entry rather than a tab inside Money Cases: a protection claim
       * is a DECISION waiting on an admin (genuine, or change of mind), while a
       * money case is a PROBLEM waiting on an investigation. Both produce rows
       * in `paymentCases`, but only one of them has two buttons and an answer.
       */
      adminItem(
        String(ROUTES.ADMIN.PROTECTION_CLAIMS),
        "Protection Claims",
        "admin:protection-claims:read",
        {
          description:
            "Buyer claims against shipment and sale cover — the finding decides who absorbs it.",
          keywords: [
            "protection",
            "claim",
            "damaged",
            "not delivered",
            "lost parcel",
            "cover",
            "counterfeit",
          ],
        },
      ),
    ],
  },
  {
    title: "Procurement",
    items: [
      adminItem(String(ROUTES.ADMIN.SHIPMENTS), "Shipments", "admin:shipments:read", {
        description: "Inbound stock: what was ordered from suppliers and where it is.",
        keywords: ["procurement", "import", "supplier"],
      }),
      adminItem(String(ROUTES.ADMIN.SHIPMENTS_PROJECTIONS), "Projections", "admin:shipments:read", {
        description: "What an inbound shipment should be worth once it lands.",
        keywords: ["profit", "forecast", "margin"],
      }),
      adminItem(String(ROUTES.ADMIN.CATALOGUE_APPROVALS), "Catalogue Approvals", "admin:catalogue:read", {
        description: "Users asking to turn a catalogue item into a real listing.",
        keywords: ["requests", "promote", "approve"],
      }),
      adminItem(String(ROUTES.ADMIN.INVENTORY_BOXES), "Storage Boxes", "admin:inventory:read", {
        description: "The AC60/AC30 box registry, and what is in each one.",
        keywords: ["inventory", "box", "shelf", "stock", "location", "ac60", "ac30"],
      }),
      adminItem(String(ROUTES.ADMIN.INVENTORY_MOVEMENTS), "Move Ledger", "admin:inventory:read", {
        description: "Every stock movement, append-only — where something went and who moved it.",
        keywords: ["inventory", "ledger", "history", "audit", "movement"],
      }),
      // A nav entry in the SAME commit as the page (Rule #8 / Root Cause #37).
      // Box labels are printed for a batch of boxes rather than one, so unlike
      // the receive station this genuinely belongs in the nav rather than on a
      // row — there is no single box it is about.
      adminItem(String(ROUTES.ADMIN.INVENTORY_BOX_LABELS), "Box Labels", "admin:inventory:read", {
        description: "Print box labels and A4 contents sheets at real die-cut sizes.",
        keywords: ["inventory", "print", "label", "barcode", "thermal", "avery", "contents"],
      }),
    ],
  },
  {
    title: "Catalog",
    items: [
      adminItem(String(ROUTES.ADMIN.CATEGORIES),            "Categories",    "admin:categories:read", {
        description: "The category tree buyers browse by.",
        keywords: ["taxonomy", "tree", "browse"],
      }),
      /*
       * The two GENERATED reference databases. Added in the SAME COMMIT as
       * their pages — Rule #8 and Root Cause #37: "a page.tsx with no sidebar
       * link is exactly as incomplete as a feature with no backend", and ~25
       * fully-built admin features were once reachable only by typing the URL.
       *
       * Described as CORRECTION surfaces rather than as catalogues, because
       * that is what they are for: neither has an Add button, and the thing an
       * operator comes here to do is fix a wrong extraction.
       */
      adminItem(String(ROUTES.ADMIN.PARTS),                 "Parts",         "admin:parts:read", {
        description: "The generated part glossary — correct a wrong spec.",
        keywords: ["glossary", "components", "tips", "wheels", "reference"],
      }),
      adminItem(String(ROUTES.ADMIN.BEYS),                  "Beyblades",     "admin:beys:read", {
        description: "The generated Beyblade database — correct a wrong spec.",
        keywords: ["beys", "models", "reference", "database"],
      }),
      adminItem(String(ROUTES.ADMIN.BRANDS),                "Brands",        "admin:brands:read", {
        description: "Brand pages and the products filed under each.",
        keywords: ["manufacturer", "makers"],
      }),
      adminItem(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES), "Sub-listings",  "admin:categories:read", {
        description: "Tier-4 leaf groups inside a category.",
        keywords: ["taxonomy", "sets"],
      }),
      adminItem(String(ROUTES.ADMIN.FEATURES),              "Feature Badges","admin:categories:read", {
        description: "The badges shown on a listing — free shipping, authenticity.",
        keywords: ["labels", "flags", "chips"],
      }),
      // Own permission since 2026-08-26 (W22). It borrowed
      // `admin:categories:read` because none existed — so a role granted
      // category access silently got storefront curation too, and a role that
      // should curate could not be given it without category rights.
      adminItem(String(ROUTES.ADMIN.GROUPED_LISTINGS),      "Grouped Listings","admin:grouped-listings:read", {
        description: "Theme scrollers that appear beside a product.",
        keywords: ["related", "collections", "you might also like"],
      }),
      adminItem(String(ROUTES.ADMIN.DEALS),                 "Deals",         "admin:deals:read", {
        description: "Discounted listings and the campaigns behind them.",
        keywords: ["sale", "promotions", "discount"],
      }),
      adminItem(String(ROUTES.ADMIN.FEATURED),              "Featured",      "admin:featured:read", {
        description: "What gets promoted on the homepage and category pages.",
        keywords: ["homepage", "promoted", "spotlight"],
      }),
      adminItem(String(ROUTES.ADMIN.COUPONS), "Coupons", "admin:coupons:read", {
        description: "Discount codes, their limits and who has used them.",
        keywords: ["voucher", "promo code", "discount"],
      }),
      adminItem(String(ROUTES.ADMIN.BUNDLES), "Bundles", "admin:categories:read", {
        description: "Multi-item packs sold at one price.",
        keywords: ["packs", "sets", "combo"],
      }),
      adminItem(String(ROUTES.ADMIN.PRIZE_DRAWS), "Prize Draws", "admin:products:read", {
        description: "Raffle-style listings and their winners.",
        keywords: ["raffle", "lottery", "giveaway"],
      }),
    ],
  },
  {
    title: "Content",
    items: [
      adminItem(String(ROUTES.ADMIN.REVIEWS), "Reviews", "admin:reviews:read", {
        description: "Buyer reviews, and any a seller has replied to.",
        keywords: ["ratings", "feedback", "stars"],
      }),
      adminItem(String(ROUTES.ADMIN.MEDIA),   "Media",   "admin:media:read", {
        description: "Every uploaded image and video.",
        keywords: ["images", "photos", "uploads", "files"],
      }),
      adminItem(String(ROUTES.ADMIN.BLOG),    "Blog",    "admin:blog:read", {
        description: "Write and publish posts.",
        keywords: ["articles", "posts", "news"],
      }),
    ],
  },
  {
    title: "Testing",
    items: [
      adminItem(String(ROUTES.ADMIN.TESTER_CHECKLIST), "Test Cases",     "admin:tester-checklist:read", {
        description: "The checklist testers work through.",
        keywords: ["qa", "checklist", "testing"],
      }),
      adminItem(String(ROUTES.ADMIN.TESTER_FEEDBACK),  "Results",        "admin:tester-feedback:read", {
        description: "Recorded verdicts, and the bugs they found.",
        keywords: ["qa", "feedback", "bug reports"],
      }),
      /*
       * The third item here was "Tester Hub" → /user/tester, the HUMAN
       * tester's own view of the checklist. Deleted in B2 with the programme
       * it served. These two surfaces stay because the Claude tester runs on
       * them: `fetch-cases.mjs` reads the catalogue and `record-verdicts.mjs`
       * writes the answers, and an admin still triages the findings here.
       */
    ],
  },
  {
    title: "Site",
    items: [
      adminItem(String(ROUTES.ADMIN.SITE),                "Site Settings",      "admin:site:read", {
        description: "Branding, fees, integrations, legal pages and feature toggles.",
        keywords: ["config", "configuration", "options", "maintenance mode"],
      }),
      /*
       * Lands in "Site" rather than under the catalogue groups because a tax
       * code is platform configuration: one row is referenced by many
       * categories, and a rate change here reaches every product derived from
       * any of them. Same reasoning as its `admin:site:read` permission.
       */
      adminItem(String(ROUTES.ADMIN.TAX_CODES),           "Tax Codes",          "admin:site:read", {
        description: "HSN codes and their GST rates. Categories point at these; products snapshot the resolved rate.",
        keywords: ["gst", "hsn", "tax", "vat", "rate", "invoice"],
      }),
      /*
       * One control plane, replacing two editors that reached nothing.
       *
       * `/admin/navigation` and `/admin/settings/navigation` both existed and
       * neither one's data reached a sidebar — `filterNavItems` short-circuits
       * on a missing `id`, and no nav item had one until W6. This entry is the
       * one that does.
       */
      /*
       * 🛑 SUPERSEDED, not yet deleted.
       *
       * D7 has the action index absorb this editor and
       * `/admin/settings/navigation`. It keeps its entry until the action-index
       * screen supports rename, re-describe, retag and authoring — deleting a
       * screen before its replacement covers it is the unadopted-layer
       * inversion this plan exists to undo, even when (as here) the screen it
       * replaces edits data no sidebar reads.
       */
      adminItem(String(ROUTES.ADMIN.NAVIGATION),          "Navigation",         "admin:navigation:read", {
        description: "The older nav editor. Superseded by the Action index.",
        keywords: ["menu", "sidebar", "nav", "legacy"],
      }),
      adminItem(String(ROUTES.ADMIN.ACTION_INDEX),        "Action index",       "admin:navigation:read", {
        description: "Every page, setting and toggle a user can reach — hide, rename or retag any of them.",
        keywords: ["navigation", "menu", "sidebar", "search", "shortcuts", "what can i do"],
      }),
      adminItem(String(ROUTES.ADMIN.SECTIONS),            "Sections",           "admin:sections:read", {
        description: "The blocks that make up the homepage, in order.",
        keywords: ["homepage", "layout", "blocks"],
      }),
      /*
       * 🛑 Two different entities, one letter apart — see the warning in
       * route-map.ts. Singular `/admin/carousel` is a SLIDE
       * (`carouselSlides` collection); plural `/admin/carousels` is a named
       * GROUP of slides (`carousels` collection). They had the labels
       * "Carousel" and "Carousels", the same permission, and the SAME keyword
       * array — so sidebar search could not tell them apart at all, and the
       * descriptions that distinguish them are not shown when collapsed.
       *
       * Renamed, never merged. "Named Carousels" is what that page's own
       * heading already says.
       */
      adminItem(String(ROUTES.ADMIN.CAROUSEL),            "Hero Slides",        "admin:carousel:read", {
        description: "The individual slides at the top of the homepage.",
        keywords: ["hero", "banner", "slider", "slide"],
      }),
      adminItem(String(ROUTES.ADMIN.CAROUSELS),           "Named Carousels",    "admin:carousel:read", {
        description: "Groups of slides you can place on any page.",
        keywords: ["carousel group", "named", "collection", "placement"],
      }),
      /*
       * W8 C2 — "Nav Permissions" is a tab here now. Both toggle platform
       * surfaces into the same `siteSettings` singleton under the same
       * `admin:settings:write`, and that shared permission is what made them
       * mergeable: one page carries one `requiredPermission`, so a merge across
       * a permission line silently widens or narrows access.
       */
      adminItem(String(ROUTES.ADMIN.SETTINGS_ACTIONS),    "Permissions Toggles", "admin:settings:write", {
        description: "Turn individual actions and nav entries on or off.",
        keywords: ["rbac", "roles", "access", "menu access", "navigation"],
      }),
      adminItem(String(ROUTES.ADMIN.ADS),                 "Ads",                "admin:ads:read", {
        description: "Ad placements, schedules and their creatives.",
        keywords: ["advertising", "banners", "adsense"],
      }),
      adminItem(String(ROUTES.ADMIN.FAQS),                "FAQs",               "admin:faqs:read", {
        description: "Answers shown on the help pages and in search.",
        keywords: ["help", "questions", "support"],
      }),
      adminItem(String(ROUTES.ADMIN.NEWSLETTER),          "Newsletter",         "admin:newsletter:read", {
        description: "Subscribers, and exporting the list.",
        keywords: ["email list", "mailing", "subscribers"],
      }),
      adminItem(String(ROUTES.ADMIN.CONTACT),             "Contact",            "admin:contact:read", {
        description: "Messages sent through the contact form.",
        keywords: ["enquiries", "messages", "inbox"],
      }),
    ],
  },
  {
    title: "Events",
    items: [
      adminItem(String(ROUTES.ADMIN.EVENTS),            "Events",       "admin:events:read", {
        description: "Sales, polls, raffles and spin-wheels.",
        keywords: ["campaigns", "promotions", "raffle"],
      }),
      adminItem(String(ROUTES.ADMIN.ALL_EVENT_ENTRIES), "All Entries",  "admin:events:read", {
        description: "Everyone who entered an event, across all events.",
        keywords: ["participants", "signups"],
      }),
      adminItem(String(ROUTES.ADMIN.LOTTERIES),         "Lotteries",    "admin:events:read", {
        description: "Slot-based lotteries and their prizes.",
        keywords: ["raffle", "slots", "prizes"],
      }),
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      adminItem(String(ROUTES.ADMIN.SUPPORT_TICKETS),       "Support Tickets",    "admin:support-tickets:read", {
        description: "Tickets buyers and sellers have raised.",
        keywords: ["help", "complaints", "issues"],
      }),
      adminItem(String(ROUTES.ADMIN.MODERATION),            "Moderation",         "admin:moderation:read", {
        description: "Content queued for review.",
        keywords: ["review queue", "flagged", "approve"],
      }),
      adminItem(String(ROUTES.ADMIN.REPORTS),               "Reports",            "admin:moderation:read", {
        description: "What users have reported, and why.",
        keywords: ["flags", "abuse", "complaints"],
      }),
      adminItem(String(ROUTES.ADMIN.ITEM_REQUESTS),         "Item Requests",      "admin:moderation:read", {
        description: "Buyers asking for something nobody lists yet.",
        keywords: ["wanted", "requests", "sourcing"],
      }),
      adminItem(String(ROUTES.ADMIN.BANNED_ADDRESSES),      "Banned Addresses",   "admin:addresses:read", {
        description: "Addresses blocked from ordering, and unban appeals.",
        keywords: ["blocklist", "fraud", "ban"],
      }),
      adminItem(String(ROUTES.ADMIN.ADDRESS_CLUSTERS),      "Address Clusters",   "admin:addresses:read", {
        description: "Accounts sharing one address — a fraud signal.",
        keywords: ["fraud", "duplicates", "linked accounts"],
      }),
      adminItem(String(ROUTES.ADMIN.PAYMENT_METHODS),       "Payment Methods",    "admin:addresses:read", {
        description: "Saved cards and UPI IDs, and any that are blocked.",
        keywords: ["cards", "upi", "wallets"],
      }),
      adminItem(String(ROUTES.ADMIN.PAYMENT_METHODS_CLUSTERS), "Payment Clusters", "admin:addresses:read", {
        description: "Accounts sharing one payment method.",
        keywords: ["fraud", "duplicates", "linked accounts"],
      }),
      adminItem(String(ROUTES.ADMIN.SCAMMERS), "Scam Registry", "admin:scammers:read", {
        description: "Known scammers and the reports behind each.",
        keywords: ["fraud", "blocklist", "report"],
      }),
    ],
  },
  {
    title: "System",
    items: [
      adminItem(String(ROUTES.ADMIN.SESSIONS),      "Sessions",      "admin:sessions:read", {
        description: "Who is signed in, from what device.",
        keywords: ["logins", "devices", "security"],
      }),
      adminItem(String(ROUTES.ADMIN.NOTIFICATIONS), "Notifications", "admin:notifications:read", {
        description: "Notifications sent to users.",
        keywords: ["alerts", "messages", "push"],
      }),
      adminItem(String(ROUTES.ADMIN.CARTS),         "Carts",         "admin:carts:read", {
        description: "What buyers have left in their carts.",
        keywords: ["baskets", "abandoned"],
      }),
      adminItem(String(ROUTES.ADMIN.WISHLISTS),     "Wishlists",     "admin:wishlists:read", {
        description: "What buyers have saved for later.",
        keywords: ["saved", "favourites"],
      }),
      adminItem(String(ROUTES.ADMIN.HISTORY),       "History",       "admin:sessions:read", {
        description: "What buyers have recently looked at.",
        keywords: ["recently viewed", "browsing"],
      }),
      adminItem(String(ROUTES.ADMIN.TEAM),                 "Team",                "admin:team:read", {
        description: "Invite staff and set what each of them can do.",
        keywords: ["staff", "employees", "colleagues", "invite"],
      }),
      /*
       * W8 C2 — the permissions catalogue is a tab here now. It is the
       * reference sheet you consult WHILE building a role, so it belongs on
       * screen beside the role you are editing; both are `admin:roles:read`.
       */
      adminItem(String(ROUTES.ADMIN.ROLES),                "Custom Roles",        "admin:roles:read", {
        description: "Build a role out of individual permissions, and look up what each one unlocks.",
        keywords: ["rbac", "groups", "access", "capabilities", "permissions"],
      }),
      adminItem(String(ROUTES.ADMIN.ADMIN_NOTIFICATIONS),  "Admin Notifications", "admin:notifications:read", {
        description: "Broadcasts sent to staff rather than to users.",
        keywords: ["internal", "announcements", "staff"],
      }),
    ],
  },
  {
    title: "Maintenance",
    items: [
      adminItem("/admin/maintenance",                  "Overview",          "admin:maintenance:view-server-errors", {
        description: "The health of the site's background jobs and errors.",
        keywords: ["status", "monitoring", "health"],
      }),
      adminItem("/admin/maintenance/server-errors",    "Server Errors",     "admin:maintenance:view-server-errors", {
        description: "Failures that happened on the server.",
        keywords: ["500", "crashes", "exceptions", "logs"],
      }),
      adminItem("/admin/maintenance/client-errors",    "Client Errors",     "admin:maintenance:view-client-errors", {
        description: "Failures that happened in someone's browser.",
        keywords: ["javascript", "crashes", "logs"],
      }),
      adminItem("/admin/maintenance/function-errors",  "Function Errors",   "admin:maintenance:view-function-errors", {
        description: "Failures inside the scheduled and triggered jobs.",
        keywords: ["cloud functions", "cron", "logs"],
      }),
      adminItem("/admin/maintenance/payment-rollbacks","Payment Rollbacks", "admin:maintenance:view-payment-rollbacks", {
        description: "Payments that had to be reversed, and why.",
        keywords: ["refund", "reversal", "failed payment"],
      }),
      /*
       * These two belong under Maintenance and Money Cases does not, and the
       * line between them is the external clock. A stuck webhook or an overdue
       * obligation is a diagnostic: it tells you the machinery is behind. The
       * CASE it produces is what carries a deadline and real money, so that
       * lives under Finance with an admin-only permission.
       *
       * Which is also why `maintenance_employee` holds these two permissions
       * and not `admin:payment-cases:*`.
       */
      adminItem(String(ROUTES.ADMIN.MAINTENANCE_GATEWAY_EVENTS), "Gateway Events", "admin:maintenance:view-gateway-events", {
        description: "Every webhook delivery, including types we have no handler for.",
        keywords: ["webhook", "razorpay", "payment event", "delivery", "retry", "inbox"],
      }),
      adminItem(String(ROUTES.ADMIN.MAINTENANCE_OBLIGATIONS), "Obligations", "admin:maintenance:view-obligations", {
        description: "Every deadline in the order lifecycle — what is overdue and what is due this week.",
        keywords: ["deadline", "overdue", "sla", "timer", "waiting", "stuck order"],
      }),
      adminItem("/admin/maintenance/cloud-logs",       "Cloud Logs",        "admin:maintenance:view-cloud-logs", {
        description: "Raw infrastructure logs from Google Cloud.",
        keywords: ["gcp", "logging", "trace"],
      }),
      adminItem("/admin/maintenance/analysis",         "Run Analysis",      "admin:maintenance:run-analysis", {
        description: "Kick off an analysis job by hand.",
        keywords: ["job", "trigger", "batch"],
      }),
    ],
  },
  {
    title: "Guides",
    defaultOpen: false,
    items: [
      adminItem(String(ROUTES.ADMIN.GUIDE),            "All Guides",          "admin:dashboard:view", {
        description: "Every internal how-to in one place.",
        keywords: ["docs", "help", "handbook"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_USERS),      "Users & Accounts",    "admin:users:read", {
        description: "How accounts, roles and bans work.",
        keywords: ["docs", "guide", "handbook"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_CATALOG),    "Catalog Guide",       "admin:products:read", {
        description: "How categories, brands and listings fit together.",
        keywords: ["docs", "guide", "handbook"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_STORES),     "Stores & Sellers",    "admin:stores:read", {
        description: "How seller onboarding and store status work.",
        keywords: ["docs", "guide", "handbook"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_ORDERS),     "Orders & Finance",    "admin:orders:read", {
        description: "How an order becomes a payout.",
        keywords: ["docs", "guide", "handbook"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_CONTENT),    "Content & Marketing", "admin:blog:read", {
        description: "How the homepage, blog and campaigns are run.",
        keywords: ["docs", "guide", "handbook"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_SITE),       "Site Configuration",  "admin:site:read", {
        description: "What every site setting actually changes.",
        keywords: ["docs", "guide", "handbook"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_TEAM),       "Team & Permissions",  "admin:team:read", {
        description: "How to give a colleague exactly the access they need.",
        keywords: ["docs", "guide", "rbac"],
      }),
      // Was labelled "Analytics" with the description AND keywords copied
      // byte-for-byte from the real /admin/analytics screen above, so the two
      // were indistinguishable in search. A guide is named as a guide.
      adminItem(String(ROUTES.ADMIN.GUIDE_ANALYTICS),  "Analytics Guide",     "admin:analytics:view", {
        description: "How to read the revenue, orders and traffic reports.",
        keywords: ["docs", "guide", "reports"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_TRUST),      "Trust & Safety Guide","admin:moderation:read", {
        description: "How fraud signals, bans and appeals work.",
        keywords: ["docs", "guide", "fraud"],
      }),
      adminItem(String(ROUTES.ADMIN.GUIDE_PAYMENTS),   "Payments (Razorpay)", "admin:site:read", {
        description: "How payments, refunds and settlement are configured.",
        keywords: ["docs", "guide", "gateway"],
      }),
    ],
  },
];

// ---------------------------------------------------------------------------
// Store dashboard sidebar
// ---------------------------------------------------------------------------

/**
 * The title of the listing-type group, as a constant.
 *
 * 🛑 `src/app/[locale]/store/layout.tsx` matches on it to filter the group by
 * the store's entitlements, and its own comment already records why the Bundles
 * filter was moved off label-matching: `if (item.label === "Prize Draws")`
 * breaks silently on a rename — the filter stops matching, the item reappears,
 * and nothing says so. The group TITLE had the same exposure; naming it once
 * means a rename moves both sides together.
 */
export const STORE_LISTINGS_GROUP_TITLE = "Listings";

/**
 * Which store route lists each listing type.
 *
 * 🛑 `Record<ListingType, string>`, so a new member of the union cannot be
 * added without being given a route here — and therefore cannot slip past the
 * entitlement filter in `store/layout.tsx` as an unfiltered nav item.
 * `features/products/types/index.ts` warns that adding a union member touches
 * 21 named sites of which only 11 are compile-checked; this is written to be
 * one of the checked ones.
 *
 * Note `bundle` is deliberately absent — it is not a `listingType` (SB-UNI-D
 * moved bundles onto `categories` as a categoryType), which is exactly why the
 * Bundles nav item is filtered separately and unconditionally below.
 */
export const STORE_LISTING_TYPE_ROUTES: Record<ListingType, string> = {
  standard: String(ROUTES.STORE.PRODUCTS),
  spares: String(ROUTES.STORE.SPARES),
  auction: String(ROUTES.STORE.AUCTIONS),
  "pre-order": String(ROUTES.STORE.PRE_ORDERS),
  "prize-draw": String(ROUTES.STORE.PRIZE_DRAWS),
  classified: String(ROUTES.STORE.CLASSIFIED),
  "digital-code": String(ROUTES.STORE.DIGITAL_CODES),
  live: String(ROUTES.STORE.LIVE_ITEMS),
  art: String(ROUTES.STORE.ART),
  stickers: String(ROUTES.STORE.STICKERS),
};

// Every page under src/app/[locale]/store/** must have a nav entry here —
// see CLAUDE.md Root Cause Pattern #29 (orphaned page.tsx with no nav entry).
export const STORE_NAV_GROUPS: StoreNavGroup[] = [
  {
    title: "Overview",
    items: [
      storeItem(String(ROUTES.STORE.DASHBOARD), "Dashboard", {
        description: "Your sales today, and anything waiting on you.",
        keywords: ["home", "overview"],
      }),
    ],
  },
  {
    title: STORE_LISTINGS_GROUP_TITLE,
    items: [
      storeItem(String(ROUTES.STORE.PRODUCTS), "Products", {
        description: "Your listings — add, edit, restock or retire them.",
        keywords: ["inventory", "stock", "catalogue"],
      }),
      storeItem(String(ROUTES.STORE.ART), "Art", {
        description: "Your art prints.",
        keywords: ["prints", "posters"],
      }),
      storeItem(String(ROUTES.STORE.STICKERS), "Stickers", {
        description: "Your sticker sheets.",
        keywords: ["decals", "vinyl", "sticker sheet"],
      }),
      storeItem(String(ROUTES.STORE.SPARES), "Spares", {
        description: "Single parts you have going spare.",
        keywords: ["parts", "attack ring", "weight disk", "driver", "loose"],
      }),
      storeItem(String(ROUTES.STORE.AUCTIONS), "Auctions", {
        description: "Your auctions and the bids on them.",
        keywords: ["bidding", "timed sale"],
      }),
      storeItem(String(ROUTES.STORE.PRE_ORDERS), "Pre-Orders", {
        description: "Items buyers can reserve before you have them.",
        keywords: ["reserve", "preorder", "deposit"],
      }),
      storeItem(String(ROUTES.STORE.PRIZE_DRAWS), "Prize Draws", {
        description: "Raffle-style listings you are running.",
        keywords: ["raffle", "giveaway"],
      }),
      storeItem(String(ROUTES.STORE.BUNDLES), "Bundles", {
        description: "Multi-item packs at one price.",
        keywords: ["packs", "combo", "sets"],
      }),
      storeItem(String(ROUTES.STORE.CLASSIFIED), "Classified", {
        description: "Contact-only listings buyers cannot add to a cart.",
        keywords: ["meetup", "local", "no shipping"],
      }),
      storeItem(String(ROUTES.STORE.DIGITAL_CODES), "Digital Codes", {
        description: "Listings that deliver a code instead of a parcel.",
        keywords: ["keys", "vouchers"],
      }),
      storeItem(String(ROUTES.STORE.LIVE_ITEMS), "Live Items", {
        description: "Live animals or plants you sell.",
        keywords: ["animals", "plants"],
      }),
      storeItem(String(ROUTES.STORE.GROUPED_LISTINGS), "Grouped Listings", {
        description: "Theme scrollers shown beside your products.",
        keywords: ["related", "collections"],
      }),
      storeItem(String(ROUTES.STORE.SUBLISTING_CATEGORIES), "Sub-listing Categories", {
        description: "Your own sub-categories inside a category.",
        keywords: ["taxonomy", "grouping"],
      }),
      storeItem(String(ROUTES.STORE.FEATURES), "Feature Badges", {
        description: "Badges shown on your listings.",
        keywords: ["labels", "chips", "flags"],
      }),
      storeItem(String(ROUTES.STORE.LISTING_TEMPLATES), "Listing Templates", {
        description: "Reusable starting points for a new listing.",
        keywords: ["presets", "boilerplate"],
      }),
      storeItem(String(ROUTES.STORE.STORE_CATEGORIES), "Store Categories", {
        description: "How your storefront is organised for buyers.",
        keywords: ["shop sections", "taxonomy"],
      }),
    ],
  },
  {
    title: "Orders & Reviews",
    items: [
      storeItem(String(ROUTES.STORE.ORDERS), "Orders", {
        description: "Orders to pack, ship and get paid for.",
        keywords: ["sales", "shipping", "fulfil"],
      }),
      storeItem(String(ROUTES.STORE.REVIEWS), "Reviews", {
        description: "What buyers said, and your replies.",
        keywords: ["ratings", "feedback", "stars"],
      }),
      storeItem(String(ROUTES.STORE.BIDS), "Bids", {
        description: "Bids placed on your auctions.",
        keywords: ["auction", "bidding"],
      }),
      storeItem(String(ROUTES.STORE.OFFERS), "Offers", {
        description: "Price offers from buyers — accept, counter or decline.",
        keywords: ["negotiation", "haggle"],
      }),
    ],
  },
  {
    title: "Finance",
    items: [
      storeItem(String(ROUTES.STORE.ANALYTICS), "Analytics", {
        description: "How your listings and revenue are doing.",
        keywords: ["reports", "sales", "charts"],
      }),
      /*
       * W8 C2 — "Payout Methods" and "Payout Settings" are tabs here now, so
       * their keywords move onto this entry: the sidebar search has to keep
       * finding "upi" and "threshold", which are the words someone actually
       * types, and the tab labels alone would not.
       */
      storeItem(String(ROUTES.STORE.PAYOUTS), "Payouts", {
        description: "What you are owed, where it goes, and on what schedule.",
        keywords: [
          "money", "settlement", "earnings",
          "bank account", "upi", "payment details",
          "schedule", "frequency", "threshold",
        ],
      }),
      /*
       * 🛑 Payout SETTINGS had no nav entry at all — audit-nav-page-wiring
       * listed /store/payout-settings as an orphan reachable only by typing the
       * URL. That page is where every seller preference round-trips (payout
       * method, EMI, GST-inclusive pricing, the two buyer protections, and now
       * advanced listing types), so an unreachable page meant those settings
       * were effectively unreachable too — a feature with a working backend and
       * no way in is Root Cause #37's shape.
       *
       * Distinct from "Payouts" above, which is the ledger: what you are owed.
       * This is how and where it is paid, plus the seller's own toggles.
       */
      storeItem(String(ROUTES.STORE.PAYOUT_SETTINGS), "Payout & Preferences", {
        description:
          "How you get paid, plus your selling preferences — EMI, GST pricing, buyer protections and advanced listing types.",
        keywords: [
          "settings", "preferences", "bank account", "upi", "ifsc",
          "gstin", "tax", "emi", "protection",
          "advanced listing types", "pre-order", "prize draw", "classified",
        ],
      }),
      storeItem(String(ROUTES.STORE.ANALYTICS_CARDS), "Analytics Cards", {
        description: "The charts on your analytics page.",
        keywords: ["widgets", "dashboard", "reports"],
      }),
      storeItem(String(ROUTES.STORE.ANALYTICS_ALERTS), "Analytics Alerts", {
        description: "Get told when a number crosses a line.",
        keywords: ["notifications", "thresholds", "warnings"],
      }),
    ],
  },
  {
    title: "Store",
    items: [
      // W8 C2 — absorbs "Store Slug" as a tab; the slug is one field of the
      // shop's identity and sat two nav groups away from the rest of it.
      storeItem(String(ROUTES.STORE.STOREFRONT), "Storefront", {
        description: "Your shop's name, logo, banner, description and web address.",
        keywords: ["branding", "shop page", "profile", "url", "link", "domain", "slug"],
      }),
      // W8 C2 — absorbs "Shipping Configs" as a tab, and its keywords with it.
      storeItem(String(ROUTES.STORE.SHIPPING), "Shipping", {
        description: "What you charge to ship, where you ship to, and reusable presets.",
        keywords: ["delivery", "postage", "rates", "presets", "shipping configs"],
      }),
      // W8 C2 — absorbs "Print Center" as a tab. The nav already said these
      // two belonged together; now they are one page.
      storeItem(String(ROUTES.STORE.FULFILLMENT), "Fulfillment", {
        description: "Orders waiting to be packed, and the paperwork to send them.",
        keywords: ["dispatch", "packing", "shipping", "labels", "invoice", "barcode", "print"],
      }),
      storeItem(String(ROUTES.STORE.ADDRESSES), "Addresses", {
        description: "Where you ship from.",
        keywords: ["pickup", "warehouse", "return address"],
      }),
      storeItem(String(ROUTES.STORE.COUPONS), "Coupons", {
        description: "Your own discount codes.",
        keywords: ["voucher", "promo code", "discount"],
      }),
      /*
       * W11 — the seller's first sight of tickets raised about their own
       * store. There was no page, no route and no route-map constant, because
       * `SupportTicketDocument` had no queryable `storeId`: "the tickets about
       * my store" was not a question the data could answer.
       */
      storeItem(String(ROUTES.STORE.SUPPORT), "Support", {
        description: "Tickets buyers and staff have raised about your store.",
        keywords: ["tickets", "complaints", "help", "disputes"],
      }),
      storeItem(String(ROUTES.STORE.GOOGLE_REVIEWS), "Google Reviews", {
        description: "Show your Google Business reviews on your shop page.",
        keywords: ["ratings", "reputation"],
      }),
    ],
  },
  {
    title: "Guides",
    defaultOpen: false,
    items: [
      storeItem(String(ROUTES.STORE.GUIDE), "All Guides", {
        description: "Every seller how-to in one place.",
        keywords: ["help", "docs", "handbook"],
      }),
      storeItem(String(ROUTES.STORE.GUIDE_LISTINGS), "Listings Guide", {
        description: "How to list, price and photograph what you sell.",
        keywords: ["help", "docs", "guide"],
      }),
      // Was labelled "Orders" with the description AND keywords copied
      // byte-for-byte from the real /store/orders screen, so the seller's own
      // order list and its documentation were indistinguishable in search.
      storeItem(String(ROUTES.STORE.GUIDE_ORDERS), "Orders Guide", {
        description: "How to pack, ship and get paid for an order.",
        keywords: ["help", "docs", "guide"],
      }),
      storeItem(String(ROUTES.STORE.GUIDE_FINANCE), "Finance Guide", {
        description: "How payouts, fees and settlement work.",
        keywords: ["help", "docs", "guide"],
      }),
      storeItem(String(ROUTES.STORE.GUIDE_SETTINGS), "Settings", {
        description: "How to set up your shop.",
        keywords: ["help", "docs", "guide"],
      }),
      storeItem(String(ROUTES.STORE.GUIDE_CAPABILITIES), "Capabilities", {
        description: "What your store is allowed to do, and how to unlock more.",
        keywords: ["permissions", "limits", "access"],
      }),
    ],
  },
];

// ---------------------------------------------------------------------------
// User account sidebar
// ---------------------------------------------------------------------------

export const USER_NAV_GROUPS: UserNavGroup[] = [
  {
    title: "Account",
    items: [
      userItem(String(ROUTES.USER.DASHBOARD), "Dashboard", {
        description: "Your orders, bids and anything needing attention.",
        keywords: ["home", "overview"],
      }),
      userItem(String(ROUTES.USER.PROFILE), "My Profile", {
        description: "Your name, photo, bio and whether people can see them.",
        keywords: ["account", "avatar", "about me"],
      }),
      userItem(String(ROUTES.USER.SETTINGS), "Settings", {
        description: "Email, password, language, theme and notifications.",
        keywords: ["account", "preferences", "password"],
      }),
      userItem(String(ROUTES.USER.NOTIFICATIONS), "Notifications", {
        description: "What the site has told you.",
        keywords: ["alerts", "updates", "inbox"],
      }),
      /*
       * Added with their pages in the same change (Rule #8 / Root Cause #37).
       * Both APIs predate the pages by a long way — and the buyer help guide
       * already named the Sessions one, so until now it was advertising a
       * security control that did not exist.
       */
      userItem(String(ROUTES.USER.SESSIONS), "Signed-in devices", {
        description: "Every device signed in to your account — sign out any you do not recognise.",
        keywords: ["sessions", "security", "devices", "logout", "sign out"],
      }),
      userItem(String(ROUTES.USER.PAYMENT_METHODS), "Payment methods", {
        description: "Cards and UPI IDs saved to your account.",
        keywords: ["cards", "upi", "saved", "wallet", "billing"],
      }),
    ],
  },
  {
    title: "Shopping",
    items: [
      userItem(String(ROUTES.USER.ORDERS), "My Orders", {
        description: "What you bought, and where it is.",
        keywords: ["purchases", "tracking", "delivery"],
      }),
      userItem(String(ROUTES.USER.WISHLIST), "Wishlist", {
        description: "Things you saved for later.",
        keywords: ["saved", "favourites", "watchlist"],
      }),
      userItem(String(ROUTES.USER.ADDRESSES), "Addresses", {
        description: "Where your orders get delivered.",
        keywords: ["delivery", "shipping", "postcode", "pin code"],
      }),
      userItem(String(ROUTES.USER.REVIEWS), "My Reviews", {
        description: "Reviews you have written.",
        keywords: ["ratings", "feedback"],
      }),
      userItem(String(ROUTES.USER.CLAIMED_COUPONS), "My Coupons", {
        description: "Discount codes you have claimed.",
        keywords: ["vouchers", "promo codes", "discounts"],
      }),
      userItem(String(ROUTES.USER.POINTS), "My Points", {
        description: "Points earned on shipping, and what they are worth.",
        keywords: ["rewards", "credit", "balance", "shipping refund"],
      }),
      userItem(String(ROUTES.USER.EVENTS), "My Events", {
        description: "Events you entered, and whether you won.",
        keywords: ["raffles", "competitions", "entries"],
      }),
      userItem(String(ROUTES.USER.BIDS), "My Bids", {
        description: "Auctions you are bidding on.",
        keywords: ["auctions", "bidding", "watching"],
      }),
      userItem(String(ROUTES.USER.OFFERS), "My Offers", {
        description: "Prices you offered sellers, and their replies.",
        keywords: ["negotiation", "haggle"],
      }),
      userItem(String(ROUTES.USER.HISTORY), "Recently Viewed", {
        description: "Things you looked at recently.",
        keywords: ["history", "browsing"],
      }),
      userItem(String(ROUTES.USER.CATALOGUE), "My Catalogue", {
        description: "Your own collection — private, or shown on your profile.",
        keywords: ["collection", "inventory", "my items"],
      }),
      userItem(String(ROUTES.USER.RETURNS), "My Returns", {
        description: "Returns you asked for, and their refunds.",
        keywords: ["refunds", "send back", "rma"],
      }),
      userItem(String(ROUTES.USER.PRE_ORDERS), "My Pre-Orders", {
        description: "Items you reserved before release.",
        keywords: ["reservations", "deposits"],
      }),
      userItem(String(ROUTES.USER.DIGITAL_CODES), "My Digital Codes", {
        description: "Codes you bought, ready to redeem.",
        keywords: ["keys", "vouchers", "redeem"],
      }),
      userItem(String(ROUTES.USER.PRIZE_DRAWS), "My Prize Draws", {
        description: "Draws you entered, and the results.",
        keywords: ["raffles", "giveaways"],
      }),
    ],
  },
  {
    title: "Selling",
    items: [
      userItem(String(ROUTES.USER.BECOME_SELLER), "Open a Store", {
        description: "Start selling your own collectibles on LetItRip.",
        keywords: ["sell", "become a seller", "my shop"],
      }),
    ],
  },
  {
    title: "Help",
    items: [
      userItem(String(ROUTES.USER.SUPPORT), "Support Tickets", {
        description: "Help you have asked for, and the replies.",
        keywords: ["help", "contact", "complaints"],
      }),
      userItem(String(ROUTES.PUBLIC.HELP), "Help Center", {
        description: "Answers to common questions.",
        keywords: ["faq", "help", "support"],
      }),
    ],
  },
];

export const USER_NAV_ALL_ITEMS: UserNavItem[] = USER_NAV_GROUPS.flatMap((g) => g.items ?? []);

/**
 * Resolve the user dashboard sidebar groups, swapping the "Selling" group's
 * single item between "Store Dashboard" (sellers/admins) and "Open a Store"
 * (everyone else). Kept here (not in the layout component) so the layout
 * shim stays declarative and the seller-vs-buyer rule is single-sourced.
 */
const SELLING_GROUP_TITLE = "Selling";
const STORE_DASHBOARD_LABEL = "Store Dashboard";
const BECOME_SELLER_LABEL = "Open a Store";

const ACCOUNT_GROUP_TITLE = "Account";

/*
 * 🛑 `isTester` / `canTestAdmin` were REMOVED from this signature in B2,
 * together with the runtime-injected "Testing" group they gated. That group
 * held exactly two items: the human Tester Hub (/user/tester, deleted) and a
 * duplicate /admin link for a tester who already had admin access.
 *
 * The caller was updated in the same change — a public signature change
 * without its call site is Root Cause #20, and the consumer typechecks
 * against bundled dist types, so it would have compiled locally and broken
 * on the next rebuild.
 */
export function getUserNavGroups(
  isSeller: boolean,
  userId?: string,
  /**
   * `siteSettings.support.enabled`. Defaults TRUE so a caller that has not
   * loaded settings yet shows support rather than hiding it — the safe state
   * is reachable, and a flash of a missing nav item would read as a bug.
   *
   * 🛑 Hiding the nav entry is HALF the job. The route must 404 as well, or a
   * buyer who bookmarked `/user/support` still reaches it and the switch is
   * decorative. That guard lives on the page itself.
   */
  supportEnabled = true,
): UserNavGroup[] {
  /*
   * Through the helper like every other item, so it gets an `id` too. It was a
   * bare literal behind an `as UserNavItem` cast, with a note saying `confirm`
   * "ships with the next appkit publish" — that publish has happened, and
   * `UserNavItem extends SidebarNavItem` now, so both the cast and the note
   * were describing a state that no longer existed.
   */
  const sellingItem: UserNavItem = isSeller
    ? {
        ...userItem(String(ROUTES.STORE.DASHBOARD), STORE_DASHBOARD_LABEL, {
          description: "Switch to the seller side to manage your listings and orders.",
          keywords: ["seller", "shop", "my store"],
        }),
        confirm: {
          message: "Leave your buyer dashboard for the seller dashboard?",
        },
      }
    : userItem(String(ROUTES.USER.BECOME_SELLER), BECOME_SELLER_LABEL, {
        description: "Open a store and start listing your own collectibles.",
        keywords: ["sell", "open a shop", "become a seller"],
      });
  return USER_NAV_GROUPS.map((group) => {
    if (group.title === SELLING_GROUP_TITLE) return { ...group, items: [sellingItem] };
    if (group.title === ACCOUNT_GROUP_TITLE && userId) {
      return {
        ...group,
        items: [
          ...group.items,
          { href: String(ROUTES.PUBLIC.PROFILE(userId)), label: "View Public Profile" },
        ],
      };
    }
    /*
     * Support off hides the buyer's ticket entry — but NOT the Help Center,
     * which is the FAQ and is not part of the support integration. Dropping
     * both would take away the self-serve answers at the exact moment the
     * human channel closed, which is the opposite of what you want.
     *
     * The group itself is dropped when nothing is left in it, so an empty
     * "Help" heading never renders.
     */
    if (!supportEnabled) {
      const items = group.items.filter((i) => i.href !== String(ROUTES.USER.SUPPORT));
      if (items.length !== group.items.length) return { ...group, items };
    }
    return group;
  }).filter((group) => (group.items?.length ?? 0) > 0);
}
