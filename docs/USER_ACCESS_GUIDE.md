# How to Give Admin and Seller Access to User Features

## 🎯 **Quick Answer**

To allow admins and sellers to access user features, simply wrap the user components/pages with:

```tsx
<RoleGuard requiredRole="user">{/* Your user feature content */}</RoleGuard>
```

This automatically allows:

- ✅ **Admin** (level 3) → Can access
- ✅ **Seller** (level 2) → Can access
- ✅ **User** (level 1) → Can access

## 📋 **How the Hierarchy Works**

The system uses numerical levels where higher numbers can access lower level features:

```typescript
// Role hierarchy levels
const roleHierarchy = {
  admin: 3, // Highest level
  seller: 2, // Middle level
  user: 1, // Base level
};

// Access check: userLevel >= requiredLevel
hasRoleAccess(userRole, requiredRole);
```

### **Examples:**

- Admin (3) accessing User features (1): ✅ `3 >= 1` = **Allowed**
- Seller (2) accessing User features (1): ✅ `2 >= 1` = **Allowed**
- User (1) accessing Seller features (2): ❌ `1 >= 2` = **Denied**

## 🔧 **Implementation Examples**

### 1. **User Account Page** (All roles can access)

```tsx
import RoleGuard from "@/components/auth/RoleGuard";

export default function AccountPage() {
  return (
    <RoleGuard requiredRole="user">
      <div>
        <h1>My Account</h1>
        {/* Account management features */}
      </div>
    </RoleGuard>
  );
}
```

### 2. **Order History** (All roles can access)

```tsx
export default function OrdersPage() {
  return (
    <RoleGuard requiredRole="user">
      <div>
        <h1>My Orders</h1>
        {/* Order history and tracking */}
      </div>
    </RoleGuard>
  );
}
```

### 3. **Wishlist** (All roles can access)

```tsx
export default function WishlistPage() {
  return (
    <RoleGuard requiredRole="user">
      <div>
        <h1>My Wishlist</h1>
        {/* Saved items */}
      </div>
    </RoleGuard>
  );
}
```

### 4. **Role-Specific Content Within User Pages**

```tsx
import { useState, useEffect } from "react";
import { hasRoleAccess } from "@/lib/auth/roles";

export default function UserDashboard() {
  const [user, setUser] = useState(null);

  return (
    <RoleGuard requiredRole="user">
      <div>
        <h1>User Dashboard</h1>

        {/* Content for all user types */}
        <div>
          <h2>My Orders</h2>
          <h2>My Account</h2>
        </div>

        {/* Additional content for sellers and admins */}
        {user && hasRoleAccess(user.role, "seller") && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3>Seller Quick Actions</h3>
            <Link href="/seller/dashboard">Go to Seller Dashboard</Link>
          </div>
        )}

        {/* Admin-only content */}
        {user && hasRoleAccess(user.role, "admin") && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h3>Admin Quick Actions</h3>
            <Link href="/admin/dashboard">Go to Admin Dashboard</Link>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
```

## 📝 **Navigation Button Behavior**

### **Current Header Implementation**

The header shows role-based buttons beside the user profile:

**🔴 Admin Users → See BOTH buttons:**

```
[🛡️ Admin] [📄 Seller] [👤 User Menu]
```

**🔵 Seller Users → See ONLY Seller button:**

```
[📄 Seller] [👤 User Menu]
```

**⚪ Regular Users → See NO role buttons:**

```
[👤 User Menu]
```

### **Implementation Code**

```tsx
import { hasRoleAccess } from "@/lib/auth/roles";

export default function Header({ user }) {
  return (
    <nav>
      {/* Always show user features to all authenticated users */}
      {user && (
        <div className="user-menu">
          <Link href="/account">My Account</Link>
          <Link href="/orders">My Orders</Link>
          <Link href="/wishlist">Wishlist</Link>
        </div>
      )}

      {/* Role-based navigation buttons */}
      {user && (user.role === "admin" || user.role === "seller") && (
        <div className="role-buttons">
          {/* Admin button - admin users only */}
          {user.role === "admin" && (
            <Link href="/admin/dashboard">🛡️ Admin</Link>
          )}

          {/* Seller button - both admin and seller users */}
          {(user.role === "admin" || user.role === "seller") && (
            <Link href="/seller/dashboard">📄 Seller</Link>
          )}
        </div>
      )}
    </nav>
  );
}
```

### **Why Admin Users See Both Buttons**

This follows the **hierarchical access principle**:

- Admin (Level 3) can access Admin features + Seller features + User features
- Admin users need quick access to both admin management AND seller/commerce functions
- No need to switch accounts to manage different aspects of the platform

## 🎨 **User Feature Categories**

### **Standard User Features** (All roles can access with `requiredRole="user"`):

1. **Account Management**

   - Profile settings
   - Password change
   - Email preferences

2. **Shopping Features**

   - Order history
   - Order tracking
   - Wishlist/Favorites
   - Cart management

3. **Address & Payment**

   - Shipping addresses
   - Payment methods
   - Billing history

4. **Communication**

   - Support tickets
   - Reviews and ratings
   - Notifications

5. **Social Features**
   - User reviews
   - Product ratings
   - Community features

## 🚀 **File Examples in Your Project**

### **Updated Files:**

1. **`/src/app/account/page.tsx`** - Now uses `RoleGuard` with `requiredRole="user"`
2. **`/src/app/user-features/page.tsx`** - Demo page showing all user features accessible to admin/seller/user

### **Test the Implementation:**

Visit these URLs to test role-based access:

- **User Features Demo**: `/user-features`
- **Account Page**: `/account`
- **Role Testing**: `/test-roles`

## ✅ **Current Status**

Your application already has this hierarchy implemented:

- **Admin** → Can access `/admin/dashboard` + `/seller/dashboard` + all user features
- **Seller** → Can access `/seller/dashboard` + all user features
- **User** → Can access user features only

The key is using `<RoleGuard requiredRole="user">` for any feature you want all authenticated users to access, regardless of their role level.

## 📊 **Quick Reference**

| Role   | Level | Can Access                                         | Navigation Buttons           |
| ------ | ----- | -------------------------------------------------- | ---------------------------- |
| Admin  | 3     | Admin Dashboard + Seller Dashboard + User Features | 🛡️ Admin + 📄 Seller buttons |
| Seller | 2     | Seller Dashboard + User Features                   | 📄 Seller button only        |
| User   | 1     | User Features Only                                 | No role-based buttons        |

**Key Points:**

- ✅ Higher level roles automatically get access to lower level features
- 🔴 **Admin users see BOTH Admin + Seller buttons** (hierarchical access)
- 🔵 **Seller users see ONLY Seller button**
- ⚪ **Regular users see NO role-based buttons**

📋 **See [`NAVIGATION_SYSTEM.md`](./NAVIGATION_SYSTEM.md) for detailed navigation behavior**
