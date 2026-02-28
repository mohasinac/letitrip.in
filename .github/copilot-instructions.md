# LetItRip Copilot Instructions

> **These are MANDATORY rules. Every line of code you write MUST comply.**
> For detailed codebase reference, see `docs/GUIDE.md`.

---

## Developer Environment

**OS**: Windows 11  
**Shell**: PowerShell  
**Language**: English  
**Workspace root**: `D:\proj\letitrip.in`

### Copilot Behaviour Guidelines (Context Optimization)

- **Be concise by default** — skip preamble and postamble; answer directly. No "Here's what I did" summaries, no bullet-list recaps of completed steps unless the user asks. Expand only when the user explicitly requests detail or explanation.
- **Avoid large file reads** — use targeted `grep_search` or line-range reads; never read a whole file when a search suffices.
- **Prefer targeted searches** — use specific glob patterns and focused queries; avoid broad workspace scans.
- **Minimize parallel tool calls** — run only the tools necessary for the current step; avoid speculative reads.
- **Windows paths** — always use backslash-compatible absolute paths (`D:\proj\letitrip.in\...`) in terminal commands; use forward slashes only in import statements.
- **PowerShell syntax** — use `;` to chain commands, never `&&`; use `Get-ChildItem`, `Test-Path`, etc. instead of Unix aliases.

---

## Stack

Next.js 16.1.1 (App Router) | TypeScript | Tailwind CSS | Firebase (Auth, Firestore, Storage, Realtime DB) | Resend (email) | React Context + hooks

---

## Architecture: Three-Tier Pluggable Design

The codebase is structured in three clearly separated tiers. This boundary is **enforced** to ensure that shared code can be extracted into a standalone package (e.g. `@letitrip/ui`, `@letitrip/utils`) in the future without touching page or feature code.

```
┌──────────────────────────────────────────────────────────
│  Tier 3 — Page Layer          src/app/
│  Thin orchestration. Composes Tier 1 + Tier 2.
├──────────────────────────────────────────────────────────
│  Tier 2 — Feature Modules     src/features/<name>/
│  Vertically-sliced domains. Each feature owns its own
│  components, hooks, types, constants, and utils.
│  Consumes Tier 1. NEVER imports from other features.
├──────────────────────────────────────────────────────────
│  Tier 1 — Shared Primitives   src/components/ui|forms|…
│                                src/hooks/  src/utils/
│                                src/helpers/ src/classes/
│                                src/constants/
│  Feature-agnostic building blocks. Extractable to a
│  package with only tsconfig alias changes.
└──────────────────────────────────────────────────────────
```

### Feature Module Directory Layout

Every domain feature lives under `src/features/<name>/` with this shape:

```
src/features/
  products/
    components/    ← ProductCard, ProductGrid, ProductFilters, etc.
    hooks/         ← useProducts, useProductFilters (data hooks for this feature)
    types/         ← ProductFilter, ProductSort (feature-specific types)
    constants/     ← PRODUCT_SORT_OPTIONS, PRODUCT_STATUS_TABS
    utils/         ← product-specific mappers/formatters (optional)
    index.ts       ← PUBLIC barrel — only export what pages need
  auth/
  orders/
  cart/
  auctions/
  reviews/
  search/
  blog/
  categories/
  admin/
  seller/
  user/
```

**Feature `index.ts` pattern:**
```typescript
// src/features/products/index.ts
export * from './components';
export * from './hooks';
export * from './types';
export * from './constants';
```

### Import Dependency Rules

| From | May import | Must NOT import |
|------|-----------|-----------------|
| **Page** (`src/app/`) | Tier 1 + Tier 2 | — |
| **Feature** (`src/features/X/`) | Tier 1 only | Other features (`src/features/Y/`) |
| **Shared Primitives** | Other Tier 1 modules | Any feature module |

**Cross-feature shared logic** → elevate to Tier 1 (`src/hooks/`, `src/utils/`, `src/components/ui/`).

---

## RULE 1: Feature Module Architecture

**New features MUST be built as feature modules under `src/features/<name>/`.**

```tsx
// WRONG — feature component outside its feature folder
src/components/auction/AuctionCard.tsx

// WRONG — feature imports another feature directly
// src/features/cart/components/CartItem.tsx
import { ProductCard } from '@/features/products'; // ❌

// RIGHT — feature uses shared primitives only
import { Card, Button } from '@/components';      // ✅ Tier 1
import { formatCurrency } from '@/utils';          // ✅ Tier 1
import { useApiQuery } from '@/hooks';             // ✅ Tier 1

// RIGHT — page composes features + shared
import { ProductGrid, useProducts } from '@/features/products'; // ✅
import { CartButton } from '@/features/cart';                   // ✅
import { Button } from '@/components';                          // ✅
```

---

## RULE 2: Use Barrel Imports Only

**NEVER import from individual files. ALWAYS use barrel `index.ts` exports.**

```tsx
// WRONG
import { Button } from '@/components/ui/Button';
import { isValidEmail } from '@/utils/validators/email.validator';
import { groupBy } from '@/helpers/data/array.helper';

// RIGHT
import { Button } from '@/components';
import { isValidEmail } from '@/utils';
import { groupBy } from '@/helpers';
```

| Need | Import from | Tier |
|------|------------|------|
| **Feature components & hooks** (ProductCard, useProducts...) | `@/features/<name>` | 2 |
| UI primitives (Button, Card, Input, Alert, Modal...) | `@/components` | 1 |
| Admin components (AdminPageHeader, AdminFilterBar, DrawerFormFooter...) | `@/components` | 1 |
| User components (AddressForm, AddressCard, ProfileHeader...) | `@/components` | 1 |
| Constants (UI_LABELS, THEME_CONSTANTS, ROUTES...) | `@/constants` | 1 |
| Navigation tab configs (ADMIN_TAB_ITEMS, USER_TAB_ITEMS) | `@/constants` | 1 |
| Role hierarchy (ROLE_HIERARCHY) | `@/constants` | 1 |
| Hooks (useAuth, useApiQuery, useForm...) | `@/hooks` | 1 |
| Validators, formatters, converters, events | `@/utils` | 1 |
| Auth/data/UI helpers | `@/helpers` | 1 |
| Singletons (CacheManager, Logger, EventBus...) | `@/classes` | 1 |
| Domain service functions (productService, cartService...) | `@/services` | 1 |
| Feature service functions (eventService...) | `@/features/<name>/services` | 2 |
| Repositories (userRepository, orderRepository...) | `@/repositories` | — |
| DB schemas & types | `@/db/schema` | — |
| Schema field constants (USER_FIELDS, SCHEMA_DEFAULTS...) | `@/db/schema` | — |
| API types | `@/types/api` | — |
| Auth types (UserRole, UserProfile...) | `@/types/auth` | — |
| Error classes (AppError, ApiError...) | `@/lib/errors` | — |
| Contexts (useSession, useTheme) | `@/contexts` | — |
| Snippets | `@/snippets/<name>.snippet` | — |

> **Tier 1** = shared primitives. **Tier 2** = feature modules. **—** = infrastructure layer.

---

## RULE 3: ZERO Hardcoded Strings

**NEVER write literal UI text. ALWAYS use the right string constant for the context.**

> **i18n rule (client components):** For any React component that renders JSX, use `useTranslations()` from `next-intl` — NOT `UI_LABELS`. `UI_LABELS` is for API routes, server utilities, and non-JSX code only.

```tsx
// WRONG — hardcoded literal
<button>Save</button>

// WRONG — UI_LABELS in a client component
import { UI_LABELS } from '@/constants';
<button>{UI_LABELS.ACTIONS.SAVE}</button>

// RIGHT — useTranslations in a client component
import { useTranslations } from 'next-intl';
const t = useTranslations('actions'); // called INSIDE the component function
<button>{t('save')}</button>

// RIGHT — UI_LABELS in API route (server, non-JSX)
import { UI_LABELS } from '@/constants';
return successResponse(result, SUCCESS_MESSAGES.PRODUCT.CREATED);
```

**`useTranslations()` must be called inside the component function body, never at module scope.**

**Interpolation** — use `t("key", { variable })`, NOT string `.replace()`:
```tsx
// WRONG
{UI_LABELS.AUTH.RESET_LINK_SENT_TO.replace('{email}', email)}
// RIGHT
{t('forgotPassword.resetLinkSentTo', { email })}
```

### String Lookup Table (API routes / server utilities only)

| Instead of writing... | Use this constant |
|----------------------|-------------------|
| `"Loading..."` | `UI_LABELS.LOADING.DEFAULT` |
| `"Save"` | `UI_LABELS.ACTIONS.SAVE` |
| `"Cancel"` | `UI_LABELS.ACTIONS.CANCEL` |
| `"Delete"` | `UI_LABELS.ACTIONS.DELETE` |
| `"Edit"` | `UI_LABELS.ACTIONS.EDIT` |
| `"Submit"` | `UI_LABELS.ACTIONS.SUBMIT` |
| `"Close"` | `UI_LABELS.ACTIONS.CLOSE` |
| `"Search"` | `UI_LABELS.ACTIONS.SEARCH` |
| `"Confirm"` | `UI_LABELS.ACTIONS.CONFIRM` |
| `"Back"` | `UI_LABELS.ACTIONS.BACK` |
| `"Next"` | `UI_LABELS.ACTIONS.NEXT` |
| `"Retry"` | `UI_LABELS.ACTIONS.RETRY` |
| `"Upload"` | `UI_LABELS.ACTIONS.UPLOAD` |
| `"Download"` | `UI_LABELS.ACTIONS.DOWNLOAD` |
| `"Yes"` / `"No"` | `UI_LABELS.ACTIONS.YES` / `UI_LABELS.ACTIONS.NO` |
| `"Email"` / `"Password"` (form labels) | `UI_LABELS.FORM.EMAIL` / `UI_LABELS.FORM.PASSWORD` |
| `"No data available"` | `UI_LABELS.EMPTY.NO_DATA` |
| `"Active"` / `"Inactive"` | `UI_LABELS.STATUS.ACTIVE` / `UI_LABELS.STATUS.INACTIVE` |

### Placeholders

| Instead of writing... | Use this constant |
|----------------------|-------------------|
| `placeholder="Enter your email"` | `placeholder={UI_PLACEHOLDERS.EMAIL}` |
| `placeholder="Enter your password"` | `placeholder={UI_PLACEHOLDERS.PASSWORD}` |
| `placeholder="Search..."` | `placeholder={UI_PLACEHOLDERS.SEARCH}` |
| `placeholder="Enter phone number"` | `placeholder={UI_PLACEHOLDERS.PHONE}` |

### Messages

| Instead of writing... | Use this constant |
|----------------------|-------------------|
| Error messages | `ERROR_MESSAGES.AUTH.*`, `ERROR_MESSAGES.VALIDATION.*` |
| Success messages | `SUCCESS_MESSAGES.USER.*`, `SUCCESS_MESSAGES.AUTH.*` |
| Help text | `UI_HELP_TEXT.PASSWORD_REQUIREMENTS`, etc. |

**If a constant doesn't exist yet:** add it to `src/constants/ui.ts` or `src/constants/messages.ts`, then export via `src/constants/index.ts`.

### API Route Error/Success Messages

**Every API route MUST use constants for ALL error and success strings.**

| Instead of writing... | Use this constant |
|----------------------|-------------------|
| `"Validation failed"` | `ERROR_MESSAGES.VALIDATION.FAILED` |
| `"Product not found"` | `ERROR_MESSAGES.PRODUCT.NOT_FOUND` |
| `"Category not found"` | `ERROR_MESSAGES.CATEGORY.NOT_FOUND` |
| `"Review not found"` | `ERROR_MESSAGES.REVIEW.NOT_FOUND` |
| `"FAQ not found"` | `ERROR_MESSAGES.FAQ.NOT_FOUND` |
| `"Carousel slide not found"` | `ERROR_MESSAGES.CAROUSEL.NOT_FOUND` |
| `"Homepage section not found"` | `ERROR_MESSAGES.SECTION.NOT_FOUND` |
| `"Session not found"` | `ERROR_MESSAGES.SESSION.NOT_FOUND` |
| `"Admin access required"` | `ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED` |
| `"No file provided"` | `ERROR_MESSAGES.MEDIA.NO_FILE` |
| `"Invalid file type"` | `ERROR_MESSAGES.UPLOAD.INVALID_TYPE` |
| `"File size exceeds limit"` | `ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE` |
| `"Failed to fetch X"` | `ERROR_MESSAGES.X.FETCH_FAILED` |
| `"Failed to create X"` | `ERROR_MESSAGES.X.CREATE_FAILED` |
| `"Failed to update X"` | `ERROR_MESSAGES.X.UPDATE_FAILED` |
| `"Failed to delete X"` | `ERROR_MESSAGES.X.DELETE_FAILED` |
| `"X created successfully"` | `SUCCESS_MESSAGES.X.CREATED` |
| `"X updated successfully"` | `SUCCESS_MESSAGES.X.UPDATED` |
| `"X deleted successfully"` | `SUCCESS_MESSAGES.X.DELETED` |

**Available ERROR_MESSAGES categories**: `AUTH`, `VALIDATION`, `USER`, `PASSWORD`, `EMAIL`, `UPLOAD`, `GENERIC`, `DATABASE`, `SESSION`, `ADMIN`, `REVIEW`, `FAQ`, `CATEGORY`, `CAROUSEL`, `SECTION`, `ORDER`, `PRODUCT`, `PHONE`, `MEDIA`, `ADDRESS`, `API`.

**Available SUCCESS_MESSAGES categories**: `AUTH`, `USER`, `UPLOAD`, `EMAIL`, `PHONE`, `PASSWORD`, `ACCOUNT`, `ADMIN`, `REVIEW`, `FAQ`, `CATEGORY`, `CAROUSEL`, `SECTION`, `ORDER`, `PRODUCT`, `ADDRESS`, `SESSION`, `MEDIA`, `LOGS`, `NEWSLETTER`.

---

## RULE 4: Use THEME_CONSTANTS for Styling

**NEVER write raw repeated Tailwind strings. Use `THEME_CONSTANTS` from `@/constants`.**

### Class Replacement Table

| Instead of writing... | Use |
|----------------------|-----|
| `"space-y-4"` | `THEME_CONSTANTS.spacing.stack` |
| `"space-x-4"` | `THEME_CONSTANTS.spacing.inline` |
| `"p-2"` / `"p-4"` / `"p-6"` | `THEME_CONSTANTS.spacing.padding.xs` / `.md` / `.lg` |
| `"gap-2"` / `"gap-4"` / `"gap-6"` | `THEME_CONSTANTS.spacing.gap.xs` / `.md` / `.lg` |
| `"text-4xl md:text-5xl font-bold"` | `THEME_CONSTANTS.typography.h1` |
| `"text-3xl md:text-4xl font-bold"` | `THEME_CONSTANTS.typography.h2` |
| `"text-2xl md:text-3xl font-bold"` | `THEME_CONSTANTS.typography.h3` |
| `"text-xl font-bold"` | `THEME_CONSTANTS.typography.h4` |
| `"max-w-xl"` / `"max-w-2xl"` | `THEME_CONSTANTS.container.xl` / `.2xl` |
| `"rounded-xl"` | `THEME_CONSTANTS.borderRadius.xl` |
| `"bg-white dark:bg-gray-900"` | `THEME_CONSTANTS.themed.bgPrimary` |
| `"bg-gray-50 dark:bg-gray-800"` | `THEME_CONSTANTS.themed.bgSecondary` |
| `"text-gray-900 dark:text-white"` | `THEME_CONSTANTS.themed.textPrimary` |
| `"text-gray-600 dark:text-gray-400"` | `THEME_CONSTANTS.themed.textSecondary` |
| `"border-gray-200 dark:border-gray-700"` | `THEME_CONSTANTS.themed.border` |
| `"bg-gradient-to-br from-indigo-50..."` | `THEME_CONSTANTS.card.gradient.indigo` |
| `"border-l-4 border-l-indigo-500..."` (stat card) | `THEME_CONSTANTS.card.stat.indigo` |
| `"bg-emerald-50 text-emerald-700..."` (badge) | `THEME_CONSTANTS.badge.active` |
| `"bg-purple-50 text-purple-700..."` (admin badge) | `THEME_CONSTANTS.badge.admin` |
| `"pb-8 mb-8 bg-gradient-to-r..."` (page header) | `THEME_CONSTANTS.pageHeader.adminGradient` |
| `"bg-gray-50/50 dark:bg-gray-800/20"` | `THEME_CONSTANTS.sectionBg.subtle` |
| Loose `rounded-lg border...focus:ring-2...` (input) | `THEME_CONSTANTS.input.base` |

### Inline Styles

- **FORBIDDEN** for static values (`style={{ color: "#ef4444" }}` -> use `text-red-500`)
- **ALLOWED** only for dynamic calculated values (`style={{ width: \`${pct}%\` }}`)

```tsx
// WRONG
<div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl">
  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Title</h1>
</div>

// RIGHT
import { THEME_CONSTANTS } from '@/constants';
const { spacing, themed, typography, borderRadius } = THEME_CONSTANTS;
<div className={`${spacing.stack} ${themed.bgPrimary} ${spacing.padding.lg} ${borderRadius.xl}`}>
  <h1 className={`${typography.h2} ${themed.textPrimary}`}>Title</h1>
</div>
```

---

## RULE 5: Use Existing Utils & Helpers

**NEVER reimplement logic that already exists. Search before writing.**

### Validation (from `@/utils`)

| Need | Use | NOT |
|------|-----|-----|
| Email validation | `isValidEmail(email)` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)` |
| Password strength | `calculatePasswordStrength(pw)` | Custom regex chains |
| Password requirements | `meetsPasswordRequirements(pw)` | Manual checks |
| Phone validation | `isValidPhone(phone)` | Custom regex |
| URL validation | `isValidUrl(url)` | Custom regex |
| Required check | `isRequired(value)` | `value !== '' && value != null` |
| Min/max length | `minLength(val, n)`, `maxLength(val, n)` | `val.length >= n` |
| Numeric check | `isNumeric(value)` | `!isNaN(Number(value))` |

### Formatting (from `@/utils`)

| Need | Use | NOT |
|------|-----|-----|
| Date display | `formatDate(date)`, `formatRelativeTime(date)` | `date.toLocaleDateString(...)` |
| Currency | `formatCurrency(amount)` | `amount.toFixed(2)` |
| File size | `formatFileSize(bytes)` | Manual KB/MB calculation |
| Truncate text | `truncate(text, length)` | `text.slice(0, n) + '...'` |
| Slugify | `slugify(text)` | Custom regex replace |
| Capitalize | `capitalize(str)`, `capitalizeWords(str)` | Manual charAt operations |
| Strip HTML | `stripHtml(html)` | Custom regex |

### Data Helpers (from `@/helpers`)

| Need | Use | NOT |
|------|-----|-----|
| Group array | `groupBy(arr, key)` | `arr.reduce(...)` grouping loop |
| Unique array | `unique(arr)`, `uniqueBy(arr, key)` | `[...new Set(arr)]` |
| Sort array | `sortBy(arr, key)` | Custom `.sort()` comparator |
| Chunk array | `chunk(arr, size)` | Manual slice loop |
| Pick object keys | `pick(obj, keys)` | Manual object spread |
| Omit object keys | `omit(obj, keys)` | Manual destructure |
| Deep merge | `deepMerge(a, b)` | Spread-based merge |
| Deep clone | `deepCloneObject(obj)` | `JSON.parse(JSON.stringify(...))` |
| Pagination math | `calculatePagination(opts)` | Manual offset/limit |

### UI Helpers (from `@/helpers`)

| Need | Use | NOT |
|------|-----|-----|
| Conditional classes | `classNames(...)` or `cn(...)` | Template literal conditionals |
| Merge Tailwind | `mergeTailwindClasses(...)` | Manual string concat |
| Color conversion | `hexToRgb()`, `rgbToHex()` | Manual parsing |

### Auth Helpers (from `@/helpers`)

| Need | Use | NOT |
|------|-----|-----|
| Role checking | `hasRole(user, role)`, `hasAnyRole(user, roles)` | `user.role === 'admin'` |
| Session expiry | `isSessionExpired(session)` | Manual date comparison |
| Initials | `generateInitials(name)` | `name.split(' ').map(...)` |

### Event Utilities (from `@/utils`)

| Need | Use | NOT |
|------|-----|-----|
| Throttle | `throttle(fn, ms)` | Custom implementation |
| Debounce | `debounce(fn, ms)` | Custom implementation |
| Viewport dims | `getViewportDimensions()` | `window.innerWidth` direct |

---

## RULE 6: Use Existing Hooks

**Check `@/hooks` before creating new hooks.**

| Need | Hook |
|------|------|
| GET data from API | `useApiQuery(endpoint, options)` |
| POST/PUT/DELETE | `useApiMutation(endpoint, options)` |
| Auth state | `useAuth()` or `useSession()` |
| Login | `useLogin()` |
| Register | `useRegister()` |
| Profile CRUD | `useProfile()` |
| File upload | Stage `File` in local state → submit via service fn to `/api/media/upload` (see Rule 11) — **never** `useStorageUpload` |
| Form state | `useForm(config)` |
| Click outside | `useClickOutside(ref, handler)` |
| Keyboard shortcuts | `useKeyPress(key, handler)` |
| Swipe gestures | `useSwipe(options)` |
| Long-press gesture | `useLongPress(callback, options)` — fires after hold; no-op on quick tap |
| Pull-to-refresh | `usePullToRefresh(onRefresh, options)` — overscroll detection |
| Unsaved changes | `useUnsavedChanges(isDirty)` |
| Toast/messages | `useMessage()` |
| Admin stats | `useAdminStats()` |
| Viewport breakpoint | `useBreakpoint()` |
| Media query | `useMediaQuery(query)` |
| RBAC checking | `useRBAC()` — exports `useHasRole`, `useIsAdmin`, `useIsModerator`, `useIsSeller`, `useCanAccess`, `useRequireAuth`, `useRequireRole` |
| Session management | `useMySessions()`, `useAdminSessions()` |
| URL-driven list state (filter/sort/page) | `useUrlTable(options)` — all state in URL query params; bookmark-able, history-safe |

### `useUrlTable` — URL-Driven List / Table State

**Import**: `import { useUrlTable } from '@/hooks'`  
**Use for**: every page that has pagination, filtering, or sorting (admin, public, seller, user).

```tsx
const table = useUrlTable({ defaults: { pageSize: '25', sort: '-createdAt' } });

// Read a param
table.get('status')           // string | ''
table.getNumber('page', 1)    // number

// Write (router.replace — no history entry spam)
table.set('status', 'active') // also resets page → 1
table.setPage(3)               // only changes page
table.setSort('-price')        // resets page → 1
table.setMany({ status: 'active', role: 'seller' }) // single navigation

// Build API query strings
table.buildSieveParams('status==published,price>=100')
// → ?filters=status==published,price>=100&sorts=-createdAt&page=1&pageSize=25
```

**Rules:**
- Always use `table.params.toString()` as part of the `queryKey` → cache busts on any filter change.
- Use `router.replace()` (built into the hook) — never `router.push()` for filter changes.
- Filter/sort changes **always reset page to 1** — automatic inside `set()` / `setMany()`.
- **`view` param changes do NOT reset page** — `'view'` is excluded from the page-reset guard alongside `'page'` and `'pageSize'`.

**View toggle integration**: pages that use `DataTable` with `showViewToggle` pass view mode through `useUrlTable`. Re-use the existing `mobileCardRender` prop as the card renderer — no separate prop needed:
```tsx
const table = useUrlTable({ defaults: { view: 'grid', pageSize: '24' } });
<DataTable
  showViewToggle
  viewMode={(table.get('view') || 'grid') as 'table' | 'grid' | 'list'}
  onViewModeChange={(mode) => table.set('view', mode)}
  mobileCardRender={(item) => <ProductCard product={item} />}
/>
```

### Service Layer — Rule for Hooks

Every `queryFn` / `mutationFn` passed to `useApiQuery` / `useApiMutation` **MUST** call a named service function from `@/services` or `@/features/<name>/services`, never an inline `apiClient.*` call. See **Rule 21** for the full service + hook layer pattern.

```tsx
// WRONG — inline apiClient inside hook
useApiQuery({
  queryKey: ['products', 'featured'],
  queryFn: () => apiClient.get(`${API_ENDPOINTS.PRODUCTS.LIST}?featured=true`), // ❌
});

// RIGHT — named service function
import { productService } from '@/services';
useApiQuery({
  queryKey: ['products', 'featured'],
  queryFn: () => productService.getFeatured(), // ✅
});
```

---

## RULE 7: Use Existing Components

**Check `@/components` before creating new UI elements.**

Key available components:

**UI**: `Button`, `Card`, `Badge`, `Input`, `Select`, `Textarea`, `Checkbox`, `Toggle`, `Alert`, `Modal`, `ConfirmDeleteModal`, `ImageCropModal`, `FormField`, `Slider`, `Progress`, `Tabs`, `Accordion`, `Tooltip`, `Search`, `BackToTop`, `LoadingSpinner`, `ErrorBoundary`, `AvatarDisplay`, `AvatarUpload`, `PasswordStrengthIndicator`, `Text`, `DataTable`, `SideDrawer`, `RichTextEditor`, `Sidebar`, `Header`, `Footer`, `SectionTabs`, `StatusBadge`, `RoleBadge`, `EmptyState`, `ResponsiveView`.

**Filter / Facet / Pagination** — Tier 1 primitives for all page types:
- `FilterFacetSection` — collapsible filter group (checkboxes + inline search + load-more).
- `FilterDrawer` — slide-in filter panel; used on products, search, categories, auctions, seller, admin list pages.
- `ActiveFilterChips` — dismissible chips row for active filters + "Clear all".
- `SortDropdown` — sort label + select for any list page.
- `TablePagination` — result count + per-page selector + `Pagination`.

**Admin**: `AdminPageHeader`, `AdminFilterBar` (use `withCard={false}` for public/seller pages — no separate `FilterBar` needed), `DrawerFormFooter`.

**User**: `AddressForm`, `AddressCard`, `ProfileHeader`, `ProfileStatsGrid`, `EmailVerificationCard`, `PhoneVerificationCard`, `ProfileInfoForm`, `PasswordChangeForm`, `AccountInfoCard`.

```tsx
// WRONG - creating raw HTML inputs
<input type="text" className="border rounded p-2" />

// RIGHT - using existing components
import { FormField } from '@/components';
<FormField type="text" label={UI_LABELS.FORM.EMAIL} placeholder={UI_PLACEHOLDERS.EMAIL} />
```

---

## RULE 8: Exhaustive Component Reuse — Check Before You Write

**Before writing ANY markup, HTML element, or inline logic, verify that a purpose-built primitive already exists.**

This rule exists because repeated audits show that new code keeps re-implementing things that are already in `@/components` or `@/hooks`. The pre-code checklist is not enough — you must actively search.

### Mandatory lookup table

| Before writing... | Search for & use |
|-------------------|------------------|
| `<input type="text/email/number">` | `FormField` or `Input` from `@/components` |
| `<textarea>` | `FormField type="textarea"` from `@/components` |
| `<select>` | `FormField type="select"` or `Select` from `@/components` |
| `<input type="checkbox">` | `Checkbox` from `@/components` |
| `<input type="radio">` | `FormField type="radio"` from `@/components` |
| Image URL `<input type="text">` | `ImageUpload` from `@/components` (server-side, via `/api/media/upload`) |
| Multi-line rich content field | `RichTextEditor` from `@/components` |
| Video / file URL field | `MediaUploadField` from `@/components` (create if missing — see TASK-10) |
| Profile avatar upload | `AvatarUpload` from `@/components` (local crop → FormData → `/api/media/upload` via backend) |
| Toggle switch | `Toggle` from `@/components` |
| Star or numeric rating display | look in `@/components` for existing rating component |
| Loading spinner / skeleton | `LoadingSpinner` from `@/components` |
| Empty state placeholder | `EmptyState` from `@/components` |
| Confirmation / destructive dialog | `ConfirmDeleteModal` from `@/components` |
| Slide-in panel / form drawer | `SideDrawer` from `@/components` |
| Filter sidebar on mobile | `FilterDrawer` from `@/components` |
| Paginated result count + per-page | `TablePagination` from `@/components` |
| Sort control | `SortDropdown` from `@/components` |
| Active filter chip row | `ActiveFilterChips` from `@/components` |
| Status text badge | `StatusBadge` from `@/components` |
| Role label badge | `RoleBadge` from `@/components` |
| Page header with breadcrumb (admin) | `AdminPageHeader` from `@/components` |
| Filter bar at top of list (admin/seller) | `AdminFilterBar` from `@/components` |
| Drawer submit/cancel/delete footer | `DrawerFormFooter` from `@/components` |
| Display any static image (product, blog, carousel...) | `MediaImage` from `@/components` |
| Display a video asset | `MediaVideo` from `@/components` |
| Display a user / seller / brand avatar | `MediaAvatar` from `@/components` |
| Display a multi-image set / gallery | `MediaGallery` from `@/components` |

### Image upload canonical paths

```
All images and files (products, blog, categories, carousel, avatars):
  Upload component (ImageUpload / AvatarUpload)
    → local preview + crop/edit (no network)
    → user clicks Save/Submit
    → FormData POST to /api/media/upload
    → Backend (Firebase Admin SDK): validates → uploads to Storage → saves URL to Firestore
    → Returns { url } to client
```

**NEVER** use `useStorageUpload` or any hook that calls the Firebase Storage client SDK.
**NEVER** use a plain `<input type="text">` as a substitute for an image or file URL field when a proper upload component exists.

---

## RULE 9: Pages Are Thin Orchestration Layers

**Every `page.tsx` should be as simple as possible — composed entirely of imported components.**

If a page exceeds ~150 lines, it needs decomposition.

```tsx
// RIGHT — page is just glue
export default function CarouselPage() {
  const { data, loading } = useApiQuery(API_ENDPOINTS.CAROUSEL.LIST);
  return (
    <>
      <AdminPageHeader title={UI_LABELS.ADMIN.CAROUSEL.TITLE} />
      <DataTable columns={CarouselTableColumns} data={data} loading={loading} />
    </>
  );
}
```

---

## RULE 10: Page Thickness Limit — 150 Lines Maximum

**Every `page.tsx` file must be a thin orchestration shell. If it exceeds ~150 lines, it must be decomposed.**

### What "thin" means

A page may only contain:
- Metadata exports (`generateMetadata`, `metadata`)
- A default export that: (a) reads URL params, (b) gates auth via `useAuth`/`useSession`, (c) renders one or two feature view components
- At most one `useApiQuery` / `useApiMutation` call when no feature hook wraps it yet

A page must NOT contain:
- Inline form JSX
- Table / data grid JSX
- Business logic (filtering, sorting, mapping)
- Multiple `useState` calls managing domain state
- Direct `apiClient` or `fetch` calls
- More than ~3 hooks imported from outside `@/features`

### Decomposition pattern

```tsx
// WRONG — fat page (200+ lines of state + JSX + hooks)
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data } = useApiQuery({ queryFn: () => orderService.list() });
  // ... 180 more lines of JSX + handlers
}

// RIGHT — thin page delegates to a feature view
import { AdminOrdersView } from '@/features/admin';
export default function AdminOrdersPage() {
  return <AdminOrdersView />;
}
```

### Where the extracted logic goes

| Page type | Extract to |
|-----------|------------|
| Admin CRUD page | `src/features/admin/components/Admin<Domain>View.tsx` |
| Seller page | `src/features/seller/components/Seller<Domain>View.tsx` |
| User page | `src/features/user/components/User<Domain>View.tsx` |
| Auth page | `src/features/auth/components/<Name>View.tsx` |
| Public page | `src/components/<domain>/<Name>View.tsx` (if shared) or `src/features/<name>/components/` |

### Enforced page size targets

| Page complexity | Target max lines |
|-----------------|------------------|
| Static / display only | 50 lines |
| Single data fetch + display | 80 lines |
| CRUD with drawer | 30 lines (page) + view component |
| Wizard / multi-step | 30 lines (page) + dedicated feature view |

**After every edit to a `page.tsx`, check its line count. If > 150, create a TASK to decompose it.**

---

## RULE 11: Firebase Access — Backend-Only Architecture

**The Firebase client SDK is BANNED from all frontend code for Auth, Firestore, and Storage.**
Every Firebase operation MUST go through a Next.js API route using the Firebase Admin SDK.

### SDK Placement — Absolute Rules

| Service | Frontend allowed? | Where it runs |
|---------|------------------|---------------|
| **Firebase Auth** | ❌ NEVER | Backend only — `src/app/api/**` via Admin SDK |
| **Firestore** | ❌ NEVER | Backend only — `src/app/api/**` via Admin SDK + repositories |
| **Firebase Storage** | ❌ NEVER | Backend only — `src/app/api/**` via Admin SDK |
| **Realtime DB (read/subscribe)** | ✅ Allowed — read-only, custom token only | Client listener only |
| **Realtime DB (write)** | ❌ NEVER | Backend only — `src/app/api/**` via Admin SDK |

```ts
// WRONG — Firebase Auth in a component or hook
import { signInWithEmailAndPassword } from 'firebase/auth'; // ❌
import { auth } from '@/lib/firebase/config';               // ❌ in any UI code

// WRONG — Firestore client SDK in a component or hook
import { getDoc, doc } from 'firebase/firestore';           // ❌
import { db } from '@/lib/firebase/config';                 // ❌ in any UI code

// WRONG — Firebase Storage client SDK
import { uploadBytes, ref } from 'firebase/storage';        // ❌
import { storage } from '@/lib/firebase/config';            // ❌ in any UI code

// RIGHT — all operations via API routes (Admin SDK, backend)
import { getAdminDb, getAdminAuth, getAdminStorage } from '@/lib/firebase/admin'; // ✅ API routes only
```

**NEVER** import `@/lib/firebase/config` (client SDK) anywhere in `src/app/`, `src/components/`, `src/features/`, `src/hooks/`, `src/contexts/`, or `src/services/`.
**NEVER** import `@/lib/firebase/admin` outside `src/app/api/**` and `src/lib/`.

---

### File Upload — Stage Locally, Submit to Backend

**NEVER** upload files directly from the browser to Firebase Storage. Files are staged in local state until the user explicitly saves.

#### Three-Phase Upload Flow

```
 Phase 1 — Select & Stage (client only, no network)
   User picks file → stored as File object in React state (never uploaded)
   Local preview via URL.createObjectURL()
   UI shows crop, trim, metadata fields (all local state)

 Phase 2 — Edit (client only, no network)
   User crops, trims, reorders, fills in metadata
   All edits are pure React state mutations on the staged File/Blob
   Nothing is persisted anywhere yet

 Phase 3 — Submit (single atomic backend request)
   User clicks Save / Create / Submit
   Client builds FormData: { file: Blob, metadata: JSON }
   POST to API route (e.g. /api/media/upload or /api/trips)
   Backend: validates → uploads to Firebase Storage via Admin SDK
             → writes record to Firestore via Admin SDK/repository
             → returns { url, id } in one response
   If backend fails, nothing is saved — no orphaned files, no partial DB rows
```

```tsx
// WRONG — uploading file immediately on change
onChange={(e) => uploadBytes(storageRef, e.target.files[0])} // ❌

// RIGHT — stage locally, submit all at once
const [stagedFile, setStagedFile] = useState<File | null>(null);
const [preview, setPreview]       = useState<string>('');
const [meta, setMeta]             = useState<TripMeta>(defaultMeta);

const handleFileSelect = (file: File) => {
  setStagedFile(file);
  setPreview(URL.createObjectURL(file)); // ✅ local preview only
};

const handleSubmit = async () => {
  if (!stagedFile) return;
  const form = new FormData();
  form.append('file', stagedFile);
  form.append('metadata', JSON.stringify(meta));
  await tripService.create(form);          // ✅ single backend call
  URL.revokeObjectURL(preview);            // ✅ cleanup
};
```

#### Media Display Metadata Schema

**Every file submitted to the backend MUST include a `displayMeta` object.** This is the single source of truth for how the UI renders a media asset — the raw uploaded file is never shown directly; the display layer reads these fields to reconstruct the correct cropped, zoomed, and positioned view.

```ts
// src/types/media.ts
export interface MediaDisplayMeta {
  // ---- Crop region (in pixels of the ORIGINAL un-zoomed image) ----
  cropX:      number;   // distance from left edge of original
  cropY:      number;   // distance from top edge of original
  cropWidth:  number;   // width of the visible crop region
  cropHeight: number;   // height of the visible crop region

  // ---- Zoom & focal point ----
  zoom:   number;   // 1.0 = no zoom; >1.0 = zoomed in
  focalX: number;   // normalised 0.0–1.0 focal point (x axis)
  focalY: number;   // normalised 0.0–1.0 focal point (y axis)
  // The focal point drives CSS object-position so the most important
  // part of the image stays visible in every container size.

  // ---- Layout hints ----
  aspectRatio:  '1:1' | '4:3' | '3:2' | '16:9' | '21:9' | '9:16' | '3:4' | string;
  objectFit:    'cover' | 'contain';
  displayMode:  'thumbnail' | 'banner' | 'gallery' | 'avatar' | 'hero' | 'card';
  // displayMode tells the UI which Tailwind aspect + sizing preset to use.

  // ---- Original dimensions (needed by the renderer) ----
  originalWidth:  number;  // pixels
  originalHeight: number;

  // ---- File info ----
  mimeType: string;   // 'image/webp', 'video/mp4', etc.
  fileSize: number;   // bytes

  // ---- SEO context (used by backend to build the Storage filename) ----
  seoContext: {
    domain:     'product' | 'blog' | 'category' | 'auction' | 'user' | 'homepage' | 'welcome' | 'carousel' | 'review' | 'brand';
    slug:       string;   // URL-safe entity slug, e.g. 'red-trek-himalaya'
    mediaType:  'cover' | 'gallery' | 'thumbnail' | 'avatar' | 'banner' | 'video' | 'attachment';
    index:      number;   // 1-based position when multiple files for same entity+type
  };
  // Backend derives filename as: {intent}-{domain}-{slug}-{mediaType}-{index}.{ext}
  // e.g. buy-product-red-trek-himalaya-cover-1.webp
  // e.g. read-blog-manali-in-winter-thumbnail-1.webp
  // e.g. avatar-user-jane-doe-avatar-1.webp

  // ---- Accessibility ----
  alt:      string;
  caption?: string;
}

// Full record stored in Firestore after backend upload
export interface MediaRecord extends MediaDisplayMeta {
  id:          string;
  url:         string;   // signed Storage URL
  storagePath: string;   // raw bucket path (used for deletes/re-uploads)
  seoFilename: string;   // final SEO filename as stored in Storage
  uploadedBy:  string;   // uid
  createdAt:   Date;
}
```

**Client builds `displayMeta` during Phase 2:**
```tsx
// All values captured from the crop/zoom UI before submit
const meta: MediaDisplayMeta = {
  cropX: cropResult.x, cropY: cropResult.y,
  cropWidth: cropResult.width, cropHeight: cropResult.height,
  zoom: 1.4,
  focalX: 0.5, focalY: 0.35,
  aspectRatio: '16:9',
  objectFit: 'cover',
  displayMode: 'banner',
  originalWidth: naturalWidth, originalHeight: naturalHeight,
  mimeType: file.type, fileSize: file.size,
  alt: 'Trip cover photo of Manali',
};
form.append('metadata', JSON.stringify(meta));
```

**UI renders using `displayMeta` (see Rule 28 for the `<MediaDisplay />` primitive):**
```tsx
// WRONG — raw <img> ignoring crop / zoom data
<img src={record.url} className="w-full h-48 object-cover" />

// RIGHT — delegate to the shared MediaDisplay primitive
import { MediaDisplay } from '@/components';
<MediaDisplay media={record} className="w-full" />
// MediaDisplay reads displayMeta and applies:
//   - overflow-hidden wrapper sized to aspectRatio preset
//   - img scaled by zoom with object-position driven by focalX/focalY
//   - CSS clip to cropX/cropY/cropWidth/cropHeight via transform
```

#### SEO Filename Convention

The backend generates every Storage filename from the entity's slug and media context. **Never use the original client filename.** All filenames are lowercase, hyphenated, and structured for search-engine discoverability.

| Domain | Intent prefix | Pattern | Example |
|--------|--------------|---------|--------|
| Product | `buy` | `buy-product-{slug}-{mediaType}-{n}.{ext}` | `buy-product-red-trek-himalaya-cover-1.webp` |
| Blog | `read` | `read-blog-{slug}-{mediaType}-{n}.{ext}` | `read-blog-manali-in-winter-gallery-2.webp` |
| Category | `explore` | `explore-category-{slug}-{mediaType}-{n}.{ext}` | `explore-category-trekking-banner-1.webp` |
| Auction | `bid` | `bid-auction-{slug}-{mediaType}-{n}.{ext}` | `bid-auction-vintage-camera-cover-1.webp` |
| User / Avatar | `profile` | `profile-user-{slug}-avatar-{n}.{ext}` | `profile-user-jane-doe-avatar-1.webp` |
| Homepage section | `home` | `home-{sectionSlug}-{mediaType}-{n}.{ext}` | `home-hero-banner-1.webp` |
| Welcome / Onboarding | `welcome` | `welcome-{slug}-{mediaType}-{n}.{ext}` | `welcome-letitrip-hero-1.webp` |
| Carousel | `carousel` | `carousel-{slug}-banner-{n}.{ext}` | `carousel-summer-sale-banner-3.webp` |
| Review | `review` | `review-{productSlug}-attachment-{n}.{ext}` | `review-red-trek-himalaya-attachment-1.webp` |
| Brand / Seller | `brand` | `brand-{sellerSlug}-{mediaType}-{n}.{ext}` | `brand-himalaya-treks-logo-1.webp` |

**Rules:**
- Slugs are sanitised server-side: lowercase, strip special chars, replace spaces with `-`, max 60 chars.
- `{n}` is always 1-based and zero-padded to 2 digits when > 9 (e.g. `01`, `02`).
- Extension is always the output format (`webp` for images, `mp4` for video, original ext for documents).
- Re-uploads overwrite the same path — same filename, new bytes. Do NOT append timestamps to filenames.

```ts
// src/lib/media/seo-filename.ts
export function buildSeoFilename(
  meta: MediaDisplayMeta['seoContext'],
  ext: string,
): string {
  const intents: Record<string, string> = {
    product: 'buy', blog: 'read', category: 'explore', auction: 'bid',
    user: 'profile', homepage: 'home', welcome: 'welcome',
    carousel: 'carousel', review: 'review', brand: 'brand',
  };
  const intent = intents[meta.domain] ?? meta.domain;
  const slug   = meta.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);
  const n      = String(meta.index).padStart(meta.index > 9 ? 2 : 1, '0');
  return `${intent}-${meta.domain}-${slug}-${meta.mediaType}-${n}.${ext.toLowerCase()}`;
}
```

#### Entity-First Transactional Upload Pattern

**ALWAYS save the entity record before uploading media.** This prevents orphaned Storage files and ensures the UI always has a recoverable state.

```
 Step 1 — Save Entity (no media yet)
   POST /api/products  (body: { ...productFields })
   Backend: validates → writes product doc to Firestore (status: 'draft' or 'pending')
   Returns: { id, slug }  ← entity ID + slug needed for SEO filename
   If this fails: stay on create form, show business error message (NOT stack trace)

 Step 2 — Upload Media (uses entity id + slug from Step 1)
   POST /api/media/upload  (body: FormData { file, metadata: { seoContext: { slug, ... } } })
   Backend: generates SEO filename → uploads to Storage → appends URL to entity doc
   Returns: { url, seoFilename }
   If this fails: redirect to EDIT page with { uploadError: true }
     → Edit page loads existing entity data (already saved in Step 1)
     → Shows "Some images failed to upload — please re-upload" banner
     → Old images (if any) are preserved; only the failed batch needs re-upload

 Step 3 — Finalise (optional status transition)
   PATCH /api/products/{id}  (body: { status: 'published' })
   Only called after all media uploads succeed
```

```ts
// src/app/api/media/upload/route.ts
import { getAdminStorage, getAdminDb } from '@/lib/firebase/admin';
import { buildSeoFilename } from '@/lib/media/seo-filename';

export async function POST(request: NextRequest) {
  const session  = await verifySessionCookie(request.cookies.get('__session')?.value);
  if (!session) throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);

  const formData = await request.formData();
  const file     = formData.get('file') as File;
  const meta     = JSON.parse(formData.get('metadata') as string) as MediaDisplayMeta;

  // Derive extension from MIME type (always output webp for images)
  const ext        = file.type.startsWith('image/') ? 'webp' : file.name.split('.').pop()!;
  const filename   = buildSeoFilename(meta.seoContext, ext);
  const storagePath = `media/${meta.seoContext.domain}/${meta.seoContext.slug}/${filename}`;

  // Upload via Admin SDK — overwrites same path on re-upload
  const bucket  = getAdminStorage().bucket();
  const fileRef = bucket.file(storagePath);
  await fileRef.save(Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });
  const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });

  // Append media record to Firestore atomically
  const db = getAdminDb();
  const record: Omit<MediaRecord, 'id'> = {
    ...meta,
    url,
    storagePath,
    seoFilename: filename,
    uploadedBy: session.uid,
    createdAt: new Date(),
  };
  const ref = await db.collection(MEDIA_COLLECTION).add(record);

  return successResponse({ url, id: ref.id, seoFilename: filename });
}
```

#### API Route Error Responses — Business Errors Only

**NEVER expose stack traces, Firestore error codes, or internal service details to the client.**

```ts
// WRONG — leaking internal details
return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });

// RIGHT — use handleApiError which maps to safe business-level messages
catch (error) {
  return handleApiError(error);
  // → ValidationError    → 400 + ERROR_MESSAGES.VALIDATION.*
  // → NotFoundError      → 404 + ERROR_MESSAGES.*.NOT_FOUND
  // → AuthenticationError→ 401 + ERROR_MESSAGES.AUTH.UNAUTHORIZED
  // → unknown error      → 500 + ERROR_MESSAGES.GENERIC.UNEXPECTED (no details)
}
```

**UI error display rule:** show only the user-facing message from the API response `{ message }` field. Never render raw error objects.

---

### Realtime Messages — Secure Subscribe-Only Pattern

Firebase Realtime DB is the **only** Firebase service accessible via client SDK, and **only for subscribing (reading)**. All writes go through the backend.

#### Security Design

```
 1. Session established → backend issues Firebase Custom Token
    POST /api/realtime/token
    ← { customToken, uid, expiresAt }
    Custom token encodes: { uid, sessionId, role, chatId[] }
    Expires in 1 hour max (matches session lifetime)

 2. Client signs in to Realtime DB ONLY (not full Firebase Auth)
    import { getAuth, signInWithCustomToken } from 'firebase/auth';
    import { realtimeApp }  from '@/lib/firebase/realtime'; // separate mini-app instance
    await signInWithCustomToken(getAuth(realtimeApp), customToken);

 3. Client subscribes read-only to authorised paths
    const ref = ref(getDatabase(realtimeApp), `chat/${chatId}/messages`);
    onValue(ref, (snapshot) => ...);

 4. Client sends a message → API route → backend writes to Realtime DB
    POST /api/chat/${chatId}/messages   (body: { text })
    Backend verifies session, writes to Realtime DB via Admin SDK
    Realtime DB rules: write=false for all clients

 5. Custom token refresh — client calls /api/realtime/token before expiry
    Backend checks session is still valid before issuing new token
```

#### Firebase Realtime DB Rules (database.rules.json)

Clients may ONLY read paths they own. All writes are Admin-only (bypass rules).

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "chat": {
      "$chatId": {
        ".read":  "auth != null && auth.token.chatIds != null && auth.token.chatIds[$chatId] == true",
        ".write": false
      }
    },
    "notifications": {
      "$uid": {
        ".read":  "auth != null && auth.uid == $uid",
        ".write": false
      }
    },
    "live_updates": {
      "$updateType": {
        ".read":  true,
        ".write": false
      }
    }
  }
}
```

#### Separate Realtime Firebase App Instance

To avoid mixing Auth state with the main app, use a dedicated Firebase app for Realtime DB:

```ts
// src/lib/firebase/realtime.ts  — client-side ONLY for Realtime DB subscriptions
import { initializeApp, getApps } from 'firebase/app';

const REALTIME_APP_NAME = 'letitrip-realtime';
export const realtimeApp =
  getApps().find((a) => a.name === REALTIME_APP_NAME) ??
  initializeApp(firebaseClientConfig, REALTIME_APP_NAME);

// Usage in hooks:
// import { realtimeApp } from '@/lib/firebase/realtime';
// const db  = getDatabase(realtimeApp);
// const tok = await realtimeTokenService.getToken(); // calls /api/realtime/token
// await signInWithCustomToken(getAuth(realtimeApp), tok.customToken);
// onValue(ref(db, `chat/${chatId}/messages`), handler);
```

**This `realtimeApp` instance MUST only be used for Realtime DB. Never use it for Firestore, Storage, or full Auth.**

#### Custom Token Endpoint Pattern

```ts
// src/app/api/realtime/token/route.ts
export async function POST(request: NextRequest) {
  const session = await verifySessionCookie(request.cookies.get('__session')?.value);
  if (!session) throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);

  // Encode which chat rooms this session may read
  const chatIds = await chatRepository.getActiveChatIdsForUser(session.uid);
  const customToken = await getAdminAuth().createCustomToken(session.uid, {
    sessionId: session.sessionId,
    chatIds: Object.fromEntries(chatIds.map((id) => [id, true])),
    role: session.role,
  });

  return successResponse({ customToken, expiresAt: Date.now() + 3_600_000 });
}
```

---

## RULE 12: Use Repository Pattern for DB Access

**NEVER query Firestore directly in pages/components. Use repositories.**

```tsx
// WRONG - direct Firestore in page
import { collection, getDocs } from 'firebase/firestore';
const users = await getDocs(collection(db, 'users'));

// RIGHT - use repository
import { userRepository } from '@/repositories';
const user = await userRepository.findByEmail('user@example.com');
```

Available repositories: `userRepository`, `tokenRepository`, `productRepository`, `orderRepository`, `reviewRepository`, `sessionRepository`, `siteSettingsRepository`, `carouselRepository`, `homepageSectionsRepository`, `categoriesRepository`, `couponsRepository`, `faqRepository`, `bidRepository`.

**Important**: API routes in `src/app/api/**` MUST also use repositories for all Firestore operations. Direct `db.collection().doc().get()` calls in API routes violate this rule.

**Use schema types** for type safety:
```tsx
import type { UserCreateInput, UserUpdateInput } from '@/db/schema';
import { USER_COLLECTION, userQueryHelpers } from '@/db/schema';
```

### Sieve List Queries — `sieveQuery()` in Repositories

**NEVER** use `findAll()` + in-memory filtering for list / search / paginated endpoints.  
**ALWAYS** use `sieveQuery()` (Firestore-native) for any endpoint that accepts `filters`, `sorts`, `page`, or `pageSize`.

```typescript
// WRONG
const all = await productRepository.findAll();
return applySieveToArray(all, model); // ❌ loads entire collection

// RIGHT — 1 count read + pageSize doc reads, regardless of collection size
return productRepository.list(model); // ✅
```

#### Defining `SIEVE_FIELDS` and `list()` in a repository

```typescript
import type { SieveModel, FirebaseSieveFields } from '@/lib/query/firebase-sieve';

// In your repository class:
static readonly SIEVE_FIELDS: FirebaseSieveFields = {
  title:     { canFilter: true, canSort: true },
  price:     { canFilter: true, canSort: true },
  status:    { canFilter: true, canSort: false },
  createdAt: { canFilter: true, canSort: true },
};

async list(model: SieveModel) {
  // Without pre-filter — uses the full collection
  return this.sieveQuery<ProductDocument>(model, ProductRepository.SIEVE_FIELDS);
}

async listForUser(userId: string, model: SieveModel) {
  // With pre-filter — Sieve runs on top of the already-scoped query
  return this.sieveQuery<OrderDocument>(model, OrderRepository.SIEVE_FIELDS, {
    baseQuery: this.getCollection().where('userId', '==', userId),
  });
}
```

#### Sieve DSL Reference (for `filters` and `sorts` query params)

| Operator | Meaning | Example |
|----------|---------|---------|
| `==` | equals | `status==published` |
| `!=` | not equals | `status!=draft` |
| `>` `<` `>=` `<=` | comparison | `price>=100,price<=500` |
| `@=` | array-contains | `tags@=electronics` |
| `_=` | starts-with | `title_=Shoe` |
| `-fieldName` (sort) | descending | `sorts=-createdAt` |
| `fieldName` (sort)  | ascending  | `sorts=price` |

Multiple filters: comma-separated — `filters=status==published,price>=100`  
Multiple sorts: comma-separated — `sorts=-createdAt,title`

#### Unsupported operators (fall back to `applySieveToArray`)

- Case-insensitive variants (`==*`, `@=*`, `_=*`)
- Negated string checks (`!@=`, `!_=`, `_-=`)
- Multi-field OR filters `(field1|field2)==value`
- Full-text search → use Algolia / Typesense

`applySieveToArray` from `@/helpers` is **legacy / in-memory fallback only**. Do not introduce new uses for collection-level lists.

#### Atomic multi-collection writes — `unitOfWork`

For operations that must succeed or fail together across collections:

```typescript
import { unitOfWork } from '@/repositories';

// Transaction (read → write)
await unitOfWork.runTransaction(async (tx) => {
  const product = await unitOfWork.products.findByIdOrFailInTx(tx, productId);
  unitOfWork.products.updateInTx(tx, productId, { stock: product.stock - 1 });
  unitOfWork.orders.updateInTx(tx, orderId, { status: 'confirmed' });
});

// Batch (write-only, up to 500 ops)
await unitOfWork.runBatch((batch) => {
  unitOfWork.products.updateInBatch(batch, productId, { featured: true });
  unitOfWork.categories.updateInBatch(batch, categoryId, { productCount: 10 });
});
```

---

## RULE 13: API Route Pattern

**ALWAYS follow this API route structure:**

```tsx
// Pattern for API routes in src/app/api/**/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/firebase/auth-server';
import { handleApiError } from '@/lib/errors/error-handler';
import { AuthenticationError } from '@/lib/errors';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { yourRepository } from '@/repositories';
import { z } from 'zod';

// Define validation schema
const requestSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  // ... other fields
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication (if required)
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }

    // 2. Validate request body
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    // 3. Business logic using repositories
    const result = await yourRepository.doSomething(validation.data);

    // 4. Return success response
    return successResponse(result, SUCCESS_MESSAGES.YOUR_MODULE.SUCCESS);
  } catch (error) {
    return handleApiError(error); // Automatically logs and formats errors
  }
}
```

#### GET list endpoint pattern (Sieve)

All paginated list endpoints follow this pattern:

```typescript
import type { SieveModel } from '@/lib/query/firebase-sieve';

export async function GET(request: NextRequest) {
  try {
    // 1. Auth (if required)
    const sessionCookie = request.cookies.get('__session')?.value;
    // ... verify ...

    // 2. Parse Sieve model from URL params
    const { searchParams } = request.nextUrl;
    const model: SieveModel = {
      filters:  searchParams.get('filters')  ?? undefined,
      sorts:    searchParams.get('sorts')    ?? '-createdAt',
      page:     searchParams.get('page')     ?? '1',
      pageSize: searchParams.get('pageSize') ?? '25',
    };

    // 3. Build optional Sieve filter string from individual named params
    const filtersArr: string[] = [];
    const status = searchParams.get('status');
    if (status) filtersArr.push(`status==${status}`);
    if (model.filters) filtersArr.push(model.filters);
    model.filters = filtersArr.join(',') || undefined;

    // 4. Query via repository — Firestore-native
    const result = await yourRepository.list(model);
    //   result = { items, total, page, pageSize, totalPages, hasMore }

    // 5. Return
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Two API conventions in use — do not mix them on the same endpoint:**

| Style | Params | Used by |
|-------|--------|---------|
| **Sieve** | `?filters=status==published&sorts=-createdAt&page=2&pageSize=25` | All admin routes, `/api/products`, `/api/seller/*` |
| **Named** | `?q=shoes&category=footwear&sort=-createdAt&page=2&pageSize=24` | `/api/search` only |

---

## RULE 14: Use Error Classes

**NEVER throw raw errors or use literal error strings.**

```tsx
// WRONG
throw new Error('User not found');
return res.status(401).json({ error: 'Unauthorized' });

// RIGHT
import { NotFoundError, AuthenticationError } from '@/lib/errors';
import { ERROR_MESSAGES } from '@/constants';
throw new NotFoundError(ERROR_MESSAGES.DATABASE.NOT_FOUND);
throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
```

Available classes: `AppError`, `ApiError`, `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `DatabaseError`.

---

## RULE 15: Use Existing Classes (Singletons)

| Need | Class | Import |
|------|-------|--------|
| In-memory cache | `cacheManager` | `import { cacheManager } from '@/classes'` |
| localStorage/sessionStorage | `storageManager` | `import { storageManager } from '@/classes'` |
| Client logging | `logger` | `import { logger } from '@/classes'` |
| **Server logging** | `serverLogger` | `import { serverLogger } from '@/lib/server-logger'` |
| Inter-component events | `eventBus` | `import { eventBus } from '@/classes'` |
| Task queueing | `new Queue()` | `import { Queue } from '@/classes'` |

**NEVER** write custom localStorage wrappers, custom event emitters, or custom caching logic.

**Logging:**
- Use `logger` (client-side) for browser console + localStorage logs
- Use `serverLogger` (server-side) for API routes - writes to `./logs/` files

---

## RULE 16: RBAC (Role-Based Access Control)

**Route protection is centralized in `src/constants/rbac.ts`.**

```tsx
// RBAC_CONFIG defines access rules for all routes
export const RBAC_CONFIG = {
  [ROUTES.USER.DASHBOARD]: {
    requireAuth: true,
    allowedRoles: ['user'], // All authenticated users
    requireEmailVerified: false,
  },
  [ROUTES.ADMIN.DASHBOARD]: {
    requireAuth: true,
    allowedRoles: ['admin'], // Admin only
    requireEmailVerified: true,
  },
};
```

**Role hierarchy**: `admin` > `moderator` > `seller` > `user`

**Component protection**: wrap with `<ProtectedRoute requiredRole="admin">` from `@/components`.

**Programmatic checks**: `hasRole(user, role)`, `hasAnyRole(user, roles)` from `@/helpers`.

---

## RULE 17: Collection Names from Constants

**NEVER hardcode Firestore collection names.**

```tsx
// WRONG
db.collection('users')

// RIGHT
import { USER_COLLECTION } from '@/db/schema';
db.collection(USER_COLLECTION)
```

Available constants: `USER_COLLECTION`, `PRODUCT_COLLECTION`, `ORDER_COLLECTION`, `REVIEW_COLLECTION`, `BID_COLLECTION`, `SESSION_COLLECTION`, `EMAIL_VERIFICATION_COLLECTION`, `PASSWORD_RESET_COLLECTION`, `CAROUSEL_SLIDES_COLLECTION`, `HOMEPAGE_SECTIONS_COLLECTION`, `CATEGORIES_COLLECTION`, `COUPONS_COLLECTION`, `FAQS_COLLECTION`, `SITE_SETTINGS_COLLECTION`.

### Schema Field Constants

**NEVER hardcode Firestore field names in queries, serializers, or update operations.**

```tsx
// WRONG
await db.collection(USER_COLLECTION).doc(uid).update({ 'metadata.lastSignInTime': new Date() });
const role = userData.role;

// RIGHT
import { USER_FIELDS, SCHEMA_DEFAULTS } from '@/db/schema';
await db.collection(USER_COLLECTION).doc(uid).update({ [USER_FIELDS.META.LAST_SIGN_IN_TIME]: new Date() });
const defaultRole = SCHEMA_DEFAULTS.USER_ROLE;
```

**Available field constant objects** (all from `@/db/schema`):

| Constant | Collection | Key fields |
|----------|-----------|------------|
| `USER_FIELDS` | users | UID, EMAIL, ROLE, DISPLAY_NAME, META.LAST_SIGN_IN_TIME, STAT.TOTAL_ORDERS, PROFILE.IS_PUBLIC... |
| `TOKEN_FIELDS` | tokens | USER_ID, EMAIL, TOKEN, EXPIRES_AT, USED |
| `PRODUCT_FIELDS` | products | TITLE, PRICE, SELLER_ID, STATUS, STATUS_VALUES.PUBLISHED... |
| `ORDER_FIELDS` | orders | USER_ID, STATUS, TOTAL_PRICE, STATUS_VALUES.PENDING... |
| `REVIEW_FIELDS` | reviews | PRODUCT_ID, USER_ID, RATING, STATUS_VALUES.APPROVED... |
| `BID_FIELDS` | bids | PRODUCT_ID, BID_AMOUNT, STATUS_VALUES.ACTIVE... |
| `SESSION_FIELDS` | sessions | USER_ID, IS_ACTIVE, LAST_ACTIVITY, DEVICE.BROWSER... |
| `CAROUSEL_FIELDS` | carouselSlides | TITLE, ORDER, ACTIVE, MEDIA |
| `CATEGORY_FIELDS` | categories | NAME, SLUG, TIER, METRIC.PRODUCT_COUNT... |
| `COUPON_FIELDS` | coupons | CODE, TYPE, DISCOUNT, TYPE_VALUES.PERCENTAGE... |
| `FAQ_FIELDS` | faqs | QUESTION, CATEGORY, STAT.HELPFUL, CATEGORY_VALUES.GENERAL... |
| `HOMEPAGE_SECTION_FIELDS` | homepageSections | TYPE, ORDER, ENABLED, TYPE_VALUES.WELCOME... |
| `SITE_SETTINGS_FIELDS` | siteSettings | SITE_NAME, CONTACT_FIELDS.EMAIL, SOCIAL_LINKS... |
| `COMMON_FIELDS` | (shared) | ID, CREATED_AT, UPDATED_AT, STATUS, IS_ACTIVE |
| `SCHEMA_DEFAULTS` | (defaults) | USER_ROLE, ADMIN_EMAIL, UNKNOWN_USER_AGENT, DEFAULT_DISPLAY_NAME, ANONYMOUS_USER |

---

## RULE 18: Routes from Constants

**NEVER hardcode route paths.**

```tsx
// WRONG
router.push('/auth/login');
<Link href="/user/profile">Profile</Link>

// RIGHT
import { ROUTES } from '@/constants';
router.push(ROUTES.AUTH.LOGIN);
<Link href={ROUTES.USER.PROFILE}>Profile</Link>
```

---

## RULE 19: API Endpoints from Constants

**NEVER hardcode API paths.**

```tsx
// WRONG
const res = await fetch('/api/auth/login');

// RIGHT
import { API_ENDPOINTS } from '@/constants';
const res = await fetch(API_ENDPOINTS.AUTH.LOGIN);
```

---

## RULE 20: No Direct `fetch()` in UI Code — Use the Service Layer

**NEVER call `fetch()` directly anywhere in UI code (components, pages, hooks, contexts).** `fetch` is only called inside `apiClient` itself.

`apiClient` provides: automatic cookie credentials, configurable timeout + abort, typed `ApiClientError`, consistent JSON parsing, and file upload support — but `apiClient` must itself only be called from **service functions** (see Rule 21), never from components or hooks directly.

```tsx
// WRONG — raw fetch in a component or hook
const res = await fetch('/api/products');
const data = await res.json(); // ❌

// WRONG — apiClient directly in a component or hook
import { apiClient } from '@/lib/api-client';
const data = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST); // ❌

// RIGHT — call a service function from a hook, consume the hook in the component
import { productService } from '@/services';
const { data } = useApiQuery({ queryFn: () => productService.list() }); // ✅ hook in a component
// or in a dedicated hook:
export function useProducts() {
  return useApiQuery({ queryKey: ['products'], queryFn: () => productService.list() }); // ✅
}
```

**Exceptions where raw `fetch` is acceptable (server-only):**
- `src/app/api/**` — API route handlers calling external REST APIs (Firebase Auth REST, Razorpay, etc.). These run server-side before the session cookie exists.
- `src/lib/firebase/` — thin auth bootstrap utilities that run before the session cookie is established.

**`apiClient` itself is only allowed in:** `src/services/*.service.ts` and `src/features/<name>/services/*.service.ts`. It must never be imported into components, pages, hooks, or contexts.

---

## RULE 21: UI → Hook → Service → apiClient — No Shortcuts

**The data-fetch chain is fixed. Every layer must be respected. No layer may be skipped.**

> UI component calls a **hook** → hook calls a **service function** → service calls **`apiClient`** → `apiClient` calls `fetch`.
> **Skipping any layer is a violation regardless of how simple the call seems.**

### Mandatory Three-Layer Data Flow

```
Component  (src/app/ or src/components/ or src/features/<name>/components/)
  └─ Feature / Shared Hook  (useApiQuery / useApiMutation wrapping a service fn)
       └─ Service Function  (src/services/<domain>.service.ts  OR  src/features/<name>/services/)
            └─ apiClient    (src/lib/api-client.ts)  ← ONLY place apiClient is used
                 └─ fetch   (native — ONLY called inside apiClient)
```

### Service Layer (`src/services/` — Tier 1)

Service files are **pure async functions** — no React, no hooks, no state. One file per domain, one method per endpoint.

```ts
// src/services/product.service.ts
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';

export const productService = {
  list:        (params?: string)              => apiClient.get(`${API_ENDPOINTS.PRODUCTS.LIST}${params ? `?${params}` : ''}`),
  getById:     (id: string)                   => apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)),
  getFeatured: ()                             => apiClient.get(`${API_ENDPOINTS.PRODUCTS.LIST}?filters=featured==true&sorts=-createdAt&pageSize=8`),
  create:      (data: unknown)                => apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data),
  update:      (id: string, data: unknown)    => apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE(id), data),
  delete:      (id: string)                   => apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),
};
```

Export via `src/services/index.ts`:
```ts
export * from './product.service';
export * from './cart.service';
// ... all domain services
```

### Feature Service Layer (`src/features/<name>/services/` — Tier 2)

Same pattern as Tier 1 but scoped to one feature. Export from the feature barrel:
```ts
// src/features/events/index.ts
export * from './services/event.service';
```

### Hook + Component Layer

Hooks wrap service calls; components only consume hooks:

```tsx
// Hook — service function is the queryFn
export function useFeaturedProducts() {
  return useApiQuery({ queryKey: ['products', 'featured'], queryFn: () => productService.getFeatured() }); // ✅
}

// Component — WRONG: apiClient directly in a component
const { data } = useApiQuery({ queryFn: () => apiClient.get(API_ENDPOINTS.PRODUCTS.LIST) }); // ❌

// Component — WRONG: apiClient directly in a hook's queryFn
export function useProducts() {
  return useApiQuery({ queryFn: () => apiClient.get(API_ENDPOINTS.PRODUCTS.LIST) }); // ❌ use productService.list() instead
}

// Component — RIGHT: consume a hook that wraps a service
const { data } = useFeaturedProducts(); // ✅
```

### Violation Quick-Reference

| Location | `fetch()` | `apiClient.*` | `service.*` | Allowed? |
|----------|-----------|---------------|-------------|----------|
| Component / page | ❌ | ❌ | via hook only | hook only |
| Hook (`useApiQuery` queryFn) | ❌ | ❌ | ✅ | ✅ service fn |
| Service file | ❌ | ✅ | — | ✅ |
| `apiClient` implementation | ✅ | — | — | ✅ |
| API route (`src/app/api/**`) | ✅ (ext. only) | ❌ | via repo | ✅ repo |

### Service Directory Rules

| Service type | Location | Tier |
|---|---|---|
| Shared | `src/services/<domain>.service.ts` | 1 |
| Feature-scoped | `src/features/<name>/services/<domain>.service.ts` | 2 |

- Services **MUST NOT** import React, hooks, or component code.
- Services **MUST** use `API_ENDPOINTS` from `@/constants` — never hardcode paths.
- Services **MUST** be exported through a barrel (`src/services/index.ts` or `src/features/<name>/index.ts`).
- **One service object per domain** matching the API route group.

---

## RULE 22: No `alert()` / `confirm()` / `prompt()`

**NEVER use browser native dialogs.**

| Instead of... | Use |
|--------------|-----|
| `alert(msg)` | `useMessage()` hook (toast notification) |
| `confirm(msg)` | `ConfirmDeleteModal` from `@/components` |
| Error feedback | `Alert` component or `useMessage()` error toast |

---

## RULE 23: Use Structured Logging

**NEVER use `console.log()` in production code.**

| Context | Use | Import |
|---------|-----|--------|
| Client-side | `logger` | `import { logger } from '@/classes'` |
| Server-side (API routes) | `serverLogger` | `import { serverLogger } from '@/lib/server-logger'` |
| Component debugging | Remove before commit | — |

---

## RULE 24: No Backward Compatibility

**When replacing or refactoring code, DELETE the old implementation. Do NOT keep legacy code alongside new code.**

### Internal Code — No Legacy Support

- **Delete deprecated code outright.** Never leave a deprecated hook, function, or component "just in case". If it has no callers, it's gone.
- **No compatibility shims.** When a pattern is replaced (e.g. `useApiRequest` → `useApiQuery`), remove all old call sites and delete the old implementation in the same change.
- **No dual implementations.** Never maintain two ways to do the same thing. Pick the correct approach (see the rules above) and migrate fully.
- **No `@deprecated` JSDoc stubs.** If code is superseded, remove it. Use the git history to look back.
- **No feature flags for old behaviour.** Don't gate new implementations behind flags to keep old code runnable.

```ts
// WRONG — keeping old hook alongside new one
/** @deprecated use useApiQuery instead */
export function useApiRequest() { ... } // ❌ delete this

// WRONG — compatibility wrapper
export const formatPrice = formatCurrency; // ❌ just update the call sites

// RIGHT — delete the old code, update all call sites to the new pattern
```

### Browser Target — Modern Only

- **Target**: last 2 stable releases of Chrome, Firefox, Safari, Edge. No IE, no legacy mobile WebKit.
- **JavaScript**: use modern syntax freely — optional chaining (`?.`), nullish coalescing (`??`), `structuredClone`, `Array.at()`, `Object.hasOwn()`, `Promise.allSettled()`, top-level `await`, etc. No transpile-down polyfills.
- **CSS**: use `gap`, `aspect-ratio`, `clamp()`, `container queries`, `@layer`, CSS Grid subgrid freely. No `@supports` fallbacks for features supported in modern browsers. No manual vendor prefixes — Autoprefixer (via PostCSS) handles what's needed.
- **APIs**: `IntersectionObserver`, `ResizeObserver`, `navigator.clipboard`, `AbortController`, `crypto.subtle` — available natively; no ponyfills.
- **Build target**: `browserslist` config must NOT include `ie` or `> 0.5%` global fallback tiers.

---

## RULE 25: Mobile-First & Widescreen Support

**Every layout MUST be designed mobile-first and explicitly extended for widescreen viewports.**

### Mobile-First

- **Write base styles for mobile** (≤ 640px), then layer up with `sm:`, `md:`, `lg:`, `xl:`, `2xl:` breakpoints.
- No `max-sm:hidden` / `max-md:` tricks to hide desktop content on mobile — design mobile layout first instead.
- Touch targets: minimum `44×44 px` (use `min-h-11 min-w-11` / `p-3` on interactive elements).
- All forms, tables, and drawers MUST be scrollable and usable at 375px width.
- Prefer `SideDrawer` over multi-column modals on mobile; prefer stacked layouts over horizontal split-panes.

### Widescreen Support

- **Every page must specify explicit `xl:` and `2xl:` classes** — never let a layout silently cap at `lg:`.
- Outermost page containers use `max-w-screen-2xl mx-auto` (or `max-w-7xl` for content-focused pages).
- Responsive grids MUST include a widescreen column count:

```tsx
// WRONG — caps at 3 cols on lg and above
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// RIGHT — continues scaling on widescreen
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
```

- Typography uses fluid-ish steps, never fixed `text-base` everywhere:

```tsx
// WRONG
<p className="text-base">

// RIGHT
<p className="text-sm sm:text-base lg:text-lg">
```

- DataTable, ProductGrid, AdminFilterBar, SideDrawer — all must render correctly at 1920px+. Use `THEME_CONSTANTS.container.*` values to keep content width sane.
- `useBreakpoint()` / `useMediaQuery()` hooks are available for JS-driven widescreen logic.

### Breakpoint Reference

| Breakpoint | Min-width | Target device |
|------------|-----------|---------------|
| _(base)_ | 0 | Mobile (375 px) |
| `sm:` | 640 px | Large mobile / small tablet |
| `md:` | 768 px | Tablet |
| `lg:` | 1024 px | Laptop |
| `xl:` | 1280 px | Desktop |
| `2xl:` | 1536 px | Widescreen / 1920 px monitor |

---

## RULE 26: Build Verification Workflow

**After every set of file changes, verify in this exact order. Do NOT skip steps.**

1. **Type-check changed files first**: `npx tsc --noEmit src/path/to/changed-file.tsx`
   - Fix ALL TypeScript errors before proceeding.
   - Do not move to step 2 while TS errors exist.
2. **Full type-check** (if multiple files changed): `npx tsc --noEmit`
   - Must report 0 errors.
3. **Production build**: `npm run build`
   - Fix any build errors (missing exports, bad imports, Next.js page constraints, etc.).
   - Build must succeed with 0 errors before the task is considered done.

```bash
# Correct order — never skip ahead
npx tsc --noEmit src/features/products/components/ProductCard.tsx  # step 1
npx tsc --noEmit                                                    # step 2
npm run build                                                       # step 3
```

**Never hand back to the user with outstanding TS errors or a failing build.**

---

## RULE 27: Tests as You Go

**Every file you create or meaningfully change MUST have a corresponding test update in the same change.**

- **New file** → create a new `__tests__/<filename>.test.ts(x)` alongside it.
- **Modified file** → update the existing test file to cover the change; add cases for new branches/behaviour.
- **Deleted file** → delete its test file too.
- Tests live next to the code: `src/features/products/hooks/__tests__/useProducts.test.ts`
- Use the existing test patterns: mock `@/hooks`, `@/services`, `@/lib/api-client` as the codebase already does.
- After writing tests, run `npm test -- --testPathPattern=<changed-file>` to confirm they pass before moving on.
- Do NOT batch test-writing to the end of a task — write the test for each file as that file is completed.

```ts
// Pattern: one describe block per exported symbol, concise arrange/act/assert
describe('useProducts', () => {
  it('returns product list on success', async () => { ... });
  it('propagates error state', async () => { ... });
});
```



---

## RULE 28: Media Metadata & Responsive Display

**All media rendering MUST be consistent across the app and fully responsive across every breakpoint. The raw uploaded file is NEVER shown directly — always use the `displayMeta` fields.**

### Component Hierarchy — Four Specialised Primitives (Tier 1)

All media rendering is handled by a family of four purpose-built components in `@/components`. They all delegate to the same core `<MediaDisplay />` engine but expose a domain-appropriate API so call sites are clean and context is explicit.

| Component | Use for | Props shortcut |
|-----------|---------|----------------|
| `<MediaImage />` | Any static image (product, blog, category, carousel...) | `media`, `size?`, `priority?`, `className?` |
| `<MediaVideo />` | Video assets | `media`, `controls?`, `autoPlayMuted?`, `className?` |
| `<MediaAvatar />` | User / seller / brand profile pictures | `media`, `size?: 'sm'|'md'|'lg'|'xl'`, `className?` |
| `<MediaGallery />` | Multi-image sets (product gallery, blog gallery) | `items: MediaRecord[]`, `layout?: 'grid'|'masonry'|'strip'`, `className?` |
| `<MediaDisplay />` | Internal engine — do NOT use directly at feature level | full `MediaDisplayMeta` surface |

```tsx
import { MediaImage, MediaVideo, MediaAvatar, MediaGallery } from '@/components';

// Product cover image
<MediaImage media={product.coverImage} size="card" priority />

// Blog hero banner
<MediaImage media={post.heroImage} size="hero" priority />

// Product gallery
<MediaGallery items={product.images} layout="grid" />

// User avatar — small in nav, large on profile page
<MediaAvatar media={user.avatar} size="sm" />   {/* nav */}
<MediaAvatar media={user.avatar} size="xl" />   {/* profile */}

// Auction video
<MediaVideo media={auction.demoVideo} controls />
```

**NEVER** use `<MediaDisplay />` directly in a feature component or page — always go through the contextual variant above.

### The `<MediaDisplay />` Engine

`MediaDisplay` is the internal renderer used by all four components above. It MUST NOT be imported directly in feature/page code.

It uses `displayMeta` to:
1. Pick the correct `aspect-*` Tailwind class from `aspectRatio`
2. Apply `object-cover` or `object-contain` from `objectFit`
3. Set `style={{ objectPosition: \`${focalX * 100}% ${focalY * 100}%\` }}` (dynamic — inline style allowed)
4. Apply zoom and crop via `transform: scale(zoom)` + `translate` on the `<img>` inside an `overflow-hidden` wrapper (dynamic — inline styles allowed for these calculated values)
5. Emit `<figure>` + `<figcaption>` when `caption` is present
6. Emit the SEO-friendly `alt` from `displayMeta.alt` — never empty for content images

### `displayMode` → Sizing Presets

| `displayMode` | Mobile | Tablet | Desktop | Widescreen |
|---|---|---|---|---|
| `thumbnail` | `aspect-square w-20` | `w-24` | `w-28` | `w-32` |
| `card` | `aspect-[4/3] w-full` | `w-full` | `w-full` | `w-full` |
| `banner` | `aspect-[3/1] w-full` | `aspect-[4/1]` | `aspect-[5/1]` | `aspect-[6/1]` |
| `hero` | `aspect-[16/9] w-full` | `aspect-[16/9]` | `aspect-[21/9]` | `aspect-[21/9]` |
| `gallery` | `aspect-square w-full` | `w-full` | `w-full` | `w-full` |
| `avatar` | `aspect-square w-10 rounded-full` | `w-12` | `w-12` | `w-14` |

All dimensions are driven by `THEME_CONSTANTS.media.*` rather than raw Tailwind strings. Add new presets to `THEME_CONSTANTS` before writing new display modes.

### Responsive Rules for Media

```tsx
// WRONG — fixed pixel container, crops awkwardly on mobile
<div className="w-[800px] h-[450px] overflow-hidden">
  <img src={url} className="object-cover" />
</div>

// WRONG — no aspect ratio, height collapses or stretches unpredictably
<img src={url} className="w-full" />

// WRONG — using MediaDisplay directly at feature level
import { MediaDisplay } from '@/components';
<MediaDisplay media={product.cover} />  // ❌ use MediaImage instead

// RIGHT — use the contextual variant; fluid width + locked aspect ratio
import { MediaImage } from '@/components';
<div className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
  <MediaImage media={product.coverImage} size="card" />
</div>
```

**Mandatory responsive rules for every media container:**

- **Width**: always `w-full` or a responsive fraction (`sm:w-1/2 lg:w-1/3`). Never fixed `px` widths for containers.
- **Height**: always determined by an `aspect-*` class. Never fixed `h-[px]` heights for media wrappers.
- **Object fit**: read from `displayMeta.objectFit`, never hardcoded.
- **Focal point**: `objectPosition` is always a dynamic `style={{}}` driven by `focalX`/`focalY`. This is the ONLY case where inline `style={{}}` is used on a media element.
- **Zoom transform**: `transform: scale(${zoom})` on the inner `<img>` is dynamic and must use `style={{}}`. Wrap with `overflow-hidden` to contain it.
- **Grid layouts with media**: must include `xl:` and `2xl:` column counts (Rule 25).
- **Lazy loading**: all media beyond the first viewport fold MUST use `loading="lazy"` (handled inside `MediaDisplay`).
- **Priority**: only above-the-fold hero / banner images pass `priority` to `MediaImage`, which maps to Next.js `<Image priority>`.

### SEO Integration

Every `<MediaImage />` / `<MediaVideo />` internally renders a Next.js `<Image>` with:
- `alt` from `displayMeta.alt` — descriptive, keyword-rich text set at upload time
- `title` from `displayMeta.caption` (when present)
- The Storage URL already contains the SEO filename (e.g. `buy-product-red-trek-himalaya-cover-1.webp`) — search engines index the filename as a relevance signal
- `<figure>` + `<figcaption>` markup for rich snippet eligibility

### Accessibility

- `alt` is ALWAYS sourced from `displayMeta.alt`. An empty `alt` is only allowed for purely decorative images.
- `caption` from `displayMeta.caption`, when present, renders in a `<figcaption>` inside a `<figure>` wrapper.
- `<video>` elements MUST have `controls` or clearly visible custom controls; never `autoplay` with audio.

### Consistency Enforcement

```tsx
// WRONG — ad-hoc image styling scattered across features
<img src={product.imageUrl} className="rounded-lg w-full h-48 object-cover" />

// WRONG — raw <img> ignores crop / zoom / focal point / SEO filename
<img src={record.url} alt={record.alt} />

// WRONG — MediaDisplay used at feature level
import { MediaDisplay } from '@/components';
<MediaDisplay media={product.coverImage} />  // ❌

// RIGHT — use the contextual component; all styling + meta is automatic
import { MediaImage, MediaGallery } from '@/components';
<MediaImage  media={product.coverImage} size="card" />
<MediaGallery items={product.images}   layout="grid" />
```

**Before adding any `<img>`, `<video>`, or `<picture>` tag — check `@/components` for `MediaImage`, `MediaVideo`, `MediaAvatar`, `MediaGallery` first (Rule 8).**

---

Every schema file in `src/db/schema/` MUST have these 6 sections:

1. **Collection Interface** - TypeScript interface + `COLLECTION_NAME` constant
2. **Indexed Fields** - `INDEXED_FIELDS` array with comments explaining each
3. **Relationships** - ASCII diagram showing FK references
4. **Helper Constants** - `DEFAULT_*_DATA`, `*_PUBLIC_FIELDS`, `*_UPDATABLE_FIELDS`
5. **Type Utilities** - `CreateInput`, `UpdateInput`, `AdminUpdateInput` types
6. **Query Helpers** - `queryHelpers` object with typed query builders

When adding indices, update BOTH the schema file AND `firestore.indexes.json`, then deploy with `firebase deploy --only firestore:indexes`.

---

## RULE 29: Keep Seed Data in Sync with Schema & Rules Changes

**Whenever you change a schema file, Firestore/Storage/Database rules, or collection constants, you MUST update the seed data files and seed scripts in the same change.**

> This rule exists because stale seed data silently breaks local development, CI seeding, and onboarding. A schema change that is not reflected in seed data will cause type errors, missing required fields, or rejected writes the next time someone runs the seed scripts.

### Triggers — Update seed data when ANY of these change

| Changed file / area | What to update in `scripts/` |
|---|---|
| `src/db/schema/<domain>.ts` — interface, field names, required fields, defaults | `scripts/seed-data/<domain>-seed-data.ts` — align field names, add/remove fields, fix types |
| `src/db/schema/<domain>.ts` — `COLLECTION_NAME` constant | All seed files that reference that collection name |
| `src/db/schema/<domain>.ts` — `STATUS_VALUES`, `TYPE_VALUES`, or other enum-like constants | All seed objects using those values — replace hardcoded strings with the constant values |
| `src/db/schema/<domain>.ts` — `DEFAULT_*_DATA` or `SCHEMA_DEFAULTS` | Seed objects that share those defaults — align so seed data stays representative |
| `firestore.rules` — new collection rules, required fields, or structural changes | Seed data for that collection — ensure seed objects satisfy the new rules so `firebase emulators:exec` passes |
| `storage.rules` | `scripts/seed-data/` files that include Storage URLs — update path patterns if bucket paths changed |
| `database.rules.json` | Seed data entries for Realtime DB paths |
| New Firestore composite index added to `firestore.indexes.json` | Add at least one seed object that exercises that index (all indexed fields populated) |
| Renamed or removed field | Remove every occurrence from seed data; rename in all seed objects |
| New required field added | Add a valid value for that field to EVERY seed object in the matching seed file |

### What "update seed data" means concretely

```ts
// Schema change — added required field `slug` to CategoryDocument
// src/db/schema/categories.ts
export interface CategoryDocument {
  name: string;
  slug: string; // ← NEW required field
  tier: number;
  // ...
}

// WRONG — seed file not updated; seeding will fail / produce invalid documents
// scripts/seed-data/categories-seed-data.ts
{ name: 'Electronics', tier: 1 } // ❌ missing slug

// RIGHT — seed file updated in the same change as the schema
{ name: 'Electronics', slug: 'electronics', tier: 1 } // ✅
```

### Seed script entry points

| File | Purpose |
|---|---|
| `scripts/seed-data/<domain>-seed-data.ts` | Raw seed objects for one collection |
| `scripts/seed-data/index.ts` | Barrel — re-exports all seed arrays |
| `scripts/seed-all-data.ts` | Master seeding script — imports from index |
| `scripts/seed-faqs.ts` | Dedicated FAQ seeder (if applicable) |

When a new collection is added to the schema:
1. Create `scripts/seed-data/<domain>-seed-data.ts` with representative seed objects.
2. Export it from `scripts/seed-data/index.ts`.
3. Add a seeding step in `scripts/seed-all-data.ts`.

### Rules for seed object quality

- **Every required field must be present** — no `undefined` or missing keys.
- **Use schema constants for values** — `PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED`, not `'published'`.
- **Cover at least one object per status/type variant** — if a field has enum values, seed at least one document per value so all code paths are exercised.
- **Relationships must be consistent** — if `OrderDocument` references a `userId`, that user must exist in the users seed array. Keep `scripts/seed-data/RELATIONSHIPS.md` updated.
- **No orphaned references** — never seed a FK value that has no corresponding parent seed object.
- **Timestamps** — use `new Date()` or a deterministic `new Date('2025-01-15T10:00:00Z')` — never string literals.
- **IDs** — use the same deterministic ID format already established in the seed file (e.g. `'product-001'`).

### Checklist for schema/rules changes

Every change that touches `src/db/schema/`, `firestore.rules`, `storage.rules`, `database.rules.json`, or `firestore.indexes.json` MUST include:
- [ ] Updated seed objects in `scripts/seed-data/<domain>-seed-data.ts`
- [ ] Updated `scripts/seed-data/RELATIONSHIPS.md` if FK references changed
- [ ] Updated `scripts/seed-data/index.ts` if a new seed file was added
- [ ] Updated `scripts/seed-all-data.ts` if a new collection is seeded
- [ ] Verified `npx tsc --noEmit scripts/seed-data/<domain>-seed-data.ts` passes with 0 errors

---

## Styling Standards

1. Use `THEME_CONSTANTS` (Rule 4) for all repeated Tailwind patterns
2. Use `ThemeContext` (`useTheme()`) only for conditional light/dark logic
3. Use existing components (Rule 7) - don't create raw `<input>`, `<button>`, etc.
4. No inline `style={{}}` except for dynamic calculated values
5. No CSS modules
6. Mobile-first — write base styles for 375 px, extend upward with `sm:` → `2xl:` (Rule 25)
7. Every grid/flex container must have explicit `xl:` and `2xl:` column/width classes (Rule 25)
8. No legacy polyfills or vendor-prefixed CSS (Rule 24)
9. All media (`<img>`, `<video>`) goes through `<MediaImage />`, `<MediaVideo />`, `<MediaAvatar />`, or `<MediaGallery />` — never raw tags or `<MediaDisplay />` directly (Rule 28)
10. Media containers use `w-full` + `aspect-*` classes; never fixed pixel widths/heights (Rule 28)

---

## Documentation Standards

- Update `docs/CHANGELOG.md` with every change
- Update `docs/GUIDE.md` when adding new functions/hooks/components/schemas
- Extend existing docs in `docs/` - NEVER create session-specific files
- NEVER create `REFACTORING_DATE.md`, `SESSION_SUMMARY.md`, etc.

### RULE 30: Keep Docs, Components, and Pages in Sync with Every Change

**Every entry added to `docs/CHANGELOG.md` MUST be accompanied by updates to all directly affected documentation files AND all impacted components or pages in the same change.**

This rule exists because changelog entries that are not reflected in the corresponding docs, components, or pages create drift — developers read the changelog, expect the described behaviour, and find something different in the code.

#### Triggers — what must be updated alongside a CHANGELOG entry

| CHANGELOG describes... | Also update |
|---|---|
| New or changed component API / props | `docs/GUIDE.md` component reference + all call sites in `src/components/` or `src/features/` that use the changed prop |
| New or changed hook API | `docs/GUIDE.md` hook reference + `docs/QUICK_REFERENCE.md` if the hook is listed there + all hook call sites |
| New or changed utility / helper | `docs/GUIDE.md` + all call sites using the old signature |
| New or changed API endpoint | `docs/GUIDE.md` API reference + `src/constants/api-endpoints.ts` + any service functions calling the endpoint |
| New or changed route | `docs/GUIDE.md` + `src/constants/routes.ts` + any `<Link>` / `router.push()` call sites |
| New page or feature | `docs/GUIDE.md` + `docs/QUICK_REFERENCE.md` if relevant + the page and feature barrel (`index.ts`) |
| Security / RBAC change | `docs/SECURITY.md` + `docs/RBAC.md` + `src/constants/rbac.ts` + any `ProtectedRoute` usage |
| Error handling change | `docs/ERROR_HANDLING.md` + affected API route error handlers |
| Styling / theme change | `docs/STYLING_GUIDE.md` + `src/constants/theme.ts` + affected components |
| Removed feature or deprecation | `docs/GUIDE.md` (remove the entry) + delete the code (Rule 24) — no `@deprecated` stubs |
| Schema / collection change | `docs/GUIDE.md` schema reference + `scripts/seed-data/` (Rule 29) |

#### What a complete CHANGELOG + sync update looks like

```
[CHANGELOG.md]
### Added
- `ProductCard` now accepts an optional `badge` prop (string) displayed in the top-right corner.

[Also updated in the same commit:]
- docs/GUIDE.md  → "ProductCard" section — added `badge?: string` prop description
- src/features/products/components/ProductCard.tsx  → prop added + rendered
- src/features/products/components/__tests__/ProductCard.test.tsx  → new test for badge rendering
- src/features/products/index.ts  → re-exported updated type if interface changed
```

#### Enforcement

- If you write a CHANGELOG entry, you MUST update the affected docs and code files before considering the task done.
- If you modify a component, hook, util, route, API endpoint, or schema, you MUST write the CHANGELOG entry AND update the relevant doc sections.
- **Never ship a CHANGELOG entry that references a component, hook, or route that the docs do not yet describe.**

### Core Documentation Set (Keep Updated)

- `docs/README.md` (documentation index)
- `docs/GUIDE.md` (complete reference)
- `docs/QUICK_REFERENCE.md` (common patterns)
- `docs/CHANGELOG.md` (history)
- `docs/SECURITY.md` (security)
- `docs/RBAC.md` (role access)
- `docs/ERROR_HANDLING.md` (error handling)
- `docs/STYLING_GUIDE.md` (styling standards)

When updating links, reference only existing docs from this maintained set unless a new doc is explicitly approved.

---

## Development Commands

### Build & Test

```bash
# Development server (with Turbopack)
npm run dev

# Type checking only (no build)
npx tsc --noEmit src/path/to/changed-file.tsx

# Full production build
npm run build

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
```

### Firebase Deployment (PowerShell Scripts)

```powershell
# Deploy Firestore composite indices
.\scripts\deploy-firestore-indices.ps1

# Deploy security rules (Firestore, Storage, Database)
.\scripts\deploy-firestore-rules.ps1

# Check deployment status and view active indices
.\scripts\check-firestore-status.ps1
```

**Or use Firebase CLI directly:**

```bash
firebase deploy --only firestore              # All Firestore resources
firebase deploy --only firestore:rules        # Rules only
firebase deploy --only firestore:indexes      # Indices only
firebase deploy --only storage:rules          # Storage rules
firebase deploy --only database:rules         # Realtime DB rules
```

**Note:** Index creation can take several minutes. Monitor in Firebase Console.

### Vercel Deployment (PowerShell Scripts)

```powershell
# Sync environment variables from .env.local to Vercel
.\scripts\sync-env-to-vercel.ps1

# Dry run (preview without changes)
.\scripts\sync-env-to-vercel.ps1 -DryRun

# Sync to specific environment
.\scripts\sync-env-to-vercel.ps1 -Environment "production"

# Pull environment variables from Vercel
.\scripts\pull-env-from-vercel.ps1

# List all Vercel environment variables
.\scripts\list-vercel-env.ps1
```

---

## TypeScript Workflow

See **RULE 26** for the mandatory build verification order (`tsc --noEmit` → full `tsc --noEmit` → `npm run build`).
See **RULE 27** for the test-as-you-go requirement.
See **RULE 29** for the seed data sync requirement.
See **RULE 8** for the mandatory component reuse lookup table.
See **RULE 10** for the page thickness limit and decomposition pattern.

---

## Pre-Code Checklist

Before writing ANY code, verify:

- [ ] **Is this feature-specific code?** → put it in `src/features/<name>/` (Tier 2), not directly in `src/components/`
- [ ] **Is this truly shared/reusable across features?** → put it in `src/components/ui/`, `src/hooks/`, `src/utils/`, etc. (Tier 1)
- [ ] **Does my feature import another feature?** → move the shared piece to Tier 1 instead
- [ ] Does a component for this already exist in `@/components` or `@/features/<name>`?
- [ ] Does a hook for this already exist in `@/hooks` or `@/features/<name>/hooks`?
- [ ] Does a util/helper for this already exist in `@/utils` or `@/helpers`?
- [ ] Am I using `useTranslations()` (next-intl) for all JSX text in client components — NOT `UI_LABELS`?
- [ ] Am I using `UI_LABELS` / `UI_PLACEHOLDERS` / `ERROR_MESSAGES` / `SUCCESS_MESSAGES` for all API routes and non-JSX server code?
- [ ] Am I using `THEME_CONSTANTS` for all repeated Tailwind classes?
- [ ] Am I using `ROUTES` for all route paths?
- [ ] Am I using `API_ENDPOINTS` for all API paths?
- [ ] Am I using barrel imports (`@/constants`, not `@/constants/theme`)?
- [ ] Am I using repositories (not direct Firestore queries)?
- [ ] Am I using `USER_FIELDS`, `SCHEMA_DEFAULTS`, etc. for Firestore field names (not hardcoded strings)?
- [ ] Am I using `ERROR_MESSAGES.*` / `SUCCESS_MESSAGES.*` for all API error/success strings?
- [ ] Am I using error classes (not raw `throw new Error(...)`)?
- [ ] No inline styles for static values?
- [ ] Firebase Admin SDK only in `src/app/api/**` and `src/lib/`? (Auth, Firestore, Storage — never in UI code)
- [ ] No Firebase client SDK import (`@/lib/firebase/config`) in any component, hook, service, context, or page?
- [ ] No Firebase Storage client SDK usage anywhere in the frontend? (files staged locally → submit to backend)
- [ ] Realtime DB client listener authenticated via server-issued custom token (`/api/realtime/token`)? No direct client writes to Realtime DB?
- [ ] Is my `page.tsx` thin? (< 150 lines, no inline forms/tables)
- [ ] No `alert()` / `confirm()` / `prompt()` calls?
- [ ] No `console.log()` in production code? (use `logger` or `serverLogger`)
- [ ] Am I calling `fetch()` directly in any UI code (component, hook, context, page)? → never allowed; use a service function (Rule 20)
- [ ] Am I calling `apiClient` directly in a component, page, context, or hook? → move the call into a service function in `@/services` or `@/features/<name>/services`, then call it via a hook (Rule 21)
- [ ] Does a service for this domain already exist in `@/services` or `@/features/<name>/services`? → reuse it, do not duplicate
- [ ] Is my `useApiQuery`/`useApiMutation` `queryFn`/`mutationFn` calling a named service function — not an inline `apiClient.*` call? (Rule 21)
- [ ] Am I deleting the old implementation when replacing code — not keeping it alongside the new one? (Rule 24)
- [ ] No `@deprecated` stubs, compatibility wrappers, or dual implementations? (Rule 24)
- [ ] No legacy polyfills, `@supports` fallbacks, or manual vendor prefixes? (Rule 24)
- [ ] Have I run `npx tsc --noEmit` on changed files and resolved all TS errors? (Rule 26)
- [ ] Has `npm run build` completed with 0 errors? (Rule 26)
- [ ] Have I written or updated tests for every file I changed? (Rule 27)
- [ ] Before writing any `<input>`, `<textarea>`, `<select>`, `<button>`, or checkbox — did I check if the purpose-built component already exists in `@/components`? (Rule 8)
- [ ] Before making an image/video URL text field — am I using `ImageUpload` / `MediaUploadField`? (Rule 8)
- [ ] Before writing rich text — am I using `RichTextEditor`? (Rule 8)
- [ ] Does this `page.tsx` stay under 150 lines after my change? If not, decompose to a feature view. (Rule 10)
- [ ] Is my page a thin shell — no inline forms, no domain state, no direct API calls? (Rule 10)
- [ ] Did I write base styles for mobile first, then layer `sm:` → `xl:` → `2xl:`? (Rule 25)
- [ ] Does every grid/flex layout include explicit `xl:` and `2xl:` column classes? (Rule 25)
- [ ] Are all touch targets at least 44×44 px (`min-h-11 min-w-11`)? (Rule 25)
- [ ] Am I rendering any `<img>` or `<video>` directly? → use `MediaImage`, `MediaVideo`, `MediaAvatar`, or `MediaGallery` from `@/components` instead (Rule 28)
- [ ] Am I using `<MediaDisplay />` directly in a feature or page component? → use the contextual variant (`MediaImage` etc.) instead (Rule 28)
- [ ] Does every file upload include a `MediaDisplayMeta` object with `cropX/Y`, `cropWidth/Height`, `zoom`, `focalX/Y`, `aspectRatio`, `objectFit`, `displayMode`, `seoContext`, `alt`? (Rule 28)
- [ ] Are media containers using `w-full` + `aspect-*` Tailwind classes — no fixed `px` widths or heights? (Rule 28)
- [ ] Did I change a schema file, Firestore/Storage/Database rules, or `firestore.indexes.json`? → update `scripts/seed-data/<domain>-seed-data.ts` and `scripts/seed-all-data.ts` in the same change (Rule 29)
- [ ] Are all required fields present in every seed object for the changed collection? (Rule 29)
- [ ] Do seed objects use schema constants (`STATUS_VALUES.*`, `TYPE_VALUES.*`) instead of hardcoded strings? (Rule 29)
- [ ] Are FK relationships in seed data still consistent after the change? (Rule 29)
- [ ] Did I add a `docs/CHANGELOG.md` entry for this change? (Rule 30)
- [ ] Did I update `docs/GUIDE.md` (and any other affected doc file) to reflect the change? (Rule 30)
- [ ] Did I update all components, pages, or call sites that are impacted by the change described in the CHANGELOG? (Rule 30)
- [ ] Is every CHANGELOG entry I wrote backed by a corresponding doc + code update in the same change — no entry references something the docs don't yet describe? (Rule 30)


---

## Full Reference

See `docs/GUIDE.md` for complete inventory of every function, hook, component, class, constant, schema, repository, and API endpoint in this codebase.
