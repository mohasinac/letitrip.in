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
