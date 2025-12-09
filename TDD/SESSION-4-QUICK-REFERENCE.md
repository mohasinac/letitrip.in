# Session 4 Quick Reference - Analytics & Error Redirects

## Test Files

- `src/lib/__tests__/analytics-comprehensive.test.ts` - 77 tests ✅
- `src/lib/__tests__/error-redirects-comprehensive.test.ts` - 91 tests ✅

## Key Commands

```powershell
# Run analytics tests
npm test -- analytics-comprehensive.test.ts

# Run error-redirects tests
npm test -- error-redirects-comprehensive.test.ts

# Run both
npm test -- analytics-comprehensive.test.ts error-redirects-comprehensive.test.ts
```

## Critical Patterns

### 1. Analytics - Graceful Degradation

```typescript
// Pattern: Null-safe operations
if (!analytics) return; // No-op if unavailable

// Why: SSR compatibility, works without analytics
// Where: All tracking functions (trackEvent, trackSlowAPI, etc.)
```

### 2. Error Redirects - Double Encoding

```typescript
// Pattern: encodeURIComponent + URLSearchParams = double encoding
searchParams.set("details", encodeURIComponent(fullDetails));

// Example: "Error: Test" → "Error%253A%2520Test"
// Why: XSS prevention, URL safety
// Where: All error URL generators (notFoundUrl, unauthorizedUrl, forbiddenUrl)
```

## Double Encoding Cheat Sheet

| Input | Single | Double  |
| ----- | ------ | ------- |
| `:`   | `%3A`  | `%253A` |
| Space | `%20`  | `%2520` |
| `%`   | `%25`  | `%2525` |
| `<`   | `%3C`  | `%253C` |
| `/`   | `%2F`  | `%252F` |

## Test Expectations

```typescript
// ❌ Wrong (single encoding)
expect(url).toContain("Error:%20Test");

// ✅ Correct (double encoding)
expect(url).toContain("Error%253A%2520Test");
```

## Mock Setup

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

## Common Test Patterns

### Testing Null Safety

```typescript
it("handles null analytics", () => {
  (getAnalytics as jest.Mock).mockReturnValueOnce(null);
  expect(() => trackEvent("test")).not.toThrow();
});
```

### Testing URL Encoding

```typescript
it("encodes special characters", () => {
  const url = notFoundUrl({ details: "Error: Test" });
  expect(url).toContain("Error%253A%2520Test"); // Double encoded
});
```

### Testing XSS Prevention

```typescript
it("prevents XSS", () => {
  const url = notFoundUrl({
    error: new Error("<script>alert('xss')</script>"),
  });
  expect(url).not.toContain("<script>");
  expect(url).toContain("%253Cscript%253E"); // Double encoded
});
```

## Stats

- **Session 4**: 168 tests
- **Total (1-4)**: 1,016 tests
- **Pass Rate**: 100%
- **Modules**: 10 completed
- **Patterns**: 2 documented
