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

## Mobile Feature Access (E025)

### Mobile Navigation

- ✅ Bottom navigation visible (Home, Products, Auctions, Cart, Account)
- ✅ Mobile sidebar shows login/register options
- ✅ Search accessible via header or nav
- ✅ Categories browseable

### Mobile Browsing

- ✅ Product listing as 2-column grid
- ✅ Product filters via MobileBottomSheet
- ✅ ProductGallery swipe navigation
- ✅ ProductGallery pinch-to-zoom
- ✅ Auction listing as 2-column grid
- ✅ Shop listing as cards
- ✅ Category grid touch-friendly

### Mobile Interaction

- ✅ Pull-to-refresh on public listings
- ✅ Horizontal scroll for featured sections
- ✅ Hero carousel swipe gestures
- ✅ Blog posts mobile-readable

### Mobile Favorites (Local)

- ✅ Add to favorites (heart icon)
- ✅ View local favorites in sidebar
- ✅ Prompt to login to sync (MobileBottomSheet)

### Mobile Static Pages

- ✅ About page mobile layout
- ✅ Contact form with MobileFormInput
- ✅ FAQ accordion touch-friendly
- ✅ Legal pages mobile reading mode

### Mobile Authentication

- ✅ Login form with MobileFormInput
- ✅ Register form with MobileFormInput
- ✅ Social login buttons touch-friendly
- ✅ Password show/hide toggle

### Mobile PWA

- ✅ PWA install prompt available
- ✅ Offline browsing (cached pages)
- ✅ Offline indicator when no network

### Mobile Limitations

- ❌ Swipe actions on cart (requires login)
- ❌ Push notifications (requires login)
- ❌ Camera access for uploads (requires login)
- ❌ Message seller (prompts login)

## Platform Enhancement Features (E026-E034)

### Sieve Pagination (E026)

- ✅ Page-based navigation on product listing
- ✅ Page-based navigation on auction listing
- ✅ Page size selector
- ✅ URL-based filter sharing

### Design System (E027)

- ✅ Toggle light/dark mode (saved to localStorage)
- ✅ Theme respects system preference
- ✅ Consistent styling

### RipLimit (E028)

- ❌ Cannot purchase RipLimit (requires login)
- ❌ Cannot bid on auctions (requires login)
- ✅ Can view auction RipLimit requirements

### Smart Address (E029)

- ❌ Cannot save addresses (requires login)
- ✅ Pincode lookup works (public API)
- ✅ GPS location works (for display)

### Searchable Dropdowns (E031)

- ✅ Category filter with search
- ✅ Price range filter
- ✅ Shop filter
- ✅ Mobile bottom sheet mode

### Content Type Search (E032)

- ✅ Filter search by Products/Auctions/Shops
- ✅ View type tabs with counts
- ✅ No access to private types (users, orders)

### Live Header (E033)

- ✅ Cart count (local storage)
- ❌ Notification badge (requires login)
- ❌ RipLimit balance (requires login)
- ✅ Search accessible

### Flexible Links (E034)

- ✅ All links work for guests
- ✅ External links open in new tab
- ✅ Internal navigation works
