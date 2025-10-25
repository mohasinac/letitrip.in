# Firebase Config Path Fix

## Issue

Build error: `Module not found: Can't resolve '@/lib/firebase/config'`

## Root Cause

The `apiClient` was trying to import Firebase auth from `@/lib/firebase/config`, but the actual Firebase configuration is located at `@/lib/database/config.ts`.

## Solution

Updated the import path in `src/lib/api/client.ts`:

### Before:

```typescript
import { auth } from "@/lib/firebase/config";
```

### After:

```typescript
import { auth } from "@/lib/database/config";
```

## File Structure

```
src/lib/
├── api/
│   └── client.ts          ✅ Uses @/lib/database/config
├── database/
│   ├── config.ts          ✅ Firebase client config (auth, db, storage)
│   └── admin.ts           ✅ Firebase admin config
└── firebase/              ⚠️  Empty folder (can be removed)
```

## Verification

- ✅ `src/lib/database/config.ts` exports: `auth`, `db`, `storage`, `analytics`
- ✅ No other files import from `@/lib/firebase/config`
- ✅ Build should now complete successfully

## Related Files

- `src/lib/api/client.ts` - Fixed import
- `src/lib/database/config.ts` - Correct Firebase config location
- `src/lib/database/admin.ts` - Firebase admin SDK config

## Next Steps

Consider cleaning up:

1. Remove empty `src/lib/firebase/` folder
2. Rename `src/lib/database/` to `src/lib/firebase/` for clarity (optional)
3. Update all imports if renaming

---

**Status**: ✅ Fixed  
**Date**: October 26, 2025
