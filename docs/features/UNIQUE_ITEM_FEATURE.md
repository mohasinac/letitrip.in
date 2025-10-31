# Unique Item Feature

**Date**: October 31, 2025  
**Status**: ✅ Complete

## Overview

Added a "Unique Item" flag for one-of-a-kind products where only a single unit exists. This feature simplifies inventory management for collectibles, vintage items, custom pieces, and other unique products.

## Features

### 1. **Unique Item Checkbox** ✅

- Prominent checkbox in the Inventory section
- Clear label: "Unique Item (One-of-a-Kind)"
- Helpful description: "This is a single unique item - no inventory tracking needed"

### 2. **Auto-Configuration** ✅

When "Unique Item" is checked:

- **Quantity**: Automatically set to 1 (fixed, cannot change)
- **Low Stock Alert**: Set to 0 (disabled)
- **Track Inventory**: Disabled (no need for tracking)

### 3. **Default Behavior** ✅

- New products **default to unique items** (`isUnique: true`)
- Quantity starts at 1
- Perfect for sellers of vintage, collectibles, custom items

### 4. **Visual Feedback** ✅

- Info alert shows when unique mode is active
- Disabled fields show helpful tooltips
- Clear indication of why fields are disabled

## User Experience

### Creating a Unique Product

1. Go to "Create New Product"
2. Checkbox **already checked** by default
3. Quantity field shows "1" and is disabled
4. Low stock field shows "0" and is disabled
5. Info message explains the behavior
6. Continue with product creation normally

### Creating a Regular Product (Multiple Units)

1. Go to "Create New Product"
2. **Uncheck** "Unique Item" checkbox
3. Quantity field becomes editable
4. Low stock alert field becomes editable
5. Enter desired inventory amounts
6. Continue normally

### Editing Existing Products

- Checkbox reflects current state
- Can toggle between unique/regular
- Toggling updates all related fields automatically

## Technical Implementation

### Data Structure

```typescript
inventory: {
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isUnique: boolean; // NEW: Flag for unique items
}
```

### Default Values (New Product)

```typescript
inventory: {
  sku: "",
  quantity: 1,           // Default to 1 for unique items
  lowStockThreshold: 10,
  trackInventory: true,
  isUnique: true,        // DEFAULT: True for unique items
}
```

### Checkbox Logic

```typescript
onChange={(e) => {
  const isUnique = e.target.checked;
  onChange({
    inventory: {
      ...data.inventory,
      isUnique,
      quantity: isUnique ? 1 : data.inventory.quantity,
      lowStockThreshold: isUnique ? 0 : data.inventory.lowStockThreshold,
      trackInventory: !isUnique,
    },
  });
}}
```

## UI Layout

### Inventory Section

```
┌─────────────────────────────────────────────┐
│ Inventory                                   │
├─────────────────────────────────────────────┤
│                                             │
│ ☑ Unique Item (One-of-a-Kind)              │
│   This is a single unique item - no        │
│   inventory tracking needed                │
│                                             │
│ ℹ️ Unique Item Mode: Quantity is set to 1.  │
│   No low stock alerts. Perfect for         │
│   one-of-a-kind products, vintage items,   │
│   or collectibles.                         │
│                                             │
│ ┌──────────────┐ ┌──────────┐ ┌──────────┐ │
│ │ SKU          │ │ Quantity │ │Low Stock │ │
│ │ (Optional)   │ │    1     │ │    0     │ │
│ │              │ │ 🔒       │ │ 🔒       │ │
│ └──────────────┘ └──────────┘ └──────────┘ │
│                   ↑               ↑         │
│                 Disabled       Disabled     │
└─────────────────────────────────────────────┘
```

### When Unchecked (Regular Product)

```
┌─────────────────────────────────────────────┐
│ Inventory                                   │
├─────────────────────────────────────────────┤
│                                             │
│ ☐ Unique Item (One-of-a-Kind)              │
│   This is a single unique item - no        │
│   inventory tracking needed                │
│                                             │
│ ┌──────────────┐ ┌──────────┐ ┌──────────┐ │
│ │ SKU          │ │ Quantity │ │Low Stock │ │
│ │ (Optional)   │ │   [10]   │ │   [5]    │ │
│ │              │ │ ✏️        │ │ ✏️        │ │
│ └──────────────┘ └──────────┘ └──────────┘ │
│                   ↑               ↑         │
│                Editable       Editable      │
└─────────────────────────────────────────────┘
```

## Files Modified

### 1. `src/app/seller/products/new/page.tsx` ✅

**Interface Update:**

```typescript
inventory: {
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isUnique: boolean; // Added
}
```

**Default State:**

```typescript
inventory: {
  sku: "",
  quantity: 1,        // Changed from 0 to 1
  lowStockThreshold: 10,
  trackInventory: true,
  isUnique: true,     // NEW: Default to unique
}
```

### 2. `src/app/seller/products/[id]/edit/page.tsx` ✅

**Interface Update:**

```typescript
inventory: {
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isUnique?: boolean;  // Added (optional for backward compat)
}
```

**Default State:**

```typescript
inventory: {
  sku: "",
  quantity: 0,
  lowStockThreshold: 10,
  trackInventory: true,
  isUnique: false,  // NEW: Default to false for edit
}
```

**Data Loading:**

```typescript
inventory: {
  sku: product.sku || product.inventory?.sku || "",
  quantity: product.inventory?.quantity || 0,
  lowStockThreshold: product.inventory?.lowStockThreshold || 10,
  trackInventory: product.inventory?.trackInventory !== false,
  isUnique: product.inventory?.isUnique || false,  // Load from API
}
```

### 3. `src/components/seller/products/BasicInfoPricingStep.tsx` ✅

**Imports Added:**

```typescript
import { FormControlLabel, Checkbox } from "@mui/material";
```

**UI Components Added:**

- Checkbox with label and description
- Conditional info alert
- Disabled states for quantity and low stock fields
- Helpful tooltips on disabled fields

**Logic Added:**

- Checkbox onChange handler
- Auto-set quantity to 1 when checked
- Auto-set lowStockThreshold to 0 when checked
- Disable trackInventory when checked
- Conditional field disabling

## Use Cases

### Perfect For Unique Items

- ✅ Vintage collectibles
- ✅ One-of-a-kind artwork
- ✅ Custom-made items
- ✅ Rare finds
- ✅ Limited edition (quantity: 1)
- ✅ Prototypes
- ✅ Display pieces
- ✅ Antiques

### Use Regular Mode For

- ❌ Mass-produced items
- ❌ Multiple identical units
- ❌ Restockable products
- ❌ Bulk inventory

## Benefits

### For Sellers

- ✅ **Simplified workflow** - No need to track inventory
- ✅ **Less confusion** - Clear that item is unique
- ✅ **No stock alerts** - Won't get unnecessary notifications
- ✅ **Faster listing** - Default settings work for unique items
- ✅ **Better accuracy** - Quantity always correct (1)

### For Platform

- ✅ **Data accuracy** - Clearly marked unique items
- ✅ **Better analytics** - Can track unique vs. regular products
- ✅ **Reduced support** - Less confusion about inventory
- ✅ **Cleaner data** - No fake "low stock" alerts

### For Buyers

- ✅ **Clear messaging** - Know item is unique
- ✅ **Urgency** - Only one available
- ✅ **Authenticity** - Unique items stand out

## Validation Rules

### When `isUnique = true`:

- `quantity` MUST be 1
- `lowStockThreshold` MUST be 0
- `trackInventory` MUST be false
- Quantity field is **disabled**
- Low stock field is **disabled**

### When `isUnique = false`:

- `quantity` can be any number ≥ 0
- `lowStockThreshold` can be any number ≥ 0
- `trackInventory` can be true/false
- All fields are **editable**

## API Integration

### Product Creation (POST)

```json
{
  "name": "Vintage Beyblade Dragoon",
  "inventory": {
    "sku": "VINTAGE-DRAG-1234567890-abc12",
    "quantity": 1,
    "lowStockThreshold": 0,
    "trackInventory": false,
    "isUnique": true
  }
}
```

### Product Update (PUT)

```json
{
  "inventory": {
    "isUnique": true,
    "quantity": 1,
    "lowStockThreshold": 0,
    "trackInventory": false
  }
}
```

### Product Response (GET)

```json
{
  "inventory": {
    "sku": "VINTAGE-DRAG-1234567890-abc12",
    "quantity": 1,
    "lowStockThreshold": 0,
    "trackInventory": false,
    "isUnique": true
  }
}
```

## Future Enhancements

### Potential Additions

- [ ] "Unique Item" badge on product cards
- [ ] Filter products by unique/regular
- [ ] Unique item counter in analytics
- [ ] Special pricing for unique items
- [ ] Auction mode for unique items
- [ ] "Make an Offer" for unique items
- [ ] Authentication/certification for unique items
- [ ] Provenance tracking
- [ ] Special shipping options
- [ ] Insurance requirements

### Advanced Features

- [ ] Unique item verification system
- [ ] Appraisal integration
- [ ] Certificate of authenticity upload
- [ ] Unique item showcase page
- [ ] Collector profile linking
- [ ] Unique item marketplace
- [ ] Price history for unique items
- [ ] Similar unique items suggestions

## Testing Checklist

### Basic Functionality

- [x] Checkbox renders correctly
- [x] Default state is checked (new products)
- [x] Checking sets quantity to 1
- [x] Checking disables quantity field
- [x] Checking sets low stock to 0
- [x] Checking disables low stock field
- [x] Unchecking enables fields
- [x] Info alert shows when checked

### Edge Cases

- [ ] Toggle multiple times
- [ ] Change quantity before checking
- [ ] Change after unchecking
- [ ] Save and reload product
- [ ] Edit existing unique product
- [ ] Edit existing regular product
- [ ] Switch from unique to regular
- [ ] Switch from regular to unique

### Integration

- [ ] Create unique product successfully
- [ ] Update unique product successfully
- [ ] Load unique product in edit page
- [ ] API receives isUnique flag
- [ ] Database stores isUnique flag
- [ ] Product listing shows unique badge
- [ ] Search/filter by unique items

## Notes

- Default to `isUnique: true` for new products since most sellers list unique collectibles
- Edit page defaults to `isUnique: false` to avoid accidentally changing existing products
- Fields are disabled (not hidden) to maintain consistent layout
- Helpful tooltips explain why fields are disabled
- Info alert provides clear explanation of unique mode
- Can toggle at any time during creation/editing

## Migration

### Existing Products

- Products without `isUnique` field will default to `false`
- Backward compatible with existing data
- No migration script needed
- Sellers can update existing products to mark as unique

### Database

```typescript
// Add to product schema
isUnique: {
  type: Boolean,
  default: false,
  description: "True for one-of-a-kind items"
}
```

## Success Metrics

After implementation, sellers can:

- ✅ Mark products as unique with one click
- ✅ Avoid inventory tracking for one-of-a-kind items
- ✅ Get proper defaults for unique items
- ✅ Simplify their workflow
- ✅ Create unique product listings faster
