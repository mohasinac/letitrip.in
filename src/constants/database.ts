/**
 * Database Collection Names
 * Centralized constants for all Firestore collection names
 */

export const COLLECTIONS = {
  // Core Business Collections
  SHOPS: "shops",
  PRODUCTS: "products",
  CATEGORIES: "categories",

  // User & Auth Collections
  USERS: "users",
  USER_PROFILES: "user_profiles",

  // Order & Transaction Collections
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  CARTS: "carts",
  CART_ITEMS: "cart_items",

  // Payment & Financial Collections
  PAYMENTS: "payments",
  PAYMENT_TRANSACTIONS: "payment_transactions",
  PAYMENT_REFUNDS: "payment_refunds",
  REFUNDS: "refunds",
  PAYOUTS: "payouts",

  // Returns & Support Collections
  RETURNS: "returns",
  RETURN_ITEMS: "return_items",
  SUPPORT_TICKETS: "support_tickets",
  TICKET_MESSAGES: "ticket_messages",

  // Shipping Collections
  SHIPMENTS: "shipments",
  ADDRESSES: "addresses",

  // Marketing & Promotions Collections
  COUPONS: "coupons",
  COUPON_USAGE: "coupon_usage",

  // Review & Rating Collections
  REVIEWS: "reviews",
  REVIEW_VOTES: "review_votes", // For helpful/not helpful votes

  // Auction Collections
  AUCTIONS: "auctions",
  BIDS: "bids",
  AUCTION_WATCHLIST: "auction_watchlist",
  WON_AUCTIONS: "won_auctions",

  // User Activity Collections
  FAVORITES: "favorites",
  VIEWING_HISTORY: "viewing_history",
  SEARCH_HISTORY: "search_history",

  // Analytics Collections
  ANALYTICS: "analytics",
  SEARCH_ANALYTICS: "search_analytics",
  PRODUCT_VIEWS: "product_views",

  // Media Collections
  MEDIA: "media",
  MEDIA_METADATA: "media_metadata",

  // Notification Collections
  NOTIFICATIONS: "notifications",
  EMAIL_QUEUE: "email_queue",
  SMS_QUEUE: "sms_queue",
  WHATSAPP_OPT_INS: "whatsapp_opt_ins",
  WHATSAPP_MESSAGES: "whatsapp_messages",

  // Messaging Collections
  MESSAGES: "messages",
  CONVERSATIONS: "conversations",

  // RipLimit Collections (Virtual Currency)
  RIPLIMIT_ACCOUNTS: "riplimit_accounts",
  RIPLIMIT_TRANSACTIONS: "riplimit_transactions",
  RIPLIMIT_PURCHASES: "riplimit_purchases",
  RIPLIMIT_REFUNDS: "riplimit_refunds",

  // Homepage Management Collections
  HERO_SLIDES: "hero_slides",
  FEATURED_SECTIONS: "featured_sections",
  HOMEPAGE_SETTINGS: "homepage_settings",

  // Content Management Collections
  BLOG_POSTS: "blog_posts",
  FAQS: "faqs",

  // Settings Collections
  SETTINGS: "settings",
  SITE_SETTINGS: "site_settings",
  PAYMENT_SETTINGS: "payment_settings",
  SHIPPING_ZONES: "shipping_zones",
  SHIPPING_CARRIERS: "shipping_carriers",
  EMAIL_TEMPLATES: "email_templates",
  EMAIL_SETTINGS: "email_settings",
  NOTIFICATION_SETTINGS: "notification_settings",
  FEATURE_FLAGS: "feature_flags",
  BUSINESS_RULES: "business_rules",
  RIPLIMIT_SETTINGS: "riplimit_settings",
  ANALYTICS_SETTINGS: "analytics_settings",

  // Events & Verification Collections
  EVENTS: "events",
  EVENT_REGISTRATIONS: "event_registrations",
  EVENT_VOTES: "event_votes",
  EVENT_OPTIONS: "event_options",
  OTP_VERIFICATIONS: "otp_verifications",
  USER_ACTIVITIES: "user_activities",

  // Session & Auth Collections
  SESSIONS: "sessions",
} as const;

/**
 * Subcollection Names (nested under parent documents)
 */
export const SUBCOLLECTIONS = {
  // Shop subcollections
  SHOP_FOLLOWERS: "followers",
  SHOP_FOLLOWING: "following",
  SHOP_ANALYTICS: "analytics",
  SHOP_SETTINGS: "settings",

  // Product subcollections
  PRODUCT_VARIANTS: "variants",
  PRODUCT_IMAGES: "images",

  // Order subcollections
  ORDER_HISTORY: "history",
  ORDER_NOTES: "notes",

  // User subcollections
  USER_SESSIONS: "sessions",
  USER_DEVICES: "devices",

  // Review subcollections
  REVIEW_HELPFUL_VOTES: "helpful_votes",

  // Ticket subcollections
  TICKET_MESSAGES: "messages",

  // RipLimit subcollections
  RIPLIMIT_BLOCKED_BIDS: "blocked_bids",
} as const;

/**
 * Database Field Names - Common fields used across collections
 */
export const FIELDS = {
  // Common fields
  ID: "id",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
  DELETED_AT: "deleted_at",

  // Ownership fields
  USER_ID: "user_id",
  SHOP_ID: "shop_id",
  OWNER_ID: "owner_id",

  // Status fields
  STATUS: "status",
  IS_ACTIVE: "is_active",
  IS_VERIFIED: "is_verified",
  IS_FEATURED: "is_featured",
  IS_BANNED: "is_banned",

  // SEO fields
  SLUG: "slug",
  META_TITLE: "meta_title",
  META_DESCRIPTION: "meta_description",
  META_KEYWORDS: "meta_keywords",

  // Media fields
  IMAGE_URL: "image_url",
  IMAGES: "images",
  VIDEO_URL: "video_url",
  THUMBNAIL_URL: "thumbnail_url",
} as const;

/**
 * Database Indexes - Document which fields should be indexed
 * Note: These are documentation only, actual indexes must be created in Firestore
 */
export const INDEXES = {
  SHOPS: [
    ["status", "is_verified", "created_at"],
    ["user_id", "status"],
    ["is_featured", "is_verified", "created_at"],
  ],

  PRODUCTS: [
    ["shop_id", "status", "created_at"],
    ["category_id", "status", "price"],
    ["status", "is_featured", "created_at"],
    ["shop_id", "category_id", "status"],
  ],

  ORDERS: [
    ["user_id", "status", "created_at"],
    ["shop_id", "status", "created_at"],
    ["status", "created_at"],
  ],

  RETURNS: [
    ["user_id", "status", "created_at"],
    ["shop_id", "status", "created_at"],
    ["status", "requires_admin_intervention", "created_at"],
  ],

  AUCTIONS: [
    ["shop_id", "status", "end_time"],
    ["status", "end_time"],
    ["is_featured", "status", "end_time"],
    ["category_id", "status", "end_time"],
  ],

  BIDS: [
    ["auction_id", "created_at"],
    ["user_id", "created_at"],
    ["auction_id", "is_winning"],
  ],

  REVIEWS: [
    ["product_id", "status", "created_at"],
    ["shop_id", "status", "created_at"],
    ["category_id", "status", "created_at"],
    ["auction_id", "status", "created_at"],
    ["product_id", "verified_purchase", "rating"],
  ],

  SUPPORT_TICKETS: [
    ["user_id", "status", "created_at"],
    ["shop_id", "status", "priority"],
    ["status", "priority", "created_at"],
  ],
} as const;

/**
 * Query Limits - Default limits for pagination
 */
export const QUERY_LIMITS = {
  DEFAULT: 20,
  SMALL: 10,
  MEDIUM: 50,
  LARGE: 100,
  MAX: 500,
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
export type SubcollectionName =
  (typeof SUBCOLLECTIONS)[keyof typeof SUBCOLLECTIONS];
export type FieldName = (typeof FIELDS)[keyof typeof FIELDS];
