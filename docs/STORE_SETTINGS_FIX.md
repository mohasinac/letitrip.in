# Store Settings Fix - Using API Client

## Problem

The `StoreSettings` component was still using manual Firebase token handling:

```typescript
if (!user?.id || !user.getIdToken) {
  console.error("User not authenticated or getIdToken not available");
  toast.error("Please log in to save settings");
  return;
}

const token = await user.getIdToken();
const response = await fetch(`/api/seller/store-settings`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(settings),
});
```

## Solution

Updated to use the centralized `apiClient`:

```typescript
import { apiClient } from "@/lib/api/client";

// Load settings
const data = await apiClient.get<StoreSettings>("/seller/store-settings");

// Save settings
await apiClient.put("/seller/store-settings", settings);
```

## Benefits

✅ **No manual token handling** - apiClient does it automatically  
✅ **Cleaner code** - Reduced from ~30 lines to ~5 lines per API call  
✅ **Consistent error handling** - apiClient handles 401 redirects  
✅ **Type safety** - Generic types for request/response  
✅ **Automatic retries** - Built into axios interceptors

## Changes Made

### Before:

```typescript
const loadStoreSettings = async () => {
  if (!user?.id || !user.getIdToken) return;
  setLoading(true);
  try {
    const token = await user.getIdToken();
    const response = await fetch(`/api/seller/store-settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setSettings(data);
    }
  } catch (error) {
    console.error("Failed to load store settings:", error);
  } finally {
    setLoading(false);
  }
};
```

### After:

```typescript
const loadStoreSettings = async () => {
  if (!user?.id) return;
  setLoading(true);
  try {
    const data = await apiClient.get<StoreSettings>("/seller/store-settings");
    setSettings(data);
  } catch (error) {
    console.error("Failed to load store settings:", error);
    toast.error("Failed to load store settings");
  } finally {
    setLoading(false);
  }
};
```

## Pattern to Follow

When updating other components, follow this pattern:

### ❌ Old Way (Manual):

```typescript
const token = await user.getIdToken();
const response = await fetch("/api/endpoint", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
const result = await response.json();
```

### ✅ New Way (API Client):

```typescript
import { apiClient } from "@/lib/api/client";

const result = await apiClient.post("/endpoint", data);
```

## Files Updated

- ✅ `src/components/seller/StoreSettings.tsx`

## Similar Files to Update

Search for these patterns and replace with `apiClient`:

```bash
# Find files with manual token handling
grep -r "user.getIdToken" src/

# Find files with manual fetch + Authorization header
grep -r "Authorization.*Bearer" src/

# Find files with credentials: 'include'
grep -r "credentials.*include" src/
```

## Testing

1. ✅ Login as seller/admin
2. ✅ Navigate to `/seller/settings/store`
3. ✅ Form loads existing settings
4. ✅ Can update and save settings
5. ✅ Success toast appears
6. ✅ No console errors

## Next Steps

Update other components following the same pattern:

- `src/lib/services/seller.service.ts`
- `src/lib/services/admin.service.ts`
- Any component making direct `fetch` calls with manual tokens
