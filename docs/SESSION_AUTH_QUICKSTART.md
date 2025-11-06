# Session-Based Authentication - Quick Start

## What Changed

The authentication system has been upgraded from token-based to **session-based authentication** with cookies.

### Key Features

✅ **HTTP-Only Cookies** - Sessions stored securely in cookies (not accessible by JavaScript)  
✅ **JWT Tokens** - Signed tokens for session validation  
✅ **Firestore Sessions** - All sessions persisted in Firestore  
✅ **Session Management** - Users can view and revoke active sessions  
✅ **Auto-Cleanup** - Expired sessions automatically removed  
✅ **Multi-Device Support** - Track and manage sessions across devices

## Quick Setup

### 1. Add Environment Variable

Add to `.env.local`:

```bash
SESSION_SECRET=your-super-secret-key-minimum-32-characters
```

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. API Endpoints

| Endpoint             | Method | Description                 |
| -------------------- | ------ | --------------------------- |
| `/api/auth/login`    | POST   | Login and create session    |
| `/api/auth/register` | POST   | Register and create session |
| `/api/auth/logout`   | POST   | Logout and destroy session  |
| `/api/auth/me`       | GET    | Get current user & session  |
| `/api/auth/sessions` | GET    | List all user sessions      |
| `/api/auth/sessions` | DELETE | Delete session(s)           |

### 3. Client Usage

```typescript
import { authService } from "@/services/auth.service";

// Login
await authService.login({ email, password });

// Get current user (from server, validates session)
const user = await authService.getCurrentUser();

// Get cached user (from localStorage)
const cachedUser = authService.getCachedUser();

// Logout
await authService.logout();

// Session management
const sessions = await authService.getSessions();
await authService.deleteSession(sessionId);
await authService.deleteAllSessions(); // Logout all devices
```

### 4. Protected Routes

```typescript
import { requireAuth, AuthenticatedRequest } from "@/app/api/middleware/auth";

async function handler(req: AuthenticatedRequest) {
  const { userId, email, role } = req.session!;
  // Your protected logic
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, (r) => requireAuth(r, handler));
}
```

### 5. Role-Based Access

```typescript
import { requireRole } from "@/app/api/middleware/auth";

export async function GET(req: NextRequest) {
  return withMiddleware(req, (r) =>
    requireRole(r, handler, ["admin", "moderator"])
  );
}
```

## New Files

- `src/app/api/lib/session.ts` - Session management utilities
- `src/app/api/middleware/auth.ts` - Auth middleware (requireAuth, requireRole, optionalAuth)
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/app/api/auth/me/route.ts` - Get current user endpoint
- `src/app/api/auth/sessions/route.ts` - Session management endpoint
- `src/app/api/protected/route.ts` - Example protected route
- `docs/SESSION_AUTH.md` - Complete documentation

## Modified Files

- `src/app/api/auth/login/route.ts` - Updated to create sessions
- `src/app/api/auth/register/route.ts` - Updated to create sessions
- `src/services/auth.service.ts` - Updated for cookie-based auth
- `src/services/api.service.ts` - Removed token handling
- `.env.example` - Added SESSION_SECRET

## Migration Notes

If migrating from token-based auth:

1. **Users must log in again** - Old tokens won't work
2. **Remove old code** - Clean up any `localStorage.getItem('authToken')` references
3. **Cookies automatic** - No need to manually set Authorization headers
4. **Update middleware** - Use new `requireAuth` instead of custom auth checks

## Security

- ✅ HTTP-Only cookies prevent XSS
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite=lax prevents CSRF
- ✅ 7-day session expiration
- ✅ Password hashing with bcrypt
- ✅ JWT token signing

## Testing

Example test login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}' \
  -c cookies.txt

curl -X GET http://localhost:3000/api/auth/me -b cookies.txt
```

## Next Steps

1. Add SESSION_SECRET to your environment variables
2. Test login/logout flow
3. Update any custom auth middleware to use new system
4. Consider setting up session cleanup cron job
5. Monitor Firestore `sessions` collection

## Documentation

See `docs/SESSION_AUTH.md` for complete documentation including:

- Detailed API reference
- Security best practices
- Troubleshooting guide
- Advanced usage examples

## Support

Common issues:

- **"No session token found"** → Check cookies are enabled
- **"Invalid or expired session"** → Session expired, login again
- **Sessions not persisting** → Verify domain/cookie settings
