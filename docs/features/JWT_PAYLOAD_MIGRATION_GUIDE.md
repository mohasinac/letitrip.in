# JWT Payload Migration Guide

## Overview

This guide helps you migrate existing API routes and components that reference the old JWT payload structure (which included `email`) to the new minimal structure (only `userId` and `role`).

## Quick Reference

### Old JWT Payload Structure

```typescript
interface JWTPayload {
  userId: string;
  email: string; // ❌ REMOVED
  role: "admin" | "seller" | "user";
  iat?: number;
  exp?: number;
}
```

### New JWT Payload Structure

```typescript
interface JWTPayload {
  userId: string;
  role: "admin" | "seller" | "user";
  iat?: number;
  exp?: number;
}
```

## Migration Pattern

### ❌ Before (Incorrect)

```typescript
export const POST = createUserHandler(async (request, user) => {
  // Don't use email from JWT payload
  const userEmail = user.email; // This will cause TypeScript error!

  return NextResponse.json({ email: userEmail });
});
```

### ✅ After (Correct)

```typescript
import { AuthService } from "@/lib/api/services/auth.service";

export const POST = createUserHandler(async (request, user) => {
  // Fetch full user data from database
  const userData = await AuthService.getUserById(user.userId);

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userEmail = userData.email;

  return NextResponse.json({ email: userEmail });
});
```

## Common Patterns

### Pattern 1: Accessing User Email

#### ❌ Old Way

```typescript
const sendEmail = async (user: JWTPayload) => {
  await emailService.send({
    to: user.email,
    subject: "Hello",
  });
};
```

#### ✅ New Way

```typescript
const sendEmail = async (user: JWTPayload) => {
  const userData = await AuthService.getUserById(user.userId);

  if (!userData?.email) {
    throw new Error("User email not found");
  }

  await emailService.send({
    to: userData.email,
    subject: "Hello",
  });
};
```

### Pattern 2: Logging User Actions

#### ❌ Old Way

```typescript
console.log(`User ${user.email} performed action`);
```

#### ✅ New Way (Option 1 - Simple)

```typescript
console.log(`User ${user.userId} performed action`);
```

#### ✅ New Way (Option 2 - Detailed)

```typescript
const userData = await AuthService.getUserById(user.userId);
console.log(`User ${userData?.email || user.userId} performed action`);
```

### Pattern 3: API Response with User Info

#### ❌ Old Way

```typescript
return NextResponse.json({
  success: true,
  data: {
    userId: user.userId,
    email: user.email,
    role: user.role,
  },
});
```

#### ✅ New Way

```typescript
const userData = await AuthService.getUserById(user.userId);

return NextResponse.json({
  success: true,
  data: {
    userId: user.userId,
    email: userData?.email,
    role: user.role,
    name: userData?.name,
    // Include any other needed user fields
  },
});
```

### Pattern 4: Conditional Logic Based on User Data

#### ❌ Old Way

```typescript
if (user.email.endsWith("@admin.com")) {
  // Admin-specific logic
}
```

#### ✅ New Way

```typescript
const userData = await AuthService.getUserById(user.userId);

if (userData?.email?.endsWith("@admin.com")) {
  // Admin-specific logic
}
// Or better yet, use role-based checks:
if (user.role === "admin") {
  // Admin-specific logic
}
```

## Finding Files to Update

### Search for JWT Payload Email References

Run these searches in your codebase:

```bash
# Search for user.email in API routes
grep -r "user\.email" src/app/api/

# Search for JWTPayload email references
grep -r "JWTPayload.*email" src/

# Search for files importing JWTPayload
grep -r "import.*JWTPayload" src/
```

### Common Files That Need Updates

1. **API Route Handlers**

   - Files in `src/app/api/*/route.ts`
   - Look for handlers using `createUserHandler`, `createAdminHandler`, etc.

2. **Middleware Files**

   - `src/lib/auth/api-middleware.ts`
   - `src/lib/auth/middleware.ts`

3. **Service Files**

   - Already updated: `src/lib/api/services/auth.service.ts`

4. **Type Definitions**
   - `src/types/index.ts` (if JWTPayload is exported there)

## API Route Examples

### Example 1: User Profile Update

```typescript
// src/app/api/user/profile/route.ts

import { createUserHandler } from "@/lib/auth/api-middleware";
import { AuthService } from "@/lib/api/services/auth.service";

export const GET = createUserHandler(async (request, user) => {
  // Fetch complete user data from database
  const userData = await AuthService.getUserById(user.userId);

  if (!userData) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  // Return full user profile
  return NextResponse.json({
    success: true,
    data: userData,
  });
});

export const PUT = createUserHandler(async (request, user) => {
  const updates = await request.json();

  // Update user profile in database
  const updatedUser = await AuthService.updateProfile(user.userId, updates);

  return NextResponse.json({
    success: true,
    data: updatedUser,
  });
});
```

### Example 2: Order Creation with Email Notification

```typescript
// src/app/api/orders/route.ts

import { createUserHandler } from "@/lib/auth/api-middleware";
import { AuthService } from "@/lib/api/services/auth.service";
import { emailService } from "@/lib/email/service";

export const POST = createUserHandler(async (request, user) => {
  const orderData = await request.json();

  // Fetch user data for email and other details
  const userData = await AuthService.getUserById(user.userId);

  if (!userData) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  // Create order
  const order = await createOrder({
    ...orderData,
    userId: user.userId,
    userEmail: userData.email, // Get email from database
    userName: userData.name,
  });

  // Send confirmation email
  await emailService.sendOrderConfirmation({
    to: userData.email!,
    orderDetails: order,
  });

  return NextResponse.json({
    success: true,
    data: order,
  });
});
```

### Example 3: Seller Store Settings

```typescript
// src/app/api/seller/store-settings/route.ts

import { createSellerHandler } from "@/lib/auth/api-middleware";
import { AuthService } from "@/lib/api/services/auth.service";
import { getAdminDb } from "@/lib/database/admin";

export const GET = createSellerHandler(async (request, user) => {
  const db = getAdminDb();
  const sellerId = user.userId; // Use userId directly

  // Fetch seller store settings
  const storeDoc = await db.collection("sellers").doc(sellerId).get();

  if (!storeDoc.exists) {
    return NextResponse.json(
      { success: false, error: "Store not found" },
      { status: 404 }
    );
  }

  // Optionally fetch user details for display
  const userData = await AuthService.getUserById(user.userId);

  return NextResponse.json({
    success: true,
    data: {
      store: storeDoc.data(),
      owner: {
        name: userData?.name,
        email: userData?.email,
      },
    },
  });
});
```

## Performance Considerations

### Caching User Data

Since we now fetch user data from the database more frequently, consider caching:

```typescript
// Simple in-memory cache (for single server)
const userCache = new Map<string, { data: User; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedUser(userId: string): Promise<User | null> {
  const cached = userCache.get(userId);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const userData = await AuthService.getUserById(userId);

  if (userData) {
    userCache.set(userId, {
      data: userData,
      timestamp: Date.now(),
    });
  }

  return userData;
}
```

### Selective Field Fetching

Only fetch the fields you need:

```typescript
// If you only need email
const userDoc = await db.collection("users").doc(user.userId).get();
const email = userDoc.data()?.email;

// Instead of fetching full user object
const userData = await AuthService.getUserById(user.userId);
```

## Testing Your Migration

### 1. TypeScript Compilation

```bash
npm run build
# or
npx tsc --noEmit
```

Look for errors like:

- `Property 'email' does not exist on type 'JWTPayload'`

### 2. Runtime Testing

Test each migrated route:

```typescript
// Test file: src/app/api/user/profile/route.test.ts

describe("User Profile API", () => {
  it("should return user profile without JWT email", async () => {
    const token = generateToken({ userId: "test-user-id", role: "user" });

    const response = await fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.email).toBeDefined(); // Email from database
    expect(data.data.userId).toBeDefined();
  });
});
```

### 3. Manual Testing Checklist

- [ ] Login works
- [ ] User profile loads correctly
- [ ] Email notifications are sent
- [ ] Orders can be created
- [ ] Admin functions work
- [ ] Seller dashboard loads

## Rollback Plan

If you need to rollback:

1. **Revert JWT Payload Changes**

```typescript
// src/lib/auth/jwt.ts
export interface JWTPayload {
  userId: string;
  email: string; // Add back
  role: "admin" | "seller" | "user";
  iat?: number;
  exp?: number;
}
```

2. **Revert Token Generation**

```typescript
// src/lib/api/services/auth.service.ts
const token = generateToken({
  userId: userDoc.id,
  email: userData.email, // Add back
  role: userData.role,
});
```

3. **Revert API Routes**

- Use git to revert changes: `git checkout HEAD -- src/app/api/`

## Benefits After Migration

✅ **Smaller JWT Tokens**

- Reduced size = faster transmission
- Less bandwidth usage

✅ **Better Security**

- Less PII in tokens
- Reduced risk if token is compromised

✅ **Easier Updates**

- User email changes don't require new token
- Profile updates reflected immediately

✅ **Cleaner Architecture**

- Single source of truth (database)
- JWT only for authentication, not data storage

## Common Pitfalls

### ❌ Pitfall 1: Forgetting Null Checks

```typescript
// Bad
const email = (await AuthService.getUserById(user.userId)).email;

// Good
const userData = await AuthService.getUserById(user.userId);
if (!userData?.email) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}
const email = userData.email;
```

### ❌ Pitfall 2: Multiple Database Calls

```typescript
// Bad - Multiple calls
const userData1 = await AuthService.getUserById(user.userId);
console.log(userData1.email);

const userData2 = await AuthService.getUserById(user.userId);
console.log(userData2.name);

// Good - Single call
const userData = await AuthService.getUserById(user.userId);
console.log(userData.email);
console.log(userData.name);
```

### ❌ Pitfall 3: Not Handling Errors

```typescript
// Bad
const userData = await AuthService.getUserById(user.userId);
const email = userData.email; // Might be null!

// Good
const userData = await AuthService.getUserById(user.userId);
if (!userData) {
  throw new Error("User not found");
}
const email = userData.email;
```

## Support

If you encounter issues during migration:

1. Check TypeScript errors first
2. Verify database connectivity
3. Test with a single route before migrating all
4. Use the rollback plan if needed
5. Refer to the main documentation

## Related Documentation

- [JWT Removal & Guest Persistence](./JWT_REMOVAL_AND_GUEST_PERSISTENCE.md)
- [Authentication Flow](../AUTH_STANDARDIZATION_COMPLETE.md)
- [API Guidelines](../architecture/API_REFACTORING_README.md)

---

**Migration Priority**: 🔴 High - Required for guest session persistence feature
**Estimated Time**: 2-4 hours depending on codebase size
**Complexity**: Medium - Straightforward find-and-replace with testing
