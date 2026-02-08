# Role-Based Access Control (RBAC) System

## Overview

The LetItRip RBAC system provides comprehensive role-based access control for routes, pages, and components. It enforces authentication requirements, role hierarchies, and automatic redirection for unauthorized access.

## Features

- ✅ **Declarative Route Protection** - Configure access rules in a centralized location
- ✅ **Role Hierarchy** - Automatic inheritance of permissions (admin > moderator > seller > user)
- ✅ **Flexible Protection** - Component-based, HOC, and route-level protection
- ✅ **Auto-redirect** - Unauthorized users redirected with 5-second countdown
- ✅ **Email Verification** - Optional email verification requirement
- ✅ **TypeScript Support** - Full type safety with UserRole types

## User Roles

```typescript
type UserRole = "user" | "seller" | "moderator" | "admin";
```

### Role Hierarchy (Lowest to Highest)

1. **user** - Basic authenticated user
2. **seller** - Can manage products and orders
3. **moderator** - Can manage content and users
4. **admin** - Full system access

**Note:** Higher roles automatically inherit permissions of lower roles.

## Configuration

### RBAC Config Structure

Located in `src/constants/rbac.ts`:

```typescript
export const RBAC_CONFIG = {
  // Public routes (no auth required)
  [ROUTES.HOME]: {
    requireAuth: false,
    allowedRoles: [],
    requireEmailVerified: false,
  },

  // User routes (requires auth)
  [ROUTES.USER.DASHBOARD]: {
    requireAuth: true,
    allowedRoles: ["user"], // All authenticated users
    requireEmailVerified: false,
  },

  // Admin routes (requires admin role)
  [ROUTES.ADMIN.DASHBOARD]: {
    requireAuth: true,
    allowedRoles: ["admin"],
    requireEmailVerified: true,
  },

  // Multiple roles
  [ROUTES.ADMIN.PRODUCTS]: {
    requireAuth: true,
    allowedRoles: ["seller", "admin"], // Sellers AND admins
    requireEmailVerified: true,
  },
};
```

### Config Properties

| Property               | Type         | Description                                                |
| ---------------------- | ------------ | ---------------------------------------------------------- |
| `requireAuth`          | `boolean`    | Require user to be authenticated                           |
| `allowedRoles`         | `UserRole[]` | Array of roles that can access (empty = all authenticated) |
| `requireEmailVerified` | `boolean`    | Require email verification                                 |

## Usage

### 1. Component-Based Protection

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requireAuth requireRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

**Props:**

- `requireAuth?: boolean` - Require authentication (default: true if roles specified)
- `requireRole?: UserRole | UserRole[]` - Required role(s)
- `requireEmailVerified?: boolean` - Require email verification
- `fallback?: ReactNode` - Custom fallback UI
- `showUnauthorized?: boolean` - Show unauthorized message instead of redirecting
- `children: ReactNode` - Protected content

### 2. Automatic Route Protection

Uses RBAC_CONFIG automatically:

```tsx
import { RouteProtection } from "@/components/auth/ProtectedRoute";

export default function SettingsPage() {
  return (
    <RouteProtection>
      <SettingsContent />
    </RouteProtection>
  );
}
```

**Note:** `RouteProtection` automatically detects the current route and applies the corresponding RBAC config.

### 3. Higher-Order Component

```tsx
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";

function AdminDashboard() {
  return <div>Admin Content</div>;
}

export default withProtectedRoute(AdminDashboard, {
  requireAuth: true,
  requireRole: "admin",
});
```

### 4. Role Checking Hooks

#### In Components

```tsx
import { useHasRole, useIsAdmin, useCanAccess } from "@/hooks/useRBAC";

function MyComponent() {
  const isAdmin = useIsAdmin();
  const canAccessProducts = useCanAccess(ROUTES.ADMIN.PRODUCTS);
  const hasSeller = useHasRole("seller");

  if (isAdmin) {
    return <AdminPanel />;
  }

  if (canAccessProducts) {
    return <ProductPanel />;
  }

  return <UserPanel />;
}
```

#### Available Hooks

| Hook                   | Description                     | Example                                |
| ---------------------- | ------------------------------- | -------------------------------------- |
| `useHasRole(role)`     | Check if user has specific role | `useHasRole("admin")`                  |
| `useIsAdmin()`         | Check if user is admin          | `useIsAdmin()`                         |
| `useIsModerator()`     | Check if moderator or higher    | `useIsModerator()`                     |
| `useIsSeller()`        | Check if seller or higher       | `useIsSeller()`                        |
| `useCanAccess(route)`  | Check if user can access route  | `useCanAccess(ROUTES.ADMIN.DASHBOARD)` |
| `useIsOwner(ownerId)`  | Check if user owns resource     | `useIsOwner(post.authorId)`            |
| `useRequireAuth()`     | Force authentication            | `useRequireAuth()`                     |
| `useRequireRole(role)` | Force specific role             | `useRequireRole("admin")`              |

### 5. Utility Functions

#### In Server Components / API Routes

```typescript
import { hasRouteAccess, getRouteAccessConfig } from "@/constants";

// Check access
const canAccess = hasRouteAccess(
  "/admin/dashboard",
  user,
  true, // isAuthenticated
);

// Get config
const config = getRouteAccessConfig("/admin/dashboard");
if (config?.requireEmailVerified && !user.emailVerified) {
  // Handle unverified email
}
```

## Unauthorized Access Behavior

### Default Behavior

When a user tries to access a protected route without proper authorization:

1. **Not authenticated** → Redirect to `/auth/login`
2. **Missing required role** → Redirect to `/unauthorized`
3. **Email not verified** → Redirect to `/auth/verify-email`

### Unauthorized Page

Located at `/unauthorized`, features:

- Clear "Access Denied" message
- Explanation of why access was denied
- **5-second countdown**
- Auto-redirect to home page
- Manual "Go Home" button
- "Login" button for unauthenticated users

## Adding New Protected Routes

### Step 1: Add Route Constant

```typescript
// src/constants/routes.ts
export const ROUTES = {
  // ... existing routes
  SELLER: {
    DASHBOARD: "/seller/dashboard",
    PRODUCTS: "/seller/products",
  },
};
```

### Step 2: Add RBAC Config

```typescript
// src/constants/rbac.ts
export const RBAC_CONFIG = {
  // ... existing config
  [ROUTES.SELLER.DASHBOARD]: {
    requireAuth: true,
    allowedRoles: ["seller"],
    requireEmailVerified: true,
  },
};
```

### Step 3: Protect the Route

```tsx
// app/seller/dashboard/page.tsx
import { RouteProtection } from "@/components/auth/ProtectedRoute";

export default function SellerDashboard() {
  return (
    <RouteProtection>
      <SellerDashboardContent />
    </RouteProtection>
  );
}
```

Done! The route is now protected according to your RBAC config.

## Role Hierarchy Examples

Because of role hierarchy, these are equivalent:

```tsx
// Admin can access seller routes
<ProtectedRoute requireRole="seller">
  {/* Admin can also access this */}
</ProtectedRoute>

// All roles can access user routes
<ProtectedRoute requireRole="user">
  {/* seller, moderator, admin can also access */}
</ProtectedRoute>
```

To restrict to **exactly one role** (not recommended):

```tsx
// Custom check in component
const { user } = useSession();
const isExactlySeller = user?.role === "seller";

if (!isExactlySeller) {
  return <Unauthorized />;
}
```

## Testing Access Control

### Test Cases

```typescript
import { hasRouteAccess } from "@/constants";

describe("RBAC", () => {
  it("should allow admin to access admin routes", () => {
    const user = { uid: "1", role: "admin", emailVerified: true };
    expect(hasRouteAccess(ROUTES.ADMIN.DASHBOARD, user, true)).toBe(true);
  });

  it("should deny user access to admin routes", () => {
    const user = { uid: "1", role: "user", emailVerified: true };
    expect(hasRouteAccess(ROUTES.ADMIN.DASHBOARD, user, true)).toBe(false);
  });

  it("should deny unverified emails when required", () => {
    const user = { uid: "1", role: "admin", emailVerified: false };
    expect(hasRouteAccess(ROUTES.ADMIN.DASHBOARD, user, true)).toBe(false);
  });
});
```

## Security Best Practices

### ✅ Do's

- **Always protect sensitive routes** with RBAC config
- **Verify on the server** - Never trust client-side checks alone
- **Use route constants** from `@/constants/routes`
- **Check email verification** for critical actions
- **Test access control** in API routes and server components

### ❌ Don'ts

- **Don't hardcode routes** - Use `ROUTES` constants
- **Don't skip server-side checks** - Client checks are for UX only
- **Don't trust client role claims** - Verify with Firebase Admin
- **Don't forget email verification** for sensitive operations
- **Don't create custom protection** - Use existing components/hooks

## API Route Protection

```typescript
// app/api/admin/users/route.ts
import { verifyAuth } from "@/lib/firebase/auth-server";
import { AuthorizationError } from "@/lib/errors";

export async function GET(request: Request) {
  // Verify authentication & role
  const auth = await verifyAuth(request);

  if (!auth || auth.role !== "admin") {
    throw new AuthorizationError("Admin access required");
  }

  // Proceed with admin logic
  // ...
}
```

## Migration from Old System

If you have existing protection code:

### Before (Custom Protection)

```tsx
// ❌ Old way
const { user } = useSession();
if (!user || user.role !== "admin") {
  redirect("/unauthorized");
}

return <AdminContent />;
```

### After (RBAC System)

```tsx
// ✅ New way
import { RouteProtection } from "@/components/auth/ProtectedRoute";

return (
  <RouteProtection>
    <AdminContent />
  </RouteProtection>
);
```

## Troubleshooting

### Route not protected

**Issue:** Users can access protected routes.

**Solutions:**

1. Verify RBAC_CONFIG has entry for the route
2. Ensure route constant matches exactly
3. Wrap page with `<RouteProtection>` or `<ProtectedRoute>`
4. Check server-side protection in API routes

### Always redirecting to login

**Issue:** Even authenticated users redirected.

**Solutions:**

1. Verify SessionContext is initialized
2. Check cookies are being set (`__session`, `__session_id`)
3. Ensure `requireAuth: true` is intended
4. Check browser console for auth errors

### Role hierarchy not working

**Issue:** Admin can't access seller routes.

**Solutions:**

1. Verify using `hasRouteAccess()` from `@/constants`
2. Check RBAC_CONFIG has role comparisons
3. Ensure UserRole type is correct
4. Don't use exact equality checks for roles

### Email verification always failing

**Issue:** Routes requiring email verification always fail.

**Solutions:**

1. Check `user.emailVerified` in SessionContext
2. Verify Firebase email verification is complete
3. Force token refresh: `await user.getIdToken(true)`
4. Check RBAC config has `requireEmailVerified: true`

## Related Documentation

- [Auth System](./GUIDE.md#authentication) - Authentication implementation
- [Session Management](./GUIDE.md#session-context) - Session handling
- [User Roles](./GUIDE.md#user-roles) - Role definitions
- [Routes](./GUIDE.md#routes) - Route constants
- [Security](./SECURITY.md) - Security best practices

## Summary

The RBAC system provides:

✅ Centralized access control configuration
✅ Role hierarchy with automatic permission inheritance  
✅ Flexible protection (routes, components, HOCs)
✅ Automatic redirects with user-friendly messages
✅ Type-safe hooks and utilities
✅ Email verification support
✅ Server-side verification helpers

Always configure route access in `RBAC_CONFIG`, use existing components for protection, and verify permissions server-side for security-critical operations.
