# Slug Validation System - Quick Reference

**Status:** ✅ Completed (November 7, 2025)

## Overview

The slug validation system provides real-time validation for slugs and coupon codes across the platform. It ensures uniqueness constraints are enforced before form submission, providing immediate feedback to users.

## Architecture

```
User Input → useSlugValidation Hook → Debounced API Call → Firestore Query → Validation Result
```

## API Endpoints

### 1. Shop Slug Validation

```
GET /api/shops/validate-slug?slug=awesome-shop&exclude_id=xxx
```

**Response:**

```json
{
  "success": true,
  "available": true,
  "slug": "awesome-shop"
}
```

**Uniqueness:** Globally unique across all shops

---

### 2. Product Slug Validation

```
GET /api/products/validate-slug?slug=awesome-laptop&shop_id=xxx&exclude_id=xxx
```

**Response:**

```json
{
  "success": true,
  "available": true,
  "slug": "awesome-laptop",
  "shop_id": "xxx"
}
```

**Uniqueness:** Unique per shop (same slug allowed in different shops)

---

### 3. Coupon Code Validation

```
GET /api/coupons/validate-code?code=SAVE20&shop_id=xxx&exclude_id=xxx
```

**Response:**

```json
{
  "success": true,
  "available": true,
  "code": "SAVE20",
  "shop_id": "xxx"
}
```

**Uniqueness:** Unique per shop (same code allowed in different shops)
**Note:** Codes are automatically normalized (uppercase, no spaces)

---

### 4. Auction Slug Validation

```
GET /api/auctions/validate-slug?slug=rare-vintage-watch&exclude_id=xxx
```

**Response:**

```json
{
  "success": true,
  "available": true,
  "slug": "rare-vintage-watch"
}
```

**Uniqueness:** Globally unique across all auctions

---

### 5. Category Slug Validation (Admin Only)

```
GET /api/categories/validate-slug?slug=smartphones&exclude_id=xxx
```

**Response:**

```json
{
  "success": true,
  "available": true,
  "slug": "smartphones"
}
```

**Uniqueness:** Globally unique across all categories
**Access:** Admin only

---

## React Hook: useSlugValidation

### Import

```typescript
import { useSlugValidation } from "@/hooks/useSlugValidation";
```

### Hook API

```typescript
interface UseSlugValidationOptions {
  endpoint: string; // API endpoint for validation
  params?: Record<string, string>; // Additional query params (e.g., shop_id)
  excludeId?: string; // Exclude ID for edit mode
  debounceMs?: number; // Debounce delay (default: 500ms)
  initialSlug?: string; // Initial slug to validate
}

interface SlugValidationResult {
  slug: string; // Current slug value
  isAvailable: boolean | null; // null = not validated, true = available, false = taken
  isValidating: boolean; // Validation in progress
  error: string | null; // Validation error
  validateSlug: (slug: string) => void; // Function to validate
  reset: () => void; // Reset validation state
}
```

---

## Usage Examples

### Example 1: Shop Slug Validation

```typescript
import { useSlugValidation } from "@/hooks/useSlugValidation";

function ShopForm({ shopId }: { shopId?: string }) {
  const { isAvailable, isValidating, validateSlug, error } = useSlugValidation({
    endpoint: "/api/shops/validate-slug",
    excludeId: shopId, // Exclude current shop in edit mode
    debounceMs: 500,
  });

  return (
    <div>
      <label>Shop Slug</label>
      <input
        type="text"
        onChange={(e) => validateSlug(e.target.value)}
        className={isAvailable === false ? "border-red-500" : ""}
      />

      {/* Loading indicator */}
      {isValidating && (
        <span className="text-gray-500">Checking availability...</span>
      )}

      {/* Error message */}
      {isAvailable === false && (
        <span className="text-red-500">This slug is already taken</span>
      )}

      {/* Success message */}
      {isAvailable === true && (
        <span className="text-green-500">Slug is available!</span>
      )}

      {/* API error */}
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
```

---

### Example 2: Product Slug Validation (Per Shop)

```typescript
function ProductForm({
  shopId,
  productId,
}: {
  shopId: string;
  productId?: string;
}) {
  const { isAvailable, isValidating, validateSlug } = useSlugValidation({
    endpoint: "/api/products/validate-slug",
    params: { shop_id: shopId }, // Validate within this shop
    excludeId: productId,
  });

  return (
    <div>
      <input
        onChange={(e) => validateSlug(e.target.value)}
        disabled={isValidating}
      />
      {isAvailable === false && <Error>Slug already used in this shop</Error>}
      {isAvailable === true && <Success>Available</Success>}
    </div>
  );
}
```

---

### Example 3: Coupon Code Validation (Per Shop)

```typescript
function CouponForm({
  shopId,
  couponId,
}: {
  shopId: string;
  couponId?: string;
}) {
  const { isAvailable, isValidating, validateSlug } = useSlugValidation({
    endpoint: "/api/coupons/validate-code",
    params: { shop_id: shopId },
    excludeId: couponId,
  });

  return (
    <div>
      <label>Coupon Code</label>
      <input
        type="text"
        onChange={(e) => validateSlug(e.target.value.toUpperCase())}
        placeholder="SAVE20"
      />
      {isValidating && <Spinner />}
      {isAvailable === false && <Error>Code already exists in this shop</Error>}
      {isAvailable === true && <Success>Code is available</Success>}
    </div>
  );
}
```

---

### Example 4: Auction Slug Validation

```typescript
function AuctionForm({ auctionId }: { auctionId?: string }) {
  const { isAvailable, validateSlug } = useSlugValidation({
    endpoint: "/api/auctions/validate-slug",
    excludeId: auctionId,
  });

  return <input onChange={(e) => validateSlug(e.target.value)} />;
}
```

---

### Example 5: Category Slug Validation (Admin Only)

```typescript
function CategoryForm({ categoryId }: { categoryId?: string }) {
  const { isAvailable, validateSlug } = useSlugValidation({
    endpoint: "/api/categories/validate-slug",
    excludeId: categoryId,
  });

  return <input onChange={(e) => validateSlug(e.target.value)} />;
}
```

---

## Integration with SlugInput Component

The `SlugInput` component can be enhanced to use the validation hook:

```typescript
import { SlugInput } from "@/components/common/SlugInput";
import { useSlugValidation } from "@/hooks/useSlugValidation";

function MyForm({ shopId }: { shopId?: string }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const { isAvailable, isValidating, validateSlug } = useSlugValidation({
    endpoint: "/api/products/validate-slug",
    params: { shop_id: shopId },
  });

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Product Title"
      />

      <SlugInput
        value={slug}
        onChange={(newSlug) => {
          setSlug(newSlug);
          validateSlug(newSlug); // Validate on change
        }}
        sourceText={title} // Auto-generate from title
        label="Product Slug"
        hint="URL-friendly version of title"
        error={isAvailable === false ? "Slug already taken" : undefined}
        success={isAvailable === true ? "Slug available" : undefined}
        loading={isValidating}
      />
    </div>
  );
}
```

---

## Firestore Indexes

All validation queries require Firestore indexes. Deploy with:

```bash
firebase deploy --only firestore:indexes
```

### Index Configuration (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "shops",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "slug", "order": "ASCENDING" }]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shop_id", "order": "ASCENDING" },
        { "fieldPath": "slug", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shop_id", "order": "ASCENDING" },
        { "fieldPath": "code", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "auctions",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "slug", "order": "ASCENDING" }]
    },
    {
      "collectionGroup": "categories",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "slug", "order": "ASCENDING" }]
    }
  ]
}
```

---

## Testing

### Manual Testing Checklist

**Shop Slugs:**

- [ ] Create shop with unique slug → Success
- [ ] Create shop with existing slug → Error
- [ ] Edit shop, keep same slug → Success
- [ ] Edit shop, change to existing slug → Error

**Product Slugs:**

- [ ] Create product with unique slug in shop A → Success
- [ ] Create product with same slug in shop B → Success (different shops)
- [ ] Create product with existing slug in same shop → Error
- [ ] Edit product, keep same slug → Success
- [ ] Edit product, change to existing slug in same shop → Error

**Coupon Codes:**

- [ ] Create coupon with unique code in shop A → Success
- [ ] Create coupon with same code in shop B → Success (different shops)
- [ ] Create coupon with existing code in same shop → Error
- [ ] Code normalization (lowercase → uppercase) → Success
- [ ] Code normalization (spaces removed) → Success

**Auction Slugs:**

- [ ] Create auction with unique slug → Success
- [ ] Create auction with existing slug → Error
- [ ] Edit auction, keep same slug → Success

**Category Slugs (Admin Only):**

- [ ] Admin creates category with unique slug → Success
- [ ] Admin creates category with existing slug → Error
- [ ] Non-admin attempts validation → 403 Error

---

## Error Handling

### API Errors

```json
{
  "success": false,
  "error": "Slug parameter is required"
}
```

### Network Errors

The hook will catch network errors and set the `error` state:

```typescript
{
  error: "Failed to validate slug";
}
```

### Handle in UI

```typescript
if (error) {
  return <ErrorMessage>{error}</ErrorMessage>;
}
```

---

## Performance Considerations

1. **Debouncing**: Default 500ms debounce prevents excessive API calls
2. **Caching**: Consider adding client-side cache for recently validated slugs
3. **Network**: Validation requires network round-trip (~100-500ms)
4. **Firestore**: Indexed queries are fast (~50ms)

### Optimization Tips

- Increase debounce delay for slow networks: `debounceMs: 1000`
- Disable validation for unchanged slugs in edit mode
- Show loading state to prevent user frustration
- Cache validation results in component state

---

## Best Practices

1. **Always validate before submission**: Don't rely solely on real-time validation
2. **Show clear feedback**: Use color-coded messages (red = taken, green = available)
3. **Handle edit mode**: Pass `excludeId` to allow keeping the same slug
4. **Normalize input**: Slugs should be lowercase, codes should be uppercase
5. **Validate on blur**: Consider validating on blur event to reduce API calls
6. **Provide alternatives**: Suggest alternative slugs when taken
7. **Error recovery**: Show clear error messages and recovery options

---

## Files Reference

| File                                             | Description                       |
| ------------------------------------------------ | --------------------------------- |
| `/src/hooks/useSlugValidation.ts`                | React hook for slug validation    |
| `/src/app/api/shops/validate-slug/route.ts`      | Shop slug validation endpoint     |
| `/src/app/api/products/validate-slug/route.ts`   | Product slug validation endpoint  |
| `/src/app/api/coupons/validate-code/route.ts`    | Coupon code validation endpoint   |
| `/src/app/api/auctions/validate-slug/route.ts`   | Auction slug validation endpoint  |
| `/src/app/api/categories/validate-slug/route.ts` | Category slug validation endpoint |
| `/firestore.indexes.json`                        | Firestore index configuration     |

---

## Next Steps

### Phase 3.3: Implement Forms with Validation

- [ ] Update ShopForm to use slug validation
- [ ] Update ProductForm to use slug validation
- [ ] Update CouponForm to use code validation
- [ ] Update AuctionForm to use slug validation
- [ ] Update CategoryForm to use slug validation (admin)

### Phase 3.4: Enhanced SlugInput Component

- [ ] Integrate useSlugValidation into SlugInput
- [ ] Add visual indicators (checkmark, X icon)
- [ ] Add slug suggestion feature when taken
- [ ] Add copy-to-clipboard for generated slugs

---

## Support

For issues or questions:

1. Check API endpoint responses in Network tab
2. Verify Firestore indexes are deployed
3. Check console for validation errors
4. Ensure `use-debounce` package is installed
5. Test with different debounce delays

---

**Last Updated:** November 7, 2025
**Status:** Production Ready ✅
