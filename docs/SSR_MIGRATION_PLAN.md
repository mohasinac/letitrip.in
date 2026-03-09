# SSR Migration Plan — LetItRip.in

> **Goal:** Maximise server-rendered HTML for SEO-critical public pages while preserving real-time and interactive functionality.  
> **Approach:** Server Shell + Client Islands pattern. Not a full rewrite — surgical splits.  
> **Target:** ~60% of public page weight becomes SSR HTML, eliminating blank-page client fetches on Google-indexed routes.

---

## Current State Diagnosis

| Category                  | Count | `"use client"`         | Notes                        |
| ------------------------- | ----- | ---------------------- | ---------------------------- |
| Pages (`app/**/page.tsx`) | ~55   | 24 have `"use client"` | 31 already server components |
| Feature views             | ~60   | ~55                    | All use `useApiQuery`        |
| Shared components         | ~80   | ~75                    | Interactive by design        |
| Hooks                     | ~70   | ~25                    | Data-fetching ones           |

**Root blockers preventing SSR on public pages:**

1. `useApiQuery` + `useApiMutation` — `useState`/`useEffect` → forces client
2. `apiClient.buildURL` uses `window.location.origin` → crashes on server
3. `SessionContext` uses `onAuthStateChanged` → browser-only Firebase listener
4. All page-level data is fetched client-side via hooks, not passed as props

**What is already correct:**

- All repositories use Admin SDK (server-only) ✅
- `app/[locale]/layout.tsx` is a server component ✅
- `app/[locale]/page.tsx` (homepage) is a server component ✅
- FAQs, Stores, Search, Reviews pages are already server components ✅
- `generateMetadata` exists on many pages ✅

---

## Phases Overview

| Phase                                                       | Scope                                                    | SEO Impact          | Effort |
| ----------------------------------------------------------- | -------------------------------------------------------- | ------------------- | ------ |
| [Phase 0](#phase-0--fix-apiclient-for-server-use)           | Fix `apiClient` for server context                       | Unblocks everything | Low    |
| [Phase 1](#phase-1--public-content-pages-highest-seo-value) | Blog, Products, Events, Sellers, Promotions, Profiles    | Very High           | Medium |
| [Phase 2](#phase-2--homepage-sections)                      | Homepage sections                                        | High                | Medium |
| [Phase 3](#phase-3--listing-pages-with-filter-state)        | Categories, Search, Stores, Reviews                      | High                | Medium |
| [Phase 4](#phase-4--auth-session-modernisation)             | Replace `onAuthStateChanged` with cookie-based session   | High (perf)         | High   |
| [Phase 5](#phase-5--real-time-client-islands-sse-migration) | Auctions/Chat/Payment via SSE instead of RTDB client SDK | Medium              | High   |
| [Phase 6](#phase-6--static-pages)                           | FAQs, Contact, About, Terms, Privacy                     | Low (already fast)  | Low    |
| [Phase 7](#phase-7--seo-infrastructure)                     | Sitemap, `generateMetadata`, JSON-LD, `robots.txt`       | Very High           | Medium |

---

## Phase 0 — Fix apiClient for Server Use

**Why first:** Every other phase depends on being able to call services from server components. `apiClient.buildURL` uses `window.location.origin`, which crashes on the server.

### File: `src/lib/api-client.ts`

**Problem:** Line 81 — `new URL(endpoint, window.location.origin)`

**Fix:** Replace `window.location.origin` with an absolute base URL from env:

```ts
// Before
const url = new URL(endpoint, window.location.origin);

// After
const origin =
  typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
const url = new URL(endpoint, origin);
```

**Also add to `.env.local` and Vercel env:**

```
NEXT_PUBLIC_APP_URL=https://letitrip.in
```

**Impacted files:**

- `src/lib/api-client.ts` — 1 line change

**Note:** For server components you will NOT call `apiClient` at all — you call repositories directly. This fix is only needed so `apiClient` doesn't crash if accidentally imported in a shared module during server render.

---

## Phase 1 — Public Content Pages (Highest SEO Value)

These are the most Google-indexed pages. Making them SSR means Google gets full HTML instead of a blank `<div>`.

### 1.1 — Blog Post Page

**Route:** `/blog/[slug]`

**Current flow:**

```
page.tsx ("use client") → BlogPostView ("use client") → useApiQuery → /api/blog/[slug]
```

**Target flow:**

```
page.tsx (server, async)
  → blogRepository.getBySlug(slug)        ← direct repo call
  → <BlogPostContent post={post} />       ← pure render, no hooks
  → <RelatedPostsClient />                ← client island (useApiQuery ok here)
```

**Files to change:**

| File                                            | Change                                                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/blog/[slug]/page.tsx`         | Remove `"use client"`, make `async`, call `blogRepository` directly, add `generateMetadata` with real post title/description |
| `src/features/blog/components/BlogPostView.tsx` | Split into `BlogPostContent` (server, receives `post` prop) + keep as client wrapper for pages that need client fetch        |
| `src/features/blog/index.ts`                    | Export `BlogPostContent`                                                                                                     |

**New page shape:**

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

---

### 1.2 — Blog Listing Page

**Route:** `/blog`

**Current flow:** `page.tsx ("use client")` → `BlogListView` → `useApiQuery`

**Target:** Server renders first page of posts. Pagination/filtering stays client-side.

**Files to change:**

| File                                            | Change                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/blog/page.tsx`                | Remove `"use client"`, make `async`, fetch first page server-side, pass `initialData` to `BlogListView` |
| `src/features/blog/components/BlogListView.tsx` | Accept optional `initialData` prop; when present skip initial `useApiQuery` fetch                       |

---

### 1.3 — Product Detail Page

**Route:** `/products/[slug]`

**Current flow:** `page.tsx ("use client")` → `ProductDetailView` → `useApiQuery`

**Target:** Server fetches product. `ProductActions` (add to cart, wishlist) stays client island.

**Files to change:**

| File                                                       | Change                                                                                                                                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/products/[slug]/page.tsx`                | Remove `"use client"`, make `async`, call `productRepository.getBySlug(slug)`, add `generateMetadata` with product title/description/OG image |
| `src/features/products/components/ProductDetailView.tsx`   | Accept `product: ProductDocument` prop OR `slug` for client-side re-fetch. Remove top-level `useApiQuery`.                                    |
| `src/features/products/components/ProductInfo.tsx`         | Already pure render — no change needed                                                                                                        |
| `src/features/products/components/ProductImageGallery.tsx` | Already pure render — no change needed (`"use client"` is fine, it's interactive)                                                             |
| `src/features/products/components/ProductActions.tsx`      | Keep `"use client"` — uses `useAuth`, `useAddToCart`, `useWishlistToggle`                                                                     |
| `src/features/products/components/ProductReviews.tsx`      | Can stay `"use client"` for pagination, OR pass initial reviews as prop                                                                       |

**New page shape:**

```tsx
// src/app/[locale]/products/[slug]/page.tsx
import { productRepository } from "@/repositories";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/features/products";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.getBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description?.substring(0, 160),
    openGraph: { images: product.images?.[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await productRepository.getBySlug(slug);
  if (!product) notFound();
  return <ProductDetailView product={product} />;
}
```

---

### 1.4 — Events Listing + Detail Pages

**Routes:** `/events`, `/events/[id]`

**Current:** Both `"use client"`. Events page uses `usePublicEvents` + `useUrlTable`. Event detail page uses `useApiQuery` directly in the page file.

**Target for `/events/[id]`:** Server fetches event data server-side. Voting/survey sections stay client islands.

**Target for `/events`:** Server fetches first page of events. Filters/pagination stay client.

**Files to change:**

| File                                                    | Change                                                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/app/[locale]/events/[id]/page.tsx`                 | Remove `"use client"`, make `async`, call `eventRepository.getById(id)`, add `generateMetadata` |
| `src/app/[locale]/events/page.tsx`                      | Remove `"use client"`, make `async`, pass `initialData` to `EventsListView`                     |
| `src/features/events/components/EventsListView.tsx`     | Accept `initialData` prop                                                                       |
| `src/features/events/components/PollVotingSection.tsx`  | Keep `"use client"` — interactive                                                               |
| `src/features/events/components/SurveyEventSection.tsx` | Keep `"use client"` — interactive                                                               |

---

### 1.5 — Seller Storefront Page

**Route:** `/sellers/[id]`

**Current:** Page uses `useParams()` + `useSellerStorefront()` + `useTranslations()` directly — violates thin-page rule.

**Target:** Server fetches seller + initial products. Reviews/products grid stays client for pagination.

**Files to change:**

| File                                                      | Change                                                                                                                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/sellers/[id]/page.tsx`                  | Remove `"use client"`, make `async`, use `params.id` (not `useParams`), call `storeRepository` + `userRepository`, add `generateMetadata` with seller name/description |
| `src/features/seller/components/SellerStorefrontView.tsx` | Accept `initialSeller` + `initialProducts` props; skip initial fetch when present                                                                                      |

---

### 1.6 — Public Profile Page

**Route:** `/profile/[userId]`

**Current:** Page uses `useParams()` and all data-fetching — same anti-pattern as seller page.

**Files to change:**

| File                                                 | Change                                                                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/profile/[userId]/page.tsx`         | Remove `"use client"`, make `async`, use `params.userId`, call `userRepository.getById`, add `generateMetadata` |
| `src/features/user/components/PublicProfileView.tsx` | Accept `initialUser` prop                                                                                       |

---

### 1.7 — Promotions Page

**Route:** `/promotions`

**Current:** `"use client"` → `usePromotions` hook → `useApiQuery`.

**Target:** Server fetches active coupons and promoted products.

**Files to change:**

| File                                                              | Change                                                                                                               |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/promotions/page.tsx`                            | Remove `"use client"`, make `async`, call `couponsRepository` + `productRepository` directly, add `generateMetadata` |
| `src/features/promotions/components/CouponCard.tsx`               | Keep `"use client"` — has clipboard copy `useState`                                                                  |
| Create `src/features/promotions/components/PromotionsContent.tsx` | Pure server-renderable wrapper that receives data as props                                                           |

---

## Phase 2 — Homepage Sections

**Route:** `/` (already a server component page — extend it)

The homepage `page.tsx` is already a server component, but every section it renders is `"use client"` with `useApiQuery`. Fix: pass data as props from the page.

### Pattern for all homepage sections:

```tsx
// page.tsx (already server) — extend with data fetching
const [categories, featuredProducts, welcomeSection] = await Promise.all([
  categoryRepository.getTopCategories(12),
  productRepository.getFeatured(8),
  homepageSectionsRepository.getByType("welcome"),
]);

return (
  <>
    <HeroCarousel />
    <WelcomeSection data={welcomeSection} />
    <TopCategoriesSection categories={categories} />
    <FeaturedProductsSection products={featuredProducts} />
    ...
  </>
);
```

**Files to change:**

| File                                                           | Change                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/app/[locale]/page.tsx`                                    | Add `async`, parallel-fetch all section data, pass as props           |
| `src/features/homepage/components/WelcomeSection.tsx`          | Accept `data` prop; remove `useHomepageSections` when prop present    |
| `src/features/homepage/components/TopCategoriesSection.tsx`    | Accept `categories` prop; remove `useTopCategories` when prop present |
| `src/features/homepage/components/FeaturedProductsSection.tsx` | Accept `products` prop                                                |
| `src/features/homepage/components/FeaturedAuctionsSection.tsx` | Accept `auctions` prop                                                |
| `src/features/homepage/components/FeaturedEventsSection.tsx`   | Accept `events` prop                                                  |
| `src/features/homepage/components/TopBrandsSection.tsx`        | Accept `brands` prop                                                  |
| `src/features/homepage/components/BlogArticlesSection.tsx`     | Accept `posts` prop                                                   |
| `src/features/homepage/components/FAQSection.tsx`              | Accept `faqs` prop                                                    |
| `src/features/homepage/components/HeroCarousel.tsx`            | Accept `slides` prop; remove `useHeroCarousel`                        |
| `src/features/homepage/components/TrustFeaturesSection.tsx`    | Static content — remove `"use client"` entirely                       |
| `src/features/homepage/components/SiteFeaturesSection.tsx`     | Static content — remove `"use client"` entirely                       |
| `src/features/homepage/components/HowItWorksSection.tsx`       | Static content — remove `"use client"` entirely                       |
| `src/features/homepage/components/StatsCounterSection.tsx`     | Keep `"use client"` — has animated counter                            |

**Important:** Keep each section's internal `"use client"` path functional as a fallback (when prop is not passed). This preserves backward compatibility for any other place these sections are rendered.

---

## Phase 3 — Listing Pages with Filter State

These pages have URL-driven filters (`useUrlTable` → `useSearchParams`) which require client components for the interactive filter UI. The pattern is: **server fetches initial data, client handles subsequent navigation**.

### Pattern: `initialData` prop + `Suspense` boundary

```tsx
// Server page
export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialData = await productRepository.list({
    page: 1,
    search: params.search as string,
    categoryId: params.category as string,
  });
  return (
    <Suspense fallback={<ProductsListSkeleton />}>
      <ProductsView initialData={initialData} />
    </Suspense>
  );
}
```

**Files to change:**

| Page / Route  | File                                                        | Change                                                    |
| ------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| `/categories` | `src/app/[locale]/categories/page.tsx`                      | Already server — add initial data fetch                   |
| `/categories` | `src/features/categories/components/CategoriesListView.tsx` | Accept `initialData` prop                                 |
| `/stores`     | `src/features/stores/components/StoresListView.tsx`         | Accept `initialData` prop                                 |
| `/reviews`    | `src/features/reviews/components/ReviewsListView.tsx`       | Accept `initialData` prop                                 |
| `/search`     | `src/features/search/components/SearchView.tsx`             | Accept `initialQuery` + `initialData` from `searchParams` |
| `/products`   | `src/app/[locale]/products/page.tsx` (if exists)            | Make async, pass initial product list                     |
| `/auctions`   | `src/app/[locale]/auctions/page.tsx` (if exists)            | Make async, pass initial auctions list                    |

---

## Phase 4 — Auth Session Modernisation

**Goal:** Remove `onAuthStateChanged` dependency so `SessionContext` can read initial user state from cookies on the server, reducing the client-side waterfall.

### Current flow:

```
Page loads → JS hydrates → onAuthStateChanged fires → user state available → auth-gated UI shows
(~300-800ms delay before user sees auth-sensitive UI)
```

### Target flow:

```
Server reads __session_id cookie → validates session → passes SerializedUser to layout →
SessionProvider initialised with user immediately on hydration (0ms delay)
```

### Step-by-step:

**Step 1 — Server reads session in layout:**

```tsx
// src/app/[locale]/layout.tsx (already async server component)
import { cookies } from "next/headers";
import { sessionRepository } from "@/repositories";

const cookieStore = await cookies();
const sessionId = cookieStore.get("__session_id")?.value ?? null;
const initialUser = sessionId
  ? await sessionRepository.getSessionUser(sessionId).catch(() => null)
  : null;
```

**Step 2 — Pass to `SessionProvider`:**

```tsx
<SessionProvider initialUser={initialUser}>{children}</SessionProvider>
```

**Step 3 — Modify `SessionContext`:**

```tsx
// Accept initialUser prop — skip loading state, skip first onAuthStateChanged wait
export function SessionProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: SessionUser | null;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser ?? null);
  const [loading, setLoading] = useState(initialUser === undefined); // false if server provided user
  // ... rest of context: onAuthStateChanged still runs to keep state fresh after login/logout
}
```

**Files to change:**

| File                                     | Change                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/app/[locale]/layout.tsx`            | Read `__session_id` cookie, call `sessionRepository.getSessionUser`, pass `initialUser` to `SessionProvider` |
| `src/contexts/SessionContext.tsx`        | Add `initialUser` prop, initialise `useState` with it, set `loading: false` when `initialUser` provided      |
| `src/repositories/session.repository.ts` | Add `getSessionUser(sessionId): Promise<SessionUser \| null>` method if it doesn't exist                     |

**What this achieves:** Auth-gated UI (cart count, notification bell, avatar) renders in the correct state immediately on hydration instead of flashing unauthenticated state first.

**OAuth popup → redirect (optional but recommended):**

Replace the `window.open()` + RTDB auth bridge with standard redirect OAuth:

| File                                           | Change                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/hooks/useAuth.ts`                         | Replace `window.open()` popup logic with `router.push("/api/auth/google/start")`       |
| `src/app/api/auth/google/callback/route.ts`    | After setting session cookie, `redirect()` to original page instead of writing to RTDB |
| `src/hooks/useAuthEvent.ts`                    | Can be deleted after redirect OAuth is in place                                        |
| `src/app/[locale]/auth/oauth-loading/page.tsx` | Can be deleted                                                                         |
| `public/auth.html`                             | Can be deleted                                                                         |

---

## Phase 5 — Real-Time Client Islands (SSE Migration)

**Goal:** Remove Firebase client RTDB SDK from auction and chat components. Replace with SSE endpoints that relay RTDB data from the server via Admin SDK.

### 5.1 — Live Auction Bids (SSE)

**New API route:** `GET /api/auctions/[productId]/stream`

```ts
// src/app/api/auctions/[productId]/stream/route.ts
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } },
) {
  const { productId } = await params;
  const db = getAdminRealtimeDb();
  const bidRef = db.ref(`/auction-bids/${productId}`);

  const stream = new ReadableStream({
    start(controller) {
      bidRef.on("value", (snap) => {
        controller.enqueue(`data: ${JSON.stringify(snap.val())}\n\n`);
      });
      req.signal.addEventListener("abort", () => {
        bidRef.off("value");
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

**New hook:** `useAuctionStream` (replaces `useRealtimeBids`)

```ts
// src/hooks/useAuctionStream.ts
"use client";
export function useAuctionStream(productId: string | null) {
  const [data, setData] = useState<RealtimeBidData | null>(null);
  useEffect(() => {
    if (!productId) return;
    const source = new EventSource(`/api/auctions/${productId}/stream`);
    source.onmessage = (e) => setData(JSON.parse(e.data));
    return () => source.close();
  }, [productId]);
  return data;
}
```

**Files to change:**

| File                                                      | Change                                            |
| --------------------------------------------------------- | ------------------------------------------------- |
| Create `src/app/api/auctions/[productId]/stream/route.ts` | New SSE endpoint                                  |
| Create `src/hooks/useAuctionStream.ts`                    | New hook using `EventSource`                      |
| `src/features/products/components/AuctionDetailView.tsx`  | Replace `useRealtimeBids` with `useAuctionStream` |
| `src/hooks/useRealtimeBids.ts`                            | Can be deleted after migration                    |

### 5.2 — Chat Messages (SSE)

**New API route:** `GET /api/chat/[chatId]/stream`

Similar SSE pattern. Server uses Admin SDK to subscribe to `/chat/{chatId}/messages`. Client uses `EventSource`. The existing `POST /api/chat/[chatId]/messages` (server-side write) stays unchanged.

**Benefit:** Eliminates `signInWithCustomToken` in `useChat` and the entire `realtimeApp` secondary Firebase app instance for chat.

**Files to change:**

| File                                               | Change                                                    |
| -------------------------------------------------- | --------------------------------------------------------- |
| Create `src/app/api/chat/[chatId]/stream/route.ts` | New SSE endpoint (auth-gated, verify user is participant) |
| `src/hooks/useChat.ts`                             | Replace RTDB subscription with `EventSource`              |
| `src/lib/firebase/realtime.ts`                     | `realtimeApp` / `chatRealtimeDb` may no longer be needed  |

### 5.3 — Payment Event (Simple Polling)

The RTDB payment bridge is over-engineered for its use case. After Razorpay `handler` fires, just poll your own order status endpoint.

**Files to change:**

| File                                            | Change                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/hooks/usePaymentEvent.ts`                  | Replace RTDB subscription with polling `GET /api/orders/pending` every 2s, max 60s |
| `src/features/cart/components/CheckoutView.tsx` | No interface change — `usePaymentEvent` API stays the same                         |
| `src/app/api/payment/event/init/route.ts`       | Can be deleted after migration                                                     |

---

## Phase 6 — Static Pages (Low Effort, Already Fast)

These pages have minimal or no data fetching. Most work needed is adding `generateMetadata`.

| Route            | Current State     | Action                                                                                         |
| ---------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `/about`         | Server ✅         | Add `generateMetadata` with real content                                                       |
| `/terms`         | Server ✅         | Has `generateMetadata` ✅                                                                      |
| `/privacy`       | Server ✅         | Has `generateMetadata` ✅                                                                      |
| `/refund-policy` | Server ✅         | Has `generateMetadata` ✅                                                                      |
| `/cookies`       | Server ✅         | Has `generateMetadata` ✅                                                                      |
| `/help`          | Server ✅         | Has `generateMetadata` ✅                                                                      |
| `/contact`       | `"use client"` ⚠️ | Page header is static — split `ContactInfoSidebar` (server) from `ContactForm` (client island) |
| `/faqs`          | Server ✅         | FAQ data fetched server-side via `FAQPageContent`, has `generateMetadata` ✅                   |
| `/seller-guide`  | Server ✅         | Has `generateMetadata` ✅                                                                      |

**Files to change for `/contact`:**

| File                                                     | Change                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/app/[locale]/contact/page.tsx`                      | Remove `"use client"` — page header is static, `ContactForm` is already a client component |
| `src/features/contact/components/ContactInfoSidebar.tsx` | Remove `"use client"` if it has no interactive hooks                                       |

---

## Phase 7 — SEO Infrastructure

These are independent of the SSR migration but have the highest SEO multiplier effect.

### 7.1 — Dynamic Sitemap

**Create:** `src/app/sitemap.ts`

```ts
// src/app/sitemap.ts
import { MetadataRoute } from "next";
import {
  productRepository,
  blogRepository,
  categoryRepository,
  eventRepository,
} from "@/repositories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, categories, events] = await Promise.all([
    productRepository.list({ page: 1, limit: 5000, isActive: true }),
    blogRepository.list({ page: 1, limit: 1000 }),
    categoryRepository.getAll(),
    eventRepository.list({ page: 1, limit: 500 }),
  ]);

  const productUrls = products.items.map((p) => ({
    url: `https://letitrip.in/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const blogUrls = posts.items.map((p) => ({
    url: `https://letitrip.in/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // ... categories, events, static pages

  return [
    ...staticPages,
    ...productUrls,
    ...blogUrls,
    ...categoryUrls,
    ...eventUrls,
  ];
}
```

### 7.2 — `robots.txt`

**Create:** `src/app/robots.ts`

```ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/user/",
          "/seller/",
          "/checkout/",
          "/cart/",
        ],
      },
    ],
    sitemap: "https://letitrip.in/sitemap.xml",
  };
}
```

### 7.3 — JSON-LD Structured Data

Add to SSR pages that benefit most:

**Product pages** — `Product` schema (price, availability, reviews):

```tsx
// In ProductDetailPage (server component)
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.images,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "INR",
        availability: product.stock > 0 ? "InStock" : "OutOfStock",
      },
    }),
  }}
/>
```

**Blog posts** — `Article` schema (author, publishDate, image):

**Events** — `Event` schema (date, location, organizer):

**FAQ page** — `FAQPage` schema (already Google-visible, add structured data):

### 7.4 — `generateMetadata` Audit

Pages that currently have `"use client"` and therefore **cannot** export `generateMetadata` (client components can't export metadata):

| Page                | Missing metadata                     | Priority |
| ------------------- | ------------------------------------ | -------- |
| `/products/[slug]`  | title, description, OG image         | Critical |
| `/blog/[slug]`      | title, description, OG image, author | Critical |
| `/events/[id]`      | title, description, event date       | High     |
| `/sellers/[id]`     | seller name, description             | High     |
| `/profile/[userId]` | user display name                    | Medium   |
| `/promotions`       | page title, description              | Medium   |
| `/blog`             | page title                           | Medium   |
| `/events`           | page title                           | Medium   |
| `/contact`          | page title                           | Low      |

**Note:** `generateMetadata` can only be exported from server components. Every Phase 1 change above enables the corresponding metadata.

### 7.5 — `generateStaticParams` for High-Traffic Routes

Pre-render the most-visited product/blog URLs at build time:

```ts
// In products/[slug]/page.tsx
export async function generateStaticParams() {
  const { items } = await productRepository.list({
    page: 1,
    limit: 200,
    isActive: true,
    sortBy: "popularity",
  });
  return items.map((p) => ({ slug: p.slug }));
}
```

Similarly for blog posts. Less-visited slugs still SSR on demand.

---

## Implementation Order (Recommended)

```
Week 1: Phase 0 (apiClient fix) + Phase 7.2 (robots.txt) + Phase 7.1 (sitemap stub)
Week 2: Phase 1.3 (Product Detail) — highest SEO value single page
Week 3: Phase 1.1 + 1.2 (Blog post + listing)
Week 4: Phase 7.3 (JSON-LD on products + blog)
Week 5: Phase 1.4 (Events) + Phase 1.5 (Seller storefront)
Week 6: Phase 2 (Homepage sections)
Week 7: Phase 1.6 (Public profile) + Phase 1.7 (Promotions)
Week 8: Phase 4 (Session modernisation — initialUser in layout)
Week 9: Phase 3 (Listing pages initialData pattern)
Week 10+: Phase 5 (SSE migration — lowest urgency, highest effort)
```

---

## What Will NOT Become SSR (and Why)

| Feature                 | Reason                                            | Keep as-is                                  |
| ----------------------- | ------------------------------------------------- | ------------------------------------------- |
| Cart + Checkout         | Auth-gated + Razorpay modal + payment RTDB bridge | ✅                                          |
| Admin dashboard         | Fully auth-gated, no SEO value                    | ✅                                          |
| User profile (private)  | Auth-gated                                        | ✅                                          |
| Login / Register        | Form-only, no SEO value                           | ✅                                          |
| Seller dashboard        | Auth-gated                                        | ✅                                          |
| Chat (`/user/messages`) | RTDB real-time, auth-gated                        | ✅                                          |
| Auction bidding UI      | Real-time RTDB                                    | ✅ (Phase 5 SSE replaces SDK, still client) |
| Order tracking          | Auth-gated                                        | ✅                                          |
| Notifications           | Auth-gated, real-time                             | ✅                                          |

---

## Key Rules to Follow During Migration

1. **Never call `apiClient` from a server component** — call repositories directly instead
2. **Never import from `@/lib/firebase/auth-helpers` or `@/lib/firebase/config` in server components** — those are client-only files
3. **Always use `getTranslations` (server) not `useTranslations` (client) in async server components**
4. **Pass data as props to client islands** — client components receive `initialData` and fall back to `useApiQuery` only if the prop is absent
5. **Run `npx tsc --noEmit` then `npm run build` after each phase** before moving on
6. **Do not delete the client-side data-fetching path** until the SSR path is verified in production — keep both working

---

## Expected SEO Outcomes

| Metric                                    | Before                | After Phases 1+7              |
| ----------------------------------------- | --------------------- | ----------------------------- |
| Google-crawlable product pages            | 0% (JS required)      | 100% (static HTML)            |
| Time to first byte (TTFB) on product page | ~800ms (client fetch) | ~150ms (server render)        |
| `generateMetadata` coverage               | ~40% of pages         | ~90% of pages                 |
| Sitemap coverage                          | None                  | All products/blog/events      |
| JSON-LD coverage                          | None                  | Products, Blog, Events, FAQs  |
| Core Web Vitals (LCP on product page)     | Poor (waiting for JS) | Good (HTML in first response) |
