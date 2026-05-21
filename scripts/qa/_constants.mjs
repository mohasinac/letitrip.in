/**
 * Shared smoke-test constants. The TS/Firestore source-of-truth lives in:
 *   - appkit/src/features/products/types/index.ts       (ListingType)
 *   - appkit/src/features/products/repository/...        (LISTING_TYPE_VALUES)
 *   - appkit/src/features/categories/schemas/firestore.ts (CategoryDocument)
 *   - CLAUDE.md § "Slug Prefix System"                   (slug prefixes)
 *
 * These mjs-side mirrors exist because the suites run as plain ESM scripts
 * outside the TS build. Keep them in sync — any drift here will cause
 * silent test misses (assertions checking a field that doesn't exist any more).
 *
 * Pattern: add it here once, import it in every suite. Never inline a magic
 * string or hardcoded array in a suite file.
 */

// ── Listing kinds ────────────────────────────────────────────────────────────
// Mirrors the `ListingType` union and the `LISTING_TYPE_VALUES` constants in
// appkit/src/features/products/repository/products.repository.ts.
export const LISTING_TYPES = Object.freeze({
  STANDARD: "standard",
  AUCTION: "auction",
  PRE_ORDER: "pre-order",
  PRIZE_DRAW: "prize-draw",
});

export const LISTING_TYPE_VALUES = Object.freeze(Object.values(LISTING_TYPES));

// Legacy aliases the products sieve still accepts (FILTER_ALIASES.listingType).
// Useful when testing backwards-compat of consumer clients.
export const LEGACY_LISTING_ALIASES = Object.freeze({
  product: LISTING_TYPES.STANDARD,
  preorder: LISTING_TYPES.PRE_ORDER,
  prizedraw: LISTING_TYPES.PRIZE_DRAW,
});

// ── Slug prefixes ────────────────────────────────────────────────────────────
// Mirrors CLAUDE.md § "Slug Prefix System". Used by per-resource id-prefix
// assertions ("every faq has id starting with 'faq-'").
export const SLUG_PREFIXES = Object.freeze({
  PRODUCT: "product-",
  AUCTION: "auction-",
  PRE_ORDER: "preorder-",
  STORE: "store-",
  CATEGORY: "category-",
  BRAND: "brand-",
  EVENT: "event-",
  BLOG: "blog-",
  REVIEW: "review-",
  USER: "user-",
  FAQ: "faq-",
  COUPON: "coupon-",
  SECTION: "section-",
  NAV: "nav-",
  SUBLISTING: "sublisting-",
  CAROUSEL_SLIDE: "slide-",
  ORDER: "order-",
  BID: "bid-",
  PAYOUT: "payout-",
  NOTIFICATION: "notif-",
  GROUP: "group-",
  TICKET: "ticket-",
  SCAMMER: "scammer-",
  WISHLIST: "wishlist-",
  HISTORY: "history-",
  FEATURE: "feature-",
});

// ── Seeded tier-0 categories ────────────────────────────────────────────────
// Mirrors appkit/src/seed/categories-seed-data.ts (root tier). Smoke suites
// use this to verify tier=0 results match the seeded set exactly.
export const SEEDED_TIER0_CATEGORIES = Object.freeze([
  "category-singles",
  "category-sealed-products",
  "category-graded-cards",
  "category-duel-monsters-era",
  "category-gx-era",
]);

// ── Seeded stores with products ──────────────────────────────────────────────
// Mirrors appkit/src/seed/stores-seed-data.ts — 2 YGO stores (admin + Kaiba).
export const SEEDED_STORES_WITH_PRODUCTS = Object.freeze([
  "store-letitrip-official",
  "store-kaiba-corp-cards",
]);

// ── Seeded brands ────────────────────────────────────────────────────────────
// Mirrors categories-seed-data.ts brand rows (categoryType: "brand").
export const SEEDED_BRANDS = Object.freeze([
  "brand-konami",
  "brand-upper-deck",
  "brand-bandai",
  "brand-toei-animation",
  "brand-score-entertainment",
]);

// ── Expected seed counts ─────────────────────────────────────────────────────
// Mirrors actual seed array lengths. Used by seed-health suites to verify
// GET /api/demo/seed returns correct totals.
export const EXPECTED_SEED_COUNTS = Object.freeze({
  products_standard: 59,
  auctions: 20,
  preorders: 5,
  bundles: 8,
  categories: 25,
  brands: 5,
  stores: 2,
  users: 3,
  orders: 50,
});

// ── Currency ────────────────────────────────────────────────────────────────
// All monetary fields are stored in INR paise (1 INR = 100 paise). Used by
// price-range assertions ("every item.price ∈ [100000, 500000]").
export const CURRENCY = Object.freeze({
  ISO: "INR",
  PAISE_PER_RUPEE: 100,
});

// ── HTTP status code groups ─────────────────────────────────────────────────
// Test-side enums so suites can express intent without inlining numbers.
// `DENIED_OR_NOT_EXPOSED` accepts 405 because "method not allowed" is a valid
// form of access denial — the buyer can't actually invoke anything.
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
});

export const STATUS_GROUPS = Object.freeze({
  UNAUTHED: Object.freeze([HTTP_STATUS.UNAUTHORIZED]),
  DENIED: Object.freeze([HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN]),
  DENIED_OR_NOT_EXPOSED: Object.freeze([
    HTTP_STATUS.UNAUTHORIZED,
    HTTP_STATUS.FORBIDDEN,
    HTTP_STATUS.METHOD_NOT_ALLOWED,
  ]),
});

// ── User roles ──────────────────────────────────────────────────────────────
// Mirrors the role tokens accepted by `createRouteHandler({ roles: [...] })`.
// Mirrors appkit/src/security/authorization.ts > `UserRole`. The buyer-tier
// caller has role token `"user"`, not `"buyer"`; suites that fixture a buyer
// session should reference `USER` here for parity with the appkit type.
export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  MODERATOR: "moderator",
  SELLER: "seller",
  USER: "user",
});

// ── Firebase Function names ─────────────────────────────────────────────────
// Mirrors the export names in functions/src/index.ts. Used by the Firebase
// Functions smoke suite to look up env-var URLs and produce readable test
// labels.
export const FIREBASE_FUNCTIONS = Object.freeze({
  LISTING_PROCESSOR: {
    name: "listingProcessor",
    envVar: "FIREBASE_FUNCTION_LISTING_URL",
  },
  ADMIN_ANALYTICS: {
    name: "adminAnalytics",
    envVar: "FIREBASE_FUNCTION_ADMIN_ANALYTICS_URL",
  },
  STORE_ANALYTICS: {
    name: "storeAnalytics",
    envVar: "FIREBASE_FUNCTION_STORE_ANALYTICS_URL",
  },
  PROMOTIONS_API: {
    name: "promotionsApi",
    envVar: "FIREBASE_FUNCTION_PROMOTIONS_URL",
  },
});

// ── listingProcessor request keys ────────────────────────────────────────────
// Mirrors `ListingRequestBody` in
// appkit/src/_internal/server/jobs/handlers/listingProcessor.ts. Suites send
// short-form keys; long-form is what `/api/products` accepts in its URL.
export const LISTING_REQUEST_KEYS = Object.freeze({
  COLLECTION: "collection",
  FILTERS: "f",
  SORTS: "s",
  PAGE: "p",
  PAGE_SIZE: "ps",
  CURSOR: "cursor",
});

// listingProcessor `collection` enum — must match keys of the `LISTERS`
// dictionary in appkit/src/_internal/server/jobs/handlers/listingProcessor.ts.
export const LISTING_COLLECTIONS = Object.freeze({
  PRODUCTS: "products",
  CATEGORIES: "categories",
  BRANDS: "brands",
  ORDERS: "orders",
  REVIEWS: "reviews",
  COUPONS: "coupons",
  BIDS: "bids",
  PAYOUTS: "payouts",
  BLOG_POSTS: "blogPosts",
  EVENTS: "events",
  FAQS: "faqs",
  NOTIFICATIONS: "notifications",
  SCAMMERS: "scammers",
  STORES: "stores",
});

// ── Product status values ──────────────────────────────────────────────────
// Mirrors PRODUCT_FIELDS.STATUS_VALUES in appkit/src/constants/field-names.ts
export const PRODUCT_STATUS = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  IN_REVIEW: "in_review",
  ARCHIVED: "archived",
});

// ── Product condition values ────────────────────────────────────────────────
// Mirrors PRODUCT_FIELDS.CONDITION_VALUES
export const PRODUCT_CONDITION = Object.freeze({
  NEW: "new",
  USED: "used",
  REFURBISHED: "refurbished",
  BROKEN: "broken",
});

// ── Order status values ────────────────────────────────────────────────────
// Mirrors ORDER_FIELDS.STATUS_VALUES
export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  RETURN_REQUESTED: "return_requested",
  REFUNDED: "refunded",
});

// ── Review status values ────────────────────────────────────────────────────
// Mirrors REVIEW_FIELDS.STATUS_VALUES
export const REVIEW_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

// ── Store status values ─────────────────────────────────────────────────────
// Mirrors STORE_FIELDS.STATUS_VALUES (from appkit features/stores)
export const STORE_STATUS = Object.freeze({
  ACTIVE: "active",
  PENDING: "pending",
  SUSPENDED: "suspended",
  REJECTED: "rejected",
});

// ── Sieve operators ─────────────────────────────────────────────────────────
// Mirrors SIEVE_OP in appkit/src/utils/sieve-builder.ts.
// NOTE: Pipe `|` is ONLY valid for CONTAINS/STARTS/ENDS (and CI variants).
// Multi-value equality: use separate clauses (field==v1,field==v2 NOT field==v1|v2).
export const SIEVE_OP = Object.freeze({
  EQ: "==",
  NEQ: "!=",
  GT: ">",
  LT: "<",
  GTE: ">=",
  LTE: "<=",
  CONTAINS: "@=",
  STARTS: "_=",
  ENDS: "_-=",
  CONTAINS_CI: "@=*",
  STARTS_CI: "_=*",
  ENDS_CI: "_-=*",
});

// ── View modes ───────────────────────────────────────────────────────────────
// Mirrors VIEW_MODE in appkit/src/constants/table-keys.ts
export const VIEW_MODE = Object.freeze({ GRID: "grid", LIST: "list", TABLE: "table" });

// ── Sort direction + helper ──────────────────────────────────────────────────
// Mirrors SORT_DIR / sortBy() in appkit/src/constants/sort.ts
export const SORT_DIR = Object.freeze({ ASC: "", DESC: "-" });
export const sortBy = (field, dir = "DESC") => `${SORT_DIR[dir]}${field}`;
