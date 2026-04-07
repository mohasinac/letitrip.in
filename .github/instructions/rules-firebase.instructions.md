---
applyTo: ["src/app/api/**", "src/repositories/**", "src/actions/**"]
description: "Firebase backend-only architecture, upload flow, RTDB patterns, repository pattern, Sieve queries, API route structure, error classes. Rules 11, 12, 13, 14."
---

# Firebase, Repository & API Route Rules

## RULE 11: Firebase — Backend-Only Architecture

| Service                      | Frontend?                  | Location                        |
| ---------------------------- | -------------------------- | ------------------------------- |
| Firebase Auth                | ❌ NEVER                   | `src/app/api/**` Admin SDK only |
| Firestore                    | ❌ NEVER                   | `src/app/api/**` Admin SDK only |
| Firebase Storage             | ❌ NEVER                   | `src/app/api/**` Admin SDK only |
| Realtime DB (read/subscribe) | ✅ read-only, custom token | Client listener only            |
| Realtime DB (write)          | ❌ NEVER                   | Backend Admin SDK only          |

```typescript
// ❌ WRONG — any Firebase client SDK in UI code
import { signInWithEmailAndPassword } from "firebase/auth";
import { db } from "@/lib/firebase/config"; // in components/hooks/services

// ✅ RIGHT — Admin SDK only in API routes
import {
  getAdminDb,
  getAdminAuth,
  getAdminStorage,
} from "@/lib/firebase/admin";
```

NEVER import `@/lib/firebase/config` in components, hooks, services, contexts, or pages.  
NEVER import `@/lib/firebase/admin` outside backend modules (`src/app/api/**`, `src/repositories/**`, `src/actions/**`).

Prefer provider packages for shared backend infrastructure: `@mohasinac/db-firebase`, `@mohasinac/auth-firebase`, `@mohasinac/storage-firebase`.

### File Upload — Three-Phase Flow

**Phase 1 — Stage locally**: `File` → local state + `URL.createObjectURL()` preview. No network.  
**Phase 2 — Edit locally**: crop, trim, metadata — pure React state.  
**Phase 3 — Submit**: `FormData { file, metadata: JSON }` → POST `/api/media/upload` → backend validates, uploads to Storage, writes Firestore → returns `{ url, id }`.

NEVER upload directly from browser to Firebase Storage.

Every file submission MUST include `MediaDisplayMeta` with: `cropX/Y`, `cropWidth/Height`, `zoom`, `focalX/Y`, `aspectRatio`, `objectFit`, `displayMode`, `originalWidth/Height`, `mimeType`, `fileSize`, `seoContext`, `alt`.

**Entity-First pattern**: save entity to Firestore first (get `id`/`slug`), then upload media.

### Realtime DB — Subscribe-Only Pattern

```typescript
// Client uses a dedicated mini-app + server-issued custom token
import { realtimeApp } from "@/lib/firebase/realtime";
const token = await realtimeTokenService.getToken(); // calls /api/realtime/token
await signInWithCustomToken(getAuth(realtimeApp), token.customToken);
onValue(ref(getDatabase(realtimeApp), `chat/${chatId}/messages`), handler);
```

Two RTDB lifecycle patterns:

- **One-shot event bridge** (`useRealtimeEvent`, `useAuthEvent`, `usePaymentEvent`) — single event → terminal state → auto-cleanup
- **Persistent stream** (`useChat`, `useRealtimeBids`, `useNotifications`) — runs until unmount

## RULE 12: Repository Pattern

NEVER query Firestore directly in API routes. Use repositories from `@/repositories`.

```typescript
// ❌ WRONG
const users = await getDocs(collection(db, "users"));

// ✅ RIGHT
import { userRepository } from "@/repositories";
const user = await userRepository.findByEmail("user@example.com");
```

Available: `userRepository` · `tokenRepository` · `emailVerificationTokenRepository` · `passwordResetTokenRepository` · `productRepository` · `orderRepository` · `reviewRepository` · `sessionRepository` · `siteSettingsRepository` · `carouselRepository` · `homepageSectionsRepository` · `categoriesRepository` · `couponsRepository` · `faqsRepository` · `bidRepository` · `addressRepository` · `blogRepository` · `cartRepository` · `wishlistRepository` · `chatRepository` · `eventRepository` · `eventEntryRepository` · `newsletterRepository` · `notificationRepository` · `payoutRepository` · `rcRepository` · `storeRepository` · `smsCounterRepository`

### Sieve List Queries

NEVER `findAll()` + in-memory filtering for paginated lists. ALWAYS `sieveQuery()`:

```typescript
// In repository:
static readonly SIEVE_FIELDS: FirebaseSieveFields = {
  title:  { canFilter: true, canSort: true },
  status: { canFilter: true, canSort: false },
};
async list(model: SieveModel) { return this.sieveQuery(model, MyRepository.SIEVE_FIELDS); }
async listForUser(userId: string, model: SieveModel) {
  return this.sieveQuery(model, MyRepository.SIEVE_FIELDS, {
    baseQuery: this.getCollection().where('userId', '==', userId),
  });
}
```

Sieve DSL: `status==published`, `price>=100,price<=500`, `tags@=electronics`, `title_=Shoe`, sorts: `-createdAt,title`

Unsupported (use `applySieveToArray` fallback only): case-insensitive variants, multi-field OR, full-text search.

### Filter Construction (View Layer)

Admin views build Sieve filter strings using `buildSieveFilters()` from `@/helpers`. NEVER use manual `filtersArr.push()` + `.join(",")`:

```tsx
import { buildSieveFilters } from "@/helpers";
const sieveParams = table.buildSieveParams(
  buildSieveFilters(
    ["status==", statusFilter],
    ["totalPrice>=", minAmount],
    ["createdAt>=", dateFrom],
  ),
);
```

For admin list hooks, use the `createAdminListQuery` factory from `@/features/admin/hooks` instead of writing raw `useQuery` + URLSearchParams parsing.

### Atomic Writes — `unitOfWork`

```typescript
import { unitOfWork } from "@/repositories";
await unitOfWork.runTransaction(async (tx) => {
  const product = await unitOfWork.products.findByIdOrFailInTx(tx, productId);
  unitOfWork.products.updateInTx(tx, productId, { stock: product.stock - 1 });
  unitOfWork.orders.updateInTx(tx, orderId, { status: "confirmed" });
});
```

## RULE 13: API Route Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Verify auth
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie)
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken)
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    // 2. Validate with Zod
    const validation = requestSchema.safeParse(await request.json());
    if (!validation.success)
      return ApiErrors.validationError(validation.error.issues);
    // 3. Business logic via repositories
    const result = await yourRepository.doSomething(validation.data);
    // 4. Return
    return successResponse(result, SUCCESS_MESSAGES.YOUR_MODULE.SUCCESS);
  } catch (error) {
    return handleApiError(error); // NEVER expose stack traces to client
  }
}
```

GET list endpoints parse a `SieveModel` from `?filters=&sorts=&page=&pageSize=` URL params.

API conventions — DO NOT mix on the same endpoint:

- **Sieve**: all admin, `/api/products`, `/api/seller/*`
- **Named params**: `/api/search` only

## RULE 14: Error Classes

NEVER throw raw errors or literal strings.

```typescript
// ❌  throw new Error('User not found');
// ✅
import { NotFoundError, AuthenticationError } from "@mohasinac/errors";
throw new NotFoundError(ERROR_MESSAGES.DATABASE.NOT_FOUND);
```

Available: `AppError` · `ApiError` · `ValidationError` · `AuthenticationError` · `AuthorizationError` · `NotFoundError` · `DatabaseError`
