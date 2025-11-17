# Manual Testing Guide - API Route Consolidation

**Purpose**: Comprehensive manual testing guide for validating unified API routes with RBAC  
**Date**: November 16, 2025  
**Phase**: Phase 12 - Final Testing

---

## Prerequisites

### 1. Start Development Server

```bash
npm run dev
```

Server should be running at: `http://localhost:3000`

### 2. Test User Accounts

You need accounts with different roles:

| Role     | Email            | Password               | Purpose                     |
| -------- | ---------------- | ---------------------- | --------------------------- |
| Admin    | admin@test.com   | (set in Firebase Auth) | Full access testing         |
| Seller 1 | seller1@test.com | (set in Firebase Auth) | Seller operations testing   |
| Seller 2 | seller2@test.com | (set in Firebase Auth) | Cross-seller access testing |
| User     | user@test.com    | (set in Firebase Auth) | User operations testing     |
| Guest    | (no login)       | N/A                    | Public access testing       |

### 3. Test Data Setup

Ensure Firestore has test data:

- At least 2 shops (different owners)
- At least 10 products (different shops, some published, some draft)
- At least 5 auctions (different statuses)
- At least 5 orders (different statuses, different users/shops)
- At least 5 support tickets
- At least 3 coupons
- At least 5 reviews (different statuses)
- At least 2 payouts

---

## Testing Checklist

### Phase 12.1: Integration Testing

#### Admin Role Testing

##### Hero Slides

- [ ] **GET /api/hero-slides** (Admin)

  - Login as admin
  - Navigate to `/admin/homepage`
  - Verify: See ALL hero slides (active AND inactive)
  - Check console network tab: Should see all slides returned

- [ ] **POST /api/hero-slides** (Admin)

  - Click "Add New Slide"
  - Fill form and submit
  - Verify: New slide created successfully
  - Check: Slide appears in list

- [ ] **PATCH /api/hero-slides/[id]** (Admin)

  - Click edit on any slide
  - Modify fields
  - Verify: Changes saved successfully
  - Check: Status can be toggled (active/inactive)

- [ ] **DELETE /api/hero-slides/[id]** (Admin)

  - Click delete on a slide
  - Confirm deletion
  - Verify: Slide removed from list

- [ ] **POST /api/hero-slides/bulk** (Admin)
  - Select multiple slides
  - Use bulk actions: activate, deactivate, feature, unfeature, delete
  - Verify: All operations work correctly
  - Check: Only selected slides affected

##### Support Tickets

- [ ] **GET /api/tickets** (Admin)

  - Navigate to `/admin/support`
  - Verify: See ALL tickets from all users
  - Check: Can filter by status, priority, category

- [ ] **POST /api/tickets/bulk** (Admin)
  - Select multiple tickets
  - Test bulk actions: assign, resolve, close, escalate
  - Verify: All operations work
  - Check: Status updates correctly

##### Categories

- [ ] **GET /api/categories** (Admin)

  - Navigate to `/admin/categories`
  - Verify: See ALL categories (active AND inactive)
  - Check: Hierarchy display works

- [ ] **POST /api/categories/bulk** (Admin)
  - Select multiple categories
  - Test: activate, deactivate, feature, unfeature
  - Verify: Operations successful
  - Check: Featured status visible

##### Products

- [ ] **GET /api/products** (Admin)

  - Navigate to `/admin/products`
  - Verify: See ALL products from ALL sellers
  - Check: Can filter by shop, status, category

- [ ] **PATCH /api/products/[slug]** (Admin)

  - Edit any product (even from other sellers)
  - Verify: Can edit successfully
  - Check: No ownership restriction

- [ ] **POST /api/products/bulk** (Admin)
  - Select products from different sellers
  - Test: publish, unpublish, feature, activate, deactivate, delete
  - Verify: Can bulk edit across sellers
  - Check: All operations work

##### Auctions

- [ ] **GET /api/auctions** (Admin)

  - Navigate to `/admin/auctions`
  - Verify: See ALL auctions from ALL sellers
  - Check: All statuses visible

- [ ] **POST /api/auctions/bulk** (Admin)
  - Select auctions from different sellers
  - Test: start, end, cancel, feature, delete
  - Verify: Operations work across sellers

##### Orders

- [ ] **GET /api/orders** (Admin)

  - Navigate to `/admin/orders`
  - Verify: See ALL orders from ALL users/shops
  - Check: Can filter by status, shop, user

- [ ] **POST /api/orders/bulk** (Admin)
  - Select orders from different shops
  - Test: confirm, process, ship, deliver, cancel, refund
  - Verify: Status updates work correctly

##### Coupons

- [ ] **GET /api/coupons** (Admin)

  - Navigate to `/admin/coupons`
  - Verify: See ALL coupons from ALL sellers
  - Check: All statuses visible

- [ ] **POST /api/coupons/bulk** (Admin)
  - Select coupons from different sellers
  - Test: activate, deactivate, delete
  - Verify: Operations work across sellers

##### Shops

- [ ] **GET /api/shops** (Admin)

  - Navigate to `/admin/shops`
  - Verify: See ALL shops (all statuses)
  - Check: Can see banned, unverified shops

- [ ] **POST /api/shops/bulk** (Admin)
  - Select multiple shops
  - Test: verify, unverify, feature, activate, deactivate, ban, unban
  - Verify: All 10 bulk operations work
  - Check: Ban operation requires ban reason

##### Payouts

- [ ] **GET /api/payouts** (Admin)

  - Navigate to `/admin/payouts`
  - Verify: See ALL payouts from ALL sellers
  - Check: All statuses visible

- [ ] **POST /api/payouts/bulk** (Admin)
  - Select multiple payouts
  - Test: approve, process, complete, reject
  - Verify: Status transitions work correctly
  - Check: Rejection includes reason

##### Reviews

- [ ] **GET /api/reviews** (Admin)

  - Navigate to `/admin/reviews`
  - Verify: See ALL reviews (published AND pending)
  - Check: Can filter by status, product

- [ ] **POST /api/reviews/bulk** (Admin)
  - Select multiple reviews
  - Test: approve, reject, flag, unflag
  - Verify: Status changes work
  - Check: Flagged reviews highlighted

---

#### Seller Role Testing

##### Products

- [ ] **GET /api/products** (Seller)

  - Login as seller1@test.com
  - Navigate to `/seller/products`
  - Verify: See ONLY own products from own shop
  - Check: Cannot see seller2's products

- [ ] **POST /api/products** (Seller)

  - Click "Add Product"
  - Fill form and submit
  - Verify: Product created for own shop
  - Check: shop_id automatically set to seller's shop

- [ ] **PATCH /api/products/[slug]** (Seller - Own)

  - Edit own product
  - Verify: Can edit successfully
  - Check: All fields editable

- [ ] **PATCH /api/products/[slug]** (Seller - Other's)

  - Try to edit seller2's product (use direct API or hack)
  - Verify: Gets 403 Forbidden error
  - Check: Error message clear

- [ ] **POST /api/products/bulk** (Seller)
  - Select own products
  - Test: publish, unpublish, feature, activate, deactivate
  - Verify: Operations work on own products
  - Check: Cannot affect other seller's products

##### Auctions

- [ ] **GET /api/auctions** (Seller)

  - Navigate to `/seller/auctions`
  - Verify: See ONLY own auctions
  - Check: Cannot see other seller's auctions

- [ ] **POST /api/auctions** (Seller)

  - Create new auction
  - Verify: Auction created for own shop
  - Check: shop_id correctly set

- [ ] **POST /api/auctions/bulk** (Seller)
  - Select own auctions
  - Test: start, end, cancel
  - Verify: Works on own auctions only
  - Check: Cannot affect other's auctions

##### Orders

- [ ] **GET /api/orders** (Seller)

  - Navigate to `/seller/orders`
  - Verify: See ONLY orders for own shop
  - Check: Cannot see orders from other shops

- [ ] **PATCH /api/orders/[id]** (Seller - Own Shop)

  - Update order status for own shop order
  - Verify: Can update (confirm, process, ship, deliver)
  - Check: Status transitions work

- [ ] **PATCH /api/orders/[id]** (Seller - Other Shop)

  - Try to update order from another shop
  - Verify: Gets 403 Forbidden error
  - Check: Ownership validation works

- [ ] **POST /api/orders/bulk** (Seller)
  - Select orders from own shop
  - Test: confirm, process, ship, deliver
  - Verify: Operations work on own orders
  - Check: Cannot affect other shop's orders

##### Coupons

- [ ] **GET /api/coupons** (Seller)

  - Navigate to `/seller/coupons`
  - Verify: See ONLY own coupons
  - Check: Cannot see other seller's coupons

- [ ] **POST /api/coupons** (Seller)

  - Create new coupon
  - Verify: Coupon created for own shop
  - Check: shop_id correctly set

- [ ] **PATCH /api/coupons/[code]** (Seller - Own)

  - Edit own coupon
  - Verify: Can edit successfully

- [ ] **PATCH /api/coupons/[code]** (Seller - Other's)
  - Try to edit another seller's coupon
  - Verify: Gets 403 Forbidden error

##### Shops

- [ ] **GET /api/shops/[slug]** (Seller - Own)

  - Navigate to `/seller/shop`
  - Verify: Can view own shop
  - Check: All details visible

- [ ] **PATCH /api/shops/[slug]** (Seller - Own)

  - Update shop details
  - Verify: Can update
  - Check: Cannot update verification status or feature flag

- [ ] **PATCH /api/shops/[slug]** (Seller - Other's)
  - Try to edit another seller's shop
  - Verify: Gets 403 Forbidden error

##### Payouts

- [ ] **GET /api/payouts** (Seller)

  - Navigate to `/seller/payouts`
  - Verify: See ONLY own payouts
  - Check: Cannot see other seller's payouts

- [ ] **POST /api/payouts** (Seller)

  - Request new payout
  - Verify: Payout request created
  - Check: Status set to "pending"

- [ ] **PATCH /api/payouts/[id]** (Seller - Pending)

  - Try to update payment details on pending payout
  - Verify: Can update payment details only
  - Check: Cannot change status

- [ ] **PATCH /api/payouts/[id]** (Seller - Processed)
  - Try to update processed payout
  - Verify: Gets 403 Forbidden error
  - Check: Cannot edit non-pending payouts

##### Support Tickets

- [ ] **GET /api/tickets** (Seller)

  - Navigate to `/seller/support`
  - Verify: See tickets related to own shop
  - Check: Shop-related tickets visible

- [ ] **POST /api/tickets/[id]/reply** (Seller)
  - Reply to shop-related ticket
  - Verify: Can add reply
  - Check: Reply associated with seller

---

#### User Role Testing

##### Products (Public Browse)

- [ ] **GET /api/products** (User)
  - Login as regular user
  - Navigate to `/products`
  - Verify: See ONLY published products
  - Check: Cannot see draft products

##### Auctions (Public Browse)

- [ ] **GET /api/auctions** (User)
  - Navigate to `/auctions`
  - Verify: See ONLY active auctions
  - Check: Cannot see ended/cancelled auctions

##### Orders

- [ ] **GET /api/orders** (User)

  - Navigate to `/user/orders`
  - Verify: See ONLY own orders
  - Check: Cannot see other user's orders

- [ ] **POST /api/orders** (User)

  - Add items to cart
  - Proceed to checkout
  - Verify: Order created successfully
  - Check: Order associated with user

- [ ] **GET /api/orders/[id]** (User - Own)

  - View own order details
  - Verify: Can view successfully
  - Check: All details visible

- [ ] **GET /api/orders/[id]** (User - Other's)
  - Try to view another user's order (direct API call)
  - Verify: Gets 403 Forbidden error
  - Check: Ownership validation works

##### Support Tickets

- [ ] **GET /api/tickets** (User)

  - Navigate to `/user/support`
  - Verify: See ONLY own tickets
  - Check: Cannot see other user's tickets

- [ ] **POST /api/tickets** (User)

  - Create new support ticket
  - Verify: Ticket created successfully
  - Check: Ticket associated with user

- [ ] **PATCH /api/tickets/[id]** (User - Own)

  - Update own ticket (limited fields)
  - Verify: Can update
  - Check: Cannot change status/priority

- [ ] **POST /api/tickets/[id]/reply** (User)
  - Reply to own ticket
  - Verify: Can add reply
  - Check: Reply visible in thread

##### Reviews

- [ ] **GET /api/reviews** (User)

  - Browse product reviews
  - Verify: See ONLY published reviews
  - Check: Cannot see pending/rejected reviews

- [ ] **POST /api/reviews** (User)

  - Write review for purchased product
  - Verify: Review created successfully
  - Check: Status set to "pending"

- [ ] **PATCH /api/reviews/[id]** (User - Own)

  - Edit own review (before approval)
  - Verify: Can edit content
  - Check: Cannot change status

- [ ] **GET /api/reviews/[id]** (User - Own Unpublished)
  - View own pending review
  - Verify: Can see own unpublished review
  - Check: Status visible

##### Shops (Public Browse)

- [ ] **GET /api/shops** (User)

  - Browse shops
  - Verify: See ONLY verified, non-banned shops
  - Check: Cannot see banned/unverified shops

- [ ] **GET /api/shops/[slug]** (User)
  - View shop details
  - Verify: Can view verified shops
  - Check: Shop products visible

##### Coupons (Public Validation)

- [ ] **GET /api/coupons/[code]** (User)
  - Apply coupon code at checkout
  - Verify: Can validate active coupons
  - Check: Inactive coupons return error

---

#### Guest (No Auth) Testing

##### Hero Slides

- [ ] **GET /api/hero-slides** (Guest)
  - Visit homepage without login
  - Verify: See ONLY active hero slides
  - Check: Inactive slides not visible

##### Categories

- [ ] **GET /api/categories** (Guest)
  - Browse categories
  - Verify: See ONLY active categories
  - Check: Inactive categories not shown

##### Products

- [ ] **GET /api/products** (Guest)
  - Browse products without login
  - Verify: See ONLY published products
  - Check: Draft products not visible

##### Auctions

- [ ] **GET /api/auctions** (Guest)
  - Browse auctions without login
  - Verify: See ONLY active auctions
  - Check: Other statuses not visible

##### Shops

- [ ] **GET /api/shops** (Guest)
  - Browse shops without login
  - Verify: See ONLY verified shops
  - Check: Banned/unverified shops hidden

##### Reviews

- [ ] **GET /api/reviews** (Guest)
  - View product reviews without login
  - Verify: See ONLY published reviews
  - Check: Pending/rejected reviews hidden

##### Protected Routes

- [ ] **POST /api/tickets** (Guest)

  - Try to create ticket without login
  - Verify: Gets 401 Unauthorized error
  - Check: Redirected to login

- [ ] **POST /api/orders** (Guest)

  - Try to checkout without login
  - Verify: Gets 401 Unauthorized error
  - Check: Redirected to login

- [ ] **POST /api/reviews** (Guest)
  - Try to write review without login
  - Verify: Gets 401 Unauthorized error
  - Check: Redirected to login

---

### Phase 12.3: Cross-Role Security Testing

#### Unauthorized Access Tests

- [ ] **User tries admin route**

  - Login as regular user
  - Try: `GET /api/hero-slides/bulk`
  - Verify: Gets 403 Forbidden error

- [ ] **User tries seller route**

  - Try: `POST /api/products/bulk` (on other's products)
  - Verify: Gets 403 Forbidden error

- [ ] **Seller tries admin route**

  - Login as seller
  - Try: `POST /api/shops/bulk`
  - Verify: Gets 403 Forbidden error

- [ ] **Seller tries other seller's data**
  - Try: `PATCH /api/products/[other-seller-product]`
  - Verify: Gets 403 Forbidden error

#### Data Leakage Tests

- [ ] **Seller GET products**

  - Query: `GET /api/products`
  - Verify: Response contains ONLY own shop products
  - Check: No other seller products in response

- [ ] **User GET orders**

  - Query: `GET /api/orders`
  - Verify: Response contains ONLY own orders
  - Check: No other user orders in response

- [ ] **Seller GET orders**
  - Query: `GET /api/orders`
  - Verify: Response contains ONLY own shop orders
  - Check: No other shop orders in response

---

### Phase 12.4: Performance Testing

#### Response Time Tests

- [ ] **GET /api/products** (No filters)

  - Open DevTools Network tab
  - Navigate to products page
  - Check: Response time < 500ms
  - Verify: Data loads quickly

- [ ] **GET /api/products** (With filters)

  - Apply filters (category, price range, etc.)
  - Check: Response time < 500ms
  - Verify: Filtering works correctly

- [ ] **GET /api/auctions** (Active)

  - Load auctions page
  - Check: Response time < 500ms
  - Verify: Real-time updates work

- [ ] **POST /api/products/bulk** (10 items)

  - Select 10 products
  - Perform bulk action
  - Check: Completes within reasonable time (< 5s)
  - Verify: All items processed

- [ ] **POST /api/orders/bulk** (Multiple orders)
  - Select multiple orders
  - Update status in bulk
  - Check: Performance acceptable
  - Verify: All updated correctly

#### Caching Tests

- [ ] **GET /api/products** (Public)

  - First request: Check response headers for cache
  - Second request: Verify cache hit
  - Check: `Cache-Control` headers present

- [ ] **GET /api/categories** (Public)
  - First request: Note response time
  - Second request: Should be faster (cached)
  - Check: Cache working correctly

---

### Phase 12.5: Error Handling Tests

#### Validation Errors (400)

- [ ] **POST /api/products** (Missing required fields)

  - Submit form without required data
  - Verify: Gets 400 Bad Request
  - Check: Error message describes missing fields

- [ ] **POST /api/tickets** (Invalid priority)
  - Submit with invalid priority value
  - Verify: Gets 400 Bad Request
  - Check: Validation error clear

#### Unauthorized Errors (401)

- [ ] **POST /api/orders** (Not logged in)

  - Try to checkout without auth
  - Verify: Gets 401 Unauthorized
  - Check: Error message: "Authentication required"

- [ ] **POST /api/reviews** (No session)
  - Try to submit review without login
  - Verify: Gets 401 Unauthorized

#### Forbidden Errors (403)

- [ ] **DELETE /api/products/[slug]** (Not owner)

  - User/Seller tries to delete admin/other's product
  - Verify: Gets 403 Forbidden
  - Check: Error message: "Insufficient permissions" or "Not owner"

- [ ] **POST /api/shops/bulk** (Not admin)
  - Seller tries bulk shop operations
  - Verify: Gets 403 Forbidden
  - Check: Clear error message

#### Not Found Errors (404)

- [ ] **GET /api/products/[invalid-slug]**

  - Request non-existent product
  - Verify: Gets 404 Not Found
  - Check: Error message: "Product not found"

- [ ] **GET /api/orders/[invalid-id]**
  - Request non-existent order
  - Verify: Gets 404 Not Found

---

## Testing Tools

### Browser DevTools

1. **Network Tab**: Monitor API requests/responses
2. **Console**: Check for JavaScript errors
3. **Application Tab**: Inspect cookies/session

### API Testing Tools (Optional)

- **Postman**: For direct API testing
- **Thunder Client** (VS Code): In-editor API testing
- **cURL**: Command-line API testing

### Example cURL Commands

```bash
# GET products as guest
curl http://localhost:3000/api/products

# GET products as admin (with session cookie)
curl -H "Cookie: session=YOUR_SESSION_TOKEN" \
  http://localhost:3000/api/products

# POST create product as seller
curl -X POST \
  -H "Cookie: session=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":100}' \
  http://localhost:3000/api/products

# Bulk delete products as admin
curl -X POST \
  -H "Cookie: session=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"delete","ids":["id1","id2"]}' \
  http://localhost:3000/api/products/bulk
```

---

## Test Results Template

### Test Session Information

- **Date**: ******\_\_\_******
- **Tester**: ******\_\_\_******
- **Branch**: Api-turnout
- **Environment**: Local Development

### Summary

- **Total Tests**: **\_** / **\_**
- **Passed**: **\_**
- **Failed**: **\_**
- **Skipped**: **\_**

### Failed Tests

| Test | Expected | Actual | Priority     |
| ---- | -------- | ------ | ------------ |
|      |          |        | High/Med/Low |

### Issues Found

| Issue # | Description | Severity              | Route | Status |
| ------- | ----------- | --------------------- | ----- | ------ |
| 1       |             | Critical/High/Med/Low |       | Open   |

### Notes

-
-
-

---

## Next Steps After Testing

1. **Fix Critical Issues**: Address any security vulnerabilities
2. **Fix High Priority**: Fix major functionality issues
3. **Document Known Issues**: Add to backlog for medium/low priority
4. **Update Documentation**: Note any discovered behaviors
5. **Proceed to Phase 12.6**: Documentation updates

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Network tab for API responses
3. Review `docs/API-CONSOLIDATION-SUMMARY.md`
4. Check RBAC middleware implementation
5. Review specific route file

---

**Last Updated**: November 16, 2025  
**Status**: Ready for Testing
