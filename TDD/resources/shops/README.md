# Shops Resource

## Overview

Shop management for sellers.

## Related Epic

- [E006: Shop Management](../../epics/E006-shop-management.md)

## Database Collection

- `shops` - Shop documents

## API Routes

```
/api/shops              - GET/POST  - List/Create
/api/shops/:slug        - GET/PATCH - Get/Update
/api/shops/bulk         - POST      - Bulk operations
/api/shops/following    - GET       - Followed shops
/api/shops/:slug/follow - POST      - Follow/unfollow
```

## Types

- `ShopBE` - Backend shop type
- `ShopListItemBE` - List item type

## Service

- `shopService` - Shop operations

## Components

- `src/components/shop/` - Shop components
- `src/app/shops/` - Shop pages
- `src/app/seller/my-shops/` - Seller shop management
- `src/app/admin/shops/` - Admin shop management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
