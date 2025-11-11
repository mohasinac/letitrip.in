# Firebase Index Build Instructions

## Current Status

✅ All required indexes have been added to `firestore.indexes.json`
✅ Indexes have been deployed to Firebase using `firebase deploy --only firestore:indexes`

## ⏳ Index Build Process

**IMPORTANT**: After deploying index definitions, Firebase needs time to **build** the indexes by scanning existing data.

### Build Time Estimates

- **Small datasets** (< 1000 docs): 1-5 minutes
- **Medium datasets** (1000-10000 docs): 5-30 minutes
- **Large datasets** (> 10000 docs): 30 minutes to several hours

### Check Index Build Status

1. **Via Firebase Console**:

   - Go to: https://console.firebase.google.com/project/justforview1/firestore/indexes
   - Look for indexes with status "Building" 🔨 or "Enabled" ✅
   - Wait for all indexes to show "Enabled" ✅

2. **Via Firebase CLI**:

   ```powershell
   firebase firestore:indexes --project justforview1
   ```

3. **Via Error Messages**:
   If you see `FAILED_PRECONDITION` errors, the error message includes a direct link to create the index.
   Click the link to verify if the index exists and check its build status.

## 🔍 Indexes Added (November 11, 2025)

### Shops Collection

1. **Featured + Verified Shops**

   ```
   is_featured (ASC) + is_verified (ASC) + created_at (DESC) + __name__ (DESC)
   ```

   **Used by**: `/api/shops?featured=true&verified=true`

2. **Homepage Shops**
   ```
   is_banned (ASC) + show_on_homepage (ASC) + created_at (DESC) + __name__ (ASC)
   ```
   **Used by**: `/api/shops?showOnHomepage=true`

### Categories Collection

3. **Homepage Categories**
   ```
   show_on_homepage (ASC) + sort_order (ASC) + __name__ (ASC)
   ```
   **Used by**: `/api/categories/homepage`

### Blog Posts Collection

4. **Homepage Blog Posts**
   ```
   showOnHomepage (ASC) + status (ASC) + publishedAt (DESC) + __name__ (DESC)
   ```
   **Used by**: `/api/blog?showOnHomepage=true&status=published`

### Reviews Collection

5. **Featured Reviews**
   ```
   isFeatured (ASC) + isApproved (ASC) + verifiedPurchase (ASC) + created_at (DESC)
   ```
   **Used by**: `/api/reviews?isFeatured=true&isApproved=true&verifiedPurchase=true`

## 🚀 What to Do Now

### Option 1: Wait for Build to Complete (Recommended)

1. Check index status in Firebase Console
2. Wait for all indexes to show "Enabled" ✅
3. Refresh your app - errors should be gone

### Option 2: Create Indexes Manually (Faster)

1. Look at the error messages in your terminal
2. Each error contains a direct link like:
   ```
   https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=...
   ```
3. Click each link - it will show you the exact index needed
4. Click "Create Index" button in Firebase Console
5. Wait for build to complete

### Option 3: Use Single-Field Indexes Temporarily

If you need the app working immediately, you can modify queries to avoid composite indexes:

- Remove multiple filters
- Use simpler queries
- Add pagination later

## 📝 Testing After Build

Once all indexes show "Enabled" ✅, test these endpoints:

```powershell
# Test shops API
Invoke-WebRequest -Uri "http://localhost:3000/api/shops?featured=true&verified=true&limit=9"

# Test categories API
Invoke-WebRequest -Uri "http://localhost:3000/api/categories/homepage"

# Test blog API
Invoke-WebRequest -Uri "http://localhost:3000/api/blog?showOnHomepage=true&status=published&limit=20"

# Test reviews API
Invoke-WebRequest -Uri "http://localhost:3000/api/reviews?isFeatured=true&isApproved=true&verifiedPurchase=true&limit=20"
```

All should return `200` status instead of `500`.

## ❓ Common Questions

### Q: Why can't I query immediately after deployment?

**A**: Firebase needs to scan all existing documents to build the index data structure. This is a one-time process per index.

### Q: Can I speed up the build?

**A**: No, build time depends on data volume. For empty collections, indexes build instantly.

### Q: What if I need to add more indexes later?

**A**:

1. Add them to `firestore.indexes.json`
2. Run `firebase deploy --only firestore:indexes`
3. Wait for build to complete

### Q: Do I need to rebuild indexes every time?

**A**: No! Once built, indexes stay active. You only rebuild when:

- Adding new indexes
- Modifying existing indexes
- Deleting and recreating collections

## 🎯 Next Steps

1. ✅ Check Firebase Console for index build status
2. ⏳ Wait for all indexes to show "Enabled"
3. ✅ Test API endpoints
4. ✅ Homepage should load without errors

---

**Last Updated**: November 11, 2025
**Status**: ⏳ Waiting for Firebase to build indexes
**ETA**: 1-30 minutes depending on data volume
