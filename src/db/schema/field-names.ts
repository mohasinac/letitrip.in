/**
 * Schema Field Name Constants
 *
 * Centralized string constants for ALL Firestore document field names.
 * Use these instead of hardcoded strings to ensure consistency
 * between frontend types, backend APIs, and Firestore queries.
 *
 * Benefits:
 * - Type-safe field references across the entire codebase
 * - Single source of truth for field naming
 * - Refactoring-safe: rename in one place, update everywhere
 * - Prevents typos in query builders and serializers
 */

// ============================================================================
// USER FIELDS
// ============================================================================

export const USER_FIELDS = {
  // Core identity
  ID: "id",
  UID: "uid",
  EMAIL: "email",
  PHONE_NUMBER: "phoneNumber",
  PHONE_VERIFIED: "phoneVerified",
  DISPLAY_NAME: "displayName",
  PHOTO_URL: "photoURL",
  AVATAR_METADATA: "avatarMetadata",
  ROLE: "role",
  PASSWORD_HASH: "passwordHash",
  EMAIL_VERIFIED: "emailVerified",
  DISABLED: "disabled",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  // Avatar metadata sub-fields
  AVATAR: {
    URL: "avatarMetadata.url",
    POSITION: "avatarMetadata.position",
    POSITION_X: "avatarMetadata.position.x",
    POSITION_Y: "avatarMetadata.position.y",
    ZOOM: "avatarMetadata.zoom",
  },

  // Public profile
  PUBLIC_PROFILE: "publicProfile",
  PROFILE: {
    IS_PUBLIC: "publicProfile.isPublic",
    SHOW_EMAIL: "publicProfile.showEmail",
    SHOW_PHONE: "publicProfile.showPhone",
    SHOW_ORDERS: "publicProfile.showOrders",
    SHOW_WISHLIST: "publicProfile.showWishlist",
    BIO: "publicProfile.bio",
    LOCATION: "publicProfile.location",
    WEBSITE: "publicProfile.website",
    SOCIAL_LINKS: "publicProfile.socialLinks",
    SOCIAL: {
      TWITTER: "publicProfile.socialLinks.twitter",
      INSTAGRAM: "publicProfile.socialLinks.instagram",
      FACEBOOK: "publicProfile.socialLinks.facebook",
      LINKEDIN: "publicProfile.socialLinks.linkedin",
    },
  },

  // User statistics
  STATS: "stats",
  STAT: {
    TOTAL_ORDERS: "stats.totalOrders",
    AUCTIONS_WON: "stats.auctionsWon",
    ITEMS_SOLD: "stats.itemsSold",
    REVIEWS_COUNT: "stats.reviewsCount",
    RATING: "stats.rating",
  },

  // Metadata (login tracking)
  METADATA: "metadata",
  META: {
    LAST_SIGN_IN_TIME: "metadata.lastSignInTime",
    CREATION_TIME: "metadata.creationTime",
    LOGIN_COUNT: "metadata.loginCount",
  },
} as const;

// ============================================================================
// TOKEN FIELDS
// ============================================================================

export const TOKEN_FIELDS = {
  ID: "id",
  USER_ID: "userId",
  EMAIL: "email",
  TOKEN: "token",
  EXPIRES_AT: "expiresAt",
  CREATED_AT: "createdAt",
  USED: "used",
  USED_AT: "usedAt",
} as const;

// ============================================================================
// PRODUCT FIELDS
// ============================================================================

export const PRODUCT_FIELDS = {
  ID: "id",
  TITLE: "title",
  DESCRIPTION: "description",
  SLUG: "slug",
  CATEGORY: "category",
  SUBCATEGORY: "subcategory",
  BRAND: "brand",
  PRICE: "price",
  CURRENCY: "currency",
  STOCK_QUANTITY: "stockQuantity",
  AVAILABLE_QUANTITY: "availableQuantity",
  MAIN_IMAGE: "mainImage",
  IMAGES: "images",
  VIDEO: "video",
  STATUS: "status",
  SELLER_ID: "sellerId",
  SELLER_NAME: "sellerName",
  SELLER_EMAIL: "sellerEmail",
  FEATURED: "featured",
  TAGS: "tags",
  SPECIFICATIONS: "specifications",
  FEATURES: "features",
  SHIPPING_INFO: "shippingInfo",
  RETURN_POLICY: "returnPolicy",
  IS_AUCTION: "isAuction",
  AUCTION_END_DATE: "auctionEndDate",
  STARTING_BID: "startingBid",
  CURRENT_BID: "currentBid",
  BID_COUNT: "bidCount",
  IS_PROMOTED: "isPromoted",
  PROMOTION_END_DATE: "promotionEndDate",
  PICKUP_ADDRESS_ID: "pickupAddressId",
  SEO_TITLE: "seoTitle",
  SEO_DESCRIPTION: "seoDescription",
  SEO_KEYWORDS: "seoKeywords",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  // Product statuses
  STATUS_VALUES: {
    DRAFT: "draft",
    PUBLISHED: "published",
    OUT_OF_STOCK: "out_of_stock",
    DISCONTINUED: "discontinued",
    SOLD: "sold",
  },
} as const;

/**
 * Valid product status transitions.
 *
 * Map of currentStatus → set of allowed next statuses.
 * Admins and moderators bypass this map (policy override).
 *
 * Rules:
 * - draft        → published | discontinued
 * - published    → draft | out_of_stock | discontinued
 * - out_of_stock → published | draft | discontinued
 * - sold         → discontinued  (only archival allowed)
 * - discontinued → draft         (reactivate as draft only)
 */
export const PRODUCT_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  draft: ["published", "discontinued"],
  published: ["draft", "out_of_stock", "discontinued"],
  out_of_stock: ["published", "draft", "discontinued"],
  sold: ["discontinued"],
  discontinued: ["draft"],
} as const;

// ============================================================================
// ORDER FIELDS
// ============================================================================

export const ORDER_FIELDS = {
  ID: "id",
  PRODUCT_ID: "productId",
  PRODUCT_TITLE: "productTitle",
  USER_ID: "userId",
  USER_NAME: "userName",
  USER_EMAIL: "userEmail",
  QUANTITY: "quantity",
  UNIT_PRICE: "unitPrice",
  TOTAL_PRICE: "totalPrice",
  CURRENCY: "currency",
  STATUS: "status",
  PAYMENT_STATUS: "paymentStatus",
  PAYMENT_ID: "paymentId",
  PAYMENT_METHOD: "paymentMethod",
  SHIPPING_ADDRESS: "shippingAddress",
  TRACKING_NUMBER: "trackingNumber",
  NOTES: "notes",
  ORDER_DATE: "orderDate",
  SHIPPING_DATE: "shippingDate",
  DELIVERY_DATE: "deliveryDate",
  CANCELLATION_DATE: "cancellationDate",
  CANCELLATION_REASON: "cancellationReason",
  REFUND_AMOUNT: "refundAmount",
  REFUND_STATUS: "refundStatus",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  // Order statuses
  STATUS_VALUES: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    RETURNED: "returned",
  },

  // Payment statuses
  PAYMENT_STATUS_VALUES: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
  },
} as const;

// ============================================================================
// REVIEW FIELDS
// ============================================================================

export const REVIEW_FIELDS = {
  ID: "id",
  PRODUCT_ID: "productId",
  PRODUCT_TITLE: "productTitle",
  USER_ID: "userId",
  USER_NAME: "userName",
  USER_AVATAR: "userAvatar",
  RATING: "rating",
  TITLE: "title",
  COMMENT: "comment",
  IMAGES: "images",
  VIDEO: "video",
  STATUS: "status",
  MODERATOR_ID: "moderatorId",
  MODERATOR_NOTE: "moderatorNote",
  REJECTION_REASON: "rejectionReason",
  HELPFUL_COUNT: "helpfulCount",
  REPORT_COUNT: "reportCount",
  VERIFIED: "verified",
  FEATURED: "featured",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  APPROVED_AT: "approvedAt",
  REJECTED_AT: "rejectedAt",

  // Review statuses
  STATUS_VALUES: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  },
} as const;

// ============================================================================
// BID FIELDS
// ============================================================================

export const BID_FIELDS = {
  ID: "id",
  PRODUCT_ID: "productId",
  PRODUCT_TITLE: "productTitle",
  USER_ID: "userId",
  USER_NAME: "userName",
  USER_EMAIL: "userEmail",
  BID_AMOUNT: "bidAmount",
  CURRENCY: "currency",
  STATUS: "status",
  IS_WINNING: "isWinning",
  PREVIOUS_BID_AMOUNT: "previousBidAmount",
  BID_DATE: "bidDate",
  AUTO_MAX_BID: "autoMaxBid",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  // Bid statuses
  STATUS_VALUES: {
    ACTIVE: "active",
    OUTBID: "outbid",
    WON: "won",
    LOST: "lost",
    CANCELLED: "cancelled",
  },
} as const;

// ============================================================================
// SESSION FIELDS
// ============================================================================

export const SESSION_FIELDS = {
  ID: "id",
  USER_ID: "userId",
  DEVICE_INFO: "deviceInfo",
  DEVICE: {
    USER_AGENT: "deviceInfo.userAgent",
    BROWSER: "deviceInfo.browser",
    OS: "deviceInfo.os",
    DEVICE: "deviceInfo.device",
    IP: "deviceInfo.ip",
  },
  LOCATION: "location",
  LOC: {
    COUNTRY: "location.country",
    CITY: "location.city",
  },
  CREATED_AT: "createdAt",
  LAST_ACTIVITY: "lastActivity",
  EXPIRES_AT: "expiresAt",
  IS_ACTIVE: "isActive",
  REVOKED_AT: "revokedAt",
  REVOKED_BY: "revokedBy",
} as const;

// ============================================================================
// CAROUSEL SLIDE FIELDS
// ============================================================================

export const CAROUSEL_FIELDS = {
  ID: "id",
  TITLE: "title",
  ORDER: "order",
  ACTIVE: "active",
  MEDIA: "media",
  LINK: "link",
  MOBILE_MEDIA: "mobileMedia",
  CARDS: "cards",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CREATED_BY: "createdBy",
} as const;

// ============================================================================
// CATEGORY FIELDS
// ============================================================================

export const CATEGORY_FIELDS = {
  ID: "id",
  NAME: "name",
  SLUG: "slug",
  DESCRIPTION: "description",
  ROOT_ID: "rootId",
  PARENT_IDS: "parentIds",
  CHILDREN_IDS: "childrenIds",
  TIER: "tier",
  PATH: "path",
  ORDER: "order",
  IS_LEAF: "isLeaf",
  METRICS: "metrics",
  METRIC: {
    PRODUCT_COUNT: "metrics.productCount",
    PRODUCT_IDS: "metrics.productIds",
    AUCTION_COUNT: "metrics.auctionCount",
    AUCTION_IDS: "metrics.auctionIds",
    TOTAL_PRODUCT_COUNT: "metrics.totalProductCount",
    TOTAL_AUCTION_COUNT: "metrics.totalAuctionCount",
    TOTAL_ITEM_COUNT: "metrics.totalItemCount",
    LAST_UPDATED: "metrics.lastUpdated",
  },
  IS_FEATURED: "isFeatured",
  FEATURED_PRIORITY: "featuredPriority",
  SEO: "seo",
  DISPLAY: "display",
  IS_ACTIVE: "isActive",
  IS_SEARCHABLE: "isSearchable",
  CREATED_BY: "createdBy",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  ANCESTORS: "ancestors",
} as const;

// ============================================================================
// COUPON FIELDS
// ============================================================================

export const COUPON_FIELDS = {
  ID: "id",
  CODE: "code",
  NAME: "name",
  DESCRIPTION: "description",
  TYPE: "type",
  DISCOUNT: "discount",
  BXGY: "bxgy",
  TIERS: "tiers",
  USAGE: "usage",
  VALIDITY: "validity",
  RESTRICTIONS: "restrictions",
  CREATED_BY: "createdBy",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  STATS: "stats",

  // Type values
  TYPE_VALUES: {
    PERCENTAGE: "percentage",
    FIXED: "fixed",
    FREE_SHIPPING: "free_shipping",
    BUY_X_GET_Y: "buy_x_get_y",
  },

  // Nested usage fields
  USAGE_FIELDS: {
    TOTAL_LIMIT: "usage.totalLimit",
    PER_USER_LIMIT: "usage.perUserLimit",
    CURRENT_USAGE: "usage.currentUsage",
  },

  // Nested validity fields
  VALIDITY_FIELDS: {
    START_DATE: "validity.startDate",
    END_DATE: "validity.endDate",
    IS_ACTIVE: "validity.isActive",
  },
} as const;

// ============================================================================
// FAQ FIELDS
// ============================================================================

export const FAQ_FIELDS = {
  ID: "id",
  QUESTION: "question",
  ANSWER: "answer",
  ANSWER_TEXT: "answer.text",
  ANSWER_FORMAT: "answer.format",
  CATEGORY: "category",
  SHOW_ON_HOMEPAGE: "showOnHomepage",
  SHOW_IN_FOOTER: "showInFooter",
  IS_PINNED: "isPinned",
  ORDER: "order",
  PRIORITY: "priority",
  TAGS: "tags",
  RELATED_FAQS: "relatedFAQs",
  USE_SITE_SETTINGS: "useSiteSettings",
  VARIABLES: "variables",
  STATS: "stats",
  STAT: {
    VIEWS: "stats.views",
    HELPFUL: "stats.helpful",
    NOT_HELPFUL: "stats.notHelpful",
    LAST_VIEWED: "stats.lastViewed",
  },
  SEO: "seo",
  SEO_FIELDS: {
    SLUG: "seo.slug",
    META_TITLE: "seo.metaTitle",
    META_DESCRIPTION: "seo.metaDescription",
  },
  IS_ACTIVE: "isActive",
  CREATED_BY: "createdBy",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  // Category values
  CATEGORY_VALUES: {
    ORDERS_PAYMENT: "orders_payment",
    SHIPPING_DELIVERY: "shipping_delivery",
    RETURNS_REFUNDS: "returns_refunds",
    PRODUCT_INFORMATION: "product_information",
    ACCOUNT_SECURITY: "account_security",
    TECHNICAL_SUPPORT: "technical_support",
    GENERAL: "general",
  },
} as const;

// ============================================================================
// HOMEPAGE SECTION FIELDS
// ============================================================================

export const HOMEPAGE_SECTION_FIELDS = {
  ID: "id",
  TYPE: "type",
  ORDER: "order",
  ENABLED: "enabled",
  CONFIG: "config",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  // Section type values
  TYPE_VALUES: {
    WELCOME: "welcome",
    TRUST_INDICATORS: "trust-indicators",
    CATEGORIES: "categories",
    PRODUCTS: "products",
    AUCTIONS: "auctions",
    BANNER: "banner",
    FEATURES: "features",
    REVIEWS: "reviews",
    WHATSAPP_COMMUNITY: "whatsapp-community",
    FAQ: "faq",
    BLOG_ARTICLES: "blog-articles",
    NEWSLETTER: "newsletter",
  },
} as const;

// ============================================================================
// SITE SETTINGS FIELDS
// ============================================================================

export const SITE_SETTINGS_FIELDS = {
  ID: "id",
  SITE_NAME: "siteName",
  MOTTO: "motto",
  LOGO: "logo",
  BACKGROUND: "background",
  CONTACT: "contact",
  CONTACT_FIELDS: {
    EMAIL: "contact.email",
    PHONE: "contact.phone",
    ADDRESS: "contact.address",
  },
  SOCIAL_LINKS: "socialLinks",
  EMAIL_SETTINGS: "emailSettings",
  SEO: "seo",
  FEATURES: "features",
  LEGAL_PAGES: "legalPages",
  SHIPPING: "shipping",
  RETURNS: "returns",
  FAQ: "faq",
  FAQ_VARIABLES: "faq.variables",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
} as const;

// ============================================================================
// COMMON / SHARED FIELD NAMES
// ============================================================================

/** Common field names used across multiple collections */
export const COMMON_FIELDS = {
  ID: "id",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CREATED_BY: "createdBy",
  STATUS: "status",
  IS_ACTIVE: "isActive",
  ORDER: "order",
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default values used in user creation / fallback scenarios */
export const SCHEMA_DEFAULTS = {
  USER_ROLE: "user",
  CURRENCY: "INR",
  UNKNOWN_USER_AGENT: "Unknown",
  UNKNOWN_USER: "Unknown User",
  ANONYMOUS_USER: "Anonymous",
  DEFAULT_DISPLAY_NAME: "User",
  ADMIN_EMAIL: "admin@letitrip.in",
} as const;
