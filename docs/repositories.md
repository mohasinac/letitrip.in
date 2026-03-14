# Firestore Repositories

The repository layer lives in `src/repositories/`. Each repository is a singleton instance of a class extending `BaseRepository<T>`. API routes and Server Actions use repositories exclusively — no raw Firestore queries outside this layer.

---

## `BaseRepository<T>`

**File:** `src/repositories/base.repository.ts`

Generic base class providing standard CRUD operations on a Firestore collection:

| Method                         | Description                                                         |
| ------------------------------ | ------------------------------------------------------------------- |
| `findById(id)`                 | Fetch single document                                               |
| `findMany(filters?, options?)` | Fetch multiple documents with optional filters                      |
| `findWithSieve(params)`        | Paginated, filtered, sorted fetch using Sieve convention            |
| `create(data)`                 | Create new document (uses `id-generators.ts` for deterministic IDs) |
| `update(id, data)`             | Partial update using Firestore `update()`                           |
| `delete(id)`                   | Delete document                                                     |
| `exists(id)`                   | Check if document exists                                            |
| `count(filters?)`              | Count documents matching filters                                    |

---

## Entity Repositories

### `addressRepository`

**Collection:** `addresses`  
User delivery addresses. Queried by `userId` field.

### `bidRepository`

**Collection:** `bids`  
Auction bids. Each document has `auctionId`, `userId`, `amount`, `timestamp`. Used alongside RTDB writes for real-time updates.

### `blogRepository`

**Collection:** `blogs`  
Blog posts. Supports Sieve query on `status`, `categories`, `publishedAt`.

### `carouselRepository`

**Collection:** `carousel`  
Hero banner slides. Ordered by `order` field.

### `cartRepository`

**Collection:** `carts`  
Shopping cart per user. Each cart holds an `items[]` array with product/variant references and quantities.

### `categoriesRepository`

**Collection:** `categories`  
Product categories. Supports hierarchical queries via `parentId`. Cached at build time for static params generation.

### `chatRepository`

**Collection:** `chats`  
Chat rooms between buyers and sellers. Sub-collection `messages` holds individual messages.

### `couponsRepository`

**Collection:** `coupons`  
Coupon codes. Supports filter by `sellerId` (seller coupons) or null (platform coupons), `status`, `expiresAt`.

### `eventRepository`

**Collection:** `events`  
Platform events (polls, surveys, feedback, sales, offers). Has `type`, `status`, `config` fields.

### `eventEntryRepository`

**Collection:** `eventEntries`  
Individual user entries for events. Has `eventId`, `userId`, `data`, `status` fields.

### `faqsRepository`

**Collection:** `faqs`  
FAQ entries. Supports filter by `category`, `status`, sort by `helpfulCount`.

### `homepageSectionsRepository`

**Collection:** `homepageSections`  
Homepage section configuration. Each document defines a section type, data filters, display count, and sort order.

### `newsletterRepository`

**Collection:** `newsletter`  
Newsletter subscribers. Stores email and subscription date.

### `notificationRepository`

**Collection:** `notifications`  
Per-user notifications. Queried by `userId`, filtered by `read` status. Ordered by `createdAt` descending.

### `orderRepository`

**Collection:** `orders`  
Orders. Each order has `userId`, `sellerId`, `items[]`, `status`, `paymentStatus`, `shippingDetails`, and ShipRocket tracking info.

### `payoutRepository`

**Collection:** `payouts`  
Seller payout requests. Has `sellerId`, `amount`, `status` (`pending`, `approved`, `paid`, `rejected`), bank details snapshot.

### `productRepository`

**Collection:** `products`  
Products (buy-now, auction, pre-order). Has `type`, `sellerId`, `categoryId`, `status` fields. Core Sieve implementation supports filtering by price range, category, brand, rating, seller, status.

### `reviewRepository`

**Collection:** `reviews`  
Product reviews. Has `productId`, `userId`, `rating`, `body`, `status`. Sieve on `status`, `rating`, `productId`.

### `SessionRepository` / `sessionRepository`

**Collection:** `sessions`  
Auth sessions. Linked to Firebase Auth. Stores device info, IP, last activity. Used for session revocation.

### `siteSettingsRepository`

**Collection:** `siteSettings` (single document)  
Platform-wide settings. Site name, contact info, commission rates, social links, feature flags, provider credentials (AES-256-GCM encrypted).

### `SmsCounterRepository` / `smsCounterRepository`

**Collection:** `smsCounters`  
Per-phone SMS rate-limit counters. Prevents SMS abuse on phone verification.

### `StoreRepository` / `storeRepository`

**Collection:** `stores`  
Seller stores. Has `sellerId`, `slug`, `name`, `logo`, `status` (`pending`, `approved`, `suspended`).

### Token Repositories

**Collections:** `emailVerificationTokens`, `passwordResetTokens`  
Short-lived tokens for email verification and password reset flows. Auto-expire via TTL fields.

| Singleton                          | Collection                |
| ---------------------------------- | ------------------------- |
| `emailVerificationTokenRepository` | `emailVerificationTokens` |
| `passwordResetTokenRepository`     | `passwordResetTokens`     |
| `tokenRepository`                  | shared token base         |

### `UserRepository` / `userRepository`

**Collection:** `users`  
User profiles and account data. Has `uid`, `email`, `role`, `displayName`, `avatarUrl`, `isEmailVerified`, `isPhoneVerified`.

### `wishlistRepository`

**Collection:** `wishlists`  
Per-user product wishlist. Has `userId`, `productId`. Type: `WishlistItem`.

---

## Unit of Work — `unit-of-work.ts`

Groups multiple repository operations into a single Firestore transaction for atomic multi-document writes. Used in checkout (order creation + cart clearing + stock decrement) and bid placement (bid write + auction current-price update).

```ts
await unitOfWork.run(async (tx) => {
  await orderRepository.create(orderData, tx);
  await cartRepository.delete(cartId, tx);
  await productRepository.decrementStock(productId, qty, tx);
});
```
