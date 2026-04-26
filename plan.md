## Plan: Unified Listing UX Rollout (Public + Admin + Seller)

---

## Build Issues and Resolutions

### Root Causes of Build Failures
- **Client Components Importing Server Code**: Client components (marked with "use client") were importing from `@mohasinac/appkit`, which includes server-side code like Firebase Admin SDK and Node.js modules (e.g., `fs`, `child_process`). This caused Next.js Turbopack to bundle server-only modules into client bundles, leading to "Can't resolve 'fs'" errors.
- **Barrel Exports Pulling in Unintended Dependencies**: The main `appkit/src/index.ts` barrel file exported everything, including server components and providers, causing transitive imports of server code in client builds.
- **Lack of Separate Entry Points**: No clear separation between client-safe and server-side exports, leading to incorrect imports.

### Correct Way to Export and Import from Appkit
- **Entry Points**:
  - `@mohasinac/appkit/client`: For client components, hooks, UI primitives, and client-safe features. Exports are marked with "use client" and exclude server dependencies.
  - `@mohasinac/appkit/server`: For server components, actions, and server-side logic.
  - `@mohasinac/appkit/ui`: For UI components and layout primitives.
  - `@mohasinac/appkit`: Main entry for general use, but avoid in client components to prevent server code inclusion.
- **Import Guidelines**:
  - Client components (pages with "use client"): Import from `@mohasinac/appkit/client`.
  - Server components and actions: Import from `@mohasinac/appkit` or specific sub-paths.
  - UI/layout: Import from `@mohasinac/appkit/ui` or `@mohasinac/appkit/client`.
- **Export Strategy**:
  - Client-safe items (UI, hooks, client providers) go in `client.ts`.
  - Server items stay in `index.ts` or `server.ts`.
  - Use `serverExternalPackages` in `next.config.js` to exclude server modules from client bundles.
- **Resolution Applied**: Added client exports to `client.ts`, updated client page imports, and configured `serverExternalPackages` to exclude Firebase and Node.js modules.

---

Standardize all included surfaces (public, admin, seller) to one shared listing visual system based on appkit ownership: desktop left filter sidebar, mobile full-width filter drawer, shared top toolbar (search/sort/list-grid/select/bulk), and route-param driven state (slug/path segment first) with apply-on-click filter behavior. Public category-detail and store-detail pages are explicitly in scope as listing-extensions of product pages with fixed parent context (current category/store locked while child inventory is filtered/listed). Product detail pages are also explicitly in scope via a Detail-Commerce pattern: desktop sticky action rail plus mobile sticky bottom action bar for quick actions (buy/add-to-cart/wishlist). Card designs are standardized across product, auction, pre-order, blog, event, store, review, and category cards, with pre-order cards explicitly aligned to product/auction interaction patterns. PII display must always show masked human-readable values (for example A*h) and never raw encrypted tokens (for example pii:v1:...). Navigation behavior must enforce mutually exclusive opening between dashboard sidebar (role nav) and public sidebar: opening one auto-closes the other; closing either does not auto-open anything. For non-list pages (detail/forms/analytics), keep the same visual frame but hide irrelevant controls to avoid forced/empty UI. The homepage must render all 18 sections (see section map below) with correct INR currency and masked PII.

### Phase 3 Addendum: Public Route Mock Views (ASCII) and Real-Data Contract

All mock views below are structural guides only. Runtime data source must be live server data via appkit actions/repositories; no local hardcoded arrays, no fake placeholders as primary content.

#### Events listing: /events

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Events                                                              │
│ Upcoming and active campaigns                                       │
├──────────────────────────────────────────────────────────────────────┤
│ [Event Card] [Event Card] [Event Card] [Event Card]                │
│  title      title      title      title                             │
│  starts/end starts/end starts/end starts/end                        │
│  status     status     status     status                            │
├──────────────────────────────────────────────────────────────────────┤
│ Pagination: < Prev | Page N of M | Next >                           │
└──────────────────────────────────────────────────────────────────────┘
Data contract:
- Source: listPublicEvents
- Empty state allowed only when API returns empty.
```

#### Event detail: /events/[id]

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Event Hero (cover image)                                            │
│ Title | Status Chip | Type Chip                                     │
│ Description                                                         │
├───────────────────────────────┬──────────────────────────────────────┤
│ Event timing + entry summary  │ Poll/Config snapshot                │
│ - startsAt                    │ - options / form fields (if any)    │
│ - endsAt                      │                                      │
├───────────────────────────────┴──────────────────────────────────────┤
│ Leaderboard (top 10)                                              │
│ #1 user *** points                                                  │
│ #2 user *** points                                                  │
└──────────────────────────────────────────────────────────────────────┘
Data contract:
- Source: getPublicEventById + getEventLeaderboard.
- Not-found path must render unavailable state (no mock body).
```

#### Event participate: /events/[id]/participate

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Participate in {event.title}                                        │
│ event.description                                                    │
│ Ends at: {event.endsAt}                                             │
├──────────────────────────────────────────────────────────────────────┤
│ [poll option radio list if configured]                              │
│ [survey/feedback fields if configured]                              │
│ [Submit Participation]  (disabled when closed)                      │
└──────────────────────────────────────────────────────────────────────┘
Data contract:
- Source: getPublicEventById.
- Form shape must derive from event config; never static one-field fallback as primary UI.
```

#### Search listing: /search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Search                                                              │
│ [query input.................................][Search]              │
├──────────────────────────────────────────────────────────────────────┤
│ Results grid                                                        │
│ [Product Card][Product Card][Product Card][Product Card]           │
│ [Product Card][Product Card][Product Card][Product Card]           │
└──────────────────────────────────────────────────────────────────────┘
No-results state:
- "No results for {q}" + recovery hint.
Data contract:
- Source: searchProducts.
- Canonical search route is segment-based (`/search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]`); base `/search?q=...` redirects to canonical route.
```

#### Promotions: /promotions/[tab]

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Promotions                                                          │
│ Latest offers and campaigns                                         │
├──────────────────────────────────────────────────────────────────────┤
│ Coupons                                                             │
│ [Coupon Card] [Coupon Card]                                         │
├──────────────────────────────────────────────────────────────────────┤
│ Deals                                                               │
│ [Product Card][Product Card][Product Card][Product Card]           │
├──────────────────────────────────────────────────────────────────────┤
│ Featured                                                            │
│ [Product Card][Product Card][Product Card][Product Card]           │
└──────────────────────────────────────────────────────────────────────┘
Data contract:
- Source: getPromotions (activeCoupons/promotedProducts/featuredProducts).
- Canonical tab route is segment-based (`/promotions/[tab]`); base `/promotions` redirects to `/promotions/deals`.
```

#### Sellers: /sellers and /sellers/[id]

```text
Index (/sellers)
┌──────────────────────────────────────────────────────────────────────┐
│ Sellers / Stores                                                    │
│ [Store Card][Store Card][Store Card]                               │
│ [Store Card][Store Card][Store Card]                               │
└──────────────────────────────────────────────────────────────────────┘

Detail (/sellers/[id])
┌──────────────────────────────────────────────────────────────────────┐
│ Public Profile                                                      │
│ Avatar + seller name + trust metadata                              │
│ Seller products / activity blocks                                   │
└──────────────────────────────────────────────────────────────────────┘
Data contract:
- /sellers source: StoresIndexPageView self-fetch path.
- /sellers/[id] source: route param -> PublicProfileView userId.
```

### URL Contract (SEO + SSR)

- Canonical URLs must use slugs and route params (path segments), not query params, for indexable navigation state.
- Every SEO/SSR tab selection in this plan must be encoded as a route param segment (for example `[tab]`), never query-only state and never local-only UI state.
- Query params are allowed only for non-canonical ephemeral UI state (for example transient panel open state) and must not be required to render the primary SSR content.
- Each canonical route must resolve server-side from route params alone, with metadata generation based on those params.
- Tabbed pages (FAQ, promotions, store pages, category detail pages, and other listing-extensions) must use segment navigation so crawler-discoverable URLs exist per tab/state.
- Exception: homepage FAQ interactions (accordion/category toggles inside the homepage section) are local UI state only and must not update route params or query params.
- For filtered listings, keep category/tab/page/sort in route params; treat the route as the SSR source of truth, and hydrate client controls from that route state.

**Canonical route templates (examples):**
- Products listing: `/products/category/[categorySlug]/sort/[sortKey]/page/[page]`
- Auctions listing: `/auctions/category/[categorySlug]/sort/[sortKey]/page/[page]`
- Categories listing: `/categories/sort/[sortKey]/page/[page]`
- Category detail listing-extension tabs: `/categories/[slug]/[tab]/sort/[sortKey]/page/[page]`
- Store detail listing-extension tabs: `/stores/[storeSlug]/[tab]/sort/[sortKey]/page/[page]`
- Promotions tabs: `/promotions/[tab]/category/[categorySlug]/sort/[sortKey]/page/[page]`
- FAQ tabs: `/faqs/[tab]`
- Search route with tab: `/search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]`
- Public profile tab: `/profile/[username]/[tab]`
- Notification center tab: `/user/notifications/[tab]`

Implementation checkpoint (2026-04-23):
- Canonical segment route families are now in place for category detail and store detail:
	- `/categories/[slug]/[tab]/sort/[sortKey]/page/[page]`
	- `/stores/[storeSlug]/[tab]/sort/[sortKey]/page/[page]`
- Canonical category and store segment routes render appkit-backed views directly (no local mock datasets).
- Metadata generation and canonical-link parity are validated for canonical promotions/search/category/store segment routes.
- Homepage section body rendering no longer uses the hardcoded full-page fallback bundle when section records are missing; section content is DB-driven.
- Event and blog cards now degrade gracefully for incomplete API payloads (safe title + non-blank image rendering), preventing blank-card regressions without introducing local mock data.

---

## Theme Color Audit

Live-site readback and token inspection do not match cleanly. The runtime design language currently reads as green-led with neutral zinc/slate surfaces and occasional blue-link/nav accents, while appkit tokens still describe a lime + magenta + cobalt Beyblade palette.

Observed current state:
- Dominant visible accent on the live homepage is green for trust, success, and action language.
- Core surfaces are neutral: white, zinc-50/100, slate-900/950 in dark mode.
- Blue remains acceptable as a secondary accent for nav and link treatment.
- Pink/magenta is still present in code, for example the current Deals link styling in TitleBarLayout and secondary dark-mode tokens, but it is not a strong part of the live brand read.

Recommendation for rollout:
- Keep green as the primary brand/action color across CTA buttons, active states, trust badges, notification emphasis, and deal chips.
- Keep cobalt blue only as a secondary/navigation accent for icons, links, and optional underline states.
- Keep surfaces and shells neutral: white/zinc in light mode and slate in dark mode.
- Do not introduce magenta/pink as a primary surface, pill, or hover language in the unified rollout unless the brand direction is intentionally changed later.
- When touching TitleBar, Sidebar, Navbar, Footer, and card highlights, normalize styling toward green + neutral + restrained blue, not green + pink.

Color-specific planning implications:
- TitleBar: Today's Deals should become a green pill/tag, not the current pink text-link treatment.
- Notification emphasis should stay green, matching the trust/success language already planned.
- Navbar and sidebar item icons can use mixed category colors, but active state and shell accents should stay green-first.
- Footer trust bar and newsletter CTA should use the same green-led primary treatment.
- If token cleanup is in scope, update appkit tokens CSS, appkit token constants, and consumer tailwind usage together so the documented palette matches the shipped UI.

### Theme System + Responsive Contract (applies to every page and mock)

This rollout needs one consistent visual contract across homepage, listings, detail pages, dashboards, forms, content pages, promotions, and admin tools. The mock layouts already differ by function; the theme system must make them feel like the same product.

**Base palette contract**
- Primary brand/action green: use current appkit primary scale as the working base. Anchor actions around `--appkit-color-primary-500` (`#65c408`) with hover at `primary-600`, soft surfaces at `primary-50/100`, and focus ring at `primary-500`.
- Secondary navigation blue: use cobalt only for links, tab underlines, informational badges, and secondary icon emphasis. Do not use cobalt as the main CTA fill when a green primary action exists on the same screen.
- Neutral shells: light mode uses white, zinc-50, zinc-100, zinc-200, zinc-900. Dark mode uses slate-950, slate-900, slate-800/60, slate-700, zinc-50, zinc-400.
- Semantic colors: success stays emerald, warning stays amber, error stays red, info stays sky. These are semantic only, not brand replacements.
- Magenta/pink: retain only as legacy token fallback until token cleanup lands. New mocks and new UI states should not introduce pink buttons, pills, active tabs, or focus language.

**Token usage by UI role**
- Primary CTA: green fill, white text, green hover, visible focus ring.
- Secondary CTA: neutral surface with green border/text or cobalt text, depending on emphasis level.
- Links: cobalt by default, cobalt-dark/underline on hover, never green unless the link is acting like a CTA.
- Active nav / selected filter / selected tab: green border, green text, soft green background.
- Informational tabs and tertiary nav: neutral text with cobalt accent line allowed.
- Success chips and trust badges: green or emerald only.
- Warning states: amber surface + amber icon + neutral text.
- Error states: red border/icon, avoid filling large page regions with red.
- Ad slots / sponsored placements: neutral/surface containers with explicit `Sponsored` label; never style ads as primary green CTAs unless the creative itself is the ad content.

**Surface hierarchy**
- App background: zinc-50 light, slate-950 dark.
- Primary content surface: white light, slate-900 dark.
- Elevated cards/modals/drawers: white with shadow light, slate-900/90 dark with stronger border.
- Input surface: white light, slate-800/60 dark, always with high contrast placeholder and border.
- Sticky bars (titlebar, bottom action bars, bulk toolbars): elevated surface + subtle border + slight blur only when necessary.

**Typography + emphasis rules**
- Headings: zinc-900 light / zinc-50 dark, never color-brand headings unless hero/banner context justifies it.
- Body text: zinc-700/800 light, zinc-200/300 dark.
- Muted/meta text: zinc-500/600 light, zinc-400/500 dark.
- Numeric/stat emphasis: use neutral text with green support accent, not rainbow color usage.
- Price emphasis: neutral high-contrast text; sale delta, discount tags, or positive movement can use green.

**Icon and badge rules**
- Category icons may vary in accent color, but shell selection, hover ring, and active state stay within the green-first system.
- Role badges should remain compact overlays and avoid strong saturated fills that compete with CTA color.
- Status badges use semantic colors, but badge chrome should remain consistent in shape and spacing across admin, seller, and public pages.

**Light and dark mode behavior**
- Do not invert page meaning between themes. The same hierarchy, selected states, and CTA prominence must remain recognizable in both modes.
- Dark mode should use slate surfaces, not pure black blocks, to preserve borders and elevation.
- Green remains primary in dark mode, but slightly brighter soft-green surfaces may be needed for selected states so they do not disappear into slate backgrounds.
- Cobalt links in dark mode need enough luminance contrast against slate-900 and slate-950.

**Responsive breakpoints**
- `xs`: `< 480px` — compact mobile, one-column, bottom nav, full-width bottom sheets.
- `sm`: `480–639px` — larger mobile, two-up card grids only when card width stays readable.
- `md`: `640–767px` — tablet portrait / large phone landscape, still mobile-nav-first.
- `lg`: `768–1023px` — tablet / small laptop, sidebars may appear only when content remains viable.
- `xl`: `1024–1279px` — standard desktop, persistent sidebars and two/three-column layouts.
- `2xl`: `1280px+` — wide desktop, larger gutters, extra whitespace, no uncontrolled line lengths.

**Global responsive rules**
- TitleBar remains one row on desktop; on mobile it compresses to logo + compact actions + sidebar trigger.
- Navbar is desktop-only; mobile uses bottom nav or top-level route chips where needed.
- Right public sidebar is overlay-based on all sizes; role dashboard nav becomes persistent left rail on desktop and bottom-sheet/drawer on mobile.
- Any page with filters uses persistent left filter panel only at desktop widths that still preserve useful content width; below that, use `FilterDrawer`.
- On mobile, tab strips with 3 or more options should default to a single `Select`/dropdown control to reduce horizontal crowding; keep tab buttons on desktop/tablet.
- Tables never overflow the viewport without strategy. On mobile, convert to cards, horizontally scroll only as a last resort, or reduce visible columns.
- Sticky bottom actions are mobile-first for commerce and selection flows; desktop keeps sticky side rail or top toolbar.
- Reserve height for async regions: ads, carousels, stats, chart areas, and media slots should not collapse then expand.

**Page-family responsive patterns**
- Homepage: desktop uses full-width stacked sections with roomy spacing; tablet reduces card counts per row; mobile turns most horizontal carousels into snap scrollers and compresses stats/trust cards into 2×2 grids.
- Listing pages: desktop = left filters + toolbar + grid/list content; mobile = tab dropdown + chips + filter drawer + sort drawer + 2-column or 1-column results depending on card density.
- Listing-extension pages (store/category detail): fixed parent hero stays pinned above child list; on mobile the hero condenses before filters/results begin.
- Detail-commerce pages: desktop = media left, summary/actions right sticky rail; mobile = media stack, summary below, sticky bottom CTA bar.
- Content pages (blog/event/FAQ/reviews): desktop may use right rail for metadata or ads; mobile collapses to single-column with metadata and secondary rails converted into collapsible sections.
- Account/seller/admin dashboards: desktop uses persistent left nav + content pane; mobile turns nav into drawer/bottom sheet and converts tables into card lists or priority-column layouts.
- Forms: desktop supports 2-column form+preview/media layouts only when label and input widths stay readable; mobile is strictly single-column with sticky footer actions and collapsible advanced sections.
- Auth pages: centered card on desktop, edge-to-edge padded panel on mobile.
- Promotions/search pages: use listing contract; tabs switch to mobile dropdown selector and persist in route state.

**Mobile collapsible sections (non-homepage)**
- Applies to listing, listing-extension, detail, promotions/search, admin, seller, account, checkout, and content pages.
- Convert secondary content into accordions/collapsible blocks on mobile: advanced filters, long metadata, shipping policies, specifications, side-rail cards, and audit/details panels.
- Keep only high-intent controls expanded by default (primary CTA, key summary, price/stock, result controls).
- Preserve deep links by mapping expanded section state to route-safe defaults when needed, but do not require expanded state for SSR output.

**Spacing contract**
- Section spacing desktop: `64–96px` vertical rhythm for public marketing sections.
- Section spacing interior pages: `24–40px` between major blocks.
- Card padding: `16px` compact, `20–24px` standard, `28–32px` large hero/stat cards.
- Mobile spacing should compress by one scale step, not collapse entirely.
- Gutter rules: `16px` mobile, `24px` tablet, `32px` desktop, `40–48px` wide desktop max.

**Grid density rules**
- Product / auction / pre-order cards: 5-up max on wide desktop only if card content still breathes; otherwise 4-up.
- Store / review / blog / event cards: 3-up max on standard desktop, 2-up tablet, 1-up or horizontal snap on mobile.
- Admin data grids: favor readability over density; hide secondary columns before shrinking typography.

**Component-level responsive behavior**
- Drawers: mobile drawers are full-width bottom sheets for filters, bulk actions, and role nav where possible.
- Modals: desktop center modal; mobile convert to full-width bottom sheet unless the interaction is destructive/confirmation-only.
- Breadcrumbs: full on desktop, truncated or single-back-link on mobile.
- Bulk toolbars: inline above table on desktop, takeover bar on mobile.
- Pagination: full number list on desktop, prev/next + compact page info on mobile.
- Search/filter chip rows: horizontal scroll, no wrapped multi-line chip walls on mobile.

**Per-page visual direction summary**
- Homepage: most expressive page; gradients and banners allowed, but still anchored by green + neutral surfaces.
- Product/listing surfaces: utility-first, cleaner, denser, less decorative.
- Blog/event/FAQ/reviews: editorial/content-first, softer backgrounds, wider reading measure, restrained accents.
- Admin/seller/user: operational clarity first; fewer gradients, more borders, strong table/card structure.
- Auth/checkout: high-trust, low-noise, maximum contrast, minimal decorative color.
- Promotions: same listing shell as search/products, with stronger badge language and sponsored slot labeling.

**Accessibility and responsive acceptance criteria**
- All text/background combinations must meet accessible contrast in both light and dark modes.
- Focus rings must remain visible against green, cobalt, white, and slate surfaces.
- No critical action may move below the fold without sticky recovery on mobile.
- No mock should assume hover-only affordances for essential behavior.
- Every card, table row, tab strip, and filter drawer must be operable at `320px` width without clipped controls.
- Theme changes must not alter semantic meaning: error cannot become decorative, info cannot be mistaken for primary CTA.

**Concrete per-mock application rule**
- Unless a mock explicitly overrides it, every mock in this document inherits: green primary CTA, cobalt secondary link/nav accent, neutral shells, semantic status badges, desktop sidebar + mobile drawer behavior where filters/nav exist, and single-column collapse on small screens before typography or touch targets are reduced.

### UX Optimization Pass (applies to all existing mocks)

The current mocks cover structure well; this pass optimizes them for lower friction, clearer hierarchy, safer actions, faster scanning, and better mobile recovery. These rules should be treated as upgrades to every mock already in the document.

**Global UX defaults**
- Default states must always be useful. Pages should open in a meaningful view without requiring filter interaction, tab changes, or extra clicks.
- The primary action must be obvious within the first viewport on desktop and mobile.
- One page should have one dominant action. Competing green CTAs in the same viewport should be reduced.
- Secondary actions should stay visible but visually calmer than the main task.
- Prefer progressive disclosure: advanced filters, metadata, and destructive controls should appear after intent, not by default.

**Navigation and orientation**
- Every page should answer three questions immediately: where am I, what can I do here, and what changed.
- Breadcrumbs or parent context headers should appear on detail/content pages, but mobile should collapse them to a back action plus current label.
- Tabs must be descriptive, count-backed where useful, and persist in route state when the page family supports canonical tab navigation.
- Tabs must be descriptive, count-backed where useful, and always persist in route params for SSR/SEO surfaces.
- On mobile, render tab navigation as a dropdown selector by default; only keep horizontal tab chips when there are two options and labels are short.
- Sidebar sections should default to the smallest number of open groups needed for orientation.

**Search, filter, and discovery UX**
- Search inputs should keep the current query visible at all times and show a clear reset affordance.
- Filter panels should lead with the 3 to 5 highest-value filters first; low-value filters move lower or behind “More filters”.
- Active filter chips must be removable individually and also offer a single `Clear all` action.
- Mobile filter drawers must show current active filter count in the trigger label.
- Sorting should default to the most useful business/user outcome, not a technically convenient order. Use `Relevance`, `Newest`, `Popular`, `Discount`, or `Ending Soon` appropriately.
- Empty search or filtered states must offer recovery: `Clear filters`, `Broaden search`, or `Back to top categories`, not just “No results”.

**Listing and card UX**
- Card scanning should prioritize image → title → price/value → status → primary action.
- Titles should clamp consistently; metadata should not push CTA rows to inconsistent heights.
- Wishlist, compare, checkbox, and quick CTA controls must remain isolated click zones and never steal the primary card click.
- In-feed ad cards and sponsored units must be visually distinct from organic cards and excluded from selection logic.
- List/grid toggle should remember the user’s last choice per page family when possible.

**Detail page UX**
- Product, event, blog, and review detail pages should surface the summary first, then supporting depth.
- Sticky action rails must never cover shipping, price, or trust signals.
- Mobile bottom action bars should keep only high-confidence actions visible; tertiary actions move to overflow.
- Long content pages should use section anchors or compact in-page navigation only when the content length justifies it.

**Form and checkout UX**
- Multi-step forms must show current step, remaining steps, and whether progress is saved.
- Inline validation should appear near the field, but page-level error summaries should appear above the form when submission fails.
- Destructive or high-risk actions need confirmation only when the action is expensive or irreversible; do not over-confirm simple flows.
- Checkout should always keep summary price, delivery choice, and next action visible without forcing full-page scrolling.
- Address creation, coupon apply, and payment selection should happen inline where possible rather than bouncing the user to separate pages.
- Create/edit flows launched from list pages should prefer a right-side sidepanel (drawer) over a full route transition when the task is quick, reversible, and does not require deep multi-step context.
- Sidepanel forms must preserve the underlying list context, support unsaved-change guarding, and allow close via X, backdrop click policy, and explicit Cancel.

**Dashboard, admin, and bulk-action UX**
- Dashboards should open with the most useful KPIs and a small set of high-frequency shortcuts, not every possible widget.
- Data tables should front-load the columns that drive action; secondary metadata can move into row detail or expanded view.
- Bulk actions should appear only after selection and should default to the safest non-destructive options first.
- Destructive bulk actions need confirmation plus a precise affected-count message.
- Admin forms should support draft/save, preview, and last-updated context when content is editorial or campaign-driven.

**Notifications, wishlist, and messaging UX**
- Notifications should separate urgent/actionable items from passive updates.
- Notification rows should expose the next action directly: `Track`, `Bid Again`, `View Offer`, `Read`.
- Wishlist should help the user act, not just store items. Surface stock state, auction timer, preorder ship date, and the best next CTA.
- Message and notification lists should preserve unread emphasis without overwhelming the page chrome.

**Content and public-info UX**
- Blog/event/review/FAQ pages should prioritize readability over density: stable line length, generous paragraph spacing, and clear section separators.
- Related content blocks should be useful but not interrupt the primary content flow too early.
- Public profile pages should show lightweight trust signals and recent activity, not expose unnecessary personal detail.
- FAQ pages should default to the first meaningful batch or all items when small; category and search tools should reduce effort, not add ceremony.
- On mobile, non-primary content modules (author bio, related links, policy notes, side metadata) should collapse behind clear section headers.

**State design requirements**
- Every major mock should be assumed to have loading, empty, success, warning, and error states even if the ASCII block shows only the happy path.
- Loading states should use skeleton shape parity with the final layout to reduce jank.
- Empty states must include recovery CTA, not just explanation text.
- Success feedback should be immediate and local when possible: toast, inline confirmation, optimistic update, or row status flip.
- Error messaging should explain the next step in plain language and avoid generic “Something went wrong” dead ends.

**Performance-feel UX**
- Above-the-fold content should appear before secondary rails, ads, and low-priority widgets.
- Reserve space for cards, charts, ad slots, and media to avoid cumulative layout shift.
- Prefer optimistic UI for wishlist, notifications read-state, and lightweight admin toggles when failure can be recovered cleanly.
- Heavy carousels should degrade gracefully to static rows or snap-scroll lists on low-width devices.

**Best-experience deltas by page family**
- Homepage: emphasize one primary hero action, reduce duplicate CTA noise, keep section transitions rhythmically consistent, and ensure each major section has a clear “why continue” cue.
- Listing pages: show result count, active filters, sort, and a visible recovery path in the same scan band.
- Promotions/search: tabs, filters, and counts must feel like one coherent control system, not stacked unrelated widgets.
- Product detail: trust signals, price, availability, and CTA must stay in one stable decision cluster.
- Event/blog pages: metadata should support the content, not compete with it.
- User account pages: the likely next action should be visible from the hub without requiring navigation guesswork.
- Seller/admin pages: default the view to action readiness, not reporting overload.

**Microcopy rules**
- Use action-first labels: `Apply Filters`, `Place Bid`, `Track Order`, `Save Changes`, `Copy Code`.
- Replace vague system wording with intent wording: `No results` → `No products match these filters`; `Submit` → `Save Campaign` / `Create Coupon`.
- Countdown, stock, and shipping copy should reduce uncertainty, not dramatize it.

**Concrete optimization rule for all mocks**
- If a mock includes search, filters, tabs, cards, forms, notifications, wishlist actions, or bulk actions, assume the best-experience version: useful defaults, visible recovery paths, isolated click zones, low-friction mobile behavior, and confirmation only where user risk justifies the interruption.

---

## Homepage: 18-Section Map

Live site (https://www.letitrip.in) confirmed sections vs appkit wiring status:

```
┌─────────────────────────────────────────────────────────────────┐
│  HOMEPAGE SECTIONS (top → bottom)                               │
├───┬────────────────────────────────┬──────────────┬─────────────┤
│ # │ Section                        │ Live         │ Wired in    │
│   │                                │ Status       │ appkit MHV? │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 0 │ Announcement Bar               │ ✅ Showing   │ ✅ Yes      │
│   │ "🎉 Up to 15% Off" dismissible │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 1 │ Hero Carousel                  │ ✅ Showing   │ ✅ Yes      │
│   │ 5 slides, auto-play            │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 2 │ Stats Counter                  │ ✅ Showing   │ ✅ Yes      │
│   │ 10k+ Products · 2k+ Sellers    │ ⚠️ Numbers   │             │
│   │ 50k+ Buyers · 4.8/5 Rating     │  mismatch    │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 3 │ Why Choose Us / Trust Features │ ✅ Showing   │ ✅ Yes      │
│   │ Secure · Fast · Returns · 24/7 │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 4 │ How LetItRip Works             │ ✅ Showing   │ ✅ Yes      │
│   │ 3 steps: Browse→Bid→Delivered  │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 5 │ Shop by Category               │ ✅ Showing   │ ❌ Missing  │
│   │ Horizontal scroller, 10+ cats  │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 6 │ Featured Products              │ ✅ Showing   │ ❌ Missing  │
│   │ Carousel, ~15 cards            │ ⚠️ enc:v1:   │             │
│   │                                │  in names    │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 7 │ Live Auctions                  │ ✅ Showing   │ ❌ Missing  │
│   │ Carousel with countdown+bids   │ ⚠️ $ not ₹  │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 8 │ Reserve Before It Ships        │ ✅ Showing   │ ❌ Missing  │
│   │ Pre-orders carousel, ships date│ ✅ ₹ correct │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│ 9 │ Featured Stores                │ ✅ Showing   │ ❌ Missing  │
│   │ Carousel, store banner+stats   │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│10 │ Events & Offers                │ ✅ Showing   │ ❌ Missing  │
│   │ Carousel, event cards          │ ⚠️ Empty     │             │
│   │                                │  card imgs   │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│11 │ Discover Amazing Deals         │ ✅ Showing   │ ❌ Missing  │
│   │ CTA banner: Shop Now + Browse  │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│12 │ What Our Customers Say         │ ✅ Showing   │ ❌ Missing  │
│   │ Review cards carousel          │ ⚠️ enc:v1:   │             │
│   │                                │  reviewer    │             │
│   │                                │  names/imgs  │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│13 │ Security You Can Trust         │ ✅ Showing   │ ❌ Missing  │
│   │ 4 cards: Encrypt/TLS/RBAC/Min  │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│14 │ Join Our Community             │ ✅ Showing   │ ✅ Yes      │
│   │ WhatsApp banner, 5k members    │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│15 │ Frequently Asked Questions     │ ✅ Showing   │ ❌ Missing  │
│   │ 5 Qs expandable accordion      │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│16 │ Stay Updated (Newsletter)      │ ✅ Showing   │ ❌ Missing  │
│   │ Email subscribe form           │              │             │
├───┼────────────────────────────────┼──────────────┼─────────────┤
│17 │ From Our Blog                  │ ✅ Showing   │ ❌ Missing  │
│   │ Carousel, 4 blog post cards    │ ⚠️ Empty     │             │
│   │                                │  card imgs   │             │
└───┴────────────────────────────────┴──────────────┴─────────────┘

Currently wired (MarketplaceHomepageView): 0,1,2,3,4,14
Missing from wiring: 5,6,7,8,9,10,11,12,13,15,16,17
```

### Live Homepage Bugs (confirmed from fetch)

```
┌────────────────────────────────────────────────────────────────┐
│  BUG                │ WHERE               │ ROOT CAUSE         │
├────────────────────────────────────────────────────────────────┤
│ Auction prices show │ Live Auctions sec.  │ Currency formatter │
│ "$32,000.00" not ₹  │ (section 7)         │ not receiving INR  │
│                     │                     │ config from site.ts│
├────────────────────────────────────────────────────────────────┤
│ Reviewer names show │ Reviews section     │ PII-Display bug:   │
│ enc:v1:... tokens   │ (section 12)        │ encrypted storage  │
│                     │                     │ values not decoded │
│                     │                     │ before render      │
├────────────────────────────────────────────────────────────────┤
│ Seller names show   │ Featured Products   │ Same PII-Display   │
│ enc:v1:... tokens   │ (section 6)         │ bug                │
├────────────────────────────────────────────────────────────────┤
│ Events cards blank  │ Events section      │ Event image/title  │
│ (no image/title)    │ (section 10)        │ missing from data  │
│                     │                     │ or render slot     │
├────────────────────────────────────────────────────────────────┤
│ Blog cards blank    │ Blog section        │ Blog image/title   │
│ (no image/title)    │ (section 17)        │ missing from render│
└────────────────────────────────────────────────────────────────┘
```

### Stats Counter: correct values (from live site)
- 10,000+ Products Listed
- 2,000+ Verified Sellers
- 50,000+ Happy Buyers
- 4.8/5 Average Rating

*(Current appkit hardcodes: 50k+ Buyers, 2.5k+ Sellers, 200k+ Orders, 400+ Cities — all wrong)*

---

## Homepage ASCII Mock — All 18 Sections (Desktop)

**Appkit components:** `MarketplaceHomepageView` (orchestrator) — `AnnouncementBar` (#0) — `HeroCarousel` (#1) — `StatsCounterSection` (#2) — `TrustFeaturesSection` (#3) — `HowItWorksSection` (#4) — `TopCategories` / `ShopByCategorySection` (#5) — `FeaturedProductsSection` (#6) — `FeaturedAuctionsSection` (#7) — `FeaturedPreOrdersSection` (#8) — `FeaturedStoresSection` (#9) — `EventsSection` (#10) — `CTABannerSection` (#11) — `CustomerReviewsSection` (#12) — `SecurityHighlightsSection` (#13) — `WhatsAppCommunitySection` (#14) — `FAQSection` (#15) — `NewsletterSection` (#16) — `BlogArticlesSection` (#17) — `FooterLayout` (below #17)

```
HOMEPAGE — DESKTOP (/)
┌──────────────────────────────────────────────────────────────────────┐
│ #0  ANNOUNCEMENT BAR                                                 │
│ 🎉 Up to 15% Off on Pokémon TCG this week — Use code SAVE15  [✕]    │
├──────────────────────────────────────────────────────────────────────┤
│ TitleBar                                                             │
│ [L] LetItRip  [🏷️ Today's Deals] [🛒] [🔍] [⇄] [🔔] [AU▾] [🌙] [≡] │
├──────────────────────────────────────────────────────────────────────┤
│ Navbar                                                               │
│ [🏠Home] [🛍Products] [🔨Auctions] [📅Pre-Orders] [⊞Categories]      │
│ [🏪Stores] [📆Events] [📖Blog] [⭐Reviews]                           │
├──────────────────────────────────────────────────────────────────────┤
│ #1  HERO CAROUSEL                                                    │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │                  ← [  SLIDE 1 IMAGE / HEADLINE  ] →           │   │
│ │         Season 5 Pokémon TCG — Shop the Drop                  │   │
│ │         [ Shop Now → ]   [ Browse Auctions → ]                │   │
│ │                  ○ ● ○ ○ ○  (5 dots)                          │   │
│ └────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│ #2  STATS COUNTER                                                    │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│ │  10,000+    │  │   2,000+    │  │  50,000+    │  │  4.8 / 5   │ │
│ │  Products   │  │  Verified   │  │   Happy     │  │   Rating   │ │
│ │   Listed    │  │  Sellers    │  │   Buyers    │  │   ★★★★★   │ │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ #3  WHY CHOOSE US — TRUST FEATURES                                   │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│ │ 🔒 Secure  │  │ ⚡ Fast    │  │ ↩ Easy     │  │ 🎧 24/7   │      │
│ │ Payments   │  │ Delivery   │  │ Returns    │  │ Support    │      │
│ └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
├──────────────────────────────────────────────────────────────────────┤
│ #4  HOW LETITTRIP WORKS                                              │
│                                                                      │
│  ①  Browse & Discover      ②  Bid or Buy Now     ③  Get Delivered   │
│  Search 10k+ listings  →  Place a bid or order → Delivered to door  │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ #5  SHOP BY CATEGORY                                                 │
│  ← [Figures] [TCG Cards] [Cosplay] [Dioramas] [Beyblade] [+] →      │
│     ┌──────┐  ┌──────┐   ┌──────┐  ┌──────┐   ┌──────┐             │
│     │[img] │  │[img] │   │[img] │  │[img] │   │[img] │             │
│     │      │  │      │   │      │  │      │   │      │             │
│     └──────┘  └──────┘   └──────┘  └──────┘   └──────┘             │
├──────────────────────────────────────────────────────────────────────┤
│ #6  FEATURED PRODUCTS                              [View All →]      │
│  ← ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ →           │
│    │  [img]   │ │  [img]   │ │  [img]   │ │  [img]   │             │
│    │Charizard │ │PSA10Pika │ │Beyblade  │ │Holo Mew  │             │
│    │ ₹4,990   │ │₹18,000   │ │   ₹890   │ │₹12,500   │             │
│    │[Add Cart]│ │[Add Cart]│ │[Add Cart]│ │[Add Cart]│             │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
├──────────────────────────────────────────────────────────────────────┤
│ #7  LIVE AUCTIONS                                  [View All →]      │
│  ← ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ →           │
│    │  [img]   │ │  [img]   │ │  [img]   │ │  [img]   │             │
│    │PSA10Pika │ │CharizHolo│ │SkyridgEe │ │LucarioEx │             │
│    │ ₹19,500  │ │ ₹8,200   │ │ ₹34,000  │ │ ₹6,800   │             │
│    │⏱ 2h 14m  │ │⏱ 0h 48m  │ │⏱ 4h 02m  │ │⏱ 1h 30m  │             │
│    │ 8 bids   │ │ 3 bids   │ │12 bids   │ │ 5 bids   │             │
│    │[Place Bid│ │[Place Bid│ │[Place Bid│ │[Place Bid│             │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
├──────────────────────────────────────────────────────────────────────┤
│ #8  RESERVE BEFORE IT SHIPS — PRE-ORDERS           [View All →]      │
│  ← ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ →           │
│    │  [img]   │ │  [img]   │ │  [img]   │ │  [img]   │             │
│    │S6 Booster│ │MetaFigSet│ │PikaDioram│ │CharizPlsh│             │
│    │  ₹1,200  │ │  ₹3,400  │ │  ₹5,800  │ │  ₹2,200  │             │
│    │📅 Ships   │ │📅 Ships   │ │📅 Ships   │ │📅 Ships   │             │
│    │  Jun 30  │ │  Jul 15  │ │  Aug 01  │ │  May 25  │             │
│    │[Pre-Order│ │[Pre-Order│ │[Pre-Order│ │[Pre-Order│             │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
├──────────────────────────────────────────────────────────────────────┤
│ #9  FEATURED STORES                                [View All →]      │
│  ← ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ →           │
│    │ [banner] │ │ [banner] │ │ [banner] │ │ [banner] │             │
│    │[logo]    │ │[logo]    │ │[logo]    │ │[logo]    │             │
│    │PokéVault │ │CardMaster│ │BeyStore  │ │AnimaFig  │             │
│    │ 24 items │ │ 18 items │ │  6 items │ │ 31 items │             │
│    │  4.9 ★   │ │  4.7 ★   │ │  4.2 ★   │ │  4.8 ★   │             │
│    │[Visit →] │ │[Visit →] │ │[Visit →] │ │[Visit →] │             │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
├──────────────────────────────────────────────────────────────────────┤
│ #10  EVENTS & OFFERS                               [View All →]      │
│  ← ┌──────────┐ ┌──────────┐ ┌──────────┐ →                        │
│    │  [img]   │ │  [img]   │ │  [img]   │                          │
│    │PokéFest  │ │BeyBattle │ │SummerSale│                          │
│    │ Apr 30   │ │ Apr 25   │ │  Jun 01  │                          │
│    │Mumbai    │ │Online    │ │Sitewide  │                          │
│    │[Register]│ │[Register]│ │[View]    │                          │
│    └──────────┘ └──────────┘ └──────────┘                          │
├──────────────────────────────────────────────────────────────────────┤
│ #11  DISCOVER AMAZING DEALS — CTA BANNER                             │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │  ✨ Thousands of collectibles. One marketplace.               │   │
│ │     [ Shop All Products → ]   [ Browse Auctions → ]          │   │
│ └────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│ #12  WHAT OUR CUSTOMERS SAY                                          │
│  ← ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ →           │
│    │ [AU] R** │ │ [AU] A** │ │ [AU] J** │ │ [AU] M** │             │
│    │  ★★★★★  │ │  ★★★★☆  │ │  ★★★★★  │ │  ★★★★★  │             │
│    │"Amazing  │ │"Great    │ │"Legit    │ │"Fast     │             │
│    │condition │ │seller, 5│ │seller,   │ │shipping, │             │
│    │ as desc."│ │ stars!"  │ │ 10/10"   │ │ loved it"│             │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
├──────────────────────────────────────────────────────────────────────┤
│ #13  SECURITY YOU CAN TRUST                                          │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│ │ 🔐         │  │ 🛡️         │  │ 👤         │  │ 🔑         │      │
│ │ End-to-End │  │ TLS 1.3    │  │ Role-Based │  │ Min-Priv   │      │
│ │ Encryption │  │ in Transit │  │ Access Ctl │  │ Tokens     │      │
│ └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
├──────────────────────────────────────────────────────────────────────┤
│ #14  JOIN OUR WHATSAPP COMMUNITY                                     │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ 💬  5,000+ members · Get deal alerts & auction updates        │   │
│ │     [ Join WhatsApp Community → ]                             │   │
│ └────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│ #15  FREQUENTLY ASKED QUESTIONS                                      │
│ ▶ How do auctions work?                                              │
│ ─────────────────────────────────────────────────────────────────    │
│ ▶ What is the return policy?                                         │
│ ─────────────────────────────────────────────────────────────────    │
│ ▶ How are sellers verified?                                          │
│ ─────────────────────────────────────────────────────────────────    │
│ ▶ How do I track my order?                                           │
│ ─────────────────────────────────────────────────────────────────    │
│ ▶ Can I cancel an order?                                             │
│                                          [ View All FAQs → ]        │
├──────────────────────────────────────────────────────────────────────┤
│ #16  STAY UPDATED — NEWSLETTER                                       │
│  📧 Get the latest drops, auctions, and deals in your inbox          │
│  [ Your email address          ]   [ Subscribe → ]                  │
├──────────────────────────────────────────────────────────────────────┤
│ #17  FROM OUR BLOG                                 [View All →]      │
│  ← ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ →           │
│    │  [img]   │ │  [img]   │ │  [img]   │ │  [img]   │             │
│    │Top 10    │ │PSA Grade │ │Season 5  │ │Beyblade  │             │
│    │Beyblades │ │Guide     │ │Preview   │ │History   │             │
│    │Apr 18    │ │Apr 12    │ │Apr 8     │ │Apr 2     │             │
│    │[Read →]  │ │[Read →]  │ │[Read →]  │ │[Read →]  │             │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
├──────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                               │
│ [LetItRip logo + tagline]  [About][Careers][Blog][Press]            │
│ [Products][Auctions][Pre-Orders][Stores][Events]                    │
│ [Sell on LetItRip][Seller Guide][Fees][Payouts]                     │
│ [Help Center][FAQs][Contact][Security][Privacy][Terms]              │
│ [Instagram][Twitter/X][Facebook][WhatsApp]                          │
│ © 2026 LetItRip. All rights reserved.                               │
└──────────────────────────────────────────────────────────────────────┘

HOMEPAGE — MOBILE (/)
┌─────────────────────────────────────┐
│ #0 🎉 15% Off · SAVE15    [✕]       │
├─────────────────────────────────────┤
│ [L] LetItRip              [AU] [≡]  │
├─────────────────────────────────────┤
│ #1 HERO CAROUSEL                    │
│ ┌─────────────────────────────────┐ │
│ │         [slide image]           │ │
│ │   Season 5 Pokémon TCG          │ │
│ │   [ Shop Now → ]                │ │
│ │        ○ ● ○ ○ ○               │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ #2 STATS (2×2 grid)                 │
│ ┌────────────┐ ┌────────────┐       │
│ │ 10,000+    │ │  2,000+    │       │
│ │ Products   │ │  Sellers   │       │
│ └────────────┘ └────────────┘       │
│ ┌────────────┐ ┌────────────┐       │
│ │ 50,000+    │ │  4.8/5 ★  │       │
│ │  Buyers    │ │   Rating   │       │
│ └────────────┘ └────────────┘       │
├─────────────────────────────────────┤
│ #3 TRUST (2×2 icon grid)            │
│ [🔒Secure] [⚡Fast] [↩Returns] [🎧24/7]│
├─────────────────────────────────────┤
│ #4 HOW IT WORKS (vertical stepper)  │
│ ① Browse → ② Bid/Buy → ③ Delivered │
├─────────────────────────────────────┤
│ #5 SHOP BY CATEGORY                 │
│ ← [Figures][TCG][Cosplay][Bey][+] →│
│    (horizontal scroll chips)        │
├─────────────────────────────────────┤
│ #6 FEATURED PRODUCTS   [View All →] │
│ ← [card][card][card] →              │
├─────────────────────────────────────┤
│ #7 LIVE AUCTIONS       [View All →] │
│ ← [card+timer][card+timer] →        │
├─────────────────────────────────────┤
│ #8 PRE-ORDERS          [View All →] │
│ ← [card+date][card+date] →          │
├─────────────────────────────────────┤
│ #9 FEATURED STORES     [View All →] │
│ ← [store card][store card] →        │
├─────────────────────────────────────┤
│ #10 EVENTS & OFFERS    [View All →] │
│ ← [event card][event card] →        │
├─────────────────────────────────────┤
│ #11 CTA BANNER                      │
│ ┌─────────────────────────────────┐ │
│ │ Thousands of collectibles.      │ │
│ │ [ Shop All → ] [ Auctions → ]   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ #12 CUSTOMER REVIEWS                │
│ ← [review card][review card] →      │
├─────────────────────────────────────┤
│ #13 SECURITY HIGHLIGHTS (2×2)       │
│ [🔐Encrypt][🛡TLS][👤RBAC][🔑MinPriv]│
├─────────────────────────────────────┤
│ #14 WHATSAPP COMMUNITY              │
│ 💬 5k+ members [ Join → ]          │
├─────────────────────────────────────┤
│ #15 FAQ (accordion, 5 items)        │
│ ▶ How do auctions work?             │
│ ▶ What is return policy?            │
│ ▶ …                                 │
│ [ View All FAQs → ]                 │
├─────────────────────────────────────┤
│ #16 NEWSLETTER                      │
│ [email input] [Subscribe →]         │
├─────────────────────────────────────┤
│ #17 FROM OUR BLOG      [View All →] │
│ ← [blog card][blog card] →          │
├─────────────────────────────────────┤
│ BOTTOM NAV                          │
│ [🏠][🛍][🔨][⊞][👤]                 │
└─────────────────────────────────────┘
```

---

### Design Class: Ad Placement System — Manual + AdSense + Third-Party

Advertising must be a shared placement system, not hard-coded page markup. Every slot is owned by appkit and configured by letitrip via typed placement config and admin-managed inventory. All ad units must be clearly labeled as `Sponsored` or `Ad`, must preserve layout stability with reserved slot height, and must respect consent/privacy rules before loading AdSense or any third-party network script.

**Appkit components:** `AdvertisementBanner` (shared promo/ad shell) — `ListingLayout` + `ListingViewShell` (slot host for listing pages) — `Section` + `Card` (manual banner content) — `Tabs` (admin/provider switching) — `FilterDrawer` (mobile ad inventory filters) — `DataTable` (admin ad listing) — `StatusBadge` (draft/active/scheduled/paused) — `Alert` (consent / policy warning) — `Modal` (preview + publish confirmation)

**Placement inventory contract:**
- `home.hero.after` — below hero carousel, full-width billboard.
- `home.inline.1` — between homepage sections #5 and #6.
- `home.inline.2` — between homepage sections #10 and #11.
- `listing.inline` — injected in card feeds every N items, labeled sponsored.
- `listing.sidebar.top` — desktop-only rail above filters or below sort summary.
- `detail.inline` — below key commerce summary / above secondary content.
- `content.sidebar.top` — desktop rail for blog, event, FAQ, reviews pages.
- `footer.pre` — full-width banner before newsletter/footer.
- `search.inline` — in results feed after first 6 cards, then every 12.
- `promotions.inline` — tab-scoped slot in coupons/deals/featured tabs.

**Provider model:**
- Manual: image, headline, body copy, CTA label, CTA href, background, start/end dates.
- AdSense: client ID, slot ID, format, responsive toggle, consent-required toggle.
- Third-party: provider name, embed code / script URL, sandbox rules, allowed page placements.
- Fallback order: third-party / AdSense unavailable → manual fallback creative → hide slot.

```
SITEWIDE AD SLOT MAP — DESKTOP
┌──────────────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                                    │
├──────────────────────────────────────────────────────────────────────┤
│ [PAGE CONTENT STARTS]                                                │
│                                                                      │
│  A1  HERO-AFTER BILLBOARD  (home.hero.after)                         │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Sponsored · 970×250 / responsive hero billboard               │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  A2  INLINE SECTION BREAK  (home.inline.1 / home.inline.2)           │
│  [Section #5]                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Sponsored · brand campaign / seasonal promo                   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  [Section #6]                                                        │
│                                                                      │
│  A3  LISTING SIDEBAR TOP  (listing.sidebar.top)                      │
│  ┌──────────────────┬─────────────────────────────────────────────┐  │
│  │ Filters          │ Sponsored rail                             │  │
│  │                  │ ┌───────────────────────────────────────┐  │  │
│  │                  │ │ 300×600 / responsive rail creative    │  │  │
│  │                  │ └───────────────────────────────────────┘  │  │
│  ├──────────────────┼─────────────────────────────────────────────┤  │
│  │ In-feed cards →  │ [card][card][card][card][AD][card][card]   │  │
│  └──────────────────┴─────────────────────────────────────────────┘  │
│                                                                      │
│  A4  CONTENT SIDEBAR TOP  (content.sidebar.top)                      │
│  Blog / Event / FAQ / Reviews desktop right rail                     │
│                                                                      │
│  A5  FOOTER PRE-BANNER  (footer.pre)                                 │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Sponsored · marketplace partner / affiliate campaign          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  [Newsletter] [Footer]                                               │
└──────────────────────────────────────────────────────────────────────┘

SITEWIDE AD SLOT MAP — MOBILE
┌─────────────────────────────────────┐
│ TitleBar / Navbar                   │
├─────────────────────────────────────┤
│ [Hero / page title]                 │
│ ┌─────────────────────────────────┐ │
│ │ Sponsored · 320×100 / fluid     │ │
│ └─────────────────────────────────┘ │
│ [Primary content section]          │
│ [cards][cards][cards]              │
│ ┌─────────────────────────────────┐ │
│ │ Sponsored inline card / banner  │ │
│ └─────────────────────────────────┘ │
│ [cards continue]                   │
│ ┌─────────────────────────────────┐ │
│ │ Sponsored footer-pre banner     │ │
│ └─────────────────────────────────┘ │
│ [Newsletter / Footer / Bottom Nav] │
└─────────────────────────────────────┘

PROMOTIONS TAB WITH AD SLOT — DESKTOP (/promotions/deals)
┌──────────────────────────────────────────────────────────────┐
│ [Coupons][Deals][Featured]                                  │
├────────────────────┬─────────────────────────────────────────┤
│ Filters            │ [card][card][card]                     │
│                    │ ┌───────────────────────────────────┐   │
│                    │ │ Sponsored · promotions.inline     │   │
│                    │ │ AdSense / Manual / Third-Party    │   │
│                    │ └───────────────────────────────────┘   │
│                    │ [card][card][card]                     │
└────────────────────┴─────────────────────────────────────────┘

BLOG / EVENT PAGE WITH AD RAIL — DESKTOP
┌──────────────────────────────────────────────────────────────┐
│ Article / Event content          │ Sponsored                │
│                                  │ ┌─────────────────────┐  │
│ paragraphs…                      │ │ content.sidebar.top │  │
│ images…                          │ └─────────────────────┘  │
│ related blocks…                  │ ┌─────────────────────┐  │
│                                  │ │ manual fallback ad  │  │
│                                  │ └─────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Ad rules:**
- Never place ads inside checkout, payment, login/register, or order success flows.
- Product detail pages may show at most one non-intrusive inline sponsored slot below the primary action block, never between price and CTA.
- Search, category, promotions, and reviews pages can use in-feed ads only after organic results have started.
- All sponsored cards must be visually distinct and excluded from bulk selection behavior.
- Third-party embeds must be sandboxed, centrally allow-listed, and disabled when consent is denied.

---

## Steps

### Phase 0: Scope freeze and page classification matrix

1. Freeze scope and page classification matrix.
2. Classify each target route as: Listing, Listing-Extension, Detail-Commerce, Card-System, PII-Display touchpoint, Non-list, or Hybrid.

---

### Design Class: TitleBar

Right-side actions (L→R): "Today's Deals" pill/tag badge, Cart icon, Search icon, Compare icon, green notification bell, user avatar with role badge overlay, dark mode moon, ≡/X toggle. ≡ swaps to X when public sidebar is open. Currently: hamburger never swaps to X.

**Appkit components:** `TitleBarLayout`, `TitleBar` — `Badge` (deals pill) — `Avatar` + `RoleBadge` (avatar with role overlay) — `NotificationBell` — `IconButton` (cart/search/compare/moon) — `AppLayoutShell` (owns sidebar open state passed as `sidebarOpen` prop)

```
DESKTOP (sidebar closed)
┌──────────────────────────────────────────────────────────────────────┐
│ [L] LetItRip    [🏷️ Today's Deals] [🛒] [🔍] [⇄] [🔔] [AU▾ADMIN] [🌙] [≡] │
└──────────────────────────────────────────────────────────────────────┘

DESKTOP (sidebar open — ≡ becomes X)
┌──────────────────────────────────────────────────────────────────────┐
│ [L] LetItRip    [🏷️ Today's Deals] [🛒] [🔍] [⇄] [🔔] [AU▾ADMIN] [🌙] [✕] │
└──────────────────────────────────────────────────────────────────────┘

MOBILE (top bar only, no horizontal nav below)
┌──────────────────────────┐
│ [L]              [AU] [≡] │
└──────────────────────────┘
```

---

### Design Class: Navbar (horizontal, desktop only)

One row below TitleBar. Each tab has a colored icon + label. Active tab underlined. Hidden on mobile (bottom nav takes over).

**Appkit components:** `NavbarLayout`, `MainNavbar` — `NavItem` (per tab, icon prop already exists but not rendered — enable in `NavbarLayout`) — `TabStrip` (overflow-scrolling tab row on narrow desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [🏠Home] [🛍Products] [🔨Auctions] [📅Pre-Orders] [⊞Categories]      │
│ [🏪Stores] [📆Events] [📖Blog] [⭐Reviews]                            │
│  ‾‾‾‾‾‾ (active underline on current tab)                            │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Design Class: Public Sidebar (right-side slide-in panel)

Opened via ≡ in TitleBar. Right-side overlay on mobile and desktop. Sections are collapsible accordions. Role badge on avatar, not beside name.

**Appkit components:** `AppLayoutShell` (state owner + sidebar header/section rendering) — `SidebarLayout` (right-side slide-in shell) — `Accordion` + `AccordionItem` (BROWSE/SUPPORT/SETTINGS collapsible sections) — `Avatar` + `RoleBadge` (role badge on avatar overlay) — `NavItem` (per link with icon) — `Toggle` (dark mode) — `LocaleSwitcher` (language selector)

```
MOBILE / DESKTOP SIDEBAR (right-side panel, width ~320px)
┌─────────────────────────────┐
│ [AU]  Admin User          ✕ │  ← role badge ON avatar; X closes
│ ADMIN admin@letitrip.in     │
├─────────────────────────────┤
│ DASHBOARD               (auto-show for admin/seller only)
│   ⚙ Admin Dashboard         │
│   🏪 Seller Dashboard        │
├─────────────────────────────┤
│ BROWSE                    ∨ │  ← collapsible, chevron
│   🏠 Home             ✓     │  ← active check
│   🛍 Products               │
│   🔨 Auctions               │
│   📅 Pre-Orders             │
│   ⊞ Categories              │
│   🏪 Stores                  │
│   📆 Events                  │
│   📖 Blog                   │
│   ⭐ Reviews                 │
├─────────────────────────────┤
│ SUPPORT                   ∨ │  ← collapsible
│   (collapsed by default)    │
├─────────────────────────────┤
│ SETTINGS                  ∨ │  ← collapsible; NOT a footer slot
│   🌙 Dark Mode    [toggle]  │
│   🌐 Language   [English ▾] │
└─────────────────────────────┘
```

---

### Design Class: Dashboard Nav — Mobile Bottom Sheet

Opened via top-right ≡ on mobile. Slides up from bottom. NOT a side drawer. Desktop retains fixed left-column sidebar unchanged.

**Appkit components:** `BottomSheet` (mobile overlay — replaces current fixed left-side `Aside`) — `DashboardNavProvider` + `useDashboardNav` (open/close/toggle context) — `AdminSidebar` / `SellerSidebar` / `UserSidebar` (role-scoped nav; each switches mobile from `Aside` to `BottomSheet`) — `Avatar` + `RoleBadge` (header of bottom sheet) — `IconButton` (X close)

```
MOBILE — bottom sheet (slides up, backdrop behind)
┌──────────────────────────────┐
│          ── (drag handle)    │
│ [AU]  Admin User           ✕ │
│ ADMIN admin@letitrip.in      │
├──────────────────────────────┤
│ DASHBOARD                    │
│   ⚙ Admin Dashboard          │
│   📊 Analytics               │
│   📦 Products                │
│   🔨 Auctions                │
│   👥 Users                   │
│   🏪 Stores                  │
│   📋 Orders                  │
│   ─────────────────────────  │
│   ⚙ Settings                │
└──────────────────────────────┘

DESKTOP — fixed left sidebar (unchanged)
┌────────────┐┌──────────────────────────────────┐
│ ADMIN NAV  ││  Page Content                    │
│ ─────────  ││                                  │
│ Dashboard  ││                                  │
│ Products   ││                                  │
│ Auctions   ││                                  │
│ Users      ││                                  │
│ Orders     ││                                  │
└────────────┘└──────────────────────────────────┘

MUTUAL EXCLUSION (both open = impossible):
	Open public sidebar  →  close dashboard nav
	Open dashboard nav   →  close public sidebar
	Close either         →  no side effect on the other
```

---

### Design Class: Bottom Nav (mobile only)

Fixed at bottom, 5 tabs, hidden on md+. Role avatar links to profile page.

**Appkit components:** `BottomNavbar` + `BottomNavItem` + `BottomNavLayout` — `Avatar` + `RoleBadge` (5th tab avatar with role badge overlay, navigates to `profileHref`)

```
┌──────────────────────────────────┐
│                                  │
│         (page content)           │
│                                  │
├──────────────────────────────────┤
│ 🏠     🛍     🔍     🛒    [AU]  │
│ Home  Prods  Search  Cart  ADMIN │
└──────────────────────────────────┘
	(current tab label highlighted green)
```

---

### Design Class: Listing Page Layout

search, sort, filters, list/grid toggle, selection, bulk actions, route-param sync, apply-button filter commit. Desktop: persistent left sidebar. Mobile: full-width drawer triggered by filter button.

**Appkit components:** `ListingLayout` (features layer — sidebar + content orchestration) — `ListingViewShell` + `SlottedListingView` (UI layer shells) — `FilterPanel` (desktop persistent sidebar content) — `FilterDrawer` (mobile full-width drawer with apply/reset footer) — `SortDropdown` — `ViewToggle` (grid/list switch) — `BulkActionBar` (floating bulk actions) — `ActiveFilterChips` (removable filter pills) — `Pagination` / `TablePagination` — `Input` (search) — route-param parser/serializer + `usePendingFilters` (deferred apply)

```
DESKTOP — UX OPTIMIZED DEFAULT
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
│ Navbar                                                       │
├──────────────┬───────────────────────────────────────────────┤
│ FILTERS      │ Products (128)                                │
│ ──────────── │ [🔍 "charizard"                            ✕] │
│ Category     │ [Sort: Relevance ▾] [⊞ Grid] [≡ List] [☐ Select]│
│ ☑ Pokemon    │ [Pokemon ✕] [In Stock ✕] [₹0–₹10k ✕] [Clear all]│
│ ☑ Figures    │ ──────────────────────────────────────────── │
│ ☐ TCG Cards  │ Showing 1-24 of 128                          │
│ ──────────── │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│ Availability │  │Card│ │Card│ │Card│ │Card│ │Card│ │Card│  │
│ ☑ In Stock   │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘  │
│ ☐ Pre-Order  │                                               │
│ ──────────── │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│ Price        │  │Card│ │Card│ │Card│ │Card│ │Card│ │Card│  │
│ ₹ [──●───]   │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘  │
│ ──────────── │                                               │
│ More Filters ∨│ [Load-safe empty recovery lives here when 0] │
│ [Reset All]  │ ← Prev  [1] [2] [3]  Next →                  │
│ [Apply Filters]                                              │
└──────────────┴───────────────────────────────────────────────┘

MOBILE — UX OPTIMIZED DEFAULT
┌──────────────────────────┐
│ TitleBar                 │
├──────────────────────────┤
│ Products (128)           │
│ [🔍 charizard        ✕ ] │
│ [24 results] [3 filters] │
│ [🔧 Filters (3)] [▼ Sort]│
│ [Pokemon ✕][In Stock ✕]  │
│ [Clear]                  │
├──────────────────────────┤
│ ┌──────────┐ ┌──────────┐│
│ │  Card    │ │  Card    ││
│ └──────────┘ └──────────┘│
│ ┌──────────┐ ┌──────────┐│
│ │  Card    │ │  Card    ││
│ └──────────┘ └──────────┘│
│ [No results state => Clear filters]│
├──────────────────────────┤
│ Bottom Nav               │
└──────────────────────────┘

MOBILE FILTER DRAWER (full-width, slides up)
┌──────────────────────────┐
│ Filters (3 active)    ✕  │
│ ─────────────────────── │
│ Category                 │
│   ☑ Pokemon  ☑ Figures   │
│ Availability             │
│   ☑ In Stock  ☐ Pre-Ord  │
│ Price                    │
│   ₹ [────●──────]        │
│ More Filters            ∨│
│ ─────────────────────── │
│ [Reset All]  [Apply (24)]│
└──────────────────────────┘
```

---

### Design Class: Listing-Extension Page Layout

Fixed parent context header (category or store) locked at top. Child listing with full filter/sort/search below. Route params apply to child list only.

Tab contract for listing-extension pages:
- Store detail tabs must be route params: `/stores/[storeSlug]/[tab]` where `[tab]` is `products|auctions|reviews`.
- Category detail tabs must be route params: `/categories/[slug]/[tab]` where `[tab]` is at minimum `products` and can extend by market needs.
- Mobile uses dropdown selector for `[tab]`; desktop uses tab strip. Both update route params, never query params.

**Appkit components:** All Listing Page components above, plus: `SectionTabs` / `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` (Products/Auctions/Reviews tab strip for store detail) — `AutoBreadcrumbs` / `Breadcrumbs` + `BreadcrumbItem` — `Card` (fixed parent context hero banner) — `HorizontalScroller` (hero banner image slot)

```
DESKTOP (/stores/[storeSlug]/products/sort/relevance/page/1)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐   │
│ │ [Banner Image]  Collectibles & Display          5 items│   │  ← FIXED PARENT CONTEXT
│ │                 Pokemon figures, dioramas, shelves     │   │    (locked, not filterable)
│ └────────────────────────────────────────────────────────┘   │
│ [Products] [Auctions] [Reviews]   ← route-param tab (`[tab]`)│
│ Active route: /stores/[storeSlug]/products                   │
├──────────────┬───────────────────────────────────────────────┤
│ FILTERS      │ [🔍 Search...] [Sort▾] [⊞] [☐ Sel]           │
│ (child only) │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                 │
│              │  │Card│ │Card│ │Card│ │Card│                 │
└──────────────┴───────────────────────────────────────────────┘
```

---

### Design Class: Category Pages

Category index `/categories` is a Listing-class discovery surface built from category cards, lightweight search, and optional featured/trending chips; it does not need product bulk actions. Category detail `/categories/[slug]/[tab]` is a Listing-Extension surface: fixed category hero/context on top, child inventory listing below, and tab/sort/page state encoded in route params for the child listing only. Category pages follow the same green-first accent direction defined in Theme Color Audit: green for CTA and active state, neutral shells, restrained blue for links only.

**Appkit components (index):** `ListingLayout` (features layer, no bulk actions preset) — `FilterPanel` + `FilterDrawer` (Type/Popularity filters) — `Input` (category search) — `Badge` (Trending/New/Popular chips) — `BaseListingCard` (category card: image, name, item count, CTA) — `Button` (Explore CTA) — `useUrlTable` + `usePendingFilters`

**Appkit components (detail):** All Listing-Extension components above — `AutoBreadcrumbs` — `Card` (hero banner with follow/share actions)

```
CATEGORY INDEX — DESKTOP
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ SHOP BY CATEGORY                                             │
│ Find figures, TCG accessories, cosplay, and collectibles     │
│ [🔍 Search categories...]   [Trending] [New] [Popular] [⊞ Filters ▾]│
├──────────────┬───────────────────────────────────────────────┤
│ FILTERS      │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│ ─────────    │ │ [cat image]  │ │ [cat image]  │ │ [cat image]  ││
│ Type         │ │ Scale Figures│ │ Collectibles │ │ Cosplay      ││
│  ● All       │ │ 42 items     │ │ 18 items     │ │ 26 items     ││
│  ○ Physical  │ │ [Explore →]  │ │ [Explore →]  │ │ [Explore →]  ││
│  ○ Digital   │ └──────────────┘ └──────────────┘ └──────────────┘│
│ ─────────    │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│ Popularity   │ │ [cat image]  │ │ [cat image]  │ │ [cat image]  ││
│  □ Trending  │ │ TCG Gear     │ │ Apparel      │ │ Events Gear  ││
│  □ New       │ │ 15 items     │ │ 10 items     │ │ 8 items      ││
│  □ Popular   │ │ [Explore →]  │ │ [Explore →]  │ │ [Explore →]  ││
│ ─────────    │ └──────────────┘ └──────────────┘ └──────────────┘│
│ [Reset]      │                                               │
└──────────────┴───────────────────────────────────────────────┘

CATEGORY INDEX — MOBILE (filters drawer closed)
┌──────────────────────────┐
│ TitleBar                 │
├──────────────────────────┤
│ Shop by Category         │
│ [🔍 Search categories...]│
│ [Trending][New][⊞ Filters]│
│ ┌──────────────────────┐ │
│ │ [cat image]          │ │
│ │ Scale Figures        │ │
│ │ 42 items   Explore → │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ [cat image]          │ │
│ │ Collectibles         │ │
│ │ 18 items   Explore → │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ Bottom Nav               │
└──────────────────────────┘

CATEGORY INDEX — MOBILE FILTER DRAWER (slides up from bottom)
┌──────────────────────────┐
│ Filters                ✕ │
│ ─────────────────────── │
│ Type                     │
│   ● All  ○ Physical      │
│   ○ Digital              │
│ Popularity               │
│   □ Trending  □ New      │
│   □ Popular              │
│ ─────────────────────── │
│ [Reset]       [Apply(2)] │
└──────────────────────────┘

CATEGORY DETAIL — DESKTOP (/categories/[slug]/products/sort/relevance/page/1)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Categories > Collectibles & Display       │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [hero/banner]  Collectibles & Display                   │ │
│ │ 5 subtypes · shelves, dioramas, display figures         │ │
│ │ [Follow Category] [Share]                               │ │
│ └──────────────────────────────────────────────────────────┘ │
│ [Products] [Auctions] [Reviews]   ← route-param tab (`[tab]`)│
│ Active route: /categories/[slug]/products                   │
├──────────────┬───────────────────────────────────────────────┤
│ FILTERS      │ [🔍 Search items] [Sort▾] [⊞/≡] [Items 128]  │
│ Type         │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                  │
│ □ Figures    │ │Card│ │Card│ │Card│ │Card│                  │
│ □ Dioramas   │ └────┘ └────┘ └────┘ └────┘                  │
│ Price        │                                               │
│ ₹ [──●────]  │ ← child inventory only updates                │
│ [Apply]      │                                               │
└──────────────┴───────────────────────────────────────────────┘

CATEGORY DETAIL — MOBILE (/categories/[slug]/products/sort/relevance/page/1)
┌──────────────────────────┐
│ TitleBar                 │
├──────────────────────────┤
│ Home > Categories > ...  │
│ [hero/banner]            │
│ Collectibles & Display   │
│ 5 subtypes               │
│ [Follow] [Share]         │
│ [Tab: Products ▾]        │
│ (route-param tab select) │
├──────────────────────────┤
│ [🔍 Search] [▼Sort] [🔧Filters]│
│ ┌──────────────────────┐ │
│ │ Product Card         │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Product Card         │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ Bottom Nav               │
└──────────────────────────┘
```

---

### Design Class: Detail-Commerce Page Layout

Gallery | Info | Sticky Action Rail (desktop col 3). Mobile: sticky bottom action bar. Below fold: reviews, related products.

**Appkit components:** `DetailViewShell` (3-col desktop shell + mobile scroll) — `ProductDetailView` (composition layer over `DetailViewShell`) — `BottomActionsProvider` + `BottomActions` + `useBottomActionsContext` (mobile sticky bottom action bar injected from child) — `AutoBreadcrumbs` / `Breadcrumbs` — `ImageGallery` + `ImageLightbox` — `PriceDisplay` (INR-aware price) — `StarRating` + `RatingDisplay` — `Badge` (in-stock/condition) — `Button` (Add to Cart, Buy Now) — `IconButton` (wishlist ♡)

```
DESKTOP — UX OPTIMIZED DEFAULT
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Products > Charizard Figure               │
├───────────────────┬──────────────────┬───────────────────────┤
│ GALLERY           │ DECISION CLUSTER │ ACTION RAIL (sticky)  │
│ ┌───────────────┐ │ Charizard 1/8    │ ┌───────────────────┐ │
│ │               │ │ Scale Figure     │ │ ₹4,990            │ │
│ │  [main image] │ │ ★★★★☆ (42 reviews)││ In Stock · 3 left │ │
│ │               │ │ Seller: PokéVault│ │ 🚀 Delivery 3-5d  │ │
│ └───────────────┘ │ Condition: New    │ │ ↩ 7-day returns   │ │
│ [●][○][○][○]      │ [♡ Wishlist] [Share]│───────────────── │ │
│ 4 images          │ ───────────────── │ │ [Buy Now]        │ │
│                   │ Short summary...  │ │ [Add to Cart]    │ │
│                   │ [Read full desc ↓]│ │ [Make Offer]     │ │
│                   │                   │ │ More ▾           │ │
│                   │                   │ └───────────────────┘ │
├───────────────────┴──────────────────┴───────────────────────┤
│ BELOW FOLD: Specs | Reviews | Shipping | Related Products     │
└──────────────────────────────────────────────────────────────┘

MOBILE — UX OPTIMIZED DEFAULT
┌──────────────────────────┐
│ TitleBar                 │
├──────────────────────────┤
│ [main image full-width]  │
│ [●][○][○]  1/4  [Share]  │
│ Charizard 1/8 Scale      │
│ ₹4,990                   │
│ ★★★★☆ (42) · PokéVault   │
│ In Stock · 3 left        │
│ 🚀 Delivery 3-5d         │
│ [♡ Wishlist] [Specs ↓]   │
│ Short summary...         │
│ [Read full description]  │
│ Reviews preview...       │
├──────────────────────────┤
│ ₹4,990 [Add to Cart] [Buy]│
└──────────────────────────┘
│ Bottom Nav               │
└──────────────────────────┘
```

---

### Design Class: Card System

All card types share the same slot structure. Pre-order cards must match product/auction density exactly.

**Click zone rules (must be implemented in `BaseListingCard`):**
- `[☐] Checkbox` — click is isolated to the checkbox element only; triggers bulk selection, never navigation. Use `e.stopPropagation()` on the checkbox wrapper.
- Rest of card body — clicking anywhere else navigates:
  - Public listing pages → product/auction/pre-order/event/store/category detail page
  - Admin listing pages → admin edit view (`/admin/products/[id]/edit` etc.)
  - Seller listing pages → seller edit view (`/seller/products/[id]/edit`)
- CTA buttons (`[Add to Cart]`, `[Place Bid]`, `[Reserve Now]`, `[♡]`) — also isolated with `e.stopPropagation()`; trigger their own actions without navigating.
- The card root element is an `<a>` or `router.push` wrapper; interactive child elements must stop propagation to avoid double-firing.

**Appkit components:** `BaseListingCard` (base slot structure for all card types; owns click-zone isolation contract) — `InteractiveProductCard` (product card reference) — `MarketplaceAuctionCard` (auction card with countdown/image-cycling) — `MarketplacePreorderCard` (pre-order card, bring to parity) — `EventCard` — `InteractiveStoreCard` — `Card` + `CardHeader` + `CardBody` + `CardFooter` (generic slotted card) — `Badge` + `StatusBadge` (featured/condition/status overlays) — `PriceDisplay` — `CountdownDisplay` — `StarRating` — `Checkbox` (bulk select, isolated click zone) — `IconButton` (wishlist/CTA, isolated click zone)

```
PRODUCT CARD                    AUCTION CARD
┌──────────────────────┐        ┌──────────────────────┐
│[☐]            [★Feat]│        │[☐]            [★Feat]│  ← featured star overlay
│                      │        │  ┌──────────────────┐ │
│  [product image]     │        │  │  [image cycling] │ │  ← auto-rotate on hover
│  (static)            │        │  └──────────────────┘ │
│                      │        │ LIVE  ⏱ 2d 3h 15m     │  ← countdown badge
│ Charizard 1/8 Scale  │        │ Charizard 1st Ed PSA10 │
│ ₹4,990               │        │ Current Bid: ₹18,500   │
│ ─────────────────── │        │ 6 bids                 │
│ [Add to Cart][Buy Now│        │ ─────────────────────  │
│ [♡]                  │        │ [Place Bid] [Buy Now]  │
└──────────────────────┘        │ [♡]                    │
																└──────────────────────┘

PRE-ORDER CARD (must match above density)
┌──────────────────────┐
│[☐]            [★Feat]│  ← featured star (same as product/auction)
│                      │
│  [product image]     │  ← same image treatment as product card
│  (static)            │
│                      │
│ Pikachu MEGA 1/4     │
│ PRE-ORDER            │  ← badge
│ ₹34,990              │
│ Ships: Jun 2026      │
│ ─────────────────── │
│ [Reserve Now]        │  ← primary CTA matches auction density
│ [♡]                  │
└──────────────────────┘

BLOG CARD           STORE CARD              REVIEW CARD
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ [cover img]  │    │ [banner img]     │    │ [★★★★☆]   Verified│
│ Apr 13, 2026 │    │ PokéVault Cards  │    │ "Stunning quality"│
│ Title...     │    │ 18 products      │    │ J**** S.          │
│ Author · min │    │ ★ 4.7  7 sold    │    │ Mar 23, 2026      │
└──────────────┘    └──────────────────┘    │ [img1][img2]      │
																						└──────────────────┘

CATEGORY CARD       EVENT CARD
┌──────────────┐    ┌──────────────┐
│ [cat image]  │    │ [event image]│
│ Collectibles │    │ PokéFest 2026│
│ 5 items      │    │ SALE · Apr 30│
└──────────────┘    └──────────────┘
```

---

### Design Class: PII Display

All user-facing PII must be masked. Raw `enc:v1:` tokens must never reach the UI. Currently broken on live site.

**Appkit components:** `pii-redact.ts` from `@mohasinac/appkit/security` (`maskName`, `maskEmail`, `maskPhone`) — `pii-encrypt.ts` (storage boundary, must never reach client) — `AvatarDisplay` (renders masked name + avatar together) — `Text` (masked value wrapped in appkit `Text`, never raw string in JSX)

```
STORAGE LAYER (Firestore)          UI LAYER (what user sees)
┌──────────────────────────────┐   ┌──────────────────────────┐
│ reviewerName:                │   │ Reviewer: J***** S.      │ ✅
│  enc:v1:TEUiEw...            │──▶│ Email:    ad***@gmail.com│ ✅
│ reviewerEmail:               │   │ Phone:    ***-***-9876   │ ✅
│  enc:v1:eHkynq...            │   └──────────────────────────┘
└──────────────────────────────┘

CURRENT BUG (live site):
┌──────────────────────────────┐
│ Reviewer:                    │ ❌
│  enc:v1:TEUiEwMVsZvLhjeg:... │
│ Seller:                      │ ❌
│  enc:v1:GvH8nE9E22WEvbGB:... │
└──────────────────────────────┘

PIPELINE (must be):
	Firestore → server action → decrypt (functions) → maskName/maskEmail → render
	NEVER:  Firestore → client → render(encrypted token)
```

---

### Design Class: Footer — Desktop + Mobile

**Appkit components:** `FooterLayout` (5-column desktop grid + mobile accordion — already has accordion + social + newsletter + trust bar slots) — `Accordion` + `AccordionItem` (mobile group collapse) — `Input` + `Button` (newsletter subscribe) — `TextLink` (link group items)

**Route audit — all footer links vs existing pages:**
```
SHOP          Route                  Exists?
Products      /products              ✅
Auctions      /auctions              ✅
Categories    /categories            ✅
Promotions    /promotions            ✅
Search        /search                ✅

SUPPORT       Route                  Exists?
Help Center   /help                  ✅
FAQs          /faqs                  ✅
Track Order   /track                 ✅
Contact       /contact               ✅
About Us      /about                 ✅ (add to footer — exists, not wired)
Security      /security              ✅ (add to footer — exists, not wired)

FOR SELLERS   Route                  Exists?
Start Selling /sell                  ❌ MISSING PAGE — create or redirect → /user/become-seller
Seller Guide  /seller-guide          ✅
Fees          /fees                  ✅ (add to footer — exists, not wired)

LEARN         Route                  Exists?
How Auctions Work   /how-auctions-work        ✅
How Pre-Orders Work /how-pre-orders-work      ✅
Shipping Policy     /shipping-policy          ✅
How Checkout Works  /how-checkout-works       ✅ (add to footer — exists, not wired)
How Orders Work     /how-orders-work          ✅ (add to footer — exists, not wired)
How Payouts Work    /how-payouts-work         ✅ (add to footer — exists, not wired)
How Offers Work     /how-offers-work          ✅ (add to footer — exists, not wired)
How Reviews Work    /how-reviews-work         ✅ (add to footer — exists, not wired)

LEGAL         Route                  Exists?
Privacy Policy      /privacy          ✅
Terms of Service    /terms            ✅
Cookie Policy       /cookies          ✅
Refund Policy       /refund-policy    ✅
```

**Missing page to create:** `/sell` — public-facing "Sell on LetItRip" landing page (unauthenticated, explains seller benefits, links to `/user/become-seller` CTA). All other footer-linked pages already exist.

```
DESKTOP (5-column grid)
┌──────────────────────────────────────────────────────────────────────┐
│ 🚀 Free Shipping  ↩ Easy Returns  🔒 Secure Payment  🎧 24/7  ✅ Auth │  ← trust bar
├──────────────────────────────────────────────────────────────────────┤
│ LetItRip         SHOP          SUPPORT        FOR SELLERS  LEARN     │
│ Discover unique  Products      Help Center    Start Selling⚠ Auctions│
│ products...      Auctions      FAQs           Seller Guide Pre-Orders│
│ About Us         Categories    Track Order    Fees         Shipping  │
│                  Promotions    Contact        LEGAL        Checkout  │
│ [f][ig][tw][li]  Search        About Us       Privacy      Orders    │
│                  Sellers       Security       Terms        Payouts   │
│ STAY IN THE LOOP               Security       Cookies      Offers    │
│ [email input] [Subscribe]                     Refund       Reviews   │
├──────────────────────────────────────────────────────────────────────┤
│ © 2026 LetItRip. All rights reserved.    Built with ❤ in India      │
└──────────────────────────────────────────────────────────────────────┘
⚠ Start Selling → /sell page does not exist yet (create or redirect to /user/become-seller)

MOBILE (accordion)
┌──────────────────────────┐
│ LetItRip                 │
│ Discover unique...       │
│ About Us                 │
│ [f][ig][tw][li]          │
│ STAY IN THE LOOP         │
│ [email]      [Subscribe] │
├──────────────────────────┤
│ SHOP                   ∨ │  ← collapsed accordion
├──────────────────────────┤
│ SUPPORT                ∨ │
├──────────────────────────┤
│ FOR SELLERS            ∨ │
├──────────────────────────┤
│ LEARN                  ∨ │
├──────────────────────────┤
│ LEGAL                  ∨ │
├──────────────────────────┤
│ © 2026 LetItRip          │
│ Built with ❤ in India    │
└──────────────────────────┘
```

---

### Design Class: Admin Dashboard

Stats overview with KPI tiles, recent activity table, and quick nav tiles. Not a listing page — frame only, no toolbar or filter sidebar.

**Appkit components:** `AdminDashboardView` (top-level view) — `AdminPageHeader` (page title + action bar) — `DashboardStatsCard` + `StatsGrid` (KPI tiles) — `DataTable` (recent orders/activity table) — `QuickActionsPanel` (shortcut action grid) — `AdminRevenueChart` + `AdminOrdersChart` (analytics) — `AdminTopProductsTable` — `AdminSidebar` (left nav) — `Section` + `Heading` + `Text` (structural wrappers)

```
ADMIN DASHBOARD — DESKTOP (/admin/dashboard)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Dashboard                                       │
│ ─────────  │ ─────────────────────────────────────────────── │
│ Dashboard  │ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│ Analytics  │ │ ₹2,34,500  │ │ 128 Orders │ │ 42 Pending │   │
│ Products   │ │ Revenue    │ │ This Month │ │ Payouts    │   │
│ Auctions   │ │ ▲ +12%     │ │ ▲ +8%      │ │ ▼ -3       │   │
│ Users      │ └────────────┘ └────────────┘ └────────────┘   │
│ Orders     │ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│ Stores     │ │ 1,204 Prod │ │ 87 Sellers │ │ 4.8★ Avg  │   │
│ Payouts    │ │ Listed     │ │ Active     │ │ Rating     │   │
│ Reviews    │ └────────────┘ └────────────┘ └────────────┘   │
│ Blog       │ ─────────────────────────────────────────────── │
│ Coupons    │ RECENT ORDERS                    [View All →]   │
│ FAQs       │ ┌──────┬────────────────┬───────┬────────────┐  │
│ Events     │ │ #ID  │ Customer       │ ₹Amt  │ Status     │  │
│ Carousel   │ ├──────┼────────────────┼───────┼────────────┤  │
│ Sections   │ │ #892 │ R*** S.        │ 4,990 │ ● Shipped  │  │
│ Media      │ │ #891 │ A*** K.        │12,500 │ ● Pending  │  │
│ Settings   │ │ #890 │ J*** M.        │ 2,200 │ ● Delivered│  │
│ Nav        │ └──────┴────────────────┴───────┴────────────┘  │
│ Flags      │ ─────────────────────────────────────────────── │
│ Copilot    │ QUICK ACTIONS                                    │
│            │ [+ Add Product] [+ Blog Post] [⚑ Review Flags]  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN ANALYTICS — DESKTOP (/admin/analytics)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Analytics    [This Month ▾] [Export CSV]        │
│            │ ─────────────────────────────────────────────── │
│            │ ┌─────────────────────────────────────────────┐ │
│            │ │ REVENUE OVER TIME                           │ │
│            │ │  ₹↑                                         │ │
│            │ │    ╭──╮   ╭──╮       ╭───╮                 │ │
│            │ │ ───╯  ╰───╯  ╰───────╯   ╰──               │ │
│            │ │  Jan  Feb  Mar  Apr  May  Jun               │ │
│            │ └─────────────────────────────────────────────┘ │
│            │ ┌──────────────────┐ ┌──────────────────────┐  │
│            │ │ TOP CATEGORIES   │ │ TOP SELLERS           │  │
│            │ │ Figures   38%  ██│ │ PokéVault    ₹82,000  │  │
│            │ │ TCG Gear  24%  █ │ │ CardMaster   ₹61,500  │  │
│            │ │ Cosplay   18%  █ │ │ BeyStore     ₹44,000  │  │
│            │ └──────────────────┘ └──────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘
```

---

### Design Class: Admin CRUD Forms

Admin create/edit flows launched from list pages should open in a right-side sidepanel over the current list, not force navigation away from the table. Use full-page forms only for unusually deep workflows. Standard panel pattern: keep list visible/dimmed in the background, open drawer from the right, preserve search/filter/selection state on close, and use sticky footer actions inside the panel.

**Appkit components:** `AdminPageHeader` (breadcrumb + title + actions) — `Drawer` / right `SidePanel` shell (overlay container) — `Form` + `FormGroup` + `FormActions` + `FormGrid` + `FormGridField` (form shell and layout) — `FormField` (smart labeled field wrapper with error display) — `Input`, `Textarea`, `Select`, `DynamicSelect`, `Checkbox`, `RadioGroup`, `Toggle`, `Slider`, `TagInput` (field primitives) — `RichTextEditor` (body/description fields) — `ImageGallery` (media picker/upload) — `DrawerFormFooter` (sticky save/cancel footer in drawer forms) — `AdminFilterBar` (list page search/filter bar) — `DataTable` (list views within admin CRUD) — `StatusBadge` (draft/published status) — `ConfirmDeleteModal` (delete confirmation) — `UnsavedChangesModal` (navigate-away guard)

```
ADMIN CREATE / EDIT SIDEPANEL — DESKTOP (UX OPTIMIZED)
┌──────────────────────────────────────────────────────────────┬──────────────────────┐
│ TitleBar                                                     │ Edit Product        │
├────────────┬─────────────────────────────────────────────────┤ [✕]                  │
│ ADMIN NAV  │ Products   [🔍 Search] [Filter ▾] [+ New]       │ ─────────────────── │
│            │ ─────────────────────────────────────────────── │ Title *             │
│            │ ┌──┬──────────────────┬─────────┬─────┬─────┐  │ [Suicune Aurora...]│
│            │ │☐ │ Product          │ Price   │ St  │ Act │  │ Description        │
│            │ ├──┼──────────────────┼─────────┼─────┼─────┤  │ [textarea........] │
│            │ │☐ │ Suicune Aurora…  │ ₹6,490  │Pub  │[E]  │  │ Category  Subcat   │
│            │ │☐ │ Green Hammer…    │ ₹  650  │Drft │[E]  │  │ [Select]  [Select] │
│            │ │☐ │ Nightgear TCG…   │ ₹9,499  │Pub  │[E]  │  │ Brand     Status   │
│            │ └──┴──────────────────┴─────────┴─────┴─────┘  │ [Input]   [Select] │
│            │                 (background stays visible)      │ Price ₹   Stock     │
│            │                                                 │ [_____]   [___]     │
│            │                                                 │ Main Image          │
│            │                                                 │ [ hero preview ]    │
│            │                                                 │ [+ Upload]          │
│            │                                                 │ Listing Type        │
│            │                                                 │ ● Fixed ○ Auction   │
│            │                                                 │ ○ Pre-Order         │
│            │                                                 │ Last saved 2m ago   │
│            │                                                 │ Unsaved changes •   │
│            │                                                 │──────────────────── │
│            │                                                 │ [Cancel] [Save Draft] [Save]│
└────────────┴─────────────────────────────────────────────────┴──────────────────────┘

PANEL RULES
- Open from row action `[E]` or `[+ New Product]`; keep underlying list state intact.
- Width target: 420-560px on desktop, full-width bottom sheet on mobile.
- Show unsaved changes guard on close/backdrop/navigation.
- Save success should close panel and update row inline without full page reload.

ADMIN CATEGORY FORM — DESKTOP (/admin/categories/new)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Categories › New Category                       │
│            │ ┌──────────────────────────┐ ┌───────────────┐  │
│            │ │ Name *                   │ │ THUMBNAIL     │  │
│            │ │ [______________________] │ │ ┌───────────┐ │  │
│            │ │ Slug (auto)              │ │ │  [image]  │ │  │
│            │ │ [______________________] │ │ └───────────┘ │  │
│            │ │ Parent Category          │ │ [+ Upload]    │  │
│            │ │ [Select ▾]               │ │               │  │
│            │ │ Description              │ │ STATUS        │  │
│            │ │ [______________________ ]│ │ ● Active      │  │
│            │ │ Sort Order               │ │ ○ Hidden      │  │
│            │ │ [___]                    │ │               │  │
│            │ │          [Cancel] [Save] │                    │
│            │ └──────────────────────────┘                    │
└────────────┴─────────────────────────────────────────────────┘

ADMIN BLOG POST FORM — DESKTOP (/admin/blog/new)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Blog › New Post                                 │
│            │ ┌───────────────────────────────┐ ┌──────────┐  │
│            │ │ Title *                       │ │ COVER    │  │
│            │ │ [___________________________] │ │ [image]  │  │
│            │ │ Slug (auto)                   │ │ [Upload] │  │
│            │ │ [___________________________] │ │          │  │
│            │ │ Author        Category        │ │ STATUS   │  │
│            │ │ [Select ▾]    [Select ▾]      │ │ ● Draft  │  │
│            │ │ Excerpt                       │ │ ○ Publish│  │
│            │ │ [____________________________]│ │          │  │
│            │ │ Body *                        │ │ TAGS     │  │
│            │ │ [rich text ................. ]│ │ [input]  │  │
│            │ │ [..........................  ]│ │          │  │
│            │ │            [Cancel] [Publish] │ └──────────┘  │
│            │ └───────────────────────────────┘               │
└────────────┴─────────────────────────────────────────────────┘

ADMIN COUPON FORM (/admin/coupons/new)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Coupons › New Coupon                            │
│            │ ┌──────────────────────────────────────────┐    │
│            │ │ Code *              [Generate]            │    │
│            │ │ [____________________]                    │    │
│            │ │ Discount Type       Value *               │    │
│            │ │ ○ % Percent         [_______]             │    │
│            │ │ ○ ₹ Fixed Amount                          │    │
│            │ │ Min Order ₹         Max Uses              │    │
│            │ │ [_________]         [_____]               │    │
│            │ │ Expiry Date                               │    │
│            │ │ [______________]                          │    │
│            │ │ Applies To                                │    │
│            │ │ ● All  ○ Category  ○ Products             │    │
│            │ │                    [Cancel] [Save]        │    │
│            │ └──────────────────────────────────────────┘    │
└────────────┴─────────────────────────────────────────────────┘

ADMIN FAQ FORM (/admin/faqs/new)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ FAQs › New FAQ                                  │
│            │ ┌──────────────────────────────────────────┐    │
│            │ │ Question *                               │    │
│            │ │ [______________________________________ ]│    │
│            │ │ Answer *                                 │    │
│            │ │ [rich text ............................ ]│    │
│            │ │ [..................................    . ]│    │
│            │ │ Category        Sort Order               │    │
│            │ │ [Select ▾]      [___]                    │    │
│            │ │                        [Cancel] [Save]   │    │
│            │ └──────────────────────────────────────────┘    │
└────────────┴─────────────────────────────────────────────────┘

ADMIN SITE SETTINGS (/admin/site)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Site Settings                                   │
│            │ [General] [SEO] [Social] [Payments] [Shipping]  │
│            │ ─────────────────────────────────────────────── │
│            │ GENERAL                                         │
│            │ Site Name       [LetItRip               ]       │
│            │ Tagline         [India's #1 Collectibles]       │
│            │ Support Email   [support@letitrip.in    ]       │
│            │ Contact Phone   [+91 ____________________]      │
│            │ Default Currency  [INR ▾]                       │
│            │ Default Locale    [en ▾]                        │
│            │ Maintenance Mode  [toggle OFF]                  │
│            │                                 [Save Changes]  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN FEATURE FLAGS (/admin/feature-flags)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Feature Flags                                   │
│            │ ┌────────────────────────────────────────────┐  │
│            │ │ Flag                    Status   Actions   │  │
│            │ ├────────────────────────────────────────────┤  │
│            │ │ enableAuctions          [ON ●]   [Edit]    │  │
│            │ │ enablePreOrders         [ON ●]   [Edit]    │  │
│            │ │ enableOffers            [OFF ○]  [Edit]    │  │
│            │ │ enableCorporateInquiry  [ON ●]   [Edit]    │  │
│            │ │ enableCoupons           [ON ●]   [Edit]    │  │
│            │ │ enableNewsletter        [ON ●]   [Edit]    │  │
│            │ │ enableReviews           [ON ●]   [Edit]    │  │
│            │ │ enableBlog              [ON ●]   [Edit]    │  │
│            │ └────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN NAVIGATION EDITOR (/admin/navigation)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Navigation Editor   [+ Add Item]                │
│            │ ┌────────────────────────────────────────────┐  │
│            │ │ ≡ Home          /         [Edit] [Delete]  │  │
│            │ │ ≡ Products      /products [Edit] [Delete]  │  │
│            │ │ ≡ Auctions      /auctions [Edit] [Delete]  │  │
│            │ │   ↳ Live Auctions  /auctions?type=live     │  │
│            │ │ ≡ Categories    /categories [Edit][Delete] │  │
│            │ │ ≡ Stores        /stores   [Edit] [Delete]  │  │
│            │ │ ≡ Blog          /blog     [Edit] [Delete]  │  │
│            │ │ (drag ≡ to reorder)                        │  │
│            │ └────────────────────────────────────────────┘  │
│            │                              [Save Order]       │
└────────────┴─────────────────────────────────────────────────┘

ADMIN MEDIA MANAGER (/admin/media)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Media Library   [Upload Files]  [🔍 Search...]  │
│            │ ─────────────────────────────────────────────── │
│            │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│            │ │img│ │img│ │img│ │img│ │img│ │img│ │img│     │
│            │ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘     │
│            │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│            │ │img│ │img│ │img│ │img│ │img│ │img│ │img│     │
│            │ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘     │
│            │ ← Prev  [1][2][3]  Next →                       │
└────────────┴─────────────────────────────────────────────────┘

ADMIN PRODUCTS LIST (/admin/products)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Products   [+ New Product]                      │
│            │ [🔍 Search] [Category ▾] [Status ▾] [Type ▾]    │
│            │ ┌──┬──────────────────┬──────────┬──┬────────┐  │
│            │ │☐ │ Product          │ Price    │St│Actions │  │
│            │ ├──┼──────────────────┼──────────┼──┼────────┤  │
│            │ │☐ │[img] Charizard   │ ₹4,990   │✅│[E][D]  │  │
│            │ │☐ │[img] PSA10 Card  │ ₹18,000  │✅│[E][D]  │  │
│            │ │☐ │[img] Beyblade    │ ₹  890   │⬜│[E][D]  │  │
│            │ ├──┴──────────────────┴──────────┴──┴────────┤  │
│            │ │ [Bulk: Publish | Unpublish | Delete]        │  │
│            │ └─────────────────────────────────────────────┘  │
│            │ ← Prev  [1][2][3]  Next →                       │
└────────────┴─────────────────────────────────────────────────┘

ADMIN CATEGORIES LIST (/admin/categories)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Categories   [+ New Category]                   │
│            │ [🔍 Search categories...]                        │
│            │ ┌──┬─────────────────┬──────────┬──┬─────────┐  │
│            │ │☐ │ Name            │ Parent   │It│Actions  │  │
│            │ ├──┼─────────────────┼──────────┼──┼─────────┤  │
│            │ │☐ │[img] Figures    │ —        │42│[E][D]   │  │
│            │ │☐ │[img] Collectibl │ —        │18│[E][D]   │  │
│            │ │  │ ↳ Dioramas      │ Collectbl│ 5│[E][D]   │  │
│            │ │☐ │[img] Cosplay    │ —        │26│[E][D]   │  │
│            │ └──┴─────────────────┴──────────┴──┴─────────┘  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN BLOG LIST (/admin/blog)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Blog Posts   [+ New Post]                       │
│            │ [🔍 Search] [Author ▾] [Status ▾]               │
│            │ ┌──┬────────────────────┬───────────┬──┬──────┐ │
│            │ │☐ │ Title              │ Published │St│Acts  │ │
│            │ ├──┼────────────────────┼───────────┼──┼──────┤ │
│            │ │☐ │ Top 10 Beyblade…   │ Apr 18    │✅│[E][D]│ │
│            │ │☐ │ PSA Grading Guide  │ Apr 12    │✅│[E][D]│ │
│            │ │☐ │ New Season Preview │ Draft     │⬜│[E][D]│ │
│            │ └──┴────────────────────┴───────────┴──┴──────┘ │
└────────────┴─────────────────────────────────────────────────┘

ADMIN ORDERS LIST (/admin/orders)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Orders   [Export CSV]                           │
│            │ [🔍 Search #ID or buyer] [Status ▾] [Date ▾]    │
│            │ ┌───┬──────┬──────────────┬────────┬──────────┐ │
│            │ │☐  │ #ID  │ Buyer        │ ₹Total │ Status   │ │
│            │ ├───┼──────┼──────────────┼────────┼──────────┤ │
│            │ │☐  │ #892 │ R*** S.      │  5,070 │●Shipped  │ │
│            │ │☐  │ #891 │ A*** K.      │ 12,500 │●Pending  │ │
│            │ │☐  │ #890 │ J*** M.      │  2,200 │●Delivered│ │
│            │ └───┴──────┴──────────────┴────────┴──────────┘ │
│            │ ← Prev  [1][2][3]  Next →                       │
└────────────┴─────────────────────────────────────────────────┘

ADMIN ORDER DETAIL (/admin/orders/[id])
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Orders › #892  ● Shipped                        │
│            │ ┌──────────────────────┐ ┌────────────────────┐ │
│            │ │ ITEMS                │ │ CUSTOMER           │ │
│            │ │ Charizard 1/8 Fig    │ │ R*** S.            │ │
│            │ │ ₹4,990 × 1           │ │ ad***@gmail.com    │ │
│            │ │                      │ │ +91-***-***-9876   │ │
│            │ │ Subtotal   ₹4,990    │ │ 42 Marine Lines    │ │
│            │ │ Shipping   ₹   80    │ │ Mumbai, MH 400001  │ │
│            │ │ Total      ₹5,070    │ ├────────────────────┤ │
│            │ └──────────────────────┘ │ ACTIONS            │ │
│            │ TIMELINE                 │ [Mark Delivered]   │ │
│            │ ● Placed  Apr 18 10:30   │ [Mark Refunded]    │ │
│            │ ● Packed  Apr 18 14:15   │ [Download Invoice] │ │
│            │ ● Shipped Apr 19 09:00   │ [Contact Buyer]    │ │
│            │ ○ Delivered (pending)    └────────────────────┘ │
└────────────┴─────────────────────────────────────────────────┘

ADMIN USERS LIST (/admin/users)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Users                                           │
│            │ [🔍 Search by name/email] [Role ▾] [Status ▾]   │
│            │ ┌──┬──────────────┬───────────┬──────┬───────┐  │
│            │ │☐ │ User         │ Email     │ Role │ Acts  │  │
│            │ ├──┼──────────────┼───────────┼──────┼───────┤  │
│            │ │☐ │[AU] R*** S.  │ ad***@… │ BUYER│[E][⊘] │  │
│            │ │☐ │[PV] PokéVault│ po***@… │SELLER│[E][⊘] │  │
│            │ │☐ │[AD] Admin    │ ad***@… │ADMIN │[E][⊘] │  │
│            │ └──┴──────────────┴───────────┴──────┴───────┘  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN USER EDIT (/admin/users/[id]/edit)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Users › R*** S. › Edit                          │
│            │ ┌──────────────────────────────────────────┐    │
│            │ │ Display Name    [R*** S.              ]   │    │
│            │ │ Email (masked)  ad***@gmail.com           │    │
│            │ │ Phone (masked)  ***-***-9876              │    │
│            │ │ Role            [Buyer ▾]                 │    │
│            │ │ Status          ● Active  ○ Suspended     │    │
│            │ │ Notes           [admin internal notes   ] │    │
│            │ │                        [Cancel] [Save]    │    │
│            │ └──────────────────────────────────────────┘    │
└────────────┴─────────────────────────────────────────────────┘

ADMIN REVIEWS LIST (/admin/reviews)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Reviews   [Export]                              │
│            │ [🔍 Search] [Rating ▾] [Status ▾]               │
│            │ ┌──┬────────────┬──────┬───────┬───────────┐    │
│            │ │☐ │ Reviewer   │ ★    │Product│ Status    │    │
│            │ ├──┼────────────┼──────┼───────┼───────────┤    │
│            │ │☐ │ J**** S.   │ ★★★★★│Chariz │ ✅Apprvd  │    │
│            │ │☐ │ A**** K.   │ ★★★☆☆│PSA10  │ ⚑Flagged  │    │
│            │ │☐ │ M**** P.   │ ★★★★☆│Beybld │ ⏳Pending │    │
│            │ ├──┴────────────┴──────┴───────┴───────────┤    │
│            │ │ [Bulk: Approve | Reject | Delete]         │    │
│            │ └──────────────────────────────────────────┘    │
└────────────┴─────────────────────────────────────────────────┘

ADMIN BIDS LIST (/admin/bids)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Bids   [Export CSV]                             │
│            │ [🔍 Search bidder/product] [Status ▾] [Date ▾]  │
│            │ ┌──┬──────────┬────────────┬────────┬────────┐  │
│            │ │☐ │ Bidder   │ Product    │ ₹ Bid  │ Status │  │
│            │ ├──┼──────────┼────────────┼────────┼────────┤  │
│            │ │☐ │ R*** S.  │ PSA10 Pika │ 19,500 │●Active │  │
│            │ │☐ │ A*** K.  │ PSA10 Pika │ 19,000 │○Outbid │  │
│            │ │☐ │ J*** M.  │ Chariz Auction│ 8,200│●Active│  │
│            │ └──┴──────────┴────────────┴────────┴────────┘  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN STORES LIST (/admin/stores)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Stores                                          │
│            │ [🔍 Search stores] [Status ▾]                   │
│            │ ┌──┬──────────────┬────────┬──────┬──────────┐  │
│            │ │☐ │ Store        │Products│ ★ Avg│ Status   │  │
│            │ ├──┼──────────────┼────────┼──────┼──────────┤  │
│            │ │☐ │[img]PokéVault│     24 │  4.9 │ ✅Active │  │
│            │ │☐ │[img]CardMstr │     18 │  4.7 │ ✅Active │  │
│            │ │☐ │[img]BeyStore │      6 │  4.2 │ ⏳Review │  │
│            │ └──┴──────────────┴────────┴──────┴──────────┘  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN PAYOUTS LIST (/admin/payouts)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Payouts   [Export CSV]                          │
│            │ [🔍 Search seller] [Status ▾] [Date ▾]          │
│            │ ┌──┬────────────┬─────────┬──────────┬───────┐  │
│            │ │☐ │ Seller     │ ₹ Amount│ Requested│ Status│  │
│            │ ├──┼────────────┼─────────┼──────────┼───────┤  │
│            │ │☐ │ PokéVault  │ 14,200  │ Apr 20   │⏳Pend │  │
│            │ │☐ │ CardMaster │  8,600  │ Apr 19   │⏳Pend │  │
│            │ │☐ │ BeyStore   │  3,100  │ Apr 15   │✅Paid │  │
│            │ ├──┴────────────┴─────────┴──────────┴───────┤  │
│            │ │ [Bulk: Approve Payouts]                      │  │
│            │ └─────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN COUPONS LIST (/admin/coupons)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Coupons   [+ New Coupon]                        │
│            │ [🔍 Search code] [Type ▾] [Status ▾]            │
│            │ ┌──┬──────────┬──────────┬──────────┬────────┐  │
│            │ │☐ │ Code     │ Discount │ Expires  │ Status │  │
│            │ ├──┼──────────┼──────────┼──────────┼────────┤  │
│            │ │☐ │ SAVE10   │ 10%      │ Apr 30   │✅Active│  │
│            │ │☐ │ NEWUSER  │ ₹200 off │ May 31   │✅Active│  │
│            │ │☐ │ WELCOME  │ 15%      │ Expired  │⬜Expird│  │
│            │ └──┴──────────┴──────────┴──────────┴────────┘  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN FAQs LIST (/admin/faqs)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ FAQs (42 total)   [+ New FAQ]                   │
│            │ [🔍 Search] [Category ▾]                         │
│            │ ┌──┬───────────────────────────────┬──┬───────┐ │
│            │ │☐ │ Question                      │# │ Acts  │ │
│            │ ├──┼───────────────────────────────┼──┼───────┤ │
│            │ │≡☐│ How do auctions work?          │1 │[E][D] │ │
│            │ │≡☐│ What is the return policy?     │2 │[E][D] │ │
│            │ │≡☐│ How are sellers verified?      │3 │[E][D] │ │
│            │ │≡☐│ How do I track my order?       │4 │[E][D] │ │
│            │ │≡☐│ Can I cancel an order?         │5 │[E][D] │ │
│            │ │  │  … rows 6–25 shown by default  │  │       │ │
│            │ │  │ (drag ≡ to reorder)            │  │       │ │
│            │ ├──┴───────────────────────────────┴──┴───────┤ │
│            │ │  Showing 1–25 of 42  [Show More ▾]          │ │
│            │ └─────────────────────────────────────────────┘ │
│            │ NOTE: default load = all FAQs or first 25       │
│            │ (whichever is reached first); no forced paging.  │
└────────────┴─────────────────────────────────────────────────┘

ADMIN EVENTS LIST (/admin/events)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Events   [+ New Event]                          │
│            │ [🔍 Search] [Status ▾]                           │
│            │ ┌──┬────────────────┬──────────┬───────┬──────┐ │
│            │ │☐ │ Event          │ Date     │Entries│ Acts │ │
│            │ ├──┼────────────────┼──────────┼───────┼──────┤ │
│            │ │☐ │ PokéFest 2026  │ Apr 30   │   124 │[E][D]│ │
│            │ │☐ │ BeyBattle Apr  │ Apr 25   │    38 │[E][D]│ │
│            │ │☐ │ Summer Sale    │ Jun 01   │     0 │[E][D]│ │
│            │ └──┴────────────────┴──────────┴───────┴──────┘ │
└────────────┴─────────────────────────────────────────────────┘

ADMIN EVENT ENTRIES (/admin/events/[id]/entries)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Events › PokéFest 2026 › Entries  [Export CSV]  │
│            │ [🔍 Search participant] [Status ▾]               │
│            │ ┌──┬────────────┬───────────┬────────┬────────┐ │
│            │ │☐ │ Participant│ Registered│ Type   │ Status │ │
│            │ ├──┼────────────┼───────────┼────────┼────────┤ │
│            │ │☐ │ R*** S.    │ Apr 18    │ Online │✅Conf  │ │
│            │ │☐ │ A*** K.    │ Apr 17    │ In-Prn │✅Conf  │ │
│            │ │☐ │ J*** M.    │ Apr 19    │ Online │⏳Pend  │ │
│            │ └──┴────────────┴───────────┴────────┴────────┘ │
└────────────┴─────────────────────────────────────────────────┘

ADMIN CAROUSEL LIST + FORM (/admin/carousel)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Hero Carousel   [+ New Slide]                   │
│            │ ┌──┬──────────────────────────┬───┬──────────┐  │
│            │ │≡☐│ Slide                    │ St│ Actions  │  │
│            │ ├──┼──────────────────────────┼───┼──────────┤  │
│            │ │≡☐│[img] Season 5 Launch     │ ✅│[E][D][▲] │  │
│            │ │≡☐│[img] Flash Sale – 15% Off│ ✅│[E][D][▲] │  │
│            │ │≡☐│[img] New Arrivals Week   │ ⬜│[E][D][▲] │  │
│            │ │  │ (drag ≡ to reorder)      │   │          │  │
│            │ └──┴──────────────────────────┴───┴──────────┘  │
│            │                                [Save Order]     │
└────────────┴─────────────────────────────────────────────────┘

ADMIN CAROUSEL SLIDE FORM (/admin/carousel/new)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Carousel › New Slide                            │
│            │ ┌───────────────────────────┐ ┌─────────────┐   │
│            │ │ Title *                   │ │ SLIDE IMAGE │   │
│            │ │ [_______________________] │ │ ┌─────────┐ │   │
│            │ │ Subtitle                  │ │ │  [img]  │ │   │
│            │ │ [_______________________] │ │ └─────────┘ │   │
│            │ │ CTA Label *               │ │ [Upload]    │   │
│            │ │ [_______________________] │ │             │   │
│            │ │ CTA Link *                │ │ STATUS      │   │
│            │ │ [_______________________] │ │ ● Active    │   │
│            │ │ Background Color          │ │ ○ Hidden    │   │
│            │ │ [#______]                 │ │             │   │
│            │ │          [Cancel] [Save]  │ └─────────────┘   │
│            │ └───────────────────────────┘                   │
└────────────┴─────────────────────────────────────────────────┘

ADMIN HOMEPAGE SECTIONS LIST (/admin/sections)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Homepage Sections   [+ New Section]             │
│            │ ┌──┬────────────────────────────┬───┬────────┐  │
│            │ │≡☐│ Section                    │ St│ Acts   │  │
│            │ ├──┼────────────────────────────┼───┼────────┤  │
│            │ │≡☐│ #0  Announcement Bar       │ ✅│[E][D]  │  │
│            │ │≡☐│ #1  Hero Carousel          │ ✅│[E][D]  │  │
│            │ │≡☐│ #2  Stats Counter          │ ✅│[E][D]  │  │
│            │ │≡☐│ #5  Shop by Category       │ ✅│[E][D]  │  │
│            │ │≡☐│ #6  Featured Products      │ ✅│[E][D]  │  │
│            │ │≡☐│ #7  Live Auctions          │ ✅│[E][D]  │  │
│            │ │≡☐│ #11 Discover Amazing Deals │ ✅│[E][D]  │  │
│            │ │≡☐│ #16 Newsletter             │ ✅│[E][D]  │  │
│            │ │  │ (drag ≡ to reorder)        │   │        │  │
│            │ └──┴────────────────────────────┴───┴────────┘  │
│            │                                  [Save Order]   │
└────────────┴─────────────────────────────────────────────────┘

ADMIN SECTION EDIT FORM (/admin/sections/[id]/edit)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Sections › Featured Products › Edit             │
│            │ ┌──────────────────────────────────────────┐    │
│            │ │ Section Title  [Featured Products      ] │    │
│            │ │ Subtitle       [Hand-picked for you    ] │    │
│            │ │ Content Source                           │    │
│            │ │ ● Auto (latest featured)                 │    │
│            │ │ ○ Manual selection   [Select Products]   │    │
│            │ │ Max Items     [12]                       │    │
│            │ │ Background    ● Default  ○ Custom [#___] │    │
│            │ │ Visibility    ● Visible  ○ Hidden        │    │
│            │ │                        [Cancel] [Save]   │    │
│            │ └──────────────────────────────────────────┘    │
└────────────┴─────────────────────────────────────────────────┘

ADMIN ADS INVENTORY (/admin/ads)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Ads Inventory   [+ New Ad]                      │
│            │ [🔍 Search] [Provider ▾] [Placement ▾] [Status ▾]│
│            │ ┌──┬──────────────┬──────────┬─────────┬──────┐ │
│            │ │☐ │ Campaign     │ Provider │ Slot    │ St   │ │
│            │ ├──┼──────────────┼──────────┼─────────┼──────┤ │
│            │ │☐ │ PokéFest Q2  │ Manual   │ home.1  │ ✅Act│ │
│            │ │☐ │ Google Auto  │ AdSense  │ list.top│ ✅Act│ │
│            │ │☐ │ Partner Rail │ 3rdParty │ blog.rt │ ⏳Sch│ │
│            │ │☐ │ Summer Sale  │ Manual   │ foot.pre│ ⏸Psd│ │
│            │ ├──┴──────────────┴──────────┴─────────┴──────┤ │
│            │ │ [Bulk: Activate | Pause | Delete]           │ │
│            │ └─────────────────────────────────────────────┘ │
│            │ ← Prev [1][2][3] Next →                        │
└────────────┴─────────────────────────────────────────────────┘

ADMIN AD EDIT FORM (/admin/ads/new | /admin/ads/[id]/edit)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Ads › New Campaign                              │
│            │ [Manual] [AdSense] [Third-Party]                │
│            │ ─────────────────────────────────────────────── │
│            │ CAMPAIGN META                                   │
│            │ Campaign Name *    [PokéFest Q2 Banner       ] │
│            │ Placement Slot *   [home.inline.1 ▾]           │
│            │ Status            ● Draft ○ Scheduled ○ Active │
│            │ Start Date        [2026-04-25 10:00]           │
│            │ End Date          [2026-05-13 23:59]           │
│            │ ─────────────────────────────────────────────── │
│            │ MANUAL TAB                                      │
│            │ Headline *       [Catch PokéFest Deals        ] │
│            │ Body             [Extra 15% off this weekend  ] │
│            │ CTA Label *      [Shop Now                   ] │
│            │ CTA Link *       [/promotions?tab=deals      ] │
│            │ Creative Image   [Upload] [banner-hero.jpg]    │
│            │ Sponsored Label  [Sponsored ▾]                 │
│            │ ─────────────────────────────────────────────── │
│            │ ADSENSE TAB                                     │
│            │ Client ID        [ca-pub-___________________ ] │
│            │ Slot ID          [__________________________ ] │
│            │ Format           [auto ▾]  Responsive [ON ]   │
│            │ Consent Required [ON ]                         │
│            │ ─────────────────────────────────────────────── │
│            │ THIRD-PARTY TAB                                 │
│            │ Provider Name    [AffiliateX                ] │
│            │ Script URL       [https://cdn.partner/...   ] │
│            │ Embed Code       [<script>...</script>      ] │
│            │ Sandbox Policy   [allow scripts only ▾]       │
│            │                        [Preview] [Save]       │
└────────────┴─────────────────────────────────────────────────┘

ADMIN AD PLACEMENT MAP (/admin/ads/placements)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Placement Map                                   │
│            │ ┌─────────────────────────────────────────────┐ │
│            │ │ SLOT ID              PAGE         SIZE      │ │
│            │ ├─────────────────────────────────────────────┤ │
│            │ │ home.hero.after      Homepage     970×250   │ │
│            │ │ home.inline.1        Homepage     fluid     │ │
│            │ │ promotions.inline    Promotions   in-feed   │ │
│            │ │ listing.sidebar.top  Listings     300×600   │ │
│            │ │ content.sidebar.top  Blog/Event   300×250   │ │
│            │ │ footer.pre           Global       970×90    │ │
│            │ └─────────────────────────────────────────────┘ │
│            │ [Preview Desktop] [Preview Mobile] [Export Map]│
└────────────┴─────────────────────────────────────────────────┘

ADMIN SITE SETTINGS — EXPANDED (/admin/site)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ Site Settings                                   │
│            │ [General][SEO][Social][Payments][Shipping][Ads][Keys]│
│            │ ─────────────────────────────────────────────── │
│            │ GENERAL                                         │
│            │ Site Name         [LetItRip                   ] │
│            │ Tagline           [India's #1 Collectibles     ] │
│            │ Support Email     [support@letitrip.in        ] │
│            │ Contact Phone     [+91 _______________________ ] │
│            │ Default Currency  [INR ▾]   Default Locale [en▾]│
│            │ Maintenance Mode  [toggle OFF]                  │
│            │ ─────────────────────────────────────────────── │
│            │ SEO (tab)                                       │
│            │ Meta Title        [LetItRip — Collectibles     ] │
│            │ Meta Description  [__________________________ ] │
│            │ OG Image          [Upload] [current-og.jpg]    │
│            │ ─────────────────────────────────────────────── │
│            │ SOCIAL (tab)                                    │
│            │ Facebook URL      [https://facebook.com/...   ] │
│            │ Instagram URL     [https://instagram.com/...  ] │
│            │ Twitter/X URL     [https://x.com/...          ] │
│            │ WhatsApp Number   [+91 _______________________ ] │
│            │ ─────────────────────────────────────────────── │
│            │ PAYMENTS (tab)                                  │
│            │ Razorpay Key ID   [rzp_live_**************    ] │
│            │ Razorpay Secret   [••••••••••••••••           ] │
│            │ Platform Fee %    [5]                           │
│            │ Min Payout ₹      [500]                         │
│            │ ─────────────────────────────────────────────── │
│            │ SHIPPING (tab)                                  │
│            │ Default Carrier   [Delhivery ▾]                 │
│            │ Free Ship ≥ ₹     [999]                         │
│            │ Base Rate ₹       [80]                          │
│            │ ─────────────────────────────────────────────── │
│            │ ADS (tab)                                       │
│            │ Global Ads       [toggle ON ]                   │
│            │ Consent Gate     [toggle ON ]                   │
│            │ Default Label    [Sponsored ▾]                  │
│            │ Auto-Inject Feed [after 6, then every 12     ] │
│            │ Max Ads / page    [3]                           │
│            │ Block Ads On     [checkout, auth, success     ] │
│            │ AdSense Enabled  [toggle OFF]                   │
│            │ 3rd-Party Enabled[toggle OFF]                   │
│            │ ─────────────────────────────────────────────── │
│            │ API KEYS (tab)                                  │
│            │ Firebase Project  [letitrip-prod ●] (read-only)│
│            │ Algolia App ID    [________________]            │
│            │ Algolia API Key   [••••••••••••••••]  [Reveal] │
│            │ Email Provider    [SendGrid ▾]                  │
│            │ SendGrid API Key  [••••••••••••••••]  [Reveal] │
│            │ AdSense Client ID [ca-pub-_______________    ] │
│            │ Partner SDK Key   [••••••••••••••••]  [Reveal] │
│            │ ⚠ Key changes require redeploy                  │
│            │                              [Save Changes]    │
└────────────┴─────────────────────────────────────────────────┘

ADMIN AI COPILOT (/admin/copilot)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ ADMIN NAV  │ AI Copilot                                      │
│            │ ┌──────────────────────────────────────────┐    │
│            │ │ SUGGESTED ACTIONS                        │    │
│            │ │ [⚑ 3 reviews flagged — Review now]       │    │
│            │ │ [₹ 2 payouts pending >7 days — Approve]  │    │
│            │ │ [📦 8 products low stock — Notify sellers]│    │
│            │ └──────────────────────────────────────────┘    │
│            │ ─────────────────────────────────────────────── │
│            │ CHAT                                            │
│            │ ┌──────────────────────────────────────────┐    │
│            │ │ Copilot: How can I help you today?        │    │
│            │ │                                           │    │
│            │ │ You: Show me top 5 products by revenue    │    │
│            │ │                                           │    │
│            │ │ Copilot: Here are the top 5 products      │    │
│            │ │ this month by revenue...                  │    │
│            │ │ 1. Charizard 1/8 Fig — ₹1,24,750          │    │
│            │ │ 2. PSA10 Pikachu     — ₹98,000            │    │
│            │ └──────────────────────────────────────────┘    │
│            │ [Ask anything about your store data...] [Send]  │
└────────────┴─────────────────────────────────────────────────┘
```

---

### Design Class: Seller Dashboard

Hub with earnings summary, shortcut tiles, and recent orders. Analytics shows revenue chart + top product table. Frame only — no listing toolbar or filter sidebar on these pages.

**Appkit components:** `SellerDashboardView` (hub view) — `SellerStatCard` (single KPI tile) — `SellerPayoutStats` (payout KPI display) — `DataTable` (recent orders table) — `QuickActionsPanel` (shortcut grid) — `SellerAnalyticsView` (analytics page) — `SellerPayoutHistoryTable` (payout history) — `SellerSidebar` (left nav) — `Section` + `Heading` + `Text`

```
SELLER HUB — DESKTOP (/seller)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Welcome back, PokéVault!                        │
│ ─────────  │ ─────────────────────────────────────────────── │
│ Dashboard  │ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│ Analytics  │ │ ₹82,000   │ │ 34 Orders │ │ 12 Active │      │
│ Products   │ │ This Month│ │ This Month│ │ Listings  │      │
│ Orders     │ └───────────┘ └───────────┘ └───────────┘      │
│ Auctions   │ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│ Coupons    │ │ ₹14,200   │ │ 4 Pending │ │ 4.9★ Avg  │      │
│ Offers     │ │ Pending   │ │ Payouts   │ │ Rating    │      │
│ Payouts    │ │ Payout    │ │           │ │ (28 rev.) │      │
│ Store      │ └───────────┘ └───────────┘ └───────────┘      │
│ Shipping   │ ─────────────────────────────────────────────── │
│ Payout     │ RECENT ORDERS                    [View All →]   │
│ Settings   │ ┌──────┬───────────────┬────────┬────────────┐  │
│ Addresses  │ │ #ID  │ Product       │ ₹      │ Status     │  │
│            │ ├──────┼───────────────┼────────┼────────────┤  │
│            │ │ #892 │ Charizard Fig │  4,990 │ ● Shipped  │  │
│            │ │ #889 │ PSA10 Card    │ 18,000 │ ● Delivered│  │
│            │ └──────┴───────────────┴────────┴────────────┘  │
│            │ QUICK ACTIONS                                    │
│            │ [+ New Product] [+ Auction] [⬇ Payouts]         │
└────────────┴─────────────────────────────────────────────────┘

SELLER ANALYTICS — DESKTOP (/seller/analytics)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Analytics    [Last 30 days ▾] [Export CSV]      │
│            │ ─────────────────────────────────────────────── │
│            │ ┌─────────────────────────────────────────────┐ │
│            │ │ EARNINGS OVER TIME                          │ │
│            │ │  ₹↑                                         │ │
│            │ │      ╭────╮      ╭────╮                     │ │
│            │ │ ─────╯    ╰──────╯    ╰──────               │ │
│            │ │  Week 1  Week 2  Week 3  Week 4             │ │
│            │ └─────────────────────────────────────────────┘ │
│            │ ┌────────────────────┐ ┌──────────────────────┐ │
│            │ │ TOP PRODUCTS       │ │ CONVERSION           │ │
│            │ │ Charizard Fig ₹4,990│ │ Views:    1,240     │ │
│            │ │ PSA10 Pikachu ₹9,800│ │ Clicks:     342     │ │
│            │ │ Beyblade Burst ₹890 │ │ Orders:      34     │ │
│            │ └────────────────────┘ │ Rate:       9.9%    │ │
│            │                        └──────────────────────┘ │
└────────────┴─────────────────────────────────────────────────┘
```

---

### Design Class: Seller CRUD Forms

Seller create/edit product should mirror the admin sidepanel pattern when launched from seller listing tables. Keep store settings, payout settings, and shipping as dedicated settings pages unless they are triggered as quick edits. Multi-step listing creation can open as a full-page flow for first-time creation, but row-level edit should prefer a right-side sidepanel.

**Appkit components:** `SellerCreateProductView` + `SellerEditProductView` (product form views) — `SellerStoreView` + `SellerStoreSetupView` (store settings) — `SellerPayoutSettingsView` (bank/UPI form) — `SellerShippingView` (shipping zones) — `SellerAddressesView` (pickup addresses) — `StepperNav` (multi-step progress for create product + become-seller) — `Form` + `FormGroup` + `FormActions` + `FormField` + `Input` + `Select` + `Textarea` + `RadioGroup` + `Toggle` (field primitives) — `ImageGallery` (product photos) — `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` (store settings tabs: Profile/Branding/Policies) — `DataTable` (shipping zones list) — `Alert` (payout re-verification warning)

```
SELLER EDIT PRODUCT — DESKTOP SIDEPANEL (UX OPTIMIZED)
┌──────────────────────────────────────────────────────────────┬──────────────────────┐
│ TitleBar                                                     │ Edit Listing        │
├────────────┬─────────────────────────────────────────────────┤ [✕]                  │
│ SELLER NAV │ My Products   [🔍 Search] [Status ▾] [+ New]    │ ─────────────────── │
│            │ ┌──┬──────────────────┬──────────┬──┬────────┐  │ Title *             │
│            │ │☐ │ Product          │ Price    │St│Actions │  │ [Charizard VMAX...] │
│            │ ├──┼──────────────────┼──────────┼──┼────────┤  │ Description         │
│            │ │☐ │ Charizard VMAX   │ ₹14,900  │✅│[E][D]  │  │ [textarea........]  │
│            │ │☐ │ Gardevoir 1/7    │ ₹17,200  │✅│[E][D]  │  │ Category Condition  │
│            │ │☐ │ Umbreon 1/6      │ ₹ 8,990  │⬜│[E][D]  │  │ [Select] [Select]   │
│            │ └──┴──────────────────┴──────────┴──┴────────┘  │ Price ₹  Stock      │
│            │                                                 │ [_____]  [___]      │
│            │                                                 │ Photos              │
│            │                                                 │ [img][img][+ Add]   │
│            │                                                 │ Listing Type        │
│            │                                                 │ ● Fixed ○ Auction   │
│            │                                                 │ ○ Pre-Order         │
│            │                                                 │ Preview listing ↗   │
│            │                                                 │──────────────────── │
│            │                                                 │ [Cancel] [Save Draft] [Save]│
└────────────┴─────────────────────────────────────────────────┴──────────────────────┘

SELLER CREATE PRODUCT — FULL PAGE (first-time / multi-step only)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Products › New Listing                          │
│            │ STEP 1 ─── STEP 2 ─── STEP 3      (progress)   │
│            │ ─────────────────────────────────────────────── │
│            │ Use full-page flow only when onboarding, media │
│            │ setup, pricing strategy, or shipping rules     │
│            │ require deeper guided creation.                │
│            │                             [Cancel] [Next →]  │
└────────────┴─────────────────────────────────────────────────┘

SELLER STORE SETTINGS — DESKTOP (/seller/store)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Store Settings                                  │
│            │ [Profile] [Branding] [Policies]                 │
│            │ ─────────────────────────────────────────────── │
│            │ ┌─────────────────────────┐ ┌────────────────┐  │
│            │ │ Store Name *            │ │ BANNER IMAGE   │  │
│            │ │ [_____________________ ]│ │ ┌────────────┐ │  │
│            │ │ Slug (auto)             │ │ │  [banner]  │ │  │
│            │ │ [_____________________ ]│ │ └────────────┘ │  │
│            │ │ Bio / Description       │ │ [Change]       │  │
│            │ │ [_____________________] │ │                │  │
│            │ │ [_____________________] │ │ LOGO           │  │
│            │ │ WhatsApp (optional)     │ │ ┌────┐         │  │
│            │ │ [+91 ________________] │ │ │logo│         │  │
│            │ │                         │ │ └────┘         │  │
│            │ │          [Cancel][Save]  │ │ [Change]       │  │
│            │ └─────────────────────────┘ └────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘

SELLER PAYOUT SETTINGS — DESKTOP (/seller/payout-settings)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Payout Settings                                 │
│            │ [UPI] [Bank Transfer]                           │
│            │ ─────────────────────────────────────────────── │
│            │ ─ UPI ──────────────────────────────────────    │
│            │ UPI ID *                                        │
│            │ [______________________________________]        │
│            │ Linked Name (verified via NPCI)                 │
│            │ [______________________________________]        │
│            │ ─ BANK ACCOUNT ────────────────────────         │
│            │ Account Holder *    IFSC Code *                 │
│            │ [________________]  [____________]              │
│            │ Account Number *                                │
│            │ [______________________________________]        │
│            │ Bank Name (auto-filled from IFSC)               │
│            │ [______________________________________]        │
│            │ ⚠ Payout details change requires re-verification│
│            │                             [Cancel] [Save]     │
└────────────┴─────────────────────────────────────────────────┘

SELLER SHIPPING SETTINGS — DESKTOP (/seller/shipping)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Shipping Settings    [+ Add Zone]               │
│            │ ─────────────────────────────────────────────── │
│            │ Processing Time: [1-2 days ▾]                   │
│            │ ─────────────────────────────────────────────── │
│            │ SHIPPING ZONES                                  │
│            │ ┌──────────────────────────────────────────┐   │
│            │ │ Zone          Rate     Estimate  Actions │   │
│            │ ├──────────────────────────────────────────┤   │
│            │ │ India — All   ₹80 flat  3-5 days [Edit]  │   │
│            │ │ Express       ₹200      1-2 days [Edit]  │   │
│            │ │ Free ≥ ₹999   ₹0        3-5 days [Edit]  │   │
│            │ └──────────────────────────────────────────┘   │
│            │                              [Save Changes]     │
└────────────┴─────────────────────────────────────────────────┘

SELLER PRODUCTS LIST (/seller/products)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ My Products   [+ New Listing]                   │
│            │ [🔍 Search] [Type ▾] [Status ▾]                 │
│            │ ┌──┬──────────────────┬──────────┬──┬────────┐  │
│            │ │☐ │ Product          │ Price    │St│Actions │  │
│            │ ├──┼──────────────────┼──────────┼──┼────────┤  │
│            │ │☐ │[img] Charizard   │ ₹4,990   │✅│[E][D]  │  │
│            │ │☐ │[img] PSA10 Card  │ ₹18,000  │✅│[E][D]  │  │
│            │ │☐ │[img] Beyblade    │ ₹   890  │⬜│[E][D]  │  │
│            │ ├──┴──────────────────┴──────────┴──┴────────┤  │
│            │ │ [Bulk: Publish | Unpublish | Delete]        │  │
│            │ └─────────────────────────────────────────────┘  │
│            │ ← Prev  [1][2][3]  Next →                       │
└────────────┴─────────────────────────────────────────────────┘

SELLER ORDERS LIST (/seller/orders)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Orders   [Export CSV]                           │
│            │ [🔍 Search #ID] [Status ▾] [Date ▾]             │
│            │ ┌──┬──────┬──────────────┬────────┬──────────┐  │
│            │ │☐ │ #ID  │ Product      │ ₹Total │ Status   │  │
│            │ ├──┼──────┼──────────────┼────────┼──────────┤  │
│            │ │☐ │ #892 │ Charizard    │  4,990 │●Shipped  │  │
│            │ │☐ │ #891 │ PSA10 Card   │ 18,000 │●Pending  │  │
│            │ │☐ │ #887 │ Beyblade     │    890 │●Delivered│  │
│            │ └──┴──────┴──────────────┴────────┴──────────┘  │
│            │ ← Prev  [1][2][3]  Next →                       │
└────────────┴─────────────────────────────────────────────────┘

SELLER ORDER DETAIL (/seller/orders/[id])
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Orders › #892  ● Shipped                        │
│            │ ┌──────────────────────┐ ┌────────────────────┐ │
│            │ │ ITEMS                │ │ SHIP TO (masked)   │ │
│            │ │ Charizard 1/8 Fig    │ │ R*** S.            │ │
│            │ │ ₹4,990 × 1           │ │ Mumbai, MH 400001  │ │
│            │ │ ─────────────────    │ ├────────────────────┤ │
│            │ │ Total  ₹4,990        │ │ ACTIONS            │ │
│            │ └──────────────────────┘ │ [Mark Shipped]     │ │
│            │ TIMELINE                 │ [Print Label]      │ │
│            │ ● Placed  Apr 18 10:30   │ [Contact Buyer]    │ │
│            │ ● Packed  Apr 18 14:15   │ [Raise Dispute]    │ │
│            │ ○ Delivered (pending)    └────────────────────┘ │
└────────────┴─────────────────────────────────────────────────┘

SELLER AUCTIONS LIST (/seller/auctions)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Auctions   [+ New Auction]                      │
│            │ [🔍 Search] [Status ▾]                           │
│            │ ┌──┬────────────────┬────────┬──────┬────────┐  │
│            │ │☐ │ Product        │ Reserve│ Bids │ Status │  │
│            │ ├──┼────────────────┼────────┼──────┼────────┤  │
│            │ │☐ │ PSA10 Pikachu  │₹15,000 │   8  │●Live   │  │
│            │ │☐ │ Chariz Holo    │ ₹8,000 │   3  │●Live   │  │
│            │ │☐ │ Beyblade Vol2  │ ₹1,500 │   0  │⬜Draft  │  │
│            │ └──┴────────────────┴────────┴──────┴────────┘  │
│            │ ← Prev  [1][2]  Next →                          │
└────────────┴─────────────────────────────────────────────────┘

SELLER COUPONS LIST (/seller/coupons)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Coupons   [+ New Coupon]                        │
│            │ [🔍 Search code] [Status ▾]                      │
│            │ ┌──┬──────────┬──────────┬──────────┬────────┐  │
│            │ │☐ │ Code     │ Discount │ Expires  │ Status │  │
│            │ ├──┼──────────┼──────────┼──────────┼────────┤  │
│            │ │☐ │ VAULT10  │ 10%      │ Apr 30   │✅Active│  │
│            │ │☐ │ VAULT20  │ ₹200 off │ May 31   │✅Active│  │
│            │ │☐ │ SUMMER15 │ 15%      │ Expired  │⬜Expird│  │
│            │ └──┴──────────┴──────────┴──────────┴────────┘  │
└────────────┴─────────────────────────────────────────────────┘

SELLER OFFERS LIST (/seller/offers)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Offers Received   [Export]                      │
│            │ [🔍 Search] [Status ▾]                           │
│            │ ┌──┬────────────┬────────────┬────────┬───────┐ │
│            │ │☐ │ Product    │ Buyer      │ ₹Offer │Status │ │
│            │ ├──┼────────────┼────────────┼────────┼───────┤ │
│            │ │☐ │ Charizard  │ A*** K.    │  4,200 │⏳Pend │ │
│            │ │☐ │ PSA10 Card │ J*** M.    │ 16,500 │⏳Pend │ │
│            │ │☐ │ Beyblade   │ R*** S.    │    750 │✅Accpt│ │
│            │ ├──┴────────────┴────────────┴────────┴───────┤ │
│            │ │ [Accept] [Counter] [Decline]  (per-row acts) │ │
│            │ └─────────────────────────────────────────────┘ │
└────────────┴─────────────────────────────────────────────────┘

SELLER PAYOUTS LIST (/seller/payouts)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Payout History                                  │
│            │ ┌────────────────────────────────────────────┐  │
│            │ │ AVAILABLE BALANCE          ₹14,200         │  │
│            │ │ Pending clearance          ₹ 2,400         │  │
│            │ │                   [Request Payout]         │  │
│            │ └────────────────────────────────────────────┘  │
│            │ ─────────────────────────────────────────────── │
│            │ ┌──┬──────────┬─────────┬──────────┬────────┐   │
│            │ │☐ │ Payout # │ ₹Amount │ Requested│ Status │   │
│            │ ├──┼──────────┼─────────┼──────────┼────────┤   │
│            │ │  │ #P-041   │ 14,200  │ Apr 20   │⏳Pend  │   │
│            │ │  │ #P-038   │  8,600  │ Mar 28   │✅Paid  │   │
│            │ │  │ #P-031   │  5,100  │ Feb 14   │✅Paid  │   │
│            │ └──┴──────────┴─────────┴──────────┴────────┘   │
└────────────┴─────────────────────────────────────────────────┘

SELLER ADDRESSES (/seller/addresses)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├────────────┬─────────────────────────────────────────────────┤
│ SELLER NAV │ Pickup Addresses   [+ Add Pickup Address]       │
│            │ ┌────────────────────────────────────────────┐  │
│            │ │ ★ DEFAULT PICKUP                           │  │
│            │ │ PokéVault  ·  +91-***-***-4567             │  │
│            │ │ 12 Linking Road, Bandra West               │  │
│            │ │ Mumbai, Maharashtra 400050                  │  │
│            │ │                         [Edit] [Delete]    │  │
│            │ ├────────────────────────────────────────────┤  │
│            │ │ Warehouse                                   │  │
│            │ │ 7 MIDC Industrial Area, Andheri East       │  │
│            │ │ Mumbai, Maharashtra 400093                  │  │
│            │ │          [Set Default] [Edit] [Delete]     │  │
│            │ └────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘
```

---

### Design Class: Auth Pages

Centered single-column card layout. Logo at top. No TitleBar/Navbar shell. Social auth buttons above email/password fields. Error inline under failing field.

**Appkit components:** `LoginForm`, `RegisterForm`, `ForgotPasswordView`, `ResetPasswordView`, `VerifyEmailView`, `OAuthLoadingView` (complete view components — no raw form needed) — `SocialAuthButtons` (Google/social group) — `Input` + `FormField` (field + inline error) — `PasswordStrengthIndicator` (register password) — `Button` (primary CTA, green variant) — `Alert` (global auth error) — `Checkbox` (terms agreement) — `TextLink` (switch between auth flows) — `Card` (centered card shell)

```
LOGIN — DESKTOP + MOBILE (/auth/login)
┌─────────────────────────────────┐
│                                 │
│         LetItRip Logo           │
│      Welcome back               │
│                                 │
│  [G Continue with Google    ]   │
│  ──────────── or ───────────    │
│  Email                          │
│  [____________________________] │
│  Password                       │
│  [____________________________] │
│  [Show]                         │
│          Forgot password?       │
│  [      Sign In      ]          │  ← green CTA
│                                 │
│  Don't have an account?         │
│  [      Create Account →  ]     │
│                                 │
└─────────────────────────────────┘

REGISTER — DESKTOP + MOBILE (/auth/register)
┌─────────────────────────────────┐
│                                 │
│         LetItRip Logo           │
│      Create your account        │
│                                 │
│  [G Continue with Google    ]   │
│  ──────────── or ───────────    │
│  Full Name                      │
│  [____________________________] │
│  Email                          │
│  [____________________________] │
│  Password                       │
│  [____________________________] │
│  Confirm Password               │
│  [____________________________] │
│  □ I agree to Terms of Service  │
│  [      Create Account    ]     │
│                                 │
│  Already have an account?       │
│  [      Sign In →         ]     │
│                                 │
└─────────────────────────────────┘

FORGOT PASSWORD (/auth/forgot-password)
┌─────────────────────────────────┐
│         LetItRip Logo           │
│      Reset your password        │
│                                 │
│  Enter the email address linked │
│  to your account.               │
│                                 │
│  Email                          │
│  [____________________________] │
│  [    Send Reset Link     ]     │
│  ← Back to Sign In              │
└─────────────────────────────────┘

RESET PASSWORD (/auth/reset-password)
┌─────────────────────────────────┐
│         LetItRip Logo           │
│      Set a new password         │
│                                 │
│  New Password                   │
│  [____________________________] │
│  Confirm New Password           │
│  [____________________________] │
│  [    Update Password     ]     │
└─────────────────────────────────┘

VERIFY EMAIL (/auth/verify-email)
┌─────────────────────────────────┐
│         LetItRip Logo           │
│                                 │
│      ✉ Check your inbox         │
│                                 │
│  We sent a verification link to │
│  ad***@gmail.com                │
│                                 │
│  [   Resend Email (59s)   ]     │
│  [   Change Email →       ]     │
│  ← Back to Sign In              │
└─────────────────────────────────┘
```

---

### Design Class: User Account Pages

Account hub uses a tile grid of sections. Individual pages use the shared AppLayoutShell with right-side public sidebar accessible via ≡.

**Appkit components:** `UserAccountHubView` (hub/dashboard tiles) — `ProfileView` (edit profile) — `UserSettingsView` (security/notifications/privacy tabs) — `UserOrdersView` (order history list) — `OrderDetailView` (order detail + actions) — `UserOrderTrackView` (tracking timeline) — `UserAddressesView` + `AddressBook` + `AddressCard` + `AddressForm` + `AddressSelectorCreate` (addresses) — `BecomeSellerView` (seller onboarding, multi-step via `StepperNav`) — `UserNotificationsView` (notification inbox) — `MessagesView` + `ChatList` + `ChatWindow` (messaging) — `UserOffersView` (offer history) — `UserSidebar` (left account nav) — `Toggle` (notification toggles in settings) — `Tabs` (settings section tabs) — `StatusBadge` (order status) — `Avatar` + `AvatarDisplay` (profile header) — `PriceDisplay` (order totals) — `Alert` (empty state messaging)

```
USER ACCOUNT HUB — DESKTOP (/user)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ [AU] R*** S.   Buyer · Member since Jan 2025                 │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ MY ACCOUNT                                 │
│ ─────────────   │ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ Dashboard       │ │ 📦 Orders │ │ ♡ Wishlist│ │ 💬 Msgs  │  │
│ Orders          │ │  12      │ │  8       │ │  3 new   │   │
│ Wishlist        │ └──────────┘ └──────────┘ └──────────┘   │
│ Messages        │ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ Notifications   │ │ 🔔 Notifs │ │ 🏷 Offers │ │ 📍 Addrs │  │
│ Offers          │ │  5 new   │ │  2       │ │  2 saved │   │
│ Addresses       │ └──────────┘ └──────────┘ └──────────┘   │
│ Profile         │ ─────────────────────────────────────────  │
│ Settings        │ RECENT ORDERS                             │
│ Become Seller   │ ┌──────┬─────────────────┬───────────────┐│
│                 │ │ #892 │ Charizard Figure │ ● Shipped     ││
│                 │ │ #889 │ PSA10 Card      │ ● Delivered   ││
│                 │ └──────┴─────────────────┴───────────────┘│
└─────────────────┴────────────────────────────────────────────┘

USER PROFILE EDIT — DESKTOP (/user/profile)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Edit Profile                               │
│                 │ ┌──────────────────────────┐ ┌──────────┐  │
│                 │ │ Display Name *           │ │ AVATAR   │  │
│                 │ │ [______________________] │ │ ┌──────┐ │  │
│                 │ │ Email (masked)           │ │ │ [AU] │ │  │
│                 │ │ ad***@gmail.com          │ │ └──────┘ │  │
│                 │ │   [Change Email]         │ │ [Upload] │  │
│                 │ │ Phone (masked)           │ └──────────┘  │
│                 │ │ ***-***-9876             │               │
│                 │ │   [Change Phone]         │               │
│                 │ │ Bio                      │               │
│                 │ │ [______________________ ]│               │
│                 │ │ Location                 │               │
│                 │ │ [______________________] │               │
│                 │ │           [Cancel][Save] │               │
│                 │ └──────────────────────────┘               │
└─────────────────┴────────────────────────────────────────────┘

USER SETTINGS — DESKTOP (/user/settings)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Account Settings                           │
│                 │ [Security] [Notifications] [Privacy]       │
│                 │ ─────────────────────────────────────────  │
│                 │ SECURITY                                   │
│                 │ Password            [Change Password]      │
│                 │ Two-Factor Auth     [Enable 2FA]           │
│                 │ Active Sessions     [View Sessions]        │
│                 │ ─────────────────────────────────────────  │
│                 │ NOTIFICATIONS                              │
│                 │ Order updates      [toggle ON ]            │
│                 │ Auction alerts     [toggle ON ]            │
│                 │ Promo emails       [toggle OFF]            │
│                 │ WhatsApp alerts    [toggle ON ]            │
│                 │ ─────────────────────────────────────────  │
│                 │ DANGER ZONE                                │
│                 │ Delete Account     [Delete My Account]     │
└─────────────────┴────────────────────────────────────────────┘

USER ORDERS LIST — DESKTOP (/user/orders)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ My Orders   [All ▾] [🔍 Search]            │
│                 │ ┌────────────────────────────────────────┐ │
│                 │ │ #892  Charizard 1/8 Figure             │ │
│                 │ │ ₹4,990  ·  Apr 18, 2026  ●Shipped     │ │
│                 │ │ [Track Order] [View Details]           │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ #889  PSA10 Pikachu Card               │ │
│                 │ │ ₹18,000 ·  Apr 12, 2026  ●Delivered   │ │
│                 │ │ [Write Review] [View Details]          │ │
│                 │ └────────────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────┘

ORDER DETAIL — DESKTOP (/user/orders/view/[id])
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Order #892  ●Shipped                       │
│                 │ ┌──────────────────┐ ┌──────────────────┐  │
│                 │ │ ITEMS            │ │ SUMMARY          │  │
│                 │ │ ┌──┐ Charizard   │ │ Subtotal ₹4,990  │  │
│                 │ │ │  │ 1/8 Figure  │ │ Shipping   ₹ 80  │  │
│                 │ │ └──┘ ₹4,990 ×1  │ │ ────────────────  │  │
│                 │ │                  │ │ Total    ₹5,070  │  │
│                 │ │                  │ │                  │  │
│                 │ │                  │ │ SHIPPING TO      │  │
│                 │ │                  │ │ R*** S.          │  │
│                 │ │                  │ │ Mumbai, MH 400001│  │
│                 │ └──────────────────┘ └──────────────────┘  │
│                 │ [Track Order]  [Contact Seller]  [Return]   │
└─────────────────┴────────────────────────────────────────────┘

ORDER TRACKING — DESKTOP (/user/orders/[id]/track)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Track Order #892                           │
│                 │ AWB: HD1234567890  [Copy]                  │
│                 │ Carrier: Delhivery                         │
│                 │ ─────────────────────────────────────────  │
│                 │ ● ORDER PLACED      Apr 18 10:30am    ✅   │
│                 │   │                                        │
│                 │ ● PACKED            Apr 18 02:15pm    ✅   │
│                 │   │                                        │
│                 │ ● PICKED UP         Apr 19 09:00am    ✅   │
│                 │   │                                        │
│                 │ ● IN TRANSIT        Apr 20 11:45am    ✅   │
│                 │   │                                        │
│                 │ ○ OUT FOR DELIVERY  Expected Apr 22   ─    │
│                 │   │                                        │
│                 │ ○ DELIVERED                            ─   │
└─────────────────┴────────────────────────────────────────────┘

USER ADDRESSES — DESKTOP (/user/addresses)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ My Addresses       [+ Add New Address]     │
│                 │ ┌────────────────────────────────────────┐ │
│                 │ │ ★ DEFAULT                              │ │
│                 │ │ R*** S.  · +91-***-***-9876            │ │
│                 │ │ 42 Marine Lines, Mumbai                 │ │
│                 │ │ Maharashtra 400001                      │ │
│                 │ │              [Edit] [Delete]            │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ R*** S.                                 │ │
│                 │ │ 7 Bandra Kurla Complex, Mumbai          │ │
│                 │ │ Maharashtra 400051                      │ │
│                 │ │   [Set Default] [Edit] [Delete]         │ │
│                 │ └────────────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────┘

ADDRESS FORM — DESKTOP (/user/addresses/add | /edit/[id])
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Add New Address                            │
│                 │ Full Name *       Phone *                  │
│                 │ [______________]  [+91 ______________]     │
│                 │ Address Line 1 *                           │
│                 │ [________________________________________]  │
│                 │ Address Line 2                             │
│                 │ [________________________________________]  │
│                 │ City *          State *       PIN *        │
│                 │ [____________]  [Select ▾]   [______]      │
│                 │ □ Set as default address                   │
│                 │                   [Cancel] [Save Address]  │
└─────────────────┴────────────────────────────────────────────┘

BECOME SELLER — DESKTOP (/user/become-seller)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Become a Seller                            │
│                 │ STEP 1 ─── STEP 2 ─── STEP 3              │
│                 │ ─────────────────────────────────────────  │
│                 │ STEP 1: STORE IDENTITY                     │
│                 │ Store Name *                               │
│                 │ [________________________________________]  │
│                 │ Store Slug (auto)                          │
│                 │ letitrip.in/stores/[__________________]    │
│                 │ Category *                                 │
│                 │ [Select ▾]                                 │
│                 │ Store Bio                                  │
│                 │ [________________________________________]  │
│                 │ [________________________________________]  │
│                 │ □ I agree to Seller Terms & Conditions     │
│                 │                            [Next →]        │
└─────────────────┴────────────────────────────────────────────┘

NOTIFICATIONS — DESKTOP (/user/notifications)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Notifications  [Mark all read]             │
│                 │ ┌────────────────────────────────────────┐ │
│                 │ │ ● Your order #892 has shipped      2m  │ │
│                 │ │ ● Auction ending soon: PSA10 Card  1h  │ │
│                 │ │ ○ New coupon code: SAVE10 (expire) 2d  │ │
│                 │ │ ○ PokéVault added 3 new listings   3d  │ │
│                 │ └────────────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────┘

MESSAGES — DESKTOP (/user/messages)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬──────────────┬───────────────────────────  │
│ ACCOUNT NAV     │ CONVERSATIONS│ CHAT THREAD               │  │
│                 │ ─────────────│ PokéVault                 │  │
│                 │ PokéVault    │ ─────────────────────────  │  │
│                 │ Is it PSA10? │ You: Is it PSA10?   2m ←  │  │
│                 │ 2m ●         │ PokéVault: Yes, cert. 1m  │  │
│                 │ ─────────────│ ─────────────────────────  │  │
│                 │ CardMaster   │ [Type a message...] [Send] │  │
│                 │ Thank you!   │                             │  │
│                 │ 1d           │                             │  │
└─────────────────┴──────────────┴───────────────────────────  ┘

WISHLIST — DESKTOP (/user/wishlist)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Wishlist (8)   [Sort: Recently Added ▾]    │
│                 │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│                 │ │Card│ │Card│ │Card│ │Card│ │Card│        │
│                 │ └────┘ └────┘ └────┘ └────┘ └────┘        │
│                 │   (same card design as product cards)       │
└─────────────────┴────────────────────────────────────────────┘

USER OFFERS — DESKTOP (/user/offers)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ My Offers   [All ▾]                        │
│                 │ ┌────────────────────────────────────────┐ │
│                 │ │ ┌──┐ Charizard 1/8 Figure              │ │
│                 │ │ │  │ Your offer: ₹4,200                │ │
│                 │ │ └──┘ Listed: ₹4,990  ·  Apr 20         │ │
│                 │ │      ⏳ Pending seller response         │ │
│                 │ │      [Withdraw Offer]                   │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ┌──┐ PSA10 Pikachu Card                │ │
│                 │ │ │  │ Your offer: ₹16,500               │ │
│                 │ │ └──┘ Listed: ₹18,000 ·  Apr 15         │ │
│                 │ │      ✅ Accepted — [Place Order]        │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ┌──┐ Beyblade Burst Vol.2              │ │
│                 │ │ │  │ Your offer: ₹750                  │ │
│                 │ │ └──┘ Listed: ₹890  ·  Apr 10           │ │
│                 │ │      ❌ Declined                        │ │
│                 │ └────────────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────┘
```

---

### Design Class: Checkout & Inline Forms

Checkout is a multi-step full-page flow with progress bar. Inline forms (bid, offer, contact) render as bottom sheet modals on mobile and dialog overlays on desktop.

**Appkit components:** `StepperNav` (checkout step progress bar) — `Form` + `FormGroup` + `FormActions` + `FormField` + `Input` + `RadioGroup` + `Select` (all field primitives) — `AddressSelectorCreate` (address picker + inline add in checkout step 1) — `PriceDisplay` (order summary price) — `Modal` + `ModalFooter` (desktop bid/offer overlay) — `BottomSheet` (mobile bid/offer slide-up) — `PlaceBidForm` (bid form view) — `MakeOfferForm` (offer form view) — `ContactForm` (contact page form) — `Button` (primary CTA, green variant) — `Alert` (bid binding warning, error states) — `SummaryCard` (order summary block)

```
CHECKOUT STEP 1 — DESKTOP (UX OPTIMIZED) (/checkout)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar                                                     │
├──────────────────────────────────────────────────────────────┤
│  [1 Address] ─── [2 Payment] ─── [3 Review]    Saved just now│
├───────────────────────────────────────┬──────────────────────┤
│ DELIVERY ADDRESS                      │ ORDER SUMMARY        │
│ Select where to ship                  │ Charizard 1/8 Fig    │
│ ● R*** S. — 42 Marine Lines, Mumbai   │ ₹4,990 × 1          │
│   Mumbai, MH 400001  [Edit]           │ ─────────────────    │
│ ○ Bandra address                      │ Subtotal    ₹4,990   │
│ [+ Add New Address inline]            │ Shipping    ₹   80   │
│                                       │ ─────────────────    │
│ DELIVERY OPTION                       │ Total      ₹5,070   │
│ ● Standard (3-5 days) — ₹80           │                      │
│ ○ Express  (1-2 days) — ₹200          │ Coupon      [Apply] │
│                                       │ Trust: Secure checkout│
│ Need help? [Contact Support]          │                      │
│                                       │ [Continue to Payment]│
└───────────────────────────────────────┴──────────────────────┘

CHECKOUT STEP 2 — PAYMENT
┌──────────────────────────────────────────────────────────────┐
│  [1 Address ✓] ─── [2 Payment] ─── [3 Review]               │
├───────────────────────────────────────┬──────────────────────┤
│ PAYMENT METHOD                        │ ORDER SUMMARY        │
│ ● UPI                                 │ Total     ₹5,070     │
│   [upi-id@bank        ]               │                      │
│   [Pay ₹5,070 via UPI]                │                      │
│ ○ Card                                │                      │
│   [____ ____ ____ ____]               │                      │
│   Expiry [__/__] CVV [___]            │                      │
│ ○ Net Banking  [Select Bank ▾]        │                      │
│ ○ Cash on Delivery (if available)     │                      │
│                       [Place Order →] │                      │
└───────────────────────────────────────┴──────────────────────┘

PLACE BID — MODAL OVERLAY (product detail page)
┌─────────────────────────────────┐
│ Place Bid                     ✕ │
│ Charizard 1st Ed PSA10          │
│ Current Bid: ₹18,500            │
│ Min Increment: ₹500             │
│ ─────────────────────────────── │
│ Your Bid (₹)                    │
│ [_______________________]       │
│ ≥ ₹19,000                       │
│ ─────────────────────────────── │
│ ⚠ Bids are binding commitments  │
│ [Cancel]      [Confirm Bid →]   │
└─────────────────────────────────┘

MAKE OFFER — MODAL OVERLAY (product detail page)
┌─────────────────────────────────┐
│ Make an Offer                 ✕ │
│ Charizard 1/8 Scale Figure      │
│ Listed price: ₹4,990            │
│ ─────────────────────────────── │
│ Your Offer (₹)                  │
│ [_______________________]       │
│ Message to seller (optional)    │
│ [_____________________________] │
│ Expires in  [24 hours ▾]        │
│ [Cancel]     [Send Offer →]     │
└─────────────────────────────────┘

CONTACT FORM — DESKTOP (/contact)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│             Contact Us                                       │
│                                                              │
│  ┌─────────────────────────────┐ ┌──────────────────────┐   │
│  │ Full Name *                 │ │ 📍 Address            │   │
│  │ [_________________________] │ │ Mumbai, India         │   │
│  │ Email *                     │ │                       │   │
│  │ [_________________________] │ │ 📧 support@letitrip   │   │
│  │ Subject *                   │ │                       │   │
│  │ [Select ▾]                  │ │ 🎧 24/7 Support       │   │
│  │ Message *                   │ │ Response within 24h   │   │
│  │ [___________________________│ │                       │   │
│  │ [________________________ ] │ └──────────────────────┘   │
│  │             [Send Message →]│                             │
│  └─────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────┘

FAQ PAGE — DESKTOP (/faqs/all)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│  Frequently Asked Questions                                  │
│  [🔍 Search FAQs...                              ]           │
│  ─────────────────────────────────────────────────────────── │
│  ┌────────────────────┐  ┌──────────────────────────────┐   │
│  │ TABS (route-param) │  │ All Categories (42)          │   │
│  │ ─────────────────  │  │                              │   │
│  │ ● All (42)         │  │ ┌────────────────────────┐   │   │
│  │ ○ Buying (12)      │  │ │▶ How do auctions work? │   │   │
│  │ ○ Selling (8)      │  │ └────────────────────────┘   │   │
│  │ ○ Payments (7)     │  │ ┌────────────────────────┐   │   │
│  │ ○ Shipping (6)     │  │ │▶ What is return policy?│   │   │
│  │ ○ Account (5)      │  │ └────────────────────────┘   │   │
│  │ ○ Returns (4)      │  │ ┌────────────────────────┐   │   │
│  └────────────────────┘  │ │▶ How sellers verified? │   │   │
│                           │ └────────────────────────┘   │   │
│                           │  … (25 shown by default)      │   │
│                           │                              │   │
│                           │       [Show More ▾]          │   │
│                           └──────────────────────────────┘   │
│  ─────────────────────────────────────────────────────────── │
│  Still have questions? → [Contact Support]                   │
└──────────────────────────────────────────────────────────────┘

FAQ PAGE — EXPANDED ANSWER (/faqs/all — accordion open)
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐   │
│  │▼ How do auctions work?                               │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │  Auctions on LetItRip are time-limited bidding       │   │
│  │  events. The highest bid when the timer expires      │   │
│  │  wins. Bids are binding — only place a bid if you    │   │
│  │  intend to purchase.                                 │   │
│  │                                                      │   │
│  │  [👍 Helpful?] [👎]   Was this helpful to you?       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │▶ What is the return policy?                          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

FAQ PAGE — MOBILE (/faqs/all)
┌─────────────────────────────────┐
│ TitleBar / Navbar               │
│ ─────────────────────────────── │
│ Frequently Asked Questions      │
│ [🔍 Search FAQs...         ]    │
│ ─────────────────────────────── │
│ [Tab: All ▾]                    │
│ (dropdown selector; route-param)│
│ ─────────────────────────────── │
│ ▶ How do auctions work?         │
│ ─────────────────────────────── │
│ ▶ What is the return policy?    │
│ ─────────────────────────────── │
│ ▶ How are sellers verified?     │
│ ─────────────────────────────── │
│  … (25 shown by default)        │
│ ─────────────────────────────── │
│       [Show More ▾]             │
│ ─────────────────────────────── │
│ Still need help?                │
│ [Contact Support →]             │
└─────────────────────────────────┘
```

---

### Design Class: Public Info Pages

Public-facing pages with no auth requirement. Standard TitleBar + Navbar + Footer shell. Content-focused single or two-column layouts. No filter sidebar except Search Results.

**Appkit components:** `SearchResultsView` — `EventDetailView` — `BlogPostView` — `ReviewsListView` — `PublicProfileView` — `NotificationCentreView` — `WishlistView` — `DataTable` — `StatusBadge` — `Avatar` + `AvatarDisplay` — `PriceDisplay` — `Breadcrumbs` + `BreadcrumbItem` — `Tag` / `Badge` — `Accordion` + `AccordionItem` (FAQ on event detail) — `Modal` / `BottomSheet` (event registration) — `BulkActionBar` (selection toolbar in all DataTable list views)

```
SEARCH RESULTS — DESKTOP (/search/charizard/tab/all/sort/relevance/page/1)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ [🔍 charizard                                    ✕]         │
│ 142 results for "charizard"                                  │
├──────────────────────────────────────────────────────────────┤
│ [All(142)][Products(98)][Auctions(27)][Stores(8)][Blog(9)]   │
│ (desktop tab strip; route-param tab segment)                  │
├────────────────────┬─────────────────────────────────────────┤
│ FILTERS            │ [Sort: Relevance ▾] [🔲 Grid] [☰ List]  │
│ ─────────────────  │ ┌────────┐ ┌────────┐ ┌────────┐        │
│ Type               │ │ [img]  │ │ [img]  │ │ [img]  │        │
│ ☑ Products         │ │Chariz  │ │CharizHo│ │PSA10Ch │        │
│ ☑ Auctions         │ │1/8 Fig │ │lo      │ │arizard │        │
│ ☑ Pre-Orders       │ │₹4,990  │ │₹8,200  │ │₹18,000 │        │
│ ─────────────────  │ └────────┘ └────────┘ └────────┘        │
│ Price Range        │ ┌────────┐ ┌────────┐ ┌────────┐        │
│ ₹[____]–₹[____]   │ │ [img]  │ │ [img]  │ │ [img]  │        │
│ ─────────────────  │ │CharizEx│ │CharizFg│ │CharizHl│        │
│ Condition          │ │ Plush  │ │        │ │        │        │
│ ☐ New              │ │₹2,500  │ │₹3,200  │ │₹5,800  │        │
│ ☐ Near Mint        │ └────────┘ └────────┘ └────────┘        │
│ ☐ Used             │ ← Prev  [1][2][3]…[12]  Next →          │
│ ─────────────────  │                                          │
│ Category           │                                          │
│ ☐ TCG Cards        │                                          │
│ ☐ Figures          │                                          │
│ [Apply Filters]    │                                          │
└────────────────────┴─────────────────────────────────────────┘

SEARCH RESULTS — MOBILE (/search/charizard/tab/all/sort/relevance/page/1)
┌─────────────────────────────────────┐
│ TitleBar                            │
│ [🔍 charizard                  ✕]  │
│ 142 results                         │
│ [Tab: All ▾]                         │
│ (dropdown selector; route-param tab) │
│ [🔽 Filters]  [Sort: Relevance ▾]   │
│ ──────────────────────────────────  │
│ ┌──────────┐ ┌──────────┐           │
│ │  [img]   │ │  [img]   │           │
│ │Charizard │ │CharizHolo│           │
│ │₹4,990    │ │₹8,200    │           │
│ └──────────┘ └──────────┘           │
│ ┌──────────┐ ┌──────────┐           │
│ │  [img]   │ │  [img]   │           │
│ │PSA10Char │ │CharizEx  │           │
│ │₹18,000   │ │₹2,500    │           │
│ └──────────┘ └──────────┘           │
│ ← Prev [1][2][3]… Next →            │
│ BOTTOM NAV [🏠][🛍][🔨][⊞][👤]      │
└─────────────────────────────────────┘

EVENT DETAIL — DESKTOP (/events/[id])
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
│ Events › PokéFest 2026                                       │
├──────────────────────────────┬───────────────────────────────┤
│ EVENT HERO                   │ REGISTRATION                  │
│ ┌──────────────────────────┐ │ 📅 April 30, 2026             │
│ │    [event banner img]    │ │ 📍 Mumbai, Maharashtra        │
│ └──────────────────────────┘ │ 🎟 124 / 200 registered       │
│ PokéFest 2026                │ Type: In-Person + Online      │
│                              │ Price: Free entry             │
│ ABOUT                        │ ──────────────────────────    │
│ India's biggest Pokémon TCG  │ [ Register Now → ]            │
│ event — tournaments, trading │                               │
│ and exclusive drops.         │ SHARE                         │
│                              │ [WhatsApp][Twitter][Copy]     │
│ SCHEDULE                     │                               │
│ 10:00 Registration opens     │ ORGANISER                     │
│ 11:00 Tournaments begin      │ [logo] LetItRip Events        │
│ 14:00 Trading session        │ [View Profile]                │
│ 16:00 Exclusive drop         │                               │
│ 18:00 Prize ceremony         └───────────────────────────────┤
│                                                              │
│ FAQ                                                          │
│ ▶ Can I trade cards at the event?                            │
│ ▶ Is there parking available?                                │
│ ▶ What's the prize pool?                                     │
├──────────────────────────────────────────────────────────────┤
│ MORE EVENTS                          [View All Events →]     │
│ ← [BeyBattle Apr] [Summer Sale] →                            │
└──────────────────────────────────────────────────────────────┘

EVENT REGISTRATION MODAL (desktop overlay / mobile bottom sheet)
┌─────────────────────────────────┐
│ Register for PokéFest 2026  [✕] │
│ ──────────────────────────────  │
│ Full Name *                     │
│ [_____________________________] │
│ Email *                         │
│ [_____________________________] │
│ Attendance Type *               │
│ ● In-Person   ○ Online          │
│ □ I agree to event T&Cs         │
│ ──────────────────────────────  │
│      [Cancel]   [Confirm →]     │
└─────────────────────────────────┘

BLOG POST — DESKTOP (/blog/[slug])
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
│ Blog › Top 10 Beyblades of 2026                              │
├───────────────────────────────────┬──────────────────────────┤
│ ARTICLE                           │ SIDEBAR                  │
│ ┌─────────────────────────────┐   │ AUTHOR                   │
│ │       [hero image]          │   │ [AU] J*** M.             │
│ └─────────────────────────────┘   │ Staff Writer · 12 posts  │
│ Top 10 Beyblades of 2026          │ ────────────────────────  │
│ By J*** M. · Apr 18, 2026         │ RECENT POSTS             │
│ 4 min read · 🏷 Beyblade, Guide    │ PSA Grading Guide        │
│ ──────────────────────────────    │ Season 5 Preview         │
│ With Season 5 launching in May,   │ Charizard Value History  │
│ here are the top 10 Beyblade      │ ────────────────────────  │
│ Burst launchers ranked by…        │ TAGS                     │
│                                   │ [Beyblade][TCG][Guide]   │
│ ## 1. Beyblade X Dran Sword       │ ────────────────────────  │
│ [img] Dran Sword leads with…      │ NEWSLETTER               │
│                                   │ [ email ]  [Subscribe]   │
│ ## 2. Cobalt Drake                │                          │
│ [img] Attack type champion…       │                          │
│ ──────────────────────────────    │                          │
│ 👍 Helpful?                        │                          │
│ [WhatsApp][Twitter][Copy Link]    │                          │
├───────────────────────────────────┴──────────────────────────┤
│ RELATED POSTS                        [View All Blog →]       │
│ ← [PSA Grading Guide][S5 Preview][Charizard History] →       │
│ ─────────────────────────────────────────────────────────    │
│ LEAVE A COMMENT  (auth required)                             │
│ [Log in to comment]                                          │
└──────────────────────────────────────────────────────────────┘

PUBLIC USER PROFILE — DESKTOP (/profile/[username]/reviews)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐   │
│ │ [avatar]  R*** S.                                      │   │
│ │           Member since Jan 2025  ·  Buyer              │   │
│ │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │   │
│ │ │  12    │ │ 4.9 ★  │ │  28   │ │   8    │           │   │
│ │ │ Orders │ │ Rating │ │Reviews│ │Wishlist│           │   │
│ │ └────────┘ └────────┘ └────────┘ └────────┘           │   │
│ └────────────────────────────────────────────────────────┘   │
│ [Reviews Given (28)] [Activity] (route-param tab)            │
│ ──────────────────────────────────────────────────────────   │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ [img] Charizard 1/8 Figure  ·  PokéVault               │   │
│ │ ★★★★★  "Amazing condition, exactly as described."      │   │
│ │ Apr 18, 2026                                           │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ [img] PSA10 Pikachu Card  ·  CardMaster                │   │
│ │ ★★★★☆  "Great seller, fast shipping!"                  │   │
│ │ Apr 12, 2026                                           │   │
│ └────────────────────────────────────────────────────────┘   │
│ ← Prev  [1][2]  Next →                                       │
└──────────────────────────────────────────────────────────────┘

PUBLIC REVIEWS LIST — DESKTOP (/reviews)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
│ Reviews   [Sort: Recent ▾]  [Rating ▾]  [Category ▾]        │
├──────────────────────────────────────────────────────────────┤
│ SUMMARY                                                      │
│ ┌──────────────┐  ┌────────────────────────────────────┐     │
│ │   4.8 / 5    │  │ ★★★★★ ████████████████████ 68%     │     │
│ │   ★★★★★      │  │ ★★★★☆ ████████            21%     │     │
│ │  8,420 total │  │ ★★★☆☆ ██                   7%     │     │
│ └──────────────┘  │ ★★☆☆☆ █                    3%     │     │
│                   │ ★☆☆☆☆ ▌                    1%     │     │
│                   └────────────────────────────────────┘     │
│ ──────────────────────────────────────────────────────────   │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ [AU] J*** S.  ·  ★★★★★  ·  Apr 18, 2026               │   │
│ │ Charizard 1/8 Figure — PokéVault                       │   │
│ │ "Amazing condition. Seller packed it beautifully."     │   │
│ │ [👍 12 found helpful]   [Report]                       │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ [AU] A*** K.  ·  ★★★★☆  ·  Apr 12, 2026               │   │
│ │ PSA10 Pikachu Card — CardMaster                        │   │
│ │ "Great seller, 5 stars!"                               │   │
│ │ [👍 5 found helpful]   [Report]                        │   │
│ └────────────────────────────────────────────────────────┘   │
│ ← Prev  [1][2][3]…  Next →                                   │
└──────────────────────────────────────────────────────────────┘

NOTIFICATIONS — DETAILED (/user/notifications/all) [enriched from stub]
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Notifications (5 unread)  [Mark all read]  │
│                 │ [Tab: All ▾] (route-param tab selector)    │
│                 │ ──────────────────────────────────────────  │
│                 │ ┌────────────────────────────────────────┐ │
│                 │ │ ●  📦 Order #892 shipped               │ │
│                 │ │    Charizard 1/8 Figure                │ │
│                 │ │    [Track Order]              2m ago   │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ●  🔨 Auction ending soon              │ │
│                 │ │    PSA10 Pikachu — 2h 14m left         │ │
│                 │ │    [View Auction]             1h ago   │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ●  🏷 You've been outbid               │ │
│                 │ │    PSA10 Pikachu — Now ₹19,500         │ │
│                 │ │    [Bid Again]                3h ago   │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ○  🎟 Coupon: SAVE10 — expires Apr 30  │ │
│                 │ │    10% off your next order    2d ago   │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ○  🏪 PokéVault added 3 new listings   │ │
│                 │ │                               3d ago   │ │
│                 │ └────────────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────┘

WISHLIST — DETAILED (/user/wishlist) [enriched from stub]
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├─────────────────┬────────────────────────────────────────────┤
│ ACCOUNT NAV     │ Wishlist (8)   [Sort: Recently Added ▾]    │
│                 │ ──────────────────────────────────────────  │
│                 │ ┌────────────────────────────────────────┐ │
│                 │ │ ☐ [img] Charizard 1/8 Figure            │ │
│                 │ │        PokéVault · ₹4,990  ✅ In stock  │ │
│                 │ │        [Add to Cart]  [Remove ♡]        │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ☐ [img] PSA10 Pikachu Card              │ │
│                 │ │        CardMaster · ₹18,000 🔨 Auction  │ │
│                 │ │        ⏱ 2h 14m  [Place Bid] [Remove ♡] │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ☐ [img] Beyblade Burst Vol.2            │ │
│                 │ │        BeyStore · ₹890  ✅ In stock     │ │
│                 │ │        [Add to Cart]  [Remove ♡]        │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ ☐ [img] S6 Booster Pack (Pre-Order)     │ │
│                 │ │        LetItRip · ₹1,200  📅 Jun 30    │ │
│                 │ │        [Pre-Order]  [Remove ♡]          │ │
│                 │ ├────────────────────────────────────────┤ │
│                 │ │ [Bulk: Remove Selected]  [Share List]  │ │
│                 │ └────────────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────┘

BULK ACTIONS PATTERN (cross-cutting — all DataTable list views)
┌──────────────────────────────────────────────────────────────┐
│  STATE A — 0 rows selected (default, toolbar hidden)         │
│  ┌──┬──────────────────────────────────────────────────┐     │
│  │☐ │ Column headers…                                  │     │
│  ├──┼──────────────────────────────────────────────────┤     │
│  │☐ │ Row 1…                                           │     │
│  │☐ │ Row 2…                                           │     │
│  └──┴──────────────────────────────────────────────────┘     │
├──────────────────────────────────────────────────────────────┤
│  STATE B — ≥1 rows selected (bulk toolbar slides in)         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ ☑ 3 selected  [Bulk action ▾]            [✕ Clear]  │    │
│  │ Options by context:                                  │    │
│  │  Products / Blog → Publish | Unpublish | Delete      │    │
│  │  Orders         → Mark Shipped | Mark Delivered      │    │
│  │  Reviews        → Approve | Reject | Delete          │    │
│  │  Payouts        → Approve                            │    │
│  │  FAQs / Slides  → Delete | Reorder                   │    │
│  │  Wishlist       → Remove Selected | Share            │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──┬──────────────────────────────────────────────────┐     │
│  │☑ │ Row 1 (highlighted)                              │     │
│  │☑ │ Row 2 (highlighted)                              │     │
│  │☑ │ Row 3 (highlighted)                              │     │
│  │☐ │ Row 4                                            │     │
│  └──┴──────────────────────────────────────────────────┘     │
│  RULES:                                                      │
│  · Header ☐ checks/unchecks all visible rows                 │
│  · Bulk toolbar replaces static filter bar on mobile         │
│  · [✕ Clear] deselects all; toolbar disappears               │
│  · Delete always shows a confirmation dialog first           │
│  · Checkbox stopPropagation — never triggers row navigation  │
└──────────────────────────────────────────────────────────────┘
```

---

### Design Class: Promotions Page — Tabbed Listing Layout

`/promotions` should not remain a hero-plus-sections landing page. It should behave as a public listing surface using the same `ListingLayout` / `ListingViewShell` contract as products, with tab/category/sort/page encoded as route params and mobile filters rendered through `FilterDrawer`. Tabs are route-state, not local component state.

**Appkit components:** `ListingLayout` + `ListingViewShell` (outer shell) — `FilterDrawer` (mobile filters) — `Tabs` + `TabsList` + `TabsTrigger` (desktop tab strip) — `Select` (mobile tab dropdown) — route-param parser/serializer for tab + sort + pagination state — `usePendingFilters` (deferred apply model) — `CouponCard` / `PromotionCouponCard` (coupon grid) — `BaseListingCard` variants for promoted products/deals/featured inventory — `StatusBadge` (active/expiring) — `PriceDisplay` (INR rendering only) — `SearchInput` + `SortSelect` + `Pagination`

**Route-param tab contract (canonical):**
- Default: `/promotions/coupons`
- Deals tab: `/promotions/deals`
- Featured tab: `/promotions/featured`
- Filtered canonical example: `/promotions/deals/category/tcg-cards/sort/discount-desc/page/2`
- Tab clicks navigate route segments immediately.
- Filters, sort, and pagination are scoped to the active tab route.
- Returning to the page should restore the exact route-param state.
- Legacy query URLs (for example `?tab=...`) should 301 redirect to canonical slug routes.

```
PROMOTIONS — DESKTOP (UX OPTIMIZED) (/promotions/coupons)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ PROMOTIONS & DEALS                                           │
│ Discover exclusive offers, active coupons, and special drops │
├──────────────────────────────────────────────────────────────┤
│ [Coupons (6)] [Current Deals (24)] [Featured (18)]           │
├────────────────────┬─────────────────────────────────────────┤
│ FILTERS            │ [Sort: Expiring Soon ▾] [☰ List][🔲Grid]│
│ ─────────────────  │ Results: 6 · Best active codes first    │
│ Status             │ ┌──────────────┐ ┌──────────────┐       │
│ ☑ Active           │ │ POKEFEST15   │ │ FLAT500      │       │
│ ☐ Expiring Soon    │ │ 15% off      │ │ ₹500 off     │       │
│ ─────────────────  │ │ Min ₹999     │ │ Min ₹3,000   │       │
│ Discount Type      │ │ Valid till   │ │ Valid till   │       │
│ ☑ % Off            │ │ Apr 27       │ │ May 13       │       │
│ ☑ Flat Off         │ │ [Copy Code]  │ │ [Copy Code]  │       │
│ ☑ Free Shipping    │ └──────────────┘ └──────────────┘       │
│ ─────────────────  │ ┌──────────────┐ ┌──────────────┐       │
│ Min Order          │ │ PROF-OAKS15  │ │ FREESHIP     │       │
│ ₹[____]–₹[____]   │ │ 15% off      │ │ Free shipping │       │
│ ─────────────────  │ │ Min ₹2,000   │ │ No minimum   │       │
│ Category           │ │ [Copy Code]  │ │ [Copy Code]  │       │
│ ☑ TCG Cards        │ └──────────────┘ └──────────────┘       │
│ ☑ Figures          │ [Active ✕] [15%+ ✕] [Clear all]         │
│ ☐ Accessories      │ ← Prev [1][2] Next →                    │
│ [Apply Filters]    │                                          │
└────────────────────┴─────────────────────────────────────────┘

PROMOTIONS — DESKTOP (/promotions/deals)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ PROMOTIONS & DEALS                                           │
│ Discover exclusive offers, active coupons, and special drops │
├──────────────────────────────────────────────────────────────┤
│ [Coupons (6)] [Current Deals (24)] [Featured (18)]           │
├────────────────────┬─────────────────────────────────────────┤
│ FILTERS            │ [Sort: Discount % ▾] [🔲 Grid]          │
│ ─────────────────  │ Results: 24                             │
│ Listing Type       │ ┌────────┐ ┌────────┐ ┌────────┐        │
│ ☑ Product          │ │ [img]  │ │ [img]  │ │ [img]  │        │
│ ☑ Auction          │ │Chariz  │ │Pikachu │ │Booster │        │
│ ☑ Pre-Order        │ │PSA10   │ │Illust. │ │Box     │        │
│ ─────────────────  │ │₹12,000 │ │₹20,000 │ │₹18,000 │        │
│ Discount Range     │ │-15%    │ │-10%    │ │-12%    │        │
│ [10%▾ to 70%▾]    │ │[Deal]   │ │[Deal]   │ │[Deal]   │        │
│ ─────────────────  │ └────────┘ └────────┘ └────────┘        │
│ Category           │ ┌────────┐ ┌────────┐ ┌────────┐        │
│ ☑ TCG Cards        │ │ [img]  │ │ [img]  │ │ [img]  │        │
│ ☑ Figures          │ │Mewtwo  │ │PikaVMX │ │Umbreon │        │
│ ☐ Plush            │ │₹15,000 │ │₹34,990 │ │₹8,990  │        │
│ [Apply Filters]    │ │[Deal]   │ │[Deal]   │ │[Deal]   │        │
│                    │ └────────┘ └────────┘ └────────┘        │
│                    │ ← Prev [1][2][3]… Next →                │
└────────────────────┴─────────────────────────────────────────┘

PROMOTIONS — DESKTOP (/promotions/featured)
┌──────────────────────────────────────────────────────────────┐
│ TitleBar / Navbar                                            │
├──────────────────────────────────────────────────────────────┤
│ PROMOTIONS & DEALS                                           │
│ Discover exclusive offers, active coupons, and special drops │
├──────────────────────────────────────────────────────────────┤
│ [Coupons (6)] [Current Deals (24)] [Featured (18)]           │
├────────────────────┬─────────────────────────────────────────┤
│ FILTERS            │ [Sort: Featured Rank ▾]                 │
│ ─────────────────  │ Results: 18                             │
│ Store              │ ┌────────┐ ┌────────┐ ┌────────┐        │
│ ☑ PokéVault        │ │ [img]  │ │ [img]  │ │ [img]  │        │
│ ☑ CardMaster       │ │Ken Sugi│ │Mewtwo  │ │Pikachu │        │
│ ☐ BeyStore         │ │mori Art│ │PSA 9   │ │PSA 8   │        │
│ ─────────────────  │ │₹30,000 │ │₹15,000 │ │₹20,000 │        │
│ Price Range        │ │[Feature]││[Feature]││[Feature]│       │
│ ₹[____]–₹[____]   │ └────────┘ └────────┘ └────────┘        │
│ ─────────────────  │ ┌────────┐ ┌────────┐ ┌────────┐        │
│ Availability       │ │ [img]  │ │ [img]  │ │ [img]  │        │
│ ☑ In Stock         │ │Booster │ │Chariz  │ │Gardevoir│       │
│ ☑ Auction Live     │ │Box     │ │Holo    │ │1/7 Scale│       │
│ ☑ Pre-Order        │ │₹18,000 │ │₹25,000 │ │₹17,200  │       │
│ [Apply Filters]    │ └────────┘ └────────┘ └────────┘        │
│                    │ ← Prev [1][2][3]… Next →                │
└────────────────────┴─────────────────────────────────────────┘

PROMOTIONS — MOBILE (UX OPTIMIZED) (/promotions/deals)
┌─────────────────────────────────────┐
│ TitleBar / Navbar                   │
├─────────────────────────────────────┤
│ Promotions & Deals                  │
│ [Tab: Deals ▾]                      │
│ (dropdown selector; route-driven)   │
│ [🔽 Filters (2)] [Sort: Discount ▾] │
│ [TCG Cards ✕] [15%+ ✕] [Clear]      │
│ ──────────────────────────────────  │
│ ┌──────────┐ ┌──────────┐           │
│ │  [img]   │ │  [img]   │           │
│ │Charizard │ │Pikachu   │           │
│ │₹12,000   │ │₹20,000   │           │
│ │ -15%     │ │ -10%     │           │
│ └──────────┘ └──────────┘           │
│ ┌──────────┐ ┌──────────┐           │
│ │  [img]   │ │  [img]   │           │
│ │Booster   │ │Mewtwo    │           │
│ │₹18,000   │ │₹15,000   │           │
│ │ -12%     │ │ -8%      │           │
│ └──────────┘ └──────────┘           │
│ ← Prev [1][2][3] Next →             │
│ BOTTOM NAV [🏠][🛍][🔨][⊞][👤]      │
└─────────────────────────────────────┘

FILTER DRAWER — MOBILE (shared `FilterDrawer`)
┌─────────────────────────────────┐
│ Filters                     [✕] │
│ ──────────────────────────────  │
│ Tab: Deals                      │
│ Status                          │
│ ☑ Active   ☐ Expiring Soon      │
│ Listing Type                    │
│ ☑ Product  ☑ Auction  ☑ Pre-Ord │
│ Category                        │
│ ☑ TCG Cards  ☑ Figures          │
│ Price Range                     │
│ ₹[____]   to   ₹[____]          │
│ Discount Range                  │
│ [10%▾]   to   [70%▾]            │
│ ──────────────────────────────  │
│ [Reset]              [Apply]    │
└─────────────────────────────────┘
```

**Behavior rules:**
- Tabs are first-class navigation and must be deep-linkable.
- All tab changes must navigate by route param updates (`[tab]` segment), not query updates.
- Mobile tab navigation uses dropdown selector by default; desktop keeps tab strip.
- Desktop uses persistent left filters; mobile uses `FilterDrawer` only.
- `Coupons` tab uses coupon cards but still keeps the same listing toolbar and pagination rhythm.
- `Deals` and `Featured` tabs use shared card-system variants, not bespoke promotions cards.
- All money must render as INR; any `$` output is a formatter/config bug.
- Seller or reviewer names inside cards must use masked-readable output, never `enc:v1:` tokens.

---

### Phase 1: Implement shared appkit contracts (depends on Phase 0)

11. Phase 1: Implement shared appkit contracts (depends on 1-19 classification steps).
12. Extend listing primitives in ListingLayout, ListingViewShell, SlottedListingView, FilterPanel, and FilterDrawer with explicit class presets and control toggles.
13. Implement nav orchestration: mutual-exclusion guard is already bidirectional in AppLayoutShell (confirmed). Switch mobile overlay in role layouts from fixed left-side `<Aside>` drawer to `BottomSheet` from appkit. Add user name + role badge + X button to bottom sheet header. Desktop retains left-column sidebar layout unchanged.
14. Implement public sidebar redesign: convert BROWSE/SUPPORT/SETTINGS sections to collapsible accordions; add icon support per nav item; move Dark Mode toggle + Language selector from detached footer into an explicit collapsible SETTINGS section; change role badge from beside-name inline to on-avatar overlay badge. DASHBOARD section already renders automatically for admin/seller — no change needed.
15. Implement TitleBar redesign: style "Today's Deals" as pill/tag badge; add Compare icon slot; add ≡↔X swap when sidebar opens/closes (pass `sidebarOpen` state down to TitleBarLayout to conditionally render X vs ≡).
16. Implement Navbar icon rendering: enable icon display per nav item in NavbarLayout (icon prop already exists, just not rendered — appkit change only).
17. Implement Footer rewire in LayoutShellClient: replace 3-group config with 5-group config (SHOP, SUPPORT, FOR SELLERS, LEARN, LEGAL), enable trust bar (showTrustBar=true), wire newsletter subscribe slot, add social links to brand column, update copyright/tagline text. FooterLayout already has accordion support — letitrip config changes only unless new group slots are needed.
18. Wire all 18 homepage sections into MarketplaceHomepageView: add renderCategories (Shop by Category), renderFeaturedProducts, renderFeaturedAuctions, renderPreOrders, renderStores, renderEvents, renderCTABanner (Discover Amazing Deals), renderReviews, renderSecurityHighlights, renderFAQ, renderNewsletter, renderBlog. Fix stats counter values (10k+ Products, 2k+ Sellers, 50k+ Buyers, 4.8/5 Rating — currently wrong in appkit). Fix event card rendering (images + titles blank). Fix blog card rendering.
19. Fix homepage currency propagation: INR config from site.ts must reach all currency formatters in auction and product components so prices render as ₹ not $.
20. Standardize filter behavior: desktop persistent sidebar, mobile full-width drawer, deferred apply via usePendingFilters + route-param state parser/serializer.
21. Extend DetailViewShell and ProductDetailView for desktop rail + mobile bottom quick actions.
22. Establish shared card-spec variants and slots for product/auction/pre-order/blog/event/store/review/category cards.
23. Implement PII display policy: reviewer names and seller names showing raw enc:v1: tokens confirmed on live site. Fix decrypt-then-mask pipeline so all user-facing PII is masked-readable.
24. Preserve SSR-first boundaries for routes and keep interactive state in shared client shells.
25. Add shared ad-placement registry to appkit: typed slot IDs, provider abstraction (`manual`, `adsense`, `thirdParty`), placement eligibility rules, consent gate, reserved-height renderer, and fallback ordering.
26. Extend homepage, listing, promotions, blog, event, FAQ, reviews, and footer layouts with optional ad slots from the shared registry instead of hard-coded banners.

### Phase 2: Migrate admin surfaces (depends on Phase 1)

27. Phase 2: Migrate admin surfaces first (depends on Phase 1).
28. Migrate admin listings to full contract, and admin non-list screens to frame-only variants.
29. Add admin ad management surfaces: ad inventory, placement mapping, scheduling, provider credentials, consent/policy flags, and preview/publish flow.
30. Keep letitrip admin routes as thin wrappers with no duplicated UI logic.

### Phase 3: Migrate public surfaces

31. Phase 3: Migrate public surfaces.
32. Consolidate local routing wrappers into appkit-owned contract wiring.
33. Apply full listing contract to products, auctions, pre-orders, stores, sellers, categories, events, blog, reviews, search, and promotions where listing semantics apply.
34. Apply Listing-Extension pattern to category/store detail surfaces with fixed parent context and tabbed child listings.
35. Apply Detail-Commerce pattern to product detail pages.
36. Execute card-system rollout, including pre-order parity with product/auction cards and alignment for blog/event/store/review/category cards.
37. Apply PII masking rules across all public/admin/seller/user views that display personal data.
38. Roll out ad placements selectively across public surfaces using the registry: homepage first, then promotions/search/listing feeds, then content rails.

### Phase 3 Implementation Checkpoint (2026-04-23)

- Implemented with real repository-backed RSC views (no hardcoded listing/detail payloads):
  - Public listings: products, auctions, pre-orders, stores, categories, reviews.
  - Listing-extension surfaces: category detail and store detail tabs.
  - Detail-commerce surfaces: product detail, auction detail, pre-order detail.

STORE DETAIL TABS — DESKTOP (implemented)

+--------------------------------------------------------------------------------------+
| Store Header (name, rating, metadata)                                                |
| [Products] [Auctions] [Reviews] [About]                                              |
+--------------------------------------------------------------------------------------+
| Active Tab Content                                                                    |
|                                                                                      |
|  Products: Card grid (sellerId/store owner filtered)                                 |
|  Auctions: Auction card grid (isAuction=true filtered)                               |
|  Reviews: Approved review cards (store seller filtered)                              |
|  About: Store profile/about content                                                   |
+--------------------------------------------------------------------------------------+

CATEGORY DETAIL — DESKTOP (implemented)

+--------------------------------------------------------------------------------------+
| Breadcrumb: Home / Categories / {Category}                                           |
| Category title + description                                                          |
+--------------------------------------------------------------------------------------+
| Product Card Grid (status=published + categorySlug={slug})                           |
| [card] [card] [card] [card]                                                          |
| [card] [card] [card] [card]                                                          |
+--------------------------------------------------------------------------------------+

DETAIL-COMMERCE — DESKTOP (implemented for product/auction/pre-order)

+--------------------------------------+-----------------------------------------------+
| Gallery / media                       | Summary + pricing + actions                   |
| (real image fallback handling)        | (real payload, no mock placeholders)          |
|                                       |                                               |
|                                       | Primary CTA                                   |
|                                       | Secondary CTA / bid / reserve                 |
+--------------------------------------+-----------------------------------------------+

### Phase 4: Migrate seller surfaces

39. Phase 4: Migrate seller surfaces.
40. Upgrade seller listings to full contract and move non-list seller pages to frame-only variants.

### Phase 5: Cleanup and consolidation

41. Phase 5: Cleanup and consolidation.
42. Remove duplicated wrappers/shims, align imports to canonical appkit paths, and update migration trackers.
43. Verification gate after each batch and before rollout.
44. Validate builds, typechecks, smoke tests, responsive behavior, accessibility, URL state behavior, card-spec parity, PII display masking outcomes, homepage 18 sections completeness, INR currency, sidebar mutual-exclusion behavior, ad-slot CLS safety, consent gating, provider fallback behavior, and sponsored-label visibility.

---

## State Matrix — Major Page Families

### Homepage

| State | Required UX behavior |
| --- | --- |
| Default | Hero value proposition first, trust strip visible, category jump section above the fold, one clear primary CTA, ads reserved but never dominant. |
| Loading | Hero skeleton + section skeletons with preserved heights to avoid layout shift. |
| Empty | Replace empty merch rails with editorial recommendation blocks, category shortcuts, and newsletter CTA. |
| Error | Show partial homepage with inline retry for failed sections; never collapse the whole page for one failed feed. |
| Success | Show social proof, recently loaded sections, and continue-browsing prompts without moving the hero CTA. |

### Listing Pages

| State | Required UX behavior |
| --- | --- |
| Default | Result count, active chips, sort, filter trigger, and one clear browse mode visible immediately. |
| Loading | Preserve toolbar and chip row; show card skeleton grid with sticky filter rail intact. |
| Empty | Explain why zero results happened, surface `Clear all`, and suggest 3 nearby categories/searches. |
| Error | Inline error inside results region with retry; filters and search remain editable. |
| Success | Confirm bulk actions, save-search, or compare actions with non-blocking toast/banner only. |

### Listing-Extension Pages

| State | Required UX behavior |
| --- | --- |
| Default | Fixed parent context remains stable while child results update independently; on mobile, child tab selection is a dropdown. |
| Loading | Parent hero stays loaded; only child tabs/list region skeletonizes. |
| Empty | Preserve parent hero and tab control (tab strip desktop, dropdown mobile); empty state offers sibling tabs or related child categories. |
| Error | Parent context remains usable; retry applies only to child listing region. |
| Success | Follow/share confirmations stay lightweight and never displace parent context. |

### Detail-Commerce Pages

| State | Required UX behavior |
| --- | --- |
| Default | Price, stock, delivery promise, and primary CTA must be visible without hunting. |
| Loading | Gallery/info/action rail skeletons retain final geometry, especially sticky action region. |
| Empty | If detail payload is unavailable, redirect to unavailable-product pattern with related alternatives. |
| Error | Keep breadcrumb and recovery CTA (`Back to results`, `Retry`) visible; do not strand user. |
| Success | Cart/add/wishlist/offer actions acknowledge inline or via toast without covering action rail. |

### Promotions and Search

| State | Required UX behavior |
| --- | --- |
| Default | Route-segment tab control visible (tab strip desktop, dropdown mobile), counts visible, filters scoped to current tab only. |
| Loading | Keep tabs and toolbar interactive; only result cards skeletonize. |
| Empty | Explain no active promotions/search matches, suggest adjacent tabs or chip reset. |
| Error | Retry in results panel; tab navigation still works. |
| Success | Coupon copied / deal saved uses compact confirmation and preserves browsing position. |

### Checkout

| State | Required UX behavior |
| --- | --- |
| Default | Stepper, order summary, and primary next action visible at all times. |
| Loading | Keep stepper and summary shell stable; block duplicate submits with progress state. |
| Empty | Missing address/payment state must turn into guided setup, not blank panels. |
| Error | Inline payment/address errors at field and section level with preserved user input. |
| Success | Confirmation step summarizes order, delivery expectation, and next-account actions. |

### User Account Pages

| State | Required UX behavior |
| --- | --- |
| Default | Summary metrics first, recent activity second, management actions tertiary. |
| Loading | Metrics cards and list rows skeletonize separately so shell stays stable. |
| Empty | Suggest first useful action such as browse, wishlist, or complete profile. |
| Error | Section-scoped retry; account nav remains intact. |
| Success | Saved profile/preferences actions confirm inline and collapse quickly. |

### Admin and Seller List Pages

| State | Required UX behavior |
| --- | --- |
| Default | Inventory count, search, filter, selection, and `+ New` visible at the top. |
| Loading | Table/card rows skeletonize while action bar and filters stay present. |
| Empty | Provide `Create first item`, import option, and help link rather than dead blank state. |
| Error | Show row-region retry plus audit-safe message; keep filters and nav alive. |
| Success | Bulk or publish actions confirm in toast/banner and allow immediate next action. |

### Sidepanel Forms

| State | Required UX behavior |
| --- | --- |
| Default | Title, status, close, primary save, and unsaved-state indicator visible immediately. |
| Loading | Skeleton form blocks but preserve footer actions and panel width. |
| Empty | Missing seed data (categories/tags/etc.) becomes guided chooser or dependency notice. |
| Error | Validation errors pin to fields and summary region; draft state is preserved. |
| Success | Save closes when safe or shows `Saved` with optional `View live` / `Continue editing`. |

### Content Pages (blog, FAQ, event, reviews)

| State | Required UX behavior |
| --- | --- |
| Default | Heading context first, metadata second, related/next content after core reading path. |
| Loading | Hero/media skeleton plus text blocks at realistic lengths. |
| Empty | Explain lack of content and offer nearby categories/tags. |
| Error | Inline message plus route-safe recovery (`Back`, `Retry`, `Browse more`). |
| Success | Helpful actions such as share, bookmark, or explore related appear after reading intent. |

---

## Action Priority Map — Major Page Families

### Homepage

| Action Tier | Actions |
| --- | --- |
| Primary | Browse products, jump to category, explore featured deals. |
| Secondary | Search, view stores/events/blog, newsletter subscribe. |
| Hidden on mobile | Low-priority secondary promos, tertiary footer navigation duplication. |

### Listing Pages

| Action Tier | Actions |
| --- | --- |
| Primary | Search, filter, sort, open card, add to cart/select item. |
| Secondary | Save search, compare, switch layout, pagination. |
| Hidden on mobile | Bulk controls until selection exists, dense desktop-only utility actions. |

### Listing-Extension Pages

| Action Tier | Actions |
| --- | --- |
| Primary | Switch child tab, filter child results, open child item. |
| Secondary | Follow parent, share parent, sort child list. |
| Hidden on mobile | Non-critical parent utilities and multi-column hero actions. |

### Detail-Commerce Pages

| Action Tier | Actions |
| --- | --- |
| Primary | Buy now, add to cart, choose variation if required. |
| Secondary | Wishlist, share, make offer, expand specs/reviews. |
| Hidden on mobile | Tertiary merchandising links and long-form supplemental content shortcuts. |

### Promotions and Search

| Action Tier | Actions |
| --- | --- |
| Primary | Change tab, apply filters, copy coupon/open deal. |
| Secondary | Sort, save, share, paginate. |
| Hidden on mobile | Desktop-side explanatory copy and low-value auxiliary chips. |

### Checkout

| Action Tier | Actions |
| --- | --- |
| Primary | Continue to next step, confirm payment, place order. |
| Secondary | Edit address, apply coupon, contact support. |
| Hidden on mobile | Expanded order-detail breakdown rows that can live in accordion. |

### User Account Pages

| Action Tier | Actions |
| --- | --- |
| Primary | View orders/listings, edit profile, review alerts. |
| Secondary | Wishlist, saved searches, address/payment management. |
| Hidden on mobile | Rare settings links and verbose stats explanations. |

### Admin and Seller List Pages

| Action Tier | Actions |
| --- | --- |
| Primary | Search inventory, create new item, edit selected item, publish/unpublish. |
| Secondary | Filter, sort, bulk select, export/import. |
| Hidden on mobile | Audit columns, advanced bulk tools, low-frequency maintenance actions. |

### Sidepanel Forms

| Action Tier | Actions |
| --- | --- |
| Primary | Save, save draft, close safely. |
| Secondary | Preview, duplicate, delete/archive when applicable. |
| Hidden on mobile | Secondary metadata sidebars and advanced settings by default. |

### Content Pages

| Action Tier | Actions |
| --- | --- |
| Primary | Read core content, expand FAQ item, view event/review details. |
| Secondary | Share, bookmark, navigate to related content. |
| Hidden on mobile | Sidebar-style related rails and non-essential metadata clusters. |

---

## Mock Wiring Coverage — All 110 Pages

This section wires all current 110 locale routes into reusable mock packs so coverage is complete without duplicating 110 separate ASCII blocks.

### Mock Packs (diagram + theme + state + SSR)

**Pack A — Homepage / Marketing Hub**
- Desktop diagram source: Homepage ASCII (all sections)
- Mobile diagram source: Homepage mobile collapse rules + carousel snap behavior
- Theme: expressive public look (green-primary, neutral shells, restrained cobalt links)
- State profile: Homepage state matrix
- SSR route contract: `/[locale]`

**Pack B — Listing Pages**
- Desktop diagram source: Design Class: Listing Page Layout
- Mobile diagram source: Listing mobile + FilterDrawer diagram
- Theme: utility-first listing surface, sponsored-label-safe cards
- State profile: Listing Pages state matrix
- SSR route contract: route params for listing scope, sort, page; tabs via `[tab]` when tabbed

**Pack C — Listing-Extension (Store/Category Tabs)**
- Desktop diagram source: Design Class: Listing-Extension Page Layout
- Mobile diagram source: mobile tab dropdown + child listing controls
- Theme: fixed parent context + child inventory contrast
- State profile: Listing-Extension state matrix
- SSR route contract: `/[locale]/stores/[storeSlug]/[tab]/...` and `/[locale]/categories/[slug]/[tab]/...`

**Pack D — Detail-Commerce**
- Desktop diagram source: Design Class: Detail-Commerce Page Layout
- Mobile diagram source: sticky bottom action bar detail mock
- Theme: high-trust commerce emphasis, strong price/stock visibility
- State profile: Detail-Commerce state matrix
- SSR route contract: detail slug/id param routes

**Pack E — Content Detail / Editorial**
- Desktop diagram source: Public Info Pages (blog/event/reviews content blocks)
- Mobile diagram source: collapsible side metadata sections (non-homepage)
- Theme: editorial readability, reduced chrome
- State profile: Content Pages state matrix
- SSR route contract: `/[locale]/blog/[slug]`, `/[locale]/events/[id]`, similar detail params

**Pack F — FAQ (Dedicated Page, Tabbed)**
- Desktop diagram source: FAQ page desktop + expanded answer
- Mobile diagram source: FAQ mobile with tab dropdown
- Theme: content-first with support CTA
- State profile: Content Pages state matrix
- SSR route contract: `/[locale]/faqs/[tab]` (homepage FAQ remains local-state exception)

**Pack G — Promotions (Tabbed Listing)**
- Desktop diagram source: Promotions tabbed listing desktop mocks
- Mobile diagram source: Promotions mobile tab dropdown + FilterDrawer
- Theme: listing shell with offer badges and sponsored-safe rails
- State profile: Promotions and Search state matrix
- SSR route contract: `/[locale]/promotions/[tab]/...`

**Pack H — Checkout / Cart / Post-Purchase**
- Desktop diagram source: Checkout step mock + order summary
- Mobile diagram source: sticky action + compact step flow
- Theme: low-noise trust-oriented flow
- State profile: Checkout state matrix
- SSR route contract: `/[locale]/cart`, `/[locale]/checkout`, `/[locale]/checkout/success`, tracking pages

**Pack I — Account (User)**
- Desktop diagram source: user profile/notifications/wishlist/account hub mocks
- Mobile diagram source: account nav drawer + collapsible secondary modules
- Theme: operational clarity and activity-first hierarchy
- State profile: User Account Pages state matrix
- SSR route contract: `/[locale]/user/...` and public profile tab routes

**Pack J — Seller Console**
- Desktop diagram source: seller listings + sidepanel form patterns
- Mobile diagram source: seller nav bottom-sheet + compact list/detail cards
- Theme: dashboard operational mode
- State profile: Admin and Seller List Pages + Sidepanel Forms matrices
- SSR route contract: `/[locale]/seller/...`

**Pack K — Admin Console**
- Desktop diagram source: admin list/CRUD + bulk actions + sidepanels
- Mobile diagram source: admin compact list mode with guarded bulk actions
- Theme: audit-safe operational UI
- State profile: Admin and Seller List Pages + Sidepanel Forms matrices
- SSR route contract: `/[locale]/admin/...`

**Pack L — Auth / Access / Utility**
- Desktop diagram source: auth and utility simple frame patterns
- Mobile diagram source: edge-to-edge auth panel with compact messaging
- Theme: minimal distraction, high-contrast forms
- State profile: use Content/User matrix depending on view intent
- SSR route contract: `/[locale]/auth/...`, `/[locale]/unauthorized`, helper/demo routes

### 110-Page Coverage Manifest (grouped)

Coverage rule: every route below maps to one mock pack above and therefore inherits desktop/mobile diagram behavior, theme contract, state matrix, and SSR route-param rules.

| Route group | Count | Pack | SSR params / tab behavior |
| --- | ---: | --- | --- |
| `/[locale]` | 1 | A | locale |
| `/[locale]/about`, `/contact`, `/help`, `/fees`, `/security` | 5 | E | locale |
| `/[locale]/cookies`, `/privacy`, `/terms`, `/refund-policy`, `/shipping-policy` | 5 | E | locale |
| `/[locale]/how-auctions-work`, `/how-checkout-works`, `/how-offers-work`, `/how-orders-work`, `/how-payouts-work`, `/how-pre-orders-work`, `/how-reviews-work` | 7 | E | locale |
| `/[locale]/products`, `/auctions`, `/pre-orders`, `/stores`, `/sellers`, `/reviews` | 6 | B | locale + sort/page route params |
| `/[locale]/search` | 1 | B | locale + search slug + `[tab]` + sort/page |
| `/[locale]/categories` | 1 | B | locale + sort/page |
| `/[locale]/stores/[storeSlug]`, `/stores/[storeSlug]/products`, `/stores/[storeSlug]/auctions`, `/stores/[storeSlug]/reviews`, `/stores/[storeSlug]/about` | 5 | C | locale + storeSlug + `[tab]` (about is content tab) |
| `/[locale]/categories/[slug]` | 1 | C | locale + slug + `[tab]` |
| `/[locale]/products/[slug]`, `/auctions/[id]`, `/pre-orders/[id]`, `/sellers/[id]` | 4 | D | locale + slug/id |
| `/[locale]/events`, `/events/[id]`, `/events/[id]/participate` | 3 | E | locale + id |
| `/[locale]/blog`, `/blog/[slug]` | 2 | E | locale + slug |
| `/[locale]/faqs`, `/faqs/[category]` | 2 | F | locale + `[tab]` route param |
| `/[locale]/promotions` | 1 | G | locale + `[tab]` route param |
| `/[locale]/cart`, `/checkout`, `/checkout/success`, `/track` | 4 | H | locale + optional order params |
| `/[locale]/profile/[userId]` | 1 | I | locale + userId + `[tab]` |
| `/[locale]/user`, `/user/profile`, `/user/settings`, `/user/messages`, `/user/notifications`, `/user/offers`, `/user/wishlist`, `/user/become-seller` | 8 | I | locale + `[tab]` where tabbed |
| `/[locale]/user/orders`, `/user/orders/view/[id]`, `/user/orders/[id]/track` | 3 | I | locale + id |
| `/[locale]/user/addresses`, `/user/addresses/add`, `/user/addresses/edit/[id]` | 3 | I | locale + id |
| `/[locale]/seller`, `/seller/analytics`, `/seller/orders`, `/seller/products`, `/seller/auctions`, `/seller/offers`, `/seller/store`, `/seller/shipping`, `/seller/addresses`, `/seller/coupons`, `/seller/coupons/new`, `/seller/payouts`, `/seller/payout-settings`, `/seller-guide` | 14 | J | locale + resource params |
| `/[locale]/seller/products/new`, `/seller/products/[id]/edit` | 2 | J | locale + id |
| `/[locale]/admin/dashboard`, `/admin/analytics`, `/admin/site`, `/admin/navigation`, `/admin/media`, `/admin/feature-flags`, `/admin/copilot`, `/admin/stores`, `/admin/events`, `/admin/payouts` | 10 | K | locale + admin resource params |
| `/[locale]/admin/events/[id]/entries` | 1 | K | locale + id |
| `/[locale]/admin/products/[[...action]]`, `/admin/orders/[[...action]]`, `/admin/users/[[...action]]`, `/admin/reviews/[[...action]]`, `/admin/blog/[[...action]]`, `/admin/categories/[[...action]]`, `/admin/coupons/[[...action]]`, `/admin/faqs/[[...action]]`, `/admin/sections/[[...action]]`, `/admin/carousel/[[...action]]`, `/admin/bids/[[...action]]` | 11 | K | locale + catch-all action param |
| `/[locale]/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/oauth-loading`, `/auth/close` | 7 | L | locale |
| `/[locale]/unauthorized`, `/demo/seed` | 2 | L | locale |

Total covered routes: 110

### Coverage Acceptance Criteria for All 110

1. Every route in this manifest must resolve to one mock pack and therefore one desktop+mobile diagram behavior.
2. Every tabbed route in this manifest must use route params (`[tab]`) except homepage FAQ section interactions (local state exception).
3. Every pack must inherit the same theme contract and the same default/loading/empty/error/success matrix behavior from this document.
4. Any new route added later must be added to this manifest before implementation to keep coverage complete.

---

## Relevant Files

- d:/proj/letitrip.in/appkit/src/ui/components/ListingLayout.tsx — primary shared layout orchestration for toolbar/filter/content regions.
- d:/proj/letitrip.in/appkit/src/features/layout/ListingLayout.tsx — feature-layer listing layout variant; reconcile with ui-layer ownership and avoid duplication.
- d:/proj/letitrip.in/appkit/src/features/layout/BottomSheet.tsx — already exists; must be adopted for mobile dashboard nav overlay in all role layouts (replaces left-side Aside).
- d:/proj/letitrip.in/appkit/src/features/admin/components/AdminSidebar.tsx — switch mobile overlay from fixed `inset-y-0 left-0` Aside to BottomSheet.
- d:/proj/letitrip.in/appkit/src/features/account/components/UserSidebar.tsx — same mobile overlay migration.
- d:/proj/letitrip.in/appkit/src/features/seller/components/SellerSidebar.tsx — same mobile overlay migration.
- d:/proj/letitrip.in/appkit/src/features/layout/TitleBar.tsx — dashboard-nav toggle entry path where pre-toggle close logic is injected.
- d:/proj/letitrip.in/appkit/src/features/layout/AppLayoutShell.tsx — public sidebar state owner; owns sidebar header and section rendering; needs: role badge moved to on-avatar overlay, SETTINGS promoted to explicit collapsible section, Dark Mode + Language moved out of footer into SETTINGS section.
- d:/proj/letitrip.in/appkit/src/features/layout/SidebarLayout.tsx — public sidebar right-side slide-in shell; needs collapsible accordion section support and icon-per-item support for nav links.
- d:/proj/letitrip.in/src/app/[locale]/page.tsx — thin homepage consumer; renders MarketplaceHomepageView; needs all 18 section render-props wired.
- d:/proj/letitrip.in/appkit/src/features/homepage/components/MarketplaceHomepageView.tsx — slot-based homepage orchestrator; currently wires only 7/18 sections; needs 11 more render-prop slots wired.
- d:/proj/letitrip.in/appkit/src/features/homepage/components/StatsCounterSection.tsx — stat values hardcoded wrong; must be configurable props (10k+ Products, 2k+ Sellers, 50k+ Buyers, 4.8/5 Rating).
- d:/proj/letitrip.in/appkit/src/features/homepage/components/AdvertisementBanner.tsx — shared ad/manual campaign shell; should become the canonical slot renderer for homepage and content placements.
- d:/proj/letitrip.in/appkit/src/features/promotions/components/PromotionsView.tsx — current stacked promotions implementation; must be refactored to tabbed `ListingLayout` with tab-scoped ad slots.
- d:/proj/letitrip.in/appkit/src/ui/components/Select.tsx — mobile tab selector control for promotions/search/listing-extension pages.
- d:/proj/letitrip.in/appkit/src/ui/components/FilterDrawer.tsx — mobile filters for promotions/search/listing pages; reused for ad inventory admin filtering where appropriate.
- d:/proj/letitrip.in/src/app/[locale]/promotions/page.tsx — current thin consumer route; migrate to slug route entry (`src/app/[locale]/promotions/[tab]/[[...segments]]/page.tsx`) and keep legacy query URLs as redirects to canonical slug routes.
- d:/proj/letitrip.in/appkit/src/features/homepage/components/HeroCarousel.tsx — hero carousel (already wired, no change needed).
- d:/proj/letitrip.in/appkit/src/features/homepage/components/ — directory containing all 26 homepage section components; FeaturedProducts, FeaturedAuctions, FeaturedPreOrders, TopCategories, FeaturedStores, EventsSection, FAQSection, NewsletterSection, SecurityHighlightsSection, CustomerReviews, BlogArticles, CTABannerSection to be wired.
- d:/proj/letitrip.in/appkit/src/features/layout/TitleBarLayout.tsx — needs: "Today's Deals" pill/badge styling, Compare icon slot, ≡↔X swap when sidebarOpen state is true.
- d:/proj/letitrip.in/appkit/src/features/layout/MainNavbar.tsx — needs icon rendering enabled in NavbarLayout (icon prop already passed, rendering missing in NavbarLayout).
- d:/proj/letitrip.in/appkit/src/features/layout/FooterLayout.tsx — already has mobile accordion + columns layout; verify social links and newsletter subscribe slots are available as props.
- d:/proj/letitrip.in/appkit/src/features/layout/DashboardNavContext.tsx — dashboard sidebar open/close/toggle contract used across role layouts.
- d:/proj/letitrip.in/appkit/src/features/layout/BottomNavbar.tsx — bottom nav (Home/Products/Search/Cart/Role Avatar); role avatar navigates to profileHref — correct behavior confirmed, no change needed.
- d:/proj/letitrip.in/src/app/[locale]/LayoutShellClient.tsx — needs: add icon metadata to sidebar section items; remove sidebarLocaleSlot and showThemeToggleInSidebar once those move into appkit SETTINGS section; rewire footer config to 5 groups (SHOP/SUPPORT/FOR SELLERS/LEARN/LEGAL) + trust bar enabled + newsletter slot + social links.
- d:/proj/letitrip.in/src/app/[locale]/admin/layout.tsx — dashboard nav registration path (same contract pattern applies to seller/user layouts).
- d:/proj/letitrip.in/appkit/src/ui/components/ListingViewShell.tsx — dashboard/list shell with overlays and detail-mode switch.
- d:/proj/letitrip.in/appkit/src/ui/components/SlottedListingView.tsx — slot-based listing shell used across public/seller/admin.
- d:/proj/letitrip.in/appkit/src/features/filters/FilterPanel.tsx — canonical filter content rendering.
- d:/proj/letitrip.in/appkit/src/ui/components/FilterDrawer.tsx — mobile/full-width drawer behavior and apply/reset footer.
- d:/proj/letitrip.in/appkit/src/ui/components/DetailViewShell.tsx — detail layout shell to host desktop action rail and mobile bottom actions.
- d:/proj/letitrip.in/appkit/src/features/products/components/ProductDetailView.tsx — product detail composition over DetailViewShell.
- d:/proj/letitrip.in/appkit/src/features/products/components/InteractiveProductCard.tsx — reference card behavior for product parity.
- d:/proj/letitrip.in/appkit/src/features/auctions/components/MarketplaceAuctionCard.tsx — reference auction card overlays/actions/media behavior.
- d:/proj/letitrip.in/appkit/src/features/pre-orders/components/MarketplacePreorderCard.tsx — pre-order card target for parity with product/auction.
- d:/proj/letitrip.in/appkit/src/features/pre-orders/components/PreOrdersListView.tsx — pre-order listing integration point.
- d:/proj/letitrip.in/appkit/src/features/events/components/EventCard.tsx — card-system alignment target.
- d:/proj/letitrip.in/appkit/src/features/stores/components/InteractiveStoreCard.tsx — card-system alignment target.
- d:/proj/letitrip.in/appkit/src/security/pii-redact.ts — masking behavior baseline for readable redaction outputs.
- d:/proj/letitrip.in/appkit/src/security/pii-encrypt.ts — storage encryption boundary (must not leak to UI).
- d:/proj/letitrip.in/appkit/src/react/hooks/useUrlTable.ts — URL state source of truth.
- d:/proj/letitrip.in/appkit/src/react/hooks/usePendingFilters.ts — deferred filter apply model.
- d:/proj/letitrip.in/src/app/[locale]/admin/**/page.tsx — thin route wiring for admin rollout.
- d:/proj/letitrip.in/src/app/[locale]/seller/**/page.tsx — thin route wiring for seller rollout.
- d:/proj/letitrip.in/src/app/[locale]/categories/page.tsx — public categories wiring.
- d:/proj/letitrip.in/src/app/[locale]/categories/[slug]/page.tsx — public category detail (fixed parent context) route.
- d:/proj/letitrip.in/src/app/[locale]/stores/page.tsx — public stores wiring.
- d:/proj/letitrip.in/src/app/[locale]/stores/[storeSlug]/page.tsx — public store detail root (fixed parent context).
- d:/proj/letitrip.in/src/app/[locale]/stores/[storeSlug]/products/page.tsx — store products listing-extension route.
- d:/proj/letitrip.in/src/app/[locale]/stores/[storeSlug]/auctions/page.tsx — store auctions listing-extension route.
- d:/proj/letitrip.in/src/app/[locale]/stores/[storeSlug]/reviews/page.tsx — store reviews listing-extension route.
- d:/proj/letitrip.in/src/app/[locale]/products/page.tsx — public products wiring.
- d:/proj/letitrip.in/src/app/[locale]/products/[slug]/page.tsx — public product detail route for Detail-Commerce rollout.
- d:/proj/letitrip.in/src/components/routing/CategoriesRouteClient.tsx — local wrapper to consolidate.
- d:/proj/letitrip.in/src/components/routing/CategoryProductsRouteClient.tsx — local wrapper to consolidate.
- d:/proj/letitrip.in/src/components/routing/StoreProductsRouteClient.tsx — local wrapper to consolidate.
- d:/proj/letitrip.in/src/components/routing/ReviewsRouteClient.tsx — local wrapper to consolidate.
- d:/proj/letitrip.in/MIGRATION.md — update phase/task status after each meaningful batch.
- d:/proj/letitrip.in/Gap.md — verify no new architectural regressions and track blockers.

---

## Verification

1. Build appkit after each shared primitive change: cd appkit && npm run build.
2. Build letitrip after each route/feature wiring batch: cd . && npm run build.
3. Run workspace typecheck after each large batch: tsc --noEmit (appkit and letitrip).
4. Run smoke suite for changed routes/APIs: npm run test:smoke, or npm run test:smoke:existing when dev server is already active.
5. Manual responsive QA on representative pages per class:
6. Listing page sample (admin products, public categories, public category [slug], public store [storeSlug]/products, seller orders): verify full control set and interactions.
7. Listing-extension sample checks: fixed parent context remains locked while list filters/sorts/search/pagination update child inventory only.
8. Detail-Commerce sample checks: desktop sticky action rail and mobile sticky bottom action bar expose buy/add-to-cart/wishlist safely without overlap or focus issues.
9. Card-system sample checks: pre-order cards match product/auction interaction and visual structure (featured marker, checkbox, wishlist, CTA row, media behavior) and other card families map to approved card slots.
10. PII-display checks: UI shows masked readable values (for example A*h) and never shows encrypted-token payloads (for example pii:v1:...).
11. Non-list sample (admin dashboard, seller analytics, public non-inventory content page): verify shared frame and hidden irrelevant controls.
12. Validate canonical route-param persistence and deferred apply behavior for filters, including redirects from legacy query URLs.
13. Validate accessibility keyboard flow for drawer, toolbar, and mobile bottom action bar controls.
14. Validate happy path + loading + empty + error + success states for at least one page in each family (listing, detail, dashboard, form, content).
15. Validate mobile recovery UX: clear filters, undo/remove actions, inline validation, sticky action visibility, and destructive confirmation copy.

---

## Decisions

- Included surfaces for this initiative: Public + Admin + Seller.
- Rollout strategy: phased (Admin + Public core first, then Seller completion).
- Non-list pages are included visually, but irrelevant controls are hidden.
- Full control set is mandatory for pages classified as Listing.
- Public category and store detail pages are treated as Listing-Extension class (fixed parent context + child listing controls).
- Canonical navigation state is slug and route-param first; query-param URLs are non-canonical and must redirect when an equivalent slug route exists.
- Public product detail pages are treated as Detail-Commerce class (desktop action rail + mobile sticky bottom quick actions).
- Pre-order cards must follow product/auction card design parity under the shared card-system contract.
- PII is displayed as masked readable text, never as encrypted/cipher payloads.
- Best-experience defaults override structural completeness: a simpler default state with better recovery and clearer action hierarchy is preferred over exposing every possible control at once.
- Dashboard sidebar (role navigation) and public sidebar are independent but mutually exclusive on open events; closing either does not auto-open the other. The mutual-exclusion guard is already bidirectionally implemented in AppLayoutShell — no new guard logic needed.
- Dashboard nav mobile overlay changes from fixed left-side Aside drawer to BottomSheet in all three role sidebars (admin, seller, user). Desktop sidebar layout is unchanged. BottomSheet header shows: user display name, role badge, X close button.
- Ownership model remains appkit-first; letitrip stays thin route/config consumer.

---

## Further Considerations

1. Choose the single source of truth between the two ListingLayout implementations before coding starts to prevent parallel architecture drift.
2. Define a strict "page class checklist" in MIGRATION.md so each migrated page can be signed off consistently.
3. Decide whether bulk actions on some public listing pages should be view-only disabled in MVP if no safe backend action exists yet.

---

## Post-Audit Implementation Status (2026-04-25)

> This section was added after passes 1–16 of the implementation audit.
> It records actual current state against this plan's design spec.
> Authoritative detail is in `INSTRUCTIONS.md` (gap analysis, 21 sections) and
> `new-tracker.md` (task tracker, Phases 7–33).
> Do not modify the design spec above — this section is the delta layer only.

---

### Phase Completion Summary

| Phase | Name | Plan State | Audit Finding |
|-------|------|-----------|---------------|
| 0 | Scope freeze + page classification | ✅ Complete | All 110 routes confirmed present |
| 1 | Shared appkit contracts | ✅ Complete | Contracts implemented; see regressions below |
| 2 | Admin surfaces | ⚠️ Partial | List views self-fetch and work; `AdminEventsView` missing entirely; analytics/site slots empty |
| 3 | Public surfaces | ⚠️ Partial | Routes exist; listing toolbar not wired; detail pages use bare views without slot props |
| 4 | Seller surfaces | ⚠️ Partial | Tables work; dashboard and analytics slots empty |
| 5 | Cleanup + consolidation | ⏳ Not started | Blocked by Phase 3/4 completion |

---

### Regression Map — Plan Spec vs Actual State

The Phase 3 checkpoint (line 3524) declared these as implemented. Audit found the
following regressions against the plan's design spec:

#### 1. Listing Pages — toolbar contract not fulfilled

Plan specifies: result count, active chips, sort, filter trigger, browse mode visible immediately.
Actual: bare heading + card grid only. No search, no sort, no filter drawer, no pagination.

| Page | Plan Class | Plan Toolbar Required | Actual |
|------|------------|----------------------|--------|
| `/products` | Listing | Full control set | ❌ Bare grid |
| `/auctions` | Listing | Full control set | ❌ Bare grid |
| `/pre-orders` | Listing | Full control set | ❌ Bare grid |
| `/stores` | Listing | Full control set | ❌ Bare grid |
| `/categories/[slug]` | Listing-Extension | Filter/sort/pagination | ❌ Static grid |
| `/stores/[slug]/products` | Listing-Extension | Filter/sort/pagination | ❌ Static grid |
| `/stores/[slug]/auctions` | Listing-Extension | Filter/sort/pagination | ❌ Static grid |
| `/stores/[slug]/reviews` | Listing-Extension | Pagination + rating filter | ❌ Static list |

Root cause: `AuctionsListView`, `ProductsIndexPageView` (bare views) used instead of
`AuctionsView`, `ProductsView` (toolbar-capable views). `ProductFilters` and `Pagination`
components exist in appkit but are never imported by any public listing page.
Fix: Phase 26 + 31 in `new-tracker.md`.

#### 2. Detail-Commerce pages — gallery, tabs, and action rail not fulfilled

Plan specifies: gallery/media, summary+pricing+actions in 3-col layout, sticky action rail
(desktop), mobile sticky bottom action bar, tabbed below-fold content.

Actual state of `ProductDetailPageView`:

| Plan Feature | Actual |
|-------------|--------|
| Clickable gallery → lightbox | ❌ CSS `background-image` div, not clickable |
| Thumbnail strip | ❌ Missing |
| Image counter ("1 / 2") | ❌ Missing |
| Tabbed below-fold (Description / Specs / Reviews) | ❌ `renderTabs` slot never passed |
| Related products carousel | ❌ `renderRelated` slot never passed |
| Sticky mobile action bar (`BuyBar`) | ❌ `BuyBar` component exists in appkit, never used |

`ImageLightbox`, `ProductTabs`, `RelatedProducts`, `BuyBar` all exist in appkit and are
fully implemented. None are imported or used in the product detail page.
Fix: Phase 25 + 32 in `new-tracker.md`.

Auction detail (`AuctionDetailView`) has 6 render slots. None are passed from
`src/app/[locale]/auctions/[id]/page.tsx`. Renders layout chrome only.
Fix: Phase 27.1 + 32.1–32.2.

Pre-order detail (`PreOrderDetailView`) same pattern.
Fix: Phase 27.2 + 32.9.

#### 3. HorizontalScroller — `perView` contract broken

Plan specifies: carousel shows N cards per view at responsive breakpoints (1 mobile,
2 tablet, 3 desktop). The `PerViewConfig` interface was designed for exactly this.

Actual: `void perView;` on line 67 of `HorizontalScroller.tsx` discards the prop
immediately. All carousels render every card in one flat row regardless of breakpoint.

Fix: Phase 24.1 — ResizeObserver-based item width calculation.

#### 4. Homepage CMS sections — ad slots, FAQ, brands broken

Plan specifies 18 homepage sections, ad slot system, FAQ with real data.

| Plan Item | Actual |
|-----------|--------|
| Ad slots fire after hero/products/reviews/FAQ | ❌ Key logic produces `"after0"`, `"after1"` — never match slot names |
| FAQ section renders from DB | ❌ Hardcoded `tabs={[]} items={[]}` — always empty |
| Brands section renders | ❌ No `case "brands":` in switch — silently dropped |
| HeroCarousel when DB empty | ❌ Returns `null` — blank gap, no fallback |

Fix: Phase 24.3–24.7 in `new-tracker.md`.

#### 5. Authenticated pages — slot-shell pattern not wired

Plan specifies full user/seller/admin dashboards with stats, charts, activity, orders, etc.

Actual: every page in `src/app/[locale]/user/`, `src/app/[locale]/seller/`, and most of
`src/app/[locale]/admin/` passes zero render props to its appkit view. All slot-shell
views render blank layout chrome only.

Reference implementations that DO work correctly (follow these patterns):
- `/events/[id]/page.tsx` — fetches data, passes all 5 render props
- `/search/[slug]/tab/.../page.tsx` — fetches data, passes all render slots + pagination
- `/promotions/[tab]/page.tsx` — fetches data, wires all render slots + labels

Fix: Phase 27 in `new-tracker.md` (11 sub-tasks).

#### 6. Cart and Checkout — transactional flow is a stub

Plan specifies: multi-step checkout (Address → Payment → Review), Razorpay payment,
order creation, authenticated cart with coupon support.

Actual:
- Cart uses `useGuestCart` (localStorage only). Authenticated `/api/cart` exists but is
  never called. No coupon field, no multi-seller grouping, no shipping estimate.
- Checkout file contains the comment "transactional bindings are next" — hardcoded
  `<Input>` fields, `[Place Order]` button does nothing, Razorpay not integrated.

Fix: Phase 28 in `new-tracker.md`.

#### 7. Rich text — store policies and category descriptions use plain text

Plan specifies rich text for all content fields.

Actual gaps:
- `StoreAboutView`: `returnPolicy` and `shippingPolicy` rendered as `whitespace-pre-line` plain text
- `CategoryDetailPageView`: category description rendered as plain text
- Both fields store HTML in Firestore but render it as escaped string

The `RichText` component and `normalizeRichTextHtml` utility are fully implemented and
used correctly in 16+ other places. Fix: Phase 33 in `new-tracker.md`.

#### 8. AdminEventsView — missing entirely

Plan includes admin event management. `AdminEventsView` component does not exist in
`appkit/src/features/admin/components/`. Only `AdminEventEntriesView` exists (entries
management, not event CRUD). Events cannot be created, edited, or deleted via admin.

Fix: Phase 30.1 in `new-tracker.md`.

---

### Updated Action Priority Map (Post-Audit)

Supersedes the Action Priority Map at lines 3686–3766. Items are ordered by dependency
and impact, not by page family.

| Priority | Phase | Action | Blocks |
|----------|-------|--------|--------|
| P0 | 24 | Fix appkit core bugs (perView, dark mode CSS, HeroCarousel, ad slots, FAQ, brands) | Everything |
| P1 | 25 + 32 | Wire product detail page: gallery + lightbox + tabs + BuyBar + bid history | Detail-Commerce spec |
| P2 | 26 + 31 | Wire listing toolbars: auctions, products, pre-orders, stores, category, store tabs | Listing + Listing-Extension spec |
| P3 | 29 / 18 | Seed local Firestore + verify all detail pages load | All local testing |
| P4 | 27 | Wire all slot-shell pages: user/seller/admin dashboards + auction/preorder detail | Dashboard spec |
| P5 | 30 | Create AdminEventsView; wire admin analytics date range; extend admin site settings | Admin spec |
| P6 | 28 | Wire cart auth + Razorpay + order creation | Checkout spec |
| P7 | 33 | Fix rich text gaps: store policies, category descriptions | Content spec |
| P8 | 22 | Responsive audit: 375px / 768px / 1024px | Responsive contract |
| P9 | 23 | Smoke tests, Lighthouse ≥90, cross-browser, launch checklist | Launch |

---

### Updated State Matrix — Actual vs Plan

Supplements the State Matrix at lines 3582–3682. "Actual" reflects current local build.

| Page Family | Plan Target | Actual State | Gap |
|-------------|-------------|-------------|-----|
| Homepage | 18 sections, ads, CMS-driven | ❌ Blank locally (empty Firestore) | Seed + 5 appkit bugs |
| Listing pages | Full toolbar (search/filter/sort/pages) | ❌ Bare grid, no toolbar | Phase 26 |
| Listing-extension (category/store) | Toolbar + fixed parent context | ❌ Bare grid, no toolbar | Phase 31 |
| Detail-Commerce (product) | Gallery + tabs + sticky rail | ❌ CSS bg-image, no tabs, no BuyBar | Phase 25+32 |
| Detail-Commerce (auction) | 6-slot layout + real-time bids | ❌ All 6 slots empty | Phase 27+32 |
| Detail-Commerce (pre-order) | Gallery + reserve progress | ❌ All 3 slots empty | Phase 27+32 |
| Promotions + Search | Tabbed listing + toolbar | ✅ Wired correctly | None |
| Events detail | Slot-shell + 5 render props | ✅ Wired correctly | None |
| Blog detail | RichText body + related posts | ✅ Self-fetches via hook | Minor: renderRelatedCard |
| Checkout | 3-step + Razorpay + order API | ❌ Explicit stub | Phase 28 |
| User account (10 pages) | Stats + nav + orders + wishlist | ❌ All blank (zero slot props) | Phase 27 |
| Seller dashboard (10 pages) | Stats + chart + listings | ❌ All blank (zero slot props) | Phase 27 |
| Admin list views (7) | Self-fetching tables | ✅ Work (useAdminListingData) | Minor: no edit drawer |
| Admin analytics | Charts + date range | ⚠️ Charts present, date range empty | Phase 30 |
| Admin events CRUD | Create/edit/delete events | ❌ AdminEventsView missing | Phase 30 |
| Rich text content | All HTML fields via RichText | ⚠️ Store policies + category desc plain text | Phase 33 |

---

### Seed Data Status (Post-Audit)

The homepage and most detail pages require Firestore data to render anything locally.

| Collection | Plan requires | Local status | Action |
|------------|--------------|-------------|--------|
| `carousel_slides` | ≥2 active slides | ❌ Empty | Phase 29 |
| `homepage_sections` | ≥1 doc per type | ❌ Empty | Phase 29 |
| `site_settings/singleton` | Announcement + settings | ❌ Empty | Phase 29 |
| `products` | ≥3 with images[], specs[] | ⚠️ May exist via /demo/seed | Verify + enrich |
| `auctions` | ≥2 with bid history | ⚠️ May exist via /demo/seed | Verify + enrich |
| `faq_items` | ≥3 with `showOnHomepage:true` | ❌ Missing (FAQ bug hid them) | Phase 24.6 + seed |
| `stores` | ≥1 with HTML bio + policies | ⚠️ May exist | Verify HTML fields |
| `categories` | ≥3 with HTML description | ⚠️ May exist | Verify HTML field |

Run `/demo/seed` after Phase 24 fixes are in place to exercise the corrected homepage.

---

### Cross-References

| Document | Role |
|----------|------|
| `INSTRUCTIONS.md` | Full architectural gap analysis (21 sections), ASCII before/after diagrams, bug catalog with file:line references |
| `new-tracker.md` | Task tracker (Phases 7–33, 180+ tasks), per-task status, audit findings passes 1–16 |
| `prompt.md` | Session working prompt — orient, implement, seed, update tracker and diagrams, commit |
| `appkit/src/seed/` | Seed data files for all Firestore collections |
| `src/app/api/demo/seed/route.ts` | POST /demo/seed endpoint for local data bootstrapping |
