# Pages and API Reference Documentation

**Last Updated**: November 10, 2025  
**Purpose**: Comprehensive mapping of all pages to their required API endpoints with testing status

---

## 📖 How to Use This Document

- **✅ Working**: API is implemented and tested
- **⚠️ Partial**: API exists but has issues
- **❌ Not Working**: API not implemented or broken
- **🔨 In Progress**: Currently being developed

---

## 1. Public Pages

### Homepage (`/`)

**Purpose**: Main landing page with featured products, auctions, categories  
**APIs Required**:

- ✅ `GET /api/homepage/hero-slides` - Get homepage hero slides
- ✅ `GET /api/homepage/banner` - Get featured banner
- ✅ `GET /api/products?featured=true` - Get featured products
- ✅ `GET /api/auctions?status=active&featured=true` - Get featured auctions
- ✅ `GET /api/categories?featured=true` - Get featured categories

**Sample Request**:

```bash
curl http://localhost:3000/api/homepage/hero-slides
```

**Sample Response**:

```json
{
  "slides": [
    {
      "id": "slide1",
      "imageUrl": "https://...",
      "title": "Welcome to Letitrip",
      "subtitle": "Best Auction Platform",
      "buttonText": "Shop Now",
      "buttonUrl": "/products",
      "isActive": true,
      "displayOrder": 1
    }
  ]
}
```

---

### Products Listing (`/products`)

**Purpose**: Browse and filter products  
**APIs Required**:

- ✅ `GET /api/products` - List all products with filters
  - Query params: `category`, `minPrice`, `maxPrice`, `search`, `sort`, `page`, `limit`, `featured`, `status`
- ✅ `GET /api/categories` - Get categories for filtering

**Sample Request**:

```bash
curl "http://localhost:3000/api/products?category=electronics&sort=price-asc&page=1&limit=20"
```

**Sample Response**:

```json
{
  "products": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

### Product Details (`/products/[slug]`)

**Purpose**: View single product details  
**APIs Required**:

- ✅ `GET /api/products/slug/[slug]` - Get product by slug
- ✅ `GET /api/products/[id]/reviews` - Get product reviews
- ✅ `GET /api/products/[id]/related` - Get related products

**Sample Request**:

```bash
curl http://localhost:3000/api/products/slug/laptop-hp-pavilion
```

---

### Auctions Listing (`/auctions`)

**Purpose**: Browse active and upcoming auctions  
**APIs Required**:

- ✅ `GET /api/auctions` - List auctions with filters
  - Query params: `status`, `category`, `sort`, `page`, `limit`

**Sample Request**:

```bash
curl "http://localhost:3000/api/auctions?status=active&sort=ending-soon"
```

---

### Auction Details (`/auctions/[slug]`)

**Purpose**: View auction details and place bids  
**APIs Required**:

- ✅ `GET /api/auctions/slug/[slug]` - Get auction by slug
- ✅ `GET /api/auctions/[id]/bids` - Get bid history
- ✅ `POST /api/auctions/[id]/bids` - Place bid (requires auth)
- ✅ `POST /api/auctions/[id]/auto-bid` - Set auto-bid (requires auth)
- ✅ `POST /api/auctions/[id]/watch` - Watch auction (requires auth)

**Sample Request (Place Bid)**:

```bash
curl -X POST http://localhost:3000/api/auctions/abc123/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount": 5000}'
```

---

### Shops Listing (`/shops`)

**Purpose**: Browse all seller shops  
**APIs Required**:

- ✅ `GET /api/shops` - List all shops
  - Query params: `search`, `verified`, `featured`, `sort`, `page`, `limit`

**Sample Request**:

```bash
curl "http://localhost:3000/api/shops?verified=true&featured=true"
```

---

### Shop Details (`/shops/[slug]`)

**Purpose**: View shop profile, products, reviews  
**APIs Required**:

- ✅ `GET /api/shops/slug/[slug]` - Get shop by slug
- ✅ `GET /api/shops/[id]/products` - Get shop products
- ✅ `GET /api/shops/[id]/auctions` - Get shop auctions
- ✅ `GET /api/shops/[id]/reviews` - Get shop reviews

---

### Categories (`/categories`)

**Purpose**: Browse product categories  
**APIs Required**:

- ✅ `GET /api/categories` - List all categories
- ✅ `GET /api/categories/tree` - Get category tree/hierarchy

---

### Category Products (`/categories/[slug]`)

**Purpose**: View products in a category  
**APIs Required**:

- ✅ `GET /api/categories/slug/[slug]` - Get category details
- ✅ `GET /api/categories/[slug]/products` - Get category products
- ✅ `GET /api/categories/[slug]/subcategories` - Get subcategories

---

### Contact Page (`/contact`)

**Purpose**: Contact form for general inquiries  
**APIs Required**:

- ❌ `POST /api/support` - Submit contact/support ticket

**Status**: ❌ Page does not exist, needs creation

**Required Fields**:

- name (required)
- email (required)
- phone (optional)
- subject (required)
- message (required)

---

### Search Results (`/search`)

**Purpose**: Global search across products, auctions, shops  
**APIs Required**:

- ✅ `GET /api/search` - Global search
- ✅ `GET /api/search/products` - Search products only
- ✅ `GET /api/search/auctions` - Search auctions only
- ✅ `GET /api/search/shops` - Search shops only

---

### Cart (`/cart`)

**Purpose**: View and manage shopping cart  
**APIs Required**:

- ✅ `GET /api/cart` - Get cart items
- ✅ `POST /api/cart` - Add to cart
- ✅ `PATCH /api/cart/[itemId]` - Update cart item quantity
- ✅ `DELETE /api/cart/[itemId]` - Remove from cart
- ✅ `DELETE /api/cart/clear` - Clear cart
- ✅ `POST /api/cart/merge` - Merge guest cart with user cart

---

### Checkout (`/checkout`)

**Purpose**: Complete purchase  
**APIs Required**:

- ✅ `POST /api/checkout/create-order` - Create order
- ✅ `POST /api/checkout/verify-payment` - Verify payment
- ✅ `POST /api/coupons/validate` - Validate coupon code

---

## 2. User Pages (Requires Authentication)

### User Dashboard (`/user`)

**Purpose**: User account overview  
**APIs Required**:

- ✅ `GET /api/user/profile` - Get user profile
- ✅ `GET /api/user/orders` - Recent orders
- ✅ `GET /api/auctions/my-bids` - Recent bids
- ✅ `GET /api/user/wishlist` - Wishlist items

---

### Orders History (`/user/orders`)

**Purpose**: View all user orders  
**APIs Required**:

- ✅ `GET /api/user/orders` - List user orders
  - Query params: `status`, `page`, `limit`

**Sample Request**:

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/user/orders?status=delivered&page=1"
```

---

### Order Details (`/user/orders/[id]`)

**Purpose**: View single order details  
**APIs Required**:

- ✅ `GET /api/user/orders/[id]` - Get order details
- ✅ `POST /api/user/orders/[id]/cancel` - Cancel order
- ✅ `GET /api/orders/[id]/tracking` - Get tracking info
- ✅ `GET /api/orders/[id]/invoice` - Download invoice

---

### User Addresses (`/user/addresses`)

**Purpose**: Manage saved shipping addresses  
**APIs Required**:

- ❌ `GET /api/user/addresses` - List user addresses
- ❌ `POST /api/user/addresses` - Add new address
- ❌ `GET /api/user/addresses/[id]` - Get address
- ❌ `PATCH /api/user/addresses/[id]` - Update address
- ❌ `DELETE /api/user/addresses/[id]` - Delete address

**Status**: ❌ Page and APIs do not exist, need creation

**Address Schema**:

```typescript
{
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

### Support Tickets (`/user/tickets`)

**Purpose**: View and manage support tickets  
**APIs Required**:

- ⚠️ `GET /api/support/tickets` - List user tickets
- ⚠️ `GET /api/support/tickets/[id]` - Get ticket details
- ⚠️ `POST /api/support/tickets/[id]/reply` - Reply to ticket
- ⚠️ `POST /api/support/attachments` - Upload attachments

**Status**: ⚠️ Basic ticket creation exists, needs full CRUD and conversation system

---

### Auction Bids (`/user/bids`)

**Purpose**: View user's bid history  
**APIs Required**:

- ✅ `GET /api/auctions/my-bids` - Get user's bids
  - Query params: `status`, `page`, `limit`

---

### Watchlist (`/user/watchlist`)

**Purpose**: View watched auctions  
**APIs Required**:

- ✅ `GET /api/auctions/watchlist` - Get watched auctions
- ✅ `POST /api/auctions/[id]/watch` - Add to watchlist
- ✅ `DELETE /api/auctions/[id]/watch` - Remove from watchlist

---

### Won Auctions (`/user/won-auctions`)

**Purpose**: Auctions won by user  
**APIs Required**:

- ✅ `GET /api/auctions/won` - Get won auctions

---

### Favorites (`/user/favorites`)

**Purpose**: Favorite products  
**APIs Required**:

- ✅ `GET /api/user/wishlist` - Get wishlist/favorites
- ✅ `POST /api/favorites` - Add to favorites
- ✅ `DELETE /api/favorites/[id]` - Remove from favorites

---

### Viewing History (`/user/history`)

**Purpose**: Recently viewed products  
**APIs Required**:

- ✅ `GET /api/user/viewing-history` - Get viewing history

---

### Settings (`/user/settings`)

**Purpose**: Account settings and preferences  
**APIs Required**:

- ✅ `GET /api/user/profile` - Get profile
- ✅ `PATCH /api/user/profile` - Update profile
- ✅ `POST /api/user/change-password` - Change password
- ✅ `POST /api/users/me/avatar` - Upload avatar

---

## 3. Seller Pages (Requires Seller Role)

### Seller Dashboard (`/seller/dashboard`)

**Purpose**: Seller overview and analytics  
**APIs Required**:

- ✅ `GET /api/seller/dashboard` - Dashboard stats
- ✅ `GET /api/seller/revenue` - Revenue summary
- ✅ `GET /api/seller/analytics/sales` - Sales analytics

---

### Seller Products (`/seller/products`)

**Purpose**: Manage seller's products  
**APIs Required**:

- ✅ `GET /api/seller/products` - List seller products
- ✅ `POST /api/seller/products` - Create product
- ✅ `PATCH /api/seller/products/[slug]` - Update product
- ✅ `DELETE /api/seller/products/[slug]` - Delete product
- ⚠️ `POST /api/seller/products/bulk` - Bulk actions

**Bulk Actions**:

- publish, draft, archive, feature, unfeature, delete

**Status**: ⚠️ Bulk API needs fixes

---

### Create Product (`/seller/products/create`)

**Purpose**: Create new product (wizard form)  
**APIs Required**:

- ✅ `POST /api/seller/products` - Create product
- ✅ `POST /api/media/upload` - Upload product images
- ✅ `GET /api/categories` - Get categories for selection

---

### Edit Product (`/seller/products/[slug]/edit`)

**Purpose**: Edit existing product (wizard form)  
**APIs Required**:

- ✅ `GET /api/seller/products/[slug]` - Get product
- ✅ `PATCH /api/seller/products/[slug]` - Update product
- ✅ `POST /api/media/upload` - Upload images
- ✅ `DELETE /api/media/delete` - Delete images

---

### Seller Auctions (`/seller/auctions`)

**Purpose**: Manage seller's auctions  
**APIs Required**:

- ✅ `GET /api/seller/auctions` - List seller auctions
- ✅ `POST /api/seller/auctions` - Create auction
- ✅ `PATCH /api/seller/auctions/[id]` - Update auction
- ✅ `DELETE /api/seller/auctions/[id]` - Delete auction
- ⚠️ `POST /api/seller/auctions/bulk` - Bulk actions

**Status**: ⚠️ Bulk API needs fixes

---

### Seller Orders (`/seller/orders`)

**Purpose**: Manage seller's orders  
**APIs Required**:

- ✅ `GET /api/seller/orders` - List seller orders
- ✅ `GET /api/seller/orders/[id]` - Get order details
- ✅ `PATCH /api/seller/orders/[id]` - Update order status
- ⚠️ `POST /api/seller/orders/bulk` - Bulk actions

---

### Shop Settings (`/seller/shop`)

**Purpose**: Manage shop profile  
**APIs Required**:

- ✅ `GET /api/seller/shop` - Get shop details
- ✅ `PATCH /api/seller/shop` - Update shop
- ✅ `POST /api/media/upload` - Upload logo/banner

---

### Seller Coupons (`/seller/coupons`)

**Purpose**: Manage shop coupons  
**APIs Required**:

- ✅ `GET /api/seller/coupons` - List seller coupons
- ✅ `POST /api/seller/coupons` - Create coupon
- ✅ `PATCH /api/seller/coupons/[id]` - Update coupon
- ✅ `DELETE /api/seller/coupons/[id]` - Delete coupon
- ⚠️ `POST /api/seller/coupons/bulk` - Bulk actions

---

### Revenue & Payouts (`/seller/revenue`, `/seller/payouts`)

**Purpose**: View revenue and request payouts  
**APIs Required**:

- ✅ `GET /api/seller/revenue` - Revenue stats
- ✅ `GET /api/seller/payouts` - Payout history
- ✅ `POST /api/seller/payouts/request` - Request payout

---

## 4. Admin Pages (Requires Admin Role)

### Admin Dashboard (`/admin/dashboard`)

**Purpose**: Platform overview and analytics  
**APIs Required**:

- ✅ `GET /api/admin/dashboard` - Dashboard stats
- ✅ `GET /api/admin/analytics/dashboard` - Analytics overview

---

### Admin Users (`/admin/users`)

**Purpose**: Manage all users  
**APIs Required**:

- ✅ `GET /api/admin/users` - List users
- ✅ `GET /api/admin/users/[id]` - Get user
- ✅ `PATCH /api/admin/users/[id]` - Update user
- ✅ `DELETE /api/admin/users/[id]` - Delete user
- ⚠️ `POST /api/admin/users/bulk` - Bulk actions

**Bulk Actions**: make-seller, make-user, ban, unban, delete, export

---

### Admin Products (`/admin/products`)

**Purpose**: Manage all products  
**APIs Required**:

- ✅ `GET /api/admin/products` - List all products
- ✅ `PATCH /api/admin/products/[id]` - Update product
- ✅ `DELETE /api/admin/products/[id]` - Delete product
- ⚠️ `POST /api/admin/products/bulk` - Bulk actions

**Bulk Actions**: approve, reject, feature, unfeature, delete

---

### Admin Auctions (`/admin/auctions`)

**Purpose**: Manage all auctions  
**APIs Required**:

- ✅ `GET /api/admin/auctions` - List all auctions
- ✅ `PATCH /api/admin/auctions/[id]` - Update auction
- ✅ `DELETE /api/admin/auctions/[id]` - Delete auction
- ⚠️ `POST /api/admin/auctions/bulk` - Bulk actions

---

### Admin Orders (`/admin/orders`)

**Purpose**: Manage all orders  
**APIs Required**:

- ✅ `GET /api/admin/orders` - List all orders
- ✅ `GET /api/admin/orders/[id]` - Get order
- ✅ `PATCH /api/admin/orders/[id]` - Update order
- ⚠️ `POST /api/admin/orders/bulk` - Bulk actions

---

### Admin Shops (`/admin/shops`)

**Purpose**: Manage all shops  
**APIs Required**:

- ✅ `GET /api/admin/shops` - List all shops
- ✅ `PATCH /api/admin/shops/[id]` - Update shop
- ✅ `DELETE /api/admin/shops/[id]` - Delete shop
- ⚠️ `POST /api/admin/shops/bulk` - Bulk actions

**Bulk Actions**: verify, unverify, feature, unfeature, ban, unban, delete

---

### Admin Categories (`/admin/categories`)

**Purpose**: Manage categories  
**APIs Required**:

- ✅ `GET /api/admin/categories` - List categories
- ✅ `POST /api/admin/categories` - Create category
- ✅ `PATCH /api/admin/categories/[id]` - Update category
- ✅ `DELETE /api/admin/categories/[id]` - Delete category
- ⚠️ `POST /api/admin/categories/bulk` - Bulk actions

---

### Admin Reviews (`/admin/reviews`)

**Purpose**: Moderate product/shop reviews  
**APIs Required**:

- ✅ `GET /api/admin/reviews` - List reviews
- ✅ `PATCH /api/admin/reviews/[id]` - Update review (approve/reject/flag)
- ✅ `DELETE /api/admin/reviews/[id]` - Delete review
- ⚠️ `POST /api/admin/reviews/bulk` - Bulk actions

---

### Admin Support Tickets (`/admin/tickets`)

**Purpose**: Manage support tickets  
**APIs Required**:

- ⚠️ `GET /api/admin/tickets` - List all tickets
- ⚠️ `GET /api/admin/tickets/[id]` - Get ticket
- ⚠️ `POST /api/admin/tickets/[id]/assign` - Assign ticket
- ⚠️ `POST /api/admin/tickets/[id]/reply` - Reply to ticket
- ⚠️ `POST /api/admin/tickets/[id]/escalate` - Escalate ticket
- ⚠️ `POST /api/admin/tickets/[id]/close` - Close ticket
- ⚠️ `POST /api/admin/tickets/bulk` - Bulk actions

**Status**: ⚠️ Basic structure exists, needs full implementation

---

### Admin Coupons (`/admin/coupons`)

**Purpose**: Manage platform-wide coupons  
**APIs Required**:

- ✅ `GET /api/admin/coupons` - List coupons
- ✅ `POST /api/admin/coupons` - Create coupon
- ✅ `PATCH /api/admin/coupons/[id]` - Update coupon
- ✅ `DELETE /api/admin/coupons/[id]` - Delete coupon
- ⚠️ `POST /api/admin/coupons/bulk` - Bulk actions

---

### Admin Payouts (`/admin/payouts`)

**Purpose**: Process seller payouts  
**APIs Required**:

- ✅ `GET /api/admin/payouts` - List payout requests
- ✅ `GET /api/admin/payouts/pending` - Pending payouts
- ✅ `POST /api/admin/payouts/process` - Process payout
- ✅ `PATCH /api/admin/payouts/[id]` - Update payout
- ⚠️ `POST /api/admin/payouts/bulk` - Bulk process

---

### Hero Slides (`/admin/hero-slides`)

**Purpose**: Manage homepage hero sliders  
**APIs Required**:

- ✅ `GET /api/admin/hero-slides` - List slides
- ✅ `POST /api/admin/hero-slides` - Create slide
- ✅ `PATCH /api/admin/hero-slides/[id]` - Update slide
- ✅ `DELETE /api/admin/hero-slides/[id]` - Delete slide
- ⚠️ `POST /api/admin/hero-slides/bulk` - Bulk actions

---

### Blog Management (`/admin/blog`)

**Purpose**: Manage blog posts  
**APIs Required**:

- ✅ `GET /api/admin/blog` - List posts
- ✅ `POST /api/admin/blog` - Create post
- ✅ `PATCH /api/admin/blog/[id]` - Update post
- ✅ `DELETE /api/admin/blog/[id]` - Delete post
- ⚠️ `POST /api/admin/blog/bulk` - Bulk actions

---

### Returns Management (`/admin/returns`)

**Purpose**: Manage product returns  
**APIs Required**:

- ✅ `GET /api/admin/returns` - List returns
- ✅ `GET /api/admin/returns/[id]` - Get return details
- ✅ `POST /api/admin/returns/[id]/approve` - Approve return
- ✅ `POST /api/admin/returns/[id]/reject` - Reject return
- ⚠️ `POST /api/admin/returns/bulk` - Bulk actions

---

### Test Workflow (`/admin/test-workflow`)

**Purpose**: Initialize/remove test data for testing  
**APIs Required**:

- 🔨 `POST /api/admin/test-workflow/initialize` - Create test data
- 🔨 `POST /api/admin/test-workflow/cleanup` - Remove test data
- 🔨 `GET /api/admin/test-workflow/status` - Get test data status

**Status**: 🔨 To be created

---

## 5. Authentication Pages

### Login (`/login`)

**APIs Required**:

- ✅ `POST /api/auth/login` - Login user

---

### Register (`/register`)

**APIs Required**:

- ✅ `POST /api/auth/register` - Register new user

---

### Logout (`/logout`)

**APIs Required**:

- ✅ `POST /api/auth/logout` - Logout user

---

## 6. Summary Statistics

### API Status Count

- ✅ **Working**: ~80 APIs
- ⚠️ **Partial/Needs Fixes**: ~15 APIs (mostly bulk operations)
- ❌ **Not Implemented**: ~5 APIs (addresses, enhanced support)
- 🔨 **In Progress**: ~3 APIs (test workflow)

### Pages Status Count

- ✅ **Complete**: ~40 pages
- ⚠️ **Partial**: ~10 pages
- ❌ **Missing**: ~3 pages (contact, addresses, enhanced tickets)

### Priority Fixes

1. ❌ Create user addresses page and APIs
2. ❌ Create contact page with support API
3. ⚠️ Fix all bulk operation APIs
4. ⚠️ Enhance support ticket system
5. 🔨 Create test workflow system

---

## 7. Common Issues & Solutions

### Issue: Bulk APIs not working

**Solution**: Review `/api/lib/bulk-operations.ts`, ensure proper transaction handling

### Issue: Support tickets incomplete

**Solution**: Implement full CRUD with conversation threading

### Issue: Missing user addresses

**Solution**: Create full CRUD system with default address support

---

**Document Version**: 1.0  
**Maintainer**: Development Team  
**Next Review**: Weekly during implementation phase
