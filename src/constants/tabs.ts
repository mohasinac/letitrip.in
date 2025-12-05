/**
 * @fileoverview TypeScript Module
 * @module src/constants/tabs
 * @description This file contains functionality related to tabs
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

// Tab Navigation Constants
// Used by TabNav component for route-based tabbed navigation

/**
 * Tab interface
 * 
 * @interface
 * @description Defines the structure and contract for Tab
 */
export interface Tab {
  /** Id */
  id: string;
  /** Label */
  label: string;
  /** Href */
  href: string;
  /** Icon */
  icon?: string;
}

// Admin Settings Tabs
/**
 * Admin Settings Tabs
 * @constant
 */
export const ADMIN_SETTINGS_TABS: Tab[] = [
  {
    /** Id */
    id: "general",
    /** Label */
    label: "General",
    /** Href */
    href: "/admin/settings",
    /** Icon */
    icon: "settings",
  },
  {
    /** Id */
    id: "payment",
    /** Label */
    label: "Payment",
    /** Href */
    href: "/admin/settings/payment",
    /** Icon */
    icon: "credit-card",
  },
  {
    /** Id */
    id: "shipping",
    /** Label */
    label: "Shipping",
    /** Href */
    href: "/admin/settings/shipping",
    /** Icon */
    icon: "truck",
  },
  { id: "email", label: "Email", href: "/admin/settings/email", icon: "mail" },
  {
    /** Id */
    id: "notifications",
    /** Label */
    label: "Notifications",
    /** Href */
    href: "/admin/settings/notifications",
    /** Icon */
    icon: "bell",
  },
];

// Admin Blog Tabs
/**
 * Admin Blog Tabs
 * @constant
 */
export const ADMIN_BLOG_TABS: Tab[] = [
  { id: "posts", label: "All Posts", href: "/admin/blog", icon: "file-text" },
  {
    /** Id */
    id: "create",
    /** Label */
    label: "Create Post",
    /** Href */
    href: "/admin/blog/create",
    /** Icon */
    icon: "plus",
  },
  {
    /** Id */
    id: "categories",
    /** Label */
    label: "Categories",
    /** Href */
    href: "/admin/blog/categories",
    /** Icon */
    icon: "folder",
  },
  { id: "tags", label: "Tags", href: "/admin/blog/tags", icon: "tag" },
];

// Admin Auctions Tabs
/**
 * Admin Auctions Tabs
 * @constant
 */
export const ADMIN_AUCTIONS_TABS: Tab[] = [
  { id: "all", label: "All Auctions", href: "/admin/auctions", icon: "gavel" },
  { id: "live", label: "Live", href: "/admin/auctions/live", icon: "zap" },
  {
    /** Id */
    id: "moderation",
    /** Label */
    label: "Moderation",
    /** Href */
    href: "/admin/auctions/moderation",
    /** Icon */
    icon: "shield",
  },
];

// Admin Content Tabs (Homepage, Hero Slides, Featured Sections)
/**
 * Admin Content Tabs
 * @constant
 */
export const ADMIN_CONTENT_TABS: Tab[] = [
  { id: "homepage", label: "Homepage", href: "/admin/homepage", icon: "home" },
  {
    /** Id */
    id: "hero-slides",
    /** Label */
    label: "Hero Slides",
    /** Href */
    href: "/admin/hero-slides",
    /** Icon */
    icon: "image",
  },
  {
    /** Id */
    id: "featured-sections",
    /** Label */
    label: "Featured Sections",
    /** Href */
    href: "/admin/featured-sections",
    /** Icon */
    icon: "star",
  },
  {
    /** Id */
    id: "categories",
    /** Label */
    label: "Categories",
    /** Href */
    href: "/admin/categories",
    /** Icon */
    icon: "folder-tree",
  },
];

// Admin Marketplace Tabs (Products & Shops)
/**
 * Admin Marketplace Tabs
 * @constant
 */
export const ADMIN_MARKETPLACE_TABS: Tab[] = [
  {
    /** Id */
    id: "products",
    /** Label */
    label: "Products",
    /** Href */
    href: "/admin/products",
    /** Icon */
    icon: "package",
  },
  { id: "shops", label: "Shops", href: "/admin/shops", icon: "store" },
];

// Admin Transactions Tabs (Orders, Payments, Payouts)
/**
 * Admin Transactions Tabs
 * @constant
 */
export const ADMIN_TRANSACTIONS_TABS: Tab[] = [
  {
    /** Id */
    id: "orders",
    /** Label */
    label: "Orders",
    /** Href */
    href: "/admin/orders",
    /** Icon */
    icon: "shopping-cart",
  },
  {
    /** Id */
    id: "payments",
    /** Label */
    label: "Payments",
    /** Href */
    href: "/admin/payments",
    /** Icon */
    icon: "credit-card",
  },
  {
    /** Id */
    id: "payouts",
    /** Label */
    label: "Payouts",
    /** Href */
    href: "/admin/payouts",
    /** Icon */
    icon: "dollar-sign",
  },
];

// Admin Support Tabs
/**
 * Admin Support Tabs
 * @constant
 */
export const ADMIN_SUPPORT_TABS: Tab[] = [
  {
    /** Id */
    id: "all",
    /** Label */
    label: "All Tickets",
    /** Href */
    href: "/admin/support-tickets",
    /** Icon */
    icon: "life-buoy",
  },
];

// Seller Products Tabs
/**
 * Seller Products Tabs
 * @constant
 */
export const SELLER_PRODUCTS_TABS: Tab[] = [
  {
    /** Id */
    id: "all",
    /** Label */
    label: "All Products",
    /** Href */
    href: "/seller/products",
    /** Icon */
    icon: "package",
  },
  {
    /** Id */
    id: "create",
    /** Label */
    label: "Add Product",
    /** Href */
    href: "/seller/products/create",
    /** Icon */
    icon: "plus",
  },
];

// Seller Auctions Tabs
/**
 * Seller Auctions Tabs
 * @constant
 */
export const SELLER_AUCTIONS_TABS: Tab[] = [
  { id: "all", label: "All Auctions", href: "/seller/auctions", icon: "gavel" },
  {
    /** Id */
    id: "create",
    /** Label */
    label: "Create Auction",
    /** Href */
    href: "/seller/auctions/create",
    /** Icon */
    icon: "plus",
  },
];

// Seller Orders Tabs
/**
 * Seller Orders Tabs
 * @constant
 */
export const SELLER_ORDERS_TABS: Tab[] = [
  {
    /** Id */
    id: "all",
    /** Label */
    label: "All Orders",
    /** Href */
    href: "/seller/orders",
    /** Icon */
    icon: "shopping-cart",
  },
  {
    /** Id */
    id: "pending",
    /** Label */
    label: "Pending",
    /** Href */
    href: "/seller/orders?status=pending",
    /** Icon */
    icon: "clock",
  },
  {
    /** Id */
    id: "completed",
    /** Label */
    label: "Completed",
    /** Href */
    href: "/seller/orders?status=completed",
    /** Icon */
    icon: "check",
  },
];

// Seller Shop Management Tabs
/**
 * Seller Shop Tabs
 * @constant
 */
export const SELLER_SHOP_TABS: Tab[] = [
  { id: "shops", label: "My Shops", href: "/seller/my-shops", icon: "store" },
  {
    /** Id */
    id: "create",
    /** Label */
    label: "Create Shop",
    /** Href */
    href: "/seller/my-shops/create",
    /** Icon */
    icon: "plus",
  },
];

// User Settings Tabs
/**
 * User Settings Tabs
 * @constant
 */
export const USER_SETTINGS_TABS: Tab[] = [
  { id: "profile", label: "Profile", href: "/user/settings", icon: "user" },
  {
    /** Id */
    id: "security",
    /** Label */
    label: "Security",
    /** Href */
    href: "/user/settings/security",
    /** Icon */
    icon: "shield",
  },
  {
    /** Id */
    id: "notifications",
    /** Label */
    label: "Notifications",
    /** Href */
    href: "/user/settings/notifications",
    /** Icon */
    icon: "bell",
  },
];

// User Orders Tabs
/**
 * User Orders Tabs
 * @constant
 */
export const USER_ORDERS_TABS: Tab[] = [
  { id: "all", label: "All Orders", href: "/user/orders", icon: "package" },
  {
    /** Id */
    id: "active",
    /** Label */
    label: "Active",
    /** Href */
    href: "/user/orders?status=active",
    /** Icon */
    icon: "clock",
  },
  {
    /** Id */
    id: "completed",
    /** Label */
    label: "Completed",
    /** Href */
    href: "/user/orders?status=completed",
    /** Icon */
    icon: "check",
  },
];

// User Auctions Tabs
/**
 * User Auctions Tabs
 * @constant
 */
export const USER_AUCTIONS_TABS: Tab[] = [
  { id: "bids", label: "My Bids", href: "/user/bids", icon: "gavel" },
  { id: "watchlist", label: "Watchlist", href: "/user/watchlist", icon: "eye" },
  {
    /** Id */
    id: "won",
    /** Label */
    label: "Won Auctions",
    /** Href */
    href: "/user/won-auctions",
    /** Icon */
    icon: "trophy",
  },
];

// Export all tabs grouped
/**
 * Admin Tabs
 * @constant
 */
export const ADMIN_TABS = {
  /** S E T T I N G S */
  SETTINGS: ADMIN_SETTINGS_TABS,
  /** B L O G */
  BLOG: ADMIN_BLOG_TABS,
  /** A U C T I O N S */
  AUCTIONS: ADMIN_AUCTIONS_TABS,
  /** C O N T E N T */
  CONTENT: ADMIN_CONTENT_TABS,
  /** S U P P O R T */
  SUPPORT: ADMIN_SUPPORT_TABS,
  /** M A R K E T P L A C E */
  MARKETPLACE: ADMIN_MARKETPLACE_TABS,
  /** T R A N S A C T I O N S */
  TRANSACTIONS: ADMIN_TRANSACTIONS_TABS,
};

/**
 * Seller Tabs
 * @constant
 */
export const SELLER_TABS = {
  /** P R O D U C T S */
  PRODUCTS: SELLER_PRODUCTS_TABS,
  /** A U C T I O N S */
  AUCTIONS: SELLER_AUCTIONS_TABS,
  /** O R D E R S */
  ORDERS: SELLER_ORDERS_TABS,
  /** S H O P S */
  SHOPS: SELLER_SHOP_TABS,
};

/**
 * User Tabs
 * @constant
 */
export const USER_TABS = {
  /** S E T T I N G S */
  SETTINGS: USER_SETTINGS_TABS,
  /** O R D E R S */
  ORDERS: USER_ORDERS_TABS,
  /** A U C T I O N S */
  AUCTIONS: USER_AUCTIONS_TABS,
};
