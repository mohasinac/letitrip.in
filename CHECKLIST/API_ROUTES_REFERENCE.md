# API Routes Reference

**Last Updated:** November 8, 2025  
**Total Routes:** 68

---

## 🔐 Authentication Routes

### `/api/auth/login` - POST

- User login with email/password
- Returns session token

### `/api/auth/logout` - POST

- Logout current user
- Invalidates session

### `/api/auth/register` - POST

- Register new user account
- Creates user profile

### `/api/auth/me` - GET

- Get current authenticated user
- Returns user profile

### `/api/auth/sessions` - GET, POST, DELETE

- Manage user sessions
- Session validation

---

## 👥 Admin Routes

### `/api/admin/users` - GET, POST, PATCH, DELETE

- User management (admin only)
- List, create, update, delete users

### `/api/admin/hero-slides` - GET, POST

- Homepage hero slider management
- Create/list hero slides

### `/api/admin/hero-slides/[id]` - GET, PATCH, DELETE

- Individual hero slide operations
- Update/delete hero slides

### `/api/admin/hero-slides/reorder` - PATCH

- Reorder hero slides
- Update display order

### `/api/admin/featured-sections` - GET, POST

- Featured sections management
- Create/list featured sections

### `/api/admin/featured-sections/[id]` - GET, PATCH, DELETE

- Individual featured section operations
- Update/delete sections

### `/api/admin/featured-sections/reorder` - PATCH

- Reorder featured sections
- Update display order

---

## 🏪 Shops Routes

### `/api/shops` - GET, POST

- **GET**: List all shops (filtered by role)
  - Sellers see own shops
  - Admins see all shops
  - Supports filters: verified, featured, banned, search, categories, minRating
- **POST**: Create new shop (seller/admin)

### `/api/shops/[slug]` - GET, PATCH, DELETE

- **GET**: Get shop details by slug
- **PATCH**: Update shop (owner/admin)
- **DELETE**: Delete shop by slug (owner/admin)
  - ⚠️ **IMPORTANT**: Requires `slug` parameter, not `id`
  - Prevents deletion if active products exist
  - Prevents deletion if pending orders exist

### `/api/shops/[slug]/stats` - GET

- Get shop statistics
- Sales, revenue, orders, products count

### `/api/shops/validate-slug` - POST

- Validate shop slug availability
- Check slug uniqueness

---

## 📦 Products Routes

### `/api/products` - GET, POST

- **GET**: List products with filters
  - Supports: category, price range, rating, search, seller
- **POST**: Create new product (seller/admin)

### `/api/products/[slug]` - GET, PATCH, DELETE

- **GET**: Get product details by slug
- **PATCH**: Update product (owner/admin)
- **DELETE**: Delete product (owner/admin)

### `/api/products/[slug]/variants` - GET, POST

- Manage product variants
- List/create size, color variants

### `/api/products/[slug]/view` - POST

- Track product view
- Increment view count

### `/api/products/[slug]/reviews` - GET

- Get product reviews
- Filtered by rating, sort options

### `/api/products/[slug]/similar` - GET

- Get similar products
- Based on category, tags

### `/api/products/[slug]/seller-items` - GET

- Get other items from same seller
- Shop's product catalog

### `/api/products/validate-slug` - POST

- Validate product slug availability
- Check slug uniqueness

---

## 🎯 Auctions Routes

### `/api/auctions` - GET, POST

- **GET**: List auctions with filters
  - Supports: status, category, price range
- **POST**: Create new auction (seller/admin)

### `/api/auctions/[id]` - GET, PATCH, DELETE

- **GET**: Get auction details by ID
- **PATCH**: Update auction (owner/admin)
- **DELETE**: Delete auction (owner/admin)

### `/api/auctions/[id]/bid` - POST

- Place bid on auction
- Validates bid amount rules

### `/api/auctions/[id]/watch` - POST, DELETE

- **POST**: Add to watchlist
- **DELETE**: Remove from watchlist

### `/api/auctions/[id]/feature` - PATCH

- Feature/unfeature auction (admin only)
- Homepage display control

### `/api/auctions/[id]/similar` - GET

- Get similar auctions
- Based on category

### `/api/auctions/[id]/seller-items` - GET

- Get other auctions from same seller

### `/api/auctions/live` - GET

- Get currently live auctions
- Real-time active auctions

### `/api/auctions/featured` - GET

- Get featured auctions
- Homepage display

### `/api/auctions/watchlist` - GET

- Get user's watchlist
- Saved auctions

### `/api/auctions/my-bids` - GET

- Get user's bid history
- Active and past bids

### `/api/auctions/won` - GET

- Get auctions won by user
- Winning bids

### `/api/auctions/cron` - POST

- Auction status cron job
- Auto-close expired auctions

### `/api/auctions/validate-slug` - POST

- Validate auction slug availability

---

## 🛒 Cart Routes

### `/api/cart` - GET, POST, DELETE

- **GET**: Get user's cart items
- **POST**: Add item to cart
- **DELETE**: Clear entire cart

### `/api/cart/[itemId]` - PATCH, DELETE

- **PATCH**: Update cart item quantity
- **DELETE**: Remove single item from cart

### `/api/cart/coupon` - POST, DELETE

- **POST**: Apply coupon to cart
- **DELETE**: Remove applied coupon

---

## 💳 Checkout Routes

### `/api/checkout/create-order` - POST

- Create order from cart
- Initialize payment

### `/api/checkout/verify-payment` - POST

- Verify payment status
- Complete order after payment

---

## 📋 Orders Routes

### `/api/orders` - GET, POST

- **GET**: List orders (user sees own, admin sees all)
- **POST**: Create order (usually via checkout)

### `/api/orders/[id]` - GET, PATCH, DELETE

- **GET**: Get order details
- **PATCH**: Update order status (seller/admin)
- **DELETE**: Cancel order (conditions apply)

### `/api/orders/[id]/cancel` - POST

- Cancel order
- Refund if paid

### `/api/orders/[id]/track` - GET

- Track order shipment
- Shipping status updates

### `/api/orders/[id]/shipment` - POST, PATCH

- **POST**: Create shipment
- **PATCH**: Update tracking info

### `/api/orders/[id]/invoice` - GET

- Generate order invoice PDF
- Download invoice

---

## 🔁 Returns Routes

### `/api/returns` - GET, POST

- **GET**: List returns (role-filtered)
- **POST**: Create return request

### `/api/returns/[id]` - GET, PATCH, DELETE

- **GET**: Get return details
- **PATCH**: Update return status
- **DELETE**: Cancel return request

### `/api/returns/[id]/approve` - POST

- Approve return request (seller/admin)
- Initiate refund process

### `/api/returns/[id]/resolve` - POST

- Resolve return (admin)
- Mark as complete

### `/api/returns/[id]/refund` - POST

- Process refund (admin)
- Issue payment reversal

### `/api/returns/[id]/media` - POST, DELETE

- **POST**: Upload return evidence photos
- **DELETE**: Remove media

---

## ⭐ Reviews Routes

### `/api/reviews` - GET, POST

- **GET**: List reviews with stats
  - Pagination, filtering, sorting
  - Returns average rating, distribution
- **POST**: Create product review
  - 1-5 stars, title, comment, photos

### `/api/reviews/[id]` - GET, PATCH, DELETE

- **GET**: Get single review
- **PATCH**: Update review (author only)
- **DELETE**: Delete review (author/admin)

### `/api/reviews/[id]/helpful` - POST

- Mark review as helpful
- Vote system (prevents duplicates)

---

## ❤️ Favorites Routes

### `/api/favorites` - GET, POST, DELETE

- **GET**: List user's favorite products
- **POST**: Add to favorites
- **DELETE**: Clear all favorites

### `/api/favorites/[productId]` - POST, DELETE

- **POST**: Add specific product to favorites
- **DELETE**: Remove from favorites

---

## 🎟️ Coupons Routes

### `/api/coupons` - GET, POST

- **GET**: List coupons (role-filtered)
  - Sellers see own coupons
  - Admins see all
- **POST**: Create coupon (seller/admin)

### `/api/coupons/[code]` - GET, PATCH, DELETE

- **GET**: Get coupon details
- **PATCH**: Update coupon
- **DELETE**: Delete coupon

### `/api/coupons/validate-code` - POST

- Validate coupon code
- Check expiry, usage limits, conditions

---

## 📂 Categories Routes

### `/api/categories` - GET, POST

- **GET**: List all categories
- **POST**: Create category (admin only)

### `/api/categories/[slug]` - GET, PATCH, DELETE

- **GET**: Get category by slug
- **PATCH**: Update category (admin)
- **DELETE**: Delete category (admin)

### `/api/categories/tree` - GET

- Get hierarchical category tree
- Parent-child relationships

### `/api/categories/leaves` - GET

- Get leaf categories only
- No children (for filtering)

### `/api/categories/featured` - GET

- Get featured categories
- Homepage display

### `/api/categories/homepage` - GET

- Get homepage categories
- Show on home flag

### `/api/categories/search` - GET

- Search categories
- By name, description

### `/api/categories/reorder` - PATCH

- Reorder categories (admin)
- Update display order

### `/api/categories/validate-slug` - POST

- Validate category slug

---

## 🔍 Search Route

### `/api/search` - GET

- Global search across products, shops, auctions
- Full-text search with filters

---

## 📊 Analytics Route

### `/api/analytics` - GET

- Get analytics data
- Sales, traffic, revenue metrics

---

## 📤 Media Route

### `/api/media/upload` - POST

- Upload media files (images, documents)
- Returns media URL
- Used by products, shops, reviews

---

## 🏥 Health Route

### `/api/health` - GET

- Health check endpoint
- Returns service status

---

## 🔒 Protected Route

### `/api/protected` - GET

- Test authentication
- Example protected endpoint

---

## 📚 Swagger Route

### `/api/swagger` - GET

- API documentation
- OpenAPI/Swagger UI

---

## 🐛 Common Issues & Fixes

### Issue: Shop Delete Returns 404

**Problem:** Passing `shop.id` (Firebase document ID) instead of `shop.slug`

**Wrong:**

```typescript
await shopsService.delete(shop.id); // ❌ "qtMj0yqwvYrUmxjPU4qw"
```

**Correct:**

```typescript
await shopsService.delete(shop.slug); // ✅ "techstore-india"
```

**Fix Applied:**

```typescript
const handleDelete = async (shopId: string) => {
  const shopToDelete = shops.find((shop) => shop.id === shopId);
  if (!shopToDelete) return;

  await shopsService.delete(shopToDelete.slug); // Use slug, not ID
  setShops(shops.filter((shop) => shop.id !== shopId));
  setDeleteShopId(null);
};
```

---

## 📝 Route Naming Conventions

### URL Parameters

- `[slug]` - Human-readable identifier (shops, products, categories)
- `[id]` - Firebase document ID (orders, auctions, reviews)
- `[code]` - Unique code (coupons)
- `[itemId]` - Cart item identifier

### HTTP Methods

- **GET** - Retrieve data (list or single)
- **POST** - Create new resource
- **PATCH** - Update existing resource (partial)
- **DELETE** - Remove resource

### Access Control

- **Public** - No authentication required
- **User** - Requires authenticated user
- **Seller** - Requires seller role
- **Admin** - Requires admin role
- **Owner** - Requires resource owner or admin

---

## 🔄 API Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## ✅ Route Status

| Feature        | Routes | Status      |
| -------------- | ------ | ----------- |
| Authentication | 5      | ✅ Complete |
| Admin          | 8      | ✅ Complete |
| Shops          | 3      | ✅ Complete |
| Products       | 8      | ✅ Complete |
| Auctions       | 15     | ✅ Complete |
| Cart           | 3      | ✅ Complete |
| Checkout       | 2      | ✅ Complete |
| Orders         | 6      | ✅ Complete |
| Returns        | 6      | ✅ Complete |
| Reviews        | 3      | ✅ Complete |
| Favorites      | 2      | ✅ Complete |
| Coupons        | 3      | ✅ Complete |
| Categories     | 10     | ✅ Complete |
| Search         | 1      | ✅ Complete |
| Analytics      | 1      | ✅ Complete |
| Media          | 1      | ✅ Complete |
| Misc           | 3      | ✅ Complete |

**Total:** 68 routes - All complete ✅

---

**Last Reviewed:** November 8, 2025  
**Project Completion:** 84%
