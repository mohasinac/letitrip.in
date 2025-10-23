# 🧭 Navigation System & Role-Based Buttons

## Overview

The application header features role-based navigation buttons that appear beside the user profile based on the user's role and hierarchical access permissions.

## 📍 Button Visibility Logic

### 🔴 **Admin Users**

**Sees: BOTH Admin + Seller buttons**

```
[🛡️ Admin] [📄 Seller] [👤 User Menu]
```

**Why?** Admin users have hierarchical access to all lower-level features:

- ✅ Can access Admin Dashboard (`/admin/dashboard`)
- ✅ Can access Seller Dashboard (`/seller/dashboard`) - **hierarchical access**
- ✅ Can access all User features (`/account`, `/orders`, etc.)

### 🔵 **Seller Users**

**Sees: ONLY Seller button**

```
[📄 Seller] [👤 User Menu]
```

**Why?** Seller users have access to their level and below:

- ❌ Cannot access Admin Dashboard (insufficient permissions)
- ✅ Can access Seller Dashboard (`/seller/dashboard`)
- ✅ Can access all User features (`/account`, `/orders`, etc.)

### ⚪ **Regular Users**

**Sees: NO role-based buttons**

```
[👤 User Menu]
```

**Why?** Regular users only have access to standard user features:

- ❌ Cannot access Admin Dashboard
- ❌ Cannot access Seller Dashboard
- ✅ Can access User features (`/account`, `/orders`, etc.)

## 🏗️ Implementation Details

### Desktop Navigation

Located in `src/components/layout/Header.tsx`:

```tsx
{
  /* Admin/Seller Navigation Buttons */
}
{
  user && (user.role === "admin" || user.role === "seller") && (
    <div className="hidden md:flex items-center space-x-2">
      {/* Admin button - shows for admin users only */}
      {user.role === "admin" && (
        <Link href="/admin/dashboard" className="btn-admin">
          🛡️ Admin
        </Link>
      )}

      {/* Seller button - shows for both admin and seller users */}
      {(user.role === "admin" || user.role === "seller") && (
        <Link href="/seller/dashboard" className="btn-seller">
          📄 Seller
        </Link>
      )}
    </div>
  );
}
```

### Mobile Navigation

Both buttons also appear in the mobile hamburger menu with the same logic.

## 🎨 Visual Design

### Admin Button

- **Background**: `bg-red-50` (light red)
- **Text**: `text-red-700` (dark red)
- **Icon**: Shield icon (🛡️)
- **Hover**: `hover:bg-red-100`

### Seller Button

- **Background**: `bg-blue-50` (light blue)
- **Text**: `text-blue-700` (dark blue)
- **Icon**: Document icon (📄)
- **Hover**: `hover:bg-blue-100`

## 📱 Responsive Behavior

### Desktop (≥768px)

- Buttons appear beside user profile in header
- Horizontally aligned with `space-x-2`

### Mobile (<768px)

- Buttons appear in hamburger menu
- Vertically stacked with `space-y-2`
- Full-width display

## 🔐 Access Control Integration

The navigation buttons work with the role-based access control system:

### Role Hierarchy

```typescript
const roleHierarchy = {
  admin: 3, // Highest level
  seller: 2, // Middle level
  user: 1, // Base level
};
```

### Dashboard Access

- **Admin Dashboard**: Requires `role === "admin"` (Level 3 only)
- **Seller Dashboard**: Requires `role >= "seller"` (Level 2+, so admin + seller)
- **User Features**: Requires `role >= "user"` (Level 1+, so all roles)

## 🧪 Testing the Navigation

### Test URLs

- **Test Role Navigation**: `/test-navigation`
- **Admin Dashboard**: `/admin/dashboard`
- **Seller Dashboard**: `/seller/dashboard`

### Test Users

You can test with different role accounts to see how navigation changes:

1. **Create Admin User** → See both Admin + Seller buttons
2. **Create Seller User** → See only Seller button
3. **Create Regular User** → See no role buttons

## 📋 Key Features

### ✅ Implemented Features

- [x] Role-based button visibility
- [x] Hierarchical access for admins
- [x] Responsive mobile/desktop layouts
- [x] Distinct visual styling per role
- [x] Tooltip descriptions
- [x] Smooth hover transitions
- [x] Integration with auth system

### 🔄 Dynamic Updates

- Navigation buttons update immediately when user role changes
- Consistent with `RoleGuard` component protection
- Real-time reflection of authentication state

## 🎯 User Experience

### For Admin Users

**"I can manage both admin functions AND seller functions"**

- Quick access to admin dashboard for platform management
- Quick access to seller dashboard for commerce functions
- No need to switch accounts or contexts

### For Seller Users

**"I can manage my store and products"**

- Direct access to seller dashboard
- Clean, focused navigation without admin clutter
- Access to user features for personal account management

### For Regular Users

**"I can manage my account and orders"**

- Clean navigation focused on shopping experience
- No admin/seller buttons cluttering the interface
- Access to account, orders, and user features

## 🔗 Related Documentation

- [`RBAC_IMPLEMENTATION.md`](./RBAC_IMPLEMENTATION.md) - Role-based access control system
- [`USER_ACCESS_GUIDE.md`](./USER_ACCESS_GUIDE.md) - How roles access different features
- [`ROLE_REGISTRATION_GUIDE.md`](./ROLE_REGISTRATION_GUIDE.md) - How to create users with different roles

## 🚀 Summary

**Admin users see BOTH buttons** because they have hierarchical access to all lower-level dashboards, while seller and user roles see only the buttons appropriate to their access level. This creates an intuitive, role-appropriate navigation experience that reflects the underlying permission system.
