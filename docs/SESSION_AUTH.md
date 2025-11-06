# Session-Based Authentication System

This project implements a secure session-based authentication system using cookies, JWT tokens, and Firestore for session storage.

## Overview

The authentication system provides:

- **Cookie-based sessions**: Sessions are stored in HTTP-only cookies for security
- **JWT tokens**: JSON Web Tokens are used for session validation
- **Firestore storage**: All sessions are stored in Firestore for persistence and management
- **Session management**: Users can view and delete their active sessions
- **Automatic cleanup**: Expired sessions are automatically cleaned up
- **Security**: HTTP-only cookies prevent XSS attacks, secure flag for production

## Architecture

### Components

1. **Session Management** (`src/app/api/lib/session.ts`)

   - Create, verify, and delete sessions
   - Store sessions in Firestore
   - Generate JWT tokens
   - Manage session cookies

2. **Auth Middleware** (`src/app/api/middleware/auth.ts`)

   - `requireAuth`: Requires valid session for route access
   - `requireRole`: Requires specific role for route access
   - `optionalAuth`: Adds session if available, but doesn't require it

3. **Auth Routes**

   - `POST /api/auth/login`: Login and create session
   - `POST /api/auth/register`: Register and create session
   - `POST /api/auth/logout`: Logout and destroy session
   - `GET /api/auth/me`: Get current user and session info
   - `GET /api/auth/sessions`: Get all user sessions
   - `DELETE /api/auth/sessions`: Delete specific or all sessions

4. **Client Service** (`src/services/auth.service.ts`)
   - Login/register/logout methods
   - Get current user (from server)
   - Get cached user (from localStorage)
   - Session management methods

## Setup

### 1. Environment Variables

Add to your `.env.local` file:

```bash
# Session Secret - Generate a strong random string
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
```

**Important**: Use a strong, random secret key in production. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Install Dependencies

Already installed:

- `jsonwebtoken` - For JWT token generation and verification
- `cookie` - For parsing and serializing cookies

### 3. Firestore Collections

The system uses the following Firestore collections:

#### `users` Collection

Stores user data:

```typescript
{
  uid: string;
  email: string;
  name: string;
  hashedPassword: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  profile: {
    avatar: string | null;
    bio: string | null;
    address: any;
  }
  preferences: {
    notifications: boolean;
    newsletter: boolean;
  }
}
```

#### `sessions` Collection

Stores active sessions:

```typescript
{
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  userAgent?: string;
  ipAddress?: string;
}
```

## Usage

### Client-Side

#### Login

```typescript
import { authService } from "@/services/auth.service";

const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: "user@example.com",
      password: "password123",
    });

    console.log("Logged in:", response.user);
    console.log("Session ID:", response.sessionId);

    // Session cookie is automatically set
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

#### Register

```typescript
const handleRegister = async () => {
  try {
    const response = await authService.register({
      email: "user@example.com",
      password: "password123",
      name: "John Doe",
      phoneNumber: "+1234567890", // optional
    });

    console.log("Registered:", response.user);
    // Session cookie is automatically set
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
```

#### Logout

```typescript
const handleLogout = async () => {
  await authService.logout();
  // Session is destroyed, cookie is cleared
  // User is redirected or state is updated
};
```

#### Get Current User

```typescript
// Get from server (validates session)
const user = await authService.getCurrentUser();

// Get from cache (localStorage)
const cachedUser = authService.getCachedUser();
```

#### Session Management

```typescript
// Get all active sessions
const sessions = await authService.getSessions();

// Delete a specific session
await authService.deleteSession("sess_123456");

// Delete all sessions (logout from all devices)
await authService.deleteAllSessions();
```

### Server-Side

#### Protected Route Example

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/app/api/middleware/auth";
import { withMiddleware } from "@/app/api/middleware";

async function protectedHandler(req: AuthenticatedRequest) {
  // Session is available in req.session
  const { userId, email, role } = req.session!;

  return NextResponse.json({
    message: "Protected data",
    userId,
  });
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, (r) => requireAuth(r, protectedHandler));
}
```

#### Role-Based Route Example

```typescript
import { requireRole, AuthenticatedRequest } from "@/app/api/middleware/auth";

async function adminHandler(req: AuthenticatedRequest) {
  return NextResponse.json({ message: "Admin data" });
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, (r) =>
    requireRole(r, adminHandler, ["admin", "moderator"])
  );
}
```

#### Optional Auth Example

```typescript
import { optionalAuth, AuthenticatedRequest } from "@/app/api/middleware/auth";

async function publicHandler(req: AuthenticatedRequest) {
  if (req.session) {
    // User is authenticated
    return NextResponse.json({
      message: "Hello, " + req.session.email,
    });
  }

  // User is not authenticated
  return NextResponse.json({
    message: "Hello, guest",
  });
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, (r) => optionalAuth(r, publicHandler));
}
```

## Security Features

### 1. HTTP-Only Cookies

- Cookies are set with `httpOnly: true` flag
- JavaScript cannot access the cookies (prevents XSS attacks)

### 2. Secure Flag

- In production (`NODE_ENV=production`), cookies use `secure: true`
- Cookies are only sent over HTTPS connections

### 3. SameSite Protection

- Cookies use `sameSite: 'lax'` to prevent CSRF attacks
- Cookies are sent with same-site requests and top-level navigations

### 4. Session Expiration

- Sessions expire after 7 days by default
- Expired sessions are automatically cleaned up
- Last activity is updated on each request

### 5. Password Hashing

- Passwords are hashed using bcrypt with salt rounds of 12
- Plain text passwords are never stored

### 6. JWT Signing

- JWT tokens are signed with a secret key
- Tokens include expiration time

## Session Lifecycle

1. **Login/Register**

   - User credentials are validated
   - Session is created in Firestore
   - JWT token is generated
   - Token is stored in HTTP-only cookie
   - User data is cached in localStorage

2. **Authenticated Request**

   - Cookie is automatically sent with request
   - JWT token is extracted from cookie
   - Token is verified and decoded
   - Session is checked in Firestore
   - Last activity is updated
   - Request proceeds with session data

3. **Logout**

   - Session is deleted from Firestore
   - Cookie is cleared
   - LocalStorage is cleared

4. **Session Expiration**
   - Expired sessions are rejected
   - Expired sessions are deleted from Firestore
   - User is prompted to login again

## Configuration

### Session Duration

Default: 7 days

To change, modify in `src/app/api/lib/session.ts`:

```typescript
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
```

### Cookie Settings

Modify in `src/app/api/lib/session.ts`:

```typescript
const cookie = serialize(SESSION_COOKIE_NAME, token, {
  httpOnly: true, // Prevent JavaScript access
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // CSRF protection
  maxAge: SESSION_MAX_AGE, // Cookie expiration
  path: "/", // Cookie available on all paths
});
```

## Cleanup & Maintenance

### Automatic Cleanup

Expired sessions are automatically deleted when:

- A user tries to use an expired session
- `getUserSessions()` is called (cleans up user's expired sessions)

### Manual Cleanup

You can manually clean up expired sessions:

```typescript
import { cleanupExpiredSessions } from "@/app/api/lib/session";

// Clean up all expired sessions
const deletedCount = await cleanupExpiredSessions();
console.log(`Deleted ${deletedCount} expired sessions`);
```

Consider setting up a cron job to periodically clean up expired sessions:

- Create a route: `/api/cron/cleanup-sessions`
- Use a service like Vercel Cron or a scheduled Cloud Function
- Run daily or weekly

## Migration from Token-Based Auth

If you're migrating from the previous token-based system:

1. **Remove old token storage**

   ```typescript
   // Client-side
   localStorage.removeItem("authToken");
   ```

2. **Update auth checks**

   - Old: `const token = localStorage.getItem('authToken')`
   - New: Sessions are automatically handled via cookies

3. **Update protected routes**

   - Import and use the new auth middleware
   - Session data is available in `req.session`

4. **Clear old user data**
   - Users will need to log in again
   - Old tokens will no longer work

## Testing

### Test Login/Register

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get current user
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

### Test Protected Route

```bash
# Without session (should fail)
curl -X GET http://localhost:3000/api/protected

# With session (should succeed)
curl -X GET http://localhost:3000/api/protected \
  -b cookies.txt
```

## Troubleshooting

### "No session token found"

- Check if cookies are being sent with requests
- Verify `credentials: 'include'` in fetch options (if needed)
- Check browser cookie settings

### "Invalid or expired session"

- Session may have expired (7 days default)
- Session may have been deleted
- User needs to log in again

### Session not persisting

- Check cookie settings
- Verify domain matches
- Check if browser blocks third-party cookies

### "Unauthorized" errors

- Verify SESSION_SECRET is set correctly
- Check if session exists in Firestore
- Verify JWT token is valid

## Best Practices

1. **Always use HTTPS in production**

   - Secure flag requires HTTPS
   - Prevents session hijacking

2. **Use strong session secret**

   - Minimum 32 characters
   - Use cryptographically random string
   - Never commit to version control

3. **Implement session timeout**

   - Current: 7 days
   - Adjust based on security requirements
   - Consider shorter timeout for sensitive operations

4. **Monitor active sessions**

   - Allow users to view active sessions
   - Allow users to revoke sessions
   - Log suspicious activity

5. **Clean up regularly**

   - Set up automated cleanup
   - Delete expired sessions
   - Monitor Firestore usage

6. **Handle logout everywhere**
   - Provide "logout all devices" option
   - Clear all related data
   - Redirect appropriately

## API Reference

### Session Management Functions

#### `createSession(userId, email, role, req?)`

Creates a new session and returns session ID and JWT token.

#### `verifySession(token)`

Verifies a JWT token and checks if session exists in Firestore.

#### `deleteSession(sessionId)`

Deletes a specific session from Firestore.

#### `deleteAllUserSessions(userId)`

Deletes all sessions for a specific user.

#### `getUserSessions(userId)`

Gets all active sessions for a user.

#### `cleanupExpiredSessions()`

Cleans up all expired sessions from Firestore.

### Cookie Functions

#### `setSessionCookie(response, token)`

Sets the session cookie in the response.

#### `clearSessionCookie(response)`

Clears the session cookie.

#### `getSessionToken(req)`

Extracts the session token from request cookies.

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Firestore session documents
3. Check browser console for errors
4. Review server logs for authentication errors
