# User Features

## Overview

Regular users can browse, buy, and interact with permission level 10.

## Page Access

- `/` - Homepage
- `/products` - Browse products
- `/auctions` - Browse auctions
- `/shops` - Browse shops
- `/categories` - Browse categories
- `/blog` - Read blog posts
- `/blog/:slug` - Read single post
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
- `/user/messages` - Messages inbox
- `/user/messages/:id` - Conversation view
- `/user/tickets` - Support tickets
- `/user/settings` - Settings
- `/user/notifications` - Notifications
- `/user/riplimit` - RipLimit balance & purchase (E028)

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
- Enable price drop notifications
- Enable back-in-stock notifications
- Sync favorites on login

### Messaging

- Send messages to sellers
- View conversation history
- Reply to messages
- Archive conversations
- Attach images to messages
- Receive message notifications

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
- [ ] User can add/remove favorites
- [ ] User can enable favorite notifications
- [ ] User can send messages to sellers
- [ ] User can view own conversations only
- [ ] User can read blog posts
- [ ] User cannot access seller/admin routes

## Mobile Feature Access (E025)

### Mobile Navigation

- ✅ Bottom navigation visible on mobile
- ✅ Mobile sidebar for account navigation
- ✅ Pull-to-refresh on all data pages
- ✅ Swipe actions on cart items, addresses, favorites

### Mobile Forms

- ✅ MobileFormInput on all user forms
- ✅ MobileFormSelect for dropdowns
- ✅ MobileBottomSheet for address form
- ✅ Touch-friendly input sizes (48px+)

### Mobile Shopping

- ✅ ProductGallery swipe/zoom
- ✅ Product filters via MobileBottomSheet
- ✅ Cart swipe-to-delete
- ✅ Checkout in mobile-optimized flow

### Mobile Auctions

- ✅ Auction bid via MobileBottomSheet
- ✅ Auto-bid setup in bottom sheet
- ✅ Watchlist swipe actions

### Mobile User Dashboard

- ✅ Orders as MobileDataTable cards
- ✅ Bids as MobileDataTable cards
- ✅ Addresses with swipe actions
- ✅ Favorites with swipe actions

### Mobile Interactions

- ✅ MobileActionSheet for confirmations
- ✅ MobileSkeleton for loading states
- ✅ Touch targets 44px+ minimum
- ✅ PWA install prompt available

## Platform Enhancement Features (E026-E034)

### Sieve Pagination (E026)

- ✅ Page-based navigation on product lists
- ✅ Page-based navigation on auction lists
- ✅ Page size selector available
- ✅ URL sync for sharing filtered views

### Design System (E027)

- ✅ Toggle light/dark mode
- ✅ Theme preference saved to localStorage
- ✅ Consistent styling via CSS variables

### RipLimit (E028)

- `/user/riplimit` - Purchase and manage RipLimit
- ✅ View current balance
- ✅ Purchase RipLimit with any payment method
- ✅ View transaction history
- ✅ Bid on auctions using RipLimit
- ✅ Request refund of unused RipLimit
- ❌ Cannot bid if has unpaid auctions
- ❌ Cannot refund if has blocked balance

### Smart Address (E029)

- ✅ Use GPS location to auto-fill address
- ✅ Pincode lookup auto-populates area/city/state
- ✅ Mobile number per address
- ✅ Label addresses (Home/Work/Other)
- ✅ Search-enabled area/city selection

### Searchable Dropdowns (E031)

- ✅ Category filter with search
- ✅ Multi-select with chips
- ✅ Clear all button
- ✅ Keyboard navigation
- ✅ Mobile bottom sheet mode

### Content Type Search (E032)

- ✅ Filter search by Products/Auctions/Shops
- ✅ Type tabs on search results
- ✅ Result counts per type
- ✅ URL reflects type filter

### Live Header (E033)

- ✅ Real-time cart count
- ✅ Real-time notification count
- ✅ RipLimit balance in header (if has balance)
- ✅ Cart preview on hover
- ✅ Notification dropdown

### Flexible Links (E034)

- ✅ Relative paths work in all link fields
- ✅ External links open in new tab
- ✅ Internal links stay in same tab
