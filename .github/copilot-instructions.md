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
| Constants (UI_LABELS, THEME_CONSTANTS, ROUTES...) | `@/constants` |
| Hooks (useAuth, useApiQuery, useProfile...) | `@/hooks` |
| Validators, formatters, converters, events | `@/utils` |
| Auth/data/UI helpers | `@/helpers` |
| Singletons (CacheManager, Logger, EventBus...) | `@/classes` |
| Repositories (userRepository, orderRepository...) | `@/repositories` |
| DB schemas & types | `@/db/schema` |
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
| Addresses | `useAddresses()`, `useCreateAddress()`, `useUpdateAddress()`, `useDeleteAddress()` |
| File upload | `useStorageUpload()` |
| Form state | `useForm(config)` or `useFormState(initial)` |
| Click outside | `useClickOutside(ref, handler)` |
| Keyboard shortcuts | `useKeyPress(key, handler)` |
| Swipe gestures | `useSwipe(options)` |
| Unsaved changes | `useUnsavedChanges(isDirty)` |
| Toast/messages | `useMessage()` |
| Admin stats | `useAdminStats()` |
| Session management | `useMySessions()`, `useAdminSessions()` |

---

## RULE 6: Use Existing Components

**Check `@/components` before creating new UI elements.**

Key available components: `Button`, `Card`, `Badge`, `Input`, `Select`, `Textarea`, `Checkbox`, `Toggle`, `Alert`, `Modal`, `ConfirmDeleteModal`, `ImageCropModal`, `FormField`, `Slider`, `Progress`, `Tabs`, `Accordion`, `Tooltip`, `Search`, `BackToTop`, `LoadingSpinner`, `ErrorBoundary`, `AvatarDisplay`, `AvatarUpload`, `PasswordStrengthIndicator`, `Text`, `DataTable`, `Sidebar`, `Header`, `Footer`.

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

Available repositories: `userRepository`, `tokenRepository`, `productRepository`, `orderRepository`, `reviewRepository`, `sessionRepository`, `siteSettingsRepository`, `carouselRepository`, `homepageSectionsRepository`, `categoriesRepository`, `couponsRepository`, `faqRepository`.

**Use schema types** for type safety:
```tsx
import type { UserCreateInput, UserUpdateInput } from '@/db/schema';
import { USER_COLLECTION, userQueryHelpers } from '@/db/schema';
```

---

## RULE 9: Use Error Classes

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

## RULE 10: Use Existing Classes (Singletons)

| Need | Class | Import |
|------|-------|--------|
| In-memory cache | `cacheManager` | `import { cacheManager } from '@/classes'` |
| localStorage/sessionStorage | `storageManager` | `import { storageManager } from '@/classes'` |
| Client logging | `logger` | `import { logger } from '@/classes'` |
| Inter-component events | `eventBus` | `import { eventBus } from '@/classes'` |
| Task queueing | `new Queue()` | `import { Queue } from '@/classes'` |

**NEVER** write custom localStorage wrappers, custom event emitters, or custom caching logic.

---

## RULE 11: Collection Names from Constants

**NEVER hardcode Firestore collection names.**

```tsx
// WRONG
db.collection('users')

// RIGHT
import { USER_COLLECTION } from '@/db/schema';
db.collection(USER_COLLECTION)
```

Available constants: `USER_COLLECTION`, `PRODUCT_COLLECTION`, `ORDER_COLLECTION`, `REVIEW_COLLECTION`, `SESSION_COLLECTION`, `EMAIL_VERIFICATION_COLLECTION`, `PASSWORD_RESET_COLLECTION`, `CAROUSEL_SLIDES_COLLECTION`, `HOMEPAGE_SECTIONS_COLLECTION`, `CATEGORIES_COLLECTION`, `COUPONS_COLLECTION`, `FAQS_COLLECTION`, `SITE_SETTINGS_COLLECTION`.

---

## RULE 12: Routes from Constants

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

## RULE 13: API Endpoints from Constants

**NEVER hardcode API paths.**

```tsx
// WRONG
const res = await fetch('/api/auth/login');

// RIGHT
import { API_ENDPOINTS } from '@/constants';
const res = await fetch(API_ENDPOINTS.AUTH.LOGIN);
```

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

---

## TypeScript Workflow

```bash
# 1. Check only changed files
npx tsc --noEmit src/path/to/changed-file.tsx

# 2. If clean, full build
npm run build

# 3. Run tests
npm test
```

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
- [ ] Am I using error classes (not raw `throw new Error(...)`)?
- [ ] No inline styles for static values?
- [ ] Firebase Admin SDK only in `src/app/api/**`?

---

## Full Reference

See `docs/GUIDE.md` for complete inventory of every function, hook, component, class, constant, schema, repository, and API endpoint in this codebase.
