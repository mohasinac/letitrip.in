# API Routes Reference

All API routes live under `src/app/api/`. They follow a consistent pattern: validate session → authorize role → call repository → return JSON.

---

## Auth Routes — `/api/auth/`

| Method | Route                         | Auth | Description                     |
| ------ | ----------------------------- | ---- | ------------------------------- |
| `POST` | `/api/auth/login`             | None | Sign in, set `__session` cookie |
| `POST` | `/api/auth/register`          | None | Create account                  |
| `POST` | `/api/auth/logout`            | User | Destroy session                 |
| `GET`  | `/api/auth/session`           | None | Get current session             |
| `POST` | `/api/auth/session/validate`  | None | Validate session token          |
| `POST` | `/api/auth/session/activity`  | User | Bump last-activity timestamp    |
| `POST` | `/api/auth/forgot-password`   | None | Send reset email                |
| `POST` | `/api/auth/reset-password`    | None | Apply new password via token    |
| `POST` | `/api/auth/send-verification` | User | Resend email verification       |
| `POST` | `/api/auth/verify-email`      | User | Verify OTP code                 |
| `GET`  | `/api/auth/google/start`      | None | Start Google OAuth              |
| `GET`  | `/api/auth/google/callback`   | None | Google OAuth callback           |
| `POST` | `/api/auth/event/init`        | User | Init RTDB auth event            |

---

## Product Routes — `/api/products/`

| Method | Route                | Auth | Description                 |
| ------ | -------------------- | ---- | --------------------------- |
| `GET`  | `/api/products`      | None | Paginated product catalogue |
| `GET`  | `/api/products/[id]` | None | Single product              |

---

## Cart Routes — `/api/cart/`

| Method   | Route                | Auth | Description          |
| -------- | -------------------- | ---- | -------------------- |
| `GET`    | `/api/cart`          | User | Current user's cart  |
| `POST`   | `/api/cart`          | User | Add cart item        |
| `PATCH`  | `/api/cart/[itemId]` | User | Update item quantity |
| `DELETE` | `/api/cart/[itemId]` | User | Remove cart item     |
| `POST`   | `/api/cart/merge`    | User | Merge guest cart     |

---

## Checkout & Payment Routes

| Method | Route                              | Auth | Description                                                                                |
| ------ | ---------------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| `GET`  | `/api/checkout`                    | User | Checkout data (cart + addresses)                                                           |
| `POST` | `/api/checkout`                    | User | Place order(s) from cart; enforces consent OTP for third-party addresses                   |
| `POST` | `/api/checkout/preflight`          | User | Non-mutating stock check — returns unavailable items without placing an order              |
| `POST` | `/api/checkout/consent-otp/send`   | User | Send 6-digit consent email OTP; 15-min cooldown, up to 3 bypass credits for partial orders |
| `POST` | `/api/checkout/consent-otp/verify` | User | Verify consent OTP code; max 5 attempts, marks OTP document as verified                    |
| `POST` | `/api/payment/create-order`        | User | Create Razorpay order                                                                      |
| `POST` | `/api/payment/verify`              | User | Verify payment + create order                                                              |
| `POST` | `/api/payment/preorder`            | User | Pre-order deposit payment                                                                  |
| `POST` | `/api/payment/event/init`          | User | Event participation payment                                                                |
| `POST` | `/api/payment/otp/request`         | User | Request COD OTP                                                                            |
| `POST` | `/api/payment/webhook`             | None | Razorpay webhook                                                                           |

---

## Order Routes

| Method | Route                          | Auth | Description          |
| ------ | ------------------------------ | ---- | -------------------- |
| `GET`  | `/api/user/orders`             | User | User order history   |
| `POST` | `/api/user/orders/[id]/cancel` | User | Cancel order         |
| `GET`  | `/api/orders/[id]/invoice`     | User | Download invoice PDF |

---

## User Routes — `/api/user/`

| Method   | Route                                  | Auth | Description          |
| -------- | -------------------------------------- | ---- | -------------------- |
| `GET`    | `/api/user/profile`                    | User | Get profile          |
| `PUT`    | `/api/user/profile`                    | User | Update profile       |
| `PUT`    | `/api/user/change-password`            | User | Change password      |
| `POST`   | `/api/user/become-seller`              | User | Become seller        |
| `GET`    | `/api/user/addresses`                  | User | List addresses       |
| `POST`   | `/api/user/addresses`                  | User | Create address       |
| `PATCH`  | `/api/user/addresses/[id]`             | User | Update address       |
| `DELETE` | `/api/user/addresses/[id]`             | User | Delete address       |
| `PATCH`  | `/api/user/addresses/[id]/set-default` | User | Set default          |
| `GET`    | `/api/user/wishlist`                   | User | Get wishlist         |
| `POST`   | `/api/user/wishlist`                   | User | Add to wishlist      |
| `DELETE` | `/api/user/wishlist/[productId]`       | User | Remove from wishlist |
| `GET`    | `/api/user/sessions`                   | User | Active sessions      |
| `DELETE` | `/api/user/sessions/[id]`              | User | Revoke session       |

---

## Profile Routes

| Method   | Route                           | Auth | Description         |
| -------- | ------------------------------- | ---- | ------------------- |
| `GET`    | `/api/profile/[userId]`         | None | Public user profile |
| `GET`    | `/api/profile/[userId]/reviews` | None | User's reviews      |
| `POST`   | `/api/profile/add-phone`        | User | Add phone number    |
| `POST`   | `/api/profile/verify-phone`     | User | Verify phone OTP    |
| `DELETE` | `/api/profile/delete-account`   | User | Delete account      |

---

## Seller Routes — `/api/seller/`

| Method         | Route                                | Auth   | Description         |
| -------------- | ------------------------------------ | ------ | ------------------- |
| `GET/PUT`      | `/api/seller/store`                  | Seller | Seller store        |
| `GET/POST`     | `/api/seller/products`               | Seller | Seller products     |
| `PATCH/DELETE` | `/api/seller/products/[id]`          | Seller | Edit/delete product |
| `GET`          | `/api/seller/orders`                 | Seller | Seller orders       |
| `POST`         | `/api/seller/orders/[id]/ship`       | Seller | Ship order          |
| `POST`         | `/api/seller/orders/bulk`            | Seller | Bulk payout request |
| `GET`          | `/api/seller/analytics`              | Seller | Seller analytics    |
| `GET/POST`     | `/api/seller/coupons`                | Seller | Seller coupons      |
| `PATCH/DELETE` | `/api/seller/coupons/[id]`           | Seller | Edit/delete coupon  |
| `GET/POST`     | `/api/seller/payouts`                | Seller | Payout requests     |
| `GET/PUT`      | `/api/seller/payout-settings`        | Seller | Bank settings       |
| `GET`          | `/api/seller/shipping`               | Seller | Shipping config     |
| `POST`         | `/api/seller/shipping/verify-pickup` | Seller | Verify pickup OTP   |
| `GET/POST`     | `/api/seller/addresses`              | Seller | Pickup addresses    |

---

## Admin Routes — `/api/admin/`

| Method             | Route                                      | Auth  | Description          |
| ------------------ | ------------------------------------------ | ----- | -------------------- |
| `GET`              | `/api/admin/dashboard`                     | Admin | Dashboard KPIs       |
| `GET`              | `/api/admin/analytics`                     | Admin | Platform analytics   |
| `GET`              | `/api/admin/users`                         | Admin | User list            |
| `GET/PATCH/DELETE` | `/api/admin/users/[uid]`                   | Admin | User management      |
| `GET`              | `/api/admin/stores`                        | Admin | Store list           |
| `PATCH`            | `/api/admin/stores/[uid]`                  | Admin | Store status         |
| `GET`              | `/api/admin/products`                      | Admin | All products         |
| `GET/PATCH/DELETE` | `/api/admin/products/[id]`                 | Admin | Product management   |
| `GET`              | `/api/admin/orders`                        | Admin | All orders           |
| `GET/PATCH`        | `/api/admin/orders/[id]`                   | Admin | Order management     |
| `GET`              | `/api/admin/bids`                          | Admin | All bids             |
| `GET`              | `/api/admin/reviews`                       | Admin | All reviews          |
| `GET/PATCH/DELETE` | `/api/admin/blog/[id]`                     | Admin | Blog management      |
| `GET/PATCH/DELETE` | `/api/admin/coupons/[id]`                  | Admin | Coupon management    |
| `GET`              | `/api/admin/payouts`                       | Admin | Payout queue         |
| `PATCH`            | `/api/admin/payouts/[id]`                  | Admin | Payout status        |
| `POST`             | `/api/admin/payouts/weekly`                | Admin | Weekly batch         |
| `GET`              | `/api/admin/sessions`                      | Admin | All sessions         |
| `DELETE`           | `/api/admin/sessions/[id]`                 | Admin | Revoke session       |
| `POST`             | `/api/admin/sessions/revoke-user`          | Admin | Revoke user sessions |
| `GET/PATCH`        | `/api/admin/events/[id]`                   | Admin | Event management     |
| `GET/PATCH`        | `/api/admin/events/[id]/entries/[entryId]` | Admin | Entry moderation     |
| `GET`              | `/api/admin/events/[id]/stats`             | Admin | Event stats          |
| `PATCH`            | `/api/admin/events/[id]/status`            | Admin | Change event status  |
| `DELETE`           | `/api/admin/newsletter/[id]`               | Admin | Delete subscriber    |
| `POST`             | `/api/admin/algolia/sync`                  | Admin | Sync products        |
| `POST`             | `/api/admin/algolia/sync-pages`            | Admin | Sync pages           |
| `POST`             | `/api/admin/algolia/clear-products`        | Admin | Clear products index |
| `POST`             | `/api/admin/algolia/clear-pages`           | Admin | Clear pages index    |

---

## Content Routes

| Method | Route                    | Auth | Description          |
| ------ | ------------------------ | ---- | -------------------- |
| `GET`  | `/api/blog`              | None | Blog listing         |
| `GET`  | `/api/blog/[slug]`       | None | Blog post            |
| `GET`  | `/api/categories`        | None | Category list        |
| `GET`  | `/api/categories/[id]`   | None | Category detail      |
| `GET`  | `/api/carousel`          | None | Hero slides          |
| `GET`  | `/api/homepage-sections` | None | Homepage sections    |
| `GET`  | `/api/faqs`              | None | FAQ listing          |
| `POST` | `/api/faqs/[id]/vote`    | User | Vote helpful         |
| `GET`  | `/api/site-settings`     | None | Public site settings |
| `GET`  | `/api/search`            | None | Algolia search       |

---

## RipCoins Routes

| Method | Route                           | Auth  | Description         |
| ------ | ------------------------------- | ----- | ------------------- |
| `GET`  | `/api/ripcoins/balance`         | User  | Coin balance        |
| `GET`  | `/api/ripcoins/history`         | User  | Transaction history |
| `POST` | `/api/ripcoins/purchase`        | User  | Init purchase       |
| `POST` | `/api/ripcoins/purchase/verify` | User  | Verify + credit     |
| `POST` | `/api/ripcoins/refund`          | Admin | Refund coins        |

---

## Media Routes

| Method | Route               | Auth | Description |
| ------ | ------------------- | ---- | ----------- |
| `POST` | `/api/media/upload` | User | Upload file |
| `POST` | `/api/media/crop`   | User | Crop image  |
| `POST` | `/api/media/trim`   | User | Trim video  |

---

## Other Routes

| Method     | Route                             | Auth  | Description         |
| ---------- | --------------------------------- | ----- | ------------------- |
| `GET`      | `/api/notifications`              | User  | Notification list   |
| `GET`      | `/api/notifications/unread-count` | User  | Unread count        |
| `POST`     | `/api/notifications/read-all`     | User  | Mark all read       |
| `GET/POST` | `/api/chat`                       | User  | Chat rooms          |
| `GET`      | `/api/chat/[chatId]/messages`     | User  | Messages            |
| `POST`     | `/api/contact`                    | None  | Contact form        |
| `POST`     | `/api/newsletter/subscribe`       | None  | Subscribe           |
| `GET`      | `/api/bids/[id]`                  | None  | Auction bids        |
| `GET`      | `/api/realtime/bids/[id]`         | User  | RTDB auction stream |
| `GET`      | `/api/realtime/token`             | User  | RTDB auth token     |
| `GET`      | `/api/events/[id]`                | None  | Event detail        |
| `GET`      | `/api/events/[id]/leaderboard`    | None  | Leaderboard         |
| `POST`     | `/api/events/[id]/enter`          | User  | Enter event         |
| `GET/POST` | `/api/reviews`                    | User  | Reviews             |
| `POST`     | `/api/reviews/[id]/vote`          | User  | Helpful vote        |
| `GET`      | `/api/stores`                     | None  | Store directory     |
| `GET`      | `/api/stores/[storeSlug]`         | None  | Store detail        |
| `POST`     | `/api/cache/revalidate`           | Admin | ISR revalidation    |
| `POST`     | `/api/logs/write`                 | User  | Client log write    |
| `POST`     | `/api/webhooks/shiprocket`        | None  | Delivery webhook    |
