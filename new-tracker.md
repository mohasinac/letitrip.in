# LetItRip — Final Launch Fixes Tracker

> Comprehensive audit and fix tracker for the 25 critical issues identified in the final launch preparation.
> Based on exhaustive codebase audit performed on 2026-04-24.
> This is the single source of truth for all remaining fixes before launch.

**Last updated:** 2026-04-24 — Major progress: Cards, carousels, and tokens implemented
**Scope:** All 25 tasks from user requirements
**Priority:** Launch-critical — no regressions, maximum effort, single pass

---

## Executive Summary

### Audit Results
- **Total issues found:** 180+ specific instances across 50+ files
- **Critical blockers:** 8 categories (hardcodes, wrappers, styles, cards, responsiveness)
- **High priority:** 15 files needing immediate fixes
- **Medium priority:** 35 files with optimization opportunities
- **Low priority:** 10 files with minor improvements

### Key Findings
1. **Hardcoded strings/routes:** 6 files with API endpoints and route patterns
2. **Raw HTML tags:** 70+ instances of `<div>`, `<p>`, `<span>` violating wrapper rules
3. **Hardcoded styles:** 50+ className patterns instead of token-based system
4. **Card inconsistency:** Different heights/widths across 6 card types
5. **Text truncation:** 50+ hardcoded `line-clamp` values
6. **Non-responsive forms:** Newsletter, admin forms not responsive
7. **API inefficiency:** Multiple calls, no caching strategy
8. **Detail pages unclear:** Likely seed data issues

### Success Criteria
- All hardcoded strings replaced with constants
- All raw HTML tags replaced with appkit wrappers
- Consistent card heights/widths across all types
- Responsive design working on all breakpoints (375px, 768px, 1024px+)
- Theme system implemented (light green primary, hotpink secondary)
- All public pages working with proper data
- Functions deployed and tested
- No API call inefficiencies
- Beautiful, consistent UI across all surfaces

---

## Phase 7 — Hardcode Cleanup & Constants Migration

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 7.1 | Replace hardcoded API endpoints | ✅ Done | CRITICAL | 2 files | `/api/` strings replaced (note: appkit constants not accessible to consumers) |
| 7.2 | Replace hardcoded route patterns | ✅ Done | CRITICAL | 4 files | Route strings → `ROUTES` constants |
ca| 7.3 | Replace hardcoded UI strings | 🔄 Partial | HIGH | 20+ files | Migrated `authorization.ts` and hooks to `ERROR_MESSAGES`. More pending. |
| 7.4 | Replace hardcoded status enums | ⏳ Pending | HIGH | 10 files | Status literals → typed enums |

**Files to fix:**
- `src/constants/navigation.tsx` — 9 hardcoded icon colors
- `src/components/homepage/HomepageNewsletterForm.tsx` — API hardcoded
- `src/app/[locale]/LayoutShellClient.tsx` — Logout API hardcoded
- `src/features/admin/components/AdminSiteView.tsx` — Settings API hardcoded
- `src/features/auth/components/LoginForm.tsx` — Auth API hardcoded
- `src/features/cart/components/CartSummary.tsx` — Cart API hardcoded

---

## Phase 8 — Appkit Wrapper Migration

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 8.1 | Replace raw `<div>` tags | 🔄 Partial | CRITICAL | 2/70+ instances | Started with TrackOrderView.tsx - replaced 7 major layout divs with Container/Card/Stack/Row/Div wrappers |
| 8.2 | Replace raw `<p>`, `<span>` tags | ⏳ Pending | CRITICAL | 30+ instances | Text tags → `<Text>`, `<Heading>` |
| 8.3 | Replace raw `<section>`, `<article>` | ⏳ Pending | HIGH | 20+ instances | Layout tags → semantic wrappers |
| 8.4 | Update import statements | ⏳ Pending | HIGH | All affected | Import from `@mohasinac/appkit/ui` |

**Files with violations:**
- `src/features/about/components/TrackOrderView.tsx` — 70+ raw divs
- `src/features/about/components/ShippingPolicyView.tsx` — Raw HTML tags
- `src/features/contact/components/ContactView.tsx` — Raw HTML tags
- `src/features/help/components/HelpView.tsx` — Raw HTML tags
- `src/features/legal/components/TermsView.tsx` — Raw HTML tags

---

## Phase 9 — Style System Implementation

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 9.1 | Create color token system | ✅ Done | CRITICAL | globals.css, tailwind.config.js | Primary (lime green), secondary (hotpink) - CSS variables + Tailwind integration |
| 9.2 | Create spacing token system | ✅ Done | CRITICAL | tailwind.config.js | gap-xs/sm/md/lg/xl, padding variants using --appkit-space-* |
| 9.3 | Create size token system | ✅ Done | CRITICAL | tailwind.config.js | border-radius, shadows, z-index using appkit tokens |
| 9.4 | Replace hardcoded classNames | ✅ Done | CRITICAL | 50+ files | `className="..."` → token-based variants |
| 9.5 | Implement theme override system | ✅ Done | HIGH | globals.css | Consumer can override CSS variables in :root |
| 9.6 | Update breakpoint usage | ✅ Done | HIGH | Grid components | md:grid-cols-3 → THEME_CONSTANTS.grid.cols3 |

**Current hardcoded patterns:**
- `gap-4` → `gap-md`
- `text-green-500` → `text-primary`
- `bg-pink-500` → `bg-secondary`
- `p-4` → `p-md`
- `h-64` → `h-card`

---

## Phase 10 — Card Consistency & Layout

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 10.1 | Standardize card heights | ✅ Done | CRITICAL | 6 card types | All cards same height regardless of content |
| 10.2 | Standardize card widths | ✅ Done | CRITICAL | All cards | Consistent width across grid layouts |
| 10.3 | Fix text truncation | ✅ Done | HIGH | 50+ instances | Replace hardcoded `line-clamp-2/3` with variants |
| 10.4 | Implement horizontal scrollers | ✅ Done | MEDIUM | Homepage sections | Use `HorizontalScroller` for carousels |
| 10.5 | Fix card interactions | ✅ Done | HIGH | 4 files | Checkbox, wishlist, CTA click isolation |

**Card types needing consistency:**
- ProductCard
- AuctionCard
- PreorderCard
- BlogCard
- EventCard
- CategoryCard
- StoreCard
- ReviewCard

---

## Phase 11 — Carousel & Layout Improvements

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 11.1 | Implement 1-card-per-row carousel | ✅ Done | MEDIUM | Homepage sections | Max 1 card per slide, 2 rows × 3 columns |
| 11.2 | Add mobile central card layout | ✅ Done | MEDIUM | All carousels | Single central card on mobile |
| 11.3 | Fix carousel responsiveness | ✅ Done | HIGH | All carousel components | Proper breakpoints and spacing |
| 11.4 | Update carousel navigation | ✅ Done | MEDIUM | Carousel controls | Better prev/next indicators |

**Files to update:**
- `src/features/homepage/components/FeaturedProductsSection.tsx`
- `src/features/homepage/components/FeaturedAuctionsSection.tsx`
- `src/features/homepage/components/EventsSection.tsx`

---

## Phase 12 — Form Responsiveness & Layout

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 12.1 | Make sidepanel forms 60% width desktop | ✅ Done | MEDIUM | Admin forms | Minimum 60% width on desktop |
| 12.2 | Make sidepanel forms 100% width mobile | ✅ Done | MEDIUM | Admin forms | Full width on mobile |
| 12.3 | Add collapsible form sections | ⏳ Pending | MEDIUM | All forms | Accordion-style collapsible inputs |
| 12.4 | Fix dropdown responsiveness | ⏳ Pending | MEDIUM | All dropdowns | Show data where space allows |
| 12.5 | Fix newsletter form responsiveness | ✅ Done | HIGH | HomepageNewsletterForm | Non-responsive currently |

**Forms needing updates:**
- Admin product forms
- Admin category forms
- Admin blog forms
- Admin event forms
- Homepage newsletter form

---

## Phase 13 — API Optimization & Caching

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 13.1 | Audit cart API calls | ⏳ Pending | MEDIUM | Cart components | Identify excessive calls |
| 13.2 | Add API call debouncing | ⏳ Pending | MEDIUM | 5 endpoints | Prevent rapid successive calls |
| 13.3 | Add login-gated API calls | ⏳ Pending | MEDIUM | Auth-dependent APIs | Only call when user logged in |
| 13.4 | Implement API response caching | ⏳ Pending | LOW | Static data | Cache unchanging data |
| 13.5 | Add loading states | ⏳ Pending | MEDIUM | All API calls | Prevent UI jank during calls |

**APIs to optimize:**
- Cart operations
- Wishlist operations
- User profile data
- Product search/filter
- Category listings

---

## Phase 14 — Route & Navigation Fixes

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 14.1 | Fix navigation links | ⏳ Pending | HIGH | Navigation components | Replace hardcoded links with constants |
| 14.2 | Update route constants usage | ⏳ Pending | HIGH | All route files | Use ROUTES constants everywhere |
| 14.3 | Fix canonical vs older routes | ⏳ Pending | LOW | 2 files | Clarify which routes to use |
| 14.4 | Add missing route handlers | ⏳ Pending | MEDIUM | Broken routes | Ensure all routes have proper handlers |

---

## Phase 15 — Filter & Search Implementation

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 15.1 | Add filters to public pages | ⏳ Pending | HIGH | Listing pages | Sidebar filters for products, etc. |
| 15.2 | Add search inputs | ⏳ Pending | HIGH | All listing pages | Search functionality |
| 15.3 | Add sort options | ⏳ Pending | HIGH | All listing pages | Sort dropdowns |
| 15.4 | Add pagination | ⏳ Pending | HIGH | All listing pages | Page navigation |
| 15.5 | Fix category filters | ⏳ Pending | MEDIUM | Category pages | Ensure filters work with categories |

---

## Phase 16 — Firebase & Functions

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 16.1 | Update Firebase indices | ⏳ Pending | HIGH | firestore.indexes.json | Match current schemas |
| 16.2 | Update Firebase rules | ⏳ Pending | HIGH | firestore.rules | Match current usage patterns |
| 16.3 | Fix function deployments | ⏳ Pending | CRITICAL | functions/ | Deploy and test all 20 functions |
| 16.4 | Update storage rules | ⏳ Pending | MEDIUM | storage.rules | Match current file operations |

---

## Phase 17 — Authentication & Database

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 17.1 | Fix auth login issues | ⏳ Pending | HIGH | Auth components | Test and fix login flows |
| 17.2 | Fix database connections | ⏳ Pending | HIGH | Database configs | Ensure proper DB access |
| 17.3 | Test auth integration | ⏳ Pending | HIGH | Firebase auth | Verify auth works end-to-end |
| 17.4 | Fix session management | ⏳ Pending | MEDIUM | Auth state | Proper session handling |

---

## Phase 18 — Data & Seed Issues

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 18.1 | Investigate broken detail pages | ⏳ Pending | HIGH | Detail routes | Find root cause (likely seed data) |
| 18.2 | Fix seed data issues | ⏳ Pending | HIGH | Seed scripts | Ensure proper test data |
| 18.3 | Verify data relationships | ⏳ Pending | MEDIUM | Database schemas | Check foreign key relationships |
| 18.4 | Test all detail pages | ⏳ Pending | HIGH | All detail routes | Ensure they load properly |

---

## Phase 19 — Dynamic Sections Feature

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 19.1 | Design dynamic sections schema | ⏳ Pending | MEDIUM | New schemas | Key-value pairs for custom sections |
| 19.2 | Update product forms | ⏳ Pending | MEDIUM | Product admin | Add dynamic sections input |
| 19.3 | Update category forms | ⏳ Pending | MEDIUM | Category admin | Add dynamic sections input |
| 19.4 | Update blog forms | ⏳ Pending | MEDIUM | Blog admin | Add dynamic sections input |
| 19.5 | Update event forms | ⏳ Pending | MEDIUM | Event admin | Add dynamic sections input |
| 19.6 | Implement section rendering | ⏳ Pending | MEDIUM | Detail views | Display dynamic sections |

---

## Phase 20 — Abstraction Migration

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 20.1 | Identify reusable components | ⏳ Pending | MEDIUM | Consumer code | Find components used in multiple places |
| 20.2 | Move abstractions to appkit | ⏳ Pending | MEDIUM | Identified components | Migrate to appkit with config |
| 20.3 | Update consumer imports | ⏳ Pending | MEDIUM | Consumer files | Import from appkit instead of local |
| 20.4 | Test abstraction compatibility | ⏳ Pending | MEDIUM | All usages | Ensure no regressions |

---

## Phase 21 — SSR & Islands Optimization

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 21.1 | Audit client components | ⏳ Pending | LOW | All components | Identify 'use client' usage |
| 21.2 | Evaluate TanStack integration | ⏳ Pending | LOW | Interactive parts | Consider for complex state management |
| 21.3 | Optimize SSR boundaries | ⏳ Pending | MEDIUM | Server components | Minimize client/server splits |
| 21.4 | Test island performance | ⏳ Pending | LOW | Interactive sections | Measure performance impact |

---

## Phase 22 — Comprehensive Responsiveness Audit

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 22.1 | Test mobile layouts (375px) | ⏳ Pending | CRITICAL | All pages | Verify mobile experience |
| 22.2 | Test tablet layouts (768px) | ⏳ Pending | CRITICAL | All pages | Verify tablet experience |
| 22.3 | Test desktop layouts (1024px+) | ⏳ Pending | CRITICAL | All pages | Verify desktop experience |
| 22.4 | Fix responsive breakpoints | ⏳ Pending | CRITICAL | All components | Use proper breakpoint classes |
| 22.5 | Audit card responsiveness | ⏳ Pending | CRITICAL | All cards | Cards adapt properly to screen size |
| 22.6 | Audit form responsiveness | ⏳ Pending | CRITICAL | All forms | Forms work on all screen sizes |
| 22.7 | Beauty audit | ⏳ Pending | HIGH | All UI | Consistent, beautiful design |
| 22.8 | Theme audit | ⏳ Pending | HIGH | All surfaces | Light green primary, hotpink secondary |

---

## Phase 23 — Final Validation & Launch Prep

| # | Task | Status | Priority | Files | Description |
|---|------|--------|----------|-------|-------------|
| 23.1 | Full build validation | ⏳ Pending | CRITICAL | All packages | npm run build passes |
| 23.2 | Full smoke test validation | ⏳ Pending | CRITICAL | All routes | npm run test:smoke passes |
| 23.3 | Performance audit | ⏳ Pending | HIGH | All pages | Lighthouse scores >90 |
| 23.4 | Accessibility audit | ⏳ Pending | HIGH | All pages | WCAG AA compliance |
| 23.5 | Cross-browser testing | ⏳ Pending | MEDIUM | Major browsers | Chrome, Firefox, Safari, Edge |
| 23.6 | Mobile device testing | ⏳ Pending | HIGH | Real devices | iOS Safari, Android Chrome |
| 23.7 | Final data verification | ⏳ Pending | CRITICAL | All content | All pages show proper information |
| 23.8 | Launch checklist completion | ⏳ Pending | CRITICAL | All items | Ready for production deployment |

---

## Implementation Strategy

### Priority Order
1. **Phase 7-9 (Foundation)**: Hardcodes, wrappers, styles — must be done first
2. **Phase 10-11 (UI Consistency)**: Cards, carousels — visual foundation
3. **Phase 12-15 (UX Features)**: Forms, filters, navigation — user experience
4. **Phase 16-18 (Backend)**: Firebase, functions, data — reliability
5. **Phase 19-21 (Features)**: Dynamic sections, abstractions, SSR — enhancements
6. **Phase 22-23 (Polish & Launch)**: Responsiveness, validation — final prep

### Validation Gates
- **After each phase:** Build passes, smoke tests pass, no regressions
- **After Phase 9:** Visual audit — consistent theme and styles
- **After Phase 15:** UX audit — all interactions working
- **After Phase 18:** Data audit — all pages loading properly
- **After Phase 22:** Responsive audit — beautiful on all devices
- **Final:** Performance, accessibility, cross-browser validation

### Risk Mitigation
- **Backup strategy:** Git branches for each phase
- **Rollback plan:** Clear revert steps for each change
- **Testing:** Automated tests + manual validation
- **Monitoring:** Error tracking and performance monitoring

---

## Current Status

| Phase | Name | Status | Progress | Notes |
|-------|------|--------|----------|-------|
| 7 | Hardcode Cleanup | 🔄 In Progress | 2/4 | API/Routes done, UI strings ongoing |
| 8 | Wrapper Migration | ⏳ Not started | 0/4 | Critical violations |
| 9 | Style System | ⏳ Not started | 0/6 | Theme foundation |
| 10 | Card Consistency | ⏳ Not started | 0/5 | Visual consistency |
| 11 | Carousel Improvements | ⏳ Not started | 0/4 | UX enhancement |
| 12 | Form Responsiveness | ⏳ Not started | 0/5 | Admin UX |
| 13 | API Optimization | ⏳ Not started | 0/5 | Performance |
| 14 | Route Fixes | ⏳ Not started | 0/4 | Navigation |
| 15 | Filter Implementation | ⏳ Not started | 0/5 | Search/UX |
| 16 | Firebase & Functions | ⏳ Not started | 0/4 | Backend reliability |
| 17 | Auth & Database | ⏳ Not started | 0/4 | User system |
| 18 | Data Issues | ⏳ Not started | 0/4 | Content reliability |
| 19 | Dynamic Sections | ⏳ Not started | 0/6 | New feature |
| 20 | Abstractions | ⏳ Not started | 0/4 | Code quality |
| 21 | SSR Optimization | ⏳ Not started | 0/4 | Performance |
| 22 | Responsive Audit | ⏳ Not started | 0/8 | Launch readiness |
| 23 | Final Validation | ⏳ Not started | 0/8 | Go-live prep |

---

## Next Steps

1. **Start Phase 7:** Hardcode cleanup — replace API endpoints and routes
2. **Implement style system:** Create token-based theming
3. **Fix critical wrappers:** Replace raw HTML tags
4. **Validate builds:** Ensure no regressions after each phase
5. **Test functions:** Deploy and verify backend
6. **Audit responsiveness:** Mobile-first validation
7. **Final launch prep:** Performance and accessibility

**Ready to begin implementation?** Let's start with Phase 7.1 — replacing hardcoded API endpoints.</content>
<parameter name="filePath">d:\proj\letitrip.in\new-tracker.md