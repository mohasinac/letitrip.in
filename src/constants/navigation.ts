// Navigation Constants

export const COMPANY_NAME = "DOORZO";
export const COMPANY_ALT_TEXT = "Doorzo - Buy From Japan";

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
  { id: "orders", name: "My Order", link: "/user/orders", icon: "package" },
  { id: "history", name: "History", link: "/user/history", icon: "clock" },
  { id: "messages", name: "My Messages", link: "/user/messages", icon: "message-square" },
  { id: "favorites", name: "My Favorites", link: "/user/favorites", icon: "heart" },
  { id: "settings", name: "Account Settings", link: "/user/settings", icon: "settings" },
  { id: "logout", name: "Logout", link: "/logout", icon: "log-out" }
];

// Admin Menu Items (for future use)
export const ADMIN_MENU_ITEMS = [
  { id: "dashboard", name: "Dashboard", link: "/admin/dashboard", icon: "layout-dashboard" },
  { id: "users", name: "Users", link: "/admin/users", icon: "users" },
  { id: "products", name: "Products", link: "/admin/products", icon: "package" },
  { id: "orders", name: "Orders", link: "/admin/orders", icon: "shopping-cart" },
  { id: "settings", name: "Settings", link: "/admin/settings", icon: "settings" }
];

// Seller Menu Items (for future use)
export const SELLER_MENU_ITEMS = [
  { id: "dashboard", name: "Seller Dashboard", link: "/seller/dashboard", icon: "layout-dashboard" },
  { id: "products", name: "My Products", link: "/seller/products", icon: "package" },
  { id: "orders", name: "Orders", link: "/seller/orders", icon: "shopping-bag" },
  { id: "analytics", name: "Analytics", link: "/seller/analytics", icon: "bar-chart" },
  { id: "settings", name: "Settings", link: "/seller/settings", icon: "settings" }
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
