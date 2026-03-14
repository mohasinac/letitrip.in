# Seller Portal Pages

All seller portal pages live under `src/app/[locale]/seller/`. They require `seller` role and are wrapped by the seller layout with `SellerSidebar`.

---

## Dashboard

**Route:** `/seller`  
**Component:** `SellerDashboardView`  
**Feature:** `src/features/seller/`

Seller home with KPI summary:

- `SellerStatCard` (×4) — revenue, orders, active products, total sales
- `SellerRevenueChart` — 30-day revenue trend chart
- `SellerTopProducts` — best-selling products by revenue
- `SellerRecentListings` — recently added products
- `SellerQuickActions` — shortcuts to common tasks

**Data:** `useSellerDashboard(userId)` → `GET /api/seller/analytics`

---

## Products

**Route:** `/seller/products`  
**Component:** `SellerProductsView`

Paginated list of the seller's products. Each row has edit and delete actions. Includes `ProductFilters` for status/category filtering.

**Route:** `/seller/products/new`  
**Component:** `SellerCreateProductView`

Product creation form (`ProductForm` with react-hook-form + Zod). Fields:

- Name, description (rich text), category, brand
- Images (up to 10, via `MediaUploadField` + Storage)
- Pricing (price, compare-at-price, bulk discount tiers)
- Inventory (SKU, stock, weight, dimensions)
- Auction/pre-order settings

**Route:** `/seller/products/[id]/edit`  
**Component:** `SellerEditProductView`

Same form pre-populated with existing product data.

**Actions:**

- `useCreateSellerProduct` → `POST /api/seller/products`
- `useUpdateSellerProduct` → `PUT /api/seller/products/[id]`
- `adminDeleteProductAction` / seller delete via `DELETE /api/seller/products/[id]`

---

## Orders

**Route:** `/seller/orders`  
**Component:** `SellerOrdersView`

Seller's incoming order queue. Supports filter by status, date range, and search by order ID. Each order shows `OrderCard` with a "Ship Order" action.

**Actions:**

- `useShipOrder` → `POST /api/seller/orders/[id]/ship` — marks order as shipped, creates ShipRocket shipment
- `useBulkRequestPayout` → `POST /api/seller/orders/bulk` — bulk request payouts for delivered orders

---

## Offers

**Route:** `/seller/offers`  
**Component:** `SellerOffersView`  
**Feature:** `src/features/seller/`

Incoming buyer offer queue. Shows all offers received on the seller's products.

- Each row: product thumbnail, buyer display name, offer amount, status badge (`pending` / `countered` / `accepted` / `declined` / `withdrawn` / `expired`), buyer note, expiry countdown
- Filter by status

**Actions per offer row:**

| Action  | Condition | Server Action                                                                      |
| ------- | --------- | ---------------------------------------------------------------------------------- |
| Accept  | `pending` | `respondToOfferAction({ offerId, action: 'accept' })`                              |
| Decline | `pending` | `respondToOfferAction({ offerId, action: 'decline', sellerNote? })`                |
| Counter | `pending` | `respondToOfferAction({ offerId, action: 'counter', counterAmount, sellerNote? })` |

**Data:** `useSellerOffers()` → `GET /api/seller/offers`

---

## Auctions

**Route:** `/seller/auctions`  
**Component:** `SellerAuctionsView`

Lists auctions created by the seller. Shows active and ended auctions with bid counts and current/final amounts.

**Data:** `useSellerAuctions(params)` → `GET /api/seller/products?type=auction`

---

## Coupons

**Route:** `/seller/coupons`  
**Component:** `SellerCouponsView`

Lists seller-created coupon codes with usage statistics.

**Route:** `/seller/coupons/new`  
**Component:** `SellerCouponForm`

Create a coupon. Fields:

- Code, discount type (percentage/fixed), discount value
- Minimum order amount, maximum uses
- Applicable products (optional)
- Start and expiry dates

**Actions:**

- `sellerCreateCouponAction`
- `sellerUpdateCouponAction`
- `sellerDeleteCouponAction`

---

## Analytics

**Route:** `/seller/analytics`  
**Component:** `SellerAnalyticsView`

Detailed analytics for the seller's store:

- `SellerAnalyticsStats` — revenue, orders, AOV, conversion rate
- Revenue by product chart
- Order fulfillment rate
- Top categories

**Data:** `useSellerAnalytics()` → `GET /api/seller/analytics`  
**Type:** `SellerAnalyticsSummary`

---

## Payouts

**Route:** `/seller/payouts`  
**Component:** `SellerPayoutsView`

Payout history with status badges (pending, approved, paid, rejected).

- `SellerPayoutStats` — total earned, pending amount, paid out
- `SellerPayoutHistoryTable` — paginated payout rows with `PayoutTableColumns`
- `SellerPayoutRequestForm` — request a new payout (minimum threshold applies)

**Route:** `/seller/payout-settings`  
**Component:** `SellerPayoutSettingsView`

Configure bank account details for receiving payouts:

- Account holder name, bank name, IFSC code, account number

**Data:** `useSellerPayoutSettings()` → `GET /api/seller/payout-settings`  
**Actions:**

- `updateSellerPayoutSettingsAction` (Server Action) — save bank account details
- `requestSellerPayoutAction` (Server Action) — submit payout request

---

## Store Profile

**Route:** `/seller/store`  
**Component:** `SellerStoreView` / `SellerStoreSetupView`

Manage the seller's public storefront:

- Store name, logo, banner image, description, tagline
- Business category, shipping policy text
- Social links

First-time sellers see `SellerStoreSetupView` (onboarding wizard). Returning sellers see `SellerStoreView`.

**Data:** `useSellerStore()` → `GET /api/seller/store`  
**Action:** `PUT /api/seller/store`

---

## Addresses

**Route:** `/seller/addresses`  
**Component:** `SellerAddressesView`

Manage pickup addresses for ShipRocket shipment collection. Separate from user delivery addresses.

---

## Shipping

**Route:** `/seller/shipping`  
**Component:** `SellerShippingView`

Configure shipping settings:

- Default carrier preference
- Pickup address selection
- Verify pickup OTP (ShipRocket)

**Hook:** `useSellerShipping` → `GET /api/seller/shipping`  
**Type:** `SellerShippingData`, `VerifyPickupOtpPayload`
