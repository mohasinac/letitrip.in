# UI Firebase Removal Guide

## Overview

This document tracks the migration of UI code to use backend API services instead of direct Firebase imports.

## Strategy

1. **Keep Firebase Auth Client-Side**: Firebase Authentication SDK remains in the client for auth state management
2. **Remove Firebase Firestore**: All Firestore operations moved to backend API calls
3. **Remove Firebase Storage**: File uploads now go through backend API services
4. **Service Layer Pattern**: All UI components use service files from `/src/lib/api/services`

## Completed Migrations

### ✅ Services Created

- `storage.service.ts` - File upload/download operations
- `consent.service.ts` - Cookie consent management
- `contact.service.ts` - Contact form submissions
- `hero-banner.service.ts` - Hero banner/carousel management
- `content.service.ts` - CMS content pages

### ✅ UI Files Updated

- `src/app/seller/shop/components/BasicInfoTab.tsx` - Using StorageService
- `src/app/seller/shop/components/BasicInfoTabRefactored.tsx` - Using StorageService

## Files Requiring Migration

### High Priority (Direct Firebase Usage)

#### 1. **src/hooks/data/useFirebase.ts**

- **Current**: Direct Firestore queries with onSnapshot
- **Action**: Deprecate and replace with API service hooks
- **Impact**: HIGH - Used by multiple components

#### 2. **src/contexts/AuthContext.tsx**

- **Current**: Uses Firebase Auth (KEEP) + some Firestore (REMOVE)
- **Action**: Keep Firebase Auth, remove any Firestore dependencies
- **Impact**: HIGH - Core authentication

#### 3. **src/hooks/auth/useEnhancedAuth.ts**

- **Current**: Firebase Auth for Google login, OTP
- **Action**: Keep Firebase Auth methods, ensure no Firestore usage
- **Impact**: MEDIUM - Enhanced auth features

### Files to Check for Firebase Imports

```
src/app/login/page.tsx - Uses Firebase Auth (acceptable)
src/app/register/page.tsx - Uses Firebase Auth (acceptable)
```

## Service Usage Pattern

### Before (Direct Firebase)

```typescript
import { uploadToFirebase } from "@/lib/firebase/storage";

const url = await uploadToFirebase(file, `path/${file.name}`);
```

### After (Service Layer)

```typescript
import { StorageService } from "@/lib/api/services/storage.service";

const url = await StorageService.uploadImage(file, "folder");
```

## API Service Coverage

### Existing Services

- ✅ ProductService
- ✅ CartService
- ✅ WishlistService
- ✅ OrderService
- ✅ ReviewService
- ✅ UserService
- ✅ CategoryService
- ✅ AuthService
- ✅ AddressService
- ✅ PaymentService
- ✅ SearchService
- ✅ GameService
- ✅ SellerService
- ✅ AdminService
- ✅ UploadService
- ✅ StorageService
- ✅ ConsentService
- ✅ ContactService
- ✅ HeroBannerService
- ✅ ContentService

## Firebase Client SDK Usage (Acceptable)

The following Firebase client SDK usage is ACCEPTABLE and should remain:

### 1. Firebase Auth (`firebase/auth`)

```typescript
// KEEP - For client-side auth state
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/api/_lib/database/config";
```

### 2. Firebase Config (`src/app/api/_lib/database/config.ts`)

```typescript
// KEEP - This is the auth initialization
```

## Backend-Only Firebase Usage

All Firebase Admin SDK usage should ONLY be in `/src/app/api/**`:

- `firebase-admin` imports
- Firestore Admin operations
- Storage Admin operations

## Migration Checklist

- [x] Create missing service files
- [x] Update service index exports
- [x] Replace storage uploads in UI components
- [ ] Create hooks that wrap API services (replace useFirebase.ts)
- [ ] Update AuthContext to remove Firestore dependencies
- [ ] Audit all UI files for Firebase imports
- [ ] Update documentation

## Next Steps

1. Create replacement hooks for `useFirebase.ts`:

   - `useProducts` → Use ProductService
   - `useCart` → Use CartService
   - `useAuctions` → Create AuctionService if needed

2. Update any remaining UI components using Firebase

3. Remove unused Firebase helper files from `/src/lib/firebase` if any

## Notes

- The `/api` folder is treated as backend - can use Firebase Admin SDK
- All UI code (`/app`, `/components`, `/hooks`, `/contexts`) should use API services
- Firebase Auth client SDK is acceptable in UI for authentication state
- Real-time features may need polling or WebSocket alternatives
