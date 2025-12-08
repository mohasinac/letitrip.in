# TRANSFORMATION PATTERNS - QUICK REFERENCE

## December 8, 2024

Quick reference guide for common transformation patterns used in the codebase.

---

## Pattern Index

| #   | Pattern                 | Use Case                       | Example File           |
| --- | ----------------------- | ------------------------------ | ---------------------- |
| 1   | Date Parsing            | Firestore Timestamp → Date     | All transforms         |
| 2   | Price Formatting        | Number → ₹10,000               | All transforms         |
| 3   | Relative Time           | Date → "2h ago"                | user, review           |
| 4   | Rating Rounding         | 4.67 → 4.7                     | product, shop          |
| 5   | Status Flags            | Enum → boolean flags           | All transforms         |
| 6   | Stock Calculation       | variants → inStock/outOfStock  | product                |
| 7   | Discount Calculation    | price - sale → hasDiscount     | product                |
| 8   | Badge Generation        | conditions → ["New", "Sale"]   | product, shop, auction |
| 9   | Backwards Compatibility | new field → old alias          | All transforms         |
| 10  | Batch Transformation    | array → transformed array      | All transforms         |
| 11  | Form-to-BE              | FE form → BE request           | All transforms         |
| 12  | Initials Generation     | "John Doe" → "JD"              | user                   |
| 13  | Address Formatting      | object → "123 Main St, Mumbai" | address, order         |
| 14  | Validation Flags        | conditions → isValid booleans  | All transforms         |
| 15  | Progress Calculation    | status → 0-100%                | order                  |
| 16  | Time Remaining          | endTime → "2d 5h"              | auction                |
| 17  | Dynamic Badges          | context → ["Live", "Hot"]      | auction                |
| 18  | Address Multi-Format    | address → full/short           | order                  |
| 19  | Progress Steps          | status → step array            | order                  |
| 20  | Location Formatting     | city+state → "Mumbai, MH"      | shop                   |

---

## Common Patterns

### Parse Firestore Timestamp

```typescript
function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  if (date instanceof Timestamp) return date.toDate();
  return new Date(date);
}
```

### Format Indian Rupee Price

```typescript
import { formatPrice } from "@/lib/price.utils";

formattedPrice: formatPrice(1000);
// Output: "₹1,000"
```

### Generate Status Flags

```typescript
isActive: status === Status.PUBLISHED,
isDraft: status === Status.DRAFT,
isArchived: status === Status.ARCHIVED,
```

### Calculate Discount

```typescript
hasDiscount: salePrice > 0 && salePrice < price,
discountPercent: Math.round(((price - salePrice) / price) * 100),
savings: price - salePrice,
```

### Generate Badges

```typescript
const badges: string[] = [];
if (condition1) badges.push("Badge1");
if (condition2) badges.push("Badge2");
return badges;
```

### Backwards Compatibility

```typescript
return {
  // New field
  displayName: data.name,

  // Old alias (backwards compatibility)
  name: data.name,
};
```

---

## Order-Specific Patterns

### Progress Calculation

```typescript
const progressMap: Record<OrderStatus, number> = {
  [OrderStatus.PENDING]: 10,
  [OrderStatus.CONFIRMED]: 25,
  [OrderStatus.PROCESSING]: 50,
  [OrderStatus.SHIPPED]: 75,
  [OrderStatus.DELIVERED]: 100,
};
progressPercentage: progressMap[status] || 0;
```

### Progress Steps Generation

```typescript
const steps: OrderProgressStep[] = [
  {
    label: "Order Placed",
    status: "completed",
    date: createdAt,
    description: "Your order has been placed",
  },
  {
    label: "Confirmed",
    status: status >= OrderStatus.CONFIRMED ? "completed" : "pending",
    date: status >= OrderStatus.CONFIRMED ? createdAt : null,
    description: "Order confirmed by seller",
  },
  // ... more steps
];
```

### Address Formatting

```typescript
// Full address
formattedAddress: [addressLine1, addressLine2, city, state, postalCode, country]
  .filter(Boolean)
  .join(", ");

// Short address
shortAddress: `${city}, ${state}`;
```

---

## Auction-Specific Patterns

### Time Remaining Calculation

```typescript
const diff = endTime.getTime() - now.getTime();
const seconds = Math.floor(diff / 1000);

if (seconds <= 0) return { display: "Ended", seconds: 0 };

const days = Math.floor(seconds / 86400);
const hours = Math.floor((seconds % 86400) / 3600);
const minutes = Math.floor((seconds % 3600) / 60);

if (days > 0) return { display: `${days}d ${hours}h`, seconds };
if (hours > 0) return { display: `${hours}h ${minutes}m`, seconds };
return { display: `${minutes}m`, seconds };
```

### Dynamic Badge Generation

```typescript
const badges: string[] = [];

// Time-based
if (isActive && timeRemaining > 0) badges.push("Live");
if (timeRemaining < 3600) badges.push("Ending Soon");

// Activity-based
if (totalBids > 50) badges.push("Hot");

// Status-based
if (reserveMet) badges.push("Reserve Met");
if (buyNowPrice) badges.push("Buy Now Available");

return badges;
```

### Reserve Status

```typescript
reserveStatus: !reservePrice
  ? "No reserve"
  : reserveMet
  ? "Reserve met"
  : "Reserve not met";
```

---

## Shop-Specific Patterns

### Location Formatting

```typescript
const locationParts = [city, state].filter(Boolean);
location: locationParts.length > 0 ? locationParts.join(", ") : null;
```

### Badge Generation

```typescript
const badges: string[] = [];
if (isVerified) badges.push("Verified");
if (rating >= 4.5) badges.push("Top Rated");
if (totalProducts >= 100) badges.push("Large Catalog");
return badges;
```

### Rating Display

```typescript
ratingDisplay: reviewCount > 0
  ? `${rating.toFixed(1)} (${reviewCount})`
  : "No reviews";
```

---

## Common Utility Functions

### Format Price (Indian Rupees)

```typescript
function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
```

### Parse Date

```typescript
function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  if (date instanceof Timestamp) return date.toDate();
  return new Date(date);
}
```

### Format Date

```typescript
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
```

### Format Time

```typescript
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
```

### Round Rating

```typescript
function roundRating(rating: number): number {
  return Math.round(rating * 10) / 10;
}
```

---

## Testing Patterns

### Basic Transformation Test

```typescript
it("should transform basic fields", () => {
  const result = toFEEntity(mockEntityBE);

  expect(result.id).toBe("entity_123");
  expect(result.name).toBe("Test Entity");
  expect(result.createdAt).toBeInstanceOf(Date);
});
```

### Price Formatting Test

```typescript
it("should format prices correctly", () => {
  const result = toFEEntity(mockEntityBE);

  expect(result.formattedPrice).toContain("1,000");
  expect(result.formattedPrice).toContain("₹");
});
```

### Status Flag Test

```typescript
it("should set status flags correctly", () => {
  const result = toFEEntity(mockEntityBE);

  expect(result.isActive).toBe(true);
  expect(result.isDraft).toBe(false);
});
```

### Edge Case Test

```typescript
it("should handle null values gracefully", () => {
  const entityWithNulls = { ...mockEntityBE, field: null };
  const result = toFEEntity(entityWithNulls);

  expect(result.field).toBeNull();
  // Should not throw error
});
```

### Batch Transformation Test

```typescript
it("should transform multiple entities", () => {
  const entities = [mockEntityBE, { ...mockEntityBE, id: "entity_456" }];
  const result = toFEEntities(entities);

  expect(result).toHaveLength(2);
  expect(result[0].id).toBe("entity_123");
  expect(result[1].id).toBe("entity_456");
});
```

---

## Anti-Patterns to Avoid

❌ **Using `any` type**

```typescript
// Bad
function transform(data: any): any { ... }

// Good
function transform(data: EntityBE): EntityFE { ... }
```

❌ **Mutating input**

```typescript
// Bad
function transform(data: EntityBE): EntityFE {
  data.newField = "value"; // Mutation!
  return data as EntityFE;
}

// Good
function transform(data: EntityBE): EntityFE {
  return { ...data, newField: "value" }; // New object
}
```

❌ **Not handling null/undefined**

```typescript
// Bad
const date = data.createdAt.toDate(); // Can throw!

// Good
const date = parseDate(data.createdAt) || new Date();
```

❌ **Hardcoding fallbacks**

```typescript
// Bad
const price = data.price || 0; // Wrong for actual 0 price

// Good
const price = data.price ?? 0; // Correct null coalescing
```

---

## Performance Tips

✅ **Use batch transformations for arrays**

```typescript
const results = toFEEntities(entities); // Optimized
```

✅ **Cache expensive calculations**

```typescript
const badges = useMemo(() => generateBadges(entity), [entity]);
```

✅ **Avoid nested transformations in loops**

```typescript
// Pre-transform lookup data
const categoryMap = new Map(categories.map((c) => [c.id, toFECategory(c)]));
```

---

## Quick Checklist

When creating a new transformation function:

- [ ] Handle null/undefined inputs
- [ ] Format prices with `formatPrice()`
- [ ] Parse dates with `parseDate()`
- [ ] Add status flag booleans
- [ ] Include backwards compatibility aliases
- [ ] Generate badges if applicable
- [ ] Write comprehensive tests
- [ ] Document in TRANSFORMATION-PATTERNS.md
- [ ] Use strict TypeScript types (no `any`)
- [ ] Keep functions pure (no side effects)

---

## Related Files

- `TDD/TRANSFORMATION-PATTERNS.md` - Full pattern documentation
- `TDD/TRANSFORMATION-TESTS-SUMMARY.md` - Test coverage summary
- `src/types/transforms/__tests__/` - All unit tests
- `src/lib/price.utils.ts` - Price formatting utilities
- `src/lib/date-utils.ts` - Date utility functions

---

_Last Updated: December 8, 2024_
_Total Patterns: 20_
_Test Coverage: 100%_
