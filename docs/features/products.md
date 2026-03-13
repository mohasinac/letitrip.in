# Products, Auctions & Pre-Orders Feature

**Feature path:** `src/features/products/`  
**Repositories:** `productRepository`, `bidRepository`  
**Services:** `productService`  
**Actions:** `adminCreateProductAction`, `adminUpdateProductAction`, `adminDeleteProductAction`, `placeBidAction`

---

## Overview

The products feature handles three purchase modes:

| Mode          | Description                                            |
| ------------- | ------------------------------------------------------ |
| **Buy Now**   | Standard e-commerce add-to-cart product                |
| **Auction**   | Timed bidding — highest bid wins when timer expires    |
| **Pre-Order** | Reserve before availability, pay deposit or full price |

All three modes share the same `products` Firestore collection, differentiated by the `type` field (`'product' | 'auction' | 'pre-order'`).

---

## Product Listing

### `ProductsView`

Main catalogue page view. Renders a filter sidebar + product grid.

- **URL params:** `page`, `pageSize`, `sort`, `category`, `minPrice`, `maxPrice`, `brand`, `rating`
- Uses `useUrlTable` to keep filter/sort/page state in the URL
- Renders `ProductGrid` + `ProductSortBar` + `ListingLayout`
- Data: `useProducts(params)` → `productService.list(params)` → `GET /api/products`

### `ProductGrid`

Responsive grid (`2-col mobile → 4-col desktop`) of `ProductCard` components.

### `ProductCard`

Individual listing card showing:

- Product image (via `MediaImage`)
- Name, price, compare-at-price (strikethrough)
- Rating stars + review count
- Auction countdown if `type === 'auction'`
- `WishlistButton` overlay

---

## Product Detail

### `ProductDetailView`

Full product page assembled from sub-components.

### `ProductImageGallery`

- Thumbnail strip + main image display
- Click to open `MediaLightbox` full-screen

### `ProductInfo`

- Product name, brand, category breadcrumb
- `PriceDisplay` — formatted price with discount
- Stock status, fulfillment estimate
- Variant selectors (color, size) if applicable
- Share button

### `ProductActions`

- `AddToCartButton` — quantity selector + add to cart
- `WishlistButton` — toggle save
- `BuyNowButton` — skip cart, go directly to checkout

### `ProductTabs`

Tab panel containing:

- **Reviews** → `ProductReviews`
- **Specifications** — key-value attribute table
- **Q&A** — community questions (if enabled)

### `ProductReviews`

- Summary stars + distribution bar chart
- Paginated `ReviewCard` list
- "Write a review" button (requires prior purchase)
- Data: `useProductReviews(productId, page, pageSize)`

### `RelatedProducts`

Horizontal scroll carousel of products from the same category.  
Data: `useRelatedProducts(categoryId, excludeId)`

### `BuyMoreSaveMore`

Displays bulk discount tiers (e.g. "Buy 3 save 10%"). Quantity select auto-triggers the discount calculation.

### `PromoBannerStrip`

Shows any active promotions or coupons applicable to this product. Renders `CouponCard` chips.

### `ProductFeatureBadges`

Feature flag badge strip (e.g. "Eco-Friendly", "Handmade", "Verified Seller").

---

## Auctions

### `AuctionsView`

Auction listing page. Uses `useAuctions(params)`.

- Filter by status (`active`, `upcoming`, `ended`)
- Sort by end time, current price

### `AuctionDetailView`

Full auction detail:

- Product images + description (`ProductInfo`)
- **Live countdown** via `useCountdown(endTime)`
- **Current highest bid** — real-time from Firebase RTDB via `useRealtimeBids`
- `PlaceBidForm` — place bid (validated ≥ current bid + minimum increment)
- `BidHistory` — paginated past bids ordered by amount desc

### `PlaceBidForm`

`react-hook-form` form. Validates:

- Bid amount ≥ current price + minimum increment
- User is not already the highest bidder
- Auction has not ended

Submits via `placeBidAction` Server Action.

### `BidHistory`

`DataTable`-style list of bids: bidder avatar, masked name, amount, time.

### `AuctionCard`

Listing card variant for auctions:

- Shows countdown timer (live)
- Current bid amount
- Total bid count
- Status badge (active / upcoming / ended)

---

## Pre-Orders

### `PreOrdersView`

Pre-order listing via `usePreOrders(params)`.

### `PreOrderDetailView`

Detail page showing:

- Expected availability date
- Deposit amount or full price
- Pre-order form (address selection + payment)

### `PreOrderCard`

Listing card with "Expected: [date]" badge and pre-order CTA.

---

## Hooks

| Hook                                       | Returns               | Description                 |
| ------------------------------------------ | --------------------- | --------------------------- |
| `useProducts(params)`                      | `ProductsListResult`  | Paginated product catalogue |
| `useProductDetail(id)`                     | `Product`             | Single product by ID        |
| `useAuctions(params)`                      | `AuctionsListResult`  | Paginated auction list      |
| `usePreOrders(params)`                     | `PreOrdersListResult` | Paginated pre-order list    |
| `useRelatedProducts(catId, excludeId)`     | `Product[]`           | Related products            |
| `useProductReviews(productId, page, size)` | `ReviewsPageResult`   | Product-level reviews       |
| `useCreateReview`                          | mutation              | Post a review               |
| `usePlaceBid`                              | mutation              | Place auction bid           |

---

## Types

| Type                 | Description                        |
| -------------------- | ---------------------------------- |
| `ProductItem`        | Listing card data shape            |
| `ProductsListResult` | `{ items, total, page, pageSize }` |
| `AuctionItem`        | Auction card data with bid info    |
| `PreOrderItem`       | Pre-order card data                |

---

## Admin Role

Admins manage products via `AdminProductsView`:

- View all products across all sellers
- Edit product details, status, category
- Delete products
- See metrics (views, conversion)

See [docs/pages-admin.md](../pages-admin.md#products).

---

## Seller Role

Sellers manage their own products via `SellerProductsView`, `SellerCreateProductView`, `SellerEditProductView`.

See [docs/pages-seller.md](../pages-seller.md#products).
