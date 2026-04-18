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
  STORE_ID: "storeId",
  SELLER_NAME: "sellerName",
  SELLER_EMAIL: "sellerEmail",
  FEATURED: "featured",
  TAGS: "tags",
  SPECIFICATIONS: "specifications",
  FEATURES: "features",
  SHIPPING_INFO: "shippingInfo",
  RETURN_POLICY: "returnPolicy",
  CONDITION: "condition",
  INSURANCE: "insurance",
  INSURANCE_COST: "insuranceCost",
  SHIPPING_PAID_BY: "shippingPaidBy",
  IS_AUCTION: "isAuction",
  AUCTION_END_DATE: "auctionEndDate",
  STARTING_BID: "startingBid",
  CURRENT_BID: "currentBid",
  BID_COUNT: "bidCount",
  RESERVE_PRICE: "reservePrice",
  BUY_NOW_PRICE: "buyNowPrice",
  MIN_BID_INCREMENT: "minBidIncrement",
  AUTO_EXTENDABLE: "autoExtendable",
  AUCTION_EXTENSION_MINUTES: "auctionExtensionMinutes",
  AUCTION_ORIGINAL_END_DATE: "auctionOriginalEndDate",
  AUCTION_SHIPPING_PAID_BY: "auctionShippingPaidBy",
  IS_PRE_ORDER: "isPreOrder",
  PRE_ORDER_DELIVERY_DATE: "preOrderDeliveryDate",
  PRE_ORDER_DEPOSIT_PERCENT: "preOrderDepositPercent",
  PRE_ORDER_DEPOSIT_AMOUNT: "preOrderDepositAmount",
  PRE_ORDER_MAX_QUANTITY: "preOrderMaxQuantity",
  PRE_ORDER_CURRENT_COUNT: "preOrderCurrentCount",
  PRE_ORDER_PRODUCTION_STATUS: "preOrderProductionStatus",
  PRE_ORDER_CANCELLABLE: "preOrderCancellable",
  IS_PROMOTED: "isPromoted",
  PROMOTION_END_DATE: "promotionEndDate",
  PICKUP_ADDRESS_ID: "pickupAddressId",
  SEO_TITLE: "seoTitle",
  SEO_DESCRIPTION: "seoDescription",
  SEO_KEYWORDS: "seoKeywords",
  VIEW_COUNT: "viewCount",
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

  // Condition values
  CONDITION_VALUES: {
    NEW: "new",
    USED: "used",
    REFURBISHED: "refurbished",
    BROKEN: "broken",
  },

  // Shipping paid by values
  SHIPPING_PAID_BY_VALUES: {
    SELLER: "seller",
    BUYER: "buyer",
  },

  // Auction shipping paid by values
  AUCTION_SHIPPING_PAID_BY_VALUES: {
    SELLER: "seller",
    WINNER: "winner",
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
  PLATFORM_FEE: "platformFee",
  DEPOSIT_AMOUNT: "depositAmount",
  COD_REMAINING_AMOUNT: "codRemainingAmount",
  SHIPPING_FEE: "shippingFee",
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

  // Seller / shipping / payout fields (added for shipping feature)
  SELLER_ID: "sellerId",
  PAYOUT_STATUS: "payoutStatus",
  PAYOUT_ID: "payoutId",
  SHIPPING_METHOD: "shippingMethod",
  SHIPPING_CARRIER: "shippingCarrier",
  TRACKING_URL: "trackingUrl",
  SHIPROCKET_ORDER_ID: "shiprocketOrderId",
  SHIPROCKET_SHIPMENT_ID: "shiprocketShipmentId",
  SHIPROCKET_AWB: "shiprocketAWB",
  SHIPROCKET_STATUS: "shiprocketStatus",
  SHIPROCKET_UPDATED_AT: "shiprocketUpdatedAt",
  PAYOUT_STATUS_VALUES: {
    ELIGIBLE: "eligible",
    REQUESTED: "requested",
    PAID: "paid",
  },
  SHIPPING_METHOD_VALUES: {
    CUSTOM: "custom",
    SHIPROCKET: "shiprocket",
  },
} as const;

// ============================================================================
// REVIEW FIELDS
// ============================================================================

export const REVIEW_FIELDS = {
  ID: "id",
  PRODUCT_ID: "productId",
  PRODUCT_TITLE: "productTitle",
  SELLER_ID: "sellerId",
  USER_ID: "userId",
  USER_NAME: "userName",
  USER_NAME_INDEX: "userNameIndex",
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
  STATS: "stats",
  STAT: {
    VIEWS: "stats.views",
    LAST_VIEWED: "stats.lastViewed",
  },
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CREATED_BY: "createdBy",
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
  SCOPE: "scope",
  SELLER_ID: "sellerId",
  STORE_SLUG: "storeSlug",
  APPLICABLE_TO_AUCTIONS: "applicableToAuctions",
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
  SEARCH_TOKENS: "searchTokens",
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
    UPI_VPA: "contact.upiVpa",
    WHATSAPP: "contact.whatsappNumber",
  },
  PAYMENT: "payment",
  PAYMENT_FIELDS: {
    RAZORPAY_ENABLED: "payment.razorpayEnabled",
    UPI_MANUAL_ENABLED: "payment.upiManualEnabled",
    COD_ENABLED: "payment.codEnabled",
  },
  COMMISSIONS: "commissions",
  COMMISSION_FIELDS: {
    RAZORPAY_FEE_PERCENT: "commissions.razorpayFeePercent",
    COD_DEPOSIT_PERCENT: "commissions.codDepositPercent",
    SELLER_SHIPPING_FIXED: "commissions.sellerShippingFixed",
    PLATFORM_SHIPPING_PERCENT: "commissions.platformShippingPercent",
    PLATFORM_SHIPPING_FIXED_MIN: "commissions.platformShippingFixedMin",
  },
  SOCIAL_LINKS: "socialLinks",
  EMAIL_SETTINGS: "emailSettings",
  SEO: "seo",
  FEATURES: "features",
  FEATURE_FLAGS: "featureFlags",
  FEATURE_FLAGS_FIELDS: {
    CHATS: "featureFlags.chats",
    SMS_VERIFICATION: "featureFlags.smsVerification",
    TRANSLATIONS: "featureFlags.translations",
    WISHLISTS: "featureFlags.wishlists",
    AUCTIONS: "featureFlags.auctions",
    REVIEWS: "featureFlags.reviews",
    EVENTS: "featureFlags.events",
    BLOG: "featureFlags.blog",
    COUPONS: "featureFlags.coupons",
    NOTIFICATIONS: "featureFlags.notifications",
    SELLER_REGISTRATION: "featureFlags.sellerRegistration",
    PRE_ORDERS: "featureFlags.preOrders",
  },
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

