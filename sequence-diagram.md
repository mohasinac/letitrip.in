# LetItRip — Sequence Diagrams

> Maintained alongside `patches-roadmap.md`. **Part 1** documents every happy path currently live in production (P-1), factual as of this pass and annotated with fixes applied during the 2026-08-08 audit session. **Part 2** consolidates the sequence diagrams already authored in `patches-roadmap.md` for future patches P-6 → P-17, organized patch-by-patch, so every flow — shipped and planned — lives in one reference file. Part 2 diagrams are copied verbatim from the roadmap; for the full implementation TODO list and pre-flip checklist per patch, see `patches-roadmap.md` — this file does not duplicate those.
>
> Diagram style: ASCII actor-lane sequence diagrams, one lane per actor/system. `─────>` is a request/call, `<─────` is a response/return.

---

# Part 1 — Current Live Happy Paths (P-1)

## 1. Registration (email) + Google OAuth

```
BUYER          BROWSER            APP (Next.js)         FIREBASE ADMIN        FIRESTORE
  │               │                    │                      │                   │
  │ Fill form     │                    │                      │                   │
  │ (email, pwd,  │                    │                      │                   │
  │ name, terms)  │                    │                      │                   │
  │──────────────>│ client Zod check   │                      │                   │
  │               │ (registerClientSchema — min 8 chars,      │                   │
  │               │  upper+lower+number, matches server rule) │                   │
  │               │ setFieldError if invalid, else submit ───>│                   │
  │               │                    │ POST /api/auth/register                 │
  │               │                    │ applyRateLimit(AUTH) │                   │
  │               │                    │ server Zod re-validate (authoritative)  │
  │               │                    │───────────────────────>│ auth.getUserByEmail
  │               │                    │                      │  (expect not-found)│
  │               │                    │<───────────────────────│                   │
  │               │                    │───────────────────────>│ auth.createUser()│
  │               │                    │<───────────────────────│  userRecord       │
  │               │                    │─────────────────────────────────────────>│ userRepository
  │               │                    │                      │                   │ .createWithId()
  │               │                    │<─────────────────────────────────────────│
  │               │                    │───────────────────────>│ createCustomToken()
  │               │                    │<───────────────────────│                   │
  │               │                    │ callFirebaseIdentityToolkit(             │
  │               │                    │   "signInWithCustomToken")               │
  │               │                    │  — wrapped in try/catch → AuthenticationError
  │               │                    │  (401, not a generic 500) on failure     │
  │               │                    │───────────────────────>│ Identity Toolkit REST│
  │               │                    │<───────────────────────│ idToken           │
  │               │                    │ createSessionCookie(idToken)             │
  │               │                    │─────────────────────────────────────────>│ sessionRepository
  │               │                    │<─────────────────────────────────────────│  .createSession()
  │               │                    │ fire-and-forget: generateEmailVerificationLink
  │               │                    │  → sendVerificationEmailWithLink (Resend)│
  │               │<───201 + __session cookie + __session_id──│                   │
  │<── redirected, logged in ─────────│                      │                   │
```

**Fixed in this pass:**
- Client password schema (`registerClientSchema` in `appkit/src/features/auth/components/RegisterForm.tsx`) now enforces the same complexity rule as the server (`registerPasswordSchema`, `appkit/src/features/auth/schemas/index.ts`) — previously only `min(6)`, so a weak password passed client validation and failed server-side with no inline error.
- `register/route.ts`'s Identity Toolkit call is now wrapped (`.catch(...) → throw new AuthenticationError`), matching `login/route.ts`'s existing pattern — previously a token-exchange failure surfaced as a generic 500 instead of a 401.
- `handleApiError` (used by this route's outer catch) now delegates to the same `mapToHttpError` classification table `createRouteHandler` uses elsewhere, instead of a narrower classifier that only recognized `AppError`/Zod shapes — see § 3 below.
- Confirmed already-correct (no change needed): `useRegister` does **not** create a duplicate session — it signs in client-side via the Firebase client SDK only to populate `auth.currentUser`, without a second `/api/auth/session` call.

**Google OAuth** (architecture unchanged, verified intact):
```
BUYER      BROWSER (popup: public/auth.html)     APP                    RTDB
  │              │                                 │                      │
  │ Click        │                                 │                      │
  │ "Sign in     │                                 │                      │
  │  with Google"│                                 │                      │
  │─────────────>│ POST /api/auth/event/init ──────>│                     │
  │              │<── {eventId, customToken, rtdbEnabled} ──│             │
  │              │ if rtdbEnabled: authEvent.subscribe(eventId) ─────────>│ listen
  │              │ popup → /api/auth/google/start → Google OAuth consent │
  │              │<── redirect → /api/auth/google/callback ──────────────│
  │              │                                 │ writes event status ─>│
  │              │<── postMessage fallback (if RTDB unavailable) ─────────│
  │<─ popup closes, session established ───────────│                      │
```

---

## 2. Site logo resolution

```
ANY PAGE LOAD    layout.tsx              LayoutShellClient → AppLayoutShell → TitleBarLayout
  │                  │                                          │
  │─────────────────>│ siteSettingsRepository.getSingleton()    │
  │                  │ (React.cache'd)                          │
  │                  │<── siteSettings ─────────────────────────│
  │                  │ siteLogoUrl = siteSettings?.logo?.url ?? ""
  │                  │  (NO fallback to "/logo.svg" — see fix)  │
  │                  │──── passed down ─────────────────────────>│
  │                  │                                          │ {siteLogoUrl
  │                  │                                          │   ? <SiteLogo src=…>  (admin-configured logo)
  │                  │                                          │   : navSlot}           (desktop center nav)
  │                  │                                          │
  │                  │ generateMetadata() separately falls back │
  │                  │ to "/logo.svg" for favicon/apple-touch-icon (unaffected) │
```

**Fixed in this pass:** `layout.tsx`'s `siteLogoUrl` previously fell back to `"/logo.svg"` even with no admin logo configured, which made the `siteLogoUrl ? <SiteLogo> : navSlot` conditional in `TitleBarLayout.tsx` always truthy — the desktop center nav slot never rendered, and the wordmark showed twice (inline SVG + rasterized `/logo.svg`). The fallback is now `""` (falsy), and the `generateMetadata` favicon usage — a legitimately different consumer — keeps its own separate fallback.

---

## 3. Login + session

```
BUYER          APP                    FIREBASE ADMIN         FIRESTORE
  │              │                          │                    │
  │ POST /api/auth/login                    │                    │
  │─────────────>│ applyRateLimit(AUTH)     │                    │
  │              │ Zod validate             │                    │
  │              │───────────────────────────>│ auth.getUserByEmail
  │              │<───────────────────────────│  userRecord       │
  │              │ callFirebaseIdentityToolkit("signInWithPassword")
  │              │  .catch(err => throw AuthenticationError(401)) │
  │              │───────────────────────────>│ Identity Toolkit REST│
  │              │<───────────────────────────│ idToken            │
  │              │─────────────────────────────────────────────>│ userRepository.findById
  │              │<─────────────────────────────────────────────│  (role lookup)
  │              │ Promise.all([                                │
  │              │   createSessionCookie(idToken),               │
  │              │   sessionRepository.createSession(),          │
  │              │   auth.setCustomUserClaims(role),              │
  │              │   userRepository.updateLoginMetadata()          │
  │              │     .catch(swallow — non-critical)              │
  │              │ ])                                              │
  │<── 200 + __session + __session_id cookies ────────────────────│
  │                                                                │
  │ (every subsequent page load / API call)                       │
  │─────────────>│ handleApiError / mapToHttpError classify any   │
  │              │ raw Firestore error correctly (401/403/404/409/│
  │              │ 429/500 per error code) — see fix below         │
```

**Fixed in this pass — likely primary cause of "Internal Server Error" reports on forms:** `register`, `login`, `logout`, `session`, `session/validate`, `session/activity` all funnel their catch blocks through `handleApiError` (`appkit/src/errors/error-handler.ts`). It previously only recognized `AppError` subclasses and Zod-shaped errors — any raw Firebase Admin SDK error (Firestore rule violation, quota, transient failure) fell through to a generic, unhelpful 500 "An internal server error occurred" toast on the client, on the routes hit by nearly every page load and every login/signup attempt. `handleApiError` now delegates to the same `mapToHttpError` classification table `createRouteHandler` already uses everywhere else (correctly maps `DatabaseError`/Firestore error codes/`ApiError` to their real status codes), closing the gap for all six routes in one change instead of patching each individually.

---

## 4. Profile edit + avatar upload

```
USER          ProfilePageClient         AvatarUpload             /api/user/profile     /api/media/*
  │               │                          │                        │                    │
  │ Click "Edit"  │                          │                        │                    │
  │──────────────>│ populate form state      │                        │                    │
  │               │ from useProfile() cache  │                        │                    │
  │               │                          │                        │                    │
  │ Choose new    │                          │                        │                    │
  │ avatar photo  │─────────────────────────>│ crop modal → confirm   │                    │
  │               │                          │────────────────────────────────────────────>│ sign → PUT → finalize
  │               │                          │<────────────────────────────────────────────│ photoURL
  │               │                          │ onUploadSuccess(photoURL, cropData)          │
  │               │<─────────────────────────│                        │                    │
  │               │ PATCH { photoURL, avatarMetadata } ───────────────>│                    │
  │               │  (photoURL sent AS-IS, even "" on remove —         │                    │
  │               │   never coerced to undefined, so the server's      │                    │
  │               │   z.literal("") clear-path actually fires)         │                    │
  │               │<── 200, avatar persisted ─────────────────────────│                    │
  │               │                          │                        │                    │
  │ Edit display  │                          │                        │                    │
  │ name/phone/   │                          │                        │                    │
  │ bio/visibility│                          │                        │                    │
  │──────────────>│ <Form schema={updateProfileSchema}>                │                    │
  │               │  client Zod validate() → setFieldError inline      │                    │
  │               │ PATCH { displayName, phoneNumber, bio,             │                    │
  │               │         profileIsPublic } ─────────────────────────>│                    │
  │               │<── 200, or {issues} → applyZodIssues(setFieldError)│                    │
```

**Fixed in this pass:**
- Rewrote `ProfilePageClient.tsx` to use `<Form schema={updateProfileSchema}>` + `FieldInput`/`FieldTextarea` + `setFieldError`, replacing raw `useState`/manual `<Input>`/`<Textarea>` wiring (was a Rule #9 violation — server validation failures previously surfaced only as a generic toast, never attributed to a field).
- Swapped the generic `<ImageUpload>` for appkit's purpose-built `<AvatarUpload>`, which sends `photoURL: ""` explicitly on removal (the old code did `photoURL.trim() || undefined`, which silently dropped the clear-signal before it ever reached Firestore — clicking Remove then Save never actually cleared the avatar) and delivers crop metadata via `onUploadSuccess(photoURL, cropData)` (previously captured nowhere — cropping was a dead feature).
- `updateProfileSchema` (`appkit/src/features/account/schemas/index.ts`) was itself out of sync with the real API contract (`phone` vs `phoneNumber`, missing `bio`/`profileIsPublic`) — corrected to mirror `src/app/api/user/profile/route.ts`'s schema field-for-field.
- Discovered while fixing this: `ApiClient.request()` (`appkit/src/http/ApiClient.ts`) throws the older `ApiClientError`, not the newer `ApiError` that `surfaceError`/`ERROR_DISPLAY_MAP` were built to route on — meaning field-level error routing silently never engaged for *any* `apiClient.*` call in the app. `ApiClientError` now carries `code`/`issues`/`requestId` parsed from the response body, and `surfaceError` recognizes any error with a stable `.code` string (not just `instanceof ApiError`), so this routing now works app-wide.

---

## 5. Seller product creation (multi-step wizard → publish)

```
SELLER        SellerProductShell (wizard)      createSellerProductAction      createSellerProduct
  │                │                                    │                            │
  │ Step: Basic    │ validate(): title ≥3 chars AND      │                            │
  │                │  description ≥20 chars (was: only   │                            │
  │                │  "non-empty title" — both now       │                            │
  │                │  gated inline instead of failing     │                            │
  │                │  only at final publish)              │                            │
  │───────────────>│                                      │                            │
  │ Step: Media    │ validate(): mainImage required        │                            │
  │───────────────>│  (was ungated — could sail through   │                            │
  │                │   wizard with no image)               │                            │
  │ [type-specific step: auction/pre-order/art/sticker/…] │                            │
  │ Step: Pricing  │ validate(): price required AND        │                            │
  │                │  stockQuantity required IF            │                            │
  │                │  pluginForMode(listingType)            │                            │
  │                │  .showsStockQuantity (false for        │                            │
  │                │  auction/pre-order/prize-draw/         │                            │
  │                │  digital-code — those 4 types can      │                            │
  │                │  never satisfy this and previously     │                            │
  │                │  always failed at the very last step)  │                            │
  │───────────────>│                                        │                            │
  │ Step: Shipping │                                        │                            │
  │ Step: Publish  │──── handlePublish() ──────────────────>│ productCreateSchema        │
  │                │   draft: {…, status:"published"}        │  .safeParse(input)         │
  │                │                                          │  (status field now in     │
  │                │                                          │   schema — was silently   │
  │                │                                          │   stripped before)        │
  │                │                                          │──────────────────────────>│ finalizeProductMediaReferences()
  │                │                                          │                            │ productRepository.create({
  │                │                                          │                            │   …, status: input.status
  │                │                                          │                            │     ?? "draft"   (was:
  │                │                                          │                            │     hardcoded "draft"
  │                │                                          │                            │     UNCONDITIONALLY —
  │                │                                          │                            │     every "Publish" click
  │                │                                          │                            │     silently created a
  │                │                                          │                            │     draft, invisible in
  │                │                                          │                            │     the public catalogue)
  │<── redirect to /store/products, product now genuinely PUBLISHED ─────────────────────────│
```

**Fixed in this pass (critical):**
- `createSellerProduct` (`appkit/src/features/seller/actions/seller-actions.ts`) hardcoded `status: "draft"` on every call, silently overriding whatever the caller intended — the seller could click "Publish" and it would always create a draft. `productCreateSchema` didn't even carry a `status` field (stripped by `safeParse` even if it had survived). Both fixed: schema now accepts optional `status`, and the create function passes the caller's value through, mirroring how `sellerUpdateProduct` already did this correctly. **This also fixes Art and Sticker listing creation**, which reuse this exact code path with `listingType` forced.
- Added `validate()` to the Basic/Media/Pricing wizard steps so title-length, description-length, main-image, and stock-quantity failures surface inline at the relevant step instead of an opaque final-step toast after the seller has already clicked through the whole wizard.

---

## 6. Generic media upload (signed URL flow)

```
CLIENT (ImageUpload/AvatarUpload/MediaUploadField)      APP                    GCS
  │                                                        │                     │
  │ select file ──────────────────────────────────────────>│ POST /api/media/sign
  │                                                        │  (header-only, no bytes)
  │<── {uploadUrl, finalPath} ─────────────────────────────│                     │
  │────────────────────────────────────────────────────────────────────────────>│ PUT (raw bytes,
  │                                                        │                     │  tmp/ prefix)
  │<───────────────────────────────────────────────────────────────────────────│ 200
  │──────────────────────────────────────────────────────>│ POST /api/media/finalize
  │                                                        │  fileTypeFromBuffer() magic-byte check
  │                                                        │  mismatch → 422 MIME_MISMATCH
  │                                                        │  mediaAssetsRepository.createAsset()
  │                                                        │   (SEO-friendly shortId, new this session)
  │                                                        │  move tmp/ → permanent path
  │<── {url, shortId} ─────────────────────────────────────│                     │
  │ onChange(url) → form field updated                     │                     │
```

Failures at any step (sign/PUT/finalize) are caught and rendered inline via `<Alert variant="error">` — confirmed not silently swallowed. `MediaUploadField` tracks staged uploads and calls `onAbort` on unmount if not persisted; `ImageUpload`/`AvatarUpload` have no equivalent eager-cleanup (rely on the scheduled `mediaTmpCleanup` Firebase Function instead) — a minor inconsistency, not a functional bug, left as-is.

---

## 7. Cart (add / view / qty change / remove / guest-merge on login)

```
GUEST          BROWSER (localStorage)         BUYER (after login)      APP                    FIRESTORE
  │                  │                              │                    │                       │
  │ Add to cart ────>│ useGuestCart (local only)     │                    │                       │
  │                  │                              │                    │                       │
  │                  │                              │ Login ────────────>│                        │
  │                  │                              │                    │ useGuestCartMerge fires │
  │                  │                              │                    │ POST /api/cart/merge   │
  │                  │                              │                    │  Promise.all(items.map( │
  │                  │                              │                    │   productRepository     │
  │                  │                              │                    │   .findById)) — FIXED:  │
  │                  │                              │                    │   was sequential, up to │
  │                  │                              │                    │   ~100 awaits on every  │
  │                  │                              │                    │   login with a populated│
  │                  │                              │                    │   guest cart (likely    │
  │                  │                              │                    │   primary cause of      │
  │                  │                              │                    │   "slow login" reports) │
  │                  │                              │                    │  then sequential         │
  │                  │                              │                    │  cartRepository.addItem │
  │                  │                              │                    │  per item (writes stay   │
  │                  │                              │                    │  sequential — same cart  │
  │                  │                              │                    │  doc, can't parallelize) │
  │                  │                              │                    │────────────────────────>│
  │                  │                              │<── merged cart ────│                          │
  │                  │                              │                    │                          │
BUYER (authenticated)│                              │                    │                          │
  │ View cart ──────────────────────────────────────>│ GET /api/cart ────>│ cartRepository.getOrCreate│
  │<── cart, hydrated storeName ────────────────────│<───────────────────│                          │
  │ (if fetch fails: Alert "couldn't load your      │                    │                          │
  │  cart" + Try again button — FIXED, was silently │                    │                          │
  │  falling through to "Your cart is empty")       │                    │                          │
  │                                                  │                    │                          │
  │ Change qty ─────────────────────────────────────>│ PATCH /api/cart/{itemId} — FIXED               │
  │                                                  │  (was byte-for-byte duplicate of                │
  │                                                  │   /api/cart/validate/route.ts, only exported     │
  │                                                  │   POST — every PATCH/DELETE 405'd in prod)        │
  │                                                  │────────────────────────────────────────────────>│
  │<── updated cart ─────────────────────────────────│ cartRepository.updateItem()                     │
  │ Remove item ────────────────────────────────────>│ DELETE /api/cart/{itemId} — same fix             │
  │<── updated cart ─────────────────────────────────│ cartRepository.removeItem()                     │
```

**Fixed in this pass (critical):**
- `src/app/api/cart/[itemId]/route.ts` was an accidental byte-for-byte copy of `/api/cart/validate/route.ts` (only exported `POST`) — quantity-change and single-item-remove returned 405 in production for every authenticated user, since commit `683a616b` overwrote the real handlers. Rewritten with real `PATCH` (quantity) and `DELETE` (removal) backed by `cartRepository`.
- `src/app/api/cart/merge/route.ts` batched its per-item product lookups with `Promise.all` (was sequential — up to ~100 round trips on a single login).
- `CartRouteClient.tsx` now destructures `isError` from `useCartQuery` and shows an error banner + retry instead of silently falling through to the "empty cart" UI on a failed fetch.

---

## 8. Checkout (address → payment incl. EMI → per-seller order split → payment proof)

```
BUYER          APP                                    FIRESTORE                SELLER
  │              │                                          │                     │
  │ /checkout    │                                          │                     │
  │ select address, payment method (Manual UPI/Cash/EMI)    │                     │
  │─────────────>│ POST /api/checkout                       │                     │
  │              │ createCheckoutOrderAction():              │                     │
  │              │  resolve siteSettings (COD/EMI toggles)   │                     │
  │              │  load cart, filter selectedItemIds        │                     │
  │              │  address lookup + OTP consent check        │                     │
  │              │  IF paymentMethod=="emi":                  │                     │
  │              │   checkEmiEligibility(subtotal,            │                     │
  │              │    siteSettings.emi.enabled,               │                     │
  │              │    store.emiEnabled, threshold)            │                     │
  │              │   computeEmiSchedule() → token payment,    │                     │
  │              │    per-seller surcharge split, monthly     │                     │
  │              │    installment schedule                    │                     │
  │              │  pre-tx enforceMaxPerUserForCart() +        │                     │
  │              │   jurisdiction guard                        │                     │
  │              │  Firestore transaction: stock decrement,    │                     │
  │              │   cart clear, OTP delete ──────────────────>│                     │
  │              │  splitCartIntoOrderGroups per seller        │                     │
  │              │  for each seller group:                     │                     │
  │              │   resolveShippingCost(storeId) — now the    │                     │
  │              │   SOLE call site for this lookup (was       │                     │
  │              │   duplicated inline in the Razorpay-verify  │                     │
  │              │   path too — consolidated)                  │                     │
  │              │  createOrderForGroup(): fees, coupons,       │                     │
  │              │   order doc status:PENDING,                 │                     │
  │              │   emiInstallments[]/emiTokenAmount/          │                     │
  │              │   emiComplete:false if EMI ─────────────────>│ orders/{id}         │
  │              │  coupon usage flush, notifications,          │                     │
  │              │   confirmation emails                        │                     │────notify──>│
  │<── order(s) created, redirect to payment proof upload ─────│                     │
  │              │                                              │                     │
  │ Upload payment proof (UTR + screenshot) ────────────────────>│                    │
  │              │ order.paymentStatus = PROOF_SUBMITTED         │                    │
  │              │                                                │                    │
  │ [Razorpay path, if enabled]                                   │                    │
  │              │ verifyAndPlaceRazorpayOrderAction():           │                    │
  │              │  Promise.all(productIds.map(unitOfWork          │                    │
  │              │   .products.findById)) — FIXED, was            │                    │
  │              │   sequential per-product on the hot            │                    │
  │              │   "pay now" path, risking the 10s timeout       │                    │
  │              │   on multi-item carts                           │                    │
```

**Fixed in this pass:**
- Razorpay payment-verification path (`appkit/.../checkout/actions.ts`) now batches its product lookups with `Promise.all`, matching the COD/UPI path's existing pattern — was the one checkout sub-path that hadn't been parallelized.
- The per-seller-group store/shipping lookup in the Razorpay-verify path was a duplicated, sequential re-implementation of `resolveShippingCost` — now calls the shared helper directly.

---

## 9. Seller order lifecycle (view → assign → ship → shipping proof)

```
SELLER        APP                              FIRESTORE
  │              │                                   │
  │ View orders  │ GET /api/store/orders             │
  │─────────────>│ listSellerOrders(userId):          │
  │              │  storeRepository.findByOwnerId(uid) │  ← FIXED (critical): was
  │              │   → store.id                        │    productRepository.findByStore(userId)
  │              │  productRepository.findByStore(      │    directly — comparing the seller's
  │              │   store.id) ────────────────────────>│    Firebase UID against product.storeId
  │              │<── seller's products ────────────────│    (a store SLUG) always returned zero
  │              │  orderRepository.listForSeller(       │    products → sellers could never see
  │              │   productIds) ───────────────────────>│    their own orders
  │              │<── orders ─────────────────────────── │
  │<── order list │                                       │
  │              │                                        │
  │ Assign worker│ PATCH /api/store/orders/[id]/assign   │
  │─────────────>│  roles+permission:"store:api:write"    │
  │              │  (permission re-added — was dropped     │
  │              │   in a recent rewrite, skipping the      │
  │              │   fine-grained per-employee check)       │
  │              │  loadScopedOrder(): storeRepository      │
  │              │   .findByOwnerId(uid) → compare           │
  │              │   order.storeId !== store.id (already     │
  │              │   correct here — the reference pattern)   │
  │              │  orderRepository.assignWorker() ─────────>│
  │<── assigned  │                                            │
  │              │                                            │
  │ Ship order   │ POST /api/store/orders/[id]/ship          │
  │  (quick-ship │  roles now include EMPLOYEE (was missing, │
  │   from list  │   inconsistent with sibling routes)        │
  │   row OR     │  → shipOrderAction → customShipOrder:      │
  │   detail     │   storeRepository.findByOwnerId(uid) →     │
  │   drawer)    │   compare order.storeId !== store.id —     │
  │              │   FIXED (was direct order.storeId!==userId,│
  │              │   always failing for real sellers — every  │
  │              │   non-admin ship attempt threw 400          │
  │              │   "You do not own this order")              │
  │              │   assertEmiShippable(order) — blocks ship   │
  │              │   until emiComplete unless every item        │
  │              │   allows early ship                          │
  │              │   status→SHIPPED, shippingDate,               │
  │              │   payoutStatus:"eligible" ───────────────────>│
  │              │                                                │
  │              │  [alternate path: PATCH .../route.ts            │
  │              │   {status:"shipped"} — now ALSO sets            │
  │              │   shippingDate + payoutStatus:"eligible",        │
  │              │   mirroring customShipOrder's side effects —     │
  │              │   previously this path shipped the order but      │
  │              │   never made it payout-eligible]                  │
  │<── shipped, feedback via toast on the row (loading + error       │
  │    states added — was fetch(...).catch(()=>null) with zero        │
  │    UI feedback on failure) ────────────────────────────────────  │
  │              │                                                    │
  │ Upload       │ PATCH /api/store/orders/[id]/shipping-proof         │
  │ shipping     │  permission:"store:api:write" re-added               │
  │ proof        │  orderRepository.update(shippingProofUrl, …) ───────>│
  │<── saved     │                                                      │
```

**Fixed in this pass (critical, recurring bug across 7 call sites in `seller-actions.ts`):** `order.storeId` (a store **slug**) was being compared directly against `userId` (a Firebase **UID**) — structurally distinct values per `store.repository.ts`'s own defense-in-depth guarantee. This always failed for real (non-admin) sellers, blocking: viewing their own orders (`listSellerOrders`), seller analytics (`getSellerAnalytics`), shipping (`customShipOrder`), updating/deleting their own products (`sellerUpdateProduct`/`sellerDeleteProduct`), marking EMI installments paid (`markEmiInstallmentPaid`), and bulk payout eligibility (`bulkSellerOrder`). Every site now resolves `storeRepository.findByOwnerId(uid)` first and compares against `store.id`, matching the pattern that was already correct in `orders/[id]/route.ts`.

---

## 10. EMI installment marking

```
SELLER/ADMIN    APP                                        FIRESTORE
  │                │                                            │
  │ Order detail:  │                                            │
  │ mark one       │ PATCH /api/store/orders/[id]/emi-installment│
  │ installment    │  roles:[...ROLES_STORE_WRITE]               │
  │ paid (verified │  markEmiInstallmentPaidAction(orderId,       │
  │ UTR + proof)   │   installmentIndex, transactionId, proofUrl) │
  │───────────────>│  markEmiInstallmentPaid():                    │
  │                │   ownership check via storeRepository         │
  │                │   .findByOwnerId(uid) — FIXED (was the        │
  │                │   same storeId/uid confusion, blocking         │
  │                │   sellers from marking their own EMI            │
  │                │   installments paid)                            │
  │                │   flip target installment → status:"paid",       │
  │                │   transactionId, proofUrl, paidAt                │
  │                │   recompute emiRemainingBalance                  │
  │                │   emiComplete = every installment paid?           │
  │                │   ──────────────────────────────────────────────>│ orders/{id}
  │<── updated order (emiComplete gate now the sole check              │
  │    assertEmiShippable reads before the order can ship) ──────────│
```

---

## 11. Admin payouts (manual UPI record + mark paid)

```
ADMIN          APP                              FIRESTORE           SELLER
  │              │                                   │                 │
  │ Trigger      │ POST /api/admin/payouts/weekly     │                 │
  │ weekly batch │  group DELIVERED orders by store    │                 │
  │─────────────>│  storeEntries = Array.from(byStore) │                 │
  │              │  Promise.all(storeEntries.map(       │                 │
  │              │   async ([storeId,orders]) => {       │                 │
  │              │    store = await storeRepository       │                 │
  │              │     .findById(storeId);                 │                 │
  │              │    seller = store ? await userRepository│                 │
  │              │     .findById(store.ownerId) : null;      │                 │
  │              │    return {storeId,orders,store,seller}   │                 │
  │              │   })) — FIXED (was sequential per store,   │                 │
  │              │   two findById calls each, risking the      │                 │
  │              │   cron's timeout as seller count grows)      │                 │
  │              │  for each resolved entry: computePayoutDeduction,           │
  │              │   payoutRepository.create(status:PENDING) ────────>│         │
  │              │   orderRepository.update(payoutStatus:"requested")  │         │
  │<── batch summary ──────────────────────────────────│                 │       │
  │              │                                       │                 │     │
  │ Manually     │ (Admin transfers ₹X via personal UPI app — off-platform)         │
  │ transfer     │                                                                  │
  │ Record it    │ PATCH /api/admin/payouts/[id]                       │                 │
  │─────────────>│  status→PAID, transactionRef ───────────────────────>│                 │
  │              │  (PayoutStatusValues.COMPLETED→.PAID literal fix     │                 │
  │              │   confirmed correct in the current diff)              │                 │
  │              │  notify seller ─────────────────────────────────────────────────────>│
  │<── recorded  │                                                                       │
  │              │                                                                        │
  │              │ /store/payouts ── GET /api/store/payouts ────────────────────────────>│
  │              │<── payout history ─────────────────────────────────────────────────── │
```

---

## 12. Admin address book (list/audit, ban-status filter)

```
ADMIN          APP                              FIRESTORE
  │              │                                   │
  │ /admin/addresses (guarded by new layout.tsx —     │
  │  makeAdminSectionLayout("admin:addresses:read"),   │
  │  FIXED — was missing, page shell reachable by any   │
  │  admin:dashboard:view user regardless of the         │
  │  specific permission; data fetch was already gated)  │
  │─────────────>│ GET /api/admin/addresses            │
  │              │  ?owner=user|store OR                │
  │              │  ?banStatus=banned|unban_requested|   │
  │              │   suspicious ────────────────────────>│ addressesRepository
  │              │                                        │  .listByBanStatus() —
  │              │                                        │  now has a matching
  │              │                                        │  (banStatus ASC,
  │              │                                        │   bannedAt DESC)
  │              │                                        │  composite index —
  │              │                                        │  FIXED (was missing,
  │              │                                        │  threw FAILED_PRECONDITION
  │              │                                        │  in prod; degraded
  │              │                                        │  gracefully to an
  │              │                                        │  "Unable to load records"
  │              │                                        │  banner rather than an
  │              │                                        │  infinite spinner, but the
  │              │                                        │  Banned/Unban Requested/
  │              │                                        │  Suspicious tabs were
  │              │                                        │  non-functional until the
  │              │                                        │  index deploys)
  │<── address list, ban-status filtered ────────────────│
  │              │                                        │
  │ Create address for owner (admin-only) ────────────────>│ POST /api/admin/addresses
  │<── created   │                                        │
```

The same missing-index pattern was fixed for `savedPaymentMethods.listByBanStatus()` (admin payment-methods clusters view) — matching `(banStatus ASC, bannedAt DESC)` index added.

---

## 13. Product grouping/bundling + duplication + barcode scan

```
SELLER          APP                                     FIRESTORE
  │                │                                          │
  │ Start group /  │ PATCH /api/store/products/[id]/group      │
  │ rename group   │  loadScopedProduct (store-write+employee,  │
  │ title          │   admin/employee bypass ownership) ────────>│
  │───────────────>│                                             │
  │<── grouped     │                                             │
  │                │                                             │
  │ Add child      │ POST /api/store/products/[id]/group/children│
  │ (create new or │  mode:"create" (new linked product) or       │
  │  link existing)│  mode:"link" (existing product) ─────────────>│
  │───────────────>│                                              │
  │<── added       │                                             │
  │                │                                             │
  │ Remove child   │ DELETE /api/store/products/[id]/group/children/[childId]
  │───────────────>│──────────────────────────────────────────────>│
  │                │                                             │
  │ Leave group    │ POST /api/store/products/[id]/group/leave    │
  │───────────────>│──────────────────────────────────────────────>│
  │                │                                             │
  │ Duplicate      │ POST /api/store/products/[id]/duplicate      │
  │ listing        │  clones product as new draft ─────────────────>│
  │───────────────>│                                             │
  │<── new draft   │                                             │
  │                │                                             │
  │ Scan barcode   │ GET /api/store/products/scan?barcode=X       │
  │  (physical     │  productRepository.findByBarcodeId() scoped   │
  │   inventory)   │  to caller's store ─────────────────────────────>│
  │───────────────>│                                             │
  │<── matched product ──────────────────────────────────────────│
  │                │                                             │
  │ [GET .../[id]/codes — FIXED: previously silently duplicated  │
  │  the barcode-scan behavior above under a "digital codes"      │
  │  name with no real code-reveal logic; now honestly returns    │
  │  501 Not Implemented rather than wrong data. No schema/repo    │
  │  for a real digital-code pool exists yet — implementing one    │
  │  would be an unreviewed design decision, out of scope here.]   │
```

PUBLIC: `GET /api/products/group/[groupId]` returns every public member (parent + linked children) of a grouped listing via `productRepository.findByGroupId`, sanitized for public consumption — used by "other listings in this group" UI. Sets `Cache-Control` already; no fix needed.

---

## 14. Sublisting category + product template management

```
SELLER/ADMIN     APP                                          FIRESTORE
  │                 │                                              │
  │ Manage sub-      │ GET/PUT/DELETE /api/store/sublisting-        │
  │ category taxonomy│  categories/[id]                             │
  │ (categoryType:    │  categoriesRepository, ownership checks       │
  │  "sublisting")     │  for sellers ───────────────────────────────>│
  │─────────────────>│                                                │
  │<── managed       │                                                │
  │                   │                                                │
  │ Reuse a saved     │ GET/PUT/DELETE /api/store/templates/[id]        │
  │ product template  │  productTemplateRepository, same ownership       │
  │ when creating a    │  pattern ─────────────────────────────────────>│
  │ new listing         │                                              │
  │─────────────────>│                                                │
  │<── template applied to new-product wizard ──────────────────────│
```

---

## 15. Admin dashboard navigation map

```
ADMIN_NAV_GROUPS (src/constants/navigation.tsx)
│
├─ Management ── Dashboard, Users, Products, Classified, Digital Codes, Live,
│                 Art, Stickers, Orders, Fulfillment, Returns, Stores,
│                 Store Addresses, Addresses
├─ Finance ────── Analytics
├─ Catalog ────── Categories, Brands, Sub-listings, Feature Badges, Deals,
│                 Featured, Coupons, Print Center
├─ Content ────── Reviews, Media, Blog, Bids
├─ Site ───────── Site Settings, Navigation, Sections, Carousel,
│                 Action/Nav Permissions, Ads, FAQs, Newsletter, Contact
├─ Events ─────── Events, All Entries, Lotteries
├─ Trust & Safety ─ Support Tickets, Moderation, Reports, Item Requests,
│                    Banned Addresses, Address Clusters, Payment Methods/Clusters
├─ System ─────── Sessions, Notifications, Carts, Wishlists, History,
│                 Feature Flags, Copilot, Team, Custom Roles, Admin Notifications
├─ Maintenance ── 7 sub-pages
└─ Help ───────── Guide

Every entry declares a `requiredPermission` string. `admin/layout.tsx` enforces
only the generic `admin:dashboard:view` to enter `/admin/*` at all; each
SECTION is then supposed to enforce its own specific permission via a
`layout.tsx` calling `makeAdminSectionLayout(permission)`. Confirmed present on
most sections; ADDED THIS SESSION to `admin/art`, `admin/stickers`,
`admin/addresses` (were missing — page shell reachable without the specific
permission, though underlying data fetches were already gated). The same gap
still exists on `admin/live`, `admin/classified`, `admin/digital-codes`,
`admin/print-center` — documented here as a known follow-up, not fixed this
session (kept in scope to the 3 newly-touched sections).
```

---

## 16. Seller dashboard navigation map

```
STORE_NAV_GROUPS (src/constants/navigation.tsx)
│
├─ Overview ──── Dashboard
├─ Listings ──── Products, Art, Stickers
├─ Orders & Reviews ─ Orders, Reviews, Bids
├─ Analytics ─── Analytics
├─ Store ──────── Storefront, Shipping, Addresses, Coupons, Print Center
│                  (Print Center ADDED THIS SESSION — page was fully
│                   implemented but not wired into nav, unlike its admin
│                   counterpart which was added in the same commit;
│                   store/fulfillment is the only entry still intentionally
│                   hidden, documented pending P-14/Shiprocket)
└─ Help ───────── Seller Guide

All store/* routes are protected by <RoleGuard role={["seller","admin"]}> at
store/layout.tsx — role-based, not per-permission, so this layer has no
equivalent gap to the admin per-permission layout.tsx pattern above.
```

---

# Part 2 — Future Patches, Patch-Wise (P-6 → P-17)

> Diagrams below are consolidated from `patches-roadmap.md` — see that file for the full implementation TODO list and pre-flip checklist per patch. P-1 through P-5 (MVP, Coupons, Blog, Events, Auctions) are already live; their diagrams are superseded by Part 1 above where applicable and otherwise unchanged in the roadmap.

## P-6 — Pre-orders
**Flag:** `FEATURE_PREORDERS` · **Dependency:** P-5 stable

```
SELLER       APP             FIRESTORE         BUYER
  │            │                 │                │
  │ Create     │                 │                │
  │ pre-order  │                 │                │
  │ listing    │                 │                │
  │ depositPct │                 │                │
  │ =20%, ETA  │                 │                │
  │ 2026-09-01 │                 │                │
  │ ──────────>│ createProduct()>│ products/      │
  │            │                 │ preorder-{slug}│
  │            │                 │ listingType=   │
  │            │                 │ "pre-order"    │
  │            │                 │                │
  │            │ /pre-orders visible ────────────>│
  │            │                 │                │
  │            │ Buyer places pre-order           │
  │            │<────────────────── POST /checkout│
  │            │ createOrder()──>│ orders/{id}    │
  │            │                 │ type=preorder  │
  │            │                 │ depositAmount= │
  │            │                 │ total*0.20     │
  │            │<─ redirect to payment page       │
  │            │                 │                │
  │            │ Buyer pays deposit (Cash/UPI flow)│
  │            │<────────────────────────────────>│
  │            │                 │ paymentStatus  │
  │            │                 │ =DEPOSIT_PAID  │
  │            │<─ notify seller │                │
  │            │                 │                │
  │ Stock arrives (external, manual)              │
  │ Seller updates status → READY_TO_SHIP        │
  │ ──────────>│ patchOrder()──>│ status=PROCESSING│
  │            │                 │                │
  │ Seller ships (manual carrier + AWB)           │
  │ ──────────>│ patchOrder()──>│ status=SHIPPED │
  │            │ notify buyer──────────────────>  │
```

## P-7 — Seller Payouts (Manual UPI)
**Flag:** `FEATURE_PAYOUTS` · **Dependency:** P-6 stable

```
SELLER          APP               FIRESTORE           ADMIN
  │               │                    │                 │
  │               │  Admin triggers payout batch        │
  │               │<────────────── POST /api/admin/payouts/calculate
  │               │ payoutBatch()──────│                 │
  │               │ calculate eligible │                 │
  │               │ amounts per seller │                 │
  │               │ (DELIVERED orders) │                 │
  │               │────────────────────>│ payouts/{id}   │
  │               │                    │ status=PENDING  │
  │               │                    │ amount=X        │
  │               │                    │                 │
  │               │ Admin sees payout queue              │
  │               │<────────── GET /api/admin/payouts    │
  │               │<──── payouts[] ────│                 │
  │               │ ─────────────────────────────────────>│
  │               │                    │                 │
  │               │ MANUAL: Admin opens their UPI app,   │
  │               │ transfers ₹X to seller UPI VPA       │
  │               │                    │                 │
  │               │ Admin records reference              │
  │               │<────────── PATCH /api/admin/payouts/[id]
  │               │ markPayoutPaid()───>│ status=PAID    │
  │               │                    │ transactionRef  │
  │               │ notify seller────────────────────────>│ ──> notify
  │               │                    │                 │
  │<─ notification: "Payout ₹X received" ─────────────────│
  │               │                    │                 │
  │ /user/payouts │                    │                 │
  │ ─────────────>│ listPayouts()──────>│                │
  │<─ payout list │<─ payouts[] ───────│                 │
```

## P-8 — GST (Indian Tax Compliance)
**Flag:** `FEATURE_GST` · **Dependency:** P-7 stable (must ship before P-9/COD)

```
ADMIN       APP            FIRESTORE       CHECKOUT ENGINE         INVOICE PDF
  │           │                 │                 │                     │
  │ Configure │                 │                 │                     │
  │ GST setup │                 │                 │                     │
  │ GSTIN,    │                 │                 │                     │
  │ legalName │                 │                 │                     │
  │ ─────────>│ saveSettings()─>│ siteSettings    │                     │
  │           │                 │ gst.gstin=...   │                     │
  │           │                 │                 │                     │
  │ Set HSN + │                 │                 │                     │
  │ GST rate  │                 │                 │                     │
  │ on product│                 │                 │                     │
  │ ─────────>│ updateProduct()>│ products/{id}   │                     │
  │           │                 │ hsnCode="9503"  │                     │
  │           │                 │ gstRate=18      │                     │
  │           │                 │                 │                     │
BUYER         │                 │                 │                     │
  │ Checkout  │                 │                 │                     │
  │ ─────────>│─────────────────────────────────>│                     │
  │           │                 │                 │                     │
  │           │                 │ compare buyer pincode vs seller state│
  │           │                 │ intra-state → CGST(9%) + SGST(9%)   │
  │           │                 │ inter-state → IGST(18%)              │
  │           │                 │                 │                     │
  │           │                 │<─ order with ───│                     │
  │           │                 │  gstAmount,cgst │                     │
  │           │                 │  sgst,igst      │                     │
  │<─ order summary showing tax breakup           │                     │
  │           │                 │                 │                     │
  │           │ /api/orders/[id]/invoice           │                     │
  │ ─────────>│─────────────────────────────────────────────────────>  │
  │           │                 │                 │ generateInvoice()   │
  │           │                 │                 │ GSTIN, HSN, CGST/  │
  │           │                 │                 │ SGST/IGST breakup  │
  │<─ PDF invoice (Rule 46 compliant) ─────────────────────────────────│
```

## P-9 — COD (Cash on Delivery with Deposit + Fee)
**Flag:** `FEATURE_COD` · **Dependency:** P-8 must be live (GST-compliant invoices required)

```
BUYER       APP             FIRESTORE       SELLER          DELIVERY AGENT
  │           │                 │               │                  │
  │ /checkout │                 │               │                  │
  │ select COD│                 │               │                  │
  │ ─────────>│                 │               │                  │
  │           │ Load COD config:│               │                  │
  │           │ depositPct=20%  │               │                  │
  │           │ codFee=₹49      │               │                  │
  │           │                 │               │                  │
  │<─ order summary:            │               │                  │
  │   Item total: ₹1000         │               │                  │
  │   COD Fee: ₹49 + GST ₹8.82 │               │                  │
  │   Pay now (deposit 20%): ₹211.56            │                  │
  │   Pay on delivery: ₹846.26  │               │                  │
  │           │                 │               │                  │
  │ Confirm   │                 │               │                  │
  │ ─────────>│ createOrder()──>│ orders/{id}   │                  │
  │           │                 │ paymentMethod │                  │
  │           │                 │ =cod          │                  │
  │           │                 │ depositAmount │                  │
  │           │                 │ codFeeAmount  │                  │
  │           │                 │ paymentStatus │                  │
  │           │                 │ =DEPOSIT_PAID │                  │
  │           │                 │               │                  │
  │ Buyer pays deposit (Cash/UPI screenshot flow from P-1)         │
  │ ─────────────────────────────────────────────────────────────> │
  │           │                 │               │                  │
  │           │ notify seller ─────────────────>│                  │
  │           │                 │               │                  │
  │ Seller ships (manual)       │               │                  │
  │ ──────────────────────────────────────────>│                   │
  │           │                 │ order{SHIPPED}│                  │
  │           │                 │               │                  │
  │ Package delivered            │               │                  │
  │ ─────────────────────────────────────────────────────────────>│
  │           │                 │               │                  │
  │           │ MANUAL: Admin marks COD collected (after seller confirms)
  │           │<──────────────── PATCH /api/admin/orders/[id]     │
  │           │                 │ status=DELIVERED                 │
  │           │                 │ remainingAmountCollected=true    │
  │<─ notification: "Order delivered"                              │
```

## P-10 — Prize Draws + Spin Wheel
**Flags:** `FEATURE_PRIZE_DRAWS`, `FEATURE_RAFFLE` · **Dependency:** P-2 (coupons live)

```
ADMIN       APP              FIRESTORE       BUYER        FIREBASE FN
  │           │                  │              │               │
  │ Create    │                  │              │               │
  │ prize draw│                  │              │               │
  │ event     │                  │              │               │
  │ ─────────>│ createEvent()──>│ events/{id}  │               │
  │           │                 │ type=prize_draw               │
  │           │                 │ status=active │               │
  │           │                 │               │               │
  │           │ Public prize draw listing ─────>│               │
  │           │                 │               │               │
  │           │ Buyer enters draw               │               │
  │           │<───────────────── POST /api/events/[id]/enter  │
  │           │ createEventEntry()─>│           │               │
  │           │                 │ eventEntries/{id}             │
  │           │                 │ status=CONFIRMED              │
  │<─ notification: "Entry confirmed"           │               │
  │           │                 │               │               │
  │ Admin triggers raffle (after event ends)   │               │
  │<────────── POST /api/admin/events/[id]/trigger-raffle      │
  │           │──────────────────────────────────────────────>│
  │           │                 │ triggerEventRaffle()          │
  │           │                 │ crypto.randomInt(pool)        │
  │           │                 │ winner = entry[idx]           │
  │           │                 │<─ events/{id} updated         │
  │           │                 │   raffleWinnerUserId=...      │
  │           │                 │                               │
  │           │ Winner gets coupon code                         │
  │           │<────────────────────────────────────────────── │
  │           │                 │ couponUsage/{winnerId}        │
  │           │ notify winner ──────────────────>│             │
  │           │   "You won! Coupon: WIN123"      │             │
```

Spin Wheel:
```
BUYER       APP             FIRESTORE
  │           │                 │
  │ Event page│                 │
  │ type=spin_│                 │
  │ wheel     │                 │
  │ ─────────>│ getEvent()────>│ events/{id}
  │           │                │ spinPrizes[]: prizes
  │           │                │ spinMaxPerUser=1
  │           │                │
  │<─ Spin Wheel UI (driver.js animation)
  │           │                │
  │ Spin! ───>│ POST /api/events/[id]/spin
  │           │ assignSpinPrize()──>│
  │           │                │ entry.spinUsed=true
  │           │                │ entry.spinPrizeId=X
  │           │                │ entry.spinPrizeCouponCode=Y
  │<─ "You won: [prize name]!" │
```

**Legal note:** Consult legal on prize draw regulations in India before enabling.

## P-11 — Chat / Messaging
**Flag:** `FEATURE_CHAT` · **Dependency:** P-8 stable

```
BUYER           APP              FIRESTORE / RTDB       SELLER
  │               │                     │                  │
  │ Order detail  │                     │                  │
  │ "Chat with    │                     │                  │
  │  Seller"      │                     │                  │
  │ ─────────────>│ getOrCreateConv()──>│ conversations/{id}
  │               │                     │  buyerId, storeId│
  │               │                     │                  │
  │ Type message  │                     │                  │
  │ ─────────────>│ POST /api/messages  │                  │
  │               │ appendMessage()────>│ conversations/{id}│
  │               │                     │ messages: [{     │
  │               │                     │   text, senderId,│
  │               │                     │   sentAt         │
  │               │                     │ }]               │
  │               │ RTDB ping ──────────>│ chats/{convId}/ │
  │               │                     │ lastUpdate=now   │
  │               │                     │                  │
  │               │ Seller's app polls RTDB (useRtdbPing)  │
  │               │                     │<─── listener ────│
  │               │                     │ lastUpdate change│
  │               │ Seller fetches fresh conversation      │
  │               │<────────────────────── GET /api/messages/[convId]
  │               │<──── messages[] ────│                  │
  │               │ ─────────────────────────────────────>│
  │               │                     │                  │
  │               │ Seller replies      │                  │
  │               │<──────────────── POST /api/messages ──│
  │               │ appendMessage()────>│                  │
  │               │ RTDB ping ──────────>│                 │
  │               │                     │ chats/{convId}/  │
  │               │ Buyer polls RTDB ───>│ lastUpdate=now   │
  │<──── refresh conversation ──────────│                  │
  │               │                     │                  │
  │               │ Unread badge ↑ in TitleBar (per conversation)
```

## P-12 — Scammer Registry + Trust Score
**Flag:** `FEATURE_SCAM_REGISTRY` · **Dependency:** P-11 stable

```
REPORTER        APP             FIRESTORE          ADMIN           PUBLIC
  │               │                  │                │               │
  │ Report via    │                  │                │               │
  │ form (phone,  │                  │                │               │
  │ UPI VPA, desc)│                  │                │               │
  │ ─────────────>│ createReport()──>│ scammerReports/│               │
  │               │                  │ {id}           │               │
  │               │                  │ status=PENDING │               │
  │<─ "Report received, under review"│                │               │
  │               │                  │                │               │
  │               │ notify admin ────────────────────>│               │
  │               │                  │                │               │
  │               │ Admin reviews report              │               │
  │               │<──────── GET /api/admin/scam-reports ────────────│
  │               │                  │                │               │
  │               │ Admin publishes  │                │               │
  │               │<──────── POST /api/admin/scam-profiles ──────────│
  │               │ createProfile()─>│ scammerProfiles│               │
  │               │                  │ {id}           │               │
  │               │                  │ status=PUBLISHED               │
  │               │                  │ phone="+91XXX" │               │
  │               │                  │ upiVpa="..."   │               │
  │               │                  │                │               │
  │               │ Public lookup ───────────────────────────────────>│
  │               │<────────── GET /api/scam-check?phone=+91XXX ──── │
  │               │<──── profile[] ──│                │               │
  │               │ ─────────────────────────────────────────────────>│
  │               │ "⚠️ This number has 1 scam report"│               │
  │               │                  │                │               │
  │               │ Trust badge on seller profile     │               │
  │               │ (no scam reports = green badge)   │               │
```

**Legal note:** All entries must be admin-reviewed before publication.

## P-13 — Razorpay Online Payment (Integration)
**Flag:** `FEATURE_RAZORPAY` · **Dependency:** P-12 stable — end phase, platform mature by this point

```
BUYER        APP (Next.js)       RAZORPAY         FIRESTORE       SELLER
  │               │                  │                │               │
  │ /checkout     │                  │                │               │
  │ method=online │                  │                │               │
  │ ─────────────>│ POST /api/       │                │               │
  │               │ payment/         │                │               │
  │               │ create-order ───>│ Razorpay API   │               │
  │               │                  │ createOrder()  │               │
  │               │<─ {orderId,      │                │               │
  │               │    amount,       │                │               │
  │               │    currency}─────│                │               │
  │               │                  │                │               │
  │<─ Razorpay modal opens (client-side SDK)          │               │
  │               │                  │                │               │
  │ Enter card/   │                  │                │               │
  │ UPI details   │                  │                │               │
  │ ─────────────────────────────────>                │               │
  │<─ payment processed ─────────────│                │               │
  │               │                  │                │               │
  │ POST /api/    │                  │                │               │
  │ payment/      │                  │                │               │
  │ verify ──────>│ verifySignature()│                │               │
  │               │ Razorpay HMAC ──>│                │               │
  │               │<─ signature OK ──│                │               │
  │               │ updateOrder() ───────────────────>│ paymentStatus │
  │               │                  │                │ =PAID         │
  │               │                  │                │               │
  │<─ order confirmed ───────────────────────────────>│               │
  │               │                  │                │               │
  │               │ Razorpay webhook (async) ──────── │               │
  │               │ POST /api/payment/webhook          │               │
  │               │ verifyWebhook()──>│               │               │
  │               │ updateOrder()─────────────────────>│ idempotent   │
  │               │                  │                │               │
  │               │ notify seller ────────────────────────────────────>│
```

## P-14 — Shiprocket Auto-ship (Integration)
**Flag:** `FEATURE_SHIPROCKET` · **Dependency:** P-13 stable — very last, manual tracking works up to this point

```
SELLER        APP              SHIPROCKET API     FIRESTORE       BUYER
  │              │                   │                 │              │
  │ Order detail │                   │                 │              │
  │ "Ship via    │                   │                 │              │
  │  Shiprocket" │                   │                 │              │
  │ ────────────>│ POST /api/store/  │                 │              │
  │              │ orders/[id]/ship  │                 │              │
  │              │ Shiprocket action │                 │              │
  │              │ ─────────────────>│ createOrder()   │              │
  │              │                   │ (Shiprocket API)│              │
  │              │<─ { awbCode,      │                 │              │
  │              │    shipmentId,    │                 │              │
  │              │    trackingUrl }──│                 │              │
  │              │ updateOrder() ────────────────────>│              │
  │              │                   │ trackingNumber  │              │
  │              │                   │ =awbCode        │              │
  │              │                   │ carrier         │              │
  │              │                   │ =Shiprocket     │              │
  │              │                   │ status=SHIPPED  │              │
  │              │ notify buyer ──────────────────────────────────>  │
  │              │                   │                 │              │
  │              │ Shiprocket webhook (tracking updates)              │
  │              │ POST /api/shipping/webhook                         │
  │              │<──────────────────│ OUT_FOR_DELIVERY│              │
  │              │ updateOrderStatus─────────────────>│              │
  │              │ notify buyer ──────────────────────────────────>  │
  │              │                   │                 │              │
  │              │ (Seller still has "Manual tracking" option)        │
  │              │ backward compatible with P-1/current flow          │
```

Note: the Shiprocket carrier-API integration (webhook, verify-pickup, dev emit-shipping-event routes) was fully **removed** from the codebase in the 2026-08-08 sweep — manual-only shipping is the current baseline (see Part 1, § 9). This patch re-introduces the integration from scratch when scheduled.

## P-15 — Analytics HTTPS Function
**Flag:** `FEATURE_ANALYTICS_FUNCTION` · **Dependency:** after P-13, after load testing

```
SCHEDULER / ADMIN     FIREBASE FN          FIRESTORE          ADMIN DASHBOARD
  │                       │                    │                     │
  │ Cron: daily 2am       │                    │                     │
  │ ─────────────────────>│ analyticsAggregate()│                    │
  │                       │ read: orders,       │                    │
  │                       │ products, users ───>│                    │
  │                       │                    │                     │
  │                       │<─── aggregate ─────│                     │
  │                       │ GMV, AOV,           │                    │
  │                       │ top sellers,        │                    │
  │                       │ conversion rate     │                    │
  │                       │                    │                     │
  │                       │ write analytics────>│ analytics/daily/   │
  │                       │                    │ {date}             │
  │                       │                    │                     │
  │                       │ Admin dashboard reads daily aggregates   │
  │                       │<────────────────────── GET /api/admin/analytics
  │                       │                    │<─── analytics[] ───│
  │                       │─────────────────────────────────────────>│
```

## P-16 — Tour System (Full Steps)
**Flag:** none (always-on UX) · **Dependency:** after P-3

```
USER (any role)      APP              DRIVER.JS (lazy-loaded)
  │                    │                     │
  │ Clicks [?] Tour    │                     │
  │ button in TitleBar │                     │
  │ ──────────────────>│ onTourStart() ─────>│
  │                    │ import("driver.js") │
  │                    │<─────── loaded ─────│
  │                    │                     │
  │                    │ drive.setSteps([role-aware step set]) │
  │                    │ drive.drive()──────>│
  │                    │                     │
  │<─── Step-by-step highlight + popover ───│
  │ Click "Next" / "Done" / Esc to skip     │
```

Role-specific step counts: Customer 6, Seller 7, Admin 8 — see `patches-roadmap.md` for the full per-role step list.

## P-17 — Bundles
**Flag:** `FEATURE_BUNDLES` · **Dependency:** P-1 stable (can run parallel with P-2/P-3)

```
SELLER/ADMIN        APP                          FIRESTORE            FIREBASE FN
  │                    │                              │                    │
  │ Create bundle      │ AdminBundlesView /            │                    │
  │ from existing       │ seller drag-and-drop picker   │                    │
  │ products             │─────────────────────────────>│ products/         │
  │                    │                              │  {bundle-slug}     │
  │                    │                              │  listingType=      │
  │                    │                              │  "bundle"          │
  │<── bundle listed   │                              │                    │
  │                    │                              │                    │
BUYER                  │                              │                    │
  │ Sees bundle in      │                              │                    │
  │ catalogue → add to  │                              │                    │
  │ cart ───────────────>│─────────────────────────────>│                    │
  │                    │                              │                    │
  │ Component product   │                              │                    │ bundleStockSync
  │ stock changes ──────│──────────────────────────────│───────────────────>│ (Firebase Function)
  │                    │                              │<── bundle stock ───│  recalculates
  │                    │                              │    synced          │  bundle availability
```

## P-18 — Procurement Shipments
**Flag:** none — `admin:shipments:read`/`:write` RBAC only · **Dependency:** none

```
ADMIN         AdminShipmentLotItemsView    POST .../items/bulk    shipmentItems        onShipmentItemWrite    shipmentLots doc
  │  pastes "name,qty,price" ×N     │                              (single Firestore    (Firestore trigger,   (itemCount +
  │  rows (N ≤ 500)                 │                              batch write —         fires once per        revenue updated
  │─────────────────────────────────>│  parses + Zod-validates     no chunking, since     write in the batch)   a few seconds
  │  confirms                        │  client-side, shows preview  500 = Firestore's                          after import;
  │──────────────────────────────────>│  POST bulk payload ────────>│  batched .set() ────>│  reads current  ───>│  UI shows
  │                                  │◄── 200, items created ───────┤                      │  lot state)          "recalculating…"
  │◄── list refreshes, totals show  │                                                                             meanwhile)
  │    "recalculating…" until        │
  │    totalsComputedAt catches up   │

ADMIN         onShipmentLotWrite / onShipmentHeaderWrite (Firestore trigger)      shipmentLots (all siblings)     procurementShipments doc
  │  (fired by the bulk-import   │                                                │                                │
  │   write above, OR by editing  │  queries every lot where shipmentId == X      │                                │
  │   customs/shipping/labor on   │  (bounded ≤10) → allocateShipmentCosts()      │                                │
  │   the shipment header)        │  (customs by purchaseCost share, shipping     │                                │
  │                               │  by weight share, remainder corrected onto    │                                │
  │                               │  the last lot so sums reconcile exactly)      │                                │
  │                               │───────────────────────────────────────────────>│  batch-writes each lot's       │
  │                               │                                                │  customsAllocated/             │
  │                               │                                                │  shippingAllocated/            │
  │                               │                                                │  totalLandedCost/              │
  │                               │                                                │  projectedProfit (decimal ₹)   │
  │                               │────────────────────────────────────────────────────────────────────────────────>│  writes persisted
  │                               │                                                                                 │  `totals` +
  │◄── reopens shipment days later — totals are read straight from the doc, no recompute ──────────────────────────┤  totalsComputedAt

ADMIN         AdminShipmentProjectionsView       shipmentLotsRepository.listForProjections     shipmentItemsRepository.link
  │  opens Projections tab   │                                                                  │
  │──────────────────────────>│  real paginated Sieve query: shipmentStatus != cancelled,       │
  │                          │  sorted by projectedProfit/projectedRevenue/createdAt (decimal ₹) │
  │                          │  (composite index: sort field FIRST, then the != field —          │
  │                          │   the reverse of the intuitive filter-then-sort order)            │
  │                          │◄──────────────────────────────────────────────────────────────────┤
  │  picks a main item,      │                                                                   │
  │  "Create pre-order link" │──────────────────────────────────────────────────────────────────>│  creates/links product,
  │◄── product created, sourceShipmentId/LotId/ItemId written back onto it ─────────────────────┤  preOrderDeliveryDate
                                                                                                    from shipment.etaDate

ADMIN         DELETE /api/admin/shipments/[id]        shipmentsRepository.delete       onShipmentDeleted (Firestore trigger)
  │  deletes a shipment  │                                                              │
  │───────────────────────>│  cheap bounded query: any shipmentItems.linkedProductId    │
  │                       │  still set for this shipmentId? → 409 if yes (unlink first) │
  │                       │  else: delete the shipment doc itself (fast, Rule #6) ──────>│  cascade-deletes the
  │◄── 200 or 409 ─────────┤                                                             │  shipment's lots + items
  │                       │                                                             │  in batches of 500
```

## P-19 — Personal Catalogue
**Flag:** none — any authenticated user/seller/admin; approval queue gated by `admin:catalogue:*` · **Dependency:** none

```
BUYER          /api/user/catalogue         catalogueRepository        /api/user/catalogue/[id]/submit    onCatalogueSubmittedForApproval
  │  creates item     │                          │                          │                                    │
  │  (public by        │  stamps lastImageUpdateAt=now,                    │                                    │
  │  default) ─────────>│  listingStatus="not_listed" ───────────────────>│                                    │
  │◄── 200 ────────────┤                                                   │                                    │
  │  "Request to sell" │                                                   │                                    │
  │─────────────────────────────────────────────────────────────────────────>│  assertCatalogueImagesFresh()      │
  │                                                                          │  (30-day gate — 400 if stale)      │
  │                                                                          │  listingStatus=                    │
  │                                                                          │  "pending_admin_approval" ─────────>│  (Firestore trigger)
  │◄── 200 ─────────────────────────────────────────────────────────────────┤                                     │  notifies every admin

ADMIN          /api/admin/catalogue        approveCatalogueListingAction / rejectCatalogueListingAction
  │  reviews queue  │                                                        │
  │─────────────────>│  createProductFromCatalogueItem(item,                │
  │  approves        │    storeId="store-letitrip-official") ───────────────>│  product created,
  │──────────────────────────────────────────────────────────────────────────>│  sourceCatalogueItemId/
  │◄── 200, productId ──────────────────────────────────────────────────────┤  OwnerId written back,
                                                                                listingStatus="listed"

SELLER / ADMIN   /api/user/catalogue/[id]/list         list-from-catalogue.ts
  │  "List" (direct,   │                                                    │
  │  no approval step) │  seller → storeRepository.findByOwnerId(uid)      │
  │─────────────────────>│  admin  → no personal store, so uses            │
  │                     │  CONSIGNMENT_STORE_ID = "store-letitrip-official" │
  │                     │  either way → createProductFromCatalogueItem() ──>│  product created under
  │◄── 200, productId ──┤                                                   │  the resolved storeId

Watermark resolution (at every /api/media/[...slug] serve — not upload time):
  contextType === "catalogue-image" (derived from the filename prefix at
  finalize time, via a new optional MediaAssetDocument.contextType field)
    → per-owner watermark: owner's displayName + site URL, smaller size
  else
    → siteSettings.watermark, falling back to siteSettings.branding.siteName
      (no longer a hardcoded "letitrip.in" literal)
```

## P-20 — Payment Detail Parity
**Flag:** none — additive `OrderDocument.paymentRecord` field, always on · **Dependency:** none

```
Manual path                                    Razorpay path                                COD path
──────────                                     ─────────────                                ────────
ADMIN verifies proof                           BUYER completes Razorpay checkout            SELLER/ADMIN marks cash collected
  │                                               │                                            │
  │ adminVerifyPaymentAction()                    │ verifyAndPlaceRazorpayOrderAction()        │ PATCH /api/store/orders/[id]
  │  writes order.paymentRecord = {               │  writes order.paymentRecord = {            │   { markCodCollected: true }
  │    method: "manual",                          │    method: "razorpay",                     │  400 if paymentMethod != "cod"
  │    verificationMethod:                        │    verificationMethod: "webhook",           │  else:
  │      "manual_review",                         │    gatewayRef: { orderId,                  │   orderRepository
  │    transactionId, verifiedBy,                 │      paymentId, signature },                │    .markCodCollected()
  │    amount (decimal ₹) }                       │    amount (decimal ₹) }                     │   writes the same
  │  (idempotent — re-verifying                   │                                             │   paymentRecord shape
  │   an already-paid order is a no-op)            │                                             │   (method: "cod")
  ▼                                               ▼                                             ▼
                        Every order — regardless of path — now carries the same
                        paymentRecord shape. <OrderPaymentSummary> reads it directly;
                        for orders created before this patch (no paymentRecord field),
                        it falls back to the legacy paymentProofUrl/paymentTransactionId
                        fields so old orders keep rendering correctly.
```
