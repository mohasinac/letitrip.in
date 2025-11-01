# 📅 Today's Implementation Plan

**Date:** November 1, 2025  
**Goal:** Get core e-commerce features working by end of day  
**Estimated Time:** 8-10 hours

---

## 🎯 Priority Tasks

### ✅ MUST HAVE (Core Features - 6 hours)

#### 1. Currency System (30 min)

- [ ] Create `CurrencyContext.tsx`
- [ ] Add currency selector to navbar
- [ ] Test currency conversion
- [ ] Persist user preference

#### 2. Cart System (1.5 hours)

- [ ] Create `CartContext.tsx`
- [ ] Create `FloatingCart.tsx` component
- [ ] Create `CartDrawer.tsx` component
- [ ] Create cart page `/cart`
- [ ] Test add/remove/update operations
- [ ] Add cart icon to navbar with count

#### 3. Wishlist System (30 min)

- [ ] Create `WishlistContext.tsx`
- [ ] Create wishlist button component
- [ ] Create wishlist page `/wishlist`
- [ ] Add move to cart functionality

#### 4. Address Management (1 hour)

- [ ] Create address types
- [ ] Create API route for addresses
- [ ] Create address management page
- [ ] Create address selector component
- [ ] Test CRUD operations

#### 5. Checkout Flow (1.5 hours)

- [ ] Create checkout page `/checkout`
- [ ] Add address selection
- [ ] Add payment method selection
- [ ] Add order summary
- [ ] Add terms & conditions
- [ ] Add place order button

#### 6. Payment Integration (1 hour)

- [ ] Set up Razorpay in test mode
- [ ] Create payment API routes
- [ ] Create order API routes
- [ ] Test payment flow
- [ ] Handle success/failure

---

### 🔶 SHOULD HAVE (Important - 2 hours)

#### 7. Product Updates (30 min)

- [ ] Add "Add to Cart" button to product cards
- [ ] Add "Wishlist" button to product cards
- [ ] Add stock validation
- [ ] Show out of stock badge

#### 8. User Profile (30 min)

- [ ] Create profile sidebar layout
- [ ] Add orders section
- [ ] Add addresses section
- [ ] Add settings section

#### 9. Order Viewing (1 hour)

- [ ] Create user orders page
- [ ] Create order detail page
- [ ] Add order timeline
- [ ] Add cancel order option

---

### 💡 NICE TO HAVE (Polish - 2 hours)

#### 10. UI Polish (30 min)

- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error messages
- [ ] Improve mobile responsiveness

#### 11. Products Page (1 hour)

- [ ] Create products listing page
- [ ] Add basic search
- [ ] Add basic filters (category, price)
- [ ] Add sort dropdown

#### 12. Seller Order Updates (30 min)

- [ ] Update seller order page
- [ ] Add accept/reject buttons
- [ ] Add order status updates
- [ ] Test seller flow

---

## 📋 Detailed Task Breakdown

### Phase 1: Setup Contexts (1 hour)

**Files to create:**

```
src/contexts/
├── CurrencyContext.tsx
├── CartContext.tsx
└── WishlistContext.tsx
```

**Steps:**

1. Create CurrencyContext

   - Add currency state
   - Add conversion logic
   - Add localStorage persistence
   - Add to layout

2. Create CartContext

   - Add items state
   - Add add/remove/update methods
   - Add localStorage sync
   - Add to layout

3. Create WishlistContext
   - Similar to CartContext
   - Add to layout

**Test:** Currency selector works, cart persists, wishlist persists

---

### Phase 2: Cart UI (1.5 hours)

**Files to create:**

```
src/components/cart/
├── FloatingCart.tsx
├── CartDrawer.tsx
├── CartItem.tsx
└── EmptyCart.tsx

src/app/cart/
└── page.tsx
```

**Steps:**

1. Create FloatingCart

   - Fixed position bottom-right
   - Show item count badge
   - Click to open drawer

2. Create CartDrawer

   - Slide-in from right
   - List cart items
   - Quick actions
   - Checkout button

3. Create Cart Page
   - Full cart view
   - Quantity controls
   - Remove items
   - Move to wishlist
   - Price breakdown
   - Checkout button

**Test:** Add products to cart, view in drawer, view full page

---

### Phase 3: Wishlist (30 min)

**Files to create:**

```
src/components/wishlist/
├── WishlistButton.tsx
└── WishlistCard.tsx

src/app/wishlist/
└── page.tsx
```

**Steps:**

1. Create WishlistButton

   - Heart icon
   - Toggle functionality
   - Show filled when in wishlist

2. Create Wishlist Page
   - List wishlist items
   - Move to cart
   - Remove items
   - Empty state

**Test:** Add/remove from wishlist, move to cart

---

### Phase 4: Addresses (1 hour)

**Files to create:**

```
src/app/api/addresses/
└── route.ts

src/app/api/addresses/[id]/
└── route.ts

src/app/profile/addresses/
└── page.tsx

src/components/address/
├── AddressForm.tsx
├── AddressCard.tsx
└── AddressSelector.tsx
```

**Steps:**

1. Create API routes

   - GET /api/addresses - List all
   - POST /api/addresses - Create
   - PUT /api/addresses/[id] - Update
   - DELETE /api/addresses/[id] - Delete

2. Create Address Management Page

   - List addresses
   - Add new button
   - Edit/Delete actions
   - Set default

3. Create Address Components
   - AddressForm for create/edit
   - AddressCard for display
   - AddressSelector for checkout

**Test:** CRUD operations work, default address saved

---

### Phase 5: Checkout (1.5 hours)

**Files to create:**

```
src/app/checkout/
└── page.tsx

src/components/checkout/
├── AddressSelector.tsx
├── PaymentMethod.tsx
├── OrderSummary.tsx
├── CouponInput.tsx
└── PriceBreakdown.tsx
```

**Steps:**

1. Create Checkout Page

   - Protected route (auth required)
   - Redirect if cart empty
   - Three-column layout

2. Address Section

   - Select from saved addresses
   - Add new address inline
   - Validation

3. Payment Section

   - Radio buttons for methods
   - Razorpay (Domestic)
   - PayPal (International - show 7% fee)
   - COD (if available)

4. Order Summary
   - List items
   - Show price breakdown
   - Apply coupon
   - Terms checkbox
   - Place order button

**Test:** Complete flow from cart to checkout

---

### Phase 6: Payment & Order (2 hours)

**Files to create:**

```
src/app/api/payment/
├── razorpay/
│   ├── create/route.ts
│   ├── verify/route.ts
│   └── webhook/route.ts
└── paypal/
    ├── create/route.ts
    └── capture/route.ts

src/app/api/orders/
├── create/route.ts
└── [id]/route.ts

src/lib/payment/
├── razorpay.ts
└── paypal.ts

src/components/payment/
└── RazorpayButton.tsx
```

**Steps:**

1. Set up Razorpay

   - Add test keys to .env
   - Create order endpoint
   - Create verify endpoint
   - Test payment flow

2. Create Order API

   - Validate cart
   - Check stock
   - Apply discounts
   - Calculate totals
   - Save to database
   - Update stock
   - Clear cart

3. Handle Payment Success

   - Verify payment
   - Update order status
   - Send confirmation
   - Redirect to order page

4. Handle Payment Failure
   - Show error message
   - Keep cart intact
   - Allow retry

**Test:** Complete end-to-end payment

---

### Phase 7: Order Viewing (1 hour)

**Files to create:**

```
src/app/profile/orders/
├── page.tsx
└── [id]/page.tsx

src/components/orders/
├── OrderCard.tsx
├── OrderTimeline.tsx
└── OrderDetails.tsx
```

**Steps:**

1. Create Orders List Page

   - List user orders
   - Sort by date
   - Filter by status
   - Click to view details

2. Create Order Detail Page
   - Show order info
   - Show items
   - Show addresses
   - Show payment info
   - Show timeline
   - Add cancel button (if applicable)

**Test:** View orders, view details, cancel order

---

## 🔧 Environment Variables Needed

Add to `.env.local`:

```env
# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# PayPal (Optional)
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_MODE=sandbox

# Exchange Rate API
EXCHANGE_RATE_API_KEY=xxxxx
```

---

## 🧪 Testing Checklist

After each phase, test:

### Currency

- [ ] Selector appears in navbar
- [ ] Currency changes on selection
- [ ] Prices update across site
- [ ] Selection persists on reload

### Cart

- [ ] Add to cart works
- [ ] Update quantity works
- [ ] Remove item works
- [ ] Cart persists on reload
- [ ] Floating cart shows count
- [ ] Cart drawer opens/closes
- [ ] Cart page displays correctly

### Wishlist

- [ ] Add to wishlist works
- [ ] Remove from wishlist works
- [ ] Move to cart works
- [ ] Wishlist persists on reload
- [ ] Heart icon updates correctly

### Addresses

- [ ] Can create address
- [ ] Can edit address
- [ ] Can delete address
- [ ] Can set default address
- [ ] Addresses load on checkout

### Checkout

- [ ] Redirects if not logged in
- [ ] Redirects if cart empty
- [ ] Can select address
- [ ] Can select payment method
- [ ] Order summary correct
- [ ] Can apply coupon
- [ ] Place order button works

### Payment

- [ ] Razorpay modal opens
- [ ] Payment succeeds in test mode
- [ ] Order created successfully
- [ ] Order appears in profile
- [ ] Cart cleared after order
- [ ] Redirect to order page

### Orders

- [ ] Orders list loads
- [ ] Order detail loads
- [ ] Timeline shows correctly
- [ ] Can cancel order
- [ ] Status updates correctly

---

## 🎯 Success Criteria

By end of day, you should be able to:

1. ✅ Browse products
2. ✅ Add products to cart
3. ✅ View cart
4. ✅ Add to wishlist
5. ✅ Manage addresses
6. ✅ Proceed to checkout
7. ✅ Select address
8. ✅ Select payment method
9. ✅ Complete payment (test mode)
10. ✅ View order confirmation
11. ✅ View order in profile

---

## 📊 Progress Tracker

Update as you complete:

**Morning Session (4 hours)**

- [ ] Phase 1: Setup Contexts
- [ ] Phase 2: Cart UI
- [ ] Phase 3: Wishlist
- [ ] Phase 4: Addresses (partial)

**Afternoon Session (4 hours)**

- [ ] Phase 4: Addresses (complete)
- [ ] Phase 5: Checkout
- [ ] Phase 6: Payment & Order
- [ ] Phase 7: Order Viewing

**Evening Session (2 hours)**

- [ ] Testing & Bug Fixes
- [ ] UI Polish
- [ ] Documentation

---

## 🚨 If Running Behind Schedule

**Priority Cuts:**

1. Skip PayPal integration (add later)
2. Skip wishlist (add later)
3. Simplify order detail page
4. Skip order cancellation
5. Skip coupon application

**Keep These:**

- ✅ Currency system
- ✅ Cart system
- ✅ Address management
- ✅ Checkout page
- ✅ Razorpay payment
- ✅ Order creation
- ✅ Basic order viewing

---

## 💡 Tips for Fast Implementation

1. **Copy & Modify:** Use existing components as templates
2. **Test As You Go:** Don't wait till the end
3. **Use Console Logs:** Debug quickly
4. **Keep It Simple:** MVP first, polish later
5. **Use AI:** Ask for help with boilerplate code
6. **Take Breaks:** 5 minutes every hour
7. **Save Frequently:** Commit after each phase

---

## 🎉 Celebration Checklist

When done:

- [ ] Commit all changes
- [ ] Push to repository
- [ ] Create a demo video
- [ ] Document any issues
- [ ] Plan next session
- [ ] Celebrate! 🎊

---

## 📝 Notes Section

Use this space to track:

- Issues encountered
- Solutions found
- Things to improve
- Questions for next session

---

**Remember:** The goal is a **working** system, not a perfect one. Get it working first, then improve!

Good luck! You've got this! 💪🚀
