# Middleware Batch 3 Fixes - December 10, 2024

## Summary

Fixed 4 bugs in Batch 3 middleware files (rbac-auth.ts and withRouteRateLimit.ts).

## Files Fixed

1. `src/app/api/middleware/rbac-auth.ts`
2. `src/app/api/middleware/withRouteRateLimit.ts`

---

## Bug #1: Missing Error Handling in getUserFromRequest() - CRITICAL ✅

**File**: `src/app/api/middleware/rbac-auth.ts`  
**Lines**: 22-74 (entire function)  
**Severity**: CRITICAL  
**Risk**: Could crash routes on Firebase failures

### Issue

No try-catch around Firebase token verification or Firestore queries. Uncaught exceptions would crash the entire route handler.

### Before

```typescript
export async function getUserFromRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  // Try Authorization header first (for API calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token) {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token); // Could throw

      const db = getFirestoreAdmin();
      const userDoc = await db
        .collection(COLLECTIONS.USERS)
        .doc(decodedToken.uid)
        .get(); // Could throw
      // ...
    }
  }

  // Fallback to session
  const { getSessionToken, verifySession } = await import("../lib/session");
  const sessionToken = getSessionToken(request);

  if (sessionToken) {
    const session = await verifySession(sessionToken); // Could throw
    // ...
  }

  return null;
}
```

### After

```typescript
export async function getUserFromRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    // Try Authorization header first (for API calls)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token) {
        try {
          const auth = getAuth();
          const decodedToken = await auth.verifyIdToken(token);

          const db = getFirestoreAdmin();
          const userDoc = await db
            .collection(COLLECTIONS.USERS)
            .doc(decodedToken.uid)
            .get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            return {
              uid: decodedToken.uid,
              email: decodedToken.email || userData?.email || "",
              role: (userData?.role as UserRole) || "user",
              shopId: userData?.shopId,
            };
          }
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      }
    }

    // Try session cookie (for server-side rendering)
    const { getSessionToken, verifySession } = await import("../lib/session");
    const sessionToken = getSessionToken(request);

    if (sessionToken) {
      const session = await verifySession(sessionToken);
      if (session) {
        return {
          uid: session.userId,
          email: session.email || "",
          role: session.role as UserRole,
          shopId: (session as any).shopId,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting user from request:", error);
    return null;
  }
}
```

### Impact

- ✅ Prevents route crashes on Firebase errors
- ✅ Gracefully falls back to session on token errors
- ✅ Logs errors for debugging
- ✅ Returns null instead of throwing (caller handles authentication failure properly)

---

## Bug #2: Missing Request Context in Error Responses - MEDIUM ✅

**File**: `src/app/api/middleware/rbac-auth.ts`  
**Lines**: Multiple error responses throughout  
**Severity**: MEDIUM  
**Risk**: Hard to debug authorization failures in production

### Issue

Error responses didn't include request context (path, method, required roles, etc.) making it difficult to correlate logs and debug authorization issues.

### Fixed Functions

1. `requireAuth()` - lines 82-107
2. `requireRole()` - lines 122-144
3. `requireOwnership()` - lines 197-217
4. `requireShopOwnership()` - lines 243-263

### Example Fix (requireAuth)

**Before**:

```typescript
if (!user) {
  return {
    error: NextResponse.json(
      errorToJson(new UnauthorizedError("Authentication required")),
      { status: 401 }
    ),
  };
}
```

**After**:

```typescript
if (!user) {
  const requestContext = {
    path: request.nextUrl.pathname,
    method: request.method,
  };

  return {
    error: NextResponse.json(
      errorToJson(
        new UnauthorizedError("Authentication required"),
        requestContext
      ),
      { status: 401 }
    ),
  };
}
```

### Example Fix (requireRole)

**After**:

```typescript
if (!hasAnyRole(user, roles)) {
  const requestContext = {
    path: request.nextUrl.pathname,
    method: request.method,
    requiredRoles: roles,
    userRole: user.role,
  };

  return {
    error: NextResponse.json(
      errorToJson(
        new ForbiddenError(
          `This action requires one of the following roles: ${roles.join(", ")}`
        ),
        requestContext
      ),
      { status: 403 }
    ),
  };
}
```

### Impact

- ✅ Error logs now include request path and method
- ✅ Authorization errors include required vs actual roles
- ✅ Ownership errors include resource IDs for debugging
- ✅ Makes production troubleshooting much easier

---

## Bug #3: Hard-coded Rate Limit Values - MEDIUM ✅

**File**: `src/app/api/middleware/withRouteRateLimit.ts`  
**Lines**: 6-25 (config definitions)  
**Severity**: MEDIUM  
**Risk**: Requires code deploy to adjust rate limits in production

### Issue

All rate limit values were hard-coded, making it impossible to adjust limits without deploying new code.

### Before

```typescript
const routeRateLimitConfig: Array<{
  test: (url: URL) => boolean;
  config: { maxRequests?: number; windowMs?: number; message?: string };
}> = [
  {
    test: (url) => /\/api\/orders\/[^/]+\/invoice$/.test(url.pathname),
    config: { maxRequests: 20, windowMs: 60 * 1000 },
  },
  {
    test: (url) => /\/api\/returns\/[^/]+\/media$/.test(url.pathname),
    config: { maxRequests: 30, windowMs: 60 * 1000 },
  },
  {
    test: (url) => url.pathname === "/api/search",
    config: { maxRequests: 120, windowMs: 60 * 1000 },
  },
];

function pickConfig(url: URL) {
  for (const entry of routeRateLimitConfig) {
    if (entry.test(url)) return entry.config;
  }
  return { maxRequests: 200, windowMs: 60 * 1000 };
}
```

### After

```typescript
// Environment-configurable defaults (fallback to hard-coded values)
const DEFAULT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_DEFAULT_MAX || "200",
  10
);
const DEFAULT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_DEFAULT_WINDOW_MS || "60000",
  10
);

// Route-specific overrides (can be loaded from env vars)
const INVOICE_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_INVOICE_MAX || "20",
  10
);
const INVOICE_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_INVOICE_WINDOW_MS || "60000",
  10
);

const RETURNS_MEDIA_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_RETURNS_MEDIA_MAX || "30",
  10
);
const RETURNS_MEDIA_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_RETURNS_MEDIA_WINDOW_MS || "60000",
  10
);

const SEARCH_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_SEARCH_MAX || "120",
  10
);
const SEARCH_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_SEARCH_WINDOW_MS || "60000",
  10
);

const routeRateLimitConfig: Array<{
  test: (url: URL) => boolean;
  config: { maxRequests?: number; windowMs?: number; message?: string };
  name: string; // For logging
}> = [
  {
    name: "invoice-pdf",
    test: (url) => /\/api\/orders\/[^/]+\/invoice$/.test(url.pathname),
    config: { maxRequests: INVOICE_MAX_REQUESTS, windowMs: INVOICE_WINDOW_MS },
  },
  {
    name: "returns-media",
    test: (url) => /\/api\/returns\/[^/]+\/media$/.test(url.pathname),
    config: {
      maxRequests: RETURNS_MEDIA_MAX_REQUESTS,
      windowMs: RETURNS_MEDIA_WINDOW_MS,
    },
  },
  {
    name: "search",
    test: (url) => url.pathname === "/api/search",
    config: { maxRequests: SEARCH_MAX_REQUESTS, windowMs: SEARCH_WINDOW_MS },
  },
];
```

### Impact

- ✅ Can adjust rate limits via environment variables without code deploy
- ✅ Easier to handle traffic spikes or DoS protection
- ✅ Maintains backward compatibility with default values
- ✅ Added named configs for better logging

---

## Bug #4: No Logging for Rate Limit Application - MEDIUM ✅

**File**: `src/app/api/middleware/withRouteRateLimit.ts`  
**Lines**: 30-56 (pickConfig function)  
**Severity**: MEDIUM  
**Risk**: Hard to debug which rate limit is being applied

### Issue

No visibility into which rate limit configuration was applied to a request, making it difficult to debug rate limiting issues.

### Before

```typescript
function pickConfig(url: URL) {
  for (const entry of routeRateLimitConfig) {
    if (entry.test(url)) return entry.config;
  }
  return { maxRequests: 200, windowMs: 60 * 1000 };
}
```

### After

```typescript
function pickConfig(url: URL): {
  config: { maxRequests?: number; windowMs?: number; message?: string };
  name: string;
} {
  for (const entry of routeRateLimitConfig) {
    if (entry.test(url)) {
      // Log which rate limit is being applied (debug mode)
      if (
        process.env.NODE_ENV === "development" ||
        process.env.LOG_RATE_LIMITS === "true"
      ) {
        console.log(
          `[Rate Limit] Applied "${entry.name}" config to ${url.pathname}`,
          entry.config
        );
      }
      return { config: entry.config, name: entry.name };
    }
  }
  // Default fallback
  if (
    process.env.NODE_ENV === "development" ||
    process.env.LOG_RATE_LIMITS === "true"
  ) {
    console.log(`[Rate Limit] Applied default config to ${url.pathname}`, {
      maxRequests: DEFAULT_MAX_REQUESTS,
      windowMs: DEFAULT_WINDOW_MS,
    });
  }
  return {
    config: { maxRequests: DEFAULT_MAX_REQUESTS, windowMs: DEFAULT_WINDOW_MS },
    name: "default",
  };
}
```

### Impact

- ✅ Logs which rate limit config was applied in development
- ✅ Can enable logging in production with `LOG_RATE_LIMITS=true`
- ✅ Includes config name and values for debugging
- ✅ Returns config name for potential future use

---

## Environment Variables Added

### Default Rate Limits

- `RATE_LIMIT_DEFAULT_MAX` - Default max requests (default: 200)
- `RATE_LIMIT_DEFAULT_WINDOW_MS` - Default window in milliseconds (default: 60000)

### Route-Specific Limits

- `RATE_LIMIT_INVOICE_MAX` - Invoice PDF max requests (default: 20)
- `RATE_LIMIT_INVOICE_WINDOW_MS` - Invoice PDF window (default: 60000)
- `RATE_LIMIT_RETURNS_MEDIA_MAX` - Returns media max requests (default: 30)
- `RATE_LIMIT_RETURNS_MEDIA_WINDOW_MS` - Returns media window (default: 60000)
- `RATE_LIMIT_SEARCH_MAX` - Search max requests (default: 120)
- `RATE_LIMIT_SEARCH_WINDOW_MS` - Search window (default: 60000)

### Logging Control

- `LOG_RATE_LIMITS` - Set to "true" to enable rate limit logging in production

---

## Verification

✅ All changes compile successfully  
✅ Error handling prevents route crashes  
✅ Request context improves debugging  
✅ Environment variables allow runtime configuration  
✅ Logging provides visibility into rate limit application

## Total Bugs Fixed in Batch 3: 4

1. Missing error handling in getUserFromRequest (CRITICAL)
2. Missing request context in errors (MEDIUM)
3. Hard-coded rate limit values (MEDIUM)
4. No logging for rate limit application (MEDIUM)
