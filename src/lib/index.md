# Lib Folder - Utility Libraries

This folder contains utility functions, helpers, and libraries that are shared across the application.

## Environment & Configuration

### env.ts

**Exports:** Type-safe environment variables with runtime validation

**Key Exports:**

- `env` - Validated environment variables object (typed)
- `isDevelopment` - Boolean flag for development mode
- `isProduction` - Boolean flag for production mode
- `isTest` - Boolean flag for test mode
- `getAllowedFileTypes()` - Get allowed file types as array
- `getFirebaseClientConfig()` - Firebase client configuration
- `getFirebaseAdminConfig()` - Firebase Admin SDK configuration
- `getRateLimitConfig()` - Rate limiting configuration

**Features:**

- Runtime validation using Zod schemas
- Type-safe access to environment variables
- Automatic validation on import
- Server-side and client-side variable separation
- Helpful error messages for missing/invalid variables

**Usage:**

```typescript
import { env, getFirebaseClientConfig } from "@/lib/env";

// Type-safe access
const apiUrl = env.NEXT_PUBLIC_API_URL; // string (validated)
const maxFileSize = env.MAX_FILE_SIZE; // number

// Helper functions
if (env.isDevelopment) {
  console.log("Running in development mode");
}

const firebaseConfig = getFirebaseClientConfig();
```

---

## Security & Permissions

### permissions.ts ✅

**Exports:** Granular permission-based access control system

**Key Exports:**

- `PERMISSIONS` - All available permissions (100+ permissions)
- `ROLE_PERMISSIONS` - Role-to-permissions mapping
- `hasPermission(user, permission)` - Check single or multiple permissions (any)
- `hasAllPermissions(user, permissions)` - Check all permissions required
- `getUserPermissions(user)` - Get all user permissions
- `hasRole(user, role)` - Check user role
- `isAdmin(user)` - Check if user is admin
- `isSeller(user)` - Check if user is seller
- `isAuthenticated(user)` - Check if user is authenticated

**Permission Categories:**

- **Products**: view, create, edit, delete, publish, feature, manage_all
- **Orders**: view_own, view_all, create, update, cancel, refund, manage_all
- **Shops**: view, create, edit, delete, manage_all
- **Users**: view, edit_own, edit_all, delete, manage_roles
- **Reviews**: view, create, edit_own, delete_own, moderate
- **Categories**: view, create, edit, delete
- **Auctions**: view, create, edit, delete, bid, manage_all
- **Payments**: view_own, view_all, process, refund
- **Analytics**: view_own, view_all
- **Support**: view_own, create, manage_all
- **Admin**: dashboard, settings, manage_system

**Features:**

- ✅ **Granular permissions** (January 10, 2026)
- ✅ **Role-based defaults** (admin, seller, user, guest)
- ✅ **Custom permissions** (per-user overrides)
- ✅ **Multiple permission checks** (any or all)
- ✅ **Type-safe** (TypeScript enums and types)

**Usage:**

```typescript
import { hasPermission, PERMISSIONS, isAdmin } from "@/lib/permissions";

// Check single permission
if (hasPermission(user, PERMISSIONS.PRODUCTS_CREATE)) {
  // User can create products
}

// Check multiple permissions (any)
if (
  hasPermission(user, [PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT])
) {
  // User can create OR edit products
}

// Check multiple permissions (all)
if (
  hasAllPermissions(user, [
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_PUBLISH,
  ])
) {
  // User can create AND publish products
}

// Role checks
if (isAdmin(user)) {
  // User is admin
}
```

---

### rate-limiter.ts ✅

**Exports:** In-memory rate limiting using sliding window algorithm

**Key Exports:**

- `RateLimiter` - Rate limiter class
- `RateLimitError` - Error thrown when limit exceeded
- `RateLimiters` - Pre-configured limiters (auth, api, public, passwordReset, search)

**Features:**

- ✅ **Sliding window algorithm** (January 10, 2026)
- ✅ **In-memory storage** (Map-based, no external dependencies)
- ✅ **Configurable limits** (points and duration)
- ✅ **Auto-cleanup** (periodic removal of expired entries)
- ✅ **Rich API** (consume, penalty, reward, block, delete)
- ✅ **Pre-configured limiters** (5 common use cases)
- ✅ **Type-safe** (Full TypeScript support)

**Pre-configured Limiters:**

- `RateLimiters.auth` - 5 requests per 15 minutes (strict for auth)
- `RateLimiters.api` - 100 requests per minute (standard API)
- `RateLimiters.public` - 300 requests per minute (lenient for public)
- `RateLimiters.passwordReset` - 3 requests per hour (very strict)
- `RateLimiters.search` - 60 requests per minute (moderate)

**Usage:**

```typescript
import { RateLimiter, RateLimitError, RateLimiters } from "@/lib/rate-limiter";

// Create custom limiter
const limiter = new RateLimiter({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

// Use pre-configured limiter
const authLimiter = RateLimiters.auth;

// Consume points
try {
  const result = await limiter.consume(clientIp);
  console.log(`Remaining: ${result.remainingPoints}`);
  // Request allowed
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limit exceeded. Retry after ${error.retryAfter}s`);
    // Return 429 Too Many Requests
  }
}

// Check without consuming
const state = limiter.get(clientIp);
if (state && !state.isAllowed) {
  console.log(`Blocked. Wait ${state.msBeforeNext}ms`);
}

// Penalty (add extra points)
await limiter.penalty(clientIp, 5);

// Reward (reduce consumed points)
await limiter.reward(clientIp, 2);

// Block identifier
await limiter.block(suspiciousIp);

// Reset
await limiter.delete(clientIp);
```

---

## Core Utilities

### utils.ts

**Exports:** Various utility functions

**Key Functions:**

- `cn(...classes)` - Conditional className merger (uses clsx)
- `formatCurrency(amount, currency)` - Format money values
- `formatDate(date, format)` - Format dates
- `formatRelativeTime(date)` - "2 hours ago" formatting
- `debounce(fn, delay)` - Debounce function calls
- `throttle(fn, delay)` - Throttle function calls
- `sleep(ms)` - Promise-based delay
- `retry(fn, attempts)` - Retry failed operations

---

### formatters.ts

**Exports:** Data formatting utilities

**Key Functions:**

- `formatPrice(price)` - Format price with rupee symbol
- `formatDiscount(original, discounted)` - Format discount percentage
- `formatPhoneNumber(phone)` - Format Indian phone numbers
- `formatAddress(address)` - Format address for display
- `formatDate(date, format)` - Comprehensive date formatting
- `formatFileSize(bytes)` - Format file sizes (KB, MB, etc.)
- `formatNumber(num, locale)` - Format numbers with locale
- `truncateText(text, length)` - Truncate with ellipsis

---

### price.utils.ts

**Exports:** Price calculation utilities

**Key Functions:**

- `calculateDiscount(price, discount)` - Calculate discounted price
- `calculateDiscountPercent(original, final)` - Discount percentage
- `calculateTax(subtotal, taxRate)` - Calculate tax amount
- `calculateTotal(items)` - Calculate cart/order total
- `formatINR(amount)` - Format as Indian Rupees
- `parsePrice(priceString)` - Parse price from string
- `comparePrices(price1, price2)` - Price comparison

---

### date-utils.ts

**Exports:** Date manipulation utilities

**Key Functions:**

- `formatDate(date, format)` - Format dates
- `parseDate(dateString)` - Parse date strings
- `addDays(date, days)` - Add days to date
- `subtractDays(date, days)` - Subtract days
- `isSameDay(date1, date2)` - Compare dates
- `isToday(date)` - Check if date is today
- `isExpired(date)` - Check if date is past
- `getDaysDifference(date1, date2)` - Days between dates
- `formatRelativeTime(date)` - Relative time formatting

---

## Firebase Utilities

### firebase/admin.ts

**Exports:** Firebase Admin SDK configuration (server-side)

**Purpose:** Server-side Firebase operations in API routes.

**Features:**

- Firebase Admin initialization
- Server-side authentication
- Firestore admin access
- Firebase Storage admin
- Custom token generation

---

### firebase/client.ts

**Exports:** Firebase Client SDK configuration

**Purpose:** Client-side Firebase operations.

**Features:**

- Firebase app initialization
- Authentication
- Firestore
- Storage
- Analytics

---

### firebase-error-logger.ts

**Exports:** `logError`, `logWarning`, `logInfo`

**Purpose:** Centralized error logging to Firebase/Sentry.

**Key Functions:**

- `logError(error, context)` - Log errors with context
- `logWarning(message, context)` - Log warnings
- `logInfo(message, context)` - Log info messages
- `setUser(user)` - Associate user with logs
- `captureException(error)` - Capture exceptions

**Features:**

- Automatic error categorization
- Stack trace capture
- Context enrichment
- User association
- Environment detection

---

## Validation Utilities

### form-validation.ts

**Exports:** Form validation functions

**Key Functions:**

- `validateEmail(email)` - Email validation
- `validatePhone(phone)` - Phone number validation
- `validatePassword(password)` - Password strength validation
- `validatePincode(pincode)` - Indian pincode validation
- `validateGST(gst)` - GST number validation
- `validatePAN(pan)` - PAN number validation
- `validateAadhar(aadhar)` - Aadhar number validation
- `validateURL(url)` - URL validation
- `validateRequired(value)` - Required field validation

---

### validators.ts

**Exports:** Generic validators

**Key Functions:**

- `isValidEmail(email)` - Email check
- `isValidPhone(phone)` - Phone check
- `isValidURL(url)` - URL check
- `isPositiveNumber(num)` - Positive number check
- `isInRange(value, min, max)` - Range validation
- `matchesPattern(value, pattern)` - Regex matching
- `hasMinLength(value, min)` - Min length check
- `hasMaxLength(value, max)` - Max length check

---

### validators/product-validators.ts

**Exports:** Product-specific validation

**Key Functions:**

- `validateProductData(data)` - Complete product validation
- `validateSKU(sku)` - SKU validation
- `validatePrice(price)` - Price validation
- `validateStock(stock)` - Stock validation
- `validateDimensions(dimensions)` - Dimension validation
- `validateWeight(weight)` - Weight validation

---

## API & Network

### api-errors.ts

**Exports:** API error handling utilities

**Classes:**

- `APIError` - Base API error class
- `ValidationError` - Validation failure
- `AuthenticationError` - Auth failure
- `AuthorizationError` - Permission denied
- `NotFoundError` - Resource not found
- `RateLimitError` - Rate limit exceeded
- `ServerError` - Server error

**Functions:**

- `handleAPIError(error)` - Error handler
- `isAPIError(error)` - Type guard
- `getErrorMessage(error)` - Extract user message

---

### error-logger.ts

**Exports:** Error logging utilities

**Key Functions:**

- `logError(error, context)` - Log error
- `logWarning(message, context)` - Log warning
- `trackError(error)` - Track to analytics
- `notifyError(error)` - Notify error service
- `formatErrorForLogging(error)` - Format error

---

### error-redirects.ts

**Exports:** Error redirect utilities

**Key Functions:**

- `unauthorized.notLoggedIn(returnUrl)` - Redirect to login
- `forbidden.wrongRole(required, actual, returnUrl)` - Permission denied redirect
- `notFound.resourceNotFound(resource)` - 404 redirect
- `serverError.internalError()` - 500 redirect
- `getRedirectUrl(error)` - Get appropriate redirect

---

## SEO Utilities

### seo/metadata.ts

**Exports:** SEO metadata generation

**Key Functions:**

- `generateMetadata(page, data)` - Generate page metadata
- `generateProductMeta(product)` - Product page meta
- `generateShopMeta(shop)` - Shop page meta
- `generateBlogMeta(post)` - Blog post meta
- `generateOGImage(data)` - Open Graph image URL
- `generateStructuredData(type, data)` - JSON-LD schema

---

### seo/sitemap.ts

**Exports:** Sitemap generation utilities

**Key Functions:**

- `generateSitemap()` - Generate XML sitemap
- `getSitemapURLs(type)` - Get URLs by type
- `updateSitemap()` - Update sitemap file
- `getSitemapIndex()` - Get sitemap index

---

## Media Utilities

### media/image-utils.ts

**Exports:** Image processing utilities

**Key Functions:**

- `compressImage(file, quality)` - Compress image
- `resizeImage(file, dimensions)` - Resize image
- `generateThumbnail(file)` - Create thumbnail
- `getImageDimensions(file)` - Get width/height
- `isValidImageType(type)` - Validate image type
- `convertToWebP(file)` - Convert to WebP format

---

### media/video-utils.ts

**Exports:** Video processing utilities

**Key Functions:**

- `extractThumbnail(video, time)` - Extract video frame
- `getVideoDuration(file)` - Get duration
- `isValidVideoType(type)` - Validate video type
- `compressVideo(file)` - Compress video

---

## Analytics

### analytics.ts

**Exports:** Analytics utilities

**Key Functions:**

- `trackPageView(page)` - Track page view
- `trackEvent(category, action, label, value)` - Track event
- `trackPurchase(order)` - E-commerce tracking
- `trackSearch(query)` - Search tracking
- `setUserId(userId)` - Set user ID
- `setUserProperties(properties)` - User properties

---

## Internationalization (i18n)

### i18n/config.ts

**Exports:** i18n configuration

**Features:**

- Language configuration
- Supported locales
- Default locale
- Locale detection

---

### i18n/useI18n.ts

**Exports:** `useI18n()` hook

**Purpose:** Translation hook for components.

**Returns:**

- `t(key, params?)` - Translate function
- `locale` - Current locale
- `setLocale(locale)` - Change locale
- `locales` - Available locales

---

### i18n/translations/\*.json

**Purpose:** Translation files for each language

**Structure:**

```json
{
  "common": {
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "auth": {
    "login": {
      "title": "Login"
    }
  }
}
```

---

## Theme Utilities

### theme/colors.ts

**Exports:** Theme color utilities

**Key Functions:**

- `getColor(name)` - Get theme color
- `setThemeColors(colors)` - Set custom colors
- `generateColorShades(base)` - Generate color palette

---

### theme/spacing.ts

**Exports:** Spacing utilities

**Constants:**

- Spacing scale
- Responsive breakpoints
- Container max widths

---

## Link Utilities

### link-utils.ts

**Exports:** URL and link utilities

**Key Functions:**

- `buildProductURL(product)` - Build product URL
- `buildShopURL(shop)` - Build shop URL
- `buildCategoryURL(category)` - Build category URL
- `parseQueryParams(url)` - Parse query string
- `buildQueryString(params)` - Build query string
- `isExternalLink(url)` - Check if external
- `sanitizeURL(url)` - Sanitize URL

---

## RBAC (Role-Based Access Control)

### rbac-permissions.ts

**Exports:** Permission checking utilities

**Key Functions:**

- `hasPermission(user, permission)` - Check permission
- `hasRole(user, role)` - Check role
- `hasAnyRole(user, roles)` - Check multiple roles
- `hasAllPermissions(user, permissions)` - Check multiple permissions
- `canAccess(user, resource, action)` - Resource access check

**Permissions:**

- `products.create` - Create products
- `products.edit` - Edit products
- `products.delete` - Delete products
- `orders.view` - View orders
- `orders.manage` - Manage orders
- `users.manage` - User management
- `settings.edit` - Edit settings

---

## Category Utilities

### category-hierarchy.ts

**Exports:** Category tree utilities

**Key Functions:**

- `buildCategoryTree(categories)` - Build tree structure
- `flattenCategoryTree(tree)` - Flatten tree
- `getCategoryPath(category)` - Get breadcrumb path
- `getSubcategories(categoryId)` - Get children
- `getParentCategory(categoryId)` - Get parent
- `isLeafCategory(category)` - Check if leaf node

---

## Payment Gateway Selector

### payment-gateway-selector.ts

**Exports:** Payment gateway selection logic

**Key Functions:**

- `selectPaymentGateway(amount, currency, preferences)` - Choose gateway
- `isGatewayAvailable(gateway)` - Check availability
- `getGatewayFees(gateway, amount)` - Calculate fees
- `getSupportedPaymentMethods(gateway)` - Get supported methods

---

### payment-logos.ts

**Exports:** Payment method logo utilities

**Key Functions:**

- `getPaymentLogo(method)` - Get logo URL
- `getPaymentName(method)` - Get display name
- `isPaymentMethodSupported(method)` - Check support

---

## Common Patterns

### Utility Organization

- Pure functions (no side effects)
- Single responsibility
- Composable functions
- TypeScript for type safety

### Error Handling

- Return null/undefined for optional failures
- Throw errors for critical failures
- Type guards for validation

### Performance

- Memoize expensive computations
- Lazy load heavy utilities
- Tree-shakeable exports

### Testing

- Unit test all utilities
- Edge case coverage
- Mock external dependencies
