# Server Actions

Server Actions live in `src/actions/`. They are the **only** way mutations happen in the UI. Components call them via `useMutation` from TanStack Query, or directly in event handlers.

All actions:

- Run on the server
- Validate input with Zod
- Call a repository directly
- Call `revalidatePath` or `revalidateTag` to bust Next.js cache
- Return a typed result `{ success: boolean; error?: string; data?: T }`

---

## Address Actions — `address.actions.ts`

| Export                    | Input                   | Description                                         |
| ------------------------- | ----------------------- | --------------------------------------------------- |
| `createAddressAction`     | `AddressInput`          | Creates a new delivery address for the current user |
| `updateAddressAction`     | `AddressInput & { id }` | Updates an existing address                         |
| `deleteAddressAction`     | `{ id: string }`        | Deletes an address                                  |
| `setDefaultAddressAction` | `{ id: string }`        | Marks an address as the default                     |

**Type:** `AddressInput` — `{ label, recipientName, phone, line1, line2?, city, state, pincode, country, type }`

---

## Admin Actions — `admin.actions.ts`

General admin write mutations covering sessions, orders, payouts, users, stores, products, and RipCoins.

| Export                                           | Description                       |
| ------------------------------------------------ | --------------------------------- |
| `revokeSessionAction({ sessionId })`             | Revoke a specific user session    |
| `revokeUserSessionsAction({ userId })`           | Revoke all sessions for a user    |
| `adminUpdateOrderAction({ id, status, note? })`  | Update order status               |
| `adminUpdatePayoutAction({ id, status, note? })` | Approve or reject a payout        |
| `adminUpdateUserAction({ uid, ...fields })`      | Update user role, status          |
| `adminDeleteUserAction({ uid })`                 | Permanently delete a user account |
| `adminUpdateStoreStatusAction({ uid, status })`  | Approve/suspend a store           |
| `adminUpdateProductAction({ id, ...fields })`    | Update product fields             |
| `adminCreateProductAction(input)`                | Create a new product (admin-side) |
| `adminDeleteProductAction({ id })`               | Delete a product                  |
| `adminAdjustRipCoinsAction(input)`               | Manually credit or debit RipCoins |

**Type:** `AdminAdjustRipCoinsInput` — `{ userId, amount, reason }`

---

## Admin Coupon Actions — `admin-coupon.actions.ts`

| Export                            | Description                 |
| --------------------------------- | --------------------------- |
| `adminCreateCouponAction(input)`  | Create platform-wide coupon |
| `adminUpdateCouponAction(input)`  | Update coupon               |
| `adminDeleteCouponAction({ id })` | Delete coupon               |

**Types:** `AdminCreateCouponInput`, `AdminUpdateCouponInput`

---

## Bid Actions — `bid.actions.ts`

| Export           | Input           | Returns          | Description                |
| ---------------- | --------------- | ---------------- | -------------------------- |
| `placeBidAction` | `PlaceBidInput` | `PlaceBidResult` | Places a bid on an auction |

**Type:** `PlaceBidInput` — `{ auctionId, amount }`. Validates that the bid exceeds the current highest bid and the user doesn't already hold the top bid. Updates Firestore and RTDB simultaneously.

---

## Blog Actions — `blog.actions.ts`

| Export                         | Description              |
| ------------------------------ | ------------------------ |
| `createBlogPostAction(input)`  | Create a new blog post   |
| `updateBlogPostAction(input)`  | Update blog post content |
| `deleteBlogPostAction({ id })` | Delete blog post         |

**Types:** `CreateBlogPostInput`, `UpdateBlogPostInput` — include title, slug, content (ProseMirror JSON), excerpt, coverImage, categories, publishedAt, status.

---

## Carousel Actions — `carousel.actions.ts`

| Export                              | Description                |
| ----------------------------------- | -------------------------- |
| `createCarouselSlideAction(input)`  | Add a hero banner slide    |
| `updateCarouselSlideAction(input)`  | Update slide content/order |
| `deleteCarouselSlideAction({ id })` | Remove slide               |

---

## Checkout Actions — `checkout.actions.ts`

Server-side mutations for the third-party shipping consent OTP flow.

| Export                                    | Returns                   | Description                                                                                                                                 |
| ----------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `sendConsentOtpAction(addressId)`         | `{ maskedEmail: string }` | Generates and emails a 6-digit consent OTP when the delivery address belongs to a different person. Enforces a 15-min cooldown (see below). |
| `verifyConsentOtpAction(addressId, code)` | `void`                    | Verifies the 6-digit code, marks the OTP document as verified so `POST /api/checkout` can confirm consent was obtained.                     |

**Rate limiting:** `sendConsentOtpAction` enforces a 15-minute per-user cooldown stored in `users/{uid}/consentOtpRateLimit/meta`. The cooldown can be bypassed up to `CONSENT_OTP_MAX_BYPASS_CREDITS` (3) times when a partial order was placed due to unavailable items — the checkout route grants one credit per partial order. `verifyConsentOtpAction` is additionally rate-limited to 10 attempts per 5 minutes via Upstash.

**Shared module:** All constants, Firestore path helpers, and crypto utilities are in `src/lib/consent-otp.ts` — see [Consent OTP Lib](#consent-otp-lib-srclibconsent-otpts) in the cart-checkout feature doc.

---

## Cart Actions — `cart.actions.ts`

| Export                                                 | Description                                             |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `addToCartAction({ productId, variantId?, quantity })` | Add item to server cart                                 |
| `updateCartItemAction({ itemId, quantity })`           | Change item quantity                                    |
| `removeFromCartAction({ itemId })`                     | Remove cart item                                        |
| `clearCartAction()`                                    | Empty the cart                                          |
| `mergeGuestCartAction(items[])`                        | Merge localStorage guest cart into server cart on login |

---

## Category Actions — `category.actions.ts`

| Export                         | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `createCategoryAction(input)`  | Create new category                          |
| `updateCategoryAction(input)`  | Update category                              |
| `deleteCategoryAction({ id })` | Delete (cascades to products if no children) |

**Type:** `CreateCategoryInput` — `{ name, slug, image?, parentId? }`

---

## Contact Actions — `contact.actions.ts`

| Export                     | Description                                 |
| -------------------------- | ------------------------------------------- |
| `sendContactAction(input)` | Submit contact form + send email via Resend |

**Type:** `SendContactInput` — `{ name, email, subject, message }`

---

## Coupon Actions — `coupon.actions.ts`

| Export                               | Returns                | Description                                           |
| ------------------------------------ | ---------------------- | ----------------------------------------------------- |
| `validateCouponAction(input)`        | `ValidateCouponResult` | Validates a coupon code exists and is not expired     |
| `validateCouponForCartAction(input)` | `ValidateCouponResult` | Validates coupon against current cart total and items |

---

## Event Actions — `event.actions.ts`

| Export                                                    | Description                                    |
| --------------------------------------------------------- | ---------------------------------------------- |
| `createEventAction(input)`                                | Create a new event (poll/survey/feedback/etc.) |
| `updateEventAction(input)`                                | Update event details or config                 |
| `deleteEventAction({ id })`                               | Delete event                                   |
| `changeEventStatusAction({ id, status })`                 | Transition event status                        |
| `adminUpdateEventEntryAction({ entryId, status, note? })` | Approve/reject an entry                        |

---

## FAQ Actions — `faq.actions.ts`

| Export                         | Description                  |
| ------------------------------ | ---------------------------- |
| `voteFaqAction(input)`         | Vote a FAQ as helpful or not |
| `adminCreateFaqAction(input)`  | Create FAQ                   |
| `adminUpdateFaqAction(input)`  | Update FAQ                   |
| `adminDeleteFaqAction({ id })` | Delete FAQ                   |

---

## Newsletter Actions — `newsletter.actions.ts`

| Export                             | Description                          |
| ---------------------------------- | ------------------------------------ |
| `subscribeNewsletterAction(input)` | Subscribe an email to the newsletter |

---

## Notification Actions — `notification.actions.ts`

| Export                               | Description                      |
| ------------------------------------ | -------------------------------- |
| `markNotificationReadAction({ id })` | Mark single notification read    |
| `markAllNotificationsReadAction()`   | Mark all user notifications read |
| `deleteNotificationAction({ id })`   | Delete a notification            |

---

## Order Actions — `order.actions.ts`

| Export                           | Description                  |
| -------------------------------- | ---------------------------- |
| `cancelOrderAction({ orderId })` | User cancels a pending order |

---

## Profile Actions — `profile.actions.ts`

| Export                       | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `updateProfileAction(input)` | Update user's display name, bio, avatar URL |

**Type:** `UpdateProfileInput` — `{ displayName?, bio?, avatarUrl? }`

---

## Review Actions — `review.actions.ts`

| Export                                    | Description                               |
| ----------------------------------------- | ----------------------------------------- |
| `createReviewAction(input)`               | Post a product review (requires purchase) |
| `updateReviewAction(input)`               | Edit own review                           |
| `deleteReviewAction({ id })`              | Delete own review                         |
| `adminUpdateReviewAction({ id, status })` | Approve/reject review                     |
| `adminDeleteReviewAction({ id })`         | Admin delete review                       |
| `voteReviewHelpfulAction({ id, vote })`   | Mark review helpful/unhelpful             |

---

## Section Actions — `sections.actions.ts`

| Export                                | Description                  |
| ------------------------------------- | ---------------------------- |
| `createHomepageSectionAction(input)`  | Add a homepage section       |
| `updateHomepageSectionAction(input)`  | Update section config/order  |
| `deleteHomepageSectionAction({ id })` | Remove section from homepage |

---

## Seller Coupon Actions — `seller-coupon.actions.ts`

Seller-scoped coupon management. Same signature as admin coupon actions but scoped to the authenticated seller.

| Export                             | Description                      |
| ---------------------------------- | -------------------------------- |
| `sellerCreateCouponAction(input)`  | Create coupon for seller's store |
| `sellerUpdateCouponAction(input)`  | Update seller coupon             |
| `sellerDeleteCouponAction({ id })` | Delete seller coupon             |

---

## Seller Actions — `seller.actions.ts`

| Export                      | Returns                    | Description                                                      |
| --------------------------- | -------------------------- | ---------------------------------------------------------------- |
| `becomeSellerAction(input)` | `BecomeSellerActionResult` | Upgrade authenticated user to seller role, create store document |

---

## Wishlist Actions — `wishlist.actions.ts`

| Export                                    | Description                                       |
| ----------------------------------------- | ------------------------------------------------- |
| `addToWishlistAction({ productId })`      | Add product to wishlist                           |
| `removeFromWishlistAction({ productId })` | Remove from wishlist                              |
| `getWishlistAction()`                     | Server-side fetch of wishlist (used in RSC pages) |
