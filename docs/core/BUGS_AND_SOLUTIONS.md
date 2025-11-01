# 🐛 Common Bugs and Solutions

**Project:** HobbiesSpot.com - Beyblade Ecommerce Platform  
**Last Updated:** November 1, 2025

---

## Table of Contents

1. [Authentication Errors](#authentication-errors)
2. [State Management Issues](#state-management-issues)
3. [TypeScript Errors](#typescript-errors)
4. [API & Network Errors](#api--network-errors)
5. [Firebase & Database Issues](#firebase--database-issues)
6. [UI/Component Errors](#uicomponent-errors)
7. [Build & Deployment Errors](#build--deployment-errors)
8. [Next.js 15+ Compatibility](#nextjs-15-compatibility)

---

## Authentication Errors

### 1. "User not authenticated" Error

**Symptoms:**

- Auth token invalid or expired
- User logged out unexpectedly

**Solution:**

```typescript
// Always use fetchWithAuth() or uploadWithAuth()
import { fetchWithAuth } from "@/lib/api/client";

// Correct approach
const response = await fetchWithAuth("/api/seller/products");

// Token is automatically refreshed if expired
```

**Root Cause:** Firebase `getIdToken()` automatically refreshes expired tokens

---

### 2. Authentication Required (401)

**Symptoms:**

- API returns 401 Unauthorized
- Token missing in request

**Solution:**

```typescript
// Ensure token is sent in Authorization header
const token = await auth.currentUser?.getIdToken();

fetch("/api/endpoint", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

---

### 3. Forbidden: Seller Access Required (403)

**Symptoms:**

- User doesn't have required role
- Permission denied errors

**Solution:**

- Check user role in Firestore `users` collection
- Ensure role field is set correctly ('admin', 'seller', or 'user')
- Verify RoleGuard is used on protected routes:

```tsx
<RoleGuard allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</RoleGuard>
```

---

### 4. Breadcrumb Runtime Error

**Symptoms:**

```
Error: can't access property 'length', breadcrumbItems is undefined
```

**Solution:**

```typescript
// Before (causing error)
useBreadcrumbTracker();

// After (fixed)
useBreadcrumbTracker([
  { label: "Seller Panel", href: "/seller/dashboard" },
  { label: "Current Page", href: "/current/path" },
]);
```

**Files Fixed:**

- `src/app/seller/alerts/page.tsx`
- `src/app/seller/analytics/page.tsx`
- `src/app/seller/shipments/page.tsx`

---

## State Management Issues

### 1. Profile Picture Not Showing After Upload

**Root Cause:** AuthContext not refreshing after profile update

**Solution:**

```typescript
// After uploading profile picture, refresh user data
await updateProfile(userData);
// Force auth context refresh
window.location.reload(); // Or implement proper state update
```

---

### 2. Address Data Not Reflecting Until Page Reload

**Root Cause:** State not updating after API call

**Solution:**

```typescript
// Ensure state updates immediately after API success
const handleSave = async () => {
  const response = await saveAddress(addressData);
  if (response.success) {
    // Update local state immediately
    setAddresses([...addresses, response.data]);
    // Don't rely on page reload
  }
};
```

---

### 3. Infinite API Loop

**Root Cause:** useEffect triggering continuous re-renders

**Solution:**

```typescript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    if (isMounted) {
      const data = await apiGet("/endpoint");
      setData(data);
    }
  };

  fetchData();

  return () => {
    isMounted = false; // Cleanup
  };
}, []); // Empty dependency array
```

---

## TypeScript Errors

### 1. Error Prop Type Mismatch

**Symptoms:**

```
Type 'string | undefined' is not assignable to type 'boolean'
```

**Solution:**

```tsx
// Before (causing error)
<UnifiedInput error={errors.name} />

// After (correct)
<UnifiedInput error={!!errors.name} />
{errors.name && <p className="text-xs text-error">{errors.name}</p>}
```

---

### 2. seoKeywords.join TypeError

**Symptoms:**

```
TypeError: Cannot read property 'join' of undefined
```

**Solution:**

```typescript
// Add type guard
const keywords = Array.isArray(shopData.seoKeywords)
  ? shopData.seoKeywords.join(", ")
  : shopData.seoKeywords || "";
```

---

### 3. Next.js 15+ Async Params Error

**Symptoms:**

```
Error: Route /seller/orders/[id] used params.id synchronously
```

**Solution:**

```typescript
// Before (synchronous)
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}

// After (async)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

**Files Fixed:**

- `src/app/seller/orders/[id]/page.tsx`
- `src/app/seller/shipments/[id]/page.tsx`
- `src/app/seller/products/[id]/edit/page.tsx`

---

## API & Network Errors

### 1. Upload Response Parsing Error

**Symptoms:**

- Upload fails with "Unknown error"
- No useful error messages

**Root Cause:** Response format mismatch

**Solution:**

```typescript
const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const result = await response.json();

// Always check response format
if (result.success) {
  const url = result.data?.url || result.url;
  return url;
} else {
  throw new Error(result.error || "Upload failed");
}
```

---

### 2. CORS Errors on Storage

**Solution:**

```powershell
# Apply CORS configuration to Firebase Storage
gsutil cors set cors.json gs://your-bucket.firebasestorage.app
```

---

### 3. Socket.io Connection Issues

**Symptoms:**

- Socket disconnects immediately
- Connection timeout

**Solution:**

```javascript
// Check CORS in server.js
const allowedOrigins = ["https://yourdomain.com", "https://*.vercel.app"];

// Render free tier sleeps after 15 min
// Solution: Upgrade to Starter plan or implement wake-up ping
```

---

## Firebase & Database Issues

### 1. Missing or Insufficient Permissions

**Root Cause:** Client-side security rules blocking request

**Solution:**

- All sensitive operations should use Admin SDK on server
- Admin SDK bypasses security rules
- Check Firestore rules for read/write permissions

**Fixed In:** Session 3 - migrated to Admin SDK

---

### 2. Placeholder Image 404 Errors

**Symptoms:**

- 20+ repeated requests for `/placeholder-product.png`
- File doesn't exist

**Solution:**

```typescript
// Use actual placeholder or handle missing images
const imageUrl = product.image || "/images/placeholder.jpg";

// Or use Next.js Image with fallback
<Image
  src={imageUrl}
  onError={(e) => (e.currentTarget.src = "/images/fallback.jpg")}
/>;
```

---

## UI/Component Errors

### 1. Upload Failure Issue

**Root Cause:**

- Slug not generated before upload
- File object not properly passed

**Solution:**

```typescript
// Validate slug exists before upload
if (!slug || !slug.startsWith("buy-")) {
  throw new Error("Invalid slug format");
}

// Check file exists
if (!img.file) {
  console.error("No file object found");
  return;
}

// Add detailed logging
console.log("Uploading image:", {
  fileName: img.file.name,
  fileSize: img.file.size,
  slug: slug,
});
```

---

### 2. Validation Blocking Navigation

**Root Cause:** `validateStep()` called in `handleNext()`

**Solution:**

```typescript
// Remove validation from navigation
const handleNext = () => {
  setActiveStep(activeStep + 1);
  // Don't validate here
};

// Only validate on submit
const handleSubmit = () => {
  if (validateForm()) {
    submitForm();
  }
};
```

---

### 3. Image Array Handling

**Problem:** Already-uploaded images lost during re-upload

**Solution:**

```typescript
if (!img.isNew || !img.file) {
  // Keep existing uploaded images
  if (!img.isNew) {
    uploadedImages.push({
      url: img.url,
      altText: img.altText,
      order: i,
    });
  }
  continue; // Skip upload
}
```

---

## Build & Deployment Errors

### 1. TypeScript Errors on Build

**Solution:**

```javascript
// next.config.js
module.exports = {
  typescript: {
    ignoreBuildErrors: false, // Set to true only in emergency
  },
};
```

**Better Approach:** Fix errors before deploying

```bash
npm run type-check
```

---

### 2. Out of Memory Error

**Solution:**

```powershell
# In Vercel dashboard:
# Settings → General → Node.js Version → 18.x
# Build & Development Settings → Environment Variables
# Add: NODE_OPTIONS=--max_old_space_size=4096
```

---

### 3. Environment Variables Not Working

**Solution:**

```powershell
# Redeploy after adding env vars
vercel --prod --force

# Verify env vars are set
vercel env ls
```

---

## Next.js 15+ Compatibility

### 1. Async Route Parameters

**All dynamic routes must use async params:**

```typescript
// Pattern for all [id] routes
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // Use id
}
```

---

### 2. Module Not Found Errors

**Check imports:**

```typescript
// Use path aliases
import { Component } from "@/components/Component"; // ✅
import { Component } from "../../components/Component"; // ❌
```

---

## Prevention Best Practices

### 1. Always Use Type Guards

```typescript
// Check types before operations
if (Array.isArray(data)) {
  data.map(...)
}

// Optional chaining
const value = object?.property?.nestedProperty;
```

---

### 2. Implement Error Boundaries

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

### 3. Add Comprehensive Logging

```typescript
try {
  await operation();
} catch (error) {
  console.error("Operation failed:", {
    error: error.message,
    context: relevantData,
    timestamp: new Date().toISOString(),
  });
}
```

---

### 4. Use Server-Side Operations for Security

```typescript
// Client-side: Only for UI logic
// Server-side (API routes): For all sensitive operations
```

---

## Quick Debugging Checklist

When encountering an error:

- [ ] Check browser console for detailed error message
- [ ] Verify environment variables are set
- [ ] Check network tab for failed API requests
- [ ] Ensure user is authenticated (check auth context)
- [ ] Verify TypeScript types match actual data
- [ ] Check Firebase rules (if database error)
- [ ] Review recent code changes (git diff)
- [ ] Test in incognito mode (clear cache/cookies)

---

## Getting Help

1. **Check Logs:** Browser console, server logs, Vercel logs
2. **Search Docs:** This file, project docs, Next.js docs
3. **Git History:** `git log` to see what changed
4. **Test Endpoint:** Use Postman/curl to isolate issue

---

_Last Updated: November 1, 2025_  
_For additional support, check other documentation files in `/docs`_
