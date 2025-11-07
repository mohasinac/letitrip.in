# Shop Slug in Route Parameters

**Date:** November 7, 2025  
**Status:** ✅ Implemented

## Overview

All validation APIs and route parameters now use **shop slugs** instead of shop IDs for better SEO and user experience.

## Changes Made

### 1. Product Slug Validation API

**Old:** `GET /api/products/validate-slug?slug=awesome-laptop&shop_id=xxx`  
**New:** `GET /api/products/validate-slug?slug=awesome-laptop&shop_slug=awesome-shop`

**Implementation:**

- API accepts `shop_slug` parameter
- Internally resolves shop slug to shop ID via Firestore query
- Returns both `shop_slug` and `shop_id` in response
- Maintains backward compatibility with compound unique index on `(shop_id, slug)`

### 2. Coupon Code Validation API

**Old:** `GET /api/coupons/validate-code?code=SAVE20&shop_id=xxx`  
**New:** `GET /api/coupons/validate-code?code=SAVE20&shop_slug=awesome-shop`

**Implementation:**

- API accepts `shop_slug` parameter
- Internally resolves shop slug to shop ID via Firestore query
- Returns both `shop_slug` and `shop_id` in response
- Maintains backward compatibility with compound unique index on `(shop_id, code)`

## Usage Examples

### Product Slug Validation

```tsx
import { useSlugValidation } from "@/hooks/useSlugValidation";

function ProductForm({ shopSlug }: { shopSlug: string }) {
  const { isAvailable, isValidating, validateSlug } = useSlugValidation({
    endpoint: "/api/products/validate-slug",
    params: { shop_slug: shopSlug }, // Use shop_slug
    excludeId: productId, // For edit mode
  });

  return (
    <div>
      <input
        placeholder="Product slug"
        onChange={(e) => validateSlug(e.target.value)}
        className={isAvailable === false ? "border-red-500" : ""}
      />
      {isValidating && <Spinner />}
      {isAvailable === false && (
        <Error>This slug is already taken in your shop</Error>
      )}
      {isAvailable === true && <Success>Slug available</Success>}
    </div>
  );
}
```

### Coupon Code Validation

```tsx
import { useSlugValidation } from "@/hooks/useSlugValidation";

function CouponForm({ shopSlug }: { shopSlug: string }) {
  const { isAvailable, isValidating, validateSlug } = useSlugValidation({
    endpoint: "/api/coupons/validate-code",
    params: { shop_slug: shopSlug }, // Use shop_slug
    excludeId: couponId, // For edit mode
  });

  return (
    <div>
      <input
        placeholder="Coupon code"
        onChange={(e) => validateSlug(e.target.value)}
        className={isAvailable === false ? "border-red-500" : ""}
      />
      {isValidating && <Spinner />}
      {isAvailable === false && (
        <Error>This code is already taken in your shop</Error>
      )}
      {isAvailable === true && <Success>Code available</Success>}
    </div>
  );
}
```

## API Response Format

### Product Validation Response

```json
{
  "success": true,
  "available": true,
  "slug": "awesome-laptop",
  "shop_slug": "awesome-shop",
  "shop_id": "shop_123abc"
}
```

### Coupon Validation Response

```json
{
  "success": true,
  "available": true,
  "code": "SAVE20",
  "shop_slug": "awesome-shop",
  "shop_id": "shop_123abc"
}
```

## Benefits

✅ **Better SEO**: Shop slugs in URLs are more readable and SEO-friendly  
✅ **Consistent API**: All entity validations use slugs where applicable  
✅ **User-Friendly**: Slugs are easier to remember than random IDs  
✅ **Backward Compatible**: Database still uses shop_id for relationships  
✅ **Type-Safe**: TypeScript types updated to reflect new parameters

## Database Structure (Unchanged)

The database structure remains the same with `shop_id` as the foreign key:

```typescript
// Products collection
{
  id: "product_123",
  slug: "awesome-laptop",
  shop_id: "shop_123abc",  // Still references shop by ID
  // ...other fields
}

// Coupons collection
{
  id: "coupon_123",
  code: "SAVE20",
  shop_id: "shop_123abc",  // Still references shop by ID
  // ...other fields
}

// Shops collection
{
  id: "shop_123abc",
  slug: "awesome-shop",  // Unique slug for SEO
  // ...other fields
}
```

## Firestore Indexes (Unchanged)

The compound unique indexes remain the same:

```json
{
  "indexes": [
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
    }
  ]
}
```

## Files Modified

- ✅ `/src/app/api/products/validate-slug/route.ts` - Now accepts `shop_slug` parameter
- ✅ `/src/app/api/coupons/validate-code/route.ts` - Now accepts `shop_slug` parameter
- ✅ `/src/hooks/useSlugValidation.ts` - Updated documentation with examples
- ✅ `/CHECKLIST/FEATURE_IMPLEMENTATION_CHECKLIST.md` - Updated validation API documentation
- ✅ `/src/lib/shop-slug-resolver.ts` - **New utility for resolving shop slugs to IDs**

## Shop Slug Resolver Utility

A new utility file provides reusable functions for resolving shop slugs:

```typescript
import {
  resolveShopSlug,
  getShopIdAndValidateOwnership,
} from "@/lib/shop-slug-resolver";

// Simple resolution
const shopId = await resolveShopSlug("awesome-shop");

// Resolution with ownership validation
const result = await getShopIdAndValidateOwnership("awesome-shop", userId);
if (!result) {
  return NextResponse.json({ error: "Shop not found" }, { status: 404 });
}
if (!result.isOwner && !isAdmin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
// Use result.shopId for queries
```

Available functions:

- `resolveShopSlug(shopSlug)` - Get shop ID from slug
- `resolveShopSlugToData(shopSlug)` - Get full shop data from slug
- `batchResolveShopSlugs(shopSlugs[])` - Batch resolve multiple slugs
- `validateShopOwnership(shopSlug, userId)` - Check if user owns shop
- `getShopIdAndValidateOwnership(shopSlug, userId)` - Get ID and validate in one call

## Migration Notes

### For Existing Components

If you have existing components using `shop_id`, update them to use `shop_slug`:

```diff
// Before
const { isAvailable } = useSlugValidation({
  endpoint: '/api/products/validate-slug',
-  params: { shop_id: shopId },
+  params: { shop_slug: shopSlug },
  excludeId: productId,
});
```

### Obtaining Shop Slug

When you need to validate products/coupons, you'll need the shop slug instead of ID:

```tsx
// In seller pages, get shop slug from URL or context
function ProductEditPage({ params }: { params: { shop_slug: string } }) {
  const shopSlug = params.shop_slug;

  const { isAvailable } = useSlugValidation({
    endpoint: "/api/products/validate-slug",
    params: { shop_slug: shopSlug },
  });

  // ...
}
```

## Error Handling

The APIs now return appropriate errors if the shop slug is not found:

```json
{
  "success": false,
  "error": "Shop not found"
}
```

This helps catch issues early when a shop slug is invalid or deleted.

## Next Steps

When implementing seller pages, ensure:

1. ✅ Use shop slugs in URL parameters: `/seller/products/[shop_slug]/edit`
2. ✅ Pass `shop_slug` to validation APIs, not `shop_id`
3. ✅ Components receive shop slug from route params or context
4. ✅ Shop selector dropdown uses shop slugs for navigation
5. ✅ API routes internally resolve shop slug to shop ID when querying Firestore

## Reference

- **Hook:** `/src/hooks/useSlugValidation.ts`
- **Product Validation:** `/src/app/api/products/validate-slug/route.ts`
- **Coupon Validation:** `/src/app/api/coupons/validate-code/route.ts`
- **Main Checklist:** `/CHECKLIST/FEATURE_IMPLEMENTATION_CHECKLIST.md`
