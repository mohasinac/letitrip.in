# Slug Validation - Developer Quick Card

**Status:** ✅ Production Ready | **Date:** Nov 7, 2025

---

## Quick Start

### 1. Import Hook

```typescript
import { useSlugValidation } from "@/hooks/useSlugValidation";
```

### 2. Use in Form

```typescript
const { isAvailable, isValidating, validateSlug } = useSlugValidation({
  endpoint: "/api/shops/validate-slug",
  excludeId: shopId, // optional: for edit mode
});
```

### 3. Connect to Input

```typescript
<input onChange={(e) => validateSlug(e.target.value)} />;
{
  isValidating && <Spinner />;
}
{
  isAvailable === false && <Error>Taken</Error>;
}
{
  isAvailable === true && <Success>Available</Success>;
}
```

---

## Endpoints Cheat Sheet

| Entity   | Endpoint                        | Params                           | Scope          |
| -------- | ------------------------------- | -------------------------------- | -------------- |
| Shop     | `/api/shops/validate-slug`      | `slug`, `exclude_id?`            | Global         |
| Product  | `/api/products/validate-slug`   | `slug`, `shop_id`, `exclude_id?` | Per Shop       |
| Coupon   | `/api/coupons/validate-code`    | `code`, `shop_id`, `exclude_id?` | Per Shop       |
| Auction  | `/api/auctions/validate-slug`   | `slug`, `exclude_id?`            | Global         |
| Category | `/api/categories/validate-slug` | `slug`, `exclude_id?`            | Global (Admin) |

---

## Common Patterns

### Shop Form

```typescript
useSlugValidation({
  endpoint: "/api/shops/validate-slug",
  excludeId: shopId,
});
```

### Product Form

```typescript
useSlugValidation({
  endpoint: "/api/products/validate-slug",
  params: { shop_id: shopId },
  excludeId: productId,
});
```

### Coupon Form

```typescript
useSlugValidation({
  endpoint: "/api/coupons/validate-code",
  params: { shop_id: shopId },
  excludeId: couponId,
});
```

---

## Hook Options

```typescript
{
  endpoint: string;           // Required: API endpoint
  params?: { shop_id: string }; // Optional: additional params
  excludeId?: string;         // Optional: for edit mode
  debounceMs?: number;        // Optional: default 500ms
  initialSlug?: string;       // Optional: validate on mount
}
```

---

## Hook Return Values

```typescript
{
  slug: string;               // Current slug
  isAvailable: boolean | null; // null=not validated, true=available, false=taken
  isValidating: boolean;      // Is validating right now
  error: string | null;       // Validation error
  validateSlug: (slug: string) => void; // Trigger validation
  reset: () => void;          // Reset state
}
```

---

## Response Format

```json
{
  "success": true,
  "available": true,
  "slug": "awesome-shop"
}
```

---

## Error Handling

```typescript
if (error) {
  return <div className="text-red-500">{error}</div>;
}

if (isAvailable === false) {
  return <div className="text-red-500">Already taken</div>;
}
```

---

## Debounce Tuning

| Network | Recommended     |
| ------- | --------------- |
| Fast    | 300ms           |
| Normal  | 500ms (default) |
| Slow    | 1000ms          |
| Mobile  | 700ms           |

---

## Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

---

## Full Docs

📖 `/CHECKLIST/SLUG_VALIDATION_GUIDE.md`

---

**Quick Copy-Paste Template:**

```typescript
import { useSlugValidation } from "@/hooks/useSlugValidation";

const { isAvailable, isValidating, validateSlug } = useSlugValidation({
  endpoint: "/api/shops/validate-slug",
  excludeId: id,
});

<input onChange={(e) => validateSlug(e.target.value)} />;
{
  isValidating && <span>Checking...</span>;
}
{
  isAvailable === false && <span>Taken</span>;
}
{
  isAvailable === true && <span>Available</span>;
}
```
