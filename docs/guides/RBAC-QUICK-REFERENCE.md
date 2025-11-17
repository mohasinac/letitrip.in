# RBAC Quick Reference Guide

**Purpose**: Quick lookup for implementing role-based access control in API routes

---

## Import Statements

```typescript
// Middleware
import {
  requireAuth,
  requireAdmin,
  requireSeller,
  requireRole,
  requireOwnership,
  requireShopOwnership,
  optionalAuth,
  withAuth,
  withRole,
} from "@/app/api/middleware/rbac-auth";

// Permission helpers
import {
  canReadResource,
  canWriteResource,
  canDeleteResource,
  filterDataByRole,
  isResourceOwner,
  hasRole,
  hasAnyRole,
} from "@/lib/rbac-permissions";

// Error handling
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  errorToJson,
} from "@/lib/api-errors";

// Types
import type { AuthUser, UserRole } from "@/lib/rbac-permissions";
```

---

## Common Patterns

### 1. Public GET (with admin seeing more data)

```typescript
export async function GET(request: NextRequest) {
  const user = await optionalAuth(request);
  
  const db = getFirestoreAdmin();
  let query = db.collection("hero_slides");
  
  // Filter for non-admin users
  if (!user || user.role !== "admin") {
    query = query.where("isActive", "==", true);
  }
  
  const snapshot = await query.get();
  const slides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return NextResponse.json({ slides });
}
```

### 2. Admin-Only POST

```typescript
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult.error) return authResult.error;
  
  const { user } = authResult;
  const body = await request.json();
  
  // Create resource
  const db = getFirestoreAdmin();
  const docRef = await db.collection("hero_slides").add({
    ...body,
    createdBy: user.uid,
    createdAt: new Date(),
  });
  
  return NextResponse.json({ id: docRef.id });
}
```

### 3. Seller/Admin POST (auto-associate with shop)

```typescript
export async function POST(request: NextRequest) {
  const authResult = await requireSeller(request);
  if (authResult.error) return authResult.error;
  
  const { user } = authResult;
  const body = await request.json();
  
  const data: any = { ...body, createdBy: user.uid };
  
  // Auto-associate with seller's shop
  if (user.role === "seller") {
    if (!user.shopId) {
      return NextResponse.json(
        { error: "Seller must have a shop" },
        { status: 400 }
      );
    }
    data.shopId = user.shopId;
  } else if (user.role === "admin") {
    data.shopId = body.shopId || null;
  }
  
  const db = getFirestoreAdmin();
  const docRef = await db.collection("products").add(data);
  
  return NextResponse.json({ id: docRef.id });
}
```

### 4. Owner/Admin PATCH

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;
  
  const { user } = authResult;
  const { id } = params;
  
  const db = getFirestoreAdmin();
  const docRef = db.collection("products").doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return NextResponse.json(
      errorToJson(new NotFoundError("Product not found")),
      { status: 404 }
    );
  }
  
  const data = doc.data();
  
  // Check ownership
  if (user.role !== "admin") {
    if (user.role === "seller" && data?.shopId !== user.shopId) {
      return NextResponse.json(
        errorToJson(new ForbiddenError("You can only edit your own products")),
        { status: 403 }
      );
    } else if (user.role === "user") {
      return NextResponse.json(
        errorToJson(new ForbiddenError("Users cannot edit products")),
        { status: 403 }
      );
    }
  }
  
  const body = await request.json();
  await docRef.update({ ...body, updatedBy: user.uid, updatedAt: new Date() });
  
  return NextResponse.json({ success: true });
}
```

### 5. Multi-Role GET (different data per role)

```typescript
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;
  
  const { user } = authResult;
  
  const db = getFirestoreAdmin();
  let query = db.collection("tickets");
  
  // Filter based on role
  if (user.role === "admin") {
    // Admin sees all
  } else if (user.role === "seller") {
    query = query.where("shopId", "==", user.shopId);
  } else {
    query = query.where("createdBy", "==", user.uid);
  }
  
  const snapshot = await query.get();
  const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return NextResponse.json({ tickets });
}
```

### 6. Admin-Only Bulk Operations

```typescript
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult.error) return authResult.error;
  
  const { user } = authResult;
  const { ids, action, updates } = await request.json();
  
  const db = getFirestoreAdmin();
  const batch = db.batch();
  
  for (const id of ids) {
    const docRef = db.collection("products").doc(id);
    
    if (action === "delete") {
      batch.delete(docRef);
    } else if (action === "update") {
      batch.update(docRef, { ...updates, updatedBy: user.uid });
    }
  }
  
  await batch.commit();
  
  return NextResponse.json({ success: true, count: ids.length });
}
```

### 7. Using Wrappers (Cleaner)

```typescript
// Auth wrapper
export const GET = withAuth(async (request, user) => {
  // user is guaranteed to be authenticated
  return NextResponse.json({ userId: user.uid });
});

// Role wrapper
export const POST = withRole(["admin", "seller"], async (request, user) => {
  // user has admin or seller role
  const body = await request.json();
  // ... create resource
  return NextResponse.json({ success: true });
});
```

---

## Permission Checks

### Check if user can read

```typescript
import { canReadResource } from "@/lib/rbac-permissions";

if (!canReadResource(user, "products", productData)) {
  return NextResponse.json(
    errorToJson(new ForbiddenError("Cannot read this product")),
    { status: 403 }
  );
}
```

### Check if user can write

```typescript
import { canWriteResource } from "@/lib/rbac-permissions";

if (!canWriteResource(user, "products", "update", productData)) {
  return NextResponse.json(
    errorToJson(new ForbiddenError("Cannot update this product")),
    { status: 403 }
  );
}
```

### Check if user can delete

```typescript
import { canDeleteResource } from "@/lib/rbac-permissions";

if (!canDeleteResource(user, "products", productData)) {
  return NextResponse.json(
    errorToJson(new ForbiddenError("Cannot delete this product")),
    { status: 403 }
  );
}
```

### Filter data by role

```typescript
import { filterDataByRole } from "@/lib/rbac-permissions";

const allProducts = await fetchAllProducts();
const visibleProducts = filterDataByRole(user, "products", allProducts);
```

---

## Error Responses

### Return 401 Unauthorized

```typescript
return NextResponse.json(
  errorToJson(new UnauthorizedError("Authentication required")),
  { status: 401 }
);
```

### Return 403 Forbidden

```typescript
return NextResponse.json(
  errorToJson(new ForbiddenError("You don't have permission")),
  { status: 403 }
);
```

### Return 404 Not Found

```typescript
return NextResponse.json(
  errorToJson(new NotFoundError("Product not found")),
  { status: 404 }
);
```

### Return 400 Validation Error

```typescript
return NextResponse.json(
  errorToJson(
    new ValidationError("Validation failed", {
      name: "Name is required",
      email: "Invalid email format",
    })
  ),
  { status: 400 }
);
```

---

## Role Checks

### Check if user has specific role

```typescript
import { hasRole } from "@/lib/rbac-permissions";

if (hasRole(user, "admin")) {
  // User is admin or higher
}
```

### Check if user has any of the roles

```typescript
import { hasAnyRole } from "@/lib/rbac-permissions";

if (hasAnyRole(user, ["admin", "seller"])) {
  // User is admin or seller
}
```

### Check ownership

```typescript
import { isResourceOwner } from "@/lib/rbac-permissions";

if (isResourceOwner(user, productData)) {
  // User owns this product
}
```

---

## Query Patterns

### Firestore query with role-based filtering

```typescript
const db = getFirestoreAdmin();
let query = db.collection("products");

// Public users - only published
if (!user) {
  query = query.where("status", "==", "published");
}
// Sellers - own products
else if (user.role === "seller") {
  query = query.where("shopId", "==", user.shopId);
}
// Admin - all products (no filter)

const snapshot = await query.get();
```

---

## Testing Checklist

When implementing a unified route, test with:

- [ ] **No auth** (guest) - Should see only public data
- [ ] **User role** - Should see own data + public data
- [ ] **Seller role** - Should see own shop's data + public data
- [ ] **Admin role** - Should see all data
- [ ] **Wrong owner** - Should get 403 Forbidden
- [ ] **Invalid token** - Should get 401 Unauthorized

---

## Common Mistakes to Avoid

❌ **Don't do this**:
```typescript
// Hard-coded role check
if (user.role !== 'admin') {
  return error;
}
```

✅ **Do this instead**:
```typescript
// Use middleware
const authResult = await requireAdmin(request);
if (authResult.error) return authResult.error;
```

---

❌ **Don't do this**:
```typescript
// Manual filtering
const filtered = products.filter(p => p.status === 'published');
```

✅ **Do this instead**:
```typescript
// Use helper
const filtered = filterDataByRole(user, "products", products);
```

---

❌ **Don't do this**:
```typescript
// Generic error
return NextResponse.json({ error: 'Error' }, { status: 500 });
```

✅ **Do this instead**:
```typescript
// Specific error with proper type
return NextResponse.json(
  errorToJson(new ForbiddenError("You don't have permission")),
  { status: 403 }
);
```

---

## File Locations

- **Middleware**: `src/app/api/middleware/rbac-auth.ts`
- **Permissions**: `src/lib/rbac-permissions.ts`
- **Errors**: `src/lib/api-errors.ts`
- **Examples**: `src/app/api/middleware/rbac-examples.ts`

---

**Ready to implement unified routes! 🚀**
