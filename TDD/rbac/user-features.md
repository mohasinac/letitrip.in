# User Features

## Overview

Regular users can browse, buy, and interact with permission level 10.

## Page Access

- `/` - Homepage
- `/products` - Browse products
- `/auctions` - Browse auctions
- `/shops` - Browse shops
- `/categories` - Browse categories
- `/search` - Search
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/user/profile` - Profile
- `/user/addresses` - Addresses
- `/user/orders` - Order history
- `/user/favorites` - Favorites
- `/user/watchlist` - Auction watchlist
- `/user/bids` - My bids
- `/user/won-auctions` - Won auctions
- `/user/tickets` - Support tickets
- `/user/settings` - Settings

## User Actions

### Account

- Register new account
- Login/logout
- Update profile
- Change password
- Manage addresses
- Set notification preferences

### Shopping

- Browse products
- Add to cart
- Update cart quantity
- Apply coupons
- Checkout and pay
- View order history
- Cancel pending orders

### Auctions

- View active auctions
- Place bids
- Set auto-bid
- Add to watchlist
- View my bids
- Complete won auction purchase

### Reviews

- Write reviews (verified purchase)
- Edit own reviews
- Delete own reviews
- Vote helpful on reviews

### Support

- Create support tickets
- Reply to own tickets
- Close own tickets
- Request returns

### Favorites

- Add products to favorites
- Remove from favorites
- Add auctions to watchlist

### Shops

- Follow shops
- View shop products

## User Cannot

- ❌ Create products/auctions
- ❌ Manage any shop
- ❌ Process orders
- ❌ Access seller dashboard
- ❌ Access admin dashboard
- ❌ View other users' data
- ❌ Moderate content

## API Access Pattern

```typescript
if (user.role === "user") {
  // Check ownership
  if (data.userId === user.uid) {
    return true;
  }
  // Check if public resource
  if (data.status === "published" || data.status === "active") {
    return true;
  }
  return false;
}
```

## Test Scenarios

- [ ] User can register and login
- [ ] User can update own profile only
- [ ] User can manage own addresses
- [ ] User can add to cart and checkout
- [ ] User can place bids on auctions
- [ ] User can write reviews after purchase
- [ ] User can create support tickets
- [ ] User cannot access seller/admin routes
