/**
 * @fileoverview TypeScript Module
 * @module src/constants/searchable-routes
 * @description This file contains functionality related to searchable-routes
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Searchable Navigation Routes
 * These routes appear as suggestions in the search bar when "All" is selected.
 * Used for quick navigation to common pages.
 */

/**
 * Searchable Route interface
 * @interface SearchableRoute
 */
export interface SearchableRoute {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Path */
  path: string;
  /** Description */
  description: string;
  /** Keywords */
  keywords: string[]; // Keywords for matching search queries
  /** Icon */
  icon: string;
  /** Category */
  category: "main" | "user" | "seller" | "admin" | "support" | "legal";
}

// Public navigation routes
/**
 * Public Routes
 * @constant
 */
export const PUBLIC_ROUTES: SearchableRoute[] = [
  {
    /** Id */
    id: "home",
    /** Name */
    name: "Home",
    /** Path */
    path: "/",
    /** Description */
    description: "Go to homepage",
    /** Keywords */
    keywords: ["home", "start", "main", "index", "landing"],
    /** Icon */
    icon: "home",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "auctions",
    /** Name */
    name: "Browse Auctions",
    /** Path */
    path: "/auctions",
    /** Description */
    description: "View all live auctions",
    /** Keywords */
    keywords: ["auction", "bid", "live", "bidding", "auctions"],
    /** Icon */
    icon: "gavel",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "products",
    /** Name */
    name: "Browse Products",
    /** Path */
    path: "/products",
    /** Description */
    description: "Shop all products",
    /** Keywords */
    keywords: ["product", "shop", "buy", "store", "items", "products"],
    /** Icon */
    icon: "package",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "categories",
    /** Name */
    name: "Categories",
    /** Path */
    path: "/categories",
    /** Description */
    description: "Browse by category",
    /** Keywords */
    keywords: ["category", "categories", "browse", "filter"],
    /** Icon */
    icon: "folder",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "shops",
    /** Name */
    name: "All Shops",
    /** Path */
    path: "/shops",
    /** Description */
    description: "Discover shops and sellers",
    /** Keywords */
    keywords: ["shop", "shops", "seller", "sellers", "store", "stores"],
    /** Icon */
    icon: "store",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "cart",
    /** Name */
    name: "Shopping Cart",
    /** Path */
    path: "/cart",
    /** Description */
    description: "View your cart",
    /** Keywords */
    keywords: ["cart", "basket", "checkout", "shopping"],
    /** Icon */
    icon: "shopping-cart",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "search",
    /** Name */
    name: "Search",
    /** Path */
    path: "/search",
    /** Description */
    description: "Search everything",
    /** Keywords */
    keywords: ["search", "find", "look"],
    /** Icon */
    icon: "search",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "events",
    /** Name */
    name: "Events",
    /** Path */
    path: "/events",
    /** Description */
    description: "Browse upcoming events",
    /** Keywords */
    keywords: ["event", "events", "happening", "calendar"],
    /** Icon */
    icon: "calendar",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "compare",
    /** Name */
    name: "Compare Products",
    /** Path */
    path: "/compare",
    /** Description */
    description: "Compare products side by side",
    /** Keywords */
    keywords: ["compare", "comparison", "vs", "versus"],
    /** Icon */
    icon: "git-compare",
    /** Category */
    category: "main",
  },
];

// User account routes
/**
 * User Routes
 * @constant
 */
export const USER_ROUTES: SearchableRoute[] = [
  {
    /** Id */
    id: "user-dashboard",
    /** Name */
    name: "My Dashboard",
    /** Path */
    path: "/user",
    /** Description */
    description: "Your account dashboard",
    /** Keywords */
    keywords: ["dashboard", "account", "profile", "my"],
    /** Icon */
    icon: "layout-dashboard",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-orders",
    /** Name */
    name: "My Orders",
    /** Path */
    path: "/user/orders",
    /** Description */
    description: "View your orders",
    /** Keywords */
    keywords: ["order", "orders", "purchase", "purchases", "bought"],
    /** Icon */
    icon: "package",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-bids",
    /** Name */
    name: "My Bids",
    /** Path */
    path: "/user/bids",
    /** Description */
    description: "View your auction bids",
    /** Keywords */
    keywords: ["bid", "bids", "bidding", "auction"],
    /** Icon */
    icon: "gavel",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-favorites",
    /** Name */
    name: "My Favorites",
    /** Path */
    path: "/user/favorites",
    /** Description */
    description: "View saved items",
    /** Keywords */
    keywords: ["favorite", "favorites", "saved", "wishlist", "like", "liked"],
    /** Icon */
    icon: "heart",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-watchlist",
    /** Name */
    name: "Auction Watchlist",
    /** Path */
    path: "/user/watchlist",
    /** Description */
    description: "Auctions you're watching",
    /** Keywords */
    keywords: ["watch", "watchlist", "watching", "track", "follow"],
    /** Icon */
    icon: "eye",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-won-auctions",
    /** Name */
    name: "Won Auctions",
    /** Path */
    path: "/user/won-auctions",
    /** Description */
    description: "Auctions you won",
    /** Keywords */
    keywords: ["won", "winner", "win", "victory"],
    /** Icon */
    icon: "trophy",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-messages",
    /** Name */
    name: "My Messages",
    /** Path */
    path: "/user/messages",
    /** Description */
    description: "Your messages",
    /** Keywords */
    keywords: ["message", "messages", "inbox", "chat"],
    /** Icon */
    icon: "message-square",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-addresses",
    /** Name */
    name: "My Addresses",
    /** Path */
    path: "/user/addresses",
    /** Description */
    description: "Manage your addresses",
    /** Keywords */
    keywords: ["address", "addresses", "shipping", "delivery"],
    /** Icon */
    icon: "map-pin",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-reviews",
    /** Name */
    name: "My Reviews",
    /** Path */
    path: "/user/reviews",
    /** Description */
    description: "Reviews you wrote",
    /** Keywords */
    keywords: ["review", "reviews", "rating", "feedback"],
    /** Icon */
    icon: "star",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-settings",
    /** Name */
    name: "Account Settings",
    /** Path */
    path: "/user/settings",
    /** Description */
    description: "Manage account settings",
    /** Keywords */
    keywords: ["setting", "settings", "preferences", "account", "profile"],
    /** Icon */
    icon: "settings",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-returns",
    /** Name */
    name: "Returns & Refunds",
    /** Path */
    path: "/user/returns",
    /** Description */
    description: "Manage returns",
    /** Keywords */
    keywords: ["return", "returns", "refund", "refunds"],
    /** Icon */
    icon: "rotate-ccw",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-notifications",
    /** Name */
    name: "Notifications",
    /** Path */
    path: "/user/notifications",
    /** Description */
    description: "View your notifications",
    /** Keywords */
    keywords: ["notification", "notifications", "alert", "alerts"],
    /** Icon */
    icon: "bell",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-riplimit",
    /** Name */
    name: "RipLimit",
    /** Path */
    path: "/user/riplimit",
    /** Description */
    description: "Manage your RipLimit",
    /** Keywords */
    keywords: ["riplimit", "limit", "credit", "balance"],
    /** Icon */
    icon: "credit-card",
    /** Category */
    category: "user",
  },
  {
    /** Id */
    id: "user-tickets",
    /** Name */
    name: "Support Tickets",
    /** Path */
    path: "/user/tickets",
    /** Description */
    description: "View your support tickets",
    /** Keywords */
    keywords: ["ticket", "tickets", "support", "help"],
    /** Icon */
    icon: "life-buoy",
    /** Category */
    category: "user",
  },
];

// Seller routes
/**
 * Seller Routes
 * @constant
 */
export const SELLER_ROUTES: SearchableRoute[] = [
  {
    /** Id */
    id: "seller-dashboard",
    /** Name */
    name: "Seller Dashboard",
    /** Path */
    path: "/seller",
    /** Description */
    description: "Seller overview",
    /** Keywords */
    keywords: ["seller", "dashboard", "sales"],
    /** Icon */
    icon: "layout-dashboard",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-shops",
    /** Name */
    name: "My Shops",
    /** Path */
    path: "/seller/my-shops",
    /** Description */
    description: "Manage your shops",
    /** Keywords */
    keywords: ["shop", "shops", "store", "stores", "my"],
    /** Icon */
    icon: "store",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-products",
    /** Name */
    name: "My Products",
    /** Path */
    path: "/seller/products",
    /** Description */
    description: "Manage your products",
    /** Keywords */
    keywords: ["product", "products", "inventory", "stock"],
    /** Icon */
    icon: "package",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-auctions",
    /** Name */
    name: "My Auctions",
    /** Path */
    path: "/seller/auctions",
    /** Description */
    description: "Manage your auctions",
    /** Keywords */
    keywords: ["auction", "auctions", "listing"],
    /** Icon */
    icon: "gavel",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-orders",
    /** Name */
    name: "Seller Orders",
    /** Path */
    path: "/seller/orders",
    /** Description */
    description: "Manage customer orders",
    /** Keywords */
    keywords: ["order", "orders", "sales", "fulfill"],
    /** Icon */
    icon: "shopping-cart",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-analytics",
    /** Name */
    name: "Analytics",
    /** Path */
    path: "/seller/analytics",
    /** Description */
    description: "View sales analytics",
    /** Keywords */
    keywords: ["analytics", "stats", "statistics", "reports"],
    /** Icon */
    icon: "bar-chart",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-revenue",
    /** Name */
    name: "Revenue",
    /** Path */
    path: "/seller/revenue",
    /** Description */
    description: "View revenue reports",
    /** Keywords */
    keywords: ["revenue", "earnings", "income", "money", "payout"],
    /** Icon */
    icon: "dollar-sign",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-coupons",
    /** Name */
    name: "Coupons",
    /** Path */
    path: "/seller/coupons",
    /** Description */
    description: "Manage your coupons",
    /** Keywords */
    keywords: ["coupon", "coupons", "discount", "promo"],
    /** Icon */
    icon: "ticket",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-returns",
    /** Name */
    name: "Returns",
    /** Path */
    path: "/seller/returns",
    /** Description */
    description: "Manage customer returns",
    /** Keywords */
    keywords: ["return", "returns", "refund"],
    /** Icon */
    icon: "rotate-ccw",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-reviews",
    /** Name */
    name: "Reviews",
    /** Path */
    path: "/seller/reviews",
    /** Description */
    description: "View your reviews",
    /** Keywords */
    keywords: ["review", "reviews", "rating", "feedback"],
    /** Icon */
    icon: "star",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-messages",
    /** Name */
    name: "Messages",
    /** Path */
    path: "/seller/messages",
    /** Description */
    description: "View customer messages",
    /** Keywords */
    keywords: ["message", "messages", "chat", "inbox"],
    /** Icon */
    icon: "message-square",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-support-tickets",
    /** Name */
    name: "Support Tickets",
    /** Path */
    path: "/seller/support-tickets",
    /** Description */
    description: "View support tickets",
    /** Keywords */
    keywords: ["ticket", "tickets", "support", "help"],
    /** Icon */
    icon: "life-buoy",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-settings",
    /** Name */
    name: "Seller Settings",
    /** Path */
    path: "/seller/settings",
    /** Description */
    description: "Manage seller settings",
    /** Keywords */
    keywords: ["setting", "settings", "preferences", "config"],
    /** Icon */
    icon: "settings",
    /** Category */
    category: "seller",
  },
  {
    /** Id */
    id: "seller-help",
    /** Name */
    name: "Help Center",
    /** Path */
    path: "/seller/help",
    /** Description */
    description: "Get help and guidance",
    /** Keywords */
    keywords: ["help", "guide", "support", "how"],
    /** Icon */
    icon: "book-open",
    /** Category */
    category: "seller",
  },
];

// Support and info routes
/**
 * Support Routes
 * @constant
 */
export const SUPPORT_ROUTES: SearchableRoute[] = [
  {
    /** Id */
    id: "about",
    /** Name */
    name: "About Us",
    /** Path */
    path: "/about",
    /** Description */
    description: "Learn about Letitrip",
    /** Keywords */
    keywords: ["about", "company", "info", "information", "who"],
    /** Icon */
    icon: "info",
    /** Category */
    category: "support",
  },
  {
    /** Id */
    id: "contact",
    /** Name */
    name: "Contact Us",
    /** Path */
    path: "/contact",
    /** Description */
    description: "Get in touch",
    /** Keywords */
    keywords: ["contact", "support", "help", "email", "phone", "reach"],
    /** Icon */
    icon: "mail",
    /** Category */
    category: "support",
  },
  {
    /** Id */
    id: "faq",
    /** Name */
    name: "FAQ",
    /** Path */
    path: "/faq",
    /** Description */
    description: "Frequently asked questions",
    /** Keywords */
    keywords: ["faq", "question", "questions", "help", "how"],
    /** Icon */
    icon: "help-circle",
    /** Category */
    category: "support",
  },
  {
    /** Id */
    id: "support",
    /** Name */
    name: "Support Center",
    /** Path */
    path: "/support",
    /** Description */
    description: "Get help and support",
    /** Keywords */
    keywords: ["support", "help", "issue", "problem", "ticket"],
    /** Icon */
    icon: "life-buoy",
    /** Category */
    category: "support",
  },
  {
    /** Id */
    id: "guide",
    /** Name */
    name: "User Guide",
    /** Path */
    path: "/guide",
    /** Description */
    description: "How to use the platform",
    /** Keywords */
    keywords: ["guide", "tutorial", "how", "learn", "help"],
    /** Icon */
    icon: "book-open",
    /** Category */
    category: "support",
  },
  {
    /** Id */
    id: "blog",
    /** Name */
    name: "Blog",
    /** Path */
    path: "/blog",
    /** Description */
    description: "Read our blog",
    /** Keywords */
    keywords: ["blog", "news", "article", "articles", "post", "posts"],
    /** Icon */
    icon: "newspaper",
    /** Category */
    category: "support",
  },
  {
    /** Id */
    id: "fees",
    /** Name */
    name: "Fees & Pricing",
    /** Path */
    path: "/fees",
    /** Description */
    description: "View our fees",
    /** Keywords */
    keywords: ["fee", "fees", "price", "pricing", "cost", "commission"],
    /** Icon */
    icon: "credit-card",
    /** Category */
    category: "support",
  },
];

// Legal routes
/**
 * Legal Routes
 * @constant
 */
export const LEGAL_ROUTES: SearchableRoute[] = [
  {
    /** Id */
    id: "privacy",
    /** Name */
    name: "Privacy Policy",
    /** Path */
    path: "/privacy-policy",
    /** Description */
    description: "Our privacy policy",
    /** Keywords */
    keywords: ["privacy", "policy", "data"],
    /** Icon */
    icon: "shield",
    /** Category */
    category: "legal",
  },
  {
    /** Id */
    id: "terms",
    /** Name */
    name: "Terms of Service",
    /** Path */
    path: "/terms-of-service",
    /** Description */
    description: "Terms and conditions",
    /** Keywords */
    keywords: ["terms", "conditions", "service", "tos"],
    /** Icon */
    icon: "file-text",
    /** Category */
    category: "legal",
  },
  {
    /** Id */
    id: "refund",
    /** Name */
    name: "Refund Policy",
    /** Path */
    path: "/refund-policy",
    /** Description */
    description: "Our refund policy",
    /** Keywords */
    keywords: ["refund", "return", "policy", "money"],
    /** Icon */
    icon: "rotate-ccw",
    /** Category */
    category: "legal",
  },
  {
    /** Id */
    id: "shipping",
    /** Name */
    name: "Shipping Policy",
    /** Path */
    path: "/shipping-policy",
    /** Description */
    description: "Shipping information",
    /** Keywords */
    keywords: ["shipping", "delivery", "policy"],
    /** Icon */
    icon: "truck",
    /** Category */
    category: "legal",
  },
  {
    /** Id */
    id: "cookies",
    /** Name */
    name: "Cookie Policy",
    /** Path */
    path: "/cookie-policy",
    /** Description */
    description: "Cookie information",
    /** Keywords */
    keywords: ["cookie", "cookies", "policy"],
    /** Icon */
    icon: "cookie",
    /** Category */
    category: "legal",
  },
];

// Auth routes
/**
 * Auth Routes
 * @constant
 */
export const AUTH_ROUTES: SearchableRoute[] = [
  {
    /** Id */
    id: "login",
    /** Name */
    name: "Login",
    /** Path */
    path: "/login",
    /** Description */
    description: "Sign in to your account",
    /** Keywords */
    keywords: ["login", "signin", "sign", "in", "account"],
    /** Icon */
    icon: "log-in",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "register",
    /** Name */
    name: "Register",
    /** Path */
    path: "/register",
    /** Description */
    description: "Create an account",
    /** Keywords */
    keywords: ["register", "signup", "sign", "up", "create", "account", "join"],
    /** Icon */
    icon: "user-plus",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "forgot-password",
    /** Name */
    name: "Forgot Password",
    /** Path */
    path: "/forgot-password",
    /** Description */
    description: "Reset your password",
    /** Keywords */
    keywords: ["forgot", "password", "reset", "recover"],
    /** Icon */
    icon: "key",
    /** Category */
    category: "main",
  },
  {
    /** Id */
    id: "reset-password",
    /** Name */
    name: "Reset Password",
    /** Path */
    path: "/reset-password",
    /** Description */
    description: "Create new password",
    /** Keywords */
    keywords: ["reset", "password", "new", "change"],
    /** Icon */
    icon: "key",
    /** Category */
    category: "main",
  },
];

// Combined routes for search
/**
 * All Searchable Routes
 * @constant
 */
export const ALL_SEARCHABLE_ROUTES: SearchableRoute[] = [
  ...PUBLIC_ROUTES,
  ...USER_ROUTES,
  ...SELLER_ROUTES,
  ...SUPPORT_ROUTES,
  ...LEGAL_ROUTES,
  ...AUTH_ROUTES,
];

/**
 * Search navigation routes by query
 * Returns matching routes sorted by relevance
 */
/**
 * Performs search navigation routes operation
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * searchNavigationRoutes();
 */

/**
 * Performs search navigation routes operation
 *
 * @returns {string} The searchnavigationroutes result
 *
 * @example
 * searchNavigationRoutes();
 */

export function searchNavigationRoutes(
  /** Query */
  query: string,
  /** Max Results */
  maxResults: number = 10,
  /** Options */
  options?: {
    /** Include User */
    includeUser?: boolean;
    /** Include Seller */
    includeSeller?: boolean;
    /** Include Admin */
    includeAdmin?: boolean;
  }
): SearchableRoute[] {
  if (!query || query.length < 1) {
    // Return popular routes when no query
    return [...PUBLIC_ROUTES.slice(0, 5), ...SUPPORT_ROUTES.slice(0, 3)].slice(
      0,
      maxResults
    );
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  // Build routes list based on options
  let routes: SearchableRoute[] = [
    ...PUBLIC_ROUTES,
    ...SUPPORT_ROUTES,
    ...LEGAL_ROUTES,
    ...AUTH_ROUTES,
  ];

  if (options?.includeUser !== false) {
    routes = [...routes, ...USER_ROUTES];
  }

  if (options?.includeSeller !== false) {
    routes = [...routes, ...SELLER_ROUTES];
  }

  // Score and filter routes
  /**
 * Performs scored routes operation
 *
 * @param {any} (route - The (route
 *
 * @returns {any} The scoredroutes result
 *
 */
const scoredRoutes = routes.map((route) => {
    let score = 0;

    // Exact name match (highest priority)
    if (route.name.toLowerCase() === normalizedQuery) {
      score += 100;
    }
    // Name starts with query
    else if (route.name.toLowerCase().startsWith(normalizedQuery)) {
      score += 50;
    }
    // Name contains query
    else if (route.name.toLowerCase().includes(normalizedQuery)) {
      score += 30;
    }

    // P/**
 * Performs keyword matches operation
 *
 * @param {any} (kw - The (kw
 *
 * @returns {any} The keywordmatches result
 *
 */
ath match
    if (route.path.toLowerCase().includes(normalizedQuery)) {
      score += 20;
    }

    // Keyword matches
    const keywordMatches = route.keywords.filter((kw) =>
      queryWords.some((qw) => kw.includes(qw) || qw.includes(kw))
    );
    score += keywordMatches.length * 10;

    // Description match
    if (route.description.toLowerCase().includes(normalizedQuery)) {
      score += 5;
    }

    return { route, score };
  });

  // Filter routes with score > 0 and sort by score
  return scoredRoutes
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ route }) => route);
}
