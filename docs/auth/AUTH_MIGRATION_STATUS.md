# Admin & Seller Routes Migration Status

## Summary

Your application has been partially migrated from Firebase Bearer token authentication to session-based authentication. Many API routes still need to be updated.

## ✅ Already Migrated (Session-Based Auth)

- `/api/admin/products` - Main products endpoint
- `/api/admin/products/stats` - Product statistics
- `/api/admin/orders/stats` - Order statistics

## ⚠️ Admin Routes Still Using Old Auth (Bearer Tokens)

### Core Admin Routes

- `src/app/(backend)/api/admin/orders/route.ts`
- `src/app/(backend)/api/admin/users/route.ts`
- `src/app/(backend)/api/admin/users/search/route.ts`
- `src/app/(backend)/api/admin/users/[userId]/route.ts`
- `src/app/(backend)/api/admin/users/[userId]/role/route.ts`
- `src/app/(backend)/api/admin/users/[userId]/ban/route.ts`
- `src/app/(backend)/api/admin/users/[userId]/create-document/route.ts`

### Feature-Specific Admin Routes

- `src/app/(backend)/api/admin/categories/batch-update/route.ts`
- `src/app/(backend)/api/admin/coupons/route.ts`
- `src/app/(backend)/api/admin/coupons/[id]/toggle/route.ts`
- `src/app/(backend)/api/admin/sales/route.ts`
- `src/app/(backend)/api/admin/sales/[id]/toggle/route.ts`
- `src/app/(backend)/api/admin/shipments/route.ts`
- `src/app/(backend)/api/admin/shipments/[id]/cancel/route.ts`
- `src/app/(backend)/api/admin/shipments/[id]/track/route.ts`
- `src/app/(backend)/api/admin/support/route.ts`
- `src/app/(backend)/api/admin/support/stats/route.ts`
- `src/app/(backend)/api/admin/reviews/route.ts`

### System/Config Admin Routes

- `src/app/(backend)/api/admin/hero-settings/route.ts`
- `src/app/(backend)/api/admin/hero-slides/route.ts`
- `src/app/(backend)/api/admin/theme-settings/route.ts`
- `src/app/(backend)/api/admin/bulk/route.ts`
- `src/app/(backend)/api/admin/bulk/export/route.ts`
- `src/app/(backend)/api/admin/migrate-products/route.ts`
- `src/app/(backend)/api/admin/orders/[id]/cancel/route.ts`

## ⚠️ Seller Routes Still Using Old Auth

### Core Seller Routes

- `src/app/(backend)/api/seller/products/route.ts`
- `src/app/(backend)/api/seller/products/[id]/route.ts`
- `src/app/(backend)/api/seller/products/categories/leaf/route.ts`
- `src/app/(backend)/api/seller/shop/route.ts`
- `src/app/(backend)/api/seller/sales/route.ts`

### Seller Shipment Routes

- `src/app/(backend)/api/seller/shipments/route.ts`
- `src/app/(backend)/api/seller/shipments/[id]/route.ts`
- `src/app/(backend)/api/seller/shipments/[id]/label/route.ts`
- `src/app/(backend)/api/seller/shipments/[id]/track/route.ts`
- `src/app/(backend)/api/seller/shipments/[id]/cancel/route.ts`
- `src/app/(backend)/api/seller/shipments/bulk-manifest/route.ts`

## 🔧 Migration Pattern

To migrate a route from Bearer token auth to session auth:

### Old Pattern (Bearer Token):

```typescript
import { getAdminAuth } from "../../_lib/database/admin";
import { AuthorizationError } from "../../_lib/middleware/error-handler";

async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthorizationError("Authentication required");
  }
  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  const decodedToken = await auth.verifyIdToken(token);
  // ...
  return { uid: decodedToken.uid, role, email };
}

export async function GET(request: NextRequest) {
  const user = await verifyAdminAuth(request);
  const result = await controller.someMethod(filters, user);
}
```

### New Pattern (Session-Based):

```typescript
import { requireAdmin } from "../../_lib/auth/session-middleware";
// For seller routes: import { requireSeller } from '../../_lib/auth/session-middleware';

export async function GET(request: NextRequest) {
  // Verify admin authentication using session
  const sessionOrError = await requireAdmin(request);

  // If it's a NextResponse, it's an error response
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError;
  }

  const session = sessionOrError;

  // Use session in controller calls
  const result = await controller.someMethod(filters, {
    uid: session.userId,
    role: session.role,
    email: session.email || undefined,
  });
}
```

## 📝 Recommendations

### Immediate Priority (Causing 403 Errors):

1. Migrate routes that you're actively using in the UI
2. Focus on routes showing up in console errors first

### Manual Migration Steps:

1. Open the route file
2. Remove `getAdminAuth` import
3. Remove `verifyAdminAuth` or `verifySellerAuth` function
4. Add `requireAdmin` or `requireSeller` import
5. Replace auth verification with session pattern
6. Update controller calls to use session object
7. Remove `AuthorizationError` handling (session middleware handles it)

### Batch Migration:

Due to PowerShell regex escaping issues, manual migration is recommended. However, you can:

- Use find/replace in VS Code with regex
- Migrate files in small batches
- Test after each batch

## 🧪 Testing After Migration

1. Clear browser cookies/cache
2. Login again (to get fresh session cookie)
3. Test each migrated endpoint
4. Check for 401/403 errors in console
5. Verify functionality works as expected

## 📊 Progress Tracker

- ✅ Admin Products: DONE (3/3)
- ⏳ Admin Other: TODO (20+ routes)
- ⏳ Seller Routes: TODO (11+ routes)
- ⏳ User Routes: UNKNOWN (needs audit)

Total Estimated: ~40-50 routes need migration
