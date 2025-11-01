# Unified Products & Categories Collections Guide

## Overview

This guide explains the unified data structure where both sellers and admins share the same `products` and `categories` collections in Firestore.

---

## 🎯 Benefits of Unified Collections

### Before (Separate Collections)

- ❌ `seller_products` separate from `products`
- ❌ Duplicate data and sync issues
- ❌ Complex queries across collections
- ❌ Inconsistent data structures

### After (Unified Collections)

- ✅ Single `products` collection for all products
- ✅ Single `categories` collection for all categories
- ✅ Sellers identified by `sellerId` field
- ✅ Simplified queries and better performance
- ✅ Consistent data structure
- ✅ Easier to maintain and scale

---

## 📊 Data Structure

### Products Collection

**Path**: `/products/{productId}`

```typescript
{
  // Basic Information
  id: string,
  name: string,
  slug: string,
  description: string,

  // Seller Information
  sellerId: string,           // UID of the seller
  sellerName: string,         // Display name of seller

  // Category
  category: string,           // Category ID (primary field for queries)
  categoryId: string,         // Same as category (for compatibility)

  // Pricing
  price: number,
  compareAtPrice?: number,    // Original price (for discounts)
  costPerItem?: number,       // Seller's cost
  taxable: boolean,

  // Inventory
  quantity: number,
  sku: string,
  barcode?: string,
  trackQuantity: boolean,

  // Media
  images: Array<{
    url: string,
    alt: string,
    order?: number
  }>,

  // Status & Visibility
  status: 'draft' | 'active' | 'archived',
  featured: boolean,

  // SEO
  seo: {
    title: string,
    description: string,
    keywords: string[],
    slug: string
  },

  // Metadata
  tags: string[],
  rating: number,
  reviewCount: number,

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Categories Collection

**Path**: `/categories/{categoryId}`

```typescript
{
  // Basic Information
  id: string,
  name: string,
  slug: string,
  description?: string,
  image?: string,
  icon?: string,

  // Hierarchy
  parentIds: string[],        // Array of parent category IDs
  parentSlugs: string[],      // Array of parent slugs
  childIds: string[],         // Array of child category IDs
  paths: string[][],          // All paths from root to this category
  minLevel: number,           // Shortest path depth
  maxLevel: number,           // Longest path depth

  // Status
  isActive: boolean,
  featured: boolean,
  sortOrder: number,

  // Metadata
  productCount: number,       // Cached count of products

  // SEO
  seo: {
    title: string,
    description: string,
    keywords: string[]
  },

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔐 Security Rules

### Products Collection Rules

```javascript
match /products/{productId} {
  // Read Rules
  // - Anyone can read active products
  // - Sellers can read their own products (any status)
  // - Admins can read all products
  allow read: if resource.data.status == 'active' ||
                 isAdmin() ||
                 (request.auth != null && resource.data.sellerId == request.auth.uid);

  // Create Rules
  // - Sellers can create products with their own sellerId
  // - Admins can create any product
  allow create: if request.auth != null &&
                   (isAdmin() ||
                    (isSeller() && request.resource.data.sellerId == request.auth.uid));

  // Update Rules
  // - Sellers can update their own products
  // - Admins can update all products
  allow update: if request.auth != null &&
                   (isAdmin() || resource.data.sellerId == request.auth.uid);

  // Delete Rules
  // - Only admins can delete products
  allow delete: if isAdmin();
}
```

### Categories Collection Rules

```javascript
match /categories/{categoryId} {
  // Read Rules
  // - Anyone can read active categories
  // - Admins can read all categories
  allow read: if resource.data.isActive == true || isAdmin();

  // Write Rules
  // - Only admins can create, update, or delete categories
  allow write: if isAdmin();

  // Validation
  allow create: if validateCategory();
  allow update: if validateCategory();
}
```

---

## 🔄 Migration Process

### Step 1: Run Migration Script

The migration script copies data from `seller_products` to `products`:

```bash
# Make sure environment variables are loaded
source .env.local  # or set them in your shell

# Run the migration
node scripts/migrate-products.js
```

### Step 2: Verify Data

1. Open Firebase Console
2. Go to Firestore Database
3. Check `products` collection
4. Verify all products have:
   - `sellerId` field
   - `category` field
   - `status` field
   - Correct structure

### Step 3: Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### Step 4: Test API Endpoints

```bash
# Test products listing
curl http://localhost:3000/api/products

# Test search
curl http://localhost:3000/api/search?q=test

# Test category products
curl http://localhost:3000/api/products?category=CATEGORY_ID
```

### Step 5: Update Frontend

All frontend components are already updated to use the unified collection:

- ✅ Products listing page
- ✅ Product detail page
- ✅ Category pages
- ✅ Global search
- ✅ Search results page

### Step 6: Backup & Archive (Optional)

After verifying everything works:

```bash
# Export seller_products for backup
firebase firestore:export gs://YOUR_BUCKET/backups/seller_products

# Delete seller_products collection (optional, after thorough testing)
# This should be done manually in Firebase Console
```

---

## 🛠️ API Endpoints

### Get All Products

**Endpoint**: `GET /api/products`

**Query Parameters**:

- `search` - Search term (searches name, description, SKU, tags)
- `category` - Category ID to filter by
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `inStock` - Filter for in-stock items (`true`/`false`)
- `sort` - Sort order: `relevance`, `price-low`, `price-high`, `newest`, `popular`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example**:

```bash
GET /api/products?category=electronics&minPrice=100&maxPrice=1000&sort=price-low&page=1
```

**Response**:

```json
{
  "success": true,
  "products": [...],
  "total": 45,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

### Search Products

**Endpoint**: `GET /api/search`

**Query Parameters**:

- `q` - Search query (minimum 2 characters)

**Example**:

```bash
GET /api/search?q=laptop
```

**Response**:

```json
{
  "products": [{
    "type": "product",
    "id": "...",
    "name": "...",
    "slug": "...",
    "image": "...",
    "price": 999
  }],
  "categories": [...],
  "stores": [...]
}
```

### Get Category

**Endpoint**: `GET /api/categories/[slug]`

**Response**:

```json
{
  "category": {
    "id": "...",
    "name": "Electronics",
    "slug": "electronics",
    ...
  },
  "subcategories": [...]
}
```

---

## 🔍 Querying Products

### By Seller (for Seller Dashboard)

```typescript
// Get all products for a specific seller
const products = await db
  .collection("products")
  .where("sellerId", "==", currentUserId)
  .get();
```

### By Category (for Category Pages)

```typescript
// Get products in a category
const products = await db
  .collection("products")
  .where("status", "==", "active")
  .where("category", "==", categoryId)
  .get();
```

### By Status (for Admin)

```typescript
// Get all pending products
const products = await db
  .collection("products")
  .where("status", "==", "draft")
  .get();
```

### Featured Products

```typescript
// Get featured products
const products = await db
  .collection("products")
  .where("status", "==", "active")
  .where("featured", "==", true)
  .orderBy("createdAt", "desc")
  .limit(10)
  .get();
```

---

## 🎨 Frontend Usage

### Product Listing Component

```tsx
// Fetch products for a category
const fetchProducts = async (categoryId: string) => {
  const response = await fetch(
    `/api/products?category=${categoryId}&status=active`
  );
  const data = await response.json();
  setProducts(data.products);
};
```

### Search Component

```tsx
// Search across products
const search = async (query: string) => {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  setResults(data);
};
```

### Seller Dashboard

```tsx
// Seller's products (requires authentication)
const fetchMyProducts = async () => {
  const user = auth.currentUser;
  const response = await fetch("/api/seller/products"); // This endpoint filters by sellerId
  const data = await response.json();
  setMyProducts(data.products);
};
```

---

## 🚨 Important Notes

### Field Names

- Use `category` (not `categoryId`) for queries - this is the primary field
- Both `category` and `categoryId` contain the same value for compatibility
- Use `sellerId` to identify product owner

### Status Values

- `draft` - Product is being created, not visible to public
- `active` - Product is published and visible
- `archived` - Product is hidden but not deleted

### Quantity & Stock

- `quantity: 0` means out of stock
- `trackQuantity: false` means unlimited stock
- Use `inStock` query parameter to filter

### Pricing

- `price` - Current selling price
- `compareAtPrice` - Original price (shows discount)
- `costPerItem` - Seller's cost (private, admin only)

---

## ✅ Migration Checklist

- [ ] Backup existing data
- [ ] Run migration script
- [ ] Verify products in Firebase Console
- [ ] Deploy security rules
- [ ] Test API endpoints
- [ ] Test frontend pages
- [ ] Test seller dashboard
- [ ] Test admin panel
- [ ] Monitor for errors (24-48 hours)
- [ ] Archive old collection (after verification)

---

## 🐛 Troubleshooting

### No Products Showing

**Issue**: Products page shows empty

**Solutions**:

1. Check if products exist in `products` collection (not `seller_products`)
2. Verify products have `status: 'active'`
3. Check browser console for errors
4. Test API directly: `curl http://localhost:3000/api/products`
5. Verify Firebase indexes are deployed

### Permission Denied Errors

**Issue**: "permission-denied" in browser console

**Solutions**:

1. Deploy security rules: `firebase deploy --only firestore:rules`
2. Wait 1-2 minutes for rules to propagate
3. Check that products have required fields (sellerId, status)
4. Verify user authentication token

### Category Filter Not Working

**Issue**: Products not filtered by category

**Solutions**:

1. Ensure products have `category` field (not just `categoryId`)
2. Check that category ID matches exactly
3. Verify Firestore index exists for `status` + `category`
4. Run: `firebase deploy --only firestore:indexes`

### Seller Can't See Their Products

**Issue**: Seller dashboard shows no products

**Solutions**:

1. Verify products have correct `sellerId`
2. Check that seller is authenticated
3. Ensure `sellerId` matches current user's UID
4. Check security rules allow seller to read their products

---

## 📈 Performance Tips

### Indexes

Make sure these composite indexes exist:

- `status` + `category` + `createdAt`
- `status` + `category` + `price`
- `status` + `sellerId` + `createdAt`
- `status` + `featured` + `createdAt`

### Caching

- Product listings are paginated (20 items)
- Use client-side caching for category data
- Cache search results for 5 minutes

### Query Optimization

- Always filter by `status: 'active'` first
- Use pagination instead of fetching all products
- Limit search results (5 products, 3 categories)

---

## 🔗 Related Documentation

- [Categories & Search Implementation](./features/CATEGORIES_SEARCH_COMPLETE.md)
- [Firebase Deployment](./FIREBASE_DEPLOYMENT_COMPLETE.md)
- [Testing Guide](./TESTING_GUIDE_CATEGORIES_SEARCH.md)
- [API Reference](./core/API_ROUTES_REFERENCE.md)

---

## 💡 Next Steps

1. Run the migration script
2. Test all product pages
3. Update seller dashboard to use new collection
4. Update admin panel if needed
5. Monitor Firebase usage for any issues
6. Consider archiving old `seller_products` after 1 week

---

**Last Updated**: November 2, 2025  
**Status**: Ready for migration  
**Migration Script**: `scripts/migrate-products.js`
