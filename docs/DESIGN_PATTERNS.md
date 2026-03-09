# LetItRip — Design Pattern Review & Recommendations

> **Context:** This document accompanies `docs/SSR_MIGRATION_PLAN.md`. Treat every recommendation here as part of the same overhaul — they are sequenced to work together, not independently.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Layer-by-Layer Analysis](#2-layer-by-layer-analysis)
   - 2.1 [Data Fetching — useApiQuery / useApiMutation](#21-data-fetching--useapiquery--useapimutation)
   - 2.2 [Services Layer](#22-services-layer)
   - 2.3 [API Routes & createApiHandler](#23-api-routes--createapihandler)
   - 2.4 [Repository Layer](#24-repository-layer)
   - 2.5 [Form Handling](#25-form-handling)
   - 2.6 [Event Buses & Cache Singletons](#26-event-buses--cache-singletons)
   - 2.7 [apiClient & buildURL](#27-apiclient--buildurl)
   - 2.8 [Pages vs. Views Architecture](#28-pages-vs-views-architecture)
   - 2.9 [Schema Adapters](#29-schema-adapters)
   - 2.10 [Monitoring & Observability](#210-monitoring--observability)
3. [Styling & Theming](#3-styling--theming)
   - 3.1 [Current State](#31-current-state)
   - 3.2 [Problem 1 — Three Parallel Token Systems](#32-problem-1--three-parallel-token-systems)
   - 3.3 [Problem 2 — ThemeContext State Mismatch on First Render](#33-problem-2--themecontext-state-mismatch-on-first-render)
   - 3.4 [Problem 3 — SSR Cannot Know the User's Theme](#34-problem-3--ssr-cannot-know-the-users-theme)
   - 3.5 [Problem 4 — Dual CSS Authoring Approaches](#35-problem-4--dual-css-authoring-approaches)
   - 3.6 [Problem 5 — THEME_CONSTANTS Bloat](#36-problem-5--theme_constants-bloat)
   - 3.7 [Problem 6 — SafeList Gray Classes Signal Incomplete Migration](#37-problem-6--safelist-gray-classes-signal-incomplete-migration)
   - 3.8 [Problem 7 — ResponsiveView Hydration Mismatch](#38-problem-7--responsiveview-hydration-mismatch)
   - 3.9 [Styling Migration Sequence](#39-styling-migration-sequence)
4. [Recommended Migration Sequence](#4-recommended-migration-sequence)
5. [Patterns to Keep](#5-patterns-to-keep)
6. [Patterns to Replace](#6-patterns-to-replace)
7. [File-Level Impacted List](#7-file-level-impacted-list)

---

## 1. Executive Summary

| Area                 | Current State                                                       | Problem                                                                         | Recommendation                                                 |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| Data fetching        | `useApiQuery` (hand-rolled SWR)                                     | ~350 LOC reinventing TanStack Query                                             | Adopt `@tanstack/react-query`                                  |
| Mutation state       | `useApiMutation`                                                    | No retry, no optimistic updates                                                 | `useMutation` from TanStack Query                              |
| Services layer       | 35 files, pure `apiClient` pass-through                             | Zero added value; a 3-hop no-op                                                 | Promote to Server Actions (after SSR) or delete; keep contract |
| Forms                | Custom `useForm` hook                                               | No touched state, no Zod integration, no field arrays                           | Adopt `react-hook-form` + `zodResolver`                        |
| Cache                | `CacheManager` singleton                                            | FIFO eviction, `maxSize` ignored after first call; duplicated by TanStack Query | Drop in favour of TanStack Query's cache                       |
| Event buses          | `EventBus` class + `invalidationListeners` Map inside `useApiQuery` | Two parallel invalidation mechanisms                                            | Unify under TanStack Query, remove both                        |
| `apiClient.buildURL` | `new URL(endpoint, window.location.origin)`                         | Throws on the server, blocks SSR                                                | Replace with `process.env.NEXT_PUBLIC_APP_URL`                 |
| Mutations path       | Hook → service → apiClient → API route → repo                       | 4-layer round-trip for every write                                              | Post-SSR: Server Actions call repos directly                   |
| Schema adapters      | 3 partial adapters in `schema.adapter.ts`                           | Incomplete coverage; `                                                          |                                                                | default` fallbacks hide type gaps | Complete coverage or remove; fix type gaps in schemas |
| Queue class          | `src/classes/Queue.ts` unused/undocumented                          | Dead code candidate                                                             | Audit call sites; remove if unused                             |

No single change here is mandatory in isolation — but if you are doing an SSR overhaul anyway, **all five high-impact changes (TanStack Query, Server Actions, react-hook-form, apiClient fix, service collapse) compound to cut the number of layers from 5 to 2 for a mutation**.

---

## 2. Layer-by-Layer Analysis

### 2.1 Data Fetching — `useApiQuery` / `useApiMutation`

#### What exists today

```
src/hooks/useApiQuery.ts     ~200 LOC — SWR-like with in-memory CacheManager, deduplication
src/hooks/useApiMutation.ts  ~80  LOC — loading/error state, optionsRef stability
src/classes/CacheManager.ts  ~130 LOC — Map-backed cache, FIFO eviction, singleton
```

`useApiQuery` implements: stale-while-revalidate, request deduplication via an `inflightRequests` Map, configurable `cacheTTL`, `invalidateQueries` export backed by its own `invalidationListeners` Map. That is TanStack Query's feature set, re-implemented without the ecosystem (devtools, prefetching, persistence, React Suspense integration, `initialData`/`placeholderData`).

`useApiMutation` is missing: optimistic updates, automatic rollback, retry logic, mutation queuing.

#### Problem

`useApiQuery` is tightly coupled to `ApiClientError`. Swapping the transport (e.g. to Server Actions or native `fetch`) requires touching `useApiQuery` itself. And because the cache lives inside a singleton (`CacheManager.getInstance(200)`), `maxSize` is silently ignored on every call after the first — callers believe they are configuring the cache when they are not.

#### Recommendation — Adopt `@tanstack/react-query`

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**After migration, delete:**

- `src/hooks/useApiQuery.ts`
- `src/hooks/useApiMutation.ts`
- `src/classes/CacheManager.ts` (query cache replaces it)
- `invalidationListeners` Map inside the deleted `useApiQuery`

**Why TanStack Query is better here:**

| Feature                | Current `useApiQuery`  | TanStack Query                                 |
| ---------------------- | ---------------------- | ---------------------------------------------- |
| `initialData` from SSR | ❌ (must add manually) | ✅ built-in; hydrates from server              |
| Devtools               | ❌                     | ✅ `@tanstack/react-query-devtools`            |
| Optimistic updates     | ❌                     | ✅ `onMutate` / `context`                      |
| Automatic retry        | ❌                     | ✅ configurable, exponential back-off          |
| Suspense mode          | ❌                     | ✅ `useSuspenseQuery`                          |
| Prefetching (SSR)      | ❌                     | ✅ `queryClient.prefetchQuery` in server pages |
| Persistence (offline)  | ❌                     | ✅ `persistQueryClient` plugin                 |
| Deduplication          | ✅                     | ✅                                             |
| Cache TTL              | ✅                     | ✅ `staleTime` / `gcTime`                      |
| Invalidation           | ✅ (own bus)           | ✅ `queryClient.invalidateQueries`             |

**Integration with SSR plan (Phase 3 from `SSR_MIGRATION_PLAN.md`):**

```tsx
// app/[locale]/products/page.tsx  (server component)
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { productRepository } from "@/repositories";

export default async function ProductsPage({ searchParams }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["products", searchParams],
    queryFn: () => productRepository.list(searchParams), // direct repo access—no HTTP
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsView />
    </HydrationBoundary>
  );
}

// features/products/hooks/useProducts.ts  (client component)
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services";

export function useProducts(params: URLSearchParams) {
  return useQuery({
    queryKey: ["products", params.toString()],
    queryFn: () => productService.list(params.toString()),
    staleTime: 5 * 60 * 1000,
  });
}
```

The query client in the server page calls the repository **directly** (no HTTP), serialises via `dehydrate`, and the `HydrationBoundary` seeds the client-side cache. When `useProducts` runs in the client component, the cache is already populated — zero network waterfall.

**Wrap the whole app once in `app/[locale]/layout.tsx`:**

```tsx
// src/providers/QueryProvider.tsx  ("use client")
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

---

### 2.2 Services Layer

#### What exists today

35 files under `src/services/`. Every file follows the identical pattern:

```ts
// src/services/cart.service.ts
export const cartService = {
  get: () => apiClient.get(API_ENDPOINTS.CART.GET),
  addItem: (data) => apiClient.post(API_ENDPOINTS.CART.ADD_ITEM, data),
  // ...
};
```

Zero business logic. The layer exists solely as an indirection between hooks and `apiClient`. The current data flow for a read is:

```
Component → useProducts (hook) → useApiQuery → productService.list → apiClient.get → /api/products → productRepository.list → Firestore
```

That is **7 hops for a read** — a feature hook, a query hook, a service, an HTTP client, a route handler, a repository method, and a Firestore call. Four of those (feature hook, query hook, service, HTTP client) live on the client and add zero transformation.

#### Two viable futures

**Option A — Services become Server Actions (recommended after SSR migration)**

```ts
// src/services/cart.service.ts  — after Server Actions
"use server";
import { cartRepository } from "@/repositories";
import { requireAuth } from "@/lib/security/authorization";
import { getSession } from "@/lib/firebase/session";

export async function getCart() {
  const session = await getSession();
  requireAuth(session);
  return cartRepository.findByUserId(session.uid);
}

export async function addCartItem(data: AddCartItemInput) {
  const session = await getSession();
  requireAuth(session);
  return cartRepository.addItem(session.uid, data);
}
```

With Server Actions the call chain collapses to:

```
Component → action (Server Action) → repository → Firestore
```

Two hops (action + repository). No API route, no `apiClient`, no service intermediary.

**Option B — Keep services, add logic**

If Server Actions are not immediately feasible, the service files should justify their existence. Every service that is a pure apiClient wrapper should either be deleted or have real logic added (e.g. request enrichment, response transformation, multi-call orchestration).

#### Recommendation

- **During SSR migration:** Keep services as apiClient wrappers. They are cheap abstraction boundaries.
- **After SSR (Phase 5+):** Convert mutation services to Server Actions. Read services can be replaced by direct `useQuery` + repository calls from server components.
- **Never:** Delete services before their call sites are migrated.

---

### 2.3 API Routes & `createApiHandler`

#### Assessment: EXCELLENT — Keep

`createApiHandler` is the strongest single pattern in the codebase. It provides:

- Type-safe auth check via `requireAuthFromRequest`
- Role guard via `requireRoleFromRequest`
- Zod body validation with consistent 422 responses
- Rate limiting
- Centralised `handleApiError` for consistent error shape
- Typed `params` generic for dynamic routes

**No change needed.** During Server Actions migration, only the mutating routes get replaced. Public read routes (products, blog, categories, events) will still be needed as JSON endpoints for client-side `useQuery` calls. Keep them.

**Minor improvement:** Add a `transform` option so the common pattern of `adaptProductToUI(result)` inside handlers is co-located:

```ts
// Optional enhancement
createApiHandler({
  handler: async ({ body }) => {
    const product = await productRepository.findByIdOrFail(id);
    return successResponse(adaptProductToUI(product));
  },
});
```

This already works — no change needed.

---

### 2.4 Repository Layer

#### Assessment: SOLID — Minor improvements only

`BaseRepository<T>` with Sieve integration is well-designed. `UnitOfWork` for transaction/batch coordination is correct and necessary.

**Minor issues:**

1. **`batchUpdateAncestorMetrics` (`src/lib/helpers/category-metrics.ts`)** raw-dogs the Admin SDK directly instead of going through a repository. Move this logic into `CategoriesRepository` or a dedicated `CategoryMetricsService` (server-only).

2. **Repository singletons scattered across files.** Every repository exports `new XRepository()`. Centralize in `src/repositories/index.ts` as named exports (many already done). Ensure no component ever imports a repository directly (enforce via ESLint `no-restricted-imports`).

3. **`getAdminDb()` called per-method.** `BaseRepository` calls `getAdminDb()` via a getter on every operation. This is fine (it returns a cached singleton), but document this so future maintainers don't "optimize" it by caching in the constructor (which would capture a stale reference before Firebase Admin initialises).

---

### 2.5 Form Handling

#### What exists today

```ts
// src/hooks/useForm.ts  (~65 LOC)
export function useForm<T>({ initialValues, onSubmit, validate }) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ...
}
```

Missing: `touched` state (errors show before the user has interacted), field-level async validation, field arrays, `watch`, `formState.isDirty`, integration with component libraries. The `validate` prop is a plain `(values) => Record<string, string>` function, not a Zod schema — so forms must duplicate the same validation logic that already exists in `src/db/schema/*.ts`.

#### Recommendation — Adopt `react-hook-form` + `zodResolver`

```bash
npm install react-hook-form @hookform/resolvers
```

`zodResolver` from `@hookform/resolvers` lets every form reuse the same Zod schemas that Firestore already validates against — single source of truth.

**Before:**

```tsx
// A form with custom useForm
const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
  initialValues: { title: "", price: 0 },
  validate: (v) => {
    const errors: Record<string, string> = {};
    if (!v.title) errors.title = "Required";
    return errors;
  },
  onSubmit: async (v) => {
    await productService.create(v);
  },
});
```

**After:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
});
type FormData = z.infer<typeof schema>;

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { title: "", price: 0 },
});
```

**Migration path:**

1. Install the packages.
2. Replace `useForm` imports file-by-file (no global rename needed — `src/hooks/useForm.ts` and `react-hook-form`'s `useForm` have the same import name; use aliasing in the transition period).
3. Delete `src/hooks/useForm.ts` once all forms are migrated.

**Files to migrate** (any component using `src/hooks/useForm`):

```bash
# find all call sites
grep -r "useForm" src --include="*.tsx" --include="*.ts" -l
```

---

### 2.6 Event Buses & Cache Singletons

#### Current state

There are **two parallel invalidation mechanisms:**

1. `src/classes/EventBus.ts` — general-purpose singleton pub/sub (`EventBus.getInstance()`)
2. `invalidationListeners` Map inside `src/hooks/useApiQuery.ts` — query-specific invalidation

These solve the same problem (notify components to refetch) from two different places. When `invalidateQueries(["cart"])` is called, it uses mechanism 2. When the `EventBus` is used for the same, it runs mechanism 1. There is no guarantee both are consistently used.

#### `CacheManager` singleton flaw

```ts
// src/classes/CacheManager.ts
public static getInstance(maxSize?: number): CacheManager {
  if (!CacheManager.instance) {
    CacheManager.instance = new CacheManager(maxSize);  // only used once
  }
  return CacheManager.instance;  // maxSize ignored on every other call
}
```

`useApiQuery` calls `CacheManager.getInstance(200)`. If any other file calls `CacheManager.getInstance(500)` first, the 200-entry limit is set silently wrong, and vice versa. This is a misconfiguration footgun.

#### Recommendation

- **With TanStack Query:** Both mechanisms become unnecessary. Remove both.
- **Without TanStack Query:** Consolidate to a single `EventBus`. Remove the `invalidationListeners` Map from `useApiQuery` and route `invalidateQueries` through `EventBus`. Fix `CacheManager.getInstance` to use a fixed default rather than an ignored parameter.

---

### 2.7 `apiClient` & `buildURL`

#### The bug

```ts
// src/lib/api-client.ts  line ~81
private buildURL(endpoint: string, params?) {
  const url = new URL(endpoint, window.location.origin);  // 💥 crashes on server
  // ...
}
```

`window` does not exist in the Node.js runtime. Any server component, Server Action, or `generateMetadata` function that imports `apiClient` will crash.

#### Fix (Phase 0 of SSR plan)

```ts
private buildURL(endpoint: string, params?) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL(endpoint, base);
  // ...
}
```

Or cleaner — always use `process.env.NEXT_PUBLIC_APP_URL` and remove the `window` reference entirely:

```ts
constructor() {
  this.baseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  this.defaultTimeout = 120_000;
}

private buildURL(endpoint: string, params?) {
  const url = new URL(endpoint, this.baseURL);
  // ...
}
```

Add `NEXT_PUBLIC_APP_URL=http://localhost:3000` to `.env.local` and `NEXT_PUBLIC_APP_URL=https://letitrip.in` to Vercel production.

---

### 2.8 Pages vs. Views Architecture

#### What exists today

Pages are correctly thin (`products/page.tsx` is 9 lines). Views are in `src/features/<name>/components/<Domain>View.tsx`. The pattern is correctly implemented.

**Issue 1:** `blog/page.tsx` has `"use client"` — the page itself, not the View. This propagates the client boundary one level higher than necessary.

```tsx
// WRONG — page.tsx
"use client";
import { BlogListView } from "@/features/blog";
export default function BlogPage() {
  return <BlogListView />;
}
```

```tsx
// CORRECT — page.tsx (no directive needed — BlogListView has its own "use client")
import { BlogListView } from "@/features/blog";
export default function BlogPage() {
  return <BlogListView />;
}
```

**Issue 2:** No pages currently pass `initialData` to their Views. After TanStack Query is adopted, pages can `prefetchQuery` on the server and pass the dehydrated state via `HydrationBoundary` as described in §2.1.

**Issue 3:** Some View components mix data-fetching logic with rendering logic in a single file > 150 lines. For data-heavy views, split into:

```
ProductsView.tsx        ← rendering only, receives data from hooks
useProducts.ts          ← data hook (already done in most features ✅)
ProductsFilters.tsx     ← filter panel sub-component (shared in @/components ✅)
```

This is already correct in most features. The issue is consistency — audit all View files for inline `useApiQuery` calls that bypass the feature's own hooks.

---

### 2.9 Schema Adapters

#### What exists today

`src/lib/adapters/schema.adapter.ts` has 3 adapters: `adaptUserToUI`, `adaptProductToUI`, `adaptOrderToUI`. These apply defaults and flatten nested objects for component consumption.

**Issues:**

- Coverage is incomplete (no adapters for bid, cart, coupon, event, review, store, etc.).
- The `|| default` fallback pattern hides type problems. If `product.description` is `undefined` and the schema says it's `string`, the type is wrong — fix the schema or make the field optional; don't paper over it with `|| ""`.
- "UI-friendly format" is re-invented each time a component needs to display a document. Instead, keep documents typed correctly in the schema; move display-specific string formatting (e.g. price → "₹1,200") to formatter utilities.

#### Recommendation

1. Audit `src/db/schema/*.ts` — make every nullable/optional field properly typed (`string | undefined` not `string`). This eliminates the need for `|| ""` fallbacks.
2. Replace the "flatten to UI object" adapters with **specific formatter utilities** in `src/utils/`:
   - `formatPrice(price: number, currency: string): string`
   - `formatAddress(address: AddressDocument): string`
     These already exist in `src/helpers/` or `src/utils/` — check before adding new ones.
3. If adapters are genuinely needed (e.g. mapping Firestore timestamps to ISO strings), create a `toSerializable` function per schema file and keep it co-located, not in a separate `adapters/` directory.

---

### 2.10 Monitoring & Observability

`src/lib/monitoring/` exports: `trackEvent`, `trackPageView`, `trackApiRequest`, `trackError`, `measureAsync`, `trackAuth`, `trackEcommerce`, etc.

**Problem:** Unclear whether these are systematically invoked. Without consistent instrumentation hooks, the monitoring module is dead code. Notable gaps:

- `createApiHandler` has a `handleApiError` centralised handler — add `trackApiError` there so all route errors are automatically tracked.
- `useApiMutation` / `useApiQuery` (or future `useMutation`/`useQuery`) `onError` callbacks should call `trackError`.
- Auth success/failure paths in `SessionContext` should call `trackAuth`.

**Recommendation:** Add monitoring calls at the framework level (in factories and base classes), not at the call-site level, to guarantee coverage:

```ts
// In createApiHandler (api-handler.ts) — add one line:
} catch (error) {
  trackApiError(error, { route: request.url });  // ← add this
  return handleApiError(error);
}
```

```ts
// In QueryProvider (future, with TanStack Query):
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { onError: (err) => trackError(err) },
    mutations: { onError: (err) => trackError(err) },
  },
});
```

---

---

## 3. Styling & Theming

### 3.1 Current State

The styling system has three files that each contribute to token management:

| File                     | Role                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `tailwind.config.js`     | Defines the design token palette as Tailwind color extensions (`primary`, `secondary`, `cobalt`, `accent`) and custom `safelist` |
| `src/app/globals.css`    | Defines CSS custom properties (`:root` / `.dark`) and `@layer components` utility classes (`.btn`, `.card`, `.input-base`)       |
| `src/constants/theme.ts` | `THEME_CONSTANTS` — a ~500-LOC TS object mapping semantic names to raw Tailwind class strings                                    |

Plus:

- `src/contexts/ThemeContext.tsx` — React context that reads `localStorage` and toggles `dark` on `<html>`
- `src/app/layout.tsx` — inline `<script>` in `<head>` that applies the `dark` class synchronously before React hydrates

The **design intent is good** — semantic tokens via `THEME_CONSTANTS`, dark mode via Tailwind `darkMode: "class"`. The implementation has several fixable consistency problems.

---

### 3.2 Problem 1 — Three Parallel Token Systems

`globals.css` defines a full set of CSS custom properties:

```css
:root {
  --bg-primary: 255 255 255; /* white */
  --text-primary: 9 9 11; /* zinc-950 */
  --color-primary: 80 156 2; /* primary-600 (lime green) */
  /* ...20 more vars */
}
.dark {
  --bg-primary: 2 6 23; /* slate-950 */
  --color-primary: 233 30 140; /* secondary-500 (hot pink) */
}
```

These variables are **defined but never referenced** in `tailwind.config.js` or `THEME_CONSTANTS`. Tailwind uses hardcoded hex values. `THEME_CONSTANTS` uses raw class names like `"bg-white dark:bg-slate-950"`. The CSS vars are dead declarations — they serve no purpose other than documentation.

**Two options to unify:**

**Option A — Wire CSS vars into Tailwind config (recommended)**

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      // Keep existing palette AND add semantic aliases backed by CSS vars
      surface: {
        primary: "rgb(var(--bg-primary) / <alpha-value>)",
        secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
      },
      content: {
        primary: "rgb(var(--text-primary) / <alpha-value>)",
        secondary: "rgb(var(--text-secondary) / <alpha-value>)",
      },
      brand: "rgb(var(--color-primary) / <alpha-value>)",
    },
  },
}
```

Then `THEME_CONSTANTS.themed.bgPrimary` becomes `"bg-surface-primary"` instead of `"bg-white dark:bg-slate-950"`. Dark mode happens purely via CSS var swap, no Tailwind `dark:` variants needed for primitive backgrounds.

**Option B — Remove the CSS vars, keep THEME_CONSTANTS as-is**

If the `dark:` class approach is working and `THEME_CONSTANTS` is consistently used, the CSS vars add no value. Delete the `:root` / `.dark` custom property blocks from `globals.css`. Keep `THEME_CONSTANTS` as the single token authority.

**Recommendation: Option B** — the `dark:` Tailwind variant approach is already what the codebase uses everywhere. Converting to CSS var-backed tokens is a larger refactor with risk. Remove the dead CSS vars to eliminate the confusion.

---

### 3.3 Problem 2 — ThemeContext State Mismatch on First Render

```tsx
// src/contexts/ThemeContext.tsx
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");  // ← always "light" initially

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
    // ... sets correct theme AFTER first render
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);
```

The root `layout.tsx` already has a **blocking `<script>`** in `<head>` that synchronously applies the `dark` class to `<html>` before React loads. This prevents the visual flash. However, `useTheme().theme` still returns `"light"` until the `useEffect` fires on the client, because `useState` initialises from code, not from the DOM.

This creates a correctness bug for any component using `useTheme()` to drive conditional rendering:

```tsx
const { theme } = useTheme();
// On first render: theme === "light" even when DOM has class="dark"
// On any dark-mode user: a brief wrong branch shows
const icon = theme === "dark" ? <MoonIcon /> : <SunIcon />;
```

**Fix — initialise from DOM, not from useState default:**

```tsx
// Read the class already applied by the blocking <script>
function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  // useEffect is now only for adding the matchMedia listener
  // ...
```

`useState(getInitialTheme)` (lazy initializer form) runs once on mount and reads the class already set by the `<head>` script — zero mismatch.

**File:** `src/contexts/ThemeContext.tsx` — one-line change to `useState`.

---

### 3.4 Problem 3 — SSR Cannot Know the User's Theme

The blocking `<script>` in `layout.tsx` reads `localStorage`. `localStorage` is only available in browsers. When a request arrives at the Next.js server:

1. Server renders `<html class="">` (no `dark` class — it doesn't know the user's preference)
2. HTML is sent to the browser
3. Blocking `<script>` runs, adds `class="dark"` if needed
4. React hydrates — `suppressHydrationWarning` hides the `class` attribute mismatch

Step 1→3 causes a brief flash of light-mode content on dark-mode users' first load (before Next.js streaming finishes and before the script runs). With `suppressHydrationWarning` it doesn't cause a React error, but it is a visible layout shift.

**SSR-compatible fix — use a cookie:**

```ts
// After user selects a theme (in setTheme):
document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
```

```tsx
// In root layout.tsx (server):
import { cookies } from "next/headers";
const cookieStore = await cookies();
const themeCookie = cookieStore.get("theme")?.value as ThemeMode | undefined;
const serverTheme = themeCookie ?? "light";

return (
  <html lang={locale} className={serverTheme === "dark" ? "dark" : ""} suppressHydrationWarning>
```

Now the server renders the correct `dark` class — no flash at all. The `<head>` script becomes a fallback for the first visit before any cookie is set.

**Files:**

- `src/app/layout.tsx` — read `theme` cookie, apply class to `<html>`
- `src/contexts/ThemeContext.tsx` — also write a cookie on every `setTheme` call

---

### 3.5 Problem 4 — Dual CSS Authoring Approaches

There are two ways to style a primary button in this codebase:

```tsx
// Way 1: @layer components class from globals.css
<button className="btn btn-primary px-4 py-2">Save</button>

// Way 2: THEME_CONSTANTS object
<button className={`${THEME_CONSTANTS.button.base} ${THEME_CONSTANTS.accent.primary} px-4 py-2`}>Save</button>
```

Both define the same styles. If the color changes, both need updating. The `Button` component from `@/components` should be the only entry point for buttons — it uses one approach internally and every call site uses neither raw approach.

**Rule:** primitive UI elements (`Button`, `Input`, `Card`, `Badge`) own their styling. Application code uses components, not `className` strings from `THEME_CONSTANTS`. `THEME_CONSTANTS` is for layout, spacing, and composite structures that don't have a dedicated component.

**Recommendation:**

1. Remove `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `input-base`, `card`, `card-hover` from `@layer components` in `globals.css`. These classes are only useful if referenced in JSX directly, which they should not be (the `Button`/`Input`/`Card` components own that styling).
2. Audit whether any non-component JSX references these classes directly (`grep -r '"btn ' src --include="*.tsx"`). Migrate those to use the component.
3. Keep `@layer base` in `globals.css` — that's correct (resets, `:focus-visible`, body defaults).

---

### 3.6 Problem 5 — THEME_CONSTANTS Bloat

`THEME_CONSTANTS` is a ~500-LOC object. Most of it is valuable (semantic groupings for consistent dark/light mode). But two sections reinvent Tailwind:

**`THEME_CONSTANTS.spacing.gap`** — `{ xs: "gap-2", sm: "gap-3", md: "gap-4", lg: "gap-6", xl: "gap-8" }`. This is just Tailwind's gap utilities renamed. There is no semantic meaning added. Using `gap-4` directly is clearer than `THEME_CONSTANTS.spacing.gap.md`. Same for `padding.*` and `margin.*` sub-objects.

**`THEME_CONSTANTS.animation`** — `{ fast: "duration-150", normal: "duration-300", slow: "duration-500" }`. Again, just Tailwind utilities renamed.

**Keep the valuable parts** (these add semantic meaning beyond raw Tailwind):

```ts
THEME_CONSTANTS.themed.*         // dark/light bg/text/border pairs — hard to remember individually
THEME_CONSTANTS.layout.*         // navbarHeight, sidebarBg — layout constants
THEME_CONSTANTS.typography.*     // pageTitle, sectionTitle — responsive composite strings
THEME_CONSTANTS.badge.*          // status badge complete class strings
THEME_CONSTANTS.input.*          // complete input state classes (base, error, success, disabled)
THEME_CONSTANTS.spacing.section  // "space-y-8 md:space-y-12 lg:space-y-16" — layout rhythm
THEME_CONSTANTS.spacing.pageY    // "py-6 sm:py-8 lg:py-10"
THEME_CONSTANTS.spacing.cardPadding
```

**Remove the noise** (these are just Tailwind utilities with no added value):

```ts
THEME_CONSTANTS.spacing.gap.{xs,sm,md,lg,xl}     → use gap-2, gap-3, gap-4 directly
THEME_CONSTANTS.spacing.gap.x.*                   → use gap-x-{n}
THEME_CONSTANTS.spacing.gap.y.*                   → use gap-y-{n}
THEME_CONSTANTS.spacing.padding.*                 → use p-{n}, px-{n}, py-{n} directly
THEME_CONSTANTS.spacing.margin.*                  → use m-{n}, mx-{n}, mt-{n} directly
THEME_CONSTANTS.animation.{fast,normal,slow}      → use duration-150, duration-300 directly
```

**`THEME_CONSTANTS.badge` has exact duplicate strings:**

```ts
(badge.active === badge.approved) === badge.success; // identical emerald string
badge.danger === badge.rejected; // identical rose string
badge.warning === badge.warm; // identical amber string
```

Deduplicate — map `approved`, `rejected`, `warm` to `success`, `danger`, `warning` or use a single named export. The copy-paste means a color change requires updating 3 identical strings.

---

### 3.7 Problem 6 — SafeList Gray Classes Signal Incomplete Migration

`tailwind.config.js` safelist includes:

```js
("bg-gray-50",
  "bg-gray-900",
  "bg-gray-950",
  "dark:bg-gray-900",
  "dark:bg-gray-950",
  "text-gray-900",
  "text-gray-100",
  "dark:text-gray-100");
```

The design system uses `zinc` for light neutrals and `slate` for dark neutrals. `gray` is a third, slightly different scale that was used before the `zinc`/`slate` split. The safelist exists because **some components still use raw `gray-*` classes** (not through `THEME_CONSTANTS`) that would be purged by Tailwind without the safelist.

**Action:** `grep -r "gray-" src --include="*.tsx" | grep -v "THEME_CONSTANTS" | grep -v ".test."` — find all raw `gray-*` usages. Migrate them to `zinc-*` (light) or `slate-*` (dark) using `THEME_CONSTANTS`. Once migrated, remove the gray entries from the safelist.

This also slightly reduces CSS bundle size (fewer generated utility classes).

---

### 3.8 Problem 7 — ResponsiveView Hydration Mismatch

`src/components/utility/ResponsiveView.tsx` renders different JSX trees based on `useBreakpoint()`:

```tsx
const { isMobile, isTablet } = useBreakpoint();
if (isMobile) return <>{mobile}</>;
if (isTablet && tablet) return <>{tablet}</>;
return <>{desktop}</>;
```

Server has no screen size → always renders `desktop` branch → hydration client may render `mobile` → React hydration mismatch (or silent wrong render on mobile with `suppressHydrationWarning`).

**Fix — replace with CSS visibility:**

```tsx
// src/components/utility/ResponsiveView.tsx  — NEW IMPLEMENTATION
export function ResponsiveView({
  mobile,
  desktop,
  tablet,
}: ResponsiveViewProps) {
  return (
    <>
      <div className="block md:hidden">{mobile}</div>
      {tablet && <div className="hidden md:block lg:hidden">{tablet}</div>}
      <div className={tablet ? "hidden lg:block" : "hidden md:block"}>
        {desktop}
      </div>
    </>
  );
}
```

Both branches render in HTML. CSS controls visibility. No JS, no hydration mismatch, correct on SSR, correct with JavaScript disabled. Remove the `useBreakpoint` import entirely from this component.

**Note:** This renders all branches in HTML. If one branch is expensive (e.g. a large data table), wrap the hidden one in a `Suspense` boundary or accept the minor DOM overhead — it's preferable to a hydration mismatch.

---

### 3.9 Styling Migration Sequence

| Step   | Change                                                                                                             | Effort | Risk                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------- |
| **S0** | Fix `ResponsiveView` — replace `useBreakpoint` with CSS `block/hidden` classes                                     | 15 min | Zero — pure CSS change                                         |
| **S1** | Fix `ThemeContext` `useState` initialiser — read from DOM class, not `"light"` default                             | 10 min | Zero                                                           |
| **S2** | `setTheme` writes a cookie in addition to `localStorage`                                                           | 15 min | Zero                                                           |
| **S3** | Root `layout.tsx` reads `theme` cookie and applies `dark` class server-side                                        | 20 min | Low — `suppressHydrationWarning` covers any remaining mismatch |
| **S4** | Remove dead CSS custom properties from `globals.css` (`:root` / `.dark` blocks)                                    | 15 min | Zero — they're not referenced                                  |
| **S5** | Remove `@layer components` button/input/card classes from `globals.css` (after auditing no direct className usage) | 30 min | Low                                                            |
| **S6** | Remove `spacing.gap.*`, `spacing.padding.*`, `spacing.margin.*`, `animation.*` from `THEME_CONSTANTS`              | 30 min | Low — find/replace with direct Tailwind classes                |
| **S7** | Deduplicate `THEME_CONSTANTS.badge` (merge `approved`→`success`, `rejected`→`danger`)                              | 15 min | Low — update badge call sites                                  |
| **S8** | Migrate raw `gray-*` component classes to `zinc-*` / `slate-*`, shrink safelist                                    | 1 h    | Low                                                            |

---

## 4. Recommended Migration Sequence

Execute these in order. Each step is independently shippable and non-breaking.

| Step    | Change                                                                           | Effort   | Impact                     |
| ------- | -------------------------------------------------------------------------------- | -------- | -------------------------- | -------- | ----------- |
| **P0**  | Fix `apiClient.buildURL` (window.location.origin)                                | 10 min   | Unblocks all SSR           |
| **P1**  | Add `"use client"` removal from pages that don't need it (`blog/page.tsx`, etc.) | 30 min   | Better SSR                 |
| **P2**  | Install `@tanstack/react-query` + `QueryProvider` wrapper                        | 2 h      | Foundation for P3+         |
| **P3**  | Migrate `useApiQuery` call sites to `useQuery` one feature at a time             | 1–2 days | Can do feature by feature  |
| **P4**  | Migrate `useApiMutation` call sites to `useMutation`                             | 1 day    | Can do alongside P3        |
| **P5**  | Delete `useApiQuery.ts`, `useApiMutation.ts`, `CacheManager.ts`                  | 30 min   | Cleanup                    |
| **P6**  | Install `react-hook-form` + `@hookform/resolvers`                                | 1 h      | Foundation for P7          |
| **P7**  | Migrate forms from `useForm` to react-hook-form + zodResolver                    | 2–3 days | Form by form               |
| **P8**  | Delete `src/hooks/useForm.ts`                                                    | 5 min    | Cleanup                    |
| **P9**  | Consolidate / remove `EventBus` (after P5)                                       | 1 h      | Single event system        |
| **P10** | Convert mutation API routes to Server Actions (post-SSR plan Phase 5)            | 3–5 days | Major simplification       |
| **P11** | Add monitoring hooks in `createApiHandler` and `QueryProvider`                   | 2 h      | Full observability         |
| **P12** | Audit & fix schema types (remove `                                               |          | ""` fallbacks in adapters) | 1–2 days | Type safety |

---

## 5. Patterns to Keep

These are the strongest parts of the codebase — do not touch them during the overhaul.

| Pattern                           | Location                                       | Why                                                                             |
| --------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `createApiHandler` factory        | `src/lib/api/api-handler.ts`                   | Centralises auth, rate-limit, schema, error handling across all 30+ routes      |
| `BaseRepository<T>` + Sieve       | `src/repositories/base.repository.ts`          | Clean Admin SDK CRUD; Sieve integration pushes filtering to DB                  |
| `UnitOfWork`                      | `src/repositories/unit-of-work.ts`             | Correct transaction/batch coordination; prevents partial writes                 |
| `useUrlTable` + `usePendingTable` | `src/hooks/`                                   | URL-driven state is correct; filter state survives navigation/share             |
| Error hierarchy                   | `src/lib/errors/`                              | Clear separation of client vs. server errors; maps cleanly to HTTP status codes |
| `authorization.ts` guards         | `src/lib/security/authorization.ts`            | Composable guard functions called from `createApiHandler`                       |
| Three-tier architecture           | `src/app/`, `src/features/`, `src/components/` | Correct layering; thin pages, logic in features, shared in Tier 1               |
| `ROUTES` / `API_ENDPOINTS`        | `src/constants/`                               | Single source of truth for all URLs                                             |
| `serverLogger` / `logger`         | `src/lib/server-logger.ts`, `src/classes/`     | Structured logging; no `console.log` in business logic                          |
| Zod schemas in db/schema          | `src/db/schema/`                               | Shared validation between API route and Firestore                               |

---

## 6. Patterns to Replace

Full replacement targets with their successors:

| Remove                                       | Replace With                                    | Reason                                                     |
| -------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| `src/hooks/useApiQuery.ts`                   | `useQuery` from `@tanstack/react-query`         | Hand-rolled SWR, missing SSR hydration, devtools, retry    |
| `src/hooks/useApiMutation.ts`                | `useMutation` from `@tanstack/react-query`      | Missing optimistic updates, retry, rollback                |
| `src/classes/CacheManager.ts`                | TanStack Query's built-in cache                 | Singleton maxSize bug; FIFO-only eviction                  |
| `invalidationListeners` Map (in useApiQuery) | `queryClient.invalidateQueries`                 | Duplicate invalidation bus                                 |
| `src/classes/EventBus.ts`                    | Audit: remove or keep for non-query events only | Overlaps with TanStack Query invalidation                  |
| `src/hooks/useForm.ts`                       | `react-hook-form` + `zodResolver`               | Missing touched state, no Zod integration, no field arrays |
| `window.location.origin` in `api-client.ts`  | `process.env.NEXT_PUBLIC_APP_URL`               | Crashes on server                                          |
| `"use client"` on page files                 | Remove directive; let Views own their boundary  | Pages should be server components                          |
| 35 services as pure pass-through             | Server Actions (post-SSR) or direct `useQuery`  | 4-layer no-op for reads/writes                             |

---

## 7. File-Level Impacted List

### Delete (after migration)

```
src/hooks/useApiQuery.ts
src/hooks/useApiMutation.ts
src/classes/CacheManager.ts
src/hooks/useForm.ts            (after all forms migrated)
src/classes/EventBus.ts         (if no non-query usage found)
```

### Modify

```
src/lib/api-client.ts                     — fix buildURL (window.location.origin → env var)
src/app/[locale]/blog/page.tsx            — remove "use client"
src/app/[locale]/layout.tsx               — add QueryProvider wrapper
src/app/layout.tsx                        — read theme cookie, apply dark class server-side
src/contexts/ThemeContext.tsx             — fix useState initialiser; write theme cookie on setTheme
src/components/utility/ResponsiveView.tsx — replace useBreakpoint with CSS block/hidden pattern
src/lib/api/api-handler.ts                — add trackApiError in catch block
src/app/globals.css                       — remove dead CSS vars (:root custom properties); remove @layer component classes
src/constants/theme.ts                    — remove spacing.gap.*, spacing.padding.*, spacing.margin.*, animation.*; deduplicate badge strings
src/repositories/base.repository.ts      — document getAdminDb() singleton behaviour
tailwind.config.js                        — shrink safelist after gray-* migration
```

### Create

```
src/providers/QueryProvider.tsx              — TanStack Query client + DevTools
src/utils/formatters.ts (or similar)         — price, address, date formatters
                                               (check src/helpers/ first)
```

### Migrate (form by form)

All files calling `import { useForm } from "@/hooks"` — use `grep -r "from \"@/hooks\"" src --include="*.tsx" | grep useForm` to enumerate.

### Migrate (query by query — feature by feature)

All files calling `useApiQuery` — `grep -r "useApiQuery" src --include="*.ts" --include="*.tsx" -l`.

All files calling `useApiMutation` — `grep -r "useApiMutation" src --include="*.ts" --include="*.tsx" -l`.

### Migrate (gray → zinc/slate tokens)

```bash
# Find raw gray-* class usages outside of THEME_CONSTANTS
grep -r "gray-" src --include="*.tsx" | grep -v THEME_CONSTANTS | grep -v ".test."
```
