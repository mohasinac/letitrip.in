# Guest Features

## Overview

Unauthenticated visitors with permission level 0.

## Page Access

- `/` - Homepage
- `/products` - Browse products (published only)
- `/products/:slug` - Product details (published only)
- `/auctions` - Browse auctions (active only)
- `/auctions/:slug` - Auction details (active only)
- `/shops` - Browse shops (active only)
- `/shops/:slug` - Shop details (active only)
- `/categories` - Browse categories
- `/categories/:slug` - Category products
- `/search` - Search (public results)
- `/login` - Login page
- `/register` - Registration page
- `/about`, `/contact`, `/faq` - Static pages
- `/terms-of-service`, `/privacy-policy` - Legal pages

## Guest Actions

### Browse

- View homepage
- Browse products (published)
- Browse auctions (active)
- Browse shops (active)
- Browse categories
- Search products/auctions/shops
- View product details
- View auction details
- View shop pages
- View approved reviews

### Authentication

- Register new account
- Login

## Guest Cannot

- ❌ Add to cart
- ❌ Place bids
- ❌ Make purchases
- ❌ Write reviews
- ❌ Follow shops
- ❌ Add to favorites/watchlist
- ❌ Create support tickets
- ❌ Access any dashboard
- ❌ View order history
- ❌ Access any user data

## API Access Pattern

```typescript
if (!user) {
  // Guest - only public resources
  if (
    data.status === "published" ||
    data.status === "active" ||
    data.isPublic === true
  ) {
    return true; // Read only
  }
  return false;
}
```

## Prompts to Login

Guest sees prompts when attempting:

- Add to cart → "Login to add items to cart"
- Place bid → "Login to place a bid"
- Add to favorites → "Login to save favorites"
- Write review → "Login to write a review"
- Follow shop → "Login to follow shops"

## Test Scenarios

- [ ] Guest can view homepage
- [ ] Guest can browse published products
- [ ] Guest can view product details
- [ ] Guest can browse active auctions
- [ ] Guest can search
- [ ] Guest is prompted to login for cart
- [ ] Guest is prompted to login for bidding
- [ ] Guest cannot access any dashboard
- [ ] Guest can register new account
