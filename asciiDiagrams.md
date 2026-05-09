# ASCII Diagrams — LetiTrip UI Structure

> **Living document.** Add or update a diagram every time a page/view/form/modal is built or significantly changed.
> Every tab, column, field, button, modal, and empty state must appear. Nothing omitted.
> Format: `## [Area] > [Page Name]`  Status: ✅ built | ⏳ planned | ⚠️ partial

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

## Shared > PageLoader ✅ (X5 — replaces all 15 loading.tsx skeletons)

```
Normal state (< 15s):
┌─────────────────────────────────────────┐
│                                         │
│              ◌ (spinner lg)             │
│               Loading…                  │
│                                         │
└─────────────────────────────────────────┘
  min-height: 60vh; centered flex column

Timed-out state (≥ 15s):
┌─────────────────────────────────────────┐
│                                         │
│  Something went wrong.                  │
│  Please refresh the page.               │
│                                         │
│           [Refresh]                     │
│                                         │
└─────────────────────────────────────────┘
  Refresh → window.location.reload()
  Used in: all src/app/[locale]/**/loading.tsx (15 files)
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

## Admin > Site Settings ✅ (VA8) — 12 groups

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Site Settings                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  [① Branding] [② Appearance] [③ Announcement] [④ SEO] [⑤ Contact+Social]  │
│  [⑥ Watermark] [⑦ Fees] [⑧ Integrations] [⑨ Shipping] [⑩ Auctions]       │
│  [⑪ Limits] [⑫ Legal]                                                       │
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
│    Terms of Service    [RichTextEditor]                                      │
│    Privacy Policy      [RichTextEditor]                                      │
│    Refund Policy       [RichTextEditor]                                      │
│    Shipping Policy     [RichTextEditor]                                      │
│    Cookie Policy       [RichTextEditor]                                      │
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

## Public > Homepage ✅ (all sections)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER: [Logo] [🔍 Search [type ▾] [Search btn]] [Cart 3] [♡] [👤] [🔔]  │
│  NAVBAR: [Products] [Auctions] [Pre-Orders] [Brands] [Events] [Blog] [FAQs]│
├─────────────────────────────────────────────────────────────────────────────┤
│  [§ Announcement Banner: "🎉 Free shipping ₹999+ · Use code WELCOME10"]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  § HERO CAROUSEL (CF1 ✅)                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Background: image/video/gradient]                                 │   │
│  │  ← Card1  Card2  Card3 →                                            │   │
│  │  ● ● ○ ○ ○                                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  § STATS (trust-indicators ✅): [X Sellers] [X Products] [X Happy Buyers]  │
│  § CATEGORIES GRID ✅: Browse by: Action Figures / Trading Cards / ...     │
│  § FEATURED PRODUCTS ✅: 10 product cards [View All →]                     │
│  § LIVE AUCTIONS ✅: 6 auction cards with countdown [View All Auctions →]  │
│  § TOP BRANDS ✅: brand logo grid                                           │
│  § PRE-ORDERS ✅: pre-order cards                                           │
│  § BANNER ✅: promo banner with CTA                                         │
│  § GOOGLE REVIEWS ✅ (HS4): ★★★★★ fetched from Google Business            │
│  § CUSTOMER REVIEWS ✅: review cards                                        │
│  § BLOG ARTICLES ✅: 3 blog post cards                                     │
│  § EVENTS ✅: upcoming event cards                                          │
│  § FEATURED STORES ✅: store cards                                          │
│  § FAQ ✅: 5 homepage FAQs                                                  │
│  § CUSTOM CARDS ✅ (HS5): configurable card grid/row/masonry               │
│  § NEWSLETTER ✅: email subscribe form                                      │
│  § WHATSAPP CTA ✅                                                          │
│  § SOCIAL FEED ⏳ (S1-S5): Instagram/Facebook/TikTok posts                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  FOOTER: Shop | Support | Sellers | Learn | Legal | Social icons            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public > Products Listing ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Products                                                                    │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  FILTERS     │  TOOLBAR: [🔍 q=...]  [Sort ▾]  [Grid/List toggle]          │
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

---

## Public > Auctions Listing ✅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Live Auctions                                                               │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  FILTERS     │  [All] [Ending Soon] [Just Started] [Upcoming] [Ended]       │
│  Category    │  [🔍 q=...]  [Sort: Ending Soon ▾]  [Grid/List ▾]           │
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
│                           │  Sold by: CardGame Hub [Visit Store →]          │
│                           │  Store Rating: ★★★★★ (124 reviews)             │
├───────────────────────────┴─────────────────────────────────────────────────┤
│  TABS: [Description] [Specifications] [Reviews (47)] [Custom Sections...]   │
│  ────────────────────────────────────────────────────────────────────────── │
│  TAB: Description — [RichTextRenderer]                                       │
│  TAB: Specifications — custom fields table                                   │
│  TAB: Reviews — ReviewSummary + ReviewsList                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  BELOW FOLD:                                                                 │
│  "More from CardGame Hub" → [product carousel]                               │
│  "Similar Products" → [product carousel]                                     │
│  "Part of group" → ShowGroupSection (⏳ GP1)                                 │
│  "More listings like this" → SublistingCarouselSection (⏳ SC3)              │
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
│                           │                                                 │
│                           │  ┌──────────────────────────────────────────┐  │
│                           │  │  Your Bid ₹ [input min ₹3,04,999]        │  │
│                           │  │  [Place Bid] — opens PlaceBidForm        │  │
│                           │  └──────────────────────────────────────────┘  │
│                           │  [♡ Watch Auction]                              │
├───────────────────────────┴─────────────────────────────────────────────────┤
│  TABS: [Description] [Bid History] [Specifications] [Reviews]               │
│  TAB: Bid History                                                            │
│  Bidder*    Amount      Time           Status                                │
│  Ravi K.    ₹2,99,999   May 08 14:32   Leading                               │
│  Priya S.   ₹2,50,000   May 08 12:01   Outbid                               │
│  * Masked: first name + last initial only                                   │
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
┌─────────────────────────────────────────────────────────────────────────────┐
│  Browse Categories                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ 🖼 cover     │ │ 🖼 cover     │ │ 🖼 cover     │ │ 🖼 cover     │      │
│  │ Action Figs  │ │ Trading Cards│ │ Diecast      │ │ Spinning Tops│      │
│  │ 4 sub-cats   │ │ 3 sub-cats   │ │ 3 sub-cats   │ │ 1 sub-cat    │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
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

## Public > Brands Listing ⏳ (VD6)

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

*Last updated: 2026-05-09 — Session 73: N3 store editor (isVerified+suspensionReason), AdminUserEditorView (B1/VA10), AdminOrderEditorView (B2/VA9), AdminReviewsView moderation (N2/VA11), AdminSessionsView (LL11), AdminAllEventEntriesView (LL12), AdminNotificationsView (LL13), AdminCartsView (LL14), AdminWishlistsView (LL15).*
