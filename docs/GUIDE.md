# 📖 Codebase Reference Guide (Annexure)

> **Complete Index of All Code, Snippets, Functions, Classes, Hooks, Components, and Database Schemas**

**Last Updated**: February 11, 2026  
**Status**: Comprehensive Reference for LetItRip.in Project

---

## 📑 Table of Contents

1. [Classes (Singletons)](#1-classes-singletons)
2. [Constants](#2-constants)
3. [Hooks](#3-hooks)
4. [Utils (Pure Functions)](#4-utils-pure-functions)
5. [Helpers (Business Logic)](#5-helpers-business-logic)
6. [Snippets (Reusable Pat
7. [Repositories (Data Access Layer)](#7-repositories-data-access-layer)
8. [Database Schemas](#8-database-schemas)
9. [Components](#9-components)
10. [Pages (App Routes)](#10-pages-app-routes)
11. [Types](#11-types)
12. [API Endpoints](#12-api-endpoints)
13. [Lib Modules](#13-lib-modules)

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
  - `gap` - Gap utilities (sm, md, lg, xl)
  - `padding` - Padding presets (xs, sm, md, lg, xl)
  - `margin` - Margin presets with bottom variants (xs, sm, md, lg, xl, bottom.sm/md/lg/xl)
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
- `NEWSLETTER` - Newsletter success (SUBSCRIBED)

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
**Purpose**: Manage user addresses  
**Returns**: `{ addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, loading }`

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

#### useUserSessions

**File**: `useSessions.ts`  
**Purpose**: View sessions for specific user  
**Parameters**: `(userId)`  
**Returns**: `{ sessions, loading, error }`

#### useMySessions (deprecated)

**File**: `useSessions.ts`  
**Purpose**: View current user's sessions  
**Returns**: `{ sessions, loading, error }`

#### useRevokeSession

**File**: `useSessions.ts`  
**Purpose**: Revoke a session (admin)  
**Returns**: `{ revoke, loading, error }`

#### useRevokeMySession (deprecated)

**File**: `useSessions.ts`  
**Purpose**: Revoke own session  
**Returns**: `{ revoke, loading, error }`

#### useRevokeUserSessions

**File**: `useSessions.ts`  
**Purpose**: Revoke all sessions for a user (admin)  
**Returns**: `{ revokeAll, loading, error }`

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

---

### UI Interaction Hooks

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

### Storage Upload Hook

#### useStorageUpload

**File**: `useStorageUpload.ts`  
**Purpose**: Upload files to Firebase Storage  
**Returns**: `{ upload, uploading, progress, error, url }`

**Options**: `maxSize`, `allowedTypes`, `path`, `generateThumbnail`

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

## 4. Utils (Pure Functions)

**Location**: `src/utils/`  
**Import**: `import { functionName } from '@/utils'`

### Validators (`src/utils/validators/`)

#### Email Validators (`email.validator.ts`)

- `isValidEmail(email: string): boolean` - Validate email format
- `isValidEmailDomain(email: string, allowedDomains: string[]): boolean` - Check domain whitelist
- `normalizeEmail(email: string): string` - Normalize email (lowercase, trim)
- `isDisposableEmail(email: string): boolean` - Check if disposable email service

#### Password Validators (`password.validator.ts`)

- `meetsPasswordRequirements(password: string, requirements: PasswordRequirements): boolean` - Check password requirements
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

#### Number Formatters (`number.formatter.ts`)

- `formatCurrency(amount: number, currency?: string, locale?: string): string` - Currency formatting
- `formatNumber(num: number, locale?: string): string` - Number with locale separators
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

## 8. Database Schemas

**Location**: `src/db/schema/`  
**Import**: `import { SchemaName, COLLECTION_NAME } from '@/db/schema'`

### Schema Field Constants

**File**: `field-names.ts`  
**Import**: `import { USER_FIELDS, SCHEMA_DEFAULTS, COMMON_FIELDS } from '@/db/schema'`  
**Purpose**: Centralized string constants for ALL Firestore document field names. Use these instead of hardcoded strings in queries, serializers, and update operations.

**Available constants**:

| Constant                  | Collection       | Key fields                                                                                                                                                                                                  |
| ------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USER_FIELDS`             | users            | UID, EMAIL, ROLE, DISPLAY_NAME, PHONE_NUMBER, PHONE_VERIFIED, PHOTO_URL, AVATAR_METADATA, PASSWORD_HASH, EMAIL_VERIFIED, DISABLED, PUBLIC_PROFILE, STATS, METADATA, AVATAR.\*, PROFILE.\*, STAT.\*, META.\* |
| `TOKEN_FIELDS`            | tokens           | ID, USER_ID, EMAIL, TOKEN, EXPIRES_AT, CREATED_AT, USED, USED_AT                                                                                                                                            |
| `PRODUCT_FIELDS`          | products         | ID, TITLE, DESCRIPTION, CATEGORY, PRICE, SELLER_ID, STATUS, IMAGES, VIDEO, FEATURED, TAGS, IS_AUCTION, STATUS_VALUES.\*                                                                                     |
| `ORDER_FIELDS`            | orders           | ID, PRODUCT_ID, USER_ID, QUANTITY, TOTAL_PRICE, STATUS, PAYMENT_STATUS, SHIPPING_ADDRESS, STATUS_VALUES.\*, PAYMENT_STATUS_VALUES.\*                                                                        |
| `REVIEW_FIELDS`           | reviews          | ID, PRODUCT_ID, USER_ID, RATING, TITLE, COMMENT, STATUS, HELPFUL_COUNT, VERIFIED, FEATURED, STATUS_VALUES.\*                                                                                                |
| `BID_FIELDS`              | bids             | ID, PRODUCT_ID, USER_ID, BID_AMOUNT, STATUS, IS_WINNING, BID_DATE, STATUS_VALUES.\*                                                                                                                         |
| `SESSION_FIELDS`          | sessions         | ID, USER_ID, DEVICE_INFO, LOCATION, IS_ACTIVE, LAST_ACTIVITY, EXPIRES_AT, REVOKED_AT, REVOKED_BY, DEVICE.\*, LOC.\*                                                                                         |
| `CAROUSEL_FIELDS`         | carouselSlides   | ID, TITLE, ORDER, ACTIVE, MEDIA, LINK, MOBILE_MEDIA, CARDS                                                                                                                                                  |
| `CATEGORY_FIELDS`         | categories       | ID, NAME, SLUG, DESCRIPTION, ROOT_ID, PARENT_IDS, CHILDREN_IDS, TIER, PATH, ORDER, IS_LEAF, METRICS, METRIC.\*                                                                                              |
| `COUPON_FIELDS`           | coupons          | ID, CODE, NAME, TYPE, DISCOUNT, USAGE, VALIDITY, TYPE_VALUES.\*, USAGE_FIELDS.\*, VALIDITY_FIELDS.\*                                                                                                        |
| `FAQ_FIELDS`              | faqs             | ID, QUESTION, ANSWER, CATEGORY, ORDER, TAGS, STATS, STAT.\*, SEO_FIELDS.\*, CATEGORY_VALUES.\*                                                                                                              |
| `HOMEPAGE_SECTION_FIELDS` | homepageSections | ID, TYPE, ORDER, ENABLED, CONFIG, TYPE_VALUES.\*                                                                                                                                                            |
| `SITE_SETTINGS_FIELDS`    | siteSettings     | ID, SITE_NAME, MOTTO, LOGO, CONTACT, CONTACT_FIELDS.\*, SOCIAL_LINKS, EMAIL_SETTINGS, SEO, FEATURES, LEGAL_PAGES                                                                                            |
| `COMMON_FIELDS`           | (shared)         | ID, CREATED_AT, UPDATED_AT, CREATED_BY, STATUS, IS_ACTIVE, ORDER                                                                                                                                            |
| `SCHEMA_DEFAULTS`         | (defaults)       | USER_ROLE (`"user"`), CURRENCY (`"INR"`), UNKNOWN_USER_AGENT, UNKNOWN_USER, ANONYMOUS_USER, DEFAULT_DISPLAY_NAME, ADMIN_EMAIL                                                                               |

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
**Props**: `variant`, `size`, `fullWidth`, `disabled`, `loading`, `leftIcon`, `rightIcon`

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
**Types**: `text`, `email`, `password`, `number`, `tel`, `url`  
**Props**: `type`, `placeholder`, `disabled`, `error`, `leftIcon`, `rightIcon`

#### Select

**File**: `Select.tsx`  
**Purpose**: Select dropdown  
**Props**: `options`, `value`, `onChange`, `placeholder`, `disabled`, `error`, `searchable`

#### Textarea

**File**: `Textarea.tsx`  
**Purpose**: Multiline text input  
**Props**: `placeholder`, `rows`, `maxLength`, `disabled`, `error`, `resize`

#### Checkbox

**File**: `Checkbox.tsx`  
**Purpose**: Checkbox input  
**Props**: `label`, `checked`, `onChange`, `disabled`, `indeterminate`

#### Radio

**File**: `Radio.tsx`  
**Purpose**: Radio button  
**Props**: `label`, `value`, `checked`, `onChange`, `disabled`

#### Switch

**File**: `Switch.tsx`  
**Purpose**: Toggle switch  
**Props**: `checked`, `onChange`, `disabled`, `label`

#### FileUpload

**File**: `FileUpload.tsx`  
**Purpose**: File upload input  
**Props**: `accept`, `multiple`, `maxSize`, `onChange`, `preview`

#### DatePicker

**File**: `DatePicker.tsx`  
**Purpose**: Date selection input  
**Props**: `value`, `onChange`, `minDate`, `maxDate`, `format`

---

### FormField Component

**File**: `FormField.tsx`  
**Purpose**: Form field wrapper with label, error, and help text  
**Props**: `label`, `error`, `helpText`, `required`, `children`

---

### Typography Components (`src/components/typography/`)

#### Heading

**File**: `Heading.tsx`  
**Purpose**: Heading component (h1-h6)  
**Levels**: `1`, `2`, `3`, `4`, `5`, `6`  
**Props**: `level`, `as`, `children`, `className`

#### Text

**File**: `Text.tsx`  
**Purpose**: Body text component  
**Variants**: `body`, `small`, `caption`, `lead`  
**Props**: `variant`, `weight`, `color`, `align`, `truncate`

#### Link

**File**: `Link.tsx`  
**Purpose**: Next.js Link wrapper  
**Props**: `href`, `external`, `underline`, `color`, `disabled`

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

#### SearchBar

**File**: `SearchBar.tsx`  
**Purpose**: Search input with suggestions  
**Props**: `placeholder`, `onSearch`, `suggestions`, `loading`

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

---

### Upload Components

#### AvatarUpload

**File**: `AvatarUpload.tsx`  
**Purpose**: Profile photo upload with cropping  
**Props**: `value`, `onChange`, `size`, `allowEdit`

#### AvatarDisplay

**File**: `AvatarDisplay.tsx`  
**Purpose**: Display user avatar  
**Props**: `user`, `size`, `fallback`, `showBadge`

---

### Modal Components (`src/components/modals/`)

#### ConfirmDeleteModal

**File**: `ConfirmDeleteModal.tsx`  
**Purpose**: Confirmation modal for deletions  
**Props**: `isOpen`, `onClose`, `onConfirm`, `title`, `message`

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
**Purpose**: Card-wrapped responsive grid of filter inputs for admin list pages  
**Props**: `children`, `columns` (`1 | 2 | 3 | 4`), `className`

#### DrawerFormFooter

**File**: `DrawerFormFooter.tsx`  
**Purpose**: Cancel + Save/Delete button pair for SideDrawer forms  
**Props**: `onCancel`, `onSubmit`, `onDelete`, `submitLabel`, `deleteLabel`, `cancelLabel`, `isLoading`, `isSubmitDisabled`, `className`

#### DataTable

**File**: `DataTable.tsx`  
**Purpose**: Data table with pagination, striped rows, sticky header, mobile card view  
**Props**: `columns`, `data`, `loading`, `pageSize`, `striped`, `stickyHeader`

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

## 10. Pages (App Routes)

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

---

### Authentication Pages

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
**Purpose**: User wishlist

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

## 11. Types

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

## 12. API Endpoints

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
- `POST /api/media/crop` - Crop an image (authenticated, not yet implemented)
- `POST /api/media/trim` - Trim a video (authenticated, not yet implemented)

### Session API

- `GET /api/sessions` - List all sessions (admin)
- `GET /api/sessions/user/:userId` - Get user sessions (admin)
- `GET /api/sessions/me` - Get my sessions
- `DELETE /api/sessions/:id` - Revoke session
- `DELETE /api/sessions/user/:userId` - Revoke all user sessions (admin)

### Upload API

- `POST /api/upload` - Upload file to Firebase Storage

### Demo API

- `POST /api/demo/seed` - Load or delete seed data (development only)

---

## 13. Lib Modules

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
- ✅ **20+ Lib Modules** - API client, Email, Firebase, Security, Validation, Errors, Monitoring

---

## 🔍 How to Use This Guide

1. **Find What You Need**: Use Ctrl+F to search for function/class names
2. **Check Import Path**: Each section shows the correct import statement
3. **See Parameters**: Function signatures show required parameters
4. **Understand Purpose**: Short descriptions explain what each item does
5. **Follow Patterns**: See how to use similar patterns across the codebase

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
