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
