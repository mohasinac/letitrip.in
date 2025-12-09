# Session 4 Quick Reference - Complete

## Test Files (827 tests total)

1. `src/lib/__tests__/analytics-comprehensive.test.ts` - 77 tests ✅
2. `src/lib/__tests__/error-redirects-comprehensive.test.ts` - 91 tests ✅
3. `src/lib/__tests__/rbac-permissions-comprehensive.test.ts` - 191 tests ✅
4. `src/lib/__tests__/payment-logos-comprehensive.test.ts` - 62 tests ✅
5. `src/lib/__tests__/date-utils-comprehensive.test.ts` - 89 tests ✅
6. `src/lib/__tests__/price.utils-comprehensive.test.ts` - 103 tests ✅
7. `src/lib/__tests__/link-utils-comprehensive.test.ts` - 98 tests ✅
8. `src/lib/__tests__/firebase-error-logger-comprehensive.test.ts` - 45 tests ✅
9. `src/lib/__tests__/error-logger-comprehensive.test.ts` - 71 tests ✅

## Quick Commands

```powershell
# Run all Session 4 tests
npm test -- analytics-comprehensive.test.ts error-redirects-comprehensive.test.ts rbac-permissions-comprehensive.test.ts payment-logos-comprehensive.test.ts date-utils-comprehensive.test.ts price.utils-comprehensive.test.ts link-utils-comprehensive.test.ts firebase-error-logger-comprehensive.test.ts error-logger-comprehensive.test.ts

# Run individual
npm test -- analytics-comprehensive.test.ts
npm test -- error-redirects-comprehensive.test.ts
npm test -- rbac-permissions-comprehensive.test.ts
npm test -- payment-logos-comprehensive.test.ts
npm test -- date-utils-comprehensive.test.ts
npm test -- price.utils-comprehensive.test.ts
npm test -- link-utils-comprehensive.test.ts
npm test -- firebase-error-logger-comprehensive.test.ts
npm test -- error-logger-comprehensive.test.ts
```

## Critical Patterns

### 1. Analytics - Graceful Degradation

```typescript
// Pattern: Null-safe operations
if (!analytics) return; // No-op if unavailable

// Where: All tracking functions
// Why: SSR compatibility, browser support, no crashes
```

### 2. Error Redirects - Double Encoding (Security)

```typescript
// Pattern: encodeURIComponent + URLSearchParams = double encoding
searchParams.set("details", encodeURIComponent(fullDetails));

// Example: "Error: Test" → "Error%253A%2520Test"
// Where: All error URL generators
// Why: XSS prevention, URL safety
```

### 3. RBAC - Role Hierarchy

```typescript
// Pattern: Numeric role levels for permission inheritance
const levels = { admin: 100, seller: 50, user: 10, guest: 0 };

// Higher roles inherit lower role permissions
```

### 4. Payment Logos - Three-Tier Loading

```typescript
// Pattern: Cascading fallback strategy
// 1. Try Firebase Storage
const url = await getPaymentLogoUrl(storageService, paymentId);
if (url) return url;

// 2. Use predefined SVG
if (DEFAULT_PAYMENT_LOGOS[paymentId.toLowerCase()]) {
  return DEFAULT_PAYMENT_LOGOS[paymentId.toLowerCase()];
}

// 3. Generate text fallback
return generateTextFallback(paymentId); // Always returns something

// Where: getPaymentLogo()
// Why: Flexibility + Performance + Reliability
```

### 5. Date Utils - Firestore Timestamp Handling

```typescript
// Pattern: Check for Firestore Timestamp structure
if (date?.seconds !== undefined) {
  const d = new Date(date.seconds * 1000); // Convert to milliseconds
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

// Where: All date conversion functions
// Why: Firestore stores dates as { seconds, nanoseconds }, not native Date
```

### 6. Price Utils - Currency Configuration

```typescript
// Pattern: Locale-aware currency formatting
const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  INR: { symbol: "₹", locale: "en-IN", position: "before" },
  USD: { symbol: "$", locale: "en-US", position: "before" },
  // ...
};

// Where: formatPrice(), formatPriceRange()
// Why: Different locales need different formatting (INR uses लाख notation)
```

### 7. Firebase Error Logger - Fail-Silent Logging

```typescript
// Pattern: Never crash while logging errors
try {
  if (analytics && typeof globalThis !== "undefined" && globalThis.document) {
    logEvent(analytics, "exception", { description, fatal, ...context });
  }
} catch (loggingError) {
  console.error("Failed to log error:", loggingError);
}

// Where: logError(), logPerformance(), logUserAction()
// Why: Error logging must never cause errors (infinite loop prevention)
```

### 8. Error Logger - Severity-Based Console Output

```typescript
// Pattern: Different console methods for different severities
if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
  console.error(`🔴 ${prefix}`, { message, context });
} else if (severity === ErrorSeverity.MEDIUM) {
  console.warn(`🟡 ${prefix}`, { message, context });
} else {
  console.info(`🟢 ${prefix}`, { message, context });
}

// Where: ErrorLogger.log()
// Why: Visual differentiation + browser DevTools filtering + production spam reduction
```

## Double Encoding Cheat Sheet

```
:    → %3A  → %253A  (colon)
space → %20  → %2520  (space)
%    → %25  → %2525  (percent)
<    → %3C  → %253C  (less than)
/    → %2F  → %252F  (slash)
```

## RBAC Role Levels

```
admin  = 100  (full access)
seller = 50   (manage own shop/products)
user   = 10   (create orders/reviews)
guest  = 0    (view public only)
```

## Common Test Patterns

### Null Safety

```typescript
it("handles null user", () => {
  expect(someFunction(null, data)).toBe(false);
  expect(() => someFunction(null, data)).not.toThrow();
});
```

### Double Encoding Test

```typescript
it("double encodes details", () => {
  const url = notFoundUrl({ details: "Error: Test" });
  expect(url).toContain("Error%253A%2520Test"); // Double encoded
});
```

### Role Permission Test

```typescript
it("admin can do everything", () => {
  expect(canReadResource(adminUser, "any", anyData)).toBe(true);
  expect(canWriteResource(adminUser, "any", "create")).toBe(true);
  expect(canDeleteResource(adminUser, "any", anyData)).toBe(true);
});
```

### Ownership Detection

```typescript
it("detects via multiple fields", () => {
  expect(isResourceOwner(user, { userId: "user-123" })).toBe(true);
  expect(isResourceOwner(user, { createdBy: "user-123" })).toBe(true);
  expect(isResourceOwner(seller, { shopId: "shop-456" })).toBe(true);
});
```

## Mock Setups

### Analytics

```typescript
jest.mock("firebase/analytics", () => ({
  getAnalytics: jest.fn(() => mockAnalytics),
  isSupported: jest.fn(() => Promise.resolve(true)),
  logEvent: jest.fn(),
}));
```

### Error Redirects

```typescript
beforeAll(() => {
  jest
    .spyOn(Date, "now")
    .mockReturnValue(new Date("2024-12-08T10:00:00.000Z").getTime());
});
```

### RBAC (No mocks needed)

```typescript
// Use test fixtures
const adminUser: AuthUser = { uid: "admin-123", role: "admin", ... };
const sellerUser: AuthUser = { uid: "seller-456", role: "seller", shopId: "shop-789" };
```

## Resource Types & Access

### Public Resources

- `hero_slides`, `categories`, `products`, `auctions`, `shops`
- Anyone can read active/published items
- Only sellers can create/update own items

### Auth-Required

- `coupons` - No guest access
- `reviews` - Approval-based visibility
- `orders`, `tickets`, `payouts` - Private resources

### Special Rules

- Sellers can create only 1 shop
- Users cannot update order status
- Sellers cannot approve their own payouts
- Reviews need approval to be public

## Stats

- **Session 4**: 827 tests (77 + 91 + 191 + 62 + 89 + 103 + 98 + 45 + 71)
- **Total (1-4)**: 1,675 tests
- **Pass Rate**: 100%
- **Modules**: 17 completed
- **Patterns**: 8 documented

## Key Files

- Analytics: `src/lib/analytics.ts`
- Error Redirects: `src/lib/error-redirects.ts`
- RBAC Permissions: `src/lib/rbac-permissions.ts`
- Payment Logos: `src/lib/payment-logos.ts`
- Date Utils: `src/lib/date-utils.ts`
- Price Utils: `src/lib/price.utils.ts`
- Link Utils: `src/lib/link-utils.ts`
- Firebase Error Logger: `src/lib/firebase-error-logger.ts`
- Error Logger: `src/lib/error-logger.ts`
- RBAC: `src/lib/rbac-permissions.ts`
