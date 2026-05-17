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
import { THEME_CONSTANTS } from "./theme";
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

const { navIcons } = THEME_CONSTANTS.colors;
const iconSm = THEME_CONSTANTS.icon.size.sm;

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
  { key: "scams",      href: String(ROUTES.PUBLIC.SCAMS),         icon: <ShieldAlert  className={`${iconSm} text-red-500`}            /> },
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
      adminItem(String(ROUTES.ADMIN.ORDERS),          "Orders",          "admin:orders:read"),
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
      adminItem(String(ROUTES.ADMIN.PAYOUTS),   "Payouts",   "admin:payouts:read"),
    ],
  },
  {
    title: "Catalog",
    items: [
      adminItem(String(ROUTES.ADMIN.CATEGORIES),            "Categories",    "admin:categories:read"),
      adminItem(String(ROUTES.ADMIN.BRANDS),                "Brands",        "admin:brands:read"),
      adminItem(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES), "Sub-listings",  "admin:categories:read"),
      adminItem(String(ROUTES.ADMIN.FEATURES),              "Feature Badges","admin:categories:read"),
      adminItem(String(ROUTES.ADMIN.BUNDLES),               "Bundles",       "admin:categories:read"),
      adminItem(String(ROUTES.ADMIN.PRIZE_DRAWS),           "Prize Draws",   "admin:products:read"),
      adminItem(String(ROUTES.ADMIN.COUPONS),               "Coupons",       "admin:coupons:read"),
      adminItem(String(ROUTES.ADMIN.DEALS),                 "Deals",         "admin:deals:read"),
      adminItem(String(ROUTES.ADMIN.FEATURED),              "Featured",      "admin:featured:read"),
    ],
  },
  {
    title: "Content",
    items: [
      adminItem(String(ROUTES.ADMIN.REVIEWS), "Reviews", "admin:reviews:read"),
      adminItem(String(ROUTES.ADMIN.BLOG),    "Blog",    "admin:blog:read"),
      adminItem(String(ROUTES.ADMIN.BIDS),    "Bids",    "admin:bids:read"),
      adminItem(String(ROUTES.ADMIN.MEDIA),   "Media",   "admin:media:read"),
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
      adminItem(String(ROUTES.ADMIN.EVENTS),            "Events",      "admin:events:read"),
      adminItem(String(ROUTES.ADMIN.ALL_EVENT_ENTRIES), "All Entries", "admin:event-entries:read"),
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      adminItem(String(ROUTES.ADMIN.SUPPORT_TICKETS), "Support Tickets", "admin:support-tickets:read"),
      adminItem(String(ROUTES.ADMIN.SCAMMERS),        "Scam Registry",   "admin:scammers:read"),
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
      adminItem(String(ROUTES.ADMIN.COPILOT),       "Copilot",       "admin:copilot:view"),
      adminItem(String(ROUTES.ADMIN.TEAM),          "Team",          "admin:team:read"),
    ],
  },
];

// ---------------------------------------------------------------------------
// Store dashboard sidebar
// ---------------------------------------------------------------------------

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
      { href: String(ROUTES.STORE.PRODUCTS),                label: "Products"          },
      { href: String(ROUTES.STORE.AUCTIONS),                label: "Auctions"          },
      { href: String(ROUTES.STORE.PRE_ORDERS),              label: "Pre-Orders"        },
      { href: String(ROUTES.STORE.BUNDLES),                 label: "Bundles"           },
      { href: String(ROUTES.STORE.PRIZE_DRAWS),             label: "Prize Draws"       },
      { href: String(ROUTES.STORE.CLASSIFIED),              label: "Classifieds"       },
      { href: String(ROUTES.STORE.DIGITAL_CODES),           label: "Digital Codes"     },
      { href: String(ROUTES.STORE.LIVE_ITEMS),              label: "Live Items"        },
      { href: String(ROUTES.STORE.OFFERS),                  label: "Offers"            },
      { href: String(ROUTES.STORE.SUBLISTING_CATEGORIES),   label: "Sub-listing Groups"},
      { href: String(ROUTES.STORE.FEATURES),                label: "Feature Badges"    },
      { href: String(ROUTES.STORE.TEMPLATES),               label: "Templates"         },
    ],
  },
  {
    title: "Orders & Reviews",
    items: [
      { href: String(ROUTES.STORE.ORDERS),  label: "Orders"  },
      { href: String(ROUTES.STORE.BIDS),    label: "Bids"    },
      { href: String(ROUTES.STORE.REVIEWS), label: "Reviews" },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: String(ROUTES.STORE.ANALYTICS),       label: "Analytics"        },
      { href: String(ROUTES.STORE.PAYOUTS),         label: "Payouts"          },
      { href: String(ROUTES.STORE.PAYOUT_SETTINGS), label: "Payout Settings"  },
    ],
  },
  {
    title: "Store",
    items: [
      { href: String(ROUTES.STORE.STOREFRONT),   label: "Storefront"    },
      { href: String(ROUTES.STORE.SHIPPING),     label: "Shipping"      },
      { href: String(ROUTES.STORE.ADDRESSES),    label: "Addresses"     },
      { href: String(ROUTES.STORE.COUPONS),      label: "Coupons"       },
      { href: String(ROUTES.STORE.WHATSAPP),     label: "WhatsApp"      },
      { href: String(ROUTES.STORE.SLUG),         label: "Store URL"     },
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
      { href: String(ROUTES.USER.ORDERS),        label: "My Orders"     },
      { href: String(ROUTES.USER.RETURNS),        label: "Returns"       },
      { href: String(ROUTES.USER.BIDS),           label: "My Bids"       },
      { href: String(ROUTES.USER.PRE_ORDERS),     label: "Pre-Orders"    },
      { href: String(ROUTES.USER.DIGITAL_CODES),  label: "Digital Codes" },
      { href: String(ROUTES.USER.PRIZE_DRAWS),    label: "Prize Draws"   },
      { href: String(ROUTES.USER.EVENTS),         label: "My Events"     },
      { href: String(ROUTES.USER.REVIEWS),        label: "My Reviews"    },
      { href: String(ROUTES.USER.OFFERS),         label: "My Offers"     },
      { href: String(ROUTES.USER.ADDRESSES),      label: "Addresses"     },
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
