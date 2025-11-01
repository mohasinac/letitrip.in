# 🚨 URGENT FIX REQUIRED - Restart Development Server

## Issue

The API client fix has been applied, but Next.js is still serving the old cached JavaScript code.

You're seeing:

```
GET /api/api/admin/orders/stats 404
```

Instead of:

```
GET /api/admin/orders/stats 200
```

## Solution: Restart the Development Server

### Step 1: Stop the Current Server

In your terminal running `npm run dev`, press:

- **Ctrl + C** (Windows/Linux)
- **Cmd + C** (Mac)

### Step 2: Clear Next.js Cache (Optional but Recommended)

```powershell
# In PowerShell
Remove-Item -Recurse -Force .next
```

### Step 3: Restart the Server

```powershell
npm run dev
```

### Step 4: Hard Refresh Your Browser

After the server restarts, in your browser:

- **Ctrl + Shift + R** (Windows/Linux)
- **Cmd + Shift + R** (Mac)

Or:

- Open DevTools (F12)
- Right-click the refresh button
- Click "Empty Cache and Hard Reload"

---

## What Was Fixed

The `src/lib/api/client.ts` file has been updated to remove the duplicate `/api` prefix:

**Before:**

```typescript
const baseURL = config?.baseURL || process.env.NEXT_PUBLIC_API_URL || "/api";
```

**After:**

```typescript
const baseURL = config?.baseURL || ""; // Empty - routes already have /api
```

---

## After Restart, You Should See

✅ **Server logs:**

```
GET /api/admin/orders/stats 200
GET /api/admin/products/stats 200
GET /api/admin/support/stats 200
```

✅ **Browser console:**

- No more 404 errors
- Dashboard loads with real data
- Debug tools show successful API tests

---

## Still Not Working?

If after restarting you still see the double `/api/api/` pattern:

1. Check your `.env.local` file - make sure `NEXT_PUBLIC_API_URL` is NOT set to `/api`
2. Clear browser cache completely
3. Try in an incognito/private window

---

## Quick Commands (Copy & Paste)

```powershell
# Stop current server (Ctrl+C), then run:
Remove-Item -Recurse -Force .next; npm run dev
```

Then refresh your browser with **Ctrl + Shift + R**
