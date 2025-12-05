/**
 * @fileoverview TypeScript Module
 * @module src/constants/navigation
 * @description This file contains functionality related to navigation
 * 
 * @created 2025-12-05
 * @author Development Team
 */

// Navigation Constants
// NOTE: See routes.ts for centralized page route constants

/**
 * Company Name
 * @constant
 */
export const COMPANY_NAME = "LET IT RIP";
/**
 * Company Alt Text
 * @constant
 */
export const COMPANY_ALT_TEXT = "Let It Rip - Buy Collectibles in India";

// Note: Category-related constants moved to src/constants/categories.ts
// Use getCategoryBySlug(), getSubcategories(), etc. from categories.ts

// User Menu Items (Grouped)
// BROKEN ROUTES FIXED:
// - /user/notifications - Route does not exist (E016 not implemented)
// - /user/returns - Route does not exist (use /user/orders)
// - /user/reviews - Route does not exist (use /reviews)
/**
 * User Menu Items
 * @constant
 */
export const USER_MENU_ITEMS = [
  {
    /** Id */
    id: "overview",
    /** Name */
    name: "Overview",
    /** Icon */
    icon: "layout-dashboard",
    /** Children */
    children: [
      {
        /** Id */
        id: "dashboard",
        /** Name */
        name: "Dashboard",
        /** Link */
        link: "/user",
        /** Icon */
        icon: "layout-dashboard",
      },
      {
        /** Id */
        id: "notifications",
        /** Name */
        name: "Notifications",
        /** Link */
        link: "/user/notifications",
        /** Icon */
        icon: "bell",
      },
    ],
  },
  {
    /** Id */
    id: "shopping",
    /** Name */
    name: "Shopping",
    /** Icon */
    icon: "shopping-bag",
    /** Children */
    children: [
      {
        /** Id */
        id: "orders",
        /** Name */
        name: "My Orders",
        /** Link */
        link: "/user/orders",
        /** Icon */
        icon: "package",
      },
      {
        /** Id */
        id: "favorites",
        /** Name */
        name: "My Favorites",
        /** Link */
        link: "/user/favorites",
        /** Icon */
        icon: "heart",
      },
      { id: "history", name: "History", link: "/user/history", icon: "clock" },
      {
        /** Id */
        id: "returns",
        /** Name */
        name: "Returns & Refunds",
        /** Link */
        link: "/user/returns",
        /** Icon */
        icon: "rotate-ccw",
      },
    ],
  },
  {
    /** Id */
    id: "auctions",
    /** Name */
    name: "Auctions",
    /** Icon */
    icon: "gavel",
    /** Children */
    children: [
      { id: "bids", name: "My Bids", link: "/user/bids", icon: "gavel" },
      {
        /** Id */
        id: "watchlist",
        /** Name */
        name: "Watchlist",
        /** Link */
        link: "/user/watchlist",
        /** Icon */
        icon: "eye",
      },
      {
        /** Id */
        id: "won-auctions",
        /** Name */
        name: "Won Auctions",
        /** Link */
        link: "/user/won-auctions",
        /** Icon */
        icon: "trophy",
      },
    ],
  },
  {
    /** Id */
    id: "account",
    /** Name */
    name: "Account",
    /** Icon */
    icon: "user",
    /** Children */
    children: [
      {
        /** Id */
        id: "messages",
        /** Name */
        name: "My Messages",
        /** Link */
        link: "/user/messages",
        /** Icon */
        icon: "message-square",
      },
      {
        /** Id */
        id: "addresses",
        /** Name */
        name: "My Addresses",
        /** Link */
        link: "/user/addresses",
        /** Icon */
        icon: "map-pin",
      },
      {
        /** Id */
        id: "reviews",
        /** Name */
        name: "My Reviews",
        /** Link */
        link: "/user/reviews",
        /** Icon */
        icon: "star",
      },
      {
        /** Id */
        id: "settings",
        /** Name */
        name: "Account Settings",
        /** Link */
        link: "/user/settings",
        /** Icon */
        icon: "settings",
      },
    ],
  },
  { id: "logout", name: "Logout", link: "/logout", icon: "log-out" },
];

// Seller Sidebar Navigation (Grouped)
/**
 * Seller Menu Items
 * @constant
 */
export const SELLER_MENU_ITEMS = [
  {
    /** Id */
    id: "overview",
    /** Name */
    name: "Overview",
    /** Link */
    link: "/seller",
    /** Icon */
    icon: "layout-dashboard",
    /** Description */
    description: "Sales overview and quick stats",
  },
  {
    /** Id */
    id: "shop-management",
    /** Name */
    name: "Shop Management",
    /** Icon */
    icon: "store",
    /** Children */
    children: [
      {
        /** Id */
        id: "shop-list",
        /** Name */
        name: "My Shops",
        /** Link */
        link: "/seller/my-shops",
        /** Icon */
        icon: "store",
      },
      {
        /** Id */
        id: "shop-create",
        /** Name */
        name: "Create Shop",
        /** Link */
        link: "/seller/my-shops/create",
        /** Icon */
        icon: "plus-circle",
      },
      //   icon: "settings",
      // },
    ],
  },
  {
    /** Id */
    id: "catalog",
    /** Name */
    name: "Catalog",
    /** Icon */
    icon: "package",
    /** Children */
    children: [
      {
        /** Id */
        id: "product-list",
        /** Name */
        name: "All Products",
        /** Link */
        link: "/seller/products",
        /** Icon */
        icon: "package",
      },
      {
        /** Id */
        id: "product-create",
        /** Name */
        name: "Add Product",
        /** Link */
        link: "/seller/products/create",
        /** Icon */
        icon: "plus-circle",
      },
      {
        /** Id */
        id: "auction-list",
        /** Name */
        name: "All Auctions",
        /** Link */
        link: "/seller/auctions",
        /** Icon */
        icon: "gavel",
      },
      {
        /** Id */
        id: "auction-create",
        /** Name */
        name: "Create Auction",
        /** Link */
        link: "/seller/auctions/create",
        /** Icon */
        icon: "plus-circle",
      },
    ],
  },
  {
    /** Id */
    id: "sales",
    /** Name */
    name: "Sales & Orders",
    /** Icon */
    icon: "shopping-cart",
    /** Children */
    children: [
      {
        /** Id */
        id: "orders",
        /** Name */
        name: "Orders",
        /** Link */
        link: "/seller/orders",
        /** Icon */
        icon: "shopping-cart",
      },
      {
        /** Id */
        id: "returns",
        /** Name */
        name: "Returns",
        /** Link */
        link: "/seller/returns",
        /** Icon */
        icon: "rotate-ccw",
      },
      {
        /** Id */
        id: "coupons",
        /** Name */
        name: "Coupons",
        /** Link */
        link: "/seller/coupons",
        /** Icon */
        icon: "ticket",
      },
      {
        /** Id */
        id: "coupon-create",
        /** Name */
        name: "Create Coupon",
        /** Link */
        link: "/seller/coupons/create",
        /** Icon */
        icon: "plus-circle",
      },
    ],
  },
  {
    /** Id */
    id: "performance",
    /** Name */
    name: "Performance",
    /** Icon */
    icon: "bar-chart",
    /** Children */
    children: [
      {
        /** Id */
        id: "analytics",
        /** Name */
        name: "Analytics",
        /** Link */
        link: "/seller/analytics",
        /** Icon */
        icon: "bar-chart",
      },
      {
        /** Id */
        id: "revenue",
        /** Name */
        name: "Revenue",
        /** Link */
        link: "/seller/revenue",
        /** Icon */
        icon: "dollar-sign",
      },
      {
        /** Id */
        id: "reviews",
        /** Name */
        name: "Reviews",
        /** Link */
        link: "/seller/reviews",
        /** Icon */
        icon: "star",
      },
    ],
  },
  {
    /** Id */
    id: "support",
    /** Name */
    name: "Support",
    /** Icon */
    icon: "life-buoy",
    /** Children */
    children: [
      {
        /** Id */
        id: "support-tickets",
        /** Name */
        name: "Support Tickets",
        /** Link */
        link: "/seller/support-tickets",
        /** Icon */
        icon: "life-buoy",
      },
      {
        /** Id */
        id: "help",
        /** Name */
        name: "Help Center",
        /** Link */
        link: "/seller/help",
        /** Icon */
        icon: "book-open",
      },
      {
        /** Id */
        id: "settings",
        /** Name */
        name: "Settings",
        /** Link */
        link: "/seller/settings",
        /** Icon */
        icon: "settings",
      },
    ],
  },
];

// Admin Sidebar Navigation (Grouped)
/**
 * Admin Menu Items
 * @constant
 */
export const ADMIN_MENU_ITEMS = [
  {
    /** Id */
    id: "dashboard",
    /** Name */
    name: "Dashboard",
    /** Link */
    link: "/admin/dashboard",
    /** Icon */
    icon: "layout-dashboard",
    /** Description */
    description: "System overview and metrics",
  },
  {
    /** Id */
    id: "overview",
    /** Name */
    name: "Overview",
    /** Link */
    link: "/admin",
    /** Icon */
    icon: "home",
    /** Description */
    description: "Quick overview and stats",
  },
  {
    /** Id */
    id: "content",
    /** Name */
    name: "Content Management",
    /** Icon */
    icon: "layout",
    /** Children */
    children: [
      {
        /** Id */
        id: "homepage",
        /** Name */
        name: "Homepage",
        /** Link */
        link: "/admin/homepage",
        /** Icon */
        icon: "home",
      },
      {
        /** Id */
        id: "hero-slides",
        /** Name */
        name: "Hero Slides",
        /** Link */
        link: "/admin/hero-slides",
        /** Icon */
        icon: "image",
      },
      {
        /** Id */
        id: "featured-sections",
        /** Name */
        name: "Featured Sections",
        /** Link */
        link: "/admin/featured-sections",
        /** Icon */
        icon: "star",
      },
      {
        /** Id */
        id: "categories",
        /** Name */
        name: "Categories",
        /** Link */
        link: "/admin/categories",
        /** Icon */
        icon: "folder-tree",
      },
      {
        /** Id */
        id: "static-assets",
        /** Name */
        name: "Static Assets",
        /** Link */
        link: "/admin/static-assets",
        /** Icon */
        icon: "file",
      },
    ],
  },
  {
    /** Id */
    id: "marketplace",
    /** Name */
    name: "Marketplace",
    /** Icon */
    icon: "store",
    /** Children */
    children: [
      { id: "shops", name: "All Shops", link: "/admin/shops", icon: "store" },
      {
        /** Id */
        id: "products",
        /** Name */
        name: "Products",
        /** Link */
        link: "/admin/products",
        /** Icon */
        icon: "package",
      },
      {
        /** Id */
        id: "auctions",
        /** Name */
        name: "All Auctions",
        /** Link */
        link: "/admin/auctions",
        /** Icon */
        icon: "gavel",
      },
      {
        /** Id */
        id: "auction-live",
        /** Name */
        name: "Live Auctions",
        /** Link */
        link: "/admin/auctions/live",
        /** Icon */
        icon: "zap",
      },
      {
        /** Id */
        id: "auction-moderation",
        /** Name */
        name: "Auction Moderation",
        /** Link */
        link: "/admin/auctions/moderation",
        /** Icon */
        icon: "shield",
      },
    ],
  },
  {
    /** Id */
    id: "user-management",
    /** Name */
    name: "User Management",
    /** Icon */
    icon: "users",
    /** Children */
    children: [
      { id: "users", name: "All Users", link: "/admin/users", icon: "users" },
      { id: "reviews", name: "Reviews", link: "/admin/reviews", icon: "star" },
    ],
  },
  {
    /** Id */
    id: "transactions",
    /** Name */
    name: "Transactions",
    /** Icon */
    icon: "credit-card",
    /** Children */
    children: [
      {
        /** Id */
        id: "orders",
        /** Name */
        name: "Orders",
        /** Link */
        link: "/admin/orders",
        /** Icon */
        icon: "shopping-cart",
      },
      {
        /** Id */
        id: "payments",
        /** Name */
        name: "Payments",
        /** Link */
        link: "/admin/payments",
        /** Icon */
        icon: "credit-card",
      },
      {
        /** Id */
        id: "payouts",
        /** Name */
        name: "Seller Payouts",
        /** Link */
        link: "/admin/payouts",
        /** Icon */
        icon: "banknote",
      },
      {
        /** Id */
        id: "coupons",
        /** Name */
        name: "Coupons",
        /** Link */
        link: "/admin/coupons",
        /** Icon */
        icon: "ticket",
      },
      {
        /** Id */
        id: "returns",
        /** Name */
        name: "Returns & Refunds",
        /** Link */
        link: "/admin/returns",
        /** Icon */
        icon: "rotate-ccw",
      },
    ],
  },
  {
    /** Id */
    id: "support",
    /** Name */
    name: "Support",
    /** Icon */
    icon: "life-buoy",
    /** Children */
    children: [
      {
        /** Id */
        id: "tickets-all",
        /** Name */
        name: "All Tickets",
        /** Link */
        link: "/admin/support-tickets",
        /** Icon */
        icon: "life-buoy",
      },
      {
        /** Id */
        id: "tickets-escalated",
        /** Name */
        name: "Escalated",
        /** Link */
        link: "/admin/support-tickets?escalated=true",
        /** Icon */
        icon: "alert-triangle",
      },
      {
        /** Id */
        id: "tickets-unresolved",
        /** Name */
        name: "Unresolved",
        /** Link */
        link: "/admin/support-tickets?status=open,in_progress",
        /** Icon */
        icon: "help-circle",
      },
    ],
  },
  // REMOVED: Analytics section - Routes do not exist
  // {
  //   id: "analytics",
  //   name: "Analytics",
  //   icon: "bar-chart",
  //   children: [
  //     { id: "analytics-overview", name: "Overview", link: "/admin/analytics", icon: "trending-up" },
  //     { id: "analytics-sales", name: "Sales", link: "/admin/analytics/sales", icon: "dollar-sign" },
  //     { id: "analytics-auctions", name: "Auctions", link: "/admin/analytics/auctions", icon: "gavel" },
  //     { id: "analytics-users", name: "Users", link: "/admin/analytics/users", icon: "users" },
  //   ],
  // },
  {
    /** Id */
    id: "blog",
    /** Name */
    name: "Blog",
    /** Icon */
    icon: "newspaper",
    /** Children */
    children: [
      {
        /** Id */
        id: "blog-all",
        /** Name */
        name: "All Posts",
        /** Link */
        link: "/admin/blog",
        /** Icon */
        icon: "newspaper",
      },
      {
        /** Id */
        id: "blog-create",
        /** Name */
        name: "Create Post",
        /** Link */
        link: "/admin/blog/create",
        /** Icon */
        icon: "plus-circle",
      },
      {
        /** Id */
        id: "blog-categories",
        /** Name */
        name: "Categories",
        /** Link */
        link: "/admin/blog/categories",
        /** Icon */
        icon: "folder",
      },
      {
        /** Id */
        id: "blog-tags",
        /** Name */
        name: "Tags",
        /** Link */
        link: "/admin/blog/tags",
        /** Icon */
        icon: "tag",
      },
    ],
  },
  {
    /** Id */
    id: "settings",
    /** Name */
    name: "Settings",
    /** Link */
    link: "/admin/settings",
    /** Icon */
    icon: "settings",
    /** Description */
    description: "System settings",
    /** Children */
    children: [
      {
        /** Id */
        id: "settings-general",
        /** Name */
        name: "General",
        /** Link */
        link: "/admin/settings/general",
        /** Icon */
        icon: "sliders",
      },
      {
        /** Id */
        id: "settings-payment",
        /** Name */
        name: "Payment Gateways",
        /** Link */
        link: "/admin/settings/payment",
        /** Icon */
        icon: "credit-card",
      },
      {
        /** Id */
        id: "settings-shipping",
        /** Name */
        name: "Shipping",
        /** Link */
        link: "/admin/settings/shipping",
        /** Icon */
        icon: "truck",
      },
      {
        /** Id */
        id: "settings-email",
        /** Name */
        name: "Email",
        /** Link */
        link: "/admin/settings/email",
        /** Icon */
        icon: "mail",
      },
      {
        /** Id */
        id: "settings-notifications",
        /** Name */
        name: "Notifications",
        /** Link */
        link: "/admin/settings/notifications",
        /** Icon */
        icon: "bell",
      },
    ],
  },
];

// Configuration constants
/**
 * Default Location
 * @constant
 */
export const DEFAULT_LOCATION = {
  /** Country */
  country: "India",
  /** Pincode */
  pincode: "110001",
};

// Viewing History Constants
/**
 * Viewing History Config
 * @constant
 */
export const VIEWING_HISTORY_CONFIG = {
  MAX_ITEMS: 50, // Maximum items to store in history
  STORAGE_KEY: "viewing_history", // LocalStorage key
  EXPIRY_DAYS: 30, // Days before history item expires
  /** T Y P E S */
  TYPES: {
    /** P R O D U C T */
    PRODUCT: "product",
    /** A U C T I O N */
    AUCTION: "auction",
  } as const,
};

// Recently Viewed Items Interface
/**
 * ViewingHistoryItem interface
 * 
 * @interface
 * @description Defines the structure and contract for ViewingHistoryItem
 */
export interface ViewingHistoryItem {
  /** Id */
  id: string;
  /** Type */
  type: "product" | "auction";
  /** Title */
  title: string;
  /** Slug */
  slug: string;
  /** Image */
  image: string;
  /** Price */
  price: number;
  shop_id: string;
  shop_name: string;
  viewed_at: number; // Timestamp
}
