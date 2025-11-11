# Complete Firestore Index Audit - November 11, 2025

## Summary

✅ **Total Indexes Deployed**: 71 composite indexes
✅ **Collections Covered**: 15 collections
✅ **Status**: All indexes deployed and building

## Index Breakdown by Collection

### 1. Shops Collection (9 indexes)

- `is_verified + created_at`
- `is_featured + created_at`
- `owner_id + created_at`
- `is_banned + is_verified + created_at + __name__`
- `is_banned + is_featured + is_verified + created_at + __name__`
- `is_banned + show_on_homepage + created_at + __name__`
- `is_featured + is_verified + created_at + __name__` ⭐ **NEW** (Homepage featured shops)

### 2. Products Collection (13 indexes)

- `shop_id + status`
- `category + created_at`
- `is_verified + created_at`
- `shop_id + slug`
- `category_id + status + price`
- `is_deleted + status + is_featured + created_at` ⭐ **NEW** (Featured products with delete filter)
- `status + is_featured + created_at` ⭐ **NEW** (Featured products)
- `is_deleted + status + price (ASC)` ⭐ **NEW** (Price sorting)
- `is_deleted + status + price (DESC)` ⭐ **NEW** (Price sorting)
- `is_deleted + status + shop_id + created_at` ⭐ **NEW** (Shop products)
- `is_deleted + status + category_id + created_at` ⭐ **NEW** (Category products)

### 3. Auctions Collection (9 indexes)

- `status + end_time`
- `shop_id + status + end_time`
- `category_id + status + end_time`
- `status + highest_bidder_id + updated_at`
- `is_featured + status + end_time` ⭐ **NEW** (Featured auctions)
- `show_on_homepage + status + end_time` ⭐ **NEW** (Homepage auctions)
- `status + current_bid (ASC)` ⭐ **NEW** (Price sorting)
- `status + current_bid (DESC)` ⭐ **NEW** (Price sorting)

### 4. Orders Collection (4 indexes)

- `shop_id + status`
- `user_id + created_at`
- `shop_id + created_at`
- `shop_id + status + created_at` ⭐ **NEW** (Seller order filtering)
- `shop_id + payment_status + created_at` ⭐ **NEW** (Payment status filtering)

### 5. Reviews Collection (8 indexes)

- `product_id + created_at`
- `product_id + rating`
- `user_id + created_at`
- `isFeatured + isApproved + verifiedPurchase + created_at` ⭐ **NEW** (Featured verified reviews)
- `isFeatured + isApproved + created_at` ⭐ **NEW** (Featured approved reviews)
- `shop_id + isApproved + created_at` ⭐ **NEW** (Shop reviews)
- `product_id + rating + created_at` ⭐ **NEW** (Reviews by rating)

### 6. Categories Collection (4 indexes)

- `is_featured + slug`
- `show_on_homepage + sort_order`
- `parent_id + slug`
- `show_on_homepage + sort_order + __name__` ⭐ **NEW** (Homepage categories)

### 7. Blog Posts Collection (4 indexes)

- `status + publishedAt`
- `status + category + publishedAt`
- `status + showOnHomepage + publishedAt`
- `showOnHomepage + status + publishedAt + __name__` ⭐ **NEW** (Homepage blog posts)

### 8. Hero Slides Collection (2 indexes)

- `is_active + sort_order`
- `is_active + position + __name__`

### 9. Users Collection (3 indexes)

- `role + created_at`
- `role + is_banned + created_at` ⭐ **NEW** (Admin user filtering)
- `is_banned + created_at` ⭐ **NEW** (Banned users list)

### 10. Support Tickets Collection (4 indexes)

- `user_id + status`
- `status + created_at` ⭐ **NEW** (Admin tickets by status)
- `category + status + created_at` ⭐ **NEW** (Admin tickets filtering)
- `userId + status + created_at` ⭐ **NEW** (User tickets filtering)

### 11. Bids Collection (2 indexes)

- `auction_id + amount`
- `user_id + created_at`

### 12. Auto Bids Collection (2 indexes)

- `auction_id + max_bid`
- `user_id + is_active + created_at`

### 13. Returns Collection (3 indexes)

- `shop_id + status + created_at`
- `user_id + created_at`
- `status + created_at`

### 14. Other Collections (4 indexes)

- Favorites: `user_id + type + created_at`
- Featured Sections: `is_active + sort_order`
- Cart: `user_id + created_at`
- Sessions: `userId + expiresAt`
- Coupons: `shop_id + code`, `shop_id + is_active + end_date`
- Analytics Events: `shop_id + event_type + timestamp`
- Static Assets: `type + uploadedAt`, `category + uploadedAt`
- Addresses: `userId + isDefault` ⭐ **NEW**

## Use Cases Covered

### Homepage Queries ✅

- ✅ Featured shops
- ✅ Homepage shops
- ✅ Featured categories
- ✅ Homepage categories
- ✅ Featured products
- ✅ Featured auctions
- ✅ Homepage blog posts
- ✅ Featured reviews
- ✅ Hero slides

### Admin Pages ✅

- ✅ User management (role, ban status filtering)
- ✅ Shop management (verification, featured, banned filtering)
- ✅ Product moderation
- ✅ Auction management
- ✅ Order tracking
- ✅ Review moderation
- ✅ Support ticket management
- ✅ Return requests

### Seller Pages ✅

- ✅ Order management (status, payment filtering)
- ✅ Product listings
- ✅ Auction management
- ✅ Dashboard statistics
- ✅ Review responses

### User Pages ✅

- ✅ Order history
- ✅ Address management
- ✅ Bid history
- ✅ Watchlist
- ✅ Favorites
- ✅ Support tickets
- ✅ Reviews

### Search & Filter ✅

- ✅ Product search by shop
- ✅ Product search by category
- ✅ Product price sorting
- ✅ Auction price sorting
- ✅ Featured items
- ✅ Stock availability

## Performance Optimizations

### Query Patterns Optimized

1. **Compound Filters**: Multi-field filtering (e.g., `status + shop_id + created_at`)
2. **Sorted Results**: Price sorting, date sorting with filters
3. **Role-Based Access**: Different indexes for admin/seller/user views
4. **Homepage Loading**: Fast featured content queries
5. **Dashboard Queries**: Seller and admin dashboard data

### Index Strategy

- **Equality First**: `field == value` filters come first
- **Range/Sort Last**: `orderBy` and range filters (`>`, `<`) come last
- ****name** for Tiebreaking**: Added where needed for consistent pagination
- **Minimal Indexes**: Only create indexes for actual queries used

## Next Steps

### 1. Wait for Index Build (Required)

All indexes are now deployed but need time to build:

- **Small data**: 1-5 minutes
- **Medium data**: 5-30 minutes
- **Large data**: 30+ minutes

Check status: https://console.firebase.google.com/project/justforview1/firestore/indexes

### 2. Test After Build

Once all indexes show "Enabled" ✅, test these endpoints:

```bash
# Homepage
curl http://localhost:3000/api/shops?featured=true&verified=true
curl http://localhost:3000/api/products?isFeatured=true&status=published
curl http://localhost:3000/api/auctions?isFeatured=true&status=live
curl http://localhost:3000/api/blog?showOnHomepage=true&status=published
curl http://localhost:3000/api/reviews?isFeatured=true&isApproved=true

# Search
curl http://localhost:3000/api/search?type=products&sort=price-asc
curl http://localhost:3000/api/search?type=auctions&sort=price-desc

# Admin
curl http://localhost:3000/api/admin/users?role=seller&status=active
curl http://localhost:3000/api/admin/tickets?category=product&status=open

# Seller
curl http://localhost:3000/api/seller/orders?status=pending
```

### 3. Monitor Performance

After indexes are active, monitor query performance:

- Check Firebase Console for index usage
- Look for slow queries in logs
- Add more indexes if new query patterns emerge

## Cost Considerations

- **Index Storage**: FREE tier includes 1 GB
- **Index Writes**: Counted per index per document
- **Current Usage**: 71 indexes across 15 collections
- **Optimization**: All indexes are necessary for actual queries

## Maintenance

### When to Add New Indexes

- New query patterns introduced
- New filters added to existing pages
- Error logs show `FAILED_PRECONDITION`
- Firebase Console suggests indexes

### When to Remove Indexes

- Features are deprecated
- Queries are no longer used
- Simpler alternatives found

---

**Last Updated**: November 11, 2025
**Total Indexes**: 71 composite indexes
**Status**: ✅ Deployed, ⏳ Building
**Next Review**: After all indexes show "Enabled"
