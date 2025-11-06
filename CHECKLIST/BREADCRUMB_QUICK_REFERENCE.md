# 🍞 Breadcrumb Component - Quick Reference

## 📍 **Location**

```
src/components/layout/Breadcrumb.tsx
```

## 🎯 **How to Add Custom Labels**

Edit the `ROUTE_LABELS` object in `Breadcrumb.tsx`:

```typescript
const ROUTE_LABELS: Record<string, string> = {
  // Your custom routes
  "/products": "All Products",
  "/products/beyblades": "Beyblades",
  "/products/anime-figures": "Anime Figures",
  "/checkout": "Checkout",
  "/order-confirmation": "Order Confirmation",
  "/user/profile": "My Profile",
  "/user/addresses": "Saved Addresses",
  "/user/payments": "Payment Methods",
};
```

## 🎨 **Visual Examples**

### User Pages:

```
Home > User > My Orders
Home > User > Favorites
Home > User > Settings
```

### Admin Pages:

```
Home > Admin Dashboard > Manage Users
Home > Admin Dashboard > Manage Products
```

### Shopping Pages:

```
Home > Shopping Cart
Home > Categories
Home > Coupons
```

### Support Pages:

```
Home > Support > Support Ticket
```

## 🔧 **Customization Examples**

### Change Separator:

```tsx
// Current: >
<ChevronRight className="w-4 h-4 text-gray-400 mx-2" />

// Change to: /
<Slash className="w-4 h-4 text-gray-400 mx-2" />

// Change to: →
<ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
```

### Change Hover Color:

```tsx
// Current: Yellow
className = "text-gray-600 hover:text-yellow-600";

// Change to: Blue
className = "text-gray-600 hover:text-blue-600";

// Change to: Green
className = "text-gray-600 hover:text-green-600";
```

### Add Icons to Routes:

```tsx
import { ShoppingCart, Package, Heart } from "lucide-react";

const ROUTE_ICONS: Record<string, ReactNode> = {
  "/cart": <ShoppingCart className="w-4 h-4" />,
  "/user/orders": <Package className="w-4 h-4" />,
  "/user/favorites": <Heart className="w-4 h-4" />,
};

// In render:
<Link href={item.href}>
  {ROUTE_ICONS[item.href]}
  <span>{item.label}</span>
</Link>;
```

### Hide on Specific Pages:

```tsx
const HIDE_BREADCRUMB_ON = ["/", "/login", "/register"];

if (HIDE_BREADCRUMB_ON.includes(pathname)) {
  return null;
}
```

## 📱 **Responsive Design**

The breadcrumb automatically adjusts to screen size:

- **Desktop**: Full trail with all items
- **Mobile**: Compact view, text wraps if needed
- **All Devices**: Icons help with quick recognition

## ♿ **Accessibility**

The breadcrumb is fully accessible:

- Semantic HTML structure
- ARIA labels
- Keyboard navigable
- Screen reader friendly

## 🚀 **Quick Tips**

1. **Add New Route**: Just add to `ROUTE_LABELS`
2. **Change Style**: Edit Tailwind classes in component
3. **Hide on Page**: Add to conditional check
4. **Test It**: Visit any page and check the breadcrumb trail

## 📝 **Common Patterns**

### Multi-level Routes:

```typescript
"/admin/products/edit": "Edit Product",
"/user/orders/123": "Order Details",
"/categories/toys/beyblades": "Beyblades",
```

### Dynamic Routes:

For routes with IDs like `/products/[id]`, the component will show the ID.
To show product name instead, fetch data and update label dynamically.

## 🎉 **That's It!**

The breadcrumb is now live on all pages. No additional setup needed per page!
