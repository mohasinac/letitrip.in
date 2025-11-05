# 📚 Constants Reference Guide

## Overview

All application constants are centralized in `src/constants/` for better maintainability, consistency, and type safety.

---

## 📁 File Structure

```
src/constants/
├── index.ts           # Central export point
├── app.ts            # Application-wide constants ⭐
├── api-routes.ts     # API endpoint definitions
├── routes.ts         # Frontend route paths
├── navigation.ts     # Navigation menu items
├── business.ts       # Business/domain constants
├── beyblades.ts      # Game-specific constants
└── homepage.ts       # Homepage content
```

---

## 🔑 Key Constants (app.ts)

### Authentication & Session

```typescript
import { AUTH_CONSTANTS } from "@/constants/app";

// Cookie Names
AUTH_CONSTANTS.SESSION_COOKIE_NAME; // "session"
AUTH_CONSTANTS.AUTH_TOKEN_COOKIE; // "auth_token"
AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE; // "refresh_token"

// Session Duration
AUTH_CONSTANTS.SESSION_MAX_AGE; // 604800 seconds (7 days)
AUTH_CONSTANTS.SESSION_DURATION_DAYS; // 7 days
AUTH_CONSTANTS.REFRESH_TOKEN_DURATION_DAYS; // 90 days

// Cache Settings
AUTH_CONSTANTS.CACHE_TTL_MS; // 5 minutes
AUTH_CONSTANTS.SESSION_ACTIVITY_UPDATE_THRESHOLD_MS; // 5 minutes
AUTH_CONSTANTS.CACHE_CLEANUP_INTERVAL_MS; // 1 minute

// Session Cleanup
AUTH_CONSTANTS.EXPIRED_SESSION_CLEANUP_LIMIT; // 500
AUTH_CONSTANTS.ACTIVE_SESSION_QUERY_LIMIT; // 1000
AUTH_CONSTANTS.RECENT_ACTIVITY_THRESHOLD_MS; // 30 minutes
```

### Storage & Upload

```typescript
import { STORAGE_CONSTANTS } from "@/constants/app";

// File Size Limits
STORAGE_CONSTANTS.MAX_FILE_SIZE_MB; // 10 MB
STORAGE_CONSTANTS.MAX_FILE_SIZE_BYTES; // 10485760 bytes
STORAGE_CONSTANTS.MAX_VIDEO_SIZE_MB; // 50 MB
STORAGE_CONSTANTS.MAX_VIDEO_SIZE_BYTES; // 52428800 bytes

// Allowed File Types
STORAGE_CONSTANTS.ALLOWED_IMAGE_TYPES; // ["image/jpeg", "image/png", "image/gif", "image/webp"]
STORAGE_CONSTANTS.ALLOWED_VIDEO_TYPES; // ["video/mp4", "video/webm", "video/quicktime"]

// Storage Folders
STORAGE_CONSTANTS.STORAGE_FOLDERS.PRODUCTS; // "products"
STORAGE_CONSTANTS.STORAGE_FOLDERS.CATEGORIES; // "categories"
STORAGE_CONSTANTS.STORAGE_FOLDERS.USERS; // "users"
STORAGE_CONSTANTS.STORAGE_FOLDERS.UPLOADS; // "uploads"
STORAGE_CONSTANTS.STORAGE_FOLDERS.THUMBNAILS; // "thumbnails"

// Cache Duration
STORAGE_CONSTANTS.CACHE_DURATION_SECONDS.IMAGES; // 86400 (24 hours)
STORAGE_CONSTANTS.CACHE_DURATION_SECONDS.THUMBNAILS; // 604800 (7 days)
STORAGE_CONSTANTS.CACHE_DURATION_MS.IMAGES; // 86400000 ms
```

### Database Collections

```typescript
import { DATABASE_CONSTANTS } from "@/constants/app";

// Firestore Collections
DATABASE_CONSTANTS.COLLECTIONS.USERS; // "users"
DATABASE_CONSTANTS.COLLECTIONS.SESSIONS; // "sessions"
DATABASE_CONSTANTS.COLLECTIONS.PRODUCTS; // "products"
DATABASE_CONSTANTS.COLLECTIONS.ORDERS; // "orders"
DATABASE_CONSTANTS.COLLECTIONS.CATEGORIES; // "categories"
DATABASE_CONSTANTS.COLLECTIONS.CARTS; // "carts"
DATABASE_CONSTANTS.COLLECTIONS.REVIEWS; // "reviews"
DATABASE_CONSTANTS.COLLECTIONS.ADDRESSES; // "addresses"
DATABASE_CONSTANTS.COLLECTIONS.SHIPMENTS; // "shipments"
DATABASE_CONSTANTS.COLLECTIONS.COUPONS; // "coupons"
DATABASE_CONSTANTS.COLLECTIONS.SALES; // "sales"
DATABASE_CONSTANTS.COLLECTIONS.NOTIFICATIONS; // "notifications"
DATABASE_CONSTANTS.COLLECTIONS.ALERTS; // "alerts"

// Query Settings
DATABASE_CONSTANTS.BATCH_SIZE; // 500
DATABASE_CONSTANTS.QUERY_TIMEOUT_MS; // 30000
DATABASE_CONSTANTS.DEFAULT_PAGE_LIMIT; // 20
DATABASE_CONSTANTS.MAX_PAGE_LIMIT; // 100
```

### UI & UX

```typescript
import { UI_CONSTANTS } from "@/constants/app";

// Pagination
UI_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE; // 20
UI_CONSTANTS.PAGINATION.MAX_PAGE_SIZE; // 100
UI_CONSTANTS.PAGINATION.MIN_PAGE_SIZE; // 10

// Timing
UI_CONSTANTS.TOAST_DURATION_MS; // 3000 (3 seconds)
UI_CONSTANTS.DEBOUNCE_DELAY_MS; // 300 ms
UI_CONSTANTS.POLLING_INTERVAL_MS; // 5000 (5 seconds)
UI_CONSTANTS.ANIMATION_DURATION_MS; // 200 ms
UI_CONSTANTS.MODAL_TRANSITION_MS; // 150 ms
```

### User Roles

```typescript
import { ROLE_CONSTANTS } from "@/constants/app";

// Role Values
ROLE_CONSTANTS.ROLES.ADMIN; // "admin"
ROLE_CONSTANTS.ROLES.SELLER; // "seller"
ROLE_CONSTANTS.ROLES.USER; // "user"
ROLE_CONSTANTS.ROLES.GUEST; // "guest"

// Permissions (per role)
ROLE_CONSTANTS.PERMISSIONS.admin; // Array of admin permissions
ROLE_CONSTANTS.PERMISSIONS.seller; // Array of seller permissions
ROLE_CONSTANTS.PERMISSIONS.user; // Array of user permissions
ROLE_CONSTANTS.PERMISSIONS.guest; // Array of guest permissions
```

### HTTP Status Codes

```typescript
import { HTTP_STATUS } from "@/constants/app";

HTTP_STATUS.OK; // 200
HTTP_STATUS.CREATED; // 201
HTTP_STATUS.NO_CONTENT; // 204
HTTP_STATUS.BAD_REQUEST; // 400
HTTP_STATUS.UNAUTHORIZED; // 401
HTTP_STATUS.FORBIDDEN; // 403
HTTP_STATUS.NOT_FOUND; // 404
HTTP_STATUS.CONFLICT; // 409
HTTP_STATUS.UNPROCESSABLE_ENTITY; // 422
HTTP_STATUS.TOO_MANY_REQUESTS; // 429
HTTP_STATUS.INTERNAL_SERVER_ERROR; // 500
HTTP_STATUS.SERVICE_UNAVAILABLE; // 503
```

### Validation Constants

```typescript
import { VALIDATION_CONSTANTS } from "@/constants/app";

// Password
VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH; // 8
VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH; // 128

// Username & Names
VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH; // 3
VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH; // 30
VALIDATION_CONSTANTS.MIN_NAME_LENGTH; // 2
VALIDATION_CONSTANTS.MAX_NAME_LENGTH; // 100

// Other Fields
VALIDATION_CONSTANTS.MAX_EMAIL_LENGTH; // 255
VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH; // 5000
VALIDATION_CONSTANTS.MAX_TITLE_LENGTH; // 200

// Numeric Limits
VALIDATION_CONSTANTS.MIN_PRICE; // 0
VALIDATION_CONSTANTS.MAX_PRICE; // 999999999
VALIDATION_CONSTANTS.MAX_QUANTITY; // 999999
```

### Error & Success Messages

```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/app";

// Error Messages
ERROR_MESSAGES.AUTH.REQUIRED; // "Authentication required"
ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS; // "Invalid email or password"
ERROR_MESSAGES.STORAGE.FILE_TOO_LARGE; // "File size exceeds limit"
ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD; // "This field is required"
ERROR_MESSAGES.GENERAL.SERVER_ERROR; // "Server error occurred"

// Success Messages
SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS; // "Logged in successfully"
SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS; // "Registration successful"
SUCCESS_MESSAGES.GENERAL.SAVED; // "Saved successfully"
SUCCESS_MESSAGES.STORAGE.UPLOADED; // "File uploaded successfully"
```

---

## 🎯 Usage Examples

### Backend (Session Management)

```typescript
// src/app/(backend)/api/_lib/auth/session-store.ts
import { AUTH_CONSTANTS, DATABASE_CONSTANTS } from "@/constants/app";

export const SESSION_COOKIE_NAME = AUTH_CONSTANTS.SESSION_COOKIE_NAME;
export const SESSION_MAX_AGE = AUTH_CONSTANTS.SESSION_MAX_AGE;

function getSessionsCollection() {
  const db = getAdminDb();
  return db.collection(DATABASE_CONSTANTS.COLLECTIONS.SESSIONS);
}

const CACHE_TTL = AUTH_CONSTANTS.CACHE_TTL_MS;
```

### Backend (JWT Auth)

```typescript
// src/app/(backend)/api/_lib/auth/jwt.ts
import { AUTH_CONSTANTS } from "@/constants/app";

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_CONSTANTS.AUTH_TOKEN_COOKIE, token, {
    httpOnly: true,
    maxAge: AUTH_CONSTANTS.SESSION_MAX_AGE,
    // ...other options
  });
}
```

### Backend (Cookie Management)

```typescript
// src/app/(backend)/api/_lib/auth/cookies.ts
import { AUTH_CONSTANTS } from "@/constants/app";

class AuthCookieManager {
  private readonly AUTH_TOKEN_KEY = AUTH_CONSTANTS.AUTH_TOKEN_COOKIE;
  private readonly REFRESH_TOKEN_KEY = AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE;

  private readonly defaultOptions: CookieOptions = {
    expires: AUTH_CONSTANTS.SESSION_DURATION_DAYS,
    // ...
  };
}
```

### API Response with HTTP Status

```typescript
import { HTTP_STATUS, ERROR_MESSAGES } from "@/constants/app";

export async function POST(request: Request) {
  try {
    // ... business logic
    return NextResponse.json(
      { success: true },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERAL.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
```

### Role-Based Access Control

```typescript
import { ROLE_CONSTANTS } from "@/constants/app";

export interface SessionData {
  userId: string;
  email: string;
  role:
    | typeof ROLE_CONSTANTS.ROLES.ADMIN
    | typeof ROLE_CONSTANTS.ROLES.SELLER
    | typeof ROLE_CONSTANTS.ROLES.USER;
}

// Or using the exported type
import type { UserRole } from "@/constants/app";

export interface User {
  id: string;
  role: UserRole; // "admin" | "seller" | "user" | "guest"
}
```

### File Validation

```typescript
import { STORAGE_CONSTANTS, ERROR_MESSAGES } from "@/constants/app";

function validateFile(file: File) {
  // Check file size
  if (file.size > STORAGE_CONSTANTS.MAX_FILE_SIZE_BYTES) {
    throw new Error(ERROR_MESSAGES.STORAGE.FILE_TOO_LARGE);
  }

  // Check file type
  if (!STORAGE_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(ERROR_MESSAGES.STORAGE.INVALID_TYPE);
  }
}
```

---

## 📦 Type Exports

### UserRole Type

```typescript
import type { UserRole } from "@/constants/app";

const role: UserRole = "admin"; // ✅ Type-safe
const invalidRole: UserRole = "moderator"; // ❌ Type error
```

### HttpStatusCode Type

```typescript
import type { HttpStatusCode } from "@/constants/app";

const statusCode: HttpStatusCode = 200; // ✅ Type-safe
```

---

## ✅ Benefits

1. **Single Source of Truth** - All constants defined in one place
2. **Type Safety** - TypeScript types exported for compile-time checking
3. **Easy Updates** - Change once, update everywhere
4. **Consistency** - Same values used across frontend and backend
5. **Documentation** - Self-documenting with clear naming
6. **No Magic Numbers** - All hardcoded values replaced with named constants
7. **Better IDE Support** - Autocomplete and IntelliSense

---

## 🔄 Migration from Hardcoded Values

### Before ❌

```typescript
const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

cookieStore.set("auth_token", token, {
  maxAge: 60 * 60 * 24 * 7,
});

db.collection("sessions").where("expiresAt", "<", now).limit(500);
```

### After ✅

```typescript
import { AUTH_CONSTANTS, DATABASE_CONSTANTS } from "@/constants/app";

const SESSION_COOKIE_NAME = AUTH_CONSTANTS.SESSION_COOKIE_NAME;
const SESSION_MAX_AGE = AUTH_CONSTANTS.SESSION_MAX_AGE;
const CACHE_TTL = AUTH_CONSTANTS.CACHE_TTL_MS;

cookieStore.set(AUTH_CONSTANTS.AUTH_TOKEN_COOKIE, token, {
  maxAge: AUTH_CONSTANTS.SESSION_MAX_AGE,
});

db.collection(DATABASE_CONSTANTS.COLLECTIONS.SESSIONS)
  .where("expiresAt", "<", now)
  .limit(AUTH_CONSTANTS.EXPIRED_SESSION_CLEANUP_LIMIT);
```

---

## 📝 Adding New Constants

### Step 1: Add to app.ts

```typescript
// src/constants/app.ts
export const NEW_FEATURE_CONSTANTS = {
  SETTING_NAME: "value",
  TIMEOUT_MS: 5000,
  MAX_RETRIES: 3,
} as const;
```

### Step 2: Export from index.ts

```typescript
// src/constants/index.ts
export * from "./app";
```

### Step 3: Use in your code

```typescript
import { NEW_FEATURE_CONSTANTS } from "@/constants/app";

const timeout = NEW_FEATURE_CONSTANTS.TIMEOUT_MS;
```

---

## 🎨 Best Practices

1. **Always import from `@/constants/app`** - Don't redefine constants
2. **Use `as const`** - For readonly type inference
3. **Group related constants** - Keep similar constants together
4. **Use descriptive names** - Make intent clear
5. **Add comments** - Explain the purpose and usage
6. **Export types** - Create TypeScript types from constants
7. **Document changes** - Update this reference guide

---

## 📞 Support

For questions about constants:

1. Check this reference guide
2. See `src/constants/app.ts` for full definitions
3. Search for usage examples in the codebase

---

**Last Updated:** November 5, 2025  
**Version:** 2.0.0  
**Status:** ✅ Enhanced with comprehensive constants
