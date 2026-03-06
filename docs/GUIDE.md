# 📖 Codebase Reference Guide (Annexure)

> **Complete Index of All Code, Snippets, Functions, Classes, Hooks, Components, and Database Schemas**

**Last Updated**: March 4, 2026 (hooks & repositories sync)
**Status**: Comprehensive Reference for LetItRip.in Project

---

## 📑 Table of Contents

0. [Architecture Overview](#0-architecture-overview)
1. [Classes (Singletons)](#1-classes-singletons)
2. [Constants](#2-constants)
3. [Hooks](#3-hooks)
4. [Utils (Pure Functions)](#4-utils-pure-functions)
5. [Helpers (Business Logic)](#5-helpers-business-logic)
6. [Snippets (Reusable Patterns)](#6-snippets-reusable-patterns)
7. [Repositories (Data Access Layer)](#7-repositories-data-access-layer)
8. [Database Schemas](#8-database-schemas)
9. [Components](#9-components)
10. [Feature Modules](#10-feature-modules)
11. [Pages (App Routes)](#11-pages-app-routes)
12. [Types](#12-types)
13. [API Endpoints](#13-api-endpoints)
14. [Lib Modules](#14-lib-modules)
15. [Client Service Layer (`@/services`)](#15-client-service-layer-services)

---

## 0. Architecture Overview

> For the full set of mandatory coding rules, see [`../.github/copilot-instructions.md`](../.github/copilot-instructions.md).

### Three-Tier Pluggable Design

The codebase is structured in **three clearly separated tiers**. The boundary exists so that Tier 1 (shared primitives) can be extracted into a standalone npm package (`@letitrip/ui`, `@letitrip/utils`) at any point — requiring only `tsconfig.json` alias changes, with zero edits to page or feature files.

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

---

### Tier 1 — Shared Primitives (Extractable Layer)

These are the modules that would become the `@letitrip/*` package family:

| Directory              | Path                                                                              | Package target        |
| ---------------------- | --------------------------------------------------------------------------------- | --------------------- |
| UI design system       | `src/components/ui/`, `forms/`, `feedback/`, `typography/`, `utility/`, `layout/` | `@letitrip/ui`        |
| Cross-feature hooks    | `src/hooks/`                                                                      | `@letitrip/hooks`     |
| Pure utility functions | `src/utils/`                                                                      | `@letitrip/utils`     |
| Business logic helpers | `src/helpers/`                                                                    | `@letitrip/helpers`   |
| Singleton services     | `src/classes/`                                                                    | `@letitrip/services`  |
| App-wide constants     | `src/constants/`                                                                  | `@letitrip/constants` |

**Rules for Tier 1 code:**

- No imports from `@/features/*` — ever.
- No feature-domain terminology (e.g. no `ProductCard` in `src/components/ui/`).
- Components are generic and composable (Button, Card, Input, Badge, Pagination…).

---

### Tier 2 — Feature Modules (`src/features/<name>/`)

Each domain feature is a **self-contained vertical slice**:

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

**`index.ts` barrel pattern:**

```typescript
// src/features/products/index.ts
export * from "./components";
export * from "./hooks";
export * from "./types";
export * from "./constants";
```

**Import rules:**

```tsx
// INSIDE a feature module — only Tier 1
import { Card, Button } from "@/components"; // ✅
import { useApiQuery } from "@/hooks"; // ✅
import { formatCurrency } from "@/utils"; // ✅
import { CartButton } from "@/features/cart"; // ❌ cross-feature!

// INSIDE a page — Tier 1 + Tier 2
import { ProductGrid } from "@/features/products"; // ✅
import { CartButton } from "@/features/cart"; // ✅
import { Button } from "@/components"; // ✅
```

**Cross-feature shared logic:** move to Tier 1 (`src/hooks/`, `src/utils/`, `src/components/ui/`), then both features import it from there.

---

### Tier 3 — Page Layer (`src/app/`)

- Thin orchestration only — no business logic, no inline forms/tables.
- < 150 lines of JSX.
- Composes feature modules (Tier 2) and shared primitives (Tier 1).
- All filter/sort/pagination state lives in URL query params (see `useUrlTable` hook).

---

### Package Extraction Path

When ready to extract shared code into a library:

1. Copy `src/components/ui|forms|feedback|typography|utility|layout`, `src/hooks/`, `src/utils/`, `src/helpers/`, `src/classes/`, `src/constants/` into an npm package.
2. Update `tsconfig.json` path aliases only:
   ```json
   { "@/components": ["@letitrip/ui"], "@/utils": ["@letitrip/utils"] }
   ```
3. **Zero page or feature files need to change** — all barrel imports resolve automatically.

---

### Migration Strategy (Gradual)

| Stage                                                       | What to do                                                                                                                                                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **New features**                                            | Create directly in `src/features/<name>/`                                                                                                                                                                 |
| **Existing `src/components/<feature>/`**                    | Keep working; migrate to `src/features/<name>/components/` when the feature is next touched                                                                                                               |
| **Feature-specific hooks in `src/hooks/`**                  | Move to `src/features/<name>/hooks/` progressively (e.g. `useRealtimeBids` → `src/features/auctions/hooks/`, `useAdminStats` → `src/features/admin/hooks/`, `useRazorpay` → `src/features/orders/hooks/`) |
| **Shared admin/user components in `src/components/admin/`** | Stay in Tier 1 until admin is fully its own feature module                                                                                                                                                |

---

## 1. Classes (Singletons)

**Location**: `src/classes/`  
**Import**: `import { ClassName } from '@/classes'`

### CacheManager

**File**: `CacheManager.ts`  
**Purpose**: In-memory caching with TTL support  
**Instance**: `cacheManager`

**Methods**:

- `get<T>(key: string): T | null` - Retrieve cached value
- `set<T>(key: string, value: T, ttl?: number): void` - Store value with optional TTL
- `has(key: string): boolean` - Check if key exists and is not expired
- `delete(key: string): void` - Remove cached value
- `clear(): void` - Clear all cached values
- `size(): number` - Get number of cached items
- `keys(): string[]` - Get all cache keys
- `prune(): void` - Remove expired entries

**Interfaces**:

- `CacheOptions` - Configuration options
- `CacheEntry<T>` - Cache entry structure

---

### StorageManager

**File**: `StorageManager.ts`  
**Purpose**: localStorage/sessionStorage wrapper with type safety  
**Instance**: `storageManager`

**Methods**:

- `get<T>(key: string, storage?: StorageType): T | null` - Get stored value
- `set<T>(key: string, value: T, storage?: StorageType): void` - Store value
- `remove(key: string, storage?: StorageType): void` - Remove stored value
- `clear(storage?: StorageType): void` - Clear all storage
- `has(key: string, storage?: StorageType): boolean` - Check if key exists
- `keys(storage?: StorageType): string[]` - Get all keys
- `size(storage?: StorageType): number` - Get storage size in bytes
- `isAvailable(storage?: StorageType): boolean` - Check storage availability

**Types**:

- `StorageType` - "local" | "session"

**Interfaces**:

- `StorageOptions` - Configuration options

---

### Logger

**File**: `Logger.ts`  
**Purpose**: Application logging with levels and persistence  
**Instance**: `logger`

**Methods**:

- `debug(message: string, data?: any): void` - Log debug message
- `info(message: string, data?: any): void` - Log info message
- `warn(message: string, data?: any): void` - Log warning message
- `error(message: string, error?: Error | any): void` - Log error message
- `getLogs(level?: LogLevel): LogEntry[]` - Get stored logs
- `clearLogs(): void` - Clear all logs
- `exportLogs(): string` - Export logs as JSON string
- `getLogsSummary(): object` - Get logs summary by level

**Types**:

- `LogLevel` - "debug" | "info" | "warn" | "error"

**Interfaces**:

- `LogEntry` - Log entry structure
- `LoggerOptions` - Configuration options

---

### EventBus

**File**: `EventBus.ts`  
**Purpose**: Event-driven communication between components  
**Instance**: `eventBus`

**Methods**:

- `subscribe(event: string, callback: Function): EventSubscription` - Subscribe to event
- `unsubscribe(event: string, callback: Function): void` - Unsubscribe from event
- `publish(event: string, data?: any): void` - Publish event
- `once(event: string, callback: Function): EventSubscription` - Subscribe once
- `clear(event?: string): void` - Clear subscriptions
- `getSubscriberCount(event: string): number` - Get subscriber count
- `getAllEvents(): string[]` - Get all event names

**Interfaces**:

- `EventSubscription` - Subscription object with unsubscribe method

---

### Queue

**File**: `Queue.ts`  
**Purpose**: Priority task queue with processing control  
**Instance**: Create with `new Queue()`

**Methods**:

- `enqueue(task: Task<T>): void` - Add task to queue
- `dequeue(): Task<T> | undefined` - Remove and return highest priority task
- `peek(): Task<T> | undefined` - View highest priority task
- `size(): number` - Get queue size
- `isEmpty(): boolean` - Check if queue is empty
- `clear(): void` - Clear all tasks
- `process(): void` - Process all tasks in queue
- `pauseProcessing(): void` - Pause automatic processing
- `resumeProcessing(): void` - Resume automatic processing

**Interfaces**:

- `QueueOptions` - Configuration options
- `Task<T>` - Task structure with priority and execution function

---

## 2. Constants

**Location**: `src/constants/`  
**Import**: `import { CONSTANT_NAME } from '@/constants'`

### UI_LABELS

**File**: `ui.ts`  
**Purpose**: All UI text strings and labels

**Categories**:

- `LOADING` - Loading states (DEFAULT, USERS, DATA, PAGE, CONTENT, UPLOADING, SAVING, SENDING, CHANGING)
- `EMPTY` - Empty states (NO_DATA, NO_USERS, NO_RESULTS, NO_ITEMS, NOT_SET, NO_EMAIL, NO_PHONE, NO_ADDRESSES)
- `ERROR_PAGES` - Error page content (NOT_FOUND, UNAUTHORIZED, FORBIDDEN, SERVER_ERROR, GENERIC_ERROR)
- `ACTIONS` - Action buttons (SAVE, CANCEL, DELETE, EDIT, CREATE, UPDATE, SUBMIT, CONFIRM, CLOSE, BACK, NEXT, PREVIOUS, SEARCH, FILTER, CLEAR, APPLY, RESET, REFRESH, RETRY, UPLOAD, DOWNLOAD, EXPORT, IMPORT, YES, NO, CHANGE_PASSWORD, RESEND_VERIFICATION, EDIT_PROFILE, VIEW_DETAILS, MANAGE, UPDATE_PASSWORD)
- `FORM` - Form labels (EMAIL, PASSWORD, CONFIRM_PASSWORD, CURRENT_PASSWORD, NEW_PASSWORD, FIRST_NAME, LAST_NAME, DISPLAY_NAME, PHONE, ADDRESS, CITY, STATE, ZIP_CODE, COUNTRY, EMAIL_VERIFICATION, PHONE_VERIFICATION)
- `STATUS` - Status labels (ACTIVE, INACTIVE, PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED, DRAFT, PUBLISHED, EMAIL_VERIFIED, EMAIL_NOT_VERIFIED, PHONE_VERIFIED, PHONE_NOT_VERIFIED, VERIFIED)
- `PROFILE` - Profile section (EDIT_PROFILE, VIEW_PROFILE, MY_PROFILE, PROFILE_SETTINGS, PROFILE_INFORMATION, ACCOUNT_INFORMATION, SAVED_ADDRESSES, SECURITY_SETTINGS, USER_ID, ROLE, ACCOUNT_ROLE, TOTAL_ORDERS)
- `WISHLIST` - Wishlist section (TITLE, DESCRIPTION, EMPTY, ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST, ITEMS_COUNT)
- `MESSAGES` - User-facing messages (EMAIL_VERIFICATION_REQUIRED, PHONE_VERIFICATION_REQUIRED, UNSAVED_CHANGES_WARNING, EMAIL_VERIFIED_SUCCESS, PHONE_VERIFIED_SUCCESS)
- `SETTINGS` - Settings page (TITLE, UNSAVED_BANNER, UNSAVED_DETAIL, SAVE_CHANGES, SAVING)
- `NAV` - Navigation labels (HOME, PRODUCTS, AUCTIONS, SELLERS, CATEGORIES, PROMOTIONS, PROFILE, ORDERS, WISHLIST, ADDRESSES, SETTINGS, CONTACT_US, HELP_CENTER, ACCOUNT, SUPPORT)
- `ROLES` - Role display labels (USER, SELLER, MODERATOR, ADMIN)
- `CONFIRM` - Confirmation messages (DELETE, CANCEL, DISCARD, LOGOUT, UNSAVED_CHANGES)
- `AUTH` - Authentication messages (15+ constants):
  - PHONE_LOGIN_NOT_IMPLEMENTED, PHONE_REGISTER_NOT_IMPLEMENTED
  - EMAIL_OR_PHONE_REQUIRED, DEFAULT_DISPLAY_NAME, DEFAULT_ROLE
  - ID_TOKEN_REQUIRED, SESSION_CREATE_FAILED, SESSION_CLEAR_FAILED
  - RATE_LIMIT_EXCEEDED, AUTHENTICATION_REQUIRED, ACCOUNT_DISABLED
  - EMAIL_VERIFICATION_REQUIRED_SHORT, INSUFFICIENT_PERMISSIONS
  - ACCESS_DENIED, REDIRECTING_IN, SECONDS
- `AVATAR` - Avatar upload labels (TITLE, INSTRUCTION, ZOOM, POSITION, RESET, SAVE_CHANGES, CHOOSE_IMAGE, CHANGE_PHOTO, REMOVE_PHOTO, UPLOADING, SAVING, and more)
- `ADMIN` - Admin content management labels (CONTENT with PRODUCTS, ORDERS, REVIEWS subsections)
- `FAQ` - FAQ section labels (WAS_THIS_HELPFUL, HELPFUL, NOT_HELPFUL, RELATED_QUESTIONS, VIEW_ALL, SEARCH_PLACEHOLDER)
- `BLOG_PAGE` - Blog page labels (TITLE, SUBTITLE, NO_POSTS, NO_POSTS_DESCRIPTION, PAGE_OF(page, total))
- `HERO_CAROUSEL` - Carousel accessibility labels (PREV_SLIDE, NEXT_SLIDE, GO_TO_SLIDE(n))
- `NOTIFICATIONS` - Notification UI labels (TITLE, MARK_READ, MARK_ALL_READ, DELETE, NO_NOTIFICATIONS, NO_NOTIFICATIONS_DESC, ALL, VIEW_ALL, LOADING, ERROR)
- `ACTIONS` additions: `TRY_AGAIN`, `GO_HOME` — added in Phase 6.7 for ErrorBoundary
- `NAV` additions: `SELLER` — short label for mobile bottom nav seller shortcut (Phase 6.6)

---

### UI_PLACEHOLDERS

**File**: `ui.ts`  
**Purpose**: Input placeholder text

**Fields**:

- `EMAIL` - "Enter your email address"
- `PASSWORD` - "Enter your password"
- `SEARCH` - "Search..."
- `NAME` - "Enter your full name"
- `PHONE` - "Enter phone number"
- `ADDRESS` - "Enter address"
- `CITY` - "Enter city"
- `ZIP_CODE` - "Enter ZIP code"
- `DESCRIPTION` - "Enter description"
- `TITLE` - "Enter title"

---

### UI_HELP_TEXT

**File**: `ui.ts`  
**Purpose**: Help text for form fields

**Fields**:

- `PASSWORD_REQUIREMENTS` - Password complexity requirements
- `EMAIL_FORMAT` - Email format requirements
- `PHONE_FORMAT` - Phone format requirements
- `PHONE_10_DIGIT` - 10-digit phone help text
- `FILE_SIZE_LIMIT` - File upload size limits
- `SUPPORTED_FORMATS` - Supported file formats
- `EMAIL_VERIFICATION` - Email verification help
- `AVATAR_UPLOAD` - Avatar upload instructions
- `AVATAR_FORMATS` - Avatar supported formats

---

### THEME_CONSTANTS

**File**: `theme.ts`  
**Purpose**: Tailwind CSS utility classes for theming

**Categories**:

- `themed` - Theme-aware colors (auto dark mode support)
  - Backgrounds: `bgPrimary`, `bgSecondary`, `bgTertiary`, `bgInput`
  - Text colors: `textPrimary`, `textSecondary`, `textMuted`, `textError`, `textSuccess`, `textOnPrimary`, `textOnDark`
  - Borders: `border`, `borderLight`, `borderError`, `borderColor`
  - Interactive: `hover`, `hoverCard`, `hoverBorder`, `hoverText`, `focusRing`
  - Placeholders: `placeholder`
- `input` - Input/form field styles
  - `base` - Base input styling with focus states
  - `disabled` - Disabled state styling
  - `withIcon` - Input with left icon padding
- `button` - Button component styles
  - `base` - Base button styling with transitions
  - `active` - Active state scale animation
  - `minWidth` - Minimum width utility
- `card` - Card component styles
  - `base` - Base card styling
  - `shadow`, `shadowElevated` - Shadow variants
  - `hover` - Hover animation with shadow
- `layout` - Layout dimensions and utilities
  - Heights: `titleBarHeight`, `navbarHeight`, `bottomNavHeight`
  - Widths: `sidebarWidth`, `maxContentWidth`
  - Padding: `contentPadding`
  - Backgrounds: `titleBarBg`, `navbarBg`, `sidebarBg`, `bottomNavBg`, `footerBg`
  - Utilities: `fullScreen`, `flexCenter`, `centerText`
- `zIndex` - Z-index layering system
  - `titleBar`, `navbar`, `sidebar`, `overlay`, `bottomNav`, `search`, `searchBackdrop`
- `animation` - Animation durations
  - `fast` (150ms), `normal` (300ms), `slow` (500ms)
- `spacing` - Spacing patterns
  - Groups: `section`, `formGroup`, `stack`, `stackSmall`, `inline`, `inlineSmall`, `inlineLarge`
  - `gap` — all-sides gap + axis variants: `gap.xs/sm/md/lg/xl`, `gap.x.xs…xl`, `gap.y.xs…xl`
  - `padding` — all-sides + axis + single-side: `padding.xs…2xl`, `padding.x.*`, `padding.y.*`, `padding.top.*`, `padding.bottom.*`, `padding.left.*`, `padding.right.*`
  - `margin` — all-sides + axis + single-side: `margin.xs…xl`, `margin.x.*` (includes `.auto`), `margin.y.*`, `margin.top.*`, `margin.bottom.*`, `margin.left.*`, `margin.right.*`
- `flex` - Pre-composed flex containers — use instead of inline `flex items-center justify-*`
  - Base: `row`, `col`, `rowWrap`, `inline`
  - Row alignment: `center` (`flex items-center justify-center`), `between` (`flex items-center justify-between`), `betweenStart` (`flex items-start justify-between`), `start`, `end`, `rowCenter`, `rowStart`, `rowEnd`
  - Column alignment: `centerCol`, `colStart`, `colCenter`, `colEnd`, `colBetween`
  - Inline: `inlineCenter`, `inlineFull`
  - Child behaviour: `grow` (`flex-1`), `growMin` (`flex-1 min-w-0`), `growMinH` (`flex-1 min-h-0`), `noShrink` (`flex-shrink-0`), `none` (`flex-none`)
- `grid` - Mobile-first responsive grids — use instead of inline `grid grid-cols-*`
  - Column presets: `cols1`, `cols2` (1→2), `cols3` (1→2→3), `cols4` (1→2→3→4), `cols5` (1→2→3→4→5), `cols6` (2→3→4→5→6)
  - Auto-fill: `autoFillSm` (200px min), `autoFillMd` (280px min), `autoFillLg` (360px min)
  - Layout splits: `sidebar` (280px + 1fr), `sidebarRight`, `sidebarWide` (320px + 1fr), `halves` (1→2), `twoThird` (2fr/1fr), `oneThird` (1fr/2fr)
- `position` - Named position helpers
  - `relative`, `absolute`, `fixed`, `sticky`, `static`
  - `fill` (`absolute inset-0`), `absoluteCenter` (centered in parent), `absoluteTop`, `absoluteBottom`, `absoluteTopRight`, `absoluteTopLeft`, `absoluteBottomRight`, `absoluteBottomLeft`
  - `fixedFill` (`fixed inset-0`), `fixedTop`, `fixedBottom`, `stickyTop`, `stickyBottom`
- `size` - Width, height, and square size tokens
  - `full` (`w-full h-full`), `screen`, `minScreen`
  - `w` — `full`, `auto`, `screen`, `half`, `third`, `twoThirds`, `quarter`, `threeQuarters`, `fit`, `min`, `max`
  - `h` — `full`, `screen`, `auto`, `fit`, `min`, `max`
  - `square` — `xs` (w-4 h-4) through `4xl` (w-24 h-24)
- `overflow` - Named overflow helpers — use instead of raw `overflow-*`
  - `hidden`, `auto`, `scroll`, `xAuto`, `yAuto`, `xHidden`, `yHidden`, `xScroll`, `yScroll`, `visible`
- `page` - Responsive page container patterns — max-width + `mx-auto` + responsive padding in one token
  - `container.sm` (`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8`) — blog posts, legal pages
  - `container.md` (`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8`) — narrow content, contact, about
  - `container.lg` (`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8`) — checkout, help, medium content
  - `container.xl` (`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`) — product detail, cart
  - `container["2xl"]` (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) — products, auctions, search grids
  - `container.full` (`max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8`) — full-bleed wide content
  - `container.wide` (`max-w-screen-2xl mx-auto px-4 sm:px-6`) — wide store/seller layouts
  - `px` (`px-4 sm:px-6 lg:px-8`) — responsive horizontal padding (no max-width)
  - `pxSm` (`px-4 sm:px-6`) — compact responsive horizontal padding
  - `empty` (`py-16`) — vertical padding for empty/loading states (pair with `flex.hCenter`)
  - `authPad` (`py-8 sm:py-12`) — vertical padding for auth form wrappers
- `flex.hCenter` (`"flex justify-center"`) — horizontal centering only, no vertical alignment; use with `page.empty` for loading states
- `typography` - Text styling
  - Headings: `h1` to `h6` - Responsive heading styles
  - Body: `body`, `bodyLarge`, `bodySmall`
  - Utilities: `small`, `caption`, `display`, `lead`
- `container` - Container max-widths (xs, sm, md, lg, xl, 2xl, full)
- `borderRadius` - Border radius utilities (sm, md, lg, xl, 2xl, 3xl, full)
- `shadow` - Shadow utilities (sm, md, lg, xl, none)
- `transition` - Transition utilities (base, slow, fast)
- `colors` - Semantic colors
  - `badge` - Badge color variations (info, success, warning, error, default)
  - `alert` - Alert color variations
  - `button` - Button color variations
  - `icon` - Icon color variations
  - `status` - Status color variations
- `iconSize` - Icon size utilities (xs, sm, md, lg, xl)
- `opacity` - Opacity utilities (low, medium, high, full)
- `text` - Text utilities
  - `emphasis` - Text emphasis (bold, semibold, medium, normal, light)
- `rating` - Star rating colour tokens
  - `filled` (`text-yellow-400`) — filled/active star
  - `empty` (`text-gray-300 dark:text-gray-600`) — empty/inactive star
- `tab` - Tab navigation styles
  - `active` — active tab indicator style
  - `inactive` — inactive tab hover style
- `chart` - Chart wrapper height utilities (use on Recharts parent `<div>` with `ResponsiveContainer height="100%"` inside)
  - `height` (`h-60`) — 240 px standard chart
  - `heightMd` (`h-[280px]`) — 280 px medium chart
  - `heightLg` (`h-80`) — 320 px tall chart
- `badge` - Badge colour presets (`active`, `inactive`, `admin`, `seller`, `moderator`, `pending`, `banned`)
- `pageHeader` - Page header gradient presets (`adminGradient`, `sellerGradient`, `userGradient`)
- `sectionBg` - Section background presets (`subtle`, `card`)

---

### SITE_CONFIG

**File**: `site.ts`  
**Purpose**: Site-wide configuration

**Fields**:

- `name` - Site name
- `description` - Site description
- `url` - Base URL
- `author` - Author information
- `social` - Social media links
- `contact` - Contact information
- `features` - Feature flags

---

### SEO_CONFIG

**File**: `seo.ts`  
**Purpose**: SEO metadata configuration

**Fields**:

- `defaultTitle` - Default page title
- `titleTemplate` - Title template pattern
- `description` - Default meta description
- `keywords` - Default meta keywords
- `openGraph` - Open Graph metadata
- `twitter` - Twitter card metadata

**Functions**:

- `generateMetadata(page)` - Generate page-specific metadata
- `generateProfileMetadata(user)` - Generate user profile metadata

---

### MAIN_NAV_ITEMS

**File**: `navigation.tsx`  
**Purpose**: Main navigation menu items

**Structure**: Array of navigation items with label, href, icon

---

### SIDEBAR_NAV_GROUPS

**File**: `navigation.tsx`  
**Purpose**: Sidebar navigation groups (admin, user dashboards)

**Structure**: Array of navigation groups with title and items

---

## Internationalisation (i18n)

**Package**: `next-intl@4.8.3` (App Router native)  
**Status**: ✅ Complete — Phase 25–26. `[locale]` routing active, translations available.

### Architecture Overview

```
src/
  proxy.ts                   ← locale detection + URL rewriting (next-intl)
  i18n/
    routing.ts               ← defineRouting({ locales, defaultLocale, localePrefix })
    request.ts               ← getRequestConfig (per-request server config)
  app/
    layout.tsx               ← thin HTML root shell — <html lang={locale}> via getLocale()
    [locale]/
      layout.tsx             ← NextIntlClientProvider + all app providers
      page.tsx               ← homepage
      about/ auth/ admin/ …  ← all localized routes
    api/                     ← API routes (no locale, stay at root)
    globals.css              ← stays at root
messages/
  en.json                    ← English translations (source of truth)
  hi.json                    ← Hindi translations
```

### Key Files

| File                          | Purpose                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/i18n/routing.ts`         | Locale routing config — `defineRouting({ locales, defaultLocale, localePrefix })`                                           |
| `src/i18n/request.ts`         | Per-request server config — resolves locale + loads message JSON; calls `setupZodErrorMap()`                                |
| `src/i18n/navigation.ts`      | Locale-aware navigation — `createNavigation(routing)` exports `Link`, `useRouter`, `usePathname`, `redirect`, `getPathname` |
| `src/proxy.ts`                | `createMiddleware(routing)` — locale detection + URL rewriting                                                              |
| `next.config.js`              | `createNextIntlPlugin('./src/i18n/request.ts')` wrapping the Next config                                                    |
| `src/app/layout.tsx`          | Root HTML shell — `<html lang={await getLocale()}>`                                                                         |
| `src/app/[locale]/layout.tsx` | Locale layout — `NextIntlClientProvider` + `<ZodSetup />` + all providers                                                   |
| `messages/en.json`            | English translation strings (source of truth)                                                                               |
| `messages/hi.json`            | Hindi translation strings                                                                                                   |

### Routing Config (`src/i18n/routing.ts`)

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "hi"], // supported locales
  defaultLocale: "en", // English = default (no URL prefix)
  localePrefix: "as-needed", // /products (en) vs /hi/products (hi)
});

export type Locale = (typeof routing.locales)[number]; // 'en' | 'hi'
```

### Message File Structure (`messages/en.json`)

Keys mirror `UI_LABELS` with camelCase names. Top-level sections:

| Key             | Content                                                                             |
| --------------- | ----------------------------------------------------------------------------------- |
| `loading`       | Loading state strings                                                               |
| `empty`         | Empty state strings                                                                 |
| `errorPages`    | 404/401/403/500 page content                                                        |
| `actions`       | Button labels (save, cancel, delete…)                                               |
| `sort`          | Sort option labels                                                                  |
| `form`          | Form field labels                                                                   |
| `status`        | Status labels (active, pending…)                                                    |
| `roles`         | Role names                                                                          |
| `confirm`       | Confirmation dialog strings                                                         |
| `messages`      | System notification strings                                                         |
| `nav`           | Navigation labels                                                                   |
| `auth`          | All auth page strings (login, register, forgotPassword, resetPassword, verifyEmail) |
| `profile`       | Profile section strings                                                             |
| `wishlist`      | Wishlist section strings                                                            |
| `settings`      | Account settings strings                                                            |
| `table`         | DataTable labels                                                                    |
| `products`      | Product listing/detail strings                                                      |
| `cart`          | Shopping cart strings                                                               |
| `orders`        | Order management strings                                                            |
| `checkout`      | Checkout flow strings                                                               |
| `auctions`      | Auction/bid strings                                                                 |
| `search`        | Search page strings                                                                 |
| `seller`        | Seller dashboard strings                                                            |
| `homepage`      | Homepage section strings                                                            |
| `footer`        | Footer link strings                                                                 |
| `accessibility` | ARIA / screen reader strings                                                        |

### Adding Translations

1. Add the key to `messages/en.json` first (English is the source of truth).
2. Add the same key with the translated value to `messages/hi.json`.
3. Use `useTranslations('section')` (client components) or `getTranslations('section')` (server components) to consume.

```tsx
// Client component
import { useTranslations } from "next-intl";
const t = useTranslations("actions");
<button>{t("save")}</button>;

// Server component / async
import { getTranslations } from "next-intl/server";
const t = await getTranslations("nav");
<title>{t("home")}</title>;
```

### i18n Wiring Pattern (Phases 28–30)

**Rule**: New and refactored client components MUST use `useTranslations` — not `UI_LABELS` — for all user-visible text.

**Wired components (Phases 28–30):**

| Component / Page           | Namespace(s)                     |
| -------------------------- | -------------------------------- |
| `TitleBar.tsx`             | `accessibility` (aria-labels)    |
| `Sidebar.tsx`              | `nav` (all nav labels)           |
| `BottomNavbar.tsx`         | `nav`                            |
| `Footer.tsx`               | `footer`, `nav`                  |
| `LoginForm.tsx`            | `auth`                           |
| `RegisterForm.tsx`         | `auth`                           |
| `forgot-password/page.tsx` | `auth`                           |
| `reset-password/page.tsx`  | `auth`                           |
| `verify-email/page.tsx`    | `auth`                           |
| `unauthorized/page.tsx`    | `errorPages`, `auth`, `actions`  |
| `not-found.tsx`            | `errorPages`, `actions`          |
| `error.tsx`                | `errorPages`, `actions`          |
| `cart/page.tsx`            | `cart`                           |
| `user/wishlist/page.tsx`   | `wishlist`, `actions`, `loading` |
| `user/settings/page.tsx`   | `settings`                       |

**Critical rule**: Never use `useTranslations` at module scope. Always call it inside the component function body (before any early returns).

```tsx
// WRONG — module-level hook call
const LABELS = UI_LABELS.AUTH; // static constant fine
const t = useTranslations("auth"); // ❌ cannot call hooks here

// CORRECT
export function MyComponent() {
  const t = useTranslations("auth"); // ✅ inside component
  return <button>{t("login.signIn")}</button>;
}
```

**Interpolation**: Use `t("key", { variable: value })` — NOT `.replace("{var}", val)`.

```tsx
// WRONG
{
  UI_LABELS.FORGOT_PASSWORD.RESET_LINK_SENT_TO.replace("{email}", email);
}

// RIGHT
{
  t("forgotPassword.resetLinkSentTo", { email });
}
// messages: "resetLinkSentTo": "We sent a reset link to {email}"
```

### Adding a New Locale

1. Add the locale code to `routing.locales` array in `src/i18n/routing.ts`.
2. Create `messages/<locale>.json` with all keys from `en.json` translated.
3. No other config changes needed — `request.ts` dynamically imports by locale.

---

### API_ENDPOINTS

**File**: `api-endpoints.ts`  
**Purpose**: Centralized API endpoint constants

**Categories**:

- `AUTH` - Authentication endpoints
- `USERS` - User management endpoints
- `PRODUCTS` - Product endpoints
- `ORDERS` - Order endpoints
- `REVIEWS` - Review endpoints
- `CAROUSEL` - Carousel endpoints
- `CATEGORIES` - Category endpoints
- `FAQS` - FAQ endpoints
- `SETTINGS` - Settings endpoints
- `SESSIONS` - Session management endpoints
- `MEDIA` - Media upload/crop/trim endpoints
- `ADMIN` - Admin dashboard and user management endpoints
- `HOMEPAGE_SECTIONS` - Homepage section endpoints
- `ADDRESSES` - Address management endpoints (deprecated, use top-level `ADDRESSES`)

---

### ROUTES

**File**: `routes.ts`  
**Purpose**: Application route paths

**Categories**:

- `PUBLIC` - Public routes (HOME, FAQS)
- `AUTH` - Authentication routes (LOGIN, REGISTER, FORGOT_PASSWORD, RESET_PASSWORD, VERIFY_EMAIL)
- `USER` - User dashboard routes (PROFILE, SETTINGS, ORDERS, WISHLIST, ADDRESSES)
- `ADMIN` - Admin dashboard routes (DASHBOARD, USERS, CAROUSEL, CATEGORIES, SECTIONS, SITE, REVIEWS, FAQS)
- `SELLER` - Seller dashboard routes
- `UNAUTHORIZED` - Unauthorized access page

---

### RBAC_CONFIG

**File**: `rbac.ts`  
**Purpose**: Role-Based Access Control configuration

**Constants**:

- `ROLE_HIERARCHY` — `Record<UserRole, number>` (`{ user: 0, seller: 1, moderator: 2, admin: 3 }`) — numeric hierarchy for permission comparison
- `RBAC_CONFIG` — `Record<string, RouteAccessConfig>` — keyed by `ROUTES.*`, defines per-route access rules

**RouteAccessConfig Interface**:

- `path` - Route path string
- `allowedRoles` - Array of UserRole values ("user", "seller", "moderator", "admin")
- `requireEmailVerified?` - Optional boolean requiring verified email
- `requireActiveAccount?` - Optional boolean requiring active account
- `redirectTo?` - Optional redirect path for unauthorized users

**Functions**:

- `hasRouteAccess(route, user)` - Check if user has access to route
- `getRouteAccessConfig(route)` - Get access config for a route
- `checkAccess(user, config)` - Validate user against access requirements

**Helper Functions**:

- `isAdmin(user)` - Check if user is admin
- `isModerator(user)` - Check if user is moderator
- `isSeller(user)` - Check if user is seller

**Route Categories**:

- User routes (PROFILE, SETTINGS, ORDERS, WISHLIST, ADDRESSES) - Require authentication
- Admin routes (DASHBOARD, USERS, CAROUSEL, etc.) - Require admin role
- Moderator routes (REVIEWS, FAQS moderation) - Require moderator or admin
- Seller routes - Require seller, moderator, or admin

---

### Navigation Tab Constants

**File**: `navigation.tsx`  
**Purpose**: Tab configuration arrays for SectionTabs component

**Constants**:

- `ADMIN_TAB_ITEMS` — Array of `{ label, href }` — Dashboard, Users, Site Settings, Carousel, Sections, Categories, FAQs, Reviews (8 tabs)
- `USER_TAB_ITEMS` — Array of `{ label, href }` — Profile, Orders, Wishlist, Addresses, Settings (5 tabs)

**Usage**:

```tsx
import { ADMIN_TAB_ITEMS, USER_TAB_ITEMS } from '@/constants';
import { SectionTabs } from '@/components';

<SectionTabs tabs={ADMIN_TAB_ITEMS} variant="admin" />
<SectionTabs tabs={USER_TAB_ITEMS} variant="user" />
```

---

### ADDRESS_TYPES

**File**: `address.ts`  
**Purpose**: Address type options for Indian addresses

**Structure**: Array of address type options

```typescript
[
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];
```

**Type**: `AddressType` - "home" | "work" | "other"

---

### INDIAN_STATES

**File**: `address.ts`  
**Purpose**: List of all Indian states and union territories

**Structure**: Array of 36 state names

- 28 states (Andhra Pradesh, Arunachal Pradesh, Assam, etc.)
- 8 union territories (Delhi, Chandigarh, Puducherry, etc.)

**Type**: `IndianState` - Union type of all state names

---

### ERROR_MESSAGES

**File**: `messages.ts`  
**Purpose**: Error message constants

**Categories**:

- `AUTH` - Authentication errors (LOGIN_FAILED, REGISTRATION_FAILED, EMAIL_VERIFICATION_REQUIRED, UNAUTHORIZED, SESSION_EXPIRED, API_KEY_NOT_CONFIGURED, TOKEN_EXCHANGE_FAILED, ADMIN_ACCESS_REQUIRED, etc.)
- `VALIDATION` - Validation errors (INVALID_EMAIL, INVALID_PASSWORD, REQUIRED_FIELD, FAILED, TOKEN_REQUIRED, VERIFICATION_FIELDS_REQUIRED, VERIFICATION_CODE_FORMAT, PRODUCT_ID_REQUIRED, INVALID_TIME_RANGE, etc.)
- `USER` - User-specific errors (NOT_FOUND, NOT_AUTHENTICATED, ALREADY_EXISTS, etc.)
- `PASSWORD` - Password-related errors (TOO_WEAK, MISMATCH, INCORRECT, SOCIAL_PROVIDER_NO_PASSWORD, etc.)
- `EMAIL` - Email-related errors (SEND_FAILED, VERIFICATION_FAILED, ALREADY_VERIFIED, etc.)
- `UPLOAD` - File upload errors (INVALID_TYPE, FILE_TOO_LARGE, UPLOAD_FAILED, UPLOAD_ERROR, SAVE_ROLLBACK, CLEANUP_FAILED, DELETE_OLD_FILE_FAILED)
- `GENERIC` - Generic error messages (INTERNAL_ERROR, NOT_FOUND, BAD_REQUEST, NETWORK_ERROR, SERVER_CONFIG_ERROR, NOT_IMPLEMENTED, etc.)
- `DATABASE` - Database errors (FETCH_FAILED, NOT_FOUND, CONNECTION_ERROR)
- `SESSION` - Session errors (FETCH_FAILED, FETCH_USER_PROFILE_ERROR, FIRESTORE_SUBSCRIPTION_ERROR, VALIDATION_FAILED, SERVER_LOGOUT_ERROR, SIGN_OUT_ERROR, CREATION_ERROR, NOT_FOUND, INVALID, ID_REQUIRED, INVALID_COOKIE, REVOKED_OR_EXPIRED, USER_NOT_FOUND_OR_DISABLED, CANNOT_REVOKE_OTHERS)
- `ADMIN` - Admin operation errors (REVOKE_SESSION_FAILED, REVOKE_USER_SESSIONS_FAILED, UPDATE_USER_ROLE_FAILED, BAN_USER_FAILED, etc.)
- `REVIEW` - Review errors (NOT_FOUND, ALREADY_REVIEWED, UPDATE_NOT_ALLOWED, DELETE_NOT_ALLOWED, UPDATE_FAILED, VOTE_FAILED, FETCH_FAILED, SUBMIT_FAILED, etc.)
- `FAQ` - FAQ errors (NOT_FOUND, CREATE_FAILED, VOTE_FAILED, SAVE_FAILED, DELETE_FAILED, FETCH_FAILED, UPDATE_FAILED)
- `CATEGORY` - Category errors (NOT_FOUND, NOT_FOUND_AFTER_UPDATE, HAS_CHILDREN, HAS_PRODUCTS, SAVE_FAILED, DELETE_FAILED, FETCH_FAILED, etc.)
- `CAROUSEL` - Carousel errors (NOT_FOUND, MAX_ACTIVE_REACHED, REORDER_FAILED, SAVE_FAILED, DELETE_FAILED, FETCH_FAILED, etc.)
- `SECTION` - Homepage section errors (NOT_FOUND, REORDER_FAILED, SAVE_FAILED, DELETE_FAILED, FETCH_FAILED, etc.)
- `ORDER` - Order errors (FETCH_FAILED, UPDATE_FAILED, CREATE_FAILED, CANCEL_FAILED)
- `PRODUCT` - Product errors (NOT_FOUND, NOT_FOUND_AFTER_UPDATE, UPDATE_NOT_ALLOWED, DELETE_NOT_ALLOWED, FETCH_FAILED, etc.)
- `PHONE` - Phone errors (NO_PHONE, ALREADY_IN_USE, VERIFY_FAILED, ADD_FAILED)
- `MEDIA` - Media errors (TRIM_FAILED, CROP_FAILED, NO_FILE)
- `ADDRESS` - Address errors (FETCH_FAILED, CREATE_FAILED, UPDATE_FAILED, DELETE_FAILED, SET_DEFAULT_FAILED)
- `API` - API route logging errors (ROUTE*ERROR, CAROUSEL*_\*ERROR, PRODUCTS***ERROR, MEDIA***ERROR, ADMIN_SESSIONS_ERROR, LOGOUT\*_\_ERROR, etc.)

---

### SUCCESS_MESSAGES

**File**: `messages.ts`  
**Purpose**: Success message constants

**Categories**:

- `AUTH` - Authentication success messages (LOGIN_SUCCESS, LOGOUT_SUCCESS, REGISTER_SUCCESS)
- `USER` - User action success messages (PROFILE_UPDATED, PASSWORD_CHANGED, SETTINGS_SAVED, USER_UPDATED, ACCOUNT_DELETED)
- `UPLOAD` - File upload success (FILE_UPLOADED)
- `EMAIL` - Email verification success (VERIFICATION_SENT, VERIFIED, VERIFIED_SUCCESS, RESET_SENT)
- `PHONE` - Phone verification success (VERIFIED, VERIFIED_SUCCESS, VALIDATED)
- `PASSWORD` - Password reset success (UPDATED, RESET_EMAIL_SENT, RESET_SUCCESS)
- `ACCOUNT` - Account success (DELETED)
- `ADMIN` - Admin action success (USER_ROLE_UPDATED, USER_BANNED, USER_UNBANNED, SESSION_REVOKED, etc.)
- `REVIEW` - Review success (SUBMITTED, UPDATED, DELETED, APPROVED, REJECTED, SUBMITTED_PENDING_MODERATION, VOTE_RECORDED)
- `FAQ` - FAQ success (CREATED, UPDATED, DELETED, VOTE_HELPFUL, VOTE_NOT_HELPFUL)
- `CATEGORY` - Category success (CREATED, UPDATED, DELETED)
- `CAROUSEL` - Carousel success (CREATED, UPDATED, DELETED, REORDERED)
- `SECTION` - Homepage section success (CREATED, UPDATED, DELETED, REORDERED)
- `ORDER` - Order success (CREATED, UPDATED, CANCELLED)
- `PRODUCT` - Product success (CREATED, UPDATED, DELETED)
- `ADDRESS` - Address success (CREATED, UPDATED, DELETED, DEFAULT_SET)
- `SESSION` - Session success (ACTIVITY_UPDATED)
- `MEDIA` - Media success (VIDEO_TRIMMED, IMAGE_CROPPED)
- `LOGS` - Log success (WRITTEN)
- `NEWSLETTER` - Newsletter success (SUBSCRIBED, UNSUBSCRIBED, RESUBSCRIBED, UPDATED, DELETED)

---

### ADDRESS_TYPES

**File**: `address.ts`  
**Purpose**: Address type options

**Structure**: Array of address type objects

**Fields**:

- `value` - Address type value ("home", "work", "other")
- `label` - Display label

**Type**: `AddressType` - Union type of address type values

---

### INDIAN_STATES

**File**: `address.ts`  
**Purpose**: List of all Indian states and union territories

**Structure**: Array of 36 state/territory names

**Type**: `IndianState` - Union type of all state names

**Usage**:

```tsx
import { INDIAN_STATES, ADDRESS_TYPES } from "@/constants";

// Use in Select options
<Select
  options={[
    { value: "", label: "Select State" },
    ...INDIAN_STATES.map((state) => ({ value: state, label: state })),
  ]}
/>;
```

---

## 3. Hooks

**Location**: `src/hooks/`  
**Import**: `import { useHookName } from '@/hooks'`

### Authentication Hooks

#### useLogin

**File**: `useAuth.ts`  
**Purpose**: Handle user login  
**Returns**: `{ login, loading, error }`

#### useRegister

**File**: `useAuth.ts`  
**Purpose**: Handle user registration  
**Returns**: `{ register, loading, error }`

#### useVerifyEmail

**File**: `useAuth.ts`  
**Purpose**: Verify email address  
**Returns**: `{ verify, loading, error }`

#### useResendVerification

**File**: `useAuth.ts`  
**Purpose**: Resend verification email  
**Returns**: `{ resend, loading, error }`

#### useForgotPassword

**File**: `useAuth.ts`  
**Purpose**: Request password reset  
**Returns**: `{ sendResetEmail, loading, error }`

#### useResetPassword

**File**: `useAuth.ts`  
**Purpose**: Reset password with token  
**Returns**: `{ resetPassword, loading, error }`

#### useAuth

**File**: `useAuth.ts`  
**Purpose**: Access authentication state  
**Returns**: `{ user, loading, logout }`

#### useGoogleLogin

**File**: `useAuth.ts`  
**Purpose**: Sign in with Google OAuth popup (Firebase client SDK)  
**Parameters**: `(options?: { onSuccess?: () => void; onError?: (error: any) => void })`  
**Returns**: `{ mutate, loading, error }` — `mutate()` triggers the Google popup

**Example**:

```tsx
import { useGoogleLogin } from "@/hooks";
const { mutate: loginWithGoogle, loading } = useGoogleLogin({
  onSuccess: () => router.push(ROUTES.HOME),
});
<Button onClick={() => loginWithGoogle()} loading={loading}>
  Sign in with Google
</Button>;
```

#### useAppleLogin

**File**: `useAuth.ts`  
**Purpose**: Sign in with Apple OAuth popup (Firebase client SDK)  
**Parameters**: `(options?: { onSuccess?: () => void; onError?: (error: any) => void })`  
**Returns**: `{ mutate, loading, error }` — `mutate()` triggers the Apple popup

**Example**:

```tsx
import { useAppleLogin } from "@/hooks";
const { mutate: loginWithApple, loading } = useAppleLogin({
  onSuccess: () => router.push(ROUTES.HOME),
});
<Button onClick={() => loginWithApple()} loading={loading}>
  Sign in with Apple
</Button>;
```

---

### API Hooks

#### useApiQuery

**File**: `useApiQuery.ts`  
**Purpose**: Fetch data from API with caching  
**Parameters**: `(endpoint, options)`  
**Returns**: `{ data, loading, error, refetch }`

#### useApiMutation

**File**: `useApiMutation.ts`  
**Purpose**: Mutate data via API (POST, PUT, DELETE)  
**Parameters**: `(endpoint, options)`  
**Returns**: `{ mutate, loading, error, success }`

---

### Profile Hooks

#### useProfile

**File**: `useProfile.ts`  
**Purpose**: Manage user profile  
**Returns**: `{ profile, updateProfile, updateAvatar, loading, error }`

#### useAddresses

**File**: `useAddresses.ts`  
**Purpose**: Fetch the list of the current user's addresses  
**Returns**: `{ data: Address[], loading, error, refetch }` — wraps `addressService.list()` with `useApiQuery`

#### useAddress

**File**: `useAddresses.ts`  
**Purpose**: Fetch a single address by ID  
**Parameters**: `(id: string, options?: { enabled?: boolean })`  
**Returns**: `{ data: Address, loading, error }` — enabled only when `id` is non-empty

**Example**:

```tsx
import { useAddress } from "@/hooks";
const { data: address, loading } = useAddress(addressId);
```

#### useCreateAddress

**File**: `useAddresses.ts`  
**Purpose**: Create a new address  
**Parameters**: `(options?: { onSuccess?: (address: Address) => void; onError?: (error: any) => void })`  
**Returns**: `{ mutate, loading, error }` — `mutate(AddressFormData)` posts to `/api/user/addresses`

#### useUpdateAddress

**File**: `useAddresses.ts`  
**Purpose**: Update an existing address by ID  
**Parameters**: `(id: string, options?: { onSuccess?: (address: Address) => void; onError?: (error: any) => void })`  
**Returns**: `{ mutate, loading, error }` — `mutate(AddressFormData)` patches to `/api/user/addresses/{id}`

#### useDeleteAddress

**File**: `useAddresses.ts`  
**Purpose**: Delete an address by ID  
**Parameters**: `(options?: { onSuccess?: () => void; onError?: (error: any) => void })`  
**Returns**: `{ mutate, loading, error }` — `mutate({ id })` deletes the specified address

#### useSetDefaultAddress

**File**: `useAddresses.ts`  
**Purpose**: Mark an address as the default shipping/billing address  
**Returns**: `{ mutate, loading, error }` — `mutate({ addressId })` posts to `/api/user/addresses/{id}/default`

---

### Session Management Hooks

#### useAdminSessions

**File**: `useSessions.ts`  
**Purpose**: Admin view of all active sessions  
**Returns**: `{ sessions, loading, error }`

#### useUserSessions

**File**: `useSessions.ts`  
**Purpose**: View sessions for specific user  
**Parameters**: `(userId)`  
**Returns**: `{ sessions, loading, error }`

#### useMySessions

**File**: `useSessions.ts`  
**Purpose**: View current user's sessions  
**Returns**: `{ sessions, loading, error }`

#### useRevokeSession

**File**: `useSessions.ts`  
**Purpose**: Revoke a session (admin)  
**Returns**: `{ revoke, loading, error }`

#### useRevokeMySession

**File**: `useSessions.ts`  
**Purpose**: Revoke own session  
**Returns**: `{ revoke, loading, error }`

#### useRevokeUserSessions

**File**: `useSessions.ts`  
**Purpose**: Revoke all sessions for a user (admin)  
**Returns**: `{ revokeAll, loading, error }`

---

### RBAC (Role-Based Access Control) Hooks

#### useHasRole

**File**: `useRBAC.ts`  
**Purpose**: Check if user has specific role(s) with hierarchy support  
**Parameters**: `(role: UserRole | UserRole[])`  
**Returns**: `boolean`

#### useIsAdmin

**File**: `useRBAC.ts`  
**Purpose**: Check if current user is admin  
**Returns**: `boolean`

#### useIsModerator

**File**: `useRBAC.ts`  
**Purpose**: Check if current user is moderator or admin  
**Returns**: `boolean`

#### useIsSeller

**File**: `useRBAC.ts`  
**Purpose**: Check if current user is seller or above  
**Returns**: `boolean`

#### useCanAccess

**File**: `useRBAC.ts`  
**Purpose**: Check if user can access a specific route  
**Parameters**: `(path: string)`  
**Returns**: `{ allowed: boolean, reason?: string, redirectTo?: string }`

#### useRoleChecks

**File**: `useRBAC.ts`  
**Purpose**: Get comprehensive role-specific data in one object  
**Returns**: `{ isAuthenticated, isAdmin, isModerator, isSeller, isUser, role, hasRole(role) }`

#### useIsOwner

**File**: `useRBAC.ts`  
**Purpose**: Check if user owns a resource (admins always return true)  
**Parameters**: `(resourceOwnerId: string | null | undefined)`  
**Returns**: `boolean`

#### useRequireAuth

**File**: `useRBAC.ts`  
**Purpose**: Enforce authentication, throws error if not authenticated  
**Returns**: `{ user: NonNullable<User>, loading: boolean }`  
**Throws**: Error if not authenticated

#### useRequireRole

**File**: `useRBAC.ts`  
**Purpose**: Enforce specific role, throws error if insufficient permissions  
**Parameters**: `(role: UserRole | UserRole[])`  
**Returns**: `{ user: NonNullable<User>, loading: boolean }`  
**Throws**: Error if insufficient permissions

---

### Responsive/Viewport Hooks

#### useBreakpoint

**File**: `useBreakpoint.ts`  
**Purpose**: Detect Tailwind breakpoints (mobile <768, tablet 768–1023, desktop ≥1024)  
**Returns**: `{ isMobile: boolean, isTablet: boolean, isDesktop: boolean, breakpoint: "mobile" | "tablet" | "desktop" }`

#### useMediaQuery

**File**: `useMediaQuery.ts`  
**Purpose**: Match a CSS media query string and listen for changes  
**Parameters**: `(query: string)`  
**Returns**: `boolean`

---

### Admin Hooks

#### useAdminStats

**File**: `useAdminStats.ts`  
**Purpose**: Fetch admin dashboard statistics  
**Returns**: `{ stats, loading, error, refresh }`

---

### Form Hooks

#### useForm

**File**: `useForm.ts`  
**Purpose**: Form state management with validation  
**Parameters**: `(initialValues, validationSchema)`  
**Returns**: `{ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, resetForm }`

#### useAddressForm

**File**: `useAddressForm.ts`  
**Purpose**: Manage address form state with validation  
**Parameters**: `(initialData?: Partial<AddressFormData>)`  
**Returns**: `{ formData, errors, handleChange, validate, reset, setFormData }`

**Example**:

```typescript
import { useAddressForm } from "@/hooks";

const { formData, errors, handleChange, validate } = useAddressForm();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  // ... save logic
};
```

---

### Gesture Hooks

#### useSwipe

**File**: `useSwipe.ts`  
**Purpose**: Detect swipe gestures  
**Parameters**: `(ref, callbacks, options)`  
**Returns**: `{ isSwiping, direction }`

**Options**: `threshold`, `restrictToAxis`, `swipeDirections`

#### useGesture

**File**: `useGesture.ts`  
**Purpose**: Detect multiple gesture types  
**Parameters**: `(ref, handlers, options)`  
**Returns**: `{ activeGesture }`

**Gesture Types**: `tap`, `doubleTap`, `longPress`, `swipe`, `pinch`

#### useLongPress

**File**: `useLongPress.ts`  
**Purpose**: Fire a callback after pointer is held for a configurable duration; does NOT fire on quick tap  
**Parameters**: `(callback, options)`  
**Options**: `delay` (ms, default 500), `moveThreshold` (px, default 10)  
**Returns**: `{ onPointerDown, onPointerUp, onPointerLeave }`

#### usePullToRefresh

**File**: `usePullToRefresh.ts`  
**Purpose**: Detect downward overscroll pull gesture and trigger a refresh callback  
**Parameters**: `(onRefresh, options)`  
**Options**: `threshold` (px, default 80), `resistance` (default 2.5)  
**Returns**: `{ isPulling, pullDistance, isRefreshing }`

---

### URL Table State Hook

#### useUrlTable

**File**: `useUrlTable.ts`  
**Purpose**: Manage all list/table state (filters, sort, pagination) via URL query params — bookmark-safe, shareable, history-friendly. Replaces local `useState` for any page that filters or paginates.  
**Parameters**: `(options?)` — `{ defaults?: Record<string, string> }`  
**Returns**: See methods below

```typescript
import { useUrlTable } from '@/hooks';

const table = useUrlTable({ defaults: { pageSize: '25', sort: '-createdAt' } });

// Read
table.get('status')           // string | ''
table.getNumber('page', 1)    // number with fallback

// Write (all trigger router.replace — no history spam)
table.set('status', 'active') // also resets page → 1
table.setPage(3)               // only changes page param
table.setSort('-price')        // resets page → 1
table.setMany({ status: 'active', role: 'seller' }) // single navigation

// Build API query strings
table.buildSieveParams('status==published')
// → ?filters=status==published&sorts=-createdAt&page=1&pageSize=25

table.buildSearchParams()
// → ?q=...&category=...&sort=...&page=...&pageSize=...

// Misc
table.params          // URLSearchParams — use .toString() as queryKey
table.clear(keys?)    // remove one/all params
```

**Rules:**

- Always include `table.params.toString()` in the `useApiQuery` `queryKey` so filters bust the cache.
- Filter/sort changes always reset page to 1 — this is automatic inside `set()` / `setMany()`.
- Never use `router.push()` for filter changes — `useUrlTable` uses `router.replace()` internally.

---

#### useClickOutside

**File**: `useClickOutside.ts`  
**Purpose**: Detect clicks outside element  
**Parameters**: `(ref, callback, options)`

#### useKeyPress

**File**: `useKeyPress.ts`  
**Purpose**: Detect keyboard shortcuts  
**Parameters**: `(targetKey, callback, options)`

**Options**: `ctrl`, `alt`, `shift`, `meta`, `preventDefault`

---

### Media Upload Hook

#### useMediaUpload

**File**: `useMediaUpload.ts`  
**Purpose**: Upload a file to the backend `/api/media/upload` route (Firebase Storage via Admin SDK). Used internally by `ImageUpload` and `AvatarUpload` components — prefer those components over calling this hook directly.  
**Returns**: `{ mutate, loading, error }` — `mutate(FormData)` where `FormData` has a `file` field and an optional `metadata` JSON string.

**Example** (direct use):

```tsx
import { useMediaUpload } from "@/hooks";
const { mutate: upload, loading } = useMediaUpload();
// Inside a submit handler:
const form = new FormData();
form.append("file", stagedFile);
await upload(form);
```

> **Important**: Never call this hook to upload files eagerly on change. Stage the file locally, then upload on form submit. See Rule 11 for the canonical three-phase upload flow.

---

### Message Hook

#### useMessage

**File**: `useMessage.ts`  
**Purpose**: Display toast notifications  
**Returns**: `{ showMessage, showSuccess, showError, showInfo, showWarning }`

---

### Unsaved Changes Hook

#### useUnsavedChanges

**File**: `useUnsavedChanges.ts`  
**Purpose**: Warn users about unsaved changes  
**Parameters**: `(hasChanges, options)`  
**Returns**: `{ showWarning, confirmNavigation }`

**Options**: `message`, `enablePrompt`

---

### FAQ Data — Static (No API)

FAQs are **static** — no API calls, no Firestore queries. All 102 FAQs live in `src/constants/faq-data.ts` and are accessed via helper functions exported from `@/constants`.

| Helper                       | Signature                                                     | Purpose                                                  |
| ---------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| `getStaticFaqsByCategory`    | `(category: FAQCategoryKey, limit?: number): StaticFAQItem[]` | Returns up to `limit` FAQs for a category (default: all) |
| `getAllStaticFaqs`           | `(limit?: number): StaticFAQItem[]`                           | Returns all FAQs, optionally capped                      |
| `getStaticFaqCategoryCounts` | `(): Record<FAQCategoryKey, number>`                          | Count of FAQs in each category                           |

**`StaticFAQItem` type**: `{ id, question, answer: string, category: FAQCategoryKey, tags: string[], isPinned: boolean, priority: number, order: number, stats: { views, helpful, notHelpful } }`

**FAQ categories**: `general`(20), `shipping`(15), `returns`(12), `payment`(18), `account`(10), `products`(15), `sellers`(12)

**Homepage** (`FAQSection`) shows 10 per active category with a "View All →" button showing the remaining count badge.  
**FAQ page** (`FAQPageContent`) loads all 102 and filters client-side with search + category tabs.

**Example**:

```tsx
import {
  getStaticFaqsByCategory,
  getStaticFaqCategoryCounts,
} from "@/constants";
import type { StaticFAQItem } from "@/constants";
const faqs: StaticFAQItem[] = getStaticFaqsByCategory("shipping", 10);
```

---

### Category Hooks

#### useCategories

**File**: `useCategorySelector.ts`  
**Purpose**: Query-only hook that fetches the full active category list. Used by `CategorySelectorCreate` for display and selection. Also reusable in any component that needs a flat categories array.  
**Returns**: `{ categories: CategoryDocument[], isLoading, refetch }`

**Example**:

```tsx
import { useCategories } from "@/hooks";
const { categories, isLoading } = useCategories();
```

#### useCreateCategory

**File**: `useCategorySelector.ts`  
**Purpose**: Mutation-only hook that creates a new category. Used by the inner `CreateCategoryContent` sub-component within `CategorySelectorCreate`.  
**Parameters**: `(options?: { onSuccess?: (res: { id?: string }) => void; onError?: (err: Error) => void })`  
**Returns**: `{ mutate, loading, error }` — `mutate(categoryData)` posts to `/api/admin/categories`

**Example**:

```tsx
import { useCreateCategory } from "@/hooks";
const { mutate: create, loading } = useCreateCategory({
  onSuccess: () => refetch(),
});
await create({ name: "Electronics", slug: "electronics", tier: 1 });
```

---

#### useLogout

**File**: `useLogout.ts`
**Purpose**: Mutation hook that calls the backend logout endpoint, clears the session cookie, and revokes tokens. Use instead of any direct auth sign-out call.
**Parameters**: `(options?: { onSuccess?: () => void; onError?: (err: Error) => void })`
**Returns**: `{ mutateAsync: logout, isLoading, error }`

**Example**:

```tsx
import { useLogout } from "@/hooks";
const { mutateAsync: logout, isLoading } = useLogout({
  onSuccess: () => router.push(ROUTES.AUTH.LOGIN),
});
await logout();
```

---

#### useBecomeSeller

**File**: `useBecomeSeller.ts`
**Purpose**: Mutation hook that submits a seller application for the authenticated user. On success the server sets `role='seller'` and `storeStatus='pending'` on the user document; admin must approve before the store goes live.
**Parameters**: `(options?: { onSuccess?: () => void; onError?: (err: Error) => void })`
**Returns**: `{ mutate: applyAsSeller, isLoading, error }`

**Example**:

```tsx
import { useBecomeSeller } from "@/hooks";
const { mutate: applyAsSeller, isLoading } = useBecomeSeller();
applyAsSeller({ storeName: "My Store", category: "electronics" });
```

---

#### useNewsletter

**File**: `useNewsletter.ts`
**Purpose**: Mutation hook for newsletter subscription. Wraps `newsletterService.subscribe()` — used in footers, homepage popups, and checkout opt-in banners.
**Parameters**: None (mutation data passed to `mutate`)
**Returns**: `{ mutate, isLoading, error }` — `mutate({ email, source? })`

**Example**:

```tsx
import { useNewsletter } from "@/hooks";
const { mutate: subscribe, isLoading } = useNewsletter();
subscribe({ email: "user@example.com", source: "footer" });
```

---

#### useRipCoinBalance / usePurchaseRipCoins / useVerifyRipCoinPurchase / useRipCoinHistory

**File**: `useRipCoins.ts`
**Purpose**: Four focused hooks that together cover the full RipCoins wallet lifecycle.

| Hook                         | Returns                            | Notes                                                  |
| ---------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `useRipCoinBalance()`        | `{ data: { balance }, isLoading }` | Query — cached wallet balance                          |
| `usePurchaseRipCoins()`      | `{ mutate, isLoading }`            | Mutation — initiates Razorpay order for coin packs     |
| `useVerifyRipCoinPurchase()` | `{ mutate, isLoading }`            | Mutation — verifies Razorpay payment and credits coins |
| `useRipCoinHistory(params?)` | `{ data, isLoading }`              | Query — paginated purchase history                     |

**Example**:

```tsx
import { useRipCoinBalance, usePurchaseRipCoins } from "@/hooks";
const { data } = useRipCoinBalance();
const { mutate: purchase } = usePurchaseRipCoins();
purchase(2); // buy 2 packs
```

---

#### useChat

**File**: `useChat.ts`
**Purpose**: Manages buyer–seller real-time chat. Authenticates a secondary Firebase app instance with a server-issued custom token, subscribes read-only to Realtime DB, and exposes `sendMessage` (writes via API route — never directly to Realtime DB).
**Parameters**: `(chatId: string | null)`
**Returns**: `{ messages: ChatMessage[], sendMessage, isConnected, isLoading, error }`

**Example**:

```tsx
import { useChat } from "@/hooks";
const { messages, sendMessage, isConnected } = useChat(chatId);
await sendMessage("Hello, is this still available?");
```

---

- `calculatePasswordStrength(password: string): PasswordStrength` - Calculate strength score
- `isCommonPassword(password: string): boolean` - Check against common passwords

**Interfaces**:

- `PasswordStrength` - Strength score and label
- `PasswordRequirements` - Customizable requirements

#### Phone Validators (`phone.validator.ts`)

- `isValidPhone(phone: string): boolean` - Validate phone format
- `normalizePhone(phone: string): string` - Remove formatting
- `formatPhone(phone: string, countryCode?: string): string` - Format phone number
- `extractCountryCode(phone: string): string | null` - Extract country code
- `isValidIndianMobile(phone: string): boolean` - Validate Indian mobile (10 digits, starts with 6-9)
- `isValidIndianPincode(pincode: string): boolean` - Validate Indian pincode (6 digits)

#### URL Validators (`url.validator.ts`)

- `isValidUrl(url: string): boolean` - Validate URL format
- `isValidUrlWithProtocol(url: string, protocols?: string[]): boolean` - Check protocol
- `isExternalUrl(url: string, currentDomain?: string): boolean` - Check if external
- `sanitizeUrl(url: string): string` - Sanitize URL for XSS

#### Input Validators (`input.validator.ts`)

- `isRequired(value: any): boolean` - Check if value exists
- `minLength(value: string, min: number): boolean` - Minimum length check
- `maxLength(value: string, max: number): boolean` - Maximum length check
- `exactLength(value: string, length: number): boolean` - Exact length check
- `isNumeric(value: string): boolean` - Numeric-only check
- `isAlphabetic(value: string): boolean` - Alphabetic-only check
- `isAlphanumeric(value: string): boolean` - Alphanumeric check
- `inRange(value: number, min: number, max: number): boolean` - Number range check
- `matchesPattern(value: string, pattern: RegExp): boolean` - Regex pattern match
- `isInList<T>(value: T, list: T[]): boolean` - Whitelist check
- `isValidCreditCard(cardNumber: string): boolean` - Credit card validation (Luhn)
- `isValidPostalCode(postalCode: string, countryCode?: string): boolean` - Postal code validation

---

### Formatters (`src/utils/formatters/`)

#### Date Formatters (`date.formatter.ts`)

- `formatDate(date: Date | string, format?: string): string` - Format date
- `formatDateTime(date: Date | string, format?: string): string` - Format date with time
- `formatTime(date: Date | string, format?: string): string` - Format time only
- `formatRelativeTime(date: Date | string): string` - Relative time (2 hours ago)
- `formatDateRange(startDate: Date, endDate: Date): string` - Date range formatting
- `formatCustomDate(date: Date, pattern: string): string` - Custom date pattern
- `isToday(date: Date | string): boolean` - Check if date is today
- `isPast(date: Date | string): boolean` - Check if date is past
- `isFuture(date: Date | string): boolean` - Check if date is future
- `nowMs(): number` - Current UTC epoch in ms (use instead of `Date.now()`)
- `isSameMonth(a: Date | number, b: Date | number): boolean` - True when both dates share the same month+year
- `currentYear(): string` - Current 4-digit year as a string (e.g. "2026")
- `nowISO(): string` - Current instant as ISO 8601 string

#### Number Formatters (`number.formatter.ts`)

- `formatCurrency(amount: number, currency?: string, locale?: string): string` - Currency formatting
- `formatNumber(num: number, locale?: string, options?: { decimals?: number }): string` - Number with locale separators; optional fixed decimal places
- `formatPercentage(num: number, decimals?: number): string` - Percentage formatting
- `formatFileSize(bytes: number): string` - File size (KB, MB, GB)
- `formatCompactNumber(num: number): string` - Compact notation (1.2K, 3.4M)
- `formatDecimal(num: number, decimals?: number): string` - Decimal places
- `formatOrdinal(num: number): string` - Ordinal numbers (1st, 2nd, 3rd)
- `parseFormattedNumber(str: string): number` - Parse formatted number back

#### String Formatters (`string.formatter.ts`)

- `capitalize(str: string): string` - Capitalize first letter
- `capitalizeWords(str: string): string` - Capitalize all words
- `toCamelCase(str: string): string` - Convert to camelCase
- `toPascalCase(str: string): string` - Convert to PascalCase
- `toSnakeCase(str: string): string` - Convert to snake_case
- `toKebabCase(str: string): string` - Convert to kebab-case
- `truncate(str: string, length: number, suffix?: string): string` - Truncate with ellipsis
- `truncateWords(str: string, words: number, suffix?: string): string` - Truncate by word count
- `stripHtml(html: string): string` - Remove HTML tags
- `escapeHtml(str: string): string` - Escape HTML entities
- `slugify(str: string): string` - Create URL-friendly slug
- `maskString(str: string, maskChar?: string, visibleChars?: number): string` - Mask sensitive data
- `randomString(length?: number): string` - Generate random string
- `isEmptyString(str: string | null | undefined): boolean` - Check if empty
- `wordCount(str: string): number` - Count words
- `reverse(str: string): string` - Reverse string
- `proseMirrorToHtml(value: string): string` - Convert a ProseMirror / TipTap JSON document string to HTML. Passes plain HTML strings through unchanged (safe for mixed content). Supports: paragraph, text, heading, bulletList, orderedList, listItem, blockquote, codeBlock, hardBreak, horizontalRule, and marks (bold, italic, underline, strike, code, link).

---

### Converters (`src/utils/converters/`)

#### Type Converters (`type.converter.ts`)

- `stringToBoolean(value: string): boolean` - Parse boolean string
- `booleanToString(value: boolean, format?: 'yes/no' | '1/0' | 'true/false'): string` - Boolean to string
- `arrayToObject<T>(arr: T[], keyField: string): Record<string, T>` - Array to object map
- `objectToArray<T>(obj: Record<string, T>): T[]` - Object to array
- `queryStringToObject(queryString: string): Record<string, any>` - Parse query string
- `objectToQueryString(obj: Record<string, any>): string` - Object to query string
- `csvToArray(csv: string, delimiter?: string): string[][]` - Parse CSV
- `arrayToCsv(arr: string[][], delimiter?: string): string` - Array to CSV
- `firestoreTimestampToDate(timestamp: any): Date` - Firestore timestamp to Date
- `dateToISOString(date: Date | string): string` - Date to ISO string
- `deepClone<T>(obj: T): T` - Deep clone object
- `flattenObject(obj: object, separator?: string): Record<string, any>` - Flatten nested object
- `unflattenObject(obj: Record<string, any>): Record<string, any>` - Unflatten object

---

### Event Management (`src/utils/events/`)

#### Global Event Manager (`event-manager.ts`)

- `throttle<T>(fn: T, delay: number): T` - Throttle function calls
- `debounce<T>(fn: T, delay: number): T` - Debounce function calls
- `addGlobalScrollHandler(callback: Function, options?: object): string` - Add scroll listener
- `addGlobalResizeHandler(callback: Function, options?: object): string` - Add resize listener
- `addGlobalClickHandler(callback: Function, options?: object): string` - Add click listener
- `addGlobalKeyHandler(keyCombo: string, callback: Function, options?: object): string` - Add keyboard listener
- `removeGlobalHandler(id: string): void` - Remove event handler
- `isMobileDevice(): boolean` - Check if mobile device
- `hasTouchSupport(): boolean` - Check if touch supported
- `getViewportDimensions(): object` - Get viewport width/height
- `isInViewport(element: HTMLElement, offset?: number): boolean` - Check if element in viewport
- `smoothScrollTo(target: string | HTMLElement, options?: object): void` - Smooth scroll to element
- `preventBodyScroll(prevent: boolean): void` - Lock/unlock body scroll

**Instance**: `globalEventManager` - Singleton event manager

---

### ID Generators (`src/utils/id-generators.ts`)

- `generateUserId(input: GenerateUserIdInput): string` - Generate unique user ID
- `generateProductId(input: GenerateProductIdInput): string` - Generate product ID
- `generateCategoryId(input: GenerateCategoryIdInput): string` - Generate category ID
- `generateAuctionId(input: GenerateAuctionIdInput): string` - Generate auction ID
- `generateReviewId(input: GenerateReviewIdInput): string` - Generate review ID
- `generateOrderId(input: GenerateOrderIdInput): string` - Generate order ID
- `generateFAQId(input: GenerateFAQIdInput): string` - Generate FAQ ID
- `generateCouponId(code: string): string` - Generate coupon ID
- `generateCarouselId(input: GenerateCarouselIdInput): string` - Generate carousel slide ID
- `generateHomepageSectionId(input: GenerateHomepageSectionIdInput): string` - Generate section ID
- `generateBarcodeFromId(id: string): string` - Generate barcode from ID
- `generateQRCodeData(type: string, id: string): string` - Generate QR code data

---

## 5. Helpers (Business Logic)

**Location**: `src/helpers/`  
**Import**: `import { functionName } from '@/helpers'`

### Auth Helpers (`src/helpers/auth/`)

#### Authentication Helper (`auth.helper.ts`)

- `hasRole(user: UserProfile, role: UserRole): boolean` - Check user role
- `isAdmin(user: UserProfile): boolean` - Check if admin
- `isSeller(user: UserProfile): boolean` - Check if seller
- `isModerator(user: UserProfile): boolean` - Check if moderator
- `canAccessAdminPanel(user: UserProfile): boolean` - Check admin panel access
- `getRoleHierarchy(role: UserRole): number` - Get role priority level
- `isRoleHigherThan(userRole: UserRole, targetRole: UserRole): boolean` - Compare roles
- `formatUserDisplayName(user: UserProfile): string` - Get display name
- `getInitials(user: UserProfile): string` - Get user initials

#### Token Helper (`token.helper.ts`)

- `generateToken(length?: number): string` - Generate random token
- `generateSecureToken(): string` - Generate cryptographically secure token
- `hashToken(token: string): string` - Hash token for storage
- `verifyToken(token: string, hash: string): boolean` - Verify token against hash
- `isTokenExpired(expiresAt: Date): boolean` - Check token expiration
- `encodeToken(data: object): string` - Encode data to token
- `decodeToken(token: string): object | null` - Decode token to data

---

### Validation Helpers (`src/helpers/validation/`)

#### Address Validation Helper (`address.helper.ts`)

- `validateAddressForm(formData: AddressFormData): Record<string, string>` - Validate address form data

**Interface**:

```typescript
interface AddressFormData {
  fullName: string;
  phoneNumber: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  addressType: string;
  isDefault: boolean;
}
```

**Returns**: Object with field names as keys and error messages as values (empty if valid)

**Example**:

```typescript
import { validateAddressForm } from "@/helpers";

const errors = validateAddressForm(formData);
if (Object.keys(errors).length === 0) {
  // Form is valid
}
```

---

### Data Helpers (`src/helpers/data/`)

#### Array Helper (`array.helper.ts`)

- `unique<T>(arr: T[]): T[]` - Remove duplicates
- `groupBy<T>(arr: T[], key: string): Record<string, T[]>` - Group by property
- `chunk<T>(arr: T[], size: number): T[][]` - Split into chunks
- `shuffle<T>(arr: T[]): T[]` - Randomize order
- `sample<T>(arr: T[], count: number): T[]` - Get random samples
- `partition<T>(arr: T[], predicate: Function): [T[], T[]]` - Split by condition
- `flatten<T>(arr: any[]): T[]` - Flatten nested arrays
- `difference<T>(arr1: T[], arr2: T[]): T[]` - Array difference
- `intersection<T>(arr1: T[], arr2: T[]): T[]` - Array intersection
- `union<T>(...arrays: T[][]): T[]` - Array union
- `pluck<T>(arr: T[], key: string): any[]` - Extract property values
- `sortBy<T>(arr: T[], key: string, order?: SortOrder): T[]` - Sort by property

#### Object Helper (`object.helper.ts`)

- `pick<T>(obj: T, keys: string[]): Partial<T>` - Select properties
- `omit<T>(obj: T, keys: string[]): Partial<T>` - Exclude properties
- `merge<T>(...objects: Partial<T>[]): T` - Deep merge objects
- `clone<T>(obj: T): T` - Deep clone object
- `isEqual(obj1: any, obj2: any): boolean` - Deep equality check
- `has(obj: object, path: string): boolean` - Check nested property exists
- `get<T>(obj: object, path: string, defaultValue?: T): T` - Get nested property
- `set(obj: object, path: string, value: any): object` - Set nested property
- `isEmpty(obj: object): boolean` - Check if empty object
- `keys<T>(obj: T): (keyof T)[]` - Type-safe keys
- `values<T>(obj: T): T[keyof T][]` - Type-safe values

#### Pagination Helper (`pagination.helper.ts`)

- `calculatePagination(total: number, page: number, limit: number): PaginationMeta` - Calculate pagination metadata
- `getPageRange(currentPage: number, totalPages: number, maxPages?: number): number[]` - Get visible page numbers
- `hasPreviousPage(page: number): boolean` - Check if has previous
- `hasNextPage(page: number, totalPages: number): boolean` - Check if has next
- `getOffset(page: number, limit: number): number` - Calculate query offset
- `getTotalPages(total: number, limit: number): number` - Calculate total pages

#### Sorting Helper (`sorting.helper.ts`)

- `sortByDate<T>(arr: T[], key: string, order?: SortOrder): T[]` - Sort by date field
- `sortByString<T>(arr: T[], key: string, order?: SortOrder): T[]` - Sort by string field
- `sortByNumber<T>(arr: T[], key: string, order?: SortOrder): T[]` - Sort by number field
- `sortByMultiple<T>(arr: T[], sortKeys: SortKey[]): T[]` - Multi-field sort
- `createSorter<T>(key: string, order?: SortOrder): (a: T, b: T) => number` - Create comparator function

#### Sieve Helper (`sieve.helper.ts`)

- `applySieveToArray<TItem>(input: SieveArrayQueryInput<TItem>): Promise<SieveArrayQueryResult<TItem>>` - Apply Sieve-style backend filters, sorts, and pagination over in-memory collections.
- Uses `@mohasinac/sievejs` as the processing engine.

**Types**:

- `SortOrder` - "asc" | "desc"
- `SortKey` - `{ key: string, order: SortOrder }`

---

### API Helpers (`src/lib/api/`)

#### Request Helpers (`request-helpers.ts`)

- `getSearchParams(request: NextRequest): URLSearchParams` - Standardized query parameter access for route handlers.
- `getOptionalSessionCookie(request: NextRequest): string | undefined` - Read `__session` cookie without throwing.
- `getRequiredSessionCookie(request: NextRequest): string` - Read `__session` cookie and throw auth error if missing.
- `getBooleanParam(searchParams: URLSearchParams, key: string): boolean | undefined` - Parse boolean query parameters.
- `getStringParam(searchParams: URLSearchParams, key: string): string | undefined` - Parse optional string query parameters.
- `getNumberParam(searchParams: URLSearchParams, key: string, fallback: number, options?: { min?: number; max?: number }): number` - Parse bounded numeric query parameters.

---

### UI Helpers (`src/helpers/ui/`)

#### Style Helper (`style.helper.ts`)

- `classNames(...classes: any[]): string` - Combine class names (alias: `cn`)
- `mergeTailwindClasses(...classes: string[]): string` - Merge Tailwind classes (remove duplicates)
- `responsive(base: string, sm?: string, md?: string, lg?: string, xl?: string): string` - Create responsive classes
- `variant<T>(variants: Record<T, string>, active: T): string` - Get variant classes
- `toggleClass(baseClass: string, condition: boolean, trueClass: string, falseClass?: string): string` - Conditional classes
- `sizeClass(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl', type?: 'padding' | 'text' | 'icon'): string` - Get size utility classes

#### Color Helper (`color.helper.ts`)

- `hexToRgb(hex: string): { r: number, g: number, b: number } | null` - Convert hex to RGB
- `rgbToHex(r: number, g: number, b: number): string` - Convert RGB to hex
- `lightenColor(hex: string, percent: number): string` - Lighten color
- `darkenColor(hex: string, percent: number): string` - Darken color
- `randomColor(): string` - Generate random hex color
- `getContrastColor(hex: string): '#000000' | '#ffffff'` - Get contrasting text color
- `generateGradient(color1: string, color2: string, steps: number): string[]` - Generate gradient steps

#### Animation Helper (`animation.helper.ts`)

- `animate(element: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation` - Web Animations API wrapper
- `stagger(elements: HTMLElement[], animation: Function, delay: number): void` - Stagger animations
- `fadeIn(element: HTMLElement, duration?: number): Promise<void>` - Fade in animation
- `fadeOut(element: HTMLElement, duration?: number): Promise<void>` - Fade out animation
- `slide(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right', duration?: number): Promise<void>` - Slide animation
- `easings` - Easing function constants (linear, easeIn, easeOut, easeInOut, easeInBack, easeOutBack)

---

## 6. Snippets (Reusable Patterns)

**Location**: `src/snippets/`  
**Import**: `import { functionName } from '@/snippets/filename.snippet'`

### React Hooks Snippets (`react-hooks.snippet.ts`)

- `useDebounce<T>(value: T, delay?: number): T` - Debounce value changes
- `useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]` - Persistent localStorage state
- `useToggle(initialState?: boolean): [boolean, () => void, (value: boolean) => void]` - Toggle boolean state
- `usePrevious<T>(value: T): T | undefined` - Access previous value
- `useMediaQuery(query: string): boolean` - Match media query
- `useOnScreen(ref: RefObject, options?: object): boolean` - Check if element is visible
- `useInterval(callback: Function, delay: number | null): void` - Set up interval
- `useWindowSize(): { width: number, height: number }` - Track window size
- `useCopyToClipboard(): [copiedText: string | null, copy: (text: string) => Promise<void>]` - Copy to clipboard

---

### API Request Snippets (`api-requests.snippet.ts`)

- `apiRequest<T>(url: string, options?: RequestInit): Promise<T>` - Basic API request wrapper
- `retryRequest<T>(fn: Function, retries?: number, delay?: number): Promise<T>` - Retry failed requests
- `timeoutRequest<T>(promise: Promise<T>, timeout: number): Promise<T>` - Add timeout to request
- `batchRequests<T>(requests: Promise<T>[], batchSize?: number): Promise<T[]>` - Batch parallel requests
- `cacheRequest<T>(key: string, fetcher: Function, ttl?: number): Promise<T>` - Request with caching
- `abortableRequest<T>(url: string, options?: RequestInit): { promise: Promise<T>, abort: Function }` - Abortable request

---

### Form Validation Snippets (`form-validation.snippet.ts`)

- `validateField(value: any, rules: ValidationRule[]): string | null` - Validate single field
- `validateForm(values: object, schema: object): ValidationResult` - Validate entire form
- `createValidator(schema: Record<string, ValidationRule[]>): Function` - Create validation function
- `validationRules` - Pre-built validation rules
  - `required`, `email`, `minLength`, `maxLength`, `pattern`, `min`, `max`, `url`, `numeric`, `alphanumeric`

**Interfaces**:

- `ValidationRule<T>` - Validation rule structure
- `FieldValidation` - Field validation config
- `ValidationResult` - Validation result

---

### Performance Snippets (`performance.snippet.ts`)

- `memoize<T>(fn: T): T` - Memoize function results
- `lazyLoad<T>(factory: Function, fallback?: ReactNode): LazyExoticComponent<T>` - Lazy load component
- `batchUpdate(updates: Function[]): void` - Batch multiple updates
- `preloadImage(src: string): Promise<void>` - Preload image
- `calculateVisibleItems(containerHeight: number, itemHeight: number, buffer?: number): number` - Calculate visible items for virtual scrolling
- `createDebouncedScroll(callback: Function, delay?: number): Function` - Debounced scroll handler
- `shallowEqual(obj1: any, obj2: any): boolean` - Shallow equality check
- `clearStaleCache(maxAge?: number): void` - Clear expired cache entries
- `chunkGenerator<T>(array: T[], size: number): Generator<T[]>` - Yield array chunks

---

## 7. Repositories (Data Access Layer)

**Location**: `src/repositories/`  
**Import**: `import { repositoryName } from '@/repositories'`

---

### Sieve Query System (`src/lib/query/firebase-sieve.ts`)

The **Sieve** pattern provides Firestore-native filtering, sorting, and pagination via a URL-friendly DSL. Every list endpoint that accepts `filters`, `sorts`, `page`, or `pageSize` uses this system.

#### SieveModel — URL Query Parameters

```ts
interface SieveModel {
  filters?: string; // comma-separated filter expressions
  sorts?: string; // comma-separated sort fields (prefix - = descending)
  page?: string; // 1-based page number (default: "1")
  pageSize?: string; // records per page (default: "25", max: "100")
}
```

All four parameters come directly from URL query params (managed by `useUrlTable` on the client):

```
GET /api/products?filters=status==published,category==electronics&sorts=-createdAt&page=2&pageSize=25
```

#### Filter Operators

| Operator | Meaning                | Example             |
| -------- | ---------------------- | ------------------- |
| `==`     | equals                 | `status==published` |
| `!=`     | not equals             | `status!=draft`     |
| `>`      | greater than           | `price>1000`        |
| `<`      | less than              | `price<5000`        |
| `>=`     | greater than or equal  | `price>=500`        |
| `<=`     | less than or equal     | `price<=2000`       |
| `@=`     | array-contains (exact) | `tags@=electronics` |
| `_=`     | starts-with (string)   | `title_=Shoe`       |

Multiple filters use comma separation (AND logic):

```
filters=status==published,category==footwear,price>=500
```

#### Sort Syntax

```
sorts=-createdAt           // createdAt descending
sorts=price                // price ascending
sorts=-createdAt,title     // createdAt desc, title asc
```

#### FirebaseSieveResult — Paginated Response Shape

```ts
interface FirebaseSieveResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}
```

#### Defining `SIEVE_FIELDS` in a Repository

Every repository that supports `list()` declares which fields are filterable and sortable:

```ts
import type { FirebaseSieveFields } from '@/lib/query/firebase-sieve';

static readonly SIEVE_FIELDS: FirebaseSieveFields = {
  title:     { canFilter: true, canSort: true },
  price:     { canFilter: true, canSort: true },
  status:    { canFilter: true, canSort: false },
  createdAt: { canFilter: true, canSort: true },
};
```

Then `list()` calls the inherited `sieveQuery()` method:

```ts
async list(model: SieveModel) {
  return this.sieveQuery<ProductDocument>(model, ProductRepository.SIEVE_FIELDS);
}

// With pre-filter (scope to one seller's documents)
async listForSeller(sellerId: string, model: SieveModel) {
  return this.sieveQuery<OrderDocument>(model, OrderRepository.SIEVE_FIELDS, {
    baseQuery: this.getCollection().where('sellerId', '==', sellerId),
  });
}
```

#### Sieve-Capable Fields per Repository

| Repository                   | Filterable fields                                                                                                                                                                      | Sortable fields                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **ProductRepository**        | category, subcategory, brand, condition, status, isAuction, price, currentBid, bidCount, auctionEndDate, startingBid, featured, isPromoted, sellerId, sellerName, createdAt, updatedAt | all filterable                          |
| **OrderRepository** (seller) | status, paymentStatus, paymentMethod, totalPrice, orderDate, productTitle, userName                                                                                                    | status, totalPrice, createdAt           |
| **ReviewRepository**         | rating, status, verified, featured, helpfulCount, createdAt                                                                                                                            | rating, helpfulCount, createdAt         |
| **BlogRepository**           | category, status, isFeatured, tags, readTimeMinutes, publishedAt, createdAt                                                                                                            | publishedAt, createdAt, readTimeMinutes |
| **BidRepository**            | status, bidAmount, isWinning, createdAt                                                                                                                                                | bidAmount, createdAt                    |
| **NotificationRepository**   | isRead, type, createdAt                                                                                                                                                                | createdAt                               |
| **UserRepository** (admin)   | role, disabled, emailVerified, storeStatus, createdAt                                                                                                                                  | createdAt, displayName                  |

#### API Route — Standard GET List Pattern

```ts
import type { SieveModel } from "@/lib/query/firebase-sieve";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const model: SieveModel = {
    filters: searchParams.get("filters") ?? undefined,
    sorts: searchParams.get("sorts") ?? "-createdAt",
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "25",
  };

  // Merge named params into filters string
  const filtersArr: string[] = [];
  const status = searchParams.get("status");
  if (status) filtersArr.push(`status==${status}`);
  if (model.filters) filtersArr.push(model.filters);
  model.filters = filtersArr.join(",") || undefined;

  const result = await productRepository.list(model);
  return successResponse(result);
}
```

#### Client — `useUrlTable` + Service Call

```ts
const table = useUrlTable({
  defaults: { pageSize: "25", sorts: "-createdAt" },
});

const queryParams = useMemo(() => {
  const p = new URLSearchParams({
    page: String(table.getNumber("page", 1)),
    pageSize: String(table.getNumber("pageSize", 25)),
    sorts: table.get("sorts") || "-createdAt",
  });
  const status = table.get("status");
  if (status) p.set("filters", `status==${status}`);
  return p.toString();
}, [table]);

const { data } = useApiQuery({
  queryKey: ["products", queryParams],
  queryFn: () => productService.list(queryParams),
});
```

#### Important: `sieveQuery` vs `applySieveToArray`

|                 | `sieveQuery()` (repository method)   | `applySieveToArray()` (helper)    |
| --------------- | ------------------------------------ | --------------------------------- |
| **Where**       | Repository `list()` methods          | Legacy/in-memory fallback only    |
| **How**         | Firestore-native queries + count     | Loads full collection into memory |
| **Scalability** | O(pageSize) reads regardless of size | O(N) — reads entire collection    |
| **New code**    | ✅ Always use this                   | ❌ Never for new collection lists |

---

### BaseRepository

**File**: `base.repository.ts`  
**Purpose**: Abstract base class for all repositories

**Methods**:

- `findById(id: string): Promise<T | null>` - Find document by ID
- `findAll(limit?: number): Promise<T[]>` - Get all documents
- `findByField(field: string, value: any): Promise<T[]>` - Query by field
- `create(data: Partial<T>): Promise<T>` - Create document
- `update(id: string, data: Partial<T>): Promise<T>` - Update document
- `delete(id: string): Promise<void>` - Delete document
- `exists(id: string): Promise<boolean>` - Check if document exists
- `count(conditions?: object): Promise<number>` - Count documents

---

### UserRepository

**File**: `user.repository.ts`  
**Instance**: `userRepository`  
**Collection**: `users`

**Methods**:

- `findByEmail(email: string): Promise<UserDocument | null>`
- `findByPhone(phone: string): Promise<UserDocument | null>`
- `findByRole(role: UserRole): Promise<UserDocument[]>`
- `isEmailRegistered(email: string): Promise<boolean>`
- `isPhoneRegistered(phone: string): Promise<boolean>`
- `updateProfile(uid: string, data: Partial<UserDocument>): Promise<UserDocument>`
- `updateAvatar(uid: string, photoURL: string): Promise<void>`
- `disableUser(uid: string): Promise<void>`
- `enableUser(uid: string): Promise<void>`
- `getPublicProfile(uid: string): Promise<Partial<UserDocument> | null>`
- `updateLastLogin(uid: string): Promise<void>`

---

### TokenRepository

**File**: `token.repository.ts`  
**Instance**: `tokenRepository` (contains both sub-repositories)

**Sub-Repositories**:

- `emailVerificationTokenRepository` - Email verification tokens
- `passwordResetTokenRepository` - Password reset tokens

**Methods** (both):

- `create(data: TokenData): Promise<TokenDocument>`
- `findByToken(token: string): Promise<TokenDocument | null>`
- `findByUserId(userId: string): Promise<TokenDocument | null>`
- `markAsUsed(id: string): Promise<void>`
- `deleteByUserId(userId: string): Promise<void>`
- `deleteExpiredTokens(): Promise<number>`
- `isTokenValid(token: string): Promise<boolean>`

---

### ProductRepository

**File**: `product.repository.ts`  
**Instance**: `productRepository`  
**Collection**: `products`

**Methods**:

- `findBySeller(sellerId: string, limit?: number): Promise<ProductDocument[]>`
- `findByCategory(categoryId: string, limit?: number): Promise<ProductDocument[]>`
- `findByStatus(status: string, limit?: number): Promise<ProductDocument[]>`
- `search(query: string, filters?: object): Promise<ProductDocument[]>`
- `updateStock(productId: string, quantity: number): Promise<void>`
- `incrementViews(productId: string): Promise<void>`
- `getStats(productId: string): Promise<ProductStats>`
- `getFeaturedProducts(limit?: number): Promise<ProductDocument[]>`

---

### OrderRepository

**File**: `order.repository.ts`  
**Instance**: `orderRepository`  
**Collection**: `orders`

**Methods**:

- `findByUser(userId: string, limit?: number): Promise<OrderDocument[]>`
- `findBySeller(sellerId: string, limit?: number): Promise<OrderDocument[]>`
- `findByStatus(status: string, limit?: number): Promise<OrderDocument[]>`
- `updateStatus(orderId: string, status: string): Promise<void>`
- `getOrderTotal(orderId: string): Promise<number>`
- `getUserOrderCount(userId: string): Promise<number>`
- `getRecentOrders(limit?: number): Promise<OrderDocument[]>`

---

### ReviewRepository

**File**: `review.repository.ts`  
**Instance**: `reviewRepository`  
**Collection**: `reviews`

**Methods**:

- `findByProduct(productId: string, limit?: number): Promise<ReviewDocument[]>`
- `findByUser(userId: string, limit?: number): Promise<ReviewDocument[]>`
- `getAverageRating(productId: string): Promise<number>`
- `getTotalReviews(productId: string): Promise<number>`
- `hasUserReviewed(productId: string, userId: string): Promise<boolean>`
- `upvoteReview(reviewId: string, userId: string): Promise<void>`
- `downvoteReview(reviewId: string, userId: string): Promise<void>`

---

### SessionRepository

**File**: `session.repository.ts`  
**Instance**: `sessionRepository`  
**Collection**: `sessions`

**Methods**:

- `findByUser(userId: string): Promise<SessionDocument[]>`
- `findActiveByUser(userId: string): Promise<SessionDocument[]>`
- `findByToken(token: string): Promise<SessionDocument | null>`
- `revokeSession(sessionId: string): Promise<void>`
- `revokeAllUserSessions(userId: string): Promise<number>`
- `revokeOtherSessions(userId: string, currentSessionId: string): Promise<number>`
- `cleanupExpiredSessions(): Promise<number>`
- `updateLastActivity(sessionId: string): Promise<void>`
- `getActiveSessions(limit?: number): Promise<SessionDocument[]>`

---

### SiteSettingsRepository

**File**: `site-settings.repository.ts`  
**Instance**: `siteSettingsRepository`  
**Collection**: `siteSettings`

**Methods**:

- `getSettings(): Promise<SiteSettingsDocument>`
- `updateSettings(data: Partial<SiteSettingsDocument>): Promise<SiteSettingsDocument>`
- `getSetting(key: string): Promise<any>`
- `setSetting(key: string, value: any): Promise<void>`
- `resetToDefaults(): Promise<SiteSettingsDocument>`

---

### CarouselRepository

**File**: `carousel.repository.ts`  
**Instance**: `carouselRepository`  
**Collection**: `carouselSlides`

**Methods**:

- `findAll(includeInactive?: boolean): Promise<CarouselSlideDocument[]>`
- `findActive(): Promise<CarouselSlideDocument[]>`
- `reorderSlides(slideIds: string[]): Promise<void>`
- `setActiveStatus(slideId: string, isActive: boolean): Promise<void>`
- `getMaxOrder(): Promise<number>`

---

### HomepageSectionsRepository

**File**: `homepage-sections.repository.ts`  
**Instance**: `homepageSectionsRepository`  
**Collection**: `homepageSections`

**Methods**:

- `findAll(includeInactive?: boolean): Promise<HomepageSectionDocument[]>`
- `findActive(): Promise<HomepageSectionDocument[]>`
- `reorderSections(sectionIds: string[]): Promise<void>`
- `setActiveStatus(sectionId: string, isActive: boolean): Promise<void>`
- `getMaxOrder(): Promise<number>`

---

### CategoriesRepository

**File**: `categories.repository.ts`  
**Instance**: `categoriesRepository`  
**Collection**: `categories`

**Methods**:

- `findByParent(parentId: string | null): Promise<CategoryDocument[]>`
- `findActive(): Promise<CategoryDocument[]>`
- `buildCategoryTree(): Promise<CategoryDocument[]>`
- `getCategoryPath(categoryId: string): Promise<CategoryDocument[]>`
- `hasChildren(categoryId: string): Promise<boolean>`
- `getProductCount(categoryId: string): Promise<number>`

---

### CouponsRepository

**File**: `coupons.repository.ts`  
**Instance**: `couponsRepository`  
**Collection**: `coupons`

**Methods**:

- `findByCode(code: string): Promise<CouponDocument | null>`
- `findActive(): Promise<CouponDocument[]>`
- `isValid(code: string, userId?: string): Promise<boolean>`
- `useCoupon(code: string, userId: string, orderId: string): Promise<void>`
- `getUserCoupons(userId: string): Promise<CouponDocument[]>`
- `incrementUsage(couponId: string): Promise<void>`
- `getUsageCount(couponId: string): Promise<number>`

---

### FAQsRepository

**File**: `faqs.repository.ts`  
**Instance**: `faqsRepository`  
**Collection**: `faqs`

**Methods**:

- `findByCategory(category: string): Promise<FAQDocument[]>`
- `findFeatured(): Promise<FAQDocument[]>`
- `search(query: string): Promise<FAQDocument[]>`
- `upvote(faqId: string, userId: string): Promise<void>`
- `downvote(faqId: string, userId: string): Promise<void>`
- `incrementViews(faqId: string): Promise<void>`
- `reorder(faqIds: string[]): Promise<void>`

---

### AddressRepository

**File**: `address.repository.ts`
**Instance**: `addressRepository`
**Collection**: `users/{userId}/addresses` (subcollection)

**Methods**:

- `findByUser(userId: string): Promise<AddressDocument[]>`
- `findById(userId: string, addressId: string): Promise<AddressDocument | null>`
- `create(userId: string, data: AddressCreateInput): Promise<AddressDocument>`
- `update(userId: string, addressId: string, data: AddressUpdateInput): Promise<AddressDocument>`
- `delete(userId: string, addressId: string): Promise<void>`
- `setDefault(userId: string, addressId: string): Promise<void>`

---

### BlogRepository

**File**: `blog.repository.ts`
**Instance**: `blogRepository`
**Collection**: `blogPosts`

**Methods**:

- `findBySlug(slug: string): Promise<BlogPostDocument | null>`
- `findByCategory(category: BlogPostCategory, limit?: number): Promise<BlogPostDocument[]>`
- `findByAuthor(authorId: string, limit?: number): Promise<BlogPostDocument[]>`
- `findByStatus(status: BlogPostStatus): Promise<BlogPostDocument[]>`
- `findPublished(limit?: number): Promise<BlogPostDocument[]>`
- `incrementViews(postId: string): Promise<void>`
- `list(model: SieveModel): Promise<FirebaseSieveResult<BlogPostDocument>>`

---

### CartRepository

**File**: `cart.repository.ts`
**Instance**: `cartRepository`
**Collection**: `carts`

**Methods**:

- `findByUserId(userId: string): Promise<CartDocument | null>`
- `getOrCreate(userId: string): Promise<CartDocument>`
- `addItem(userId: string, item: AddToCartInput): Promise<CartDocument>`
- `updateItem(userId: string, itemId: string, data: UpdateCartItemInput): Promise<CartDocument>`
- `removeItem(userId: string, itemId: string): Promise<CartDocument>`
- `clearCart(userId: string): Promise<void>`
- `getItemCount(userId: string): Promise<number>`

---

### WishlistRepository

**File**: `wishlist.repository.ts`
**Instance**: `wishlistRepository`
**Collection**: `wishlists` (document ID = userId)

**Methods**:

- `findByUser(userId: string): Promise<WishlistDocument | null>`
- `addProduct(userId: string, productId: string): Promise<void>`
- `removeProduct(userId: string, productId: string): Promise<void>`
- `isWishlisted(userId: string, productId: string): Promise<boolean>`
- `getCount(userId: string): Promise<number>`

---

### ChatRepository

**File**: `chat.repository.ts`
**Instance**: `chatRepository`
**Collection**: `chats`

**Methods**:

- `findOrCreate(buyerId: string, sellerId: string, productId: string): Promise<ChatDocument>`
- `findByUser(userId: string): Promise<ChatDocument[]>`
- `getActiveChatIdsForUser(userId: string): Promise<string[]>`
- `markRead(chatId: string, userId: string): Promise<void>`
- `updateLastMessage(chatId: string, message: string, senderId: string): Promise<void>`

---

### EventRepository

**File**: `event.repository.ts`
**Instance**: `eventRepository`
**Collection**: `events`

**Methods**:

- `findPublished(limit?: number): Promise<EventDocument[]>`
- `findUpcoming(limit?: number): Promise<EventDocument[]>`
- `findByOrganiser(organiserId: string): Promise<EventDocument[]>`
- `findByType(type: string): Promise<EventDocument[]>`
- `list(model: SieveModel): Promise<FirebaseSieveResult<EventDocument>>`

---

### EventEntryRepository

**File**: `eventEntry.repository.ts`
**Instance**: `eventEntryRepository`
**Collection**: `eventEntries`

**Methods**:

- `findByEvent(eventId: string): Promise<EventEntryDocument[]>`
- `findByUser(userId: string): Promise<EventEntryDocument[]>`
- `findUserEntry(eventId: string, userId: string): Promise<EventEntryDocument | null>`
- `hasEntered(eventId: string, userId: string): Promise<boolean>`
- `getLeaderboard(eventId: string, limit?: number): Promise<EventEntryDocument[]>`

---

### NewsletterRepository

**File**: `newsletter.repository.ts`
**Instance**: `newsletterRepository`
**Collection**: `newsletterSubscribers`

**Methods**:

- `findByEmail(email: string): Promise<NewsletterSubscriberDocument | null>`
- `subscribe(data: NewsletterSubscriberCreateInput): Promise<NewsletterSubscriberDocument>`
- `unsubscribe(email: string): Promise<void>`
- `resubscribe(email: string): Promise<void>`
- `isSubscribed(email: string): Promise<boolean>`
- `list(model: SieveModel): Promise<FirebaseSieveResult<NewsletterSubscriberDocument>>`

---

### NotificationRepository

**File**: `notification.repository.ts`
**Instance**: `notificationRepository`
**Collection**: `notifications`

**Methods**:

- `findByUser(userId: string, unreadOnly?: boolean): Promise<NotificationDocument[]>`
- `markRead(notificationId: string): Promise<void>`
- `markAllRead(userId: string): Promise<void>`
- `getUnreadCount(userId: string): Promise<number>`
- `delete(notificationId: string): Promise<void>`

---

### PayoutRepository

**File**: `payout.repository.ts`
**Instance**: `payoutRepository`
**Collection**: `payouts`

**Methods**:

- `findBySeller(sellerId: string): Promise<PayoutDocument[]>`
- `findPending(): Promise<PayoutDocument[]>`
- `updateStatus(payoutId: string, status: string): Promise<void>`
- `list(model: SieveModel): Promise<FirebaseSieveResult<PayoutDocument>>`

---

### RipcoinRepository

**File**: `ripcoin.repository.ts`
**Instance**: `ripcoinRepository`
**Collection**: `ripcoins`

**Methods**:

- `getBalance(userId: string): Promise<number>`
- `credit(userId: string, amount: number, reason: string): Promise<void>`
- `debit(userId: string, amount: number, reason: string): Promise<void>`
- `getHistory(userId: string, params?: string): Promise<FirebaseSieveResult<RipcoinDocument>>`

---

## 8. Database Schemas

**Location**: `src/db/schema/`  
**Import**: `import { SchemaName, COLLECTION_NAME } from '@/db/schema'`

### Schema Field Constants

**File**: `field-names.ts`  
**Import**: `import { USER_FIELDS, SCHEMA_DEFAULTS, COMMON_FIELDS } from '@/db/schema'`  
**Purpose**: Centralized string constants for ALL Firestore document field names. Use these instead of hardcoded strings in queries, serializers, and update operations.

**Available constants**:

| Constant                  | Collection       | Key fields                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USER_FIELDS`             | users            | UID, EMAIL, ROLE, DISPLAY_NAME, PHONE_NUMBER, PHONE_VERIFIED, PHOTO_URL, AVATAR_METADATA, PASSWORD_HASH, EMAIL_VERIFIED, DISABLED, PUBLIC_PROFILE, STATS, METADATA, AVATAR.\*, PROFILE.\*, STAT.\*, META.\*                                                                                                                                                                                                            |
| `TOKEN_FIELDS`            | tokens           | ID, USER_ID, EMAIL, TOKEN, EXPIRES_AT, CREATED_AT, USED, USED_AT                                                                                                                                                                                                                                                                                                                                                       |
| `PRODUCT_FIELDS`          | products         | ID, TITLE, DESCRIPTION, CATEGORY, PRICE, SELLER_ID, STATUS, IMAGES, VIDEO, FEATURED, TAGS, IS_AUCTION, CONDITION, INSURANCE, INSURANCE_COST, SHIPPING_PAID_BY, RESERVE_PRICE, BUY_NOW_PRICE, MIN_BID_INCREMENT, AUTO_EXTENDABLE, AUCTION_EXTENSION_MINUTES, AUCTION_ORIGINAL_END_DATE, AUCTION_SHIPPING_PAID_BY, CONDITION_VALUES.\*, SHIPPING_PAID_BY_VALUES.\*, AUCTION_SHIPPING_PAID_BY_VALUES.\*, STATUS_VALUES.\* |
| `ORDER_FIELDS`            | orders           | ID, PRODUCT_ID, USER_ID, QUANTITY, TOTAL_PRICE, STATUS, PAYMENT_STATUS, SHIPPING_ADDRESS, STATUS_VALUES.\*, PAYMENT_STATUS_VALUES.\*                                                                                                                                                                                                                                                                                   |
| `REVIEW_FIELDS`           | reviews          | ID, PRODUCT_ID, USER_ID, RATING, TITLE, COMMENT, STATUS, HELPFUL_COUNT, VERIFIED, FEATURED, STATUS_VALUES.\*                                                                                                                                                                                                                                                                                                           |
| `BID_FIELDS`              | bids             | ID, PRODUCT_ID, USER_ID, BID_AMOUNT, STATUS, IS_WINNING, BID_DATE, STATUS_VALUES.\*                                                                                                                                                                                                                                                                                                                                    |
| `SESSION_FIELDS`          | sessions         | ID, USER_ID, DEVICE_INFO, LOCATION, IS_ACTIVE, LAST_ACTIVITY, EXPIRES_AT, REVOKED_AT, REVOKED_BY, DEVICE.\*, LOC.\*                                                                                                                                                                                                                                                                                                    |
| `CAROUSEL_FIELDS`         | carouselSlides   | ID, TITLE, ORDER, ACTIVE, MEDIA, LINK, MOBILE_MEDIA, CARDS                                                                                                                                                                                                                                                                                                                                                             |
| `CATEGORY_FIELDS`         | categories       | ID, NAME, SLUG, DESCRIPTION, ROOT_ID, PARENT_IDS, CHILDREN_IDS, TIER, PATH, ORDER, IS_LEAF, METRICS, METRIC.\*                                                                                                                                                                                                                                                                                                         |
| `COUPON_FIELDS`           | coupons          | ID, CODE, NAME, TYPE, DISCOUNT, USAGE, VALIDITY, TYPE_VALUES.\*, USAGE_FIELDS.\*, VALIDITY_FIELDS.\*                                                                                                                                                                                                                                                                                                                   |
| `FAQ_FIELDS`              | faqs             | ID, QUESTION, ANSWER, CATEGORY, ORDER, TAGS, STATS, STAT.\*, SEO_FIELDS.\*, CATEGORY_VALUES.\*                                                                                                                                                                                                                                                                                                                         |
| `HOMEPAGE_SECTION_FIELDS` | homepageSections | ID, TYPE, ORDER, ENABLED, CONFIG, TYPE_VALUES.\*                                                                                                                                                                                                                                                                                                                                                                       |
| `SITE_SETTINGS_FIELDS`    | siteSettings     | ID, SITE_NAME, MOTTO, LOGO, CONTACT, CONTACT_FIELDS.\*, SOCIAL_LINKS, EMAIL_SETTINGS, SEO, FEATURES, LEGAL_PAGES                                                                                                                                                                                                                                                                                                       |
| `COMMON_FIELDS`           | (shared)         | ID, CREATED_AT, UPDATED_AT, CREATED_BY, STATUS, IS_ACTIVE, ORDER                                                                                                                                                                                                                                                                                                                                                       |
| `SCHEMA_DEFAULTS`         | (defaults)       | USER_ROLE (`"user"`), CURRENCY (`"INR"`), UNKNOWN_USER_AGENT, UNKNOWN_USER, ANONYMOUS_USER, DEFAULT_DISPLAY_NAME, ADMIN_EMAIL                                                                                                                                                                                                                                                                                          |

**Usage**:

```tsx
import { USER_FIELDS, SCHEMA_DEFAULTS } from "@/db/schema";

// Field references in Firestore updates
await db
  .collection(USER_COLLECTION)
  .doc(uid)
  .update({
    [USER_FIELDS.META.LAST_SIGN_IN_TIME]: new Date(),
    [USER_FIELDS.META.LOGIN_COUNT]: FieldValue.increment(1),
  });

// Default values
const role = SCHEMA_DEFAULTS.USER_ROLE; // "user"
const isAdmin = email === SCHEMA_DEFAULTS.ADMIN_EMAIL;
```

---

### Users Schema

**File**: `users.ts`  
**Collection**: `users`  
**Interface**: `UserDocument`

**Fields**:

- `id` (string) - Document ID
- `uid` (string) - Firebase Auth UID
- `email` (string | null) - Email address
- `phoneNumber` (string | null) - Phone number
- `phoneVerified` (boolean) - Phone verification status
- `displayName` (string | null) - Display name
- `photoURL` (string | null) - Profile photo URL
- `avatarMetadata` (AvatarMetadata | null) - Avatar crop/position data
- `role` (UserRole) - User role (user | seller | moderator | admin)
- `passwordHash` (string) - Password hash (credentials auth only)
- `emailVerified` (boolean) - Email verification status
- `disabled` (boolean) - Account disabled status
- `publicProfile` (object) - Public profile settings
- `stats` (object) - User statistics (orders, rating, etc.)
- `metadata` (object) - Auth metadata
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

**Indexed Fields**:

- `email` - For authentication
- `phoneNumber` - For phone auth lookups
- `role` - For role-based queries
- `disabled` - For filtering active users
- `emailVerified` - For filtering verified users
- `createdAt` - For date sorting

**Relationships**:

- `users (1) → (N) products`
- `users (1) → (N) orders`
- `users (1) → (N) reviews`
- `users (1) → (N) sessions`

**Type Utilities**:

- `UserCreateInput` - For creating users
- `UserUpdateInput` - For updating profiles
- `UserAdminUpdateInput` - For admin updates

**Query Helpers**:

- `userQueryHelpers.byEmail(email)` - Query by email
- `userQueryHelpers.byRole(role)` - Query by role
- `userQueryHelpers.verified()` - Get verified users
- `userQueryHelpers.active()` - Get active users

---

### Products Schema

**File**: `products.ts`  
**Collection**: `products`  
**Interface**: `ProductDocument`

**Fields**:

- `id` (string) - Product ID
- `title` (string) - Product title
- `description` (string) - Product description
- `categoryId` (string) - Category reference
- `sellerId` (string) - Seller (user) reference
- `price` (number) - Product price
- `compareAtPrice` (number) - Original price (for discounts)
- `stock` (number) - Available quantity
- `images` (string[]) - Image URLs
- `status` (string) - Product status (draft | published | archived)
- `tags` (string[]) - Search tags
- `views` (number) - View count
- `featured` (boolean) - Featured status
- `condition` (`"new" | "used" | "refurbished" | "broken"`) - Item condition
- `insurance` (boolean) - Insurance opt-in; when enabled Shiprocket is mandatory
- `insuranceCost` (number) - Extra insurance cost added to shipping
- `shippingPaidBy` (`"seller" | "buyer"`) - Who pays shipping on regular products
- `isAuction` (boolean) - Whether this product is an auction listing
- `auctionEndDate` (Date) - When the auction closes
- `startingBid` (number) - Minimum opening bid
- `currentBid` (number) - Current highest bid
- `bidCount` (number) - Total number of bids
- `reservePrice` (number) - Hidden minimum; won't sell below this
- `buyNowPrice` (number) - Instant-purchase price bypassing bidding
- `minBidIncrement` (number) - Minimum bid increase per bid
- `autoExtendable` (boolean) - Extends auction if bid in last N minutes
- `auctionExtensionMinutes` (number) - How many minutes to extend (default 5)
- `auctionOriginalEndDate` (Date) - Tracks original end before extensions
- `auctionShippingPaidBy` (`"seller" | "winner"`) - Who pays shipping on auctions
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `sellerId`, `categoryId`, `status`, `featured`, `createdAt`

**Relationships**:

- `products (N) → (1) users` (sellerId)
- `products (N) → (1) categories` (categoryId)
- `products (1) → (N) reviews`
- `products (1) → (N) orderItems`

---

### Orders Schema

**File**: `orders.ts`  
**Collection**: `orders`  
**Interface**: `OrderDocument`

**Fields**:

- `id` (string) - Order ID
- `userId` (string) - Buyer reference
- `items` (OrderItem[]) - Order items
- `status` (string) - Order status (pending | confirmed | shipped | delivered | cancelled)
- `total` (number) - Total amount
- `subtotal` (number) - Subtotal before tax/shipping
- `tax` (number) - Tax amount
- `shipping` (number) - Shipping cost
- `shippingAddress` (Address) - Delivery address
- `paymentMethod` (string) - Payment method
- `paymentStatus` (string) - Payment status
- `trackingNumber` (string | null) - Shipping tracking number
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `userId`, `status`, `createdAt`

**Relationships**:

- `orders (N) → (1) users` (userId)
- `orders (1) → (N) orderItems` (embedded)

---

### Reviews Schema

**File**: `reviews.ts`  
**Collection**: `reviews`  
**Interface**: `ReviewDocument`

**Fields**:

- `id` (string) - Review ID
- `productId` (string) - Product reference
- `userId` (string) - Reviewer reference
- `rating` (number) - Rating (1-5)
- `comment` (string) - Review text
- `verified` (boolean) - Verified purchase
- `helpful` (number) - Helpful votes
- `reported` (boolean) - Flagged for moderation
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `productId`, `userId`, `rating`, `verified`, `createdAt`

**Relationships**:

- `reviews (N) → (1) products` (productId)
- `reviews (N) → (1) users` (userId)

---

### Sessions Schema

**File**: `sessions.ts`  
**Collection**: `sessions`  
**Interface**: `SessionDocument`

**Fields**:

- `id` (string) - Session ID
- `userId` (string) - User reference
- `token` (string) - Session token (hashed)
- `ipAddress` (string) - IP address
- `userAgent` (string) - Browser/device info
- `expiresAt` (Date) - Expiration date
- `lastActivity` (Date) - Last activity timestamp
- `revoked` (boolean) - Revoked status
- `createdAt` (Date)

**Indexed Fields**:

- `userId`, `token`, `expiresAt`, `revoked`

**Relationships**:

- `sessions (N) → (1) users` (userId)

---

### Email Verification Tokens Schema

**File**: `tokens.ts`  
**Collection**: `emailVerificationTokens`  
**Interface**: `EmailVerificationTokenDocument`

**Fields**:

- `id` (string) - Token ID
- `userId` (string) - User reference
- `email` (string) - Email to verify
- `token` (string) - Verification token (hashed)
- `expiresAt` (Date) - Expiration date
- `used` (boolean) - Used status
- `createdAt` (Date)

**Indexed Fields**:

- `userId`, `email`, `token`, `expiresAt`, `used`

---

### Password Reset Tokens Schema

**File**: `tokens.ts`  
**Collection**: `passwordResetTokens`  
**Interface**: `PasswordResetTokenDocument`

**Fields**:

- `id` (string) - Token ID
- `userId` (string) - User reference
- `email` (string) - Associated email
- `token` (string) - Reset token (hashed)
- `expiresAt` (Date) - Expiration date
- `used` (boolean) - Used status
- `createdAt` (Date)

**Indexed Fields**:

- `userId`, `email`, `token`, `expiresAt`, `used`

---

### Categories Schema

**File**: `categories.ts`  
**Collection**: `categories`  
**Interface**: `CategoryDocument`

**Fields**:

- `id` (string) - Category ID
- `name` (string) - Category name
- `slug` (string) - URL slug
- `description` (string) - Description
- `parentId` (string | null) - Parent category reference
- `level` (number) - Hierarchy level (0 = root)
- `order` (number) - Display order
- `image` (string | null) - Category image URL
- `isActive` (boolean) - Active status
- `metadata` (object) - Additional metadata
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `slug`, `parentId`, `level`, `order`, `isActive`

**Relationships**:

- `categories (1) → (N) categories` (parentId) - Self-referential hierarchy
- `categories (1) → (N) products` (categoryId)

---

### Coupons Schema

**File**: `coupons.ts`  
**Collection**: `coupons`  
**Interface**: `CouponDocument`

**Fields**:

- `id` (string) - Coupon ID
- `code` (string) - Coupon code
- `discountType` (string) - Type (percentage | fixed)
- `discountValue` (number) - Discount amount/percentage
- `minPurchase` (number) - Minimum purchase requirement
- `maxDiscount` (number | null) - Maximum discount cap
- `usageLimit` (number | null) - Max total uses
- `usageCount` (number) - Current usage count
- `userLimit` (number | null) - Max uses per user
- `validFrom` (Date) - Start date
- `validUntil` (Date) - End date
- `isActive` (boolean) - Active status
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `code`, `isActive`, `validFrom`, `validUntil`

---

### FAQs Schema

**File**: `faqs.ts`  
**Collection**: `faqs`  
**Interface**: `FAQDocument`

**Fields**:

- `id` (string) - FAQ ID
- `category` (string) - FAQ category
- `question` (string) - Question text
- `answer` (string) - Answer text
- `order` (number) - Display order
- `featured` (boolean) - Featured status
- `helpful` (number) - Helpful votes
- `notHelpful` (number) - Not helpful votes
- `views` (number) - View count
- `tags` (string[]) - Search tags
- `isActive` (boolean) - Active status
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `category`, `order`, `featured`, `isActive`

---

### Carousel Slides Schema

**File**: `carousel-slides.ts`  
**Collection**: `carouselSlides`  
**Interface**: `CarouselSlideDocument`

**Fields**:

- `id` (string) - Slide ID
- `title` (string) - Slide title
- `description` (string) - Slide description
- `imageUrl` (string) - Image URL
- `linkUrl` (string | null) - Click destination
- `linkText` (string | null) - Link button text
- `order` (number) - Display order
- `isActive` (boolean) - Active status
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `order`, `isActive`

---

### Homepage Sections Schema

**File**: `homepage-sections.ts`  
**Collection**: `homepageSections`  
**Interface**: `HomepageSectionDocument`

**Fields**:

- `id` (string) - Section ID
- `type` (string) - Section type (featured | categories | products | banner)
- `title` (string) - Section title
- `order` (number) - Display order
- `isActive` (boolean) - Active status
- `config` (object) - Section-specific configuration
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `type`, `order`, `isActive`

---

### Bids Schema

**File**: `bids.ts`  
**Collection**: `bids`  
**Interface**: `BidDocument`

**Fields**:

- `id` (string) - Bid ID
- `productId` (string) - Auction product reference
- `productTitle` (string) - Product title
- `userId` (string) - Bidder user reference
- `userName` (string) - Bidder display name
- `userEmail` (string) - Bidder email
- `bidAmount` (number) - Bid amount
- `currency` (string) - Currency code (default: INR)
- `status` (BidStatus) - active | outbid | won | lost | cancelled
- `isWinning` (boolean) - Currently highest bid
- `previousBidAmount` (number | undefined) - Previous bid by same user
- `bidDate` (Date) - When bid was placed
- `autoMaxBid` (number | undefined) - Maximum auto-bid amount
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexed Fields**:

- `productId`, `userId`, `status`, `isWinning`, `bidDate`, `createdAt`

**Relationships**:

- `users (1) → (N) bids`
- `products (1) → (N) bids` (auction items only)

**Cascade Behavior**:

- User deleted → Keep bids, anonymize userName to "Anonymous Bidder"
- Product deleted → Keep bids, mark all as "cancelled"
- Auction ends → Mark highest bid as "won", others as "lost"

**Type Utilities**:

- `BidCreateInput` - For creating bids
- `BidUpdateInput` - For updating bids (autoMaxBid only)
- `BidAdminUpdateInput` - For admin updates

**Query Helpers**:

- `bidQueryHelpers.byProduct(productId)` - Query by product
- `bidQueryHelpers.byUser(userId)` - Query by user
- `bidQueryHelpers.byStatus(status)` - Query by status
- `bidQueryHelpers.winning(productId)` - Get winning bid for product
- `bidQueryHelpers.active()` - Get all active bids

**ID Generation**:

- `createBidId({ productName, userFirstName, date })` - SEO-friendly bid ID

---

### Site Settings Schema

**File**: `site-settings.ts`  
**Collection**: `siteSettings`  
**Interface**: `SiteSettingsDocument`

**Fields**:

- `id` (string) - Document ID (typically "main")
- `siteName` (string) - Site name
- `siteDescription` (string) - Site description
- `contactEmail` (string) - Contact email
- `contactPhone` (string) - Contact phone
- `socialLinks` (object) - Social media links
- `maintenanceMode` (boolean) - Maintenance mode flag
- `allowRegistration` (boolean) - Allow new registrations
- `emailVerificationRequired` (boolean) - Require email verification
- `currency` (string) - Default currency
- `taxRate` (number) - Tax rate percentage
- `shippingFee` (number) - Default shipping fee
- `updatedAt` (Date)

---

## 9. Components

**Location**: `src/components/`  
**Import**: `import { ComponentName } from '@/components'`

### UI Components (`src/components/ui/`)

#### Button

**File**: `Button.tsx`  
**Purpose**: Primary button component with variants  
**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`  
**Sizes**: `xs`, `sm`, `md`, `lg`, `xl`  
**Props**: `variant`, `size`, `fullWidth`, `disabled`, `loading`, `leftIcon`, `rightIcon`, `children?` (optional — supports icon-only / dot buttons that rely on `aria-label`)  
**Class merging**: Uses `twMerge()` from `tailwind-merge` — custom `className` props properly override conflicting utilities from base/variant/size (e.g. `flex` wins over `inline-flex`, `justify-between` wins over `justify-center`).

#### Card

**File**: `Card.tsx`  
**Purpose**: Container card with optional header/footer  
**Variants**: `default`, `bordered`, `elevated`  
**Props**: `variant`, `padding`, `header`, `footer`, `hoverable`

#### Badge

**File**: `Badge.tsx`  
**Purpose**: Status badges and labels  
**Variants**: `default`, `success`, `warning`, `error`, `info`  
**Sizes**: `sm`, `md`, `lg`  
**Props**: `variant`, `size`, `rounded`, `removable`

#### Alert

**File**: `Alert.tsx`  
**Purpose**: Alert messages and notifications  
**Types**: `success`, `error`, `warning`, `info`  
**Props**: `type`, `title`, `description`, `dismissible`, `icon`

#### Modal

**File**: `Modal.tsx`  
**Purpose**: Modal dialog component  
**Props**: `isOpen`, `onClose`, `title`, `size`, `closeOnOverlayClick`, `closeOnEsc`

#### Tabs

**File**: `Tabs.tsx`  
**Purpose**: Tab navigation component  
**Props**: `items`, `activeTab`, `onChange`, `variant`

#### Table

**File**: `Table.tsx`  
**Purpose**: Data table with sorting and pagination  
**Props**: `columns`, `data`, `sortable`, `pagination`, `loading`

#### Spinner

**File**: `Spinner.tsx`  
**Purpose**: Loading spinner  
**Sizes**: `xs`, `sm`, `md`, `lg`, `xl`  
**Props**: `size`, `color`, `fullScreen`

#### Skeleton

**File**: `Skeleton.tsx`  
**Purpose**: Loading placeholders  
**Types**: `text`, `circle`, `rectangle`  
**Props**: `type`, `width`, `height`, `count`

#### Progress

**File**: `Progress.tsx`  
**Purpose**: Progress bar  
**Props**: `value`, `max`, `showLabel`, `color`, `size`

#### Tooltip

**File**: `Tooltip.tsx`  
**Purpose**: Hover tooltips  
**Positions**: `top`, `bottom`, `left`, `right`  
**Props**: `content`, `position`, `delay`

#### Dropdown

**File**: `Dropdown.tsx`  
**Purpose**: Dropdown menu  
**Props**: `items`, `trigger`, `position`, `disabled`

#### SideDrawer

**File**: `SideDrawer.tsx`  
**Purpose**: Full-screen (mobile) / half-screen (desktop) slide-in drawer for CRUD operations  
**Modes**: `create`, `edit`, `delete`, `view`  
**Props**: `isOpen`, `onClose`, `title`, `children`, `footer`, `mode`, `isDirty`  
**Features**:

- Unsaved changes warning dialog when `isDirty` is true and mode is create/edit
- Swipe-right-to-close gesture support (via `useSwipe` hook)
- Escape key handling, body scroll lock, backdrop click close
- Delete mode shows red header accent with DELETE badge
- Customizable footer slot for action buttons

#### HorizontalScroller

**Files**: `HorizontalScroller.tsx`, `useHorizontalScrollDrag.ts`, `useHorizontalAutoScroll.ts`  
**Purpose**: Generic horizontal-scroll container with arrow navigation, momentum drag-to-scroll (mouse + stylus), keyboard support, fade-edge indicators, and optional circular auto-scroll  
**Import**: `import { HorizontalScroller } from '@/components';` (or `'@/components/ui'` inside `src/components/**`)  
**Type import**: `import type { PerViewConfig } from '@/components';`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | `[]` | Items to render (omit when using `children` mode) |
| `renderItem` | `(item: T, index: number) => ReactNode` | — | Item renderer (omit when using `children` mode) |
| `rows` | `number` | `1` | Number of rows; > 1 switches to column-flow CSS grid |
| `perView` | `PerViewConfig` | — | Responsive items-per-view map `{ base, sm?, md?, lg?, xl?, '2xl'? }` — item width auto-computed |
| `itemWidth` | `number` | auto-detect | Fixed item width in px; takes precedence over `perView` |
| `gap` | `number` | `12` | Gap between items in px |
| `autoScroll` | `boolean` | `false` | Circular seamless auto-scroll (tripled items, debounced reset) |
| `autoScrollInterval` | `number` | `3500` | ms between auto-scroll steps |
| `pauseOnHover` | `boolean` | `true` | Pause auto-scroll on pointer enter |
| `showArrows` | `boolean` | `true` | Show always-visible prev/next buttons |
| `showFadeEdges` | `boolean` | `true` | Gradient fade overlays on scroll edges that appear/hide based on scroll position |
| `enableKeyboard` | `boolean` | `true` | Arrow-key scroll on focus |
| `className` | `string` | `""` | Extra classes on outer wrapper |
| `scrollerClassName` | `string` | `""` | Extra classes on inner scroll div |
| `keyExtractor` | `(item, index) => string` | — | Key for list rendering |
| `snapToItems` | `boolean` | `false` | Adds `snap-x snap-mandatory` to the scroll container and `snap-center` to each item wrapper |
| `children` | `ReactNode` | — | **Children passthrough mode** — renders children directly in a simple flex-scroll container (no arrows, no fade-edges, no auto-scroll). Ignores `items` / `renderItem` when set. |

**Drag-to-scroll** (`useHorizontalScrollDrag`): mouse and stylus only — touch devices use native scroll for better iOS momentum. Velocity sampled over last N pointer-move events → rAF-based exponential decay momentum after release (decay 0.94/frame, stops at 0.5 px/frame). Drag > 5 px suppresses child click events to prevent accidental activation.

**Auto-scroll** (`useHorizontalAutoScroll`): `setInterval` timer with stable `pause()`/`resume()` refs. Hover-pause and drag-pause are independent flags — timer only resumes when both clear simultaneously.

**Circular auto-scroll**: items array is tripled internally. After each scroll settles (350 ms debounce) the position is silently snapped back to the equivalent center copy — no visible jump. `cancelMomentum()` is called before the snap to prevent the inertia animation fighting the new position.

**Keyboard**: focus the container (or any child), then `ArrowLeft` / `ArrowRight` to page-scroll.

```tsx
// Featured carousel with responsive perView + circular auto-scroll
<HorizontalScroller
  items={products}
  renderItem={(p) => <ProductCard product={p} />}
  perView={{ base: 2, sm: 3, lg: 4, xl: 5, "2xl": 6 }}
  gap={12}
  autoScroll
  keyExtractor={(p) => p.id}
  className="px-5"
/>

// Tab strip (no auto-scroll, natural item widths)
<HorizontalScroller
  items={CATEGORIES}
  renderItem={(c) => <CategoryChip category={c} />}
  autoScroll={false}
  gap={8}
/>

// Children passthrough mode — simple snap thumbnail strip
<HorizontalScroller snapToItems className="mt-4 pb-2">
  {images.map((img, i) => (
    <button key={i} className="flex-shrink-0 w-16 h-16 snap-center">
      <img src={img.thumbnail} alt={img.alt} className="w-full h-full object-cover" />
    </button>
  ))}
</HorizontalScroller>
```

#### SectionTabs

**File**: `SectionTabs.tsx`  
**Purpose**: Unified navigation tabs for admin/user sections — horizontal tab bar on desktop, dropdown on mobile  
**Props**: `tabs` (`SectionTab[]`), `variant` (`"admin" | "user" | "default"`), `className`  
**Interfaces**: `SectionTab` (`label`, `href`, `icon?`)

#### StatusBadge

**File**: `StatusBadge.tsx`  
**Purpose**: Color-coded badge for status values  
**Props**: `status` (`"active" | "inactive" | "pending" | "approved" | "rejected" | "success" | "warning" | "danger" | "info"`), `label`, `className`

#### RoleBadge

**File**: `RoleBadge.tsx`  
**Purpose**: Color-coded badge for user roles (admin=purple, moderator=blue, seller=teal, user=gray)  
**Props**: `role` (`UserRole`), `label`, `className`

---

### Form Components (`src/components/forms/`)

#### Input

**File**: `Input.tsx`  
**Purpose**: Text input field  
**Types**: `text`, `email`, `password`, `number`, `tel`, `url`, `search`, `color`  
**Props**: `type`, `placeholder`, `disabled`, `error`, `icon` (left slot), `rightIcon` (right slot), `label`, `helperText`, `success`  
**Ref forwarding**: Supports `ref` via `React.forwardRef` — pass a `RefObject<HTMLInputElement>` when the native input element must be programmatically focused.

#### Select

**File**: `Select.tsx`  
**Purpose**: Select dropdown  
**Props**: `options`, `value`, `onChange`, `placeholder` (rendered as a first disabled `<option value="">`), `disabled`, `error`, `label`, `helperText`, `className`

#### Textarea

**File**: `Textarea.tsx`  
**Purpose**: Multiline text input  
**Ref forwarding**: Supports `ref` via `React.forwardRef`.  
**Props**: `placeholder`, `rows`, `maxLength`, `disabled`, `error`, `label`, `helperText`, `showCharCount` — when `showCharCount={true}` and `maxLength` is set, renders a `{count}/{max}` indicator

#### Checkbox

**File**: `Checkbox.tsx`  
**Purpose**: Checkbox input with SVG tick/dash overlay (opacity-transition based, requires `peer` on the native input).  
**Props**: `label`, `checked`, `onChange`, `disabled`, `indeterminate` — sets `input.indeterminate` via `useEffect` and shows a dash icon instead of a tick; `suffix?: React.ReactNode` renders additional content (e.g. a count badge) right-aligned inside the label row.

#### RadioGroup

**File**: `Radio.tsx`  
**Purpose**: Radio button group. Default variant renders pill-style toggle cards; classic variant renders dot-style radios.  
**Props**: `name`, `options: { value, label, disabled? }[]`, `value`, `onChange: (value: string) => void`, `label`, `error`, `orientation` (`"vertical"` | `"horizontal"`), `variant` (`"toggle"` (default) | `"classic"`)

#### Toggle

**File**: `Toggle.tsx`  
**Purpose**: Boolean switch control.  
**Props**: `checked`, `defaultChecked`, `onChange: (checked: boolean) => void`, `disabled`, `label`, `size` (`"sm"` | `"md"` | `"lg"`), `className`, `id`  
**Size track heights**: `sm` = `h-[18px]`, `md` = `h-6`, `lg` = `h-7`

#### Slider

**File**: `Slider.tsx`  
**Purpose**: Range slider input.  
**Props**: `value`, `defaultValue`, `min`, `max`, `step`, `onChange: (value: number) => void`, `onChangeEnd: (value: number) => void`, `disabled`, `label`, `showValue`, `size` (`"sm"` | `"md"` | `"lg"`), `className`, `id`

---

### FormField Component

**File**: `FormField.tsx`  
**Purpose**: Form field wrapper with label, error, and help text  
**Props**: `label`, `error`, `helpText`, `required`, `children`

---

### Typography Components (`src/components/typography/`)

All text and link elements in the app MUST use these components — never raw `<h1>`–`<h6>`, `<p>`, `<label>`, `<span>`, or `<a>` tags.

#### Heading

**File**: `Typography.tsx`  
**Purpose**: Semantic heading (`h1`–`h6`) with level-based sizing and themed colour.  
**Props**: `level` (1–6, default 1), `variant` (`"primary"` | `"secondary"` | `"muted"`), `className`, all native `<hN>` attrs.

```tsx
<Heading level={2} variant="secondary">
  Section title
</Heading>
```

#### Text

**File**: `Typography.tsx`  
**Purpose**: Block-level paragraph (`<p>`) for body copy and descriptions.  
**Props**: `variant` (`"primary"` | `"secondary"` | `"muted"` | `"error"` | `"success"`), `size` (`"xs"` | `"sm"` | `"base"` | `"lg"` | `"xl"`), `weight` (`"normal"` | `"medium"` | `"semibold"` | `"bold"`), `className`.

```tsx
<Text variant="secondary" size="sm">
  Helper description
</Text>
```

#### Label

**File**: `Typography.tsx`  
**Purpose**: Form field label (`<label>`).  
**Props**: `required` (shows red asterisk), `htmlFor`, all native `<label>` attrs.

```tsx
<Label required htmlFor="email">
  Email address
</Label>
```

#### Caption

**File**: `Typography.tsx`  
**Purpose**: Small inline annotation (`<span>`) for timestamps, metadata, tags.  
**Props**: `variant` (`"default"` | `"accent"` | `"inverse"`), `className`.

```tsx
<Caption>{formatDate(product.createdAt)}</Caption>
<Caption variant="accent">New</Caption>
```

#### Span

**File**: `Typography.tsx`  
**Purpose**: Inline wrapper (`<span>`) for styled text fragments — gradient highlights, coloured sub-text, icon wrappers, etc.  
When `variant="inherit"` (default) **no colour class is applied**, making it a transparent CSS-only wrapper.  
**Props**: `variant` (`"inherit"` | `"primary"` | `"secondary"` | `"muted"` | `"error"` | `"success"` | `"accent"`), `size`, `weight`, `className`, `children?` (optional — supports decorative self-closing use, e.g. animated dots).

```tsx
// CSS-only wrapper (gradient text, no colour class injected)
<Span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
  Highlighted
</Span>

// Semantic colour
<Span variant="error" weight="semibold">Required field</Span>
```

#### TextLink

**File**: `TextLink.tsx`  
**Purpose**: The only component for ALL anchor/link elements.

- Internal URLs → locale-aware `Link` from `@/i18n/navigation`
- External URLs / `mailto:` / `tel:` → `<a target="_blank" rel="noopener noreferrer">`
- Auto-detects internal vs external from the `href`; override with `external={true}`.

**Props**: `href` (required), `variant` (`"default"` | `"muted"` | `"nav"` | `"danger"` | `"inherit"` | `"bare"`), `external`, all native `<a>` attrs.

| Variant     | Classes applied                                           | When to use                                        |
| ----------- | --------------------------------------------------------- | -------------------------------------------------- |
| `"default"` | Indigo text + hover underline                             | Standard text links                                |
| `"muted"`   | Muted text + hover underline                              | Secondary / helper links                           |
| `"nav"`     | Secondary text + indigo on hover, no underline            | Navigation items                                   |
| `"danger"`  | Red text + hover underline                                | Destructive action links                           |
| `"inherit"` | Underline offset + hover underline, no colour override    | Links inside coloured containers                   |
| `"bare"`    | _(nothing)_ — caller controls all styling via `className` | Card-style links, skip-nav, icon-only social links |

```tsx
// Internal navigation (locale-aware)
<TextLink href={ROUTES.PRODUCTS.LIST}>Browse products</TextLink>

// External site (auto-detected) — opens in new tab
<TextLink href="https://example.com">Visit site</TextLink>

// Navigation style (no underline, colour-on-hover)
<TextLink href={ROUTES.AUTH.LOGIN} variant="nav">Log in</TextLink>

// Destructive action link
<TextLink href="#" variant="danger" onClick={handleDelete}>Delete account</TextLink>

// Card-style link — caller owns all styling
<TextLink href={`mailto:${email}`} variant="bare" className="p-4 rounded-xl bg-gray-50 hover:bg-white">
  Email Us
</TextLink>

// Skip-navigation accessibility link
<TextLink href="#main-content" variant="bare" className="sr-only focus:not-sr-only ...">
  Skip to main content
</TextLink>

// Icon-only social link — aria-label required
<TextLink href={`https://twitter.com/${handle}`} variant="bare" aria-label="Twitter profile" className="p-2 rounded-lg">
  <TwitterIcon />
</TextLink>
```

---

### Semantic HTML Wrapper Components (`src/components/semantic/`)

Use these instead of raw `<section>`, `<article>`, `<main>`, `<aside>`, `<nav>`, `<ul>`, `<ol>`, `<li>` elements to enable future one-place theming and enforce accessibility attributes.

All components forward every standard HTML attribute via `...props`.

| Component     | HTML element | Notes                                                                 |
| ------------- | ------------ | --------------------------------------------------------------------- |
| `Section`     | `<section>`  | Thematically grouped content with a heading                           |
| `Article`     | `<article>`  | Self-contained compositions (blog posts, product cards, reviews)      |
| `Main`        | `<main>`     | Primary document content — one per page                               |
| `Aside`       | `<aside>`    | Supplementary content (sidebars, callout boxes)                       |
| `Nav`         | `<nav>`      | **`aria-label` is required** to distinguish multiple navs             |
| `BlockHeader` | `<header>`   | Block-level header inside a component — NOT the page-level app header |
| `BlockFooter` | `<footer>`   | Block-level footer inside a component — NOT the page-level app footer |
| `Ul`          | `<ul>`       | Unordered list                                                        |
| `Ol`          | `<ol>`       | Ordered list                                                          |
| `Li`          | `<li>`       | List item — use inside `Ul` or `Ol`                                   |

```tsx
import {
  Section,
  Article,
  Main,
  Aside,
  Nav,
  BlockHeader,
  BlockFooter,
  Ul,
  Ol,
  Li,
} from "@/components";

<Main className={THEME_CONSTANTS.page.container["2xl"]}>
  <Section className="py-12">
    <Article>
      <BlockHeader className="mb-4">
        <Heading level={2}>{post.title}</Heading>
        <Caption>{formatDate(post.createdAt)}</Caption>
      </BlockHeader>
      <Text>{post.excerpt}</Text>
      <BlockFooter className="mt-4">
        <TextLink href={ROUTES.BLOG.POST(post.slug)}>Read more</TextLink>
      </BlockFooter>
    </Article>
  </Section>
  <Aside className="w-64 shrink-0">
    <Nav aria-label="Related links">
      <Ul className="space-y-2">
        <Li>
          <TextLink href="/products">Products</TextLink>
        </Li>
        <Li>
          <TextLink href="/categories">Categories</TextLink>
        </Li>
      </Ul>
    </Nav>
  </Aside>
</Main>;
```

---

### Feedback Components (`src/components/feedback/`)

#### Toast

**File**: `Toast.tsx`  
**Purpose**: Toast notification  
**Types**: `success`, `error`, `warning`, `info`  
**Props**: `type`, `message`, `duration`, `position`

---

### Utility Components (`src/components/utility/`)

#### BackToTop

**File**: `BackToTop.tsx`  
**Purpose**: Scroll to top button  
**Props**: `threshold`, `position`, `smooth`

#### Search

**File**: `Search.tsx`  
**Purpose**: Dual-mode search component — overlay (global nav search) and inline (list-page filter search)  
**Import**: `import { Search } from '@/components'`

**Overlay mode** (default): sticky search bar that slides in below the title bar; auto-focuses, supports ESC to close and Enter to submit.

```tsx
<Search
  isOpen={searchOpen}
  onClose={() => setSearchOpen(false)}
  onSearch={(query) => handleSearch(query)}
/>
```

**Inline mode**: controlled search input for filter toolbars and list pages. Activated by passing `value` + `onChange`. Use with `useUrlTable`.

```tsx
<Search
  value={table.get("q")}
  onChange={(v) => table.set("q", v)}
  placeholder={UI_PLACEHOLDERS.SEARCH}
  onClear={() => table.set("q", "")}
/>
```

| Mode    | Key Props                                                                          | Notes                      |
| ------- | ---------------------------------------------------------------------------------- | -------------------------- |
| Overlay | `isOpen`, `onClose`, `onSearch?`                                                   | Overlay + backdrop         |
| Inline  | `value`, `onChange`, `placeholder?`, `debounceMs?` (300), `onClear?`, `className?` | Debounced controlled input |

#### Pagination

**File**: `Pagination.tsx`  
**Purpose**: Pagination controls  
**Props**: `currentPage`, `totalPages`, `onPageChange`, `maxVisible`

#### EmptyState

**File**: `EmptyState.tsx`  
**Purpose**: Empty state placeholder  
**Props**: `icon`, `title`, `description`, `action`

#### ErrorDisplay

**File**: `ErrorDisplay.tsx`  
**Purpose**: Error message display  
**Props**: `error`, `retry`, `fullScreen`

#### ResponsiveView

**File**: `ResponsiveView.tsx`  
**Purpose**: Conditionally renders mobile, tablet, or desktop content based on viewport via `useBreakpoint`  
**Props**: `mobile` (`ReactNode`), `desktop` (`ReactNode`), `tablet?` (`ReactNode`)

---

### Layout Components (`src/components/layout/`)

#### Header

**File**: `Header.tsx`  
**Purpose**: Site header with navigation  
**Props**: `variant`, `sticky`, `transparent`

#### Footer

**File**: `Footer.tsx`  
**Purpose**: Site footer  
**Props**: `minimal`

#### Sidebar

**File**: `Sidebar.tsx`  
**Purpose**: Sidebar navigation  
**Props**: `items`, `collapsed`, `position`

#### Container

**File**: `Container.tsx`  
**Purpose**: Responsive container  
**Props**: `maxWidth`, `padding`, `centered`

#### Grid

**File**: `Grid.tsx`  
**Purpose**: CSS Grid wrapper  
**Props**: `columns`, `gap`, `responsive`

#### LocaleSwitcher

**File**: `LocaleSwitcher.tsx`  
**Purpose**: Pill-style language toggle for switching between `en` (English) and `hi` (Hindi). Visible on `sm+` screens in the TitleBar. Uses `useLocale()` + locale-aware `router.replace()` from `@/i18n/navigation`.  
**Import**: `import { LocaleSwitcher } from '@/components'`

---

### Media Display Primitives (`src/components/media/`)

> **Rule 28**: All image and video rendering must go through these Tier 1 primitives. Never use raw `<img>`, `<video>`, or Next.js `<Image>` directly in feature/page code. Import from `@/components`.

#### MediaImage

**File**: `src/components/media/MediaImage.tsx`  
**Purpose**: Tier 1 primitive for ALL static image rendering (products, blog, categories, carousel, etc.).  
**Props**:

| Prop        | Type                                                                   | Default        | Notes                                         |
| ----------- | ---------------------------------------------------------------------- | -------------- | --------------------------------------------- |
| `src`       | `string \| undefined`                                                  | —              | When undefined, renders emoji fallback        |
| `alt`       | `string`                                                               | —              | Required; used as aria-label on fallback too  |
| `size`      | `'thumbnail' \| 'card' \| 'hero' \| 'banner' \| 'gallery' \| 'avatar'` | `'card'`       | Controls `sizes` hint passed to Next.js Image |
| `priority`  | `boolean`                                                              | `false`        | Pass `true` for above-the-fold hero images    |
| `objectFit` | `'cover' \| 'contain'`                                                 | `'cover'`      |                                               |
| `fallback`  | `string`                                                               | per-size emoji | Override fallback emoji                       |
| `className` | `string`                                                               | —              | Forwarded to outer wrapper                    |

**Usage**: Parent must be `relative overflow-hidden` with a defined size (width + aspect or height).

```tsx
// Product card thumbnail
<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
  <MediaImage src={product.mainImage} alt={product.title} size="card" />
</div>

// Hero banner (above the fold)
<div className="relative aspect-[16/9] w-full overflow-hidden">
  <MediaImage src={post.heroImage} alt={post.title} size="hero" priority />
</div>
```

**Fallback emojis by size**: `thumbnail` → 🖼️, `card` → 📦, `hero` → 🌅, `banner` → 🎨, `gallery` → 🖼️, `avatar` → 👤.

#### MediaAvatar

**File**: `src/components/media/MediaAvatar.tsx`  
**Purpose**: Tier 1 primitive for ALL user / seller / brand profile picture display. Manages its own circular sizing — no wrapper div needed at the call site.  
**Props**:

| Prop        | Type                           | Default | Notes                                      |
| ----------- | ------------------------------ | ------- | ------------------------------------------ |
| `src`       | `string \| undefined`          | —       | When undefined, renders 👤 fallback        |
| `alt`       | `string`                       | —       | Required for accessibility                 |
| `size`      | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | `sm`=32px, `md`=40px, `lg`=56px, `xl`=80px |
| `className` | `string`                       | —       | Forwarded to the outer circle wrapper      |

```tsx
// Tiny avatar next to a reviewer name
<MediaAvatar src={review.userAvatar} alt={review.userName} size="sm" />

// Medium avatar in a table cell
<MediaAvatar src={user.photoURL} alt={user.displayName} />

// Large profile avatar
<MediaAvatar src={seller.avatarUrl} alt={seller.displayName} size="xl" />
```

#### MediaVideo

**File**: `src/components/media/MediaVideo.tsx`  
**Purpose**: Tier 1 primitive for ALL video rendering.  
**Props**:

| Prop            | Type                   | Default   | Notes                                      |
| --------------- | ---------------------- | --------- | ------------------------------------------ |
| `src`           | `string \| undefined`  | —         | When undefined, renders 🎬 fallback        |
| `thumbnailUrl`  | `string`               | —         | Set as video `poster`                      |
| `alt`           | `string`               | `'Video'` | Used on fallback aria-label                |
| `controls`      | `boolean`              | `true`    |                                            |
| `autoPlayMuted` | `boolean`              | `false`   | Applies `autoPlay muted playsInline`       |
| `loop`          | `boolean`              | `false`   |                                            |
| `trimStart`     | `number`               | —         | Seconds; seeks video `currentTime` on load |
| `trimEnd`       | `number`               | —         | Seconds; pauses and resets at this point   |
| `objectFit`     | `'cover' \| 'contain'` | `'cover'` |                                            |
| `className`     | `string`               | —         | Forwarded to outer wrapper                 |

```tsx
// Auction product demo video
<div className="relative aspect-square overflow-hidden rounded-2xl">
  <MediaVideo
    src={product.video.url}
    thumbnailUrl={product.video.thumbnailUrl}
    alt={product.title}
    trimStart={product.video.trimStart}
    trimEnd={product.video.trimEnd}
    controls
  />
</div>
```

---

### Upload Components

#### MediaUploadField

**File**: `src/components/admin/MediaUploadField.tsx`  
**Purpose**: Embeddable file/video upload field for any form. Supports any MIME type and shows type-appropriate previews (video player, image thumbnail, or filename link).  
**Props**: `label` (required), `value: string`, `onChange: (url: string) => void`, `accept?`, `maxSizeMB?`, `folder?`, `disabled?`, `helperText?`  
**Upload path**: `useMediaUpload` → `POST /api/media/upload` (Firebase Admin SDK).  
**When to use**: Video fields, PDF attachments, or any non-image file. For image-only fields, prefer `<ImageUpload>`.

#### ImageUpload

**File**: `src/components/admin/ImageUpload.tsx`  
**Purpose**: Canonical content image upload for all form fields — products, blog, categories, carousel, and any other content image.  
**Props**: `currentImage?`, `onUpload: (url: string) => void`, `folder?`, `label?`, `helperText?`, `accept?`, `maxSizeMB?`, `isPublic?`  
**Upload path**: `useMediaUpload` → `POST /api/media/upload` (Firebase Admin SDK). Never uses Storage client SDK.  
**When to use**: Any form field that produces an image URL. Do NOT use for profile avatars (see `AvatarUpload`).

#### AvatarUpload

**File**: `AvatarUpload.tsx`  
**Purpose**: Profile photo upload with crop + zoom, for user / seller / brand avatars.  
**Props**: `value`, `onChange`, `size`, `allowEdit`  
**Upload path (current)**: `useStorageUpload` → Firebase Storage client SDK. ⚠️ TASK-20 will migrate this to `/api/media/upload`.

#### AvatarDisplay

**File**: `AvatarDisplay.tsx`  
**Purpose**: Display user avatar  
**Props**: `user`, `size`, `fallback`, `showBadge`

---

### Modal Components (`src/components/modals/`)

#### ConfirmDeleteModal

**File**: `ConfirmDeleteModal.tsx`  
**Purpose**: Confirmation modal for deletions and bulk-action confirmations  
**Props**: `isOpen`, `onClose`, `onConfirm`, `title?`, `message?`, `confirmText?`, `cancelText?`, `isDeleting?`, `variant?`

| `variant`            | Icon  | Button    | Loading text      | When to use                                     |
| -------------------- | ----- | --------- | ----------------- | ----------------------------------------------- |
| `"danger"` (default) | Red   | `danger`  | `"Deleting..."`   | Delete / destructive bulk actions               |
| `"warning"`          | Amber | `warning` | `"Processing..."` | Reversible bulk actions (archive, cancel)       |
| `"primary"`          | Blue  | `primary` | `"Processing..."` | Non-destructive bulk actions (publish, approve) |

```tsx
// Bulk delete — danger (default)
<ConfirmDeleteModal
  isOpen={bulkDeleteOpen}
  title={t('bulkDeleteTitle', { count: selectedIds.length })}
  message={t('bulkDeleteMessage')}
  confirmText={tActions('delete')}
  isDeleting={isBulkProcessing}
  onConfirm={handleBulkDelete}
  onClose={() => setBulkDeleteOpen(false)}
/>

// Bulk publish — primary (non-destructive)
<ConfirmDeleteModal
  isOpen={bulkPublishOpen}
  variant="primary"
  title={t('bulkPublishTitle', { count: selectedIds.length })}
  message={t('bulkPublishMessage')}
  confirmText={tActions('bulkPublish', { count: selectedIds.length })}
  isDeleting={isBulkProcessing}
  onConfirm={handleBulkPublish}
  onClose={() => setBulkPublishOpen(false)}
/>
```

#### ImageCropModal

**File**: `ImageCropModal.tsx`  
**Purpose**: Image cropping modal  
**Props**: `isOpen`, `onClose`, `image`, `onCropComplete`, `aspect`

---

### Auth Components (`src/components/auth/`)

#### LoginForm

**File**: `LoginForm.tsx`  
**Purpose**: Login form component  
**Props**: `onSuccess`, `redirectTo`

#### RegisterForm

**File**: `RegisterForm.tsx`  
**Purpose**: Registration form  
**Props**: `onSuccess`, `redirectTo`

#### ForgotPasswordForm

**File**: `ForgotPasswordForm.tsx`  
**Purpose**: Password reset request form  
**Props**: `onSuccess`

#### ResetPasswordForm

**File**: `ResetPasswordForm.tsx`  
**Purpose**: Password reset form with token  
**Props**: `token`, `onSuccess`

---

### Profile Components (`src/components/profile/`)

#### ProfileCard

**File**: `ProfileCard.tsx`  
**Purpose**: User profile display card  
**Props**: `user`, `editable`

#### ProfileForm

**File**: `ProfileForm.tsx`  
**Purpose**: Profile editing form  
**Props**: `user`, `onSave`

#### AddressManager

**File**: `AddressManager.tsx`  
**Purpose**: Manage user addresses  
**Props**: `userId`

---

### User Components (`src/components/user/`)

#### Addresses

##### AddressForm

**File**: `user/addresses/AddressForm.tsx`  
**Purpose**: Shared form for adding/editing user addresses with all address fields  
**Props**: `initialData` (`Partial<AddressFormData>`), `onSubmit`, `onCancel`, `isLoading`, `submitLabel`

##### AddressCard

**File**: `user/addresses/AddressCard.tsx`  
**Purpose**: Display card for an address with edit/delete/set-default actions  
**Props**: `address`, `onEdit`, `onDelete`, `onSetDefault`, `className`

#### Profile

##### ProfileHeader

**File**: `user/profile/ProfileHeader.tsx`  
**Purpose**: Hero section for user profile page with avatar, name, role badge, and email  
**Props**: `photoURL`, `displayName`, `email`, `role`, `className`

##### ProfileStatsGrid

**File**: `user/profile/ProfileStatsGrid.tsx`  
**Purpose**: Grid of stat cards showing order count, wishlist count, and address count  
**Props**: `stats` (`{ orders, wishlist, addresses }`), `className`

#### Settings

##### EmailVerificationCard

**File**: `user/settings/EmailVerificationCard.tsx`  
**Purpose**: Card showing email verification status with resend CTA  
**Props**: `email`, `isVerified`, `onResendVerification`, `isLoading`, `className`

##### PhoneVerificationCard

**File**: `user/settings/PhoneVerificationCard.tsx`  
**Purpose**: Card showing phone verification status with verify CTA  
**Props**: `phone`, `isVerified`, `onVerify`, `isLoading`, `className`

##### ProfileInfoForm

**File**: `user/settings/ProfileInfoForm.tsx`  
**Purpose**: Form for editing avatar, display name, and phone number  
**Props**: `userId`, `initialData` (`{ displayName, phone, photoURL }`), `onSubmit`, `onAvatarUploadSuccess`, `onRefresh`, `isLoading`

##### PasswordChangeForm

**File**: `user/settings/PasswordChangeForm.tsx`  
**Purpose**: Password change form with current/new/confirm fields and strength indicator  
**Props**: `onSubmit`, `isLoading`

##### AccountInfoCard

**File**: `user/settings/AccountInfoCard.tsx`  
**Purpose**: Read-only display of account metadata (UID, email, creation date, last login)  
**Props**: `uid`, `email`, `createdAt`, `lastLoginAt`, `className`

---

### Admin Components (`src/components/admin/`)

#### AdminPageHeader

**File**: `AdminPageHeader.tsx`  
**Purpose**: Standardized gradient page header for admin pages with optional action button  
**Props**: `title`, `subtitle`, `actionLabel`, `onAction`, `actionIcon`, `actionDisabled`, `className`

#### AdminFilterBar

**File**: `AdminFilterBar.tsx`  
**Purpose**: Responsive grid of filter inputs. Wraps in `<Card>` by default (admin pages). Pass `withCard={false}` for public/seller pages to get a bare grid with no card shell — same component, no extra import.  
**Props**: `children`, `columns` (`1 | 2 | 3 | 4`), `className`, `withCard` (default: `true`) _(Phase 2)_

#### DrawerFormFooter

**File**: `DrawerFormFooter.tsx`  
**Purpose**: Cancel + Save/Delete button pair for SideDrawer forms  
**Props**: `onCancel`, `onSubmit`, `onDelete`, `submitLabel`, `deleteLabel`, `cancelLabel`, `isLoading`, `isSubmitDisabled`, `className`

#### DataTable

**File**: `DataTable.tsx`  
**Purpose**: Data table with striped rows, sticky header, mobile card view, swipe-to-action rows. Does **not** handle server pagination internally — pair with `TablePagination` and pass `externalPagination`. Supports built-in grid/list/table view toggle via `showViewToggle`; card renderer reuses existing `mobileCardRender` prop.  
**Props**: `columns`, `data`, `loading`, `striped`, `stickyHeader`, `mobileCardRender`, `externalPagination`, `showViewToggle`, `viewMode`, `defaultViewMode`, `onViewModeChange`  
**Deprecated** (will remove after full migration): `showPagination`, `pageSize`

#### TablePagination

**File**: `src/components/ui/TablePagination.tsx`  
**Purpose**: Standalone pagination control with "Showing X–Y of Z results", per-page selector, and page-number strip. Decoupled from DataTable so it can sit anywhere in the layout. Usable by admin, public, seller, and user pages.  
**Props**: `total`, `page`, `pageSize`, `onPageChange`, `onPageSizeChange`, `pageSizeOptions`

#### SortDropdown

**File**: `src/components/ui/SortDropdown.tsx`  
**Purpose**: `<label>` + `<select>` sort control for any list page (admin, public, seller, user). Human-readable labels; options from a constant array. Used inside `AdminFilterBar`.  
**Props**: `value`, `onChange`, `options`, `label`, `id`

#### FilterBar

`FilterBar` is not a separate component — it is `AdminFilterBar` with `withCard={false}`. Pass `withCard={false}` to get a bare grid/flex container with no Card shell, suitable for public and seller pages.

```tsx
// Public/seller page filter row:
<AdminFilterBar withCard={false} columns={2}>
  <SortDropdown ... />
  <Input ... />
</AdminFilterBar>
```

#### AdminLayout

**File**: `AdminLayout.tsx`  
**Purpose**: Admin dashboard layout  
**Props**: `children`

#### StatsCard

**File**: `StatsCard.tsx`  
**Purpose**: Dashboard statistics card  
**Props**: `title`, `value`, `icon`, `trend`

#### UserManagementTable

**File**: `UserManagementTable.tsx`  
**Purpose**: User management interface  
**Props**: `users`, `onEdit`, `onDelete`

---

### Filter & Pagination Components

> Shared primitives (Tier 1) — replace ad-hoc filter implementations across admin, seller, public and search pages.

#### FilterFacetSection

**File**: `src/components/ui/FilterFacetSection.tsx`  
**Tier**: 1 — Shared primitive. Not admin-specific.  
**Purpose**: A single collapsible filter group (e.g. "Category", "Brand", "Price range") that renders a list of checkboxes, virtualises long lists with a "Load more" button, and includes an inline search input. Selected values are passed to `ActiveFilterChips` by the parent.  
**Used by**: `FilterDrawer` (as children), `products/page.tsx`, `search/page.tsx`, `categories/[slug]/page.tsx`, `auctions/page.tsx`, `seller/products/page.tsx`, and any admin page that adopts the drawer filter pattern.  
**Props**: `label`, `options` (`{ label, value, count? }[]`), `selected` (`string[]`), `onChange`, `pageSize` (default 10), `searchable`

#### FilterDrawer

**File**: `src/components/ui/FilterDrawer.tsx`  
**Tier**: 1 — Shared primitive. Not admin-specific.  
**Purpose**: Toggleable left slide-in filter panel (uses `SideDrawer` with `side="left"`). Wraps one or more `FilterFacetSection` groups. Has a "Clear All" + "Apply" footer and shows an active-count badge on the trigger button. Replaces always-open filter sidebars on mobile and wherever screen space is limited.  
**Used by**: `products/page.tsx` (mobile only; lg+ keeps `ProductFilters` as a left sidebar), `search/page.tsx`, `categories/[slug]/page.tsx`, `auctions/page.tsx`, `seller/products/page.tsx`.  
**Props**: `isOpen`, `onClose`, `onClear`, `activeCount`, `children` (one or more `<FilterFacetSection />`), `title`

#### ActiveFilterChips

**File**: `src/components/ui/ActiveFilterChips.tsx`  
**Tier**: 1 — Shared primitive. Not admin-specific.  
**Purpose**: Row of dismissible chips showing every currently-active filter. "Clear all" link when two or more filters are set. Hidden when none are active. Renders below the `FilterDrawer` trigger or inline `AdminFilterBar` on any list page — public, seller, or admin.  
**Used by**: `products/page.tsx`, `search/page.tsx`, `categories/[slug]/page.tsx`, `auctions/page.tsx`, `seller/products/page.tsx`, admin list pages.  
**Props**: `filters` (`{ key, label, value }[]`), `onRemove(key)`, `onClearAll`

#### ListingLayout

**File**: `src/components/ui/ListingLayout.tsx`  
**Tier**: 1 — Shared primitive. Replaces ad-hoc filter + toolbar assemblies on **all** listing pages — public, seller, and admin.  
**Purpose**: Universal listing-page shell that wires together the toolbar (search, view toggle, sort, action buttons), collapsible filter sidebar (desktop), fullscreen filter overlay (mobile), and bulk-action bar. All content slots are `ReactNode` props so the parent stays thin.

Key behaviours:

- **Desktop sidebar**: collapses/expands via the "Show/Hide filters" toggle button without shifting the content grid. Width transitions from `w-60 xl:w-64` → `w-0` with `overflow-hidden`.
- **Mobile overlay**: tapping "Filters" opens a `fixed inset-0 z-50` fullscreen panel. Applying filters or committing a search auto-closes the overlay. Escape key also closes it. Body scroll is locked while open.
- **Bulk action bar**: `BulkActionBar` is auto-rendered below the toolbar whenever `selectedCount > 0`. Pass `bulkActions` as children (`<Button>` elements) and `onClearSelection` to wire up the ✕ button.

**Props**:

| Prop                 | Type         | Default     | Purpose                                                                 |
| -------------------- | ------------ | ----------- | ----------------------------------------------------------------------- |
| `filterContent`      | `ReactNode`  | —           | `FilterFacetSection` groups rendered in both sidebar and mobile overlay |
| `filterActiveCount`  | `number`     | `0`         | Badge count on the mobile filter trigger button                         |
| `filterTitle`        | `string`     | `"Filters"` | Mobile overlay panel title                                              |
| `onFilterApply`      | `() => void` | —           | Called when user taps "Apply" in the mobile overlay                     |
| `onFilterClear`      | `() => void` | —           | Called when user taps "Clear all" in the mobile overlay                 |
| `searchSlot`         | `ReactNode`  | —           | `<Search>` component (fills available toolbar width)                    |
| `sortSlot`           | `ReactNode`  | —           | `<SortDropdown>` placed right of the search bar                         |
| `viewToggleSlot`     | `ReactNode`  | —           | Grid/list/table view toggle buttons                                     |
| `actionsSlot`        | `ReactNode`  | —           | Extra toolbar actions (e.g. "Create", "Export")                         |
| `selectedCount`      | `number`     | `0`         | When > 0 shows `BulkActionBar`                                          |
| `onClearSelection`   | `() => void` | —           | Wired to the ✕ button inside `BulkActionBar`                            |
| `bulkActions`        | `ReactNode`  | —           | `<Button>` elements rendered inside `BulkActionBar`                     |
| `defaultSidebarOpen` | `boolean`    | `true`      | Initial desktop sidebar state                                           |
| `className`          | `string`     | —           | Additional classes on the root wrapper                                  |
| `children`           | `ReactNode`  | —           | The data grid / table content area                                      |

```tsx
import {
  ListingLayout,
  Search,
  SortDropdown,
  DataTable,
  Button,
} from "@/components";
import { FilterFacetSection } from "@/components";
import { useUrlTable } from "@/hooks";
import { useTranslations } from "next-intl";

export function ProductsView() {
  const t = useTranslations("productsPage");
  const table = useUrlTable({
    defaults: { pageSize: "24", sorts: "-createdAt" },
  });
  const { data, loading } = useProducts(table.params.toString());

  return (
    <ListingLayout
      filterContent={
        <FilterFacetSection
          title={t("filters.category")}
          options={categoryOptions}
          selected={table.get("category").split(",")}
          onChange={(v) => table.set("category", v.join(","))}
        />
      }
      filterActiveCount={activeFilterCount}
      onFilterApply={() => {
        /* no-op — filters already in URL */
      }}
      onFilterClear={() => table.setMany({ category: "", status: "" })}
      searchSlot={
        <Search value={table.get("q")} onChange={(v) => table.set("q", v)} />
      }
      sortSlot={
        <SortDropdown
          value={table.get("sorts")}
          onChange={table.setSort}
          options={PRODUCT_SORT_OPTIONS}
        />
      }
      selectedCount={selectedIds.length}
      onClearSelection={() => setSelectedIds([])}
      bulkActions={
        <Button variant="danger" size="sm" onClick={handleBulkDelete}>
          {t("bulkDelete")}
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        mobileCardRender={(p) => <ProductCard product={p} />}
      />
    </ListingLayout>
  );
}
```

#### BulkActionBar

**File**: `src/components/ui/BulkActionBar.tsx`  
**Tier**: 1 — Shared primitive.  
**Purpose**: Compact contextual bar that appears (with fade-in animation) when one or more list items are selected. Shows the selection count, a ✕ "Clear selection" button, a vertical divider, then any action buttons passed as `children`. Returns `null` when `selectedCount === 0` so it is safe to always render.

Public pages pass cart/wishlist actions; seller and admin pages pass delete/export/status-change actions.

**Props**:

| Prop               | Type         | Purpose                                                          |
| ------------------ | ------------ | ---------------------------------------------------------------- |
| `selectedCount`    | `number`     | Number of selected items. Bar is hidden (returns `null`) when 0. |
| `onClearSelection` | `() => void` | Called by the ✕ button to deselect all items.                    |
| `children`         | `ReactNode`  | One or more `<Button>` elements for bulk operations.             |

```tsx
// Public listing — cart/wishlist bulk actions
<BulkActionBar
  selectedCount={selectedIds.length}
  onClearSelection={() => setSelectedIds([])}
>
  <Button variant="primary" size="sm" onClick={handleAddAllToCart}>
    {t('addAllToCart')}
  </Button>
  <Button variant="outline" size="sm" onClick={handleAddAllToWishlist}>
    {t('addAllToWishlist')}
  </Button>
</BulkActionBar>

// Admin listing — delete/export bulk actions
<BulkActionBar selectedCount={selectedIds.length} onClearSelection={() => setSelectedIds([])}>
  <Button variant="danger" size="sm" onClick={handleBulkDelete}>
    {t('deleteSelected')}
  </Button>
  <Button variant="outline" size="sm" onClick={handleExport}>
    {t('exportSelected')}
  </Button>
</BulkActionBar>
```

> The `BulkActionBar` is auto-rendered by `ListingLayout` when `selectedCount > 0` and `bulkActions` is provided — you do **not** need to render it manually when using `ListingLayout`.

---

### FAQ Components (`src/components/faq/`)

#### FAQList

**File**: `FAQList.tsx`  
**Purpose**: Display FAQ list  
**Props**: `faqs`, `category`

#### FAQItem

**File**: `FAQItem.tsx`  
**Purpose**: Single FAQ accordion item  
**Props**: `faq`, `expanded`, `onToggle`

---

### Homepage Components (`src/components/homepage/`)

#### HeroSection

**File**: `HeroSection.tsx`  
**Purpose**: Homepage hero banner  
**Props**: `title`, `description`, `image`, `cta`

#### FeaturedProducts

**File**: `FeaturedProducts.tsx`  
**Purpose**: Featured products slider  
**Props**: `products`, `title`

#### CategoryGrid

**File**: `CategoryGrid.tsx`  
**Purpose**: Category grid display  
**Props**: `categories`, `columns`

#### SectionCarousel

**File**: `SectionCarousel.tsx`  
**Purpose**: Generic reusable section carousel with optional background image, heading, description, "See All" link, and `HorizontalScroller` for scroll-snapping items.  
**Props**: `title`, `description?`, `backgroundImage?`, `seeAllHref?`, `items`, `renderItem`, `perView?`, `className?`

---

### Review Components (`src/components/reviews/`)

#### ReviewCard

**File**: `ReviewCard.tsx`  
**Purpose**: Displays a review with reviewer avatar (uses `generateInitials` from `@/helpers`), name with profile link, verified badge, rating star badge, comment, item link, and optional thumbnail images.  
**Props**: `review: ReviewDocument`, `className?`  
**i18n**: `useTranslations("reviews")` — keys: `anonymous`, `verified`, `viewItem`, `moreImages`, `reviewImageAlt`

---

### Product Components (`src/components/products/`)

#### ProductActions

**File**: `ProductActions.tsx`  
**Purpose**: Add-to-cart, buy-now, and wishlist actions with desktop layout and mobile sticky bar.  
**Props**: `product`, `className?`

#### ProductFeatureBadges

**File**: `ProductFeatureBadges.tsx`  
**Purpose**: Feature badges (featured, free shipping, COD, etc.) rendered as colored pills.  
**Props**: `product`, `className?`

---

### UI Components (`src/components/ui/`)

#### SkipToMain

**File**: `SkipToMain.tsx`  
**Purpose**: Keyboard-only skip-navigation link for a11y. Hidden by default (`sr-only`), appears on Tab focus as a fixed pill in the top-left corner linking to `#main-content`.  
**i18n**: `useTranslations("a11y")` — key: `skipToContent`

---

### Error Handling Components

#### ErrorBoundary

**File**: `ErrorBoundary.tsx`  
**Purpose**: React error boundary  
**Props**: `fallback`, `onError`

---

### Layout Client

#### LayoutClient

**File**: `LayoutClient.tsx`  
**Purpose**: Client-side layout wrapper with providers  
**Props**: `children`

---

### Password Strength Indicator

#### PasswordStrengthIndicator

**File**: `PasswordStrengthIndicator.tsx`  
**Purpose**: Visual password strength indicator  
**Props**: `password`, `requirements`

---

### Product Components (`src/components/products/`)

#### ProductReviews

**File**: `ProductReviews.tsx`  
**Purpose**: Displays paginated product reviews, rating summary, and a write-review form for authenticated verified buyers.

**Props**:

| Prop        | Type     | Description                   |
| ----------- | -------- | ----------------------------- |
| `productId` | `string` | Firestore product document ID |

**Sections rendered**:

1. **WriteReviewForm** — sign-in prompt when unauthenticated; interactive star picker + title field + comment textarea when logged in. Submits via `reviewService.create()`. Surfaces inline `<Alert>` errors for:
   - HTTP 403 → `products.reviewFormPurchaseRequired` (only verified buyers may review)
   - HTTP 400 → `products.reviewFormAlreadyReviewed`
   - Other → `useMessage().showError` toast
2. **Rating summary** — average star rating + total count
3. **Review list** — paginated list of approved reviews with verified-buyer badge, helpful vote count, and relative timestamp

**Anchor**: `<section id="write-review">` — use `#write-review` hash in links/navigation to scroll directly to the form.

**i18n namespace**: `products` (keys prefixed `reviewForm*`)

**Purchase gate**: enforced server-side in `POST /api/reviews` via `orderRepository.hasUserPurchased()`. The UI surfaces the 403 response; no duplicate client-side check is needed.

---

## 10. Feature Modules

**Location**: `src/features/`  
**Import**: `import { ComponentName, useHook } from '@/features/<name>'`

Each feature module is a **vertically-sliced, self-contained unit**. It owns its components, hooks, types, constants, and feature-specific utils — all accessible via a single barrel `index.ts`.

### Directory Conventions

```
src/features/<name>/
  components/    ← all UI components for this feature
  hooks/         ← data-fetching & state hooks for this feature
  types/         ← TypeScript interfaces specific to this feature
  constants/     ← sort options, status tabs, config enums for this feature
  utils/         ← mappers, formatters used only by this feature (optional)
  index.ts       ← public barrel — only export what pages / other callers need
```

### Current Feature Modules

| Module       | Path                       | Key exports                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `products`   | `src/features/products/`   | `ProductCard`, `ProductGrid`, `ProductFilters`, `ProductInfo`, `useProducts`                                                                                                                                                                                                                                                                                          |
| `auth`       | `src/features/auth/`       | `LoginForm`, `RegisterForm`, `useLogin`, `useRegister`                                                                                                                                                                                                                                                                                                                |
| `orders`     | `src/features/orders/`     | `OrderCard`, `OrderTable`, `OrderStatusBadge`                                                                                                                                                                                                                                                                                                                         |
| `cart`       | `src/features/cart/`       | `CartDrawer`, `CartItem`, `CartSummary`, `useCart`                                                                                                                                                                                                                                                                                                                    |
| `auctions`   | `src/features/auctions/`   | `AuctionCard`, `BidForm`, `BidHistory`, `useRealtimeBids`                                                                                                                                                                                                                                                                                                             |
| `reviews`    | `src/features/reviews/`    | `ReviewCard`, `ReviewForm`, `StarRating`                                                                                                                                                                                                                                                                                                                              |
| `search`     | `src/features/search/`     | `SearchResultsSection`, `SearchFilters`                                                                                                                                                                                                                                                                                                                               |
| `blog`       | `src/features/blog/`       | `BlogCard`, `BlogContent`                                                                                                                                                                                                                                                                                                                                             |
| `categories` | `src/features/categories/` | `CategoryCard`, `CategoryBreadcrumb`                                                                                                                                                                                                                                                                                                                                  |
| `admin`      | `src/features/admin/`      | `AdminPageHeader`, `AdminFilterBar`, `DataTable`, `useAdminStats`                                                                                                                                                                                                                                                                                                     |
| `seller`     | `src/features/seller/`     | `SellerProductTable`, `SellerOrderTable`, `SellerStoreView`, `SellerAuctionsView`, `useSellerStore`, `useSellerProducts`, `useSellerOrders`                                                                                                                                                                                                                           |
| `user`       | `src/features/user/`       | `ProfileHeader`, `AddressCard`, `SessionItem`, `useProfile`, `useAddresses`                                                                                                                                                                                                                                                                                           |
| `events`     | `src/features/events/`     | `EventCard`, `PollVotingSection`, `SurveyEventSection`, `FeedbackEventSection`, `EventLeaderboard`, `EventStatusBadge`, `EventStatsBanner`, `EventFormDrawer`, `EntryReviewDrawer`, `SurveyFieldBuilder`, `useEvents`, `useEvent`, `useEventEntries`, `useEventStats`, `useCreateEvent`, `useUpdateEvent`, `useDeleteEvent`, `useChangeEventStatus`, `useReviewEntry` |
| `stores`     | `src/features/stores/`     | `StoreCard`, `StoresListView`, `StoreHeader`, `StoreNavTabs`, `StoreProductsView`, `StoreAuctionsView`, `StoreReviewsView`, `StoreAboutView`, `useStores`, `useStoreBySlug`, `useStoreProducts`, `useStoreAuctions`, `useStoreReviews`                                                                                                                                |

> **Migration note**: During the gradual migration, some of the above components may still live under `src/components/<feature>/`. They are accessible from `@/components` until migrated to their feature module folder. New code always goes under `src/features/<name>/`.

### Import Rules

```tsx
// Page composing two features + a shared primitive
import { ProductGrid, useProducts } from "@/features/products";
import { CartButton } from "@/features/cart";
import { Button } from "@/components"; // Tier 1
import { ROUTES } from "@/constants"; // Tier 1

// Feature component — Tier 1 only, NO cross-feature imports
import { Card, Badge } from "@/components"; // ✅
import { formatCurrency } from "@/utils"; // ✅
import { CartButton } from "@/features/cart"; // ❌
```

### Feature `index.ts` Standard

```typescript
// src/features/products/index.ts
export * from "./components";
export * from "./hooks";
export * from "./types";
export * from "./constants";
// do NOT re-export Tier 1 or infrastructure modules here
```

---

## 11. Pages (App Routes)

**Location**: `src/app/`

### Public Pages

#### Homepage

**Route**: `/`  
**File**: `app/page.tsx`  
**Purpose**: Main landing page with featured content

#### FAQs

**Route**: `/faqs`  
**File**: `app/faqs/page.tsx`  
**Purpose**: Frequently asked questions

#### Reviews

**Route**: `/reviews`  
**File**: `app/[locale]/reviews/page.tsx`  
**Purpose**: Public reviews showcase page  
**Component**: `ReviewsListView` from `@/features/reviews`  
**i18n**: `useTranslations("reviews")`

#### Blog

**Route**: `/blog`  
**File**: `app/[locale]/blog/page.tsx`  
**Purpose**: Public blog listing with category filter, sort, search, and pagination  
**Component**: `BlogListView` from `@/features/blog`  
**i18n**: `useTranslations("blog")`

#### Categories

**Route**: `/categories`  
**File**: `app/[locale]/categories/page.tsx`  
**Purpose**: Public categories listing  
**Component**: `CategoriesListView` from `@/features/categories`

#### Events

**Route**: `/events`  
**File**: `app/[locale]/events/page.tsx`  
**Purpose**: Public events listing with status/type filters, sort, search, and pagination  
**Component**: `EventsListView` from `@/features/events`  
**i18n**: `useTranslations("events")`, `useTranslations("eventTypes")`

---

### Static / Informational Pages

All static pages follow the same pattern: hero gradient header → content sections → footer links. They are server components using `getTranslations()` from `next-intl`.

| Route            | File                         | i18n namespace | Purpose                                     |
| ---------------- | ---------------------------- | -------------- | ------------------------------------------- |
| `/about`         | `app/about/page.tsx`         | `about`        | About LetItRip                              |
| `/contact`       | `app/contact/page.tsx`       | `contact`      | Contact form                                |
| `/help`          | `app/help/page.tsx`          | `help`         | Help centre overview                        |
| `/faqs`          | `app/faqs/page.tsx`          | `faq`          | FAQ list                                    |
| `/privacy`       | `app/privacy/page.tsx`       | `privacy`      | Privacy Policy                              |
| `/terms`         | `app/terms/page.tsx`         | `terms`        | Terms & Conditions                          |
| `/cookies`       | `app/cookies/page.tsx`       | `cookies`      | Cookie Policy                               |
| `/refund-policy` | `app/refund-policy/page.tsx` | `refundPolicy` | Refund & Returns Policy                     |
| `/seller-guide`  | `app/seller-guide/page.tsx`  | `sellerGuide`  | Seller onboarding guide                     |
| `/track`         | `app/track/page.tsx`         | `trackOrder`   | Track Order (sign-in prompt + how-it-works) |
| `/stores`        | `app/stores/page.tsx`        | `storesPage`   | Browse and explore seller storefronts       |
| `/promotions`    | `app/promotions/page.tsx`    | `promotions`   | Active promotions                           |

---

#### Login

**Route**: `/auth/login`  
**File**: `app/auth/login/page.tsx`  
**Purpose**: User login page

#### Register

**Route**: `/auth/register`  
**File**: `app/auth/register/page.tsx`  
**Purpose**: User registration page

#### Verify Email

**Route**: `/auth/verify-email`  
**File**: `app/auth/verify-email/page.tsx`  
**Purpose**: Email verification page

#### Forgot Password

**Route**: `/auth/forgot-password`  
**File**: `app/auth/forgot-password/page.tsx`  
**Purpose**: Password reset request

#### Reset Password

**Route**: `/auth/reset-password`  
**File**: `app/auth/reset-password/page.tsx`  
**Purpose**: Password reset with token

---

### User Dashboard Pages

#### Profile

**Route**: `/profile`  
**File**: `app/profile/page.tsx`  
**Purpose**: User profile management

#### My Orders

**Route**: `/user/orders`  
**File**: `app/user/orders/page.tsx`  
**Purpose**: User order history

#### Wishlist

**Route**: `/user/wishlist`  
**File**: `app/user/wishlist/page.tsx`  
**Purpose**: User wishlist with Products/Auctions/Categories/Stores tabs  
**Component**: `WishlistView`  
**i18n**: `useTranslations("wishlist")`

#### Addresses

**Route**: `/user/addresses`  
**File**: `app/user/addresses/page.tsx`  
**Purpose**: Manage shipping addresses

#### Settings

**Route**: `/user/settings`  
**File**: `app/user/settings/page.tsx`  
**Purpose**: User account settings

---

### Admin Dashboard Pages

#### Admin Dashboard

**Route**: `/admin`  
**File**: `app/admin/page.tsx`  
**Purpose**: Admin overview dashboard

#### User Management

**Route**: `/admin/users`  
**File**: `app/admin/users/[[...action]]/page.tsx`  
**Purpose**: Manage users with SideDrawer detail view  
**Features**: DataTable, tab navigation (all/active/banned/admins), search, role filter, role change, ban/unban, delete  
**URL Actions**: `/view/:uid`

#### Product Management

**Route**: `/admin/products`  
**File**: `app/admin/products/page.tsx`  
**Purpose**: Manage products

#### Order Management

**Route**: `/admin/orders`  
**File**: `app/admin/orders/page.tsx`  
**Purpose**: Manage orders

#### Category Management

**Route**: `/admin/categories`  
**File**: `app/admin/categories/page.tsx`  
**Purpose**: Manage categories

#### Coupon Management

**Route**: `/admin/coupons`  
**File**: `app/admin/coupons/page.tsx`  
**Purpose**: Manage coupons

#### FAQ Management

**Route**: `/admin/faqs`  
**File**: `app/admin/faqs/[[...action]]/page.tsx`  
**Purpose**: Manage FAQs with SideDrawer CRUD  
**Features**: DataTable, RichTextEditor, variable placeholders, create/edit/delete drawer  
**URL Actions**: `/add`, `/edit/:id`, `/delete/:id`

#### Carousel Management

**Route**: `/admin/carousel`  
**File**: `app/admin/carousel/page.tsx`  
**Purpose**: Manage carousel slides

#### Homepage Sections

**Route**: `/admin/sections`  
**File**: `app/admin/sections/[[...action]]/page.tsx`  
**Purpose**: Manage homepage sections with SideDrawer CRUD  
**Features**: DataTable, 11 section types, RichTextEditor, JSON config editor, order/enable toggle  
**URL Actions**: `/add`, `/edit/:id`, `/delete/:id`

#### Site Settings

**Route**: `/admin/settings`  
**File**: `app/admin/settings/page.tsx`  
**Purpose**: Site-wide settings

#### Review Management

**Route**: `/admin/reviews`  
**File**: `app/admin/reviews/[[...action]]/page.tsx`  
**Purpose**: Moderate product reviews with detail view  
**Features**: DataTable, status/rating/search filters, approve/reject/delete, bulk approve, star ratings  
**URL Actions**: `/view/:id`

#### Session Management

**Route**: `/admin/sessions`  
**File**: `app/admin/sessions/page.tsx`  
**Purpose**: View and revoke user sessions

---

### Seller Dashboard Pages

#### Seller Analytics

**Route**: `/seller`  
**File**: `app/seller/page.tsx`  
**Purpose**: Seller overview with sales analytics and quick links

#### Seller Products

**Route**: `/seller/products`  
**File**: `app/seller/products/page.tsx`  
**Purpose**: Manage seller's own product listings

#### Seller Orders

**Route**: `/seller/orders`  
**File**: `app/seller/orders/page.tsx`  
**Purpose**: View and manage orders for seller's products

#### Seller Payouts

**Route**: `/seller/payouts`  
**File**: `app/seller/payouts/page.tsx`  
**Purpose**: Payout history and request payouts

#### Seller Store Settings

**Route**: `/seller/store`  
**File**: `app/seller/store/page.tsx`  
**Purpose**: Manage public storefront profile — store name, description, category, logo, banner, return/shipping policy, vacation mode  
**Component**: `SellerStoreView`  
**Hook**: `useSellerStore()`  
**API**: `GET/PATCH /api/seller/store`

#### Seller Auctions

**Route**: `/seller/auctions`  
**File**: `app/seller/auctions/page.tsx`  
**Purpose**: Browse and manage the seller's auction listings  
**Component**: `SellerAuctionsView`

#### Seller Addresses

**Route**: `/seller/addresses`  
**File**: `app/[locale]/seller/addresses/page.tsx`  
**Purpose**: Seller business/pickup address management  
**Component**: `SellerAddressesView`  
**i18n**: `useTranslations("sellerAddresses")`

---

### Stores Directory Pages

#### Stores Listing

**Route**: `/stores`  
**File**: `app/stores/page.tsx`  
**Purpose**: Public directory of seller storefronts — search by name or category, paginated card grid  
**Component**: `StoresListView`  
**i18n**: `storesPage`

#### Store Storefront (Layout)

**Route**: `/stores/[storeSlug]`  
**File**: `app/stores/[storeSlug]/layout.tsx`  
**Purpose**: Shared layout wrapping all storefront sub-pages; renders `StoreHeader` and `StoreNavTabs`  
**Redirect**: `/stores/[storeSlug]` (root) → `/stores/[storeSlug]/products`

#### Store Products

**Route**: `/stores/[storeSlug]/products`  
**File**: `app/stores/[storeSlug]/products/page.tsx`  
**Purpose**: Published product listings for the store  
**Component**: `StoreProductsView`

#### Store Auctions

**Route**: `/stores/[storeSlug]/auctions`  
**File**: `app/stores/[storeSlug]/auctions/page.tsx`  
**Purpose**: Active auction listings for the store  
**Component**: `StoreAuctionsView`

#### Store Reviews

**Route**: `/stores/[storeSlug]/reviews`  
**File**: `app/stores/[storeSlug]/reviews/page.tsx`  
**Purpose**: Aggregated buyer reviews with average rating and distribution  
**Component**: `StoreReviewsView`

#### Store About

**Route**: `/stores/[storeSlug]/about`  
**File**: `app/stores/[storeSlug]/about/page.tsx`  
**Purpose**: Store description, category, policies, and seller info  
**Component**: `StoreAboutView`

---

### Demo Pages

#### Demo Seed Manager

**Route**: `/demo/seed`  
**File**: `app/demo/seed/page.tsx`  
**Layout**: `app/demo/layout.tsx` (noindex metadata)  
**Purpose**: Development-only web interface for managing Firestore seed data  
**Features**:

- Collection selector (11 collections, 209 total documents)
- Load All / Load Selected / Delete All / Delete Selected actions
- Smart upsert (creates new or merges existing documents)
- ID-based deletion (only removes seed data, safe for other data)
- Real-time result display with detailed metrics (created/updated/deleted/skipped/errors)
- Returns 403 in production (`NODE_ENV !== 'development'`)
- Comprehensive [README](../src/app/demo/seed/README.md) with usage guide

---

### Error Pages

#### 404 Not Found

**Route**: `/not-found`  
**File**: `app/not-found.tsx`  
**Purpose**: 404 error page

#### 401 Unauthorized

**Route**: `/unauthorized`  
**File**: `app/unauthorized/page.tsx`  
**Purpose**: Unauthorized access page

#### Error

**Route**: `/error`  
**File**: `app/error.tsx`  
**Purpose**: Generic error boundary page

#### Global Error

**Route**: `/global-error`  
**File**: `app/global-error.tsx`  
**Purpose**: Root error boundary

---

## 12. Types

**Location**: `src/types/`  
**Import**: `import type { TypeName } from '@/types'`

### Auth Types (`auth.ts`)

- `UserRole` - "user" | "seller" | "moderator" | "admin"
- `UserProfile` - User profile interface
- `ExtendedSession` - Session with user data
- `LoginCredentials` - Login form data
- `RegisterData` - Registration form data

### API Types (`api.ts`)

- `ApiResponse<T>` - Standard API response
- `PaginatedApiResponse<T>` - Paginated response
- `PaginationMeta` - Pagination metadata
- `CommonQueryParams` - Common query parameters
- `ProductListQuery` - Product list query parameters
- `ProductCreateRequest` - Product creation payload
- `ProductUpdateRequest` - Product update payload
- `CategoryListQuery` - Category query parameters
- `CategoryCreateRequest` - Category creation payload
- `ReviewListQuery` - Review query parameters
- `ReviewCreateRequest` - Review creation payload
- `FAQListQuery` - FAQ query parameters
- `FAQCreateRequest` - FAQ creation payload
- `CarouselCreateRequest` - Carousel slide creation
- `HomepageSectionCreateRequest` - Homepage section creation
- `ApiErrorResponse` - Error response structure
- `MediaUploadRequest` - Media upload payload
- `MediaUploadResponse` - Upload response

---

## 13. API Endpoints

**Location**: `src/app/api/`

### Authentication API

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify-email` - Verify email
- `GET /api/auth/verify-email` - Verify email via token
- `POST /api/auth/send-verification` - Resend verification email
- `POST /api/auth/resend-verification` - Resend verification (legacy)
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user

### User API

- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/:id/profile` - Get public profile
- `POST /api/user/change-password` - Change password (authenticated)

### Profile API

- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/avatar` - Update avatar
- `PUT /api/profile/password` - Change password
- `POST /api/profile/add-phone` - Validate and check phone number availability
- `POST /api/profile/verify-phone` - Verify phone and update Firestore flag

### Product API

- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/reviews` - Get product reviews

### Order API

- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order (admin)
- `PUT /api/orders/:id/status` - Update order status

### Review API

- `GET /api/reviews` - List reviews
- `GET /api/reviews/:id` - Get review
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/vote` - Vote on review

### Category API

- `GET /api/categories` - List categories
- `GET /api/categories/tree` - Get category tree
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Coupon API

- `GET /api/coupons` - List coupons (admin)
- `GET /api/coupons/validate/:code` - Validate coupon
- `POST /api/coupons` - Create coupon (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)

### FAQ API

- `GET /api/faqs` - List FAQs
- `GET /api/faqs/:id` - Get FAQ
- `POST /api/faqs` - Create FAQ (admin)
- `PUT /api/faqs/:id` - Update FAQ (admin)
- `DELETE /api/faqs/:id` - Delete FAQ (admin)
- `POST /api/faqs/:id/vote` - Vote on FAQ

### Carousel API

- `GET /api/carousel` - Get carousel slides
- `POST /api/carousel` - Create slide (admin)
- `PUT /api/carousel/:id` - Update slide (admin)
- `PUT /api/carousel/reorder` - Reorder slides (admin)
- `DELETE /api/carousel/:id` - Delete slide (admin)

### Homepage Sections API

- `GET /api/homepage-sections` - Get homepage sections
- `POST /api/homepage-sections` - Create section (admin)
- `PUT /api/homepage-sections/:id` - Update section (admin)
- `PUT /api/homepage-sections/reorder` - Reorder sections (admin)
- `DELETE /api/homepage-sections/:id` - Delete section (admin)

### Site Settings API

- `GET /api/settings` - Get site settings
- `PUT /api/settings` - Update site settings (admin)

### Admin API

- `GET /api/admin/dashboard` - Get admin dashboard statistics (admin/moderator)
- `GET /api/admin/users` - List users with search, role filter, disabled filter (admin/moderator)
- `PATCH /api/admin/users/:uid` - Update user role, disabled status, displayName (admin)
- `DELETE /api/admin/users/:uid` - Delete user (admin)
- `GET /api/admin/sessions` - List all sessions with user details and stats (admin/moderator)

### Media API

- `POST /api/media/upload` - Upload file to Firebase Cloud Storage (authenticated)
- `POST /api/media/crop` - Crop an image using `sharp` (authenticated)
- `POST /api/media/trim` - Trim a video using `ffmpeg` (authenticated)

### Session API

- `GET /api/sessions` - List all sessions (admin)
- `GET /api/sessions/user/:userId` - Get user sessions (admin)
- `GET /api/sessions/me` - Get my sessions
- `DELETE /api/sessions/:id` - Revoke session
- `DELETE /api/sessions/user/:userId` - Revoke all user sessions (admin)

### Upload API

- `POST /api/upload` - Upload file to Firebase Storage

### Seller Store API

- `GET /api/seller/store` — Get the authenticated seller's store profile (auth: seller/admin)
- `PATCH /api/seller/store` — Update store settings; auto-generates `storeSlug` from `storeName` when none exists (auth: seller/admin)

### Stores API (Public Storefront Directory)

- `GET /api/stores` — Paginated list of active seller storefronts; supports `q`, `sorts`, `page`, `pageSize`
- `GET /api/stores/[storeSlug]` — Public store profile by slug
- `GET /api/stores/[storeSlug]/products` — Published products for a store; supports `sorts`, `page`, `pageSize`
- `GET /api/stores/[storeSlug]/auctions` — Active auctions for a store; supports `sorts`, `page`, `pageSize`
- `GET /api/stores/[storeSlug]/reviews` — Aggregated reviews for a store with `averageRating`, `totalReviews`, `ratingDistribution`

### Demo API

- `POST /api/demo/seed` - Load or delete seed data (development only)

---

## 14. Lib Modules

**Location**: `src/lib/`

### API Client (`api-client.ts`)

**Purpose**: Centralized API request handler  
**Functions**:

- `apiClient.get<T>(url, options)` - GET request
- `apiClient.post<T>(url, data, options)` - POST request
- `apiClient.put<T>(url, data, options)` - PUT request
- `apiClient.patch<T>(url, data, options)` - PATCH request
- `apiClient.delete<T>(url, options)` - DELETE request

**Features**:

- Automatic token injection
- Error handling
- Request/response interceptors
- Retry logic
- Timeout handling

---

### API Response (`api-response.ts`)

**Purpose**: Standard API response formatters  
**Functions**:

- `success<T>(data, message?)` - Success response
- `error(message, errors?, code?)` - Error response
- `paginated<T>(data, pagination)` - Paginated response
- `created<T>(data, message?)` - Resource created response
- `updated<T>(data, message?)` - Resource updated response
- `deleted(message?)` - Resource deleted response

---

### Email Service (`email.ts`)

**Purpose**: Email sending with Resend  
**Functions**:

- `sendEmail(to, subject, html)` - Send email
- `sendVerificationEmail(to, token)` - Send verification
- `sendPasswordResetEmail(to, token)` - Send reset link
- `sendWelcomeEmail(to, name)` - Send welcome email
- `sendOrderConfirmation(to, order)` - Send order confirmation
- `sendContactEmail(params)` - Forward contact form submission to admin
- `sendNewProductSubmittedEmail(adminEmail, product)` - Notify admin of new product submission (fire-and-forget)
- `sendNewReviewNotificationEmail({ sellerEmail, adminEmail, reviewerName, productTitle, productId, rating, comment })` - Notify seller + admin when a review is submitted; deduplicates identical addresses (Phase 7.9)
- `sendSiteSettingsChangedEmail({ adminEmails, changedByEmail, changedFields })` - Notify all admin emails when site settings are changed via the PATCH API (Phase 7.9)

---

### Validation Schemas (`src/lib/validation/schemas.ts`)

**Purpose**: Central Zod schema library — validates all API request bodies and shared data shapes.

**URL Schemas**:

- `urlSchema` — generic URL, max 2048 chars. No domain restriction.
- `mediaUrlSchema` — URL restricted to approved CDN domains (`firebasestorage.googleapis.com`, `storage.googleapis.com`, `res.cloudinary.com`, `images.unsplash.com`, `cdn.letitrip.in`). Use for product images/videos.

**Key exported schemas** (all accept the described shape via `safeParse`):

- `productCreateSchema` — title/description prohibited-words check + auction validation
- `productUpdateSchema` — partial of base; status transitions enforced separately in route
- `videoSchema` — url (must be `.mp4/.webm/.ogg/.mov/.m4v`), thumbnail, duration, trim range
- `carouselCreateSchema` — includes `.refine()` for 9×9 grid-card overlap detection
- `homepageSectionCreateSchema` — includes `.refine()` for `featured`/`trending` `maxItems > 0`
- `cropDataSchema` — includes `.refine()` for aspect-ratio tolerance (2%)
- `reviewCreateSchema`, `reviewUpdateSchema`
- `categoryCreateSchema`, `categoryUpdateSchema`
- `faqCreateSchema`, `faqUpdateSchema`
- `homepageSectionsReorderSchema`, `carouselReorderSchema`
- `siteSettingsUpdateSchema`
- `userAddressCreateSchema`, `userAddressUpdateSchema`
- `cropDataSchema`, `trimDataSchema`, `thumbnailDataSchema`

**Shared primitives**:

- `objectIdSchema` — non-empty string max 128
- `dateStringSchema` — ISO 8601 string
- `paginationSchema` — `page`, `limit` with coerced integers
- `sieveQuerySchema` — `filters`, `sorts`, `page`, `pageSize`

**Exported helpers**:

- `validateRequestBody(schema, body)` — wraps `safeParse`, returns `{ success, data }` or `{ success, errors }`
- `formatZodErrors(errors)` — formats `ZodError.format()` for API responses

---

### Token Service (`tokens.ts`)

**Purpose**: Token generation and validation  
**Functions**:

- `generateToken(length)` - Generate random token
- `generateSecureToken()` - Cryptographically secure token
- `hashToken(token)` - Hash token for storage
- `verifyToken(token, hash)` - Verify token
- `createEmailVerificationToken(userId, email)` - Create verification token
- `createPasswordResetToken(userId, email)` - Create reset token
- `validateEmailVerificationToken(token)` - Validate verification token
- `validatePasswordResetToken(token)` - Validate reset token

---

### Zod Error Map (`zod-error-map.ts`)

**Purpose**: Zod v4 global error map — replaces default machine-y messages with human-friendly strings from `ERROR_MESSAGES` constants.  
**Key exports**:

- `zodErrorMap(issue)` — maps Zod v4 issue codes to friendly `{ message: string }`. Handles `invalid_type`, `too_small`, `too_big`, `invalid_format`, `invalid_value`, `custom`.
- `setupZodErrorMap()` — calls `z.setErrorMap(zodErrorMap)` once (idempotent). Called by `src/i18n/request.ts` (server) and `<ZodSetup />` (client).

**Issue code mapping:**
| Zod v4 code | Condition | Message source |
|------------|-----------|----------------|
| `invalid_type` | input undefined/null | `ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD` |
| `too_small` | string, min ≤ 1 | `REQUIRED_FIELD` |
| `too_small` | string, min > 1 | `"Must be at least N characters"` |
| `too_big` | string | `"Must be at most N characters"` |
| `invalid_format` | email | `ERROR_MESSAGES.VALIDATION.INVALID_EMAIL` |
| `invalid_format` | url | `"Please enter a valid URL"` |
| `invalid_value` | enum | lists accepted values |
| `custom` | — | passes message through |

---

### Server Logger (`server-logger.ts`)

**Purpose**: Server-side logging with file persistence  
**Functions**:

- `logInfo(message, data?)` - Log info
- `logWarn(message, data?)` - Log warning
- `logError(message, error?)` - Log error
- `logDebug(message, data?)` - Log debug
- `logRequest(req, res)` - Log HTTP request

---

### Firebase Admin (`lib/firebase/admin.ts`)

**Purpose**: Firebase Admin SDK initialization  
**Exports**:

- `getAdminAuth()` - Get Firebase Auth admin
- `getAdminDb()` - Get Firestore admin
- `getAdminStorage()` - Get Storage admin
- `verifyIdToken(token)` - Verify Firebase ID token
- `createCustomToken(uid, claims?)` - Create custom token
- `setCustomUserClaims(uid, claims)` - Set user custom claims
- `revokeRefreshTokens(uid)` - Revoke user tokens

---

### Firebase Client (`lib/firebase/config.ts`)

**Purpose**: Firebase Client SDK initialization  
**Exports**:

- `auth` - Firebase Auth instance
- `db` - Firestore instance
- `storage` - Storage instance
- `app` - Firebase App instance

---

### Firebase Auth Helpers (`lib/firebase/auth-helpers.ts`)

**Purpose**: Client-side authentication helpers  
**Functions**:

- `signInWithEmail(email, password)` - Email/password login
- `signUpWithEmail(email, password)` - Email/password registration
- `signInWithGoogle()` - Google OAuth login
- `signInWithApple()` - Apple OAuth login
- `signOut()` - Logout
- `sendEmailVerification()` - Send verification email
- `sendPasswordReset(email)` - Send password reset email
- `confirmPasswordReset(code, newPassword)` - Confirm password reset

---

### Security Utilities (`lib/security/`)

#### CSRF Protection (`csrf.ts`)

**Functions**:

- `generateCsrfToken()` - Generate CSRF token
- `validateCsrfToken(token)` - Validate CSRF token

#### Rate Limiting (`rate-limit.ts`)

**Functions**:

- `createRateLimiter(options)` - Create rate limiter
- `checkRateLimit(key)` - Check if rate limited

#### Input Sanitization (`sanitize.ts`)

**Functions**:

- `sanitizeHtml(html)` - Sanitize HTML
- `sanitizeInput(input)` - Sanitize text input
- `escapeHtml(text)` - Escape HTML entities

---

### Validation Library (`lib/validation/`)

#### Auth Validators (`auth-validation.ts`)

**Functions**:

- `validateEmail(email)` - Validate email
- `validatePassword(password)` - Validate password
- `validatePhoneNumber(phone)` - Validate phone

#### Product Validators (`product-validation.ts`)

**Functions**:

- `validateProductData(data)` - Validate product data
- `validatePrice(price)` - Validate price
- `validateStock(stock)` - Validate stock

---

### Error Classes (`lib/errors/`)

#### App Error (`app-error.ts`)

**Class**: `AppError extends Error`  
**Purpose**: Base error class with status code

#### API Error (`api-error.ts`)

**Class**: `ApiError extends AppError`  
**Purpose**: API-specific errors

#### Validation Error (`validation-error.ts`)

**Class**: `ValidationError extends AppError`  
**Purpose**: Validation errors with field details

#### Auth Error (`auth-error.ts`)

**Class**: `AuthError extends AppError`  
**Purpose**: Authentication/authorization errors

#### Database Error (`database-error.ts`)

**Class**: `DatabaseError extends AppError`  
**Purpose**: Database operation errors

---

### Monitoring (`lib/monitoring/`)

#### Error Tracker (`error-tracker.ts`)

**Functions**:

- `captureException(error, context?)` - Capture error
- `captureMessage(message, level?)` - Capture message

#### Performance Monitoring (`performance.ts`)

**Functions**:

- `startTrace(name)` - Start performance trace
- `stopTrace(trace)` - Stop performance trace
- `recordMetric(name, value)` - Record custom metric

---

## 15. Client Service Layer (`@/services`)

**Location**: `src/services/`  
**Import**: `import { productService, cartService, ... } from '@/services'`  
**Rule**: Never call `apiClient` directly in components -- always go through a service function (Rule 20).

| Service                   | Key Methods                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `addressService`          | `list()`, `getById(id)`, `create(data)`, `update(id,data)`, `delete(id)`                                                                                                                                                                                                                                                                                                                                                             |
| `adminService`            | `getDashboardStats()`, `listSessions(q?)`, `listOrders(q?)`, `updateOrder(id,data)`, `getAnalytics()`, `listUsers(q?)`, `updateUser(uid,data)`, `deleteUser(uid)`, `listBids(q?)`, `listBlog(q?)`, `createBlogPost(data)`, `updateBlogPost(id,data)`, `deleteBlogPost(id)`, `listPayouts(q?)`, `updatePayout(id,data)`, `listAdminProducts(q?)`, `createAdminProduct(data)`, `updateAdminProduct(id,data)`, `deleteAdminProduct(id)` |
| `authService`             | `login(email,pw)`, `register(data)`, `logout()`                                                                                                                                                                                                                                                                                                                                                                                      |
| `bidService`              | `create(data)`, `listByProduct(productId)`, `getById(id)`                                                                                                                                                                                                                                                                                                                                                                            |
| `blogService`             | `list(params?)`, `getBySlug(slug)`                                                                                                                                                                                                                                                                                                                                                                                                   |
| `carouselService`         | `list()`, `create(data)`, `update(id,data)`, `delete(id)`                                                                                                                                                                                                                                                                                                                                                                            |
| `cartService`             | `get()`, `addItem(data)`, `removeItem(itemId)`, `updateItem(itemId,data)`                                                                                                                                                                                                                                                                                                                                                            |
| `categoryService`         | `list(params?)`, `getBySlug(slug)`, `create(data)`, `update(id,data)`, `delete(id)`                                                                                                                                                                                                                                                                                                                                                  |
| `checkoutService`         | `placeOrder(data)`, `createPaymentOrder(data)`, `verifyPayment(data)`                                                                                                                                                                                                                                                                                                                                                                |
| `authEventService`        | `initAuthEvent()` — Creates RTDB `auth_events/{uuid}` node + per-event custom token (no session required). Used internally by `useGoogleLogin` / `useAppleLogin`.                                                                                                                                                                                                                                                                    |
| `paymentEventService`     | `initPaymentEvent(razorpayOrderId)` — Creates RTDB `payment_events/{razorpayOrderId}` node + per-event custom token (session required). Call after `createPaymentOrder`; then pass the returned `{ eventId, customToken }` to `usePaymentEvent.subscribe()`.                                                                                                                                                                         |
| `contactService`          | `send(data)`                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `demoService`             | `seed(payload)` — triggers the demo seed API endpoint                                                                                                                                                                                                                                                                                                                                                                                |
| `couponService`           | `list(sieveQuery?)`, `create(data)`, `update(id,data)`, `delete(id)`, `validate({code,orderTotal?})`                                                                                                                                                                                                                                                                                                                                 |
| `eventService`            | `list(params?)`, `getById(id)`, `enter(id,data)`, `leaderboard(id)`                                                                                                                                                                                                                                                                                                                                                                  |
| `faqService`              | `list(params?)`, `vote(id,data)`, `create(data)`, `update(id,data)`, `delete(id)`                                                                                                                                                                                                                                                                                                                                                    |
| `homepageSectionsService` | `list()`, `update(id,data)`                                                                                                                                                                                                                                                                                                                                                                                                          |
| `mediaService`            | `upload(formData)`, `crop(data)`, `trim(data)`                                                                                                                                                                                                                                                                                                                                                                                       |
| `notificationService`     | `list(params?)`, `markRead(id)`, `markAllRead()`, `delete(id)`, `getUnreadCount()`                                                                                                                                                                                                                                                                                                                                                   |
| `newsletterService`       | `subscribe(data)` — POST to `/api/newsletter/subscribe` with `{ email, source? }`                                                                                                                                                                                                                                                                                                                                                    |
| `orderService`            | `list(params?)`, `getById(id)`                                                                                                                                                                                                                                                                                                                                                                                                       |
| `productService`          | `list(params?)`, `getById(id)`, `getFeatured()`, `listAuctions(params?)`, `create(data)`, `update(id,data)`, `delete(id)`                                                                                                                                                                                                                                                                                                            |
| `profileService`          | `get()`, `update(data)`, `getPublic(userId)`                                                                                                                                                                                                                                                                                                                                                                                         |
| `promotionsService`       | `list()`                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `realtimeTokenService`    | `getToken()` — fetches Firebase Realtime DB custom token from `/api/realtime/token`                                                                                                                                                                                                                                                                                                                                                  |
| `reviewService`           | `list(params?)`, `listAdmin(sieveQuery?)`, `getByProduct(productId)`, `create(data)`, `update(id,data)`, `delete(id)`                                                                                                                                                                                                                                                                                                                |
| `searchService`           | `query(params)`                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `sellerService`           | `getAnalytics()`, `listProducts(uid)`, `listOrders(params?)`, `listPayouts(params?)`, `requestPayout(data)`, `getStore()`, `updateStore(data)`                                                                                                                                                                                                                                                                                       |
| `sessionService`          | `list()`, `revoke(id)`, `revokeAll()`                                                                                                                                                                                                                                                                                                                                                                                                |
| `storeService`            | `listStores(params?)`, `getBySlug(slug)`, `getProducts(slug, params?)`, `getAuctions(slug, params?)`, `getReviews(slug)`                                                                                                                                                                                                                                                                                                             |
| `siteSettingsService`     | `get()`, `update(data)`                                                                                                                                                                                                                                                                                                                                                                                                              |
| `wishlistService`         | `list()`, `add(productId)`, `remove(productId)`, `check(productId)`                                                                                                                                                                                                                                                                                                                                                                  |

---

## � In-Folder Documentation

For detailed documentation with usage examples, best practices, and contribution guidelines, see the comprehensive README files in each directory:

### Hooks Documentation

**[src/hooks/README.md](../src/hooks/README.md)** - Complete reference for all 30+ custom hooks

- Authentication hooks (useAuth, useLogin, useRegister, etc.)
- API hooks (useApiQuery, useApiMutation)
- Profile and session management hooks
- Form hooks (useForm, useFormState)
- Gesture hooks (useSwipe, useGesture, useLongPress)
- UI interaction hooks (useClickOutside, useKeyPress)
- Storage upload, messaging, and unsaved changes hooks
- **`useRealtimeEvent<TData>`** — Generic RTDB event bridge hook. All RTDB event subscriptions are built on this. Accepts `UseRealtimeEventConfig<TData>` with `type` (`RealtimeEventType.*`), `rtdbPath`, optional `timeoutMs`, `extractData`, and `messages`. Returns `{ status, error, data, subscribe, reset }`. Use `RealtimeEventType` and `RealtimeEventStatus` const objects (both exported from `@/hooks`) for all type/status comparisons.
- **`useAuthEvent`** — Thin domain wrapper over `useRealtimeEvent`. RTDB bridge for OAuth popup flows. Call `subscribe(eventId, customToken)` after `authEventService.initAuthEvent()`. States (via `RealtimeEventStatus`): `idle | subscribing | pending | success | failed | timeout`.
- **`usePaymentEvent`** — Thin domain wrapper over `useRealtimeEvent`. RTDB bridge for Razorpay payment outcomes. Call `subscribe(eventId, customToken)` after `paymentEventService.initPaymentEvent(razorpayOrderId)`. States (via `RealtimeEventStatus`): `idle | subscribing | pending | success | failed | timeout`. Returns `orderIds: string[] | null` on success.

### Utils Documentation

**[src/utils/README.md](../src/utils/README.md)** - Complete reference for all 80+ pure utility functions

- Validators (email, password, phone, URL, input)
- Formatters (date, number, string)
- Converters (type conversion, query strings, CSV)
- Event management (throttle, debounce, scroll/resize handlers)
- ID generators

### Helpers Documentation

**[src/helpers/README.md](../src/helpers/README.md)** - Complete reference for all 40+ business logic helpers

- Auth helpers (role checking, token management)
- Data helpers (array, object, pagination, sorting)
- UI helpers (style, color, animation)
- Helpers vs Utils comparison guide

### Components Documentation

**[src/components/README.md](../src/components/README.md)** - Complete reference for all 100+ React components

- UI components (Button, Card, Badge, Modal, etc.)
- Form components (Input, Select, Checkbox, etc.)
- Layout components (Header, Footer, Sidebar, etc.)
- Feedback components (Alert, Toast, Modal)
- Admin, auth, profile, homepage, and FAQ components
- Component best practices and styling standards

---

## �📝 Summary

This guide provides a complete reference for:

- ✅ **5 Singleton Classes** - Cache, Storage, Logger, EventBus, Queue
- ✅ **11 Constant Categories** - UI, Theme, Routes, API, Messages, SEO, etc.
- ✅ **25+ Custom Hooks** - Auth, API, Forms, Gestures, Admin, etc.
- ✅ **80+ Pure Functions** - Validators, Formatters, Converters, Events, ID Generators
- ✅ **40+ Helper Functions** - Auth, Data, UI (business logic)
- ✅ **20+ Snippets** - React hooks, API requests, Form validation, Performance
- ✅ **14 Repositories** - Complete data access layer with type-safe queries
- ✅ **14 Database Schemas** - Firestore collections with relationships and indices (incl. bids)
- ✅ **60+ Components** - UI, Forms, Layout, Admin, Auth, Profile, etc. (incl. SideDrawer)
- ✅ **35+ Pages** - Public, Auth, User, Admin, Demo routes
- ✅ **Multiple Type Definitions** - Auth, API, Database types
- ✅ **50+ API Endpoints** - RESTful API with authentication (incl. demo seed, phone, sessions)
- ✅ **26 Client Services** - One service per domain (`@/services`) — `productService`, `cartService`, `orderService`, `adminService`, `sellerService`, etc.
- ✅ **20+ Lib Modules** - API client, Email, Firebase, Security, Validation, Errors, Monitoring

---

## 🔍 How to Use This Guide

1. **Find What You Need**: Use Ctrl+F to search for function/class names
2. **Check Import Path**: Each section shows the correct import statement
3. **See Parameters**: Function signatures show required parameters
4. **Understand Purpose**: Short descriptions explain what each item does
5. **Follow Patterns**: See how to use similar patterns across the codebase

---

---

## Firebase Functions (`functions/src/`)

### Scheduled Jobs

#### weeklyPayoutEligibility

**File**: `functions/src/jobs/weeklyPayoutEligibility.ts`  
**Schedule**: Weekly (Saturday 05:00 UTC)  
**Purpose**: Scans sellers with delivered orders since last payout, calculates eligible payout amount (5% platform commission deducted), and creates pending payout records.  
**Repository**: `functions/src/repositories/user.repository.ts` — `SellerPayoutDetails` interface, `findById` method

---

## 📚 Related Documentation

### Core Documentation

- [Coding Standards](../.github/copilot-instructions.md) - Full coding guidelines and mandatory rules
- [Changelog](./CHANGELOG.md) - Version history and recent changes
- [Quick Reference](./QUICK_REFERENCE.md) - Common patterns and shortcuts
- [Security](./SECURITY.md) - Security best practices

### In-Folder Documentation

- [Hooks README](../src/hooks/README.md) - Detailed hooks reference with examples
- [Utils README](../src/utils/README.md) - Detailed utils reference with examples
- [Helpers README](../src/helpers/README.md) - Detailed helpers reference with examples
- [Components README](../src/components/README.md) - Detailed components reference with examples

---

**Note**: This is a living document. Update it whenever you add new functions, classes, hooks, components, or pages.
