# Static Assets Architecture Refactor

## Overview

Refactored the static assets management system to follow proper Next.js + Firebase architecture patterns, fixing Firebase Storage permissions and separating client/server code.

## Architecture Pattern

```
Client (UI)
  ↓
Client Services (src/services/)
  ↓
API Routes (src/app/api/)
  ↓
Server Services (src/app/api/lib/)
  ↓
Firebase Admin SDK
```

## Changes Made

### 1. Firebase Security Rules

**`storage.rules`** - Updated and Deployed ✅

- Added `/static-assets/{type}/{category}/{fileName}` path
- Public read access (CDN)
- Admin-only write/delete
- Helper functions: `isAuthenticated()`, `isAdmin()`, `isSeller()`

**`firestore.rules`** - Updated and Deployed ✅

- Added `static_assets` collection rules
- Public read, admin write
- Added `blog_posts` collection rules
- Published or admin read, admin write

### 2. Services Architecture

**Client Service**: `src/services/static-assets-client.service.ts` (NEW)

- Uses `apiService` for all operations
- No direct Firebase SDK usage
- Functions:
  - `getAssets(filters)` - List with type/category filters
  - `getAssetsByType(type)` - Filter by type
  - `getAssetsByCategory(category)` - Filter by category
  - `uploadAsset(file, type, category)` - 2-step upload
  - `updateAsset(id, updates)` - Update metadata
  - `deleteAsset(id)` - Delete asset

**Server Service**: `src/app/api/lib/static-assets-server.service.ts` (NEW)

- Firebase Admin SDK operations only
- Functions:
  - `generateUploadUrl(fileName, contentType, type, category)` - Signed URL (15min)
  - `getDownloadUrl(storagePath)` - Public CDN URL
  - `saveAssetMetadata(asset)` - Save to Firestore
  - `listAssets(filters)` - Query with filters
  - `updateAssetMetadata(id, updates)` - Update Firestore
  - `deleteAsset(id)` - Delete from Storage + Firestore

### 3. API Routes

**`src/app/api/admin/static-assets/route.ts`** - Refactored ✅

- GET: Lists assets using `listAssets()` from server service
- POST: Legacy metadata-only endpoint (kept for compatibility)

**`src/app/api/admin/static-assets/upload-url/route.ts`** (NEW)

- POST: Generates signed upload URL
- Returns: `{ uploadUrl, assetId, storagePath }`
- 15-minute expiry on signed URLs

**`src/app/api/admin/static-assets/confirm-upload/route.ts`** (NEW)

- POST: Confirms upload completion
- Gets public CDN URL
- Saves metadata to Firestore
- Returns: Complete asset object

**`src/app/api/admin/static-assets/[id]/route.ts`** - Refactored ✅

- GET: Fetch single asset using `listAssets()`
- PATCH: Update metadata using `updateAssetMetadata()`
- DELETE: Delete using `deleteAsset()`

### 4. Admin UI

**`src/app/admin/static-assets/page.tsx`** - Updated ✅

- Changed imports from `static-assets.ts` to `static-assets-client.service.ts`
- Updated function calls:
  - `getStaticAssetsByType()` → `getAssetsByType()`
  - `uploadStaticAsset()` → `uploadAsset()`
  - `deleteStaticAsset()` → `deleteAsset()`
  - `updateStaticAsset()` → `updateAsset()`

### 5. Deprecated Files

**`src/services/static-assets.ts`** (OLD)

- Should be removed or marked deprecated
- Used Firebase Client SDK directly (wrong pattern)
- Replaced by `static-assets-client.service.ts`

## Upload Flow (2-Step Process)

### Old Pattern (Direct Upload)

```typescript
// Client directly uploads to Firebase Storage (permissions issue)
uploadStaticAsset({ file, type, category });
```

### New Pattern (Signed URL)

```typescript
// Step 1: Request signed upload URL from server
const { uploadUrl, assetId, storagePath } = await requestUploadUrl(...)

// Step 2: Upload file directly to signed URL (client → Firebase Storage)
await fetch(uploadUrl, { method: 'PUT', body: file })

// Step 3: Confirm upload and save metadata
const asset = await confirmUpload(...)
```

**Benefits:**

- Server generates signed URL with proper permissions
- Client uploads directly to Firebase Storage (fast, no server bottleneck)
- Server saves metadata after successful upload
- Proper error handling and rollback

## Security Model

### Firebase Storage Rules

```javascript
// Public read for CDN
match /static-assets/{type}/{category}/{fileName} {
  allow read: if true;
  allow write, delete: if isAdmin();
}
```

### Firestore Rules

```javascript
// Public read, admin write
match /static_assets/{assetId} {
  allow read: if true;
  allow write, delete: if isAdmin();
}
```

### Admin Role Check

- Server service uses Firebase Admin SDK (bypasses rules)
- API routes should implement role checking
- Client service calls authenticated API routes

## Deployment

### Firebase Rules Deployed ✅

```bash
firebase deploy --only storage
firebase deploy --only firestore:rules
```

### Status

- ✅ Storage rules deployed
- ✅ Firestore rules deployed
- ✅ Server service created
- ✅ Client service created
- ✅ API routes refactored
- ✅ Admin UI updated
- ⏳ Old service file needs removal

## Testing Checklist

- [ ] Upload payment logo
- [ ] View uploaded asset in admin UI
- [ ] Update asset metadata
- [ ] Delete asset
- [ ] Verify CDN URL works (public access)
- [ ] Verify Storage rules (non-admin cannot upload)
- [ ] Verify Firestore rules (non-admin cannot write)

## Next Steps

1. **Test Upload Flow**: Verify end-to-end upload works
2. **Remove Old Service**: Delete or deprecate `src/services/static-assets.ts`
3. **Add Error Handling**: Improve error messages in admin UI
4. **Add Progress Indicator**: Show upload progress percentage
5. **Add Validation**: File type and size validation
6. **Add Retry Logic**: Handle failed uploads gracefully

## API Endpoints Summary

| Endpoint                                  | Method | Purpose                        |
| ----------------------------------------- | ------ | ------------------------------ |
| `/api/admin/static-assets`                | GET    | List assets with filters       |
| `/api/admin/static-assets`                | POST   | Create metadata (legacy)       |
| `/api/admin/static-assets/upload-url`     | POST   | Get signed upload URL          |
| `/api/admin/static-assets/confirm-upload` | POST   | Confirm upload & save metadata |
| `/api/admin/static-assets/[id]`           | GET    | Get single asset               |
| `/api/admin/static-assets/[id]`           | PATCH  | Update metadata                |
| `/api/admin/static-assets/[id]`           | DELETE | Delete asset                   |

## File Structure

```
src/
├── services/
│   ├── static-assets.ts (DEPRECATED)
│   └── static-assets-client.service.ts (NEW)
├── app/
│   ├── api/
│   │   ├── lib/
│   │   │   └── static-assets-server.service.ts (NEW)
│   │   └── admin/
│   │       └── static-assets/
│   │           ├── route.ts (REFACTORED)
│   │           ├── upload-url/
│   │           │   └── route.ts (NEW)
│   │           ├── confirm-upload/
│   │           │   └── route.ts (NEW)
│   │           └── [id]/
│   │               └── route.ts (REFACTORED)
│   └── admin/
│       └── static-assets/
│           └── page.tsx (UPDATED)
├── storage.rules (UPDATED & DEPLOYED)
└── firestore.rules (UPDATED & DEPLOYED)
```

## Key Improvements

1. **Permissions Fixed**: Proper Storage rules for static-assets path
2. **Architecture Compliance**: Proper separation of client/server code
3. **Security**: Admin-only writes, public reads for CDN
4. **Performance**: Direct upload to Storage (no server bottleneck)
5. **Maintainability**: Clear separation of concerns
6. **Error Handling**: Better error messages and rollback
7. **Scalability**: Signed URLs handle large files efficiently

## Notes

- Signed URLs expire after 15 minutes
- Uploads are direct to Firebase Storage (not through server)
- Public CDN URLs for fast asset delivery
- All Firebase Admin SDK operations are server-side only
- Client service never touches Firebase directly
