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
  Package2,
  Gift,
  Palette,
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
import { NAV_ICON_COLORS, NAV_ICON_SIZE_SM } from "./styles/nav-icons";
import { ROUTES } from "./routes";

// ---------------------------------------------------------------------------
// NavItem — public navbar entry (label injected at runtime via tNav)
// icon uses appkit's ReactNode so the type is consistent when spread into MainNavbarItem
// ---------------------------------------------------------------------------

export interface NavItem {
  key: string;
  href: string;
  icon: MainNavbarItem["icon"];
  highlighted?: boolean;
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
  { key: "products",   href: String(ROUTES.PUBLIC.PRODUCTS),      icon: <ShoppingBag  className={`${iconSm} ${navIcons.products}`}   /> },
  { key: "auctions",   href: String(ROUTES.PUBLIC.AUCTIONS),      icon: <Gavel        className={`${iconSm} ${navIcons.auctions}`}   /> },
  { key: "preOrders",  href: String(ROUTES.PUBLIC.PRE_ORDERS),    icon: <CalendarCheck className={`${iconSm} ${navIcons.preOrders}`} /> },
  { key: "bundles",    href: String(ROUTES.PUBLIC.BUNDLES),       icon: <Package2     className={`${iconSm} ${navIcons.bundles}`}    /> },
  { key: "prizeDraws", href: String(ROUTES.PUBLIC.PRIZE_DRAWS),   icon: <Gift         className={`${iconSm} ${navIcons.prizeDraws}`} /> },
  { key: "artStickers", href: String(ROUTES.PUBLIC.ART),          icon: <Palette      className={`${iconSm} ${navIcons.artStickers}`} /> },
  { key: "categories", href: String(ROUTES.PUBLIC.CATEGORIES),    icon: <LayoutGrid   className={`${iconSm} ${navIcons.categories}`} /> },
  { key: "stores",     href: String(ROUTES.PUBLIC.STORES),        icon: <Store        className={`${iconSm} ${navIcons.stores}`}     /> },
  { key: "events",     href: String(ROUTES.PUBLIC.EVENTS),        icon: <CalendarDays className={`${iconSm} ${navIcons.events}`}     /> },
  { key: "blog",       href: String(ROUTES.PUBLIC.BLOG),          icon: <BookOpen     className={`${iconSm} ${navIcons.blog}`}       /> },
  { key: "reviews",    href: String(ROUTES.PUBLIC.REVIEWS),       icon: <Star         className={`${iconSm} ${navIcons.reviews}`}    /> },
  { key: "scams",      href: String(ROUTES.PUBLIC.SCAMS),         icon: <ShieldAlert  className={`${iconSm} ${CLS_SCAM_ICON}`}        /> },
  { key: "about",      href: String(ROUTES.PUBLIC.ABOUT),         icon: <Info         className={`${iconSm} ${navIcons.about}`}      /> },
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

export const FOOTER_LINK_GROUPS = [
  {
    heading: "Shop",
    links: [
      { label: "Products",    href: String(ROUTES.PUBLIC.PRODUCTS)    },
      { label: "Auctions",    href: String(ROUTES.PUBLIC.AUCTIONS)    },
      { label: "Pre-Orders",  href: String(ROUTES.PUBLIC.PRE_ORDERS)  },
      { label: "Bundles",     href: String(ROUTES.PUBLIC.BUNDLES)     },
      { label: "Prize Draws", href: String(ROUTES.PUBLIC.PRIZE_DRAWS) },
      { label: "Art & Stickers", href: String(ROUTES.PUBLIC.ART)      },
      { label: "Promotions",  href: String(ROUTES.PUBLIC.PROMOTIONS)  },
      { label: "Stores",      href: String(ROUTES.PUBLIC.STORES)      },
      { label: "Categories",  href: String(ROUTES.PUBLIC.CATEGORIES)  },
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
      // SB5-A — DX34 will swap these for external docs.letitrip.in/sellers/* URLs.
      { label: "Bundle Guide",         href: String(ROUTES.PUBLIC.SELLER_GUIDE_BUNDLES)     },
      { label: "Prize Draw Guide",     href: String(ROUTES.PUBLIC.SELLER_GUIDE_PRIZE_DRAWS) },
      { label: "Blog",                 href: String(ROUTES.PUBLIC.BLOG)                },
      { label: "Events",               href: String(ROUTES.PUBLIC.EVENTS)              },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service",  href: String(ROUTES.PUBLIC.TERMS)           },
      { label: "Code of Conduct",   href: String(ROUTES.PUBLIC.CODE_OF_CONDUCT) },
      { label: "Privacy Policy",    href: String(ROUTES.PUBLIC.PRIVACY)         },
      { label: "Cookie Policy",     href: String(ROUTES.PUBLIC.COOKIE_POLICY)   },
      { label: "Refund Policy",     href: String(ROUTES.PUBLIC.REFUND_POLICY)   },
      { label: "Shipping Policy",   href: String(ROUTES.PUBLIC.SHIPPING_POLICY) },
    ],
  },
];

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
    ],
  },
  {
    title: "Catalog",
    items: [
      adminItem(String(ROUTES.ADMIN.CATEGORIES),            "Categories",    "admin:categories:read", {
        description: "The category tree buyers browse by.",
        keywords: ["taxonomy", "tree", "browse"],
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
        description: "What testers answered, and the bugs they found.",
        keywords: ["qa", "feedback", "bug reports"],
      }),
      adminItem(String(ROUTES.USER.TESTER_HUB),        "Tester Hub",     "admin:tester-checklist:read", {
        description: "The tester's own view of the checklist.",
        keywords: ["qa", "testing"],
      }),
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
      adminItem(String(ROUTES.ADMIN.COPILOT),              "Copilot",             "admin:copilot:view", {
        description: "The assistant's settings and its conversation log.",
        keywords: ["ai", "assistant", "chat"],
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
      adminItem(String(ROUTES.ADMIN.GUIDE_WHATSAPP),   "WhatsApp Integration","admin:site:read", {
        description: "How WhatsApp notifications and catalogue sync are set up.",
        keywords: ["docs", "guide", "meta"],
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
    title: "Listings",
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
      storeItem(String(ROUTES.STORE.WHATSAPP), "WhatsApp", {
        description: "Send buyers order updates on WhatsApp.",
        keywords: ["notifications", "messaging", "meta"],
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
      storeItem(String(ROUTES.STORE.GUIDE_WHATSAPP), "WhatsApp Catalog Sync", {
        description: "Push your listings into a WhatsApp catalogue.",
        keywords: ["help", "docs", "meta"],
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
  {
    /*
     * Deliberately empty. `getUserNavGroups()` fills this group at runtime and
     * ONLY when `isTester` — a static entry here would show the Tester Hub to
     * every buyer.
     *
     * It read as a bug for a while because the nav audit's extractor stopped
     * at the first `
];` and never parsed the runtime injections, so
     * `/user/tester` looked like an orphan page and escaped that status only
     * because an unrelated ADMIN_NAV_GROUPS line happens to reference it.
     * The extractor parses `getUserNavGroups()` now, so the group is empty
     * here and still covered.
     */
    title: "Testing",
    items: [],
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

const TESTING_GROUP_TITLE = "Testing";

export function getUserNavGroups(
  isSeller: boolean,
  userId?: string,
  isTester?: boolean,
  canTestAdmin?: boolean,
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
    if (group.title === TESTING_GROUP_TITLE && isTester) {
      const testerItems: UserNavItem[] = [
        { href: String(ROUTES.USER.TESTER_HUB), label: "Tester Hub" },
      ];
      if (canTestAdmin) {
        testerItems.push({
          href: String(ROUTES.ADMIN.DASHBOARD),
          label: "Admin Dashboard (Testing)",
        });
      }
      return { ...group, items: testerItems };
    }
    return group;
  });
}
