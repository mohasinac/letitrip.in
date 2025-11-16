# Admin Pages - Infinite API Call Fix Guide

## Problem Overview

Multiple admin pages are making hundreds of duplicate API calls per second, causing:

- Server overload
- Poor performance
- Excessive database reads
- Bad user experience

## Root Cause

**Object Dependencies in useEffect**:

```typescript
// ❌ WRONG - currentUser is an object that changes reference every render
useEffect(() => {
  loadData();
}, [currentUser, isAdmin]);
```

The `currentUser` object gets a new reference on every render, even if its values haven't changed, causing the useEffect to run infinitely.

## Solution Pattern

### 1. Use Primitive Dependencies

```typescript
// ✅ CORRECT - Use primitive values that don't change reference
useEffect(() => {
  if (currentUser?.uid && isAdmin) {
    loadData();
  }
}, [currentUser?.uid, isAdmin]);
```

### 2. Add Loading Protection

```typescript
const loadingRef = useRef(false);

const loadData = useCallback(async () => {
  if (loadingRef.current) return; // Prevent concurrent calls

  try {
    loadingRef.current = true;
    await apiCall();
  } finally {
    loadingRef.current = false;
  }
}, [dependencies]);
```

### 3. Use the useSafeLoad Hook (Recommended)

```typescript
import { useAdminLoad } from "@/hooks/useSafeLoad";

const loadData = async () => {
  const data = await apiService.fetchData();
  setData(data);
};

useAdminLoad(loadData, {
  user: currentUser,
  requiredRole: "admin",
  deps: [filter1, filter2],
});
```

### 4. Debounce Search Inputs

```typescript
import { useDebounce } from "@/hooks/useDebounce";

const [searchQuery, setSearchQuery] = useState("");
const debouncedSearch = useDebounce(searchQuery, 500);

// Use debouncedSearch for filtering, not searchQuery
const filtered = data.filter((item) => item.name.includes(debouncedSearch));
```

## Pages That Need Fixing

### Critical (Making 100+ calls/second)

- [ ] `/admin/products`
- [ ] `/admin/orders`
- [ ] `/admin/shops`
- [ ] `/admin/payments`
- [ ] `/admin/payouts`
- [ ] `/admin/categories`
- [ ] `/admin/auctions`

### High Priority (Making 10-50 calls/second)

- [ ] `/admin/reviews`
- [ ] `/admin/coupons`
- [ ] `/admin/tickets`
- [ ] `/admin/returns`
- [ ] `/admin/blog`

### Medium Priority

- [ ] `/admin/analytics`
- [ ] `/admin/settings`

## Step-by-Step Fix Process

### Step 1: Add Imports

```typescript
import { useCallback, useRef } from "react";
import { useAdminLoad } from "@/hooks/useSafeLoad";
import { useDebounce } from "@/hooks/useDebounce";
```

### Step 2: Add Refs and Debounce

```typescript
// For search
const [searchQuery, setSearchQuery] = useState("");
const debouncedSearchQuery = useDebounce(searchQuery, 500);

// For loading protection (if not using useSafeLoad)
const loadingRef = useRef(false);
const hasLoadedRef = useRef(false);
```

### Step 3: Update Load Function

```typescript
const loadData = useCallback(async () => {
  // Protection if not using useSafeLoad
  if (loadingRef.current) return;

  try {
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    const filters: any = {};
    if (filter1 !== "all") filters.filter1 = filter1;

    const data = await service.list(filters);
    setData(data.data || []);
    hasLoadedRef.current = true;
  } catch (err) {
    console.error("Failed to load:", err);
    setError(err.message);
  } finally {
    setLoading(false);
    loadingRef.current = false;
  }
}, [filter1, filter2]); // Only primitive values!
```

### Step 4: Replace useEffect with useSafeLoad

```typescript
// ❌ OLD
useEffect(() => {
  if (currentUser && isAdmin) {
    loadData();
  }
}, [currentUser, isAdmin, filter1, filter2]);

// ✅ NEW
useAdminLoad(loadData, {
  user: currentUser,
  requiredRole: "admin",
  deps: [filter1, filter2],
});
```

### Step 5: Update Filtering Logic

```typescript
// Use debounced search
const filteredData = data.filter((item) => {
  const matchesSearch =
    !debouncedSearchQuery ||
    item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
  return matchesSearch;
});
```

## Example: Complete Before/After

### BEFORE (Problematic)

```typescript
export default function AdminProductsPage() {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadProducts = async () => {
    const data = await productsService.list({ category: categoryFilter });
    setProducts(data);
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadProducts();
    }
  }, [user, isAdmin, categoryFilter]); // ❌ user is object

  const filtered = products.filter(p =>
    p.name.includes(searchQuery) // ❌ No debounce
  );

  return ...;
}
```

### AFTER (Fixed)

```typescript
import { useCallback, useRef } from 'react';
import { useAdminLoad } from '@/hooks/useSafeLoad';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // ✅ Debounce search
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // ✅ useCallback with primitive deps
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (categoryFilter !== 'all') filters.category = categoryFilter;

      const data = await productsService.list(filters);
      setProducts(data.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  // ✅ Safe load with primitive deps
  useAdminLoad(loadProducts, {
    user,
    requiredRole: 'admin',
    deps: [categoryFilter],
  });

  // ✅ Filter with debounced search
  const filtered = products.filter(p =>
    !debouncedSearchQuery ||
    p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  return ...;
}
```

## Verification Checklist

After fixing a page, verify:

1. **Network Tab**: Only 1-2 API calls on page load
2. **Console**: No "[useSafeLoad] Already loading" spam
3. **Search**: No API calls until 500ms after typing stops
4. **Filters**: Only 1 API call per filter change
5. **Navigation**: No calls when navigating away

## Common Mistakes to Avoid

### ❌ Using Objects in Dependencies

```typescript
useEffect(() => {}, [user, config, filters]);
```

### ❌ Not Debouncing Search

```typescript
const filtered = data.filter((item) => item.name.includes(searchQuery));
```

### ❌ Missing Loading Protection

```typescript
const loadData = async () => {
  // No check if already loading
  await apiCall();
};
```

### ❌ Not Using useCallback

```typescript
const loadData = async () => {}; // New function every render
useEffect(() => {
  loadData();
}, [loadData]); // Infinite loop
```

## Tools for Debugging

### 1. Console Logging

```typescript
const loadData = useCallback(async () => {
  console.log("[Products] Loading with filters:", { category, status });
  // ...
}, [category, status]);
```

### 2. Network Tab Monitoring

Look for patterns like:

```
GET /api/products 200 in 30ms
GET /api/products 200 in 28ms
GET /api/products 200 in 31ms (repeated 100+ times)
```

### 3. React DevTools Profiler

- Record user interaction
- Look for components rendering 100+ times/second

## Performance Targets

- **Page Load**: Max 1-2 API calls
- **Filter Change**: Max 1 API call (after debounce)
- **Search**: Max 1 API call per 500ms
- **Concurrent Calls**: 0 duplicate requests

## Priority Order for Fixes

1. **Users page** ✅ DONE - Was making 200+ calls/second
2. **Products page** - Likely making 100+ calls/second
3. **Orders page** - High traffic page
4. **Shops page** - Many filters
5. **Payments page** - Financial data
6. **Categories page** - Many filters
7. **Auctions page** - Real-time data
8. **Reviews page** - User-facing
9. **Coupons page** - Less traffic
10. **Tickets page** - Admin only

## Testing Script

Run this in browser console to detect infinite loops:

```javascript
let callCount = 0;
const originalFetch = window.fetch;

window.fetch = function (...args) {
  callCount++;
  console.log(`API Call #${callCount}:`, args[0]);

  if (callCount > 10) {
    console.error("⚠️ TOO MANY CALLS! Possible infinite loop");
    debugger; // Pause execution
  }

  return originalFetch.apply(this, args);
};

// Reset after 5 seconds
setTimeout(() => {
  callCount = 0;
}, 5000);
```

## Additional Resources

- `src/hooks/useSafeLoad.ts` - Safe loading hook
- `src/hooks/useDebounce.ts` - Debounce/throttle hooks
- `src/services/api.service.ts` - Request deduplication
- `API-OPTIMIZATION-AND-USERS-CONSOLIDATION.md` - Detailed guide

## Status Tracking

**Fixed**:

- ✅ `/admin/users` - 200+ calls → 1 call

**In Progress**:

- 🔄 All other admin pages

**Remaining**: 15+ pages

---

**Last Updated**: November 17, 2025
**Priority**: CRITICAL
**Impact**: Prevents server overload and database quota exhaustion
