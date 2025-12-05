// Navigation Constants
// NOTE: See routes.ts for centralized page route constants

export const COMPANY_NAME = "LET IT RIP";
export const COMPANY_ALT_TEXT = "Let It Rip - Buy Collectibles in India";

// Note: Category-related constants moved to src/constants/categories.ts
// Use getCategoryBySlug(), getSubcategories(), etc. from categories.ts

// User Menu Items (Grouped)
// BROKEN ROUTES FIXED:
// - /user/notifications - Route does not exist (E016 not implemented)
// - /user/returns - Route does not exist (use /user/orders)
// - /user/reviews - Route does not exist (use /reviews)
export const USER_MENU_ITEMS = [
  {
    id: "overview",
    name: "Overview",
    icon: "layout-dashboard",
    children: [
      {
        id: "dashboard",
        name: "Dashboard",
        link: "/user",
        icon: "layout-dashboard",
      },
      {
        id: "notifications",
        name: "Notifications",
        link: "/user/notifications",
        icon: "bell",
      },
    ],
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "shopping-bag",
    children: [
      {
        id: "orders",
        name: "My Orders",
        link: "/user/orders",
        icon: "package",
      },
      {
        id: "favorites",
        name: "My Favorites",
        link: "/user/favorites",
        icon: "heart",
      },
      { id: "history", name: "History", link: "/user/history", icon: "clock" },
      {
        id: "returns",
        name: "Returns & Refunds",
        link: "/user/returns",
        icon: "rotate-ccw",
      },
    ],
  },
  {
    id: "auctions",
    name: "Auctions",
    icon: "gavel",
    children: [
      { id: "bids", name: "My Bids", link: "/user/bids", icon: "gavel" },
      {
        id: "watchlist",
        name: "Watchlist",
        link: "/user/watchlist",
        icon: "eye",
      },
      {
        id: "won-auctions",
        name: "Won Auctions",
        link: "/user/won-auctions",
        icon: "trophy",
      },
    ],
  },
  {
    id: "account",
    name: "Account",
    icon: "user",
    children: [
      {
        id: "messages",
        name: "My Messages",
        link: "/user/messages",
        icon: "message-square",
      },
      {
        id: "addresses",
        name: "My Addresses",
        link: "/user/addresses",
        icon: "map-pin",
      },
      {
        id: "reviews",
        name: "My Reviews",
        link: "/user/reviews",
        icon: "star",
      },
      {
        id: "settings",
        name: "Account Settings",
        link: "/user/settings",
        icon: "settings",
      },
    ],
  },
  { id: "logout", name: "Logout", link: "/logout", icon: "log-out" },
];

// Seller Sidebar Navigation (Grouped)
export const SELLER_MENU_ITEMS = [
  {
    id: "overview",
    name: "Overview",
    link: "/seller",
    icon: "layout-dashboard",
    description: "Sales overview and quick stats",
  },
  {
    id: "shop-management",
    name: "Shop Management",
    icon: "store",
    children: [
      {
        id: "shop-list",
        name: "My Shops",
        link: "/seller/my-shops",
        icon: "store",
      },
      {
        id: "shop-create",
        name: "Create Shop",
        link: "/seller/my-shops/create",
        icon: "plus-circle",
      },
      //   icon: "settings",
      // },
    ],
  },
  {
    id: "catalog",
    name: "Catalog",
    icon: "package",
    children: [
      {
        id: "product-list",
        name: "All Products",
        link: "/seller/products",
        icon: "package",
      },
      {
        id: "product-create",
        name: "Add Product",
        link: "/seller/products/create",
        icon: "plus-circle",
      },
      {
        id: "auction-list",
        name: "All Auctions",
        link: "/seller/auctions",
        icon: "gavel",
      },
      {
        id: "auction-create",
        name: "Create Auction",
        link: "/seller/auctions/create",
        icon: "plus-circle",
      },
    ],
  },
  {
    id: "sales",
    name: "Sales & Orders",
    icon: "shopping-cart",
    children: [
      {
        id: "orders",
        name: "Orders",
        link: "/seller/orders",
        icon: "shopping-cart",
      },
      {
        id: "returns",
        name: "Returns",
        link: "/seller/returns",
        icon: "rotate-ccw",
      },
      {
        id: "coupons",
        name: "Coupons",
        link: "/seller/coupons",
        icon: "ticket",
      },
      {
        id: "coupon-create",
        name: "Create Coupon",
        link: "/seller/coupons/create",
        icon: "plus-circle",
      },
    ],
  },
  {
    id: "performance",
    name: "Performance",
    icon: "bar-chart",
    children: [
      {
        id: "analytics",
        name: "Analytics",
        link: "/seller/analytics",
        icon: "bar-chart",
      },
      {
        id: "revenue",
        name: "Revenue",
        link: "/seller/revenue",
        icon: "dollar-sign",
      },
      {
        id: "reviews",
        name: "Reviews",
        link: "/seller/reviews",
        icon: "star",
      },
    ],
  },
  {
    id: "support",
    name: "Support",
    icon: "life-buoy",
    children: [
      {
        id: "support-tickets",
        name: "Support Tickets",
        link: "/seller/support-tickets",
        icon: "life-buoy",
      },
      {
        id: "help",
        name: "Help Center",
        link: "/seller/help",
        icon: "book-open",
      },
      {
        id: "settings",
        name: "Settings",
        link: "/seller/settings",
        icon: "settings",
      },
    ],
  },
];

// Admin Sidebar Navigation (Grouped)
export const ADMIN_MENU_ITEMS = [
  {
    id: "dashboard",
    name: "Dashboard",
    link: "/admin/dashboard",
    icon: "layout-dashboard",
    description: "System overview and metrics",
  },
  {
    id: "overview",
    name: "Overview",
    link: "/admin",
    icon: "home",
    description: "Quick overview and stats",
  },
  {
    id: "content",
    name: "Content Management",
    icon: "layout",
    children: [
      {
        id: "homepage",
        name: "Homepage",
        link: "/admin/homepage",
        icon: "home",
      },
      {
        id: "hero-slides",
        name: "Hero Slides",
        link: "/admin/hero-slides",
        icon: "image",
      },
      {
        id: "featured-sections",
        name: "Featured Sections",
        link: "/admin/featured-sections",
        icon: "star",
      },
      {
        id: "categories",
        name: "Categories",
        link: "/admin/categories",
        icon: "folder-tree",
      },
      {
        id: "static-assets",
        name: "Static Assets",
        link: "/admin/static-assets",
        icon: "file",
      },
    ],
  },
  {
    id: "marketplace",
    name: "Marketplace",
    icon: "store",
    children: [
      { id: "shops", name: "All Shops", link: "/admin/shops", icon: "store" },
      {
        id: "products",
        name: "Products",
        link: "/admin/products",
        icon: "package",
      },
      {
        id: "auctions",
        name: "All Auctions",
        link: "/admin/auctions",
        icon: "gavel",
      },
      {
        id: "auction-live",
        name: "Live Auctions",
        link: "/admin/auctions/live",
        icon: "zap",
      },
      {
        id: "auction-moderation",
        name: "Auction Moderation",
        link: "/admin/auctions/moderation",
        icon: "shield",
      },
    ],
  },
  {
    id: "user-management",
    name: "User Management",
    icon: "users",
    children: [
      { id: "users", name: "All Users", link: "/admin/users", icon: "users" },
      { id: "reviews", name: "Reviews", link: "/admin/reviews", icon: "star" },
    ],
  },
  {
    id: "transactions",
    name: "Transactions",
    icon: "credit-card",
    children: [
      {
        id: "orders",
        name: "Orders",
        link: "/admin/orders",
        icon: "shopping-cart",
      },
      {
        id: "payments",
        name: "Payments",
        link: "/admin/payments",
        icon: "credit-card",
      },
      {
        id: "payouts",
        name: "Seller Payouts",
        link: "/admin/payouts",
        icon: "banknote",
      },
      {
        id: "coupons",
        name: "Coupons",
        link: "/admin/coupons",
        icon: "ticket",
      },
      {
        id: "returns",
        name: "Returns & Refunds",
        link: "/admin/returns",
        icon: "rotate-ccw",
      },
    ],
  },
  {
    id: "support",
    name: "Support",
    icon: "life-buoy",
    children: [
      {
        id: "tickets-all",
        name: "All Tickets",
        link: "/admin/support-tickets",
        icon: "life-buoy",
      },
      {
        id: "tickets-escalated",
        name: "Escalated",
        link: "/admin/support-tickets?escalated=true",
        icon: "alert-triangle",
      },
      {
        id: "tickets-unresolved",
        name: "Unresolved",
        link: "/admin/support-tickets?status=open,in_progress",
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
    id: "blog",
    name: "Blog",
    icon: "newspaper",
    children: [
      {
        id: "blog-all",
        name: "All Posts",
        link: "/admin/blog",
        icon: "newspaper",
      },
      {
        id: "blog-create",
        name: "Create Post",
        link: "/admin/blog/create",
        icon: "plus-circle",
      },
      {
        id: "blog-categories",
        name: "Categories",
        link: "/admin/blog/categories",
        icon: "folder",
      },
      {
        id: "blog-tags",
        name: "Tags",
        link: "/admin/blog/tags",
        icon: "tag",
      },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    link: "/admin/settings",
    icon: "settings",
    description: "System settings",
    children: [
      {
        id: "settings-general",
        name: "General",
        link: "/admin/settings/general",
        icon: "sliders",
      },
      {
        id: "settings-payment",
        name: "Payment Gateways",
        link: "/admin/settings/payment",
        icon: "credit-card",
      },
      {
        id: "settings-shipping",
        name: "Shipping",
        link: "/admin/settings/shipping",
        icon: "truck",
      },
      {
        id: "settings-email",
        name: "Email",
        link: "/admin/settings/email",
        icon: "mail",
      },
      {
        id: "settings-notifications",
        name: "Notifications",
        link: "/admin/settings/notifications",
        icon: "bell",
      },
    ],
  },
];

// Configuration constants
export const DEFAULT_LOCATION = {
  country: "India",
  pincode: "110001",
};

// Viewing History Constants
export const VIEWING_HISTORY_CONFIG = {
  MAX_ITEMS: 50, // Maximum items to store in history
  STORAGE_KEY: "viewing_history", // LocalStorage key
  EXPIRY_DAYS: 30, // Days before history item expires
  TYPES: {
    PRODUCT: "product",
    AUCTION: "auction",
  } as const,
};

// Recently Viewed Items Interface
export interface ViewingHistoryItem {
  id: string;
  type: "product" | "auction";
  title: string;
  slug: string;
  image: string;
  price: number;
  shop_id: string;
  shop_name: string;
  viewed_at: number; // Timestamp
}
