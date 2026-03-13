# Service Layer

Services live in `src/services/`. Each service is a singleton that wraps `apiClient` calls for **read operations**. They are the `queryFn` inside `useQuery` hooks.

**Rule:** Services only perform reads. All mutations go through Server Actions.

---

## Pattern

```ts
// hooks/useProducts.ts
const { data } = useQuery({
  queryKey: ["products", params],
  queryFn: () => productService.list(params),
});

// services/product.service.ts
class ProductService {
  async list(params: SieveParams) {
    return apiClient.get<ProductsListResult>("/api/products", { params });
  }
}
export const productService = new ProductService();
```

---

## Service Reference

### `addressService`

**File:** `address.service.ts`  
Fetches the authenticated user's saved addresses.

| Method         | Endpoint                          | Description        |
| -------------- | --------------------------------- | ------------------ |
| `list()`       | `GET /api/user/addresses`         | All user addresses |
| `getDefault()` | `GET /api/user/addresses/default` | Default address    |

---

### `adminService`

**File:** `admin.service.ts`  
Admin-specific read endpoints (users, orders, payouts, products, analytics, stores, etc.). Mirrors the admin API route structure.

---

### `authEventService`

**File:** `auth-event.service.ts`  
Initialises the auth event SSE connection.  
**Type:** `AuthEventResponse`

---

### `authService`

**File:** `auth.service.ts`  
Session-related reads.

| Method              | Endpoint                          | Description             |
| ------------------- | --------------------------------- | ----------------------- |
| `getSession()`      | `GET /api/auth/session`           | Current session user    |
| `validateSession()` | `POST /api/auth/session/validate` | Validate session cookie |

---

### `bidService`

**File:** `bid.service.ts`  
Reads bids for a specific auction.

| Method                    | Endpoint             | Description             |
| ------------------------- | -------------------- | ----------------------- |
| `getByAuction(auctionId)` | `GET /api/bids/[id]` | Bid history for auction |

---

### `blogService`

**File:** `blog.service.ts`

| Method            | Endpoint               | Description          |
| ----------------- | ---------------------- | -------------------- |
| `list(params)`    | `GET /api/blog`        | Paginated blog posts |
| `getBySlug(slug)` | `GET /api/blog/[slug]` | Single blog post     |

---

### `carouselService`

**File:** `carousel.service.ts`

| Method        | Endpoint            | Description                |
| ------------- | ------------------- | -------------------------- |
| `getSlides()` | `GET /api/carousel` | All active carousel slides |

---

### `cartService`

**File:** `cart.service.ts`

| Method  | Endpoint        | Description         |
| ------- | --------------- | ------------------- |
| `get()` | `GET /api/cart` | Current user's cart |

---

### `categoryService`

**File:** `category.service.ts`

| Method        | Endpoint                   | Description     |
| ------------- | -------------------------- | --------------- |
| `list()`      | `GET /api/categories`      | All categories  |
| `getById(id)` | `GET /api/categories/[id]` | Single category |

---

### `chatService`

**File:** `chat.service.ts`  
**Types:** `CreateRoomRequest`, `ChatRoomsResponse`

| Method                | Endpoint                          | Description        |
| --------------------- | --------------------------------- | ------------------ |
| `getRooms()`          | `GET /api/chat`                   | User's chat rooms  |
| `getMessages(chatId)` | `GET /api/chat/[chatId]/messages` | Messages in a room |

---

### `checkoutService`

**File:** `checkout.service.ts`

| Method              | Endpoint            | Description                        |
| ------------------- | ------------------- | ---------------------------------- |
| `getCheckoutData()` | `GET /api/checkout` | Cart + addresses for checkout step |

---

### `couponService`

**File:** `coupon.service.ts`

| Method         | Endpoint           | Description                        |
| -------------- | ------------------ | ---------------------------------- |
| `list(params)` | `GET /api/coupons` | Active coupons for promotions page |

---

### `eventService`

**File:** `event.service.ts`

| Method               | Endpoint                           | Description       |
| -------------------- | ---------------------------------- | ----------------- |
| `list(params)`       | `GET /api/events`                  | Paginated events  |
| `getById(id)`        | `GET /api/events/[id]`             | Event detail      |
| `getLeaderboard(id)` | `GET /api/events/[id]/leaderboard` | Event leaderboard |

---

### `faqService`

**File:** `faq.service.ts`

| Method         | Endpoint             | Description    |
| -------------- | -------------------- | -------------- |
| `list(params)` | `GET /api/faqs`      | Paginated FAQs |
| `getById(id)`  | `GET /api/faqs/[id]` | Single FAQ     |

---

### `homepageSectionsService`

**File:** `homepage-sections.service.ts`

| Method        | Endpoint                     | Description              |
| ------------- | ---------------------------- | ------------------------ |
| `get(params)` | `GET /api/homepage-sections` | Active homepage sections |

---

### `mediaService`

**File:** `media.service.ts`

| Method             | Endpoint                 | Description                     |
| ------------------ | ------------------------ | ------------------------------- |
| `upload(formData)` | `POST /api/media/upload` | Upload file to Firebase Storage |
| `crop(formData)`   | `POST /api/media/crop`   | Crop an uploaded image          |
| `trim(formData)`   | `POST /api/media/trim`   | Trim an uploaded video          |

---

### `navSuggestionsService`

**File:** `nav-suggestions.service.ts`

| Method          | Endpoint                | Description                           |
| --------------- | ----------------------- | ------------------------------------- |
| `search(query)` | `GET /api/search?nav=1` | Algolia search suggestions for navbar |

**Type:** `AlgoliaNavRecord`

---

### `notificationService`

**File:** `notification.service.ts`

| Method             | Endpoint                              | Description                  |
| ------------------ | ------------------------------------- | ---------------------------- |
| `list(params)`     | `GET /api/notifications`              | User notifications paginated |
| `getUnreadCount()` | `GET /api/notifications/unread-count` | Badge count                  |

---

### `orderService`

**File:** `order.service.ts`

| Method         | Endpoint               | Description        |
| -------------- | ---------------------- | ------------------ |
| `list(params)` | `GET /api/user/orders` | User order history |
| `getById(id)`  | `GET /api/orders/[id]` | Order detail       |

---

### `productService`

**File:** `product.service.ts`

| Method         | Endpoint                 | Description       |
| -------------- | ------------------------ | ----------------- |
| `list(params)` | `GET /api/products`      | Product catalogue |
| `getById(id)`  | `GET /api/products/[id]` | Single product    |

---

### `profileService`

**File:** `profile.service.ts`

| Method                     | Endpoint                    | Description          |
| -------------------------- | --------------------------- | -------------------- |
| `getProfile()`             | `GET /api/user/profile`     | Current user profile |
| `getPublicProfile(userId)` | `GET /api/profile/[userId]` | Public profile       |

---

### `promotionsService`

**File:** `promotions.service.ts`

| Method   | Endpoint                      | Description                |
| -------- | ----------------------------- | -------------------------- |
| `list()` | `GET /api/coupons?featured=1` | Featured active promotions |

---

### `realtimeTokenService`

**File:** `realtime-token.service.ts`  
**Type:** `RealtimeTokenResponse`

| Method       | Endpoint                  | Description                     |
| ------------ | ------------------------- | ------------------------------- |
| `getToken()` | `GET /api/realtime/token` | Firebase RTDB custom auth token |

---

### `reviewService`

**File:** `review.service.ts`

| Method                    | Endpoint                         | Description     |
| ------------------------- | -------------------------------- | --------------- |
| `list(params)`            | `GET /api/reviews`               | All reviews     |
| `getByProduct(productId)` | `GET /api/products/[id]/reviews` | Product reviews |

---

### `ripcoinService`

**File:** `ripcoin.service.ts`  
**Types:** `RipCoinBalance`, `RipCoinPurchaseInitResponse`, `RipCoinVerifyRequest`, `RipCoinVerifyResponse`, `RipCoinRefundResponse`

| Method                 | Endpoint                             | Description                             |
| ---------------------- | ------------------------------------ | --------------------------------------- |
| `getBalance()`         | `GET /api/ripcoins/balance`          | Current coin balance                    |
| `getHistory()`         | `GET /api/ripcoins/history`          | Transaction history                     |
| `initPurchase(pkg)`    | `POST /api/ripcoins/purchase`        | Create Razorpay order for coin purchase |
| `verifyPurchase(data)` | `POST /api/ripcoins/purchase/verify` | Verify payment + credit coins           |

---

### `searchService`

**File:** `search.service.ts`

| Method           | Endpoint          | Description              |
| ---------------- | ----------------- | ------------------------ |
| `search(params)` | `GET /api/search` | Algolia full-text search |

**Type:** `SearchResponse`

---

### `sellerService`

**File:** `seller.service.ts`  
Seller portal reads: analytics, products, orders, payouts, shipping.

---

### `sessionService`

**File:** `session.service.ts`

| Method   | Endpoint                 | Description            |
| -------- | ------------------------ | ---------------------- |
| `list()` | `GET /api/user/sessions` | User's active sessions |

---

### `siteSettingsService`

**File:** `site-settings.service.ts`

| Method  | Endpoint                 | Description          |
| ------- | ------------------------ | -------------------- |
| `get()` | `GET /api/site-settings` | Public site settings |

---

### `storeService`

**File:** `store.service.ts`

| Method                      | Endpoint                               | Description         |
| --------------------------- | -------------------------------------- | ------------------- |
| `list(params)`              | `GET /api/stores`                      | All approved stores |
| `getBySlug(slug)`           | `GET /api/stores/[storeSlug]`          | Store by slug       |
| `getProducts(slug, params)` | `GET /api/stores/[storeSlug]/products` | Store products      |
| `getReviews(slug)`          | `GET /api/stores/[storeSlug]/reviews`  | Store reviews       |

---

### `wishlistService`

**File:** `wishlist.service.ts`

| Method  | Endpoint                 | Description           |
| ------- | ------------------------ | --------------------- |
| `get()` | `GET /api/user/wishlist` | User's wishlist items |
