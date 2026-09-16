# 237 failures, bucketed by symptom shape


## other — 169

- **account-auth-profile-settings-avatar-upload**
  The avatar never persists. I drove the whole flow: Edit Profile > 'Change photo' > file chooser > public/test-media/sample-image.png > a 'Crop Image' modal opened with zoom slider, position readout an
- **addresses-address-filters-filters-actually-filter**
  SYMPTOM: there is no filter drawer on /user/addresses at all, so neither facet the case is about exists. The page offers exactly two controls — a free-text Search box ('Name, street, city, state, pinc
- **admin-admin-detail-round-trips-order-view-matches-drawer**
  The full page shows ONE of the four things the case asks for. /admin/orders/order-1-20260722-11joon/view renders an EDIT dialog containing only: Status (Delivered), a Shipping section with empty Track
- **admin-bug-hunter-rewards-confirm-bug-idempotent**
  THE CASE'S OWN EXPECTATION NAMES THE WRONG TESTER, AND THAT IS WORTH FIXING BEFORE THE CASE IS RUN. Its expectedData says the already-confirmed fixture is credited to 'Mock User 18'. It is not. Filter
- **admin-bulk-actions-bulk-bar-appears-on-selection**
  THE BAR CANNOT APPEAR BECAUSE A ROW CANNOT BE SELECTED. On /admin/products the list renders 25 per-row checkboxes. I clicked the first one with a real browser click and it did not become checked — no 
- **admin-bundles-bundle-create**
  SYMPTOM: AN ADMIN CANNOT CREATE A BUNDLE. The form refuses to submit with 'Bundle members: This field is required' — while the member picker directly above the error reads '2 selected' and displays tw
- **admin-bundles-bundle-brand-picker**
  SYMPTOM: THE BRAND PICKER IS EMPTY. The bundle editor does have a Brand control — a select named brandSlug, labelled 'Brand' with the helper 'The bundle's own brand tag — independent of how its member
- **admin-buyer-data-admin-carts-admin-view**
  THE PAGE HAS NO SEARCH BOX, SO THE CASE'S OWN CONTROL CANNOT BE RUN, AND EVERY OWNER IS A RAW UID. The listing itself works: 25 rows, columns Name / Status / Updated, each row reading e.g. '🛒 user-yu
- **admin-buyer-data-admin-carts-admin-row-opens-items**
  THE MODAL EXISTS AND LISTS THE ITEMS — the historical defect here is fixed — BUT TWO OF THE FOUR FIELDS THE CASE NAMES ARE MISSING. Clicking a row opens 'Cart Details' showing Authenticated, User user
- **admin-buyer-data-admin-reviews-admin-view**
  THE PAGE SAYS 'NO REVIEWS FOUND' WHILE 79 REVIEWS EXIST, BECAUSE AN INVISIBLE DEFAULT FILTER IS APPLIED. On the bare URL /admin/reviews the list renders 'No reviews found'. Nothing on screen explains 
- **admin-buyer-data-admin-store-addresses-admin**
  /admin/addresses IS NOT A LISTING — it is a lookup form, so most of this case is unperformable as written. The page reads 'Addresses / Look up a user's or store's saved addresses by owner ID' and offe
- **admin-buyer-data-admin-store-addresses-admin-row-opens-detail**
  There are no rows to click and the landmark is not displayed. Because /admin/addresses is a lookup rather than a listing, the case's step 1 — 'click a store-owned row' — has nothing to click until an 
- **admin-catalog-listings-brands-crud**
  Brands cannot be listed at all, so the 'list' third of the claim fails outright. /admin/categories renders 'No categories found' with zero rows after a 6s wait, and brands are categoryType:'brand' row
- **admin-catalog-listings-categories-crud**
  Same defect as the brands case and the same evidence: /admin/categories shows 'No categories found' while GET /api/admin/categories answers 200 with total:58 and the rows under data.data. An admin the
- **admin-catalog-listings-categories-toggle-filters**
  The Active and Featured toggles cannot show results in either state because the listing shows no results in any state — /admin/categories renders 'No categories found' with 0 rows before any filter is
- **admin-catalog-listings-admin-address-payment-status-chips-in-url**
  Fails on both surfaces, for different reasons. Admin > Addresses has NO status chips and is not a listing at all — it renders a lookup form ('Look up a user's or store's saved addresses by owner ID') 
- **admin-catalog-listings-admin-per-type-pages-have-filters**
  Two of the three things the label asks for hold; the filters do not. Every per-type page loads real rows with a preselected sort: /admin/art 5 rows, /admin/stickers 5, /admin/classified 7, /admin/digi
- **admin-catalog-listings-carousel-crud**
  Create and edit are there; REORDER is not. /admin/carousels correctly renders 'Named Carousels' (Homepage Hero, active, 5 slides, View) — the wrong-component defect recorded as Root Cause #37 does not
- **admin-catalog-listings-art-stickers-crud**
  An admin CANNOT CREATE an art or sticker listing at all. The listing-type selector on /admin/products/new offers exactly SEVEN options — standard|Standard, auction|Auction, preorder|Pre-order, prize-d
- **admin-category-brand-authoring-create-child-under-parent**
  THE PARENT CANNOT BE CHOSEN, SO A CHILD CANNOT BE FILED UNDER ONE. The Add Category form is otherwise well built for this — its Parent category control is a picker labelled 'Search categories… (leave 
- **admin-category-brand-authoring-category-type-not-guessable**
  THE EDITOR NEITHER SHOWS NOR SETS THE ROW'S KIND. This project stores four different kinds of row in one categories collection, discriminated by an optional type field — an ordinary listing category, 
- **admin-classifieds-digitalcodes-live-live-create-moderate**
  SYMPTOM: THE MODERATOR IS ASKED TO APPROVE A LIVE-ANIMAL LISTING WITHOUT BEING SHOWN THE SPECIES, THE JURISDICTIONS OR THE VIDEO — which is the exact failure this case names. On /admin/products?listin
- **admin-content-deletes-delete-confirmations-name-the-record**
  THE ONE DELETE CONFIRMATION I HAVE SEEN IN THIS ENTIRE RUN DOES NOT NAME THE RECORD. On the admin Product Features editor earlier in this session I deleted a feature I had just created, and the dialog
- **admin-firebase-function-effects-revenue-rollup-effect-dashboard-reads-one-doc**
  THE FIGURES ARE PRESENT AND PLAUSIBLE — AND TWO OF THEM CONTRADICT EACH OTHER ON THE SAME SCREEN. The good half first. /admin renders a stats block with TOTAL ORDERS 54, TOTAL REVENUE ₹31,586.00, TOTA
- **admin-media-watermark-watermark-size-opacity-controls**
  THERE ARE NO SIZE OR OPACITY CONTROLS. THE ENTIRE WATERMARK SETTINGS PANEL IS EMPTY. Selecting the '⑥ Watermark' tab on /admin/site renders a heading reading 'Watermark' and a 'Save all changes' butto
- **admin-media-watermark-watermark-position-presets**
  NO POSITION PRESETS ARE OFFERED — the panel that would hold them is empty (see the sibling case: the '⑥ Watermark' tab renders only a heading and a save button, with zero form controls). Step 2 asks m
- **admin-orders-fulfillment-admin-orders-payment-review-filters**
  SYMPTOM: THE CHIP GROUP EXISTS AND ONE OF ITS TWO VALUES DOES NOTHING. The drawer does carry a 'MANUAL PAYMENT' group with All / Awaiting payment / Awaiting verification, as the label describes. 'Awai
- **admin-orders-fulfillment-return-requests-triage**
  SYMPTOM: THE RETURN-TRIAGE PAGE CRASHES. /admin/return-requests — the real destination, taken from the sidebar's own 'Returns' link rather than guessed — renders the error boundary: 'Something went wr
- **admin-orders-fulfillment-admin-payout-detail-view**
  THE PAGE IS EXCELLENT AND THE ROUTE TO IT IS MISSING. What fails: no payout row exposes an 'Open full page' action. I clicked the 'Row actions' button on three separate rows and no menu appeared at al
- **admin-site-system-admin-dashboard-widgets**
  TWO ADMIN PAGES REPORT DIFFERENT TOTAL REVENUE FOR THE SAME SITE. /admin/dashboard reads 'TOTAL ORDERS 54 · TOTAL REVENUE ₹31,586.00 · TOTAL USERS 67 · TOTAL PRODUCTS 70 · PENDING ORDERS 1 · PENDING R
- **admin-site-system-copilot-admin**
  THE COPILOT DOES NOT ANSWER, AND THE MESSAGE DOES NOT SAY WHY. The page itself renders correctly — a conversation id (conv_1789530017307_un6ukhd), an 'Ask anything...' box, a Send button, an empty sta
- **admin-site-system-guide-pages-admin**
  THE PAGES ALL LOAD AND ARE DISTINCT; THEIR CONTENT IS STALE, WHICH IS EXACTLY WHAT THE CASE ASKS TO BE QUOTED. There are 12 admin guide pages, not the 8 the label says — an index plus users, catalog, 
- **admin-site-system-tester-checklist-crud-admin**
  AN ADMIN CAN CREATE A CHECKLIST ITEM BUT CANNOT EDIT ONE, AND adminOnly IS NOT EXPOSED ANYWHERE. I established all of this read-only; no case was created. The catalogue itself renders well — 52 pages 
- **admin-site-system-tester-feedback-report-export**
  THE EXPORT IS CORRECT; THE PAGE IT IS SUPPOSED TO MATCH IS NOT. Download Report works exactly as specified — it downloads tester-feedback-report-2026-09-16.md (1103 bytes) with both required sections.
- **admin-uncovered-admin-pages-admin-notifications-renders**
  EVERY NEW-ORDER ALERT PRINTS RAW CIPHERTEXT WHERE THE BUYER'S NAME SHOULD BE. The page itself renders fine — cards with a title, an info/warning chip, a growth/fraud category chip, the body, a timesta
- **admin-uncovered-admin-pages-admin-guides-all-render**
  ALL TWELVE PAGES EXIST AND ARE PROPERLY LINKED — AND THE CONTENT OF ONE IS MEASURABLY OUT OF DATE, WHICH IS THE FAILURE THIS CASE IS ACTUALLY ABOUT. Taking the mechanical half first: every one of /adm
- **admin-users-trust-admin-user-detail-enriched**
  SYMPTOM: THERE IS NO ROUTE FROM THE USER LIST TO A USER DETAIL PAGE. The case is about what /admin/users/[id] shows — avatar, stat tiles, and so on — and I could not reach it: I searched the whole pag
- **admin-users-trust-listing-form-errors-land-on-fields**
  SYMPTOM: THE FORM ACCUSES YOU BEFORE YOU HAVE TYPED ANYTHING. Opening Add Product on /admin/products renders, on first paint with no interaction whatsoever, one role=alert reading 'Product title is re
- **admin-users-trust-listing-form-save-draft-anywhere**
  SYMPTOM: THERE IS NO SAVE-DRAFT CONTROL, AND SAVING A DRAFT IS REFUSED. I searched every button, link and input in the Add Product drawer for the word 'draft': zero matches. The only submit is a singl
- **admin-users-trust-action-buttons-have-icons**
  SYMPTOM: NO ROW-ACTION ENTRY ON EITHER SURFACE I CHECKED CARRIES AN ICON. On /admin/products the row menu offers Approve, Reject and Quick edit, and querying each entry for a child <svg> returns false
- **admin-users-trust-homepage-section-all-types-creatable**
  SYMPTOM: NO SECTION CAN BE CREATED AT ALL — there is no New Section control and no type picker to open. /admin/sections lists 22 homepage sections correctly (Welcome, Carousel, Trust indicators, Categ
- **admin-users-trust-catalogue-approvals-admin**
  MUCH IMPROVED, BUT THE PHOTOS — THE WHOLE POINT — ARE STILL MISSING. The surface now has real data and a genuine View action: one row reads 'Charizard Holo 1st Edition (played) / user-rohit-collector 
- **admin-users-trust-catalogue-approvals-view-before-deciding**
  THE VIEW AFFORDANCE NOW EXISTS — that half is fixed. A 'View' button sits alongside Approve and Reject on the row, so the submission can be opened WITHOUT taking a decision, and Approve/Reject are als
- **buying-bidding-bid-custom-need-not-be-exact-multiple**
  SYMPTOM: A CUSTOM BID REPORTS SUCCESS, RECORDS A BID, AND THE AMOUNT IT RECORDS IS NOT THE ONE I TYPED. Current bid was Rs 1,850.00 with 3 bids and a stated 'Minimum next bid Rs 2,050.00'. In Custom m
- **buying-browsing-search-product-type-chips-cover-all-types**
  The drawer lists FOUR types, not nine: Standard, Classifieds, Digital Codes, Live Items. Auctions, Pre-Orders, Prize Draws, Art and Stickers are absent. 🛑 FIX THE CASE, NOT THE APP: as of the 2026-09
- **buying-browsing-search-filter-drawer-facets-actually-filter**
  Two of the three named sections do not exist. The /products drawer holds Listing type, Category, Condition, Brand, Shipping, Bundles and Features — there is no Tags section and no Sublisting Type sect
- **buying-browsing-search-search-filter-sort-combo**
  Search and filter combine correctly but SORT DOES NOTHING. Typing 'beyblade' gave ?q=beyblade&page=1 (24 cards); applying Condition=New gave ?q=beyblade&page=1&condition=new and reduced it to 16; choo
- **buying-buying-checkout-add-to-cart**
  SYMPTOM: clicking 'Add to Cart' on the Valkyrie page does not add anything. It raises TWO toasts at once — 'Complete your accepted offer first — you can add other items once it's paid for.' AND a gene
- **buying-buying-checkout-checkout-manual-payment-consent**
  SYMPTOM: THE CONSENT GATE IS BYPASSABLE. Step 3 does show the guide the case wants — a 'How manual payment works' panel spelling out the UPI transfer, the 15-minute window, the UTR-plus-screenshot pro
- **buying-buying-coupons-coupon-wallet-apply-lands-on-checkout**
  SYMPTOM: THE CODE IS CARRIED IN THE URL AND THEN IGNORED. /user/coupons lists three claimed coupons — SEALED20, FREESHIP499 and LIMITEDSET — each with an 'Apply at checkout' button and a 'Remove'. Pre
- **buying-cart-order-addons-queryable**
  SYMPTOM: THERE IS NO WAY TO FILTER ORDERS BY ADD-ON, SO THE QUESTION THE CASE EXISTS TO ANSWER — 'who do I need to gift-wrap today' — CANNOT BE ASKED. Signed in as admin, /admin/orders offers exactly 
- **buying-cart-group-picker-guest**
  SYMPTOM: THE SELECTION IS SILENTLY LOST WITH NO PROMPT OF ANY KIND. Signed out on /groups/group-beyblade-original-lineage I raised both members to quantity 1 with real clicks — the picker accepted the
- **buying-cart-cart-guest-group-line-refused**
  HALF RIGHT, AND THE HALF THAT FAILS IS THE ONE THE VISITOR EXPERIENCES. The line does NOT half-appear — guestCartBundleLines is 0, exactly as expected, and the server refuses cleanly with 401 on POST 
- **buying-cart-group-line-remove-member**
  Same root cause: there is no line in the cart to remove a member from. The grouped line is created correctly — I verified lineKind 'group' with two members at quantity 1 each and the correct summed pr
- **buying-cart-bundle-copies-stepper**
  THE PAGE SIDE IS RIGHT AND THE CART SIDE FAILS, so this is a split verdict and the failing half is expectedBehaviour, not expectedUiState. WHAT WORKS: /bundles/bundle-original-collectors-set has a lab
- **buying-my-orders-order-item-thumbnails-render**
  SYMPTOM: FOUR BROKEN THUMBNAILS ON THE LIST. Of the fourteen images wider than 30px on /user/orders, FOUR report naturalWidth 0 — the signature of an image element that laid out at full size and loade
- **buying-offers-homepage-section-invalid-config-inline**
  STEP 2 CANNOT BE PERFORMED — THERE IS NO WAY TO START A NEW SECTION. This was established directly earlier in this run: /admin/sections lists 22 homepage sections correctly but offers no create contro
- **buying-offers-history-absent-renders-empty-not-invented**
  ON AN ORDER THERE IS NO HISTORY BLOCK AT ALL — not an empty one, not em-dashes, nothing. I opened an order through both routes the admin offers: 'View full details' opens an EDIT drawer (a Status sele
- **buying-offers-blog-existing-post-slug-is-valid**
  FAR WORSE THAN A SLUG ERROR — THE WHOLE EDITOR OPENS EMPTY ON AN EXISTING POST. I opened the editor for the published post 'Collector Spotlight: Building India's Largest Gundam Collection' (blog-colle
- **buying-offers-seller-sees-and-can-act-on-offers**
  THE LIST AND THE ACTIONS ARE ALL THERE — AND EVERY ROW SAYS 'Unknown buyer'. /store/offers lists ~8 offers, each reading e.g. 'Beyblade Original — Driger V · Offer: ₹1,450.00 · Listed: ₹1,799.00 · Unk
- **buying-offers-form-errors-wait-for-first-submit**
  THE FORM GREETS YOU WITH 'Fix 7 issues' BEFORE YOU HAVE TYPED A CHARACTER. Opening /user/addresses/new and reading it without touching anything: the 'Address Required' section header carries a red '3 
- **buying-offers-offer-history-timeline-renders**
  SYMPTOM: THE BUYER CANNOT OPEN AN OFFER AT ALL, SO THERE IS NO TIMELINE TO READ. /user/offers renders each offer as a card, and the cards carry only ACTION buttons — 'Withdraw Offer' on the pending on
- **buying-offers-offer-history-legacy-no-fabricated-date**
  Same blocker as the timeline case, and the fixture this one needs is sitting right there unusable. The buyer holds exactly the offer the case describes — 'Beyblade Burst Valkyrie', already terminal, r
- **buying-offers-offer-detail-opens-on-fresh-data**
  THE DETAIL IS RENDERED FROM THE LIST'S DATA — IT FETCHES NOTHING. I could not stage the case's two-window setup (the harness has one browser and selects identity by swapping a session file, so a selle
- **buying-order-status-lifecycle-orders-list-shows-item-not-id**
  THE THREE SURFACES GIVE THREE DIFFERENT ANSWERS, AND ONLY THE BUYER'S IS RIGHT. BUYER — correct. Every row leads with the item title and a thumbnail, with the identifier de-emphasised above it: 'Order
- **buying-order-status-lifecycle-return-requested-is-active**
  CORRECT FOR THE BUYER, BROKEN FOR THE SELLER — AND THE SELLER'S HALF FAILS FOR A BIGGER REASON THAN THIS CASE ASKS ABOUT. On the buyer's side it is right: both Return Requested orders, 1-T9MI9F and 3-
- **buying-order-status-lifecycle-status-change-visible-to-buyer**
  THE SELLER'S STATUS CHANGE IS NEVER MADE, SO THERE IS NOTHING FOR THE BUYER TO SEE. I opened the pending order order-1-20260916-rhj4nf in /store/orders, chose Confirmed from the New status picker with
- **buying-order-status-lifecycle-status-timeline-future-steps**
  THE TIMELINE DRAWS ONLY WHAT HAS HAPPENED. Unreached statuses are omitted entirely rather than shown as upcoming. The pending order order-1-20260916-rhj4nf is the clearest case — its whole timeline is
- **buying-order-status-lifecycle-cancellation-reason-recorded**
  THE CANCEL BUTTON DOES NOTHING. The reason cannot reach the seller because the cancellation never happens. On the pending order order-1-20260916-rhj4nf the cancel page renders correctly — a required '
- **buying-order-status-lifecycle-seller-status-controls-match-state**
  THE OPTION LIST IS STATIC. It does not depend on the order's current status at all, and I proved that by comparing two orders at opposite ends of the lifecycle. On the SHIPPED order order-1-20260806-4
- **buying-product-detail-auction-detail-bid-signed-in**
  The page behaves correctly but the case's numbers belong to a DIFFERENT auction. On /auctions/auction-beyblade-original-dragoon-storm, signed in, there is no sign-in gate, the current bid renders as ₹
- **buying-product-detail-video-real-file-upload**
  A real video file cannot be uploaded. The seller product form offers the documented paths — a video-options panel with Upload / YouTube / External URL tabs plus Upload File and Use Camera, and a galle
- **buying-return-request-return-reason-is-persisted**
  THE REASON CANNOT BE VISIBLE TO STAFF, BECAUSE THE STAFF PAGE CRASHES. /admin/return-requests renders the error boundary — 'Something went wrong · An unexpected error occurred. Please try again. · Try
- **buying-reviews-pagination-detail-tab-sort**
  THREE OF THE FOUR SORTS WORK. 'OLDEST FIRST' RETURNS HTTP 500 AND RENDERS 'NO REVIEWS YET' ON A PRODUCT WITH 19 REVIEWS. The dropdown offers exactly the four the case names — Newest First, Oldest Firs
- **buying-reviews-pagination-reviews-index-unchanged**
  FIVE OF THE SIX CONTROLS ARE CORRECT, INCLUDING THE URL BEHAVIOUR THE CASE CARES MOST ABOUT — BUT ONE SORT OPTION EMPTIES THE PAGE. What works. The toolbar offers the full set in the standard order: a
- **buying-reviews-pagination-empty-state**
  THE COPY AND THE PAGER ARE BOTH RIGHT; THE SORT AND FILTER CONTROLS RENDER OVER AN EMPTY LIST. On product-beyblade-burst-spryzen-video-demo, which carries no seeded reviews, the reviews tab shows exac
- **buying-reviews-leave-review**
  A BUYER HAS NO WAY TO LEAVE A REVIEW ANYWHERE IN THE PRODUCT. I failed at step 3 — 'use the control that leaves a review on one of its items' — because no such control exists. I checked all four surfa
- **buying-reviews-seller-response**
  THE REPLY SAVES AND PERSISTS. BUYERS NEVER SEE IT. As tyson@beybladearena.in I opened /store/reviews, picked a review marked 'Awaiting store reply' (Beyblade Original Dranzer S, 4 stars, by Mock User 
- **buying-user-dashboard-extras-order-timeline-shows-real-events**
  THE TIMELINE EXISTS AND ITS EVENTS ARE REAL, BUT NOTHING IS STAMPED WITH WHO MADE IT, AND IT IS NOT WHERE THE CASE SENDS YOU. First, location: the order DETAIL page has no timeline at all — I read two
- **buying-user-dashboard-extras-order-partial-refund-in-timeline**
  THE REFUND APPEARS AS A TIMELINE STEP BUT CARRIES NEITHER AN AMOUNT NOR A REASON. On order 9-LUZWNG, whose status chip reads Refunded, the track page's timeline reads 'Order placed 09/08/2026, 06:00:0
- **buying-user-dashboard-extras-order-history-carries-no-personal-data**
  NO PII IS IN THE TIMELINE — that half passes cleanly — BUT THE ORDER PAGE ITSELF RENDERS A RAW DATABASE ID WHERE THE DELIVERY ADDRESS BELONGS. On the timeline: I scanned the track pages of both a Deli
- **buying-user-dashboard-extras-my-returns**
  THE ROWS NAME THE ITEM AND THE ORDER BUT NOT THE REASON, THERE IS NO WAY TO OPEN A RETURN, AND THE FILTERS DRAWER IS EMPTY. /user/returns lists two returns, each showing the order id, the date, a 'Ret
- **buying-user-dashboard-extras-my-reviews**
  THE LIST IS ACCURATE, THE SEARCH IS GOOD, BUT NO PHOTOS RENDER, NOTHING CAN BE EDITED, AND NO SELLER RESPONSE IS SHOWN. What works: /user/reviews lists the buyer's 16 visible reviews, each naming the 
- **buying-user-dashboard-extras-user-personal-listings-search-sort**
  THE CONTROLS ARE ALL PRESENT AND THE ONE I COULD EXERCISE WORKS PROPERLY — BUT THE ZERO-RESULT STATE IS WRONG, AND TWO OF THE FOUR PAGES HAVE NO DATA TO SEARCH. Taking the testable page first. /user/r
- **buying-user-uncovered-pages-user-preorders-renders**
  THE BUYER HAS A PRE-ORDER AND THE PAGE SAYS THEY HAVE NONE. /user/pre-orders renders a toolbar and then 'You haven't placed any pre-orders yet.' with a 'Browse pre-orders' link. That would be fine if 
- **buying-user-uncovered-pages-user-addresses-add-renders**
  CREATE WORKS; EDIT AND DELETE ARE BOTH BROKEN, SO A BUYER CAN ADD AN ADDRESS AND NEVER CORRECT OR REMOVE IT. The add form is fine. /user/addresses/add redirects to /user/addresses/new and opens with t
- **buying-wishlist-history-wishlist-guest-page-signed-out**
  SYMPTOM: A SIGNED-OUT VISITOR IS SHOWN A PERMANENTLY EMPTY WISHLIST AND NEVER TOLD WHY. Opening /wishlist directly while signed out renders the full page furniture — 'My Wishlist', the Filters drawer,
- **buying-wishlist-history-wishlist-add-to-cart-from-list**
  SYMPTOM: THERE IS NO ADD-TO-CART ON THE WISHLIST. I enumerated every visible button on /wishlist with two saved items. The page-level controls are 'Sync all' and 'Remove all'; the toolbar has Filters 
- **buying-wishlist-history-wishlist-heart-solid-red**
  SOLID YES, RED NO — and only a computed-style read catches it. I measured the heart's fill on the same product in both states. NOT SAVED: svg fill 'none' with a dark stroke, i.e. an outline heart. SAV
- **community-support-support-tickets-create-ticket**
  The ticket is never created. Filled Subject 'QA Ticket create-ticket' and the Description on /user/support/new with Category already set to General, pressed 'Submit ticket', and the page stayed on /us
- **community-support-support-tickets-support-tickets-search-box**
  The list renders ZERO rows for a user who owns five tickets, so the search box cannot be exercised. Firestore: user-yugi-muto owns ticket-yugi-auction-001 (closed), -dispute-001 (resolved), -fraud-001
- **content-discovery-blog-blog-listing**
  SYMPTOM: expectedUiState requires every card to carry 'a title, an excerpt, a rendered cover image and a category'. Twelve of the seventeen cards have no cover image element at all — they render a lar
- **content-discovery-blog-blog-related-posts-sections**
  SYMPTOM: only TWO of the three sections render. Below the article there is 'Related Posts' and 'You might also like' and nothing else — no same-author section, and the text 'More from' appears nowhere
- **content-discovery-coupons-coupon-discount-applied**
  SYMPTOM: THE CLAIMED COUPON IS SILENTLY IGNORED. Starting where the case says, on /promotions, the Coupons tab lists all eleven seeded codes (ARENA25, ARENAVIP, BLADER50, BUYNOW10, FREESHIP499, LIMITE
- **content-discovery-event-detail-subroutes-guest-sees-event-but-is-prompted**
  The READ half passes and the PROMPT half does not happen at all. Signed out, /events/event-favourite-blader-poll renders the whole event: hero, "Poll" and "Active" chips, the title "Vote: Best Blader 
- **content-discovery-event-participation-leaderboard-shows-real-participants**
  THE LEADERBOARD DOES NOT REFLECT THE PARTICIPANTS, AND THE ONE ROW IT HAS SCORES ZERO. The raffle event 'Win a Sealed Beyblade Burst Regalia Genesis' reads 'Participants: 247' in its header, and its l
- **content-discovery-events-admin-event-entries-export**
  SYMPTOM: /admin/events/event-favourite-blader-poll/entries renders 'No entries found' — zero rows, no columns — so there is nothing to expand and read inline. A 'Download Report' control IS present, b
- **content-discovery-events-poll-leaderboard-shows-tally**
  SYMPTOM: the Leaderboard tab renders 'No votes yet.' — no rows at all, neither option labels nor voter names. It cannot be showing options ranked by tally when it is showing nothing. CAUSE: it disagre
- **content-discovery-events-spin-results-tab**
  SYMPTOM: there is no 'Last 10 Spin Results' tab. The spin-wheel event's tab bar carries Overview, Participate and Leaderboard, plus a 'Spin' control — and nothing matching spin results or last-10. Sea
- **content-discovery-events-spin-wheel**
  SYMPTOM: the very first spin fails. The Participate tab renders a fully enabled 'Spin' button; clicking it once produces the toast 'Spin failed. Please try again.' and no prize, no wheel result, nothi
- **content-discovery-notifications-notification-links-to-right-entity**
  SYMPTOM: THE ONE NOTIFICATION THAT LINKS TO AN ENTITY LEADS TO A PAGE THAT DOES NOT SHOW IT. Scanning the notifications list for entity-shaped destinations, exactly one appears — /user/orders/order-4-
- **content-discovery-search-search-keeps-sort**
  THE TERM IS KEPT; THE SORT IS IGNORED. Signed in as rehan.sheikh@gmail.com on /products?q=beyblade I changed the sort through the real dropdown. The URL updated correctly (?q=beyblade&sort=title&page=
- **cta-layout-dialog-footers-modal-footer-stays-compact-on-desktop**
  SYMPTOM: THERE IS NO DIALOG. The row-action menu on /admin/products at 1280px offers Approve / Reject / Quick edit — no Delete — so I took Reject, the destructive option present. It EXECUTED IMMEDIATE
- **cta-layout-navbar-ctas-announcement-bar-message-renders**
  SYMPTOM: THE ANNOUNCEMENT CANNOT BE CONFIGURED AT ALL, because the Site Settings panel renders no fields. Site Settings navigates by a dropdown with nineteen sections (⓪ About, ① Branding, ② Appearanc
- **cta-layout-navbar-ctas-nav-active-state-correct**
  SYMPTOM: ON A PRODUCT DETAIL PAGE NO NAVIGATION ENTRY IS MARKED AT ALL. The marking works on index routes — /products marks Products with aria-current="page" and /events marks Events — but opening /pr
- **design-ux-dashboard-layout-collapsible-admin**
  COLLAPSING WORKS; REMEMBERING DOES NOT — and I proved the second half cleanly rather than inferring it. The admin sidebar has twelve groups (Management, Finance, Procurement, Catalog, Content, Testing
- **design-ux-dashboard-layout-listing-toolbar-consistency**
  THE TOOLBARS DO NOT MATCH ACROSS LISTINGS — the search box is missing from one of the two I compared. /admin/products has the full set: a search box placeholdered 'Search products, SKUs, or seller nam
- **design-ux-footer-theme-footer-column-headings-stand-out**
  SYMPTOM: THE COLUMN HEADINGS RECEDE BEHIND THE LINKS THEY HEAD. Measured on the desktop footer at 1280px, heading against the links directly beneath it: 'Shop' / 'Support' / 'For Sellers' / 'Learn' / 
- **design-ux-footer-theme-footer-weight-both-themes**
  The WEIGHTS are identical across themes — 450 for headings and 500 for links in both light and dark — so nothing changes between them and there is no theme-specific weight bug. But the case asks wheth
- **design-ux-hand-mode-layout-titlebar-actions-no-overflow-narrow**
  SYMPTOM: AT 320px THE HAMBURGER MENU IS ENTIRELY OFF-SCREEN — and the theme toggle is half off — with Left-hand mode ON. Measured bounding boxes against a 320px viewport: 'Switch to dark mode' spans l
- **design-ux-homepage-carousels-section-config-actually-renders**
  SYMPTOM: THE HOMEPAGE SECTIONS EDITOR CANNOT BE OPENED AT ALL, so no Subtitle or 'View all link label' can be set in the first place. /admin/sections lists all 22 sections correctly — name, order numb
- **design-ux-homepage-carousels-sections-showcase-render**
  SYMPTOM: THE 'SHOP BY CATEGORY' RAIL IS MOSTLY BUNDLES, ALL READING '0 items'. Of the seven tiles, only TWO are real browse categories — Spinning Tops (57 items) and Living Collectibles (4 items). The
- **design-ux-homepage-carousels-carousel-loops**
  SYMPTOM: THE CONTENT RAILS DO NOT AUTO-SCROLL AT ALL, so there is no loop to observe. On the Featured Products rail I reset scrollLeft to 0 and sampled it eight times over sixteen seconds: it stayed a
- **design-ux-homepage-carousels-footer-newsletter-inline-error**
  SYMPTOM: THERE IS NO INLINE ERROR — the only feedback is the browser's own native validation bubble. I typed 'not-an-email' into the FOOTER newsletter field and submitted. Nothing appeared under the f
- **design-ux-sticky-cta-bar-desktop-buttons-work**
  One of the three works. The floating bar renders correctly at the bottom of /products/product-beyblade-burst-valkyrie with Wishlist / Add to Cart / Buy Now, and the bottom-edge tier is live (--bottom-
- **money-flows-auction-win-to-payment-winning-bid-recorded**
  The bid is refused, so no winner is ever recorded. On the fixture auction (auction-money-flows-closing, 'Closing Auction — Win to Payment', 0 bids, starting bid ₹15,000, min increment ₹1,000) I opened
- **money-flows-payment-methods-cod-order-places**
  The order cannot be placed at all — checkout deadlocks on its own lane guard. The cart holds exactly ONE accepted offer, and checkout walks its three steps normally (Step 1 Shipping Address, Step 2 Ex
- **page-wiring-detail-pages-detail-page-matches-list-modal**
  The detail page does not match the modal because THE DETAIL PAGE CRASHES. On /admin/bids the row menu's View opens a modal carrying seven fields — product 'Beyblade X BX-06 Wizard Fafnir (Long-Running
- **page-wiring-reachability-carousel-can-be-renamed**
  SYMPTOM: 'Edit carousel' EXISTS but DOES NOT OPEN WITH THE CURRENT VALUES. /admin/carousels correctly shows a 'Named Carousels' table — Homepage Hero, status 'active', 5 slides — rather than the bare 
- **page-wiring-reachability-public-nav-and-footer-resolve**
  Walked all 52 distinct internal destinations in the public header and footer (the case says 55; the header and footer share several hrefs, so 52 is the de-duplicated set). EVERY ONE returns HTTP 200 a
- **page-wiring-reachability-grouped-listing-members-editable-from-its-own-page**
  THE CORE OF THE CASE PASSES. All three controls are on the create form: a 'Search products to add…' picker under a Members section, a minActiveMembers number field, and a coverImage field. I created '
- **public-pages-auth-error-pages-register-page**
  THE PAGE AND ITS VALIDATION TIMING ARE RIGHT; THE ERROR COPY IS NOT. /auth/register loads with the full field set (displayName, email, password, confirmPassword, an accept-terms checkbox) and a 'Creat
- **public-pages-auth-error-pages-forgot-reset-password-pages**
  SAME DEFECT, SECOND FORM — which is what makes it worth fixing centrally rather than per page. /auth/forgot-password loads correctly as a signed-out visitor: an email field, a 'Send reset link' button
- **public-pages-bug-hunters-leaderboard-footer-link**
  SYMPTOM: THERE IS NO BUG HUNTERS LINK IN THE FOOTER AT ALL. I enumerated every anchor in the site footer — 93 of them — and matched on both the visible text ('Bug Hunter'/'Bug Hunters', case-insensiti
- **public-pages-core-listing-pages-about-values-expanded**
  The page promises six values and renders three — and it says so in its own copy, which is what makes this visible to any visitor rather than only to a tester. The section header reads 'Our Values — Si
- **public-pages-core-listing-pages-preorders-listing-page**
  Both per-type defaults are wrong on /pre-orders — it opens with the generic ones instead. (1) SORT: the dropdown offers 'Earliest Delivery' as its first option, but the SELECTED value is 'Newest First
- **public-pages-core-listing-pages-category-brand-highlights-faq-grouped-listings**
  Two of the three render; the grouped-listings carousel does not. HIGHLIGHTS: present as short bullets under 'Why shop here' — 'Tops that burst apart on a hard enough hit — a whole new battle mechanic'
- **public-pages-help-how-it-works-track-order-page-works**
  SYMPTOM: THE PAGE TELLS A SIGNED-OUT VISITOR TO DO SOMETHING IT GIVES THEM NO WAY TO DO. /track is reachable from the footer and renders 'Track Your Order' followed by the instruction 'Enter your orde
- **public-pages-help-how-it-works-how-orders-work-matches-product**
  THE PAGE DOCUMENTS A STATUS AN ORDER CANNOT HOLD, AND OMITS THREE IT CAN. /how-orders-work gives 'Out for Delivery' its own entry in the Order Status Lifecycle, with its own icon and description ('You
- **public-pages-help-scams-guides-subpages-scams-subpages-linked-from-registry**
  SYMPTOM: THE REGISTRY LINKS ONE OF ITS THREE SUB-PAGES. /scams contains an anchor to /scams/report and NONE to /scams/types or /scams/faqs. Both of those exist and are substantial — /scams/types retur
- **public-pages-help-scams-guides-subpages-help-auctions-matches-product**
  TWO CLAIMS THE PRODUCT DOES NOT KEEP, and one of them is deliberate policy rather than an oversight. (1) PROXY BIDDING IS DOCUMENTED AND ABSENT. The page describes 'Max bid (proxy bidding) — enter the
- **public-pages-legal-policy-pages-policy-related-links-exclude-self**
  IT HOLDS ON FOUR PAGES AND THE SECTION IS ABSENT FROM A FIFTH. Where it exists it is exactly right — /refund-policy, /ethics, /code-of-conduct and /privacy each carry a 'Related Policies' block with F
- **public-pages-stores-sellers-directories-brand-tabs-every-type-offered**
  THE TWO LISTS MATCH EXACTLY, and that is the problem. Category /categories/category-beyblade-burst offers Products (4), Auctions (3), Pre-Orders (2), Prize Draws (1), Classifieds (2), Digital Codes (2
- **public-pages-stores-sellers-directories-empty-tabs-hidden**
  THE DROPDOWN HIDES CORRECTLY — Beyblade Arena offers 8 listing types, LetItRip Official offers exactly ONE, 'Prize Draws (6)', because its entire catalogue is prize draws. The two lists differ, which 
- **public-pages-stores-sellers-directories-seller-detail-page**
  The page itself renders correctly — header with logo, rating 4.1, '✓ Verified Safe', description, store search, and a tab bar of Coupons (5) / Reviews (74) / About beside the listing-type dropdown. BO
- **search-and-nav-header-search-search-finds-maintenance-toggle**
  The search result promises the toggle and the link does not deliver it. As admin, typing 'maintenance' correctly surfaces a command-palette layer above the catalogue search: 'Maintenance mode', 'Maint
- **search-and-nav-header-search-search-finds-by-what-it-does**
  The palette matches LABELS, not what a screen does. 'maintenance' works because 'Maintenance mode' is literally the label of a setting. 'refund' does not: as admin it returned only a catalogue product
- **search-and-nav-settings-deep-links-tab-query-param-opens-that-tab**
  THE ROUTING HALF IS CORRECT. ?tab=fees opens Fees, ?tab=themes opens Themes, and no parameter opens Branding — read off the tab selector's own value each time, so the two parameters produce two differ
- **selling-become-seller-sell-redirect**
  SYMPTOM: /sell sends a SIGNED-IN user to /auth/login, and the visit LOGS THEM OUT. Reproduced with both identities the harness holds. Seller (tyson@beybladearena.in): /store rendered 'Store Dashboard'
- **selling-become-seller-store-setup**
  SYMPTOM: THE STOREFRONT FORM CANNOT BE SAVED AT ALL. /store/storefront loads correctly for tyson@beybladearena.in — 'Storefront Settings' with Store Name 'Beyblade Arena', Store Category, Short Bio an
- **selling-digital-content-delivery-pool-list-never-shows-the-code**
  There is no list to inspect. GET /api/store/products/digitalcode-beyblade-x-manual-coaching-session/codes returns HTTP 500 {"code":"INTERNAL"} whenever the pool is non-empty, so the seller's pool list
- **selling-final-sale-authoring-final-sale-badges-render**
  TWO SURFACES OF THREE ARE EXEMPLARY. THE THIRD — THE ONE IMMEDIATELY BEFORE PAYMENT — SAYS NOTHING, AND CONTRADICTS ITSELF WHILE DOING SO. ON THE CARD, /products shows a 'Final Sale' pill on every fin
- **selling-final-sale-authoring-final-sale-opt-out-survives-reload**
  THE EDIT IS DISCARDED. I opened the editor for 'Beyblade Burst B-01 Valkyrie' — it loaded the right record, title field populated — and its Returns step showed 'Accept change-of-mind returns' already 
- **selling-listing-a-product-list-standard**
  SYMPTOM: PUBLISH FAILS WITH A BARE 'Invalid URL' TOAST AND NOTHING IS CREATED. I filled the Quick-add form completely — title 'QA Product list-standard', price 499, stock 5, a description, a category 
- **selling-listing-a-product-media-upload-main-image-crop**
  THE CROP TOOL OPENS BUT HAS NO ASPECT LOCK. Uploading the main product image automatically opens a 'Crop Image' modal (672x633) with the instruction 'Drag to reposition. Use the zoom slider or +/- key
- **selling-product-upload-details-disallowed-type-refused**
  THE SVG IS NOT REFUSED — IT IS ACCEPTED AND OPENS THE CROP EDITOR. I selected public/test-media/sample-vector.svg through the real file chooser. No error appeared, and my first reading of the DOM was 
- **selling-sectionised-forms-form-sections-save-unchanged**
  THE SAVE WRITES NOTHING, AND IT REPORTS SUCCESS. Opened the Beyblade Burst B-01 Valkyrie editor as tyson@beybladearena.in and recorded all 20 fields: title 'Beyblade Burst B-01 Valkyrie', description 
- **selling-sectionised-forms-form-mobile-action-bar**
  SYMPTOM: THERE IS NO PINNED ACTION BAR, AND TWO OF THE CASE'S THREE CONTROLS ARE ABSENT. At 390 pixels /store/products/new opens as a full-screen drawer whose actions sit at the FOOT OF THE SCROLLING 
- **selling-seller-analytics-payouts-view-analytics**
  SYMPTOM: EVERY METRIC ON THE SELLER ANALYTICS DASHBOARD RENDERS AS NaN OR THE LITERAL WORD 'undefined'. /store/analytics as tyson@beybladearena.in shows, in full: 'Store Analytics | From | To | TOTAL 
- **selling-seller-bids-bundles-filters-seller-bids-status-filter**
  SYMPTOM: THE SELLER'S BIDS PAGE IS EMPTY WHILE THE SELLER'S OWN AUCTIONS REPORT 29 BIDS. Signed in as tyson@beybladearena.in, /store/bids renders 'No bids found for your auctions.' with zero rows — an
- **selling-seller-catalog-org-seller-sublisting-categories-crud**
  CREATE AND DELETE BOTH WORK PROPERLY. EDIT IS UNREACHABLE FOR EVERY ROW. Create: I made 'QA Sublisting catalog-org' with a description; it appeared in the list rendering BOTH its name and its descript
- **selling-seller-catalog-org-seller-listing-templates-crud**
  A LISTING TEMPLATE CANNOT STORE ANY DEFAULTS, SO THERE IS NOTHING FOR IT TO PRE-FILL. Established read-only; I created nothing. /store/listing-templates renders a clean empty state — 'No templates yet
- **selling-seller-catalog-org-seller-category-inline-create-persists**
  THE CATEGORY PERSISTS — the case's title claim holds — BUT ITS OWN FIRST STEP CANNOT BE PERFORMED AS WRITTEN. After a full page reload of /store/products/new, 'QA Category inline-create' is present in
- **selling-seller-catalog-org-seller-category-inline-create-duplicate-rejected**
  THE DATA IS SAFE AND THE FEEDBACK IS A LIE. I opened the picker's create control and typed 'Beyblade Burst', a category that already exists, then pressed Create category. The drawer closed as though i
- **selling-seller-custom-brands-seller-brand-appears-on-public-brands-page**
  THE BRAND DOES APPEAR PUBLICLY — THAT HALF WORKS — BUT THE /brands INDEX LINKS EVERY BRAND TO THE WRONG ONE OF TWO ROUTES. Signed out, /brands lists all five brands including 'QA Brand inline-create',
- **selling-seller-custom-brands-seller-brand-inline-create-duplicate-rejected**
  NO DUPLICATE IS CREATED — THE DATA IS SAFE — BUT THE USER IS SHOWN RAW ZOD INTERNALS ATTACHED TO THE WRONG FIELDS, AND NOTHING ABOUT A DUPLICATE. I typed 'QA Brand inline-create', the name that alread
- **selling-seller-guide-seller-guide-pages**
  TWO DEFECTS, AND THE SECOND IS THE KIND THE CASE SAYS MATTERS MOST. FIRST — /seller-guide, THE INDEX, IS COMPLETELY EMPTY. It returns 200 with the title 'Seller Guide — LetItRip', renders the header a
- **selling-seller-listing-types-seller-products-featured-promoted-sorts**
  BOTH SORTS 500 THE REQUEST AND EMPTY THE PAGE. The dropdown offers 'Featured first' and 'Promoted first' as the case expects. Selecting either replaces a 25-row list with 'No products listed yet' — an
- **selling-seller-marketing-extras-seller-offers-list**
  THE MONEY IS ACCURATE ON EVERY ROW; THE BUYER IS NAMED ON NONE. /store/offers lists 11 offers and each one carries the full commercial picture — 'Beyblade Original — Driger V · Offer: ₹1,450.00 · List
- **selling-seller-marketing-extras-seller-reviews-response**
  THE SELLER CAN VIEW AND RESPOND — AND NO BUYER EVER SEES THE RESPONSE. I tested this end to end earlier in this run and the finding stands. The viewing half works well: /store/reviews lists the store'
- **selling-seller-ops-comms-seller-fulfillment-queue**
  THE QUEUE NAMES NO ITEM, NAMES NO BUYER, AND TRUNCATES ITS ORDER IDS SO BADLY THAT 25 ROWS COLLAPSE INTO 6 DISTINGUISHABLE LABELS. Every row's primary label reads '🧾 Order order-1-202609' — the order
- **selling-seller-orders-at-scale-dashboard-revenue-not-zero**
  The dashboard shows neither figure. /store renders the heading 'Store Dashboard' and then two bare section labels — 'Stats' and 'Quick Actions' — with nothing inside either. The whole page body is 1,7
- **selling-seller-orders-view-orders**
  SYMPTOM: THE ORDERS ARE THERE AND THE ROWS TELL THE SELLER ALMOST NOTHING. /store/orders as tyson@beybladearena.in lists 25 rows across 2 pages, and every one of them reads the same shape: a 🧾 EMOJI 
- **selling-seller-orders-seller-order-detail-full-page**
  SYMPTOM: THERE IS NO WAY TO OPEN AN ORDER. I searched every button and link on /store/orders for 'Open full page', 'full page' or 'view order' and found NONE. The rows themselves advertise interactivi
- **selling-seller-shipping-payouts-setup-shipping-page**
  SYMPTOM: SAVE CONFIGURATION WRITES NOTHING AND SAYS NOTHING. On /store/shipping as tyson@beybladearena.in I filled Carrier Name = 'QA Carrier 1789432098900' and Shipping Price = 77 and pressed 'Save C
- **selling-seller-shipping-payouts-setup-payout-methods-crud**
  CREATE AND EDIT WORK; THE LIST AND DELETE DO NOT. I created a method from /store/payout-methods/new — Type UPI, Label 'QA Test Method run-1789432098900', UPI VPA 'qatester1789432098900@okaxis' — and i
- **selling-store-dashboard-navigation-store-sidebar-active-highlight**
  THE SECTION HIGHLIGHT IS CORRECT; A SECOND ENTRY IS ALWAYS MARKED CURRENT AS WELL. The good half first, because it is the half the case is mostly about: on /store/products the Products entry carries a
- **selling-store-dashboard-navigation-store-deep-link-direct-load**
  THE DEEP LINK ITSELF WORKS PERFECTLY; THE FILTERED URL EXPOSES A BROKEN SEARCH. Pasting /store/products/stickers-beyblade-x-glow-in-dark/edit directly, with no prior visit to the dashboard home, opens
- **seo-page-metadata-404-page-not-indexable**
  Two of the three missing paths are correctly excluded and the product one is not. /auctions/auction-zzzznope-missing and /stores/store-zzzznope-missing both serve <meta name="robots" content="noindex"

## count-mismatch — 36

- **admin-admin-detail-round-trips-coupon-edit-round-trip**
  The coupon cannot be saved at all. Opening ARENA25's Edit panel shows '3 issues' on an untouched record: 'A discount value is required.' under a field containing 25, and 'Give the campaign a name.' un
- **admin-buyer-data-admin-wishlists-admin-view**
  Same shape as the carts page. The data shown is correct: 4 rows, each reading '💝 <userId> N item of 20 OK' — so the owner, the item count, the cap (20, which matches the documented wishlist maximum) 
- **admin-buyer-data-admin-history-admin-view**
  The counts are right and the cap is respected; the search the case asks for does not exist. 12 rows, each '🕐 <userId> N of 50 items OK'. I MEASURED THE ACTUAL COUNTS RATHER THAN THE CAP, because my f
- **admin-orders-fulfillment-admin-orders-payment-actions-hidden-when-paid**
  HALF RIGHT: the live decision controls ARE gone, and the replacement badge is NOT there. Opening order-1-20260822-aucwon — a row the list labels 'Payment verified' — the admin detail page carries zero
- **admin-orders-fulfillment-admin-order-list-item-and-detail**
  SYMPTOM: 22 OF 25 ROWS SHOW A RAW ORDER ID INSTEAD OF THE ITEM. Counted directly over the rendered table: 22 rows render as '🧾 Order order-1-20260822-aucwon', an emoji placeholder beside the order's 
- **admin-site-system-dashboard-tables-colors-avatars-icons**
  STATUS BADGES AND AVATARS BOTH PASS. ROLES DO NOT RENDER AS BADGES AT ALL, AND THE PLATFORM'S ONLY ADMIN IS VISUALLY IDENTICAL TO AN ORDINARY BUYER. What works: /admin/stores proves the 'distinct per 
- **admin-users-trust-admin-tables-render-badges-not-text**
  BADGES AND THUMBNAILS PASS; FORMATTED MONEY IS ABSENT ENTIRELY. The badge half is genuinely good: /admin/orders renders all nine statuses as rounded-full badges in three colour families — amber for pe
- **admin-users-trust-sold-flag-badge-readable**
  LEGIBILITY PASSES; DISTINGUISHABILITY FAILS. The Sold & Ended scope returns 12 rows, and every one of them carries the SAME badge: 'published'. There is no Sold chip at all — sold-ness is carried by a
- **buying-bidding-bid-succeeds-and-outbids-previous-winner**
  The bid did not raise the price, so nobody was outbid. Expected was a current bid of Rs 2,050 after a second bid (bidCountDelta 2). What actually happened across this batch: the count DID rise by two 
- **buying-cart-update-qty**
  SYMPTOM: THE LINE TOTAL AND THE HEADER BADGE RECALCULATE, THE ORDER SUMMARY DOES NOT. Cart held Dark Bull x2 = Rs 2,198.00 and an art print x1 = Rs 899.00, Subtotal (2 items) Rs 3,097.00. I raised the
- **buying-user-dashboard-navigation-sidebar-active-highlight**
  THE VISUAL HIGHLIGHT FOLLOWS YOU; THE ACCESSIBLE ONE DOES NOT. There are two signals here and they disagree. On /user/support the sidebar's styling marks /user/support as active, which is correct — bu
- **content-discovery-blog-blog-cover-image-display**
  SYMPTOM: 12 of the 17 listing cards show no cover image, on both the first load and after scrolling the whole list to force any lazy loading — the count is stable at 5 with an image and 12 without, so
- **content-discovery-category-brand-relations-store-under-deep-category-visible-at-root**
  SYMPTOM: THERE IS NO STORES TAB ON A CATEGORY PAGE AT ALL, so step 1 cannot be performed — and the page displays a store count that leads nowhere. The Spinning Tops hero renders four count pills: '15 
- **content-discovery-category-counts-and-rollup-leaf-count-matches-its-listing**
  A leaf's tile count is EXACTLY DOUBLE what its page lists, reproduced on two independent leaves. Starter Sets: its chip on the parent and its tile both read 10, while its own page header reads '2 prod
- **content-discovery-category-counts-and-rollup-header-and-child-chips-agree**
  They are not the same kind of number. On Beyblade X Tops the page header reports '4 products' while the child chips directly beneath read 10 and 10 — the header counts what the listing actually shows,
- **content-discovery-category-counts-and-rollup-brand-count-matches-its-listing**
  Same mismatch on the brand axis, plus a missing total. /brands shows Independent Keepers with 4 items; opening /categories/brand-independent-keepers renders 2 listing cards — again a factor of two. Th
- **content-discovery-events-poll-vote-inline**
  THE VOTE WORKS; THE ALREADY-VOTED STATE DOES NOT EXIST. Voting succeeded and was genuinely recorded — 'Vote recorded!' appeared, the results switched to percentages, and the participant count moved 36
- **content-discovery-search-search-faqs**
  SYMPTOM: THE SIDEBAR COUNTS THE MATCHES AND THE LIST SHOWS NONE. On /faqs I typed 'refund' into the 'Search FAQs...' box (real keystroke — a programmatic value-set does nothing here). The URL became ?
- **content-discovery-search-search-faq-category-page**
  SAME DEFECT, SECOND ENTRY POINT: /faqs/returns_refunds renders '0 questions' and zero question elements, while the /faqs sidebar counts Returns & Refunds as 7. The page itself loads fine — correct URL
- **content-discovery-search-search-keeps-facets**
  TWO OF THE THREE FACETS ARE INERT OR WORSE, so inertFacetCount is at least 2 rather than 0. I exercised three (facetsExercised 3) and drove the price one through the real drawer before confirming the 
- **cta-layout-editor-action-bar-four-buttons-wrap-not-overflow**
  Only TWO of the four buttons exist, so the count fails — though the layout claim behind the case actually holds for the two that are there. At 375px, /store/products/new does not render the full edito
- **design-ux-dashboard-layout-collapsible-user**
  COLLAPSING WORKS; REMEMBERING DOES NOT. The /user sidebar groups — ACCOUNT, SHOPPING, SELLING, HELP — are real toggles and they toggle correctly: clicking SHOPPING took its visible items from 17 to 11
- **design-ux-general-design-empty-states**
  /faqs renders a BLANK area for a no-result search. Searching zzzznope on /faqs leaves 'Frequently Asked Questions', every Categories count at 0 (All FAQs 0, General 0, Orders & Payment 0, Shipping & D
- **design-ux-status-badge-legibility-listing-type-tags-readable-dark**
  The Classified badge fails in dark mode, and it is exactly the 'passed light, fails dark' shape the case predicts. Its fill is the only type badge that is theme-DEPENDENT: magenta rgb(192,38,211) in l
- **design-ux-status-badge-legibility-detail-page-tags-readable**
  One badge fails, and it is the same one as on the grid. /auctions/auction-beyblade-x-shark-edge renders eight distinct badges in dark mode and seven are comfortably readable: Live Auction 10.84, 0 bid
- **public-pages-core-listing-pages-category-item-counts-accurate**
  Every count I checked is inflated — three for three, and none is an availability artifact. /categories card 'Beyblade Burst 14 items' -> its page renders 4 products (and still 4 on the All tab, so sol
- **public-pages-core-listing-pages-parent-category-includes-children**
  The inclusion half works; the count half does not. INCLUSION: /categories/category-spinning-tops is a tier-0 root that holds no products of its own, and it renders 30 product links with no empty state
- **public-pages-help-how-it-works-how-auctions-work-matches-product**
  THREE MISMATCHES, ONE OF WHICH IS THE PAGE ARGUING WITH ITSELF. (1) Self-contradiction: 'When the auction ends and you hold the highest bid, you have 48 hours to complete payment. If you do not pay wi
- **public-pages-help-how-it-works-how-checkout-works-matches-product**
  THE STEP COUNT MATCHES AND THE CONTENT DOES NOT — and the step the page leaves out is the one that charges money. Live checkout announces 'Step 1 of 3: Shipping...' and its three steps are Shipping Ad
- **public-pages-help-how-it-works-how-offers-work-matches-product**
  THE PAGE STATES THE WRONG NEGOTIATING BAND, IN BOTH DIRECTIONS. /how-offers-work says 'your counter must be within 20% (above or below) of the seller's price'. The real Make-an-Offer form on Beyblade 
- **public-pages-help-scams-guides-subpages-help-shopping-matches-product**
  SYMPTOM: THE PAGE SENDS BUYERS TO THE WRONG CHECKOUT STEP FOR COUPONS. It says 'Enter your coupon code at step 2 of checkout (Order Summary). The discount is applied immediately and shown in the total
- **public-pages-stores-sellers-directories-category-brand-tab-counts-match**
  Three of eight badges on /categories/category-beyblade-burst disagree with what the tab shows. Auctions badge 3 -> 2 cards. Digital Codes badge 2 -> 1 card. Bundles badge 3 -> 5 cards, which is the in
- **public-pages-stores-sellers-directories-store-tab-counts-match-contents**
  All eight badges over-count what their tab shows on open, and the cause is exactly the one the case predicts: THE BADGE IS AN ALL-STATUSES COUNT WHILE THE TAB OPENS IN THE AVAILABLE SCOPE. Badge vs de
- **public-pages-stores-sellers-directories-store-preorders-tab-default-sort**
  The two defaults disagree, and the direction is the reverse of the defect on record. /pre-orders opens on 'Newest First'. /stores/store-beyblade-arena/pre-orders opens on 'Earliest Delivery'. Read fro
- **selling-digital-content-delivery-add-codes-bulk**
  The ADD works and de-duplicates correctly, but the observed count delta is 0, not the expected 3 — and the seller cannot see any of it. I pasted four lines into the bulkCodes textarea with a deliberat
- **selling-seller-listing-types-auction-row-shows-bid-info**
  THE SELLER SEES HOW MANY BIDS, BUT NOT WHAT THEY ARE WORTH. Every auction row carries real auction-specific information rather than product boilerplate — title, an 'auction' badge, then a line reading

## 404-or-missing — 11

- **admin-admin-detail-round-trips-admin-detail-missing-id-404s**
  The ORDERS half passes and the COUPONS half fails. /admin/orders/zzzznope-not-an-order-42/view correctly renders "404 - Page not found / The page you are looking for does not exist." But /admin/coupon
- **admin-media-watermark-watermark-custom-offset**
  THE 'USE A CUSTOM X/Y OFFSET INSTEAD' CONTROL DOES NOT EXIST ON THE PAGE. Step 2 is 'find the custom offset controls' and the watermark panel contains no controls at all — heading plus save button, ze
- **admin-users-trust-report-submit-requires-detail**
  THE VALIDATION HALF PASSES AND THE LISTING-REPORT PATH DOES NOT EXIST. Empty submit is handled correctly: on /report, pressing 'Submit report' with everything empty keeps you on the page with no succe
- **buying-my-orders-orders-type-tabs-actually-filter**
  SYMPTOM: THE TYPE FILTER DOES NOT EXIST. /user/orders offers exactly three tabs — Active, Closed, All — which are the order-SCOPE tabs, not the order-TYPE ones. I enumerated every button, link, option
- **buying-offers-notification-click-lands-on-the-right-page**
  SYMPTOM: THE ORDER NOTIFICATION'S 'Track Order' LINK 404s. It points at /user/orders/order-1-20260515-abc123 and that URL returns HTTP 404. The route shape is the problem rather than the id: the sibli
- **buying-user-dashboard-navigation-logged-out-redirect**
  THE PRIVACY HALF IS CLEAN. THE RETURN-TO-DESTINATION HALF DOES NOT EXIST. Taking the good part first, because it is the part with consequences. Signed out, all three routes the case names — /user, /us
- **content-discovery-event-detail-subroutes-cancelled-event-refuses-participation**
  The cancelled event has no public page at all, so neither half of the case can happen. /events/event-x-launch-raffle-cancelled renders "Event Not Found" with the page title "Event Not Found | LetItRip
- **design-ux-general-design-error-states**
  A top-level unmatched URL falls through to the BARE Next.js 404 with no way back into the site. /this-page-does-not-exist-qa returns HTTP 404 and renders only two lines - '404' and 'This page could no
- **public-pages-auth-error-pages-unauthorized-404-pages**
  NEITHER PAGE CRASHES, BUT THE 404 FAILS THE CLAUSE THAT MATTERS: 'at least one working link back into the site'. THE 404 — /this-route-does-not-exist-qa-probe returns a correct HTTP 404 (not a 200) an
- **selling-seller-catalog-org-seller-categories-crud**
  CREATE WORKS AND PERSISTS. RENAME IS IMPOSSIBLE, DELETE DOES NOT EXIST, AND THE LIST SHOWS NO NAMES. Three separate defects on one page. (1) THE LIST RENDERS EVERY CATEGORY AS '🏷️ —'. /store/categori
- **selling-seller-ops-comms-seller-inventory-print**
  THE PAGE THIS CASE NAMES NO LONGER EXISTS — AND THAT IS THE CORRECT OUTCOME, NOT A REGRESSION. /store/inventory/print returns HTTP 404. The case was written when that route existed as a DEGRADED DUPLI

## blank-page — 6

- **admin-site-system-carousel-edit-and-delete**
  THE EDIT-CAROUSEL FORM OPENS BLANK AND PRE-SET TO THE WRONG STATUS, AND SAVING IT WOULD TAKE THE HOMEPAGE HERO OFF THE HOMEPAGE. The list page is correct and is itself a fix worth noting — /admin/caro
- **admin-uncovered-admin-pages-action-index-renders**
  IT IS A BLANK SHELL. The page renders its chrome — a toolbar, a table header reading Entry / Kind / Portal / Goes to / Needs / Shown, and a paragraph of help text — and then the single line 'No entrie
- **content-discovery-category-brand-relations-root-page-not-blank-on-large-tree**
  THE BLANK-GRID DISASTER DID NOT HAPPEN — the root renders 15 real product cards and the hero reads '15 products · 9 auctions · 7 pre-orders · 2 stores', so the query is not blowing its value cap and r
- **content-discovery-search-search-store-event-blog-review**
  STORE SEARCH FINDS NOTHING FOR A WORD IN A STORE'S OWN NAME. Verified in the UI first: /stores?q=beyblade renders 'No stores found.' with zero cards — while the unfiltered store list holds two stores,
- **public-pages-newly-wired-browse-indexes-sellers-is-not-a-copy-of-stores**
  /sellers renders NOTHING. Title is "Verified Sellers - LetItRip" and the breadcrumb reads Home / Sellers, but the accessibility tree goes breadcrumb -> secondary nav -> footer with no main content bet
- **public-pages-stores-sellers-directories-sellers-directory**
  SYMPTOM: /sellers renders NO CONTENT AT ALL. HTTP 200, title 'Verified Sellers — LetItRip', breadcrumb 'Home / Sellers' — and then nothing. No heading, no seller cards, no empty-state message, just a 

## search-inert — 5

- **admin-bug-hunter-rewards-catalog-default-active-filter**
  THE DEFAULT FILTER IS CORRECT AND — UNLIKE ELSEWHERE IN THIS ADMIN — HONESTLY DISCLOSED. THE SEARCH BOX BESIDE IT DOES NOT FILTER AT ALL. The default half passes cleanly and is worth describing becaus
- **public-pages-stores-sellers-directories-store-directory**
  SANDBOX HIDING PASSES — 2 stores listed, Beyblade Arena and LetItRip Official, zero sandbox cards. SEARCH PASSES — ?q=zzzznope returns 0 with a named 'No stores found.' empty state, so the SSR search 
- **public-pages-stores-sellers-directories-scams-registry**
  SYMPTOM: THE SEARCH DOES NOTHING. The page's own subtitle reads 'Verified scammers active in India's collectibles community. Search by name, phone, or UPI' above a prominent search box, and it does no
- **selling-seller-catalog-org-seller-category-inline-create**
  THE CREATE FLOW ITSELF WORKS EXACTLY AS SPECIFIED. THE STEP BEFORE IT — SEARCHING THE PICKER — DOES NOT FILTER AT ALL. On the create half, which is the case's title: the picker's '+ Create new categor
- **selling-seller-custom-brands-seller-brand-inline-create**
  THE CREATE HALF WORKS. THE SEARCH STEP BEFORE IT DOES NOT FILTER, AND THE BRAND FIELD IS HIDDEN BEHIND AN ADVANCED TOGGLE. Taking those in order. THE BRAND PICKER IS NOT ON THE FORM AS IT OPENS. /stor

## guest-price-leak — 3

- **buying-cart-cart-guest-prices-gated**
  SYMPTOM: THE PRICE GATE IS APPLIED ON THE PRODUCT PAGE AND NOT ON THE CART. Signed out, /products/product-beyblade-burst-valkyrie correctly shows 'Sign in to see price' and renders ZERO rupee amounts.
- **public-pages-core-listing-pages-bundles-listing-page**
  The price is gated but the DISCOUNT PERCENTAGE is not, which is the specific thing the case forbids. Signed out, each card's price row correctly reads '🔒 Sign in to see the bundle price' and no rupee
- **public-pages-newly-wired-browse-indexes-guest-can-browse-all-six**
  Five of six are fine signed out - classified, digital-codes, live, lottery and brands all render with content and gated prices. /sellers is broken: it renders no main content at all for a guest. One o

## cart-line-destroyed — 2

- **buying-cart-group-line-member-edit-recalculates**
  The claim cannot hold because THE GROUPED LINE DOES NOT SURVIVE LONG ENOUGH TO BE EDITED. Opening /cart destroys it. Full sequence, run twice: on /groups/group-beyblade-arena-extras I selected both me
- **buying-cart-bundle-line-in-cart**
  The bundle line is BUILT correctly and then destroyed before it can be read. The one key this case pins down is right at creation: GET /api/cart immediately after adding shows price 2999 per copy — th

## totals-disagree — 2

- **buying-cart-cart-checkout-order-totals-agree**
  THE CART AND CHECKOUT AGREE EXACTLY; THE CREATED ORDER DOES NOT. I carried one cart all the way through and read the figures at each stage. Cart breakdown and the per-seller card line: Subtotal Rs 2,2
- **selling-seller-custom-brands-seller-brand-inline-create-persists**
  IT PERSISTS — and it is minted CORRECTLY, which is worth recording — but the case's own procedure cannot be followed. After a full page reload of /store/products/new the brand collection still totals 

## missing-cta — 1

- **buying-cart-cart-empty-state**
  The empty state renders cleanly but it has NO CALL TO ACTION, which is the half of the claim that fails. After clearing, /cart shows exactly two lines of text: 'Your cart is empty' and 'Add products f

## facet-inert — 1

- **public-pages-stores-sellers-directories-store-classified-live-facets-filter**
  THE FACETS THAT EXIST WORK; THE ONES THE CASE NAMES MOSTLY DO NOT EXIST. Classifieds drawer offers Negotiable, Shipping and Asking Price — and no CITY facet at all, so the case's central step ('select

## save-not-persisted — 1

- **selling-listing-edit-roundtrip-edit-save-keeps-published**
  The listing stays published, but the EDIT DOES NOT PERSIST - and both save buttons fail differently. Appended "roundtrip" to the Description of product-beyblade-x-dran-sword-video-demo. (a) "Save Chan