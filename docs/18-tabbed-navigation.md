# Route-Based Tabbed Navigation

## Current State

> **Status**: ✅ Phase 1 Complete - TabNav component and layouts created
> **Priority**: ✅ Complete

### Implementation Complete

- ✅ `TabNav` component with 3 variants (underline, pills, default)
- ✅ `TabbedLayout` wrapper component
- ✅ Tab constants in `src/constants/tabs.ts`
- ✅ Admin Settings layout with tabs
- ✅ Admin Auctions layout with tabs
- ✅ Admin Blog layout with tabs
- ✅ Seller Products layout with tabs
- ✅ Seller Auctions layout with tabs

### Files Created

1. `src/constants/tabs.ts` - All tab definitions
2. `src/components/navigation/TabNav.tsx` - Tab navigation component
3. `src/components/navigation/TabbedLayout.tsx` - Layout wrapper
4. `src/components/navigation/index.ts` - Exports
5. `src/app/admin/settings/layout.tsx` - Settings tabs
6. `src/app/admin/auctions/layout.tsx` - Auctions tabs
7. `src/app/admin/blog/layout.tsx` - Blog tabs
8. `src/app/seller/products/layout.tsx` - Products tabs
9. `src/app/seller/auctions/layout.tsx` - Auctions tabs

### Current Structure

- **Desktop**: Fixed sidebar (264px) with collapsible groups
- **Mobile**: `MobileNavTabs` (horizontal scroll) + sheet overlay
- **Sub-items**: Shown as nested links in sidebar, not as tabs

### Navigation Arrays

```typescript
// From src/constants/navigation.ts
ADMIN_NAV_ITEMS: [
  {
    id: "settings",
    name: "Settings",
    link: "/admin/settings",
    icon: "settings",
    children: [
      {
        id: "settings-general",
        name: "General",
        link: "/admin/settings/general",
      },
      {
        id: "settings-payment",
        name: "Payment",
        link: "/admin/settings/payment",
      },
      // ...
    ],
  },
];
```

---

## Expected Behavior

When visiting `/admin/settings/general`:

1. Sidebar highlights "Settings" parent item
2. **Tabs appear below header** showing: General | Payment | Shipping | Email | Notifications
3. "General" tab is active/highlighted
4. Clicking another tab navigates to that route

---

## Pages Needing Tabs

### Admin Pages

| Parent Route      | Tab Routes                                       | Notes        |
| ----------------- | ------------------------------------------------ | ------------ |
| `/admin/settings` | general, payment, shipping, email, notifications | 5 tabs       |
| `/admin/blog`     | (all), create, categories, tags                  | 4 tabs       |
| `/admin/auctions` | (all), live, moderation                          | 3 tabs       |
| `/admin/support`  | (all), escalated, unresolved                     | 3 tabs       |
| `/admin/content`  | hero-slides, homepage-settings                   | NEW - 2 tabs |

### Seller Pages

| Parent Route       | Tab Routes                | Notes  |
| ------------------ | ------------------------- | ------ |
| `/seller/products` | (all), create             | 2 tabs |
| `/seller/orders`   | (all), pending, completed | 3 tabs |
| `/seller/settings` | shop, payments, shipping  | 3 tabs |

### User Pages

| Parent Route     | Tab Routes                       | Notes  |
| ---------------- | -------------------------------- | ------ |
| `/user/settings` | profile, security, notifications | 3 tabs |
| `/user/orders`   | (all), active, completed         | 3 tabs |

---

## Implementation Plan

### 1. Create TabNav Component

```typescript
// src/components/navigation/TabNav.tsx
interface Tab {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

interface TabNavProps {
  tabs: Tab[];
  className?: string;
}

export function TabNav({ tabs, className }: TabNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("border-b border-gray-200 dark:border-gray-700", className)}
    >
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap",
              "border-b-2 transition-colors",
              pathname === tab.href || pathname.startsWith(tab.href + "/")
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

### 2. Create Route Layout Wrapper

```typescript
// src/components/navigation/TabbedLayout.tsx
interface TabbedLayoutProps {
  tabs: Tab[];
  children: React.ReactNode;
}

export function TabbedLayout({ tabs, children }: TabbedLayoutProps) {
  return (
    <div className="flex flex-col">
      <TabNav tabs={tabs} />
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
```

### 3. Create Layout Files for Tab Groups

```
src/app/admin/settings/layout.tsx     → Uses TabbedLayout with settings tabs
src/app/admin/blog/layout.tsx         → Uses TabbedLayout with blog tabs
src/app/admin/auctions/layout.tsx     → Uses TabbedLayout with auction tabs
src/app/admin/content/layout.tsx      → NEW - Uses TabbedLayout
src/app/seller/products/layout.tsx    → Uses TabbedLayout
src/app/seller/orders/layout.tsx      → Uses TabbedLayout
src/app/user/settings/layout.tsx      → Uses TabbedLayout
```

### 4. Define Tab Constants

```typescript
// src/constants/tabs.ts
export const ADMIN_TABS = {
  SETTINGS: [
    { id: "general", label: "General", href: "/admin/settings/general" },
    { id: "payment", label: "Payment", href: "/admin/settings/payment" },
    { id: "shipping", label: "Shipping", href: "/admin/settings/shipping" },
    { id: "email", label: "Email", href: "/admin/settings/email" },
    {
      id: "notifications",
      label: "Notifications",
      href: "/admin/settings/notifications",
    },
  ],
  BLOG: [
    { id: "posts", label: "All Posts", href: "/admin/blog" },
    { id: "create", label: "Create", href: "/admin/blog/create" },
    { id: "categories", label: "Categories", href: "/admin/blog/categories" },
    { id: "tags", label: "Tags", href: "/admin/blog/tags" },
  ],
  // ...
};
```

### 5. Restructure Content Routes

Current:

- `/admin/hero-slides` - Separate page
- `/admin/homepage` - Separate page
- `/admin/featured-sections` - Separate page

New structure:

- `/admin/content` - Hub with tabs
- `/admin/content/hero-slides` - Tab 1
- `/admin/content/homepage` - Tab 2
- `/admin/content/featured-sections` - Tab 3

---

## Implementation Checklist

### Phase 1: Create Components ✅ COMPLETE

- [x] Create `TabNav` component
- [x] Create `TabbedLayout` wrapper
- [x] Add dark mode support

### Phase 2: Create Tab Constants ✅ COMPLETE

- [x] Define ADMIN_TABS
- [x] Define SELLER_TABS
- [x] Define USER_TABS

### Phase 3: Admin Layouts ✅ COMPLETE

- [x] Create `/admin/settings/layout.tsx`
- [x] Create `/admin/blog/layout.tsx`
- [x] Create `/admin/auctions/layout.tsx`
- [ ] Create `/admin/content/layout.tsx` (optional - content routes not merged)

### Phase 4: Seller Layouts ✅ COMPLETE

- [x] Create `/seller/products/layout.tsx`
- [x] Create `/seller/auctions/layout.tsx`
- [ ] Create `/seller/orders/layout.tsx` (optional)
- [ ] Create `/seller/settings/layout.tsx` (optional)

### Phase 5: User Layouts (Future)

- [ ] Create `/user/settings/layout.tsx`
- [ ] Create `/user/orders/layout.tsx`

### Phase 6: Update Navigation Constants (Future)

- [ ] Update ADMIN_NAV_ITEMS for new structure
- [ ] Update SELLER_NAV_ITEMS
- [ ] Update USER_NAV_ITEMS

---

## Mobile Considerations

- Tabs should be horizontally scrollable on mobile
- Active tab should auto-scroll into view
- Touch-friendly tap targets (min 44px height)
- Sticky tabs below header on scroll (optional)

---

## File Changes

1. **New files**:

   - `src/components/navigation/TabNav.tsx`
   - `src/components/navigation/TabbedLayout.tsx`
   - `src/constants/tabs.ts`
   - Multiple `layout.tsx` files

2. **Move/restructure**:

   - `/admin/hero-slides/*` → `/admin/content/hero-slides/*`
   - `/admin/homepage/*` → `/admin/content/homepage/*`
   - `/admin/featured-sections/*` → `/admin/content/featured-sections/*`

3. **Update**:
   - `src/constants/navigation.ts` - Update nav structure
