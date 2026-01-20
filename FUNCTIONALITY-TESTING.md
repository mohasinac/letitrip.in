# Functionality Testing Guide - Phase 9.2

## Overview

This document provides comprehensive testing procedures for all major features of the LetItRip e-commerce platform.

## Testing Environment Setup

### Prerequisites:

- **Dev Server Running**: `npm run dev`
- **Firebase Emulators** (optional): `firebase emulators:start`
- **Browser**: Chrome/Edge with DevTools
- **Extensions**: React DevTools, Redux DevTools

### Test Data:

```javascript
// Test Users
const testUsers = {
  buyer: {
    email: "buyer@test.com",
    password: "Test123!",
  },
  seller: {
    email: "seller@test.com",
    password: "Test123!",
  },
  admin: {
    email: "admin@test.com",
    password: "Admin123!",
  },
};

// Test Products
const testProduct = {
  name: "iPhone 15 Pro Max",
  slug: "iphone-15-pro-max-256gb",
  price: 129900,
  category: "Electronics",
};
```

## Phase 9.2: Functionality Testing (0/6)

### Task 1: Auth Flows - Login, Register, Logout

#### Test Cases:

**1.1. User Registration**

- [ ] Navigate to `/auth/register`
- [ ] Fill in all required fields:
  - Email: `newuser@test.com`
  - Password: `Test123!`
  - Confirm Password: `Test123!`
  - Name: `Test User`
- [ ] Submit form
- [ ] **Expected**: Success message, redirect to `/` or `/user/dashboard`
- [ ] **Actual**: \***\*\_\_\_\*\***

**Validation Tests:**

- [ ] Empty email → Error: "Email is required"
- [ ] Invalid email → Error: "Invalid email format"
- [ ] Weak password → Error: "Password must be at least 8 characters"
- [ ] Password mismatch → Error: "Passwords do not match"
- [ ] Duplicate email → Error: "Email already exists"

**1.2. User Login**

- [ ] Navigate to `/auth/login`
- [ ] Enter credentials:
  - Email: `buyer@test.com`
  - Password: `Test123!`
- [ ] Submit form
- [ ] **Expected**: Success message, redirect to previous page or `/`
- [ ] **Actual**: \***\*\_\_\_\*\***

**Error Handling:**

- [ ] Invalid email → Error: "Invalid email or password"
- [ ] Wrong password → Error: "Invalid email or password"
- [ ] Network error → Error: "Connection failed. Please try again."

**1.3. Password Reset**

- [ ] Navigate to `/auth/forgot-password`
- [ ] Enter email: `buyer@test.com`
- [ ] Submit form
- [ ] **Expected**: "Reset link sent to your email"
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Check email for reset link
- [ ] Click reset link
- [ ] Enter new password
- [ ] Submit
- [ ] **Expected**: "Password reset successfully"
- [ ] **Actual**: \***\*\_\_\_\*\***

**1.4. Logout**

- [ ] Login as any user
- [ ] Click user menu → Logout
- [ ] **Expected**: Redirect to homepage, user menu removed
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Navigate to `/user/dashboard`
- [ ] **Expected**: Redirect to `/auth/login`
- [ ] **Actual**: \***\*\_\_\_\*\***

**1.5. Protected Routes**

- [ ] Without login, navigate to:
  - [ ] `/user/dashboard` → Redirect to `/auth/login`
  - [ ] `/seller/dashboard` → Redirect to `/auth/login`
  - [ ] `/admin/dashboard` → Redirect to `/auth/login`
  - [ ] `/checkout` → Redirect to `/auth/login`
- [ ] **Expected**: All protected routes redirect to login
- [ ] **Actual**: \***\*\_\_\_\*\***

**1.6. Session Persistence**

- [ ] Login as user
- [ ] Close browser
- [ ] Reopen browser
- [ ] Navigate to `/user/dashboard`
- [ ] **Expected**: Still logged in, no redirect
- [ ] **Actual**: \***\*\_\_\_\*\***

---

### Task 2: CRUD Operations - Create, Read, Update, Delete

#### Test Cases:

**2.1. Product CRUD (Seller)**

**Create Product:**

- [ ] Login as seller
- [ ] Navigate to `/seller/products/new`
- [ ] Fill in product details:
  - Name: `Test Product`
  - Description: `Test description`
  - Price: `9999`
  - Category: Select from dropdown
  - Images: Upload 3 images
- [ ] Submit form
- [ ] **Expected**: Success message, redirect to product list
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Verify product appears in `/seller/products`

**Read Product:**

- [ ] Navigate to `/buy-product-{slug}`
- [ ] **Expected**: Product details displayed correctly
  - [ ] Name, description, price
  - [ ] Images in gallery
  - [ ] Category, seller info
  - [ ] Add to cart button
- [ ] **Actual**: \***\*\_\_\_\*\***

**Update Product:**

- [ ] Navigate to `/seller/products`
- [ ] Click "Edit" on test product
- [ ] Update name to `Updated Test Product`
- [ ] Update price to `8888`
- [ ] Submit form
- [ ] **Expected**: Success message, changes saved
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Navigate to product page
- [ ] **Expected**: Updated details displayed
- [ ] **Actual**: \***\*\_\_\_\*\***

**Delete Product:**

- [ ] Navigate to `/seller/products`
- [ ] Click "Delete" on test product
- [ ] Confirm deletion in modal
- [ ] **Expected**: Success message, product removed from list
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Navigate to product page `/buy-product-{slug}`
- [ ] **Expected**: 404 error or "Product not found"
- [ ] **Actual**: \***\*\_\_\_\*\***

**2.2. Auction CRUD (Seller)**

**Create Auction:**

- [ ] Login as seller
- [ ] Navigate to `/seller/auctions/new`
- [ ] Fill in auction details:
  - Title: `Test Auction`
  - Starting Bid: `5000`
  - Reserve Price: `10000`
  - Start Time: Select date/time
  - End Time: Select date/time (after start)
  - Images: Upload 3 images
- [ ] Submit form
- [ ] **Expected**: Success message, redirect to auction list
- [ ] **Actual**: \***\*\_\_\_\*\***

**Read Auction:**

- [ ] Navigate to `/buy-auction-{slug}`
- [ ] **Expected**: Auction details displayed
  - [ ] Title, description, current bid
  - [ ] Start/end time, time remaining
  - [ ] Bid history
  - [ ] Place bid button
- [ ] **Actual**: \***\*\_\_\_\*\***

**Update Auction:**

- [ ] Navigate to `/seller/auctions`
- [ ] Click "Edit" on test auction (if not live)
- [ ] Update reserve price to `12000`
- [ ] Submit form
- [ ] **Expected**: Success message, changes saved
- [ ] **Actual**: \***\*\_\_\_\*\***

**Delete Auction:**

- [ ] Navigate to `/seller/auctions`
- [ ] Click "Delete" on test auction (if not live)
- [ ] Confirm deletion
- [ ] **Expected**: Success message, auction removed
- [ ] **Actual**: \***\*\_\_\_\*\***

**2.3. Category CRUD (Admin)**

**Create Category:**

- [ ] Login as admin
- [ ] Navigate to `/admin/categories/new`
- [ ] Fill in:
  - Name: `Test Category`
  - Slug: `test-category`
  - Parent: Select parent (optional)
  - Icon: Upload icon
- [ ] Submit form
- [ ] **Expected**: Success message, category created
- [ ] **Actual**: \***\*\_\_\_\*\***

**Read Categories:**

- [ ] Navigate to `/categories`
- [ ] **Expected**: All categories displayed in grid/list
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Click on test category
- [ ] **Expected**: Category page with products
- [ ] **Actual**: \***\*\_\_\_\*\***

**Update Category:**

- [ ] Navigate to `/admin/categories`
- [ ] Click "Edit" on test category
- [ ] Update name to `Updated Test Category`
- [ ] Submit form
- [ ] **Expected**: Success message, changes saved
- [ ] **Actual**: \***\*\_\_\_\*\***

**Delete Category:**

- [ ] Navigate to `/admin/categories`
- [ ] Click "Delete" on test category
- [ ] Confirm deletion
- [ ] **Expected**: Success message, category removed
- [ ] **Actual**: \***\*\_\_\_\*\***

---

### Task 3: Payments - Razorpay, PhonePe Integration

#### Test Cases:

**3.1. Razorpay Payment Flow**

- [ ] Add product to cart
- [ ] Proceed to checkout
- [ ] Fill in shipping details
- [ ] Select payment method: Razorpay
- [ ] Click "Place Order"
- [ ] **Expected**: Razorpay modal opens
- [ ] **Actual**: \***\*\_\_\_\*\***

**Razorpay Test Cards:**

```
Success: 4111 1111 1111 1111 (CVV: 123, Expiry: 12/25)
Failure: 4000 0000 0000 0002
3D Secure: 4000 0000 0000 3220
```

- [ ] Enter test card details
- [ ] Complete payment
- [ ] **Expected**: Success page, order confirmation
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Verify order in `/user/orders`
- [ ] **Expected**: Order status: "Paid", Payment method: "Razorpay"
- [ ] **Actual**: \***\*\_\_\_\*\***

**Payment Failure Test:**

- [ ] Use failure test card: `4000 0000 0000 0002`
- [ ] **Expected**: Error message, order status: "Failed"
- [ ] **Actual**: \***\*\_\_\_\*\***

**3.2. PhonePe Payment Flow**

- [ ] Add product to cart
- [ ] Proceed to checkout
- [ ] Select payment method: PhonePe
- [ ] Click "Place Order"
- [ ] **Expected**: PhonePe redirect or QR code
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Complete payment (use PhonePe test environment)
- [ ] **Expected**: Redirect back to success page
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Verify order in `/user/orders`

**3.3. COD (Cash on Delivery)**

- [ ] Add product to cart
- [ ] Proceed to checkout
- [ ] Select payment method: Cash on Delivery
- [ ] Click "Place Order"
- [ ] **Expected**: Order placed, no payment modal
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Verify order status: "Pending", Payment: "COD"

**3.4. Payment Edge Cases**

- [ ] **Network Failure During Payment**:

  - [ ] Disconnect internet mid-payment
  - [ ] **Expected**: Error message, retry option
  - [ ] **Actual**: \***\*\_\_\_\*\***

- [ ] **Duplicate Payment Prevention**:

  - [ ] Submit payment twice quickly
  - [ ] **Expected**: Second click ignored
  - [ ] **Actual**: \***\*\_\_\_\*\***

- [ ] **Insufficient Funds** (use specific test card):
  - [ ] **Expected**: Error: "Insufficient funds"
  - [ ] **Actual**: \***\*\_\_\_\*\***

---

### Task 4: Global Search - Multi-Type, Suggestions

#### Test Cases:

**4.1. Product Search**

- [ ] Click search icon in header
- [ ] Type: `iphone`
- [ ] **Expected**: Real-time suggestions appear
  - [ ] Product suggestions
  - [ ] Category suggestions
  - [ ] Seller suggestions
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Press Enter or click suggestion
- [ ] **Expected**: Search results page with products
- [ ] **Actual**: \***\*\_\_\_\*\***

**4.2. Auction Search**

- [ ] Search for: `vintage`
- [ ] **Expected**: Results include auctions
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Filter by: "Auctions only"
- [ ] **Expected**: Only auction results
- [ ] **Actual**: \***\*\_\_\_\*\***

**4.3. Category Search**

- [ ] Search for: `electronics`
- [ ] **Expected**: Electronics category appears
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Click category
- [ ] **Expected**: Category page with products
- [ ] **Actual**: \***\*\_\_\_\*\***

**4.4. Seller/Shop Search**

- [ ] Search for: shop name (e.g., `tech store`)
- [ ] **Expected**: Shop appears in suggestions
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Click shop
- [ ] **Expected**: Shop page with products
- [ ] **Actual**: \***\*\_\_\_\*\***

**4.5. Empty Search Results**

- [ ] Search for: `xyznonexistent`
- [ ] **Expected**: "No results found" message
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] **Expected**: Suggestions: "Try different keywords"
- [ ] **Actual**: \***\*\_\_\_\*\***

**4.6. Search Filters**

- [ ] Search for: `phone`
- [ ] Apply filters:
  - [ ] Price range: ₹10,000 - ₹50,000
  - [ ] Category: Electronics
  - [ ] Condition: New
- [ ] **Expected**: Filtered results
- [ ] **Actual**: \***\*\_\_\_\*\***

**4.7. Search Autocomplete**

- [ ] Type: `ip` (don't press Enter)
- [ ] **Expected**: Suggestions: "iphone", "ipad", "ipod"
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Use arrow keys to navigate
- [ ] Press Enter on selected
- [ ] **Expected**: Navigate to selected item
- [ ] **Actual**: \***\*\_\_\_\*\***

---

### Task 5: Filters - All Filter Types Work Correctly

#### Test Cases:

**5.1. Price Range Filter**

- [ ] Navigate to `/buy-product-all`
- [ ] Set price range: ₹5,000 - ₹20,000
- [ ] Click "Apply"
- [ ] **Expected**: Only products in range displayed
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Verify all products are within range

**5.2. Category Filter**

- [ ] Select category: "Electronics"
- [ ] **Expected**: Only electronics products
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Select sub-category: "Mobile Phones"
- [ ] **Expected**: Only mobile phones
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.3. Brand Filter**

- [ ] Select brand: "Apple"
- [ ] **Expected**: Only Apple products
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Select multiple brands: "Apple", "Samsung"
- [ ] **Expected**: Products from both brands
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.4. Condition Filter**

- [ ] Select condition: "New"
- [ ] **Expected**: Only new products
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Select "Used"
- [ ] **Expected**: Only used products
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.5. Color Filter**

- [ ] Select color: "Black"
- [ ] **Expected**: Products available in black
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Select multiple colors: "Black", "White"
- [ ] **Expected**: Products in either color
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.6. Size Filter (for applicable products)**

- [ ] Navigate to clothing category
- [ ] Select size: "Medium"
- [ ] **Expected**: Only medium-sized items
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.7. Rating Filter**

- [ ] Select rating: "4 stars & above"
- [ ] **Expected**: Only high-rated products
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.8. Availability Filter**

- [ ] Select: "In Stock"
- [ ] **Expected**: Only available products
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Select: "Out of Stock"
- [ ] **Expected**: Only unavailable products
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.9. Multiple Filters Combined**

- [ ] Apply:
  - Category: Electronics
  - Price: ₹10,000 - ₹50,000
  - Brand: Apple
  - Condition: New
  - Rating: 4+ stars
- [ ] **Expected**: Products matching ALL criteria
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.10. Clear Filters**

- [ ] Apply multiple filters
- [ ] Click "Clear All Filters"
- [ ] **Expected**: All filters reset, full product list
- [ ] **Actual**: \***\*\_\_\_\*\***

**5.11. URL Persistence**

- [ ] Apply filters
- [ ] Copy URL
- [ ] Open in new tab
- [ ] **Expected**: Same filters applied
- [ ] **Actual**: \***\*\_\_\_\*\***

---

### Task 6: Cart/Checkout - Guest Cart, Merge, Payment

#### Test Cases:

**6.1. Add to Cart (Guest)**

- [ ] Without login, navigate to product page
- [ ] Click "Add to Cart"
- [ ] **Expected**: Product added, cart icon badge +1
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Navigate to `/cart`
- [ ] **Expected**: Product in cart
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.2. Update Cart Quantity**

- [ ] In cart, change quantity from 1 to 3
- [ ] **Expected**: Total price updated (×3)
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Change quantity to 0
- [ ] **Expected**: Product removed from cart
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.3. Remove from Cart**

- [ ] Click "Remove" button
- [ ] **Expected**: Product removed immediately
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.4. Guest Cart Persistence**

- [ ] Add products to cart (not logged in)
- [ ] Close browser
- [ ] Reopen browser
- [ ] **Expected**: Cart items still there (localStorage)
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.5. Cart Merge on Login**

- [ ] As guest, add Product A to cart
- [ ] Login as user
- [ ] **Expected**: Product A still in cart
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] If user already had Product B in cart
- [ ] **Expected**: Both Product A and B in cart
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.6. Checkout Flow**

- [ ] Add product to cart
- [ ] Click "Proceed to Checkout"
- [ ] Fill in shipping address:
  - Name, Phone, Address, City, State, ZIP
- [ ] Select shipping method: Standard/Express
- [ ] Select payment method: Razorpay/PhonePe/COD
- [ ] Review order summary
- [ ] Click "Place Order"
- [ ] **Expected**: Payment modal or success page (COD)
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.7. Checkout Validation**

- [ ] Try to checkout with empty cart
- [ ] **Expected**: Error: "Your cart is empty"
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Try to checkout without address
- [ ] **Expected**: Error: "Please enter shipping address"
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.8. Stock Validation**

- [ ] Add product with stock: 5
- [ ] Set quantity to 10
- [ ] Try to checkout
- [ ] **Expected**: Error: "Only 5 items available"
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.9. Coupon Code**

- [ ] Enter coupon code: `TEST10` (10% off)
- [ ] Click "Apply"
- [ ] **Expected**: Discount applied, total reduced
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Enter invalid coupon
- [ ] **Expected**: Error: "Invalid coupon code"
- [ ] **Actual**: \***\*\_\_\_\*\***

**6.10. Order Confirmation**

- [ ] Complete checkout
- [ ] **Expected**: Order confirmation page with:
  - [ ] Order ID
  - [ ] Estimated delivery date
  - [ ] Payment status
  - [ ] "View Order" button
- [ ] **Actual**: \***\*\_\_\_\*\***
- [ ] Click "View Order"
- [ ] **Expected**: Navigate to `/user/orders/{orderId}`
- [ ] **Actual**: \***\*\_\_\_\*\***

---

## Testing Checklist Summary

| Task               | Test Cases                              | Status         | Notes |
| ------------------ | --------------------------------------- | -------------- | ----- |
| 1. Auth Flows      | 6 test cases                            | ⚪ Not Started |       |
| 2. CRUD Operations | 3 sections (Product, Auction, Category) | ⚪ Not Started |       |
| 3. Payments        | 3 payment methods + edge cases          | ⚪ Not Started |       |
| 4. Global Search   | 7 search scenarios                      | ⚪ Not Started |       |
| 5. Filters         | 11 filter types                         | ⚪ Not Started |       |
| 6. Cart/Checkout   | 10 checkout scenarios                   | ⚪ Not Started |       |

## Bug Tracking

Use this template for reporting bugs:

```markdown
### Bug #[NUMBER]: [Title]

**Priority**: High/Medium/Low
**Component**: [Component name]
**Affected Pages**: [URLs]

**Steps to Reproduce**:

1. ...
2. ...
3. ...

**Expected Behavior**: ...
**Actual Behavior**: ...

**Screenshots**: [If applicable]
**Console Errors**: [If applicable]

**Environment**:

- Browser: ...
- Device: ...
- OS: ...
```

## Next Steps

1. [ ] Complete all 6 functionality tests
2. [ ] Document bugs in separate file
3. [ ] Fix critical bugs
4. [ ] Retest fixed bugs
5. [ ] Move to Phase 9.3 - Responsive Testing

## Status

⚪ **Not Started** - All 6 tasks pending
📋 **Test Documentation Created** - Comprehensive guide ready

---

**Note**: Mark each test case with ✅ when passed, ❌ when failed (with bug report), or ⚠️ when partially working.
