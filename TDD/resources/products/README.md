# Products Resource

## Overview

Product catalog management for sellers with inventory tracking.

## Related Epic

- [E002: Product Catalog](../../epics/E002-product-catalog.md)

## Database Collection

- `products` - Product documents

## API Routes

```
/api/products              - GET    - List products
/api/products              - POST   - Create product (seller)
/api/products/:slug        - GET    - Get product
/api/products/:slug        - PATCH  - Update product
/api/products/:slug        - DELETE - Delete product
/api/products/bulk         - POST   - Bulk operations
/api/products/validate-slug - POST  - Check slug
```

## Types

- `ProductBE` - Backend product type
- `ProductFE` - Frontend product type
- `ProductListItemBE` - List item type

## Service

- `productService` - Product operations

## Components

- `src/components/product/` - Product components
- `src/app/products/` - Product pages
- `src/app/seller/products/` - Seller product management
- `src/app/admin/products/` - Admin product management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
