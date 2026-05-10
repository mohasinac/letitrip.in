# letitrip.in — Master Working Prompt

> Paste at the start of every session.
> **Task status** → `crud-tracker.md` (authoritative).
> **Deferred/skipped** → `newchange.md` DEFERRED table (read before starting).
> **Architecture + imports** → `INSTRUCTIONS.md`.
> **Slug prefixes + media patterns** → `CLAUDE.md`.

---

## 🔁 RULE #0 — SESSION PROTOCOL

### At the START of every session (before writing any code):
1. **Update `prompt.md`** — set LAST COMPLETED to the previous session; set 🔜 NEXT to the current session's tasks from `crud-tracker.md`.
2. **Update `memory/project_status.md`** — note what this session will work on and any carry-over from the last session.
3. **Read `newchange.md` DEFERRED table** — check for open gaps that must be resolved before starting new work.

### At the END of every session (before the final commit):
1. **Fix all TypeScript errors** — run `npx tsc --noEmit` in both `letitrip.in/` and `appkit/`. Must be 0 errors.
2. **Recheck all changes** — re-read every file touched this session and verify correctness; no half-finished implementations.
3. **Code quality** — use appkit HTML wrappers (`Div`, `Row`, `Stack`, `Text`, `Heading`), CSS variables (`var(--appkit-color-*)`, `var(--header-height)`), no hardcoded hex, no arbitrary Tailwind breakpoints.
4. **Update `crud-tracker.md`** — mark completed tasks ✅ with session + one-line note; mark session row ✅ Done in roadmap.
5. **Update `prompt.md`** — move this session into LAST COMPLETED; set 🔜 NEXT to the *next* session's tasks.
6. **Update `memory/project_status.md`** — prepend a bullet summary of everything that changed.
7. **Prepend `newchange.md`** — session entry: scope, changed files table, deferred items table.
8. **Update ASCII diagrams** — add/update any diagrams affected by new pages or flows.
9. **Seed data + Firebase** — if any schema changed: update seed files in `appkit/src/seed/`, update `firestore.indexes.json`, update SeedPanel entries, update sievejs config.
10. **Commit** — code commit first, then a separate docs commit.
11. **appkit: build only, do NOT publish** — run `npm run build` in `appkit/` so `dist/` is up to date for local dev. Only bump version + `npm publish` when the user explicitly says to release. Vercel auto-deploy is disabled; only `vercel --prod` when asked.

> **Why:** `prompt.md` is read cold at every session start. Stale LAST COMPLETED and 🔜 NEXT means the next session wastes turns re-deriving context and risks regression.

---

## ⚡ LAST COMPLETED — Session 90 🔄 2026-05-11 (AX1 partial — ACTION constants built, hook pending)

| Task | What was done |
|------|--------------|
| **AX1 constants** | `appkit/src/features/products/constants/action-defs.ts` created — §1 product/listing ACTION_ID (11), ACTION_META, DETAIL_ACTIONS, MOBILE_PRIMARY_ACTIONS, LISTING_BULK_ACTIONS · §2 row/table ROW_ACTION_ID (17), ROW_ACTION_META, role-based row/bulk action sets · §3 form FORM_ACTION_ID (7), FORM_ACTION_META, FORM_FOOTER_PRESET · §4 dashboard DASHBOARD_QUICK_ACTION_ID (17), DASHBOARD_QUICK_ACTION_META. All exported from `client.ts` + `index.ts`. DrawerFormFooter + FormShell default labels now sourced from FORM_ACTION_META. ProductsIndexListing + PreOrdersIndexListing bulk action keys/labels from ACTION_ID/ACTION_META. 🔄 |
| **Still pending** | `useActionDispatch` hook (NAVIGATE/OPEN_PANEL/TOAST/BULK/COPY), Zustand `panelStore`, migration of copy-paste `router.push` patterns in admin views. |

---

## ⚡ LAST COMPLETED — Session 89b ✅ 2026-05-11 (FAQ redesign + WhatsApp section + @types/react dedup)

| Task | What was done |
|------|--------------|
| **FAQSection rewrite** | Built-in category tab bar (Button primary/ghost), multi-open Set state, `defaultOpenCount`, CSS grid expand/collapse animation. `RichText` for HTML answers — no `dangerouslySetInnerHTML`. `FAQSectionConfig` expanded: `showCategoryTabs`, `visibleTabs: FAQCategoryKey[]`, `allowMultipleOpen`, `defaultOpenCount`. Removed stale `expandedByDefault`. `section-renderer.tsx` faq case passes all new config fields + slicedItems + hasMore. Seed config updated. ✅ |
| **WhatsAppCommunitySection redesign** | Brand primary→cobalt gradient card (not solid WhatsApp green). WhatsApp green only for icon + CTA button. `RichText` description, benefits checklist, blockquote testimonial. No inline styles — CSS variables only. `section-renderer.tsx` whatsapp-community case passes benefits, testimonial, buttonText. ✅ |
| **@types/react dedup** | Moved `@types/react` from `devDependencies` → `peerDependencies` in appkit. Added `"overrides": { "@types/react": "^19", "@types/react-dom": "^19" }` in root `package.json`. Eliminated 14 pre-existing TS errors (dual instance root cause). ✅ |
| **nav types** | `src/constants/navigation.tsx` now imports `AdminNavGroup`, `StoreNavGroup`, `UserNavGroup`, `MainNavbarItem`, `AppLayoutShellSidebarLink` directly from appkit — no local re-declaration. ✅ |
| **FAQs page** | `src/app/[locale]/faqs/page.tsx` JSON-LD now includes all public FAQs (limit 50, not filtered to `showOnHomepage`). ✅ |
| **appkit rebuilt** | `file:./appkit` local link — no version bump needed for local dev. Both repos: 0 TS errors. |

---

## ⚡ LAST COMPLETED — Session 89a ✅ 2026-05-11 (Detail page UX + Wishlist filters + Blog/Event fixes)

| Task | What was done |
|------|--------------|
| **VD12** | De-cramped all 3 product detail pages. Standard: removed duplicate price from info column (price+discount now in actions sidebar in one Row); `gap="sm"→"md"`. Auctions: status badge (Active/Ended) moved next to auction badge in title block; consolidated bid-count under current-bid price; duplicate bid form sidebar stripped of repeat data. Pre-orders: removed duplicate price from info column (lives in buy-bar panel); `gap="md"`. ✅ |
| **J16** | `BlogCard` wraps in `<Link>` only when `href` prop is given. Fixed: `BlogPostPageClient.tsx` now passes `href` built from locale + `ROUTES.BLOG.ARTICLE(slug)`. `BlogPostView.tsx` fallback card also fixed. ✅ |
| **J17** | `POST /api/events/[id]/entries` no longer requires auth. Added `authOptional?: boolean` to `RouteHandlerOptions` — reads session if cookie present, continues anonymous on failure. Added `displayName?: string` to `RouteUser`. ✅ |
| **Wishlist filter drawer** | `src/app/[locale]/wishlist/page.tsx` gains `filterContent` drawer in `ListingLayout`: Type filter (All/Standard/Auction/Pre-Order) + price range (min/max in ₹, converted to paise). Staged pending/applied filter state. `countActiveFilters()` helper. Clear-all button. ✅ |
| **appkit / local dev** | Switched `@mohasinac/appkit: ^2.4.11` → `file:./appkit`. Regenerated `package-lock.json`. `@types/react` pinned `19.1.0 → 19.2.14` in appkit to avoid dual-instance conflict. ✅ |

---

## ⚡ LAST COMPLETED — Hotfix 87.2 ✅ 2026-05-10 (firebase-admin/database missing in Lambda)

| Task | What was done |
|------|--------------|
| **RTDB fix** | Google OAuth failing: `Cannot find module '/var/task/node_modules/firebase-admin/lib/database/index.js'`. Appkit uses `(module as any).require("firebase-admin/database")` which escapes webpack + Vercel's tracer → database files excluded from Lambda bundle. Fixed by adding `experimental.outputFileTracingIncludes` to `next.config.js` forcing inclusion for all `/api/**` routes. ✅ |

---

## ⚡ LAST COMPLETED — Session 88 ✅ 2026-05-10 (Search + Routes — RC3 + RC4)

| Task | What was done |
|------|--------------|
| **RC4** | Removed all 10 `[[...action]]` catch-all folders from admin routes (blog, coupons, carousel, bids, deals, featured, orders, reviews, sections, users). Created `/page.tsx` list pages for each. Updated hardcoded `actionHref`/`getRowHref` strings in blog/coupons/deals/featured to use `ROUTES.ADMIN.*` constants. Zero `[[...action]]` folders remain. ✅ |
| **RC3** | Added `asChild` prop to appkit `Button` via `React.cloneElement` — enables `<Button asChild><Link>` styled-navigation pattern. Fixed all 4 violations: CartRouteClient checkout button (conditional `Button asChild + Link` / `Button disabled`); ProfilePageClient "Manage Addresses" → `<Link>`; UserAddressesClient "+ Add Address" → `<Link>`; store/sublisting-categories "Edit" → `<Link>` (also removed hardcoded `#6366f1` fallback). Removed unused `useRouter` imports/instances in 2 files. appkit built → dist synced to node_modules. ✅ |
| **appkit 2.4.11** | Built (version auto-bumped from 2.4.10). dist synced to node_modules. Both repos: 0 TS errors. |

---

## ⚡ LAST COMPLETED — Hotfix 87.1 ✅ 2026-05-10 (CSS display utilities safelist + dev memory)

| Task | What was done |
|------|--------------|
| **CSS fix** | Main navbar (`hidden lg:block`) and Today's Deals pill (`hidden lg:flex`) were invisible at desktop — host Tailwind JIT doesn't scan appkit source. Added `lg:block`, `lg:flex`, `lg:hidden`, `md:*`, `xl:*`, `sm:*` display utilities to `tailwind.config.js` safelist. Verified locally (`.next/dev/static/css/app/layout.css` has all classes) and on live site. ✅ |
| **Dev memory** | `dev:only` Node.js heap: `4096` → `2048` MB to match Vercel prod env and prevent 5 GB+ dev server bloat. ✅ |
| **Deploy** | `vercel --prod` — build 3m 26s, status Ready. Navbar confirmed visible on `www.letitrip.in`. ✅ |

---

## ⚡ LAST COMPLETED — Session 87 ✅ 2026-05-10 (Social Feed S1–S5)

| Task | What was done |
|------|--------------|
| **S1** | `GET /api/social-feed/route.ts` exists. Fetchers in `appkit/src/features/homepage/lib/social-feed-fetcher.ts` — 4 platforms (Instagram/Facebook/TikTok/DeviantArt), typed `SocialPost`, cache headers. Exported from `server.ts`. ✅ |
| **S2** | `SocialFeedSection.tsx` (async RSC, 3 layouts, error/empty states) + `SocialPostCard.tsx` (thumbnail, platform badge, video overlay, hover stats). Wired in `section-renderer.tsx`. ✅ |
| **S3** | `renderSocialFeedBuilder()` added to `AdminSectionsView.tsx` — platform Select, handle Input, postType Select, count Input (1–12), layout Select, showCaption/showStats Checkboxes, title/subtitle. Wired in `renderTypedBuilder()`. ✅ |
| **S4** | 7 social credential state vars + load + mutation + UI in `AdminSiteSettingsView.tsx`: Meta (Page Access Token + ID), TikTok (Client Key/Secret/Access Token), DeviantArt (Client ID/Secret) — all MaskedInput. ✅ |
| **S5** | Disabled instagram social-feed section pre-exists in `homepage-sections-seed-data.ts`. ✅ |
| **appkit dist** | Built. No new TS errors. Pre-existing chart `dynamic()` errors unchanged. |

---

## ⚡ LAST COMPLETED — Session 86 ✅ 2026-05-10 (Grouped Listings GP1→GP2)

| Task | What was done |
|------|--------------|
| **GP1** | Group fields on `ProductDocument` (`groupId`, `isGroupParent`, `groupParentSlug`, `groupChildSlugs`, `groupTitle`). `findByGroupId` + 7 batch-write repository methods. `ShowGroupSection` client component (circular thumbs, HorizontalScroller, Modal/SideDrawer table). `renderGroupSection` render prop on `ProductDetailView`+`PreOrderDetailView`; wired in `ProductDetailPageView`+`PreOrderDetailPageView`. Public GET `/api/products/group/[groupId]`. ✅ |
| **GP2** | `GroupSettingsPanel` (3-state: not-in-group / is-parent / is-child). `renderGroupSettings` render prop on `ProductForm`. Wired in `AdminProductEditorView`. Store + admin CRUD API routes (8 routes total: group start/update/dissolve, children add/unlink, leave). ✅ |
| **Seed** | `grouped-listings-seed-data.ts` (8 bundles), `GroupedListingDocument` schema, `GROUPED_LISTINGS_COLLECTION`, seed route + SeedPanel wired. ✅ |
| **Firebase indexes** | `groupId+isAuction+status` + `groupId+status+price` on products; `storeId+isActive+createdAt` + `isFeatured+isActive+createdAt` on groupedListings. ✅ |
| **appkit 2.4.10** | Built + published (2.4.9 → 2.4.10 with sort bug fix, Select component, cast cleanup). Root `^2.4.10`. Both repos tsc 0 errors. ✅ |

---

## ⚡ LAST COMPLETED — Session 85 ✅ 2026-05-10 (Sub-listing Categories SC1→SC4 + Store CRUD)

| Task | What was done |
|------|--------------|
| **SC1** | `SublistingCategoryDocument` schema + `SublistingCategoriesRepository` + `sublistingCategoryId` on `ProductDocument` + admin/public API routes. ✅ |
| **SC2** | `AdminSublistingCategoriesView` + `AdminSublistingCategoryEditorView` + admin pages (list/new/edit) + nav entry in `ADMIN_NAV_GROUPS`. ✅ |
| **SC3** | `SublistingCategorySelect` in `ProductForm`; `SublistingCarouselSection` component; `renderSublistingSection` prop on all 3 detail view shells; wired into `ProductDetailPageView`, `AuctionDetailPageView`, `PreOrderDetailPageView`. ✅ |
| **SC4** | Public `/sublisting-categories/[slug]` page (RSC, `generateMetadata`, listing grid, breadcrumb, empty state). ✅ |
| **Store CRUD** | `/store/sublisting-categories` browse/create/edit/delete pages + `/api/store/sublisting-categories` API + `STORE_NAV_GROUPS` nav entry. Sellers can create/edit/delete categories they own. ✅ |
| **Firebase indexes** | Added `sublistingCategoryId+status+price` on products + `name+createdAt` and `productCount+createdAt` on sublistingCategories to `firestore.indexes.json`. ✅ |
| **SeedPanel** | Updated `sublistingCategories` entry with correct schema fields (removed stale `parentId`/`isLeaf`). ✅ |
| **appkit 2.4.6** | Built + published. Root updated to `^2.4.6`. Both repos tsc 0 errors. ✅ |

---

## ⚡ LAST COMPLETED — Hotfix ✅ 2026-05-10 (Tailwind self-contained + SC1 type fixes)

| Task | What was done |
|------|--------------|
| **Tailwind broken** | Root cause: `node_modules/@mohasinac/appkit` only has `dist/`, not `src/`. Host content path `src/**` scanned nothing → all appkit classes purged. ✅ |
| **appkit self-build** | `tailwind.config.js` + `tailwind-input.css` + build step added to appkit. `dist/tailwind-utilities.css` (141 KB) now ships with the package. Host no longer scans appkit. ✅ |
| **@types/react pin** | Pinned to `19.1.0` in appkit to prevent `19.2.x` default-import regression breaking `tsc -p tsconfig.build.json`. ✅ |
| **SC1 pre-existing TS** | `sublistingCategoryId` added to `ProductItem`; missing exports added to `index.ts`; `slug` added to create call; stray `q` removed from sieve call. ✅ |
| **appkit published** | `@mohasinac/appkit@2.4.5` on npm. Host updated to `^2.4.5`. Both repos tsc 0 errors. ✅ |

---

## ⚡ LAST COMPLETED BEFORE HOTFIX — Session 84 ✅ 2026-05-10 (L1 + L2 + L3 Custom Fields)

| Task | What was done |
|------|--------------|
| **VD9** | `becomeSeller` 9 → 41 keys (8 guide sections, earnings ₹917.40 breakdown, 3 tiers). `sellerGuide` rewritten collectibles-specific. ✅ |
| **VD10** | `terms` 15-section (IT Act/CPA), `privacy` DPDP Act 2023, `cookies` named (Firebase/GA4/Razorpay), `refundPolicy` 8 collectibles sections. ✅ |
| **L1** | `CustomField` + `CustomSection` types in `firestore.ts`; `CustomFieldsEditor` client component (key/type/value/unit rows, max 50). ✅ |
| **L2** | `ProductTabsShell` extended with `customTabs`; `CustomSectionTabContent` RSC; all 3 detail page views wired. ✅ |
| **L3** | `CustomSectionsEditor` (max 3 sections, title/text/fields); wired into `ProductForm`. ✅ |
| **TypeScript** | Both repos pass `npx tsc --noEmit` 0 errors. |

---

## 🔜 NEXT — Session 90 🔄 (complete AX1 → color tokens → layout tokens → Q tier)

> Sessions reordered **safe-first**: zero-schema/zero-API changes go before Firebase Function + routing changes.

### Session 90 (current) — Complete AX1
| Tasks | Goal |
|-------|------|
| AX1 remainder | `useActionDispatch` hook (NAVIGATE/OPEN_PANEL/TOAST/BULK/COPY) + Zustand `panelStore` + migrate copy-paste `router.push` patterns in admin views |

### Session 90-colors — Color Token Audit *(zero breaking risk)*
| Tasks | Goal |
|-------|------|
| X7a, X7b | Extend CSS color token system + replace all hardcoded hex violations (one file per commit) |

### Session 91 — Layout Token Audit *(zero breaking risk)*
| Tasks | Goal |
|-------|------|
| X8a, X8b | Layout tokens + replace breakpoint/z-index/size violations |

### Session 92 — Action URL Routing *(medium risk — URL params only)*
| Tasks | Goal |
|-------|------|
| AX2, AX3 | `?panel=create/edit` deep-links on 10 admin listing pages + `FormActionBar` sticky bars |

### Session 93 — Extended Homepage Sections *(additive, no schema breaks)*
| Tasks | Goal |
|-------|------|
| EX1, EX2, EX3, EX4, YT1 | Stats live queries, multi-carousel, CTA/filter chips, products multi-row, YouTube cards |
| EX5 | Collection-cards section (supersedes 8 old types — handle last, higher migration risk) |

### Session 94 — Feature Icons *(new collection, additive)*
| Tasks | Goal |
|-------|------|
| FI1, FI2, FI3 | `productFeatures` schema + seed + admin CRUD |
| FI4, FI5, FI6 | Store CRUD + product form integration + card/detail badges |

### Session 95 — Bulk Actions public *(additive UI)*
| Tasks | Goal |
|-------|------|
| BK1, BK2 | Public listing selection mode + sticky bulk action bar |
| BK3 | Compare overlay (desktop table + mobile swipe) |

### Session 96 — Query/Sieve *(medium risk — Firebase Function + API param changes)*
| Tasks | Goal |
|-------|------|
| Q5 | Firestore composite indexes (safe subset — deploy only) |
| Q1, Q2, Q3, Q4, Q6 | `listingProcessor` Firebase Function + API param standardisation + infinite scroll |

### Sessions 97–101 — Seed Scale *(low risk)*
| Tasks | Goal |
|-------|------|
| P23, P24 | Standard products 100+ + auctions 20 + pre-orders 10 |
| P25, P26 | Categories 55+ + Users 15+ + Brands 25+ |
| P27, P28 | Reviews 60+ + Orders 35+ + Blog 20+ + Events 15+ + FAQs 55+ |
| P29, P30 | Coupons 20+ + Notifications 40+ + Messages + SubCats + Grouped |
| P31 | Zod validation + PII masking + dry-run diff |

### Sessions 102–104 — RBAC UI *(additive, permission-gated)*
| Tasks | Goal |
|-------|------|
| RBAC1→RBAC10 | Permission constants → server resolver → SSR gates → API guards → Team UI |

### Sessions 105–107 — BAN system UI *(additive)*
| Tasks | Goal |
|-------|------|
| BAN1→BAN9 | Schema → enforcement → ticket API → admin UI → Firebase functions |

### Sessions 108–110 — SCAM system UI *(additive)*
| Tasks | Goal |
|-------|------|
| SCAM2, SCAM4, SCAM6, SCAM7, SCAM8 | Admin management + FAQs + acknowledgement + SEO + notifications |

### Sessions 111+ — Deferred
| Tasks | Goal |
|-------|------|
| G1, G2 | Product templates |
| D2, D3, VC2, VC4, LL4, LL5 | User account forms |
| GD1–GD22 | Guide pages (store/buyer/admin) |
| ARCH1, ARCH6, ARCH7, ARCH9 | Store identity audit |
| SL6, UX8, I7, O5, HS4-E | Misc deferred (watermark CDN, Shiprocket, per-store Google Reviews) |

---

## 📅 ROADMAP

### Alpha gate (77–80) — implement before alpha release

| Session | Tasks | Goal |
|---------|-------|------|
| **77-impl** | UX1–UX5, UX9, O1, O2+C5, C1, VB8, C2, VB9, LL6 | Seller Products + UX primitives |
| **78** | D1+VC6, VC1, VC3, VC5, LL1, LL2, LL3 | User Account Core |
| **79** | W1, W2, W3, W4, R1 | Cart Integrity |
| **80-impl** | C6, C7, O3, VB3, VB10, LL8, UX7 | Store Settings |

### 🚀 ALPHA RELEASE after Session 80-impl

### Post-alpha

| Session | Tasks | Goal |
|---------|-------|------|
| 81-impl | C3, VB5, C4, VB6, VB1, VB2, VB7, O4, LL7, LL9, LL10 | Store Finance: coupons, orders, payouts, analytics |
| 83 | VD8, VD9, VD10 | Content rewrites: About, Seller Guide, Legal |
| 84 | L1, L2, L3 | Custom Fields system |
| 85 | SC1, SC2, SC3, SC4 | Sub-listing categories |
| 86 | GP1, GP2 | Grouped listings |
| 87 | S4, S1, S2, S3, S5 | Social feed |
| 88 | RC2, SR1, SR2, SR3, RC1, RC3 | Search redesign + route centralisation |
| 89 | Q5, Q1, Q2, Q3, Q4, Q6 | Query/Sieve + infinite scroll |
| 90 | X7a, X7b | Color token audit |
| 91 | X8a, X8b | Layout token audit |
| 92–95 | P23–P31 | Seed scale expansion |
| 96 | RBAC2, RBAC3, RBAC4 | RBAC: Employee invite + admin RSC guards + permission middleware |
| 97 | RBAC5, RBAC6, RBAC7 | RBAC: Store capability guards + employee UI + permission groups admin |
| 98 | RBAC8, RBAC9, RBAC10 | RBAC: Permission audit log + capabilities admin + seed data |
| 99 | BAN2, BAN3, BAN4 | Bans: Admin ban UI + hard ban cascade + checkout/ticket blocking |
| 100 | EX1–EX5, YT1 | Extended homepage sections: stats live queries, multi-carousel, CTA/filter chips, products multi-row, collection-cards, YouTube cards |
| 101 | AX1, AX2, AX3, A1-ext | Action system: ACTION constants + dispatch hook, URL panel routing, sticky FormActionBar, admin product store picker |
| 102 | FI1–FI6 | Feature Icons: productFeatures collection, seed, admin+store CRUD, product form, card badges |
| 103 | BK1–BK3 | Bulk Actions: public selection mode, sticky action bar, compare overlay |
| 104 | BAN5, BAN6, BAN7 | Bans: Support ticket API + ticket UI + Firebase notification functions |
| 105 | BAN8, BAN9 | Bans: Ticket seed data + analytics |
| 106 | SCAM2, SCAM3, SCAM4 | Scams: Scammer repo + public list page + individual profile page |
| 107 | SCAM5, SCAM6, SCAM7 | Scams: Submit report + scam awareness acknowledgement + admin verify UI |
| 108 | SCAM8, SCAM9 | Scams: Scam type pages + seed data |
| 109+ | VA19, I6, I7, D5, VC7, O5, HS4-E, VC2, VC4, D3, D4, LL4, LL5 | Deferred: Admin CSV export, PDF, watermark CDN, messages, Shiprocket |

### Confirmed UX design for GP1 + SC3 (Sessions 85–86)
- Both sections live **between the buy-box/actions area and the TABS row** — NOT in belowFold
- Injected via `renderGroupSection` (GP1) and `renderSublistingSection` (SC3) render props on `ProductDetailView` / `AuctionDetailView`
- Card style: small **circular** thumbnail cards (~64 px) in a `HorizontalScroller`, collapsed by default
- Sub-listing cards: circular image + name (2-line truncate) + price chip; click → navigate; current highlighted with ring
- Group cards: circular image + name + price; click → navigate; current highlighted; selectable
- "View whole group →" opens a Modal (SideDrawer if ≥5 parts): thumbnail/name/price/condition/"View" table
- Auctions only get SC3; GP1 is standard products + pre-orders only

---

## ⛔ GOLDEN RULES

```
✅ = fully done per spec, TS passes, verified in browser
Never silently skip a spec bullet — defer with new task or do it now
Never leave stale "remaining: old-task-ID" on ✅ tasks
npx tsc --noEmit must pass before every commit (both repos)
```

### Route definitions
- NEVER create a `page.tsx` at a path that also has a `[[...action]]` child folder — Next.js rejects it
- Standard CRUD: `/resource/page.tsx` (list) + `/resource/new/page.tsx` (create) + `/resource/[id]/edit/page.tsx` (edit). No `[[...action]]` catch-alls for new routes.
- All route strings → `ROUTES.*` constants only (`appkit/src/next/routing/route-map.ts`). Zero hardcoded strings.

### SeedPanel — always in sync
Any schema, collection, feature type, or user-config change → update SeedPanel in the SAME session:
1. Update the `FieldDef[]` array for that collection in `SeedPanel.tsx`
2. Update `slugPattern` chip if the ID format changed
3. Update `mediaFields` chips if new image/video fields were added
4. Update PII label if new personally-identifiable fields were added
5. Update the actual seed file in `appkit/src/seed/`

### ASCII diagrams — draw as you build
- `asciiDiagrams.md` is canonical — one diagram per page/view
- When you build or significantly change a page/view/form/modal: add or update its diagram
- Diagrams must show **everything**: all tabs, columns, form fields, action buttons, modals/drawers, filter states, empty states
- Format: ASCII box-drawing with `## [Area] > [Page Name]` heading

### Component index — look before you create
- Before writing any new component/util/constant: check `appkit/index.md` and `src/index.md`
- After every task that adds, renames, or removes: update the relevant row
- Format: `| Name | Path | What it does |`

### UI rules
- Missing data → empty state, never crash/white screen
- Every optional prop needs a default
- Half-renames are banned — rename = one atomic commit covering producer + consumer

### Content
- Brand: **"LetItRip"** — always this casing (not "LetiTrip", not "Letitrip"). Grep after every content update.
- No generic marketplace copy — reference real collectibles niche (Pokémon TCG, Hot Wheels, Beyblades, anime figures)

### Buttons vs links
```
<Button>                                     → action / mutation / modal open only
<Link href={ROUTES.*}>                       → navigation — always ROUTES.* constant
<Button asChild><Link href={ROUTES.*}>       → styled-button navigation
```

### SideDrawer vs Modal
```
0 fields (confirm only) → ConfirmDeleteModal
1–2 form fields         → Modal
3+ form fields          → SideDrawer
```

### Store identity
```
Public routes + UI:   storeId / storeName / storeSlug  — never sellerId / ownerId
Admin routes only:    may additionally show ownerId (Firebase UID)
Internal server only: sellerId (= Firebase UID) — never returned in API responses
```

### User roles — 5 tiers
```
user      → basic buyer (no store)
seller    → has ≥1 store; role assigned on store creation
moderator → content moderation sub-role (internal)
employee  → internal staff; access governed by permissions[] array, not role
admin     → platform admin; bypasses ALL permission checks
```

### No hardcoded values
```
Colors  → var(--appkit-color-*)         No: #hex, rgb(), rgba()
Layout  → var(--appkit-z-*), @screen    No: raw px breakpoints, z-index ints
```

### Reuse before creating
Search `appkit/src/` first. Primitives → `appkit/src/ui/`. Features → `appkit/src/features/[domain]/`. Pages = thin wrappers only.

---

## HOW TO WORK (every task)

```
1. crud-tracker.md → find next ⏳, mark 🔄
2. newchange.md DEFERRED table → any relevant unresolved items?
3. Read every source file you'll touch — never code from memory
4. Plan 3–5 bullets: what changes and why
5. Implement smallest correct change
6. Verify: npx tsc --noEmit + browser visual confirm
7. Commit → fix/feat/wire/seed(scope): description
8. newchange.md → prepend new task entry (after EVERY task)
9. prompt.md → update LAST COMPLETED (after EVERY task)
10. crud-tracker.md → mark ✅, fill Part#, update Summary + timestamp
```

### Checklist per task
```
□ TRACKER    crud-tracker.md marked 🔄 at start
□ DEFERRED   newchange.md DEFERRED table checked
□ CODE       implemented, tsc 0 errors, browser verified
□ COMMIT     correct format, one task, no TS errors
□ SEED       updated or noted "no change needed"
□ NEWCHANGE  newchange.md prepended — after EVERY task
□ PROMPT     prompt.md LAST COMPLETED updated — after EVERY task
□ TRACKER    marked ✅, Part# filled, Summary + timestamp updated
```

### Form quality checklist (every VA/VB/VC editor form)
```
□ MOBILE     Works at 375px — no overflow, no clipped inputs
□ TABLET     Works at 768px — responsive grid kicks in
□ DARK       All labels/textareas/helper text have dark: variants
□ TOKENS     No hardcoded hex/rgb — var(--appkit-color-*) or Tailwind semantic
□ FOCUS      Focus rings visible on all interactive elements
□ ERRORS     Error states styled (red border, error message)
□ LOADING    Submit button shows isLoading + disabled; no double-submit
```

### Build cycle (appkit changes)
```bash
npm run watch:appkit   # terminal 1 — compiles appkit/src/ → appkit/dist/ on save
npm run dev            # terminal 2 — Next.js picks up appkit/dist/ changes live
npx tsc --noEmit       # must pass before commit (both repos)
```

**appkit is consumed via `file:./appkit` during local dev** — no npm publish needed.
Only publish to npm when the user explicitly asks. Vercel auto-deploy is disabled (`vercel.json`).
See CLAUDE.md "Appkit Local Dev vs Publish Rules" for the full publish checklist.

---

## REFERENCE IMPLEMENTATIONS

```
src/app/[locale]/events/[id]/page.tsx              ← detail page (all render props wired)
src/app/[locale]/admin/events/page.tsx             ← admin list (full CRUD)
src/app/[locale]/admin/events/new/page.tsx         ← admin create pattern
src/app/[locale]/admin/ads/[id]/edit/page.tsx      ← admin edit pattern
src/app/[locale]/store/products/new/page.tsx       ← seller create pattern
```

---

## KEY FILE LOCATIONS

| What | Where |
|------|-------|
| Task tracker | `crud-tracker.md` |
| Deferred items + session log | `newchange.md` |
| Architecture + import rules | `INSTRUCTIONS.md` |
| Slug prefixes + media patterns | `CLAUDE.md` |
| Seed files | `appkit/src/seed/` |
| Seed API | `src/app/api/demo/seed/route.ts` |
| SeedPanel UI | `src/components/dev/SeedPanel.tsx` |
| Public layout shell | `src/app/[locale]/LayoutShellClient.tsx` |
| Cart | `src/components/routing/CartRouteClient.tsx` |
| Checkout | `src/components/routing/CheckoutRouteClient.tsx` |
| API constants | `src/constants/api.ts` |
| Route constants | `@mohasinac/appkit/client` (`ROUTES`) |
| SEO metadata | `src/constants/seo.server.ts` |
| RBAC permissions | `appkit/src/features/auth/permissions/constants.ts` |
| Support ticket schema | `appkit/src/features/support/schemas/firestore.ts` |
| Scam schema + constants | `appkit/src/features/scams/` |

---

## COMMIT FORMAT

```
fix(scope): description
feat(scope): description
wire(scope): description
seed(scope): description

- file A — what changed
- file B — what changed
- Root cause / reason: one sentence
```

One task per commit. Never commit with TS errors. Never batch tasks.

---

## WHAT NOT TO DO

```
✗ Refactor beyond the current task
✗ Add comments explaining what code does
✗ Run git push unless asked
✗ Mark ✅ if any spec bullet is unbuilt — log deferral in newchange.md DEFERRED first
✗ Skip newchange.md update after completing a task — update after EVERY task
✗ Skip prompt.md update after completing a task — update after EVERY task
✗ Skip crud-tracker.md update — after every task AND every 30 minutes
✗ Use dangerouslySetInnerHTML without RichTextRenderer
✗ Use as unknown as Foo without a ⚠️ Tech debt: note in tracker
✗ Leave stale "remaining: old-task-ID" notes on ✅ entries
✗ Update INSTRUCTIONS.md §12 "LIVE SITE" column — it is a reference snapshot
```

---

## PLAN SNAPSHOT

```
Sessions done:  60–89b + AX1-partial (107 tasks ✅, 283 remaining per tracker)
                ✅ Foundation → Admin CRUD → Public Catalogue → SEO
                ✅ RBAC/BAN/SCAM schemas (80-schema)
                ✅ sellerId migration (81)
                ✅ Bulk selection + BulkActionsBar (82-ext)
                ✅ UX shells + Seller product forms (77-impl)
                ✅ User Account Core — orders, profile, notifications, reviews, bids (78-impl)
                ✅ Cart integrity + wishlist validate (79-impl)
                ✅ Store settings (80-impl)
                ✅ SCAM public pages: registry, profile, types, report form (83)
                ✅ Store Finance — coupons, orders drawer, addresses, bids, payouts (81-impl)
                ✅ Custom Fields L1/L2/L3 (84) + Sub-listings SC1–SC4 (85)
                ✅ Grouped listings GP1/GP2 (86) + Social feed S1–S5 (87)
                ✅ Search+Routes RC3+RC4 (88)
                ✅ Detail UX VD12 + J16/J17 + wishlist filter drawer (89a)
                ✅ FAQSection redesign + WhatsApp redesign + TS dedup (89b)
                🔄 AX1 constants done; useActionDispatch hook pending (90)
                🚀 ALPHA deployed to Vercel prod 2026-05-10 (file:./appkit local)

⚠️  Firebase fully reset 2026-05-10 — re-seed all collections via /demo/seed
⚠️  RBAC/BAN/SCAM schemas done (80-schema, additive) — UI deferred to sessions 102–110

PHASE               SESSIONS          STATUS
────────────────────────────────────────────────────────
Foundation          60–64             ✅ done
Carousel            65                ✅ done
Sections            66–67             ✅ done
Admin CRUD          68–75             ✅ done
Public Catalogue    76 + 76-infra     ✅ done
SEO + Bulk          82 + 82-ext       ✅ done
RBAC/BAN/SCAM sch.  80-schema         ✅ done
sellerId migration  81                ✅ done
Seller Products     77-impl           ✅ done
Cart Integrity      79-impl           ✅ done
User Account Core   78-impl           ✅ done
Store Settings      80-impl           ✅ done
SCAM public pages   83                ✅ done (⚠️ VD9/VD10 deferred)
──────── 🚀 ALPHA deployed to Vercel prod 2026-05-10 ────────────────
Store Finance       81-impl           ✅ done (post-alpha)
Content rewrites    83-cont           ✅ VD8/VD9/VD10 done (Session 83/84)
Custom Fields       84                ✅ L1, L2, L3 done
Sub-listings        85                ✅ SC1–SC4 done
Grouped Listings    86                ✅ GP1, GP2 done
Social Feed         87                ✅ S1–S5 done
Search+Routes       88                ✅ RC3, RC4 done
UX Polish           89a               ✅ VD12, J16, J17, wishlist filter
FAQ+WA redesign     89b               ✅ FAQSection, WhatsApp, @types/react
Action constants    90 (partial)      🔄 AX1 constants ✅; hook+migration ⏳
────────────────────────── upcoming (safe-first) ────────────────────
Complete AX1        90                🔄 useActionDispatch + panelStore
Color tokens        90-colors         ⏳ X7a, X7b
Layout tokens       91                ⏳ X8a, X8b
Action URLs+bars    92                ⏳ AX2, AX3
Extended sections   93                ⏳ EX1–EX5, YT1
Feature icons       94                ⏳ FI1–FI6
Bulk actions        95                ⏳ BK1–BK3
Query/Sieve         96                ⏳ Q1–Q6 (Firebase Function — higher risk)
Seed Scale          97–101            ⏳ P23–P31
RBAC UI             102–104           ⏳ RBAC1–RBAC10
Bans UI             105–107           ⏳ BAN1–BAN9
Scams UI (cont.)    108–110           ⏳ SCAM2,4,6,7,8
Deferred            111+              ⏳
────────────────────────────────────────────────────────
```
follow all rules and complete all tasks, prioritize pending tasks or tech debt first. check for tsc errors before proceeding to next task. update ascii diagrams after every session.

in the end recheck all the changes , update the tracker , prompt.md file , update our memory . update ascii diagrams and try to optimize and write better quality code so that we have more maintainability. also update or add the seed data and firebase indices and sieverjs and other config and the seedpanel entry for the same. make sure we use our html wrappers and themed contents with variables and no hardcoded text or breakpoints
then commit all changes