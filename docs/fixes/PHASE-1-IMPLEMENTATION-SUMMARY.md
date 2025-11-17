# Phase 1 Implementation Summary - RBAC Middleware & Helpers

**Date Completed**: November 16, 2025  
**Status**: ✅ Complete

---

## Overview

Phase 1 established the foundation for role-based access control (RBAC) across all API routes. This includes middleware, permission helpers, error classes, and comprehensive examples.

---

## Files Created

### 1. Error Handling (`src/lib/api-errors.ts`)

**Purpose**: Standardized error responses for API routes

**Classes Created**:
- `ApiError` - Base error class
- `UnauthorizedError` - 401 (not logged in)
- `ForbiddenError` - 403 (insufficient permissions)
- `NotFoundError` - 404 (resource not found)
- `ValidationError` - 400 (validation failed)
- `ConflictError` - 409 (duplicate resource)
- `RateLimitError` - 429 (rate limit exceeded)
- `InternalServerError` - 500 (unexpected error)

**Helper Functions**:
- `errorToJson()` - Convert error to JSON response
- `isOperationalError()` - Check if error is expected vs programming error

**Usage**:
```typescript
import { UnauthorizedError, errorToJson } from "@/lib/api-errors";

return NextResponse.json(
  errorToJson(new UnauthorizedError("Authentication required")),
  { status: 401 }
);
```

---

### 2. Permission Helpers (`src/lib/rbac-permissions.ts`)

**Purpose**: Fine-grained permission checks and data filtering

**Types Defined**:
- `UserRole` - "admin" | "seller" | "user" | "guest"
- `AuthUser` - User authentication object
- `ResourceType` - All resource types in the system
- `Action` - "read" | "create" | "update" | "delete" | "bulk"

**Functions Created**:

1. **Permission Checks**:
   - `canReadResource(user, resourceType, data)` - Check read permissions
   - `canWriteResource(user, resourceType, action, data)` - Check write permissions
   - `canDeleteResource(user, resourceType, data)` - Check delete permissions

2. **Data Filtering**:
   - `filterDataByRole(user, resourceType, data)` - Filter array based on role
   - `isResourceOwner(user, data)` - Check if user owns resource

3. **Role Checks**:
   - `hasRole(user, requiredRole)` - Check if user has at least the required role
   - `hasAnyRole(user, roles)` - Check if user has any of the roles
   - `getRoleLevel(role)` - Get role hierarchy level (higher = more permissions)

**Permission Matrix**:

| Resource      | Guest | User      | Seller         | Admin |
|---------------|-------|-----------|----------------|-------|
| Hero Slides   | Read (active) | Read (active) | Read (active) | Read/Write All |
| Categories    | Read (active) | Read (active) | Read (active) | Read/Write All |
| Products      | Read (published) | Read (published) | Read/Write Own | Read/Write All |
| Auctions      | Read (active) | Read (active), Bid | Read/Write Own | Read/Write All |
| Orders        | None | Read/Write Own | Read Own Shop | Read/Write All |
| Shops         | Read (active) | Read (active) | Read/Write Own | Read/Write All |
| Tickets       | None | Create/Read Own | Read Shop | Read/Write All |
| Reviews       | Read (approved) | Create/Read Own | Read | Read/Write All |

**Usage**:
```typescript
import { canWriteResource, filterDataByRole } from "@/lib/rbac-permissions";

// Check permission
if (!canWriteResource(user, "products", "update", productData)) {
  return forbidden();
}

// Filter data
const filteredProducts = filterDataByRole(user, "products", allProducts);
```

---

### 3. RBAC Authentication Middleware (`src/app/api/middleware/rbac-auth.ts`)

**Purpose**: Authentication and authorization middleware for API routes

**Main Functions**:

1. **User Extraction**:
   - `getUserFromRequest(request)` - Extract user from Bearer token or session cookie
   - `optionalAuth(request)` - Get user if available (non-blocking)

2. **Authentication Requirements**:
   - `requireAuth(request)` - Require user to be logged in
   - `requireRole(request, roles)` - Require specific role(s)
   - `requireAdmin(request)` - Require admin role
   - `requireSeller(request)` - Require seller or admin role

3. **Ownership Requirements**:
   - `requireOwnership(request, resourceOwnerId, allowAdmin)` - Require resource ownership
   - `requireShopOwnership(request, resourceShopId, allowAdmin)` - Require shop ownership

4. **Permission Checks**:
   - `checkPermission(request, action, resource)` - Fine-grained permission check

5. **Route Wrappers**:
   - `withAuth(handler)` - Wrap handler with authentication requirement
   - `withRole(roles, handler)` - Wrap handler with role requirement

**Usage Patterns**:

```typescript
// Pattern 1: Manual auth check
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;
  
  const { user } = authResult;
  // ... use user
}

// Pattern 2: Using wrapper
export const GET = withAuth(async (request, user) => {
  // user is guaranteed to be authenticated
  return NextResponse.json({ data });
});

// Pattern 3: Role-based wrapper
export const POST = withRole(["admin", "seller"], async (request, user) => {
  // user has admin or seller role
  return NextResponse.json({ success: true });
});
```

---

### 4. RBAC Examples (`src/app/api/middleware/rbac-examples.ts`)

**Purpose**: Comprehensive examples of how to use RBAC middleware

**Examples Included**:

1. **Public GET with optional auth** - Hero slides (active for public, all for admin)
2. **Admin-only POST** - Creating hero slides
3. **Role-based GET with filtering** - Products (different data per role)
4. **Seller/Admin POST** - Creating products with auto-association
5. **Owner/Admin PATCH** - Updating products with ownership check
6. **Admin-only bulk operations** - Bulk update/delete products
7. **Using withAuth wrapper** - Simple authenticated route
8. **Using withRole wrapper** - Role-restricted route
9. **Multi-role GET** - Tickets (different queries per role)
10. **Permission-based PATCH** - Tickets (different permissions per role)

---

## Architecture Decisions

### 1. Dual Authentication Support

The middleware supports both:
- **Bearer Token** (Authorization header) - For API calls from frontend
- **Session Cookie** - For server-side rendering

This ensures backward compatibility while adding new RBAC features.

### 2. Role Hierarchy

Roles follow a hierarchy where higher roles inherit lower permissions:
- Admin (level 100) - All permissions
- Seller (level 50) - Own resources + public read
- User (level 10) - Own resources + public read
- Guest (level 0) - Public read only

### 3. Resource Ownership

Ownership is checked via multiple fields:
- `userId` - Direct user ownership
- `createdBy` - Creator of the resource
- `ownerId` - Explicit owner field
- `shopId` - For seller-owned resources

### 4. Error Response Format

All errors follow a consistent format:
```json
{
  "error": "Error message",
  "statusCode": 401,
  "errors": { /* optional field-level errors */ }
}
```

---

## Testing Checklist

- [x] Create error classes
- [x] Create permission helpers
- [x] Create RBAC middleware
- [x] Create comprehensive examples
- [x] Document usage patterns
- [ ] Unit tests for permission helpers (TODO: Phase 12)
- [ ] Integration tests for middleware (TODO: Phase 12)

---

## Next Steps (Phase 2)

1. Apply RBAC middleware to hero slides routes
2. Create unified `/api/hero-slides` route
3. Update service layer
4. Update components
5. Test thoroughly
6. Remove old routes

---

## Files to Review

Before proceeding to Phase 2, review these files to understand patterns:

1. `src/lib/api-errors.ts` - Error handling
2. `src/lib/rbac-permissions.ts` - Permission logic
3. `src/app/api/middleware/rbac-auth.ts` - Middleware implementation
4. `src/app/api/middleware/rbac-examples.ts` - Usage examples

---

## Migration Guide for Developers

### Before (Old Pattern):
```typescript
// Separate routes for each role
// /api/admin/products - Admin only
// /api/seller/products - Seller only
// /api/products - Public only

export async function GET(request: NextRequest) {
  // Hard-coded admin check
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

### After (New Pattern):
```typescript
// Unified route with RBAC
// /api/products - Role-based access

import { requireAuth, optionalAuth } from "@/app/api/middleware/rbac-auth";
import { filterDataByRole } from "@/lib/rbac-permissions";

export async function GET(request: NextRequest) {
  const user = await optionalAuth(request);
  
  // Fetch data
  const products = await fetchProducts();
  
  // Filter based on role
  const filtered = filterDataByRole(user, "products", products);
  
  return NextResponse.json({ products: filtered });
}
```

---

## Key Takeaways

1. ✅ **Standardized Error Handling** - All errors use consistent format
2. ✅ **Fine-Grained Permissions** - Can check read/write/delete per resource
3. ✅ **Flexible Middleware** - Multiple auth patterns supported
4. ✅ **Data Filtering** - Automatic filtering based on role
5. ✅ **Type Safety** - Full TypeScript support
6. ✅ **Backward Compatible** - Works with existing session system
7. ✅ **Well Documented** - 10 comprehensive examples
8. ✅ **Ready for Production** - Follows security best practices

---

**Phase 1 Status**: ✅ **COMPLETE**  
**Ready for Phase 2**: ✅ **YES**

---

**Last Updated**: November 16, 2025
