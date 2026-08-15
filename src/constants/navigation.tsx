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
} from "lucide-react";
import type {
  AdminNavGroup,
  StoreNavGroup,
  UserNavGroup,
  UserNavItem,
  MainNavbarItem,
  AppLayoutShellSidebarLink,
} from "@mohasinac/appkit/client";
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
  { key: "categories", href: String(ROUTES.PUBLIC.CATEGORIES),    icon: <LayoutGrid   className={`${iconSm} ${navIcons.categories}`} /> },
  { key: "stores",     href: String(ROUTES.PUBLIC.STORES),        icon: <Store        className={`${iconSm} ${navIcons.stores}`}     /> },
  { key: "events",     href: String(ROUTES.PUBLIC.EVENTS),        icon: <CalendarDays className={`${iconSm} ${navIcons.events}`}     /> },
  { key: "blog",       href: String(ROUTES.PUBLIC.BLOG),          icon: <BookOpen     className={`${iconSm} ${navIcons.blog}`}       /> },
  { key: "reviews",    href: String(ROUTES.PUBLIC.REVIEWS),       icon: <Star         className={`${iconSm} ${navIcons.reviews}`}    /> },
  { key: "scams",      href: String(ROUTES.PUBLIC.SCAMS),         icon: <ShieldAlert  className={`${iconSm} ${CLS_SCAM_ICON}`}        /> },
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

/** Build an admin nav item without repeating `requiredPermission:` on every line. */
function adminItem(
  href: string,
  label: string,
  requiredPermission: string,
): { href: string; label: string; requiredPermission: string } {
  return { href, label, requiredPermission };
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Management",
    items: [
      adminItem(String(ROUTES.ADMIN.DASHBOARD),       "Dashboard",       "admin:dashboard:view"),
      adminItem(String(ROUTES.ADMIN.USERS),           "Users",           "admin:users:read"),
      adminItem(String(ROUTES.ADMIN.PRODUCTS),        "Products",        "admin:products:read"),
      adminItem(String(ROUTES.ADMIN.CLASSIFIED),      "Classified",      "admin:products:read"),
      adminItem(String(ROUTES.ADMIN.DIGITAL_CODES),   "Digital Codes",   "admin:products:read"),
      adminItem(String(ROUTES.ADMIN.LIVE),            "Live Items",      "admin:products:read"),
      adminItem(String(ROUTES.ADMIN.ART),             "Art",             "admin:products:read"),
      adminItem(String(ROUTES.ADMIN.STICKERS),        "Stickers",        "admin:products:read"),
      adminItem(String(ROUTES.ADMIN.ORDERS),          "Orders",          "admin:orders:read"),
      adminItem(String(ROUTES.ADMIN.FULFILLMENT),     "Fulfillment",     "admin:orders:read"),
      adminItem(String(ROUTES.ADMIN.RETURN_REQUESTS), "Returns",         "admin:returns:read"),
      adminItem(String(ROUTES.ADMIN.STORES),          "Stores",          "admin:stores:read"),
      adminItem(String(ROUTES.ADMIN.STORE_ADDRESSES), "Store Addresses", "admin:store-addresses:read"),
      adminItem(String(ROUTES.ADMIN.ADDRESSES),       "Addresses",       "admin:addresses:read"),
    ],
  },
  {
    title: "Finance",
    items: [
      adminItem(String(ROUTES.ADMIN.ANALYTICS), "Analytics", "admin:analytics:view"),
      // Payouts hidden until FEATURE_PAYOUTS (P7).
    ],
  },
  {
    title: "Procurement",
    items: [
      adminItem(String(ROUTES.ADMIN.SHIPMENTS), "Shipments", "admin:shipments:read"),
      adminItem(String(ROUTES.ADMIN.SHIPMENTS_PROJECTIONS), "Projections", "admin:shipments:read"),
      adminItem(String(ROUTES.ADMIN.CATALOGUE_APPROVALS), "Catalogue Approvals", "admin:catalogue:read"),
    ],
  },
  {
    title: "Catalog",
    items: [
      adminItem(String(ROUTES.ADMIN.CATEGORIES),            "Categories",    "admin:categories:read"),
      adminItem(String(ROUTES.ADMIN.BRANDS),                "Brands",        "admin:brands:read"),
      adminItem(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES), "Sub-listings",  "admin:categories:read"),
      adminItem(String(ROUTES.ADMIN.FEATURES),              "Feature Badges","admin:categories:read"),
      adminItem(String(ROUTES.ADMIN.DEALS),                 "Deals",         "admin:deals:read"),
      adminItem(String(ROUTES.ADMIN.FEATURED),              "Featured",      "admin:featured:read"),
      adminItem(String(ROUTES.ADMIN.COUPONS), "Coupons", "admin:coupons:read"),
      adminItem(String(ROUTES.ADMIN.PRINT_CENTER), "Print Center", "admin:products:read"),
      // Hidden until feature patch ships: Bundles, Prize Draws (P10).
    ],
  },
  {
    title: "Content",
    items: [
      adminItem(String(ROUTES.ADMIN.REVIEWS), "Reviews", "admin:reviews:read"),
      adminItem(String(ROUTES.ADMIN.MEDIA),   "Media",   "admin:media:read"),
      adminItem(String(ROUTES.ADMIN.BLOG),    "Blog",    "admin:blog:read"),
      adminItem(String(ROUTES.ADMIN.BIDS),    "Bids",    "admin:bids:read"),
    ],
  },
  {
    title: "Site",
    items: [
      adminItem(String(ROUTES.ADMIN.SITE),                "Site Settings",      "admin:site:read"),
      adminItem(String(ROUTES.ADMIN.NAVIGATION),          "Navigation",         "admin:navigation:read"),
      adminItem(String(ROUTES.ADMIN.SECTIONS),            "Sections",           "admin:sections:read"),
      adminItem(String(ROUTES.ADMIN.CAROUSEL),            "Carousel",           "admin:carousel:read"),
      adminItem(String(ROUTES.ADMIN.SETTINGS_ACTIONS),    "Action Permissions", "admin:settings:write"),
      adminItem(String(ROUTES.ADMIN.SETTINGS_NAVIGATION), "Nav Permissions",    "admin:settings:write"),
      adminItem(String(ROUTES.ADMIN.ADS),                 "Ads",                "admin:ads:read"),
      adminItem(String(ROUTES.ADMIN.FAQS),                "FAQs",               "admin:faqs:read"),
      adminItem(String(ROUTES.ADMIN.NEWSLETTER),          "Newsletter",         "admin:newsletter:read"),
      adminItem(String(ROUTES.ADMIN.CONTACT),             "Contact",            "admin:contact:read"),
    ],
  },
  {
    title: "Events",
    items: [
      adminItem(String(ROUTES.ADMIN.EVENTS),            "Events",       "admin:events:read"),
      adminItem(String(ROUTES.ADMIN.ALL_EVENT_ENTRIES), "All Entries",  "admin:events:read"),
      adminItem(String(ROUTES.ADMIN.LOTTERIES),         "Lotteries",    "admin:events:read"),
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      adminItem(String(ROUTES.ADMIN.SUPPORT_TICKETS),       "Support Tickets",    "admin:support-tickets:read"),
      adminItem(String(ROUTES.ADMIN.MODERATION),            "Moderation",         "admin:moderation:read"),
      adminItem(String(ROUTES.ADMIN.REPORTS),               "Reports",            "admin:moderation:read"),
      adminItem(String(ROUTES.ADMIN.ITEM_REQUESTS),         "Item Requests",      "admin:moderation:read"),
      adminItem(String(ROUTES.ADMIN.BANNED_ADDRESSES),      "Banned Addresses",   "admin:addresses:read"),
      adminItem(String(ROUTES.ADMIN.ADDRESS_CLUSTERS),      "Address Clusters",   "admin:addresses:read"),
      adminItem(String(ROUTES.ADMIN.PAYMENT_METHODS),       "Payment Methods",    "admin:addresses:read"),
      adminItem(String(ROUTES.ADMIN.PAYMENT_METHODS_CLUSTERS), "Payment Clusters", "admin:addresses:read"),
      // Scam Registry hidden until FEATURE_SCAM_REGISTRY (P12).
    ],
  },
  {
    title: "System",
    items: [
      adminItem(String(ROUTES.ADMIN.SESSIONS),      "Sessions",      "admin:sessions:read"),
      adminItem(String(ROUTES.ADMIN.NOTIFICATIONS), "Notifications", "admin:notifications:read"),
      adminItem(String(ROUTES.ADMIN.CARTS),         "Carts",         "admin:carts:read"),
      adminItem(String(ROUTES.ADMIN.WISHLISTS),     "Wishlists",     "admin:wishlists:read"),
      adminItem(String(ROUTES.ADMIN.HISTORY),       "History",       "admin:sessions:read"),
      adminItem(String(ROUTES.ADMIN.FEATURE_FLAGS), "Feature Flags", "admin:feature-flags:read"),
      adminItem(String(ROUTES.ADMIN.COPILOT),              "Copilot",             "admin:copilot:view"),
      adminItem(String(ROUTES.ADMIN.TEAM),                 "Team",                "admin:team:read"),
      adminItem(String(ROUTES.ADMIN.ROLES),                "Custom Roles",        "admin:roles:read"),
      adminItem(String(ROUTES.ADMIN.ADMIN_NOTIFICATIONS),  "Admin Notifications", "admin:notifications:read"),
    ],
  },
  {
    title: "Maintenance",
    items: [
      adminItem("/admin/maintenance",                  "Overview",          "admin:maintenance:view-server-errors"),
      adminItem("/admin/maintenance/server-errors",    "Server Errors",     "admin:maintenance:view-server-errors"),
      adminItem("/admin/maintenance/client-errors",    "Client Errors",     "admin:maintenance:view-client-errors"),
      adminItem("/admin/maintenance/function-errors",  "Function Errors",   "admin:maintenance:view-function-errors"),
      adminItem("/admin/maintenance/payment-rollbacks","Payment Rollbacks", "admin:maintenance:view-payment-rollbacks"),
      adminItem("/admin/maintenance/cloud-logs",       "Cloud Logs",        "admin:maintenance:view-cloud-logs"),
      adminItem("/admin/maintenance/analysis",         "Run Analysis",      "admin:maintenance:run-analysis"),
    ],
  },
  {
    title: "Help",
    items: [
      adminItem(String(ROUTES.ADMIN.GUIDE), "Admin Guide", "admin:dashboard:view"),
    ],
  },
];

// ---------------------------------------------------------------------------
// Store dashboard sidebar
// ---------------------------------------------------------------------------

// P-1: Seller nav trimmed to MVP scope. Re-add disabled items when their
// feature patch ships: Auctions→P5, Pre-Orders→P6, Payouts→P7, Coupons→P2,
// Prize Draws→P10, Bundles→when enabled, Fulfilment→P-14 (Shiprocket).
export const STORE_NAV_GROUPS: StoreNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: String(ROUTES.STORE.DASHBOARD), label: "Dashboard" },
    ],
  },
  {
    title: "Listings",
    items: [
      { href: String(ROUTES.STORE.PRODUCTS), label: "Products" },
      { href: String(ROUTES.STORE.ART),      label: "Art"      },
      { href: String(ROUTES.STORE.STICKERS), label: "Stickers" },
      // Disabled until feature patches: Auctions(P5), Pre-Orders(P6), Prize Draws(P10),
      // Bundles, Classifieds, Digital Codes, Live Items, Offers, Sub-listing Groups,
      // Feature Badges, Templates, Listing Templates, Grouped Listings.
    ],
  },
  {
    title: "Orders & Reviews",
    items: [
      { href: String(ROUTES.STORE.ORDERS),   label: "Orders"   },
      { href: String(ROUTES.STORE.MESSAGES), label: "Messages" },
      { href: String(ROUTES.STORE.REVIEWS),  label: "Reviews"  },
      { href: String(ROUTES.STORE.BIDS),     label: "Bids"     },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: String(ROUTES.STORE.ANALYTICS), label: "Analytics" },
      { href: String(ROUTES.STORE.PAYOUTS),   label: "Payouts"   },
    ],
  },
  {
    title: "Store",
    items: [
      { href: String(ROUTES.STORE.STOREFRONT),    label: "Storefront"    },
      { href: String(ROUTES.STORE.SHIPPING),      label: "Shipping"      },
      { href: String(ROUTES.STORE.ADDRESSES),     label: "Addresses"     },
      { href: String(ROUTES.STORE.COUPONS),       label: "Coupons"       },
      { href: String(ROUTES.STORE.PRINT_CENTER),  label: "Print Center"  },
    ],
  },
  {
    title: "Help",
    items: [
      { href: String(ROUTES.STORE.GUIDE), label: "Seller Guide" },
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
      { href: String(ROUTES.USER.PROFILE),       label: "My Profile"    },
      { href: String(ROUTES.USER.SETTINGS),      label: "Settings"      },
      { href: String(ROUTES.USER.NOTIFICATIONS), label: "Notifications" },
      { href: String(ROUTES.USER.MESSAGES),      label: "Messages"      },
    ],
  },
  {
    title: "Shopping",
    items: [
      { href: String(ROUTES.USER.ORDERS),          label: "My Orders"  },
      { href: String(ROUTES.USER.WISHLIST),         label: "Wishlist"   },
      { href: String(ROUTES.USER.ADDRESSES),        label: "Addresses"  },
      { href: String(ROUTES.USER.REVIEWS),          label: "My Reviews" },
      { href: String(ROUTES.USER.CLAIMED_COUPONS),  label: "My Coupons" },
      { href: String(ROUTES.USER.EVENTS),           label: "My Events"  },
      { href: String(ROUTES.USER.BIDS),             label: "My Bids"    },
      { href: String(ROUTES.USER.OFFERS),           label: "My Offers"  },
      { href: String(ROUTES.USER.HISTORY),          label: "Recently Viewed" },
      { href: String(ROUTES.USER.CATALOGUE),        label: "My Catalogue" },
      // Hidden until feature patch ships: Returns, Pre-Orders (P6), Digital Codes, Prize Draws (P10).
    ],
  },
  {
    title: "Selling",
    items: [
      { href: String(ROUTES.USER.BECOME_SELLER), label: "Open a Store" },
    ],
  },
  {
    title: "Help",
    items: [
      { href: String(ROUTES.USER.SUPPORT), label: "Support Tickets" },
      { href: String(ROUTES.PUBLIC.HELP),  label: "Help Center"     },
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

export function getUserNavGroups(isSeller: boolean): UserNavGroup[] {
  // NOTE: the `confirm` field is added on the appkit `UserNavItem` interface but
  // ships with the next appkit publish; cast keeps tsc happy against the
  // currently-installed dist which doesn't expose it yet.
  const sellingItem: UserNavItem = isSeller
    ? ({
        href: String(ROUTES.STORE.DASHBOARD),
        label: STORE_DASHBOARD_LABEL,
        confirm: {
          message: "Leave your buyer dashboard for the seller dashboard?",
        },
      } as UserNavItem)
    : { href: String(ROUTES.USER.BECOME_SELLER), label: BECOME_SELLER_LABEL };
  return USER_NAV_GROUPS.map((group) =>
    group.title === SELLING_GROUP_TITLE ? { ...group, items: [sellingItem] } : group,
  );
}
