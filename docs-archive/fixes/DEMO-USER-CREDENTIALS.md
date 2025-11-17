# Demo User Credentials - JustForView.in

## Demo User Accounts

These accounts are created when you generate demo data from `/admin/demo`.

### Admin Users

```
Email: admin@justforview.in
Password: Admin@123
Role: admin
```

### Seller Accounts (Shop Owners)

**Seller 1 - CollectorsHub**

```
Email: alex.chen@demo.justforview.in
Name: DEMO_Alex Chen
Password: Demo@123
Shop: DEMO_CollectorsHub - TCG & Collectibles
Role: seller
```

**Seller 2 - Anime Legends**

```
Email: raj.patel@demo.justforview.in
Name: DEMO_Raj Patel
Password: Demo@123
Shop: DEMO_Anime Legends - Figure Paradise
Role: seller
```

### Buyer Accounts (Customers)

**Buyer 1**

```
Email: priya.sharma@demo.justforview.in
Name: DEMO_Priya Sharma
Password: Demo@123
Role: user
```

**Buyer 2**

```
Email: john.smith@demo.justforview.in
Name: DEMO_John Smith
Password: Demo@123
Role: user
```

**Buyer 3**

```
Email: maria.garcia@demo.justforview.in
Name: DEMO_Maria Garcia
Password: Demo@123
Role: user
```

**Buyer 4**

```
Email: kenji.tanaka@demo.justforview.in
Name: DEMO_Kenji Tanaka
Password: Demo@123
Role: user
```

**Buyer 5**

```
Email: sarah.j@demo.justforview.in
Name: DEMO_Sarah Johnson
Password: Demo@123
Role: user
```

## Account Features

### Sellers Can:

- Manage their shop
- Create/edit products (50 products per shop)
- Create/edit auctions (5 auctions per shop)
- View and fulfill orders
- Track revenue and analytics
- Upload product images/videos
- Manage shop settings
- View shop performance

### Buyers Can:

- Browse products and auctions
- Place bids on active auctions
- Add products to cart
- Create orders
- Leave reviews
- Save favorites
- Track order status
- Manage addresses

## Using Demo Accounts

1. **Login**: Navigate to `/login` and use any of the credentials above
2. **Seller Dashboard**: After login as seller, visit `/seller/dashboard`
3. **Admin Panel**: After login as admin, visit `/admin/dashboard`
4. **User Profile**: After login, visit `/user/profile`

## Avatar Setup

Currently avatars are not implemented. This will be added in Phase 2 of the UI improvements.

**Planned Features:**

- Upload custom avatar images
- Generate avatar from initials
- Default avatar placeholders
- Avatar display in:
  - User profile
  - Reviews
  - Comments
  - Order history
  - Bid history
  - Shop owner cards

## Data Structure

Each demo user has:

```typescript
{
  name: "DEMO_[UserName]",
  email: "[user]@demo.justforview.in",
  role: "seller" | "user" | "admin",
  isActive: true,
  phone: "+91-98765XXXXX",
  addresses: [{
    id: "addr-[userId]-1",
    street: "[Address]",
    city: "[City]",
    state: "[State]",
    pincode: "[PIN]",
    isDefault: true,
    label: "Home"
  }],
  createdAt: Date,
  updatedAt: Date,
  passwordHash: "$2a$10$demoHashForTestingOnly"
}
```

## Testing Scenarios

### Scenario 1: Complete Purchase Flow

1. Login as buyer (priya.sharma@demo.justforview.in)
2. Browse products from CollectorsHub
3. Add items to cart
4. Proceed to checkout
5. Complete payment
6. Track order

### Scenario 2: Auction Bidding

1. Login as buyer (john.smith@demo.justforview.in)
2. Browse active auctions
3. Place bids on multiple auctions
4. Enable auto-bidding
5. Monitor bid status
6. Win auction

### Scenario 3: Seller Operations

1. Login as seller (alex.chen@demo.justforview.in)
2. View shop dashboard
3. Create new product
4. Upload product images
5. Create auction
6. Manage orders
7. View analytics

### Scenario 4: Admin Operations

1. Login as admin
2. View all shops
3. Moderate content
4. Manage users
5. View analytics
6. Generate reports

## Security Notes

**⚠️ Important**: These are demo accounts for testing only.

- All demo passwords are `Demo@123`
- Never use these credentials in production
- Demo accounts are prefixed with `DEMO_`
- Can be deleted anytime via `/admin/demo`
- Password hashes are placeholder values for testing

## Cleanup

To remove all demo users and data:

1. Navigate to `/admin/demo`
2. Click "Delete All Demo Data"
3. Confirm deletion
4. All `DEMO_` prefixed data will be removed

---

**Last Updated**: November 17, 2025  
**Version**: 1.0
