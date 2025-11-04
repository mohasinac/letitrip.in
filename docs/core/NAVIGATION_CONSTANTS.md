# Navigation Constants Documentation

This document provides a comprehensive reference for all navigation-related constants in the application.

## Overview

Navigation constants are centralized in `/src/constants/navigation.ts` to ensure consistency across all navigation components including:

- Navbars (top navigation)
- Sidebars (admin, seller, user)
- Footers
- Mobile bottom navigation
- Drawer menus
- Breadcrumbs
- Quick links and dropdowns

## File Structure

```
src/constants/
├── routes.ts          # Base route definitions (URLs)
├── navigation.ts      # Navigation menu items (uses routes.ts)
├── app.ts            # Application constants
└── index.ts          # Central export point
```

## Import Examples

```typescript
// Import all navigation constants
import {
  MAIN_NAV_ITEMS,
  FOOTER_SHOP_LINKS,
  ADMIN_SIDEBAR_ITEMS,
  BOTTOM_NAV_USER,
} from "@/constants/navigation";

// Import route constants
import { PUBLIC_ROUTES, ADMIN_ROUTES } from "@/constants/routes";

// Import from central point
import {
  MAIN_NAV_ITEMS,
  PUBLIC_ROUTES,
  ADMIN_SIDEBAR_ITEMS,
} from "@/constants";
```

## Navigation Categories

### 1. Main Navigation (Navbar)

**Constant:** `MAIN_NAV_ITEMS`

Used in: `ModernLayout`, top navigation bar

```typescript
const MAIN_NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Game", href: "/game" },
  { name: "Contact", href: "/contact" },
];
```

**Usage:**

```tsx
import { MAIN_NAV_ITEMS } from "@/constants/navigation";

{
  MAIN_NAV_ITEMS.map((item) => (
    <Link key={item.name} href={item.href}>
      {item.name}
    </Link>
  ));
}
```

### 2. Footer Navigation

#### Shop Links

**Constant:** `FOOTER_SHOP_LINKS`

```typescript
[
  { name: "All Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "New Arrivals", href: "/products?sort=newest" },
  { name: "Best Sellers", href: "/products?sort=popular" },
  { name: "On Sale", href: "/products?sale=true" },
];
```

#### Help Links

**Constant:** `FOOTER_HELP_LINKS`

```typescript
[
  { name: "Contact Us", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Help Center", href: "/help" },
  { name: "Track Order", href: "/profile/track-order" },
  { name: "Shipping Info", href: "/help/shipping" },
  { name: "Returns", href: "/help/returns" },
];
```

#### About Links

**Constant:** `FOOTER_ABOUT_LINKS`

```typescript
[
  { name: "About Us", href: "/about" },
  { name: "Beyblade Game", href: "/game" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Cookie Policy", href: "/cookies" },
];
```

#### Company Links

**Constant:** `FOOTER_COMPANY_LINKS`

```typescript
[
  { name: "Careers", href: "/careers" },
  { name: "Blog", href: "/blog" },
  { name: "Press Kit", href: "/press" },
  { name: "Affiliate Program", href: "/affiliate" },
];
```

#### Bottom Bar Links

**Constant:** `FOOTER_BOTTOM_LINKS`

```typescript
[
  { name: "Sitemap", href: "/sitemap-page" },
  { name: "Accessibility", href: "/accessibility" },
];
```

#### Social Links

**Constant:** `FOOTER_SOCIAL_LINKS`

```typescript
[
  { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { name: "Twitter", href: "https://twitter.com", icon: "twitter" },
  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { name: "YouTube", href: "https://youtube.com", icon: "youtube" },
];
```

### 3. Admin Sidebar

**Constant:** `ADMIN_SIDEBAR_ITEMS`

Used in: `AdminSidebar`, `UnifiedSidebar`

```typescript
[
  {
    label: "Dashboard",
    href: "/admin",
    badge: false,
    section: "analytics",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    badge: false,
    section: "analytics",
  },
  // ... more items grouped by section
];
```

**Sections:**

- `analytics`: Dashboard, Analytics
- `content`: Products, Categories, Orders, Users
- `marketing`: Coupons, Sales, Reviews, Support, Notifications
- `system`: Game, Settings

### 4. Seller Sidebar

**Constant:** `SELLER_SIDEBAR_ITEMS`

Used in: `SellerSidebar`, `UnifiedSidebar`

```typescript
[
  {
    label: "Dashboard",
    href: "/seller/dashboard",
    badge: false,
    section: "overview",
  },
  {
    label: "Shop Setup",
    href: "/seller/shop",
    badge: false,
    section: "overview",
  },
  // ... more items
];
```

**Sections:**

- `overview`: Dashboard, Shop Setup
- `inventory`: Products, Orders, Shipments
- `marketing`: Coupons, Sales
- `insights`: Analytics, Revenue
- `system`: Alerts (with badge), Settings

### 5. User/Profile Sidebar

**Constant:** `USER_SIDEBAR_ITEMS`

Used in: `UnifiedSidebar`, `ProfileSidebar`

```typescript
[
  { label: "Profile", href: "/profile" },
  { label: "Orders", href: "/profile/orders" },
  { label: "Wishlist", href: "/profile/wishlist" },
  { label: "Addresses", href: "/profile/addresses" },
  { label: "Track Order", href: "/profile/track-order" },
  { label: "Settings", href: "/profile/settings" },
];
```

### 6. Mobile Bottom Navigation

#### Guest Users

**Constant:** `BOTTOM_NAV_GUEST`

```typescript
[
  { id: "home", label: "Home", href: "/" },
  { id: "shop", label: "Shop", href: "/products" },
  { id: "wishlist", label: "Wishlist", href: "/wishlist" },
  { id: "login", label: "Login", href: "/login" },
];
```

#### Logged-in Users

**Constant:** `BOTTOM_NAV_USER`

```typescript
[
  { id: "home", label: "Home", href: "/" },
  { id: "shop", label: "Shop", href: "/products" },
  { id: "wishlist", label: "Wishlist", href: "/profile/wishlist" },
  { id: "orders", label: "Orders", href: "/profile/orders" },
  { id: "account", label: "Account", href: "/profile" },
];
```

#### Admin Users

**Constant:** `BOTTOM_NAV_ADMIN`

```typescript
[
  { id: "dashboard", label: "Dashboard", href: "/admin" },
  { id: "products", label: "Products", href: "/admin/products" },
  { id: "categories", label: "Categories", href: "/admin/categories" },
  { id: "analytics", label: "Analytics", href: "/admin/analytics" },
];
```

#### Seller Users

**Constant:** `BOTTOM_NAV_SELLER`

```typescript
[
  { id: "dashboard", label: "Dashboard", href: "/seller/dashboard" },
  { id: "products", label: "Products", href: "/seller/products" },
  { id: "orders", label: "Orders", href: "/seller/orders" },
  { id: "settings", label: "Settings", href: "/seller/settings" },
];
```

### 7. Mobile Drawer Navigation (All Items)

Extended navigation items shown in mobile drawer menu.

**Constants:**

- `ALL_NAV_ITEMS_CUSTOMER`
- `ALL_NAV_ITEMS_ADMIN`
- `ALL_NAV_ITEMS_SELLER`

### 8. Quick Links & Shortcuts

#### Authentication

**Constant:** `QUICK_LINKS_AUTH`

```typescript
[
  { name: "Sign In", href: "/login" },
  { name: "Register", href: "/register" },
  { name: "Forgot Password", href: "/forgot-password" },
];
```

#### User Quick Links

**Constant:** `QUICK_LINKS_USER`

```typescript
[
  { name: "My Account", href: "/profile" },
  { name: "Orders", href: "/profile/orders" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Cart", href: "/cart" },
  { name: "Checkout", href: "/checkout" },
];
```

#### Seller Quick Links

**Constant:** `QUICK_LINKS_SELLER`

```typescript
[
  { name: "Seller Dashboard", href: "/seller/dashboard" },
  { name: "Add Product", href: "/seller/products/new" },
  { name: "Manage Orders", href: "/seller/orders" },
  { name: "Shop Setup", href: "/seller/shop" },
];
```

#### Admin Quick Links

**Constant:** `QUICK_LINKS_ADMIN`

```typescript
[
  { name: "Admin Dashboard", href: "/admin" },
  { name: "Manage Products", href: "/admin/products" },
  { name: "Manage Users", href: "/admin/users" },
  { name: "View Analytics", href: "/admin/analytics" },
];
```

### 9. Help Center Links

**Constant:** `HELP_CENTER_LINKS`

```typescript
[
  { name: "Getting Started", href: "/help/getting-started" },
  { name: "FAQs", href: "/faq" },
  { name: "Contact Support", href: "/contact" },
  { name: "Shipping & Delivery", href: "/help/shipping" },
  { name: "Returns & Refunds", href: "/help/returns" },
  { name: "Payment Methods", href: "/help/payments" },
  { name: "Order Tracking", href: "/profile/track-order" },
  { name: "Product Care", href: "/help/care" },
];
```

### 10. User Profile Dropdown

**Constant:** `USER_DROPDOWN_MENU`

```typescript
[
  { name: "My Profile", href: "/profile" },
  { name: "My Orders", href: "/profile/orders" },
  { name: "Wishlist", href: "/profile/wishlist" },
  { name: "Addresses", href: "/profile/addresses" },
  { name: "Settings", href: "/profile/settings" },
];
```

### 11. Breadcrumb Labels

**Constant:** `BREADCRUMB_LABELS`

Mapping of route paths to human-readable labels for breadcrumbs.

```typescript
{
  "/": "Home",
  "/products": "Products",
  "/categories": "Categories",
  "/cart": "Shopping Cart",
  "/checkout": "Checkout",
  // ... more mappings
}
```

## Component Integration Examples

### Example 1: Update ModernLayout Footer

```tsx
import {
  FOOTER_SHOP_LINKS,
  FOOTER_HELP_LINKS,
  FOOTER_ABOUT_LINKS,
  FOOTER_BOTTOM_LINKS,
} from "@/constants/navigation";

export default function ModernLayout() {
  return (
    <footer>
      {/* Shop Section */}
      <div>
        <h3>Shop</h3>
        {FOOTER_SHOP_LINKS.map((item) => (
          <Link key={item.name} href={item.href}>
            {item.name}
          </Link>
        ))}
      </div>

      {/* Help Section */}
      <div>
        <h3>Help</h3>
        {FOOTER_HELP_LINKS.map((item) => (
          <Link key={item.name} href={item.href}>
            {item.name}
          </Link>
        ))}
      </div>

      {/* About Section */}
      <div>
        <h3>About</h3>
        {FOOTER_ABOUT_LINKS.map((item) => (
          <Link key={item.name} href={item.href}>
            {item.name}
          </Link>
        ))}
      </div>

      {/* Bottom Bar */}
      <div>
        {FOOTER_BOTTOM_LINKS.map((item) => (
          <Link key={item.name} href={item.href}>
            {item.name}
          </Link>
        ))}
      </div>
    </footer>
  );
}
```

### Example 2: Update Admin Sidebar

```tsx
import { ADMIN_SIDEBAR_ITEMS } from "@/constants/navigation";

export default function AdminSidebar() {
  return (
    <aside>
      {ADMIN_SIDEBAR_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={isActive(item.href) ? "active" : ""}
        >
          {item.label}
          {item.badge && <Badge />}
        </Link>
      ))}
    </aside>
  );
}
```

### Example 3: Bottom Navigation with Role

```tsx
import {
  BOTTOM_NAV_GUEST,
  BOTTOM_NAV_USER,
  BOTTOM_NAV_ADMIN,
  BOTTOM_NAV_SELLER,
} from "@/constants/navigation";

export default function BottomNav({ user }) {
  const getItems = () => {
    if (!user) return BOTTOM_NAV_GUEST;
    if (user.role === "admin") return BOTTOM_NAV_ADMIN;
    if (user.role === "seller") return BOTTOM_NAV_SELLER;
    return BOTTOM_NAV_USER;
  };

  const items = getItems();

  return (
    <nav>
      {items.map((item) => (
        <Link key={item.id} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

## Benefits

1. **Single Source of Truth**: All navigation links defined in one place
2. **Type Safety**: TypeScript types ensure correct usage
3. **Easy Updates**: Change a route once, updates everywhere
4. **Consistency**: Same links across all components
5. **Maintainability**: Easy to add/remove/modify navigation items
6. **Documentation**: Clear structure and purpose for each navigation group

## Best Practices

1. **Always import from constants** instead of hardcoding URLs
2. **Use the appropriate constant** for your component type
3. **Keep navigation.ts focused** on navigation items only
4. **Use routes.ts for base URLs**, navigation.ts for menu items
5. **Document new navigation groups** when adding them
6. **Update this README** when adding new constants

## Adding New Navigation Items

1. **Define the route** in `routes.ts` (if it doesn't exist)
2. **Add to appropriate navigation constant** in `navigation.ts`
3. **Export in** `index.ts` if needed
4. **Update components** to use the new constant
5. **Update this documentation**

## Migration Guide

When updating existing components:

1. Import the appropriate navigation constant
2. Replace hardcoded href values with constants
3. Map over the array instead of hardcoding items
4. Test that all links work correctly
5. Remove any duplicate route definitions

## Related Files

- `/src/constants/routes.ts` - Base route definitions
- `/src/constants/navigation.ts` - Navigation menu items
- `/src/constants/app.ts` - Application constants
- `/src/utils/navigation.ts` - Navigation utility functions
- `/middleware.ts` - Route protection and redirects

## Future Improvements

- [ ] Add icons to navigation items
- [ ] Add permission checks to navigation items
- [ ] Add dynamic badge counts
- [ ] Add nested navigation support
- [ ] Add navigation item visibility rules
- [ ] Add i18n support for labels
