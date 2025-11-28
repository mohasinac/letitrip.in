# End-to-End Test Scenarios

## User Journeys

### UJ001: New User Purchase Journey ✅ TESTED

```
1. Guest visits homepage
2. Browses products by category
3. Views product details
4. Prompted to login when adding to cart
5. Registers new account
6. Verifies email
7. Adds product to cart
8. Applies coupon code
9. Proceeds to checkout
10. Adds shipping address
11. Selects payment method (UPI)
12. Completes payment
13. Receives order confirmation email
14. Views order in account
15. Tracks shipment
16. Receives delivery
17. Writes product review
```

### UJ002: Auction Bidding Journey ✅ TESTED

```
1. User logs in
2. Browses active auctions
3. Views auction details
4. Adds to watchlist
5. Receives "ending soon" notification
6. Places bid
7. Gets outbid notification
8. Places higher bid
9. Sets auto-bid with maximum
10. Wins auction
11. Receives "won" notification
12. Completes payment within deadline
13. Order created
14. Receives item
```

### UJ003: Seller Product Listing Journey ✅ TESTED

```
1. User creates shop
2. Completes shop profile
3. Submits for verification (optional)
4. Creates first product
5. Uploads product images
6. Sets pricing and inventory
7. Publishes product
8. Product appears in catalog
9. Receives order notification
10. Updates order status
11. Adds tracking information
12. Order delivered
13. Views revenue dashboard
14. Requests payout
```

### UJ004: Return/Refund Journey ✅ TESTED

```
1. User views order history
2. Selects delivered order
3. Requests return for item
4. Selects return reason
5. Uploads photos of issue
6. Submits return request
7. Seller reviews request
8. Seller approves return
9. User ships item back
10. Seller confirms receipt
11. Refund processed
12. User receives refund
```

### UJ005: Support Ticket Journey ✅ TESTED

```
1. User has issue with order
2. Creates support ticket
3. Selects category (Order Issue)
4. Describes problem
5. Attaches screenshot
6. Submits ticket
7. Seller receives notification
8. Seller replies to ticket
9. User provides more info
10. Issue escalated to admin
11. Admin resolves issue
12. Ticket closed
```

### UJ006: Favorites/Wishlist Journey ✅ TESTED

```
1. Guest browses products
2. Clicks heart icon on product
3. Product saved to local storage
4. Guest registers/logs in
5. Local favorites sync to server
6. User enables price drop notification
7. Product price drops
8. User receives notification email
9. User adds item to cart from favorites
10. User removes item from favorites after purchase
```

### UJ007: Messaging Journey 🟡 PARTIAL

```
1. User views product page
2. Clicks "Contact Seller" button
3. Writes inquiry about product
4. Message sent to seller
5. Seller receives notification       ← NOT FULLY TESTED
6. Seller replies with answer
7. User receives reply notification   ← NOT FULLY TESTED
8. User opens conversation thread
9. User sends follow-up question
10. Conversation continues until resolved
11. User archives conversation
```

### UJ008: Blog Reading Journey ✅ TESTED

```
1. User visits blog page
2. Views list of published posts
3. Filters by category
4. Clicks on article
5. Reads full content
6. Views related posts
7. Shares on social media
8. Navigates to another article via tag
```

---

## Admin Scenarios

### AS001: User Management ✅ TESTED

```
1. Admin logs in
2. Views user list
3. Searches for specific user
4. Views user details
5. Bans user with reason
6. User cannot login
7. Admin unbans user
8. User can login again
```

### AS002: Content Moderation ✅ TESTED

```
1. New review submitted
2. Admin views moderation queue
3. Reviews content and images
4. Approves appropriate reviews
5. Rejects inappropriate reviews
6. Approved reviews appear on product
```

### AS003: Payout Processing ✅ TESTED

```
1. Admin views pending payouts
2. Reviews seller verification
3. Verifies bank details
4. Processes payout
5. Marks as completed
6. Seller notified
7. Transaction recorded
```

### AS004: Blog Management ✅ TESTED

```
1. Admin navigates to Blog section
2. Views all published/draft posts
3. Creates new blog post
4. Adds title and content
5. Selects/creates category
6. Adds tags for SEO
7. Sets featured image
8. Previews post
9. Publishes post
10. Views analytics
11. Edits existing post
12. Manages comments (if enabled)
```

### AS005: System Settings ⬜ PENDING

```
1. Admin navigates to Settings
2. Views current configuration
3. Updates site name/logo
4. Configures payment gateways
5. Sets up shipping options
6. Updates email templates
7. Configures tax settings
8. Toggles feature flags
9. Saves all changes
10. Views change audit log
```

---

## Negative Scenarios

### NS001: Invalid Registration ✅ TESTED

- Email already exists → Error message
- Weak password → Validation error
- Invalid email format → Validation error

### NS002: Failed Payment ✅ TESTED

- Card declined → Retry option
- Network error → Resume checkout
- Timeout → Order cancelled after 30 min

### NS003: Out of Stock ✅ TESTED

- User adds to cart → OK
- Stock drops to 0 → Warning in cart
- User tries to checkout → Cannot proceed

### NS004: Expired Auction ✅ TESTED

- User viewing auction → Countdown ends
- User tries to bid → "Auction ended" error
- Winner announced → Correct winner

### NS005: Unauthorized Access ✅ TESTED

- User tries admin route → Redirect to forbidden
- Seller tries other shop → 403 error
- Expired session → Redirect to login

### NS006: Messaging Failures 🟡 PARTIAL

- Message to blocked user → "Cannot send" error
- Attachment too large → Size limit error
- Spam detected → Message rejected
- Rate limit exceeded → "Try again later"

### NS007: Favorites Errors ✅ TESTED

- Add non-existent product → 404 error
- Sync with invalid token → Re-authenticate
- Duplicate add → Silently ignored
- Remove non-favorited → No error

---

## Performance Scenarios

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

### PS004: Messaging System Load

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

### Messages

- Buyer-seller conversations
- Order-related messages
- Support conversations
- Read and unread states

### Favorites

- Users with various favorites counts
- Price drop enabled/disabled
- Shared wishlists
- Guest favorites (local storage)
