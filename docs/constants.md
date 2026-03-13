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
  auth: {
    session: "/api/auth/session",
    signOut: "/api/auth/signout",
    profile: "/api/auth/profile",
  },
  products: {
    list: "/api/products",
    detail: (id) => `/api/products/${id}`,
    recommendations: (id) => `/api/products/${id}/recommendations`,
  },
  auctions: {
    list: "/api/auctions",
    detail: (id) => `/api/auctions/${id}`,
    bids: (id) => `/api/auctions/${id}/bids`,
  },
  orders: {
    list: "/api/orders",
    detail: (id) => `/api/orders/${id}`,
    return: (id) => `/api/orders/${id}/return`,
    cancel: (id) => `/api/orders/${id}/cancel`,
  },
  cart: {
    get: "/api/cart",
    add: "/api/cart/add",
    remove: "/api/cart/remove",
    clear: "/api/cart/clear",
  },
  // … plus: categories, search, events, blog, sellers, stores
  //          promotions, rc, reviews, wishlist, notifications
  //          admin/*, seller/*, media/*, payments/*
};
```

---

## `config.ts`

Runtime configuration constants.

| Export              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `TOKEN_CONFIG`      | JWT expiry, refresh threshold, cookie name        |
| `PASSWORD_CONFIG`   | Min length, complexity rules                      |
| `PAGINATION_CONFIG` | Default page size, max page size                  |
| `UPLOAD_CONFIG`     | File size limits, allowed MIME types              |
| `SEARCH_CONFIG`     | Algolia index name, hits per page, default facets |
| `CACHE_CONFIG`      | TanStack Query `staleTime` / `gcTime` defaults    |
| `RATE_LIMIT_CONFIG` | Window + max requests for each API route group    |

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

| Export                               | Description                                                |
| ------------------------------------ | ---------------------------------------------------------- |
| `ROLE_HIERARCHY`                     | `{ guest: 0, user: 1, seller: 2, moderator: 3, admin: 4 }` |
| `ROLES`                              | Typed role constants                                       |
| `getRouteAccessConfig(pathname)`     | Returns `{ minRole, exact }` for a route                   |
| `hasRouteAccess(role, pathname)`     | Boolean route access check                                 |
| `isAdmin(role)`                      | `role === "admin"`                                         |
| `isModerator(role)`                  | `role >= "moderator"`                                      |
| `isSeller(role)`                     | `role >= "seller"`                                         |
| `getRedirectForRole(role, pathname)` | Returns redirect path when access denied                   |

Middleware calls `hasRouteAccess` on every request; all route → minRole mappings live here — never hardcode role checks in components.

---

## `routes.ts`

All application routes as typed constants. Never hardcode paths in `<Link>` or `router.push()`.

```ts
ROUTES = {
  home: "/",
  products: {
    list: "/products",
    detail: (slug) => `/products/${slug}`,
    category: (slug) => `/products/category/${slug}`,
  },
  auctions: {
    list: "/auctions",
    detail: (id) => `/auctions/${id}`,
  },
  cart: "/cart",
  checkout: "/checkout",
  orders: {
    list: "/account/orders",
    detail: (id) => `/account/orders/${id}`,
  },
  account: {
    profile: "/account/profile",
    addresses: "/account/addresses",
    wishlist: "/account/wishlist",
    rc: "/account/rc",
    notifications: "/account/notifications",
  },
  seller: {
    dashboard: "/seller/dashboard",
    products: "/seller/products",
    orders: "/seller/orders",
    store: "/seller/store",
    analytics: "/seller/analytics",
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    products: "/admin/products",
    orders: "/admin/orders",
    // … all admin routes
  },
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
  },
  events: "/events",
  blog: "/blog",
  stores: "/stores",
  search: "/search",
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

| Export          | Description                                                                                |
| --------------- | ------------------------------------------------------------------------------------------ |
| `SITE_CONFIG`   | `{ name, domain, currency, locale, supportEmail, socialLinks }`                            |
| `FEATURE_FLAGS` | `{ auctions, preOrders, rc, events, blog, multiSeller }` — toggle features without deploys |

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
