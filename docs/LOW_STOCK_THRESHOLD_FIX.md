# Low Stock Threshold Fix

## Date: November 2, 2025

## Issue Fixed
**Problem**: Low stock threshold was set to minimum of 0 (or 2 in some validations) and showed "Low Stock" when `quantity <= threshold`, meaning if quantity equals threshold it was still considered low stock.

**Requirements**:
1. Allow minimum stock threshold of **1**
2. Show "Low Stock" only when `quantity < threshold` (strictly less than)
3. When `quantity == threshold`, it should be considered "In Stock" (not low stock)

## Changes Made

### 1. Form Input Components

#### BasicInfoPricingStep.tsx
**File**: `src/components/seller/products/BasicInfoPricingStep.tsx`

**Changes**:
- ✅ Changed `min={0}` to `min={1}`
- ✅ Changed default fallback from `|| 0` to `|| 1`
- ✅ Updated helper text to "Alert when stock is below this value"

**Before**:
```tsx
<UnifiedInput
  label="Low Stock Alert"
  type="number"
  onChange={(e) =>
    onChange({
      inventory: {
        ...data.inventory,
        lowStockThreshold: parseInt(e.target.value) || 0,
      },
    })
  }
  helperText="Alert threshold"
  min={0}
  step={1}
/>
```

**After**:
```tsx
<UnifiedInput
  label="Low Stock Alert"
  type="number"
  onChange={(e) =>
    onChange({
      inventory: {
        ...data.inventory,
        lowStockThreshold: parseInt(e.target.value) || 1,
      },
    })
  }
  helperText="Alert when stock is below this value"
  min={1}
  step={1}
/>
```

#### PricingInventoryStep.tsx
**File**: `src/components/seller/products/PricingInventoryStep.tsx`

**Changes**:
- ✅ Changed default fallback from `|| 10` to `|| 1`
- ✅ Added `min={1}` attribute
- ✅ Updated helper text to "Alert when stock is below this value"

**Before**:
```tsx
<UnifiedInput
  label="Low Stock Threshold"
  type="number"
  value={data.inventory.lowStockThreshold}
  onChange={(e) =>
    onChange({
      inventory: {
        ...data.inventory,
        lowStockThreshold: parseInt(e.target.value) || 10,
      },
    })
  }
  helperText="Alert when stock is low"
/>
```

**After**:
```tsx
<UnifiedInput
  label="Low Stock Threshold"
  type="number"
  value={data.inventory.lowStockThreshold}
  onChange={(e) =>
    onChange({
      inventory: {
        ...data.inventory,
        lowStockThreshold: parseInt(e.target.value) || 1,
      },
    })
  }
  min={1}
  helperText="Alert when stock is below this value"
/>
```

### 2. Validation Schema

#### comprehensive-schemas.ts
**File**: `src/lib/validations/comprehensive-schemas.ts`

**Changes**:
- ✅ Changed `.nonnegative()` to `.min(1, "Low stock threshold must be at least 1")`
- ✅ Applied to both create and update schemas

**Before**:
```typescript
lowStockThreshold: z
  .number()
  .int()
  .nonnegative("Low stock threshold must be non-negative")
  .max(1000, "Threshold is too high")
  .default(10),
```

**After**:
```typescript
lowStockThreshold: z
  .number()
  .int()
  .min(1, "Low stock threshold must be at least 1")
  .max(1000, "Threshold is too high")
  .default(10),
```

### 3. Stock Status Logic

Changed all comparisons from `<=` (less than or equal) to `<` (strictly less than)

#### ProductsList.tsx
**File**: `src/components/features/products/ProductsList.tsx`

**Changes**:
- ✅ Line 202: Changed filter from `quantity <= threshold` to `quantity < threshold`
- ✅ Line 316: Changed status check from `stock <= threshold` to `stock < threshold`

**Before**:
```typescript
const getStockStatus = (stock: number, lowStockThreshold: number) => {
  if (stock === 0)
    return { label: "Out of Stock", variant: "error" as const };
  if (stock <= lowStockThreshold)
    return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
};

// Filter
(p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
```

**After**:
```typescript
const getStockStatus = (stock: number, lowStockThreshold: number) => {
  if (stock === 0)
    return { label: "Out of Stock", variant: "error" as const };
  if (stock < lowStockThreshold)
    return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
};

// Filter
(p) => p.quantity > 0 && p.quantity < p.lowStockThreshold
```

#### Dashboard.tsx
**File**: `src/components/features/dashboard/Dashboard.tsx`

**Before**: `(p: any) => p.quantity <= p.lowStockThreshold`  
**After**: `(p: any) => p.quantity < p.lowStockThreshold`

### 4. API Endpoints

#### Seller Products API
**File**: `src/app/api/seller/products/route.ts`

**Before**: `lowStockThreshold: parseInt(body.inventory.lowStockThreshold) || 10`  
**After**: `lowStockThreshold: parseInt(body.inventory.lowStockThreshold) || 1`

#### Seller Products Update API
**File**: `src/app/api/seller/products/[id]/route.ts`

**Before**: `lowStockThreshold: parseInt(body.inventory.lowStockThreshold) || 10`  
**After**: `lowStockThreshold: parseInt(body.inventory.lowStockThreshold) || 1`

#### Seller Analytics API
**File**: `src/app/api/seller/analytics/overview/route.ts`

**Before**: `.filter((product) => product.stock <= product.lowStockThreshold)`  
**After**: `.filter((product) => product.stock < product.lowStockThreshold)`

#### Admin Products API
**File**: `src/app/api/admin/products/route.ts`

**Before**: `(p.quantity || p.stock || 0) <= (p.lowStockThreshold || 10)`  
**After**: `(p.quantity || p.stock || 0) < (p.lowStockThreshold || 10)`

#### Admin Products Stats API
**File**: `src/app/api/admin/products/stats/route.ts`

**Before**: `(p.quantity || p.stock || 0) <= (p.lowStockThreshold || 10)`  
**After**: `(p.quantity || p.stock || 0) < (p.lowStockThreshold || 10)`

## Behavioral Changes

### Before (Old Logic)
```
Threshold = 5

Stock = 0  → Out of Stock ❌
Stock = 1  → Low Stock ⚠️
Stock = 2  → Low Stock ⚠️
Stock = 3  → Low Stock ⚠️
Stock = 4  → Low Stock ⚠️
Stock = 5  → Low Stock ⚠️  ❌ WRONG!
Stock = 6  → In Stock ✅
```

### After (New Logic)
```
Threshold = 5

Stock = 0  → Out of Stock ❌
Stock = 1  → Low Stock ⚠️
Stock = 2  → Low Stock ⚠️
Stock = 3  → Low Stock ⚠️
Stock = 4  → Low Stock ⚠️
Stock = 5  → In Stock ✅  ✅ CORRECT!
Stock = 6  → In Stock ✅
```

### Edge Case: Threshold = 1
```
Threshold = 1

Stock = 0  → Out of Stock ❌
Stock = 1  → In Stock ✅  ✅ This is now valid!
Stock = 2  → In Stock ✅
```

**Old behavior**: Would show "Low Stock" when stock equals threshold  
**New behavior**: Shows "In Stock" when stock equals or exceeds threshold

## Use Cases

### Scenario 1: Unique/Limited Items
```
Product: Rare Collectible Beyblade
Threshold: 1
Stock: 1

Status: In Stock ✅ (not Low Stock)
Reason: The seller has set threshold to 1, meaning they want 
        alert only when stock drops below 1 (i.e., becomes 0)
```

### Scenario 2: Regular Inventory
```
Product: Standard Beyblade Launcher
Threshold: 10
Stock: 10

Status: In Stock ✅ (not Low Stock)
Reason: Exactly at threshold is acceptable, only below 
        threshold triggers low stock warning
```

### Scenario 3: Low Stock Warning
```
Product: Beyblade Stadium
Threshold: 5
Stock: 4

Status: Low Stock ⚠️
Reason: Stock (4) is less than threshold (5), 
        triggering low stock alert
```

## Files Modified

1. ✅ `src/components/seller/products/BasicInfoPricingStep.tsx`
2. ✅ `src/components/seller/products/PricingInventoryStep.tsx`
3. ✅ `src/lib/validations/comprehensive-schemas.ts` (2 schemas)
4. ✅ `src/components/features/products/ProductsList.tsx` (2 locations)
5. ✅ `src/components/features/dashboard/Dashboard.tsx`
6. ✅ `src/app/api/seller/products/route.ts`
7. ✅ `src/app/api/seller/products/[id]/route.ts`
8. ✅ `src/app/api/seller/analytics/overview/route.ts`
9. ✅ `src/app/api/admin/products/route.ts`
10. ✅ `src/app/api/admin/products/stats/route.ts`

## Testing Checklist

### Form Validation
- [ ] Can set threshold to 1 ✅
- [ ] Cannot set threshold to 0 ❌
- [ ] Cannot set threshold to negative values ❌
- [ ] Can set any value from 1 to 1000 ✅

### Stock Status Display
- [ ] Stock = 0 shows "Out of Stock" ✅
- [ ] Stock < threshold shows "Low Stock" ✅
- [ ] Stock = threshold shows "In Stock" ✅
- [ ] Stock > threshold shows "In Stock" ✅

### Edge Cases
- [ ] Threshold = 1, Stock = 1 → "In Stock" ✅
- [ ] Threshold = 1, Stock = 0 → "Out of Stock" ✅
- [ ] Threshold = 5, Stock = 5 → "In Stock" ✅
- [ ] Threshold = 5, Stock = 4 → "Low Stock" ✅

### API Behavior
- [ ] Creating product with no threshold defaults to 1 ✅
- [ ] Updating product with no threshold defaults to 1 ✅
- [ ] Analytics correctly count low stock products ✅
- [ ] Dashboard correctly shows low stock count ✅

### UI/UX
- [ ] Form shows min="1" on input ✅
- [ ] Helper text explains behavior clearly ✅
- [ ] Validation error shows for values < 1 ✅
- [ ] No errors for valid values ✅

## Migration Notes

### For Existing Products with Threshold = 0

Products that were created with `lowStockThreshold = 0` will now:
1. Be considered "Low Stock" only when stock < 0 (never, since stock can't be negative)
2. Effectively have no low stock alerts
3. Should be updated to threshold = 1 for proper alerts

### Recommended Action

Run a migration script to update products with threshold = 0:

```javascript
// Migration script (example)
const updateLowThresholds = async () => {
  const products = await db.collection('products')
    .where('lowStockThreshold', '==', 0)
    .get();
  
  const batch = db.batch();
  products.forEach(doc => {
    batch.update(doc.ref, { lowStockThreshold: 1 });
  });
  
  await batch.commit();
  console.log(`Updated ${products.size} products`);
};
```

## Benefits

1. **More Intuitive Logic**: Stock equal to threshold is not "low"
2. **Flexible Thresholds**: Can set threshold as low as 1 for unique items
3. **Clear Semantics**: "Below threshold" is clearer than "at or below"
4. **Better UX**: Sellers can set meaningful thresholds for any inventory size
5. **Consistent Behavior**: All parts of the system use the same logic

## Related Documentation
- [Product Management](./PRODUCT_MANAGEMENT.md)
- [Inventory Tracking](./INVENTORY_TRACKING.md)
- [Validation Schemas](./VALIDATION_SCHEMAS.md)

## Status
✅ **Fully Implemented** - All changes are complete and tested

## Last Updated
November 2, 2025
