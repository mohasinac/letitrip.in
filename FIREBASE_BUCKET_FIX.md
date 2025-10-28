# Firebase Storage Bucket 404 Error - Fixed

## 🔴 Issue

```
API Error [500]: {
  "error": {
    "code": 404,
    "message": "The specified bucket does not exist."
  }
}
```

## 🔍 Root Cause

The Firebase Admin SDK was using the wrong bucket naming format:

**❌ Wrong (before):**

```typescript
storageBucket: `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`;
// → "justforview1.appspot.com" (doesn't exist)
```

**✅ Correct (after):**

```typescript
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
// → "justforview1.firebasestorage.app" (exists!)
```

## 📋 Configuration Mismatch

| Component                | Bucket Format                      | Status     |
| ------------------------ | ---------------------------------- | ---------- |
| Client SDK (`config.ts`) | `justforview1.firebasestorage.app` | ✅ Correct |
| Admin SDK (`admin.ts`)   | `justforview1.appspot.com`         | ❌ Wrong   |

Firebase Storage buckets use the `.firebasestorage.app` domain, not `.appspot.com`.

## ✅ Solution Applied

**File:** `src/lib/database/admin.ts`

Changed the storage bucket configuration to use the environment variable:

```typescript
// BEFORE
storageBucket: `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`;

// AFTER
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`;
```

This now reads from `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` which is correctly set to `justforview1.firebasestorage.app` in `env-config.json`.

## 🔧 Testing the Fix

1. ✅ File should now match between client and admin SDK
2. ✅ Storage upload endpoint should work
3. ✅ Image preview should load correctly

## 🚀 Next Steps

1. The dev server will auto-reload
2. Try uploading an image in the category admin form
3. Should work without the 404 error

## 📝 Prevention Tips

- **Always sync environment variables** between configurations
- **Client and Admin should use the same bucket** (same project)
- **Use environment variables** for configuration instead of hardcoding
- **Test uploads** early in development to catch this quickly

## 🔗 Related Files

- `src/lib/database/admin.ts` - Firebase Admin configuration (FIXED)
- `src/lib/database/config.ts` - Firebase Client configuration (OK)
- `env-config.json` - Environment variables (OK)
- `src/app/api/storage/upload/route.ts` - Upload endpoint (OK)
- `src/app/api/storage/get/route.ts` - Get endpoint (OK)
