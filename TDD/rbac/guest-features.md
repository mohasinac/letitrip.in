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
- `/blog` - Read blog posts
- `/blog/:slug` - Read single post
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
- Read blog posts (published)
- Search products/auctions/shops
- View product details
- View auction details
- View shop pages
- View approved reviews

### Favorites (Local Only)

- Add to favorites (stored in browser localStorage)
- View local favorites
- Remove from local favorites
- Prompted to login to sync

### Authentication

- Register new account
- Login

## Guest Cannot

- ❌ Add to cart (server-side)
- ❌ Place bids
- ❌ Make purchases
- ❌ Write reviews
- ❌ Follow shops
- ❌ Sync favorites to server
- ❌ Enable favorite notifications
- ❌ Send messages to sellers
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
- Sync favorites → "Login to save your favorites"
- Enable notifications → "Login to enable price alerts"
- Contact seller → "Login to message the seller"
- Write review → "Login to write a review"
- Follow shop → "Login to follow shops"

## Test Scenarios

- [ ] Guest can view homepage
- [ ] Guest can browse published products
- [ ] Guest can view product details
- [ ] Guest can browse active auctions
- [ ] Guest can read blog posts
- [ ] Guest can search
- [ ] Guest can add local favorites
- [ ] Guest favorites persist in localStorage
- [ ] Guest is prompted to login for cart
- [ ] Guest is prompted to login for bidding
- [ ] Guest is prompted to login for messaging
- [ ] Guest cannot access any dashboard
- [ ] Guest can register new account
- [ ] Guest favorites merge on login
