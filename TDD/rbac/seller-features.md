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
- `/seller/messages` - Buyer messages
- `/seller/messages/:id` - Conversation view

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

### Messaging

- View buyer messages for own shop
- Reply to buyer inquiries
- View order-related messages
- Attach images to responses
- Track response time

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
- [ ] Seller can view messages from buyers
- [ ] Seller can reply to buyer messages
- [ ] Seller cannot view other sellers' messages
- [ ] Seller can see which products are favorited

## Mobile Feature Access (E025)

### Mobile Navigation

- ✅ MobileSellerSidebar for navigation
- ✅ Hamburger menu in header
- ✅ Collapsible seller sections
- ✅ MobileQuickActions FAB (Add Product, View Orders, etc.)

### Mobile Dashboard

- ✅ Dashboard stat cards responsive
- ✅ Pull-to-refresh on dashboard
- ✅ Revenue charts mobile-sized
- ✅ Quick action buttons prominent

### Mobile Product Management

- ✅ Product list as MobileDataTable cards
- ✅ Product swipe actions (Edit, Delete, Status)
- ✅ Product create wizard mobile-optimized
- ✅ MobileFormInput for all fields
- ✅ Camera capture for product photos
- ✅ Image editor with touch gestures
- ✅ Category selector via MobileFormSelect

### Mobile Auction Management

- ✅ Auction list as MobileDataTable cards
- ✅ Auction create form mobile-optimized
- ✅ Date/time picker native mobile pickers
- ✅ Bid list as cards in detail view

### Mobile Order Management

- ✅ Orders as MobileDataTable cards
- ✅ Swipe right to accept orders
- ✅ Order status via MobileActionSheet
- ✅ Tracking info via MobileFormInput
- ✅ Bulk select with touch checkboxes

### Mobile Coupon Management

- ✅ Coupon create form mobile-optimized
- ✅ Date pickers as native mobile pickers
- ✅ Discount type via MobileFormSelect

### Mobile Media Upload

- ✅ MediaUploader touch-friendly
- ✅ CameraCapture fullscreen mode
- ✅ ImageEditor touch crop/rotate
- ✅ MediaGallery touch reorder
- ✅ Swipe to delete media

### Mobile Returns

- ✅ Returns list as MobileDataTable cards
- ✅ Return approval via MobileActionSheet
- ✅ Evidence images in lightbox with zoom

### Mobile Messaging

- ✅ Message list as cards
- ✅ Reply via MobileBottomSheet
- ✅ Attachment upload touch-friendly

## Platform Enhancement Features (E026-E034)

### Sieve Pagination (E026)

- ✅ Page-based navigation on product list
- ✅ Page-based navigation on order list
- ✅ Page-based navigation on auction list
- ✅ Sorting on all tables
- ✅ Filtering with all operators

### Design System (E027)

- ✅ Toggle light/dark mode in dashboard
- ✅ Theme preference persists
- ✅ Consistent styling across seller pages

### RipLimit (E028)

- ❌ Sellers cannot bid on auctions
- ❌ Sellers cannot purchase RipLimit
- ✅ Can view winning bidders' RipLimit usage

### Smart Address (E029)

- ✅ Smart address for shop location
- ✅ GPS-based location selection
- ✅ Pincode auto-population
- ✅ Mobile number for shop contact
- ✅ Multiple shop locations (future)

### Searchable Dropdowns (E031)

- ✅ Category selector with search
- ✅ Product status filter with search
- ✅ Order status filter with search
- ✅ Multi-select for bulk actions

### Content Type Search (E032)

- ✅ Search within own products
- ✅ Search within own orders
- ✅ Type filter in seller dashboard

### Live Header (E033)

- ✅ Order notification badge
- ✅ Message notification badge
- ✅ Return request badge
- ✅ Quick actions in header

### Flexible Links (E034)

- ✅ Product links can be relative
- ✅ External links in product descriptions
- ✅ Shop social links support both formats
