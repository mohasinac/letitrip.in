# End-to-End Test Scenarios

**Last Updated**: November 29, 2025  
**Test Status**: 237 test files, 5,824+ tests passing

## User Journeys

### UJ001: New User Purchase Journey ✅ COMPLETE (All APIs Tested)

```
1. Guest visits homepage                    ✅ src/app/page.test.tsx
2. Browses products by category             ✅ src/app/categories/page.test.tsx
3. Views product details                    ✅ src/app/products/[slug]/page.test.tsx
4. Prompted to login when adding to cart    ✅ src/components/auth/AuthGuard.test.tsx
5. Registers new account                    ✅ src/app/register/page.test.tsx
6. Verifies email                           ✅ src/app/api/auth/auth.test.ts
7. Adds product to cart                     ✅ src/app/api/cart/route.test.ts
8. Applies coupon code                      ✅ src/app/api/cart/coupon/route.test.ts
9. Proceeds to checkout                     ✅ src/app/checkout/page.test.tsx
10. Adds shipping address                   ✅ src/components/checkout/AddressForm.test.tsx
11. Selects payment method (UPI)            ✅ src/components/checkout/PaymentMethod.test.tsx
12. Completes payment                       ✅ src/app/api/checkout/create-order/route.test.ts
13. Receives order confirmation email       ⬜ Requires E016 implementation
14. Views order in account                  ✅ src/app/user/orders/page.test.tsx
15. Tracks shipment                         ✅ src/app/api/orders/[id]/track/route.test.ts
16. Receives delivery                       ✅ src/app/api/orders/[id]/route.test.ts
17. Writes product review                   ✅ src/app/api/reviews/route.test.ts
```

### UJ002: Auction Bidding Journey ✅ COMPLETE (All APIs Tested)

```
1. User logs in                             ✅ src/app/login/page.test.tsx
2. Browses active auctions                  ✅ src/app/auctions/page.test.tsx
3. Views auction details                    ✅ src/app/auctions/[slug]/page.test.tsx
4. Adds to watchlist                        ✅ src/app/api/favorites/[type]/[id]/route.test.ts
5. Receives "ending soon" notification      ⬜ Requires E016 implementation
6. Places bid                               ✅ src/app/api/auctions/[id]/bid/route.test.ts
7. Gets outbid notification                 ⬜ Requires E016 implementation
8. Places higher bid                        ✅ src/app/api/auctions/[id]/bid/route.test.ts
9. Sets auto-bid with maximum               ✅ src/components/auction/AutoBidSetup.test.tsx
10. Wins auction                            ✅ src/app/api/auctions/auctions.test.ts
11. Receives "won" notification             ⬜ Requires E016 implementation
12. Completes payment within deadline       ✅ src/app/api/checkout/create-order/route.test.ts
13. Order created                           ✅ src/app/api/orders/route.test.ts
14. Receives item                           ✅ src/app/api/orders/[id]/shipment/route.test.ts
```

### UJ003: Seller Product Listing Journey ✅ COMPLETE (All APIs Tested)

```
1. User creates shop                        ✅ src/app/api/shops/route.test.ts
2. Completes shop profile                   ✅ src/app/api/shops/[slug]/route.test.ts
3. Submits for verification (optional)      ✅ src/app/api/shops/[slug]/route.test.ts
4. Creates first product                    ✅ src/app/api/products/route.test.ts
5. Uploads product images                   ✅ src/app/api/media/upload/route.test.ts
6. Sets pricing and inventory               ✅ src/app/api/products/[slug]/route.test.ts
7. Publishes product                        ✅ src/app/api/products/[slug]/route.test.ts
8. Product appears in catalog               ✅ src/app/products/page.test.tsx
9. Receives order notification              ⬜ Requires E016 implementation
10. Updates order status                    ✅ src/app/api/orders/[id]/route.test.ts
11. Adds tracking information               ✅ src/app/api/orders/[id]/shipment/route.test.ts
12. Order delivered                         ✅ src/app/api/orders/[id]/route.test.ts
13. Views revenue dashboard                 ✅ src/app/seller/revenue/page.test.tsx
14. Requests payout                         ✅ src/app/api/payouts/route.test.ts
```

### UJ004: Return/Refund Journey ✅ COMPLETE (All APIs Tested)

```
1. User views order history                 ✅ src/app/user/orders/page.test.tsx
2. Selects delivered order                  ✅ src/app/user/orders/[id]/page.test.tsx
3. Requests return for item                 ✅ src/app/api/returns/route.test.ts
4. Selects return reason                    ✅ src/app/api/returns/route.test.ts
5. Uploads photos of issue                  ✅ src/app/api/media/upload/route.test.ts
6. Submits return request                   ✅ src/app/api/returns/route.test.ts
7. Seller reviews request                   ✅ src/app/api/returns/route.test.ts
8. Seller approves return                   ✅ src/app/api/returns/route.test.ts
9. User ships item back                     ✅ src/app/api/returns/route.test.ts
10. Seller confirms receipt                 ✅ src/app/api/returns/route.test.ts
11. Refund processed                        ✅ src/app/api/payments/[id]/route.test.ts
12. User receives refund                    ✅ src/app/api/payments/[id]/route.test.ts
```

### UJ005: Support Ticket Journey ✅ COMPLETE (All APIs Tested)

```
1. User has issue with order                ✅ src/app/user/orders/[id]/page.test.tsx
2. Creates support ticket                   ✅ src/app/api/tickets/route.test.ts
3. Selects category (Order Issue)           ✅ src/app/api/tickets/route.test.ts
4. Describes problem                        ✅ src/app/api/tickets/route.test.ts
5. Attaches screenshot                      ✅ src/app/api/media/upload/route.test.ts
6. Submits ticket                           ✅ src/app/api/tickets/route.test.ts
7. Seller receives notification             ⬜ Requires E016 implementation
8. Seller replies to ticket                 ✅ src/app/api/tickets/[id]/reply/route.test.ts
9. User provides more info                  ✅ src/app/api/tickets/[id]/reply/route.test.ts
10. Issue escalated to admin                ✅ src/app/api/tickets/[id]/route.test.ts
11. Admin resolves issue                    ✅ src/app/api/tickets/[id]/route.test.ts
12. Ticket closed                           ✅ src/app/api/tickets/[id]/route.test.ts
```

### UJ006: Favorites/Wishlist Journey ✅ COMPLETE (All APIs Tested)

```
1. Guest browses products                   ✅ src/app/products/page.test.tsx
2. Clicks heart icon on product             ✅ src/components/common/FavoriteButton.test.tsx
3. Product saved to local storage           ✅ src/components/common/FavoriteButton.test.tsx
4. Guest registers/logs in                  ✅ src/app/register/page.test.tsx
5. Local favorites sync to server           ✅ src/app/api/favorites/[type]/[id]/route.test.ts
6. User enables price drop notification     ⬜ Requires E016 implementation
7. Product price drops                      ⬜ Requires E016 implementation
8. User receives notification email         ⬜ Requires E016 implementation
9. User adds item to cart from favorites    ✅ src/app/user/favorites/page.test.tsx
10. User removes item after purchase        ✅ src/app/api/favorites/[type]/[id]/route.test.ts
```

### UJ007: Messaging Journey ⬜ PENDING (API Placeholder)

```
1. User views product page                  ✅ src/app/products/[slug]/page.test.tsx
2. Clicks "Contact Seller" button           ✅ UI component exists
3. Writes inquiry about product             ⬜ API returns 501
4. Message sent to seller                   ⬜ API returns 501
5. Seller receives notification             ⬜ Requires E016 + E023
6. Seller replies with answer               ⬜ API returns 501
7. User receives reply notification         ⬜ Requires E016 + E023
8. User opens conversation thread           ⬜ API returns 501
9. User sends follow-up question            ⬜ API returns 501
10. Conversation continues until resolved   ⬜ API returns 501
11. User archives conversation              ⬜ API returns 501
```

**Status**: E023 messaging API is a placeholder returning 501. Tests in `src/app/api/messages/(tests)/route.test.ts` are `it.todo`.

### UJ008: Blog Reading Journey ✅ COMPLETE (All APIs Tested)

```
1. User visits blog page                    ✅ src/app/blog/page.test.tsx
2. Views list of published posts            ✅ src/app/api/blog/blog.test.ts
3. Filters by category                      ✅ src/app/api/blog/blog.test.ts
4. Clicks on article                        ✅ src/app/blog/[slug]/BlogPostClient.test.tsx
5. Reads full content                       ✅ src/app/api/blog/blog.test.ts
6. Views related posts                      ⬜ Not yet implemented
7. Shares on social media                   ⬜ Not yet implemented
8. Navigates to another article via tag     ⬜ Tag filtering not implemented
```

---

## Admin Scenarios

### AS001: User Management ✅ COMPLETE (All APIs Tested)

```
1. Admin logs in                            ✅ src/app/api/auth/auth.test.ts
2. Views user list                          ✅ src/app/admin/users/page.test.tsx
3. Searches for specific user               ✅ src/app/api/users/route.test.ts
4. Views user details                       ✅ src/app/api/users/[id]/route.test.ts
5. Bans user with reason                    ✅ src/app/api/users/[id]/route.test.ts
6. User cannot login                        ✅ src/app/api/auth/auth.test.ts
7. Admin unbans user                        ✅ src/app/api/users/[id]/route.test.ts
8. User can login again                     ✅ src/app/api/auth/auth.test.ts
```

### AS002: Content Moderation ✅ COMPLETE (All APIs Tested)

```
1. New review submitted                     ✅ src/app/api/reviews/route.test.ts
2. Admin views moderation queue             ✅ src/app/admin/reviews/page.test.tsx
3. Reviews content and images               ✅ src/app/api/reviews/[id]/route.test.ts
4. Approves appropriate reviews             ✅ src/app/api/reviews/bulk/route.test.ts
5. Rejects inappropriate reviews            ✅ src/app/api/reviews/bulk/route.test.ts
6. Approved reviews appear on product       ✅ src/app/api/reviews/route.test.ts
```

### AS003: Payout Processing ✅ COMPLETE (All APIs Tested)

```
1. Admin views pending payouts              ✅ src/app/api/payouts/route.test.ts
2. Reviews seller verification              ✅ src/app/api/shops/[slug]/route.test.ts
3. Verifies bank details                    ✅ src/app/api/payouts/route.test.ts
4. Processes payout                         ✅ src/app/api/payouts/route.test.ts
5. Marks as completed                       ✅ src/app/api/payouts/route.test.ts
6. Seller notified                          ⬜ Requires E016 implementation
7. Transaction recorded                     ✅ src/app/api/payouts/route.test.ts
```

### AS004: Blog Management ✅ COMPLETE (All APIs Tested)

```
1. Admin navigates to Blog section          ✅ src/app/admin/blog/page.tsx
2. Views all published/draft posts          ✅ src/app/api/blog/blog.test.ts
3. Creates new blog post                    ✅ src/app/api/blog/blog.test.ts
4. Adds title and content                   ✅ src/app/api/blog/blog.test.ts
5. Selects/creates category                 ✅ src/app/api/blog/blog.test.ts
6. Adds tags for SEO                        ⬜ Tags not fully implemented
7. Sets featured image                      ✅ src/app/api/blog/blog.test.ts
8. Previews post                            ⬜ Preview not implemented
9. Publishes post                           ✅ src/app/api/blog/blog.test.ts
10. Views analytics                         ⬜ Blog analytics not implemented
11. Edits existing post                     ✅ src/app/api/blog/blog.test.ts
12. Manages comments (if enabled)           ⬜ Comments not implemented
```

### AS005: System Settings ⬜ PENDING (API Placeholder)

```
1. Admin navigates to Settings              ✅ src/app/admin/settings/page.tsx (placeholder)
2. Views current configuration              ⬜ API returns 501
3. Updates site name/logo                   ⬜ API returns 501
4. Configures payment gateways              ⬜ API returns 501
5. Sets up shipping options                 ⬜ API returns 501
6. Updates email templates                  ⬜ API returns 501
7. Configures tax settings                  ⬜ API returns 501
8. Toggles feature flags                    ⬜ API returns 501
9. Saves all changes                        ⬜ API returns 501
10. Views change audit log                  ⬜ API returns 501
```

**Status**: E021 settings API is a placeholder returning 501. Tests in `src/app/api/admin/settings/(tests)/route.test.ts` are `it.todo`.

---

## Negative Scenarios

### NS001: Invalid Registration ✅ TESTED

- Email already exists → Error message ✅ src/app/api/auth/auth.test.ts
- Weak password → Validation error ✅ src/lib/form-validation.test.ts
- Invalid email format → Validation error ✅ src/lib/form-validation.test.ts

### NS002: Failed Payment ✅ TESTED

- Card declined → Retry option ✅ src/app/api/payments/route.test.ts
- Network error → Resume checkout ✅ src/app/api/checkout/create-order/route.test.ts
- Timeout → Order cancelled after 30 min ✅ src/app/api/orders/[id]/cancel/route.test.ts

### NS003: Out of Stock ✅ TESTED

- User adds to cart → OK ✅ src/app/api/cart/route.test.ts
- Stock drops to 0 → Warning in cart ✅ src/components/cart/CartItem.test.tsx
- User tries to checkout → Cannot proceed ✅ src/app/api/checkout/create-order/route.test.ts

### NS004: Expired Auction ✅ TESTED

- User viewing auction → Countdown ends ✅ src/components/auction/LiveCountdown.test.tsx
- User tries to bid → "Auction ended" error ✅ src/app/api/auctions/[id]/bid/route.test.ts
- Winner announced → Correct winner ✅ src/app/api/auctions/auctions.test.ts

### NS005: Unauthorized Access ✅ TESTED

- User tries admin route → Redirect ✅ src/components/auth/AuthGuard.test.tsx
- Seller tries other shop → 403 error ✅ src/lib/rbac-permissions.test.ts
- Expired session → Redirect to login ✅ src/app/api/auth/auth.test.ts

### NS006: Messaging Failures ⬜ PENDING

- Message to blocked user → Error ⬜ E023 not implemented
- Attachment too large → Size limit error ⬜ E023 not implemented
- Spam detected → Message rejected ⬜ E023 not implemented
- Rate limit exceeded → "Try again later" ⬜ E023 not implemented

### NS007: Favorites Errors ✅ TESTED

- Add non-existent product → 404 error ✅ src/app/api/favorites/[type]/[id]/route.test.ts
- Sync with invalid token → Re-authenticate ✅ src/app/api/favorites/[type]/[id]/route.test.ts
- Duplicate add → Silently ignored ✅ src/app/api/favorites/[type]/[id]/route.test.ts
- Remove non-favorited → No error ✅ src/app/api/favorites/[type]/[id]/route.test.ts

---

## Performance Scenarios (Future - k6/Playwright)

### PS001: High Traffic Homepage

- 1000 concurrent users
- Page loads < 3 seconds
- Hero slides render correctly
- Featured items load

### PS002: Auction Bid Rush

- 100 concurrent bidders
- All bids processed in order
- Real-time updates for all
- No lost bids

### PS003: Search Load

- 500 search queries/minute
- Results return < 1 second
- Filters apply correctly
- Pagination works

### PS004: Messaging System Load ⬜ PENDING

- 1000 concurrent users sending messages
- Message delivery < 2 seconds
- Real-time notifications work
- No message loss

### PS005: Blog Traffic

- 5000 concurrent blog readers
- Page loads < 2 seconds
- Images load correctly
- SEO tags render properly

---

## Test Data Requirements

### Users

- 1 Admin user
- 5 Seller users with shops
- 20 Regular users
- Various states (verified, unverified, banned)

### Products

- 100+ products across categories
- Various statuses (published, draft, out of stock)
- With and without reviews
- Various price ranges

### Auctions

- Active auctions (various end times)
- Completed auctions
- Cancelled auctions
- With and without bids

### Orders

- All statuses represented
- With and without coupons
- Various payment methods
- COD and prepaid

### Blog Posts

- 50+ blog posts
- Various categories
- Published and draft states
- With featured images

### Messages ⬜ PENDING

- Buyer-seller conversations
- Order-related messages
- Support conversations
- Read and unread states

### Favorites

- Users with various favorites counts
- Price drop enabled/disabled
- Shared wishlists
- Guest favorites (local storage)
