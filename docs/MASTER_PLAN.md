# LetItRip — Master Architecture, Security & Migration Plan

> **Single source of truth.** This document supersedes and replaces `DESIGN_PATTERNS.md`, `SSR_MIGRATION_PLAN.md`, and `LIBRARY_PLAN.md`.  
> **Intent:** Concrete, actionable guidance for every open architectural concern — security fixes first, then pattern upgrades, SSR migration, and library extraction.  
> **Rule:** Never split this back into multiple files. Update in place.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Security & Vulnerabilities (Priority 0)](#2-security--vulnerabilities-priority-0)
   - 2.1 [Rate Limiter — Serverless Incompatible](#21-rate-limiter--serverless-incompatible)
   - 2.2 [Webhook Signature — Timing Attack](#22-webhook-signature--timing-attack)
   - 2.3 [Media Upload — Spoofable MIME Type](#23-media-upload--spoofable-mime-type)
   - 2.4 [CSP — `unsafe-eval` / `unsafe-inline`](#24-csp--unsafe-eval--unsafe-inline)
   - 2.5 [ThemeContext Flash / SSR Theme](#25-themecontext-flash--ssr-theme)
   - 2.6 [apiClient Crashes on Server](#26-apiclient-crashes-on-server)
   - 2.7 [ResponsiveView Hydration Mismatch](#27-responsiveview-hydration-mismatch)
3. [Design Patterns](#3-design-patterns)
   - 3.1 [Data Fetching — useApiQuery → TanStack Query](#31-data-fetching--useapiquery--tanstack-query)
   - 3.2 [Services Layer](#32-services-layer)
   - 3.3 [API Routes & createApiHandler](#33-api-routes--createapihandler)
   - 3.4 [Repository Layer](#34-repository-layer)
   - 3.5 [Form Handling — react-hook-form + zodResolver](#35-form-handling--react-hook-form--zodresolver)
   - 3.6 [Event Buses & Cache Singletons](#36-event-buses--cache-singletons)
   - 3.7 [Schema Adapters](#37-schema-adapters)
   - 3.8 [Pages vs Views Architecture](#38-pages-vs-views-architecture)
   - 3.9 [Monitoring & Observability](#39-monitoring--observability)
4. [Styling & Theming](#4-styling--theming)
   - 4.1 [Three Parallel Token Systems](#41-three-parallel-token-systems)
   - 4.2 [THEME_CONSTANTS Bloat](#42-theme_constants-bloat)
   - 4.3 [Gray SafeList — Incomplete Migration](#43-gray-safelist--incomplete-migration)
   - 4.4 [Styling Migration Sequence](#44-styling-migration-sequence)
5. [SSR Migration](#5-ssr-migration)
   - [Phase 0 — Fix apiClient for Server Use](#phase-0--fix-apiclient-for-server-use)
   - [Phase 1 — Public Content Pages](#phase-1--public-content-pages-highest-seo-value)
   - [Phase 2 — Homepage Sections](#phase-2--homepage-sections)
   - [Phase 3 — Listing Pages with Filter State](#phase-3--listing-pages-with-filter-state)
   - [Phase 4 — Auth Session Modernisation](#phase-4--auth-session-modernisation)
   - [Phase 5 — SSE Client Islands](#phase-5--real-time-client-islands-sse-migration)
   - [Phase 6 — Static Pages](#phase-6--static-pages)
   - [Phase 7 — SEO Infrastructure](#phase-7--seo-infrastructure)
   - [Phase 8 — Dead Code Removal](#phase-8--dead-code-removal)
6. [Component Patterns](#6-component-patterns)
   - 6.1 [Form Components](#61-form-components)
   - 6.2 [Filter Components](#62-filter-components)
   - 6.3 [Media Components](#63-media-components)
   - 6.4 [Modal Pattern](#64-modal-pattern)
   - 6.5 [Layout Components](#65-layout-components)
7. [Combined Migration Sequence](#7-combined-migration-sequence)
8. [Files to Delete After Migration](#8-files-to-delete-after-migration)
9. [Known Bugs & Fixes](#9-known-bugs--fixes)
   - 9.1 [useWishlistToggle — No State Rollback on Error](#91--usewishlisttoggle--no-state-rollback-on-error)
   - 9.2 [useMediaQuery — Hydration Mismatch](#92--usemediaquery--hydration-mismatch)
   - 9.3 [useNotifications — Stale Unread Count After Mutations](#93--usenotifications--stale-unread-count-after-mutations)
   - 9.4 [useChat — `off()` Removes All Listeners](#94--usechat--off-removes-all-listeners)
   - 9.5 [useRazorpay — Silent Script Load Failure](#95--userazorpay--silent-script-load-failure)
   - 9.6 [apiClient — AbortController Listener Leak](#96--apiclient--abortcontroller-listener-leak)
   - 9.7 [Queue — Unhandled Async Errors in `process()`](#97--queue--unhandled-async-errors-in-process)
   - 9.8 [StorageManager — Singleton Prefix Silently Ignored](#98--storagemanager--singleton-prefix-silently-ignored)
   - 9.9 [verifyPaymentSignature — Timing Attack](#99--verifypaymentsignature--timing-attack)
   - 9.10 [Payment Verify Route — Stale Cart Prices](#910--payment-verify-route--stale-cart-prices)
   - 9.11 [useApiQuery — Module-Level Cache Not Cleared on Sign-Out](#911--useapiquery--module-level-cache-not-cleared-on-sign-out)
10. [Library Extraction — `@lir/*` Packages](#10-library-extraction--lir-packages)

- 10.1 [Monorepo Structure](#101-monorepo-structure)
- 10.2 [Package Inventory](#102-package-inventory)
- 10.3 [Adapter Pattern — Injecting Business Context](#103-adapter-pattern--injecting-business-context)
- 10.4 [Extraction Phases](#104-extraction-phases)
- 10.5 [Import Migration Map](#105-import-migration-map)
- 10.6 [Build & Publishing Setup](#106-build--publishing-setup)
- 10.7 [Exclusion List — What Stays in letitrip.in](#107-exclusion-list--what-stays-in-letitripin)

---

## 1. Executive Summary

| Priority | Area                      | Current State                                       | Problem                                                      | Action                                                                                   |
| -------- | ------------------------- | --------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **P0**   | Rate limiter              | In-memory `Map`                                     | Serverless: per-instance, dev bypass                         | Replace with Upstash Redis                                                               |
| **P0**   | Webhook HMAC              | String `===` compare                                | Timing attack                                                | Use `timingSafeEqual`                                                                    |
| **P0**   | Razorpay HMAC             | String `===` compare                                | Timing attack on payment verify                              | Use `timingSafeEqual` — §9.9                                                             |
| **P0**   | ~~Payment verify~~        | ~~Cart snapshot prices~~                            | ~~Stale price enables undercharge~~                          | ✅ Fixed 2026-03-10 — live `product.price` at create-order; §9.10                        |
| **P0**   | Media upload              | `file.type` check                                   | Browser-spoofable MIME                                       | Read magic bytes on server                                                               |
| **P0**   | apiClient                 | `window.location.origin`                            | Crashes on server                                            | Env var fallback                                                                         |
| **P1**   | ThemeContext              | `useState("light")`, reads `localStorage` in effect | Flash on dark users; no SSR cookie                           | Write cookie on toggle, read in layout — §2.5                                            |
| **P1**   | ResponsiveView            | Different JSX trees                                 | Hydration mismatch                                           | CSS class toggle — §2.7                                                                  |
| **P1**   | useMediaQuery             | `useState(false)`                                   | Hydration mismatch, mobile flash                             | Lazy initializer — §9.2                                                                  |
| **P1**   | useWishlistToggle         | Optimistic, no rollback                             | UI stuck on wrong state after error                          | Rollback in catch — §9.1                                                                 |
| **P1**   | useApiQuery cache         | Module-level singleton                              | Prior user's data shown after sign-out                       | Clear on sign-out — §9.11                                                                |
| **P1**   | useRazorpay               | `onerror` drops error                               | Silent failure, UX shows "ready"                             | Add `isError` state — §9.5                                                               |
| **P2**   | useNotifications          | No `onSuccess` refetch                              | Stale unread badge after read                                | Call `refetch()` — §9.3                                                                  |
| **P2**   | useChat                   | `off()` without listener                            | Removes all RTDB subscribers                                 | Pass specific handler — §9.4                                                             |
| **P2**   | apiClient AbortController | Listener never removed                              | Event listener memory leak                                   | Remove in `finally` — §9.6                                                               |
| **P2**   | Data fetching             | Hand-rolled SWR                                     | ~350 LOC, no devtools                                        | TanStack Query                                                                           |
| **P2**   | Forms                     | Custom `useForm`                                    | No touched state, no Zod                                     | react-hook-form + zodResolver                                                            |
| **P3**   | Queue.process()           | Not `await`-ed recursion                            | Unhandled promise rejections                                 | Await or restructure — §9.7                                                              |
| **P3**   | StorageManager            | Prefix ignored on 2nd+ call                         | Key namespace collisions                                     | Fix singleton API — §9.8                                                                 |
| **P3**   | Services layer            | 35 apiClient wrappers                               | Zero logic, 7-hop chain                                      | ⏳ G1 in progress — 15+ Server Actions converted; pure-passthrough deletion pending (H3) |
| **P3**   | Token systems             | CSS vars + THEME_CONSTANTS + Tailwind               | Three sources of truth                                       | ⏳ F1 ✅ (globals.css + gray-\* audit done); F2–F4 pending                               |
| **P3**   | SSR                       | 24 pages are `"use client"`                         | No SEO HTML, blank div                                       | Phased SSR migration                                                                     |
| **P3**   | Library extraction        | Everything in `src/`                                | Business and infra code tightly coupled to generic utilities | Extract `@lir/core`, `@lir/react`, `@lir/ui`, `@lir/http`, `@lir/next` — §10             |
| **P4**   | CacheManager              | `maxSize` ignored                                   | Misconfiguration footgun                                     | Deleted at C4 (§7)                                                                       |
| **P4**   | Schema adapters           | 3 partial adapters                                  | Incomplete, `\|` defaults                                    | Fix at G4 (§7)                                                                           |
| **P4**   | EventBus                  | Parallel to TanStack invalidation                   | Two invalidation mechanisms                                  | Deleted at C4 (§7)                                                                       |
| **P4**   | ~~TECH_DEBT.md~~          | ~~Referenced in `next.config.js` comment~~          | ~~File does not exist~~                                      | ✅ Created 2026-03-10 — `docs/TECH_DEBT.md` (H6 ✅)                                      |

---

## 2. Security & Vulnerabilities (Priority 0)

All items in this section must be fixed before deploying further features.

---

### 2.1 Rate Limiter — Serverless Incompatible

**File:** `src/lib/security/rate-limit.ts`

**Vulnerabilities:**

1. **Serverless incompatibility.** The store is an in-memory `Map`. On Vercel, every cold start spawns a fresh function instance with its own empty `Map`. A determined user can bypass rate limits entirely by routing requests to different instances. The rate limiter does not work as a global guard in a serverless environment.
2. **Development bypass.** `NODE_ENV === "development"` skips all rate limiting and always returns `{ success: true }`. This means your dev/staging environment has zero rate protection — behaviour diverges from production.
3. **Memory leak.** `cleanupRateLimitStore()` must be called manually. There is no auto-cleanup scheduler. Under sustained load the `Map` grows unboundedly within an instance lifetime.

**Fix — Upstash Redis (recommended for Vercel):**

```bash
npm install @upstash/ratelimit @upstash/redis
```

Add to `.env.local`:

```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

Replace `src/lib/security/rate-limit.ts`:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Single shared client — OK to share across requests in serverless
const redis = Redis.fromEnv();

// Pre-built limiters for common presets
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, window: number): Ratelimit {
  const key = `${limit}:${window}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${window} s`),
        prefix: "letitrip:rl",
      }),
    );
  }
  return limiters.get(key)!;
}

export async function applyRateLimit(
  request: NextRequest,
  config: { limit: number; window: number },
): Promise<{ success: boolean }> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const limiter = getLimiter(config.limit, config.window);
  const result = await limiter.limit(ip);
  return { success: result.success };
}
```

> **Note:** Remove the `if (process.env.NODE_ENV === "development") return success` bypass. If you want a higher default limit in dev, set a higher `limit` value in `RateLimitPresets` — do not skip the check entirely.

---

### 2.2 Webhook Signature — Timing Attack

**File:** `src/app/api/webhooks/shiprocket/route.ts`

**Vulnerability:** The HMAC comparison uses JavaScript's `===` operator:

```ts
// VULNERABLE — branch duration leaks secret length / prefix
return expected === signature;
```

String equality short-circuits on the first differing byte. An attacker making many requests can measure response times to brute-force the first byte, then the second, and so on.

**Fix — use `timingSafeEqual`:**

```ts
import { createHmac, timingSafeEqual } from "crypto";

function verifyShiprocketSignature(body: string, signature: string): boolean {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  // Both must be same length for timingSafeEqual — hex output guarantees this
  return timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex"),
  );
}
```

> `timingSafeEqual` requires both buffers to be the same byte length. Since both `expected` and `signature` are hex-encoded HMAC-SHA256 output (64 hex chars = 32 bytes), this holds as long as the `signature` header is always provided as a 64-char hex string. Add a length guard if the header value could be malformed:
>
> ```ts
> if (signature.length !== 64) return false;
> ```

---

### 2.3 Media Upload — Spoofable MIME Type

**File:** `src/app/api/media/upload/route.ts`

**Vulnerability:** The upload route validates `file.type`:

```ts
if (!allowedTypes.includes(file.type)) { ... }
```

`file.type` in a `FormData` multipart upload is the `Content-Type` provided by the **client**. Any attacker can upload a `.exe` or malicious SVG with `Content-Type: image/jpeg` and it will pass the check. The stored file will have the wrong content type but the malicious bytes.

**Fix — read the file's magic bytes on the server:**

```bash
npm install file-type
```

```ts
import { fileTypeFromBuffer } from "file-type";

// After converting to buffer:
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

// Server-side magic byte detection — cannot be spoofed by client
const detected = await fileTypeFromBuffer(buffer);
if (!detected || !allowedTypes.includes(detected.mime)) {
  return errorResponse(ERROR_MESSAGES.UPLOAD.INVALID_TYPE, 400, {
    allowed: "JPEG, PNG, GIF, WebP, MP4, WebM, QuickTime",
    detected: detected?.mime ?? "unknown",
  });
}
// Use detected.mime for contentType, not file.type
```

**Also fix — non-cryptographic filename generation:**  
`Math.random().toString(36)` is not cryptographically secure. Replace with:

```ts
import { randomBytes } from "crypto";
const randomString = randomBytes(6).toString("hex"); // 12 chars, crypto-safe
```

---

### 2.4 CSP — `unsafe-eval` / `unsafe-inline`

**File:** `next.config.js`

**Current CSP:**

```
script-src 'self' 'unsafe-eval' 'unsafe-inline'
```

`'unsafe-eval'` allows `eval()` and `new Function()`. `'unsafe-inline'` allows `<script>` tags and inline event handlers — both are standard XSS injection vectors.

**Why it's there:** Next.js (Webpack) uses `eval` in development for source maps. In production builds, chunks are separate files — `eval` is not required.

**Fix — nonce-based CSP with a per-request nonce:**

```ts
// src/lib/security/csp.ts
import { randomBytes } from "crypto";

export function generateNonce(): string {
  return randomBytes(16).toString("base64");
}

export function buildCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    // In dev, keep unsafe-eval for HMR. In prod, nonce only.
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'", // Tailwind inline styles require this
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      "https://*.googleapis.com",
      "https://*.google.com",
      "https://*.firebase.com",
      "https://*.firebaseio.com",
      "https://*.cloudfunctions.net",
    ].join(" "),
    "frame-src 'self' https://accounts.google.com",
  ].join("; ");
}
```

Then in `src/app/[locale]/layout.tsx` (server component), generate a nonce and pass it to `<script>` tags and the `<head>`. Next.js 14+ supports this via `headers()`.

> **Short-term:** The current CSP is still better than none. As a minimum, add `'nonce-${nonce}'` to the script-src in production and remove `'unsafe-eval'` from the production value only. This is a medium-term task.

---

### 2.5 ThemeContext Flash / SSR Theme

**File:** `src/contexts/ThemeContext.tsx`

**Two bugs:**

**Bug 1 — Incorrect initial state:**

```ts
// Always starts as "light" — even for dark-mode users
const [theme, setThemeState] = useState<ThemeMode>("light");
```

Dark users see a flash of light theme on every hard reload because the first render is "light" and the `useEffect` fires later.

**Fix:**

```ts
// Read the class that the root layout already applied (see Bug 2 fix)
function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
```

**Bug 2 — Server cannot know the theme:**  
`localStorage` is browser-only. The server renders `<html class="">` (no dark class), React hydrates, then the `useEffect` fires and adds `class="dark"`. The flash is the gap between server HTML and hydration.

**Fix — write the theme to a cookie, read it on the server:**

```ts
// In setTheme / toggleTheme — also write a cookie:
document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
```

Then in the root layout (server component):

```tsx
// src/app/[locale]/layout.tsx
import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value ?? "light") as
    | "light"
    | "dark";

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      {/* ... */}
    </html>
  );
}
```

With this, the server renders the correct `class="dark"` from the first byte — no flash.

---

### 2.6 apiClient Crashes on Server

**File:** `src/lib/api-client.ts`

**Bug:**

```ts
// Line ~81 — `window` does not exist in Node.js
const url = new URL(endpoint, window.location.origin);
```

If an async Server Component imports anything that transitively imports `api-client.ts`, the module crashes at import time on the server with `ReferenceError: window is not defined`.

**Fix:**

```ts
private buildURL(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  const url = new URL(endpoint, origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
}
```

Also add to every environment:

```
NEXT_PUBLIC_APP_URL=https://letitrip.in
```

> Server components should call repositories directly — not `apiClient`. This fix is a safety net for shared code that is imported in both contexts.

---

### 2.7 ResponsiveView Hydration Mismatch

**File:** `src/components/utility/ResponsiveView.tsx`

**Bug:**  
`ResponsiveView` calls `useBreakpoint()` which reads `window.matchMedia`. On the server this returns `undefined` / falls back to some default. The server renders component A; the client applies the real breakpoint and renders component B. React logs a hydration error and the UI flickers.

**Fix — use CSS instead of JS for layout switching:**

```tsx
// Before (hydration unsafe)
<ResponsiveView mobile={<MobileMenu />} desktop={<DesktopMenu />} />

// After (hydration safe — both are in the DOM, CSS hides one)
<>
  <div className="block md:hidden"><MobileMenu /></div>
  <div className="hidden md:flex"><DesktopMenu /></div>
</>
```

This renders both trees on the server and client identically. CSS hides the inactive one — zero JS, zero hydration risk.

> If `ResponsiveView` is used in many places: keep the component but change its implementation to render both trees with CSS visibility instead of conditionally rendering one.

---

## 3. Design Patterns

---

### 3.1 Data Fetching — `useApiQuery` → TanStack Query

#### Current state

```
src/hooks/useApiQuery.ts     ~200 LOC — hand-rolled SWR with CacheManager, deduplication
src/hooks/useApiMutation.ts  ~80 LOC  — loading/error state, optionsRef stability
src/classes/CacheManager.ts  ~130 LOC — Map-backed cache, FIFO eviction, singleton
```

`useApiQuery` re-implements: stale-while-revalidate, request deduplication, configurable cache TTL, `invalidateQueries` + listener Map. This is TanStack Query's exact feature set, without the ecosystem (devtools, prefetching, SSR hydration boundary, Suspense integration, persistence).

`useApiMutation` is missing: optimistic updates, automatic rollback, retry with backoff, mutation queuing.

`CacheManager.getInstance(maxSize)` has a silent flaw: `maxSize` is only used on the first call. Every subsequent call returns the existing instance and ignores the argument. Any component that calls `CacheManager.getInstance(500)` after the first `getInstance(200)` believes it configured a 500-slot cache but gets a 200-slot one.

#### Recommendation — Adopt TanStack Query

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**Step 1 — Add the provider once:**

```tsx
// src/providers/QueryProvider.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5 * 60 * 1000, retry: 2 },
        },
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

Add `<QueryProvider>` to `src/app/[locale]/layout.tsx` (inside the existing client providers).

**Step 2 — Migrate feature hooks one at a time:**

```ts
// Before
const { data, isLoading, error } = useApiQuery({
  queryKey: ["products"],
  queryFn: () => productService.list(),
});

// After
import { useQuery } from "@tanstack/react-query";
const { data, isLoading, error } = useQuery({
  queryKey: ["products"],
  queryFn: () => productService.list(),
  staleTime: 5 * 60 * 1000,
});
```

**Step 3 — Replace invalidation:**

```ts
// Before
import { invalidateQueries } from "@/hooks/useApiQuery";
invalidateQueries(["cart"]);

// After
import { useQueryClient } from "@tanstack/react-query";
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["cart"] });
```

**Step 4 — SSR hydration (server pages → client components):**

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
    queryFn: () => productRepository.list(searchParams), // no HTTP
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsView />
    </HydrationBoundary>
  );
}
```

**Comparison:**

| Feature                | useApiQuery | TanStack Query          |
| ---------------------- | ----------- | ----------------------- |
| Stale-while-revalidate | ✅          | ✅                      |
| Deduplication          | ✅          | ✅                      |
| Cache TTL              | ✅          | ✅ `staleTime`/`gcTime` |
| Optimistic updates     | ❌          | ✅                      |
| SSR hydration boundary | ❌          | ✅ `HydrationBoundary`  |
| Devtools               | ❌          | ✅                      |
| Retry with backoff     | ❌          | ✅                      |
| Persistence (offline)  | ❌          | ✅ plugin               |

**Migration order:** Start with non-critical feature hooks (blog, FAQ, categories). Move cart, auth, notifications last (higher risk).

---

### 3.2 Services Layer

#### Current state

35 files under `src/services/`. Pattern is uniform:

```ts
// Typical service — zero added value
export const cartService = {
  get: () => apiClient.get(API_ENDPOINTS.CART.GET),
  addItem: (data) => apiClient.post(API_ENDPOINTS.CART.ADD_ITEM, data),
};
```

Current read path:

```
Component → feature hook → useApiQuery → service → apiClient → API route → repository → Firestore
```

Seven hops. Four on the client, transforming nothing.

#### Two viable futures

**Option A — Server Actions (recommended, post-SSR)**

```ts
// src/services/cart.service.ts  — after Server Actions migration
"use server";
import { cartRepository } from "@/repositories";
import { getSession } from "@/lib/firebase/session";

export async function getCart() {
  const session = await getSession();
  return cartRepository.findByUserId(session.uid);
}
```

Call chain collapses to: `Component → Server Action → repository → Firestore`. Two hops.

**Option B — Keep services, add logic**

If Server Actions are not immediately feasible, services should earn their layer. Any service that is a pure `apiClient` wrapper with no transformation, caching, or orchestration should be deleted, and callers should call `apiClient` directly.

#### Decision rule

- **Now:** Keep services as-is. They are cheap abstraction. Do not delete before migration.
- **After Phase 5 (SSR):** Convert mutation services to Server Actions. Delete pure-pass-through read services and replace with `useQuery` calling `apiClient` or repo directly.
- **Never:** Delete a service before all its call sites are migrated.

---

### 3.3 API Routes & `createApiHandler`

#### Assessment: EXCELLENT — Keep as-is

`createApiHandler` is the strongest single pattern in the codebase:

- Type-safe auth via `requireAuthFromRequest`
- Role guard via `requireRoleFromRequest`
- Zod body validation with consistent 422 responses
- Rate limiting integration
- Centralised `handleApiError` — does NOT leak stack traces (logs server-side, returns generic message to client ✅)
- Typed `params` generic for dynamic routes

All 35 API route directories use it. **No change needed.**

**One improvement worth making:** `createApiHandler` does not attach rate-limit headers to the response (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`). These are useful for clients to handle 429s gracefully. After the Upstash migration, these headers come free from the Upstash result object.

#### Security note — `handleApiError`

The error handler logs stack traces server-side but returns only the generic message to the client. This is correct and must be preserved. No changes needed here.

---

### 3.4 Repository Layer

#### Assessment: SOLID — Minor improvements only

`BaseRepository<T>` with Sieve integration is well-designed. `UnitOfWork` for batch coordination is correct.

**Issue 1 — `batchUpdateAncestorMetrics` bypasses the repo layer.**  
`src/lib/helpers/category-metrics.ts` calls the Admin SDK directly. This logic should live in `CategoriesRepository` or a dedicated server-side helper that accepts a repository injected from the call site.

**Issue 2 — Repository singletons in feature files.**  
Some features import `new XRepository()` inline. All instantiation must go through `src/repositories/index.ts`. Add an ESLint `no-restricted-imports` rule forbidding direct `new XRepository()` outside `src/repositories/`.

**Issue 3 — `getAdminDb()` in BaseRepository.**  
`BaseRepository` calls `getAdminDb()` on every operation (via a getter). This is correct — `getAdminDb()` returns a cached singleton. Document this so maintainers do not "optimize" by capturing the instance in the constructor (which would fire before Firebase Admin initialises).

---

### 3.5 Form Handling — react-hook-form + zodResolver

#### Current state

```ts
// src/hooks/useForm.ts — ~65 LOC
export function useForm<T>({ initialValues, onSubmit, validate }) { ... }
```

Missing: `touched` state (errors appear on untouched fields), `formState.isDirty`, field arrays, `watch`, async field validation. The `validate` prop duplicates validation logic that already exists in `src/db/schema/*.ts` Zod schemas.

#### Recommendation

```bash
npm install react-hook-form @hookform/resolvers
```

**Before:**

```tsx
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { title: "", price: 0 },
  validate: (v) => {
    const errors: Record<string, string> = {};
    if (!v.title) errors.title = "Required";
    return errors;
  },
  onSubmit: (v) => productService.create(v),
});
```

**After:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Reuse the Zod schema already defined in src/db/schema/products.ts
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting, isDirty },
} = useForm<CreateProductInput>({
  resolver: zodResolver(createProductSchema),
  defaultValues: { title: "", price: 0 },
});
```

**Migration path:**

1. Install packages.
2. Migrate forms file-by-file. No big-bang rewrite needed.
3. Alias `import { useForm } from "react-hook-form"` — the name collides with `src/hooks/useForm.ts`. During transition, alias the old hook: `import { useForm as useLegacyForm } from "@/hooks/useForm"`.
4. Delete `src/hooks/useForm.ts` once all forms are migrated.

**Find all call sites:**

```bash
grep -r "from.*hooks/useForm" src --include="*.tsx" --include="*.ts" -l
```

---

### 3.6 Event Buses & Cache Singletons

#### Two parallel invalidation mechanisms

1. `src/classes/EventBus.ts` — general pub/sub singleton
2. `invalidationListeners` Map inside `src/hooks/useApiQuery.ts` — query-specific

When TanStack Query is adopted, both are replaced by:

```ts
queryClient.invalidateQueries({ queryKey: ["cart"] });
```

**Until TanStack Query is adopted:** Consolidate to `EventBus` only. Remove `invalidationListeners` from `useApiQuery.ts`. Route `invalidateQueries` through `EventBus.emit("invalidate:cart")`.

**CacheManager `maxSize` bug:**

```ts
// maxSize is silently ignored on every call after the first
public static getInstance(maxSize?: number): CacheManager {
  if (!CacheManager.instance) {
    CacheManager.instance = new CacheManager(maxSize); // used once
  }
  return CacheManager.instance; // maxSize argument on all later calls is dropped
}
```

Fix: Accept `maxSize` only in the constructor, not in `getInstance`. Or simply delete `CacheManager` when TanStack Query replaces it.

---

### 3.7 Schema Adapters

**File:** Likely `src/lib/adapters/` or `src/db/adapters/`

The three partial adapters use `| default` fallbacks that hide type gaps between the Firestore schema and the UI types. This means a missing required field passes through as `undefined` at runtime.

**Fix:**

1. Run `npx tsc --noEmit` and examine adapter type errors.
2. For each `| default`: decide if the field is truly optional (`?.`) in the Zod schema or if the fallback is hiding a schema omission. Fix the schema, not the adapter.
3. After fixing, remove the `| default` fallbacks one by one and let TypeScript enforce completeness.

---

### 3.8 Pages vs. Views Architecture

Current pattern is correct — pages are thin shells, views own layout. The problem is that 24 pages still carry `"use client"` because their views use `useApiQuery`. The SSR migration (Section 5) resolves this page by page.

**Rule to enforce now:**

- A page file (`src/app/**/page.tsx`) must never own a `useState`, `useEffect`, or data-fetching hook.
- A page may only import from `src/features/<name>` or `src/components`.
- All data shape goes into `<FeatureNameView initialData={data} />`.

---

### 3.9 Monitoring & Observability

**Current state:** `serverLogger` (Winston-based file logger) on the server. `logger` (console wrapper) on the client. No distributed tracing, no performance metrics, no error budget dashboards.

**Minimum additions:**

1. **Frontend error reporting** — Integrate Sentry client SDK. Connect to `ErrorBoundary.tsx` (already exists) and global `unhandledrejection`.
2. **API route latency** — Add timing middleware to `createApiHandler`:
   ```ts
   const start = performance.now();
   const response = await options.handler(data);
   const duration = performance.now() - start;
   serverLogger.info("API timing", { path: request.url, duration });
   return response;
   ```
3. **Structured log shipping** — On Vercel, configure log drains to send Winston JSON logs to a log aggregator (Datadog / Axiom).

---

## 4. Styling & Theming

---

### 4.1 Three Parallel Token Systems

Three separate token systems exist in parallel:

| System                | Location                                         | State                                                        |
| --------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| CSS custom properties | `src/app/globals.css` (`--primary`, `--card`, …) | Mostly unused — defined but not consumed in Tailwind classes |
| `THEME_CONSTANTS`     | `src/constants/theme.constants.ts`               | Actively used in JSX className strings                       |
| Tailwind config       | `tailwind.config.js` (extended theme)            | The actual Tailwind output                                   |

**The problem:** A developer adding a new component must decide which system to use. There is no canonical answer. The CSS vars in `globals.css` are dead weight (they shadow shadcn/ui convention but nothing consumes them). `THEME_CONSTANTS` is the real runtime token system, but it re-expresses Tailwind strings as nested constants — two-layer indirection.

**Target state:** One system. **Tailwind config is the single source of truth.**

- CSS custom properties: keep only what is consumed in `globals.css` base styles. Delete the rest.
- `THEME_CONSTANTS`: keep layout structural constants (`spacing.container`, `colors.brand.*`). **Delete** all entries that are plain Tailwind aliases (e.g. `gap.sm = "gap-2"`, `padding.md = "p-4"`) — they add indirection with zero value.
- Use Tailwind's `theme()` function in `globals.css` wherever a CSS var needs to reference the design system.

---

### 4.2 THEME_CONSTANTS Bloat

Entries to delete (pure Tailwind aliases with zero semantic value):

- `spacing.gap.*` — just use `gap-2`, `gap-4`, etc.
- `spacing.padding.*` — just use `p-2`, `p-4`, etc.
- `spacing.margin.*` — just use `m-2`, etc.
- `animation.*` where the value is a plain Tailwind class
- `borderRadius.*` re-exports

Entries to **keep** (genuine semantic tokens):

- `colors.brand.*` — brand palette not in vanilla Tailwind
- `colors.status.*` — semantic status colours
- `layout.containerMaxWidth` — single source for responsive max-width
- `typography.sizes.*` — if they map to a design scale, not arbitrary px

---

### 4.3 Gray SafeList — Incomplete Migration

`tailwind.config.js` safeLists `gray-*` variants. This signals an incomplete migration from Tailwind's `gray-*` classes to the project's `neutral-*` or `slate-*` design tokens.

**Audit task:**

```bash
grep -r "gray-" src --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

Replace all `gray-*` with the correct semantic colour from `THEME_CONSTANTS.colors` or the Tailwind config custom palette. Once no `gray-*` classes remain in source, remove the safelist entry.

---

### 4.4 Styling Migration Sequence

1. Delete dead CSS custom properties from `globals.css` (those not referenced anywhere in `src/`)
2. Audit `gray-*` usage, migrate to semantic colours, remove safelist
3. Delete `THEME_CONSTANTS` pure-alias entries (spacing, margin, padding, animation duplicates)
4. Write a Tailwind plugin or `theme.extend` entry for the remaining semantic tokens (brand colors, status colors)
5. Ensure ThemeContext writes a cookie (Section 2.5) — fixes flash
6. Fix `ResponsiveView` to use CSS classes (Section 2.7)

---

## 5. SSR Migration

**Goal:** Server-render the HTML for SEO-critical public pages. Preserve real-time functionality as client islands.  
**Approach:** Server Shell + Client Islands. Not a rewrite — surgical splits per page.  
**Target:** ~60% of public page weight becomes SSR HTML.

### Current State

| Category                  | Count | `"use client"` | Notes                           |
| ------------------------- | ----- | -------------- | ------------------------------- |
| Pages (`app/**/page.tsx`) | ~55   | 24             | 31 already server components    |
| Feature views             | ~60   | ~55            | All use `useApiQuery`           |
| Shared components         | ~80   | ~75            | Interactive by design — correct |
| Hooks                     | ~70   | ~25            | Data-fetching ones              |

**Root blockers:**

1. `useApiQuery` + `useApiMutation` — `useState`/`useEffect` → forces client
2. `apiClient.buildURL` uses `window.location.origin` → crashes on server (fix in Section 2.6)
3. `SessionContext` uses `onAuthStateChanged` → browser-only Firebase listener
4. All page-level data is fetched client-side via hooks, not passed as props

**Already correct:**

- All repositories use Admin SDK (server-only) ✅
- `app/[locale]/layout.tsx` is a server component ✅
- FAQs, Stores, Search, Reviews pages are already server components ✅
- `generateMetadata` exists on many pages ✅
- `app/sitemap.ts` exists — covers static pages, products, categories, events, blog ✅
- `app/robots.ts` exists — blocks admin/API/user paths; disallows AI crawlers ✅

---

### Phases Overview

| Phase   | Scope                                                        | SEO Impact          | Effort |
| ------- | ------------------------------------------------------------ | ------------------- | ------ |
| Phase 0 | Fix `apiClient` for server context                           | Unblocks everything | Low    |
| Phase 1 | Blog, Products, Events, Sellers, Profiles                    | Very High           | Medium |
| Phase 2 | Homepage sections                                            | High                | Medium |
| Phase 3 | Categories, Search, Stores, Reviews (listing + filter state) | High                | Medium |
| Phase 4 | Replace `onAuthStateChanged` with cookie-based session       | High (perf)         | High   |
| Phase 5 | Auctions/Chat via SSE instead of RTDB client SDK             | Medium              | High   |
| Phase 6 | FAQs, Contact, About, Terms, Privacy                         | Low (already fast)  | Low    |
| Phase 7 | Sitemap, `generateMetadata`, JSON-LD, `robots.txt`           | Very High           | Medium |
| Phase 8 | Delete replaced hooks/classes/services, snippets, dead CSS   | None                | Medium |

---

### Phase 0 — Fix apiClient for Server Use

**Why first:** Every other phase depends on this. Fix is in Section 2.6.

**Files:**

- `src/lib/api-client.ts` — 1 line change
- `.env.local` + Vercel env — add `NEXT_PUBLIC_APP_URL`

---

### Phase 1 — Public Content Pages (Highest SEO Value)

Pattern is identical for all content pages. Shown once (Blog), repeated for Products, Events, Sellers, Profiles.

#### Blog Post Page (`/blog/[slug]`)

**Before:**

```
page.tsx ("use client") → BlogPostView ("use client") → useApiQuery → /api/blog/[slug]
```

**After:**

```
page.tsx (server async)
  → blogRepository.getBySlug(slug)          ← direct repo, no HTTP
  → <BlogPostContent post={post} />         ← pure render
  → <RelatedPostsClient />                  ← client island (useApiQuery fine)
```

```tsx
// src/app/[locale]/blog/[slug]/page.tsx
import { blogRepository } from "@/repositories";
import { notFound } from "next/navigation";
import { BlogPostContent } from "@/features/blog";
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogRepository.getBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await blogRepository.getBySlug(slug);
  if (!post) notFound();
  return <BlogPostContent post={post} />;
}
```

**Files to change per content page:**

| File                                                                                      | Change                                           |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `app/[locale]/blog/[slug]/page.tsx`                                                       | Remove `"use client"`, make `async`, call repo   |
| `features/blog/components/BlogPostView.tsx`                                               | Add `initialData` prop; skip fetch when provided |
| Apply same pattern to: `products/[slug]`, `events/[slug]`, `sellers/[id]`, `profile/[id]` | —                                                |

---

### Phase 2 — Homepage Sections

The homepage (`app/[locale]/page.tsx`) is already a server component. The blocking problem is that `HomepageSectionsView` or similar client components fetch their own data.

**Target:** All homepage section data is fetched on the server in `page.tsx` and passed as `initialData` props to the interactive client islands (carousels, counters, etc.).

**Files:** `src/features/homepage/` views that currently call `useApiQuery`.

---

### Phase 3 — Listing Pages with Filter State

These pages have URL-driven filter state (`useUrlTable`). The pattern is:

```tsx
// app/[locale]/products/page.tsx
import { productRepository } from "@/repositories";
import { ProductsView } from "@/features/products";

export default async function ProductsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const products = await productRepository.list(resolvedParams);
  return <ProductsView initialData={products} />;
}
```

`ProductsView` is still `"use client"` because it manages filter state. Pass `initialData` instead of doing the initial fetch inside the hook.

The `useUrlTable` hook already reads filter state from URL searchParams — no change needed there. Just pass the server-fetched first page as `initialData`.

---

### Phase 4 — Auth Session Modernisation

**Current:** `SessionContext` subscribes to `onAuthStateChanged` (browser-only Firebase listener). The server knows nothing about the user's session at render time.

**Target:** Server reads the `__session` httpOnly cookie (Firebase Auth session cookie), verifies it server-side, passes the user to the page as props.

```tsx
// src/app/[locale]/layout.tsx (server)
import { getSession } from "@/lib/firebase/session";

export default async function RootLayout({ children }) {
  const session = await getSession(); // verifies __session cookie server-side
  return (
    <html>
      <body>
        <SessionProvider initialSession={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

`SessionProvider` initialises with server-side session data — no loading state on first render.

**Complexity:** Firebase Auth's `createSessionCookie` and `verifySessionCookie` are well-supported in the Admin SDK. The transition requires:

1. On sign-in: call `/api/auth/session` to create the `__session` cookie server-side.
2. On sign-out: call `/api/auth/session` DELETE to revoke and clear.
3. Root layout reads the cookie via `getSession()`.
4. `SessionContext` still handles real-time updates (token refresh, sign-out from another tab) via `onAuthStateChanged`.

---

### Phase 5 — Real-Time Client Islands (SSE Migration)

**Current:** Auction bids, chat, and payment status updates come from the Firebase Realtime Database client SDK. This means the browser holds an open WebSocket to Firebase.

**Target:** Replace RTDB listeners with Server-Sent Events (SSE) for one-way push, and Server Actions for writes. This eliminates the Firebase client SDK from browser bundles (significant size reduction).

```
// Before
RTDB WebSocket → onValue listener → setState

// After
GET /api/realtime/bids/[id]  (SSE stream, text/event-stream)
  → EventSource → onmessage → setState
```

Writes:

```
// Before
rtdb.ref("bids").push(newBid)

// After
Server Action: placeBid(bidData) → bidRepository.create() → rtdb.ref.set() (server-side)
```

This phase is high-effort. Prioritize auction bids (live updates visible to users) and chat (messages). Payment status can poll via `useQuery(refetchInterval: 5000)` as an interim.

---

### Phase 6 — Static Pages

FAQs, Contact, About, Terms, Privacy are already server components or close to it. Minor work:

- Ensure `generateStaticParams` is added for locale variants
- Add `export const revalidate = 3600` (revalidate every hour from ISR)

---

### Phase 7 — SEO Infrastructure

| Task                                            | File                                                               | Priority |
| ----------------------------------------------- | ------------------------------------------------------------------ | -------- |
| `generateMetadata` on all public pages          | `app/**/page.tsx`                                                  | High     |
| JSON-LD product/event schemas                   | `features/*/`                                                      | High     |
| ~~`app/sitemap.ts`~~                            | ~~New file~~                                                       | ✅ Done  |
| ~~`app/robots.ts`~~                             | ~~New file~~                                                       | ✅ Done  |
| `<link rel="canonical">`                        | Root layout                                                        | Medium   |
| Open Graph images via `app/opengraph-image.tsx` | Feature dirs                                                       | Low      |
| Create `docs/TECH_DEBT.md`                      | `next.config.js` references it for the Turbopack/webpack chunk bug | Low      |

---

### Phase 8 — Dead Code Removal

Run this phase in five sub-waves as upstream migration steps complete. Each sub-wave has a verification command — run it, confirm zero remaining callers, then delete.

---

**Sub-wave A — After C4 (TanStack Query fully adopted)**

Verify no remaining callers exist before deleting:

```bash
grep -rl "useApiQuery\|useApiMutation\|CacheManager\|EventBus\|invalidateQueries" src --include="*.ts" --include="*.tsx"
# Must return empty before proceeding
```

| Path                          | Replaced by                                |
| ----------------------------- | ------------------------------------------ |
| `src/hooks/useApiQuery.ts`    | `useQuery` from `@tanstack/react-query`    |
| `src/hooks/useApiMutation.ts` | `useMutation` from `@tanstack/react-query` |
| `src/classes/CacheManager.ts` | TanStack Query internal cache              |
| `src/classes/EventBus.ts`     | `queryClient.invalidateQueries`            |

Also remove the deleted files from barrel exports in `src/hooks/index.ts` and `src/classes/index.ts`.

---

**Sub-wave B — After D3 (react-hook-form fully adopted)**

Verify no remaining callers before deleting:

```bash
grep -rl "from.*hooks/useForm" src --include="*.ts" --include="*.tsx"
# Must return empty before proceeding
```

| Path                   | Replaced by                          |
| ---------------------- | ------------------------------------ |
| `src/hooks/useForm.ts` | `react-hook-form` with `zodResolver` |

---

**Sub-wave C — After G1 (services → Server Actions complete)**

Services that are pure `apiClient` pass-throughs (zero transformation, caching, or orchestration) should be deleted once all their call sites are converted to Server Actions. Services with logic become Server Actions in `src/actions/`.

Identify pure-passthrough candidates:

```bash
# Low arrow-function count correlates with pure wrappers
grep -c "=>" src/services/*.ts | sort -t: -k2 -n | head -20
```

**Delete immediately — no callers expected:**

| Path                           | Reason                                        |
| ------------------------------ | --------------------------------------------- |
| `src/services/demo.service.ts` | Demo/test artifact — not wired to any feature |

Verify before each service deletion: `npx tsc --noEmit`

---

**Sub-wave D — Styling dead code (after F1)**

1. **Dead CSS custom properties** in `src/app/globals.css` — any `--variable` defined but never consumed via `var(--variable)` anywhere in `src/`:

   ```bash
   # Compare defined vs. used CSS vars
   grep -oh "\-\-[a-z-]*:" src/app/globals.css | tr -d ":" | sort -u
   grep -roh "var(--[a-z-]*)" src --include="*.tsx" --include="*.ts" --include="*.css" | grep -oh "\-\-[a-z-]*" | sort -u
   ```

2. **THEME_CONSTANTS pure aliases** in `src/constants/theme.constants.ts` — entries that are plain Tailwind class strings with zero semantic value (e.g. `gap.sm = "gap-2"`). Delete the entry and write the Tailwind class directly at every call site.

3. **`gray-*` class references** — replace with semantic colour tokens, then remove the `gray-*` safelist from `tailwind.config.js`:
   ```bash
   grep -r "gray-" src --include="*.tsx" --include="*.ts"
   ```

---

**Sub-wave E — Developer snippets (anytime after all patterns are stable)**

`src/snippets/` contains 6 reference-only code templates (`api-requests`, `error-logging-init`, `form-validation`, `index`, `performance`, `react-hooks`). Confirm they are never imported at runtime:

```bash
grep -rl "from.*snippets\|require.*snippets" src --include="*.ts" --include="*.tsx"
# Must return empty
```

If empty: move to `docs/snippets/` for team reference, or delete entirely if the patterns are covered by this document and `GUIDE.md`.

---

## 6. Component Patterns

---

### 6.1 Form Components

**Current inventory:**

```
src/components/forms/
  Checkbox.tsx, Form.tsx, Input.tsx, Radio.tsx
  Select.tsx, Slider.tsx, Textarea.tsx, Toggle.tsx
```

These are dumb UI primitives — they accept `value`/`onChange`/`error` props and render HTML. This is correct.

**Integration with react-hook-form (after §3.5 migration):**

Each primitive must accept a `ref` (already done if they use `forwardRef`) so `register()` works:

```tsx
// Input.tsx — ensure this pattern works
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, ...props }, ref) => (
    <div>
      <input ref={ref} {...props} />
      {error && <span className="text-red-500">{error}</span>}
    </div>
  ),
);
```

**`FormField.tsx`** (root-level component) should be the standard wrapper that connects a label, a form primitive, and an error message — and accepts `react-hook-form`'s `register()` output spread.

---

### 6.2 Filter Components

**Current inventory:**

```
src/components/filters/
  BlogFilters, EventFilters, OrderFilters, ProductFilters
  RangeFilter, ReviewFilters, SwitchFilter, filterUtils.ts

src/features/admin/components/   ← 14 admin filters migrated here ✅
  BidFilters, CarouselFilters, CategoryFilters, CouponFilters,
  EventEntryFilters, FaqFilters, HomepageSectionFilters,
  NewsletterFilters, NotificationFilters, PayoutFilters,
  RipCoinFilters, SessionFilters, StoreFilters, UserFilters
```

**Migration complete:** All 14 admin-only filter components (and `RichTextEditor`) were moved from `src/components/` and `src/components/filters/` into `src/features/admin/components/`. Shared filters (`ProductFilters`, `OrderFilters`, `BlogFilters`, `ReviewFilters`, `EventFilters`, `RangeFilter`, `SwitchFilter`, `filterUtils`) remain in `src/components/filters/`.

**Pattern assessment:** Each filter component is implemented independently. There is significant duplication of the checkbox-group, range, and date-range patterns across 14 admin filter components.

**Recommendation — Generic `FilterPanel` component:**

```tsx
// src/components/filters/FilterPanel.tsx
interface FilterConfig {
  key: string;
  label: string;
  type: "checkbox-group" | "range" | "date-range" | "switch" | "select";
  options?: { label: string; value: string }[];
}

interface FilterPanelProps {
  config: FilterConfig[];
  value: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
}
```

Each existing filter component becomes a config array passed to `FilterPanel`. This eliminates the duplicated rendering logic. The admin filter components would reduce from 13 files to 13 config objects.

**This is non-urgent** — the current duplication is manageable. Consider consolidating when the next new filter type is needed.

---

### 6.3 Media Components

**Current inventory:**

```
src/components/media/
  MediaAvatar.tsx, MediaImage.tsx, MediaLightbox.tsx, MediaVideo.tsx
```

**Rules (from Rule 28 — must be enforced):**

- All `<img>` tags → `MediaImage`
- All `<video>` tags → `MediaVideo`
- All user avatars → `MediaAvatar`
- Media must always be in an `aspect-*` container, never a fixed `h-[px]` wrapper

**Audit task:**

```bash
# Find raw img/video tags that should use Media components
grep -r "<img " src --include="*.tsx" | grep -v "node_modules"
grep -r "<video " src --include="*.tsx" | grep -v "node_modules"
```

**`MediaImage` must use `next/image`** — this is required for Vercel's image optimization and the `remotePatterns` CSP in `next.config.js`.

**`MediaLightbox`** — ensure it uses `MediaImage` internally, not raw `<img>`.

---

### 6.4 Modal Pattern

**Current inventory:**

```
src/components/modals/
  ConfirmDeleteModal.tsx, ImageCropModal.tsx, UnsavedChangesModal.tsx
```

**Rule (from Rule 22):** No `alert()` or `confirm()` anywhere in source. Use `ConfirmDeleteModal` + `useMessage()` instead.

**Audit task:**

```bash
grep -r "alert\(\|confirm\(" src --include="*.tsx" --include="*.ts"
```

**Pattern for new modals:**

- Accept `isOpen`, `onClose`, `onConfirm` props
- Use `dialog` element (accessible) or the existing `SideDrawer` for panel-style modals
- Never use the browser `confirm()` dialog

---

### 6.5 Layout Components

**Current inventory:**

```
src/components/layout/
  AutoBreadcrumbs, BottomNavbar, BottomNavLayout, Breadcrumbs,
  Footer, FooterLayout, LocaleSwitcher, MainNavbar, NavbarLayout,
  NavItem, Sidebar, SidebarLayout, TitleBar, TitleBarLayout
```

**Assessment:** The layout component tree (NavbarLayout → MainNavbar + NavItem, SidebarLayout → Sidebar, etc.) is well-structured. The `*Layout` wrappers compose primitive components.

**One concern — `MainNavbar` and `BottomNavbar` likely use `SessionContext`**  
This forces them to be client components. During Phase 4 (session modernisation), these can receive the initial session as a prop from the server and hold a lighter client boundary.

**`LocaleSwitcher`** should use `router.replace()` with the new locale path, not a full page reload. Verify its implementation is using Next.js navigation, not `window.location.href`.

---

## 7. Combined Migration Sequence

All work is divided into eight stages. **Stages A and B run in parallel.** Within each stage, steps marked ‖ can be done concurrently by different developers. Step labels (A1, C4, F3 …) are the canonical references used throughout §5, §8, and §10.

**Critical dependency chain:**

```
A1 (apiClient fix)   ──► E1 (SSR Phase 1)
A1–A6 deployed       ──► C1 (TanStack Query) and E1 (SSR)  ← gates
C4 (TanStack done)   ──► F2 (@lir/react)  — don't extract hooks about to be deleted
D3 (forms done)      ──► F2
F1 (styling trim)    ──► F3 (@lir/ui)     — trim THEME_CONSTANTS before packaging
E6 (auth session)    ──► G1 (Server Actions need getSession())
F4 (imports done)    ──► H7 (publish @lir/*)
```

---

### Stage A — Security & Bug Fixes _(do first, before any architecture work)_

> ✅ **Complete — all 17 steps committed 2026-03-09.**

| Step  | Action                                                                        | §Ref  | Risk   | Effort | Prerequisite |
| ----- | ----------------------------------------------------------------------------- | ----- | ------ | ------ | ------------ |
| A1    | Fix `apiClient.buildURL` — add `NEXT_PUBLIC_APP_URL` env var                  | §2.6  | Low    | 30 min | —            |
| A2 ‖  | Fix Razorpay HMAC — `timingSafeEqual` on both comparisons                     | §9.9  | Low    | 30 min | —            |
| A3 ‖  | Fix webhook HMAC — `timingSafeEqual`                                          | §2.2  | Low    | 30 min | —            |
| A4 ‖  | Fix media upload — magic byte detection; `randomBytes` filename               | §2.3  | Low    | 1 hr   | —            |
| A5 ‖  | Replace rate limiter — Upstash Redis; remove dev bypass                       | §2.1  | Medium | 2 hr   | —            |
| A6 ‖  | Nonce-based CSP — `generateNonce()`; remove `unsafe-eval` in prod             | §2.4  | Medium | 4 hr   | —            |
| A7    | Fix `ThemeContext` — read DOM class for initial state; write cookie on toggle | §2.5  | Low    | 1 hr   | —            |
| A8 ‖  | Fix `ResponsiveView` — render both trees, CSS hides inactive                  | §2.7  | Low    | 30 min | —            |
| A9 ‖  | Fix `useMediaQuery` — lazy initializer with SSR guard                         | §9.2  | Low    | 30 min | —            |
| A10 ‖ | Fix `useWishlistToggle` — rollback optimistic state in catch                  | §9.1  | Low    | 30 min | —            |
| A11 ‖ | Fix `useApiQuery` cache — `CacheManager.clear()` on sign-out                  | §9.11 | Low    | 30 min | —            |
| A12 ‖ | Fix `useRazorpay` — add `isError` state; expose in return                     | §9.5  | Low    | 30 min | —            |
| A13 ‖ | Fix `useNotifications` — `onSuccess: () => refetch()`                         | §9.3  | Low    | 30 min | —            |
| A14 ‖ | Fix `useChat` — store listener ref; pass to `off()`                           | §9.4  | Low    | 30 min | —            |
| A15 ‖ | Fix `apiClient` AbortController — `removeEventListener` in finally            | §9.6  | Low    | 30 min | —            |
| A16 ‖ | Fix `Queue.process()` — `.catch()` on recursive tail call                     | §9.7  | Low    | 30 min | —            |
| A17 ‖ | Fix `StorageManager` — per-prefix instance map                                | §9.8  | Low    | 1 hr   | —            |

> ~~**Gate:** A1–A6 must be production-deployed before Stage C or Stage E begins.~~ ✅ Gate cleared — A1–A17 deployed 2026-03-09.

---

### Stage B — Library Bootstrap _(parallel with Stage A, zero risk to app)_

> **B1 ✅** committed 2026-03-10 — monorepo bootstrap scaffold added (`pnpm-workspace.yaml`, `turbo.json`, `packages/*` stubs with per-package `package.json` + `tsconfig.json` + `src/index.ts`).

Copies files and creates new packages without modifying any app source. Safe to run alongside Stage A.

| Step | Action                                                                                          | §Ref  | Risk   | Effort | Prerequisite |
| ---- | ----------------------------------------------------------------------------------------------- | ----- | ------ | ------ | ------------ |
| B1   | Bootstrap monorepo — `pnpm-workspace.yaml`, `turbo.json`, per-package `tsup` + `tsconfig` stubs | §10.1 | Low    | 1 hr   | —            |
| B2   | Extract `@lir/core` — copy pure files, strip app imports, write Vitest tests                    | §10.2 | Low    | 2 days | B1           |
| B3   | Extract `@lir/http` — strip `API_ENDPOINTS` ref; add `baseUrl` constructor                      | §10.2 | Low    | 4 hr   | B2           |
| B4   | Extract `@lir/next` — `IAuthVerifier` interface; move `error-handler` out of `@lir/core`        | §10.2 | Medium | 1 day  | B2, B3       |

---

### Stage C — Data Fetching Migration _(after A1–A6 deployed)_

> ✅ **Complete — committed 2026-03-09.** Adapter pattern: `useApiQuery` / `useApiMutation` rewritten as thin TanStack Query wrappers; all 150+ callers unchanged. `QueryProvider` singleton + devtools installed in root layout.

| Step | Action                                                                                                       | §Ref     | Risk   | Effort | Prerequisite |
| ---- | ------------------------------------------------------------------------------------------------------------ | -------- | ------ | ------ | ------------ |
| C1   | Install TanStack Query; add `QueryProvider` to root layout                                                   | §3.1     | Low    | 30 min | A1           |
| C2   | Migrate 3–5 low-risk hooks (blog, FAQ, categories) to `useQuery`                                             | §3.1     | Medium | 1 day  | C1           |
| C3   | Migrate all remaining feature hooks to `useQuery` / `useMutation`                                            | §3.1     | Medium | 3 days | C2           |
| C4   | Verify zero callers (grep), then delete `useApiQuery`, `useApiMutation`, `CacheManager`, `EventBus` from app | §3.6, §8 | High   | 1 day  | C3           |

---

### Stage D — Form Migration _(parallel with Stage C)_

> ✅ **Complete — committed 2026-03-09.** `react-hook-form@7.71.2` + `@hookform/resolvers` installed; `src/hooks/useForm.ts` deleted; `useForm` re-exported from `react-hook-form` in the barrel.

| Step | Action                                                        | §Ref       | Risk   | Effort | Prerequisite |
| ---- | ------------------------------------------------------------- | ---------- | ------ | ------ | ------------ |
| D1   | Install `react-hook-form` + `@hookform/resolvers`             | §3.5       | Low    | 30 min | —            |
| D2   | Verify `forwardRef` on all form primitives; migrate 3–5 forms | §3.5, §6.1 | Medium | 1 day  | D1           |
| D3   | Migrate all remaining forms; delete `src/hooks/useForm.ts`    | §3.5, §8   | Medium | 2 days | D2           |

---

### Stage E — SSR Migration _(A1 must be done; C1 recommended for prefetch pattern)_

> **E1 ✅** committed 2026-03-09 — blog/products/events/sellers async RSC + `generateMetadata`<br>
> **E2 ✅** committed 2026-03-09 — homepage `initialData` pre-fetch (carousel, categories, reviews)<br>
> **E3 ✅** committed 2026-03-09 — listing pages (products, categories, stores, search)<br>
> **E4 ✅** committed 2026-03-09 — static pages `generateStaticParams` + ISR `revalidate = 3600`<br>
> **E5 ✅** committed 2026-03-09 — SEO `generateMetadata` all pages, JSON-LD schemas, canonical links<br>
> **E6 ✅** committed 2026-03-09 — auth session cookie `__session`; cookie-read in layout; `SessionProvider` init<br>
> **E7 ✅** committed 2026-03-09 — SSE islands; RTDB client listeners replaced with `EventSource`<br>
> **Stage E complete.**

| Step | Action                                                                                           | §Ref   | Risk   | Effort | Prerequisite |
| ---- | ------------------------------------------------------------------------------------------------ | ------ | ------ | ------ | ------------ |
| E1   | SSR Phase 1 — blog, products, events, sellers, profiles: async server pages + `generateMetadata` | §5 Ph1 | Medium | 2 days | A1           |
| E2   | SSR Phase 2 — homepage sections via `initialData` props                                          | §5 Ph2 | Medium | 1 day  | E1           |
| E3   | SSR Phase 3 — listing pages (products, categories, stores, search)                               | §5 Ph3 | Medium | 2 days | E2           |
| E4 ‖ | SSR Phase 6 — static pages: `generateStaticParams`, ISR `revalidate = 3600`                      | §5 Ph6 | Low    | 1 day  | E1           |
| E5 ‖ | SSR Phase 7 — SEO: `generateMetadata` all pages, JSON-LD schemas, canonical links                | §5 Ph7 | Low    | 1 day  | E3           |
| E6   | SSR Phase 4 — auth session cookie: `__session`; cookie-read in layout; `SessionProvider` init    | §5 Ph4 | High   | 3 days | E3           |
| E7   | SSR Phase 5 — real-time SSE islands: replace RTDB client listeners with `EventSource`            | §5 Ph5 | High   | 4 days | E6, C3       |

---

### Stage F — Library: React & UI Extraction _(after C4 and D3)_```````````````````````````````````````````````````````````

> **F1 ✅** committed 2026-03-10 — dead CSS custom properties + `@layer components` block removed from `globals.css`; all `gray-*` Tailwind classes replaced across 90+ files with canonical zinc/slate palette; `gray-*` safelist removed from `tailwind.config.js`.
> F2–F4 pending.

Extract only the hooks and components that survive the TanStack Query and react-hook-form migrations.

| Step | Action                                                                                         | §Ref  | Risk   | Effort | Prerequisite |
| ---- | ---------------------------------------------------------------------------------------------- | ----- | ------ | ------ | ------------ |
| F1   | Styling cleanup — dead CSS vars, `gray-*` audit, `THEME_CONSTANTS` pure-alias trim             | §4    | Low    | 1 day  | D3           |
| F2   | Extract `@lir/react` — remaining generic hooks, `StorageManager`, `EventManager`, `classNames` | §10.2 | Medium | 1 day  | C4, D3, B2   |
| F3   | Extract `@lir/ui` — all generic components; rename `THEME_CONSTANTS` → `UI_THEME`              | §10.2 | Medium | 2 days | F1, F2       |
| F4   | Update all `apps/web` imports to `@lir/*`; run `npx tsc --noEmit` + `npm run build`            | §10.5 | Medium | 2 days | B4, F3       |

---

### Stage G — Server Actions & Repository Fixes _(after E6, E7)_

> **G3 ✅** committed 2026-03-09 — dead `category-metrics.ts` deleted; `batchUpdateAncestorMetrics` wired directly into `CategoriesRepository`<br>
> **G4 ✅** committed 2026-03-09 — dead `schema.adapter.ts` deleted; `|` default fallbacks removed from Zod schemas<br>
> **G5 ✅** committed 2026-03-10 — AES-256-GCM encrypted credential storage in `siteSettings` singleton; `src/lib/encryption.ts` (`encrypt`/`decrypt`/`maskSecret`); `getDecryptedCredentials()` / `getCredentialsMasked()` on `siteSettingsRepository`; `SiteCredentialsForm` admin UI; DB-first async credential resolution in `razorpay.ts` and `email.ts`; `SETTINGS_ENCRYPTION_KEY` env var required (64-char hex)<br>
> G1 prerequisite (E6, E7) ✅ met — **unblocked**.

| Step | Action                                                                                      | §Ref     | Risk | Effort | Prerequisite |
| ---- | ------------------------------------------------------------------------------------------- | -------- | ---- | ------ | ------------ |
| G1   | Convert mutation services to Server Actions; identify and delete pure pass-through services | §3.2, §8 | High | 4 days | E6, E7 ✅    |

> **G1 in progress** (2026-03-09 → 2026-03-10) — 15+ Server Actions created (`cart`, `wishlist`, `review`, `notification`, `address`, `bid`, `coupon`, `contact`, `newsletter`, `faq`, `profile`, `becomeSeller`, `createCategory`, `revokeSession`, `deleteNotification`); 20+ hook mutations migrated to call Server Actions; Rule 20 violations fixed in `SellerCreateProductView`, `SellerEditProductView`, `EventParticipateView`, `AdminMediaView`, `AdminSiteView`, `UserNotificationsView`, `UserSettingsView`, `CartView`, `WishlistView`, `AuctionsView`, `PreOrdersView`, `ProductsView`, `CheckoutView`. Pure-passthrough service deletion (H3) pending.
> | G2 | `FilterPanel` — consolidate 14 admin filter components to config-driven pattern | §6.2 | Low | 1 day | — |
> | ~~G3~~ | ~~Fix Repository singletons — add ESLint `no-restricted-imports` rule; move `batchUpdateAncestorMetrics` into `CategoriesRepository`~~ | §3.4 | Low | 4 hr | — |
> | ~~G4~~ | ~~Fix schema adapters — remove `\|` default fallbacks; fix root cause in Zod schemas~~ | §3.7 | Medium | 4 hr | — |
> | ~~G5~~ | ~~AES-256-GCM encrypted storage for provider credentials in `siteSettings`; admin UI; DB-first async resolution~~ | — | Low | 1 day | — |

---

### Stage H — Dead Code & Publish _(as upstream stages complete)_

| Step   | Action                                                                              | §Ref      | Risk | Effort | Prerequisite |
| ------ | ----------------------------------------------------------------------------------- | --------- | ---- | ------ | ------------ |
| H1     | Remove `useApiQuery`, `useApiMutation`, `CacheManager`, `EventBus` barrel exports   | §8 wave-A | Low  | 1 hr   | C4           |
| H2     | Remove `useForm.ts` barrel export                                                   | §8 wave-B | Low  | 30 min | D3           |
| H3     | Delete pure pass-through services + `demo.service.ts`                               | §8 wave-C | Low  | 1 day  | G1           |
| H4     | Delete dead CSS vars, `THEME_CONSTANTS` aliases, remove `gray-*` safelist           | §8 wave-D | Low  | 4 hr   | F1           |
| ~~H5~~ | ~~Move `src/snippets/` → `docs/snippets/` or delete; confirm zero runtime imports~~ | §8 wave-E | Low  | 30 min | —            |
| ~~H6~~ | ~~Create `docs/TECH_DEBT.md` (referenced in `next.config.js`)~~                     | §5 Ph7    | Low  | 30 min | —            |

> **H5 ✅** committed 2026-03-10 — `src/snippets/` deleted (6 files); moved to `docs/snippets/`; barrel re-export removed from `src/index.ts`.<br>
> **H6 ✅** committed 2026-03-10 — `docs/TECH_DEBT.md` created with TD-001 (Turbopack), TD-002 (useApiQuery adapters), TD-003 (service passthrough), TD-004 (THEME*CONSTANTS spacing aliases).
> | H7 | Per-package `CHANGELOG.md`; configure `changesets`; publish `@lir/*`packages to npm | §10.4 | Low | 1 day | F4 |
| H8 *(opt.)\_ | Move`src/`→`apps/web/`; full monorepo restructure | §10.1 | Low | 1 day | H7 |

---

## 8. Files to Delete After Migration

This table is the master deletion checklist. See [Phase 8](#phase-8--dead-code-removal) for per-wave verification commands.

### Already deleted / moved ✅

| File                                                          | Reason                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~`docs/DESIGN_PATTERNS.md`~~                                 | Superseded by `MASTER_PLAN.md`                                                                                                                                                                                                                                                                               |
| ~~`docs/SSR_MIGRATION_PLAN.md`~~                              | Superseded by `MASTER_PLAN.md`                                                                                                                                                                                                                                                                               |
| ~~`src/components/admin/RichTextEditor.tsx`~~                 | Moved to `src/features/admin/components/`                                                                                                                                                                                                                                                                    |
| ~~14 admin filter components from `src/components/filters/`~~ | Moved to `src/features/admin/components/` — `BidFilters`, `CarouselFilters`, `CategoryFilters`, `CouponFilters`, `EventEntryFilters`, `FaqFilters`, `HomepageSectionFilters`, `NewsletterFilters`, `NotificationFilters`, `PayoutFilters`, `RipCoinFilters`, `SessionFilters`, `StoreFilters`, `UserFilters` |
| ~~`src/hooks/useForm.ts`~~                                    | Deleted — `useForm` re-exported from `react-hook-form` in `src/hooks/index.ts` (Stage D, 2026-03-09)                                                                                                                                                                                                         |
| ~~`src/hooks/__tests__/useForm.test.ts`~~                     | Deleted alongside source file (Stage D, 2026-03-09)                                                                                                                                                                                                                                                          |

### Pending — keyed to §7 step

| File                                      | Delete after | Replaced by                                          |
| ----------------------------------------- | ------------ | ---------------------------------------------------- |
| `src/hooks/useApiQuery.ts`                | C4           | `useQuery` from `@tanstack/react-query`              |
| `src/hooks/useApiMutation.ts`             | C4           | `useMutation` from `@tanstack/react-query`           |
| `src/classes/CacheManager.ts`             | C4           | TanStack Query internal cache                        |
| `src/classes/EventBus.ts`                 | C4           | `queryClient.invalidateQueries`                      |
| `src/services/demo.service.ts`            | G1           | Not needed — demo artifact                           |
| Pure-passthrough files in `src/services/` | H3           | Server Actions in `src/actions/`                     |
| `src/snippets/` (entire directory)        | H5           | Patterns documented in `MASTER_PLAN.md` / `GUIDE.md` |

### Code to remove (not full-file deletions)

| Location                                              | What to remove                                                  | When    |
| ----------------------------------------------------- | --------------------------------------------------------------- | ------- |
| `src/hooks/index.ts`                                  | Barrel re-exports for deleted hooks                             | C4 & D3 |
| `src/classes/index.ts`                                | Barrel re-exports for deleted classes                           | C4      |
| `src/app/globals.css`                                 | Dead `--variable` CSS custom properties                         | F1      |
| `src/constants/theme.constants.ts`                    | Pure Tailwind-alias entries (`gap.*`, `padding.*`, `margin.*`)  | F1      |
| `tailwind.config.js` safelist                         | `gray-*` entries once all `gray-` classes replaced              | F1      |
| `src/app/[locale]/layout.tsx` and all 24 client pages | `"use client"` directive (where applicable after SSR migration) | E1–E7   |

---

## 9. Known Bugs & Fixes

All bugs are confirmed present in the codebase as of audit date 2026-03-09. Each entry includes: the exact file and line exhibiting the bug, root cause, impact, and the minimal fix.

---

### 9.1 — useWishlistToggle — No State Rollback on Error

**File:** `src/hooks/useWishlistToggle.ts`

**Bug:** `toggle()` optimistically mutates `inWishlist` before the API call, then re-throws on failure without reverting:

```ts
setInWishlist(!inWishlist); // ← mutated immediately
try {
  await ...;
} catch (err) {
  throw err; // ← no rollback
}
```

Call sites use `onClick={toggle}` without `.catch()`, producing an unhandled rejection and leaving the UI in the wrong state.

**Fix:**

```ts
const prev = inWishlist;
setInWishlist(!inWishlist);
try {
  await ...;
} catch (err) {
  setInWishlist(prev); // rollback
  showMessage(t("wishlist.errorMessage"), "error");
}
```

---

### 9.2 — useMediaQuery — Hydration Mismatch

**File:** `src/hooks/useMediaQuery.ts` (used by `useBreakpoint`)

**Bug:**

```ts
const [matches, setMatches] = useState(false); // ← server always "false"
```

Mobile users see a flash of desktop layout on every hard reload: the server renders `false` (desktop), React hydrates, `useEffect` fires, state becomes `true` (mobile), layout re-renders.

**Fix — lazy initializer with SSR guard:**

```ts
const [matches, setMatches] = useState(
  () => typeof window !== "undefined" && window.matchMedia(query).matches,
);
```

This uses the real value on the first client render, suppressing the flash. Does not affect SSR (returns `false` on server, consistent with no `window`).

---

### 9.3 — useNotifications — Stale Unread Count After Mutations

**File:** `src/hooks/useNotifications.ts`

**Bug:** `markRead` and `markAllRead` mutations have no `onSuccess` callback:

```ts
const { mutate: markRead } = useApiMutation<unknown, string>({
  mutationFn: (id) => notificationService.markRead(id),
  // ← no onSuccess
});
```

After marking a notification as read, the notification list is stale until the `useApiQuery` cache expires (~30s). The unread badge shows the wrong count.

**Fix:**

```ts
const { mutate: markRead } = useApiMutation({
  mutationFn: (id) => notificationService.markRead(id),
  onSuccess: () => refetch(),
});
```

---

### 9.4 — useChat — `off()` Removes All Listeners

**File:** `src/hooks/useChat.ts`

**Bug:** Cleanup calls `off(msgRefRef.current)` without a listener reference:

```ts
return () => {
  if (msgRefRef.current) {
    off(msgRefRef.current); // ← removes ALL listeners on this path
    msgRefRef.current = null;
  }
};
```

Firebase RTDB's `off(ref)` without a callback argument removes **every** listener on that database path — affecting other components subscribed to the same room.

**Fix — store the listener and pass it back:**

```ts
const listenerRef = useRef<((snap: DataSnapshot) => void) | null>(null);

// When attaching:
listenerRef.current = (snap) => {
  /* handler */
};
onValue(msgRef, listenerRef.current);

// Cleanup:
return () => {
  if (msgRefRef.current && listenerRef.current) {
    off(msgRefRef.current, "value", listenerRef.current);
    listenerRef.current = null;
  }
};
```

---

### 9.5 — useRazorpay — Silent Script Load Failure

**File:** `src/hooks/useRazorpay.ts`

**Bug:** Script load failure only clears `isLoading`:

```ts
script.onerror = () => {
  setIsLoading(false); // ← no error state
};
return { openRazorpay, isLoading }; // ← isError never exposed
```

When the Razorpay CDN is unreachable, the hook looks "ready" (`isLoading=false`, no error). Clicking "Pay" throws because `window.Razorpay` is undefined.

**Fix:**

```ts
const [isError, setIsError] = useState(false);

script.onerror = () => {
  setIsLoading(false);
  setIsError(true);
};

return { openRazorpay, isLoading, isError };
```

Call sites should disable the Pay button and surface an error message when `isError` is `true`.

---

### 9.6 — apiClient — AbortController Listener Leak

**File:** `src/lib/api-client.ts`

**Bug:** When a caller passes an external `AbortSignal`, the client adds a listener but never removes it:

```ts
signal.addEventListener("abort", () => controller.abort());
// ← no removeEventListener in finally
```

Long-lived signals (e.g. from a parent component's `AbortController`) accumulate one listener per API call that uses them. Over time this leaks memory and may trigger double-aborts.

**Fix:**

```ts
const onAbort = () => controller.abort();
signal.addEventListener("abort", onAbort);
try {
  return await fetch(...);
} finally {
  signal.removeEventListener("abort", onAbort);
}
```

---

### 9.7 — Queue — Unhandled Async Errors in `process()`

**File:** `src/classes/Queue.ts`

**Bug:** The recursive tail call in `finally` is not `await`-ed:

```ts
} finally {
  this.process(); // ← not awaited — unhandled promise rejection if it throws
}
```

Any error thrown by the next `process()` invocation is swallowed by the event loop rather than propagating to the caller.

**Fix:**

```ts
} finally {
  this.process().catch((err) => {
    logger.error("Queue.process error", err);
  });
}
```

Or restructure `process()` to use an iterative loop rather than recursion.

---

### 9.8 — StorageManager — Singleton Prefix Silently Ignored

**File:** `src/classes/StorageManager.ts`

**Bug:**

```ts
public static getInstance(prefix?: string): StorageManager {
  if (!StorageManager.instance) {
    StorageManager.instance = new StorageManager(prefix); // used only once
  }
  return StorageManager.instance; // prefix ignored on all subsequent calls
}
```

Any module calling `StorageManager.getInstance("cart")` after the first instantiation believes it has a namespaced store but actually reads/writes from the first instance's prefix (or no prefix).

**Fix — do not accept `prefix` in `getInstance`; require callers to construct directly:**

```ts
// Remove getInstance() — callers create their own instances:
export const cartStorage = new StorageManager("cart");
export const sessionStorage = new StorageManager("session");
```

Or accept prefix in `getInstance` as part of the key so each prefix gets its own instance:

```ts
private static instances = new Map<string, StorageManager>();

public static getInstance(prefix = ""): StorageManager {
  if (!StorageManager.instances.has(prefix)) {
    StorageManager.instances.set(prefix, new StorageManager(prefix));
  }
  return StorageManager.instances.get(prefix)!;
}
```

---

### 9.9 — verifyPaymentSignature — Timing Attack

**File:** `src/lib/payment/razorpay.ts`

**Bug:** Two HMAC comparisons use JavaScript `===` (lines 105 and 132):

```ts
return generatedSignature === params.razorpay_signature; // line 105
return generatedSignature === receivedSignature; // line 132
```

String `===` short-circuits on the first differing byte. An attacker measuring response latency can brute-force the signature one byte at a time. For Razorpay payment verification, this means a fraudulent payment could be accepted.

**Fix — `timingSafeEqual` for both comparisons:**

```ts
import { timingSafeEqual } from "crypto";

function safeCompareHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

// Replace both === comparisons:
return safeCompareHex(generatedSignature, params.razorpay_signature);
return safeCompareHex(generatedSignature, receivedSignature);
```

Also apply to `src/app/api/webhooks/shiprocket/route.ts` (§2.2).

---

### 9.10 — Payment Verify Route — Stale Cart Prices ✅ Fixed 2026-03-10

**File:** `src/app/api/payment/verify/route.ts`

**Bug:** The verify route builds `expectedPaymentAmountRs` from the cart snapshot (`item.price`), not from live `product.price`. If a product's price increases between when the user added it to cart and when they pay, the stale (lower) price is used and the merchant is underpaid.

**Partial mitigation already in place:** The route calls `fetchRazorpayOrder(razorpay_order_id)` and compares `paidAmountRs` against `expectedPaymentAmountRs`. This guards against a user creating a Razorpay order with `amount=1` to pay ₹1 — the Razorpay order amount `(₹1) < expectedPaymentAmountRs` check will reject it.

**Remaining vulnerability:** If the Razorpay order was _also_ created using stale cart prices (at `/api/payment/create-order`), both sides of the cross-check use the same stale snapshot and the guard passes at the lower amount.

**Fix — use live `product.price` at order-creation time:**

```ts
// In /api/payment/create-order route — replace snapshot price with live price
const liveProducts = await Promise.all(
  cart.items.map((item) => productRepository.findById(item.productId)),
);
const liveSubtotal = liveProducts.reduce(
  (sum, prod, i) => sum + prod!.price * cart.items[i].quantity,
  0,
);
// Create the Razorpay order with liveSubtotal — not cartSubtotal
```

Once the Razorpay order is created with the live price, the verify route's cross-check will reject any payment where the Razorpay order amount was based on a stale lower price.

**Fix applied 2026-03-10:** `cartSubtotal`, `groupTotal`, `orderItems.unitPrice`, and `order.unitPrice` in `verify/route.ts` and `create-order/route.ts` now use live `product.price` fetched from Firestore instead of the stale `item.price` cart snapshot.

---

### 9.11 — useApiQuery — Module-Level Cache Not Cleared on Sign-Out

**File:** `src/hooks/useApiQuery.ts`

**Bug:** `CacheManager` is a module-level singleton. When a user signs out and a new user signs in (in the same browser session), the cache from the previous user is still warm. The new user briefly sees the prior user's data before the cache expires.

**Fix — clear the cache on sign-out:**

```ts
// In SessionContext or the sign-out handler:
import { CacheManager } from "@/classes";

function signOut() {
  await firebaseSignOut(auth);
  CacheManager.getInstance().clear(); // ← purge prior user's data
}
```

When TanStack Query replaces `useApiQuery`, use `queryClient.clear()` instead.

---

---

## 10. Library Extraction — `@lir/*` Packages

> **Goal:** Extract all non-business, framework/DB/store-agnostic code into standalone, publishable npm packages that any project can consume regardless of stack.  
> **Strategy:** Pnpm workspace monorepo with a `packages/` root. `letitrip.in` becomes one app; library packages are siblings. They can later move to a dedicated repo and be published to npm or a private registry.  
> **Non-breaking Phase 0:** Do NOT move app files until packages are stable. Extract packages in-place, update the app to import from `@lir/*`, then restructure the monorepo.

---

### 10.1 Monorepo Structure

```
letitrip.in/                     ← repo root (becomes monorepo)
├── apps/
│   └── web/                     ← current src/, public/, next.config.js … (moved later)
│       └── functions/           ← Firebase Functions
├── packages/
│   ├── core/                    ← @lir/core   — zero deps
│   ├── react/                   ← @lir/react  — peer: react
│   ├── ui/                      ← @lir/ui     — peer: react, tailwindcss
│   ├── http/                    ← @lir/http   — zero runtime deps
│   └── next/                    ← @lir/next   — peer: next, react
├── pnpm-workspace.yaml
├── turbo.json                   ← Turborepo build orchestration
└── package.json                 ← root workspace scripts
```

---

### 10.2 Package Inventory

#### `@lir/core` — Pure TypeScript utilities

**No runtime dependencies. Works in any JS environment (browser, Node, Deno, edge).**

| Module                     | Source file                                  | Notes                                                                         |
| -------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| `formatters/date`          | `src/utils/formatters/date.formatter.ts`     | Remove Firestore Timestamp overload (move to `@lir/next`)                     |
| `formatters/number`        | `src/utils/formatters/number.formatter.ts`   | Unchanged                                                                     |
| `formatters/string`        | `src/utils/formatters/string.formatter.ts`   | Unchanged                                                                     |
| `validators/email`         | `src/utils/validators/email.validator.ts`    | Unchanged                                                                     |
| `validators/input`         | `src/utils/validators/input.validator.ts`    | Unchanged                                                                     |
| `validators/password`      | `src/utils/validators/password.validator.ts` | Unchanged                                                                     |
| `validators/phone`         | `src/utils/validators/phone.validator.ts`    | Make locale plug-in: `createPhoneValidator(locale)` default `'IN'`            |
| `validators/url`           | `src/utils/validators/url.validator.ts`      | Unchanged                                                                     |
| `converters/type`          | `src/utils/converters/type.converter.ts`     | Unchanged                                                                     |
| `helpers/array`            | `src/helpers/data/array.helper.ts`           | Unchanged                                                                     |
| `helpers/object`           | `src/helpers/data/object.helper.ts`          | Unchanged                                                                     |
| `helpers/pagination`       | `src/helpers/data/pagination.helper.ts`      | Unchanged                                                                     |
| `helpers/sorting`          | `src/helpers/data/sorting.helper.ts`         | Unchanged                                                                     |
| `helpers/color`            | `src/helpers/ui/color.helper.ts`             | Unchanged                                                                     |
| `helpers/animation`        | `src/helpers/ui/animation.helper.ts`         | Unchanged                                                                     |
| `helpers/token`            | `src/helpers/auth/token.helper.ts`           | Keep `uuid` dep; remove Firestore coupling                                    |
| `helpers/filter`           | `src/components/filters/filterUtils.ts`      | Extract `getFilterLabel()` / `getFilterValue()` only                          |
| `classes/CacheManager`     | `src/classes/CacheManager.ts`                | Unchanged                                                                     |
| `classes/EventBus`         | `src/classes/EventBus.ts`                    | Unchanged                                                                     |
| `classes/Logger`           | `src/classes/Logger.ts`                      | Extract file-write path behind optional `ILogWriter` interface                |
| `classes/Queue`            | `src/classes/Queue.ts`                       | Unchanged                                                                     |
| `errors/`                  | `src/lib/errors/*.ts` (all 8 files)          | Remove `nextResponse` dep — move `error-handler` to `@lir/next`               |
| `constants/config`         | `src/constants/config.ts`                    | Generic keys only (TOKEN, PASSWORD, VALIDATION, API, PAGINATION, FILE_UPLOAD) |
| `constants/error-messages` | Subset of `src/constants/error-messages.ts`  | AUTH + VALIDATION + DB sections only                                          |

> **Interaction with §3.1 and §3.6:** Once TanStack Query is adopted, `CacheManager` and `EventBus` are deleted from the app (§8 sub-wave A). They still belong in `@lir/core` as general utilities — the app just stops consuming them.

---

#### `@lir/react` — React hooks & browser utilities

**Peer deps: `react >=18`, `react-dom >=18`.** No Next.js deps. Depends on `@lir/core`.

| Module                    | Source file                                   | Notes                                                                    |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `hooks/useApiMutation`    | `src/hooks/useApiMutation.ts`                 | Unchanged — pure React state machine                                     |
| `hooks/useApiQuery`       | `src/hooks/useApiQuery.ts`                    | Replace `CacheManager` import with `@lir/core`                           |
| `hooks/useBreakpoint`     | `src/hooks/useBreakpoint.ts`                  | Make breakpoints configurable via `createBreakpointHook(config)` factory |
| `hooks/useBulkSelection`  | `src/hooks/useBulkSelection.ts`               | Unchanged                                                                |
| `hooks/useClickOutside`   | `src/hooks/useClickOutside.ts`                | Unchanged                                                                |
| `hooks/useCountdown`      | `src/hooks/useCountdown.ts`                   | Remove Firestore Timestamp overload                                      |
| `hooks/useForm`           | `src/hooks/useForm.ts`                        | Unchanged until deleted by §3.5 migration                                |
| `hooks/useGesture`        | `src/hooks/useGesture.ts`                     | Unchanged                                                                |
| `hooks/useKeyPress`       | `src/hooks/useKeyPress.ts`                    | Unchanged                                                                |
| `hooks/useLongPress`      | `src/hooks/useLongPress.ts`                   | Unchanged                                                                |
| `hooks/useMediaQuery`     | `src/hooks/useMediaQuery.ts`                  | Unchanged                                                                |
| `hooks/usePullToRefresh`  | `src/hooks/usePullToRefresh.ts`               | Unchanged                                                                |
| `hooks/useSwipe`          | `src/hooks/useSwipe.ts`                       | Unchanged                                                                |
| `hooks/useUnsavedChanges` | `src/hooks/useUnsavedChanges.ts`              | Replace `eventBus` import with `@lir/core` EventBus                      |
| `hooks/useCamera`         | `src/hooks/useCamera.ts`                      | Unchanged                                                                |
| `hooks/useMessage`        | `src/hooks/useMessage.ts`                     | Replace `useToast` dep with EventBus-based dispatch                      |
| `utils/EventManager`      | `src/utils/events/event-manager.ts`           | Unchanged                                                                |
| `utils/StorageManager`    | `src/classes/StorageManager.ts`               | Unchanged                                                                |
| `helpers/classNames`      | Extract from `src/helpers/ui/style.helper.ts` | Drop `mergeTailwindClasses` — stays in `@lir/ui`                         |

---

#### `@lir/ui` — React + Tailwind component library

**Peer deps: `react >=18`, `tailwindcss >=3`.** Depends on `@lir/core`, `@lir/react`.

Consumers add the package path to their Tailwind `content` array:

```js
content: ["./node_modules/@lir/ui/src/**/*.{tsx,ts}"];
```

| Category          | Components                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Typography**    | `Heading`, `Text`, `Caption`, `Label`, `Span`, `Subheading`                                                                                                                                                                                                                                                                                                                          |
| **Semantic HTML** | `Section`, `Article`, `Main`, `Aside`, `Nav`, `Header`, `Footer`, `Ul`, `Ol`, `Li`                                                                                                                                                                                                                                                                                                   |
| **Forms**         | `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `Toggle`, `Slider`, `Form`, `FormField`, `PasswordStrengthIndicator`                                                                                                                                                                                                                                                             |
| **UI Primitives** | `Button`, `Badge`, `Card`/`CardHeader`/`CardBody`/`CardFooter`, `Spinner`, `Skeleton`, `Tabs`, `Accordion`, `Tooltip`, `Progress`, `Divider`, `EmptyState`, `Pagination`, `Dropdown`, `Avatar`, `HorizontalScroller`, `SideDrawer`, `StepperNav`, `StatsGrid`, `TablePagination`, `RatingDisplay`, `CountdownDisplay`, `StatusBadge`, `SkipToMain`, `Menu`, `ItemRow`, `SummaryCard` |
| **Feedback**      | `Alert`, `Toast`, `ToastProvider`, `useToast`                                                                                                                                                                                                                                                                                                                                        |
| **Media**         | `MediaImage`\*, `MediaVideo`, `MediaAvatar`, `MediaLightbox`                                                                                                                                                                                                                                                                                                                         |
| **Modals**        | `Modal`, `ConfirmDeleteModal`, `ImageCropModal`, `UnsavedChangesModal`                                                                                                                                                                                                                                                                                                               |
| **Layout shells** | `TitleBar`, `TitleBarLayout`, `Breadcrumbs`, `NavbarLayout`, `BottomNavLayout`, `FooterLayout`, `SidebarLayout`                                                                                                                                                                                                                                                                      |
| **Utility**       | `ResponsiveView`, `BackToTop`, `ErrorBoundary`                                                                                                                                                                                                                                                                                                                                       |
| **Theme**         | `THEME_CONSTANTS` → renamed `UI_THEME`, overridable by consumer                                                                                                                                                                                                                                                                                                                      |

> \*`MediaImage` wraps `next/image`. Accept an `ImageComponent` prop so non-Next.js consumers can swap in a plain `<img>`.  
> `TextLink` wraps Next.js `<Link>` — accept a `LinkComponent` prop for the same reason.

**App-side breaking changes:** `THEME_CONSTANTS` import path changes to `@lir/ui`. All other import paths change per the map in §10.5.

---

#### `@lir/http` — Framework-agnostic HTTP client

**No runtime deps. Works in browser, Node, edge runtimes.** Re-exports error types from `@lir/core`.

| Module           | Source                    | Notes                                                                       |
| ---------------- | ------------------------- | --------------------------------------------------------------------------- |
| `ApiClient`      | `src/lib/api-client.ts`   | Remove `API_ENDPOINTS` reference; consumer passes `baseUrl` via constructor |
| `ApiClientError` | Inline in `api-client.ts` | Extend `AppError` from `@lir/core`                                          |

```ts
// Before (app-coupled singleton)
import { apiClient } from "@/lib/api-client";

// After (generic — instantiated once in apps/web/src/lib/http.ts)
import { ApiClient } from "@lir/http";
export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
});
```

This also fixes §2.6 (the `window.location.origin` crash) — the app-side adapter uses `NEXT_PUBLIC_APP_URL` and never touches `window`.

---

#### `@lir/next` — Next.js adapters

**Peer deps: `next >=14`, `react >=18`, `zod >=3`.** Depends on `@lir/core`, `@lir/http`.

| Module                         | Source                                            | Notes                                                                           |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `api/createApiHandler`         | `src/lib/api/api-handler.ts`                      | Replace inline firebase-admin auth with injected `IAuthVerifier` interface      |
| `api/apiResponse`              | `src/lib/api-response.ts`                         | Unchanged                                                                       |
| `api/errorHandler`             | `src/lib/errors/error-handler.ts`                 | Unchanged                                                                       |
| `api/requestHelpers`           | `src/lib/api/request-helpers.ts`                  | Unchanged                                                                       |
| `api/cacheMiddleware`          | `src/lib/api/cache-middleware.ts`                 | Replace `CacheManager` import with `@lir/core`                                  |
| `security/rateLimit`           | `src/lib/security/rate-limit.ts`                  | Keep `NextRequest` dep; extract sliding-window algorithm to `@lir/core`         |
| `zod/zodErrorMap`              | `src/lib/zod-error-map.ts`                        | Replace app `ERROR_MESSAGES` with `@lir/core` generic subset                    |
| `validation/schemas`           | Generic subset of `src/lib/validation/schemas.ts` | `paginationQuerySchema`, `objectIdSchema`, `urlSchema`, `dateStringSchema` only |
| `formatting/dateWithTimestamp` | New file                                          | `resolveDate()` overload for Firestore Timestamp shape                          |
| `monitoring/errorTracking`     | `src/lib/monitoring/error-tracking.ts`            | Replace Firebase Analytics dep with `IEventTracker` interface; default no-op    |
| `logger/serverLogger`          | `src/lib/server-logger.ts`                        | Unchanged (Node.js `fs` dep is correct here)                                    |

---

### 10.3 Adapter Pattern — Injecting Business Context

Several modules need business context (auth, permissions, app config). The pattern is **constructor/factory injection with typed interfaces** so the library has zero knowledge of Firebase, Resend, or letitrip.in domain logic.

#### `createApiHandler` — Auth injection

```ts
// packages/next/src/api/createApiHandler.ts
export interface IAuthVerifier {
  verify(sessionCookie: string): Promise<{ uid: string; role: string }>;
}

export function createApiHandler(authVerifier: IAuthVerifier, options: ApiHandlerOptions) { ... }

// apps/web/src/lib/api/api-handler.ts  (app-side adapter)
import { createApiHandler } from '@lir/next';
import { firebaseAuthVerifier } from '@/lib/firebase/auth-server';
export const apiHandler = createApiHandler(firebaseAuthVerifier, { ... });
```

#### `Logger` — Write target injection

```ts
export interface ILogWriter {
  write(entry: LogEntry): void;
}

class Logger {
  constructor(private writer?: ILogWriter) {}
  // default: console in browser; localStorage fallback; supplied writer otherwise
}
```

#### `MediaImage` — Image component injection

```ts
interface MediaImageProps {
  ImageComponent?: React.ElementType; // default: next/image when peer dep present
  ...
}
```

---

### 10.4 Extraction Phases

| Phase             | Action                                                                              | Output                         | Prerequisite |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------ | ------------ |
| **L1**            | Bootstrap monorepo: `pnpm-workspace.yaml`, `turbo.json`, per-package `tsup` configs | Workspace skeleton             | —            |
| **L2**            | Extract `@lir/core` — copy sources, strip app imports, write Vitest tests           | `@lir/core` v0.1.0             | L1           |
| **L3**            | Extract `@lir/http` — strip `API_ENDPOINTS`, add `baseUrl` constructor              | `@lir/http` v0.1.0; fixes §2.6 | L2           |
| **L4**            | Extract `@lir/next` — apply `IAuthVerifier` injection                               | `@lir/next` v0.1.0             | L2, L3       |
| **L5**            | Extract `@lir/react` — replace inter-hook imports, decouple `useMessage`            | `@lir/react` v0.1.0            | L2           |
| **L6**            | Extract `@lir/ui` — move `THEME_CONSTANTS` → `UI_THEME`, add `ImageComponent` prop  | `@lir/ui` v0.1.0               | L2, L5       |
| **L7**            | Update all `apps/web` imports to `@lir/*`; run `npx tsc --noEmit` + `npm run build` | Zero regressions               | L2–L6        |
| **L8**            | Configure `changesets`, write per-package `CHANGELOG.md`, publish                   | npm packages                   | L7           |
| **L9** (optional) | Move app to `apps/web/`, move `functions/` inside it                                | Full monorepo layout           | L8           |

> **Integration with §7:** L1 = B1, L2 = B2, L3 = B3, L4 = B4 (run parallel with Stage A). L5 = F2, L6 = F3, L7 = F4 — these must come **after C4** (TanStack Query complete), because extracting hooks before deleting them from the app would package dead code. L8 = H7, L9 = H8 (optional).

---

### 10.5 Import Migration Map

After full extraction, `apps/web` imports change as follows:

| Old `@/` import                                               | New `@lir/*` import                               |
| ------------------------------------------------------------- | ------------------------------------------------- |
| `@/utils/formatters/*`                                        | `@lir/core`                                       |
| `@/utils/validators/*`                                        | `@lir/core`                                       |
| `@/utils/converters/type.converter`                           | `@lir/core`                                       |
| `@/helpers/data/array.helper`                                 | `@lir/core`                                       |
| `@/helpers/data/object.helper`                                | `@lir/core`                                       |
| `@/helpers/data/pagination.helper`                            | `@lir/core`                                       |
| `@/helpers/data/sorting.helper`                               | `@lir/core`                                       |
| `@/helpers/ui/color.helper`                                   | `@lir/core`                                       |
| `@/helpers/ui/animation.helper`                               | `@lir/core`                                       |
| `@/helpers/auth/token.helper`                                 | `@lir/core`                                       |
| `@/classes/CacheManager`                                      | `@lir/core`                                       |
| `@/classes/EventBus`                                          | `@lir/core`                                       |
| `@/classes/Logger`                                            | `@lir/core`                                       |
| `@/classes/Queue`                                             | `@lir/core`                                       |
| `@/lib/errors/*`                                              | `@lir/core`                                       |
| `@/lib/api-client`                                            | `@lir/http` (via local `src/lib/http.ts` adapter) |
| `@/lib/api-response`                                          | `@lir/next`                                       |
| `@/lib/api/api-handler`                                       | `@lir/next` (via local assembled adapter)         |
| `@/lib/api/request-helpers`                                   | `@lir/next`                                       |
| `@/lib/api/cache-middleware`                                  | `@lir/next`                                       |
| `@/lib/security/rate-limit`                                   | `@lir/next`                                       |
| `@/lib/server-logger`                                         | `@lir/next`                                       |
| `@/hooks/useApiMutation`                                      | `@lir/react`                                      |
| `@/hooks/useApiQuery`                                         | `@lir/react`                                      |
| `@/hooks/useBreakpoint`                                       | `@lir/react`                                      |
| `@/hooks/useBulkSelection`                                    | `@lir/react`                                      |
| `@/hooks/useClickOutside`                                     | `@lir/react`                                      |
| `@/hooks/useCountdown`                                        | `@lir/react`                                      |
| `@/hooks/useGesture`                                          | `@lir/react`                                      |
| `@/hooks/useKeyPress`                                         | `@lir/react`                                      |
| `@/hooks/useLongPress`                                        | `@lir/react`                                      |
| `@/hooks/useMediaQuery`                                       | `@lir/react`                                      |
| `@/hooks/usePullToRefresh`                                    | `@lir/react`                                      |
| `@/hooks/useSwipe`                                            | `@lir/react`                                      |
| `@/hooks/useUnsavedChanges`                                   | `@lir/react`                                      |
| `@/hooks/useCamera`                                           | `@lir/react`                                      |
| `@/hooks/useMessage`                                          | `@lir/react`                                      |
| `@/components/ui/*`                                           | `@lir/ui`                                         |
| `@/components/typography/*`                                   | `@lir/ui`                                         |
| `@/components/forms/*`                                        | `@lir/ui`                                         |
| `@/components/feedback/*`                                     | `@lir/ui`                                         |
| `@/components/semantic/*`                                     | `@lir/ui`                                         |
| `@/components/media/*`                                        | `@lir/ui`                                         |
| `@/components/modals/*`                                       | `@lir/ui`                                         |
| `@/components/layout/TitleBar*`, `Breadcrumbs`, layout shells | `@lir/ui`                                         |
| `@/constants/theme` (`THEME_CONSTANTS`)                       | `@lir/ui`                                         |

---

### 10.6 Build & Publishing Setup

**`packages/core/package.json`** (representative — same pattern for all packages):

```json
{
  "name": "@lir/core",
  "version": "0.1.0",
  "description": "Framework-agnostic TypeScript utilities — formatters, validators, helpers, error classes",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs",
      "types": "./dist/types/index.d.ts"
    }
  },
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "test": "vitest run",
    "lint": "eslint src"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": { "uuid": "^9.0.0" }
}
```

**`turbo.json`:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"] },
    "lint": {}
  }
}
```

**`pnpm-workspace.yaml`:**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

### 10.7 Exclusion List — What Stays in letitrip.in

| File / Module                              | Reason                                                                                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/id-generators.ts`               | letitrip-specific ID schemes                                                                                                                                                        |
| `src/utils/guest-cart.ts`                  | Cart domain + app-specific storage keys                                                                                                                                             |
| `src/helpers/auth/auth.helper.ts`          | Hardcodes `admin@letitrip.in`; ROLE_HIERARCHY is app-specific                                                                                                                       |
| `src/helpers/validation/address.helper.ts` | India-specific validation; tied to app `ERROR_MESSAGES`                                                                                                                             |
| `src/helpers/logging/error-logger.ts`      | Thin wrapper around app's `Logger`                                                                                                                                                  |
| `src/helpers/data/sieve.helper.ts`         | `mohasinac/sievejs` + `node:url` dep; keep until a generic adapter is designed                                                                                                      |
| `src/lib/firebase/`                        | Firebase infrastructure — app-specific                                                                                                                                              |
| `src/lib/tokens.ts`                        | Stores tokens in Firestore                                                                                                                                                          |
| `src/lib/email.ts`                         | Resend; app-specific templates                                                                                                                                                      |
| `src/lib/payment/`                         | Razorpay; business logic                                                                                                                                                            |
| `src/lib/search/`                          | Algolia; app-specific index structure                                                                                                                                               |
| `src/lib/shiprocket/`                      | Shiprocket; business logic                                                                                                                                                          |
| `src/lib/monitoring/analytics.ts`          | Firebase Analytics; app-specific events                                                                                                                                             |
| `src/lib/monitoring/performance.ts`        | Firebase Performance; app-specific                                                                                                                                                  |
| `src/lib/monitoring/cache-metrics.ts`      | `trackEvent()` dep — Firebase                                                                                                                                                       |
| `src/lib/security/authorization.ts`        | Firebase Admin + `userRepository`                                                                                                                                                   |
| `src/lib/helpers/category-metrics.ts`      | Firestore batch writes; app domain                                                                                                                                                  |
| `src/lib/adapters/schema.adapter.ts`       | Firestore → UI type mapping; app domain                                                                                                                                             |
| `src/constants/routes.ts`                  | App-specific page routes                                                                                                                                                            |
| `src/constants/api-endpoints.ts`           | App-specific API paths                                                                                                                                                              |
| `src/constants/rbac.ts`                    | App-specific roles & permissions                                                                                                                                                    |
| `src/constants/site.ts`                    | Brand identity                                                                                                                                                                      |
| `src/constants/navigation.tsx`             | App-specific nav tree                                                                                                                                                               |
| Business components                        | `PriceDisplay`, `RoleBadge`, `BulkActionBar`, `AvatarDisplay`, `AvatarUpload`, `BlogCard`, `EventCard`, `StoreCard`, `ReviewCard`, `Search`, `MainNavbar`, `BottomNavbar`, `Footer` |
| All `src/features/`                        | Business feature modules                                                                                                                                                            |
| All `src/repositories/`                    | Firestore repositories                                                                                                                                                              |
| All `src/services/`                        | Business services                                                                                                                                                                   |
| `src/contexts/`                            | App-level React context (auth, theme, permissions)                                                                                                                                  |
| All `src/app/`                             | Next.js pages and API routes                                                                                                                                                        |
| `functions/`                               | Firebase Functions                                                                                                                                                                  |

---

_Last updated: 2026-03-09 — full codebase audit pass + library extraction plan merged from `LIBRARY_PLAN.md`. Findings: all P0 security issues and known bugs remain open; TanStack Query and react-hook-form not yet installed; 24 `"use client"` pages unchanged; `sitemap.ts` and `robots.ts` already exist (Phase 7 partially done); 14 admin filter components and `RichTextEditor` migrated to feature module (§6.2, §8 updated); `docs/TECH_DEBT.md` referenced in `next.config.js` but does not exist; `verifyPaymentSignature` uses `===` on two separate HMAC functions in `src/lib/payment/razorpay.ts` (lines 105 and 132); §9.10 payment verify has a Razorpay cross-check that prevents explicit order-amount manipulation but does not prevent stale-price undercharges — fix must be in the create-order route; `docs/LIBRARY_PLAN.md` deleted — content merged here as §10._
