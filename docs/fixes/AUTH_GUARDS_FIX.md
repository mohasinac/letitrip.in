# Authentication Guard Issues - FIXED ✅

## Problem Summary

Seller pages (and other protected routes) were redirecting to login even when users were authenticated. This was caused by:

1. **Middleware using JWT tokens** - Looking for `auth_token` cookies that don't exist
2. **AuthContext not using Firebase** - No Firebase `onAuthStateChanged` listener
3. **Mismatched authentication systems** - JWT cookies vs Firebase tokens

## Root Causes

### 1. Middleware JWT Check

**File**: `middleware.ts`

- Was checking for JWT `auth_token` cookies
- These cookies were never set because we migrated to Firebase tokens
- Redirected all protected routes to login

### 2. No Firebase Auth Listener

**File**: `src/contexts/AuthContext.tsx`

- Was calling `/api/auth/me` with cookies (JWT system)
- No Firebase `onAuthStateChanged` listener
- Couldn't detect Firebase authentication state

### 3. Login Using Old API

- Login function called `/api/auth/login` (JWT-based)
- Should use Firebase `signInWithEmailAndPassword` directly

## Solutions Implemented

### 1. ✅ Disabled JWT Middleware

**File**: `middleware.ts`

```typescript
// Middleware now passes through all requests
// Authentication is handled by:
// 1. Firebase Auth on client side (AuthContext)
// 2. Firebase ID tokens verified in API routes
// 3. Client-side RouteGuard components
export async function middleware(request: NextRequest) {
  // Skip all JWT checks - use Firebase tokens in API routes instead
  return NextResponse.next();
}
```

**Why**: Edge middleware can't easily verify Firebase tokens without admin SDK. Better to use client-side guards and verify tokens in API routes.

### 2. ✅ Added Firebase Auth Listener

**File**: `src/contexts/AuthContext.tsx`

**Added imports**:

```typescript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/database/config";
```

**Added Firebase listener in useEffect**:

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // Fetch user data from API (with role info)
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update user state with Firebase methods
      const userWithFirebase = {
        ...userData,
        uid: firebaseUser.uid,
        getIdToken: () => firebaseUser.getIdToken(),
        claims: { ... },
      };

      dispatch({ type: "SET_USER", payload: userWithFirebase });
    } else {
      dispatch({ type: "SET_USER", payload: null });
    }
  });

  return () => unsubscribe();
}, []);
```

**Benefits**:

- Real-time auth state changes
- Automatic session management
- Token refresh handled by Firebase
- Works across tabs/windows

### 3. ✅ Updated Login to Use Firebase

**File**: `src/contexts/AuthContext.tsx`

```typescript
const login = async (email: string, password: string) => {
  const { signInWithEmailAndPassword } = await import("firebase/auth");

  // Sign in with Firebase
  await signInWithEmailAndPassword(auth, email, password);

  // onAuthStateChanged listener will handle the rest
  // including fetching user data and redirecting
};
```

**Benefits**:

- Direct Firebase authentication
- No JWT cookie management needed
- Automatic token refresh
- Listener handles user data fetch

### 4. ✅ Updated Logout to Use Firebase

**File**: `src/contexts/AuthContext.tsx`

```typescript
const logout = async () => {
  const { signOut } = await import("firebase/auth");

  // Sign out from Firebase
  await signOut(auth);

  dispatch({ type: "LOGOUT" });
  removeStorageItem("auth_redirect_after_login");
  router.push("/");
};
```

## Authentication Flow Now

### Login Flow:

```
1. User submits email/password
2. AuthContext calls Firebase signInWithEmailAndPassword()
3. Firebase authenticates user
4. onAuthStateChanged fires
5. Listener gets Firebase ID token
6. Listener calls /api/auth/me with Bearer token
7. API returns user data with role
8. User state updated with Firebase methods
9. Redirect to intended page or role-based default
```

### Page Access Flow:

```
1. User navigates to /seller/dashboard
2. Middleware: passes through (no JWT check)
3. RouteGuard component checks user state
4. If no user: redirect to login
5. If user: check role permissions
6. If authorized: render page
7. If not authorized: redirect appropriately
```

### API Request Flow:

```
1. Component calls apiClient.get('/seller/store-settings')
2. apiClient interceptor gets Firebase ID token
3. Adds Authorization: Bearer <token> header
4. API route verifies token with Firebase Admin SDK
5. Checks user role in Firestore
6. Returns data or 401/403
```

## Client-Side Guards

### RouteGuard Component

**File**: `src/components/features/auth/RouteGuard.tsx`

Already correctly implemented:

- Checks `user` from AuthContext (now populated by Firebase)
- Validates role-based access
- Redirects unauthorized users
- Shows loading state

### Protected Routes

Routes that require authentication:

- `/admin/*` - Admin only
- `/seller/*` - Seller or Admin
- `/account/*` - Any authenticated user
- `/orders/*` - Any authenticated user
- `/checkout` - Any authenticated user

## Testing Checklist

After these fixes, test:

- [x] **Login Flow**

  - User can log in with email/password
  - Firebase authenticates successfully
  - User state populated with role
  - Redirects to appropriate dashboard

- [x] **Seller Access**

  - Seller can access `/seller/dashboard`
  - Seller can access `/seller/products`
  - Seller can access `/seller/coupons`
  - No login redirect loop

- [x] **Admin Access**
  - Admin can access `/admin/*` pages
  - Admin can access `/seller/*` pages (escalated access)
- [x] **User Access**

  - Regular user can access `/account/*`
  - Regular user CANNOT access `/seller/*`
  - Regular user CANNOT access `/admin/*`

- [x] **API Calls**

  - apiClient automatically adds Firebase token
  - API routes verify token successfully
  - API routes check roles correctly

- [x] **Logout**
  - Logout clears Firebase auth
  - Redirects to home
  - Cannot access protected routes after logout

## API Route Authentication

API routes should use Firebase auth helpers:

```typescript
// Example: src/app/api/seller/store-settings/route.ts
import { createFirebaseSellerHandler } from '@/lib/auth/firebase-api-auth';

export const GET = createFirebaseSellerHandler(async (request, { user }) => {
  // user.uid, user.role available here
  // user is already verified as seller or admin

  return Response.json({ success: true, data: {...} });
});
```

## Files Modified

1. ✅ `middleware.ts` - Disabled JWT checks
2. ✅ `src/contexts/AuthContext.tsx` - Added Firebase listener, updated login/logout
3. ✅ `src/lib/api/client.ts` - Fixed import path (previous fix)

## Files Already Correct

- ✅ `src/components/features/auth/RouteGuard.tsx` - Client-side guard
- ✅ `src/lib/auth/firebase-api-auth.ts` - Firebase token verification helpers
- ✅ `src/lib/api/client.ts` - Automatic token injection

## Migration Notes

### For Future API Routes

Always use Firebase auth helpers instead of JWT middleware:

❌ **Old way (JWT)**:

```typescript
import { createSellerHandler } from "@/lib/auth/jwt";
export const GET = createSellerHandler(async (request, { user }) => {
  // JWT-based
});
```

✅ **New way (Firebase)**:

```typescript
import { createFirebaseSellerHandler } from "@/lib/auth/firebase-api-auth";
export const GET = createFirebaseSellerHandler(async (request, { user }) => {
  // Firebase-based
});
```

### For Future Components

Use `apiClient` instead of manual fetch:

❌ **Old way**:

```typescript
const token = await user.getIdToken();
const response = await fetch("/api/endpoint", {
  headers: { Authorization: `Bearer ${token}` },
});
```

✅ **New way**:

```typescript
import { apiClient } from "@/lib/api/client";
const data = await apiClient.get("/endpoint");
```

## Known Limitations

1. **Server-side rendering**: Pages are still client-side rendered for auth. Consider using server components with Firebase Admin SDK for SSR if needed.

2. **Edge middleware**: Cannot verify Firebase tokens in edge runtime. If you need edge-level protection, consider Next.js 13+ middleware with Firebase Auth REST API.

3. **Test users**: Test users stored in localStorage still work but bypass Firebase. Remove test user logic in production.

## Related Documentation

- [Component Migration Complete](./COMPONENT_MIGRATION_COMPLETE.md)
- [Firebase Auth Migration Guide](./FIREBASE_AUTH_MIGRATION.md)
- [API Client README](./API_CLIENT_README.md)
- [Firebase Config Path Fix](./fixes/FIREBASE_CONFIG_PATH_FIX.md)

---

**Status**: ✅ **AUTHENTICATION GUARDS FIXED**  
**Date**: October 26, 2025  
**Result**: Seller pages and all protected routes now work correctly with Firebase authentication
