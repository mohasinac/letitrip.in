# Stores Feature

**Feature path:** `src/features/stores/`  
**Repository:** `storeRepository`  
**Service:** `storeService`

---

## Overview

Stores are the public storefronts for sellers. Each approved seller has one store with a unique slug. Stores have tabs for products, auctions, reviews, and an about section.

---

## Public Pages

### `StoresListView` (`/stores`)

Directory of all approved stores:

- Search by store name
- Filter by category
- Each store shown as a `StoreCard` (logo, name, rating, product count)

**Data:** `useStores(options)` → `storeService.list(params)` → `GET /api/stores`

### `StoreCard` — `src/components/StoreCard.tsx`

Store listing card:

- Store logo (`MediaImage`)
- Store name, tagline
- Average rating (`RatingDisplay`)
- Product/auction count
- Link to store page

---

## Store Storefront (`/stores/[storeSlug]`)

### `StoreHeader`

Full-width store header:

- Banner image (via `MediaImage`)
- Logo overlay
- Store name + tagline
- Rating + review count
- "Follow" button (wishlist-like)
- "Message Seller" button → opens chat

### `StoreNavTabs`

Tab navigation built with `SectionTabs`:

| Tab      | Route                     | Component           |
| -------- | ------------------------- | ------------------- |
| Products | `/stores/[slug]/products` | `StoreProductsView` |
| Auctions | `/stores/[slug]/auctions` | `StoreAuctionsView` |
| Reviews  | `/stores/[slug]/reviews`  | `StoreReviewsView`  |
| About    | `/stores/[slug]/about`    | `StoreAboutView`    |

### `StoreProductsView`

Products listed in a `ProductGrid` filtered to this store. Supports sort and basic filters.  
**Data:** `useStoreProducts(slug, params)` → `GET /api/stores/[storeSlug]/products`

### `StoreAuctionsView`

Auctions listed in an `AuctionGrid` filtered to this store.  
**Data:** `GET /api/stores/[storeSlug]/auctions`

### `StoreReviewsView`

Aggregated reviews for all products from this store.  
**Data:** `useStoreReviews(slug)` → `GET /api/stores/[storeSlug]/reviews`

### `StoreAboutView`

Static store information:

- Description
- Business category
- Member since date
- Policies (shipping, return)
- Contact info

---

## Sellers Directory (`/sellers`)

### `SellersListView` (from `features/seller/`)

Listed under `/sellers` route. "Become a Seller" marketing landing page — **not** a seller directory. See [features/seller.md](../features/seller.md) for full detail.

### `SellerStorefrontPage` / `SellerStorefrontView`

**Route:** `/sellers/[id]`  
Public profile view for a seller using their user ID (not store slug). Includes their store + products + reviews.

**Data:** `useSellerStorefront(storeId)` → `GET /api/stores/[storeSlug]`

---

## Hooks

| Hook                             | Description                   |
| -------------------------------- | ----------------------------- |
| `useStores(options)`             | Paginated store directory     |
| `useStoreBySlug(slug)`           | Single store data by slug     |
| `useStoreProducts(slug, params)` | Store product listing         |
| `useStoreReviews(slug)`          | Aggregated store reviews      |
| `useSellerStorefront(storeId)`   | Public seller storefront data |

---

## Admin Store Management

Admins manage store approval via `AdminStoresView` (`/admin/stores`):

- View all stores (pending, approved, suspended)
- `adminUpdateStoreStatusAction({ uid, status })` — approve/reject/suspend

**Filter:** `StoreFilters` — by status

---

## API Routes

| Method  | Route                              | Description         |
| ------- | ---------------------------------- | ------------------- |
| `GET`   | `/api/stores`                      | Store directory     |
| `GET`   | `/api/stores/[storeSlug]`          | Store detail        |
| `GET`   | `/api/stores/[storeSlug]/products` | Store products      |
| `GET`   | `/api/stores/[storeSlug]/auctions` | Store auctions      |
| `GET`   | `/api/stores/[storeSlug]/reviews`  | Store reviews       |
| `GET`   | `/api/seller/store`                | Seller's own store  |
| `PUT`   | `/api/seller/store`                | Update seller store |
| `GET`   | `/api/admin/stores`                | All stores (admin)  |
| `PATCH` | `/api/admin/stores/[uid]`          | Update store status |
