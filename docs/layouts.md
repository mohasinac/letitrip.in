# App Layouts

LetItRip has a hierarchy of nested layouts, all under `src/app/`.

---

## Layout Hierarchy

```
src/app/layout.tsx                    ← Root HTML shell
  └─ src/app/[locale]/layout.tsx      ← Locale + providers
       ├─ src/app/[locale]/admin/layout.tsx     ← Admin portal
       ├─ src/app/[locale]/seller/layout.tsx    ← Seller portal
       ├─ src/app/[locale]/user/layout.tsx      ← User portal
       ├─ src/app/[locale]/auctions/layout.tsx  ← Auctions section
       ├─ src/app/[locale]/blog/layout.tsx      ← Blog section
       ├─ src/app/[locale]/cart/layout.tsx      ← Cart
       ├─ src/app/[locale]/checkout/layout.tsx  ← Checkout
       ├─ src/app/[locale]/contact/layout.tsx   ← Contact
       └─ …other section layouts
```

---

## Root Layout — `src/app/layout.tsx`

The outermost HTML shell. Sets:

- `<html>` and `<body>` tags
- Google Font loading (Geist)
- Root metadata (title template, viewport, theme-color)

Does **not** include providers or navigation — that is the locale layout's responsibility.

---

## Locale Layout — `src/app/[locale]/layout.tsx`

The main application layout. Wraps every localised page.

**Responsibilities:**

- Sets `lang` attribute from `[locale]` param
- Loads `messages/en.json` (or locale variant) via `next-intl`
- Renders `<LayoutClient>` which mounts all client providers:
  - `QueryProvider` (TanStack Query)
  - `AuthContext`
  - `ToastProvider`
  - `MonitoringProvider` (Sentry)
  - `BottomActionsProvider` (mobile action bar state)
- Renders `<MainNavbar>`, `<BottomActions>` (mobile), `<BottomNavbar>` (mobile), and `<Footer>` around the page slot
- Contains `<ZodSetup>` to initialise Zod with the current locale

**Key component:** `src/components/LayoutClient.tsx`

---

## Admin Layout — `src/app/[locale]/admin/layout.tsx`

Protects `/admin/*` routes. Requires `admin` role.

**Structure:**

```
AdminLayout
  ├─ AdminSidebar         ← Collapsible left navigation
  ├─ AdminTopBar          ← Header with menu toggle + user dropdown
  └─ <children>           ← Admin page content
```

**Components used:**

- `src/features/admin/components/AdminSidebar.tsx`
- `src/features/admin/components/AdminTopBar.tsx`

The layout calls `getRouteAccessConfig` to enforce `admin` role. Unauthenticated users are redirected to `/auth/login`. Users with insufficient role see `/unauthorized`.

---

## Seller Layout — `src/app/[locale]/seller/layout.tsx`

Protects `/seller/*` routes. Requires `seller` role (or higher).

**Structure:**

```
SellerLayout
  ├─ SellerSidebar        ← Left navigation for seller portal
  └─ <children>
```

**Component:** `src/features/seller/components/SellerSidebar.tsx`

Redirects non-sellers to `/user/become-seller`.

---

## User Layout — `src/app/[locale]/user/layout.tsx`

Protects `/user/*` routes. Requires authenticated `user` role.

**Structure:**

```
UserLayout
  ├─ UserSidebar          ← Navigation for user account pages
  └─ <children>
```

**Component:** `src/features/user/components/UserSidebar.tsx`

---

## Section Layouts

Lightweight layouts for specific public sections.

| Layout                          | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `auctions/layout.tsx`           | Sets `<title>` prefix for auction pages     |
| `blog/layout.tsx`               | Blog-specific OG metadata                   |
| `cart/layout.tsx`               | Protects cart (redirects guest to products) |
| `categories/layout.tsx`         | Category breadcrumb layout                  |
| `checkout/layout.tsx`           | Hides navbar/footer during checkout         |
| `contact/layout.tsx`            | Contact page wrapper                        |
| `pre-orders/layout.tsx`         | Pre-orders section layout                   |
| `products/[slug]/layout.tsx`    | Product detail with `generateMetadata`      |
| `promotions/layout.tsx`         | Promotions section layout                   |
| `search/layout.tsx`             | Search page layout                          |
| `sellers/layout.tsx`            | Sellers directory layout                    |
| `stores/[storeSlug]/layout.tsx` | Individual store layout with tabs           |

---

## `LayoutClient` Component

`src/components/LayoutClient.tsx` is the central client-side shell mounted inside the locale layout. It:

1. Wraps children in all React context providers
2. Renders `MainNavbar` + `BottomActions` + `BottomNavbar` + `Footer`
3. Handles scroll restoration
4. Mounts `BackToTop` button
5. Renders `BackgroundRenderer` for configurable page backgrounds
6. Dynamically sets `<Main>` bottom margin: `mb-28` when the `BottomActions` bar is visible, `mb-16` otherwise (mobile only)

This component is a Client Component (`'use client'`) so all providers can use React hooks.

---

## `BottomActions` — Mobile Page Action Bar

`src/components/layout/BottomActions.tsx` renders a fixed bar above `BottomNavbar` (`bottom-14`, `md:hidden`). Features register their actions via `useBottomActions()` — the component is purely a renderer.

### Two modes

| Mode          | Activation                              | Content                                                                   |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| **Page mode** | `actions.length > 0` or `infoLabel` set | Optional info label row + action button row                               |
| **Bulk mode** | `bulk.selectedCount > 0`                | Accent top stripe + count pill (tap = deselect all) + bulk action buttons |

### `useBottomActions(options)` — feature hook

```ts
import { useBottomActions } from "@/hooks";

// Product detail — icon-only + two text actions
useBottomActions({
  infoLabel: isAuction ? `Current bid: ₹${currentBid}` : undefined,
  actions: [
    { id: "wishlist", icon: <Heart className="w-4 h-4" />, label: t("wishlist"), variant: "ghost", grow: false, onClick: handleWishlist },
    { id: "cart",     label: t("addToCart"), variant: "outline", onClick: handleAddToCart },
    { id: "buy",      label: t("buyNow"),    variant: "primary", onClick: handleBuyNow },
  ],
});

// Admin/seller listing — bulk mode auto-activates when rows are selected
useBottomActions({
  bulk: {
    selectedCount: selectedIds.length,
    onClearSelection: () => setSelectedIds([]),
    actions: [
      { id: "publish", label: t("bulkPublish", { count: selectedIds.length }), variant: "secondary", onClick: handleBulkPublish },
      { id: "delete",  label: t("bulkDelete",  { count: selectedIds.length }), variant: "danger", grow: false, onClick: handleBulkDelete },
    ],
  },
});

// Cart / checkout — single full-width primary action
useBottomActions({
  actions: [
    { id: "checkout", label: t("proceedToCheckout"), variant: "primary", badge: cartCount, onClick: handleCheckout },
  ],
});
```

### `BottomAction` type

| Prop       | Type                     | Default                        | Notes                                                           |
| ---------- | ------------------------ | ------------------------------ | --------------------------------------------------------------- |
| `id`       | `string`                 | required                       | Stable React key; used for callback dispatch                    |
| `label`    | `string`                 | —                              | Translated string from `useTranslations`                        |
| `icon`     | `ReactNode`              | —                              | Leading icon element                                            |
| `variant`  | `ButtonProps["variant"]` | `"primary"`                    | `primary \| secondary \| outline \| ghost \| danger \| warning` |
| `badge`    | `string \| number`       | —                              | Count badge rendered in top-right corner                        |
| `onClick`  | `() => void`             | required                       | Always dispatches latest closure via ref                        |
| `disabled` | `boolean`                | —                              | Disables the button                                             |
| `loading`  | `boolean`                | —                              | Shows spinner                                                   |
| `grow`     | `boolean`                | `true` (page) / `false` (bulk) | `false` = compact/icon-only size                                |

### Typical page mappings

| Page                         | Bar content                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| Product detail (non-auction) | Wishlist icon \| Add to Cart \| Buy Now                           |
| Product detail (auction)     | Info: "Current bid: ₹X" \| Place Bid                              |
| Cart                         | Proceed to Checkout (badge = item count)                          |
| Wishlist                     | Add to Cart ({count}) bulk \| Remove ({count}) bulk               |
| Admin products               | Publish ({count}) \| Archive ({count}) \| Delete ({count}) — bulk |
| Seller products              | Publish ({count}) \| Delete ({count}) — bulk                      |
| Admin orders                 | Mark Shipped ({count}) \| Mark Delivered ({count}) — bulk         |
| Store page                   | Follow Store \| Contact Seller                                    |
| Event detail                 | Register for Event                                                |
| Pre-order detail             | Reserve Now                                                       |

**Structure:**

```
UserLayout
  ├─ UserSidebar          ← Navigation for user account pages
  └─ <children>
```

**Component:** `src/features/user/components/UserSidebar.tsx`

---

## Section Layouts

Lightweight layouts for specific public sections. Most just add a `<NavbarLayout>` wrapper or inject section-specific metadata.

| Layout                          | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `auctions/layout.tsx`           | Sets `<title>` prefix for auction pages     |
| `blog/layout.tsx`               | Blog-specific OG metadata                   |
| `cart/layout.tsx`               | Protects cart (redirects guest to products) |
| `categories/layout.tsx`         | Category breadcrumb layout                  |
| `checkout/layout.tsx`           | Hides navbar/footer during checkout         |
| `contact/layout.tsx`            | Contact page wrapper                        |
| `pre-orders/layout.tsx`         | Pre-orders section layout                   |
| `products/[slug]/layout.tsx`    | Product detail with `generateMetadata`      |
| `promotions/layout.tsx`         | Promotions section layout                   |
| `search/layout.tsx`             | Search page layout                          |
| `sellers/layout.tsx`            | Sellers directory layout                    |
| `stores/[storeSlug]/layout.tsx` | Individual store layout with tabs           |

---

## `LayoutClient` Component

`src/components/LayoutClient.tsx` is the central client-side shell mounted inside the locale layout. It:

1. Wraps children in all React context providers
2. Renders `MainNavbar` + `BottomActions` + `BottomNavbar` + `Footer`
3. Handles scroll restoration
4. Mounts `BackToTop` button
5. Renders `BackgroundRenderer` for configurable page backgrounds
6. Dynamically sets `<Main>` bottom margin: `mb-28` when `BottomActions` bar is visible, `mb-16` otherwise (mobile only)

This component is a Client Component (`'use client'`) so all providers can use React hooks.
