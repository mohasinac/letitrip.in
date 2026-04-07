---
applyTo: "src/**"
description: "Three-tier architecture, feature modules, barrel imports, page thickness. Rules 1, 2, 9, 10, 24."
---

# Architecture & Module Rules

## Three-Tier Layout

```
Tier 3 — Pages        src/app/               ← thin orchestration only
Tier 2 — Features     src/features/<name>/   ← vertically-sliced domains
Tier 1 — Shared       src/components/ src/hooks/ src/utils/ src/helpers/ src/classes/ src/constants/
```

Import rules: Pages → Tier 1 + 2. Features → Tier 1 only (NEVER import another feature). Shared → Tier 1 only.

## RULE 1: Feature Module Structure

New features → `src/features/<name>/` with: `components/`, `hooks/`, `types/`, `constants/`, `utils/`, `index.ts`.

Feature barrel pattern:

```typescript
// src/features/products/index.ts
export * from "./components";
export * from "./hooks";
export * from "./types";
export * from "./constants";
```

Cross-feature shared logic → elevate to Tier 1.

### Current Feature Modules

| Module       | Path                       | Key exports                                                                                                                                                                               |
| ------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `products`   | `src/features/products/`   | `ProductDetailView`, `ProductsView`, `AuctionDetailView`, `AuctionsView`, `PreOrdersView`, `ProductActions`, `ProductInfo`, `BidHistory`, `PlaceBidForm`                                  |
| `auth`       | `src/features/auth/`       | `LoginForm`, `RegisterForm`, `useLogin`, `useRegister`                                                                                                                                    |
| `cart`       | `src/features/cart/`       | `CartDrawer`, `CartItem`, `CartSummary`, `useCart`                                                                                                                                        |
| `reviews`    | `src/features/reviews/`    | `ReviewsListView`                                                                                                                                                                         |
| `search`     | `src/features/search/`     | `SearchResultsSection`, `SearchFilters`                                                                                                                                                   |
| `blog`       | `src/features/blog/`       | `BlogCard`, `BlogContent`                                                                                                                                                                 |
| `categories` | `src/features/categories/` | `CategoryCard`, `CategoryBreadcrumb`                                                                                                                                                      |
| `admin`      | `src/features/admin/`      | `AdminPageHeader`, `AdminFilterBar`, `DataTable`, `useAdminStats`                                                                                                                         |
| `seller`     | `src/features/seller/`     | `SellerCreateProductView`, `SellerAuctionsView`, `SellerCouponsView`, `SellerAnalyticsView`, `SellerAddressesView`, `useSellerStore`, `useSellerProducts`, `useSellerOrders`              |
| `user`       | `src/features/user/`       | `ProfileView`, `UserOrdersView`, `OrderDetailView`, `UserNotificationsView`, `UserAddressesView`, `MessagesView`, `RCWallet`, `useUserOrders`, `useUserNotifications`                     |
| `events`     | `src/features/events/`     | `EventsListView`, `EventDetailView`, `EventLeaderboard`, `EventFormDrawer`, `EventParticipateView`, `AdminEventsView`, `AdminEventEntriesView`                                            |
| `stores`     | `src/features/stores/`     | `StoresListView`, `StoreHeader`, `StoreNavTabs`, `StoreProductsView`, `StoreAuctionsView`, `StoreReviewsView`, `StoreAboutView`                                                           |
| `homepage`   | `src/features/homepage/`   | `HeroCarousel`, `FeaturedProductsSection`, `FeaturedAuctionsSection`, `FeaturedEventsSection`, `FeaturedStoresSection`, `BlogArticlesSection`, `TopCategoriesSection`, `HomepageSkeleton` |
| `promotions` | `src/features/promotions/` | `PromotionsView`, `CouponCard`, `ProductSection`                                                                                                                                          |
| `wishlist`   | `src/features/wishlist/`   | `WishlistView`, `WishlistButton`, `useWishlist`                                                                                                                                           |
| `faq`        | `src/features/faq/`        | `FAQPageContent`, `FAQAccordion`, `FAQCategorySidebar`, `RelatedFAQs`                                                                                                                     |
| `about`      | `src/features/about/`      | `AboutView`                                                                                                                                                                               |
| `contact`    | `src/features/contact/`    | `ContactForm`, `ContactInfoSidebar`, `ContactCTA`                                                                                                                                         |

## RULE 2: Barrel Imports Only

NEVER import from individual files. ALWAYS use barrel `index.ts` exports.

```typescript
// ❌ WRONG
import { Button } from "@/components/ui/Button";
import { isValidEmail } from "@/utils/validators/email.validator";

// ✅ RIGHT
import { Button } from "@/components";
import { isValidEmail } from "@/utils";
```

| Need                                              | Import from                           |
| ------------------------------------------------- | ------------------------------------- |
| Reusable primitives/components                    | `@mohasinac/ui`                       |
| Reusable hooks                                    | `@mohasinac/react`                    |
| API client                                        | `@mohasinac/http`                     |
| Shared core classes/utilities                     | `@mohasinac/core`                     |
| Shared contracts/types                            | `@mohasinac/contracts`                |
| Feature components/hooks (app-specific)           | `@/features/<name>`                   |
| App composition wrappers                          | `@/components`                        |
| Constants, ROUTES, API_ENDPOINTS, THEME_CONSTANTS | `@/constants`                         |
| App-only hooks                                    | `@/hooks`                             |
| App-only validators/formatters/converters         | `@/utils`                             |
| App-only auth/data/UI helpers                     | `@/helpers`                           |
| App singletons                                    | `@/classes`                           |
| Repositories                                      | `@/repositories`                      |
| DB schemas & types                                | `@/db/schema`                         |
| API types                                         | `@/types/api`                         |
| Auth types                                        | `@/types/auth`                        |
| Error classes                                     | `@mohasinac/errors` or `@/lib/errors` |
| Contexts                                          | `@/contexts`                          |

### Package-First Rule

When adding shared components, hooks, helpers, or utilities, prefer LIR packages (`@mohasinac/*`) first. Keep app-local code for orchestration and product-specific behavior only.

## RULE 38: Shared Code Ownership & App Slimming

The application layer must stay thin. Shared code belongs in packages, not in app-local folders.

| Code type                                               | Required home          |
| ------------------------------------------------------- | ---------------------- |
| Shared UI primitives/components                         | `@mohasinac/ui`        |
| Generic React hooks                                     | `@mohasinac/react`     |
| Generic utilities/classes/logger/cache/event bus        | `@mohasinac/core`      |
| Domain-shared modules (products/cart/orders/admin/etc.) | `@mohasinac/feat-*`    |
| Contracts/interfaces                                    | `@mohasinac/contracts` |
| App-only composition and glue code                      | `src/**`               |

Required workflow:

- If logic is reusable across pages/features/projects, move it to the correct package first.
- Import package exports in app code instead of creating new app-local duplicates.
- After migration, delete replaced app-local implementation immediately (no dual source of truth).
- Do not add new generic shared code under `src/lib/**`, `src/components/**`, `src/hooks/**`, `src/helpers/**`, or `src/utils/**` when it belongs in a package.

Exceptions allowed only for product-specific orchestration that cannot be reused outside this app.

## RULE 9 & 10: Thin Pages (150-line max)

Pages may only: read URL params, gate auth, render 1-2 feature view components, call at most 1 `useApiQuery` not yet wrapped in a feature hook. No inline forms, tables, business logic, or direct API calls.

```typescript
// ✅ RIGHT — thin page
import { AdminOrdersView } from '@/features/admin';
export default function AdminOrdersPage() {
  return <AdminOrdersView />;
}
```

Decomposition targets:
| Page type | Extract to |
|-----------|------------|
| Admin CRUD | `src/features/admin/components/Admin<Domain>View.tsx` |
| Seller | `src/features/seller/components/Seller<Domain>View.tsx` |
| User | `src/features/user/components/User<Domain>View.tsx` |
| Auth | `src/features/auth/components/<Name>View.tsx` |

## RULE 24: No Backward Compatibility

When replacing code, DELETE the old implementation immediately.

- No `@deprecated` JSDoc stubs
- No compatibility shims or dual implementations
- No feature flags for old behaviour
- Delete call sites first, then delete the implementation

```typescript
// ❌ WRONG — keeping old hook alongside new
/** @deprecated use useApiQuery instead */
export function useApiRequest() { ... }

// ✅ RIGHT — delete old code, update all call sites
```

Browser target: last 2 stable releases of Chrome, Firefox, Safari, Edge. Use modern JS/CSS freely — no polyfills.
