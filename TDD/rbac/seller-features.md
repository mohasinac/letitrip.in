# Seller Features

## Overview

Seller users can manage their own shop with permission level 50.

## Dashboard Access

- `/seller/dashboard` - Shop overview
- `/seller/products` - Own products
- `/seller/auctions` - Own auctions
- `/seller/orders` - Shop orders
- `/seller/returns` - Shop returns
- `/seller/coupons` - Shop coupons
- `/seller/revenue` - Revenue tracking
- `/seller/analytics` - Shop analytics
- `/seller/my-shops` - Shop management

## Seller Actions

### Shop Management

- Create shop (if don't have one)
- Update own shop profile
- Upload shop logo/banner
- Configure shop settings
- View shop analytics

### Product Management

- Create products for own shop
- Update own products
- Delete own draft/archived products
- Bulk operations on own products
- Upload product media
- Change product status

### Auction Management

- Create auctions from own products
- Update own auctions (before bids)
- Cancel own auctions (without bids)
- End auctions early (with bids)
- View bids on own auctions

### Order Management

- View orders for own shop
- Update order status
- Add tracking information
- Mark as shipped/delivered
- Bulk order operations (own shop)

### Coupon Management

- Create coupons for own shop
- Update own coupons
- Delete own coupons
- View coupon usage

### Return Handling

- View returns for own shop
- Approve/reject returns
- Escalate to admin

### Support

- View tickets related to shop
- Reply to shop tickets
- Create tickets (as user)

### Financial

- View revenue/earnings
- Request payouts
- View payout history

## Seller Cannot

- ❌ View other sellers' data
- ❌ Manage categories
- ❌ Manage homepage content
- ❌ Process refunds (admin only)
- ❌ Verify shops
- ❌ Ban users
- ❌ Access admin dashboard

## API Access Pattern

```typescript
if (user.role === "seller") {
  // Check ownership
  if (data.shopId === user.shopId) {
    return true;
  }
  // Check if public resource
  if (data.status === "published") {
    return true;
  }
  return false;
}
```

## Test Scenarios

- [ ] Seller can only see own products
- [ ] Seller can only see orders for own shop
- [ ] Seller cannot access admin routes
- [ ] Seller can create coupons for own shop only
- [ ] Seller can reply to reviews on own products
- [ ] Seller can process returns for own shop
- [ ] Seller can request payouts
