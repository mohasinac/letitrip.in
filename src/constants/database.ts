/**
 * @fileoverview TypeScript Module
 * @module src/constants/database
 * @description This file contains functionality related to database
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Database Collection Names
 * Centralized constants for all Firestore collection names
 */

/**
 * Collections
 * @constant
 */
export const COLLECTIONS = {
  // Core Business Collections
  /** S H O P S */
  SHOPS: "shops",
  /** P R O D U C T S */
  PRODUCTS: "products",
  /** C A T E G O R I E S */
  CATEGORIES: "categories",

  // User & Auth Collections
  /** U S E R S */
  USERS: "users",
  USER_PROFILES: "user_profiles",

  // Order & Transaction Collections
  /** O R D E R S */
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  /** C A R T S */
  CARTS: "carts",
  CART_ITEMS: "cart_items",

  // Payment & Financial Collections
  /** P A Y M E N T S */
  PAYMENTS: "payments",
  PAYMENT_TRANSACTIONS: "payment_transactions",
  PAYMENT_REFUNDS: "payment_refunds",
  /** R E F U N D S */
  REFUNDS: "refunds",
  /** P A Y O U T S */
  PAYOUTS: "payouts",

  // Returns & Support Collections
  /** R E T U R N S */
  RETURNS: "returns",
  RETURN_ITEMS: "return_items",
  SUPPORT_TICKETS: "support_tickets",
  TICKET_MESSAGES: "ticket_messages",

  // Shipping Collections
  /** S H I P M E N T S */
  SHIPMENTS: "shipments",
  /** A D D R E S S E S */
  ADDRESSES: "addresses",

  // Marketing & Promotions Collections
  /** C O U P O N S */
  COUPONS: "coupons",
  COUPON_USAGE: "coupon_usage",

  // Review & Rating Collections
  /** R E V I E W S */
  REVIEWS: "reviews",
  REVIEW_VOTES: "review_votes", // For helpful/not helpful votes

  // Auction Collections
  /** A U C T I O N S */
  AUCTIONS: "auctions",
  /** B I D S */
  BIDS: "bids",
  AUCTION_WATCHLIST: "auction_watchlist",
  WON_AUCTIONS: "won_auctions",

  // User Activity Collections
  /** F A V O R I T E S */
  FAVORITES: "favorites",
  VIEWING_HISTORY: "viewing_history",
  SEARCH_HISTORY: "search_history",

  // Analytics Collections
  /** A N A L Y T I C S */
  ANALYTICS: "analytics",
  SEARCH_ANALYTICS: "search_analytics",
  PRODUCT_VIEWS: "product_views",

  // Media Collections
  /** M E D I A */
  MEDIA: "media",
  MEDIA_METADATA: "media_metadata",

  // Notification Collections
  /** N O T I F I C A T I O N S */
  NOTIFICATIONS: "notifications",
  EMAIL_QUEUE: "email_queue",
  SMS_QUEUE: "sms_queue",
  WHATSAPP_OPT_INS: "whatsapp_opt_ins",
  WHATSAPP_MESSAGES: "whatsapp_messages",

  // Messaging Collections
  /** M E S S A G E S */
  MESSAGES: "messages",
  /** C O N V E R S A T I O N S */
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
  /** F A Q S */
  FAQS: "faqs",

  // Settings Collections
  /** S E T T I N G S */
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
  /** E V E N T S */
  EVENTS: "events",
  EVENT_REGISTRATIONS: "event_registrations",
  EVENT_VOTES: "event_votes",
  EVENT_OPTIONS: "event_options",
  OTP_VERIFICATIONS: "otp_verifications",
  USER_ACTIVITIES: "user_activities",

  // Session & Auth Collections
  /** S E S S I O N S */
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
  /** I D */
  ID: "id",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
  DELETED_AT: "deleted_at",

  // Ownership fields
  USER_ID: "user_id",
  SHOP_ID: "shop_id",
  OWNER_ID: "owner_id",

  // Status fields
  /** S T A T U S */
  STATUS: "status",
  IS_ACTIVE: "is_active",
  IS_VERIFIED: "is_verified",
  IS_FEATURED: "is_featured",
  IS_BANNED: "is_banned",

  // SEO fields
  /** S L U G */
  SLUG: "slug",
  META_TITLE: "meta_title",
  META_DESCRIPTION: "meta_description",
  META_KEYWORDS: "meta_keywords",

  // Media fields
  IMAGE_URL: "image_url",
  /** I M A G E S */
  IMAGES: "images",
  VIDEO_URL: "video_url",
  THUMBNAIL_URL: "thumbnail_url",
} as const;

/**
 * Database Indexes - Document which fields should be indexed
 * Note: These are documentation only, actual indexes must be created in Firestore
 */
export const INDEXES = {
  /** S H O P S */
  SHOPS: [
    ["status", "is_verified", "created_at"],
    ["user_id", "status"],
    ["is_featured", "is_verified", "created_at"],
  ],

  /** P R O D U C T S */
  PRODUCTS: [
    ["shop_id", "status", "created_at"],
    ["category_id", "status", "price"],
    ["status", "is_featured", "created_at"],
    ["shop_id", "category_id", "status"],
  ],

  /** O R D E R S */
  ORDERS: [
    ["user_id", "status", "created_at"],
    ["shop_id", "status", "created_at"],
    ["status", "created_at"],
  ],

  /** R E T U R N S */
  RETURNS: [
    ["user_id", "status", "created_at"],
    ["shop_id", "status", "created_at"],
    ["status", "requires_admin_intervention", "created_at"],
  ],

  /** A U C T I O N S */
  AUCTIONS: [
    ["shop_id", "status", "end_time"],
    ["status", "end_time"],
    ["is_featured", "status", "end_time"],
    ["category_id", "status", "end_time"],
  ],

  /** B I D S */
  BIDS: [
    ["auction_id", "created_at"],
    ["user_id", "created_at"],
    ["auction_id", "is_winning"],
  ],

  /** R E V I E W S */
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
  /** D E F A U L T */
  DEFAULT: 20,
  /** S M A L L */
  SMALL: 10,
  /** M E D I U M */
  MEDIUM: 50,
  /** L A R G E */
  LARGE: 100,
  /** M A X */
  MAX: 500,
} as const;

/**
 * CollectionName type
 * 
 * @typedef {Object} CollectionName
 * @description Type definition for CollectionName
 */
/**
 * CollectionName type definition
 *
 * @typedef {(typeof COLLECTIONS)[keyof typeof COLLECTIONS]} CollectionName
 * @description Type definition for CollectionName
 */
export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
/**
 * SubcollectionName type
 * 
 * @typedef {Object} SubcollectionName
 * @description Type definition for SubcollectionName
 */
/**
 * SubcollectionName type definition
 *
 * @typedef {(typeof SUBCOLLECTIONS)[keyof typeof SUBCOLLECTIONS]} SubcollectionName
 * @description Type definition for SubcollectionName
 */
export type SubcollectionName =
  (typeof SUBCOLLECTIONS)[keyof typeof SUBCOLLECTIONS];
/**
 * FieldName type
 * 
 * @typedef {Object} FieldName
 * @description Type definition for FieldName
 */
/**
 * FieldName type definition
 *
 * @typedef {(typeof FIELDS)[keyof typeof FIELDS]} FieldName
 * @description Type definition for FieldName
 */
export type FieldName = (typeof FIELDS)[keyof typeof FIELDS];
