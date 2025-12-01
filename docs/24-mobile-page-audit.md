# Mobile Page Audit - Admin, Seller, User Pages

> **Status**: ⬜ Not Started
> **Priority**: High
> **Last Updated**: December 2025

## Overview

This document tracks mobile responsiveness issues across all admin, seller, and user pages. The goal is to ensure all pages work well on mobile devices (320px-768px screens) without horizontal scrolling and with touch-friendly interactions.

---

## Mobile Patterns Already Implemented ✅

| Pattern                | Component                    | Status                |
| ---------------------- | ---------------------------- | --------------------- |
| `useIsMobile` hook     | Used across pages            | ✅ Working            |
| `ResponsiveDataTable`  | Mobile cards + desktop table | ✅ Available          |
| `UnifiedFilterSidebar` | Drawer mode on mobile        | ✅ Working            |
| Responsive grids       | `grid-cols-1 sm:grid-cols-2` | ✅ Used in many pages |
| Touch-friendly buttons | `touch-manipulation` class   | ✅ Some pages         |
| `MobileBottomSheet`    | Modal alternative for mobile | ✅ Available          |

---

## Admin Pages Audit

### 🔴 Critical - Table-Only Pages (Need Mobile Cards)

| Page                | File                              | Issue                                             | Priority  |
| ------------------- | --------------------------------- | ------------------------------------------------- | --------- |
| **Users List**      | `/admin/users/page.tsx`           | Table-only, no mobile cards, complex user actions | 🔴 High   |
| **Coupons**         | `/admin/coupons/page.tsx`         | Table with overflow-x-auto, no mobile alternative | 🔴 High   |
| **Returns**         | `/admin/returns/page.tsx`         | Table-only, no mobile cards                       | 🔴 High   |
| **Blog Posts**      | `/admin/blog/page.tsx`            | Table with overflow-x-auto                        | 🟡 Medium |
| **Categories**      | `/admin/categories/page.tsx`      | Tree table needs mobile alternative               | 🟡 Medium |
| **Support Tickets** | `/admin/support-tickets/page.tsx` | Table with overflow-x-auto                        | 🟡 Medium |

### 🟠 Medium - Has Grid/Table Toggle But Table Needs Work

| Page         | File                       | Issue                                        | Priority  |
| ------------ | -------------------------- | -------------------------------------------- | --------- |
| **Products** | `/admin/products/page.tsx` | Grid view OK, table view needs mobile cards  | 🟡 Medium |
| **Auctions** | `/admin/auctions/page.tsx` | Grid view OK, table view needs mobile cards  | 🟡 Medium |
| **Shops**    | `/admin/shops/page.tsx`    | Grid view OK, table view has overflow-x-auto | 🟡 Medium |
| **Orders**   | `/admin/orders/page.tsx`   | Table with overflow-x-auto                   | 🟡 Medium |
| **Payments** | `/admin/payments/page.tsx` | Table with overflow-x-auto                   | 🟡 Medium |
| **Payouts**  | `/admin/payouts/page.tsx`  | Table with overflow-x-auto                   | 🟡 Medium |

### 🟢 Low - Mostly OK But Minor Issues

| Page            | File                          | Issue                                          | Priority |
| --------------- | ----------------------------- | ---------------------------------------------- | -------- |
| **Dashboard**   | `/admin/page.tsx`             | Responsive grids but some tables need work     | 🟢 Low   |
| **Analytics**   | `/admin/analytics/page.tsx`   | Tables in analytics sections                   | 🟢 Low   |
| **Settings**    | `/admin/settings/*`           | Tab bar overflow-x-auto needs scroll indicator | 🟢 Low   |
| **Hero Slides** | `/admin/hero-slides/page.tsx` | Tab bar overflow-x-auto                        | 🟢 Low   |

---

## Seller Pages Audit

### 🔴 Critical - Need Mobile Alternative

| Page                      | File                                    | Issue                             | Priority  |
| ------------------------- | --------------------------------------- | --------------------------------- | --------- |
| **Product Edit Variants** | `/seller/products/[slug]/edit/page.tsx` | Variant table not mobile friendly | 🔴 High   |
| **Auctions List**         | `/seller/auctions/page.tsx`             | Table-only with complex actions   | 🔴 High   |
| **Coupons**               | `/seller/coupons/page.tsx`              | Table with inline actions         | 🟡 Medium |
| **Returns**               | `/seller/returns/page.tsx`              | Table with overflow-x-auto        | 🟡 Medium |

### 🟠 Medium - Has Toggle But Table Needs Work

| Page         | File                        | Issue                                        | Priority  |
| ------------ | --------------------------- | -------------------------------------------- | --------- |
| **Products** | `/seller/products/page.tsx` | Grid OK, table uses overflow-x-auto          | 🟡 Medium |
| **Orders**   | `/seller/orders/page.tsx`   | Grid/table toggle, table not mobile friendly | 🟡 Medium |
| **Reviews**  | `/seller/reviews/page.tsx`  | Grid OK, table overflow-x-auto               | 🟡 Medium |
| **Revenue**  | `/seller/revenue/page.tsx`  | Responsive grid but table sections need work | 🟡 Medium |

### 🟢 Low - Minor Issues

| Page         | File                        | Issue                            | Priority |
| ------------ | --------------------------- | -------------------------------- | -------- |
| **My Shops** | `/seller/my-shops/page.tsx` | Tab bar overflow needs indicator | 🟢 Low   |
| **Messages** | `/seller/messages/page.tsx` | Fixed width elements in filter   | 🟢 Low   |
| **Settings** | `/seller/settings/page.tsx` | Tab bar overflow-x-auto          | 🟢 Low   |

---

## User Pages Audit

### ✅ Mostly Good - Minor Improvements

| Page             | File                          | Status   | Notes                                        |
| ---------------- | ----------------------------- | -------- | -------------------------------------------- |
| **Dashboard**    | `/user/page.tsx`              | ✅ Good  | Responsive grid `grid-cols-2 lg:grid-cols-4` |
| **Orders**       | `/user/orders/page.tsx`       | ✅ Good  | Uses ResponsiveDataTable with mobile cards   |
| **Addresses**    | `/user/addresses/page.tsx`    | ✅ Good  | Responsive form with full-width buttons      |
| **Favorites**    | `/user/favorites/page.tsx`    | ✅ Good  | Responsive grid                              |
| **Watchlist**    | `/user/watchlist/page.tsx`    | ✅ Good  | Responsive grid                              |
| **Bids**         | `/user/bids/page.tsx`         | ⚠️ Check | Needs modal to use MobileBottomSheet         |
| **Reviews**      | `/user/reviews/page.tsx`      | ⚠️ Check | Review cards need mobile check               |
| **Won Auctions** | `/user/won-auctions/page.tsx` | ✅ Good  | Responsive grid layout                       |

---

## Common Components Needing Work

### Tables

| Component         | File                                  | Issue                             | Solution                          |
| ----------------- | ------------------------------------- | --------------------------------- | --------------------------------- |
| **DataTable**     | `src/components/common/DataTable.tsx` | Desktop-focused, overflow-x-auto  | Use `ResponsiveDataTable` wrapper |
| **Admin Tables**  | Various admin pages                   | Many use raw tables with overflow | Convert to `ResponsiveDataTable`  |
| **Seller Tables** | Various seller pages                  | Same issue                        | Convert to `ResponsiveDataTable`  |

### Modals/Dialogs

| Component            | Issue                             | Solution                              |
| -------------------- | --------------------------------- | ------------------------------------- |
| Confirmation Dialogs | Custom divs, not mobile-optimized | Use `MobileBottomSheet` on mobile     |
| Edit Modals          | Fixed width may overflow          | Add responsive width classes          |
| Filter Modals        | May overlap bottom nav            | Use proper z-index and bottom spacing |

### Tab Bars

| Component     | Issue                                    | Solution                          |
| ------------- | ---------------------------------------- | --------------------------------- |
| Settings Tabs | overflow-x-auto without scroll indicator | Add gradient fade + scroll arrows |
| Step Wizards  | May need horizontal scroll on mobile     | Add touch scroll with indicators  |

---

## Implementation Checklist

### Phase 1: Critical Admin Pages

- [ ] Add mobile cards to `/admin/users/page.tsx`
- [ ] Add mobile cards to `/admin/coupons/page.tsx`
- [ ] Add mobile cards to `/admin/returns/page.tsx`
- [ ] Add mobile-friendly tree view to `/admin/categories/page.tsx`

### Phase 2: Critical Seller Pages

- [ ] Mobile-friendly variant editor in product edit page
- [ ] Add mobile cards to `/seller/auctions/page.tsx`
- [ ] Add mobile cards to `/seller/coupons/page.tsx`

### Phase 3: Table Views Across All Pages

- [ ] Convert admin product table view to ResponsiveDataTable
- [ ] Convert admin auction table view to ResponsiveDataTable
- [ ] Convert admin order table view to ResponsiveDataTable
- [ ] Convert seller product table view to ResponsiveDataTable
- [ ] Convert seller order table view to ResponsiveDataTable

### Phase 4: Modal/Dialog Improvements

- [ ] Add MobileBottomSheet support to confirmation dialogs
- [ ] Add responsive widths to edit modals
- [ ] Ensure all modals don't overlap bottom navigation

### Phase 5: Tab/Wizard Improvements

- [ ] Add scroll indicators to all tab bars
- [ ] Ensure wizard steps are horizontally scrollable with indicators
- [ ] Add touch-manipulation to all tab/step buttons

---

## Mobile Card Patterns

When converting tables to mobile cards, use this pattern:

```tsx
// Desktop: Table row
// Mobile: Stacked card

const isMobile = useIsMobile();

{
  isMobile ? (
    <div className="space-y-4">
      {items.map((item) => (
        <MobileItemCard key={item.id} item={item} onAction={handleAction} />
      ))}
    </div>
  ) : (
    <DataTable columns={columns} data={items} />
  );
}
```

### MobileItemCard Example

```tsx
const MobileItemCard = ({ item, onAction }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-3">
    {/* Header with image and title */}
    <div className="flex items-start gap-3">
      <img src={item.image} className="w-16 h-16 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{item.name}</h3>
        <p className="text-sm text-gray-500">{item.subtitle}</p>
      </div>
    </div>

    {/* Key info grid */}
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <span className="text-gray-500">Status:</span> {item.status}
      </div>
      <div>
        <span className="text-gray-500">Price:</span> {item.price}
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2 pt-2 border-t">
      <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm">
        View
      </button>
      <button className="py-2 px-3 border rounded-lg text-sm">Edit</button>
    </div>
  </div>
);
```

---

## Testing Checklist

- [ ] Test all pages at 320px width (iPhone SE)
- [ ] Test all pages at 375px width (iPhone 12/13)
- [ ] Test all pages at 390px width (iPhone 14)
- [ ] Verify no horizontal scrolling on any page
- [ ] Verify all buttons have minimum 44x44px touch targets
- [ ] Verify bottom navigation doesn't overlap content
- [ ] Verify modals/dialogs are usable on mobile
- [ ] Test with touch device (not just mouse simulation)
