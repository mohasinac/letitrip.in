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
- Manage hero slides
- Configure homepage
- Manage blog posts, categories, tags
- Upload static assets

### System Configuration

- Update site settings (name, logo, contact)
- Configure payment gateways (Razorpay, PayU, COD)
- Configure shipping zones and carriers
- Configure SMTP and email templates
- Toggle feature flags
- Enable/disable maintenance mode

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
