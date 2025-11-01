# Complete UI and API Fixes

**Date:** November 2, 2025  
**Status:** 🔄 In Progress

## Issues to Fix

### 1. ✅ Order Details Page - "Failed to fetch order"

**Problem:** API route using old Next.js params format
**Status:** FIXED

### 2. ✅ Seller Orders Not Showing

**Problem:** Orders created without `sellerId` field
**Status:** FIXED

### 3. 🔄 Profile Sidebar for Logged-in Users

**Status:** TO BE CREATED

### 4. 🔄 Collapsible Search & Navbar Cleanup

**Status:** TO BE UPDATED

---

## Fixes Applied

### 1. Order API Routes - Async Params ✅

**Files Fixed:**

- `src/app/api/orders/[id]/route.ts`
- `src/app/api/seller/orders/[id]/route.ts`

**Changes:**

```typescript
// Before
{ params }: { params: { id: string } }
const orderId = params.id;

// After
{ params }: { params: Promise<{ id: string }> }
const { id: orderId } = await params;
```

### 2. Order Type - Added Seller Fields ✅

**File:** `src/types/order.ts`

**Added:**

```typescript
export interface Order {
  // ... existing fields

  // Seller info (for single-seller orders)
  sellerId?: string;
  sellerName?: string;

  // ... rest of fields
}
```

### 3. Order Creation - Include Seller Info ✅

**File:** `src/app/api/orders/create/route.ts`

**Added:**

```typescript
const order: Omit<Order, "id"> = {
  // ... existing fields

  // Add sellerId from first item
  sellerId: items[0]?.sellerId || "default-seller",
  sellerName: items[0]?.sellerName || "JustForView",

  // ... rest of fields
};
```

**Impact:** Seller dashboard will now show all orders for their products

---

## Remaining Tasks

### 3. Create Profile Sidebar Component

**Requirements:**

- Show only for logged-in users
- Hide on admin routes (`/admin/**`)
- Hide on seller routes (`/seller/**`)
- Display user info and navigation links
- Include: Profile, Orders, Addresses, Wishlist, Settings
- Responsive design

**Files to Create:**

- `src/components/profile/ProfileSidebar.tsx`
- `src/components/profile/ProfileLayout.tsx`

**Routes to Update:**

- `src/app/profile/**` pages to use ProfileLayout

### 4. Update Navbar

**Requirements:**

- Make search collapsible on mobile
- Remove unused links
- Keep: Home, Products, Categories, Contact
- Remove: Stores(?), Game(?)
- Add profile dropdown for logged-in users

**Files to Update:**

- `src/components/layout/ModernLayout.tsx`
- `src/components/layout/GlobalSearch.tsx`

---

## API Routes Needing Async Params Update

The following routes still need to be updated to Next.js 15+ format:

### Address Routes

- `src/app/api/addresses/[id]/route.ts`

### Seller Routes

- `src/app/api/seller/coupons/[id]/route.ts`
- `src/app/api/seller/coupons/[id]/toggle/route.ts`
- `src/app/api/seller/orders/[id]/approve/route.ts`
- `src/app/api/seller/orders/[id]/reject/route.ts`
- `src/app/api/seller/orders/[id]/cancel/route.ts`
- `src/app/api/seller/orders/[id]/invoice/route.ts`
- `src/app/api/seller/sales/[id]/route.ts`
- `src/app/api/seller/sales/[id]/toggle/route.ts`
- `src/app/api/seller/shipments/[id]/route.ts`
- `src/app/api/seller/shipments/[id]/track/route.ts`
- `src/app/api/seller/shipments/[id]/label/route.ts`
- `src/app/api/seller/shipments/[id]/cancel/route.ts`
- `src/app/api/seller/alerts/[id]/route.ts`

**Pattern to Apply:**

```typescript
// Before
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const itemId = params.id;
  // ...
}

// After
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: itemId } = await params;
  // ...
}
```

---

## Testing Checklist

### Order Details ✅

- [x] Can view order confirmation page after placing order
- [x] Order details load correctly
- [x] All order information displays properly

### Seller Orders ✅

- [x] Seller can see their orders in dashboard
- [x] Orders show correct seller information
- [x] Order stats calculate correctly

### Profile Sidebar (TO DO)

- [ ] Sidebar shows on profile pages
- [ ] Hidden on admin routes
- [ ] Hidden on seller routes
- [ ] All navigation links work
- [ ] Responsive on mobile

### Navbar Update (TO DO)

- [ ] Search is collapsible on mobile
- [ ] Unused links removed
- [ ] Profile dropdown works
- [ ] Mobile menu works correctly

---

## Implementation Steps

### Step 1: Fix Critical API Routes ✅

- [x] Update `/api/orders/[id]/route.ts`
- [x] Update `/api/seller/orders/[id]/route.ts`
- [x] Add sellerId to Order type
- [x] Update order creation

### Step 2: Create Profile Components (NEXT)

1. Create ProfileSidebar component
2. Create ProfileLayout wrapper
3. Update profile pages to use layout
4. Test all profile routes

### Step 3: Update Navbar (NEXT)

1. Make search collapsible
2. Remove unused navigation items
3. Add profile dropdown
4. Update mobile menu
5. Test responsiveness

### Step 4: Bulk Update API Routes (LATER)

1. Run script or manually update remaining routes
2. Test each updated route
3. Update documentation

---

## Notes

### Multi-Seller Orders

Current implementation assigns the first item's sellerId to the entire order. For true multi-seller support:

- Orders should be split by seller
- Each seller gets their own order document
- Platform fee calculations need adjustment
- Shipping coordination required

This is marked for future enhancement.

### Profile Sidebar Design

Should match the design patterns of:

- AdminSidebar component
- SellerSidebar component
- Use consistent styling and navigation patterns

---

## Success Metrics

**Before:**

- ❌ Order details page: 100% error
- ❌ Seller orders: Not visible
- ❌ No profile navigation

**After:**

- ✅ Order details page: Working
- ✅ Seller orders: Visible
- 🔄 Profile sidebar: In progress
- 🔄 Navbar improvements: In progress

---

_This document will be updated as work progresses._
