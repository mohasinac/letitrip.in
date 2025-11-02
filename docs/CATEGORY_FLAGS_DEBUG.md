# Category Flags Not Saving - Debug Guide

## Issue

Category flags (featured, isActive) are not being saved to the database when clicking "Save Changes" in the Featured Categories settings.

## Investigation Steps

### 1. Check Console Logs

When you toggle categories and click "Save Changes", check the browser console for:

```
Sending category updates: [...]
Category update response: [...]
```

And in the terminal/server logs:

```
Batch update request received: { updatesCount: X, updates: [...] }
Updating category cat_xxx: { featured: true, isActive: true, ... }
Successfully updated X categories
```

### 2. Verify Request Data

The frontend should send data like this:

```json
{
  "updates": [
    {
      "id": "cat_1234567890",
      "featured": true,
      "isActive": true,
      "sortOrder": 0
    },
    {
      "id": "cat_0987654321",
      "featured": false,
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

### 3. Check for Errors

Look for these potential issues:

#### A. Authentication Errors

```
401 Unauthorized
{ error: "Authentication required" }
```

**Solution**: Make sure you're logged in as admin

#### B. Invalid Data

```
400 Bad Request
{ error: "Updates array is required" }
{ error: "Category ID is required for each update" }
```

**Solution**: Check that `updates` array is properly formatted

#### C. Firestore Errors

```
500 Internal Server Error
{ error: "Failed to update categories" }
```

**Solution**: Check server logs for Firestore permission errors

### 4. Verify Data in Firestore

After saving, check Firestore Console:

1. Go to Firebase Console → Firestore Database
2. Navigate to `categories` collection
3. Find a category you toggled
4. Verify the fields:
   - `featured`: should be `true` or `false`
   - `isActive`: should be `true` or `false`
   - `sortOrder`: should be a number
   - `updatedAt`: should be recent timestamp
   - `updatedBy`: should be admin UID

## Files Involved

### Frontend

**`src/components/admin/settings/FeaturedCategoriesSettings.tsx`**

- Line ~114: `handleSave` function
- Prepares update data
- Sends POST request to API
- Now includes console logging

### API

**`src/app/api/admin/categories/batch-update/route.ts`**

- Validates admin authentication
- Validates request data
- Updates Firestore in batch
- Now includes detailed logging

## Enhanced Logging Added

### Frontend Logging

```typescript
console.log("Sending category updates:", updates);
console.log("Category update response:", response);
```

### Backend Logging

```typescript
console.log("Batch update request received:", {
  updatesCount: updates?.length,
  updates: JSON.stringify(updates, null, 2),
});

console.log(`Updating category ${id}:`, updateData);
console.log(`Successfully updated ${updates.length} categories`);
```

## Testing Checklist

1. [ ] Open Featured Categories page
2. [ ] Open browser console (F12)
3. [ ] Toggle a category's "Featured" switch
4. [ ] Click "Save Changes"
5. [ ] Check console logs for "Sending category updates"
6. [ ] Check server terminal for "Batch update request received"
7. [ ] Verify success message appears
8. [ ] Refresh page - changes should persist
9. [ ] Check Firestore database directly

## Common Issues & Solutions

### Issue 1: Changes Don't Persist

**Symptoms**:

- Success message appears
- But refreshing page shows old values

**Possible Causes**:

- Firestore update succeeds but fetch doesn't reload
- Cache issue

**Solution**:

```typescript
// After successful save, refetch data
await fetchCategories();
```

### Issue 2: No Network Request

**Symptoms**:

- No console logs
- No network activity
- Button doesn't seem to do anything

**Possible Causes**:

- Button is disabled
- `hasChanges` is false

**Solution**:

- Make sure you've toggled something first
- Check that `hasChanges` state is set to true

### Issue 3: 401 Unauthorized

**Symptoms**:

```
POST /api/admin/categories/batch-update 401
```

**Possible Causes**:

- Not logged in
- Not an admin
- Token expired

**Solution**:

- Log out and log back in
- Verify user role is "admin"

### Issue 4: Firestore Permission Denied

**Symptoms**:

```
Error updating category: FirebaseError: PERMISSION_DENIED
```

**Possible Causes**:

- Using client SDK instead of Admin SDK
- Firestore rules blocking update

**Solution**:

- API already uses Admin SDK (bypasses rules)
- Check that `getAdminDb()` is being used

## API Structure

### Request

```typescript
POST /api/admin/categories/batch-update
Content-Type: application/json
Authorization: Bearer <firebase-token>

{
  "updates": [
    {
      "id": "cat_123",
      "featured": true,
      "isActive": true,
      "sortOrder": 0
    }
  ]
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Updated 5 categories",
  "updatedCount": 5
}
```

### Response (Error)

```json
{
  "error": "Authentication required"
}
```

## Next Steps

1. **Try saving** and check console/terminal logs
2. **Copy the logs** and share them if issue persists
3. **Check Firestore** directly to see if data changed
4. **Look for errors** in red in console or terminal

The enhanced logging will show exactly what's being sent and what's happening on the server.
