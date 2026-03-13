# Architecture Overview

LetItRip uses a three-tier architecture on top of Next.js App Router with Firebase as the backend.

---

## Request Flow

```
Browser
  │
  ├─ Page load (GET)
  │    └─ RSC Page  →  Repository  →  Firestore
  │         │
  │         └─ passes `initialData` to ClientView
  │               └─ TanStack Query (stale-while-revalidate)
  │                     └─ Hook  →  Service  →  apiClient  →  API Route
  │                                                                └─ Repository  →  Firestore
  │
  └─ Mutation (form submit / button click)
       └─ useMutation(ServerAction)
             └─ Server Action  →  Repository  →  Firestore
                                  (revalidatePath / revalidateTag)
```

---

## Data Fetching Pattern

### Server-Side (RSC pages)

Pages in `src/app/[locale]/` are async React Server Components. They call repositories directly and pass `initialData` to the client feature view:

```ts
// src/app/[locale]/products/page.tsx
export default async function ProductsPage() {
  const products = await productRepository.findMany({ … });
  return <ProductsView initialData={products} />;
}
```

### Client-Side (TanStack Query)

Client views use `useQuery` with a service function as the `queryFn`. The service calls `apiClient` which hits an API route:

```
Component → useQuery(queryFn: service.list) → apiClient.get('/api/products') → /api/route.ts → repository
```

### Mutations (Server Actions)

All write operations are Server Actions in `src/actions/`. UI calls them via `useMutation`:

```ts
const { mutate } = useMutation({ mutationFn: createProductAction });
```

Server Actions run on the server, call a repository, then call `revalidatePath` to bust caches.

---

## Auth Session

- Auth uses Firebase Auth tokens exchanged for an HTTP-only `__session` cookie.
- The middleware (`middleware.ts`) validates the session cookie on every request.
- API routes call `authVerifier.verifySessionCookie(cookie)` (implementing `IAuthVerifier` from `@lir/next`).
- Client reads auth state from `AuthContext` (wraps the current user from the decoded session).

### Auth Flow

```
Login form
  └─ POST /api/auth/login
       └─ Firebase Admin verifyIdToken
            └─ set __session cookie (httpOnly, secure)
                  └─ AuthContext refreshes
```

### Google OAuth Flow

```
/api/auth/google/start  →  Google OAuth URL  →  redirect
/api/auth/google/callback  →  exchange code  →  mint __session cookie
```

---

## Firebase Architecture

| Service               | Usage                                                              |
| --------------------- | ------------------------------------------------------------------ |
| **Firestore**         | Primary database — all entities (products, orders, users, events…) |
| **Firebase Auth**     | Identity provider — token verification only (no client SDK on UI)  |
| **Firebase Storage**  | Media files (product images, avatar, video)                        |
| **Realtime Database** | Live data — auction bids, payment events, auth events              |

**Rule:** The Firebase client SDK is never used in UI components. All Firebase access is server-side only via `firebase-admin` in API routes or Server Actions.

---

## Monorepo Packages

Packages are in `packages/` and linked via TypeScript path aliases (`@lir/*`) — not published to npm.

```
packages/
├── core/    → @lir/core   — Logger, Queue, EventBus, CacheManager, StorageManager
├── http/    → @lir/http   — ApiClient (typed fetch wrapper)
├── next/    → @lir/next   — IAuthVerifier, createApiErrorHandler
├── react/   → @lir/react  — 10 UI hooks (gestures, camera, breakpoint…)
└── ui/      → @lir/ui     — Semantic primitives, Typography, DataTable, common UI
```

See [docs/packages/](packages/) for per-package details.

---

## API Route Structure

All API routes follow the same pattern using `createApiErrorHandler` from `@lir/next`:

```ts
export async function GET(req: NextRequest) {
  const handleError = createApiErrorHandler(serverLogger);
  try {
    const user = await authVerifier.verifySessionCookie(
      req.cookies.get("__session")?.value,
    );
    // … repository calls …
    return NextResponse.json(data);
  } catch (err) {
    return handleError(err, "context label");
  }
}
```

---

## Sieve Query Pattern

Paginated, filtered, sorted lists use the Sieve query convention:

```
GET /api/products?page=1&pageSize=20&sort=price&order=asc&filters[category]=shoes
```

Repositories expose a `findWithSieve(params: SieveParams)` method. The `sieve.helper.ts` applies the same logic in-memory for testing.

---

## i18n

All user-visible strings are in `messages/en.json`. Components use `useTranslations('namespace')` from `next-intl`. Static UI strings that don't warrant translation (admin labels, filter chips) use `UI_LABELS` from `src/constants/ui.ts`.

Routes are prefixed with `[locale]` (e.g. `/en/products`, `/hi/products`). The middleware handles locale detection and redirects.

---

## RBAC

Role hierarchy is defined in `src/constants/rbac.ts`:

```
guest < user < seller < moderator < admin
```

`getRouteAccessConfig(pathname)` returns the minimum role required. Middleware enforces this before the page renders. Client components use `useHasRole`, `useIsAdmin`, `useIsModerator` hooks for conditional rendering.
