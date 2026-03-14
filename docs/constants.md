# Constants Reference

All constants live in `src/constants/`. Import them via their named exports — never duplicate magic strings.

---

## `address.ts`

Delivery address metadata.

| Export          | Type                 | Description       |
| --------------- | -------------------- | ----------------- | ------ | -------- |
| `ADDRESS_TYPES` | `AddressType[]`      | `"home"           | "work" | "other"` |
| `INDIAN_STATES` | `{ value, label }[]` | 28 states + 8 UTs |

---

## `api-endpoints.ts`

All external API paths. Never hardcode API paths in services, hooks, or components.

```ts
API_ENDPOINTS = {
  AUTH: {
    REGISTER, LOGIN, LOGOUT, VERIFY_EMAIL, FORGOT_PASSWORD,
    RESET_PASSWORD, RESEND_VERIFICATION, SESSION, SESSION_ACTIVITY,
    SESSION_VALIDATE, EVENT_INIT, GOOGLE_START, GOOGLE_CALLBACK,
  },
  USER: { PROFILE, CHANGE_PASSWORD, SESSIONS, BECOME_SELLER, WISHLIST: { LIST, ADD, REMOVE, CHECK } },
  PROFILE: { GET_BY_ID, GET_SELLER_REVIEWS, GET_SELLER_PRODUCTS, ADD_PHONE, VERIFY_PHONE, DELETE_ACCOUNT },
  ADDRESSES: { LIST, CREATE, GET_BY_ID, UPDATE, DELETE, SET_DEFAULT },
  ORDERS: { LIST, GET_BY_ID, TRACK, CANCEL, INVOICE },
  ADMIN: {
    DASHBOARD, USERS, USER_BY_ID, SESSIONS, REVOKE_SESSION, REVOKE_USER_SESSIONS,
    PRODUCTS, PRODUCT_BY_ID, ORDERS, ORDER_BY_ID, ORDER_REFUND,
    COUPONS, COUPON_BY_ID, BIDS, BID_BY_ID, BLOG, BLOG_BY_ID,
    ALGOLIA_SYNC(_PAGES/_CATEGORIES/_STORES), ALGOLIA_CLEAR(_PRODUCTS/_PAGES/_CATEGORIES/_STORES),
    ANALYTICS, PAYOUTS, PAYOUT_BY_ID, PAYOUTS_WEEKLY,
    REVIEWS, REVIEW_BY_ID, NEWSLETTER, NEWSLETTER_BY_ID,
    EVENTS: { LIST, DETAIL, STATUS, ENTRIES, ENTRY, STATS },
    STORES, STORE_BY_UID,
  },
  PRODUCTS: { LIST, CREATE, GET_BY_ID, UPDATE, DELETE },
  CATEGORIES: { LIST, CREATE, GET_BY_ID, UPDATE, DELETE },
  REVIEWS: { LIST, CREATE, GET_BY_ID, UPDATE, DELETE, VOTE },
  SITE_SETTINGS: { GET, UPDATE },
  CAROUSEL: { LIST, CREATE, GET_BY_ID, UPDATE, DELETE },
  HOMEPAGE_SECTIONS: { LIST, CREATE, GET_BY_ID, UPDATE, DELETE },
  FAQS: { LIST, CREATE, GET_BY_ID, UPDATE, DELETE, VOTE },
  MEDIA: { UPLOAD, CROP, TRIM },
  LOGS: { WRITE },
  NEWSLETTER: { SUBSCRIBE },
  DEMO: { SEED, SEED_STATUS, ALGOLIA },
  CART: { GET, ADD_ITEM, UPDATE_ITEM, REMOVE_ITEM, CLEAR, MERGE },
  CHECKOUT: { PLACE_ORDER, PREFLIGHT },
  PAYMENT: { CREATE_ORDER, VERIFY, PREORDER, WEBHOOK, EVENT_INIT, OTP_REQUEST },
  COUPONS: { VALIDATE },
  SEARCH: { QUERY },
  BIDS: { LIST, CREATE, GET_BY_ID },
  SELLER: {
    ORDERS, ORDER_SHIP, ANALYTICS, PAYOUTS, PRODUCTS, STORE,
    SHIPPING, SHIPPING_VERIFY_PICKUP, PAYOUT_SETTINGS,
    COUPONS, COUPON_BY_ID, OFFERS,
  },
  BLOG: { LIST, GET_BY_SLUG },
  PROMOTIONS: { LIST },
  CONTACT: { SEND },
  STORES: { LIST, GET_BY_SLUG, PRODUCTS, AUCTIONS, REVIEWS },
  EVENTS: { LIST, DETAIL, ENTER, LEADERBOARD },
  REALTIME: { TOKEN, BIDS_SSE },
  WEBHOOKS: { SHIPROCKET },
  CHAT: { ROOMS, ROOM, MESSAGES },
  NOTIFICATIONS: { LIST, CREATE, MARK_READ, DELETE, READ_ALL, UNREAD_COUNT },
  OFFERS: { BUYER_LIST, SELLER_LIST },
  CACHE: { REVALIDATE },
};
```

---

## `config.ts`

Runtime configuration constants.

| Export                | Description                                                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TOKEN_CONFIG`        | JWT expiry, refresh threshold, cookie name                                                                                                                                                                                                                                       |
| `PASSWORD_CONFIG`     | Min length, complexity rules                                                                                                                                                                                                                                                     |
| `PAGINATION_CONFIG`   | Default page size, max page size                                                                                                                                                                                                                                                 |
| `UPLOAD_CONFIG`       | File size limits, allowed MIME types                                                                                                                                                                                                                                             |
| `SEARCH_CONFIG`       | Algolia index name, hits per page, default facets                                                                                                                                                                                                                                |
| `CACHE_CONFIG`        | TanStack Query `staleTime` / `gcTime` defaults                                                                                                                                                                                                                                   |
| `RATE_LIMIT_CONFIG`   | Window + max requests for each API route group                                                                                                                                                                                                                                   |
| `BUSINESS_DAY_CONFIG` | Platform day boundary: `START_HOUR_IST = 10`, `TIMEZONE = "Asia/Kolkata"`, `START_HOUR_UTC = 4`, `START_MINUTE_UTC = 30`. A new platform day starts at **10:00 AM IST**. Use `getBusinessDaysRemaining` / `getBusinessDayEligibilityDate` from `@/utils` for UI countdown logic. |

---

## `error-messages.ts`

Structured error messages keyed by error code. Used in API routes and Server Actions when returning user-facing errors.

```ts
ERROR_MESSAGES = {
  auth: {
    UNAUTHORIZED: "You are not signed in.",
    FORBIDDEN: "You don't have permission to do this.",
    INVALID_TOKEN: "Your session has expired.",
  },
  validation: {
    REQUIRED: "This field is required.",
    TOO_LONG: "Value exceeds maximum length.",
    INVALID_EMAIL: "Enter a valid email address.",
  },
  // … product, order, payment, upload, etc.
};
```

---

## `faq-data.ts`

Static FAQ content, pre-loaded to avoid Firestore reads on public FAQ page.

| Export                        | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| `STATIC_FAQS`                 | Array of `{id, question, answer, category}` objects |
| `getFaqsByCategory(category)` | Filter helper                                       |
| `searchFaqs(query)`           | Client-side FAQ search helper                       |

---

## `faq.ts`

```ts
FAQ_CATEGORIES = [
  "general",
  "orders",
  "payments",
  "shipping",
  "returns",
  "seller",
  "account",
];
```

---

## `homepage-data.ts`

Static promotional data rendered server-side.

| Export           | Description                         |
| ---------------- | ----------------------------------- |
| `HERO_SLIDES`    | Static hero slider fallback content |
| `PROMO_SECTIONS` | Static promotional section layouts  |
| `TRUST_BADGES`   | Trust indicator icons + copy        |

---

## `navigation.tsx`

| Export             | Description                           |
| ------------------ | ------------------------------------- |
| `MAIN_NAV_ITEMS`   | Desktop navbar links (with icons)     |
| `FOOTER_LINKS`     | Footer column link groups             |
| `USER_MENU_ITEMS`  | Dropdown links for authenticated user |
| `SELLER_NAV_ITEMS` | Seller portal sidebar links           |
| `ADMIN_NAV_ITEMS`  | Admin portal sidebar links            |
| `BOTTOM_NAV_ITEMS` | Mobile bottom nav items               |

---

## `rbac.ts`

Role-Based Access Control.

| Export                           | Description                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ROLE_HIERARCHY`                 | `{ user: 0, seller: 1, moderator: 2, admin: 3 }`                                                             |
| `RBAC_CONFIG`                    | Route → `{ allowedRoles, requireEmailVerified, redirectTo }` map covering all admin, seller, and user routes |
| `getRouteAccessConfig(pathname)` | Returns `RouteAccessConfig` for a route (exact + prefix)                                                     |
| `hasRouteAccess(user, pathname)` | `{ allowed, reason?, redirectTo? }` access check                                                             |
| `isAdmin(user)`                  | `role === "admin"`                                                                                           |
| `isModerator(user)`              | `role >= "moderator"` (hierarchy-based)                                                                      |
| `isSeller(user)`                 | `role >= "seller"` (hierarchy-based)                                                                         |
| `getProtectedRoutes()`           | Returns all paths registered in RBAC_CONFIG                                                                  |

Middleware calls `hasRouteAccess` via `ProtectedRoute` components; all route → role mappings live in `RBAC_CONFIG` — never hardcode role checks in components.

---

## `routes.ts`

All application routes as typed constants. Never hardcode paths in `<Link>` or `router.push()`.

```ts
ROUTES = {
  HOME: "/",
  PUBLIC: {
    FAQS,
    FAQ_CATEGORY,
    PROFILE,
    PRODUCTS,
    PRODUCT_DETAIL,
    AUCTIONS,
    AUCTION_DETAIL,
    PRE_ORDERS,
    PRE_ORDER_DETAIL,
    SELLERS,
    SELLER_DETAIL,
    STORES,
    STORE_DETAIL,
    STORE_PRODUCTS,
    STORE_AUCTIONS,
    STORE_REVIEWS,
    STORE_ABOUT,
    CATEGORIES,
    SEARCH,
    PROMOTIONS,
    ABOUT,
    CONTACT,
    BLOG,
    HELP,
    TERMS,
    PRIVACY,
    SECURITY,
    TRACK_ORDER,
    SELLER_GUIDE,
    COOKIE_POLICY,
    REFUND_POLICY,
    SHIPPING_POLICY,
    HOW_AUCTIONS_WORK,
    HOW_PRE_ORDERS_WORK,
    HOW_OFFERS_WORK,
    HOW_CHECKOUT_WORKS,
    HOW_ORDERS_WORK,
    HOW_REVIEWS_WORK,
    HOW_PAYOUTS_WORK,
    FEES,
    RC_INFO,
    EVENTS,
    EVENT_DETAIL,
    EVENT_PARTICIPATE,
    REVIEWS,
  },
  ERRORS: { UNAUTHORIZED },
  AUTH: {
    LOGIN,
    REGISTER,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    VERIFY_EMAIL,
    OAUTH_LOADING,
    CLOSE,
  },
  USER: {
    PROFILE,
    SETTINGS,
    ORDERS,
    WISHLIST,
    ADDRESSES,
    ADDRESSES_ADD,
    ADDRESSES_EDIT,
    ORDER_DETAIL,
    ORDER_TRACK,
    NOTIFICATIONS,
    MESSAGES,
    BECOME_SELLER,
    CART,
    CHECKOUT,
    CHECKOUT_SUCCESS,
    OFFERS,
  },
  SELLER: {
    DASHBOARD,
    PRODUCTS,
    PRODUCTS_NEW,
    PRODUCTS_EDIT,
    ORDERS,
    AUCTIONS,
    PRE_ORDERS,
    ANALYTICS,
    PAYOUTS,
    STORE,
    SHIPPING,
    PAYOUT_SETTINGS,
    ADDRESSES,
    ADDRESSES_ADD,
    ADDRESSES_EDIT,
    COUPONS,
    COUPONS_NEW,
    OFFERS,
  },
  ADMIN: {
    DASHBOARD,
    USERS,
    SITE,
    CAROUSEL,
    SECTIONS,
    NAVIGATION,
    CATEGORIES,
    FAQS,
    REVIEWS,
    COUPONS,
    MEDIA,
    PRODUCTS,
    ORDERS,
    BIDS,
    BLOG,
    ANALYTICS,
    PAYOUTS,
    EVENTS,
    EVENT_ENTRIES,
    STORES,
    FEATURE_FLAGS,
  },
  DEMO: { SEED, ALGOLIA },
  BLOG: { LIST, ARTICLE },
};
```

| Export             | Description                                   |
| ------------------ | --------------------------------------------- |
| `PUBLIC_ROUTES`    | Routes accessible with no auth `string[]`     |
| `PROTECTED_ROUTES` | Routes requiring at least `user` role         |
| `AUTH_ROUTES`      | Auth pages that redirect signed-in users away |
| `SELLER_ROUTES`    | Routes requiring `seller` role                |
| `ADMIN_ROUTES`     | Routes requiring `admin` role                 |

---

## `seo.ts`

Metadata generation utilities.

| Export                               | Description                          |
| ------------------------------------ | ------------------------------------ |
| `DEFAULT_METADATA`                   | Site-wide `<head>` defaults          |
| `generateMetadata(opts)`             | Generic title/description/OG builder |
| `generateProductMetadata(product)`   | Product page metadata                |
| `generateCategoryMetadata(category)` | Category page metadata               |
| `generateBlogMetadata(post)`         | Blog post metadata                   |
| `generateEventMetadata(event)`       | Event page metadata                  |
| `generateStoreMetadata(store)`       | Store page metadata                  |
| `generateSellerMetadata(seller)`     | Seller profile metadata              |
| `generateJsonLd(type, data)`         | JSON-LD structured data              |

---

## `site.ts`

| Export          | Description                                                                            |
| --------------- | -------------------------------------------------------------------------------------- |
| `SITE_CONFIG`   | `{ name, domain, currency, locale, supportEmail, socialLinks }`                        |
| `FEATURE_FLAGS` | `{ auctions, preOrders, events, blog, multiSeller }` — toggle features without deploys |

---

## `success-messages.ts`

User-facing success strings keyed by action, parallel structure to `error-messages.ts`.

```ts
SUCCESS_MESSAGES = {
  auth: { SIGNED_IN: "Welcome back!", SIGNED_OUT: "Signed out." },
  cart: { ADDED: "Added to cart.", REMOVED: "Removed from cart." },
  order: {
    PLACED: "Order placed successfully!",
    CANCELLED: "Order cancelled.",
  },
  review: { SUBMITTED: "Review submitted." },
  // …
};
```

---

## `theme.ts`

Tailwind design token aliases used in components.

| Export            | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `THEME_CONSTANTS` | Color, spacing, radius, shadow token map                |
| `BREAKPOINTS`     | `{ sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }` |

Use `THEME_CONSTANTS` keys in className strings — avoids scattered arbitrary values.

---

## `ui.ts`

UI string constants that should not go through i18n (non-user-facing labels, ARIA roles, etc.).

| Export                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `UI_LABELS`           | Generic button text, ARIA labels, modal titles    |
| `SORT_OPTIONS`        | Shared `{ value, label }[]` sort dropdown options |
| `STATUS_COLORS`       | Order/review/payment status → Tailwind colour map |
| `ANIMATION_DURATIONS` | Transition duration values in ms                  |
| `Z_INDICES`           | z-index scale for layered components              |
