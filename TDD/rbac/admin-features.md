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
- Manage blog posts
- Upload static assets

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
