# Analytics Module - Quick Reference Card

## 🚀 Functions

### trackEvent(eventName: string, params?: Record<string, any>)

Track custom events with optional parameters.

```typescript
trackEvent("product_view", { product_id: "123", category: "electronics" });
trackEvent("checkout_complete", { order_id: "ORD-456", total: 199.99 });
```

**Validates:**

- eventName must be non-empty string
- Handles null analytics gracefully

---

### trackSlowAPI(endpoint: string, duration: number)

Automatically track API calls that exceed 1000ms.

```typescript
trackSlowAPI("/api/products/search", 1500); // Tracked
trackSlowAPI("/api/health", 100); // NOT tracked (< 1000ms)
```

**Validates:**

- duration must be valid number (not NaN)
- endpoint must be non-empty string
- Only tracks if duration > 1000ms (not >=)

---

### trackAPIError(endpoint: string, error: any)

Track API errors with automatic message extraction.

```typescript
trackAPIError("/api/checkout", new Error("Payment failed"));
trackAPIError("/api/products", "Network error");
trackAPIError("/api/auth", null); // Defaults to "Unknown error"
```

**Handles:**

- Error objects (message + code)
- String errors
- Null/undefined
- Custom error classes
- Plain objects

---

### trackCacheHit(cacheKey: string, hit: boolean)

Track cache performance for monitoring.

```typescript
trackCacheHit("product:123", true); // Cache hit
trackCacheHit("search:laptop", false); // Cache miss
```

**Validates:**

- cacheKey must be string
- hit must be boolean

---

## 🔍 Common Patterns

### Pattern 1: Client-Side Only

```typescript
if (typeof window !== "undefined") {
  // Analytics only runs in browser
}
```

### Pattern 2: Null Check

```typescript
if (!analytics) return; // Early exit if unavailable
```

### Pattern 3: Input Validation

```typescript
if (!input || typeof input !== "string") {
  console.warn("Invalid input", input);
  return;
}
```

### Pattern 4: Optional Chaining

```typescript
error?.message || "Unknown error";
error?.code?.toString() || "unknown";
```

### Pattern 5: Try-Catch

```typescript
try {
  logEvent(analytics, eventName, params);
} catch (error) {
  logError(error); // Don't re-throw
}
```

---

## 🎯 Real-World Examples

### E-Commerce Flow

```typescript
trackEvent("checkout_initiated", { cart_value: 99.99 });
trackCacheHit("user:shipping:addresses", true);
trackSlowAPI("/api/payment/validate", 1200);
trackAPIError("/api/payment/process", new Error("Card declined"));
trackEvent("payment_completed", { order_id: "ORD-123" });
```

### Search Flow

```typescript
trackEvent("search_initiated", { query: "laptop" });
trackSlowAPI("/api/search?q=laptop", 800);
trackCacheHit("search:results:laptop", false);
trackEvent("filter_applied", { filter: "price", range: "1000-2000" });
```

### Auction Flow

```typescript
trackEvent("auction_viewed", { auction_id: "AUC-789" });
trackCacheHit("auction:AUC-789", true);
trackEvent("bid_placed", { amount: 5000, auction_id: "AUC-789" });
trackSlowAPI("/api/auctions/AUC-789/bid", 2500);
```

---

## ⚠️ Important Notes

### ✅ DO

- Always check analytics availability
- Validate inputs before tracking
- Use descriptive event names
- Include relevant parameters
- Monitor validation warnings in logs

### ❌ DON'T

- Track every single action
- Include sensitive data (passwords, tokens)
- Let tracking errors crash the app
- Track in loops without throttling
- Ignore console warnings

---

## 🐛 Troubleshooting

### Analytics not tracking?

```typescript
// Check browser console for warnings:
// "trackEvent: Invalid event name"
// "Analytics unavailable"
```

### Getting validation warnings?

```typescript
// Fix: Ensure correct types
trackEvent("test", { param: "value" }); // ✅ string
trackEvent(123, { param: "value" }); // ❌ number
```

### Server-side errors?

```typescript
// Analytics only works client-side
if (typeof window !== "undefined") {
  trackEvent("client_only");
}
```

---

## 📊 Testing

### Run Tests

```bash
npm test -- analytics-comprehensive.test.ts
```

### Coverage

- 159 comprehensive tests
- 100% pass rate
- All edge cases covered

---

## 📚 Documentation

| File                                                | Purpose              |
| --------------------------------------------------- | -------------------- |
| `src/lib/analytics.ts`                              | Production code      |
| `src/lib/__tests__/analytics-comprehensive.test.ts` | 159 tests            |
| `TDD/ANALYTICS-CODE-PATTERNS-AND-FIXES.md`          | Bug fixes & patterns |
| `TDD/ANALYTICS-TEST-SUMMARY-DEC-8-2025.md`          | Full summary         |
| `TDD/ANALYTICS-QUICK-REFERENCE.md`                  | This file            |

---

## 🔒 Security

### Safe Inputs

- SQL injection strings → Handled safely
- XSS attempts → Not rendered, only logged
- Path traversal → Validated as string

### Data Privacy

- Never track passwords or tokens
- Sanitize user data before tracking
- Follow GDPR/privacy requirements

---

## 💡 Pro Tips

1. **Use descriptive event names**: `product_view` not `pv`
2. **Include context**: Always add relevant IDs and metadata
3. **Monitor performance**: Check slow API logs regularly
4. **Cache effectively**: Track hit rates to optimize
5. **Error recovery**: Log errors but continue app flow

---

**Version:** 1.0  
**Last Updated:** December 8, 2025  
**Status:** Production Ready ✅
