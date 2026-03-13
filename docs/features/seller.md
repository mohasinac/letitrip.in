# Seller Portal Feature

**Feature path:** `src/features/seller/`  
**Repository:** `storeRepository`, `productRepository`, `orderRepository`, `payoutRepository`, `couponsRepository`  
**Service:** `sellerService`  
**Actions:** `sellerCreateCouponAction`, `sellerUpdateCouponAction`, `sellerDeleteCouponAction`, `becomeSellerAction`

---

## Overview

The seller feature module owns the entire seller portal UI. Sellers are users with the `seller` role who have an approved store.

---

## Seller Dashboard

### `SellerDashboardView`

KPI summary for the seller's business.

**Widgets:**
| Component | Description |
|-----------|-------------|
| `SellerStatCard` ×4 | Revenue (30d), Orders, Active Products, Conversion Rate |
| `SellerRevenueChart` | 30-day revenue trend (line chart) |
| `SellerTopProducts` | Top 5 products by revenue with thumbnail |
| `SellerRecentListings` | Last 5 added products |
| `SellerQuickActions` | Links to: Add Product, View Orders, Coupons, Payouts |

**Data:** `useSellerDashboard(userId)` → `GET /api/seller/analytics`

---

## Product Management

### `SellerProductsView`

Paginated product list with Sieve filters.

| Component           | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `SellerProductCard` | Product card with edit/delete actions                   |
| `ProductFilters`    | Filter by status, category                              |
| `useSellerProducts` | Fetch seller's products from `GET /api/seller/products` |

### `SellerCreateProductView` / `SellerEditProductView`

Full product form using shared `ProductForm` component.

**ProductForm sections:**

1. **Basic Info** — name, description (rich text), brand
2. **Category** — `CategorySelectorCreate` (select or inline-create)
3. **Media** — up to 10 images + 1 video via `MediaUploadField`
4. **Pricing** — price, compare-at-price, bulk discount tiers
5. **Inventory** — SKU, stock count, weight, dimensions
6. **Type settings** — auction (start/end, min bid), pre-order (availability date, deposit)
7. **SEO** — custom title and meta description

**Mutations:**

- `useCreateSellerProduct` → `POST /api/seller/products`
- `useUpdateSellerProduct` → `PUT /api/seller/products/[id]`

---

## Order Management

### `SellerOrdersView`

Incoming order queue. Orders are filtered to only show items belonging to this seller.

**Actions per order:**

- **Ship** — opens ship modal, calls `useShipOrder` → `POST /api/seller/orders/[id]/ship`
- **Request Payout** — for delivered orders, calls `useBulkRequestPayout`

**Data:** `useSellerOrders(params)` → `GET /api/seller/orders`

---

## Coupon Management

### `SellerCouponsView`

Table of seller-created coupons with usage count and validity.

### `SellerCouponForm`

Form to create/edit a seller-scoped coupon:

- Code (auto-generate or manual)
- Discount type: `percentage` | `fixed`
- Discount value
- Minimum order amount
- Maximum uses (total)
- Maximum uses per user
- Applicable products (optional selector)
- Start and expiry dates

**Actions:** `sellerCreateCouponAction`, `sellerUpdateCouponAction`, `sellerDeleteCouponAction`

---

## Analytics

### `SellerAnalyticsView`

Detailed seller performance metrics.

### `SellerAnalyticsStats`

Grid of stats cards — revenue total, orders total, AOV (average order value), return rate.

**Data:** `useSellerAnalytics()` → `GET /api/seller/analytics`  
**Type:** `SellerAnalyticsSummary`

---

## Payout System

### `SellerPayoutsView`

Full payout management interface.

| Component                  | Description                       |
| -------------------------- | --------------------------------- |
| `SellerPayoutStats`        | Total earned, pending, paid out   |
| `SellerPayoutHistoryTable` | Paginated payout records          |
| `SellerPayoutRequestForm`  | Request new payout (minimum ₹500) |

**Payout statuses:** `pending` → `approved` → `paid` / `rejected`

### `SellerPayoutSettingsView`

Bank account configuration required before payouts can be requested:

- Account holder name
- Bank name
- Branch + IFSC code
- Account number (masked display)

**Data:** `useSellerPayoutSettings()` → `GET /api/seller/payout-settings`

**Types:** `PayoutStatus`, `PayoutMethod`

---

## Store Management

### `SellerStoreView`

Manage the public storefront after setup is complete.  
Edit: store name, description, logo, banner, tagline, social links.

### `SellerStoreSetupView`

First-time onboarding. Steps:

1. Store name + slug
2. Logo + banner upload
3. Description + category
4. Bank/payout details
5. Accept seller terms

**Data:** `useSellerStore()` → `GET /api/seller/store`

---

## Storefront (Public)

### `SellerStorefrontPage` / `SellerStorefrontView`

**Route:** `/sellers/[id]`  
Public seller profile page rendered as RSC with initial data.

Shows:

- Store header (logo, banner, name, rating)
- Store navigation tabs (Products, Auctions, Reviews, About)
- Product listings

**Hook:** `useSellerStorefront(storeId)` → `GET /api/stores/[storeSlug]`

### `SellersListView`

**Route:** `/sellers`  
"Become a Seller" marketing landing page. Sections: hero banner with register CTA, platform stats, benefits grid (4 cards), how-it-works steps (3 cards), FAQs accordion, and final CTA.

---

## Shipping Configuration

### `SellerShippingView`

Configure pickup address for ShipRocket:

- Select from saved addresses
- Verify pickup address via OTP
- Set default carrier

**Hook:** `useSellerShipping`  
**Types:** `SellerShippingData`, `VerifyPickupOtpPayload`

---

## Seller Sidebar — `SellerSidebar`

Left navigation for the seller portal:

```
Dashboard
Products        → /seller/products
Orders          → /seller/orders
Auctions        → /seller/auctions
Coupons         → /seller/coupons
Analytics       → /seller/analytics
Payouts         → /seller/payouts
Store           → /seller/store
Settings
  Shipping      → /seller/shipping
  Addresses     → /seller/addresses
  Payout Settings → /seller/payout-settings
```

---

## Hooks in `features/seller/hooks/`

| Hook                         | Description             |
| ---------------------------- | ----------------------- |
| `useSellerDashboard(userId)` | KPI stats               |
| `useSellerProducts`          | Product list            |
| `useSellerProductDetail(id)` | Single product          |
| `useCreateSellerProduct`     | Create product mutation |
| `useUpdateSellerProduct`     | Update product mutation |
| `useSellerOrders(params)`    | Order list              |
| `useShipOrder`               | Ship order mutation     |
| `useBulkRequestPayout`       | Bulk payout request     |
| `useSellerCoupons`           | Coupon list             |
| `useSellerAnalytics`         | Analytics data          |
| `useSellerPayouts`           | Payout history          |
| `useSellerPayoutSettings`    | Bank settings           |
| `useSellerStore`             | Store profile           |
| `useSellerShipping`          | Shipping config         |
| `useSellerAuctions(params)`  | Auction list            |
