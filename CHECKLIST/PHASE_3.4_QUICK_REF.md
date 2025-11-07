# Phase 3.4 Product Management - Quick Reference

## ✅ Completed

### API Routes with Firebase Integration

#### Products Collection API

- **GET** `/api/products` - List products (role-based)

  - Admin: All products
  - Seller: Own shop products only
  - User: Published products only
  - Filters: shopId, categoryId, status, minPrice, maxPrice, isFeatured
  - Pagination: limit parameter (default: 50)

- **POST** `/api/products` - Create product
  - Requires: shop_id, name, slug, price, category_id
  - Validates: Shop ownership, slug uniqueness
  - Sets: created_at, updated_at timestamps
  - Optional: description, images, status, stock_quantity, is_featured

#### Individual Product API

- **GET** `/api/products/[id]` - Get single product (public)
- **PATCH** `/api/products/[id]` - Update product (shop owner only)
  - Validates: Shop ownership, slug uniqueness if changed
  - Prevents: shop_id changes
- **DELETE** `/api/products/[id]` - Delete product (shop owner only)
  - Validates: Shop ownership

### File Locations

```
/src/app/api/products/route.ts          # Collection API
/src/app/api/products/[id]/route.ts     # Individual product API
```

## Product Data Structure

```typescript
{
  id: string;              // Firestore auto-generated
  shop_id: string;         // Required - NOT user_id (allows shop transfer)
  name: string;            // Required
  slug: string;            // Required - Unique
  description: string;     // Optional
  price: number;           // Required
  category_id: string;     // Required
  images: string[];        // Optional - Array of image URLs
  status: string;          // Optional - 'draft' | 'published' | 'archived'
  stock_quantity: number | null;  // Optional - null for unlimited
  is_featured: boolean;    // Optional - Default: false
  created_at: string;      // Auto-generated ISO timestamp
  updated_at: string;      // Auto-updated ISO timestamp
}
```

## Usage Examples

### List All Products (Admin)

```typescript
GET / api / products;
```

### List Products by Shop

```typescript
GET /api/products?shopId=shop123
```

### List Featured Products

```typescript
GET /api/products?isFeatured=true&status=published
```

### Filter by Price Range

```typescript
GET /api/products?minPrice=100&maxPrice=500
```

### Create Product

```typescript
POST /api/products
{
  "shop_id": "shop123",
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "price": 299.99,
  "category_id": "cat123",
  "images": ["url1", "url2"],
  "status": "published",
  "stock_quantity": 100,
  "is_featured": true
}
```

### Update Product

```typescript
PATCH /api/products/prod123
{
  "name": "Updated Name",
  "price": 349.99,
  "status": "published"
}
```

### Delete Product

```typescript
DELETE / api / products / prod123;
```

## Security Features

### Role-Based Access

- **Admin**: Full access to all products
- **Seller**: Can only manage products for shops they own
- **User**: Can only view published products

### Ownership Validation

- Create: Must own the shop
- Update: Must own the shop
- Delete: Must own the shop

### Data Validation

- Required fields checked
- Slug uniqueness enforced
- Price validated as number
- Shop ownership verified

## Firestore Indexes Required

Add these indexes in Firebase Console:

1. **Products by Shop + Created Date**

   - Collection: `products`
   - Fields: `shop_id` (Ascending), `created_at` (Descending)

2. **Products by Category + Created Date**

   - Collection: `products`
   - Fields: `category_id` (Ascending), `created_at` (Descending)

3. **Products by Status + Created Date**

   - Collection: `products`
   - Fields: `status` (Ascending), `created_at` (Descending)

4. **Featured Products**
   - Collection: `products`
   - Fields: `is_featured` (Ascending), `created_at` (Descending)

## Next Steps

- [ ] Add product image upload functionality
- [ ] Create product management UI components
- [ ] Add product table with filters
- [ ] Add product form component
- [ ] Add bulk product operations

## Testing

Test Firebase connection:

```bash
curl http://localhost:3000/api/test/firebase
```

Test products API:

```bash
# List products
curl http://localhost:3000/api/products

# Create product (requires auth)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"shop_id":"shop123","name":"Test","slug":"test","price":99,"category_id":"cat123"}'
```
