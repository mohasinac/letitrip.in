# Testing status

Generated 2026-09-10T20:26:26.061Z by `scripts/build-testing-status.mjs`.

> Every number here is computed from the verdict files in
> `tester/.tester-runs/*/verdicts/`. The FIXED / OPEN / NOT-A-BUG column is
> hand-authored — a script can say a case failed, but only reading the code
> says whether the fix shipped.

## 1. Run history

| run | date | batches | pass | fail | blocked |
|---|---|---|---|---|---|
| `smoke1` | 2026-09-04 | 1 | 8 | 1 | 11 |
| `all1` | 2026-09-05 | 2 | 11 | 4 | 12 |
| `live1` | 2026-09-05 | 3 | 2 | 0 | 4 |
| `v2` | 2026-09-06 | 3 | 3 | 3 | 17 |
| `sweep1` | 2026-09-07 | 25 | 63 | 32 | 59 |

**39 distinct cases have failed at least once.** `sweep1` was stopped
at 25 of 206 batches — not because it was failing, but because ~40% of its
remaining cases were heading for "blocked" against fixtures the harness had
deleted and windows that had already expired.

## 2. Fixed — 16

Shipped in appkit 4.35.3 / 4.35.4 plus consumer changes, deployed and verified.

### Editing display name / bio saves correctly

- `checklist-account-auth-profile-settings-edit-profile` · seen in: `sweep1`
- **Evidence** — After reload, Profile Details still shows 'Rehan Sheikh' and an empty bio — not the saved values. The PATCH to /api/user/profile returned 200 with the updated displayName and bio in the response body, confirming the data reached Firestore. However, the GET /api/user/profile endpoint only returns a minimal session-level object (uid, email, role — no displayName or bio), so the UI falls back to the Firebase auth token name 'Rehan Sheikh'. The save writes to the right place but the read path never exposes it.
- **Resolution** — GET /api/user/profile read document-backed fields off the SESSION. Now reads the document.

### Uploading a profile avatar works

- `checklist-account-auth-profile-settings-avatar-upload` · seen in: `sweep1`
- **Evidence** — After reload, the Edit Profile section shows the 'RS' initial-letter placeholder, not the uploaded image. The signed-URL flow completed correctly (POST /api/media/sign → upload → POST /api/media/finalize 201 → PATCH /api/user/profile 200), so the photoURL was stored in Firestore. Same root cause as edit-profile: the GET /api/user/profile endpoint does not return photoURL, so the UI falls back to the Firebase auth photoURL (a placehold.co placeholder) on every reload.
- **Resolution** — Same cause as edit-profile — photoURL came from the stale Auth token.

### Notification preferences save correctly

- `checklist-account-auth-profile-settings-notification-prefs` · seen in: `sweep1`
- **Evidence** — After reload, both Email and Promotions switches are back to on. The 'Save preferences' button click fired no write request — no PATCH or POST to /api/user/notification-preferences appeared in the network log at all. The only notification-related request was a GET /api/user/notification-preferences on the subsequent page load.
- **Resolution** — The PUT always persisted; the GET read the session and returned all-true defaults. Now reads the document.

### Public profile visibility toggle works

- `checklist-account-auth-profile-settings-public-profile-toggle` · seen in: `sweep1`
- **Evidence** — After reload, 'Profile visibility: Public' is still shown — the Private setting did not persist. The only PATCH to /api/user/profile during the save had request body {"uiPreferences":{"sectionState":{...}}} — the profileIsPublic field was not included. The visibility checkbox change was not submitted with the save.
- **Resolution** — publicProfile is not in the session at all, so the page rendered its default. Verified stored isPublic=false while the UI showed 'Public'.

### Admin dashboard's Testing section shows both the Tester Checklist and Tester Feedback (results) links

- `checklist-account-auth-testing-program-admin-testing-section` · seen in: `sweep1`
- **Evidence** — The admin sidebar has no 'Testing' section. On /admin/dashboard the Admin Panel nav is empty — searching 'test' returns 'No matches for "test"'. The sidebar shows only: Profile, Dashboard, Browse, Support. Both destination pages exist (/admin/tester-checklist renders a search UI; /admin/tester-feedback shows 'Tester feedback' in breadcrumb), but the sidebar links to reach them are absent. expectedUiState fails.
- **Resolution** — Admin sidebar rendered empty: permissions===null means admin, but that was honoured only when no navConfig existed. isAdmin now passes through filterNavItems.

### Every listing card shows a "by <seller>" line

- `checklist-buying-browsing-search-card-shows-seller-name` · seen in: `sweep1`
- **Evidence** — On /products (grid view) and /products (list view), pre-order cards show 'by store-beyblade-arena' (raw slug). On /pre-orders, all 5 visible cards show 'by store-beyblade-arena'. /auctions and /prize-draws cards correctly show readable names ('by Beyblade Arena', 'by LetItRip Official'). The raw slug is present on standard product cards for pre-order type listings on /products and all cards on /pre-orders.
- **Resolution** — Cards showed the raw slug 'by store-beyblade-arena'. Slug fallback is now humanised across all six card variants.

### Increasing quantity in the cart is capped at the listing's available stock, with a clear message

- `checklist-buying-buying-checkout-add-to-cart-max-quantity` · seen in: `sweep1`
- **Evidence** — Added product-tester-standard-1 to cart (stock: 10) and clicked '+' repeatedly. Quantity incremented past 10 and reached 11 with no cap. The '+' (Increase quantity) button was never disabled and no cap message appeared. expectedBehaviour (capped at stock) and expectedData.maxSelectableQuantity: 10 both fail.
- **Resolution** — NOTHING in the quantity path consulted the product — .max(99) is a sanity bound, not inventory. PATCH now 409s above stock. Real overselling exposure.

### Checkout flow completes without errors

- `checklist-buying-buying-checkout-checkout-flow` · seen in: `sweep1`
- **Evidence** — Steps 1-8 executed: added product-tester-standard-1, went to /cart, clicked Proceed to checkout, selected 'Home — 123 Stadium Lane' address on Step 1, clicked Continue, reached Step 2 (Extras & fees). Clicking 'Continue to payment' on Step 2 triggered React error #310 (Minified React error in renderStep/useMemo) and showed 'Something went wrong — An unexpected error occurred. Please try again.' on every attempt. Checkout flow never reached the payment step. Crash is reproducible.
- **Resolution** — React #310 at step 2->3. Two render helpers called React.useMemo, so payment rendered N+1 hooks. Hoisted to module consts.

### The full checkout flow (cart → address → payment → confirmation) is usable and correctly laid out on a mobile viewport

- `checklist-buying-buying-checkout-checkout-mobile-responsive` · seen in: `sweep1`
- **Evidence** — Steps 1 and 2 of checkout rendered correctly on 390x844 (no horizontal scroll, stacked layout, all controls reachable). Step 3 (payment) crashed with React error #310 (invalid hook call inside useMemo in renderStep), showing 'Something went wrong — An unexpected error occurred.' The flow is not fully usable on mobile because the payment step is unreachable.
- **Resolution** — Same #310 crash — the payment step was unreachable on mobile too.

### An image whose upstream host is unreachable shows a neutral "Image unavailable" tile, not a broken-image icon

- `checklist-buying-product-detail-unreachable-image-degrades-to-placeholder` · seen in: `sweep1`
- **Evidence** — Navigated to /api/media/ext?url=https%3A%2F%2Fexample.invalid%2Fx.png directly. The browser tab shows 'This page contains the following errors: error on line 9 at column 9: Unexpected token "--" before "a"' — the SVG contains an XML comment with "--" in the body which triggers the browser's strict XML parser error. The API itself is correct: status 200, Content-Type image/svg+xml, X-Media-Placeholder: 1, Cache-Control max-age=60. But expectedUiState requires the tab to render an SVG tile reading 'Image unavailable'; instead it shows an XML parse error page.
- **Resolution** — The placeholder SVG was invalid XML — its own comment contained '--' from naming a CSS var in its real var() spelling. The fallback for a broken image was itself broken. Confirmed valid live.

### The video/YouTube-embed lightbox has a real minimum size on both mobile and desktop, and the top-bar "expand" button toggles real browser fullscreen

- `checklist-buying-product-detail-video-lightbox-fullscreen-sizing` · seen in: `sweep1`
- **Evidence** — Sizing and expand button work: mobile (375px) video area 343×619px, desktop (1280px) 1152×672px — both well above 150px default ✓. Clicking expand button changes label 'Enter fullscreen'→'Exit fullscreen' and engages native Fullscreen API (document.fullscreenElement truthy) ✓. FAIL: pressing Escape closed the lightbox entirely (lightboxStillOpen=false) rather than just exiting fullscreen while keeping the lightbox open. expectedUiState requires 'Escape exits and the glyph reverts, with the video still in the lightbox rather than the lightbox having closed.'
- **Resolution** — Partial: Escape now leaves fullscreen instead of tearing down the whole lightbox. The sizing half of the case already passed.

### SIGNED OUT, no product on /products has an id containing "tester" — the sandbox is invisible to the public

- `checklist-buying-product-detail-tester-fixtures-hidden-from-the-public` · seen in: `sweep1`
- **Evidence** — First half passes: guest view of /products shows no tester-slug cards across all pages. Second half fails: signing in as tester@letitrip.in and reloading /products still shows no sandbox items (e.g. 'Test Gadget — Standard Listing #1') in the grid on any tab or page. The items are directly accessible by their URL but never appear in the /products listing when browsed as a tester.
- **Resolution** — Guest invisibility was correct; a signed-in TESTER also could not see sandbox rows. SSR passes no viewer and staleTime:Infinity froze it. useProducts now keys the query on viewer class so testers refetch; public visitors keep the cached paint (NOT by making SSR dynamic — that would be Root Cause #82).

### Uploading a real video file via the product form's "Upload" tab (not YouTube or External URL) plays back correctly with an auto-captured poster frame

- `checklist-buying-product-detail-video-real-file-upload` · seen in: `sweep1`
- **Evidence** — Both the gallery upload and the dedicated video Upload tab failed immediately with 'Upload failed' toast. Network shows /api/media/sign returned HTTP 400, then 500 on retry. The signed-URL generation is broken server-side; no bytes were transferred to storage and no poster frame appeared.
- **Resolution** — /api/media/sign 500'd: SellerProductShell omitted `category`, so slugify(undefined) threw inside the generator. Caller fixed; the guard now converts any generator throw into an actionable 400.

### Buying a prize-draw entry correctly assigns a prize once payment is confirmed (instant mode) or shows a pending state until the draw closes (scheduled mode)

- `checklist-buying-product-detail-prizedraw-buy-reveal` · seen in: `sweep1`
- **Evidence** — Clicking 'Buy now' on /prize-draws/prizedraw-tester-sandbox-1 opens the checkout URL with directItem param. The checkout page loaded but the order summary showed ₹0.00 subtotal with 'Calculating shipping & fees…' stuck indefinitely — the prize draw item never loaded into the checkout. The Continue button remained disabled throughout; no payment step was reachable and no order was placed.
- **Resolution** — Blocked by the same #310 crash; the order summary never left 'Calculating shipping & fees...'.

### Purchasing a bundle works and shows all included items in the order

- `checklist-buying-product-detail-bundle-purchase` · seen in: `sweep1`
- **Evidence** — Bundle checkout started correctly at ₹199.00. Step 1 (address selection) completed successfully. Step 2 (Add-ons & fees) loaded. Clicking Continue on step 2 triggered React error #310 thrown inside renderStep — the page replaced with 'Something went wrong — An unexpected error occurred. Please try again.' No order was placed.
- **Resolution** — Blocked by the same #310 crash at the Add-ons -> payment transition.

### Purchasing a digital-code listing delivers the code to the buyer post-purchase

- `checklist-buying-product-detail-digitalcode-delivery` · seen in: `sweep1`
- **Evidence** — Navigated to /digital-codes/digitalcode-tester-sandbox-1, clicked 'Buy Now', reached checkout. Address selected, step 1 completed. Step 2 (Add-ons & fees) loaded. Clicking Continue on step 2 triggered React error #310 thrown inside renderStep — same crash as bundle-purchase (case 4). Page replaced with 'Something went wrong — An unexpected error occurred. Please try again.' No order was placed and no digital code was delivered.
- **Resolution** — Blocked by the same #310 crash before the payment step.

## 3. Not a bug — 1

The case failed, but the product was right. Recorded explicitly because each of these nearly cost a "fix" to working code.

### An auction detail page's Bid History section shows the most recent bid first and paginates once there are more bids than fit on one page (try the L-Drago auction — 13 seeded bids)

- `checklist-buying-bidding-bid-history-auction-detail-pagination` · seen in: `sweep1`
- **Evidence** — Bid History accordion opened but showed only 1 row (₹3,399.00, R*** S***, 7 Sept 18:32) with no pagination controls. Badge on the accordion header reads '1', not the 13 seeded bids or 14 total the sticky bar shows. expectedUiState requires page 1 to show 5 rows newest-first with a visible pagination control — neither holds. expectedBehaviour requires 3 pages of 5 bids — not observable. No bids API request was made when the accordion opened; the single bid appears to be server-rendered inline. The top bid is ₹3,399.00 (not ₹3,199.00 as expected, consistent with 14 live bids rather than 13 seeded ones, but irrelevant — there is no pagination regardless).
- **Resolution** — The pagination code was always correct. The tester saw one bid because tester:setup DELETES bids (CASCADE tier) and never re-seeded them. Fixed as a HARNESS defect (SEED_TRANSACTIONAL), not a product one. My own first re-check also read total:1 — from a CACHED response (X-Vercel-Cache: HIT, Age: 293). Cache-busted: 5 items, total 14, 3 pages.

## 4. Still open — 22

Reproduced and unfixed. Items marked *deferred* were a deliberate call, not an oversight.

### After placing a bid, the current bid amount and bid count update immediately on the auction page for the bidder — no manual page refresh needed

- `checklist-buying-bidding-place-bid-live-self` · seen in: `all1`, `v2`
- **Evidence** — Tested on auction-tester-sandbox-cycle-2 (active). After placing a ₹16,000 bid from rehan.sheikh@gmail.com, the auction page still showed 0 bids and ₹15,000 for 10+ seconds with no live update. Current bid and count only corrected after a manual page reload (showed ₹17,000, 1 bid — pre-existing bids were present).
- **Note** — Live bid updates do not reach the bidder's own page without a reload (SSE/live-update path).

### A bid below current bid + minimum increment is rejected with a clear inline error on the amount field — and the rejection is identical whether it is typed in Custom mode or forced through the API

- `checklist-buying-bidding-bid-below-current-plus-increment-rejected` · seen in: `all1`
- **Evidence** — Bidding ₹16,500 (between current ₹16,000 and minimum ₹17,000) correctly showed inline error 'Bid must be at least ₹17,000.00'. However, bidding ₹15,000 (below the current bid of ₹16,000) showed the same 'Bid must be at least ₹17,000.00' message instead of the required distinct 'must exceed the current winning bid' message.

### On an auction with NO bids yet, the seller's starting bid is itself an acceptable opening bid — you are not forced to bid starting bid + increment

- `checklist-buying-bidding-first-bid-can-equal-starting-bid` · seen in: `all1`
- **Evidence** — Clicking Place Bid with the Minimum preset (₹15,000 = starting bid) selected produced client-side error 'The information provided is not valid.' on both cycle-1 and cycle-3. The bid was not submitted; 0 bids remained. The HTML input is readonly in preset mode with value=15000, min=15000, HTML validity=true — the React form layer rejects it.

### Removing a slot somebody already pulled is refused, by number

- `checklist-page-wiring-data-loss-lottery-booked-slot-cannot-be-deleted` · seen in: `all1`
- **Evidence** — Deleted slot 1 (Charizard Base Set Holo, booked by Ravi K, lotteryNumber 1) in the editor and clicked 'Update lottery'. Save succeeded with no error or refusal message — redirected straight to /admin/lotteries. API confirmed total slots dropped from 25 to 24; original slot 1 (Charizard) was gone and remaining slots renumbered.

### Searching on /faqs returns matching questions

- `checklist-content-discovery-search-search-faqs` · seen in: `smoke1`
- **Evidence** — Searching /faqs finds matches but renders none. With "shipping" typed, the sidebar counts update to show 14 matching FAQs, while the results pane reads "0 questions" and lists nothing.

### "View public profile" is easy to find and works from three places: the My Account dashboard header, the My Account quick-links grid ("My Public Profile" tile), and the /user/profile page (next to "Manage Addresses")

- `checklist-account-auth-profile-settings-own-public-profile-quick-links` · seen in: `sweep1`
- **Evidence** — All three entry points (dashboard header 'View public profile →', quick-links grid 'My Public Profile' tile, and /user/profile 'View Public Profile' link) correctly resolve to /profile/user-yugi-muto. However, navigating to that URL renders '404 — Page not found' with title 'Profile Not Found | LetItRip' — even when signed in as the profile owner. expectedUiState requires the public profile page to render for the owner; it does not. The profile visibility appears to have been set to Private on the server (likely by a prior test run), and the owner is not granted bypass access.
- **Note** — The three entry points resolve correctly; the profile 404s because publicProfile.isPublic is false. Offering the owner a link to their own private profile is the real UX defect.

### Signed-in admin accounts can open the Tester Hub and see the same checklist as testers

- `checklist-account-auth-testing-program-admin-tester-access` · seen in: `sweep1`
- **Evidence** — /user/tester returns HTTP 404 with heading '404 — This page could not be found.' The Tester Hub route does not exist; admin gets the same 404 a guest would.
- **Note** — Spec question rather than a defect: /user/tester exists but the admin lacks canTestAdmin. Either the fixture grants it or role=admin should imply hub access. Part D1 resolves it by raising the tester's powers.

### In an admin/seller listing's filter drawer, every Status option reads as words (Published / Draft / In Review / Archived) — never a raw key like "filters.statusInReview"

- `checklist-buying-browsing-search-product-filter-status-labels` · seen in: `sweep1`
- **Evidence** — Signed in as admin@letitrip.in. Opened /products and clicked Filters. The drawer contains sections: Listing type, Category, Condition, Price Range, Brand, Shipping, Bundles, Features. No Status section exists anywhere in the drawer. Both expectedBehaviour (status options show readable labels) and expectedUiState (Status section with Published/Draft/In Review/Archived) fail because the section is entirely absent.

### Opening the desktop filter sidebar drops ONE column and keeps the cards the same size

- `checklist-buying-browsing-search-grid-follows-sidebar-not-viewport` · seen in: `sweep1`
- **Evidence** — At 1440px, the Filters button opens an absolute-positioned overlay panel (x=1056, width=384px) — not an inline sidebar that narrows the grid container. Grid remains 4 cards per row (262px each) both before and after opening the filter panel. The grid container width does not change when the overlay opens.

### On a homepage section rendered as a double row (e.g. Auctions), the left/right scroll arrows are tall slivers spanning the full row height, not small circular buttons

- `checklist-buying-browsing-search-compare-double-row-arrows` · seen in: `sweep1`
- **Evidence** — Arrows are 36x36px circular buttons (appkit-hscroller__arrow--md class), not tall slivers spanning the full double-row height. No double-row layout with full-height arrows found on the Live Auctions section.

### The "Show sold" / "Show ended" / "Show closed" toggle on Products/Auctions/Prize Draws listing pages is off by default (hiding sold-out/ended/closed items) and reveals them when switched on

- `checklist-buying-browsing-search-show-sold-toggle-reveals-items` · seen in: `sweep1`
- **Evidence** — Specific tester fixture items not found: 'Test Collectible — Sold Out (Hidden by Default)' (product-tester-standard-sold) absent from Sold & Ended tab on /products; 'Test Auction — Already Won' (auction-tester-sandbox-won) absent from Ended tab on /auctions; 'Test Prize Draw — Already Closed' (prizedraw-tester-sandbox-closed) absent from Ended tab on /prize-draws. Additionally the prize-draws tab is labelled 'Ended' not 'Closed' as the case expects.

### Applying exactly ONE listing type changes the Sort dropdown to that type's own sorts — Auctions alone offers "Ending Soon", Pre-Orders alone offers "Earliest Delivery"

- `checklist-buying-browsing-search-product-type-chip-drives-sort-options` · seen in: `sweep1`
- **Evidence** — With only Auctions selected, sort showed 'Just Started' (an auction-specific sort) but not 'Ending Soon'. With Auctions+Pre-Orders both selected, sort showed only 'Just Started' instead of generic sorts (Newest First, Price, Name). The expected type-specific sorts (Ending Soon for Auctions, Earliest Delivery for Pre-Orders) and the expected generic-only fallback for multiple types were not confirmed.

### The applied listing types are reflected in the URL and survive a reload and the browser Back button

- `checklist-buying-browsing-search-product-type-selection-survives-reload` · seen in: `sweep1`
- **Evidence** — URL encoding works (listingType=auction%7Cart in URL after applying Auctions+Art). New tab opened with that URL: Auctions and Art checkboxes are ticked and grid shows Auction and Art Print cards — both correct. However, pressing Back from the filtered URL does not restore /products (unfiltered); instead it skips past /products entirely and lands on / (homepage). Expected: Back restores previous filter state (/products unfiltered). Observed: Back goes to / (homepage). expectedUiState for Back fails.

### Editing an existing shipping address from checkout works

- `checklist-buying-buying-checkout-shipping-address-edit` · seen in: `sweep1`
- **Evidence** — On Step 1 of checkout, no edit control was found on any address card. Checked accessibility tree, hovered over address cards, evaluated all buttons on page — only '+ Add new address' and 'Continue' buttons exist. No pencil, edit icon, or edit button was present on the Home address card or any other card.
- **Note** — Deliberately deferred: no edit control exists on checkout address cards. A UI addition, not a fix.

### When GST is enabled in Site Settings, checkout shows the correct CGST/SGST or IGST breakdown based on buyer vs seller state

- `checklist-buying-buying-checkout-gst-breakdown-display` · seen in: `sweep1`
- **Evidence** — On Step 2, Order Summary shows 'GST ₹1.80' but the label is simply 'GST' with no CGST/SGST or IGST distinction. expectedUiState requires the label or tooltip to distinguish CGST+SGST (same state) vs IGST (different state) — this breakdown is absent. expectedBehaviour (GST line present) holds but expectedUiState (breakdown label) fails.
- **Note** — Deliberately deferred: needs buyer-vs-seller state resolution that is not client-side today.

### Using the browser back button mid-checkout does not lose cart state or double-submit the order

- `checklist-buying-buying-checkout-checkout-back-navigation` · seen in: `sweep1`
- **Evidence** — Pressing the browser back button from Step 2 navigated to /cart (not to Step 1 as expectedUiState requires). Pressing back from Step 3 also went to /cart, not Step 2. Cart state was intact throughout (items preserved). Step 9 (complete checkout normally) could not be completed because Step 3 crashes with React error #310 on every attempt, so the endResult (one order created) could not be verified.
- **Note** — Deliberately deferred: per-step history needs pushState/popstate in a payment flow — double-submit and replay risk. Earns its own focused pass.

### Standard product detail page loads correctly

- `checklist-buying-product-detail-standard-detail` · seen in: `sweep1`
- **Evidence** — Heading 'Test Gadget — Standard Listing #1', price ₹199.00, stock '✓ In Stock — only 10 left', category links 'Test Gadgets'/'Tester Sandbox', brand 'TestBrand', description paragraph, and 'Sold by Tester Sandbox Store' with 'Visit Store →' all present. However expectedUiState says buttons are 'visible and disabled' — Buy Now, Add to Cart and Add to Wishlist are NOT disabled (disabled=false, no aria-disabled). Clicking 'Buy Now' opens a 'Sign in required' modal, which matches expectedBehaviour intent but not the explicit 'disabled' claim in expectedUiState.
- **Note** — Partial failure — the page renders everything expected; one expectedUiState clause about button visibility did not hold.

### A product's detail page shows a collapsible "Part of / Parts in this group" panel with a working thumbnail strip and a "View whole group" table when the product belongs to a product-group ("Set")

- `checklist-buying-product-detail-product-group-set-widget` · seen in: `sweep1`
- **Evidence** — A 'Part of / Parts in this group: Tester Sandbox Bundle' collapsible widget is present on product-tester-standard-1 ('Part of') and group-tester-sandbox-bundle ('Parts in this group'). Expand glyph renders as ▶/▼ (real glyphs, not garbled) ✓. FAIL (1): No 'View whole group' button found after expanding — expectedUiState requires it to open a modal/drawer. FAIL (2): Expanded list shows 5 members (the full bundle), not 2 — groupMemberCount=5 observed vs expectedData.groupMemberCount=2. The widget is a bundle membership panel, not a dedicated 2-member product-group Set panel.

### A "Grouped listings" themed carousel appears on a product detail page with real, clickable member items

- `checklist-buying-product-detail-grouped-listings-carousel-on-detail` · seen in: `sweep1`
- **Evidence** — The page at /products/product-tester-standard-1 has three related-items carousels ("More in this category", "More by TestBrand", "More from Tester Sandbox Store") and a "Part of: Tester Sandbox Bundle" set panel. No grouped-listings themed carousel exists — there is no section with a group theme heading (e.g. "From the same set") below the related-items carousels. The groupedListings carousel described in expectedUiState is entirely absent from the DOM.

### Creating a live-item listing (species: animals/plants) without a video is rejected with a clear error; a live listing WITH a video plays correctly in the gallery's video slide and its poster thumbnail is watermarked

- `checklist-buying-product-detail-live-item-video-mandatory` · seen in: `sweep1`
- **Evidence** — Signed in as tyson@beybladearena.in, opened /store/live/new. Filled title 'QA Live Item video-mandatory', species 'Dog', price 1500, stock 1. Submitted without attaching any video. The form stayed open (submit was blocked) showing '4 issues' and a single generic error 'Invalid input: expected string, received undefined'. No error message reading 'A video is required for live items' (or similar) appeared anywhere on or beside the Video field. The block exists (form does not save), but the user-facing error message does not match the expected shape.

### Opening the same auction in two browser tabs (or two accounts) and placing a bid in one updates the current bid and bid count in the other within a few seconds, without a manual refresh (realtime SSE)

- `checklist-buying-bidding-place-bid-live-other-viewer` · seen in: `v2`
- **Evidence** — Opened cycle-2 in tab 0 (rehan, signed in) and tab 1 (window B, same session). Tab 1 showed ₹15,000 / 0 bids. Placed ₹16,000 bid in tab 0 (success). Waited 10+ seconds in tab 1 — still showed ₹15,000 / 0 bids with no SSE update. SSE is not delivering bid updates to other viewers.
- **Note** — Same live-update path, observed from a second viewer.

### Winning an auction creates a payable locked cart line, not a stuck order

- `checklist-buying-bidding-win-auction` · seen in: `v2`
- **Evidence** — Signed in as tester@letitrip.in. /user/bids shows 'Won' badge and 'Pay now →' link for 'Test Auction — Already Won'. Clicking 'Pay now' goes to /checkout?lane=auction, which shows ₹0.00 total with no line items. /cart is empty with no 'Won Auctions' tab. The won auction does not appear as a payable locked cart line.
- **Note** — Winning an auction should create a payable locked cart line. Needs re-verification now that checkout works again.

## 5. Why cases could not be tested — 103 blocked answers

| count | cause | addressed by |
|---|---|---|
| 29 | time-bound fixture expired | **Fixed by design** — per-batch fixtures, no windows (plan D5) |
| 14 | other | — |
| 13 | fixture missing | — |
| 13 | needs a real Google account or inbox | Dropped — not automatable |
| 12 | tester account refused (no admin / no seller) | Plan D1 — raise the tester's powers |
| 8 | needs two concurrent sessions | Plan D2 — five tester accounts makes this reachable |
| 6 | INCONCLUSIVE — the case does not define a verdict | **Plan B** — these are the cases to enrich; the tester reached the page and the case did not say what a pass looks like |
| 5 | blocked by the checkout crash | **Fixed** — React #310 |
| 3 | needs a long wait | **Fixed by design** — seed the end state, never wait (plan D5) |

## 6. What the next run should look like

A prediction, so the next run can be checked against it rather than admired:

- The **fixture-missing**, **checkout-crash**, **expired-window** and **long-wait**
  buckets should all go to zero. Together that is the majority of blocked answers.
- The **tester-refused** bucket should go to zero once the accounts carry admin
  and seller powers.
- The **Google/inbox** bucket should stay — it is genuinely not automatable, and
  those cases are hand-off work for a person.
- The 16 FIXED cases above should flip to pass. Any that does not is a
  regression, and the fix did not do what this document claims.

