# Implementation Plan: Business & Components Refactoring

> **Source of truth**: [BUSINESS_AND_COMPONENTS.md](./BUSINESS_AND_COMPONENTS.md)  
> **Goal**: Make `src/components/` a pure generic primitive library — zero business logic. Move all ~105 domain-coupled components into `src/features/<domain>/components/`.  
> **Current state**: Phase 0 ~90% (1 deletion pending), Phase 1 100%, Phase 2 P2-1–P2-6 done / P2-7–P2-15 not started, Phase 3–5 not started. Business dirs `products/`, `auctions/`, `user/`, `seller/`, `cart/`, `checkout/` migrated; Tier 1 shared primitives (ProductCard, ProductGrid, ProductFilters, ProductSortBar, AuctionCard, AuctionGrid, AddressCard, AddressForm, WishlistButton, ProfileHeader, ProfileStatsGrid, EmailVerificationCard, PhoneVerificationCard, ProfileInfoForm, PasswordChangeForm, AccountInfoCard) retained in `src/components/` per architecture rules.  
> **Progress tracking**: After each task commit, mark the corresponding `☐` → `✅` in [BUSINESS_AND_COMPONENTS.md §12](./BUSINESS_AND_COMPONENTS.md#12-tracking-checklist).

---

## Architecture After Refactor

```
src/components/           ← Tier 1: ONLY generic, domain-agnostic primitives
  ui/                     Button, Card, Badge, DataTable, ListingLayout, StepperNav,
                          StatsGrid, RatingDisplay, CountdownDisplay, PriceDisplay,
                          ItemRow, SummaryCard, ...
  forms/                  Input, Select, Textarea, Checkbox, Toggle, Slider, Radio
  typography/             Heading, Text, Caption, Label, Span, TextLink
  semantic/               Section, Article, Main, Aside, Nav, Ul, Ol, Li, ...
  media/                  MediaImage, MediaVideo, MediaAvatar, MediaGallery
  feedback/               Alert, Modal, Toast
  modals/                 ConfirmDeleteModal, ImageCropModal, UnsavedChangesModal
  utility/                Search, BackToTop, ResponsiveView, BackgroundRenderer
  layout/                 Breadcrumbs, NavItem, LocaleSwitcher, AutoBreadcrumbs,
                          FooterLayout, NavbarLayout, SidebarLayout, TitleBarLayout,
                          BottomNavLayout   ← all layoutsgenericized (data via props)
  admin/                  AdminPageHeader, AdminFilterBar, DataTable, DrawerFormFooter,
                          AdminStatsCards, RichTextEditor, GridEditor, CategoryTreeView,
                          BackgroundSettings, ImageUpload, MediaUploadField
  auth/                   ProtectedRoute, RoleGate  (infrastructure — stays Tier 1)
  providers/              MonitoringProvider         (infrastructure — stays Tier 1)

src/features/<domain>/components/   ← Tier 2: all business views + sub-components
  products/               ProductCard, ProductGrid, ProductFilters, ProductActions,
                          ProductInfo, ProductReviews, ProductFeatureBadges,
                          ProductSortBar, RelatedProducts, AddToCartButton,
                          AuctionCard, AuctionGrid, AuctionDetailView,
                          BidHistory, PlaceBidForm
  cart/                   CartItemList, CartItemRow, CartSummary, PromoCodeInput,
                          CheckoutView, CheckoutAddressStep, CheckoutOrderReview,
                          CheckoutSuccessView, OrderSuccessActions, OrderSuccessCard,
                          OrderSummaryPanel, OrderSuccessHero
  admin/                  ProductForm, ProductTableColumns, OrderTableColumns,
                          OrderStatusForm, UserTableColumns, UserFilters,
                          UserDetailDrawer, CarouselSlideForm, CarouselTableColumns,
                          CategoryForm, CategoryTableColumns, BlogForm, BlogTableColumns,
                          SectionForm, SectionTableColumns, ReviewDetailView,
                          ReviewTableColumns, FaqForm, FaqTableColumns, CouponForm,
                          CouponTableColumns, BidTableColumns, SiteBasicInfoForm,
                          SiteContactForm, SiteSocialLinksForm, PayoutStatusForm,
                          PayoutTableColumns, QuickActionsGrid, AdminTabs,
                          AdminSessionsManager, SessionTableColumns
  user/                   WishlistButton, UserTabs, AddressCard, AddressForm,
                          OrderTrackingView, ProfileHeader, ProfileStatsGrid,
                          PublicProfileView, AccountInfoCard, EmailVerificationCard,
                          PasswordChangeForm, PhoneVerificationCard, ProfileInfoForm,
                          NotificationItem, NotificationsBulkActions,
                          AddressSelectorCreate, NotificationBell
  seller/                 SellerStorefrontView, SellerAnalyticsStats,
                          SellerPayoutHistoryTable, SellerPayoutRequestForm,
                          SellerPayoutStats, SellerRevenueChart, SellerTabs,
                          SellerTopProducts, PayoutTableColumns
  blog/                   BlogCard, BlogFeaturedCard, BlogCategoryTabs
  categories/             CategoryCard, CategoryGrid, CategorySelectorCreate
  reviews/                ReviewCard
  search/                 SearchFiltersRow, SearchResultsSection
  homepage/  (NEW)        HeroCarousel, FeaturedProductsSection, FeaturedAuctionsSection,
                          TopCategoriesSection, CustomerReviewsSection, BlogArticlesSection,
                          FAQSection, WelcomeSection, WhatsAppCommunitySection,
                          AdvertisementBanner, SectionCarousel, SiteFeaturesSection,
                          TrustFeaturesSection, TrustIndicatorsSection, HomepageSkeleton
  faq/       (NEW)        FAQPageContent, FAQAccordion, FAQCategorySidebar,
                          FAQHelpfulButtons, FAQSortDropdown, RelatedFAQs, ContactCTA
  contact/   (NEW)        ContactForm, ContactInfoSidebar
  promotions/(NEW)        CouponCard, ProductSection
  about/     (NEW)        AboutView
  events/                 EventBanner  (moved from ui/)
```

---

## Import Changes After Refactor

```tsx
// BEFORE — domain components imported from generic barrel
import { ProductCard, ProductGrid }   from '@/components';
import { CartSummary, CartItemRow }    from '@/components';
import { BlogCard }                    from '@/components';
import { CategoryCard }                from '@/components';
import { AuctionCard }                 from '@/components';

// AFTER — domain components imported from their feature
import { ProductCard, ProductGrid }   from '@/features/products';
import { CartSummary, CartItemRow }    from '@/features/cart';
import { BlogCard }                    from '@/features/blog';
import { CategoryCard }                from '@/features/categories';
import { AuctionCard }                 from '@/features/products';  // auctions = products feature

// UNCHANGED — generic primitives stay @/components
import { Button, Card, Badge, DataTable, ListingLayout } from '@/components';
import { Heading, Text, Caption }     from '@/components';
import { Section, Nav, Ul, Li }       from '@/components';
import { Alert, Modal, Toast }        from '@/components';
import { AdminPageHeader, AdminFilterBar, DrawerFormFooter } from '@/components';
import { Search, SortDropdown, FilterFacetSection }          from '@/components';
```

---

## Migration Sequence Per Task

Each Phase 2+ task follows this exact 10-step sequence:

1. `mkdir -p src/features/<domain>/components` (if not exists)
2. Move files: create file at destination with same content, delete source
3. Update imports **inside** the moved file (e.g. relative path `../` → `@/components`)
4. Create/update `src/features/<domain>/components/index.ts` with all exports
5. Create/update `src/features/<domain>/index.ts` to re-export from `./components`
6. `grep -rn "from '@/components'" src/` → find all importers of moved components → update to `@/features/<domain>`
7. Remove the moved exports from `src/components/<domain>/index.ts`
8. Delete the now-empty source directory
9. Remove `export * from "./<domain>"` from `src/components/index.ts`
10. `npx tsc --noEmit` → fix errors → `npm run build` → fix errors

---

## Verification After Every Task

```powershell
# After every task, before committing:
npx tsc --noEmit                    # Must report 0 errors
npm run build                       # Must succeed
```

---

## Phase 0 — Cleanup (5 deletions)

> No import updates needed. Safe to delete outright.

### P0-1 · Delete 3 orphan empty top-level admin files

The real implementations live in their sub-directories; these top-level stubs are 0-byte shells.

| Action | File |
|--------|------|
| DELETE | `src/components/admin/UserFilters.tsx` (real → `admin/users/UserFilters.tsx`) |
| DELETE | `src/components/admin/FaqForm.tsx` (real → `admin/faqs/FaqForm.tsx`) |
| DELETE | `src/components/admin/PayoutStatusForm.tsx` (real → `admin/payouts/PayoutStatusForm.tsx`) |
| Update | Remove any exports of the above from `src/components/admin/index.ts` |

### P0-2 · Delete 2 duplicate/unnecessary components

| Action | File | Reason |
|--------|------|--------|
| DELETE | `src/components/products/ProductImageGallery.tsx` | Duplicate of `ui/ImageGallery` — callers use `ImageGallery` |
| DELETE | `src/components/faq/FAQSearchBar.tsx` | Unnecessary `Search` wrapper — callers use `<Search>` directly |
| Update | Remove exports from `src/components/products/index.ts` and `src/components/faq/index.ts` |

**Git commit**: `chore: phase 0 - delete orphan and duplicate components`  
**BUSINESS_AND_COMPONENTS.md §12**: mark Phase 0 rows ✅

---

## Phase 1 — Create New Generic Primitives + Genericize Existing

> All new files go in `src/components/ui/`.  
> Each must be added to both `src/components/ui/index.ts` **and** `src/components/index.ts`.

---

### P1-1 · `ui/StepperNav` — extract from `checkout/CheckoutStepper`

**Source to read first**: `src/components/checkout/CheckoutStepper.tsx`

**New file**: `src/components/ui/StepperNav.tsx`

```tsx
// Props contract
interface StepperNavProps {
  steps: { number: number; label: string }[];
  currentStep: number;
  className?: string;
}
```

- Zero domain imports. Only `THEME_CONSTANTS`, `cn()`, React.
- After creating, update `CheckoutStepper.tsx` to re-export `StepperNav` (keeps backward compat until P2-6 deletes it).
- Export from `ui/index.ts` and `components/index.ts`.

---

### P1-2 · `ui/StatsGrid` — extract from `user/profile/ProfileStatsGrid`

**Source to read first**: `src/components/user/profile/ProfileStatsGrid.tsx`

**New file**: `src/components/ui/StatsGrid.tsx`

```tsx
interface StatsGridProps {
  stats: {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
    colorClass?: string;
  }[];
  columns?: 2 | 3 | 4;
  className?: string;
}
```

- Fully dynamic — no hardcoded `orders / wishlist / addresses` field names.
- Business `ProfileStatsGrid` wraps this generic with domain data shapes after P2-4.

---

### P1-3 · `ui/RatingDisplay` — promote from `admin/reviews/ReviewStars`

**Source to read first**: `src/components/admin/reviews/ReviewStars.tsx`

**New file**: `src/components/ui/RatingDisplay.tsx`

```tsx
interface RatingDisplayProps {
  rating: number;       // 0–5
  maxRating?: number;   // default 5
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}
```

- After creating, update `admin/reviews/ReviewStars.tsx` to re-export:  
  `export { RatingDisplay as ReviewStars } from '@/components';`

---

### P1-4 · `ui/CountdownDisplay` — new (from AuctionCard pattern)

**Source to read first**: `src/components/auctions/AuctionCard.tsx` (for the countdown rendering)

**New file**: `src/components/ui/CountdownDisplay.tsx`

```tsx
interface CountdownDisplayProps {
  targetDate: Date;
  format?: 'dhms' | 'hms' | 'auto';  // auto = dhms until <1h, then hms
  expiredLabel?: string;              // shown when expired
  className?: string;
}
```

- Internally uses `useCountdown(targetDate)` from `@/hooks`.
- Renders `{ days, hours, minutes, seconds }` blocks in a responsive grid.
- Zero domain imports.

---

### P1-5 · `ui/PriceDisplay` — new (from ProductCard price pattern)

**Source to read first**: `src/components/products/ProductCard.tsx` (price rendering section)

**New file**: `src/components/ui/PriceDisplay.tsx`

```tsx
interface PriceDisplayProps {
  amount: number;
  currency?: string;
  originalAmount?: number;    // if set, shows strikethrough + discount badge
  variant?: 'compact' | 'detail';
  className?: string;
}
```

- Uses `formatCurrency(amount)` from `@/utils`.
- Handles: regular price, sale price with strikethrough, discount % badge.

---

### P1-6 · `ui/ItemRow` — extract layout from `cart/CartItemRow`

**Source to read first**: `src/components/cart/CartItemRow.tsx`

**New file**: `src/components/ui/ItemRow.tsx`

```tsx
interface ItemRowProps {
  image: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  rightSlot: React.ReactNode;    // price, quantity, etc.
  actions?: React.ReactNode;     // remove, edit buttons
  className?: string;
}
```

- Horizontal card: `[image] [title + subtitle] | [rightSlot] [actions]`
- Zero domain imports. Uses `MediaImage` for image.

---

### P1-7 · `ui/SummaryCard` — extract layout from `cart/CartSummary`

**Source to read first**: `src/components/cart/CartSummary.tsx`

**New file**: `src/components/ui/SummaryCard.tsx`

```tsx
interface SummaryCardProps {
  lines: { label: string; value: string; muted?: boolean }[];
  total: { label: string; value: string };
  action?: React.ReactNode;    // CTA button slot
  className?: string;
}
```

- Labelled line items (subtotal, shipping, discount) + bold total row + action slot.
- Zero domain imports.

**Git commit after P1-7**: `feat: phase 1 (part 1) - new generic ui primitives: StepperNav, StatsGrid, RatingDisplay, CountdownDisplay, PriceDisplay, ItemRow, SummaryCard`  
**BUSINESS_AND_COMPONENTS.md §12**: mark Phase 1 rows P1-1 through P1-7 ✅

---

### P1-8 · Genericize `ui/RoleBadge`

**File**: `src/components/ui/RoleBadge.tsx`

**Change**: Remove `import type { UserRole } from '@/types/auth'`. Change prop `role: UserRole` → `role: string`. Keep the internal `colorMap` keyed by string (`admin`, `moderator`, `seller`, `user`, fallback).

```tsx
// Before
role: UserRole;

// After
role: string;
```

- Run `npx tsc --noEmit src/components/ui/RoleBadge.tsx` to confirm no breakage.
- All existing callers pass a `UserRole` string value — no call-site changes needed.

---

### P1-9 · Genericize `admin/ImageUpload`

**File**: `src/components/admin/ImageUpload.tsx`

**Change**: Remove `import { useMediaUpload } from '@/hooks'`. Add `onUpload: (file: File) => Promise<string>` prop. The component calls `onUpload(file)` instead of the hook.

**Callers after change** (in `features/admin/` form components) must pass:
```tsx
import { useMediaUpload } from '@/hooks';
const { upload } = useMediaUpload();
<ImageUpload onUpload={upload} ... />
```

- Run `npx tsc --noEmit` after updating call sites.

---

### P1-10 · Genericize `admin/MediaUploadField`

**File**: `src/components/admin/MediaUploadField.tsx`

**Change**: Same pattern as P1-9 — remove `useMediaUpload` import, add `onUpload: (file: File) => Promise<string>` prop.

**Git commit after P1-10**: `feat: phase 1 (part 2) - genericize RoleBadge, ImageUpload, MediaUploadField`  
**BUSINESS_AND_COMPONENTS.md §12**: mark P1-8 through P1-10 ✅

---

### P1-11 · New `hooks/useCamera` — device camera access hook

**New file**: `src/hooks/useCamera.ts`  
**Test**: `src/hooks/__tests__/useCamera.test.ts`

```ts
interface UseCameraOptions {
  facingMode?: 'user' | 'environment';  // 'user' = front cam, 'environment' = rear cam
  video?:      boolean | MediaTrackConstraints;
  audio?:      boolean;
}

interface UseCameraReturn {
  isSupported:    boolean;                        // navigator.mediaDevices available
  isActive:       boolean;                        // stream is live
  isCapturing:    boolean;                        // video recording in progress
  stream:         MediaStream | null;
  error:          string | null;
  videoRef:       React.RefObject<HTMLVideoElement>; // attach to <video> for live preview
  startCamera:    (options?: UseCameraOptions) => Promise<void>;
  stopCamera:     () => void;                     // releases hardware track(s)
  takePhoto:      () => Blob | null;              // current frame → image/webp Blob
  startRecording: () => void;                     // begins MediaRecorder session
  stopRecording:  () => Promise<Blob>;            // stops → returns video/webm Blob
  switchCamera:   () => Promise<void>;            // toggles user ↔ environment
}
```

Rules:
- Check `isSupported` before calling `startCamera` — `navigator.mediaDevices` is `undefined` in non-secure contexts and some older browsers.
- `stopCamera()` **must** call `stream.getTracks().forEach(t => t.stop())` to release the hardware and turn off the camera indicator light.
- `takePhoto()` draws the current `videoRef` frame onto an offscreen `<canvas>` and returns `canvas.toBlob()` as `image/webp`.
- `startRecording()` / `stopRecording()` use the `MediaRecorder` API; output MIME is `video/webm` (widest browser support).
- `useEffect` cleanup calls `stopCamera()` automatically on unmount — callers must not manage this themselves.
- Export from `src/hooks/index.ts`. Zero domain imports. Zero Firebase imports.

---

### P1-12 · New `ui/CameraCapture` — in-page camera viewfinder primitive

**New file**: `src/components/ui/CameraCapture.tsx`  
**Test**: `src/components/ui/__tests__/CameraCapture.test.tsx`

```tsx
interface CameraCaptureProps {
  mode:         'photo' | 'video' | 'both';       // what the user can capture
  facingMode?:  'user' | 'environment';           // default 'environment'
  onCapture:    (blob: Blob, type: 'photo' | 'video') => void;
  onError?:     (error: string) => void;
  className?:   string;
}
```

Renders an in-page live viewfinder with hardware controls:
- Live `<video autoPlay muted playsInline>` wired to `useCamera().videoRef`.
- **Photo mode**: shutter button → `takePhoto()` → `onCapture(blob, 'photo')`.
- **Video mode**: record/stop toggle → `startRecording()` / `stopRecording()` → `onCapture(blob, 'video')`.
- **Both mode**: shutter button + record/stop button both visible; user chooses which to use.
- Camera-flip button — rendered when `navigator.mediaDevices.enumerateDevices()` returns > 1 video input.
- Shows `<Alert variant="error">` with the translated error message when `useCamera().error` is set.
- Shows `<LoadingSpinner>` while `startCamera()` is in progress.
- All button `aria-label` values come from `useTranslations('camera')` (Rule 33 + Rule 34).
- Uses `THEME_CONSTANTS` for all layout classes; zero hardcoded Tailwind strings (Rule 4).
- Zero domain imports.

Export from `src/components/ui/index.ts` and `src/components/index.ts`.

Translation keys — add to **both** `messages/en.json` and `messages/hi.json` under `"camera"` namespace:

```json
"camera": {
  "takePhoto":       "Take Photo",
  "startRecording":  "Start Recording",
  "stopRecording":   "Stop Recording",
  "flipCamera":      "Flip Camera",
  "switchToCamera":  "Use Camera",
  "switchToUpload":  "Upload File",
  "cameraError":     "Camera unavailable",
  "permissionDenied":"Camera permission denied. Please allow access in your browser settings.",
  "notSupported":    "Camera is not supported on this device"
}
```

---

### P1-13 · Extend `admin/ImageUpload` with device camera capture

**File**: `src/components/admin/ImageUpload.tsx`

**New prop** (add alongside the existing `onUpload` prop from P1-9):

```tsx
captureSource?: 'file-only' | 'camera-only' | 'both';  // default: 'both'
```

Behaviour per value:

| `captureSource` | Rendered UI |
|---|---|
| `'file-only'` | Existing file-picker only — no camera UI (backward-compatible default when prop omitted resolves to `'both'` but `isSupported === false`) |
| `'camera-only'` | Hides the file input; renders `<CameraCapture mode="photo">` inline |
| `'both'` | Segmented toggle **Upload file \| Use camera**; toggling swaps between the file input and `<CameraCapture mode="photo">` |

Capture-to-upload bridge (no new plumbing needed): when `CameraCapture` fires `onCapture(blob)`, wrap it as `new File([blob], 'camera-capture.webp', { type: 'image/webp' })` and pass to the existing `onUpload` prop.

Mobile fallback when `useCamera().isSupported === false` and `captureSource !== 'file-only'`:
- Render `<input type="file" accept="image/*" capture="environment" />` instead of `<CameraCapture>`.
- This instructs iOS/Android to open the native camera app directly.

---

### P1-14 · Extend `admin/MediaUploadField` with video camera capture

**File**: `src/components/admin/MediaUploadField.tsx`

**New props** (add alongside the existing `onUpload` prop from P1-10):

```tsx
captureSource?: 'file-only' | 'camera-only' | 'both';  // default: 'both'
captureMode?:   'photo' | 'video' | 'both';             // default inferred from accepted MIME types
```

Behaviour:
- `captureMode: 'photo'` → `<CameraCapture mode="photo">` (audio: false).
- `captureMode: 'video'` → `<CameraCapture mode="video">` (audio: true via `useCamera({ audio: true })`).
- `captureMode: 'both'` → `<CameraCapture mode="both">` — user picks action in the viewfinder.
- Captured `Blob` bridged to `onUpload` via `new File([blob], filename, { type: blob.type })` (same pattern as P1-13).
- Mobile fallback via `<input accept="video/*" capture="environment">` when `isSupported === false` and `captureMode` includes video, or `<input accept="image/*" capture="environment">` when photo-only.

**Git commit after P1-14**: `feat: phase 1 (part 3) - camera capture: useCamera hook, CameraCapture primitive, ImageUpload + MediaUploadField camera extensions`  
**BUSINESS_AND_COMPONENTS.md §12**: mark P1-11 through P1-14 ✅

---

### P1-15 · Extend `ui/FilterFacetSection` — explicit multi-select + Select All / Clear Section

**File**: `src/components/ui/FilterFacetSection.tsx`  
**Test**: update `src/components/ui/__tests__/FilterFacetSection.test.tsx`

**New / changed props**:

```tsx
interface FilterFacetSectionProps {
  // ... existing props unchanged ...
  selected:  string[];                              // multi-value array (already exists)
  onChange:  (values: string[]) => void;            // replaces full selection (already exists)

  // NEW
  maxSelections?: number;                           // cap how many values can be selected at once (default: unlimited)
  showSelectAll?: boolean;                          // renders "Select all" / "Deselect all" toggle (default: false)
  selectionMode?:  'multi' | 'single';              // 'multi' = checkbox (default); 'single' = radio-style (one at a time)
}
```

Behaviour rules for `selectionMode: 'multi'` (default):
- Clicking an unselected option **appends** its value to `selected[]` — never replaces.
- Clicking a selected option **removes** it from `selected[]`.
- When `showSelectAll` is `true` and all visible options are selected → label changes to "Deselect all"; otherwise "Select all". The action selects/deselects **all visible options** (respecting the inline search filter if active).
- When `maxSelections` is set and the limit is reached, unselected checkboxes become `disabled` with `aria-disabled="true"` and `Tooltip` showing `t('filters.maxSelectionsReached', { max: maxSelections })`.

Behaviour rules for `selectionMode: 'single'`:
- Renders radio buttons instead of checkboxes.
- Clicking a value replaces the entire `selected[]` with `[value]`.
- "Select all" / `maxSelections` are ignored when `selectionMode === 'single'`.

Translation keys — add to **both** `messages/en.json` and `messages/hi.json` under `"filters"` namespace:

```json
"filters": {
  "selectAll":            "Select all",
  "deselectAll":          "Deselect all",
  "maxSelectionsReached": "Maximum {max} selections allowed",
  "showMore":             "Show {count} more",
  "showLess":             "Show less",
  "clearSection":         "Clear"
}
```

---

### P1-16 · New `hooks/usePendingFilters` — local deferred filter state

**New file**: `src/hooks/usePendingFilters.ts`  
**Test**: `src/hooks/__tests__/usePendingFilters.test.ts`

```ts
interface UsePendingFiltersOptions {
  table: ReturnType<typeof useUrlTable>;  // the page's useUrlTable instance
  keys:  string[];                        // which URL param keys to manage (e.g. ['status', 'category', 'role'])
}

interface UsePendingFiltersReturn {
  pending:       Record<string, string[]>;             // current uncommitted selections per key
  applied:       Record<string, string[]>;             // values currently in the URL (committed)
  isDirty:       boolean;                              // pending !== applied
  pendingCount:  number;                               // total number of selected values across all pending keys
  appliedCount:  number;                               // total number of selected values in the URL (for badge)
  set:           (key: string, values: string[]) => void;   // update one key in pending state
  apply:         () => void;                           // write all pending keys to useUrlTable (resets page to 1)
  reset:         () => void;                           // discard pending, revert to applied (URL) state
  clear:         () => void;                           // clear all keys in both pending and URL state
}
```

Rules:
- `pending` is initialised from the **current URL params** on mount (so opening a drawer pre-fills with already-applied filters).
- `set(key, values)` updates only `pending` — does NOT call `table.set()`/`table.setMany()`.
- `apply()` calls `table.setMany({ ...Object.fromEntries(Object.entries(pending).map(([k, v]) => [k, v.join(',')])), page: '1' })` — single URL navigation, no multiple history entries.
- `reset()` re-reads current URL params for all tracked `keys` and replaces `pending` with those values.
- `clear()` sets pending to all empty strings AND calls `table.setMany({...})` to clear the URL keys.
- Calling `table.set()` / `table.setMany()` externally (e.g. from a search input) does NOT affect `pending` — the two states are intentionally independent.
- Export from `src/hooks/index.ts`. Zero domain imports.

---

### P1-17 · Update `ui/FilterDrawer` — deferred apply mode

**File**: `src/components/ui/FilterDrawer.tsx`  
**Test**: update `src/components/ui/__tests__/FilterDrawer.test.tsx`

**New prop**:

```tsx
pendingCount?: number;   // from usePendingFilters().pendingCount — drives the Apply button badge
```

**Changed behaviour**:
- The `FilterFacetSection` children rendered inside `FilterDrawer` MUST bind to `usePendingFilters().pending` and call `usePendingFilters().set()` — NOT `table.set()` directly.
- `onApply` fires when the user clicks **Apply** → caller calls `usePendingFilters().apply()` → URL updates once.
- `onReset` fires when the user clicks **Reset all** → caller calls `usePendingFilters().clear()`.
- Closing the drawer without clicking Apply fires `onClose`; the caller (page/view) calls `usePendingFilters().reset()` to discard uncommitted changes.
- The **Apply** button label uses `t('filters.apply')` and shows a `Badge` with `pendingCount` when `pendingCount > 0`.
- No filter value is ever written to the URL until Apply is clicked.

**Mandatory usage pattern** (for every list page using `FilterDrawer`):

```tsx
const table   = useUrlTable({ defaults: { pageSize: '25' } });
const filters = usePendingFilters({ table, keys: ['status', 'category', 'role'] });

<FilterDrawer
  open={drawerOpen}
  onClose={() => { setDrawerOpen(false); filters.reset(); }}   // discard on close
  onApply={() => { filters.apply(); setDrawerOpen(false); }}   // commit on apply
  onReset={() => filters.clear()}
  activeCount={filters.appliedCount}
  pendingCount={filters.pendingCount}
>
  <FilterFacetSection
    title={t('filters.status')}
    options={STATUS_OPTIONS}
    selected={filters.pending['status'] ?? []}
    onChange={(v) => filters.set('status', v)}
    showSelectAll
  />
  <FilterFacetSection
    title={t('filters.category')}
    options={categoryOptions}
    selected={filters.pending['category'] ?? []}
    onChange={(v) => filters.set('category', v)}
    searchable
  />
</FilterDrawer>
```

Translation keys — add under the `"filters"` namespace in both locale files:

```json
"filters": {
  "apply":     "Apply",
  "resetAll":  "Reset all",
  "active":    "{count} active",
  "pending":   "{count} selected"
}
```

---

### P1-18 · Update `ui/AdminFilterBar` — deferred apply for non-search controls

**File**: `src/components/ui/AdminFilterBar.tsx`  
**Test**: update `src/components/ui/__tests__/AdminFilterBar.test.tsx`

**New props**:

```tsx
deferred?:        boolean;            // default false; when true, Apply/Reset buttons appear in the bar
onApply?:         () => void;         // called when Apply button is clicked (only shown when deferred=true)
onReset?:         () => void;         // called when Reset button is clicked (only shown when deferred=true)
pendingCount?:    number;             // from usePendingFilters().pendingCount; drives Apply badge
```

Behaviour rules:

| `deferred` | Search input | Filter `<Select>` / `<Toggle>` controls | Apply / Reset buttons |
|---|---|---|---|
| `false` (default) | Debounced 300 ms → instant URL update | Instant `table.set()` on change | Hidden |
| `true` | Debounced 300 ms → instant URL update (search is always instant) | Write to `usePendingFilters().pending` — NO URL update | Visible; Apply calls `onApply`, Reset calls `onReset` |

- `deferred=true` is the **required** setting for all admin list pages, all seller list pages, and all public list pages that expose more than one non-search filter control.
- `deferred=false` remains for single-filter bars (e.g. a bar with only a search box) to preserve backward compatibility.
- The Apply button uses `variant="primary"` with a numeric `Badge` when `pendingCount > 0`.
- The Reset button uses `variant="ghost"` and is only rendered when `filters.appliedCount > 0` OR `filters.isDirty`.

Translation keys — add under `"filters"` namespace (already defined in P1-17):
```json
"filters": {
  "apply":  "Apply",
  "reset":  "Reset"
}
```

**Git commit after P1-18**: `feat: phase 1 (part 4) - multi-select filters with deferred apply: FilterFacetSection, usePendingFilters, FilterDrawer, AdminFilterBar`  
**BUSINESS_AND_COMPONENTS.md §12**: mark P1-15 through P1-18 ✅

---

## Phase 2 — Move All Business Directories (15 tasks)

---

### P2-1 · Admin sub-directories → `features/admin/components/`

**Files to move** (from `src/components/admin/<subdir>/` → `src/features/admin/components/`; flatten sub-dirs):

| Sub-dir | Files |
|---------|-------|
| `products/` | `ProductForm.tsx`, `ProductTableColumns.tsx`, `types.ts` |
| `orders/` | `OrderTableColumns.tsx`, `OrderStatusForm.tsx` |
| `users/` | `UserTableColumns.tsx`, `UserFilters.tsx`, `UserDetailDrawer.tsx`, `types.ts` |
| `carousel/` | `CarouselSlideForm.tsx`, `CarouselTableColumns.tsx`, `types.ts` |
| `categories/` | `CategoryForm.tsx`, `CategoryTableColumns.tsx`, `types.ts` |
| `blog/` | `BlogForm.tsx`, `BlogTableColumns.tsx` |
| `sections/` | `SectionForm.tsx`, `SectionTableColumns.tsx`, `types.ts` |
| `reviews/` | `ReviewDetailView.tsx`, `ReviewTableColumns.tsx`, `types.ts` |
| `faqs/` | `FaqForm.tsx`, `FaqTableColumns.tsx`, `types.ts` |
| `coupons/` | `CouponForm.tsx`, `CouponTableColumns.tsx` |
| `bids/` | `BidTableColumns.tsx` |
| `site/` | `SiteBasicInfoForm.tsx`, `SiteContactForm.tsx`, `SiteSocialLinksForm.tsx` |
| `payouts/` | `PayoutStatusForm.tsx`, `PayoutTableColumns.tsx` |
| `dashboard/` | `QuickActionsGrid.tsx` (MIXED — uses `ROUTES`) |
| Top-level | `AdminTabs.tsx`, `AdminSessionsManager.tsx`, `SessionTableColumns.tsx` |

**Stays in `src/components/admin/`** (generics, do NOT move):  
`AdminFilterBar`, `AdminPageHeader`, `AdminStatsCards`, `DataTable`, `DrawerFormFooter`, `RichTextEditor`, `GridEditor`, `CategoryTreeView`, `BackgroundSettings`, `ImageUpload`, `MediaUploadField`, `dashboard/AdminDashboardSkeleton`, `dashboard/RecentActivityCard`, `media/MediaTableColumns`, `media/MediaOperationForm`

**Importers**: All 18 `AdminXxxView.tsx` files in `src/features/admin/` import these. After the move, update each view's admin component imports to use relative paths or `@/features/admin`.

**Destination barrel**: Create/update `src/features/admin/components/index.ts` to export all moved files. Update `src/features/admin/index.ts` to re-export from `./components`.

**Remove** all sub-directory exports from `src/components/admin/index.ts` after the move.

**Git commit**: `refactor: phase 2.1 - move admin sub-directory business components to features/admin`

---

### ✅ P2-2 · `components/products/` → `features/products/components/`

**Files to move**: `ProductCard.tsx`, `ProductGrid.tsx`, `ProductFilters.tsx`, `ProductActions.tsx`, `ProductInfo.tsx`, `ProductReviews.tsx`, `ProductSortBar.tsx`, `ProductFeatureBadges.tsx`, `RelatedProducts.tsx`, `AddToCartButton.tsx`

**During move**:
- Update `ProductCard.tsx` to use `<PriceDisplay>` (P1-5) for the price block.
- Update `ProductFilters.tsx` to ensure it imports from `@/components` (not `@/components/categories`).

**Importers to update**: Any file importing `ProductCard`, `ProductGrid`, etc. from `@/components` → change to `@/features/products`.

**Git commit**: `refactor: phase 2.2 - move product components to features/products`

> **Note**: ProductCard, ProductGrid, ProductFilters, ProductSortBar retained in `src/components/products/` (Tier 1 — used across multiple features). Feature views (ProductInfo, ProductReviews, ProductActions, ProductFeatureBadges, RelatedProducts, AddToCartButton) moved to features only.

---

### ✅ P2-3 · `components/auctions/` → `features/products/components/`

> Auctions are part of the `products` feature (same domain).

**Files to move**: `AuctionCard.tsx`, `AuctionGrid.tsx`, `AuctionDetailView.tsx`, `BidHistory.tsx`, `PlaceBidForm.tsx`

**During move**:
- Update `AuctionCard.tsx` to use `<CountdownDisplay>` (P1-4) instead of inline countdown rendering.

**Git commit**: `refactor: phase 2.3 - move auction components to features/products`

> **Note**: AuctionCard, AuctionGrid retained in `src/components/auctions/` (Tier 1 — used by search/categories). BidHistory, PlaceBidForm, AuctionDetailView moved to features only.

---

### ✅ P2-4 · `components/user/**` → `features/user/components/`

**Files to move** (flatten all sub-dirs into `features/user/components/`):

| Source path | File |
|-------------|------|
| `user/` | `WishlistButton.tsx`, `UserTabs.tsx` |
| `user/addresses/` | `AddressCard.tsx`, `AddressForm.tsx` |
| `user/orders/` | `OrderTrackingView.tsx` |
| `user/profile/` | `ProfileHeader.tsx`, `ProfileStatsGrid.tsx`, `PublicProfileView.tsx` |
| `user/settings/` | `AccountInfoCard.tsx`, `EmailVerificationCard.tsx`, `PasswordChangeForm.tsx`, `PhoneVerificationCard.tsx`, `ProfileInfoForm.tsx` |
| `user/notifications/` | `NotificationItem.tsx`, `NotificationsBulkActions.tsx` |

**During move**:
- Update `ProfileStatsGrid.tsx` to use `<StatsGrid>` (P1-2) for the grid layout.

**Importers to update**: Pages under `src/app/[locale]/(user)/`, existing views in `src/features/user/`.

**Git commit**: `refactor: phase 2.4 - move user components to features/user`

> **Note**: AddressCard, AddressForm, WishlistButton, ProfileHeader, ProfileStatsGrid, EmailVerificationCard, PhoneVerificationCard, ProfileInfoForm, PasswordChangeForm, AccountInfoCard retained in `src/components/user/` (Tier 1 — explicitly listed in copilot Rule 7). Views (OrderTrackingView, PublicProfileView, NotificationItem, NotificationsBulkActions, UserTabs) moved to features only.

---

### ✅ P2-5 · `components/seller/` → `features/seller/components/`

**Files to move**: `SellerStorefrontView.tsx`, `SellerAnalyticsStats.tsx`, `SellerPayoutHistoryTable.tsx`, `SellerPayoutRequestForm.tsx`, `SellerPayoutStats.tsx`, `SellerRevenueChart.tsx`, `SellerTabs.tsx`, `SellerTopProducts.tsx`, `PayoutTableColumns.tsx`

**Importers to update**: Seller feature views, seller pages.

**Git commit**: `refactor: phase 2.5 - move seller components to features/seller`

---

### ✅ P2-6 · `components/cart/` + `components/checkout/` → `features/cart/components/`

**Files to move from `cart/`**: `CartItemList.tsx`, `CartItemRow.tsx`, `CartSummary.tsx`, `PromoCodeInput.tsx`

**Files to move from `checkout/`**: `CheckoutView.tsx`, `CheckoutAddressStep.tsx`, `CheckoutOrderReview.tsx`, `CheckoutSuccessView.tsx`, `OrderSuccessActions.tsx`, `OrderSuccessCard.tsx`, `OrderSummaryPanel.tsx`, `OrderSuccessHero.tsx`

**During move**:
- `CartItemRow.tsx` → use `<ItemRow>` (P1-6) for the horizontal layout.
- `CartSummary.tsx` → use `<SummaryCard>` (P1-7) for the summary layout.
- `CheckoutView.tsx` → use `<StepperNav>` (P1-1) instead of `<CheckoutStepper>`.
- **Delete** `src/components/checkout/CheckoutStepper.tsx` after `StepperNav` is confirmed working.

**Git commit**: `refactor: phase 2.6 - move cart and checkout components to features/cart`

---

### P2-7 · `components/blog/` → `features/blog/components/`

**Files to move**: `BlogCard.tsx`, `BlogCategoryTabs.tsx`, `BlogFeaturedCard.tsx`

**Git commit**: `refactor: phase 2.7 - move blog components to features/blog`

---

### P2-8 · `components/categories/` → `features/categories/components/`

**Files to move**: `CategoryCard.tsx`, `CategoryGrid.tsx`

**Git commit**: `refactor: phase 2.8 - move category components to features/categories`

---

### P2-9 · `components/reviews/` → `features/reviews/components/`

**Files to move**: `ReviewCard.tsx`

**During move**: Update `ReviewCard.tsx` to use `<RatingDisplay>` (P1-3).

**Git commit**: `refactor: phase 2.9 - move review components to features/reviews`

---

### P2-10 · `components/search/` → `features/search/components/`

**Files to move**: `SearchFiltersRow.tsx`, `SearchResultsSection.tsx`

**Git commit**: `refactor: phase 2.10 - move search components to features/search`

---

### P2-11 · Create `features/homepage/` + move `components/homepage/`

> **New feature module** — does not exist yet.

**Create structure**:
```
src/features/homepage/
  components/
    index.ts
  index.ts
```

**Files to move**: `HeroCarousel.tsx`, `FeaturedProductsSection.tsx`, `FeaturedAuctionsSection.tsx`, `TopCategoriesSection.tsx`, `CustomerReviewsSection.tsx`, `BlogArticlesSection.tsx`, `FAQSection.tsx`, `WelcomeSection.tsx`, `WhatsAppCommunitySection.tsx`, `AdvertisementBanner.tsx`, `SectionCarousel.tsx`, `SiteFeaturesSection.tsx`, `TrustFeaturesSection.tsx`, `TrustIndicatorsSection.tsx`, `HomepageSkeleton.tsx`

**Importers to update**: Homepage page at `src/app/[locale]/(home)/page.tsx` (or equivalent).

**Git commit**: `refactor: phase 2.11 - create features/homepage, move homepage components`

---

### P2-12 · Create `features/faq/` + move `components/faq/`

> **New feature module** — does not exist yet.

**Create structure**:
```
src/features/faq/
  components/
    index.ts
  index.ts
```

**Files to move**: `FAQPageContent.tsx`, `FAQAccordion.tsx`, `FAQCategorySidebar.tsx`, `FAQHelpfulButtons.tsx`, `FAQSortDropdown.tsx`, `RelatedFAQs.tsx`, `ContactCTA.tsx`

**Note**: `FAQSearchBar.tsx` is already deleted in P0-2.

**Git commit**: `refactor: phase 2.12 - create features/faq, move faq components`

---

### P2-13 · Create `features/contact/` + move `components/contact/`

> **New feature module** — does not exist yet.

**Create structure**:
```
src/features/contact/
  components/
    index.ts
  index.ts
```

**Files to move**: `ContactForm.tsx`, `ContactInfoSidebar.tsx`

**Git commit**: `refactor: phase 2.13 - create features/contact, move contact components`

---

### P2-14 · Create `features/promotions/` + move `components/promotions/`

> **New feature module** — does not exist yet.

**Create structure**:
```
src/features/promotions/
  components/
    index.ts
  index.ts
```

**Files to move**: `CouponCard.tsx`, `ProductSection.tsx`

**Git commit**: `refactor: phase 2.14 - create features/promotions, move promotions components`

---

### P2-15 · Create `features/about/` + move `components/about/`

> **New feature module** — does not exist yet.

**Create structure**:
```
src/features/about/
  components/
    index.ts
  index.ts
```

**Files to move**: `AboutView.tsx`

**Git commit**: `refactor: phase 2.15 - create features/about, move about view`

---

## Phase 3 — Move Misplaced Business Components from `ui/`

These 4 files live in `src/components/ui/` but import domain hooks — they must move to their feature.

| Task | Source file | Destination |
|------|-------------|-------------|
| P3-1 | `ui/AddressSelectorCreate.tsx` | `features/user/components/` |
| P3-2 | `ui/CategorySelectorCreate.tsx` | `features/categories/components/` |
| P3-3 | `ui/EventBanner.tsx` | `features/events/components/` |
| P3-4 | `ui/NotificationBell.tsx` | `features/user/components/` |

For each:
1. Move file to destination
2. Update `features/<domain>/components/index.ts` + `features/<domain>/index.ts`
3. Remove export from `src/components/ui/index.ts` and `src/components/index.ts`
4. Find all importers (`grep -rn "AddressSelectorCreate\|CategorySelectorCreate\|EventBanner\|NotificationBell"`) and update to `@/features/<domain>`

**Git commit**: `refactor: phase 3 - move misplaced business components from ui/ to features`  
**BUSINESS_AND_COMPONENTS.md §12**: mark Phase 3 rows ✅

---

## Phase 4 — Genericize Layout Components

Each layout file currently imports domain data (`useAuth`, `MAIN_NAV_ITEMS`, `SITE_CONFIG`, `ROUTES`). The pattern:

1. Create a new **generic** layout component (all data via props, zero domain imports).
2. Keep the original file as a **thin config shell** that reads domain data and passes it to the generic.
3. Or update `src/app/LayoutClient.tsx` to inject the data.

---

### P4-1 · `BottomNavbar` → `BottomNavLayout`

**Source to read first**: `src/components/layout/BottomNavbar.tsx`

**New generic**: `src/components/layout/BottomNavLayout.tsx`
```tsx
interface BottomNavLayoutProps {
  items: { href: string; label: string; icon: React.ReactNode }[];
  activeHref: string;
  user: { uid: string } | null;
}
```

**Config injection**: `LayoutClient.tsx` imports `useAuth` + `ROUTES`-based items and passes to `BottomNavLayout`.  
**Compatibility**: `BottomNavbar.tsx` re-exports `BottomNavLayout` as `BottomNavbar` during transition.

---

### P4-2 · `Sidebar` → `SidebarLayout`

**Source to read first**: `src/components/layout/Sidebar.tsx`

**New generic**: `src/components/layout/SidebarLayout.tsx`
```tsx
interface SidebarLayoutProps {
  items: NavItemConfig[];
  user: UserProfile | null;
  logoSrc: string;
  onLogout: () => void;
}
```

**Config injection**: `LayoutClient.tsx` injects `MAIN_NAV_ITEMS`, `useAuth().user`, `useLogout().logout`.

---

### P4-3 · `TitleBar` → `TitleBarLayout`

**Source to read first**: `src/components/layout/TitleBar.tsx`

**New generic**: `src/components/layout/TitleBarLayout.tsx`
```tsx
interface TitleBarLayoutProps {
  brandName: string;
  logoUrl: string;
  user: UserProfile | null;
}
```

**Config injection**: `LayoutClient.tsx` injects `SITE_CONFIG.name`, `SITE_CONFIG.logoUrl`, `useAuth().user`.

---

### P4-4 · `Footer` → `FooterLayout`

**Source to read first**: `src/components/layout/Footer.tsx`

**New generic**: `src/components/layout/FooterLayout.tsx`
```tsx
interface FooterLayoutProps {
  linkGroups: { heading: string; links: { label: string; href: string }[] }[];
  brandName: string;
  year: number;
  socialLinks?: { platform: string; href: string; icon: React.ReactNode }[];
}
```

**Config injection**: `LayoutClient.tsx` injects `SITE_CONFIG`, `ROUTES`-based link groups.

---

### P4-5 · `MainNavbar` → `NavbarLayout`

**Source to read first**: `src/components/layout/MainNavbar.tsx`

**New generic**: `src/components/layout/NavbarLayout.tsx`
```tsx
interface NavbarLayoutProps {
  items: NavItemConfig[];
  logoSrc: string;
  searchSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
}
```

**Config injection**: `LayoutClient.tsx` injects `MAIN_NAV_ITEMS`.

**Git commit**: `refactor: phase 4 - genericize layout components (BottomNavLayout, SidebarLayout, TitleBarLayout, FooterLayout, NavbarLayout)`  
**BUSINESS_AND_COMPONENTS.md §12**: mark Phase 4 rows ✅

---

## Phase 5 — Barrel Cleanup

### P5-1 · Clean `src/components/index.ts`

Remove all domain re-exports (these dirs are now empty after Phase 2):

```diff
- export * from "./products";
- export * from "./cart";
- export * from "./checkout";
- export * from "./categories";
- export * from "./auctions";
- export * from "./seller";
- export * from "./blog";
- export * from "./reviews";
- export * from "./promotions";
- export * from "./contact";
- export * from "./search";
- export * from "./faq";
- export * from "./homepage";
- export * from "./about";
- export * from "./user";   // business parts already removed
```

### P5-2 · Clean `src/components/admin/index.ts`

Remove the sub-directory re-exports for all sub-dirs that were moved to `features/admin/`.  
Only keep: `AdminFilterBar`, `AdminPageHeader`, `AdminStatsCards`, `DataTable`, `DrawerFormFooter`, `RichTextEditor`, `GridEditor`, `CategoryTreeView`, `BackgroundSettings`, `ImageUpload`, `MediaUploadField`, `AdminDashboardSkeleton`, `RecentActivityCard`, `MediaTableColumns`, `MediaOperationForm`.

### P5-3 · Clean `src/components/user/index.ts`

Remove all re-exports — the entire `user/` directory is now gone (moved to `features/user/`).  
Delete the file if empty.

### P5-4 · Verify all feature barrels

For each new/updated feature, confirm `src/features/<domain>/index.ts` exports everything that pages, other features (via Tier 1 only), or test files need:

```powershell
# Quick check — find any broken import
npx tsc --noEmit
```

**Git commit**: `chore: phase 5 - clean up component barrel exports`  
**BUSINESS_AND_COMPONENTS.md §12**: mark Phase 5 rows ✅

---

## Phase 6 — Full Verification

```powershell
# Step 1: TypeScript
npx tsc --noEmit
# Must report: Found 0 errors.

# Step 2: Production build
npm run build
# Must complete with no errors.

# Step 3: Tests
npm test
# All suites must pass.
```

Fix any remaining errors, then:

**Git commit**: `chore: phase 6 - refactor complete (0 TS errors, build passes, all tests pass)`  
**BUSINESS_AND_COMPONENTS.md §12**: mark Phase 6 rows ✅

---

## Quick Reference: All Commits in Order

| # | Commit message | Phase tasks |
|---|----------------|-------------|
| 1 | `chore: phase 0 - delete orphan and duplicate components` | P0-1, P0-2 |
| 2 | `feat: phase 1 (part 1) - new generic ui primitives: StepperNav, StatsGrid, RatingDisplay, CountdownDisplay, PriceDisplay, ItemRow, SummaryCard` | P1-1 → P1-7 |
| 3 | `feat: phase 1 (part 2) - genericize RoleBadge, ImageUpload, MediaUploadField` | P1-8 → P1-10 |
| 4 | `feat: phase 1 (part 3) - camera capture: useCamera hook, CameraCapture primitive, ImageUpload + MediaUploadField camera extensions` | P1-11 → P1-14 |
| 5 | `feat: phase 1 (part 4) - multi-select filters with deferred apply: FilterFacetSection, usePendingFilters, FilterDrawer, AdminFilterBar` | P1-15 → P1-18 |
| 6 | `refactor: phase 2.1 - move admin sub-directory business components to features/admin` | P2-1 |
| 7 | `refactor: phase 2.2 - move product components to features/products` | P2-2 |
| 8 | `refactor: phase 2.3 - move auction components to features/products` | P2-3 |
| 9 | `refactor: phase 2.4 - move user components to features/user` | P2-4 |
| 10 | `refactor: phase 2.5 - move seller components to features/seller` | P2-5 |
| 11 | `refactor: phase 2.6 - move cart and checkout components to features/cart` | P2-6 |
| 12 | `refactor: phase 2.7 - move blog components to features/blog` | P2-7 |
| 13 | `refactor: phase 2.8 - move category components to features/categories` | P2-8 |
| 14 | `refactor: phase 2.9 - move review components to features/reviews` | P2-9 |
| 15 | `refactor: phase 2.10 - move search components to features/search` | P2-10 |
| 16 | `refactor: phase 2.11 - create features/homepage, move homepage components` | P2-11 |
| 17 | `refactor: phase 2.12 - create features/faq, move faq components` | P2-12 |
| 18 | `refactor: phase 2.13 - create features/contact, move contact components` | P2-13 |
| 19 | `refactor: phase 2.14 - create features/promotions, move promotions components` | P2-14 |
| 20 | `refactor: phase 2.15 - create features/about, move about view` | P2-15 |
| 21 | `refactor: phase 3 - move misplaced business components from ui/ to features` | P3-1 → P3-4 |
| 22 | `refactor: phase 4 - genericize layout components` | P4-1 → P4-5 |
| 23 | `chore: phase 5 - clean up component barrel exports` | P5-1 → P5-4 |
| 24 | `chore: phase 6 - refactor complete (0 TS errors, build passes, all tests pass)` | P6-1 → P6-3 |

---

## File Count Impact Summary

| Location | Before | After |
|----------|--------|-------|
| `src/components/` total | ~200 files | ~86 files (generics only) |
| `src/features/` total | ~90 files | ~209 files |
| Net new (generics) | — | 11 new files (StepperNav, StatsGrid, RatingDisplay, CountdownDisplay, PriceDisplay, ItemRow, SummaryCard, CameraCapture, useCamera, usePendingFilters + updates to FilterFacetSection / FilterDrawer / AdminFilterBar) |
| Net deleted | — | 5 (3 empty orphans + ProductImageGallery + FAQSearchBar) |
| Net moved | — | ~105 files (nothing rewritten, just relocated) |

---

## Dependency Rules (Never Violate)

```
Page (src/app/)
  ↓ imports
Feature (src/features/<domain>/)
  ↓ imports
Generic Primitive (src/components/)
  ↓ imports
React / THEME_CONSTANTS / Tier 1 hooks+utils
```

- **Features NEVER import from other features.** Cross-feature shared logic → elevate to `src/components/` (Tier 1).
- **`src/components/` NEVER imports domain types** (`*Document`, `*Status`, domain hooks, domain services).
- **Pages NEVER include inline business logic** — render one feature view component only.
