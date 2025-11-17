# Error Pages Enhancement

## Overview

Enhanced error pages with meaningful context for developers and users. All error pages now display specific error information, requested resources, and developer details in development mode.

---

## Error Pages

### 1. 404 Not Found (`/not-found`)

**When to use**: Resource doesn't exist or can't be found

**Supported Reasons**:

- `product-not-found` - Product doesn't exist
- `shop-not-found` - Shop doesn't exist or closed
- `auction-not-found` - Auction doesn't exist or ended
- `category-not-found` - Category doesn't exist
- `user-not-found` - User profile doesn't exist
- `order-not-found` - Order not found

**Query Parameters**:

- `reason` - Specific reason (see above)
- `resource` - The slug/ID that wasn't found
- `details` - Developer info (URL-encoded, only shown in development)

**Example**:

```
/not-found?reason=product-not-found&resource=charizard-vmax&details=Error%3A%20Product%20not%20in%20database
```

---

### 2. 401 Unauthorized (`/unauthorized`)

**When to use**: User needs to be logged in

**Supported Reasons**:

- `not-logged-in` - User is not authenticated
- `session-expired` - Session expired
- `invalid-token` - Auth token is invalid/revoked

**Query Parameters**:

- `reason` - Specific reason
- `role` - Required role (if applicable)
- `resource` - Resource being accessed
- `details` - Developer info (URL-encoded)

**Example**:

```
/unauthorized?reason=not-logged-in&resource=/seller/dashboard&role=seller
```

---

### 3. 403 Forbidden (`/forbidden`)

**When to use**: User is logged in but lacks permissions

**Supported Reasons**:

- `insufficient-permissions` - Doesn't have required permissions
- `wrong-role` - Has wrong role (e.g., buyer accessing seller area)
- `account-suspended` - Account is suspended
- `email-not-verified` - Email verification required

**Query Parameters**:

- `reason` - Specific reason
- `role` - Required role
- `current` - User's current role
- `resource` - Resource being accessed
- `details` - Developer info (URL-encoded)

**Example**:

```
/forbidden?reason=wrong-role&role=admin&current=seller&resource=/admin/users
```

---

## Utility Functions

### Import

```typescript
import { notFound, unauthorized, forbidden } from "@/lib/error-redirects";
```

### Usage Examples

#### 404 - Not Found

```typescript
// Product not found
router.push(notFound.product("product-slug", error));

// Shop not found
router.push(notFound.shop("shop-slug", error));

// Auction not found
router.push(notFound.auction("auction-slug", error));

// Category not found
router.push(notFound.category("category-slug", error));

// Order not found
router.push(notFound.order("order-id", error));
```

#### 401 - Unauthorized

```typescript
// Not logged in
router.push(unauthorized.notLoggedIn("/seller/dashboard"));

// Session expired
router.push(unauthorized.sessionExpired("/checkout"));

// Invalid token
router.push(unauthorized.invalidToken("/api/orders", error));
```

#### 403 - Forbidden

```typescript
// Wrong role
router.push(forbidden.wrongRole("admin", "seller", "/admin/users"));

// Insufficient permissions
router.push(forbidden.insufficientPermissions("seller", "/seller/create-shop"));

// Account suspended
router.push(
  forbidden.accountSuspended("Your account was suspended for violating terms")
);

// Email not verified
router.push(forbidden.emailNotVerified("/create-auction"));
```

### Advanced Usage

```typescript
import {
  notFoundUrl,
  unauthorizedUrl,
  forbiddenUrl,
} from "@/lib/error-redirects";

// Custom 404
const url = notFoundUrl({
  reason: "product-not-found",
  resource: slug,
  details: "Additional context here",
  error: new Error("Product fetch failed"),
});
router.push(url);

// Custom 401
const url = unauthorizedUrl({
  reason: "session-expired",
  resource: "/dashboard",
  requiredRole: "user",
  details: "Session expired after 24 hours",
});
router.push(url);

// Custom 403
const url = forbiddenUrl({
  reason: "wrong-role",
  requiredRole: "admin",
  currentRole: "seller",
  resource: "/admin/settings",
  details: "Admin-only area",
});
router.push(url);
```

---

## Implementation Guide

### Step 1: Replace existing error redirects

**Before**:

```typescript
try {
  const product = await productsService.getBySlug(slug);
} catch (error) {
  router.push("/404");
}
```

**After**:

```typescript
import { notFound } from "@/lib/error-redirects";

try {
  const product = await productsService.getBySlug(slug);
} catch (error: any) {
  router.push(notFound.product(slug, error));
}
```

### Step 2: Handle authorization errors

```typescript
import { unauthorized, forbidden } from "@/lib/error-redirects";

// Check if logged in
if (!user) {
  router.push(unauthorized.notLoggedIn("/seller/dashboard"));
  return;
}

// Check role
if (user.role !== "admin") {
  router.push(forbidden.wrongRole("admin", user.role, "/admin/users"));
  return;
}

// Check email verification
if (!user.emailVerified) {
  router.push(forbidden.emailNotVerified("/create-auction"));
  return;
}
```

### Step 3: API Route errors

```typescript
// In API routes
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "NOT_LOGGED_IN" },
      { status: 401 }
    );
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      {
        error: "Forbidden",
        code: "WRONG_ROLE",
        required: "admin",
        current: user.role,
      },
      { status: 403 }
    );
  }

  // ... rest of handler
}
```

---

## Features

### 1. Context-Aware Messages

Each error page shows specific messages based on the reason:

- Product not found vs Shop not found
- Not logged in vs Session expired
- Wrong role vs Account suspended

### 2. Resource Information

Displays the requested resource (slug, ID, path) so users and developers know what was being accessed.

### 3. Developer Mode

In development (`NODE_ENV=development`), shows:

- Full error messages
- Stack traces (first 3 lines)
- Timestamps
- Request details

### 4. User-Friendly Actions

- Go Back button (uses `window.history.back()`)
- Go Home button
- Quick links to relevant sections
- Context-specific actions (e.g., "Verify Email" for email-not-verified)

### 5. Search & Help

- Search functionality on 404 pages
- Links to support/help
- Account-related links on auth error pages

---

## Benefits

1. **Better Debugging**: Developers see exact error details in development
2. **Better UX**: Users see helpful, specific error messages
3. **SEO Friendly**: Proper error pages with meaningful content
4. **Consistent**: All error handling follows same pattern
5. **Type Safe**: TypeScript enums for error reasons
6. **Easy to Use**: Simple utility functions

---

## Migration Checklist

- [x] Replace all `router.push("/404")` with `notFound.*()` helpers
- [x] Replace all `router.push("/unauthorized")` with `unauthorized.*()` helpers
- [x] Add role checks using `forbidden.*()` helpers
- [x] Update AuthGuard component to use error helpers
- [ ] Update API routes to return structured error responses
- [ ] Test all error scenarios in development mode
- [ ] Verify error pages look good in production (no dev details shown)
- [ ] Add error tracking/monitoring integration

---

## Example Conversions

### Products Page

```typescript
// Before
catch (error) {
  router.push("/404");
}

// After
import { notFound } from "@/lib/error-redirects";
catch (error: any) {
  router.push(notFound.product(slug, error));
}
```

### Seller Dashboard

```typescript
// Before
if (!user || user.role !== "seller") {
  router.push("/unauthorized");
}

// After
import { unauthorized, forbidden } from "@/lib/error-redirects";

if (!user) {
  router.push(unauthorized.notLoggedIn("/seller/dashboard"));
  return;
}

if (user.role !== "seller") {
  router.push(forbidden.wrongRole("seller", user.role, "/seller/dashboard"));
  return;
}
```

### Admin Area

```typescript
// Before
if (user.role !== "admin") {
  router.push("/403");
}

// After
import { forbidden } from "@/lib/error-redirects";

if (user.role !== "admin") {
  router.push(forbidden.wrongRole("admin", user.role, req.url));
  return;
}
```

---

## Files Modified

1. `src/app/not-found.tsx` - Enhanced 404 page with context
2. `src/app/unauthorized/page.tsx` - Enhanced 401 page with context
3. `src/app/forbidden/page.tsx` - NEW 403 page with context
4. `src/lib/error-redirects.ts` - NEW utility functions
5. `src/app/shops/[slug]/page.tsx` - Updated to use error helpers
6. `src/app/products/[slug]/page.tsx` - Updated to use error helpers
7. `src/components/auth/AuthGuard.tsx` - Updated to use error helpers

---

## Next Steps

1. Update all pages to use new error helpers
2. Add middleware for automatic auth checks
3. Create API error response types
4. Add error tracking/logging
5. Add user-friendly error recovery suggestions
