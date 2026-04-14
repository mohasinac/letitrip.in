# Components, Hooks, Features and API Migration Log

---

## Phase Tracker

> Every phase: (1) create generic version in appkit → (2) update all letitrip callers → (3) **delete the letitrip file** → (4) sync appkit to node_modules → (5) `tsc --noEmit` must stay at 0 errors.
>
> After **all phases complete**: run `npm run dev` inside `d:\proj\appkit` for live watch.

| Phase | Files | Focus | Status |
|-------|-------|-------|--------|
| [P01](#phase-01--core-form-inputs--feedback) | 10 | Form primitives: Input, Select, Textarea, Slider, Form, Checkbox, Radio, Toggle + Modal, Toast | ✅ |
| [P02](#phase-02--ui-primitives) | 10 | Card, EmptyState, Dropdown, DynamicSelect, Menu, Avatar, RoleBadge, SkipToMain, Tabs, FilterDrawer | ✅ |
| [P03](#phase-03--infrastructure-components) | 10 | ErrorBoundary, ZodSetup, LayoutClient, FormField, RowActionMenu, PasswordStrengthIndicator, DashboardStatsCard, AvatarDisplay, AvatarUpload, EventBanner | ✅ |
| [P04](#phase-04--media--filter-ui) | 10 | MediaImage, MediaAvatar, MediaLightbox, MediaVideo, ImageGallery, FlowDiagram, FilterFacetSection, BaseListingCard, FilterPanel, SwitchFilter | ✅ |
| [P05](#phase-05--feature-filter-components--product-ui) | 10 | BlogFilters, EventFilters, OrderFilters, ProductFilters, ReviewFilters, RangeFilter, ProductSortBar, ProductTableColumns, InteractiveProductCard, ProductForm | ✅ |
| [P06](#phase-06--layout-shell-part-1) | 10 | NavItem, TitleBar, TitleBarLayout, BottomActions, BottomNavbar, BottomNavLayout, Breadcrumbs, AutoBreadcrumbs, Sidebar, SidebarLayout | 🔄 (5/10) |
| [P07](#phase-07--layout-shell-part-2--core-hooks) | 10 | Footer, FooterLayout, MainNavbar, NavbarLayout, InteractiveStoreCard + useUrlTable, useUnsavedChanges, useLogout, useRBAC, useMessage | ⬜ |
| [P08](#phase-08--auth--media-hooks) | 10 | useMediaAbort, useMediaCrop, useMediaTrim, useAuthEvent, useBecomeSeller, useBottomActions, useBrands, useCategorySelector, useNotifications, useSiteSettings | ⬜ |
| [P09](#phase-09--cart--checkout-hooks) | 10 | useAddresses, useAddressForm, useAddressSelector, useAddToCart, useCartCount, useGuestCart, useGuestCartMerge, useCheckout, useCouponValidate, usePaymentEvent | ⬜ |
| [P10](#phase-10--social--utility-hooks) | 10 | useChat, useFaqVote, useHomepageReviews, useHomepageSections, useNavSuggestions, useNewsletter, useProductReviews, useProfile, useProfileStats, usePublicProfile | ⬜ |
| [P11](#phase-11--remaining-hooks) | 9 | useRazorpay, useRealtimeEvent, useRelatedProducts, useSellerStorefront, useStoreAddressSelector, useWishlistToggle, useBulkEvent, useAuth (diff), usePaymentEvent | ⬜ |
| [P12](#phase-12--repositories-quick-wins) | 10 | Delete copilot-log + newsletter duplicates; move address, bid, blog, carousel, cart, categories, chat, coupons repos | ⬜ |
| [P13](#phase-13--repositories-part-2) | 10 | event, eventEntry, failed-checkout, faqs, homepage-sections, notification, offer, order, payout, product | ⬜ |
| [P14](#phase-14--repositories-part-3--db-schema) | 10 | review, session, site-settings, sms-counter, store, store-address, token, unit-of-work, user, wishlist repos | ⬜ |
| [P15](#phase-15--db-schema-migration) | 10 | 10 of 25 schema files → appkit feature schemas | ⬜ |
| [P16](#phase-16--db-schema-migration-cont) | 10 | Remaining 15 schema files + all 21 seed-data files start | ⬜ |
| [P17](#phase-17--seed-data--helpers--lib) | 10 | Remaining seed files + helpers/auth, helpers/logging, helpers/validation + lib/firebase/auth-helpers, lib/query, lib/tokens | ⬜ |
| [P18](#phase-18--lib-logic-migration) | 10 | lib/email, lib/encryption, lib/pii, lib/api, lib/consent-otp, lib/media/finalize, lib/monitoring, lib/server-logger, lib/validation, constants/theme+rbac | ⬜ |
| [P19](#phase-19--constants--features-small) | 10 | constants/messages + ui-labels + faq + homepage-data + address; features: wishlist, promotions, reviews, faq, contact | ⬜ |
| [P20](#phase-20--features-medium) | 10 | features: search, blog, categories, about, copilot, stores (components), stores (hooks+types+utils), auth components | ⬜ |
| [P21](#phase-21--features-cart) | 10 | features/cart: all 16 components + 4 hooks | ⬜ |
| [P22](#phase-22--features-events-part-1) | 10 | features/events: 10 of 22 components | ⬜ |
| [P23](#phase-23--features-events-part-2) | 10 | features/events: remaining 12 components + 9 hooks + 4 constants + types | ⬜ |
| [P24](#phase-24--features-homepage) | 10 | features/homepage: 10 of 22 section components | ⬜ |
| [P25](#phase-25--features-homepage-cont) | 10 | features/homepage: remaining 12 components | ⬜ |
| [P26](#phase-26--features-products-part-1) | 10 | features/products: 10 of 16 components + hooks | ⬜ |
| [P27](#phase-27--features-products-part-2) | 10 | features/products: remaining 6 components | ⬜ |
| [P28](#phase-28--features-user-part-1) | 10 | features/user: 10 of 22 components | ⬜ |
| [P29](#phase-29--features-user-part-2) | 10 | features/user: remaining 12 components + 4 hooks + server.ts + lib | ⬜ |
| [P30](#phase-30--features-seller-part-1) | 10 | features/seller: 10 of 28 components | ⬜ |
| [P31](#phase-31--features-seller-part-2) | 10 | features/seller: remaining 18 components | ⬜ |
| [P32](#phase-32--features-seller-hooks) | 10 | features/seller: all 13 hooks | ⬜ |
| [P33](#phase-33--features-admin-part-1) | 10 | features/admin: 10 views/forms | ⬜ |
| [P34](#phase-34--features-admin-part-2) | 10 | features/admin: 10 more views/forms/columns | ⬜ |
| [P35](#phase-35--features-admin-hooks--api-route-audit) | 10 | features/admin: 19 hooks; api route audit batch 1 | ⬜ |
| [P36](#phase-36--api-route-audit-batch-2) | 10 | api route audit: replace @/db + @/repositories in 26 more [id] routes | ⬜ |
| [P37](#phase-37--api-route-audit-final) | 10 | api route audit: remaining [id] routes + final tsc clean | ⬜ |
| **FINAL** | — | `npm run dev` in appkit; smoke test; tsc 0; commit | ⬜ |

**Total files to migrate/delete: ~370+ letitrip files**

---

## Phase Detail

Each phase follows this exact workflow:

```
1. For each file in the phase:
   a. Read the letitrip source file
   b. Create/update the generic appkit version (quality contract: generic, themed, auth-aware, extensible, accessible, i18n-safe)
   c. Find all letitrip callers: grep -r "from '@/components/..." src/
   d. Update every caller import to @mohasinac/appkit/...
   e. Delete the letitrip file
2. Copy appkit/src → letitrip node_modules: Copy-Item -Path "d:\proj\appkit\src" -Destination "d:\proj\letitrip.in\node_modules\@mohasinac\appkit\" -Recurse -Force
3. Run: cd d:\proj\letitrip.in ; npx tsc --noEmit  → must stay 0 errors
4. Update phase status to ✅ in this tracker
5. Commit: "feat(migration): P0X - <phase name>"
```

---

### Phase 01 — Core Form Inputs + Feedback

**Goal:** Replace all letitrip form primitives and feedback overlays with appkit versions. These are used in nearly every form across the app — completing this phase unblocks all subsequent component migrations.

**Quality notes:**
- `Input`, `Select`, `Textarea`, `Slider` must accept `variant` prop (`default` | `ghost` | `error`) using token classes
- `Form` wraps react-hook-form `FormProvider` — must remain compatible
- `Modal` must accept `size`, `title`, `actions`, and `children` slots; auth-gating via `open` prop is caller's responsibility
- `Toast` must be provider-backed (`<ToastProvider>` context); letitrip's `useToast` call sites must point to appkit toast context
- `Checkbox`, `Radio`, `Toggle` must expose `checked`, `onChange`, `disabled`, and `label` as first-class props

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/components/forms/Input.tsx` | ✅ delete | `appkit/ui/components/Input` |
| 2 | `src/components/forms/Select.tsx` | ✅ delete | `appkit/ui/components/Select` |
| 3 | `src/components/forms/Textarea.tsx` | ✅ delete | `appkit/ui/components/Textarea` |
| 4 | `src/components/forms/Slider.tsx` | ✅ delete | `appkit/ui/components/Slider` |
| 5 | `src/components/forms/Form.tsx` | ✅ delete | `appkit/ui/components/Form` |
| 6 | `src/components/feedback/Modal.tsx` | ✅ delete | `appkit/ui/components/Modal` — align API |
| 7 | `src/components/feedback/Toast.tsx` | ✅ delete | `appkit/ui/feedback/Toast` (create) |
| 8 | `src/components/forms/Checkbox.tsx` | ✅ delete | `appkit/ui/components/Checkbox` (create) |
| 9 | `src/components/forms/Radio.tsx` | ✅ delete | `appkit/ui/components/Radio` (create) |
| 10 | `src/components/forms/Toggle.tsx` | ✅ delete | `appkit/ui/components/Toggle` (create) |

**Phase 01 status: ✅ Completed**

---

### Phase 02 — UI Primitives

**Goal:** Move general-purpose UI atoms that back filters, listings, and navigation.

**Quality notes:**
- `Card` must accept `variant` (`flat` | `outlined` | `elevated`) + `padding` prop; no hard-coded shadows
- `EmptyState` accepts `icon`, `title`, `description`, `action` slots
- `Dropdown` / `Menu` accept `items: MenuItem[]` + `trigger` slot; keyboard navigation built-in
- `Avatar` accepts `src`, `fallback`, `size` (`xs`|`sm`|`md`|`lg`); uses `<Img>` from appkit, no raw `<img>`
- `RoleBadge` accepts `role: string` and maps to token color via `roleColorMap` config prop
- `Tabs` must align API with existing `TabStrip` or replace it — pick one canonical name for both
- `FilterDrawer` accepts generic `children` + `title`; state controlled by caller

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/components/ui/Card.tsx` | ✅ delete | `appkit/ui/components/Card` (create) |
| 2 | `src/components/ui/EmptyState.tsx` | ✅ delete | `appkit/ui/components/EmptyState` (create) |
| 3 | `src/components/ui/Dropdown.tsx` | ✅ delete | `appkit/ui/components/Dropdown` (create) |
| 4 | `src/components/ui/DynamicSelect.tsx` | ✅ delete | `appkit/ui/components/DynamicSelect` (create) |
| 5 | `src/components/ui/Menu.tsx` | ✅ delete | `appkit/ui/components/Menu` (create) |
| 6 | `src/components/ui/Avatar.tsx` | ✅ delete | `appkit/ui/components/Avatar` (create) |
| 7 | `src/components/ui/RoleBadge.tsx` | ✅ delete | `appkit/ui/components/RoleBadge` (create) |
| 8 | `src/components/ui/SkipToMain.tsx` | ✅ delete | `appkit/ui/components/SkipToMain` (create) |
| 9 | `src/components/ui/Tabs.tsx` | ✅ delete | merge/align with `appkit/ui/components/TabStrip` |
| 10 | `src/components/ui/FilterDrawer.tsx` | ✅ delete | `appkit/ui/components/FilterDrawer` (create) |

**Phase 02 status: ✅ Completed**

---

### Phase 03 — Infrastructure Components

**Goal:** Move cross-cutting infrastructure components: error handling, layout client, form field wrapper, admin table sugar, and auth-adjacent display.

**Quality notes:**
- `ErrorBoundary` must be RSC-compatible (class component client boundary); accepts `fallback` render-prop
- `ZodSetup` just calls `z.setErrorMap(zodI18nMap)` — must accept `locale` prop injected by letitrip
- `LayoutClient` wraps all client providers; accepts `providers` prop array or children — no letitrip-specific providers hard-coded
- `FormField` wraps label + input + error message; accepts `label`, `error`, `hint`, `required` props
- `RowActionMenu` accepts `actions: { label, onClick, icon?, destructive? }[]`
- `DashboardStatsCard` accepts `stats: { label, value, delta?, icon? }[]` — no hard-coded field names

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/components/ErrorBoundary.tsx` | ✅ delete | `appkit/next/ErrorBoundary` (create) |
| 2 | `src/components/ZodSetup.tsx` | ✅ delete | `appkit/validation/ZodSetup` (create) |
| 3 | `src/components/LayoutClient.tsx` | ✅ delete | `appkit/features/layout/LayoutClient` (create) |
| 4 | `src/components/FormField.tsx` | ✅ delete | `appkit/ui/components/FormField` (create) |
| 5 | `src/components/RowActionMenu.tsx` | ✅ delete | `appkit/ui/components/RowActionMenu` (create) |
| 6 | `src/components/PasswordStrengthIndicator.tsx` | ✅ delete | `appkit/ui/components/PasswordStrengthIndicator` (create) |
| 7 | `src/components/DashboardStatsCard.tsx` | ✅ delete | merge with `appkit/ui/components/StatsGrid` |
| 8 | `src/components/AvatarDisplay.tsx` | ✅ delete | `appkit/ui/components/AvatarDisplay` (create) |
| 9 | `src/components/AvatarUpload.tsx` | ✅ delete | `appkit/features/media/AvatarUpload` — must wire `onAbort` |
| 10 | `src/components/EventBanner.tsx` | ✅ delete | `appkit/features/events/EventBanner` (create) |

**Phase 03 status: ✅ Completed**

---

### Phase 04 — Media + Filter UI

**Quality notes:**
- `MediaImage` / `MediaAvatar` / `MediaVideo` accept `storageProvider` prop (injected by letitrip registry) — no Firebase SDK calls hard-coded
- `MediaLightbox` merges with existing `ImageLightbox` in appkit — unify API (`items`, `initialIndex`)
- `BaseListingCard` is the generic card skeleton; accepts `image`, `title`, `subtitle`, `badge`, `actions` slots
- `FilterFacetSection` accepts `label`, `children`; themed collapse/expand built in

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/components/media/MediaImage.tsx` | ✅ delete | `appkit/features/media/MediaImage` (create) |
| 2 | `src/components/media/MediaAvatar.tsx` | ✅ delete | `appkit/features/media/MediaAvatar` (create) |
| 3 | `src/components/media/MediaLightbox.tsx` | ✅ delete | merge → `appkit/ui/components/ImageLightbox` |
| 4 | `src/components/media/MediaVideo.tsx` | ✅ delete | `appkit/features/media/MediaVideo` (create) |
| 5 | `src/components/ui/ImageGallery.tsx` | ✅ delete | merge → `appkit/ui/components/ImageLightbox` |
| 6 | `src/components/ui/FlowDiagram.tsx` | ✅ delete | `appkit/ui/components/FlowDiagram` (create) |
| 7 | `src/components/ui/FilterFacetSection.tsx` | ✅ delete | `appkit/ui/components/FilterFacetSection` (create) |
| 8 | `src/components/ui/BaseListingCard.tsx` | ✅ delete | `appkit/ui/components/BaseListingCard` (create) |
| 9 | `src/components/filters/FilterPanel.tsx` | ✅ delete | `appkit/ui/components/FilterPanel` (create) |
| 10 | `src/components/filters/SwitchFilter.tsx` | ✅ delete | `appkit/ui/components/SwitchFilter` (create) |

**Phase 04 status: ✅ Completed**

---

### Phase 05 — Feature Filter Components + Product UI

**Quality notes:**
- Each entity filter (`BlogFilters`, `EventFilters`, etc.) must live in its feature dir in appkit; letitrip passes `onFilterChange` + initial filter state
- `ProductSortBar` merges into `appkit/ui/components/SortDropdown` — accepts `options: SortOption[]`
- `ProductTableColumns` becomes a `getProductTableColumns(config)` factory exported from appkit — no letitrip column labels hard-coded
- `InteractiveProductCard` folds into `appkit/features/products/ProductCard` as an `interactive` variant prop

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/components/filters/BlogFilters.tsx` | ✅ delete | `appkit/features/blog/components/BlogFilters` |
| 2 | `src/components/filters/EventFilters.tsx` | ✅ delete | `appkit/features/events/components/EventFilters` |
| 3 | `src/components/filters/OrderFilters.tsx` | ✅ delete | `appkit/features/orders/components/OrderFilters` |
| 4 | `src/components/filters/ProductFilters.tsx` | ✅ delete | `appkit/features/products/components/ProductFilters` |
| 5 | `src/components/filters/ReviewFilters.tsx` | ✅ delete | `appkit/features/reviews/components/ReviewFilters` |
| 6 | `src/components/filters/RangeFilter.tsx` | ✅ delete | merge → `appkit/ui/components/Slider` |
| 7 | `src/components/products/ProductSortBar.tsx` | ✅ delete | merge → `appkit/ui/components/SortDropdown` |
| 8 | `src/components/products/ProductTableColumns.tsx` | ✅ delete | `appkit/features/products/schema/productTableColumns` |
| 9 | `src/components/products/InteractiveProductCard.tsx` | ✅ delete | `appkit/features/products/ProductCard` interactive variant |
| 10 | `src/components/products/ProductForm.tsx` | ✅ delete | `appkit/features/products/components/ProductForm` |

**Phase 05 status: ✅ Completed**

---

### Phase 06 — Layout Shell Part 1

**Quality notes:**
- All layout components accept `config: SiteConfig` or specific props — never reads from letitrip constants directly
- `NavItem` accepts `href`, `label`, `icon?`, `badge?`, `active?`; active state derived from `usePathname` in appkit
- `Sidebar` accepts `items: NavItem[]`, `header` slot, `footer` slot, `requiredRole?`
- `BottomNavbar` accepts `items: BottomNavItem[]` (max 5); badge counts from appkit context
- `Breadcrumbs` + `AutoBreadcrumbs` both backed by a `BreadcrumbContext` set by appkit layouts; auto-version reads Next.js `usePathname` and a `routeLabels` config prop
- All layouts use `<Nav>`, `<Header>`, `<Footer>`, `<Aside>` appkit wrappers — never raw tags

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/components/layout/NavItem.tsx` | ✅ delete | `appkit/features/layout/NavItem` |
| 2 | `src/components/layout/TitleBar.tsx` | ✅ delete | `appkit/features/layout/TitleBar` (create) |
| 3 | `src/components/layout/TitleBarLayout.tsx` | ✅ delete | `appkit/features/layout/TitleBarLayout` |
| 4 | `src/components/layout/BottomActions.tsx` | ✅ delete | `appkit/features/layout/BottomActions` (create) |
| 5 | `src/components/layout/BottomNavbar.tsx` | ✅ delete | `appkit/features/layout/BottomNavbar` (create) |
| 6 | `src/components/layout/BottomNavLayout.tsx` | ✅ delete | `appkit/features/layout/BottomNavLayout` |
| 7 | `src/components/layout/Breadcrumbs.tsx` | ✅ delete | merge → `appkit/ui/components/Breadcrumb` |
| 8 | `src/components/layout/AutoBreadcrumbs.tsx` | ✅ delete | `appkit/features/layout/AutoBreadcrumbs` (create) |
| 9 | `src/components/layout/Sidebar.tsx` | ✅ delete | `appkit/features/layout/Sidebar` (create) |
| 10 | `src/components/layout/SidebarLayout.tsx` | ✅ delete | `appkit/features/layout/SidebarLayout` |

**Phase 06 status: 🔄 In progress (5/10 complete)**

Completed in this batch:
- `src/components/layout/TitleBarLayout.tsx` → appkit (`@mohasinac/appkit/features/layout`)
- `src/components/layout/BottomNavLayout.tsx` → appkit (`@mohasinac/appkit/features/layout`)
- `src/components/layout/Breadcrumbs.tsx` → appkit (`@mohasinac/appkit/features/layout`)
- `src/components/layout/AutoBreadcrumbs.tsx` → appkit (`@mohasinac/appkit/features/layout`)
- `src/components/layout/SidebarLayout.tsx` → appkit (`@mohasinac/appkit/features/layout`)

Remaining in P06:
- `NavItem`
- `TitleBar`
- `BottomActions`
- `BottomNavbar`
- `Sidebar`

---

### Phase 07 — Layout Shell Part 2 + Core Hooks

**Quality notes:**
- `Footer` accepts `links: FooterSection[]`, `socialLinks`, `copyright` — all injected by letitrip `site.ts`
- `MainNavbar` accepts `navItems`, `logo`, `authSlot`, `cartSlot`, `searchSlot` — no letitrip nav tree hard-coded
- `useUrlTable` / `useUnsavedChanges` likely already in appkit — confirm API match, delete if duplicate
- `useLogout` calls appkit auth provider `signOut()` — no letitrip-specific logic
- `useRBAC` reads user role from appkit `AuthContext`; letitrip configures roles via `features.config.ts`

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/components/layout/Footer.tsx` | ✅ delete | `appkit/features/layout/Footer` (create) |
| 2 | `src/components/layout/FooterLayout.tsx` | ✅ delete | `appkit/features/layout/FooterLayout` |
| 3 | `src/components/layout/MainNavbar.tsx` | ✅ delete | `appkit/features/layout/MainNavbar` (create) |
| 4 | `src/components/layout/NavbarLayout.tsx` | ✅ delete | `appkit/features/layout/NavbarLayout` |
| 5 | `src/components/stores/InteractiveStoreCard.tsx` | ✅ delete | `appkit/features/stores/StoreCard` interactive variant |
| 6 | `src/hooks/useUrlTable.ts` | ✅ delete | `appkit/react/hooks/useUrlTable` |
| 7 | `src/hooks/useUnsavedChanges.ts` | ✅ delete | `appkit/react/hooks/useUnsavedChanges` |
| 8 | `src/hooks/useLogout.ts` | ✅ delete | `appkit/features/auth/hooks/useLogout` (create) |
| 9 | `src/hooks/useRBAC.ts` | ✅ delete | `appkit/features/auth/hooks/useRBAC` (create) |
| 10 | `src/hooks/useMessage.ts` | ✅ delete | `appkit/react/hooks/useMessage` (create) |

**Phase 07 status: ⬜ Not started**

---

### Phase 08 — Auth + Media Hooks

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `useMediaAbort` fn in `useMediaUpload.ts` | ✅ delete fn | `appkit/features/media/hooks/useMediaAbort` (endpoint via config) |
| 2 | `useMediaCrop` fn | ✅ delete fn | align generics in `appkit/features/media/hooks/useMediaCrop` |
| 3 | `useMediaTrim` fn | ✅ delete fn | align generics in `appkit/features/media/hooks/useMediaTrim` |
| 4 | `src/hooks/useAuthEvent.ts` | ✅ delete | `appkit/features/auth/hooks/useAuthEvent` (create) |
| 5 | `src/hooks/useBecomeSeller.ts` | ✅ delete | `appkit/features/seller/hooks/useBecomeSeller` (create) |
| 6 | `src/hooks/useBottomActions.ts` | ✅ delete | `appkit/features/layout/hooks/useBottomActions` (create) |
| 7 | `src/hooks/useBrands.ts` | ✅ delete | `appkit/features/products/hooks/useBrands` (create) |
| 8 | `src/hooks/useCategorySelector.ts` | ✅ delete | `appkit/features/categories/hooks/useCategorySelector` (create) |
| 9 | `src/hooks/useNotifications.ts` | ✅ delete | `appkit/features/notifications/hooks/useNotifications` (create feature) |
| 10 | `src/hooks/useSiteSettings.ts` | ✅ delete | `appkit/core/hooks/useSiteSettings` (backed by site-config.ts) |

**Phase 08 status: ⬜ Not started**

---

### Phase 09 — Cart + Checkout Hooks

**Quality notes:** All hooks call appkit repositories via `registry.get('cart')` etc — never `fetch('@/api/cart')` directly.

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/hooks/useAddresses.ts` | ✅ delete | `appkit/features/account/hooks/useAddresses` |
| 2 | `src/hooks/useAddressForm.ts` | ✅ delete | `appkit/features/account/hooks/useAddressForm` |
| 3 | `src/hooks/useAddressSelector.ts` | ✅ delete | `appkit/features/account/hooks/useAddressSelector` |
| 4 | `src/hooks/useAddToCart.ts` | ✅ delete | `appkit/features/cart/hooks/useAddToCart` — diff APIs first |
| 5 | `src/hooks/useCartCount.ts` | ✅ delete | `appkit/features/cart/hooks/useCartCount` — diff APIs first |
| 6 | `src/hooks/useGuestCart.ts` | ✅ delete | `appkit/features/cart/hooks/useGuestCart` — diff APIs first |
| 7 | `src/hooks/useGuestCartMerge.ts` | ✅ delete | `appkit/features/cart/hooks/useGuestCartMerge` — diff APIs first |
| 8 | `src/hooks/useCheckout.ts` | ✅ delete | `appkit/features/checkout/hooks/useCheckout` — diff APIs first |
| 9 | `src/hooks/useCouponValidate.ts` | ✅ delete | `appkit/features/promotions/hooks/useCouponValidate` |
| 10 | `src/hooks/usePaymentEvent.ts` | ✅ delete | `appkit/features/payments/hooks/usePaymentEvent` |

**Phase 09 status: ⬜ Not started**

---

### Phase 10 — Social + Utility Hooks

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/hooks/useChat.ts` | ✅ delete | `appkit/features/chat/hooks/useChat` (create feature) |
| 2 | `src/hooks/useFaqVote.ts` | ✅ delete | `appkit/features/faq/hooks/useFaqVote` |
| 3 | `src/hooks/useHomepageReviews.ts` | ✅ delete | `appkit/features/homepage/hooks/useHomepageReviews` |
| 4 | `src/hooks/useHomepageSections.ts` | ✅ delete | `appkit/features/homepage/hooks/useHomepageSections` — diff APIs |
| 5 | `src/hooks/useNavSuggestions.ts` | ✅ delete | `appkit/features/search/hooks/useNavSuggestions` |
| 6 | `src/hooks/useNewsletter.ts` | ✅ delete | `appkit/features/homepage/hooks/useNewsletter` |
| 7 | `src/hooks/useProductReviews.ts` | ✅ delete | `appkit/features/reviews/hooks/useProductReviews` — diff APIs |
| 8 | `src/hooks/useProfile.ts` | ✅ delete | `appkit/features/account/hooks/useProfile` — diff APIs |
| 9 | `src/hooks/useProfileStats.ts` | ✅ delete | `appkit/features/account/hooks/useProfileStats` |
| 10 | `src/hooks/usePublicProfile.ts` | ✅ delete | `appkit/features/account/hooks/usePublicProfile` |

**Phase 10 status: ⬜ Not started**

---

### Phase 11 — Remaining Hooks

| # | Letitrip file | Delete | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/hooks/useRazorpay.ts` | ✅ delete | `appkit/providers/payment/useRazorpay` (generic, provider-injected) |
| 2 | `src/hooks/useRealtimeEvent.ts` | ✅ delete | `appkit/features/events/hooks/useRealtimeEvent` |
| 3 | `src/hooks/useRelatedProducts.ts` | ✅ delete | `appkit/features/products/hooks/useRelatedProducts` — diff APIs |
| 4 | `src/hooks/useSellerStorefront.ts` | ✅ delete | `appkit/features/seller/hooks/useSellerStorefront` — diff APIs |
| 5 | `src/hooks/useStoreAddressSelector.ts` | ✅ delete | `appkit/features/stores/hooks/useStoreAddressSelector` |
| 6 | `src/hooks/useWishlistToggle.ts` | ✅ delete | `appkit/features/wishlist/hooks/useWishlistToggle` — diff APIs |
| 7 | `src/hooks/useBulkEvent.ts` | ✅ delete | merge → `appkit/react/hooks/useBulkAction` |
| 8 | `src/hooks/useAuth.ts` | ✅ delete | `appkit/features/auth/useAuth` — diff APIs |

**Phase 11 status: ⬜ Not started**

---

### Phase 12 — Repositories Quick Wins

| # | Letitrip file | Action | appkit destination |
|---|---------------|--------|--------------------|
| 1 | `src/repositories/copilot-log.repository.ts` | ✅ delete (appkit already has it) | `appkit/core/copilot-log.repository.ts` |
| 2 | `src/repositories/newsletter.repository.ts` | ✅ delete (appkit already has it) | `appkit/core/newsletter.repository.ts` |
| 3 | `src/repositories/base.repository.ts` | ✅ delete | use `appkit/contracts/repository.ts` base |
| 4 | `src/repositories/address.repository.ts` | ✅ move | `appkit/features/account/` |
| 5 | `src/repositories/bid.repository.ts` | ✅ move | `appkit/features/auctions/` |
| 6 | `src/repositories/blog.repository.ts` | ✅ move | `appkit/features/blog/` |
| 7 | `src/repositories/carousel.repository.ts` | ✅ move | `appkit/features/cms/` |
| 8 | `src/repositories/cart.repository.ts` | ✅ move | `appkit/features/cart/` |
| 9 | `src/repositories/categories.repository.ts` | ✅ move | `appkit/features/categories/` |
| 10 | `src/repositories/chat.repository.ts` | ✅ move | `appkit/features/chat/` (create feature) |

**Phase 12 status: ⬜ Not started**

---

### Phase 13 — Repositories Part 2

| # | Letitrip file | appkit destination |
|---|---------------|--------------------|
| 1 | `src/repositories/coupons.repository.ts` | `appkit/features/promotions/` |
| 2 | `src/repositories/event.repository.ts` | `appkit/features/events/` |
| 3 | `src/repositories/eventEntry.repository.ts` | `appkit/features/events/` |
| 4 | `src/repositories/failed-checkout.repository.ts` | `appkit/features/checkout/` |
| 5 | `src/repositories/faqs.repository.ts` | `appkit/features/faq/` |
| 6 | `src/repositories/homepage-sections.repository.ts` | `appkit/features/homepage/` |
| 7 | `src/repositories/notification.repository.ts` | `appkit/features/notifications/` |
| 8 | `src/repositories/offer.repository.ts` | `appkit/features/products/` |
| 9 | `src/repositories/order.repository.ts` | `appkit/features/orders/` |
| 10 | `src/repositories/payout.repository.ts` | `appkit/features/seller/` |

**Phase 13 status: ⬜ Not started**

---

### Phase 14 — Repositories Part 3 + DB Schema

| # | Letitrip file | appkit destination |
|---|---------------|--------------------|
| 1 | `src/repositories/product.repository.ts` | `appkit/features/products/` |
| 2 | `src/repositories/review.repository.ts` | `appkit/features/reviews/` |
| 3 | `src/repositories/session.repository.ts` | `appkit/features/auth/` |
| 4 | `src/repositories/site-settings.repository.ts` | consolidate → `appkit/core/site-config.ts` |
| 5 | `src/repositories/sms-counter.repository.ts` | `appkit/features/auth/` |
| 6 | `src/repositories/store.repository.ts` | `appkit/features/stores/` |
| 7 | `src/repositories/store-address.repository.ts` | `appkit/features/stores/` |
| 8 | `src/repositories/token.repository.ts` | `appkit/features/auth/` |
| 9 | `src/repositories/unit-of-work.ts` | `appkit/core/` |
| 10 | `src/repositories/user.repository.ts` / `wishlist.repository.ts` | `appkit/features/account/` / `wishlist/` |

**Phase 14 status: ⬜ Not started**

---

### Phase 15 — DB Schema Migration

Move 10 of 25 Firestore schema files to `appkit/features/*/schema/*.schema.ts`. No letitrip callers need updating if they switch to appkit import paths.

| # | Letitrip file | appkit destination |
|---|---------------|--------------------|
| 1–10 | `src/db/schema/*.ts` (first 10 alphabetically) | `appkit/features/*/schema/` |

**Phase 15 status: ⬜ Not started**

---

### Phase 16 — DB Schema Migration (cont) + Seed Start

| # | Item | appkit destination |
|---|------|--------------------|
| 1–15 | remaining 15 `src/db/schema/*.ts` | `appkit/features/*/schema/` |
| 16+ | first 5 `src/db/seed-data/*.ts` | `appkit/src/seed/` |

**Phase 16 status: ⬜ Not started**

---

### Phase 17 — Seed Data + Helpers + Lib Start

| # | Letitrip file | appkit destination |
|---|---------------|--------------------|
| 1–5 | remaining seed files | `appkit/src/seed/` |
| 6 | `src/helpers/auth/auth.helper.ts` | `appkit/features/auth/helpers/` |
| 7 | `src/helpers/auth/token.helper.ts` | `appkit/features/auth/helpers/` |
| 8 | `src/helpers/logging/error-logger.ts` | `appkit/monitoring/` |
| 9 | `src/helpers/logging/server-error-logger.ts` | `appkit/monitoring/` |
| 10 | `src/helpers/validation/address.helper.ts` | `appkit/features/account/helpers/` |

**Phase 17 status: ⬜ Not started**

---

### Phase 18 — Lib Logic Migration

| # | Letitrip file | appkit destination |
|---|---------------|--------------------|
| 1 | `src/lib/firebase/auth-helpers.ts` | `appkit/features/auth/` |
| 2 | `src/lib/firebase/rtdb-paths.ts` + `realtime-db.ts` | `appkit/core/` |
| 3 | `src/lib/email.ts` | `appkit/providers/email/` |
| 4 | `src/lib/encryption.ts` | `appkit/security/` |
| 5 | `src/lib/pii.ts` | `appkit/security/` |
| 6 | `src/lib/api/api-handler.ts` | `appkit/next/` |
| 7 | `src/lib/consent-otp.ts` | `appkit/features/auth/` |
| 8 | `src/lib/media/finalize.ts` | `appkit/features/media/` |
| 9 | `src/lib/monitoring/analytics.ts` | `appkit/monitoring/` |
| 10 | `src/lib/query/firebase-sieve.ts` | `appkit/core/` |

**Phase 18 status: ⬜ Not started**

---

### Phase 19 — Lib Remainder + Constants + Small Features

| # | Letitrip file | appkit destination |
|---|---------------|--------------------|
| 1 | `src/lib/server-logger.ts` | `appkit/monitoring/` |
| 2 | `src/lib/tokens.ts` | `appkit/features/auth/` |
| 3 | `src/lib/validation/schemas.ts` | `appkit/validation/` |
| 4 | `src/constants/theme.ts` / `ui.ts` | `appkit/tokens/` |
| 5 | `src/constants/rbac.ts` | `appkit/features/auth/schema/` |
| 6 | `src/constants/error-messages.ts` + `success-messages.ts` + `messages.ts` | appkit i18n |
| 7 | `src/constants/ui-labels-admin.ts` + `ui-labels-core.ts` | appkit i18n |
| 8 | `src/constants/faq.ts` + `homepage-data.ts` + `address.ts` | appkit feature schemas |
| 9 | `src/utils/business-day.ts` | `appkit/utils/` |
| 10 | `src/utils/guest-cart.ts` | `appkit/features/cart/utils/` |

**Phase 19 status: ⬜ Not started**

---

### Phases 20–37 — Feature Module + API Route Migrations

These are bulk moves of full feature directories and API route audits. Each phase handles 10 files.

| Phase | Scope |
|-------|-------|
| P20 | features: wishlist, promotions, reviews, faq, contact (all files) |
| P21 | features: search, blog, categories, about, copilot |
| P22 | features: stores (all components + hooks + types + utils) |
| P23 | features: auth components (7 files) + cart hooks (4) |
| P24 | features/cart: 10 of 16 components |
| P25 | features/cart: remaining 6 + features/events: 4 components |
| P26 | features/events: 10 components |
| P27 | features/events: 12 remaining + hooks (9) + constants (4) + types |
| P28 | features/homepage: 10 section components |
| P29 | features/homepage: remaining 12 components |
| P30 | features/products: 10 components |
| P31 | features/products: 6 remaining + hooks |
| P32 | features/user: 10 components |
| P33 | features/user: 12 remaining + 4 hooks + server.ts + lib |
| P34 | features/seller: 10 components |
| P35 | features/seller: 18 remaining components |
| P36 | features/seller: 13 hooks + features/admin: first 10 files |
| P37 | features/admin: 10 more (forms/views/columns) |
| **P38** | features/admin: 19 hooks |
| **P39** | API route audit — replace @/db in 26 [id] routes (batch 1) |
| **P40** | API route audit — remaining 27 [id] routes + final tsc clean |

**P20–P40 status: ⬜ Not started**

---

### Final Step — Post-Migration

After all phases ✅:

```powershell
# 1. Final sync
Copy-Item -Path "d:\proj\appkit\src" -Destination "d:\proj\letitrip.in\node_modules\@mohasinac\appkit\" -Recurse -Force

# 2. Type check
cd d:\proj\letitrip.in
npx tsc --noEmit

# 3. Build appkit with watch (live changes from this point forward)
cd d:\proj\appkit
npm run dev

# 4. Smoke test
cd d:\proj\letitrip.in
npm run test:smoke:existing

# 5. Commit
git add -A
git commit -m "feat(migration): complete appkit consolidation - 0 local duplicates"
```

---

## The Rule
**Everything reusable must live in appkit. If it doesn't exist there yet, create a generic version in appkit and delete the letitrip copy.**

### What legitimately stays in letitrip
- `src/lib/firebase/` — Firebase project credentials, SDK init (secrets, env-specific)
- `src/lib/payment/razorpay.ts`, `src/lib/shiprocket/` — Market-specific payment/shipping SDK drivers
- `src/lib/pwa/` — App-specific PWA service-worker runtime config
- `src/lib/integration-keys.ts` — Letitrip-specific key constants
- `src/providers.config.ts`, `src/features.config.ts` — Registry wiring stubs
- `src/i18n/` — Locale routing config (locale list, `navigation.ts`)
- `src/constants/site.ts`, `src/constants/routes.ts`, `src/constants/api-endpoints.ts` — App-specific data/config
- `src/app/` — Next.js page/layout/loading/error.tsx (route wiring only; each calls an appkit `*View.tsx`)
- `src/actions/` — Server actions (thin wiring: validate → call appkit repo → return)
- `src/types/appkit-provider-shims.d.ts` — TS module augmentation shims

### What does NOT stay in letitrip
Everything else — including layouts, navbars, footers, filters, error boundaries, cards, forms, hooks, contexts, repositories, schema, seed data, utilities. These get a **generic version in appkit** and the letitrip file is deleted.

---

## Migration Quality Contract

Every component, hook, or module moved to appkit **must** satisfy all of the following before the letitrip copy is deleted:

### 1. Generic and configurable
- No letitrip-specific copy, domain names, or URLs hard-coded inside the component.
- Variable content is passed via props, context, or `SiteConfig` injection.
- If used in 2+ consumer apps it must work for both without forks.

### 2. Themed via design tokens
- All colors, spacing, radii, shadows reference Tailwind token classes (`bg-primary`, `text-muted`, `border-border`, etc.) or CSS vars from `appkit/src/tokens/`.
- No hard-coded hex/rgb values or `style={}` overrides except one-off dynamic values.
- Variants exposed via named `variant` props (e.g. `variant="outlined"`) — never raw `className` bundles for repeated patterns.

### 3. Auth-aware where needed
- Components that gate content on role/permission accept `role` or `permissions` prop or read from `useRBAC` (which itself lives in `appkit/features/auth/hooks/`).
- Server components that check auth call `appkit/features/auth` server helpers — never letitrip-local `@/helpers/auth`.
- Hooks that fire authenticated requests accept repository/service injected via the appkit `registry`, not a hard-coded `fetch('@/api/...')`.

### 4. Extensible via props/slots
- Compound patterns expose named slots: `header`, `footer`, `actions`, `empty`, `loading` as render-props or children.
- Cards, lists, and table columns accept a `renderItem` / `columns` prop so consumers can customise without forking.
- Layout shells (Navbar, Sidebar, Footer) accept `items`, `config`, `logo`, `actions` props so letitrip passes its nav tree without forking the component.

### 5. Accessible by default
- Semantic HTML via appkit wrapper primitives (`<Nav>`, `<Header>`, `<Main>`, etc.) — never raw tags.
- Interactive elements have visible focus rings.
- Heading hierarchy is correct by default.
- Required `aria-*` attributes (labels, role, describedby) present without caller intervention.

### 6. i18n and currency safe
- No user-facing strings hard-coded in English inside the component — pass via props or `messages` injection.
- Money values rendered via `<PriceDisplay>` or `formatCurrency` from `appkit/utils` — never string concatenation.

### Examples

```tsx
// ✗ Bad migration — letitrip content baked in, no theming, hard-coded auth check
export function AdminSidebar() {
  const user = useContext(LetiTripAuthContext);
  if (user?.role !== 'admin') return null;
  return <div className="bg-zinc-900 text-white w-64">...</div>;
}

// ✓ Good migration — generic, themed, auth injected via appkit
// appkit/src/features/layout/Sidebar.tsx
interface SidebarProps {
  items: NavItem[];
  role?: string;
  requiredRole?: string;
}
export function Sidebar({ items, role, requiredRole }: SidebarProps) {
  if (requiredRole && role !== requiredRole) return null;
  return <Nav className="bg-sidebar text-sidebar-foreground w-64">...</Nav>;
}
```

---

## Status Key
- ✅ Done — deleted, callers migrated to appkit
- ⬜ Todo — needs a generic version in appkit, then delete letitrip copy
- 🔄 In progress
- ❓ Review — API diff needed before merging

---

## src/components — Full Inventory

### ui/

| File | appkit destination | Status |
|------|--------------------|--------|
| `ui/ActiveFilterChips.tsx` | `@mohasinac/appkit/ui` `ActiveFilterChips` | ✅ Deleted |
| `ui/Avatar.tsx` | `appkit/ui/components/Avatar` (create generic) | ⬜ Todo |
| `ui/BaseListingCard.tsx` | `appkit/ui/components/BaseListingCard` (create generic base) | ⬜ Todo |
| `ui/Card.tsx` | `appkit/ui/components/Card` (create generic) | ⬜ Todo |
| `ui/Dropdown.tsx` | `appkit/ui/components/Dropdown` (create generic) | ⬜ Todo |
| `ui/DynamicSelect.tsx` | `appkit/ui/components/DynamicSelect` (create generic) | ⬜ Todo |
| `ui/EmptyState.tsx` | `appkit/ui/components/EmptyState` (create generic) | ⬜ Todo |
| `ui/FilterDrawer.tsx` | `appkit/ui/components/FilterDrawer` (create generic) | ⬜ Todo |
| `ui/FilterFacetSection.tsx` | `appkit/ui/components/FilterFacetSection` (create generic) | ⬜ Todo |
| `ui/FlowDiagram.tsx` | `appkit/ui/components/FlowDiagram` (create generic) | ⬜ Todo |
| `ui/ImageGallery.tsx` | merge with `appkit/ui/components/ImageLightbox` | ⬜ Todo |
| `ui/Menu.tsx` | `appkit/ui/components/Menu` (create generic) | ⬜ Todo |
| `ui/RoleBadge.tsx` | `appkit/ui/components/RoleBadge` (create generic) | ⬜ Todo |
| `ui/SectionTabs.tsx` | `@mohasinac/appkit/ui` `SectionTabs` | ✅ Deleted |
| `ui/SideDrawer.tsx` | merge with `appkit/ui/components/Drawer` | ❓ API diff needed |
| `ui/SkipToMain.tsx` | `appkit/ui/components/SkipToMain` (create generic a11y) | ⬜ Todo |
| `ui/Tabs.tsx` | merge with `appkit/ui/components/TabStrip` — align API | ⬜ Todo |

### feedback/

| File | appkit destination | Status |
|------|--------------------|--------|
| `feedback/Alert.tsx` | `@mohasinac/appkit/ui` `Alert` | ✅ Deleted |
| `feedback/Modal.tsx` | `@mohasinac/appkit/ui` `Modal` — align API | ✅ Deleted |
| `feedback/Toast.tsx` | `appkit/ui/feedback/Toast` (create generic) | ✅ Deleted |

### forms/

| File | appkit destination | Status |
|------|--------------------|--------|
| `forms/Checkbox.tsx` | `appkit/ui/components/Checkbox` (create generic) | ✅ Deleted |
| `forms/Form.tsx` | `@mohasinac/appkit/ui` `Form` | ✅ Deleted |
| `forms/Input.tsx` | `@mohasinac/appkit/ui` `Input` | ✅ Deleted |
| `forms/Radio.tsx` | `appkit/ui/components/Radio` (create generic) | ✅ Deleted |
| `forms/Select.tsx` | `@mohasinac/appkit/ui` `Select` | ✅ Deleted |
| `forms/Slider.tsx` | `@mohasinac/appkit/ui` `Slider` | ✅ Deleted |
| `forms/Textarea.tsx` | `@mohasinac/appkit/ui` `Textarea` | ✅ Deleted |
| `forms/Toggle.tsx` | `appkit/ui/components/Toggle` (create generic) | ✅ Deleted |

### filters/

All filter components are generic UI patterns that belong in appkit. Letitrip passes entity-specific config via props.

| File | appkit destination | Status |
|------|--------------------|--------|
| `filters/BlogFilters.tsx` | `appkit/features/blog/components/BlogFilters` | ⬜ Todo |
| `filters/EventFilters.tsx` | `appkit/features/events/components/EventFilters` | ⬜ Todo |
| `filters/FilterPanel.tsx` | `appkit/ui/components/FilterPanel` (create generic) | ⬜ Todo |
| `filters/OrderFilters.tsx` | `appkit/features/orders/components/OrderFilters` | ⬜ Todo |
| `filters/ProductFilters.tsx` | `appkit/features/products/components/ProductFilters` | ⬜ Todo |
| `filters/RangeFilter.tsx` | merge with `appkit/ui/components/Slider` + label wrapper | ⬜ Todo |
| `filters/ReviewFilters.tsx` | `appkit/features/reviews/components/ReviewFilters` | ⬜ Todo |
| `filters/SwitchFilter.tsx` | `appkit/ui/components/SwitchFilter` (create generic) | ⬜ Todo |

### layout/

All navigation and layout shells belong in appkit as configurable components. Letitrip passes navItems, config, locale.

| File | appkit destination | Status |
|------|--------------------|--------|
| `layout/LocaleSwitcher.tsx` | `appkit/features/layout/LocaleSwitcher` | ✅ Deleted |
| `layout/AutoBreadcrumbs.tsx` | `appkit/features/layout/AutoBreadcrumbs` (generic + config) | ⬜ Todo |
| `layout/Breadcrumbs.tsx` | merge with `appkit/ui/components/Breadcrumb` | ⬜ Todo |
| `layout/BottomActions.tsx` | `appkit/features/layout/BottomActions` (create generic) | ⬜ Todo |
| `layout/BottomNavbar.tsx` | `appkit/features/layout/BottomNavbar` (create generic, navItems prop) | ⬜ Todo |
| `layout/BottomNavLayout.tsx` | `appkit/features/layout/BottomNavLayout` | ⬜ Todo |
| `layout/Footer.tsx` | `appkit/features/layout/Footer` (create generic, config prop) | ⬜ Todo |
| `layout/FooterLayout.tsx` | `appkit/features/layout/FooterLayout` | ⬜ Todo |
| `layout/MainNavbar.tsx` | `appkit/features/layout/MainNavbar` (create generic, navItems/config prop) | ⬜ Todo |
| `layout/NavbarLayout.tsx` | `appkit/features/layout/NavbarLayout` | ⬜ Todo |
| `layout/NavItem.tsx` | `appkit/features/layout/NavItem` | ⬜ Todo |
| `layout/Sidebar.tsx` | `appkit/features/layout/Sidebar` (create generic, items prop) | ⬜ Todo |
| `layout/SidebarLayout.tsx` | `appkit/features/layout/SidebarLayout` | ⬜ Todo |
| `layout/TitleBar.tsx` | `appkit/features/layout/TitleBar` (create generic) | ⬜ Todo |
| `layout/TitleBarLayout.tsx` | `appkit/features/layout/TitleBarLayout` | ⬜ Todo |

### products/ stores/ (components)

| File | appkit destination | Status |
|------|--------------------|--------|
| `products/ProductCard.tsx` | `appkit/features/products/ProductCard` | ✅ Deleted |
| `products/ProductGrid.tsx` | `appkit/features/products/ProductGrid` | ✅ Deleted |
| `products/InteractiveProductCard.tsx` | merge into `appkit/features/products/ProductCard` (interactive variant) | ⬜ Todo |
| `products/ProductForm.tsx` | `appkit/features/products/components/ProductForm` | ⬜ Todo |
| `products/ProductSortBar.tsx` | merge with `appkit/ui/components/SortDropdown` | ⬜ Todo |
| `products/ProductTableColumns.tsx` | `appkit/features/products/schema/productTableColumns` | ⬜ Todo |
| `stores/InteractiveStoreCard.tsx` | merge into `appkit/features/stores/StoreCard` (interactive variant) | ⬜ Todo |

### other/

| File | appkit destination | Status |
|------|--------------------|--------|
| `ReviewCard.tsx` | `appkit/features/reviews/ReviewCard` | ✅ Deleted |
| `BlogCard.tsx` | `appkit/features/blog/BlogCard` | ✅ Deleted |
| `EventCard.tsx` | `appkit/features/events/EventCard` | ✅ Deleted |
| `AvatarDisplay.tsx` | `appkit/ui/components/AvatarDisplay` | ⬜ Todo |
| `AvatarUpload.tsx` | `appkit/features/media/AvatarUpload` (create generic with onAbort) | ⬜ Todo |
| `DashboardStatsCard.tsx` | merge with `appkit/ui/components/StatsGrid` | ⬜ Todo |
| `ErrorBoundary.tsx` | `appkit/next/ErrorBoundary` (create generic RSC-compatible) | ⬜ Todo |
| `EventBanner.tsx` | `appkit/features/events/EventBanner` | ⬜ Todo |
| `FormField.tsx` | `appkit/ui/components/FormField` (create generic, replaces DescriptionField) | ⬜ Todo |
| `LayoutClient.tsx` | `appkit/features/layout/LayoutClient` (create generic, providers prop) | ⬜ Todo |
| `PasswordStrengthIndicator.tsx` | `appkit/ui/components/PasswordStrengthIndicator` | ⬜ Todo |
| `RowActionMenu.tsx` | `appkit/ui/components/RowActionMenu` (create generic) | ⬜ Todo |
| `ZodSetup.tsx` | `appkit/validation/ZodSetup` (create generic zod locale init) | ⬜ Todo |

### media/

| File | appkit destination | Status |
|------|--------------------|--------|
| `media/MediaImage.tsx` | `appkit/features/media/MediaImage` (create generic, storageProvider prop) | ⬜ Todo |
| `media/MediaAvatar.tsx` | `appkit/features/media/MediaAvatar` | ⬜ Todo |
| `media/MediaLightbox.tsx` | merge with `appkit/ui/components/ImageLightbox` | ⬜ Todo |
| `media/MediaVideo.tsx` | `appkit/features/media/MediaVideo` (create generic) | ⬜ Todo |

---

## src/hooks — Full Inventory

| File | appkit destination | Status |
|------|--------------------|--------|
| `useMediaUpload` fn | `appkit/features/media/useMediaUpload` | ✅ Deleted |
| `useMediaAbort` fn | `appkit/features/media/useMediaAbort` (create, endpoint injected via config) | ⬜ Todo |
| `useMediaCrop` fn | align generics with `appkit/features/media/useMediaCrop` | ⬜ Todo |
| `useMediaTrim` fn | align generics with `appkit/features/media/useMediaTrim` | ⬜ Todo |
| `useAuth.ts` | `appkit/features/auth/useAuth` | ❓ API diff needed |
| `useLogout.ts` | `appkit/features/auth/hooks/useLogout` (create) | ⬜ Todo |
| `useUrlTable.ts` | `appkit/react/hooks/useUrlTable` | ⬜ Todo |
| `useUnsavedChanges.ts` | `appkit/react/hooks/useUnsavedChanges` | ⬜ Todo |
| `useMessage.ts` | `appkit/react/hooks/useMessage` (create generic) | ⬜ Todo |
| `useAddresses.ts` | `appkit/features/account/hooks/useAddresses` (create) | ⬜ Todo |
| `useAddressForm.ts` | `appkit/features/account/hooks/useAddressForm` (create) | ⬜ Todo |
| `useAddressSelector.ts` | `appkit/features/account/hooks/useAddressSelector` (create) | ⬜ Todo |
| `useAddToCart.ts` | `appkit/features/cart/hooks/useAddToCart` | ❓ API diff needed |
| `useAuthEvent.ts` | `appkit/features/auth/hooks/useAuthEvent` (create) | ⬜ Todo |
| `useBecomeSeller.ts` | `appkit/features/seller/hooks/useBecomeSeller` (create) | ⬜ Todo |
| `useBottomActions.ts` | `appkit/features/layout/hooks/useBottomActions` (create) | ⬜ Todo |
| `useBrands.ts` | `appkit/features/products/hooks/useBrands` (create) | ⬜ Todo |
| `useBulkEvent.ts` | merge with `appkit/react/hooks/useBulkAction` | ❓ API diff needed |
| `useCartCount.ts` | `appkit/features/cart/hooks/useCartCount` | ❓ API diff needed |
| `useGuestCart.ts` | `appkit/features/cart/hooks/useGuestCart` | ❓ API diff needed |
| `useGuestCartMerge.ts` | `appkit/features/cart/hooks/useGuestCartMerge` | ❓ API diff needed |
| `useCategorySelector.ts` | `appkit/features/categories/hooks/useCategorySelector` (create) | ⬜ Todo |
| `useChat.ts` | `appkit/features/chat/hooks/useChat` (create feature) | ⬜ Todo |
| `useCheckout.ts` | `appkit/features/checkout/hooks/useCheckout` | ❓ API diff needed |
| `useCouponValidate.ts` | `appkit/features/promotions/hooks/useCouponValidate` (create) | ⬜ Todo |
| `useFaqVote.ts` | `appkit/features/faq/hooks/useFaqVote` (create) | ⬜ Todo |
| `useHomepageReviews.ts` | `appkit/features/homepage/hooks/useHomepageReviews` (create) | ⬜ Todo |
| `useHomepageSections.ts` | `appkit/features/homepage/hooks/useHomepageSections` | ❓ API diff needed |
| `useNavSuggestions.ts` | `appkit/features/search/hooks/useNavSuggestions` (create) | ⬜ Todo |
| `useNewsletter.ts` | `appkit/features/homepage/hooks/useNewsletter` (create) | ⬜ Todo |
| `useNotifications.ts` | `appkit/features/notifications/hooks/useNotifications` (create feature) | ⬜ Todo |
| `usePaymentEvent.ts` | `appkit/features/payments/hooks/usePaymentEvent` (create) | ⬜ Todo |
| `useProductReviews.ts` | `appkit/features/reviews/hooks/useProductReviews` | ❓ API diff needed |
| `useProfile.ts` | `appkit/features/account/hooks/useProfile` | ❓ API diff needed |
| `useProfileStats.ts` | `appkit/features/account/hooks/useProfileStats` (create) | ⬜ Todo |
| `usePublicProfile.ts` | `appkit/features/account/hooks/usePublicProfile` (create) | ⬜ Todo |
| `useRazorpay.ts` | `appkit/providers/payment/useRazorpay` (create generic, provider-injected) | ⬜ Todo |
| `useRBAC.ts` | `appkit/features/auth/hooks/useRBAC` (create, roles passed via config) | ⬜ Todo |
| `useRealtimeEvent.ts` | `appkit/features/events/hooks/useRealtimeEvent` (create) | ⬜ Todo |
| `useRelatedProducts.ts` | `appkit/features/products/hooks/useRelatedProducts` | ❓ API diff needed |
| `useSellerStorefront.ts` | `appkit/features/seller/hooks/useSellerStorefront` | ❓ API diff needed |
| `useSiteSettings.ts` | `appkit/core/hooks/useSiteSettings` (create, backed by site-config.ts) | ⬜ Todo |
| `useStoreAddressSelector.ts` | `appkit/features/stores/hooks/useStoreAddressSelector` (create) | ⬜ Todo |
| `useWishlistToggle.ts` | `appkit/features/wishlist/hooks/useWishlistToggle` | ❓ API diff needed |

---

## src/features — 19 modules (~375 files)

All components, hooks, types, and constants in every letitrip feature module must move to the matching appkit feature directory. Letitrip keeps only locale-aware `<Link>`/`useRouter` wrappers and `page.tsx` route files.

| Feature | appkit destination | Status |
|---------|--------------------|--------|
| `about/` | `appkit/features/about/` | ⬜ Todo |
| `admin/` hooks (19), views (20+), forms, columns | `appkit/features/admin/` | ⬜ Todo |
| `auth/` components (7) | `appkit/features/auth/` | ⬜ Todo |
| `blog/` components (3) | `appkit/features/blog/` | ⬜ Todo |
| `cart/` components (16), hooks (4) | `appkit/features/cart/` | ⬜ Todo |
| `categories/` components + hooks | `appkit/features/categories/` | ⬜ Todo |
| `contact/` | `appkit/features/contact/` | ⬜ Todo |
| `copilot/` | `appkit/features/copilot/` | ⬜ Todo |
| `events/` components (22), hooks (9), constants (4), types | `appkit/features/events/` | ⬜ Todo |
| `faq/` | `appkit/features/faq/` | ⬜ Todo |
| `homepage/` components (22) | `appkit/features/homepage/` | ⬜ Todo |
| `products/` components (16), hooks | `appkit/features/products/` | ⬜ Todo |
| `promotions/` | `appkit/features/promotions/` | ⬜ Todo |
| `reviews/` + hook | `appkit/features/reviews/` | ⬜ Todo |
| `search/` | `appkit/features/search/` | ⬜ Todo |
| `seller/` components (28), hooks (13) | `appkit/features/seller/` | ⬜ Todo |
| `stores/` components (6), hooks, types, utils | `appkit/features/stores/` | ⬜ Todo |
| `user/` components (22), hooks (4), lib | `appkit/features/account/` | ⬜ Todo |
| `wishlist/` | `appkit/features/wishlist/` | ⬜ Todo |

---

## src/repositories — 26 files (ALL → appkit)

| Repository | appkit destination | Status |
|------------|-------------------|--------|
| `base.repository.ts` | replace with `appkit/contracts/repository.ts` base | ⬜ Delete |
| `copilot-log.repository.ts` | `appkit/core/copilot-log.repository.ts` (already exists) | ⬜ Delete letitrip copy |
| `newsletter.repository.ts` | `appkit/core/newsletter.repository.ts` (already exists) | ⬜ Delete letitrip copy |
| `address.repository.ts` | `appkit/features/account/` | ⬜ Move |
| `bid.repository.ts` | `appkit/features/auctions/` | ⬜ Move |
| `blog.repository.ts` | `appkit/features/blog/` | ⬜ Move |
| `carousel.repository.ts` | `appkit/features/cms/` | ⬜ Move |
| `cart.repository.ts` | `appkit/features/cart/` | ⬜ Move |
| `categories.repository.ts` | `appkit/features/categories/` | ⬜ Move |
| `chat.repository.ts` | `appkit/features/chat/` (create feature) | ⬜ Move |
| `coupons.repository.ts` | `appkit/features/promotions/` | ⬜ Move |
| `event.repository.ts` + `eventEntry.repository.ts` | `appkit/features/events/` | ⬜ Move |
| `failed-checkout.repository.ts` | `appkit/features/checkout/` | ⬜ Move |
| `faqs.repository.ts` | `appkit/features/faq/` | ⬜ Move |
| `homepage-sections.repository.ts` | `appkit/features/homepage/` | ⬜ Move |
| `notification.repository.ts` | `appkit/features/notifications/` (create feature) | ⬜ Move |
| `offer.repository.ts` | `appkit/features/products/` | ⬜ Move |
| `order.repository.ts` | `appkit/features/orders/` | ⬜ Move |
| `payout.repository.ts` | `appkit/features/seller/` | ⬜ Move |
| `product.repository.ts` | `appkit/features/products/` | ⬜ Move |
| `review.repository.ts` | `appkit/features/reviews/` | ⬜ Move |
| `session.repository.ts` | `appkit/features/auth/` | ⬜ Move |
| `site-settings.repository.ts` | consolidate into `appkit/core/site-config.ts` | ⬜ Move |
| `sms-counter.repository.ts` | `appkit/features/auth/` | ⬜ Move |
| `store.repository.ts` + `store-address.repository.ts` | `appkit/features/stores/` | ⬜ Move |
| `token.repository.ts` | `appkit/features/auth/` | ⬜ Move |
| `unit-of-work.ts` | `appkit/core/` | ⬜ Move |
| `user.repository.ts` | `appkit/features/account/` | ⬜ Move |
| `wishlist.repository.ts` | `appkit/features/wishlist/` | ⬜ Move |

---

## src/db — Schema + seed data (ALL → appkit)

| Directory | appkit destination | Status |
|-----------|--------------------|--------|
| `db/schema/*.ts` (25 files) | `appkit/features/*/schema/*.schema.ts` | ⬜ Move |
| `db/seed-data/*.ts` (21 files) | `appkit/src/seed/` | ⬜ Move |
| `db/indices/merge-indices.ts` | `appkit/scripts/` deployment tooling | ⬜ Move |

---

## src/helpers — ALL → appkit

| File | appkit destination | Status |
|------|--------------------|--------|
| `helpers/auth/auth.helper.ts` + `token.helper.ts` | `appkit/features/auth/helpers/` | ⬜ Move |
| `helpers/logging/error-logger.ts` + `server-error-logger.ts` | `appkit/monitoring/` | ⬜ Move |
| `helpers/validation/address.helper.ts` | `appkit/features/account/helpers/` | ⬜ Move |

---

## src/lib — Split: SDK drivers stay, logic moves

| File | Status |
|------|--------|
| `lib/firebase/config.ts`, `client-config.ts`, `auth-server.ts`, `realtime.ts`, `storage.ts` | **Stays** — Firebase project credentials/init |
| `lib/firebase/auth-helpers.ts`, `rtdb-paths.ts`, `realtime-db.ts` | ⬜ Move to `appkit/features/auth/` or `appkit/core/` |
| `lib/payment/razorpay.ts` | **Stays** — Razorpay SDK init (market driver) |
| `lib/shiprocket/*.ts` | **Stays** — Shiprocket SDK init (market driver) |
| `lib/pwa/runtime-caching*.ts` | **Stays** — App-specific service worker config |
| `lib/integration-keys.ts` | **Stays** — Letitrip key constants |
| `lib/email.ts` | ⬜ Move to `appkit/providers/email/` |
| `lib/encryption.ts` | ⬜ Move to `appkit/security/` |
| `lib/pii.ts` | ⬜ Move to `appkit/security/` |
| `lib/api/api-handler.ts` | ⬜ Move to `appkit/next/` |
| `lib/consent-otp.ts` | ⬜ Move to `appkit/features/auth/` |
| `lib/media/finalize.ts` | ⬜ Move to `appkit/features/media/` |
| `lib/monitoring/analytics.ts` | ⬜ Move to `appkit/monitoring/` |
| `lib/query/firebase-sieve.ts` | ⬜ Move to `appkit/core/` |
| `lib/server-logger.ts` | ⬜ Move to `appkit/monitoring/` |
| `lib/tokens.ts` | ⬜ Move to `appkit/features/auth/` |
| `lib/validation/schemas.ts` | ⬜ Move to `appkit/validation/` |

---

## src/constants — Split

| File | Status |
|------|--------|
| `constants/site.ts`, `constants/routes.ts`, `constants/api-endpoints.ts` | **Stays** — App-specific data |
| `constants/config.ts`, `constants/seo.ts` | **Stays** — App config |
| `constants/theme.ts`, `constants/ui.ts` | ⬜ Move to `appkit/tokens/` or `appkit/style/` |
| `constants/rbac.ts` | ⬜ Move to `appkit/features/auth/schema/` |
| `constants/error-messages.ts`, `success-messages.ts`, `messages.ts` | ⬜ Move to appkit i18n |
| `constants/ui-labels-admin.ts`, `ui-labels-core.ts` | ⬜ Move to appkit i18n |
| `constants/faq.ts`, `homepage-data.ts`, `address.ts` | ⬜ Move to appkit feature schemas |

---

## src/utils — ALL → appkit

| File | appkit destination | Status |
|------|--------------------|--------|
| `utils/business-day.ts` | `appkit/utils/` | ⬜ Move |
| `utils/guest-cart.ts` | `appkit/features/cart/utils/` | ⬜ Move |

---

## src/actions — Stays (thin wiring)

All 35 server action files stay here as the correct letitrip-side wiring layer. Each must be as thin as possible: validate input → call appkit repository → return. No inline Firestore reads or business logic.

---

## src/app/ — Routes (thin page wiring)

Page/layout/error/loading files stay here. However:
- Each `page.tsx` must call an appkit `*View.tsx` — no component logic in pages
- `error.tsx` boundaries must call `appkit/next/ErrorBoundary` (create generic)
- `loading.tsx` skeletons should use `appkit/ui` skeleton primitives
- App route layouts call appkit `*Layout` components from `appkit/features/layout/`

---

## src/app/api — 143 routes (stay, but must use appkit internals)

Route handlers are letitrip's. They must import repositories, auth helpers, and request handlers from appkit.

### Already using appkit (90/143) ✅

**admin/** — analytics, bids, blog, coupons, dashboard, events, faqs, newsletter, orders, payouts, payouts/weekly, products, reviews, sessions, sessions/revoke-user, stores, users

**auth/** — event/init, forgot-password, google/callback, google/start, login, logout, me, register, reset-password, send-verification, session, session/activity, session/validate, verify-email

**media/** — crop, delete, trim, upload

**payment/** — create-order, event/init, otp/request, preorder, verify, webhook

**seller/** — analytics, coupons, offers, orders, payout-settings, payouts, products, shipping, shipping/verify-pickup, store, store/addresses

**user/** — addresses, become-seller, change-password, offers, orders, profile, sessions, wishlist

**other/** — bids, cache/revalidate, carousel, cart, cart/merge, chat, checkout, checkout/preflight, contact, copilot/chat, copilot/history, coupons/validate, demo/seed, faqs, logs/write, newsletter/subscribe, notifications, notifications/read-all, notifications/unread-count, pre-orders, products, promotions, realtime/token, reviews, search, profile/add-phone, profile/delete-account, profile/verify-phone, site-settings, webhooks/shiprocket

### No appkit imports — need audit (53/143) ⬜

These almost certainly use inline `@/db` or `@/repositories` imports that need replacing with appkit repositories.

**admin [id]** — blog/[id], coupons/[id], events/[id], events/[id]/entries, events/[id]/entries/[entryId], events/[id]/stats, events/[id]/status, newsletter/[id], orders/[id], orders/[id]/refund, payouts/[id], products/[id], sessions/[id], stores/[uid], users/[uid]

**public CRUD** — blog/[slug], carousel/[id], cart/[itemId], categories, categories/[id], chat/[chatId], chat/[chatId]/messages, events, events/[id], events/[id]/enter, events/[id]/leaderboard, faqs/[id], faqs/[id]/vote, homepage-sections, homepage-sections/[id], notifications/[id], orders/[id]/invoice, products/[id], profile/[userId], profile/[userId]/reviews, realtime/bids/[id], reviews/[id], reviews/[id]/vote, stores, stores/[storeSlug], stores/[storeSlug]/auctions, stores/[storeSlug]/products, stores/[storeSlug]/reviews

**user/seller** — bids/[id], copilot/feedback/[logId], seller/orders/[id]/ship, user/addresses/[id], user/addresses/[id]/set-default, user/orders/[id], user/orders/[id]/cancel, user/sessions/[id], user/wishlist/[productId]

### Migration action for [id] routes

```ts
// ✗ Before — inline db
import { db } from '@/db';
const doc = await db.collection('products').doc(id).get();

// ✓ After — appkit repository
import { registry } from '@mohasinac/appkit/contracts';
const repo = registry.get('product');
const product = await repo.findById(id);
```

---

## Migration Priority Order

| Priority | Item | Why |
|----------|------|-----|
| 1 | `forms/Input`, `Select`, `Textarea`, `Slider`, `Form` | Highest caller count, unblocks many migrations |
| 2 | `feedback/Modal`, `feedback/Toast` | Cross-cutting, used everywhere |
| 3 | `ui/EmptyState`, `ui/Card`, `RowActionMenu` | Widely used primitives |
| 4 | `forms/Checkbox`, `Radio`, `Toggle` | Complete forms layer |
| 5 | `useUrlTable`, `useUnsavedChanges` | Already in appkit, quick wins |
| 6 | `layout/` all files | Creates clean layout shell in appkit |
| 7 | `filters/` all files | Move to appkit feature dirs |
| 8 | `ErrorBoundary`, `ZodSetup`, `LayoutClient` | Infrastructure pieces |
| 9 | `src/repositories/` — start copilot-log + newsletter (zero work) | Quick wins |
| 10 | `src/db/schema/` | No caller changes, just file moves |
| 11 | `src/features/reviews/`, `wishlist/`, `promotions/` | Smallest features |
| 12 | `src/features/search/`, `faq/`, `contact/`, `blog/` | Small-medium |
| 13 | `src/features/cart/`, `products/`, `user/` | Larger features |
| 14 | `src/features/admin/`, `seller/` | Largest — tackle last |
| 15 | API route audit for 53 local-only routes | Replace @/db with appkit repos |

---

## Completed Deletions Log

### Prior sessions
- `src/features/faq/components/FAQAccordion.tsx`
- `src/features/products/components/ProductTabs.tsx`
- `src/features/stores/components/StoreNavTabs.tsx`
- `src/features/homepage/components/AdvertisementBanner.tsx`
- `src/features/homepage/components/FAQSection.tsx`
- `src/components/ui/SectionTabs.tsx`
- `src/components/ReviewCard.tsx`
- `src/components/layout/LocaleSwitcher.tsx`
- `src/components/BlogCard.tsx`
- `src/components/EventCard.tsx`
- `src/components/products/ProductGrid.tsx`
- `src/components/products/ProductCard.tsx`

### 2026-04-14 (this session)
- `src/components/ui/ActiveFilterChips.tsx` — migrated all callers + type imports to `@mohasinac/appkit/ui`
- `src/components/feedback/Alert.tsx` — migrated all callers to `@mohasinac/appkit/ui`
- `useMediaUpload` function — removed from `src/hooks/useMediaUpload.ts`, migrated 10 callers to `@mohasinac/appkit/features/media`
- Phase 01 completed: deleted `src/components/forms/{Input,Select,Textarea,Slider,Form,Checkbox,Radio,Toggle}.tsx` and `src/components/feedback/{Modal,Toast}.tsx`, moved callers to `@mohasinac/appkit/ui`, synced appkit, `tsc --noEmit` clean
- Fixed JSX bugs: `DemoSeedView.tsx`, `PublicProfileView.tsx`
- Phase 02 completed: deleted `src/components/ui/{Card,EmptyState,Dropdown,DynamicSelect,Menu,Avatar,RoleBadge,SkipToMain,Tabs,FilterDrawer}.tsx`, switched `src/components/ui/index.ts` exports to `@mohasinac/appkit/ui`, synced appkit, `tsc --noEmit` clean
- Phase 03 completed: deleted `src/components/{ErrorBoundary,ZodSetup,LayoutClient,FormField,RowActionMenu,PasswordStrengthIndicator,DashboardStatsCard,AvatarDisplay,AvatarUpload,EventBanner}.tsx`, switched `src/components/index.ts` exports to appkit modules, moved shell logic to `src/app/[locale]/LayoutShellClient.tsx`, synced appkit, `tsc --noEmit` clean
