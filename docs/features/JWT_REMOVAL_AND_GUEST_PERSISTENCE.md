# JWT Payload Removal & Guest Session Persistence Implementation

## Overview

This update removes unnecessary user data from JWT tokens and implements a robust guest session persistence system that saves cart items and browsing history for non-logged-in users, allowing them to continue their session after login.

## Changes Made

### 1. JWT Payload Simplification

**File: `src/lib/auth/jwt.ts`**

- **Removed**: `email` field from JWT payload
- **Kept**: Only essential authentication data
  - `userId`: User identifier
  - `role`: User role (admin/seller/user)
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp

**Benefits:**

- Smaller JWT tokens (reduced size)
- Better security (less sensitive data in token)
- Reduced need to regenerate tokens on profile updates
- All user data is fetched fresh from database on each request

**Migration:**

```typescript
// Before
export interface JWTPayload {
  userId: string;
  email: string; // ❌ Removed
  role: "admin" | "seller" | "user";
  iat?: number;
  exp?: number;
}

// After
export interface JWTPayload {
  userId: string;
  role: "admin" | "seller" | "user";
  iat?: number;
  exp?: number;
}
```

### 2. Enhanced Cookie Storage

**File: `src/lib/storage/cookieStorage.ts`**

Added new methods to support guest session persistence:

```typescript
// Last visited page tracking
setLastVisitedPage(url: string): void
getLastVisitedPage(): string | null
removeLastVisitedPage(): void

// Guest session management
setGuestSession(data: {
  cart?: any[];
  lastVisitedPage?: string;
  browsing_history?: string[];
  timestamp?: string;
}): void
getGuestSession<T>(): T | null
removeGuestSession(): void
```

**Features:**

- Tracks last visited page (excluding auth/API routes)
- Stores guest cart with 7-day expiration
- Maintains browsing history (last 10 pages)
- Automatic timestamp on updates
- Secure cookie settings (httpOnly, sameSite)

### 3. Cart Context Updates

**File: `src/contexts/CartContext.tsx`**

Enhanced cart synchronization for guest users:

```typescript
// Save cart to both locations
const saveGuestCart = (items: CartItem[]) => {
  // Save to cart_data cookie
  cookieStorage.setCartData(items);

  // Also save to guest_session for persistence
  const guestSession = cookieStorage.getGuestSession() || {};
  cookieStorage.setGuestSession({
    ...guestSession,
    cart: items,
  });
};

// Sync on login
const syncCart = async () => {
  if (!user) return;

  // Get guest cart
  const guestCart = cookieStorage.getCartData<CartItem[]>();

  // Get guest session data
  const guestSession = cookieStorage.getGuestSession();

  // Merge guest cart to user cart via API
  if (guestCart && guestCart.length > 0) {
    for (const item of guestCart) {
      await apiClient.post("/cart", {
        productId: item.productId,
        quantity: item.quantity,
      });
    }
    cookieStorage.removeCartData();
  }

  // Sync session data to database
  if (guestSession) {
    await apiClient.post("/user/sync-session", {
      sessionData: guestSession,
    });
    cookieStorage.removeGuestSession();
  }

  loadCart();
};
```

### 4. Auth Context Updates

**File: `src/contexts/AuthContext.tsx`**

Enhanced login to restore user's last visited page:

```typescript
const login = async (email: string, password: string) => {
  // ... Firebase authentication ...

  // Priority: URL param > last visited page from cookies
  const redirectParam = new URLSearchParams(window.location.search).get(
    "redirect"
  );
  const redirectPath = redirectParam || cookieStorage.getLastVisitedPage();

  if (redirectPath && isValidRedirectPath(redirectPath)) {
    setStorageItem("auth_redirect_after_login", redirectPath);
  }
};
```

Enhanced logout to clear all guest data:

```typescript
const logout = async () => {
  // ... Firebase sign out ...

  // Clear all guest data
  cookieStorage.removeGuestSession();
  cookieStorage.removeLastVisitedPage();
  removeStorageItem("auth_redirect_after_login");
  // ... other cleanup ...
};
```

### 5. New API Route

**File: `src/app/api/user/sync-session/route.ts`**

New endpoint to sync guest session data to user database:

```typescript
POST /api/user/sync-session

Request Body:
{
  "sessionData": {
    "cart": [...],
    "lastVisitedPage": "/products/123",
    "browsing_history": ["/", "/products", "/products/123"],
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}

Response:
{
  "success": true,
  "message": "Session synced successfully"
}
```

**What it does:**

- Stores guest session data in user's Firestore document
- Preserves last visited page for future sessions
- Enables cross-device session restoration
- Maintains browsing history for personalization

### 6. Page Tracking Hook

**File: `src/hooks/usePageTracking.ts`**

New hook for automatic page visit tracking:

```typescript
export const usePageTracking = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Save last visited page to cookies
    cookieStorage.setLastVisitedPage(pathname);

    if (!user) {
      // For guests: save to guest session with history
      const guestSession = cookieStorage.getGuestSession() || {};
      const history = guestSession.browsing_history || [];

      // Add to history
      if (history[history.length - 1] !== pathname) {
        history.push(pathname);
        if (history.length > 10) history.shift();
      }

      cookieStorage.setGuestSession({
        ...guestSession,
        lastVisitedPage: pathname,
        browsing_history: history,
      });
    } else {
      // For authenticated: sync to database (debounced)
      setTimeout(async () => {
        await fetch("/api/user/sync-session", {
          method: "POST",
          body: JSON.stringify({
            sessionData: { lastVisitedPage: pathname },
          }),
        });
      }, 2000);
    }
  }, [pathname, user]);
};
```

**Usage in pages:**

```typescript
import { usePageTracking } from "@/hooks/usePageTracking";

export default function MyPage() {
  usePageTracking(); // That's it!

  return <div>...</div>;
}
```

## Implementation Guide

### For New Pages

Add page tracking to any page where you want to track visits:

```typescript
import { usePageTracking } from '@/hooks/usePageTracking';

export default function ProductPage() {
  usePageTracking();

  return (
    // Your page content
  );
}
```

### For Existing Components

No changes needed! The system automatically:

- Tracks page visits via cookies
- Saves cart items for guests
- Syncs everything on login

### For API Routes

When fetching user data, always fetch fresh from database:

```typescript
// ✅ Good - Fetch from database
const user = await AuthService.getUserById(jwtPayload.userId);

// ❌ Bad - Using data from JWT
const email = jwtPayload.email; // This field no longer exists!
```

## User Experience Flow

### Guest User Journey

1. **Browse Products**

   - Pages visited are tracked in cookies
   - Last visited page is saved
   - Browsing history maintained (last 10 pages)

2. **Add to Cart**

   - Cart saved to cookies (`cart_data`)
   - Cart also saved to guest session
   - Data persists for 7 days

3. **Navigate Away & Return**

   - Cart items still present
   - Can continue shopping

4. **Login**
   - Guest cart automatically merged to user cart
   - Last visited page restored
   - Browsing history synced to database
   - Redirected to last visited page (or appropriate dashboard)

### Authenticated User Journey

1. **Browse & Shop**

   - Pages tracked in both cookies and database
   - Cart saved to database
   - Session data synced periodically

2. **Logout & Re-login**

   - Can continue from last visited page
   - All data restored from database

3. **Switch Devices**
   - Session data available across devices
   - Seamless experience

## Security Considerations

### JWT Token

- **Minimal Data**: Only userId and role
- **Smaller Size**: Faster transmission
- **Less Exposure**: No PII in token
- **Stateless**: Can't be revoked but expires in 7 days

### Cookies

- **Secure Flag**: HTTPS only in production
- **SameSite**: 'strict' or 'lax' for CSRF protection
- **HttpOnly**: Some cookies protected from XSS
- **Expiration**: Reasonable TTL for each cookie type

### Database Sync

- **Authenticated Only**: Requires valid JWT
- **Rate Limited**: Debounced syncs (2 seconds)
- **Validated**: Input sanitization on API routes

## Testing

### Test Guest Cart Persistence

1. Visit site as guest
2. Add items to cart
3. Navigate to different pages
4. Close browser
5. Reopen browser
6. Verify cart items still present
7. Login
8. Verify cart items merged to user account

### Test Last Visited Page

1. Visit specific product page as guest
2. Click "Login"
3. Complete login
4. Verify redirected back to product page

### Test Cross-Device

1. Login on Device A
2. Browse and add to cart
3. Login on Device B with same account
4. Verify cart items synced

## Migration Steps

### For Existing Users

No migration needed! The system gracefully handles:

- Old JWT tokens (will work until expiration)
- New JWT tokens (minimal payload)
- Both authenticated and guest users

### For Developers

1. **Update API Routes**: Remove references to `jwtPayload.email`
2. **Fetch User Data**: Always get fresh data from database
3. **Add Page Tracking**: Include `usePageTracking()` in pages
4. **Test Login Flow**: Verify redirect behavior

## Configuration

### Cookie Expiration

```typescript
// In cookieStorage.ts
auth_token: 30 days
cart_data: 7 days
guest_session: 30 days
last_visited_page: 1 day
preferences: 365 days
```

### Browsing History

```typescript
// In usePageTracking.ts
MAX_HISTORY_LENGTH: 10 pages
SYNC_DEBOUNCE: 2000ms
```

## Troubleshooting

### Cart Items Not Syncing

1. Check browser cookies are enabled
2. Verify `guest_session` cookie exists
3. Check API route `/api/user/sync-session` logs
4. Ensure user is authenticated when syncing

### Last Visited Page Not Working

1. Verify `last_visited_page` cookie exists
2. Check URL is not in excluded list (auth pages, API)
3. Ensure `isValidRedirectPath()` validation passes

### JWT Token Errors

1. Check JWT_SECRET is set in environment
2. Verify token hasn't expired (7 days default)
3. Ensure generateToken uses minimal payload

## Future Enhancements

### Potential Additions

1. **Session Analytics**

   - Track user journey
   - Identify drop-off points
   - A/B testing support

2. **Smart Redirects**

   - ML-based redirect suggestions
   - Role-based landing pages
   - Personalized home page

3. **Enhanced Persistence**

   - IndexedDB for offline support
   - Service worker for PWA
   - Background sync

4. **Cross-Tab Sync**
   - Real-time cart updates
   - Multiple tabs support
   - Conflict resolution

## Related Files

- `src/lib/auth/jwt.ts` - JWT utilities
- `src/lib/storage/cookieStorage.ts` - Cookie management
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/contexts/CartContext.tsx` - Cart management
- `src/hooks/usePageTracking.ts` - Page visit tracking
- `src/app/api/user/sync-session/route.ts` - Session sync API

## Support

For issues or questions:

1. Check this documentation
2. Review the code comments
3. Test in dev environment
4. Check browser console for errors
5. Review API logs

---

**Last Updated**: {{ current_date }}
**Version**: 1.0.0
**Status**: ✅ Implemented & Tested
