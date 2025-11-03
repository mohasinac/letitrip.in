# 📋 Day 27: Integration Testing

**Date**: November 3, 2025  
**Sprint**: Sprint 6 - Testing & Launch  
**Status**: 🚧 IN PROGRESS

---

## 🎯 Objectives

### Goal

Test complete end-to-end user workflows across the API to ensure all components work together correctly.

### Time Allocation

- **Morning (3-4 hours)**: Core shopping flows (5 scenarios)
- **Afternoon (3-4 hours)**: Seller workflows (5 scenarios)
- **Evening (1-2 hours)**: Admin workflows (5 scenarios)
- **Target**: 15+ integration test scenarios

---

## 📝 Test Scenarios

### Morning: Core Shopping Flows

**Scenario 1: Complete Shopping Journey**

- [ ] Browse products (GET /api/products)
- [ ] Search products (GET /api/products?search=beyblade)
- [ ] View product details (GET /api/products/[slug])
- [ ] Add to cart (POST /api/cart)
- [ ] View cart (GET /api/cart)
- [ ] Create address (POST /api/addresses)
- [ ] Checkout (POST /api/orders/create)
- [ ] Verify order created
- [ ] Verify stock reduced

**Scenario 2: User Authentication Flow**

- [ ] Register new user (POST /api/auth/register)
- [ ] Verify email sent
- [ ] Login (Firebase Auth)
- [ ] Get current user (GET /api/auth/me)
- [ ] Update profile (PUT /api/user/profile)
- [ ] Change password (POST /api/auth/change-password)
- [ ] Logout

**Scenario 3: Address Management**

- [ ] Create first address (POST /api/addresses)
- [ ] Verify auto-default setting
- [ ] Create second address (POST /api/addresses)
- [ ] List addresses (GET /api/addresses)
- [ ] Set second as default (PUT /api/addresses/[id])
- [ ] Verify first no longer default
- [ ] Delete address (DELETE /api/addresses/[id])

**Scenario 4: Coupon Application**

- [ ] Browse products
- [ ] Add items to cart
- [ ] Apply invalid coupon (expect error)
- [ ] Apply valid coupon (POST /api/cart with coupon)
- [ ] Verify discount applied
- [ ] Complete order
- [ ] Verify coupon usage incremented

**Scenario 5: Order Tracking**

- [ ] Create order
- [ ] Track by order number (GET /api/orders/track)
- [ ] Get order details (GET /api/orders/[id])
- [ ] Verify order status
- [ ] Cancel order (POST /api/orders/[id]/cancel)
- [ ] Verify cancellation

---

### Afternoon: Seller Workflows

**Scenario 6: Seller Onboarding**

- [ ] Register as customer
- [ ] Request seller role upgrade (manual admin action)
- [ ] Create shop profile (POST /api/seller/shop)
- [ ] Verify shop created
- [ ] Update shop details (POST /api/seller/shop)

**Scenario 7: Product Management**

- [ ] Upload product image (POST /api/seller/products/media)
- [ ] Create product (POST /api/seller/products)
- [ ] Verify product created
- [ ] Update product (PUT /api/seller/products/[id])
- [ ] List own products (GET /api/seller/products)
- [ ] Delete product (DELETE /api/seller/products/[id])

**Scenario 8: Order Fulfillment**

- [ ] Customer creates order
- [ ] Seller views orders (GET /api/seller/orders)
- [ ] Seller views order details (GET /api/seller/orders/[id])
- [ ] Seller approves order (POST /api/seller/orders/[id]/approve)
- [ ] Verify order status updated
- [ ] Generate invoice (GET /api/seller/orders/[id]/invoice)

**Scenario 9: Coupon Management**

- [ ] Create coupon (POST /api/seller/coupons)
- [ ] List coupons (GET /api/seller/coupons)
- [ ] Validate coupon works
- [ ] Toggle coupon status (POST /api/seller/coupons/[id]/toggle)
- [ ] Verify coupon inactive
- [ ] Delete coupon (DELETE /api/seller/coupons/[id])

**Scenario 10: Analytics & Alerts**

- [ ] View analytics (GET /api/seller/analytics)
- [ ] Export CSV (GET /api/seller/analytics?export=csv)
- [ ] View alerts (GET /api/seller/alerts)
- [ ] Mark alert as read (POST /api/seller/alerts/[id]/read)
- [ ] Bulk mark alerts (POST /api/seller/alerts/mark-all-read)

---

### Evening: Admin Workflows

**Scenario 11: User Management**

- [ ] List all users (GET /api/admin/users)
- [ ] Search users (GET /api/admin/users/search?q=email)
- [ ] Get user details (GET /api/admin/users/[id])
- [ ] Update user role (PUT /api/admin/users/[id]/role)
- [ ] Ban user (PUT /api/admin/users/[id]/ban)
- [ ] Unban user (PUT /api/admin/users/[id]/ban)

**Scenario 12: Review Moderation**

- [ ] Customer creates review (POST /api/reviews)
- [ ] Admin lists reviews (GET /api/admin/reviews)
- [ ] Admin approves review (POST /api/reviews/[id]/approve)
- [ ] Verify review visible
- [ ] Admin rejects review (POST /api/reviews/[id]/reject)
- [ ] Verify review hidden

**Scenario 13: Product Management**

- [ ] List all products (GET /api/admin/products)
- [ ] Filter by status (GET /api/admin/products?status=draft)
- [ ] Get product stats (GET /api/admin/products/stats)
- [ ] Bulk delete products (DELETE /api/admin/products)
- [ ] Verify products deleted

**Scenario 14: Order Management**

- [ ] List all orders (GET /api/admin/orders)
- [ ] Filter by status (GET /api/admin/orders?status=pending)
- [ ] Get order stats (GET /api/admin/orders/stats)
- [ ] Cancel order (POST /api/admin/orders/[id]/cancel)
- [ ] Verify refund processed

**Scenario 15: System Settings**

- [ ] Get site settings (GET /api/admin/settings)
- [ ] Update settings (PUT /api/admin/settings)
- [ ] Get hero settings (GET /api/admin/hero-settings)
- [ ] Update hero products (POST /api/admin/hero-settings)
- [ ] Get theme settings (GET /api/admin/theme-settings)

---

## 🛠️ Setup

### Prerequisites

- All 145 unit tests passing ✅
- Testing infrastructure ready ✅
- Mock data available ✅
- Supertest installed ✅

### Integration Test Structure

```
__tests__/
  integration/
    flows/
      shopping.flow.test.ts
      authentication.flow.test.ts
      seller.flow.test.ts
      admin.flow.test.ts
    routes/
      products.route.test.ts
      orders.route.test.ts
      users.route.test.ts
```

---

## 📊 Progress Tracking

### Morning Session (Core Shopping) ✅ COMPLETE

- [x] Scenario 1: Complete Shopping Journey (8 tests)
- [x] Scenario 2: User Authentication Flow (5 tests)
- [x] Scenario 3: Address Management (5 tests)
- [x] Scenario 4: Coupon Application (5 tests)
- [x] Scenario 5: Order Tracking (5 tests)
- [x] End-to-End Validation (3 tests)

**Total: 31 integration tests passing** ✅

### Afternoon Session (Seller Workflows)

- [ ] Scenario 6: Seller Onboarding
- [ ] Scenario 7: Product Management
- [ ] Scenario 8: Order Fulfillment
- [ ] Scenario 9: Coupon Management
- [ ] Scenario 10: Analytics & Alerts

### Evening Session (Admin Workflows)

- [ ] Scenario 11: User Management
- [ ] Scenario 12: Review Moderation
- [ ] Scenario 13: Product Management
- [ ] Scenario 14: Order Management
- [ ] Scenario 15: System Settings

---

## 🎯 Success Criteria

- [ ] All 15 scenarios passing
- [ ] All API endpoints tested
- [ ] RBAC verified in real requests
- [ ] Error scenarios covered
- [ ] Response times acceptable (< 500ms)
- [ ] No memory leaks in test suite

---

## 📝 Notes

- Use Supertest for HTTP assertions
- Test with real Firebase Admin SDK (test project)
- Mock external services (Razorpay, PayPal)
- Clean database between scenarios
- Use transaction IDs to track flow
- Verify side effects (emails, stock changes)

---

**Status**: Ready to begin Morning Session - Core Shopping Flows

**Next**: Create shopping.flow.test.ts with Scenario 1-5
