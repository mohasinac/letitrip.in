# Test Data Requirements

## Overview

This document defines the test data requirements for all resources in the JustForView.in platform. Test data should be used for unit tests, integration tests, and E2E scenarios.

---

## Test User Accounts

### Admin Users

| Field       | Test Admin 1           | Test Admin 2           |
| ----------- | ---------------------- | ---------------------- |
| uid         | `test_admin_001`       | `test_admin_002`       |
| email       | `admin@test.jfv.in`    | `admin2@test.jfv.in`   |
| displayName | Test Admin             | Test Admin 2           |
| role        | `admin`                | `admin`                |
| phone       | `+919876543210`        | `+919876543211`        |
| isActive    | `true`                 | `true`                 |
| verified    | `true`                 | `true`                 |
| createdAt   | `2024-01-01T00:00:00Z` | `2024-06-01T00:00:00Z` |

### Seller Users

| Field       | Active Seller          | Inactive Seller        | Unverified Seller      |
| ----------- | ---------------------- | ---------------------- | ---------------------- |
| uid         | `test_seller_001`      | `test_seller_002`      | `test_seller_003`      |
| email       | `seller@test.jfv.in`   | `seller2@test.jfv.in`  | `seller3@test.jfv.in`  |
| displayName | Test Seller            | Inactive Seller        | Unverified Seller      |
| role        | `seller`               | `seller`               | `seller`               |
| shopId      | `test_shop_001`        | `test_shop_002`        | `null`                 |
| isActive    | `true`                 | `false`                | `true`                 |
| verified    | `true`                 | `true`                 | `false`                |
| phone       | `+919876543220`        | `+919876543221`        | `+919876543222`        |
| createdAt   | `2024-01-15T00:00:00Z` | `2024-02-15T00:00:00Z` | `2024-03-15T00:00:00Z` |

### Regular Users

| Field       | Active User            | Inactive User          | Banned User            |
| ----------- | ---------------------- | ---------------------- | ---------------------- |
| uid         | `test_user_001`        | `test_user_002`        | `test_user_003`        |
| email       | `user@test.jfv.in`     | `user2@test.jfv.in`    | `banned@test.jfv.in`   |
| displayName | Test User              | Inactive User          | Banned User            |
| role        | `user`                 | `user`                 | `user`                 |
| isActive    | `true`                 | `false`                | `false`                |
| isBanned    | `false`                | `false`                | `true`                 |
| phone       | `+919876543230`        | `+919876543231`        | `+919876543232`        |
| createdAt   | `2024-02-01T00:00:00Z` | `2024-03-01T00:00:00Z` | `2024-04-01T00:00:00Z` |

---

## Test Shops

| Field        | Active Shop            | Inactive Shop          | Pending Shop           |
| ------------ | ---------------------- | ---------------------- | ---------------------- |
| id           | `test_shop_001`        | `test_shop_002`        | `test_shop_003`        |
| name         | Test Electronics Store | Inactive Store         | Pending Store          |
| slug         | `test-electronics`     | `inactive-store`       | `pending-store`        |
| ownerId      | `test_seller_001`      | `test_seller_002`      | `test_seller_003`      |
| status       | `active`               | `inactive`             | `pending`              |
| isVerified   | `true`                 | `true`                 | `false`                |
| description  | Premium electronics... | Inactive store desc    | Pending store desc     |
| rating       | `4.5`                  | `3.2`                  | `0`                    |
| reviewCount  | `156`                  | `42`                   | `0`                    |
| productCount | `45`                   | `12`                   | `0`                    |
| totalSales   | `250000`               | `50000`                | `0`                    |
| createdAt    | `2024-01-15T00:00:00Z` | `2024-02-15T00:00:00Z` | `2024-03-15T00:00:00Z` |

---

## Test Categories

### Root Categories

| Field    | Electronics       | Fashion       | Home & Living |
| -------- | ----------------- | ------------- | ------------- |
| id       | `cat_electronics` | `cat_fashion` | `cat_home`    |
| name     | Electronics       | Fashion       | Home & Living |
| slug     | `electronics`     | `fashion`     | `home-living` |
| parentId | `null`            | `null`        | `null`        |
| level    | `0`               | `0`           | `0`           |
| isActive | `true`            | `true`        | `true`        |
| order    | `1`               | `2`           | `3`           |

### Sub Categories

| Field    | Mobiles           | Laptops           | Men's Clothing      |
| -------- | ----------------- | ----------------- | ------------------- |
| id       | `cat_mobiles`     | `cat_laptops`     | `cat_mens_clothing` |
| name     | Mobiles           | Laptops           | Men's Clothing      |
| slug     | `mobiles`         | `laptops`         | `mens-clothing`     |
| parentId | `cat_electronics` | `cat_electronics` | `cat_fashion`       |
| level    | `1`               | `1`               | `1`                 |
| isActive | `true`            | `true`            | `true`              |
| order    | `1`               | `2`               | `1`                 |

---

## Test Products

### Active Products

| Field        | Product 1              | Product 2              | Product 3              |
| ------------ | ---------------------- | ---------------------- | ---------------------- |
| id           | `test_product_001`     | `test_product_002`     | `test_product_003`     |
| name         | iPhone 15 Pro          | MacBook Pro M3         | Samsung Galaxy S24     |
| slug         | `iphone-15-pro`        | `macbook-pro-m3`       | `samsung-galaxy-s24`   |
| shopId       | `test_shop_001`        | `test_shop_001`        | `test_shop_001`        |
| categoryId   | `cat_mobiles`          | `cat_laptops`          | `cat_mobiles`          |
| price        | `129900`               | `199900`               | `79900`                |
| comparePrice | `139900`               | `229900`               | `89900`                |
| quantity     | `50`                   | `25`                   | `100`                  |
| status       | `active`               | `active`               | `active`               |
| isAuction    | `false`                | `false`                | `false`                |
| rating       | `4.7`                  | `4.9`                  | `4.5`                  |
| reviewCount  | `234`                  | `89`                   | `156`                  |
| soldCount    | `1250`                 | `450`                  | `890`                  |
| createdAt    | `2024-01-20T00:00:00Z` | `2024-01-25T00:00:00Z` | `2024-02-01T00:00:00Z` |

### Draft/Inactive Products

| Field      | Draft Product          | Inactive Product        |
| ---------- | ---------------------- | ----------------------- |
| id         | `test_product_draft`   | `test_product_inactive` |
| name       | Draft Product          | Inactive Product        |
| slug       | `draft-product`        | `inactive-product`      |
| shopId     | `test_shop_001`        | `test_shop_001`         |
| categoryId | `cat_mobiles`          | `cat_laptops`           |
| price      | `50000`                | `30000`                 |
| quantity   | `10`                   | `0`                     |
| status     | `draft`                | `inactive`              |
| createdAt  | `2024-03-01T00:00:00Z` | `2024-02-15T00:00:00Z`  |

---

## Test Auctions

### Active Auction

| Field           | Value                      |
| --------------- | -------------------------- |
| id              | `test_auction_001`         |
| productId       | `test_auction_product_001` |
| title           | Vintage Watch Auction      |
| slug            | `vintage-watch-auction`    |
| shopId          | `test_shop_001`            |
| sellerId        | `test_seller_001`          |
| startingPrice   | `5000`                     |
| currentPrice    | `12500`                    |
| reservePrice    | `15000`                    |
| minBidIncrement | `500`                      |
| bidCount        | `15`                       |
| status          | `active`                   |
| startTime       | `2024-11-01T10:00:00Z`     |
| endTime         | `2024-12-15T22:00:00Z`     |
| createdAt       | `2024-10-25T00:00:00Z`     |

### Ended Auction (Sold)

| Field         | Value                      |
| ------------- | -------------------------- |
| id            | `test_auction_002`         |
| productId     | `test_auction_product_002` |
| title         | Antique Clock Auction      |
| slug          | `antique-clock-auction`    |
| shopId        | `test_shop_001`            |
| sellerId      | `test_seller_001`          |
| startingPrice | `10000`                    |
| currentPrice  | `45000`                    |
| reservePrice  | `30000`                    |
| bidCount      | `28`                       |
| status        | `ended`                    |
| winnerId      | `test_user_001`            |
| startTime     | `2024-09-01T10:00:00Z`     |
| endTime       | `2024-10-01T22:00:00Z`     |
| createdAt     | `2024-08-25T00:00:00Z`     |

### Scheduled Auction

| Field         | Value                      |
| ------------- | -------------------------- |
| id            | `test_auction_003`         |
| productId     | `test_auction_product_003` |
| title         | Upcoming Auction           |
| slug          | `upcoming-auction`         |
| shopId        | `test_shop_001`            |
| sellerId      | `test_seller_001`          |
| startingPrice | `20000`                    |
| currentPrice  | `20000`                    |
| bidCount      | `0`                        |
| status        | `scheduled`                |
| startTime     | `2024-12-01T10:00:00Z`     |
| endTime       | `2024-12-20T22:00:00Z`     |
| createdAt     | `2024-11-15T00:00:00Z`     |

---

## Test Bids

| Field     | Bid 1               | Bid 2               | Bid 3               |
| --------- | ------------------- | ------------------- | ------------------- |
| id        | `test_bid_001`      | `test_bid_002`      | `test_bid_003`      |
| auctionId | `test_auction_001`  | `test_auction_001`  | `test_auction_001`  |
| userId    | `test_user_001`     | `test_user_002`     | `test_user_001`     |
| amount    | `5500`              | `6000`              | `7000`              |
| isAutoBid | `false`             | `false`             | `true`              |
| maxBid    | `null`              | `null`              | `15000`             |
| createdAt | `2024-11-01T10:05Z` | `2024-11-01T10:10Z` | `2024-11-01T10:15Z` |

---

## Test Orders

### Completed Order

| Field          | Value                  |
| -------------- | ---------------------- |
| id             | `test_order_001`       |
| userId         | `test_user_001`        |
| shopId         | `test_shop_001`        |
| orderNumber    | `ORD-2024-001234`      |
| status         | `delivered`            |
| paymentStatus  | `paid`                 |
| paymentMethod  | `razorpay`             |
| subtotal       | `129900`               |
| discount       | `5000`                 |
| shipping       | `0`                    |
| tax            | `18000`                |
| total          | `142900`               |
| couponCode     | `SAVE5000`             |
| trackingNumber | `DTDC123456789`        |
| deliveredAt    | `2024-11-20T14:30:00Z` |
| createdAt      | `2024-11-10T09:00:00Z` |

### Pending Order

| Field         | Value                  |
| ------------- | ---------------------- |
| id            | `test_order_002`       |
| userId        | `test_user_001`        |
| shopId        | `test_shop_001`        |
| orderNumber   | `ORD-2024-001235`      |
| status        | `pending`              |
| paymentStatus | `pending`              |
| paymentMethod | `cod`                  |
| subtotal      | `79900`                |
| discount      | `0`                    |
| shipping      | `99`                   |
| tax           | `14382`                |
| total         | `94381`                |
| createdAt     | `2024-11-25T15:00:00Z` |

### Cancelled Order

| Field         | Value                  |
| ------------- | ---------------------- |
| id            | `test_order_003`       |
| userId        | `test_user_002`        |
| shopId        | `test_shop_001`        |
| orderNumber   | `ORD-2024-001236`      |
| status        | `cancelled`            |
| paymentStatus | `refunded`             |
| cancelReason  | `Customer requested`   |
| refundAmount  | `50000`                |
| refundedAt    | `2024-11-22T10:00:00Z` |
| createdAt     | `2024-11-20T12:00:00Z` |

---

## Test Order Items

| Field     | Item 1             | Item 2             | Item 3             |
| --------- | ------------------ | ------------------ | ------------------ |
| id        | `test_item_001`    | `test_item_002`    | `test_item_003`    |
| orderId   | `test_order_001`   | `test_order_001`   | `test_order_002`   |
| productId | `test_product_001` | `test_product_003` | `test_product_002` |
| name      | iPhone 15 Pro      | Samsung Galaxy S24 | MacBook Pro M3     |
| price     | `129900`           | `79900`            | `199900`           |
| quantity  | `1`                | `2`                | `1`                |
| subtotal  | `129900`           | `159800`           | `199900`           |

---

## Test Cart

### User Cart with Items

| Field     | Value                          |
| --------- | ------------------------------ |
| id        | `test_cart_001`                |
| userId    | `test_user_001`                |
| items     | [cart_item_001, cart_item_002] |
| subtotal  | `209800`                       |
| itemCount | `2`                            |
| updatedAt | `2024-11-28T10:00:00Z`         |

### Cart Items

| Field     | Cart Item 1         | Cart Item 2         |
| --------- | ------------------- | ------------------- |
| id        | `cart_item_001`     | `cart_item_002`     |
| productId | `test_product_001`  | `test_product_003`  |
| quantity  | `1`                 | `1`                 |
| price     | `129900`            | `79900`             |
| addedAt   | `2024-11-28T09:00Z` | `2024-11-28T10:00Z` |

---

## Test Reviews

| Field        | Review 1            | Review 2            | Review 3            |
| ------------ | ------------------- | ------------------- | ------------------- |
| id           | `test_review_001`   | `test_review_002`   | `test_review_003`   |
| productId    | `test_product_001`  | `test_product_001`  | `test_product_002`  |
| userId       | `test_user_001`     | `test_user_002`     | `test_user_001`     |
| shopId       | `test_shop_001`     | `test_shop_001`     | `test_shop_001`     |
| rating       | `5`                 | `4`                 | `5`                 |
| title        | Excellent!          | Good product        | Amazing laptop      |
| content      | Best phone I've...  | Works well but...   | Super fast and...   |
| status       | `approved`          | `approved`          | `pending`           |
| helpfulVotes | `42`                | `15`                | `0`                 |
| createdAt    | `2024-11-01T00:00Z` | `2024-11-05T00:00Z` | `2024-11-28T00:00Z` |

---

## Test Coupons

| Field         | Percentage Coupon   | Fixed Coupon        | Expired Coupon      |
| ------------- | ------------------- | ------------------- | ------------------- |
| id            | `test_coupon_001`   | `test_coupon_002`   | `test_coupon_003`   |
| code          | `SAVE10`            | `FLAT500`           | `EXPIRED20`         |
| type          | `percentage`        | `fixed`             | `percentage`        |
| value         | `10`                | `500`               | `20`                |
| minOrderValue | `1000`              | `2000`              | `500`               |
| maxDiscount   | `5000`              | `500`               | `1000`              |
| usageLimit    | `100`               | `50`                | `100`               |
| usedCount     | `25`                | `12`                | `100`               |
| shopId        | `null`              | `test_shop_001`     | `null`              |
| isActive      | `true`              | `true`              | `false`             |
| startDate     | `2024-11-01`        | `2024-11-15`        | `2024-01-01`        |
| endDate       | `2024-12-31`        | `2024-12-31`        | `2024-06-30`        |
| createdAt     | `2024-10-25T00:00Z` | `2024-11-10T00:00Z` | `2024-01-01T00:00Z` |

---

## Test Returns

| Field        | Pending Return      | Approved Return      | Rejected Return     |
| ------------ | ------------------- | -------------------- | ------------------- |
| id           | `test_return_001`   | `test_return_002`    | `test_return_003`   |
| orderId      | `test_order_001`    | `test_order_002`     | `test_order_003`    |
| orderItemId  | `test_item_001`     | `test_item_002`      | `test_item_003`     |
| userId       | `test_user_001`     | `test_user_001`      | `test_user_002`     |
| shopId       | `test_shop_001`     | `test_shop_001`      | `test_shop_001`     |
| reason       | `defective`         | `wrong_item`         | `changed_mind`      |
| description  | Product not working | Received wrong color | Don't need anymore  |
| status       | `pending`           | `approved`           | `rejected`          |
| refundAmount | `129900`            | `79900`              | `0`                 |
| refundStatus | `pending`           | `processed`          | `na`                |
| adminNotes   | `null`              | `Approved by admin`  | `Policy violation`  |
| createdAt    | `2024-11-25T00:00Z` | `2024-11-20T00:00Z`  | `2024-11-22T00:00Z` |

---

## Test Support Tickets

| Field        | Open Ticket         | In Progress         | Resolved Ticket       |
| ------------ | ------------------- | ------------------- | --------------------- |
| id           | `test_ticket_001`   | `test_ticket_002`   | `test_ticket_003`     |
| ticketNumber | `TKT-2024-001234`   | `TKT-2024-001235`   | `TKT-2024-001236`     |
| userId       | `test_user_001`     | `test_user_002`     | `test_user_001`       |
| category     | `order_issue`       | `payment`           | `product_inquiry`     |
| subject      | Order not delivered | Payment failed      | Product question      |
| description  | I ordered 5 days... | My payment was...   | Is this compatible... |
| priority     | `high`              | `medium`            | `low`                 |
| status       | `open`              | `in_progress`       | `resolved`            |
| assignedTo   | `null`              | `test_admin_001`    | `test_admin_001`      |
| orderId      | `test_order_002`    | `test_order_003`    | `null`                |
| createdAt    | `2024-11-27T00:00Z` | `2024-11-25T00:00Z` | `2024-11-20T00:00Z`   |
| resolvedAt   | `null`              | `null`              | `2024-11-22T00:00Z`   |

---

## Test Payments

| Field        | Successful Payment  | Failed Payment      | Refunded Payment    |
| ------------ | ------------------- | ------------------- | ------------------- |
| id           | `test_payment_001`  | `test_payment_002`  | `test_payment_003`  |
| orderId      | `test_order_001`    | `test_order_003`    | `test_order_003`    |
| userId       | `test_user_001`     | `test_user_002`     | `test_user_002`     |
| amount       | `142900`            | `94381`             | `50000`             |
| currency     | `INR`               | `INR`               | `INR`               |
| method       | `upi`               | `card`              | `upi`               |
| provider     | `razorpay`          | `razorpay`          | `razorpay`          |
| status       | `captured`          | `failed`            | `refunded`          |
| razorpayId   | `pay_test123456`    | `pay_test789012`    | `pay_test345678`    |
| errorCode    | `null`              | `BAD_REQUEST_ERROR` | `null`              |
| errorMessage | `null`              | `Card declined`     | `null`              |
| createdAt    | `2024-11-10T09:05Z` | `2024-11-20T12:05Z` | `2024-11-22T10:00Z` |

---

## Test Payouts

| Field         | Pending Payout      | Processed Payout    | Failed Payout       |
| ------------- | ------------------- | ------------------- | ------------------- |
| id            | `test_payout_001`   | `test_payout_002`   | `test_payout_003`   |
| shopId        | `test_shop_001`     | `test_shop_001`     | `test_shop_002`     |
| sellerId      | `test_seller_001`   | `test_seller_001`   | `test_seller_002`   |
| amount        | `50000`             | `100000`            | `25000`             |
| status        | `pending`           | `processed`         | `failed`            |
| bankAccount   | `xxxx1234`          | `xxxx1234`          | `xxxx5678`          |
| transactionId | `null`              | `TXN123456789`      | `null`              |
| failureReason | `null`              | `null`              | `Invalid account`   |
| requestedAt   | `2024-11-28T00:00Z` | `2024-11-15T00:00Z` | `2024-11-20T00:00Z` |
| processedAt   | `null`              | `2024-11-17T10:00Z` | `null`              |

---

## Test Addresses

| Field        | Home Address       | Office Address     |
| ------------ | ------------------ | ------------------ |
| id           | `test_address_001` | `test_address_002` |
| userId       | `test_user_001`    | `test_user_001`    |
| type         | `home`             | `office`           |
| name         | John Doe           | John Doe           |
| phone        | `+919876543230`    | `+919876543230`    |
| addressLine1 | 123 Main Street    | Tech Park, Tower B |
| addressLine2 | Apartment 4B       | 5th Floor          |
| city         | Mumbai             | Bangalore          |
| state        | Maharashtra        | Karnataka          |
| pincode      | `400001`           | `560001`           |
| country      | India              | India              |
| isDefault    | `true`             | `false`            |

---

## Test Hero Slides

| Field     | Slide 1              | Slide 2           | Inactive Slide    |
| --------- | -------------------- | ----------------- | ----------------- |
| id        | `test_slide_001`     | `test_slide_002`  | `test_slide_003`  |
| title     | Black Friday Sale    | New Arrivals      | Old Promotion     |
| subtitle  | Up to 70% off        | Check out latest  | Expired offer     |
| imageUrl  | `/slides/bf.jpg`     | `/slides/new.jpg` | `/slides/old.jpg` |
| linkUrl   | `/sale/black-friday` | `/new-arrivals`   | `/old-promo`      |
| order     | `1`                  | `2`               | `3`               |
| isActive  | `true`               | `true`            | `false`           |
| startDate | `2024-11-20`         | `2024-11-01`      | `2024-01-01`      |
| endDate   | `2024-12-01`         | `2024-12-31`      | `2024-06-30`      |

---

## Test Media

| Field        | Product Image         | Shop Logo           | Review Image         |
| ------------ | --------------------- | ------------------- | -------------------- |
| id           | `test_media_001`      | `test_media_002`    | `test_media_003`     |
| type         | `image`               | `image`             | `image`              |
| url          | `/products/001.jpg`   | `/shops/logo.jpg`   | `/reviews/001.jpg`   |
| thumbnailUrl | `/products/001_t.jpg` | `/shops/logo_t.jpg` | `/reviews/001_t.jpg` |
| filename     | `iphone-15-pro.jpg`   | `shop-logo.jpg`     | `review-photo.jpg`   |
| size         | `256000`              | `48000`             | `128000`             |
| mimeType     | `image/jpeg`          | `image/jpeg`        | `image/jpeg`         |
| width        | `1200`                | `400`               | `800`                |
| height       | `1200`                | `400`               | `600`                |
| uploadedBy   | `test_seller_001`     | `test_seller_001`   | `test_user_001`      |
| createdAt    | `2024-01-20T00:00Z`   | `2024-01-15T00:00Z` | `2024-11-01T00:00Z`  |

---

## Test Blog Posts

| Field         | Published Post          | Draft Post             | Scheduled Post         |
| ------------- | ----------------------- | ---------------------- | ---------------------- |
| id            | `test_blog_001`         | `test_blog_002`        | `test_blog_003`        |
| title         | Getting Started Guide   | Draft Article          | Upcoming Feature       |
| slug          | `getting-started`       | `draft-article`        | `upcoming-feature`     |
| content       | Full article content... | Draft content...       | Feature preview...     |
| excerpt       | Learn how to get...     | This is a draft...     | Coming soon...         |
| featuredImage | `/blog/getting.jpg`     | `/blog/draft.jpg`      | `/blog/upcoming.jpg`   |
| categoryId    | `blog_cat_guides`       | `blog_cat_news`        | `blog_cat_updates`     |
| tags          | [`beginner`, `guide`]   | [`internal`]           | [`feature`, `preview`] |
| authorId      | `test_admin_001`        | `test_admin_001`       | `test_admin_002`       |
| authorName    | Test Admin              | Test Admin             | Test Admin 2           |
| status        | `published`             | `draft`                | `scheduled`            |
| publishedAt   | `2024-11-01T10:00:00Z`  | `null`                 | `null`                 |
| scheduledAt   | `null`                  | `null`                 | `2024-12-01T10:00:00Z` |
| viewCount     | `1250`                  | `0`                    | `0`                    |
| createdAt     | `2024-10-25T00:00:00Z`  | `2024-11-20T00:00:00Z` | `2024-11-25T00:00:00Z` |

---

## Test Blog Categories

| Field        | Guides              | News                | Updates             |
| ------------ | ------------------- | ------------------- | ------------------- |
| id           | `blog_cat_guides`   | `blog_cat_news`     | `blog_cat_updates`  |
| name         | Guides              | News                | Updates             |
| slug         | `guides`            | `news`              | `updates`           |
| description  | How-to guides...    | Latest news...      | Platform updates... |
| parentId     | `null`              | `null`              | `null`              |
| displayOrder | `1`                 | `2`                 | `3`                 |
| postCount    | `15`                | `8`                 | `5`                 |
| createdAt    | `2024-01-01T00:00Z` | `2024-01-01T00:00Z` | `2024-01-01T00:00Z` |

---

## Test Blog Tags

| Field     | Beginner Tag        | Feature Tag         | Guide Tag           |
| --------- | ------------------- | ------------------- | ------------------- |
| id        | `blog_tag_beginner` | `blog_tag_feature`  | `blog_tag_guide`    |
| name      | Beginner            | Feature             | Guide               |
| slug      | `beginner`          | `feature`           | `guide`             |
| postCount | `5`                 | `3`                 | `10`                |
| createdAt | `2024-01-01T00:00Z` | `2024-01-01T00:00Z` | `2024-01-01T00:00Z` |

---

## Test Favorites

| Field         | Product Favorite       | Auction Favorite       | With Notifications                   |
| ------------- | ---------------------- | ---------------------- | ------------------------------------ |
| id            | `test_fav_001`         | `test_fav_002`         | `test_fav_003`                       |
| userId        | `test_user_001`        | `test_user_001`        | `test_user_002`                      |
| itemId        | `test_product_001`     | `test_auction_001`     | `test_product_002`                   |
| itemType      | `product`              | `auction`              | `product`                            |
| itemSnapshot  | {title, image, price}  | {title, image, price}  | {title, image, price}                |
| notifications | {priceDrop: false}     | {reminder: true}       | {priceDrop: true, backInStock: true} |
| createdAt     | `2024-11-20T00:00:00Z` | `2024-11-22T00:00:00Z` | `2024-11-25T00:00:00Z`               |

---

## Test Conversations

| Field            | Buyer-Seller Conv      | Order Inquiry          | Support Chat           |
| ---------------- | ---------------------- | ---------------------- | ---------------------- |
| id               | `test_conv_001`        | `test_conv_002`        | `test_conv_003`        |
| type             | `buyer_seller`         | `order`                | `support`              |
| senderId         | `test_user_001`        | `test_user_001`        | `test_user_002`        |
| senderName       | Test User              | Test User              | Test User 2            |
| senderType       | `user`                 | `user`                 | `user`                 |
| recipientId      | `test_seller_001`      | `test_seller_001`      | `test_admin_001`       |
| recipientName    | Test Seller            | Test Seller            | Support                |
| recipientType    | `seller`               | `seller`               | `admin`                |
| subject          | Product Question       | Order Status           | Account Help           |
| contextOrderId   | `null`                 | `test_order_001`       | `null`                 |
| contextProductId | `test_product_001`     | `null`                 | `null`                 |
| status           | `active`               | `active`               | `resolved`             |
| createdAt        | `2024-11-25T00:00:00Z` | `2024-11-26T00:00:00Z` | `2024-11-20T00:00:00Z` |

---

## Test Messages

| Field          | Message 1              | Message 2              | Message 3              |
| -------------- | ---------------------- | ---------------------- | ---------------------- |
| id             | `test_msg_001`         | `test_msg_002`         | `test_msg_003`         |
| conversationId | `test_conv_001`        | `test_conv_001`        | `test_conv_002`        |
| senderId       | `test_user_001`        | `test_seller_001`      | `test_user_001`        |
| senderName     | Test User              | Test Seller            | Test User              |
| senderType     | `user`                 | `seller`               | `user`                 |
| content        | Is this available?     | Yes, it is!            | Where is my order?     |
| attachments    | []                     | []                     | [{url: '/img.jpg'}]    |
| readBy         | {seller: timestamp}    | {}                     | {}                     |
| isDeleted      | `false`                | `false`                | `false`                |
| createdAt      | `2024-11-25T10:00:00Z` | `2024-11-25T10:30:00Z` | `2024-11-26T09:00:00Z` |

---

## Test System Settings

### General Settings

| Field           | Value                                                      |
| --------------- | ---------------------------------------------------------- |
| collection      | `site_settings/general`                                    |
| siteName        | LET IT RIP - JustForView.in                                |
| siteDescription | India's Premier Platform for Beyblades, TCG & Collectibles |
| siteTagline     | Your Gateway to Authentic Collectibles                     |
| contactEmail    | contact@test.jfv.in                                        |
| contactPhone    | +919876543210                                              |
| supportEmail    | support@test.jfv.in                                        |
| currency        | INR                                                        |
| timezone        | Asia/Kolkata                                               |
| locale          | en-IN                                                      |
| updatedAt       | `2024-11-28T00:00:00Z`                                     |
| updatedBy       | `test_admin_001`                                           |

### SEO Settings

| Field                 | Value                                                 |
| --------------------- | ----------------------------------------------------- |
| collection            | `site_settings/seo`                                   |
| defaultTitle          | LET IT RIP - Buy Collectibles in India                |
| defaultDescription    | India's most trusted platform for collectibles        |
| defaultKeywords       | ['beyblades', 'tcg', 'trading cards', 'collectibles'] |
| googleAnalyticsId     | GA-TEST-123                                           |
| googleTagManagerId    | GTM-TEST-123                                          |
| facebookPixelId       | FB-TEST-123                                           |
| structuredDataEnabled | `true`                                                |

### Maintenance Mode

| Field         | Value                           |
| ------------- | ------------------------------- |
| collection    | `site_settings/maintenance`     |
| enabled       | `false`                         |
| message       | We're upgrading our platform... |
| title         | Site Under Maintenance          |
| allowedIps    | ['127.0.0.1', '::1']            |
| showCountdown | `false`                         |

---

## Test Payment Settings

### Razorpay Configuration

| Field              | Value                         |
| ------------------ | ----------------------------- |
| collection         | `payment_settings/razorpay`   |
| enabled            | `true`                        |
| displayName        | Razorpay                      |
| apiKey             | `DEMO_rzp_test_xxxx`          |
| testMode           | `true`                        |
| supportedMethods   | ['card', 'upi', 'netbanking'] |
| minAmount          | 100                           |
| maxAmount          | 1000000                       |
| platformCommission | 2.0% + 18% GST                |

### COD Settings

| Field                | Value                  |
| -------------------- | ---------------------- |
| collection           | `payment_settings/cod` |
| enabled              | `true`                 |
| minOrderAmount       | 500                    |
| maxOrderAmount       | 50000                  |
| codFee               | 50                     |
| excludedPincodes     | ['110001', '400001']   |
| verificationRequired | `true`                 |

---

## Test Shipping Settings

### Shipping Zones

| Zone Name           | States         | Base Rate | Free Shipping | Estimated Days |
| ------------------- | -------------- | --------- | ------------- | -------------- |
| Mumbai Metropolitan | Maharashtra    | ₹50       | ₹999+         | 1-2 days       |
| Delhi NCR           | Delhi, Haryana | ₹60       | ₹999+         | 1-2 days       |
| Metro Cities        | KA, TN, WB, TG | ₹80       | ₹1,499+       | 2-4 days       |
| Tier 1 Cities       | GJ, RJ, MH, UP | ₹100      | ₹1,999+       | 3-5 days       |
| Rest of India       | All            | ₹150      | ₹2,499+       | 5-7 days       |

### Shipping Carriers

| Carrier    | Code      | Tracking URL                             | API Enabled |
| ---------- | --------- | ---------------------------------------- | ----------- |
| Delhivery  | DELHIVERY | https://www.delhivery.com/track/package/ | `true`      |
| Blue Dart  | BLUEDART  | https://www.bluedart.com/tracking/       | `true`      |
| DTDC       | DTDC      | https://www.dtdc.in/tracking.asp         | `true`      |
| India Post | INDIAPOST | https://www.indiapost.gov.in/tracking    | `false`     |

---

## Test Email Settings

### Email Templates

| Template ID        | Subject                                 | Use Case          |
| ------------------ | --------------------------------------- | ----------------- |
| welcome            | Welcome to JustForView - Let It Rip! 🌀 | User registration |
| order_confirmation | Order Confirmed - {{orderNumber}}       | Order placed      |
| order_shipped      | Your Order is On the Way! 📦            | Shipping update   |
| order_delivered    | Order Delivered ✅                      | Delivery confirm  |
| auction_won        | Congratulations! You Won the Auction 🏆 | Auction winner    |
| bid_outbid         | You've Been Outbid! ⚠️                  | Outbid alert      |
| payout_processed   | Payout Processed - ₹{{amount}}          | Seller payout     |
| password_reset     | Reset Your Password                     | Password reset    |

### SMTP Configuration

| Field     | Value                    |
| --------- | ------------------------ |
| provider  | resend                   |
| host      | smtp.resend.com          |
| port      | 587                      |
| fromEmail | noreply@justforview.in   |
| fromName  | LET IT RIP - JustForView |
| replyTo   | support@justforview.in   |
| testMode  | `true`                   |

---

## Test Notification Settings

### Push Notifications

| Field     | Value                   |
| --------- | ----------------------- |
| enabled   | `true`                  |
| provider  | firebase                |
| projectId | `DEMO_justforview-demo` |

### In-App Notifications

| Type            | Enabled | Sound   | Badge   |
| --------------- | ------- | ------- | ------- |
| order_updates   | `true`  | `true`  | `true`  |
| auction_updates | `true`  | `true`  | `true`  |
| messages        | `true`  | `true`  | `true`  |
| promotions      | `true`  | `false` | `false` |
| price_drops     | `true`  | `false` | `true`  |
| back_in_stock   | `true`  | `false` | `true`  |

### SMS Notifications

| Field      | Value         |
| ---------- | ------------- |
| enabled    | `false`       |
| provider   | twilio        |
| fromNumber | +911234567890 |

---

## Test Feature Flags

| Feature            | Value   | Description                   |
| ------------------ | ------- | ----------------------------- |
| auctions           | `true`  | Enable auction functionality  |
| reviews            | `true`  | Enable product reviews        |
| cod                | `true`  | Cash on delivery option       |
| guestCheckout      | `false` | Allow checkout without login  |
| wishlist           | `true`  | User wishlist/favorites       |
| blog               | `true`  | Blog/content system           |
| sellerRegistration | `true`  | Allow new seller registration |
| messaging          | `true`  | Buyer-seller messaging        |
| riplimit           | `true`  | RipLimit virtual currency     |
| autoRenewal        | `true`  | Auto-renew subscriptions      |
| socialLogin        | `true`  | Social media login            |
| twoFactorAuth      | `false` | 2FA authentication            |
| advancedSearch     | `true`  | Advanced search filters       |
| productComparison  | `true`  | Product comparison feature    |
| viewingHistory     | `true`  | Track viewing history         |
| recommendations    | `true`  | AI-powered recommendations    |
| liveChat           | `false` | Live chat support             |
| affiliateProgram   | `false` | Affiliate marketing program   |

---

## Test Business Rules

| Rule                    | Value       |
| ----------------------- | ----------- |
| minProductPrice         | ₹100        |
| maxProductPrice         | ₹10,000,000 |
| minAuctionPrice         | ₹500        |
| minBidIncrement         | ₹50         |
| auctionExtensionMinutes | 5           |
| maxImagesPerProduct     | 10          |
| maxVideosPerProduct     | 3           |
| platformCommission      | 10%         |
| defaultReturnWindow     | 7 days      |
| maxReturnWindow         | 30 days     |

---

## Test RipLimit Settings (E028)

| Field                | Value                        |
| -------------------- | ---------------------------- |
| enabled              | `true`                       |
| conversionRate       | 100 (1 INR = 100 RipLimit)   |
| minPurchase          | 100 RipLimit (₹1)            |
| maxPurchase          | 1,000,000 RipLimit (₹10,000) |
| bidBlockAmount       | 5,000 RipLimit per bid       |
| refundOnOutbid       | `true`                       |
| expiryDays           | 365                          |
| bonusOnFirstPurchase | 1,000 RipLimit               |
| bonusOnReferral      | 500 RipLimit                 |

---

## Test Analytics Settings (E017)

| Field             | Value  |
| ----------------- | ------ |
| enabled           | `true` |
| dataRetentionDays | 90     |
| trackPageViews    | `true` |
| trackEvents       | `true` |
| trackUserBehavior | `true` |
| trackConversions  | `true` |
| anonymizeIp       | `true` |
| exportEnabled     | `true` |
| realtimeEnabled   | `true` |

---

## Test Homepage Featured Sections Settings (E014)

### Hero Carousel Settings

| Field      | Value   |
| ---------- | ------- |
| enabled    | `true`  |
| autoPlay   | `true`  |
| interval   | 5000 ms |
| showArrows | `true`  |
| showDots   | `true`  |
| transition | slide   |

### Section Configuration

| Section            | Enabled | Order | Display | Layout   | Title                |
| ------------------ | ------- | ----- | ------- | -------- | -------------------- |
| valueProposition   | `true`  | 1     | N/A     | banner   | Trust Badges         |
| featuredCategories | `true`  | 2     | 8       | grid     | Shop by Category     |
| featuredProducts   | `true`  | 3     | 8       | grid     | Featured Products    |
| newArrivals        | `true`  | 4     | 8       | carousel | New Arrivals         |
| bestSellers        | `true`  | 5     | 8       | grid     | Best Sellers         |
| onSale             | `true`  | 6     | 12      | grid     | Hot Deals            |
| featuredAuctions   | `true`  | 7     | 6       | grid     | Live Auctions        |
| featuredShops      | `true`  | 8     | 8       | carousel | Featured Shops       |
| featuredBlogs      | `true`  | 9     | 3       | grid     | Latest from Our Blog |
| featuredReviews    | `true`  | 10    | 6       | carousel | Customer Reviews     |
| vintageCollection  | `false` | 11    | 8       | grid     | Vintage & Rare       |

**Collection**: `homepage_settings/current`

**Features**:

- Enable/disable sections
- Reorder sections
- Customize titles/subtitles
- Configure layout (grid, carousel, list)
- Set display count per section

---

## Test Data Generation Utilities

### TypeScript Test Data Factory

```typescript
// /tests/utils/test-data.factory.ts

export const createTestUser = (overrides?: Partial<User>): User => ({
  uid: `test_user_${Date.now()}`,
  email: `test${Date.now()}@test.jfv.in`,
  displayName: "Test User",
  role: "user",
  isActive: true,
  createdAt: new Date(),
  ...overrides,
});

export const createTestProduct = (overrides?: Partial<Product>): Product => ({
  id: `test_product_${Date.now()}`,
  name: "Test Product",
  slug: `test-product-${Date.now()}`,
  price: 10000,
  quantity: 100,
  status: "active",
  shopId: "test_shop_001",
  categoryId: "cat_electronics",
  createdAt: new Date(),
  ...overrides,
});

export const createTestOrder = (overrides?: Partial<Order>): Order => ({
  id: `test_order_${Date.now()}`,
  orderNumber: `ORD-${Date.now()}`,
  userId: "test_user_001",
  shopId: "test_shop_001",
  status: "pending",
  paymentStatus: "pending",
  total: 50000,
  createdAt: new Date(),
  ...overrides,
});

export const createTestBlogPost = (
  overrides?: Partial<BlogPost>,
): BlogPost => ({
  id: `test_blog_${Date.now()}`,
  title: "Test Blog Post",
  slug: `test-blog-${Date.now()}`,
  content: "Test blog content...",
  excerpt: "Test excerpt...",
  featuredImage: "/blog/test.jpg",
  categoryId: "blog_cat_guides",
  tags: ["test"],
  authorId: "test_admin_001",
  authorName: "Test Admin",
  status: "draft",
  publishedAt: null,
  viewCount: 0,
  createdAt: new Date(),
  ...overrides,
});

export const createTestFavorite = (
  overrides?: Partial<Favorite>,
): Favorite => ({
  id: `test_fav_${Date.now()}`,
  userId: "test_user_001",
  itemId: "test_product_001",
  itemType: "product",
  itemSnapshot: {
    title: "Test Product",
    image: "/products/test.jpg",
    price: 10000,
    shopId: "test_shop_001",
    shopName: "Test Shop",
    slug: "test-product",
  },
  notifications: {
    priceDropEnabled: false,
    backInStockEnabled: false,
  },
  createdAt: new Date(),
  ...overrides,
});

export const createTestConversation = (
  overrides?: Partial<Conversation>,
): Conversation => ({
  id: `test_conv_${Date.now()}`,
  type: "buyer_seller",
  participants: {
    senderId: "test_user_001",
    senderName: "Test User",
    senderType: "user",
    recipientId: "test_seller_001",
    recipientName: "Test Seller",
    recipientType: "seller",
  },
  subject: "Product Inquiry",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestMessage = (overrides?: Partial<Message>): Message => ({
  id: `test_msg_${Date.now()}`,
  conversationId: "test_conv_001",
  senderId: "test_user_001",
  senderName: "Test User",
  senderType: "user",
  content: "Test message content",
  attachments: [],
  readBy: {},
  isDeleted: false,
  createdAt: new Date(),
  ...overrides,
});
```

---

## Seed Data Scripts

Location: `/scripts/seed-test-data.ts`

```bash
# Seed test data to Firestore
npm run seed:test

# Clear test data
npm run seed:clear

# Seed specific resource
npm run seed:test -- --resource=products
```

---

## Notes

1. **Test Data Prefix**: All test data IDs start with `test_` prefix
2. **Phone Numbers**: Use `+91987654xxxx` pattern for test phones
3. **Emails**: Use `*@test.jfv.in` domain for test emails
4. **Timestamps**: Use ISO 8601 format for all dates
5. **Prices**: All prices are in INR paise (e.g., 129900 = ₹1,299.00)
6. **IDs**: Use descriptive IDs for readability in tests
