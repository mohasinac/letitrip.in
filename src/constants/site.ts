/**
 * @fileoverview TypeScript Module
 * @module src/constants/site
 * @description This file contains functionality related to site
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Site Configuration Constants
 * Central location for all site-wide configuration values
 */

// Site Information
/**
 * Site Name
 * @constant
 */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Letitrip";
/**
 * Site Domain
 * @constant
 */
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "letitrip.in";
/**
 * Site Url
 * @constant
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://letitrip.in";
/**
 * Api Url
 * @constant
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || `${SITE_URL}/api`;

// Site Metadata
/**
 * Site Description
 * @constant
 */
export const SITE_DESCRIPTION =
  "Modern auction and e-commerce platform for India";
/**
 * Site Keywords
 * @constant
 */
export const SITE_KEYWORDS =
  "auction, e-commerce, online shopping, bidding, India";
/**
 * Site Author
 * @constant
 */
export const SITE_AUTHOR = "Letitrip Team";

// Social Media
/**
 * Social Links
 * @constant
 */
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/letitrip",
  facebook: "https://facebook.com/letitrip",
  instagram: "https://instagram.com/letitrip",
  linkedin: "https://linkedin.com/company/letitrip",
};

// Contact Information
/**
 * Contact Email
 * @constant
 */
export const CONTACT_EMAIL = "support@letitrip.in";
/**
 * Contact Phone
 * @constant
 */
export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91-8000000000"; // 1800-000-0000 (toll-free)

// Business Information
/**
 * Business Name
 * @constant
 */
export const BUSINESS_NAME = "Letitrip Private Limited";
/**
 * Business Address
 * @constant
 */
export const BUSINESS_ADDRESS = "India";

// SEO Configuration
/**
 * Default Og Image
 * @constant
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
/**
 * Default Twitter Image
 * @constant
 */
export const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/twitter-image.jpg`;

// Feature Flags
/**
 * Enable Analytics
 * @constant
 */
export const ENABLE_ANALYTICS =
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
/**
 * Enable Socket
 * @constant
 */
export const ENABLE_SOCKET = true;

// URLs
/**
 * Socket Url
 * @constant
 */
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "https://beyblade-socket-server.onrender.com";

// Application Configuration
/**
 * Coupon Prefix
 * @constant
 */
export const COUPON_PREFIX = process.env.COUPON_CODE_PREFIX || "LT";
/**
 * Coupon Length
 * @constant
 */
export const COUPON_LENGTH = parseInt(
  process.env.COUPON_CODE_LENGTH || "8",
  10,
);

// File Upload Configuration
/**
 * Max File Size
 * @constant
 */
export const MAX_FILE_SIZE = parseInt(
  process.env.MAX_FILE_SIZE || "10485760",
  10,
); // 10MB
/**
 * Performs a l l o w e d_ f i l e_ t y p e s operation
 *
 * @returns {any} The allowed_file_types result
 *
 * @example
 * ALLOWED_FILE_TYPES();
 */

/**
 * Allowed File Types
 * @constant
 */
/**
 * Performs a l l o w e d_ f i l e_ t y p e s operation
 *
 * @returns {any} The allowed_file_types result
 *
 * @example
 * ALLOWED_FILE_TYPES();
 */

/**
 * Allowed File Types
 * @constant
 */
export const ALLOWED_FILE_TYPES = (
  process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp"
).split(",");

// Rate Limiting
/**
 * Rate Limit Window Ms
 * @constant
 */
export const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "900000",
  10,
); // 15 minutes
/**
 * Rate Limit Max Requests
 * @constant
 */
export const RATE_LIMIT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || "100",
  10,
);

// Pagination
/**
 * Default Page Size
 * @constant
 */
export const DEFAULT_PAGE_SIZE = 20;
/**
 * Max Page Size
 * @constant
 */
export const MAX_PAGE_SIZE = 100;

// Currency
/**
 * Default Currency
 * @constant
 */
export const DEFAULT_CURRENCY = "INR";
/**
 * Currency Symbol
 * @constant
 */
export const CURRENCY_SYMBOL = "₹";

// Date/Time Format
/**
 * Date Format
 * @constant
 */
export const DATE_FORMAT = "dd MMM yyyy";
/**
 * Time Format
 * @constant
 */
export const TIME_FORMAT = "HH:mm";
/**
 * Datetime Format
 * @constant
 */
export const DATETIME_FORMAT = "dd MMM yyyy, HH:mm";

// Navigation
/**
 * Nav Links
 * @constant
 */
export const NAV_LINKS = {
  /** Home */
  home: "/",
  /** Auctions */
  auctions: "/auctions",
  /** Products */
  products: "/products",
  /** Categories */
  categories: "/categories",
  /** Shops */
  shops: "/shops",
  /** About */
  about: "/about",
  /** Contact */
  contact: "/contact",
};

// User Roles
/**
 * User Roles
 * @constant
 */
export const USER_ROLES = {
  /** A D M I N */
  ADMIN: "admin",
  /** S E L L E R */
  SELLER: "seller",
  /** B U Y E R */
  BUYER: "buyer",
} as const;

// Order Status
/**
 * Order Status
 * @constant
 */
export const ORDER_STATUS = {
  /** P E N D I N G */
  PENDING: "pending",
  /** C O N F I R M E D */
  CONFIRMED: "confirmed",
  /** P R O C E S S I N G */
  PROCESSING: "processing",
  /** S H I P P E D */
  SHIPPED: "shipped",
  /** D E L I V E R E D */
  DELIVERED: "delivered",
  /** C A N C E L L E D */
  CANCELLED: "cancelled",
  /** R E F U N D E D */
  REFUNDED: "refunded",
} as const;

// Auction Status
/**
 * Auction Status
 * @constant
 */
export const AUCTION_STATUS = {
  /** D R A F T */
  DRAFT: "draft",
  /** S C H E D U L E D */
  SCHEDULED: "scheduled",
  /** A C T I V E */
  ACTIVE: "active",
  /** E N D E D */
  ENDED: "ended",
  /** C A N C E L L E D */
  CANCELLED: "cancelled",
} as const;

// Product Status
/**
 * Product Status
 * @constant
 */
export const PRODUCT_STATUS = {
  /** D R A F T */
  DRAFT: "draft",
  /** A C T I V E */
  ACTIVE: "active",
  /** I N A C T I V E */
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
} as const;

// Support Ticket Status
/**
 * Ticket Status
 * @constant
 */
export const TICKET_STATUS = {
  /** O P E N */
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  /** R E S O L V E D */
  RESOLVED: "resolved",
  /** C L O S E D */
  CLOSED: "closed",
} as const;

// Firebase Collections
/**
 * Collections
 * @constant
 */
export const COLLECTIONS = {
  /** U S E R S */
  USERS: "users",
  /** P R O D U C T S */
  PRODUCTS: "products",
  /** A U C T I O N S */
  AUCTIONS: "auctions",
  /** B I D S */
  BIDS: "bids",
  /** O R D E R S */
  ORDERS: "orders",
  /** S H O P S */
  SHOPS: "shops",
  /** C A T E G O R I E S */
  CATEGORIES: "categories",
  /** C O U P O N S */
  COUPONS: "coupons",
  /** C A R T */
  CART: "cart",
  /** R E V I E W S */
  REVIEWS: "reviews",
  SUPPORT_TICKETS: "support_tickets",
  /** R E T U R N S */
  RETURNS: "returns",
  /** S E S S I O N S */
  SESSIONS: "sessions",
  HERO_SLIDES: "hero_slides",
  FEATURED_SECTIONS: "featured_sections",
  BLOG_POSTS: "blog_posts",
  STATIC_ASSETS: "static_assets",
} as const;
