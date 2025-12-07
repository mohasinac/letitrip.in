/**
 * Site Configuration Constants
 * Central location for all site-wide configuration values
 */

// Site Information
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Letitrip";
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "letitrip.in";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://letitrip.in";

// Site Metadata
export const SITE_DESCRIPTION =
  "Modern auction and e-commerce platform for India";
export const SITE_KEYWORDS =
  "auction, e-commerce, online shopping, bidding, India";
export const SITE_AUTHOR = "Letitrip Team";

// Social Media
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/letitrip",
  facebook: "https://facebook.com/letitrip",
  instagram: "https://instagram.com/letitrip",
  linkedin: "https://linkedin.com/company/letitrip",
};

// Contact Information
export const CONTACT_EMAIL = "support@letitrip.in";
export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91-8000000000"; // 1800-000-0000 (toll-free)

// Business Information
export const BUSINESS_NAME = "Letitrip Private Limited";
export const BUSINESS_ADDRESS = "India";

// SEO Configuration
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/twitter-image.jpg`;

// Feature Flags
export const ENABLE_ANALYTICS =
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
export const ENABLE_SOCKET = true;

// URLs
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "https://beyblade-socket-server.onrender.com";

// Application Configuration
export const COUPON_PREFIX = process.env.COUPON_CODE_PREFIX || "LT";
export const COUPON_LENGTH = parseInt(
  process.env.COUPON_CODE_LENGTH || "8",
  10
);

// File Upload Configuration
export const ALLOWED_FILE_TYPES = (
  process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp"
).split(",");

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "900000",
  10
); // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || "100",
  10
);

// Currency
export const DEFAULT_CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";

// Date/Time Format
export const DATE_FORMAT = "dd MMM yyyy";
export const TIME_FORMAT = "HH:mm";
export const DATETIME_FORMAT = "dd MMM yyyy, HH:mm";

// Navigation
export const NAV_LINKS = {
  home: "/",
  auctions: "/auctions",
  products: "/products",
  categories: "/categories",
  shops: "/shops",
  about: "/about",
  contact: "/contact",
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  AUCTIONS: "auctions",
  BIDS: "bids",
  ORDERS: "orders",
  SHOPS: "shops",
  CATEGORIES: "categories",
  COUPONS: "coupons",
  CART: "cart",
  REVIEWS: "reviews",
  SUPPORT_TICKETS: "support_tickets",
  RETURNS: "returns",
  SESSIONS: "sessions",
  HERO_SLIDES: "hero_slides",
  FEATURED_SECTIONS: "featured_sections",
  BLOG_POSTS: "blog_posts",
  STATIC_ASSETS: "static_assets",
} as const;
