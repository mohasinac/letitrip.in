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

import type { ReactNode } from "react";
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
} from "lucide-react";
import { THEME_CONSTANTS } from "./theme";
import { ROUTES } from "./routes";

// ---------------------------------------------------------------------------
// Shared types (mirror appkit sidebar interfaces — no appkit import needed)
// ---------------------------------------------------------------------------

export interface NavItem {
  key: string;
  href: string;
  icon: ReactNode;
  highlighted?: boolean;
}

interface DashboardNavItem {
  href: string;
  label: string;
  icon?: ReactNode;
}

interface DashboardNavGroup {
  title: string;
  items: DashboardNavItem[];
  defaultOpen?: boolean;
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

export const SIDEBAR_SUPPORT_LINKS: DashboardNavItem[] = [
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

export const ADMIN_NAV_GROUPS: DashboardNavGroup[] = [
  {
    title: "Management",
    items: [
      { href: String(ROUTES.ADMIN.DASHBOARD),       label: "Dashboard"       },
      { href: String(ROUTES.ADMIN.USERS),           label: "Users"           },
      { href: String(ROUTES.ADMIN.PRODUCTS),        label: "Products"        },
      { href: String(ROUTES.ADMIN.ORDERS),          label: "Orders"          },
      { href: String(ROUTES.ADMIN.RETURN_REQUESTS), label: "Returns"         },
      { href: String(ROUTES.ADMIN.STORES),          label: "Stores"          },
      { href: String(ROUTES.ADMIN.STORE_ADDRESSES), label: "Store Addresses" },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: String(ROUTES.ADMIN.ANALYTICS), label: "Analytics" },
      { href: String(ROUTES.ADMIN.PAYOUTS),   label: "Payouts"   },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: String(ROUTES.ADMIN.CATEGORIES), label: "Categories" },
      { href: String(ROUTES.ADMIN.BRANDS),     label: "Brands"     },
      { href: String(ROUTES.ADMIN.COUPONS),    label: "Coupons"    },
      { href: String(ROUTES.ADMIN.DEALS),      label: "Deals"      },
      { href: String(ROUTES.ADMIN.FEATURED),   label: "Featured"   },
    ],
  },
  {
    title: "Content",
    items: [
      { href: String(ROUTES.ADMIN.REVIEWS), label: "Reviews" },
      { href: String(ROUTES.ADMIN.BLOG),    label: "Blog"    },
      { href: String(ROUTES.ADMIN.BIDS),    label: "Bids"    },
      { href: String(ROUTES.ADMIN.MEDIA),   label: "Media"   },
    ],
  },
  {
    title: "Site",
    items: [
      { href: String(ROUTES.ADMIN.SITE),          label: "Site Settings" },
      { href: String(ROUTES.ADMIN.NAVIGATION),    label: "Navigation"    },
      { href: String(ROUTES.ADMIN.SECTIONS),      label: "Sections"      },
      { href: String(ROUTES.ADMIN.CAROUSEL),      label: "Carousel"      },
      { href: String(ROUTES.ADMIN.ADS),           label: "Ads"           },
      { href: String(ROUTES.ADMIN.FAQS),          label: "FAQs"          },
      { href: String(ROUTES.ADMIN.NEWSLETTER),    label: "Newsletter"    },
      { href: String(ROUTES.ADMIN.CONTACT),       label: "Contact"       },
    ],
  },
  {
    title: "Events",
    items: [
      { href: String(ROUTES.ADMIN.EVENTS),            label: "Events"        },
      { href: String(ROUTES.ADMIN.ALL_EVENT_ENTRIES), label: "All Entries"   },
    ],
  },
  {
    title: "System",
    items: [
      { href: String(ROUTES.ADMIN.SESSIONS),      label: "Sessions"      },
      { href: String(ROUTES.ADMIN.NOTIFICATIONS), label: "Notifications" },
      { href: String(ROUTES.ADMIN.CARTS),         label: "Carts"         },
      { href: String(ROUTES.ADMIN.WISHLISTS),     label: "Wishlists"     },
      { href: String(ROUTES.ADMIN.FEATURE_FLAGS), label: "Feature Flags" },
      { href: String(ROUTES.ADMIN.COPILOT),       label: "Copilot"       },
    ],
  },
];

// ---------------------------------------------------------------------------
// Store dashboard sidebar
// ---------------------------------------------------------------------------

export const STORE_NAV_GROUPS: DashboardNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: String(ROUTES.STORE.DASHBOARD), label: "Dashboard" },
    ],
  },
  {
    title: "Listings",
    items: [
      { href: String(ROUTES.STORE.PRODUCTS),   label: "Products"   },
      { href: String(ROUTES.STORE.AUCTIONS),   label: "Auctions"   },
      { href: String(ROUTES.STORE.PRE_ORDERS), label: "Pre-Orders" },
      { href: String(ROUTES.STORE.OFFERS),     label: "Offers"     },
    ],
  },
  {
    title: "Orders & Reviews",
    items: [
      { href: String(ROUTES.STORE.ORDERS),  label: "Orders"  },
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
    ],
  },
];

// ---------------------------------------------------------------------------
// User account sidebar
// ---------------------------------------------------------------------------

export const USER_NAV_GROUPS: DashboardNavGroup[] = [
  {
    title: "Shopping",
    items: [
      { href: String(ROUTES.USER.ORDERS),    label: "My Orders"   },
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
];

export const USER_NAV_ALL_ITEMS: DashboardNavItem[] = USER_NAV_GROUPS.flatMap((g) => g.items);
