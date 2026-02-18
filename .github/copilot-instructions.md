# LetItRip Copilot Instructions

> **These are MANDATORY rules. Every line of code you write MUST comply.**
> For detailed codebase reference, see `docs/GUIDE.md`.

## Stack

Next.js 16.1.1 (App Router) | TypeScript | Tailwind CSS | Firebase (Auth, Firestore, Storage, Realtime DB) | Resend (email) | React Context + hooks

---

## RULE 1: Use Barrel Imports Only

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

| Need | Import from |
|------|------------|
| UI components (Button, Card, Input, Alert, Modal...) | `@/components` |
| Admin components (AdminPageHeader, AdminFilterBar, DrawerFormFooter...) | `@/components` |
| User components (AddressForm, AddressCard, ProfileHeader...) | `@/components` |
| Constants (UI_LABELS, THEME_CONSTANTS, ROUTES...) | `@/constants` |
| Navigation tab configs (ADMIN_TAB_ITEMS, USER_TAB_ITEMS) | `@/constants` |
| Role hierarchy (ROLE_HIERARCHY) | `@/constants` |
| Hooks (useAuth, useApiQuery, useProfile...) | `@/hooks` |
| Validators, formatters, converters, events | `@/utils` |
| Auth/data/UI helpers | `@/helpers` |
| Singletons (CacheManager, Logger, EventBus...) | `@/classes` |
| Repositories (userRepository, orderRepository...) | `@/repositories` |
| DB schemas & types | `@/db/schema` |
| Schema field constants (USER_FIELDS, SCHEMA_DEFAULTS...) | `@/db/schema` |
| API types | `@/types/api` |
| Auth types (UserRole, UserProfile...) | `@/types/auth` |
| Error classes (AppError, ApiError...) | `@/lib/errors` |
| Contexts (useSession, useTheme) | `@/contexts` |
| Snippets | `@/snippets/<name>.snippet` |

---

## RULE 2: ZERO Hardcoded Strings

**NEVER write literal UI text. ALWAYS use constants.**

### String Lookup Table

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

**All from `@/constants`.**

**If a constant doesn't exist yet**: ADD it to `src/constants/ui.ts` (labels/placeholders) or `src/constants/messages.ts` (error/success). Then export via `src/constants/index.ts`.

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

```tsx
// WRONG
<button>Save</button>
<input placeholder="Enter your email" />
<p>Loading...</p>

// RIGHT
import { UI_LABELS, UI_PLACEHOLDERS } from '@/constants';
<button>{UI_LABELS.ACTIONS.SAVE}</button>
<input placeholder={UI_PLACEHOLDERS.EMAIL} />
<p>{UI_LABELS.LOADING.DEFAULT}</p>
```

---

## RULE 3: Use THEME_CONSTANTS for Styling

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

## RULE 4: Use Existing Utils & Helpers

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

## RULE 5: Use Existing Hooks

**Check `@/hooks` before creating new hooks.**

| Need | Hook |
|------|------|
| GET data from API | `useApiQuery(endpoint, options)` |
| POST/PUT/DELETE | `useApiMutation(endpoint, options)` |
| Auth state | `useAuth()` or `useSession()` |
| Login | `useLogin()` |
| Register | `useRegister()` |
| Profile CRUD | `useProfile()` |
| File upload | `useStorageUpload()` |
| Form state | `useForm(config)` |
| Click outside | `useClickOutside(ref, handler)` |
| Keyboard shortcuts | `useKeyPress(key, handler)` |
| Swipe gestures | `useSwipe(options)` |
| Unsaved changes | `useUnsavedChanges(isDirty)` |
| Toast/messages | `useMessage()` |
| Admin stats | `useAdminStats()` |
| Viewport breakpoint | `useBreakpoint()` |
| Media query | `useMediaQuery(query)` |
| RBAC checking | `useRBAC()` — exports `useHasRole`, `useIsAdmin`, `useIsModerator`, `useIsSeller`, `useCanAccess`, `useRequireAuth`, `useRequireRole` |
| Session management | `useMySessions()`, `useAdminSessions()` |

---

## RULE 6: Use Existing Components

**Check `@/components` before creating new UI elements.**

Key available components:

**UI**: `Button`, `Card`, `Badge`, `Input`, `Select`, `Textarea`, `Checkbox`, `Toggle`, `Alert`, `Modal`, `ConfirmDeleteModal`, `ImageCropModal`, `FormField`, `Slider`, `Progress`, `Tabs`, `Accordion`, `Tooltip`, `Search`, `BackToTop`, `LoadingSpinner`, `ErrorBoundary`, `AvatarDisplay`, `AvatarUpload`, `PasswordStrengthIndicator`, `Text`, `DataTable`, `SideDrawer`, `RichTextEditor`, `Sidebar`, `Header`, `Footer`, `SectionTabs`, `StatusBadge`, `RoleBadge`, `EmptyState`, `ResponsiveView`.

**Admin**: `AdminPageHeader`, `AdminFilterBar`, `DrawerFormFooter`.

**User**: `AddressForm`, `AddressCard`, `ProfileHeader`, `ProfileStatsGrid`, `EmailVerificationCard`, `PhoneVerificationCard`, `ProfileInfoForm`, `PasswordChangeForm`, `AccountInfoCard`.

```tsx
// WRONG - creating raw HTML inputs
<input type="text" className="border rounded p-2" />

// RIGHT - using existing components
import { FormField } from '@/components';
<FormField type="text" label={UI_LABELS.FORM.EMAIL} placeholder={UI_PLACEHOLDERS.EMAIL} />
```

---

## RULE 7: Firebase SDK Separation

| Context | SDK | Import |
|---------|-----|--------|
| API routes (`src/app/api/**`) | Firebase **Admin** | `import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin'` |
| Client components | Firebase **Client** | `import { db, auth, storage } from '@/lib/firebase/config'` |

**NEVER** import `@/lib/firebase/config` in API routes.
**NEVER** import `@/lib/firebase/admin` in client components.

---

## RULE 8: Use Repository Pattern for DB Access

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

---

## RULE 9: API Route Pattern

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

**Key patterns:**
- Use `verifySessionCookie()` for auth checking (not middleware yet - that's planned)
- Use `z.object()` schemas for validation
- Use `handleApiError(error)` in catch blocks
- Use `successResponse()` / `ApiErrors.*` for responses
- Always use repositories, never direct Firestore queries

---

## RULE 10: Use Error Classes

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

## RULE 11: Use Existing Classes (Singletons)

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

## RULE 12: RBAC (Role-Based Access Control)

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

**Role hierarchy**: `admin` > `moderator` > `seller` > `user` (higher roles inherit lower role permissions)

**Component protection**:
```tsx
import { ProtectedRoute } from '@/components';

<ProtectedRoute requiredRole="admin">
  <AdminContent />
</ProtectedRoute>
```

**Programmatic checks**:
```tsx
import { hasRole, hasAnyRole } from '@/helpers';

if (hasRole(user, 'admin')) { /* ... */ }
if (hasAnyRole(user, ['admin', 'moderator'])) { /* ... */ }
```

---

## RULE 13: Collection Names from Constants

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

## RULE 14: Routes from Constants

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

## RULE 15: API Endpoints from Constants

**NEVER hardcode API paths.**

```tsx
// WRONG
const res = await fetch('/api/auth/login');

// RIGHT
import { API_ENDPOINTS } from '@/constants';
const res = await fetch(API_ENDPOINTS.AUTH.LOGIN);
```

---

## RULE 16: Pages Are Thin Orchestration Layers

**Every `page.tsx` should be as simple as possible — composed entirely of imported components.**

A page should NOT contain:
- Inline form JSX (extract to a Form component)
- Inline table column definitions (extract to a Columns config)
- Inline drawer/modal bodies (extract to a Drawer/Modal component)
- Complex state logic (extract to a custom hook)
- More than ~100 lines of JSX

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

## RULE 17: No `alert()` / `confirm()` / `prompt()`

**NEVER use browser native dialogs.**

| Instead of... | Use |
|--------------|-----|
| `alert(msg)` | `useMessage()` hook (toast notification) |
| `confirm(msg)` | `ConfirmDeleteModal` from `@/components` |
| Error feedback | `Alert` component or `useMessage()` error toast |

---

## RULE 18: Use Structured Logging

**NEVER use `console.log()` in production code.**

| Context | Use | Import |
|---------|-----|--------|
| Client-side | `logger` | `import { logger } from '@/classes'` |
| Server-side (API routes) | `serverLogger` | `import { serverLogger } from '@/lib/server-logger'` |
| Component debugging | Remove before commit | — |

---

## Schema Standards

Every schema file in `src/db/schema/` MUST have these 6 sections:

1. **Collection Interface** - TypeScript interface + `COLLECTION_NAME` constant
2. **Indexed Fields** - `INDEXED_FIELDS` array with comments explaining each
3. **Relationships** - ASCII diagram showing FK references
4. **Helper Constants** - `DEFAULT_*_DATA`, `*_PUBLIC_FIELDS`, `*_UPDATABLE_FIELDS`
5. **Type Utilities** - `CreateInput`, `UpdateInput`, `AdminUpdateInput` types
6. **Query Helpers** - `queryHelpers` object with typed query builders

When adding indices, update BOTH the schema file AND `firestore.indexes.json`, then deploy with `firebase deploy --only firestore:indexes`.

---

## Styling Standards

1. Use `THEME_CONSTANTS` (Rule 3) for all repeated Tailwind patterns
2. Use `ThemeContext` (`useTheme()`) only for conditional light/dark logic
3. Use existing components (Rule 6) - don't create raw `<input>`, `<button>`, etc.
4. No inline `style={{}}` except for dynamic calculated values
5. No CSS modules

---

## Documentation Standards

- Update `docs/CHANGELOG.md` with every change
- Update `docs/GUIDE.md` when adding new functions/hooks/components/schemas
- Extend existing docs in `docs/` - NEVER create session-specific files
- NEVER create `REFACTORING_DATE.md`, `SESSION_SUMMARY.md`, etc.

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

**Always type-check before committing:**

1. Check changed files: `npx tsc --noEmit src/path/to/file.tsx`
2. If clean, run full build: `npm run build`
3. Run tests: `npm test`

---

## Pre-Code Checklist

Before writing ANY code, verify:

- [ ] Does a component for this already exist in `@/components`?
- [ ] Does a hook for this already exist in `@/hooks`?
- [ ] Does a util/helper for this already exist in `@/utils` or `@/helpers`?
- [ ] Am I using `UI_LABELS` / `UI_PLACEHOLDERS` / `ERROR_MESSAGES` / `SUCCESS_MESSAGES` for all text?
- [ ] Am I using `THEME_CONSTANTS` for all repeated Tailwind classes?
- [ ] Am I using `ROUTES` for all route paths?
- [ ] Am I using `API_ENDPOINTS` for all API paths?
- [ ] Am I using barrel imports (`@/constants`, not `@/constants/theme`)?
- [ ] Am I using repositories (not direct Firestore queries)?
- [ ] Am I using `USER_FIELDS`, `SCHEMA_DEFAULTS`, etc. for Firestore field names (not hardcoded strings)?
- [ ] Am I using `ERROR_MESSAGES.*` / `SUCCESS_MESSAGES.*` for all API error/success strings?
- [ ] Am I using error classes (not raw `throw new Error(...)`)?
- [ ] No inline styles for static values?
- [ ] Firebase Admin SDK only in `src/app/api/**`?
- [ ] Is my `page.tsx` thin? (< 150 lines, no inline forms/tables)
- [ ] No `alert()` / `confirm()` / `prompt()` calls?
- [ ] No `console.log()` in production code? (use `logger` or `serverLogger`)

---

## Full Reference

See `docs/GUIDE.md` for complete inventory of every function, hook, component, class, constant, schema, repository, and API endpoint in this codebase.
