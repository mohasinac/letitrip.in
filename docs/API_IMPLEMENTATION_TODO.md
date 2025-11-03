# 🎯 API Implementation TODO - Complete Checklist

**Date:** November 3, 2025  
**Total API Routes:** 103 routes  
**Status:** Ready to implement MVC pattern

---

## 📊 Quick Stats

```
Total Routes:        103
├── Core APIs:        18 (Products, Orders, Users, Categories, Reviews)
├── Auth & User:      10 (Authentication, Profile, Addresses)
├── Payments:          4 (Razorpay, PayPal)
├── Admin:            35 (Management, Analytics, Bulk Operations)
├── Seller:           24 (Seller Dashboard, Orders, Products, Analytics)
├── Game:             10 (Arenas, Beyblades)
├── System:            7 (Search, Contact, Health, Storage, Cart)
└── Utility:           5 (Upload, Errors, Consent, Hero Banner)
```

---

## 🏗️ Phase 1: Create Core MVC Layer (Priority 1)

### 1.1 Products MVC ⭐ START HERE

**Files to Create:**

```
✅ _lib/validators/product.validator.ts (EXISTS)
❌ _lib/models/product.model.ts (TODO)
❌ _lib/controllers/product.controller.ts (TODO)
```

**Routes to Refactor (2):**

- [ ] `products/route.ts` - GET (list), POST (create)
- [ ] `products/[slug]/route.ts` - GET (by slug), PUT (update), DELETE

**Controller Methods Needed:**

```typescript
class ProductController {
  // Public
  async getAllProducts(filters: ProductFilters);
  async getProductBySlug(slug: string);
  async searchProducts(query: string, filters?: ProductFilters);

  // Seller/Admin
  async createProduct(data: CreateProductInput, userId: string, role: string);
  async updateProduct(
    slug: string,
    data: UpdateProductInput,
    userId: string,
    role: string
  );
  async deleteProduct(slug: string, userId: string, role: string);
  async toggleProductStatus(
    slug: string,
    isActive: boolean,
    userId: string,
    role: string
  );

  // Admin only
  async approveProduct(slug: string, userId: string);
  async bulkUpdateProducts(updates: BulkUpdateInput[], userId: string);
}
```

---

### 1.2 Orders MVC

**Files to Create:**

```
✅ _lib/validators/order.validator.ts (EXISTS)
❌ _lib/models/order.model.ts (TODO)
❌ _lib/controllers/order.controller.ts (TODO)
```

**Routes to Refactor (5):**

- [ ] `orders/route.ts` - GET (list), POST (create)
- [ ] `orders/[id]/route.ts` - GET (by ID), PUT (update)
- [ ] `orders/[id]/cancel/route.ts` - POST (cancel order)
- [ ] `orders/create/route.ts` - POST (create order)
- [ ] `orders/track/route.ts` - GET (track order)

**Controller Methods Needed:**

```typescript
class OrderController {
  // User
  async createOrder(data: CreateOrderInput, userId: string);
  async getUserOrders(userId: string, filters?: OrderFilters);
  async getOrderById(orderId: string, userId: string);
  async cancelOrder(orderId: string, reason: string, userId: string);
  async trackOrder(orderNumber: string, email: string);

  // Seller
  async getSellerOrders(sellerId: string, filters?: OrderFilters);
  async updateOrderStatus(orderId: string, status: string, sellerId: string);

  // Admin
  async getAllOrders(filters?: OrderFilters);
  async updatePaymentStatus(orderId: string, status: string, adminId: string);
}
```

---

### 1.3 Users MVC

**Files to Create:**

```
✅ _lib/validators/user.validator.ts (EXISTS)
❌ _lib/models/user.model.ts (TODO)
❌ _lib/controllers/user.controller.ts (TODO)
```

**Routes to Refactor (3):**

- [ ] `user/profile/route.ts` - GET, PUT (profile)
- [ ] `user/account/route.ts` - GET, PUT (account settings)
- [ ] `user/preferences/route.ts` - GET, PUT (preferences)

**Controller Methods Needed:**

```typescript
class UserController {
  // User
  async getUserProfile(userId: string);
  async updateUserProfile(userId: string, data: UpdateProfileInput);
  async getAccountSettings(userId: string);
  async updateAccountSettings(userId: string, data: UpdateAccountInput);
  async getUserPreferences(userId: string);
  async updateUserPreferences(userId: string, data: UpdatePreferencesInput);
  async deleteAccount(userId: string);

  // Admin
  async getAllUsers(filters?: UserFilters);
  async getUserById(targetUserId: string, adminId: string);
  async updateUserRole(targetUserId: string, role: string, adminId: string);
  async banUser(targetUserId: string, reason: string, adminId: string);
  async searchUsers(query: string);
}
```

---

### 1.4 Categories MVC

**Files to Create:**

```
✅ _lib/validators/category.validator.ts (EXISTS)
❌ _lib/models/category.model.ts (TODO)
❌ _lib/controllers/category.controller.ts (TODO)
```

**Routes to Refactor (2):**

- [ ] `categories/route.ts` - GET (list), POST (create - admin)
- [ ] `categories/[slug]/route.ts` - GET (by slug), PUT, DELETE (admin)

**Controller Methods Needed:**

```typescript
class CategoryController {
  // Public
  async getAllCategories(filters?: CategoryFilters);
  async getCategoryBySlug(slug: string);
  async getCategoryTree();
  async getLeafCategories();

  // Admin
  async createCategory(data: CreateCategoryInput, adminId: string);
  async updateCategory(
    slug: string,
    data: UpdateCategoryInput,
    adminId: string
  );
  async deleteCategory(slug: string, adminId: string);
  async batchUpdateCategories(updates: BatchCategoryUpdate[], adminId: string);
}
```

---

### 1.5 Reviews MVC

**Files to Create:**

```
✅ _lib/validators/review.validator.ts (EXISTS)
❌ _lib/models/review.model.ts (TODO)
❌ _lib/controllers/review.controller.ts (TODO)
```

**Routes to Refactor (Currently missing - need to check if they exist):**

- [ ] Create `reviews/route.ts` - GET (list), POST (create)
- [ ] Create `reviews/[id]/route.ts` - GET, PUT, DELETE

**Controller Methods Needed:**

```typescript
class ReviewController {
  // User
  async createReview(data: CreateReviewInput, userId: string);
  async updateReview(reviewId: string, data: UpdateReviewInput, userId: string);
  async deleteReview(reviewId: string, userId: string);

  // Public
  async getProductReviews(productId: string, filters?: ReviewFilters);
  async getReviewById(reviewId: string);

  // Admin
  async getAllReviews(filters?: ReviewFilters);
  async moderateReview(
    reviewId: string,
    action: "approve" | "reject",
    adminId: string
  );
}
```

---

## 🔐 Phase 2: Authentication & Authorization (Priority 2)

### 2.1 Auth Routes (6 routes)

**Files to Create:**

```
❌ _lib/models/auth.model.ts (TODO)
❌ _lib/controllers/auth.controller.ts (TODO)
```

**Routes to Refactor:**

- [ ] `auth/register/route.ts` - POST (register new user)
- [ ] `auth/send-otp/route.ts` - POST (send OTP)
- [ ] `auth/verify-otp/route.ts` - POST (verify OTP)
- [ ] `auth/change-password/route.ts` - POST (change password)
- [ ] `auth/delete-account/route.ts` - DELETE (delete account)
- [ ] `auth/me/route.ts` - GET (current user)

**Middleware:**

```typescript
✅ Already exists in _lib/auth/
- middleware.ts
- api-middleware.ts
- firebase-api-auth.ts
- jwt.ts
- roles.ts
- cookies.ts
- cookie-session.ts
```

---

### 2.2 Addresses Routes (2 routes)

**Files to Create:**

```
❌ _lib/validators/address.validator.ts (TODO)
❌ _lib/models/address.model.ts (TODO)
❌ _lib/controllers/address.controller.ts (TODO)
```

**Routes to Refactor:**

- [ ] `addresses/route.ts` - GET (list), POST (create)
- [ ] `addresses/[id]/route.ts` - GET, PUT, DELETE

---

## 💳 Phase 3: Payments Integration (Priority 3)

### 3.1 Payment Routes (4 routes)

**Files:**

```
✅ _lib/validators/payment.validator.ts (EXISTS)
✅ _lib/payment/razorpay-utils.ts (EXISTS)
✅ _lib/payment/paypal-utils.ts (EXISTS)
❌ _lib/models/payment.model.ts (TODO)
❌ _lib/controllers/payment.controller.ts (TODO)
```

**Routes to Refactor:**

- [ ] `payment/razorpay/create-order/route.ts` - POST
- [ ] `payment/razorpay/verify/route.ts` - POST
- [ ] `payment/paypal/create-order/route.ts` - POST
- [ ] `payment/paypal/capture/route.ts` - POST

---

## 👨‍💼 Phase 4: Admin Panel (Priority 4)

### 4.1 Admin Product Management (2 routes)

- [ ] `admin/products/route.ts` - GET (list with filters)
- [ ] `admin/products/stats/route.ts` - GET (statistics)

### 4.2 Admin Order Management (3 routes)

- [ ] `admin/orders/route.ts` - GET (all orders)
- [ ] `admin/orders/[id]/cancel/route.ts` - POST (cancel order)
- [ ] `admin/orders/stats/route.ts` - GET (statistics)

### 4.3 Admin User Management (6 routes)

- [ ] `admin/users/route.ts` - GET (all users)
- [ ] `admin/users/search/route.ts` - GET (search users)
- [ ] `admin/users/[userId]/route.ts` - GET, PUT, DELETE
- [ ] `admin/users/[userId]/role/route.ts` - PUT (change role)
- [ ] `admin/users/[userId]/ban/route.ts` - POST (ban user)
- [ ] `admin/users/[userId]/create-document/route.ts` - POST

### 4.4 Admin Category Management (2 routes)

- [ ] `admin/categories/route.ts` - GET, POST, PUT, DELETE
- [ ] `admin/categories/batch-update/route.ts` - POST (bulk update)

### 4.5 Admin Coupon Management (2 routes)

- [ ] `admin/coupons/route.ts` - GET, POST, PUT, DELETE
- [ ] `admin/coupons/[id]/toggle/route.ts` - POST (enable/disable)

### 4.6 Admin Shipment Management (3 routes)

- [ ] `admin/shipments/route.ts` - GET (all shipments)
- [ ] `admin/shipments/[id]/track/route.ts` - GET (tracking)
- [ ] `admin/shipments/[id]/cancel/route.ts` - POST (cancel)

### 4.7 Admin Sales Management (2 routes)

- [ ] `admin/sales/route.ts` - GET, POST
- [ ] `admin/sales/[id]/toggle/route.ts` - POST (enable/disable)

### 4.8 Admin Reviews Management (1 route)

- [ ] `admin/reviews/route.ts` - GET (moderate reviews)

### 4.9 Admin Settings & Config (5 routes)

- [ ] `admin/settings/route.ts` - GET, PUT (site settings)
- [ ] `admin/theme-settings/route.ts` - GET, PUT (theme)
- [ ] `admin/hero-settings/route.ts` - GET, PUT (hero section)
- [ ] `admin/hero-slides/route.ts` - GET, POST, PUT, DELETE
- [ ] `admin/notifications/route.ts` - GET, POST

### 4.10 Admin Support (2 routes)

- [ ] `admin/support/route.ts` - GET (support tickets)
- [ ] `admin/support/stats/route.ts` - GET (statistics)

### 4.11 Admin Bulk Operations (3 routes)

- [ ] `admin/bulk/route.ts` - POST (bulk operations)
- [ ] `admin/bulk/[id]/route.ts` - GET (bulk job status)
- [ ] `admin/bulk/export/route.ts` - GET (export data)

### 4.12 Admin Migration (1 route)

- [ ] `admin/migrate-products/route.ts` - POST (data migration)

---

## 🏪 Phase 5: Seller Dashboard (Priority 5)

### 5.1 Seller Product Management (4 routes)

- [ ] `seller/products/route.ts` - GET, POST
- [ ] `seller/products/[id]/route.ts` - GET, PUT, DELETE
- [ ] `seller/products/media/route.ts` - POST (upload media)
- [ ] `seller/products/categories/leaf/route.ts` - GET (leaf categories)

### 5.2 Seller Order Management (6 routes)

- [ ] `seller/orders/route.ts` - GET (seller's orders)
- [ ] `seller/orders/[id]/route.ts` - GET (order details)
- [ ] `seller/orders/[id]/approve/route.ts` - POST
- [ ] `seller/orders/[id]/reject/route.ts` - POST
- [ ] `seller/orders/[id]/cancel/route.ts` - POST
- [ ] `seller/orders/[id]/invoice/route.ts` - GET (generate invoice)

### 5.3 Seller Shipment Management (6 routes)

- [ ] `seller/shipments/route.ts` - GET, POST
- [ ] `seller/shipments/[id]/route.ts` - GET, PUT
- [ ] `seller/shipments/[id]/label/route.ts` - GET (shipping label)
- [ ] `seller/shipments/[id]/track/route.ts` - GET (tracking)
- [ ] `seller/shipments/[id]/cancel/route.ts` - POST
- [ ] `seller/shipments/bulk-manifest/route.ts` - POST (bulk manifest)

### 5.4 Seller Coupon Management (4 routes)

- [ ] `seller/coupons/route.ts` - GET, POST
- [ ] `seller/coupons/[id]/route.ts` - GET, PUT, DELETE
- [ ] `seller/coupons/[id]/toggle/route.ts` - POST
- [ ] `seller/coupons/validate/route.ts` - POST (validate coupon)

### 5.5 Seller Sales/Promotions (3 routes)

- [ ] `seller/sales/route.ts` - GET, POST
- [ ] `seller/sales/[id]/route.ts` - GET, PUT, DELETE
- [ ] `seller/sales/[id]/toggle/route.ts` - POST

### 5.6 Seller Alerts/Notifications (4 routes)

- [ ] `seller/alerts/route.ts` - GET (notifications)
- [ ] `seller/alerts/[id]/route.ts` - GET (single alert)
- [ ] `seller/alerts/[id]/read/route.ts` - POST (mark as read)
- [ ] `seller/alerts/bulk-read/route.ts` - POST (mark multiple)

### 5.7 Seller Analytics (2 routes)

- [ ] `seller/analytics/overview/route.ts` - GET (dashboard stats)
- [ ] `seller/analytics/export/route.ts` - GET (export report)

### 5.8 Seller Shop Settings (1 route)

- [ ] `seller/shop/route.ts` - GET, PUT (shop profile)

---

## 🎮 Phase 6: Game Features (Priority 6)

### 6.1 Arenas (4 routes)

**Files to Create:**

```
❌ _lib/validators/arena.validator.ts (TODO)
❌ _lib/models/arena.model.ts (TODO)
❌ _lib/controllers/arena.controller.ts (TODO)
```

**Routes:**

- [ ] `arenas/route.ts` - GET, POST
- [ ] `arenas/[id]/route.ts` - GET, PUT, DELETE
- [ ] `arenas/[id]/set-default/route.ts` - POST
- [ ] `arenas/init/route.ts` - POST (initialize)

### 6.2 Beyblades (5 routes)

**Files to Create:**

```
❌ _lib/validators/beyblade.validator.ts (TODO)
❌ _lib/models/beyblade.model.ts (TODO)
❌ _lib/controllers/beyblade.controller.ts (TODO)
```

**Routes:**

- [ ] `beyblades/route.ts` - GET, POST
- [ ] `beyblades/[id]/route.ts` - GET, PUT, DELETE
- [ ] `beyblades/init/route.ts` - POST (initialize)
- [ ] `beyblades/upload-image/route.ts` - POST
- [ ] `beyblades/svg/[filename]/route.ts` - GET (SVG assets)

---

## 🛠️ Phase 7: System & Utilities (Priority 7)

### 7.1 Storage/Upload (3 routes)

**Files:**

```
✅ _lib/validators/storage.validator.ts (EXISTS)
✅ _lib/models/storage.model.ts (EXISTS)
✅ _lib/controllers/storage.controller.ts (EXISTS)
```

**Routes to Refactor:**

- [ ] `storage/upload/route.ts` - POST (upload files)
- [ ] `storage/get/route.ts` - GET (get file)
- [ ] `upload/route.ts` - POST (legacy upload - can be removed?)

### 7.2 Search & Discovery (1 route)

**Files to Create:**

```
✅ _lib/validators/system.validator.ts (EXISTS - has searchQuerySchema)
❌ _lib/models/search.model.ts (TODO)
❌ _lib/controllers/search.controller.ts (TODO)
```

**Routes:**

- [ ] `search/route.ts` - GET (global search)

### 7.3 Contact & Support (1 route)

**Files:**

```
✅ _lib/validators/contact.validator.ts (EXISTS)
❌ _lib/models/contact.model.ts (TODO)
❌ _lib/controllers/contact.controller.ts (TODO)
```

**Routes:**

- [ ] `contact/route.ts` - POST (contact form)

### 7.4 System Utilities (4 routes)

- [ ] `health/route.ts` - GET (health check)
- [ ] `errors/route.ts` - POST (error logging)
- [ ] `consent/route.ts` - GET, POST (cookie consent)
- [ ] `hero-banner/route.ts` - GET, POST (hero banner preferences)
- [ ] `cart/route.ts` - GET, POST, PUT, DELETE (shopping cart)

---

## 📋 Implementation Checklist by Phase

### ✅ Completed

- [x] Move all backend files to `src/app/api/_lib/`
- [x] Create middleware (error-handler, logger, rate-limiter)
- [x] Create 9 validators
- [x] Create storage MVC (model, controller)
- [x] Create documentation

### 🔄 Phase 1: Core MVC (In Progress)

- [ ] **1.1 Products MVC** ⭐ START HERE
  - [ ] Create `product.model.ts`
  - [ ] Create `product.controller.ts`
  - [ ] Refactor `products/route.ts`
  - [ ] Refactor `products/[slug]/route.ts`
  - [ ] Test all product endpoints
- [ ] **1.2 Orders MVC**
  - [ ] Create `order.model.ts`
  - [ ] Create `order.controller.ts`
  - [ ] Refactor 5 order routes
  - [ ] Test all order endpoints
- [ ] **1.3 Users MVC**
  - [ ] Create `user.model.ts`
  - [ ] Create `user.controller.ts`
  - [ ] Refactor 3 user routes
  - [ ] Test all user endpoints
- [ ] **1.4 Categories MVC**
  - [ ] Create `category.model.ts`
  - [ ] Create `category.controller.ts`
  - [ ] Refactor 2 category routes
  - [ ] Test all category endpoints
- [ ] **1.5 Reviews MVC**
  - [ ] Create `review.model.ts`
  - [ ] Create `review.controller.ts`
  - [ ] Create/refactor review routes
  - [ ] Test all review endpoints

### ⏳ Phase 2: Auth & User Features

- [ ] Create `auth.model.ts` and `auth.controller.ts`
- [ ] Refactor 6 auth routes
- [ ] Create `address.validator.ts`, `address.model.ts`, `address.controller.ts`
- [ ] Refactor 2 address routes
- [ ] Test authentication flow

### ⏳ Phase 3: Payments

- [ ] Create `payment.model.ts` and `payment.controller.ts`
- [ ] Refactor 4 payment routes
- [ ] Test payment integration

### ⏳ Phase 4: Admin Panel

- [ ] Refactor 35 admin routes
- [ ] Add proper RBAC checks
- [ ] Test admin features

### ⏳ Phase 5: Seller Dashboard

- [ ] Refactor 24 seller routes
- [ ] Add seller permission checks
- [ ] Test seller features

### ⏳ Phase 6: Game Features

- [ ] Create arena and beyblade MVC
- [ ] Refactor 9 game routes
- [ ] Test game features

### ⏳ Phase 7: System Utilities

- [ ] Refactor search, contact, cart routes
- [ ] Test system features

---

## 🎯 Immediate Next Steps (Week 1)

### Day 1: Products MVC

1. Create `_lib/models/product.model.ts`

   - Study `storage.model.ts` pattern
   - Implement CRUD operations
   - Add search and filter methods

2. Create `_lib/controllers/product.controller.ts`

   - Study `storage.controller.ts` pattern
   - Implement business logic
   - Add RBAC checks

3. Refactor `products/route.ts`
   - Add middleware (withErrorHandler, withLogging, withRateLimit)
   - Use validator
   - Call controller methods

### Day 2: Orders MVC

1. Create `_lib/models/order.model.ts`
2. Create `_lib/controllers/order.controller.ts`
3. Refactor 5 order routes

### Day 3: Users MVC

1. Create `_lib/models/user.model.ts`
2. Create `_lib/controllers/user.controller.ts`
3. Refactor 3 user routes

### Day 4: Categories & Reviews

1. Create category MVC
2. Create review MVC
3. Test core features

### Day 5: Testing & Documentation

1. Test all core endpoints
2. Fix bugs
3. Update documentation

---

## 📊 Progress Tracking

```
Total Routes: 103
├── Completed:   1 (upload with storage controller)
├── In Progress: 0
└── Remaining:  102

Total MVC Sets: 15
├── Completed:   1 (storage)
├── In Progress: 0
└── Remaining:  14
```

---

## 📖 Reference Documents

1. **NEW_ARCHITECTURE_COMPLETE.md** - Complete architecture guide
2. **CLEAN_API_SUMMARY.md** - Quick summary
3. **MIGRATION_CHECKLIST.md** - Phase-by-phase migration
4. **ARCHITECTURE_VISUAL.md** - Visual diagrams
5. **This file** - Complete implementation TODO

---

**Next Action:** Create `product.model.ts` following `storage.model.ts` pattern! 🚀
