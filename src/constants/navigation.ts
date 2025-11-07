// Navigation Constants

export const COMPANY_NAME = "LET IT RIP";
export const COMPANY_ALT_TEXT = "Let It Rip - Buy From Japan";

// Special Event Banner
export const SPECIAL_EVENT = {
  title: "Featured Sites",
  subtitle: "International Fleemarket • Purchase Fees • Coupon week end!",
  link: "/special-offers"
};

// Available Shops
export const SHOPS = [
  { id: "1", name: "Anime Figures", icon: "package", link: "/shops/anime-figures" },
  { id: "2", name: "Mercari", icon: "shopping-bag", link: "/shops/mercari" },
  { id: "3", name: "Rakuten Rakuma", icon: "store", link: "/shops/rakuten" },
  { id: "4", name: "JDirectItems Fleemarket", icon: "shopping-cart", link: "/shops/jdirect" },
  { id: "5", name: "Surugaya", icon: "book", link: "/shops/surugaya" },
  { id: "more", name: "More Shops", icon: "grid", link: "/shops" }
];

// Featured Categories
export const FEATURED_CATEGORIES = [
  { id: "1", name: "TCGs", icon: "layers", link: "/categories/tcg" },
  { id: "2", name: "Anime Merch", icon: "heart", link: "/categories/anime" },
  { id: "3", name: "Plushy", icon: "teddy-bear", link: "/categories/plushy" },
  { id: "4", name: "Luxury", icon: "gem", link: "/categories/luxury" },
  { id: "5", name: "Hobbies", icon: "puzzle", link: "/categories/hobbies" },
  { id: "6", name: "Outdoor", icon: "mountain", link: "/categories/outdoor" },
  { id: "7", name: "Audio Device", icon: "headphones", link: "/categories/audio" },
  { id: "8", name: "Gaming", icon: "gamepad-2", link: "/categories/gaming" },
  { id: "9", name: "Fashion", icon: "shirt", link: "/categories/fashion" },
  { id: "10", name: "K-pop", icon: "music", link: "/categories/kpop" }
];

// Product Categories for Dropdown
export const PRODUCT_CATEGORIES = [
  { id: "all", name: "All Categories", subcategories: [] },
  { 
    id: "toys", 
    name: "Toy Merchandise", 
    subcategories: ["Anime Soundtrack", "J-POP", "Rock Music", "Classical Music", "Idol CD", "Anime"]
  },
  { id: "electronics", name: "Electronics & Digital Devices", subcategories: [] },
  { id: "sports", name: "Sports & Outdoors", subcategories: [] },
  { id: "game", name: "Game", subcategories: [] },
  { id: "cd", name: "CD/DVD", subcategories: [] },
  { id: "book", name: "Book", subcategories: [] },
  { id: "women", name: "Women's Clothing", subcategories: [] },
  { id: "men", name: "Men's Clothing", subcategories: [] },
  { id: "kids", name: "Babies & Kids", subcategories: [] },
  { id: "home", name: "Daily Living & Home", subcategories: [] },
  { id: "beauty", name: "Beauty & Skincare", subcategories: [] },
  { id: "handicrafts", name: "Handicrafts", subcategories: [] },
  { id: "snacks", name: "Snacks", subcategories: [] },
  { id: "other", name: "Other Categories", subcategories: [] }
];

// User Menu Items
export const USER_MENU_ITEMS = [
  { id: "orders", name: "My Orders", link: "/user/orders", icon: "package" },
  { id: "bids", name: "My Bids", link: "/user/bids", icon: "gavel" },
  { id: "watchlist", name: "Watchlist", link: "/user/watchlist", icon: "eye" },
  { id: "won-auctions", name: "Won Auctions", link: "/user/won-auctions", icon: "trophy" },
  { id: "history", name: "History", link: "/user/history", icon: "clock" },
  { id: "messages", name: "My Messages", link: "/user/messages", icon: "message-square" },
  { id: "favorites", name: "My Favorites", link: "/user/favorites", icon: "heart" },
  { id: "returns", name: "Returns & Refunds", link: "/user/returns", icon: "rotate-ccw" },
  { id: "settings", name: "Account Settings", link: "/user/settings", icon: "settings" },
  { id: "logout", name: "Logout", link: "/logout", icon: "log-out" }
];

// Seller Sidebar Navigation
export const SELLER_MENU_ITEMS = [
  {
    id: "overview",
    name: "Overview",
    link: "/seller",
    icon: "layout-dashboard",
    description: "Sales overview and quick stats"
  },
  {
    id: "shops",
    name: "My Shops",
    icon: "store",
    children: [
      { id: "shop-list", name: "All Shops", link: "/seller/my-shops", icon: "list" },
      { id: "shop-create", name: "Create Shop", link: "/seller/my-shops/create", icon: "plus-circle" }
    ]
  },
  {
    id: "products",
    name: "Products",
    icon: "package",
    children: [
      { id: "product-list", name: "All Products", link: "/seller/products", icon: "list" },
      { id: "product-create", name: "Add Product", link: "/seller/products/create", icon: "plus-circle" }
    ]
  },
  {
    id: "auctions",
    name: "Auctions",
    icon: "gavel",
    children: [
      { id: "auction-list", name: "All Auctions", link: "/seller/auctions", icon: "list" },
      { id: "auction-create", name: "Create Auction", link: "/seller/auctions/create", icon: "plus-circle" },
      { id: "auction-active", name: "Active Auctions", link: "/seller/auctions?status=active", icon: "zap" },
      { id: "auction-ended", name: "Ended Auctions", link: "/seller/auctions?status=ended", icon: "clock" }
    ]
  },
  {
    id: "orders",
    name: "Orders",
    link: "/seller/orders",
    icon: "shopping-cart",
    description: "Manage customer orders"
  },
  {
    id: "coupons",
    name: "Coupons",
    icon: "ticket",
    children: [
      { id: "coupon-list", name: "All Coupons", link: "/seller/coupons", icon: "list" },
      { id: "coupon-create", name: "Create Coupon", link: "/seller/coupons/create", icon: "plus-circle" }
    ]
  },
  {
    id: "returns",
    name: "Returns",
    link: "/seller/returns",
    icon: "rotate-ccw",
    description: "Manage returns and refunds"
  },
  {
    id: "support-tickets",
    name: "Support Tickets",
    link: "/seller/support-tickets",
    icon: "life-buoy",
    description: "Customer support tickets"
  },
  {
    id: "analytics",
    name: "Analytics",
    link: "/seller/analytics",
    icon: "bar-chart",
    description: "Sales and performance analytics"
  },
  {
    id: "revenue",
    name: "Revenue",
    link: "/seller/revenue",
    icon: "dollar-sign",
    description: "Revenue and payouts"
  },
  {
    id: "reviews",
    name: "Reviews",
    link: "/seller/reviews",
    icon: "star",
    description: "Product and shop reviews"
  },
  {
    id: "settings",
    name: "Settings",
    link: "/seller/settings",
    icon: "settings",
    description: "Account and shop settings"
  }
];

// Admin Sidebar Navigation
export const ADMIN_MENU_ITEMS = [
  {
    id: "dashboard",
    name: "Dashboard",
    link: "/admin/dashboard",
    icon: "layout-dashboard",
    description: "System overview and metrics"
  },
  {
    id: "homepage",
    name: "Homepage",
    icon: "home",
    children: [
      { id: "hero-slides", name: "Hero Slides", link: "/admin/hero-slides", icon: "image" },
      { id: "featured-sections", name: "Featured Sections", link: "/admin/featured-sections", icon: "star" }
    ]
  },
  {
    id: "shops",
    name: "All Shops",
    link: "/admin/shops",
    icon: "store",
    description: "Manage all shops"
  },
  {
    id: "users",
    name: "Users",
    link: "/admin/users",
    icon: "users",
    description: "Manage all users"
  },
  {
    id: "products",
    name: "Products",
    link: "/admin/products",
    icon: "package",
    description: "Manage all products"
  },
  {
    id: "auctions",
    name: "Auctions",
    icon: "gavel",
    children: [
      { id: "auction-all", name: "All Auctions", link: "/admin/auctions", icon: "list" },
      { id: "auction-featured", name: "Featured Auctions", link: "/admin/auctions/featured", icon: "star" },
      { id: "auction-live", name: "Live Auctions", link: "/admin/auctions/live", icon: "zap" },
      { id: "auction-moderation", name: "Moderation", link: "/admin/auctions/moderation", icon: "shield" }
    ]
  },
  {
    id: "orders",
    name: "Orders",
    link: "/admin/orders",
    icon: "shopping-cart",
    description: "Manage all orders"
  },
  {
    id: "categories",
    name: "Categories",
    link: "/admin/categories",
    icon: "folder-tree",
    description: "Manage category tree"
  },
  {
    id: "coupons",
    name: "Coupons",
    link: "/admin/coupons",
    icon: "ticket",
    description: "Manage all coupons"
  },
  {
    id: "returns",
    name: "Returns & Refunds",
    link: "/admin/returns",
    icon: "rotate-ccw",
    description: "Handle returns and disputes"
  },
  {
    id: "support-tickets",
    name: "Support Center",
    icon: "life-buoy",
    children: [
      { id: "tickets-all", name: "All Tickets", link: "/admin/support-tickets", icon: "list" },
      { id: "tickets-escalated", name: "Escalated", link: "/admin/support-tickets?escalated=true", icon: "alert-triangle" },
      { id: "tickets-unresolved", name: "Unresolved", link: "/admin/support-tickets?status=open,in_progress", icon: "help-circle" }
    ]
  },
  {
    id: "reviews",
    name: "Reviews",
    link: "/admin/reviews",
    icon: "star",
    description: "Moderate reviews"
  },
  {
    id: "blog",
    name: "Blog",
    icon: "newspaper",
    children: [
      { id: "blog-all", name: "All Posts", link: "/admin/blog", icon: "list" },
      { id: "blog-create", name: "Create Post", link: "/admin/blog/create", icon: "plus-circle" },
      { id: "blog-categories", name: "Categories", link: "/admin/blog/categories", icon: "folder" },
      { id: "blog-tags", name: "Tags", link: "/admin/blog/tags", icon: "tag" }
    ]
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "bar-chart",
    children: [
      { id: "analytics-overview", name: "Overview", link: "/admin/analytics", icon: "trending-up" },
      { id: "analytics-sales", name: "Sales", link: "/admin/analytics/sales", icon: "dollar-sign" },
      { id: "analytics-auctions", name: "Auctions", link: "/admin/analytics/auctions", icon: "gavel" },
      { id: "analytics-users", name: "Users", link: "/admin/analytics/users", icon: "users" }
    ]
  },
  {
    id: "payments",
    name: "Payments",
    link: "/admin/payments",
    icon: "credit-card",
    description: "Payment transactions"
  },
  {
    id: "payouts",
    name: "Payouts",
    link: "/admin/payouts",
    icon: "banknote",
    description: "Seller payouts"
  },
  {
    id: "settings",
    name: "Settings",
    icon: "settings",
    children: [
      { id: "settings-general", name: "General", link: "/admin/settings/general", icon: "sliders" },
      { id: "settings-payment", name: "Payment Gateways", link: "/admin/settings/payment", icon: "credit-card" },
      { id: "settings-shipping", name: "Shipping", link: "/admin/settings/shipping", icon: "truck" },
      { id: "settings-email", name: "Email", link: "/admin/settings/email", icon: "mail" },
      { id: "settings-notifications", name: "Notifications", link: "/admin/settings/notifications", icon: "bell" }
    ]
  }
];

// Header Actions
export const HEADER_ACTIONS = {
  invite: { text: "Invite Friends", link: "/invite", icon: "user-plus" },
  rewards: { text: "Claim rewards", link: "/rewards", icon: "gift" },
  downloadApp: { text: "Download APP", link: "/download", icon: "smartphone" }
};

export const DEFAULT_LOCATION = {
  country: "India",
  pincode: "110001"
};

// Viewing History Constants
export const VIEWING_HISTORY_CONFIG = {
  MAX_ITEMS: 50, // Maximum items to store in history
  STORAGE_KEY: "viewing_history", // LocalStorage key
  EXPIRY_DAYS: 30, // Days before history item expires
  TYPES: {
    PRODUCT: "product",
    AUCTION: "auction"
  } as const
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
