# ASCII Diagrams — LetiTrip UI Structure

> **Living document.** Add or update a diagram every time a page/view/form/modal is built or significantly changed.
> Every tab, column, field, button, modal, and empty state must appear. Nothing omitted.
> Format: `## [Area] > [Page Name]`  Status: ✅ built | ⏳ planned | ⚠️ partial

## Index

- [Legend](#legend)
- **Shared Components**
  - [ListingToolbar](#shared--listingtoolbar-)
  - [Standard Admin Listing View Pattern](#shared--standard-admin-listing-view-pattern-)
  - [MediaUploadField](#shared--mediauploadfield-)
  - [PageLoader](#shared--pageloader-)
- **UX Patterns — Form Shells (shared across Admin / Store / User)**
  - [FormShell](#ux--formshell--full-width-side-panel-)
  - [QuickFormDrawer](#ux--quickformdrawer--fast-action-drawer-)
  - [StepForm](#ux--stepform--multi-step-create-wizard-)
  - [MediaPickerDrawer](#ux--mediapickerdrawer--fast-media-select-)
  - [PreviewPane](#ux--previewpane--in-panel-item-preview-)
  - [Form Assignment Reference](#ux--form-assignment-reference)
- **Architecture**
  - [Store Identity Model (ARCH2/ARCH5/ARCH8)](#architecture--store-identity-arch2arch5arch8--storeid-migration)
- **Admin Area**
  - [Layout Shell](#admin--layout-shell)
  - [Dashboard](#admin--dashboard-)
  - [Products List](#admin--products-list-)
  - [Product Editor](#admin--product-editor-)
  - [Coupons List](#admin--coupons-list-)
  - [Coupon Editor](#admin--coupon-editor-)
  - [Blog List](#admin--blog-list-)
  - [Blog Editor](#admin--blog-editor-)
  - [FAQs List](#admin--faqs-list-)
  - [FAQ Editor](#admin--faq-editor-)
  - [Brands List](#admin--brands-list-)
  - [Brand Editor](#admin--brand-editor-)
  - [Categories List](#admin--categories-list-)
  - [Category Editor](#admin--category-editor-)
  - [Carousel List](#admin--carousel-list-)
  - [Carousel Editor](#admin--carousel-editor-)
  - [Homepage Sections](#admin--homepage-sections-)
  - [Section Editor — Shared Modal Shell](#admin--homepage-section-editor--shared-modal-shell)
  - [Section Editor — welcome](#admin--section-editor--welcome)
  - [Section Editor — carousel](#admin--section-editor--carousel)
  - [Section Editor — stats](#admin--section-editor--stats)
  - [Section Editor — trust-indicators](#admin--section-editor--trust-indicators)
  - [Section Editor — categories](#admin--section-editor--categories)
  - [Section Editor — brands](#admin--section-editor--brands)
  - [Section Editor — products](#admin--section-editor--products)
  - [Section Editor — pre-orders](#admin--section-editor--pre-orders)
  - [Section Editor — auctions](#admin--section-editor--auctions)
  - [Section Editor — banner](#admin--section-editor--banner)
  - [Section Editor — features](#admin--section-editor--features)
  - [Section Editor — reviews](#admin--section-editor--reviews)
  - [Section Editor — whatsapp-community](#admin--section-editor--whatsapp-community)
  - [Section Editor — faq](#admin--section-editor--faq)
  - [Section Editor — blog-articles](#admin--section-editor--blog-articles)
  - [Section Editor — newsletter](#admin--section-editor--newsletter)
  - [Section Editor — stores](#admin--section-editor--stores)
  - [Section Editor — events](#admin--section-editor--events)
  - [Section Editor — social-feed](#admin--section-editor--social-feed)
  - [Section Editor — custom-cards](#admin--section-editor--custom-cards)
  - [Section Editor — google-reviews](#admin--section-editor--google-reviews)
  - [Orders List](#admin--orders-list-)
  - [Order Status/Tracking SideDrawer](#admin--order-statustracking-sidedrawer-)
  - [Users List](#admin--users-list-)
  - [Stores List](#admin--stores-list-)
  - [Store Editor SideDrawer](#admin--store-editor-sidedrawer-)
  - [Reviews List](#admin--reviews-list-)
  - [Bids List](#admin--bids-list-)
  - [Payouts List](#admin--payouts-list-)
  - [Analytics](#admin--analytics-)
  - [Site Settings](#admin--site-settings--va8--13-groups)
  - [Feature Flags](#admin--feature-flags-)
  - [Navigation CMS](#admin--navigation-cms-)
  - [Nav Editor SideDrawer](#admin--nav-editor-sidedrawer-)
  - [Media Library](#admin--media-library-)
  - [Newsletter](#admin--newsletter-)
  - [Contact Submissions](#admin--contact-submissions-)
  - [Contact Editor SideDrawer](#admin--contact-editor-sidedrawer-)
  - [Return Requests](#admin--return-requests-)
  - [Store Addresses](#admin--store-addresses-)
  - [Seed & Docs Panel](#admin--seed--docs-panel-)
  - [Sessions](#admin--sessions-adminsessionsview--ll11)
  - [Event Entries](#admin--event-entries-adminallentryview--ll12)
  - [Notifications](#admin--notifications-adminnotificationsview--ll13)
  - [Carts](#admin--carts-admincartsview--ll14)
  - [Wishlists](#admin--wishlists-adminwishlistsview--ll15)
- **Store Area**
  - [Layout Shell](#store--layout-shell)
  - [Dashboard](#store--dashboard-)
  - [Products List](#store--products-list-)
  - [Orders List](#store--orders-list-)
  - [Order Detail SideDrawer](#store--order-detail-sidedrawer-)
  - [Coupons List](#store--coupons-list-)
  - [Analytics](#store--analytics-)
  - [Storefront Edit](#store--storefront-edit-)
  - [Shipping Config](#store--shipping-config-)
  - [Payout Settings](#store--payout-settings-)
  - [Addresses (Pickup Locations)](#store--addresses-pickup-locations-)
- **User Area**
  - [Layout Shell](#user--layout-shell)
  - [Account Hub](#user--account-hub-)
  - [Orders List](#user--orders-list-)
  - [Order Detail](#user--order-detail-)
  - [Wishlist](#user--wishlist-)
  - [Addresses](#user--addresses-)
  - [Profile Edit](#user--profile-edit-)
  - [Settings](#user--settings-)
  - [Notifications](#user--notifications-)
- **Public Area**
  - [Homepage](#public--homepage--all-sections--overview)
  - [Section — welcome](#public--homepage-section--welcome)
  - [Section — carousel](#public--homepage-section--carousel)
  - [Section — stats](#public--homepage-section--stats)
  - [Section — trust-indicators](#public--homepage-section--trust-indicators)
  - [Section — categories](#public--homepage-section--categories)
  - [Section — brands](#public--homepage-section--brands)
  - [Section — products / auctions / pre-orders](#public--homepage-section--products--auctions--pre-orders)
  - [Section — banner](#public--homepage-section--banner)
  - [Section — features](#public--homepage-section--features)
  - [Section — reviews](#public--homepage-section--reviews)
  - [Section — stores](#public--homepage-section--stores)
  - [Section — events](#public--homepage-section--events)
  - [Section — blog-articles](#public--homepage-section--blog-articles)
  - [Section — whatsapp-community](#public--homepage-section--whatsapp-community)
  - [Section — faq](#public--homepage-section--faq)
  - [Section — newsletter](#public--homepage-section--newsletter)
  - [Section — social-feed](#public--homepage-section--social-feed)
  - [Section — custom-cards](#public--homepage-section--custom-cards)
  - [Section — google-reviews](#public--homepage-section--google-reviews)
  - [Products Listing](#public--products-listing-)
  - [Auctions Listing](#public--auctions-listing-)
  - [Product Detail](#public--product-detail-)
  - [Auction Detail](#public--auction-detail-)
  - [Store Detail](#public--store-detail-)
  - [Categories Listing](#public--categories-listing-)
  - [Category Detail](#public--category-detail-)
  - [Brands Listing](#public--brands-listing-)
  - [Events Listing](#public--events-listing-)
  - [Event Detail](#public--event-detail-)
  - [Blog Listing](#public--blog-listing-)
  - [FAQs](#public--faqs-)
  - [Search](#public--search-)
  - [Cart](#public--cart-)
  - [Checkout](#public--checkout-)
  - [About](#public--about-)
  - [Privacy Policy](#public--privacy-policy-)
  - [Terms of Service](#public--terms-of-service-)
  - [Cookie Policy](#public--cookie-policy-)
  - [Refund Policy](#public--refund-policy-)
  - [Shipping Policy](#public--shipping-policy-)
- **Auth Pages**
  - [Login](#auth--login-)
  - [Register](#auth--register-)
  - [Forgot Password](#auth--forgot-password-)
- [SeedPanel > Collection Card](#seedpanel--collection-card-expanded)

---

## Legend

```
┌─────────┐  box border
│         │  content area
├─────────┤  section divider
[btn]        button
[input]      text input
[sel]        select/dropdown
[tog]        toggle/switch
[chk]        checkbox
★★★☆☆       star rating
░░░░░        empty / skeleton state
→            navigates to
⊕            opens create form / modal
⊞            opens edit form
🗑            delete action
⋮            row action menu
```

---

## Shared > ListingToolbar ✅

```
Component: appkit/src/ui/components/ListingToolbar.tsx
Used by: all 11 *IndexListing + Store*Listing public/store views + all 16 Admin*View listing views

Mobile layout (two rows):
┌─────────────────────────────────────────────────────────────────┐
│  [🔍 Search…                                         [🔍]]      │  ← full-width search row
├───────────────────────────────────────────────────────────────  │
│  [⚙ Filters (N)]  [Sort: … ▾]  [⊞/≡]  [↺]  {extra}           │  ← controls row
└─────────────────────────────────────────────────────────────────┘

Desktop layout (single row):
┌─────────────────────────────────────────────────────────────────┐
│  [🔍 Search…  🔍]  [⚙ Filters (N)]  Sort [… ▾]  [⊞/≡]  [↺]  {extra}  │
└─────────────────────────────────────────────────────────────────┘

Controls & update behaviour:
  [🔍 Search]     input + commit button / Enter key → DEFERRED (URL updated on commit only)
  [⚙ Filters (N)] opens filter drawer → all drawer fields DEFERRED until [Apply Filters]
  [Sort ▾]        dropdown → INSTANT URL update (table.set "sort")
  [⊞/≡]           grid/list view toggle → INSTANT (NON_RESETTING_KEY, no page reset)
  [↺]             reset ALL icon (RotateCcw) → INSTANT table.setMany clears q+sort+all filters
                  visible only when hasActiveState=true (search/sort/toggle/filter is non-default)
  {extra}         per-listing slot — e.g. Show ended [tog], Show sold [tog], Show closed [tog]
                  these toggles are also INSTANT (table.set with URL update)

Filter drawer (fixed left overlay, z-50, slides in):
┌────────────────────────────────────┐
│  Filters              [Clear all] [✕] │  ← Clear all = DEFERRED (clears pendingFilters only,
├────────────────────────────────────┤       no URL touch; Apply commits to URL)
│  <FilterPanel fields — pending>    │
├────────────────────────────────────┤
│  [Apply Filters (N)]               │  ← commits pendingFilters → URL via table.setMany
└────────────────────────────────────┘

Toolbar reset [↺] scope per listing:
  AuctionsIndexListing     clears: q, sort→"auctionEndDate", showEnded, FILTER_KEYS
  ProductsIndexListing     clears: q, sort→"-createdAt",     showSold,  FILTER_KEYS
  PreOrdersIndexListing    clears: q, sort→"-createdAt",     showClosed, FILTER_KEYS
  StoresIndexListing       clears: q, sort→"-createdAt",                FILTER_KEYS
  StoreProductsListing     clears: q, sort→"-createdAt",                FILTER_KEYS
  StoreAuctionsListing     clears: q, sort→"auctionEndDate",            FILTER_KEYS
  StorePreOrdersListing    clears: q, sort→"-createdAt",                FILTER_KEYS
  CategoriesIndexListing   clears: q, sort→"name",                      FILTER_KEYS
  ReviewsIndexListing      clears: q, sort→"-createdAt",                FILTER_KEYS
  EventsIndexListing       clears: q, sort→"startsAt",                  FILTER_KEYS
  BlogIndexListing         clears: q, sort→"-publishedAt",              FILTER_KEYS
  Admin*View               clears: q, sort→DEFAULT_SORT, all FILTER_KEYS (via resetAll)
```

---

## Shared > Standard Admin Listing View Pattern ✅

```
Pattern used by all 16 AdminXxxView components (Session 76-listing migration)
appkit/src/features/admin/components/Admin*View.tsx

Views: AdminBidsView, AdminCartsView, AdminWishlistsView, AdminSessionsView,
       AdminPayoutsView, AdminNotificationsView, AdminAllEventEntriesView,
       AdminReturnRequestsView, AdminStoreAddressesView, AdminNewsletterView,
       AdminContactView, AdminEventsView, AdminReviewsView, AdminProductsView,
       AdminCarouselView, AdminSectionsView

┌───────────────────────────────────────────────────────────────────────────────┐
│  sticky ListingToolbar  top-[var(--header-height,0px)]                        │
│  [🔍 Search…  🔍]  [⚙ Filters (N)]  Sort [… ▾]  [↺]  {extra: Export CSV...} │
├───────────────────────────────────────────────────────────────────────────────┤
│  sticky Pagination row (only when totalPages > 1)                             │
│  backdrop-blur bg-white/95 dark:bg-slate-900/95 border-b                      │
│                   [◀]  [1]  [2]  [3]  …  [▶]                                 │
├───────────────────────────────────────────────────────────────────────────────┤
│  ❌ {errorMessage}  (conditional red banner)                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│  DataTable  (rounded-xl border overflow-hidden)                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  Name / Title      │ Secondary  │ Status  │ Updated  │     ⋮            │ │
│  ├────────────────────┼────────────┼─────────┼──────────┼──────────────────┤ │
│  │  Primary name      │ details    │ [badge] │ 2h ago   │     ⋮ menu       │ │
│  │  subtitle text     │            │         │          │                   │ │
│  ├────────────────────┼────────────┼─────────┼──────────┼──────────────────┤ │
│  │  …                 │ …          │ …       │ …        │     ⋮            │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  Loading: 5 skeleton rows (animate-pulse h-4 w-full rounded)                 │
│  Empty:   "No {resource} — use 'New …' to add one"                           │
└───────────────────────────────────────────────────────────────────────────────┘

Filter drawer (fixed left overlay, z-50, w-80):
┌──────────────────────────────────────────────────┐
│  Filters                        [Clear all]  [✕] │
├──────────────────────────────────────────────────┤
│  STATUS                                          │
│  [All]  [Active]  [Inactive]  …                  │  ← chip buttons, PENDING only
│                                                  │
│  TYPE (when applicable)                          │
│  [All]  [TypeA]  [TypeB]  …                      │
├──────────────────────────────────────────────────┤
│  [Apply Filters (N)]                             │  ← commits pendingFilters → URL
└──────────────────────────────────────────────────┘
  Clear all = clears pendingFilters ONLY (no URL touch)
  ✕ = closes drawer, discards pending changes

Row action menu (⋮):
  [Edit]           → window.location.href = /admin/{resource}/{id}/edit
  [View]           → opens SideDrawer or navigates
  [Approve]        → PATCH mutation + queryClient.invalidateQueries
  [Delete]         → opens ConfirmDeleteModal (variant=destructive)
  [Mark paid]      → opens mark-paid Modal (transactionId input)
  [Unsubscribe]    → opens ConfirmDeleteModal (variant=warning)
  [Cancel bid]     → opens ConfirmDeleteModal (variant=warning), disabled when already cancelled

Mutations — rendered as React.Fragment siblings AFTER <div className="min-h-screen">:
  <>
    <div className="min-h-screen">…toolbar + table…</div>
    <ConfirmDeleteModal isOpen={deleteOpen} … />
    <Modal isOpen={markPaidOpen} … />
  </>

State architecture:
  useUrlTable({ defaults })    → URL-backed: q, sort, page, all FILTER_KEYS
  pendingFilters               → local React state; synced from URL on drawer open; committed on Apply
  useAdminListingData(…)       → rows, total, isLoading, errorMessage
  (mutations)                  → useMutation + queryClient.invalidateQueries on success

Views with no filter drawer (sort-only):
  AdminWishlistsView, AdminReturnRequestsView, AdminStoreAddressesView
  (no openFilters / filterOpen / pendingFilters — ListingToolbar has no onFiltersClick)
```

---

## Shared > MediaUploadField ✅

```
Component: appkit/src/features/media/upload/MediaUploadField.tsx
Default: captureSource="both", captureMode="photo"

Tab bar (only when showYoutube or showExternal is true):
  [Upload]  [YouTube]  [External URL]

─── Upload tab (default) ─────────────────────────────────────────────────────

When captureSource="both" (default) AND isCameraSupported:
  [📁 Upload file]  [📷 Use camera]   ← mode toggle buttons

  File mode (inputMode="file"):
  ┌──────────────────────────────────────────────────────┐
  │  Choose file  (dashed border button)                 │  → opens hidden <input type=file>
  └──────────────────────────────────────────────────────┘

  Camera mode (inputMode="camera"):
  ┌──────────────────────────────────────────────────────┐
  │  <CameraCapture> live viewfinder                     │
  │  [📷 Capture]                                        │
  └──────────────────────────────────────────────────────┘

When captureSource="file-only":   shows file picker only (no toggle)
When captureSource="camera-only": shows camera only (no toggle)
When isCameraSupported=false + captureSource="both":
  fallback → hidden <input capture="environment"> triggered by button

After upload / value set:
  ┌─────────────────────────────────────────┐
  │  [image or video preview]               │
  │  [Edit video ▾]  [Remove]               │  ← video only: edit opens trim/thumbnail modals
  └─────────────────────────────────────────┘

─── YouTube tab ──────────────────────────────────────────────────────────────
  [YouTube video ID or URL _______________]  [Apply]

─── External URL tab ─────────────────────────────────────────────────────────
  [https://…  ___________________________]  [Apply]
  "External URLs are stored as-is and are not watermarked."

Staged-URL cleanup:
  Every uploaded URL is tracked in stagedUrlsRef.
  On unmount (if not isPersisted): calls onAbort(stagedUrls[]) → parent DELETE /api/media?url=…
  On save: parent sets isPersisted=true to suppress cleanup.
```

---

## Shared > PageLoader ✅ (X5 — replaces all 15 loading.tsx skeletons)

```
Mode A — no children (simple spinner):

  Normal (< 15s):              Timed-out (≥ 15s):
  ┌──────────────────────┐     ┌──────────────────────────────────┐
  │                      │     │                                  │
  │    ◌ (spinner lg)    │     │  Something went wrong.           │
  │     Loading…         │     │  Please refresh the page.        │
  │                      │     │                                  │
  └──────────────────────┘     │         [Refresh]                │
  min-height: 60vh             │                                  │
                               └──────────────────────────────────┘
                                 Refresh → window.location.reload()

Mode B — with children (skeleton background, better Lighthouse CLS):

  ┌──────────────────────────────────────────────┐
  │  {children} skeleton layout (aria-hidden)    │  ← preserves page shape
  │  ░░░░░░░░░░  ░░░░░░░  ░░░░░░░░░░░░░░         │
  │  ░░░░░░░░░░  ░░░░░░░  ░░░░░░░░░░░░░░         │
  │  ┌────────────────────────────────────────┐  │
  │  │  backdrop-blur overlay (fixed, z-50)   │  │
  │  │  Normal: ◌ spinner + "Loading…"        │  │
  │  │  Timeout: "Something went wrong…"      │  │
  │  │           [Refresh]                    │  │
  │  └────────────────────────────────────────┘  │
  └──────────────────────────────────────────────┘

Usage: loading.tsx files — all 15 under src/app/[locale]/ use <PageLoader />
       Pass a skeleton as children on any page where CLS matters.
```

---

# UX PATTERNS — FORM SHELLS

> Every create/edit interaction across admin, store, and user areas uses one of these three shells. Never navigate to a new page for a form — use a shell to keep the user in context with a fast, overlay-based experience.

## UX > FormShell — Full-Width Side Panel ⏳

The primary create/edit UX. A full-viewport-width overlay panel that slides in from the right. Sticky top bar + optional left section nav + scrollable body + sticky bottom bar.

```
DESKTOP (≥ 768px)
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║ STICKY TOP BAR  (h-14, backdrop-blur-md, border-b)                                       ║
║  [← Back to Products]   Edit Product — Charizard ETB        [👁 Preview] [Save] [Publish] ║
╠════════════╦═════════════════════════════════════════════════════════════════════════════╣
║ SECTION    ║  SCROLLABLE BODY  (flex-1, overflow-y: auto)                                ║
║ NAV (200px)║                                                                              ║
║            ║  § Basic Info                                                                ║
║ ● Basic    ║  ┌──────────────────────────────────────────────────────────────────────┐   ║
║ ○ Media    ║  │ Title *     [Charizard Base Set ETB — Sealed_____________________]   │   ║
║ ○ Pricing  ║  │ Slug        [product-charizard-etb-sealed___________] [Auto ↺]      │   ║
║ ○ Shipping ║  │ Category *  [Trading Cards ▾]   Sub  [Pokémon TCG ▾]               │   ║
║ ○ SEO      ║  │ Brand       [Pokémon Company ▾]  Condition [Sealed ▾]              │   ║
║            ║  │ Tags        [etb] [sealed] [base-set] [+ add tag]                   │   ║
║ ─────────  ║  └──────────────────────────────────────────────────────────────────────┘   ║
║ [👁 Preview]║                                                                             ║
║ (sticky)   ║  § Media                                                                     ║
║            ║  § Pricing & Stock                                                           ║
║            ║  § Shipping                                                                  ║
║            ║  § SEO & Visibility                                                          ║
╠════════════╩═════════════════════════════════════════════════════════════════════════════╣
║ STICKY BOTTOM BAR  (h-14, backdrop-blur-md, border-t)                                    ║
║  [✕ Discard changes]                               [Save Draft]  [Publish / Update →]   ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

MOBILE (< 768px — left nav becomes horizontal tab strip)
╔════════════════════════════════════════════════════╗
║ ← Edit Product               [Save] [Publish]     ║  ← sticky top
╠════════════════════════════════════════════════════╣
║ [Basic] [Media] [Pricing] [Shipping] [SEO]         ║  ← tab strip (replaces left nav)
╠════════════════════════════════════════════════════╣
║  (scrollable body — one section at a time)         ║
╠════════════════════════════════════════════════════╣
║ [Discard]       [Draft]          [Publish →]       ║  ← sticky bottom
╚════════════════════════════════════════════════════╝

Behaviour:
  - Slides in from right (transform: translateX), backdrop dims page behind
  - Keyboard trap (Tab cycles within panel), Esc shows "Unsaved changes?" confirm
  - Left nav items are anchor-scrolls within body — no step validation
  - [Preview] in top bar and left nav both trigger PreviewPane (see below)
  - [Save Draft] saves without publishing; [Publish] / [Update] saves + sets status=published
  - Form dirty state tracked — browser unload warning if unsaved
```

---

## UX > QuickFormDrawer — Fast Action Drawer ⏳

Narrow (~400px) right-anchored overlay for ≤ 6 field actions. No step wizard, no section nav. Used for addresses, coupons, tag adds, status changes, price edits.

```
                 ┌────────────── QUICK FORM (400px, slides from right) ───────────────┐
                 │ ✕  Quick: Add Coupon                                                │
                 ├─────────────────────────────────────────────────────────────────────┤
                 │  Code *         [SUMMER20______________________________]             │
                 │  Type           [Percentage                          ▾]             │
                 │  Value          [20____]  %                                         │
                 │  Min. purchase  [₹ 999__]                                           │
                 │  Expiry         [2026-12-31_______________]                         │
                 │  Active         [●────────────] Yes                                 │
                 ├─────────────────────────────────────────────────────────────────────┤
                 │  ⚠ Code already exists — try SUMMER21                               │  ← inline error
                 ├─────────────────────────────────────────────────────────────────────┤
                 │              [Cancel]              [Create →]                       │
                 └─────────────────────────────────────────────────────────────────────┘

Other QuickFormDrawer uses (all the same shell, different fields):
  Add / Edit Address    — label, full name, phone, line1, city, state, pin, [●] default
  Quick Status Update   — [Select new status ▾]  [Reason (optional)________]  [Apply]
  Quick Price Edit      — Price [₹_____]  Original price [₹_____]  [Update]
  Quick Stock Update    — Current: 12  New qty [____]  [Update]
  Add Tag / Keyword     — Tag [__________] [+ Add]
  Edit Nav Item         — Label [____]  Href [____]  Icon [____]  Order [__]  [Save]
  Reply to Review       — [Textarea____________]  [Submit Reply]
```

---

## UX > StepForm — Multi-Step Create Wizard ⏳

Rendered inside FormShell body (replaces section nav for CREATE flows). Bottom bar CTA labels change per step. Progress auto-saved to `localStorage` on each step advance.

```
STEP INDICATOR  (sticky below top bar, ~48px)
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ① Basic Info  ──────  ② Media  ──────  ③ Pricing  ──────  ④ Shipping  ──  ⑤ SEO   │
│   [●]                  [●]              [◑ current]         [○]              [○]    │
│   ✓ complete           ✓ complete       ← active             locked          locked  │
└─────────────────────────────────────────────────────────────────────────────────────┘

STEP BODY  (scrollable, only current step visible at a time):

── STEP 1: Basic Info ────────────────────────────────────────────────────────────────
  Title *        [_____________________________________________]
  Slug           [product-_____________________________] [Auto ↺]
  Category *     [Trading Cards                        ▾]
  Subcategory    [Pokémon TCG                          ▾]
  Brand          [Pokémon Company                      ▾]
  Condition *    [New / Sealed                         ▾]
  Description    [— RichTextEditor, lightweight 1-row toolbar —]
  Tags           [etb] [sealed] [charizard] [+ add]
  Features       [High-quality holo printing] [×]   [+ add feature]

── STEP 2: Media ─────────────────────────────────────────────────────────────────────
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  ▲  Drag & drop images here, or [📂 Open Media Library]                     │
  │  Accepts JPG PNG WEBP AVIF · max 5 MB each · up to 10 images               │
  └──────────────────────────────────────────────────────────────────────────────┘
  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                   drag to reorder
  │ 🖼 ★  │ │ 🖼    │ │ 🖼    │ │  + Add│  ★ = set as main  × = remove
  │ main  │ │ img-2 │ │ img-3 │ │       │
  └───────┘ └───────┘ └───────┘ └───────┘
  Video (opt.) [Paste YouTube URL _________________] [Link ↺]
               Preview: [thumbnail 160×90  "Charizard ETB Unboxing"]

── STEP 3: Pricing & Stock ───────────────────────────────────────────────────────────
  Price *          [₹ 4499]   (paise: 449900 stored)
  Original price   [₹ 5000]   → SALE badge shown if price < originalPrice
  Stock qty *      [12]
  Available qty    [12]  (auto-computed, = stockQty initially)
  [ ] Featured     [ ] On Sale     [ ] Promoted

── STEP 4: Shipping ──────────────────────────────────────────────────────────────────
  Shipping paid by  ( ) Seller  (●) Buyer
  Pickup address    [Select store address ▾]  or [+ Create address]
  Insurance         [●────] On    Cost [₹ 50]
  Return policy     [__________________________________]

── STEP 5: SEO & Publish ─────────────────────────────────────────────────────────────
  SEO Title       [Charizard Base Set ETB — Sealed | LetItRip] 50/60
  SEO Description [Buy Charizard Base Set ETB sealed from CardGame Hub…] 130/155
  SEO Keywords    [pokemon etb] [charizard] [sealed] [base set] [+ add]
  Status          ( ) Draft   (●) Published
  ──────────────────────────────────────────────────────────────────────────────
  [👁 Preview how this will look to buyers]    → opens PreviewPane

BOTTOM BAR (changes text per step):
  Step 1:   [Cancel]                                [Next: Media →]
  Step 2:   [← Back: Basic]                        [Next: Pricing →]
  Step 3:   [← Back: Media]                        [Next: Shipping →]
  Step 4:   [← Back: Pricing]                      [Next: SEO →]
  Step 5:   [← Back: Shipping]   [Save Draft]      [Publish Now ✓]

AUCTION extra step (Step 3 inserted):
── STEP 3: Auction Settings ──────────────────────────────────────────────────────────
  Starting bid *     [₹ 99999]
  Reserve price      [₹ 200000]  (hidden from buyers, shows "Reserve: Met ✓" when exceeded)
  Buy Now price      [₹ 350000]  (optional; enables instant win)
  Bid increment *    [₹ 5000]
  Auction end date * [2026-06-01  14:00 IST]
  Auto-extend        [●────] On    Minutes [5]   (extends by N mins if bid in last N mins)
  Shipping paid by   ( ) Seller   (●) Winner

PRE-ORDER extra step (Step 3 inserted):
── STEP 3: Pre-Order Settings ────────────────────────────────────────────────────────
  Deposit %          [30]  %   →  Deposit amount: ₹1,349 (auto-computed)
  Max quantity *     [50]
  Delivery date *    [2026-09-01]
  Production status  ( ) Upcoming  (●) In Production  ( ) Ready to Ship
  Cancellable        [●────] On  (buyers can cancel before dispatch)
```

---

## UX > MediaPickerDrawer — Fast Media Select ⏳

Full-viewport overlay that opens on top of FormShell when any media upload field is triggered. Returns `string[]` of selected URLs to the calling form field.

```
╔═════════════════════════════════════════════════════════════════════════════════════════╗
║ ✕  Media Library                          [↑ Upload New]  [2 selected]  [Done →]      ║
╠═════════════════════════════════════════════════════════════════════════════════════════╣
║  [🔍 Search filename…]    [Type: All ▾]    [Uploaded ▾]    [⊞ Grid]  [≡ List]         ║
╠═════════════════════════════════════════════════════════════════════════════════════════╣
║  ── UPLOAD ZONE  (expands on "↑ Upload New") ────────────────────────────────────── ║
║  │  ▲  Drag files here or [Browse files…]  ·  JPG PNG WEBP AVIF MP4  ·  max 5 MB    │ ║
║  │  Uploading:  product-image-charizard-1-20260510.jpg  ████████░░  78%  [✕]         │ ║
║  │  ✓ Done:     product-image-charizard-0-20260510.jpg  (stored in tmp/ — unsaved)   │ ║
║  ─────────────────────────────────────────────────────────────────────────────────── ║
╠═════════════════════════════════════════════════════════════════════════════════════════╣
║  IMAGE GRID  (24 per page)                                                             ║
║  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐              ║
║  │ [✓]🖼  │  │    🖼  │  │ [✓]🖼  │  │[tmp]🖼 │  │    🖼  │  │    🖼  │              ║
║  │ img-1  │  │ img-2  │  │ img-3  │  │ NEW    │  │ img-5  │  │ img-6  │              ║
║  │ 320px  │  │ 180px  │  │ 240px  │  │ 640px  │  │ 512px  │  │ 96px  │              ║
║  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘              ║
║                                                                 [← Prev] 1/4 [Next →] ║
╠═════════════════════════════════════════════════════════════════════════════════════════╣
║  SELECTION BAR                                                                         ║
║  Selected (2):  [⠿ img-1]  [⠿ img-3]     ← drag handles to reorder                  ║
║  [✕ Clear all]       [🗑 Delete selected]                 [Set img-1 as main image]   ║
╚═════════════════════════════════════════════════════════════════════════════════════════╝

Notes:
  [tmp] badge = uploaded this session; file lives at tmp/{mediaFilename}.
               On form Submit → API moves it to products/{productId}/{mediaFilename}.
               If form is abandoned → tmp/ files auto-deleted after 24 h by Cloud Function.
  ⠿ drag handle = reorder the selected set (determines image order on the product page).
  Hover/right-click tile: [★ Set as main]  [🗑 Delete]  [📋 Copy URL]  [🔍 Full-size]
  Tile checkboxes appear on hover (desktop) or are always visible (touch).
```

---

## UX > PreviewPane — In-Panel Item Preview ⏳

Triggered by [👁 Preview] in FormShell top bar (any step) or StepForm step 5. Replaces the panel body with a live render of the item using current draft form values.

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║ STICKY TOP BAR  (same shell, new label)                                                  ║
║  [← Back to Edit]      PREVIEW — Charizard ETB  (DRAFT)        [Open in new tab ↗]     ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ 👁  DRAFT PREVIEW — not visible to buyers until published.                        │  ║
║  │     tmp/ images are visible only to you. Buy / Cart / Bid actions are disabled.  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                          ║
║  [Full render of the public-facing view, using current form values]                     ║
║  ┌ ProductDetailPageView ─────────────────────────────────────────────────────────────┐  ║
║  │  [Gallery: draft images]   Charizard Base Set ETB — Sealed                        │  ║
║  │                            ₹4,499  ~~₹5,000~~  [SALE]                             │  ║
║  │                            Trading Cards · Pokémon Company                        │  ║
║  │                            [Add to Cart — disabled]  [♡ Wishlist — disabled]     │  ║
║  │                            ┌── Sold by ──────────────────────────────────────┐   │  ║
║  │                            │  CardGame Hub            [Visit Store →]        │   │  ║
║  │                            └────────────────────────────────────────────────┘   │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ STICKY BOTTOM BAR                                                                        ║
║  [← Back to Edit]                                    [Save Draft]  [Publish Now ✓]     ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

Implementation:
  Inline mode (preferred): pass form values as React props to the detail view component.
  Interactive elements (Buy/Cart/Bid/Reserve) receive disabled prop → greyed out + tooltip.
  Open in new tab: POST draft to /api/preview → returns short-lived token → opens
    /preview?token={token} page which renders the item in full public layout.
```

---

## UX > Form Assignment Reference

Which shell to use for every collection:

```
Collection / Action    Create               Edit (existing)      Quick action
───────────────────────────────────────────────────────────────────────────────────
Standard Product       StepForm (5 steps)   FormShell + left nav  Status, Price, Stock
Auction                StepForm (6 steps*)  FormShell + left nav  Status, End date
Pre-Order              StepForm (6 steps*)  FormShell + left nav  Status, Delivery date
Blog Post              StepForm (3 steps)   FormShell + left nav  Status (publish/draft)
Event                  StepForm (3 steps)   FormShell + left nav  Status
FAQ                    QuickFormDrawer      QuickFormDrawer        Active toggle
Coupon                 QuickFormDrawer      QuickFormDrawer        Active toggle, Value
Brand (admin)          FormShell + left nav FormShell + left nav  —
Category (admin)       FormShell + left nav FormShell + left nav  —
Store Profile          FormShell + left nav FormShell + left nav  —
User Profile           FormShell + left nav FormShell + left nav  Avatar, Display name
Address (user/store)   QuickFormDrawer      QuickFormDrawer        Default toggle
Nav Item               QuickFormDrawer      QuickFormDrawer        —
Carousel Slide         FormShell + left nav FormShell + left nav  Active toggle
Site Settings          FormShell (12 sects) FormShell (12 sects)  —
Order (admin)          —                    FormShell + left nav  Status update
Review (admin)         —                    QuickFormDrawer        Approve/Reject

* 6 steps = 5 standard steps + type-specific settings step inserted as step 3

LISTING TYPE SELECTOR (Seller product create button):
  [+ New Product ▾]
    ├─ Standard Product  → StepForm (5 steps)
    ├─ Auction           → StepForm (6 steps, with Auction Settings)
    └─ Pre-Order         → StepForm (6 steps, with Pre-Order Settings)
```

---

## UX > InlineSelectCreate — Searchable Dropdown + Inline Quick-Create ⏳

Every "select existing OR create new" field uses this pattern. A searchable combobox where the last option is always [+ Create "typed text"]. Selecting that opens a `QuickFormDrawer` scoped to that resource. After save, the new item auto-selects in the dropdown.

```
SEARCHABLE DROPDOWN — Open state:

  Brand *   [Pok___________________________ ▾]  ← user typed "Pok"
            ┌──────────────────────────────────┐
            │ 🔍 Pok                           │
            │ ──────────────────────────────── │
            │  Pokémon Company    (brand-poke…) │
            │  Pokémon USA        (brand-poke…) │  ← matching results
            │ ──────────────────────────────── │
            │  [+ Create "Pok"]               │  ← always last, triggers QuickFormDrawer
            └──────────────────────────────────┘

INLINE CREATION FLOW (UX9):

  1. User types "Kotobukiya" in Brand field → no match found
  2. User clicks [+ Create "Kotobukiya"]
  3. QuickFormDrawer opens (on top of FormShell):
     ┌──── Quick: New Brand ────────────────────┐
     │ ✕  Create Brand                          │
     ├──────────────────────────────────────────┤
     │  Name *    [Kotobukiya______________]    │
     │  Slug      [brand-kotobukiya________]    │
     │  Country   [Japan___________________]    │
     │  Website   [kotobukiya.co.jp_______]     │
     ├──────────────────────────────────────────┤
     │       [Cancel]      [Create Brand →]     │
     └──────────────────────────────────────────┘
  4. User fills name → clicks [Create Brand →]
  5. Brand saved to Firestore → QuickFormDrawer closes
  6. "Kotobukiya" auto-selected in Brand dropdown → form continues

WHERE THIS PATTERN APPLIES (all alpha forms):

Field                    Host Form            Create opens…
─────────────────────────────────────────────────────────────────────────
Category *               Product create/edit  Category QuickForm
                                              (name, parent, slug-auto)
Subcategory              Product create/edit  Category QuickForm
                                              (parent auto-set to selected category)
Brand                    Product create/edit  Brand QuickForm
                                              (name, country, website)
Delivery Address *       Checkout             Address QuickForm
                                              (label, name, phone, line1, city, state, pin)
Pickup Address           Product shipping     Store Address QuickForm
                                              (label, name, phone, line1, city)
Checkout Address         Checkout flow        Address QuickForm (same as above)
Profile Address          User profile         Address QuickForm (same as above)
Parent Category          Admin category edit  Category QuickForm (parent only)
Coupon (checkout)        Checkout / cart      Coupon QuickForm (code, type, value, expiry)
                                              — admin/store only, not public buyers

NON-DRAWER INLINE ADDS (no QuickFormDrawer needed — simpler):
  Tags               — multi-select chip input: type tag name → press Enter or [+ Add]
                       saves inline without drawer (tag is a plain string)
  Product Features   — bulleted list: [+ Add feature] → text input inline → Enter saves
  Specifications     — key-value rows: [+ Add spec] → [key____] [value____] [unit] → saves
  Custom field keys  — same as specs pattern

COMPONENT API (appkit/src/ui/components/InlineSelectCreate.tsx — extends H1):
  <InlineSelectCreate
    label="Brand"
    value={selectedBrand}
    onChange={setSelectedBrand}
    options={brands}          // { value, label } array
    onSearch={searchBrands}   // async search fn
    createLabel="Brand"       // → "+ Create {typed}"
    createForm={<BrandQuickForm />}  // QuickFormDrawer content
    onCreate={handleBrandCreate}     // called after QuickFormDrawer save
  />
```

---

# ADMIN AREA

## Admin > Layout Shell

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  LetiTrip Admin   [🔔 notif]  [👤 Admin Name ▾]                              │
├──────────┬─────────────────────────────────────────────────────────────────  │
│ SIDEBAR  │  MAIN CONTENT AREA                                                 │
│          │                                                                    │
│ ▸ Dashboard       Breadcrumb: Admin › Current Page                            │
│ ▸ Products                                                                    │
│ ▸ Auctions        [Page Header + Action Buttons]                              │
│ ▸ Pre-Orders                                                                  │
│ ▸ Brands          [Content]                                                   │
│ ▸ Categories                                                                  │
│ ─────────                                                                     │
│ ▸ Orders                                                                      │
│ ▸ Reviews                                                                     │
│ ▸ Bids                                                                        │
│ ─────────                                                                     │
│ ▸ Stores                                                                      │
│ ▸ Users                                                                       │
│ ▸ Coupons                                                                     │
│ ▸ Payouts                                                                     │
│ ─────────                                                                     │
│ ▸ Blog                                                                        │
│ ▸ Events                                                                      │
│ ▸ FAQs                                                                        │
│ ▸ Carousel                                                                    │
│ ▸ Sections                                                                    │
│ ▸ Ads                                                                         │
│ ▸ Navigation                                                                  │
│ ─────────                                                                     │
│ ▸ Analytics                                                                   │
│ ▸ Payouts                                                                     │
│ ▸ Media                                                                       │
│ ─────────                                                                     │
│ ▸ Site Settings                                                                │
│ ▸ Feature Flags                                                                │
│ ▸ Seed & Docs                                                                  │
└──────────┴─────────────────────────────────────────────────────────────────  ┘
```

---

## Admin > Dashboard ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Dashboard                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Revenue  │  │ Orders   │  │ Users    │  │ Products │  │ Reviews  │     │
│  │ ₹X,XX,XXX│  │ 35 total │  │ 15 total │  │ 100+     │  │ pending  │     │
│  │ all time │  │ 5 pending│  │ +3 new   │  │ listed   │  │ 12 items │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Quick Actions                                                               │
│  [+ New Product]  [+ New Coupon]  [+ New Blog Post]  [View Pending Orders]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Recent Activity  (placeholder — VA19 will wire real data)                  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Products List ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Products                                              [+ New Product]       │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search products...]  [Status ▾]  [Type ▾]  [Store ▾]  [Sort ▾]        │
├─────────────────────────────────────────────────────────────────────────────┤
│  [☐] Thumbnail  Title           Type       Store         Price   Status  ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  [☐] 🖼          Charizard ETB   Standard   CardGame Hub  ₹4,499  Published ⋮│
│                                                          [Featured][Promo]  │
│  [☐] 🖼          Exodia PSA8     Auction    CardGame Hub  ₹49,999 Live     ⋮ │
│  [☐] 🖼          DBZ Goku PO     Pre-Order  Tokyo Toys    ₹3,499  Active   ⋮ │
│  [☐] 🖼          Hot Wheels RLC  Standard   Diecast Garage₹3,999  Draft    ⋮ │
├─────────────────────────────────────────────────────────────────────────────┤
│  Bulk: [☐ Select All]  [Delete Selected]  [Toggle Featured]  [Unpublish]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ← Prev   Page 1 of 5   Next →                              [10 ▾] per page │
└─────────────────────────────────────────────────────────────────────────────┘

Row ⋮ menu:
  ├─ Edit → /admin/products/[id]/edit
  ├─ Duplicate
  ├─ Toggle Featured
  ├─ Toggle Promoted
  └─ Delete (ConfirmDeleteModal)
```

---

## Admin > Product Editor ✅ (3-mode: standard / auction / pre-order)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  New Product / Edit Product                                [Cancel] [Save]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Type: ( ) Standard  (•) Auction  ( ) Pre-Order                             │
├───────────────────────┬─────────────────────────────────────────────────────┤
│  BASIC INFO           │  MEDIA                                               │
│  Title [input]        │  Images (up to 10) [MediaUploadField]               │
│  Slug  [input]        │  YouTube URL [input]                                 │
│  Description          │                                                     │
│  [RichTextEditor]     │  PRICING                                             │
│                       │  Price (₹) [input]   On Sale [tog]                  │
│  Store  [DynSelect]   │  Sale Price [input — shown if isOnSale]             │
│  Brand  [DynSelect]   │  Condition [sel: new/used/sealed]                   │
│  Category[DynSelect]  │  Stock Qty [input]                                  │
├───────────────────────┤                                                     │
│  FLAGS                │  AUCTION FIELDS (shown if type=auction)             │
│  Featured    [tog]    │  Starting Bid (₹) [input]                           │
│  Promoted    [tog]    │  Reserve Price (₹) [input]                          │
│  New Arrival [tog]    │  Bid Increment (₹) [input]                          │
│  On Sale     [tog]    │  Start Date [input]   End Date [input]              │
│  Is Sold     [tog]    │                                                     │
│                       │  PRE-ORDER FIELDS (shown if type=preorder)          │
│  CUSTOM FIELDS (⏳L1) │  Deposit % [input]                                  │
│  + Add field          │  Est. Delivery [input]                              │
│  [key][type][value]   │  Production Status [sel]                            │
│                       │  Max Quantity [input]                               │
│  CUSTOM SECTIONS (⏳L2│                                                     │
│  + Add section        │                                                     │
│  [title][rich text]   │                                                     │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

---

## Admin > Coupons List ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Coupons                                                   [+ New Coupon]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search coupons...]   [Type ▾]   [Status ▾]   [Sort ▾]                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Code          Name          Type          Discount   Uses      Status   ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  WELCOME10     Welcome 10%   percentage    10%        234/∞     Active   ⋮  │
│  FREESHIP999   Free Shipping free_shipping —          89/500    Active   ⋮  │
│  POKEMON25     Pokémon 25%   percentage    25%        12/100    Active   ⋮  │
│  VIP2026       VIP 2026      fixed         ₹500       500/500   Exhausted⋮  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ← Prev   Page 1 of 2   Next →                              [10 ▾] per page │
└─────────────────────────────────────────────────────────────────────────────┘

Row ⋮ menu:
  ├─ Edit → /admin/coupons/[id]/edit
  └─ Delete (ConfirmDeleteModal)
```

---

## Admin > Coupon Editor ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  New Coupon / Edit Coupon                              [Cancel] [Save Coupon]│
├────────────────────────────┬────────────────────────────────────────────────┤
│  Code      [input]         │  DISCOUNT                                      │
│  Name      [input]         │  Type [sel: percentage/fixed/free_shipping/    │
│  Description [textarea]    │         buy_x_get_y]                           │
│                            │  Value [input — % or ₹]                        │
│  SCOPE                     │  Max Discount ₹ [input — shown for percentage] │
│  Scope [sel: admin/seller] │  Min Purchase ₹ [input]                        │
│  Seller [DynSelect — if    │                                                │
│    scope=seller]           │  Buy Qty [input — shown for buy_x_get_y]       │
│                            │  Get Qty [input — shown for buy_x_get_y]       │
│  USAGE LIMITS              │                                                │
│  Total Limit   [input]     │  VALIDITY                                      │
│  Per User Limit[input]     │  Start Date [input]                            │
│  Current Usage [read-only] │  End Date   [input]                            │
│                            │  Is Active  [tog]                              │
│  RESTRICTIONS              │                                                │
│  First-time users only[chk]│                                                │
│  Combine w/ seller coupons │                                                │
│    [chk]                   │                                                │
│  Applies to auctions [chk] │                                                │
└────────────────────────────┴────────────────────────────────────────────────┘
```

---

## Admin > Blog List ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Blog Posts                                              [+ New Blog Post]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search posts...]   [Category ▾]   [Status ▾]   [Sort ▾]               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Cover   Title                    Category    Status    Views  Published  ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  🖼       How to Grade Pokémon     TCG         Published 1,234  2026-05-01 ⋮ │
│  🖼       Top 10 Hot Wheels 2026   Diecast     Published 856    2026-04-15 ⋮ │
│  🖼       Beyblade X Guide         Spinning    Draft     —      —          ⋮ │
├─────────────────────────────────────────────────────────────────────────────┤
│  ← Prev   Page 1 of 3   Next →                              [10 ▾] per page │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Blog Editor ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  New Blog Post / Edit Blog Post                        [Cancel] [Save Post]  │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  Title       [input]          │  Cover Image [MediaUploadField]             │
│  Slug        [input auto]     │  YouTube ID  [input optional]               │
│  Excerpt     [textarea]       │                                             │
│  Category    [sel]            │  Status [sel: draft/published]              │
│  Tags        [TagInput]       │  Is Featured         [tog]                  │
│  Author      [DynSelect]      │  Read Time (mins)    [read-only auto-calc]  │
│                               │  Published At        [input date]           │
│  Content [RichTextEditor — full width, below]                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ B I U  H1 H2  — •  🔗  🖼  ▶  Code  Quote  ...                    │   │
│  │                                                                     │   │
│  │  Write your article here...                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## Admin > FAQs List ✅ (VA5 — dedicated routes: /admin/faqs + /new + /[id]/edit)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FAQs                                                      [+ New FAQ]       │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search FAQs...]   [Category ▾]   [Status ▾]   [Sort ▾]                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Question                      Category    Homepage  Priority  Active   ⋮   │
│  ────────────────────────────────────────────────────────────────────────── │
│  How does bidding work?        Auctions    ✓         1         Active   ⋮   │
│  What payment methods?         Payments    ✗         2         Active   ⋮   │
│  Can I return an item?         Returns     ✓         3         Active   ⋮   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ← Prev   Page 1 of 3   Next →                              [10 ▾] per page │
└─────────────────────────────────────────────────────────────────────────────┘

  [+ New FAQ] → /admin/faqs/new (AdminFaqEditorView, create mode)
  Row click   → /admin/faqs/[id]/edit (AdminFaqEditorView, edit mode)
  Row ⋮: Edit (→ edit page) | Delete (ConfirmDeleteModal)
```

---

## Admin > FAQ Editor ✅ (A5/VA5 — SideDrawer-equivalent, dedicated page)

```
Page: /admin/faqs/new  or  /admin/faqs/[id]/edit
┌─────────────────────────────────────────────────────────────────────────────┐
│  New FAQ  /  Edit FAQ                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Question *         [input — required]                                       │
│  Slug               [input — auto-generated from question, must start faq-] │
│  Answer *           [RichTextEditor — required, min 200px]                  │
│  Category           [sel: Shipping / Returns / Payments / Auctions /        │
│                           Pre-orders / General]                              │
│  Tags               [TagInput — comma-separated keywords]                   │
│  Display Order      [number input]                                           │
│  Priority           [number input]                                           │
│  ┌─ Visibility ─────────────────────────────────────────────────────────┐   │
│  │  Active         [toggle]   Pinned          [toggle]                   │   │
│  │  Show Homepage  [toggle]   Show in Footer  [toggle]                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Delete FAQ]                              [Cancel]  [Save FAQ]              │
└─────────────────────────────────────────────────────────────────────────────┘

  POST /api/admin/faqs         (create)
  PATCH /api/admin/faqs/[id]   (update)
  DELETE /api/admin/faqs/[id]  (delete — ConfirmDeleteModal before)
```

---

## Admin > Brands List ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Brands                                                    [+ New Brand]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search brands...]   [Status ▾]   [Sort ▾]                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Logo   Name              Country   Founded   Products   Active   ⋮         │
│  ────────────────────────────────────────────────────────────────────────── │
│  🖼      Bandai            Japan     1950      47         ✓        ⋮         │
│  🖼      Hasbro            USA       1923      32         ✓        ⋮         │
│  🖼      Takara-Tomy       Japan     1955      28         ✓        ⋮         │
│  🖼      Pokémon Company   Japan     1998      61         ✓        ⋮         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Brand Editor ✅ (X3 — responsive 2-col grid)

```
StackedViewShell (full page):
┌─────────────────────────────────────────────────────────┐
│  New Brand / Edit Brand                                  │
├──────────────────────┬──────────────────────────────────┤
│  Name   [input]      │  Slug  [input auto-generated]    │  ← sm:grid-cols-2
├──────────────────────┴──────────────────────────────────┤
│  Description  [input full-width]                         │
├──────────────────────┬──────────────────────────────────┤
│  Logo  [ImageUpload] │  Banner  [ImageUpload]            │  ← sm:grid-cols-2
│  filename: brand-{name}-logo.webp                        │
├──────────────────────┬──────────────────────────────────┤
│  Website URL [input] │  Display Order  [input number]   │  ← sm:grid-cols-2
├──────────────────────┴──────────────────────────────────┤
│  Active  [toggle]                                        │
├─────────────────────────────────────────────────────────┤
│  [Save brand / Create brand]   [Delete brand] (edit)    │
└─────────────────────────────────────────────────────────┘
  onUpload logo  → upload(file,"brands",true,{type:"brand-logo",brand:name})
  onUpload banner→ upload(file,"brands",true,{type:"brand-banner",brand:name})
```

---

## Admin > Categories List ✅ (RC4 — dedicated routes)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Categories                                              [+ New Category]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search categories...]   [Tier ▾]   [Parent ▾]   [Sort ▾]              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Icon   Name                  Tier   Parent           Featured   Active  ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  🎯     Action Figures        1      —                ✓          ✓       ⋮  │
│  🎯      ↳ Anime Figures      2      Action Figures   ✓          ✓       ⋮  │
│  🎯      ↳ Superhero Figures  2      Action Figures   ✗          ✓       ⋮  │
│  🃏     Trading Cards         1      —                ✓          ✓       ⋮  │
│  🃏      ↳ Pokémon Cards      2      Trading Cards    ✓          ✓       ⋮  │
└─────────────────────────────────────────────────────────────────────────────┘

  Routes (RC4 dedicated page pattern, not SideDrawer):
    List:   GET  /admin/categories           → AdminCategoriesView
    New:    GET  /admin/categories/new        → AdminCategoryEditorView (page)
    Edit:   GET  /admin/categories/[id]/edit  → AdminCategoryEditorView (page)

  Row click → navigate to /admin/categories/[id]/edit (not a modal)
  [+ New Category] → navigate to /admin/categories/new

  Row ⋮ → RowActionMenu:
    [Edit]    → /admin/categories/[id]/edit
    [Delete]  → ConfirmDeleteModal
```

---

## Admin > Category Editor ✅ (X3 — responsive 2-col, dark mode labels)

```
StackedViewShell (full page):
┌─────────────────────────────────────────────────────────┐
│  New Category / Edit Category                            │
├──────────────────────┬──────────────────────────────────┤
│  Name   [input]      │  Slug  [input auto-generated]    │  ← sm:grid-cols-2
├──────────────────────┴──────────────────────────────────┤
│  Description  [input full-width]                         │
├─────────────────────────────────────────────────────────┤
│  Parent category  [InlineCreateSelect optional]          │
│  label: dark:text-zinc-300; helper p: dark:text-neutral-400
├─────────────────────────────────────────────────────────┤
│  Display Order  [input number]                           │
│  Active        [toggle]                                  │
│  Show in menu  [toggle]                                  │
├─────────────────────────────────────────────────────────┤
│  [Save category / Create category]  [Delete] (edit)     │
└─────────────────────────────────────────────────────────┘
```

---

## Admin > Carousel List ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Carousel Slides                                         [+ New Slide]       │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search slides...]   [Status ▾]   [Sort by order ▾]                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⠿  Preview   Title              Order   Bg Type   Cards   Active   ⋮       │
│  ────────────────────────────────────────────────────────────────────────── │
│  ⠿  🖼         Hero Homepage      1       image      3       ✓        ⋮       │
│  ⠿  🖼         Pokémon Sale       2       gradient   2       ✓        ⋮       │
│  ⠿  🖼         Hot Wheels New     3       image      4       ✓        ⋮       │
│  ⠿  🖼         Beyblade X Launch  4       video      2       ✓        ⋮       │
│  ⠿  🖼         Inactive Slide     5       color      1       ✗        ⋮       │
│                                          (MAX 5 active slides)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Carousel Editor ✅

```
Dedicated page /admin/carousel/new or /admin/carousel/[id]/edit:
┌─────────────────────────────────────────────────────────────────────────────┐
│  New Slide / Edit Slide                              [Cancel] [Save Slide]   │
├──────────────────────┬──────────────────────────────────────────────────────┤
│  SLIDE SETTINGS      │  BACKGROUND                                          │
│  Title [input]       │  Type [sel: image/video/color/gradient]              │
│  Order [input]       │  URL (desktop) [MediaUploadField]                    │
│  Active [tog]        │  URL (mobile)  [MediaUploadField]                    │
│  Height [sel]        │  Dim overlay % [slider 0–100]                        │
│  Autoplay ms [input] │                                                      │
│                      │  CARDS (up to 6)                                     │
│                      │  Card 1: title/subtitle/price/href/image/badge       │
│                      │  Card 2: ...                                         │
│                      │  [+ Add Card]                                        │
│                      │  [Live Preview ▶]                                    │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

---

## Admin > Homepage Sections ✅ (I3 — seed reset button added)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Homepage Sections              [Reset seed data]  [Manage Sections]         │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search sections...]   [Type ▾]   [Enabled ▾]   [Sort by order ▾]       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⠿  Type              Label              Order   Enabled   ⋮                │
│  ────────────────────────────────────────────────────────────────────────── │
│  ⠿  carousel          Hero Carousel      1       ✓         ⋮                │
│  ⠿  stats             Platform Stats     2       ✓         ⋮                │
│  ⠿  categories        Browse Categories  3       ✓         ⋮                │
│  ⠿  products          Featured Products  4       ✓         ⋮                │
│  ⠿  auctions          Live Auctions      5       ✓         ⋮                │
│  ⠿  brands            Top Brands         6       ✓         ⋮                │
│  ⠿  reviews           Customer Reviews   7       ✓         ⋮                │
│  ⠿  blog-articles     From the Blog      8       ✓         ⋮                │
│  ⠿  faq               Common Questions   9       ✓         ⋮                │
│  ⠿  events            Upcoming Events    10      ✓         ⋮                │
│  ⠿  stores            Featured Stores    11      ✓         ⋮                │
│  ⠿  social-feed       Social Feed        12      ✗         ⋮                │
│  ⠿  google-reviews    Google Reviews     13      ✓         ⋮                │
│  ⠿  custom-cards      Custom Cards       14      ✓         ⋮                │
│  ⠿  newsletter        Newsletter Sign-up 15      ✓         ⋮                │
│  ⠿  pre-orders        Pre-Orders         16      ✓         ⋮                │
│  ⠿  banner            Promo Banner       17      ✓         ⋮                │
│  ⠿  trust-indicators  Trust Indicators   18      ✓         ⋮                │
│  ⠿  whatsapp-community WhatsApp CTA      19      ✓         ⋮                │

  Row ⋮: Edit (Modal with type-specific builder form) | Enable/Disable | Delete

  [Reset seed data] → ConfirmDeleteModal (0 field, danger):
  ┌─────────────────────────────────────────────────────┐
  │  Reset homepage sections seed data?             [✕] │
  ├─────────────────────────────────────────────────────┤
  │  This will reload the 19 default homepage sections  │
  │  from seed data. Any manual changes made in         │
  │  Firestore will be overwritten.                     │
  ├─────────────────────────────────────────────────────┤
  │                         [Cancel]  [Reset seed]      │
  └─────────────────────────────────────────────────────┘
  → POST /api/demo/seed { action:"load", collections:["homepageSections"] }
  → invalidates sections listing query on success

  [Manage Sections] → Modal: create or edit a section (type selector + typed builder
                             or raw JSON config, order, enabled toggle)

  Reorder panel (below table): drag-and-drop rows, manual order# input,
  Up/Down buttons, [Reindex 1..N] [Undo unsaved] [Reset to server] [Save order]
```

---

## Admin > Homepage Section Editor — Shared Modal Shell

```
┌──────────────────────────────────────────────────────────────────────┐
│  Edit Homepage Section                                           [✕] │
├──────────────────────────────────────────────────────────────────────┤
│  Section Type                                                        │
│  ┌────────────────────────────────────────────────┐                 │
│  │ products                                     ▾ │                 │
│  └────────────────────────────────────────────────┘                 │
│  ☑ Enabled                                                          │
│  Display Order                                                       │
│  ┌────────┐                                                          │
│  │  7     │                                                          │
│  └────────┘                                                          │
│  ──────────────── TYPE-SPECIFIC FIELDS ─────────────────────────── │
│  [see per-type diagrams below]                                       │
│  ──────────────────── JSON PREVIEW ──────────────────────────────── │
│  Config JSON (auto-generated — edit only to override)               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ {                                                              │ │
│  │   "title": "Featured Collectibles",                            │ │
│  │   ...                                                          │ │
│  │ }                                                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│  [Cancel]                                          [Save Section]   │
└──────────────────────────────────────────────────────────────────────┘

  → POST /api/admin/sections   (create)
  → PATCH /api/admin/sections/[id]   (edit)
```

---

## Admin > Section Editor — welcome

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Welcome Section ─────────────────────────────────────────────── │
│                                                                      │
│  H1 Heading                                                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ India's #1 Collectibles Marketplace                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle                                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Buy, Sell & Auction with Verified Sellers                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Description                                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Discover Pokémon TCG cards, Hot Wheels diecast, Beyblade X     │ │
│  │ tops, anime figures and Gunpla kits from verified sellers...   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ☑ Show CTA button                                                  │
│  CTA Label                          CTA Link                        │
│  ┌───────────────────────┐          ┌───────────────────────┐       │
│  │ Shop Now              │          │ /products             │       │
│  └───────────────────────┘          └───────────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘
  Note: trust chips (Fast Delivery / Secure Payments / 4.8+ Rated /
  Easy Returns) and pill label are hardcoded in the component.
```

---

## Admin > Section Editor — carousel

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Carousel Section ────────────────────────────────────────────── │
│                                                                      │
│  Internal Title (optional)                                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Hero Carousel                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Default Slide Height                                                │
│  ◯ viewport  (min-h-screen — full browser height)                   │
│  ◉ tall      (min-h-[80vh] — 80 % of viewport)                      │
│  ◯ medium    (min-h-[60vh] — 60 % of viewport)                      │
│                                                                      │
│  Default Autoplay Delay (ms)                                         │
│  ┌────────┐                                                          │
│  │  5000  │                                                          │
│  └────────┘                                                          │
│  ☑ Pause on hover                                                   │
│  ☑ Show dot indicators                                              │
│  ☑ Show prev / next arrows                                          │
└──────────────────────────────────────────────────────────────────────┘
  Individual slides (background, overlay text, zone cards) are
  managed separately under Admin > Carousel.
```

---

## Admin > Section Editor — stats

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Stats Section ───────────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ LetItRip by the Numbers                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Stat 1 ──────────────────────────────────────────────────────┐ │
│  │  Key          Label                    Value                   │ │
│  │  ┌──────────┐ ┌───────────────────┐   ┌──────────┐            │ │
│  │  │ products │ │ Listings          │   │ 5,000+   │            │ │
│  │  └──────────┘ └───────────────────┘   └──────────┘            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Stat 2 ──────────────────────────────────────────────────────┐ │
│  │  Key          Label                    Value                   │ │
│  │  ┌──────────┐ ┌───────────────────┐   ┌──────────┐            │ │
│  │  │ sellers  │ │ Verified Sellers  │   │ 200+     │            │ │
│  │  └──────────┘ └───────────────────┘   └──────────┘            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Stat 3 ──────────────────────────────────────────────────────┐ │
│  │  ┌──────────┐ ┌───────────────────┐   ┌──────────┐            │ │
│  │  │ buyers   │ │ Happy Buyers      │   │ 12,000+  │            │ │
│  │  └──────────┘ └───────────────────┘   └──────────┘            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Stat 4 ──────────────────────────────────────────────────────┐ │
│  │  ┌──────────┐ ┌───────────────────┐   ┌──────────┐            │ │
│  │  │ rating   │ │ Platform Rating   │   │ 4.8★     │            │ │
│  │  └──────────┘ └───────────────────┘   └──────────┘            │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — trust-indicators

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Trust Indicators Section ────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Why Collectors Trust LetItRip                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Indicator 1 ─────────────────────────────────────────────────┐ │
│  │  ID                          Icon (name or emoji)              │ │
│  │  ┌───────────────────────┐   ┌───────────────────────┐         │ │
│  │  │ trust-verified        │   │ shield-check          │         │ │
│  │  └───────────────────────┘   └───────────────────────┘         │ │
│  │  Title                                                          │ │
│  │  ┌────────────────────────────────────────────────────────┐    │ │
│  │  │ Verified Sellers                                       │    │ │
│  │  └────────────────────────────────────────────────────────┘    │ │
│  │  Description                                                    │ │
│  │  ┌────────────────────────────────────────────────────────┐    │ │
│  │  │ Every seller is manually verified. Listings reviewed   │    │ │
│  │  │ for authenticity before going live.                    │    │ │
│  │  └────────────────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Indicator 2 ─────────────────────────────────────────────────┐ │
│  │  ID: trust-escrow   Icon: lock   Title: Escrow Payment         │ │
│  │  Description: [textarea]                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Indicator 3 ─────────────────────────────────────────────────┐ │
│  │  ID: trust-returns   Icon: arrow-path   Title: Easy Returns    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Indicator 4 ─────────────────────────────────────────────────┐ │
│  │  ID: trust-authentic   Icon: badge-check   Title: Authenticity │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — categories

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Categories Section ──────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Shop by Category                                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Categories to Show                                              │
│  ┌────────┐                                                          │
│  │  4     │                                                          │
│  └────────┘                                                          │
│  ☐ Auto-scroll                                                      │
│  Scroll Interval (ms)  ← active when auto-scroll is on              │
│  ┌────────┐                                                          │
│  │  4000  │                                                          │
│  └────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
  Categories fetched from Firestore. Use isFeatured / showOnHomepage
  flags on category documents to control which ones appear here.
```

---

## Admin > Section Editor — brands

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Brands Section ──────────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Top Collectibles Brands                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Authentic products from the world's leading manufacturers      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Brands to Show                                                  │
│  ┌────────┐                                                          │
│  │  13    │                                                          │
│  └────────┘                                                          │
│  ☑ Auto-scroll                                                      │
│  Scroll Interval (ms)                                                │
│  ┌────────┐                                                          │
│  │  3000  │                                                          │
│  └────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
  Brands fetched from Firestore ordered by displayOrder ascending.
```

---

## Admin > Section Editor — products

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Products Section ────────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Featured Collectibles                                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Hand-picked by our team — fresh stock, verified authentic      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Products (1–50)     Max Items to Show                           │
│  ┌────────┐              ◉ 5   ◯ 10   ◯ 20                          │
│  │  18    │                                                          │
│  └────────┘                                                          │
│  Status Filter                                                       │
│  ◉ All   ◯ Published   ◯ Draft                                       │
│                                                                      │
│  Sort By                                                             │
│  ◉ Latest   ◯ Oldest   ◯ Price: Low→High   ◯ Price: High→Low        │
│  ◯ Featured   ◯ On Sale   ◯ Popular                                  │
│                                                                      │
│  Filter by Category Slug                                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ category-pokemon-cards                                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ☐ Featured products only                                           │
│  ☐ In-stock only                                                    │
│  ☐ Loop carousel                                                    │
│                                                                      │
│  Resource Mode                                                       │
│  ◉ Automatic (by filters above)                                      │
│  ◯ Manual — enter product IDs                                        │
│                                                                      │
│  Category Filter Checkboxes (fetched from Firestore)                 │
│  ☑ Action Figures      ☐ Trading Cards     ☑ Diecast Vehicles       │
│  ☐ Spinning Tops       ☑ Model Kits        ☐ Vintage & Rare         │
│                                                                      │
│  Manual Product IDs  ↳ shown only when Resource Mode = Manual        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ product-charizard-etb, product-hot-wheels-rlc-nissan,          │ │
│  │ product-beyblade-x-bx01                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ☐ Auto-scroll                                                      │
│  Scroll Interval (ms)                                                │
│  ┌────────┐                                                          │
│  │  5000  │                                                          │
│  └────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — pre-orders

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Pre-Orders Section ──────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Reserve Before It Ships                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Secure upcoming releases with a deposit                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Items (1–50)        Max Items to Show                           │
│  ┌────────┐              ◉ 5   ◯ 10   ◯ 20                          │
│  │  18    │                                                          │
│  └────────┘                                                          │
│  Status Filter                                                       │
│  ◉ All   ◯ Active   ◯ Upcoming   ◯ Closed                           │
│                                                                      │
│  Sort By                                                             │
│  ◉ Latest   ◯ Oldest   ◯ Price: Low→High   ◯ Price: High→Low        │
│  ◯ Featured   ◯ On Sale   ◯ Popular                                  │
│                                                                      │
│  Filter by Category Slug                                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ category-pokemon-cards                                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ☐ Loop carousel                                                    │
│                                                                      │
│  Resource Mode                                                       │
│  ◉ Automatic (by filters above)                                      │
│  ◯ Manual — enter pre-order IDs                                      │
│                                                                      │
│  Category Filter Checkboxes                                          │
│  ☑ Action Figures   ☐ Trading Cards   ☐ Diecast   ☑ Model Kits     │
│                                                                      │
│  Manual Pre-Order IDs  ↳ shown only when Resource Mode = Manual      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ preorder-pokemon-sv5-booster-box, preorder-dbz-goku-ultra-ego  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ☐ Auto-scroll                                                      │
│  Scroll Interval (ms)                                                │
│  ┌────────┐                                                          │
│  │  5000  │                                                          │
│  └────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — auctions

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Auctions Section ────────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Live Auctions                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Bid on rare collectibles — auctions ending soon                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Auctions (1–50)     Max Items to Show                           │
│  ┌────────┐              ◉ 5   ◯ 10   ◯ 20                          │
│  │  18    │                                                          │
│  └────────┘                                                          │
│  Status Filter                                                       │
│  ◉ All   ◯ Active   ◯ Scheduled   ◯ Ended                           │
│                                                                      │
│  Sort By                                                             │
│  ◉ Latest   ◯ Oldest   ◯ Price: Low→High   ◯ Price: High→Low        │
│  ◯ Featured   ◯ On Sale   ◯ Popular                                  │
│                                                                      │
│  Filter by Category Slug                                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ category-trading-cards                                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ☐ Loop carousel                                                    │
│                                                                      │
│  Resource Mode                                                       │
│  ◉ Automatic (by filters above)                                      │
│  ◯ Manual — enter auction IDs                                        │
│                                                                      │
│  Category Filter Checkboxes                                          │
│  ☑ Trading Cards   ☐ Action Figures   ☐ Diecast   ☐ Spinning Tops  │
│                                                                      │
│  Manual Auction IDs  ↳ shown only when Resource Mode = Manual        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ auction-pokemon-charizard-psa9, auction-exodia-lob-psa8        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ☐ Auto-scroll                                                      │
│  Scroll Interval (ms)                                                │
│  ┌────────┐                                                          │
│  │  5000  │                                                          │
│  └────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — banner

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Banner Section ──────────────────────────────────────────────── │
│                                                                      │
│  Height                                                              │
│  ◯ sm (200 px)   ◯ md (300 px)   ◉ lg (400 px)   ◯ xl (500 px)     │
│                                                                      │
│  Background Image URL                                                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ https://images.unsplash.com/photo-1551698618...w=1920&h=400    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Background Color (fallback if no image)   Gradient From → To        │
│  ┌──────────────────────┐   ┌──────────────┐  ┌──────────────┐     │
│  │ #1a1a2e              │   │ #0f3460      │  │ #e94560      │     │
│  └──────────────────────┘   └──────────────┘  └──────────────┘     │
│                                                                      │
│  ── Content ─────────────────────────────────────────────────────── │
│  Title                                                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Beyblade X is Here                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Official Takara Tomy Import — BX-01, BX-05, BX-10 and more    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Description (optional)                                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ India's best selection of Beyblade X tops, launchers...        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ── Buttons ─────────────────────────────────────────────────────── │
│  ┌── Button 1 ────────────────────────────────────────────────────┐ │
│  │  Text                         Link                             │ │
│  │  ┌───────────────────────┐    ┌───────────────────────────┐    │ │
│  │  │ Shop Beyblade X       │    │ /categories/category-...  │    │ │
│  │  └───────────────────────┘    └───────────────────────────┘    │ │
│  │  Style: ◉ primary   ◯ secondary   ◯ outline                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌── Button 2 ────────────────────────────────────────────────────┐ │
│  │  Text                         Link                             │ │
│  │  ┌───────────────────────┐    ┌───────────────────────────┐    │ │
│  │  │ Beginner's Guide      │    │ /blog/blog-beyblade-x-... │    │ │
│  │  └───────────────────────┘    └───────────────────────────┘    │ │
│  │  Style: ◯ primary   ◯ secondary   ◉ outline                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  [+ Add Button]                                                      │
│                                                                      │
│  ☐ Make entire banner clickable                                     │
│  Click Link  ↳ shown when clickable is checked                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ /categories/category-beyblade-tops                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — features

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Features / Platform Highlights Section ──────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Everything a Collector Needs                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Pill Label (shown above title)                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Built for trust                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Feature Bullets (one per line)                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Verified authentic listings — every item reviewed before live  │ │
│  │ Escrow payment protection — money held until delivery confirmed│ │
│  │ Graded slab support — PSA, BGS, CGC with certificate verify   │ │
│  │ Live auctions with auto-extend — no last-second sniping       │ │
│  │ Pre-orders with deposit — secure releases with 20-30% down    │ │
│  │ Make-an-offer on any listing — negotiate your price           │ │
│  │ 5-star store review system on every seller                    │ │
│  │ Fast India-wide delivery — 3–7 business days standard         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Learn More Link (optional)                                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ /security                                                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — reviews

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Reviews Section ─────────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ What Collectors Are Saying                                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Reviews          Items per View (desktop)                       │
│  ┌────────┐           ┌────────┐                                     │
│  │  18    │           │  3     │                                     │
│  └────────┘           └────────┘                                     │
│  ☑ Auto-scroll                                                      │
│  Scroll Interval (ms)                                                │
│  ┌────────┐                                                          │
│  │  5000  │                                                          │
│  └────────┘                                                          │
│  Review Source                                                       │
│  ◉ Platform reviews (from Firestore)                                 │
│  ◯ Google Business reviews                                           │
│                                                                      │
│  Google Place ID  ↳ shown only when Source = Google                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ChIJ...                                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — whatsapp-community

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── WhatsApp Community Section ──────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Join the LetItRip Collectors Community                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Description                                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Connect with 4,000+ Indian collectors on WhatsApp. Share       │ │
│  │ pulls, get authentication help, trade advice, and be first     │ │
│  │ to know about new drops.                                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  WhatsApp Group Link                    Member Count                 │
│  ┌───────────────────────────────────┐  ┌────────┐                  │
│  │ https://chat.whatsapp.com/...     │  │  4200  │                  │
│  └───────────────────────────────────┘  └────────┘                  │
│  Benefits (one per line)                                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ First look at rare listings before they go live                │ │
│  │ Authentication help from experienced collectors                │ │
│  │ Live auction alerts for Charizard, Redlines & signed tops      │ │
│  │ Free giveaways and community events                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Button Text                                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Join WhatsApp Community                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Testimonial Quote (optional — shown as pull quote)                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ "The LetItRip WhatsApp group helped me authenticate a PSA slab │ │
│  │  within 10 minutes." — Rahul S., Bengaluru                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — faq

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── FAQ Section ─────────────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Frequently Asked Questions                                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Quick answers about buying, selling, and collecting            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Display Count (how many FAQs to show)                               │
│  ┌────────┐                                                          │
│  │  5     │                                                          │
│  └────────┘                                                          │
│  ☑ Show on homepage  (FAQs also need showOnHomepage:true in DB)     │
│  ☐ Expand all by default                                            │
│  ☑ Show "View all FAQs" link                                        │
│                                                                      │
│  FAQ Categories to include                                           │
│  ☑ General    ☑ Payment    ☑ Shipping                               │
│  ☐ Returns    ☐ Account    ☐ Products    ☐ Sellers                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — blog-articles

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Blog Articles Section ───────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Collector's Corner                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Articles to Show                                                │
│  ┌────────┐                                                          │
│  │  4     │                                                          │
│  └────────┘                                                          │
│  ☑ Show read time                                                   │
│  ☑ Show author name                                                 │
│  ☑ Show cover thumbnails                                            │
└──────────────────────────────────────────────────────────────────────┘
  Articles fetched from Firestore (status=published, publishedAt desc).
```

---

## Admin > Section Editor — newsletter

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Newsletter Section ──────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Get New Drop Alerts                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Description                                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Be first to know about rare Pokémon listings, Hot Wheels STH   │ │
│  │ drops, Beyblade X imports, and LetItRip-exclusive auctions.    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Email Input Placeholder     Subscribe Button Text                   │
│  ┌───────────────────────┐   ┌───────────────────────┐              │
│  │ Enter your email...   │   │ Subscribe             │              │
│  └───────────────────────┘   └───────────────────────┘              │
│  Privacy Notice Text                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ We respect your privacy. Unsubscribe anytime.                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Privacy Policy Link                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ /privacy                                                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
  The actual subscribe action is wired via the newsletterFormSlot
  render prop on the page — this form controls copy only.
```

---

## Admin > Section Editor — stores

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Stores Section ──────────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Top Collectibles Stores                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Browse our verified seller stores                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Stores (1–50)       Max Items to Show                           │
│  ┌────────┐              ◉ 5   ◯ 10   ◯ 20                          │
│  │  5     │                                                          │
│  └────────┘                                                          │
│  Status Filter                                                       │
│  ◉ All   ◯ Active   ◯ Pending   ◯ Suspended                         │
│                                                                      │
│  Sort By                                                             │
│  ◯ Latest   ◉ Popular   ◯ Featured   ◯ Oldest                       │
│                                                                      │
│  ☑ Verified stores only                                             │
│  ☐ Auto-scroll                                                      │
│  Scroll Interval (ms)                                                │
│  ┌────────┐                                                          │
│  │  5000  │                                                          │
│  └────────┘                                                          │
│  Resource Mode                                                       │
│  ◉ Automatic (by filters above)                                      │
│  ◯ Manual — enter store IDs                                          │
│                                                                      │
│  Category Filter Checkboxes                                          │
│  ☐ Action Figures   ☑ Trading Cards   ☐ Diecast   ☑ Spinning Tops  │
│                                                                      │
│  Manual Store IDs  ↳ shown only when Resource Mode = Manual          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ store-mistys-water-cards, store-diecast-garage                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — events

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Events Section ──────────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Tournaments & Community Events                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Sales, polls, and collector meetups — stay in the loop         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Events (1–50)       Max Items to Show                           │
│  ┌────────┐              ◉ 5   ◯ 10   ◯ 20                          │
│  │  6     │                                                          │
│  └────────┘                                                          │
│  Status Filter                                                       │
│  ◉ All   ◯ Active   ◯ Upcoming   ◯ Closed                           │
│                                                                      │
│  Sort By                                                             │
│  ◉ Latest   ◯ Oldest   ◯ Featured   ◯ Popular                       │
│                                                                      │
│  ☐ Featured events only                                             │
│  ☐ Auto-scroll                                                      │
│  Scroll Interval (ms)                                                │
│  ┌────────┐                                                          │
│  │  5000  │                                                          │
│  └────────┘                                                          │
│  Resource Mode                                                       │
│  ◉ Automatic (by filters above)                                      │
│  ◯ Manual — enter event IDs                                          │
│                                                                      │
│  Category Filter Checkboxes                                          │
│  ☑ Tournament   ☑ Convention   ☐ Meetup   ☐ Sale                   │
│                                                                      │
│  Manual Event IDs  ↳ shown only when Resource Mode = Manual          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ event-pokemon-tournament-june, event-summer-holo-sale-2026     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — social-feed

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Social Feed Section ─────────────────────────────────────────── │
│                                                                      │
│  Section Title                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ LetItRip on Instagram                                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Subtitle (optional)                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Follow @letitrip for daily collection showcases                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Platform                                                            │
│  ◉ Instagram   ◯ Facebook   ◯ TikTok   ◯ DeviantArt                │
│                                                                      │
│  Account Handle (no @ prefix)                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ letitrip                                                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Post Type to Show                                                   │
│  ◉ All   ◯ Images only   ◯ Videos only   ◯ Reels only               │
│                                                                      │
│  Number of Posts (4–12)                                              │
│  ┌────────┐                                                          │
│  │  9     │                                                          │
│  └────────┘                                                          │
│  Layout                                                              │
│  ◉ Grid   ◯ Masonry   ◯ Carousel                                    │
│                                                                      │
│  ☑ Show captions                                                    │
│  ☐ Show stats (likes / views / comments)                            │
└──────────────────────────────────────────────────────────────────────┘
  API keys configured under Admin > Site Settings > ⑩ Integrations.
  Section disabled by default until credentials are set.
```

---

## Admin > Section Editor — custom-cards

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Custom Cards Section ────────────────────────────────────────── │
│                                                                      │
│  Section Title (optional)                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Layout                                                              │
│  ◉ Grid   ◯ Row (horizontal scroll)   ◯ Masonry                     │
│                                                                      │
│  Columns  ↳ active when Layout = Grid or Masonry                     │
│  ◯ 1   ◉ 2   ◯ 3   ◯ 4                                             │
│                                                                      │
│  ☐ Auto-scroll  ↳ active when Layout = Row                          │
│  Scroll Interval (ms)                                                │
│  ┌────────┐                                                          │
│  │  4000  │                                                          │
│  └────────┘                                                          │
│                                                                      │
│  ── Cards ───────────────────────────────────────────────────────── │
│  ┌── Card 1 ──────────────────────────────────────────────────────┐ │
│  │  Image URL                                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │ /media/carousel-image-hero-homepage-20260508.jpg          │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │  Image Alt Text                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │ Pokémon Charizard ETB sealed box                         │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │  Eyebrow (small label)    Title                                 │ │
│  │  ┌───────────────────┐    ┌──────────────────────────────────┐ │ │
│  │  │ FEATURED          │    │ Card Title                       │ │ │
│  │  └───────────────────┘    └──────────────────────────────────┘ │ │
│  │  Body Text                                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │ Card body description text                               │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │  Background Color         Text Color                            │ │
│  │  ┌───────────────────┐    ┌───────────────────┐               │ │
│  │  │ #ffffff            │    │ #000000            │               │ │
│  │  └───────────────────┘    └───────────────────┘               │ │
│  │  Corner Radius                                                  │ │
│  │  ◯ none  ◯ sm  ◉ md  ◯ lg  ◯ xl  ◯ full                        │ │
│  │  Shadow                                                         │ │
│  │  ◯ none  ◉ sm  ◯ md  ◯ lg                                       │ │
│  │  ── Button 1 ──────────────────────────────────────────────── │ │
│  │  │ Label            Link           Style                      │ │
│  │  │ ┌────────────┐   ┌───────────┐  ◉primary ◯secondary ◯ghost │ │
│  │  │ │ Shop Now   │   │ /products │                             │ │
│  │  │ └────────────┘   └───────────┘                             │ │
│  │  │ Target: ◉ Same tab  ◯ New tab                              │ │
│  │  ─────────────────────────────────────────────────────────── │ │
│  │  [+ Add Button]                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  [+ Add Card]                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Section Editor — google-reviews

```
┌──────────────────────────────────────────────────────────────────────┐
│  ── Google Reviews Section ──────────────────────────────────────── │
│                                                                      │
│  Google Place ID                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ChIJ...                                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  Max Reviews to Show      Minimum Star Rating (0 = show all)         │
│  ┌────────┐               ◉ 0★  ◯ 3★  ◯ 4★  ◯ 5★ only             │
│  │  6     │                                                          │
│  └────────┘                                                          │
│  Layout                                                              │
│  ◉ Grid   ◯ Carousel                                                │
│                                                                      │
│  ☑ Show star rating on each card                                    │
│  ☑ Show review date                                                 │
│  ☑ Link cards to Google Maps                                        │
│                                                                      │
│  Google Maps URL (for "Open on Maps" link)                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ https://maps.google.com/?cid=...                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
  Google Places API key: Admin > Site Settings > ⑩ Integrations
  (integrations.googlePlacesApiKey).
```

---

## Admin > Orders List ✅ (list view)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Orders                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search order ID...]  [Status ▾]  [Store ▾]  [Date range ▾]  [Sort ▾] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tabs: [All] [Pending] [Processing] [Shipped] [Delivered] [Cancelled] [Refund]
├─────────────────────────────────────────────────────────────────────────────┤
│  Order ID        Buyer      Store      Items  Total    Status       Date   ⋮ │
│  ────────────────────────────────────────────────────────────────────────── │
│  order-3-0508-.. Ravi K.    CardGame   3      ₹13,497  SHIPPED      May 08 ⋮ │
│  order-1-0507-.. Priya S.   Diecast    1      ₹4,999   DELIVERED    May 07 ⋮ │
│  order-2-0506-.. Arjun M.   Tokyo Toys 2      ₹10,498  PENDING      May 06 ⋮ │

  Row ⋮: View Detail (→ VA9 status update SideDrawer) | Update Tracking
```

---

## Admin > Order Status/Tracking SideDrawer ⏳ (VA9)

```
SideDrawer:
┌──────────────────────────────────────────┐
│  Order #order-3-0508-a1b2c3          [✕] │
├──────────────────────────────────────────┤
│  Buyer: Ravi Kumar                       │
│  Items: 3 × [thumbnails]                 │
│  Total: ₹13,497                          │
│  Address: 123 MG Road, Mumbai 400001     │
├──────────────────────────────────────────┤
│  Status      [sel: PENDING/PROCESSING/   │
│               SHIPPED/DELIVERED/         │
│               CANCELLED/REFUNDED/        │
│               RETURN_REQUESTED]          │
│  Tracking #  [input]                     │
│  Carrier     [sel: BlueDart/DTDC/Delhivery/...]│
│  Note        [textarea internal]         │
├──────────────────────────────────────────┤
│  [Approve]  [Reject]  [Refund: ₹ input]  │
│  [Cancel]                    [Save Order]│
└──────────────────────────────────────────┘
```

---

## Admin > Users List ✅ (list view)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Users                                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search name/email...]   [Role ▾]   [Status ▾]   [Sort ▾]              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Avatar  Name           Email              Role     Verified  Joined    ⋮   │
│  ──────────────────────────────────────────────────────────────────────────│
│  👤      Admin LT        admin@letitrip.in  admin    ✓         Apr 2026  ⋮   │
│  👤      Ravi Kumar      ravi@...           buyer    ✓         Apr 2026  ⋮   │
│  👤      CardGame Hub    seller@...         seller   ✓         Apr 2026  ⋮   │

  Row ⋮ (VA10): Change Role | Ban User | View Profile
```

---

## Admin > Stores List ✅ (VA3/VA12 — store identity + manage drawer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Stores                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search stores...]   [Status ▾]   [Verified ▾]   [Sort ▾]              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Logo  Store Name        Owner (admin)  Status    Verified  Products  ⋮     │
│  ────────────────────────────────────────────────────────────────────────── │
│  🖼     CardGame Hub      Ravi Kumar    Active    ✓          47        ⋮    │
│  🖼     Diecast Garage    Priya Sharma  Active    ✓          32        ⋮    │
│  🖼     Bladers Paradise  Arjun Mehta   Pending   ✗          5         ⋮    │

  Note: "Owner" column = ownerId display name; visible to admin only.
        Public store cards show storeName/storeId only (no ownerId).

  Row ⋮ → RowActionMenu:
    [Manage]  → opens AdminStoreEditorView SideDrawer (3 fields, see below)
    [View]    → /stores/[storeId]  (public store page, new tab)
```

---

## Admin > Store Editor SideDrawer ✅ (VA3/VA12)

```
SideDrawer (3+ fields → SideDrawer rule):
┌──────────────────────────────────────────┐
│  Manage Store: CardGame Hub          [✕] │
│  store-cardgame-hub                      │
├──────────────────────────────────────────┤
│  Status      [sel: active/pending/       │
│               suspended/rejected]        │
│  Admin Notes [textarea]                  │
│  Is Featured [tog]                       │
├──────────────────────────────────────────┤
│  [Cancel]                   [Save Store] │
└──────────────────────────────────────────┘

  → PATCH /api/admin/stores/[storeId]  { status, adminNotes, isFeatured }
  → Invalidates admin stores listing query on success
```

---

## Admin > Reviews List ✅ (list view)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Reviews                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search reviews...]   [Rating ▾]   [Status ▾]   [Verified ▾]  [Sort ▾] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Product         Reviewer    Rating   Verified  Status     Date       ⋮     │
│  ────────────────────────────────────────────────────────────────────────── │
│  Charizard ETB   Ravi K.     ★★★★★    ✓         Published  May 08     ⋮     │
│  Hot Wheels RLC  Priya S.    ★★★☆☆    ✗         Pending    May 07     ⋮     │

  Row ⋮ (VA11): Approve | Reject | Feature | Reply
```

---

## Admin > Bids List ✅ (list view)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Bids                                             [Filter by Auction ▾]      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Auction              Bidder     Amount    Status    Bid Time          ⋮     │
│  ────────────────────────────────────────────────────────────────────────── │
│  Charizard PSA9       Ravi K.    ₹2,99,999  active   2026-05-08 14:32  ⋮     │
│  Charizard PSA9       Priya S.   ₹2,50,000  outbid   2026-05-08 12:01  ⋮     │
│  Exodia LOB PSA8      Arjun M.   ₹62,000    active   2026-05-08 10:15  ⋮     │

  Row ⋮ (VA16): Cancel/Void Bid (ConfirmDeleteModal)
```

---

## Admin > Payouts List ✅ (ARCH4 — storeId identity + mark-paid + CSV)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Payout Operations                               [Export CSV]                │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search stores, payout IDs, or order groups...]   [Status ▾]  [Sort ▾] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Payout ID · Amount          Store (storeName)    Status      Updated    ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  payout-mistys-… · ₹47,500  Misty's Water Cards  PENDING     2 days ago ⋮  │
│  payout-bladers-… · ₹28,000 Bladers Paradise     PAID        5 days ago ⋮  │
│  payout-animev-… · ₹15,200  Anime Vault India    PROCESSING  1 day ago  ⋮  │
│  ─────────────── Empty state: "No payouts found" ─────────────────────────  │

  [Export CSV] → GET /api/admin/payouts/export → downloads payouts-YYYY-MM-DD.csv
                 Columns: id, storeId, storeName, amount, status, transactionId,
                          periodStart, periodEnd, createdAt

  Row ⋮ → RowActionMenu:
    [Mark paid]  (disabled if status = paid or cancelled)

  Mark paid Modal (1 field — 0-2 field rule):
  ┌──────────────────────────────────────────┐
  │  Mark payout as paid                 [✕] │
  ├──────────────────────────────────────────┤
  │  Transaction / reference ID              │
  │  [UTR, UPI ref, or bank transfer ID      │
  │   (optional)                          ]  │
  ├──────────────────────────────────────────┤
  │                    [Cancel] [Confirm paid]│
  └──────────────────────────────────────────┘
  → PATCH /api/admin/payouts/[id]  { status:"paid", transactionId }
```

---

## Admin > Analytics ✅ (VA19)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Analytics                                    [Date Range: Last 30 days ▾]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  ┌──────────────────────────────┐     │
│  │  Revenue (line chart)           │  │  Orders (bar chart)          │     │
│  │  ₹ ▲                            │  │  # ▲                         │     │
│  │      ╱╲  ╱╲                     │  │   ██ ██  ██ ██               │     │
│  │  ────────────────────────────   │  │  ────────────────────────    │     │
│  │  Jan  Feb  Mar  Apr  May        │  │  Jan Feb Mar Apr May         │     │
│  └──────────────────────────────────┘  └──────────────────────────────┘     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Products                                                                │
│  # │ Product             │ Store        │ Revenue   │ Units Sold             │
│  1 │ Charizard ETB       │ CardGame Hub │ ₹2,24,950 │ 50                     │
│  2 │ SHF Goku Ultra Inst │ Tokyo Toys   │ ₹1,39,800 │ 20                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Site Settings ✅ (VA8) — 13 groups

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Site Settings                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  [⓪ About] [① Branding] [② Appearance] [③ Announcement] [④ SEO]           │
│  [⑤ Contact+Social] [⑥ Watermark] [⑦ Fees] [⑧ Integrations]               │
│  [⑨ Shipping] [⑩ Auctions] [⑪ Limits] [⑫ Legal]                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⓪ About Page                                         [Save About]     │
│    Hero Title    [input — default: "About LetItRip"]                        │
│    Hero Subtitle [input — default: "Connecting buyers, sellers, bidders…"]  │
│    Mission Title [input — default: "Our Mission"]                           │
│    Mission Text  [textarea]                                                  │
│    CTA Title     [input — default: "Ready to get started?"]                 │
│    Note: leave blank to fall back to platform defaults (i18n)               │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ① Branding                                          [Save Branding]    │
│    Site Name    [input: "LetiTrip"]                                          │
│    Tagline      [input: "India's Largest Collectibles Marketplace"]          │
│    Logo         [MediaUploadField]                                           │
│    Favicon      [MediaUploadField]                                           │
│    Maintenance  [tog] + Message [textarea — shown if on]                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ② Appearance                                       [Save Appearance]   │
│    Primary Color [color picker token]                                        │
│    Secondary Color [color picker token]                                      │
│    Default Theme [sel: light/dark/system]                                   │
│    Font Family   [sel]                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ③ Announcement                                  [Save Announcement]    │
│    Text    [input]    Enabled [tog]    Type [sel: info/warning/promo]        │
│    Link URL [input]   Background Color [color]   Expires At [date]          │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ④ SEO                                                   [Save SEO]     │
│    Default Title Pattern [input]                                             │
│    Default Description   [textarea 155 chars]                                │
│    Default OG Image      [MediaUploadField]                                  │
│    Robots noindex        [tog]    Canonical Base URL [input]                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⑤ Contact & Social                              [Save Contact+Social]  │
│    Email [input]  Phone [input]  Address [textarea]  Hours [input]           │
│    Instagram/Twitter/Facebook/YouTube/WhatsApp/LinkedIn/Pinterest [inputs]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⑥ Watermark                                        [Save Watermark]    │
│    Type [sel: text/image]                                                    │
│    Text [input — shown if text]   Image [MediaUploadField — shown if image] │
│    Size % [slider 0–100]   Opacity % [slider 0–100]                         │
│    Position [sel: bottom-right/bottom-left/center/tile]                     │
│    [Live Preview]                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⑦ Fees & Commissions                                   [Save Fees]     │
│    Platform commission % [input]   Buyer convenience fee % [input]          │
│    Razorpay fee % [input]   Seller payout hold days [input]                 │
│    Min payout amount ₹ [input]   Auction listing fee ₹ [input]              │
│    Pre-order listing fee ₹ [input]   Featured slot fee ₹ [input]            │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⑧ Integrations & Keys                          [Save Integrations]     │
│    Razorpay Key ID [masked input]   Razorpay Secret [masked input]          │
│    Shiprocket API Key [masked]      Shiprocket Secret [masked]              │
│    SMTP Host/Port/User/Password/From [masked inputs]                         │
│    Google Analytics ID [input]   FB Pixel ID [input]   GTM [input]          │
│    Google Maps API Key [masked]   Google Place ID [input]                   │
│    Instagram/Facebook/TikTok/DeviantArt credentials [masked]               │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⑨ Shipping Defaults                                [Save Shipping]     │
│    Free shipping threshold ₹ [input]   COD enabled [tog]   COD fee ₹ [input]│
│    Default carrier [sel]   Max delivery radius km [input]                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⑩ Auction Config                                   [Save Auctions]     │
│    Min bid increment ₹ [input]   Auto-extend window (mins) [input]          │
│    Settlement grace period (hrs) [input]   Max bid multiplier [input]       │
│    Require bid deposit [tog]                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⑪ Platform Limits                                    [Save Limits]     │
│    Max products/store [input]   Max images/product [input]                  │
│    Max video size MB [input]   Max custom fields [input]                    │
│    Max custom sections [input]   Order cancel window hrs [input]            │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB ⑫ Legal Policies                                   [Save Legal]        │
│    Note: HTML pasted here overrides i18n fallback on public policy pages    │
│    Terms of Service    [HTML textarea — saved to siteSettings.legalPages]   │
│    Privacy Policy      [HTML textarea]                                       │
│    Refund Policy       [HTML textarea]                                       │
│    Shipping Policy     [HTML textarea]                                       │
│    Cookie Policy       [HTML textarea]                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Admin > Feature Flags ✅ (VA17)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Feature Flags                                            [Save All Flags]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Flag               Enabled   Rollout % (0–100, disabled when flag off)     │
│  ────────────────────────────────────────────────────────────────────────── │
│  featuredProducts   [tog ✓]   [____100__]                                   │
│  auctions           [tog ✓]   [____100__]                                   │
│  preOrders          [tog ✓]   [____100__]                                   │
│  offers             [tog ✓]   [____100__]                                   │
│  wishlist           [tog ✓]   [____100__]                                   │
│  reviews            [tog ✓]   [____100__]                                   │
│  socialFeed         [tog ✗]   [_______0_] (disabled — flag off)             │
│  googleReviews      [tog ✓]   [____100__]                                   │
│  shiprocket         [tog ✗]   [_______0_] (disabled — flag off)             │
│  smsVerification    [tog ✗]   [_______0_] (disabled — flag off)             │
│  seedPanel          [tog ✓]   [____100__]                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Save All Flags]  — PUT /api/admin/feature-flags { flags, rollouts }       │
└─────────────────────────────────────────────────────────────────────────────┘

  Data source: GET /api/admin/feature-flags → siteSettings.featureFlags + featureFlagRollouts
  formatLabel: camelCase + underscore → human readable (e.g. "smsVerification" → "Sms Verification")
```

---

## Admin > Navigation CMS ✅ (F5/VA7)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Navigation                                              [+ New Nav Item]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⠿  Label            Href               Icon   Order  Parent    Visible  ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  ⠿  Products         /products          🛍      1      —         ✓       ⋮  │
│  ⠿  Auctions         /auctions          🔨      2      —         ✓       ⋮  │
│  ⠿   ↳ Live Auctions /auctions?live     —       1      Auctions  ✓       ⋮  │
│  ⠿  Brands           /brands            🏷       3      —         ✓       ⋮  │
│  ⠿  Events           /events            🎉      4      —         ✗       ⋮  │

  Row inline controls:
    [▲] [▼]  — reorder up/down (immediate optimistic update)
    [👁 / 🚫] — inline visibility toggle (PATCH isVisible immediately)

  Row ⋮ → RowActionMenu:
    [Edit]    → opens AdminNavEditorView SideDrawer (6 fields, see below)
    [Delete]  → ConfirmDeleteModal

  [+ New Nav Item] → opens AdminNavEditorView SideDrawer (empty / new mode)

  Reorder zone (below table):
    Drag-and-drop rows, manual order# input, [Save order] [Reset]
```

---

## Admin > Nav Editor SideDrawer ✅ (F5/VA7)

```
SideDrawer (6 fields → SideDrawer rule):
┌──────────────────────────────────────────┐
│  New Nav Item / Edit Nav Item        [✕] │
├──────────────────────────────────────────┤
│  Label      [input*]                     │
│  Href       [input*  e.g. /products]     │
│  Icon       [sel: emoji/icon slug opt.]  │
│  Parent     [DynSelect optional]         │
│  Order      [number input]               │
│  Visible    [tog]                        │
├──────────────────────────────────────────┤
│  [Cancel]               [Save Nav Item]  │
└──────────────────────────────────────────┘

  New:  POST /api/admin/navigation
  Edit: PATCH /api/admin/navigation/[id]
  → Invalidates navigation listing query on success
```

---

## Admin > Media Library ⚠️ (VA18 partial — browse-existing deferred to I4)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Media Library                                   [Upload Files ⊕]           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⚠ Note: Browse-existing grid requires Storage listing infra (task I4)      │
├─────────────────────────────────────────────────────────────────────────────┤
│  UPLOAD SANDBOX                                                              │
│  Context: [sel: product-image / store-logo / blog-cover / ...]              │
│  Drop zone: [  Drop image or video here, or click to browse  ]              │
│  [Upload]                                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  heroAssetUrl: /media/product-image-charizard-psa9-1-20260510.jpg           │
│  [Copy URL]  ← copies to clipboard, shows "Copied!" momentarily             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Gallery (uploaded in this session):                                         │
│  product-image-charizard-psa9-1-20260510.jpg    [Copy]                      │
│  store-logo-mistys-water-cards-20260510.png     [Copy]                      │
└─────────────────────────────────────────────────────────────────────────────┘

  Copy URL: navigator.clipboard.writeText(assetUrl); shows "Copied!" badge for 1.5s
  Upload: POST /api/media/upload (existing endpoint); generateMediaFilename for slug
```

---

## Admin > Bids ✅ (B5/VA16)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Bids                                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search bids, products, or bidder IDs...]                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Bid ID / Product           Bidder / Amount          Status         ⋮       │
│  ────────────────────────────────────────────────────────────────────────── │
│  bid-charizard-ravi-...     user-ravi-kumar          [active]       ⋮       │
│    auction-charizard-1st    ₹ 12,500                                         │
│  bid-hot-wheels-priya-...   user-priya-s             [outbid]       ⋮       │
│    auction-hot-wheels-...   ₹ 3,200                                         │
│  bid-beyblade-mohsin-...    user-mohsin-c            [cancelled]   ⋮       │
│    auction-beyblade-b159    ₹ 1,800                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Page 1 of 3   [< Prev]  [Next >]                                           │
└─────────────────────────────────────────────────────────────────────────────┘

  Row ⋮ → RowActionMenu:
    [Cancel bid]  (destructive, DISABLED when status=cancelled or voided)
      → ConfirmDeleteModal (variant=warning):
          Title: "Cancel this bid?"
          Message: "The bid will be marked as cancelled. The auction will proceed without this bid."
          [Cancel bid]  [Keep bid]
      → PATCH /api/admin/bids/[id] { status: "cancelled" }
      → invalidates ["admin","bids","listing"]
```

---

## Admin > Newsletter ✅ (B6/VA14)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Newsletter Subscribers                              [Export CSV ⬇]         │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search by email or source...]                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Email                      Source      Status          Subscribed     ⋮    │
│  ────────────────────────────────────────────────────────────────────────── │
│  ravi@example.com           footer      [active]        2 days ago    ⋮    │
│  priya@example.com          checkout    [active]        5 days ago    ⋮    │
│  mohsin@example.com         popup       [unsubscribed]  14 days ago   ⋮    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Page 1 of 2   [< Prev]  [Next >]                                           │
└─────────────────────────────────────────────────────────────────────────────┘

  [Export CSV]:
    GET /api/admin/newsletter/export → blob download "newsletter-subscribers-{date}.csv"
    Columns: id, email, status, source, subscribedAt, createdAt

  Row ⋮ → RowActionMenu:
    [Unsubscribe]  (destructive, DISABLED when status=unsubscribed)
      → ConfirmDeleteModal:
          Title: "Unsubscribe this address?"
          Message: "The subscriber will be marked as unsubscribed and will no longer receive emails."
          [Unsubscribe]  [Keep subscribed]
      → DELETE /api/admin/newsletter/[id]
      → invalidates ["admin","newsletter","listing"]
```

---

## Admin > Contact Submissions ✅ (B7/VA15)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Contact Submissions                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search by subject, name, or email...]                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Subject / Name             Email              Status        Date        ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  Order issue — Ravi Kumar   ravi@example.com   [new]         2h ago     ⋮  │
│  Refund query — Priya S.    priya@example.com  [read]        1d ago     ⋮  │
│  Partnership — Acme Ltd     acme@example.com   [resolved]    5d ago     ⋮  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Page 1 of 2   [< Prev]  [Next >]                                           │
└─────────────────────────────────────────────────────────────────────────────┘

  Row ⋮ → RowActionMenu:
    [View]        → opens AdminContactEditorView SideDrawer (read-only + actions)
    [Mark read]   → PATCH /api/admin/contact-submissions/[id] { action: "read" }  (disabled if status=read/resolved)
    [Archive]     → PATCH /api/admin/contact-submissions/[id] { action: "resolved" }  (disabled if status=resolved)
    ─────────────
    [Delete]      → ConfirmDeleteModal → DELETE /api/admin/contact-submissions/[id]
```

---

## Admin > Contact Editor SideDrawer ✅ (B7/VA15)

```
SideDrawer (read-only display + actions):
┌──────────────────────────────────────────┐
│  Contact Submission                  [✕] │
├──────────────────────────────────────────┤
│  Status: [new ●blue]                     │
│          or [read ●zinc]                 │
│          or [resolved ●green]            │
│  From: Ravi Kumar                        │
│        ravi@example.com                  │
├──────────────────────────────────────────┤
│  Subject: Order issue with tracking      │
├──────────────────────────────────────────┤
│  Message (scrollable):                   │
│  ┌──────────────────────────────────┐    │
│  │ Hi, I placed order-3-202605...   │    │
│  │ but the tracking number shows... │    │
│  │ ...                              │    │
│  └──────────────────────────────────┘    │
├──────────────────────────────────────────┤
│  [Reply via email (mailto:)]             │
│  [Close]  [Mark read]  [Archive]         │
│  — Mark read:  PATCH { action: "read" }  │
│  — Archive:    PATCH { action: "resolved"}│
└──────────────────────────────────────────┘
```

---

## Admin > Return Requests ✅ (LL16)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Return Requests                                                             │
│  Orders where the buyer requested a return. Approve or reject each request. │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search by order ID or buyer...]                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Order / Buyer                  Total        Status              Date    ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  order-2-20260510-abc123        ₹ 3,200      [RETURN_REQUESTED]  2h ago  ⋮  │
│    user-ravi-kumar · ₹ 3,200                                                │
│  order-1-20260509-def456        ₹ 8,750      [RETURN_REQUESTED]  1d ago  ⋮  │
│    user-priya-s · ₹ 8,750                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Empty state: "No return requests"                                           │
└─────────────────────────────────────────────────────────────────────────────┘

  Data source: GET /api/admin/orders?status=RETURN_REQUESTED

  Row ⋮ → RowActionMenu:
    [Approve return]
      → ConfirmDeleteModal (variant=primary):
          Title: "Approve return request?"
          Message: "Order status → REFUNDED. Buyer notified, refund process begins."
          [Approve return]
      → PATCH /api/admin/orders/[id] { status: "REFUNDED" }
      → invalidates ["admin","return-requests"] + ["admin","orders"]

    [Reject return]  (destructive)
      → ConfirmDeleteModal (variant=danger):
          Title: "Reject return request?"
          Message: "Order status → DELIVERED. Buyer's return request declined."
          [Reject return]
      → PATCH /api/admin/orders/[id] { status: "DELIVERED" }
      → invalidates ["admin","return-requests"] + ["admin","orders"]
```

---

## Admin > Store Addresses ✅ (LL17)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Store Addresses                                                             │
│  Read-only overview of store pickup locations and shipping addresses.        │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Search by label, city, or store ID...]                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Label / City, State            Store ID / Pincode     Type                 │
│  ────────────────────────────────────────────────────────────────────────── │
│  Main Pickup, Mumbai, MH        store-mistys-cards     [pickup]             │
│  Warehouse, Pune, MH            store-bladers-den      [standard]           │
│  Shop Front, Delhi, DL          store-hot-wheels-hub   [pickup]             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Empty state: "No store addresses found"                                     │
│  Total: 8 addresses                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

  Data source: GET /api/admin/store-addresses
    — no storeId param → collectionGroup("addresses") across all stores
    — ?storeId=store-xyz → stores/store-xyz/addresses subcollection
  Read-only — no RowActionMenu, no mutations
  Stores manage their own addresses via VB7 (store dashboard)
```

---

## Admin > Seed & Docs Panel ✅ (SP1/P10)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Seed & Docs (Admin only · feature-flag gated)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  STICKY TOOLBAR                                                              │
│  [Select All] [Select Default] [Clear] [🔄 Refresh]                         │
│  [🔍 Search collections...] [Sort ▾]  [Dry Run ☐]  [⚡ Add Data] [🗑 Remove]│
│  GROUP CHIPS: [Core] [Transactional] [Content] [System]                     │
│  STATUS CHIPS: [All] [Seeded] [Partial] [Empty] [Error]                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  DB Overview: 23 collections | X docs total | Last seeded: 2026-05-08       │
│                                                                              │
│  ── CORE GROUP ───────────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ☐ users                    15 / 9 seeded  ████████░░  🔑 user-{name}│  │
│  │   🖼 photoURL               PII: email, phone, displayName           │  │
│  │   [▼ Show schema fields]                                             │  │
│  │   Field     Type    Search  Filter  Sort   PII   Indexed             │  │
│  │   id        string  ✓       ✓       ✗      ✗     ✓                  │  │
│  │   email     string  ✓       ✓       ✗      ✓     ✓                  │  │
│  │   role      string  ✗       ✓       ✗      ✗     ✓                  │  │
│  │   [UI path: /admin/users]                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ☐ products                  20 / 20 seeded ██████████ 🔑 product-{..}│  │
│  │   🖼 images[]               PII: none                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ... (one card per collection)                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Media Slug Patterns table (from generateMediaFilename)                      │
│  Type             Pattern                          Example                   │
│  user-avatar      user-avatar-{name}-{date}.{ext}  user-avatar-ravi-...jpg  │
│  product-image    product-image-{slug}-{n}-{date}  product-image-char-1.jpg │
│  ...                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# STORE (SELLER) AREA

## Store > Layout Shell

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  LetiTrip  [My Store: CardGame Hub ▾]  [🔔]  [👤 Seller Name ▾]             │
├──────────┬───────────────────────────────────────────────────────────────────│
│ SIDEBAR  │  MAIN CONTENT AREA                                                 │
│          │                                                                    │
│ ▸ Dashboard                                                                   │
│ ▸ Products                                                                    │
│ ▸ Auctions                                                                    │
│ ▸ Pre-Orders                                                                  │
│ ──────────                                                                    │
│ ▸ Orders                                                                      │
│ ▸ Coupons                                                                     │
│ ▸ Offers                                                                      │
│ ──────────                                                                    │
│ ▸ Payouts                                                                     │
│ ▸ Analytics                                                                   │
│ ──────────                                                                    │
│ ▸ Storefront                                                                  │
│ ▸ Shipping                                                                    │
│ ▸ Payout Settings                                                             │
│ ▸ Addresses                                                                   │
└──────────┴───────────────────────────────────────────────────────────────────┘
```

---

## Store > Dashboard ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Dashboard — CardGame Hub                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ Revenue  │  │ Orders   │  │ Products │  │ Reviews  │                    │
│  │ ₹X,XX,XXX│  │ 35 total │  │ 47 listed│  │ ★4.8 avg │                    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Revenue Chart (wired via VB10)       Top Products (wired via VB10)         │
│  [SellerRevenueChart placeholder]     [SellerTopProductsTable placeholder]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Recent Listings                                                             │
│  🖼  Charizard ETB   ₹4,499   Published   [Edit]                             │
│  🖼  Exodia PSA8     ₹49,999  Live        [Edit]                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Store > Products List ✅ (LL6 ⏳ full listing layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Products                                             [+ New Product]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  TYPE: [All] [Standard] [Auctions] [Pre-Orders]                             │
│  [🔍 Search...]   [Status ▾]   [Sort ▾]                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [☐] Thumbnail  Title           Type       Price   Status    Stock   ⋮      │
│  ────────────────────────────────────────────────────────────────────────── │
│  [☐] 🖼          Charizard ETB   Standard   ₹4,499  Published 12      ⋮      │
│  [☐] 🖼          Exodia PSA8     Auction    ₹49,999 Live      —       ⋮      │
│  [☐] 🖼          DBZ Goku PO     Pre-Order  ₹3,499  Active    50max   ⋮      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Bulk: [Delete] [Toggle Featured] [Unpublish]                               │
└─────────────────────────────────────────────────────────────────────────────┘

  Row ⋮: Edit | Duplicate | Unpublish | Delete
```

---

## Store > Orders List ✅ (LL7 ⏳ full listing layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Orders                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [All] [Pending] [Processing] [Shipped] [Delivered] [Cancelled] [Returns]   │
│  [🔍 Search order ID or buyer...]   [Date range ▾]   [Sort ▾]              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Order ID        Date    Buyer*    Items  Total    Tracking   Status     ⋮  │
│  ────────────────────────────────────────────────────────────────────────── │
│  order-3-0508-.. May 08  Ravi K.   3      ₹13,497  TN123456   SHIPPED    ⋮  │
│  order-1-0507-.. May 07  Priya S.  1      ₹4,999   —          PENDING    ⋮  │
│  * buyer name visible to seller (not full PII)                              │
│  Bulk: [Mark Shipped (tracking # modal)]                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Store > Order Detail SideDrawer ⏳ (VB2)

```
SideDrawer:
┌──────────────────────────────────────────┐
│  Order #order-3-0508-a1b2c3          [✕] │
├──────────────────────────────────────────┤
│  Buyer: Ravi Kumar (masked last name)    │
│  Address: 123 MG Road, Mumbai 400001     │
│  Items:                                  │
│    🖼 Charizard ETB ×1  ₹4,499           │
│    🖼 Pikachu Plush ×2  ₹2,598           │
│  Subtotal: ₹13,497   Shipping: ₹50       │
│  Total: ₹13,547   Payment: Razorpay      │
├──────────────────────────────────────────┤
│  Status  [sel: PENDING/PROCESSING/       │
│            SHIPPED/DELIVERED]            │
│  Tracking # [input]                      │
│  Carrier    [sel]                        │
├──────────────────────────────────────────┤
│  [Mark Shipped]        [Mark Delivered]  │
│  [Cancel]                   [Save Order] │
└──────────────────────────────────────────┘
```

---

## Store > Coupons List ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Coupons                                              [+ New Coupon]      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Code       Type           Discount   Min Order  Uses      Active   ⋮       │
│  ────────────────────────────────────────────────────────────────────────── │
│  BLADER20   percentage     20%        ₹500       12/50     ✓        ⋮       │
│  FREESHIP   free_shipping  —          ₹999       5/20      ✓        ⋮       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Store > Analytics ⏳ (VB10)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Store Analytics                              [Date Range: Last 30 days ▾]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Revenue  │  │ Orders   │  │ Customers│  │ Avg Order│                   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                   │
│  Revenue Chart  |  Orders Chart  |  Top Products Table                      │
│  ░░░░░░░░░░░░   |  ░░░░░░░░░░░░  |  ░░░░░░░░░░░░░░░░░░                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Store > Storefront Edit ⏳ (VB4/O2+C5)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Edit Storefront                                         [Save Storefront]   │
├────────────────────────┬────────────────────────────────────────────────────┤
│  Store Logo            │  Store Banner                                      │
│  [MediaUploadField]    │  [MediaUploadField — wide]                         │
├────────────────────────┴────────────────────────────────────────────────────┤
│  Store Name      [input — read-only]                                         │
│  Store Description [RichTextEditor]                                          │
│  About / Bio     [RichTextEditor]                                            │
│  Return Policy   [RichTextEditor]                                            │
│  Vacation Mode   [tog]  Vacation Message [textarea — shown if on]           │
│  Public Profile  [tog]                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Store > Shipping Config ⏳ (VB5/C6)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Shipping Configuration                                  [Save Shipping]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Standard Shipping [tog]   Price ₹ [input]                                  │
│  Express Shipping  [tog]   Price ₹ [input]                                  │
│  Free Shipping     [tog]   Threshold ₹ [input — shown if on]               │
│  COD               [tog]   COD Fee ₹ [input — shown if on]                 │
│  Pickup            [tog]   Pickup Addresses [StoreAddressSelectorCreate]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Store > Payout Settings ⏳ (VB6/C7)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Payout Settings                                        [Save Payout Info]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Method: (•) UPI  ( ) Bank Transfer                                          │
│                                                                              │
│  UPI (shown if UPI selected):                                                │
│    UPI VPA [input: name@upi]                                                 │
│                                                                              │
│  Bank (shown if Bank selected):                                              │
│    Account Name   [input]                                                    │
│    Account Number [masked input — shows ****1234]  [👁 reveal]              │
│    IFSC Code      [input]                                                    │
│    Bank Name      [input]                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Store > Addresses (Pickup Locations) ⏳ (VB7/O3)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Pickup Addresses                                      [+ Add Address]       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Label        Full Address                    Pickup Point   Default  ⋮     │
│  ────────────────────────────────────────────────────────────────────────── │
│  Warehouse    123 MG Road, Mumbai 400001      ✓              ✓        ⋮     │
│  Shop         45 FC Road, Pune 411005         ✓              ✗        ⋮     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# USER ACCOUNT AREA

## User > Layout Shell

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  LetiTrip  [🔍]  [🛒 Cart]  [♡ Wishlist]  [🔔]  [👤 Ravi ▾]                │
├──────────┬───────────────────────────────────────────────────────────────────│
│ SIDEBAR  │  MAIN CONTENT AREA                                                 │
│          │                                                                    │
│ 👤 Ravi Kumar                                                                 │
│ buyer · ★4.9                                                                  │
│ ──────────                                                                    │
│ ▸ My Orders                                                                   │
│ ▸ Wishlist                                                                    │
│ ▸ Addresses                                                                   │
│ ▸ Offers                                                                      │
│ ▸ Notifications                                                               │
│ ▸ Messages                                                                    │
│ ──────────                                                                    │
│ ▸ Profile                                                                     │
│ ▸ Settings                                                                    │
│ ──────────                                                                    │
│ ▸ Become a Seller                                                             │
└──────────┴───────────────────────────────────────────────────────────────────┘
```

---

## User > Account Hub ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Account                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────┐                                        │
│  │ 👤 Ravi Kumar   buyer  ★4.9       │                                        │
│  │ Joined Apr 2026 · 12 orders      │                                        │
│  └──────────────────────────────────┘                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Quick Nav:  [Orders]  [Wishlist]  [Addresses]  [Profile]  [Notifications]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Recent Orders                                                               │
│  order-3-0508  3 items  ₹13,497  SHIPPED   [Track]  [View Details]          │
│  order-1-0507  1 item   ₹4,999   DELIVERED [Invoice] [Review]               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User > Orders List ⏳ (LL1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Orders                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [All] [Pending] [Processing] [Shipped] [Delivered] [Cancelled] [Returns]   │
│  [🔍 Search order ID...]   [Date ▾]   [Sort ▾]                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Order ID        Date    Items  Total    Status      Action                  │
│  ────────────────────────────────────────────────────────────────────────── │
│  order-3-0508-.. May 08  3      ₹13,497  SHIPPED    [Track] [View Details]  │
│  order-1-0507-.. May 07  1      ₹4,999   DELIVERED  [Invoice][Write Review] │
│  order-2-0506-.. May 06  2      ₹10,498  CANCELLED  [View Details]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User > Order Detail ⏳ (VC1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Order #order-3-0508-a1b2c3          [← Back to Orders]  [Download Invoice] │
├───────────────────────┬──────────────────────┬──────────────────────────────┤
│  ITEMS                │  DELIVERY ADDRESS    │  PAYMENT                      │
│  🖼 Charizard ETB ×1  │  Ravi Kumar          │  Method: Razorpay            │
│     ₹4,499            │  123 MG Road         │  Payment ID: pay_xxxx        │
│  🖼 Pikachu Plush ×2  │  Mumbai 400001       │  Amount: ₹13,547             │
│     ₹2,598            │                      │  Status: Paid ✓              │
│  ─────────────────────│                      │                              │
│  Subtotal: ₹13,497    │                      │                              │
│  Shipping: ₹50        │                      │                              │
│  Total: ₹13,547       │                      │                              │
├───────────────────────┴──────────────────────┴──────────────────────────────┤
│  TRACKING                                                                    │
│  Carrier: BlueDart   Tracking #: TN123456789                                 │
│  ●──────────●──────────●──────────○──────────○                              │
│  Ordered    Confirmed  Shipped    Out for    Delivered                        │
│  May 08     May 08     May 09     Delivery                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User > Wishlist ✅ (VC6)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Wishlist  (24 items)                    [Sort: Recently Added ▾]        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Filter: [All] [In Stock] [Out of Stock] [On Sale]                          │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ 🖼            │ │ 🖼            │ │ 🖼  OUT OF   │ │ 🖼            │      │
│  │ Charizard ETB│ │ SHF Goku UI  │ │     STOCK    │ │ Beyblade BX01│      │
│  │ ₹4,499       │ │ ₹6,999       │ │ Hot Wheels   │ │ ₹1,999       │      │
│  │ Added May 01 │ │ Added Apr 28 │ │ ₹4,999       │ │ Added Apr 25 │      │
│  │ [🛒 Add Cart]│ │ [🛒 Add Cart]│ │ [Notify Me]  │ │ [🛒 Add Cart]│      │
│  │ [♡ Remove]   │ │ [♡ Remove]   │ │ [♡ Remove]   │ │ [♡ Remove]   │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│  ⚠ 2 items removed (no longer available)                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User > Addresses ⏳ (LL4/VC3-adjacent)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Addresses                                           [+ Add Address]      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ 🏠 Home             [Default ✓] │  │ 🏢 Office                       │  │
│  │ Ravi Kumar                      │  │ Ravi Kumar                      │  │
│  │ 123 MG Road, Bandra             │  │ 45 BKC, Kurla                   │  │
│  │ Mumbai, Maharashtra 400050      │  │ Mumbai, Maharashtra 400051      │  │
│  │ +91-98765-43210                 │  │ +91-98765-43210                 │  │
│  │ [⊞ Edit] [🗑 Delete]           │  │ [Set Default] [⊞ Edit] [🗑 Del] │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                              │
│  Empty state: "No addresses saved. Add your first delivery address."        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User > Profile Edit ⏳ (VC3/D2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Edit Profile                                              [Save Profile]    │
├────────────────────────┬────────────────────────────────────────────────────┤
│  Profile Photo         │  Display Name  [input]                             │
│  [ImageCropModal]      │  Bio           [textarea]                          │
│  [Change Photo]        │  Public Profile [tog]                              │
│                        │  Social Links:                                     │
│                        │    Twitter/X   [input url]                         │
│                        │    Instagram   [input url]                         │
│                        │    YouTube     [input url]                         │
└────────────────────────┴────────────────────────────────────────────────────┘
```

---

## User > Settings ⏳ (VC4/D3)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Settings                                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Account] [Privacy] [Appearance]                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB: Account                                                                │
│    Email       current@email.com  [Change Email]                             │
│    Password    ************       [Change Password]                          │
│    Phone       +91-XXXXX-XXXXX    [Change Phone]                            │
│                                                                              │
│  TAB: Privacy                                                                │
│    Data Export  [Request Export]                                             │
│    Delete Account [Delete My Account — confirm modal with reason]           │
│                                                                              │
│  TAB: Appearance                                                             │
│    Theme       [sel: light/dark/system]                                     │
│    Language    [sel: English/Hindi/...]                                      │
│    Font Size   [sel: small/medium/large]                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User > Notifications ✅ (VC5/D4)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Notifications                                      [Mark All Read]          │
├─────────────────────────────────────────────────────────────────────────────┤
│  [All] [Unread] [Orders] [Bids] [Offers] [System]                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔵 Order Shipped — Your order #order-3-0508 has been shipped!    May 08 ⋮  │
│     Carrier: BlueDart · Track: TN123456789                                  │
│  🔵 Outbid — Someone outbid you on Charizard PSA9 (₹3,00,000)    May 08 ⋮  │
│  ○  Order Delivered — order-1-0507 delivered successfully          May 07 ⋮  │
│  ○  New Review Approved — Your review on Charizard ETB published  May 06 ⋮  │

  Row ⋮: Mark read | Delete
```

---

# PUBLIC PAGES

## Public > Homepage ✅ (all sections — overview)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER: [Logo] [🔍 Search [type ▾] [Search btn]] [Cart 3] [♡] [👤] [🔔]  │
│  NAVBAR: [Products] [Auctions] [Pre-Orders] [Brands] [Events] [Blog] [FAQs]│
├─────────────────────────────────────────────────────────────────────────────┤
│  [§ Announcement Bar: "🎉 Up to 15% Off Pokémon TCG · Use code SAVE15"]    │
│  § 1  welcome           — H1 + trust chips + CTA buttons                   │
│  § 2  carousel          — full-height hero slide with bg + zone cards       │
│  § 3  stats             — animated counter strip (4 stats)                  │
│  § 4  trust-indicators  — 4-column icon + title + description               │
│  § 5  categories        — horizontal category card scroller                 │
│  § 6  brands            — auto-scroll logo strip                            │
│  § 7  products          — featured product card carousel [View all →]       │
│  § 8  auctions          — auction card carousel with countdown [View all →] │
│  § 9  pre-orders        — pre-order card carousel [View all →]              │
│  § 10 banner            — full-width promo banner with CTA buttons          │
│  § 11 features          — platform highlights checklist/grid                │
│  § 12 reviews           — customer review card carousel [See all →]         │
│  § 13 stores            — featured store card carousel [View all →]         │
│  § 14 events            — upcoming event cards [View all →]                 │
│  § 15 blog-articles     — 3–4 blog post cards [View all posts →]            │
│  § 16 whatsapp-community — WhatsApp group join card                         │
│  § 17 faq               — accordion FAQ (5 items) [View all FAQs →]         │
│  § 18 newsletter        — email subscribe form                               │
│  § 19 social-feed       — Instagram/social post grid (⏳ disabled by default)│
│  § 20 custom-cards      — configurable card grid/row/masonry                │
│  § 21 google-reviews    — Google Business review cards                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  FOOTER: Shop | Support | Sellers | Learn | Legal | Social icons            │
└─────────────────────────────────────────────────────────────────────────────┘

Section rendering: driven by homepageSections Firestore collection.
Order = section.order ascending. enabled=false → not rendered.
Ad slots injected after: carousel(afterHero), products(afterFeaturedProducts),
reviews(afterReviews), faq(afterFAQ).
```

---

## Public > Homepage Section — welcome

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ● India's #1 Marketplace                                 │
│                                                                             │
│           India's #1 Collectibles Marketplace                               │
│           Buy, Sell & Auction with Verified Sellers                         │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  🚀 Fast Delivery   🔒 Secure Payments   ⭐ 4.8+ Rated   ↩️ Easy Returns│
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                    [Shop Now]   [Browse All]                                │
│                    ─────── LIR ───────                                      │
└─────────────────────────────────────────────────────────────────────────────┘
Component: WelcomeSection
Config fields: h1 · subtitle · description · showCTA · ctaText · ctaLink
```

---

## Public > Homepage Section — carousel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  [Background: image / video / color / gradient]                     ║  │
│  ║  [dimOverlay: rgba(0,0,0,0.25–0.50)]                                ║  │
│  ║                                                                     ║  │
│  ║  ── OVERLAY MODE (cards=[]) ─────────────────────────────────────  ║  │
│  ║  │  SUBTITLE (uppercase, tracking-widest)                         │ ║  │
│  ║  │  H1 TITLE (font-display, text-4xl–8xl, white)                  │ ║  │
│  ║  │  Description paragraph (text-lg, white/90)                     │ ║  │
│  ║  │  [Shop Now]                                                     │ ║  │
│  ║                                                                     ║  │
│  ║  ── CARDS MODE (cards.length > 0) ──────────────────────────────  ║  │
│  ║  ┌──────────────────────────────────────────────────────────────┐ ║  │
│  ║  │  Zone grid: 2 rows × 3 columns (up to 6 cards)               │ ║  │
│  ║  │  Row 1: zone 1  │  zone 2  │  zone 3                         │ ║  │
│  ║  │  Row 2: zone 4  │  zone 5  │  zone 6                         │ ║  │
│  ║  │                                                               │ ║  │
│  ║  │  Each card: [background img/color/gradient]                   │ ║  │
│  ║  │             [eyebrow · title · subtitle · description]        │ ║  │
│  ║  │             [buttons]  hover: scale|glow|color|none           │ ║  │
│  ║  │  Cards MUST use different rows (row1 ≠ row2 per card pair)    │ ║  │
│  ║  └──────────────────────────────────────────────────────────────┘ ║  │
│  ║                                                                     ║  │
│  ║  Mobile: single-column; mobileZone 2=row1-center 5=row2-center    ║  │
│  ║  ← [◁]          ● ● ○ ○ ○            [▷] →                       ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────────────────────┘
Heights: viewport=min-h-screen · tall=min-h-[80vh] · medium=min-h-[60vh]
         (applied on ALL screen sizes — no md: gating)
Slides: up to 5 active (MAX_ACTIVE_SLIDES=5), sorted by order, autoplay
Component: HeroCarousel · hook: useHeroCarousel · source: carouselSlides
```

---

## Public > Homepage Section — stats

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│   │   5,000+     │  │    200+      │  │   12,000+    │  │    4.8★      │ │
│   │   Listings   │  │  Verified    │  │   Happy      │  │  Platform    │ │
│   │              │  │   Sellers    │  │   Buyers     │  │   Rating     │ │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Component: StatsCounterSection
Config fields: title · stats[]{key, label, value}
```

---

## Public > Homepage Section — trust-indicators

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              Why Collectors Trust LetItRip                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌──────────┐ │
│  │  🛡 Verified   │  │  🔒 Escrow     │  │  ↩️ Easy       │  │  ✓ Auth  │ │
│  │  Sellers       │  │  Payment       │  │  Returns       │  │  Guarantee│ │
│  │                │  │                │  │                │  │          │ │
│  │  Every seller  │  │  Payment held  │  │  Seller return │  │  Counter- │ │
│  │  is manually   │  │  until you     │  │  policies      │  │  feit =  │ │
│  │  verified...   │  │  confirm...    │  │  cover all...  │  │  refund  │ │
│  └────────────────┘  └────────────────┘  └────────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
Component: TrustFeaturesSection
Config fields: title · indicators[]{id, icon, title, description}
```

---

## Public > Homepage Section — categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Shop by Category                              [All categories →]           │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ← ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  peek → →      │
│     │  [cover] │  │  [cover] │  │  [cover] │  │  [cover] │                 │
│     │          │  │          │  │          │  │          │                 │
│     │  Action  │  │  Trading │  │  Diecast │  │  Spinning│                 │
│     │  Figures │  │  Cards   │  │  Vehicles│  │  Tops    │                 │
│     └──────────┘  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
Component: ShopByCategorySection → SectionCarousel
Config fields: title · maxCategories · autoScroll · scrollInterval
Source: categories Firestore (isFeatured=true OR showOnHomepage=true)
```

---

## Public > Homepage Section — brands

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Top Collectibles Brands                                                    │
│  Authentic products from the world's leading manufacturers                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ← [Bandai] [Hasbro] [Takara-Tomy] [Mattel] [Pokémon Co] [Konami] [Funko]→│
│     [NECA]  [McFarlane] [Good Smile] [Hot Wheels] [Tomica] [Beyblade]  →  │
│                     (auto-scrolling logo strip)                             │
└─────────────────────────────────────────────────────────────────────────────┘
Component: BrandsSection → SectionCarousel
Config fields: title · subtitle · maxBrands · autoScroll · scrollInterval
Source: brands Firestore ordered by displayOrder
```

---

## Public > Homepage Section — products / auctions / pre-orders

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Featured Collectibles ✶                     [View all products →]          │
│   ─ ✶ ─                                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ←  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  peek  →      │
│      │  [🖼]   │  │  [🖼]   │  │  [🖼]   │  │  [🖼]   │                 │
│      │ Product  │  │ Product  │  │ Product  │  │ Product  │                 │
│      │ Name     │  │ Name     │  │ Name     │  │ Name     │                 │
│      │ ₹4,499   │  │ ₹6,999   │  │ ₹1,999   │  │ ₹2,999   │                 │
│      │ ★★★★☆   │  │ [NEW]    │  │ [SALE]   │  │ [AUCTION]│                 │
│      │ CardGame │  │ Diecast  │  │ Bladers  │  │ TokyoToy │                 │
│      │ Hub      │  │ Garage   │  │ Paradise │  │ Store    │                 │
│      │[🛒 Add] │  │[🛒 Add] │  │ [Bid Now]│  │[Reserve] │                 │
│      │[♡]      │  │[♡]      │  │ ⏱ 12h   │  │[♡]      │                 │
│      └──────────┘  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
Components:
  products   → FeaturedProductsSection → SectionCarousel → InteractiveProductCard
  auctions   → FeaturedAuctionsSection → SectionCarousel (cards show countdown)
  pre-orders → FeaturedPreOrdersSection → SectionCarousel
Shared config fields: title · subtitle · maxItems · sortBy · filterByBrand ·
  filterByCategory · autoScroll · scrollInterval · loop · maxCount
Resource mode: automatic (Firestore query) OR manual (explicit IDs)
```

---

## Public > Homepage Section — banner

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [background image / color / gradient — height: sm|md|lg|xl]         │  │
│  │                                                                       │  │
│  │           Beyblade X is Here                                          │  │
│  │           Official Takara Tomy Import — BX-01, BX-05, BX-10          │  │
│  │           India's best selection of Beyblade X tops, launchers        │  │
│  │                                                                       │  │
│  │           [Shop Beyblade X]   [Beginner's Guide]                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
Component: CTABannerSection
Heights: sm=200px · md=300px · lg=400px · xl=500px
Config fields: height · backgroundImage · backgroundColor · gradient ·
  content{title, subtitle, description} · buttons[]{text,link,variant} ·
  clickable · clickLink
```

---

## Public > Homepage Section — features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ● Built for trust                                                          │
│                                                                             │
│  Everything a Collector Needs                                               │
│   ─ ✶ ─                                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ✓  Verified authentic listings — every item reviewed before going live     │
│  ✓  Escrow payment protection — money held until you confirm delivery       │
│  ✓  Graded slab support — PSA, BGS, CGC with certificate verification      │
│  ✓  Live auctions with auto-extend — no last-second sniping                │
│  ✓  Pre-orders with deposit — secure releases with 20-30% down             │
│  ✓  Make-an-offer on any listing — negotiate your price                    │
│  ✓  5-star store review system on every seller                             │
│  ✓  Fast India-wide delivery — 3–7 business days standard                  │
│                                                                             │
│                    [Learn about our security →]                             │
└─────────────────────────────────────────────────────────────────────────────┘
Component: SecurityHighlightsSection
Config fields: title · features[] (one string per feature bullet)
```

---

## Public > Homepage Section — reviews

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  What Collectors Are Saying                  [See all reviews →]            │
│   ─ ✶ ─                                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ← ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  →   │
│     │  ★★★★★           │  │  ★★★★☆           │  │  ★★★★★           │      │
│     │  "Amazing deal   │  │  "Fast shipping  │  │  "PSA slab was   │      │
│     │  on the Charizard│  │  and well packed │  │  exactly as      │      │
│     │  ETB. Sealed and │  │  Pokémon booster │  │  described. 100% │      │
│     │  exactly as      │  │  arrived in 4    │  │  authentic."     │      │
│     │  described."     │  │  days."          │  │                  │      │
│     │  — Ravi K.       │  │  — Priya S.      │  │  — Arjun M.      │      │
│     │  Charizard ETB   │  │  SV5 Booster     │  │  Charizard PSA9  │      │
│     │  Verified ✓      │  │  Verified ✓      │  │  Verified ✓      │      │
│     └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
Component: HomepageCustomerReviewsSection → SectionCarousel
Config fields: title · maxReviews · itemsPerView · autoScroll · scrollInterval ·
  source(platform|google) · placeId(if google)
```

---

## Public > Homepage Section — stores

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Top Collectibles Stores                     [View all stores →]            │
│  Browse our verified seller stores                                          │
│   ─ ✶ ─                                                                     │
│  ← ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  → │
│     │  [banner]         │  │  [banner]         │  │  [banner]         │    │
│     │  [logo] CardGame  │  │  [logo] Diecast   │  │  [logo] Bladers   │    │
│     │  Hub         ✓   │  │  Garage       ✓  │  │  Paradise     ✓  │    │
│     │  Pokémon TCG      │  │  Hot Wheels       │  │  Beyblade X       │    │
│     │  47 products      │  │  32 products      │  │  15 products      │    │
│     │  ★★★★★ (24)      │  │  ★★★★☆ (18)      │  │  ★★★★★ (9)       │    │
│     │  [Visit Store →]  │  │  [Visit Store →]  │  │  [Visit Store →]  │    │
│     └───────────────────┘  └───────────────────┘  └───────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
Component: FeaturedStoresSection → SectionCarousel
Config fields: title · subtitle · maxStores · autoScroll · scrollInterval
Note: storeName/storeId shown publicly; ownerId/sellerId never exposed
```

---

## Public > Homepage Section — events

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Tournaments & Community Events              [View all events →]            │
│  Sales, polls, and collector meetups                                        │
│   ─ ✶ ─                                                                     │
│  ← ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  →   │
│     │  [cover]         │  │  [cover]         │  │  [cover]         │      │
│     │  TOURNAMENT      │  │  SALE            │  │  MEETUP          │      │
│     │  Pokémon India   │  │  Summer Holo     │  │  Collector Meet  │      │
│     │  Championship    │  │  Sale 2026       │  │  Mumbai          │      │
│     │  Jun 15 – Jun 16 │  │  May 20 – Jun 20 │  │  Jun 10          │      │
│     │  [Join / View →] │  │  [View →]        │  │  [Join / View →] │      │
│     └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
Component: EventsSection → SectionCarousel
Config fields: title · subtitle · maxEvents · autoScroll · scrollInterval
Source: events Firestore (status=active by default)
```

---

## Public > Homepage Section — blog-articles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Collector's Corner                          [View all posts →]             │
│   ─ ✶ ─                                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐   │
│  │  [cover image]     │  │  [cover image]     │  │  [cover image]     │   │
│  │  TRADING CARDS     │  │  HOT WHEELS        │  │  BEYBLADE X        │   │
│  │  How to Grade      │  │  Complete Guide    │  │  Beginner's Guide  │   │
│  │  Pokémon Cards     │  │  to Hot Wheels     │  │  2026              │   │
│  │  Ravi K. · 8 min   │  │  Priya S. · 12 min │  │  Admin · 6 min     │   │
│  │  [Read More →]     │  │  [Read More →]     │  │  [Read More →]     │   │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
Component: BlogArticlesSection
Config fields: title · maxArticles · showReadTime · showAuthor · showThumbnails
Source: blogPosts Firestore (status=published, ordered by publishedAt desc)
```

---

## Public > Homepage Section — whatsapp-community

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [WhatsApp green background]                                        │   │
│  │                                                                     │   │
│  │  Join the LetItRip Collectors Community                             │   │
│  │  4,200 members                                                      │   │
│  │                                                                     │   │
│  │  ✓  First look at rare listings before they go live                │   │
│  │  ✓  Authentication help from experienced collectors                 │   │
│  │  ✓  Live auction alerts for Charizard, Redlines & signed tops       │   │
│  │  ✓  Free giveaways and community events                            │   │
│  │                                                                     │   │
│  │  "The LetItRip WhatsApp group helped me authenticate a PSA slab    │   │
│  │   within 10 minutes." — Rahul S., Bengaluru                        │   │
│  │                                                                     │   │
│  │  [Join WhatsApp Community]                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
Component: WhatsAppCommunitySection
Config fields: title · description · groupLink · memberCount ·
  benefits[] · buttonText · testimonial
```

---

## Public > Homepage Section — faq

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frequently Asked Questions                  [View all FAQs →]              │
│  Quick answers about buying, selling, and collecting on LetItRip            │
│   ─ ✶ ─                                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ▶  How does bidding work on LetItRip?                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ▼  Is my payment safe? What is escrow?                                     │
│     Payments are held in escrow and released to the seller only after       │
│     you confirm safe delivery. If delivery fails, you get a full refund.    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ▶  How long does shipping take?                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ▶  Can I return a product?                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ▶  How do pre-orders work?                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
Component: FAQSection
Config fields: title · subtitle · showOnHomepage · displayCount ·
  expandedByDefault · linkToFullPage · categories[]
Source: faqs Firestore (showOnHomepage=true, ordered by priority)
```

---

## Public > Homepage Section — newsletter

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [gradient/dark background]                                         │   │
│  │                                                                     │   │
│  │           Get New Drop Alerts                                       │   │
│  │  Be first to know about rare Pokémon listings, Hot Wheels STH       │   │
│  │  drops, Beyblade X imports, and LetItRip-exclusive auction events.  │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────┐   ┌──────────────────────┐   │   │
│  │  │  Enter your email address       │   │     Subscribe         │   │   │
│  │  └─────────────────────────────────┘   └──────────────────────┘   │   │
│  │                                                                     │   │
│  │  We respect your privacy. Unsubscribe anytime.                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
Component: NewsletterSection
Config fields: title · description · placeholder · buttonText ·
  privacyText · privacyLink
Form rendered via newsletterFormSlot render prop (client component)
```

---

## Public > Homepage Section — social-feed

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LetItRip on Instagram    @letitrip                                         │
│  Follow us for daily collection showcases and new drop alerts               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │ [post] │  │ [post] │  │ [post] │  │ [post] │  │ [post] │  │ [post] │  │
│  │ ♡ 234  │  │ ♡ 189  │  │ ♡ 412  │  │ ♡ 98   │  │ ♡ 320  │  │ ♡ 561  │  │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  │
│  ┌────────┐  ┌────────┐  ┌────────┐                                        │
│  │ [post] │  │ [post] │  │ [post] │                                        │
│  └────────┘  └────────┘  └────────┘                                        │
│                   (⏳ disabled — credentials not yet configured)             │
└─────────────────────────────────────────────────────────────────────────────┘
Component: SocialFeedSection
Config fields: title · subtitle · platform(instagram|facebook|tiktok|deviantart) ·
  handle · postType(all|images|videos|reels) · count(4–12) ·
  layout(grid|masonry|carousel) · showCaption · showStats
API key: integrations.instagramApiKey / integrations.facebookApiKey in siteSettings
```

---

## Public > Homepage Section — custom-cards

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Optional section heading]                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Layout: grid (3 columns)                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  [image]         │  │  [image]         │  │  [image]         │         │
│  │  EYEBROW         │  │  EYEBROW         │  │  EYEBROW         │         │
│  │  Card Title      │  │  Card Title      │  │  Card Title      │         │
│  │  Body text here  │  │  Body text here  │  │  Body text here  │         │
│  │  [Button]        │  │  [Button]        │  │  [Button]        │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                             │
│  Layout: row (horizontal scroller, 1 row)                                  │
│  ← [card] [card] [card] [card] [card] →                                   │
│                                                                             │
│  Layout: masonry (unequal heights)                                         │
│  ┌──────┐ ┌───────────┐ ┌──────┐ ┌──────────────┐                        │
│  │short │ │tall card  │ │short │ │medium card   │                        │
│  └──────┘ └───────────┘ └──────┘ └──────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
Component: CustomCardsSection
Config fields: title · layout(grid|row|masonry) · columns(1|2|3|4) ·
  cards[]{id,image,imageAlt,eyebrow,title,body,buttons[],backgroundColor,
    textColor,borderRadius,shadowLevel} · autoScroll · scrollIntervalMs
```

---

## Public > Homepage Section — google-reviews

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ★★★★★  4.9 · 124 reviews   [Open on Google Maps →]                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  Ravi Kumar       │  │  Priya Sharma    │  │  Arjun Mehta     │         │
│  │  ★★★★★            │  │  ★★★★★            │  │  ★★★★☆            │         │
│  │  "Great platform  │  │  "Excellent      │  │  "Good service,  │         │
│  │  for Pokémon      │  │  condition items │  │  slight delay    │         │
│  │  collectors..."   │  │  delivered fast" │  │  in shipping."   │         │
│  │  May 2026         │  │  Apr 2026        │  │  Apr 2026        │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
Component: GoogleReviewsSection
Config fields: placeId · maxReviews · minRating · layout(grid|carousel) ·
  showRating · showDate · linkToGoogleMaps · googleMapsUrl
API key: integrations.googlePlacesApiKey in siteSettings
```

---

## Public > Products Listing ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Products                                                                    │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  FILTERS     │  TOOLBAR: [🔍 q=…  🔍]  [⚙ Filters (N)]  [Sort ▾]  [⊞/≡]  [↺]  [Show sold ○] [Select]  │
│  ────────────│  ─────────────────────────────────────────────────────────── │
│  Category    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  [tree]      │  │ 🖼        │ │ 🖼        │ │ 🖼        │ │ 🖼        │       │
│              │  │ Product  │ │ Product  │ │ Product  │ │ Product  │       │
│  Brand       │  │ Title    │ │ Title    │ │ Title    │ │ Title    │       │
│  [checkboxes]│  │ ₹4,499   │ │ ₹6,999   │ │ ₹1,999   │ │ ₹2,999   │       │
│              │  │ ★★★★☆    │ │ ★★★★★    │ │ [NEW]    │ │ [SALE]   │       │
│  Price range │  │ [🛒 Add] │ │ [🛒 Add] │ │ [🛒 Add] │ │ [🛒 Add] │       │
│  [₹min–₹max] │  │ [♡]      │ │ [♡]      │ │ [♡]      │ │ [♡]      │       │
│              │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  Condition   │  ← Prev   Page 1 of 10   Next →                              │
│  [checkboxes]│                                                               │
│              │  Empty state: "No products match your filters"               │
│  [Clear All] │                                                               │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

> **Firestore query constraint (J13):** The standard-products query filters on
> `where("isAuction","==",false)` + `where("isPreOrder","==",false)`.
> Every standard product document **MUST** have both `isAuction: false` and
> `isPreOrder: false` explicitly set — Firestore `==` does NOT match absent fields.
> Required composite indexes: `(status ASC, isAuction ASC, createdAt DESC)` and
> `(status ASC, isAuction ASC, isPreOrder ASC, createdAt DESC)`.
> Both are in `appkit/firebase/base/firestore.indexes.json`.

---

## Public > Auctions Listing ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Live Auctions                                                               │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  FILTERS     │  [🔍 q=…  🔍]  [⚙ Filters (N)]  [Sort: Ending Soon ▾]  [⊞/≡]  [↺]  [Show ended ○]  │
│  Category    │                                                               │
│  Brand       │  ─────────────────────────────────────────────────────────── │
│  Starting bid│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  [₹min–₹max] │  │ 🖼        │  │ 🖼        │  │ 🖼        │                  │
│              │  │ Charizard│  │ Exodia   │  │ HW Pink  │                  │
│  [Clear All] │  │ PSA9     │  │ PSA8     │  │ Redline  │                  │
│              │  │ Bid:     │  │ Bid:     │  │ Bid:     │                  │
│              │  │ ₹2,99,999│  │ ₹62,000  │  │ ₹12,999  │                  │
│              │  │ ⏱ 12h left│  │ ⏱ 48h   │  │ ⏱ 6h    │                  │
│              │  │ [Bid Now]│  │ [Bid Now]│  │ [Bid Now]│                  │
│              │  └──────────┘  └──────────┘  └──────────┘                  │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## Public > Product Detail ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Home › Trading Cards › Pokémon Cards › Charizard ETB           │
├───────────────────────────┬─────────────────────────────────────────────────┤
│  IMAGE GALLERY            │  Charizard Base Set ETB — Sealed                │
│  ┌───────────────┐        │  ★★★★★ (47 reviews)   [Verified Seller ✓]      │
│  │               │        │                                                 │
│  │  Main Image   │        │  ₹4,499  ~~₹5,000~~  [SALE]                    │
│  │               │        │  Condition: Sealed   Stock: 12 left             │
│  └───────────────┘        │  Brand: Pokémon Company · Category: Pokémon TCG │
│  [🖼][🖼][🖼][🖼]          │                                                 │
│  [▶ YouTube]              │  ┌──────────────────────────────────────────┐  │
│                           │  │  Qty [1 ▾]  [🛒 Add to Cart]            │  │
│                           │  │            [Make Offer]  [♡ Wishlist]    │  │
│                           │  └──────────────────────────────────────────┘  │
│                           │                                                 │
│                           │  ┌──── Sold by ──────────────────────────────┐  │
│                           │  │  CardGame Hub          [Visit Store →]    │  │
│                           │  └───────────────────────────────────────────┘  │
├───────────────────────────┴─────────────────────────────────────────────────┤
│  SUB-LISTING SECTION (⏳ SC3) — shown if sublistingCategoryId is set        │
│                                                                              │
│  COLLAPSED (default):                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ▶  More listings like this: Base Set Charizard 108/120  (6)        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  EXPANDED (user clicks header):                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ▼  More listings like this: Base Set Charizard 108/120  (6)        │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │    │
│  │  │  ◯   │ │  ◯   │ │ ◉◉◉ │ │  ◯   │ │  ◯   │ │  ◯   │ View all→ │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │    │
│  │  PSA 10   BGS 9   [THIS]   Raw      CGC 9    PSA 8                 │    │
│  │  ₹3.2L    ₹2.8L   ₹4.5L   ₹80K     ₹2.1L    ₹1.9L                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  (circular ~64px cards; current highlighted with ring; click = navigate)   │
├─────────────────────────────────────────────────────────────────────────────┤
│  GROUP SECTION (⏳ GP1) — shown if groupId is set; products + pre-orders    │
│                                                                              │
│  COLLAPSED (default):                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ▶  Part of: Human Toy Complete Set  (5 parts)                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  EXPANDED (user clicks header):                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ▼  Part of: Human Toy Complete Set  (5 parts)  [View whole group→] │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │    │
│  │  │ ◉◉◉ │ │  ◯   │ │  ◯   │ │  ◯   │ │  ◯   │                    │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                    │    │
│  │  [THIS]   Legs     Arms     Torso    Cape                           │    │
│  │  ₹4,500   ₹1,200   ₹990    ₹1,500   ₹2,100                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  (circular ~64px selectable cards; current has ring highlight; click=nav)  │
│                                                                              │
│  "View whole group" Modal (opens on button click):                          │
│  ┌──── GROUP: Human Toy Complete Set ─────────────────────────────────┐    │
│  │  [🖼] Head (THIS)   New      ₹4,500   [View]                       │    │
│  │  [🖼] Legs          Used     ₹1,200   [View] [Preview ▾]           │    │
│  │  [🖼] Arms          New      ₹990     [View]                       │    │
│  │  [🖼] Torso         New      ₹1,500   [View]                       │    │
│  │  [🖼] Cape          Sealed   ₹2,100   [View]                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│  TABS: [Description] [Specifications] [Reviews (47)] [Custom Sections...]   │
│  ────────────────────────────────────────────────────────────────────────── │
│  TAB: Description — [RichTextRenderer]                                       │
│  TAB: Specifications — custom fields table                                   │
│  TAB: Reviews — ReviewSummary + ReviewsList                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  BELOW FOLD:                                                                 │
│  "More from CardGame Hub" → [product carousel]                               │
│  "Similar Products" → [product carousel]                                     │
└─────────────────────────────────────────────────────────────────────────────┘

STICKY BUY BAR (on scroll past buy box):
┌───────────────────────────────────────────────────────────┐
│ 🖼 Charizard ETB  ₹4,499  [🛒 Add to Cart]  [Make Offer] │
└───────────────────────────────────────────────────────────┘
```

---

## Public > Auction Detail ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Charizard Base Set #4 — PSA 9                                               │
├───────────────────────────┬─────────────────────────────────────────────────┤
│  IMAGE GALLERY            │  AUCTION STATUS                                  │
│  [same as product]        │  ⏱ Ends in: 12:34:56   [LIVE]                  │
│                           │  Current Bid: ₹2,99,999   (47 bids)             │
│                           │  Starting Bid: ₹99,999                           │
│                           │  Reserve: Met ✓                                 │
│                           │  Bid Increment: ₹5,000                          │
│                           │  [Trading Cards] · [Pokémon Company]            │
│                           │                                                 │
│                           │  ┌──────────────────────────────────────────┐  │
│                           │  │  Your Bid ₹ [input min ₹3,04,999]        │  │
│                           │  │  [Place Bid] — opens PlaceBidForm        │  │
│                           │  └──────────────────────────────────────────┘  │
│                           │  [♡ Watch Auction]                              │
│                           │                                                 │
│                           │  ┌──── Listed by ────────────────────────────┐ │
│                           │  │  CardGame Hub          [Visit Store →]    │ │
│                           │  └───────────────────────────────────────────┘ │
├───────────────────────────┴─────────────────────────────────────────────────┤
│  SUB-LISTING SECTION (⏳ SC3) — same collapsible section as Product Detail  │
│  COLLAPSED: ▶  More listings like this: [category name]  (N)               │
│  EXPANDED:  ▼  [circular ~64px card scroller + View all →]                 │
│  (current highlighted; click = navigate; collapsed by default)             │
├─────────────────────────────────────────────────────────────────────────────┤
│  TABS: [Description] [Bid History] [Specifications] [Reviews]               │
│  TAB: Bid History                                                            │
│  Bidder*    Amount      Time           Status                                │
│  Ravi K.    ₹2,99,999   May 08 14:32   Leading                               │
│  Priya S.   ₹2,50,000   May 08 12:01   Outbid                               │
│  * Masked: first name + last initial only                                   │
│  NOTE: GP1 (group row) is NOT shown on auction detail pages                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Store Detail ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────── BANNER IMAGE ──────────────────────────────┐   │
│  │  [🖼 Store Logo]  CardGame Hub  ★★★★★ (124 reviews)  [Verified ✓]  │   │
│  │  "India's best Pokémon & Yu-Gi-Oh! card store"                      │   │
│  │  47 products   Since Apr 2026   [Follow Store]                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│  TABS: [Products] [Auctions] [Reviews] [About]                              │
│  ────────────────────────────────────────────────────────────────────────── │
│  TAB: Products → StoreProductsView (product grid with filters)              │
│  TAB: Auctions → StoreAuctionsView (auction grid)                           │
│  TAB: Reviews  → StoreReviewsView (review list + summary)                   │
│  TAB: About    → store description (RichTextRenderer) + pickup addresses    │
│                  + HS4-E: Google Reviews (if configured, ⏳)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Categories Listing ✅

```
Route: /categories  →  CategoriesIndexPageView (RSC)
Shell: Main > Section > Container(xl) — NOT ListingLayout
Client: CategoriesIndexListing — useUrlTable + useCategoriesFiltered

┌─────────────────────────────────────────────────────────────────────────────┐
│  LetiTrip header (sticky, --header-height)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  AdSlot (listing-sidebar-top)                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  [All]  [Categories]  [Brands]   ← tab bar (hidden when brandsOnly=true)    │
├─────────────────────────────────────────────────────────────────────────────┤
│  sticky ListingToolbar:                                                      │
│  [🔍 Search categories…  🔍]  [⚙ Filters (N)]  [Sort: Name A–Z ▾]  [↺]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  sticky Pagination (when totalPages > 1):                                    │
│  ← 1  2  3 →                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  grid-cols-2 sm:3 lg:4 xl:5 gap-4                                           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │🖼 cover│ │🖼 cover│ │🖼 cover│ │🖼 cover│ │🖼 cover│                   │
│  │Action  │ │Trading │ │Diecast │ │Tops    │ │Model   │                   │
│  │Figures │ │Cards   │ │Vehicles│ │        │ │Kits    │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                              │
│  Empty state: "No categories matching "…" " (search) / "No categories found"│
│  Loading state: animate-pulse skeleton grid (same columns)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  AdSlot (listing-sidebar-bottom)                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Filter Drawer (fixed overlay, slides from LEFT, z-50):
┌────────────────────────────────┐
│  Filters             [Clear all] [✕] │
├────────────────────────────────┤
│  CategoryFilters (variant=public):   │
│    Featured only  [chk]              │
│    Brands only    [chk]              │
│    Root only      [chk]              │
│    Tier           [sel]              │
│    Min products   [input]            │
│    Max products   [input]            │
├────────────────────────────────┤
│  [Apply Filters (N)]                 │
└────────────────────────────────┘
  Black overlay behind drawer (click → close)
```

---

## Public > Category Detail ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Categories › Trading Cards › Pokémon Cards                     │
│  [🖼 cover] Pokémon Cards   (847 products)                                  │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  FILTERS     │  SUB-CATEGORIES (if any)                                     │
│  Brand       │  [Sealed Products] [Singles] [Graded Cards]                  │
│  Price       │  ─────────────────────────────────────────────────────────── │
│  Condition   │  [Product grid — same as Products listing]                   │
│  Sort        │                                                               │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## Public > Brands Listing ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Brands                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ 🖼   │ │ 🖼   │ │ 🖼   │ │ 🖼   │ │ 🖼   │ │ 🖼   │ │ 🖼   │          │
│  │Bandai│ │Hasbro│ │Takara│ │Mattel│ │Pokéco│ │Konami│ │Funko │          │
│  │Japan │ │USA   │ │Japan │ │USA   │ │Japan │ │Japan │ │USA   │          │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Events Listing ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Events                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Upcoming] [Active] [Ended]   [Type: All/Tournament/Convention/Meetup/Sale] │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │ 🖼 cover   Pokémon TCG Tournament — June 2026   TOURNAMENT [LIVE] │      │
│  │            Jun 15, 2026 · Online · 234 entries  [Register →]     │      │
│  └───────────────────────────────────────────────────────────────────┘      │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │ 🖼 cover   LetiTrip Summer Sale 2026              SALE [UPCOMING] │      │
│  │            Jul 01–07, 2026 · Online              [Notify Me]     │      │
│  └───────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

> **Default filter constraint (J15):** `EventsListPageView.buildEventFilters()`
> defaults to `status==active`. Valid event statuses are DRAFT/ACTIVE/PAUSED/ENDED.
> There is NO "published" status — using `status==published` returns 0 results and
> `staleTime:Infinity` prevents client refetch. Default tab = Active.

---

## Public > Event Detail ✅ (reference impl for render props)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [🖼 cover banner]                                                            │
│  Pokémon TCG Tournament — June 2026   [TOURNAMENT] [LIVE]                   │
│  Jun 15, 2026  ·  Online  ·  234 entries / 500 max                          │
│  Organized by: LetiTrip Official                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  TABS: [About] [Rules] [Schedule] [Results]                                  │
│  TAB: About — [RichTextRenderer for description]                             │
│               [Register Button — PlaceBidForm-style modal]                  │
│  TAB: Rules  — [RichTextRenderer]                                            │
│  TAB: Schedule — event timeline                                              │
│  TAB: Results — winner entries (if ended)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Blog Listing ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Blog  [🔍 Search posts...]  [Category ▾]                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  FEATURED                                                                    │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ 🖼 large cover                                           │               │
│  │ How to Grade Pokémon Cards — A Complete Guide 2026       │               │
│  │ TCG · 8 min read · May 01 · by Admin LetiTrip  [Read →] │               │
│  └─────────────────────────────────────────────────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                                    │
│  │🖼 cover  │ │🖼 cover  │ │🖼 cover  │                                    │
│  │Top 10 HW │ │Beyblade X│ │Funko Pop │                                    │
│  │2026      │ │Guide     │ │Investing │                                    │
│  │6 min read│ │5 min read│ │4 min read│                                    │
│  └──────────┘ └──────────┘ └──────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

> **SSR → client data shape (J14):** `BlogIndexPageView` (RSC) fetches via
> `blogRepository.listPublished()` → `FirebaseSieveResult { items, total, … }`.
> This MUST be transformed to `BlogListResponse { posts, meta }` before passing as
> `initialData` to `BlogIndexListing`. If passed raw, `posts` is undefined → empty
> list → `staleTime:Infinity` locks the empty state (since `initialData !== undefined`).
> Pass `undefined` (not `null`) when SSR fails so the client fetches fresh.

---

## Public > FAQs ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frequently Asked Questions    [🔍 Search FAQs...]                          │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  CATEGORIES  │  RESULTS                                                      │
│  [All]       │  ─────────────────────────────────────────────────────────── │
│  [Shipping]  │  ▾ How does bidding work?                                     │
│  [Returns]   │    Bidding on LetiTrip works like a real-time auction...     │
│  [Payments]  │    [👍 Helpful (24)] [👎 Not helpful (2)]                    │
│  [Auctions]  │  ─────────────────────────────────────────────────────────── │
│  [Pre-orders]│  ▸ What payment methods are accepted?                         │
│              │  ▸ Can I return an item?                                      │
│              │  ▸ How long does shipping take?                               │
│              │  ▸ Are all items authentic/verified?                          │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## Public > Search ✅ (→ SR1 redesign planned)

```
Current (before SR1):
┌─────────────────────────────────────────────────────────────────────────────┐
│  Search: "charizard"                                                         │
│  TABS: [Products (24)] [Auctions (6)] [Stores (2)] [Blog (3)] [Events (1)] │
│  [product grid — same as Products listing]                                  │
└─────────────────────────────────────────────────────────────────────────────┘

After SR1 (planned):
Submitting search navigates to /products?q=charizard (default type=products)
No more search-specific results page — listing pages handle ?q= param directly
```

---

## Public > Cart ✅ (partial)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Cart  (3 items)                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  IN STOCK                                                                    │
│  🖼 Charizard ETB       ₹4,499   Qty [1 ▾]  [View →] [🗑]                 │
│  🖼 Pikachu Plush ×2   ₹2,598   Qty [2 ▾]  [View →] [🗑]                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  OUT OF STOCK (⏳ W3)                                                        │
│  🖼 Hot Wheels RLC      [OUT OF STOCK]       [View →] [🗑]                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Coupon: [WELCOME10    ] [Apply]                                             │
│  Subtotal:  ₹7,097                                                           │
│  Discount:  -₹710 (WELCOME10 10%)                                           │
│  Shipping:  ₹50                                                              │
│  Total:     ₹6,437                                                           │
│  [Proceed to Checkout →]  (disabled if only out-of-stock items)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Checkout ✅ (stub)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Checkout                                                                    │
│  [① Address] [② Shipping] [③ Payment] [④ Confirm]                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  STEP ① Address                                                              │
│    Saved addresses (radio):                                                  │
│    (•) 🏠 Home — 123 MG Road, Mumbai 400050                                 │
│    ( ) 🏢 Office — 45 BKC, Kurla, Mumbai                                    │
│    [ + Add New Address (inline AddressForm) ]                               │
│    [Continue →]                                                              │
│                                                                              │
│  STEP ② Shipping                                                             │
│    (•) Standard — ₹50 (3–5 days)                                            │
│    ( ) Express  — ₹150 (1–2 days)                                           │
│    ( ) Pickup   — Free (from CardGame Hub warehouse)                         │
│    [Continue →]                                                              │
│                                                                              │
│  STEP ③ Payment                                                              │
│    (•) Razorpay (UPI/Card/NetBanking)                                       │
│    ( ) COD — ₹25 fee                                                        │
│    [Pay ₹6,437 →] → opens Razorpay modal                                   │
│                                                                              │
│  STEP ④ Confirm / Success                                                   │
│    ✓ Order placed! #order-3-0508-a1b2c3                                     │
│    [View Order] [Continue Shopping]                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > About ✅

```
Component: src/app/[locale]/about/page.tsx → AboutView (appkit)
Data: getTranslations("about") + siteSettings.aboutContent.* (Firestore override)
Admin: Site Settings → ⓪ About tab

┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO BANNER (gradient violet→indigo)                                        │
│    H1: "About LetItRip"              ← siteSettings.aboutContent.title      │
│    Subtitle: "Connecting buyers, sellers, and bidders…"                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  OUR MISSION                                                                 │
│    H2: "Our Mission"                 ← siteSettings.aboutContent.missionTitle│
│    Body: "LetItRip was built to democratise commerce…"                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS  (3-column grid)                                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │  🛒 For Buyers  │ │ 🏪 For Sellers  │ │ ⚡ For Bidders  │               │
│  │  Browse & shop  │ │ Create & earn   │ │ Bid & win       │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│  OUR VALUES  (3-column grid)                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │  🛡️ Trust+Safety│ │ 🤝 Community    │ │ 🚀 Innovation   │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│  OUR JOURNEY  (timeline)                                                     │
│    2024  Founded with a vision to simplify multi-seller commerce             │
│    2025  Launched real-time auction engine with auto-bid support             │
│    2026  Mobile-first redesign reaching thousands of new users               │
├─────────────────────────────────────────────────────────────────────────────┤
│  CTA BANNER (gradient)                                                       │
│    H2: "Ready to get started?"       ← siteSettings.aboutContent.ctaTitle   │
│    renderCtaButtons() slot → e.g. [Become a Seller] [Start Shopping]        │
└─────────────────────────────────────────────────────────────────────────────┘

Empty state: all sections render with placeholder text (all props have defaults in AboutView)
```

---

## Public > Privacy Policy ✅

```
Component: src/app/[locale]/privacy/page.tsx → PolicyPageView policy="privacy"
Data: siteSettings.legalPages.privacy (Firestore HTML, admin-set) → i18n "privacy" namespace
Admin: Site Settings → ⑫ Legal tab → Privacy Policy textarea

┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO (gradient violet→indigo)                                               │
│    H1: "Privacy Policy"                                                      │
│    "Last updated: January 1, 2025"                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  IF admin HTML set → <div dangerouslySetInnerHTML> (prose styled)            │
│  ELSE i18n sections:                                                         │
│    Intro paragraph                                                           │
│    1. Information We Collect                                                 │
│    2. How We Use Your Information                                            │
│    3. Sharing Your Information                                               │
│    4. Data Security                                                          │
│    5. Your Rights                                                            │
│    6. Cookies                                                                │
│    7. Changes to this Policy                                                 │
│    Contact                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  RELATED POLICIES                                                            │
│    [Terms of Service]  [Cookie Policy]  [Refund Policy]                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Terms of Service ✅

```
Component: src/app/[locale]/terms/page.tsx → PolicyPageView policy="terms"
Data: siteSettings.legalPages.terms (Firestore HTML) → i18n "terms" namespace
Admin: Site Settings → ⑫ Legal tab → Terms of Service textarea

┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO (gradient violet→indigo)                                               │
│    H1: "Terms & Conditions"                                                  │
│    "Last updated: January 1, 2025"                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  IF admin HTML set → <div dangerouslySetInnerHTML> (prose styled)            │
│  ELSE i18n sections:                                                         │
│    1. Acceptance of Terms                                                    │
│    2. Use of the Platform                                                    │
│    3. User Accounts                                                          │
│    4. Seller Responsibilities                                                │
│    5. Auction Rules                                                          │
│    6. Limitation of Liability                                                │
│    7. Changes to Terms                                                       │
│    Questions?                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  RELATED POLICIES                                                            │
│    [Privacy Policy]  [Cookie Policy]  [Refund Policy]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Cookie Policy ✅

```
Component: src/app/[locale]/cookies/page.tsx → PolicyPageView policy="cookies"
Data: siteSettings.legalPages.cookies (Firestore HTML) → i18n "cookies" namespace
Admin: Site Settings → ⑫ Legal tab → Cookie Policy textarea

┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO (gradient violet→indigo)                                               │
│    H1: "Cookie Policy"                                                       │
│    "Last updated: March 2, 2026"                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  IF admin HTML set → <div dangerouslySetInnerHTML>                           │
│  ELSE i18n sections:                                                         │
│    What Are Cookies?                                                         │
│    Types of Cookies We Use                                                   │
│    Essential Cookies                                                         │
│    Analytics Cookies                                                         │
│    Marketing Cookies                                                         │
│    Managing Your Cookie Preferences                                          │
│    Third-Party Cookies                                                       │
│    Changes to This Policy                                                    │
│    Contact Us                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  RELATED POLICIES                                                            │
│    [Privacy Policy]  [Terms of Service]  [Refund Policy]                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Refund Policy ✅

```
Component: src/app/[locale]/refund-policy/page.tsx → PolicyPageView policy="refund"
Data: siteSettings.legalPages.refundPolicy (Firestore HTML) → i18n "refundPolicy" namespace
Admin: Site Settings → ⑫ Legal tab → Refund Policy textarea

┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO (gradient violet→indigo)                                               │
│    H1: "Refund Policy"                                                       │
│    "Last updated: March 2, 2026"                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  IF admin HTML set → <div dangerouslySetInnerHTML>                           │
│  ELSE i18n sections:                                                         │
│    Refund Eligibility                                                        │
│    How to Initiate a Refund                                                  │
│    Refund Timeline                                                           │
│    Auction Purchases                                                         │
│    Exchanges                                                                 │
│    Return Shipping                                                           │
│    Non-Refundable Items                                                      │
│    Need Help?                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  RELATED POLICIES                                                            │
│    [Privacy Policy]  [Terms of Service]  [Cookie Policy]                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Shipping Policy ✅

```
Component: src/app/[locale]/shipping-policy/page.tsx → ShippingPolicyView (appkit)
Data: i18n "shippingPolicy" namespace (static; no Firestore override currently)
Note: ShippingPolicyView has its own flat-key i18n structure (not sections array)

┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO (gradient violet→indigo)                                               │
│    H1: "Shipping Policy"                                                     │
│    "Last updated: March 12, 2026"                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Subtitle paragraph                                                          │
│  FLOW DIAGRAM: Order Placed → Seller Preparing → Dispatched                 │
│                → In Transit → Delivered                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Order Process        │  Standard Shipping    │  Express Shipping            │
│  Free Shipping        │  Auction Shipping     │  Tracking Your Order         │
│  International Shipping (India only)          │  Damaged or Lost Items       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Questions about shipment? → [Help Center] [Contact Us] [Refund Policy]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Auth > Login ✅

```
┌──────────────────────────────────┐
│  [LetiTrip Logo]                 │
│  Sign In to LetiTrip             │
├──────────────────────────────────┤
│  Email    [input]                │
│  Password [input 👁]             │
│  [Forgot Password?]              │
│  [Sign In]                       │
│  ─── or ───                      │
│  [G Google]  [f Facebook]        │
│  ─────────────────────────────── │
│  No account? [Sign Up →]         │
└──────────────────────────────────┘
```

---

## Auth > Register ✅

```
┌──────────────────────────────────┐
│  Create your LetiTrip account    │
├──────────────────────────────────┤
│  Display Name [input]            │
│  Email        [input]            │
│  Password     [input 👁]         │
│  [Password strength meter]       │
│  Confirm Pass [input 👁]         │
│  [I agree to Terms] [chk]        │
│  [Create Account]                │
│  ─── or ───                      │
│  [G Google]  [f Facebook]        │
│  Already have one? [Sign In →]   │
└──────────────────────────────────┘
```

---

## Auth > Forgot Password ✅

```
┌──────────────────────────────────┐
│  Reset your password             │
├──────────────────────────────────┤
│  Email [input]                   │
│  [Send Reset Link]               │
│  ─────────────────────────────── │
│  ✓ Check your inbox! (post-send) │
│  [Back to Sign In]               │
└──────────────────────────────────┘
```

---

## SeedPanel > Collection Card (expanded)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ☐  products           20 / 20 seeded  ██████████  🔑 product-{slug}         │
│                       🖼 images[]  PII: none   [UI: /admin/products]         │
│ [▼ Schema fields]                                                            │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Field           Type     Searchable  Filterable  Sortable  PII  Indexed      │
│ id              string   ✗           ✗           ✗         ✗    ✓            │
│ title           string   ✓           ✗           ✓         ✗    ✗            │
│ storeId         string   ✗           ✓           ✗         ✗    ✓            │
│ brandSlug       string   ✗           ✓           ✗         ✗    ✓            │
│ categorySlug    string   ✗           ✓           ✗         ✗    ✓            │
│ price           number   ✗           ✓           ✓         ✗    ✓            │
│ status          string   ✗           ✓           ✗         ✗    ✓            │
│ isFeatured      boolean  ✗           ✓           ✗         ✗    ✓            │
│ isPromoted      boolean  ✗           ✓           ✗         ✗    ✓            │
│ createdAt       date     ✗           ✓           ✓         ✗    ✓            │
│ [+ 40 more fields...]                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

---

## Admin > Stores > Store Editor SideDrawer (N3 additions)

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Manage: store-mistys-water-cards                              │
├─────────────────────────────────────────────────────────────────┤
│ Status        [dropdown: active ▼]                              │
│ Featured      [toggle: off]                                     │
│ Verified      [toggle: on]          ← NEW (N3)                  │
│ ─────────────────────────────────────────────────────────────── │
│ Suspension Reason (optional)        ← NEW (N3, shown when       │
│ ┌──────────────────────────────┐      status === "suspended")   │
│ │ e.g. Policy violations…      │                                │
│ └──────────────────────────────┘                                │
│ ─────────────────────────────────────────────────────────────── │
│ Admin Notes (optional)                                          │
│ ┌──────────────────────────────┐                                │
│ │ Internal notes…              │                                │
│ └──────────────────────────────┘                                │
│                   [Delete store] [Cancel] [Save changes]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin > Users (AdminUsersView + AdminUserEditorView)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN > USERS                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Search…]                    Role [All ▼]   [Refresh]                        │
├────────────────────┬──────────────────┬────────────┬───────────┬────────────┤
│ Name               │ Email            │ Role       │ Status    │ Actions    │
├────────────────────┼──────────────────┼────────────┼───────────┼────────────┤
│ Ravi Kumar         │ ravi@…           │ seller     │ ● active  │ [⋮]        │
│ Priya Sharma       │ priya@…          │ admin      │ ● active  │ [⋮]        │
│ Guest User         │ guest@…          │ user       │ ✗ banned  │ [⋮]        │
├────────────────────┴──────────────────┴────────────┴───────────┴────────────┤
│ 15 users                                                                     │
└──────────────────────────────────────────────────────────────────────────────┘

RowActionMenu [⋮]:
  • Manage  → opens SideDrawer

SideDrawer — Manage: Ravi Kumar
┌─────────────────────────────────────────────────────────────────┐
│ ← Manage: Ravi Kumar                                            │
├─────────────────────────────────────────────────────────────────┤
│ Role          [dropdown: seller ▼]  (user / seller / admin)    │
│ ─────────────────────────────────────────────────────────────── │
│ Account disabled (banned)  [toggle: off]                        │
│   Ban reason (optional)  [shown when toggle on]                 │
│   ┌──────────────────────────────┐                              │
│   │ e.g. Repeated violations…   │                              │
│   └──────────────────────────────┘                              │
│ ─────────────────────────────────────────────────────────────── │
│ Email verified  [toggle: on]                                    │
│ ─────────────────────────────────────────────────────────────── │
│ Admin notes (optional)                                          │
│ ┌──────────────────────────────┐                                │
│ │ Internal notes about user…   │                                │
│ └──────────────────────────────┘                                │
│              [Delete user] [Cancel] [Save changes]              │
└─────────────────────────────────────────────────────────────────┘

ConfirmDeleteModal — Delete Ravi Kumar?
┌─────────────────────────────────────────────────────────────────┐
│  Delete Ravi Kumar?                                             │
│  This action cannot be undone. The user's account and all       │
│  associated data will be permanently removed.                   │
│                              [Cancel] [Delete user]             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin > Orders (AdminOrdersView + AdminOrderEditorView)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN > ORDERS                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Search…]           Status [All ▼]   [Refresh]                               │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────┤
│ Order ID     │ Buyer        │ Store        │ Total        │ Status     │ ⋮   │
├──────────────┼──────────────┼──────────────┼──────────────┼────────────┼─────┤
│ order-3-…    │ Ravi Kumar   │ Misty's…     │ ₹1,499       │ SHIPPED    │ [⋮] │
│ order-1-…    │ Priya S.     │ Goku's…      │ ₹2,200       │ DELIVERED  │ [⋮] │
│ order-2-…    │ Amit K.      │ Retro…       │ ₹850         │ PENDING    │ [⋮] │
└──────────────┴──────────────┴──────────────┴──────────────┴────────────┴─────┘

RowActionMenu [⋮]:
  • Update order  → opens SideDrawer

SideDrawer — Update order-3-20260508-a1b2c3
┌─────────────────────────────────────────────────────────────────┐
│ ← Update order-3-20260508-a1b2c3                                │
├─────────────────────────────────────────────────────────────────┤
│ Status   [dropdown: SHIPPED ▼]                                  │
│          (PENDING/PROCESSING/SHIPPED/DELIVERED/                 │
│           CANCELLED/REFUNDED/RETURN_REQUESTED)                  │
│ ─────────────────────────────────────────────────────────────── │
│ Tracking Number                                                 │
│ [TRK123456789…                ]                                 │
│ Carrier  [dropdown: Delhivery ▼]                                │
│          (Delhivery/BlueDart/DTDC/Ekart/India Post/Other)       │
│ ─────────────────────────────────────────────────────────────── │
│ Refund Amount (paise)   ← shown when status=REFUNDED or         │
│ [149900               ]   RETURN_REQUESTED                      │
│ ─────────────────────────────────────────────────────────────── │
│ Notes (optional)                                                │
│ ┌──────────────────────────────┐                                │
│ │ Internal notes…              │                                │
│ └──────────────────────────────┘                                │
│                        [Cancel] [Save changes]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin > Reviews (AdminReviewsView — with moderation)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN > REVIEWS                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Search…]       Status [All ▼]   Rating [All ▼]   [Refresh]                 │
├──────────────┬───────────┬────────┬──────────────┬────────────┬──────────────┤
│ Product      │ Buyer     │ Rating │ Status       │ Featured   │ Actions      │
├──────────────┼───────────┼────────┼──────────────┼────────────┼──────────────┤
│ Charizard… │ Ravi K.   │ ★★★★★  │ ● approved   │ ★ yes      │ [⋮]          │
│ Hot Wheels…  │ Priya S.  │ ★★★★☆  │ ○ pending    │ —          │ [⋮]          │
│ Beyblade…    │ Amit K.   │ ★★★☆☆  │ ✗ rejected   │ —          │ [⋮]          │
└──────────────┴───────────┴────────┴──────────────┴────────────┴──────────────┘

RowActionMenu [⋮]:
  • Approve       → PATCH status=approved
  • Reject        → PATCH status=rejected
  • ─────────────
  • Feature       → PATCH isFeatured=true  (shows "Unfeature" when already featured)
  • Reply         → opens Reply Modal
  • View          → opens ViewReviewModal

Reply Modal (1 field → Modal, not SideDrawer)
┌─────────────────────────────────────────────────────────────────┐
│  Reply to review                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Thank you for your feedback…                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                        [Cancel] [Post reply]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin > Sessions (AdminSessionsView — LL11)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN > SESSIONS                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Active only [toggle: off]                              [Refresh]             │
├──────────────────┬─────────────────────────┬──────────────┬──────────────────┤
│ User             │ Device / IP             │ Last Active  │ Expires    │ ⋮  │
├──────────────────┼─────────────────────────┼──────────────┼────────────┼────┤
│ Ravi Kumar       │ Chrome · Win · 103.*.   │ 2 hrs ago    │ 2026-06-08 │[⋮] │
│ Priya Sharma     │ Safari · iOS · 49.*     │ 1 day ago    │ 2026-05-15 │[⋮] │
│ (guest)          │ Firefox · Mac · 182.*   │ 5 min ago    │ 2026-05-10 │[⋮] │
├──────────────────┴─────────────────────────┴──────────────┴────────────┴────┤
│ Active badge: ● active / ✗ expired                                           │
│ IP masked: last octet replaced with *                                        │
└──────────────────────────────────────────────────────────────────────────────┘

RowActionMenu [⋮]:
  • Revoke session  (destructive) → ConfirmDeleteModal → DELETE /api/admin/sessions/{id}

ConfirmDeleteModal — Revoke session?
┌─────────────────────────────────────────────────────────────────┐
│  Revoke session?                                                │
│  The user will be signed out immediately.                       │
│                              [Cancel] [Revoke]   (variant=warn) │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin > Event Entries (AdminAllEventEntriesView — LL12)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN > ALL EVENT ENTRIES                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Search…]           Status [All ▼]   [Refresh]                               │
│                     (All / CONFIRMED / WAITLISTED / CANCELLED)               │
├──────────────────┬──────────────────┬────────────────┬────────────┬──────────┤
│ User             │ Email            │ Event ID       │ Status     │ Actions  │
├──────────────────┼──────────────────┼────────────────┼────────────┼──────────┤
│ Ravi Kumar       │ ravi@…           │ event-summer-… │ CONFIRMED  │ [⋮]      │
│ Priya Sharma     │ priya@…          │ event-blader-… │ WAITLISTED │ [⋮]      │
│ Amit Kumar       │ amit@…           │ event-summer-… │ CANCELLED  │ [⋮]      │
└──────────────────┴──────────────────┴────────────────┴────────────┴──────────┘

RowActionMenu [⋮]:
  • Confirm    → PATCH status=CONFIRMED
  • Waitlist   → PATCH status=WAITLISTED
  • ─────────
  • Cancel     (destructive) → PATCH status=CANCELLED
```

---

## Admin > Notifications (AdminNotificationsView — LL13)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN > NOTIFICATIONS                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Search…]           Type [All ▼]   [Refresh]                                 │
│                     (All / order_shipped / bid_outbid / review_reply / …)    │
├───────────────────┬────────────────┬──────────────┬──────────┬───────────────┤
│ User              │ Type           │ Title        │ Read     │ Actions       │
├───────────────────┼────────────────┼──────────────┼──────────┼───────────────┤
│ Ravi Kumar        │ order_shipped  │ Your order…  │ ✓ read   │ [⋮]           │
│ Priya Sharma      │ bid_outbid     │ You've been… │ ○ unread │ [⋮]           │
│ Amit Kumar        │ review_reply   │ Seller repli…│ ○ unread │ [⋮]           │
└───────────────────┴────────────────┴──────────────┴──────────┴───────────────┘

RowActionMenu [⋮]:
  • Resend     → POST /api/admin/notifications/{id}/resend (marks isRead=false)
  • ─────────
  • Delete     (destructive) → ConfirmDeleteModal → DELETE /api/admin/notifications/{id}
```

---

## Admin > Carts (AdminCartsView — LL14)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN > CARTS                         (read-only diagnostic view)            │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Search…]         Type [All ▼]   [Refresh]                                   │
│                   (All / authenticated / guest)                              │
├───────────────────┬──────────────────┬─────────────┬──────────┬──────────────┤
│ Cart ID           │ User / Session   │ Items       │ Type     │ Updated      │
├───────────────────┼──────────────────┼─────────────┼──────────┼──────────────┤
│ xK9mP2…           │ Ravi Kumar       │ 3 items     │ auth     │ 2 hrs ago    │
│ aB3nQ7…           │ (guest) sess-…   │ 1 item      │ guest    │ 5 min ago    │
│ mL8vR4…           │ Priya Sharma     │ 5 items     │ auth     │ 1 day ago    │
└───────────────────┴──────────────────┴─────────────┴──────────┴──────────────┘
  No row actions — read-only view for diagnostic purposes.
```

---

## Admin > Wishlists (AdminWishlistsView — LL15)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN > WISHLISTS                     (read-only insights view)              │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Search…]                                              [Refresh]             │
├───────────────────┬──────────────────┬──────────────┬──────────┬─────────────┤
│ Product           │ User ID          │ Price at Add │ Added At │ Product ID  │
├───────────────────┼──────────────────┼──────────────┼──────────┼─────────────┤
│ Hot Wheels Redlin…│ user-ravi-kumar  │ ₹1,499       │ 3 days   │ product-hw… │
│ Charizard PSA 9   │ user-priya-s     │ ₹24,999      │ 1 week   │ product-ch… │
│ Beyblade Burst    │ user-amit-k      │ ₹899         │ 2 weeks  │ product-bb… │
└───────────────────┴──────────────────┴──────────────┴──────────┴─────────────┘
  Data source: Firestore collectionGroup("wishlist") — cross-user subcollection query.
  No row actions — read-only insights view.
```

---

## Architecture > Store Identity (ARCH2/ARCH5/ARCH8 — storeId migration)

> Completed Session 81. Documents the canonical identity model enforced across all collections.

```
IDENTITY MODEL
═══════════════════════════════════════════════════════════════════════

  Firebase Auth UID (e.g. "UqVkpXa2mTn9…")
      │
      └─► StoreDocument.ownerId          ← ONLY place UID is stored
              │                             on the store record
              └─► StoreDocument.id = storeSlug  ← public identity
                    (e.g. "store-pokemon-palace")

  storeId === store.id === storeSlug    (always the same value)
  ownerId === Firebase Auth UID         (internal/auth only)

─────────────────────────────────────────────────────────────────────

  COLLECTION FIELD RULES
  ┌─────────────────────┬───────────────────┬─────────────────────┐
  │ Collection          │ Public field      │ Internal only       │
  ├─────────────────────┼───────────────────┼─────────────────────┤
  │ products            │ storeId, storeName│ —                   │
  │ orders              │ storeId, storeName│ —                   │
  │ cart items          │ storeId, storeName│ —                   │
  │ offers              │ storeId, storeName│ —                   │
  │ payouts             │ storeId           │ sellerName (display) │
  │ coupons             │ storeId           │ —                   │
  │ conversations       │ storeId           │ —                   │
  │ reviews             │ storeId, storeName│ —                   │
  │ stores              │ id (= storeSlug)  │ ownerId (Auth UID)  │
  └─────────────────────┴───────────────────┴─────────────────────┘

─────────────────────────────────────────────────────────────────────

  TWO-STEP LOOKUP PATTERN
  (used when Auth UID → store context is needed server-side)

  Seller action / API handler:
    userId (Auth UID, from session)
        │
        ▼
    storeRepository.findByOwnerId(userId)
        │
        ├─► store.id  ──────────────────► Firestore queries by storeId
        │   (storeSlug)
        │
        └─► store.ownerId ──────────────► Authorization guard
                                         (= same userId, confirms ownership)

  Examples:
    listSellerCoupons(userId)  →  findByOwnerId → getStoreCoupons(store.id)
    listSellerOffers(userId)   →  findByOwnerId → findByStore(store.id)
    listSellerMyProducts(userId) → findByOwnerId → findByStore(store.id)
    store/offers GET           →  findByOwnerId → findByStore(store.id)
    store/payouts GET          →  findByOwnerId → early-return if null
    delete-account DELETE      →  findByOwnerId → deleteByStore(store.id)

─────────────────────────────────────────────────────────────────────

  CHECKOUT SHIPPING LOOKUP (three-step)

    CartItem.storeId (e.g. "store-pokemon-palace")
        │
        ▼
    storeRepository.findById(storeId)      ← step 1
        │
        └─► store.ownerId  (Auth UID)
                │
                ▼
            userRepository.findById(ownerId)   ← step 2
                │
                └─► user.shippingConfig         ← used for shipping rates

─────────────────────────────────────────────────────────────────────

  ORDER AUTH GUARD (store/orders/[id] route — optimized)

  Before (2 DB calls):
    storeRepository.findByOwnerId(uid)          → store
    productRepository.findByStore(store.id)     → [all products]
    order.items.some(item → productIds.has(id)) → bool

  After ARCH2 (1 DB call):
    storeRepository.findByOwnerId(uid)          → store
    order.storeId === store.id                  → bool  ✓
    (orders now carry storeId directly)

─────────────────────────────────────────────────────────────────────

  ANTI-PATTERNS TO AVOID

  ✗  product.storeId === userId           (storeId ≠ Auth UID)
  ✗  findByStore(userId)                  (userId is not a storeId)
  ✗  coupon.storeId === userId            (same mistake)
  ✗  storeId==__none__ as sieve filter   (use early-return instead)
  ✗  offer.counterAmount!                 (use null guard first)
```

---

---

## Infra > Firebase Scripts (appkit/scripts/)

Reference for future sessions that need to reset Firestore or recover from index deploy failures.

### firebase-reset.mjs — full wipe + clean redeploy

```
Usage:  node appkit/scripts/firebase-reset.mjs [--dry-run]

What it does:
  1. Deletes all documents in all 23 Firestore collections
  2. Deletes all Firebase Auth users
  3. (Optionally) deletes Cloud Functions
  4. Runs: firebase deploy --only firestore:indexes,functions

Gotcha (INFRA1, fixed 2026-05-10):
  Uses .get().size (firebase-admin v10 compatible)
  NOT .count().get() — that is v11+ aggregate API only.

When to use:
  - Index deploy 409 loop (see firebase-delete-indexes.mjs first)
  - Full environment reset for testing seed data from scratch
  - After major schema migration that touches all documents
  - Re-seed required via /demo/seed after running this
```

### firebase-delete-indexes.mjs — bulk delete composite indexes via REST API

```
Usage:  node appkit/scripts/firebase-delete-indexes.mjs

What it does:
  1. Reads OAuth2 refresh token from ~/.config/configstore/firebase-tools.json
  2. Gets a fresh access token via Google OAuth2 token endpoint
  3. Lists all composite indexes via Firestore REST API
  4. Deletes each index by resource name (sequential, with logging)

When to use:
  - `firebase deploy --only firestore:indexes` returns 409 "already exists"
  - Partial previous deploy left indexes in CREATING state
  - Run this BEFORE npm run firebase:deploy to clear the stuck state
  - Safe to run anytime — only deletes indexes, not data

Source (INFRA2, created 2026-05-10):
  appkit/scripts/firebase-delete-indexes.mjs
  Auth: ~/.config/configstore/firebase-tools.json → client_id + client_secret + refresh_token
```

### firestore.indexes.json merge system

```
Source of truth:  appkit/firebase/base/firestore.indexes.json
Merge script:     node appkit/scripts/firebase-merge.mjs
Output:           firestore.indexes.json (root, deployed by Firebase CLI)

Rule: NEVER edit firestore.indexes.json (root) directly.
      Always edit appkit/firebase/base/firestore.indexes.json
      then run firebase-merge.mjs to regenerate the root file.

Duplicate index gotcha (fixed 2026-05-10):
  faqs collection had duplicate indexes for (isPinned,priority,order)
  and (isActive,createdAt) × 2. Firebase CLI silently skips dupes in
  the JSON but they cause 409 on redeploy if one is CREATING.
  Check for dupes before any index-heavy deploy.
```

---

*Last updated: 2026-05-10 — Session 76/76-infra: VD4+VD5+VD6+VD7+VD11+VD1+VD2 (public catalogue), J13 (products listing isAuction/isPreOrder fix), J14 (blog initialData shape), J15 (events status filter), INFRA1 (firebase-reset .count() fix), INFRA2 (firebase-delete-indexes.mjs created), Firebase full reset + 263 indexes redeployed.*


---

## New Feature Diagrams — Session 80-plan (EX / YT / AX / FI / BK Tiers)

---

### EX1 — Stats Section: Live Collection Query

#### Admin Config (desktop)

`
┌─────────────────────────────────────────────────────────────────────────┐
│ [⬆] Stats Counter Section                               [🗑 Remove]    │
│ ─────────────────────────────────────────────────────────────────────── │
│  Title  [Platform at a Glance                                       ]   │
│                                                                         │
│  Stats ─────────────────────────────────────────────────────────────── │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Stat 1                                              [✕ Remove]   │  │
│  │  Label:  [Total Listings                        ]                │  │
│  │  Value:  [70,000+                               ]                │  │
│  │  Source: (●) Static  (○) Live Preset  (○) Live Collection        │  │
│  │  Icon:   [📦 ▼]  Suffix: [+                    ]                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Stat 2                                              [✕ Remove]   │  │
│  │  Label:  [Verified Sellers                      ]                │  │
│  │  Source: (○) Static  (●) Live Preset  (○) Live Collection        │  │
│  │  Metric: [verified_sellers ▼]  Suffix: [         ]               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Stat 3                                              [✕ Remove]   │  │
│  │  Label:  [Active Auctions                       ]                │  │
│  │  Source: (○) Static  (○) Live Preset  (●) Live Collection        │  │
│  │  Collection: [products ▼]                                        │  │
│  │  Filter field: [status        ]  Value: [active ]                │  │
│  │  Suffix:       [               ]                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                [+ Add Stat]             │
└─────────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Desktop (4 stats in a row)

`
┌──────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   📦         │  │   🏪         │  │   👥         │  │   ⭐     │ │
│  │   70,000+    │  │     8        │  │    18        │  │  4.7 ★   │ │
│  │  Listings    │  │  Sellers     │  │   Buyers     │  │  Rating  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Mobile (2 × 2 grid)

`
┌──────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  │
│  │   📦     │  │   🏪     │  │
│  │  70,000+ │  │    8     │  │
│  │ Listings │  │ Sellers  │  │
│  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  │
│  │   👥     │  │   ⭐     │  │
│  │    18    │  │  4.7 ★   │  │
│  │  Buyers  │  │  Rating  │  │
│  └──────────┘  └──────────┘  │
└──────────────────────────────┘
`

---

### EX2 — Multi-Carousel Admin

#### Carousel List (desktop)

`
┌──────────────────────────────────────────────────────────────────────────┐
│ Carousels                                            [+ New Carousel]    │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │ #  │ Name             │ Slides │ Status  │ Used in Sections │ Actions│  │
│ │────┼──────────────────┼────────┼─────────┼──────────────────┼───────│  │
│ │ 1  │ Hero Homepage    │ 5/5    │ Active  │ Hero Section     │[Edit]🗑│  │
│ │ 2  │ Deals Carousel   │ 3/5    │ Active  │ Deals Section    │[Edit]🗑│  │
│ │ 3  │ Brand Spotlight  │ 2/5    │ Draft   │ —                │[Edit]🗑│  │
│ └────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
`

#### Carousel Edit — Slide List (desktop)

`
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Carousels  /  Hero Homepage                          [+ Add Slide]     │
│  Name:   [Hero Homepage               ]  Status: (●) Active  (○) Draft   │
│  Slides (5 / 5 max) ─────────────────────────────────────────────────── │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │ ⠿  1. Summer Deals    [🖼 image]   Cards: 3/6  [Edit] [🗑]       │   │
│  │ ⠿  2. Hot Wheels      [🎥 video]   Cards: 2/6  [Edit] [🗑]       │   │
│  │ ⠿  3. Pokémon TCG     [🖼 image]   Cards: 4/6  [Edit] [🗑]       │   │
│  │ ⠿  4. Bandai Figures  [🖼 image]   Cards: 1/6  [Edit] [🗑]       │   │
│  │ ⠿  5. Auction Live    [🎨 color]   Cards: 0/6  [Edit] [🗑]       │   │
│  │   [+ Add Slide]  ← disabled, tooltip "Maximum 5 slides reached"  │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│  [Save Changes]                                                           │
└──────────────────────────────────────────────────────────────────────────┘
`

#### Carousel Edit — Mobile

`
┌──────────────────────────────┐
│ ← Hero Homepage       [Save] │
│ ─────────────────────────── │
│ Name: [Hero Homepage      ]  │
│ Status: [Active ▼]           │
│ ─────────────────────────── │
│ Slides (5/5 max)             │
│ ┌────────────────────────┐   │
│ │ ⠿ 1. Summer Deals [Edit]│  │
│ │ ⠿ 2. Hot Wheels   [Edit]│  │
│ │ ⠿ 3. Pokémon TCG  [Edit]│  │
│ │ ⠿ 4. Bandai Fig   [Edit]│  │
│ │ ⠿ 5. Auction Live [Edit]│  │
│ └────────────────────────┘   │
│ [+ Add Slide — disabled]     │
└──────────────────────────────┘
`

---

### EX3 — Categories & Brands: CTA + Filter Chips

#### Admin Config (desktop)

`
┌─────────────────────────────────────────────────────────────────────────┐
│ [⬆] Shop by Category                                    [🗑 Remove]    │
│  Title:    [Shop by Category                        ]                   │
│  Subtitle: [Browse our collectible categories       ]                   │
│  Limit:    [10 ▼]                                                       │
│  Filters ──────────────────────────────────────────────────────────── │
│   ☑ Featured only    ☐ Root categories only                            │
│   Filter by root:  [All ▼]                                             │
│  CTA Button ────────────────────────────────────────────────────────── │
│   ☑ Show CTA button                                                    │
│   Label:  [Browse All Categories            ]                          │
│   Link:   [/categories                      ]                          │
│   Style:  (●) Outline  (○) Filled  (○) Text link                      │
└─────────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Desktop

`
┌──────────────────────────────────────────────────────────────────────┐
│  Shop by Category                                                    │
│  Browse our collectible categories                                   │
│  [All] [Trading Cards] [Action Figures] [Diecast]  ← filter chips   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ◀  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ▶          │
│     │ [cover] │  │ [cover] │  │ [cover] │  │ [cover] │             │
│     │ Pokémon │  │ Gunpla  │  │Hot Wheel│  │Beyblade │             │
│     │   TCG   │  │         │  │         │  │         │             │
│     └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
│                                 [Browse All Categories →]            │
└──────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Mobile

`
┌──────────────────────────────┐
│ Shop by Category             │
│ [All][Cards][Figures][+more] │  ← scrollable chip row
│ ─────────────────────────── │
│ ◀ ┌──────┐ ┌──────┐ ┌──────┐▶│
│   │[img] │ │[img] │ │[img] │ │
│   │Pokém │ │Gunpl │ │HotWh │ │
│   └──────┘ └──────┘ └──────┘ │
│  [Browse All Categories →]  │
└──────────────────────────────┘
`

---

### EX4 — Products Section: Multi-Row Paginated

#### Admin Config (desktop)

`
┌─────────────────────────────────────────────────────────────────────────┐
│ [⬆] Featured Products                                   [🗑 Remove]    │
│  Title:  [Featured Products                         ]                   │
│  Type:   (●) Standard  (○) Auction  (○) Pre-order  (○) Mixed           │
│  Layout ──────────────────────────────────────────────────────────── │
│   Rows:         [2 ▼]  (1 – 4)        Items/row: 5 (fixed)            │
│   Max Items:    [10 ▼] (5 – 20)       Initial: rows × 5 = 10 shown    │
│   Pagination:   (●) Load More  (○) Arrows  (○) Auto-scroll            │
│  Filters ──────────────────────────────────────────────────────────── │
│   ☑ Featured  ☐ Promoted  Category: [All ▼]  Brand: [All ▼]           │
│  CTA Button ───────────────────────────────────────────────────────── │
│   ☑ CTA  Label: [View All Products]  Link: [/products]                │
└─────────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Desktop (2 rows × 5, Load More)

`
┌──────────────────────────────────────────────────────────────────────┐
│  Featured Products                                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    ← row 1          │
│  │[img] │ │[img] │ │[img] │ │[img] │ │[img] │                      │
│  │Name  │ │Name  │ │Name  │ │Name  │ │Name  │                      │
│  │₹1,200│ │₹3,500│ │₹800  │ │₹2,100│ │₹650  │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    ← row 2          │
│  │[img] │ │[img] │ │[img] │ │[img] │ │[img] │                      │
│  │Name  │ │Name  │ │Name  │ │Name  │ │Name  │                      │
│  │₹4,200│ │₹1,800│ │₹950  │ │₹3,200│ │₹780  │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                      │
│              [Load More →]                [View All Products →]      │
└──────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Mobile (2 cols, scroll loads more)

`
┌──────────────────────────────┐
│ Featured Products            │
│ ┌──────────┐ ┌──────────┐   │
│ │  [img]   │ │  [img]   │   │
│ │  Name    │ │  Name    │   │
│ │  ₹1,200  │ │  ₹3,500  │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │  [img]   │ │  [img]   │   │
│ │  Name    │ │  Name    │   │
│ │  ₹800    │ │  ₹2,100  │   │
│ └──────────┘ └──────────┘   │
│    ── [Load More] ──         │
│   [View All Products →]      │
└──────────────────────────────┘
`

---

### EX5 — Common Collection Cards Section

#### Admin Config (desktop)

`
┌─────────────────────────────────────────────────────────────────────────┐
│ [⬆] Collection Cards                                    [🗑 Remove]    │
│  Title:    [Discover More                           ]                   │
│  Subtitle: [Products, Auctions & More               ]                   │
│                                                                         │
│  Collections (max 3) ──────────────────────────────────────────────── │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Collection 1                                       [✕]           │  │
│  │  Type:   [Products ▼]                                            │  │
│  │  Filter: ☑ Featured  ☐ Promoted  Category: [All ▼]              │  │
│  │  Limit:  [8 ▼]                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Collection 2                                       [✕]           │  │
│  │  Type:   [Auctions ▼]                                            │  │
│  │  Filter: ☐ Featured  ☑ Ending Soon               Limit: [4 ▼]   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  [+ Add Collection]                                                     │
│                                                                         │
│  Layout:      (●) Carousel  (○) Grid  (○) Mixed-row                    │
│  Items/row:   [4 ▼]   Max items: [12 ▼]                                │
│  ☑ Show collection tabs ([All][Products][Auctions])                    │
│  CTA:  ☑ CTA  Label: [View All]  Link: [/products]                    │
└─────────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Desktop (carousel, mixed Products + Auctions)

`
┌──────────────────────────────────────────────────────────────────────┐
│  Discover More                                                       │
│  Products, Auctions & More                                           │
│  [All] [Products] [Auctions]  ← collection filter tabs              │
│  ◀  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  ▶         │
│     │🏷 PRODUCT│ │⚡AUCTION │ │🏷 PRODUCT│ │⚡AUCTION │             │
│     │  [image] │ │  [image] │ │  [image] │ │  [image] │             │
│     │  Name    │ │  Name    │ │  Name    │ │  Name    │             │
│     │  ₹1,200  │ │Bid:₹800  │ │  ₹3,500  │ │Bid:₹400  │             │
│     │[Add Cart]│ │[Bid Now] │ │[Add Cart]│ │[Bid Now] │             │
│     └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│  ●○○                                            [View All →]        │
└──────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Mobile (2 cols, tab toggle)

`
┌──────────────────────────────┐
│ Discover More                │
│ [All] [Products] [Auctions]  │
│ ─────────────────────────── │
│ ┌──────────┐ ┌──────────┐   │
│ │🏷PRODUCT │ │⚡AUCTION │   │
│ │  [img]   │ │  [img]   │   │
│ │  Name    │ │  Name    │   │
│ │  ₹1,200  │ │Bid:₹800  │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │🏷PRODUCT │ │⚡AUCTION │   │
│ │  [img]   │ │  [img]   │   │
│ └──────────┘ └──────────┘   │
│   ●○○        [View All →]   │
└──────────────────────────────┘
`

---

### YT1 — YouTube Cards in Social Feed

#### Admin Config (social feed post — YouTube type)

`
┌────────────────────────────────────────────────────────────────────────┐
│  Social Post — YouTube                              [✕ Remove]         │
│   Platform: [YouTube ▼]                                                │
│   YouTube URL / ID: [https://youtu.be/dQw4w9WgXcQ         ]           │
│   → Extracted video ID: dQw4w9WgXcQ                                   │
│   → Thumbnail preview: img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault   │
│   Channel name (optional): [PokeCollectorIndia               ]         │
│   Thumbnail: (●) Auto (YouTube CDN)  (○) Custom upload                │
└────────────────────────────────────────────────────────────────────────┘
`

#### Rendered — Desktop (social feed with YouTube card)

`
┌──────────────────────────────────────────────────────────────────────┐
│  Social Feed                                                         │
│  [Instagram] [Twitter/X] [YouTube]  ← filter tabs                   │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐     │
│  │ 📸 INSTAGRAM     │ │ 🎬 YOUTUBE       │ │ 🐦 TWITTER/X     │     │
│  │  [photo]         │ │ [thumbnail]       │ │  Tweet text here │     │
│  │                  │ │     ▶️ PLAY       │ │  …               │     │
│  │  Caption text…   │ │ PokeCollectorIndia│ │  ❤ 124  🔁 45   │     │
│  │  ❤ 432           │ │ "Pokémon Unboxing"│ │  [View Tweet →] │     │
│  │  [View Post →]  │ │ [▶ Watch →]       │ │                  │     │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘     │
│  ●○○                                              [Follow Us →]     │
└──────────────────────────────────────────────────────────────────────┘
`

#### YouTube Card — Mobile

`
┌──────────────────────────────┐
│ 🎬 YouTube                   │
│ ┌──────────────────────────┐ │
│ │      [thumbnail]          │ │
│ │            ▶️             │ │
│ └──────────────────────────┘ │
│ Best Pokémon Unboxing 2026   │
│ PokeCollectorIndia           │
│ [▶ Watch on YouTube →]       │
└──────────────────────────────┘
`

---

### AX1 — ACTION Constants: Before / After

`
BEFORE (copy-pasted in every onClick):
─────────────────────────────────────────────
  onClick={() => {
    router.push(ROUTES.ADMIN.PRODUCTS)
    toast({ title: "Product saved", variant: "success" })
  }}
  
  onClick={() => {
    router.push(ROUTES.ADMIN.PRODUCTS)
    toast({ title: "Product deleted", variant: "error" })
  }}
  ...repeated ~200 times across the codebase

AFTER (using ACTION system):
─────────────────────────────────────────────
  onClick={() => dispatch(ACTION.NAVIGATE_TOAST(
    ROUTES.ADMIN.PRODUCTS, "Product saved", "success"
  ))}

  onClick={() => dispatch(ACTION.NAVIGATE_TOAST(
    ROUTES.ADMIN.PRODUCTS, "Product deleted", "error"
  ))}

ACTION dispatch flow:
  Component
    │  dispatch(ACTION.NAVIGATE_TOAST(route, msg, variant))
    ▼
  useActionDispatch()
    ├── router.push(route)
    └── toast({ title: msg, variant })

  Other actions:
    ACTION.OPEN_PANEL(id, props)   → panelStore.open(id, props)
    ACTION.CLOSE_PANEL()           → panelStore.close()
    ACTION.COPY(text, msg)         → clipboard.writeText + toast
    ACTION.BULK(action, ids)       → bulkHandler(action, ids)
    ACTION.TOAST(msg, variant)     → toast only (no navigate)
`

---

### AX2 — Edit/Create URL Panel Auto-Open

#### Desktop: List → URL triggers panel

`
URL: /admin/products
┌──────────────────────────────────────────────────────────────────┐
│ Products                    [+ New]  [Filters]  [Export]         │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ ID                  Name        Status   Actions           │   │
│ │ product-hot-wheels  Hot Wheels  Active   [Edit] [🗑]       │   │
│ │ product-charizard   Charizard   Active   [Edit] [🗑]       │   │
│ └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

URL: /admin/products?panel=edit&id=product-hot-wheels
┌─────────────────────────────────────────────────────────────────┐
│ Products  [+ New]  [Filters]                                    │
│ ┌─────────────────────┐  ┌──────────────────────────────────┐  │
│ │ ID         Actions  │  │ ← Edit: Hot Wheels Redline Vintage│  │
│ │ prod-hw    [Edit]   │  │ ─────────────────────────────── │  │
│ │ prod-char  [Edit]   │  │  [form fields…]                  │  │
│ └─────────────────────┘  │                                  │  │
│                           │  [Share link 🔗]                │  │
│                           │  [Discard]        [Save →]      │  │
│                           └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
On close/success → router.replace('/admin/products')
`

#### Mobile: URL triggers full-screen panel

`
URL: /admin/products?panel=edit&id=product-hot-wheels
┌──────────────────────────────┐
│ ←  Edit: Hot Wheels Redline  │
│ ─────────────────────────── │
│  [form fields, full width]   │
│                              │
│  [Share link 🔗]             │
│ ─────────────────────────── │
│ [Discard]          [Save →] │  ← sticky bottom bar
└──────────────────────────────┘
On close → router.replace('/admin/products')
`

---

### AX3 — Sticky Form Action Bar

#### Desktop (sticky top bar)

`
┌──────────────────────────────────────────────────────────────────────┐
│ Admin / Products / Edit ● Hot Wheels Redline Vintage     ← breadcrumb │
│                                              [👁 Preview] [Draft] [Publish →]│
│ ─── STICKY TOP BAR (z-dropdown, top: var(--header-height)) ─────────  │
│                                                                        │
│  [Basic Info tab]  [Media]  [Pricing]  [Inventory]  [Features]         │
│                                                                        │
│  Name *                                                                │
│  [Hot Wheels Redline Vintage                               ]           │
│                                                                        │
│  …scrollable form body…                                               │
└──────────────────────────────────────────────────────────────────────┘
Legend: ● = unsaved changes indicator on tab title
`

#### Mobile (sticky bottom bar)

`
┌──────────────────────────────┐
│ Edit Product          [👁]   │  ← compact top bar (no breadcrumb)
│ ─────────────────────────── │
│ [Basic] [Media] [Pricing]   │  ← tab strip
│                              │
│  Name *                      │
│  [Hot Wheels Redline …    ]  │
│                              │
│  …scrollable form body…      │
│ ─────────────────────────── │
│ [Discard]  [Draft]  [Save→] │  ← sticky bottom bar
└──────────────────────────────┘
`

---

### FI — Product Feature Icons & Badges

#### Admin Feature Flags List (desktop)

`
┌──────────────────────────────────────────────────────────────────────┐
│ Feature Flags                                   [+ New Feature]      │
│ [Platform] [Store Custom]  ← filter tabs                            │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Icon │ Label             │ Category  │ Types    │ Scope    │ On  │ │
│ │──────┼───────────────────┼───────────┼──────────┼──────────┼─────│ │
│ │ 🚚   │ Free Shipping     │ Shipping  │ All      │ Platform │  ●  │ │
│ │ ✓    │ Verified Seller   │ Seller    │ All      │ Platform │  ●  │ │
│ │ ↩    │ Accepts Returns   │ Platform  │ All      │ Platform │  ●  │ │
│ │ 🔴   │ New Condition     │ Condition │ All      │ Platform │  ●  │ │
│ │ 🟡   │ Used Condition    │ Condition │ All      │ Platform │  ●  │ │
│ │ ⭐   │ Featured          │ Platform  │ All      │ Platform │  ●  │ │
│ │ 📢   │ Promoted          │ Platform  │ All      │ Platform │  ●  │ │
│ │ 🏆   │ Auction Winner    │ Auction   │ Auction  │ Platform │  ●  │ │
│ │ 📦   │ Limited Edition   │ Custom    │ All      │ Store    │  ●  │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
`

#### Product Card with Feature Badges (desktop)

`
┌────────────────────────────────────┐
│          [product image]            │
│ ┌───────────────────────────────┐  │
│ │ 🚚 Free Shipping │ ✓ Verified │  │  ← FeatureBadgeList (max 3 visible)
│ └───────────────────────────────┘  │
│  Hot Wheels Redline Vintage 1968    │
│  ₹ 1,200                          │
│  [Add to Cart]                     │
└────────────────────────────────────┘

Feature badge pill:
┌──────────────┐
│ 🚚 Free Ship │   border-color: var(--feature-icon-color)
└──────────────┘   icon: 12px, label: text-2xs
`

#### Product Card with Feature Badges (mobile, compact row)

`
┌────────────────────────────────────────────────┐
│ [img] │ Hot Wheels Redline Vintage              │
│       │ 🚚 Free  ✓ Verified  +1 more           │
│       │ ₹ 1,200              [Add to Cart]     │
└────────────────────────────────────────────────┘
`

#### Product Form — Features Tab (desktop)

`
┌──────────────────────────────────────────────────────────────────────┐
│ [Basic Info] [Media] [Pricing] [Inventory] [Features] [Custom]       │
│ ─────────────── Features ───────────────── (max 10 selected)         │
│                                                                      │
│  Platform Features ─────────────────────────────────────────────    │
│   ☑ 🚚 Free Shipping        ☑ ✓ Verified Seller                     │
│   ☐ ↩ Accepts Returns       ☑ 🔴 New Condition                     │
│   ☐ ⭐ Featured              ☐ 📢 Promoted                           │
│                                                                      │
│  Store Custom Features (Diecast Depot) ─────────────────────────    │
│   ☐ 📦 Limited Edition       ☐ 💎 Collector Grade                  │
│   [Manage custom features →]                                         │
│                                                                      │
│  Preview: [🚚 Free Shipping] [✓ Verified] [🔴 New]                  │
└──────────────────────────────────────────────────────────────────────┘
`

---

### BK — Public Bulk Actions

#### Public Listing — Selection Mode (desktop)

`
┌──────────────────────────────────────────────────────────────────────┐
│ Products       [☐ Select]  [Filter ▼]  [Sort ▼]  [⊞ Grid | ≡ List]  │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │☑ [img]  │  │☐ [img]  │  │☑ [img]  │  │☐ [img]  │           │
│  │  Name    │  │  Name    │  │  Name    │  │  Name    │           │
│  │  ₹1,200  │  │  ₹3,500  │  │  ₹800    │  │  ₹2,100  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────┐    │
│ │  2 selected   [♡ Wishlist]  [⇄ Compare]  [↗ Share]   [✕]   │    │
│ └────────────────────── STICKY BOTTOM BAR ────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
Note: ☑ = checkbox overlay top-left of card; selected card has primary ring
`

#### Public Listing — Selection Mode (mobile)

`
┌──────────────────────────────┐
│ Products  [☐ Select] [≡] [⊕]│
│ ─────────────────────────── │
│ ┌──────────┐ ┌──────────┐   │
│ │☑ [img]  │ │☐ [img]  │   │
│ │  Name    │ │  Name    │   │
│ │  ₹1,200  │ │  ₹3,500  │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │☑ [img]  │ │☐ [img]  │   │
│ │  Name    │ │  Name    │   │
│ └──────────┘ └──────────┘   │
│ ─────────────────────────── │
│ 2 selected           [✕]    │
│ [♡Wishlist][⇄Compare][↗Share]│
└──────────────────────────────┘
`

#### Compare Overlay (desktop, 2-column)

`
┌──────────────────────────────────────────────────────────────────────┐
│ Compare Products  (2 of 4 max)                                [✕]   │
│ ┌──────────────────────────────┐ ┌──────────────────────────────┐   │
│ │  [product image]             │ │  [product image]             │   │
│ │  Hot Wheels Redline Vintage  │ │  Charizard PSA 9             │   │
│ │  ₹ 1,200                    │ │  ₹ 45,000                    │   │
│ │ ─────────────────────────── │ │ ─────────────────────────── │   │
│ │ Condition   New              │ │ Condition   Graded (PSA 9)   │   │
│ │ Brand       Hot Wheels       │ │ Brand       Pokémon Co.      │   │
│ │ Category    Diecast          │ │ Category    Trading Cards    │   │
│ │ Features  🚚 ✓ ↩            │ │ Features  ✓ ⭐ 📢           │   │
│ │ Store       Diecast Depot    │ │ Store       Pokemon Palace   │   │
│ │ ─────────────────────────── │ │ ─────────────────────────── │   │
│ │ [♡ Wishlist]  [View →]      │ │ [♡ Wishlist]  [View →]      │   │
│ │ [✕ Remove]                  │ │ [✕ Remove]                  │   │
│ └──────────────────────────────┘ └──────────────────────────────┘   │
│                                              [+ Add to Compare]      │
└──────────────────────────────────────────────────────────────────────┘
`

#### Compare Overlay (mobile, swipeable single card)

`
┌──────────────────────────────┐
│ Compare (2)            [✕]  │
│ ── ●○ ────────────────────  │  ← dot indicator (swipe to navigate)
│  [product image]             │
│  Hot Wheels Redline Vintage  │
│  ₹ 1,200                    │
│ ─────────────────────────── │
│ Condition   New              │
│ Brand       Hot Wheels       │
│ Category    Diecast          │
│ Features    🚚 ✓ ↩           │
│ Store       Diecast Depot    │
│ ─────────────────────────── │
│ [♡ Wishlist]    [View →]    │
└──────────────────────────────┘
← swipe left/right to compare →
`

---

### A1-ext — Admin Product Create: Store Picker

#### Desktop (store picker at top of form)

`
┌──────────────────────────────────────────────────────────────────────┐
│ Create Product                                    [Admin only field]  │
│ ─────────────────────────────────────────────────────────────────── │
│ Store *     [🏪 Search stores…                              ▼]       │
│             Pokemon Palace (store-pokemon-palace)   ← selected store │
│ ─────────────────────────────────────────────────────────────────── │
│ [Basic Info] [Media] [Pricing] [Inventory] [Features] [Custom]       │
│  Name *                                                              │
│  [                                                              ]     │
│  …rest of product form…                                              │
└──────────────────────────────────────────────────────────────────────┘
Note: Store field only visible when userRole === 'admin'
      Seller view: Store field hidden, storeId auto-set from auth user
`

#### Mobile (store picker at top, collapsible)

`
┌──────────────────────────────┐
│ ← Create Product     [Save] │
│ ─────────────────────────── │
│ Store *              [Admin] │
│ [🏪 Search stores… ▼]       │
│ ─────────────────────────── │
│ [Basic] [Media] [Pricing]   │
│ ─────────────────────────── │
│ Name *                       │
│ [                         ]  │
└──────────────────────────────┘
`

---

## RBAC / BAN / SCAM — Architecture Diagrams (Session 80-schema)

---

### RBAC > Permission Check Flow

```
Request (RSC layout / API route)
│
├─ role === "admin"  →  ALLOW (bypass all checks)
│
├─ role === "employee"
│   └─ read UserDocument.permissions[]
│       └─ hasPermission(permission, user)  →  ALLOW / DENY
│
└─ role === "user" | "seller" | "moderator"
    └─ checked against role-gated routes only (no ROUTE_PERMISSION_MAP needed)

StoreCapability check (separate from user permissions):
StoreDocument.capabilities[]
  └─ hasCapability("host_auctions", store)  →  ALLOW / DENY
  default capabilities: ["suggest_brands", "create_coupons"]
```

### RBAC > Employee Groups (18 presets)

```
EmployeeGroup                Scope
─────────────────────────────────────────────────────────────────
content_moderator            Reviews, comments, listings, bans
review_manager               Reviews CRUD + respond
blog_poster                  Blog read/write/publish
community_manager            Events, blog, reviews, reports
event_handler                Events CRUD
newsletter_manager           Newsletter only
seo_manager                  SEO metadata, site settings SEO tab
ad_manager                   Ad slots, carousel slides
site_manager                 Full site settings
catalog_manager              Categories, brands, products
finance_manager              Payouts, orders read, analytics
data_analyst                 Read-only: analytics, orders, users
customer_support             Support tickets, order lookup
support_agent                Support tickets only
store_onboarding             Store applications review
trust_and_safety             Users, bans, scam reports, support
auction_monitor              Auctions read + close
scam_moderator               Scam registry verify/reject
custom                       Arbitrary permission array (admin set)
```

### RBAC > Store Capability Tiers

```
Tier 1 — Default (all stores)
  suggest_brands        propose new brand additions
  create_coupons        create store-scoped coupons

Tier 2 — Verified Sellers (admin-granted)
  host_auctions         create auction listings
  host_preorders        create pre-order listings
  create_categories     propose niche subcategories
  bulk_listing_import   CSV import up to 500 listings
  extended_return_window  store-level 30d return policy
  verified_seller       ✓ badge on store profile + cards

Tier 3 — Premium / Partner
  featured_placement    products appear in featured sections
  promotional_banner    custom banner on store page
  priority_support      support tickets escalated to high priority
  multiple_stores       create more than one store
  custom_store_slug     change storeSlug after creation
  api_access            programmatic API key for inventory sync
  lower_commission_rate custom platform commission %
  early_access_features beta feature flags
  advanced_analytics    extended analytics dashboard
```

---

### BAN > Soft Ban Architecture

```
UserDocument.softBans: UserSoftBan[]
  ┌─────────────────────────────────────────┐
  │ action:    BannedAction                 │  ← 8 possible actions
  │ reason:    string                       │
  │ bannedBy:  uid (employee/admin)         │
  │ bannedAt:  Date                         │
  │ expiresAt: Date | null (null = forever) │
  └─────────────────────────────────────────┘

BannedAction values:
  write_reviews · write_blog_comments · join_events
  place_bids · create_listings · send_messages
  create_support_tickets · report_scammers

Expiry rule: expiresAt in past = expired (treated as lifted, never deleted from array)
Hard ban:   disabled: true + hardBanReason + hardBannedAt + hardBannedBy
            Also calls Firebase Auth updateUser(uid, { disabled: true })
```

### BAN > Support Ticket Limits

```
CREATE TICKET — server-side enforcement chain:
  1. user.disabled === true  →  403 (hard banned)
  2. hasSoftBan(user, "create_support_tickets")  →  403
  3. !user.uid  →  401 (no guest creation)
  4. category === "order_issue":
     a. orderId required
     b. order.status must be in ELIGIBLE_ORDER_STATUSES_FOR_TICKET
        ["PENDING", "PROCESSING", "SHIPPED", "RETURN_REQUESTED"]
     c. existing open ticket for this orderId?  →  409
  5. general tickets: count(status in ACTIVE_TICKET_STATUSES) >= 2  →  429
  6. same category with status "waiting_on_user"?  →  409

ACTIVE_TICKET_STATUSES: ["open", "in_progress", "waiting_on_user"]
```

### BAN > Ticket Status Flow

```
[open]
  │
  ├─ admin picks up ──────────────────────► [in_progress]
  │                                             │
  │                                             ├─ needs user input ─► [waiting_on_user]
  │                                             │                            │
  │                                             │                     user replies ─► [in_progress]
  │                                             │
  │                                             └─ resolved ──────────► [resolved]
  │                                                                          │
  └─────────────────────────────────────────────────────────────────── closed ─► [closed]

Priority: low · normal · high · urgent
Category: order_issue · billing_payment · account · listing_dispute
          scam_report · refund_request · auction_dispute · general
```

---

### SCAM > Registry Architecture

```
PUBLIC PAGES (SEO-first)
─────────────────────────
/scams                    list of verified scammer profiles
/scams/[slug]             individual scammer profile
/scams/types              index of all 27 scam types
/scams/types/[type]       scam type detail page with howItHappens + howToAvoid

ADMIN PAGES
───────────
/admin/scams              all scammer profiles (all statuses)
/admin/scams/[id]         verify / reject / edit / remove

USER FLOW
─────────
Register → scamAwarenessAcknowledgedAt gate → can submit reports
Submit scammer report → status: "pending_review"
Admin verifies → status: "verified" → appears on /scams
Admin rejects → status: "rejected" → not shown

SEO KEY DESIGN POINTS:
- phones[], upiIds[], emails[] rendered as plaintext HTML text nodes (not data-attrs)
- seoSlug = id (no timestamp) → stable canonical URL
- verified scammers appear in sitemap
- Each /scams/types/[type] page has howItHappens prose + numbered howToAvoid list
  → long-tail SEO for "XYZ scam india collectibles"
```

### SCAM > ScammerDocument Key Fields

```
ScammerDocument
  id / seoSlug        "scammer-9876543210-at-paytm"   ← pure slug, no timestamp
  displayNames[]      ["Rahul Sharma", "RS Toys"]      ← multiple aliases
  phones[]            ["9876543210", "+919876543210"]   ← plaintext, indexed by Google
  upiIds[]            ["9876543210@paytm"]              ← plaintext
  emails[]            ["rs.toys.fake@gmail.com"]        ← plaintext
  socialMedia[]       [{ platform, handle, url? }]
  scamType            ScamType (27 values)
  scamPlatform        ScamPlatform (11 values)
  description         reporter's narrative (max 2000 chars)
  amountLost?         INR paise (optional)
  itemInvolved?       "Charizard PSA 9" (optional)
  evidence[]          /media/ proxy URLs only
  reportedBy          uid
  reportedByAnon      bool (shows "Anonymous" on public page if true)
  status              pending_review | verified | rejected | removed
  verifiedBy?         admin/employee uid
  views               server-incremented counter

Max pending per user: 5 (MAX_PENDING_SCAMMER_REPORTS_PER_USER)
Slug prefix: scammer-
Collection: scammerProfiles
```

### SCAM > 27 Types Across 6 Categories

```
Category                  Types
────────────────────────────────────────────────────────────────────
price_manipulation        undervaluation, fake_price_reference,
                          bait_and_switch, condition_misrepresentation
social_engineering        sympathy_play, trust_building_fraud,
                          urgency_pressure, student_impersonation
payment_fraud             advance_payment_ghost, fake_payment_screenshot,
                          partial_payment_ghost, chargeback_fraud,
                          overpayment_scam
preorder_delivery_fraud   preorder_hold, fake_preorder_listing,
                          endless_delay_scam
identity_impersonation    seller_impersonation, platform_impersonation,
                          account_takeover_resale, fake_escrow
item_authenticity_fraud   counterfeit_item, fake_grading_claim,
                          graded_case_tampering, sealed_product_repack
logistics_fraud           empty_box_ship, fake_tracking_number,
                          return_swap_fraud
```

