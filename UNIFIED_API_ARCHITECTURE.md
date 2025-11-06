# Unified API Architecture

## Overview

This document describes the unified API architecture where endpoints behave differently based on the authenticated user's role. This approach reduces code duplication, simplifies maintenance, and provides a consistent API surface.

---

## Core Principles

### 1. Role-Based Access Control (RBAC)
- Every API endpoint checks the user's role and applies appropriate filters
- Roles: `guest`, `user`, `seller`, `admin`
- Access levels cascade: admin > seller > user > guest

### 2. Resource Ownership
- Users can only access/modify resources they own (unless admin)
- Ownership is determined by `userId`, `shopId`, etc.
- Admins bypass ownership restrictions

### 3. Data Filtering
- Same endpoint returns different data based on role
- Guests: public data only
- Users: public + their own data
- Sellers: public + their shop's data
- Admins: all data

### 4. HTTP Methods & Permissions
- `GET`: Read access (filtered by role)
- `POST`: Create access (role-dependent)
- `PATCH`: Update access (owner or admin)
- `DELETE`: Delete access (owner or admin)

---

## API Endpoints

### 1. Shops API

#### `GET /api/shops`
**List shops with role-based filtering**

**Access:**
- **Guest/User**: Public shops only (verified, not banned)
- **Seller**: Own shops + public shops
- **Admin**: All shops (with filters for verified, banned, etc.)

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  homepage?: boolean;
  verified?: boolean; // admin only
  banned?: boolean;   // admin only
  status?: 'pending' | 'verified' | 'banned'; // admin only
  sortBy?: 'name' | 'createdAt' | 'revenue' | 'products';
  order?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    shops: Shop[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

#### `POST /api/shops`
**Create a new shop**

**Access:**
- **Seller**: Create 1 shop (check limit)
- **Admin**: Create unlimited shops

**Request Body:**
```typescript
{
  name: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  address: Address;
  contact: ContactInfo;
  categories: string[]; // category IDs
  settings?: ShopSettings;
}
```

**Logic:**
- Check if user already has a shop (unless admin)
- Auto-set `ownerId` from authenticated user
- Auto-set status to `pending` (unless admin sets otherwise)

---

#### `GET /api/shops/[id]`
**Get shop details**

**Access:**
- **Guest/User**: Public shops only (verified, not banned)
- **Seller**: Own shops + public shops (with extended details for own)
- **Admin**: Any shop with full details

**Response:**
```typescript
{
  success: boolean;
  data: {
    shop: Shop;
    stats?: ShopStats; // Only for owner/admin
    settings?: ShopSettings; // Only for owner/admin
  };
}
```

#### `PATCH /api/shops/[id]`
**Update shop**

**Access:**
- **Shop Owner**: Update own shop (limited fields)
- **Admin**: Update any shop (all fields)

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  address?: Address;
  contact?: ContactInfo;
  categories?: string[];
  settings?: ShopSettings; // owner only
  verified?: boolean;      // admin only
  banned?: boolean;        // admin only
  featured?: boolean;      // admin only
  homepage?: boolean;      // admin only
}
```

#### `DELETE /api/shops/[id]`
**Delete shop**

**Access:**
- **Shop Owner**: Soft delete (set status to 'deleted')
- **Admin**: Hard delete option

---

#### `PATCH /api/shops/[id]/verify`
**Verify shop**

**Access:** Admin only

**Request Body:**
```typescript
{
  verified: boolean;
  reason?: string;
}
```

---

#### `PATCH /api/shops/[id]/ban`
**Ban/Unban shop**

**Access:** Admin only

**Request Body:**
```typescript
{
  banned: boolean;
  reason: string;
  duration?: number; // days, null for permanent
}
```

---

#### `PATCH /api/shops/[id]/feature`
**Set featured/homepage flags**

**Access:** Admin only

**Request Body:**
```typescript
{
  featured?: boolean;
  homepage?: boolean;
  priority?: number; // Display order
}
```

---

#### `GET /api/shops/[id]/payments`
**Get shop payment details**

**Access:**
- **Shop Owner**: Own shop payments
- **Admin**: Any shop payments

**Response:**
```typescript
{
  success: boolean;
  data: {
    totalRevenue: number;
    paidOut: number;
    pending: number;
    dues: number;
    payouts: Payout[];
  };
}
```

#### `POST /api/shops/[id]/payments`
**Process payment to shop owner**

**Access:** Admin only

---

### 2. Products API

#### `GET /api/products`
**List products with role-based filtering**

**Access:**
- **Guest/User**: Published products from verified shops
- **Seller**: Own products + published from others
- **Admin**: All products with any status

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  shopId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: 'draft' | 'published' | 'archived'; // seller/admin
  featured?: boolean;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'sales';
  order?: 'asc' | 'desc';
}
```

#### `POST /api/products`
**Create product**

**Access:**
- **Seller**: Create in own shop
- **Admin**: Create in any shop

**Request Body:**
```typescript
{
  shopId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string; // Must be leaf category
  images: string[];
  mainImage: string;
  inventory?: {
    sku?: string;
    quantity: number;
    trackInventory: boolean;
  };
  seo?: SEOData;
  condition?: 'new' | 'used' | 'refurbished';
  returnable?: boolean;
  returnDays?: number;
  publishDate?: Date;
  status?: 'draft' | 'published';
}
```

---

#### `GET /api/products/[id]`
**Get product details**

**Access:**
- **Guest/User**: Published products only
- **Seller**: Own products (any status) + published from others
- **Admin**: Any product

---

#### `PATCH /api/products/[id]`
**Update product**

**Access:**
- **Product Owner (via shop)**: Own product
- **Admin**: Any product

---

#### `DELETE /api/products/[id]`
**Delete product**

**Access:**
- **Product Owner**: Soft delete (archive)
- **Admin**: Hard delete option

---

### 3. Categories API

#### `GET /api/categories`
**List categories**

**Access:** Public

**Query Parameters:**
```typescript
{
  tree?: boolean; // Return tree structure
  leavesOnly?: boolean; // Only leaf categories
  featured?: boolean;
  homepage?: boolean;
  parentId?: string; // Get children of parent
}
```

---

#### `POST /api/categories`
**Create category**

**Access:** Admin only

**Request Body:**
```typescript
{
  name: string;
  slug: string;
  description?: string;
  parentId?: string; // null for root category
  image?: string;
  icon?: string;
  featured?: boolean;
  homepage?: boolean;
  seo?: SEOData;
}
```

---

#### `GET /api/categories/tree`
**Get full category tree**

**Access:** Public

**Response:**
```typescript
{
  success: boolean;
  data: {
    categories: CategoryNode[];
  };
}

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children: CategoryNode[];
  productCount: number;
  isLeaf: boolean;
}
```

---

#### `GET /api/categories/leaves`
**Get only leaf categories (for product creation)**

**Access:** Public

---

#### `PATCH /api/categories/[id]`
**Update category**

**Access:** Admin only

---

#### `DELETE /api/categories/[id]`
**Delete category**

**Access:** Admin only

**Logic:**
- Check if category has products (prevent deletion if has products)
- Check if category has children (prevent deletion if has children)
- Or provide option to reassign products/move children

---

### 4. Orders API

#### `GET /api/orders`
**List orders**

**Access:**
- **User**: Own orders
- **Seller**: Orders for own shops
- **Admin**: All orders

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  status?: OrderStatus;
  shopId?: string; // Filter by shop
  userId?: string; // Admin only
  startDate?: Date;
  endDate?: Date;
  search?: string; // Order number, customer name
}
```

---

#### `POST /api/orders`
**Create order (checkout)**

**Access:** Authenticated users

**Request Body:**
```typescript
{
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  couponCode?: string;
  paymentMethod: string;
  notes?: string;
}
```

---

#### `GET /api/orders/[id]`
**Get order details**

**Access:**
- **Customer**: Own order
- **Seller**: Order from own shop
- **Admin**: Any order

---

#### `PATCH /api/orders/[id]`
**Update order status**

**Access:**
- **Seller**: Update orders from own shop (limited status transitions)
- **Admin**: Update any order (all status transitions)

**Request Body:**
```typescript
{
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
}
```

---

#### `POST /api/orders/[id]/shipment`
**Create shipment**

**Access:**
- **Seller**: For own shop orders
- **Admin**: For any order

**Request Body:**
```typescript
{
  method: 'shiprocket' | 'manual';
  carrier?: string; // For manual
  trackingNumber?: string; // For manual
  weight?: number; // For shiprocket
  dimensions?: Dimensions; // For shiprocket
}
```

---

### 5. Returns API

#### `GET /api/returns`
**List returns**

**Access:**
- **User**: Own returns
- **Seller**: Returns for own shop orders
- **Admin**: All returns (with intervention flag filter)

**Query Parameters:**
```typescript
{
  status?: ReturnStatus;
  requiresIntervention?: boolean; // Admin filter
  shopId?: string;
}
```

---

#### `POST /api/returns`
**Initiate return request**

**Access:** Authenticated users (for their orders)

**Request Body:**
```typescript
{
  orderId: string;
  items: ReturnItem[];
  reason: string;
  description: string;
  media: string[]; // Photos/videos
}
```

---

#### `GET /api/returns/[id]`
**Get return details**

**Access:**
- **Customer**: Own return
- **Seller**: Return for own shop order
- **Admin**: Any return

---

#### `POST /api/returns/[id]/approve`
**Approve/reject return**

**Access:**
- **Seller**: For own shop returns
- **Admin**: Any return

**Request Body:**
```typescript
{
  approved: boolean;
  reason?: string;
  refundAmount?: number; // Can be partial
  restockItems?: boolean;
}
```

---

#### `POST /api/returns/[id]/refund`
**Process refund**

**Access:**
- **Seller**: For own shop returns
- **Admin**: Any return

**Request Body:**
```typescript
{
  amount: number;
  method: 'original' | 'wallet' | 'bank';
  notes?: string;
}
```

---

#### `POST /api/returns/[id]/resolve`
**Resolve dispute (admin intervention)**

**Access:** Admin only

**Request Body:**
```typescript
{
  resolution: string;
  refundAmount: number;
  penalizeSeller?: boolean;
  penaltyAmount?: number;
  notes: string;
}
```

---

### 6. Coupons API

#### `GET /api/coupons`
**List coupons**

**Access:**
- **Guest/User**: Active public coupons
- **Seller**: Own shop coupons (all statuses)
- **Admin**: All coupons

**Query Parameters:**
```typescript
{
  shopId?: string;
  status?: 'active' | 'inactive' | 'expired';
  code?: string; // Validate coupon
}
```

---

#### `POST /api/coupons`
**Create coupon**

**Access:**
- **Seller**: For own shop
- **Admin**: For any shop

**Request Body:**
```typescript
{
  shopId: string;
  code: string;
  type: 'percentage' | 'flat' | 'bogo' | 'tiered';
  value: number | TieredDiscount[];
  minOrderValue?: number;
  maxDiscount?: number; // For percentage
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  perUserLimit?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
}
```

---

#### `GET /api/coupons/[id]`
**Get coupon details**

**Access:**
- **Guest/User**: Active coupons only
- **Seller**: Own shop coupons
- **Admin**: Any coupon

---

#### `PATCH /api/coupons/[id]`
**Update coupon**

**Access:**
- **Coupon Owner (via shop)**: Own coupon
- **Admin**: Any coupon

---

#### `DELETE /api/coupons/[id]`
**Delete coupon**

**Access:**
- **Coupon Owner**: Own coupon (soft delete)
- **Admin**: Any coupon

---

### 7. Reviews API

#### `GET /api/reviews`
**List reviews**

**Access:** Public (approved reviews only)

**Query Parameters:**
```typescript
{
  shopId?: string;
  productId?: string;
  userId?: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'rejected'; // owner/admin
}
```

---

#### `POST /api/reviews`
**Create review**

**Access:** Authenticated users (who purchased the product)

**Request Body:**
```typescript
{
  productId: string;
  orderId: string; // Verify purchase
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  videos?: string[];
}
```

---

#### `PATCH /api/reviews/[id]`
**Update review (moderate)**

**Access:**
- **Review Author**: Update own review (limited time)
- **Shop Owner**: Approve/reject reviews for own products
- **Admin**: Moderate any review

---

### 8. Users API

#### `GET /api/users`
**List users**

**Access:** Admin only

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: 'active' | 'banned' | 'suspended';
}
```

---

#### `GET /api/users/[id]`
**Get user details**

**Access:**
- **User**: Own profile
- **Admin**: Any user

---

#### `PATCH /api/users/[id]`
**Update user**

**Access:**
- **User**: Update own profile (limited fields)
- **Admin**: Update any user (all fields)

---

#### `PATCH /api/users/[id]/ban`
**Ban/unban user**

**Access:** Admin only

**Request Body:**
```typescript
{
  banned: boolean;
  reason: string;
  duration?: number; // days
}
```

---

#### `PATCH /api/users/[id]/role`
**Change user role**

**Access:** Admin only

**Request Body:**
```typescript
{
  role: 'user' | 'seller' | 'admin';
  reason?: string;
}
```

---

### 9. Analytics API

#### `GET /api/analytics`
**Get analytics data**

**Access:**
- **Seller**: Own shops analytics
- **Admin**: Platform-wide analytics

**Query Parameters:**
```typescript
{
  shopId?: string;
  startDate?: Date;
  endDate?: Date;
  metrics?: string[]; // revenue, orders, products, users
  groupBy?: 'day' | 'week' | 'month';
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    overview: {
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
      conversionRate: number;
    };
    timeSeries: TimeSeriesData[];
    topProducts: ProductStats[];
    topShops?: ShopStats[]; // Admin only
  };
}
```

---

### 10. Revenue & Payouts API

#### `GET /api/revenue`
**Get revenue data**

**Access:**
- **Seller**: Own shops revenue
- **Admin**: All revenue with breakdown

**Query Parameters:**
```typescript
{
  shopId?: string;
  startDate?: Date;
  endDate?: Date;
}
```

---

#### `GET /api/payouts`
**List payouts**

**Access:**
- **Seller**: Own payouts
- **Admin**: All payouts

---

#### `POST /api/payouts`
**Request payout**

**Access:** Seller only

**Request Body:**
```typescript
{
  shopId: string;
  amount: number;
  method: 'upi' | 'bank';
  upiId?: string;
  bankDetails?: BankDetails;
}
```

---

#### `PATCH /api/payouts/[id]`
**Approve/reject payout**

**Access:** Admin only

**Request Body:**
```typescript
{
  status: 'approved' | 'rejected' | 'processing' | 'completed';
  transactionId?: string;
  notes?: string;
}
```

---

### 11. Media API

#### `POST /api/media/upload`
**Upload media files**

**Access:** Authenticated users

**Request (multipart/form-data):**
```typescript
{
  files: File[];
  type: 'product' | 'shop' | 'review' | 'return';
  metadata?: MediaMetadata[];
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    uploadedFiles: {
      id: string;
      url: string;
      thumbnailUrl?: string;
      metadata: MediaMetadata;
    }[];
  };
}
```

---

#### `DELETE /api/media/[id]`
**Delete media**

**Access:**
- **Owner**: Delete own media
- **Admin**: Delete any media

---

#### `PATCH /api/media/[id]/metadata`
**Update media metadata**

**Access:** Owner or Admin

---

## Middleware Stack

### 1. Authentication Middleware (`auth.ts`)
```typescript
export async function authMiddleware(req: NextRequest) {
  const session = await getSession(req);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  req.user = session.user;
  return NextResponse.next();
}
```

### 2. RBAC Middleware (`rbac.ts`)
```typescript
export function requireRole(allowedRoles: UserRole[]) {
  return async (req: NextRequest) => {
    const user = req.user;
    
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}
```

### 3. Ownership Middleware (`ownership.ts`)
```typescript
export async function verifyOwnership(
  req: NextRequest,
  resourceType: 'shop' | 'product' | 'order',
  resourceId: string
) {
  const user = req.user;
  
  // Admin bypass
  if (user.role === 'admin') {
    return NextResponse.next();
  }
  
  // Check ownership based on resource type
  const isOwner = await checkOwnership(user.id, resourceType, resourceId);
  
  if (!isOwner) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}
```

---

## Implementation Example

### Unified Shop API Route

```typescript
// /src/app/api/shops/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/api/middleware/auth';
import { getShops, createShop } from '@/lib/db/shops';

export async function GET(req: NextRequest) {
  try {
    // Optional auth (works for guests too)
    const user = await getOptionalUser(req);
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build query based on role
    let query: any = {};
    
    if (!user || user.role === 'user') {
      // Public shops only
      query = { verified: true, banned: false };
    } else if (user.role === 'seller') {
      // Own shops + public shops
      query = {
        $or: [
          { ownerId: user.id },
          { verified: true, banned: false }
        ]
      };
    } else if (user.role === 'admin') {
      // All shops (with optional filters)
      if (searchParams.has('verified')) {
        query.verified = searchParams.get('verified') === 'true';
      }
      if (searchParams.has('banned')) {
        query.banned = searchParams.get('banned') === 'true';
      }
    }
    
    // Add search filter
    if (searchParams.has('search')) {
      query.$text = { $search: searchParams.get('search') };
    }
    
    const result = await getShops(query, { page, limit });
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const authResult = await authMiddleware(req);
    if (authResult.status === 401) return authResult;
    
    const user = req.user;
    const body = await req.json();
    
    // Check shop creation limit
    if (user.role !== 'admin') {
      const existingShops = await getShops({ ownerId: user.id });
      if (existingShops.total >= 1) {
        return NextResponse.json(
          { success: false, error: 'Shop limit reached' },
          { status: 403 }
        );
      }
    }
    
    // Create shop
    const shop = await createShop({
      ...body,
      ownerId: user.id,
      status: user.role === 'admin' ? 'verified' : 'pending'
    });
    
    return NextResponse.json({
      success: true,
      data: { shop }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Benefits of Unified API

### 1. **Reduced Code Duplication**
- Single endpoint handles all roles
- Shared validation logic
- Consistent error handling

### 2. **Easier Maintenance**
- Changes in one place
- Less test surface area
- Easier to track changes

### 3. **Consistent API Surface**
- Predictable URL structure
- Same response format
- Easier for frontend consumption

### 4. **Better Security**
- Centralized authorization logic
- Easier to audit
- Less chance of permission leaks

### 5. **Scalability**
- Adding new roles is easier
- Query optimization in one place
- Easier to add caching

---

## Security Considerations

### 1. **Always Verify Ownership**
```typescript
// Before allowing modification
const shop = await getShop(id);
if (shop.ownerId !== user.id && user.role !== 'admin') {
  throw new Error('Unauthorized');
}
```

### 2. **Filter Sensitive Data**
```typescript
// Don't expose sensitive data to non-owners
if (user.role !== 'admin' && shop.ownerId !== user.id) {
  delete shop.bankDetails;
  delete shop.apiKeys;
}
```

### 3. **Validate Role Transitions**
```typescript
// Prevent privilege escalation
if (body.role === 'admin' && user.role !== 'admin') {
  throw new Error('Cannot assign admin role');
}
```

### 4. **Rate Limiting by Role**
```typescript
// Different rate limits for different roles
const rateLimit = {
  guest: 100,
  user: 1000,
  seller: 5000,
  admin: 10000
};
```

---

## Testing Strategy

### 1. **Role-Based Tests**
- Test each endpoint with each role
- Verify data filtering
- Verify permission enforcement

### 2. **Ownership Tests**
- Test owner access
- Test non-owner access
- Test admin bypass

### 3. **Integration Tests**
- Test complete workflows
- Test role transitions
- Test edge cases

---

## Migration from Separate APIs

If migrating from role-specific APIs (`/api/admin/*`, `/api/seller/*`):

1. **Add Route Aliases**
   ```typescript
   // Redirect old URLs to new unified endpoints
   export async function GET(req: NextRequest) {
     return NextResponse.redirect('/api/shops');
   }
   ```

2. **Update Frontend Gradually**
   - Update one feature at a time
   - Use feature flags
   - Monitor error rates

3. **Maintain Backwards Compatibility**
   - Keep old endpoints for a grace period
   - Add deprecation warnings
   - Document migration path

---

Last Updated: November 7, 2025
