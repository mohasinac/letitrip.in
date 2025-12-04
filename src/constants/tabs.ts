// Tab Navigation Constants
// Used by TabNav component for route-based tabbed navigation

export interface Tab {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

// Admin Settings Tabs
export const ADMIN_SETTINGS_TABS: Tab[] = [
  {
    id: "general",
    label: "General",
    href: "/admin/settings",
    icon: "settings",
  },
  {
    id: "payment",
    label: "Payment",
    href: "/admin/settings/payment",
    icon: "credit-card",
  },
  {
    id: "shipping",
    label: "Shipping",
    href: "/admin/settings/shipping",
    icon: "truck",
  },
  { id: "email", label: "Email", href: "/admin/settings/email", icon: "mail" },
  {
    id: "notifications",
    label: "Notifications",
    href: "/admin/settings/notifications",
    icon: "bell",
  },
];

// Admin Blog Tabs
export const ADMIN_BLOG_TABS: Tab[] = [
  { id: "posts", label: "All Posts", href: "/admin/blog", icon: "file-text" },
  {
    id: "create",
    label: "Create Post",
    href: "/admin/blog/create",
    icon: "plus",
  },
  {
    id: "categories",
    label: "Categories",
    href: "/admin/blog/categories",
    icon: "folder",
  },
  { id: "tags", label: "Tags", href: "/admin/blog/tags", icon: "tag" },
];

// Admin Auctions Tabs
export const ADMIN_AUCTIONS_TABS: Tab[] = [
  { id: "all", label: "All Auctions", href: "/admin/auctions", icon: "gavel" },
  { id: "live", label: "Live", href: "/admin/auctions/live", icon: "zap" },
  {
    id: "moderation",
    label: "Moderation",
    href: "/admin/auctions/moderation",
    icon: "shield",
  },
];

// Admin Content Tabs (Homepage, Hero Slides, Featured Sections)
export const ADMIN_CONTENT_TABS: Tab[] = [
  { id: "homepage", label: "Homepage", href: "/admin/homepage", icon: "home" },
  {
    id: "hero-slides",
    label: "Hero Slides",
    href: "/admin/hero-slides",
    icon: "image",
  },
  {
    id: "featured-sections",
    label: "Featured Sections",
    href: "/admin/featured-sections",
    icon: "star",
  },
  {
    id: "categories",
    label: "Categories",
    href: "/admin/categories",
    icon: "folder-tree",
  },
];

// Admin Marketplace Tabs (Products & Shops)
export const ADMIN_MARKETPLACE_TABS: Tab[] = [
  {
    id: "products",
    label: "Products",
    href: "/admin/products",
    icon: "package",
  },
  { id: "shops", label: "Shops", href: "/admin/shops", icon: "store" },
];

// Admin Transactions Tabs (Orders, Payments, Payouts)
export const ADMIN_TRANSACTIONS_TABS: Tab[] = [
  {
    id: "orders",
    label: "Orders",
    href: "/admin/orders",
    icon: "shopping-cart",
  },
  {
    id: "payments",
    label: "Payments",
    href: "/admin/payments",
    icon: "credit-card",
  },
  {
    id: "payouts",
    label: "Payouts",
    href: "/admin/payouts",
    icon: "dollar-sign",
  },
];

// Admin Support Tabs
export const ADMIN_SUPPORT_TABS: Tab[] = [
  {
    id: "all",
    label: "All Tickets",
    href: "/admin/support-tickets",
    icon: "life-buoy",
  },
];

// Seller Products Tabs
export const SELLER_PRODUCTS_TABS: Tab[] = [
  {
    id: "all",
    label: "All Products",
    href: "/seller/products",
    icon: "package",
  },
  {
    id: "create",
    label: "Add Product",
    href: "/seller/products/create",
    icon: "plus",
  },
];

// Seller Auctions Tabs
export const SELLER_AUCTIONS_TABS: Tab[] = [
  { id: "all", label: "All Auctions", href: "/seller/auctions", icon: "gavel" },
  {
    id: "create",
    label: "Create Auction",
    href: "/seller/auctions/create",
    icon: "plus",
  },
];

// Seller Orders Tabs
export const SELLER_ORDERS_TABS: Tab[] = [
  {
    id: "all",
    label: "All Orders",
    href: "/seller/orders",
    icon: "shopping-cart",
  },
  {
    id: "pending",
    label: "Pending",
    href: "/seller/orders?status=pending",
    icon: "clock",
  },
  {
    id: "completed",
    label: "Completed",
    href: "/seller/orders?status=completed",
    icon: "check",
  },
];

// Seller Shop Management Tabs
export const SELLER_SHOP_TABS: Tab[] = [
  { id: "shops", label: "My Shops", href: "/seller/my-shops", icon: "store" },
  {
    id: "create",
    label: "Create Shop",
    href: "/seller/my-shops/create",
    icon: "plus",
  },
];

// User Settings Tabs
export const USER_SETTINGS_TABS: Tab[] = [
  { id: "profile", label: "Profile", href: "/user/settings", icon: "user" },
  {
    id: "security",
    label: "Security",
    href: "/user/settings/security",
    icon: "shield",
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/user/settings/notifications",
    icon: "bell",
  },
];

// User Orders Tabs
export const USER_ORDERS_TABS: Tab[] = [
  { id: "all", label: "All Orders", href: "/user/orders", icon: "package" },
  {
    id: "active",
    label: "Active",
    href: "/user/orders?status=active",
    icon: "clock",
  },
  {
    id: "completed",
    label: "Completed",
    href: "/user/orders?status=completed",
    icon: "check",
  },
];

// User Auctions Tabs
export const USER_AUCTIONS_TABS: Tab[] = [
  { id: "bids", label: "My Bids", href: "/user/bids", icon: "gavel" },
  { id: "watchlist", label: "Watchlist", href: "/user/watchlist", icon: "eye" },
  {
    id: "won",
    label: "Won Auctions",
    href: "/user/won-auctions",
    icon: "trophy",
  },
];

// Export all tabs grouped
export const ADMIN_TABS = {
  SETTINGS: ADMIN_SETTINGS_TABS,
  BLOG: ADMIN_BLOG_TABS,
  AUCTIONS: ADMIN_AUCTIONS_TABS,
  CONTENT: ADMIN_CONTENT_TABS,
  SUPPORT: ADMIN_SUPPORT_TABS,
  MARKETPLACE: ADMIN_MARKETPLACE_TABS,
  TRANSACTIONS: ADMIN_TRANSACTIONS_TABS,
};

export const SELLER_TABS = {
  PRODUCTS: SELLER_PRODUCTS_TABS,
  AUCTIONS: SELLER_AUCTIONS_TABS,
  ORDERS: SELLER_ORDERS_TABS,
  SHOPS: SELLER_SHOP_TABS,
};

export const USER_TABS = {
  SETTINGS: USER_SETTINGS_TABS,
  ORDERS: USER_ORDERS_TABS,
  AUCTIONS: USER_AUCTIONS_TABS,
};
