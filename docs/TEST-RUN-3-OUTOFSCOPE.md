# Test Run 3 — noticed, not chased

**G4.** Every fix in [TEST-RUN-3.md](TEST-RUN-3.md) names the case id that found
it. Anything noticed that **no case found** is recorded here and left alone.

## Why this file exists

The run's fix policy is "fix everything before advancing". Without a fence, that
becomes "refactor whatever I notice", which is the main way a long run wanders
off and stops producing coverage. A defect spotted in passing is real work — it
is just not *this* run's work, and the run is not the right instrument for
deciding that.

Recording it costs one line. Chasing it costs a cycle.

## Rules

- One line per item, with **evidence** — the same standard as a `no` verdict.
  "Looks wrong" is not an entry.
- **Do not fix it.** If it turns out to block a case later, the case will find it
  and it becomes an ordinary in-scope defect with a row in the main table.
- Reviewed at each **deploy milestone**, where each item is either promoted to a
  new gap case (so a future run tests it properly) or left standing with a reason.
- Phase 1 sends product defects here too. Phase 1 changes **cases**, not features.

## Items

| Found during | What | Evidence | Disposition |
|---|---|---|---|
| Phase 0 | `TempPass123!` and `admin@letitrip.in` are committed in `README.md` and four `scripts/seed-*.mjs`, one in a `console.log`. If production Auth still has that account with that password, that is a live credential in version control | `scripts/seed-admin-only.mjs:206`, `scripts/seed-test-users.mjs:74`, `scripts/create-test-auth-users.mjs:45`, `scripts/test-storage-flow.mjs:78`, `README.md` ×3 | **Raised to the user.** Not a test finding; needs a decision about rotating the seeded password, which would also change `tester/.env` |
| Phase 0 | `TesterChecklistItemUpdateInput` omits every six-part field (`roles`, `startPage`, `steps`, `inputs`, `expectedBehaviour`, `expectedUiState`, `expectedData`, `endResult`), so the admin catalogue editor cannot edit a case's procedure — seed is the only authoring path | `appkit/src/features/tester/schemas/firestore.ts` | Left standing. Seed-only authoring is arguably correct; the editor should say so rather than silently accept a no-op |
| Phase 0 | `GET /api/user/tester-checklist` gates `adminOnly` on `isEffectiveAdminUser(profile)` and never reads `profile.canTestAdmin`, though the schema comment says `adminOnly` means "isTester && canTestAdmin (or real admins)" | `src/app/api/user/tester-checklist/route.ts` | Left standing. Only the "(or real admins)" half is implemented, which is why admin batches browse as the real admin |
| Phase 1 · `selling/sectionised-forms` | **The form error summary jumps to the SECTION, not the field.** `FormErrorList`'s whole click handler is `onClick={() => ctx.goToStep(stepIndex!)}` — no `focus()`, no `scrollIntoView`, no element lookup. So clicking an error opens the owning section and stops, leaving the user to hunt through a section that may hold a dozen fields | `appkit/src/ui/forms/FormErrorList.tsx:52`; `fieldToStepIndex` maps a field to its STEP, which is all the summary has to work with | Not fixed — Phase 1 changes cases, not features. **Two cases assert the stronger behaviour and are deliberately left asserting it** (`form-error-summary-jumps`, `error-jump-lands-on-the-field`), because softening them to match would convert a real UX gap into a passing case. Both now say explicitly that landing on the heading is a FAILURE with evidence. Root Cause #74's half of this — the summary appearing before any submit — IS fixed and guarded (`if (!ctx.submitAttempted) return null`) |
| Phase 1 · `selling/become-seller` | **A four-case chain permanently converts a PRESERVE-tier buyer into a seller, and no reseed fully undoes it.** `users` is PRESERVE so the lifecycle never wipes it; `stores` is SEED_OWNED so it is wiped. After one run `karthik.new@gmail.com` holds `role: seller` plus a leftover `storeStatus` with **no store** — a half-state neither case is written for. `appkit-seed load --collections users` restores `role` (the seed declares it) but **cannot remove `storeStatus`**, because a merge write only overwrites keys the payload carries | `tester/scripts/lib/collections.mjs` (users PRESERVE, stores SEED_OWNED); `appkit/src/seed/users-seed-data.ts` declares `role` and not `storeStatus`; CLAUDE.md on merge-writes | Not fixed — the alternatives are a per-run QA signup (which leaks a permanent account every run) or a seeded throwaway applicant persona, and that is a fixture decision rather than a case fix. The chain header now states the one-shot nature and the exact two-step reset, so a second run cannot silently test something else while looking identical |
| Phase 1 · `selling/listing-edit-roundtrip` | **There is no second ACTIVE non-admin seller store.** Beyblade Arena is the only one: store-blader-bazaar is PENDING, store-vintage-vault-co is SUSPENDED, and store-letitrip-official belongs to the admin — who is exempt from the seller ownership check by design (`if (!isAdminUser(profile))`). So a peer-seller authorization boundary cannot be tested without a store-status confound | `appkit/src/seed/stores-seed-data.ts:60,150,193,223`, `src/actions/seller.actions.ts:348` | Not fixed. The case now uses meera (pending) and includes a step to distinguish an ownership refusal from a status refusal, rather than pretending the fixture is cleaner than it is. One extra ACTIVE seller store would close it and would make every cross-seller authorization case on the selling pages testable without a caveat |
| Phase 1 · `buying/return-request` | **No seeded listing opts out of final sale.** `ProductDocument.finalSale` is absent on every seeded product, and the schema states plainly that absent means `true` — so the entire catalogue is final sale and there is no fixture to test the change-of-mind-ACCEPTED path against | `appkit/src/features/products/schemas/firestore.ts:228-243`; zero matches for `finalSale` across `appkit/src/seed/**` | Latent, not live: no case currently needs a non-final-sale item, so nothing is broken today. Recorded because the gap is invisible — a future case asserting "change of mind is accepted on a normal listing" would fail against every product in the seed and read as a product bug. One `finalSale: false` fixture would close it |
| Phase 1 · `buying/reviews` | **A buyer appears to have no way to write a review.** The server path exists (`createReviewAction`, exported from the actions barrel) and so does the hook (`useCreateReview`) and the copy (`UI_TEXT.WRITE_REVIEW`, defined **twice**) — but a repo-wide search finds **no `.tsx` consuming any of them**. The only review modal is `ViewReviewModal`, which is read-only | `src/actions/review.actions.ts:73`, `appkit/src/features/reviews/hooks/useCreateReview.ts`, `src/constants/ui.ts:150` and `:1409`, `appkit/src/features/reviews/components/ReviewModal.tsx` | Not fixed — Phase 1 changes cases, not features. **The case is deliberately kept**, unlike the dead-`ConcernCard` one: this tests a capability a marketplace should have, so its absence is a genuine failing verdict rather than an untestable case. The step now says explicitly that a missing control is a FAILURE with evidence, not "could not test" — otherwise a missing feature reads as a coverage gap. Seeded reviews exist, so every read-side case on this page still works |
| Phase 1 · `buying/offers` | **The page labelled "Offers" is 80% not about offers.** 13 of its 66 cases concern offers; the other 53 cover notifications, blog authoring, admin team, payouts, listing-type field round-trips, support tickets, nav items and homepage sections. Its `startPage` spread confirms it: `/admin/blog` ×6, `/user/bids` ×4, `/user/addresses/new` ×4, `/store/features` ×3, `/admin/team` ×3, `/store/payouts` ×2 | `appkit/src/features/tester/seed-data/authored/buying__offers.ts`, catalogue `pageKey: "offers"` at `tester-checklist-seed-data.ts:1624` | Not restructured, and the reason is a real cost rather than reluctance: a case's id is `checklist-<group>-<page>-<key>`, so re-filing 53 cases changes 53 ids and orphans every response recorded against them — the same constraint that keeps a stale case KEY in place. The page still FUNCTIONS as a test unit (each case carries its own `startPage`, and the batcher slices by identity), so this is a naming and discoverability problem, not a correctness one. Worth a deliberate migration if the response history is ever considered expendable |
| Phase 1 · `buying/wishlist-history` | **Two guest-history storage keys, and the exported one is dead.** `HISTORY_GUEST_STORAGE_KEY = "appkit:history"` is re-exported through `server-entry.ts` and the internal history index but has **no reader and no writer**. The live key is `DEFAULT_GUEST_HISTORY_KEY` — `guest_history`, or `${NEXT_PUBLIC_APP_ID}_guest_history` — used by `useHistory` and `useHistoryMergeOnLogin`. CLAUDE.md documents a **third** value, `localStorage["letitrip:history"]`, which exists nowhere | `appkit/src/_internal/shared/features/history/config.ts:2`, `appkit/src/features/history/utils/guest-history.ts:11-13`, `appkit/src/server-entry.ts:185` | Not chased. Recorded because the dead constant is the one that looks authoritative — it is publicly exported and named as the key, so a future case or caller reaching for it would silently observe no guest history at all. Either delete it or make it the single source. CLAUDE.md's line should be corrected to the real key |
| Phase 1 · `buying/bidding` | **Every seeded persona's `displayName` is "Mock User N".** All 19 of them. The human-readable identities live only in the email addresses (`rehan.sheikh@gmail.com` → display name "Mock User 3"), so any UI that shows a name shows "Mock User 3" — bid history, reviews, public profiles, order rows | `appkit/src/seed/users-seed-data.ts` | Not chased — it is legitimate test data. Recorded because it **silently voids name-based assertions**: two cases forbade names ('Meera Bey', 'Rehan Sheikh') that occur zero times in the seed, so both PII checks passed vacuously. Both fixed. Worth deciding whether the personas should carry real-looking display names, since "Mock User 11" makes bid history and reviews unreadable for a human tester too |
| Phase 1 · `buying/my-orders` | **No seeded persona can receive testable email.** Both instruments key on `TESTER_EMAIL_ID`: `check-inbox.mjs` reads that mailbox, and the `emailEvents` recorder writes a row only when the recipient equals it. Every seeded persona uses a real-looking address the harness does not own, so an order placed as any of them produces nothing either instrument can see | `appkit/src/_internal/server/notifications/send-recorder.ts:32,84`, `appkit/src/seed/users-seed-data.ts` (0 uses of the mailbox) | Case rewritten to register a plus-addressed signup on the harness mailbox, which works. **The gap that remains is cleanup**: `purge-qa-signups.mjs` only matches `^qa-signup\+[a-z0-9-]+@letitrip-qa\.test$`, so a Gmail plus-address is not purgeable and `users` is PRESERVE tier. Either widen that pattern or seed one persona on the harness mailbox — a decision, not a drive-by fix |
| Phase 1 · `buying/image-tile-layout` | **`ConcernCard` and `ConcernGrid` are dead code.** `ConcernCard` is rendered only by `ConcernGrid`; `ConcernGrid` has no consumer anywhere in `src/` or `appkit/src/`. Both are exported from appkit's public `index.ts`, which is why a grep of the barrel makes them look alive | `appkit/src/features/categories/components/ConcernCard.tsx`, `ConcernGrid.tsx`, exported at `appkit/src/index.ts:4644,4647` | Not chased — Phase 1 changes cases, not features. The **case** was the actionable half and is deleted: it pointed at `/categories` (and `/` via its overlay) and the component renders on neither, so it could only ever be answered "could not test". Note Root Cause #68 discusses `ConcernCard` as a live surface, so this went dead after that was written. Either mount it or delete it — a public export with no consumer is the shape `feedback_no_speculative_infra` warns about |
| Phase 1 · `content-discovery/coupons` | **One coupon rejection message covers three unrelated reasons.** `validateCoupon` returns `"Coupon is not currently valid"` from a single branch gated on `isCouponValid()`, which folds together isActive=false, the date window, and the total usage limit being exhausted. Only the first two are permanent — a total-limit failure may well succeed on a retry — and the buyer cannot tell which they hit | `appkit/src/features/promotions/repository/coupons.repository.ts:241`, `appkit/src/features/promotions/schemas/firestore.ts:290-298` | Not fixed — Phase 1 changes cases, not features. **The case is deliberately kept asserting the stronger behaviour** (`coupon-expired-rejected`), because softening it would convert a real UX gap into a passing case. It previously demanded the literal `'This coupon has expired'`, which exists nowhere in the codebase, so the assertion could neither be satisfied nor fail informatively; it now quotes the real string |
| Phase 1 · `content-discovery/coupons` | **A minimum-purchase rejection never names the minimum.** The message is `"Minimum purchase requirement not met"` from both producing branches, and no `.tsx` outside the admin coupon editor reads `minPurchase` — so nothing composes the threshold into it. The buyer is told they are short without being told of what, against a threshold not shown anywhere on the page | `coupons.repository.ts:284` and `:628`; zero matches for `minPurchase` in `appkit/src/**/*.tsx` outside `AdminCouponEditorView` | Not fixed, same reason. The case now splits the two assertions — naming the REASON holds today, naming the AMOUNT does not — so the verdict says which half failed rather than failing the whole check on wording |
| Phase 1 · `selling/seller-custom-brands` | ~~**Sorting `/brands` by "Most Products" hides every seeded brand.**~~ **RETRACTED 2026-09-29.** The premise was that seeded brand rows carry no `metrics` field, so an `orderBy` on `metrics.productCount` would exclude them. The rows really do ship without it — but `onProductWrite` is a **`documentWritten` trigger on `products/{productId}`**, so it fires on seed writes too, and `updateMetricsInBatch` increments dotted paths (`"metrics.productCount": increment(delta)`), which CREATES the field. Brands ride in the same batch as categories, with an empty parent chain | `functions/firestore.ts:52-56` (the trigger); `categories.repository.ts:704+` (dotted-path `increment`); `onProductWrite.ts:67-70` ("Brands ride along here rather than in a second trigger") | **Nothing to defer — there was no defect.** Recorded rather than deleted because I had already rewritten the case to say `EXPECT THE FOUR SEEDED BRANDS TO VANISH`, which would have had a tester file a defect that does not exist. Corrected: the case now says every brand with products should be listed, and that one MISSING is real evidence the trigger never ran. **The error is the same one as the seller-guide retraction: I read a seed file and concluded what the database holds.** With a `documentWritten` trigger in play the seed file is the INITIAL state, not the final one |
| Phase 1 · `selling/seller-guide` | ~~**Seven seller guide pages are reachable only by typing the URL.**~~ **RETRACTED 2026-09-29, same session.** `STORE_NAV_GROUPS` has a `Guides` group carrying all seven entries — All Guides, Listings Guide, Orders Guide, Finance Guide, Settings, Capabilities, WhatsApp Catalog Sync. It is the LAST group and sets `defaultOpen: false`, which is why it is easy to miss by eye | **How I got it wrong:** I sliced `navigation.tsx` from `indexOf("STORE_NAV_GROUPS")`, and the first occurrence of that string is a comment on line 13. The real declaration is on line 776. So my 16,000-character window covered the ADMIN section and never reached the store one — and finding a full `All Guides` section there made the contrast feel like confirmation. The grep that decided it returned zero for a window that could not have contained a hit | **Nothing was wrong, so nothing is deferred.** Recorded rather than deleted because the CASE had already been rewritten to say `EXPECT TO FIND NONE` and to report the absence as a finding — a tester following it would have filed a defect that does not exist. Both the case and this row are corrected; the case now says the group is last and defaults closed, which is the real reason a tester might not see it |
| Phase 1 · `public-pages/core-listing-pages` | **The About page's values expansion shipped in the UI and never in the content.** `AboutView` renders six-with-subtitles and an onward `/ethics` link, destructuring `{ title, text, icon, detail }` — but `appkit/src/seed/site-settings-seed-data.ts` ships **three** `valueItems` and **none carries a `detail` field**, so the seed predates the 2026-08-24 expansion | `AboutView.tsx:98` destructures `detail`; bracket-walked the seed's `valueItems` array — 3 entries, zero `detail:` occurrences | Not fixed — Phase 1 changes cases, not features, and this is a seed-content change. The consequence is specific and worth stating: `aboutContent` lives in `siteSettings`, which is **PRESERVE-tier and never reseeded**, so a freshly-seeded environment shows three-without-subtitles while production shows whatever an admin last saved. The case (`about-values-expanded`) keeps asserting six and now says to expect three on a fresh seed, record which environment was seen, and treat it as a content gap rather than a UI failure. Three `detail` strings plus three more `valueItems` in the seed would close it |
| Phase 1 · `selling/product-upload-details` | **Three media size caps and no two agree.** Canonical `limits.ts`: image **10** MB, video **50**, pdf **20**. `MediaUploadField`'s auto-derived defaults: image **25**, video **200**, pdf **10** — wrong on all three, and the pdf/image values are transposed. And the seller gallery field overrides both with a flat `maxSizeMB={50}` on a field whose `accept` is `image/*,video/*`, i.e. the VIDEO cap applied to images. A 12 MB image therefore passes client validation against a canonical cap of 10 | `appkit/src/_internal/shared/media/limits.ts:14-16`; `MediaUploadField.tsx:46-48`; `SellerProductShell.tsx:437,441`; same flat 50 at `ProductForm.tsx:469,514` | Not fixed — Phase 1 changes cases, not features. Worth noting the tester's own fixture generator already knew: `make-media-fixtures.mjs` reads the caps out of `limits.ts` at runtime and its header says outright that the remembered 25/10 figures "are wrong", because a fixture built to a remembered cap trips a limit it was not testing. **The case keeps asserting the canonical 10** and now says to expect 50 and record which number the message states |
| Phase 1 · `seo/og-images` | **The OG image fallback branch is unreachable through the UI.** `resolveOgImageUrl` is passed null when a listing has neither `mainImage` nor a first entry in `images` — but every seeded listing carries one, and BOTH product forms require it (`mainImage: z.string().min(1, "A main image is required")`). So no listing a tester can find or create reaches that branch | `appkit/src/_internal/server/features/classified/og.tsx:34`; `SellerProductShell.tsx:958`; 8 of 8 seeded classifieds carry images | Not fixed — Phase 1 changes cases, not features, and there is no defect: the fallback is correct defensive code for a document written by some path other than the form (a seed, an import, a migration). **The CASE is converted to a declared abstention** rather than left as a hunt — it says the branch cannot be reached, tells the tester to answer `null` with that reason, and warns that a fabricated `yes` would be coverage of a path no visitor can produce. One seeded imageless fixture would make it testable |
| `admin/bundles` | `checklist-admin-bundles-bundle-create` | CLAUDE.md § "Grouped Cart Lines" states "Seeded fixtures `product-tester-crossstore-a/b` exist in the banned shape precisely so both refusals are testable by hand". A repo-wide grep for `crossstore` returns NOTHING — not in `appkit/src/seed/`, not in the tester fixtures. So the cross-store refusal had no fixture at all, and the doc asserting one is why nobody noticed. The case now uses `prizedraw-beyblade-mystery-box` (store-letitrip-official), the only seeded listing outside store-beyblade-arena; the guard reads storeId and ignores listing type. Doc fix, not a code fix. |
| `admin/bundles` | `checklist-admin-bundles-bundle-create` | The three-member minimum is UI-only. `bundle-form.ts`'s superRefine enforces `BUNDLE_MIN_ITEMS` (3), but the server schema in `_internal/shared/features/categories/bundle-schemas.ts:20` is `z.array(...).min(0).max(16)` — so `POST /api/admin/bundles` accepts a one- or two-member bundle from any API caller, and the editor can then never re-save it without adding members. Not fixed here: Phase 1 changes cases, and picking between "tighten the server" and "relax the UI" is a product decision. |
| `admin/classifieds-digitalcodes-live` | `checklist-admin-classifieds-digitalcodes-live-live-create-moderate` | `AdminProductEditorView`'s listing-type tab strip renders **empty content** — every `<TabsContent value="…" />` is self-closing, so the strip flips the `listingType` discriminator and shows no type-specific fields at all. The editor has three sections total: Listing type, Details, Inventory. A moderator opening a live listing therefore sees no species, no jurisdiction list and no video — and jurisdiction decides who may lawfully receive the animal, while the video is what the listing is judged on. Same blindness for a classified's city/contact method and a digital-code listing's pool. Not fixed: Phase 1 changes cases, not features, and this needs real type-specific admin sections. |
| `admin/classifieds-digitalcodes-live` | `checklist-admin-classifieds-digitalcodes-live-reject-status-has-no-chip` | The **Reject** row action writes `{ status: "rejected" }` (`AdminProductsView.tsx:307`), and `ProductStatus` is `draft \| published \| in_review \| archived` — there is no `rejected`. `PATCH /api/admin/products/[id]` types status as a bare `z.string().optional()`, so it persists unvalidated. The effect looks right because every public query filters `status == published`, which is why nobody noticed; the cost is that the row then matches none of the four status chips and is reachable only under All. Root Cause #33's shape on the WRITE side. Not fixed: choosing between adding `rejected` to the union and making Reject write `archived` is a product decision. |
| `admin/classifieds-digitalcodes-live` | `checklist-admin-classifieds-digitalcodes-live-classified-create-moderate` | `/admin/classified`, `/admin/digital-codes` and `/admin/live` are **browse-only**. All three are thin wrappers over `buildListingTypeListingConfig`, which gives a search box, a sort and a `status` filter — and no row actions, no bulk actions, no Approve/Reject, no Quick edit. So three nav-linked admin pages named after moderating a listing type cannot moderate anything. The cases now start at `/admin/products`; whether the per-type pages should gain the row actions is a product decision. |
| `admin/blog-faqs` | `checklist-admin-blog-faqs-faq-create-edit-category` | **The admin FAQ category picker offers six values, five of which `FAQCategory` does not have.** `AdminFaqEditorView.tsx:93` lists `shipping / returns / payments / auctions / pre-orders / general`; the union is `orders_payment / shipping_delivery / returns_refunds / product_information / account_security / technical_support / general / scam_awareness` — **only `general` overlaps**. `POST` and `PATCH /api/admin/faqs` both type category as a bare `z.string().min(1)` and then cast `as FAQCategory` (with a comment acknowledging it), so the invalid value is persisted unvalidated, and `FAQPageContent.tsx:124` counts a FAQ only `if (faq.category in categoryCounts)` — so an admin-created FAQ sits in no sidebar bucket and no category filter ever returns it. All 63 seeded FAQs use the real values, which is why this has never surfaced. Root Cause #33/#34's shape. Not fixed: mapping the six labels onto the real union is a content decision about which categories the product should expose. |
| `admin/blog-faqs` | `checklist-admin-blog-faqs-blog-media-step-save` | `BlogPostDocument` declares `contentImages` (max 10) and `additionalImages` (max 5), and `updateBlogPostSchema` accepts both — but **no renderer anywhere reads either field**, the mounted editor (`AdminBlogEditorView`) does not expose them, and no seeded post sets them. The only component that does expose them, `BlogPostForm`, is exported from the barrel and has **zero mounting consumers**. So two schema fields, a PATCH contract and a complete form exist for a feature with no output. Same shape as Root Cause #103 (a subcollection with readers and no writers), inverted. Not fixed: deleting the fields or wiring a gallery renderer is a product decision. |
| `admin/blog-faqs` | — (doc drift, no case) | CLAUDE.md's Seed Data Reference says the `faqs` collection's "Categories: Shipping/Returns/Payments/Auctions/Pre-orders". Those are the **admin picker's** labels, not the stored values — the 63 seeded FAQs hold `account_security` (5), `general` (20), `orders_payment` (9), `product_information` (12), `returns_refunds` (7), `scam_awareness` (3), `shipping_delivery` (7), and none holds `technical_support`. Doc fix, not a code fix. |
| `admin/content-marketing` | `checklist-admin-content-marketing-navigation-editor-admin` | **`/admin/navigation` is a complete CRUD surface over data nothing renders.** `AdminNavigationView` reads and writes `siteSettings.navbarConfig.navItems` via `/api/admin/navigation`; the public navbar renders `MAIN_NAV_ITEMS` from `src/constants/navigation.tsx`, a static array filtered only by the listing-type toggles (`LayoutShellClient.tsx:219-234`). A repo-wide grep for `navbarConfig` finds the two admin routes, `/api/admin/site`'s field list, the seed and the projection — and **no renderer**. Worse, `PRIVATE_SITE_SETTINGS_FIELDS` justifies keeping it private with the reason *"rendered server-side"*, which is true of nothing: Root Cause #70's discipline is that every entry carries a checkable reason, and this one is not checkable because it is false. Same shape as `BlogPostForm` and `contentImages` on `admin/blog-faqs` — a finished editor with no output. Not fixed: wiring the navbar to settings, or deleting the editor, is a product decision. |
| `admin/content-marketing` | `checklist-admin-content-marketing-features-feature-flags-admin` | The case tested the `featureFlags` group, **deleted 2026-08-29** — the schema records that "11 of its 14 keys had zero readers, and the survivors were not flags at all". There is no feature-flags surface anywhere; the survivors moved to the `listings` tab (listing/category types) and to the `payment` group (`smsVerification`, `adminCheckoutBypass`). Case rewritten onto the `listings` toggles, which genuinely reach public behaviour. No product defect — recorded so the next reader of CLAUDE.md § "Provider Resolution", which still says `siteSettings.featureFlags.adminCheckoutBypass`, knows the path is now `siteSettings.payment.adminCheckoutBypass`. |
| `admin/buyer-data-admin` | `checklist-admin-buyer-data-admin-store-addresses-admin` | **There is no browsable list of addresses anywhere in admin.** `/admin/addresses` renders `AdminAddressBookView`, an owner-scoped lookup: pick 'Owner type', type an exact 'Owner ID', press Search. `GET /api/admin/addresses` returns `{ items: [], total: 0 }` unless given either `banStatus` or BOTH `ownerType` and `ownerId`, so there is no query that answers "show me every address". That is a defensible PII posture — you must already know whose data you want — but it means an admin investigating a fraud signal cannot start from the addresses themselves, and three checklist cases were written against a listing that does not exist. Not fixed: whether to add a bounded browse is a privacy decision, not a bug fix. |
| `admin/buyer-data-admin` | — (no case; naming hazard) | `AdminAddressesView` and `AdminAddressBookView` are different components on different routes: the first backs **Banned Addresses** (`ROUTES.ADMIN.BANNED_ADDRESSES`, ban chips, `bannedAt` sort, ban/unban row actions), the second backs `/admin/addresses`. Reading the first while auditing the second produced a confident, wrong conclusion here that only following the route from `page.tsx` corrected. Worth a rename, e.g. `AdminBannedAddressesView`. |
| `admin/media-watermark` | `checklist-admin-media-watermark-watermark-video-overlay-parity` | **A product video plays with no watermark.** The overlay lives in `<MediaVideo>` (`appkit/src/features/media/MediaVideo.tsx`), which is mounted in exactly three places: `HeroCarousel` and the two admin upload previews. A product page's video opens in `ImageLightbox`, which renders a bare `<video controls>` (line 295) with no overlay layer — so the poster frame is watermarked, because it is a still served through the proxy, and the frames a buyer actually watches are not. The images pipeline's whole purpose is that catalogue media carries the mark; video is the one medium where it silently does not, on the one surface where buyers see video. Not fixed: mounting `<MediaVideo>` inside the lightbox is a real change to the theater-mode render path, not a case edit. |
| `admin/media-watermark` | `checklist-admin-media-watermark-watermark-theme-recolor` | `resolveThemeGradientStops` resolves the bundled mark's gradient from `theme.defaultLightThemeId` only, falling back to `"default-light"`. The dark default is never consulted, so on a dark-themed site the composited watermark still carries the light theme's brand colours. Arguably correct — one image is served to every viewer regardless of their mode, so it cannot follow a per-viewer theme — but it means the Themes tab's dark default silently does not apply here, and nothing on the watermark tab says so. Recorded rather than fixed: picking which theme a single served asset should follow is a design decision. |
| `admin/bulk-actions` | `checklist-admin-bulk-actions-bulk-destructive-confirms` | **No bulk action confirms, including the destructive ones.** `BulkActionItem` is `{ id, label, variant, onClick }` — it carries no `ActionDef`, so Rule #7's auto-confirmation (which resolves `ActionDef.confirmation` inside `<Button action={…}>`) never runs. `BulkActionBar.handleApply` calls `selectedAction?.onClick()` directly, and `variant: "danger"` only adds `--danger` styling to the trigger and the option. So selecting N orders on `/admin/orders` and choosing **Cancel** cancels all of them immediately, with no dialog — and `ADMIN_BULK_ACTIONS` also carries DELETE for users, reviews, blog, notifications and bundles. Rule #7's own words: "Destructive actions without `confirmation` config execute immediately with no user warning. This has caused data loss in prior sessions." Not fixed: giving `BulkActionItem` an `action` field and threading it through the bar touches every `buildBulkActions` call site. |
| `admin/bulk-actions` | `checklist-admin-bulk-actions-bulk-action-reports-result` | **No bulk action reports an outcome.** Every handler is a fire-and-forget loop — `selection.selectedIds.forEach((id) => void handleToggle(id, …))` on products, `for (const rowId of selection.selectedIds) void handleQuickStatus(rowId, …)` on orders — followed immediately by `clearSelection()`. Nothing awaits, nothing collects results, so there is no succeeded count, no failed count and no way to name which rows failed; a row whose mutation rejects is indistinguishable from one that worked. The selection is cleared before any of them settle, so the admin cannot even retry the same set. Not fixed: aggregating results means awaiting the batch and changing what the bar renders on completion. |
| `admin/bulk-actions` | `checklist-admin-bulk-actions-bulk-action-reports-result` | `/admin/products`' three bulk actions are TOGGLES, not setters — `toggleField` computes `!row[field]`. So "Feature" over a selection where some rows are already featured **un-features those**, and there is no way to tell from the bar that it will. A bulk control labelled with a verb that sometimes does the opposite is a usability hazard rather than a bug, which is why it is recorded here rather than raised. |
| `admin/content-deletes` | `checklist-admin-content-deletes-carousel-active-limit-enforced` | **Two carousel write paths, and the 5-active-slide limit is on the one the admin does not use.** `/api/carousel` (the appkit `carouselPOST` and its `[id]` sibling) enforces it, returning `Maximum 5 active slides allowed`. `/api/admin/carousel` — which is what `ADMIN_ENDPOINTS.CAROUSEL` points at, and therefore what `AdminCarouselEditorView` posts to — declares `active: z.boolean().optional()` with no count check in either the collection POST or the `[id]` PUT. The public read then does `slides.slice(0, MAX_ACTIVE_SLIDES)`, so a sixth active slide saves, shows as active in the admin list, and never renders. The admin guide at `/admin/guide/content` states the opposite outright: *"MAX_ACTIVE_SLIDES = 5: You cannot activate a 6th slide."* Not fixed: deciding whether the consumer routes should enforce it or delegate to the appkit handlers is a product call. |
| `admin/content-deletes` | `checklist-admin-content-deletes-listing-delete-with-orders-refused-or-archived` | **Deleting a product an order references is a hard delete with no guard.** `adminDeleteProduct` checks `assertPrizeDrawNotLocked` and then calls `productRepository.delete(id)` — there is no order check, no archive path and no warning. Orders denormalise title, price and image onto `items[]`, so the receipt still renders; what breaks is the buyer's link from their own order history into a product that no longer exists. That tradeoff is documented and deliberate for tester-sandbox cleanup, but nothing states it for a real order. Left `needsReview` on the case: what the code does is now settled, whether it is intended is not. |
| `admin/firebase-function-effects` | `checklist-admin-firebase-function-effects-function-errors-page-has-no-producer` | `/admin/maintenance/function-errors` can never populate. Nothing in production writes a `serverErrors` row with `source: "function"` — `wrapJobHandler` is the only thing that would, and as of 2026-09-29 it has **no call sites at all**: defined, re-exported from the server barrel, invoked nowhere. The case's earlier phrasing, "referenced solely by its own test", stopped being true when both test suites were deleted on 2026-08-28, so the claim is now stronger than it was. CLAUDE.md § "Error Observability" already lists this as "still dead, deliberately unfixed"; recorded here so the red case has a matching entry rather than reading as an untriaged defect. |
| `admin/firebase-function-effects` | — (no case; measurement hazard) | Two of this page's cases can only be answered from Google consoles — the Firebase Functions per-invocation breakdown and the Cloud Scheduler job list — and there is no in-product surface for either (`/admin/maintenance/cloud-logs` shows raw log lines, not per-function counts). Both are now marked `requiresHumanChannel`, so the automated run abstains and says which channel was missing instead of guessing. The consequence worth stating: a runaway function of the shape that caused Root Cause #92 is **not detectable from inside this product at all**, which is why that incident was found from a billing page. |
| `page-wiring/data-loss` | `checklist-page-wiring-data-loss-lottery-edit-preserves-bookings` | **The five accounts that booked the seeded lottery's slots do not exist.** `event-pokemon-number-draw-july-2026` ships slots 1-5 booked by `user-ravi-k`, `user-priya-s`, `user-arjun-m`, `user-sneha-p` and `user-vikram-r` (`events-seed-data.ts`, `lotteryConfig.slots[].bookedByUserId`), and the same five appear as `userId` in `lottery-entries-seed-data.ts` — **none of them is in `users-seed-data.ts`**. So the lottery displays buyer names belonging to no account, no tester can sign in as the person who booked a slot, and any case needing the booker's own view is unperformable. Root Cause #26's shape (a narrowed catalogue leaving references behind), spanning two seed files. Not fixed: repairing dangling seed FKs is data work, not a case edit, and the right repair is to repoint them at real Beyblade personas rather than to invent five users. |
| `cta-layout/product-bottom-bar` | — (seed doc drift, no case) | `wishlists-seed-data.ts`'s own header says *"3 wishlists (Rehan 8 items, Vivaan 5 items, Admin 4 items)"*. The three `makeDoc` calls are for `user-yugi-muto`, `user-seto-kaiba` and `user-admin-letitrip` — neither Rehan nor Vivaan owns a wishlist. The header is describing personas from before the catalogue was narrowed, so anyone writing a case from that comment will assume the wrong buyer has data. Same family as the lottery bookers on `page-wiring/data-loss`: the seed's prose and its uids disagree. Doc fix in a seed file, not a case edit. |
| `addresses/unban-request` | `checklist-addresses-unban-request-empty-note-says-why` | **An admin cannot ban a single address on an otherwise-active account, so the unban-request flow has no reachable entry point.** `ban-address` is a row action on the Banned Addresses queue (`AdminAddressesView`), and that view's only data source is `GET /api/admin/addresses?banStatus=…`, whose chips are `banned` / `unban_requested` / `suspicious`. The All chip sends no `banStatus`, and the route then returns `{ items: [], total: 0 }` — so the queue can only act on rows already in it, and nothing in the product puts a clean address there. The one real producer is `hardBanCascade`, which bans every address of a hard-banned user; but `/unban` reverses exactly that through `unbanAutoForOwner`, so lifting the user's ban clears the address too. The two states the buyer-facing flow needs together — an **active** buyer with a **banned** address — are unreachable from the UI. The drawer itself is complete and correct, which is what makes this worth recording: a finished feature with no way in. |
| `search-and-nav/employee-permissions` | — (coverage gap, reported by the repo's own script) | `scripts/diff-employee-sidebar.mjs` closes with two facts neither case covered. **45 distinct preset permissions gate no sidebar entry at all** — they gate routes and actions instead — so two presets can differ in permissions and not differ in sidebar count, which means identical counts between presets are not automatically a bug. And **an employee with hand-picked `permissions[]` rather than a preset is not covered by anything**: every case, and the script itself, reasons in terms of the 20 named presets. `AdminEmployeeEditorView` derives its permission groups from those presets, so a hand-assembled set is reachable through the API even if the editor steers toward presets. Recorded rather than chased: writing that case needs a decision about whether hand-picked permission sets are a supported shape at all. |
| `happy-path/guest-browse` | — (noticed while testing `category-detail-lists-products`) | The category page's breadcrumb renders every URL segment as a crumb. `/categories/category-beyblade-x` redirects to `/categories/category-beyblade-x/products/sort/relevance/page/1`, and the breadcrumb then reads **Home / Categories / Category beyblade x / Products / Sort / Relevance / Page** — "Sort" and "Relevance" are routing mechanics rather than places, "Page" is left dangling with no number, and the category's own crumb is the de-slugified id ("Category beyblade x") instead of its real name ("Beyblade X"), which the hero one line below renders correctly. Brand and store pages do the same ("Brand beyblade" against a hero reading "Beyblade"; "Store beyblade arena" against "Beyblade Arena"), so this is the shared crumb builder de-slugifying the document ID rather than reading the name off the record - one builder, not three pages. Not chased: no case asserts breadcrumb content, and fixing it means deciding which segments of a sort/page URL are navigable. |
- **A signed-out visitor polls `/api/notifications` and gets 401, four times per page load.** Observed on `/stores/store-beyblade-arena` as a guest: four `GET /api/notifications?limit=1` requests inside 3.2s, every one a 401. It is not a timer at that spacing — it reads as several mounts each firing once. Four billed invocations per guest page view across the whole public site is the cost class Root Cause #94 and `audit-client-poll-cost` exist for, and the correct guard is not to fire at all without a session. No case found it, so not chased.
- **React error #418 (hydration mismatch) on content-detail pages.** `/products/product-beyblade-x-wizard-arrow` and `/categories/category-beyblade-x` each log `Minified React error #418 ... args[]=HTML` once, ~1s in; `/brands/brand-beyblade`, `/stores/store-beyblade-arena`, `/categories` and `/` do not. #418 is "server HTML did not match the client", so React discards the server markup for that subtree and re-renders it — the page still looks right, which is why nothing visibly broke in the three cases that ran over it. Worth pinning down because the product page is the most-visited template on the site and a discarded server render costs the SSR work twice. Two of six navigations, both content detail, narrows it to the shared detail chrome rather than the app shell. No case asserts on it, so not chased.
- **The cart counts the same quantity two different ways on one screen.** With a single line at quantity 2, the header cart badge reads **2** while the Summary reads **'1 item'**. Both are defensible in isolation — units versus distinct lines — but they sit on the same page describing the same cart, so one of them is telling the buyer something false. 'items' is the more natural reading of a count next to a money total, which makes the Summary the one to change. Found while testing cart-quantity-updates-total, whose own oracle (subtotal reflects the line total) passed.
- **🛑 The checkout address option is not keyboard-selectable, so a keyboard-only buyer cannot check out at all.** On `/checkout` step 1 the saved-address card is a bare `generic` node with `cursor: pointer` and no `role="radio"`, no `aria-selected`, no `tabindex` and no button semantics — confirmed by the absence of all four from the accessibility snapshot. Continue is `[disabled]` until an address is selected, and selection is reachable only by pointer, so the disabled Continue becomes a dead end rather than a prompt. This is the whole funnel, not one control: no address means no shipping, no fees and no order. Found while testing checkout-address-step, whose stated oracle (listed, selectable, Continue present) passed on a mouse. A gap case asserting keyboard selection is worth authoring at the next milestone.
- **🛑 `MediaUploadField`'s alternate-source tabs are an opt-out default that NOT ONE of the 11 mounts opts out of.** `showYoutube` and `showExternal` both default to `true`, so every field in the app offers 'YouTube' and 'External URL' — the payment proof (fixed at the mount), the tester checklist's 'Screenshot (optional)', admin 'Primary media asset', the site logo and watermark, the blog cover, product images and `ImageFieldGroup`. The primitive already has a `pdfMode` whose comment claimed it hides those tabs for document fields; it has one consumer and only forces file-only capture, so that promise was never kept (comment corrected). Closing it generally needs ONE rule chosen for all 11: `AUTO_KIND_DEFAULTS` accepts `application/pdf`, so gating on `pdfMode` would also strip YouTube from every `kind="auto"` field, including the product video field where that source is deliberate (Root Cause #49). Flipping the defaults to opt-in is the likely answer and is a public prop change, so it needs the consumer sweep in the same commit (Root Cause #20). Found while testing place-cash-order-redirects-to-proof-upload; the enumeration above is the data the decision needs.
- **The media source tabs render run-together as `UploadYouTubeExternal URL`.** Visible on the payment-proof page before the fix: three adjacent `<button>`s in `.appkit-media-upload__source-tabs` with no gap or separator, reading as one word. `<Row gap="none">` is explicit in the source, so this is a deliberate `gap: none` on a control row that needs one. It affects every field still showing the tabs, i.e. the other ten mounts. Not chased.
- **The order detail page prints the country twice.** `/user/orders/view/{id}` renders the delivery address as 'Mock User 3, 123 Stadium Lane, Vijay Nagar, Indore, Madhya Pradesh, 452010, India' and then 'India' again on its own line beneath it - the country is both inside the joined one-liner and appended as a separate field. Found while testing order-detail-shows-payment-state. Cosmetic, not chased.
- **Saved phone numbers are not normalised for display, so two rows of the same list format differently.** On `/user/addresses` the seeded row shows `+91-99999-10001` while one entered through the form shows the bare `9876500011` — same field, same list, side by side. The form accepts a 10-digit number and stores it verbatim, so whichever shape was typed is the shape shown. Found while testing create-address. Cosmetic, not chased.
- **🛑 `audit-client-verb-match` cannot see a verb chosen at runtime, and was cited as proof the bug it missed could not happen.** It reported `clean (155 resolvable calls)` while `PATCH /api/user/addresses/{id}` was returning a live 405 on every buyer address edit. The call is `method === "PUT" ? apiClient.put(byIdEndpoint(id), data) : apiClient.patch(byIdEndpoint(id), data)` — neither the verb nor the path is a literal, so the resolver skips it. Worse, `useAddresses.ts` quoted the audit by name as the reason the hook was safe, so the gate's existence was load-bearing in a comment while the gate was blind. Root Cause #87: a gate nobody has watched fail is not a gate. Widening it to follow an endpoint-builder reference and a ternary verb is real work with false-positive risk across 155 call sites, so it is recorded rather than attempted here.
- **`/user/addresses/{id}` (no `/edit`) 404s as an RSC prefetch.** The console logs `404 @ /user/addresses/{id}?_rsc=...` when the Edit control is hovered or clicked, i.e. Next is prefetching a route that has no `page.tsx` — only `/edit` exists. Harmless to the user but it is one wasted request per hover on the row. Found while testing edit-address-persists.
- **The address delete confirmation names no address.** It renders as a banner at the TOP of `/user/addresses` reading 'Delete this address? This cannot be undone.' — detached from the row that raised it, and with no label, street or postcode in it. With several addresses listed there is nothing in the prompt that distinguishes the one about to be destroyed, on an action the prompt itself says cannot be undone. Found while testing delete-address, whose oracle (a dialog appears before anything is removed) passed.
- **(HARNESS, fixed) The identity split scheduled verification before creation.** `splitByIdentity` in `fetch-cases.mjs` ranked slices by a fixed `{ main: 0, guest: 50, seller: 75, admin: 100 }`, regardless of where the cases sat on the page. `happy-path/seller-listing` is authored create -> appears-in-list -> publicly-reachable, and the split put the guest/main verification at 3000 and the seller creation at 3075 — so the case that looks for 'QA Listing seller-listing' was scheduled before the batch that makes it, and could only ever record a `null`. `selling/seller-listing-types` had the same inversion. Slices now take their offset from the earliest authored position of their cases, which is the rule `chunkBatches` already states in its own comment and honours. Batch and case totals are unchanged (255 / 1847); only the order moved. Not a product defect, so it is recorded here rather than in the fix ledger.
- **🛑 Creating ONE listing through /store/products/new produced TWO products.** After a single successful publish the seller list held `qa-listing-seller-listing-2` (standard, new, **published**) and `qa-listing-seller-listing-1` (**draft**) — both titled 'QA Listing seller-listing', both at Rs 1,250.00 under Beyblade X Tops, i.e. both carrying the values I typed. **A blocked publish is NOT the cause**: probed directly by filling only the title and pressing Publish, which was refused with 'Price is required' + 'Product image is required' and wrote nothing (`q=QA Probe` returns the probe 0 times). That leaves the image-attach/crop step as the likely writer — plausibly creating a draft to own the uploaded media — with the subsequent publish creating a second product instead of promoting it. Not confirmed, and deliberately not guessed further. The cost if real: every seller who uploads an image before publishing leaves an orphan draft behind. Found while testing create-standard-listing, whose own oracle passed.
- **The category picker's search returns everything.** In the New Product dialog, typing `Beyblade X` leaves all 20 options listed including 'Bonsai', 'Dogs' and 'Lizards'; the nonsense control `zzzznope` (typed character-by-character, waited past the debounce) also returns 20. The box accepts input, shows it, and filters nothing, so on a 47-category tree the only way to reach a category is 'Load more'. **The seller product list has the same defect**: `/store/products?q=QA%20Probe` returns 102 rows. Found while testing create-standard-listing.
- **Leftover QA fixtures from earlier runs are in the live categories collection.** The category picker lists 'QA Category inline-create', 'QA Category admin-crud RENAMED' and 'QA Brand inline-create' alongside the real taxonomy — rows a previous run created and never cleaned up. They are offered to a real seller as categories to file a listing under.
- **The listing editor shows a raw category slug where the name belongs.** `/store/products/{slug}/edit` renders Category as **`category-x-tops`**, while the picker on the create form showed 'Beyblade X Tops' for the same value — so the seller is shown an internal id on the screen where they would change it. Found while testing edit-listing-persists, whose oracle (fields populated, price persists, status unchanged) passed.
- **(HARNESS) A page whose cases interleave identities around a create/delete lifecycle cannot be split by identity.** `happy-path/seller-listing` is authored create -> appears-in-list -> **publicly-reachable (guest)** -> edit -> delete. The split makes each slice contiguous, so the seller slice runs create AND delete back to back and destroys the fixture before the guest slice can look for it — the guest case can never sit between cases 2 and 4. Ordering the slices by authored position (fixed earlier today) is necessary but not sufficient. The catalogue-side fix is for `delete-listing` to create its own throwaway listing rather than deleting the one the guest case depends on; recorded rather than done, because it changes what that case tests.
- **🛑 A raw Zod message reached a seller.** 'Invalid input: expected string, received undefined' was rendered under the Description field on /store/products/new. Rule #9.6 requires server errors to go through `toUserMessage(code, t)` and says a raw message prints server internals at the user; this is that, from the validation layer. The specific field is fixed, but whatever path let an unmapped Zod issue render verbatim is not, and it would do the same for any other field this form does not pre-validate.
- **🛑 A listing published through quick-add renders 'Out of Stock' and is invisible to buyers.** Created through /store/products/new leaving Stock Quantity at its default of **1**, the listing's own detail page shows 'X Out of Stock' with both CTAs disabled, and it appears on none of: its leaf category, its ancestor category, or a /products title search — all of which scope to Available and are therefore correct to exclude it. A quantity of 1 is in stock, so the likely cause is the quick-add form not sending `stockQuantity` at all (the earlier creation, where I typed 5 explicitly, listed normally in the seller's own list). If that is right, every listing a seller publishes through quick-add without touching the stock field is born invisible. Not confirmed — the discriminator is the stored stockQuantity on the document. Found while testing listing-is-publicly-reachable.
- **The public product page shows a raw category slug in its breadcrumb.** `/products/{slug}` renders 'Home / Products / **category-x-tops**' while the chips one line below correctly read 'Beyblade X Tops'. Same defect as the seller editor's Category field, now on a buyer-facing page.
- **(HARNESS) A browsing session ages out mid-batch, and the tell is silent.** About an hour into the admin batch, `/admin/users` rendered its header as **'Sign in / Register'** with no avatar, bell or cart — while the page itself still listed real users, because the API call carried a cookie the client-side session context had given up on. An earlier screenshot from the same batch shows the signed-in header, so it degraded partway through. Nothing errored, and a case about signed-in chrome tested at that moment would have recorded a confident, evidenced, wrong failure. Re-running `fetch-cases` re-mints all four session files and the header came straight back. **Check the header before trusting any verdict that depends on being signed in**, and re-mint on sight rather than reasoning about it.
- **PRESERVE-tier residue from earlier runs is sitting on a real account.** `rehan.sheikh@gmail.com`'s display name reads **'QA Profile account-auth-profile-settings-edit-profile'** — a case key, written into the name by a previous run's profile-edit case and never restored. `users` is PRESERVE-tier: never wiped, never reseeded, so this is permanent until someone fixes it by hand. The sibling case on this very page carries a warning about exactly this for the BIO; the profile-edit case evidently carries none for the NAME.
- **🛑 TWO admin editors silently drop a field on save, and the section was OPEN both times.** `adminNotes` on the STORE editor and `publicProfile.bio` on the USER editor both failed to persist: typed with their section expanded, saved, reloaded, expanded again — empty, 0 occurrences. In both cases fields edited in the SAME submit DID persist (the tester flags; Is Verified / Is Featured / Status), so the request went through and only part of it was written, which is why it reads as a success. Both editors build their payload from `visibleValues(schema, draft)`, so that is where to look, and it is not about collapse since neither section was closed. Bio, Location, Website and four social links share the user path. Found by store-edit-keeps-verified and user-edit-keeps-tester-flags, whose safety-critical halves both passed. Not chased: a partial write through two layers affecting two editors is its own session, and it needs one fix rather than two.
- **(superseded, kept for the trail) The admin user editor drops the whole `publicProfile` subtree on save.** Typed a value into **Bio** with its section open, pressed Save changes, reloaded and expanded 'Public profile': the field is empty, 0 occurrences on the page. The tester flags set in the SAME submit persisted, so the request went through and only part of it was written — which is why it reads as a success. `AdminUserEditorView` sends `publicProfile: toPublicProfilePayload(v)` where `v = visibleValues(adminUserUpdateSchema, draft)`, and the comment beside it says it is deliberately a partial 'so an untouched field never overwrites what is stored' — so either `visibleValues` is dropping the subtree or the PATCH is not merging it. Bio, Location, Website and all four social links share that path. Found by user-edit-keeps-tester-flags, whose flags half passed; not chased, because a partial write through two layers is its own session.
- **An admin cannot search /admin/orders by order id.** The box is labelled 'Product, store, or tracking number' and returns **0 rows** for `order-1-20251107-11joon`, an order that exists and renders fine at its direct `/view` URL. The order id is the reference a customer quotes when they write in, so it is the one string an admin is most likely to paste. Found while testing order-view-matches-drawer, which could not be completed because of it.
- **The admin order page title reads 'Order: Order order-1-...'.** The label and the value both carry the word — the id already begins with 'order-'. Cosmetic.
- **🛑 CORRECTION to the two entries above: it is a READ-back bug, not a partial write, and there is no data loss.** Settled by reading the network. `PATCH /api/admin/stores/store-beyblade-arena` returned **200**, its request carried `"adminNotes":"RT3-probe"`, and its response echoed the stored document *including* that value. Reopening the panel then shows Admin Notes **empty** and the capabilities group reading **'Platform 0/7'** while the document holds five. The form STATE is correct — the reopened form sent all five capabilities back in the next payload — so the controls simply do not render their seeded values, while `storeStatus`, `isVerified` and `isFeatured` in the same panel do. An admin editing these two fields is working blind. Separately, `adminNotes: parsed.adminNotes || undefined` turns an empty string into `undefined` and the route skips undefined, so **a note can never be cleared once set**. I left 'RT3-probe' in that store's internal notes for exactly that reason; it is internal-only and a reseed clears it.
- **Doubled words in two generated strings.** The order-invoice API returns `"error":"Not found not found"`, and the admin order page titles itself `Order: Order order-1-...`. In both a label is being concatenated with a value that already carries the same word. Cosmetic; found while testing invoice-refuses-other-buyer and order-view-matches-drawer.
- **Seeded order ids encode a date their own timestamps disagree with.** `order-1-20251122-481j4x` tracks as placed **08/08/2026** and shipped **09/09/2026**, both at the same time-of-day — the seed generates now-relative dates (so fixtures re-arm on reseed) while the id string is fixed. Harmless to the product, but an id that looks like it carries a date and does not will mislead anyone debugging from a customer's order reference. Found while testing track-shows-real-dates, which passed.
- **🛑 The return-refusal message is backwards for the one state it names.** `/user/orders/{id}/return` on an order already in `return_requested` says: "This order can't be returned yet because it is **return_requested**. Returns open once it has been delivered." But `return_requested` only exists AFTER delivery — the guard is lumping it in with the not-yet-delivered statuses, so a buyer who has already requested a return is told to wait for the delivery that already happened. The correct message is that a request is already open, with a link to it. Found while testing return-request-round-trip.
- **A previous run left a seeded order in `return_requested` and nothing reset it.** `order-1-20260818-stdctx` is the fixture `return-request-round-trip` depends on being DELIVERED, and it now cannot run at all. `orders` is CASCADE-tier so a tester wipe restores it, but this run does not wipe. The case needs either its own throwaway order or a reset step — the same shape as the seller-listing delete case destroying the fixture the guest case needed.

## Two visible breadcrumb trails on every detail page

**Found during** batch 9, `checklist-selling-listing-edit-roundtrip-edit-category-preselected`
step 3 ("open its public page and read which category it is filed under").

**Evidence** — `tester/.tester-runs/run-3/shots/listing-edit-double-breadcrumb-slug.png`,
`/products/product-beyblade-burst-valkyrie`. Two elements match
`nav[aria-label="Breadcrumb"]`, both visible, stacked at y=124 and y=231:

| | Renderer | Renders |
|---|---|---|
| 1 | `AutoBreadcrumbs` (global page chrome) | `Home / Products / Product beyblade burst valkyrie` — the URL slug de-hyphenated by `capitalize()`, not the product title |
| 2 | `ProductDetailPageView`'s own `renderBreadcrumb` | `Home / Products / Superking` — real data |

Two problems, neither fixed here:

1. **Duplicate landmark.** Two navs share `aria-label="Breadcrumb"`, so a screen-reader
   user gets two identically-named landmarks with different contents.
2. **`AutoBreadcrumbs` cannot do better on a dynamic segment.** It derives labels from
   the path alone, so on `[slug]`/`[id]` routes the last crumb is always a prettified
   slug. Its `segments` filter already drops hex ids and pure numbers; a product slug is
   neither.

**Why not fixed in this run:** the only correct fix is deciding which breadcrumb owns a
detail route and suppressing the other, which is page-chrome architecture across every
`[slug]`/`[id]` route on the site — not a change this case's scope justifies. The
category-label half (crumb 2 rendering the raw slug `category-burst-superking`) WAS in
scope and is fixed.

## Fixture gap: no second store owns a listing, so cross-seller ownership is untestable

**Found during** batch 9, `checklist-selling-listing-edit-roundtrip-edit-other-sellers-listing-404s`.

That case needs seller A to open seller B's listing for edit. Two independent blockers:

1. **No session for the seller it names.** The case signs in as `meera.blader@gmail.com`;
   the harness mints exactly four identities (bot / buyer / seller / admin) and the seller
   one is `tyson@beybladearena.in`. A tester cannot sign in for themselves.
2. **Testing it from tyson's side is also impossible.** `/stores` lists exactly two public
   stores — `store-beyblade-arena` (tyson's own, which holds every real product) and
   `store-letitrip-official` (**0 products**, matching the seed). `store-blader-bazaar` and
   `store-vintage-vault-co` are deliberately `pending`/`suspended` and so not public, and
   `store-tester-qa-seller` returned **"Store Not Found"**.

So there is no listing anywhere that tyson does not own, and the guard cannot be exercised
in either direction.

**What would fix it:** give `store-letitrip-official` one published standard product in the
seed. It is already `active` + `isVerified`, so it introduces none of the pending-store
confound the case itself warns about, and it would make the guard testable from the
harness's existing seller session with no new identity.

**Why not done in this run:** reseeding mid-run mutates the catalogue that in-flight batches
are asserting against. This belongs at a milestone, alongside the pending-deploy fixes.

## `OrderDocument.totalAmount` vs the stored `totalPrice`

**Found during** batch 10, `checklist-happy-path-seller-fulfil-seller-order-detail-opens`.

`OrderDocument` declares `totalAmount`, and CLAUDE.md's seed table documents it as
the order total. Measured against `/api/store/orders/[id]` for two orders — one
seeded, one placed through real checkout in this run — **`totalAmount` is
`undefined` on both**, while the flat `totalPrice` carries the real figure
(`997.8` = 899 item + 77 shipping + 10 platform + 10 WhatsApp).

The documents also carry a full set of flat top-level fields alongside `items[]`:
`productId`, `productTitle`, `userId`, `userName`, `quantity`, `unitPrice`,
`totalPrice`. So the stored shape is the flat legacy one plus the array.

`SellerOrdersView`'s list mapper already knows this — it does
`totalAmount: Number(item.totalPrice ?? 0)` under a comment stating that
`totalAmount`/`total` are "four spellings the order document has never carried".
The drawer had not been back-ported and read the phantom field directly, which is
what this run fixed (Root Cause #59's shape).

**Why not fixed here:** whether `totalAmount` should be written by the order write
paths, or whether the type should be corrected to `totalPrice`, is a schema
decision spanning every order producer and consumer — and the answer changes what
every reader should do. Deciding it from one seller drawer would be guessing.
Note `shippingAddress` diverges the same way: a pre-formatted **string** in stored
orders where the type declares an object.

## The seller's single-order endpoint returns the raw order document

**Found during** batch 10, `checklist-happy-path-seller-fulfil-seller-sees-no-payment-screenshot`.

The **UI is correct** and that case passes: `SellerOrdersView` never renders
`paymentProofUrl`. It reads the field only inside `sellerPaymentBadge`, to choose
a label ("Awaiting verification"), and there is no image element for it anywhere
in the seller drawer — which is what CLAUDE.md's Manual Payment Review Flow
requires ("No screenshot (bank/UPI capture)").

The **endpoint** is the gap. `GET /api/store/orders/[id]` ends in
`return successResponse(order)` — the whole document, with no projection. So on an
order that has a proof, the seller's own API response would carry
`paymentProofUrl` even though nothing renders it. A bank or UPI screenshot is
exactly the class of field § "Public Data Projections" says must be named public
before it travels (Root Cause #70: a narrow render does not strip anything at
runtime).

🛑 **Not observed with a real proof present** — none of this run's orders has one
uploaded, so this is read off the route source, not measured. Confirming it needs
a buyer to upload a proof and then a seller fetch of that order.

**Why not fixed here:** the fix is a `toSellerOrder()` projection with every
`OrderDocument` field triaged public/private, which is the pattern that section
prescribes and a change every seller order surface reads through. It is its own
piece of work, not a drive-by during a fulfilment case.

## The poll page does not show that you have already voted

**Found during** batch 14, `checklist-content-discovery-event-detail-subroutes-participate-records-an-entry`.

`PollInlineClient` tracks submission in local `isSubmitted` state only, so after a
reload the full voting form is offered again — five radios and a Cast Vote button —
as though nothing had happened. The entry HAS persisted (the event's Participants
counter moved), it simply is not read back.

With the duplicate guard added in this run the second attempt is now refused with a
real message instead of silently duplicating, which removes the data-integrity
problem. The remaining gap is presentational: the page should open in a
"you voted for X" state rather than inviting a vote that will be rejected.

**Why not fixed here:** it needs a new per-user entry read on the event page
(`countUserEntries` or a find-by-event-and-user) threaded into the layout and down
to the client component. That is a data-fetch addition on a public, cached route,
so it wants its own look at cost and caching under Rule #6 — not a drive-by.

## Poll leaderboard says "No votes yet." while the header counts 364 participants

**Found during** the same batch, reading the Leaderboard tab for the entry count.

`/events/event-favourite-blader-poll/leaderboard` renders **"No votes yet."** while
the page header immediately above it reads **"Participants: 364"** — measured right
after two votes that moved the counter from 362. Two numbers for the same thing on
one screen, which is the shape CLAUDE.md's Root Cause #72 describes.

The header count comes from `stats.totalEntries` on the event document; the
leaderboard panel is fed by the layout's own `leaderboard` fetch. One of the two is
wrong and I did not establish which: it could be the leaderboard query missing poll
entries, or `stats.totalEntries` being inflated by something other than real votes.

**Why not fixed here:** deciding which source is authoritative is the whole question,
and guessing would mean "fixing" whichever one I looked at first. Needs the two
queries compared against the raw `eventEntries` rows for this event.

## `/events/{id}/spin-results` is a public feed, but its case asserts a private one

**Found during** batch 14, `checklist-content-discovery-event-detail-subroutes-spin-results-subroute`.

The case's label says the route "lists **this account's own** spins with the prize
each won", and its `expectedData` is the caller's own spin count. The route is not
viewer-scoped: `getSpinResultsCached(id)` takes only the event id and calls
`getEventSpinResults(id, 10)`, returning the ten most recent spins across all users.
Read as the harness buyer, who has never spun, the page listed **other people's**
results — "Mock User 3 / Free Launcher Grip Tape / 15d ago", "Mock User 2 / 10% Off
Coupon", "Guest / 5% Off Coupon".

🛑 **I did not "fix" either side, and the reason matters.** The implementation looks
deliberate, not accidental: the renderer has distinct `GUEST_FALLBACK` and
`PARTICIPANT_FALLBACK` labels for identities that are not the viewer's, which a
self-scoped page would never need, and the 10-row cap with `revalidate = 0` reads
like an activity feed. So the likely defect is the CASE, not the code — but
rewriting a case to assert whatever the code happens to do turns it into a
tautology, and the author plainly believed something different. That disagreement is
for a human to settle.

Two questions it needs to settle:

1. **Is a public feed intended at all?** If so the case should be re-authored to
   assert that, and a separate "my spins" view may be wanted.
2. **If public, should the names be masked?** Root Cause #50 is the precedent: a
   real bidder's display name was being published on public bid history until
   `maskPublicBid` was made to actually call `maskName`. A prize-winner feed showing
   full display names beside what each person won is the same shape.

## Harness: `session.json` accumulates cookies DURING a batch

**Found during** batch 16 setup, checking the identity before starting.

`session-guest.json` is pristine (36 bytes, 0 cookies) but the live
`tester/.tester-runs/session.json` had grown to 1,470 bytes with two real
`__session` / `__session_id` cookies for `www.letitrip.in` — acquired while batch
15 was browsing as a guest. The Playwright MCP writes storage state back to the
file it was pointed at, so the identity file mutates under you mid-batch.

**Consequence, and it is a live footgun:** copying the identity file once and then
trusting `session.json` across several batches is not safe. A later batch that
skips the copy inherits whatever the previous one accumulated — which is exactly
the failure the skill's `browser_close`-before-swap rule exists to prevent, one
level further out.

**Batch 15's verdicts are unaffected.** Its identity was verified behaviourally on
every page judged, not just from the file: the header showed Sign in / Register
throughout, `/admin/orders` redirected to `/auth/login`, and the raffle entry was
refused with a 403.

**Mitigation in use:** re-copy `session-<role>.json` over `session.json` at the
START of every batch, after `browser_close`, and verify the count — not once per
identity change. Worth folding into `test-run-preflight.mjs` as a per-batch check
rather than left to discipline.

## `bg-primary` is too light for white text at small sizes (AA)

**Found during** batch 16, `checklist-design-ux-general-design-contrast-readability`
and `…-section-cta-buttons-visible`.

Measured over 391 light-mode text nodes on the homepage: 61 fall below the WCAG AA
4.5:1 threshold, worst **3.41:1**, and they cluster on 13px controls coloured with
the primary teal `rgb(13,148,136)`.

🛑 **The obvious fix does not work.** Contrast is symmetric, so putting white text
on a solid `bg-primary` fill gives the *same* 3.41:1 as teal text on white. The
section-CTA fix landed in this run makes those controls consistent and obviously
clickable; it does not move the ratio. Clearing AA needs a **darker primary shade**
behind white text (`primary-700`-ish reaches ~4.8:1).

**Why not fixed here:** `--appkit-color-primary` is theme-substitutable — admins
author themes through Site Settings → Themes — so hard-coding a darker shade at one
call site fights the token system, and changing the token itself restyles every
solid primary control in the app. That is a deliberate design decision about the
palette, not a drive-by, and it wants checking against both built-in themes.

Nothing measured here is *unreadable*; this is an accessibility-standard gap, not a
legibility bug, which is why the contrast case still passed on its own terms.

## The server-error log is saturated by one recurring OG-image failure

**Found during** batch 18, while trying to settle the brand-page defect.

`/admin/maintenance/server-errors` reads **"200 of 200 (source=vercel)"** — its cap —
and every visible row is the same thing: `RSC_route failed to pipe response` with
request id `rsc-no-digest`, on `opengraph-image` routes
(`/[locale]/categories/[slug]/opengraph-image`, `/[locale]/scams/[id]/opengraph-image`),
several per hour through 2026-09-29.

Two consequences:

1. **A recurring OG-image render failure is going unnoticed.** Every entry in the
   last-7-days error log is this one fault, so something is failing continuously
   when a crawler or social card fetches an OG image.
2. **It makes the log useless for anything else.** I went there to look for a
   swallowed `DEGRADED_READ` on the brand product query, and could not: any other
   error is pushed beyond the 200-row cap. The absence of a row there is therefore
   not evidence that the error did not happen — which is exactly the trap this
   surface exists to prevent.

Also noted: `?code=DEGRADED_READ` in the URL does not filter the list (still 200 of
200), so the Code control is not URL-driven — worth knowing before anyone tries to
link to a filtered view.

**Why not chased here:** no case in this batch covers OG images or the error
surface, and the brand defect it was blocking is queued with its own next step.

## Auth cases need a throwaway-account policy — 9 of 11 are unrunnable without one

**Found during** batch 19, `account-auth/signup-login--guest`.

Two cases passed (email+password login; forgot-password non-enumeration). The other
nine abstained, and they fall into three groups — only one of which is a real
capability gap.

**1. Forbidden: two cases mutate a real seeded account's password.**
`password-reset` sets a new password on `neha.op@gmail.com` and
`auth-email-links-single-use` on `divya.funko@gmail.com`, each relying on a final
step to put `TempPass123!` back. Changing a password IS modifying a login, which
this run forbids outright — and it is not recoverable, because `appkit-seed` sets
`TempPass123!` **only when it creates an Auth record**, so a re-seed never restores
an existing one. A half-finished run leaves a real account locked out of its
documented credential. `auth-email-links-single-use` has no safe prefix either: its
step 5 *is* the mutation.

**2. Blocked on account accumulation: four cases need a signup.**
`email-signup`, `email-verify`, `signup-verification-email-arrives` and
`auth-emails-sender-identity-and-inbox`. Signing up writes a Firebase Auth record
and a `users` row, and `users` is **PRESERVE** tier — the lifecycle never wipes it,
which is exactly what protects the ~31 real accounts. So every run of these cases
leaves another `qa-signup+run-…` account behind permanently, with nothing to reap
them. Additive rather than destructive, so not forbidden, but a standing cost.

**3. Genuinely needs a human: three Google cases.** `google-oauth`,
`google-link-existing`, `google-popup-blocked-fallback` — all
`requiresHumanChannel`. No Google credential to select in the popup, and the
popup-blocked variant additionally needs a browser-preference change the MCP
surface does not expose.

**What would unblock groups 1 and 2 together:** a disposable identity tier. Either a
`qa-throwaway-*` uid prefix the tester lifecycle is permitted to delete (it would
need adding to `collections.mjs` alongside the PRESERVE/SEED_OWNED/CASCADE tiers,
which currently has no such concept for `users`), or a documented decision to accept
the accumulation and to allow resetting one nominated seeded account's password.

The mailbox capability is NOT the blocker — `tester/scripts/check-inbox.mjs` plus
`TESTER_EMAIL_ID` already work, and `--since` makes the assertions sound. Four of
these cases become automatable the moment the account question is answered.

## Denormalised counters disagree with reality in four places now

**Found across** batches 18 and 20, by four different cases.

A pattern rather than four bugs, worth fixing as one:

| Surface | Shows | Reality |
|---|---|---|
| `/brands` tile (Beyblade) | `28 items` | its brand page lists **0** |
| `/brands` tile (Hasbro) | `0 items` | unverified, but products carry `brand: "Hasbro"` |
| `/sellers` row (Beyblade Arena) | `📦 1 products` | the store holds roughly **22** listings |
| `/user` dashboard (vivaan) | `13 Orders` · **`₹0 Total spent`** | thirteen real orders with real totals |

Each is a denormalised roll-up read straight onto a card or tile. CLAUDE.md already
records the shape twice: Root Cause #102 (a nightly reconciler that could not express
the distinction it was reconciling, and brand rows' `metrics.productCount` having **no
writer at all**) and Root Cause #42 (a mirror field that drifts the moment one write
path forgets it).

🛑 **None of these errors is visible as an error.** A wrong number is just a number —
nothing throws, nothing logs, and the page looks finished. That is why they survive:
the only way to catch one is to compare it against the thing it summarises, which is
exactly what these four cases did.

**Why not fixed in this run:** the brand one is already deferred with its own next
step (`loop-state.fixQueue`), and until that is settled I cannot tell whether these
share a cause — a single missing writer, a reconciler that skips empty rows, or four
independent read-side bugs. Fixing the three cosmetic ones separately would risk
three patches where one writer is missing. `₹0 Total spent` beside 13 orders is the
most suspicious, because it suggests the aggregate is being computed from a field the
orders do not carry — the same shape as the `totalAmount`-vs-`totalPrice` divergence
recorded from batch 10.

## A correctly-refused add-to-cart shows two toasts, one of them meaningless

**Found during** batch 21, `checklist-money-flows-offer-to-purchase-offer-lane-blocks-other-items`.

With an accepted offer's locked line in the cart, clicking "Add to Cart" on an
unrelated product is correctly refused — and fires **two** toasts on the one click:

1. `Complete your accepted offer first — you can add other items once it's paid for.`
   — correct, specific, actionable. This is the `assertCanAddNewItems` /
   `CART_LANE_BLOCKED` guard doing exactly its job.
2. `Something went wrong. Please try again.` — `GENERIC_USER_MESSAGE`, telling the
   buyer nothing and implying a fault where the system behaved correctly.

Notable because `audit-usemutation-onerror` is described as asserting that every
mutation goes through `useApiMutation` and **each failure has exactly one surface** —
and it passes. So this path escapes that audit, which makes it worth a look beyond
the cosmetic fix: if one add-to-cart failure can surface twice, others can.

**Why not fixed here:** I could not isolate which handler emits the generic message
within the batch's budget, and a blind suppression risks silencing the good message
instead of the redundant one. The fix wants tracing which of the two surfaces is the
un-audited one, not a guess at the toast layer.

## `RowActionMenu` cannot consume an ActionDef's `confirmation` — every destructive row action fires immediately

**Found by** `checklist-money-flows-offer-to-purchase-seller-sees-and-accepts`
(batch 22) while checking its step 6, "Confirm in the dialog".

**Evidence.** `RowAction` (`appkit/src/ui/components/RowActionMenu.tsx:9-16`)
declares `{ label, onClick, destructive?, disabled?, icon?, separator? }` — it
has **no `action` and no `confirmation` field**, so there is no way to pass an
ActionDef to it. `SellerOffersView.tsx:126-128` therefore wires Reject as
`{ label: ACTIONS.STORE["reject-offer"].label, destructive: true, onClick }`:
the label is read from the registry and the `confirmation` block sitting beside
it in that same ActionDef — `{ title: "Reject this offer?", body: "The buyer
will be notified that their offer was declined." }` — is discarded. Rejecting a
buyer's offer executes on one click.

`<Button action={…}>` already implements the whole mechanism
(`Button.tsx:329-333` defers the click, `:363` portals the dialog), so this is
a gap in one primitive, not a missing capability.

**Why the audit does not catch it.** `appkit/scripts/audit-action-confirmation.mjs`
walks `action-registry.ts` and asserts every `kind: "danger"` ActionDef **has**
a `confirmation`. It never asks whether anything **consumes** one. So a config
that exists and is thrown away passes clean — Root Cause #92's lesson ("a check
a name satisfies is decoration") one layer further out.

**Scope.** 16 `destructive: true` call sites across 27 `RowActionMenu` files.
Rule #7.4 says a destructive action without confirmation "= immediate
irreversible execution" — here the configs exist and are unreachable, which is
the same outcome with none of the warning signs.

**Not fixed here, deliberately.** The honest fix is a shared confirm primitive
extracted from `Button` plus `action?: ActionDef` on `RowAction`, then 16 call
sites migrated — architectural, and larger than the case that found it (G4).
Doing it badly would mean duplicating Button's dialog JSX, which the Duplication
Framework would then have to unpick.

**Next step, for the batch-25 milestone review:** extract Button's confirm
dialog into `appkit/src/ui/components/ActionConfirmDialog.tsx`, consume it from
both `Button` and `RowActionMenu`, add `action?: ActionDef` to `RowAction`,
migrate the 16 destructive sites, then extend
`audit-action-confirmation.mjs` with a second rule asserting that a
`destructive: true` row action passes an ActionDef rather than a bare label —
so the gap cannot reopen.

## Two gap cases owed, and one clipped nav item

**1. An auction purchasable at `/products/{auction-slug}`** — found by
`checklist-seo-canonical-and-host-gated-price-is-declared-in-structured-data`
(batch 23) while reading the offers object its step 3 requires. The defect is
**already fixed** (see the ledger entry, forced because the finding case passed),
but no case in the catalogue asserts the property, so nothing would catch a
regression. A grep for `products/auction-` across all 130 authored files returns
nothing.

*Owed:* a case that lands on `/products/{auction-slug}` as a guest and asserts a
**permanent** redirect to `/auctions/{slug}`, plus one that reads the auction's
`offers.url` and asserts it names `/auctions/`. Both would have failed against
the old behaviour, which is the bar — a case that passes either way is decoration.
The same shape applies to the other five types with dedicated routes
(`preorder-`, `prizedraw-`, `classified-`, `digitalcode-`, `live-`); one
parametrised case covering all six is better than six.

**2. `redirect-only-page-no-canonical` contradicts `tab-family-single-canonical`.**
Both are in `seo/canonical-and-host`. The tab-family case asserts a tab family
shares ONE canonical — the base URL the sitemap advertises — and the code does
exactly that for `/promotions/*`. The redirect-only case then demands the landing
page's canonical name the **landing page** (`/promotions/deals`), which is the
opposite. Measured: the canonical is `/promotions` and the sitemap carries
exactly one promotions entry, so the code is right and the case is wrong.
Recorded `yes` against the design rather than `no` against a mistaken
expectation.

*Owed:* rewrite that case's `expectedUiState` to assert what it is really about —
the redirecting **page** carries no metadata of its own — and drop the clause
about where the canonical points, which the sibling case already owns. Left as
is, every future run records a false failure here.

**3. The main nav's first item is clipped.** Renders as `ucts` instead of
`Products`, on `/`, `/products` and `/products/{slug}` — seen in three separate
screenshots this batch (e.g. `shots/seo-control-pass.png`). The strip appears to
start already horizontally scrolled. Not chased: a design/layout case should own
it, and `design-ux/general-design` is the natural home.

---

# Milestone 1 review (batch 25) — decisions

Every entry above triaged. An undecided list is one nobody reads by milestone
three, so each gets an outcome here rather than being left standing silently.

## 1. `RowActionMenu` cannot consume a confirmation → **SCHEDULED, milestone 2**

Not left standing. 16 destructive row actions execute on one click while their
ActionDefs carry perfectly good `confirmation` blocks that the primitive has no
prop to accept — Rule #7.4's stated outcome ("immediate irreversible execution")
with none of its warning signs, because the config exists and reads as wired.

Scheduled rather than done now because the honest fix extracts Button's confirm
dialog into a shared primitive and then migrates 16 call sites; done carelessly
it duplicates that dialog's JSX, which the Duplication Framework would have to
unpick later. It is additive and cannot half-land: adding `action?: ActionDef` to
`RowAction` changes nothing for the 15 sites that do not pass it.

**Also owed with it**: a second rule in `audit-action-confirmation.mjs` asserting
a `destructive: true` row action passes an ActionDef rather than a bare label.
The current rule checks the registry HAS confirmations and never that anything
consumes one, so it passes today — the same "a check a name satisfies is
decoration" shape as Root Cause #92.

## 2. Auction purchasable at `/products/{auction-slug}` → **FIXED; gap case owed**

The defect is fixed and shipped this milestone (permanent redirect via
`pluginFor().detailRoute()`, plus `detailPath` on the JSON-LD builders). What
remains is coverage: no case asserts the property, so nothing would catch a
regression.

**Owed, milestone 2**: one parametrised case covering all six listing types with
a dedicated route (`auction-`, `preorder-`, `prizedraw-`, `classified-`,
`digitalcode-`, `live-`) that lands on `/products/{slug}` as a guest and asserts
a **permanent** redirect to the type's own route, plus an assertion that the
type's `offers.url` names that route. Six separate cases would be six chances to
drift; one parametrised case is the right shape. Both halves must fail against
the pre-fix behaviour — a case that passes either way is decoration.

## 3. `redirect-only-page-no-canonical` contradicts its sibling → **REWRITE the case, milestone 2**

Confirmed by measurement, not opinion: the canonical is `/promotions` and the
sitemap carries exactly one promotions entry, so the code is right and the case
is wrong. Its `expectedUiState` demands the landing page's canonical name the
landing page, which is the opposite of what `tab-family-single-canonical`
asserts in the same batch.

**Owed**: narrow that case to what it is actually about — the redirecting *page*
carries no metadata of its own — and delete the clause about where the canonical
points, which the sibling already owns. Left as is, every future run records a
false failure here, and a recurring false failure is how a checklist stops being
believed.

## 4. Main nav's first item clipped (`ucts`) → **LEFT STANDING, assigned**

Real and reproducible on `/`, `/products` and `/products/{slug}` — the strip
renders already horizontally scrolled. Left standing deliberately: it is a
layout defect with no data or money consequence, and `design-ux/general-design`
is a batch this run will reach on its own with cases written for exactly this.
Recorded here so that batch's tester knows it is already sighted rather than new.

## 5. An orphaned cloud function blocks every `firebase deploy --only functions` → **NEEDS A HUMAN DECISION**

Surfaced by the batch-25 milestone, not by a case. `node scripts/test-run-milestone.mjs`
got through check, publish (appkit 4.42.2), repin, relock, typecheck and the
functions rebuild, then the functions deploy aborted:

```
Error: The following functions are found in your project but do not exist in
your local source code:
        payoutBatch (asia-south1)
Aborting because deletion cannot proceed in non-interactive mode. To fix,
manually delete the functions by running:
        firebase functions:delete payoutBatch --region asia-south1
```

**It is pre-existing drift, not caused by this run.** `payoutBatch` appears
nowhere as a `defineFunction` — the only matches in the repo are string labels
inside `appkit/src/seed/payouts-seed-data.ts` status-history entries
(`"payoutBatch:dispatch"`, `"payoutBatch:failedRetrying"`). So it was deployed
at some point, removed from source later, and the cloud still runs it.

**I did not delete it, and deliberately so.** Deleting a deployed cloud function
is destructive and outward-facing: it is authorised nowhere by this run's remit,
the standing milestone authorisation covers *deploying* rather than removing
cloud resources, and a function still in the cloud may still be firing on a
schedule against production data. `--force` would have made the deploy pass and
silently destroyed it.

**The functions deploy was also not needed for this milestone.** Verified rather
than assumed: `git diff HEAD~1 --stat -- src/_internal/server/functions
src/_internal/server/jobs` in appkit is **empty**, so this milestone changed no
function definition and no trigger. Every fix shipped here lands in `src/` or in
appkit UI/adapters consumed by Vercel. The functions bundle was rebuilt anyway
so `audit-functions-bundle-freshness` stays green.

**The decision owed**, and it is genuinely a judgement call, not a cleanup task:
either delete it (after checking Cloud Scheduler for a job still invoking it, and
its recent invocation count — a function with live traffic is doing something
somebody wants), or restore a definition for it if the removal was accidental.
Until one of those happens, `--only functions` cannot be deployed at any
milestone, so this blocks the *next* function change rather than this one.

## 6. Floating controls overlap the in-page checkout CTA → **LEFT STANDING, assigned**

Seen at 320px on `/checkout` step 2 while running
`checklist-cta-layout-checkout-bottom-bar-back-not-squeezed` (batch 27), which
asserts the BOTTOM BAR and is unaffected — so no case owns this.

The floating back-to-top pill and a second circular control sit **on top of** the
in-page "Continue to payment" button inside the Order Summary card, obscuring the
right-hand end of its label. Visible in
`shots/cta-back-not-squeezed-pass.png`.

Root Cause #71's family: a fixed control that does not clear what is beneath it.
That entry's fix made `BackToTop` clear the `--bottom-chrome-height` tier, which
is why the BOTTOM bar is clean — but an IN-PAGE primary CTA is not part of that
tier and nothing reserves space for it.

**Left standing, not chased**: it is cosmetic, the bottom-bar CTA duplicates the
action and is unobstructed, and `design-ux/general-design` is a batch this run
will reach with cases written for exactly this. Recorded so that tester knows it
is already sighted.

## 7. The checkout address option is a `div`, not a radio → **LEFT STANDING, accessibility**

Also from batch 27. The saved-address card on `/checkout` step 1 is a plain
`<div>` with `cursor: pointer` and **no ARIA role, no `tabindex`, no
`aria-checked`** — the accessibility snapshot renders it as `generic`. So it is
not keyboard-reachable and a screen reader does not announce it as a selectable
option, on the one control that gates the entire checkout.

Found because a `label`/`button` selector could not match it and a programmatic
`.click()` did not register — it needed a real pointer event on the div.

Not chased here (no case owns it and the fix is a shared primitive question:
these should be `role="radio"` in a `role="radiogroup"`, or actual inputs via the
Rule #9 field primitives). Worth a gap case, since "cannot complete checkout by
keyboard" is a real exclusion rather than a polish item.

## 8. Two console errors on a guest `/products` load → **LEFT STANDING, both real**

Seen while running `checklist-buying-browsing-search-listing-no-missing-message`
(batch 31), which asserts only the ABSENCE of MISSING_MESSAGE — so neither of
these is that case's claim, and neither is chased.

**(a) `401` on `/api/notifications?limit=1`, twice, signed out.** A guest page is
calling an auth-only endpoint. Harmless to the visitor, but it is a wasted
authenticated request on every guest page load, and Rule #6's whole concern is
that per-visitor requests are billed compute. Cheap to fix — gate the poll on a
resolved session — and it belongs with the `audit-client-poll-cost` family.

**(b) React error #418 — a hydration mismatch.** "Text content does not match
server-rendered HTML". This is the more interesting of the two: it means the
server render and the client render disagreed, which is how subtly wrong content
ships while nothing visibly breaks. Worth a case of its own rather than a
drive-by fix, since the cause could be anything from a date formatted in two
timezones to a value read from a client-only source during SSR.

## 9. The listing filter trigger has NO accessible name → **a11y defect, worth a gap case**

Found in batch 31 on `/products`, at both 375px and 1440px. It is the only
control in the listing toolbar without an accessible name:

| toolbar control | accessible name |
|---|---|
| search icon | `aria-label="Search"` |
| **filter icon** | **none — no text, no `aria-label`, no `title`** |
| grid view | `aria-label="Grid view"` |
| list view | `aria-label="List view"` |
| free shipping | text label |

It is an icon-only `<button>` containing only an `<svg>`. The control **works**
— clicking it opens a right-side "Filters" panel with Listing type (Standard,
Classifieds, Digital Codes, Live Items), Category, Condition, Brand, and
Reset all / Apply. So this is not a broken filter; it is an unnameable one.

**Consequences:** a screen reader announces it as an unlabelled button, so the
only route to every facet on the catalogue is undiscoverable to assistive tech;
and it cannot be targeted by name in any automated check, which is the second
cost — it defeats exactly the kind of test that would catch a regression here.

**🛑 It also cost me two false findings, which is the strongest argument for
fixing it.** Because the trigger is unnameable I concluded, twice and with
evidence, that there was no filter control at all — first on mobile, then
"nowhere in the document" after enumerating 269 interactive elements at 1440px.
Both were wrong, and both were only caught by *reading a screenshot*. An
unlabelled control on the primary catalogue page is a trap for every future
tester, human or otherwise.

**Fix:** `aria-label="Filters"` on that button (and ideally
`aria-expanded`/`aria-controls` pointing at the panel). One attribute. A gap
case should assert the toolbar has no unnamed icon buttons, which generalises
past this one control.

## 10. `/products` filter panel is an OVERLAY, not a reflowing sidebar → **the case's premise, not the code, is wrong**

`checklist-buying-browsing-search-grid-follows-sidebar-not-viewport` (batch 31)
expects that opening the desktop filter sidebar "drops ONE column and keeps the
card width similar" — i.e. that the grid measures its container rather than the
viewport.

Measured: the panel opens as a **right-hand overlay** above the page. The grid
behind it is completely unchanged — 4 cards per row at 262px before and 4 at
262px after. No column is dropped because no reflow happens; the grid is simply
covered.

That is a coherent design choice, not a defect, and it means the case describes
a UI that does not exist. **Owed:** rewrite that case to assert what the overlay
should actually do (grid untouched, panel dismissible by Escape and by the X,
Apply re-queries) — or, if a reflowing sidebar is genuinely wanted, the case
should be re-scoped as a feature request rather than a regression check. Left
as is, it records a permanent false failure.

## 11. `shippingPaidBy` is set on NO product → the Free shipping toggle can only ever empty the grid

Found by `checklist-buying-browsing-search-free-shipping-toggle-actually-filters`
(batch 33), so it is owned by a case and is recorded here only because the fix
lands in **seed data** rather than in product code.

Measured on production: `/products` baseline 8 cards; clicking Free shipping
writes `?freeShipping=true&page=1` and the grid becomes **0 cards / "No products
found"**. Asking the API for 50 products returns `shippingPaidBy` **absent on
all 50** — tally `{"(absent)": 50}`. `grep -rn shippingPaidBy appkit/src/seed/`
returns **zero** hits.

**The query side is correct and was fixed deliberately.**
`products.repository.ts:670-675` registers `shippingPaidBy: { canFilter: true }`
with a comment recording Root Cause #62, where this same toggle was inert
because Sieve dropped the clause.

**Why this is worth its own entry.** #62's fix traced UI → params → route
safelist → clause builder → SIEVE_FIELDS and every link is right. Nobody asked
whether a single *document* carried the field. A filter is not reachable until
its data exists, and to a user an always-empty control is indistinguishable from
the inert one it replaced — so the regression test that case represents has been
passing against a filter that cannot match anything.

**Implied second-order effect, not separately verified:** the detail pages derive
their "Free shipping" badge from the same field
(`AuctionDetailPageView.tsx:367-368`, `PreOrderDetailPageView.tsx:477-478`), so
that badge can never render either.

**Fix:** set `shippingPaidBy` on a subset of seeded products — some `"seller"`
(free shipping) and some `"buyer"` — so the toggle has rows to match, the badge
has something to show, and both the positive and negative sides of the filter
are testable. A nonsense-control pairing (toggle on → fewer but non-zero; toggle
off → all) is what would have caught this.

## Seller product cards are unreadable at 375px — titles overlapped by row actions

Found while driving `buying/browsing-search--seller` (batch 35). Not what that
case asks, so recorded here rather than chased.

`/store/products` at 375px renders each product card with its Edit / Duplicate /
Delete buttons **on top of** the product title and price. Of four visible cards,
the surviving title text is `s`, `s`, `Order` and `a` — the rest is covered. The
row is a flex row that does not wrap at mobile width, so the action cluster
claims the space the title needs.

Evidence: `tester/.tester-runs/run-3/shots/toolbar-collapsed-before.png`.

A seller on a phone cannot tell which listing they are about to delete. Likely
the same family as Root Cause #29 — a caller's sizing utility not reaching the
element that is actually the flex child.

## Two bulk-action bars render at once on `/store/products`

Same batch, same page, verified by walking ancestors so a nested element cannot
double-count: one inline at `y=350` under the availability tabs, one at `y=672`
above the bottom nav. Both read `1 selected / Print Labels / Apply`.

One of the two is presumably meant to be the mobile presentation of the other.
Recorded with the toolbar defect it was found beside, but it is a separate
question — which of them is intended.

## Seller bulk actions offer only Print Labels and Set Location

Same page. The bulk-action listbox has exactly two options. No Delete, no
Publish, no Archive — although every row carries inline Edit / Duplicate /
Delete. Worth confirming against `SELLER_BULK_ACTIONS` whether that preset is
being passed at all on this surface, since CLAUDE.md Rule #7 requires the bar's
actions to come from it.

## Case defect: `product-filter-status-labels` targets a facet `/products` cannot render

Found in batch 36. Recorded as `null` (step 4 unperformable) rather than a
product defect, because source proves the facet is unreachable there by design:
`ProductFilters.tsx` gates it on `shouldShowStatus`, and **no caller anywhere
passes `showStatus`** to that component.

**Repoint the case at `/admin/products`**, whose drawer genuinely has a STATUS
section — verified, not assumed: `All / Pending / Published / Draft / Archived`,
all readable. Two edits needed when it is repointed:

- `startPage` → `/admin/products`
- `expectedUiState` should quote **`Pending`**, not `In Review` — the admin chip
  is labelled "Pending" even though the stored value is `in_review`
  (Root Cause #33 fixed the *id*, not the label)

Its anti-regression half is currently satisfied on both surfaces: 0
`MISSING_MESSAGE`, 0 raw-key-shaped strings.

## `/admin/products` shows "Unknown seller" — but `/admin/featured` resolves the same products

**Sharpened in batch 38.** The earlier entry below recorded the symptom. The
decisive comparison is that two admin listings render the SAME product
differently:

| listing | row subtitle for `Beyblade X Glow-in-the-Dark Sticker Pack` |
|---|---|
| `/admin/products` | `Unknown seller · No SKU` |
| `/admin/featured`  | `Beyblade Arena · ₹229` |

So the seller and price are resolvable — `/admin/featured` resolves them for 15
of its 16 rows, and shows a price on every one. `/admin/products` resolves
neither for any seeded row. This is a row-mapper gap in one listing, not missing
data, which makes it cheap to fix and easy to localise: diff the two views'
`mapRows`.

(One `/admin/featured` row does read `Unknown store` — `Beyblade Original
Remaster Set — Announced` — so that listing is not perfect either, but 15/16
against 0/41 is the contrast that matters.)

## `/admin/products` shows "Unknown seller" on seeded catalogue rows

Same batch. Of the six rows visible on page 1, four read **`Unknown seller`** —
including `Beyblade X BX-08 Booster`, `Beyblade Burst Xcalius X2` and both video-
demo fixtures. The two that resolve correctly (`Tyson Granger`) are QA listings
created through the UI during this run.

So the seeded products — which all belong to `store-beyblade-arena`, owner
`user-tyson-blader` — are the ones failing to resolve a seller name, while
UI-created ones succeed. That inversion is the useful clue.

Same family as the offers list reading "Unknown buyer" for all 13 rows (batch 27,
fixed): a denormalised display name that no write path populates. Evidence:
`tester/.tester-runs/run-3/shots/admin-products-status.png`.

## `/admin/products` renders status as a lowercase raw enum

Same screenshot. The per-row status badge reads `published` / `draft` in
lowercase, rather than the `Published` / `Draft` labels its own filter drawer
uses for the identical values. Cosmetic, but the drawer and the rows disagree
about how to spell the same thing.

## 🛑 `/admin/products` unfiltered Available list under-reports by 14 rows

Found in batch 37 while cross-checking the type chips. No case in that batch
asserts this, so it is recorded here rather than chased — but it is the most
consequential thing the batch turned up.

**Measured.** The unfiltered Available listing reaches **41** products (25 + 16
across exactly 2 pages, identical at `pageSize=25` and `pageSize=100`, and
confirmed by three independent row counts). The nine per-type chips, each run in
that same Available scope, sum to **55**:

| chip | rows | | chip | rows |
|---|---|---|---|---|
| Products | 12 | | Digital Codes | 6 |
| Auctions | 7 | | Live Items | 3 |
| Pre-orders | 5 | | Art | 5 |
| Prize Draws | 5 | | Stickers | 5 |
| Classifieds | 7 | | **total** | **55** |

**Named, not just arithmetic.** The prize-draw chip returns 5; only 3 appear in
the unfiltered list. The two that do not appear anywhere across either page are
**`Beyblade Champion's Draw — Prize Draw`** and **`Beyblade Mystery Box — Prize
Draw`**. Both are published and available. An admin paging the default listing
cannot reach them, and the pager stops at 2 pages as though that is everything.

**Mechanism, consistent with CLAUDE.md's own description.** "Available" is
negation-shaped and cannot be expressed as a query, so it is a per-row predicate
over ONE bounded window. A mixed window of ~50 raw documents yields 41
survivors; a type-scoped window of ~50 documents *of that type* yields more per
type. So the unfiltered count is a **floor**, not a total.

**The precise defect is where truncation is judged.** CLAUDE.md requires that a
saturated bounded fetch set `truncated`, render `total` as "50+", and make
`totalPages` be `page + 1` so the pager offers Next. Here nothing looks saturated
because the post-predicate count (41) is below the cap — the saturation happened
to the **raw window** before the predicate ran. Truncation has to be judged on
the raw fetch size, not on what survives filtering.

Not verified: whether the same shortfall affects the public `/products`
listing, which shares `listPublicProducts`. It is the obvious next question.

## Second, independent confirmation of the Available under-report

Batch 38. `Beyblade Mystery Box — Prize Draw` — one of the two products named in
the entry above as unreachable by paging `/admin/products` — **does** appear in
`/admin/deals`, which lists the 6 promoted products. So the document exists, is
published, is promoted, and is reachable from two other admin surfaces while
being absent from the one listing meant to hold everything.

That rules out "the product is in some odd state" and leaves the bounded-window
truncation as the explanation.

## `/admin/art` is headed "Art & Stickers" but holds art only

Batch 38. The page renders 5 rows, all genuinely art prints and posters, and
none of the 5 sticker listings — while its heading reads `Art & Stickers`. The
sidebar carries a separate `Stickers` entry, so the filter is probably right and
the heading wrong. Cosmetic, but it makes the page look like it is dropping half
its contents.

## `/store/digital-codes` list rows have NO TITLE at all

Batch 39. Every row on the seller's own digital-code listing renders exactly 13
characters of text: a 🔑 emoji, an empty line, and a status badge. Measured on
all 6 rows — no title, no link, no `img alt`, nothing identifying. At 1280px
desktop, not a clipping artifact.

The row menu offers **Edit** and **Delete**, so a seller can delete a listing
they cannot identify.

**The data is available** — the editor's header shows
`Beyblade X Regional Tournament — Digital Entry Pass` for the same record, and
the Edit action navigates to a slug-bearing URL. So this is the row mapper, the
same class as the `/admin/products` "Unknown seller" gap: one view resolves the
field, another drops it.

Evidence: `tester/.tester-runs/run-3/shots/store-digital-codes.png`.

## Two fixture notes from batch 39

- `digitalcode-beyblade-x-manual-tournament-pass` now holds **3 `TEST-` codes**
  added while proving the pool-read defect, and its pool read 500s as a result.
  It cannot be cleaned through the UI (no rows render, so no Remove is
  reachable); reseeding `products` is the only cleanup.
- An RSC prefetch 404s on every digital-code editor visit:
  `/store/digital-codes/{slug}?_rsc=…` → 404. There is no detail route at that
  path, only `/edit`, so something is prefetching a page that does not exist.
  Harmless today, but it is one 404 per row hover.

## Reveal button offered on an unpaid order, then says "Please try again"

Batch 40. `/user/digital-codes` shows a **Reveal Code** button for a COD order
whose payment is not yet confirmed. Pressing it renders:

> Could not retrieve your code. Please try again.

The server had supplied an accurate, actionable reason —
`400 VALIDATION_FAILED "Code is only available after payment is confirmed"` —
and it is discarded in favour of advice that can never succeed until payment
clears.

CLAUDE.md Rule #9.6 requires a server code be mapped through `toUserMessage`
rather than replaced with a generic fallback. Either hide the button until
payment is confirmed, or say why it is unavailable.

## Six seeded digital-code listings advertise codes that do not exist

Batch 40, and independent of any payment question. `Beyblade Burst App — Avatar
Skin Bundle Code` renders **"41 available"** on its public page while its own
pool endpoint returns `200 {entries: []}` — an empty subcollection.

**The two surfaces contradict each other on screen, for the same listing.**
Batch 41 read the seller's own editor for `burst-app-avatar-skins`: it shows
**"0 available · 0 already delivered · Nothing in the pool yet."** The public
buyer page for that same listing shows **"41 available."** The editor reads the
real subcollection; the public page reads the stale `codesAvailable`. That is the
clearest single statement of this defect and the quickest way to confirm it.

`recountPool()` demonstrably works: on the listing where I added 3 codes it set
both `codesAvailable` and `codePoolSize` to a true 3. But it only runs on
add / remove / claim, so the six untouched seeded listings still carry the
number the seed typed. `codePoolSize` vs the real pool:

| listing | codePoolSize | codesAvailable | real entries |
|---|---|---|---|
| burst-app-avatar-skins | 60 | 41 | 0 |
| x-app-launch-codes-depleted | 30 | 0 | 0 |
| x-manual-tournament-pass (touched) | 3 | 3 | 3 |

Add to Cart and Buy Now are both enabled on the 41-advertised listing. The fix
belongs in the seed (write real pool entries, or seed the counters to 0), not in
the query.

## "Pay via UPI / Cash" is disabled on a digital-code cart — reason unknown

Batch 40. At checkout step 3 with a digital-code item in the cart, the manual
payment button is **disabled** and Cash on Delivery is the only enabled method.

That matters more than it looks: the manual lane's proof upload is what
*confirms* payment, and the code reveal is gated on confirmed payment. If UPI is
unavailable for digital-code carts, there may be no route by which a buyer can
reach a revealable code at all.

Not diagnosed — it could be the digital item, a cart-composition rule, or an
unconfigured UPI VPA in Site Settings. Worth answering before re-running
`buy-then-reveal-code`, which is otherwise untestable.

## Checkout address card is mouse-only

Batch 40. The saved-address card on checkout step 1 is a `<div>` with an
`onclick` and `cursor: pointer`, carrying **no `role` and no `tabindex`** and no
radio inside it. Continue stays disabled until it is clicked, so a keyboard-only
buyer cannot select an address and cannot check out.

Also worth noting for testers: clicking the inner `<p>` did not select it; only
clicking the handler `<div>` did.

## Fixture state left behind by batch 40

Order **`order-2-20260930-qzh331`** (COD, ₹1,148, two lines — a standard product
and the avatar-skin digital code) exists against the buyer account. `orders` is
CASCADE-tier so a run teardown removes it; no action needed, recorded so nobody
is surprised by it.

## Sticky bar's wishlist control does not seed its saved state on load

Batch 46. Clicking the wishlist control in the sticky bar works — the label goes
`Wishlist` → `Saved` and `/wishlist` confirms "1 saved item". But after a **full
reload** of the same product page, the bar's control reads `Wishlist` again
while the item is still in the wishlist.

**I separated the two possible causes before recording this**, because they are
very different bugs: a failed write, versus a write that succeeded with a
control that does not reflect it. `/wishlist` shows
`product-beyblade-burst-valkyrie` present, so the write is fine — the bar simply
does not seed from the server on mount.

Consequence: a returning buyer is invited to save an item they have already
saved, and pressing it again either toggles it off or re-adds it. Not verified
which. Not asserted by any case in this batch.

## Case data: `desktop-buttons-work` expects ₹1,899.00, fixture is ₹999.00

Same batch. The case asserts `/cart` holds "Beyblade Burst Valkyrie" at
**₹1,899.00**. The listing page, the sticky bar and the cart line all read
**₹999.00** — three independent surfaces agreeing, so the product is
self-consistent and the case's figure is stale.

The name is ambiguous in this catalogue, which may be the origin: there is a
separate `Beyblade Burst Valkyrie — Holographic Art Print (Limited /100)` at
₹1,299.00. Neither is ₹1,899.00.

Update the case to ₹999.00 (and ideally to the unambiguous title
`Beyblade Burst B-01 Valkyrie`).

## 🛑 DECISION NEEDED: `account-auth/profile-settings` is unrunnable as written

Batch 47. **All 8 cases on this page mutate a `users` document**, and `users` is
in the frozen `PRESERVE` list in `tester/scripts/lib/collections.mjs` — *"never
touched. Real accounts, their logins, their saved addresses"*. The batch skill
is equally plain: *"never delete or modify a user account, a login, a saved
address, or Site Settings — damage there is the only permanent damage you can
do."*

Nothing restores a `users` document: `appkit-seed load` is a merge write that
cannot remove a field, and the collection is never wiped. **An edit here is
permanent.**

So 7 of 8 were recorded `null` on the rule, and the 8th only to step 10.

### The damage is not hypothetical — a previous run already did it

`rehan.sheikh@gmail.com`'s display name, read off `/user/profile` today, is:

```
QA Profile account-auth-profile-settings-edit-profile
```

That is character-for-character the `inputs.displayName` of the `edit-profile`
case on this page. An earlier run performed it and never restored the persona's
name; it has survived every reseed since, and the public profile `h1` renders it.

It also makes sibling cases self-inconsistent: `avatar-upload` expects to
replace *"the round initial-letter placeholder (R for Rehan)"* — the initial is
now **Q**.

(One point in the catalogue's favour: `/user/profile` reads
`Profile visibility: Public`, so if `public-profile-toggle` was ever run, its
restore step did work.)

### The password case is in a different class again

`password-change-reset-link` changes the real Auth password on
`karthik.new@gmail.com` and relies on a later step to set it back. CLAUDE.md:
`appkit-seed` sets `TempPass123!` **only when it creates an Auth record** and
*"never resets an existing password"*. An interruption between its step 8 and
step 11 — a rate limit, a mail delay, a context boundary — locks that account
out of **every future run**, recoverable only by a manual Firebase reset.

It also needs a sign-out/sign-in round trip, which hits the forbidden
`/api/auth/login|session|me` (one shared 10-req/min IP bucket).

### Three ways out, for the user to choose

1. **A throwaway identity outside the PRESERVE tier** — e.g. a
   `user-qa-mutable` persona in a new `testUsers` collection classified
   `SEED_OWNED`, with these cases repointed at it. Highest value, most work.
2. **Harness-performed restore** — capture the document before, write it back
   after, and fail loudly if the restore fails. Keeps the cases on the real
   persona; still leaves a window.
3. **Reclassify these 8 as `requiresHumanChannel`** — a human on a disposable
   account. Cheapest, and honest about what the automation may not touch.

Worth doing either way: **restore `rehan.sheikh@gmail.com`'s display name**, so
the next run does not inherit a persona named after a test case.

The read-only half of `password-change-reset-link` is worth salvaging
independently — `passwordFieldsOnSettingsPage: 0` is the regression guard for
Root Cause #46/#55 and needs no mutation at all, only the karthik identity.

## Store header stat reads "1 products" where the tab says 14

Batch 50. `/stores/store-beyblade-arena` renders a header stat line reading
**"1 products · 74 reviews"**, while the listing-type select's selected option
reads **"Products (14)"**. The reviews figure matches its tab exactly (74/74);
the products figure does not.

**I ruled out the innocent explanation first.** 14-vs-12-rendered is benign —
the tab count is an unscoped total while the default view is the Available
scope, proven on the Auctions tab (tab says 9, Available renders 7, All renders
exactly 9). So "1" is not a scope artifact; it is wrong. It is also
ungrammatical.

Same family as the stale category counters in batch 42: a denormalised store
stat with nothing keeping it current.

Inconsistent between stores too: `/stores/store-letitrip-official` shows
**"5 reviews"** and no product figure at all.

## Store tab counts are unscoped while the list is scoped

Same batch, recorded separately because it is a design question rather than a
bug. Every type tab's count exceeds its rendered list by exactly the number of
unavailable items: Auctions (9) → 7 under the default Available scope, and 9
under All. Same for Pre-Orders (7→5), Digital Codes (8→6), Art & Stickers
(12→10).

So the count and the list answer different questions while sitting side by side
— the same "two kinds of number, identical styling" shape as the category chips
in batch 42. Either scope the counts, or label them as totals.

---

# Milestone-2 decisions (batch 50) — every entry added since batch 36

Per the fix-phase rule: each entry gets a verdict, not another read. Format is
**PROMOTE** (becomes a gap case), **FIX** (queued into a named fix session),
**LEFT STANDING** (real, recorded, not chased), or **CASE FIX** (the catalogue
is wrong, not the product).

| # | Entry | Decision |
|---|---|---|
| 12 | Seller product cards unreadable at 375px | **FIX** — mobile layout; batch with the other appkit UI fixes |
| 13 | Two bulk-action bars on `/store/products` | **FIX** — same session as 12; decide which bar is intended first |
| 14 | Seller bulk actions offer only Print Labels / Set Location | **PROMOTE** — assert `SELLER_BULK_ACTIONS` is actually passed (Rule #7) |
| 15 | `product-filter-status-labels` targets an unrenderable facet | **CASE FIX** — repoint to `/admin/products`, quote "Pending" |
| 16 | `/admin/products` "Unknown seller" vs `/admin/featured` resolving it | **FIX** — highest-value of this group: one row mapper diff, data proven present |
| 17 | `/admin/products` lowercase raw enum status | **LEFT STANDING** — cosmetic; fold into 16 if touching that view |
| 18 | 🛑 Available list under-reports by 14 rows | **FIX** — severe; truncation judged post-predicate instead of on the raw window |
| 19 | Independent confirmation of 18 | merged into 18 |
| 20 | `/admin/art` headed "Art & Stickers", holds art only | **LEFT STANDING** — heading copy |
| 21 | `/store/digital-codes` rows have NO title | **FIX** — a seller can Delete a listing they cannot identify |
| 22 | Batch-39 fixture notes | **LEFT STANDING** — informational; reseed clears |
| 23 | Reveal button on an unpaid order says "Please try again" | **FIX** — Rule #9.6, map through `toUserMessage` |
| 24 | Six digital-code listings advertise codes that do not exist | **FIX (SEED)** — write real pool entries or seed the counters to 0 |
| 25 | "Pay via UPI / Cash" disabled on a digital-code cart | **NEEDS DIAGNOSIS** — may make the reveal unreachable by any route; answer before re-running `buy-then-reveal-code` |
| 26 | Checkout address card is mouse-only | **PROMOTE** — a11y; keyboard-only buyer cannot check out |
| 27 | Batch-40 fixture state (`order-2-…`) | **LEFT STANDING** — CASCADE tier, teardown removes it |
| 28 | Sticky bar wishlist does not seed saved state | **FIX** — batch with 12/13 |
| 29 | `desktop-buttons-work` expects ₹1,899 | **CASE FIX** — set ₹999.00 and the unambiguous title |
| 30 | 🛑 `profile-settings` unrunnable (PRESERVE tier) | **NEEDS A HUMAN DECISION** — three options written up at that entry; blocks 7 cases permanently |
| 31 | Store header "1 products" vs tab 14 | **FIX** — same denormalised-counter family as the category metrics |
| 32 | Store tab counts unscoped while the list is scoped | **LEFT STANDING** — design question: scope the counts or label them totals |

## What shipped at this milestone, and what did not

**Shipped** (appkit 4.42.3 + `node scripts/deploy.mjs`, all smoke and SEO
checks green): the admin support queue, the buyer support list, ticket creation
and reply, offer buyer-identity masking, the direction-aware relative dates, the
self-offer server guard, and the non-standard-listing redirect with its
JSON-LD canonical.

**Re-driven against production and confirmed passing**: the admin queue (6 rows
where it showed none), offers (`Unknown buyer` 13 → 0, properly masked), and the
self-offer guard (Make Offer absent for the owning seller).

**Not fixed, and honestly so.** The twelve `deferred-to-milestone` ledger
entries are diagnosed to a file and line with evidence, and nearly all are
`appkit/` changes — the digital-code pool 500, the sold live-item purchase path,
the brand page listing zero products, the category metrics, `StickyToolbar`'s
missing `forceExpanded`. Batching them into one publish is strictly better than
spending a publish cycle per fix, so they are queued for a dedicated fix session
rather than half-started here. Each already carries its own `nextStep`.

## PIN-code error renders without `aria-invalid` on the field

Batch 52. On `/user/addresses/new`, submitting `abcdef` as the PIN correctly
renders *"That is not a valid PIN code for India."* directly under the field and
inside a `role="alert"` — but the input's **`aria-invalid` is `null`**.

CLAUDE.md Rule #9.4 states that `FieldInput` wires `aria-invalid` **and** the
error `<Text role="alert">` block together. Here only the alert half is wired,
so a screen-reader user hears the message while the field itself is not marked
invalid.

Not this case's claim — it asserts *where* the error appears, and that passes —
so recorded rather than failed. Worth checking whether the gap is in
`FieldInput` itself or in how this form mounts it, since the former would affect
every form in the app.

## `addresses/postal-validation` — 2 of 3 cases blocked by the PRESERVE tier

Same shape as the `profile-settings` entry above, one collection over.
`country-decides-the-rule` and `unknown-country-never-blocks` both have
expectedData requiring codes to **save** (`canadaAccepted: true`,
`bothCodesAccepted: true`), and `addresses` is in the frozen PRESERVE list.

Unlike the profile batch, the third case IS runnable and passes — its whole
purpose is that nothing persists (`saved: false`), which I confirmed by
instrumenting `window.fetch` and seeing zero address requests after Save.

**This strengthens the throwaway-account case.** The same fix unblocks both
pages: a mutable identity outside the PRESERVE tier would make 2 more cases
here and 7 on `profile-settings` runnable — 9 cases from one decision.

Verified without writing, so a permitted run is quick: the country control
exists (a button reading "India ▾" with a `Country *` label) and a separate
`State / region *` picker exists. The blocker is policy, not a missing control.

## `contactSubmissions` is UNCLASSIFIED — tester rows accumulate forever

Batch 53. `contactSubmissions` appears nowhere in
`tester/scripts/lib/collections.mjs`, so it is **preserved by default** —
`assertDeletable` throws on it and teardown never touches it.

The consequence is visible right now: `/admin/contact` holds two rows, both test
data. Mine from this batch, and **`QA checklist probe` / `QA Tester ·
qa.probe@example.com` dated 16 Sept 2026** from an earlier run. Every run that
exercises the contact form adds one permanently.

`audit-tester-plugin-wiring`'s R1 exists to catch exactly this gap — a
collection the harness writes to but never classifies. Classify it
`SEED_OWNED` (there is no real customer mail to protect in this project yet) or
`CASCADE`, and the accumulation stops.

Note this is the same mechanism that put three QA-created entities in the public
sitemap (batch 51) — UI-created rows carry no `isTestData` marker, so nothing
downstream can filter them.

## Dark-mode: "Pre-order now" pill is pale-on-pale (contrast 1.63)

Found while measuring `design-ux/status-badge-legibility--guest`; **no case covers it**
(the listing-type cases name the 8 type badges, and this is an availability pill).

`/pre-orders?availability=all`, dark theme, signed out. 4 instances visible.

- class: `bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300`
- computed text  -> `lab(74.02 8.54 -41.61)` = **indigo-300** — dark variant **applied**
- computed bg    -> `lab(91.66 1.05 -12.72)` = **indigo-100** — dark variant **NOT applied**
- contrast **1.63** — pill shape clearly visible, text essentially not

So the pair split: `dark:text-*` won, `dark:bg-*` lost. That is Root Cause #79's
mechanism — with `important: true` in both Tailwind configs the two `bg` rules tie on
specificity *and* on `!important`, so **build-time emission order** decides, and the
opacity-modified `bg-indigo-900/40` loses to the plain `bg-indigo-100`.

Per CLAUDE.md the fix is to **remove the light class** and use one theme-inverting
token — never to add another `dark:` variant, which cannot break the tie.

Screenshot: `tester/.tester-runs/run-3/shots/badge-dark-preorder-now.png`

## Store reviews search: the placeholder describes the opposite of what it does

Found while running `content-discovery/store-reviews-aggregate`; **no case covers it**
(the case that found it asserts body-text search, which works).

`/stores/store-beyblade-arena/reviews`, signed out. Input placeholder:

> **"Search reviews by product name..."**

Measured against the same 12-card list:

| query | kind | cards |
|---|---|---|
| *(none)* | — | 12 |
| `genuine` | **body text** of card 1, absent from its title | **1** |
| `Valkyrie` | **product name** — real item in this store's catalogue | **0** |
| `zzzznope` | nonsense control | 0 + empty state |

So the box searches **body text** (which the placeholder never mentions) and appears
**not** to search **product names** (the only thing it promises). A user who follows
the on-screen instruction gets an empty list.

Not excluded: that no review in this store is attached to the Valkyrie product, which
would make the 0 correct and the placeholder merely unverified. One query settles it.

Screenshot: `tester/.tester-runs/run-3/shots/store-reviews-74.png`

## `money-flows/payment-methods` names a buyer the harness cannot be

All 11 cases on this page begin "Sign in as the buyer **ash@pokemonpalace.in**".
The harness resolves exactly one buyer — `TESTER_BUYER_EMAIL=rehan.sheikh@gmail.com`
(`tester/.env`, required by `fetch-cases.mjs:69`) — and there are four session files
only: admin / buyer / guest / seller.

**Not a dangling reference.** I suspected Root Cause #26 (a persona left behind when
the catalogue was narrowed to Beyblade) because of the `pokemonpalace.in` domain, and
checked: `ash@pokemonpalace.in` is genuinely seeded at
`appkit/src/seed/users-seed-data.ts:140`. Several seeded personas keep old-franchise
domains (`priya@cardgamehub.in`, `megumi@tokyotoys.in`, `amuro@gundamgalaxy.in`) — the
*users* were kept when the *catalogue* was narrowed.

So the cases are runnable **by substitution**, with one caveat worth stating before
someone does it blindly: `coupon-applies-and-persists` applies **ARENA25**, and coupon
limits are per-user (`perUserLimit`), so a substituted buyer's redemption history is
not the one the case was written against.

**The cheap fix** is to re-point these 11 cases at `rehan.sheikh@gmail.com`, or to add
an `ash` session to the harness. Either makes the page runnable as written.

## Buyer's order detail renders the delivery address as a raw document ID

Found while running `money-flows/payment-methods`; **no case covers it**.

`/user/orders/view/order-1-20260729-cash01`, signed in as the buyer who owns it.
The Delivery Address block reads, in full:

```
Delivery Address
addr-yugi-home
India
```

No name, no street, no city, no PIN — just the address document's **id** and the
country. The buyer cannot confirm where their own order is going.

Same family as Root Cause #52 (a list row showing `Order {guid}` instead of the
denormalised item data sitting on the same document): the id is being rendered where
the resolved record should be. `OrderDocument.shippingAddress` carries fullName /
phone / addressLine1 / city / postalCode, so the data exists — it is the resolution
or the renderer that is missing, not the record.

Two things noted honestly: I saw this on **one** order, not a sweep, so I do not know
whether it affects every order or only ones whose address was seeded by id. And my
first automated check reported `hasStreetish: true` — a false positive, matching the
digits of `₹1,799.00` inside the scan window rather than any street.

Screenshot: `tester/.tester-runs/run-3/shots/order-cash01-address.png`
# The State / region picker's trigger is an unlabelled chevron

Found while running `addresses/state-picker`. The case it came from **passes** on its
own assertion (36 India options), so no case covers this.

`/user/addresses/new`. The two adjacent controls render very differently:

| field | trigger's visible text |
|---|---|
| `Country *` | `India ▾` |
| `State / region *` | `▾` |

No selected value, no placeholder — the entire button is a chevron. The
`State / region *` label sits **outside** the button, so the control itself reads as
decoration.

It is also why an automated search for the control fails: looking for a trigger whose
text contains "State" or "region" finds nothing, which is how I initially concluded the
picker was absent from this form altogether. A human scanning the form has a milder
version of the same problem.

**Cheap fix**: give it a placeholder (`Select a state…`), matching how `Country` shows
its current value.

Screenshot: `tester/.tester-runs/run-3/shots/state-picker-36.png`

## Store search cannot find Beyblade Arena — one of two stores is absent from the index

Found while running `public-pages/stores-sellers-directories--p1`; **no case in that
batch asserts store search**, and the case it came from passes on its own claim.

`/stores`, signed out, measured on served HTML (distinct `/stores/{slug}` links):

| query | stores found |
|---|---|
| *(none)* | 2 — `store-beyblade-arena`, `store-letitrip-official` |
| `official` | 1 — `store-letitrip-official` |
| `LetItRip` | 1 — `store-letitrip-official` |
| `a` (single letter) | 1 — `store-letitrip-official` |
| `Beyblade` | **0** |
| `Arena` | **0** |
| `arena` | **0** |
| `Beyblade Arena` | **0** |
| `bey` | **0** |

`GET /api/stores?q=Arena` agrees: **200** with `items: 0`.

**The search plumbing is not the fault.** Root Cause #99 records `StoresIndexPageView`
never reading `q` at all; that is fixed — `official` and `LetItRip` filter correctly and
`zzzznope` returns 0. The defect is that **`store-beyblade-arena` matches nothing**, not
even its own exact name.

**The single-letter probe is the tell.** `q=a` returns only `store-letitrip-official`.
Both store names contain an "a", so a substring or token search over a populated field
would match both. One matching means only one store **has** the searched field populated
— pointing at a missing or empty `searchTxt`/token field on `store-beyblade-arena`
rather than at the query logic.

Worth noting this is the store with essentially all the content: 14 products, 9 auctions,
7 pre-orders, 74 reviews. A buyer searching the store directory for it finds nothing.

Screenshot: `tester/.tester-runs/run-3/shots/stores-arena-not-found.png`

## Filter trigger on listing pages has no accessible name
Found while performing step 3 of `cta-layout/dialog-footers--guest` →
`filter-drawer-footer-stacks-when-narrow` (that case's own assertion passes).

At 320px, `/products` collapses its toolbar behind a **"Show Toolbar"** button. Once
expanded, the filter trigger is an **icon-only 38×30 button** with empty `innerText`,
**no `aria-label`, no `title`, and no `<title>` inside its SVG** — its only identity is
`class="lucide lucide-sliders-horizontal"`. The case's step says "Click 'Filters'"; no
element on the page is named that.

- **Unnamed to assistive tech.** A screen reader announces an unlabelled button.
- **Invisible to name-based queries.** Two scans over `innerText` + `aria-label` across
  every `button`, `a` and `[role="button"]` returned **0 candidates** on a page that has
  one. Located only by enumerating the toolbar's controls positionally.
- **38×30 is under the 44px touch target**, on the one viewport width where it matters most.

Same shape as the missing `role="alertdialog"` on the bundle delete modal
(`cta-layout/dialog-footers--admin`): an unnamed control that produced a false negative
in the harness's own measurement before it could produce one in a user's.

FIX: give the trigger an `aria-label` (e.g. "Filters"); consider `IconButton size="touch"`.

## Classified detail page duplicates the brand in its <title>
Noticed while performing `money-flows/blockers` → `classified-has-no-cart`
(that case's assertion passes).

`/classified/classified-beyblade-stadium-set` serves:

    Used Beyblade Stadium Set — Local Pickup Only — LetItRip | LetItRip

The brand suffix is appended twice — once by the page's own title builder (which
already ends `— LetItRip`) and again by a template applying `| LetItRip`. Visible in
the browser tab and in SERP results.

FIX: the per-page builder should emit the bare listing title and let the template add
the brand once, as the other detail families do.

## Bundle member picker advertises slug search but only matches titles
Found while performing step 4 of `money-flows/blockers--admin` →
`cross-store-group-refused` (the case instructs adding members *by slug*).

The picker's own placeholder reads **"Type title or slug…"**. Searching the slug
`product-beyblade-burst-valkyrie` returns **"No results"**, after waiting out the
debounce. Searching the title `Valkyrie` returns 2 matches including that same
product ("Beyblade Burst B-01 Valkyrie"). Same for the other two members.

An admin following a slug from the catalogue or a tracker — the normal way one
identifies a specific listing — is told it does not exist.

FIX: either match `slug` alongside `title` in the picker's query, or correct the
placeholder to "Type a title…".

## Bundle editor renders a developer placeholder as admin copy
Seen on `/admin/bundles/{slug}/edit` and `/admin/bundles/new`:

    Provide a renderer for "coverImage" — this field needs a cus…

Visible UI copy addressed to a developer. (First noted in
`cta-layout/dialog-footers--admin`; repeated here as it is on the create form too.)

## FIX (seeding gap): no seeded account has `disabled: true`
Found by `money-flows/blockers--guest` → `banned-account-blocked`, which is
untestable without one.

Measured: across the 19 seeded users, `disabled: true` occurs **0** times and
`disabled: false` **19** times. A grep of `appkit/src/seed/` and
`appkit/src/features/tester/seed-data/` finds the string only in a prose comment at
`authored/admin__bans-and-trust.ts:28`.

So every case about a disabled/banned login is unrunnable, because producing one
means disabling a **real** account — a write to the PRESERVE-tier `users` collection
and its Firebase Auth record, which no reseed undoes.

FIX: seed one dedicated disabled persona (e.g. `user-qa-disabled`, `disabled: true`).
That also unblocks the soft-ban cases declined elsewhere in this run. Same shape as
Root Cause #90 — a case reports "nothing here" because the catalogue never seeded its
fixture, not because the feature is broken.

## FIX: `createEvent` bypasses the repository write hooks — two defects, one line
Found while performing `page-wiring/reachability--admin` →
`lottery-can-be-created-without-seeding` (which creates an event through the UI).

[events.repository.ts:194](appkit/src/features/events/repository/events.repository.ts#L194)
calls `this.getCollection().add(data)` **directly**, so it never runs `this.create()`,
never runs `applyWriteHooks`, and never uses `createWithId(slug)`. Consequences:

1. **A UI-created event is invisible to admin event search, permanently.** `list()`
   filters on `where(SEARCH_TXT, "array-contains", head)`, and `SEARCH_TXT` is written
   by the `buildSearchTxtFor` hook that never fires. Measured: searching `QA Event`
   and `seeding` (7 letters — rules out short-token truncation) both return
   "No events found" while the event is in the unfiltered list; control `Beyblade`
   returns the seeded events.
2. **Its document id is a Firestore auto-id** (`SJHlHFAs5BHMLQwH8MdM`) while every
   seeded event uses its slug (`event-pokemon-number-draw-july-2026`). CLAUDE.md's
   slug table lists events under "Pure slugs (`id === slug`)". The public URL becomes
   `/lottery/SJHlHFAs5BHMLQwH8MdM`, and any lookup by slug misses it.

Root Cause #9's shape in a new spelling. Note the hook's own docstring claims it is
"derived on every write path via `applyWriteHooks`" — it is not derived on this one,
and that comment is what would stop a reviewer looking.

FIX: route `createEvent` through `this.createWithId(slug, data)` (or `this.create()`),
so both the hook and the slug-as-id convention apply. Correct the docstring.

## The lottery creation case needs a publish step
`lottery-can-be-created-without-seeding` requires the public page to render "a pullable
grid" and slot 1 to become booked, but its steps never set the event's status and the
create form defaults to **draft**. A draft lottery correctly renders its slots
non-interactive, so the case as written can never reach its own last assertion.
FIX: add a publish step between steps 6 and 8.

## An admin event cannot be deleted (and its rows have no actions)
Found attempting the cleanup `lottery-can-be-created-without-seeding`'s `endResult`
requires ("Delete the event afterwards").

- `/admin/events/{id}/edit` renders "Edit Event" with **no delete control** (scanned
  every button and link for /delete/i).
- `/admin/events` rows have **no per-row controls whatsoever** — walking 5 levels up
  from a row's text reaches the page container, and the only controls found are the
  toolbar's (Search, Grid/List/Table view, Add Event, Hide Toolbar). No edit, no
  delete, no view action.

So an event created by mistake cannot be removed by an admin, and the list is a
Root Cause #56 instance (rows that can be seen but not acted on).

The event left behind is `SJHlHFAs5BHMLQwH8MdM` ("QA Event
lottery-created-without-seeding", draft, 3 slots). `events` is SEED_OWNED, so the
run's teardown wipes it; it is draft and therefore not live to buyers.

FIX: add a delete row action (with the `confirmation` config Rule #7 requires) and a
row-level detail affordance to the admin events list.

## The harness's seller session is not the seller the cases name
Found while performing `page-wiring/reachability--seller` — it nearly produced a false
"the seller product picker is broken" finding.

Seller cases are written against **`tyson@beybladearena.in`** (store-beyblade-arena,
whose catalogue is the Beyblade standard products). The harness's `session-seller.json`
signs in as a different seeded seller whose `/store/products` holds **prize draws** and
contains no Valkyrie and no Wizard Arrow.

Two things make this hard to notice:
- The profile chip reads **"Mock User 1"** — the *same* display name the admin session
  shows, so the account name cannot distinguish them.
- The symptom is a picker returning "No results" for slugs that resolve fine in the
  admin picker, which reads exactly like a broken seller-scoped search.

Any seller case naming specific product slugs is unrunnable as written.

FIX: point `session-seller.json` at `tyson@beybladearena.in`, or re-write the seller
cases against slugs the harness's actual seller owns. Also worth giving seeded accounts
distinct display names so the identity is readable off any page.

## 12 public pages serve the generic site title
Found while sweeping the chrome's 53 destinations in
`page-wiring/reachability--guest` → `public-nav-and-footer-resolve` (which passes).

These serve `LetItRip — India's Collectibles Marketplace` instead of a page-specific
`<title>`:

`/wishlist` · `/cart` · `/auth/login` · `/auth/register` · `/user/profile` ·
**`/classified`** · **`/digital-codes`** · **`/live`** · `/item-requests` · `/report` ·
`/user/become-seller` · `/store`

The three bolded ones are **public listing pages whose siblings all have real titles**
(`/products` → "Collectibles for Sale — LetItRip", `/auctions` → "Live Collectibles
Auctions — LetItRip"), so this is a browser-tab and SERP defect on indexable pages, not
only on gated ones. Note `/classified`, `/digital-codes` and `/live` are exactly the
three types whose only discovery path is the general catalogue (see CLAUDE.md
"inGeneralCatalogue"), which makes their SERP presence matter more, not less.

FIX: give each a `generateMetadata`/`metadata` title, as the sibling listing routes have.

## FIX: the bundle detail page declares canonical + og:url on the APEX host
Found while sweeping OG tags across 10 pages in `seo/og-images` →
`og-tags-present-and-absolute`.

`/bundles/bundle-every-generation-starter-pack` serves:

    <link rel="canonical" href="https://letitrip.in/bundles/bundle-every-generation-starter-pack">
    <meta property="og:url" content="https://letitrip.in/bundles/...">

Every other page checked (`/`, product, classified, digital-code, live, prize-draw,
both brands, store) uses **`https://www.letitrip.in/`**. The apex **308-redirects**
to www — verified by this session's own deploy SEO check — and the sitemap puts all
**209** URLs on www.

So the bundle page advertises itself at a URL that redirects, while the sitemap names
a different one. That is **Root Cause #81's exact shape** — two owners of the canonical
host — recurring on the bundles route, and `audit-seo-canonical-host.mjs` evidently
does not cover whatever this route uses to build its URL.

Note `og:url` and `canonical` *agree with each other* here, so the per-page assertion
passes; what fails is host consistency with the rest of the site.

FIX: derive the bundle route's URL from `SEO_CONFIG.siteUrl` like its siblings, and
extend the canonical-host audit to catch this construction.
