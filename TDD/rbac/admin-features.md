# Admin Features

## Overview

Admin users have full platform access with permission level 100.

## Dashboard Access

- `/admin/dashboard` - Platform overview
- `/admin/users` - User management
- `/admin/products` - All products
- `/admin/auctions` - All auctions
- `/admin/orders` - All orders
- `/admin/shops` - Shop management
- `/admin/categories` - Category management
- `/admin/coupons` - All coupons
- `/admin/reviews` - Review moderation
- `/admin/tickets` - All support tickets
- `/admin/returns` - All returns
- `/admin/payments` - Payment management
- `/admin/payouts` - Payout processing
- `/admin/hero-slides` - Homepage slides
- `/admin/homepage` - Homepage settings
- `/admin/static-assets` - Asset management
- `/admin/blog` - Blog management
- `/admin/blog/categories` - Blog categories
- `/admin/blog/tags` - Blog tags
- `/admin/settings` - System settings
- `/admin/settings/general` - General settings
- `/admin/settings/payment` - Payment gateway config
- `/admin/settings/shipping` - Shipping settings
- `/admin/settings/email` - Email/SMTP settings
- `/admin/settings/notifications` - Notification settings
- `/admin/settings/features` - Feature flags
- `/admin/messages` - All messages (moderation)
- `/admin/demo` - Demo data generation

## Exclusive Admin Actions

### User Management

- List all users (any role, any status)
- View any user's full details
- Ban/unban users
- Change user roles
- Bulk user operations
- Verify user email manually

### Shop Management

- Verify/unverify shops
- Suspend shops
- Delete shops
- Override shop settings

### Product/Auction Management

- View all products (any status)
- Feature/unfeature products
- Delete any product
- Feature auctions
- Cancel auctions with bids (override)

### Order Management

- View all orders
- Override order status
- Process manual refunds
- Bulk order operations

### Financial

- View all payments
- Process refunds
- Process payouts
- View platform revenue

### Content Management

- Manage categories (full CRUD)
- Configure similar category relations
- Manage hero slides with route fixes
- Configure homepage sections (featured, trending, etc.)
- Manage tabbed navigation on homepage
- Manage blog posts, categories, tags
- Upload static assets
- Advanced media uploads (crop, rotate, focus point)
- Video thumbnail generation

### System Configuration

- Update site settings (name, logo, contact)
- Configure payment gateways (Razorpay, PayU, COD)
- Configure shipping zones and carriers
- Configure SMTP and email templates
- Toggle feature flags
- Enable/disable maintenance mode
- Configure supported languages (i18n - planned)
- Manage translations (i18n - planned)

### Messaging

- View all conversations
- Reply as support
- Moderate messages

### Moderation

- Approve/reject reviews
- Handle escalated tickets
- Handle escalated returns
- Add internal notes to tickets

## API Access Pattern

```typescript
// Admin can access all resources
if (user.role === "admin") {
  return true; // Full access
}
```

## Test Scenarios

- [ ] Admin can view users of all roles
- [ ] Admin can ban/unban any user
- [ ] Admin can change any user's role
- [ ] Admin can view all orders across shops
- [ ] Admin can process refunds
- [ ] Admin can verify/unverify shops
- [ ] Admin can manage categories
- [ ] Admin can manage homepage content
- [ ] Admin can create/edit/delete blog posts
- [ ] Admin can manage blog categories and tags
- [ ] Admin can update system settings
- [ ] Admin can configure payment gateways
- [ ] Admin can enable maintenance mode
- [ ] Admin can toggle feature flags
- [ ] Admin can view all messages
- [ ] Admin can reply to any conversation

## Mobile Feature Access (E025)

### Mobile Navigation

- ✅ MobileAdminSidebar for navigation
- ✅ Hamburger menu in header
- ✅ All admin sections accessible
- ✅ Collapsible section groups
- ✅ MobileQuickActions FAB (not typical for admin)

### Mobile Dashboard

- ✅ Dashboard stat cards responsive (2x2 grid)
- ✅ Pull-to-refresh on dashboard
- ✅ Charts mobile-optimized
- ✅ Quick access tiles touch-friendly

### Mobile User Management

- ✅ Users list as MobileDataTable cards
- ✅ User search via MobileFormInput
- ✅ Swipe actions (Ban, Edit, View)
- ✅ Role change via MobileActionSheet
- ✅ Bulk select with touch checkboxes
- ✅ Bulk actions via MobileActionSheet

### Mobile Product Management

- ✅ All products as MobileDataTable cards
- ✅ Filters via MobileBottomSheet
- ✅ Swipe to feature/unfeature
- ✅ Product edit form mobile-optimized

### Mobile Shop Management

- ✅ Shops list as MobileDataTable cards
- ✅ Verify/suspend via MobileActionSheet
- ✅ Shop detail scrollable

### Mobile Category Management

- ✅ Category tree mobile-optimized
- ✅ Category wizard mobile forms
- ✅ Touch drag-to-reorder
- ✅ Bulk operations via MobileActionSheet

### Mobile Order Management

- ✅ All orders as MobileDataTable cards
- ✅ Order filters via MobileBottomSheet
- ✅ Refund processing via MobileBottomSheet
- ✅ Bulk status update via MobileActionSheet

### Mobile Content Management

- ✅ Hero slides list as cards
- ✅ Hero slide form mobile-optimized
- ✅ Route fixing for hero slides
- ✅ Homepage sections management
- ✅ Section reordering via drag-drop
- ✅ Tabbed navigation configuration
- ✅ Blog posts list as cards
- ✅ Blog editor mobile-optimized
- ✅ Image upload touch-friendly
- ✅ ImageEditor with crop/zoom/rotate
- ✅ Focus point selection for mobile
- ✅ Video thumbnail generation

### Mobile Financial

- ✅ Payouts list as MobileDataTable cards
- ✅ Payout processing via MobileActionSheet
- ✅ Revenue charts mobile-sized

### Mobile Moderation

- ✅ Review queue as cards
- ✅ Approve/reject via swipe or MobileActionSheet
- ✅ Ticket list as cards
- ✅ Internal notes via MobileBottomSheet

### Mobile Settings (E021)

- ⬜ Settings form mobile-optimized (pending)
- ⬜ Logo upload touch-friendly (pending)
- ⬜ Feature toggles touch-friendly (pending)

## Platform Enhancement Features (E026-E034)

### Sieve Pagination (E026)

- ✅ Page-based navigation on all admin tables
- ✅ Advanced filtering with all operators
- ✅ Multi-column sorting
- ✅ Configure default page sizes
- ✅ Export filtered data

### Design System (E027)

- ✅ Toggle light/dark mode
- ✅ Access design token configuration
- ✅ Preview theme changes
- ✅ Update brand colors (future)

### RipLimit Management (E028)

- `/admin/riplimit` - RipLimit dashboard
- ✅ View total RipLimit in circulation
- ✅ View total revenue from purchases
- ✅ View blocked RipLimit in bids
- ✅ View refund statistics
- ✅ Search users by RipLimit balance
- ✅ Adjust user balance (with reason)
- ✅ Force release blocked RipLimit
- ✅ Clear unpaid auction flag
- ✅ Ban user from RipLimit system

### Smart Address (E029)

- ✅ View all user addresses
- ✅ Edit any user address
- ✅ Verify address accuracy
- ✅ Configure Google Places API
- ✅ Manage pincode database

### Code Quality (E030)

- ✅ Access SonarQube dashboard (external)
- ✅ View code quality metrics
- ✅ Configure quality gates
- ✅ Review duplication reports

### Searchable Dropdowns (E031)

- ✅ All admin selects are searchable
- ✅ User role assignment searchable
- ✅ Category multi-select searchable
- ✅ Status filters searchable

### Content Type Search (E032)

- ✅ Global search across all content
- ✅ Filter by any content type
- ✅ Admin-only content types (users, orders, etc.)

### Live Header (E033)

- ✅ Pending order count
- ✅ Pending payout count
- ✅ Open ticket count
- ✅ Review queue count
- ✅ Real-time updates

### Flexible Links (E034)

- ✅ Hero slides support relative links
- ✅ Banner links support relative paths
- ✅ Blog post links flexible
- ✅ CTA buttons support all formats
