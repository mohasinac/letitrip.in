# letitrip.in — Master Working Prompt

> Paste this entire file at the start of every session.
> Read CURRENT TASK at the top, start immediately, work down the queue without asking.
> Full task status lives in `crud-tracker.md` — check it first.

---

## ⚡ CURRENT TASK — START HERE

**Priority shift: Comprehensive seed data (P10–P22) BEFORE all feature work.**

Seed data is the foundation — without it, every feature task is developed blind with empty screens. Build it once, verify every feature against it, then never touch it again.

**Immediate next: P10 — Seeding page overhaul (`SeedPanel.tsx` + per-resource endpoints)**

Two-part task:

**(A) Per-resource seed endpoints** — `src/app/api/demo/seed/[collection]/route.ts`:
- `GET` → status/counts for that collection
- `POST { action: "seed" | "clear", dryRun?: boolean }` → detailed results:
  ```ts
  { collection, action, dryRun,
    results: Array<{ id, status: "created"|"updated"|"skipped"|"error", detail? }>,
    summary: { created, updated, skipped, errors, durationMs } }
  ```
- Every Firestore write error surfaces its message in `detail` — no more "3 errors" with no context
- Sub-collection items use composite id: `"users/user-admin/addresses/addr-1"`

**(B) Enhanced `SeedPanel.tsx`**:
1. Read `src/components/dev/SeedPanel.tsx` — understand current structure (560 lines, 4 groups)
2. Add collapsible group sections (Core / Transactional / Content / System)
3. Per-group status badge (✅ Fully Seeded / 🟡 Partial / ⬜ Not Seeded / ❌ Error) via `GET /api/demo/seed/[collection]`
4. Per-group preview list using `SEED_MANIFEST` (P11)
5. Per-group "Seed Group" + "Clear Group" buttons — calls each collection endpoint sequentially, updates row live; shows failed doc IDs + detail messages inline on error
6. Dependency warning banner (Products needs Stores+Categories, Bids needs Auctions)
7. Global toolbar: Seed All Selected, Clear All (confirm), Refresh Status
8. `npx tsc --noEmit` — 0 errors

**After P10: P11 → P12 → P13 → P14 → P15 → P16 → P17 → P18 → P19 → P20 → P21 → P22**
*(See Tier P — Comprehensive Seed below for full details)*

**After P22 (all seed complete): return to A1 — Admin Products CRUD (3-mode)**

> **Seed dependency order (strict):** site-settings → brands → categories → users → stores → products/auctions/preorders → bids → orders → reviews → blog/events/FAQs → carousel/sections → coupons → notifications

> **Seed-first strategy**: P10–P22 must be complete before any feature work begins. Seed data gives 100% feature coverage so every task can be verified against real data immediately.
> **Collectibles focus**: Seed data covers 5 verticals — Pokémon TCG, Yu-Gi-Oh!, Hot Wheels/diecast, anime/action figures (Bandai/Good Smile/Funko), and Beyblades. 13 real brands, 22 categories in 3-tier hierarchy, 20 standard products, 6 auctions, 5 pre-orders, 5 stores. Image sources: Wikimedia Commons, official brand sites (bandai.com, mattel.com, goodsmile.info), Unsplash, YouTube unboxing IDs.
> **Note:** All forms must be field-by-field UX — no JSON config editors. Products are sold by **stores**, not users; every product/auction/preorder doc needs a `storeId` field.
> **Product** = generic term for standard / auction / pre-order / any future type. Custom fields: max 50 per product. Custom sections: max 3 per product (title + optional rich text 200KB + optional fields from customFields; at most 1 text block per section). Every CRUD table action must show a success toast or a clear error — no silent failures.
> **id === slug** is the app convention — `[id]` and `[slug]` route params are the same value; no separate pages needed for each. Media URLs in Firestore must always use `/media/<slug>` proxy path, never raw Firebase Storage URLs.
> **Social share previews** (WhatsApp, Discord, iMessage, Slack, Twitter/X) are automatic — driven by `generateMetadata` og: tags (SL4). Every page must export full `openGraph` + `twitter` metadata. og:image uses the `/media/<slug>` proxy URL as absolute URL.
> **Media sources**: video/image fields support three types — `"upload"` (Firebase via proxy), `"youtube"` (iframe embed, thumbnail via proxy), `"external"` (third-party URL, no watermark). Seed data uses Unsplash image URLs and YouTube video IDs so media renders in dev.
> **Social media feed sections** (Tier S): Homepage can show a live grid of posts from Instagram, Facebook, TikTok, or DeviantArt as a `social-feed` section type. Clicking a post card opens the original post in a new tab. Platform credentials (Meta page token, TikTok client key/secret/access token, DeviantArt client ID/secret) are stored in `site_settings.credentials` (encrypted, never client-exposed). API route `GET /api/social-feed` + shared fetcher in `appkit/src/features/homepage/lib/social-feed-fetcher.ts`. Components: `SocialFeedSection` (async RSC), `SocialPostCard`. Platforms: Instagram (Meta Graph API v19), Facebook (Meta Graph API v19), TikTok (TikTok for Developers v2), DeviantArt (client-credentials OAuth2). Seed data includes a disabled demo section; enable once credentials are set in VA8 ⑧Integrations.

---

## 📋 FULL PENDING QUEUE

> Canonical status for every task is in **`crud-tracker.md`**. Update it after every task and
> every 30 minutes. Below is the summary by tier.

### Tier 0-pre — Slug Format *(do first — foundational)*
| # | Task |
|---|------|
| SL1 | Standardize all seed slugs to use resource-type prefix |
| SL2 | Auto-generate prefixed slugs in all create/edit forms |
| SL3 | Confirm repository findBySlug works with prefixed slugs |
| SL4 | generateMetadata + full social share preview (og:title, og:description, og:image via /media/ proxy absolute URL, twitter:card="summary_large_image") for all page types |
| SL5 | API route params pass prefixed slug unchanged |
| SL6 | Enforce id === slug for all content resources |

### Tier 0 — Bug Fixes *(all ✅)*
| # | Task | Status |
|---|------|--------|
| J5 | Bids table missing on auction detail pages | ✅ Part 48 |
| J6 | Offer amount field missing in MakeOfferButton | ✅ Part 49 |
| J1 | Store not found 404 on all store sub-pages | ✅ Part 49 |
| J2 | Blog page rendering broken | ✅ Part 49 |
| J3 | Events page rendering broken | ✅ Part 49 |
| J4 | Category pages broken listing | ✅ Part 49 |
| J7 | Deals/Promotions section empty | ✅ Part 49 |
| J9 | Featured contents sections empty | ✅ Part 49 |
| J8 | Ad slots should render conditionally | ✅ Part 51 |
| M2 | Admin Dashboard stats showing zeroes | ✅ Part 52 |

### Tier 1 — Rich Text System *(all ✅)*
| # | Task | Status |
|---|------|--------|
| K2 | RichTextRenderer component | ✅ Part 53 |
| K4+L3+L4+L5 | Wire renderer in events, blog, stores, faqs | ✅ Part 53 |
| K3 | RichTextEditor wired in admin/seller forms | ✅ Part 53 |

### Tier 2 — Product Custom Fields & Detail Sections *(pending)*
| # | Task | Status |
|---|------|--------|
| L1 | Custom fields schema + CustomFieldsEditor component | ⏳ |
| L2 | Custom section render in all product detail page types | ⏳ |
| O3 | Product pickup address selector + inline create popup | ⏳ |

### Tier 3 — Infrastructure
| # | Task | Status |
|---|------|--------|
| E2 | Missing API route handlers | ✅ Part 54 |
| E3+E4 | Field-name constants + API route constants | ✅ Part 55 |
| E1+E5 | Route constants + TypeScript input types | ✅ Part 56 |
| F2 | Brands: Firestore schema + API + Admin CRUD | ✅ Part 57 |
| H1 | InlineCreateSelect shared component | ⏳ |
| I4 | Media Library picker modal | ⏳ |
| I5 | Media upload audit — wire `MediaUploadField` in all remaining CRUD forms | ⏳ |
| I6 | PDF support in media uploader (invoices, spec sheets, payout proof) | ⏳ |
| I7 | Media CDN proxy — server delivers all images; watermark config (text/image, 0–100% size) from site_settings; sharp; private Storage; `/media/<slug>` URLs everywhere | ⏳ |
| I8 | YouTube + external URL support in all media fields — `{ type: "upload"\|"youtube"\|"external", url?, youtubeId? }`; tab switcher in MediaUploadField | ⏳ |
| E6 | /support Help Centre page | ⏳ |
| E7 | Footer dead link audit + redirect fix | ⏳ |

### Tier 4 — Seed Data Overhaul *(do first — P10–P22 are the priority)*
| # | Task | Status |
|---|------|--------|
| P1+P2 | Brands seed + Categories seed | ✅ Part 58 |
| P3–P9 | (superseded — rolled into P10–P22) | 🚫 |
| P10 | Seeding page overhaul — per-resource endpoints (`/api/demo/seed/[collection]`), detailed per-doc error format, live progress in SeedPanel, collapsible groups/status/preview | ⏳ |
| P11 | Seed file restructure — delete stale pokemon-* files, add manifest.ts | ⏳ |
| P12 | Site settings seed — full 12-group config (watermark, limits, auction config, legal) | ⏳ |
| P13 | Brands seed — 13 real collectibles brands (Bandai, Hasbro, Takara Tomy, Mattel, Pokémon Co., Konami, Funko, NECA, McFarlane, Good Smile, Hot Wheels, Tomica, Beyblade) | ⏳ |
| P14 | Categories seed — 22 categories, 3-tier hierarchy (action figures, trading cards, diecast, spinning tops, model kits, vintage/rare) | ⏳ |
| P15 | Users + Stores seed — 1 admin, 4 sellers, 4 buyers; 5 stores with payoutDetails + shippingConfig | ⏳ |
| P16 | Standard products seed — 20 products, all categories, custom fields, custom sections, Unsplash/YouTube, isPromoted/isFeatured | ⏳ |
| P17 | Auctions seed — 6 auctions (active/upcoming/ended) + bids (4–8 per active auction) | ⏳ |
| P18 | Pre-orders seed — 5 pre-orders (active/upcoming/soldOut states) | ⏳ |
| P19 | Content seed — 8 blog posts + 6 events + 20 FAQs (all with rich text, Unsplash, YouTube) | ⏳ |
| P20 | Carousel (6 slides) + all 19 homepage section types (including social-feed disabled) | ⏳ |
| P21 | Reviews (15) + orders (10, all statuses) | ⏳ |
| P22 | Coupons (5, all types incl. exhausted) + notifications (10, all types) | ⏳ |

### Tier 5 — Admin Core CRUD
| # | Task |
|---|------|
| A2 | Admin Categories CRUD |
| A1 | Admin Products CRUD (3-mode: standard/auction/preorder) |
| A3 | Admin Coupons CRUD |
| A4 | Admin Blog CRUD + RichTextEditor |
| A5 | Admin FAQs CRUD |
| A6+F3 | ~~Admin Carousel CRUD~~ (superseded by CF1) |
| N3 | Admin Stores full management |
| B1 | Admin Users role/ban management |
| B2 | Admin Orders status + refund UI |
| N2 | Admin Reviews full moderation |

### Tier 6 — Admin Finance & CMS
| # | Task |
|---|------|
| M1 | Admin Analytics dashboard |
| M3 | Admin Payouts processing + CSV export |
| F1 | ~~Homepage Sections CMS~~ (superseded by HS1–HS5) |
| N1 | Site Settings — superseded by VA8 (all 12 groups) |
| F5 | Navigation CMS |
| I1 | Deals/Featured inline toggles |
| B5 | Bids cancel/void |
| B6 | Newsletter export + unsubscribe |
| B7 | Contact submissions mark-read + archive |
| I3 | Sections seed reset button |

### Tier 7 — Store/Seller
| # | Task |
|---|------|
| O1 | Store slug management |
| O2+C5 | Storefront full edit (bio, policies, branding) |
| C6 | Shipping config |
| C7 | Payout settings |
| G1 | Product Templates CRUD |
| G2 | Template apply in product forms |
| C1 | Store Auctions create/edit |
| C2 | Store Pre-Orders create/edit |
| C3 | Store Coupons edit page |
| C4 | Store Orders detail + status |
| O4 | Store Analytics seller view |
| O5 | Shiprocket auto-create on ship |

### Tier 8 — User Account
| # | Task |
|---|------|
| D1 | Wishlist page wiring |
| D2 | User Profile full edit |
| D3 | User Settings complete |
| D4 | Notifications view + mark read + delete |
| D5 | Messages (deferred) |

### Tier Q — Query/Sieve via Firebase Function
| # | Task |
|---|------|
| Q1 | `listingProcessor` Firebase HTTPS Function (filters→search→sort→paginate, cursor) |
| Q2 | Standardise listing API param names (`f=`, `s=`, `p=`, `ps=`, `q=`, `cursor=`) |
| Q3 | Delegate listing APIs to `listingProcessor` Firebase Function |
| Q4 | Update appkit listing views for new params + cursor support |
| Q5 | Firestore composite indexes for filter+sort combos |
| Q6 | Infinite scroll (`useInfiniteScroll` hook + IntersectionObserver) on public listing pages |

### Tier V-A — Admin CRUD Editor Forms
| # | Task |
|---|------|
| VA1 | ~~Admin Carousel form~~ (superseded by CF1) |
| VA2 | Admin Products CRUD 3-mode editor (see A1) |
| VA3 | Admin Categories CRUD editor (see A2) |
| VA4 | Admin Blog CRUD editor (see A4) |
| VA5 | Admin FAQs CRUD editor (see A5) |
| VA6 | Admin Coupons CRUD editor (see A3) |
| VA7 | Admin Navigation CMS editor |
| VA8 | Admin Site Settings — 12-group comprehensive form (supersedes N1): Branding, Appearance, Announcement, SEO, Contact+Social, Watermark, Fees+Commissions, Integrations+Keys, Shipping Defaults, Auction Config, Platform Limits, Legal Policies |
| VA9 | Admin Orders status + tracking form |
| VA10 | Admin Users role/ban form |
| VA11 | Admin Reviews moderation actions |
| VA12 | Admin Stores management form |
| VA13 | Admin Payouts mark-paid + CSV export |
| VA14 | Admin Newsletter unsubscribe + CSV export |
| VA15 | Admin Contact submissions mark-read + archive |
| VA16 | Admin Bids per-auction list + cancel/void |
| VA17 | Admin Feature Flags real UI |
| VA18 | Admin Media Library upload + delete |
| VA19 | Admin Analytics charts wired to real data |

### Tier V-B — Store/Seller Forms
| # | Task |
|---|------|
| VB1 | Store Coupon create/edit form |
| VB2 | Store Order detail + status update |
| VB3 | Store Payout request / withdraw form (NEW) |
| VB4 | Store Storefront full edit |
| VB5 | Store Shipping config form |
| VB6 | Store Payout settings form |
| VB7 | Store Addresses CRUD |
| VB8 | Store Auction create/edit |
| VB9 | Store Pre-Order create/edit |
| VB10 | Store Analytics wired |

### Tier V-C — User Account Forms & Flows
| # | Task |
|---|------|
| VC1 | User Order detail full render |
| VC2 | User Order invoice download (NEW) |
| VC3 | User Profile full edit |
| VC4 | User Settings password/email/privacy |
| VC5 | User Notifications view + mark read |
| VC6 | User Wishlist page wiring |
| VC7 | Message system Firebase RTDB wiring |

### Tier V-D — Public Pages & Navigation
| # | Task |
|---|------|
| VD1 | /support Help Centre page |
| VD2 | Footer dead link audit + fix |
| VD3 | generateMetadata + social share preview metadata for all detail pages (see SL4) |
| VD4 | Category + brand display on product cards + filters |
| VD5 | Store profile on product detail (not user profile) |
| VD6 | Brands listing page |
| VD7 | Fix brand name: "LetItRip" → "LetiTrip" throughout `messages/en.json` — global search + replace; fix all `metaDescription` values too |
| VD8 | Rewrite `about` page content in `en.json` to be collectibles-specific (Pokémon TCG, Hot Wheels, Beyblades, anime figures) — not generic marketplace boilerplate |
| VD9 | Expand `becomeSeller` (9 keys → ~25) + rewrite `sellerGuide` to be collectibles-specific (card grading, vintage diecast photography, pricing sealed ETBs) |
| VD10 | Expand legal policy content in `en.json`: `terms` (add India IT Act + Consumer Protection Act, collectibles-specific rules), `privacy` (DPDP Act 2023), `cookies` (categorised opt-out), `refundPolicy` (sealed/graded/auction/pre-order rules) |

### Tier R — CRUD Table UX Standard
| # | Task |
|---|------|
| R1 | All CRUD tables: row action menus + tooltips + success/error feedback on every action |

### Tier W — Cart & Wishlist Integrity
| # | Task |
|---|------|
| W1 | Cart stale data validation on open (auth + localStorage) |
| W2 | Wishlist stale data validation on open |
| W3 | Out-of-stock section in cart (show, don't remove; disable checkout if all OOS) |
| W4 | Cart item product link — opens product detail in new tab (all types) |

### Tier X — Code Quality
| # | Task |
|---|------|
| X1 | Fix all TypeScript issues: async params (Promise<>) + eliminate `as any` casts |
| X2 | Toast standardisation — replace all `setSaveMessage`/`setSuccessMsg` with `useToast` |
| X3 | Dark mode + responsive fixes for admin CRUD editor forms |
| X4 | Responsive + themed CRUD forms — global checklist (375px / 768px / dark mode / tokens) |
| X5 | Replace skeleton `loading.tsx` files with `PageLoader` component + 15s timeout/error |
| X6 | Media filename slug convention — pass resource slug to `generateMediaFilename()` in all upload handlers |
| X7a | Extend CSS token system — add missing semantic palette tokens (emerald/amber/rose/sky/purple/teal/green/slate) + social brand color tokens to `globals.css` / appkit tokens |
| X7b | Replace all hardcoded color violations — 759 hex occurrences in 60 CSS files + 13 TSX inline-style files + `DevToolbar.tsx` |
| X8a | Extend Tailwind config + appkit tokens for layout utilities — breakpoint aliases (`@screen md`), z-index CSS vars (`--appkit-z-modal` etc.), component size tokens (`--appkit-size-input-md`), grid min tokens, shadow vars, typography vars |
| X8b | Replace all hardcoded layout violations — 60+ raw `@media` px queries, 30 z-index integers, 106+ hardcoded px heights, 63 raw box-shadows, 18 grid minmax px, 9 font-size: 10px, 13 line-height/letter-spacing raw values |

### Tier HS — Homepage Sections CMS
| # | Task |
|---|------|
| HS1 | Extend section schemas — add `custom-cards` + `google-reviews` types; enhance resource configs with `sortBy`/`filterByCategory`/`maxCount`/`loop`; add Google API credentials to SiteSettings; fix `carousel` in POST validation |
| HS2 | Complete all 11 missing admin section builders (welcome, trust-indicators, categories, brands, banner, features, reviews, whatsapp-community, faq, blog-articles, newsletter) — proper forms, no JSON editor, all image fields use `MediaUploadField` |
| HS3 | Enhance 7 existing resource builders (products/auctions/pre-orders/stores/events/reviews/social-feed) — add sort/filter/count/loop; fix New Section modal (type-selector grid); `useToast` + `UnsavedChangesModal` |
| HS4 | Google Business Reviews — API proxy route (`/api/social-feed/google-reviews`), `GoogleReviewsSection` RSC, builder form, credentials in VA8 ⑧Integrations |
| HS5 | Custom Cards section — `CustomCardsSection` component (grid/row/masonry layouts, image+text+buttons+form embed per card, auto-scroll), builder form in AdminSectionsView |

### Tier CF — Carousel & Feed
| # | Task |
|---|------|
| CF1 | Hero Carousel full redesign — schema (`background`/`zone`/`settings`/`hover`), component (full-height, 4 bg types, configurable hover, per-slide autoplay delay, no blur), admin list (drag-reorder + RowActionMenu), admin editor form (zone picker UI, 4-tab bg, cards 0–2, button repeater, live preview), API routes (GET/POST/PUT/DELETE/reorder) |

### Tier S — Social Media Feed Sections
| # | Task |
|---|------|
| S1 | Social feed API route + shared fetcher (`/api/social-feed`, Instagram/Facebook/TikTok/DeviantArt) |
| S2 | `social-feed` section type — `SocialFeedSection` RSC + `SocialPostCard` component |
| S3 | Admin sections builder for `social-feed` type in `AdminSectionsView` |
| S4 | Site settings credentials — TikTok + DeviantArt fields; expose in VA8 ⑧Integrations |
| S5 | Seed data — disabled sample `social-feed` section in homepage sections seed |

### Tier GP — Grouped Listings *(standard products + pre-orders only; depth = 1)*
| # | Task |
|---|------|
| GP1 | Schema (`groupId`, `isGroupParent`, `groupParentSlug`, `groupChildSlugs`, `groupTitle` on `ProductDocument`) + `ShowGroupSection` component — parent view shows children row, child view shows parent + siblings row; both collapsible; wired into `belowFold` |
| GP2 | Edit-screen "Group settings" panel — 3 states (not in group / is parent / is child); parent state has "Add child" modal with 2 tabs: (1) minimal create-new form (title, slug, price, condition, images — rest inherited read-only), (2) link-existing searchable dropdown; "Dissolve group" + "Leave group" actions; all writes atomic batch |

### Tier SC — Sub-listing Categories *(all listing types: products, auctions, pre-orders)*
| # | Task |
|---|------|
| SC1 | `sublisting_categories` Firestore collection + `SublistingCategoryDocument` schema + `SublistingCategoriesRepository` + `sublistingCategoryId` field on `ProductDocument` + admin + public API routes |
| SC2 | Admin CRUD — `AdminSublistingCategoriesView` list + `AdminSublistingCategoryEditorView` form; routes `/admin/sublisting-categories` + add to admin sidebar |
| SC3 | `sublistingCategoryId` `DynamicSelect` on all listing forms (sole linking mechanism, works like category field, inline-create supported) + `SublistingCarouselSection` collapsible component on all detail page `belowFold` slots |
| SC4 | Public page `src/app/[locale]/sublisting-categories/[slug]/page.tsx` — category header + paginated listing grid + `generateMetadata` + `ROUTES.PUBLIC.SUBLISTING_CATEGORIES` constant |

---

## ⛔ DO NOT BREAK — GOLDEN RULES (non-negotiable, apply to every single task)

> The app must always be in a working, deployable state. Every commit must pass `npx tsc --noEmit` and leave the UI functional. We go from current state → finished state incrementally — never through a broken intermediate state.

### UI must never break
- If a feature is **missing** (no data, no config, no API key) — show an empty state, a placeholder, or hide the section gracefully. **Never crash the page.**
- If a **field is renamed** or **removed from a schema** — treat it as optional with a fallback. Old data must still render without error.
- If a **component prop is missing** — every new prop must have a default. Components fail gracefully, not loudly.
- If a **page has no data** — render a sensible empty state (`EmptyState` component), not a blank white screen or thrown error.
- **Spelling/naming changes** (e.g., renaming a prop or event key) are applied in one atomic commit covering both producer and consumer. Never leave a half-renamed codebase.
- **Schema breaks are acceptable** (TypeScript will catch them) — fix them before committing. UI runtime breaks are not.

### No JSON config editors for users
- **Admin forms must always be proper form UI** — inputs, selects, toggles, repeaters, media pickers. Never expose a raw JSON textarea or a `<pre>` of config to the user.
- Configs are saved as structured Firestore documents internally — that's fine. But the UI layer that produces them must be a real form.
- If a section type has no builder yet, show a "Builder coming soon" placeholder — not a JSON textarea.
- All image/media fields in admin forms use `MediaUploadField` (existing component at `appkit/src/features/media/upload/MediaUploadField.tsx`) — never a plain URL text input.

### Content must be LetiTrip-specific
- **Brand name is "LetiTrip"** (capital L, lowercase i, capital T) — never "LetItRip", "Letitrip", "letItRip". Run a grep after every content update to verify.
- **No generic marketplace boilerplate** — every public page must reference the actual collectibles niche: Pokémon TCG, Yu-Gi-Oh!, Hot Wheels, Beyblades, anime/action figures, or the real brand names (Bandai, Mattel, Konami, etc.).
- **No empty `sections[]` arrays** in en.json — if a policy or how-to section exists in the schema, it must have real content.
- **Translation keys that say "coming soon"** are only acceptable for features gated behind a feature flag. Static page content must never say "coming soon" as a permanent placeholder.

### No hardcoded colors or layout values
- **Never use `#hex`, `rgb()`, or `rgba()` in component CSS files or inline `style={}` props.** All colors via `var(--appkit-color-*)` or Tailwind semantic tokens. Social brand colors: `var(--appkit-color-instagram)` etc.
- **Never use raw pixel values for breakpoints, z-index, spacing, font sizes, border-radius, or shadows** in component CSS files or `style={}` props. Use: `@screen md {}`, `var(--appkit-z-modal)`, `var(--appkit-size-input-md)`, `var(--appkit-shadow-lg)`, `var(--appkit-font-size-2xs)`, `var(--appkit-grid-min-card)`.
- Token definition files (`globals.css`, `tokens.css`, `tailwind.config.ts`) and SVG assets are the only exceptions.
- Tailwind arbitrary syntax (`bg-[#ff0000]`, `p-[44px]`, `z-[50]`, `text-[10px]`) is banned — use a named token class.

### Reusability rule
- **Before building any new component**, search appkit for an existing one that can be extended. Prefer enhancing over duplicating.
- Every new UI primitive (card, badge, layout wrapper, empty state, status chip) belongs in `appkit/src/ui/`. Every new feature component belongs in `appkit/src/features/[domain]/`.
- The `src/` (Next.js app) must **only** contain page files, route handlers, and thin wrappers. All logic and UI goes in appkit.
- If a component serves 2+ pages, it belongs in appkit, not inline in a page file.

### Navigation, search, and slug system must never regress
- The **public navigation** (navbar, mobile bottom bar, category menu, breadcrumbs) must always render correctly. Never change nav item routes without updating all links.
- The **dashboard menus** (admin sidebar, store sidebar, user sidebar) must stay fully functional. Adding a menu item is fine; removing or renaming without updating all references is not.
- The **search system** (search bar, query params `q=`, `f=`, `s=`, `p=`, `ps=`) must keep working. Never change param names without updating all callers.
- The **sticky toolbars** (listing page filter bars, bulk action bars, sort controls) must remain visible and functional on scroll.
- The **slug system** is sacred — all resource IDs equal their slugs. All cross-reference fields (`storeId`, `categorySlug`, `brandSlug`, `parentId`, `productId`) must point to real documents. Every new resource type must register its prefix in the slug table below.

### Slug prefix registry (all resources, current + planned)

| Resource | Firestore Collection | Prefix | Example ID/slug |
|----------|---------------------|--------|-----------------|
| Product (standard) | `products` | `product-` | `product-hot-wheels-redline-1969` |
| Auction | `products` | `auction-` | `auction-pokemon-charizard-psa9` |
| Pre-order | `products` | `preorder-` | `preorder-pokemon-sv5-booster-box` |
| Store | `stores` | `store-` | `store-cardgame-hub` |
| Category | `categories` | `category-` | `category-pokemon-cards` |
| Brand | `brands` | `brand-` | `brand-bandai` |
| Event | `events` | `event-` | `event-pokemon-tournament-june` |
| Blog post | `blogPosts` | `blog-` | `blog-how-to-grade-pokemon-cards` |
| Review | `reviews` | `review-` | `review-product-xxx-user-yyy` |
| User profile | `users` | `user-` | `user-seller-cards` |
| FAQ | `faqs` | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupons` | `coupon-` | `coupon-welcome10` |
| Section | `homepageSections` | `section-` | `section-featured-products` |
| Carousel slide | `carouselSlides` | `slide-` | `slide-hero-homepage` |
| Nav item | `navItems` | `nav-` | `nav-new-arrivals` |
| Order | `orders` | `order-` | `order-ravi-001` |
| Bid | `bids` | `bid-` | `bid-charizard-auction-ravi-1` |
| Notification | `notifications` | `notif-` | `notif-order-shipped-001` |
| Ad slot | `ads` | `ad-` | `ad-after-hero-homepage` |
| Payout | `payouts` | `payout-` | `payout-store-cardgame-001` |
| Address | subcollection | `addr-` | `addr-ravi-home` |
| Sub-listing category | `sublisting_categories` | `sublisting-` | `sublisting-base-set-charizard-108-120` |

---

## HOW TO WORK (follow this loop for every task)

1. **Read `crud-tracker.md`** — check which task is next (⏳), mark it 🔄
2. **Read** the relevant source files before writing a single line
3. **Plan** in 3–5 bullets what to change and why
4. **Implement** the smallest correct change — enhance existing components rather than duplicating
5. **Verify** — `npx tsc --noEmit` must be 0 errors; visually confirm in browser
   - All new **forms** must pass: mobile 375px ✓ | tablet 768px ✓ | dark mode ✓ | tokens only (no hardcoded hex) ✓ | focus rings ✓ | error states ✓ | submit button loading/disabled state ✓
   - All new **actions** must show result: success → `showToast` + navigate/re-fetch | failure → `showToast(reason, "error")`. No `setSaveMessage` state divs.
   - All new **page/layout files** that access `params`/`searchParams` must use `Promise<{...}>` + `await` (Next.js 15).
   - All **media upload handlers** must pass `slug` to `generateMediaFilename()` so filenames include the resource slug.
   - `id === slug` is enforced for every resource. When creating/editing, the Firestore document ID must be set to the slug value. Every cross-reference field (`storeId`, `categorySlug`, `brandSlug`, `parentId`) must point to a real document.
   - **No page may crash** because a prop/field is missing — every optional data point must have a fallback.
6. **Commit** with format: `fix/feat(scope): description` — one task, one commit. Both appkit and letitrip commits if both changed.
7. **Seed** — does this change need seed data? If yes, update. If no, note it.
8. **Update `newchange.md`** — prepend a new Part entry describing what changed
9. **Update `crud-tracker.md`** — mark task ✅, fill Part #, update Summary stats + timestamp
10. **Move to next task** in the queue

### 30-minute rule
> If you are mid-task and 30 minutes have passed: update `crud-tracker.md` timestamp and add
> a progress note to the 🔄 row. Do not wait until the task is done to touch the tracker.

### Build cycle for appkit changes:
```bash
npm run watch:appkit   # keep running while editing appkit/src/
npm run dev            # Next.js dev server
npx tsc --noEmit       # must pass before commit
```

`src/` changes take effect immediately — no rebuild needed.

---

## COMPONENT REUSE — CRITICAL

**Before building any component, check if it already exists in appkit.**

### Confirmed existing components (do NOT recreate):

| Component | Location | Use for |
|-----------|----------|---------|
| `RichTextEditor` | `appkit/src/ui/components/RichTextEditor.tsx` | Editing rich content — just import and wire |
| `BidHistory` | `appkit/src/features/products/components/BidHistory.tsx` | Bid history display on auction pages |
| `MakeOfferForm` | `appkit/src/features/products/components/MakeOfferForm.tsx` | Offer submission form |
| `PlaceBidForm` | `appkit/src/features/products/components/PlaceBidForm.tsx` | Auction bid form |
| `ProductForm` | `appkit/src/features/products/components/ProductForm.tsx` | Seller product create/edit — extend for auction/preorder modes |
| `AddressForm` | `appkit/src/features/account/components/AddressForm.tsx` | Address create/edit |
| `AddressSelectorCreate` | `appkit/src/features/account/components/AddressSelectorCreate.tsx` | Pick or create address inline |
| `StoreAddressSelectorCreate` | `appkit/src/features/stores/components/StoreAddressSelectorCreate.tsx` | Store pickup address pick/create |
| `DynamicSelect` | `appkit/src/ui/components/DynamicSelect.tsx` | Async selects — base for inline-create selects |
| `RowActionMenu` | `appkit/src/ui/components/RowActionMenu.tsx` | Per-row action menus in list views |
| `BulkActionBar` | `appkit/src/ui/components/BulkActionsBar.tsx` | Bulk actions toolbar on lists |
| `ConfirmDeleteModal` | `appkit/src/ui/components/ConfirmDeleteModal.tsx` | Confirm destructive actions |
| `WishlistView` | exported from `@mohasinac/appkit/client` | User wishlist page |
| `ProfileView` | `appkit/src/features/account/components/ProfileView.tsx` | User profile display |
| `MessagesView` | `appkit/src/features/account/components/MessagesView.tsx` | Messaging (with ChatList + ChatWindow) |
| `UserNotificationsView` | `appkit/src/features/account/components/UserNotificationsView.tsx` | Notifications list |
| `ReviewModal` | `appkit/src/features/reviews/components/ReviewModal.tsx` | Full review detail modal |
| `AdminListingScaffold` | `appkit/src/features/admin/components/AdminListingScaffold.tsx` | Admin list page template |
| `AdminAnalyticsCharts` | `appkit/src/features/admin/components/analytics/` | Revenue/orders charts (already exist) |
| `SideDrawer` | `appkit/src/ui/components/SideDrawer.tsx` | All create/edit side forms |
| `ListingLayout` | `appkit/src/ui/components/ListingLayout.tsx` | Public listing pages |
| `SlottedListingView` | `appkit/src/ui/components/SlottedListingView.tsx` | Dashboard listing tables |
| `usePendingFilters` | `@mohasinac/appkit/client` | Deferred filter state |
| `useUrlTable` | `@mohasinac/appkit/client` | URL-backed pagination/sort/search |
| `FilterDrawer` | Inside `ListingLayout` | Do not duplicate |
| `useProfile` / `useUpdateProfile` | `@mohasinac/appkit/client` | User profile hooks |
| `useAddresses` etc. | `@mohasinac/appkit/client` | Address management hooks |
| `useGuestWishlist` etc. | `@mohasinac/appkit/client` | Wishlist hooks |
| `ImageCropModal` | `@mohasinac/appkit/client` | Avatar / image crop |

### New components to create (confirmed do NOT exist):
- `RichTextRenderer` — wraps DOMPurify + dangerouslySetInnerHTML with prose styling
- `AdminCategoryEditorView` — category create/edit form
- `AdminCouponEditorView` — coupon create/edit form (complex conditional)
- `AdminBlogEditorView` — blog post create/edit form
- `AdminFaqEditorView` — FAQ create/edit form
- `AdminCarouselEditorView` — carousel slide create/edit form
- `AdminProductEditorView` — admin product form (extends ProductForm with admin fields)
- `AdminBrandEditorView` + `AdminBrandsView` — new brands feature
- `MediaPickerModal` — wraps AdminMediaView in a Modal with onSelect callback
- `CustomFieldsEditor` — key/type/value/unit row builder

Anti-patterns:
```tsx
// ❌ custom filter drawer state
const [filterOpen, setFilterOpen] = useState(false);
// ❌ recreating what exists
import { MyRichTextEditor } from "./MyRichTextEditor"; // use appkit RichTextEditor
// ❌ raw dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: content }} />
// ✅ use RichTextRenderer (new) for display
<RichTextRenderer html={content} />
// ✅ use existing RichTextEditor for editing
import { RichTextEditor } from "@mohasinac/appkit/client";
```

---

## COMMIT FORMAT

```
fix(phase-X.Y): <verb> <what>
feat(nav): <verb> <what>
wire(phase-X.Y): <page> slot-shells
seed(phase-X.Y): <collection> seed data

- bullet: file A — what changed
- bullet: file B — what changed
- Root cause: one sentence
```

Never commit with TSC errors. Never batch multiple tasks in one commit.

---

## WHAT NOT TO DO

- Do not refactor beyond the current task
- Do not add comments explaining what code does
- Do not run `git push` unless asked
- Do not skip `newchange.md` update — always prepend after completing a task
- Do not skip `crud-tracker.md` update — update after every task AND every 30 minutes
- Do not update `INSTRUCTIONS.md §12 "LIVE SITE"` column — it is the reference, not current state
- Do not skip seed data when a UI fix exposed empty data
- Do not use `dangerouslySetInnerHTML` without going through `RichTextRenderer`

---

## SLUG FORMAT RULES — ENFORCED EVERYWHERE

All slug fields MUST start with the resource type prefix. This is the established appkit
convention (already used in `id-generators.ts` for Firestore document IDs) and must now be
applied consistently to all `slug` fields stored in Firestore and used in URLs.

### Prefix table (never deviate):

| Resource | Prefix | Example slug |
|----------|--------|-------------|
| Product (standard) | `product-` | `product-hot-wheels-redline-vintage` |
| Auction | `auction-` | `auction-pokemon-charizard-1st-edition` |
| Pre-order | `preorder-` | `preorder-dbz-goku-ultra-ego-tsume-art` |
| Store | `store-` | `store-mistys-water-cards` |
| Category | `category-` | `category-action-figures` |
| Brand | `brand-` | `brand-hot-wheels` |
| Event | `event-` | `event-summer-holo-sale-2026` |
| Blog post | `blog-` | `blog-how-to-grade-pokemon-cards` |
| Review | `review-` | `review-[productSlug]-[userId-short]` |
| User (public profile) | `user-` | `user-mohsin-c` |
| FAQ | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupon-` | `coupon-summer20` |
| Section | `section-` | `section-hot-wheels-franchise` |
| Navigation item | `nav-` | `nav-new-arrivals` |

### How to generate (always use the appkit utility):

```typescript
// appkit/src/utils/string.formatter.ts
import { slugify } from "@mohasinac/appkit";

// In seed data or form save handlers:
const slug = `product-${slugify(product.title)}`;
const slug = `auction-${slugify(product.title)}`;
const slug = `store-${slugify(storeName)}`;
const slug = `category-${slugify(categoryName)}`;
const slug = `brand-${slugify(brandName)}`;
const slug = `blog-${slugify(post.title)}`;
const slug = `event-${slugify(event.title)}`;
```

### Rules:
1. **Seed data** — every document with a `slug` field must use the prefixed format. Update any
   existing seeds that are missing the prefix (e.g., `"electronics"` → `"category-electronics"`,
   `"mistys-water-cards"` → `"store-mistys-water-cards"`)
2. **Forms** — slug input in create/edit forms must auto-generate from the title using the
   prefixed format and show a preview (`/stores/store-mistys-water-cards`)
3. **Repository findBySlug** — slug lookups in `products.repository.ts` and others must
   query the prefixed slug field (no transformation needed — slug is stored with prefix)
4. **API routes** — route params like `[slug]` receive the prefixed slug unchanged; pass
   directly to the repository
5. **Navigation / `generateMetadata`** — canonical URL for each page type is the standard
   route path; slug prefix reinforces SEO signal (e.g., `/products/product-hot-wheels-xxx`)
6. **Sitemap** — when building a sitemap, slug prefix confirms resource type without reading
   the document type field
7. **Slug uniqueness** — uniqueness is enforced across the same collection only; prefixes
   prevent cross-collection collisions if slugs are ever shared in a global namespace

### ID === Slug (critical for Next.js route stability):

Firestore document IDs MUST equal the slug field. This eliminates the `[id]` vs `[slug]`
route conflict in Next.js — there is only one identifier, which is both the doc ID and the
URL slug.

```typescript
// ✅ correct — id and slug are the same value
const slug = `product-${slugify(product.title)}`;
const doc = { id: slug, slug, ...rest };
db.collection("products").doc(slug).set(doc);

// ❌ wrong — separate id and slug
const doc = { id: firestore.doc().id, slug: "hot-wheels-vintage", ...rest };
```

Resources that MUST have id === slug:
products, auctions, pre-orders, stores, categories, brands, blog posts, events,
FAQs, sections, nav items.

Resources where id is NOT the slug (use system-generated IDs):
orders, bids, offers, reviews, carts, notifications, sessions, users (Firebase Auth UID).

### What NOT to do:
```typescript
// ❌ no prefix
slug: slugify(product.title)              // "hot-wheels-redline-vintage"
// ❌ wrong resource prefix
slug: `product-${slugify(auction.title)}` // auctions must use "auction-"
// ❌ manual string (not using slugify)
slug: "My Store Name"                     // not URL-safe
// ❌ id ≠ slug (causes [id] vs [slug] Next.js confusion)
{ id: "abc123", slug: "product-hot-wheels-xxx" }
// ✅ correct
const slug = `product-${slugify(product.title)}`;
{ id: slug, slug, ...rest }
```

---

## IMPORT RULES

- Client components → import from `@mohasinac/appkit/client`
- Server components/actions → import from `@mohasinac/appkit` or `@mohasinac/appkit/server`
- UI/layout → import from `@mohasinac/appkit/ui` or `@mohasinac/appkit/client`
- Never import server-only modules in client components

### Seed upsert behavior
All Firestore writes use `batch.set(ref, data, { merge: true })` — always upsert.
User auth records are always upserted; custom claims set for non-"user" roles.

---

## KEY FILE LOCATIONS

| What | Where |
|------|-------|
| **Tracker** | `d:\proj\letitrip.in\crud-tracker.md` |
| **Change log** | `d:\proj\letitrip.in\newchange.md` |
| **Gap analysis** | `d:\proj\letitrip.in\INSTRUCTIONS.md` |
| **Public layout** | `src/app/[locale]/LayoutShellClient.tsx` |
| **Admin layout** | `src/app/[locale]/admin/layout.tsx` |
| **Store layout** | `src/app/[locale]/store/layout.tsx` |
| **User layout** | `src/app/[locale]/user/layout.tsx` |
| **Cart** | `src/components/routing/CartRouteClient.tsx` |
| **Checkout** | `src/components/routing/CheckoutRouteClient.tsx` |
| **Seed files** | `appkit/src/seed/` |
| **Slug utility** | `appkit/src/utils/string.formatter.ts` (`slugify`) |
| **ID generators** | `appkit/src/utils/id-generators.ts` (prefix patterns) |
| **Field constants** | `src/constants/field-names.ts` |
| **API constants** | `src/constants/api.ts` |
| **Route constants** | `@mohasinac/appkit/client` (ROUTES) |
| **HeroCarousel** | `appkit/src/features/homepage/components/HeroCarousel.tsx` |
| **ProductDetailPageView** | `appkit/src/features/products/components/ProductDetailPageView.tsx` |
| **AdminSidebar** | `appkit/src/features/admin/components/AdminSidebar.tsx` |
| **StoreSidebar** | `appkit/src/features/store/components/StoreSidebar.tsx` |
| **UserSidebar** | `appkit/src/features/user/components/UserSidebar.tsx` |
| **Wishlist API** | `src/app/api/wishlist/route.ts` |
| **Auth me route** | `src/app/api/auth/me/route.ts` |
| **Seed endpoint** | `src/app/api/demo/seed/route.ts` |

---

## REFERENCE IMPLEMENTATIONS

Copy patterns from these files:
```
src/app/[locale]/events/[id]/page.tsx         ← detail page with all render props wired
src/app/[locale]/admin/events/page.tsx        ← admin list with full CRUD links
src/app/[locale]/admin/events/new/page.tsx    ← admin create page (AdminEventEditorView)
src/app/[locale]/admin/ads/[id]/edit/page.tsx ← admin edit page (AdminAdEditorView)
src/app/[locale]/store/products/new/page.tsx  ← seller create page pattern
```

---

## PER-TASK CHECKLIST

```
□ 1. TRACKER  — crud-tracker.md marked 🔄 at start
□ 2. CODE     — implemented, tsc 0 errors, browser verified
□ 3. COMMIT   — committed with correct format, one task per commit
□ 4. SEED     — updated or noted "no change needed" in commit
□ 5. NEWCHANGE — newchange.md prepended with new Part entry
□ 6. TRACKER  — marked ✅, Part# filled, Summary stats updated, timestamp refreshed
```

---

## ✅ COMPLETED TASKS (archive — Parts 1–44)

- **Part 44** — Franchise homepage sections + filterByBrand (9 new sections 18–26)
- **Part 43** — Firebase structured logging (`src/lib/logger.ts` + `src/lib/client-logger.ts`)
- **Part 42** — Bid button scroll fix + coupon product-type conflicts
- **Part 41** — Auction bid form wired + real product images in seed
- **Part 40** — Cursive font + settings toggle (Playfair Display, FontToggleClient)
- **Part 39** — User nav collapsible sidebar (UserSidebar variant="sidebar")
- **Part 37b** — Multi-coupon + partial checkout (appliedCoupons[], selectedItemIds)
- **Part 37** — Ads: no empty placeholder space (AdSlot returns null)
- **Part 36** — Homepage carousel mobile fix (gridRow: auto on mobile)
- **Part 33** — Events inline poll voting (PollInlineClient)
- **Part 32** — Order grouping + coupon persistence
- **Part 31** — HorizontalScroller infinite loop
- **Part 30** — Stores seed storeId verified correct
- **Part 29** — Store reviews on auction pages
- **Parts 27/28** — Order grouping + Bottom button bar verified
- **Part 26** — Mobile toolbar row layout
- **Part 24** — Searchable category filter verified
- **Part 23** — Offer logic (SellerOffersPanel + UserOffersPanel)
- **Part 22** — Collapsible filter sections
- **Part 21** — Filters apply-on-click + Dark Mode Theming
- **Part 20** — Titlebar/Dashboard Nav Icons + MakeOfferButton
- **Part 19** — Navigation (mobile bottom nav + desktop hamburger)
- **Parts 1–18** — Buy Now, navigation, auctions/pre-orders, seeding, slugs, filters

*Last updated: 2026-05-05 — crud-tracker.md created; 63 tasks queued. Task J5 (bids table) is next.*
