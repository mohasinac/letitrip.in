# Quick Reference: Refactored Utilities

A quick lookup guide for all new utilities, helpers, classes, and snippets.

---

## 📋 Table of Contents

- [Validators](#validators)
- [Formatters](#formatters)
- [Converters](#converters)
- [Auth Helpers](#auth-helpers)
- [Data Helpers](#data-helpers)
- [UI Helpers](#ui-helpers)
- [Classes](#classes)
- [React Hooks](#react-hooks)
- [API Patterns](#api-patterns)
- [Form Validation](#form-validation)
- [Performance](#performance)

---

## Validators

### Email (`@/utils/validators/email.validator`)

```typescript
isValidEmail(email: string): boolean
isValidEmailDomain(email: string): boolean
normalizeEmail(email: string): string
isDisposableEmail(email: string): boolean
```

### Password (`@/utils/validators/password.validator`)

```typescript
meetsPasswordRequirements(password: string, requirements?: object): boolean
calculatePasswordStrength(password: string): number // 0-4
isCommonPassword(password: string): boolean
```

### Phone (`@/utils/validators/phone.validator`)

```typescript
isValidPhone(phone: string, countryCode?: string): boolean
normalizePhone(phone: string): string
formatPhone(phone: string, format?: string): string
extractCountryCode(phone: string): string | null
```

### URL (`@/utils/validators/url.validator`)

```typescript
isValidUrl(url: string): boolean
isValidUrlWithProtocol(url: string, protocols?: string[]): boolean
isExternalUrl(url: string, baseUrl?: string): boolean
sanitizeUrl(url: string): string
```

### Input (`@/utils/validators/input.validator`)

```typescript
isRequired(value: any): boolean
minLength(value: string, min: number): boolean
maxLength(value: string, max: number): boolean
isNumeric(value: string): boolean
isValidCreditCard(cardNumber: string): boolean
isValidPostalCode(postalCode: string, countryCode?: string): boolean
```

---

## Formatters

### Date (`@/utils/formatters/date.formatter`)

```typescript
formatDate(date: Date | string, format?: 'short' | 'medium' | 'long' | 'full'): string
formatDateTime(date: Date | string, includeSeconds?: boolean): string
formatRelativeTime(date: Date | string): string // "2 hours ago"
formatDateRange(start: Date | string, end: Date | string): string
```

### Number (`@/utils/formatters/number.formatter`)

```typescript
formatCurrency(amount: number, currency?: string, locale?: string): string
formatFileSize(bytes: number): string // "1.5 MB"
formatCompactNumber(num: number): string // "1.5K"
formatOrdinal(num: number): string // "1st", "2nd", "3rd"
formatPercentage(value: number, decimals?: number): string
```

### String (`@/utils/formatters/string.formatter`)

```typescript
capitalize(str: string): string
capitalizeWords(str: string): string
toCamelCase(str: string): string
toSnakeCase(str: string): string
toKebabCase(str: string): string
toPascalCase(str: string): string
slugify(str: string): string
maskString(str: string, visibleChars?: number, maskChar?: string): string
truncate(str: string, maxLength: number, ellipsis?: string): string
escapeHtml(str: string): string
unescapeHtml(str: string): string
removeHtmlTags(str: string): string
isEmptyString(str: string | null | undefined): boolean
wordCount(str: string): number
```

---

## Converters

### Type Converter (`@/utils/converters/type.converter`)

```typescript
arrayToObject<T>(array: T[], key: keyof T): Record<string, T>
objectToArray<T>(obj: Record<string, T>): T[]
csvToArray(csv: string, delimiter?: string): string[][]
flattenObject(obj: Record<string, any>, prefix?: string): Record<string, any>
unflattenObject(obj: Record<string, any>): Record<string, any>
firestoreTimestampToDate(timestamp: any): Date
deepClone<T>(obj: T): T
```

---

## Auth Helpers

### Auth (`@/helpers/auth/auth.helper`)

```typescript
hasRole(user: UserProfile, role: UserRole): boolean
canChangeRole(currentUser: UserProfile, targetUser: UserProfile, newRole: UserRole): boolean
generateInitials(displayName: string | null, email: string | null): string
getGradientForUser(name: string | null, email: string | null): string
calculatePasswordScore(password: string): number // 0-4
```

### Token (`@/helpers/auth/token.helper`)

```typescript
generateVerificationToken(): string
generatePasswordResetToken(): string
isTokenExpired(createdAt: Date, expirationMinutes?: number): boolean
maskToken(token: string, visibleChars?: number): string
```

---

## Data Helpers

### Array (`@/helpers/data/array.helper`)

```typescript
groupBy<T>(array: T[], key: keyof T): Record<string, T[]>
unique<T>(array: T[]): T[]
sortBy<T>(array: T[], key: keyof T, order?: 'asc' | 'desc'): T[]
chunk<T>(array: T[], size: number): T[][]
flatten<T>(array: any[]): T[]
shuffle<T>(array: T[]): T[]
paginate<T>(array: T[], page: number, pageSize: number): PaginationResult<T>
```

### Object (`@/helpers/data/object.helper`)

```typescript
deepMerge<T>(...objects: Partial<T>[]): T
pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>
omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>
getNestedValue(obj: any, path: string): any
setNestedValue(obj: any, path: string, value: any): void
isEmptyObject(obj: Record<string, any>): boolean
deepCloneObject<T>(obj: T): T
isEqual(obj1: any, obj2: any): boolean
cleanObject(obj: Record<string, any>): Record<string, any>
```

### Pagination (`@/helpers/data/pagination.helper`)

```typescript
calculatePagination(totalItems: number, currentPage: number, pageSize: number): PaginationInfo
generatePageNumbers(currentPage: number, totalPages: number, maxVisible?: number): (number | 'ellipsis')[]
```

### Sorting (`@/helpers/data/sorting.helper`)

```typescript
sort<T>(array: T[], field: keyof T, order?: 'asc' | 'desc'): T[]
multiSort<T>(array: T[], sorts: SortConfig<T>[]): T[]
sortByDate<T>(array: T[], field: keyof T, order?: 'asc' | 'desc'): T[]
sortByString<T>(array: T[], field: keyof T, order?: 'asc' | 'desc'): T[]
sortByNumber<T>(array: T[], field: keyof T, order?: 'asc' | 'desc'): T[]
```

---

## UI Helpers

### Color (`@/helpers/ui/color.helper`)

```typescript
hexToRgb(hex: string): { r: number; g: number; b: number } | null
rgbToHex(r: number, g: number, b: number): string
lightenColor(color: string, percent: number): string
darkenColor(color: string, percent: number): string
getContrastColor(bgColor: string): 'black' | 'white'
generateGradient(index: number): string
```

### Style (`@/helpers/ui/style.helper`)

```typescript
classNames(...classes: (string | undefined | null | false)[]): string
cn(...classes: (string | undefined | null | false)[]): string // Alias
mergeTailwindClasses(...classes: string[]): string
responsive(base: string, sm?: string, md?: string, lg?: string): string
variant<T>(variants: Record<string, T>, key: string, defaultKey?: string): T
```

### Animation (`@/helpers/ui/animation.helper`)

```typescript
easeInOut(t: number): number
easeIn(t: number): number
easeOut(t: number): number
animate(callback: (progress: number) => void, duration: number): void
fadeIn(element: HTMLElement, duration?: number): void
fadeOut(element: HTMLElement, duration?: number): void
slide(element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down', duration?: number): void
stagger(elements: HTMLElement[], animation: (el: HTMLElement) => void, delay?: number): void
```

---

## Classes

### CacheManager (`@/classes/CacheManager`)

```typescript
const cache = CacheManager.getInstance();

cache.set<T>(key: string, value: T, options?: { ttl?: number }): void
cache.get<T>(key: string): T | null
cache.has(key: string): boolean
cache.delete(key: string): void
cache.clear(): void
cache.cleanExpired(): void
```

### StorageManager (`@/classes/StorageManager`)

```typescript
const storage = StorageManager.getInstance();

storage.set<T>(key: string, value: T, session?: boolean): void
storage.get<T>(key: string, session?: boolean): T | null
storage.remove(key: string, session?: boolean): void
storage.clear(session?: boolean): void
```

### Logger (`@/classes/Logger`)

```typescript
const logger = Logger.getInstance();

logger.debug(message: string, meta?: any): void
logger.info(message: string, meta?: any): void
logger.warn(message: string, meta?: any): void
logger.error(message: string, meta?: any): void
logger.getLogs(): LogEntry[]
logger.clearLogs(): void
```

### EventBus (`@/classes/EventBus`)

```typescript
const eventBus = EventBus.getInstance();

eventBus.on<T>(event: string, callback: (data: T) => void): Subscription
eventBus.once<T>(event: string, callback: (data: T) => void): Subscription
eventBus.off(event: string, callback: Function): void
eventBus.emit<T>(event: string, data?: T): void
```

### Queue (`@/classes/Queue`)

```typescript
const queue = new Queue({ concurrency: 3 });

queue.add<T>(task: () => Promise<T>, priority?: number): Promise<T>
queue.pause(): void
queue.resume(): void
queue.clear(): void
queue.getStats(): QueueStats
```

---

## React Hooks

### React Hooks Snippet (`@/snippets/react-hooks.snippet`)

```typescript
// Debounce value
const debouncedValue = useDebounce<T>(value: T, delay?: number): T

// localStorage hook
const [value, setValue, remove] = useLocalStorage<T>(key: string, initialValue: T)

// Toggle boolean
const [value, toggle] = useToggle(initialValue?: boolean)

// Get previous value
const previousValue = usePrevious<T>(value: T)

// Media query
const matches = useMediaQuery(query: string)

// Element on screen
const [ref, isVisible] = useOnScreen<T>(options?: IntersectionObserverInit)

// Interval
useInterval(callback: () => void, delay: number | null)

// Window size
const { width, height } = useWindowSize()

// Copy to clipboard
const [copiedText, copy] = useCopyToClipboard()
```

---

## API Patterns

### API Requests Snippet (`@/snippets/api-requests.snippet`)

```typescript
// Basic request
apiRequest<T>(url: string, options?: RequestInit): Promise<T>

// With timeout
fetchWithTimeout<T>(url: string, timeout?: number, options?: RequestInit): Promise<T>

// With retry
retryRequest<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>

// Batch requests
batchRequests<T>(urls: string[], options?: RequestInit): Promise<T[]>

// Parallel requests
parallelRequests<T>(requests: (() => Promise<T>)[], maxConcurrent?: number): Promise<T[]>

// Shortcuts
get<T>(url: string): Promise<T>
post<T>(url: string, data: any): Promise<T>
put<T>(url: string, data: any): Promise<T>
del<T>(url: string): Promise<T>
```

---

## Form Validation

### Form Validation Snippet (`@/snippets/form-validation.snippet`)

```typescript
// Validate single field
const error = validateField(name: string, value: any, rules: ValidationRule[])

// Validate entire form
const errors = validateForm(formData: Record<string, any>, rules: Record<string, ValidationRule[]>)

// Common rules
validationRules.required
validationRules.email
validationRules.minLength(min: number)
validationRules.maxLength(max: number)
validationRules.pattern(regex: RegExp, message?: string)
validationRules.custom(validator: (value: any) => boolean, message: string)

// Create validator
const validator = createValidator(rules: Record<string, ValidationRule[]>)
const errors = validator.validate(formData)
const isValid = validator.isValid(formData)
```

---

## Performance

### Performance Snippet (`@/snippets/performance.snippet`)

```typescript
// Memoize function
const memoized = memoize<T>(fn: T): T

// Lazy load component
const LazyComponent = lazyLoad<T>(importFn: () => Promise<{ default: T }>, fallback?: ReactNode)

// Preload images
preloadImages(urls: string[]): Promise<void>

// Cached fetch
cachedFetch<T>(url: string, cacheTime?: number): Promise<T>

// Process in chunks
processInChunks<T, R>(items: T[], processor: (item: T) => R, chunkSize?: number): Promise<R[]>

// Virtual scroll
calculateVisibleRange(scrollTop: number, itemHeight: number, containerHeight: number, totalItems: number): { start: number; end: number }
```

---

## Import Examples

```typescript
// Import from utils
import { isValidEmail, formatDate, formatCurrency } from "@/utils";

// Import from helpers
import { hasRole, groupBy, classNames } from "@/helpers";

// Import specific helper categories
import { hasRole } from "@/helpers/auth";
import { groupBy, sortBy } from "@/helpers/data";
import { lightenColor, cn } from "@/helpers/ui";

// Import from classes
import { CacheManager, Logger, EventBus } from "@/classes";

// Import from snippets
import { useDebounce, useLocalStorage } from "@/snippets/react-hooks.snippet";
import { apiRequest, retryRequest } from "@/snippets/api-requests.snippet";
import { validateForm } from "@/snippets/form-validation.snippet";
import { memoize, lazyLoad } from "@/snippets/performance.snippet";
```

---

## Quick Tips

### ✅ DO:

- Use barrel exports from `@/utils`, `@/helpers`, `@/classes`
- Import only what you need (tree-shaking)
- Check existing utilities before writing new code
- Reuse helpers across components
- Use snippets for common patterns

### ❌ DON'T:

- Duplicate validation logic in components
- Write inline formatters
- Hardcode role hierarchy checks
- Manually implement debounce/throttle
- Skip caching for expensive operations

---

## Testing

All utilities are designed to be easily testable:

```typescript
import { isValidEmail } from "@/utils/validators/email.validator";
import { formatCurrency } from "@/utils/formatters/number.formatter";
import { groupBy } from "@/helpers/data/array.helper";

test("validates email", () => {
  expect(isValidEmail("test@example.com")).toBe(true);
});

test("formats currency", () => {
  expect(formatCurrency(1234.56)).toBe("$1,234.56");
});

test("groups array by key", () => {
  const users = [{ role: "admin" }, { role: "user" }];
  const grouped = groupBy(users, "role");
  expect(grouped).toHaveProperty("admin");
});
```

---

## Documentation

- **Full Guide**: `docs/CODEBASE_ORGANIZATION.md`
- **Summary**: `docs/REFACTORING_SUMMARY.md`
- **Comparison**: `docs/BEFORE_AFTER_COMPARISON.md`
- **This Reference**: `docs/QUICK_REFERENCE_UTILITIES.md`

---

**Need Help?** Check the comprehensive examples in `docs/CODEBASE_ORGANIZATION.md`
