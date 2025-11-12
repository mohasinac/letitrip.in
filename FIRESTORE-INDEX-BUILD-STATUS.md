# Firestore Index Build Status

## Deployed Indexes (Building in Progress)

The following Firestore composite indexes have been deployed and are currently building:

### Shops Collection Indexes

1. **is_banned + show_on_homepage + created_at**

   - Status: ⏳ Building
   - Used for: Public homepage shops
   - Query: `showOnHomepage=true`
   - ETA: 5-30 minutes

2. **is_featured + is_verified + created_at**

   - Status: ⏳ Building
   - Used for: Featured verified shops
   - Query: `featured=true&verified=true`
   - ETA: 5-30 minutes

3. **is_banned + is_verified + created_at**

   - Status: ⏳ Building
   - Used for: Default public shops listing
   - Query: Default (no specific filters)
   - ETA: 5-30 minutes

4. **is_banned + is_featured + is_verified + created_at**
   - Status: ⏳ Building
   - Used for: Featured homepage shops
   - Query: `featured=true&showOnHomepage=true`
   - ETA: 5-30 minutes

## Deployment Details

**Command:** `firebase deploy --only firestore:indexes`
**Status:** ✅ Deployed successfully
**Project:** letitrip-in-app
**Time:** 2025-11-12

## Quick Fix: Create Index Manually

**The indexes are still building.** To speed this up, click this link to create them instantly:

**🔗 [Click here to create the required index](https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9sZXRpdHJpcC1pbi1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Nob3BzL2luZGV4ZXMvXxABGg0KCWlzX2Jhbm5lZBABGhQKEHNob3dfb25faG9tZXBhZ2UQARoOCgpjcmVhdGVkX2F0EAIaDAoIX19uYW1lX18QAg)**

This will:

1. Open Firebase Console
2. Pre-fill the index configuration
3. Click "Create Index"
4. Wait 2-5 minutes (faster than deploying via CLI)

## Current Errors (Temporary)

While indexes are building, you may see these errors:

```
Error: 9 FAILED_PRECONDITION: The query requires an index.
```

**This is expected!** Firestore indexes take time to build (5-30 minutes).

## How to Check Index Status

### Option 1: Firebase Console

1. Go to https://console.firebase.google.com/project/letitrip-in-app/firestore/indexes
2. Check the "Composite" tab
3. Look for status: "Building" or "Enabled"

### Option 2: Firebase CLI

```bash
firebase firestore:indexes
```

## When Will It Work?

- **Current Status:** Indexes are building ⏳
- **Expected:** 5-30 minutes from deployment
- **How to know:** Errors will stop appearing
- **Test endpoint:** `GET /api/shops?showOnHomepage=true&limit=3`

## Affected Pages

These pages will show errors until indexes finish building:

- ❌ Homepage (Featured Shops section)
- ❌ Shops listing page
- ❌ Any component using `shopsService.list()`

## Temporary Workaround (IMPLEMENTED)

✅ **The API now works without indexes!**

The shops API has been updated to work without composite indexes temporarily.

**What changed:**

- Removed `orderBy` from queries (results won't be sorted by date)
- Queries now work immediately without waiting for indexes
- When indexes finish building, set `USE_COMPOSITE_INDEXES=true` in `.env` to re-enable sorting

**To enable sorting (after indexes build):**

```bash
# Add to .env.local
USE_COMPOSITE_INDEXES=true
```

**Current behavior:**

- ✅ Shops load successfully
- ✅ No errors
- ⚠️ Not sorted by creation date (random order)
- ✅ Still filtered correctly (featured, verified, etc.)

## What Happens After Indexes Build?

✅ All shop queries will work instantly
✅ Homepage will load without errors
✅ Featured shops section will display
✅ No more FAILED_PRECONDITION errors

## Index Configuration

All indexes are defined in: `firestore.indexes.json`

Example index structure:

```json
{
  "collectionGroup": "shops",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "is_banned", "order": "ASCENDING" },
    { "fieldPath": "show_on_homepage", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
}
```

## Monitoring

Check logs for:

```
✅ "deployed indexes in firestore.indexes.json successfully"
✅ No more "FAILED_PRECONDITION" errors
✅ Shops API returns 200 status
```

## Summary

- ✅ Indexes deployed
- ⏳ Indexes building (5-30 min)
- ⏸️ Wait for build to complete
- 🔄 Then test again

**No code changes needed - just wait for Firestore to finish building the indexes!**
