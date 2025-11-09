# Products Resource Documentation

**Resource Type**: Core Business Entity  
**Collection**: `products`  
**Primary Use**: Product catalog management across admin, seller, and public pages

---

## Table of Contents

1. [Overview](#overview)
2. [Schema & Fields](#schema--fields)
3. [Related Resources](#related-resources)
4. [Filters & Search](#filters--search)
5. [Inline Logic & Quick Create](#inline-logic--quick-create)
6. [Wizards & Forms](#wizards--forms)
7. [Card Displays](#card-displays)
8. [Bulk Actions](#bulk-actions)
9. [Diagrams](#diagrams)
10. [Why We Need This](#why-we-need-this)
11. [Quick Reference](#quick-reference)

---

## Overview

**Products** are the core inventory items that sellers list for sale on the platform. Each product belongs to a seller (shop), is categorized, has pricing/inventory details, media, and various attributes that control its visibility and behavior.

### Key Characteristics

- **Multi-tenancy**: Each product belongs to a specific seller
- **Categorization**: Products are organized in hierarchical categories
- **Status-based**: Products can be draft, active, or archived
- **Media-rich**: Supports multiple images and optional videos
- **SEO-optimized**: Built-in SEO fields for better discoverability
- **Stats-tracked**: Views, sales, and revenue automatically tracked

---

## Schema & Fields

### Firestore Collection: `products`

```typescript
interface Product {
  // ==================== IDENTIFICATION ====================
  id: string; // Auto-generated document ID
  name: string; // Product name (2-200 chars)
  slug: string; // URL-friendly identifier (unique)
  description: string; // Full product description (10-5000 chars)
  shortDescription?: string; // Brief description (max 500 chars)

  // ==================== OWNERSHIP ====================
  shopId: string; // Shop/seller ID (REQUIRED)
  sellerId: string; // Seller user ID (REQUIRED)
  sellerName?: string; // Cached seller name for display

  // ==================== CATEGORIZATION ====================
  categoryId: string; // Category ID (REQUIRED)
  category: string; // Same as categoryId (PRIMARY for queries)
  tags?: string[]; // Search tags (max 20)
  brand?: string; // Brand name (max 100 chars)

  // ==================== PRICING ====================
  price: number; // Current selling price (REQUIRED, positive)
  compareAtPrice?: number; // Original/compare price (for discounts)
  originalPrice?: number; // Alias for compareAtPrice
  costPrice?: number; // Seller's cost (not shown to buyers)
  cost?: number; // Alias for costPrice

  // ==================== INVENTORY ====================
  stockCount: number; // Available quantity (REQUIRED, non-negative)
  quantity: number; // Alias for stockCount
  lowStockThreshold: number; // Alert threshold (default: 10)
  sku: string; // Stock keeping unit (REQUIRED, max 100)
  barcode?: string; // Product barcode (max 50)
  trackQuantity: boolean; // Enable/disable stock tracking (default: true)
  allowBackorders?: boolean; // Allow orders when out of stock

  // ==================== PHYSICAL PROPERTIES ====================
  condition: ProductCondition; // 'new' | 'used' | 'refurbished'
  weight?: number; // Product weight (positive)
  weightUnit?: string; // 'kg' | 'g' | 'lb' | 'oz'
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "inch";
    weight: number;
    weightUnit: "kg" | "g" | "lb";
  };

  // ==================== MEDIA ====================
  images: Array<{
    // Product images (1-10 required)
    url: string; // Image URL (Firebase Storage)
    alt: string; // Alt text for accessibility
    order?: number; // Display order
  }>;
  videos?: Array<{
    // Product videos (0-5 optional)
    url: string; // Video URL
    title: string; // Video title
    thumbnail?: string; // Thumbnail URL
    duration?: number; // Duration in seconds
    order: number; // Display order
  }>;

  // ==================== SHIPPING & FULFILLMENT ====================
  shippingClass?: string; // 'standard' | 'express' | 'heavy' | 'fragile'
  requiresShipping: boolean; // Physical vs digital product (default: true)
  isDigital?: boolean; // Digital product flag

  // ==================== POLICIES ====================
  isReturnable: boolean; // Can be returned (REQUIRED)
  returnWindowDays: number; // Return period (default: 7 days)
  warranty?: string; // Warranty information (max 200 chars)

  // ==================== SPECIFICATIONS ====================
  specifications?: Record<string, string>; // Key-value pairs
  features?: string[]; // Feature list (max 20 items)
  manufacturer?: string; // Manufacturer name (max 100 chars)
  countryOfOrigin: string; // Origin country (REQUIRED)

  // ==================== VARIANTS ====================
  hasVariants?: boolean; // Has product variants
  variants?: ProductVariant[]; // Variant definitions

  // ==================== SEO ====================
  seo: {
    title: string; // Meta title (10-60 chars)
    description: string; // Meta description (50-160 chars)
    keywords: string[]; // SEO keywords (max 20)
    slug: string; // URL slug (must match product slug)
    focusKeyword?: string; // Primary keyword
  };
  metaTitle?: string; // Alias for seo.title
  metaDescription?: string; // Alias for seo.description

  // ==================== STATUS & VISIBILITY ====================
  status: ProductStatus; // 'draft' | 'published' | 'archived' | 'out-of-stock'
  isFeatured: boolean; // Featured on homepage (default: false)
  showOnHomepage: boolean; // Show on homepage (default: false)
  featured?: boolean; // Alias for isFeatured

  // ==================== STATISTICS ====================
  rating: number; // Average rating (0-5, auto-calculated)
  reviewCount: number; // Total approved reviews (auto-calculated)
  salesCount: number; // Total units sold (auto-incremented)
  viewCount: number; // Total views (auto-incremented)
  stats?: {
    views: number; // Alias for viewCount
    sales: number; // Alias for salesCount
    revenue: number; // Total revenue from this product
  };

  // ==================== SCHEDULING ====================
  publishDate?: Date | Timestamp; // Schedule publish date
  expirationDate?: Date | Timestamp; // Auto-archive date
  startDate?: Date | Timestamp; // Alias for publishDate

  // ==================== TIMESTAMPS ====================
  createdAt: Date | Timestamp; // Creation timestamp (auto)
  updatedAt: Date | Timestamp; // Last update timestamp (auto)
}
```

### Required Fields

**Minimum Required for Creation:**

```typescript
{
  name: string,              // Product name
  slug: string,              // URL slug
  description: string,       // Description
  price: number,             // Price
  category: string,          // Category ID
  categoryId: string,        // Category ID (same as category)
  sellerId: string,          // Seller ID
  shopId: string,            // Shop ID
  sku: string,               // SKU
  quantity: number,          // Stock quantity
  status: 'draft' | 'active' | 'archived',
  images: [{                 // At least one image
    url: string,
    alt: string
  }],
  isReturnable: boolean,
  returnWindowDays: number,
  countryOfOrigin: string,
  condition: 'new' | 'used' | 'refurbished'
}
```

### Field Validation Rules

| Field         | Type   | Min  | Max      | Required | Pattern               | Default |
| ------------- | ------ | ---- | -------- | -------- | --------------------- | ------- |
| `name`        | string | 2    | 200      | ✅       | -                     | -       |
| `slug`        | string | 2    | 200      | ✅       | `^[a-z0-9-]+$`        | -       |
| `description` | string | 10   | 5000     | ✅       | -                     | -       |
| `price`       | number | 0.01 | 10000000 | ✅       | positive              | -       |
| `quantity`    | number | 0    | 100000   | ✅       | non-negative          | 0       |
| `sku`         | string | 1    | 100      | ✅       | -                     | -       |
| `category`    | string | 1    | -        | ✅       | valid category ID     | -       |
| `images`      | array  | 1    | 10       | ✅       | valid URLs            | []      |
| `tags`        | array  | 0    | 20       | ❌       | -                     | []      |
| `rating`      | number | 0    | 5        | ❌       | -                     | 0       |
| `status`      | enum   | -    | -        | ✅       | draft/active/archived | 'draft' |

---

## Related Resources

### Direct Relationships

1. **Shops** (One-to-Many)

   - Each product belongs to ONE shop
   - Field: `shopId`
   - Relationship: `products.shopId → shops.id`
   - Use: Display seller information, filter by shop

2. **Categories** (Many-to-One)

   - Each product belongs to ONE category
   - Fields: `category`, `categoryId`
   - Relationship: `products.category → categories.id`
   - Use: Filter by category, breadcrumb navigation

3. **Users** (Creator/Seller)

   - Each product created by ONE user (seller)
   - Field: `sellerId`
   - Relationship: `products.sellerId → users.uid`
   - Use: Permission checks, seller profile

4. **Orders** (Through Order Items)

   - Products referenced in order line items
   - Collection: `order_items`
   - Relationship: `order_items.productId → products.id`
   - Use: Sales tracking, inventory management

5. **Reviews** (One-to-Many)

   - Multiple reviews per product
   - Collection: `reviews`
   - Relationship: `reviews.productId → products.id`
   - Use: Ratings, social proof, product feedback

6. **Cart Items** (Many-to-Many through carts)

   - Products can be in multiple carts
   - Collection: `cart_items`
   - Relationship: `cart_items.productId → products.id`
   - Use: Shopping cart functionality

7. **Favorites/Wishlist** (Many-to-Many)

   - Users can favorite multiple products
   - Collection: `favorites`
   - Relationship: `favorites.productId → products.id`
   - Use: Wishlist feature

8. **Auctions** (One-to-One, Optional)
   - Product can have an associated auction
   - Collection: `auctions`
   - Relationship: `auctions.productId → products.id`
   - Use: Auction-based selling

### Indirect Relationships

- **Media Files** → Stored in Firebase Storage, URLs referenced in `images[]` and `videos[]`
- **Analytics** → `product_views` collection tracks view events
- **Search History** → `search_history` may reference products
- **Coupons** → Can be restricted to specific products

---

## Filters & Search

### Filter Configuration

**Location**: `src/constants/filters.ts → PRODUCT_FILTERS`

```typescript
export const PRODUCT_FILTERS: FilterSection[] = [
  {
    title: "Price Range",
    fields: [
      {
        key: "price",
        label: "Price",
        type: "range",
        min: 0,
        max: 1000000,
        step: 100,
      },
    ],
  },
  {
    title: "Categories",
    fields: [
      {
        key: "category_id",
        label: "Category",
        type: "multiselect",
        options: [], // Loaded dynamically from categories API
      },
    ],
    collapsible: true,
  },
  {
    title: "Availability",
    fields: [
      {
        key: "in_stock",
        label: "In Stock Only",
        type: "checkbox",
        options: [{ label: "Show only in-stock products", value: "true" }],
      },
      {
        key: "condition",
        label: "Condition",
        type: "radio",
        options: [
          { label: "New", value: "new" },
          { label: "Used - Like New", value: "like_new" },
          { label: "Used - Good", value: "good" },
          { label: "Used - Fair", value: "fair" },
        ],
      },
    ],
  },
  {
    title: "Product Features",
    fields: [
      {
        key: "is_returnable",
        label: "Returnable",
        type: "checkbox",
        options: [{ label: "Returnable products only", value: "true" }],
      },
      {
        key: "is_featured",
        label: "Featured",
        type: "checkbox",
        options: [{ label: "Featured products only", value: "true" }],
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
];
```

### Available Filter Types

| Filter Type     | Field Type                                 | Use Case            | Example              |
| --------------- | ------------------------------------------ | ------------------- | -------------------- |
| **range**       | `price`                                    | Price range slider  | ₹0 - ₹100,000        |
| **multiselect** | `category_id`                              | Multiple categories | Electronics, Fashion |
| **checkbox**    | `in_stock`, `is_returnable`, `is_featured` | Boolean flags       | ✓ In stock only      |
| **radio**       | `condition`                                | Single choice       | New / Used           |
| **text**        | `search`                                   | Keyword search      | "iPhone 15"          |
| **select**      | `sort`                                     | Sort order          | Price: Low to High   |

### Search Implementation

**API Endpoint**: `GET /api/products`

**Searchable Fields**:

- `name` - Product name (full text)
- `description` - Product description
- `tags` - Search tags array
- `sku` - Product SKU
- `brand` - Brand name

**Query Parameters**:

```typescript
{
  search?: string,          // Text search across name, description, tags
  category?: string,        // Filter by category ID
  min_price?: number,       // Minimum price
  max_price?: number,       // Maximum price
  in_stock?: boolean,       // Only in-stock products
  condition?: string,       // Product condition
  is_featured?: boolean,    // Featured products
  is_returnable?: boolean,  // Returnable products
  seller_id?: string,       // Filter by seller
  shop_id?: string,         // Filter by shop
  status?: string,          // Product status (admin/seller only)
  sort?: string,            // Sort order
  page?: number,            // Pagination page
  limit?: number            // Items per page
}
```

**Sort Options**:

- `created_at_desc` - Newest first (default)
- `created_at_asc` - Oldest first
- `price_asc` - Price: Low to High
- `price_desc` - Price: High to Low
- `name_asc` - Name: A to Z
- `name_desc` - Name: Z to A
- `rating_desc` - Highest rated
- `sales_desc` - Best selling

---

## Inline Logic & Quick Create

### Inline Edit Component

**Location**: Uses `InlineEditRow` from `src/components/common/inline-edit.ts`

**Fields Configuration**:

```typescript
const productInlineFields: InlineField[] = [
  { key: "name", type: "text", label: "Name", required: true },
  { key: "price", type: "number", label: "Price (₹)", min: 0, required: true },
  { key: "quantity", type: "number", label: "Stock", min: 0, required: true },
  { key: "sku", type: "text", label: "SKU", required: true },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ],
  },
  { key: "featured", type: "checkbox", label: "Featured" },
  { key: "image", type: "image", label: "Image", placeholder: "product" },
];
```

### Quick Create Row

**Usage**: At top of products table

```typescript
<QuickCreateRow
  fields={productInlineFields}
  onSave={handleQuickCreate}
  loading={creating}
/>
```

**Behavior**:

- Shows inline form at top of table
- Enter to save, Escape to cancel
- Validates required fields
- Auto-generates slug from name
- Uploads image to Firebase Storage
- Creates product with status="draft"

### Double-Click Inline Edit

**Usage**: In table rows

```typescript
{
  products.map((product) =>
    editingId === product.id ? (
      <InlineEditRow
        fields={productInlineFields}
        initialValues={product}
        onSave={(data) => handleSave(product.id, data)}
        onCancel={() => setEditingId(null)}
      />
    ) : (
      <tr onDoubleClick={() => setEditingId(product.id)}>
        {/* Display cells */}
      </tr>
    )
  );
}
```

---

## Wizards & Forms

### Full Product Creation Wizard

**Location**: `/seller/products/create`, `/admin/products/create`

**Multi-Step Process**:

#### Step 1: Basic Information

```typescript
{
  name: string,           // Product name
  slug: string,           // Auto-generated, editable
  description: string,    // Full description (rich text)
  shortDescription: string, // Brief summary
  category: string,       // Category selector (hierarchical)
  brand?: string,         // Optional brand
  tags: string[]          // Tag input
}
```

#### Step 2: Pricing & Inventory

```typescript
{
  price: number,          // Selling price
  compareAtPrice?: number, // Original price (for discounts)
  costPrice?: number,     // Cost per item (seller only)
  sku: string,            // Stock keeping unit
  barcode?: string,       // Optional barcode
  quantity: number,       // Initial stock
  lowStockThreshold: number, // Alert threshold
  trackQuantity: boolean  // Enable stock tracking
}
```

#### Step 3: Product Details

```typescript
{
  condition: 'new' | 'used' | 'refurbished',
  manufacturer?: string,
  countryOfOrigin: string,
  weight?: number,
  weightUnit?: 'kg' | 'g' | 'lb',
  dimensions?: {
    length: number,
    width: number,
    height: number,
    unit: 'cm' | 'inch'
  },
  specifications: Record<string, string>, // Key-value pairs
  features: string[]      // Feature list
}
```

#### Step 4: Media Upload

```typescript
{
  images: File[],         // Upload 1-10 images
  videos?: File[]         // Upload 0-5 videos (optional)
}
```

**Uses**: `useMediaUploadWithCleanup` hook for automatic cleanup on cancel/error

#### Step 5: Shipping & Policies

```typescript
{
  shippingClass: 'standard' | 'express' | 'heavy' | 'fragile',
  requiresShipping: boolean,
  isReturnable: boolean,
  returnWindowDays: number,
  warranty?: string
}
```

#### Step 6: SEO & Visibility

```typescript
{
  seo: {
    title: string,
    description: string,
    keywords: string[],
    focusKeyword?: string
  },
  isFeatured: boolean,
  showOnHomepage: boolean,
  status: 'draft' | 'active',
  publishDate?: Date      // Schedule publish
}
```

### Form Validation

**Validation Schema**: `src/lib/validations/comprehensive-schemas.ts → createProductSchema`

**Key Validations**:

- Name: 2-200 characters
- Description: 10-5000 characters
- Price: Positive number, max 10,000,000
- Quantity: Non-negative integer, max 100,000
- SKU: Required, max 100 characters
- Images: 1-10 required, valid URLs
- Tags: Max 20 items
- Rating: 0-5 (auto-calculated, read-only)

---

## Card Displays

### For Sellers (Seller Dashboard)

**Component**: `src/components/seller/ProductCard.tsx`

```typescript
<ProductCard
  product={product}
  showActions={true}
  onEdit={() => router.push(`/seller/products/${product.id}/edit`)}
  onDelete={() => handleDelete(product.id)}
  onDuplicate={() => handleDuplicate(product.id)}
  onToggleStatus={() => handleToggleStatus(product.id)}
/>
```

**Displays**:

- Product image (first from images array)
- Product name
- SKU
- Price (₹ formatted)
- Stock quantity with color coding:
  - Green: `quantity > lowStockThreshold`
  - Orange: `quantity <= lowStockThreshold && quantity > 0`
  - Red: `quantity === 0`
- Status badge (Draft/Active/Archived)
- Featured star if `isFeatured === true`
- Quick actions: Edit, Duplicate, Delete, Toggle Status

### For Admin (Admin Panel)

**Component**: `src/components/admin/ProductCard.tsx`

```typescript
<ProductCard
  product={product}
  showSeller={true}
  showShop={true}
  showStats={true}
  onEdit={() => router.push(`/admin/products/${product.id}/edit`)}
  onDelete={() => handleDelete(product.id)}
  onViewShop={() => router.push(`/admin/shops/${product.shopId}`)}
/>
```

**Additional Info (vs Seller Card)**:

- Seller name and shop name
- Total views, sales, revenue
- Creation date
- Last updated date
- More actions: Ban, Feature, Archive

### For Buyers (Public Pages)

**Component**: `src/components/product/ProductCard.tsx`

```typescript
<ProductCard
  product={product}
  onAddToCart={() => handleAddToCart(product.id)}
  onAddToWishlist={() => handleAddToWishlist(product.id)}
  onClick={() => router.push(`/products/${product.slug}`)}
/>
```

**Displays**:

- Product image with hover zoom
- Product name (truncated)
- Price with discount percentage if `compareAtPrice` exists
- Rating stars (⭐) with review count
- "In Stock" or "Out of Stock" badge
- Add to Cart button
- Wishlist heart icon (toggle)
- "Featured" ribbon if `isFeatured`
- Quick view icon (hover)

**Responsive**:

- Grid: 2 columns mobile, 3 tablet, 4-5 desktop
- Card height: Fixed aspect ratio
- Image: Lazy loaded, responsive srcset

---

## Bulk Actions

**Location**: `src/constants/bulk-actions.ts → getProductBulkActions()`

```typescript
export function getProductBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "publish",
      label: "Publish",
      icon: Eye,
      variant: "success",
      confirm: true,
      confirmTitle: "Publish Products",
      confirmMessage: `Are you sure you want to publish ${selectedCount} product(s)? They will become visible to buyers.`,
    },
    {
      id: "unpublish",
      label: "Unpublish",
      icon: EyeOff,
      variant: "warning",
      confirm: true,
      confirmTitle: "Unpublish Products",
      confirmMessage: `Are you sure you want to unpublish ${selectedCount} product(s)? They will be hidden from buyers.`,
    },
    {
      id: "feature",
      label: "Feature",
      icon: Star,
      variant: "default",
      confirm: false,
    },
    {
      id: "unfeature",
      label: "Remove Feature",
      icon: StarOff,
      variant: "default",
      confirm: false,
    },
    {
      id: "archive",
      label: "Archive",
      icon: Archive,
      variant: "warning",
      confirm: true,
      confirmTitle: "Archive Products",
      confirmMessage: `Are you sure you want to archive ${selectedCount} product(s)? Archived products can be restored later.`,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      confirm: true,
      confirmTitle: "Delete Products",
      confirmMessage: `⚠️ This action cannot be undone. Are you sure you want to permanently delete ${selectedCount} product(s)?`,
    },
    {
      id: "duplicate",
      label: "Duplicate",
      icon: Copy,
      variant: "default",
      confirm: false,
    },
    {
      id: "export",
      label: "Export",
      icon: Download,
      variant: "default",
      confirm: false,
    },
  ];
}
```

### Bulk Action Handlers

```typescript
const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
  switch (actionId) {
    case "publish":
      await productsService.bulkUpdate(selectedIds, { status: "active" });
      break;
    case "unpublish":
      await productsService.bulkUpdate(selectedIds, { status: "draft" });
      break;
    case "feature":
      await productsService.bulkUpdate(selectedIds, { isFeatured: true });
      break;
    case "unfeature":
      await productsService.bulkUpdate(selectedIds, { isFeatured: false });
      break;
    case "archive":
      await productsService.bulkUpdate(selectedIds, { status: "archived" });
      break;
    case "delete":
      await productsService.bulkDelete(selectedIds);
      break;
    case "duplicate":
      await productsService.bulkDuplicate(selectedIds);
      break;
    case "export":
      await productsService.exportToCSV(selectedIds);
      break;
  }
};
```

---

## Diagrams

### Product Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCT LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

CREATION FLOW:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Seller  │───▶│  Wizard  │───▶│ Firebase │───▶│  Active  │
│  Creates │    │ 6 Steps  │    │ Storage  │    │ Listing  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │
                     ├─ Step 1: Basic Info
                     ├─ Step 2: Pricing
                     ├─ Step 3: Details
                     ├─ Step 4: Media (with cleanup hook)
                     ├─ Step 5: Shipping
                     └─ Step 6: SEO & Visibility

BUYER DISCOVERY FLOW:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Search  │───▶│  Filter  │───▶│ Product  │───▶│   Cart   │
│ /Browse  │    │  Apply   │    │   Card   │    │  Checkout│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      │
                                      ├─ View Details
                                      ├─ Add to Wishlist
                                      └─ Quick View

ORDER FLOW:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Cart   │───▶│ Checkout │───▶│  Payment │───▶│  Order   │
│   Item   │    │   Page   │    │ Gateway  │    │ Created  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                       │
                                                       ▼
                                             ┌──────────────────┐
                                             │ Update Inventory │
                                             │ stockCount -= qty│
                                             └──────────────────┘

REVIEW FLOW:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Delivered│───▶│  Review  │───▶│  Approve │───▶│  Update  │
│  Order   │    │   Form   │    │  (Admin) │    │  Rating  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                       │
                                                       ▼
                                             ┌──────────────────┐
                                             │  Auto-calculate  │
                                             │  avg rating &    │
                                             │  reviewCount     │
                                             └──────────────────┘
```

### Product Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                      │
└─────────────────────────────────────────────────────────────┘

              ┌──────────────┐
              │   CATEGORY   │
              │  (One-to-   │
              │   Many)      │
              └──────┬───────┘
                     │ categoryId
                     ▼
┌──────────────┐  ┌────────────────┐  ┌──────────────┐
│     SHOP     │──│    PRODUCT     │──│     USER     │
│  (One-to-   │  │   (Core Entity)│  │  (Seller)    │
│   Many)      │  └────────┬───────┘  │  (One-to-   │
└──────────────┘           │          │   Many)      │
    shopId                 │          └──────────────┘
                           │ sellerId
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   REVIEWS    │  │ ORDER_ITEMS  │  │  FAVORITES   │
│  (One-to-   │  │  (Many-to-   │  │  (Many-to-   │
│   Many)      │  │   Many)      │  │   Many)      │
└──────────────┘  └──────────────┘  └──────────────┘
  productId         productId         productId
        │                  │                  │
        ▼                  ▼                  ▼
  Auto-update        Update stock      Wishlist
  rating & count     on order          feature
```

### Product Status State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                    STATUS TRANSITIONS                        │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────┐
                    │  DRAFT  │
                    │ (Start) │
                    └────┬────┘
                         │ publish()
                         ▼
                    ┌─────────┐
              ┌────▶│  ACTIVE │────┐
              │     │(Visible)│    │
              │     └────┬────┘    │
              │          │         │
    unarchive()│          │         │ archive()
              │          │out of   │
              │          │stock    │
              │          ▼         ▼
         ┌────┴─────┐  ┌──────────────┐
         │ ARCHIVED │  │ OUT-OF-STOCK │
         │ (Hidden) │  │   (Hidden)   │
         └──────────┘  └──────────────┘
              │                │
              │ delete()       │ restock()
              ▼                ▼
         ┌─────────┐      ┌─────────┐
         │ DELETED │      │  ACTIVE │
         │ (Soft)  │      └─────────┘
         └─────────┘

ALLOWED TRANSITIONS:
- Draft → Active (publish)
- Active → Draft (unpublish)
- Active → Archived (archive)
- Active → Out-of-Stock (auto when qty=0)
- Archived → Active (unarchive)
- Out-of-Stock → Active (auto when qty>0)
- Any → Deleted (soft delete, admin only)
```

---

## Why We Need This

### Business Requirements

1. **Multi-vendor Marketplace**

   - Platform supports multiple sellers
   - Each seller manages their own inventory
   - Products belong to specific shops/sellers

2. **Inventory Management**

   - Track stock quantities in real-time
   - Alert sellers when stock is low
   - Prevent overselling with quantity tracking

3. **Discoverability**

   - Buyers need to search and filter products
   - SEO optimization for search engines
   - Featured products for marketing

4. **Trust & Transparency**

   - Product ratings and reviews
   - Detailed product information
   - Clear return policies

5. **Sales Analytics**
   - Track views, sales, revenue per product
   - Identify best-selling items
   - Optimize pricing and inventory

### Technical Requirements

1. **Performance**

   - Fast product listing queries
   - Efficient filtering and search
   - Image optimization and CDN

2. **Scalability**

   - Support thousands of products
   - Handle concurrent updates
   - Firestore indexes for complex queries

3. **Data Integrity**

   - Prevent negative inventory
   - Validate price ranges
   - Ensure required fields are present

4. **User Experience**
   - Quick product creation for sellers
   - Inline editing for efficiency
   - Responsive product cards
   - Fast search and filtering

---

## Quick Reference

### API Routes

| Endpoint                    | Method | Purpose                   | Auth         |
| --------------------------- | ------ | ------------------------- | ------------ |
| `/api/products`             | GET    | List all active products  | Public       |
| `/api/products`             | POST   | Create product            | Seller/Admin |
| `/api/products/[id]`        | GET    | Get product by ID         | Public       |
| `/api/products/[id]`        | PATCH  | Update product            | Seller/Admin |
| `/api/products/[id]`        | DELETE | Delete product            | Seller/Admin |
| `/api/products/slug/[slug]` | GET    | Get by slug               | Public       |
| `/api/seller/products`      | GET    | List seller's products    | Seller       |
| `/api/admin/products`       | GET    | List all products (admin) | Admin        |
| `/api/admin/products/bulk`  | POST   | Bulk update products      | Admin        |

### Service Methods

```typescript
// products.service.ts
productService.getProducts(filters); // List with filters
productService.getProduct(id); // Get by ID
productService.getProductBySlug(slug); // Get by slug
productService.createProduct(data); // Create new
productService.updateProduct(id, data); // Update existing
productService.deleteProduct(id); // Delete
productService.bulkUpdate(ids, updates); // Bulk update
productService.bulkDelete(ids); // Bulk delete
productService.exportToCSV(ids); // Export selected
```

### Common Queries

```typescript
// Get active products in category
const products = await productService.getProducts({
  category: "electronics",
  status: "active",
  in_stock: true,
});

// Get featured products for homepage
const featured = await productService.getProducts({
  is_featured: true,
  status: "active",
  limit: 8,
});

// Get seller's low stock products
const lowStock = await productService
  .getProducts({
    seller_id: sellerId,
    status: "active",
  })
  .then((products) =>
    products.filter((p) => p.quantity <= p.lowStockThreshold)
  );

// Search products
const results = await productService.getProducts({
  search: "iPhone",
  sort: "price_asc",
  page: 1,
  limit: 20,
});
```

### Firestore Indexes Required

```json
{
  "collectionGroup": "products",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "price", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "products",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "sellerId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "products",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "isFeatured", "order": "DESCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

**Last Updated**: November 10, 2025  
**Version**: 1.0  
**Related Docs**:

- [Categories Resource](./categories.md)
- [Shops Resource](./shops.md)
- [Orders Resource](./orders.md)
- [Reviews Resource](./reviews.md)
