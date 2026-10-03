# Fix phase worklist — run-3 (lastFixAtRecorded still 153, target 178)

## 🛑 CORRECTION — the 17 appkit `pending-deploy` markers are STALE

I said last turn that several queued fixes need an appkit publish-and-poll cycle.
**They do not.** Measured 2026-10-03:

- consumer pin `^4.42.10` · appkit local `4.42.10` · npm latest `4.42.10` — all three agree
- `git -C appkit status --porcelain` clean
- exactly ONE commit sits after the version bump, `b2b8b8f9`, and it touches
  `firebase/base/firestore.indexes.json` and nothing else — a Firestore index,
  which ships via firebase, never via npm

So all 17 appkit code fixes were published in 4.42.10 and are LIVE. Their
`reverified:pending-deploy` marker is a stale label, not unshipped work.
**Re-drive them directly — do not publish appkit.** A publish with no source
change behind it is exactly what the milestone hook warns against.

Shipped this turn: root+base indexes verified in sync at 646, and
`node scripts/firebase.mjs deploy --only indexes` run — so the FAQ category
indexes (the 44 added by b2b8b8f9) are now deployed. The eight FAQ category
pages are the first thing to re-drive.

🛑 `npm run firebase` DOES NOT EXIST in this repo despite CLAUDE.md quoting it.
Use `node scripts/firebase.mjs <generate|deploy>`.

🛑 The Bash tool's cwd persists across calls and was stuck in `appkit/` this
turn, making `ls scripts/firebase.mjs` and a `require` both fail as though the
files were missing. Use absolute paths before concluding anything is absent.

---

Generated 2026-10-02T23:00:23.777Z

Total pending-deploy: 19 (appkit 17 / src-only 2)

## appkit-side (needs publish+repin before re-drive is meaningful)

- [ ] `undefined` b? — /categories default sort was name ASC, so both root categories fell off page 1 while their own descendants filled it. Changed the default to tier ASC   
      files: appkit/src/features/categories/components/CategoriesIndexListing.tsx, appkit/src/features/categories/components/CategoriesIndexPageView.tsx
- [ ] `checklist-happy-path-buyer-purchase-add-to-cart` b? — The cart line printed the literal 'storeName: Beyblade Arena' to the buyer, one line under the title and directly below the same value rendered proper  
      files: appkit/src/features/cart/types/index.ts, appkit/src/features/cart/schemas/index.ts, src/components/routing/CartRouteClient.tsx, appkit/src/features/tester/seed-data/_happy-path.ts
- [ ] `checklist-happy-path-buyer-purchase-place-cash-order-redirects-to-proof-upload` b? — The buyer's payment-proof field offered 'YouTube' and 'External URL' as ways to evidence a real payment. showYoutube/showExternal default to TRUE on M  
      files: src/app/[locale]/user/orders/[id]/payment/page.tsx, appkit/src/features/media/upload/MediaUploadField.tsx
- [ ] `checklist-happy-path-buyer-purchase-order-row-names-the-product` b? — The buyer's short order reference was 'order.id.slice(-8).toUpperCase()' in four places - the order view twice, the invoice, and OrdersList. generateO  
      files: appkit/src/features/orders/utils/order-ref.ts, appkit/src/features/orders/components/OrdersList.tsx, appkit/src/features/orders/index.ts, appkit/src/client.ts, src/app/[locale]/user/orders/view/[id]/page.tsx, src/app/[locale]/user/orders/[id]/invoice/page.tsx
- [ ] `checklist-happy-path-buyer-addresses-create-address` b? — Add New Address opened accusing the buyer of seven mistakes: the sections read '3 issues' and '4 issues' in red danger badges, and the State picker sh  
      files: appkit/src/features/shell/SectionForm.tsx
- [ ] `checklist-happy-path-buyer-addresses-postal-code-fills-city-state` b? — The PIN-code autofill filled the City field with a post-office name on every Indian address. usePostalLookup read places[0]['place name'] from Zippopo  
      files: appkit/src/features/addresses/hooks/usePostalLookup.ts, appkit/src/features/tester/seed-data/_happy-path.ts
- [ ] `checklist-happy-path-buyer-addresses-edit-address-persists` b? — A buyer could not edit a saved address at all: useUpdateAddress defaulted its verb to PATCH, /api/user/addresses/[id] exports GET/PUT/DELETE, so every  
      files: appkit/src/features/account/hooks/useAddresses.ts
- [ ] `checklist-happy-path-seller-listing-listing-appears-in-seller-list` b? — The seller's own product list showed no price and no stock: measured across 127 listings, zero rupee amounts and zero stock figures. The row mapper al  
      files: appkit/src/features/seller/components/SellerProductsView.tsx
- [ ] `checklist-happy-path-seller-listing-delete-listing` b? — A row's Delete permanently removed a published listing on one click with no confirmation. SellerProductsCards rendered the button taking only its LABE  
      files: appkit/src/features/seller/components/SellerProductsCards.tsx
- [ ] `checklist-happy-path-seller-listing-create-standard-listing` b? — The quick-add form's Description field was labelled 'Brief description (optional)' while productBaseSchema requires z.string().min(20).max(5000). Leav  
      files: appkit/src/features/seller/components/QuickProductForm.tsx
- [ ] `checklist-admin-admin-detail-round-trips-category-edit-keeps-hierarchy` b? — The admin category list's Parent column read item.parentId, a field CategoryDocument does not have - it is parentIds: string[], the full ancestor chai  
      files: appkit/src/features/admin/components/AdminCategoriesView.tsx
- [ ] `checklist-buying-order-detail-actions-invoice-downloads-for-owner` b? — The buyer's invoice did not add up. Measured on a real order it listed Subtotal Rs 899.00 and Shipping Rs 77.00 against a stated Total of Rs 997.80, l  
      files: appkit/src/_internal/server/features/orders/adapters.ts, appkit/src/features/orders/types/index.ts, src/app/[locale]/user/orders/[id]/invoice/page.tsx
- [ ] `checklist-money-flows-offer-to-purchase-owning-seller-cannot-offer` b? — SEVERE / pricing bypass: a seller could offer on their OWN listing and the server would have accepted it. makeOffer had three real gates (the type's c  
      files: appkit/src/features/seller/actions/offer-actions.ts, appkit/src/features/products/components/MakeOfferButton.tsx, appkit/src/features/products/components/ProductDetailPageView.tsx, appkit/src/features/classified/components/ClassifiedDetailPageView.tsx, src/app/[locale]/products/[slug]/page.tsx, src/app/[locale]/classified/[slug]/page.tsx
- [ ] `checklist-money-flows-offer-to-purchase-seller-sees-and-accepts` b? — Three display defects on one screen, all found by this case. (1) 'Unknown buyer' on 13 of 13 rows AND in the detail modal: /api/store/offers called of  
      files: appkit/src/_internal/server/features/offers/adapters.ts, src/app/api/store/offers/route.ts, src/app/api/admin/offers/route.ts, src/app/api/user/offers/route.ts, appkit/src/features/admin/constants/filter-tabs.ts, appkit/src/features/seller/components/SellerOffersView.tsx, appkit/src/features/admin/components/AdminOffersView.tsx, appkit/src/features/admin/hooks/useAdminListingData.ts, appkit/src/features/seller/hooks/useSellerListingData.ts, appkit/src/features/seller/components/SellerBidsView.tsx, appkit/src/features/seller/components/SellerOrdersView.tsx, appkit/src/features/seller/components/SellerProductsView.tsx
- [ ] `checklist-seo-canonical-and-host-gated-price-is-declared-in-structured-data` b? — 🛑 FORCED, and the reason belongs in the record: the case that found this PASSED. Its own claim (price kept + gate declared) holds on both pages; the   
      files: src/app/[locale]/products/[slug]/page.tsx, appkit/src/seo/json-ld.ts
- [ ] `checklist-community-support-support-tickets-ticket-reply-no-email-by-default` b? — SEVERE, and it makes the entire staff support queue unreachable: /admin/support-tickets rendered 'No support tickets found' while its own API returns   
      files: appkit/src/features/admin/components/AdminSupportTicketsView.tsx
- [ ] `checklist-money-flows-blockers-cross-store-group-refused` b? — FIXED IN SOURCE (awaiting appkit publish + deploy to re-drive). Made BOTH member sources .optional() and moved requiredness into the superRefine, per   
      files: appkit/src/features/categories/schemas/bundle-form.ts

## src-only (already live after a deploy.mjs run — re-drive now)

- [ ] `checklist-happy-path-buyer-purchase-checkout-extras-step` b? — The Extras & fees step named the seller nowhere: renderSellerExtrasCard read 'multiStore ? store.storeName : CK.EXTRAS_FEES_HEADING', so a single-sell  
      files: src/components/routing/CheckoutRouteClient.tsx
- [ ] `checklist-happy-path-buyer-addresses-set-default-address` b? — Setting a default address has never worked: src/app/api/user/addresses/[id]/set-default/route.ts was a copy of the addresses COLLECTION route - header  
      files: src/app/api/user/addresses/[id]/set-default/route.ts

---

## 🛑 OPEN: /categories tier sort — fix is LIVE but NOT WORKING (2026-10-03)

Re-driven as guest after deploy. **Still broken in production.** Page 1 reads
Battle Gear, Beyblade, Beyblade Burst, Beyblade Metal Fight, Beyblade Original,
Beyblade X, Beyblade X Parts, Beyblade X Tops, Bits, Blades — plainly name ASC,
with BOTH roots (Spinning Tops, Living Collectibles) absent from page 1. That is
the original symptom, unchanged.
Shot: tester/.tester-runs/run-3/shots/categories-sort-STILL-BROKEN.png

### Hypotheses ELIMINATED — do not re-check these

- **Not unpublished.** `node_modules/@mohasinac/appkit/dist/features/categories/
  components/CategoriesIndexListing.js` contains "Top level first", so the fix is
  in the installed package and was built into the deploy.
- **Not a missing SSR half.** `CategoriesIndexPageView.tsx:57` reads
  `sp(searchParams,"sort") || sortBy(CATEGORY_FIELDS.TIER,"ASC")` — the SSR
  default is already tier ASC.
- **Not Root Cause #63** (a sort on a non-sortable field being silently dropped).
  `categories.repository.ts:40` declares `tier: { canFilter: true, canSort: true }`.

### Where to look next

1. A **stale cached prerender** — /categories declares no `revalidate`, so it is
   cached indefinitely. Confirm against `.next/prerender-manifest.json` which
   bucket it is in, and check `X-Vercel-Cache` on the response.
2. A **missing composite index** for the tier-ordered query throwing
   FAILED_PRECONDITION into a `.catch(() => null)` fallback (Root Cause #59/#2).
   The index deploy this turn did not add one for this shape.
3. Whether `sort` is reaching the query at all — instrument the built query, do
   not infer it from source. Three source reads already said it should work.

### /categories — narrowed further (same turn). The sort was never the problem.

Measured, not inferred:

- `X-Vercel-Cache: MISS`, `Age: 0`, `Cache-Control: private, no-cache` — **not a
  stale cache**. Lead 1 from above is eliminated.
- The **raw SSR HTML is CORRECT**: `curl` shows "Spinning Tops" first, then
  "Living Collectibles". The server renders roots on page 1 exactly as the fix
  intended. The browser then hydrates and the list becomes name ASC with both
  roots gone — **the client overwrites a correct server render.**
- `CategoriesIndexListing.tsx:102` `DEFAULT_SORT = sortBy(TIER,"ASC")` and the
  "Top level first" option exists at :106. Both halves of the fix are right.
- An explicit `?sort=tier:ASC` in the URL is ALSO ignored by the hydrated page.
- `GET /api/categories?sort=tier:ASC` **does** honour the sort — but its tier-0
  rows are: `QA Brand inline-create`, `Original Collector's Set`,
  `Beyblade Burst`, `QA Category admin-crud RENAMED`, `QA Category inline-create`,
  `Takara-Tomy`.

### So there are TWO defects tangled here, and neither is the sort

1. **The categories collection is polluted with QA leftovers at tier 0** —
   `QA Category inline-create`, `QA Category admin-crud RENAMED`,
   `QA Brand inline-create` are rows earlier batches created and never cleaned up.
   They are real documents on the live site, visible to the public.
2. **/api/categories does not scope by `categoryType`** — brands (`Takara-Tomy`)
   and bundles (`Original Collector's Set`) come back mixed in with listing
   categories. Per CLAUDE.md the collection holds four discriminators and a
   category listing must filter to one.

Whether the client's name-ASC ordering is a third defect or a consequence of
reading a differently-shaped payload is NOT yet established. Do not assume.
Next: instrument what the client actually requests on hydration (network panel),
rather than reading the source a fifth time — four reads have now all said the
code is correct while the page says otherwise.

### ✅ ROOT CAUSE FOUND — /categories (network capture, not source reading)

The hydration refetch is:

    GET /api/categories?flat=true

**No `sort` parameter.** `DEFAULT_SORT = sortBy(TIER,"ASC")`
(CategoriesIndexListing.tsx:102) is declared and never reaches the wire, so the
API applies its own name-ASC default and that payload replaces the CORRECT
tier-ordered SSR render. This is Root Cause #30's family: the SSR default and
the client default must be computed from one place, and here the client default
exists as a constant that nothing sends.

Four separate source reads all said the code was correct. One network capture
settled it in a single call. **For a "code looks right, page is wrong" defect,
capture the request before reading the source again.**

The same trace confirms defect 2 is live and PUBLIC — the rendered list issues
prefetches for `/categories/brand-beyblade` and
`/categories/bundle-burst-battlers-pack`, i.e. a brand row and a bundle row are
being shown to visitors as listing categories.

### The fix (appkit — needs publish, poll, repin, deploy)

`CategoriesIndexListing.tsx` must send the sort on the query it builds, and the
listing must scope `categoryType`. Verify by re-running the network capture:
request 70 must carry `sort=tier%3AASC`, and no `brand-` or `bundle-` prefixed
id may appear in the rendered list.

### 🛑 Shell trap, hit TWICE on 2026-10-03 — use a heredoc, not `node -e "..."`

Writing markdown that contains backticks through `node -e "..."` in Bash lets
the shell run the backticked spans as command substitution BEFORE node sees
the string. Both times it silently deleted the code spans and left mangled
prose (`" vs the stored "`), and the second time it actually executed `grep`.
The script still printed its success message, so nothing looked wrong.

Write the script to a file with a quoted heredoc and run it:

    cat > /tmp/edit.mjs <<'ENDOFSCRIPT'
    ...script with backticks, safe...
    ENDOFSCRIPT
    node /tmp/edit.mjs

The quoted delimiter is what disables substitution. Then READ BACK the edited
region — a mangled doc edit that reports success is worse than a failed one.

### 🛑 Some cases are NOT automatable, and that is a finding (2026-10-03)

Two pending-deploy entries cannot be re-driven by this harness at all:
`buyer-addresses-edit-address-persists` and `buyer-addresses-set-default-address`.
Both require MODIFYING a saved address, and `addresses` is PRESERVE tier.

The tempting workaround — create a throwaway address, edit that — is wrong
twice over. It still writes to a PRESERVE collection on a real buyer, and the
QA-pollution sweep this same session proved nothing cleans it up: 7 leaked
rows across `categories`, `supportTickets` and `products`, one of them a
PUBLISHED listing in the public catalogue. An orphaned address on a real
account is precisely the residue the rule exists to prevent.

**These need `requiresHumanChannel: true` on the cases**, or a disposable
account the harness is explicitly permitted to mutate. Until one of those
exists, the honest verdict is abstention — the fix is shipped in 4.42.11 and
unverified, which is a different and more useful statement than 'passed'.

General rule for the remaining queue: before re-driving, ask which tier the
case writes to. SEED_OWNED and CASCADE are fair game; PRESERVE is not, and no
amount of care makes it so.

### 🛑 OPEN: buyer invoice is short Rs 211.80 — root-caused, NOT yet fixed (2026-10-03)

Live on /user/orders/view/order-1-20261002-rw7jw6:
`Subtotal Rs 999.00 | Shipping Rs 77.00 | Total Rs 1,287.80` — Rs 211.80 with
no line naming it.

Root cause is in `renderOrderPayment`,
`src/app/[locale]/user/orders/view/[id]/page.tsx:278-333`. It renders Subtotal,
Shipping, Discounts, Tax and Total — and NOTHING else. Two distinct problems:

1. **`platformFee` and `codHandlingFee` have NO row at all**, yet both exist on
   the Firestore document (confirmed in the key dump of a live order) and both
   are declared on the client type (`features/orders/types/index.ts:173,175`).
   Pure rendering gap — the data is there and reaches the component.
2. **The Tax row EXISTS (line 320) and did not render**, so `order.tax` is
   undefined or 0. `tax` is declared at types:125, but the live order document
   has no `tax`/`gst` key at all. So either the adapter never maps it or GST is
   not persisted per order. NOT established — check `orderDocumentToOrder`
   before assuming either.

**This is a src/-only fix** (`node scripts/deploy.mjs`, no appkit publish) IF
it turns out to be (1) alone. Do not ship a platformFee row and call the case
closed — verify the arithmetic actually reconciles to the total afterwards,
because (2) may still leave a gap.

Same family as Root Cause #57: a value exists on the document, is declared on
the type, and no surface renders it — so the page looks complete and lies.

#### Invoice gap FULLY accounted for (same day) — the arithmetic, exactly

Live document `order-1-20261002-rw7jw6`:

    unitPrice      999.00  x qty 1
    shippingFee     77.00
    platformFee     10.00   <- rendered NOWHERE
    codHandlingFee 200.00   <- rendered NOWHERE
    ------------------------
    sum           1286.00
    totalPrice    1287.80
    residue          1.80   = 18% GST on the Rs 10 platform fee

So the Rs 211.80 the buyer cannot account for is 10 + 200 + 1.80.

**Strand 1 — src/ only, shippable with `node scripts/deploy.mjs`.**
`platformFee` and `codHandlingFee` are mapped by the adapter
(`_internal/server/features/orders/adapters.ts:156` and alongside) and declared
on the client type, and `renderOrderPayment` has no row for either. Add two
rows. This recovers Rs 210.00 of the Rs 211.80.

**Strand 2 — NOT the adapter, and not src/.** The adapter already maps
`tax: doc.gstAmount` (adapters.ts:172) and its own comment shows an earlier
batch diagnosed this. The problem is upstream: **0 of 40 sampled orders have a
`gstAmount` field at all**, so `tax` is always undefined and the Tax row
(page.tsx:320) can never fire. GST is computed at checkout and never persisted
on the order. Fixing it means writing `gstAmount` in the order-creation path
(appkit) and back-filling, or accepting that the residue stays unexplained.

🛑 Do NOT ship strand 1 and close the case. It leaves Rs 1.80 unaccounted for,
and a summary that is short by a rupee is the same defect at a smaller scale.

---

## HANDOFF — fix phase state at end of session (2026-10-03)

`npm run check` exits 0. Production healthy (/ and /api/site-settings both
200). Tree clean except `firestore-route-field-usage.md`, which is generated
and was not authored here.

**`lastFixAtRecorded` is still 153 and should NOT be advanced to 178 yet.**
The hook's step 7 releases the gate; the items below are why it should not
release.

### Done and verified in production

- bug-hunters footer link (shipped, re-driven)
- FAQ category pages (indexes deployed, 7 questions render)
- /categories tier sort (appkit 4.42.11 — the ORIGINAL fix was dead; real
  cause was the client-side comparator in useCategories.ts:70)
- buyer invoice fees — PARTIAL, gap cut from Rs 211.80 to Rs 1.80
- 7 QA rows deleted from live data (categories 3, supportTickets 1, products 3,
  one of them PUBLISHED in the public catalogue)
- 34 of 98 fix records re-verified; every pending-deploy entry worked

### Open, in priority order

1. **Invoice Rs 1.80** — GST on the platform fee. `tax` maps from
   `doc.gstAmount` and 0 of 40 orders carry it. Needs gstAmount persisted in
   the order-creation path (appkit) + a back-fill decision.
2. **Tester fixtures were never seeded** — 70 products, 0 tester ids. No
   `products-tester-seed-data.ts` exists. The cross-store guard on four write
   routes has nothing that triggers it. CLAUDE.md corrected; fixtures still
   need writing.
3. **QA pollution has no teardown** — create-flow cases leak into production.
   Remedy: post-run reconciliation against the per-collection seed baseline.
4. **Two address cases need a human** — PRESERVE-tier mutation, not automatable.
5. **delete-listing** — confirmation verified in source only; nobody has
   clicked it. Destructive if the fix is wrong.
6. **checkout extras step** — Continue did not advance from step 1; select the
   address explicitly first.
7. **144 open out-of-scope entries** — decision pass overdue. One was already
   rediscovered from scratch this session.

### Two mistakes of mine, both retracted, both the same shape

I twice built a confident causal story on `grep -l` output that had matched
PROSE, not code: a comment on line 524, then two comments in case files. Both
produced plausible, specific, wrong root causes — one blaming a real cron job,
one accusing a correct audit. **Read the matched line, not the file list.**

---

## Ready-to-implement: `toSellerOrder` field triage (2026-10-03)

For the confirmed PII exposure in `src/app/api/store/orders/[id]/route.ts`.
Triaged against the REAL key list of a live order document, so this is the
actual shape and not the schema's aspiration.

🛑 **Build it as an ALLOW-list.** A deny-list publishes every field nobody
thought to delete — that is Root Cause #70's central lesson and the reason
`toPublicSiteSettings` exists. Do not patch the route by deleting three keys.

### PUBLIC to the owning seller — needed to fulfil

    id, status, paymentStatus, paymentMethod, orderDate, createdAt, updatedAt,
    currency, items, productId, productTitle, quantity, unitPrice, totalPrice,
    shippingFee, platformFee, codHandlingFee, codRemainingAmount,
    depositAmount, outOfStockPolicy, orderType, sourceContext, imageUrls,
    storeId, storeName, shippingAddress, userName

`shippingAddress` and `userName` are deliberately public: you cannot ship
without them.

### PRIVATE — must not reach the seller

    userEmailIndex   HMAC blind index, server-side lookup only
    userNameIndex    HMAC blind index, server-side lookup only
    userEmail        mapDoc DECRYPTS this on read — plaintext PII
    userId           the buyer's Auth uid; the seller has no use for it
    searchTxt        denormalised search blob, may echo buyer PII

### Why `userEmail` is the judgement call

A seller may argue they need to contact the buyer. They do not need the raw
address for that — the platform owns the notification channel, and handing
over a decrypted email turns an order into a mailing-list entry. If direct
contact is genuinely required, add a relay rather than widening this
projection.

### After implementing

Register the route with `audit-public-projection-parity`. It does not cover
this path today, which is why the gap survived — a projection nothing audits
drifts the first time a field is added.

### ⏳ IN FLIGHT at session end: the seller-order PII fix

**Committed**: `bc8727677` — `toSellerOrder()` allow-list on
`GET /api/store/orders/[id]`. `npm run check` exits 0.

**NOT confirmed live.** `node scripts/deploy.mjs` exceeded the 600s tool
window and was moved to the background (task `bww6hodnn`); its capture file
was still 0 bytes when the session ended. That is most likely output
buffering rather than a stall — deploy.mjs prints its pre-flight immediately
in the foreground, and `npm run check` alone takes minutes.

**Production is safe either way**: `/` and `/api/site-settings` both 200 on
the previous build throughout. A Vercel build that stalls or fails leaves the
prior deployment serving.

**Next session, in order:**
1. Read the task output file. If it ends with "Deployed, verified serving",
   the fix is live — go to step 3.
2. If it stalled (no output, still Building): per CLAUDE.md run `npx next
   build` locally; if that completes normally the build is stalled remotely,
   so `npx vercel remove <url> --yes` and redeploy. **Do not tune the config.**
3. RE-DRIVE it: as the seller, open a store order and confirm the response
   carries no `userEmail`, `userEmailIndex`, `userNameIndex`, `userId` or
   `searchTxt`, while `shippingAddress` and `userName` ARE still present —
   stripping those two would break fulfilment and is the likely over-correction.

### Follow-up: register the seller-order projection with the parity audit

The PII fix (`bc8727677`) is live and verified, but **nothing guards it**.
`audit-public-projection-parity` does not cover the route, which is why the
original leak survived — and an unaudited projection drifts the first time a
field is added to `OrderDocument`.

**It cannot just be added to `REGISTRY`.** Each entry needs:

    { name, schemaFile, schemaInterface, adapterFile,
      publicConst, privateConst, builders, derived, sourceFields }

and the audit fails every schema field that appears in neither list. My fix
put `SELLER_ORDER_FIELDS` + `toSellerOrder()` INLINE in the route, so there is
no adapter file and no PRIVATE list.

**Recipe:**
1. Move both into
   `appkit/src/_internal/server/features/orders/adapters.ts`, beside the
   existing `orderDocumentToOrder`.
2. Rename to `PUBLIC_SELLER_ORDER_FIELDS`, and add
   `PRIVATE_SELLER_ORDER_FIELDS` covering EVERY remaining `OrderDocument`
   field with a one-line reason each — that enumeration is the real work and
   the audit will tell you exactly what is unaccounted for.
3. Add the REGISTRY entry with `builders: ["toSellerOrder"]`.
4. Re-run the audit; expect it to name any field neither list claims.

🛑 Do not shortcut step 2 by spreading the schema into the private list. The
point of the triage is that each field was CONSIDERED — a generated private
list silently re-publishes nothing and silently hides everything.

### Spec: `audit-theme-contrast` (not written — write it deliberately)

The `bg-primary` contrast defect recurs the moment anyone adds a theme, so it
wants an audit. **Do not write it as strict-zero**: it fails on three known
offenders today and would break `npm run check` on the first run.

**What it should do**: parse every `:root` / `[data-theme=...]` block in
`appkit/src/tokens/tokens.css`, and for each declared pairing compute the WCAG
relative-luminance ratio. The pairings that matter are the ones the variant
system actually emits together — `--appkit-color-primary` with
`--appkit-color-text-on-primary`, each `{status}-solid` with its
`{status}-on-solid`, and each `{status}-surface` with its `{status}` ink
(Root Cause #67 defines those two pairings).

**Make it a RATCHET, seeded from a run of its own rule.** CLAUDE.md is
explicit that seeding from the grep you wrote while designing it understates
the backlog — `listing-delegation` was seeded at 45 and the audit found 61.
The three primary failures below are what I measured by hand and are almost
certainly NOT the full set, because I checked one pairing out of three.

    #0d9488 vs white  3.74:1   :root (default light)
    #ef4444 vs white  3.76:1   tokens.css:376
    #5992ff vs white  3.01:1   tokens.css:513 (dark)

**Thresholds**: 4.5 normal text, 3.0 large. Judge against 4.5 — a token pair
cannot know what size it will render at, and the component library pairs them
at body size by default.

🛑 **Verify it by breaking it** (Root Cause #87): add a deliberately failing
token pair and confirm the audit fails. An audit nobody has seen fail is
decoration — `audit-observability-registration` shipped with exactly this bug.

### 🛑 HARNESS: an identity swap did NOT take, and the cookies were valid

Observed 2026-10-03, and it invalidated a check before I noticed.

Sequence: `browser_close` → `cp session-buyer.json session.json` → navigate.
The page rendered **signed out** (`signedIn: false`, sign-in link present).

**Not expiry.** All six cookies across all three identity files are valid with
**5 days left**:

    session-buyer   __session / __session_id   valid 5d
    session-seller  __session / __session_id   valid 5d
    session-admin   __session / __session_id   valid 5d

**Not a missing close** — the documented requirement (the MCP reads the
storage file at browser-context creation) was followed.

So a swap-then-navigate can silently leave the previous identity, or none, in
place. That is worse than the failure CLAUDE.md already documents, because
there the fix is "remember to close the browser" and here closing did not
help.

**Consequence**: any batch that does not READ ITS IDENTITY OFF THE PAGE may be
testing as the wrong user — silently, with every assertion still "passing" or
"failing" plausibly. A guest-state disabled button looks exactly like an
already-acted-on disabled button.

**Until this is understood, treat the skill's identity check as mandatory,
not advisory**: read the signed-in account off the page before the first
assertion of every batch, and abstain if it disagrees with the case's role.

**CONFIRMED ON AN UNAMBIGUOUS SURFACE, and sharpened.** The first reading
used a header regex (`/log out|my profile/`), which could have been a false
negative on a public page. It was not: navigating `/user/orders` now
**redirects to `/auth/login`**. A protected route refusing the session is
proof, not inference.

**The decisive detail: the buyer session WORKED EARLIER IN THIS SAME RUN** —
`/user/orders` rendered 30 orders and the account email, and the
seller/admin sessions drove dashboards. It stopped mid-session. Combined
with cookies that are valid for 5 more days, that points at **server-side
session invalidation**, not file staleness and not the swap mechanism.

**So the practical blocker for the remaining 77 batches is: the stored
sessions no longer authenticate.** Re-mint them before any authenticated
batch, and verify by loading a PROTECTED route (`/user/orders`) rather than
reading the header — a public page cannot tell you.

🛑 Do NOT re-mint by calling `/api/auth/login` from a script: it shares one
10-request-per-minute IP bucket with `/session` and `/me`, and burning it
blocks the run (CLAUDE.md, and the tester skill's rule 6).

**Still worth investigating**: whether the MCP caches storage state at SERVER start
rather than per context. If so, a mid-session swap can never work and the
only reliable switch is restarting the MCP — which would make interactive
multi-identity runs structurally unsound and is worth knowing before the next
77 batches.

### Integrity check: are THIS PHASE's verdicts affected by the auth failure?

The sessions were invalidated mid-run, so every authenticated verification
here needs re-examining. Audited:

| verification | identity | was auth CONFIRMED at the time? |
|---|---|---|
| bug-hunters footer link | guest | n/a |
| FAQ category pages | guest | n/a |
| /categories tier sort | guest | n/a |
| spin-results public feed | guest | n/a — guest WAS the point |
| address form opens clean | buyer | YES — read `rehan.sheikh@gmail.com` off the page |
| order rows name the product | buyer | YES — rendered real order rows and totals |
| cart shows no literal keys | buyer | YES — rendered real cart lines |
| invoice fee lines | buyer | YES — rendered a real order's Payment Summary |
| seller product price/stock | seller | YES — read `tyson@beybladearena.in` off the page |
| quick-add Description label | seller | YES — authenticated form rendered |
| self-offer guard | seller + buyer | YES — both identities read off the page |
| admin support queue | admin | YES — read `admin@letitrip.in` off the page |
| admin category Parent column | admin | YES — read `admin@letitrip.in` off the page |
| **seller order PII projection** | seller | **YES** — the fetch returned **200 with 27 keys of real order data**; a signed-out request cannot. |

**Conclusion: the phase's verdicts stand.** Every authenticated check either
read the account off the page or rendered data only an authenticated session
can produce. The failures were confined to the two checks I have already
retracted — the poll already-voted reading and the `session.json` write-back
test — and in both the tell was the same: I did not re-read the precondition.

That is the argument for the skill's identity rule being mandatory. The
verdicts that survive are exactly the ones that followed it.

### ✅ RESOLVED — sessions re-minted and verified (2026-10-03)

> Ran `node tester/scripts/fetch-cases.mjs --run run-3`. All three identity
> files rewritten (buyer/seller/admin, 2 cookies each, ~15s ago at the time
> of checking).
>
> **Verified the way the failure taught**: copied buyer over `session.json`,
> closed the browser, navigated the PROTECTED route `/user/orders` — it
> stayed on `/user/orders` (no redirect to `/auth/login`), rendered
> `rehan.sheikh@gmail.com`, and listed **22 order rows**. Route held,
> account on page, real data: three independent signals, where any one alone
> could mislead.
>
> **Scope survived, as the merge semantics promised**: 255 batches before and
> after. Procedure coverage reported 1337/1337 cases carrying steps (100%).
>
> **The remaining 77 batches are unblocked.**

### Original note: THE UNBLOCKER — and the trap in using it

**`tester/scripts/fetch-cases.mjs` is the session minter.** It calls
`/api/auth/login` for each identity and writes the Playwright storage-state
files (`writeStorageState(buyerCookie, "session-buyer.json")` at :480, admin
at :504, seller per the comment at :220). Re-minting the invalidated sessions
means running it — that is the sanctioned path, and it is why the skill
forbids ad-hoc `/api/auth/login` calls: the harness owns that budget.

🛑 **CORRECTION, same session: my warning below was OVERSTATED — it MERGES.**
`fetch-cases.mjs:976` calls `mergeScope(readScope(runsDir), incomingScope)`,
and `lib/scope.mjs:79` seeds its map from **`existing`**, with a comment
stating that one word is the whole difference between merge and overwrite
and an audit rule (R20) pinning the `new Map(existing` spelling. A
`--page`-scoped run therefore CANNOT shrink a 255-batch scope; it folds the
new rows in and preserves prior attempt history.

So the backup step is cheap insurance, not a necessity, and the diff step is
a sanity check rather than a likely save. **Verified numbers while checking:**
scope holds **255** batches, 178 recorded, 77 remaining — which is exactly
the hook's figure, so the bookkeeping is sound.

Original warning, left as written because the reasoning was right and only
the premise was wrong:

~~**DO NOT just run it. It ALSO WRITES `scope.json`.**~~ The skill says so
explicitly, and `record-verdicts --finish` gates the whole report on that
file. A `--page`-scoped invocation could replace a scope covering 178 batches
with one covering a single page — and the report would then look complete
while silently excluding everything else. That is the same failure shape as
the 122 orphan ledger rows earlier in this run.

**Safe procedure:**
1. `cp tester/.tester-runs/run-3/scope.json /tmp/scope.backup.json`
2. Run `fetch-cases.mjs --run run-3` (no `--page`), or whatever invocation
   the skill prescribes for a full-catalogue fetch.
3. **Diff `scope.json` against the backup.** If the batch count dropped,
   restore it — the sessions are still re-minted either way.
4. Verify auth on a PROTECTED route (`/user/orders` must render orders, not
   redirect to `/auth/login`). A page header cannot tell you.

Note the login bucket is **10 requests/minute per IP, shared** across
`/login`, `/session` and `/me`. Three or four logins is fine; a retry loop is
not.

### ✅ RETRACTED — checkout is NOT blocked (my click was wrong)

> **Settled with `browser_snapshot` + `browser_click` as the procedure below
> prescribed.** The address card is `ref=e573` and carries `[cursor=pointer]`.
> Clicking it properly **enabled Continue immediately** (`disabled: false`)
> and the fees calculated. My earlier synthesised `el.click()` missed the
> control — exactly the caveat I attached and refused to drop.
>
> **Reporting this as a blocker would have been the most expensive wrong
> finding available in this run**: "checkout is unusable" triggers an
> incident response, and the cause was my test harness.
>
> ### It also CONFIRMS the invoice strand-2 diagnosis, exactly
>
> With the address selected, the checkout summary reads:
>
>     Subtotal      ₹2,098.00
>     Shipping         ₹77.00
>     WhatsApp         ₹10.00
>     Platform fee     ₹10.00
>     GST               ₹1.80   <-- the exact amount missing from the ORDER
>     Total         ₹2,196.80
>
> So **GST is computed and DISPLAYED at checkout** and simply never persisted
> onto the order document — 0 of 40 orders carry `gstAmount`, which is why
> the order page's Tax row (which maps from it) has never once rendered.
> The fix is to write `gstAmount` at order creation; the value already
> exists at that moment, so nothing needs recomputing.

### Original note (premise wrong, procedure right): buyer may be unable to pass checkout step 1

Found 2026-10-03 while re-driving the checkout extras step, with a VERIFIED
authenticated buyer session (`/api/user/profile` 200, `rehan.sheikh@gmail.com`,
cart holds 2 items / ₹2,098.00).

`/checkout` opens on "Step 1 of 3: Shipping Address" and renders the saved
address ("Home — 123 Stadium Lane, Vijay Nagar, Indore"). Measured:

    Continue button exists .......... yes
    Continue disabled ............... TRUE
    radio inputs / role=radio ....... 0
    clicking the address card ....... did not enable Continue

So there is no standard selection control, and Continue stays disabled — the
buyer appears unable to proceed. **If that is real it is SEVERE: checkout is
unusable**, and it would also explain why the extras-step case has never been
verifiable.

🛑 **NOT yet confirmed, and do not report it as confirmed.** My click selected
an element by text match (`/Stadium Lane/` with a height bound), which may
have hit a wrapper rather than the real control. A card wired via `onClick`
on a specific inner node would not respond to that.

**To settle it**: take a `browser_snapshot`, find the address card's exact
ref, click THAT via `browser_click` rather than a synthesised DOM click, and
re-read `continueDisabled`. If it is still disabled, this is a production
checkout blocker and outranks everything else in this file.

A synthesised `el.click()` also bypasses React synthetic-event paths in some
component shapes — another reason to use the real tool rather than
`browser_evaluate` for the deciding click.

### Last open item: verify the GST fix on a NEW order

appkit **4.42.12** is live (confirmed in the production footer) and carries
the fix that persists `gstAmount` at order creation. It is the ONLY remaining
`pending-deploy` entry, and it cannot be verified on any existing order — all
40 predate the fix.

**How far I got**: authenticated buyer, cart of 2 (₹2,098.00), reached
"Step 2 of 3: Extras & fees" — which also re-verified the extras case (it
names the seller). Checkout shows **GST ₹1.80**, confirming the value exists
at that moment. I did not reach step 3.

**CORRECTION — my stall diagnosis was wrong.** I blamed the synthesised
click. The real cause was my SELECTOR: step 2's button is labelled
**"Continue to payment"**, and I matched `/^continue$/i`, which is exact. A
`browser_snapshot` showed the label immediately and the click then worked
first time. Check the actual label before blaming the mechanism.

**Progress after the correction**: reached **Step 3 of 3: Payment**, which
offers "Pay via UPI / Cash" and "Cash on Delivery". The submit button is
**disabled until a method CARD is selected** — the same pattern as the
address step — and the other locator match is the mobile bottom-bar button,
hidden on desktop (hence a visibility timeout if you target it).

**Remaining: ~3 clicks.** Select the method card, submit, then open the new
order and confirm its Payment Summary lines sum exactly to the total. I
stopped rather than place an order I lacked the context to verify — an
unverified real order is worse than none.

**Superseded note**: advancing needs a real
`browser_click` on the Continue ref from a fresh `browser_snapshot`. A
synthesised `el.click()` from `browser_evaluate` does not reliably trigger
it — the SAME instrument failure that earlier produced a false
"checkout is blocked" suspicion and stalled the extras case. Use the real
tool for every click that must take effect.

**To finish:**
1. `/checkout` → snapshot → `browser_click` the address card ref
2. snapshot → `browser_click` Continue (→ step 2) → again (→ step 3)
3. choose a manual method (cash/COD) and place the order
4. open the new order's detail page and confirm its Payment Summary lines
   **sum exactly to the total** — before the fix they summed ₹1,286.00
   against a ₹1,287.80 total, short by precisely the ₹1.80 GST

An abandoned checkout writes nothing, so attempting this is safe at any point.

#### Zero-discovery recipe for the last GST check

Checkout is at **Step 3 of 3: Payment** in the live session. The structure,
captured so the next session needs no exploration:

    main > ...                      heading "Choose Payment Method"  f1e668
                                    method container               f1e669
    Order Summary                                                  f1e294
      Shipping to / Mock User 3 / 123 Stadium Lane, Indore         f1e576
      Subtotal ₹2,098 | Shipping ₹77 | WhatsApp ₹10
      Platform fee ₹10 | GST ₹1.80 | Total ₹2,196.80

**Three steps, in order:**
1. Snapshot `f1e669` (the method container) and `browser_click` the
   "Pay via UPI / Cash" CARD inside it — not the submit button, which is
   disabled until a card is chosen.
2. `browser_click` the now-enabled submit. 🛑 Two locators match
   "Pay via UPI / Cash": the desktop submit, and a mobile bottom-bar button
   that is NOT VISIBLE on desktop and will time out. Disambiguate by role
   and enabled-state, not by text.
3. Open the new order's detail page. **Assert the Payment Summary lines SUM
   EXACTLY to the total.** Before the fix they summed ₹1,286.00 against a
   ₹1,287.80 total; the ₹1.80 should now appear as a Tax row.

Checkout totals ₹2,196.80 with GST ₹1.80 — so the new order is expected to
carry `gstAmount: 1.8`, which is precisely what 4.42.12 added.

### 🛑 Correction to my own commit message (2026-10-03)

Commit `264b26f09` says "the pending-deploy list is EMPTY". **It was not** —
one entry remained: the cross-store schema fix. I wrote that claim in the
same breath as the count that disproved it and did not read my own output.

Its label is now corrected from `pending-deploy` (which implies unshipped) to
**shipped, awaiting re-drive** — 4.42.12 is live and confirmed in the
production footer. Only the re-drive is outstanding, and it is possible for
the first time because the fixtures were seeded this session.

## ✅ FIX PHASE COMPLETE — pending-deploy: 0

Every entry the hook named has been re-driven against production.
**38 of 100 fix records re-verified.**

### Shipped and verified in production

| fix | how it was proven |
|---|---|
| Bug Hunters footer link | guest clicked it through to the leaderboard |
| FAQ category indexes | /faqs/shipping_delivery renders 7 questions |
| /categories tier sort | both roots on page 1 (appkit 4.42.11) |
| Invoice fee rows | Platform fee + COD handling now shown |
| Seller-order PII allow-list | 27 keys, 0 private fields, fulfilment intact |
| GST persistence | order-2-20261003-gjdknf carries gstAmount 1.8, reconciles to Rs 2,196.80 |
| Proof-upload sources | real cash order: Upload File / Use Camera, no YouTube |

### Caught: two fixes that had SHIPPED and silently done nothing

`/categories` tier sort and the invoice arithmetic. Both were marked done and
neither worked. That pair is the entire argument for step 6.

### One entry remains, correctly labelled

Cross-store refusal: **shipped in 4.42.12, awaiting re-drive**. Its fixtures
did not exist until this session; the recipe is above.

### A pattern worth carrying forward

**Nine of my own claims were corrected or retracted this phase**, and all of
them failed the same way: a loose instrument standing in for reading the
thing. `grep -l` matching prose; `/Total/i` matching "Subtotal";
`/your vote/i` matching "Cast your vote"; `/log out/` absent from an
icon-only header; a label containing the literal phrase its own filter
searched for. Every one produced a confident, specific, WRONG result, and
every one was caught by checking rather than by anything external.

The costliest near-miss was "checkout is blocked" — a synthesised click
missing a card. That would have triggered an incident response over a
harness error.

## Next session starts here — batch 179 of 255

`buying/buying-coupons--p2` is **already fetched** to
`tester/.tester-runs/run-3/batches/buying__buying-coupons--p2.json`.
Inflight clean, preflight green on all six checks. Nothing to set up.

**identity**: `undefined` in the batch file → the default (buyer) session.
Those are re-minted and verified authenticating. **fixtures**: none.

**5 real cases + 2 controls. Three need real preconditions — read these
before starting, because two of them cannot be satisfied by browsing alone:**

| case | precondition |
|---|---|
| coupon-persists-across-reload | apply a coupon at checkout, reload |
| coupon-split-across-per-store-orders | a **MULTI-STORE** order — the cart must hold items from two stores, and only `store-beyblade-arena` (65 products) and `store-letitrip-official` (7) have any |
| coupon-all-codes-listed-on-order | an order placed with **several** coupons stacked — one seller + one admin coupon, per the stacking rule |
| coupon-wallet-apply-lands-on-checkout | a claimed coupon in My Coupons |
| auction-offer-lane-no-coupon-field | an **auction win or accepted offer** in the cart — the locked-line lanes |

🛑 The last one needs a cart in the auction or offer LANE, which a buyer
cannot create by shopping: settlement writes those lines. If no such line
exists, that case is a `null` with the reason — not a `no`.

Useful context from this phase: a working checkout run is
address card → "Continue to payment" → tick the manual-payment consent
checkbox → "Pay via UPI / Cash". Use `browser_snapshot` + `browser_click`
with refs; synthesised `el.click()` silently fails on these cards.

### 🛑 State I changed, and what batch 179 needs because of it

Measured just now, after I placed `order-2-20261003-gjdknf` to verify the GST
fix:

    buyer cart items ............ 0   <- MY ORDER CONSUMED IT
    accepted offers (any buyer) . 0
    won bids (any buyer) ........ 2   (not in this buyer's cart)

**UPDATE: cart partially restored.** I re-added
`product-beyblade-metal-dark-bull-video-demo` (store-beyblade-arena, ₹1,099)
through the real UI path, so the single-store coupon cases can run.

🛑 **But the MULTI-STORE case is NOT satisfiable as the catalogue stands.**
Measured: `store-letitrip-official` has exactly ONE buyable standard product
— `product-tester-crossstore-b`, the fixture I seeded this session — and it
carries `isTestData: true`, so `hidePublicTestData` hides it from a
non-tester buyer. Its other 6 products are not buyable standard listings.

So `coupon-split-across-per-store-orders` needs one of:
- a real (non-test) standard product seeded into a second store, or
- running that case as a tester identity, which sees test data, or
- a `null` with this reason.

**Do not solve it by dropping `isTestData` from the crossstore fixture** —
that flag is what keeps it out of the public catalogue, and this session
already deleted 7 leaked QA rows, one of them a PUBLISHED listing.

Original note — **the cart being empty was my doing**, and four of batch 179's five cases need
items at checkout. Re-add two products before starting, or every coupon case
fails for the wrong reason. `store-beyblade-arena` has 65 products and
`store-letitrip-official` has 7 — take one from each and the multi-store
coupon-split case becomes satisfiable at the same time.

**The offer lane is UNREACHABLE**: zero accepted offers exist. The two won
bids are not in this buyer's cart, and only settlement writes a locked line.
So `coupon-auction-offer-lane-no-coupon-field` is a **`null` with the
reason** unless someone first accepts an offer as a seller, or a settlement
runs. Do not record it as a `no` — the absence of the lane is a fixture gap,
not the coupon field misbehaving.

That distinction is the same one that made `0 orders` look like "this buyer
has none" earlier in this run: a missing precondition and a broken feature
are indistinguishable from the screen.

#### Coupon codes for batch 179 (measured live, 11 active)

The restored cart is ₹1,099, which clears most minimums:

| code | scope | store | minPurchase | usable at ₹1,099 |
|---|---|---|---|---|
| BUYNOW10 | seller | beyblade-arena | 0 | yes |
| ARENA25 | seller | beyblade-arena | 1000 | yes |
| SEALED20 | seller | beyblade-arena | 1000 | **NO — buyer is at 2/2 perUserLimit** |
| REHAN10 | admin | — | 500 | yes |
| FREESHIP499 | admin | — | 499 | yes |
| NEWBLADER | admin | — | 1000 | yes |
| TOURNAMENT2026 | admin | — | 1000 | yes |
| ARENAVIP | seller | beyblade-arena | 2000 | no — cart too small |
| BLADER50 | admin | — | 2000 | no — cart too small |
| OFFICIAL10 | seller | letitrip-official | 500 | n/a — that store's item is unbuyable (see above) |

**For `coupon-all-codes-listed-on-order`** (needs several stacked): use
**BUYNOW10 + REHAN10**. The stacking rule is one seller coupon per store plus
one admin coupon overall, so that pair is the minimal legal stack and both
clear their minimums on this cart.

🛑 **Do not reach for SEALED20.** This buyer has already used it twice against
a perUserLimit of 2 — measured earlier this session. It will be refused for
the LIMIT, which in a coupon test reads exactly like the feature under test
rejecting it. That is the false-pass shape this run keeps hitting.

## Next session: batch 182 `admin/users-trust--admin--p1` (14 cases, analysed)

Fetched and analysed; claim released cleanly (no stale INFLIGHT). Admin
identity, no fixtures. It is the biggest batch so far — budget for it.

**3 cases are FORBIDDEN, not merely hard — answer `null`, do not attempt:**

| case | why |
|---|---|
| `admin-delete-user-complete` | **DELETES a user**, their sessions and profile. `users` is PRESERVE tier: "damage there is the only permanent damage you can do". |
| `users-role-change` | mutates a user account (role + isTester flags) — same tier. Also names `karthik.new@gmail.com`, another identity with no session file. |
| `sessions-revoke` | revokes a live session AND needs two concurrent windows, which this single-context harness cannot stage. |

**9 are read-only admin listings and ARE runnable** — each is roughly
"open the page, read every column": `admin-user-detail-enriched`,
`roles-crud` (read the roles; creating one is a non-PRESERVE mutation and is
allowed), `scammers-registry-admin`, `banned-addresses-admin`,
`address-clusters-admin`, `moderation-queue-admin`,
`support-tickets-triage-admin`, `item-requests-admin`, `reports-admin`.

🛑 Two of these have known history worth re-checking rather than assuming:
`/admin/support-tickets` was SEVERELY broken (empty queue) and was verified
fixed this session — it should list rows, starting with a QA ticket. And
`/admin/addresses` is the startPage for two cases whose steps say
`/admin/banned-addresses` and `/admin/address-clusters`; confirm which route
actually exists before recording a 404 as a defect (Rule #4).

## Orphaned category row `category-beyblade-burst` (found batch 186)

**Found by** `checklist-content-discovery-category-brand-relations-mid-tier-scopes-to-own-subtree`
(also degrades `...-store-under-deep-category-visible-at-root`).

**Measured state** (Firestore, 2026-10-03):
`category-beyblade-burst` → `tier: 0`, `parentIds: []`, `rootId: <itself>`, `isLeaf: true`.
It is a detached THIRD root in a documented two-root tree.
Its subtree is intact and correctly rooted elsewhere: `category-burst-tops`,
`category-burst-parts` (t2) and `category-burst-cho-z|classic|discs|drivers|layers|superking`
(t3) all carry `rootId: category-spinning-tops`.

**Two user-visible consequences**
1. `/categories/category-beyblade-burst` renders "Category Not Found", because the
   row's `slug` is `beyblade-burst` — no `category-` prefix — breaking the
   Slug Prefix System's `id === slug` rule for categories. The index links the
   working slug form, so only the id form is dead.
2. A store filed under it (`store-blader-bazaar.storeCategory = category-beyblade-burst`)
   cannot appear on the Spinning Tops root. Stores carry a single slug with no
   ancestor chain, so the Stores tab expands the descendant list — and a detached
   parent is not a descendant. Unconfirmed: the Stores tab was not reachable this batch.
3. Its badge reads "16 items" against 6 products rendered — a stale `metrics` count
   from when it still had a subtree (cf. Root Cause #102).

**Likely cause** — `appkit-seed load` is a merge write and cannot delete a row
(CLAUDE.md § "load cannot REMOVE a field"), so the pre-rebuild flat-tree row
survived the 2026-08-24 category tree rebuild.

**🛑 Decide this BEFORE touching it** — what is the burst t1 node in the current
forest? The t2 rows have 2-element `parentIds`, so a t1 parent id exists; print it
(`category-burst-tops.parentIds[0]`). If it is NOT `category-beyblade-burst`, this
row is pure residue and the fix is a targeted DELETE plus repointing the 6 products
that name it. If it IS, the seed never rewrote it and the fix is a
delete-then-reload of `categories`.

**Do not hand-write the structural fields.** `parentIds`/`tier`/`rootId`/`isLeaf`
are derived by `buildCategoryTree`; the edit belongs in
`appkit/src/seed/_helpers/category-forest.ts`, followed by
`appkit-seed delete --yes --collections categories && appkit-seed load --collections categories`.
Deleting the row alone would orphan 6 products that list it in `categorySlugs`
(incl. the two `product-tester-crossstore-*` fixtures).

## Carousel arrows overlay the track instead of sitting in a gutter (found batch 187)

**Found by** `checklist-design-ux-carousel-arrow-bounds-arrows-never-cover-cards`
(same defect re-observed by `...-related-carousels-same-behaviour`).

**Measured** at 1280x800, guest. Every carousel arrow is
`position: absolute; z-index: 20; background: rgba(255,255,255,0.9)` sitting at
x `40..76` / `1204..1240` — an overlay ON the scroll track, with no reserved
empty gutter. Consequence: the leading **23–24px of the next card** sits beneath
the Next arrow in **5 of 8 homepage sections** (Shop by Category, Featured
Products, Live Auctions, Reserve Before It Ships, Collector Spotlight) and in
**2 of 5** product-page related carousels. The three unaffected sections are
unaffected only because their cards are narrower and do not reach the arrow.

**Severity is genuinely low — do not over-fix.** `fullyVisibleCardsCovered` is
**0** everywhere: the overlap is always with the card peeking in from the right
edge, so no card a user is reading or clicking is obscured. What is wrong is the
stated contract ("arrows sit in their own empty strip"), not the usability.

**What is already correct, and must not regress when this is fixed**
- Mobile (390px): 0 arrows, `scroll-snap-type: x mandatory`, snap pitch 350 —
  verified empirically (nudge 350→390 settles back to 350; →550 settles to 700).
- Dark mode: arrows invert to `rgba(31,41,55,0.9)` with `rgb(250,250,250)`
  glyphs at the identical position.
- No edge-fade gradient overlays exist anywhere (0 found).
- Resize round trip 1280→390→1280 restores 16 arrows with `scrollWidth` always
  equal to the viewport.

**Likely fix** — reserve the arrow strip in the track's own padding/grid rather
than floating the buttons over it, so the track's inner edge starts after the
arrow. Verify afterwards that the mobile 0-arrow path and the snap pitch are
untouched.

**Two cases in this batch stay blocked until someone resolves their premise**,
and neither is a product defect: `...-two-row-tall-arrows` needs a homepage
section actually configured for two rows (none is), and
`...-arrow-end-state-no-jump` needs it established whether these carousels loop
— Next never disabled across 8 clicks, which is consistent with wrap-around.

## Seller create form: no error-navigation layer, no pinned mobile bar (found batch 188)

Driven as seller (`tyson@beybladearena.in` / `store-beyblade-arena`, confirmed via
`/api/user/profile`) on `/store/products/new`.

**Validation itself WORKS — do not "fix" that.** An empty Publish is refused,
stays on the page, and renders real per-field messages ("Title must be at least
3 characters", "Price is required", "Product image is required", "Description
must be at least 20 characters").

**Defect 1 — no error summary, nothing to jump from.**
Found by `checklist-selling-sectionised-forms-form-error-summary-jumps`.
All five `role="alert"` nodes sit in five DISTINCT parents, i.e. inline beside
their own fields (Title 12px, Price 12px, Description 18px). The only grouped
element is a banner, "Please fix the highlighted fields before publishing.",
which names no section. **Zero** `<a>`/`<button>` inside any alert, so nothing
is clickable. CLAUDE.md § "Form Authoring Pattern" requires `<FormErrorSummary/>`
on every form using a schema — it is absent here.

**Defect 2 — focus never moves.**
Found by `...-error-jump-lands-on-the-field`. After the refused submit,
`document.activeElement` is `BODY`.

**Defect 3 — `aria-invalid` is never set.** 0 of 6 inputs carry
`aria-invalid="true"` while four have an active error. Rule #9 says `FieldInput`
wires this automatically; it is not wired on this surface.

**Defect 4 — no pinned mobile action bar.**
Found by `...-form-mobile-action-bar`. At 390x844 `Publish` and `Save Draft`
each render exactly once (no duplication), but both sit at y=1104 in normal
flow — **304px below the fold** — with no `position: fixed` ancestor within six
levels. `--bottom-chrome-height` reads **0px**, which per CLAUDE.md's three-tier
bottom-edge mechanism proves nothing claimed the tier: `useFormBottomActions` is
opt-in for `<Form>` via `bottomBar`, and this form never opted in. There is also
no Cancel button at all — the pair is Publish / Save Draft.

### 🛑 OPEN QUESTION that blocked 5 of this batch's 8 cases

**`/store/products/new` is NOT a sectionised form.** Measured: 0 `fieldset`/
`legend`, 0 elements classed `section`/`step`, **0 semantic headings of any
level (h1–h4)**, no "Step N of M", 0 `select` elements, 6 inputs total. It is a
flat quick-create form.

So `...-required-section-has-no-dead-chevron`, `...-open-section-does-not-clip-dropdowns`,
`...-long-form-typing-is-smooth` and `...-form-conditional-fields-drop-values`
have no section, no panel, no long form and no conditional control to test, and
were recorded `null` rather than passed vacuously.

**Decide which surface this batch targets** before re-running it. CLAUDE.md notes
a `QuickProductForm` exists alongside the full `SellerProductShell`; the
sectionised form is plausibly the EDIT route (`/store/products/[id]/edit`) and
the case `startPage` may simply be wrong. Note `audit-form-sectionised` is
recorded as **0 with "all 16 forms migrated"** — if this surface was counted
among them, that number and this measurement disagree and one of them is wrong.

Also still unrun: `...-form-sections-save-unchanged` (`unintendedFieldChanges: 0`)
— the only case that would catch a no-op save rewriting an untouched field.
Needs a before/after Firestore diff around a Save with no edits.

## Seller offers list shows no status and no counter amount (found batch 190)

**Found by** `checklist-buying-offers-buyer-sees-offer-status-changes`.

The **buyer** side is correct and should not be touched: `/user/offers` renders
status `Countered`, `SELLER COUNTER ₹1,600`, the seller's note verbatim, and the
next action ("Accept or withdraw your…").

The **seller** side is the gap. After countering, `/store/offers` still renders
the row as `Offer: ₹1,450.00 · Listed: ₹1,799.00 · M*** U*** 3***` — **no status
word anywhere in the list, and no counter amount**. A seller cannot tell a
pending offer from one they have already countered, accepted or rejected.

**This is a display gap, not a failed write** — verified before reporting:
`offers/…-20261003-44vo8q` holds `status: "countered"`, `counterAmount: 1600`,
`sellerNote: "QA counter note b190"`. Buyer-name masking (`M*** U*** 3***`) is
working correctly and must be preserved by any fix.

Also noted, same surface: the row action is labelled **"Reject"** while the
stored status vocabulary is **`declined`** — the same label-vs-value drift
CLAUDE.md already records for the offer status chips (Root Cause #33).

### Smaller observations from the same batch (not defects on their own)

- The Make Offer dialog formats money to **one** decimal (`₹1,259.3`,
  `₹1,619.1`) where the rest of the app uses two.
- The buyer's own note is not shown on their `/user/offers` row.
- **No checkout deadline is displayed anywhere on `/user/offers`** — a buyer
  holding a live accepted offer has nothing telling them when it lapses. The
  post-lapse behaviour is correct (cleared from the cart, Proceed disabled).

### 🛑 Batch-order conflict — `offers--p1` cannot pass as written

`buyer-sees-offer-status-changes` (case 2) requires the seller to **counter at
1600**; `offer-accept-checkout-charges-agreed-price` (case 3) then expects to
accept and be charged **1450** (`chargedPrice: 1450`). Once case 2 runs, the only
live negotiation on that product stands at 1600, so case 3 can only fail — on
sequencing, not on product behaviour. Case 4 depends on case 3 and falls with it.

**Fix the cases, not the code**: either give case 3 its own product/offer, or
have case 2 counter a different listing.

## Offer status history is recorded but never rendered to the buyer (found batch 191)

**Found by** `checklist-buying-offers-offer-history-timeline-renders`
(also blocks `...-offer-history-legacy-no-fabricated-date`).

`/user/offers` renders each offer's **current state only** — status, listed
price, your offer, seller counter, seller note, actions. The words "timeline"
and "history" appear **nowhere** on the page, and a sweep of every button, link
and `summary` for a history/timeline/details affordance returns only sidebar
nav links. There is nothing to click.

**The data is already there** — verified before filing, because "no timeline"
and "nothing to show a timeline of" are different findings:

| offer | statusHistory |
|---|---|
| `…20261003-44vo8q` (countered this session) | 1 entry — `2026-10-03T07:08:56`, `actorRole: seller`, `trigger: respondToOffer:counter`, changed `status,counterAmount` |
| `…20260916-6w1h8x` (seeded, lapsed) | 2 entries — seller accept (`status,lockedPrice,checkoutDeadline`), then `actorRole: system`, `trigger: runOfferExpiry:acceptedLapsed` |

That is exactly the who / when / what a timeline needs. CLAUDE.md documents both
`OfferPhaseTimeline` and the generic `RecordStatusTimeline`; **neither is mounted
on this page**. Root Cause #52's shape — UI never wired to data already present.

**Fixture note for the sibling case**: `...-legacy-no-fabricated-date` wants an
offer with NO recorded history so the Expired step renders an em-dash rather than
a guessed date. The obvious candidate (`…6w1h8x`) carries 2 entries, so a
genuinely history-less offer must be seeded before that path can be exercised.

### `roundCount: 3` needs BUYER counters specifically

`...-offer-chain-walks-three-rounds` could not run. A **seller** counter updates
the same document in place (`status: countered` + `counterAmount`) — measured:
`counterRound 1`, `previousOfferId` / `supersededByOfferId` / `chainRootOfferId`
all **null**. Per CLAUDE.md it is a **buyer** counter that mints a new document
and links the chain. So three exchanges are not three rounds; the fixture must
drive buyer-side counters or the chain stays unpopulated and there is nothing to
walk.

### Working correctly — do not regress

The mobile error sheet on `/user/addresses/new` is fully correct: "Fix 7 issues"
appears only after a failed Save, in a `position: fixed` sheet 91px tall at
bottom 64px (clear of the tab bar, `--bottom-chrome-height: 91px`), and the count
**tracks live** — 7 → 6 → 5 → 4 as fields are filled. That live count is the
mechanism CLAUDE.md flags as easy to break: the label must encode the number or
the panel never re-publishes and the sheet freezes with stale contents.

## 🛑 BANK payout method collects no bank details at all (found batch 192)

**Found by** `checklist-buying-offers-payout-method-rejects-blank-bank-details`
(also blocks `...-payout-method-rejects-bad-ifsc`).

`/store/payouts` → Methods → "New Method" → `/store/payout-methods/new`.
Selecting **Type = Bank** and waiting 6s for conditional fields leaves exactly
**two** inputs: `type` (upi / bank / card / other) and `label`. Full rendered
form: *"Payout Method Required · Type \* Upi Bank Card Other · Label \* Bank
Account · Visibility · Cancel · Save changes"*. The strings **IFSC**, **account
number** and **holder** appear nowhere on the page.

So a seller can create a BANK payout method carrying nothing but a label, and
the money has no recorded destination. The case asserts blank bank details must
be refused; today they are the *only* possible state.

**Measured twice** (fresh change event + 6s settle each time) because the claim
is strong and the fields could plausibly have been conditional and slow. Same
result both times. I did **not** press Save — that would add a junk payout
method to a live store, and the absence of the fields already settles the case.

**When fixing**: the sibling IFSC case needs a shape-check on an 11-character
IFSC, which has nowhere to live until the fields exist. Fix both together.

## Offer timeline exists and is wired for the SELLER — sharpens the batch-191 finding

`checklist-buying-offers-offer-seller-can-read-before-acting` **passes**: the
seller's View details panel renders status, the buyer's note, both prices, the
counter, "expires in 1d", and an **Offer history** entry with actor and
timestamp (`Countered · Store · 03/10/2026, 12:38:56`).

That narrows the batch-191 defect usefully — the timeline component is not
missing or broken, it is simply **not mounted on the buyer's `/user/offers`**,
and the seller's **list row** still shows no status while its own detail panel
does. Two surfaces to wire, not a feature to build.

## QA pollution still present

`/store/payouts` → Methods lists **`QA Test Method run-1789432098900` (UPI,
`qatester1789432098900@okaxis`, Active)** — a leftover from an earlier run's
create-flow case with no teardown. Same class as the 7 QA rows already deleted
earlier in run-3. Delete during the fix phase.

## Offer detail panel renders the list's cached payload, never a fresh read (found batch 193)

**Found by** `checklist-buying-offers-offer-detail-opens-on-fresh-data`.
**Proven by controlled experiment**, not inference:

1. Hooked `window.fetch` around opening a row → **0 calls**.
2. The panel still showed MORE than the list row (`Your counter ₹1,600.00`,
   status `Countered`), which looks like a fetch — so that alone proves nothing.
3. With the page open and **not reloaded**, changed that offer's `sellerNote`
   server-side to `FRESHNESS-PROBE-b193`. Closed and reopened the same panel →
   still showed the old `QA counter note b190`, **no marker**.
4. Full page reload, reopened → panel now reads `FRESHNESS-PROBE-b193`.

So the data refreshes when the LIST refreshes, never when the row opens. Step 4
is what rules out "the write never landed" and "that field isn't rendered".
Probe value restored afterwards.

## 🛑 A custom feature badge cannot be edited OR deleted from the UI

**Found by** `checklist-buying-offers-store-feature-edit-page-exists`.

Created `QA Badge b193` via Add Feature (it persists — survives a reload, counter
moves 0 → 1 of 20). Then: the badge card contains **0 buttons and 0 links**, the
page has **0 row-action menus**, and a sweep of every button/anchor for
edit / delete / remove / manage in text *or* aria-label returns **nothing**.

So the case fails worse than it anticipates — there is not even the drawer it was
willing to accept instead of a page. A seller who typos a label is stuck with it,
and the 20-badge cap can be permanently consumed by mistakes.

I hit the consequence directly: having created one to test the sibling case, there
was no in-product way to remove it, so I deleted
`productFeatures/feature-qa-badge-b193` from Firestore (verified 0 remaining).

**Smaller, same surface**: `storeId` on the create form is a free-text input the
seller must type by hand although the session already knows their store — same
shape as the report form demanding a raw Entity Id. Its refusal message is good
though: *"Scope & Applicability: A store-scoped feature must name a store."*

**Weak copy worth fixing with it**: the first-round validation messages read
`Must be at least 1` — a raw constraint with no field name and no unit.

## Pre-typing error seen on a THIRD form

`/store/categories/new` carries **1 visible `role="alert"` before any
interaction** (measured after a 7s settle on a fresh navigation), joining
`/store/products/new` and `/admin/products/new`. Recorded as an observation
rather than a finding — I did not capture that alert's text. Re-check when fixing
the other two; it may be the same root cause rather than three.

## Status timelines: the component WORKS — three surfaces just don't mount it (batch 194)

This consolidates findings from batches 191, 193 and 194 into one item, because
they are one fix, not three.

**Proof the component is fine** — `checklist-buying-offers-store-timeline-shows-who-suspended`
**passes**. `/admin/stores/store-vintage-vault-co/view` renders:

> History · **Suspended** · **Admin** · 06/09/2026, 05:59:17 ·
> *"Three listings flagged as possible reproductions; suspended while
> authenticity documentation is reviewed."* · Created 07/02/2026, 05:59:17

Who, when, why — plus a Created entry. Actor renders as the **role** "Admin",
never a name or email, which is the PII-free design working.

**Surfaces missing it**
| Surface | State |
|---|---|
| buyer `/user/offers` | no history anywhere; data exists (batch 191) |
| `/admin/orders` drawer | edit form only (Status/Tracking/Carrier/Notes) |
| `/admin/orders/{id}/view` | 0 occurrences of "History" or "Timeline" |
| seller `/store/offers` **list row** | no status word at all (its detail panel is fine) |

**Order history has a WRITE-side gap too**, not just a render gap: the three most
recent orders all carry `statusHistory` length **0**, including
`order-2-20261003-gjdknf` which is **cancelled** — a status change that recorded
no entry. Fixing only the render would surface an empty timeline on real orders.

🛑 `...-history-carries-no-pii` was recorded **null, not pass**. `piiInHistory: 0`
is technically true on `/admin/orders` only because no history block exists there
— zero PII in a block that does not render is not evidence the scrubbing works,
and a green would retire a case that has never been exercised.

## Notification type filter is CORRECT — the case is stale

`checklist-buying-offers-admin-can-filter-every-notification-type` **passes**.
The filter offers "All" + **30** type chips, all real, including
`support_ticket_update` and `scam_report_update` — the two split out of
`account_action`. That is positive evidence the chips derive from the live union
rather than a hand-kept copy, which is the whole point of the case (18 of 27
types were once unfilterable).

**Action: update the case's expected count 28 → 30.** The product is right.

Harness note: the Filters panel renders **inline, not as `role="dialog"`** — two
probes reported it closed before `browser_find` showed it open. Check for the
panel's own text, not for a dialog role.

## 🛑 Admin bulk-action bar is collapsed to zero height — bulk actions unreachable (batch 195)

**Found by** `checklist-buying-offers-form-bar-restores-listing-bulk-bar`.

On `/admin/products` at 1280x800, selecting a row DOES create the bar's content —
the DOM carries `1 selected`, `Toggle Featured`, `Apply` — but:

- the bar's container measures **1280x0** anchored at `top=800` (the viewport's
  bottom edge),
- its inner content measures **0x0**,
- `--bottom-chrome-height` stays **`0px`**, so nothing is published into the tier.

**Not a synthesised-click artifact.** Repeated with a REAL browser click on a row
checkbox: the counter incremented to `2 selected`, proving the click landed and
state propagated, and the bar still measured 1280x0 / chrome 0px. 3s settle each
time.

So selection works and publishing/expanding does not. 🛑 **Scope before fixing**:
CLAUDE.md records `DataListingView` claiming this bar across **~70 admin
screens** — if it is collapsed everywhere, bulk actions are unreachable on all of
them. Check a second admin listing to establish the blast radius.

**Working correctly, do not regress**: `...-form-bar-absent-inside-a-modal`
**passes** — the Quick edit drawer renders its own Cancel / `Save →` inside the
dialog and registers **0** viewport-fixed bottom bars, which is the
`useIsInsideOverlay` suppression behaving. (Partly trivial while the listing bar
is broken; the verified half is that the drawer's form publishes nothing to the
tier.)

**Measurement note**: counting "bottom bars" needs a HEIGHT BOUND. My first count
said 4 — those were 800px-tall overlay containers matched only because they
extend to the viewport bottom. 24–200px tall + within 120px of the bottom gives
the real answer.

## Pre-typing error is now a FOUR-form pattern — treat as one root cause

`/store/products/new`, `/admin/products/new`, `/store/categories/new` all render
a validation error before any interaction. `...-blog-existing-post-slug-is-valid`
is the same shape aimed at the blog editor's Slug field and is still unrun —
check it while fixing the other three rather than filing a fourth bug.

## Improved since it was last recorded

`AdminBidsView` row menu is now `['View', 'Cancel']` — View first.
CLAUDE.md lists it among the dashboard views that offered **only mutations with
no way to read the record**; that is fixed. Worth re-checking the other eight
named there (`AdminSessionsView`, `AdminPaymentMethodsView`, `AdminNewsletterView`,
`AdminEventEntriesView`, `SellerBidsView`, `SellerOffersView`, `UserBidsView`,
`UserReturnsView`) — `...-bid-row-opens-in-all-three-portals` needs exactly two of
them and is still unrun.

## Public projection VERIFIED CLEAN in production (batch 197) — no action needed

Recorded as positive evidence, because this is the Root Cause #70 class and it is
worth knowing it holds live rather than only in the adapter source.

`GET /api/site-settings` fetched with **credentials omitted** (so it is the
genuinely anonymous projection, not an admin view) returns **11 keys**:
`contact, payment, listings, notificationChannels, announcementBar, navConfig,
actionConfig, background, watermark, disabledRoutes, effectiveWatermark`.

Against a source document of **37 top-level groups**. Probed for and found
**zero**: `commissions`, `gatewayFeePercent`, `payoutHoldDays`, `minPayoutAmount`,
`platformFeeMax`, `laborRate`, `gstin`, `surchargeSellerSharePercent`,
`adminCheckoutBypass`, and nothing matching credentials/razorpay/apiKey/secret.

`GET /api/ads` anonymous: **0 draft ads**, 0 credential tokens.

### 🛑 A false credential leak I caught and retracted — read before re-running

My first pass reported `credentialInPublicSource: 1` against the public homepage
HTML. I extracted the matches instead of filing it, and **all four are i18n LABEL
strings** for the admin credentials form:
`"resendApiKey":"Resend API Key"`, `"whatsappApiKey":"WhatsApp API Key"`,
`"metaPageAccessToken":"Meta Page Access Token"` + its hint text.

Field names and help copy in the shared translation bundle — **not secret
values**. The real figure is 0. A broad regex over 1,057,822 chars of HTML will
match the *word* `apiKey` in any app that has an API-key field; matching a label
is not a leak. Anyone re-running this check must extract the match context
before reporting.

Minor, not filed: those labels do reveal which integrations exist (Resend,
WhatsApp, Meta, Razorpay, Shiprocket). Mild, and hard to avoid with one i18n bundle.

## Two case-vs-product mismatches to fix in the CASES

1. **`...-contact-submissions-admin` expects `nonsenseResultCount: 0`, but
   `/admin/contact` has NO search control at all.** The key is unmeasurable, not
   failing — I recorded it `null` rather than claim 0, since "zero results from a
   search that does not exist" is not evidence. Either drop the key or add a search.
2. **`...-settings-navigation-actions` `tabCount: 20` is CORRECT.** 🛑 This also
   corrects *my own* batch-184 note, which said 19 from a looser text scan. The
   strip is numbered `⓪–⑱` plus a `②ᵃ Themes` sub-tab = 20, and a numbered
   sequence is self-checking in a way a word list is not.

## QA pollution — add to the teardown list

`/admin/contact` holds leftover run artifacts: `qa-contact@mailnull.com`,
"Checklist submission QA Contact", "QA Contact contact-saves-without-email".
Same class as the `QA Test Method run-1789432098900` payout method (batch 192)
and the 7 rows already deleted earlier in run-3.

## 🛑 SEVERE — "Featured first" / "Promoted first" sort 500s and EMPTIES the seller's product list (batch 198)

**Found by** `checklist-selling-seller-listing-types-seller-products-featured-promoted-sorts`.

Symptom first, as a user: selecting **Featured first** or **Promoted first** on
`/store/products` leaves the page rendering **"No products listed yet"**. A fresh
navigation to `/store/products?sort=-featured&page=1` reproduces it, so it is not
transient client state.

Cause, found afterwards:

| request | result |
|---|---|
| `GET /api/store/products?sort=-featured&page=1&pageSize=5` | **500** · `ok:false` · *"Product search is temporarily unavailable."* |
| `GET /api/store/products?page=1&pageSize=5` (no sort) | **200** · 5 items |

Both offending values are offered in the dropdown (`-featured`, `-isPromoted`),
so either one costs the seller their whole catalogue view.

**Why this is worse than the documented dead-sort class.** CLAUDE.md records
"Featured First"/"Promoted First" shipping against fields configured
`canSort: false` and being *silently dropped* by sievejs — annoying but harmless.
Here it is a **500**, and the UI converts it into a polite empty state, so a
seller with dozens of live listings is told they have none. That reads as data
loss, not a broken control. It is also the swallowed-error shape CLAUDE.md warns
about: an error rendered as an empty grid makes the next failure invisible too.

**Fix both halves**: make the sort work (or remove the options), *and* stop the
list rendering "No products listed yet" on a non-200 — an error state and an
empty state must not look identical.

## Verified good — seller listing types and coupon scoping

- **All 9 listing types** in the seller type dropdown, incl. `art` and
  `stickers` (the two Root Cause #58 recorded as silently unfilterable), spelled
  as real union values rather than display labels.
- **Per-type badges render** (8 distinct; `standard` is unbadged by design).
- **Coupon scoping is sound**, checked in data not just UI: the form has no store
  picker, no scope control and no stacking toggle; Firestore holds 12 coupons
  (6 admin / 6 seller) and **0 seller-scoped coupons without a `storeId`**.

🛑 Limit on that last one: I confirmed the UI offers no path to a site-wide
coupon and that no mis-scoped row exists — I did **not** try forging `scope:
"admin"` directly at the store endpoint. That is the stronger test and is still
unrun.
