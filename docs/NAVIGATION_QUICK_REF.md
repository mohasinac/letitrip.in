# Navigation Constants - Quick Reference

## 🎯 Quick Import Guide

```typescript
// Main navbar items
import { MAIN_NAV_ITEMS } from "@/constants/navigation";

// Footer links
import {
  FOOTER_SHOP_LINKS,
  FOOTER_HELP_LINKS,
  FOOTER_ABOUT_LINKS,
  FOOTER_COMPANY_LINKS,
  FOOTER_BOTTOM_LINKS,
  FOOTER_SOCIAL_LINKS,
} from "@/constants/navigation";

// Sidebar items
import {
  ADMIN_SIDEBAR_ITEMS,
  SELLER_SIDEBAR_ITEMS,
  USER_SIDEBAR_ITEMS,
} from "@/constants/navigation";

// Bottom navigation
import {
  BOTTOM_NAV_GUEST,
  BOTTOM_NAV_USER,
  BOTTOM_NAV_ADMIN,
  BOTTOM_NAV_SELLER,
} from "@/constants/navigation";

// Quick links
import {
  QUICK_LINKS_AUTH,
  QUICK_LINKS_USER,
  QUICK_LINKS_SELLER,
  QUICK_LINKS_ADMIN,
} from "@/constants/navigation";

// Other
import {
  USER_DROPDOWN_MENU,
  HELP_CENTER_LINKS,
  BREADCRUMB_LABELS,
} from "@/constants/navigation";
```

## 📋 Components to Update

### High Priority

- [ ] `ModernLayout.tsx` - Main navbar + footer
- [ ] `UnifiedSidebar.tsx` - Role-based sidebar
- [ ] `BottomNav` component - Mobile navigation

### Medium Priority

- [ ] `AdminSidebar.tsx` - Admin navigation
- [ ] `SellerSidebar.tsx` - Seller navigation
- [ ] User profile components

### Low Priority

- [ ] Breadcrumb components
- [ ] Quick action menus
- [ ] Dropdown menus

## 🔗 All Available Constants

| Constant                 | Items | Used In        |
| ------------------------ | ----- | -------------- |
| `MAIN_NAV_ITEMS`         | 5     | Navbar         |
| `FOOTER_SHOP_LINKS`      | 5     | Footer         |
| `FOOTER_HELP_LINKS`      | 6     | Footer         |
| `FOOTER_ABOUT_LINKS`     | 5     | Footer         |
| `FOOTER_COMPANY_LINKS`   | 4     | Footer         |
| `FOOTER_BOTTOM_LINKS`    | 2     | Footer         |
| `FOOTER_SOCIAL_LINKS`    | 4     | Footer         |
| `ADMIN_SIDEBAR_ITEMS`    | 13    | Admin Sidebar  |
| `SELLER_SIDEBAR_ITEMS`   | 11    | Seller Sidebar |
| `USER_SIDEBAR_ITEMS`     | 6     | User Sidebar   |
| `BOTTOM_NAV_GUEST`       | 4     | Mobile Nav     |
| `BOTTOM_NAV_USER`        | 5     | Mobile Nav     |
| `BOTTOM_NAV_ADMIN`       | 4     | Mobile Nav     |
| `BOTTOM_NAV_SELLER`      | 4     | Mobile Nav     |
| `ALL_NAV_ITEMS_CUSTOMER` | 7     | Mobile Drawer  |
| `ALL_NAV_ITEMS_ADMIN`    | 7     | Mobile Drawer  |
| `ALL_NAV_ITEMS_SELLER`   | 7     | Mobile Drawer  |
| `QUICK_LINKS_AUTH`       | 3     | Quick Menu     |
| `QUICK_LINKS_USER`       | 5     | Quick Menu     |
| `QUICK_LINKS_SELLER`     | 4     | Quick Menu     |
| `QUICK_LINKS_ADMIN`      | 4     | Quick Menu     |
| `HELP_CENTER_LINKS`      | 8     | Help Menu      |
| `USER_DROPDOWN_MENU`     | 5     | User Menu      |
| `BREADCRUMB_LABELS`      | 20+   | Breadcrumbs    |

## 📖 Common Patterns

### Pattern 1: Simple List

```tsx
{
  MAIN_NAV_ITEMS.map((item) => (
    <Link key={item.name} href={item.href}>
      {item.name}
    </Link>
  ));
}
```

### Pattern 2: With Active State

```tsx
{
  ADMIN_SIDEBAR_ITEMS.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={pathname === item.href ? "active" : ""}
    >
      {item.label}
    </Link>
  ));
}
```

### Pattern 3: With Badge

```tsx
{
  SELLER_SIDEBAR_ITEMS.map((item) => (
    <Link key={item.href} href={item.href}>
      {item.label}
      {item.badge && <Badge count={unreadCount} />}
    </Link>
  ));
}
```

### Pattern 4: Role-Based

```tsx
const getBottomNavItems = (user) => {
  if (!user) return BOTTOM_NAV_GUEST;
  if (user.role === "admin") return BOTTOM_NAV_ADMIN;
  if (user.role === "seller") return BOTTOM_NAV_SELLER;
  return BOTTOM_NAV_USER;
};
```

### Pattern 5: With Sections

```tsx
const groupedItems = ADMIN_SIDEBAR_ITEMS.reduce((acc, item) => {
  if (!acc[item.section]) acc[item.section] = [];
  acc[item.section].push(item);
  return acc;
}, {});

{
  Object.entries(groupedItems).map(([section, items]) => (
    <div key={section}>
      <h3>{section}</h3>
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </div>
  ));
}
```

## ⚡ Quick Tips

1. **Always use constants** - Never hardcode URLs
2. **Import from navigation.ts** - Not from routes.ts for menus
3. **Use map()** - Don't hardcode individual items
4. **Check the section property** - For grouping sidebar items
5. **Watch for badge property** - For items that need notification counts

## 🔍 Finding the Right Constant

**Need to update...**

- **Top navbar?** → `MAIN_NAV_ITEMS`
- **Footer shop section?** → `FOOTER_SHOP_LINKS`
- **Footer help section?** → `FOOTER_HELP_LINKS`
- **Footer about section?** → `FOOTER_ABOUT_LINKS`
- **Admin sidebar?** → `ADMIN_SIDEBAR_ITEMS`
- **Seller sidebar?** → `SELLER_SIDEBAR_ITEMS`
- **User profile sidebar?** → `USER_SIDEBAR_ITEMS`
- **Mobile bottom nav?** → `BOTTOM_NAV_*` (based on role)
- **Mobile drawer menu?** → `ALL_NAV_ITEMS_*` (based on role)
- **User dropdown?** → `USER_DROPDOWN_MENU`
- **Quick actions?** → `QUICK_LINKS_*` (based on role)
- **Help menu?** → `HELP_CENTER_LINKS`

## 📚 Full Documentation

For complete documentation, see:

- [Full Documentation](/docs/core/NAVIGATION_CONSTANTS.md)
- [Implementation Summary](/docs/NAVIGATION_CONSTANTS_SUMMARY.md)

## 🆘 Need Help?

1. Check the [documentation](/docs/core/NAVIGATION_CONSTANTS.md)
2. Look at existing usage in components
3. Check the constant definition in `/src/constants/navigation.ts`
4. Review the route definitions in `/src/constants/routes.ts`

---

**Last Updated:** 2025-01-XX
