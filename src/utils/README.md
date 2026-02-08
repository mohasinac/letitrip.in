# Utils

> Pure utility functions for validation, formatting, conversion, and event management

## Overview

This directory contains pure utility functions that have **no side effects** and **no external dependencies**. All functions are deterministic - given the same input, they always return the same output.

## Import

All utilities are exported through the barrel file:

```typescript
import { isValidEmail, formatDate, slugify, debounce } from "@/utils";
```

## Directory Structure

```
utils/
├── validators/       # Input validation functions
├── formatters/       # Data formatting functions
├── converters/       # Type and data conversion functions
├── events/           # Event management utilities
├── id-generators.ts  # ID generation functions
└── index.ts         # Barrel export
```

---

## 📋 Validators

**Location**: `src/utils/validators/`

### Email Validators

| Function                                    | Purpose                           | Returns   |
| ------------------------------------------- | --------------------------------- | --------- |
| `isValidEmail(email)`                       | Validate email format             | `boolean` |
| `isValidEmailDomain(email, allowedDomains)` | Check domain whitelist            | `boolean` |
| `normalizeEmail(email)`                     | Normalize email (lowercase, trim) | `string`  |
| `isDisposableEmail(email)`                  | Check if disposable email service | `boolean` |

**Example:**

```typescript
import { isValidEmail, normalizeEmail } from "@/utils";

const email = "  USER@EXAMPLE.COM  ";
if (isValidEmail(email)) {
  const normalized = normalizeEmail(email); // "user@example.com"
}
```

### Password Validators

| Function                                            | Purpose                        | Returns            |
| --------------------------------------------------- | ------------------------------ | ------------------ |
| `meetsPasswordRequirements(password, requirements)` | Check password requirements    | `boolean`          |
| `calculatePasswordStrength(password)`               | Calculate strength score       | `PasswordStrength` |
| `isCommonPassword(password)`                        | Check against common passwords | `boolean`          |

**Example:**

```typescript
import { calculatePasswordStrength, meetsPasswordRequirements } from "@/utils";

const password = "MyP@ssw0rd123";
const strength = calculatePasswordStrength(password);
// { score: 4, label: 'Strong', color: 'green' }

const isValid = meetsPasswordRequirements(password, {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
});
```

### Phone Validators

| Function                           | Purpose               | Returns          |
| ---------------------------------- | --------------------- | ---------------- |
| `isValidPhone(phone)`              | Validate phone format | `boolean`        |
| `normalizePhone(phone)`            | Remove formatting     | `string`         |
| `formatPhone(phone, countryCode?)` | Format phone number   | `string`         |
| `extractCountryCode(phone)`        | Extract country code  | `string \| null` |

**Example:**

```typescript
import { isValidPhone, formatPhone, normalizePhone } from "@/utils";

const phone = "+1 (555) 123-4567";
if (isValidPhone(phone)) {
  const normalized = normalizePhone(phone); // "15551234567"
  const formatted = formatPhone(normalized, "US"); // "+1 (555) 123-4567"
}
```

### URL Validators

| Function                                  | Purpose              | Returns   |
| ----------------------------------------- | -------------------- | --------- |
| `isValidUrl(url)`                         | Validate URL format  | `boolean` |
| `isValidUrlWithProtocol(url, protocols?)` | Check protocol       | `boolean` |
| `isExternalUrl(url, currentDomain?)`      | Check if external    | `boolean` |
| `sanitizeUrl(url)`                        | Sanitize URL for XSS | `string`  |

**Example:**

```typescript
import { isValidUrl, isExternalUrl, sanitizeUrl } from "@/utils";

const url = "https://example.com/page";
if (isValidUrl(url)) {
  const isExternal = isExternalUrl(url, "letitrip.in"); // true
  const safe = sanitizeUrl(url); // Sanitized URL
}
```

### Input Validators

| Function                                      | Purpose                       | Returns   |
| --------------------------------------------- | ----------------------------- | --------- |
| `isRequired(value)`                           | Check if value exists         | `boolean` |
| `minLength(value, min)`                       | Minimum length check          | `boolean` |
| `maxLength(value, max)`                       | Maximum length check          | `boolean` |
| `exactLength(value, length)`                  | Exact length check            | `boolean` |
| `isNumeric(value)`                            | Numeric-only check            | `boolean` |
| `isAlphabetic(value)`                         | Alphabetic-only check         | `boolean` |
| `isAlphanumeric(value)`                       | Alphanumeric check            | `boolean` |
| `inRange(value, min, max)`                    | Number range check            | `boolean` |
| `matchesPattern(value, pattern)`              | Regex pattern match           | `boolean` |
| `isInList<T>(value, list)`                    | Whitelist check               | `boolean` |
| `isValidCreditCard(cardNumber)`               | Credit card validation (Luhn) | `boolean` |
| `isValidPostalCode(postalCode, countryCode?)` | Postal code validation        | `boolean` |

**Example:**

```typescript
import { isRequired, minLength, maxLength, inRange } from "@/utils";

const username = "john_doe";
const age = 25;

const isValid =
  isRequired(username) &&
  minLength(username, 3) &&
  maxLength(username, 20) &&
  inRange(age, 18, 100);
```

---

## 📝 Formatters

**Location**: `src/utils/formatters/`

### Date Formatters

| Function                              | Purpose                     | Returns   |
| ------------------------------------- | --------------------------- | --------- |
| `formatDate(date, format?)`           | Format date                 | `string`  |
| `formatDateTime(date, format?)`       | Format date with time       | `string`  |
| `formatTime(date, format?)`           | Format time only            | `string`  |
| `formatRelativeTime(date)`            | Relative time (2 hours ago) | `string`  |
| `formatDateRange(startDate, endDate)` | Date range formatting       | `string`  |
| `formatCustomDate(date, pattern)`     | Custom date pattern         | `string`  |
| `isToday(date)`                       | Check if date is today      | `boolean` |
| `isPast(date)`                        | Check if date is past       | `boolean` |
| `isFuture(date)`                      | Check if date is future     | `boolean` |

**Example:**

```typescript
import { formatDate, formatRelativeTime, formatDateTime } from "@/utils";

const now = new Date();
formatDate(now); // "Feb 8, 2026"
formatDateTime(now); // "Feb 8, 2026 3:45 PM"
formatRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"
```

### Number Formatters

| Function                                     | Purpose                         | Returns  |
| -------------------------------------------- | ------------------------------- | -------- |
| `formatCurrency(amount, currency?, locale?)` | Currency formatting             | `string` |
| `formatNumber(num, locale?)`                 | Number with locale separators   | `string` |
| `formatPercentage(num, decimals?)`           | Percentage formatting           | `string` |
| `formatFileSize(bytes)`                      | File size (KB, MB, GB)          | `string` |
| `formatCompactNumber(num)`                   | Compact notation (1.2K, 3.4M)   | `string` |
| `formatDecimal(num, decimals?)`              | Decimal places                  | `string` |
| `formatOrdinal(num)`                         | Ordinal numbers (1st, 2nd, 3rd) | `string` |
| `parseFormattedNumber(str)`                  | Parse formatted number back     | `number` |

**Example:**

```typescript
import { formatCurrency, formatFileSize, formatCompactNumber } from "@/utils";

formatCurrency(1234.56, "INR"); // "₹1,234.56"
formatFileSize(1048576); // "1.00 MB"
formatCompactNumber(1234567); // "1.2M"
```

### String Formatters

| Function                                    | Purpose                  | Returns   |
| ------------------------------------------- | ------------------------ | --------- |
| `capitalize(str)`                           | Capitalize first letter  | `string`  |
| `capitalizeWords(str)`                      | Capitalize all words     | `string`  |
| `toCamelCase(str)`                          | Convert to camelCase     | `string`  |
| `toPascalCase(str)`                         | Convert to PascalCase    | `string`  |
| `toSnakeCase(str)`                          | Convert to snake_case    | `string`  |
| `toKebabCase(str)`                          | Convert to kebab-case    | `string`  |
| `truncate(str, length, suffix?)`            | Truncate with ellipsis   | `string`  |
| `truncateWords(str, words, suffix?)`        | Truncate by word count   | `string`  |
| `stripHtml(html)`                           | Remove HTML tags         | `string`  |
| `escapeHtml(str)`                           | Escape HTML entities     | `string`  |
| `slugify(str)`                              | Create URL-friendly slug | `string`  |
| `maskString(str, maskChar?, visibleChars?)` | Mask sensitive data      | `string`  |
| `randomString(length?)`                     | Generate random string   | `string`  |
| `isEmptyString(str)`                        | Check if empty           | `boolean` |
| `wordCount(str)`                            | Count words              | `number`  |
| `reverse(str)`                              | Reverse string           | `string`  |

**Example:**

```typescript
import { capitalize, slugify, truncate, maskString } from "@/utils";

capitalize("hello world"); // "Hello world"
slugify("My Blog Post!"); // "my-blog-post"
truncate("Long text here", 10); // "Long text..."
maskString("1234567890", "*", 4); // "******7890"
```

---

## 🔄 Converters

**Location**: `src/utils/converters/`

### Type Converters

| Function                              | Purpose                     | Returns               |
| ------------------------------------- | --------------------------- | --------------------- |
| `stringToBoolean(value)`              | Parse boolean string        | `boolean`             |
| `booleanToString(value, format?)`     | Boolean to string           | `string`              |
| `arrayToObject<T>(arr, keyField)`     | Array to object map         | `Record<string, T>`   |
| `objectToArray<T>(obj)`               | Object to array             | `T[]`                 |
| `queryStringToObject(queryString)`    | Parse query string          | `Record<string, any>` |
| `objectToQueryString(obj)`            | Object to query string      | `string`              |
| `csvToArray(csv, delimiter?)`         | Parse CSV                   | `string[][]`          |
| `arrayToCsv(arr, delimiter?)`         | Array to CSV                | `string`              |
| `firestoreTimestampToDate(timestamp)` | Firestore timestamp to Date | `Date`                |
| `dateToISOString(date)`               | Date to ISO string          | `string`              |
| `deepClone<T>(obj)`                   | Deep clone object           | `T`                   |
| `flattenObject(obj, separator?)`      | Flatten nested object       | `Record<string, any>` |
| `unflattenObject(obj)`                | Unflatten object            | `Record<string, any>` |

**Example:**

```typescript
import { arrayToObject, queryStringToObject, slugify } from "@/utils";

// Convert array to object
const users = [
  { id: "1", name: "John" },
  { id: "2", name: "Jane" },
];
const usersById = arrayToObject(users, "id");
// { '1': { id: '1', name: 'John' }, '2': { id: '2', name: 'Jane' } }

// Parse query string
const params = queryStringToObject("?page=2&sort=name");
// { page: '2', sort: 'name' }
```

---

## ⚡ Event Management

**Location**: `src/utils/events/`

### Event Manager Functions

| Function                                            | Purpose                      | Returns   |
| --------------------------------------------------- | ---------------------------- | --------- |
| `throttle<T>(fn, delay)`                            | Throttle function calls      | `T`       |
| `debounce<T>(fn, delay)`                            | Debounce function calls      | `T`       |
| `addGlobalScrollHandler(callback, options?)`        | Add scroll listener          | `string`  |
| `addGlobalResizeHandler(callback, options?)`        | Add resize listener          | `string`  |
| `addGlobalClickHandler(callback, options?)`         | Add click listener           | `string`  |
| `addGlobalKeyHandler(keyCombo, callback, options?)` | Add keyboard listener        | `string`  |
| `removeGlobalHandler(id)`                           | Remove event handler         | `void`    |
| `isMobileDevice()`                                  | Check if mobile device       | `boolean` |
| `hasTouchSupport()`                                 | Check if touch supported     | `boolean` |
| `getViewportDimensions()`                           | Get viewport width/height    | `object`  |
| `isInViewport(element, offset?)`                    | Check if element in viewport | `boolean` |
| `smoothScrollTo(target, options?)`                  | Smooth scroll to element     | `void`    |
| `preventBodyScroll(prevent)`                        | Lock/unlock body scroll      | `void`    |

**Example:**

```typescript
import { throttle, debounce, smoothScrollTo } from "@/utils";

// Throttle scroll handler
const handleScroll = throttle(() => {
  console.log("Scrolled");
}, 200);

window.addEventListener("scroll", handleScroll);

// Debounce search input
const handleSearch = debounce((query) => {
  searchAPI(query);
}, 300);

// Smooth scroll to element
smoothScrollTo("#section-2", { duration: 500 });
```

---

## 🆔 ID Generators

**Location**: `src/utils/id-generators.ts`

| Function                           | Purpose                    | Returns  |
| ---------------------------------- | -------------------------- | -------- |
| `generateUserId(input)`            | Generate unique user ID    | `string` |
| `generateProductId(input)`         | Generate product ID        | `string` |
| `generateCategoryId(input)`        | Generate category ID       | `string` |
| `generateAuctionId(input)`         | Generate auction ID        | `string` |
| `generateReviewId(input)`          | Generate review ID         | `string` |
| `generateOrderId(input)`           | Generate order ID          | `string` |
| `generateFAQId(input)`             | Generate FAQ ID            | `string` |
| `generateCouponId(code)`           | Generate coupon ID         | `string` |
| `generateCarouselId(input)`        | Generate carousel slide ID | `string` |
| `generateHomepageSectionId(input)` | Generate section ID        | `string` |
| `generateBarcodeFromId(id)`        | Generate barcode from ID   | `string` |
| `generateQRCodeData(type, id)`     | Generate QR code data      | `string` |

**Example:**

```typescript
import { generateProductId, generateOrderId } from "@/utils";

const productId = generateProductId({
  name: "iPhone 15",
  category: "electronics",
});
// "PROD-IPHONE-15-ABC123"

const orderId = generateOrderId({
  userId: "user123",
  timestamp: Date.now(),
});
// "ORD-202602-USER123-XYZ789"
```

---

## Best Practices

### 1. Pure Functions

Utils must be pure - no side effects, no mutations:

```typescript
// ✅ GOOD - Returns new array
function filterActive(items) {
  return items.filter((item) => item.active);
}

// ❌ BAD - Mutates input
function filterActive(items) {
  items = items.filter((item) => item.active);
  return items;
}
```

### 2. Type Safety

Always use TypeScript types:

```typescript
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  // implementation
}
```

### 3. Comprehensive JSDoc

Document parameters, returns, and examples:

````typescript
/**
 * Format a number as currency
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56, 'INR', 'en-IN'); // "₹1,234.56"
 * ```
 */
export function formatCurrency(...) { }
````

### 4. Error Handling

Handle edge cases gracefully:

```typescript
export function formatDate(
  date: Date | string,
  format: string = "MMM d, yyyy",
): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    // format date
    return formattedDate;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
}
```

### 5. Performance

Optimize for performance with memoization when needed:

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Compile once

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}
```

---

## Testing

All utilities have corresponding test files. Run tests with:

```bash
npm test src/utils
```

---

## Adding New Utilities

When creating a new utility:

1. **Choose the right category**: validators, formatters, converters, or events
2. **Create the file**: `src/utils/category/feature.util.ts`
3. **Write pure functions**: No side effects, deterministic output
4. **Add comprehensive JSDoc**: Document parameters, returns, examples
5. **Export from barrel**: Add to category `index.ts` and main `src/utils/index.ts`
6. **Write tests**: Create `__tests__/feature.util.test.ts`
7. **Update this README**: Document the new utility
8. **Update GUIDE.md**: Add to the utils reference section

---

## Related Documentation

- [GUIDE.md](../../docs/GUIDE.md) - Complete codebase reference
- [Helpers](../helpers/README.md) - Business logic functions
- [Hooks](../hooks/README.md) - React hooks
- [Coding Standards](../../.github/copilot-instructions.md) - Utility best practices

---

**Last Updated**: February 8, 2026
