# Shop Slug Route Params - Quick Reference

## ✅ Use Shop Slugs, Not IDs

### Route Patterns

| Entity   | URL Pattern                              | Note                    |
| -------- | ---------------------------------------- | ----------------------- |
| Shop     | `/seller/my-shops/[shop_slug]/edit`      | Uses slug               |
| Product  | `/seller/products/[product_slug]/edit`   | Uses slug               |
| Coupon   | `/seller/coupons/[coupon_id]/edit`       | Uses ID (no slug field) |
| Auction  | `/seller/auctions/[auction_slug]/edit`   | Uses slug               |
| Category | `/admin/categories/[category_slug]/edit` | Uses slug               |

### Validation APIs

| Entity  | API Endpoint                  | Parameters                           |
| ------- | ----------------------------- | ------------------------------------ |
| Shop    | `/api/shops/validate-slug`    | `slug`, `exclude_id`                 |
| Product | `/api/products/validate-slug` | `slug`, `shop_slug` ✅, `exclude_id` |
| Coupon  | `/api/coupons/validate-code`  | `code`, `shop_slug` ✅, `exclude_id` |
| Auction | `/api/auctions/validate-slug` | `slug`, `exclude_id`                 |

### Quick Usage

```tsx
// Product validation (per shop)
const { isAvailable } = useSlugValidation({
  endpoint: "/api/products/validate-slug",
  params: { shop_slug: shopSlug }, // ✅ Use shop_slug
  excludeId: productId,
});

// Coupon validation (per shop)
const { isAvailable } = useSlugValidation({
  endpoint: "/api/coupons/validate-code",
  params: { shop_slug: shopSlug }, // ✅ Use shop_slug
  excludeId: couponId,
});
```

### Key Points

- ✅ **Always use `shop_slug`** in validation API parameters
- ✅ **Never use `shop_id`** in API calls from frontend
- ✅ APIs internally resolve `shop_slug` → `shop_id` for Firestore queries
- ✅ Database still uses `shop_id` as foreign key (unchanged)
- ✅ Compound indexes remain: `(shop_id, slug)` and `(shop_id, code)`
- ✅ Use `/src/lib/shop-slug-resolver.ts` utilities in API routes

### Utility Functions

```typescript
import { resolveShopSlug } from "@/lib/shop-slug-resolver";

// In API routes
const shopId = await resolveShopSlug(shopSlug);
if (!shopId) {
  return NextResponse.json({ error: "Shop not found" }, { status: 404 });
}
```

### Response Format

```json
{
  "success": true,
  "available": true,
  "slug": "awesome-laptop",
  "shop_slug": "awesome-shop", // ✅ Returned for reference
  "shop_id": "shop_123abc" // ✅ Resolved internally
}
```

---

**See full documentation:** `/CHECKLIST/SHOP_SLUG_ROUTE_PARAMS.md`
