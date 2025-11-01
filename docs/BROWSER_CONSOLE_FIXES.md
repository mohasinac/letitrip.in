# Browser Console Errors - Fixes Applied

## Date: November 1, 2025

## Issues Identified and Fixed

### ✅ 1. OpaqueResponseBlocking Error (FIXED)

**Error Message:**

```
A resource is blocked by OpaqueResponseBlocking, please check browser console for details.
photo-1518709268805-4e9042af2176
```

**Root Cause:**
Unsplash images (images.unsplash.com) were not whitelisted in Next.js image configuration, causing the browser to block them.

**Fix Applied:**
Added `images.unsplash.com` to the `remotePatterns` in `next.config.js`:

```javascript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "firebasestorage.googleapis.com",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
  ],
  // ...
}
```

**Files Modified:**

- `next.config.js`

---

### ✅ 2. MetadataBase Warning (FIXED)

**Warning Message:**

```
⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images,
using "http://localhost:3000"
```

**Root Cause:**
Next.js requires a `metadataBase` URL to properly resolve relative URLs in Open Graph and Twitter card images.

**Fix Applied:**
Added `metadataBase` to the metadata export in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  // ...
};
```

**Files Modified:**

- `src/app/layout.tsx`

---

### ⚠️ 3. API 404 Errors (FIXED)

**Error Messages:**

```
API Error [404]: Request failed with status code 404
Failed to fetch orders: { message: "Request failed with status code 404", ... }
Failed to fetch stats: { message: "Request failed with status code 404", ... }
Verify the API route file exists at: src/app/api/api/admin/orders/stats
                                                    ^^^ Double "api"!
```

**Affected Endpoints:**

- `/api/admin/orders/stats`
- `/api/admin/products/stats`
- `/api/admin/support`
- `/api/admin/support/stats`

**Root Cause:**
The API client was configured with `baseURL: "/api"`, which caused all API calls to have a double `/api/api/` prefix. When calling `/api/admin/orders/stats`, it was actually requesting `/api/api/admin/orders/stats`, resulting in 404 errors.

**Fix Applied:**
Removed the `baseURL` from the axios client configuration in `src/lib/api/client.ts` since all routes already include the `/api` prefix:

```typescript
constructor(config?: ApiClientConfig) {
  // Don't set baseURL since routes already include /api prefix
  // Setting baseURL causes double /api/api/ in URLs
  const baseURL = config?.baseURL || "";
  const timeout = config?.timeout || 30000;
  // ...
}
```

Also updated `publicGet` and `publicPost` methods to not use `baseURL`.

**Files Modified:**

- `src/lib/api/client.ts`

#### a) Enhanced Error Logging in API Client

Updated `src/lib/api/client.ts` to provide more detailed error messages:

```typescript
private handleError(error: any): void {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const url = error.config?.url || "unknown";
    const method = error.config?.method?.toUpperCase() || "REQUEST";

    console.error(`API Error [${status}]: ${method} ${url}`);

    if (status === 401) {
      console.error("🔒 Authentication Error: Token may be missing or invalid");
    } else if (status === 403) {
      console.error("⛔ Authorization Error: User may not have required permissions");
    } else if (status === 404) {
      console.error("❓ Not Found: API endpoint may not exist");
    }
    // ...
  }
}
```

#### b) Improved Dashboard Error Handling

Updated `src/components/features/dashboard/Dashboard.tsx` to:

- Show authentication errors to users
- Provide more context about what went wrong
- Distinguish between auth errors and other API errors

#### c) Created Debug Tools

**New Files Created:**

1. **`src/lib/debug/auth-debug.ts`** - Console debugging utilities

   - `debugAuth()` - Shows current authentication status
   - `testApiAuth()` - Tests API endpoints with current token
   - Auto-loaded in development mode

2. **`src/app/admin/debug/page.tsx`** - Visual diagnostic page
   - Shows Firebase authentication status
   - Displays token information
   - Shows user role and custom claims
   - Tests all admin API endpoints
   - Provides detailed error messages

**Files Modified:**

- `src/lib/api/client.ts`
- `src/components/features/dashboard/Dashboard.tsx`
- `src/app/layout.tsx`

---

## How to Use the Debug Tools

### Option 1: Browser Console

Open browser console (F12) and run:

```javascript
// Show authentication status
debugAuth();

// Test API endpoints
testApiAuth();
```

These functions are automatically available in development mode.

### Option 2: Visual Debug Page

Navigate to: **`http://localhost:3000/admin/debug`**

This page shows:

- ✅ Firebase authentication status
- 🎫 Token availability and preview
- 👤 User role and custom claims
- 🧪 API endpoint test results
- 📋 Full user context

---

## Next Steps - Verification

**⚠️ IMPORTANT: You MUST restart the development server for changes to take effect!**

### Step 1: Restart Development Server

The API client code has been updated, but Next.js is still serving the old cached version.

**In your terminal running `npm run dev`:**

1. Press **Ctrl + C** to stop the server
2. Run: `npm run dev` to restart

**Or run this command to clear cache and restart:**

```powershell
Remove-Item -Recurse -Force .next; npm run dev
```

### Step 2: Hard Refresh Browser

After the server restarts:

- Press **Ctrl + Shift + R** (Windows)
- Or **Cmd + Shift + R** (Mac)
- Or open DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

### Step 3: Verify It's Fixed

After restarting, check your server logs. You should see:

```
✅ GET /api/admin/orders/stats 200
✅ GET /api/admin/products/stats 200
✅ GET /api/admin/support/stats 200
```

Instead of:

```
❌ GET /api/api/admin/orders/stats 404  (double api)
```

### Step 4: Check Browser Console (Optional)

You should no longer see 404 errors, and the dashboard should load with real data.

---

## Additional Improvements

### Better Cache Messages

The cache MISS messages are normal and not errors. They indicate the API cache is working correctly:

```
Cache MISS for /admin/users
Cache MISS for /api/admin/orders/stats
```

These are debug logs showing that data is being fetched fresh (not from cache).

### Smooth Scroll Warning

The warning about `scroll-behavior: smooth` can be fixed by adding `data-scroll-behavior="smooth"` to the `<html>` element in `layout.tsx` if needed.

---

## Files Changed Summary

1. ✅ `next.config.js` - Added Unsplash to image remote patterns
2. ✅ `src/app/layout.tsx` - Added metadataBase and debug import
3. ✅ `src/lib/api/client.ts` - Enhanced error logging
4. ✅ `src/components/features/dashboard/Dashboard.tsx` - Better error handling
5. ✅ `src/lib/debug/auth-debug.ts` - New debug utilities
6. ✅ `src/app/admin/debug/page.tsx` - New visual debug page

---

## Testing Checklist

- [ ] Images from Unsplash load without errors
- [ ] No metadataBase warnings in console
- [ ] Debug page accessible at `/admin/debug`
- [ ] Console commands `debugAuth()` and `testApiAuth()` work
- [ ] API errors show detailed messages (401/403 instead of just 404)
- [ ] Dashboard shows authentication error messages if token is missing

---

## Need Help?

If the 404 errors persist after using the debug tools, please share:

1. Screenshot of `/admin/debug` page
2. Output of `debugAuth()` from console
3. Output of `testApiAuth()` from console

This will help identify the exact authentication issue.
