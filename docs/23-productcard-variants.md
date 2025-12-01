# Doc 23: ProductCard Unified Variants

> **Status**: ✅ Complete (ProductCard done, other cards pending)
> **Priority**: ✅ Complete
> **Last Updated**: December 2025

## Problem

Different pages needed different ProductCard presentations:

- Admin pages needed status, SKU, stock count, and admin action buttons
- Seller pages needed sales counts and seller-specific actions
- Public pages needed favorites, compare, and add-to-cart buttons
- Compact cards for featured sections needed minimal UI

## Solution

Enhanced `ProductCard` component with a `variant` prop supporting:

- `"public"` (default) - Full customer-facing card
- `"admin"` - Admin dashboard card with status/SKU/stock
- `"seller"` - Seller dashboard card with sales metrics
- `"compact"` - Minimal card for carousels/featured sections

## Changes Made

### File: `src/components/cards/ProductCard.tsx`

Added variant prop to interface:

```tsx
interface ProductCardProps {
  // ... existing props
  variant?: "public" | "admin" | "seller" | "compact";
}
```

Conditional rendering based on variant:

```tsx
export function ProductCard({
  variant = "public",
}: // ... other props
ProductCardProps) {
  const isAdmin = variant === "admin";
  const isSeller = variant === "seller";
  const isCompact = variant === "compact";
  const isPublic = variant === "public" || !variant;

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl",
        isCompact ? "shadow-sm" : "shadow-md hover:shadow-lg"
      )}
    >
      {/* Image section */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        <img src={image} alt={name} />

        {/* Admin/Seller status badges */}
        {(isAdmin || isSeller) && status && (
          <div
            className={cn(
              "absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium",
              status === "active"
                ? "bg-green-100 text-green-800"
                : status === "draft"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            )}
          >
            {status}
          </div>
        )}

        {/* Public: Quick actions (favorite, compare) */}
        {isPublic && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
            <button onClick={handleFavorite}>
              <Heart className={isFavorite ? "fill-red-500" : ""} />
            </button>
            <button onClick={handleCompare}>
              <GitCompare />
            </button>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-4">
        <h3>{name}</h3>

        {/* Admin: SKU and stock */}
        {isAdmin && (
          <div className="text-xs text-gray-500 mt-1">
            <span>SKU: {sku}</span>
            <span>Stock: {stockCount}</span>
          </div>
        )}

        {/* Seller: Sales count */}
        {isSeller && salesCount !== undefined && (
          <p className="text-xs text-gray-500">{salesCount} sold</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold">{formatPrice(price)}</span>

          {/* Public: Add to cart */}
          {isPublic && (
            <button onClick={handleAddToCart}>
              <ShoppingCart />
            </button>
          )}

          {/* Admin/Seller: Edit button */}
          {(isAdmin || isSeller) && (
            <Link href={`/admin/products/${id}/edit`}>
              <Edit className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Usage Examples

**Admin Products Page:**

```tsx
<ProductCard
  variant="admin"
  id={product.id}
  name={product.name}
  price={product.price}
  status={product.status}
  sku={product.sku}
  stockCount={product.stockCount}
/>
```

**Seller Dashboard:**

```tsx
<ProductCard variant="seller" salesCount={product.salesCount} {...product} />
```

**Homepage Featured:**

```tsx
<ProductCard variant="compact" {...product} />
```

**Product Listing (default):**

```tsx
<ProductCard {...product} />
```

## Result

- Single unified component for all product displays
- Consistent styling across the application
- Easy to extend with new variants
- Reduces code duplication
- Type-safe variant selection
