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

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Management",
    items: [
      { href: String(ROUTES.ADMIN.DASHBOARD),       label: "Dashboard",       requiredPermission: "admin:dashboard:view"    },
      { href: String(ROUTES.ADMIN.USERS),           label: "Users",           requiredPermission: "admin:users:read"        },
      { href: String(ROUTES.ADMIN.PRODUCTS),        label: "Products",        requiredPermission: "admin:products:read"     },
      { href: String(ROUTES.ADMIN.ORDERS),          label: "Orders",          requiredPermission: "admin:orders:read"       },
      { href: String(ROUTES.ADMIN.RETURN_REQUESTS), label: "Returns",         requiredPermission: "admin:returns:read"      },
      { href: String(ROUTES.ADMIN.STORES),          label: "Stores",          requiredPermission: "admin:stores:read"       },
      { href: String(ROUTES.ADMIN.STORE_ADDRESSES), label: "Store Addresses", requiredPermission: "admin:store-addresses:read" },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: String(ROUTES.ADMIN.ANALYTICS), label: "Analytics", requiredPermission: "admin:analytics:view" },
      { href: String(ROUTES.ADMIN.PAYOUTS),   label: "Payouts",   requiredPermission: "admin:payouts:read"   },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: String(ROUTES.ADMIN.CATEGORIES),          label: "Categories",    requiredPermission: "admin:categories:read" },
      { href: String(ROUTES.ADMIN.BRANDS),              label: "Brands",        requiredPermission: "admin:brands:read"     },
      { href: String(ROUTES.ADMIN.SUBLISTING_CATEGORIES), label: "Sub-listings", requiredPermission: "admin:categories:read" },
      { href: String(ROUTES.ADMIN.FEATURES),            label: "Feature Badges", requiredPermission: "admin:categories:read" },
      { href: String(ROUTES.ADMIN.BUNDLES),             label: "Bundles",       requiredPermission: "admin:categories:read" },
      { href: String(ROUTES.ADMIN.PRIZE_DRAWS),         label: "Prize Draws",   requiredPermission: "admin:products:read"   },
      { href: String(ROUTES.ADMIN.COUPONS),             label: "Coupons",       requiredPermission: "admin:coupons:read"    },
      { href: String(ROUTES.ADMIN.DEALS),               label: "Deals",         requiredPermission: "admin:deals:read"      },
      { href: String(ROUTES.ADMIN.FEATURED),            label: "Featured",      requiredPermission: "admin:featured:read"   },
    ],
  },
  {
    title: "Content",
    items: [
      { href: String(ROUTES.ADMIN.REVIEWS), label: "Reviews", requiredPermission: "admin:reviews:read" },
      { href: String(ROUTES.ADMIN.BLOG),    label: "Blog",    requiredPermission: "admin:blog:read"    },
      { href: String(ROUTES.ADMIN.BIDS),    label: "Bids",    requiredPermission: "admin:bids:read"    },
      { href: String(ROUTES.ADMIN.MEDIA),   label: "Media",   requiredPermission: "admin:media:read"   },
    ],
  },
  {
    title: "Site",
    items: [
      { href: String(ROUTES.ADMIN.SITE),       label: "Site Settings", requiredPermission: "admin:site:read"       },
      { href: String(ROUTES.ADMIN.NAVIGATION), label: "Navigation",    requiredPermission: "admin:navigation:read" },
      { href: String(ROUTES.ADMIN.SECTIONS),   label: "Sections",      requiredPermission: "admin:sections:read"   },
      { href: String(ROUTES.ADMIN.CAROUSEL),   label: "Carousel",      requiredPermission: "admin:carousel:read"   },
      { href: String(ROUTES.ADMIN.ADS),        label: "Ads",           requiredPermission: "admin:ads:read"        },
      { href: String(ROUTES.ADMIN.FAQS),       label: "FAQs",          requiredPermission: "admin:faqs:read"       },
      { href: String(ROUTES.ADMIN.NEWSLETTER), label: "Newsletter",    requiredPermission: "admin:newsletter:read" },
      { href: String(ROUTES.ADMIN.CONTACT),    label: "Contact",       requiredPermission: "admin:contact:read"    },
    ],
  },
  {
    title: "Events",
    items: [
      { href: String(ROUTES.ADMIN.EVENTS),            label: "Events",      requiredPermission: "admin:events:read"        },
      { href: String(ROUTES.ADMIN.ALL_EVENT_ENTRIES), label: "All Entries", requiredPermission: "admin:event-entries:read" },
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      { href: String(ROUTES.ADMIN.SUPPORT_TICKETS), label: "Support Tickets", requiredPermission: "admin:support-tickets:read" },
      { href: String(ROUTES.ADMIN.SCAMMERS),        label: "Scam Registry",   requiredPermission: "admin:scammers:read"       },
    ],
  },
  {
    title: "System",
    items: [
      { href: String(ROUTES.ADMIN.SESSIONS),      label: "Sessions",      requiredPermission: "admin:sessions:read"      },
      { href: String(ROUTES.ADMIN.NOTIFICATIONS), label: "Notifications", requiredPermission: "admin:notifications:read" },
      { href: String(ROUTES.ADMIN.CARTS),         label: "Carts",         requiredPermission: "admin:carts:read"         },
      { href: String(ROUTES.ADMIN.WISHLISTS),     label: "Wishlists",     requiredPermission: "admin:wishlists:read"     },
      { href: String(ROUTES.ADMIN.HISTORY),       label: "History",       requiredPermission: "admin:sessions:read"      },
      { href: String(ROUTES.ADMIN.FEATURE_FLAGS), label: "Feature Flags", requiredPermission: "admin:feature-flags:read" },
      { href: String(ROUTES.ADMIN.COPILOT),       label: "Copilot",       requiredPermission: "admin:copilot:view"       },
      { href: String(ROUTES.ADMIN.TEAM),          label: "Team",          requiredPermission: "admin:team:read"          },
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
      { href: String(ROUTES.STORE.STOREFRONT), label: "Storefront" },
      { href: String(ROUTES.STORE.SHIPPING),   label: "Shipping"   },
      { href: String(ROUTES.STORE.ADDRESSES),  label: "Addresses"  },
      { href: String(ROUTES.STORE.COUPONS),    label: "Coupons"    },
      { href: String(ROUTES.STORE.WHATSAPP),   label: "WhatsApp"   },
      { href: String(ROUTES.STORE.SLUG),       label: "Store URL"  },
    ],
  },
];

// ---------------------------------------------------------------------------
// User account sidebar
// ---------------------------------------------------------------------------

export const USER_NAV_GROUPS: UserNavGroup[] = [
  {
    title: "Shopping",
    items: [
      { href: String(ROUTES.USER.ORDERS),    label: "My Orders"   },
      { href: String(ROUTES.USER.RETURNS),   label: "Returns"     },
      { href: String(ROUTES.USER.BIDS),      label: "My Bids"     },
      { href: String(ROUTES.USER.REVIEWS),   label: "My Reviews"  },
      { href: String(ROUTES.USER.OFFERS),    label: "My Offers"   },
      { href: String(ROUTES.USER.ADDRESSES), label: "Addresses"   },
    ],
  },
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
  const sellingItem: UserNavItem = isSeller
    ? { href: String(ROUTES.STORE.DASHBOARD), label: STORE_DASHBOARD_LABEL }
    : { href: String(ROUTES.USER.BECOME_SELLER), label: BECOME_SELLER_LABEL };
  return USER_NAV_GROUPS.map((group) =>
    group.title === SELLING_GROUP_TITLE ? { ...group, items: [sellingItem] } : group,
  );
}
