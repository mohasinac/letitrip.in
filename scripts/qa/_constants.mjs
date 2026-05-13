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
  "category-action-figures",
  "category-trading-cards",
  "category-diecast-vehicles",
  "category-spinning-tops",
  "category-model-kits",
  "category-vintage-rare",
]);

// ── Seeded stores with products ──────────────────────────────────────────────
// Mirrors appkit/src/seed/stores-seed-data.ts (subset that has products).
export const SEEDED_STORES_WITH_PRODUCTS = Object.freeze([
  "store-pokemon-palace",
  "store-diecast-depot",
  "store-cardgame-hub",
  "store-beyblade-arena",
  "store-tokyo-toys-india",
  "store-gundam-galaxy",
]);

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
