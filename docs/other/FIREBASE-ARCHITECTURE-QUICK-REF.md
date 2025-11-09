# Firebase Architecture Quick Reference

## The Golden Rule

**NEVER use Firebase Client SDK directly in client code. Always use API routes.**

## Architecture Pattern

```
┌─────────────────┐
│   Client Code   │  UI Components (src/app/, src/components/)
│   (Browser)     │
└────────┬────────┘
         │ apiService.post('/api/...')
         ▼
┌─────────────────┐
│ Client Services │  src/services/*-client.service.ts
│                 │  - Call API routes
│                 │  - Handle errors
│                 │  - Return typed data
└────────┬────────┘
         │ HTTP Request
         ▼
┌─────────────────┐
│   API Routes    │  src/app/api/**/route.ts
│  (Next.js Edge) │  - Validate requests
│                 │  - Call server services
│                 │  - Return responses
└────────┬────────┘
         │ Function call
         ▼
┌─────────────────┐
│ Server Services │  src/app/api/lib/*-server.service.ts
│  (Node.js)      │  - Firebase Admin SDK ONLY
│                 │  - Business logic
│                 │  - Database operations
└────────┬────────┘
         │ Firebase Admin SDK
         ▼
┌─────────────────┐
│    Firebase     │
│   (Backend)     │  Storage, Firestore, Auth
└─────────────────┘
```

## File Naming Conventions

| Layer          | Pattern               | Example                                    |
| -------------- | --------------------- | ------------------------------------------ |
| Client Service | `*-client.service.ts` | `static-assets-client.service.ts`          |
| Server Service | `*-server.service.ts` | `static-assets-server.service.ts`          |
| API Route      | `route.ts`            | `src/app/api/admin/static-assets/route.ts` |

## Upload Flow (2-Step Pattern)

### Why 2-Step?

1. **Security**: Server generates signed URL with proper permissions
2. **Performance**: Client uploads directly to Firebase (no server bottleneck)
3. **Reliability**: Server saves metadata only after successful upload

### Implementation

**Step 1: Request Signed URL**

```typescript
// Client Service
const response = await apiService.post('/api/admin/static-assets/upload-url', {
  fileName: 'image.png',
  contentType: 'image/png',
  type: 'icon',
  category: 'navigation'
});

// API Route
export async function POST(req: NextRequest) {
  const { fileName, contentType, type, category } = await req.json();
  const { uploadUrl, assetId, storagePath } = await generateUploadUrl(
    fileName, contentType, type, category
  );
  return NextResponse.json({ uploadUrl, assetId, storagePath });
}

// Server Service
export async function generateUploadUrl(...) {
  const storage = getStorage();
  const file = bucket.file(`static-assets/${type}/${category}/${uuid()}-${fileName}`);

  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return { uploadUrl, assetId: uuid(), storagePath: file.name };
}
```

**Step 2: Upload Directly to Firebase**

```typescript
// Client Service (direct upload, bypasses server)
await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": file.type },
});
```

**Step 3: Confirm Upload**

```typescript
// Client Service
const asset = await apiService.post("/api/admin/static-assets/confirm-upload", {
  assetId,
  name: file.name,
  type,
  storagePath,
  category,
  uploadedBy: userId,
  size: file.size,
  contentType: file.type,
});

// API Route
export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = await getDownloadUrl(body.storagePath);
  const asset = await saveAssetMetadata({ ...body, url });
  return NextResponse.json({ success: true, asset });
}

// Server Service
export async function saveAssetMetadata(asset: StaticAsset) {
  const db = getFirestoreAdmin();
  await db.collection("static_assets").doc(asset.id).set(asset);
  return asset;
}
```

## Storage Paths Reference

| Path                                  | Who    | File Types    | Size Limit | Public Read          |
| ------------------------------------- | ------ | ------------- | ---------- | -------------------- |
| `/shop-logos/**`                      | Seller | Images        | None       | ✅                   |
| `/shop-banners/**`                    | Seller | Images        | None       | ✅                   |
| `/product-images/**`                  | Seller | Images        | None       | ✅                   |
| `/product-videos/**`                  | Seller | Videos        | 100MB      | ✅                   |
| `/static-assets/{type}/{category}/**` | Admin  | All           | 50MB       | ✅                   |
| `/blog-media/{postId}/**`             | Admin  | Images/Videos | 50MB       | ✅                   |
| `/user-documents/{userId}/**`         | User   | Documents     | 10MB       | ❌ (User/Admin only) |

## Anti-Patterns to Avoid

### ❌ Wrong: Direct Firebase SDK in Client

```typescript
// ❌ NEVER DO THIS in client code
"use client";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const storage = getStorage();
const storageRef = ref(storage, "path/to/file");
await uploadBytes(storageRef, file);
```

**Why wrong?**

- Exposes Firebase config to client
- Security rules can be bypassed
- No server-side validation
- No metadata tracking
- Difficult to debug

### ❌ Wrong: Mixing Client and Server Code

```typescript
// ❌ NEVER DO THIS
import { getStorage as getClientStorage } from "firebase/storage";
import { getStorage as getAdminStorage } from "firebase-admin/storage";

// Confusion! Which one am I using?
```

**Why wrong?**

- Unclear which SDK is being used
- Build errors (client/server mismatch)
- Security vulnerabilities

### ❌ Wrong: API Route Without Server Service

```typescript
// ❌ DON'T DO THIS
export async function POST(req: NextRequest) {
  const storage = getStorage();
  const file = bucket.file("path");
  await file.save(buffer);
  // Business logic directly in route
}
```

**Why wrong?**

- Mixes concerns (routing + business logic)
- Difficult to test
- Cannot reuse logic elsewhere
- Violates separation of concerns

## ✅ Correct Patterns

### Client Service (src/services/)

```typescript
// ✅ CORRECT
import { apiService } from "@/services/api.service";

export async function uploadAsset(file: File, type: string) {
  // 1. Request signed URL
  const { uploadUrl, assetId } = await apiService.post(
    "/api/admin/static-assets/upload-url",
    { fileName: file.name, contentType: file.type, type },
  );

  // 2. Upload directly to Firebase
  await fetch(uploadUrl, { method: "PUT", body: file });

  // 3. Confirm and save metadata
  const { asset } = await apiService.post(
    "/api/admin/static-assets/confirm-upload",
    { assetId, name: file.name, type, size: file.size },
  );

  return asset;
}
```

### API Route (src/app/api/)

```typescript
// ✅ CORRECT
import { generateUploadUrl } from "@/app/api/lib/static-assets-server.service";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validation
  if (!body.fileName || !body.contentType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Call server service
  const result = await generateUploadUrl(body.fileName, body.contentType);

  return NextResponse.json({ success: true, ...result });
}
```

### Server Service (src/app/api/lib/)

```typescript
// ✅ CORRECT
import { getStorage } from "firebase-admin/storage";
import { getFirestoreAdmin } from "./firebase/admin";

export async function generateUploadUrl(fileName: string, contentType: string) {
  const storage = getStorage();
  const bucket = storage.bucket();
  const file = bucket.file(`static-assets/${fileName}`);

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  return { uploadUrl, storagePath: file.name };
}
```

## Debugging Checklist

When media upload fails, check:

1. **Storage Rules**: Are they deployed? (`firebase deploy --only storage`)
2. **File Type**: Is the file type allowed in storage.rules?
3. **Size Limit**: Does the file exceed the size limit?
4. **Signed URL**: Has it expired? (15-minute expiry)
5. **Permissions**: Does the user have the correct role?
6. **Content Type**: Is the content type header correct?
7. **CORS**: Are CORS headers configured on Firebase Storage?

## Testing Strategy

### Unit Tests

- Test server services in isolation
- Mock Firebase Admin SDK
- Test business logic

### Integration Tests

- Test API routes end-to-end
- Use Firebase emulators
- Test upload flow completely

### E2E Tests

- Test from UI to Firebase
- Use real Firebase project (dev/staging)
- Test all file types and sizes

## Migration Guide

If you have existing code using Firebase Client SDK:

1. **Create Server Service**: Move Firebase operations to `src/app/api/lib/`
2. **Create API Route**: Add endpoints in `src/app/api/`
3. **Update Client Service**: Change to call API routes instead
4. **Test**: Verify upload flow works end-to-end
5. **Deploy Rules**: Update storage.rules and deploy
6. **Remove Client SDK**: Delete Firebase Client SDK imports

## Key Takeaways

✅ **DO**:

- Use Firebase Admin SDK in server services only
- Call API routes from client services
- Use 2-step upload pattern (signed URL)
- Deploy storage rules with validation
- Track file metadata in Firestore

❌ **DON'T**:

- Use Firebase Client SDK in components
- Mix client and server Firebase code
- Upload through server (bypass signed URLs)
- Hardcode file paths or permissions
- Skip metadata tracking

## Quick Reference Links

- **Storage Rules**: `storage.rules`
- **Firestore Rules**: `firestore.rules`
- **Client Services**: `src/services/*-client.service.ts`
- **Server Services**: `src/app/api/lib/*-server.service.ts`
- **API Routes**: `src/app/api/**/route.ts`
- **Architecture Guide**: `STATIC-ASSETS-REFACTOR.md`
- **Storage Enhancement**: `STORAGE-RULES-ENHANCEMENT.md`
