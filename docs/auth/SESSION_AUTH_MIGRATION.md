# 🔐 Session-Based Authentication Migration Guide

## Overview

Your application has been migrated from **client-side token storage** to **secure server-side session-based authentication** with HTTP-only cookies. This significantly improves security by preventing XSS attacks and token theft.

---

## ✨ What Changed

### Before (Token-Based)

- ❌ Auth tokens stored in localStorage/cookies (vulnerable to XSS)
- ❌ Tokens sent manually in Authorization headers
- ❌ Client has access to sensitive tokens

### After (Session-Based)

- ✅ Sessions stored server-side with secure HTTP-only cookies
- ✅ Cookies automatically sent with requests (no manual handling)
- ✅ Tokens never exposed to client-side JavaScript
- ✅ Protection against XSS attacks

---

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 1. Login Request
       │    POST /api/auth/login
       │    { email, password }
       ↓
┌─────────────────┐
│   API Server    │
│  /api/auth/*    │
└──────┬──────────┘
       │ 2. Validate credentials
       │ 3. Create session
       │ 4. Set HTTP-only cookie
       ↓
┌─────────────────┐
│  Session Store  │
│  (In-memory)    │ ← Can be Redis in production
└─────────────────┘
       ↓
┌─────────────┐
│   Client    │
│  (Browser)  │ ← 5. Receives session cookie
└─────────────┘
       │ 6. Future requests
       │    Cookie sent automatically
       ↓
┌─────────────────┐
│   API Server    │
│  Validates      │
│  session        │
└─────────────────┘
```

---

## 📁 New Files Created

### 1. **`src/app/(backend)/api/_lib/auth/session.ts`** ✨

Server-side session management (backend architecture):

- `createSession()` - Create new session after login
- `getSession()` - Get current user's session
- `destroySession()` - Logout and clear session
- `requireAuth()` - Middleware helper for protected routes
- `requireRole()` - Check user permissions

### 2. **`src/app/(backend)/api/_lib/auth/session-middleware.ts`** ✨

API route middleware for session validation (backend architecture):

- `withSessionAuth()` - Validate session in API routes
- `requireAdmin()` - Require admin role
- `requireSeller()` - Require seller role

### 3. **`src/lib/auth/session-client.ts`**

Client-side auth utilities:

- `loginWithSession()` - Login with email/password
- `registerWithSession()` - Register new user
- `logoutSession()` - Logout
- `getCurrentSessionUser()` - Get current user

### 4. **Updated Files**

- `src/app/(backend)/api/auth/login/route.ts` - Session-based login
- `src/app/(backend)/api/auth/register/route.ts` - Session-based registration
- `src/app/(backend)/api/auth/logout/route.ts` - Session destruction
- `src/app/(backend)/api/auth/me/route.ts` - Get user from session
- `middleware.ts` - Session validation for protected routes
- `src/lib/api/client.ts` - Uses `withCredentials` for cookies

---

## 🔧 How to Use

### Client-Side: Login

```typescript
import { loginWithSession } from "@/lib/auth/session-client";

async function handleLogin() {
  try {
    const user = await loginWithSession("user@example.com", "password");
    console.log("Logged in:", user);
    // Session cookie is automatically set by server
    // User is now authenticated for all future requests
  } catch (error) {
    console.error("Login failed:", error);
  }
}
```

### Client-Side: Making Authenticated Requests

```typescript
import { apiClient } from "@/lib/api/client";

// Session cookie is automatically sent with every request
async function fetchUserOrders() {
  const orders = await apiClient.get("/api/orders");
  return orders;
}
```

### Client-Side: Logout

```typescript
import { logoutSession } from "@/lib/auth/session-client";

async function handleLogout() {
  await logoutSession();
  // Session destroyed on server, cookie cleared
  // Redirect to login page
  window.location.href = "/login";
}
```

### Client-Side: Check Authentication

```typescript
import { getCurrentSessionUser } from "@/lib/auth/session-client";

async function checkAuth() {
  const user = await getCurrentSessionUser();

  if (user) {
    console.log("User is authenticated:", user);
  } else {
    console.log("User is not authenticated");
  }
}
```

---

## 🛡️ Server-Side: Protect API Routes

### Basic Authentication

```typescript
// src/app/(backend)/api/protected/route.ts
import { withSessionAuth } from "../../_lib/auth/session-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Validate session
  const result = await withSessionAuth(request);

  if (result.error) {
    return result.error; // 401 Unauthorized
  }

  const { session } = result;

  return NextResponse.json({
    message: "Protected data",
    userId: session.userId,
    role: session.role,
  });
}
```

### Require Admin Role

```typescript
import { withSessionAuth } from "../../_lib/auth/session-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Require admin role
  const result = await withSessionAuth(request, { requireAdmin: true });

  if (result.error) {
    return result.error; // 401 or 403
  }

  const { session } = result;

  // Admin-only logic
  return NextResponse.json({ message: "Admin dashboard data" });
}
```

### Require Seller or Admin Role

```typescript
import { withSessionAuth } from "../../_lib/auth/session-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Require seller or admin
  const result = await withSessionAuth(request, { requireSeller: true });

  if (result.error) {
    return result.error;
  }

  const { session } = result;

  // Seller logic (create product, etc.)
  return NextResponse.json({ message: "Product created" });
}
```

### Using Helper Functions

```typescript
import { requireAuth, requireAdmin } from "../../_lib/auth/session-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Simple authentication check
  const sessionOrError = await requireAuth(request);

  if (sessionOrError instanceof NextResponse) {
    return sessionOrError; // Error response
  }

  const session = sessionOrError; // Session data

  return NextResponse.json({ user: session });
}
```

---

## 🔐 Session Configuration

Edit `src/app/(backend)/api/_lib/auth/session.ts` to configure:

```typescript
const SESSION_COOKIE_NAME = "session"; // Cookie name
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (in seconds)
```

### Cookie Options

```typescript
{
  httpOnly: true,        // Cannot be accessed by JavaScript
  secure: true,          // Only HTTPS in production
  sameSite: 'lax',      // CSRF protection
  maxAge: 604800,       // 7 days
  path: '/',            // Available for entire site
}
```

---

## 🚀 Production Considerations

### 1. **Use Redis for Session Storage**

The current implementation uses in-memory storage, which will be lost on server restart. For production, use Redis:

```bash
npm install ioredis
```

```typescript
// src/app/(backend)/api/_lib/auth/session.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function createSession(
  userId: string,
  email: string,
  role: string
) {
  const sessionId = generateSessionId();
  const sessionData = { userId, email, role /* ... */ };

  // Store in Redis with TTL
  await redis.setex(
    `session:${sessionId}`,
    SESSION_MAX_AGE,
    JSON.stringify(sessionData)
  );

  // Set cookie...
}
```

### 2. **Environment Variables**

Add to `.env.local`:

```bash
# Session secret (for signing cookies if needed)
SESSION_SECRET=your-super-secret-key-min-32-chars

# Redis (for production)
REDIS_URL=redis://localhost:6379

# Cookie settings
COOKIE_SECURE=true
COOKIE_DOMAIN=.yourdomain.com
```

### 3. **HTTPS Required**

Session cookies with `secure: true` only work over HTTPS. Make sure your production environment uses HTTPS.

### 4. **CORS Configuration**

If your frontend and backend are on different domains, configure CORS properly:

```typescript
// next.config.js
{
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL },
        ],
      },
    ];
  },
}
```

---

## 🧪 Testing

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt
```

### Test Authenticated Request

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Test Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## 🔄 Migration Checklist

- [x] Create session management system
- [x] Update login API to create sessions
- [x] Update register API to create sessions
- [x] Create logout API to destroy sessions
- [x] Update /api/auth/me to use sessions
- [x] Update API client to use withCredentials
- [x] Update middleware to validate sessions
- [x] Create session-based auth middleware
- [ ] Update AuthContext to use session client
- [ ] Update login/register pages
- [ ] Remove token storage from client code
- [ ] Test all authentication flows
- [ ] Deploy with Redis for production

---

## 📚 Additional Resources

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

---

## 🆘 Troubleshooting

### Issue: "401 Unauthorized" on every request

**Solution:** Make sure `withCredentials: true` is set in axios config.

### Issue: Session not persisting across requests

**Solution:** Check that cookies are enabled in browser and `SameSite` is set correctly.

### Issue: CORS errors

**Solution:** Ensure `Access-Control-Allow-Credentials: true` header is set and origin matches.

### Issue: Session lost after server restart

**Solution:** Implement Redis or another persistent session store.

---

## 🎉 Benefits

✅ **Security**: No tokens in localStorage (protected from XSS)
✅ **Simplicity**: No manual token management
✅ **Automatic**: Cookies sent automatically with every request
✅ **Scalable**: Can use Redis for distributed sessions
✅ **Standards**: Following industry best practices

---

**Need Help?** Check the code in:

- `src/app/(backend)/api/_lib/auth/session.ts` - Server-side session management
- `src/app/(backend)/api/_lib/auth/session-middleware.ts` - API middleware
- `src/lib/auth/session-client.ts` - Client-side utilities
