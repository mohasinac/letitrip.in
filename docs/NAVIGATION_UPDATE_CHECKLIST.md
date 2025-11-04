# Navigation Constants - Component Update Checklist

## ✅ Prerequisites Complete

- [x] Created `/src/constants/navigation.ts` with all navigation items
- [x] Updated `/src/constants/routes.ts` with missing routes
- [x] Created `/src/constants/index.ts` for central exports
- [x] Created comprehensive documentation
- [x] All TypeScript errors resolved

## 📋 Components to Update

### Phase 1: Critical Components (Do First) ⭐

#### 1. ModernLayout.tsx

**File:** `/src/constants/navigation.ts

**Status:** ⏳ Pending

**Changes Needed:**

- [ ] Import `MAIN_NAV_ITEMS`
- [ ] Replace hardcoded navbar items with constant
- [ ] Import footer constants: `FOOTER_SHOP_LINKS`, `FOOTER_HELP_LINKS`, `FOOTER_ABOUT_LINKS`, `FOOTER_BOTTOM_LINKS`
- [ ] Replace hardcoded footer links with constants
- [ ] Import `BOTTOM_NAV_GUEST`, `BOTTOM_NAV_USER`, `BOTTOM_NAV_ADMIN`, `BOTTOM_NAV_SELLER`
- [ ] Update bottom navigation logic to use constants

**Lines to Update:**

- Lines ~40-47: Main navigation array
- Lines ~606-730: Footer sections
- Lines ~72-180: Bottom navigation items

**Example:**

```tsx
// Before
const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  // ...
];

// After
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
const navigation = MAIN_NAV_ITEMS;
```

---

#### 2. UnifiedSidebar.tsx

**File:** `/src/components/layout/UnifiedSidebar.tsx`

**Status:** ⏳ Pending

**Changes Needed:**

- [ ] Import `ADMIN_SIDEBAR_ITEMS`, `SELLER_SIDEBAR_ITEMS`, `USER_SIDEBAR_ITEMS`
- [ ] Replace `adminMenuItems` array with constant
- [ ] Replace `sellerMenuItems` array with constant
- [ ] Replace user menu items with constant

**Lines to Update:**

- Lines ~42-70: Admin menu items
- Lines ~72-92: Seller menu items
- Lines ~94-100: User menu items

**Example:**

```tsx
// Before
const adminMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin", badge: false },
  // ...
];

// After
import { ADMIN_SIDEBAR_ITEMS } from "@/constants/navigation";
// Use ADMIN_SIDEBAR_ITEMS directly
```

---

#### 3. AdminSidebar.tsx

**File:** `/src/components/layout/AdminSidebar.tsx`

**Status:** ⏳ Pending

**Changes Needed:**

- [ ] Import `ADMIN_SIDEBAR_ITEMS`
- [ ] Replace `adminMenuItems` array with constant
- [ ] Add icons mapping since constant doesn't include icon components

**Lines to Update:**

- Lines ~32-90: Admin menu items definition

**Example:**

```tsx
// Import the constant
import { ADMIN_SIDEBAR_ITEMS } from "@/constants/navigation";

// Create icon mapping
const iconMap = {
  Dashboard: LayoutDashboard,
  Analytics: BarChart3,
  // ... other icons
};

// Use with icon mapping
{
  ADMIN_SIDEBAR_ITEMS.map((item) => {
    const Icon = iconMap[item.label];
    // ...
  });
}
```

---

#### 4. SellerSidebar.tsx

**File:** `/src/components/seller/SellerSidebar.tsx`

**Status:** ⏳ Pending

**Changes Needed:**

- [ ] Import `SELLER_SIDEBAR_ITEMS`
- [ ] Replace `sellerMenuItems` array with constant
- [ ] Add icons mapping

**Lines to Update:**

- Lines ~26-70: Seller menu items definition

---

### Phase 2: Secondary Components

#### 5. ModernLayout-new.tsx (if still in use)

**File:** `/src/components/layout/ModernLayout-new.tsx`

**Status:** ⏳ Pending / ⚠️ Check if still needed

**Changes Needed:**

- [ ] Same as ModernLayout.tsx if this file is still active
- [ ] Consider removing if it's obsolete

---

#### 6. AppLayout.tsx

**File:** `/src/components/layout/AppLayout.tsx`

**Status:** ⏳ Pending

**Changes Needed:**

- [ ] Import bottom nav constants
- [ ] Update `getBottomNavItems()` function
- [ ] Import admin/seller/customer menu items
- [ ] Update `adminMenuItems`, `sellerMenuItems`, `customerMenuItems`

**Lines to Update:**

- Lines ~89-150: Menu items definitions
- Lines ~390-480: `getBottomNavItems()` function

---

### Phase 3: Profile & User Components

#### 7. ProfileSidebar.tsx (if exists)

**File:** `/src/components/profile/ProfileSidebar.tsx`

**Status:** ⏳ Pending / ⚠️ Check if exists

**Changes Needed:**

- [ ] Import `USER_SIDEBAR_ITEMS`
- [ ] Replace hardcoded menu items

---

### Phase 4: Utility Functions

#### 8. navigation.ts (utils)

**File:** `/src/utils/navigation.ts`

**Status:** ⏳ Pending

**Changes Needed:**

- [ ] Review if this file duplicates constants
- [ ] Update to use constants from `/src/constants/navigation.ts`
- [ ] Consider if this file is still needed or should be merged

**Note:** This file seems to have overlapping functionality with the new constants file.

---

## 🎯 Update Priority

| Priority  | Component             | Impact                            | Difficulty |
| --------- | --------------------- | --------------------------------- | ---------- |
| 🔴 High   | ModernLayout.tsx      | Main layout used everywhere       | Medium     |
| 🔴 High   | UnifiedSidebar.tsx    | Admin/Seller/User navigation      | Easy       |
| 🟡 Medium | AdminSidebar.tsx      | Admin panel (if separately used)  | Easy       |
| 🟡 Medium | SellerSidebar.tsx     | Seller panel (if separately used) | Easy       |
| 🟡 Medium | AppLayout.tsx         | Alternative layout                | Medium     |
| 🟢 Low    | ProfileSidebar.tsx    | User profile nav                  | Easy       |
| 🟢 Low    | navigation.ts (utils) | Utility file review               | Low        |

---

## 📝 Update Template

For each component, follow this process:

### Step 1: Add Imports

```tsx
import {
  MAIN_NAV_ITEMS,
  FOOTER_SHOP_LINKS,
  // ... other needed constants
} from "@/constants/navigation";
```

### Step 2: Replace Arrays

```tsx
// Before
const navigation = [
  { name: "Home", href: "/" },
  // ...
];

// After
const navigation = MAIN_NAV_ITEMS;
```

### Step 3: Update JSX

```tsx
// Before
{
  navigation.map((item) => (
    <Link key={item.name} href={item.href}>
      {item.name}
    </Link>
  ));
}

// After (if structure matches)
{
  MAIN_NAV_ITEMS.map((item) => (
    <Link key={item.name} href={item.href}>
      {item.name}
    </Link>
  ));
}
```

### Step 4: Test

- [ ] Component renders correctly
- [ ] All links work
- [ ] Active states work
- [ ] No TypeScript errors
- [ ] No runtime errors

---

## ⚠️ Special Considerations

### Icons

The new constants don't include icon components (to avoid circular dependencies). You'll need to:

1. Keep icon imports in the component
2. Create a mapping object if needed:

```tsx
import { ShoppingBag, Home, Package } from "lucide-react";
import { ADMIN_SIDEBAR_ITEMS } from "@/constants/navigation";

const iconMap = {
  Dashboard: Home,
  Products: ShoppingBag,
  Orders: Package,
  // ... etc
};

// Then use:
{
  ADMIN_SIDEBAR_ITEMS.map((item) => {
    const Icon = iconMap[item.label];
    return (
      <Link key={item.href} href={item.href}>
        <Icon />
        <span>{item.label}</span>
      </Link>
    );
  });
}
```

### Badges

Some items have `badge: true` property. Handle badges like this:

```tsx
{
  item.badge && <Badge count={badgeCount} />;
}
```

### Sections

Admin and Seller sidebar items have `section` property for grouping:

```tsx
const grouped = ADMIN_SIDEBAR_ITEMS.reduce((acc, item) => {
  if (!acc[item.section]) acc[item.section] = [];
  acc[item.section].push(item);
  return acc;
}, {});
```

---

## 🧪 Testing Checklist

After updating each component:

- [ ] Component renders without errors
- [ ] All navigation links are visible
- [ ] Clicking links navigates correctly
- [ ] Active/current page highlighting works
- [ ] Mobile responsive design intact
- [ ] Dark mode works (if applicable)
- [ ] Badge counts display correctly
- [ ] Role-based navigation works (admin/seller/user)
- [ ] No console errors
- [ ] No TypeScript errors

---

## 📊 Progress Tracking

### Overall Progress: 0% Complete

- [ ] Phase 1: Critical Components (0/4)
- [ ] Phase 2: Secondary Components (0/2)
- [ ] Phase 3: Profile Components (0/1)
- [ ] Phase 4: Utility Review (0/1)

### Individual Component Status

| Component             | Status     | Date | Notes                 |
| --------------------- | ---------- | ---- | --------------------- |
| ModernLayout.tsx      | ⏳ Pending | -    | -                     |
| UnifiedSidebar.tsx    | ⏳ Pending | -    | -                     |
| AdminSidebar.tsx      | ⏳ Pending | -    | -                     |
| SellerSidebar.tsx     | ⏳ Pending | -    | -                     |
| AppLayout.tsx         | ⏳ Pending | -    | -                     |
| ModernLayout-new.tsx  | ⏳ Pending | -    | Check if still needed |
| ProfileSidebar.tsx    | ⏳ Pending | -    | Check if exists       |
| navigation.ts (utils) | ⏳ Pending | -    | Review needed         |

**Legend:**

- ⏳ Pending
- 🔄 In Progress
- ✅ Complete
- ⚠️ Blocked/Issue
- ❌ Skip/Not Needed

---

## 📚 Resources

- [Full Documentation](/docs/core/NAVIGATION_CONSTANTS.md)
- [Quick Reference](/docs/NAVIGATION_QUICK_REF.md)
- [Implementation Summary](/docs/NAVIGATION_CONSTANTS_SUMMARY.md)
- [Constants File](/src/constants/navigation.ts)
- [Routes File](/src/constants/routes.ts)

---

## 🆘 Troubleshooting

### Issue: TypeScript Errors

**Solution:** Make sure you're importing from `@/constants/navigation` and the constant names match exactly.

### Issue: Icons Not Showing

**Solution:** Icons are not included in constants. Keep icon imports in your component and create a mapping.

### Issue: Active State Not Working

**Solution:** Check that your active state logic matches the structure of the constant (e.g., `item.href` vs `item.name`).

### Issue: Badge Not Showing

**Solution:** Check for `item.badge` property and pass your badge count from state/props.

---

**Last Updated:** 2025-01-XX  
**Next Update:** After completing Phase 1
