/**
 * Searchable Navigation Routes
 * These routes appear as suggestions in the search bar when "All" is selected.
 * Used for quick navigation to common pages.
 */

export interface SearchableRoute {
  id: string;
  name: string;
  path: string;
  description: string;
  keywords: string[]; // Keywords for matching search queries
  icon: string;
  category: "main" | "user" | "seller" | "admin" | "support" | "legal";
}

// Public navigation routes
export const PUBLIC_ROUTES: SearchableRoute[] = [
  {
    id: "home",
    name: "Home",
    path: "/",
    description: "Go to homepage",
    keywords: ["home", "start", "main", "index", "landing"],
    icon: "home",
    category: "main",
  },
  {
    id: "auctions",
    name: "Browse Auctions",
    path: "/auctions",
    description: "View all live auctions",
    keywords: ["auction", "bid", "live", "bidding", "auctions"],
    icon: "gavel",
    category: "main",
  },
  {
    id: "products",
    name: "Browse Products",
    path: "/products",
    description: "Shop all products",
    keywords: ["product", "shop", "buy", "store", "items", "products"],
    icon: "package",
    category: "main",
  },
  {
    id: "categories",
    name: "Categories",
    path: "/categories",
    description: "Browse by category",
    keywords: ["category", "categories", "browse", "filter"],
    icon: "folder",
    category: "main",
  },
  {
    id: "shops",
    name: "All Shops",
    path: "/shops",
    description: "Discover shops and sellers",
    keywords: ["shop", "shops", "seller", "sellers", "store", "stores"],
    icon: "store",
    category: "main",
  },
  {
    id: "cart",
    name: "Shopping Cart",
    path: "/cart",
    description: "View your cart",
    keywords: ["cart", "basket", "checkout", "shopping"],
    icon: "shopping-cart",
    category: "main",
  },
  {
    id: "search",
    name: "Search",
    path: "/search",
    description: "Search everything",
    keywords: ["search", "find", "look"],
    icon: "search",
    category: "main",
  },
];

// User account routes
export const USER_ROUTES: SearchableRoute[] = [
  {
    id: "user-dashboard",
    name: "My Dashboard",
    path: "/user",
    description: "Your account dashboard",
    keywords: ["dashboard", "account", "profile", "my"],
    icon: "layout-dashboard",
    category: "user",
  },
  {
    id: "user-orders",
    name: "My Orders",
    path: "/user/orders",
    description: "View your orders",
    keywords: ["order", "orders", "purchase", "purchases", "bought"],
    icon: "package",
    category: "user",
  },
  {
    id: "user-bids",
    name: "My Bids",
    path: "/user/bids",
    description: "View your auction bids",
    keywords: ["bid", "bids", "bidding", "auction"],
    icon: "gavel",
    category: "user",
  },
  {
    id: "user-favorites",
    name: "My Favorites",
    path: "/user/favorites",
    description: "View saved items",
    keywords: ["favorite", "favorites", "saved", "wishlist", "like", "liked"],
    icon: "heart",
    category: "user",
  },
  {
    id: "user-watchlist",
    name: "Auction Watchlist",
    path: "/user/watchlist",
    description: "Auctions you're watching",
    keywords: ["watch", "watchlist", "watching", "track", "follow"],
    icon: "eye",
    category: "user",
  },
  {
    id: "user-won-auctions",
    name: "Won Auctions",
    path: "/user/won-auctions",
    description: "Auctions you won",
    keywords: ["won", "winner", "win", "victory"],
    icon: "trophy",
    category: "user",
  },
  {
    id: "user-messages",
    name: "My Messages",
    path: "/user/messages",
    description: "Your messages",
    keywords: ["message", "messages", "inbox", "chat"],
    icon: "message-square",
    category: "user",
  },
  {
    id: "user-addresses",
    name: "My Addresses",
    path: "/user/addresses",
    description: "Manage your addresses",
    keywords: ["address", "addresses", "shipping", "delivery"],
    icon: "map-pin",
    category: "user",
  },
  {
    id: "user-reviews",
    name: "My Reviews",
    path: "/user/reviews",
    description: "Reviews you wrote",
    keywords: ["review", "reviews", "rating", "feedback"],
    icon: "star",
    category: "user",
  },
  {
    id: "user-settings",
    name: "Account Settings",
    path: "/user/settings",
    description: "Manage account settings",
    keywords: ["setting", "settings", "preferences", "account", "profile"],
    icon: "settings",
    category: "user",
  },
  {
    id: "user-returns",
    name: "Returns & Refunds",
    path: "/user/returns",
    description: "Manage returns",
    keywords: ["return", "returns", "refund", "refunds"],
    icon: "rotate-ccw",
    category: "user",
  },
];

// Seller routes
export const SELLER_ROUTES: SearchableRoute[] = [
  {
    id: "seller-dashboard",
    name: "Seller Dashboard",
    path: "/seller",
    description: "Seller overview",
    keywords: ["seller", "dashboard", "sales"],
    icon: "layout-dashboard",
    category: "seller",
  },
  {
    id: "seller-shops",
    name: "My Shops",
    path: "/seller/my-shops",
    description: "Manage your shops",
    keywords: ["shop", "shops", "store", "stores", "my"],
    icon: "store",
    category: "seller",
  },
  {
    id: "seller-products",
    name: "My Products",
    path: "/seller/products",
    description: "Manage your products",
    keywords: ["product", "products", "inventory", "stock"],
    icon: "package",
    category: "seller",
  },
  {
    id: "seller-auctions",
    name: "My Auctions",
    path: "/seller/auctions",
    description: "Manage your auctions",
    keywords: ["auction", "auctions", "listing"],
    icon: "gavel",
    category: "seller",
  },
  {
    id: "seller-orders",
    name: "Seller Orders",
    path: "/seller/orders",
    description: "Manage customer orders",
    keywords: ["order", "orders", "sales", "fulfill"],
    icon: "shopping-cart",
    category: "seller",
  },
  {
    id: "seller-analytics",
    name: "Analytics",
    path: "/seller/analytics",
    description: "View sales analytics",
    keywords: ["analytics", "stats", "statistics", "reports"],
    icon: "bar-chart",
    category: "seller",
  },
  {
    id: "seller-revenue",
    name: "Revenue",
    path: "/seller/revenue",
    description: "View revenue reports",
    keywords: ["revenue", "earnings", "income", "money", "payout"],
    icon: "dollar-sign",
    category: "seller",
  },
];

// Support and info routes
export const SUPPORT_ROUTES: SearchableRoute[] = [
  {
    id: "about",
    name: "About Us",
    path: "/about",
    description: "Learn about Letitrip",
    keywords: ["about", "company", "info", "information", "who"],
    icon: "info",
    category: "support",
  },
  {
    id: "contact",
    name: "Contact Us",
    path: "/contact",
    description: "Get in touch",
    keywords: ["contact", "support", "help", "email", "phone", "reach"],
    icon: "mail",
    category: "support",
  },
  {
    id: "faq",
    name: "FAQ",
    path: "/faq",
    description: "Frequently asked questions",
    keywords: ["faq", "question", "questions", "help", "how"],
    icon: "help-circle",
    category: "support",
  },
  {
    id: "support",
    name: "Support Center",
    path: "/support",
    description: "Get help and support",
    keywords: ["support", "help", "issue", "problem", "ticket"],
    icon: "life-buoy",
    category: "support",
  },
  {
    id: "guide",
    name: "User Guide",
    path: "/guide",
    description: "How to use the platform",
    keywords: ["guide", "tutorial", "how", "learn", "help"],
    icon: "book-open",
    category: "support",
  },
  {
    id: "blog",
    name: "Blog",
    path: "/blog",
    description: "Read our blog",
    keywords: ["blog", "news", "article", "articles", "post", "posts"],
    icon: "newspaper",
    category: "support",
  },
  {
    id: "fees",
    name: "Fees & Pricing",
    path: "/fees",
    description: "View our fees",
    keywords: ["fee", "fees", "price", "pricing", "cost", "commission"],
    icon: "credit-card",
    category: "support",
  },
];

// Legal routes
export const LEGAL_ROUTES: SearchableRoute[] = [
  {
    id: "privacy",
    name: "Privacy Policy",
    path: "/privacy-policy",
    description: "Our privacy policy",
    keywords: ["privacy", "policy", "data"],
    icon: "shield",
    category: "legal",
  },
  {
    id: "terms",
    name: "Terms of Service",
    path: "/terms-of-service",
    description: "Terms and conditions",
    keywords: ["terms", "conditions", "service", "tos"],
    icon: "file-text",
    category: "legal",
  },
  {
    id: "refund",
    name: "Refund Policy",
    path: "/refund-policy",
    description: "Our refund policy",
    keywords: ["refund", "return", "policy", "money"],
    icon: "rotate-ccw",
    category: "legal",
  },
  {
    id: "shipping",
    name: "Shipping Policy",
    path: "/shipping-policy",
    description: "Shipping information",
    keywords: ["shipping", "delivery", "policy"],
    icon: "truck",
    category: "legal",
  },
  {
    id: "cookies",
    name: "Cookie Policy",
    path: "/cookie-policy",
    description: "Cookie information",
    keywords: ["cookie", "cookies", "policy"],
    icon: "cookie",
    category: "legal",
  },
];

// Auth routes
export const AUTH_ROUTES: SearchableRoute[] = [
  {
    id: "login",
    name: "Login",
    path: "/login",
    description: "Sign in to your account",
    keywords: ["login", "signin", "sign", "in", "account"],
    icon: "log-in",
    category: "main",
  },
  {
    id: "register",
    name: "Register",
    path: "/register",
    description: "Create an account",
    keywords: ["register", "signup", "sign", "up", "create", "account", "join"],
    icon: "user-plus",
    category: "main",
  },
  {
    id: "forgot-password",
    name: "Forgot Password",
    path: "/forgot-password",
    description: "Reset your password",
    keywords: ["forgot", "password", "reset", "recover"],
    icon: "key",
    category: "main",
  },
];

// Combined routes for search
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
export function searchNavigationRoutes(
  query: string,
  maxResults: number = 10,
  options?: {
    includeUser?: boolean;
    includeSeller?: boolean;
    includeAdmin?: boolean;
  },
): SearchableRoute[] {
  if (!query || query.length < 1) {
    // Return popular routes when no query
    return [...PUBLIC_ROUTES.slice(0, 5), ...SUPPORT_ROUTES.slice(0, 3)].slice(
      0,
      maxResults,
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

    // Path match
    if (route.path.toLowerCase().includes(normalizedQuery)) {
      score += 20;
    }

    // Keyword matches
    const keywordMatches = route.keywords.filter((kw) =>
      queryWords.some((qw) => kw.includes(qw) || qw.includes(kw)),
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
