# Utilities Reference

Complete documentation for all utility functions in @letitrip/react-library.

## Table of Contents

- [Core Utilities](#core-utilities)
- [Formatters](#formatters)
- [Date Utilities](#date-utilities)
- [Validators](#validators)
- [Sanitization](#sanitization)
- [Price Utilities](#price-utilities)
- [Accessibility](#accessibility)
- [Error Handling](#error-handling)
- [Data Fetching Adapters](#data-fetching-adapters)

---

## Core Utilities

### `cn`

Merge and conditionally combine class names (classnames utility).

**Parameters:**

- `...inputs: ClassValue[]` - Class names to merge

**Returns:** `string` - Merged class names

**Usage:**

```tsx
import { cn } from '@letitrip/react-library';

<div className={cn(
  'base-class',
  isActive && 'active',
  error ? 'text-red-500' : 'text-gray-500'
)}>
```

---

## Formatters

### `formatCurrency`

Format number as currency with Indian locale.

**Parameters:**

- `amount: number` - Amount to format
- `currency?: string` - Currency code (default: 'INR')
- `showSymbol?: boolean` - Show currency symbol (default: true)
- `showDecimals?: boolean` - Show decimal places (default: true)

**Returns:** `string` - Formatted currency string

**Usage:**

```tsx
formatCurrency(1999.99); // ₹1,999.99
formatCurrency(50000, "INR", true, false); // ₹50,000
formatCurrency(100.5, "USD"); // $100.50
```

### `formatPrice`

Format price with Indian numbering system.

**Parameters:**

- `price: number` - Price to format
- `options?: FormatPriceOptions`

**Returns:** `string` - Formatted price

**Usage:**

```tsx
formatPrice(125000); // ₹1,25,000
formatPrice(1999); // ₹1,999
```

### `formatNumber`

Format number with thousand separators.

**Parameters:**

- `value: number` - Number to format
- `decimals?: number` - Decimal places (default: 0)
- `locale?: string` - Locale (default: 'en-IN')

**Returns:** `string` - Formatted number

**Usage:**

```tsx
formatNumber(1234567); // 12,34,567
formatNumber(1234.567, 2); // 1,234.57
```

### `formatPercentage`

Format number as percentage.

**Parameters:**

- `value: number` - Value to format (0-1 or 0-100)
- `decimals?: number` - Decimal places (default: 0)
- `multiply?: boolean` - Multiply by 100 (default: true)

**Returns:** `string` - Formatted percentage

**Usage:**

```tsx
formatPercentage(0.156, 2); // 15.60%
formatPercentage(75, 0, false); // 75%
```

### `formatPhoneNumber`

Format Indian phone number.

**Parameters:**

- `phone: string` - Phone number
- `includeCountryCode?: boolean` - Include +91 (default: false)

**Returns:** `string` - Formatted phone number

**Usage:**

```tsx
formatPhoneNumber("9876543210"); // 98765 43210
formatPhoneNumber("9876543210", true); // +91 98765 43210
```

### `formatFileSize`

Format file size in human-readable format.

**Parameters:**

- `bytes: number` - File size in bytes
- `decimals?: number` - Decimal places (default: 2)

**Returns:** `string` - Formatted file size

**Usage:**

```tsx
formatFileSize(1024); // 1.00 KB
formatFileSize(1048576); // 1.00 MB
formatFileSize(5242880, 1); // 5.0 MB
```

### `formatDuration`

Format duration in human-readable format.

**Parameters:**

- `seconds: number` - Duration in seconds

**Returns:** `string` - Formatted duration

**Usage:**

```tsx
formatDuration(90); // 1m 30s
formatDuration(3661); // 1h 1m 1s
formatDuration(45); // 45s
```

### `formatAddress`

Format address object to string.

**Parameters:**

- `address: Address` - Address object
- `format?: 'short' | 'full'` - Format type (default: 'full')

**Returns:** `string` - Formatted address

**Usage:**

```tsx
formatAddress(
  {
    street: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
  "short",
); // Mumbai, Maharashtra 400001
```

### `formatName`

Format name with proper capitalization.

**Parameters:**

- `firstName: string` - First name
- `lastName?: string` - Last name
- `format?: 'full' | 'initials'` - Format type

**Returns:** `string` - Formatted name

**Usage:**

```tsx
formatName("john", "doe"); // John Doe
formatName("john", "doe", "initials"); // JD
```

### `truncateText`

Truncate text with ellipsis.

**Parameters:**

- `text: string` - Text to truncate
- `maxLength: number` - Maximum length
- `suffix?: string` - Suffix (default: '...')

**Returns:** `string` - Truncated text

**Usage:**

```tsx
truncateText("This is a long text", 10); // This is a...
```

### `slugify`

Convert text to URL-friendly slug.

**Parameters:**

- `text: string` - Text to slugify
- `options?: SlugifyOptions`

**Returns:** `string` - URL slug

**Usage:**

```tsx
slugify("Hello World!"); // hello-world
slugify("Product Name 2024"); // product-name-2024
```

### `capitalizeFirst`

Capitalize first letter of string.

**Parameters:**

- `text: string` - Text to capitalize

**Returns:** `string` - Capitalized text

**Usage:**

```tsx
capitalizeFirst("hello world"); // Hello world
```

### `titleCase`

Convert text to title case.

**Parameters:**

- `text: string` - Text to convert

**Returns:** `string` - Title case text

**Usage:**

```tsx
titleCase("hello world"); // Hello World
```

---

## Date Utilities

### `formatDate`

Format date with various options.

**Parameters:**

- `date: Date | string | number` - Date to format
- `format?: string` - Date format (default: 'MMM dd, yyyy')
- `locale?: string` - Locale (default: 'en-IN')

**Returns:** `string` - Formatted date

**Usage:**

```tsx
formatDate(new Date()); // Dec 25, 2023
formatDate(new Date(), "dd/MM/yyyy"); // 25/12/2023
formatDate("2023-12-25", "MMMM dd"); // December 25
```

### `formatRelativeTime`

Format date as relative time (e.g., "2 hours ago").

**Parameters:**

- `date: Date | string | number` - Date to format
- `now?: Date` - Reference date (default: now)

**Returns:** `string` - Relative time string

**Usage:**

```tsx
formatRelativeTime(Date.now() - 3600000); // 1 hour ago
formatRelativeTime(Date.now() + 86400000); // in 1 day
```

### `formatDateTime`

Format date and time.

**Parameters:**

- `date: Date | string | number` - Date to format
- `options?: FormatDateTimeOptions`

**Returns:** `string` - Formatted date time

**Usage:**

```tsx
formatDateTime(new Date()); // Dec 25, 2023 at 3:45 PM
```

### `formatTimeOnly`

Format time only.

**Parameters:**

- `date: Date | string | number` - Date to extract time from
- `format?: '12h' | '24h'` - Time format (default: '12h')

**Returns:** `string` - Formatted time

**Usage:**

```tsx
formatTimeOnly(new Date()); // 3:45 PM
formatTimeOnly(new Date(), "24h"); // 15:45
```

### `isToday`

Check if date is today.

**Parameters:**

- `date: Date | string | number` - Date to check

**Returns:** `boolean` - Is today

**Usage:**

```tsx
isToday(new Date()); // true
```

### `isYesterday`

Check if date is yesterday.

**Parameters:**

- `date: Date | string | number` - Date to check

**Returns:** `boolean` - Is yesterday

### `isTomorrow`

Check if date is tomorrow.

**Parameters:**

- `date: Date | string | number` - Date to check

**Returns:** `boolean` - Is tomorrow

### `addDays`

Add days to date.

**Parameters:**

- `date: Date` - Base date
- `days: number` - Number of days to add

**Returns:** `Date` - New date

**Usage:**

```tsx
addDays(new Date(), 7); // 7 days from now
```

### `addHours`

Add hours to date.

**Parameters:**

- `date: Date` - Base date
- `hours: number` - Number of hours to add

**Returns:** `Date` - New date

### `startOfDay`

Get start of day (00:00:00).

**Parameters:**

- `date: Date` - Date

**Returns:** `Date` - Start of day

### `endOfDay`

Get end of day (23:59:59).

**Parameters:**

- `date: Date` - Date

**Returns:** `Date` - End of day

### `diffInDays`

Calculate difference in days between two dates.

**Parameters:**

- `date1: Date` - First date
- `date2: Date` - Second date

**Returns:** `number` - Difference in days

**Usage:**

```tsx
diffInDays(new Date("2024-01-15"), new Date("2024-01-10")); // 5
```

### `diffInHours`

Calculate difference in hours between two dates.

**Parameters:**

- `date1: Date` - First date
- `date2: Date` - Second date

**Returns:** `number` - Difference in hours

### `parseDate`

Parse date string to Date object.

**Parameters:**

- `dateString: string` - Date string
- `format?: string` - Expected format

**Returns:** `Date` - Parsed date

**Usage:**

```tsx
parseDate("25/12/2023", "dd/MM/yyyy");
```

---

## Validators

### `validateEmail`

Validate email address.

**Parameters:**

- `email: string` - Email to validate

**Returns:** `boolean` - Is valid email

**Usage:**

```tsx
validateEmail("user@example.com"); // true
validateEmail("invalid-email"); // false
```

### `validatePhone`

Validate Indian phone number.

**Parameters:**

- `phone: string` - Phone number to validate

**Returns:** `boolean` - Is valid phone

**Usage:**

```tsx
validatePhone("9876543210"); // true
validatePhone("+919876543210"); // true
validatePhone("123456"); // false
```

### `validatePincode`

Validate Indian pincode.

**Parameters:**

- `pincode: string` - Pincode to validate

**Returns:** `boolean` - Is valid pincode

**Usage:**

```tsx
validatePincode("400001"); // true
validatePincode("12345"); // false
```

### `validateGST`

Validate GST number.

**Parameters:**

- `gst: string` - GST number to validate

**Returns:** `boolean` - Is valid GST

**Usage:**

```tsx
validateGST("27AAPFU0939F1ZV"); // true
```

### `validatePAN`

Validate PAN number.

**Parameters:**

- `pan: string` - PAN number to validate

**Returns:** `boolean` - Is valid PAN

**Usage:**

```tsx
validatePAN("ABCDE1234F"); // true
```

### `validateAadhaar`

Validate Aadhaar number.

**Parameters:**

- `aadhaar: string` - Aadhaar number to validate

**Returns:** `boolean` - Is valid Aadhaar

**Usage:**

```tsx
validateAadhaar("1234 5678 9012"); // true (format check)
```

### `validateURL`

Validate URL.

**Parameters:**

- `url: string` - URL to validate

**Returns:** `boolean` - Is valid URL

**Usage:**

```tsx
validateURL("https://example.com"); // true
validateURL("not-a-url"); // false
```

### `validatePassword`

Validate password strength.

**Parameters:**

- `password: string` - Password to validate
- `options?: PasswordOptions` - Validation options

**Returns:** `{valid: boolean, errors: string[]}` - Validation result

**Usage:**

```tsx
validatePassword("Abc123!@#");
// { valid: true, errors: [] }

validatePassword("weak");
// { valid: false, errors: ['Too short', 'Missing uppercase'] }
```

### `validateRequired`

Check if value is not empty.

**Parameters:**

- `value: any` - Value to check

**Returns:** `boolean` - Is not empty

### `validateMinLength`

Check minimum length.

**Parameters:**

- `value: string` - Value to check
- `min: number` - Minimum length

**Returns:** `boolean` - Meets minimum length

### `validateMaxLength`

Check maximum length.

**Parameters:**

- `value: string` - Value to check
- `max: number` - Maximum length

**Returns:** `boolean` - Within maximum length

### `validateRange`

Check if number is within range.

**Parameters:**

- `value: number` - Value to check
- `min: number` - Minimum value
- `max: number` - Maximum value

**Returns:** `boolean` - Within range

### `validatePattern`

Validate against regex pattern.

**Parameters:**

- `value: string` - Value to validate
- `pattern: RegExp` - Regex pattern

**Returns:** `boolean` - Matches pattern

**Usage:**

```tsx
validatePattern("ABC123", /^[A-Z0-9]+$/); // true
```

---

## Sanitization

### `sanitizeHTML`

Sanitize HTML content to prevent XSS.

**Parameters:**

- `html: string` - HTML content to sanitize
- `options?: SanitizeOptions` - Sanitization options

**Returns:** `string` - Sanitized HTML

**Usage:**

```tsx
sanitizeHTML('<script>alert("XSS")</script><p>Safe content</p>');
// '<p>Safe content</p>'
```

### `sanitizeInput`

Sanitize user input.

**Parameters:**

- `input: string` - Input to sanitize
- `options?: SanitizeInputOptions`

**Returns:** `string` - Sanitized input

**Usage:**

```tsx
sanitizeInput("<b>Hello</b>"); // 'Hello' (strips HTML)
```

### `escapeHTML`

Escape HTML special characters.

**Parameters:**

- `text: string` - Text to escape

**Returns:** `string` - Escaped text

**Usage:**

```tsx
escapeHTML("<script>alert()</script>");
// '&lt;script&gt;alert()&lt;/script&gt;'
```

### `stripHTML`

Remove all HTML tags.

**Parameters:**

- `html: string` - HTML content

**Returns:** `string` - Plain text

**Usage:**

```tsx
stripHTML("<p>Hello <b>World</b></p>"); // 'Hello World'
```

### `sanitizeFilename`

Sanitize filename for safe storage.

**Parameters:**

- `filename: string` - Filename to sanitize

**Returns:** `string` - Safe filename

**Usage:**

```tsx
sanitizeFilename("my file (1).txt"); // 'my-file-1.txt'
```

### `sanitizeURL`

Sanitize URL to prevent injection.

**Parameters:**

- `url: string` - URL to sanitize

**Returns:** `string` - Safe URL

**Usage:**

```tsx
sanitizeURL("javascript:alert(1)"); // '' (blocked)
sanitizeURL("https://example.com"); // 'https://example.com'
```

---

## Price Utilities

### `calculateDiscount`

Calculate discount amount and percentage.

**Parameters:**

- `originalPrice: number` - Original price
- `discountedPrice: number` - Discounted price

**Returns:** `{amount: number, percentage: number}` - Discount info

**Usage:**

```tsx
calculateDiscount(1000, 800);
// { amount: 200, percentage: 20 }
```

### `applyDiscount`

Apply discount to price.

**Parameters:**

- `price: number` - Original price
- `discount: number` - Discount (amount or percentage)
- `isPercentage?: boolean` - Is percentage (default: false)

**Returns:** `number` - Discounted price

**Usage:**

```tsx
applyDiscount(1000, 20, true); // 800
applyDiscount(1000, 200, false); // 800
```

### `calculateTax`

Calculate tax amount.

**Parameters:**

- `price: number` - Base price
- `taxRate: number` - Tax rate (percentage)

**Returns:** `number` - Tax amount

**Usage:**

```tsx
calculateTax(1000, 18); // 180 (18% GST)
```

### `calculateTotal`

Calculate total with tax and discounts.

**Parameters:**

- `basePrice: number` - Base price
- `options?: CalculateTotalOptions`
  - `taxRate?: number` - Tax rate
  - `discount?: number` - Discount amount
  - `shipping?: number` - Shipping cost

**Returns:** `number` - Total amount

**Usage:**

```tsx
calculateTotal(1000, {
  taxRate: 18,
  discount: 100,
  shipping: 50,
}); // (1000 - 100 + 180 + 50) = 1130
```

### `splitPrice`

Split price into whole and decimal parts.

**Parameters:**

- `price: number` - Price to split

**Returns:** `{whole: string, decimal: string}` - Price parts

**Usage:**

```tsx
splitPrice(1999.99); // { whole: '1999', decimal: '99' }
```

### `comparePrices`

Compare two prices and return difference.

**Parameters:**

- `price1: number` - First price
- `price2: number` - Second price

**Returns:** `{difference: number, percentage: number, cheaper: 1 | 2}`

**Usage:**

```tsx
comparePrices(1000, 800);
// { difference: 200, percentage: 20, cheaper: 2 }
```

---

## Accessibility

### `getAriaLabel`

Generate accessible label for element.

**Parameters:**

- `label: string` - Base label
- `context?: object` - Additional context

**Returns:** `string` - ARIA label

### `getFocusableElements`

Get all focusable elements within container.

**Parameters:**

- `container: HTMLElement` - Container element

**Returns:** `HTMLElement[]` - Focusable elements

**Usage:**

```tsx
const focusables = getFocusableElements(dialogRef.current);
```

### `trapFocus`

Trap focus within container (for modals/dialogs).

**Parameters:**

- `container: HTMLElement` - Container to trap focus in

**Returns:** `() => void` - Cleanup function

**Usage:**

```tsx
useEffect(() => {
  const cleanup = trapFocus(modalRef.current);
  return cleanup;
}, [isOpen]);
```

### `announceToScreenReader`

Announce message to screen readers.

**Parameters:**

- `message: string` - Message to announce
- `priority?: 'polite' | 'assertive'` - Announcement priority

**Usage:**

```tsx
announceToScreenReader("Item added to cart", "polite");
```

### `setPageTitle`

Set accessible page title.

**Parameters:**

- `title: string` - Page title
- `announceChange?: boolean` - Announce title change

**Usage:**

```tsx
setPageTitle("Product Details - MyStore", true);
```

---

## Error Handling

### `BaseService`

Base class for API services with error handling.

**Usage:**

```tsx
class UserService extends BaseService {
  async getUsers() {
    return this.request("/users");
  }
}
```

### `logError`

Log error with context.

**Parameters:**

- `error: Error` - Error to log
- `context?: object` - Additional context

**Usage:**

```tsx
try {
  await fetchData();
} catch (error) {
  logError(error, { userId, action: "fetchData" });
}
```

### `formatError`

Format error for display.

**Parameters:**

- `error: Error | string` - Error to format

**Returns:** `string` - User-friendly error message

**Usage:**

```tsx
const errorMessage = formatError(error);
```

### `isNetworkError`

Check if error is network-related.

**Parameters:**

- `error: Error` - Error to check

**Returns:** `boolean` - Is network error

### `isAuthError`

Check if error is authentication-related.

**Parameters:**

- `error: Error` - Error to check

**Returns:** `boolean` - Is auth error

### `retryWithBackoff`

Retry failed operation with exponential backoff.

**Parameters:**

- `fn: () => Promise<T>` - Function to retry
- `options?: RetryOptions`
  - `maxRetries?: number` - Maximum retry attempts
  - `initialDelay?: number` - Initial delay (ms)
  - `maxDelay?: number` - Maximum delay (ms)

**Returns:** `Promise<T>` - Operation result

**Usage:**

```tsx
const data = await retryWithBackoff(() => fetchData(), { maxRetries: 3 });
```

---

## Data Fetching Adapters

### `createQueryAdapter`

Create adapter for data fetching library integration.

**Parameters:**

- `config: QueryAdapterConfig` - Adapter configuration

**Returns:** `QueryAdapter` - Query adapter instance

**Usage:**

```tsx
const adapter = createQueryAdapter({
  baseURL: "https://api.example.com",
  headers: { Authorization: `Bearer ${token}` },
});
```

### `queryHelpers`

Helper functions for query operations.

#### `buildQueryKey`

Build query cache key.

**Parameters:**

- `...parts: any[]` - Key parts

**Returns:** `string[]` - Query key

**Usage:**

```tsx
const key = buildQueryKey("users", userId, { include: "profile" });
// ['users', '123', 'include=profile']
```

#### `invalidateQueries`

Invalidate query cache.

**Parameters:**

- `keys: string[]` - Query keys to invalidate

**Usage:**

```tsx
invalidateQueries(["users", "products"]);
```

#### `prefetchQuery`

Prefetch data for faster loading.

**Parameters:**

- `queryKey: string[]` - Query key
- `queryFn: () => Promise<T>` - Query function

**Usage:**

```tsx
await prefetchQuery(["user", userId], () => fetchUser(userId));
```

---

## Utility Composition Examples

### Form Validation

```tsx
function validateForm(values) {
  const errors = {};

  if (!validateRequired(values.email)) {
    errors.email = "Email is required";
  } else if (!validateEmail(values.email)) {
    errors.email = "Invalid email format";
  }

  if (!validateRequired(values.phone)) {
    errors.phone = "Phone is required";
  } else if (!validatePhone(values.phone)) {
    errors.phone = "Invalid phone number";
  }

  if (values.password && !validatePassword(values.password).valid) {
    errors.password = "Password is too weak";
  }

  return errors;
}
```

### Data Formatting Pipeline

```tsx
function formatProductPrice(product) {
  const discounted = applyDiscount(product.price, product.discount, true);

  const withTax = calculateTotal(discounted, {
    taxRate: 18,
  });

  return formatCurrency(withTax);
}
```

### Safe Data Display

```tsx
function DisplayContent({ html }) {
  const sanitized = sanitizeHTML(html);
  const truncated = truncateText(stripHTML(sanitized), 200);

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

For more utility examples and best practices, see the [Getting Started Guide](./getting-started.md).
