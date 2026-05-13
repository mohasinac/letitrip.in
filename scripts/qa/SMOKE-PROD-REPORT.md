# LetItRip prod smoke report — 2026-05-13

Target: `https://www.letitrip.in` (Vercel deploy `letitrip-ebd8m7fes`)
Suites: `npm run test:smoke` + `npm run test:pw`
Seed: live prod Firestore (admin / seller / buyer accounts from `appkit/src/seed/users-seed-data.ts`)

## Summary

| Suite | Pass | Fail | Total | % |
|------|-----:|----:|-----:|---:|
| HTTP `smoke-prod` | 135 | 24 | 159 | 84.9 |
| Playwright `smoke-pw` | 136 | 4 | 140 | 97.1 |
| **Total** | **271** | **28** | **299** | **90.6** |

End-to-end COD checkout (login → address → cart → preflight → consent OTP bypass → place order → verify in `/api/user/orders` → SA cleanup) passes 9/9 against live prod.

All Playwright dashboards (9 seller + 12 admin) load with auth and render content. Public listing pages all 200, all have h1/main/header/footer.

---

## Severity 1 — broken endpoints (return 500)

These are server-side crashes. UI calls hitting them show a generic "Internal Server Error" toast in the toaster (since the route-handler-status-code fix is in place, the API does serialize the error message but the status is 500).

### 1.1 `GET /api/brands` → 500
- **Repro:** `curl https://www.letitrip.in/api/brands`
- **Likely root cause:** the brands route's sieve/query setup throws when running against the deployed Firestore indexes. Either a missing composite index or the sieve adapter is mis-mapping a field for this collection. Other listing routes (`/api/products`, `/api/categories`, `/api/stores`) work fine, so the bug is isolated to the brands route or its repository.
- **Suspect file:** `src/app/api/brands/route.ts` + `appkit/src/features/brands/repository/*`.
- **Suggested fix:** wrap the route in a try and log the error before responding; reproduce locally with the same env to capture the stack.

### 1.2 `GET /api/store/orders` → 500
### 1.3 `GET /api/store/payouts` → 500
### 1.4 `GET /api/store/reviews` → 500
### 1.5 `GET /api/store/offers` → 500
- **Repro:** authenticated as a seller, `GET /api/store/orders` etc.
- **Likely root cause:** these four routes share the same pattern — they take the seller's `storeId` from the session, then issue a Firestore query joining on `storeId`. Three plausible causes:
  - Missing composite index (e.g. `orders` `where storeId == X orderBy createdAt desc` not in `firestore.indexes.json`).
  - A repository helper assumes `user.storeId` is set on the session payload but the seller's session has only `ownerId` (the store-identity two-step lookup is incomplete).
  - The repository was migrated to a new schema but the API route hasn't been updated (the J13 / SB1 `listingType` migration left some join paths inconsistent).
- **Suspect:** `appkit/src/_internal/server/features/orders/*`, similar `payouts`/`reviews`/`offers`.

### 1.6 `GET /api/admin/faqs` → 500
### 1.7 `GET /api/admin/blog` → 500
### 1.8 `GET /api/admin/categories` → 500
### 1.9 `GET /api/admin/brands` → 500
- **Repro:** authenticated as admin, `GET /api/admin/faqs` etc.
- **Likely root cause:** same family as 1.1–1.5. The admin variant of these list endpoints does additional filtering/sort that the public variant doesn't, and one of those clauses likely needs an index that's not deployed or wraps a field that no longer exists. `/api/admin/users`, `/api/admin/dashboard`, `/api/admin/site` all work — so the route plumbing is fine; only these four collections break.
- **Strong hint:** matching pairs: `GET /api/brands` (public) and `GET /api/admin/brands` both 500 → root cause is most likely the brands repository, not the route.

### 1.10 Pre-existing: `POST /api/contact` → 500 (from earlier session)
- Form submit broken. Not in this run because the suite skips contact POST, but observed previously.

---

## Severity 2 — silent sieve/filter bugs (200 but wrong data)

These return `200 OK` but the filter parameter is ignored — users see the same results regardless of what they pick.

### 2.1 `/api/products?listingType=X` — filter ignored
- **Observed:** `?listingType=standard` and `?listingType=auction` return identical first item (`auction-hot-wheels-th-set-2024`).
- **Likely root cause:** the products route doesn't pass `listingType` through to the Firestore query. The sieve adapter maps Sieve operators (`where=listingType:eq:auction`) but the route may only accept `where=` syntax, not the legacy `listingType=` query param. Or the param is consumed but not added to the Firestore `where` clause.
- **User impact:** the auctions page may be showing standard products (and vice-versa). This needs verifying via the actual page, but the API contract is broken.
- **Suspect file:** `src/app/api/products/route.ts` — check how `searchParams.get('listingType')` is used.

### 2.2 `/api/search?q=…` — query string ignored
- **Observed:** `q=pokemon` and `q=hotwheels` return identical first item.
- **Likely root cause:** the search route's full-text matching is either disabled in prod or the param mapping is missing. Per the project memory, "no full-text search" is a known limitation of the sieve/Firestore architecture — they may have planned for client-side filtering after a broad fetch but the q-param filter never landed.
- **Suspect file:** `src/app/api/search/route.ts`.

### 2.3 `/api/products?minPrice=…&maxPrice=…` — returns 0 items
- **Observed:** any min/max price returns empty.
- **Likely root cause:** the route doesn't translate `minPrice`/`maxPrice` to the Sieve filter syntax (`filters=price>=X`). Either no translation, or the translation produces a malformed query that Firestore rejects but the route swallows.

### 2.4 `/api/stores?q=…` — returns 0 items
- Same family as 2.2 — q-param search not wired on stores.

---

## Severity 3 — security/RBAC gap

### 3.1 `GET /api/store/orders` accessible to BUYER (200 instead of 403)
- **Repro:** login as buyer (`rahul.sharma@gmail.com`), `GET /api/store/orders` → returns 200.
- **Likely root cause:** the route's `createRouteHandler({ auth: true })` only checks that the user is authenticated — it doesn't check `role === 'seller' | 'admin'`. The route assumes the seller's `storeId` is in the session, but for a buyer it's just `undefined`, so the query returns empty `[]` — which is then served with 200.
- **Impact:** Low data leakage in practice (empty list), but the route is open to abuse — e.g. if a buyer's session has a `storeId` (because they were once a seller), they'd see someone else's orders. The fix is a role gate.
- **Suspect file:** `src/app/api/store/orders/route.ts` — add `roles: ['seller', 'admin']` to the `createRouteHandler` options.

---

## Severity 4 — method-not-allowed / route shape

These are 405s or 404s on routes the UI expects to use. They didn't show up before because the affected forms either use a different verb or the route was renamed.

### 4.1 `POST /api/admin/products` → 403 for seller
- Seller tried to create a product. Got "Insufficient permissions".
- **Likely root cause:** the admin product route is admin-only by design. Sellers should create products via a different endpoint (probably a server action or `/api/store/products` POST). The seller-side product-create endpoint may not exist or may be using a different verb.
- **Suspect:** confirm where the seller dashboard actually submits the "Create Product" form on prod.

### 4.2 `GET /api/store/analytics` → 401 for an authenticated seller
- **Likely root cause:** the seller login doesn't set the role custom claim, or the analytics route requires admin role.
- **Suspect:** `createCustomUserClaims` for sellers in login + `auth.setCustomUserClaims`.

### 4.3 `GET /api/admin/analytics` → 401 for an authenticated admin
- Same family as 4.2.

### 4.4 `GET /api/store/profile` returns 405 for buyer
- The route exists but only allows PUT. Buyer GET → 405. Should be 401 (unauthenticated) or 403 (wrong role). The 405 is a leak — it tells unauthenticated callers the route exists.

### 4.5 `GET /api/products/{preorder-slug}` → 404
- Pre-order detail product fetch by slug returns 404.
- **Likely root cause:** `productRepository.findById(slug)` doesn't match pre-order slugs. The slug-prefix system documents `preorder-`, but the repository may only be querying for `product-` or `auction-` prefixes. Or the slug is being normalized.

### 4.6 `/opengraph-image` → 404
- Next.js `opengraph-image.tsx` route returns 404 instead of producing an image.
- **Likely root cause:** the file isn't being included in the Vercel function bundle. Per the `outputFileTracingIncludes` Next.js config, this needs to be force-included. May have regressed when Next 16 / Turbopack switched on.

---

## Severity 5 — UI / data presentation

### 5.1 `/en/categories/sort/relevance/page/1` has no `<h1>`
- **Observed:** Playwright finds 0 h1 elements on this page.
- **Likely root cause:** the categories listing page renders `<h2>` for section titles but no top-level `<h1>`. A11y regression.
- **Fix:** add `<h1>Categories</h1>` (or use the labels provider) to the layout shell.

### 5.2 store-vintage-vault has no banner image
- **Observed:** `<main img>` count is 0 on `/stores/store-vintage-vault/products/...`.
- **Likely root cause:** seed-data gap — the `stores` document for `vintage-vault` doesn't have `storeBannerURL` set. Other stores may also be missing it. The component degrades silently to no banner rather than showing a placeholder.

### 5.3 PW-03 buyer flow — Add-to-Cart click doesn't write to server cart
- **Observed:** Playwright clicks the visible "Add to Cart" button, then navigates to `/cart`, and the cart is empty.
- **Likely root cause:** one of these:
  - The button is wrapped in a guest-cart flow that writes to `localStorage` for unauthenticated users. Playwright context HAS the buyer cookie, but the client's `useSession` hook may not have hydrated by the time the click fires.
  - The button is a `<form action={serverAction}>` and Playwright's click is dispatching before the form is hydrated.
  - There's a race condition: the click handler calls `/api/cart` but the test navigates away before the request completes.
- **Suspect:** `appkit/src/features/products/components/ProductDetailView.tsx` Add-to-Cart handler.

---

## Test-infrastructure observations (not prod bugs)

- **Vercel build cache hides updates.** Routes whose source didn't change reuse compiled output from the previous deploy. After publishing appkit 2.6.1, only routes that re-compiled picked up the new `createRouteHandler` (which fixes 500→correct-status mapping). The fix took effect on `/api/bids` but not `/api/checkout` until a `vercel --prod --force` redeploy. Verified by the current run — checkout/cart-empty now returns the correct 400.
- **34 obsolete Firestore indexes** exist in the project that aren't in `appkit/firebase/base/firestore.indexes.json`. They were left in place to avoid risk. Could be related to the 500s in §1, especially if a query is matching against a stale composite definition.
- **Login rate limit (429) on 6+ login attempts in <60s.** The smoke suite caches a login session per role to avoid this; if you re-run too quickly the rate limiter kicks in. Wait ~60s between full runs.

---

## Suggested fix order (rough prioritization)

1. **§1.2–1.5 seller `/api/store/*` 500s** — sellers cannot see their dashboards. Biggest seller-side impact.
2. **§1.6–1.9 admin `/api/admin/*` 500s** — admins cannot manage content.
3. **§3.1 `/api/store/orders` RBAC gap** — small risk now (empty list for buyer), but should be locked down with role check.
4. **§2.1 `/api/products?listingType` ignored** — affects every auctions page and pre-orders page; users see wrong data.
5. **§4.5 pre-order detail 404** — pre-order pages don't show their actual product data.
6. **§4.1 seller-side product create** — confirm correct endpoint, ensure UI calls it.
7. **§1.1 `/api/brands` 500** — public brands listing broken.
8. **§5.1 categories page missing `<h1>`** — a11y.
9. **§5.3 Add-to-Cart UI race** — needs UI-level investigation.
10. **§4.6 `/opengraph-image` 404** — SEO/social share.

---

## How to reproduce

```bash
# HTTP suites
npm run test:smoke
npm run test:smoke:only 03      # just COD checkout

# Playwright (headless by default)
npm run test:pw
SMOKE_HEADLESS=0 SMOKE_SLOW_MO=200 npm run test:pw   # watch the browser

# Required env (already in .env.local for OTP bypass)
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```
