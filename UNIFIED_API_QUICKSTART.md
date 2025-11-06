# Unified API Implementation Quick Start

## TL;DR

Instead of creating separate API routes for each role:
- ❌ `/api/admin/shops`
- ❌ `/api/seller/shops`
- ❌ `/api/public/shops`

Create ONE unified route:
- ✅ `/api/shops` (behaves differently based on authenticated user's role)

---

## Step-by-Step Implementation

### Step 1: Set Up Middleware

#### `/src/app/api/middleware/auth.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function getUser(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function getOptionalUser(req: NextRequest) {
  const session = await getSession(req);
  return session?.user || null;
}

export function requireAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      const user = await getUser(req);
      req.user = user;
      return handler(req, ...args);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
  };
}
```

#### `/src/app/api/middleware/rbac.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export type UserRole = 'guest' | 'user' | 'seller' | 'admin';

export function requireRole(allowedRoles: UserRole[]) {
  return (handler: Function) => {
    return async (req: NextRequest, ...args: any[]) => {
      const user = req.user;
      
      if (!user || !allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
      
      return handler(req, ...args);
    };
  };
}

export function hasRole(user: any, role: UserRole): boolean {
  const hierarchy = { guest: 0, user: 1, seller: 2, admin: 3 };
  return hierarchy[user?.role] >= hierarchy[role];
}
```

#### `/src/app/api/middleware/ownership.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function verifyShopOwnership(
  req: NextRequest,
  shopId: string
) {
  const user = req.user;
  
  // Admin bypass
  if (user.role === 'admin') {
    return true;
  }
  
  // Check ownership
  const shop = await getShop(shopId);
  if (shop.ownerId !== user.id) {
    throw new Error('Access denied');
  }
  
  return true;
}

export function requireOwnership(
  resourceGetter: (id: string) => Promise<any>,
  ownerField: string = 'ownerId'
) {
  return (handler: Function) => {
    return async (req: NextRequest, context: any) => {
      const user = req.user;
      const resourceId = context.params.id;
      
      // Admin bypass
      if (user.role === 'admin') {
        return handler(req, context);
      }
      
      // Check ownership
      const resource = await resourceGetter(resourceId);
      if (resource[ownerField] !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
      
      return handler(req, context);
    };
  };
}
```

---

### Step 2: Create Unified Route

#### `/src/app/api/shops/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOptionalUser, requireAuth } from '@/app/api/middleware/auth';
import { getShops, createShop, canCreateShop } from '@/lib/db/shops';

// GET /api/shops - List shops (behavior varies by role)
export async function GET(req: NextRequest) {
  try {
    const user = await getOptionalUser(req);
    const { searchParams } = new URL(req.url);
    
    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build role-based query
    const query = buildShopsQuery(user, searchParams);
    
    // Fetch shops
    const result = await getShops(query, { page, limit });
    
    // Filter sensitive data based on role
    result.shops = result.shops.map(shop => 
      filterShopData(shop, user)
    );
    
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

// POST /api/shops - Create shop (seller/admin only)
export const POST = requireAuth(async (req: NextRequest) => {
  try {
    const user = req.user;
    const body = await req.json();
    
    // Check if user can create shop
    if (!(await canCreateShop(user))) {
      return NextResponse.json(
        { success: false, error: 'Shop creation limit reached' },
        { status: 403 }
      );
    }
    
    // Validate request
    const validation = validateShopData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
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
});

// Helper: Build query based on user role
function buildShopsQuery(user: any, searchParams: URLSearchParams) {
  const query: any = {};
  
  // Role-based filtering
  if (!user || user.role === 'user') {
    // Guest/User: Only public shops
    query.verified = true;
    query.banned = false;
  } else if (user.role === 'seller') {
    // Seller: Own shops + public shops
    query.$or = [
      { ownerId: user.id },
      { verified: true, banned: false }
    ];
  } else if (user.role === 'admin') {
    // Admin: All shops (with optional filters)
    if (searchParams.has('verified')) {
      query.verified = searchParams.get('verified') === 'true';
    }
    if (searchParams.has('banned')) {
      query.banned = searchParams.get('banned') === 'true';
    }
    if (searchParams.has('status')) {
      query.status = searchParams.get('status');
    }
  }
  
  // Common filters (all roles)
  if (searchParams.has('search')) {
    query.$text = { $search: searchParams.get('search') };
  }
  
  if (searchParams.has('featured')) {
    query.featured = searchParams.get('featured') === 'true';
  }
  
  return query;
}

// Helper: Filter sensitive data based on role
function filterShopData(shop: any, user: any) {
  // Public data for all
  const publicData = {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    description: shop.description,
    logo: shop.logo,
    banner: shop.banner,
    rating: shop.rating,
    reviewCount: shop.reviewCount,
    productCount: shop.productCount,
    featured: shop.featured,
  };
  
  // Additional data for owner/admin
  if (user && (shop.ownerId === user.id || user.role === 'admin')) {
    return {
      ...publicData,
      status: shop.status,
      verified: shop.verified,
      banned: shop.banned,
      address: shop.address,
      contact: shop.contact,
      settings: shop.settings,
      stats: shop.stats,
    };
  }
  
  return publicData;
}
```

---

### Step 3: Add Resource-Specific Routes

#### `/src/app/api/shops/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOptionalUser, requireAuth } from '@/app/api/middleware/auth';
import { getShop, updateShop, deleteShop } from '@/lib/db/shops';

// GET /api/shops/[id] - Get shop details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOptionalUser(req);
    const shop = await getShop(params.id);
    
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }
    
    // Check access
    const canView = canViewShop(shop, user);
    if (!canView) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Filter data based on role
    const filteredShop = filterShopData(shop, user);
    
    return NextResponse.json({
      success: true,
      data: { shop: filteredShop }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/shops/[id] - Update shop
export const PATCH = requireAuth(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = req.user;
    const body = await req.json();
    const shop = await getShop(params.id);
    
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }
    
    // Check permission
    const canEdit = shop.ownerId === user.id || user.role === 'admin';
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Filter updateable fields based on role
    const updateData = filterUpdateFields(body, user, shop);
    
    // Update shop
    const updatedShop = await updateShop(params.id, updateData);
    
    return NextResponse.json({
      success: true,
      data: { shop: updatedShop }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

// DELETE /api/shops/[id] - Delete shop
export const DELETE = requireAuth(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = req.user;
    const shop = await getShop(params.id);
    
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }
    
    // Check permission
    const canDelete = shop.ownerId === user.id || user.role === 'admin';
    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Soft delete for owner, hard delete for admin
    if (user.role === 'admin') {
      await deleteShop(params.id, { hard: true });
    } else {
      await deleteShop(params.id, { hard: false });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

// Helper: Check if user can view shop
function canViewShop(shop: any, user: any): boolean {
  // Public shop
  if (shop.verified && !shop.banned) {
    return true;
  }
  
  // Owner can view own shop
  if (user && shop.ownerId === user.id) {
    return true;
  }
  
  // Admin can view any shop
  if (user && user.role === 'admin') {
    return true;
  }
  
  return false;
}

// Helper: Filter updateable fields based on role
function filterUpdateFields(body: any, user: any, shop: any) {
  const allowedFields = [
    'name', 'description', 'logo', 'banner',
    'address', 'contact', 'categories', 'settings'
  ];
  
  const adminOnlyFields = [
    'verified', 'banned', 'featured', 'homepage', 'priority'
  ];
  
  const updateData: any = {};
  
  // Allow common fields for owner
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }
  
  // Allow admin-only fields for admin
  if (user.role === 'admin') {
    for (const field of adminOnlyFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
  }
  
  return updateData;
}
```

---

### Step 4: Add Action-Specific Routes (Admin Only)

#### `/src/app/api/shops/[id]/verify/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/middleware/auth';
import { requireRole } from '@/app/api/middleware/rbac';
import { verifyShop } from '@/lib/db/shops';

export const PATCH = requireAuth(
  requireRole(['admin'])(async (
    req: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    try {
      const body = await req.json();
      const { verified, reason } = body;
      
      const shop = await verifyShop(params.id, {
        verified,
        reason,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      });
      
      // TODO: Send notification to shop owner
      
      return NextResponse.json({
        success: true,
        data: { shop }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  })
);
```

---

## Frontend Usage

### React Hook for Unified API

```typescript
// /src/hooks/useShops.ts
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export function useShops(filters?: ShopFilters) {
  const { user } = useAuth();
  
  // Same endpoint for all roles
  const endpoint = '/api/shops';
  
  // Build query params
  const params = useMemo(() => {
    const p = new URLSearchParams();
    
    if (filters?.search) p.set('search', filters.search);
    if (filters?.featured) p.set('featured', 'true');
    
    // Admin-specific filters
    if (user?.role === 'admin') {
      if (filters?.verified !== undefined) {
        p.set('verified', String(filters.verified));
      }
      if (filters?.banned !== undefined) {
        p.set('banned', String(filters.banned));
      }
    }
    
    return p.toString();
  }, [filters, user?.role]);
  
  // Use your preferred data fetching library (SWR, React Query, etc.)
  const { data, error, mutate } = useSWR(
    `${endpoint}?${params}`,
    fetcher
  );
  
  return {
    shops: data?.data?.shops || [],
    pagination: data?.data?.pagination,
    isLoading: !error && !data,
    error,
    mutate
  };
}

// Usage in components
export function ShopsList() {
  const { user } = useAuth();
  const { shops, isLoading } = useShops({
    featured: true
  });
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      <h2>
        {user?.role === 'admin' ? 'All Shops' : 'Featured Shops'}
      </h2>
      {shops.map(shop => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
}
```

---

## Testing

### Test Suite Structure

```typescript
// /tests/api/shops.test.ts
describe('GET /api/shops', () => {
  it('should return public shops for guest users', async () => {
    const res = await fetch('/api/shops');
    const data = await res.json();
    
    expect(data.success).toBe(true);
    expect(data.data.shops).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          verified: true,
          banned: false
        })
      ])
    );
  });
  
  it('should return own shops for seller', async () => {
    const token = await loginAsSeller();
    const res = await fetch('/api/shops', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    
    expect(data.success).toBe(true);
    // Should include both own and public shops
  });
  
  it('should return all shops for admin', async () => {
    const token = await loginAsAdmin();
    const res = await fetch('/api/shops', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    
    expect(data.success).toBe(true);
    // Should include shops with any status
  });
  
  it('should filter by verified status (admin only)', async () => {
    const token = await loginAsAdmin();
    const res = await fetch('/api/shops?verified=false', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    
    expect(data.success).toBe(true);
    expect(data.data.shops).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ verified: false })
      ])
    );
  });
});

describe('POST /api/shops', () => {
  it('should create shop for seller', async () => {
    const token = await loginAsSeller();
    const res = await fetch('/api/shops', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Shop',
        slug: 'test-shop',
        description: 'A test shop'
      })
    });
    const data = await res.json();
    
    expect(data.success).toBe(true);
    expect(data.data.shop.status).toBe('pending');
  });
  
  it('should enforce shop limit for sellers', async () => {
    const token = await loginAsSellerWithShop();
    const res = await fetch('/api/shops', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Second Shop',
        slug: 'second-shop'
      })
    });
    const data = await res.json();
    
    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
  });
  
  it('should allow unlimited shops for admin', async () => {
    const token = await loginAsAdmin();
    // Create multiple shops...
    // Should succeed
  });
});
```

---

## Common Patterns

### Pattern 1: Role-Based Query Building
```typescript
function buildQuery(user: User | null, filters: any) {
  const query: any = {};
  
  switch(user?.role) {
    case 'admin':
      // No restrictions, apply filters directly
      Object.assign(query, filters);
      break;
    case 'seller':
      // Own resources + public
      query.$or = [
        { ownerId: user.id },
        { public: true }
      ];
      break;
    default:
      // Public only
      query.public = true;
  }
  
  return query;
}
```

### Pattern 2: Data Filtering by Role
```typescript
function filterData(data: any, user: User | null) {
  const publicFields = ['id', 'name', 'description'];
  const ownerFields = [...publicFields, 'email', 'stats', 'settings'];
  const adminFields = [...ownerFields, 'internal_notes', 'flags'];
  
  if (user?.role === 'admin') {
    return pick(data, adminFields);
  } else if (data.ownerId === user?.id) {
    return pick(data, ownerFields);
  } else {
    return pick(data, publicFields);
  }
}
```

### Pattern 3: Permission Checking
```typescript
function canModify(resource: any, user: User): boolean {
  return user.role === 'admin' || resource.ownerId === user.id;
}

function canView(resource: any, user: User | null): boolean {
  if (resource.public) return true;
  if (!user) return false;
  return user.role === 'admin' || resource.ownerId === user.id;
}
```

---

## Troubleshooting

### Issue: Unauthorized even with valid session
**Solution:** Make sure middleware is properly extracting user from session
```typescript
// Check session structure
console.log('Session:', session);
console.log('User:', session?.user);
```

### Issue: Admin seeing filtered data
**Solution:** Check role comparison is case-sensitive
```typescript
// Correct
user.role === 'admin'

// Wrong (if role is stored as 'Admin')
user.role === 'admin'
```

### Issue: Seller can't access own resources
**Solution:** Verify ownership check is using correct field
```typescript
// Check database schema
console.log('Resource ownerId:', resource.ownerId);
console.log('User ID:', user.id);
console.log('Match:', resource.ownerId === user.id);
```

---

## Checklist for New Unified Endpoint

- [ ] Create base route file (`/api/resource/route.ts`)
- [ ] Implement GET with role-based filtering
- [ ] Implement POST with role-based validation
- [ ] Create resource route file (`/api/resource/[id]/route.ts`)
- [ ] Implement GET with access control
- [ ] Implement PATCH with ownership check
- [ ] Implement DELETE with ownership check
- [ ] Add admin-specific action routes if needed
- [ ] Write tests for each role
- [ ] Update frontend hooks/services
- [ ] Document in API reference

---

Last Updated: November 7, 2025
