# 🚀 Quick Reference Guide

## Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter
npm run type-check      # Check TypeScript types
npm run test:api        # Test API endpoints
npm run clean:logs      # Clear log files
```

## API Quick Reference

### Creating a New API Endpoint

```typescript
// src/app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "../middleware";

async function handler(req: NextRequest) {
  // Your logic here
  return NextResponse.json({ data: "response" });
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, handler, {
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    cache: { ttl: 300000 },
  });
}
```

### Error Handling

```typescript
import { BadRequestError, NotFoundError, handleApiError } from "../lib/errors";

async function handler(req: NextRequest) {
  try {
    if (!data) throw new NotFoundError("Item not found");
    if (!valid) throw new BadRequestError("Invalid input");
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Manual Logging

```typescript
import { apiLogger } from "../middleware";

apiLogger.info("Operation completed", { userId: "abc" });
apiLogger.error("Operation failed", error, { userId: "abc" });
apiLogger.warn("Warning message", { details: "info" });
```

### Cache Invalidation

```typescript
import { cacheManager } from "../middleware";

cacheManager.invalidate(); // Clear all
cacheManager.invalidate("cache:/api/products.*"); // Pattern
```

## Frontend Quick Reference

### Using Auth Service

```typescript
import { authService } from "@/services/auth.service";

// Register
await authService.register({ email, password, name });

// Login
await authService.login({ email, password });

// Check auth
const isAuth = authService.isAuthenticated();
const user = authService.getCurrentUser();
const role = authService.getUserRole();
const hasRole = authService.hasRole("admin");

// Logout
authService.logout();
```

### Protecting Pages

```typescript
import AuthGuard from "@/components/auth/AuthGuard";

export default function ProtectedPage() {
  return (
    <AuthGuard
      requireAuth={true}
      allowedRoles={["user", "admin"]}
      redirectTo="/login"
    >
      {/* Protected content */}
    </AuthGuard>
  );
}
```

### Making API Calls

```typescript
import { apiService } from "@/services/api.service";

// GET
const data = await apiService.get("/endpoint");

// POST
const result = await apiService.post("/endpoint", { data });

// PUT
const updated = await apiService.put("/endpoint", { data });

// DELETE
await apiService.delete("/endpoint");
```

## Middleware Configuration

### Rate Limiting

```typescript
{
  rateLimit: {
    maxRequests: 200,      // Max requests per window
    windowMs: 60000,       // Window in milliseconds
    message: 'Custom message'
  }
}
```

### Caching

```typescript
{
  cache: {
    ttl: 300000,          // Time to live (ms)
    key: 'custom-key',    // Custom cache key
  }
}
```

### Logging Context

```typescript
{
  logger: {
    context: {
      userId: 'user-123',
      action: 'purchase'
    }
  }
}
```

## Environment Variables

```env
# Required
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Optional
NODE_ENV=development
LOG_LEVEL=info
```

## Firebase Operations

### Server-Side (Admin SDK)

```typescript
import { adminAuth, adminDb } from "../lib/firebase/config";

// Get user
const user = await adminAuth.getUser(uid);

// Create user
const newUser = await adminAuth.createUser({ email, password });

// Firestore
const doc = await adminDb.collection("users").doc(uid).get();
await adminDb.collection("users").doc(uid).set(data);
```

### Client-Side (Client SDK)

```typescript
import { auth } from "@/app/api/lib/firebase/app";
import { signInWithCustomToken } from "firebase/auth";

// Sign in with custom token from backend
await signInWithCustomToken(auth, token);
```

## Common Patterns

### Protected API Route

```typescript
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    // Continue with authenticated request
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
```

### Form Submission

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await authService.login(formData);
    router.push("/dashboard");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Troubleshooting

### Check Logs

```bash
# View error logs
cat logs/error.log

# View API logs
cat logs/api.log

# Watch logs in real-time
tail -f logs/combined.log
```

### Common Issues

**Firebase Error**: Check `.env.local` for correct credentials

**Rate Limited**: Wait for the window to reset or increase limits

**Cache Issues**: Clear cache with `cacheManager.invalidate()`

**Auth Issues**: Check token in localStorage, verify Firebase setup

## Testing Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## Performance Tips

1. **Use caching** for GET endpoints that don't change often
2. **Adjust rate limits** based on endpoint sensitivity
3. **Monitor logs** for performance issues
4. **Use Redis** in production for distributed caching
5. **Optimize images** and use Next.js Image component
6. **Enable compression** in production

## Security Checklist

- ✅ Environment variables not committed
- ✅ Firebase rules configured
- ✅ Rate limiting enabled
- ✅ Input validation on all endpoints
- ✅ Passwords hashed (never stored plain)
- ✅ HTTPS in production
- ✅ Error messages don't expose sensitive data
- ✅ Logging enabled for audit trail

---

**Quick Tip**: Keep this file handy for daily development!
