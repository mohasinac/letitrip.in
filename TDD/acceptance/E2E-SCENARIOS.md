# End-to-End Test Scenarios

## User Journeys

### UJ001: New User Purchase Journey

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

### UJ002: Auction Bidding Journey

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

### UJ003: Seller Product Listing Journey

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

### UJ004: Return/Refund Journey

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

### UJ005: Support Ticket Journey

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

---

## Admin Scenarios

### AS001: User Management

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

### AS002: Content Moderation

```
1. New review submitted
2. Admin views moderation queue
3. Reviews content and images
4. Approves appropriate reviews
5. Rejects inappropriate reviews
6. Approved reviews appear on product
```

### AS003: Payout Processing

```
1. Admin views pending payouts
2. Reviews seller verification
3. Verifies bank details
4. Processes payout
5. Marks as completed
6. Seller notified
7. Transaction recorded
```

---

## Negative Scenarios

### NS001: Invalid Registration

- Email already exists → Error message
- Weak password → Validation error
- Invalid email format → Validation error

### NS002: Failed Payment

- Card declined → Retry option
- Network error → Resume checkout
- Timeout → Order cancelled after 30 min

### NS003: Out of Stock

- User adds to cart → OK
- Stock drops to 0 → Warning in cart
- User tries to checkout → Cannot proceed

### NS004: Expired Auction

- User viewing auction → Countdown ends
- User tries to bid → "Auction ended" error
- Winner announced → Correct winner

### NS005: Unauthorized Access

- User tries admin route → Redirect to forbidden
- Seller tries other shop → 403 error
- Expired session → Redirect to login

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
