# Firebase Token Authentication Migration Guide

## Overview

This guide explains the standardization to use **Firebase ID tokens** as the single authentication method across the entire application.

## Changes Made

### 1. **API Client (`src/lib/api/client.ts`)**

- Removed JWT cookie dependencies
- Updated to automatically fetch and include Firebase ID tokens in all requests
- Simplified token management - no manual token setting required
- Authentication happens automatically via Firebase Auth

### 2. **Firebase Auth Helper (`src/lib/auth/firebase-api-auth.ts`)**

- Created handler wrappers that work with Firebase tokens:
  - `createFirebaseAdminHandler` - For admin-only endpoints
  - `createFirebaseSellerHandler` - For seller & admin endpoints
  - `createFirebaseUserHandler` - For all authenticated users
- These replace the JWT-based handlers from `api-middleware.ts`

### 3. **Authentication Flow**

```
Frontend (Client) → Firebase Auth → Get ID Token → API Request (Bearer Token) → Backend validates Firebase Token
```

## Migration Steps for API Routes

### Before (JWT Cookies):

```typescript
import { createSellerHandler } from "@/lib/auth/api-middleware";

export const GET = createSellerHandler(async (request: NextRequest, user) => {
  // user.userId available
});
```

### After (Firebase Tokens):

```typescript
import { createFirebaseSellerHandler } from "@/lib/auth/firebase-api-auth";

export const GET = createFirebaseSellerHandler(
  async (request: NextRequest, user) => {
    // user.uid available (instead of userId)
    // user.role, user.email, user.userData also available
  }
);
```

### Key Differences:

| JWT Middleware        | Firebase Auth                 |
| --------------------- | ----------------------------- |
| `user.userId`         | `user.uid`                    |
| `user.email`          | `user.email`                  |
| `user.role`           | `user.role`                   |
| Requires JWT cookie   | Requires Authorization header |
| `createAdminHandler`  | `createFirebaseAdminHandler`  |
| `createSellerHandler` | `createFirebaseSellerHandler` |
| `createUserHandler`   | `createFirebaseUserHandler`   |

## Migration Steps for Frontend Services

### Before (Manual headers with credentials):

```typescript
const response = await fetch("/api/seller/stats", {
  credentials: "include", // Sends cookies
});
```

### After (Using API Client):

```typescript
import { apiClient } from "@/lib/api/client";

const stats = await apiClient.get("/seller/stats");
// API client automatically adds Firebase token
```

## Cookie Usage

Cookies are now **only used for non-authentication purposes**:

- Cookie consent tracking
- User preferences (theme, language)
- Analytics opt-in/out
- Session preferences

**NOT used for:**

- ❌ Authentication tokens
- ❌ User session management
- ❌ Authorization

## Files That Need Migration

### API Routes (Replace handlers):

- `src/app/api/admin/**/*.ts` - Use `createFirebaseAdminHandler`
- `src/app/api/seller/**/*.ts` - Use `createFirebaseSellerHandler`
- `src/app/api/user/**/*.ts` - Use `createFirebaseUserHandler`

### Services (Use apiClient):

- `src/lib/services/admin.service.ts`
- `src/lib/services/seller.service.ts`
- Any service making API calls

### Components (Use apiClient):

- Components making direct `fetch` calls
- Replace with `apiClient.get/post/put/delete`

## Benefits

✅ **Single Source of Truth**: Firebase Auth is the only auth system  
✅ **Better Security**: Firebase tokens are short-lived and auto-refresh  
✅ **Simpler Code**: No manual token management  
✅ **Type Safety**: Consistent user object across all handlers  
✅ **Better Testing**: Easier to mock Firebase auth  
✅ **No Cookie Issues**: Avoid CORS, SameSite, and cookie limitations

## Cookie Consent Implementation

For cookie consent, create a separate system:

```typescript
// src/lib/utils/cookies.ts
export const cookieConsent = {
  hasConsent: () => localStorage.getItem("cookieConsent") === "true",
  setConsent: (consent: boolean) =>
    localStorage.setItem("cookieConsent", String(consent)),

  // Only set non-auth cookies after consent
  setPreference: (key: string, value: string) => {
    if (cookieConsent.hasConsent()) {
      document.cookie = `${key}=${value}; path=/; max-age=31536000`;
    }
  },
};
```

## Testing

After migration, test:

1. Login/logout flows
2. Protected routes (admin, seller, user)
3. API requests with and without auth
4. Token expiration handling
5. Unauthorized access attempts

## Rollback Plan

If issues occur:

1. Keep old `api-middleware.ts` file
2. Can switch routes back individually
3. Both systems can coexist temporarily during migration

## Support

For questions or issues during migration, refer to:

- Firebase Auth Documentation
- `src/lib/auth/firebase-api-auth.ts` source code
- `src/lib/api/client.ts` source code
