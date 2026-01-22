# API Testing Guide

**Last Updated:** January 22, 2026  
**Status:** Ready for Testing

## 🎯 Overview

This guide provides step-by-step instructions for testing all **54 session-authenticated API endpoints** using Postman, Thunder Client, or similar tools.

## 🔑 Authentication Setup

### Step 1: Register a User

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Request Body:**

```json
{
  "idToken": "YOUR_FIREBASE_ID_TOKEN",
  "name": "Test User",
  "phone": "+919876543210",
  "role": "user"
}
```

**Note:** On localhost, you can set any role. In production, all users default to "user" role.

### Step 2: Get Session Cookie

After registration/login, the API sets an httpOnly cookie named `session`. This cookie is automatically sent with all subsequent requests.

**Verify Session:**

```
GET http://localhost:3000/api/auth/session
```

**Expected Response:**

```json
{
  "authenticated": true,
  "user": {
    "userId": "abc123",
    "email": "test@example.com",
    "role": "user",
    "name": "Test User"
  }
}
```

## 🛒 User API Tests

### Cart APIs (5 endpoints)

#### 1. Get Cart

```http
GET http://localhost:3000/api/cart
```

**Expected:** List of cart items or empty array

#### 2. Add to Cart

```http
POST http://localhost:3000/api/cart
Content-Type: application/json

{
  "productSlug": "laptop-dell-xps-15",
  "quantity": 2,
  "price": 89999
}
```

**Expected:** 201 Created with cart item ID

#### 3. Update Cart Item

```http
PUT http://localhost:3000/api/cart/{itemId}
Content-Type: application/json

{
  "quantity": 3
}
```

**Expected:** 200 OK with updated item

#### 4. Remove Cart Item

```http
DELETE http://localhost:3000/api/cart/{itemId}
```

**Expected:** 200 OK

#### 5. Clear Cart

```http
DELETE http://localhost:3000/api/cart/clear
```

**Expected:** 200 OK

---

### Profile APIs (2 endpoints)

#### 1. Get Profile

```http
GET http://localhost:3000/api/user/profile
```

**Expected:** User profile data

#### 2. Update Profile

```http
PUT http://localhost:3000/api/user/profile
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+919876543210",
  "bio": "Test bio"
}
```

**Expected:** 200 OK with updated profile

---

### Addresses APIs (5 endpoints)

#### 1. List Addresses

```http
GET http://localhost:3000/api/user/addresses
```

#### 2. Add Address

```http
POST http://localhost:3000/api/user/addresses
Content-Type: application/json

{
  "name": "Home",
  "phone": "+919876543210",
  "addressLine1": "123 Test Street",
  "addressLine2": "Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "isDefault": true
}
```

#### 3. Update Address

```http
PUT http://localhost:3000/api/user/addresses/{addressId}
Content-Type: application/json

{
  "name": "Office",
  "phone": "+919876543211"
}
```

#### 4. Set Default Address

```http
PUT http://localhost:3000/api/user/addresses/{addressId}/default
```

#### 5. Delete Address

```http
DELETE http://localhost:3000/api/user/addresses/{addressId}
```

---

### Avatar APIs (2 endpoints)

#### 1. Upload Avatar

```http
POST http://localhost:3000/api/user/avatar
Content-Type: multipart/form-data

(Form data with 'avatar' file field)
```

**Note:** Use multipart/form-data with file upload

#### 2. Remove Avatar

```http
DELETE http://localhost:3000/api/user/avatar
```

---

### Orders APIs (4 endpoints)

#### 1. List Orders

```http
GET http://localhost:3000/api/orders?status=pending&limit=10
```

#### 2. Get Order Details

```http
GET http://localhost:3000/api/orders/{orderSlug}
```

#### 3. Cancel Order

```http
POST http://localhost:3000/api/orders/{orderSlug}/cancel
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

#### 4. Track Order

```http
GET http://localhost:3000/api/orders/{orderSlug}/tracking
```

---

### Wishlist APIs (3 endpoints)

#### 1. Get Wishlist

```http
GET http://localhost:3000/api/user/wishlist
```

#### 2. Add to Wishlist

```http
POST http://localhost:3000/api/user/wishlist
Content-Type: application/json

{
  "itemType": "product",
  "itemSlug": "laptop-dell-xps-15"
}
```

#### 3. Remove from Wishlist

```http
DELETE http://localhost:3000/api/user/wishlist/{wishlistId}
```

---

### Reviews APIs (4 endpoints)

#### 1. Get Reviews

```http
GET http://localhost:3000/api/reviews?productSlug=laptop-dell-xps-15
```

#### 2. Write Review

```http
POST http://localhost:3000/api/reviews
Content-Type: application/json

{
  "productSlug": "laptop-dell-xps-15",
  "rating": 5,
  "title": "Excellent Laptop!",
  "comment": "Best purchase ever. Highly recommend!",
  "verified": true
}
```

#### 3. Update Review

```http
PUT http://localhost:3000/api/reviews/{reviewSlug}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review text"
}
```

#### 4. Delete Review

```http
DELETE http://localhost:3000/api/reviews/{reviewSlug}
```

---

### Messages APIs (4 endpoints)

#### 1. Get Messages

```http
GET http://localhost:3000/api/messages?type=inbox
```

#### 2. Send Message

```http
POST http://localhost:3000/api/messages
Content-Type: application/json

{
  "recipientId": "seller123",
  "subject": "Question about product",
  "message": "Is this still available?"
}
```

#### 3. Mark as Read

```http
PUT http://localhost:3000/api/messages/{messageId}
Content-Type: application/json

{
  "read": true
}
```

#### 4. Delete Message

```http
DELETE http://localhost:3000/api/messages/{messageId}
```

---

### Bidding APIs (2 endpoints)

#### 1. Place Bid

```http
POST http://localhost:3000/api/auctions/{auctionSlug}/bid
Content-Type: application/json

{
  "amount": 15000
}
```

#### 2. Get User Bids

```http
GET http://localhost:3000/api/user/bids
```

---

### Checkout API (1 endpoint)

```http
POST http://localhost:3000/api/checkout
Content-Type: application/json

{
  "addressId": "addr123",
  "paymentMethod": "razorpay",
  "shippingMethod": "standard"
}
```

---

## 🏪 Seller API Tests

**Note:** Register with `"role": "seller"` on localhost to test seller APIs.

### Seller Dashboard (1 endpoint)

```http
GET http://localhost:3000/api/seller/dashboard
```

**Expected:** Stats, recent orders, products count

---

### Seller Analytics (1 endpoint)

```http
GET http://localhost:3000/api/seller/analytics?period=30days
```

**Parameters:**

- `period`: 7days, 30days, 90days, 365days

**Expected:** Revenue metrics, order stats, product performance, top products, reviews

---

### Seller Products (3 endpoints)

#### 1. List Seller Products

```http
GET http://localhost:3000/api/seller/products?status=active
```

#### 2. Create Product

```http
POST http://localhost:3000/api/seller/products
Content-Type: application/json

{
  "name": "Test Product",
  "description": "Test description",
  "price": 999,
  "category": "electronics",
  "stock": 10,
  "images": ["https://example.com/image.jpg"]
}
```

#### 3. Update/Delete Product

```http
PUT http://localhost:3000/api/seller/products/{productId}
Content-Type: application/json

{
  "price": 899,
  "stock": 15
}

DELETE http://localhost:3000/api/seller/products/{productId}
```

---

### Seller Auctions (4 endpoints)

#### 1. List Seller Auctions

```http
GET http://localhost:3000/api/seller/auctions
```

#### 2. Create Auction

```http
POST http://localhost:3000/api/seller/auctions
Content-Type: application/json

{
  "title": "Test Auction",
  "description": "Test description",
  "startingBid": 5000,
  "reservePrice": 10000,
  "startTime": "2026-01-25T10:00:00Z",
  "endTime": "2026-01-30T10:00:00Z"
}
```

#### 3. Update Auction

```http
PUT http://localhost:3000/api/seller/auctions/{auctionId}
Content-Type: application/json

{
  "description": "Updated description"
}
```

#### 4. End Auction

```http
POST http://localhost:3000/api/seller/auctions/{auctionId}/end
```

---

### Seller Orders (2 endpoints)

#### 1. List Orders

```http
GET http://localhost:3000/api/seller/orders?status=pending
```

#### 2. Update Order Status

```http
PUT http://localhost:3000/api/seller/orders/{orderId}/status
Content-Type: application/json

{
  "status": "processing",
  "notes": "Order being prepared"
}
```

---

### Seller Shop (1 endpoint)

#### Get/Update Shop Profile

```http
GET http://localhost:3000/api/seller/shop

PUT http://localhost:3000/api/seller/shop
Content-Type: application/json

{
  "name": "My Shop",
  "description": "Shop description",
  "logo": "https://example.com/logo.jpg",
  "banner": "https://example.com/banner.jpg"
}
```

---

## 👑 Admin API Tests

**Note:** Register with `"role": "admin"` on localhost to test admin APIs.

### Admin Dashboard (1 endpoint)

```http
GET http://localhost:3000/api/admin/dashboard
```

---

### Admin Analytics (1 endpoint)

```http
GET http://localhost:3000/api/admin/analytics?period=30days
```

**Parameters:**

- `period`: 7days, 30days, 90days, 365days

**Expected:** Platform-wide metrics, user growth, revenue, orders, top sellers, pending approvals

---

### Admin Users (4 endpoints)

#### 1. List Users

```http
GET http://localhost:3000/api/admin/users?role=user&status=active
```

#### 2. Get User Details

```http
GET http://localhost:3000/api/admin/users/{userId}
```

#### 3. Update User Role

```http
PUT http://localhost:3000/api/admin/users/{userId}/role
Content-Type: application/json

{
  "role": "seller"
}
```

#### 4. Update User Status

```http
PUT http://localhost:3000/api/admin/users/{userId}/status
Content-Type: application/json

{
  "status": "suspended",
  "reason": "Policy violation"
}
```

---

### Admin Products (2 endpoints)

#### 1. List All Products

```http
GET http://localhost:3000/api/admin/products?status=pending
```

#### 2. Approve/Reject Product

```http
PUT http://localhost:3000/api/admin/products/{productId}/approve
Content-Type: application/json

{
  "status": "active",
  "notes": "Approved"
}
```

---

### Admin Auctions (2 endpoints)

#### 1. List All Auctions

```http
GET http://localhost:3000/api/admin/auctions?status=pending
```

#### 2. Approve/Reject Auction

```http
PUT http://localhost:3000/api/admin/auctions/{auctionId}/approve
Content-Type: application/json

{
  "status": "active",
  "reason": "Meets all requirements"
}
```

---

### Admin Categories (3 endpoints)

#### 1. List Categories

```http
GET http://localhost:3000/api/admin/categories
```

#### 2. Create Category

```http
POST http://localhost:3000/api/admin/categories
Content-Type: application/json

{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parentId": null
}
```

#### 3. Update/Delete Category

```http
PUT http://localhost:3000/api/admin/categories/{categoryId}
Content-Type: application/json

{
  "name": "Updated Category"
}

DELETE http://localhost:3000/api/admin/categories/{categoryId}
```

---

### Admin Orders (1 endpoint)

```http
GET http://localhost:3000/api/admin/orders?status=all&limit=50
```

---

### Admin CMS - Pages (4 endpoints)

#### 1. List CMS Pages

```http
GET http://localhost:3000/api/admin/cms/pages?status=published
```

#### 2. Create Page

```http
POST http://localhost:3000/api/admin/cms/pages
Content-Type: application/json

{
  "slug": "about",
  "title": "About Us",
  "content": "<p>Content here</p>",
  "metaDescription": "About our company",
  "published": true
}
```

#### 3. Get Page Details

```http
GET http://localhost:3000/api/admin/cms/pages/{pageId}
```

#### 4. Update/Delete Page

```http
PUT http://localhost:3000/api/admin/cms/pages/{pageId}
Content-Type: application/json

{
  "title": "Updated Title",
  "published": false
}

DELETE http://localhost:3000/api/admin/cms/pages/{pageId}
```

---

### Admin CMS - Banners (4 endpoints)

#### 1. List Banners

```http
GET http://localhost:3000/api/admin/cms/banners?status=active
```

#### 2. Create Banner

```http
POST http://localhost:3000/api/admin/cms/banners
Content-Type: application/json

{
  "title": "Summer Sale",
  "subtitle": "Up to 50% off",
  "image": "https://example.com/banner.jpg",
  "link": "/sale",
  "active": true,
  "order": 1,
  "startDate": "2026-06-01",
  "endDate": "2026-08-31"
}
```

#### 3. Get Banner Details

```http
GET http://localhost:3000/api/admin/cms/banners/{bannerId}
```

#### 4. Update/Delete Banner

```http
PUT http://localhost:3000/api/admin/cms/banners/{bannerId}
Content-Type: application/json

{
  "active": false
}

DELETE http://localhost:3000/api/admin/cms/banners/{bannerId}
```

---

## 🧪 Testing Checklist

### Authentication Tests

- [ ] Register new user
- [ ] Login existing user
- [ ] Get session
- [ ] Access protected endpoint without auth (should return 401)
- [ ] Logout

### Role-Based Access Tests

- [ ] User accessing seller endpoint (should return 403)
- [ ] User accessing admin endpoint (should return 403)
- [ ] Seller accessing admin endpoint (should return 403)
- [ ] Seller accessing seller endpoints (should succeed)
- [ ] Admin accessing all endpoints (should succeed)

### Ownership Verification Tests

- [ ] User A accessing User B's cart (should return 403)
- [ ] User A updating User B's address (should return 403)
- [ ] User A viewing User B's orders (should return 403)
- [ ] Seller A updating Seller B's product (should return 403)

### CRUD Operations Tests

For each resource (cart, addresses, orders, etc.):

- [ ] Create
- [ ] Read (list and detail)
- [ ] Update
- [ ] Delete

### New Features Tests (Optional APIs)

- [ ] Upload avatar (multipart/form-data)
- [ ] Remove avatar
- [ ] Get seller analytics (different periods)
- [ ] Get admin analytics (platform-wide)
- [ ] Create/update CMS pages
- [ ] Create/update CMS banners
- [ ] Verify banner scheduling (startDate/endDate)

### Error Handling Tests

- [ ] Invalid data (400 Bad Request)
- [ ] Missing required fields (400)
- [ ] Resource not found (404)
- [ ] Unauthorized access (401)
- [ ] Forbidden access (403)
- [ ] Server errors (500)

---

## 📊 Expected Response Codes

| Code | Meaning      | When to Expect               |
| ---- | ------------ | ---------------------------- |
| 200  | OK           | Successful GET, PUT, DELETE  |
| 201  | Created      | Successful POST              |
| 400  | Bad Request  | Invalid data, missing fields |
| 401  | Unauthorized | No session, invalid token    |
| 403  | Forbidden    | Wrong role, not owner        |
| 404  | Not Found    | Resource doesn't exist       |
| 409  | Conflict     | Duplicate entry              |
| 500  | Server Error | Internal error               |

---

## 🔧 Debugging Tips

### Check Session Cookie

In Postman/Thunder Client:

1. Go to Cookies tab
2. Verify `session` cookie is present
3. Check cookie is sent with requests

### Common Issues

**401 Unauthorized:**

- Session cookie not set or expired
- Need to login/register first

**403 Forbidden:**

- User doesn't have required role
- Trying to access another user's resources

**404 Not Found:**

- Resource ID/slug is incorrect
- Resource was deleted

**500 Server Error:**

- Check API logs in terminal
- Firebase connection issues
- Firestore permission errors

---

## 🚀 Postman Collection

You can create a Postman collection with:

1. Environment variable for `baseUrl`: `http://localhost:3000`
2. Automatic cookie handling enabled
3. Tests for response validation

Example test script:

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has success property", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.eql(true);
});
```

---

## 📝 Notes

1. All tests assume local development (localhost:3000)
2. Session cookies are httpOnly and secure in production
3. Firebase ID tokens expire after 1 hour
4. Session duration is 7 days (configurable in session.ts)
5. All timestamps are in ISO 8601 format
6. All prices are in paisa (INR × 100)
7. **Avatar uploads:** Use multipart/form-data with max 5MB file size
8. **Analytics:** Support 7/30/90/365 days period filters
9. **CMS Pages:** Markdown/HTML content supported
10. **CMS Banners:** Can schedule with startDate/endDate

---

**Total APIs: 54 endpoints** (46 core + 8 optional)

- User: 25 endpoints
- Seller: 10 endpoints
- Admin: 19 endpoints

**Ready to Test!** Start with authentication, then test each endpoint category systematically.
