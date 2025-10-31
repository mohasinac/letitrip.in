# Authentication Fix Documentation

## Problem Summary

**Issue**: API routes were returning "Authentication required" (401) errors even when users were logged in.

**Root Cause**: Frontend components were making API calls without including Firebase authentication tokens in the request headers.

## Solution

### 1. Updated API Utility Library (`src/lib/api/seller.ts`)

Created centralized authentication helpers that automatically attach Firebase ID tokens to all API requests:

#### **`fetchWithAuth(url, options)`**

- Automatically gets current user from Firebase Auth
- Retrieves fresh ID token
- Adds `Authorization: Bearer <token>` header
- Handles both JSON and FormData requests

#### **`uploadWithAuth(url, formData)`**

- Specialized helper for file uploads
- Automatically adds auth token to multipart/form-data requests
- Prevents Content-Type override (lets browser set boundary)

#### **Helper Functions**

- `apiGet<T>(url)` - GET requests with auth
- `apiPost<T>(url, data)` - POST requests with auth
- `apiPut<T>(url, data)` - PUT requests with auth
- `apiDelete<T>(url)` - DELETE requests with auth

### 2. Fixed Components

#### **ProfilePictureUpload** (`src/components/profile/ProfilePictureUpload.tsx`)

**Before:**

```typescript
const response = await fetch("/api/storage/upload", {
  method: "POST",
  body: formData,
  credentials: "include", // ❌ Old JWT cookie auth
});
```

**After:**

```typescript
import { uploadWithAuth } from "@/lib/api/seller";

const response = await uploadWithAuth("/api/storage/upload", formData);
// ✅ Automatically includes Firebase auth token
```

#### **Seller Coupon Pages**

- **Coupons List** (`src/app/seller/coupons/page.tsx`)
  - Uses `apiGet()` for fetching coupons
  - Uses `apiPost()` for toggling status
  - Uses `apiDelete()` for deleting coupons

- **Coupon Form** (`src/app/seller/coupons/new/page.tsx`)
  - Uses `apiPost()` for creating coupons
  - Includes proper error handling and loading states

### 3. Backend API Routes (Already Correct)

All seller API routes already had proper Firebase token verification:

```typescript
// Example from src/app/api/seller/coupons/route.ts
const authHeader = request.headers.get("authorization");
if (!authHeader?.startsWith("Bearer ")) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const token = authHeader.split("Bearer ")[1];
const adminAuth = getAdminAuth();
const decodedToken = await adminAuth.verifyIdToken(token);
```

## Authentication Flow

```
┌─────────────┐     1. User Action      ┌──────────────────┐
│   Client    │ ───────────────────────> │  React Component │
│  (Browser)  │                          └──────────────────┘
└─────────────┘                                    │
                                                   │ 2. Call API Helper
                                                   ▼
                                          ┌──────────────────┐
                                          │  fetchWithAuth() │
                                          │  or              │
                                          │  uploadWithAuth()│
                                          └──────────────────┘
                                                   │
                          3. Get Firebase Token    │
                          auth.currentUser         │
                          .getIdToken()            │
                                                   ▼
┌─────────────┐     4. API Request       ┌──────────────────┐
│   Client    │ ───────────────────────> │   Next.js API    │
│  (Browser)  │  Authorization: Bearer   │      Route       │
└─────────────┘        <token>           └──────────────────┘
                                                   │
                          5. Verify Token          │
                          adminAuth                │
                          .verifyIdToken()         │
                                                   ▼
┌─────────────┐     6. Response          ┌──────────────────┐
│   Client    │ <─────────────────────── │   Firebase       │
│  (Browser)  │    200 OK or 401         │   Admin SDK      │
└─────────────┘                          └──────────────────┘
```

## Migration Guide for Other Components

If you find components making direct `fetch()` calls to API routes:

### For JSON API Calls:

**Before:**

```typescript
const response = await fetch("/api/some-endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

**After:**

```typescript
import { apiPost } from "@/lib/api/seller";

const response = await apiPost("/api/some-endpoint", data);
```

### For File Uploads:

**Before:**

```typescript
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

**After:**

```typescript
import { uploadWithAuth } from "@/lib/api/seller";

const formData = new FormData();
formData.append("file", file);

const response = await uploadWithAuth("/api/upload", formData);
```

## Components Still Using Direct Fetch (To Be Updated)

These components should be updated to use the new auth helpers:

1. `src/contexts/ModernThemeContext.tsx` - Theme settings API
2. `src/app/profile/page.tsx` - Password change, account updates
3. `src/components/admin/*` - Various admin components
4. `src/components/home/*` - Hero banner API calls

## Testing Checklist

- [x] Profile picture upload works when logged in
- [x] Profile picture upload fails with clear error when not logged in
- [x] Coupon creation saves to database
- [x] Coupon list fetches from database
- [x] Coupon toggle/delete works
- [ ] Other admin API calls (to be tested after migration)

## Security Improvements

1. **Token-based auth**: More secure than cookie-based sessions
2. **Fresh tokens**: `getIdToken()` automatically refreshes expired tokens
3. **No CSRF vulnerabilities**: Tokens can't be stolen via CSRF attacks
4. **Role verification**: Backend checks user role from Firestore
5. **Ownership checks**: APIs verify user owns the resources they're accessing

## Common Errors & Solutions

### Error: "User not authenticated"

**Solution**: User needs to log in. Check `auth.currentUser` is not null.

### Error: "Authentication required" (401)

**Solution**: Token is missing or invalid. Make sure to use `fetchWithAuth()` or `uploadWithAuth()`.

### Error: "Forbidden: Seller access required" (403)

**Solution**: User doesn't have seller/admin role. Check role in Firestore users collection.

### Error: Token expired

**Solution**: Firebase automatically handles token refresh. If this persists, user needs to re-login.

## Environment Variables Required

```env
# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client (Browser-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Next Steps

1. ✅ Fix profile picture upload (DONE)
2. ✅ Fix seller coupon APIs (DONE)
3. 🔄 Migrate other admin components to use new auth helpers
4. 🔄 Add similar helpers for admin-specific APIs
5. 🔄 Remove old JWT cookie-based auth code
6. 🔄 Update all existing fetch() calls across the codebase

---

**Last Updated**: October 31, 2025
**Status**: Phase 2 Authentication - Complete ✅
